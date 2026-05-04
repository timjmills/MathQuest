// gen-phonics.js — Procedural question generator for Phonics & Decoding atoms.
//
// Phase 2 vertical slice: full implementation for `reading_phonics_short_a_initial`.
// Generic fallback for all other phonics atoms (Phase 2 expansion will fill each in).
//
// Stage 1 widget-fallback map:
//   letter-tile-spell → fib-auto   (single blank, letter-by-letter input)
//   sort-into-bins    → dnd-linked  (drag words into Has /æ/ vs No /æ/ bins)
//   sound-box         → dnd-linked  (drag phoneme chips into ordered boxes)
//
// Export:
//   generatePhonicsQuestion(skillAtom, mechanicHint?, options?) → Question

// ─── Word banks ────────────────────────────────────────────────────────────────

const SHORT_A_INITIAL_WORDS = ['apple', 'ant', 'axe', 'add', 'ask'];
const SHORT_A_MEDIAL_WORDS  = ['cat', 'hat', 'bag', 'can', 'pan', 'mad', 'tap', 'map', 'bat', 'cap'];
const NON_SHORT_A_WORDS     = ['banana', 'dog', 'pig', 'sun', 'moon', 'egg', 'cup', 'box', 'top', 'hen'];

// Emoji image stand-ins used until real CDN image URLs are available.
// mc-image widget accepts q.options[i].image as a URL; here we use a data-URI
// wrapper so the emoji renders identically in all browsers.
const WORD_EMOJI = {
    // short-a initial
    apple: '🍎',  ant: '🐜',  axe: '🪓',  add: '➕',  ask: '❓',
    // short-a medial
    cat: '🐱',   hat: '🎩',  bag: '👜',  can: '🥫',  pan: '🍳',
    mad: '😠',   tap: '🚰',  map: '🗺️',  bat: '🦇',  cap: '🧢',
    // non-short-a distractors
    banana: '🍌', dog: '🐕',  pig: '🐷',  sun: '☀️',  moon: '🌙',
    egg:  '🥚',  cup: '☕',  box: '📦',  top: '🔝',  hen: '🐔',
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

// ─── Generic fallback (Phase 2 expansion) ────────────────────────────────────

/**
 * Minimal mc-text fallback for phonics atoms not yet fully implemented.
 * Returns a valid Question so the session never crashes.
 */
function _genericMcText(skillAtom) {
    return {
        id: _qid(skillAtom.skill_id, 'gen'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        stem: `[${skillAtom.skill_statement}] — generator coming in Phase 2.`,
        options: [
            { id: 'a', label: 'Option A', correct: true },
            { id: 'b', label: 'Option B', correct: false },
            { id: 'c', label: 'Option C', correct: false },
        ],
        correct_answer: 'a',
        ans: 'a',
        distractor_misconceptions: {},
        hints: [skillAtom.ell_scaffold || ''],
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

    // All other phonics atoms: generic fallback until Phase 2 expands them.
    return _genericMcText(skillAtom);
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
