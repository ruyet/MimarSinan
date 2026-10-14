/**
 * content.ts — the single source of truth for every word, fact, image and credit.
 *
 * Edit text here without touching any logic. Conventions:
 *  - Headlines may wrap a phrase in *asterisks* to set it in italic (see core/splitText.ts).
 *  - Every fact has a `sources` list (keys into `sources`). The UI may only show numbers or
 *    claims that appear in `facts` — run the fact check in DECISIONS.md before publishing.
 *  - Legends are labelled as legends.
 */

/* ------------------------------------------------------------------ */
/* Sources                                                             */
/* ------------------------------------------------------------------ */

export interface Source {
  label: string;
  url: string;
}

export const sources = {
  unesco: {
    label: 'UNESCO World Heritage Centre, “Selimiye Mosque and its Social Complex”',
    url: 'https://whc.unesco.org/en/list/1366/',
  },
  icomos: {
    label: 'ICOMOS advisory body evaluation (2011)',
    url: 'https://whc.unesco.org/document/152488',
  },
  wikipedia: {
    label:
      'Wikipedia, “Selimiye Mosque, Edirne” (citing Necipoğlu 2011, Kuban 2010, Goodwin 1971, Blair & Bloom 1995)',
    url: 'https://en.wikipedia.org/wiki/Selimiye_Mosque,_Edirne',
  },
  wikipediaSinan: {
    label: 'Wikipedia, “Mimar Sinan”',
    url: 'https://en.wikipedia.org/wiki/Mimar_Sinan',
  },
  ktb: {
    label: 'Turkish Ministry of Culture and Tourism, “Selimiye Mosque”',
    url: 'https://www.ktb.gov.tr/EN-113784/selimiye-mosque.html',
  },
  aa: {
    label: 'Anadolu Agency, “Sinan, a great Ottoman architect”',
    url: 'https://aa.com.tr/en/culture/sinan-a-great-ottoman-architect/2638991',
  },
  tdv: {
    label: 'TDV İslâm Ansiklopedisi, “Selimiye Camii ve Külliyesi”',
    url: 'https://islamansiklopedisi.org.tr/selimiye-camii-ve-kulliyesi--edirne',
  },
  dailySabah: {
    label: 'Daily Sabah, minaret restoration at Edirne’s Selimiye Mosque',
    url: 'https://www.dailysabah.com/turkiye/minaret-restoration-at-edirnes-selimiye-mosque-nears-completion/news/amp',
  },
  turkishAirlines: {
    label: 'Turkish Airlines blog, the upside-down tulip legend',
    url: 'https://blog.turkishairlines.com/en/?p=65495',
  },
  hagiaSophia: {
    label: 'hagiasophia.com, “Hagia Sophia floor plan”',
    url: 'https://www.hagiasophia.com/hagia-sophia-floor-plan',
  },
  aaLegacy: {
    label: 'Anadolu Agency, “Architect Sinan leaves enduring legacy in Ottoman cities”',
    url: 'https://aa.com.tr/en/turkiye/architect-sinan-leaves-enduring-legacy-in-ottoman-cities/3279361',
  },
  tdvSedefkar: {
    label: 'TDV İslâm Ansiklopedisi, “Mehmed Ağa, Sedefkâr”',
    url: 'https://islamansiklopedisi.org.tr/mehmed-aga-sedefkar',
  },
  tdvSultanAhmed: {
    label: 'TDV İslâm Ansiklopedisi, “Sultan Ahmed Camii ve Külliyesi”',
    url: 'https://islamansiklopedisi.org.tr/sultan-ahmed-camii-ve-kulliyesi',
  },
  archnet: {
    label: 'Archnet, “Sedefkâr Mehmed Ağa”',
    url: 'https://archnet.org/authorities/1269',
  },
  wikipediaBlueMosque: {
    label: 'Wikipedia, “Blue Mosque, Istanbul” (citing Blair & Bloom)',
    url: 'https://en.wikipedia.org/wiki/Blue_Mosque,_Istanbul',
  },
} satisfies Record<string, Source>;

export type SourceKey = keyof typeof sources;

/* ------------------------------------------------------------------ */
/* Verified facts — the ONLY claims the UI may make                    */
/* ------------------------------------------------------------------ */

export interface Fact {
  title: string;
  /** Short, plain-language wording used in cards and captions. */
  text: string;
  sources: SourceKey[];
  legend?: boolean;
}

