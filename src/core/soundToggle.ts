/**
 * Binds any number of sound-toggle buttons to the single audio engine state.
 * Uses aria-pressed so assistive tech reports "Sound, toggle button, pressed / not pressed".
 */
import { audio } from '../audio/audio';
import { copy } from '../content';
import { announce } from './announcer';

export function bindSoundToggle(button: HTMLButtonElement): void {
  const label = button.querySelector<HTMLElement>('[data-sound-label]');

  audio.subscribe((on) => {
    button.setAttribute('aria-pressed', String(on));
    if (label) label.textContent = on ? copy.meta.soundOn : copy.meta.soundOff;
  });

  button.addEventListener('click', () => {
    void audio.toggle();
    announce(audio.enabled ? copy.meta.soundAnnounceOn : copy.meta.soundAnnounceOff);
  });
}

/** Markup shared by every toggle: three small equaliser bars + a text label. */
export function soundToggleContents(): string {
  return `<span class="sound-toggle__icon" aria-hidden="true"><span></span><span></span><span></span></span><span data-sound-label>${copy.meta.soundOff}</span>`;
}
