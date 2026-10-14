# Image credits

All photographs come from Wikimedia Commons under open licenses (checked on each file page
via the Commons API). No watermarked or "all rights reserved" image is used. The on-screen
"Sources & credits" page is generated from `src/content.ts` (`images.*.credit`), so keep
the two in sync when you swap a photo.

| File (base name)                                   | Used in                      | Shows                                                                    | Author                           | License       | Source                                                                                                                           |
| -------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------ | -------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `reveal/selimiye-dome-from-below`                  | IV · Look up                 | Straight up into the dome; all eight pier arches visible (square crop)   | Tarik Kaan Muslu                 | CC BY-SA 4.0  | [Commons](https://commons.wikimedia.org/wiki/File:Interior_of_dome,_Selimiye_Mosque,_Edirne_-_Tarik_Kaan_Muslu.jpg)              |
| `interior/selimiye-prayer-hall`                    | V · Inside, VI · Look closer | The prayer hall from the floor, müezzin's platform in the centre         | Dosseman                         | CC BY-SA 4.0  | [Commons](https://commons.wikimedia.org/wiki/File:Edirne_Selimiye_Mosque_M%C3%BCezzin_mahfili_view_in_the_room_in_2009_6286.jpg) |
| `interior/selimiye-mihrab-apse`                    | V · Inside                   | The mihrab apse, windows on three sides                                  | Dosseman                         | CC BY-SA 4.0  | [Commons](https://commons.wikimedia.org/wiki/File:Edirne_Selimiye_Mosque_Mihrab_in_2018_0162.jpg)                                |
| `interior/selimiye-muezzin-platform`               | V · Inside                   | The müezzin's platform with the fountain beneath                         | Dosseman                         | CC BY-SA 4.0  | [Commons](https://commons.wikimedia.org/wiki/File:M%C3%BCezzin_mahfili_in_Selimiye_mosque_in_Edirne_0196.jpg)                    |
| `exterior/selimiye-minarets`                       | V · Inside                   | Exterior with the four minarets, blue sky                                | Liselottediehl                   | CC BY-SA 4.0  | [Commons](https://commons.wikimedia.org/wiki/File:Edirne_Mosque.jpg)                                                             |
| `exterior/selimiye-exterior-overcast`              | VI · Look closer             | Exterior with dome and four minarets, pale sky                           | Dosseman                         | CC BY-SA 4.0  | [Commons](https://commons.wikimedia.org/wiki/File:Edirne_Selimiye_Mosque_from_distance_in_2009_6427.jpg)                         |
| `legacy/sultan-ahmed-mosque`                       | VIII · The legacy            | The Sultan Ahmed Mosque ("Blue Mosque"), cascade of domes and half-domes | Bigdaddy1204 (English Wikipedia) | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Exterior_of_Sultan_Ahmed_I_Mosque,_(old_name_P1020390.jpg).jpg>)              |
| `people/mimar-sinan-monument-edirne` (+ `-cutout`) | X · Mimar Sinan              | The bronze monument to Mimar Sinan in Edirne, near the Selimiye          | Dosseman                         | CC BY-SA 4.0  | [Commons](https://commons.wikimedia.org/wiki/File:Mimar_Sinan_monument_in_2024_6024.jpg)                                         |

## Files & formats

Each base name has nine renditions: `-800`, `-1600`, `-2400` × `.avif`, `.webp`, `.jpg`.
The Sinan monument also has a `-cutout` set (`.avif`, `.webp` with transparency), made by
`optimize-images.mjs` by removing the plain blue sky, so the name can pass behind the figure.

To re-create them:

```bash
node scripts/fetch-images.mjs                                   # 2400px sources from Commons into images-src/
node scripts/optimize-images.mjs                                # all renditions into public/images/
node scripts/optimize-images.mjs people/mimar-sinan-monument-edirne   # just one entry
```

To swap a photo, edit `scripts/images.manifest.json`, re-run both scripts, then update the
`images` entry (alt text + credit) in `src/content.ts`. For annotated photos, re-check the
annotation shapes with `?annotate=1` (see the CHANGELOG). For the reveal photo, re-tune
`revealAlignment` and check it with the "Show the drawing" toggle in chapter IV.

## License notes

- **CC BY-SA 4.0:** attribution (author, license, link) is shown on the credits page.
- **Modified:** the dome photo is a centred square crop. The Sinan monument is cropped, darkened
  with a CSS filter, and a copy has its sky removed. These adaptations are shared under the same
  license, and the credits page says so ("Modified: …").
- **Public domain:** the Sultan Ahmed Mosque photo needs no attribution, but it is credited anyway.
