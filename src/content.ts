/**
 * content.ts — the single source of truth for every word, fact, image and credit.
 *
 * Edit text here without touching any logic. Conventions:
 *  - Copy is short on purpose: one idea per scene, headlines of a few words, one supporting
 *    sentence. If an animation already shows something, the copy does not repeat it.
 *  - Every on-screen claim must be backed by an entry in `facts`, and every fact lists its
 *    `sources`. Interpretations are marked as such in REDESIGN_RATIONALE.md.
 *  - No quotation is attributed to Sinan. "Apprentice, journeyman, master" is reported speech
 *    from his biographies, never set in quotation marks.
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
  wikipediaRustem: {
    label: 'Wikipedia, “Rüstem Pasha Mosque”',
    url: 'https://en.wikipedia.org/wiki/R%C3%BCstem_Pasha_Mosque',
  },
  wikipediaVisegrad: {
    label: 'Wikipedia, “Mehmed Paša Sokolović Bridge”',
    url: 'https://en.wikipedia.org/wiki/Mehmed_Pa%C5%A1a_Sokolovi%C4%87_Bridge',
  },
  unescoVisegrad: {
    label: 'UNESCO World Heritage Centre, “Mehmed Paša Sokolović Bridge in Višegrad”',
    url: 'https://whc.unesco.org/en/list/1260/',
  },
  wikipediaMuradiye: {
    label: 'Wikipedia, “Muradiye Mosque, Manisa” (citing Necipoğlu 2005)',
    url: 'https://en.wikipedia.org/wiki/Muradiye_Mosque,_Manisa',
  },
  tdvMuradiye: {
    label: 'TDV İslâm Ansiklopedisi, “Murâdiye Külliyesi (Manisa)”',
    url: 'https://islamansiklopedisi.org.tr/muradiye-kulliyesi--manisa',
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
  /** Plain-language wording, as checked against the sources. */
  text: string;
  sources: SourceKey[];
}

