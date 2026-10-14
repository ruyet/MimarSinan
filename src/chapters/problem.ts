/**
 * Chapter I — The problem.
 * A square hall is sketched by hand in fine ink: construction lines first, then walls
 * (led by a pen nib), the dome's footprint, a dimension, and finally the dome itself,
 * which lifts and hovers above the floor.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { announce } from '../core/announcer';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { splitHeadline } from '../core/splitText';
import { buildFloorPlan, type FloorPlan } from '../render/floorPlan';

export function createProblem(ctx: ChapterContext): Chapter {
  const t = copy.problem;

  const title = h('h2', { id: 'problem-title', class: 'headline', tabindex: '-1' });
  const words = splitHeadline(title, t.headline);

  const eyebrow = h(
    'p',
    { class: 'eyebrow' },
    h('span', { class: 'eyebrow__num', 'aria-hidden': 'true' }, 'I'),
    t.eyebrow,
  );
  const body = h('p', { class: 'body' }, t.body);
  const goal = h('p', { class: 'body problem__goal' }, t.goal);

  const release = h(
    'button',
    { type: 'button', class: 'btn btn--primary' },
    t.cta,
    h('span', { class: 'btn__arrow', 'aria-hidden': 'true' }, '↓'),
  );
  const redraw = h('button', { type: 'button', class: 'btn btn--ghost' }, t.redraw);
  const note = h('p', { class: 'problem__note', hidden: true }, t.pocNote);
  const actions = h('div', { class: 'problem__actions' }, release, redraw, note);

  const plan = buildFloorPlan(t.annotations, 'problem-figure-desc');
  const desc = h('p', { id: 'problem-figure-desc', class: 'sr-only' }, t.figureLabel);
  const figure = h(
    'figure',
    { class: 'problem__figure' },
    desc,
    plan.svg,
    h('figcaption', {}, t.figcaption),
  );

  const el = h(
    'section',
    { class: 'chapter problem', 'data-theme': 'stone', 'aria-labelledby': 'problem-title' },
    h(
      'div',
      { class: 'problem__layout' },
      h('div', { class: 'problem__text' }, eyebrow, title, body, goal),
      figure,
      actions,
    ),
  );

  const drawing = createDrawing(plan);
  let hasPlayed = false;

  release.addEventListener('click', () => {
    // POC 1 stops here: chapter II isn't registered yet, so next() is a no-op
    // and the note explains why. Remove the note once POC 2 lands.
    ctx.next();
    note.hidden = false;
    announce(t.pocNote);
  });

  redraw.addEventListener('click', () => {
    drawing.play();
  });

  return {
    id: 'problem',
    theme: 'stone',
    el,
    enter() {
      audio.setMood('stone');
      introText(eyebrow, words, [body, goal, actions]);
      if (!hasPlayed) {
        hasPlayed = true;
        drawing.play();
      } else {
        drawing.resume();
      }
    },
    leave() {
      drawing.pause();
    },
    focusTarget: () => title,
  };
}

/* ------------------------------------------------------------------------ */

function introText(eyebrow: HTMLElement, words: HTMLElement[], rest: HTMLElement[]): void {
  if (reducedMotion()) {
    gsap.fromTo([eyebrow, ...words, ...rest], { opacity: 0 }, { opacity: 1, duration: 0.5 });
    return;
  }
  gsap
    .timeline()
    .fromTo(eyebrow, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1, ease: EASE.out }, 0)
    .fromTo(
      words,
      { yPercent: 105, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.3, ease: EASE.out, stagger: 0.08 },
      0.15,
    )
    .fromTo(
      rest,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 1.1, ease: EASE.out, stagger: 0.18 },
      0.8,
    );
}

interface Drawing {
  play(): void;
  pause(): void;
  resume(): void;
}

/**
 * The hand-drawn sequence plus the idle "hover" and pointer parallax.
 * With reduced motion, the finished drawing simply fades in and stays still.
 */
