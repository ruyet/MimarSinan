/**
 * Splits a headline into per-word spans for line-by-line reveals, while keeping one
 * clean, readable copy for assistive tech.
 *
 * Phrases wrapped in *asterisks* in content.ts are set in <em>.
 * Returns the inner word spans (the elements to animate).
 */
export function splitHeadline(el: HTMLElement, text: string): HTMLElement[] {
  const plain = text.replace(/\*/g, '');
  el.textContent = '';

  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = plain;

  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');

  const words: HTMLElement[] = [];
  let italic = false;

  text.split(/(\s+)/).forEach((token) => {
    if (/^\s+$/.test(token)) {
      visual.append(document.createTextNode(' '));
      return;
    }
    // Asterisks toggle emphasis; they may open and close within the same token.
    const opens = token.startsWith('*');
    const closes = token.endsWith('*') && token.length > 1;
    const word = token.replace(/\*/g, '');
    if (opens) italic = true;

    const line = document.createElement('span');
    line.className = 'split-line';
    const inner = document.createElement(italic ? 'em' : 'span');
    inner.className = 'split-word';
    inner.textContent = word;
    line.append(inner);
    visual.append(line);
    words.push(inner);

    if (closes) italic = false;
  });

  el.append(sr, visual);
  return words;
}
