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
  if (item.cutout === 'sky') await writeSkyCutout(buffer, outBase);
  const m = await sharp(buffer).metadata();
  console.log(`${item.out}: ${m.width}x${m.height}`);
}

/**
 * Writes `<name>-cutout-<w>.webp/.avif` with the (blue) sky made transparent, so type can sit
 * behind the figure. Only reliable for photos with a clear, plain sky.
 */
async function writeSkyCutout(buffer, outBase) {
  const { data, info } = await sharp(buffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const alpha = Buffer.alloc(info.width * info.height);
  for (let i = 0, p = 0; p < alpha.length; p++, i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Sky: bright (blue ≥ ~200) AND strongly blue (blue − red ≥ ~60). Sampled on the Edirne
    // monument photo: sky ≈ (130,170,230), bronze ≤ (115,130,155). Soft ramps avoid jagged edges.
    const clamp = (v) => Math.min(1, Math.max(0, v));
    const sky = Math.min(clamp((b - 185) / 30), clamp((b - r - 55) / 25), clamp((b - g - 30) / 20));
    alpha[p] = Math.round(255 * (1 - sky));
  }
  const mask = await sharp(alpha, { raw: { width: info.width, height: info.height, channels: 1 } })
    .blur(1.2)
    .extractChannel(0) // keep a single channel, or joinChannel misreads the buffer
    .raw()
    .toBuffer();
  const rgba = await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } })
    .joinChannel(mask, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toBuffer();
  for (const w of WIDTHS) {
    const resized = sharp(rgba).resize({ width: w, withoutEnlargement: true });
    await Promise.all([
      resized.clone().webp({ quality: 78, alphaQuality: 90 }).toFile(`${outBase}-cutout-${w}.webp`),
      resized.clone().avif({ quality: 52, effort: 5 }).toFile(`${outBase}-cutout-${w}.avif`),
    ]);
  }
}
