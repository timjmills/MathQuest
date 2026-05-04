// gen-phonics.js — Procedural question generator for Phonics & Decoding atoms.
//
// Phase 3 expansion: full implementation for:
//   - reading_phonics_short_a_initial  (Phase 1 template — unchanged)
//   - reading_phonics_digraph_sh / _ch / _th / _wh  (Phase 2)
//   - reading_phonics_blend_initial_l / _r / _s / _final  (Phase 2)
//   - reading_phonics_short_a_medial / _final
//   - reading_phonics_short_e/i/o/u_medial
//   - reading_phonics_short_vowels_mixed
//   - reading_phonics_short_a/e/i/o/u_in_blends (5 atoms)
//   - reading_phonics_heart_word_<word> (18 atoms: said, was, have, of, the, to, you,
//       are, were, what, where, who, your, do, many, could, would, should)
//
// Generic fallback for all other phonics atoms (Phase 4 expansion will fill each in).
//
// Stage 1 widget-fallback map:
//   letter-tile-spell → fib-auto   (single blank, letter-by-letter input)
//   sort-into-bins    → dnd-linked  (drag words into target bins)
//   sound-box         → dnd-linked  (drag phoneme chips into ordered boxes)
//   tap-hotspot       → mc-image   (picture identification)
//
// Export:
//   generatePhonicsQuestion(skillAtom, mechanicHint?, options?) → Question

// ─── Word banks ────────────────────────────────────────────────────────────────

const SHORT_A_INITIAL_WORDS = ['apple', 'ant', 'axe', 'add', 'ask'];
const SHORT_A_MEDIAL_WORDS  = ['cat', 'hat', 'bag', 'can', 'pan', 'mad', 'tap', 'map', 'bat', 'cap'];
const NON_SHORT_A_WORDS     = ['banana', 'dog', 'pig', 'sun', 'moon', 'egg', 'cup', 'box', 'top', 'hen'];

// ─── Short-vowel master word banks (all 5 vowels × medial / final / in_blends) ─

const SHORT_VOWELS_WORDS = {
    a: {
        medial:    ['cat', 'hat', 'bag', 'can', 'pan', 'mad', 'tap', 'map', 'bat', 'cap'],
        final:     ['flat', 'snap', 'clap', 'grab', 'plan', 'crab', 'flag', 'slap', 'trap'],
        in_blends: ['flat', 'snap', 'clap', 'grab', 'plan', 'crab', 'flag', 'slam', 'lamp'],
    },
    e: {
        medial:    ['bed', 'red', 'pen', 'hen', 'wet', 'vet', 'net', 'jet', 'peg', 'men'],
        in_blends: ['fled', 'sled', 'blend', 'spent', 'stem', 'spell', 'flex', 'shell'],
    },
    i: {
        medial:    ['sit', 'big', 'pig', 'fish', 'win', 'hit', 'pin', 'lid', 'dip', 'fig'],
        in_blends: ['slim', 'drip', 'gift', 'print', 'flip', 'swim', 'grip', 'crisp'],
    },
    o: {
        medial:    ['hot', 'dog', 'top', 'pot', 'box', 'log', 'rock', 'sock', 'hop', 'nod'],
        in_blends: ['plot', 'stop', 'frog', 'drop', 'flop', 'crop', 'trot', 'clock'],
    },
    u: {
        medial:    ['sun', 'bug', 'cup', 'run', 'fun', 'mud', 'tub', 'gum', 'rug', 'pup'],
        in_blends: ['plug', 'drum', 'grunt', 'stuck', 'plus', 'club', 'snug', 'trust'],
    },
};

// IPA symbols for the 5 short vowels
const VOWEL_IPA = { a: '/æ/', e: '/ɛ/', i: '/ɪ/', o: '/ɒ/', u: '/ʌ/' };

// ─── Heart-word bank ───────────────────────────────────────────────────────────
// Each entry: display spelling, phoneme sequence, irregular grapheme, explanation.

const HEART_WORDS_BANK = {
    said:   { display: 'said',   sounds: ['/s/', '/ɛ/', '/d/'],         heart_grapheme: 'ai',       explanation: '"ai" says /ɛ/ here, not the expected /eɪ/.' },
    was:    { display: 'was',    sounds: ['/w/', '/ʌ/', '/z/'],          heart_grapheme: 'a',        explanation: '"a" says /ʌ/ here, not the expected /æ/.' },
    have:   { display: 'have',   sounds: ['/h/', '/æ/', '/v/'],          heart_grapheme: 'silent_e', explanation: 'The silent "e" does NOT make the vowel long.' },
    of:     { display: 'of',     sounds: ['/ʌ/', '/v/'],                 heart_grapheme: 'f',        explanation: '"f" says /v/ here — unexpected voicing.' },
    the:    { display: 'the',    sounds: ['/ð/', '/ə/'],                 heart_grapheme: 'e',        explanation: '"e" says schwa /ə/; "th" is a voiced digraph.' },
    to:     { display: 'to',     sounds: ['/t/', '/uː/'],                heart_grapheme: 'o',        explanation: '"o" says /uː/ here, not /ɒ/ or /oʊ/.' },
    you:    { display: 'you',    sounds: ['/j/', '/uː/'],                heart_grapheme: 'ou',       explanation: '"ou" says /uː/ here, not the expected /aʊ/.' },
    are:    { display: 'are',    sounds: ['/ɑː/', '/r/'],                heart_grapheme: 'a',        explanation: '"a" says /ɑː/ (r-controlled), not short /æ/.' },
    were:   { display: 'were',   sounds: ['/w/', '/ɝ/'],                 heart_grapheme: 'ere',      explanation: '"ere" says /ɝ/, not the VCe long /iː/ pattern.' },
    what:   { display: 'what',   sounds: ['/w/', '/ɒ/', '/t/'],          heart_grapheme: 'a',        explanation: '"a" says /ɒ/ after "wh", not expected /æ/.' },
    where:  { display: 'where',  sounds: ['/w/', '/ɛr/'],                heart_grapheme: 'ere',      explanation: '"ere" says /ɛr/ (like "air"), not long /iː/ VCe.' },
    who:    { display: 'who',    sounds: ['/h/', '/uː/'],                heart_grapheme: 'wh_o',     explanation: '"wh" says /h/ (not /w/); "o" says /uː/.' },
    your:   { display: 'your',   sounds: ['/j/', '/ɔːr/'],               heart_grapheme: 'our',      explanation: '"our" says /ɔːr/ or /ər/, not expected /aʊər/.' },
    do:     { display: 'do',     sounds: ['/d/', '/uː/'],                heart_grapheme: 'o',        explanation: '"o" says /uː/ here, not /ɒ/ or /oʊ/.' },
    many:   { display: 'many',   sounds: ['/m/', '/ɛ/', '/n/', '/iː/'],  heart_grapheme: 'a',        explanation: '"a" says /ɛ/ here, not the expected /æ/ in "man".' },
    could:  { display: 'could',  sounds: ['/k/', '/ʊ/', '/d/'],          heart_grapheme: 'oul',      explanation: '"ou" says /ʊ/; "l" is silent — two irregular features.' },
    would:  { display: 'would',  sounds: ['/w/', '/ʊ/', '/d/'],          heart_grapheme: 'oul',      explanation: '"ou" says /ʊ/; "l" is silent (same pattern as could/should).' },
    should: { display: 'should', sounds: ['/ʃ/', '/ʊ/', '/d/'],          heart_grapheme: 'oul',      explanation: '"ou" says /ʊ/; "l" is silent — third of could/would/should.' },
};

// CVC phoneme decompositions extended for all 5 short vowels
const SHORT_VOWEL_CVC_PHONEMES = {
    // short-a
    cat: ['/k/', '/æ/', '/t/'],   hat: ['/h/', '/æ/', '/t/'],
    bag: ['/b/', '/æ/', '/g/'],   can: ['/k/', '/æ/', '/n/'],
    bat: ['/b/', '/æ/', '/t/'],   map: ['/m/', '/æ/', '/p/'],
    pan: ['/p/', '/æ/', '/n/'],   cap: ['/k/', '/æ/', '/p/'],
    // short-e
    bed: ['/b/', '/ɛ/', '/d/'],   red: ['/r/', '/ɛ/', '/d/'],
    pen: ['/p/', '/ɛ/', '/n/'],   hen: ['/h/', '/ɛ/', '/n/'],
    net: ['/n/', '/ɛ/', '/t/'],   jet: ['/dʒ/', '/ɛ/', '/t/'],
    // short-i
    sit: ['/s/', '/ɪ/', '/t/'],   pig: ['/p/', '/ɪ/', '/g/'],
    win: ['/w/', '/ɪ/', '/n/'],   hit: ['/h/', '/ɪ/', '/t/'],
    pin: ['/p/', '/ɪ/', '/n/'],   big: ['/b/', '/ɪ/', '/g/'],
    // short-o
    hot: ['/h/', '/ɒ/', '/t/'],   dog: ['/d/', '/ɒ/', '/g/'],
    top: ['/t/', '/ɒ/', '/p/'],   pot: ['/p/', '/ɒ/', '/t/'],
    hop: ['/h/', '/ɒ/', '/p/'],
    // short-u
    sun: ['/s/', '/ʌ/', '/n/'],   bug: ['/b/', '/ʌ/', '/g/'],
    cup: ['/k/', '/ʌ/', '/p/'],   run: ['/r/', '/ʌ/', '/n/'],
    gum: ['/g/', '/ʌ/', '/m/'],
};

// Distractor phoneme pool for sound-box questions
const DISTRACTOR_PHONEMES_POOL = ['/s/', '/d/', '/n/', '/p/', '/r/', '/l/', '/m/', '/f/', '/g/', '/t/', '/b/'];

// ─── Digraph word banks ────────────────────────────────────────────────────────

const DIGRAPH_WORDS = {
    sh: {
        initial: ['ship', 'shop', 'shut', 'shed', 'sheep', 'shell', 'shark', 'shoe', 'short'],
        final:   ['fish', 'wish', 'dish', 'rush', 'crash', 'flash', 'brush'],
        examples: 'ship, fish, sheep',
        phoneme: '/ʃ/',
        sound_desc: 'sh sound (like in "ship")',
    },
    ch: {
        initial: ['chin', 'chip', 'chat', 'chess', 'cherry', 'chest', 'chop', 'chick'],
        final:   ['lunch', 'rich', 'beach', 'peach', 'teach', 'reach', 'each'],
        examples: 'chip, lunch, beach',
        phoneme: '/tʃ/',
        sound_desc: 'ch sound (like in "chip")',
    },
    th: {
        initial: ['this', 'that', 'then', 'think', 'thumb', 'thin', 'three', 'threw'],
        final:   ['math', 'path', 'bath', 'breath', 'with', 'mouth', 'teeth'],
        examples: 'thin, this, math',
        phoneme: '/θ/',
        sound_desc: 'th sound (like in "thin")',
    },
    wh: {
        initial: ['when', 'what', 'why', 'where', 'whale', 'wheel', 'wheat', 'white'],
        final:   [],
        examples: 'when, what, whale',
        phoneme: '/hw/',
        sound_desc: 'wh sound (like in "when")',
    },
};

// Words that do NOT contain any of the four digraphs — safe distractors
const NON_DIGRAPH_WORDS = ['bed', 'cat', 'dog', 'fox', 'hat', 'jar', 'kite', 'log', 'mud', 'net', 'pin', 'run', 'top', 'van', 'wax'];

// ─── Blend word banks ─────────────────────────────────────────────────────────

const BLEND_WORDS = {
    l_blends: {
        words: ['blue', 'black', 'clap', 'clock', 'flag', 'flat', 'glad', 'glass', 'plan', 'plant', 'sleep', 'slim', 'blob', 'clip', 'flip', 'glow', 'plug', 'sled'],
        prefixes: ['bl', 'cl', 'fl', 'gl', 'pl', 'sl'],
        phoneme: 'l-blend',
        sound_desc: 'l-blend (bl-, cl-, fl-, gl-, pl-, sl-)',
        examples: 'blue, clap, flag, glad, plan, sleep',
    },
    r_blends: {
        words: ['brown', 'brick', 'crab', 'cream', 'dress', 'drink', 'frog', 'fruit', 'grass', 'green', 'prize', 'print', 'tree', 'trap', 'brag', 'crib', 'drip', 'grin', 'prop', 'trim'],
        prefixes: ['br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr'],
        phoneme: 'r-blend',
        sound_desc: 'r-blend (br-, cr-, dr-, fr-, gr-, pr-, tr-)',
        examples: 'brown, crab, dress, frog, grass, tree',
    },
    s_blends: {
        words: ['scarf', 'school', 'skate', 'sky', 'smile', 'smell', 'snake', 'snow', 'spot', 'spin', 'stick', 'stop', 'swim', 'sweet', 'scat', 'skip', 'smog', 'snip', 'span', 'stem', 'swam'],
        prefixes: ['sc', 'sk', 'sm', 'sn', 'sp', 'st', 'sw'],
        phoneme: 's-blend',
        sound_desc: 's-blend (sc-, sk-, sm-, sn-, sp-, st-, sw-)',
        examples: 'skate, smile, snake, spot, stick, swim',
    },
    final_blends: {
        words: ['fast', 'last', 'desk', 'milk', 'help', 'jump', 'lift', 'best', 'wind', 'hand', 'sink', 'tank', 'soft', 'belt', 'melt', 'bold', 'felt', 'rent', 'bent', 'lend'],
        suffixes: ['st', 'sk', 'nd', 'nt', 'mp', 'lt', 'lk', 'ft'],
        phoneme: 'final-blend',
        sound_desc: 'final blend (-st, -nd, -nt, -mp, -lt)',
        examples: 'fast, desk, help, jump, hand',
    },
};

// Words that have no blends — safe distractors for blend sorts
const NON_BLEND_WORDS = ['cap', 'bed', 'dig', 'fog', 'hat', 'jet', 'kit', 'lot', 'map', 'nod', 'pet', 'rug', 'sat', 'tub', 'vet', 'web', 'yam', 'zip'];

// ─── VCe / Silent-e word banks ──────────────────────────────────────────────────

const VCE_WORDS = {
    a: ['cake', 'tape', 'name', 'game', 'plate', 'snake'],
    i: ['kite', 'ride', 'time', 'five', 'hide', 'smile'],
    o: ['hope', 'rope', 'bone', 'home', 'stove', 'phone'],
    e: ['Pete', 'here', 'these', 'theme'],
    u: ['cube', 'tune', 'use', 'cute', 'huge', 'flute'],
};

// CVC short-vowel distractors for VCe vs CVC sorts
const CVC_SHORT_DISTRACTOR_WORDS = ['cat', 'bit', 'hop', 'sun', 'pet', 'kit', 'log', 'bun', 'net', 'pin'];

// ─── Vowel-team word banks ──────────────────────────────────────────────────────

const VOWEL_TEAM_WORDS = {
    ai_ay: {
        ai: ['rain', 'train', 'sail', 'snail', 'wait'],
        ay: ['play', 'day', 'say', 'may', 'stay'],
    },
    ee_ea: {
        ee: ['tree', 'see', 'bee', 'feet', 'green'],
        ea: ['read', 'eat', 'beach', 'team', 'seat'],
    },
    oa_ow: {
        oa: ['boat', 'soap', 'road', 'toast', 'goat'],
        ow: ['snow', 'grow', 'low', 'show', 'blow'],
    },
    ie:       ['pie', 'lie', 'tie', 'die'],
    ue_ew: {
        ue: ['true', 'blue', 'glue', 'clue'],
        ew: ['new', 'few', 'crew', 'grew', 'flew'],
    },
    igh:      ['light', 'night', 'high', 'sight', 'right', 'flight'],
    oo_long:  ['boot', 'moon', 'roof', 'tool', 'pool', 'soon'],
    oo_short: ['book', 'look', 'foot', 'wood', 'good', 'cook'],
};

// ─── R-controlled word banks ────────────────────────────────────────────────────

const R_CONTROLLED_WORDS = {
    ar:      { words: ['car', 'star', 'park', 'far', 'arm', 'dark'] },
    or:      { words: ['corn', 'fork', 'more', 'horn', 'born'] },
    er_ir_ur: {
        er: ['her', 'herd', 'perk'],
        ir: ['bird', 'girl', 'third', 'first'],
        ur: ['turn', 'burn', 'curl', 'hurt'],
    },
    are_air: {
        are: ['care', 'bare', 'share', 'dare'],
        air: ['air', 'hair', 'chair', 'pair', 'fair', 'stairs'],
    },
    ear_eer: {
        ear: ['hear', 'near', 'dear', 'clear'],
        eer: ['cheer', 'deer', 'steer', 'peer'],
    },
};

// ─── Diphthong word banks ───────────────────────────────────────────────────────

const DIPHTHONG_WORDS = {
    oi_oy: {
        oi: ['coin', 'oil', 'boil', 'join', 'point'],
        oy: ['boy', 'toy', 'joy', 'enjoy', 'royal'],
    },
    ou_ow: {
        ou: ['cloud', 'out', 'found', 'round', 'count'],
        ow: ['cow', 'how', 'now', 'town', 'brown'],
    },
    au: { words: ['author', 'autumn', 'fault', 'pause', 'launch'] },
    aw: { words: ['saw', 'draw', 'claw', 'jaw', 'crawl'] },
};

