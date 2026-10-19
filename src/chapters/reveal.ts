/**
 * Scene 5 — Look up. The payoff.
 * The eight-pier plan is drawn tilted, like the earlier drawings, then the camera swings until
 * we look straight up from the centre of the floor. A beat of stillness, and the real dome
 * opens from the centre outwards inside an octagonal frame — the plan's own octagon of piers,
 * centred on the dome itself.
 *
 * Then one short guided look, played once and never hidden behind a toggle:
 *   Structure (the eight piers) → Light (the ring of windows) → Space (one dome over the room).
 * The three lines stay on screen afterwards; each is a button that shows its highlight again.
 *
 * Alignment of drawing and frame comes from `revealAlignment` in content.ts.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy, revealAlignment as align, revealAnnotations } from '../content';
import { createAnnotator, type Annotator } from '../core/annotate';
import { announce } from '../core/announcer';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h, s } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { button, conceal, enterText, label, reveal, title as makeTitle } from '../core/ui';
import { stroke } from '../render/svg';

const SIZES = 'min(100vw, 100dvh)';
/**
 * The frame is an octagon whose corners sit on the eight piers — the plan becomes the window.
 * Its corners reach this far from the dome's centre (in % of the photo's width). The photo
 * extends only 46 % below the dome, and an octagon's flat bottom edge sits at cos(22.5°) of
 * that, so the frame can reach the piers without ever showing past the photo's edge.
 */
const FRAME_RADIUS = 49.2;
/** Seconds each highlight stays on the photograph. */
const CYCLE = 3;

/** Octagon with corners at 22.5° + k·45°, as a clip-path; scale 0 collapses it to the centre. */
const octagon = (scale: number): string =>
  `polygon(${Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI / 8 + (i * Math.PI) / 4;
    const x = 50 + 50 * scale * Math.cos(a);
    const y = 50 + 50 * scale * Math.sin(a);
    return `${x.toFixed(3)}% ${y.toFixed(3)}%`;
  }).join(', ')})`;
const OPEN = octagon(1);
const CLOSED = octagon(0);

