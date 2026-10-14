/**
 * Audio engine — everything is synthesised with the Web Audio API (no files to download).
 *
 * Rules:
 *  - Off by default. The AudioContext is only created inside a user gesture (the toggle).
 *  - Chapters ask for a "mood" (an ambient pad) and fire one-shot cues; when sound is off,
 *    those calls are cheap no-ops.
 *  - Everything passes through one master gain and a generated room reverb.
 */

export type Mood = 'night' | 'stone' | null;
type Listener = (enabled: boolean) => void;

interface Pad {
  stop(): void;
}

// A low, open fifth on D — calm and unresolved, never melodic enough to distract.
const PAD_NOTES: Record<Exclude<Mood, null>, number[]> = {
  night: [73.42, 110.0, 146.83, 220.0],
  stone: [146.83, 220.0, 293.66, 440.0],
};

class AudioEngine {
  enabled = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private pad: Pad | null = null;
  private mood: Mood = null;
  private listeners = new Set<Listener>();

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.enabled);
    return () => this.listeners.delete(fn);
  }

  /** Must be called from a user gesture (click / keypress). */
  async setEnabled(on: boolean): Promise<void> {
    this.enabled = on;
    this.listeners.forEach((fn) => fn(on));

    if (on) {
      const ctx = this.ensureContext();
      await ctx.resume();
      this.rampMaster(0.9, 1.2);
      this.applyMood();
    } else if (this.ctx && this.master) {
      this.rampMaster(0, 0.6);
      const ctx = this.ctx;
      window.setTimeout(() => {
        if (!this.enabled) {
          this.stopPad();
          void ctx.suspend();
        }
      }, 700);
    }
  }

  toggle(): Promise<void> {
    return this.setEnabled(!this.enabled);
  }

  /** Sets the ambient bed for the current chapter. Crossfades if sound is on. */
  setMood(mood: Mood): void {
    if (mood === this.mood) return;
    this.mood = mood;
    if (this.enabled) this.applyMood();
  }

  /** A soft, resonant bell-like tone (used for "begin", and later for the lock-in). */
  chime(freq = 392, level = 0.16): void {
    const ctx = this.readyContext();
    if (!ctx || !this.master || !this.reverb) return;
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(level, t + 0.02);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
    out.connect(this.master);
    out.connect(this.reverb);

    // Fundamental plus two slightly inharmonic partials gives a gentle bowl-like timbre.
    [1, 2.01, 3.98].forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio;
      g.gain.value = [1, 0.35, 0.12][i];
      osc.connect(g).connect(out);
      osc.start(t);
      osc.stop(t + 4.6);
    });
  }

  /** Quiet paper-and-pen texture while line art is being drawn. Returns a stop function. */
  ink(duration: number): () => void {
    const ctx = this.readyContext();
    if (!ctx || !this.master) return () => {};
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx, 2);
    src.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 3200;
    band.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.018, t + 0.3);
    g.gain.setValueAtTime(0.018, t + Math.max(0.3, duration - 0.5));
    g.gain.linearRampToValueAtTime(0, t + duration);
    src.connect(band).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + duration + 0.05);
    return () => {
      const now = ctx.currentTime;
      g.gain.cancelScheduledValues(now);
      g.gain.setTargetAtTime(0, now, 0.08);
      src.stop(now + 0.4);
    };
  }

  /* --- internals ---------------------------------------------------- */

  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(ctx, 3.2, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    reverb.connect(wet).connect(master);

    this.ctx = ctx;
    this.master = master;
    this.reverb = reverb;
    return ctx;
  }

  private readyContext(): AudioContext | null {
    return this.enabled && this.ctx && this.ctx.state === 'running' ? this.ctx : null;
  }

  private rampMaster(value: number, seconds: number): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(value, t + seconds);
  }

  private applyMood(): void {
    this.stopPad();
    if (this.mood && this.ctx) this.pad = this.createPad(this.ctx, PAD_NOTES[this.mood]);
  }

  private stopPad(): void {
    this.pad?.stop();
    this.pad = null;
  }

  private createPad(ctx: AudioContext, notes: number[]): Pad {
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(0.05, t + 4);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    filter.Q.value = 0.4;

    // Very slow filter movement keeps the drone alive without drawing attention.
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start(t);

    const oscs = notes.flatMap((freq, i) =>
      [-4, 4].map((cents) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.value = freq;
        osc.detune.value = cents;
        g.gain.value = 1 / (i + 1.5);
        osc.connect(g).connect(filter);
        osc.start(t);
        return osc;
      }),
    );

    filter.connect(out);
    out.connect(this.master!);
    out.connect(this.reverb!);

    return {
      stop: () => {
        const now = ctx.currentTime;
        out.gain.cancelScheduledValues(now);
        out.gain.setValueAtTime(out.gain.value, now);
        out.gain.linearRampToValueAtTime(0, now + 2.5);
        [...oscs, lfo].forEach((o) => o.stop(now + 2.6));
      },
    };
  }

  private noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  /** Generated stereo impulse response: decaying noise ≈ a large stone room. */
  private impulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  }
}

export const audio = new AudioEngine();
