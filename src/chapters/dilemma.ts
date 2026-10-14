/**
 * Chapter II — The dilemma. The core mechanic.
 * Choose 4, 6, 8, 12 or 16 piers (stepped control, or tap the ring / a pier).
 * Two meters — Stability and Openness — respond, thrust lines flow into the piers,
 * and a small "view from the floor" shows what a person inside would see.
 * Eight piers is the lock-in moment: Sinan's answer.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import { announce } from '../core/announcer';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { button, eyebrow, headline, introText, sheet } from '../core/ui';
import { PIER_OPTIONS, evaluate, stepPiers, type PierCount } from '../model/stability';
import { TOP, buildFloorView, buildPiersPlan } from '../render/piersPlan';

const HINT_AFTER = 3;

export function createDilemma(ctx: ChapterContext): Chapter {
  const t = copy.dilemma;

  /* --- Text column ---------------------------------------------------- */
  const top = eyebrow('II', t.eyebrow);
  const title = headline('h2', 'dilemma-title', t.states.none.headline);
  const body = h('p', { class: 'body' }, t.states.none.body);

  const stabilityMeter = meter('stability', t.stability);
  const opennessMeter = meter('openness', t.openness);
  const meters = h(
    'div',
    { class: 'meters' },
    stabilityMeter.el,
    opennessMeter.el,
    h('p', { class: 'model-note' }, copy.meta.model),
  );

  // Stepped control: a radio group with roving focus and large tap targets.
  const groupLabel = h('p', { class: 'stepper__label', id: 'pier-count-label' }, t.control);
  const options = PIER_OPTIONS.map((n) =>
    h(
      'button',
      {
        type: 'button',
        role: 'radio',
        class: 'stepper__option',
        'aria-checked': 'false',
        tabindex: '-1',
        'data-n': n,
      },
      String(n),
    ),
  );
  options[0].tabIndex = 0;
  const stepper = h(
    'div',
    { class: 'stepper' },
    groupLabel,
    h(
      'div',
      { role: 'radiogroup', class: 'stepper__options', 'aria-labelledby': 'pier-count-label' },
      ...options,
    ),
  );
  const ringHint = h('p', { class: 'note' }, t.ringHint);

  // Aside for four piers: how Hagia Sophia solved it.
  const aside = h('aside', {
    class: 'aside',
    hidden: true,
    'aria-labelledby': 'hagia-aside-title',
  });
  aside.innerHTML = `
    <svg class="aside__sketch" viewBox="0 0 120 70" role="img" aria-label="${t.hagia.label}">
      <rect x="2" y="12" width="116" height="46" class="aside__wall"/>
      <path d="M42 35a18 18 0 1 0 36 0a18 18 0 1 0 -36 0" class="aside__dome"/>
      <path d="M42 17a18 18 0 0 0 0 36" class="aside__half"/>
      <path d="M78 17a18 18 0 0 1 0 36" class="aside__half"/>
      <rect x="38" y="13" width="7" height="7"/><rect x="75" y="13" width="7" height="7"/>
      <rect x="38" y="50" width="7" height="7"/><rect x="75" y="50" width="7" height="7"/>
      <path d="M10 35h100" class="aside__axis"/>
    </svg>
    <div><p class="aside__title" id="hagia-aside-title"></p><p class="aside__body"></p></div>`;
  aside.querySelector('.aside__title')!.textContent = t.hagia.title;
  aside.querySelector('.aside__body')!.textContent = t.hagia.body;

  const showAnswer = h('button', { type: 'button', class: 'link-btn', hidden: true }, t.showAnswer);
  const cont = button(copy.meta.continue, 'primary', '→');
  cont.hidden = true;
  const actions = h('div', { class: 'spread__actions' }, cont, showAnswer);

  /* --- Figure ---------------------------------------------------------- */
  const plan = buildPiersPlan('dilemma-figure-desc');
  const floor = buildFloorView();
  const floorFig = h('figure', { class: 'floorview' }, floor.svg, h('figcaption', {}, t.floorView));
  const floorDesc = h(
    'p',
    { class: 'sr-only', id: 'floorview-desc', 'aria-live': 'off' },
    t.floorViewLabel(0),
  );
  const art = h('div', { class: 'sheet__art' }, plan.svg);
  const { figure } = sheet(art, t.figcaption, 'dilemma__sheet');
  figure.prepend(h('p', { id: 'dilemma-figure-desc', class: 'sr-only' }, t.figureLabel));
  art.append(floorFig);
  figure.append(floorDesc);

  const el = h(
    'section',
    { class: 'chapter paper dilemma', 'data-theme': 'stone', 'aria-labelledby': 'dilemma-title' },
    h(
      'div',
      { class: 'spread spread--controls' },
      h('div', { class: 'spread__text' }, top, title.el, body),
      h('div', { class: 'spread__controls' }, meters, stepper, ringHint, aside),
      h('div', { class: 'spread__figure' }, figure),
      actions,
    ),
  );

  /* --- State ------------------------------------------------------------ */
  let current: PierCount = 0;
  let tries = 0;
  let solved = false;

  function setPiers(n: PierCount, source: 'user' | 'answer' | 'reset' = 'user'): void {
    if (n === current && source !== 'reset') return;
    const prev = current;
    current = n;
    const e = evaluate(n);
    const reduced = reducedMotion();

    // Control state.
    options.forEach((opt) => {
      const on = Number(opt.dataset.n) === n;
      opt.setAttribute('aria-checked', String(on));
      opt.tabIndex = on || (n === 0 && opt === options[0]) ? 0 : -1;
    });

    // Drawing.
    plan.svg.dataset.state = e.state;
    const rects = plan.render(e);
    const cols = floor.render(e);
    floorDesc.textContent = t.floorViewLabel(cols.length);
    if (!reduced) {
      gsap.from(rects, {
        scale: 0,
        transformOrigin: '50% 50%',
        duration: 0.6,
        ease: EASE.out,
        stagger: 0.025,
      });
      gsap.from(cols, {
        scaleY: 0,
        transformOrigin: '50% 100%',
        duration: 0.7,
        ease: EASE.out,
        stagger: 0.03,
      });
      gsap.from(plan.thrustLayer, { opacity: 0, duration: 0.8, ease: EASE.soft });
    }

    // Meters.
    stabilityMeter.set(e.stability, e.stabilityLabel, tone(e.stability, 'stability'));
    opennessMeter.set(e.openness, e.opennessLabel, tone(e.openness, 'openness'));

    // Copy.
    const key = n === 0 ? 'none' : n;
    const s = t.states[key];
    if (source !== 'reset') title.set(s.headline);
    else title.set(s.headline, false);
    body.textContent = s.body;
    aside.hidden = n !== 4;

    if (source === 'reset') return;
    audio.tick(n > prev ? 1 : 0.8);
    announce(t.announce(n, e.stabilityLabel, e.opennessLabel));

    if (e.state === 'balanced') lockIn();
    else {
      cont.classList.replace('btn--primary', 'btn--secondary');
      if (source === 'user' && !solved) {
        tries++;
        if (tries >= HINT_AFTER) showAnswer.hidden = false;
      }
    }
  }

  function lockIn(): void {
    const first = !solved;
    solved = true;
    showAnswer.hidden = true;
    cont.hidden = false;
    cont.classList.replace('btn--secondary', 'btn--primary');
    audio.lock();
    window.setTimeout(() => announce(copy.dilemma.lockIn), 600);
    if (reducedMotion()) return;
    const origin = `${TOP.c} ${TOP.c}`;
    gsap
      .timeline()
      .fromTo(
        plan.dome,
        { scale: 1.035 },
        { scale: 1, svgOrigin: origin, duration: 1.6, ease: EASE.out },
      )
      .fromTo(
        plan.pulse,
        { scale: 1, opacity: 0.8 },
        { scale: 1.35, opacity: 0, svgOrigin: origin, duration: 2, ease: EASE.out },
        0,
      );
    if (first) gsap.from(cont, { opacity: 0, y: 10, duration: 0.8, ease: EASE.out, delay: 0.4 });
  }

  /* --- Input ------------------------------------------------------------- */
  options.forEach((opt, i) => {
    opt.addEventListener('click', () => setPiers(Number(opt.dataset.n) as PierCount));
    opt.addEventListener('keydown', (ev) => {
      const dir =
        ev.key === 'ArrowRight' || ev.key === 'ArrowDown'
          ? 1
          : ev.key === 'ArrowLeft' || ev.key === 'ArrowUp'
            ? -1
            : 0;
      let target = -1;
      if (dir) target = (i + dir + options.length) % options.length;
      else if (ev.key === 'Home') target = 0;
      else if (ev.key === 'End') target = options.length - 1;
      if (target < 0) return;
      ev.preventDefault();
      options[target].focus();
      setPiers(Number(options[target].dataset.n) as PierCount);
    });
  });

  // Tap the ring to add piers; tap a pier to remove some (snapping to symmetric layouts).
  plan.ringHit.addEventListener('click', () => setPiers(stepPiers(current, 1)));
  plan.pierLayer.addEventListener('click', () => setPiers(stepPiers(current, -1)));

  showAnswer.addEventListener('click', () => setPiers(8, 'answer'));
  cont.addEventListener('click', () => ctx.next());

  setPiers(0, 'reset');

  return {
    id: 'dilemma',
    theme: 'stone',
    el,
    enter() {
      audio.setMood('stone');
      introText(top, title.words, [body, meters, stepper, ringHint, actions]);
      if (!reducedMotion()) {
        gsap.from(plan.svg, {
          opacity: 0,
          scale: 0.96,
          transformOrigin: '50% 50%',
          duration: 1.4,
          ease: EASE.out,
        });
        gsap.from(floorFig, { opacity: 0, y: 16, duration: 1, ease: EASE.out, delay: 0.6 });
      }
    },
    leave() {},
    reset() {
      tries = 0;
      solved = false;
      cont.hidden = true;
      showAnswer.hidden = true;
      setPiers(0, 'reset');
    },
    focusTarget: () => title.el,
  };
}

