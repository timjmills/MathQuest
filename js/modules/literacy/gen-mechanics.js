// gen-mechanics.js — Procedural question generator for Language / Mechanics atoms.
//
// Phase 2 vertical slice: full implementation for:
//   language_mechanics_capitalize_proper_noun_person
//   language_mechanics_capitalize_proper_noun_place
// Generic fallback for all other mechanics atoms.
//
// Stage 1 widget-fallback map:
//   hot-text-word  → tap-hotspot  (text mode — tap the word that needs a capital)
//   drop-down-inline → mc-text   (choose the correct option from a short list)
//   sort-into-bins → dnd-linked  (drag words into Proper-Noun vs Common-Noun bins)
//
// Export:
//   generateMechanicsQuestion(skillAtom, mechanicHint?, options?) → Question

// ─── Word banks ────────────────────────────────────────────────────────────────

const PROPER_NOUNS_PERSON = [
    { word: 'bob',       display: 'bob',       corrected: 'Bob'       },
    { word: 'sara',      display: 'sara',      corrected: 'Sara'      },
    { word: 'mr. smith', display: 'mr. smith', corrected: 'Mr. Smith' },
    { word: 'dr. khan',  display: 'dr. khan',  corrected: 'Dr. Khan'  },
    { word: 'fatima',    display: 'fatima',    corrected: 'Fatima'    },
    { word: 'james',     display: 'james',     corrected: 'James'     },
    { word: 'ms. ali',   display: 'ms. ali',   corrected: 'Ms. Ali'   },
];

const PROPER_NOUNS_PLACE = [
    { word: 'doha',          display: 'doha',          corrected: 'Doha'          },
    { word: 'paris',         display: 'paris',         corrected: 'Paris'         },
    { word: 'qatar',         display: 'qatar',         corrected: 'Qatar'         },
    { word: 'mount everest', display: 'mount everest', corrected: 'Mount Everest' },
    { word: 'broadway',      display: 'broadway',      corrected: 'Broadway'      },
    { word: 'london',        display: 'london',        corrected: 'London'        },
    { word: 'the nile',      display: 'the nile',      corrected: 'The Nile'      },
];

const COMMON_NOUNS = [
    'city', 'doctor', 'teacher', 'cat', 'mountain', 'river', 'street',
    'country', 'school', 'park', 'book', 'friend',
];

// Sentence templates for fib-auto and mc-text variants.
// Each entry: { template, blanks[], correct, options[] }
// {{name}} is replaced with a lower-case proper noun at generation time.
const PERSON_SENTENCE_TEMPLATES = [
    { template: 'My friend {{name}} loves to read.',         useCapital: true  },
    { template: '{{name}} went to the store after school.',  useCapital: true  },
    { template: 'Our teacher thanked {{name}} for her help.',useCapital: true  },
    { template: 'The letter was written to {{name}}.',       useCapital: true  },
];

const PLACE_SENTENCE_TEMPLATES = [
    { template: 'We traveled all the way to {{name}} last summer.',  useCapital: true },
    { template: 'The tallest peak is {{name}}.',                     useCapital: true },
    { template: 'My family is from {{name}}.',                       useCapital: true },
    { template: 'They visited {{name}} on their holiday.',           useCapital: true },
];

// ─── Stage 1 fallbacks ────────────────────────────────────────────────────────

const STAGE1_FALLBACK = {
    'hot-text-word':   'tap-hotspot',
    'drop-down-inline':'mc-text',
    'sort-into-bins':  'dnd-linked',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function _pickMechanic(skillAtom, hint, rng) {
    const pool = Array.isArray(skillAtom.question_types) && skillAtom.question_types.length > 0
        ? skillAtom.question_types
        : ['two-button-binary'];
    if (hint && pool.includes(hint)) return hint;
    return pool[Math.floor(rng() * pool.length)];
}

function _qid(skillId, suffix) {
    return `${skillId}_${Date.now()}_${suffix}`;
}

function _sample(arr, n, rng) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
}

/** Capitalise the first letter of a word (handles multi-word entries). */
function _capitalize(str) {
    return str.replace(/(?:^|\s)\S/g, ch => ch.toUpperCase());
}

/** Return the combined proper-noun pool for person+place atoms. */
function _properPool(skillId) {
    if (skillId === 'language_mechanics_capitalize_proper_noun_person') {
        return PROPER_NOUNS_PERSON;
    }
    if (skillId === 'language_mechanics_capitalize_proper_noun_place') {
        return PROPER_NOUNS_PLACE;
    }
    // Both combined as fallback
    return [...PROPER_NOUNS_PERSON, ...PROPER_NOUNS_PLACE];
}

