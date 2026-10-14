/**
 * Chapter I — The problem.
 * A prayer hall is sketched by hand in fine ink: construction lines, walls (led by a pen nib),
 * the dome's footprint, then the dome itself, which lifts and hovers.
 * "Release the dome" drops it with no supports: it falls, the line art breaks apart, dust
 * rises and cracks run across the floor. The lesson: a dome pushes down, and outward.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import { announce } from '../core/announcer';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { button, eyebrow, headline, introText, setButtonLabel, sheet } from '../core/ui';
import { createDust } from '../render/dust';
import { PLAN, buildFloorPlan, type FloorPlan } from '../render/floorPlan';

type State = 'intact' | 'collapsed';

export function createProblem(ctx: ChapterContext): Chapter {
  const t = copy.problem;

  const top = eyebrow('I', t.eyebrow);
  const title = headline('h2', 'problem-title', t.headline);
  const body = h('p', { class: 'body swap' }, t.body);
  const goal = h('p', { class: 'body callout swap' }, t.goal);

  const primary = button(t.cta, 'primary', '↓');
  const redraw = button(t.redraw, 'ghost');
  const actions = h('div', { class: 'spread__actions' }, primary, redraw);

  const plan = buildFloorPlan(t.annotations, 'problem-figure-desc');
  const canvas = h('canvas', { 'aria-hidden': 'true' });
  const art = h('div', { class: 'sheet__art', style: '--ratio: 4 / 3' }, plan.svg, canvas);
  const { figure, caption } = sheet(art, t.figcaption);
  figure.prepend(h('p', { id: 'problem-figure-desc', class: 'sr-only' }, t.figureLabel));

  const el = h(
    'section',
    { class: 'chapter paper', 'data-theme': 'stone', 'aria-labelledby': 'problem-title' },
    h(
      'div',
      { class: 'spread' },
      h('div', { class: 'spread__text' }, top, title.el, body, goal),
      h('div', { class: 'spread__figure' }, figure),
      actions,
    ),
  );

  const dust = createDust(canvas);
  const drawing = createDrawing(plan);
  let state: State = 'intact';
  let hasPlayed = false;

  /** Swap a paragraph's text with a short crossfade. */
  const swapText = (node: HTMLElement, text: string): void => {
    if (reducedMotion()) {
      node.textContent = text;
      return;
    }
    gsap.to(node, {
      opacity: 0,
      duration: 0.3,
      ease: EASE.out,
      onComplete: () => {
        node.textContent = text;
        gsap.to(node, { opacity: 1, duration: 0.6, ease: EASE.out });
      },
    });
  };

  function collapse(): void {
    state = 'collapsed';
    drawing.collapse(() => {
      audio.rumble();
      if (!reducedMotion())
        dust.burst(plan.impactPoints, { viewWidth: PLAN.view[2], viewY: PLAN.view[1] });
    });
    title.set(t.collapsed.headline);
    swapText(body, t.collapsed.body);
    gsap.to(goal, { opacity: 0, height: 0, marginTop: -16, duration: 0.5, ease: EASE.inOut });
    caption.textContent = t.collapsed.figcaption;
    setButtonLabel(primary, t.collapsed.cta);
    primary.querySelector('.btn__arrow')!.textContent = '→';
    announce(t.collapsed.announce);
  }

  function restore(play: boolean): void {
    state = 'intact';
    dust.clear();
    title.set(t.headline, false);
    gsap.killTweensOf([body, goal]);
    gsap.set([body, goal], { clearProps: 'all' });
    body.textContent = t.body;
    caption.textContent = t.figcaption;
    setButtonLabel(primary, t.cta);
    primary.querySelector('.btn__arrow')!.textContent = '↓';
    if (play) drawing.play();
    else drawing.reset();
  }

  primary.addEventListener('click', () => {
    if (state === 'intact') collapse();
    else ctx.next();
  });

  redraw.addEventListener('click', () => restore(true));

  return {
    id: 'problem',
    theme: 'stone',
    el,
    enter() {
      audio.setMood('stone');
      introText(top, title.words, [body, goal, actions]);
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
    reset() {
      hasPlayed = false;
      restore(false);
    },
    focusTarget: () => title.el,
  };
}

