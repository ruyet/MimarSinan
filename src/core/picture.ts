/**
 * Responsive photos: <picture> with AVIF → WebP → JPEG sources at 800/1600/2400 px.
 * Pictures are created lazily (from a chapter's `prepare()`), never at page load.
 */
import { images, type ImageKey } from '../content';
import { h } from './dom';

const WIDTHS = [800, 1600, 2400];

const srcset = (base: string, ext: string): string =>
  WIDTHS.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');

export interface PictureOptions {
  sizes?: string;
  className?: string;
  eager?: boolean;
  /** CSS object-position, e.g. '35% 50%'. */
  position?: string;
  /** Override the alt text (e.g. '' when a caption already describes it). */
  alt?: string;
  /** Use the transparent "-cutout" rendition (AVIF/WebP with alpha; see optimize-images.mjs). */
  cutout?: boolean;
}

export function picture(key: ImageKey, opts: PictureOptions = {}): HTMLPictureElement {
  const img = images[key];
  const base = opts.cutout ? `${img.src}-cutout` : img.src;
  const fallback = opts.cutout ? 'webp' : 'jpg';
  const sizes = opts.sizes ?? '100vw';
  const el = h(
    'picture',
    { class: opts.className },
    h('source', { type: 'image/avif', srcset: srcset(base, 'avif'), sizes }),
    ...(opts.cutout
      ? []
      : [h('source', { type: 'image/webp', srcset: srcset(base, 'webp'), sizes })]),
  );
  const imgEl = h('img', {
    src: `${base}-1600.${fallback}`,
    srcset: srcset(base, fallback),
    sizes,
    alt: opts.alt ?? img.alt,
    width: img.width,
    height: img.height,
    decoding: 'async',
    loading: opts.eager ? 'eager' : 'lazy',
  });
  if (opts.position) imgEl.style.objectPosition = opts.position;
  el.append(imgEl);
  return el;
}

const preloaded = new Set<ImageKey>();

/** Adds <link rel="preload"> for an image (AVIF), e.g. the reveal photo during chapter III. */
export function preloadImage(key: ImageKey, sizes = '100vw'): void {
  if (preloaded.has(key)) return;
  preloaded.add(key);
  const img = images[key];
  document.head.append(
    h('link', {
      rel: 'preload',
      as: 'image',
      type: 'image/avif',
      imagesrcset: srcset(img.src, 'avif'),
      imagesizes: sizes,
    }),
  );
}