export const facts = {
  patron: {
    title: 'A sultan’s mosque',
    text: 'Commissioned by Sultan Selim II.',
    sources: ['unesco', 'wikipedia'],
  },
  dates: {
    title: 'Built 1568/69 – 1574/75',
    text: 'Built between 1568/69 and 1574/75 and opened for worship in 1575. Selim II died in December 1574 and never saw it finished.',
    sources: ['wikipedia', 'aa'],
  },
  funding: {
    title: 'Paid for by a conquest',
    text: 'Paid for partly with the sultan’s share of the spoils from the conquest of Cyprus (1571).',
    sources: ['wikipedia'],
  },
  sinanAge: {
    title: 'An architect in his eighties',
    text: 'Sinan was in his eighties when he built it.',
    sources: ['ktb'],
  },
  masterwork: {
    title: 'Apprentice, journeyman, master',
    text: 'Sinan named three stages of his career: the Şehzade Mosque (1548) his apprentice work, the Süleymaniye (1557) his journeyman work, and the Selimiye (1575) his masterwork.',
    sources: ['aa', 'wikipediaSinan'],
  },
  domeDiameter: {
    title: 'About 31 metres across',
    text: 'The dome is about 31 metres across.',
    sources: ['unesco', 'wikipedia', 'ktb'],
  },
  domeHeight: {
    title: 'About 42 metres high',
    text: 'The crown of the dome is about 42 metres above the floor.',
    sources: ['wikipedia', 'ktb'],
  },
  prayerSpace: {
    title: 'A nearly square hall',
    text: 'The prayer space measures roughly 45 × 36 metres: nearly square, not exactly.',
    sources: ['unesco'],
  },
  piers: {
    title: 'Eight piers',
    text: 'The single dome is carried by eight piers, partly freestanding but closely built into the outer walls.',
    sources: ['unesco', 'wikipedia'],
  },
  windows: {
    title: 'Walls made of light',
    text: 'Extra buttresses are hidden in the outer walls, so the walls between them could be pierced with a great many windows, creating an extraordinary illuminated interior.',
    sources: ['unesco', 'wikipedia'],
  },
  cornerSemidomes: {
    title: 'Small corner half-domes',
    text: 'Four small half-domes sit in the corners between the piers, much smaller than in other Ottoman mosques. The mihrab sits in its own apse, lit from three sides.',
    sources: ['wikipedia'],
  },
  galleries: {
    title: 'Galleries between the piers',
    text: 'Raised galleries fill the spaces between the piers, so the dome dominates the view from wherever you stand.',
    sources: ['wikipedia'],
  },
  unity: {
    title: 'One unobstructed dome',
    text: 'The interior is dominated by one dome, its view unimpeded by the structural elements of earlier large domed mosques.',
    sources: ['wikipedia', 'tdv'],
  },
  minarets: {
    title: 'Four minarets',
    text: 'Four identical minarets stand at the corners of the prayer hall. Each is 70.89 metres tall, among the tallest Ottoman minarets ever built, and each has three balconies.',
    sources: ['wikipedia', 'ktb', 'icomos'],
  },
  staircases: {
    title: 'Three staircases in one tower',
    text: 'The two minarets on the courtyard side each have three independent staircases, one to each balcony, so three people can climb without meeting.',
    sources: ['icomos', 'ktb', 'dailySabah'],
  },
  muezzinPlatform: {
    title: 'The müezzin’s platform',
    text: 'The müezzin’s platform stands in the centre of the hall, directly under the dome, a placement Sinan never repeated. It rests on twelve small arches, with a marble fountain underneath.',
    sources: ['wikipedia'],
  },
  tiles: {
    title: 'İznik tiles at their peak',
    text: 'The İznik tiles come from the peak period of their production; UNESCO calls it an art form never excelled in that material.',
    sources: ['unesco'],
  },
  tulip: {
    title: 'The upside-down tulip',
    text: 'Legend has it that the land was a tulip garden whose stubborn owner would only sell if she would be remembered. A small tulip carved upside down on a marble column of the müezzin’s platform is said to nod to her stubbornness.',
    sources: ['turkishAirlines'],
    legend: true,
  },
  damage1913: {
    title: 'The scar of 1913',
    text: 'During the 1913 siege of Edirne, artillery hit the dome. Atatürk ordered the damage to be left unrepaired, as a reminder.',
    sources: ['wikipedia'],
  },
  unesco: {
    title: 'World Heritage',
    text: 'A UNESCO World Heritage Site since 2011.',
    sources: ['unesco'],
  },
  kulliye: {
    title: 'A complex, not just a mosque',
    text: 'The mosque is the centre of a complex with two madrasas, a covered market and an elementary school.',
    sources: ['unesco', 'wikipedia'],
  },
  hsDome: {
    title: 'Hagia Sophia’s dome',
    text: 'Hagia Sophia’s dome is about 31–32 metres across, and its crown is about 55.6 metres above the floor.',
    sources: ['hagiaSophia'],
  },
  hsSupport: {
    title: 'Hagia Sophia’s support',
    text: 'Hagia Sophia’s dome sits on four main piers with two massive half-domes, east and west, which stretch the space into a long nave.',
    sources: ['hagiaSophia'],
  },
  sinanClaim: {
    title: 'Sinan’s claim',
    text: 'Matching Hagia Sophia’s dome was one of Sinan’s main goals. His biography claims the Selimiye dome is higher and wider; modern measurements put the two diameters at about the same.',
    sources: ['wikipedia'],
  },

  /* --- Mimar Sinan ------------------------------------------------- */
  sinanLife: {
    title: 'c. 1490–1588',
    text: 'Mimar Sinan was born around 1490 in Ağırnas, near Kayseri, and died in Istanbul in 1588. His exact birth year is disputed.',
    sources: ['aaLegacy', 'wikipediaSinan'],
  },
  sinanRole: {
    title: 'Chief architect for about fifty years',
    text: 'He was chief architect of the Ottoman Empire for about fifty years, under Süleyman I, Selim II and Murad III.',
    sources: ['aaLegacy'],
  },
  sinanEngineer: {
    title: 'From military engineer to architect',
    text: 'Before he became chief architect, Sinan served as a military engineer.',
    sources: ['wikipediaSinan'],
  },
  sinanBuildings: {
    title: 'Hundreds of buildings',
    text: 'Hundreds of buildings are attributed to him; the exact count differs between sources.',
    sources: ['wikipediaSinan'],
  },
  hagiaReinforced: {
    title: 'Strengthening Hagia Sophia',
    text: 'In 1573 Sinan strengthened Hagia Sophia with buttresses: reinforcement work on an existing building, not its design.',
    sources: ['aaLegacy'],
  },

  /* --- The tradition ------------------------------------------------- */
  hsBuilt: {
    title: 'Hagia Sophia, 532–537',
    text: 'Hagia Sophia was built in 532–537 under Justinian, by the architects Anthemius of Tralles and Isidore of Miletus.',
    sources: ['hagiaSophia'],
  },
  sehzadePlan: {
    title: 'Şehzade: four half-domes',
    text: 'At the Şehzade Mosque (1548), Sinan surrounded the central dome with four half-domes.',
    sources: ['wikipediaBlueMosque', 'wikipediaSinan'],
  },
  suleymaniyePlan: {
    title: 'Süleymaniye: two half-domes',
    text: 'At the Süleymaniye (1557), the central dome is extended by two half-domes, as at Hagia Sophia.',
    sources: ['wikipediaSinan'],
  },

  /* --- Legacy ----------------------------------------------------------- */
  sedefkar: {
    title: 'Sedefkâr Mehmed Ağa',
    text: 'Sedefkâr Mehmed Ağa trained under Sinan, then under his successors Davud Ağa and Dalgıç Ahmed Ağa, and became chief imperial architect in 1606. “Sedefkâr” refers to his training in mother-of-pearl inlay.',
    sources: ['tdvSedefkar', 'archnet'],
  },
  sultanAhmed: {
    title: 'The Sultan Ahmed Mosque',
    text: 'He designed the Sultan Ahmed Mosque, the “Blue Mosque” in Istanbul, built for Ahmed I in 1609–1616/17.',
    sources: ['tdvSultanAhmed', 'wikipediaBlueMosque'],
  },
  blueMosquePlan: {
    title: 'A plan from Şehzade, not Selimiye',
    text: 'Its plan builds on Sinan’s Şehzade Mosque: a central dome with four half-domes, expanded with additional exedrae. It does not follow Selimiye’s eight-pier scheme.',
    sources: ['tdvSultanAhmed', 'wikipediaBlueMosque'],
  },
} satisfies Record<string, Fact>;

