# Usability iteration 2

**What:** changes made after the first usability test of the redesigned site (tag
`v2.1-final-polish`, plus the subfolder fix). **Branch:** `iteration/user-test-2`.
**Status:** implemented and checked in a browser; to be tested with a new group (§7).

## 1. The test

|              |                                                                                                                                                                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Participants | 4. Three did not know Mimar Sinan before; one did.                                                                                                                                                                                                    |
| Format       | Unguided: each participant went through the site alone, then answered a short survey.                                                                                                                                                                 |
| Questions    | 1. Who was Mimar Sinan, and what made his work special? · 2. What's one thing you remember learning from the website? · 3. Was anything confusing or difficult to understand? · 4. If you could change one thing about the website, what would it be? |

This is a small, qualitative test. Nothing below is statistically significant; a single
participant's comment is treated as a signal to look at, not as a general preference.

## 2. Responses (anonymised, as written)

**Q1. Who was Mimar Sinan, and what made his work special?**

- P1: "Mimar Sinan was one of the greatest architects in Islamic and Ottoman history."
- P2: "He is an architect and made lots of designs for mosques."
- P3: "He was an architect in Ottoman Empire. I think what made his work special was the light that was able to enter the dome."
- P4: "an architect during the ottoman empire"

**Q2. What's one thing you remember learning from the website?**

- P1: "...Mimar Sinan designed the Selimiye Mosque using eight massive pillars to support one enormous dome, creating a spacious interior filled with natural light. I found it impressive how he combined engineering with beautiful architecture."
- P2: "How the light enters from all yhe windows from the dome"
- P3: "That he built 8 pillars that supported the dome, so that he could use the walls between them to let the light in."
- P4: "selimye: the planning, care and dedication that went into this building"

**Q3. Was anything confusing or difficult to understand?**

- P1: "...some of the architectural terms and explanations about how the domes were constructed a bit difficult to understand. More simple explanations or visuals would make it easier to follow."
- P2: "Everything was nicely shown and informative"
- P3: "No"
- P4: "not at all, pretty straight forward and clear. especially thanks to the animated illustrations"

**Q4. If you could change one thing about the website, what would it be?**

- P1: "...Maybe make a bit easier to navigate previous page."
- P2: "Maybe add more mosques that he build, just to summarize all the work that he has done with name, location and a description in 1 sentence"
- P3: "On step 5, the website took a bit longer to load, so I was confused for a moment about what I needed to do to continue. ... I especially liked the POV perspective and the interactive parts, such as adding the windows to the wall and the section with the pillars. ... I also liked that the experience wasn't too long."
- P4: "maybe more examples of his influence on buildings after his passing (like slide 8/10: after sinan)"

The student also reported (from observing the session) that in step 5 the three ideas did not
finish appearing for one participant in Chrome, who had to go back and return to continue.

## 3. What worked (keep)

- All four identified Sinan as an architect; three placed him in the Ottoman Empire.
- Three of four recalled the core idea in their own words: eight supports → one dome → walls
  free for windows → light (P1, P3, and P2 in part).
- The animated drawings were named as what made it clear (P4); the support and window
  interactions and the first-person "look up" view were named as engaging (P3).
- The length was appreciated (P3).

None of these were changed, except for the reliability fix in step 5.

## 4. Problems and changes

| #   | Finding (source)                                                                                                                                   | Change                                                                                                                                                                                                                                                                                             | Verified                                                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Step 5 ("Look up"): the three ideas did not finish appearing; no way to continue (student's observation, P3's "confused ... what I needed to do"). | **Root cause found and fixed** (below). The first idea now appears as soon as the photograph has opened; the others follow 1.5 s apart, and "Look around" 1 s after the third (about 4 s instead of about 11 s). A real-time safety net shows the finished scene after 12 s whatever else happens. | Reproduced the failure before the fix; after it: hover, frozen animation engine, never-loading photo, back-and-forth mid-scene, reduced motion (§6). |
| 2   | Going back was not easy (P1).                                                                                                                      | One **Back** control in the header, always in the same place, on every scene except the first. The browser's own Back button now also works.                                                                                                                                                       | Back, forward again, rapid presses, browser history, restart (§6).                                                                                   |
| 3   | Some terms and dome explanations were hard (P1).                                                                                                   | Plainer copy where a term first appears (below). The drawings still carry the explanation; no glossary, no tooltips.                                                                                                                                                                               | Copy review against the facts list.                                                                                                                  |
| 4   | More of his work, with name, location and one line (P2).                                                                                           | "A lifetime" gains **one timeline of his fifty years** as chief architect: the three mosques above it, plus three other works (a mosque in Istanbul, a bridge in Bosnia, a late mosque in Manisa) and one sourced line on the scale of his work.                                                   | Fits one screen from 1280 × 720 up; vertical on phones.                                                                                              |
| 5   | More examples of influence after his death (P4).                                                                                                   | "After Sinan" now opens with the line continued past 1588, and tells one connection properly: the pupil who finished Sinan's Muradiye Mosque later designed the Sultan Ahmed Mosque.                                                                                                               | Sources below.                                                                                                                                       |

### The step 5 bug: what actually happened

