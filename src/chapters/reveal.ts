/**
 * Chapter IV — Look up. The signature moment.
 * The eight-pier plan, first seen tilted as in the earlier drawings, rotates until we are
 * looking straight up from the centre of the floor. A beat of stillness, then the real
 * photograph opens from the centre outward beneath the line drawing.
 *
 * Alignment of the drawing over the photo is set in content.ts (`revealAlignment`).
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import {
  copy,
  principles,
  revealAlignment as align,
  revealAnnotations,
  numeralOf,
} from '../content';
import { createAnnotator, type Annotator } from '../core/annotate';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h, s } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { principleMark } from '../core/principles';
import { button, eyebrow, headline, revealWords } from '../core/ui';
import { stroke } from '../render/svg';

const SIZES = 'min(92vw, 78dvh)';

export function createReveal(ctx: ChapterContext): Chapter {
  const t = copy.reveal;

  const top = eyebrow(numeralOf('reveal'), t.eyebrow);
  const prompt = h('p', { class: 'lede reveal__prompt' }, t.prompt);
  const title = headline('h2', 'reveal-title', t.headline);
  title.el.classList.add('reveal__title');

  const toggle = h(
    'button',
    { type: 'button', class: 'switch', 'aria-pressed': 'false' },
    h('span', { class: 'switch__track', 'aria-hidden': 'true' }),
    t.toggleDrawing,
  );
  const cont = button(copy.meta.continue, 'primary', '→');
  // After the reveal: an optional, sequenced annotation pass linking the photo to the principles.
  const annoToggle = h(
    'button',
    { type: 'button', class: 'switch', 'aria-pressed': 'true' },
    h('span', { class: 'switch__track', 'aria-hidden': 'true' }),
    t.toggleAnnotations,
  );
  const note = h('div', { class: 'anno-note', 'aria-live': 'polite', hidden: true });
  const actions = h('div', { class: 'spread__actions' }, cont, annoToggle, toggle);

  const disc = h('div', { class: 'reveal__disc' });
  const drawing = buildDrawing();
  // Photo and drawing zoom together so the alignment holds during the slow Ken Burns move.
  const zoom = h('div', { class: 'reveal__zoom' }, disc, drawing.svg);
  const stage = h(
    'div',
    { class: 'reveal__stage' },
    h('p', { class: 'sr-only' }, t.figureLabel),
    zoom,
  );

  const el = h(
    'section',
    { class: 'chapter reveal', 'data-theme': 'night', 'aria-labelledby': 'reveal-title' },
    h(
      'div',
      { class: 'spread reveal__spread' },
      h('div', { class: 'spread__text' }, top, prompt, title.el, note),
      h(
        'figure',
        { class: 'spread__figure reveal__figure' },
        stage,
        h('figcaption', { class: 'reveal__caption' }, t.figcaption),
      ),
      actions,
    ),
  );

  let photo: HTMLPictureElement | null = null;
  let tl: gsap.core.Timeline | null = null;
  let kenBurns: gsap.core.Tween | null = null;
  let played = false;
  let showDrawing = false;
  let annotationsOn = true;
  let annot: Annotator | null = null;
  let sequence: gsap.core.Tween[] = [];

  const ensureAnnot = (): Annotator =>
    (annot ??= createAnnotator(
      disc,
      { width: 2550, height: 2550 },
      { labels: false, dim: 0.55, calibrate: revealAnnotations },
    ));

  /** Writes the text equivalent of the current annotation step. */
  function setNote(i: number | null): void {
    note.replaceChildren();
    if (i === null) {
      note.append(h('p', { class: 'anno-note__text' }, t.annotationsIntro));
      return;
    }
    const a = revealAnnotations[i];
    const name = a.principle ? ` · ${principles[a.principle].name}` : '';
    note.append(
      h(
        'p',
        { class: 'anno-note__label' },
        a.principle ? principleMark(a.principle, true) : null,
        h('span', {}, `${a.label}${name}`),
      ),
      h('p', { class: 'anno-note__text' }, a.text),
    );
  }

  function stopSequence(): void {
    sequence.forEach((c) => c.kill());
    sequence = [];
  }

  /** Steps through Structure → Light → Space, then leaves quiet outlines of all three. */
  function runAnnotations(): void {
    stopSequence();
    if (!annotationsOn) return;
    const a = ensureAnnot();
    note.hidden = false;
    revealAnnotations.forEach((step, i) => {
      sequence.push(
        gsap.delayedCall(i * 4.5, () => {
          a.show(step);
          setNote(i);
        }),
      );
    });
    sequence.push(
      gsap.delayedCall(revealAnnotations.length * 4.5 + 0.5, () => {
        a.outlineAll(revealAnnotations);
        setNote(null);
      }),
    );
  }

  function settleAnnotations(): void {
    stopSequence();
    if (!annotationsOn) return;
    note.hidden = false;
    ensureAnnot().outlineAll(revealAnnotations);
    setNote(null);
  }

  function finalState(): void {
    gsap.set(drawing.svg, { clearProps: 'transform', opacity: showDrawing ? 0.9 : 0 });
    gsap.set(drawing.strokes, { strokeDashoffset: 0 });
    gsap.set(disc, { clipPath: 'circle(75% at 50% 50%)', opacity: 1 });
    gsap.set([title.el, actions], { opacity: 1 });
    gsap.set(title.words, { opacity: 1, yPercent: 0 });
    settleAnnotations();
  }

  function play(): void {
    const reduced = reducedMotion();
    gsap.set(title.el, { opacity: 0 });
    gsap.set(actions, { opacity: 0 });
    gsap.set(drawing.strokes, { strokeDasharray: 1, strokeDashoffset: reduced ? 0 : 1 });

    if (reduced) {
      gsap.set(drawing.svg, { clearProps: 'transform', opacity: 1 });
      gsap.set(disc, { clipPath: 'circle(75% at 50% 50%)', opacity: 0 });
      tl = gsap
        .timeline()
        .to(disc, { opacity: 1, duration: 1.2 }, 1)
        .to(drawing.svg, { opacity: () => (showDrawing ? 0.9 : 0), duration: 1.2 }, 1.6)
        .to(title.el, { opacity: 1, duration: 0.6 }, 2.4)
        .to(actions, { opacity: 1, duration: 0.6 }, 2.6);
      tl.eventCallback('onComplete', runAnnotations);
      return;
    }

    gsap.set(disc, { clipPath: 'circle(0% at 50% 50%)', opacity: 1 });
    gsap.set(drawing.svg, {
      opacity: 1,
      transformPerspective: 1400,
      rotationX: 62,
      rotationZ: -45,
      scale: 0.72,
      transformOrigin: '50% 50%',
    });
    tl = gsap
      .timeline()
      // The plan is drawn, tilted as in the earlier axonometric views…
      .to(
        drawing.strokes,
        { strokeDashoffset: 0, duration: 1.6, stagger: 0.012, ease: EASE.inOut },
        0.2,
      )
      // …then the camera swings to look straight up.
      .to(drawing.svg, { rotationX: 0, rotationZ: 0, scale: 1, duration: 3, ease: EASE.inOut }, 1.6)
      // Stillness. Then the photograph opens from the centre.
      .call(() => audio.chime(196, 0.1), [], 5.2)
      .to(disc, { clipPath: 'circle(75% at 50% 50%)', duration: 3.2, ease: 'power2.inOut' }, 5.2)
      .to(drawing.svg, { opacity: 0.45, duration: 2, ease: EASE.soft }, 6)
      .to(
        drawing.svg,
        { opacity: () => (showDrawing ? 0.9 : 0), duration: 2.4, ease: EASE.soft },
        9,
      )
      .call(
        () => {
          gsap.set(title.el, { opacity: 1 });
          revealWords(title.words, 0, 1.6);
        },
        [],
        8,
      )
      .to(actions, { opacity: 1, duration: 1, ease: EASE.out }, 9.6);
    // The reveal itself stays untouched; the annotation pass begins only once it has finished.
    tl.eventCallback('onComplete', runAnnotations);

    kenBurns?.kill();
    kenBurns = gsap.fromTo(
      zoom,
      { scale: 1 },
      { scale: 1.06, duration: 40, ease: 'sine.inOut', delay: 6 },
    );
  }

  toggle.addEventListener('click', () => {
    showDrawing = !showDrawing;
    toggle.setAttribute('aria-pressed', String(showDrawing));
    gsap.to(drawing.svg, { opacity: showDrawing ? 0.9 : 0, duration: reducedMotion() ? 0 : 0.6 });
  });
  annoToggle.addEventListener('click', () => {
    annotationsOn = !annotationsOn;
    annoToggle.setAttribute('aria-pressed', String(annotationsOn));
    if (annotationsOn) runAnnotations();
    else {
      stopSequence();
      annot?.show(null);
      note.hidden = true;
    }
  });
  cont.addEventListener('click', () => ctx.next());

  return {
    id: 'reveal',
    theme: 'night',
    el,
    prepare() {
      if (photo) return;
      photo = picture('domeFromBelow', { sizes: SIZES, eager: true });
      photo.querySelector('img')?.setAttribute('fetchpriority', 'high');
      disc.append(photo);
    },
    enter() {
      audio.setMood('night');
      gsap.fromTo(
        [top, prompt],
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 1.2, ease: EASE.out, stagger: 0.2 },
      );
      if (!played) {
        played = true;
        play();
      } else {
        finalState();
      }
    },
    leave() {
      if (tl && tl.progress() < 1) tl.progress(1);
      stopSequence();
    },
    reset() {
      played = false;
      tl?.kill();
      kenBurns?.kill();
      stopSequence();
      annot?.show(null);
      note.hidden = true;
    },
    focusTarget: () => title.el,
  };
}

