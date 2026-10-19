/**
 * Generates responsive AVIF / WebP / JPEG renditions (800, 1600, 2400 px wide)
 * from images-src/ into public/images/. Run: node scripts/optimize-images.mjs
 */
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const WIDTHS = [800, 1600, 2400];
const only = process.argv[2]; // optional: process a single manifest entry (by output path)
const manifest = JSON.parse(await readFile(new URL('./images.manifest.json', import.meta.url)));

for (const item of manifest) {
  if (only && item.out !== only) continue;
  const src = join('images-src', `${item.out}.jpg`);
  let base = sharp(src);
  const meta = await base.metadata();
  if (item.crop === 'square') {
    const size = Math.min(meta.width, meta.height);
    base = base.extract({
      left: Math.round((meta.width - size) / 2),
      top: Math.round((meta.height - size) / 2),
      width: size,
      height: size,
    });
  }
  const buffer = await base.toBuffer();
  const outBase = join('public', 'images', item.out);
  await mkdir(dirname(outBase), { recursive: true });
  for (const w of WIDTHS) {
    const resized = sharp(buffer).resize({ width: w, withoutEnlargement: true });
    await Promise.all([
      resized.clone().avif({ quality: 50, effort: 5 }).toFile(`${outBase}-${w}.avif`),
      resized.clone().webp({ quality: 74 }).toFile(`${outBase}-${w}.webp`),
      resized
        .clone()
        .jpeg({ quality: 78, mozjpeg: true, progressive: true })
        .toFile(`${outBase}-${w}.jpg`),
    ]);
  }
  if (item.portrait) await writePortrait(buffer, outBase);
  const m = await sharp(buffer).metadata();
  console.log(`${item.out}: ${m.width}x${m.height}`);
}

/**
 * Writes `<name-without-"-edirne">-portrait-<w>` renditions: a closer crop of the monument
 * photo (head and shoulders), used at the end of the story. The crop box is a fraction of the
 * source so it survives a re-fetch at a different size.
 */
async function writePortrait(buffer, outBase) {
  const meta = await sharp(buffer).metadata();
  const box = {
    left: Math.round(meta.width * 0.24),
    top: Math.round(meta.height * 0.13),
    width: Math.round(meta.width * 0.6),
    height: Math.round(meta.height * 0.5),
  };
  const crop = await sharp(buffer).extract(box).toBuffer();
  const out = outBase.replace(/-edirne$/, '-portrait');
  for (const w of WIDTHS) {
    const resized = sharp(crop).resize({ width: w, withoutEnlargement: true });
    await Promise.all([
      resized.clone().avif({ quality: 52, effort: 5 }).toFile(`${out}-${w}.avif`),
      resized.clone().webp({ quality: 76 }).toFile(`${out}-${w}.webp`),
      resized
        .clone()
        .jpeg({ quality: 80, mozjpeg: true, progressive: true })
        .toFile(`${out}-${w}.jpg`),
    ]);
  }
}