export const facts = {
  /* --- Mimar Sinan ----------------------------------------------------- */
  sinanLife: {
    title: 'c. 1490–1588',
    text: 'Mimar Sinan was born around 1490 in Ağırnas, near Kayseri, and died in Istanbul in 1588. His exact birth year is disputed.',
    sources: ['aaLegacy', 'wikipediaSinan'],
  },
  sinanEngineer: {
    title: 'From military engineer to architect',
    text: 'Before he became chief architect, Sinan served in the army as a military engineer.',
    sources: ['wikipediaSinan'],
  },
  sinanAppointed: {
    title: 'Chief architect from 1539',
    text: 'In 1539 the grand vizier Lütfi Pasha appointed Sinan chief architect of the court.',
    sources: ['wikipediaSinan'],
  },
  sinanRole: {
    title: 'Chief architect for about fifty years',
    text: 'He was chief architect of the Ottoman Empire for about fifty years, under three sultans: Süleyman I, Selim II and Murad III.',
    sources: ['aaLegacy'],
  },
  sinanBuildings: {
    title: 'Hundreds of buildings',
    text: 'Hundreds of buildings are attributed to him and the imperial architects he led: mosques, bridges, schools, baths, hospitals and waterworks. Counts differ between sources.',
    sources: ['wikipediaSinan', 'aaLegacy'],
  },
  masterwork: {
    title: 'Apprentice, journeyman, master',
    text: 'In his biographies Sinan called the Şehzade Mosque (1548) his apprentice work, the Süleymaniye (1557) his journeyman work, and the Selimiye (1575) his masterwork.',
    sources: ['aa', 'wikipediaSinan'],
  },
  sinanAge: {
    title: 'An architect in his eighties',
    text: 'Sinan was in his eighties when he built the Selimiye.',
    sources: ['ktb'],
  },

  /* --- Selimiye ---------------------------------------------------------- */
  patron: {
    title: 'A sultan’s mosque',
    text: 'Commissioned by Sultan Selim II; built 1568/69–1574/75 and opened for worship in 1575.',
    sources: ['unesco', 'wikipedia', 'aa'],
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
    text: 'The prayer space measures roughly 45 × 36 metres.',
    sources: ['unesco'],
  },
  piers: {
    title: 'Eight piers',
    text: 'The single dome is carried by eight piers, partly freestanding but closely built into the outer walls.',
    sources: ['unesco', 'wikipedia'],
  },
  windows: {
    title: 'Walls opened to light',
    text: 'Buttresses are hidden in the outer walls, so the walls between them could be pierced with a great many windows, creating an extraordinarily bright interior.',
    sources: ['unesco', 'wikipedia'],
  },
  unity: {
    title: 'One unobstructed dome',
    text: 'The interior is dominated by one dome, its view unimpeded by the structural elements of earlier large domed mosques.',
    sources: ['wikipedia', 'tdv'],
  },
  staircases: {
    title: 'Three staircases in one tower',
    text: 'The two minarets on the courtyard side each have three independent staircases, one to each balcony, so three people can climb without meeting.',
    sources: ['icomos', 'ktb', 'dailySabah'],
  },
  unescoSite: {
    title: 'World Heritage',
    text: 'A UNESCO World Heritage Site since 2011.',
    sources: ['unesco'],
  },
  hsSupport: {
    title: 'Hagia Sophia’s support',
    text: 'Hagia Sophia’s dome sits on four main piers with two great half-domes, which stretch the space into a long nave.',
    sources: ['hagiaSophia'],
  },

  /* --- The three works --------------------------------------------------- */
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

  /* --- Other works on the timeline ----------------------------------------- */
  rustem: {
    title: 'Rüstem Pasha Mosque',
    text: 'The Rüstem Pasha Mosque in Istanbul, designed by Sinan, was built 1561–1563.',
    sources: ['wikipediaRustem'],
  },
  visegrad: {
    title: 'The bridge at Višegrad',
    text: 'The Mehmed Paša Sokolović Bridge over the Drina at Višegrad (Bosnia and Herzegovina), designed by Sinan, was built 1571–1577. A UNESCO World Heritage Site since 2007.',
    sources: ['wikipediaVisegrad', 'unescoVisegrad'],
  },
  muradiye: {
    title: 'The Muradiye in Manisa',
    text: 'The Muradiye Mosque in Manisa (1583–1586) was designed by Sinan for Sultan Murad III and built by Mahmud Halife and, from January 1586, by Sedefkâr Mehmed Ağa.',
    sources: ['wikipediaMuradiye', 'tdvMuradiye'],
  },

  /* --- Legacy ------------------------------------------------------------ */
  sedefkar: {
    title: 'Sedefkâr Mehmed Ağa',
    text: 'Sedefkâr Mehmed Ağa was one of the architects trained by Sinan. He took over the building of Sinan’s Muradiye Mosque in Manisa in 1586 and became chief imperial architect in 1606.',
    sources: ['tdvSedefkar', 'archnet', 'wikipediaMuradiye'],
  },
  sultanAhmed: {
    title: 'The Sultan Ahmed Mosque',
    text: 'He designed the Sultan Ahmed Mosque, the “Blue Mosque” in Istanbul, built 1609–1617. Its design is based on Sinan’s Şehzade Mosque (a central dome with four half-domes), not on Selimiye’s eight piers. It was the last great mosque of the classical period.',
    sources: ['tdvSultanAhmed', 'wikipediaBlueMosque'],
  },
} satisfies Record<string, Fact>;

export type FactKey = keyof typeof facts;

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

export type ChapterId =
  | 'sinan'
  | 'challenge'
  | 'structure'
  | 'light'
  | 'reveal'
  | 'inside'
  | 'lifetime'
  | 'career'
  | 'legacy'
  | 'name'
  | 'epilogue'
  | 'credits';

export interface ChapterMeta {
  id: ChapterId;
  /** Short name shown in the progress bar. */
  title: string;
  /** Counted in the progress bar (credits sit outside the story). */
  inProgress: boolean;
}