export type FactKey = keyof typeof facts;

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export type ChapterId =
  | 'opening'
  | 'problem'
  | 'dilemma'
  | 'walls'
  | 'reveal'
  | 'inside'
  | 'discover'
  | 'masterwork'
  | 'legacy'
  | 'synthesis'
  | 'name'
  | 'epilogue'
  | 'credits';

export interface ChapterMeta {
  id: ChapterId;
  /** Roman numeral; '' for pages outside the numbered sequence. */
  numeral: string;
  title: string;
  /** Shown as a dash in the progress bar. */
  inProgress: boolean;
}

export const chapters: ChapterMeta[] = [
  { id: 'opening', numeral: '', title: 'Prologue', inProgress: true },
  { id: 'problem', numeral: 'I', title: 'The problem', inProgress: true },
  { id: 'dilemma', numeral: 'II', title: 'The dilemma', inProgress: true },
  { id: 'walls', numeral: 'III', title: 'Opening the walls', inProgress: true },
  { id: 'reveal', numeral: 'IV', title: 'Look up', inProgress: true },
  { id: 'inside', numeral: 'V', title: 'Inside the light', inProgress: true },
  { id: 'discover', numeral: 'VI', title: 'Look closer', inProgress: true },
  { id: 'masterwork', numeral: 'VII', title: 'A tradition, refined', inProgress: true },
  { id: 'legacy', numeral: 'VIII', title: 'The legacy', inProgress: true },
  { id: 'synthesis', numeral: 'IX', title: 'Why Mimar Sinan matters', inProgress: true },
  { id: 'name', numeral: 'X', title: 'Mimar Sinan', inProgress: true },
  { id: 'epilogue', numeral: 'XI', title: 'Epilogue', inProgress: true },
  { id: 'credits', numeral: '', title: 'Sources & credits', inProgress: false },
];

/** The chapter's Roman numeral, so modules never hard-code it. */
export const numeralOf = (id: ChapterId): string =>
  chapters.find((c) => c.id === id)?.numeral ?? '';

/* ------------------------------------------------------------------ */
/* The three principles (the visitor's goal)                           */
/* ------------------------------------------------------------------ */

export type Principle = 'structure' | 'space' | 'light';
export const principleOrder: Principle[] = ['structure', 'space', 'light'];

export const principles: Record<Principle, { name: string; line: string }> = {
  structure: { name: 'Structure', line: 'Carrying one great dome.' },
  space: { name: 'Space', line: 'One unified room beneath it.' },
  light: { name: 'Light', line: 'Walls freed by the structure, opened to light.' },
};

/* ------------------------------------------------------------------ */
/* Figures — numbered once, continuously, through the whole site       */
/* ------------------------------------------------------------------ */

const figureOrder = [
  'problem',
  'dilemma',
  'room',
  'walls',
  'reveal',
  'inside-hall',
  'inside-mihrab',
  'inside-platform',
  'inside-exterior',
  'discover',
  'tradition',
  'legacy-plans',
  'legacy-photo',
  'name',
] as const;

export type FigureId = (typeof figureOrder)[number];

