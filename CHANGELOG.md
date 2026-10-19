# Changelog

## Refinement round (branch `refine/final-polish`)

See `REDESIGN_RATIONALE.md` §16 for reasons and measurements.

- **Stability:** support choices, the light conclusion and the reveal's lines no longer move
  the layout (all reserved up front); scenes enter on the first frame of the crossfade, so
  nothing flashes in its final state; the epilogue words start hidden.
- **Structure:** options 4 / 8 / 16, identical; "Sinan's answer" appears only after choosing 8;
  the generic "many ways" paragraph is gone.
- **Reveal:** photograph → three ideas in turn → "Look around"; waits for the photo to decode.
- **Space:** the window highlight plays once automatically, then stays available as a toggle.
- **Lifetime / After Sinan:** split into two scenes; age moved into the story; the minaret
  stairs moved into an optional dialog.
- **Ending:** one sentence about Selimiye instead of three rows; no captions.
- **Credits:** "Type & making" removed from the public page.
- **System:** one control style; clearer progress ticks; larger small text; reduced motion uses
  zero-length transitions; compact rules for 1280 × 720.

## Redesign: Mimar Sinan as the protagonist (branch `redesign/sinan-story`)

A complete redesign after feedback from Stan and Bardt and the student's own review. The full
reasoning is in `REDESIGN_RATIONALE.md`; this is the short list.

- **Story:** 12 chapters → 8 scenes + epilogue: Mimar Sinan → The challenge → Structure →
  Light → Look up → Space → A lifetime → Remember him → Epilogue. Sinan opens and closes it.
