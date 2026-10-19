/**
 * Entry point: builds the HUD, registers the scenes and starts the story.
 *
 * Stack note: vanilla TypeScript + GSAP. The experience is a short, linear sequence of
 * hand-choreographed scenes, so a component framework would add weight without solving a real
 * problem; each scene is a small module with enter/leave hooks.
 */
import './styles/main.css';
import { gsap } from 'gsap';
import { createChallenge } from './chapters/challenge';
import { createSinan } from './chapters/sinan';
import { chapters, type ChapterId } from './content';
import { initAnnouncer } from './core/announcer';
import { createChapterController } from './core/chapters';
import { bindSoundToggle, soundToggleContents } from './core/soundToggle';

const $ = <T extends HTMLElement>(sel: string): T => {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el;
};

initAnnouncer($('#announcer'));

const hudSound = $<HTMLButtonElement>('#sound-toggle');
hudSound.innerHTML = soundToggleContents();
bindSoundToggle(hudSound);

const controller = createChapterController(
  $('#stage'),
  $<HTMLOListElement>('#progress-list'),
  $('#progress-label'),
);

// The first two scenes ship with the page; the rest are split into their own chunks and
// fetched while the previous scene is on screen.
controller.register(createSinan(controller));
controller.register(createChallenge(controller));
controller.registerLazy('structure', () =>
  import('./chapters/structure').then((m) => m.createStructure(controller)),
);
controller.registerLazy('light', () =>
  import('./chapters/light').then((m) => m.createLight(controller)),
);
controller.registerLazy('reveal', () =>
  import('./chapters/reveal').then((m) => m.createReveal(controller)),
);
controller.registerLazy('inside', () =>
  import('./chapters/inside').then((m) => m.createInside(controller)),
);
controller.registerLazy('lifetime', () =>
  import('./chapters/lifetime').then((m) => m.createLifetime(controller)),
);
controller.registerLazy('legacy', () =>
  import('./chapters/legacy').then((m) => m.createLegacy(controller)),
);
controller.registerLazy('name', () =>
  import('./chapters/name').then((m) => m.createName(controller)),
);
controller.registerLazy('epilogue', () =>
  import('./chapters/epilogue').then((m) => m.createEpilogue(controller)),
);
controller.registerLazy('credits', () =>
  import('./chapters/credits').then((m) => m.createCredits(controller)),
);

// Deep links for user testing, e.g. /#structure jumps straight to that scene.
const fromHash = (): ChapterId | null => {
  const id = location.hash.slice(1);
  return chapters.find((c) => c.id === id)?.id ?? null;
};
controller.start(fromHash() ?? 'sinan');
window.addEventListener('hashchange', () => {
  const id = fromHash();
  if (id) controller.goTo(id);
});

// Dev-only hook for QA: lets tests fast-forward timelines (e.g. __gsap.globalTimeline.timeScale(8)).
if (import.meta.env.DEV) Object.assign(window, { __gsap: gsap });
