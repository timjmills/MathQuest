// gen-grammar.js — Question generator for the Grammar strand.

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
        rit_difficulty: 175,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: false,
        k2_appropriate: false,
    };
}

const STAGE1_FALLBACK = {
    'mc-multi-select':  'mc-text',
    'sentence-build':   'mc-text',
};

function _pickMechanic(skillAtom, mechanicHint, rng, allowed) {
    const available = (skillAtom.question_types || ['mc-text'])
        .filter(m => !allowed || allowed.includes(m));
    if (available.length === 0) return (skillAtom.question_types || ['mc-text'])[0];
    if (mechanicHint && available.includes(mechanicHint)) return mechanicHint;
    return _pick(available, rng);
}

function _isK2(skillAtom) {
    const band = String(skillAtom.developmental_band || '');
    return /K|^K-1|^1-2/.test(band);
}

// ─── Sentence corpus ────────────────────────────────────────────────────────
//
// Each sentence has tokens tagged. Tags: noun, propnoun, pronoun, verb,
// adjective, adverb, article, preposition, conjunction.
// Used by word-tagger / tap-hotspot to identify a target word.

const SENTENCES = [
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'big', tag: 'adjective' },
        { word: 'cat', tag: 'noun' },
        { word: 'sleeps', tag: 'verb' },
        { word: 'quietly', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'Maria', tag: 'propnoun' },
        { word: 'reads', tag: 'verb' },
        { word: 'an', tag: 'article' },
        { word: 'old', tag: 'adjective' },
        { word: 'book', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'A', tag: 'article' },
        { word: 'small', tag: 'adjective' },
        { word: 'dog', tag: 'noun' },
        { word: 'barks', tag: 'verb' },
        { word: 'loudly', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'My', tag: 'pronoun' },
        { word: 'sister', tag: 'noun' },
        { word: 'sings', tag: 'verb' },
        { word: 'happy', tag: 'adjective' },
        { word: 'songs', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'children', tag: 'noun' },
        { word: 'play', tag: 'verb' },
        { word: 'in', tag: 'preposition' },
        { word: 'the', tag: 'article' },
        { word: 'park', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'James', tag: 'propnoun' },
        { word: 'eats', tag: 'verb' },
        { word: 'a', tag: 'article' },
        { word: 'red', tag: 'adjective' },
        { word: 'apple', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'A', tag: 'article' },
        { word: 'tall', tag: 'adjective' },
        { word: 'tree', tag: 'noun' },
        { word: 'grows', tag: 'verb' },
        { word: 'slowly', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'tired', tag: 'adjective' },
        { word: 'baby', tag: 'noun' },
        { word: 'cries', tag: 'verb' },
        { word: 'softly', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'My', tag: 'pronoun' },
        { word: 'friend', tag: 'noun' },
        { word: 'rides', tag: 'verb' },
        { word: 'a', tag: 'article' },
        { word: 'fast', tag: 'adjective' },
        { word: 'bike', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'cold', tag: 'adjective' },
        { word: 'wind', tag: 'noun' },
        { word: 'blows', tag: 'verb' },
        { word: 'fiercely', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'Her', tag: 'pronoun' },
        { word: 'brother', tag: 'noun' },
        { word: 'walks', tag: 'verb' },
        { word: 'slowly', tag: 'adverb' },
        { word: 'home', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'Sara', tag: 'propnoun' },
        { word: 'gives', tag: 'verb' },
        { word: 'a', tag: 'article' },
        { word: 'gift', tag: 'noun' },
        { word: 'to', tag: 'preposition' },
        { word: 'her', tag: 'pronoun' },
        { word: 'mom', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'A', tag: 'article' },
        { word: 'brave', tag: 'adjective' },
        { word: 'firefighter', tag: 'noun' },
        { word: 'climbs', tag: 'verb' },
        { word: 'quickly', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'bright', tag: 'adjective' },
        { word: 'sun', tag: 'noun' },
        { word: 'shines', tag: 'verb' },
        { word: 'today', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'Our', tag: 'pronoun' },
        { word: 'teacher', tag: 'noun' },
        { word: 'speaks', tag: 'verb' },
        { word: 'kindly', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'A', tag: 'article' },
        { word: 'tiny', tag: 'adjective' },
        { word: 'mouse', tag: 'noun' },
        { word: 'runs', tag: 'verb' },
        { word: 'under', tag: 'preposition' },
        { word: 'the', tag: 'article' },
        { word: 'table', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'happy', tag: 'adjective' },
        { word: 'puppy', tag: 'noun' },
        { word: 'jumps', tag: 'verb' },
        { word: 'high', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'A', tag: 'article' },
        { word: 'kind', tag: 'adjective' },
        { word: 'doctor', tag: 'noun' },
        { word: 'helps', tag: 'verb' },
        { word: 'sick', tag: 'adjective' },
        { word: 'people', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'students', tag: 'noun' },
        { word: 'study', tag: 'verb' },
        { word: 'hard', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'Tom', tag: 'propnoun' },
        { word: 'plays', tag: 'verb' },
        { word: 'with', tag: 'preposition' },
        { word: 'his', tag: 'pronoun' },
        { word: 'new', tag: 'adjective' },
        { word: 'puzzle', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'A', tag: 'article' },
        { word: 'noisy', tag: 'adjective' },
        { word: 'crow', tag: 'noun' },
        { word: 'caws', tag: 'verb' },
        { word: 'every', tag: 'adjective' },
        { word: 'morning', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'My', tag: 'pronoun' },
        { word: 'cousin', tag: 'noun' },
        { word: 'arrives', tag: 'verb' },
        { word: 'tomorrow', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'fast', tag: 'adjective' },
        { word: 'rabbit', tag: 'noun' },
        { word: 'hops', tag: 'verb' },
        { word: 'over', tag: 'preposition' },
        { word: 'the', tag: 'article' },
        { word: 'log', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'Anna', tag: 'propnoun' },
        { word: 'paints', tag: 'verb' },
        { word: 'a', tag: 'article' },
        { word: 'beautiful', tag: 'adjective' },
        { word: 'picture', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'storm', tag: 'noun' },
        { word: 'arrived', tag: 'verb' },
        { word: 'suddenly', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'A', tag: 'article' },
        { word: 'wise', tag: 'adjective' },
        { word: 'owl', tag: 'noun' },
        { word: 'watches', tag: 'verb' },
        { word: 'silently', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'baker', tag: 'noun' },
        { word: 'made', tag: 'verb' },
        { word: 'fresh', tag: 'adjective' },
        { word: 'bread', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'Lisa', tag: 'propnoun' },
        { word: 'reads', tag: 'verb' },
        { word: 'a', tag: 'article' },
        { word: 'long', tag: 'adjective' },
        { word: 'story', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'Their', tag: 'pronoun' },
        { word: 'team', tag: 'noun' },
        { word: 'wins', tag: 'verb' },
        { word: 'often', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'A', tag: 'article' },
        { word: 'young', tag: 'adjective' },
        { word: 'farmer', tag: 'noun' },
        { word: 'plants', tag: 'verb' },
        { word: 'green', tag: 'adjective' },
        { word: 'beans', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'cheerful', tag: 'adjective' },
        { word: 'clown', tag: 'noun' },
        { word: 'laughs', tag: 'verb' },
        { word: 'loudly', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'A', tag: 'article' },
        { word: 'gentle', tag: 'adjective' },
        { word: 'breeze', tag: 'noun' },
        { word: 'cooled', tag: 'verb' },
        { word: 'the', tag: 'article' },
        { word: 'room', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'My', tag: 'pronoun' },
        { word: 'uncle', tag: 'noun' },
        { word: 'drives', tag: 'verb' },
        { word: 'carefully', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'eager', tag: 'adjective' },
        { word: 'puppy', tag: 'noun' },
        { word: 'wags', tag: 'verb' },
        { word: 'its', tag: 'pronoun' },
        { word: 'tail', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'A', tag: 'article' },
        { word: 'shiny', tag: 'adjective' },
        { word: 'coin', tag: 'noun' },
        { word: 'sparkled', tag: 'verb' },
        { word: 'on', tag: 'preposition' },
        { word: 'the', tag: 'article' },
        { word: 'floor', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'tall', tag: 'adjective' },
        { word: 'giraffe', tag: 'noun' },
        { word: 'eats', tag: 'verb' },
        { word: 'leaves', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'Ben', tag: 'propnoun' },
        { word: 'wrote', tag: 'verb' },
        { word: 'a', tag: 'article' },
        { word: 'short', tag: 'adjective' },
        { word: 'note', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'A', tag: 'article' },
        { word: 'curious', tag: 'adjective' },
        { word: 'kitten', tag: 'noun' },
        { word: 'climbs', tag: 'verb' },
        { word: 'a', tag: 'article' },
        { word: 'fence', tag: 'noun' },
    ] },
    { tokens: [
        { word: 'The', tag: 'article' },
        { word: 'students', tag: 'noun' },
        { word: 'spoke', tag: 'verb' },
        { word: 'politely', tag: 'adverb' },
    ] },
    { tokens: [
        { word: 'Our', tag: 'pronoun' },
        { word: 'school', tag: 'noun' },
        { word: 'has', tag: 'verb' },
        { word: 'a', tag: 'article' },
        { word: 'large', tag: 'adjective' },
        { word: 'library', tag: 'noun' },
    ] },
];

function _sentencesWithTag(tag) {
    return SENTENCES.filter(s => s.tokens.some(t => t.tag === tag));
}

// Render token list back into "The big cat sleeps quietly." style.
function _sentenceText(sent) {
    return sent.tokens.map(t => t.word).join(' ');
}

// ─── Word banks for grammar generators ──────────────────────────────────────

const COMMON_NOUNS = ['cat', 'book', 'table', 'school', 'apple', 'river', 'teacher', 'park', 'shoe', 'cup', 'street', 'child', 'pencil', 'window', 'song'];
const PROPER_NOUNS = ['Maria', 'Tokyo', 'Egypt', 'Monday', 'Saturn', 'Sara', 'James', 'Brazil', 'July', 'Africa', 'Kevin', 'Anna', 'Boston', 'Ben', 'April'];

