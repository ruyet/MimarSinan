# Image credits & requirements

Every photo shown in the experience must be listed here **and** in `src/content.ts`
(`images.*.credit`), which feeds the on-screen credits chapter.

Prefer openly licensed images (Wikimedia Commons, CC BY / CC BY-SA / CC0).
For CC BY-SA images, credit the author, link the source and name the license.

## File naming & formats

Each image is referenced by a base path without extension. Provide three variants:

```
<name>.avif   (primary, ~q50)
<name>.webp   (fallback)
<name>.jpg    (last resort)
```

…at widths 800 / 1600 / 2400 px, suffixed `-800`, `-1600`, `-2400`
(e.g. `selimiye-dome-from-below-1600.avif`). The `<picture>` + `srcset` markup is
generated from the base path.

## Required images

| Folder | File (base name) | Used in | What it must show | Source | Author | License |
|---|---|---|---|---|---|---|
| `reveal/` | `selimiye-dome-from-below` | V · Reveal | **Most important.** Straight up into the dome from the exact centre of the prayer hall; all eight piers visible; square crop preferred, ≥ 2400 px. Alignment of the line drawing is adjustable in `content.ts`. | TBD | TBD | TBD |
| `interior/` | `selimiye-prayer-hall` | VI · Inside | Wide interior view of the prayer hall at eye level. | TBD | TBD | TBD |
| `interior/` | `selimiye-window-light` | VI · Inside | Light falling through the windows (ideally visible rays). | TBD | TBD | TBD |
| `interior/` | `selimiye-muezzin-mahfili` | VII · Discover | The central müezzin platform beneath the dome. | TBD | TBD | TBD |
| `exterior/` | `selimiye-exterior-minarets` | VI · Inside | Exterior with the four minarets. | TBD | TBD | TBD |
| `details/` | `selimiye-tulip-column` | VII · Discover | The marble column with the "upside-down tulip" (legend). | TBD | TBD | TBD |
| `comparison/` | `hagia-sophia-interior` | III · Dilemma aside | Hagia Sophia interior showing the half-domes / longitudinal space. | TBD | TBD | TBD |

## Checklist before publishing

- [ ] Every row above has source URL, author and license filled in
- [ ] Attribution text matches `src/content.ts`
- [ ] Alt text in `src/content.ts` describes what is actually in the chosen photo