export function createReveal(ctx: ChapterContext): Chapter {
  const t = copy.reveal;

  const top = label(t.label);
  const prompt = h('p', { class: 'text reveal__prompt' }, t.prompt);
  const title = makeTitle('h2', 'reveal-title', t.headline);

  // The guided look: three lines, each also a way back to its highlight.
  const items = revealAnnotations.map((a, i) =>
    h(
      'li',
      { class: 'is-waiting' },
      h(
        'button',
        { type: 'button', class: 'guide__item', 'data-i': i },
        h('span', { class: 'guide__term' }, a.label),
        h('span', { class: 'guide__text' }, a.text),
      ),
    ),
  );
  const guide = h('ol', { class: 'guide' }, ...items);
  const buttons = items.map((li) => li.firstElementChild as HTMLButtonElement);
  const cont = button(t.cta, 'primary', '→');
  const actions = h('div', { class: 'actions is-waiting' }, cont);

  const frame = h('div', { class: 'reveal__frame' });
  frame.style.setProperty('--k', String(50 / FRAME_RADIUS));
  frame.style.setProperty('--cx', `${align.centreX}%`);
  frame.style.setProperty('--cy', `${align.centreY}%`);
  const drawing = buildDrawing();
  const stage = h(
    'div',
    { class: 'reveal__stage' },
    h('p', { class: 'sr-only' }, t.figureLabel),
    frame,
    drawing.svg,
  );

  const el = h(
    'section',
    { class: 'chapter reveal', 'data-theme': 'night', 'aria-labelledby': 'reveal-title' },
    h(
      'div',
      { class: 'grid reveal__grid' },
      h('div', { class: 'col reveal__text' }, top, prompt, title.el, guide, actions),
      h('figure', { class: 'reveal__figure' }, stage),
    ),
  );

  let photo: HTMLPictureElement | null = null;
  let annot: Annotator | null = null;
  let tl: gsap.core.Timeline | null = null;
  let played = false;

  const ensureAnnot = (): Annotator =>
    (annot ??= createAnnotator(
      frame,
      { width: 2550, height: 2550 },
      { labels: false, dim: 0.62, calibrate: revealAnnotations },
    ));

  function highlight(i: number | null): void {
    buttons.forEach((b, j) => b.toggleAttribute('aria-current', j === i));
    guide.classList.toggle('is-guiding', i !== null);
    ensureAnnot().show(i === null ? null : revealAnnotations[i]);
  }

  /**
   * Two separate schedules:
   *  - `content`: the three lines and "Look around". Nothing the visitor does can cancel it.
   *  - `cycle`: the highlights walking over the photograph. Optional; any hover, focus or click
   *    on a line stops it (and then simply shows everything at once).
   * Earlier one schedule did both, so hovering the first line also cancelled the other two lines
   * and the button: the visitor was left with no way on (reproduced in Chrome, user test 1).
   */
  let cycle: gsap.core.Tween[] = [];
  let content: gsap.core.Tween[] = [];
  let watchdog = 0;

  function stopCycle(): void {
    cycle.forEach((c) => c.kill());
    cycle = [];
  }

  function stopSequence(): void {
    stopCycle();
    content.forEach((c) => c.kill());
    content = [];
    window.clearTimeout(watchdog);
  }

  /** Everything readable at once (revisits, interaction, leaving mid-sequence, the safety net). */
  function showAll(): void {
    content.forEach((c) => c.kill());
    content = [];
    window.clearTimeout(watchdog);
    [...items, actions].forEach((n) => {
      if (!n.classList.contains('is-waiting')) return;
      n.classList.remove('is-waiting');
      gsap.set(n, { clearProps: 'opacity,transform' });
    });
  }

  /**
   * The first line appears as soon as the photograph has opened, the other two 1.5 s apart, and
   * "Look around" 1 s after the third. The highlights walk more slowly (3 s each) and finish on
   * the clean photograph.
   */
  function runGuide(): void {
    stopSequence();
    if (reducedMotion()) {
      showAll();
      return;
    }
    revealAnnotations.forEach((a, i) => {
      content.push(gsap.delayedCall(i * 1.5, () => reveal(items[i])));
      cycle.push(
        gsap.delayedCall(i * CYCLE, () => {
          highlight(i);
          announce(`${a.label}. ${a.text}`);
        }),
      );
    });
    content.push(gsap.delayedCall(2 * 1.5 + 1, () => reveal(actions)));
    cycle.push(gsap.delayedCall(revealAnnotations.length * CYCLE, () => highlight(null)));
  }

  /** A safety net that does not depend on GSAP: whatever happens, the scene can be left. */
  function armWatchdog(ms: number): void {
    window.clearTimeout(watchdog);
    watchdog = window.setTimeout(() => {
      // Restore the whole finished scene (photo open, title, lines, button), not just the text.
      if (actions.classList.contains('is-waiting')) finalState();
    }, ms);
  }

  buttons.forEach((b, i) => {
    const on = () => {
      // The visitor has taken over: stop the walk, keep everything readable.
      stopCycle();
      showAll();
      highlight(i);
    };
    b.addEventListener('click', on);
    b.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') on();
    });
    b.addEventListener('focus', on);
    b.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && document.activeElement !== b) highlight(null);
    });
    b.addEventListener('blur', () => highlight(null));
  });
  cont.addEventListener('click', () => ctx.next());

  function finalState(): void {
    tl?.kill();
    stopSequence();
    gsap.set(drawing.svg, { clearProps: 'transform', opacity: 0 });
    gsap.set(frame, { clipPath: OPEN, opacity: 1 });
    gsap.set(title.el, { opacity: 1 });
    showAll();
    highlight(null);
  }

  /** Resolves when the photograph can be painted (or after 2.5 s, so the story never stalls). */
  function photoReady(): Promise<void> {
    const img = photo?.querySelector('img');
    if (!img) return Promise.resolve();
    const ready = img.complete
      ? img.decode().catch(() => {})
      : new Promise<void>((r) => img.addEventListener('load', () => r(), { once: true }));
    return Promise.race([ready, new Promise<void>((r) => setTimeout(r, 2500))]);
  }

  function play(): void {
    const reduced = reducedMotion();
    gsap.set(title.el, { opacity: 0 });
    [...items, actions].forEach(conceal);
    gsap.set(drawing.strokes, { strokeDasharray: 1, strokeDashoffset: reduced ? 0 : 1 });

    if (reduced) {
      gsap.set(drawing.svg, { clearProps: 'transform', opacity: 1 });
      gsap.set(frame, { clipPath: OPEN, opacity: 0 });
      tl = gsap
        .timeline({ onComplete: runGuide })
        .to(frame, { opacity: 1, duration: 0.8 }, 0.6)
        .to(drawing.svg, { opacity: 0, duration: 0.8 }, 1.2)
        .to(title.el, { opacity: 1, duration: 0.5 }, 1.2);
      return;
    }

    gsap.set(frame, { clipPath: CLOSED, opacity: 1 });
    gsap.set(drawing.svg, {
      opacity: 1,
      transformPerspective: 1400,
      rotationX: 62,
      rotationZ: -45,
      scale: 0.72,
      transformOrigin: '50% 50%',
    });
    tl = gsap
      .timeline()
      // The plan is drawn, tilted as in the earlier drawings…
      .to(
        drawing.strokes,
        { strokeDashoffset: 0, duration: 1.4, stagger: 0.01, ease: EASE.inOut },
        0.1,
      )
      // …then the camera swings to look straight up.
      .to(
        drawing.svg,
        { rotationX: 0, rotationZ: 0, scale: 1, duration: 2.6, ease: EASE.inOut },
        1.3,
      )
      // Hold here until the photograph is ready, so it never opens onto an empty frame.
      .call(
        () => {
          const t0 = tl!;
          t0.pause();
          void photoReady().then(() => t0.resume());
        },
        [],
        4.15,
      )
      // A beat of stillness. Then the photograph opens from the centre, out to the piers.
      .call(() => audio.chime(196, 0.1), [], 4.2)
      .to(frame, { clipPath: OPEN, duration: 2.8, ease: 'power2.inOut' }, 4.2)
      .to(drawing.svg, { opacity: 0.35, duration: 1.4, ease: EASE.soft }, 4.8)
      .to(drawing.svg, { opacity: 0, duration: 1.6, ease: EASE.soft }, 6.4)
      .to(title.el, { opacity: 1, duration: 0.8, ease: EASE.out }, 6.2)
      // The first takeaway as soon as the photograph is fully open.
      .call(runGuide, [], 7);
  }

  return {
    id: 'reveal',
    theme: 'night',
    el,
    prepare() {
      if (photo) return;
      photo = picture('domeFromBelow', { sizes: SIZES, eager: true, className: 'reveal__photo' });
      photo.querySelector('img')?.setAttribute('fetchpriority', 'high');
      frame.append(photo);
    },
    enter() {
      audio.setMood('night');
      enterText([top, prompt]);
      if (!played) {
        played = true;
        play();
        // Drawing (≈4 s) + waiting for the photo (≤2.5 s) + opening (≈3 s): 12 s is past all of it.
        armWatchdog(reducedMotion() ? 4000 : 12000);
      } else {
        finalState();
      }
    },
    leave() {
      stopSequence();
      highlight(null);
      // Coming back always finds the finished scene: photo open, all lines, the button.
      if (actions.classList.contains('is-waiting') || (tl && tl.progress() < 1)) finalState();
    },
    reset() {
      played = false;
      tl?.kill();
      stopSequence();
      annot?.show(null);
      [...items, actions].forEach(conceal);
    },
    focusTarget: () => title.el,
  };
}

