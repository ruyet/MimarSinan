# Redesign rationale

**Project:** Hold Up the Sky — Mimar Sinan · ICT & Media Design, _Typography & Design_
**Branches:** `redesign/sinan-story` (redesign), `refine/final-polish` (refinement) · tags `original-v1`, `v2.0-feedback-stan-bardt`
**Status:** implemented and refined in two rounds (see §16), checked in a browser at six viewport sizes; **not yet tested with
real visitors** (see §13).

This document explains what changed and why, so the design can be defended in an assessment.
It separates five kinds of input and output, which are labelled throughout:

| Label        | Meaning                                                               |
| ------------ | --------------------------------------------------------------------- |
| **Feedback** | Said by a real person (the two teachers).                             |
| **Student**  | The student's own observations and direction (the redesign brief).    |
| **AI**       | A suggestion or decision made by the AI assistant while implementing. |
| **Verified** | Checked in the running site (screenshots, scripted checks) — see §12. |
| **To test**  | An assumption that needs real visitors before it can be claimed.      |

---

## 1. The problem with the first version

The first version had strong pieces — the hand-drawn dome and its collapse, the light
interaction, the drawing-to-photograph reveal — but as a whole it read as generated rather
than designed:

- **Student:** generic colours (navy, parchment, gold, blue) and typography (Fraunces +
  Instrument Sans with italic accents in every headline), decorative em dashes, too many
  headings, captions, figure numbers and Roman numerals.
- **Student:** far too much text (about 1,800 words on screen, see §7), and too many required
  clicks (about 27 actions on the shortest path, see §5).
- **Student:** fragmented: twelve chapters, three of which showed the same photographs again
  (Inside the light, Look closer, and the hotspots), and a career/plan comparison that
  visitors without architectural training could not read.
- **Feedback (Stan):** the layout feels AI-generated; Sinan himself is barely present; it reads
  like an animated Wikipedia article; visitors forget what they saw.
- **Feedback (Bardt):** architectural knowledge cannot be assumed; Sinan should stay present;
  it should feel like a tribute.

## 2. Feedback received

### Stan (expert)

1. Animations are polished and appealing. → _kept: drawing, collapse, light, reveal._
2. The layout feels generically AI-generated. → _new identity, grid and compositions (§8–9)._
3. Sinan's name and identity should be much more prominent. → _he opens and closes the story._
4. Explain why Sinan was extraordinary. → _scene 7 (a lifetime) and scene 8 (remember him)._
5. The story needs a more interesting perspective. → _the man → challenge → masterpiece → legacy → the man._
6. Avoid an animated Wikipedia article. → _copy cut by ~63 %; one idea per scene._
7. Give the visitor a clear goal. → _the opening poses one question: how did he build it?_
8. The three concepts should connect and return. → _they are introduced by doing, named in the reveal, and returned to in scene 8 as three sentences about Sinan._
9. The dome reveal is one of the strongest moments. → _kept and made the central payoff._
10. Photographs should demonstrate principles, not decorate. → _reveal guide; "show only the windows"; three looking-up photos that show the half-domes giving way._
11. E.g. darken a photo while keeping the windows lit. → _implemented literally in scene 6._
12. Visitors forget information soon after. → _less information, each idea repeated in drawing, photo and recap._
13. The ending should summarise meaningful discoveries. → _scene 8._
14. Explain why Sinan was special and how he influenced later architects. → _scene 7._
15. What should the visitor remember? → _§4, the five questions._

### Bardt (teacher)

1. Unusual, strong potential. → _concept kept._
2. Architectural knowledge cannot be assumed. → _no plans to decode; terms limited to "dome", "pier", "half-dome", each shown before it is named._
3. / 4. / 6. / 7. Keep Sinan present; make it a tribute; show his decisions and achievements. → _scenes 1, 3, 7, 8._
4. A perspective inspired by Sinan's thinking. → _the visitor makes the same trade-off he faced (scene 3) — without inventing his thoughts or words._
5. Use interaction to make architectural thinking experiential. → _three interactions remain, each one a decision or a cause-and-effect (§5)._
6. Make the main message memorable. → _one closing line about him, then the epilogue line._
7. Document the student's design decisions. → _this file._
8. Be transparent about AI-assisted implementation. → _§11._
9. The Git workflow is positive. → _work on a branch; the original is tagged `original-v1`._

