// gen-mechanics.js — Procedural question generator for Language / Mechanics atoms.
//
// Phase 2 vertical slice: full implementation for ALL 12 capitalization atoms:
//   language_mechanics_capitalize_sentence_start
//   language_mechanics_capitalize_pronoun_i
//   language_mechanics_capitalize_proper_noun_person
//   language_mechanics_capitalize_proper_noun_place
//   language_mechanics_capitalize_proper_noun_months_days
//   language_mechanics_capitalize_proper_noun_titles_acronyms
//   language_mechanics_capitalize_proper_adjectives
//   language_mechanics_capitalize_direct_quotation
//   language_mechanics_capitalize_letter_greeting_closing
//   language_mechanics_capitalize_poetry_line
//   language_mechanics_capitalize_geographic_names
//   language_mechanics_capitalize_titles_of_works
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

// ── New word banks for the 10 additional capitalization atoms ─────────────────

// Months and days
const MONTHS_DAYS = [
    { word: 'january',   corrected: 'January'   },
    { word: 'february',  corrected: 'February'  },
    { word: 'march',     corrected: 'March'     },
    { word: 'april',     corrected: 'April'     },
    { word: 'may',       corrected: 'May'       },
    { word: 'monday',    corrected: 'Monday'    },
    { word: 'tuesday',   corrected: 'Tuesday'   },
    { word: 'wednesday', corrected: 'Wednesday' },
    { word: 'saturday',  corrected: 'Saturday'  },
    { word: 'sunday',    corrected: 'Sunday'    },
];
const COMMON_TIME_NOUNS = ['month', 'day', 'week', 'year', 'season', 'morning', 'night'];

// Titles / acronyms
const TITLES_PEOPLE = [
    { word: 'dr. lee',     corrected: 'Dr. Lee'     },
    { word: 'mrs. brown',  corrected: 'Mrs. Brown'  },
    { word: 'president washington', corrected: 'President Washington' },
    { word: 'coach miller', corrected: 'Coach Miller' },
];
const ACRONYMS = [
    { word: 'nasa',   corrected: 'NASA'   },
    { word: 'unicef', corrected: 'UNICEF' },
    { word: 'fbi',    corrected: 'FBI'    },
    { word: 'usa',    corrected: 'USA'    },
    { word: 'mit',    corrected: 'MIT'    },
];

// Proper adjectives
const PROPER_ADJ = [
    { word: 'american', corrected: 'American', noun: 'America' },
    { word: 'french',   corrected: 'French',   noun: 'France'  },
    { word: 'spanish',  corrected: 'Spanish',  noun: 'Spain'   },
    { word: 'mexican',  corrected: 'Mexican',  noun: 'Mexico'  },
    { word: 'korean',   corrected: 'Korean',   noun: 'Korea'   },
    { word: 'italian',  corrected: 'Italian',  noun: 'Italy'   },
];
const COMMON_ADJ = ['tall', 'small', 'happy', 'fast', 'warm', 'soft', 'bright'];

// Direct quotation
const QUOTE_SENTENCES = [
    { raw: 'sara said, "i love books."',            corrected: 'Sara said, "I love books."',           firstQuoteWord: 'i',  correctedFirst: 'I'  },
    { raw: 'the teacher said, "we will start now."',corrected: 'The teacher said, "We will start now."',firstQuoteWord: 'we', correctedFirst: 'We' },
    { raw: 'mom called, "dinner is ready!"',         corrected: 'Mom called, "Dinner is ready!"',       firstQuoteWord: 'dinner', correctedFirst: 'Dinner' },
    { raw: 'he shouted, "look over there!"',         corrected: 'He shouted, "Look over there!"',       firstQuoteWord: 'look', correctedFirst: 'Look' },
];

// Letter greeting / closing
const GREETINGS = [
    { raw: 'dear maria,', corrected: 'Dear Maria,', targetWord: 'dear', idx: 0 },
    { raw: 'dear mr. jones,', corrected: 'Dear Mr. Jones,', targetWord: 'dear', idx: 0 },
    { raw: 'dear friends,', corrected: 'Dear Friends,', targetWord: 'dear', idx: 0 },
];
const CLOSINGS = [
    { raw: 'sincerely,', corrected: 'Sincerely,', targetWord: 'sincerely', idx: 0 },
    { raw: 'your friend,', corrected: 'Your Friend,', targetWord: 'your', idx: 0 },
    { raw: 'with love,', corrected: 'With Love,', targetWord: 'with', idx: 0 },
];

// Poetry lines
const POEM_LINES_CORRECT = [
    'The wind blows soft and free,',
    'A bird sang in the tree,',
    'Stars shine above at night,',
    'The sun brings morning light,',
];
const POEM_LINES_WRONG = [
    'the wind blows soft and free,',
    'a bird sang in the tree,',
    'stars shine above at night,',
    'the sun brings morning light,',
];

// Geographic names
const GEO_NAMES = [
    { word: 'pacific ocean',   corrected: 'Pacific Ocean'   },
    { word: 'sahara desert',   corrected: 'Sahara Desert'   },
    { word: 'amazon river',    corrected: 'Amazon River'    },
    { word: 'mount everest',   corrected: 'Mount Everest'   },
    { word: 'nile river',      corrected: 'Nile River'      },
    { word: 'rocky mountains', corrected: 'Rocky Mountains' },
];
const COMMON_GEO_NOUNS = ['ocean', 'desert', 'river', 'mountain', 'lake', 'valley', 'forest'];

// Titles of works (books, films)
const TITLES_OF_WORKS = [
    { raw: 'harry potter',              corrected: 'Harry Potter'              },
    { raw: 'the cat in the hat',        corrected: 'The Cat in the Hat'        },
    { raw: 'lord of the rings',         corrected: 'Lord of the Rings'         },
    { raw: 'charlotte\'s web',          corrected: "Charlotte's Web"           },
    { raw: 'the wizard of oz',          corrected: 'The Wizard of Oz'          },
];