const CONCRETE_NOUNS = ['rock', 'apple', 'chair', 'dog', 'bicycle', 'pencil', 'sandwich', 'tree'];
const ABSTRACT_NOUNS = ['freedom', 'love', 'bravery', 'happiness', 'truth', 'kindness', 'fear', 'peace'];

const COLLECTIVE_PAIRS = [
    { collective: 'flock',  members: 'birds' },
    { collective: 'team',   members: 'players' },
    { collective: 'herd',   members: 'cattle' },
    { collective: 'choir',  members: 'singers' },
    { collective: 'jury',   members: 'jurors' },
    { collective: 'swarm',  members: 'bees' },
    { collective: 'pack',   members: 'wolves' },
    { collective: 'bunch',  members: 'grapes' },
    { collective: 'crew',   members: 'sailors' },
    { collective: 'class',  members: 'students' },
];

const COMPOUND_NOUNS = [
    { left: 'note', right: 'book',   compound: 'notebook' },
    { left: 'rain', right: 'bow',    compound: 'rainbow' },
    { left: 'sun',  right: 'flower', compound: 'sunflower' },
    { left: 'foot', right: 'ball',   compound: 'football' },
    { left: 'tooth',right: 'brush',  compound: 'toothbrush' },
    { left: 'snow', right: 'man',    compound: 'snowman' },
    { left: 'star', right: 'fish',   compound: 'starfish' },
    { left: 'butter', right: 'fly',  compound: 'butterfly' },
    { left: 'fire', right: 'place',  compound: 'fireplace' },
    { left: 'class',right: 'room',   compound: 'classroom' },
];

const IRREGULAR_PLURALS = [
    { singular: 'mouse',    plural: 'mice' },
    { singular: 'child',    plural: 'children' },
    { singular: 'foot',     plural: 'feet' },
    { singular: 'tooth',    plural: 'teeth' },
    { singular: 'goose',    plural: 'geese' },
    { singular: 'man',      plural: 'men' },
    { singular: 'woman',    plural: 'women' },
    { singular: 'person',   plural: 'people' },
    { singular: 'ox',       plural: 'oxen' },
    { singular: 'sheep',    plural: 'sheep' },
    { singular: 'fish',     plural: 'fish' },
    { singular: 'leaf',     plural: 'leaves' },
    { singular: 'wolf',     plural: 'wolves' },
    { singular: 'knife',    plural: 'knives' },
    { singular: 'cactus',   plural: 'cacti' },
];

const SUBJECT_PRONOUNS = ['I', 'you', 'he', 'she', 'it', 'we', 'they'];
const OBJECT_PRONOUNS  = ['me', 'you', 'him', 'her', 'it', 'us', 'them'];
const POSSESSIVE_DET   = ['my', 'your', 'his', 'her', 'its', 'our', 'their'];
const POSSESSIVE_PRON  = ['mine', 'yours', 'his', 'hers', 'ours', 'theirs'];

// Tense templates: subject, base verb, present/past/future forms
const VERB_FORMS = [
    { base: 'walk',  presentS: 'walks',  past: 'walked',  future: 'will walk',  presentP: 'walk' },
    { base: 'play',  presentS: 'plays',  past: 'played',  future: 'will play',  presentP: 'play' },
    { base: 'jump',  presentS: 'jumps',  past: 'jumped',  future: 'will jump',  presentP: 'jump' },
    { base: 'cook',  presentS: 'cooks',  past: 'cooked',  future: 'will cook',  presentP: 'cook' },
    { base: 'paint', presentS: 'paints', past: 'painted', future: 'will paint', presentP: 'paint' },
    { base: 'help',  presentS: 'helps',  past: 'helped',  future: 'will help',  presentP: 'help' },
    { base: 'climb', presentS: 'climbs', past: 'climbed', future: 'will climb', presentP: 'climb' },
    { base: 'wash',  presentS: 'washes', past: 'washed',  future: 'will wash',  presentP: 'wash' },
];

const PREPOSITIONS = ['in', 'on', 'at', 'under', 'over', 'between', 'behind', 'beside', 'before', 'after'];

// ─── Atom → builder map ─────────────────────────────────────────────────────

// Each builder takes (skillAtom, mechanic, rng) and returns a Question
// Builders below.

