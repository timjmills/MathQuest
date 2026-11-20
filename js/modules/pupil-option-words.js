// pupil-option-words.js — the words a PUPIL reads on the options sheet (design/student-opts/CARD.md, critic r1 F2).
//
// The teacher's option labels stay as they are ("What the items ask", "Use the Max Number setting"); a pupil reads these
// instead: short plain words at an ELL / SPED reading level ("Numbers up to", "Easier / Harder"). pupilOptionsFor
// (skill-options.js) passes every pupil option through pupilWorded().
//
//   PUPIL_WORDS   keyed by option id ('range') or 'id|Teacher label' for one label, and by 'id:value' or
//                 'id:value|Teacher choice' for a choice. A string is the pupil's words; null drops it (an option or a choice
//                 that only makes sense to a teacher, or is about the page or print, is withheld, never reworded).
//   plain()       the general rewording every other text gets: a parenthesis that explains in words is cut, "dealt" goes.
//
// ws-student-opts STUDENT-OPTS-WORDS lints every result (no teacher or print term, a label <= 6 words, a choice <= 8).
// Layer 0: no imports.

/** Options a pupil never changes, by id or 'id|Teacher label' (card D3: the written form, on every sign). */
export const PUPIL_WITHHOLD = new Set([
    'divForm', 'notation',              // D3: "How it is written" is a format choice on every sign (+, −, ×, ÷)
    'review', 'poolSize',               // the teacher's review mix ("Some (1 in 6 from the steps before)")
    'ftTrap', 'ftTable',                // function tables: a trap row and the table's layout
    'tenChoice', 'tenPlain',            // the word bank and the drawing of a ten-times page
    'stimulus',                         // "What the pupil reads": the page's prompt form
    'midpoint',                         // "At least one on every page": a page-seeding choice (its default)
    'task|Task', 'response|Task', 'patTask|Task', 'ftTask|Task', 'vocabTask|Task', 'task|Order items ask', 'task|The pupil reads',
    'tiles|Bars', 'tiles|Bars to draw', 'tiles|Rows', 'tiles|Rows to draw', 'tiles|How many clocks', 'tiles|Data points',
    'tiles|Objects to order', 'tiles|Kinds of shape', 'tiles|Empty boxes',
]);

