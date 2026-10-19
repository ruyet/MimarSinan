# Image credits

All photographs come from Wikimedia Commons under open licenses (checked on each file page
via the Commons API). No watermarked or "all rights reserved" image is used. The on-screen
"Sources & credits" page is generated from `src/content.ts` (`images.*.credit`), so keep
the two in sync when you swap a photo.

| File (base name)                       | Used in          | Shows                                                                   | Author                           | License       | Source                                                                                                                           |
| -------------------------------------- | ---------------- | ----------------------------------------------------------------------- | -------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `people/mimar-sinan-monument-edirne`   | 1 · Mimar Sinan  | The bronze monument to Mimar Sinan in Edirne (a modern sculpture)       | Dosseman                         | CC BY-SA 4.0  | [Commons](https://commons.wikimedia.org/wiki/File:Mimar_Sinan_monument_in_2024_6024.jpg)                                         |
| `people/mimar-sinan-monument-portrait` | 8 · Remember him | Closer crop of the same photo: head and shoulders                       | Dosseman                         | CC BY-SA 4.0  | [Commons](https://commons.wikimedia.org/wiki/File:Mimar_Sinan_monument_in_2024_6024.jpg)                                         |
| `reveal/selimiye-dome-from-below`      | 5 · Look up, 7   | Straight up into the dome; all eight pier arches visible (square crop)  | Tarik Kaan Muslu                 | CC BY-SA 4.0  | [Commons](https://commons.wikimedia.org/wiki/File:Interior_of_dome,_Selimiye_Mosque,_Edirne_-_Tarik_Kaan_Muslu.jpg)              |
| `interior/selimiye-prayer-hall`        | 6 · Space        | The prayer hall from the floor, müezzin's platform in the centre        | Dosseman                         | CC BY-SA 4.0  | [Commons](https://commons.wikimedia.org/wiki/File:Edirne_Selimiye_Mosque_M%C3%BCezzin_mahfili_view_in_the_room_in_2009_6286.jpg) |
| `career/sehzade-domes-from-below`      | 7 · A lifetime   | Şehzade Mosque, wide-angle view up: central dome and four half-domes    | Dosseman                         | CC BY-SA 4.0  | [Commons](https://commons.wikimedia.org/wiki/File:%C5%9Eehzade_Mosque_domes_in_2018_9508.jpg)                                    |
| `career/suleymaniye-domes-from-below`  | 7 · A lifetime   | Süleymaniye, view up: central dome with half-domes beyond, top & bottom | Dosseman                         | CC BY-SA 4.0  | [Commons](https://commons.wikimedia.org/wiki/File:Istanbul_Suleymaniye_Mosque_Interior_Ceiling_2015_1311.jpg)                    |
| `legacy/sultan-ahmed-mosque`           | 7 · A lifetime   | The Sultan Ahmed Mosque ("Blue Mosque"), domes and half-domes           | Bigdaddy1204 (English Wikipedia) | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Exterior_of_Sultan_Ahmed_I_Mosque,_(old_name_P1020390.jpg).jpg>)              |

Removed in the redesign (no longer shown): the mihrab apse, the müezzin's platform close-up, and
two exterior views of the Selimiye. They are still listed in git history if needed.

## Modifications (CC BY-SA)

- The three "looking up" photos are cropped to squares; on screen they are shown inside a
  circular or octagonal frame centred on the main dome. Nothing is retouched.
- The monument photo is cropped twice (whole figure; head and shoulders). Nothing is retouched,
  darkened or cut out.

## Files & formats

Each base name has nine renditions: `-800`, `-1600`, `-2400` × `.avif`, `.webp`, `.jpg`.

To re-create them:

```bash
node scripts/fetch-images.mjs                                   # 2400px sources from Commons into images-src/
node scripts/fetch-images.mjs career/sehzade-domes-from-below   # just one entry
node scripts/optimize-images.mjs                                # all renditions into public/images/
node scripts/optimize-images.mjs people/mimar-sinan-monument-edirne   # also writes the portrait crop
```