## 3. UX goals and audience

**Goals (Student):** a visitor with no knowledge of architecture or Ottoman history should
finish knowing who Mimar Sinan was, what made Selimiye special, and why he is remembered —
in a few minutes, with few clicks, and without reading an essay.

**Audience assumptions (Student/AI, to test):** adults and older teenagers, on a laptop or
phone, curious but not specialist; one sitting of 4–8 minutes; sound usually off.

**Emotional arc (Student):** curiosity → challenge → discovery → wonder → understanding →
respect → reflection. It guides the order of scenes; it is not written on screen.

## 4. What a visitor should be able to answer afterwards

1. Who was Mimar Sinan? — _scene 1, repeated in scene 8._
2. Why is he historically important? — _scenes 1, 7, 8: fifty years as chief architect, hundreds of buildings, the architects he trained._
3. What made Selimiye architecturally special? — _scenes 3–6: one dome on eight piers, one undivided room, walls opened to light._
4. How did structure, space and light contribute? — _scenes 3–5 by doing and seeing, scene 8 as three sentences._
5. Why is his work still remembered? — _scenes 7–8 and the epilogue._

**To test:** none of these outcomes has been checked with visitors yet.

## 5. Narrative structure and interaction audit

### From twelve chapters to eight scenes

| First version (12 + credits)                     | Redesign (8 + epilogue)                | Why                                                                |
| ------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------ |
| Prologue ("How do you hold up the sky?")         | **1 Mimar Sinan**                      | The protagonist first: his name and face before anything else.     |
| I The problem                                    | **2 The challenge**                    | Kept the drawing and collapse; removed most labels and the Redraw. |
| II The dilemma + II·b Stand in the room          | **3 Structure**                        | Five options + meters → three answers on one clear drawing.        |
| III Opening the walls                            | **4 Light**                            | Kept; fixed beam layering and reversal; one control.               |
| IV Look up                                       | **5 Look up**                          | Kept the payoff; octagon frame on the piers; no toggles.           |
| V Inside the light + VI Look closer (6 hotspots) | **6 Space** + one optional detail in 7 | One photograph, one optional demonstration.                        |
| VII A tradition, refined + VIII The legacy       | **7 A lifetime**                       | Plans → three photographs looking up; legacy in one paragraph.     |
| IX Why Mimar Sinan matters + X MIMAR SINAN       | **8 Remember him**                     | Recap as sentences about him, with his face clearly visible.       |
| XI Epilogue                                      | **Epilogue**                           | Unchanged words, light and sound.                                  |

### Scene by scene

| Scene          | Purpose → takeaway                                                                | Composition                                            | Interaction                                 |
| -------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------- |
| 1 Mimar Sinan  | Meet him → "the leading architect of his time; one work he called his masterwork" | Name as inscription (7 cols) + monument photo (5 cols) | Begin                                       |
| 2 Challenge    | A dome is heavy → it must rest on something all round its edge                    | Text column + large drawing                            | Let it fall (cause → effect)                |
| 3 Structure    | The trade-off → too few supports fail, too many fill the room; eight do both      | Text + choices + same hall drawing, open floor shaded  | Choose 4 / 16 / 8                           |
| 4 Light        | Freed walls can open → structure made the light possible                          | Mirrored: drawing left; page warms with the room       | Slider or drag (cause → effect)             |
| 5 Look up      | The real thing → the three ideas in one dome                                      | Text + octagon frame centred on the dome               | None required; guide replays on hover/focus |
| 6 Space        | Eye level → one undivided room, lit from every wall                               | One photograph, full bleed                             | Optional: show only the windows             |
| 7 A lifetime   | Not luck → decades of refinement; influence through his pupils                    | Three looking-up photos in a row; legacy; detail       | Optional: minaret stairs                    |
| 8 Remember him | Return to the man → now his name means something                                  | Name again (rhymes with scene 1) + closer portrait     | Continue                                    |
| Epilogue       | Reflection                                                                        | Night, beam of light, small dome                       | Start again / Sources                       |

