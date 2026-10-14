/**
 * Chapter V — Inside the light.
 * Full-bleed photographs, one italic caption each. Navigate with scroll, swipe,
 * arrow keys or the buttons. Optional room tone when sound is on.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy, insideSlides } from '../content';
import { announce } from '../core/announcer';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { button, richText } from '../core/ui';

export function createInside(ctx: ChapterContext): Chapter {
  const t = copy.inside;
  const total = insideSlides.length;

  const title = h(
    'h2',
    { id: 'inside-title', class: 'eyebrow slides__title', tabindex: '-1' },
    h('span', { class: 'eyebrow__num', 'aria-hidden': 'true' }, 'V'),
    t.eyebrow,
  );

  const slides = insideSlides.map((slide, i) => {
    const caption = richText(h('p', { class: 'slide__caption' }), slide.caption);
    const media = h('div', { class: 'slide__media' });
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
      caption,
    );
    return { el, media, caption, data: slide };
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

  let index = 0;
  let prepared = false;
  let lastWheel = 0;
  let touch: { x: number; y: number } | null = null;

  function render(animate: boolean, dir = 1): void {
    counter.textContent = `${index + 1} / ${total}`;
    [...dots.children].forEach((d, i) => d.classList.toggle('is-on', i === index));
    prev.disabled = index === 0;
    next.disabled = index === total - 1;
    cont.hidden = index !== total - 1;
    const reduced = reducedMotion() || !animate;

    slides.forEach((s, i) => {
      const on = i === index;
      s.el.setAttribute('aria-hidden', String(!on));
      s.el.classList.toggle('is-current', on);
      gsap.to(s.el, { opacity: on ? 1 : 0, duration: reduced ? 0.01 : 1.4, ease: EASE.inOut });
      if (on && !reduced) {
        const img = s.media.querySelector('img');
        if (img)
          gsap.fromTo(
            img,
            { scale: 1.08, xPercent: dir * 1.5 },
            { scale: 1, xPercent: 0, duration: 9, ease: 'sine.out' },
          );
        gsap.fromTo(
          s.caption,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 1.2, ease: EASE.out, delay: 0.5 },
        );
      }
    });
  }

  function go(to: number): void {
    const target = Math.max(0, Math.min(total - 1, to));
    if (target === index) return;
    const dir = target > index ? 1 : -1;
    index = target;
    render(true, dir);
    announce(`${t.slide(index + 1, total)}. ${slides[index].caption.textContent}`);
  }

  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  cont.addEventListener('click', () => ctx.next());

  el.addEventListener(
    'wheel',
    (e) => {
      const now = performance.now();
      if (Math.abs(e.deltaY) < 12 || now - lastWheel < 1100) return;
      lastWheel = now;
      go(index + (e.deltaY > 0 ? 1 : -1));
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
    go(index + ((Math.abs(dx) > Math.abs(dy) ? -dx : -dy) > 0 ? 1 : -1));
  });

  const onKey = (e: KeyboardEvent): void => {
    if (e.defaultPrevented || (e.target as HTMLElement).closest?.('input, textarea')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      go(index - 1);
    }
  };

  return {
    id: 'inside',
    theme: 'night',
    el,
    prepare() {
      if (prepared) return;
      prepared = true;
      slides.forEach((s, i) =>
        s.media.append(
          picture(s.data.image, {
            sizes: '100vw',
            eager: i === 0,
            position: s.data.position,
            className: 'slide__picture',
          }),
        ),
      );
    },
    enter() {
      audio.setMood('room');
      window.addEventListener('keydown', onKey);
      render(false);
      const s = slides[index];
      if (!reducedMotion()) {
        gsap.fromTo(
          s.caption,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 1.4, ease: EASE.out, delay: 0.6 },
        );
        const img = s.media.querySelector('img');
        if (img) gsap.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 10, ease: 'sine.out' });
      }
    },
    leave() {
      window.removeEventListener('keydown', onKey);
    },
    reset() {
      index = 0;
    },
    focusTarget: () => title,
  };
}