function createDrawing(plan: FloorPlan): Drawing {
  const {
    strokes,
    annotations,
    nib,
    outerWall,
    domeFloat,
    domeFill,
    domeLayer,
    planLayer,
    shadow,
  } = plan;
  const allStrokes = Object.values(strokes).flat();
  let tl: gsap.core.Timeline | null = null;
  let hover: gsap.core.Timeline | null = null;
  let stopInk: () => void = () => {};

  /* Idle hover: the dome breathes up and down; its floor shadow answers. */
  const startHover = (): void => {
    hover?.kill();
    hover = gsap
      .timeline({ repeat: -1, yoyo: true, defaults: { duration: 3.6, ease: EASE.soft } })
      .to(domeFloat, { y: -8 }, 0)
      .to(shadow, { scale: 0.94, opacity: 0.75, transformOrigin: '50% 50%' }, 0);
  };

  /* Pointer parallax: the dome layer moves more than the floor (2.5D depth). */
  const parallax = (() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return { enable() {}, disable() {} };
    const domeX = gsap.quickTo(domeLayer, 'x', { duration: 1.2, ease: EASE.out });
    const domeY = gsap.quickTo(domeLayer, 'y', { duration: 1.2, ease: EASE.out });
    const floorX = gsap.quickTo(planLayer, 'x', { duration: 1.2, ease: EASE.out });
    const onMove = (e: PointerEvent): void => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      domeX(nx * 14);
      domeY(ny * 8);
      floorX(nx * -4);
    };
    return {
      enable: () => window.addEventListener('pointermove', onMove),
      disable: () => window.removeEventListener('pointermove', onMove),
    };
  })();

  const finish = (): void => {
    if (!reducedMotion()) {
      startHover();
      parallax.enable();
    }
  };

  function build(): gsap.core.Timeline {
    const reduced = reducedMotion();
    gsap.set(allStrokes, { strokeDasharray: 1, strokeDashoffset: reduced ? 0 : 1 });

    if (reduced) {
      return gsap
        .timeline({ onComplete: finish })
        .fromTo([plan.svg], { opacity: 0 }, { opacity: 1, duration: 0.6 })
        .set([...annotations, shadow, domeFill], { opacity: 1 }, 0);
    }

    const wallLength = outerWall.getTotalLength();
    const nibState = { p: 0 };
    const draw = (targets: Element[], duration: number, stagger = 0, ease: string = EASE.hand) => ({
      targets,
      vars: { strokeDashoffset: 0, duration, stagger, ease },
    });

    const c = draw(strokes.construction, 1.1, 0.12, EASE.inOut);
    const w = draw(strokes.walls, 2.2, 0.35);
    const f = draw(strokes.footprint, 1.4);
    const d = draw(strokes.dimension, 0.45, 0.08, EASE.inOut);
    const dm = draw(strokes.dome, 1.4, 0.035, EASE.inOut);
    const pl = draw(strokes.plumb, 0.9, 0.2, EASE.inOut);

    return (
      gsap
        .timeline({ onComplete: finish })
        .set([...annotations, shadow, domeFill], { opacity: 0 })
        .set(domeFloat, { y: 34, opacity: 1 })
        .call(() => {
          stopInk();
          stopInk = audio.ink(5.6);
        })
        // 1. Construction lines, faint and quick, like a draughtsman laying out the sheet.
        .to(c.targets, c.vars, 0)
        // 2. Walls, led by the pen nib.
        .to(w.targets, w.vars, 0.9)
        .set(nib, { opacity: 1 }, 0.9)
        .fromTo(
          nibState,
          { p: 0 },
          {
            p: 1,
            duration: 2.2,
            ease: EASE.hand,
            onUpdate: () => {
              const pt = outerWall.getPointAtLength(nibState.p * wallLength);
              nib.setAttribute('cx', pt.x.toFixed(2));
              nib.setAttribute('cy', pt.y.toFixed(2));
            },
          },
          0.9,
        )
        .to(nib, { opacity: 0, duration: 0.4 }, 3.2)
        // 3. Where the dome will sit, and how big it is.
        .to(f.targets, f.vars, 2.6)
        .to(d.targets, d.vars, 3.2)
        .to(
          annotations.slice(0, 2),
          { opacity: 1, duration: 0.8, ease: EASE.out, stagger: 0.2 },
          3.6,
        )
        // 4. The dome is drawn, then lifts off its footprint and hovers.
        .to(shadow, { opacity: 1, duration: 1.6, ease: EASE.soft }, 3.9)
        .to(dm.targets, dm.vars, 4)
        .to(domeFill, { opacity: 1, duration: 1.8, ease: EASE.soft }, 4.4)
        .to(domeFloat, { y: 0, duration: 2.4, ease: EASE.inOut }, 4.6)
        .to(pl.targets, pl.vars, 5.6)
        .to(annotations.slice(2), { opacity: 1, duration: 0.8, ease: EASE.out }, 6)
    );
  }

  return {
    play() {
      tl?.kill();
      hover?.kill();
      parallax.disable();
      gsap.set(domeFloat, { y: 0 });
      gsap.set(shadow, { scale: 1, opacity: 1 });
      tl = build();
    },
    pause() {
      tl?.pause();
      hover?.pause();
      parallax.disable();
      stopInk();
    },
    resume() {
      if (tl && tl.progress() < 1) tl.resume();
      else finish();
    },
  };
}