Transitions are one shared crossfade (0.8 s). Scenes 5 → 6 are written as one movement
("Look up" → "Look around").

### Interaction audit

| First version                                  | Class              | Decision                                                  |
| ---------------------------------------------- | ------------------ | --------------------------------------------------------- |
| Begin                                          | necessary          | kept                                                      |
| Second sound toggle on the opening             | unnecessary        | removed (one toggle in the HUD)                           |
| Release the dome                               | necessary          | kept ("Let it fall")                                      |
| Redraw                                         | unnecessary        | removed                                                   |
| Pier stepper 4/6/8/12/16 + tap ring + tap pier | partly necessary   | → three answers (4, 16, 8); ring/pier tapping removed     |
| Stability and Openness meters                  | unnecessary        | removed; the drawing shows the result                     |
| "Show me Sinan's answer" after 3 tries         | unnecessary        | removed; Sinan's eight is one of the three choices        |
| Stand in the room / Back to the plan           | meaningful         | merged into the structure drawing (shaded open floor)     |
| Open the walls (slider + drag) + light meter   | necessary          | slider + drag kept; meter removed                         |
| Show the drawing / Show annotations toggles    | unnecessary        | removed; one guided pass that stays readable              |
| 12 photo steps (prev/next, wheel, swipe, keys) | mostly unnecessary | → one photograph                                          |
| Inside/Outside switch + 6 hotspots + panel     | optional           | removed; one detail (minaret stairs) kept as a disclosure |
| Step through four plans                        | unnecessary        | → three photographs, no clicks                            |
| Continue (×9)                                  | necessary          | kept, one per scene                                       |

**Shortest path:** about 27 actions → **11** (Begin, Let it fall, Find the support, choose
eight, Continue, open the walls, Continue, Look around, Continue, Continue, Continue).
Counted from the code, not measured with users.

### Navigation (AI, agreed with the brief)

The full-screen scene system was kept rather than replaced by scroll-driven storytelling:
the strongest moments (collapse, light, reveal) are choreographed and need a defined start;
scroll-jacking was explicitly ruled out; and the existing controller already handles focus,
lazy loading and reset. Visitors move forward with one button per scene and back through the
progress bar (every visited scene stays clickable). Deep links (`/#reveal`) remain for testing.

The HUD's three principle icons were removed (a visitor forgot what one meant). Progress is
now a counter and scene name ("5/9 Look up") plus one short dash per scene.

## 6. Information hierarchy

Every scene follows one pattern: **label** (where am I) → **headline** (the idea, 3–6 words)
→ **one sentence** (why it matters) → **the drawing or photograph** (the evidence) → **one
action**. Anything that could be shown is shown instead of written. Optional material
(minaret stairs, "show only the windows") is visibly optional and never blocks the path.

## 7. Content reductions (Student brief, AI implementation)

- **On-screen words: about 1,800 → about 660 (−63 %).** Measured with a script over every
  visible string in `content.ts` (copy, photo notes, hotspot texts), excluding screen-reader-only
  text. Credits text is included in both counts.
- Removed: Roman numerals, figure numbers, margin notes, figure captions on drawings, the
  goal callout, meters and their labels, the model notes beside controls (one short line under
  the drawing remains), Hagia Sophia aside, career-stage plans, four photographs.
- Phrases removed as AI-sounding: "An interactive study", "No architecture knowledge needed",
  "Discover the three ideas…", one-word dramatic headlines ("_Eight._", "It _falls._").
- Italic is used once: the second sentence of the epilogue line, which is spoken, not labelled.
- No em dashes in on-screen copy.

## 8. Visual identity

### Direction (Student brief, AI proposal)

An architectural publication or museum exhibition rather than a "luxury" landing page:
lettering on a limestone wall, archival line drawings, documentary photographs. No Islamic
geometric patterns or ornament: the building's own geometry (the octagon of piers, the striped
arches) is the only motif, and it appears because it explains something.

### Colour

