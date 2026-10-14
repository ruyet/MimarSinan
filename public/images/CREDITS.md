# Image credits

All photographs come from Wikimedia Commons under open licenses. The on-screen
"Sources & credits" page is generated from `src/content.ts` (`images.*.credit`), so keep
the two in sync when you swap a photo.

| File (base name) | Used in | Shows | Author | License | Source |
|---|---|---|---|---|---|
| `reveal/selimiye-dome-from-below` | IV · Look up | Straight up into the dome; all eight pier arches visible (square crop) | Tarik Kaan Muslu | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Interior_of_dome,_Selimiye_Mosque,_Edirne_-_Tarik_Kaan_Muslu.jpg) |
| `interior/selimiye-prayer-hall` | V · Inside, VI · Look closer | The prayer hall from the floor, müezzin's platform in the centre | Dosseman | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Edirne_Selimiye_Mosque_M%C3%BCezzin_mahfili_view_in_the_room_in_2009_6286.jpg) |
| `interior/selimiye-mihrab-apse` | V · Inside | The mihrab apse, windows on three sides | Dosseman | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Edirne_Selimiye_Mosque_Mihrab_in_2018_0162.jpg) |
| `interior/selimiye-muezzin-platform` | V · Inside | The müezzin's platform with the fountain beneath | Dosseman | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:M%C3%BCezzin_mahfili_in_Selimiye_mosque_in_Edirne_0196.jpg) |
| `exterior/selimiye-minarets` | V · Inside | Exterior with the four minarets, blue sky | Liselottediehl | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Edirne_Mosque.jpg) |
| `exterior/selimiye-exterior-overcast` | VI · Look closer | Exterior with dome and four minarets, pale sky | Dosseman | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Edirne_Selimiye_Mosque_from_distance_in_2009_6427.jpg) |

## Files & formats

Each base name has nine renditions: `-800`, `-1600`, `-2400` × `.avif`, `.webp`, `.jpg`.

To re-create them:

```bash
node scripts/fetch-images.mjs      # downloads 2400px sources from Commons into images-src/
node scripts/optimize-images.mjs   # writes the renditions into public/images/
```

To swap a photo, edit `scripts/images.manifest.json`, re-run both scripts, then update the
`images` entry (alt text + credit) in `src/content.ts`. For the reveal photo, re-tune
`revealAlignment` in `src/content.ts` and check it with the "Show the drawing" toggle in chapter IV.

## License note (CC BY-SA 4.0)

Attribution (author, license, link) is shown on the credits page. The photos are used
unmodified apart from resizing and, for the dome photo, a centred square crop; if you
alter them further, CC BY-SA requires sharing those adaptations under the same license.