function _sentencePool(skillId) {
    if (skillId === 'language_mechanics_capitalize_proper_noun_person') {
        return PERSON_SENTENCE_TEMPLATES;
    }
    if (skillId === 'language_mechanics_capitalize_proper_noun_place') {
        return PLACE_SENTENCE_TEMPLATES;
    }
    return [...PERSON_SENTENCE_TEMPLATES, ...PLACE_SENTENCE_TEMPLATES];
}

// ─── two-button-binary variants ───────────────────────────────────────────────

/**
 * two-button-binary — proper noun capitalization drill.
 *   Subject: a random lower-case proper or common noun.
 *   Correct: "Capitalize" for proper nouns; "No Capital" for common nouns.
 *   ~70 % proper (the target skill), ~30 % common (to prevent guessing).
 */
function _twoButtonBinary(skillAtom, rng) {
    const properPool = _properPool(skillAtom.skill_id);

    // 30 % chance of presenting a common-noun foil to prevent guessing bias
    const showCommon = rng() < 0.3;

    let subject, isProper, hint2;
    if (showCommon) {
        [subject] = _sample(COMMON_NOUNS, 1, rng);
        isProper = false;
        hint2 = `"${subject}" is a common noun — it does not name a specific person or place.`;
    } else {
        const entry = _sample(properPool, 1, rng)[0];
        subject = entry.display;
        isProper = true;
        hint2 = `"${entry.corrected}" is a proper noun — always capitalize specific names.`;
    }

    const correctId = isProper ? 'yes' : 'no';
    const skillLabel = skillAtom.skill_id.includes('person')
        ? 'Capitalize: People'
        : 'Capitalize: Places';

    return {
        id: _qid(skillAtom.skill_id, 'tbb'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'two-button-binary',
        stem: 'Should this word be capitalized?',
        subject,
        options: [
            { id: 'yes', label: 'Capitalize' },
            { id: 'no',  label: 'No Capital'  },
        ],
        correct_answer: correctId,
        ans: correctId,
        distractor_misconceptions: {
            [correctId === 'yes' ? 'no' : 'yes']: isProper
                ? `"${subject}" names a specific person or place — always capitalize it.`
                : `"${subject}" is a common noun — do not capitalize.`,
        },
        hints: [
            'Proper nouns name specific people, places, or things. They always start with a capital letter.',
            hint2,
        ],
        rit_difficulty: 163,
        grade_level: 'K-1',
        has_audio: true,
        k2_appropriate: true,
        skillLabel,
        title: skillLabel,
        audio_text: subject,
    };
}

// ─── tap-hotspot variant (replaces hot-text-word) ─────────────────────────────

/**
 * tap-hotspot — tap the word in the sentence that needs to be capitalized.
 * The sentence is rendered with one or two lower-case proper nouns embedded.
 * tap-hotspot contract: q.items[] = [{ id, label, correct }] + q.stem as HTML.
 */
function _tapHotspot(skillAtom, rng) {
    const pool = _properPool(skillAtom.skill_id);
    const sentPool = _sentencePool(skillAtom.skill_id);
    const tmpl = _sample(sentPool, 1, rng)[0];
    const entry = _sample(pool, 1, rng)[0];

    // Build the sentence, keeping the target word lower-case
    const sentence = tmpl.template.replace('{{name}}', entry.display);
    // Split into word tokens; mark which token is the proper-noun target
    const words = sentence.split(/\s+/);
    const targetWord = entry.display.split(/\s+/)[0];   // first word of the name
    const targetIdx = words.findIndex(
        w => w.toLowerCase().replace(/[^a-z]/g, '') === targetWord.toLowerCase().replace(/[^a-z]/g, '')
    );

    const items = words.map((w, i) => ({
        id: `word_${i}`,
        label: w,
        correct: i === targetIdx,
    }));

    return {
        id: _qid(skillAtom.skill_id, 'tap'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'tap-hotspot',
        stem: 'Tap the word that needs a capital letter.',
        sentence,
        items,
        correct_answer: `word_${targetIdx}`,
        ans: `word_${targetIdx}`,
        distractor_misconceptions: {},
        hints: [
            'Look for the name of a specific person or place.',
            `"${entry.display}" is a proper noun — it should start with a capital letter.`,
        ],
        rit_difficulty: 165,
        grade_level: '1-2',
        has_audio: false,
        k2_appropriate: false,
    };
}

// ─── mc-text variant (replaces drop-down-inline) ──────────────────────────────

/**
 * mc-text — "Which sentence is correctly capitalized?"
 * Three options: one correctly capitalized, two with errors.
 */
function _mcText(skillAtom, rng) {
    const pool = _properPool(skillAtom.skill_id);
    const sentPool = _sentencePool(skillAtom.skill_id);
    const [tmpl1, tmpl2, tmpl3] = _sample(sentPool, Math.min(3, sentPool.length), rng);
    const [e1, e2, e3] = _sample(pool, Math.min(3, pool.length), rng);

    function fill(tmpl, entry) {
        return tmpl.template.replace('{{name}}', entry.display);
    }
    function fillCorrect(tmpl, entry) {
        return tmpl.template.replace('{{name}}', entry.corrected).replace(/^./, c => c.toUpperCase());
    }

    const correctSentence = fillCorrect(tmpl1, e1);
    // Wrong options: lowercase proper noun or missing start capital
    const wrong1 = fill(tmpl2, e2);   // proper noun left lower-case
    const wrong2 = fillCorrect(tmpl3, e3).replace(/^./, c => c.toLowerCase()); // missing sentence capital

    const shuffled = _sample([
        { id: 'a', label: correctSentence, correct: true  },
        { id: 'b', label: wrong1,          correct: false },
        { id: 'c', label: wrong2,          correct: false },
    ], 3, rng);

    // Re-assign ids after shuffle so they stay a/b/c
    const opts = shuffled.map((o, i) => ({ ...o, id: String.fromCharCode(97 + i) }));
    const correctOpt = opts.find(o => o.correct);

    return {
        id: _qid(skillAtom.skill_id, 'mct'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        stem: 'Which sentence is correctly capitalized?',
        options: opts.map(o => ({ id: o.id, label: o.label, correct: o.correct })),
        correct_answer: correctOpt.id,
        ans: correctOpt.id,
        distractor_misconceptions: {
            [opts.find(o => !o.correct && o.label === wrong1)?.id]: 'The proper noun needs a capital letter.',
            [opts.find(o => !o.correct && o.label === wrong2)?.id]: 'The first word of the sentence must be capitalized.',
        },
        hints: [
            'Check: does every sentence start with a capital? Do all proper nouns start with a capital?',
        ],
        rit_difficulty: 168,
        grade_level: '1-2',
        has_audio: false,
        k2_appropriate: false,
    };
}

// ─── fib-auto variant ─────────────────────────────────────────────────────────

/**
 * fib-auto — "Type this sentence correctly."
 * Provide the lower-case sentence; accept the correctly capitalized version.
 * case_sensitive: true so capitalization is enforced.
 */
function _fibAuto(skillAtom, rng) {
    const pool = _properPool(skillAtom.skill_id);
    const sentPool = _sentencePool(skillAtom.skill_id);
    const tmpl = _sample(sentPool, 1, rng)[0];
    const entry = _sample(pool, 1, rng)[0];

    const lowercaseSentence = tmpl.template.replace('{{name}}', entry.display).toLowerCase();
    const correctSentence = tmpl.template
        .replace('{{name}}', entry.corrected)
        .replace(/^./, c => c.toUpperCase());

    return {
        id: _qid(skillAtom.skill_id, 'fib'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        stem: `Type this sentence correctly:\n"${lowercaseSentence}"`,
        ans: [{
            acceptable_answers: [correctSentence],
            case_sensitive: true,
            normalize_whitespace: true,
            normalize_punctuation: false,
            label: 'Type the corrected sentence',
        }],
        correct_answer: correctSentence,
        distractor_misconceptions: {},
        hints: [
            'Start every sentence with a capital letter.',
            `"${entry.display}" is a proper noun — capitalize it: "${entry.corrected}".`,
        ],
        rit_difficulty: 170,
        grade_level: '1-2',
        has_audio: false,
        k2_appropriate: false,
        partial_credit: false,
    };
}

// ─── dnd-linked variant (replaces sort-into-bins) ────────────────────────────

/**
 * dnd-linked sort-into-bins — drag words into "Proper Noun (Capitalize)" vs
 * "Common Noun (No Capital)" bins.
 */
function _dndSort(skillAtom, rng) {
    const properPool = _properPool(skillAtom.skill_id);
    const properEntries = _sample(properPool, 3, rng);
    const commonWords = _sample(COMMON_NOUNS, 2, rng);

    const allWords = _sample([
        ...properEntries.map(e => ({ word: e.display, isProper: true })),
        ...commonWords.map(w => ({ word: w, isProper: false })),
    ], 5, rng);

    const draggables = allWords.map((item, i) => ({
        id: `w${i}`,
        label: item.word,
        audio_text: item.word,
    }));

    const correctAns = {};
    allWords.forEach((item, i) => {
        correctAns[`w${i}`] = item.isProper ? 'bin_proper' : 'bin_common';
    });

    return {
        id: _qid(skillAtom.skill_id, 'sort'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'dnd-linked',
        stem: 'Sort each word: proper noun (needs a capital) or common noun (no capital)?',
        draggables,
        zones: [
            { id: 'bin_proper', label: 'Proper Noun → Capitalize', accepts: allWords.flatMap((w, i) => w.isProper ? [`w${i}`] : []) },
            { id: 'bin_common', label: 'Common Noun → No Capital', accepts: allWords.flatMap((w, i) => !w.isProper ? [`w${i}`] : []) },
        ],
        ans: correctAns,
        correct_answer: correctAns,
        distractor_misconceptions: {},
        hints: [
            'A proper noun names a specific person or place. It always gets a capital letter.',
            'Common nouns name any person, place, or thing in general — no capital needed in the middle of a sentence.',
        ],
        rit_difficulty: 166,
        grade_level: '1-2',
        has_audio: false,
        k2_appropriate: false,
    };
}

// ─── Generic fallback ─────────────────────────────────────────────────────────

/**
 * Coming-soon sentinel for mechanics atoms not yet fully implemented.
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
        rit_difficulty: 165,
        grade_level: skillAtom.developmental_band || '1-2',
        has_audio: false,
        k2_appropriate: false,
    };
}

// ─── Dispatcher helpers ────────────────────────────────────────────────────────

const SUPPORTED_SKILLS = new Set([
    'language_mechanics_capitalize_proper_noun_person',
    'language_mechanics_capitalize_proper_noun_place',
]);

function _dispatchCapitalize(skillAtom, widgetMechanic, originalMechanic, rng) {
    switch (widgetMechanic) {
        case 'two-button-binary': return _twoButtonBinary(skillAtom, rng);
        case 'tap-hotspot':       return _tapHotspot(skillAtom, rng);
        case 'mc-text':           return _mcText(skillAtom, rng);
        case 'fib-auto':          return _fibAuto(skillAtom, rng);
        case 'dnd-linked':        return _dndSort(skillAtom, rng);
        default:                  return _twoButtonBinary(skillAtom, rng);
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a single Literacy Quest Question for a mechanics SkillAtom.
 *
 * @param {import('../../../../data/literacy-skills/language/mechanics.js').default[number]} skillAtom
 * @param {string|null} [mechanicHint]
 * @param {{ rng?: () => number, ellMode?: boolean, spedMode?: boolean }} [options]
 * @returns {import('../../../../docs/literacy-quest/DATA_MODEL').Question}
 */
export function generateMechanicsQuestion(skillAtom, mechanicHint = null, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    const skillId = skillAtom.skill_id;

    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widgetMechanic = STAGE1_FALLBACK[mechanic] || mechanic;

    if (SUPPORTED_SKILLS.has(skillId)) {
        return _dispatchCapitalize(skillAtom, widgetMechanic, mechanic, rng);
    }

    // All other mechanics atoms: generic fallback
    return _genericMcText(skillAtom);
}

/**
 * Build a deck of `count` questions for a mechanics SkillAtom, rotating
 * mechanics to meet the Variety Rule (no repeat within a 3-card window).
 *
 * @param {object}  skillAtom
 * @param {number}  [count=10]
 * @param {object}  [options]
 * @returns {import('../../../../docs/literacy-quest/DATA_MODEL').Question[]}
 */
export function buildMechanicsDeck(skillAtom, count = 10, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    const available = Array.isArray(skillAtom.question_types) && skillAtom.question_types.length > 0
        ? skillAtom.question_types
        : ['two-button-binary'];

    const deck = [];
    const window3 = [];

    for (let i = 0; i < count; i++) {
        const eligible = available.filter(m => !window3.includes(m));
        const pool = eligible.length > 0 ? eligible : available;
        const mechanic = pool[Math.floor(rng() * pool.length)];

        deck.push(generateMechanicsQuestion(skillAtom, mechanic, { ...options, rng }));

        window3.push(mechanic);
        if (window3.length > 3) window3.shift();
    }

    return deck;
}
