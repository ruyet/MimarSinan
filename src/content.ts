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
  { id: 'masterwork', numeral: 'VII', title: 'The masterwork', inProgress: true },
  { id: 'epilogue', numeral: 'VIII', title: 'Epilogue', inProgress: true },
  { id: 'credits', numeral: '', title: 'Sources & credits', inProgress: false },
];

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
    progressTotal: 'VIII',
    continue: 'Continue',
    model: 'A simplified model, for illustration.',
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
    body: 'You have a nearly square hall and a single dome to cover it. A dome is heavy, and it has to rest on something.',
    goal: 'Your goal: carry the dome and keep the space beneath as open as possible, so it feels like one room.',
    cta: 'Release the dome',
    redraw: 'Redraw',
    figureLabel:
      'Line drawing: a nearly square prayer hall seen at an angle, with a circle on the floor marking where the dome would sit. Above it, a single dome hovers in the air, with guide lines showing where it would drop.',
    figcaption: 'Fig. I — A prayer hall, and the dome meant to cover it.',
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
      figcaption: 'Fig. I — Without support, the dome collapses.',
      announce:
        'The dome collapsed. A dome pushes down and outward; it needs something to push against.',
    },
  },

  dilemma: {
    eyebrow: 'The dilemma',
    figcaption: 'Fig. II — The dome seen from above, with the ring where piers can stand.',
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
        headline: 'Where do the *supports* go?',
        body: 'Choose how many piers carry the dome. Each pier carries weight, but each one also stands in the room.',
      },
      4: {
        headline: 'Four is *not enough.*',
        body: 'The gaps between the piers are too wide. Between them, the dome pushes outward with nothing to stop it.',
      },
      6: {
        headline: 'Six is *nearly there.*',
        body: 'The dome holds, but it strains. Watch the red lines where the gaps are still too wide.',
      },
      8: {
        headline: '*Eight.*',
        body: 'This is Sinan’s answer at Selimiye: eight piers, pulled back into the walls, carrying one dome about 31 metres across.',
      },
      12: {
        headline: 'Stable, but *crowded.*',
        body: 'The dome is safe, but the floor fills with columns. The room no longer feels like one space.',
      },
      16: {
        headline: 'A forest *of columns.*',
        body: 'Every extra pier takes away open space. The dome holds, but the room is lost.',
      },
    },
    hagia: {
      title: 'Another answer',
      body: 'Hagia Sophia solved this with four piers and two huge half-domes, which stretched its space into a long hall.',
      label:
        'Sketch of Hagia Sophia’s plan: a central dome on four piers, with a half-dome at each end.',
    },
    announce: (n: number, stability: string, openness: string) =>
      `${n} piers. Stability: ${stability}. Openness: ${openness}.`,
    lockIn: 'Balanced. Both meters are in the sweet spot.',
  },

  walls: {
    eyebrow: 'Opening the walls',
    headline: 'Now, *let the light in.*',
    body: 'The piers carry the dome. Buttresses hide inside the walls. So the walls themselves can open up.',
    control: 'Open the walls',
    dragHint: 'Drag across the drawing, or use the slider.',
    lightLabel: 'Light',
    levels: ['Dim', 'A little light', 'Brighter', 'Bright', 'Filled with light'],
    closing: 'Structure made *the light* possible.',
    figcaption: 'Fig. III — Eight piers carry the dome; the walls between them are free to open.',
    figureLabel:
      'Cut-away drawing of the prayer hall: eight piers carry the dome, and the walls between them fill with windows as you open them. Light falls across the floor.',
  },

  reveal: {
    eyebrow: 'Look up',
    prompt: 'Stand in the centre of the hall, and look up.',
    headline: 'This is what *Sinan built.*',
    toggleDrawing: 'Show the drawing',
    figureLabel:
      'The eight-pier plan, seen from directly below, turning into a photograph of the real dome.',
  },

  inside: {
    eyebrow: 'Inside the light',
    prev: 'Previous photo',
    next: 'Next photo',
    hint: 'Scroll, swipe or use the arrow keys.',
    slide: (i: number, total: number) => `Photo ${i} of ${total}`,
  },

  discover: {
    eyebrow: 'Look closer',
    headline: 'Six *details.*',
    body: 'Select a point on the photo to learn more.',
    views: { interior: 'Inside', exterior: 'Outside' },
    close: 'Close',
    legend: 'Legend',
    sourcesLabel: 'Source',
    seen: (n: number, total: number) => `${n} of ${total} explored`,
  },

  masterwork: {
    eyebrow: 'The masterwork',
    headline: 'Equal in width, *one in spirit.*',
    body: 'Selimiye’s dome matches Hagia Sophia’s in width, something no Ottoman builder had managed before. Sinan claimed his was higher and wider; modern measurements put the two at about the same.',
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
    stagesNote: 'How Sinan himself described three stages of his career.',
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
/* Chapter V — photo sequence (captions use verified facts only)       */
/* ------------------------------------------------------------------ */

export const insideSlides: { image: ImageKey; caption: string; position?: string }[] = [
  {
    image: 'prayerHall',
    caption: 'One dome, about *31 metres* across, over a single open hall.',
  },
  {
    image: 'mihrabApse',
    caption: 'The mihrab sits in its own apse, *lit from three sides.*',
  },
  {
    image: 'muezzinPlatform',
    caption: 'The müezzin’s platform, *directly under the dome,* with a fountain beneath.',
  },
  {
    image: 'exteriorMinarets',
    caption: 'Four minarets, each *70.89 metres* tall, frame the dome.',
    position: '35% 50%',
  },
];

/* ------------------------------------------------------------------ */
/* Chapter VI — hotspots (x / y in % of the photo)                     */
/* ------------------------------------------------------------------ */

export interface Hotspot {
  id: string;
  view: 'interior' | 'exterior';
  x: number;
  y: number;
  title: string;
  facts: FactKey[];
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
  },
  {
    id: 'platform',
    view: 'interior',
    x: 72,
    y: 45,
    title: 'The müezzin’s platform',
    facts: ['muezzinPlatform'],
  },
  {
    id: 'windows',
    view: 'interior',
    x: 56,
    y: 12,
    title: 'Windows and light',
    facts: ['windows', 'cornerSemidomes'],
  },
  { id: 'tulip', view: 'interior', x: 60, y: 60, title: 'The upside-down tulip', facts: ['tulip'] },
  {
    id: 'minarets',
    view: 'exterior',
    x: 70.5,
    y: 34,
    title: 'The minarets',
    facts: ['minarets', 'staircases'],
  },
  { id: 'scar', view: 'exterior', x: 46, y: 58, title: 'The scar of 1913', facts: ['damage1913'] },
];
