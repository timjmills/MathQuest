// gen-vocabulary.js — Question generator for the Vocabulary strand.
//
// Public API:
//   generateVocabularyQuestion(skillAtom, mechanicHint?, options?) → Question
//   buildVocabularyDeck(skillAtom, count?, options?)               → Question[]

// ─── Helpers ────────────────────────────────────────────────────────────────

function _qid(skillId, mechanic) {
    return `${skillId}_${mechanic}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function _shuffle(arr, rng = Math.random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function _pick(arr, rng = Math.random) {
    return arr[Math.floor(rng() * arr.length)];
}

function _comingSoon(skillAtom) {
    return {
        id: _qid(skillAtom.skill_id, 'comingsoon'),
        skill_ids: [skillAtom.skill_id],
        question_type: '__coming_soon__',
        skill_atom: skillAtom,
        rit_difficulty: 150,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: false,
        k2_appropriate: true,
    };
}

const STAGE1_FALLBACK = {
    'mc-image':  'mc-text',
    'mc-audio':  'mc-text',
    'tap-hotspot': 'mc-text',
    'dnd-linked': 'match-pairs',
    'sequence-events': 'mc-text',
    'hot-text-word': 'mc-text',
    'hot-text-sentence': 'mc-text',
};

function _pickMechanic(skillAtom, mechanicHint, rng) {
    const available = (skillAtom.question_types || ['mc-text']).slice();
    if (mechanicHint && available.includes(mechanicHint)) return mechanicHint;
    return _pick(available, rng);
}

// ─── Inline word banks ──────────────────────────────────────────────────────

// Simple K-1 synonyms (3-word groups: target + 2 synonyms)
const SIMPLE_SYNONYMS = [
    { target: 'big',    syns: ['large', 'huge'] },
    { target: 'small',  syns: ['little', 'tiny'] },
    { target: 'happy',  syns: ['glad', 'joyful'] },
    { target: 'sad',    syns: ['unhappy', 'gloomy'] },
    { target: 'fast',   syns: ['quick', 'swift'] },
    { target: 'slow',   syns: ['sluggish', 'lazy'] },
    { target: 'pretty', syns: ['lovely', 'beautiful'] },
    { target: 'mad',    syns: ['angry', 'furious'] },
    { target: 'shout',  syns: ['yell', 'holler'] },
    { target: 'said',   syns: ['told', 'spoke'] },
    { target: 'look',   syns: ['see', 'watch'] },
    { target: 'jump',   syns: ['leap', 'hop'] },
    { target: 'cold',   syns: ['chilly', 'icy'] },
    { target: 'hot',    syns: ['warm', 'boiling'] },
    { target: 'old',    syns: ['ancient', 'aged'] },
    { target: 'smart',  syns: ['clever', 'bright'] },
    { target: 'nice',   syns: ['kind', 'pleasant'] },
    { target: 'scared', syns: ['afraid', 'frightened'] },
];

// Grade 2-3 / advanced synonyms
const ADVANCED_SYNONYMS = [
    { target: 'enormous',    syns: ['gigantic', 'massive', 'huge'] },
    { target: 'furious',     syns: ['enraged', 'irate', 'angry'] },
    { target: 'curious',     syns: ['inquisitive', 'interested'] },
    { target: 'ancient',     syns: ['antique', 'old', 'historic'] },
    { target: 'assist',      syns: ['aid', 'support', 'help'] },
    { target: 'investigate', syns: ['examine', 'inspect', 'study'] },
    { target: 'observe',     syns: ['notice', 'watch', 'see'] },
    { target: 'analyze',     syns: ['examine', 'study', 'evaluate'] },
    { target: 'significant', syns: ['important', 'major'] },
    { target: 'sufficient',  syns: ['enough', 'adequate'] },
    { target: 'determine',   syns: ['decide', 'figure out'] },
    { target: 'evaluate',    syns: ['assess', 'judge'] },
    { target: 'whisper',     syns: ['murmur', 'mutter'] },
    { target: 'gleaming',    syns: ['shining', 'sparkling'] },
    { target: 'sturdy',      syns: ['strong', 'solid'] },
    { target: 'feeble',      syns: ['weak', 'frail'] },
    { target: 'jagged',      syns: ['rough', 'uneven'] },
    { target: 'delighted',   syns: ['pleased', 'happy'] },
    { target: 'terrified',   syns: ['scared', 'frightened'] },
    { target: 'frustrated',  syns: ['annoyed', 'irritated'] },
];

// Simple K-1 antonyms (paired opposites)
const SIMPLE_ANTONYMS = [
    ['hot', 'cold'],
    ['big', 'small'],
    ['happy', 'sad'],
    ['up', 'down'],
    ['fast', 'slow'],
    ['day', 'night'],
    ['in', 'out'],
    ['old', 'new'],
    ['open', 'closed'],
    ['light', 'dark'],
    ['high', 'low'],
    ['hard', 'soft'],
    ['wet', 'dry'],
    ['full', 'empty'],
    ['clean', 'dirty'],
    ['young', 'old'],
    ['near', 'far'],
    ['loud', 'quiet'],
    ['rich', 'poor'],
    ['stop', 'go'],
];

// Grade 2-3 antonyms
const ANTONYMS = [
    ['enormous', 'tiny'],
    ['furious', 'calm'],
    ['ancient', 'modern'],
    ['brave', 'cowardly'],
    ['generous', 'stingy'],
    ['rare', 'common'],
    ['obvious', 'hidden'],
    ['tame', 'wild'],
    ['precise', 'vague'],
    ['rigid', 'flexible'],
    ['humble', 'proud'],
    ['frequent', 'rare'],
    ['expand', 'shrink'],
    ['accept', 'reject'],
    ['arrive', 'depart'],
    ['allow', 'forbid'],
    ['begin', 'end'],
    ['gather', 'scatter'],
    ['attack', 'defend'],
    ['praise', 'criticize'],
];

// Grade 4-5 advanced antonyms
const ADVANCED_ANTONYMS = [
    ['benevolent', 'malevolent'],
    ['abundant',   'scarce'],
    ['transparent','opaque'],
    ['optimistic', 'pessimistic'],
    ['expand',     'contract'],
    ['humble',     'arrogant'],
    ['concise',    'wordy'],
    ['obscure',    'famous'],
    ['fragile',    'durable'],
    ['ascend',     'descend'],
    ['unite',      'divide'],
    ['acquire',    'lose'],
    ['ancient',    'contemporary'],
    ['decrease',   'increase'],
    ['conceal',    'reveal'],
    ['retreat',    'advance'],
];

// Analogy bank (A : B :: C : D) — relationship label for variety
const SIMPLE_ANALOGIES = [
    { a: 'hot',    b: 'cold',  c: 'day',    d: 'night',  type: 'antonym' },
    { a: 'big',    b: 'small', c: 'tall',   d: 'short',  type: 'antonym' },
    { a: 'puppy',  b: 'dog',   c: 'kitten', d: 'cat',    type: 'young-adult' },
    { a: 'calf',   b: 'cow',   c: 'foal',   d: 'horse',  type: 'young-adult' },
    { a: 'happy',  b: 'glad',  c: 'big',    d: 'large',  type: 'synonym' },
    { a: 'fast',   b: 'quick', c: 'small',  d: 'tiny',   type: 'synonym' },
    { a: 'apple',  b: 'fruit', c: 'carrot', d: 'vegetable', type: 'category' },
    { a: 'dog',    b: 'animal',c: 'rose',   d: 'flower', type: 'category' },
    { a: 'wing',   b: 'bird',  c: 'fin',    d: 'fish',   type: 'part-whole' },
    { a: 'wheel',  b: 'car',   c: 'leg',    d: 'table',  type: 'part-whole' },
    { a: 'bird',   b: 'sky',   c: 'fish',   d: 'water',  type: 'where-lives' },
    { a: 'teacher',b: 'school',c: 'doctor', d: 'hospital', type: 'where-works' },
];

const ADVANCED_ANALOGIES = [
    { a: 'author',  b: 'book',     c: 'composer',  d: 'symphony', type: 'creator-creation' },
    { a: 'painter', b: 'painting', c: 'sculptor',  d: 'statue',   type: 'creator-creation' },
    { a: 'thirsty', b: 'drink',    c: 'tired',     d: 'sleep',    type: 'cause-solution' },
    { a: 'hungry',  b: 'eat',      c: 'cold',      d: 'warm',     type: 'cause-solution' },
    { a: 'whisper', b: 'shout',    c: 'glance',    d: 'stare',    type: 'degree' },
    { a: 'warm',    b: 'hot',      c: 'cool',      d: 'cold',     type: 'degree' },
    { a: 'petal',   b: 'flower',   c: 'page',      d: 'book',     type: 'part-whole' },
    { a: 'verse',   b: 'poem',     c: 'chapter',   d: 'novel',    type: 'part-whole' },
    { a: 'predator',b: 'prey',     c: 'hunter',    d: 'quarry',   type: 'function' },
    { a: 'pen',     b: 'write',    c: 'scissors',  d: 'cut',      type: 'tool-function' },
    { a: 'thermometer', b: 'temperature', c: 'scale', d: 'weight', type: 'tool-measure' },
    { a: 'dictionary', b: 'words', c: 'atlas',     d: 'maps',     type: 'reference-content' },
];

// Prefix banks
const PREFIX_BANK_BASIC = [
    { prefix: 'un-',  meaning: 'not / opposite of', examples: ['unhappy', 'unfair', 'unlock', 'unkind'] },
    { prefix: 're-',  meaning: 'again / back',      examples: ['rewrite', 'redo', 'replay', 'return'] },
    { prefix: 'pre-', meaning: 'before',            examples: ['preview', 'preheat', 'preschool', 'pretest'] },
];

const PREFIX_BANK_INTERMEDIATE = [
    { prefix: 'dis-', meaning: 'not / opposite of', examples: ['dislike', 'disagree', 'disappear', 'dishonest'] },
    { prefix: 'pre-', meaning: 'before',            examples: ['preview', 'preheat', 'pregame', 'precaution'] },
    { prefix: 'mis-', meaning: 'wrongly / badly',   examples: ['misbehave', 'misspell', 'misplace', 'misunderstand'] },
];

const PREFIX_BANK_ADVANCED = [
    { prefix: 'sub-',   meaning: 'under / below',      examples: ['submarine', 'subway', 'subzero', 'subtitle'] },
    { prefix: 'super-', meaning: 'above / more than',  examples: ['supermarket', 'superhero', 'superhuman', 'supernatural'] },
    { prefix: 'inter-', meaning: 'between / among',    examples: ['international', 'interact', 'intersect', 'interstate'] },
];

// Suffix banks
const SUFFIX_BANK_COMP = [
    { suffix: '-er',   meaning: 'more',         examples: ['taller', 'faster', 'smaller', 'kinder'] },
    { suffix: '-est',  meaning: 'most',         examples: ['tallest', 'fastest', 'smallest', 'kindest'] },
];

const SUFFIX_BANK_FULL = [
    { suffix: '-er',   meaning: 'more',                 examples: ['taller', 'kinder', 'faster'] },
    { suffix: '-est',  meaning: 'most',                 examples: ['tallest', 'kindest', 'fastest'] },
    { suffix: '-ly',   meaning: 'in the manner of',     examples: ['quickly', 'slowly', 'kindly', 'softly'] },
    { suffix: '-ful',  meaning: 'full of',              examples: ['joyful', 'helpful', 'careful', 'hopeful'] },
    { suffix: '-less', meaning: 'without',              examples: ['hopeless', 'careless', 'fearless', 'helpless'] },
];

// Homophones — basic (their/there/they're)
const HOMOPHONES_BASIC = [
    {
        sentence: "I left my book over {{slot:0}} on the table.",
        slot: { id: 'slot:0', options: ['there', 'their', "they're"], correct: 'there' },
        hint: "'there' means a place — it has the word 'here' inside it.",
    },
    {
        sentence: "The students grabbed {{slot:0}} backpacks.",
        slot: { id: 'slot:0', options: ['there', 'their', "they're"], correct: 'their' },
        hint: "'their' shows ownership (the backpacks belong to them).",
    },
    {
        sentence: "{{slot:0}} going to the park later.",
        slot: { id: 'slot:0', options: ['There', 'Their', "They're"], correct: "They're" },
        hint: "'they're' is short for 'they are'.",
    },
    {
        sentence: "Look over {{slot:0}} at the rainbow!",
        slot: { id: 'slot:0', options: ['there', 'their', "they're"], correct: 'there' },
        hint: "'there' is for places.",
    },
    {
        sentence: "The kids cleaned {{slot:0}} room together.",
        slot: { id: 'slot:0', options: ['there', 'their', "they're"], correct: 'their' },
        hint: "'their' shows the room belongs to them.",
    },
    {
        sentence: "I think {{slot:0}} my best friends.",
        slot: { id: 'slot:0', options: ['there', 'their', "they're"], correct: "they're" },
        hint: "'they're' = they are.",
    },
];

// Homophones — grade 3 (your/you're, its/it's, to/too/two)
const HOMOPHONES_G3 = [
    {
        sentence: "Is this {{slot:0}} jacket?",
        slot: { id: 'slot:0', options: ['your', "you're"], correct: 'your' },
        hint: "'your' shows the jacket belongs to you.",
    },
    {
        sentence: "{{slot:0}} going to love this story.",
        slot: { id: 'slot:0', options: ['Your', "You're"], correct: "You're" },
        hint: "'you're' = you are.",
    },
    {
        sentence: "The dog wagged {{slot:0}} tail.",
        slot: { id: 'slot:0', options: ["it's", 'its'], correct: 'its' },
        hint: "'its' (no apostrophe) shows possession.",
    },
    {
        sentence: "{{slot:0}} a sunny day today.",
        slot: { id: 'slot:0', options: ["It's", 'Its'], correct: "It's" },
        hint: "'it's' = it is.",
    },
    {
        sentence: "We are going {{slot:0}} the museum.",
        slot: { id: 'slot:0', options: ['to', 'too', 'two'], correct: 'to' },
        hint: "'to' shows direction or destination.",
    },
    {
        sentence: "I want some ice cream {{slot:0}}.",
        slot: { id: 'slot:0', options: ['to', 'too', 'two'], correct: 'too' },
        hint: "'too' means 'also' or 'as well'.",
    },
    {
        sentence: "I have {{slot:0}} brothers.",
        slot: { id: 'slot:0', options: ['to', 'too', 'two'], correct: 'two' },
        hint: "'two' is the number 2.",
    },
];

// Multiple-meaning words (basic K-2)
const MULTI_MEANING_BASIC = [
    {
        word: 'bat',
        sentence: "The boy swung the bat and hit the ball.",
        correct: 'a stick used in sports',
        distractors: ['a flying animal', 'a kind of fruit', 'a body of water'],
    },
    {
        word: 'bat',
        sentence: "The bat flew out of the cave at night.",
        correct: 'a flying animal',
        distractors: ['a stick used in sports', 'a kind of hat', 'a paper bag'],
    },
    {
        word: 'run',
        sentence: "I run to the bus every morning.",
        correct: 'to move quickly on foot',
        distractors: ['a small river', 'a tear in cloth', 'a long line'],
    },
    {
        word: 'well',
        sentence: "We pulled water up from the deep well.",
        correct: 'a deep hole that holds water',
        distractors: ['feeling healthy', 'in a good way', 'a tall tree'],
    },
    {
        word: 'can',
        sentence: "I can jump very high.",
        correct: 'is able to',
        distractors: ['a metal container', 'a kind of fish', 'a small boat'],
    },
    {
        word: 'ball',
        sentence: "She caught the ball with one hand.",
        correct: 'a round toy you play with',
        distractors: ['a fancy dance party', 'a small lake', 'a kind of rope'],
    },
];

// Multiple-meaning words (grade 3-4)
const MULTI_MEANING = [
    {
        word: 'bank',
        sentence: "We sat on the bank and watched the river flow.",
        correct: 'the side of a river',
        distractors: ['a place that holds money', 'a row of seats', 'a pile of snow'],
    },
    {
        word: 'bank',
        sentence: "Mom went to the bank to deposit her paycheck.",
        correct: 'a place that holds money',
        distractors: ['the side of a river', 'a long shelf', 'a kind of bird'],
    },
    {
        word: 'bark',
        sentence: "The bark of the old oak tree was rough and gray.",
        correct: 'the tough outer cover of a tree',
        distractors: ['the loud sound a dog makes', 'a small boat', 'a type of song'],
    },
    {
        word: 'bark',
        sentence: "The puppy began to bark at the mailman.",
        correct: 'the loud sound a dog makes',
        distractors: ['the outer cover of a tree', 'a kind of fish', 'a type of cloth'],
    },
    {
        word: 'pitch',
        sentence: "The pitcher threw a fast pitch over home plate.",
        correct: 'a thrown ball in baseball',
        distractors: ['the highness of a sound', 'sticky black tar', 'a sales talk'],
    },
    {
        word: 'fair',
        sentence: "The teacher tried to be fair to every student.",
        correct: 'just and equal',
        distractors: ['light in color', 'a fun event with rides', 'pleasant weather'],
    },
    {
        word: 'spring',
        sentence: "Flowers begin to bloom in the spring.",
        correct: 'a season of the year',
        distractors: ['a coiled metal piece', 'to jump up suddenly', 'a small stream'],
    },
];

// Idioms (figurative language)
const IDIOMS = [
    { idiom: 'piece of cake',           meaning: 'something very easy' },
    { idiom: 'under the weather',       meaning: 'feeling sick' },
    { idiom: 'hit the books',           meaning: 'to study hard' },
    { idiom: 'break a leg',             meaning: 'good luck' },
    { idiom: 'spill the beans',         meaning: 'to reveal a secret' },
    { idiom: 'cost an arm and a leg',   meaning: 'very expensive' },
    { idiom: 'let the cat out of the bag', meaning: 'to give away a secret' },
    { idiom: 'in hot water',            meaning: 'in trouble' },
    { idiom: 'hit the nail on the head',meaning: 'to be exactly right' },
    { idiom: 'once in a blue moon',     meaning: 'very rarely' },
    { idiom: 'on cloud nine',           meaning: 'extremely happy' },
    { idiom: 'a bookworm',              meaning: 'someone who loves to read' },
];

// ─── Question builders ──────────────────────────────────────────────────────

function _mcOpts(correct, distractors, rng) {
    const labels = _shuffle([correct, ...distractors], rng);
    const opts = labels.map((label, i) => ({
        id: String.fromCharCode(97 + i),
        label,
    }));
    const ans = opts.find(o => o.label === correct).id;
    return { opts, ans };
}

function _synonymMc(skillAtom, bank, rng) {
    const entry = _pick(bank, rng);
    const correct = _pick(entry.syns, rng);
    // Pull distractors from other bank entries (not synonyms of target)
    const otherWords = [];
    for (const e of bank) {
        if (e === entry) continue;
        for (const w of [e.target, ...e.syns]) {
            if (w !== entry.target && !entry.syns.includes(w) && !otherWords.includes(w)) {
                otherWords.push(w);
            }
        }
    }
    const distractors = _shuffle(otherWords, rng).slice(0, 3);
    const { opts, ans } = _mcOpts(correct, distractors, rng);

    return {
        id: _qid(skillAtom.skill_id, 'syn'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `Which word means about the SAME as "${entry.target}"?`,
        options: opts,
        ans,
        correct_answer: ans,
        distractor_misconceptions: {},
        hints: [
            `Synonyms have similar meanings.`,
            `Think: "${entry.target}" is like ___?`,
            `One synonym for "${entry.target}" is "${correct}".`,
        ],
        rit_difficulty: 175,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: skillAtom.developmental_band === 'K-1',
    };
}

function _antonymMc(skillAtom, bank, rng) {
    const pair = _pick(bank, rng);
    // pair could be [a, b]
    const flip = rng() < 0.5;
    const targetWord = flip ? pair[0] : pair[1];
    const correct    = flip ? pair[1] : pair[0];

    // Distractors: other words from the bank that are NOT antonyms of target
    const others = [];
    for (const p of bank) {
        if (p === pair) continue;
        for (const w of p) {
            if (w !== targetWord && w !== correct && !others.includes(w)) {
                others.push(w);
            }
        }
    }
    const distractors = _shuffle(others, rng).slice(0, 3);
    const { opts, ans } = _mcOpts(correct, distractors, rng);

    return {
        id: _qid(skillAtom.skill_id, 'ant'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `Which word means the OPPOSITE of "${targetWord}"?`,
        options: opts,
        ans,
        correct_answer: ans,
        distractor_misconceptions: {},
        hints: [
            `Antonyms are opposites.`,
            `Think: what is the opposite of "${targetWord}"?`,
            `The opposite of "${targetWord}" is "${correct}".`,
        ],
        rit_difficulty: 175,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: skillAtom.developmental_band === 'K-1',
    };
}

function _synonymMatchPairs(skillAtom, bank, rng) {
    const entries = _shuffle(bank, rng).slice(0, 4);
    const left  = entries.map((e, i) => ({ id: `L${i}`, label: e.target }));
    const right = entries.map((e, i) => ({ id: `R${i}`, label: e.syns[0] }));
    // Shuffle right-column order for visual challenge
    const rShuffled = _shuffle(right, rng);
    const pairs = entries.map((e, i) => {
        const r = rShuffled.find(rr => rr.label === e.syns[0]);
        return [`L${i}`, r.id];
    });

    return {
        id: _qid(skillAtom.skill_id, 'mp'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'match-pairs',
        skill_atom: skillAtom,
        task_text: 'Match each word to its synonym.',
        left_column: left,
        right_column: rShuffled,
        pairs,
        ans: pairs,
        correct_answer: pairs,
        hints: ['Synonyms have similar meanings.'],
        rit_difficulty: 178,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: skillAtom.developmental_band === 'K-1',
    };
}

function _analogyMc(skillAtom, bank, rng) {
    const entry = _pick(bank, rng);
    const correct = entry.d;

    // Distractors: pull D-words from other entries
    const others = bank
        .filter(e => e !== entry)
        .map(e => e.d)
        .filter(w => w !== correct);
    const distractors = _shuffle(others, rng).slice(0, 3);
    const { opts, ans } = _mcOpts(correct, distractors, rng);

    return {
        id: _qid(skillAtom.skill_id, 'analogy'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `${entry.a} is to ${entry.b} as ${entry.c} is to ___?`,
        options: opts,
        ans,
        correct_answer: ans,
        distractor_misconceptions: {},
        hints: [
            `Figure out how the first pair is related.`,
            `Relationship: ${entry.type}.`,
            `The answer is "${correct}".`,
        ],
        rit_difficulty: 188,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: false,
    };
}

function _prefixMeaningMc(skillAtom, bank, rng) {
    const entry = _pick(bank, rng);
    const correct = entry.meaning;
    const others = bank.filter(e => e !== entry).map(e => e.meaning);
    // pad with stock distractors if needed
    const stock = ['after', 'inside', 'around', 'big', 'small'];
    let pool = [...others];
    for (const s of stock) {
        if (pool.length >= 3) break;
        if (!pool.includes(s) && s !== correct) pool.push(s);
    }
    const distractors = _shuffle(pool, rng).slice(0, 3);
    const { opts, ans } = _mcOpts(correct, distractors, rng);

    const example = _pick(entry.examples, rng);

    return {
        id: _qid(skillAtom.skill_id, 'prefix'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `What does the prefix "${entry.prefix}" mean?\n\nExample: ${example}`,
        options: opts,
        ans,
        correct_answer: ans,
        distractor_misconceptions: {},
        hints: [
            `A prefix is added to the start of a word.`,
            `Think about what "${example}" means.`,
            `"${entry.prefix}" means "${entry.meaning}".`,
        ],
        rit_difficulty: 185,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: false,
    };
}

function _suffixMeaningMc(skillAtom, bank, rng) {
    const entry = _pick(bank, rng);
    const correct = entry.meaning;
    const others = bank.filter(e => e !== entry).map(e => e.meaning);
    const stock = ['before', 'not', 'inside', 'around'];
    let pool = [...others];
    for (const s of stock) {
        if (pool.length >= 3) break;
        if (!pool.includes(s) && s !== correct) pool.push(s);
    }
    const distractors = _shuffle(pool, rng).slice(0, 3);
    const { opts, ans } = _mcOpts(correct, distractors, rng);

    const example = _pick(entry.examples, rng);
    return {
        id: _qid(skillAtom.skill_id, 'suffix'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `What does the suffix "${entry.suffix}" mean?\n\nExample: ${example}`,
        options: opts,
        ans,
        correct_answer: ans,
        distractor_misconceptions: {},
        hints: [
            `A suffix is added to the end of a word.`,
            `Think about what "${example}" means.`,
            `"${entry.suffix}" means "${entry.meaning}".`,
        ],
        rit_difficulty: 185,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: false,
    };
}

function _homophoneDropdown(skillAtom, bank, rng) {
    const entry = _pick(bank, rng);
    return {
        id: _qid(skillAtom.skill_id, 'homo'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'drop-down-inline',
        skill_atom: skillAtom,
        stem: entry.sentence,
        task_text: 'Choose the correct word for the blank.',
        slots: [{
            id: entry.slot.id,
            options: entry.slot.options,
            correct: entry.slot.correct,
        }],
        ans: { [entry.slot.id]: entry.slot.correct },
        correct_answer: { [entry.slot.id]: entry.slot.correct },
        hints: [
            `Read the whole sentence.`,
            entry.hint,
            `The answer is "${entry.slot.correct}".`,
        ],
        rit_difficulty: 175,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: false,
    };
}

function _multipleMeaningMc(skillAtom, bank, rng) {
    const entry = _pick(bank, rng);
    const { opts, ans } = _mcOpts(entry.correct, entry.distractors.slice(0, 3), rng);

    return {
        id: _qid(skillAtom.skill_id, 'mm'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `Read this sentence:\n\n"${entry.sentence}"\n\nWhat does the word "${entry.word}" mean here?`,
        options: opts,
        ans,
        correct_answer: ans,
        distractor_misconceptions: {},
        hints: [
            `Use the other words in the sentence as clues.`,
            `Substitute each meaning into the sentence — which one fits?`,
            `Here, "${entry.word}" means: "${entry.correct}".`,
        ],
        rit_difficulty: 188,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: skillAtom.developmental_band === 'K-1',
    };
}

function _idiomMc(skillAtom, bank, rng) {
    const entry = _pick(bank, rng);
    const others = bank.filter(e => e !== entry).map(e => e.meaning);
    const distractors = _shuffle(others, rng).slice(0, 3);
    const { opts, ans } = _mcOpts(entry.meaning, distractors, rng);

    return {
        id: _qid(skillAtom.skill_id, 'idiom'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `What does the idiom "${entry.idiom}" mean?`,
        options: opts,
        ans,
        correct_answer: ans,
        distractor_misconceptions: {},
        hints: [
            `Idioms don't mean what they say literally.`,
            `Think about the figurative meaning.`,
            `"${entry.idiom}" means: "${entry.meaning}".`,
        ],
        rit_difficulty: 195,
        grade_level: skillAtom.developmental_band || '4-5+',
        has_audio: true,
        k2_appropriate: false,
    };
}