/* ------------------------------------------------------------------------ */

type Tone = 'bad' | 'warn' | 'good';

function tone(v: number, kind: 'stability' | 'openness'): Tone {
  if (kind === 'stability') return v === 0 || v < 0.5 ? 'bad' : v < 0.8 ? 'warn' : 'good';
  return v < 0.35 ? 'bad' : v < 0.8 ? 'warn' : 'good';
}

/**
 * A horizontal meter with a text value, so colour is never the only cue.
 * Uses role="meter"; the fill animates with transform only.
 */
function meter(id: string, label: string) {
  const labelId = `meter-${id}-label`;
  const value = h('span', { class: 'meter__value' });
  const fill = h('span', { class: 'meter__fill' });
  const el = h(
    'div',
    {
      class: 'meter',
      role: 'meter',
      'aria-labelledby': labelId,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': 0,
    },
    h(
      'div',
      { class: 'meter__head' },
      h('span', { class: 'meter__label', id: labelId }, label),
      value,
    ),
    h(
      'div',
      { class: 'meter__track', 'aria-hidden': 'true' },
      h('span', { class: 'meter__sweet' }),
      fill,
    ),
  );
  return {
    el,
    set(v: number, text: string, t: Tone) {
      el.setAttribute('aria-valuenow', String(Math.round(v * 100)));
      el.setAttribute('aria-valuetext', text);
      el.dataset.tone = t;
      value.textContent = text;
      if (reducedMotion()) gsap.set(fill, { scaleX: v });
      else gsap.to(fill, { scaleX: v, duration: 0.9, ease: EASE.out });
    },
  };
}
