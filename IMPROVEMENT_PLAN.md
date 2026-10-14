# Improvement plan: from "impressive" to "meaningful"

Response to Stan van Oers's review. **Status: waiting for approval.** Nothing has been changed yet.

---

## Phase 1: Analysis of the current site

### How the site is built (what has to be preserved)

| Layer | Where | Notes |
|---|---|---|
| Section order | `src/content.ts` → `chapters[]` | Prologue, I–VIII, Credits. The controller is index-based: adding sections means adding entries here. |
| Chapter controller | `src/core/chapters.ts` | Handles the crossfade, focus, progress dashes, `prepare()` preloading, lazy chunks and `reset()` for "Start again". **No ScrollTrigger**: every chapter is a full-screen "page" driven by buttons. |
| Chapter modules | `src/chapters/*.ts` | Each has `enter / leave / prepare / reset` hooks. Roman numerals are hard-coded per module (`eyebrow('II', …)`). |
| Animation | GSAP timelines per chapter | Pen-drawn SVG (`stroke-dashoffset`), the collapse, pier lock-in, the reveal tilt + `clip-path` wipe, slide Ken Burns. |
| Canvas | `render/motes.ts` (Prologue, Epilogue), `render/dust.ts` (collapse) | Both are self-contained. |
| Audio | `src/audio/audio.ts` | Synthesised; pads per mood plus cues (rumble, tick, lock, shimmer, chime). |
| Content | `src/content.ts` | Sources, verified facts, copy, images, `revealAlignment`, slides, hotspots. |
| Layout | `styles/spread.css` | `.spread` (text left / figure right) is used by 5 of 9 chapters. |
| Responsive | Single column below 60rem. In chapters II and III the controls move under the figure on phones. |

