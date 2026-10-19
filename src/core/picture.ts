/**
 * Responsive photos: <picture> with AVIF → WebP → JPEG sources at 800/1600/2400 px.
 * Pictures are created lazily (from a chapter's `prepare()`), never at page load.
 */
import { images, type ImageAsset, type ImageKey } from '../content';
import { publicUrl } from './asset';
import { h } from './dom';

const WIDTHS = [800, 1600, 2400];

const srcset = (base: string, ext: string, widths: readonly number[] = WIDTHS): string =>
  widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');

export interface PictureOptions {
  sizes?: string;
  className?: string;
  eager?: boolean;
  /** CSS object-position, e.g. '35% 50%'. */
  position?: string;
  /** Override the alt text (e.g. '' when a caption already describes it). */
  alt?: string;
}

export function picture(key: ImageKey, opts: PictureOptions = {}): HTMLPictureElement {
  const img: ImageAsset = images[key];
  const base = publicUrl(img.src);
  const fallback = 'jpg';
  const sizes = opts.sizes ?? '100vw';
  const widths = img.widths ?? WIDTHS;
  const el = h(
    'picture',
    { class: opts.className },
    h('source', { type: 'image/avif', srcset: srcset(base, 'avif', widths), sizes }),
    h('source', { type: 'image/webp', srcset: srcset(base, 'webp', widths), sizes }),
  );
  const imgEl = h('img', {
    src: `${base}-${widths[widths.length - 1]}.${fallback}`,
    srcset: srcset(base, fallback, widths),
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

/** Adds <link rel="preload"> for an image (AVIF), e.g. the reveal photo during the light scene. */
export function preloadImage(key: ImageKey, sizes = '100vw'): void {
  if (preloaded.has(key)) return;
  preloaded.add(key);
  const img = images[key];
  document.head.append(
    h('link', {
      rel: 'preload',
      as: 'image',
      type: 'image/avif',
      imagesrcset: srcset(publicUrl(img.src), 'avif'),
      imagesizes: sizes,
    }),
  );
}