| Token     | Value     | Purpose                                                                                                                                                      |
| --------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Limestone | `#ece8e0` | Light scenes: Edirne stone, the page                                                                                                                         |
| Ink       | `#1a1916` | Text and line work                                                                                                                                           |
| Arch red  | `#9b3520` | The single accent: labels, Sinan's choice, the open floor, the push marks. Taken from Selimiye's red-and-white striped arches (visible in the reveal photo). |
| Night     | `#141311` | Dark scenes (reveal, inside, epilogue): warm charcoal, not navy                                                                                              |
| Daylight  | `#e3c383` | Only where the subject is light: windows, beams, the epilogue                                                                                                |

All text pairs pass WCAG AA (computed: ink/stone 14.4:1, muted/stone 6.0:1, red/stone
5.9:1, paper/night 14.9:1, muted/night 6.9:1, daylight/night 11.0:1).

### Typography

- **Archivo** (variable width and weight) for the name, headlines, labels and interface.
  Semi-condensed and heavy, it reads like lettering cut on a plate or set in an architectural
  monograph; the width axis lets "MIMAR SINAN" become an inscription without a second display
  face.
- **Newsreader** (variable optical size) for all reading text: a calm book serif at 1.2–1.75 rem,
  short measures (about 34 characters per line).
- Self-hosted (SIL OFL), Latin + Latin Extended (for ş, ğ, ı, â), two files preloaded.
- **AI note:** the UI/UX skill used during the redesign recommended Inter + Playfair Display.
  That pairing was rejected on purpose: it is one of the most common "generated" pairings and
  would have recreated the problem the brief describes.

### Grid and composition

One 12-column grid with fluid margins (20–96 px) and gutters. Each scene has its own
composition on that grid (§5), so the site is consistent without every scene being a
split screen. Figures are sized by viewport height as well as width, so they fill 1920×1080 and
2560×1276 screens instead of floating small in the middle.

## 9. Photography and drawings