export const chapters: ChapterMeta[] = [
  { id: 'sinan', title: 'Mimar Sinan', inProgress: true },
  { id: 'challenge', title: 'The challenge', inProgress: true },
  { id: 'structure', title: 'Structure', inProgress: true },
  { id: 'light', title: 'Light', inProgress: true },
  { id: 'reveal', title: 'Look up', inProgress: true },
  { id: 'inside', title: 'Space', inProgress: true },
  { id: 'lifetime', title: 'A lifetime', inProgress: true },
  { id: 'career', title: 'Fifty years', inProgress: true },
  { id: 'legacy', title: 'After Sinan', inProgress: true },
  { id: 'name', title: 'Remember him', inProgress: true },
  { id: 'epilogue', title: 'Epilogue', inProgress: true },
  { id: 'credits', title: 'Sources', inProgress: false },
];

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

export const copy = {
  meta: {
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    soundAnnounceOn: 'Sound turned on.',
    soundAnnounceOff: 'Sound turned off.',
    continue: 'Continue',
    model: 'A simplified drawing, not an engineering model.',
  },

  sinan: {
    kicker: 'Architect · c. 1490–1588',
    first: 'Mimar',
    last: 'Sinan',
    lede: 'For about fifty years he was chief architect of the Ottoman Empire. Hundreds of buildings are attributed to him.',
    turn: 'In his eighties he finished the building he called his masterwork. This is how he built it.',
    begin: 'Begin',
  },

  challenge: {
    label: 'The challenge',
    headline: 'A dome is heavy.',
    body: 'Selimiye’s dome is about 31 metres across. It must rest on something, without filling the room below.',
    cta: 'Let it fall',
    span: '31 m',
    figureLabel:
      'Drawing of a nearly square prayer hall seen at an angle, with a single dome hovering above it.',
    collapsed: {
      headline: 'It needs support.',
      body: 'A dome pushes down and outwards. Its whole edge has to rest on something solid.',
      cta: 'Find the support',
      announce: 'The dome fell. A dome pushes down and outwards, so its edge needs support.',
    },
  },

  structure: {
    label: 'Structure',
    headline: 'Where do the supports go?',
    body: 'Every support carries weight, and every support takes up room. Try each number.',
    groupLabel: 'Number of supports',
    options: [
      {
        n: 4,
        label: 'Four supports',
        title: 'Four supports',
        body: 'Big gaps between them. In this simplified drawing, the dome’s edge hangs over empty space there and pushes outwards.',
      },
      {
        n: 8,
        label: 'Eight supports',
        title: 'Eight: Sinan’s answer',
        body: 'Sinan used eight piers: massive stone pillars, close to the walls. They hold the dome all the way round, and the floor stays one open room.',
      },
      {
        n: 16,
        label: 'Sixteen supports',
        title: 'Sixteen supports',
        body: 'The dome is well held, but the columns divide the floor into a centre and an edge.',
      },
    ],
    empty: 'Choose a number.',
    floor: 'Open floor',
    figureLabel: (n: number) =>
      n === 0
        ? 'Cut-away drawing of the hall with the dome above it and no supports yet.'
        : `Cut-away drawing of the hall with ${n} supports under the dome. The open floor is shaded.`,
  },

  light: {
    label: 'Light',
    headline: 'Free walls can open.',
    body: 'The eight piers carry the dome. The walls between them hold up much less, so Sinan could fill them with windows.',
    control: 'Open the walls',
    levels: ['Closed', 'One row open', 'Two rows open', 'Three rows open', 'Dome windows open'],
    closing: 'Sinan’s structure filled the room with daylight.',
    figureLabel:
      'Cut-away drawing of the prayer hall: eight piers carry the dome, and the walls between them fill with windows. Light falls across the floor.',
  },

  reveal: {
    label: 'Look up',
    prompt: 'Stand in the centre of the hall and look up.',
    headline: 'This is Selimiye.',
    figureLabel:
      'The eight-pier plan, seen from directly below, turns into a photograph of the real dome of the Selimiye Mosque.',
    cta: 'Look around',
  },

  inside: {
    label: 'Space',
    headline: 'One room, full of daylight.',
    body: 'Nothing stands between you and the dome. The light comes in from every wall.',
    toggle: 'Highlight the windows',
    caption: 'The prayer hall of the Selimiye Mosque, seen from the floor.',
  },

  lifetime: {
    label: 'A lifetime',
    headline: 'It took him a lifetime.',
    body: 'Sinan described three of his mosques as milestones in his career, from apprentice to master.',
    works: [
      {
        image: 'sehzadeDomes' as const,
        year: '1548',
        name: 'Şehzade',
        stage: 'Apprentice',
        text: 'Smaller half-domes on all four sides',
        /** Where the main dome sits in the photo, and how much to show around it (% of width). */
        frame: { cx: 49, cy: 45, r: 42 },
      },
      {
        image: 'suleymaniyeDomes' as const,
        year: '1557',
        name: 'Süleymaniye',
        stage: 'Journeyman',
        text: 'Half-domes on two sides',
        frame: { cx: 49, cy: 41.5, r: 41 },
      },
      {
        image: 'domeFromBelow' as const,
        year: '1575',
        name: 'Selimiye',
        stage: 'Master',
        text: 'One dome, with nothing in its way',
        frame: { cx: 51.4, cy: 53.7, r: 46 },
      },
    ],
    scale: 'Looking up in each mosque. Different lenses; not to scale.',
    detail: {
      open: 'One remarkable detail',
      title: 'Three stairs in one minaret',
      text: 'Two of Selimiye’s minarets each hold three separate staircases, one to each balcony. Three people can climb at once without ever meeting.',
      note: 'Schematic drawing, not to scale.',
      close: 'Close',
      label:
        'Schematic drawing of a minaret cut open: three spiral staircases wind around each other, each ending at a different balcony.',
    },
  },

  career: {
    label: 'Fifty years',
    headline: 'Fifty years of architecture.',
    lede: 'Selimiye was one work among hundreds.',
    /** Shown only where hovering is possible; touch screens get `hintTouch`. */
    hint: 'Hover over a building to see it.',
    hintTouch: 'Tap a building to see it, tap again to close.',
    close: 'Hide photograph',
    /** Verified in `facts` (sinanAppointed, masterwork, rustem, visegrad, muradiye, sinanLife). */
    milestones: [
      { year: '1539', name: 'Chief architect', note: 'Appointed to lead the imperial architects' },
      {
        year: '1548',
        name: 'Şehzade Mosque',
        note: 'Istanbul · his apprentice work',
        major: true,
        image: 'sehzadeExterior' as const,
      },
      {
        year: '1557',
        name: 'Süleymaniye Mosque',
        note: 'Istanbul · his journeyman work',
        major: true,
        image: 'suleymaniyeExterior' as const,
      },
      {
        year: '1563',
        name: 'Rüstem Pasha Mosque',
        note: 'Istanbul · built 1561–1563',
        image: 'rustemInterior' as const,
      },
      {
        year: '1575',
        name: 'Selimiye Mosque',
        note: 'Edirne · his masterwork',
        major: true,
        image: 'selimiyeExterior' as const,
      },
      {
        year: '1577',
        name: 'Bridge over the Drina',
        note: 'Višegrad, Bosnia · built 1571–1577',
        image: 'drinaBridge' as const,
      },
      {
        year: '1586',
        name: 'Muradiye Mosque',
        note: 'Manisa · his design, built by other architects',
        image: 'muradiyeManisa' as const,
      },
      { year: '1588', name: 'Dies in Istanbul', note: 'After about fifty years in office' },
    ],
    scale:
      'Hundreds of works are attributed to Sinan and the imperial architects he led: mosques and bridges, but also schools, baths, hospitals and waterworks.',
  },

  legacy: {
    label: 'After Sinan',
    headline: 'His ideas outlived him.',
    body: 'Sinan trained the architects who came after him. One of them designed the Sultan Ahmed Mosque, the last great mosque of the classical Ottoman style, on the plan of Sinan’s Şehzade.',
    groupLabel: 'Show building',
    buildings: [
      {
        key: 'sehzade' as const,
        image: 'sehzadeExterior' as const,
        button: 'Şehzade',
        name: 'Şehzade Mosque',
        meta: 'Mimar Sinan · 1548',
        text: 'A central dome, held up by four half-domes, with smaller domes stepping down around them.',
      },
      {
        key: 'blue' as const,
        image: 'sultanAhmed' as const,
        button: 'Sultan Ahmed',
        name: 'Sultan Ahmed Mosque',
        meta: 'Sedefkâr Mehmed Ağa · 1609–1617',
        text: 'The same idea, built about sixty years later on a grander scale: a central dome with four half-domes.',
      },
    ],
  },

  name: {
    first: 'Mimar',
    last: 'Sinan',
    dates: 'c. 1490–1588',
    summary:
      'At Selimiye, structure, space and light became one building: a single great dome on eight piers, an open room beneath it, and walls full of windows.',
    facts: [
      'Chief architect of the Ottoman Empire for about fifty years',
      'Hundreds of buildings, from mosques to bridges and hospitals',
      'Teacher of the architects who came after him',
    ],
  },

  epilogue: {
    headline: 'He didn’t just hold up the sky. *He let the light in.*',
    lede: 'Mimar Sinan, in his eighties, for Sultan Selim II. Selimiye Mosque, Edirne, 1575.',
    restart: 'Start again',
    credits: 'Sources & credits',
  },

  credits: {
    headline: 'Sources & credits',
    intro: 'Every fact in this story comes from the sources below.',
    model:
      'The drawings of the dome and its supports are simplified illustrations of an idea. They are not engineering calculations.',
    imagesTitle: 'Photographs',
    sourcesTitle: 'Sources',
    back: 'Back to the epilogue',
    restart: 'Start again',
  },
};

