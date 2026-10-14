/**
 * Chapter V — Inside the light. Photographs that teach.
 * Each full-bleed photo opens with its caption, then steps through short annotated notes:
 * the photo darkens except the area that matters, an outline is drawn, and one line explains it
 * (tagged with its principle). Scroll, swipe, arrow keys or the buttons move through the steps.
 * Optional room tone when sound is on.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy, fig, images, insideSlides, numeralOf, principles } from '../content';
import { createAnnotator, type Annotator } from '../core/annotate';
import { announce } from '../core/announcer';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { principleMark } from '../core/principles';
import { button, richText } from '../core/ui';

/** A position in the sequence: a photo, and either its caption (-1) or one of its notes. */
interface Position {
  slide: number;
  step: number;
}

export function createInside(ctx: ChapterContext): Chapter {
  const t = copy.inside;
  const total = insideSlides.length;
  const positions: Position[] = insideSlides.flatMap((s, i) => [
    { slide: i, step: -1 },
    ...s.steps.map((_, j) => ({ slide: i, step: j })),
  ]);

  const title = h(
    'h2',
    { id: 'inside-title', class: 'eyebrow slides__title', tabindex: '-1' },
    h('span', { class: 'eyebrow__num', 'aria-hidden': 'true' }, numeralOf('inside')),
    t.eyebrow,
  );

  const slides = insideSlides.map((slide, i) => {
    const caption = richText(h('p', { class: 'slide__caption' }), slide.caption);
    const note = h('div', { class: 'slide__note', hidden: true });
    const figLabel = h('p', { class: 'slide__fig' }, fig(slide.figure));
    const zoom = h('div', { class: 'slide__zoom' });
    const media = h('div', { class: 'slide__media' }, zoom);
    const el = h(
      'div',
      {
        class: 'slide',
        role: 'group',
        'aria-roledescription': 'slide',
        'aria-label': t.slide(i + 1, total),
        'aria-hidden': i === 0 ? 'false' : 'true',
      },
      media,
      h('div', { class: 'slide__shade', 'aria-hidden': 'true' }),
      h('div', { class: 'slide__text' }, figLabel, caption, note),
    );
    return { el, media, zoom, caption, note, data: slide, annot: null as Annotator | null };
  });

  const prev = h('button', { type: 'button', class: 'icon-btn', 'aria-label': t.prev }, '←');
  const next = h('button', { type: 'button', class: 'icon-btn', 'aria-label': t.next }, '→');
  const counter = h('p', { class: 'slides__counter', 'aria-hidden': 'true' });
  const dots = h(
    'div',
    { class: 'slides__dots', 'aria-hidden': 'true' },
    ...slides.map(() => h('span', { class: 'slides__dot' })),
  );
  const cont = button(copy.meta.continue, 'primary', '→');
  cont.hidden = true;
  const hint = h('p', { class: 'slides__hint' }, t.hint);

  const el = h(
    'section',
    { class: 'chapter inside', 'data-theme': 'night', 'aria-labelledby': 'inside-title' },
    h(
      'div',
      {
        class: 'slides',
        role: 'region',
        'aria-roledescription': 'carousel',
        'aria-labelledby': 'inside-title',
      },
      ...slides.map((s) => s.el),
    ),
    h('div', { class: 'slides__top' }, title),
    h(
      'div',
      { class: 'slides__controls' },
      hint,
      h('div', { class: 'slides__nav' }, prev, counter, dots, next),
      cont,
    ),
  );

  let pos = 0;
  let prepared = false;
  let lastWheel = 0;
  let touch: { x: number; y: number } | null = null;

  /** Fills the note under the caption with the step's label, principle and line. */
  function renderNote(i: number, step: number): void {
    const s = slides[i];
    if (step < 0) {
      s.note.hidden = true;
      return;
    }
    const a = s.data.steps[step];
    s.note.hidden = false;
    s.note.replaceChildren(
      h(
        'p',
        { class: 'anno-note__label' },
        a.principle ? principleMark(a.principle, true) : null,
        h('span', {}, a.principle ? `${a.label} · ${principles[a.principle].name}` : a.label),
      ),
      h('p', { class: 'anno-note__text' }, a.text),
    );
    if (!reducedMotion()) {
      gsap.fromTo(
        s.note,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.8, ease: EASE.out },
      );
    }
  }

  function render(animate: boolean, dir = 1, slideChanged = true): void {
    const { slide: index, step } = positions[pos];
    const s = slides[index];
    const steps = s.data.steps.length;
    counter.textContent =
      step < 0 ? `${index + 1} / ${total}` : `${index + 1} / ${total} · ${step + 1}/${steps}`;
    [...dots.children].forEach((d, i) => d.classList.toggle('is-on', i === index));
    prev.disabled = pos === 0;
    next.disabled = pos === positions.length - 1;
    cont.hidden = pos !== positions.length - 1;
    const reduced = reducedMotion() || !animate;

    if (slideChanged) {
      slides.forEach((sl, i) => {
        const on = i === index;
        sl.el.setAttribute('aria-hidden', String(!on));
        sl.el.classList.toggle('is-current', on);
        gsap.to(sl.el, { opacity: on ? 1 : 0, duration: reduced ? 0.01 : 1.4, ease: EASE.inOut });
        if (!on) sl.annot?.show(null);
      });
      if (!reduced) {
        // Ken Burns on the wrapper, so photo and annotations move together.
        gsap.fromTo(
          s.zoom,
          { scale: 1.06, xPercent: dir * 1.2 },
          { scale: 1, xPercent: 0, duration: 9, ease: 'sine.out' },
        );
        gsap.fromTo(
          s.caption,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 1.2, ease: EASE.out, delay: 0.5 },
        );
      }
    }

    s.annot?.show(step < 0 ? null : s.data.steps[step]);
    renderNote(index, step);
    avoidCollisions(s);
  }

  /**
   * Keeps the caption block clear of the highlighted area: it moves to the first free corner
   * (bottom-left, bottom-right, top-right). If none is free, the in-photo label hides; the note
   * below the caption always carries the same words.
   */
  function avoidCollisions(s: (typeof slides)[number]): void {
    const text = s.el.querySelector<HTMLElement>('.slide__text')!;
    const label = s.zoom.querySelector<HTMLElement>('.annot-label');
    const outline = s.zoom.querySelector<SVGGElement>('.annot-outlines > g:last-child');
    const corners = ['', 'is-right', 'is-top'];
    const boxes = [label, outline].filter(Boolean).map((n) => n!.getBoundingClientRect());
    const hits = (r: DOMRect) =>
      boxes.some(
        (b) =>
          b.width && r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top,
      );
    text.classList.remove('is-right', 'is-top');
    if (label) label.style.visibility = '';
    if (!boxes.length) return;
    const free = corners.find((c) => {
      text.classList.remove('is-right', 'is-top');
      if (c) text.classList.add(c);
      return !hits(text.getBoundingClientRect());
    });
    if (free === undefined) {
      text.classList.remove('is-right', 'is-top');
      if (label) label.style.visibility = 'hidden';
    }
  }

  function go(to: number): void {
    const target = Math.max(0, Math.min(positions.length - 1, to));
    if (target === pos) return;
    const dir = target > pos ? 1 : -1;
    const slideChanged = positions[target].slide !== positions[pos].slide;
    pos = target;
    render(true, dir, slideChanged);
    const { slide, step } = positions[pos];
    const s = slides[slide];
    announce(
      step < 0
        ? `${t.slide(slide + 1, total)}. ${s.caption.textContent}`
        : `${t.step(step + 1, s.data.steps.length)}: ${s.data.steps[step].label}. ${s.data.steps[step].text}`,
    );
  }

  prev.addEventListener('click', () => go(pos - 1));
  next.addEventListener('click', () => go(pos + 1));
  cont.addEventListener('click', () => ctx.next());

  el.addEventListener(
    'wheel',
    (e) => {
      const now = performance.now();
      if (Math.abs(e.deltaY) < 12 || now - lastWheel < 1100) return;
      lastWheel = now;
      go(pos + (e.deltaY > 0 ? 1 : -1));
    },
    { passive: true },
  );
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') touch = { x: e.clientX, y: e.clientY };
  });
  el.addEventListener('pointerup', (e) => {
    if (!touch) return;
    const dx = e.clientX - touch.x;
    const dy = e.clientY - touch.y;
    touch = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 50) return;
    go(pos + ((Math.abs(dx) > Math.abs(dy) ? -dx : -dy) > 0 ? 1 : -1));
  });

  const onKey = (e: KeyboardEvent): void => {
    if (e.defaultPrevented || (e.target as HTMLElement).closest?.('input, textarea')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      go(pos + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      go(pos - 1);
    }
  };

  return {
    id: 'inside',
    theme: 'night',
    el,
    prepare() {
      if (prepared) return;
      prepared = true;
      slides.forEach((s, i) => {
        s.zoom.append(
          picture(s.data.image, {
            sizes: '100vw',
            eager: i === 0,
            position: s.data.position,
            className: 'slide__picture',
          }),
        );
        s.annot = createAnnotator(s.zoom, images[s.data.image], { calibrate: s.data.steps });
      });
    },
    enter() {
      audio.setMood('room');
      window.addEventListener('keydown', onKey);
      render(false);
      const s = slides[positions[pos].slide];
      s.annot?.update();
      if (!reducedMotion()) {
        gsap.fromTo(
          s.caption,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 1.4, ease: EASE.out, delay: 0.6 },
        );
        gsap.fromTo(s.zoom, { scale: 1.06 }, { scale: 1, duration: 10, ease: 'sine.out' });
      }
    },
    leave() {
      window.removeEventListener('keydown', onKey);
    },
    reset() {
      pos = 0;
      slides.forEach((s) => s.annot?.show(null));
    },
    focusTarget: () => title,
  };
}