const ROMAN: [number, string][] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];
export function toRoman(n: number): string {
  let out = '';
  for (const [v, s] of ROMAN) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

/** "Fig. IV" for a figure id; the order above is the only place numbers are decided. */
export const fig = (id: FigureId): string => `Fig. ${toRoman(figureOrder.indexOf(id) + 1)}`;

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

export const copy = {
  meta: {
    skipLink: 'Skip to the story',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    soundAnnounceOn: 'Sound turned on.',
    soundAnnounceOff: 'Sound turned off.',
    progressTotal: 'XI',
    continue: 'Continue',
    model: 'This is a simplified illustration, not an engineering simulation.',
    discoveryLabel: 'Principles discovered',
    discovered: (name: string) => `Principle discovered: ${name}.`,
    notYet: 'not yet discovered',
    found: 'discovered',
  },

  opening: {
    eyebrowName: 'Mimar Sinan',
    eyebrow: 'Selimiye Mosque · Edirne · 1575',
    headline: 'How do you hold up *the sky?*',
    lede: 'Mimar Sinan was chief architect of the Ottoman Empire for about fifty years. In his eighties he built the mosque he himself called his masterwork.',
    goal: 'Discover the three ideas that made it a masterpiece:',
    begin: 'Begin',
    soundHint: 'Sound is optional. Headphones recommended.',
    footer: 'An interactive study · No architecture knowledge needed',
  },

  problem: {
    eyebrow: 'The problem',
    headline: 'One room. *One dome.*',
    body: 'Sinan’s problem: a nearly square hall, and a single dome to cover it. A dome is heavy, and it has to rest on something.',
    goal: 'Your goal: carry the dome and keep the space beneath as open as possible, so it feels like one room.',
    cta: 'Release the dome',
    redraw: 'Redraw',
    figureLabel:
      'Line drawing: a nearly square prayer hall seen at an angle, with a circle on the floor marking where the dome would sit. Above it, a single dome hovers in the air, with guide lines showing where it would drop.',
    figcaption: `${fig('problem')} — A prayer hall, and the dome meant to cover it.`,
    margin:
      'Selimiye’s prayer hall measures roughly 45 × 36 metres; its dome is about 31 metres across.',
    annotations: {
      hall: 'PRAYER HALL',
      hallSize: 'hall ≈ 45 × 36 m',
      dome: 'SINGLE DOME',
      span: 'dome ⌀ ≈ 31 m',
    },
    collapsed: {
      headline: 'It *falls.*',
      body: 'A dome pushes down, and outward. It needs something to push against.',
      cta: 'Add supports',
      figcaption: `${fig('problem')} — Without support, the dome collapses.`,
      announce:
        'The dome collapsed. A dome pushes down and outward; it needs something to push against.',
    },
  },

  dilemma: {
    eyebrow: 'The dilemma',
    margin: 'The dome seen from above. Piers can stand anywhere on the dashed ring.',
    instruction:
      'Try different numbers of supports. Watch two things: does the dome hold, and how open does the room stay?',
    figcaption: `${fig('dilemma')} — The dome seen from above, with the ring where piers can stand.`,
    figureLabel:
      'Plan view from above: the dome as a circle, surrounded by a ring of possible pier positions.',
    floorView: 'View from the floor',
    floorViewLabel: (n: number) =>
      n === 0
        ? 'View from the floor: nothing blocks the view.'
        : `View from the floor: ${n} columns stand around you.`,
    control: 'Number of piers',
    ringHint: 'Tap the ring to add piers, or tap a pier to remove some.',
    stability: 'Stability',
    openness: 'Openness',
    showAnswer: 'Show me Sinan’s answer',
    states: {
      none: {
        headline: 'How many *supports?*',
        body: 'Each pier carries part of the dome’s weight. But each pier also stands in the room.',
      },
      4: {
        headline: 'Four, *with wide gaps.*',
        body: 'In this model, four piers on their own leave wide gaps. Between them, the dome pushes outward with nothing to push against.',
      },
      6: {
        headline: 'Six, *still straining.*',
        body: 'In this model the dome holds, but strains where the gaps are still wide. Watch the red lines.',
      },
      8: {
        headline: '*Eight.*',
        body: 'At Selimiye, Sinan chose eight piers, pulled back towards the walls, to carry one dome about 31 metres across.',
      },
      12: {
        headline: 'Twelve: *safe, but crowded.*',
        body: 'A trade-off: more support, less open room. The floor starts to fill with columns.',
      },
      16: {
        headline: 'Sixteen: *a forest of columns.*',
        body: 'The dome is well supported, but the room no longer reads as one open space.',
      },
    },
    realSystem: {
      title: 'The real system',
      body: 'At Selimiye the eight piers are partly built into the outer walls, and extra buttresses hide inside the walls themselves. Four small half-domes fill the corners, and galleries are tucked between the piers.',
      otherWays:
        'Domes have been carried in many ways. Hagia Sophia used two great half-domes. Sinan himself tried other systems in earlier mosques. At Selimiye, he chose eight.',
    },
    room: {
      cta: 'Stand in the room',
      headline: 'One *room.*',
      body: 'Because the supports are pulled back into the walls, almost nothing stands between you and the dome.',
      back: 'Back to the plan',
      figcaption: `${fig('room')} — The view from the floor with eight piers.`,
      label:
        'View from the centre of the floor with eight piers: the few columns stand back at the edges, and one open room stretches out under the dome.',
    },
    hagia: {
      title: 'Another answer',
      body: 'Hagia Sophia answered with four piers and two huge half-domes, which stretch its space into a long hall.',
      label:
        'Sketch of Hagia Sophia’s plan: a central dome on four piers, with a half-dome at each end.',
    },
    announce: (n: number, stability: string, openness: string) =>
      `${n} piers. Stability: ${stability}. Openness: ${openness}.`,
    lockIn: 'Balanced in this model: both meters are in the sweet spot.',
  },

  walls: {
    eyebrow: 'Opening the walls',
    headline: 'Now, *let the light in.*',
    body: 'The piers carry the dome, and buttresses hide inside the walls. Walls that don’t carry the dome can be opened: Selimiye’s walls are pierced by a great many windows.',
    control: 'Open the walls',
    dragHint: 'Drag across the drawing, or use the slider.',
    lightLabel: 'Light',
    levels: ['Dim', 'A little light', 'Brighter', 'Bright', 'Filled with light'],
    closing: 'Structure made *the light* possible.',
    figcaption: `${fig('walls')} — Eight piers carry the dome; the walls between them are free to open.`,
    figureLabel:
      'Cut-away drawing of the prayer hall: eight piers carry the dome, and the walls between them fill with windows as you open them. Light falls across the floor.',
  },

  reveal: {
    eyebrow: 'Look up',
    prompt: 'Stand in the centre of the hall, and look up.',
    headline: 'This is what *Sinan built.*',
    toggleDrawing: 'Show the drawing',
    toggleAnnotations: 'Show annotations',
    annotationsIntro: 'The three ideas, found in the real dome.',
    figcaption: `${fig('reveal')} — The dome of the Selimiye, seen from the centre of the floor.`,
    figureLabel:
      'The eight-pier plan, seen from directly below, turning into a photograph of the real dome.',
  },

  inside: {
    eyebrow: 'Inside the light',
    prev: 'Previous',
    next: 'Next',
    hint: 'Scroll, swipe or use the arrow keys to step through.',
    slide: (i: number, total: number) => `Photo ${i} of ${total}`,
    step: (i: number, total: number) => `Note ${i} of ${total}`,
  },

  discover: {
    eyebrow: 'Look closer',
    headline: 'Six *details.*',
    body: 'Select a point on the photo. The photo shows you where; the note tells you why.',
    views: { interior: 'Inside', exterior: 'Outside' },
    close: 'Close',
    legend: 'Legend',
    sourcesLabel: 'Source',
    panelEmpty: 'Choose a point on the photo.',
    seen: (n: number, total: number) => `${n} of ${total} explored`,
    figcaption: `${fig('discover')} — Six details of the Selimiye.`,
  },

  masterwork: {
    eyebrow: 'A tradition, refined',
    headline: 'Sinan didn’t start *from nothing.*',
    body: 'Hagia Sophia had faced the problem of one great dome a thousand years before Selimiye. Sinan studied the answers before him, tried his own, and refined them.',
    stepLabel: 'Step through the plans',
    claim:
      'The two domes are about the same width. Sinan claimed his was higher and wider; modern measurements put the diameters at about the same.',
    figcaption: `${fig('tradition')} — Four plans, drawn to the same idea of scale.`,
    plans: [
      {
        id: 'hagia',
        year: '537',
        name: 'Hagia Sophia',
        role: 'Anthemius of Tralles & Isidore of Miletus',
        sub: 'A central dome with two great half-domes',
        text: 'Built 532–537. Two great half-domes help carry the dome, and stretch the space into a long, directional hall. In 1573, Sinan strengthened this building itself with buttresses.',
        caption: 'A long space, pulled in one direction.',
        label:
          'Plan of Hagia Sophia: a central dome on four piers, with a large half-dome to the east and to the west, forming a long nave.',
      },
      {
        id: 'sehzade',
        year: '1548',
        name: 'Şehzade Mosque',
        role: 'Sinan’s “apprentice work”',
        sub: 'A central dome with four half-domes',
        text: 'Here the central dome is surrounded by four half-domes, one on each side.',
        caption: 'A centred space, held by four half-domes.',
        label:
          'Plan of the Şehzade Mosque: a square hall with a central dome and four half-domes, one on each side.',
      },
      {
        id: 'suleymaniye',
        year: '1557',
        name: 'Süleymaniye',
        role: 'Sinan’s “journeyman work”',
        sub: 'A central dome with two half-domes',
        text: 'Here the central dome is extended by two half-domes, as at Hagia Sophia.',
        caption: 'Two half-domes, like Hagia Sophia.',
        label:
          'Plan of the Süleymaniye: a rectangular hall with a central dome extended by two half-domes along one axis.',
      },
      {
        id: 'selimiye',
        year: '1575',
        name: 'Selimiye',
        role: 'Sinan’s “masterwork”',
        sub: 'One dome on eight piers',
        text: 'Eight piers, four small corner half-domes, and one centred, unified space under a single dome.',
        caption: 'One centred space, gathered under one dome.',
        label:
          'Plan of the Selimiye: a single dome on eight piers in an octagon, with four small half-domes in the corners and the mihrab in its own apse.',
      },
    ],
    stagesNote:
      'Apprentice, journeyman, master: how Sinan himself described these three buildings.',
    // Legacy keys used by the previous chapter VII layout; removed when VII is rebuilt.
    hagia: {
      name: 'Hagia Sophia',
      sub: 'Four piers + two great half-domes',
      caption: 'A long space, pulled in one direction.',
      dome: 'dome ⌀ ≈ 31–32 m',
      label:
        'Plan of Hagia Sophia: a central dome on four piers, with a large half-dome to the east and to the west, forming a long nave.',
    },
    selimiye: {
      name: 'Selimiye',
      sub: 'Eight piers + four small corner half-domes',
      caption: 'One centred space, gathered under one dome.',
      dome: 'dome ⌀ ≈ 31 m',
      label:
        'Plan of the Selimiye: a single dome on eight piers in an octagon, with four small half-domes in the corners and the mihrab in its own apse.',
    },
    stagesTitle: 'Three stages of a career',
    stages: [
      { year: '1548', name: 'Şehzade Mosque', role: 'apprentice work' },
      { year: '1557', name: 'Süleymaniye', role: 'journeyman work' },
      { year: '1575', name: 'Selimiye', role: 'masterwork' },
    ],
  },

  legacy: {
    eyebrow: 'The legacy',
    headline: 'Through the architects *he trained.*',
    body: 'Sinan’s ideas outlived him through the people he taught. Sedefkâr Mehmed Ağa trained under Sinan and his successors, became chief imperial architect in 1606, and designed the Sultan Ahmed Mosque, the “Blue Mosque”, built 1609–1616/17.',
    plan: 'Its plan grows from Sinan’s Şehzade Mosque, a central dome with four half-domes, not from Selimiye’s eight piers. Sinan’s influence passed through a whole school of ideas and people, not one copied building.',
    plansCaption: `${fig('legacy-plans')} — Şehzade (1548) and the Sultan Ahmed Mosque (1609–1616/17): the same central idea, expanded.`,
    photoCaption: `${fig('legacy-photo')} — The Sultan Ahmed Mosque, Istanbul: domes and half-domes cascade around the centre.`,
    sehzade: 'Şehzade, 1548',
    blue: 'Sultan Ahmed, 1609–1616/17',
    plansLabel:
      'Two plans side by side: the Şehzade Mosque, a central dome with four half-domes, and the Sultan Ahmed Mosque, the same arrangement with additional small exedrae.',
  },

  synthesis: {
    eyebrow: 'Why Mimar Sinan matters',
    headline: 'Why *Mimar Sinan* matters',
    lede: 'Three ideas, working as one, and a way of building that outlived him.',
    plates: [
      {
        numeral: '1',
        principle: 'structure' as const,
        title: 'He refined monumental structure.',
        text: 'Eight piers carry one great dome, pulled back into the walls.',
        ref: fig('dilemma'),
      },
      {
        numeral: '2',
        principle: 'space' as const,
        title: 'He created unified space.',
        text: 'Almost nothing stands between you and the dome: one room.',
        ref: fig('room'),
      },
      {
        numeral: '3',
        principle: 'light' as const,
        title: 'He made structure and light work together.',
        text: 'Walls freed from the load could be opened to a great many windows.',
        ref: fig('walls'),
      },
      {
        numeral: '4',
        principle: null,
        title: 'His ideas outlived him.',
        text: 'The architects he trained carried them on, from Şehzade to the Blue Mosque.',
        ref: fig('legacy-plans'),
      },
    ],
  },

  name: {
    eyebrow: 'Remember the name',
    first: 'Mimar',
    last: 'Sinan',
    dates: 'c. 1490–1588 · Chief architect of the Ottoman Empire for about fifty years',
    line: 'Hundreds of buildings. *One masterwork.*',
    figcaption: `${fig('name')} — Monument to Mimar Sinan in Edirne, near the Selimiye.`,
  },

  epilogue: {
    eyebrow: 'Epilogue',
    headline: 'He didn’t just hold up the sky. *He let the light in.*',
    lede: 'Mimar Sinan, in his eighties, for Sultan Selim II. Selimiye Mosque, Edirne, 1575.',
    restart: 'Start again',
    credits: 'Sources & credits',
  },

  credits: {
    eyebrow: 'Sources & credits',
    headline: 'Sources *& credits.*',
    intro: 'Every fact in this story comes from the sources below. Legends are marked as legends.',
    model:
      'The stability and openness meters in chapter II use a simplified, rules-based model for illustration. They are not an engineering calculation.',
    imagesTitle: 'Photographs',
    sourcesTitle: 'Sources',
    typeTitle: 'Type & making',
    type: 'Set in Fraunces and Instrument Sans. Line drawings, sound and code made for this case study (Typography & Design).',
    back: 'Back to the epilogue',
    restart: 'Start again',
  },
};

/* ------------------------------------------------------------------ */
/* Images                                                              */
/* ------------------------------------------------------------------ */

export interface ImageAsset {
  /** Base path; renditions are `${src}-{800|1600|2400}.{avif|webp|jpg}`. */
  src: string;
  width: number;
  height: number;
  alt: string;
  credit: { title: string; author: string; license: string; licenseUrl: string; sourceUrl: string };
}

const CC_BY_SA_4 = 'https://creativecommons.org/licenses/by-sa/4.0/';

export const images = {
  domeFromBelow: {
    src: '/images/reveal/selimiye-dome-from-below',
    width: 2550,
    height: 2550,
    alt: 'Looking straight up into the dome of the Selimiye Mosque: a ring of arched windows circles a painted dome with a golden centre, framed by eight red-and-white striped arches.',
    credit: {
      title: 'Interior of dome, Selimiye Mosque, Edirne',
      author: 'Tarik Kaan Muslu',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Interior_of_dome,_Selimiye_Mosque,_Edirne_-_Tarik_Kaan_Muslu.jpg',
    },
  },
  prayerHall: {
    src: '/images/interior/selimiye-prayer-hall',
    width: 3840,
    height: 2555,
    alt: 'The vast prayer hall seen from the floor: red carpets stretch to massive piers, rows of windows glow high up, and the müezzin’s platform stands in the middle of the room.',
    credit: {
      title: 'Edirne Selimiye Mosque Müezzin mahfili view in the room in 2009',
      author: 'Dosseman',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Edirne_Selimiye_Mosque_M%C3%BCezzin_mahfili_view_in_the_room_in_2009_6286.jpg',
    },
  },
  mihrabApse: {
    src: '/images/interior/selimiye-mihrab-apse',
    width: 3840,
    height: 2556,
    alt: 'The mihrab apse: tiled walls pierced by rows of windows on three sides, light pouring in around the marble mihrab.',
    credit: {
      title: 'Edirne Selimiye Mosque Mihrab in 2018',
      author: 'Dosseman',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Edirne_Selimiye_Mosque_Mihrab_in_2018_0162.jpg',
    },
  },
  muezzinPlatform: {
    src: '/images/interior/selimiye-muezzin-platform',
    width: 3840,
    height: 2556,
    alt: 'The müezzin’s platform: a raised marble gallery on slender columns and small arches, with a fountain on the floor beneath it.',
    credit: {
      title: 'Müezzin mahfili in Selimiye mosque in Edirne',
      author: 'Dosseman',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:M%C3%BCezzin_mahfili_in_Selimiye_mosque_in_Edirne_0196.jpg',
    },
  },
  exteriorMinarets: {
    src: '/images/exterior/selimiye-minarets',
    width: 3840,
    height: 2561,
    alt: 'The Selimiye Mosque against a clear blue sky: the great dome rising in steps, framed by four slender minarets.',
    credit: {
      title: 'Edirne Mosque',
      author: 'Liselottediehl',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Edirne_Mosque.jpg',
    },
  },
  exteriorOvercast: {
    src: '/images/exterior/selimiye-exterior-overcast',
    width: 3840,
    height: 2555,
    alt: 'The Selimiye Mosque under a pale sky: the lead-covered dome in the centre and four tall minarets with their balconies.',
    credit: {
      title: 'Edirne Selimiye Mosque from distance in 2009',
      author: 'Dosseman',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Edirne_Selimiye_Mosque_from_distance_in_2009_6427.jpg',
    },
  },
  sinanMonument: {
    src: '/images/people/mimar-sinan-monument-edirne',
    width: 3840,
    height: 5760,
    alt: 'Bronze monument of Mimar Sinan in Edirne: the architect sits in a long robe and a large turban, one hand resting on his knee, looking down.',
    credit: {
      title: 'Mimar Sinan monument in 2024',
      author: 'Dosseman',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mimar_Sinan_monument_in_2024_6024.jpg',
    },
  },
  sultanAhmed: {
    src: '/images/legacy/sultan-ahmed-mosque',
    width: 2560,
    height: 1920,
    alt: 'The Sultan Ahmed Mosque in Istanbul: a great central dome with half-domes and smaller domes cascading around it, framed by slender minarets.',
    credit: {
      title: 'Exterior of Sultan Ahmed I Mosque',
      author: 'Bigdaddy1204 (English Wikipedia)',
      license: 'Public domain',
      licenseUrl:
        'https://commons.wikimedia.org/wiki/File:Exterior_of_Sultan_Ahmed_I_Mosque,_(old_name_P1020390.jpg).jpg',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Exterior_of_Sultan_Ahmed_I_Mosque,_(old_name_P1020390.jpg).jpg',
    },
  },
} satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof images;

/**
 * Alignment of the drawn eight-pier plan over the dome photo in chapter IV.
 * Units: `scale` multiplies the drawing; `rotation` in degrees; offsets in % of the photo.
 * Tweak these if you swap the photo. Toggle "Show the drawing" in chapter IV to check.
 */
export const revealAlignment = {
  scale: 1,
  rotation: 0,
  offsetX: 1.4,
  offsetY: 3.7,
  /** Radius of the dome rim in the photo, as a fraction of the photo width. */
  domeRadius: 0.405,
  /** Distance from the centre to the eight piers (where the arches meet), as a fraction of the width. */
  pierRadius: 0.47,
};

/* ------------------------------------------------------------------ */
/* Photo annotations — coordinates in % of the image                   */
/* (x as % of width, y as % of height; open ?annotate=1 to calibrate)  */
/* ------------------------------------------------------------------ */

export type Shape =
  | { kind: 'rect'; x: number; y: number; w: number; h: number }
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { kind: 'poly'; points: [number, number][] }
  /** An annulus (e.g. a ring of windows): inner and outer radius. */
  | { kind: 'ring'; cx: number; cy: number; r1: number; r2: number };

export interface Annotation {
  id: string;
  /** Short label set on the photo (tracked uppercase). */
  label: string;
  /** One line of explanation, shown next to or below the photo. */
  text: string;
  shapes: Shape[];
  /** Optional spotlight shapes (default: an ellipse around `shapes`, eased between steps). */
  spot?: Shape[];
  principle?: Principle;
  /** Draw outlines (default true). False = spotlight only. */
  outline?: boolean;
  /** True when the position could not be verified on the photo; listed in CHANGELOG.md. */
  needsCalibration?: boolean;
}

/* Shared shapes, measured on each photo with a 5 % grid. */
const hallPier: Shape = { kind: 'rect', x: 13.5, y: 8, w: 11, h: 47 };
const hallWindows: Shape = { kind: 'rect', x: 45, y: 3, w: 33, h: 18 };
const hallPlatform: Shape = { kind: 'rect', x: 58, y: 40, w: 27, h: 22 };
const hallPlatformColumns: Shape = { kind: 'rect', x: 58.5, y: 49, w: 26, h: 13 };

/* The reveal photo: geometry follows `revealAlignment` (square photo, so % of width = % of height). */
const domeCx = 50 + revealAlignment.offsetX;
const domeCy = 50 + revealAlignment.offsetY;
const circle = (r: number): Shape => ({ kind: 'ellipse', cx: domeCx, cy: domeCy, rx: r, ry: r });
const pierPoints = (r: number): [number, number][] =>
  Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI / 8 + (i * Math.PI) / 4;
    return [domeCx + r * Math.cos(a), domeCy + r * Math.sin(a)];
  });
