/**
 * content.ts — the single source of truth for every word, fact, image path and credit.
 *
 * Edit text here without touching any logic. Conventions:
 *  - Headlines may wrap a phrase in *asterisks* to set it in italic (rendered by splitText).
 *  - Every fact carries a `source`. Numbers that differ between sources are marked `// VERIFY`.
 *  - Image paths point into /public/images (see /public/images/CREDITS.md).
 */

/* ------------------------------------------------------------------ */
/* Sources                                                             */
/* ------------------------------------------------------------------ */

export interface Source {
  label: string;
  url?: string;
}

export const sources = {
  unescoSelimiye: {
    label:
      'UNESCO World Heritage Centre, "Selimiye Mosque and its Social Complex" (inscribed 2011, ref. 1366)',
    url: 'https://whc.unesco.org/en/list/1366',
  },
  unescoIstanbul: {
    label: 'UNESCO World Heritage Centre, "Historic Areas of Istanbul" (ref. 356)',
    url: 'https://whc.unesco.org/en/list/356',
  },
  necipoglu: {
    label:
      'Gülru Necipoğlu, The Age of Sinan: Architectural Culture in the Ottoman Empire (Reaktion Books, 2005)',
  },
  goodwin: {
    label: 'Godfrey Goodwin, A History of Ottoman Architecture (Thames & Hudson, 1971)',
  },
  kuban: {
    label: 'Doğan Kuban, Ottoman Architecture (Antique Collectors’ Club, 2010)',
  },
} satisfies Record<string, Source>;

/* ------------------------------------------------------------------ */
/* Facts (used by hotspots, captions and the comparison aside)         */
/* ------------------------------------------------------------------ */

export interface Fact {
  id: string;
  title: string;
  text: string;
  source: Source;
}

export const facts: Fact[] = [
  {
    id: 'completion',
    title: 'Completed 1574–75',
    text: 'Built for Sultan Selim II in Edirne and finished in 1574–75, shortly after the sultan’s death.',
    source: sources.unescoSelimiye,
  },
  {
    id: 'masterwork',
    title: 'Sinan’s masterwork',
    // Sinan's autobiographies describe the Şehzade as his apprentice work, the Süleymaniye as his
    // journeyman work and the Selimiye as his masterwork.
    text: 'Sinan described the Şehzade Mosque as his apprentice work, the Süleymaniye as his journeyman work, and the Selimiye as his masterwork.',
    source: sources.necipoglu,
  },
  {
    id: 'age',
    title: 'Around eighty years old',
    // VERIFY: Sinan's birth year is uncertain (usually given as c. 1488–1490).
    text: 'Sinan was around eighty when the mosque was completed.',
    source: sources.necipoglu,
  },
  {
    id: 'dome',
    title: 'One dome, eight piers',
    // VERIFY: dome diameter is given between ~31.2 m and ~31.5 m depending on the source.
    text: 'A single dome of about 31 metres in diameter rests on eight piers arranged in an octagon.',
    source: sources.unescoSelimiye,
  },
  {
    id: 'mahfil',
    title: 'The müezzin platform',
    text: 'A raised müezzin platform (müezzin mahfili) stands at the very centre of the prayer hall, directly beneath the dome.',
    source: sources.goodwin,
  },
  {
    id: 'minarets',
    title: 'Four slender minarets',
    // VERIFY: minaret height is commonly given as ~70.9 m (excluding / including finial varies).
    // VERIFY: which two minarets have three independent staircases.
    text: 'Four minarets, each about 71 metres tall with three balconies, frame the dome. In two of them, three separate staircases lead to the three balconies.',
    source: sources.kuban,
  },
  {
    id: 'windows',
    title: 'A building made of light',
    // VERIFY: the window count varies by source and by what is counted (often cited as 384).
    text: 'Because the walls no longer carry the main weight, they can be opened with hundreds of windows.',
    source: sources.kuban,
  },
  {
    id: 'tulip',
    title: 'The upside-down tulip (legend)',
    // VERIFY: this is a popular legend, not a documented fact. Keep it framed as a legend.
    text: 'Legend says a carved tulip on a marble column of the müezzin platform is upside down, recalling a landowner who refused to sell his tulip garden for the mosque.',
    source: { label: 'Local oral tradition (legend; not documented in primary sources)' },
  },
  {
    id: 'hagia-sophia',
    title: 'Compared with Hagia Sophia',
    // VERIFY: Hagia Sophia dome diameter (~31 m, slightly elliptical).
    text: 'Hagia Sophia (completed 537) carries its dome on four main piers and extends it with two half-domes. The result is magnificent, but longer and more directional than Selimiye’s single centralised space.',
    source: sources.unescoIstanbul,
  },
];

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export type ChapterId =
  | 'opening'
  | 'problem'
  | 'collapse'
  | 'dilemma'
  | 'walls'
  | 'reveal'
  | 'inside'
  | 'discover'
  | 'closing';

