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
npm run lint
```

Deep links for user testing: `/#opening`, `/#problem` (more chapters as they land).

## Stack

- **Vite + vanilla TypeScript.** The experience is a linear sequence of choreographed scenes,
  so a component framework would add weight without solving a real problem.
- **GSAP** for timelines; **SVG** for all line art; **Canvas** only for particles (dust, light);
  **Web Audio API** for synthesised sound (no audio files, off by default).

## Structure

```
index.html                 HUD (progress + sound), stage, aria-live region
src/
  content.ts               ALL copy, facts (+ sources, // VERIFY), images, credits
  main.ts                  wires HUD + chapters
  core/
    chapters.ts            chapter controller: unlocks, crossfades, focus, progress
    motion.ts              reduced-motion check + shared easings
    announcer.ts           aria-live announcements
    splitText.ts           accessible word-by-word headline reveals
    soundToggle.ts         sound toggle buttons (aria-pressed)
    dom.ts                 tiny h()/s() element helpers
  audio/audio.ts           Web Audio engine: ambient pads, chimes, pen texture
  render/
    projection.ts          axonometric camera shared by all drawings
    floorPlan.ts           chapter I drawing (square hall, footprint, hovering dome)
    motes.ts               canvas dust motes for the opening beam
  chapters/                one module per chapter (enter/leave hooks)
  styles/                  tokens.css · base.css · layout.css · chapters.css
public/images/             photo folders + CREDITS.md
```

## Accuracy

Facts live in `src/content.ts`, each with a `source`. Numbers that differ between sources
(dome diameter, minaret height, window count) are marked `// VERIFY`.
The stability model (POC 2) is **illustrative, not an engineering simulation**.