const octagon = (r: number): Shape => ({ kind: 'poly', points: pierPoints(r) });
const pierSpots = (r: number): Shape[] =>
  pierPoints(r).map(([cx, cy]) => ({ kind: 'ellipse', cx, cy, rx: 6.5, ry: 6.5 }));

export const revealAnnotations: Annotation[] = [
  {
    id: 'reveal-piers',
    label: 'Eight piers',
    text: 'Where the great arches meet stand the eight piers that carry the dome.',
    shapes: [octagon(revealAlignment.pierRadius * 100)],
    spot: pierSpots(revealAlignment.pierRadius * 100),
    principle: 'structure',
  },
  {
    id: 'reveal-windows',
    label: 'Window ring',
    text: 'A ring of windows circles the base of the dome.',
    shapes: [{ kind: 'ring', cx: domeCx, cy: domeCy, r1: 32.5, r2: 38.5 }],
    principle: 'light',
  },
  {
    id: 'reveal-dome',
    label: 'One dome',
    text: 'A single dome, about 31 metres across, fills the whole view.',
    shapes: [circle(revealAlignment.domeRadius * 100)],
    principle: 'space',
  },
];

/* ------------------------------------------------------------------ */
/* Chapter V — annotated photographs (captions use verified facts only) */
/* ------------------------------------------------------------------ */