/* ------------------------------------------------------------------ */
/* Images                                                              */
/* ------------------------------------------------------------------ */

export interface ImageAsset {
  /**
   * Path inside /public, without a leading slash (see core/asset.ts, so it also works from a
   * subfolder); renditions are `${src}-{800|1600|2400}.{avif|webp|jpg}`.
   */
  src: string;
  width: number;
  height: number;
  /** Rendition widths, if not the default 800 / 1600 / 2400 (small previews use 640 / 1280). */
  widths?: number[];
  alt: string;
  credit: {
    title: string;
    author: string;
    license: string;
    licenseUrl: string;
    sourceUrl: string;
    /** How the photo was changed, if at all (required for CC BY-SA adaptations). */
    modified?: string;
  };
}

const CC_BY_SA_4 = 'https://creativecommons.org/licenses/by-sa/4.0/';

export const images = {
  sinanMonument: {
    src: 'images/people/mimar-sinan-monument-edirne',
    width: 3840,
    height: 5760,
    alt: 'The modern bronze monument to Mimar Sinan in Edirne: a bearded man in a large turban and a long robe, seated, looking down at his hands.',
    credit: {
      title: 'Mimar Sinan monument in 2024',
      author: 'Dosseman',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mimar_Sinan_monument_in_2024_6024.jpg',
      modified: 'Cropped. A closer crop of the same photo is used at the end.',
    },
  },
  sinanPortrait: {
    src: 'images/people/mimar-sinan-monument-portrait',
    width: 1440,
    height: 1800,
    alt: 'Close view of the modern bronze monument to Mimar Sinan in Edirne: his face, full beard and large turban, eyes lowered, against a clear sky.',
    credit: {
      title: 'Mimar Sinan monument in 2024 (detail)',
      author: 'Dosseman',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mimar_Sinan_monument_in_2024_6024.jpg',
      modified: 'Cropped to the head and shoulders.',
    },
  },
  domeFromBelow: {
    src: 'images/reveal/selimiye-dome-from-below',
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
      modified: 'Cropped to a square.',
    },
  },
  prayerHall: {
    src: 'images/interior/selimiye-prayer-hall',
    width: 3840,
    height: 2555,
    alt: 'The vast prayer hall seen from the floor: red carpets stretch to massive piers, rows of windows glow high in every wall, and the müezzin’s platform stands in the middle of the room.',
    credit: {
      title: 'Edirne Selimiye Mosque Müezzin mahfili view in the room in 2009',
      author: 'Dosseman',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Edirne_Selimiye_Mosque_M%C3%BCezzin_mahfili_view_in_the_room_in_2009_6286.jpg',
    },
  },
  sehzadeDomes: {
    src: 'images/career/sehzade-domes-from-below',
    width: 2556,
    height: 2556,
    alt: 'Looking up inside the Şehzade Mosque with a wide lens: a central dome with a half-dome on each of its four sides.',
    credit: {
      title: 'Şehzade Mosque domes in 2018',
      author: 'Dosseman',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:%C5%9Eehzade_Mosque_domes_in_2018_9508.jpg',
      modified: 'Cropped to a square.',
    },
  },
  suleymaniyeDomes: {
    src: 'images/career/suleymaniye-domes-from-below',
    width: 2556,
    height: 2556,
    alt: 'Looking up inside the Süleymaniye Mosque: the central dome, with a half-dome opening beyond it at the top and at the bottom, and walls of windows to the left and right.',
    credit: {
      title: 'Istanbul Suleymaniye Mosque Interior Ceiling 2015',
      author: 'Dosseman',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Istanbul_Suleymaniye_Mosque_Interior_Ceiling_2015_1311.jpg',
      modified: 'Cropped to a square.',
    },
  },
  sehzadeExterior: {
    src: 'images/legacy/sehzade-mosque-exterior',
    width: 3840,
    height: 2560,
    alt: 'The Şehzade Mosque in Istanbul from outside: a large central dome over half-domes and smaller domes, with ornate corner turrets and a slender minaret.',
    credit: {
      title: 'Şehzade Mosque',
      author: 'Brian Jeffery Beggerly',
      license: 'CC BY 2.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:%C5%9Eehzade_Mosque.jpg',
    },
  },
  suleymaniyeExterior: {
    src: 'images/works/suleymaniye-exterior',
    width: 3840,
    height: 2560,
    widths: [640, 1280],
    alt: 'The Süleymaniye Mosque in Istanbul from its garden: a great dome rising over smaller domes, with tall minarets.',
    credit: {
      title: 'Süleymaniye Mosque exterior view',
      author: 'İhsan Deniz Kılıçoğlu',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:S%C3%BCleymaniye_Mosque_exterior_view.JPG',
    },
  },
  rustemInterior: {
    src: 'images/works/rustem-pasha-interior',
    width: 3840,
    height: 2580,
    widths: [640, 1280],
    alt: 'Inside the Rüstem Pasha Mosque in Istanbul: the dome over arches and walls covered in blue İznik tiles.',
    credit: {
      title: 'Rustem pacha mosque Istanbul July 2022-1',
      author: 'Alvesgaspar',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Rustem_pacha_mosque_Istanbul_July_2022-1.jpg',
    },
  },
  selimiyeExterior: {
    src: 'images/works/selimiye-exterior',
    width: 3840,
    height: 2555,
    widths: [640, 1280],
    alt: 'The Selimiye Mosque in Edirne from a distance: one great dome between four tall minarets.',
    credit: {
      title: 'Edirne Selimiye Mosque from distance in 2009',
      author: 'Dosseman',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Edirne_Selimiye_Mosque_from_distance_in_2009_6427.jpg',
    },
  },
  drinaBridge: {
    src: 'images/works/drina-bridge',
    width: 3531,
    height: 1907,
    widths: [640, 1280],
    alt: 'The Mehmed Paša Sokolović Bridge in Višegrad: a long stone bridge of many arches over the Drina river.',
    credit: {
      title: 'Mehmed Paša Sokolović Bridge, Višegrad',
      author: 'Pudelek (Marcin Szala)',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Mehmed_Pa%C5%A1a_Sokolovi%C4%87_Bridge,_Vi%C5%A1egrad.JPG',
    },
  },
  muradiyeManisa: {
    src: 'images/works/muradiye-manisa',
    width: 3840,
    height: 2550,
    widths: [640, 1280],
    alt: 'The Muradiye Mosque in Manisa from its garden: a domed fountain in front of the mosque’s arched portico.',
    credit: {
      title: 'Manisa Muradiye Camii from garden',
      author: 'Dosseman',
      license: 'CC BY-SA 4.0',
      licenseUrl: CC_BY_SA_4,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Manisa_Muradiye_Camii_from_garden_6079.jpg',
    },
  },
  sultanAhmed: {
    src: 'images/legacy/sultan-ahmed-mosque',
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
 * Where the dome sits in the reveal photo (square, 2550 px), in % of its width.
 * The drawn plan and the circular frame are both centred on this point, so the dome — not
 * the photo — sits in the optical centre. Check with `?annotate=1#reveal`.
 */
export const revealAlignment = {
  centreX: 51.4,
  centreY: 53.7,
  /** Radius of the dome rim, % of the width. */
  domeRadius: 40.5,
  /** Distance from the centre to the eight piers (where the arches meet), % of the width. */
  pierRadius: 47,
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
  /** Short name of the idea (Structure, Space, Light), also used as a label. */
  label: string;
  /** One line of explanation, shown beside the photo. */
  text: string;
  shapes: Shape[];
  /** Optional spotlight shapes (default: an ellipse around `shapes`). */
  spot?: Shape[];
  /** Draw outlines (default true). False = spotlight only. */
  outline?: boolean;
}

const { centreX: dcx, centreY: dcy } = revealAlignment;
const pierPoints = (r: number): [number, number][] =>
  Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI / 8 + (i * Math.PI) / 4;
    return [dcx + r * Math.cos(a), dcy + r * Math.sin(a)];
  });

