# Hold Up the Sky — Mimar Sinan

An interactive story about **Mimar Sinan** (c. 1490–1588), chief architect of the Ottoman
Empire for about fifty years, told through his masterwork, the **Selimiye Mosque** in Edirne
(1575). Built as a student case study for _Typography & Design_ (ICT & Media Design).

> The visitor meets Mimar Sinan at the beginning, experiences his thinking through his
> masterpiece, and returns to him at the end — when his name carries meaning.

The redesign and the reasons behind every decision are documented in
[`REDESIGN_RATIONALE.md`](REDESIGN_RATIONALE.md). Milestones are tagged: `original-v1` (first
version), `v2.0-feedback-stan-bardt` (redesign after the teachers' feedback), and the refinement
round on branch `refine/final-polish`. Changes after the first usability test (4 participants)
are in [`USABILITY_ITERATION_2.md`](USABILITY_ITERATION_2.md) (branch `iteration/user-test-2`).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into /dist
npm run preview  # serve the production build
npm run lint
```

**For user tests:**

- Deep links jump to a scene: `/#sinan`, `/#challenge`, `/#structure`, `/#light`, `/#reveal`,
  `/#inside`, `/#lifetime`, `/#legacy`, `/#name`, `/#epilogue`, `/#credits`.
- `?reduced-motion` forces the reduced-motion experience, e.g. `/?reduced-motion#reveal`.
- `?annotate=1` overlays a grid and the raw annotation shapes on the photos.

## Deploy

Netlify (`netlify.toml`) and Vercel (`vercel.json`) are both configured. They build with
`npm run build` and publish `dist/`. No environment variables are needed.

**Subfolders (e.g. Hera at `/MimarSinan/`):** the build uses a relative base (`base: './'` in
`vite.config.ts`), so the same `dist/` works at the domain root and in any folder. Upload the
_contents_ of `dist/` into the folder. Paths into `public/` that are built at runtime (photos,
preloads) go through `src/core/asset.ts`, which prefixes `import.meta.env.BASE_URL`; store such
paths without a leading slash (`images/…`, not `/images/…`).

## The story

Three ideas explain part of Sinan's mastery (**Structure, Space, Light**), but the subject is
the man. Nine scenes and an epilogue:

| #   | Scene         | What happens                                                                           | Idea             |
| --- | ------------- | -------------------------------------------------------------------------------------- | ---------------- |
| 1   | Mimar Sinan   | His name, his monument, two sentences: fifty years, one masterwork. Begin.             | —                |
| 2   | The challenge | A hall is drawn, a 31 m dome hovers above it. Let it fall: it needs support.           | —                |
| 3   | Structure     | Try 4, 8 or 16 supports; choosing 8 reveals Sinan's answer.                            | Structure, Space |
| 4   | Light         | The same hall: open the walls between the piers; light floods in.                      | Light            |
| 5   | Look up       | The plan turns into the real dome (octagon frame on the piers); three ideas, in turn.  | all three        |
| 6   | Space         | The prayer hall, full bleed; the windows are highlighted once, then on demand.         | Space, Light     |
| 7   | A lifetime    | Look up in Şehzade, Süleymaniye, Selimiye. Optional: three stairs in one minaret.      | —                |
| 8   | After Sinan   | The architects he trained; the Sultan Ahmed Mosque, whose plan grows from Şehzade.     | —                |
| 9   | Remember him  | His name again, a closer portrait, and one sentence on what came together at Selimiye. | recap            |
| —   | Epilogue      | "He didn't just hold up the sky. He let the light in."                                 | —                |
| —   | Sources       | Every photo and text source, generated from `content.ts`.                              | —                |

## Stack

- **Vite + vanilla TypeScript.** The story is a short, linear sequence of choreographed scenes,
  so a component framework would add weight without solving a real problem.
- **GSAP** for timelines; **SVG** for all drawings; **Canvas** only for particles (dust,
  motes); **Web Audio API** for synthesised sound (no audio files, off by default).
- **Type:** Archivo (width + weight axes) and Newsreader (optical size), self-hosted, SIL OFL.

## Structure

```
index.html                 HUD (progress + sound), stage, aria-live region
src/
  content.ts               ALL copy, verified facts (+ sources), images, credits, alignment
  main.ts                  wires the HUD and the scenes
  core/                    scene controller, photo annotations, motion prefs, a11y announcer,
                           UI helpers, responsive <picture> helper, sound toggle
  audio/audio.ts           Web Audio engine
  render/                  projection (shared axonometric camera), dome, floor plan, hall
                           (supports + light), dust, motes
  chapters/                one module per scene: enter / leave / prepare / reset
  styles/                  fonts · tokens · base · layout · drawing · scenes
public/images/             optimized photos + CREDITS.md
scripts/                   fetch-images.mjs, optimize-images.mjs, images.manifest.json
REDESIGN_RATIONALE.md      the case study: problems, feedback, decisions, verification
```

## Editing content

Everything shown on screen lives in [`src/content.ts`](src/content.ts):

- `facts`: the verified facts, each with `sources`. On-screen claims must come from these.
- `copy`: every headline, sentence and label, per scene.
- `images`: photos and credits. `revealAlignment` and the `frame` values of the three works
  centre each dome inside its frame. `insideWindows` lists the window areas of the prayer hall.

## Accuracy

The support comparison in scene 3 is a **simplified illustration**, not an engineering
calculation; the page and the credits say so. No quotation is attributed to Sinan.
