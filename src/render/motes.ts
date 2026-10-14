/**
 * Dust motes drifting through the opening's beam of light.
 * Canvas is used only here because dozens of independently moving points would be
 * wasteful as DOM nodes. The loop only runs while the opening chapter is active.
 */
interface Mote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
}

export interface Motes {
  start(): void;
  stop(): void;
}

export function createMotes(canvas: HTMLCanvasElement, count = 70): Motes {
  const ctx = canvas.getContext('2d');
  let motes: Mote[] = [];
  let raf = 0;
  let w = 0;
  let h = 0;
  let last = 0;

  const resize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // Motes are seeded along the beam's diagonal so they read as "caught in the light".
  const seed = (): Mote => {
    const t = Math.random();
    const spread = (Math.random() - 0.5) * 0.28 * w * (0.3 + t);
    return {
      x: w * 0.47 + t * w * 0.42 + spread,
      y: h * 0.06 + t * h * 0.9,
      r: 0.4 + Math.random() * 1.3,
      vx: (Math.random() - 0.5) * 4,
      vy: -2 - Math.random() * 5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
    };
  };

  const frame = (now: number): void => {
    if (!ctx) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, w, h);
    for (const m of motes) {
      m.phase += dt * m.speed;
      m.x += (m.vx + Math.sin(m.phase) * 3) * dt;
      m.y += m.vy * dt;
      if (m.y < -10) Object.assign(m, seed(), { y: h + 10 });
      const alpha = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(m.phase * 1.7));
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 205, 140, ${alpha.toFixed(3)})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  };

  const onResize = (): void => {
    resize();
    motes = Array.from({ length: count }, seed);
  };

  return {
    start() {
      if (!ctx || raf) return;
      onResize();
      window.addEventListener('resize', onResize);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener('resize', onResize);
    },
  };
}