export interface InsideSlide {
  image: ImageKey;
  caption: string;
  figure: FigureId;
  position?: string;
  steps: Annotation[];
}

export const insideSlides: InsideSlide[] = [
  {
    image: 'prayerHall',
    figure: 'inside-hall',
    caption: 'One dome, about *31 metres* across, over a single open hall.',
    steps: [
      {
        id: 'hall-pier',
        label: 'A pier',
        text: 'One of the eight great piers, partly built into the outer walls. Together they carry the dome.',
        shapes: [hallPier],
        principle: 'structure',
      },
      {
        id: 'hall-floor',
        label: 'One open floor',
        text: 'Between the piers the floor opens wide: one room, under one dome.',
        shapes: [{ kind: 'ellipse', cx: 50, cy: 78, rx: 46, ry: 18 }],
        principle: 'space',
      },
      {
        id: 'hall-windows',
        label: 'Windows',
        text: 'High in the walls, row upon row of windows light the hall.',
        shapes: [hallWindows],
        principle: 'light',
      },
    ],
  },
  {
    image: 'mihrabApse',
    figure: 'inside-mihrab',
    caption: 'The mihrab sits in its own apse, *lit from three sides.*',
    steps: [
      {
        id: 'mihrab-windows',
        label: 'Windows on three sides',
        text: 'The mihrab’s own apse is lit from three sides.',
        // Three groups of windows: the left wall, the half-dome above, the right wall.
        shapes: [
          { kind: 'rect', x: 21, y: 37, w: 6, h: 20 },
          { kind: 'rect', x: 30, y: 15, w: 40, h: 21 },
          { kind: 'rect', x: 73, y: 37, w: 6, h: 20 },
        ],
        principle: 'light',
      },
    ],
  },
  {
    image: 'muezzinPlatform',
    figure: 'inside-platform',
    caption: 'The müezzin’s platform, *directly under the dome,* with a fountain beneath.',
    steps: [
      {
        id: 'platform-arches',
        label: 'Under the dome',
        text: 'The platform stands at the centre, directly under the dome, a placement Sinan never repeated. It rests on twelve small arches.',
        shapes: [{ kind: 'rect', x: 6, y: 47, w: 85, h: 23 }],
        principle: 'space',
      },
      {
        id: 'platform-fountain',
        label: 'Fountain',
        text: 'A marble fountain stands underneath the platform.',
        shapes: [{ kind: 'rect', x: 37, y: 72, w: 23, h: 16 }],
      },
    ],
  },
  {
    image: 'exteriorMinarets',
    figure: 'inside-exterior',
    caption: 'Four minarets, each *70.89 metres* tall, frame the dome.',
    position: '30% 50%',
    steps: [
      {
        id: 'ext-minarets',
        label: 'Four minarets',
        text: 'Four identical minarets, each 70.89 metres tall with three balconies, frame the dome.',
        shapes: [
          { kind: 'rect', x: 4.4, y: 21, w: 3.4, h: 50 },
          { kind: 'rect', x: 14.2, y: 4, w: 4, h: 67 },
          { kind: 'rect', x: 24.4, y: 17, w: 3.3, h: 50 },
          { kind: 'rect', x: 36.8, y: 8, w: 4, h: 64 },
        ],
      },
      {
        id: 'ext-dome',
        label: 'The dome',
        text: 'From outside, the single dome rises at the centre of it all.',
        shapes: [{ kind: 'ellipse', cx: 23, cy: 50.5, rx: 7, ry: 5.5 }],
        principle: 'space',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Chapter VI — hotspots (dot position + highlighted area, % of photo) */
/* ------------------------------------------------------------------ */

export interface Hotspot {
  id: string;
  view: 'interior' | 'exterior';
  x: number;
  y: number;
  title: string;
  facts: FactKey[];
  annotation: Annotation;
}

export const hotspotViews = {
  interior: 'prayerHall',
  exterior: 'exteriorOvercast',
} satisfies Record<Hotspot['view'], ImageKey>;

export const hotspots: Hotspot[] = [
  {
    id: 'piers',
    view: 'interior',
    x: 19,
    y: 32,
    title: 'The eight piers',
    facts: ['piers', 'galleries'],
    annotation: {
      id: 'hs-pier',
      label: 'A pier',
      text: '',
      shapes: [hallPier],
      principle: 'structure',
    },
  },
  {
    id: 'platform',
    view: 'interior',
    x: 72,
    y: 45,
    title: 'The müezzin’s platform',
    facts: ['muezzinPlatform'],
    annotation: {
      id: 'hs-platform',
      label: 'Müezzin’s platform',
      text: '',
      shapes: [hallPlatform],
      principle: 'space',
    },
  },
  {
    id: 'windows',
    view: 'interior',
    x: 56,
    y: 12,
    title: 'Windows and light',
    facts: ['windows', 'cornerSemidomes'],
    annotation: {
      id: 'hs-windows',
      label: 'Windows',
      text: '',
      shapes: [hallWindows],
      principle: 'light',
    },
  },
  {
    id: 'tulip',
    view: 'interior',
    x: 63,
    y: 58,
    title: 'The upside-down tulip',
    facts: ['tulip'],
    annotation: {
      id: 'hs-tulip',
      label: 'Platform columns',
      text: '',
      shapes: [hallPlatformColumns],
    },
  },
  {
    id: 'minarets',
    view: 'exterior',
    x: 70.5,
    y: 34,
    title: 'The minarets',
    facts: ['minarets', 'staircases'],
    annotation: {
      id: 'hs-minaret',
      label: 'Three balconies',
      text: '',
      shapes: [{ kind: 'rect', x: 67.8, y: 9, w: 4.6, h: 75 }],
    },
  },
  {
    id: 'scar',
    view: 'exterior',
    x: 46,
    y: 58,
    title: 'The scar of 1913',
    facts: ['damage1913'],
    // The dome is clearly identifiable; the exact place of the damage is not, so no "scar" label.
    annotation: {
      id: 'hs-dome',
      label: 'The dome',
      text: '',
      shapes: [{ kind: 'ellipse', cx: 46.5, cy: 61, rx: 12.5, ry: 6.5 }],
    },
  },
];