export const PUPIL_WORDS = {
    // ---- labels
    'range': 'Numbers up to',
    'forms|What the items ask': 'Questions',
    'wordSet': 'Words',
    'decimals|Decimals (grade 5)': 'Decimals',
    'constant|Hop size (tables)': 'Hop size',
    'band|Most pictures in a row': 'Most pictures',
    'band|Rows and columns to': 'Rows and columns to',
    'minFactor': 'Tables start at',
    'most|Most tallies in a row': 'Most tallies',
    'places|Columns (round to the nearest)': 'Round to the nearest',
    'regroup|Regrouping (borrowing)': 'Regrouping',
    'regroup|Regrouping (carrying)': 'Regrouping',
    'repeatDigit': 'A digit two times',
    'zeroPlace|A zero place (305, 340)': 'A zero (305, 340)',
    'zeroPlace|Across zeros (5,003 − 2,847)': 'Zeros (5,003 − 2,847)',
    'poolSize': null,

    // ---- choices
    'range:null': 'Usual',
    'decimals:null': 'Usual',
    'step:null|Mixed (set by Max Number)': 'Mixed',
    'noon:seeded': 'Some cross 12 noon',
    'noon:across': 'Across 12 noon',
    'regroup:always': 'Always',
    'regroup:mixed': 'Sometimes',
    'regroup:none|None (it shares exactly)': 'None',
    'zeroPlace:always': 'Always',
    'zeroPlace:some': 'Sometimes',
    'closeness:some': 'Both',
    'tiles:5|5 (sizes S and M)': null,
    'tiles:null|Dealt across the page (3 and 4)': '3 or 4',
    'tiles:null|Tables facts to 12 × 12 (follows Max Number)': 'Up to 12 × 12',
    'tiles:null|Tables facts to 144 ÷ 12 (follows Max Number)': 'Up to 144 ÷ 12',
    'tiles:null|Both grids, dealt': 'Both',
    'tiles:null|Both sizes, dealt': 'Both',
    'orientation:line': 'One line of ten',
    'orientation:rows': 'Fives',
    'dir:both': 'Both, mixed',
    'dir:mixed': 'All three, mixed',
    'bins:three': 'Three bins (40, 50, 60)',
    'bins:apart': 'Two apart and Neither (40, 60)',
    'bins:adjacent': 'Two next to each other (40, 50)',
    'gaps:pattern': 'Every other square',
    'gaps:row': 'Along one line (count by 1)',
    'gaps:column': 'Down one column (count by 10)',
    'gaps:scatter': 'Anywhere',
    'wordSet:6': 'First 6 words',
    'wordSet:10': 'First 10 words',
    'wordSet:16': 'First 16 words',
    'minFactor:1': 'From 1',
    'minFactor:2': 'From 2',
    'rename:more': 'Yes (476 = 47 tens 6 ones)',
    'rename:standard': 'No (476 = 4 hundreds 7 tens 6 ones)',
    'source:numeral': 'A number with commas',
    'kind:both': 'Notes and coins',
    'kind:like': 'Coins, all the same',
    'lengths:shorter': 'One digit shorter (86 − 4)',
    'tenDir:tenth': 'One place right: one tenth',
    'tenDir:times': 'One place left: 10 times',
    'paid:note': 'The next note (10 for 7.40)',
    'step:100': 'Whole riyals or dollars',
    'patTask:feature': 'What a pattern shows',
    'patTask:truefalse': 'True or false about a times table',
    'patTask:parity': 'Even or odd (6 × 7)',
    'patTask:far': 'How many Term 10 has',
    'patTask:next': 'Draw Term 4, write how many',
    'msOps:adddiv': 'Add or take away, then divide',
    'msOps:addmult': 'Add or take away, then multiply',
    'msOps:div': 'Divide, then add or take away',
    'msOps:mult': 'Multiply, then add or take away',
    'msOps:addsub': 'Add or take away, two times',
    'band:0|Max Number setting': 'Usual',
    'gaps:row': 'Along a line, count by 1',
    'gaps:column': 'Down a column, count by 10',
    'zeros:on': 'Zeros (405 − 203, 586 − 230)',
    'forms:0|A fraction less than 1: is the product smaller?': 'Times less than 1: smaller?',
    'forms:1|A fraction greater than 1: is the product bigger?': 'Times more than 1: bigger?',
    'forms:0|A unit fraction of a number (1/4 of 12)': 'A unit fraction of (1/4 of 12)',
    'forms:0|Add or subtract first in the line (4 + 6 × 2)': '+ or − first (4 + 6 × 2)',
    'forms:1|Multiply or divide first in the line (6 × 2 + 4)': '× or ÷ first (6 × 2 + 4)',
    'forms:0|Add using make a ten (8 + 5 = 8 + 2 + 3)': 'Make a ten (8 + 5 = 8 + 2 + 3)',
    'forms:1|Find the whole (3/7 of a number is 12)': 'Find the whole (3/7 of ? is 12)',
    'forms:1|The same value written two ways (0.450 and 0.45)': 'Same value, two ways (0.450, 0.45)',
    'members:digit_value_unit_form': 'Digit value (7 hundreds)',
    'values:all': 'The usual coins',
    'members:skip_count_grid': 'Skip count on a grid',
    'members:one_tenth_value': 'One tenth of a digit',
    'members:digit_value_notation': 'Digit value (7 × 100)',
    'members:growing_shape_patterns': 'Growing shape patterns',
    'members:notice_patterns': 'Even and odd products',
    'members:pattern_features': 'Number pattern features',
    'members:skip_count_line': 'Skip count on a number line',
    'members:ten_times_value': '10 times and one tenth',
    'members:two_step_add_then_div': 'Two steps: add, then divide',
    'members:two_step_add_then_mult': 'Two steps: add, then multiply',
};

