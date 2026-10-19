/**
 * Scene 8 — Fifty years of architecture. After the three mosques, the scale of the rest: eight
 * milestones set as a typographic chronology, read left to right and top to bottom like a wall
 * of dates in an exhibition. Large years are the anchors; the three works of the previous scene
 * carry the accent, so the visitor finds them again among the others. Selimiye visibly comes
 * late, but not last. One sourced sentence on the scale of his work closes the scene.
 *
 * Each building can be seen in a small floating photograph:
 *  - Mouse: it emerges beside the cursor and follows it with a slight delay (GSAP quickTo on
 *    transforms only). It sits below-right of the pointer, flips left near the right edge and
 *    above near the bottom, and never goes under the header. Moving to the next building
 *    crossfades the photograph inside the same frame.
 *  - Keyboard: on focus, anchored beside the milestone.
 *  - Touch: a tap shows it beside the milestone; another tap, a tap elsewhere or Escape hides it.
 *  - Reduced motion: anchored beside the milestone, no entrance or following movement.
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

const GAP = 24; // px between a focused or tapped milestone and the photograph
const OFFSET = 28; // px between the cursor and the photograph's nearest corner
const EDGE = 12; // px kept free at the viewport's edges
const FOLLOW = 0.55; // s the photograph takes to catch up with the cursor

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

  /* --- The floating photograph: one reusable frame, one picture per building -------------- */
  // `preview` carries the position (x/y), `frame` the entrance (scale/opacity), so the two never
  // fight over one transform.
  const shots = new Map<ImageKey, HTMLElement>();
  const frame = h('div', { class: 'preview__frame' });
  const preview = h('div', { class: 'preview', 'aria-hidden': 'true' }, frame);

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
    frame.append(shot);
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

  /* --- Position ---------------------------------------------------------------------------- */
  let shown: ImageKey | null = null;
  let pinned: HTMLButtonElement | null = null; // shown by focus or tap, anchored to an item
  let following = false; // shown by the mouse, following the cursor
  let hideTimer = 0;
  // Measured once per appearance, so following the cursor reads no layout at all.
  let box = { w: 0, h: 0, minY: 0 };

  const measure = (): void => {
    box = {
      w: preview.offsetWidth,
      h: preview.offsetHeight,
      minY: (document.querySelector('.hud')?.getBoundingClientRect().bottom ?? 0) + EDGE,
    };
  };

  // Created in enter(), killed in leave().
  let toX: gsap.QuickToFunc | null = null;
  let toY: gsap.QuickToFunc | null = null;

  /** Keep a top-left corner inside the viewport and below the header. */
  function clamp(x: number, y: number): [number, number] {
    const maxX = window.innerWidth - box.w - EDGE;
    const maxY = window.innerHeight - box.h - EDGE;
    return [
      Math.round(Math.max(EDGE, Math.min(x, maxX))),
      Math.round(Math.max(box.minY, Math.min(y, maxY))),
    ];
  }

  /** Move there: gliding when following or switching, at once on a fresh appearance. */
  function moveTo(x: number, y: number, glide: boolean): void {
    if (!toX || !toY) gsap.set(preview, { x, y });
    else if (glide) {
      toX(x);
      toY(y);
    } else {
      // Start and end at the same point: a jump that the running follow tweens respect.
      toX(x, x);
      toY(y, y);
    }
  }

  /**
   * Beside the cursor: below-right of it by default; left of it near the right edge, above it
   * near the bottom. The photograph grows out of the corner nearest the cursor.
   */
  let cursor = { x: 0, y: 0 };
  function placeAtCursor(cx: number, cy: number, glide: boolean): void {
    cursor = { x: cx, y: cy };
    const left = cx + OFFSET + box.w > window.innerWidth - EDGE;
    const up = cy + OFFSET + box.h > window.innerHeight - EDGE && cy - OFFSET - box.h >= box.minY;
    frame.style.transformOrigin = `${left ? 'right' : 'left'} ${up ? 'bottom' : 'top'}`;
    const [x, y] = clamp(
      left ? cx - OFFSET - box.w : cx + OFFSET,
      up ? cy - OFFSET - box.h : cy + OFFSET,
    );
    moveTo(x, y, glide);
  }

  /**
   * Beside a milestone (keyboard, touch, reduced motion): right of it if there is room, else
   * left; on narrow screens below it, or above it near the bottom, never over its name.
   */
  function placeAtItem(trigger: HTMLElement, glide: boolean): void {
    const r = trigger.getBoundingClientRect();
    const { w, h: hgt, minY } = box;
    let x = r.left;
    let y = r.bottom + 12;
    if (r.right + GAP + w <= window.innerWidth - EDGE) [x, y] = [r.right + GAP, r.top];
    else if (r.left - GAP - w >= EDGE) [x, y] = [r.left - GAP - w, r.top];
    else if (r.bottom + 12 + hgt > window.innerHeight - EDGE && r.top - 12 - hgt >= minY)
      y = r.top - 12 - hgt;
    frame.style.transformOrigin = 'center';
    const [cx, cy] = clamp(x, y);
    moveTo(cx, cy, glide && !reducedMotion());
  }

  /* --- Showing and hiding ------------------------------------------------------------------ */
  const isOn = (): boolean => preview.classList.contains('is-on');

  /**
   * Put this building's photograph in the frame. Switching, the new one fades in on top and the
   * previous ones leave only once it covers them, so the frame is never blank. A fresh
   * appearance swaps at once, so the last building never shows beneath the new one.
   */
  function swap(key: ImageKey, instant: boolean): void {
    const next = shots.get(key);
    if (!next) return;
    const all = [...shots.values()];
    all.forEach((s) => s.classList.toggle('is-current', s === next));
    gsap.killTweensOf(all, 'opacity');
    if (instant || reducedMotion()) {
      all.forEach((s) => gsap.set(s, { opacity: s === next ? 1 : 0 }));
      return;
    }
    gsap.fromTo(
      next,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.24,
        ease: 'power2.out',
        onComplete: () => all.forEach((s) => s !== next && gsap.set(s, { opacity: 0 })),
      },
    );
  }

  /** Show this building's photograph; returns true if the frame was hidden until now. */
  function show(key: ImageKey): boolean {
    window.clearTimeout(hideTimer);
    triggers.forEach((b) => b.setAttribute('aria-expanded', String(b.dataset.key === key)));
    const fresh = !isOn();
    if (fresh) measure();
    if (shown !== key || fresh) swap(key, fresh);
    shown = key;
    preview.classList.add('is-on');
    return fresh;
  }

  /** Entrance, after the frame has been put in place. */
  function emerge(): void {
    if (reducedMotion()) gsap.set(frame, { opacity: 1, scale: 1 });
    else
      gsap.fromTo(
        frame,
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out', overwrite: true },
      );
  }

  function hide(now = false): void {
    window.clearTimeout(hideTimer);
    const go = (): void => {
      shown = null;
      pinned = null;
      following = false;
      triggers.forEach((b) => b.setAttribute('aria-expanded', 'false'));
      preview.classList.remove('is-on');
      gsap.to(frame, {
        opacity: 0,
        scale: reducedMotion() ? 1 : 0.97,
        duration: now || reducedMotion() ? 0 : 0.22,
        ease: 'power2.out',
        overwrite: true,
      });
    };
    // A short grace period, so crossing the gap to the next building never flickers.
    if (now) go();
    else hideTimer = window.setTimeout(go, 90);
  }

  /* --- Input -------------------------------------------------------------------------------- */
  triggers.forEach((trigger) => {
    const key = trigger.dataset.key as ImageKey;

    trigger.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      pinned = null;
      const fresh = show(key);
      if (reducedMotion()) {
        following = false;
        placeAtItem(trigger, false);
      } else {
        following = true;
        placeAtCursor(e.clientX, e.clientY, !fresh);
      }
      if (fresh) emerge();
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
      following = false;
      const fresh = show(key);
      placeAtItem(trigger, !fresh);
      if (fresh) emerge();
    });
    trigger.addEventListener('blur', () => {
      if (pinned === trigger) hide();
    });

    // Touch (and Enter/Space): a tap toggles the photograph for this building.
    trigger.addEventListener('click', (e) => {
      if ((e as PointerEvent).pointerType === 'mouse') return; // the mouse sees it on hover
      if (pinned === trigger && shown === key) {
        hide(true);
        return;
      }
      pinned = trigger;
      following = false;
      const fresh = show(key);
      placeAtItem(trigger, !fresh);
      if (fresh) emerge();
    });
  });

  // One move handler for the whole list, attached only while the scene is on screen.
  const onMove = (e: PointerEvent): void => {
    if (following && e.pointerType === 'mouse') placeAtCursor(e.clientX, e.clientY, true);
  };
  // A tap anywhere else, Escape or scrolling hides the photograph.
  const onDocPointer = (e: PointerEvent): void => {
    if (!pinned) return;
    if ((e.target as Element).closest('.milestone__link')) return;
    hide(true);
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && shown) hide(true);
  };
  const onScroll = (): void => {
    if (pinned) placeAtItem(pinned, false);
    else if (shown) hide(true);
  };
  // Resizing keeps it, re-measured and back inside the new viewport.
  const onResize = (): void => {
    if (!shown) return;
    measure();
    if (pinned || !following) {
      const anchor = pinned ?? triggers.find((b) => b.dataset.key === shown);
      if (anchor) placeAtItem(anchor, false);
    } else placeAtCursor(cursor.x, cursor.y, false);
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
            sizes: '(min-width: 64rem) 24rem, 70vw',
            eager: true,
            className: 'preview__picture',
          }),
        ),
      );
    },
    enter() {
      audio.setMood('stone');
      toX = gsap.quickTo(preview, 'x', { duration: FOLLOW, ease: 'power3.out' });
      toY = gsap.quickTo(preview, 'y', { duration: FOLLOW, ease: 'power3.out' });
      list.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerdown', onDocPointer);
      document.addEventListener('keydown', onKey);
      el.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
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
      list.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerdown', onDocPointer);
      document.removeEventListener('keydown', onKey);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      hide(true);
      gsap.killTweensOf(preview);
      toX = toY = null;
    },
    focusTarget: () => title.el,
  };
}
