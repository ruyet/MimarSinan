/**
 * Chapter VII — The masterwork.
 * Two plans in the same line-art style: Hagia Sophia (four piers + two great half-domes →
 * a long, directional space) and Selimiye (eight piers + four small corner half-domes →
 * one centred space). Then Sinan's own three stages: apprentice, journeyman, master.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h, s } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { button, eyebrow, headline, introText } from '../core/ui';
import { label, stroke } from '../render/svg';

const W = 400;
const H = 300;
const CX = W / 2;
const CY = H / 2;

export function createMasterwork(ctx: ChapterContext): Chapter {
  const t = copy.masterwork;

  const top = eyebrow('VII', t.eyebrow);
  const title = headline('h2', 'masterwork-title', t.headline);
  const body = h('p', { class: 'body' }, t.body);

  const hagia = planFigure(t.hagia, drawHagia);
  const selimiye = planFigure(t.selimiye, drawSelimiye);
  const compare = h('div', { class: 'compare' }, hagia.figure, selimiye.figure);

  const stages = h(
    'ol',
    { class: 'stages' },
    ...t.stages.map((st, i) =>
      h(
        'li',
        { class: `career${i === 2 ? ' career--master' : ''}` },
        stageMark(i),
        h('p', { class: 'career__year' }, st.year),
        h('p', { class: 'career__name' }, st.name),
        h('p', { class: 'career__role' }, st.role),
      ),
    ),
  );
  const stagesBlock = h(
    'section',
    { class: 'stages-block', 'aria-labelledby': 'stages-title' },
    h('h3', { class: 'stages-block__title', id: 'stages-title' }, t.stagesTitle),
    stages,
    h('p', { class: 'note' }, t.stagesNote),
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
      { class: 'masterwork__inner' },
      h('div', { class: 'masterwork__head' }, top, title.el, body),
      compare,
      stagesBlock,
      h('div', { class: 'masterwork__actions' }, cont),
    ),
  );

  cont.addEventListener('click', () => ctx.next());

  return {
    id: 'masterwork',
    theme: 'stone',
    el,
    enter() {
      audio.setMood('stone');
      introText(top, title.words, [body]);
      const all = [...hagia.strokes, ...selimiye.strokes];
      if (reducedMotion()) {
        gsap.set(all, { strokeDasharray: 1, strokeDashoffset: 0 });
        gsap.fromTo([compare, stagesBlock], { opacity: 0 }, { opacity: 1, duration: 0.6 });
        return;
      }
      gsap
        .timeline()
        .fromTo(
          [compare, stagesBlock],
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 1.1, ease: EASE.out, stagger: 0.3 },
          0.5,
        )
        .fromTo(
          all,
          { strokeDasharray: 1, strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.8, ease: EASE.inOut, stagger: 0.02 },
          0.6,
        );
    },
    leave() {},
    focusTarget: () => title.el,
  };
}

/* ------------------------------------------------------------------------ */

interface PlanCopy {
  name: string;
  sub: string;
  caption: string;
  dome: string;
  label: string;
}

function planFigure(
  c: PlanCopy,
  draw: (svg: SVGSVGElement, strokes: SVGPathElement[], c: PlanCopy) => void,
) {
  const svg = s('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'plan compare__plan',
    role: 'img',
    'aria-label': c.label,
  });
  const strokes: SVGPathElement[] = [];
  draw(svg, strokes, c);
  const figure = h(
    'figure',
    { class: 'compare__item' },
    h('p', { class: 'compare__name' }, c.name),
    h('p', { class: 'compare__sub' }, c.sub),
    h('div', { class: 'compare__art' }, svg),
    h('figcaption', {}, c.caption),
  );
  return { figure, strokes };
}

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

/** Hagia Sophia, schematic: central dome on four piers, half-domes east and west. */
function drawHagia(svg: SVGSVGElement, strokes: SVGPathElement[], c: PlanCopy): void {
  const r = 62;
  // The space it makes: long and directional.
  s('ellipse', { cx: CX, cy: CY, rx: r * 2.6, ry: r * 0.95, class: 'compare__space' }, svg);
  stroke(svg, `M${CX - 186} ${CY - 92}h372v184h-372Z`, 's-wall', strokes);
  stroke(svg, circle(CX, CY, r), 's-dome', strokes);
  stroke(svg, `M${CX - r} ${CY - r}A${r} ${r} 0 0 0 ${CX - r} ${CY + r}`, 's-half', strokes);
  stroke(svg, `M${CX + r} ${CY - r}A${r} ${r} 0 0 1 ${CX + r} ${CY + r}`, 's-half', strokes);
  [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].forEach(([sx, sy]) => {
    const x = CX + sx * r;
    const y = CY + sy * r;
    stroke(svg, `M${x - 11} ${y - 11}h22v22h-22Z`, 's-pier-fill', strokes);
  });
  // Direction: a long axis arrow.
  stroke(
    svg,
    `M${CX - 170} ${CY}H${CX + 170}M${CX + 160} ${CY - 6}L${CX + 170} ${CY}L${CX + 160} ${CY + 6}M${CX - 160} ${CY - 6}L${CX - 170} ${CY}L${CX - 160} ${CY + 6}`,
    's-axis',
    strokes,
  );
  label(svg, c.dome, CX, CY + 92 + 22, 'annot annot--italic', {
    'text-anchor': 'middle',
  });
}