The scene had one schedule for two different things: revealing the three lines plus the
button, and walking the highlights over the photograph. Hovering, focusing or clicking a line
stopped that schedule so the visitor could take over the highlights. That also cancelled the
lines and the button still waiting to appear. A visitor whose mouse passed over the first line
while reading it was left with one line and no way on. Going back and returning showed the
finished scene, which matches what was reported.

It is not specific to Chrome: it depends on where the mouse is. It was reproduced in the
Chromium-based test browser by sending one hover to the first line (lines `true,false,false`,
no button, even 40 simulated seconds later).

The fix splits the two schedules. Content can no longer be cancelled; interaction stops only
the highlights and reveals everything at once. A timer that does not depend on the animation
library restores the finished scene after 12 s if the button is still hidden. The photo wait
was also shortened from 4 s to 2.5 s.

### Terminology

| Before                                                                                 | After                                                                                                              |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| "eight piers stand close to the walls" (first use, unexplained)                        | "Sinan used eight piers: massive stone pillars, close to the walls." Participants said "pillars" themselves.       |
| "Long spans between them"                                                              | "Big gaps between them"                                                                                            |
| "The eight piers carry the dome, so the walls between them can be opened for windows." | "The eight piers carry the dome. The walls between them hold up much less, so Sinan could fill them with windows." |
| "half-domes" (unexplained)                                                             | Explained once, where the photos show them: "the half-domes, smaller domes that lean against the main one"         |
| "A dome braced by four half-domes"                                                     | "A main dome held up by four half-domes"                                                                           |
| "Eight piers carry the dome..." (reveal)                                               | "The eight piers, massive stone pillars, carry the dome..."                                                        |

### Career and legacy: what was added, and what was not

- **His own work** (scene 7) and **later influence** (scene 8) stay separate scenes. The line
  in scene 7 ends at 1588; scene 8 continues it.
- **Timeline items and sources** (new facts in `content.ts`): chief architect from 1539
  (Wikipedia, "Mimar Sinan"); Rüstem Pasha Mosque, Istanbul, 1561–1563 (Wikipedia); the bridge
  over the Drina at Višegrad, 1571–1577, UNESCO World Heritage (Wikipedia, UNESCO); the Muradiye
  Mosque, Manisa, 1583–1586, designed by Sinan and built by Mahmud Halife and, from January
  1586, by Sedefkâr Mehmed Ağa (Wikipedia citing Necipoğlu 2005; TDV İslâm Ansiklopedisi).
- The Muradiye shows that Selimiye was not his last work. It also links the two scenes: its
  builder became the architect of the Sultan Ahmed Mosque. Its plan grows from Şehzade, not from
  Selimiye's eight piers, and the scene says so.
- **Scale** is stated cautiously: "Hundreds of works are attributed to Sinan and the architects
  he led." Counts in the sources range from at least 374 to 476 buildings; no single number is
  shown.
- **Not added:** a list of dozens of mosques, a scrolling or animated timeline, extra mandatory
  clicks. The timeline draws once in under a second and reads at a glance.

## 5. Unchanged on purpose

The dome collapse, the 4 / 8 / 16 support choice, the window slider, the drawing-to-photo
reveal, the first-person view, the window highlight, the name scene, the epilogue and the sound.

## 6. Checks performed

- **Step 5:** one hover now reveals all lines and the button. With the animation engine frozen,
  the safety net restored the full scene: photo open, title, three lines and button. With a
  photo URL that never answers, the scene still completed. Back pressed mid-reveal and coming
  forward again shows the finished scene. Under reduced motion everything shows at once.
- **Back:** hidden and disabled on scene 1. Each scene keeps its state when revisited (for
  example the chosen number of supports). Three rapid presses stop at scene 1. Browser
  back/forward follow the story, deep links work, restart works.
- **Full path** with only the main buttons, scene 1 → epilogue → restart.
- **Layout:** every changed scene fits without scrolling at 1280 × 720, 1920 × 1080 and
  2560 × 1276. At 1024 × 768 "A lifetime" scrolls by about 60 px. Phones (390 × 844) and
  tablets (768 × 1024) scroll vertically as designed, with the timeline vertical. No label
  collisions and no horizontal overflow.
- **Hera:** the production build served under `/MimarSinan/` loads every image URL (scenes 5,
  7 and 8 checked: 29 and 45 URLs, all 200); no request went outside the folder.
- `npm run lint` and `npm run build` pass.

**Not verified:** a second browser engine (only the Chromium-based test browser was used);
real slow networks (a non-responding image URL stood in for one); real touch devices; screen
readers. Browser automation ran in a hidden pane where animation frames are throttled or
paused, so animation timing was checked by stepping the animation clock, not by watching it.

## 7. Next test (planned)

A new group, unguided, with the same survey. Changes to look for:

1. Do participants say **why** Sinan matters, not only that he was an architect? (Q1 answers
   in round 1 were mostly "an architect".)
2. Does anyone mention his other works, or that his influence continued (scenes 7–8)?
3. Does anyone report terms as hard to follow?
4. Does anyone get stuck, or report trouble going back?
5. Does the experience still feel short? (P3 valued this; scene 7 now holds more.)

Optional addition to the survey: "Did Selimiye come early or late in his career?" This would
check whether the timeline is read.