/* ------------------------------------------------------------------------ */

/**
 * The eight-pier plan seen from directly below, in frame units (0–1000, dome at the centre).
 * Its scale matches the photo inside the frame, so plan and dome line up exactly.
 */
function buildDrawing(): { svg: SVGSVGElement; strokes: SVGPathElement[] } {
  const C = 500;
  const k = 50 / FRAME_RADIUS; // photo widths per frame width
  const r = align.domeRadius * k * 10;
  const svg = s('svg', {
    viewBox: '0 0 1000 1000',
    class: 'plan reveal__drawing',
    'aria-hidden': 'true',
  });
  const strokes: SVGPathElement[] = [];
  const circle = (rad: number): string =>
    `M${C - rad} ${C}a${rad} ${rad} 0 1 0 ${rad * 2} 0a${rad} ${rad} 0 1 0 ${-rad * 2} 0`;

  stroke(svg, circle(r), 's-reveal', strokes);
  stroke(svg, circle(r * 0.86), 's-reveal-fine', strokes);
  stroke(svg, circle(r * 0.5), 's-reveal-fine', strokes);
  stroke(svg, circle(r * 0.18), 's-reveal-fine', strokes);
  for (let i = 0; i < 32; i++) {
    const a = (i * Math.PI) / 16;
    const p0 = [C + r * 0.88 * Math.cos(a), C + r * 0.88 * Math.sin(a)];
    const p1 = [C + r * 0.97 * Math.cos(a), C + r * 0.97 * Math.sin(a)];
    stroke(svg, `M${p0[0]} ${p0[1]}L${p1[0]} ${p1[1]}`, 's-reveal-fine', strokes);
  }
  // The octagon of eight piers, where the arches meet.
  const rp = align.pierRadius * k * 10;
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI / 8 + (i * Math.PI) / 4;
    return [C + rp * Math.cos(a), C + rp * Math.sin(a)];
  });
  stroke(svg, `M${pts.map((p) => p.join(' ')).join('L')}Z`, 's-reveal', strokes);
  pts.forEach(([x, y], i) => {
    const a = ((Math.PI / 8 + (i * Math.PI) / 4) * 180) / Math.PI;
    const sq = 24;
    stroke(
      svg,
      `M${x - sq} ${y - sq}h${sq * 2}v${sq * 2}h${-sq * 2}Z`,
      's-reveal s-reveal-pier',
      strokes,
    ).setAttribute('transform', `rotate(${a} ${x} ${y})`);
  });
  return { svg, strokes };
}
