/**
 * Chapter VI — Look closer. Six hotspots across two photographs (inside / outside).
 * Each opens a small card (a modal <dialog>) with verified facts and their sources.
 * The dialog traps focus, closes on Esc or a click outside, and returns focus to its hotspot.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy, facts, hotspotViews, hotspots, sources, type Hotspot } from '../content';
import { announce } from '../core/announcer';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { button, eyebrow, headline, introText } from '../core/ui';

type View = Hotspot['view'];

export function createDiscover(ctx: ChapterContext): Chapter {
  const t = copy.discover;

  const top = eyebrow('VI', t.eyebrow);
  const title = headline('h2', 'discover-title', t.headline);
  const body = h('p', { class: 'body' }, t.body);

  const viewButtons = (Object.keys(t.views) as View[]).map((v) =>
    h(
      'button',
      { type: 'button', class: 'tab', 'aria-pressed': String(v === 'interior'), 'data-view': v },
      t.views[v],
    ),
  );
  const tabs = h('div', { class: 'tabs', role: 'group', 'aria-label': t.eyebrow }, ...viewButtons);
  const progress = h('p', { class: 'note discover__progress' });
  const cont = button(copy.meta.continue, 'primary', '→');
  const actions = h('div', { class: 'spread__actions' }, cont);

  /* --- Photo frames with hotspots ------------------------------------- */
  const frames = {} as Record<View, { el: HTMLElement; media: HTMLElement }>;
  const seen = new Set<string>();
  const spotButtons = new Map<string, HTMLButtonElement>();

  (['interior', 'exterior'] as View[]).forEach((view) => {
    const media = h('div', { class: 'hotspots__media' });
    const el = h(
      'div',
      { class: 'hotspots__frame', 'data-view': view, hidden: view !== 'interior' },
      media,
    );
    hotspots
      .filter((spot) => spot.view === view)
      .forEach((spot, i) => {
        const btn = h(
          'button',
          {
            type: 'button',
            class: 'hotspot',
            style: `left:${spot.x}%;top:${spot.y}%;--delay:${i * 0.4}s`,
            'aria-haspopup': 'dialog',
          },
          h('span', { class: 'hotspot__ring', 'aria-hidden': 'true' }),
          h('span', { class: 'hotspot__dot', 'aria-hidden': 'true' }),
          h('span', { class: 'hotspot__label' }, spot.title),
        );
        btn.addEventListener('click', () => open(spot, btn));
        spotButtons.set(spot.id, btn);
        el.append(btn);
      });
    frames[view] = { el, media };
  });

  const figure = h('figure', { class: 'hotspots' }, frames.interior.el, frames.exterior.el);

  /* --- The card ----------------------------------------------------------- */
  const cardTitle = h('h3', { class: 'card__title', id: 'card-title' });
  const cardTag = h('p', { class: 'card__tag' }, t.legend);
  const cardBody = h('div', { class: 'card__body' });
  const cardSources = h('ul', { class: 'card__sources' });
  const close = h('button', { type: 'button', class: 'card__close', 'aria-label': t.close }, '×');
  const dialog = h(
    'dialog',
    { class: 'card', 'aria-labelledby': 'card-title', 'data-theme': 'stone' },
    close,
    cardTag,
    cardTitle,
    cardBody,
    h('p', { class: 'card__sources-label' }, t.sourcesLabel),
    cardSources,
  );
  let returnTo: HTMLElement | null = null;

  function open(spot: Hotspot, from: HTMLButtonElement): void {
    returnTo = from;
    const list = spot.facts.map((k) => facts[k]);
    cardTitle.textContent = spot.title;
    cardTag.hidden = !list.some((f) => 'legend' in f && f.legend);
    cardBody.replaceChildren(...list.map((f) => h('p', {}, f.text)));
    const keys = [...new Set(list.flatMap((f) => f.sources))];
    cardSources.replaceChildren(
      ...keys.map((k) =>
        h(
          'li',
          {},
          h('a', { href: sources[k].url, target: '_blank', rel: 'noopener' }, sources[k].label),
        ),
      ),
    );
    dialog.showModal();
    close.focus();
    if (!reducedMotion())
      gsap.fromTo(
        dialog,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: EASE.out },
      );
    audio.tick(1.2);

    seen.add(spot.id);
    from.classList.add('is-seen');
    renderProgress();
  }

  function renderProgress(): void {
    progress.textContent = t.seen(seen.size, hotspots.length);
  }

  close.addEventListener('click', () => dialog.close());
  // Click on the backdrop (outside the card's box) closes it.
  dialog.addEventListener('click', (e) => {
    const r = dialog.getBoundingClientRect();
    const inside =
      e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) dialog.close();
  });
  // Keep Tab inside the card (showModal already makes the page inert; this keeps focus off the browser chrome).
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = [...dialog.querySelectorAll<HTMLElement>('button, a[href]')];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('close', () => {
    returnTo?.focus();
    announce(progress.textContent ?? '');
  });

  /* --- View switching ------------------------------------------------------- */
  function setView(view: View): void {
    viewButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    (Object.keys(frames) as View[]).forEach((v) => {
      frames[v].el.hidden = v !== view;
    });
    if (!reducedMotion())
      gsap.fromTo(frames[view].el, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: EASE.soft });
  }
  viewButtons.forEach((b) => b.addEventListener('click', () => setView(b.dataset.view as View)));
  cont.addEventListener('click', () => ctx.next());

  renderProgress();

  const el = h(
    'section',
    { class: 'chapter paper discover', 'data-theme': 'stone', 'aria-labelledby': 'discover-title' },
    h(
      'div',
      { class: 'spread discover__spread' },
      h('div', { class: 'spread__text' }, top, title.el, body, tabs, progress),
      h('div', { class: 'spread__figure' }, figure),
      actions,
    ),
    dialog,
  );

  let prepared = false;

  return {
    id: 'discover',
    theme: 'stone',
    el,
    prepare() {
      if (prepared) return;
      prepared = true;
      (Object.keys(frames) as View[]).forEach((v) =>
        frames[v].media.append(
          picture(hotspotViews[v], { sizes: '(min-width: 60rem) 60vw, 100vw' }),
        ),
      );
    },
    enter() {
      audio.setMood('stone');
      introText(top, title.words, [body, tabs, progress, actions]);
      if (!reducedMotion()) {
        gsap.fromTo(
          figure,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 1.2, ease: EASE.out, delay: 0.3 },
        );
      }
    },
    leave() {
      if (dialog.open) dialog.close();
    },
    reset() {
      seen.clear();
      spotButtons.forEach((b) => b.classList.remove('is-seen'));
      renderProgress();
      setView('interior');
    },
    focusTarget: () => title.el,
  };
}