/* ------------------------------------------------------------------------ */

/** The eight-pier plan seen from directly below, in photo-relative units (0–1000). */
function buildDrawing(): { svg: SVGSVGElement; strokes: SVGPathElement[] } {
  const C = 500;
  const r = align.domeRadius * 1000;
  const svg = s('svg', {
    viewBox: '0 0 1000 1000',
    class: 'plan reveal__drawing',
    'aria-hidden': 'true',
  });
  const g = s(
    'g',
    {
      transform: `translate(${align.offsetX * 10} ${align.offsetY * 10}) rotate(${align.rotation} ${C} ${C}) translate(${C} ${C}) scale(${align.scale}) translate(${-C} ${-C})`,
    },
    svg,
  );
  const strokes: SVGPathElement[] = [];
  const circle = (rad: number): string =>
    `M${C - rad} ${C}a${rad} ${rad} 0 1 0 ${rad * 2} 0a${rad} ${rad} 0 1 0 ${-rad * 2} 0`;

  stroke(g, circle(r), 's-reveal', strokes);
  stroke(g, circle(r * 0.86), 's-reveal-fine', strokes);
  stroke(g, circle(r * 0.5), 's-reveal-fine', strokes);
  stroke(g, circle(r * 0.18), 's-reveal-fine', strokes);
  for (let i = 0; i < 32; i++) {
    const a = (i * Math.PI) / 16;
    const p0 = [C + r * 0.88 * Math.cos(a), C + r * 0.88 * Math.sin(a)];
    const p1 = [C + r * 0.97 * Math.cos(a), C + r * 0.97 * Math.sin(a)];
    stroke(g, `M${p0[0]} ${p0[1]}L${p1[0]} ${p1[1]}`, 's-reveal-fine', strokes);
  }
  // Octagon of eight piers; arches span between them over the dome rim.
  const rp = align.pierRadius * 1000;
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI / 8 + (i * Math.PI) / 4;
    return [C + rp * Math.cos(a), C + rp * Math.sin(a)];
  });
  stroke(g, `M${pts.map((p) => p.join(' ')).join('L')}Z`, 's-reveal', strokes);
  pts.forEach(([x, y], i) => {
    const a = ((Math.PI / 8 + (i * Math.PI) / 4) * 180) / Math.PI;
    const sq = 26;
    stroke(
      g,
      `M${x - sq} ${y - sq}h${sq * 2}v${sq * 2}h${-sq * 2}Z`,
      's-reveal s-reveal-pier',
      strokes,
    ).setAttribute('transform', `rotate(${a} ${x} ${y})`);
  });
  return { svg, strokes };
}
