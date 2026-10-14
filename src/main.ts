/**
 * Entry point: builds the HUD, registers chapters and starts the story.
 *
 * Stack note: vanilla TypeScript + GSAP. The experience is a linear sequence of
 * hand-choreographed scenes, so a component framework would add weight without
 * solving a real problem; each chapter is a small module with enter/leave hooks.
 */
import './styles/main.css';
import { gsap } from 'gsap';
import { createOpening } from './chapters/opening';
import { createProblem } from './chapters/problem';
import { chapters, type ChapterId } from './content';
import { initAnnouncer } from './core/announcer';
import { createChapterController } from './core/chapters';
import { mountDiscoveryIndex } from './core/principles';
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
mountDiscoveryIndex($('#discovery'));

const controller = createChapterController(
  $('#stage'),
  $<HTMLOListElement>('#progress-list'),
  $('#progress-label'),
);

// The first two chapters ship with the page; the rest are split into their own chunks and
// fetched while the previous chapter is on screen.
controller.register(createOpening(controller));
controller.register(createProblem(controller));
controller.registerLazy('dilemma', () =>
  import('./chapters/dilemma').then((m) => m.createDilemma(controller)),
);
controller.registerLazy('walls', () =>
  import('./chapters/walls').then((m) => m.createWalls(controller)),
);
controller.registerLazy('reveal', () =>
  import('./chapters/reveal').then((m) => m.createReveal(controller)),
);
controller.registerLazy('inside', () =>
  import('./chapters/inside').then((m) => m.createInside(controller)),
);
controller.registerLazy('discover', () =>
  import('./chapters/discover').then((m) => m.createDiscover(controller)),
);
controller.registerLazy('masterwork', () =>
  import('./chapters/masterwork').then((m) => m.createMasterwork(controller)),
);
controller.registerLazy('legacy', () =>
  import('./chapters/legacy').then((m) => m.createLegacy(controller)),
);
controller.registerLazy('synthesis', () =>
  import('./chapters/synthesis').then((m) => m.createSynthesis(controller)),
);
controller.registerLazy('epilogue', () =>
  import('./chapters/epilogue').then((m) => m.createEpilogue(controller)),
);
controller.registerLazy('credits', () =>
  import('./chapters/credits').then((m) => m.createCredits(controller)),
);

// Deep links for user testing, e.g. /#dilemma jumps straight to chapter II.
const fromHash = (): ChapterId | null => {
  const id = location.hash.slice(1);
  return chapters.find((c) => c.id === id)?.id ?? null;
};
controller.start(fromHash() ?? 'opening');
window.addEventListener('hashchange', () => {
  const id = fromHash();
  if (id) controller.goTo(id);
});

// Dev-only hook for QA: lets tests fast-forward timelines (e.g. __gsap.globalTimeline.timeScale(8)).
if (import.meta.env.DEV) Object.assign(window, { __gsap: gsap });
