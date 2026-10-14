/**
 * Chapter VI — Look closer. Six hotspots across two photographs (inside / outside).
 * Selecting one darkens the photo except that area and outlines it (the same annotation system
 * as chapter V); the explanation appears beside the photo in a margin panel, with its principle,
 * verified facts and sources. The panel is not modal — nothing covers the photo. Focus moves
 * to the panel heading; Esc or Close returns focus to the hotspot.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import {
  copy,
  facts,
  hotspotViews,
  hotspots,
  images,
  numeralOf,
  principles,
  sources,
  type Hotspot,
} from '../content';
import { createAnnotator, type Annotator } from '../core/annotate';
import { announce } from '../core/announcer';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { principleMark } from '../core/principles';
import { button, eyebrow, headline, introText } from '../core/ui';

type View = Hotspot['view'];

export function createDiscover(ctx: ChapterContext): Chapter {
  const t = copy.discover;

  const top = eyebrow(numeralOf('discover'), t.eyebrow);
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

  /* --- Photo frames with hotspots ------------------------------------- */
  const frames = {} as Record<
    View,
    { el: HTMLElement; media: HTMLElement; annot: Annotator | null }
  >;
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
            'aria-controls': 'discover-panel',
            'aria-expanded': 'false',
          },
          h('span', { class: 'hotspot__ring', 'aria-hidden': 'true' }),
          h('span', { class: 'hotspot__dot', 'aria-hidden': 'true' }),
          h('span', { class: 'hotspot__label' }, spot.title),
        );
        btn.addEventListener('click', () => open(spot, btn));
        spotButtons.set(spot.id, btn);
        el.append(btn);
      });
    frames[view] = { el, media, annot: null };
  });

  const figure = h(
    'figure',
    { class: 'hotspots plate' },
    frames.interior.el,
    frames.exterior.el,
    h('figcaption', { class: 'plate__caption' }, t.figcaption),
  );

  /* --- The margin panel ------------------------------------------------- */
  const panelTitle = h('h3', { class: 'panel__title', id: 'panel-title', tabindex: '-1' });
  const panelTags = h('div', { class: 'panel__tags' });
  const panelBody = h('div', { class: 'panel__body' });
  const panelSources = h('ul', { class: 'card__sources' });
  const sourcesLabel = h('p', { class: 'card__sources-label' }, t.sourcesLabel);
  const close = h('button', { type: 'button', class: 'panel__close', 'aria-label': t.close }, '×');
  const empty = h('p', { class: 'panel__empty' }, t.panelEmpty);
  const panelContent = h(
    'div',
    { class: 'panel__content', hidden: true },
    close,
    panelTags,
    panelTitle,
    panelBody,
    sourcesLabel,
    panelSources,
  );
  const panel = h(
    'aside',
    {
      class: 'panel',
      id: 'discover-panel',
      'aria-labelledby': 'panel-title',
      'aria-live': 'polite',
    },
    empty,
    panelContent,
  );

  let active: { spot: Hotspot; btn: HTMLButtonElement } | null = null;

  function open(spot: Hotspot, btn: HTMLButtonElement): void {
    active?.btn.setAttribute('aria-expanded', 'false');
    active?.btn.classList.remove('is-active');
    active = { spot, btn };
    btn.setAttribute('aria-expanded', 'true');
    btn.classList.add('is-active');

    // The photo shows where…
    frames[spot.view].annot?.show(spot.annotation);

    // …the margin explains why.
    const list = spot.facts.map((k) => facts[k]);
    const p = spot.annotation.principle;
    panelTags.replaceChildren(
      ...(p
        ? [h('span', { class: 'panel__principle' }, principleMark(p, true), principles[p].name)]
        : []),
      ...(list.some((f) => 'legend' in f && f.legend)
        ? [h('span', { class: 'card__tag' }, t.legend)]
        : []),
    );
    panelTitle.textContent = spot.title;
    panelBody.replaceChildren(...list.map((f) => h('p', {}, f.text)));
    const keys = [...new Set(list.flatMap((f) => f.sources))];
    panelSources.replaceChildren(
      ...keys.map((k) =>
        h(
          'li',
          {},
          h('a', { href: sources[k].url, target: '_blank', rel: 'noopener' }, sources[k].label),
        ),
      ),
    );
    empty.hidden = true;
    panelContent.hidden = false;
    panelTitle.focus({ preventScroll: true });
    if (window.matchMedia('(max-width: 74.99rem)').matches) {
      panel.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
    }
    if (!reducedMotion()) {
      gsap.fromTo(
        panelContent,
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: 0.6, ease: EASE.out },
      );
    }
    audio.tick(1.2);

    seen.add(spot.id);
    btn.classList.add('is-seen');
    renderProgress();
  }

  function closePanel(returnFocus = true): void {
    if (!active) return;
    const { spot, btn } = active;
    frames[spot.view].annot?.show(null);
    btn.setAttribute('aria-expanded', 'false');
    btn.classList.remove('is-active');
    active = null;
    panelContent.hidden = true;
    empty.hidden = false;
    if (returnFocus) {
      btn.focus();
      announce(progress.textContent ?? '');
    }
  }

  function renderProgress(): void {
    progress.textContent = t.seen(seen.size, hotspots.length);
  }

  close.addEventListener('click', () => closePanel());
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  /* --- View switching ------------------------------------------------------- */
  function setView(view: View): void {
    if (active && active.spot.view !== view) closePanel(false);
    viewButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    (Object.keys(frames) as View[]).forEach((v) => {
      frames[v].el.hidden = v !== view;
    });
    frames[view].annot?.update();
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
      { class: 'discover__layout' },
      h(
        'div',
        { class: 'discover__text' },
        top,
        title.el,
        body,
        tabs,
        progress,
        h('div', { class: 'discover__actions' }, cont),
      ),
      h('div', { class: 'discover__figure' }, figure),
      panel,
    ),
  );

  let prepared = false;

  return {
    id: 'discover',
    theme: 'stone',
    el,
    prepare() {
      if (prepared) return;
      prepared = true;
      (Object.keys(frames) as View[]).forEach((v) => {
        frames[v].media.append(
          picture(hotspotViews[v], { sizes: '(min-width: 60rem) 60vw, 100vw' }),
        );
        frames[v].annot = createAnnotator(frames[v].media, images[hotspotViews[v]], {
          labels: false,
          calibrate: hotspots.filter((s) => s.view === v).map((s) => s.annotation),
        });
      });
    },
    enter() {
      audio.setMood('stone');
      introText(top, title.words, [body, tabs, progress]);
      if (!reducedMotion()) {
        gsap.fromTo(
          figure,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 1.2, ease: EASE.out, delay: 0.3 },
        );
        gsap.fromTo(
          panel,
          { opacity: 0 },
          { opacity: 1, duration: 1, ease: EASE.soft, delay: 0.8 },
        );
      }
    },
    leave() {
      closePanel(false);
    },
    reset() {
      closePanel(false);
      seen.clear();
      spotButtons.forEach((b) => b.classList.remove('is-seen'));
      renderProgress();
      setView('interior');
    },
    focusTarget: () => title.el,
  };
}
