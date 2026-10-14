/**
 * Entry point: builds the HUD, registers chapters and starts the story.
 *
 * Stack note: vanilla TypeScript + GSAP. The experience is a linear sequence of
 * hand-choreographed scenes, so a component framework would add weight without
 * solving a real problem; each chapter is a small module with enter/leave hooks.
 */
import './styles/main.css';
import { createOpening } from './chapters/opening';
import { createProblem } from './chapters/problem';
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

controller.register(createOpening(controller));
controller.register(createProblem(controller));

// Deep links for user testing, e.g. /#problem jumps straight to chapter I.
const fromHash = (): ChapterId | null => {
  const id = location.hash.slice(1);
  return chapters.find((c) => c.id === id)?.id ?? null;
};
controller.start(fromHash() ?? 'opening');
window.addEventListener('hashchange', () => {
  const id = fromHash();
  if (id) controller.goTo(id);
});