- **Identity:** limestone, ink and one accent (Selimiye's arch red); Archivo + Newsreader
  replace Fraunces + Instrument Sans; no Roman numerals, figure numbers or italic accents.
- **Copy:** about 1,800 → about 660 words on screen.
- **Interaction:** shortest path about 27 → 11 actions. Removed: Redraw, five-option stepper,
  meters, "Show me Sinan's answer", drawing/annotation toggles, the 12-step photo tour, the six
  hotspots, the plan stepper, the principle icons in the HUD.
- **Structure scene:** three answers (4, 16, Sinan's 8) on one cut-away drawing; the open floor
  is shaded; too few supports show the rim pushing outwards.
- **Light scene:** beams now sit behind piers, dome and cut walls; closing the walls cancels
  pending "on" tweens, so no beam lingers in the dark.
- **Reveal:** octagonal frame on the eight piers, centred on the dome; one guided pass
  (Structure → Light → Space) that stays readable as a list.
- **New photographs:** Şehzade and Süleymaniye seen from below (Dosseman, CC BY-SA 4.0); a
  closer crop of the Sinan monument. Removed four photographs no longer used.
- **Ending:** the sweeping light and the darkened monument are gone; his face is shown in
  daylight beside his name and three sentences about what he did. The epilogue is unchanged.
- **Fixes:** text swaps can no longer end on stale text; photo frames no longer stretch the grid;
  short desktop screens (1366 × 768) fit without scrolling.

---

# Changelog: expert-feedback round (first version)

Response to Stan van Oers's review. Feedback points:
**1** generic layouts · **2** Sinan barely present · **3** no "why" · **4** no perspective ·
**5** photos decorate · **6** no synthesis · **7** no goal / conclusion · **8** no influence.

Each change has its own commit. Run `git log --oneline` to trace them.

---

## Foundations (commit `3a02ca6`)

- **What:** verified facts added for Sinan's life, role and career, Hagia Sophia's builders
  and reinforcement, Şehzade/Süleymaniye plans, Sedefkâr Mehmed Ağa and the Sultan Ahmed
  Mosque, each with a source. Also: a new chapter order (0–XI), continuous figure numbering
  (Fig. I–XIV), chapter numerals generated from one list, a 12-column grid with margin
  tokens, and the **discovery index**: three line-art marks (Structure, Space, Light) in the
  header that fill in as each idea is discovered, announced to screen readers.
- **Why:** every later section needs the facts, the numbering and the principle system. The
  marks give the visitor a goal without gamifying it.
- **Feedback:** 2, 4, 7 (1 for the grid).
- **Test:** _After finishing, can visitors name the three principles without looking? Did anyone
  notice the marks fill in, and did it feel like progress or like a game?_

## 0 · Prologue (commit `aa30886`)

- **What:** the eyebrow now leads with **MIMAR SINAN** (heavier weight). The lede introduces
  him in two sentences (chief architect for about fifty years; built his masterwork in his
  eighties). The goal follows: "Discover the three ideas that made it a masterpiece", with the
  three empty marks sketched in. The beam, the headline and Begin are unchanged.
- **Why:** Sinan was barely present, and visitors had no stated goal.
- **Feedback:** 2, 4, 7.
- **Test:** _Ask on the first screen: "Who is this about?" and "What are you about to discover?"_

## I–II · The problem and the dilemma, clarified, plus II·b Space (commit `8cabc5b`)

- **What:**
  - I is framed as _Sinan's problem_, with a margin column (figure number and dimensions).
  - II gets an instruction line before the experiment ("Try different numbers of supports.
    Watch two things…") and a clearer model note ("a simplified illustration, not an
    engineering simulation").
  - The 4/6/12/16 outcomes are reworded as **trade-offs in this model**, not wrong answers.
  - After the lock-in, two notes explain the real system (piers built into the walls, hidden
    buttresses, corner half-domes, galleries) and that domes have been carried in many ways.
    **Structure** is discovered.
  - **II·b:** "Stand in the room" grows the small floor view into a full drawing of one open
    room under one dome (FLIP animation, transforms only). **Space** is discovered.
- **Why:** visitors could finish the game without knowing what they were testing, and the copy
  implied eight was the only correct answer.
- **Feedback:** 3, 4.
- **Test:** _Before they touch anything: "What are you testing?" After eight: "Why does eight work
  better here than sixteen?" Does anyone think the meters are real engineering?_

## III · Opening the walls (commit `5ffd999`)

- **What:** the cause and effect is said plainly: walls that don't carry the dome can be opened.
  The layout is **mirrored** (figure left) to break the repeated left/right pattern. **Light** is
  discovered at full light.
- **Feedback:** 1, 3.
- **Test:** _"Why could Selimiye have so many windows?" Listen for the link to structure._

## Annotation component (commits `c498fe1`, `0ee8a18`)

- **What:** `src/core/annotate.ts`, one reusable component:
  - selective darkening through an SVG mask, with an easing spotlight;
  - outlines drawn in with stroke-dashoffset;
  - labels with a principle mark and a leader line;
  - shapes stored in % of each photo and fitted to the visible image (`object-fit`-aware);
  - `?annotate=1` calibration mode (grid, raw shapes, live coordinates);
  - a text equivalent for every step, and a reduced-motion version.
- **Feedback:** 5.

## IV · Look up: post-reveal annotations (commit `0ee8a18`)

- **What:** the reveal timeline is **unchanged**. When it finishes, an optional pass steps
  through: the **eight piers** (Structure) → the **window ring** (Light) → **one dome** (Space),
  then leaves quiet outlines. A "Show annotations" switch turns it off.
- **Feedback:** 3, 5.
- **Test:** _Without prompting: "Point to where the dome is held up." Did the highlights help?_

## V · Inside the light: photographs that teach (commit `6203863`)

- **What:** each photo opens on its caption, then steps through 1–3 annotated notes:

  | Photo    | Notes                                                           |
  | -------- | --------------------------------------------------------------- |
  | Hall     | a pier (Structure), the open floor (Space), the windows (Light) |
  | Mihrab   | windows on three sides (Light)                                  |
  | Platform | under the dome (Space), the fountain                            |
  | Exterior | four minarets, the dome                                         |

  The caption block moves to a free corner so it never covers the highlight. Ken Burns moves
  the photo and its annotations together. Portrait phones show whole photos.

- **Feedback:** 5.
- **Test:** _"Do the photo highlights help you find the piers?" Time how long it takes to spot one._

## VI · Look closer: hotspots on the same system (commit `ad5788f`)

- **What:** a hotspot now highlights its area on the photo, and the explanation sits in a
  **margin panel** beside it (no modal covering the photo). Each panel carries a principle
  tag where it fits, the same facts, and the same sources. The tulip stays labelled as a legend.
- **Feedback:** 1, 5.

## VII · A tradition, refined (commit `8368824`)

- **What:** the side-by-side comparison and the abstract career strip are replaced by **one
  lineage of four schematic plans**:
  1. Hagia Sophia (532–537, Anthemius & Isidore; two great half-domes; **strengthened by Sinan
     in 1573**, framed as reinforcement)
  2. Şehzade (four half-domes, "apprentice work")
  3. Süleymaniye (two half-domes, "journeyman work")
  4. Selimiye (eight piers, "masterwork")

  Widths are "about the same", and higher/wider appears only as _Sinan's claim_. An accessible
  tab list steps through the plans.

- **Feedback:** 3, 4, 8.
- **Test:** _"Did Sinan design Hagia Sophia?" (the answer should be no). "What changed from
  Şehzade to Selimiye?"_

## VIII · The legacy (new, commit `edf9e8b`)

- **What:** Sedefkâr Mehmed Ağa (trained under Sinan and his successors; chief architect from 1606) and the Sultan Ahmed Mosque (1609–1616/17). Its plan grows from **Şehzade**, not from
  Selimiye's eight piers, and the page says so. Marginalia layout: a small plan pair beside one
  public-domain photo.
- **Feedback:** 8.
- **Test:** _"Did Sinan's ideas stop when he died? How did they continue?"_

## IX · Why Mimar Sinan matters (new, commit `08ac6d8`)

- **What:** four numbered plates in a monograph layout, each reusing a figure already seen
  (pier plan, open room, lit hall, Şehzade → Blue Mosque) with one sentence each. The three
  marks appear fully drawn. Typographic entrance instead of the shared rise-and-fade.
- **Feedback:** 3, 6, 7, 1.
- **Test:** _Cover the screen after IX: "Give me the four reasons." Which plate was remembered?_

## X · MIMAR SINAN (new, commit `077b5a7`)

- **What:**
  - The name at viewport scale, revealed by a sweeping band of light (transform-only wipe).
  - The bronze monument to Sinan in Edirne is darkened behind it; on wide screens a sky-free
    cutout lets his shoulder pass in front of the type.
  - Lines: "c. 1490–1588 · Chief architect of the Ottoman Empire for about fifty years" and
    "Hundreds of buildings. One masterwork."
  - Leaving narrows the band into the Epilogue's beam position before the Epilogue begins.
- **Feedback:** 2, 7.
- **Test:** _The next day: "What was the architect's name?"_

## XI · Epilogue: unchanged

- Only the incoming hand-off from X is new, plus the numeral (VIII → XI). The line, animation,
  atmosphere, copy and CSS are byte-identical to before; `git diff 098159e --
src/chapters/epilogue.ts` shows two lines.

## Credits, docs and QA (final commit)

- The credits page lists 8 photos and 15 sources. "Modified:" notes cover CC BY-SA adaptations.
- `CREDITS.md`, `DECISIONS.md` (items 27–42) and the README are updated.
- QA fixes along the way:
  - a GSAP tween captured a responsive CSS transform (the statue drifted after a resize);
  - grid-area clashes from a shared actions class;
  - HUD overflow at 360 px;
  - label/caption collisions in chapter V.

---

## Verification

| Check                   | Result                                                                                                                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Build                   | `tsc`, ESLint and Prettier are clean; production build passes.                                                                                                                                                                                               |
| Click-through           | All 12 screens via the UI only, including the hint path, the room beat, every chapter V note, a hotspot, all four plans, the X → Epilogue hand-off, credits, jumping back via the progress bar, and Start again (which resets the marks). No runtime errors. |
| Original interactions   | Collapse, pier choices, walls, reveal, hotspots and sound all still work.                                                                                                                                                                                    |
| Widths                  | 360, 768, 1440, 1920: no horizontal overflow. At 1440 and 1920 every chapter fits one screen, vertically centred. Annotation overlays match the visible image rectangle at every size (checked numerically).                                                 |
| Keyboard                | Every control is reachable; hidden chapters are inert; tabs, radios and hotspots follow standard patterns.                                                                                                                                                   |
| Reduced motion          | `?reduced-motion` gives calm alternatives for the name reveal, room beat, plates, annotations and the X → XI hand-off.                                                                                                                                       |
| Fact check              | Every number in the UI copy traces to the fact sheet. No Sinan quotes; none of the "do not use" claims.                                                                                                                                                      |
| Lighthouse (production) | Desktop 100 / 100 / 100 / 100; mobile 91 / 100 / 100 / 100.                                                                                                                                                                                                  |

## Limitations

- **Animation was tested in a throttled preview pane.** Timing and the 60 fps target should be
  confirmed in a real browser, especially the spotlight easing on large photos.
- **Annotations are tied to these exact photos.** If you replace one, re-check its shapes with
  `?annotate=1`. No annotation is currently flagged `needsCalibration`.
- **The 1913 damage is not located on the photo.** The hotspot outlines the dome only, because
  the exact place could not be verified.
- **The plans are schematic diagrams** (counts of piers and half-domes), not measured drawings.
- **The sky cutout of the statue** is a threshold mask; edges are soft but not hand-masked.
- **The site is longer.** Four sections were added, so expect a few extra minutes per visit.

## Assets you still need to supply

- **None required.** Every published image is openly licensed and credited.
- **Optional:** if you have a Sinan statue photo you hold the rights to, add it to
  `scripts/images.manifest.json` and swap it in. Your watermarked reference image was never
  added to the project and is not used.