- **Monument (scene 1, scene 8):** the same photograph, cropped twice — the whole seated
  figure at first, head and shoulders at the end. It is shown as photographed, in daylight;
  the first version darkened it and cut out the sky, which hid the face. Captions say it is a
  modern sculpture (no likeness from Sinan's lifetime is claimed).
- **Reveal (scene 5):** the frame is an **octagon whose corners sit on the eight piers**.
  Reason (AI, verified): the dome is not centred in the photograph (it sits 3.7 % low). A circle
  centred on the dome could only reach 46 % before running off the photo, which cut away the
  arches where the piers stand. An octagon's flat bottom edge sits nearer the centre than its
  corners, so it can reach the piers without exposing the photo's edge. It also turns the plan's
  own octagon into the window onto the real building.
- **Space (scene 6):** "Show only the windows" darkens the photograph except fifteen window
  areas, measured by drawing each rectangle onto the photo over a 5 % grid.
- **Lifetime (scene 7):** three new Commons photographs (Şehzade, Süleymaniye, Selimiye),
  each looking straight up and centred on its main dome. They replace the plan comparison:
  a visitor can see four half-domes, then two, then one dome alone, without reading a plan.
  A note says the photos use different lenses and are not to scale.
- **Hall drawing:** one renderer now serves the structure and light scenes (4, 8 or 16
  supports; window rows; light), so the visitor keeps looking at the same room.

## 10. Motion

- **Kept:** the pen-drawn hall and the dome collapse with dust; the light shafts; the plan
  turning into the photograph; the epilogue beam and motes.
- **Removed:** word-by-word headline reveals on every scene, the sweeping light band across
  the name, parallax tilts on photos, long staggered entrances.
- **Rule:** text is readable within about half a second (one short shared fade); motion is
  spent on cause and effect (weight falling, supports rising, light entering, drawing becoming
  photograph). The name rises once at the start and once at the end, the same gesture, so the
  two scenes read as a pair.
- **Reduced motion** (OS setting or `?reduced-motion`): every scene reaches the same final
  state with simple fades; the collapse becomes a fade; the reveal skips the camera move.

## 11. The role of AI

The redesign was directed by the student (the brief, the critique in §1, the teachers'
feedback) and implemented with an AI coding assistant (Claude, in Claude Code). In detail:

- **Student:** narrative principle (the man → challenge → masterpiece → legacy → the man),
  every critique of the first version, what to keep (dome drawing, light interaction, reveal,
  sound, epilogue line), the constraints on accuracy and copy length.
- **AI:** the scene breakdown and copy drafts, the colour and type choices, the octagon frame,
  the three-photo career comparison, the support comparison (4 / 16 / 8), the code, the
  calibration of photo overlays, and the browser checks in §12.
- **Tools used:** a UI/UX design-knowledge skill (queried for a design system and type
  pairings; its pattern advice — progress indicator, readable final states under reduced
  motion — was followed, its font advice was not), browser automation for screenshots and
  scripted checks. A 21st.dev component service was available; no components were taken from it.
- Every claim on screen was checked against the sources in `content.ts`; the AI did not add
  facts that are not listed there.

## 12. Historical accuracy decisions

- No quotation is attributed to Sinan. "Apprentice, journeyman, master" is reported speech
  from his biographies, without quotation marks.
- No thoughts, dialogue or intentions are invented for him.
- Eight piers are presented as **Sinan's answer at Selimiye**, not as the correct number:
  the structure scene says "Domes have been carried in many ways. Hagia Sophia used two great
  half-domes. This was Sinan's answer at Selimiye." The support drawing is labelled "A
  simplified drawing, not an engineering model."
- The legacy line does **not** claim the Sultan Ahmed Mosque copies Selimiye: its plan grows
  from Şehzade, which the scene says (and which links back to the first of the three photos).
- The monument is described as a modern sculpture.
- Numbers are rounded as the sources give them ("about 31 metres", "about fifty years",
  "hundreds of buildings").
- **Interpretation, marked here:** that the three photographs show the half-domes "giving way"
  to one dome is the visitor's reading of the photographs; the page itself only describes each
  building (four half-domes / two half-domes / one dome on eight piers).

## 13. Verification

**Verified (in the running site, Chromium, via browser automation):**

- Every scene at 1920×1080, 2560×1276 and 375×812 (phone); key scenes at the same sizes in
  reduced motion. No horizontal overflow at 375 px. At 1920×1080 every scene fits without
  scrolling except the credits.
- Full path from scene 1 to the epilogue using only the primary buttons; focus moves to each
  scene's heading; "Start again" resets every scene (drawing, choices, light level, photo
  toggle, reveal guide); jumping back through the progress bar works.
- Light beams: drawn behind every pier, the dome and the cut walls; after rapidly opening and
  closing all rows, zero windows, shafts or pools remain lit (scripted check).
- Keyboard: the three support choices form a radio group with arrow-key roving focus.
- `npm run build` (type-check + bundle) and `npm run lint` pass. Initial JavaScript ≈ 44 KB
  gzipped; each later scene is a separate chunk of 1–3 KB.
- Contrast ratios computed for every text/background pair (§8).

**Not verified / to test with visitors:**

- Whether visitors can answer the five questions in §4, and how long the visit takes.
- Whether "Sixteen supports" and "Four supports" are understood without explanation.
- Screen-reader experience end to end (structure and announcements were checked in code,
  not with NVDA/VoiceOver).
- Safari and Firefox rendering (only Chromium was used), and real touch devices (touch was
  emulated).
- Sound was not listened to; the audio engine and its calls were left unchanged apart from
  scene names.

## 14. What was reused and what was removed

**Reused:** the scene controller (lazy chunks, focus, reset), the audio engine, the axonometric
projection, the dome and floor-plan renderers, the collapse and dust, the hall renderer
(extended), the photo annotator, the reveal's drawing-to-photo choreography, the epilogue
(words, light, motes, sound), the fact and source list, the image pipeline.

**Removed:** chapters _dilemma, discover, masterwork, legacy, synthesis, walls, opening_ (as
written); the principle index and its icons; the stability model and meters; the pier plan and
floor-view panorama; the plan comparison drawings; the sky cutout of the monument; four
photographs; Fraunces and Instrument Sans; the old stylesheets.

## 15. Trade-offs and open questions