/** Selimiye, schematic: one dome on an octagon of eight piers, small corner half-domes, mihrab apse. */
function drawSelimiye(svg: SVGSVGElement, strokes: SVGPathElement[], c: PlanCopy): void {
  const hx = 150;
  const hy = 120; // 45 × 36 m
  const r = (15.5 / 22.5) * hx; // dome ≈ 31 m in a 45 m hall
  // The space it makes: one centred room.
  s('circle', { cx: CX, cy: CY, r: r * 1.08, class: 'compare__space' }, svg);
  stroke(svg, `M${CX - hx} ${CY - hy}h${hx * 2}v${hy * 2}h${-hx * 2}Z`, 's-wall', strokes);
  // Mihrab apse on the qibla wall.
  stroke(svg, `M${CX - 14} ${CY - hy}v-12a14 14 0 0 1 28 0v12`, 's-wall-inner', strokes);
  stroke(svg, circle(CX, CY, r), 's-dome', strokes);
  const rp = r / Math.cos(Math.PI / 8);
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI / 8 + (i * Math.PI) / 4;
    return [CX + rp * Math.cos(a), CY + rp * Math.sin(a)] as const;
  });
  // Four small corner half-domes, on the diagonal sides of the octagon.
  [1, 3, 5, 7].forEach((k) => {
    const a = (k * Math.PI) / 4;
    const mx = CX + r * Math.cos(a);
    const my = CY + r * Math.sin(a);
    const hr = 22;
    const ax = mx + hr * Math.cos(a + Math.PI / 2);
    const ay = my + hr * Math.sin(a + Math.PI / 2);
    const bx = mx - hr * Math.cos(a + Math.PI / 2);
    const by = my - hr * Math.sin(a + Math.PI / 2);
    stroke(
      svg,
      `M${ax.toFixed(1)} ${ay.toFixed(1)}A${hr} ${hr} 0 0 0 ${bx.toFixed(1)} ${by.toFixed(1)}`,
      's-half',
      strokes,
    );
  });
  pts.forEach(([x, y], i) => {
    const a = ((Math.PI / 8 + (i * Math.PI) / 4) * 180) / Math.PI;
    stroke(svg, `M${x - 8} ${y - 8}h16v16h-16Z`, 's-pier-fill', strokes).setAttribute(
      'transform',
      `rotate(${a.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`,
    );
  });
  // Direction: gathered to the centre.
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const p0 = [CX + r * 0.78 * Math.cos(a), CY + r * 0.78 * Math.sin(a)];
    const p1 = [CX + r * 0.35 * Math.cos(a), CY + r * 0.35 * Math.sin(a)];
    stroke(
      svg,
      `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`,
      's-axis',
      strokes,
    );
  }
  label(svg, c.dome, CX, CY + 5, 'annot annot--italic annot--halo', { 'text-anchor': 'middle' });
}

/** Small marks for the three stages: a sketch, a drawing, a finished dome on eight piers. */
function stageMark(i: number): SVGSVGElement {
  const svg = s('svg', {
    viewBox: '0 0 120 80',
    class: 'plan career__mark',
    'aria-hidden': 'true',
  });
  const base = 'M10 70H110';
  if (i === 0) {
    s('path', { d: base, class: 'stroke s-construction' }, svg);
    s('path', { d: 'M28 70A32 32 0 0 1 92 70', class: 'stroke s-construction' }, svg);
    s('path', { d: 'M60 70V30M28 70L60 38L92 70', class: 'stroke s-construction' }, svg);
  } else if (i === 1) {
    s('path', { d: base, class: 'stroke s-wall-inner' }, svg);
    s('path', { d: 'M30 70A30 30 0 0 1 90 70', class: 'stroke s-dome' }, svg);
    s('path', { d: 'M60 40V28', class: 'stroke s-dome' }, svg);
    s('path', { d: 'M18 70V56M102 70V56', class: 'stroke s-wall-inner' }, svg);
  } else {
    s('path', { d: base, class: 'stroke s-wall' }, svg);
    s('path', { d: 'M28 62A32 32 0 0 1 92 62Z', class: 'stroke s-dome dome-fill' }, svg);
    s('path', { d: 'M60 30V18', class: 'stroke s-dome' }, svg);
    s(
      'path',
      { d: 'M24 70V62M38 70V62M52 70V62M68 70V62M82 70V62M96 70V62', class: 'stroke s-wall-inner' },
      svg,
    );
    s(
      'path',
      { d: 'M36 50l4 4M48 42l2 5M60 39v5M72 42l-2 5M84 50l-4 4', class: 'stroke s-plumb' },
      svg,
    );
  }
  return svg;
}