const MAX = { label: 6, choice: 8 };
const words = (t) => String(t).split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;

/**
 * The general pupil rewording: a parenthesis that explains in words (a word of 3+ letters inside it) is cut, so a maths
 * example such as "(7 × 8)" stays; "dealt", "mixed on the page" and "Use the ... setting" go.
 */
export function plain(text) {
    let t = String(text == null ? '' : text);
    const orig = t;
    t = t.replace(/^Use the .* setting$/i, 'Usual')
        .replace(/^Level \d+:\s*/i, '')
        .replace(/\bdenom\b/gi, 'denominators')
        .replace(/^Every word on the list \((\d+)\)$/i, 'All $1 words')
        .replace(/^As dealt\b.*$/i, 'Any')
        .replace(/,? mixed on the page/gi, ', mixed')
        .replace(/,?\s*\bdealt\b/gi, '');
    // cut parentheses that explain in words (innermost first, so "((12 + 18) shared by 5)" goes whole)
    for (let i = 0; i < 3; i++) t = t.replace(/\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, (m, inner) => (explains(inner) ? '' : m));
    t = t.replace(/\s{2,}/g, ' ').replace(/\s+([,.:;])/g, '$1').replace(/[,:;\s]+$/, '').trim();
    return t || orig;
}

/** A parenthesis explains in words when it opens with a word of 3+ letters ("(tables to 10 × 10)"); "(7 × 8)" or
 *  "(476 = 47 tens 6 ones)" is a maths example and stays. ws-student-opts STUDENT-OPTS-WORDS reads it the same way. */
export const explains = (inner) => /^\s*[A-Za-z]{3,}/.test(String(inner));

const look = (keys) => { for (const k of keys) if (k in PUPIL_WORDS) return { hit: true, v: PUPIL_WORDS[k] }; return { hit: false }; };

/** Is this option withheld from pupils by the words layer (an id, or the id with this teacher label)? */
export function pupilWithheld(def) {
    if (!def) return true;
    const label = String(def.label || '').trim();
    if (PUPIL_WITHHOLD.has(def.id) || PUPIL_WITHHOLD.has(`${def.id}|${label}`)) return true;
    const l = look([`${def.id}|${label}`, def.id]);
    return l.hit && l.v === null;
}

/** A pupil option in pupil words: a copy with its label, choices and all-label reworded; null when withheld. */
export function pupilWorded(def) {
    if (pupilWithheld(def)) return null;
    const label = String(def.label || def.id).trim();
    const l = look([`${def.id}|${label}`, def.id]);
    const out = { ...def, teacherLabel: def.label, label: l.hit ? l.v : plain(label) };
    if (Array.isArray(def.values)) {
        const vals = [];
        for (const x of def.values) {
            const text = String(x.l == null ? x.v : x.l);
            const c = look([`${def.id}:${x.v}|${text}`, `${def.id}:${x.v}`]);
            if (c.hit && c.v === null) { if (def.type === 'enum' && x.v === def.default) return null; continue; }   // never drop the default
            // a mixed pool's skills: "(With Regrouping)" tells two choices apart, so it becomes ", with regrouping"
            const own = def.id === 'members' ? text.replace(/\s*\(([^()]+)\)/g, (m, inner) => (/^\s*[A-Za-z]{2,}/.test(inner) ? `, ${inner.trim().toLowerCase()}` : m)) : text;
            vals.push({ ...x, l: c.hit ? c.v : plain(own) });
        }
        if ((def.type === 'enum' || def.type === 'set' || !def.type) && vals.length < 2 && def.values.length >= 2) return null;
        out.values = vals;
    }
    if (def.allLabel) { const a = look([`${def.id}:all|${def.allLabel}`, `${def.id}:all`]); out.allLabel = a.hit ? a.v : plain(def.allLabel); }
    return out;
}

export const PUPIL_WORD_LIMITS = MAX;
void words;