**Epilogue fingerprint** (to prove it's untouched afterwards): `src/chapters/epilogue.ts` git blob `f8ea9bc7327ea5ddb1da41b7c0ac35aa3882a976`, plus the `.epilogue*` CSS block in `styles/scenes.css`.

### Where each feedback point lives in the code

| # | Feedback | Root cause in the code |
|---|---|---|
| 1 | Generic, "vibe-coded" layouts | The same `.spread` grid (`styles/spread.css`) is used in problem, dilemma, walls, reveal and discover. Every chapter enters through the same `introText()` (`core/ui.ts`: eyebrow → words rise → rest fades up), and the controller uses one identical crossfade (`core/chapters.ts`). There's no grid system, margins or continuous figure numbering (each chapter restarts at "Fig. I"). |
| 2 | Sinan is barely present | He appears only in `copy.opening.lede` ("…the building Mimar Sinan called his masterwork"), the Prologue footer and the Epilogue lede. `facts` has no biography: no dates, no career, no role. |
| 3 | Why was he extraordinary? | The "why" sits in a single sentence (`dilemma.states[8].body`). Nothing names the idea behind it, or connects structure → space → light. |
| 4 | No storytelling perspective | Chapters are expository ("The problem", "The dilemma") with no protagonist and no thread. The visitor is never told *what they're looking for*. |
| 5 | Photos decorate | `chapters/inside.ts` shows photos with captions only. `chapters/discover.ts` has dots + modal cards, but the photo itself never *shows* anything (no highlighting or outlining). The reveal (`chapters/reveal.ts`) ends on the bare photo. |
| 6 | No synthesis | The section order goes masterwork → epilogue; no section gathers the lessons. |
| 7 | No clear goal or memorable conclusion | The Prologue has no stated goal (`copy.opening.lede`). The Epilogue line is beautiful but abstract; nothing asks the visitor to remember Sinan's name. |
| 8 | No influence | `chapters/masterwork.ts` looks *back* (Hagia Sophia) and at his own career stages, never *forward*. |

There's also a **content issue** the brief flags: the dilemma copy ("Four is *not enough*", "Six is *nearly there*") reads as if eight were the only correct engineering answer.

---

## Phase 2: The plan

### The narrative spine

- **Goal (stated in the Prologue):** *Discover the three ideas that made it a masterpiece: Structure. Space. Light.*
- **Perspective:** each chapter opens with *Sinan's problem* and closes with *his solution*, in the narrator's voice. There are no first-person quotes.
- **Discovery index:** three line-art marks drawn in the existing ink style:
  - Structure: a pier, a vertical stroke with a capital
  - Space: a circle
  - Light: a fan of rays

  They sit in the HUD, beside the progress label, as quiet notebook annotations. Each one is outlined until discovered, then drawn in and filled. Each discovery is announced through the existing `aria-live` region: "Principle discovered: Structure." There are no points or badges. "Start again" resets them.

### Section order (adapted to the code)

| # | Section | Status | Principle | Archetype | Notes |
|---|---|---|---|---|---|
| 0 | Prologue | **Revise** | introduces all three | Typographic | Sinan named, two-sentence why, goal + empty marks. Beam and motes kept. |
| I | The problem | Keep + clarify | — | Split + marginalia | Figure number and notes move into the margin. |
| II | The dilemma | Keep + clarify | **Structure** | Split | Instruction line, clearer model note, trade-off wording, "the real system" after lock-in. |
| II·b | The unified room | **New beat inside II** | **Space** | Full-width moment | See note A. |
| III | Opening the walls | Keep + clarify | **Light** | Split, **mirrored** (figure left) | Cause → effect copy. |
| IV | Look up | **Keep**, then annotate | connects all three | Plate | Annotation pass after the reveal finishes; "Show annotations" toggle. |
| V | Inside the light | **Revise** | all three, demonstrated | Full bleed | Each photo becomes 1–3 annotated steps. |
| VI | Look closer | Keep, align | tags per hotspot | Plate + marginalia | Hotspots use the new annotation system; see note B. |
| VII | A tradition, refined | **Revise** | — | Plate sequence | Hagia Sophia → Şehzade → Süleymaniye → Selimiye; see note C. |
| VIII | The legacy | **New, short** | — | Marginalia | Sedefkâr Mehmed Ağa, Şehzade → Blue Mosque. |
| IX | Why Mimar Sinan matters | **New** | recap (all filled) | Typographic plates | Four numbered plates reusing earlier figures. |
| X | MIMAR SINAN | **New** | — | Typographic, full bleed | Name reveal + statue, then hands the beam to the Epilogue. |
| XI | Epilogue | **Untouched** | — | — | Only the incoming transition is new; see note D. |
| — | Sources & credits | Update | — | — | New sources and images. |

**Note A: why II·b is a beat inside II, not a separate chapter.** The brief calls it "a breath rather than a chapter". As its own chapter it would need its own dash, entrance and Continue button. Instead, after the lock-in, the existing "view from the floor" inset grows to full width over the figure. One sentence appears, Space unlocks, and a "Continue" returns to the normal layout. It is skippable, has a reduced-motion version, and makes no change to the pier interaction itself.

**Note B: hotspot cards move into the margin.** Today a hotspot opens a **modal** that covers the photo. With selective darkening, the explanation is better *next to* the highlighted area. Proposal: the card becomes a non-modal **margin panel** (below the photo on phones).
- Focus moves to the panel heading, and Esc or "Close" returns focus to the hotspot.
- The text stays identical, the sources stay listed, and "x of 6 explored" stays.
- The modal's focus trap is no longer needed because nothing is covered.
- **This changes an interaction, so please approve it.** The alternative is to keep the modal and add the highlighting behind it.

**Note C: VII merges two existing parts.** The current side-by-side Hagia Sophia vs Selimiye plans **and** the "Three stages of a career" strip become one progression of four plans: Hagia Sophia (537) → Şehzade (1548, "apprentice work") → Süleymaniye (1557, "journeyman work") → Selimiye (1575, "masterwork"). A stepped control (keyboard-accessible) or swipe moves through them. Nothing is lost, since the apprentice/journeyman/master labels move onto the plans, but the two current layouts disappear as such. **Please approve.** The abstract career-stage marks can be removed, because real plans are now allowed by the new fact sheet: Şehzade has four half-domes and Süleymaniye has two.

**Note D: the Epilogue's numeral.** `epilogue.ts` hard-codes its eyebrow as `VIII`. After renumbering it becomes chapter **XI**, so either:
- **(a, recommended)** change that one string from `'VIII'` to the numeral from the chapter list. That is a one-token change; the line, animation and atmosphere stay untouched.
- **(b)** leave the file byte-identical, and the eyebrow will wrongly say "VIII".

**Please choose.** Everything else in the Epilogue stays byte-identical either way. The X → XI transition is done by a new optional `exit()` hook in the controller, run by chapter X. The Epilogue's own entrance animation is not touched.

### Section details

**0 · Prologue**
- Eyebrow: **MIMAR SINAN** · Selimiye Mosque · Edirne · 1575, with the name set heavier.
- Lede: *Mimar Sinan was chief architect of the Ottoman Empire for about fifty years. In his eighties he built the mosque he himself called his masterwork.*
- Goal line plus the three empty marks, each labelled.
- The existing beam, motes, headline and Begin button stay. No statue here; it's saved for X.

**I · The problem**
- The copy gains the problem framing: *Sinan's problem: …*.
- The collapse is unchanged.

**II · The dilemma**
- **Before:** *Try different numbers of supports. Watch two things: does the dome hold, and how open does the room stay?*
- **Model note:** *This is a simplified illustration, not an engineering simulation.*
- **Rewording:**
  - 4: *"In this model, four piers alone leave wide gaps…"*
  - 12/16: *"…a trade-off: more support, less open room."*
  - The meter labels stay.
- **After the lock-in** (2–3 sentences): eight piers partly built into the outer walls, buttresses hidden in the walls, four small corner half-domes, and galleries between the piers. Then: *Domes have been carried in many ways. Hagia Sophia used two great half-domes. Sinan himself tried other systems in earlier mosques. At Selimiye, he chose eight.*
- Structure unlocks, then the II·b beat (Space).

**III · Opening the walls**
- *Walls that don't carry the dome can be opened. Selimiye's walls are pierced by a great many windows.*
- Light unlocks at full light.
- The layout is mirrored: figure left, text right.

**IV · Look up**
- The reveal timeline is untouched.
- After it ends, a "Show annotations" toggle (default on, after a pause) steps through:
  1. outline the eight piers (Structure)
  2. the window ring (Light)
  3. the single dome (Space)
- Positions reuse `revealAlignment`, which is already calibrated.

**V · Inside the light.** Each photo becomes 1–3 annotation steps (spotlight + outline + label + one line), advanced by the existing next/scroll/swipe/keys. Planned, subject to checking each photo:

| Photo | Steps |
|---|---|
| Prayer hall | piers (Structure) · the open floor under one dome (Space) · window rows (Light) |
| Mihrab apse | windows on three sides (Light) |
| Müezzin platform | at the centre, directly under the dome (Space) |
| Exterior | four minarets framing the dome |

**VI · Look closer**
- The same six facts.
- Each hotspot highlights its area on the photo and carries a principle tag where it fits: piers = Structure, windows = Light, platform = Space; the tulip, minarets and the 1913 scar get none.
- The 1913 scar keeps "on the dome" only, with **no outline**, because its exact location can't be verified.

**VII · A tradition, refined**
- **Hagia Sophia** (532–537, Anthemius of Tralles and Isidore of Miletus): a central dome with two great half-domes, giving a long space.
- **"Sinan studied this tradition. In 1573 he strengthened Hagia Sophia itself with buttresses."** This is framed explicitly as reinforcement of an existing building.
- **Şehzade** (four half-domes) → **Süleymaniye** (two half-domes) → **Selimiye** (eight piers, one centred space).
- Widths: "about the same"; higher and wider only as *Sinan's claim*.

**VIII · The legacy**
- Copy: *Sinan's ideas outlived him through the architects he trained.* Then: Sedefkâr Mehmed Ağa (trained under Sinan, then Davud Ağa and Dalgıç Ahmed Ağa; chief architect from 1606) designed the Sultan Ahmed Mosque (1609–1616/17). Its plan builds on Sinan's **Şehzade** (central dome + four half-domes, expanded), **not** on Selimiye's eight piers.
- Visuals: Şehzade and Blue Mosque line plans in the margin, plus one photo.

**IX · Why Mimar Sinan matters.** Four plates in a monograph style (large numeral, reused figure, one sentence each):
1. He refined monumental structure (pier plan from II)
2. He created unified space (floor view from II·b)
3. He made structure and light work together (lit hall from III)
4. His ideas outlived him (Şehzade → Blue Mosque from VIII)

The three marks are shown fully drawn.

**X · MIMAR SINAN**
- Dark and full screen.
- "MIMAR SINAN" at viewport scale, revealed by a sweeping band of light. It breaks onto two lines at 360px.
- The darkened statue sits partly behind the type using a mask.
- *c. 1490–1588 · Chief architect of the Ottoman Empire for about fifty years.* · *Hundreds of buildings. One masterwork.*
- Exit: the light band narrows to the Epilogue's beam position as the name fades, then the Epilogue enters as it does today.
- Reduced motion: simple crossfades.

### Art direction (point 1)
- **Grid:** a 12-column grid token (`--grid-cols`, `--grid-gap`, margin columns). Margins hold figure numbers, principle marks and notes.
- **Five archetypes** as CSS classes: `.plate`, `.split`, `.bleed`, `.typographic`, `.marginalia`. The table above assigns one per section, and no two neighbouring sections share an archetype.
- **Continuous figure numbering** generated from one list in `content.ts` (Fig. I … Fig. XVI), so numbers never drift.
- **Varied entrances.** `introText()` stays for split sections only. Plates draw in their frame, typographic sections reveal by tracking or the light band, and full-bleed sections fade the photo first, then the type.
- **Light and dark rhythm by act:**

| Act | Theme | Chapters |
|---|---|---|
| Problem | parchment | I–III |
| Revelation | night | IV–V |
| Understanding | parchment | VI–IX |
| Recognition | night | X–XI |

- The existing palette, fonts, tokens and animations are kept. No glassmorphism, blobs, stock icons or parallax.

### Photo annotation system (point 5)
A new reusable `src/core/annotate.ts`:
- **Overlay:** an SVG laid exactly over the *visible image rectangle*. It accounts for `object-fit: cover` cropping, recalculated with a `ResizeObserver`, so percentages stay correct at every size.
- **Spotlight:** an SVG `<mask>` dims everything except the focus shape to about 40% brightness. The hole eases between shapes as steps advance (GSAP `attr` tweens on the mask shape).
- **Drawing:** outlines are drawn in with `stroke-dashoffset`; labels use leader lines in the tracked uppercase style plus one line of text.
- **Data:** per image in `content.ts`, coordinates in % of the image, with `principle?` and `needsCalibration?` flags.
- **Calibration:** `?annotate=1` shows a 10% grid, raw shapes and coordinates.
- **Accuracy:** I'll open each photo at full size before placing anything. Anything I can't identify with certainty is flagged `needsCalibration: true` and listed in the CHANGELOG, not guessed.
- **Accessibility:** each step has a visible text line and an `aria-live` update. Under reduced motion, steps switch without movement.

### Assets

| Asset | Candidate | License (checked via the Commons API) | Status |
|---|---|---|---|
| Sinan statue (X) | `File:Mimar Sinan monument in 2024 6024.jpg`, Dosseman: the seated monument in Edirne, low angle, plain sky | **CC BY-SA 4.0** | Recommended |
| Alternative | `File:Sinan Caferaga March 2008b.JPG`, Gryffindor (the bust you suggested) | **CC BY-SA 4.0** confirmed; a **public-domain** version (`…March 2008.JPG`) also exists | Fallback |
| Blue Mosque (VIII) | `File:Exterior of Sultan Ahmed I Mosque, (old name P1020390.jpg).jpg`: the cascade of half-domes is clearly visible | **Public domain** | Recommended |
| Plans | Hagia Sophia, Şehzade, Süleymaniye, Selimiye, Blue Mosque | Drawn by me, schematic, in the line style | — |

- **Your watermarked statue reference photo never reached me.** It isn't in the repo or this conversation. That's fine, because I won't use a watermarked image anyway. If you have a statue photo you hold the rights to, send it and I'll swap it in.
- **Observation:** the blue-sky exterior photo in chapter V shows a statue with a raised arm. It is **not** the seated Sinan monument, so I won't label it.

### Technical risks

1. **Renumbering** (VIII → XI chapters): all numerals currently hard-coded in the modules will come from `chapters[]`. The deep-link ids (`#dilemma`…) stay the same.
2. **Annotations on cropped photos:** the visible-rect calculation must be right at every size. Mitigation: calibration mode, plus QA at 360/768/1440/1920.
3. **Mask performance** on large photos: the mask lives on a lightweight overlay SVG, never on the `<img>`, and attribute tweens are limited to one shape. To be checked for 60 fps in a real browser.
4. **Length:** four new sections. Each is kept to ≤ 3 sentences, and the total added reading time is aimed at under 2 minutes.
5. **HUD space at 360px:** label + three marks + sound toggle. The sound toggle becomes icon-only on phones, with its accessible name kept.
6. **Bundle:** the new chapters are lazy chunks like the others. Two new photos at 800/1600/2400 × AVIF/WebP/JPEG.
7. **Epilogue protection:** before/after hash comparison, plus a CSS diff of the `.epilogue*` block.

### Priorities and commit order
One commit per step, with a build after each.

1. Foundations: facts and sources, chapter list + numerals from metadata, grid tokens and archetype classes, continuous figure numbering, principle marks + discovery index, controller `exit()` hook
2. Prologue
3. I + II clarifications + II·b Space beat
4. III Light
5. Annotation component + calibration mode
6. IV reveal annotations
7. V annotated photographs
8. VI hotspots on the annotation system
9. VII A tradition, refined
10. VIII Legacy (+ Blue Mosque photo)
11. IX Synthesis
12. X MIMAR SINAN (+ statue photo) + transition into the Epilogue
13. Credits, `DECISIONS.md`, QA pass, `CHANGELOG.md`

**Must-have:** 1–4 and 9–12 (the story spine, synthesis and name). **High:** 5–8 (photos that teach). **Polish:** archetype refinements, done during each step.

---

## Decisions needed from you (the only checkpoint)

1. **Note B:** hotspot card as a margin panel instead of a modal? *(recommended: yes)*
2. **Note C:** merge the comparison and career strip into one four-plan progression? *(recommended: yes)*
3. **Note D:** update the Epilogue's eyebrow numeral to XI (a one-token change)? *(recommended: a)*
4. **Statue photo:** Dosseman's seated monument (recommended), or Gryffindor's bust?
5. **Title:** your brief calls the site *"Beyond the Dome"*; it's currently titled *"Hold Up the Sky"*. Rename it, or keep the current title?

Reply "approved" (optionally with answers to 1–5). Otherwise I'll go with the recommended options and keep the current title.