/** The guided look at the real dome: structure, then light, then the space they make. */
export const revealAnnotations: Annotation[] = [
  {
    id: 'reveal-piers',
    label: 'Structure',
    text: 'The eight piers, massive stone pillars, carry the dome. They stand where the striped arches meet.',
    shapes: [{ kind: 'poly', points: pierPoints(revealAlignment.pierRadius) }],
    spot: pierPoints(revealAlignment.pierRadius).map(([cx, cy]) => ({
      kind: 'ellipse',
      cx,
      cy,
      rx: 7,
      ry: 7,
    })),
  },
  {
    id: 'reveal-windows',
    label: 'Light',
    text: 'A ring of windows circles the base of the dome.',
    shapes: [{ kind: 'ring', cx: dcx, cy: dcy, r1: 32.5, r2: 38.5 }],
  },
  {
    id: 'reveal-dome',
    label: 'Space',
    text: 'One dome, about 31 metres across, over one open room.',
    shapes: [
      {
        kind: 'ellipse',
        cx: dcx,
        cy: dcy,
        rx: revealAlignment.domeRadius,
        ry: revealAlignment.domeRadius,
      },
    ],
  },
];

/**
 * The windows of the prayer hall photo, for "Show only the windows".
 * Measured by drawing each rectangle onto the photo over a 5 % grid (see REDESIGN_RATIONALE.md).
 */
