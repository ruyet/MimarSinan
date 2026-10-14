# Hold Up the Sky

An interactive tribute to the **Selimiye Mosque** (Edirne, 1574–75) by **Mimar Sinan**,
built as a student case study for *Typography & Design*.

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
  `/#inside`, `/#discover`, `/#masterwork`, `/#epilogue`, `/#credits`.
- `?reduced-motion` forces the reduced-motion experience, e.g. `/?reduced-motion#reveal`.

## Deploy

Netlify (`netlify.toml`) and Vercel (`vercel.json`) are both configured. They build with
`npm run build` and publish `dist/`. No environment variables are needed.

## The story

| # | Chapter | What happens |
|---|---|---|
| — | Prologue | A dark room, one beam of light: "How do you hold up *the sky?*" |
| I | The problem | A hall is sketched by hand; release the dome and it collapses |
| II | The dilemma | Choose 4–16 piers; Stability vs Openness; eight is the lock-in |
| III | Opening the walls | Open the walls row by row; light floods in |
| IV | Look up | The plan tilts to a view from below, then opens onto the real dome |
| V | Inside the light | Full-bleed photographs with one caption each |
| VI | Look closer | Six hotspots with sourced facts (one is a legend, labelled as such) |
| VII | The masterwork | Hagia Sophia vs Selimiye; Sinan's three career stages |
| VIII | Epilogue | The beam returns and fills a small dome |
| — | Sources & credits | Every photo and text source, generated from `content.ts` |

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
  core/                    chapter controller, motion prefs, a11y announcer, UI helpers,
                           responsive <picture> helper, sound toggle
  audio/audio.ts           Web Audio engine
  render/                  projection (shared axonometric camera), dome, floor plan,
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
