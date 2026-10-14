/**
 * Chapter VII — A tradition, refined.
 * Not a competition but a lineage: Hagia Sophia (two great half-domes, a long hall) →
 * Sinan's Şehzade (four half-domes) → Süleymaniye (two half-domes) → Selimiye (eight piers,
 * one centred space). Four plans in one plate; a tab list (arrow keys, Home/End) steps through.
 * Sinan's own words "apprentice / journeyman / master" sit on the three plans they belong to.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy, numeralOf } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { button, eyebrow, headline, introText } from '../core/ui';
import { drawPlan, type PlanId } from '../render/plans';

export function createMasterwork(ctx: ChapterContext): Chapter {
  const t = copy.masterwork;

  const top = eyebrow(numeralOf('masterwork'), t.eyebrow);
  const title = headline('h2', 'masterwork-title', t.headline);
  const body = h('p', { class: 'body' }, t.body);

  /* --- Tabs: one per plan, each with a small thumbnail -------------------- */
  const tabs = t.plans.map((p, i) => {
    const thumb = drawPlan(p.id as PlanId, '');
    thumb.svg.removeAttribute('role');
    thumb.svg.setAttribute('aria-hidden', 'true');
    thumb.svg.classList.add('lineage__thumb');
    return h(
      'button',
      {
        type: 'button',
        role: 'tab',
        id: `lineage-tab-${p.id}`,
        class: 'lineage__tab',
        'aria-selected': String(i === 0),
        'aria-controls': 'lineage-panel',
        tabindex: i === 0 ? '0' : '-1',
      },
      thumb.svg,
      h('span', { class: 'lineage__year' }, p.year),
      h('span', { class: 'lineage__name' }, p.name),
    );
  });
  const tablist = h(
    'div',
    { class: 'lineage__tabs', role: 'tablist', 'aria-label': t.stepLabel },
    ...tabs,
  );

  /* --- The plate: the current plan, large, with its caption and story ---- */
  const art = h('div', { class: 'lineage__art' });
  const capName = h('span', { class: 'lineage__cap-name' });
  const capSub = h('span', {});
  const role = h('p', { class: 'lineage__role' });
  const text = h('p', { class: 'body lineage__text' });
  const claim = h('p', { class: 'callout lineage__claim', hidden: true }, t.claim);
  const panel = h(
    'div',
    { class: 'lineage__panel', role: 'tabpanel', id: 'lineage-panel', tabindex: '0' },
    h(
      'figure',
      { class: 'plate lineage__plate' },
      art,
      h('figcaption', { class: 'plate__caption' }, t.figcaption, ' · ', capName, ': ', capSub),
    ),
    h('div', { class: 'lineage__story' }, role, text, claim),
  );

  const cont = button(copy.meta.continue, 'primary', '→');

  const el = h(
    'section',
    {
      class: 'chapter paper masterwork',
      'data-theme': 'stone',
      'aria-labelledby': 'masterwork-title',
    },
    h(
      'div',
      { class: 'lineage' },
      h(
        'div',
        { class: 'lineage__head' },
        top,
        title.el,
        body,
        tablist,
        h('p', { class: 'note' }, t.stagesNote),
        h('div', { class: 'lineage__actions' }, cont),
      ),
      panel,
    ),
  );

  let index = 0;

  function select(i: number, animate = true): void {
    index = i;
    const p = t.plans[i];
    tabs.forEach((tab, j) => {
      tab.setAttribute('aria-selected', String(j === i));
      tab.tabIndex = j === i ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `lineage-tab-${p.id}`);
    const plan = drawPlan(p.id as PlanId, p.label, true);
    art.replaceChildren(plan.svg);
    capName.textContent = p.name;
    capSub.textContent = p.sub;
    role.textContent = p.role;
    text.textContent = p.text;
    claim.hidden = p.id !== 'selimiye';
    if (animate && !reducedMotion()) {
      gsap.fromTo(
        plan.strokes,
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.4, ease: EASE.inOut, stagger: 0.015 },
      );
      gsap.fromTo(
        [role, text],
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.8, ease: EASE.out, stagger: 0.1 },
      );
    }
    if (animate) audio.tick(0.9 + i * 0.1);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      const last = tabs.length - 1;
      const next =
        e.key === 'ArrowRight' || e.key === 'ArrowDown'
          ? (i + 1) % tabs.length
          : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
            ? (i - 1 + tabs.length) % tabs.length
            : e.key === 'Home'
              ? 0
              : e.key === 'End'
                ? last
                : -1;
      if (next < 0) return;
      e.preventDefault();
      tabs[next].focus();
      select(next);
    });
  });
  cont.addEventListener('click', () => ctx.next());

  select(0, false);

  return {
    id: 'masterwork',
    theme: 'stone',
    el,
    enter() {
      audio.setMood('stone');
      introText(top, title.words, [body, tablist]);
      select(index, true);
    },
    leave() {},
    reset() {
      select(0, false);
    },
    focusTarget: () => title.el,
  };
}