function _idiomMatchPairs(skillAtom, bank, rng) {
    const entries = _shuffle(bank, rng).slice(0, 4);
    const left  = entries.map((e, i) => ({ id: `L${i}`, label: e.idiom }));
    const right = entries.map((e, i) => ({ id: `R${i}`, label: e.meaning }));
    const rShuffled = _shuffle(right, rng);
    const pairs = entries.map((e, i) => {
        const r = rShuffled.find(rr => rr.label === e.meaning);
        return [`L${i}`, r.id];
    });

    return {
        id: _qid(skillAtom.skill_id, 'idiom-mp'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'match-pairs',
        skill_atom: skillAtom,
        task_text: 'Match each idiom to its meaning.',
        left_column: left,
        right_column: rShuffled,
        pairs,
        ans: pairs,
        correct_answer: pairs,
        hints: ['Idioms have figurative meanings, not literal ones.'],
        rit_difficulty: 198,
        grade_level: skillAtom.developmental_band || '4-5+',
        has_audio: true,
        k2_appropriate: false,
    };
}

// Synonym sort-into-bins: sort words into 2-3 synonym groups
function _synonymSortBins(skillAtom, bank, rng) {
    const groups = _shuffle(bank, rng).slice(0, 3);
    const bins = groups.map((g, i) => ({
        id: `bin_${i}`,
        label: `like "${g.target}"`,
    }));
    const items = [];
    let idx = 0;
    groups.forEach((g, gi) => {
        // pick 2 syns per group
        const syns = _shuffle(g.syns, rng).slice(0, 2);
        for (const s of syns) {
            items.push({
                id: `it_${idx++}`,
                label: s,
                correct_bin: `bin_${gi}`,
            });
        }
    });
    return {
        id: _qid(skillAtom.skill_id, 'sort'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'sort-into-bins',
        skill_atom: skillAtom,
        task_text: 'Sort each word into the bin with its synonym.',
        items: _shuffle(items, rng),
        bins,
        ans: items.reduce((m, it) => { m[it.id] = it.correct_bin; return m; }, {}),
        correct_answer: items.reduce((m, it) => { m[it.id] = it.correct_bin; return m; }, {}),
        hints: ['Words in the same bin have similar meanings.'],
        rit_difficulty: 180,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: skillAtom.developmental_band === 'K-1',
    };
}

// ─── Skill router ───────────────────────────────────────────────────────────

function _generateForSkill(skillAtom, mechanic, rng) {
    const id = skillAtom.skill_id;

    switch (id) {
        // SYNONYMS
        case 'reading_vocab_synonym':
        case 'reading_vocab_advanced_synonyms': {
            const bank = id === 'reading_vocab_synonym' ? SIMPLE_SYNONYMS : ADVANCED_SYNONYMS;
            if (mechanic === 'match-pairs') return _synonymMatchPairs(skillAtom, bank, rng);
            if (mechanic === 'sort-into-bins') return _synonymSortBins(skillAtom, bank, rng);
            return _synonymMc(skillAtom, bank, rng);
        }
        case 'reading_vocab_simple_synonyms': {
            if (mechanic === 'match-pairs') return _synonymMatchPairs(skillAtom, SIMPLE_SYNONYMS, rng);
            return _synonymMc(skillAtom, SIMPLE_SYNONYMS, rng);
        }

        // ANTONYMS
        case 'reading_vocab_antonym':
            return _antonymMc(skillAtom, ANTONYMS, rng);
        case 'reading_vocab_simple_antonyms':
            return _antonymMc(skillAtom, SIMPLE_ANTONYMS, rng);
        case 'reading_vocab_advanced_antonyms':
            return _antonymMc(skillAtom, ADVANCED_ANTONYMS, rng);

        // ANALOGIES
        case 'reading_vocab_simple_analogies':
            return _analogyMc(skillAtom, SIMPLE_ANALOGIES, rng);
        case 'reading_vocab_advanced_analogies':
            return _analogyMc(skillAtom, ADVANCED_ANALOGIES, rng);

        // PREFIXES
        case 'reading_vocab_prefix_un_re_pre':
            return _prefixMeaningMc(skillAtom, PREFIX_BANK_BASIC, rng);
        case 'reading_vocab_prefix_dis_pre_mis':
            return _prefixMeaningMc(skillAtom, PREFIX_BANK_INTERMEDIATE, rng);
        case 'reading_vocab_prefix_sub_super_inter':
            return _prefixMeaningMc(skillAtom, PREFIX_BANK_ADVANCED, rng);

        // SUFFIXES
        case 'reading_vocab_suffix_er_est_ly':
            return _suffixMeaningMc(skillAtom, SUFFIX_BANK_FULL, rng);
        case 'reading_vocab_suffix_er_est':
            return _suffixMeaningMc(skillAtom, SUFFIX_BANK_COMP, rng);

        // HOMOPHONES
        case 'reading_vocab_homophones_basic':
            return _homophoneDropdown(skillAtom, HOMOPHONES_BASIC, rng);
        case 'reading_vocab_homophones_grade3':
            return _homophoneDropdown(skillAtom, HOMOPHONES_G3, rng);

        // MULTIPLE-MEANING
        case 'reading_vocab_multiple_meaning_basic':
            return _multipleMeaningMc(skillAtom, MULTI_MEANING_BASIC, rng);
        case 'reading_vocab_multiple_meaning':
            return _multipleMeaningMc(skillAtom, MULTI_MEANING, rng);

        // IDIOMS
        case 'reading_vocab_figurative_idioms': {
            if (mechanic === 'match-pairs') return _idiomMatchPairs(skillAtom, IDIOMS, rng);
            return _idiomMc(skillAtom, IDIOMS, rng);
        }
    }

    return _comingSoon(skillAtom);
}

// ─── Public API ─────────────────────────────────────────────────────────────

import { adaptMechanic } from './_mechanic-adapter.js';

export function generateVocabularyQuestion(skillAtom, mechanicHint = null, options = {}) {
    if (!skillAtom) return null;
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;
    const q = _generateForSkill(skillAtom, widget, rng);
    return adaptMechanic(q, mechanic);
}

export function buildVocabularyDeck(skillAtom, count = 10, options = {}) {
    if (!skillAtom) return [];
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    const available = (skillAtom.question_types || ['mc-text']).slice();
    const window3 = [];
    const deck = [];
    for (let i = 0; i < count; i++) {
        const eligible = available.filter(m => !window3.includes(m));
        const pool = eligible.length > 0 ? eligible : available;
        const mechanic = _pick(pool, rng);
        deck.push(generateVocabularyQuestion(skillAtom, mechanic, { rng }));
        window3.push(mechanic);
        if (window3.length > 3) window3.shift();
    }
    return deck;
}

export default { generateVocabularyQuestion, buildVocabularyDeck };