// Common vs Proper Noun (sort) ───────────────────────────────────────────────
function _genCommonProperNoun(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    if (widget === 'sort-into-bins') {
        const commons = _shuffle(COMMON_NOUNS, rng).slice(0, 4);
        const propers = _shuffle(PROPER_NOUNS, rng).slice(0, 4);
        const items = [
            ...commons.map((w, i) => ({ id: `c${i}`, label: w, correct_bin: 'common' })),
            ...propers.map((w, i) => ({ id: `p${i}`, label: w, correct_bin: 'proper' })),
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each word into Common Noun or Proper Noun.',
            items,
            bins: [
                { id: 'common', label: 'Common Noun' },
                { id: 'proper', label: 'Proper Noun' },
            ],
            hints: ['Proper nouns name a SPECIFIC person, place, or thing — and start with a capital letter.'],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'two-button-binary') {
        const useProper = rng() < 0.5;
        const word = useProper ? _pick(PROPER_NOUNS, rng) : _pick(COMMON_NOUNS, rng);
        const opts = [
            { id: 'proper', label: 'Proper Noun' },
            { id: 'common', label: 'Common Noun' },
        ];
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: word,
            stem: `Is "${word}" a common or proper noun?`,
            options: opts,
            ans: useProper ? 'proper' : 'common',
            correct_answer: useProper ? 'proper' : 'common',
            hints: ['Proper nouns name a specific person, place, or thing and start with a capital letter.'],
            rit_difficulty: 170,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    return _genCommonProperNoun(skillAtom, 'sort-into-bins', rng);
}

// ─── Highlight-all helpers (word-tagger + hot-text-word) ───────────────────

// Build a word-tagger question that asks the student to tag every word with
// its part of speech. The atom is auto-gradable: every token has a
// correct_category; checkWordTagger requires all tokens to match.
function _wordTaggerHighlight(skillAtom, rng, focusTag, focusLabel) {
    const sent = _pick(_sentencesWithTag(focusTag), rng);
    if (!sent) return null;

    // Two-category model: focus part of speech vs "other".
    const tokens = sent.tokens.map((t, i) => ({
        id: `t${i}`,
        word: t.word,
        correct_category: t.tag === focusTag ? focusTag : 'other',
    }));
    return {
        id: _qid(skillAtom.skill_id, 'wt'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'word-tagger',
        skill_atom: skillAtom,
        sentence: _sentenceText(sent),
        tokens,
        categories: [
            { id: focusTag, label: focusLabel,    color: '#1e88e5' },
            { id: 'other',  label: 'Other word',  color: '#90a4ae' },
        ],
        task_text: `Tag each word: ${focusLabel} or Other.`,
        hints: [`A ${focusLabel.toLowerCase()} ${
            focusTag === 'noun' ? 'names a person, place, animal, or thing.'
            : focusTag === 'verb' ? 'shows action or state.'
            : focusTag === 'adjective' ? 'describes a noun.'
            : focusTag === 'adverb' ? 'describes a verb (How? When? Where?).'
            : 'is a part of speech.'}`],
        rit_difficulty: 175,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: false,
        k2_appropriate: false,
    };
}

// Build a hot-text-word question that highlights all instances of `focusTag`
// within a sentence. Fully auto-gradable via correct_indices.
function _hotTextHighlight(skillAtom, rng, focusTag, focusLabel) {
    const sent = _pick(_sentencesWithTag(focusTag), rng);
    if (!sent) return null;

    const passage = _sentenceText(sent);
    // hot-text-word splits passage on /\s+/ and increments token index for
    // each non-whitespace piece. Our sentences have one word per token, so
    // index === position.
    const correctIndices = sent.tokens
        .map((t, i) => (t.tag === focusTag ? i : -1))
        .filter(i => i >= 0);

    return {
        id: _qid(skillAtom.skill_id, 'ht'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'hot-text-word',
        skill_atom: skillAtom,
        passage,
        granularity: 'word',
        task_text: `Highlight every ${focusLabel.toLowerCase()} in this sentence.`,
        correct_indices: correctIndices,
        multi_select: true,
        hints: [
            focusTag === 'noun' ? 'Nouns name a person, place, animal, or thing.'
            : focusTag === 'verb' ? 'Verbs show action or state.'
            : focusTag === 'adjective' ? 'Adjectives describe nouns.'
            : focusTag === 'adverb' ? 'Adverbs describe verbs (How? When? Where?).'
            : 'Look at each word carefully.',
        ],
        rit_difficulty: 178,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: false,
        k2_appropriate: false,
    };
}

// Common noun (identification) ───────────────────────────────────────────────
function _genCommonNoun(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    if (widget === 'word-tagger') {
        const q = _wordTaggerHighlight(skillAtom, rng, 'noun', 'Noun');
        if (q) return q;
    }

    if (widget === 'hot-text-word') {
        const q = _hotTextHighlight(skillAtom, rng, 'noun', 'Noun');
        if (q) return q;
    }

    if (widget === 'tap-hotspot') {
        const sent = _pick(_sentencesWithTag('noun'), rng);
        const text = _sentenceText(sent);
        const targets = sent.tokens
            .map((t, i) => ({ ...t, idx: i }))
            .filter(t => t.tag === 'noun');
        if (!targets.length) return _genCommonNoun(skillAtom, 'two-button-binary', rng);
        const target = _pick(targets, rng);
        const hotspots = sent.tokens.map((t, i) => ({
            id: `t${i}`,
            label: t.word,
            correct: i === target.idx,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'taphot'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'tap-hotspot',
            skill_atom: skillAtom,
            stem: `Tap the common noun in this sentence:\n\n"${text}"`,
            passage: text,
            hotspots,
            ans: hotspots.find(h => h.correct).id,
            correct_answer: hotspots.find(h => h.correct).id,
            hints: ['A common noun names any person, place, animal, or thing.'],
            rit_difficulty: 170,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'two-button-binary') {
        const useNoun = rng() < 0.5;
        const word = useNoun
            ? _pick(COMMON_NOUNS, rng)
            : _pick(['quickly', 'jump', 'happy', 'red', 'sing', 'soft'], rng);
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: word,
            stem: `Is "${word}" a common noun?`,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: useNoun ? 'yes' : 'no',
            correct_answer: useNoun ? 'yes' : 'no',
            hints: ['A common noun names any person, place, animal, or thing.'],
            rit_difficulty: 165,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'sort-into-bins') {
        const nouns = _shuffle(COMMON_NOUNS, rng).slice(0, 4);
        const others = _shuffle(['quickly', 'jump', 'happy', 'red', 'sing', 'soft', 'tall', 'fast'], rng).slice(0, 4);
        const items = [
            ...nouns.map((w, i) => ({ id: `n${i}`, label: w, correct_bin: 'noun' })),
            ...others.map((w, i) => ({ id: `o${i}`, label: w, correct_bin: 'other' })),
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each word into Common Noun or Not a Noun.',
            items,
            bins: [
                { id: 'noun',  label: 'Common Noun' },
                { id: 'other', label: 'Not a Noun' },
            ],
            hints: ['A common noun names any person, place, animal, or thing.'],
            rit_difficulty: 170,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'mc-text') {
        const target = _pick(COMMON_NOUNS, rng);
        const distractors = _shuffle(['quickly', 'jump', 'happy', 'red', 'sing', 'soft', 'tall'], rng).slice(0, 3);
        const opts = _shuffle([target, ...distractors], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: 'Which word is a common noun?',
            options: opts,
            ans: opts.find(o => o.label === target).id,
            correct_answer: opts.find(o => o.label === target).id,
            hints: ['A common noun names a person, place, animal, or thing.'],
            rit_difficulty: 170,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    return _genCommonNoun(skillAtom, 'two-button-binary', rng);
}

// Concrete vs Abstract Noun ───────────────────────────────────────────────────
function _genConcreteAbstract(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    if (widget === 'sort-into-bins') {
        const concretes = _shuffle(CONCRETE_NOUNS, rng).slice(0, 4);
        const abstracts = _shuffle(ABSTRACT_NOUNS, rng).slice(0, 4);
        const items = [
            ...concretes.map((w, i) => ({ id: `c${i}`, label: w, correct_bin: 'concrete' })),
            ...abstracts.map((w, i) => ({ id: `a${i}`, label: w, correct_bin: 'abstract' })),
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each noun: Concrete (you can sense it) vs Abstract (idea or feeling).',
            items,
            bins: [
                { id: 'concrete', label: 'Concrete (sense it)' },
                { id: 'abstract', label: 'Abstract (idea/feeling)' },
            ],
            hints: ['Concrete nouns can be touched, seen, heard, smelled, or tasted. Abstract nouns are ideas or feelings.'],
            rit_difficulty: 185,
            grade_level: skillAtom.developmental_band || '3-4',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'two-button-binary') {
        const useAbstract = rng() < 0.5;
        const word = useAbstract ? _pick(ABSTRACT_NOUNS, rng) : _pick(CONCRETE_NOUNS, rng);
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: word,
            stem: `Is "${word}" a concrete noun or an abstract noun?`,
            options: [
                { id: 'concrete', label: 'Concrete' },
                { id: 'abstract', label: 'Abstract' },
            ],
            ans: useAbstract ? 'abstract' : 'concrete',
            correct_answer: useAbstract ? 'abstract' : 'concrete',
            hints: ['Concrete = sense it. Abstract = idea or feeling.'],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '3-4',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'mc-text') {
        const useAbstract = rng() < 0.5;
        const target = useAbstract ? _pick(ABSTRACT_NOUNS, rng) : _pick(CONCRETE_NOUNS, rng);
        const distractorPool = useAbstract ? CONCRETE_NOUNS : ABSTRACT_NOUNS;
        const distractors = _shuffle(distractorPool, rng).slice(0, 3);
        const opts = _shuffle([target, ...distractors], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which word is ${useAbstract ? 'an abstract' : 'a concrete'} noun?`,
            options: opts,
            ans: opts.find(o => o.label === target).id,
            correct_answer: opts.find(o => o.label === target).id,
            hints: ['Concrete = sense it. Abstract = idea/feeling.'],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '3-4',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    return _genConcreteAbstract(skillAtom, 'sort-into-bins', rng);
}

// Collective Noun ─────────────────────────────────────────────────────────────
function _genCollectiveNoun(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    if (widget === 'mc-text') {
        const pair = _pick(COLLECTIVE_PAIRS, rng);
        const distractors = _shuffle(
            COLLECTIVE_PAIRS.filter(p => p.collective !== pair.collective).map(p => p.collective),
            rng
        ).slice(0, 3);
        const opts = _shuffle([pair.collective, ...distractors], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which collective noun names a group of ${pair.members}?`,
            options: opts,
            ans: opts.find(o => o.label === pair.collective).id,
            correct_answer: opts.find(o => o.label === pair.collective).id,
            hints: [`A ${pair.collective} of ${pair.members}.`],
            rit_difficulty: 195,
            grade_level: skillAtom.developmental_band || '4-5+',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'drop-down-inline') {
        const pair = _pick(COLLECTIVE_PAIRS, rng);
        const distractors = _shuffle(
            COLLECTIVE_PAIRS.filter(p => p.collective !== pair.collective).map(p => p.collective),
            rng
        ).slice(0, 3);
        const options = _shuffle([pair.collective, ...distractors], rng);
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem: `We saw a {{slot:0}} of ${pair.members} cross the field.`,
            slots: [{ id: 'slot:0', options, correct: pair.collective }],
            task_text: 'Choose the correct collective noun.',
            hints: [`A ${pair.collective} of ${pair.members}.`],
            rit_difficulty: 195,
            grade_level: skillAtom.developmental_band || '4-5+',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'match-pairs') {
        const sample = _shuffle(COLLECTIVE_PAIRS, rng).slice(0, 4);
        return {
            id: _qid(skillAtom.skill_id, 'match'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'match-pairs',
            skill_atom: skillAtom,
            task_text: 'Match each collective noun to the group it names.',
            left_column: sample.map((p, i) => ({ id: `L${i}`, label: p.collective })),
            right_column: _shuffle(sample.map((p, i) => ({ id: `R${i}`, label: p.members })), rng),
            pairs: sample.map((_, i) => [`L${i}`, `R${i}`]),
            hints: ['Think about what each group is called: a flock of birds, a herd of cattle, etc.'],
            rit_difficulty: 195,
            grade_level: skillAtom.developmental_band || '4-5+',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    return _genCollectiveNoun(skillAtom, 'mc-text', rng);
}

// Compound Noun ─────────────────────────────────────────────────────────────
function _genCompoundNoun(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    if (widget === 'match-pairs') {
        const sample = _shuffle(COMPOUND_NOUNS, rng).slice(0, 4);
        return {
            id: _qid(skillAtom.skill_id, 'match'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'match-pairs',
            skill_atom: skillAtom,
            task_text: 'Match each first word to the second word that makes a compound noun.',
            left_column: sample.map((p, i) => ({ id: `L${i}`, label: p.left })),
            right_column: _shuffle(sample.map((p, i) => ({ id: `R${i}`, label: p.right })), rng),
            pairs: sample.map((_, i) => [`L${i}`, `R${i}`]),
            hints: ['A compound noun joins two words: note + book = notebook.'],
            rit_difficulty: 185,
            grade_level: skillAtom.developmental_band || '3-4',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'mc-text') {
        const pair = _pick(COMPOUND_NOUNS, rng);
        const distractorPool = COMPOUND_NOUNS.filter(p => p.compound !== pair.compound).map(p => p.compound);
        const distractors = _shuffle(distractorPool, rng).slice(0, 3);
        const opts = _shuffle([pair.compound, ...distractors], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which compound noun joins "${pair.left}" + "${pair.right}"?`,
            options: opts,
            ans: opts.find(o => o.label === pair.compound).id,
            correct_answer: opts.find(o => o.label === pair.compound).id,
            hints: [`${pair.left} + ${pair.right} = ${pair.compound}.`],
            rit_difficulty: 185,
            grade_level: skillAtom.developmental_band || '3-4',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'fib-auto') {
        const pair = _pick(COMPOUND_NOUNS, rng);
        return {
            id: _qid(skillAtom.skill_id, 'fib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'fib-auto',
            skill_atom: skillAtom,
            stem: `Combine the words to make one compound noun: ${pair.left} + ${pair.right} = {{blank:0}}`,
            ans: [{
                acceptable_answers: [pair.compound],
                case_sensitive: false,
                normalize_punctuation: true,
                label: 'Compound noun',
            }],
            hints: [`${pair.left} + ${pair.right} → ${pair.compound}.`],
            rit_difficulty: 185,
            grade_level: skillAtom.developmental_band || '3-4',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    return _genCompoundNoun(skillAtom, 'match-pairs', rng);
}

// Plural Irregular Noun ─────────────────────────────────────────────────────
function _genPluralIrregular(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    if (widget === 'fib-auto') {
        const pair = _pick(IRREGULAR_PLURALS, rng);
        return {
            id: _qid(skillAtom.skill_id, 'fib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'fib-auto',
            skill_atom: skillAtom,
            stem: `Write the plural of "${pair.singular}": {{blank:0}}`,
            ans: [{
                acceptable_answers: [pair.plural],
                case_sensitive: false,
                normalize_punctuation: true,
                label: 'Plural form',
            }],
            hints: [`The plural of ${pair.singular} is ${pair.plural}.`],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'mc-text') {
        const pair = _pick(IRREGULAR_PLURALS, rng);
        const distractorPool = IRREGULAR_PLURALS
            .filter(p => p.plural !== pair.plural).map(p => p.plural);
        // include a "wrong-rule" distractor (singular + s)
        const wrongRule = pair.singular + 's';
        const distractors = _shuffle([wrongRule, ..._shuffle(distractorPool, rng).slice(0, 2)], rng);
        const opts = _shuffle([pair.plural, ...distractors], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `What is the plural of "${pair.singular}"?`,
            options: opts,
            ans: opts.find(o => o.label === pair.plural).id,
            correct_answer: opts.find(o => o.label === pair.plural).id,
            hints: ['Some words have irregular plural forms — they don\'t just add -s.'],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'two-button-binary') {
        const pair = _pick(IRREGULAR_PLURALS, rng);
        const useCorrect = rng() < 0.5;
        const test = useCorrect ? pair.plural : (pair.singular + 's');
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: test,
            stem: `Is "${test}" the correct plural of "${pair.singular}"?`,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: useCorrect ? 'yes' : 'no',
            correct_answer: useCorrect ? 'yes' : 'no',
            hints: [`The plural of ${pair.singular} is ${pair.plural}.`],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'sort-into-bins') {
        const sample = _shuffle(IRREGULAR_PLURALS, rng).slice(0, 4);
        const items = [];
        sample.forEach((p, i) => {
            items.push({ id: `s${i}`, label: p.singular, correct_bin: 'singular' });
            items.push({ id: `p${i}`, label: p.plural,   correct_bin: 'plural' });
        });
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each word as singular or plural.',
            items,
            bins: [
                { id: 'singular', label: 'Singular (one)' },
                { id: 'plural',   label: 'Plural (more than one)' },
            ],
            hints: ['Plural means more than one.'],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    return _genPluralIrregular(skillAtom, 'fib-auto', rng);
}

// Possessive Noun (Singular) ─────────────────────────────────────────────────
function _genPossessiveSingular(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;
    const owners = ['dog', 'Maria', 'teacher', 'James', 'cat', 'baby', 'doctor', 'Sara'];

    if (widget === 'fib-auto') {
        const owner = _pick(owners, rng);
        const thing = _pick(['collar', 'backpack', 'hat', 'book', 'lunch', 'desk', 'toy'], rng);
        const correct = `${owner}'s`;
        return {
            id: _qid(skillAtom.skill_id, 'fib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'fib-auto',
            skill_atom: skillAtom,
            stem: `Write the singular possessive of "${owner}" (the ${thing} that belongs to ${owner}): {{blank:0}} ${thing}`,
            ans: [{
                acceptable_answers: [correct],
                case_sensitive: true,
                normalize_punctuation: false,
                label: 'Possessive form',
            }],
            hints: [`Add apostrophe + s: ${owner} → ${correct}.`],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'mc-text') {
        const owner = _pick(owners, rng);
        const correct = `${owner}'s`;
        const distractors = [`${owner}s`, `${owner}s'`, `${owner}'`];
        const opts = _shuffle([correct, ...distractors], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which is the correct singular possessive of "${owner}"?`,
            options: opts,
            ans: opts.find(o => o.label === correct).id,
            correct_answer: opts.find(o => o.label === correct).id,
            hints: ['Singular possessive: add apostrophe + s.'],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'drop-down-inline') {
        const owner = _pick(owners, rng);
        const thing = _pick(['collar', 'backpack', 'hat', 'book', 'lunch'], rng);
        const correct = `${owner}'s`;
        const options = _shuffle([correct, `${owner}s`, `${owner}s'`, `${owner}'`], rng);
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem: `The {{slot:0}} ${thing} is on the table.`,
            slots: [{ id: 'slot:0', options, correct }],
            task_text: 'Choose the correct singular possessive form.',
            hints: ['Singular possessive: add apostrophe + s.'],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'two-button-binary') {
        const owner = _pick(owners, rng);
        const useCorrect = rng() < 0.5;
        const tested = useCorrect ? `${owner}'s` : `${owner}s`;
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: tested,
            stem: `Is "${tested}" the correct singular possessive of "${owner}"?`,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: useCorrect ? 'yes' : 'no',
            correct_answer: useCorrect ? 'yes' : 'no',
            hints: [`Singular possessive of ${owner} is ${owner}'s.`],
            rit_difficulty: 170,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    return _genPossessiveSingular(skillAtom, 'mc-text', rng);
}

// Possessive Noun (Plural) ───────────────────────────────────────────────────
function _genPossessivePlural(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;
    // Regular plural ending in -s → just apostrophe
    // Irregular plural → apostrophe + s
    const regular = [
        { plural: 'dogs',     correct: "dogs'",     wrong: "dog's" },
        { plural: 'students', correct: "students'", wrong: "student's" },
        { plural: 'birds',    correct: "birds'",    wrong: "bird's" },
        { plural: 'players',  correct: "players'",  wrong: "player's" },
    ];
    const irregular = [
        { plural: 'children', correct: "children's", wrong: "childrens'" },
        { plural: 'mice',     correct: "mice's",     wrong: "mices'" },
        { plural: 'men',      correct: "men's",      wrong: "mens'" },
        { plural: 'women',    correct: "women's",    wrong: "womens'" },
    ];

    if (widget === 'mc-text') {
        const useReg = rng() < 0.6;
        const item = useReg ? _pick(regular, rng) : _pick(irregular, rng);
        const distractors = [item.wrong, item.plural, item.plural + 's'];
        const opts = _shuffle([item.correct, ...distractors.slice(0, 3)], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which is the correct plural possessive of "${item.plural}"?`,
            options: opts,
            ans: opts.find(o => o.label === item.correct).id,
            correct_answer: opts.find(o => o.label === item.correct).id,
            hints: [
                'Plural ending in -s → just add an apostrophe (dogs\').',
                'Irregular plural → add apostrophe + s (children\'s).',
            ],
            rit_difficulty: 195,
            grade_level: skillAtom.developmental_band || '3-4',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'fib-auto') {
        const useReg = rng() < 0.6;
        const item = useReg ? _pick(regular, rng) : _pick(irregular, rng);
        const thing = _pick(['collars', 'books', 'lunches', 'toys'], rng);
        return {
            id: _qid(skillAtom.skill_id, 'fib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'fib-auto',
            skill_atom: skillAtom,
            stem: `Write the plural possessive of "${item.plural}" (the ${thing} that belong to the ${item.plural}): {{blank:0}} ${thing}`,
            ans: [{
                acceptable_answers: [item.correct],
                case_sensitive: true,
                normalize_punctuation: false,
                label: 'Plural possessive form',
            }],
            hints: ['Plural ending in -s → just apostrophe. Irregular plural → apostrophe + s.'],
            rit_difficulty: 195,
            grade_level: skillAtom.developmental_band || '3-4',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'drop-down-inline') {
        const useReg = rng() < 0.6;
        const item = useReg ? _pick(regular, rng) : _pick(irregular, rng);
        const thing = _pick(['collars', 'books', 'lunches', 'toys'], rng);
        const options = _shuffle([item.correct, item.wrong, item.plural, item.plural + 's'], rng);
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem: `The {{slot:0}} ${thing} are over there.`,
            slots: [{ id: 'slot:0', options, correct: item.correct }],
            task_text: 'Choose the correct plural possessive form.',
            hints: ['Plural ending in -s → just apostrophe. Irregular plural → apostrophe + s.'],
            rit_difficulty: 195,
            grade_level: skillAtom.developmental_band || '3-4',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'two-button-binary') {
        const useReg = rng() < 0.6;
        const item = useReg ? _pick(regular, rng) : _pick(irregular, rng);
        const useCorrect = rng() < 0.5;
        const tested = useCorrect ? item.correct : item.wrong;
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: tested,
            stem: `Is "${tested}" the correct plural possessive of "${item.plural}"?`,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: useCorrect ? 'yes' : 'no',
            correct_answer: useCorrect ? 'yes' : 'no',
            hints: [`Plural possessive of ${item.plural} is ${item.correct}.`],
            rit_difficulty: 190,
            grade_level: skillAtom.developmental_band || '3-4',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    return _genPossessivePlural(skillAtom, 'mc-text', rng);
}

// Subject Pronoun ────────────────────────────────────────────────────────────
function _genSubjectPronoun(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    // Antecedent → correct subject pronoun
    const cases = [
        { ant: 'Maria',    correct: 'she',  cap: 'She' },
        { ant: 'James',    correct: 'he',   cap: 'He'  },
        { ant: 'the boys', correct: 'they', cap: 'They'},
        { ant: 'the girls',correct: 'they', cap: 'They'},
        { ant: 'the dog',  correct: 'it',   cap: 'It'  },
        { ant: 'my brother and I', correct: 'we', cap: 'We' },
    ];

    if (widget === 'drop-down-inline') {
        const c = _pick(cases, rng);
        const options = _shuffle(['she', 'he', 'they', 'it', 'we', 'you'], rng);
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem: `${c.ant.charAt(0).toUpperCase() + c.ant.slice(1)} runs fast. {{slot:0}} won the race.`,
            slots: [{ id: 'slot:0', options: options.map(o => o.charAt(0).toUpperCase() + o.slice(1)), correct: c.cap }],
            task_text: 'Choose the correct subject pronoun.',
            hints: ['Subject pronouns: I, you, he, she, it, we, they.'],
            rit_difficulty: 165,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'mc-text') {
        const c = _pick(cases, rng);
        const distractorPool = ['me', 'him', 'her', 'us', 'them'];
        const distractors = _shuffle(distractorPool, rng).slice(0, 3);
        const opts = _shuffle([c.correct, ...distractors], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which subject pronoun replaces "${c.ant}"?`,
            options: opts,
            ans: opts.find(o => o.label === c.correct).id,
            correct_answer: opts.find(o => o.label === c.correct).id,
            hints: ['Subject pronouns: I, you, he, she, it, we, they.'],
            rit_difficulty: 165,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'fib-auto') {
        const c = _pick(cases, rng);
        return {
            id: _qid(skillAtom.skill_id, 'fib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'fib-auto',
            skill_atom: skillAtom,
            stem: `Replace "${c.ant}" with a subject pronoun: {{blank:0}}`,
            ans: [{
                acceptable_answers: [c.correct, c.cap],
                case_sensitive: false,
                normalize_punctuation: true,
                label: 'Subject pronoun',
            }],
            hints: ['Subject pronouns: I, you, he, she, it, we, they.'],
            rit_difficulty: 170,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'two-button-binary') {
        const useSubject = rng() < 0.5;
        const word = useSubject ? _pick(SUBJECT_PRONOUNS, rng) : _pick(['me', 'him', 'her', 'us', 'them'], rng);
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: word,
            stem: `Is "${word}" a subject pronoun?`,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: useSubject ? 'yes' : 'no',
            correct_answer: useSubject ? 'yes' : 'no',
            hints: ['Subject pronouns: I, you, he, she, it, we, they.'],
            rit_difficulty: 165,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'sort-into-bins') {
        const subjects = _shuffle(SUBJECT_PRONOUNS.filter(p => p !== 'you'), rng).slice(0, 4);
        const objects = _shuffle(['me', 'him', 'her', 'us', 'them'], rng).slice(0, 4);
        const items = [
            ...subjects.map((w, i) => ({ id: `s${i}`, label: w, correct_bin: 'subject' })),
            ...objects.map((w, i) => ({ id: `o${i}`, label: w, correct_bin: 'object' })),
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each pronoun: Subject pronoun (does the action) vs Object pronoun (receives the action).',
            items,
            bins: [
                { id: 'subject', label: 'Subject Pronoun' },
                { id: 'object',  label: 'Object Pronoun'  },
            ],
            hints: ['Subject pronouns do the action: I, you, he, she, it, we, they.'],
            rit_difficulty: 170,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    return _genSubjectPronoun(skillAtom, 'drop-down-inline', rng);
}

// Object Pronoun ────────────────────────────────────────────────────────────
function _genObjectPronoun(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    const cases = [
        { ant: 'Maria',          correct: 'her' },
        { ant: 'James',          correct: 'him' },
        { ant: 'the children',   correct: 'them'},
        { ant: 'the cat',        correct: 'it'  },
        { ant: 'my friends and me', correct: 'us' },
    ];

    if (widget === 'drop-down-inline') {
        const c = _pick(cases, rng);
        const options = _shuffle(['her', 'him', 'them', 'it', 'us', 'me'], rng);
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem: `Mom called ${c.ant}. Mom called {{slot:0}}.`,
            slots: [{ id: 'slot:0', options, correct: c.correct }],
            task_text: 'Choose the correct object pronoun.',
            hints: ['Object pronouns: me, you, him, her, it, us, them.'],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'mc-text') {
        const c = _pick(cases, rng);
        const distractorPool = SUBJECT_PRONOUNS;
        const distractors = _shuffle(distractorPool, rng).slice(0, 3);
        const opts = _shuffle([c.correct, ...distractors], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which object pronoun replaces "${c.ant}"?`,
            options: opts,
            ans: opts.find(o => o.label === c.correct).id,
            correct_answer: opts.find(o => o.label === c.correct).id,
            hints: ['Object pronouns: me, you, him, her, it, us, them.'],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'fib-auto') {
        const c = _pick(cases, rng);
        return {
            id: _qid(skillAtom.skill_id, 'fib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'fib-auto',
            skill_atom: skillAtom,
            stem: `Replace "${c.ant}" with an object pronoun: We saw {{blank:0}}.`,
            ans: [{
                acceptable_answers: [c.correct],
                case_sensitive: false,
                normalize_punctuation: true,
                label: 'Object pronoun',
            }],
            hints: ['Object pronouns: me, you, him, her, it, us, them.'],
            rit_difficulty: 178,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'two-button-binary') {
        const useObject = rng() < 0.5;
        const word = useObject ? _pick(['me', 'him', 'her', 'us', 'them'], rng) : _pick(['I', 'he', 'she', 'we', 'they'], rng);
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: word,
            stem: `Is "${word}" an object pronoun?`,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: useObject ? 'yes' : 'no',
            correct_answer: useObject ? 'yes' : 'no',
            hints: ['Object pronouns: me, you, him, her, it, us, them.'],
            rit_difficulty: 170,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'sort-into-bins') {
        const subjects = _shuffle(['I', 'he', 'she', 'we', 'they'], rng).slice(0, 4);
        const objects = _shuffle(['me', 'him', 'her', 'us', 'them'], rng).slice(0, 4);
        const items = [
            ...subjects.map((w, i) => ({ id: `s${i}`, label: w, correct_bin: 'subject' })),
            ...objects.map((w, i) => ({ id: `o${i}`, label: w, correct_bin: 'object' })),
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each pronoun: Subject vs Object.',
            items,
            bins: [
                { id: 'subject', label: 'Subject Pronoun' },
                { id: 'object',  label: 'Object Pronoun'  },
            ],
            hints: ['Object pronouns: me, you, him, her, it, us, them.'],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    return _genObjectPronoun(skillAtom, 'drop-down-inline', rng);
}

// Possessive Pronoun ────────────────────────────────────────────────────────
function _genPossessivePronoun(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    const cases = [
        { stem: '{{slot:0}} book is on the desk.',     options: ['my', 'mine', 'me', 'I'],         correct: 'my'   },
        { stem: '{{slot:0}} backpack is red.',          options: ['her', 'hers', 'she', 'herself'],correct: 'her'  },
        { stem: 'The bicycle is {{slot:0}}.',           options: ['mine', 'my', 'me', 'I'],        correct: 'mine' },
        { stem: 'The toys are {{slot:0}}.',             options: ['theirs', 'their', 'them', 'they'], correct: 'theirs' },
        { stem: 'The dog wagged {{slot:0}} tail.',      options: ['its', 'his', 'her', 'their'],   correct: 'its' },
    ];

    if (widget === 'drop-down-inline') {
        const c = _pick(cases, rng);
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem: c.stem,
            slots: [{ id: 'slot:0', options: _shuffle(c.options, rng), correct: c.correct }],
            task_text: 'Choose the correct possessive pronoun.',
            hints: ['Before a noun: my, your, his, her, its, our, their. By itself: mine, yours, his, hers, ours, theirs.'],
            rit_difficulty: 185,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'mc-text') {
        const c = _pick(cases, rng);
        const opts = _shuffle(c.options, rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which possessive pronoun fits the blank? "${c.stem.replace('{{slot:0}}', '___')}"`,
            options: opts,
            ans: opts.find(o => o.label === c.correct).id,
            correct_answer: opts.find(o => o.label === c.correct).id,
            hints: ['Possessive pronouns: my, your, his, her, its, our, their; mine, yours, his, hers, ours, theirs.'],
            rit_difficulty: 185,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'sort-into-bins') {
        const before = _shuffle(POSSESSIVE_DET, rng).slice(0, 4);
        const standalone = _shuffle(POSSESSIVE_PRON, rng).slice(0, 4);
        const items = [
            ...before.map((w, i) => ({ id: `b${i}`, label: w, correct_bin: 'before' })),
            ...standalone.map((w, i) => ({ id: `s${i}`, label: w, correct_bin: 'standalone' })),
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each possessive form: appears BEFORE a noun (my book) vs stands ALONE (mine).',
            items,
            bins: [
                { id: 'before',     label: 'Before a noun (my, your, his...)' },
                { id: 'standalone', label: 'Stands alone (mine, yours, his...)' },
            ],
            hints: ['my book = before a noun; the book is mine = stands alone.'],
            rit_difficulty: 188,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'two-button-binary') {
        const c = _pick(cases, rng);
        const useCorrect = rng() < 0.5;
        const wrong = c.options.find(o => o !== c.correct);
        const tested = useCorrect ? c.correct : wrong;
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: tested,
            stem: `Does "${tested}" correctly fill: "${c.stem.replace('{{slot:0}}', '___')}"`,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: useCorrect ? 'yes' : 'no',
            correct_answer: useCorrect ? 'yes' : 'no',
            hints: ['Read the sentence carefully. Possessive pronouns show ownership.'],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'fib-auto') {
        const c = _pick(cases, rng);
        return {
            id: _qid(skillAtom.skill_id, 'fib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'fib-auto',
            skill_atom: skillAtom,
            stem: c.stem.replace('{{slot:0}}', '{{blank:0}}'),
            ans: [{
                acceptable_answers: [c.correct],
                case_sensitive: false,
                normalize_punctuation: true,
                label: 'Possessive pronoun',
            }],
            hints: ['Possessive pronouns show ownership.'],
            rit_difficulty: 188,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    return _genPossessivePronoun(skillAtom, 'drop-down-inline', rng);
}

// Demonstrative Pronoun ─────────────────────────────────────────────────────
function _genDemonstrative(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    const cases = [
        { stem: '{{slot:0}} book is right next to me.',       correct: 'This',  options: ['This', 'That', 'These', 'Those'] },
        { stem: '{{slot:0}} cookies in my hand smell great.', correct: 'These', options: ['This', 'That', 'These', 'Those'] },
        { stem: '{{slot:0}} mountain on the horizon is huge.',correct: 'That',  options: ['This', 'That', 'These', 'Those'] },
        { stem: '{{slot:0}} stars in the sky are bright.',    correct: 'Those', options: ['This', 'That', 'These', 'Those'] },
    ];

    if (widget === 'drop-down-inline') {
        const c = _pick(cases, rng);
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem: c.stem,
            slots: [{ id: 'slot:0', options: _shuffle(c.options, rng), correct: c.correct }],
            task_text: 'Choose the correct demonstrative pronoun (this/that/these/those).',
            hints: ['Near + 1 → this. Near + many → these. Far + 1 → that. Far + many → those.'],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'mc-text') {
        const c = _pick(cases, rng);
        const opts = _shuffle(c.options, rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which fits best? "${c.stem.replace('{{slot:0}}', '___')}"`,
            options: opts,
            ans: opts.find(o => o.label === c.correct).id,
            correct_answer: opts.find(o => o.label === c.correct).id,
            hints: ['Near + 1 → this. Near + many → these. Far + 1 → that. Far + many → those.'],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'sort-into-bins') {
        const items = [
            { id: 'i1', label: 'this',  correct_bin: 'near' },
            { id: 'i2', label: 'these', correct_bin: 'near' },
            { id: 'i3', label: 'that',  correct_bin: 'far'  },
            { id: 'i4', label: 'those', correct_bin: 'far'  },
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each demonstrative pronoun: Near or Far.',
            items,
            bins: [
                { id: 'near', label: 'Near (this, these)' },
                { id: 'far',  label: 'Far (that, those)' },
            ],
            hints: ['Near = this/these. Far = that/those.'],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'two-button-binary') {
        const useCorrect = rng() < 0.5;
        const c = _pick(cases, rng);
        const wrong = _pick(c.options.filter(o => o !== c.correct), rng);
        const tested = useCorrect ? c.correct : wrong;
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: tested,
            stem: `Does "${tested}" correctly fill: "${c.stem.replace('{{slot:0}}', '___')}"`,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: useCorrect ? 'yes' : 'no',
            correct_answer: useCorrect ? 'yes' : 'no',
            hints: ['Near + 1 → this. Near + many → these. Far + 1 → that. Far + many → those.'],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'fib-auto') {
        const c = _pick(cases, rng);
        return {
            id: _qid(skillAtom.skill_id, 'fib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'fib-auto',
            skill_atom: skillAtom,
            stem: c.stem.replace('{{slot:0}}', '{{blank:0}}'),
            ans: [{
                acceptable_answers: [c.correct, c.correct.toLowerCase()],
                case_sensitive: false,
                normalize_punctuation: true,
                label: 'Demonstrative',
            }],
            hints: ['Near + 1 → this. Near + many → these. Far + 1 → that. Far + many → those.'],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    return _genDemonstrative(skillAtom, 'drop-down-inline', rng);
}

// Action Verb (basic) ────────────────────────────────────────────────────────
function _genActionVerb(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    if (widget === 'word-tagger') {
        const q = _wordTaggerHighlight(skillAtom, rng, 'verb', 'Verb');
        if (q) return q;
    }

    if (widget === 'hot-text-word') {
        const q = _hotTextHighlight(skillAtom, rng, 'verb', 'Verb');
        if (q) return q;
    }

    if (widget === 'tap-hotspot') {
        const sent = _pick(_sentencesWithTag('verb'), rng);
        const text = _sentenceText(sent);
        const verbs = sent.tokens
            .map((t, i) => ({ ...t, idx: i }))
            .filter(t => t.tag === 'verb');
        const target = _pick(verbs, rng);
        const hotspots = sent.tokens.map((t, i) => ({
            id: `t${i}`,
            label: t.word,
            correct: i === target.idx,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'taphot'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'tap-hotspot',
            skill_atom: skillAtom,
            stem: `Tap the action verb in this sentence:\n\n"${text}"`,
            passage: text,
            hotspots,
            ans: hotspots.find(h => h.correct).id,
            correct_answer: hotspots.find(h => h.correct).id,
            hints: ['An action verb shows what the subject does.'],
            rit_difficulty: 165,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'two-button-binary') {
        const useVerb = rng() < 0.5;
        const word = useVerb
            ? _pick(['run', 'jump', 'sing', 'eat', 'write', 'climb', 'dance'], rng)
            : _pick(['cat', 'happy', 'red', 'tree', 'soft', 'three'], rng);
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: word,
            stem: `Is "${word}" an action verb?`,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: useVerb ? 'yes' : 'no',
            correct_answer: useVerb ? 'yes' : 'no',
            hints: ['An action verb shows what someone or something does.'],
            rit_difficulty: 160,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'mc-text') {
        const verbs = ['run', 'jump', 'sing', 'eat', 'write', 'climb', 'dance', 'cook'];
        const others = ['cat', 'happy', 'red', 'tree', 'soft', 'three'];
        const target = _pick(verbs, rng);
        const distractors = _shuffle(others, rng).slice(0, 3);
        const opts = _shuffle([target, ...distractors], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: 'Which word is an action verb?',
            options: opts,
            ans: opts.find(o => o.label === target).id,
            correct_answer: opts.find(o => o.label === target).id,
            hints: ['An action verb shows what someone or something does.'],
            rit_difficulty: 160,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'sort-into-bins') {
        const verbs = _shuffle(['run', 'jump', 'sing', 'eat', 'write', 'climb', 'dance', 'cook'], rng).slice(0, 4);
        const others = _shuffle(['cat', 'happy', 'red', 'tree', 'soft', 'three'], rng).slice(0, 4);
        const items = [
            ...verbs.map((w, i) => ({ id: `v${i}`, label: w, correct_bin: 'verb' })),
            ...others.map((w, i) => ({ id: `o${i}`, label: w, correct_bin: 'other' })),
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each word: Action Verb or Not a Verb.',
            items,
            bins: [
                { id: 'verb',  label: 'Action Verb' },
                { id: 'other', label: 'Not a Verb' },
            ],
            hints: ['An action verb shows what someone or something does.'],
            rit_difficulty: 165,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    return _genActionVerb(skillAtom, 'tap-hotspot', rng);
}

// Subject-Verb Agreement ───────────────────────────────────────────────────
function _genSubjectVerbAgreement(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    const cases = [
        { stem: 'The dog {{slot:0}} fast.',          options: ['runs', 'run', 'running'],   correct: 'runs'  },
        { stem: 'The dogs {{slot:0}} fast.',         options: ['runs', 'run', 'running'],   correct: 'run'   },
        { stem: 'My friend {{slot:0}} the piano.',   options: ['plays', 'play', 'playing'], correct: 'plays' },
        { stem: 'My friends {{slot:0}} the piano.',  options: ['plays', 'play', 'playing'], correct: 'play'  },
        { stem: 'She {{slot:0}} a book each night.', options: ['reads', 'read', 'reading'], correct: 'reads' },
        { stem: 'They {{slot:0}} books each night.', options: ['reads', 'read', 'reading'], correct: 'read'  },
        { stem: 'The cat {{slot:0}} on the mat.',    options: ['sits', 'sit', 'sitting'],   correct: 'sits'  },
        { stem: 'The cats {{slot:0}} on the mat.',   options: ['sits', 'sit', 'sitting'],   correct: 'sit'   },
    ];

    if (widget === 'drop-down-inline') {
        const c = _pick(cases, rng);
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem: c.stem,
            slots: [{ id: 'slot:0', options: _shuffle(c.options, rng), correct: c.correct }],
            task_text: 'Choose the verb that agrees with the subject.',
            hints: ['Singular subject → singular verb (often ends in -s). Plural subject → plural verb.'],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'mc-text') {
        const c = _pick(cases, rng);
        const opts = _shuffle(c.options, rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which verb fits? "${c.stem.replace('{{slot:0}}', '___')}"`,
            options: opts,
            ans: opts.find(o => o.label === c.correct).id,
            correct_answer: opts.find(o => o.label === c.correct).id,
            hints: ['Singular → -s; Plural → no -s.'],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'two-button-binary') {
        const c = _pick(cases, rng);
        const useCorrect = rng() < 0.5;
        const wrong = _pick(c.options.filter(o => o !== c.correct), rng);
        const tested = useCorrect ? c.correct : wrong;
        const filled = c.stem.replace('{{slot:0}}', tested);
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: filled,
            stem: `Is this sentence grammatically correct?\n\n"${filled}"`,
            options: [
                { id: 'yes', label: 'Correct' },
                { id: 'no',  label: 'Incorrect' },
            ],
            ans: useCorrect ? 'yes' : 'no',
            correct_answer: useCorrect ? 'yes' : 'no',
            hints: ['Singular subject takes singular verb. Plural subject takes plural verb.'],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'fib-auto') {
        const c = _pick(cases, rng);
        return {
            id: _qid(skillAtom.skill_id, 'fib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'fib-auto',
            skill_atom: skillAtom,
            stem: c.stem.replace('{{slot:0}}', '{{blank:0}}'),
            ans: [{
                acceptable_answers: [c.correct],
                case_sensitive: false,
                normalize_punctuation: true,
                label: 'Verb',
            }],
            hints: ['Singular → -s; Plural → no -s.'],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    return _genSubjectVerbAgreement(skillAtom, 'drop-down-inline', rng);
}

// Verb Tense — present/past/future ──────────────────────────────────────────
function _genTense(skillAtom, mechanic, rng, tenseKey, label) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;
    const v = _pick(VERB_FORMS, rng);
    // Subject sentence framing per tense.
    const subjectKind = rng() < 0.5 ? 'sing' : 'plur';
    const subj = subjectKind === 'sing' ? 'She' : 'They';

    function _formFor(key) {
        if (key === 'present') return subjectKind === 'sing' ? v.presentS : v.presentP;
        if (key === 'past')    return v.past;
        if (key === 'future')  return v.future;
        return v.base;
    }

    const correct = _formFor(tenseKey);
    const distractors = ['present','past','future'].filter(k => k !== tenseKey).map(_formFor);

    if (widget === 'drop-down-inline') {
        const options = _shuffle([correct, ...distractors], rng);
        const stem = tenseKey === 'future'
            ? `Tomorrow, ${subj.toLowerCase()} {{slot:0}} to school.`
            : tenseKey === 'past'
                ? `Yesterday, ${subj.toLowerCase()} {{slot:0}} to school.`
                : `Every day, ${subj.toLowerCase()} {{slot:0}} to school.`;
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem,
            slots: [{ id: 'slot:0', options, correct }],
            task_text: `Choose the ${label} tense form of "${v.base}".`,
            hints: [`${label} tense: use "${correct}".`],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'mc-text') {
        const opts = _shuffle([correct, ...distractors], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which is the ${label} tense form of "${v.base}" (subject: ${subj})?`,
            options: opts,
            ans: opts.find(o => o.label === correct).id,
            correct_answer: opts.find(o => o.label === correct).id,
            hints: [`${label} tense of ${v.base} → ${correct}.`],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'fib-auto') {
        return {
            id: _qid(skillAtom.skill_id, 'fib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'fib-auto',
            skill_atom: skillAtom,
            stem: `Write the ${label} tense form of "${v.base}" (subject: ${subj}): {{blank:0}}`,
            ans: [{
                acceptable_answers: [correct],
                case_sensitive: false,
                normalize_punctuation: true,
                label: `${label} tense form`,
            }],
            hints: [`${label} tense of ${v.base} → ${correct}.`],
            rit_difficulty: 178,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'two-button-binary') {
        const useCorrect = rng() < 0.5;
        const tested = useCorrect ? correct : _pick(distractors, rng);
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: tested,
            stem: `Is "${tested}" the ${label} tense of "${v.base}"?`,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: useCorrect ? 'yes' : 'no',
            correct_answer: useCorrect ? 'yes' : 'no',
            hints: [`${label} tense of ${v.base} → ${correct}.`],
            rit_difficulty: 170,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'sort-into-bins') {
        const sample = _shuffle(VERB_FORMS, rng).slice(0, 4);
        const items = [];
        sample.forEach((vf, i) => {
            items.push({ id: `pres${i}`, label: vf.presentS, correct_bin: 'present' });
            items.push({ id: `past${i}`, label: vf.past,     correct_bin: 'past'    });
        });
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each verb form: present tense or past tense.',
            items,
            bins: [
                { id: 'present', label: 'Present tense' },
                { id: 'past',    label: 'Past tense' },
            ],
            hints: ['Past tense regular verbs end in -ed.'],
            rit_difficulty: 178,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    return _genTense(skillAtom, 'drop-down-inline', rng, tenseKey, label);
}

// Adjective (basic) ─────────────────────────────────────────────────────────
function _genAdjective(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    if (widget === 'word-tagger') {
        const q = _wordTaggerHighlight(skillAtom, rng, 'adjective', 'Adjective');
        if (q) return q;
    }

    if (widget === 'hot-text-word') {
        const q = _hotTextHighlight(skillAtom, rng, 'adjective', 'Adjective');
        if (q) return q;
    }

    if (widget === 'tap-hotspot') {
        const sent = _pick(_sentencesWithTag('adjective'), rng);
        const text = _sentenceText(sent);
        const adjectives = sent.tokens
            .map((t, i) => ({ ...t, idx: i }))
            .filter(t => t.tag === 'adjective');
        const target = _pick(adjectives, rng);
        const hotspots = sent.tokens.map((t, i) => ({
            id: `t${i}`,
            label: t.word,
            correct: i === target.idx,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'taphot'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'tap-hotspot',
            skill_atom: skillAtom,
            stem: `Tap the adjective in this sentence:\n\n"${text}"`,
            passage: text,
            hotspots,
            ans: hotspots.find(h => h.correct).id,
            correct_answer: hotspots.find(h => h.correct).id,
            hints: ['Adjectives describe nouns: What kind? Which one? How many?'],
            rit_difficulty: 168,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'two-button-binary') {
        const useAdj = rng() < 0.5;
        const word = useAdj
            ? _pick(['big', 'happy', 'tall', 'soft', 'red', 'cold', 'shiny'], rng)
            : _pick(['cat', 'run', 'tree', 'jump', 'apple', 'sing'], rng);
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: word,
            stem: `Is "${word}" an adjective?`,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: useAdj ? 'yes' : 'no',
            correct_answer: useAdj ? 'yes' : 'no',
            hints: ['Adjectives describe nouns.'],
            rit_difficulty: 162,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'sort-into-bins') {
        const adjs = _shuffle(['big', 'happy', 'tall', 'soft', 'red', 'cold', 'shiny', 'sweet'], rng).slice(0, 4);
        const others = _shuffle(['cat', 'run', 'tree', 'jump', 'apple', 'sing'], rng).slice(0, 4);
        const items = [
            ...adjs.map((w, i) => ({ id: `a${i}`, label: w, correct_bin: 'adj' })),
            ...others.map((w, i) => ({ id: `o${i}`, label: w, correct_bin: 'other' })),
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each word: Adjective or Not an Adjective.',
            items,
            bins: [
                { id: 'adj',   label: 'Adjective' },
                { id: 'other', label: 'Not an Adjective' },
            ],
            hints: ['Adjectives describe nouns.'],
            rit_difficulty: 165,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'mc-text') {
        const adjs = ['big', 'happy', 'tall', 'soft', 'red', 'cold', 'shiny'];
        const others = ['cat', 'run', 'tree', 'jump', 'apple', 'sing'];
        const target = _pick(adjs, rng);
        const distractors = _shuffle(others, rng).slice(0, 3);
        const opts = _shuffle([target, ...distractors], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: 'Which word is an adjective?',
            options: opts,
            ans: opts.find(o => o.label === target).id,
            correct_answer: opts.find(o => o.label === target).id,
            hints: ['Adjectives describe nouns.'],
            rit_difficulty: 165,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    return _genAdjective(skillAtom, 'tap-hotspot', rng);
}

// Adverb of Manner / Time / Place ─────────────────────────────────────────
function _genAdverb(skillAtom, mechanic, rng, kind) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    const ADVERBS_MANNER = ['quickly', 'slowly', 'quietly', 'loudly', 'carefully', 'softly', 'kindly', 'fiercely'];
    const ADVERBS_TIME   = ['yesterday', 'soon', 'now', 'often', 'never', 'tomorrow', 'today'];
    const ADVERBS_PLACE  = ['here', 'there', 'everywhere', 'outside', 'inside', 'above', 'below'];
    const NON_ADVERBS    = ['cat', 'happy', 'tall', 'run', 'tree', 'red', 'apple'];

    const pool = kind === 'time' ? ADVERBS_TIME
              : kind === 'place' ? ADVERBS_PLACE
              : ADVERBS_MANNER;
    const niceLabel = kind === 'time' ? 'adverb of time'
                    : kind === 'place' ? 'adverb of place'
                    : 'adverb of manner';

    if (widget === 'word-tagger') {
        const q = _wordTaggerHighlight(skillAtom, rng, 'adverb', 'Adverb');
        if (q) return q;
    }

    if (widget === 'hot-text-word') {
        const q = _hotTextHighlight(skillAtom, rng, 'adverb', 'Adverb');
        if (q) return q;
    }

    if (widget === 'tap-hotspot') {
        // Use sentences with adverb tag; fall back to MC if no match.
        const sentencesWithAdv = _sentencesWithTag('adverb');
        if (sentencesWithAdv.length === 0) return _genAdverb(skillAtom, 'mc-text', rng, kind);
        const sent = _pick(sentencesWithAdv, rng);
        const text = _sentenceText(sent);
        const adverbs = sent.tokens
            .map((t, i) => ({ ...t, idx: i }))
            .filter(t => t.tag === 'adverb');
        const target = _pick(adverbs, rng);
        const hotspots = sent.tokens.map((t, i) => ({
            id: `t${i}`,
            label: t.word,
            correct: i === target.idx,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'taphot'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'tap-hotspot',
            skill_atom: skillAtom,
            stem: `Tap the adverb in this sentence:\n\n"${text}"`,
            passage: text,
            hotspots,
            ans: hotspots.find(h => h.correct).id,
            correct_answer: hotspots.find(h => h.correct).id,
            hints: [`Adverbs describe verbs (How? When? Where?).`],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'mc-text') {
        const target = _pick(pool, rng);
        const distractors = _shuffle(NON_ADVERBS, rng).slice(0, 3);
        const opts = _shuffle([target, ...distractors], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which word is an ${niceLabel}?`,
            options: opts,
            ans: opts.find(o => o.label === target).id,
            correct_answer: opts.find(o => o.label === target).id,
            hints: [`${niceLabel} answers: ${kind === 'time' ? 'When?' : kind === 'place' ? 'Where?' : 'How?'}`],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'sort-into-bins') {
        const advs = _shuffle(pool, rng).slice(0, 4);
        const others = _shuffle(NON_ADVERBS, rng).slice(0, 4);
        const items = [
            ...advs.map((w, i) => ({ id: `a${i}`, label: w, correct_bin: 'adverb' })),
            ...others.map((w, i) => ({ id: `o${i}`, label: w, correct_bin: 'other' })),
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: `Sort each word: ${niceLabel} or Not.`,
            items,
            bins: [
                { id: 'adverb', label: niceLabel.charAt(0).toUpperCase() + niceLabel.slice(1) },
                { id: 'other',  label: 'Not an Adverb' },
            ],
            hints: [`${niceLabel} describes a verb.`],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'fib-auto') {
        const target = _pick(pool, rng);
        return {
            id: _qid(skillAtom.skill_id, 'fib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'fib-auto',
            skill_atom: skillAtom,
            stem: `Write any ${niceLabel} (one word): {{blank:0}}`,
            ans: [{
                acceptable_answers: pool,
                case_sensitive: false,
                normalize_punctuation: true,
                label: niceLabel,
            }],
            hints: [`Examples: ${pool.slice(0, 4).join(', ')}.`],
            rit_difficulty: 182,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'two-button-binary') {
        const useAdv = rng() < 0.5;
        const word = useAdv ? _pick(pool, rng) : _pick(NON_ADVERBS, rng);
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            subject: word,
            stem: `Is "${word}" an ${niceLabel}?`,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: useAdv ? 'yes' : 'no',
            correct_answer: useAdv ? 'yes' : 'no',
            hints: [`${niceLabel} describes a verb.`],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    if (widget === 'drop-down-inline') {
        const target = _pick(pool, rng);
        const distractors = _shuffle(NON_ADVERBS, rng).slice(0, 3);
        const options = _shuffle([target, ...distractors], rng);
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem: `She walks {{slot:0}} to school.`,
            slots: [{ id: 'slot:0', options, correct: target }],
            task_text: `Choose the ${niceLabel}.`,
            hints: [`${niceLabel} describes a verb.`],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    return _genAdverb(skillAtom, 'mc-text', rng, kind);
}

// Preposition (basic) ───────────────────────────────────────────────────────
function _genPreposition(skillAtom, mechanic, rng) {
    const widget = STAGE1_FALLBACK[mechanic] || mechanic;

    const cases = [
        { stem: 'The cat sat {{slot:0}} the mat.',          options: ['on', 'in', 'over', 'under'], correct: 'on' },
        { stem: 'The book is {{slot:0}} the desk.',          options: ['on', 'between', 'before', 'over'], correct: 'on' },
        { stem: 'The mouse hides {{slot:0}} the table.',     options: ['under', 'on', 'before', 'after'], correct: 'under' },
        { stem: 'We will meet {{slot:0}} 3 PM.',             options: ['at', 'on', 'over', 'under'], correct: 'at' },
        { stem: 'The dog ran {{slot:0}} the door.',          options: ['behind', 'between', 'in', 'on'], correct: 'behind' },
    ];

    if (widget === 'drop-down-inline') {
        const c = _pick(cases, rng);
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem: c.stem,
            slots: [{ id: 'slot:0', options: _shuffle(c.options, rng), correct: c.correct }],
            task_text: 'Choose the correct preposition.',
            hints: ['Prepositions show where, when, or how.'],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'mc-text') {
        const c = _pick(cases, rng);
        const opts = _shuffle(c.options, rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mc'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which preposition fits? "${c.stem.replace('{{slot:0}}', '___')}"`,
            options: opts,
            ans: opts.find(o => o.label === c.correct).id,
            correct_answer: opts.find(o => o.label === c.correct).id,
            hints: ['Prepositions show where, when, or how.'],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'sort-into-bins') {
        const preps = _shuffle(PREPOSITIONS, rng).slice(0, 4);
        const others = _shuffle(['quickly', 'cat', 'run', 'happy', 'red', 'sing'], rng).slice(0, 4);
        const items = [
            ...preps.map((w, i) => ({ id: `p${i}`, label: w, correct_bin: 'prep' })),
            ...others.map((w, i) => ({ id: `o${i}`, label: w, correct_bin: 'other' })),
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each word: Preposition or Not.',
            items,
            bins: [
                { id: 'prep',  label: 'Preposition' },
                { id: 'other', label: 'Not a Preposition' },
            ],
            hints: ['Common prepositions: in, on, at, under, over, between, behind, beside.'],
            rit_difficulty: 175,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'tap-hotspot') {
        const sentencesWithPrep = _sentencesWithTag('preposition');
        if (sentencesWithPrep.length === 0) return _genPreposition(skillAtom, 'drop-down-inline', rng);
        const sent = _pick(sentencesWithPrep, rng);
        const text = _sentenceText(sent);
        const preps = sent.tokens
            .map((t, i) => ({ ...t, idx: i }))
            .filter(t => t.tag === 'preposition');
        const target = _pick(preps, rng);
        const hotspots = sent.tokens.map((t, i) => ({
            id: `t${i}`,
            label: t.word,
            correct: i === target.idx,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'taphot'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'tap-hotspot',
            skill_atom: skillAtom,
            stem: `Tap the preposition in this sentence:\n\n"${text}"`,
            passage: text,
            hotspots,
            ans: hotspots.find(h => h.correct).id,
            correct_answer: hotspots.find(h => h.correct).id,
            hints: ['Prepositions show where, when, or how.'],
            rit_difficulty: 180,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    if (widget === 'fib-auto') {
        const c = _pick(cases, rng);
        return {
            id: _qid(skillAtom.skill_id, 'fib'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'fib-auto',
            skill_atom: skillAtom,
            stem: c.stem.replace('{{slot:0}}', '{{blank:0}}'),
            ans: [{
                acceptable_answers: [c.correct],
                case_sensitive: false,
                normalize_punctuation: true,
                label: 'Preposition',
            }],
            hints: ['Prepositions show where, when, or how.'],
            rit_difficulty: 178,
            grade_level: skillAtom.developmental_band || '1-2',
            has_audio: false,
            k2_appropriate: true,
        };
    }

    return _genPreposition(skillAtom, 'drop-down-inline', rng);
}

// ─── Atom registry ──────────────────────────────────────────────────────────

// 18-atom registry (under MAX-18 budget).
const ATOM_BUILDERS = {
    'language_grammar_common_proper_noun':       _genCommonProperNoun,
    'language_grammar_common_noun':              _genCommonNoun,
    'language_grammar_compound_noun':            _genCompoundNoun,
    'language_grammar_plural_irregular_nouns':   _genPluralIrregular,
    'language_grammar_possessive_noun_singular': _genPossessiveSingular,
    'language_grammar_possessive_noun_plural':   _genPossessivePlural,
    'language_grammar_subject_pronoun':          _genSubjectPronoun,
    'language_grammar_object_pronoun':           _genObjectPronoun,
    'language_grammar_possessive_pronoun':       _genPossessivePronoun,
    'language_grammar_demonstrative_pronoun':    _genDemonstrative,
    'language_grammar_action_verb_basic':        _genActionVerb,
    'language_grammar_subject_verb_agreement':   _genSubjectVerbAgreement,
    'language_grammar_present_tense':            (a, m, rng) => _genTense(a, m, rng, 'present', 'present'),
    'language_grammar_past_tense_regular':       (a, m, rng) => _genTense(a, m, rng, 'past',    'past'),
    'language_grammar_future_tense':             (a, m, rng) => _genTense(a, m, rng, 'future',  'future'),
    'language_grammar_adjective_basic':          _genAdjective,
    'language_grammar_adverb_of_manner':         (a, m, rng) => _genAdverb(a, m, rng, 'manner'),
    'language_grammar_preposition_basic':        _genPreposition,
};

// Allowed widgets per atom (for mechanic picker — only auto-gradable closed-form)
const ALLOWED_PER_ATOM = {
    'language_grammar_common_proper_noun':       ['sort-into-bins', 'two-button-binary'],
    'language_grammar_common_noun':              ['tap-hotspot', 'two-button-binary', 'sort-into-bins', 'mc-text', 'hot-text-word'],
    'language_grammar_compound_noun':            ['match-pairs', 'mc-text', 'fib-auto'],
    'language_grammar_plural_irregular_nouns':   ['mc-text', 'fib-auto', 'sort-into-bins', 'two-button-binary'],
    'language_grammar_possessive_noun_singular': ['fib-auto', 'mc-text', 'drop-down-inline', 'two-button-binary'],
    'language_grammar_possessive_noun_plural':   ['mc-text', 'fib-auto', 'drop-down-inline', 'two-button-binary'],
    'language_grammar_subject_pronoun':          ['drop-down-inline', 'mc-text', 'fib-auto', 'two-button-binary', 'sort-into-bins'],
    'language_grammar_object_pronoun':           ['drop-down-inline', 'mc-text', 'fib-auto', 'two-button-binary', 'sort-into-bins'],
    'language_grammar_possessive_pronoun':       ['drop-down-inline', 'mc-text', 'fib-auto', 'two-button-binary', 'sort-into-bins'],
    'language_grammar_demonstrative_pronoun':    ['mc-text', 'drop-down-inline', 'two-button-binary', 'fib-auto', 'sort-into-bins'],
    'language_grammar_action_verb_basic':        ['two-button-binary', 'tap-hotspot', 'sort-into-bins', 'mc-text', 'hot-text-word'],
    'language_grammar_subject_verb_agreement':   ['drop-down-inline', 'two-button-binary', 'mc-text', 'fib-auto'],
    'language_grammar_present_tense':            ['drop-down-inline', 'mc-text', 'fib-auto', 'two-button-binary', 'sort-into-bins'],
    'language_grammar_past_tense_regular':       ['fib-auto', 'drop-down-inline', 'mc-text', 'sort-into-bins', 'two-button-binary'],
    'language_grammar_future_tense':             ['drop-down-inline', 'mc-text', 'fib-auto', 'two-button-binary'],
    'language_grammar_adjective_basic':          ['tap-hotspot', 'two-button-binary', 'sort-into-bins', 'mc-text'],
    'language_grammar_adverb_of_manner':         ['tap-hotspot', 'fib-auto', 'mc-text', 'sort-into-bins', 'two-button-binary'],
    'language_grammar_preposition_basic':        ['drop-down-inline', 'mc-text', 'sort-into-bins', 'tap-hotspot', 'fib-auto'],
};

// ─── Public API ─────────────────────────────────────────────────────────────

export function generateGrammarQuestion(skillAtom, mechanicHint = null, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    if (!skillAtom || !skillAtom.skill_id) return _comingSoon(skillAtom);

    const builder = ATOM_BUILDERS[skillAtom.skill_id];
    if (!builder) return _comingSoon(skillAtom);

    const allowed = ALLOWED_PER_ATOM[skillAtom.skill_id];
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng, allowed);
    return builder(skillAtom, mechanic, rng);
}

export function buildGrammarDeck(skillAtom, count = 10, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    if (!skillAtom || !skillAtom.skill_id) {
        return Array.from({ length: count }, () => _comingSoon(skillAtom));
    }

    const allowed = ALLOWED_PER_ATOM[skillAtom.skill_id];
    const baseAvailable = (skillAtom.question_types || ['mc-text'])
        .filter(m => !allowed || allowed.includes(m));
    const available = baseAvailable.length > 0 ? baseAvailable : (skillAtom.question_types || ['mc-text']);

    const window3 = [];
    const deck = [];
    for (let i = 0; i < count; i++) {
        const eligible = available.filter(m => !window3.includes(m));
        const pool = eligible.length > 0 ? eligible : available;
        const mechanic = _pick(pool, rng);
        deck.push(generateGrammarQuestion(skillAtom, mechanic, { rng }));
        window3.push(mechanic);
        if (window3.length > 3) window3.shift();
    }
    return deck;
}

export default { generateGrammarQuestion, buildGrammarDeck };
