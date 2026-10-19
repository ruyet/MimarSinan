/**
 * Sources & credits — every photograph (author, license, source) and every textual source,
 * generated from content.ts so it can never drift out of sync.
 */
import { audio } from '../audio/audio';
import { copy, images, sources } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { button, enterText, title as makeTitle } from '../core/ui';

export function createCredits(ctx: ChapterContext): Chapter {
  const t = copy.credits;

  const title = makeTitle('h2', 'credits-title', t.headline);
  const intro = h('p', { class: 'text credits__intro' }, t.intro);

  const link = (href: string, text: string, label?: string) =>
    h('a', { href, target: '_blank', rel: 'noopener', 'aria-label': label }, text);

  const imageList = h(
    'ul',
    { class: 'credits__list' },
    ...Object.values(images).map((img) =>
      h(
        'li',
        {},
        h('span', { class: 'credits__item-title' }, img.credit.title),
        h(
          'span',
          { class: 'credits__meta' },
          `${img.credit.author} · `,
          link(
            img.credit.licenseUrl,
            img.credit.license,
            `${img.credit.license} license, for “${img.credit.title}”`,
          ),
          ' · ',
          link(
            img.credit.sourceUrl,
            'Wikimedia Commons',
            `“${img.credit.title}” on Wikimedia Commons`,
          ),
        ),
        'modified' in img.credit
          ? h('span', { class: 'credits__meta' }, `Modified: ${img.credit.modified}`)
          : null,
      ),
    ),
  );

  const sourceList = h(
    'ul',
    { class: 'credits__list' },
    ...Object.values(sources).map((src) => h('li', {}, link(src.url, src.label))),
  );

  const back = button(t.back, 'ghost', '←');
  const restart = button(t.restart, 'primary', '↺');

  const el = h(
    'section',
    { class: 'chapter credits', 'data-theme': 'stone', 'aria-labelledby': 'credits-title' },
    h(
      'div',
      { class: 'credits__inner' },
      title.el,
      intro,
      h('p', { class: 'small' }, t.model),
      h('h3', { class: 'credits__heading' }, t.imagesTitle),
      imageList,
      h('h3', { class: 'credits__heading' }, t.sourcesTitle),
      sourceList,
      h('div', { class: 'credits__actions' }, restart, back),
    ),
  );

  back.addEventListener('click', () => ctx.goTo('epilogue'));
  restart.addEventListener('click', () => ctx.restart());

  return {
    id: 'credits',
    theme: 'stone',
    el,
    enter() {
      audio.setMood(null);
      enterText([title.el, intro]);
    },
    leave() {},
    focusTarget: () => title.el,
  };
}