export const insideWindows: Annotation = {
  id: 'inside-windows',
  label: 'Windows',
  text: 'Daylight enters through rows of windows in every wall and around the dome.',
  outline: false,
  shapes: [
    // Upper left: the lunette under the dome, and the drum windows above the left arch.
    { kind: 'rect', x: 5, y: 1, w: 12, h: 9 },
    { kind: 'rect', x: 31, y: 0, w: 9, h: 5 },
    // Tall windows in the left wall.
    { kind: 'rect', x: 1.5, y: 19, w: 3.5, h: 11 },
    { kind: 'rect', x: 9.5, y: 20, w: 4, h: 11 },
    { kind: 'rect', x: 27, y: 21, w: 9, h: 4.5 },
    { kind: 'rect', x: 45.5, y: 20, w: 3.5, h: 8 },
    // Far wall, behind the platform: the half-dome windows and the great window field.
    { kind: 'rect', x: 46, y: 12, w: 12, h: 6 },
    { kind: 'rect', x: 64, y: 7, w: 12, h: 10 },
    { kind: 'rect', x: 52, y: 24, w: 22, h: 7.5 },
    // Right: the window fields over the galleries.
    { kind: 'rect', x: 81, y: 9, w: 12, h: 8 },
    { kind: 'rect', x: 83, y: 22, w: 10, h: 6 },
    { kind: 'rect', x: 66, y: 35, w: 7, h: 4 },
    { kind: 'rect', x: 84, y: 36, w: 6, h: 4 },
    // Windows at floor level, left.
    { kind: 'rect', x: 0, y: 42, w: 4, h: 12 },
    { kind: 'rect', x: 8, y: 44, w: 4, h: 10 },
  ],
};
