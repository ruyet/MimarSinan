/**
 * Downloads the source photos listed in images.manifest.json from Wikimedia Commons
 * (as 2400px-wide renditions) into images-src/, and prints their license metadata.
 * Run: node scripts/fetch-images.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const UA = 'HoldUpTheSky-student-project/0.1 (educational, non-commercial)';
const manifest = JSON.parse(await readFile(new URL('./images.manifest.json', import.meta.url)));
const api = new URL('https://commons.wikimedia.org/w/api.php');

for (const item of manifest) {
  api.search = new URLSearchParams({
    action: 'query',
    titles: item.commons,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '2400',
    iiextmetadatafilter: 'LicenseShortName|Artist|LicenseUrl',
    format: 'json',
  });
  const res = await fetch(api, { headers: { 'User-Agent': UA } });
  const page = Object.values((await res.json()).query.pages)[0];
  const info = page.imageinfo?.[0];
  if (!info) {
    console.error('Not found:', item.commons);
    continue;
  }
  const img = await fetch(info.thumburl, { headers: { 'User-Agent': UA } });
  const file = join('images-src', `${item.out}.jpg`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(await img.arrayBuffer()));
  const meta = info.extmetadata;
  console.log(
    [
      file,
      meta.LicenseShortName?.value,
      (meta.Artist?.value ?? '').replace(/<[^>]+>/g, '').trim(),
      info.descriptionurl,
    ].join(' | '),
  );
}