// Emoji image stand-ins used until real CDN image URLs are available.
// mc-image widget accepts q.options[i].image as a URL; here we use a data-URI
// wrapper so the emoji renders identically in all browsers.
const WORD_EMOJI = {
    // short-a initial
    apple: '🍎',  ant: '🐜',   axe: '🪓',    add: '➕',   ask: '❓',
    // short-a medial
    cat: '🐱',   hat: '🎩',   bag: '👜',    can: '🥫',  pan: '🍳',
    mad: '😠',   tap: '🚰',   map: '🗺️',   bat: '🦇',  cap: '🧢',
    // non-short-a distractors
    banana: '🍌', dog: '🐕',   pig: '🐷',   sun: '☀️',  moon: '🌙',
    egg:  '🥚',  cup: '☕',   box: '📦',   top: '🔝',  hen: '🐔',
    // digraph sh words
    ship: '🚢',  shop: '🏪',  shut: '🚪',  shed: '🏚️', sheep: '🐑',
    shell: '🐚', shark: '🦈', shoe: '👟',  short: '📏', fish: '🐟',
    wish: '⭐',  dish: '🍽️', rush: '💨',  crash: '💥', flash: '⚡',
    brush: '🪥',
    // digraph ch words
    chin: '🫦',  chip: '🍟',  chat: '💬',  chess: '♟️', cherry: '🍒',
    chest: '📦', chop: '🪓',  chick: '🐥', lunch: '🥗', rich: '💰',
    beach: '🏖️', peach: '🍑', teach: '👩‍🏫', reach: '🤲', each: '☝️',
    // digraph th words
    thumb: '👍', think: '💭', thin: '📏',  three: '3️⃣', threw: '🥏',
    math: '➗',  path: '🛤️', bath: '🛁',  breath: '💨', mouth: '👄',
    teeth: '🦷', with: '🤝',
    // digraph wh words
    when: '⏰',  what: '❓',  why: '🤔',   where: '📍', whale: '🐋',
    wheel: '⚙️', wheat: '🌾', white: '⬜',
    // short-a medial/final
    flat: '📐',   snap: '📸',  clap: '👏',  grab: '✋',  plan: '📋',
    crab: '🦀',   flag: '🚩',  slap: '👋',  trap: '🪤',  slam: '💥',
    lamp: '💡',
    // short-e medial
    bed: '🛏️',   red: '🔴',   pen: '✏️',   hen: '🐔',   wet: '💧',
    vet: '👨‍⚕️', net: '🥅',   jet: '✈️',   peg: '📌',   men: '👬',
    // short-e in-blends
    fled: '🏃',  sled: '🛷',  blend: '🥤', spent: '💸', stem: '🌿',
    spell: '🔤', flex: '💪',  shell: '🐚',
    // short-i medial
    sit: '🪑',   big: '⬆️',   pig: '🐷',   fish: '🐟',  win: '🏆',
    hit: '⚾',   pin: '📍',   lid: '🫙',   dip: '🏊',   fig: '🫐',
    // short-i in-blends
    slim: '📏',  drip: '💧',  gift: '🎁',  print: '🖨️', flip: '🔄',
    swim: '🏊',  grip: '✊',  crisp: '🍟',
    // short-o medial
    hot: '🔥',   pot: '🍲',   rock: '🪨',  sock: '🧦',  hop: '🐇',
    nod: '👍',
    // short-o in-blends
    plot: '📊',  stop: '🛑',  frog: '🐸',  drop: '💧',  flop: '😴',
    crop: '🌾',  trot: '🐎',  clock: '⏰',
    // short-u medial
    run: '🏃',   fun: '🎉',   mud: '🟤',   tub: '🛁',   gum: '🍬',
    rug: '🪸',   pup: '🐶',
    // short-u in-blends
    plug: '🔌',  drum: '🥁',  grunt: '😤', stuck: '🫙', plus: '➕',
    club: '🏏',  snug: '🤗',  trust: '🤝',
    // non-digraph distractors
    fox: '🦊',   jar: '🫙',   kite: '🪁',  log: '🪵',
    mud: '🪨',   net: '🥅',  pin: '📌',   run: '🏃',   van: '🚐',
    wax: '🕯️',
    // blend words
    blue: '🔵',  black: '⬛', clap: '👏',  clock: '🕐', flag: '🚩',
    flat: '🏠',  glad: '😊', glass: '🥛', plan: '📋',  plant: '🌱',
    sleep: '😴', slim: '📏', blob: '💧',  clip: '📎',  flip: '🔄',
    glow: '✨',  plug: '🔌', sled: '🛷',
    brown: '🟤', brick: '🧱', crab: '🦀', cream: '🍦', dress: '👗',
    drink: '🥤', frog: '🐸', fruit: '🍎', grass: '🌿', green: '💚',
    prize: '🏆', print: '🖨️', tree: '🌳', trap: '🪤', brag: '💪',
    crib: '🛏️', drip: '💧',  grin: '😁', prop: '🎭', trim: '✂️',
    scarf: '🧣', school: '🏫', skate: '⛸️', sky: '☁️', smile: '😊',
    smell: '👃', snake: '🐍', snow: '❄️', spot: '⭕',  spin: '🌀',
    stick: '🥢', stop: '🛑', swim: '🏊', sweet: '🍬', scat: '🐾',
    skip: '⏭️', smog: '🌫️', snip: '✂️', span: '📐', stem: '🌿',
    swam: '🏊',
    fast: '⚡',  last: '🥇',  desk: '🪑', milk: '🥛', help: '🤝',
    jump: '🦘', lift: '🏋️', best: '🌟', wind: '💨', hand: '✋',
    sink: '🚿', tank: '🚰',  soft: '🧸', belt: '👗',  melt: '🧊',
    bold: '🦁', felt: '🧶',  rent: '🏠', bent: '🔧',  lend: '🤲',
    // non-blend distractors
    jet: '✈️',  kit: '🧰',  lot: '🎰',   nod: '😴',   pet: '🐾',
    rug: '🪞',   sat: '🪑',  tub: '🛁',   vet: '🩺',   web: '🕸️',
    yam: '🍠',   zip: '🤐',
    // VCe long-vowel words
    cake: '🎂',  tape: '🩹',  name: '🏷️',  game: '🎮',  plate: '🍽️',
    ride: '🎡',  time: '⏰',  five: '5️⃣',  hide: '🙈',
    hope: '🤞',  rope: '🪢',  bone: '🦴',  home: '🏠',  stove: '🍳',  phone: '📱',
    Pete: '👦',  here: '👇',  these: '📋', theme: '🎨',
    cube: '🧊',  tune: '🎵',  use: '🔧',   cute: '🥰',  huge: '🐘',  flute: '🎶',
    // Vowel team ai/ay
    rain: '🌧️', train: '🚆', sail: '⛵',  snail: '🐌', wait: '⏳',
    play: '🎮',  day: '☀️',  say: '💬',   may: '🌸',   stay: '🏠',
    // Vowel team ee/ea
    bee: '🐝',   feet: '🦶',  green: '💚',
    read: '📖',  eat: '🍴',   team: '👥',  seat: '💺',
    // Vowel team oa/ow
    boat: '⛵',  soap: '🧼',  road: '🛣️', toast: '🍞', goat: '🐐',
    blow: '💨',
    // Vowel team ie
    pie: '🥧',   lie: '🤥',   tie: '👔',   die: '🎲',
    // Vowel team ue/ew
    glue: '🗜️', clue: '🔍',
    new: '✨',   few: '🔢',   crew: '👨‍✈️', grew: '🌱',  flew: '✈️',
    // Vowel team igh
    light: '💡', night: '🌙', high: '🔝',  sight: '👁️', right: '✅',  flight: '✈️',
    // Vowel team oo (long and short)
    boot: '👢',  roof: '🏠',  tool: '🔧',  pool: '🏊',  soon: '⏱️',
    book: '📚',  look: '👀',  foot: '🦶',  wood: '🪵',  good: '👍',  cook: '👨‍🍳',
};

// CVC phoneme decompositions used by the sound-box (dnd-linked) variant.
const CVC_PHONEMES = {
    cat: ['/k/', '/æ/', '/t/'],
    hat: ['/h/', '/æ/', '/t/'],
    bag: ['/b/', '/æ/', '/g/'],
    can: ['/k/', '/æ/', '/n/'],
    bat: ['/b/', '/æ/', '/t/'],
    map: ['/m/', '/æ/', '/p/'],
};

// Stage 1 fallbacks: when a widget doesn't exist yet, route to the closest
// available Stage 1 widget.  Keys are the mechanic IDs found in
// SkillAtom.question_types[]; values are the LITERACY_WIDGETS keys.
const STAGE1_FALLBACK = {
    'letter-tile-spell': 'fib-auto',
    'sort-into-bins':    'dnd-linked',
    'sound-box':         'dnd-linked',
    'tap-hotspot':       'mc-image',   // visual tap → mc-image fallback
    // All other mechanics pass through unchanged
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Pick a mechanic from the atom's question_types array, respecting the hint. */
function _pickMechanic(skillAtom, hint, rng) {
    const pool = Array.isArray(skillAtom.question_types) && skillAtom.question_types.length > 0
        ? skillAtom.question_types
        : ['mc-image'];
    if (hint && pool.includes(hint)) return hint;
    return pool[Math.floor(rng() * pool.length)];
}

/** Simple pseudo-unique ID for a question instance. */
function _qid(skillId, suffix) {
    return `${skillId}_${Date.now()}_${suffix}`;
}

/** Pick `n` random items from `arr` without replacement (rng = 0..1 fn). */
function _sample(arr, n, rng) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
}