// Sentences needing capitalized sentence start (all-lowercase first word)
const SENTENCES_NEED_CAP_START = [
    { raw: 'the dog ran fast.',           corrected: 'The dog ran fast.'           },
    { raw: 'my friend lives near the park.', corrected: 'My friend lives near the park.' },
    { raw: 'we played soccer yesterday.', corrected: 'We played soccer yesterday.' },
    { raw: 'school starts at eight.',     corrected: 'School starts at eight.'     },
    { raw: 'birds fly south in winter.',  corrected: 'Birds fly south in winter.'  },
];

// Sentences for pronoun I drill
const PRONOUN_I_SENTENCES = [
    { raw: 'today i went to school.',        corrected: 'Today I went to school.',        targetWord: 'i' },
    { raw: 'my mom and i baked cookies.',    corrected: 'My mom and I baked cookies.',    targetWord: 'i' },
    { raw: 'i have a red backpack.',         corrected: 'I have a red backpack.',         targetWord: 'i' },
    { raw: 'can i help you with that?',      corrected: 'Can I help you with that?',      targetWord: 'i' },
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

// ─── Unified capitalization generator ────────────────────────────────────────
//
// Handles all 12 capitalize_* atoms. capKey is the portion after
// "language_mechanics_capitalize_" — e.g. "sentence_start", "pronoun_i", etc.

function _generateCapitalizationQuestion(skillAtom, capKey, rng, widgetMechanic) {

    // ── sentence_start ─────────────────────────────────────────────────────────
    if (capKey === 'sentence_start') {
        const entry = _sample(SENTENCES_NEED_CAP_START, 1, rng)[0];

        if (widgetMechanic === 'two-button-binary') {
            // Show first word of a sentence; ask if it should be capitalized.
            // 70% show a sentence-start word (needs cap), 30% show a mid-sentence word.
            const needsCap = rng() >= 0.3;
            const subject = needsCap
                ? entry.raw.split(' ')[0]          // e.g. "the"
                : _sample(COMMON_NOUNS, 1, rng)[0]; // mid-sentence common noun
            const correctId = needsCap ? 'yes' : 'no';
            return {
                id: _qid(skillAtom.skill_id, 'tbb'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'two-button-binary',
                stem: 'Is this the first word of a sentence? Should it be capitalized?',
                subject,
                options: [{ id: 'yes', label: 'Capitalize' }, { id: 'no', label: 'No Capital' }],
                correct_answer: correctId,
                ans: correctId,
                hints: ['Every sentence starts with a capital letter.'],
                rit_difficulty: 155,
                grade_level: 'K-1',
                has_audio: true,
                k2_appropriate: true,
                skillLabel: 'Capitalize: Sentence Start',
                title: 'Capitalize: Sentence Start',
                audio_text: subject,
            };
        }

        if (widgetMechanic === 'tap-hotspot') {
            const words = entry.raw.split(' ');
            const items = words.map((w, i) => ({ id: `w${i}`, label: w, correct: i === 0 }));
            return {
                id: _qid(skillAtom.skill_id, 'tap'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'tap-hotspot',
                stem: 'Tap the word that needs a capital letter.',
                sentence: entry.raw,
                items,
                correct_answer: 'w0',
                ans: 'w0',
                hints: ['The first word of every sentence must be capitalized.'],
                rit_difficulty: 155,
                grade_level: 'K-1',
                has_audio: false,
                k2_appropriate: true,
            };
        }

        if (widgetMechanic === 'fib-auto') {
            return {
                id: _qid(skillAtom.skill_id, 'fib'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'fib-auto',
                stem: `Type this sentence correctly:\n"${entry.raw}"`,
                ans: [{ acceptable_answers: [entry.corrected], case_sensitive: true, normalize_whitespace: true, normalize_punctuation: false, label: 'Corrected sentence' }],
                correct_answer: entry.corrected,
                hints: ['Start the sentence with a capital letter.'],
                rit_difficulty: 158,
                grade_level: 'K-1',
                has_audio: false,
                k2_appropriate: false,
                partial_credit: false,
            };
        }

        // mc-text fallback
        const correct = entry.corrected;
        const wrong1  = entry.raw; // all lowercase start
        const entry2  = _sample(SENTENCES_NEED_CAP_START.filter(e => e !== entry), 1, rng)[0];
        const wrong2  = entry2.raw.replace(/^./, c => c.toUpperCase()).replace(/\.$/, '');  // missing period distractor
        const opts = _sample([
            { id: 'a', label: correct, correct: true  },
            { id: 'b', label: wrong1,  correct: false },
            { id: 'c', label: wrong2,  correct: false },
        ], 3, rng).map((o, i) => ({ ...o, id: String.fromCharCode(97 + i) }));
        const correctOpt = opts.find(o => o.correct);
        return {
            id: _qid(skillAtom.skill_id, 'mct'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            stem: 'Which sentence is correctly capitalized?',
            options: opts,
            correct_answer: correctOpt.id,
            ans: correctOpt.id,
            hints: ['Every sentence begins with a capital letter.'],
            rit_difficulty: 157,
            grade_level: 'K-1',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    // ── pronoun_i ──────────────────────────────────────────────────────────────
    if (capKey === 'pronoun_i') {
        const entry = _sample(PRONOUN_I_SENTENCES, 1, rng)[0];

        if (widgetMechanic === 'two-button-binary') {
            // Show "i" (lowercase pronoun) vs a random common noun; ask if it needs capital.
            const showI = rng() >= 0.3;
            const subject = showI ? 'i' : _sample(COMMON_NOUNS, 1, rng)[0];
            const correctId = showI ? 'yes' : 'no';
            return {
                id: _qid(skillAtom.skill_id, 'tbb'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'two-button-binary',
                stem: 'Does this word always need a capital letter?',
                subject,
                options: [{ id: 'yes', label: 'Capitalize' }, { id: 'no', label: 'No Capital' }],
                correct_answer: correctId,
                ans: correctId,
                hints: ['The pronoun "I" is always written as a capital letter in English.'],
                rit_difficulty: 158,
                grade_level: 'K-1',
                has_audio: true,
                k2_appropriate: true,
                skillLabel: 'Capitalize: Pronoun I',
                title: 'Capitalize: Pronoun I',
                audio_text: subject,
            };
        }

        if (widgetMechanic === 'tap-hotspot') {
            const words = entry.raw.split(' ');
            const targetIdx = words.findIndex(w => w.toLowerCase() === 'i' || w.toLowerCase() === 'i,');
            const items = words.map((w, i) => ({ id: `w${i}`, label: w, correct: i === targetIdx }));
            return {
                id: _qid(skillAtom.skill_id, 'tap'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'tap-hotspot',
                stem: 'Tap the word that needs a capital letter.',
                sentence: entry.raw,
                items,
                correct_answer: `w${targetIdx}`,
                ans: `w${targetIdx}`,
                hints: ['Find the pronoun "i" — it must always be written as "I".'],
                rit_difficulty: 160,
                grade_level: 'K-1',
                has_audio: false,
                k2_appropriate: true,
            };
        }

        if (widgetMechanic === 'fib-auto') {
            return {
                id: _qid(skillAtom.skill_id, 'fib'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'fib-auto',
                stem: `Type this sentence correctly:\n"${entry.raw}"`,
                ans: [{ acceptable_answers: [entry.corrected], case_sensitive: true, normalize_whitespace: true, normalize_punctuation: false, label: 'Corrected sentence' }],
                correct_answer: entry.corrected,
                hints: ['The pronoun "I" is always capitalized.'],
                rit_difficulty: 162,
                grade_level: '1',
                has_audio: false,
                k2_appropriate: false,
                partial_credit: false,
            };
        }

        // mc-text
        const correct = entry.corrected;
        const wrong1  = entry.raw;
        const e2 = _sample(PRONOUN_I_SENTENCES.filter(e => e !== entry), 1, rng)[0];
        const wrong2  = e2.raw;
        const opts = _sample([
            { id: 'a', label: correct, correct: true  },
            { id: 'b', label: wrong1,  correct: false },
            { id: 'c', label: wrong2,  correct: false },
        ], 3, rng).map((o, i) => ({ ...o, id: String.fromCharCode(97 + i) }));
        const correctOpt = opts.find(o => o.correct);
        return {
            id: _qid(skillAtom.skill_id, 'mct'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            stem: 'Which sentence uses "I" correctly?',
            options: opts,
            correct_answer: correctOpt.id,
            ans: correctOpt.id,
            hints: ['The pronoun "I" is always written as a capital letter.'],
            rit_difficulty: 160,
            grade_level: 'K-1',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    // ── proper_noun_months_days ────────────────────────────────────────────────
    if (capKey === 'proper_noun_months_days') {
        if (widgetMechanic === 'two-button-binary') {
            const showMonthDay = rng() >= 0.3;
            let subject, correctId, hint2;
            if (showMonthDay) {
                const entry = _sample(MONTHS_DAYS, 1, rng)[0];
                subject = entry.word;
                correctId = 'yes';
                hint2 = `"${entry.corrected}" is the name of a month or day — always capitalize it.`;
            } else {
                subject = _sample(COMMON_TIME_NOUNS, 1, rng)[0];
                correctId = 'no';
                hint2 = `"${subject}" is a common time noun — it does not need a capital.`;
            }
            return {
                id: _qid(skillAtom.skill_id, 'tbb'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'two-button-binary',
                stem: 'Should this word be capitalized?',
                subject,
                options: [{ id: 'yes', label: 'Capitalize' }, { id: 'no', label: 'No Capital' }],
                correct_answer: correctId,
                ans: correctId,
                hints: ['Names of months (January, March) and days of the week (Monday, Friday) are always capitalized.', hint2],
                rit_difficulty: 163,
                grade_level: '1-2',
                has_audio: true,
                k2_appropriate: true,
                skillLabel: 'Capitalize: Months & Days',
                title: 'Capitalize: Months & Days',
                audio_text: subject,
            };
        }

        if (widgetMechanic === 'fib-auto') {
            const entry = _sample(MONTHS_DAYS, 1, rng)[0];
            const raw = `my birthday is in ${entry.word}.`;
            const corrected = `My birthday is in ${entry.corrected}.`;
            return {
                id: _qid(skillAtom.skill_id, 'fib'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'fib-auto',
                stem: `Type this sentence correctly:\n"${raw}"`,
                ans: [{ acceptable_answers: [corrected], case_sensitive: true, normalize_whitespace: true, normalize_punctuation: false, label: 'Corrected sentence' }],
                correct_answer: corrected,
                hints: ['Capitalize names of months and days.'],
                rit_difficulty: 165,
                grade_level: '1-2',
                has_audio: false,
                k2_appropriate: false,
                partial_credit: false,
            };
        }

        if (widgetMechanic === 'dnd-linked') {
            const monthDayEntries = _sample(MONTHS_DAYS, 3, rng);
            const commonWords = _sample(COMMON_TIME_NOUNS, 2, rng);
            const allItems = _sample([
                ...monthDayEntries.map(e => ({ word: e.word, isProper: true })),
                ...commonWords.map(w => ({ word: w, isProper: false })),
            ], 5, rng);
            const draggables = allItems.map((item, i) => ({ id: `w${i}`, label: item.word, audio_text: item.word }));
            const correctAns = {};
            allItems.forEach((item, i) => { correctAns[`w${i}`] = item.isProper ? 'bin_proper' : 'bin_common'; });
            return {
                id: _qid(skillAtom.skill_id, 'sort'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'dnd-linked',
                stem: 'Sort each word: name of a month or day (capitalize) or common time word (no capital)?',
                draggables,
                zones: [
                    { id: 'bin_proper', label: 'Month or Day → Capitalize', accepts: allItems.flatMap((w, i) => w.isProper ? [`w${i}`] : []) },
                    { id: 'bin_common', label: 'Common Time Word → No Capital', accepts: allItems.flatMap((w, i) => !w.isProper ? [`w${i}`] : []) },
                ],
                ans: correctAns,
                correct_answer: correctAns,
                hints: ['Names of months and days are proper nouns — they always get a capital.'],
                rit_difficulty: 164,
                grade_level: '1-2',
                has_audio: false,
                k2_appropriate: false,
            };
        }

        // mc-text / tap-hotspot default
        const e1 = _sample(MONTHS_DAYS, 1, rng)[0];
        const correct = `We have school on ${e1.corrected}.`;
        const wrong1  = `We have school on ${e1.word}.`;
        const e2 = _sample(MONTHS_DAYS.filter(e => e !== e1), 1, rng)[0];
        const wrong2  = `we have school on ${e2.corrected}.`;
        const opts = _sample([
            { id: 'a', label: correct, correct: true  },
            { id: 'b', label: wrong1,  correct: false },
            { id: 'c', label: wrong2,  correct: false },
        ], 3, rng).map((o, i) => ({ ...o, id: String.fromCharCode(97 + i) }));
        const correctOpt = opts.find(o => o.correct);
        return {
            id: _qid(skillAtom.skill_id, 'mct'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            stem: 'Which sentence is correctly capitalized?',
            options: opts,
            correct_answer: correctOpt.id,
            ans: correctOpt.id,
            hints: ['Names of months and days of the week are always capitalized.'],
            rit_difficulty: 165,
            grade_level: '1-2',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    // ── proper_noun_titles_acronyms ────────────────────────────────────────────
    if (capKey === 'proper_noun_titles_acronyms') {
        // Mix: 50% title drill, 50% acronym drill
        const useAcronym = rng() < 0.5;

        if (widgetMechanic === 'two-button-binary') {
            let subject, correctId, hint2;
            if (useAcronym) {
                const showAcronym = rng() >= 0.3;
                if (showAcronym) {
                    const entry = _sample(ACRONYMS, 1, rng)[0];
                    subject = entry.word;  // lowercase e.g. "nasa"
                    correctId = 'yes';
                    hint2 = `"${entry.corrected}" is an acronym — each letter is capitalized.`;
                } else {
                    subject = _sample(COMMON_NOUNS, 1, rng)[0];
                    correctId = 'no';
                    hint2 = `"${subject}" is a common noun — no capital needed.`;
                }
            } else {
                const showTitle = rng() >= 0.3;
                if (showTitle) {
                    const entry = _sample(TITLES_PEOPLE, 1, rng)[0];
                    subject = entry.word;
                    correctId = 'yes';
                    hint2 = `"${entry.corrected}" is a title used before a name — capitalize it.`;
                } else {
                    subject = _sample(COMMON_NOUNS, 1, rng)[0];
                    correctId = 'no';
                    hint2 = `"${subject}" does not need a capital here.`;
                }
            }
            return {
                id: _qid(skillAtom.skill_id, 'tbb'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'two-button-binary',
                stem: 'Should this word (or abbreviation) be capitalized?',
                subject,
                options: [{ id: 'yes', label: 'Capitalize' }, { id: 'no', label: 'No Capital' }],
                correct_answer: correctId,
                ans: correctId,
                hints: ['Titles before names (Dr., Mrs., President) and acronyms (NASA, FBI) are capitalized.', hint2],
                rit_difficulty: 170,
                grade_level: '2-3',
                has_audio: true,
                k2_appropriate: false,
                skillLabel: 'Capitalize: Titles & Acronyms',
                title: 'Capitalize: Titles & Acronyms',
                audio_text: subject,
            };
        }

        if (widgetMechanic === 'fib-auto') {
            const entry = useAcronym
                ? _sample(ACRONYMS, 1, rng)[0]
                : _sample(TITLES_PEOPLE, 1, rng)[0];
            const raw = `i work at ${entry.word} every day.`;
            const corrected = `I work at ${entry.corrected} every day.`;
            return {
                id: _qid(skillAtom.skill_id, 'fib'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'fib-auto',
                stem: `Type this sentence correctly:\n"${raw}"`,
                ans: [{ acceptable_answers: [corrected], case_sensitive: true, normalize_whitespace: true, normalize_punctuation: false, label: 'Corrected sentence' }],
                correct_answer: corrected,
                hints: ['Acronyms use all capital letters. Titles before names are capitalized.'],
                rit_difficulty: 172,
                grade_level: '2-3',
                has_audio: false,
                k2_appropriate: false,
                partial_credit: false,
            };
        }

        // mc-text / dnd default
        const acr = _sample(ACRONYMS, 1, rng)[0];
        const titl = _sample(TITLES_PEOPLE, 1, rng)[0];
        const correct = `She works for ${acr.corrected} and reports to ${titl.corrected}.`;
        const wrong1  = `She works for ${acr.word} and reports to ${titl.corrected}.`;
        const wrong2  = `She works for ${acr.corrected} and reports to ${titl.word}.`;
        const opts = _sample([
            { id: 'a', label: correct, correct: true  },
            { id: 'b', label: wrong1,  correct: false },
            { id: 'c', label: wrong2,  correct: false },
        ], 3, rng).map((o, i) => ({ ...o, id: String.fromCharCode(97 + i) }));
        const correctOpt = opts.find(o => o.correct);
        return {
            id: _qid(skillAtom.skill_id, 'mct'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            stem: 'Which sentence is correctly capitalized?',
            options: opts,
            correct_answer: correctOpt.id,
            ans: correctOpt.id,
            hints: ['Acronyms (NASA, FBI) and titles before names (Dr., Mrs.) are always capitalized.'],
            rit_difficulty: 171,
            grade_level: '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    // ── proper_adjectives ──────────────────────────────────────────────────────
    if (capKey === 'proper_adjectives') {
        if (widgetMechanic === 'two-button-binary') {
            const showProperAdj = rng() >= 0.3;
            let subject, correctId, hint2;
            if (showProperAdj) {
                const entry = _sample(PROPER_ADJ, 1, rng)[0];
                subject = entry.word;
                correctId = 'yes';
                hint2 = `"${entry.corrected}" comes from "${entry.noun}" — a proper noun, so the adjective is capitalized too.`;
            } else {
                subject = _sample(COMMON_ADJ, 1, rng)[0];
                correctId = 'no';
                hint2 = `"${subject}" is a common adjective — no capital needed.`;
            }
            return {
                id: _qid(skillAtom.skill_id, 'tbb'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'two-button-binary',
                stem: 'Should this adjective be capitalized?',
                subject,
                options: [{ id: 'yes', label: 'Capitalize' }, { id: 'no', label: 'No Capital' }],
                correct_answer: correctId,
                ans: correctId,
                hints: ['Adjectives formed from proper nouns (American, French) are always capitalized.', hint2],
                rit_difficulty: 190,
                grade_level: '4-5',
                has_audio: true,
                k2_appropriate: false,
                skillLabel: 'Capitalize: Proper Adjectives',
                title: 'Capitalize: Proper Adjectives',
                audio_text: subject,
            };
        }

        if (widgetMechanic === 'fib-auto') {
            const entry = _sample(PROPER_ADJ, 1, rng)[0];
            const raw = `she made ${entry.word} food for the party.`;
            const corrected = `She made ${entry.corrected} food for the party.`;
            return {
                id: _qid(skillAtom.skill_id, 'fib'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'fib-auto',
                stem: `Type this sentence correctly:\n"${raw}"`,
                ans: [{ acceptable_answers: [corrected], case_sensitive: true, normalize_whitespace: true, normalize_punctuation: false, label: 'Corrected sentence' }],
                correct_answer: corrected,
                hints: ['Proper adjectives (adjectives from proper nouns) are always capitalized.'],
                rit_difficulty: 193,
                grade_level: '4-5',
                has_audio: false,
                k2_appropriate: false,
                partial_credit: false,
            };
        }

        // mc-text
        const e1 = _sample(PROPER_ADJ, 1, rng)[0];
        const correct = `We ate ${e1.corrected} food at the festival.`;
        const wrong1  = `We ate ${e1.word} food at the festival.`;
        const e2 = _sample(PROPER_ADJ.filter(e => e !== e1), 1, rng)[0];
        const wrong2  = `We ate ${e2.word} music at the festival.`;
        const opts = _sample([
            { id: 'a', label: correct, correct: true  },
            { id: 'b', label: wrong1,  correct: false },
            { id: 'c', label: wrong2,  correct: false },
        ], 3, rng).map((o, i) => ({ ...o, id: String.fromCharCode(97 + i) }));
        const correctOpt = opts.find(o => o.correct);
        return {
            id: _qid(skillAtom.skill_id, 'mct'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            stem: 'Which sentence correctly capitalizes the proper adjective?',
            options: opts,
            correct_answer: correctOpt.id,
            ans: correctOpt.id,
            hints: ['Proper adjectives come from proper nouns and are always capitalized.'],
            rit_difficulty: 191,
            grade_level: '4-5',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    // ── direct_quotation ───────────────────────────────────────────────────────
    if (capKey === 'direct_quotation') {
        const entry = _sample(QUOTE_SENTENCES, 1, rng)[0];

        if (widgetMechanic === 'two-button-binary') {
            // Show the first word of the quote; ask if it needs capital.
            const needsCap = rng() >= 0.3;
            const subject = needsCap ? entry.firstQuoteWord : _sample(COMMON_NOUNS, 1, rng)[0];
            const correctId = needsCap ? 'yes' : 'no';
            return {
                id: _qid(skillAtom.skill_id, 'tbb'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'two-button-binary',
                stem: 'Is this the first word of a direct quotation? Should it be capitalized?',
                subject,
                options: [{ id: 'yes', label: 'Capitalize' }, { id: 'no', label: 'No Capital' }],
                correct_answer: correctId,
                ans: correctId,
                hints: ['The first word of a direct quotation that forms a complete sentence is always capitalized.'],
                rit_difficulty: 178,
                grade_level: '2-3',
                has_audio: true,
                k2_appropriate: false,
                skillLabel: 'Capitalize: Direct Quotation',
                title: 'Capitalize: Direct Quotation',
                audio_text: subject,
            };
        }

        if (widgetMechanic === 'fib-auto') {
            return {
                id: _qid(skillAtom.skill_id, 'fib'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'fib-auto',
                stem: `Type this sentence correctly:\n"${entry.raw}"`,
                ans: [{ acceptable_answers: [entry.corrected], case_sensitive: true, normalize_whitespace: true, normalize_punctuation: false, label: 'Corrected sentence' }],
                correct_answer: entry.corrected,
                hints: ['Capitalize the first word inside quotation marks when it starts a complete sentence.'],
                rit_difficulty: 182,
                grade_level: '3-4',
                has_audio: false,
                k2_appropriate: false,
                partial_credit: false,
            };
        }

        // mc-text / tap-hotspot
        const correct = entry.corrected;
        const wrong1  = entry.raw;
        const e2 = _sample(QUOTE_SENTENCES.filter(e => e !== entry), 1, rng)[0];
        const wrong2  = e2.raw;
        const opts = _sample([
            { id: 'a', label: correct, correct: true  },
            { id: 'b', label: wrong1,  correct: false },
            { id: 'c', label: wrong2,  correct: false },
        ], 3, rng).map((o, i) => ({ ...o, id: String.fromCharCode(97 + i) }));
        const correctOpt = opts.find(o => o.correct);
        return {
            id: _qid(skillAtom.skill_id, 'mct'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            stem: 'Which sentence correctly capitalizes the direct quotation?',
            options: opts,
            correct_answer: correctOpt.id,
            ans: correctOpt.id,
            hints: ['The first word of a direct quotation (spoken sentence) is capitalized.'],
            rit_difficulty: 180,
            grade_level: '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    // ── letter_greeting_closing ────────────────────────────────────────────────
    if (capKey === 'letter_greeting_closing') {
        // Pick greeting or closing at random
        const useGreeting = rng() < 0.5;
        const pool = useGreeting ? GREETINGS : CLOSINGS;
        const entry = _sample(pool, 1, rng)[0];

        if (widgetMechanic === 'two-button-binary') {
            const needsCap = rng() >= 0.3;
            const subject = needsCap ? entry.targetWord : _sample(COMMON_NOUNS, 1, rng)[0];
            const correctId = needsCap ? 'yes' : 'no';
            const partName = useGreeting ? 'greeting' : 'closing';
            return {
                id: _qid(skillAtom.skill_id, 'tbb'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'two-button-binary',
                stem: `Is this the first word of a letter ${partName}? Should it be capitalized?`,
                subject,
                options: [{ id: 'yes', label: 'Capitalize' }, { id: 'no', label: 'No Capital' }],
                correct_answer: correctId,
                ans: correctId,
                hints: ['In a letter, the first word of the greeting (Dear…) and closing (Sincerely…) are capitalized.'],
                rit_difficulty: 165,
                grade_level: '1-2',
                has_audio: true,
                k2_appropriate: false,
                skillLabel: 'Capitalize: Letter Greeting/Closing',
                title: 'Capitalize: Letter Greeting/Closing',
                audio_text: subject,
            };
        }

        if (widgetMechanic === 'tap-hotspot') {
            const words = entry.raw.split(' ');
            const items = words.map((w, i) => ({ id: `w${i}`, label: w, correct: i === entry.idx }));
            return {
                id: _qid(skillAtom.skill_id, 'tap'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'tap-hotspot',
                stem: 'Tap the word that needs a capital letter.',
                sentence: entry.raw,
                items,
                correct_answer: `w${entry.idx}`,
                ans: `w${entry.idx}`,
                hints: ['The first word in a letter greeting or closing must be capitalized.'],
                rit_difficulty: 166,
                grade_level: '2',
                has_audio: false,
                k2_appropriate: false,
            };
        }

        if (widgetMechanic === 'fib-auto') {
            return {
                id: _qid(skillAtom.skill_id, 'fib'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'fib-auto',
                stem: `Type this letter part correctly:\n"${entry.raw}"`,
                ans: [{ acceptable_answers: [entry.corrected], case_sensitive: true, normalize_whitespace: true, normalize_punctuation: false, label: 'Corrected text' }],
                correct_answer: entry.corrected,
                hints: ['Capitalize the first word in letter greetings and closings.'],
                rit_difficulty: 168,
                grade_level: '2-3',
                has_audio: false,
                k2_appropriate: false,
                partial_credit: false,
            };
        }

        // mc-text
        const correct = entry.corrected;
        const wrong1  = entry.raw;
        const otherPool = useGreeting ? CLOSINGS : GREETINGS;
        const other = _sample(otherPool, 1, rng)[0];
        const wrong2 = other.raw;
        const opts = _sample([
            { id: 'a', label: correct, correct: true  },
            { id: 'b', label: wrong1,  correct: false },
            { id: 'c', label: wrong2,  correct: false },
        ], 3, rng).map((o, i) => ({ ...o, id: String.fromCharCode(97 + i) }));
        const correctOpt = opts.find(o => o.correct);
        return {
            id: _qid(skillAtom.skill_id, 'mct'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            stem: 'Which letter greeting or closing is correctly capitalized?',
            options: opts,
            correct_answer: correctOpt.id,
            ans: correctOpt.id,
            hints: ['The first word in a letter greeting (Dear) and closing (Sincerely) are capitalized.'],
            rit_difficulty: 166,
            grade_level: '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    // ── poetry_line ────────────────────────────────────────────────────────────
    if (capKey === 'poetry_line') {
        const lineIdx = Math.floor(rng() * POEM_LINES_CORRECT.length);
        const correctLine = POEM_LINES_CORRECT[lineIdx];
        const wrongLine   = POEM_LINES_WRONG[lineIdx];

        if (widgetMechanic === 'two-button-binary') {
            // Show the first word of a poem line (lowercase); ask if it needs capital.
            const showPoem = rng() >= 0.3;
            const subject = showPoem
                ? wrongLine.split(' ')[0]            // e.g. "the"
                : _sample(COMMON_NOUNS, 1, rng)[0];
            const correctId = showPoem ? 'yes' : 'no';
            return {
                id: _qid(skillAtom.skill_id, 'tbb'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'two-button-binary',
                stem: 'In a poem, should the first word of each new line be capitalized?',
                subject: showPoem ? 'Start of poem line: ' + subject : subject,
                options: [{ id: 'yes', label: 'Capitalize' }, { id: 'no', label: 'No Capital' }],
                correct_answer: correctId,
                ans: correctId,
                hints: ['Traditional poems capitalize the first letter of every new line.'],
                rit_difficulty: 172,
                grade_level: '2-3',
                has_audio: false,
                k2_appropriate: false,
                skillLabel: 'Capitalize: Poetry Line',
                title: 'Capitalize: Poetry Line',
            };
        }

        if (widgetMechanic === 'tap-hotspot') {
            const words = wrongLine.split(' ');
            const items = words.map((w, i) => ({ id: `w${i}`, label: w, correct: i === 0 }));
            return {
                id: _qid(skillAtom.skill_id, 'tap'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'tap-hotspot',
                stem: 'Tap the word in this poem line that needs a capital letter.',
                sentence: wrongLine,
                items,
                correct_answer: 'w0',
                ans: 'w0',
                hints: ['Poets capitalize the first letter of each line.'],
                rit_difficulty: 172,
                grade_level: '2-3',
                has_audio: false,
                k2_appropriate: false,
            };
        }

        if (widgetMechanic === 'fib-auto') {
            return {
                id: _qid(skillAtom.skill_id, 'fib'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'fib-auto',
                stem: `Type this poem line correctly:\n"${wrongLine}"`,
                ans: [{ acceptable_answers: [correctLine], case_sensitive: true, normalize_whitespace: true, normalize_punctuation: false, label: 'Corrected line' }],
                correct_answer: correctLine,
                hints: ['Poets traditionally capitalize the first letter of every line.'],
                rit_difficulty: 174,
                grade_level: '2-3',
                has_audio: false,
                k2_appropriate: false,
                partial_credit: false,
            };
        }

        // mc-text
        const idx2 = (lineIdx + 1) % POEM_LINES_CORRECT.length;
        const opts = _sample([
            { id: 'a', label: correctLine,            correct: true  },
            { id: 'b', label: wrongLine,              correct: false },
            { id: 'c', label: POEM_LINES_WRONG[idx2], correct: false },
        ], 3, rng).map((o, i) => ({ ...o, id: String.fromCharCode(97 + i) }));
        const correctOpt = opts.find(o => o.correct);
        return {
            id: _qid(skillAtom.skill_id, 'mct'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            stem: 'Which poem line is correctly written?',
            options: opts,
            correct_answer: correctOpt.id,
            ans: correctOpt.id,
            hints: ['In traditional poetry, each new line begins with a capital letter.'],
            rit_difficulty: 173,
            grade_level: '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    // ── geographic_names ───────────────────────────────────────────────────────
    if (capKey === 'geographic_names') {
        if (widgetMechanic === 'two-button-binary') {
            const showGeo = rng() >= 0.3;
            let subject, correctId, hint2;
            if (showGeo) {
                const entry = _sample(GEO_NAMES, 1, rng)[0];
                subject = entry.word;
                correctId = 'yes';
                hint2 = `"${entry.corrected}" is the name of a specific geographic feature — always capitalize it.`;
            } else {
                subject = _sample(COMMON_GEO_NOUNS, 1, rng)[0];
                correctId = 'no';
                hint2 = `"${subject}" is a common geographic noun — no capital needed unless it's part of a specific name.`;
            }
            return {
                id: _qid(skillAtom.skill_id, 'tbb'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'two-button-binary',
                stem: 'Should this geographic name be capitalized?',
                subject,
                options: [{ id: 'yes', label: 'Capitalize' }, { id: 'no', label: 'No Capital' }],
                correct_answer: correctId,
                ans: correctId,
                hints: ['Specific geographic names (Pacific Ocean, Mount Everest) are proper nouns — always capitalize them.', hint2],
                rit_difficulty: 182,
                grade_level: '3-4',
                has_audio: true,
                k2_appropriate: false,
                skillLabel: 'Capitalize: Geographic Names',
                title: 'Capitalize: Geographic Names',
                audio_text: subject,
            };
        }

        if (widgetMechanic === 'dnd-linked') {
            const geoEntries = _sample(GEO_NAMES, 3, rng);
            const commonWords = _sample(COMMON_GEO_NOUNS, 2, rng);
            const allItems = _sample([
                ...geoEntries.map(e => ({ word: e.word, isProper: true })),
                ...commonWords.map(w => ({ word: w, isProper: false })),
            ], 5, rng);
            const draggables = allItems.map((item, i) => ({ id: `w${i}`, label: item.word, audio_text: item.word }));
            const correctAns = {};
            allItems.forEach((item, i) => { correctAns[`w${i}`] = item.isProper ? 'bin_proper' : 'bin_common'; });
            return {
                id: _qid(skillAtom.skill_id, 'sort'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'dnd-linked',
                stem: 'Sort each word: specific geographic name (capitalize) or common geographic word (no capital)?',
                draggables,
                zones: [
                    { id: 'bin_proper', label: 'Geographic Name → Capitalize', accepts: allItems.flatMap((w, i) => w.isProper ? [`w${i}`] : []) },
                    { id: 'bin_common', label: 'Common Word → No Capital', accepts: allItems.flatMap((w, i) => !w.isProper ? [`w${i}`] : []) },
                ],
                ans: correctAns,
                correct_answer: correctAns,
                hints: ['Specific names like "Amazon River" are proper nouns. "river" alone is common.'],
                rit_difficulty: 183,
                grade_level: '3-4',
                has_audio: false,
                k2_appropriate: false,
            };
        }

        if (widgetMechanic === 'fib-auto') {
            const entry = _sample(GEO_NAMES, 1, rng)[0];
            const raw = `the explorer crossed the ${entry.word} last year.`;
            const corrected = `The explorer crossed the ${entry.corrected} last year.`;
            return {
                id: _qid(skillAtom.skill_id, 'fib'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'fib-auto',
                stem: `Type this sentence correctly:\n"${raw}"`,
                ans: [{ acceptable_answers: [corrected], case_sensitive: true, normalize_whitespace: true, normalize_punctuation: false, label: 'Corrected sentence' }],
                correct_answer: corrected,
                hints: ['Capitalize the full name of geographic features (rivers, mountains, oceans).'],
                rit_difficulty: 185,
                grade_level: '3-4',
                has_audio: false,
                k2_appropriate: false,
                partial_credit: false,
            };
        }

        // mc-text / tap-hotspot default
        const e1 = _sample(GEO_NAMES, 1, rng)[0];
        const correct = `The team hiked to ${e1.corrected} last summer.`;
        const wrong1  = `The team hiked to ${e1.word} last summer.`;
        const e2 = _sample(GEO_NAMES.filter(e => e !== e1), 1, rng)[0];
        const wrong2  = `the team hiked to ${e2.corrected} last summer.`;
        const opts = _sample([
            { id: 'a', label: correct, correct: true  },
            { id: 'b', label: wrong1,  correct: false },
            { id: 'c', label: wrong2,  correct: false },
        ], 3, rng).map((o, i) => ({ ...o, id: String.fromCharCode(97 + i) }));
        const correctOpt = opts.find(o => o.correct);
        return {
            id: _qid(skillAtom.skill_id, 'mct'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            stem: 'Which sentence correctly capitalizes the geographic name?',
            options: opts,
            correct_answer: correctOpt.id,
            ans: correctOpt.id,
            hints: ['Specific geographic names are proper nouns — always capitalize them.'],
            rit_difficulty: 184,
            grade_level: '3-4',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    // ── titles_of_works ────────────────────────────────────────────────────────
    if (capKey === 'titles_of_works') {
        if (widgetMechanic === 'two-button-binary') {
            const showTitle = rng() >= 0.3;
            let subject, correctId, hint2;
            if (showTitle) {
                const entry = _sample(TITLES_OF_WORKS, 1, rng)[0];
                subject = entry.raw;
                correctId = 'yes';
                hint2 = `"${entry.corrected}" — capitalize the first, last, and all principal words in a title.`;
            } else {
                subject = _sample(COMMON_NOUNS, 1, rng)[0];
                correctId = 'no';
                hint2 = `"${subject}" is a common noun — no capital needed here.`;
            }
            return {
                id: _qid(skillAtom.skill_id, 'tbb'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'two-button-binary',
                stem: 'Is this the title of a book or work? Should principal words be capitalized?',
                subject,
                options: [{ id: 'yes', label: 'Capitalize' }, { id: 'no', label: 'No Capital' }],
                correct_answer: correctId,
                ans: correctId,
                hints: ['In a title, capitalize the first word, last word, and all principal words. Short words (a, an, the, of, in) stay lowercase unless first or last.', hint2],
                rit_difficulty: 187,
                grade_level: '3-5',
                has_audio: false,
                k2_appropriate: false,
                skillLabel: 'Capitalize: Titles of Works',
                title: 'Capitalize: Titles of Works',
            };
        }

        if (widgetMechanic === 'fib-auto') {
            const entry = _sample(TITLES_OF_WORKS, 1, rng)[0];
            const raw = `i love the book ${entry.raw}.`;
            const corrected = `I love the book ${entry.corrected}.`;
            return {
                id: _qid(skillAtom.skill_id, 'fib'),
                skill_ids: [skillAtom.skill_id],
                question_type: 'fib-auto',
                stem: `Type this sentence correctly:\n"${raw}"`,
                ans: [{ acceptable_answers: [corrected], case_sensitive: true, normalize_whitespace: true, normalize_punctuation: false, label: 'Corrected sentence' }],
                correct_answer: corrected,
                hints: ['In a book title, capitalize the first word and all principal words.'],
                rit_difficulty: 190,
                grade_level: '3-5',
                has_audio: false,
                k2_appropriate: false,
                partial_credit: false,
            };
        }

        // mc-text default
        const e1 = _sample(TITLES_OF_WORKS, 1, rng)[0];
        const correct = `My favourite book is ${e1.corrected}.`;
        const wrong1  = `My favourite book is ${e1.raw}.`;
        const e2 = _sample(TITLES_OF_WORKS.filter(e => e !== e1), 1, rng)[0];
        const wrong2  = `my favourite book is ${e2.corrected}.`;
        const opts = _sample([
            { id: 'a', label: correct, correct: true  },
            { id: 'b', label: wrong1,  correct: false },
            { id: 'c', label: wrong2,  correct: false },
        ], 3, rng).map((o, i) => ({ ...o, id: String.fromCharCode(97 + i) }));
        const correctOpt = opts.find(o => o.correct);
        return {
            id: _qid(skillAtom.skill_id, 'mct'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            stem: 'Which sentence correctly capitalizes the title?',
            options: opts,
            correct_answer: correctOpt.id,
            ans: correctOpt.id,
            hints: ['Titles of books capitalize the first and last word, plus all principal words. Short words (a, an, the, of) stay lowercase unless they are first or last.'],
            rit_difficulty: 188,
            grade_level: '3-5',
            has_audio: false,
            k2_appropriate: false,
        };
    }

    // ── Unrecognised capKey fallback ───────────────────────────────────────────
    return _genericMcText(skillAtom);
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
    'language_mechanics_capitalize_sentence_start',
    'language_mechanics_capitalize_pronoun_i',
    'language_mechanics_capitalize_proper_noun_person',
    'language_mechanics_capitalize_proper_noun_place',
    'language_mechanics_capitalize_proper_noun_months_days',
    'language_mechanics_capitalize_proper_noun_titles_acronyms',
    'language_mechanics_capitalize_proper_adjectives',
    'language_mechanics_capitalize_direct_quotation',
    'language_mechanics_capitalize_letter_greeting_closing',
    'language_mechanics_capitalize_poetry_line',
    'language_mechanics_capitalize_geographic_names',
    'language_mechanics_capitalize_titles_of_works',
]);

function _dispatchCapitalize(skillAtom, widgetMechanic, originalMechanic, rng) {
    const skillId = skillAtom.skill_id;

    // Original two-atom implementation (person / place) uses their own helpers.
    if (skillId === 'language_mechanics_capitalize_proper_noun_person' ||
        skillId === 'language_mechanics_capitalize_proper_noun_place') {
        switch (widgetMechanic) {
            case 'two-button-binary': return _twoButtonBinary(skillAtom, rng);
            case 'tap-hotspot':       return _tapHotspot(skillAtom, rng);
            case 'mc-text':           return _mcText(skillAtom, rng);
            case 'fib-auto':          return _fibAuto(skillAtom, rng);
            case 'dnd-linked':        return _dndSort(skillAtom, rng);
            default:                  return _twoButtonBinary(skillAtom, rng);
        }
    }

    // All other capitalize_* atoms go through the unified generator.
    if (skillId.startsWith('language_mechanics_capitalize_')) {
        const capKey = skillId.slice('language_mechanics_capitalize_'.length);
        return _generateCapitalizationQuestion(skillAtom, capKey, rng, widgetMechanic);
    }

    return _twoButtonBinary(skillAtom, rng);
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