- **Fewer clicks vs. agency.** Removing the photo tour and hotspots removes exploration that
  some visitors may enjoy. The minaret detail and the windows toggle keep a little of it.
- **Three supports options vs. five.** Three make the trade-off readable; they also hide that
  six or twelve could be reasonable in other buildings. The "many ways" line is the mitigation.
- **The octagon frame** is a strong graphic idea; a visitor might read it as the building's
  real outline. The drawing turns into it, which should make its meaning clear — to test.
- **The monument photograph** has a bright blue sky that sits outside the stone palette.
  It was kept unaltered because it is the honest, well-lit image of Sinan's face.
- **The previous `DECISIONS.md` and `IMPROVEMENT_PLAN.md`** describe the first version and
  are kept as history; where they conflict with this document, this document applies.

---

## 16. Revision 2: refinement (branch `refine/final-polish`)

The redesign's direction was approved (**Student**). This round fixes what still felt
unfinished. Nothing was redesigned for its own sake: palette, type, drawings, collapse, light
interaction, reveal, interior photo, ending and epilogue are kept.

### Issues identified (Student review of a screen recording) and what changed

| Issue                                                                            | Change                                                                                                                                                                                                                                                                                                                                          | Verified                                                                                                                                              |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Choosing a support count moved the whole text column (up to 75 px).              | All explanations are rendered up front and stacked in one grid cell (as tall as the longest); Continue keeps its place invisibly until it appears.                                                                                                                                                                                              | Title, buttons, text and drawing: 0 px movement over 4→8→16→4→16→8, at 1920 and 390 px wide.                                                          |
| Options were 4 / 16 / "Sinan's 8", with 8 styled differently.                    | 4 / 8 / 16, identical number buttons; one selected style. "Sinan's answer" is revealed only after 8 is chosen. The generic "many ways" paragraph is removed; the nuance lives in the 4 text ("in this simplified drawing") and the note under the drawing.                                                                                      | Buttons measured 112 × 64 px each.                                                                                                                    |
| Reaching full light pushed the layout up when the conclusion appeared.           | The conclusion and Continue hold their place from the start and fade in; the conclusion fades out again if the walls are closed. Body text shortened to one sentence.                                                                                                                                                                           | 0 px movement through every light level, forwards and back; no shafts, pools or windows remain lit at level 0.                                        |
| In the reveal, "Look around" appeared before the three ideas.                    | New order: drawing → photograph (waits until it is decoded) → title → Structure, Light, Space one by one with their highlights → "Look around" 2.5 s after the third → clean photo. Space for the three lines is reserved.                                                                                                                      | Timeline sampled step by step (below).                                                                                                                |
| The window highlight had to be found and clicked.                                | It plays once automatically, about 0.8 s after the photograph has decoded, for about 2 s, then returns; the toggle stays. A click during the demo cancels it; a visitor's "on" is never overridden; leaving the scene cancels it; reduced motion skips it.                                                                                      | Dim level sampled over time; click-during-demo, revisit with toggle on, and revisit after toggling off all checked.                                   |
| "A lifetime" mixed career, legacy, age and a staircase in one slide.             | Split: **A lifetime** shows only the three works (aligned, same size, short labels); the age moved into the introduction ("after decades of building, when he was in his eighties"). **After Sinan** is its own short scene.                                                                                                                    | Both fit without scrolling from 1280 × 720 to 2560 × 1276.                                                                                            |
| Legacy was squeezed under the progression.                                       | One photograph, two sentences, and the same Şehzade disc as in the previous scene, so "its plan grows from Şehzade" is visible, not only stated. Selimiye's eight piers are not claimed as its model.                                                                                                                                           | —                                                                                                                                                     |
| The minaret detail sat in a crowded corner.                                      | An optional "One remarkable detail" button opens a native dialog (Esc, backdrop and Close all dismiss it; focus moves to Close). The drawing is labelled "Schematic drawing, not to scale."                                                                                                                                                     | Dialog open/close and focus checked.                                                                                                                  |
| The ending sometimes appeared pale before settling; the epilogue text flashed.   | Root cause (verified in code): the controller called each scene's entrance 0.3 s into the crossfade, so incoming content was painted in its final state first; the epilogue's words were only hidden when their reveal began at 0.9 s. The entrance now runs on the first frame of the crossfade, and the epilogue hides its words immediately. | On the first frame of the transition every text element of the ending and all epilogue words have opacity 0, both via Continue and via a direct jump. |
| The ending listed three principles as rows.                                      | One sentence: "At Selimiye, structure, space and light became one building…", then three plain facts at body size.                                                                                                                                                                                                                              | —                                                                                                                                                     |
| "Type & making" on the public credits page.                                      | Removed from the page (it remains in this document, §8 and §11). All image authors, licences, links and text sources stay.                                                                                                                                                                                                                      | Credits headings: Photographs, Sources.                                                                                                               |
| Thin grey caption under the opening monument.                                    | Removed; "a modern sculpture" moved into the alt text, and the credits list the photo.                                                                                                                                                                                                                                                          | —                                                                                                                                                     |
| Controls looked unrelated (segmented boxes, a rounded switch, a details marker). | One family: 48 px height, 1 px border, no radius, Archivo caps; number buttons 64 px with the same border and the same selected colour as the primary action.                                                                                                                                                                                   | —                                                                                                                                                     |
| Progress marks were very faint.                                                  | Ticks 22 × 3 px with higher contrast (unvisited 0.3, visited 0.75, current in the accent). Still one row, no labels.                                                                                                                                                                                                                            | —                                                                                                                                                     |
| Reduced motion could leave a scene hidden.                                       | The reduced-motion stylesheet set every transition to 0.01 ms on all properties, so a scene's visibility could wait on a transition. Durations are now exactly 0.                                                                                                                                                                               | Reveal under reduced motion: title, three ideas and button visible.                                                                                   |

