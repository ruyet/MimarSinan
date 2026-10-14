/**
 * Chapter X — MIMAR SINAN. The recognition moment.
 * Dark and full-bleed, like the Prologue and Epilogue. The name is set as large as the
 * viewport allows and revealed by a sweeping band of light (transform-only wipe). The bronze
 * monument in Edirne stands darkened behind it; a sky-free cutout of the same photo sits in
 * front, so the figure's head and shoulders pass in front of the letters.
 *
 * Leaving forwards plays a closing gesture: the band of light narrows into the vertical beam
 * where the Epilogue's own beam falls, and the name fades as it does. The Epilogue itself is
 * untouched.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy, numeralOf } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { button, eyebrow, richText } from '../core/ui';

export function createName(ctx: ChapterContext): Chapter {
  const t = copy.name;

  const top = eyebrow(numeralOf('name'), t.eyebrow);

  // The name: a dim base layer always present, and a lit layer revealed by the wipe.
  const line = (text: string, cls: string) =>
    h(
      'span',
      { class: `name__line ${cls}`, 'aria-hidden': 'true' },
      h('span', { class: 'name__dim' }, text),
      h('span', { class: 'name__wipe' }, h('span', { class: 'name__lit' }, text)),
    );
  const first = line(t.first, 'name__line--first');
  const last = line(t.last, 'name__line--last');
  const title = h(
    'h2',
    { id: 'name-title', class: 'name__title', tabindex: '-1' },
    h('span', { class: 'sr-only' }, `${t.first} ${t.last}`),
    first,
    last,
  );

  const dates = h('p', { class: 'name__dates' }, t.dates);
  const motto = richText(h('p', { class: 'name__motto' }), t.line);
  const caption = h('p', { class: 'name__caption' }, t.figcaption);
  const cont = button(copy.meta.continue, 'primary', '→');

  const photo = h('div', { class: 'name__photo' });
  const cutout = h('div', { class: 'name__cutout', 'aria-hidden': 'true' });
  const band = h('div', { class: 'name__band', 'aria-hidden': 'true' });
  const shade = h('div', { class: 'name__shade', 'aria-hidden': 'true' });

  const el = h(
    'section',
    { class: 'chapter name', 'data-theme': 'night', 'aria-labelledby': 'name-title' },
    photo,
    h('div', { class: 'name__type' }, title),
    cutout,
    shade,
    band,
    h('div', { class: 'name__top' }, top),
    h('div', { class: 'name__foot' }, h('div', {}, dates, motto, caption), cont),
  );

  const wipes = [first, last].map((l) => l.querySelector<HTMLElement>('.name__wipe')!);
  const lits = [first, last].map((l) => l.querySelector<HTMLElement>('.name__lit')!);
  let prepared = false;
  let tl: gsap.core.Timeline | null = null;

  function play(): void {
    tl?.kill();
    const reduced = reducedMotion();
    gsap.set(band, { clearProps: 'all' });
    if (reduced) {
      gsap.set(wipes, { xPercent: 0 });
      gsap.set(lits, { xPercent: 0 });
      tl = gsap
        .timeline()
        .fromTo([photo, cutout], { opacity: 0 }, { opacity: 1, duration: 0.8 })
        .fromTo(
          [title, top, dates, motto, caption, cont],
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          0.3,
        );
      return;
    }
    // Transform-only wipe: the wrapper slides in from the left while its content slides the
    // other way, so the letters stay put and are uncovered from left to right.
    gsap.set(wipes, { xPercent: -101 });
    gsap.set(lits, { xPercent: 101 });
    gsap.set(band, { xPercent: -150, opacity: 0 });
    tl = gsap
      .timeline()
      .fromTo(
        [photo, cutout],
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 3.2, ease: EASE.soft },
        0,
      )
      .fromTo(top, { opacity: 0 }, { opacity: 1, duration: 1 }, 0.6)
      .set(title, { opacity: 1 }, 0)
      .to(band, { opacity: 1, duration: 0.6, ease: EASE.soft }, 1)
      .to(band, { xPercent: 520, duration: 3.6, ease: 'power2.inOut' }, 1)
      .to(wipes, { xPercent: 0, duration: 3.2, ease: 'power2.inOut', stagger: 0.25 }, 1.1)
      .to(lits, { xPercent: 0, duration: 3.2, ease: 'power2.inOut', stagger: 0.25 }, 1.1)
      .to(band, { opacity: 0, duration: 0.8, ease: EASE.soft }, 4.2)
      .call(() => audio.chime(146.83, 0.1), [], 2.2)
      .fromTo(
        [dates, motto, caption, cont],
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 1.2, ease: EASE.out, stagger: 0.18 },
        3.6,
      );
  }

  cont.addEventListener('click', () => ctx.next());

  return {
    id: 'name',
    theme: 'night',
    el,
    prepare() {
      if (prepared) return;
      prepared = true;
      const opts = { sizes: '100vw', eager: true, className: 'name__picture' };
      photo.append(picture('sinanMonument', opts));
      // The cutout duplicates the same photo, so it stays silent for assistive tech.
      cutout.append(picture('sinanMonument', { ...opts, alt: '', cutout: true }));
    },
    enter() {
      audio.setMood('night');
      play();
    },
    leave() {
      tl?.progress(1);
    },
    /** The band of light narrows into the Epilogue's beam as the name fades. */
    exit() {
      if (reducedMotion()) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const vw = window.innerWidth;
        const bandWidth = band.getBoundingClientRect().width || vw * 0.22;
        // The Epilogue's window and beam sit at 70 % of the width.
        // (plus the same small offset the beam uses in CSS: clamp(11px, 1.2vw, 17px)).
        const beamX = vw * 0.7 + Math.min(17, Math.max(11, vw * 0.012));
        const targetX = beamX - bandWidth / 2;
        gsap
          .timeline({ onComplete: resolve })
          .set(band, { xPercent: 0, x: -bandWidth, opacity: 0 })
          .to(band, { x: targetX, opacity: 1, duration: 1, ease: EASE.inOut }, 0)
          .to(band, { scaleX: 0.25, duration: 1.1, ease: EASE.inOut }, 0.6)
          .to(
            [title, dates, motto, caption, cont, top],
            { opacity: 0, duration: 1, ease: EASE.soft },
            0.5,
          )
          .to([photo, cutout], { opacity: 0.25, duration: 1.4, ease: EASE.soft }, 0.4);
      });
    },
    reset() {
      tl?.kill();
    },
    focusTarget: () => title,
  };
}