/* ------------------------------------------------------------------------ */

interface Drawing {
  play(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  collapse(onImpact: () => void): void;
}

/**
 * The hand-drawn sequence, the idle hover, pointer parallax and the collapse.
 * With reduced motion, the finished drawing fades in and stays still, and the
 * collapse becomes a simple fade.
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
    guides,
  } = plan;
  const drawn = [
    ...strokes.construction,
    ...strokes.walls,
    ...strokes.footprint,
    ...strokes.dome,
    ...strokes.domeDim,
    ...strokes.plumb,
  ];
  const fragments = [...strokes.dome, ...strokes.domeDim];
  const [hallLabel, hallSize, domeLabel, spanLabel] = annotations;
  let tl: gsap.core.Timeline | null = null;
  let hover: gsap.core.Timeline | null = null;
  let collapsed = false;
  let stopInk: () => void = () => {};

  const startHover = (): void => {
    hover?.kill();
    if (collapsed || reducedMotion()) return;
    hover = gsap
      .timeline({ repeat: -1, yoyo: true, defaults: { duration: 3.6, ease: EASE.soft } })
      .to(domeFloat, { y: -8 }, 0)
      .to(
        shadow,
        { scale: 0.94, opacity: 0.75, svgOrigin: `${PLAN.origin.x} ${PLAN.origin.y}` },
        0,
      );
  };

  /* Pointer parallax: the dome layer moves more than the floor (2.5D depth). */
  const parallax = (() => {
    if (!window.matchMedia('(pointer: fine)').matches) return { enable() {}, disable() {} };
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
      disable: () => {
        window.removeEventListener('pointermove', onMove);
        domeX(0);
        domeY(0);
        floorX(0);
      },
    };
  })();

  const settle = (): void => {
    if (collapsed || reducedMotion()) return;
    startHover();
    parallax.enable();
  };

  function resetVisuals(): void {
    tl?.kill();
    hover?.kill();
    parallax.disable();
    stopInk();
    collapsed = false;
    gsap.killTweensOf([
      ...fragments,
      domeFill,
      domeFloat,
      shadow,
      planLayer,
      guides,
      ...strokes.cracks,
    ]);
    gsap.set(fragments, { clearProps: 'transform,opacity' });
    gsap.set([domeFloat, planLayer], { x: 0, y: 0 });
    gsap.set(shadow, { scale: 1, opacity: 1, svgOrigin: `${PLAN.origin.x} ${PLAN.origin.y}` });
    gsap.set(strokes.cracks, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 1 });
    gsap.set([...annotations, domeFill, guides, ...strokes.plumb], { opacity: 1 });
  }

  function build(): gsap.core.Timeline {
    if (reducedMotion()) {
      gsap.set(drawn, { strokeDasharray: 1, strokeDashoffset: 0 });
      return gsap
        .timeline({ onComplete: settle })
        .fromTo(plan.svg, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    }

    gsap.set(drawn, { strokeDasharray: 1, strokeDashoffset: 1 });
    const wallLength = outerWall.getTotalLength();
    const nibState = { p: 0 };
    const draw = (duration: number, stagger = 0, ease: string = EASE.hand) => ({
      strokeDashoffset: 0,
      duration,
      stagger,
      ease,
    });

    return (
      gsap
        .timeline({ onComplete: settle })
        .set([...annotations, shadow, domeFill, guides], { opacity: 0 })
        .set(domeFloat, { y: 34 })
        .call(() => {
          stopInk();
          stopInk = audio.ink(5.6);
        })
        // 1. Construction lines, faint and quick, like a draughtsman laying out the sheet.
        .to(strokes.construction, draw(1.1, 0.1, EASE.inOut), 0)
        // 2. Walls, led by the pen nib.
        .to(strokes.walls, draw(2.2, 0.35), 0.9)
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
        .to(nib, { opacity: 0, duration: 0.4 }, 3.1)
        // 3. Where the dome will sit; the hall's name and size.
        .to(strokes.footprint, draw(1.4), 2.6)
        .to([hallLabel, hallSize], { opacity: 1, duration: 0.8, ease: EASE.out, stagger: 0.2 }, 3.3)
        // 4. The dome is drawn, then lifts off its footprint and hovers.
        .to(shadow, { opacity: 1, duration: 1.6, ease: EASE.soft }, 3.7)
        .to(strokes.dome, draw(1.4, 0.03, EASE.inOut), 3.8)
        .to(domeFill, { opacity: 1, duration: 1.8, ease: EASE.soft }, 4.2)
        .to(domeFloat, { y: 0, duration: 2.4, ease: EASE.inOut }, 4.4)
        .to(strokes.plumb, draw(0.9, 0.2, EASE.inOut), 5.4)
        .to(guides, { opacity: 1, duration: 1, ease: EASE.soft }, 5.6)
        .to(strokes.domeDim, draw(0.6, 0.08, EASE.inOut), 5.8)
        .to(
          [domeLabel, spanLabel],
          { opacity: 1, duration: 0.8, ease: EASE.out, stagger: 0.15 },
          6.1,
        )
    );
  }

  return {
    play() {
      resetVisuals();
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
      else settle();
    },
    reset() {
      resetVisuals();
      gsap.set(drawn, { strokeDasharray: 1, strokeDashoffset: 1 });
    },
    collapse(onImpact) {
      tl?.progress(1).kill();
      hover?.kill();
      parallax.disable();
      stopInk();
      collapsed = true;

      if (reducedMotion()) {
        gsap.to([...fragments, domeFill, guides, ...strokes.plumb, domeLabel, spanLabel], {
          opacity: 0.15,
          duration: 0.6,
        });
        gsap.set(strokes.cracks, { strokeDasharray: 1, strokeDashoffset: 0, opacity: 0 });
        gsap.to(strokes.cracks, { opacity: 1, duration: 0.6 });
        onImpact();
        return;
      }

      const fall = 0.75;
      gsap
        .timeline()
        .to([guides, ...strokes.plumb, domeLabel, spanLabel], { opacity: 0, duration: 0.3 }, 0)
        // Down it goes.
        .to(domeFloat, { y: plan.dropDistance, duration: fall, ease: 'power3.in' }, 0)
        .to(shadow, { scale: 1.08, opacity: 1, duration: fall, ease: 'power3.in' }, 0)
        .call(onImpact, [], fall)
        // Impact: the floor shudders, cracks run out, the line art breaks apart.
        .to(
          planLayer,
          { keyframes: { x: [0, -5, 4, -3, 2, 0] }, duration: 0.5, ease: 'none' },
          fall,
        )
        .to(
          strokes.cracks,
          { strokeDashoffset: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out' },
          fall,
        )
        .to(domeFill, { opacity: 0, duration: 0.5, ease: EASE.out }, fall)
        .to(
          fragments,
          {
            x: () => gsap.utils.random(-60, 60),
            y: () => gsap.utils.random(-6, 34),
            rotation: () => gsap.utils.random(-35, 35),
            opacity: () => gsap.utils.random(0.25, 0.6),
            transformOrigin: '50% 50%',
            duration: 1.6,
            ease: EASE.out,
            stagger: { amount: 0.25, from: 'random' },
          },
          fall,
        )
        .to(shadow, { opacity: 0.4, duration: 1.2, ease: EASE.soft }, fall + 0.3);
    },
  };
}