### Narrative structure after this round

Mimar Sinan → The challenge → Structure → Light → Look up → Space → A lifetime → **After Sinan**
→ Remember him → Epilogue (10 parts in the progress bar; credits sit outside it).

### Why lifetime and legacy were separated

Each answers a different question: _how did he get here?_ (decades of refinement, shown by
three photographs) and _what happened after him?_ (his pupils, one building). Together on one
page they competed; apart, each needs one glance and one sentence.

### Reveal timeline as verified (seconds after the photograph opens, sampled at 4.5 s per step)

Title +0 → Structure +1.5 → Light +6 → Space +10.5 → "Look around" +13 → clean photo +14.5.
The step was then shortened to 4 s, so each idea now arrives about 4 s after the previous one.

### Responsive check (scripted: scroll height vs. viewport, elements outside the viewport)

| Viewport    | Result                                                                     |
| ----------- | -------------------------------------------------------------------------- |
| 2560 × 1276 | Every scene fits; no overflow.                                             |
| 1920 × 1080 | Every scene fits; no overflow.                                             |
| 1280 × 720  | Every scene fits after compact rules for short screens; no overflow.       |
| 768 × 1024  | Single column; scenes scroll vertically by design; no horizontal overflow. |
| 390 × 844   | Same; drawings stay pinned above their controls; no horizontal overflow.   |
| 360 × 740   | Same; no horizontal overflow.                                              |

Elements flagged outside the viewport in "Look up" and the epilogue are the faded plan drawing
and the light layer, both inside clipped containers; the document never scrolls sideways.

### Still to validate

- Everything listed in §13 (comprehension, timing, screen readers, Safari and Firefox, real
  touch devices, sound) still needs real visitors or devices.
- Whether 4 s per idea in the reveal is the right pace, and whether visitors notice the optional
  detail button.
- Whether the automatic window demonstration reads as an explanation rather than a glitch.
- Visual checks were made with browser automation in a hidden browser pane, where images and
  timers are throttled. Layout was measured by script; some screenshots were taken before
  photographs had painted.

---

## 17. Iteration after the first usability test

Four participants tested `v2.1-final-polish`. Their responses, the problems found, and the
changes made (the step 5 reliability fix, a central Back control, plainer terms, a career
timeline, and a clearer legacy link) are documented in
[`USABILITY_ITERATION_2.md`](USABILITY_ITERATION_2.md).