export interface ChapterMeta {
  id: ChapterId;
  /** Roman numeral shown in the progress indicator ('' for the prologue). */
  numeral: string;
  title: string;
}

export const chapters: ChapterMeta[] = [
  { id: 'opening', numeral: '', title: 'Prologue' },
  { id: 'problem', numeral: 'I', title: 'The problem' },
  { id: 'collapse', numeral: 'II', title: 'First attempt' },
  { id: 'dilemma', numeral: 'III', title: 'The dilemma' },
  { id: 'walls', numeral: 'IV', title: 'Opening the walls' },
  { id: 'reveal', numeral: 'V', title: 'The reveal' },
  { id: 'inside', numeral: 'VI', title: 'Standing inside' },
  { id: 'discover', numeral: 'VII', title: 'Discover more' },
  { id: 'closing', numeral: 'VIII', title: 'Closing' },
];

/* ------------------------------------------------------------------ */
/* Copy per chapter                                                    */
/* ------------------------------------------------------------------ */

export const copy = {
  meta: {
    siteTitle: 'Hold Up the Sky — Selimiye Mosque',
    skipLink: 'Skip to the story',
    progressLabel: 'Chapters',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    soundAnnounceOn: 'Sound turned on.',
    soundAnnounceOff: 'Sound turned off.',
    chapterAnnounce: (numeral: string, title: string) =>
      numeral ? `Chapter ${numeral}: ${title}` : title,
  },

  opening: {
    eyebrow: 'Selimiye Mosque · Edirne · 1575',
    headline: 'How do you hold up *the sky?*',
    lede: 'A short, interactive study of the building Mimar Sinan called his masterwork. No architecture knowledge needed.',
    begin: 'Begin',
    soundHint: 'Sound is optional. Headphones recommended.',
    footer: 'Mimar Sinan · Chief architect of the Ottoman court',
  },

  problem: {
    eyebrow: 'The problem',
    headline: 'One room. *One dome.*',
    body: 'You have a square hall and a single dome to cover it. A dome is heavy, and it has to rest on something.',
    goal: 'Your goal: carry the dome and keep the space beneath as open as possible, so it feels like one room.',
    cta: 'Release the dome',
    redraw: 'Redraw',
    pocNote: 'Chapter II arrives in POC 2.',
    figureLabel:
      'Line drawing: a square hall seen at an angle, with a circle marking where the dome would sit. Above it, the outline of a single dome hovers in the air.',
    figcaption: 'Fig. 1 — A square hall, and the dome meant to cover it.',
    annotations: {
      hall: 'SQUARE HALL',
      dome: 'SINGLE DOME',
      span: 'span ≈ 31 m', // VERIFY: see facts.dome
    },
  },
};

/* ------------------------------------------------------------------ */
/* Images (see /public/images/CREDITS.md for license requirements)     */
/* ------------------------------------------------------------------ */

export interface ImageAsset {
  /** Base path without extension; the build expects .avif, .webp and .jpg variants. */
  src: string;
  alt: string;
  credit: { author: string; license: string; sourceUrl: string };
}

export const images = {
  domeFromBelow: {
    src: '/images/reveal/selimiye-dome-from-below',
    alt: 'Looking straight up into the dome of the Selimiye Mosque: eight massive piers rise to a ring of windows, and the dome’s painted centre glows above.',
    credit: { author: 'TBD', license: 'TBD', sourceUrl: 'TBD' },
  },
} satisfies Record<string, ImageAsset>;
