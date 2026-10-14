# Hold Up the Sky

An interactive tribute to the **Selimiye Mosque** (Edirne, 1574–75) by **Mimar Sinan**,
built as a student case study for _Typography & Design_.

> How can an interactive digital experience help people without architectural knowledge
> discover and appreciate the architectural brilliance of the Selimiye Mosque?

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into /dist
npm run preview  # serve the production build
npm run lint
```

**For user tests:**

- Deep links jump to a chapter: `/#problem`, `/#dilemma`, `/#walls`, `/#reveal`,
  `/#inside`, `/#discover`, `/#masterwork`, `/#legacy`, `/#synthesis`, `/#name`,
  `/#epilogue`, `/#credits`.
- `?reduced-motion` forces the reduced-motion experience, e.g. `/?reduced-motion#reveal`.
- `?annotate=1` shows a grid, every annotation shape and live coordinates on the photos,
  for calibrating highlights, e.g. `/?annotate=1#inside`.

## Deploy

Netlify (`netlify.toml`) and Vercel (`vercel.json`) are both configured. They build with
`npm run build` and publish `dist/`. No environment variables are needed.

## The story

The visitor's goal, set in the Prologue: discover the three ideas behind Sinan's masterpiece:
**Structure, Space, Light**. Three line-art marks in the header fill in as each is discovered.

| #    | Chapter                 | What happens                                                                 | Principle        |
| ---- | ----------------------- | ---------------------------------------------------------------------------- | ---------------- |
| —    | Prologue                | One beam of light: "How do you hold up _the sky?_" Mimar Sinan, and the goal | all three, empty |
| I    | The problem             | Sinan's problem: a hall is sketched; release the dome and it collapses       | —                |
| II   | The dilemma             | Choose 4–16 piers; Stability vs Openness; eight is Sinan's choice            | Structure        |
| II·b | The unified room        | The floor view grows into one open room under one dome                       | Space            |
| III  | Opening the walls       | Walls that don't carry the dome open up; light floods in                     | Light            |
| IV   | Look up                 | The reveal of the real dome, then annotations: piers, window ring, one dome  | all three        |
| V    | Inside the light        | Photographs that teach: stepped, annotated notes on each photo               | all three        |
| VI   | Look closer             | Six hotspots that highlight the photo, explained in a margin panel           | tagged           |
| VII  | A tradition, refined    | Hagia Sophia → Şehzade → Süleymaniye → Selimiye                              | —                |
| VIII | The legacy              | Sedefkâr Mehmed Ağa and the Sultan Ahmed Mosque, built on Şehzade            | —                |
| IX   | Why Mimar Sinan matters | Four numbered plates: the synthesis                                          | recap            |
| X    | MIMAR SINAN             | The name, revealed by light, with his monument                               | —                |
| XI   | Epilogue                | The beam returns and fills a small dome                                      | —                |
| —    | Sources & credits       | Every photo and text source, generated from `content.ts`                     | —                |

See `CHANGELOG.md` for what changed in the expert-feedback round and `DECISIONS.md` for why.

## Stack

- **Vite + vanilla TypeScript.** The story is a linear sequence of choreographed scenes, so a
  component framework would add weight without solving a real problem.
- **GSAP** for timelines; **SVG** for all line art; **Canvas** only for particles (dust,
  motes); **Web Audio API** for synthesised sound (no audio files, off by default).

## Structure

```
index.html                 HUD (progress + sound), stage, aria-live region
src/
  content.ts               ALL copy, verified facts (+ sources), images, credits, alignment
  main.ts                  wires the HUD and the chapters
  model/stability.ts       the simplified, rules-based pier model
  core/                    chapter controller, principles (discovery index), annotate.ts
                           (photo annotations), motion prefs, a11y announcer, UI helpers,
                           responsive <picture> helper, sound toggle
  audio/audio.ts           Web Audio engine
  render/                  projection (shared axonometric camera), dome, floor plan, plans,
                           hall cut-away, pier plan + floor view, dust, motes
  chapters/                one module per chapter: enter / leave / prepare / reset
  styles/                  tokens · base · layout · components · spread · drawing ·
                           opening · scenes
public/images/             optimized photos + CREDITS.md
scripts/                   fetch-images.mjs, optimize-images.mjs, images.manifest.json
DECISIONS.md               decisions made during the build, for review
```

## Editing content

Everything shown on screen lives in [`src/content.ts`](src/content.ts):

- `facts`: the verified facts, each with `sources`. Only these may be shown on screen.
- `copy`: every headline, body text and label, per chapter. Wrap a phrase in `*asterisks*`
  to set it in italic.
- `images` / `insideSlides` / `hotspots`: photos, captions and hotspot positions (in %).
- `revealAlignment`: scale, rotation, offset and radii that line the drawn octagon up with
  the dome photo. Check them with "Show the drawing" in chapter IV.

## Accuracy

The meters in chapter II use a **simplified, illustrative model** (`src/model/stability.ts`),
not an engineering calculation; the UI says so.
