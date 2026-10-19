/**
 * Scene 8 — Fifty years of architecture. After the three mosques, the scale of the rest: eight
 * milestones set as a typographic chronology, read left to right and top to bottom like a wall
 * of dates in an exhibition. Large years are the anchors; the three works of the previous scene
 * carry the accent, so the visitor finds them again among the others. Selimiye visibly comes
 * late, but not last. One sourced sentence on the scale of his work closes the scene.
 *
 * Each building can be seen: a small photograph appears beside it, never over its name.
 *  - Mouse: on hover. The photograph is anchored beside the milestone (right of it, or left of
 *    it near the edge) rather than following the pointer: names are long, and a photograph that
 *    follows the cursor ends up covering the very title being read.
 *  - Keyboard: on focus, in the same place.
 *  - Touch: a tap shows it; another tap, a tap elsewhere or Escape hides it.
 * It is always kept inside the viewport and below the header.
 * Milestones that are not buildings (his appointment, his death) stay purely typographic.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy, type ImageKey } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { button, enterText, label, title as makeTitle } from '../core/ui';

const GAP = 24; // px between the milestone and the photograph

export function createCareer(ctx: ChapterContext): Chapter {
  const t = copy.career;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const top = label(t.label);
  const title = makeTitle('h2', 'career-title', t.headline);
  const lede = h('p', { class: 'text career__lede' }, t.lede);
  const hint = h(
    'p',
    { class: 'small career__hint', id: 'career-hint' },
    canHover ? t.hint : t.hintTouch,
  );

  /* --- The floating photograph: one frame, one picture per building ---------------------- */
  const shots = new Map<ImageKey, HTMLElement>();
  const preview = h('div', { class: 'preview', 'aria-hidden': 'true' });

  const triggers: HTMLButtonElement[] = [];
  const items = t.milestones.map((m) => {
    const parts = [
      h('span', { class: 'milestone__year' }, m.year),
      h('span', { class: 'milestone__name' }, m.name),
      h('span', { class: 'milestone__note' }, m.note),
    ];
    const major = 'major' in m && m.major ? ' milestone--major' : '';
    if (!('image' in m) || !m.image) return h('li', { class: `milestone${major}` }, ...parts);
    const shot = h('div', { class: 'preview__shot', 'data-key': m.image });
    shots.set(m.image, shot);
    preview.append(shot);
    const trigger = h(
      'button',
      {
        type: 'button',
        class: 'milestone__link',
        'data-key': m.image,
        'aria-describedby': 'career-hint',
        'aria-expanded': 'false',
      },
      ...parts,
    );
    triggers.push(trigger);
    return h('li', { class: `milestone milestone--work${major}` }, trigger);
  });
  const list = h('ol', { class: 'milestones', 'aria-label': t.headline }, ...items);
  const scale = h('p', { class: 'career__scale' }, t.scale);
  const cont = button(copy.meta.continue, 'primary', '→');
  const actions = h('div', { class: 'actions' }, cont);

  const el = h(
    'section',
    { class: 'chapter career', 'data-theme': 'stone', 'aria-labelledby': 'career-title' },
    h(
      'div',
      { class: 'grid career__grid' },
      h('header', { class: 'col career__head' }, top, title.el, lede, hint),
      list,
      h('div', { class: 'career__foot' }, scale, actions),
    ),
    preview,
  );

  cont.addEventListener('click', () => ctx.next());

  /* --- Showing, placing and hiding the photograph --------------------------------------- */
  let shown: ImageKey | null = null;
  let pinned: HTMLButtonElement | null = null; // shown by focus or tap, anchored to an item
  let hideTimer = 0;

  const headerBottom = (): number =>
    document.querySelector('.hud')?.getBoundingClientRect().bottom ?? 0;

  /** Place the frame's top-left corner, kept inside the viewport and below the header. */
  function place(x: number, y: number): void {
    const w = preview.offsetWidth;
    const hgt = preview.offsetHeight;
    const minY = headerBottom() + 8;
    const left = Math.max(8, Math.min(x, window.innerWidth - w - 8));
    const topY = Math.max(minY, Math.min(y, window.innerHeight - hgt - 8));
    // Through GSAP, so the position and the entrance scale share one transform.
    gsap.set(preview, { x: Math.round(left), y: Math.round(topY) });
  }

  /**
   * Beside a milestone: right of it if there is room, else left; on narrow screens below it, or
   * above it when the milestone is near the bottom, so the photograph never covers its name.
   */
  function placeAtItem(trigger: HTMLElement): void {
    const r = trigger.getBoundingClientRect();
    const w = preview.offsetWidth;
    const hgt = preview.offsetHeight;
    if (r.right + GAP + w <= window.innerWidth - 8) place(r.right + GAP, r.top);
    else if (r.left - GAP - w >= 8) place(r.left - GAP - w, r.top);
    else if (r.bottom + 12 + hgt <= window.innerHeight - 8) place(r.left, r.bottom + 12);
    else if (r.top - 12 - hgt >= headerBottom() + 8) place(r.left, r.top - 12 - hgt);
    else place(r.left, r.bottom + 12);
  }

  function show(key: ImageKey): void {
    window.clearTimeout(hideTimer);
    triggers.forEach((b) => b.setAttribute('aria-expanded', String(b.dataset.key === key)));
    if (shown === key && preview.classList.contains('is-on')) return;
    shown = key;
    shots.forEach((s, k) => s.classList.toggle('is-current', k === key));
    if (!preview.classList.contains('is-on')) {
      preview.classList.add('is-on');
      if (reducedMotion()) gsap.set(preview, { opacity: 1 });
      else
        gsap.fromTo(
          preview,
          { opacity: 0, scale: 0.97 },
          { opacity: 1, scale: 1, duration: 0.25, ease: EASE.out, overwrite: true },
        );
    }
  }

  function hide(now = false): void {
    window.clearTimeout(hideTimer);
    const go = () => {
      shown = null;
      pinned = null;
      triggers.forEach((b) => b.setAttribute('aria-expanded', 'false'));
      preview.classList.remove('is-on');
      gsap.to(preview, {
        opacity: 0,
        duration: now || reducedMotion() ? 0 : 0.18,
        ease: EASE.out,
        overwrite: true,
      });
    };
    // A short grace period, so moving from one building to the next never flickers.
    if (now) go();
    else hideTimer = window.setTimeout(go, 90);
  }

  triggers.forEach((trigger) => {
    const key = trigger.dataset.key as ImageKey;

    trigger.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      pinned = null;
      show(key);
      placeAtItem(trigger);
    });
    trigger.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && !pinned) hide();
    });

    // Keyboard focus, not the focus a mouse press or tap also gives: anchored beside it.
    let pressed = false;
    trigger.addEventListener('pointerdown', () => {
      pressed = true;
    });
    trigger.addEventListener('focus', () => {
      if (pressed) {
        pressed = false;
        return;
      }
      pinned = trigger;
      show(key);
      placeAtItem(trigger);
    });
    trigger.addEventListener('blur', () => {
      if (pinned === trigger) hide();
    });

    // Touch (and Enter/Space): a tap toggles the photograph for this building.
    trigger.addEventListener('click', (e) => {
      const viaMouse = (e as PointerEvent).pointerType === 'mouse';
      if (viaMouse) return; // the mouse already sees it on hover
      if (pinned === trigger && shown === key) {
        hide(true);
        return;
      }
      pinned = trigger;
      show(key);
      placeAtItem(trigger);
    });
  });

  // A tap anywhere else, Escape, or scrolling the scene hides a pinned photograph.
  const onDocPointer = (e: PointerEvent): void => {
    if (!pinned) return;
    if ((e.target as Element).closest('.milestone__link')) return;
    hide(true);
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && shown) hide(true);
  };
  const onScroll = (): void => {
    if (pinned) placeAtItem(pinned);
    else if (shown) hide(true);
  };

  let prepared = false;

  return {
    id: 'career',
    theme: 'stone',
    el,
    prepare() {
      if (prepared) return;
      prepared = true;
      // Loaded with the scene, so a photograph is ready the moment it is asked for.
      shots.forEach((shot, key) =>
        shot.append(
          picture(key, {
            sizes: '(min-width: 64rem) 22rem, 70vw',
            eager: true,
            className: 'preview__picture',
          }),
        ),
      );
    },
    enter() {
      audio.setMood('stone');
      document.addEventListener('pointerdown', onDocPointer);
      document.addEventListener('keydown', onKey);
      el.addEventListener('scroll', onScroll, { passive: true });
      enterText([top, title.el, lede, hint, actions]);
      if (reducedMotion()) {
        gsap.fromTo([...items, scale], { opacity: 0 }, { opacity: 1, duration: 0.4 });
        return;
      }
      // Fifty years, in order, in about a second.
      gsap.fromTo(
        items,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: EASE.out, stagger: 0.1, delay: 0.25 },
      );
      gsap.fromTo(scale, { opacity: 0 }, { opacity: 1, duration: 0.7, delay: 1.2 });
    },
    leave() {
      document.removeEventListener('pointerdown', onDocPointer);
      document.removeEventListener('keydown', onKey);
      el.removeEventListener('scroll', onScroll);
      hide(true);
    },
    focusTarget: () => title.el,
  };
}
