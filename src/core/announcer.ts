/**
 * Screen-reader announcements through a single polite aria-live region.
 * Clearing first and writing on the next frame makes repeated messages re-announce.
 */
let region: HTMLElement | null = null;

export function initAnnouncer(el: HTMLElement): void {
  region = el;
}

export function announce(message: string): void {
  if (!region) return;
  region.textContent = '';
  requestAnimationFrame(() => {
    if (region) region.textContent = message;
  });
}