/** Build an emoji "image URL" string for the mc-image widget. */
function _emojiImg(word) {
    const e = WORD_EMOJI[word] || '?';
    // Return as a tiny SVG data-URI so mc-image renders it as <img src="">
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><text y="60" font-size="60">${e}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ─── Variant generators for reading_phonics_short_a_initial ───────────────────

/**
 * mc-image variant:
 *   "Tap the picture that has the /æ/ sound at the beginning."
 *   3 image options — 1 short-a initial word (correct) + 2 non-short-a distractors.
 */
function _shortAInitialMcImage(skillAtom, rng) {
    const [correct] = _sample(SHORT_A_INITIAL_WORDS, 1, rng);
    const distractors = _sample(NON_SHORT_A_WORDS, 2, rng);

    const allWords = _sample([correct, ...distractors], 3, rng);  // shuffle order
    const options = allWords.map((w, i) => ({
        id: String.fromCharCode(97 + i),   // 'a', 'b', 'c'
        label: w,
        image: _emojiImg(w),
        alt: w,
        correct: w === correct,
    }));
    const correctOpt = options.find(o => o.correct);

    return {
        id: _qid(skillAtom.skill_id, 'mci'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-image',
        stem: 'Tap the picture that has the /æ/ sound at the beginning.',
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" does not start with /æ/`])
        ),
        hints: [
            'Listen for the short a sound at the start of each word.',
            `The correct picture starts with the letter "a" — listen: /æ/.`,
        ],
        rit_difficulty: 145,
        grade_level: 'K-1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: 'Tap the picture that has the short a sound at the beginning.',
    };
}

/**
 * fib-auto variant (stage-1 stand-in for letter-tile-spell):
 *   "Spell the word shown." — single blank with the emoji as stem prompt.
 *   accept_list contains the target word; case-insensitive.
 */
function _shortAInitialFibAuto(skillAtom, rng) {
    const [word] = _sample(SHORT_A_INITIAL_WORDS, 1, rng);
    const emoji = WORD_EMOJI[word] || '';

    return {
        id: _qid(skillAtom.skill_id, 'fib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        stem: `Spell the word: ${emoji} (${word.length} letters)`,
        // fib-auto expects q.ans as an array of blank-spec objects
        ans: [{
            acceptable_answers: [word],
            case_sensitive: false,
            normalize_whitespace: true,
            label: `Type the word for ${emoji}`,
        }],
        correct_answer: word,
        distractor_misconceptions: {},
        hints: [
            `Say each sound you hear: ${word.split('').join(' - ')}.`,
            `Start with the letter "a" for the short /æ/ sound.`,
        ],
        rit_difficulty: 145,
        grade_level: 'K-1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: `Spell the word: ${word}`,
        partial_credit: false,
    };
}

/**
 * dnd-linked variant — sort-into-bins mode:
 *   Drag 5 words into "Has /æ/" vs "No /æ/" bins.
 *   Uses 3 short-a initial words (correct bin) + 2 non-short-a words (wrong bin).
 */
function _shortAInitialSortBins(skillAtom, rng) {
    const hasAe = _sample(SHORT_A_INITIAL_WORDS, 3, rng);
    const noAe  = _sample(NON_SHORT_A_WORDS, 2, rng);

    const allWords = _sample([...hasAe, ...noAe], 5, rng);
    const draggables = allWords.map((w, i) => ({
        id: `w${i}`,
        label: `${WORD_EMOJI[w] || ''} ${w}`,
        audio_text: w,
    }));

    const correctAns = {};
    allWords.forEach((w, i) => {
        correctAns[`w${i}`] = hasAe.includes(w) ? 'bin_yes' : 'bin_no';
    });

    return {
        id: _qid(skillAtom.skill_id, 'sort'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: 'Sort each word: does it start with the /æ/ sound?',
        draggables,
        zones: [
            { id: 'bin_yes', label: 'Has /æ/ ✓', accepts: hasAe.map((_, i) => `w${allWords.indexOf(hasAe[i])}`) },
            { id: 'bin_no',  label: 'No /æ/ ✗',  accepts: noAe.map((_, i) => `w${allWords.indexOf(noAe[i])}`)  },
        ],
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {},
        hints: [
            'Say each word aloud. Listen for /æ/ at the very start.',
            'Words like "apple" and "ant" start with /æ/.',
        ],
        rit_difficulty: 148,
        grade_level: 'K-1',
        has_audio: true,
        k2_appropriate: true,
    };
}

/**
 * dnd-linked variant — sound-box mode:
 *   "Drag the phoneme chips into the boxes for '<word>'."
 *   Three Elkonin boxes for a CVC word; chips include the correct phonemes +
 *   one extra distractor.
 */
function _shortAInitialSoundBox(skillAtom, rng) {
    const cvcWords = Object.keys(CVC_PHONEMES);
    const [word] = _sample(cvcWords, 1, rng);
    const phonemes = CVC_PHONEMES[word];
    const emoji = WORD_EMOJI[word] || '';

    // Add a distractor chip so it's not trivially solved
    const distractors = ['/s/', '/d/', '/n/', '/p/', '/r/'].filter(p => !phonemes.includes(p));
    const [distractor] = _sample(distractors, 1, rng);
    const chips = _sample([...phonemes, distractor], 4, rng);

    const draggables = chips.map((p, i) => ({ id: `chip${i}`, label: p, audio_text: p }));
    const correctAns = {};
    phonemes.forEach((p, boxIdx) => {
        const chipIdx = chips.indexOf(p);
        correctAns[`chip${chipIdx}`] = `box${boxIdx}`;
    });

    return {
        id: _qid(skillAtom.skill_id, 'sbox'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Drag the sound chips into the boxes for "${emoji} ${word}".`,
        draggables,
        zones: phonemes.map((_, i) => ({
            id: `box${i}`,
            label: `Sound ${i + 1}`,
            accepts: [draggables[chips.indexOf(phonemes[i])].id],
        })),
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {
            [`chip${chips.indexOf(distractor)}`]: 'That sound is not in this word.',
        },
        hints: [
            `Say "${word}" slowly and tap each sound.`,
            `"${word}" has ${phonemes.length} sounds: ${phonemes.join(' - ')}.`,
        ],
        rit_difficulty: 150,
        grade_level: 'K-1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: word,
    };
}

/**
 * mc-audio variant:
 *   "Listen. Which word starts with /æ/?"
 *   3 word-label options; audio speaks the prompt; correct is a short-a initial word.
 */
function _shortAInitialMcAudio(skillAtom, rng) {
    const [correct] = _sample(SHORT_A_INITIAL_WORDS, 1, rng);
    const distractors = _sample(NON_SHORT_A_WORDS, 2, rng);
    const allWords = _sample([correct, ...distractors], 3, rng);

    const options = allWords.map((w, i) => ({
        id: String.fromCharCode(97 + i),
        label: w,
        text: w,
        correct: w === correct,
    }));
    const correctOpt = options.find(o => o.correct);

    return {
        id: _qid(skillAtom.skill_id, 'mca'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-audio',
        stem: 'Listen. Which word starts with the /æ/ sound?',
        audio_text: 'Which word starts with the short a sound?',
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" does not begin with /æ/`])
        ),
        hints: [
            'Say each word. Which one begins with the /æ/ sound, like in "apple"?',
            `The answer starts with the letter "a".`,
        ],
        rit_difficulty: 147,
        grade_level: 'K-1',
        has_audio: true,
        k2_appropriate: true,
    };
}

// ─── Short-vowel shared generators (medial / final / in_blends / mixed) ─────

/**
 * Parse vowel ('a'|'e'|'i'|'o'|'u') and position from a short-vowel skill_id.
 * Returns { vowel, position } or null.
 */
function _parseShortVowelSkill(skillId) {
    const m = skillId.match(/short_([aeiou])_(medial|final|in_blends|mixed)/);
    if (!m) return null;
    return { vowel: m[1], position: m[2] };
}

/**
 * mc-image: "Tap the picture that has the /ɛ/ sound in the middle."
 */
function _shortVowelMcImage(skillAtom, vowel, position, rng) {
    const ipa = VOWEL_IPA[vowel];
    const correctPool = SHORT_VOWELS_WORDS[vowel][position] || SHORT_VOWELS_WORDS[vowel].medial;
    const distractorPool = Object.entries(SHORT_VOWELS_WORDS)
        .filter(([v]) => v !== vowel)
        .flatMap(([, pos]) => Object.values(pos).flat());

    const [correct] = _sample(correctPool, 1, rng);
    const wrongs = _sample(distractorPool.filter(w => w !== correct), 2, rng);
    const allWords = _sample([correct, ...wrongs], 3, rng);

    const options = allWords.map((w, i) => ({
        id: String.fromCharCode(97 + i),
        label: w,
        image: _emojiImg(w),
        alt: w,
        correct: w === correct,
    }));
    const correctOpt = options.find(o => o.correct);
    const posLabel = position === 'in_blends' ? 'in a blend word' : 'in the middle';
    const stem = `Tap the picture whose name has the ${ipa} sound ${posLabel}.`;

    return {
        id: _qid(skillAtom.skill_id, 'mci'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-image',
        stem,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" does not have the ${ipa} sound.`])
        ),
        hints: [
            `Say each word carefully. Listen for the ${ipa} sound.`,
            `The answer contains the vowel "${vowel}" making the ${ipa} sound.`,
        ],
        rit_difficulty: 148,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: stem,
    };
}

/**
 * fib-auto (letter-tile-spell fallback): "Spell the word: 🐟 (3 letters)"
 */
function _shortVowelFibAuto(skillAtom, vowel, position, rng) {
    const ipa = VOWEL_IPA[vowel];
    const wordPool = SHORT_VOWELS_WORDS[vowel][position] || SHORT_VOWELS_WORDS[vowel].medial;
    const [word] = _sample(wordPool, 1, rng);
    const emoji = WORD_EMOJI[word] || '?';

    return {
        id: _qid(skillAtom.skill_id, 'fib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        stem: `Spell the word: ${emoji} (${word.length} letters)`,
        ans: [{
            acceptable_answers: [word],
            case_sensitive: false,
            normalize_whitespace: true,
            label: `Type the word for ${emoji}`,
        }],
        correct_answer: word,
        distractor_misconceptions: {},
        hints: [
            `Say each sound slowly: ${word.split('').join(' - ')}.`,
            `The vowel in "${word}" is "${vowel}" making the ${ipa} sound.`,
        ],
        rit_difficulty: 150,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: `Spell the word: ${word}`,
        partial_credit: false,
    };
}

/**
 * dnd-linked sort-into-bins: 3 target-vowel words vs 2 non-matching.
 */
function _shortVowelSortBins(skillAtom, vowel, position, rng) {
    const ipa = VOWEL_IPA[vowel];
    const correctPool = SHORT_VOWELS_WORDS[vowel][position] || SHORT_VOWELS_WORDS[vowel].medial;
    const distractorPool = Object.entries(SHORT_VOWELS_WORDS)
        .filter(([v]) => v !== vowel)
        .flatMap(([, pos]) => Object.values(pos).flat());

    const hasV = _sample(correctPool, 3, rng);
    const noV  = _sample(distractorPool, 2, rng);
    const allWords = _sample([...hasV, ...noV], 5, rng);

    const draggables = allWords.map((w, i) => ({
        id: `w${i}`,
        label: `${WORD_EMOJI[w] || ''} ${w}`,
        audio_text: w,
    }));
    const correctAns = {};
    allWords.forEach((w, i) => {
        correctAns[`w${i}`] = hasV.includes(w) ? 'bin_yes' : 'bin_no';
    });

    return {
        id: _qid(skillAtom.skill_id, 'sort'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Sort each word: does it have the ${ipa} vowel sound?`,
        draggables,
        zones: [
            { id: 'bin_yes', label: `Has ${ipa} ✓`, accepts: hasV.map((_, i) => `w${allWords.indexOf(hasV[i])}`) },
            { id: 'bin_no',  label: `No ${ipa} ✗`,  accepts: noV.map((_, i) => `w${allWords.indexOf(noV[i])}`)  },
        ],
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {},
        hints: [
            `Say each word. Listen for the ${ipa} sound.`,
            `Example with ${ipa}: "${correctPool[0]}".`,
        ],
        rit_difficulty: 150,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
    };
}

/**
 * dnd-linked sound-box: drag phoneme chips into Elkonin boxes for a CVC word.
 */
function _shortVowelSoundBox(skillAtom, vowel, rng) {
    const ipa = VOWEL_IPA[vowel];
    // Pick a CVC word whose middle phoneme matches this vowel
    const vowelCvcWords = Object.keys(SHORT_VOWEL_CVC_PHONEMES).filter(w => {
        const phms = SHORT_VOWEL_CVC_PHONEMES[w];
        return phms && phms[1] === ipa;
    });
    const fallbackPool = SHORT_VOWELS_WORDS[vowel].medial;
    const pool = vowelCvcWords.length > 0 ? vowelCvcWords : fallbackPool;
    const [word] = _sample(pool, 1, rng);
    const phonemes = SHORT_VOWEL_CVC_PHONEMES[word];
    if (!phonemes) return _shortVowelFibAuto(skillAtom, vowel, 'medial', rng);

    const emoji = WORD_EMOJI[word] || '?';
    const distractors = DISTRACTOR_PHONEMES_POOL.filter(p => !phonemes.includes(p));
    const [distractor] = _sample(distractors, 1, rng);
    const chips = _sample([...phonemes, distractor], 4, rng);

    const draggables = chips.map((p, i) => ({ id: `chip${i}`, label: p, audio_text: p }));
    const correctAns = {};
    phonemes.forEach((p, boxIdx) => {
        const chipIdx = chips.indexOf(p);
        correctAns[`chip${chipIdx}`] = `box${boxIdx}`;
    });

    return {
        id: _qid(skillAtom.skill_id, 'sbox'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Drag the sound chips into the boxes for "${emoji} ${word}".`,
        draggables,
        zones: phonemes.map((_, i) => ({
            id: `box${i}`,
            label: `Sound ${i + 1}`,
            accepts: [draggables[chips.indexOf(phonemes[i])].id],
        })),
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {
            [`chip${chips.indexOf(distractor)}`]: 'That sound is not in this word.',
        },
        hints: [
            `Say "${word}" slowly and tap each sound.`,
            `"${word}" has 3 sounds: ${phonemes.join(' - ')}.`,
        ],
        rit_difficulty: 152,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: word,
    };
}

/**
 * mc-audio: "Listen. Which word has the /ɛ/ sound?"
 */
function _shortVowelMcAudio(skillAtom, vowel, position, rng) {
    const ipa = VOWEL_IPA[vowel];
    const correctPool = SHORT_VOWELS_WORDS[vowel][position] || SHORT_VOWELS_WORDS[vowel].medial;
    const distractorPool = Object.entries(SHORT_VOWELS_WORDS)
        .filter(([v]) => v !== vowel)
        .flatMap(([, pos]) => Object.values(pos).flat());

    const [correct] = _sample(correctPool, 1, rng);
    const wrongs = _sample(distractorPool, 2, rng);
    const allWords = _sample([correct, ...wrongs], 3, rng);

    const options = allWords.map((w, i) => ({
        id: String.fromCharCode(97 + i),
        label: w,
        text: w,
        correct: w === correct,
    }));
    const correctOpt = options.find(o => o.correct);

    return {
        id: _qid(skillAtom.skill_id, 'mca'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-audio',
        stem: `Listen. Which word has the ${ipa} sound?`,
        audio_text: `Which word has the short ${vowel} sound?`,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" does not have the ${ipa} sound.`])
        ),
        hints: [
            `Say each word slowly. Listen for the ${ipa} sound.`,
            `The answer has the vowel "${vowel}" making the short sound.`,
        ],
        rit_difficulty: 149,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
    };
}

// ─── Mixed short-vowels generators ────────────────────────────────────────────

function _mixedShortVowelMcImage(skillAtom, rng) {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const vowel = _sample(vowels, 1, rng)[0];
    const ipa = VOWEL_IPA[vowel];
    const [correct] = _sample(SHORT_VOWELS_WORDS[vowel].medial, 1, rng);
    const distractorPool = vowels.filter(v => v !== vowel).flatMap(v => SHORT_VOWELS_WORDS[v].medial);
    const wrongs = _sample(distractorPool, 2, rng);
    const allWords = _sample([correct, ...wrongs], 3, rng);

    const options = allWords.map((w, i) => ({
        id: String.fromCharCode(97 + i),
        label: w, image: _emojiImg(w), alt: w,
        correct: w === correct,
    }));
    const correctOpt = options.find(o => o.correct);
    const stem = `Tap the picture that has the ${ipa} sound in the middle.`;

    return {
        id: _qid(skillAtom.skill_id, 'mci'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-image',
        stem,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" has a different short vowel sound.`])
        ),
        hints: [`Say each word. Which one has the ${ipa} sound in the middle?`,
                `The answer contains the vowel "${vowel}" making the short sound.`],
        rit_difficulty: 162,
        grade_level: '1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: stem,
    };
}

function _mixedShortVowelSortBins(skillAtom, rng) {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const [v1, v2] = _sample(vowels, 2, rng);
    const ipa1 = VOWEL_IPA[v1], ipa2 = VOWEL_IPA[v2];
    const v1words = _sample(SHORT_VOWELS_WORDS[v1].medial, 3, rng);
    const v2words = _sample(SHORT_VOWELS_WORDS[v2].medial, 2, rng);
    const allWords = _sample([...v1words, ...v2words], 5, rng);

    const draggables = allWords.map((w, i) => ({ id: `w${i}`, label: `${WORD_EMOJI[w] || ''} ${w}`, audio_text: w }));
    const correctAns = {};
    allWords.forEach((w, i) => { correctAns[`w${i}`] = v1words.includes(w) ? 'bin_v1' : 'bin_v2'; });

    return {
        id: _qid(skillAtom.skill_id, 'sort'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Sort each word by its vowel sound: ${ipa1} or ${ipa2}.`,
        draggables,
        zones: [
            { id: 'bin_v1', label: `${ipa1} (short ${v1})`, accepts: v1words.map((_, i) => `w${allWords.indexOf(v1words[i])}`) },
            { id: 'bin_v2', label: `${ipa2} (short ${v2})`, accepts: v2words.map((_, i) => `w${allWords.indexOf(v2words[i])}`) },
        ],
        ans: correctAns, correct_answer: correctAns,
        distractor_misconceptions: {},
        hints: [`Listen to the vowel in the middle of each word.`,
                `"${v1words[0]}" → ${ipa1}; "${v2words[0]}" → ${ipa2}.`],
        rit_difficulty: 165, grade_level: '1', has_audio: true, k2_appropriate: true,
    };
}

function _mixedShortVowelMcAudio(skillAtom, rng) {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const vowel = _sample(vowels, 1, rng)[0];
    const ipa = VOWEL_IPA[vowel];
    const [word] = _sample(SHORT_VOWELS_WORDS[vowel].medial, 1, rng);
    const wrongVowels = _sample(vowels.filter(v => v !== vowel), 2, rng);
    const allVowels = _sample([vowel, ...wrongVowels], 3, rng);

    const options = allVowels.map((v, i) => ({
        id: String.fromCharCode(97 + i),
        label: `${VOWEL_IPA[v]} (short ${v})`,
        text: VOWEL_IPA[v],
        correct: v === vowel,
    }));
    const correctOpt = options.find(o => o.correct);

    return {
        id: _qid(skillAtom.skill_id, 'mca'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-audio',
        stem: `Listen to the word "${word}". What is the vowel sound in the middle?`,
        audio_text: word,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `That vowel is not in "${word}".`])
        ),
        hints: [`Say "${word}" and listen to the vowel: ${ipa}.`,
                `The middle letter in "${word}" is "${vowel}".`],
        rit_difficulty: 163, grade_level: '1', has_audio: true, k2_appropriate: true,
    };
}

/**
 * Master dispatcher for short-vowel atoms (medial, final, in_blends, mixed).
 */
function _generateShortVowelQuestion(skillAtom, vowel, position, rng, mechanicHint) {
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    if (position === 'mixed') {
        switch (widget) {
            case 'mc-image':   return _mixedShortVowelMcImage(skillAtom, rng);
            case 'dnd-linked':
                if (mechanic === 'sort-into-bins') return _mixedShortVowelSortBins(skillAtom, rng);
                return _mixedShortVowelMcImage(skillAtom, rng);
            case 'mc-audio':   return _mixedShortVowelMcAudio(skillAtom, rng);
            case 'fib-auto':   return _shortVowelFibAuto(skillAtom, 'a', 'medial', rng);
            default:           return _mixedShortVowelMcImage(skillAtom, rng);
        }
    }

    switch (widget) {
        case 'mc-image':   return _shortVowelMcImage(skillAtom, vowel, position, rng);
        case 'fib-auto':   return _shortVowelFibAuto(skillAtom, vowel, position, rng);
        case 'dnd-linked':
            if (mechanic === 'sound-box') return _shortVowelSoundBox(skillAtom, vowel, rng);
            return _shortVowelSortBins(skillAtom, vowel, position, rng);
        case 'mc-audio':   return _shortVowelMcAudio(skillAtom, vowel, position, rng);
        default:           return _shortVowelMcImage(skillAtom, vowel, position, rng);
    }
}

// ─── Heart-word generators ────────────────────────────────────────────────────

/** Parse heart-word key from skill_id. e.g. '...heart_word_said' → 'said' */
function _parseHeartWordKey(skillId) {
    const prefix = 'reading_phonics_heart_word_';
    return skillId.startsWith(prefix) ? skillId.slice(prefix.length) : null;
}

/**
 * dnd-linked sound-box: drag phoneme chips into Elkonin boxes for the heart word.
 * The heart grapheme explanation is included so students see WHY it is irregular.
 */
function _heartWordSoundBox(skillAtom, wordKey, rng) {
    const entry = HEART_WORDS_BANK[wordKey];
    if (!entry) return _genericMcText(skillAtom);

    const phonemes = entry.sounds;
    const extras = DISTRACTOR_PHONEMES_POOL.filter(p => !phonemes.includes(p));
    const extraChips = _sample(extras, 2, rng);
    const chips = _sample([...phonemes, ...extraChips], phonemes.length + 2, rng);

    const draggables = chips.map((p, i) => ({ id: `chip${i}`, label: p, audio_text: p }));
    const correctAns = {};
    phonemes.forEach((p, boxIdx) => {
        const chipIdx = chips.indexOf(p);
        correctAns[`chip${chipIdx}`] = `box${boxIdx}`;
    });

    return {
        id: _qid(skillAtom.skill_id, 'sbox'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Drag the sound chips into the boxes for the heart word "${entry.display}".`,
        heart_word: entry.display,
        heart_explanation: entry.explanation,
        draggables,
        zones: phonemes.map((_, i) => ({
            id: `box${i}`,
            label: `Sound ${i + 1}`,
            accepts: [draggables[chips.indexOf(phonemes[i])].id],
        })),
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: Object.fromEntries(
            extraChips.map(p => {
                const idx = chips.indexOf(p);
                return [`chip${idx}`, `"${p}" is not a sound in "${entry.display}".`];
            })
        ),
        hints: [
            `Say "${entry.display}" slowly and tap each sound: ${phonemes.join(' — ')}.`,
            entry.explanation,
        ],
        rit_difficulty: 148,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: entry.display,
    };
}

/**
 * mc-image (tap-hotspot fallback): "Which is the correct spelling?"
 * 3 options — 1 correct spelling + 2 plausible misspellings.
 */
function _heartWordMcImage(skillAtom, wordKey, rng) {
    const entry = HEART_WORDS_BANK[wordKey];
    if (!entry) return _genericMcText(skillAtom);

    const misspellings = _makeHeartWordMisspellings(wordKey, rng, 2);
    const allOptions = _sample([wordKey, ...misspellings], 3, rng);

    const options = allOptions.map((spelling, i) => ({
        id: String.fromCharCode(97 + i),
        label: spelling,
        text: spelling,
        correct: spelling === wordKey,
    }));
    const correctOpt = options.find(o => o.correct);
    const stem = `Which is the correct spelling of the heart word "${entry.display}"?`;

    return {
        id: _qid(skillAtom.skill_id, 'mci'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-image',
        stem,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        heart_explanation: entry.explanation,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" is not the correct spelling. ${entry.explanation}`])
        ),
        hints: [
            `"${entry.display}" is a heart word. ${entry.explanation}`,
            `Spell it letter by letter: ${entry.display.split('').join(' - ')}.`,
        ],
        rit_difficulty: 146,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: stem,
    };
}

/**
 * fib-auto (letter-tile-spell fallback): "Spell the heart word."
 */
function _heartWordFibAuto(skillAtom, wordKey, rng) {
    const entry = HEART_WORDS_BANK[wordKey];
    if (!entry) return _genericMcText(skillAtom);

    return {
        id: _qid(skillAtom.skill_id, 'fib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        stem: `Spell the heart word: "${entry.display}" (${entry.display.length} letters)`,
        ans: [{
            acceptable_answers: [entry.display],
            case_sensitive: false,
            normalize_whitespace: true,
            label: 'Type the heart word',
        }],
        correct_answer: entry.display,
        heart_explanation: entry.explanation,
        distractor_misconceptions: {},
        hints: [
            `This is a heart word. ${entry.explanation}`,
            `Spell it: ${entry.display.split('').join(' - ')}.`,
        ],
        rit_difficulty: 148,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: `Spell the heart word: ${entry.display}`,
        partial_credit: false,
    };
}

/**
 * mc-text: "Which word is the heart word?" (1 irregular + 2 regular CVC words).
 */
function _heartWordMcText(skillAtom, wordKey, rng) {
    const entry = HEART_WORDS_BANK[wordKey];
    if (!entry) return _genericMcText(skillAtom);

    const regularWords = [...SHORT_VOWELS_WORDS.a.medial, ...SHORT_VOWELS_WORDS.e.medial];
    const wrongs = _sample(regularWords, 2, rng);
    const allOptions = _sample([wordKey, ...wrongs], 3, rng);

    const options = allOptions.map((w, i) => ({
        id: String.fromCharCode(97 + i),
        label: w, text: w,
        correct: w === wordKey,
    }));
    const correctOpt = options.find(o => o.correct);
    const stem = 'Which word is a heart word — a word with a letter that says an unexpected sound?';

    return {
        id: _qid(skillAtom.skill_id, 'mct'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        stem,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        heart_explanation: entry.explanation,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" follows regular phonics rules.`])
        ),
        hints: [`Heart words have a part that does not follow phonics rules.`,
                `"${entry.display}" is the heart word because: ${entry.explanation}`],
        rit_difficulty: 147,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: stem,
    };
}

/** Build 2 plausible misspellings of a heart word by swapping vowels. */
function _makeHeartWordMisspellings(wordKey, rng, count) {
    const entry = HEART_WORDS_BANK[wordKey];
    if (!entry) return [];
    const display = entry.display;
    const results = new Set();
    const vowelAlts = { a: ['e', 'i'], e: ['a', 'i'], i: ['e', 'a'], o: ['u', 'a'], u: ['o', 'e'] };

    for (let i = 0; i < display.length; i++) {
        const ch = display[i].toLowerCase();
        if (vowelAlts[ch]) {
            for (const alt of vowelAlts[ch]) {
                const candidate = display.slice(0, i) + alt + display.slice(i + 1);
                if (candidate !== display) results.add(candidate);
                if (results.size >= count * 3) break;
            }
        }
        if (results.size >= count * 3) break;
    }
    // Fallback: swap two adjacent letters
    if (results.size < count && display.length >= 2) {
        const idx = Math.floor(rng() * (display.length - 1));
        const swapped = display.split('');
        [swapped[idx], swapped[idx + 1]] = [swapped[idx + 1], swapped[idx]];
        const candidate = swapped.join('');
        if (candidate !== display) results.add(candidate);
    }

    const unique = [...results].filter(s => s !== display);
    return _sample(unique.length >= count ? unique : [...unique, display + 's'], count, rng);
}

/**
 * Master dispatcher for all heart-word atoms.
 */
function _generateHeartWordQuestion(skillAtom, wordKey, rng, mechanicHint) {
    if (!wordKey || !HEART_WORDS_BANK[wordKey]) return _genericMcText(skillAtom);

    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    switch (widget) {
        case 'dnd-linked': return _heartWordSoundBox(skillAtom, wordKey, rng);
        case 'mc-image':   return _heartWordMcImage(skillAtom, wordKey, rng);
        case 'fib-auto':   return _heartWordFibAuto(skillAtom, wordKey, rng);
        case 'mc-text':    return _heartWordMcText(skillAtom, wordKey, rng);
        default:           return _heartWordSoundBox(skillAtom, wordKey, rng);
    }
}

// ─── Digraph generators ───────────────────────────────────────────────────────

/**
 * Extract the digraph key ('sh','ch','th','wh') from a skill_id like
 * 'reading_phonics_digraph_sh'.
 */
function _digraphKey(skillId) {
    return skillId.replace('reading_phonics_digraph_', '');
}

/**
 * mc-image variant for digraphs:
 *   "Tap the picture that has the /ʃ/ sound." (2 correct + 1 distractor, or 1+2).
 *   3 options — correct words come from the digraph bank; distractors from non-digraph pool.
 */
function _digraphMcImage(skillAtom, digraph, rng) {
    const bank = DIGRAPH_WORDS[digraph];
    const allWords = [...bank.initial, ...bank.final];
    const [correct] = _sample(allWords, 1, rng);
    const distractors = _sample(NON_DIGRAPH_WORDS, 2, rng);

    const allThree = _sample([correct, ...distractors], 3, rng);
    const options = allThree.map((w, i) => ({
        id: String.fromCharCode(97 + i),
        label: w,
        image: _emojiImg(w),
        alt: w,
        correct: w === correct,
    }));
    const correctOpt = options.find(o => o.correct);

    return {
        id: _qid(skillAtom.skill_id, 'mci'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-image',
        stem: `Tap the picture that has the ${bank.sound_desc}.`,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" does not contain the ${digraph} digraph`])
        ),
        hints: [
            `Listen for the "${digraph}" sound in each word.`,
            `Examples with "${digraph}": ${bank.examples}.`,
        ],
        rit_difficulty: 155,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: `Tap the picture that has the ${bank.sound_desc}.`,
    };
}

/**
 * fib-auto variant for digraphs:
 *   "Spell this word: 🐟 (4 letters)" — student types the full word.
 */
function _digraphFibAuto(skillAtom, digraph, rng) {
    const bank = DIGRAPH_WORDS[digraph];
    const allWords = [...bank.initial, ...bank.final];
    const [word] = _sample(allWords, 1, rng);
    const emoji = WORD_EMOJI[word] || '';

    return {
        id: _qid(skillAtom.skill_id, 'fib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        stem: `Spell the word: ${emoji} (${word.length} letters)`,
        ans: [{
            acceptable_answers: [word],
            case_sensitive: false,
            normalize_whitespace: true,
            label: `Type the word for ${emoji}`,
        }],
        correct_answer: word,
        distractor_misconceptions: {},
        hints: [
            `Say each sound you hear: ${word.split('').join(' - ')}.`,
            `This word contains the letters "${digraph}".`,
        ],
        rit_difficulty: 157,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: `Spell the word: ${word}`,
        partial_credit: false,
    };
}

/**
 * dnd-linked sort-into-bins variant for digraphs:
 *   Drag 6 words into "Has /ʃ/" vs "No /ʃ/" bins.
 *   3 target-digraph words + 3 non-digraph distractors.
 */
function _digraphSortBins(skillAtom, digraph, rng) {
    const bank = DIGRAPH_WORDS[digraph];
    const allWords = [...bank.initial, ...bank.final];
    const hasDigraph = _sample(allWords, 3, rng);
    const noDigraph  = _sample(NON_DIGRAPH_WORDS, 3, rng);

    const mixed = _sample([...hasDigraph, ...noDigraph], 6, rng);
    const draggables = mixed.map((w, i) => ({
        id: `w${i}`,
        label: `${WORD_EMOJI[w] || ''} ${w}`,
        audio_text: w,
    }));

    const correctAns = {};
    mixed.forEach((w, i) => {
        correctAns[`w${i}`] = hasDigraph.includes(w) ? 'bin_yes' : 'bin_no';
    });

    return {
        id: _qid(skillAtom.skill_id, 'sort'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Sort each word: does it have the "${digraph}" sound (${bank.phoneme})?`,
        draggables,
        zones: [
            { id: 'bin_yes', label: `Has "${digraph}" ✓`, accepts: hasDigraph.map(w => `w${mixed.indexOf(w)}`) },
            { id: 'bin_no',  label: `No "${digraph}" ✗`,  accepts: noDigraph.map(w => `w${mixed.indexOf(w)}`)  },
        ],
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {},
        hints: [
            `Say each word aloud. Listen for the "${digraph}" sound.`,
            `Example words with "${digraph}": ${bank.examples}.`,
        ],
        rit_difficulty: 158,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
    };
}

/**
 * dnd-linked sound-box variant for digraphs:
 *   Drag phoneme chips into Elkonin boxes for a short digraph word.
 *   The digraph counts as a single phoneme chip.
 */
function _digraphSoundBox(skillAtom, digraph, rng) {
    const bank = DIGRAPH_WORDS[digraph];
    // Build phoneme decompositions for short CVC-like digraph words
    const phonemeMap = {};
    const initialWords = bank.initial.filter(w => w.length <= 5);
    const finalWords   = bank.final.filter(w => w.length <= 5);

    // Decompose initial-digraph words: [/ʃ/, vowel, final-consonant]
    for (const w of initialWords) {
        const rest = w.slice(digraph.length);  // e.g. "ip" from "ship"
        if (rest.length === 2) {
            phonemeMap[w] = [`/${digraph}/`, `/${rest[0]}/`, `/${rest[1]}/`];
        }
    }
    // Decompose final-digraph words: [initial-consonant, vowel, /ʃ/]
    for (const w of finalWords) {
        const stem = w.slice(0, w.length - digraph.length); // e.g. "fi" from "fish"
        if (stem.length === 2) {
            phonemeMap[w] = [`/${stem[0]}/`, `/${stem[1]}/`, `/${digraph}/`];
        }
    }

    const available = Object.keys(phonemeMap);
    if (available.length === 0) {
        // Fallback to fib-auto if no short words found
        return _digraphFibAuto(skillAtom, digraph, rng);
    }

    const [word] = _sample(available, 1, rng);
    const phonemes = phonemeMap[word];
    const emoji = WORD_EMOJI[word] || '';

    const distractorPool = ['/b/', '/d/', '/k/', '/m/', '/n/', '/p/', '/r/', '/s/', '/t/']
        .filter(p => !phonemes.includes(p));
    const [distractor] = _sample(distractorPool, 1, rng);
    const chips = _sample([...phonemes, distractor], phonemes.length + 1, rng);

    const draggables = chips.map((p, i) => ({ id: `chip${i}`, label: p, audio_text: p }));
    const correctAns = {};
    phonemes.forEach((p, boxIdx) => {
        const chipIdx = chips.indexOf(p);
        correctAns[`chip${chipIdx}`] = `box${boxIdx}`;
    });

    return {
        id: _qid(skillAtom.skill_id, 'sbox'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Drag the sound chips into the boxes for "${emoji} ${word}".`,
        draggables,
        zones: phonemes.map((_, i) => ({
            id: `box${i}`,
            label: `Sound ${i + 1}`,
            accepts: [draggables[chips.indexOf(phonemes[i])].id],
        })),
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {
            [`chip${chips.indexOf(distractor)}`]: 'That sound is not in this word.',
        },
        hints: [
            `Say "${word}" slowly and tap each sound.`,
            `"${word}" has ${phonemes.length} sounds: ${phonemes.join(' - ')}.`,
        ],
        rit_difficulty: 160,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: word,
    };
}

/**
 * mc-audio variant for digraphs:
 *   "Listen. Which word has the /ʃ/ sound?"
 *   3 word-label options; correct is a digraph word.
 */
function _digraphMcAudio(skillAtom, digraph, rng) {
    const bank = DIGRAPH_WORDS[digraph];
    const allWords = [...bank.initial, ...bank.final];
    const [correct] = _sample(allWords, 1, rng);
    const distractors = _sample(NON_DIGRAPH_WORDS, 2, rng);
    const allThree = _sample([correct, ...distractors], 3, rng);

    const options = allThree.map((w, i) => ({
        id: String.fromCharCode(97 + i),
        label: w,
        text: w,
        correct: w === correct,
    }));
    const correctOpt = options.find(o => o.correct);

    return {
        id: _qid(skillAtom.skill_id, 'mca'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-audio',
        stem: `Listen. Which word has the ${bank.sound_desc}?`,
        audio_text: `Which word has the ${bank.sound_desc}?`,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" does not contain the "${digraph}" digraph`])
        ),
        hints: [
            `Say each word. Listen for the "${digraph}" sound.`,
            `"${digraph}" examples: ${bank.examples}.`,
        ],
        rit_difficulty: 156,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
    };
}

/**
 * tap-hotspot variant for digraphs (text-token mode):
 *   "Tap the word in the sentence that contains the 'sh' digraph."
 *   Returns a dnd-linked fallback highlighting the digraph token.
 */
function _digraphTapHotspot(skillAtom, digraph, rng) {
    const bank = DIGRAPH_WORDS[digraph];
    const allWords = [...bank.initial, ...bank.final];
    const [targetWord] = _sample(allWords, 1, rng);

    // Simple sentence templates
    const sentenceTemplates = [
        `The ${targetWord} is here.`,
        `I see a ${targetWord}.`,
        `She has a ${targetWord}.`,
        `Look at the ${targetWord}!`,
    ];
    const sentence = sentenceTemplates[Math.floor(rng() * sentenceTemplates.length)];
    const tokens = sentence.replace(/[.!]/g, '').split(' ');

    const draggables = tokens.map((t, i) => ({
        id: `tok${i}`,
        label: t,
        audio_text: t,
    }));

    // The correct token is the one matching targetWord (case-insensitive)
    const correctIdx = tokens.findIndex(t => t.toLowerCase() === targetWord.toLowerCase());
    const correctAns = {};
    if (correctIdx >= 0) correctAns[`tok${correctIdx}`] = 'bin_target';

    return {
        id: _qid(skillAtom.skill_id, 'hot'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Tap the word that has the "${digraph}" sound: "${sentence}"`,
        draggables,
        zones: [
            { id: 'bin_target', label: `Has "${digraph}"`, accepts: correctIdx >= 0 ? [`tok${correctIdx}`] : [] },
        ],
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {},
        hints: [
            `Read each word. Which one has the letters "${digraph}"?`,
            `Look for the word "${targetWord}".`,
        ],
        rit_difficulty: 159,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: sentence,
    };
}

/**
 * Master dispatcher for all digraph atoms.
 * Handles: reading_phonics_digraph_sh / _ch / _th / _wh
 */
function _generateDigraphQuestion(skillAtom, digraph, rng, mechanicHint) {
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widgetMechanic = STAGE1_FALLBACK[mechanic] || mechanic;

    switch (widgetMechanic) {
        case 'mc-image':   return _digraphMcImage(skillAtom, digraph, rng);
        case 'fib-auto':   return _digraphFibAuto(skillAtom, digraph, rng);
        case 'dnd-linked':
            if (mechanic === 'sound-box') return _digraphSoundBox(skillAtom, digraph, rng);
            if (mechanic === 'tap-hotspot') return _digraphTapHotspot(skillAtom, digraph, rng);
            return _digraphSortBins(skillAtom, digraph, rng);
        case 'mc-audio':   return _digraphMcAudio(skillAtom, digraph, rng);
        default:           return _digraphMcImage(skillAtom, digraph, rng);
    }
}

// ─── Blend generators ─────────────────────────────────────────────────────────

/**
 * Extract the blend type key from a skill_id like
 * 'reading_phonics_blend_initial_l' → 'l_blends'
 * 'reading_phonics_blend_final'     → 'final_blends'
 */
function _blendKey(skillId) {
    if (skillId === 'reading_phonics_blend_final') return 'final_blends';
    // reading_phonics_blend_initial_l → l_blends
    const letter = skillId.replace('reading_phonics_blend_initial_', '');
    return `${letter}_blends`;
}

/**
 * mc-image variant for blends:
 *   "Tap the picture that starts with an l-blend."
 */
function _blendMcImage(skillAtom, blendKey, rng) {
    const bank = BLEND_WORDS[blendKey];
    const isFinal = blendKey === 'final_blends';
    const [correct] = _sample(bank.words, 1, rng);
    const distractors = _sample(NON_BLEND_WORDS, 2, rng);
    const allThree = _sample([correct, ...distractors], 3, rng);

    const options = allThree.map((w, i) => ({
        id: String.fromCharCode(97 + i),
        label: w,
        image: _emojiImg(w),
        alt: w,
        correct: w === correct,
    }));
    const correctOpt = options.find(o => o.correct);
    const position = isFinal ? 'ends with' : 'starts with';

    return {
        id: _qid(skillAtom.skill_id, 'mci'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-image',
        stem: `Tap the picture that ${position} a ${bank.sound_desc}.`,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" does not have a ${bank.phoneme}`])
        ),
        hints: [
            `Listen for two consonants ${isFinal ? 'at the end' : 'at the start'} of the word.`,
            `Examples: ${bank.examples}.`,
        ],
        rit_difficulty: 155,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: `Tap the picture that ${position} a ${bank.sound_desc}.`,
    };
}

/**
 * fib-auto variant for blends:
 *   "Spell this word: 🐸 (4 letters)"
 */
function _blendFibAuto(skillAtom, blendKey, rng) {
    const bank = BLEND_WORDS[blendKey];
    const [word] = _sample(bank.words, 1, rng);
    const emoji = WORD_EMOJI[word] || '';

    return {
        id: _qid(skillAtom.skill_id, 'fib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        stem: `Spell the word: ${emoji} (${word.length} letters)`,
        ans: [{
            acceptable_answers: [word],
            case_sensitive: false,
            normalize_whitespace: true,
            label: `Type the word for ${emoji}`,
        }],
        correct_answer: word,
        distractor_misconceptions: {},
        hints: [
            `Say each sound in the word: ${word.split('').join(' - ')}.`,
            `This word has a ${bank.phoneme}.`,
        ],
        rit_difficulty: 157,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: `Spell the word: ${word}`,
        partial_credit: false,
    };
}

/**
 * dnd-linked sort-into-bins variant for blends:
 *   Drag 6 words into "Has blend" vs "No blend" bins.
 *   3 blend words + 3 non-blend distractors.
 */
function _blendSortBins(skillAtom, blendKey, rng) {
    const bank = BLEND_WORDS[blendKey];
    const isFinal = blendKey === 'final_blends';
    const hasBlend = _sample(bank.words, 3, rng);
    const noBlend  = _sample(NON_BLEND_WORDS, 3, rng);
    const mixed = _sample([...hasBlend, ...noBlend], 6, rng);

    const draggables = mixed.map((w, i) => ({
        id: `w${i}`,
        label: `${WORD_EMOJI[w] || ''} ${w}`,
        audio_text: w,
    }));

    const correctAns = {};
    mixed.forEach((w, i) => {
        correctAns[`w${i}`] = hasBlend.includes(w) ? 'bin_yes' : 'bin_no';
    });

    const position = isFinal ? 'ends with' : 'starts with';
    return {
        id: _qid(skillAtom.skill_id, 'sort'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Sort each word: does it have a ${bank.phoneme}?`,
        draggables,
        zones: [
            { id: 'bin_yes', label: `Has ${bank.phoneme} ✓`, accepts: hasBlend.map(w => `w${mixed.indexOf(w)}`) },
            { id: 'bin_no',  label: `No blend ✗`,             accepts: noBlend.map(w => `w${mixed.indexOf(w)}`)  },
        ],
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {},
        hints: [
            `Say each word. Listen for two consonant sounds ${isFinal ? 'at the end' : 'at the start'}.`,
            `Examples with a ${bank.phoneme}: ${bank.examples}.`,
        ],
        rit_difficulty: 158,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
    };
}

/**
 * dnd-linked sound-box variant for blends:
 *   Drag phoneme chips into Elkonin boxes.
 *   For initial blends: [/b/, /l/, vowel, consonant] or similar.
 */
function _blendSoundBox(skillAtom, blendKey, rng) {
    const bank = BLEND_WORDS[blendKey];
    const isFinal = blendKey === 'final_blends';

    // Build simple phoneme decompositions for short blend words
    const phonemeMap = {};

    if (!isFinal) {
        // Initial blends: pick words with a known prefix
        const prefixes = bank.prefixes || [];
        for (const w of bank.words) {
            for (const pfx of prefixes) {
                if (w.startsWith(pfx) && w.length >= pfx.length + 2 && w.length <= pfx.length + 3) {
                    const rest = w.slice(pfx.length); // remaining letters
                    if (rest.length === 2) {
                        phonemeMap[w] = [`/${pfx[0]}/`, `/${pfx[1]}/`, `/${rest[0]}/`, `/${rest[1]}/`];
                    } else if (rest.length === 3) {
                        phonemeMap[w] = [`/${pfx[0]}/`, `/${pfx[1]}/`, `/${rest[0]}/`, `/${rest[1]}/`, `/${rest[2]}/`];
                    }
                    break;
                }
            }
        }
    } else {
        // Final blends: pick words with a known suffix
        const suffixes = bank.suffixes || [];
        for (const w of bank.words) {
            for (const sfx of suffixes) {
                if (w.endsWith(sfx) && w.length >= sfx.length + 2 && w.length <= sfx.length + 3) {
                    const stem = w.slice(0, w.length - sfx.length);
                    if (stem.length === 2) {
                        phonemeMap[w] = [`/${stem[0]}/`, `/${stem[1]}/`, `/${sfx[0]}/`, `/${sfx[1]}/`];
                    }
                    break;
                }
            }
        }
    }

    const available = Object.keys(phonemeMap);
    if (available.length === 0) {
        return _blendFibAuto(skillAtom, blendKey, rng);
    }

    const [word] = _sample(available, 1, rng);
    const phonemes = phonemeMap[word];
    const emoji = WORD_EMOJI[word] || '';

    const distractorPool = ['/a/', '/e/', '/i/', '/o/', '/u/', '/b/', '/d/', '/k/', '/m/', '/n/']
        .filter(p => !phonemes.includes(p));
    const [distractor] = _sample(distractorPool, 1, rng);
    const chips = _sample([...phonemes, distractor], phonemes.length + 1, rng);

    const draggables = chips.map((p, i) => ({ id: `chip${i}`, label: p, audio_text: p }));
    const correctAns = {};
    phonemes.forEach((p, boxIdx) => {
        const chipIdx = chips.indexOf(p);
        correctAns[`chip${chipIdx}`] = `box${boxIdx}`;
    });

    return {
        id: _qid(skillAtom.skill_id, 'sbox'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Drag the sound chips into the boxes for "${emoji} ${word}".`,
        draggables,
        zones: phonemes.map((_, i) => ({
            id: `box${i}`,
            label: `Sound ${i + 1}`,
            accepts: [draggables[chips.indexOf(phonemes[i])].id],
        })),
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {
            [`chip${chips.indexOf(distractor)}`]: 'That sound is not in this word.',
        },
        hints: [
            `Say "${word}" slowly and count each sound.`,
            `"${word}" has ${phonemes.length} sounds: ${phonemes.join(' - ')}.`,
        ],
        rit_difficulty: 160,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: word,
    };
}

/**
 * mc-audio variant for blends:
 *   "Listen. Which word starts with an l-blend?"
 */
function _blendMcAudio(skillAtom, blendKey, rng) {
    const bank = BLEND_WORDS[blendKey];
    const isFinal = blendKey === 'final_blends';
    const [correct] = _sample(bank.words, 1, rng);
    const distractors = _sample(NON_BLEND_WORDS, 2, rng);
    const allThree = _sample([correct, ...distractors], 3, rng);

    const options = allThree.map((w, i) => ({
        id: String.fromCharCode(97 + i),
        label: w,
        text: w,
        correct: w === correct,
    }));
    const correctOpt = options.find(o => o.correct);
    const position = isFinal ? 'ends with' : 'starts with';

    return {
        id: _qid(skillAtom.skill_id, 'mca'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-audio',
        stem: `Listen. Which word ${position} a ${bank.sound_desc}?`,
        audio_text: `Which word ${position} a ${bank.sound_desc}?`,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" does not have a ${bank.phoneme}`])
        ),
        hints: [
            `Say each word. Listen for two consonant sounds ${isFinal ? 'at the end' : 'at the beginning'}.`,
            `Examples: ${bank.examples}.`,
        ],
        rit_difficulty: 156,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
    };
}

/**
 * Master dispatcher for all blend atoms.
 * Handles: reading_phonics_blend_initial_l / _r / _s / and blend_final
 */
function _generateBlendQuestion(skillAtom, blendKey, rng, mechanicHint) {
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widgetMechanic = STAGE1_FALLBACK[mechanic] || mechanic;

    switch (widgetMechanic) {
        case 'mc-image':   return _blendMcImage(skillAtom, blendKey, rng);
        case 'fib-auto':   return _blendFibAuto(skillAtom, blendKey, rng);
        case 'dnd-linked':
            if (mechanic === 'sound-box') return _blendSoundBox(skillAtom, blendKey, rng);
            return _blendSortBins(skillAtom, blendKey, rng);
        case 'mc-audio':   return _blendMcAudio(skillAtom, blendKey, rng);
        default:           return _blendMcImage(skillAtom, blendKey, rng);
    }
}

// ─── VCe (silent-e) generators ───────────────────────────────────────────────

// Long-vowel IPA symbols for VCe / vowel-team patterns
const LONG_VOWEL_IPA = { a: '/eɪ/', i: '/aɪ/', o: '/oʊ/', e: '/iː/', u: '/juː/' };

// Vowel-team metadata: sound description, IPA symbol, example words
const VOWEL_TEAM_META = {
    ai_ay:    { ipa: '/eɪ/',  desc: 'long a (ai/ay)',   example: 'rain, play'  },
    ee_ea:    { ipa: '/iː/',  desc: 'long e (ee/ea)',   example: 'tree, read'  },
    oa_ow:    { ipa: '/oʊ/',  desc: 'long o (oa/ow)',   example: 'boat, snow'  },
    ie:       { ipa: '/aɪ/',  desc: 'long i (ie)',       example: 'pie, tie'    },
    ue_ew:    { ipa: '/juː/', desc: 'long u (ue/ew)',   example: 'blue, new'   },
    igh:      { ipa: '/aɪ/',  desc: 'long i (igh)',      example: 'light, night'},
    oo_long:  { ipa: '/uː/',  desc: 'long oo',          example: 'boot, moon'  },
    oo_short: { ipa: '/ʊ/',   desc: 'short oo',         example: 'book, look'  },
};

/** Flatten a vowel-team word bank (may be a nested {sub: [...]} object or plain array). */
function _flattenTeamWords(bank) {
    if (Array.isArray(bank)) return bank;
    return Object.values(bank).flat();
}

/**
 * Parse the VCe vowel letter from a skill_id like 'reading_phonics_long_a_vce' → 'a'.
 */
function _vceVowel(skillId) {
    const m = skillId.match(/reading_phonics_long_([aeiou])_vce/);
    return m ? m[1] : null;
}

/**
 * Parse the vowel-team key from a skill_id like 'reading_phonics_vowel_team_ai_ay' → 'ai_ay'.
 */
function _vowelTeamKey(skillId) {
    return skillId.replace('reading_phonics_vowel_team_', '');
}

// ─── VCe mechanic variants ───────────────────────────────────────────────────

/**
 * mc-image: "Tap the picture whose name has the long /eɪ/ sound (VCe pattern)."
 * Correct: VCe word; distractors: CVC short-vowel words.
 */
function _vceMcImage(skillAtom, vowel, rng) {
    const ipa = LONG_VOWEL_IPA[vowel];
    const wordPool = VCE_WORDS[vowel];
    const [correct] = _sample(wordPool, 1, rng);
    const distractors = _sample(CVC_SHORT_DISTRACTOR_WORDS.filter(w => w !== correct), 2, rng);
    const allThree = _sample([correct, ...distractors], 3, rng);

    const options = allThree.map((w, i) => ({
        id: String.fromCharCode(97 + i),
        label: w,
        image: _emojiImg(w),
        alt: w,
        correct: w === correct,
    }));
    const correctOpt = options.find(o => o.correct);
    const stem = `Tap the picture whose name has the long ${ipa} sound.`;

    return {
        id: _qid(skillAtom.skill_id, 'mci'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-image',
        stem,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" has a short vowel sound, not a long ${ipa}.`])
        ),
        hints: [
            `Look for a word that has a silent "e" at the end (VCe pattern).`,
            `The long ${ipa} sound says its letter name, like in "${wordPool[0]}".`,
        ],
        rit_difficulty: 168,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: false,
        audio_text: stem,
    };
}

/**
 * fib-auto: "Spell the word: 🎂 (4 letters)"
 */
function _vceFibAuto(skillAtom, vowel, rng) {
    const ipa = LONG_VOWEL_IPA[vowel];
    const [word] = _sample(VCE_WORDS[vowel], 1, rng);
    const emoji = WORD_EMOJI[word] || '?';

    return {
        id: _qid(skillAtom.skill_id, 'fib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        stem: `Spell the word: ${emoji} (${word.length} letters)`,
        ans: [{
            acceptable_answers: [word.toLowerCase()],
            case_sensitive: false,
            normalize_whitespace: true,
            label: `Type the word for ${emoji}`,
        }],
        correct_answer: word.toLowerCase(),
        distractor_misconceptions: {},
        hints: [
            `Remember the VCe rule: the silent "e" at the end makes the vowel say its name.`,
            `The vowel in "${word}" is "${vowel}" — it says the long ${ipa} sound.`,
        ],
        rit_difficulty: 170,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: false,
        audio_text: `Spell the word: ${word}`,
        partial_credit: false,
    };
}

/**
 * dnd-linked sort-into-bins: sort VCe words vs CVC words.
 * 3 VCe words (long vowel) vs 3 CVC words (short vowel).
 */
function _vceSortBins(skillAtom, vowel, rng) {
    const ipa = LONG_VOWEL_IPA[vowel];
    const vceWords = _sample(VCE_WORDS[vowel], 3, rng);
    const cvcWords = _sample(CVC_SHORT_DISTRACTOR_WORDS, 3, rng);
    const mixed = _sample([...vceWords, ...cvcWords], 6, rng);

    const draggables = mixed.map((w, i) => ({
        id: `w${i}`,
        label: `${WORD_EMOJI[w] || ''} ${w}`,
        audio_text: w,
    }));
    const correctAns = {};
    mixed.forEach((w, i) => {
        correctAns[`w${i}`] = vceWords.includes(w) ? 'bin_long' : 'bin_short';
    });

    return {
        id: _qid(skillAtom.skill_id, 'sort'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Sort each word: does the vowel say the long ${ipa} sound (VCe) or a short sound (CVC)?`,
        draggables,
        zones: [
            { id: 'bin_long',  label: `Long ${ipa} — VCe ✓`, accepts: vceWords.map(w => `w${mixed.indexOf(w)}`) },
            { id: 'bin_short', label: `Short vowel — CVC ✗`,  accepts: cvcWords.map(w => `w${mixed.indexOf(w)}`) },
        ],
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {},
        hints: [
            `VCe words end in a silent "e". The "e" makes the vowel say its name.`,
            `Example VCe: "${vceWords[0]}" — the vowel says ${ipa}.`,
        ],
        rit_difficulty: 172,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: false,
    };
}

/**
 * mc-text: "Which word has the long /eɪ/ sound?"
 * 1 VCe word (correct) + 2 CVC distractors.
 */
function _vceMcText(skillAtom, vowel, rng) {
    const ipa = LONG_VOWEL_IPA[vowel];
    const [correct] = _sample(VCE_WORDS[vowel], 1, rng);
    const wrongs = _sample(CVC_SHORT_DISTRACTOR_WORDS.filter(w => w !== correct), 2, rng);
    const allThree = _sample([correct, ...wrongs], 3, rng);

    const options = allThree.map((w, i) => ({
        id: String.fromCharCode(97 + i),
        label: w,
        text: w,
        correct: w === correct,
    }));
    const correctOpt = options.find(o => o.correct);
    const stem = `Which word has the long ${ipa} sound?`;

    return {
        id: _qid(skillAtom.skill_id, 'mct'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        stem,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" has a short vowel — there is no silent "e".`])
        ),
        hints: [
            `Look for a word that ends in a silent "e" (VCe pattern).`,
            `The silent "e" makes the vowel before the consonant say its name: ${ipa}.`,
        ],
        rit_difficulty: 169,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: false,
        audio_text: stem,
    };
}

/**
 * Master dispatcher for all VCe atoms (long_a/i/o/e/u_vce).
 */
function _generateVceQuestion(skillAtom, vowel, rng, mechanicHint) {
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    switch (widget) {
        case 'mc-image':   return _vceMcImage(skillAtom, vowel, rng);
        case 'fib-auto':   return _vceFibAuto(skillAtom, vowel, rng);
        case 'dnd-linked': return _vceSortBins(skillAtom, vowel, rng);
        case 'mc-text':    return _vceMcText(skillAtom, vowel, rng);
        default:           return _vceMcImage(skillAtom, vowel, rng);
    }
}

// ─── Mixed long-vowels (VCe) generators ──────────────────────────────────────

function _mixedLongVowelMcImage(skillAtom, rng) {
    const vowels = ['a', 'i', 'o', 'e', 'u'];
    const vowel = _sample(vowels, 1, rng)[0];
    return _vceMcImage(skillAtom, vowel, rng);
}

function _mixedLongVowelSortBins(skillAtom, rng) {
    // Pick 2 different vowels and sort words from each
    const vowels = ['a', 'i', 'o', 'u'];
    const [v1, v2] = _sample(vowels, 2, rng);
    const ipa1 = LONG_VOWEL_IPA[v1], ipa2 = LONG_VOWEL_IPA[v2];
    const v1words = _sample(VCE_WORDS[v1], 3, rng);
    const v2words = _sample(VCE_WORDS[v2], 2, rng);
    const allWords = _sample([...v1words, ...v2words], 5, rng);

    const draggables = allWords.map((w, i) => ({
        id: `w${i}`,
        label: `${WORD_EMOJI[w] || ''} ${w}`,
        audio_text: w,
    }));
    const correctAns = {};
    allWords.forEach((w, i) => {
        correctAns[`w${i}`] = v1words.includes(w) ? 'bin_v1' : 'bin_v2';
    });

    return {
        id: _qid(skillAtom.skill_id, 'sort'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Sort each VCe word by its long vowel sound: ${ipa1} or ${ipa2}.`,
        draggables,
        zones: [
            { id: 'bin_v1', label: `${ipa1} (long ${v1})`, accepts: v1words.map(w => `w${allWords.indexOf(w)}`) },
            { id: 'bin_v2', label: `${ipa2} (long ${v2})`, accepts: v2words.map(w => `w${allWords.indexOf(w)}`) },
        ],
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {},
        hints: [
            `VCe words: the silent "e" makes the vowel say its name.`,
            `"${v1words[0]}" → long ${ipa1}; "${v2words[0]}" → long ${ipa2}.`,
        ],
        rit_difficulty: 178,
        grade_level: skillAtom.developmental_band || '2',
        has_audio: true,
        k2_appropriate: false,
    };
}

function _mixedLongVowelMcText(skillAtom, rng) {
    const vowels = ['a', 'i', 'o', 'u'];
    const vowel = _sample(vowels, 1, rng)[0];
    return _vceMcText(skillAtom, vowel, rng);
}

// ─── Vowel-team generators ────────────────────────────────────────────────────

/**
 * mc-image: "Tap the picture whose name has the long /eɪ/ sound (ai/ay)."
 * Correct: vowel-team word; distractors: CVC short-vowel words.
 */
function _vowelTeamMcImage(skillAtom, teamKey, rng) {
    const meta = VOWEL_TEAM_META[teamKey];
    const wordPool = _flattenTeamWords(VOWEL_TEAM_WORDS[teamKey]);
    const [correct] = _sample(wordPool, 1, rng);
    const distractors = _sample(CVC_SHORT_DISTRACTOR_WORDS.filter(w => w !== correct), 2, rng);
    const allThree = _sample([correct, ...distractors], 3, rng);

    const options = allThree.map((w, i) => ({
        id: String.fromCharCode(97 + i),
        label: w,
        image: _emojiImg(w),
        alt: w,
        correct: w === correct,
    }));
    const correctOpt = options.find(o => o.correct);
    const stem = `Tap the picture whose name has the ${meta.desc} sound (${meta.ipa}).`;

    return {
        id: _qid(skillAtom.skill_id, 'mci'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-image',
        stem,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" does not have the ${meta.ipa} vowel team sound.`])
        ),
        hints: [
            `Listen for the ${meta.ipa} sound. Examples: ${meta.example}.`,
            `The answer contains the vowel team that makes the ${meta.ipa} sound.`,
        ],
        rit_difficulty: 172,
        grade_level: skillAtom.developmental_band || '2',
        has_audio: true,
        k2_appropriate: false,
        audio_text: stem,
    };
}

/**
 * fib-auto: "Spell the word: ⛵ (4 letters)"
 */
function _vowelTeamFibAuto(skillAtom, teamKey, rng) {
    const meta = VOWEL_TEAM_META[teamKey];
    const wordPool = _flattenTeamWords(VOWEL_TEAM_WORDS[teamKey]);
    const [word] = _sample(wordPool, 1, rng);
    const emoji = WORD_EMOJI[word] || '?';

    return {
        id: _qid(skillAtom.skill_id, 'fib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        stem: `Spell the word: ${emoji} (${word.length} letters)`,
        ans: [{
            acceptable_answers: [word.toLowerCase()],
            case_sensitive: false,
            normalize_whitespace: true,
            label: `Type the word for ${emoji}`,
        }],
        correct_answer: word.toLowerCase(),
        distractor_misconceptions: {},
        hints: [
            `The ${meta.ipa} sound in this word is spelled with a vowel team.`,
            `Example: "${meta.example.split(',')[0].trim()}".`,
        ],
        rit_difficulty: 174,
        grade_level: skillAtom.developmental_band || '2',
        has_audio: true,
        k2_appropriate: false,
        audio_text: `Spell the word: ${word}`,
        partial_credit: false,
    };
}

/**
 * dnd-linked sort-into-bins:
 * For paired teams (ai_ay, ee_ea, oa_ow, ue_ew): sort words into their sub-team bins.
 * For single teams (ie, igh, oo_long, oo_short): sort team words vs CVC distractors.
 */
function _vowelTeamSortBins(skillAtom, teamKey, rng) {
    const meta = VOWEL_TEAM_META[teamKey];
    const bank = VOWEL_TEAM_WORDS[teamKey];
    const isPaired = !Array.isArray(bank);

    if (isPaired) {
        // Sort words by their sub-pattern (e.g., ai vs ay)
        const subKeys = Object.keys(bank);
        const [sk1, sk2] = subKeys;
        const words1 = _sample(bank[sk1], 3, rng);
        const words2 = _sample(bank[sk2], 2, rng);
        const mixed = _sample([...words1, ...words2], 5, rng);

        const draggables = mixed.map((w, i) => ({
            id: `w${i}`,
            label: `${WORD_EMOJI[w] || ''} ${w}`,
            audio_text: w,
        }));
        const correctAns = {};
        mixed.forEach((w, i) => {
            correctAns[`w${i}`] = words1.includes(w) ? 'bin_sub1' : 'bin_sub2';
        });

        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'dnd-linked',
            stem: `Sort each word: does it use "${sk1}" or "${sk2}" to spell the ${meta.ipa} sound?`,
            draggables,
            zones: [
                { id: 'bin_sub1', label: `"${sk1}" words`, accepts: words1.map(w => `w${mixed.indexOf(w)}`) },
                { id: 'bin_sub2', label: `"${sk2}" words`, accepts: words2.map(w => `w${mixed.indexOf(w)}`) },
            ],
            ans: correctAns,
            correct_answer: correctAns,
            distractor_misconceptions: {},
            hints: [
                `Both "${sk1}" and "${sk2}" make the ${meta.ipa} sound, but they are spelled differently.`,
                `Example "${sk1}": "${bank[sk1][0]}". Example "${sk2}": "${bank[sk2][0]}".`,
            ],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '2',
            has_audio: true,
            k2_appropriate: false,
        };
    } else {
        // Single team: sort team words vs CVC distractors
        const teamWords = _sample(bank, 3, rng);
        const cvcWords = _sample(CVC_SHORT_DISTRACTOR_WORDS, 3, rng);
        const mixed = _sample([...teamWords, ...cvcWords], 6, rng);

        const draggables = mixed.map((w, i) => ({
            id: `w${i}`,
            label: `${WORD_EMOJI[w] || ''} ${w}`,
            audio_text: w,
        }));
        const correctAns = {};
        mixed.forEach((w, i) => {
            correctAns[`w${i}`] = teamWords.includes(w) ? 'bin_yes' : 'bin_no';
        });

        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'dnd-linked',
            stem: `Sort each word: does it have the ${meta.desc} sound (${meta.ipa})?`,
            draggables,
            zones: [
                { id: 'bin_yes', label: `Has ${meta.ipa} ✓`, accepts: teamWords.map(w => `w${mixed.indexOf(w)}`) },
                { id: 'bin_no',  label: `Short vowel ✗`,      accepts: cvcWords.map(w => `w${mixed.indexOf(w)}`) },
            ],
            ans: correctAns,
            correct_answer: correctAns,
            distractor_misconceptions: {},
            hints: [
                `Listen for the ${meta.ipa} sound. Examples: ${meta.example}.`,
                `Short vowel words like "${cvcWords[0]}" have a different sound.`,
            ],
            rit_difficulty: 173,
            grade_level: skillAtom.developmental_band || '2',
            has_audio: true,
            k2_appropriate: false,
        };
    }
}

/**
 * mc-text: "Which word has the long /eɪ/ sound (ai/ay vowel team)?"
 * 1 correct vowel-team word + 2 CVC distractors.
 */
function _vowelTeamMcText(skillAtom, teamKey, rng) {
    const meta = VOWEL_TEAM_META[teamKey];
    const wordPool = _flattenTeamWords(VOWEL_TEAM_WORDS[teamKey]);
    const [correct] = _sample(wordPool, 1, rng);
    const wrongs = _sample(CVC_SHORT_DISTRACTOR_WORDS.filter(w => w !== correct), 2, rng);
    const allThree = _sample([correct, ...wrongs], 3, rng);

    const options = allThree.map((w, i) => ({
        id: String.fromCharCode(97 + i),
        label: w,
        text: w,
        correct: w === correct,
    }));
    const correctOpt = options.find(o => o.correct);
    const stem = `Which word has the ${meta.desc} sound (${meta.ipa})?`;

    return {
        id: _qid(skillAtom.skill_id, 'mct'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        stem,
        options,
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: Object.fromEntries(
            options.filter(o => !o.correct).map(o => [o.id, `"${o.label}" does not have the ${meta.ipa} vowel team sound.`])
        ),
        hints: [
            `Look for a word with the vowel team that spells ${meta.ipa}.`,
            `Examples: ${meta.example}.`,
        ],
        rit_difficulty: 171,
        grade_level: skillAtom.developmental_band || '2',
        has_audio: true,
        k2_appropriate: false,
        audio_text: stem,
    };
}

/**
 * Master dispatcher for all vowel-team atoms.
 */
function _generateVowelTeamQuestion(skillAtom, teamKey, rng, mechanicHint) {
    if (!VOWEL_TEAM_WORDS[teamKey]) return _genericMcText(skillAtom);

    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    switch (widget) {
        case 'mc-image':   return _vowelTeamMcImage(skillAtom, teamKey, rng);
        case 'fib-auto':   return _vowelTeamFibAuto(skillAtom, teamKey, rng);
        case 'dnd-linked': return _vowelTeamSortBins(skillAtom, teamKey, rng);
        case 'mc-text':    return _vowelTeamMcText(skillAtom, teamKey, rng);
        default:           return _vowelTeamMcImage(skillAtom, teamKey, rng);
    }
}

// ─── Multisyllabic word banks ─────────────────────────────────────────────────

const COMPOUND_WORD_BANK = [
    { compound: 'sunshine',  parts: ['sun', 'shine'],   emoji: '☀️' },
    { compound: 'backpack',  parts: ['back', 'pack'],   emoji: '🎒' },
    { compound: 'football',  parts: ['foot', 'ball'],   emoji: '🏈' },
    { compound: 'rainbow',   parts: ['rain', 'bow'],    emoji: '🌈' },
    { compound: 'butterfly', parts: ['butter', 'fly'],  emoji: '🦋' },
    { compound: 'homework',  parts: ['home', 'work'],   emoji: '📝' },
    { compound: 'cupcake',   parts: ['cup', 'cake'],    emoji: '🧁' },
    { compound: 'popcorn',   parts: ['pop', 'corn'],    emoji: '🍿' },
    { compound: 'snowman',   parts: ['snow', 'man'],    emoji: '⛄' },
    { compound: 'firefly',   parts: ['fire', 'fly'],    emoji: '🌟' },
    { compound: 'cowboy',    parts: ['cow', 'boy'],     emoji: '🤠' },
    { compound: 'starfish',  parts: ['star', 'fish'],   emoji: '⭐' },
];

// One-syllable filler words for the syllable-count sort
const ONE_SYLLABLE_WORDS = ['cat', 'dog', 'sun', 'hat', 'run', 'fish', 'bird', 'jump', 'play', 'boat'];

const TWO_SYLLABLE_WORDS = ['rabbit', 'tiger', 'baby', 'music', 'student', 'silent', 'final', 'open', 'table', 'little', 'purple', 'simple'];

// ─── Compound-word mechanic variants ────────────────────────────────────────

/**
 * mc-image: "Tap the picture for the compound word."
 * 3 emoji options — 1 correct compound + 2 distractor compounds.
 */
function _compoundMcImage(skillAtom, rng) {
    const items = _sample(COMPOUND_WORD_BANK, 3, rng);
    const correct = items[0];
    const options = items.map((it, i) => ({
        id: String.fromCharCode(97 + i),
        label: it.compound,
        image: _emojiImg(it.compound) || it.emoji,
        alt: it.compound,
        correct: it === correct,
    }));
    const shuffled = _sample(options, options.length, rng);
    const correctOpt = shuffled.find(o => o.correct);
    return {
        id: _qid(skillAtom.skill_id, 'mci'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-image',
        stem: 'Tap the picture for the compound word.',
        options: shuffled,
        ans: correctOpt.id,
        correct_answer: correctOpt.id,
        hints: [
            'A compound word is made of two smaller words joined together.',
            `Look for "${correct.parts[0]}" + "${correct.parts[1]}" = "${correct.compound}".`,
        ],
        rit_difficulty: parseInt((skillAtom.rit_band || '161-170').split('-')[0], 10) || 161,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: true,
        audio_text: 'Tap the picture for the compound word.',
    };
}

/**
 * fib-auto: "Combine these two words: [emoji] + [emoji] = ?"
 * Student types the compound word.
 */
function _compoundFibAuto(skillAtom, rng) {
    const [entry] = _sample(COMPOUND_WORD_BANK, 1, rng);
    const part1Emoji = WORD_EMOJI[entry.parts[0]] || entry.parts[0];
    const part2Emoji = WORD_EMOJI[entry.parts[1]] || entry.parts[1];
    return {
        id: _qid(skillAtom.skill_id, 'fib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        stem: `Combine these two words: ${part1Emoji} "${entry.parts[0]}" + ${part2Emoji} "${entry.parts[1]}" = ?`,
        blank_count: 1,
        accept_list: [entry.compound],
        ans: entry.compound,
        hints: [
            'Write both words together with no space.',
            `"${entry.parts[0]}" + "${entry.parts[1]}" = "${entry.compound}".`,
        ],
        rit_difficulty: parseInt((skillAtom.rit_band || '161-170').split('-')[0], 10) || 161,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: true,
        audio_text: `What compound word do you get when you put "${entry.parts[0]}" and "${entry.parts[1]}" together?`,
    };
}

/**
 * sentence-build (dnd-linked): drag two word tiles into order to form the compound.
 */
function _compoundSentenceBuild(skillAtom, rng) {
    const [entry] = _sample(COMPOUND_WORD_BANK, 1, rng);
    const shuffled = _sample(entry.parts, entry.parts.length, rng);
    const draggables = shuffled.map((p, i) => ({ id: 't' + i, label: p }));
    const zones = entry.parts.map((p, i) => ({ id: 'z' + i, label: `Part ${i + 1}`, accepts: [draggables.find(d => d.label === p).id] }));
    const ans = {};
    draggables.forEach(d => {
        const zi = entry.parts.indexOf(d.label);
        ans[d.id] = 'z' + zi;
    });
    return {
        id: _qid(skillAtom.skill_id, 'sb'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Drag the word tiles into order to build the compound word "${entry.compound}".`,
        draggables,
        zones,
        ans,
        hints: [
            `"${entry.compound}" is made of "${entry.parts[0]}" + "${entry.parts[1]}".`,
        ],
        rit_difficulty: parseInt((skillAtom.rit_band || '161-170').split('-')[0], 10) || 161,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: true,
    };
}

/**
 * match-pairs (mc-text): "What two words make up 'rainbow'?"
 * Options are the correct pair vs three wrong pairs.
 */
function _compoundMatchPairs(skillAtom, rng) {
    const items = _sample(COMPOUND_WORD_BANK, 4, rng);
    const correct = items[0];
    const opts = _sample([
        { id: 'a', label: `${correct.parts[0]} + ${correct.parts[1]}`, correct: true },
        { id: 'b', label: `${items[1].parts[0]} + ${items[1].parts[1]}`, correct: false },
        { id: 'c', label: `${items[2].parts[0]} + ${items[2].parts[1]}`, correct: false },
        { id: 'd', label: `${items[3].parts[0]} + ${items[3].parts[1]}`, correct: false },
    ], 4, rng);
    const correctOpt = opts.find(o => o.correct);
    return {
        id: _qid(skillAtom.skill_id, 'mp'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        stem: `What two words make up the compound word "${correct.compound}"?`,
        options: opts,
        ans: correctOpt.id,
        correct_answer: correctOpt.id,
        hints: [
            'Split the compound into two smaller words that each mean something.',
            `"${correct.compound}" = "${correct.parts[0]}" + "${correct.parts[1]}".`,
        ],
        rit_difficulty: parseInt((skillAtom.rit_band || '161-170').split('-')[0], 10) || 161,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: true,
    };
}

function _generateCompoundQuestion(skillAtom, rng, mechanicHint) {
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;
    switch (widget) {
        case 'mc-image':   return _compoundMcImage(skillAtom, rng);
        case 'fib-auto':   return _compoundFibAuto(skillAtom, rng);
        case 'dnd-linked': return _compoundSentenceBuild(skillAtom, rng);
        case 'mc-text':    return _compoundMatchPairs(skillAtom, rng);
        default:           return _compoundMcImage(skillAtom, rng);
    }
}

// ─── 2-syllable-word mechanic variants ──────────────────────────────────────

/**
 * mc-text: "How many syllables does 'rabbit' have?"  1 / 2 / 3 / 4
 */
function _2syllableMcText(skillAtom, rng) {
    const word = _sample(TWO_SYLLABLE_WORDS, 1, rng)[0];
    const opts = _sample([
        { id: 'a', label: '1', correct: false },
        { id: 'b', label: '2', correct: true  },
        { id: 'c', label: '3', correct: false },
        { id: 'd', label: '4', correct: false },
    ], 4, rng);
    const correctOpt = opts.find(o => o.correct);
    return {
        id: _qid(skillAtom.skill_id, 'mct'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        stem: `How many syllables does "${word}" have?`,
        options: opts,
        ans: correctOpt.id,
        correct_answer: correctOpt.id,
        hints: [
            'Clap as you say the word — each clap is one syllable.',
            `"${word}" has 2 syllables.`,
        ],
        rit_difficulty: parseInt((skillAtom.rit_band || '181-190').split('-')[0], 10) || 181,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: false,
        audio_text: `How many syllables does "${word}" have?`,
    };
}

/**
 * fib-auto: "Type the word: [word]" — decoding from audio prompt.
 */
function _2syllableFibAuto(skillAtom, rng) {
    const word = _sample(TWO_SYLLABLE_WORDS, 1, rng)[0];
    return {
        id: _qid(skillAtom.skill_id, 'fib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        stem: `Listen and type the word you hear.`,
        blank_count: 1,
        accept_list: [word],
        ans: word,
        hints: [
            'Say each syllable slowly, then write the whole word.',
            `The word has 2 syllables: try "${word}".`,
        ],
        rit_difficulty: parseInt((skillAtom.rit_band || '181-190').split('-')[0], 10) || 181,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: false,
        audio_text: word,
    };
}

/**
 * sort-into-bins (dnd-linked): sort 6 words into "1 syllable" vs "2 syllables".
 */
function _2syllableSortBins(skillAtom, rng) {
    const twoSyl  = _sample(TWO_SYLLABLE_WORDS, 3, rng);
    const oneSyl  = _sample(ONE_SYLLABLE_WORDS, 3, rng);
    const items = [
        ...twoSyl.map((w, i) => ({ id: 't' + i,       label: w, correct_bin: '2syl' })),
        ...oneSyl.map((w, i) => ({ id: 'o' + i,       label: w, correct_bin: '1syl' })),
    ];
    const shuffledItems = _sample(items, items.length, rng);
    const ans = {};
    shuffledItems.forEach(it => { ans[it.id] = it.correct_bin; });
    return {
        id: _qid(skillAtom.skill_id, 'sib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: 'Sort each word into the correct bin.',
        draggables: shuffledItems.map(it => ({ id: it.id, label: it.label })),
        zones: [
            { id: '1syl', label: '1 syllable',  accepts: oneSyl.map((_, i)  => 'o' + i) },
            { id: '2syl', label: '2 syllables', accepts: twoSyl.map((_, i)  => 't' + i) },
        ],
        ans,
        hints: [
            'Clap as you say each word to count the syllables.',
            'Words like "cat" and "dog" have 1 clap; words like "rabbit" have 2 claps.',
        ],
        rit_difficulty: parseInt((skillAtom.rit_band || '181-190').split('-')[0], 10) || 181,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: false,
    };
}

/**
 * tap-hotspot (mc-text fallback): "Where do you divide 'rabbit'?"
 * Options show different division points.
 */
function _2syllableTapHotspot(skillAtom, rng) {
    // Simple fixed divisions for our word bank
    const DIVISIONS = {
        rabbit:  { splits: ['rab·bit', 'ra·bbit', 'rabb·it'], correct: 'rab·bit' },
        tiger:   { splits: ['ti·ger',  't·iger',  'tig·er'],   correct: 'ti·ger'  },
        baby:    { splits: ['ba·by',   'bab·y',   'b·aby'],    correct: 'ba·by'   },
        music:   { splits: ['mu·sic',  'm·usic',  'mus·ic'],   correct: 'mu·sic'  },
        student: { splits: ['stu·dent','s·tudent','stud·ent'],  correct: 'stu·dent'},
        silent:  { splits: ['si·lent', 's·ilent', 'sil·ent'],  correct: 'si·lent' },
        final:   { splits: ['fi·nal',  'f·inal',  'fin·al'],   correct: 'fi·nal'  },
        open:    { splits: ['o·pen',   'op·en',   'ope·n'],    correct: 'o·pen'   },
        table:   { splits: ['ta·ble',  't·able',  'tab·le'],   correct: 'ta·ble'  },
        little:  { splits: ['lit·tle', 'l·ittle', 'litt·le'],  correct: 'lit·tle' },
        purple:  { splits: ['pur·ple', 'p·urple', 'purp·le'],  correct: 'pur·ple' },
        simple:  { splits: ['sim·ple', 's·imple', 'simp·le'],  correct: 'sim·ple' },
    };
    const word = _sample(Object.keys(DIVISIONS), 1, rng)[0];
    const data = DIVISIONS[word];
    const shuffled = _sample(data.splits, data.splits.length, rng);
    const opts = shuffled.map((s, i) => ({
        id: String.fromCharCode(97 + i),
        label: s,
        correct: s === data.correct,
    }));
    const correctOpt = opts.find(o => o.correct);
    return {
        id: _qid(skillAtom.skill_id, 'th'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        stem: `Where do you divide the word "${word}"? Choose the correct syllable split.`,
        options: opts,
        ans: correctOpt.id,
        correct_answer: correctOpt.id,
        hints: [
            'Find the vowel in each syllable — each syllable has exactly one vowel sound.',
            `"${word}" divides as "${data.correct}".`,
        ],
        rit_difficulty: parseInt((skillAtom.rit_band || '181-190').split('-')[0], 10) || 181,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: false,
        audio_text: `How do you divide the word "${word}" into syllables?`,
    };
}

function _generate2SyllableQuestion(skillAtom, rng, mechanicHint) {
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;
    switch (widget) {
        case 'mc-text':    return _2syllableMcText(skillAtom, rng);
        case 'fib-auto':   return _2syllableFibAuto(skillAtom, rng);
        case 'dnd-linked': return _2syllableSortBins(skillAtom, rng);
        case 'mc-image':   return _2syllableTapHotspot(skillAtom, rng);
        default:           return _2syllableMcText(skillAtom, rng);
    }
}

// ─── Generic fallback (Phase 2 expansion) ────────────────────────────────────

/**
 * Coming-soon sentinel for phonics atoms not yet fully implemented.
 * Returns a Question with question_type '__coming_soon__' so the renderer
 * can intercept it and show the graceful Coming Soon card instead of
 * a broken placeholder.
 */
function _genericMcText(skillAtom) {
    return {
        id: _qid(skillAtom.skill_id, 'comingsoon'),
        skill_ids: [skillAtom.skill_id],
        question_type: '__coming_soon__',   // sentinel — dispatcher handles
        skill_atom: skillAtom,
        rit_difficulty: 150,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: false,
        k2_appropriate: true,
    };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a single Literacy Quest Question for a phonics SkillAtom.
 *
 * @param {import('../../../../data/literacy-skills/reading/phonics.js').default[number]} skillAtom
 *   The SkillAtom from data/literacy-skills/reading/phonics.js.
 * @param {string|null} [mechanicHint]
 *   Optional mechanic ID from skillAtom.question_types. If omitted, one is
 *   chosen at random.  Stage 1 fallbacks are applied automatically.
 * @param {{ rng?: () => number, ellMode?: boolean, spedMode?: boolean }} [options]
 * @returns {import('../../../../docs/literacy-quest/DATA_MODEL').Question}
 */
export function generatePhonicsQuestion(skillAtom, mechanicHint = null, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    const skillId = skillAtom.skill_id;

    // Choose a mechanic from the atom's list (or use the hint if valid)
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);

    // Apply Stage 1 widget-fallback map
    const widgetMechanic = STAGE1_FALLBACK[mechanic] || mechanic;

    if (skillId === 'reading_phonics_short_a_initial') {
        switch (widgetMechanic) {
            case 'mc-image':  return _shortAInitialMcImage(skillAtom, rng);
            case 'fib-auto':  return _shortAInitialFibAuto(skillAtom, rng);
            case 'dnd-linked':
                // Distinguish sort-bins vs sound-box based on original mechanic
                if (mechanic === 'sound-box') return _shortAInitialSoundBox(skillAtom, rng);
                return _shortAInitialSortBins(skillAtom, rng);
            case 'mc-audio':  return _shortAInitialMcAudio(skillAtom, rng);
            default:          return _shortAInitialMcImage(skillAtom, rng);
        }
    }

    // ── Short vowels mixed ─────────────────────────────────────────────────────
    if (skillId === 'reading_phonics_short_vowels_mixed') {
        return _generateShortVowelQuestion(skillAtom, null, 'mixed', rng, mechanicHint);
    }

    // ── Short-vowel medial / final / in_blends ─────────────────────────────────
    if (skillId.startsWith('reading_phonics_short_') &&
        (skillId.includes('_medial') || skillId.includes('_final') || skillId.includes('_in_blends'))) {
        const parsed = _parseShortVowelSkill(skillId);
        if (parsed) {
            return _generateShortVowelQuestion(skillAtom, parsed.vowel, parsed.position, rng, mechanicHint);
        }
    }

    // ── Heart words ────────────────────────────────────────────────────────────
    if (skillId.startsWith('reading_phonics_heart_word_')) {
        const wordKey = _parseHeartWordKey(skillId);
        if (wordKey) {
            return _generateHeartWordQuestion(skillAtom, wordKey, rng, mechanicHint);
        }
    }

    // ── Digraph atoms (sh, ch, th, wh) ────────────────────────────────────────
    if (skillId.startsWith('reading_phonics_digraph_')) {
        const digraph = _digraphKey(skillId);
        if (DIGRAPH_WORDS[digraph]) {
            return _generateDigraphQuestion(skillAtom, digraph, rng, mechanicHint);
        }
    }

    // ── Blend atoms (initial_l, initial_r, initial_s, final) ──────────────────
    if (skillId.startsWith('reading_phonics_blend_')) {
        const blendKey = _blendKey(skillId);
        if (BLEND_WORDS[blendKey]) {
            return _generateBlendQuestion(skillAtom, blendKey, rng, mechanicHint);
        }
    }

    // ── VCe (silent-e) atoms ────────────────────────────────────────────────────
    if (skillId.startsWith('reading_phonics_long_') && skillId.endsWith('_vce')) {
        const vowel = _vceVowel(skillId);
        if (vowel && VCE_WORDS[vowel]) {
            return _generateVceQuestion(skillAtom, vowel, rng, mechanicHint);
        }
    }

    // ── Mixed long-vowels (VCe) ────────────────────────────────────────────────
    if (skillId === 'reading_phonics_long_vowels_mixed') {
        const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
        const widget = STAGE1_FALLBACK[mechanic] || mechanic;
        switch (widget) {
            case 'mc-image':   return _mixedLongVowelMcImage(skillAtom, rng);
            case 'dnd-linked': return _mixedLongVowelSortBins(skillAtom, rng);
            case 'fib-auto':   return _vceFibAuto(skillAtom, _sample(['a','i','o','u'], 1, rng)[0], 99, rng);
            case 'mc-text':    return _mixedLongVowelMcText(skillAtom, rng);
            default:           return _mixedLongVowelMcImage(skillAtom, rng);
        }
    }

    // ── Vowel-team atoms ────────────────────────────────────────────────────────
    if (skillId.startsWith('reading_phonics_vowel_team_')) {
        const teamKey = _vowelTeamKey(skillId);
        if (VOWEL_TEAM_WORDS[teamKey]) {
            return _generateVowelTeamQuestion(skillAtom, teamKey, rng, mechanicHint);
        }
    }

    // ── R-controlled atoms (ar / or / er_ir_ur / are_air / ear_eer) ────────────
    if (skillId.startsWith('reading_phonics_r_controlled_')) {
        const rkey = skillId.slice('reading_phonics_r_controlled_'.length);
        if (R_CONTROLLED_WORDS[rkey]) {
            return _generateRControlledQuestion(skillAtom, rkey, rng, mechanicHint);
        }
    }

    // ── Diphthong atoms (oi_oy / ou_ow / au_aw) ────────────────────────────────
    if (skillId.startsWith('reading_phonics_diphthong_')) {
        const dkey = skillId.slice('reading_phonics_diphthong_'.length);
        if (DIPHTHONG_WORDS[dkey]) {
            return _generateDiphthongQuestion(skillAtom, dkey, rng, mechanicHint);
        }
    }

    // ── Syllable-type atoms (closed / open / vce / r_controlled / vowel_team / consonant_le)
    if (skillId.startsWith('reading_phonics_syllable_type_')) {
        const stkey = skillId.slice('reading_phonics_syllable_type_'.length);
        if (SYLLABLE_TYPE_EXAMPLES[stkey]) {
            return _generateSyllableTypeQuestion(skillAtom, stkey, rng, mechanicHint);
        }
    }

    // ── Morphology atoms (prefix_un_re, prefix_dis_pre, suffix_ed_ing, …) ────────
    if (skillId.startsWith('reading_phonics_morphology_')) {
        const mkey = skillId.slice('reading_phonics_morphology_'.length);
        if (MORPHOLOGY_BANK[mkey]) {
            return _generateMorphologyQuestion(skillAtom, mkey, rng, mechanicHint);
        }
    }

    // ── Multisyllabic atoms ───────────────────────────────────────────────────
    if (skillId === 'reading_phonics_multisyllabic_compound') {
        return _generateCompoundQuestion(skillAtom, rng, mechanicHint);
    }
    if (skillId === 'reading_phonics_multisyllabic_2syllable') {
        return _generate2SyllableQuestion(skillAtom, rng, mechanicHint);
    }

    // All other phonics atoms: generic fallback until Phase 4 expands them.
    return _genericMcText(skillAtom);
}

// ─── Phoneme metadata (R_CONTROLLED_WORDS + DIPHTHONG_WORDS already declared above)

const R_CONTROLLED_PHONEMES = {
    ar: '/ɑr/', or: '/ɔr/', er_ir_ur: '/ɝ/', are_air: '/ɛr/', ear_eer: '/ɪr/',
};
const DIPHTHONG_PHONEMES = {
    oi_oy: '/ɔɪ/', ou_ow: '/aʊ/', au: '/ɔ/', aw: '/ɔ/', au_aw: '/ɔ/',
};

const SYLLABLE_TYPE_EXAMPLES = {
    closed:       { words: ['cat', 'sit', 'top', 'bed', 'mud', 'rabbit', 'napkin', 'basket'], description: 'one vowel, ends in consonant; vowel says short sound' },
    open:         { words: ['he', 'go', 'no', 'tiger', 'baby', 'music', 'spider', 'robot'],   description: 'ends in vowel; vowel says long sound' },
    vce:          { words: ['cake', 'time', 'hope', 'cute', 'mistake', 'invite', 'engine'],   description: 'vowel-consonant-silent e; vowel says long sound' },
    r_controlled: { words: ['car', 'her', 'bird', 'turn', 'market', 'perfect', 'garden'],     description: 'vowel + r; r controls the vowel sound' },
    vowel_team:   { words: ['rain', 'tree', 'boat', 'play', 'railroad', 'seacoast', 'peanut'], description: 'two vowels together making one sound' },
    consonant_le: { words: ['table', 'little', 'purple', 'simple', 'candle', 'apple', 'jungle'], description: 'consonant + le at end of word' },
};

// ─── R-controlled mechanic variants ────────────────────────────────────────────

// Helpers that work with both single-variant ({ words: [...] }) and paired
// ({ <variantKey>: [...], ... }) shapes used by R_CONTROLLED_WORDS and
// DIPHTHONG_WORDS at the top of this file.
function _bankIsSingle(data) { return Array.isArray(data.words); }
function _bankVariantKeys(data) {
    return Object.keys(data).filter(k => Array.isArray(data[k]));
}
function _bankAllWords(data) {
    if (_bankIsSingle(data)) return data.words.slice();
    return _bankVariantKeys(data).flatMap(k => data[k]);
}

function _rControlledPickWord(rkey, rng) {
    const data = R_CONTROLLED_WORDS[rkey];
    if (_bankIsSingle(data)) return _sample(data.words, 1, rng)[0];
    const variantKeys = _bankVariantKeys(data);
    const variant = _sample(variantKeys, 1, rng)[0];
    return _sample(data[variant], 1, rng)[0];
}

function _rControlledAllWords(rkey) {
    return _bankAllWords(R_CONTROLLED_WORDS[rkey]);
}

function _rControlledNonWords(excludeKey, rng) {
    const all = [];
    for (const k of Object.keys(R_CONTROLLED_WORDS)) {
        if (k === excludeKey) continue;
        all.push(..._rControlledAllWords(k));
    }
    return _sample(all, 6, rng);
}

function _rControlledMcImage(skillAtom, rkey, rng) {
    const correctWord = _rControlledPickWord(rkey, rng);
    const wrongs = _rControlledNonWords(rkey, rng).slice(0, 2);
    const opts = _sample([
        { id: 'a', label: correctWord, image: WORD_EMOJI[correctWord] || '⭐', correct: true },
        { id: 'b', label: wrongs[0],   image: WORD_EMOJI[wrongs[0]]  || '❓', correct: false },
        { id: 'c', label: wrongs[1],   image: WORD_EMOJI[wrongs[1]]  || '❓', correct: false },
    ], 99, rng);
    return {
        id: _qid(skillAtom.skill_id, 'mci'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-image',
        stem: `Tap the picture whose name has the ${R_CONTROLLED_PHONEMES[rkey]} sound.`,
        options: opts,
        ans: opts.find(o => o.correct).id,
        correct_answer: opts.find(o => o.correct).id,
        hints: [`Listen for the ${R_CONTROLLED_WORDS[rkey].phoneme} sound.`],
        rit_difficulty: parseInt((skillAtom.rit_band || "145-150").split("-")[0], 10) || 145,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: true,
    };
}

function _rControlledFibAuto(skillAtom, rkey, rng) {
    const word = _rControlledPickWord(rkey, rng);
    return {
        id: _qid(skillAtom.skill_id, 'fib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        stem: `Spell this word: ${WORD_EMOJI[word] || '⭐'}`,
        ans: [{ acceptable_answers: [word], case_sensitive: false, normalize_whitespace: true }],
        correct_answer: word,
        hints: [`This word has the ${R_CONTROLLED_PHONEMES[rkey]} sound.`],
        rit_difficulty: parseInt((skillAtom.rit_band || "145-150").split("-")[0], 10) || 145,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: true,
    };
}

function _rControlledSortBins(skillAtom, rkey, rng) {
    const data = R_CONTROLLED_WORDS[rkey];
    const phoneme = R_CONTROLLED_PHONEMES[rkey];
    if (!_bankIsSingle(data)) {
        // Paired: sort by spelling variant
        const variantKeys = _bankVariantKeys(data);
        const items = [];
        for (const v of variantKeys) {
            const samples = _sample(data[v], 2, rng);
            for (const w of samples) items.push({ id: 't' + items.length, label: w, correct_bin: v });
        }
        const bins = variantKeys.map(v => ({ id: v, label: v }));
        return {
            id: _qid(skillAtom.skill_id, 'sib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'dnd-linked',
            stem: `Sort each word by spelling pattern (${variantKeys.join(' / ')}).`,
            draggables: items.map(it => ({ id: it.id, label: it.label })),
            zones: bins.map(b => ({ id: b.id, label: b.label, accepts: items.filter(i => i.correct_bin === b.id).map(i => i.id) })),
            ans: items.reduce((acc, it) => { acc[it.id] = it.correct_bin; return acc; }, {}),
            hints: [`Listen for the ${phoneme} sound.`],
            rit_difficulty: parseInt((skillAtom.rit_band || "145-150").split("-")[0], 10) || 145,
            grade_level: skillAtom.developmental_band,
            has_audio: true,
            k2_appropriate: true,
        };
    }
    // Single: sort "Has /sound/" vs "No /sound/"
    const correctSamples = _sample(data.words, 3, rng).map((w, i) => ({ id: 't' + i, label: w, correct_bin: 'has' }));
    const wrongSamples = _rControlledNonWords(rkey, rng).slice(0, 3).map((w, i) => ({ id: 't' + (i + 3), label: w, correct_bin: 'no' }));
    const items = correctSamples.concat(wrongSamples);
    return {
        id: _qid(skillAtom.skill_id, 'sib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Sort each word by whether it has the ${phoneme} sound.`,
        draggables: items.map(it => ({ id: it.id, label: it.label })),
        zones: [
            { id: 'has', label: `Has ${phoneme}`, accepts: correctSamples.map(s => s.id) },
            { id: 'no',  label: `No ${phoneme}`,  accepts: wrongSamples.map(s => s.id) },
        ],
        ans: items.reduce((acc, it) => { acc[it.id] = it.correct_bin; return acc; }, {}),
        rit_difficulty: parseInt((skillAtom.rit_band || "145-150").split("-")[0], 10) || 145,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: true,
    };
}

function _rControlledMcText(skillAtom, rkey, rng) {
    const phoneme = R_CONTROLLED_PHONEMES[rkey];
    const correctWord = _rControlledPickWord(rkey, rng);
    const wrongs = _rControlledNonWords(rkey, rng).slice(0, 3);
    const opts = _sample([
        { id: 'a', label: correctWord, correct: true },
        { id: 'b', label: wrongs[0],   correct: false },
        { id: 'c', label: wrongs[1],   correct: false },
        { id: 'd', label: wrongs[2],   correct: false },
    ], 99, rng);
    return {
        id: _qid(skillAtom.skill_id, 'mct'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        stem: `Which word has the ${phoneme} sound?`,
        options: opts,
        ans: opts.find(o => o.correct).id,
        correct_answer: opts.find(o => o.correct).id,
        rit_difficulty: parseInt((skillAtom.rit_band || "145-150").split("-")[0], 10) || 145,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: false,
    };
}

function _generateRControlledQuestion(skillAtom, rkey, rng, mechanicHint) {
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;
    switch (widget) {
        case 'mc-image':    return _rControlledMcImage(skillAtom, rkey, rng);
        case 'fib-auto':    return _rControlledFibAuto(skillAtom, rkey, rng);
        case 'dnd-linked':  return _rControlledSortBins(skillAtom, rkey, rng);
        case 'mc-text':     return _rControlledMcText(skillAtom, rkey, rng);
        default:            return _rControlledMcImage(skillAtom, rkey, rng);
    }
}

// ─── Diphthong mechanic variants (reuse R-controlled paired helpers) ───────────

function _diphthongPickWord(dkey, rng) {
    const data = DIPHTHONG_WORDS[dkey];
    if (_bankIsSingle(data)) return _sample(data.words, 1, rng)[0];
    const variantKeys = _bankVariantKeys(data);
    const variant = _sample(variantKeys, 1, rng)[0];
    return _sample(data[variant], 1, rng)[0];
}

function _diphthongAllWords(dkey) {
    return _bankAllWords(DIPHTHONG_WORDS[dkey]);
}

function _diphthongNonWords(excludeKey, rng) {
    const all = [];
    for (const k of Object.keys(DIPHTHONG_WORDS)) {
        if (k === excludeKey) continue;
        all.push(..._diphthongAllWords(k));
    }
    return _sample(all, 6, rng);
}

function _diphthongMcImage(skillAtom, dkey, rng) {
    const correctWord = _diphthongPickWord(dkey, rng);
    const wrongs = _diphthongNonWords(dkey, rng).slice(0, 2);
    const opts = _sample([
        { id: 'a', label: correctWord, image: WORD_EMOJI[correctWord] || '⭐', correct: true },
        { id: 'b', label: wrongs[0],   image: WORD_EMOJI[wrongs[0]]  || '❓', correct: false },
        { id: 'c', label: wrongs[1],   image: WORD_EMOJI[wrongs[1]]  || '❓', correct: false },
    ], 99, rng);
    return {
        id: _qid(skillAtom.skill_id, 'mci'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-image',
        stem: `Tap the picture whose name has the ${DIPHTHONG_PHONEMES[dkey]} sound.`,
        options: opts,
        ans: opts.find(o => o.correct).id,
        correct_answer: opts.find(o => o.correct).id,
        rit_difficulty: parseInt((skillAtom.rit_band || "145-150").split("-")[0], 10) || 145,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: true,
    };
}

function _diphthongFibAuto(skillAtom, dkey, rng) {
    const word = _diphthongPickWord(dkey, rng);
    return {
        id: _qid(skillAtom.skill_id, 'fib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        stem: `Spell this word: ${WORD_EMOJI[word] || '⭐'}`,
        ans: [{ acceptable_answers: [word], case_sensitive: false, normalize_whitespace: true }],
        correct_answer: word,
        rit_difficulty: parseInt((skillAtom.rit_band || "145-150").split("-")[0], 10) || 145,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: true,
    };
}

function _diphthongSortBins(skillAtom, dkey, rng) {
    const data = DIPHTHONG_WORDS[dkey];
    if (_bankIsSingle(data)) {
        // Single-spelling diphthong (au or aw alone) → fall back to has-vs-no sort
        return _diphthongMcImage(skillAtom, dkey, rng);
    }
    const variantKeys = _bankVariantKeys(data);
    const items = [];
    for (const v of variantKeys) {
        const samples = _sample(data[v], 2, rng);
        for (const w of samples) items.push({ id: 't' + items.length, label: w, correct_bin: v });
    }
    return {
        id: _qid(skillAtom.skill_id, 'sib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Sort each word by spelling pattern (${variantKeys.join(' / ')}).`,
        draggables: items.map(it => ({ id: it.id, label: it.label })),
        zones: variantKeys.map(v => ({ id: v, label: v, accepts: items.filter(i => i.correct_bin === v).map(i => i.id) })),
        ans: items.reduce((acc, it) => { acc[it.id] = it.correct_bin; return acc; }, {}),
        rit_difficulty: parseInt((skillAtom.rit_band || "145-150").split("-")[0], 10) || 145,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: true,
    };
}

function _diphthongMcText(skillAtom, dkey, rng) {
    const phoneme = DIPHTHONG_PHONEMES[dkey];
    const correctWord = _diphthongPickWord(dkey, rng);
    const wrongs = _diphthongNonWords(dkey, rng).slice(0, 3);
    const opts = _sample([
        { id: 'a', label: correctWord, correct: true },
        { id: 'b', label: wrongs[0],   correct: false },
        { id: 'c', label: wrongs[1],   correct: false },
        { id: 'd', label: wrongs[2],   correct: false },
    ], 99, rng);
    return {
        id: _qid(skillAtom.skill_id, 'mct'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        stem: `Which word has the ${phoneme} sound?`,
        options: opts,
        ans: opts.find(o => o.correct).id,
        correct_answer: opts.find(o => o.correct).id,
        rit_difficulty: parseInt((skillAtom.rit_band || "145-150").split("-")[0], 10) || 145,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: false,
    };
}

function _generateDiphthongQuestion(skillAtom, dkey, rng, mechanicHint) {
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;
    switch (widget) {
        case 'mc-image':    return _diphthongMcImage(skillAtom, dkey, rng);
        case 'fib-auto':    return _diphthongFibAuto(skillAtom, dkey, rng);
        case 'dnd-linked':  return _diphthongSortBins(skillAtom, dkey, rng);
        case 'mc-text':     return _diphthongMcText(skillAtom, dkey, rng);
        default:            return _diphthongMcImage(skillAtom, dkey, rng);
    }
}

// ─── Syllable-type mechanic variants ───────────────────────────────────────────

const SYLLABLE_TYPE_LABELS = {
    closed: 'Closed', open: 'Open', vce: 'VCe (silent-e)',
    r_controlled: 'R-controlled', vowel_team: 'Vowel Team', consonant_le: 'Consonant-le',
};

function _syllableTypeMcText(skillAtom, stkey, rng) {
    const data = SYLLABLE_TYPE_EXAMPLES[stkey];
    const word = _sample(data.words, 1, rng)[0];
    const allKeys = Object.keys(SYLLABLE_TYPE_EXAMPLES);
    const wrongKeys = allKeys.filter(k => k !== stkey);
    const wrongs = _sample(wrongKeys, 3, rng);
    const opts = _sample([
        { id: 'a', label: SYLLABLE_TYPE_LABELS[stkey], correct: true },
        { id: 'b', label: SYLLABLE_TYPE_LABELS[wrongs[0]], correct: false },
        { id: 'c', label: SYLLABLE_TYPE_LABELS[wrongs[1]], correct: false },
        { id: 'd', label: SYLLABLE_TYPE_LABELS[wrongs[2]], correct: false },
    ], 99, rng);
    return {
        id: _qid(skillAtom.skill_id, 'mct'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        stem: `What syllable type is this word? "${word}"`,
        options: opts,
        ans: opts.find(o => o.correct).id,
        correct_answer: opts.find(o => o.correct).id,
        hints: [`Hint: ${data.description}.`],
        rit_difficulty: parseInt((skillAtom.rit_band || "145-150").split("-")[0], 10) || 145,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: false,
    };
}

function _syllableTypeSortBins(skillAtom, stkey, rng) {
    // Sort 6 words: 3 from this type + 3 from other types into 2 bins.
    const data = SYLLABLE_TYPE_EXAMPLES[stkey];
    const correctSamples = _sample(data.words, 3, rng);
    const otherKeys = Object.keys(SYLLABLE_TYPE_EXAMPLES).filter(k => k !== stkey);
    const wrongs = [];
    for (const ok of _sample(otherKeys, 3, rng)) {
        wrongs.push(_sample(SYLLABLE_TYPE_EXAMPLES[ok].words, 1, rng)[0]);
    }
    const items = correctSamples.map((w, i) => ({ id: 't' + i, label: w, correct_bin: 'is_type' }))
        .concat(wrongs.map((w, i) => ({ id: 't' + (i + 3), label: w, correct_bin: 'not_type' })));
    return {
        id: _qid(skillAtom.skill_id, 'sib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Sort each word: is it a ${SYLLABLE_TYPE_LABELS[stkey]} syllable, or not?`,
        draggables: items.map(it => ({ id: it.id, label: it.label })),
        zones: [
            { id: 'is_type',  label: SYLLABLE_TYPE_LABELS[stkey], accepts: correctSamples.map((_, i) => 't' + i) },
            { id: 'not_type', label: 'Not ' + SYLLABLE_TYPE_LABELS[stkey], accepts: wrongs.map((_, i) => 't' + (i + 3)) },
        ],
        ans: items.reduce((acc, it) => { acc[it.id] = it.correct_bin; return acc; }, {}),
        hints: [`${SYLLABLE_TYPE_LABELS[stkey]}: ${data.description}.`],
        rit_difficulty: parseInt((skillAtom.rit_band || "145-150").split("-")[0], 10) || 145,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: false,
    };
}

function _syllableTypeTwoButtonBinary(skillAtom, stkey, rng) {
    const data = SYLLABLE_TYPE_EXAMPLES[stkey];
    const isType = rng() < 0.5;
    let word;
    if (isType) {
        word = _sample(data.words, 1, rng)[0];
    } else {
        const otherKey = _sample(Object.keys(SYLLABLE_TYPE_EXAMPLES).filter(k => k !== stkey), 1, rng)[0];
        word = _sample(SYLLABLE_TYPE_EXAMPLES[otherKey].words, 1, rng)[0];
    }
    return {
        id: _qid(skillAtom.skill_id, 'tbb'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'two-button-binary',
        subject: word,
        stem: `Is this a ${SYLLABLE_TYPE_LABELS[stkey]} syllable?`,
        options: [
            { id: 'yes', label: 'Yes' },
            { id: 'no',  label: 'No' },
        ],
        ans: isType ? 'yes' : 'no',
        correct_answer: isType ? 'yes' : 'no',
        hints: [`${SYLLABLE_TYPE_LABELS[stkey]}: ${data.description}.`],
        rit_difficulty: parseInt((skillAtom.rit_band || "145-150").split("-")[0], 10) || 145,
        grade_level: skillAtom.developmental_band,
        has_audio: true,
        k2_appropriate: false,
    };
}

function _generateSyllableTypeQuestion(skillAtom, stkey, rng, mechanicHint) {
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;
    switch (widget) {
        case 'mc-text':           return _syllableTypeMcText(skillAtom, stkey, rng);
        case 'dnd-linked':        return _syllableTypeSortBins(skillAtom, stkey, rng);
        case 'two-button-binary': return _syllableTypeTwoButtonBinary(skillAtom, stkey, rng);
        default:                  return _syllableTypeMcText(skillAtom, stkey, rng);
    }
}

// ─── Morphology word bank ─────────────────────────────────────────────────────

const MORPHOLOGY_BANK = {
    prefix_un_re: {
        type: 'prefix',
        affixes: {
            un: ['unhappy', 'unfair', 'undo', 'unkind', 'untie', 'unlock'],
            re: ['redo', 'rerun', 'retell', 'rewrite', 'rebuild', 'replay'],
        },
        roots: ['happy', 'fair', 'do', 'kind', 'tie', 'lock', 'run', 'tell', 'write', 'build', 'play'],
        meanings: { un: 'not / opposite of', re: 'again' },
    },
    prefix_dis_pre: {
        type: 'prefix',
        affixes: {
            dis: ['disagree', 'disappear', 'dishonest', 'dislike'],
            pre: ['preheat', 'preview', 'prepay', 'prefix'],
            mis: ['misuse', 'misplace', 'misread', 'mistake'],
        },
        roots: ['agree', 'heat', 'use', 'place', 'like', 'view', 'read', 'take'],
        meanings: { dis: 'not / opposite of', pre: 'before', mis: 'wrong / badly' },
    },
    // Alternate ID form used in some data file references
    prefix_dis_pre_mis: {
        type: 'prefix',
        affixes: {
            dis: ['disagree', 'disappear', 'dishonest', 'dislike'],
            pre: ['preheat', 'preview', 'prepay', 'prefix'],
            mis: ['misuse', 'misplace', 'misread', 'mistake'],
        },
        roots: ['agree', 'heat', 'use', 'place', 'like', 'view', 'read', 'take'],
        meanings: { dis: 'not / opposite of', pre: 'before', mis: 'wrong / badly' },
    },
    prefix_mis_non_sub: {
        type: 'prefix',
        affixes: {
            mis: ['misuse', 'misplace', 'misread', 'mistake', 'misjudge'],
            non: ['nonfiction', 'nonstop', 'nonprofit', 'nonsense'],
            sub: ['subway', 'submarine', 'subtract', 'submerge'],
        },
        roots: ['use', 'place', 'read', 'take', 'fiction', 'stop', 'way', 'marine'],
        meanings: { mis: 'wrong / badly', non: 'not', sub: 'under' },
    },
    suffix_ed_ing: {
        type: 'suffix',
        affixes: {
            ed: ['walked', 'jumped', 'played', 'wanted', 'helped'],
            ing: ['walking', 'jumping', 'playing', 'running', 'helping'],
        },
        roots: ['walk', 'jump', 'play', 'want', 'run', 'help'],
        meanings: { ed: 'past tense', ing: 'happening now / continuous' },
    },
    suffix_er_est: {
        type: 'suffix',
        affixes: {
            er: ['bigger', 'faster', 'smaller', 'taller', 'older'],
            est: ['biggest', 'fastest', 'smallest', 'tallest', 'oldest'],
        },
        roots: ['big', 'fast', 'small', 'tall', 'old'],
        meanings: { er: 'more', est: 'most' },
    },
    suffix_ly: {
        type: 'suffix',
        affixes: {
            ly: ['quickly', 'slowly', 'sadly', 'quietly', 'softly', 'carefully'],
        },
        roots: ['quick', 'slow', 'sad', 'quiet', 'soft', 'careful'],
        meanings: { ly: 'in a [adj] way' },
    },
    suffix_ful_less: {
        type: 'suffix',
        affixes: {
            ful: ['helpful', 'careful', 'useful', 'playful', 'hopeful'],
            less: ['careless', 'endless', 'useless', 'helpless', 'hopeless'],
        },
        roots: ['help', 'care', 'use', 'play', 'hope', 'end'],
        meanings: { ful: 'full of', less: 'without' },
    },
    // Alias combining ly + ful + less (prompt mentions this combined form)
    suffix_ly_ful_less: {
        type: 'suffix',
        affixes: {
            ly: ['quickly', 'slowly', 'sadly', 'quietly'],
            ful: ['helpful', 'careful', 'useful', 'playful'],
            less: ['careless', 'endless', 'useless', 'helpless'],
        },
        roots: ['quick', 'help', 'care', 'use', 'sad', 'play', 'end'],
        meanings: { ly: 'in a [adj] way', ful: 'full of', less: 'without' },
    },
    suffix_ness: {
        type: 'suffix',
        affixes: {
            ness: ['darkness', 'kindness', 'sadness', 'happiness', 'softness'],
        },
        roots: ['dark', 'kind', 'sad', 'happy', 'soft'],
        meanings: { ness: 'state of being' },
    },
    root_basic: {
        type: 'root',
        affixes: {
            graph: ['photograph', 'autograph', 'paragraph'],
            photo: ['photograph', 'photocopy'],
            tele: ['telephone', 'television', 'telescope'],
            scope: ['microscope', 'telescope'],
            port: ['transport', 'import', 'export', 'report'],
            tract: ['attract', 'contract', 'subtract'],
        },
        meanings: { graph: 'write', photo: 'light', tele: 'far', scope: 'see', port: 'carry', tract: 'pull' },
    },
    root_greek: {
        type: 'root',
        affixes: {
            graph: ['photograph', 'autograph', 'paragraph'],
            photo: ['photograph', 'photocopy'],
            tele: ['telephone', 'television', 'telescope'],
            scope: ['microscope', 'telescope', 'periscope'],
        },
        meanings: { graph: 'write', photo: 'light', tele: 'far', scope: 'see' },
    },
    root_latin_advanced: {
        type: 'root',
        affixes: {
            struct: ['construct', 'instruct', 'structure', 'destruction'],
            rupt: ['disrupt', 'erupt', 'interrupt', 'corrupt'],
            aud: ['audio', 'audience', 'audible', 'auditorium'],
            vis: ['visible', 'vision', 'visual', 'supervise'],
        },
        meanings: { struct: 'build', rupt: 'break', aud: 'hear', vis: 'see' },
    },
};

// ─── Morphology mechanic helpers ──────────────────────────────────────────────

/**
 * mc-text: "Which word uses the prefix 'un-' (not / opposite of)?"
 * Correct: one word from the target affix; distractors from other affixes / generics.
 */
function _morphologyMcText(skillAtom, mkey, rng) {
    const bank = MORPHOLOGY_BANK[mkey];
    const affixKeys = Object.keys(bank.affixes);

    // Pick a target affix and one correct word
    const [targetAffix] = _sample(affixKeys, 1, rng);
    const [correct] = _sample(bank.affixes[targetAffix], 1, rng);

    // Collect distractors from OTHER affixes within same bank
    const distractorPool = affixKeys
        .filter(k => k !== targetAffix)
        .flatMap(k => bank.affixes[k]);

    // Supplement with generic morphologically-rich distractors if needed
    const genericDistractors = ['running', 'careful', 'unhappy', 'replay', 'biggest', 'quickly',
        'disagree', 'preheat', 'helpful', 'darkness', 'photograph', 'transport'];
    const allDistractors = [...distractorPool, ...genericDistractors].filter(w => w !== correct);
    const [d1, d2] = _sample(allDistractors, 2, rng);

    const stem = bank.type === 'prefix'
        ? `Which word uses the prefix "${targetAffix}-" (${bank.meanings[targetAffix]})?`
        : bank.type === 'suffix'
        ? `Which word uses the suffix "-${targetAffix}" (${bank.meanings[targetAffix]})?`
        : `Which word contains the root "${targetAffix}" (${bank.meanings[targetAffix]})?`;

    const opts = _sample([
        { id: 'a', label: correct, correct: true },
        { id: 'b', label: d1, correct: false },
        { id: 'c', label: d2, correct: false },
    ], 3, rng);

    return {
        id: _qid(skillAtom.skill_id, 'mct'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        stem,
        options: opts,
        ans: opts.find(o => o.correct).id,
        correct_answer: opts.find(o => o.correct).id,
        distractor_misconceptions: Object.fromEntries(
            opts.filter(o => !o.correct).map(o => [o.id,
                bank.type === 'prefix'
                    ? `"${o.label}" does not start with the prefix "${targetAffix}-".`
                    : bank.type === 'suffix'
                    ? `"${o.label}" does not end with the suffix "-${targetAffix}".`
                    : `"${o.label}" does not contain the root "${targetAffix}".`
            ])
        ),
        hints: [
            bank.type === 'prefix'
                ? `The prefix "${targetAffix}-" means "${bank.meanings[targetAffix]}". Look for a word that starts with "${targetAffix}".`
                : bank.type === 'suffix'
                ? `The suffix "-${targetAffix}" means "${bank.meanings[targetAffix]}". Look for a word that ends with "-${targetAffix}".`
                : `The root "${targetAffix}" means "${bank.meanings[targetAffix]}". Find a word that contains this root.`,
        ],
        rit_difficulty: parseInt((skillAtom.rit_band || '175-185').split('-')[0], 10) || 175,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: false,
        k2_appropriate: false,
    };
}

/**
 * fib-auto: "Add the prefix 'un-' to 'happy'. What is the new word?"
 * For suffix banks: "Add the suffix '-ed' to 'jump'. What is the new word?"
 * For root banks: "Type a word that contains the root 'graph' (write)."
 */
function _morphologyFibAuto(skillAtom, mkey, rng) {
    const bank = MORPHOLOGY_BANK[mkey];
    const affixKeys = Object.keys(bank.affixes);
    const [targetAffix] = _sample(affixKeys, 1, rng);

    if (bank.type === 'root') {
        const [correct] = _sample(bank.affixes[targetAffix], 1, rng);
        const meaning = bank.meanings[targetAffix];
        return {
            id: _qid(skillAtom.skill_id, 'fib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'fib-auto',
            stem: `Type a word that contains the root "${targetAffix}" (meaning: ${meaning}).`,
            ans: [{
                acceptable_answers: bank.affixes[targetAffix].map(w => w.toLowerCase()),
                case_sensitive: false,
                normalize_whitespace: true,
                label: `Type a word with root "${targetAffix}"`,
            }],
            correct_answer: correct.toLowerCase(),
            distractor_misconceptions: {},
            hints: [
                `The root "${targetAffix}" means "${meaning}".`,
                `Examples: ${bank.affixes[targetAffix].slice(0, 2).join(', ')}.`,
            ],
            rit_difficulty: parseInt((skillAtom.rit_band || '175-185').split('-')[0], 10) || 175,
            grade_level: skillAtom.developmental_band || '4-5',
            has_audio: false,
            k2_appropriate: false,
            partial_credit: false,
        };
    }

    // For prefix/suffix: find a root that pairs cleanly with the chosen affix
    const wordList = bank.affixes[targetAffix];
    const [correctWord] = _sample(wordList, 1, rng);

    // Derive the root from the correct word
    const derivedRoot = bank.type === 'prefix'
        ? correctWord.slice(targetAffix.length)
        : correctWord.slice(0, correctWord.length - targetAffix.length);

    const stem = bank.type === 'prefix'
        ? `Add the prefix "${targetAffix}-" to "${derivedRoot}". What is the new word?`
        : `Add the suffix "-${targetAffix}" to "${derivedRoot}". What is the new word?`;

    return {
        id: _qid(skillAtom.skill_id, 'fib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        stem,
        ans: [{
            acceptable_answers: [correctWord.toLowerCase()],
            case_sensitive: false,
            normalize_whitespace: true,
            label: 'Type the new word',
        }],
        correct_answer: correctWord.toLowerCase(),
        distractor_misconceptions: {},
        hints: [
            bank.type === 'prefix'
                ? `"${targetAffix}-" means "${bank.meanings[targetAffix]}". Add it to the beginning: ${targetAffix} + ${derivedRoot}.`
                : `"-${targetAffix}" means "${bank.meanings[targetAffix]}". Add it to the end: ${derivedRoot} + ${targetAffix}.`,
            `The answer is: ${correctWord}.`,
        ],
        rit_difficulty: parseInt((skillAtom.rit_band || '175-185').split('-')[0], 10) || 175,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: false,
        k2_appropriate: false,
        partial_credit: false,
    };
}

/**
 * sort-into-bins (dnd-linked): sort ~6 words by which affix they use.
 * Uses 2 of the available affix variants; falls back to mc-text for single-affix banks.
 */
function _morphologySortBins(skillAtom, mkey, rng) {
    const bank = MORPHOLOGY_BANK[mkey];
    const affixKeys = Object.keys(bank.affixes);

    if (affixKeys.length < 2) {
        return _morphologyMcText(skillAtom, mkey, rng);
    }

    // Pick exactly 2 affix variants to sort between
    const [af1, af2] = _sample(affixKeys, 2, rng);
    const words1 = _sample(bank.affixes[af1], Math.min(3, bank.affixes[af1].length), rng);
    const words2 = _sample(bank.affixes[af2], Math.min(3, bank.affixes[af2].length), rng);
    const allWords = _sample([...words1, ...words2], words1.length + words2.length, rng);

    const draggables = allWords.map((w, i) => ({ id: `w${i}`, label: w, audio_text: w }));
    const correctAns = {};
    allWords.forEach((w, i) => {
        correctAns[`w${i}`] = words1.includes(w) ? `bin_${af1}` : `bin_${af2}`;
    });

    const binLabel = af =>
        bank.type === 'prefix' ? `"${af}-"` : bank.type === 'suffix' ? `"-${af}"` : `"${af}"`;

    return {
        id: _qid(skillAtom.skill_id, 'sort'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: `Sort each word by its ${bank.type}: does it use ${binLabel(af1)} or ${binLabel(af2)}?`,
        draggables,
        zones: [
            {
                id: `bin_${af1}`,
                label: `${binLabel(af1)} — ${bank.meanings[af1]}`,
                accepts: words1.map(w => `w${allWords.indexOf(w)}`),
            },
            {
                id: `bin_${af2}`,
                label: `${binLabel(af2)} — ${bank.meanings[af2]}`,
                accepts: words2.map(w => `w${allWords.indexOf(w)}`),
            },
        ],
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {},
        hints: [
            bank.type === 'prefix'
                ? `Look at the beginning of each word. Does it start with "${af1}" or "${af2}"?`
                : bank.type === 'suffix'
                ? `Look at the end of each word. Does it end with "-${af1}" or "-${af2}"?`
                : `Look inside each word for the root "${af1}" or "${af2}".`,
            `"${af1}" means "${bank.meanings[af1]}". "${af2}" means "${bank.meanings[af2]}".`,
        ],
        rit_difficulty: parseInt((skillAtom.rit_band || '175-185').split('-')[0], 10) || 175,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: false,
        k2_appropriate: false,
    };
}

/**
 * match-pairs (dnd-linked): match each affix chip → its meaning zone.
 * Up to 3 pairs; zones are shuffled so position does not reveal answer.
 */
function _morphologyMatchPairs(skillAtom, mkey, rng) {
    const bank = MORPHOLOGY_BANK[mkey];
    const affixKeys = Object.keys(bank.meanings);

    if (affixKeys.length < 2) {
        return _morphologyMcText(skillAtom, mkey, rng);
    }

    const chosen = _sample(affixKeys, Math.min(3, affixKeys.length), rng);

    const draggables = chosen.map((af, i) => ({
        id: `affix${i}`,
        label: bank.type === 'prefix' ? `${af}-` : bank.type === 'suffix' ? `-${af}` : af,
        audio_text: af,
    }));

    // Build zones in shuffled order to prevent trivial positional matching
    const orderedZones = chosen.map((af, i) => ({
        id: `meaning${i}`,
        label: bank.meanings[af],
        accepts: [`affix${i}`],
    }));
    const shuffledZones = _sample(orderedZones, orderedZones.length, rng);

    const correctAns = {};
    chosen.forEach((af, i) => {
        const zone = shuffledZones.find(z => z.accepts[0] === `affix${i}`);
        correctAns[`affix${i}`] = zone.id;
    });

    const stem = bank.type === 'prefix'
        ? 'Match each prefix to its meaning.'
        : bank.type === 'suffix'
        ? 'Match each suffix to its meaning.'
        : 'Match each root to its meaning.';

    return {
        id: _qid(skillAtom.skill_id, 'match'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem,
        draggables,
        zones: shuffledZones,
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {},
        hints: [
            `Think about what each ${bank.type} means.`,
            chosen.map(af => `"${af}" = "${bank.meanings[af]}"`).join('; ') + '.',
        ],
        rit_difficulty: parseInt((skillAtom.rit_band || '175-185').split('-')[0], 10) || 175,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: false,
        k2_appropriate: false,
    };
}

/**
 * Master dispatcher for all morphology atoms.
 * mkey is the sub-key extracted from the skill_id after 'reading_phonics_morphology_'.
 */
function _generateMorphologyQuestion(skillAtom, mkey, rng, mechanicHint) {
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    switch (widget) {
        case 'mc-text':     return _morphologyMcText(skillAtom, mkey, rng);
        case 'fib-auto':    return _morphologyFibAuto(skillAtom, mkey, rng);
        case 'dnd-linked':
            if (mechanic === 'match-pairs') return _morphologyMatchPairs(skillAtom, mkey, rng);
            return _morphologySortBins(skillAtom, mkey, rng);
        default:            return _morphologyMcText(skillAtom, mkey, rng);
    }
}

/**
 * Build a deck of `count` questions for a phonics SkillAtom, rotating
 * mechanics so no mechanic repeats within a 3-card window (Variety Rule §1).
 *
 * @param {object}  skillAtom
 * @param {number}  [count=10]
 * @param {object}  [options]
 * @returns {import('../../../../docs/literacy-quest/DATA_MODEL').Question[]}
 */
export function buildPhonicsDeck(skillAtom, count = 10, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    const available = Array.isArray(skillAtom.question_types) && skillAtom.question_types.length > 0
        ? skillAtom.question_types
        : ['mc-image'];

    const deck = [];
    const window3 = [];   // last 3 mechanics used (no-repeat window)

    for (let i = 0; i < count; i++) {
        const eligible = available.filter(m => !window3.includes(m));
        const pool = eligible.length > 0 ? eligible : available;
        const mechanic = pool[Math.floor(rng() * pool.length)];

        deck.push(generatePhonicsQuestion(skillAtom, mechanic, { ...options, rng }));

        window3.push(mechanic);
        if (window3.length > 3) window3.shift();
    }

    return deck;
}
