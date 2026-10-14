# Decisions log

Decisions made during the full build, so they can be reviewed. Most important first.

## Content & accuracy

1. **Reveal photo: a different file from the brief.** The brief suggested
   `Selimiye_Mosque,_Dome.jpg` (Stylommatophora, CC BY 4.0). It shows only the dome itself
   (1800 × 1200), so the eight piers aren't visible and the drawn octagon would have nothing to
   align with. I used *Interior of dome, Selimiye Mosque, Edirne* by **Tarik Kaan Muslu
   (CC BY-SA 4.0)**: a true straight-up view with all eight pier arches visible. Swap back via
   `scripts/images.manifest.json` if you prefer the CC BY image.
2. **Hotspots: 4 inside + 2 outside.** The 1913 artillery damage is marked on the dome in the
   exterior photo. The card says only that "artillery hit the dome", not where the scar is,
   because the exact location isn't in the verified facts.
3. **Three career stages, drawn abstractly.** The strip shows a construction sketch → a drawn
   dome → a finished dome on piers, not plans of the Şehzade or Süleymaniye. Drawing their
   real plans would have implied facts (half-dome counts, minarets) that aren't in the
   verified list.
4. **The Hagia Sophia comparison is schematic.** It shows four piers + two half-domes vs
   eight piers + four small corner half-domes, following the "How to phrase it" rule. The
   heights (55.6 m vs about 42 m) are in `content.ts` but not shown on screen, to avoid a
   "bigger/taller" reading.
5. **"Sinan's own words".** The stages note is paraphrased ("How Sinan himself described
   three stages of his career"). There are no quotation marks anywhere.
6. **Drawing proportions follow the verified numbers.** The hall is drawn at 45 × 36 m and
   the dome at 31 m. In chapter III the dome crown sits at 42 m. In chapter II the piers
   sit on an octagon around the dome rim.

## Interaction

7. **Pier placement.** Tapping the ring *adds* piers and tapping a pier *removes* some,
   always snapping to the next symmetric layout (0 → 4 → 6 → 8 → 12 → 16). The stepped
   radio group is the primary, keyboard-accessible control (arrow keys, Home/End).
8. **Stability model** (`src/model/stability.ts`) is a hand-tuned lookup table, labelled "A
   simplified model, for illustration" in the UI and on the credits page. Only 8 piers puts
   both meters in the hatched "sweet spot" (≥ 80 %).
9. **"Show me Sinan's answer"** appears after 3 changes that don't reach 8.
10. **"View from the floor"** is a 180° panorama. Column widths follow the model's openness,
    so 12 and 16 piers read as a forest of columns.
11. **Opening the walls** has 4 steps: 3 rows of wall windows + the ring of dome windows.
    The light indicator uses words ("Dim" … "Filled with light"), never a window count.
12. **Chapter V navigation.** Wheel, swipe, arrow and PageUp/PageDown keys, plus buttons.
    Continue appears on the last photo.
13. **Progress bar.** There is one dash per chapter (Prologue + I–VIII = 9). Credits sit
    outside the numbered sequence. Every reached chapter stays clickable. "Start again"
    resets every chapter's state but keeps chapters unlocked, so testers can jump around.
14. **Deep links** (`/#dilemma`, `/#reveal`, …) are kept for user testing.

## Visual

15. **Figures are cropped to 4:3** in chapters I and III so they fill the space. Layouts are
    vertically centred, and figures grow with the viewport height (checked at 1920 × 1080).
16. **On phones, controls come after the figure** in chapters II and III, so you can see the
    drawing react while you use them. On desktop the controls stay in the left column.
17. **The HUD has a soft background fade** so scrolled content never runs under it.
18. **Chapter I drawing fixes:** the mihrab notch that caused the "misaligned corner" was
    removed. The dome hovers on purpose, with dashed drop guides and a floor shadow, and it
    carries the "dome ⌀ ≈ 31 m" dimension across its base.

## Technical

19. **No component framework; lazy chapters.** Each chapter is a module with
    `enter / leave / prepare / reset` hooks. The Prologue and chapter I ship with the page.
    Chapters II–VIII and the credits are separate chunks of 1–4 KB gzipped. Each one is
    fetched, and its photos created in `prepare()`, while the previous chapter is on screen.
    The reveal photo is also preloaded with `<link rel="preload">` during chapter III.
20. **Allowed exceptions to "transform/opacity only":**
    - the reveal's radial wipe animates `clip-path` on one element;
    - thrust lines animate `stroke-dashoffset` (cheap SVG strokes);
    - the "drawing" effect animates `stroke-dashoffset`.
21. **Sound is synthesised** with the Web Audio API: room reverb, pads, chimes, collapse
    rumble, pier tick, lock-in chord, window shimmer and room tone. There are no audio files.
    Nothing plays until the toggle is pressed.
22. **Images:** 6 photos × 3 widths × AVIF/WebP/JPEG (about 20 MB on disk; a visitor
    downloads one format at one size). Originals live in `images-src/` (git-ignored) and can be
    re-fetched with the scripts.
23. **Dev-only QA hook:** `window.__gsap` is exposed only in `npm run dev`
    (`import.meta.env.DEV`), for fast-forwarding animations during tests. It is not in the
    production build.
24. **Fonts are self-hosted** (`public/fonts`, SIL OFL licenses included) instead of loaded
    from Google Fonts. Fraunces keeps all its axes (opsz, SOFT, WONK) for the italic accents.
    The two Latin "normal" files are preloaded. This removed a render-blocking request and the
    layout shift on the opening screen (Lighthouse mobile went from 78 to 91; CLS from 0.11 to 0).
25. **`?reduced-motion` URL flag** forces the reduced-motion experience for user tests.
26. **Deploy:** both `netlify.toml` and `vercel.json` are included, with long-lived cache
    headers for hashed assets and photos.
