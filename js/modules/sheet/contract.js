// js/modules/sheet/contract.js
// The Skill Cell Contract: the provider registry, the controlled instruction library, and the
// coverage judgement (SKILL_CELL_CONTRACT.md section 3, section 4, PEDAGOGY_STANDARD.md 10.1).
//
// Every skill supplies six things. A skill that declares nothing still works, because
// `getProvider()` fills each missing member from a DEFAULT ADAPTER and records which members it
// had to fill, in `provider.defaults` (SCC-P2).
//
//   renderCell(q, ctx)   -> inner HTML for one cell, in one of four states
//   workedSteps(q)       -> [{text, marks}] for the Steps band, the Model cell, the hint ladder
//   wrongAnswer(q)       -> a MISCONCEPTION-based error for error analysis / True or False? / Reason It
//   strings              -> iCan, instruction, whatsNew, vocabulary (<=3), oralFrame
//   footprint            -> units per look and size, column caps, fact-like?
//   options              -> the skill's own option schema (skill-options.js `optionsFor`)
//
// DEPENDENCY DIRECTION. This module imports NOTHING from `adapters.js`. The adapters import the
// contract and push themselves in through `installDefaultAdapters()` at their own module load.
// That keeps the import graph acyclic and means `contract.js` alone is enough to reason about
// the shape of a provider. Until the adapters load, the built-in EMPTY forms below apply, so
// `getProvider()` never returns null and never throws (SCC-A1) - a test may import this file on
// its own.
//
// Pure module (SCC-01): no `window`, no `state`, no DOM, no `Math.random`, no import of any
// `gen-*.js`, `print-generate.js` or `solution-display.js`. Anything the defaults need from a
// higher layer is INJECTED - see `installLegacyAdapters` in `adapters.js`.

/* ====================================================================== the six members */

/** The six members of the contract, in the order the coverage report prints them. */
export const CONTRACT_MEMBERS = Object.freeze([
    'renderCell', 'workedSteps', 'wrongAnswer', 'strings', 'footprint', 'options',
]);

/** Members a provider MAY add beyond the six; all of them also have defaults (section 4.7). */
export const OPTIONAL_MEMBERS = Object.freeze([
    'decision', 'setupOnly', 'open', 'claims', 'variants', 'notations', 'representations',
    'supports', 'misconceptions',
    // `stories(q, {seed}) -> Story | null`: an original story carrying ONE item's numbers, with a
    // number + label answer, for the word-problem role (section 3.8; providers/stories.js).
    'stories',
]);

/* ================================================== the controlled instruction library */
// PEDAGOGY_STANDARD.md section 10.1. One string per task, reused word for word on every page
// and every screen. Page code NEVER composes an instruction; it asks for a key (P-14, BD-14).
// New strings are added only by adding a key here AND in the standard.
//
// `{n}` is a number placeholder, `{place}` a place-value word, `{unit}` a unit word.
// `_word_` marks a word the sheet underlines.

export const INSTRUCTION_LIBRARY = Object.freeze({
    add: 'Add.',
    subtract: 'Subtract.',
    multiply: 'Multiply.',
    divide: 'Divide.',
    'mixed-sign': 'Add or subtract. Look at the _sign_.',
    'mixed-ops': 'Look at the _sign_. Solve.',
    missing: 'Write the missing number.',
    'missing-many': 'Write the missing numbers.',
    'trace-say': 'Trace the answer. Say the steps.',
    'say-write': 'Say the fact. Then write the answer.',
    'rewrite-solve': 'Write the problem in the grid. Then solve.',
    'rewrite-only': 'Write the problem in the grid. Do _not_ solve.',
    'decide-regroup': 'Do you need to regroup? Check one box. Do _not_ solve.',
    'notate-regroup': 'Show the regrouping. Do _not_ subtract.',
    'circle-bigger': 'Circle the bigger number.',
    'underline-first': 'Underline the part you work first.',
    'circle-sign': 'Circle the sign. Then solve.',
    'can-solve': 'Circle the problems you can solve. Solve only those.',
    'rule-yes-no': 'Read the rule. Check one box: Yes or No.',
    compare: 'Write <, > or = in the circle.',
    'order-up': 'Write the numbers in order. Start with the smallest.',
    'count-write': 'Count. Write the number.',
    'draw-count': 'Draw counters to show the number.',
    'ring-groups': 'Circle groups of {n}. Write how many groups.',
    'groups-of': 'Write how many groups. Write how many in each group.',
    array: 'Write how many rows. Write how many in each row.',
    'skip-count': 'Count by {n}. Write the missing numbers.',
    expanded: 'Write the number in expanded form.',
    'digit-value': 'Write the value of the underlined digit.',
    round: 'Round to the nearest {place}.',
    'more-less': 'Write 1 more and 1 less.',
    shade: 'Shade the fraction.',
    'write-fraction': 'Write the fraction.',
    'simplest-form': 'Write the answer in simplest form.',
    denominator: 'Count the equal parts. Write the denominator.',
    numerator: 'Count the shaded parts. Write the numerator.',
    'line-write': 'Write the number at each dot.',
    'line-mark': 'Mark the number on the line.',
    'time-write': 'Write the time.',
    'time-draw': 'Draw the hands.',
    coins: 'Count the coins. Write the total.',
    measure: 'Measure the line. Write the length.',
    convert: 'Use the rule. Write the missing number.',
    graph: 'Use the graph. Answer the questions.',
    table: 'Use the rule. Fill in the table.',
    match: 'Draw a line to match.',
    story: 'Read the story. Fill in the diagram. Solve.',
    'story-v2': 'Solve. Write the number and the label.',
    'story-k': 'Show the story with lines. Write the equation.',
    'check-fix': 'Check the work. Check one box: Correct or Fix it.',
    // Error analysis says where the fix goes (critic round 3).
    'check-fix-write': 'Is it right? Check one box. Fix it: write the right answer.',
    'check-fix-draw': 'Is it right? Check one box. Fix it: draw it again.',
    'check-fix-mark': 'Is it right? Check one box. Fix it: mark it again.',
    'check-by': 'Multiply to check. Check one box: Correct or Fix it.',
    'true-false': 'Check one box: True or False. Finish the sentence.',
    spot: 'Find the mistake. Circle it. Write the correct answer.',
    'odd-one': 'Circle the one that does not belong. Finish the sentence.',
    asn: 'Check one box: Always, Sometimes or Never. Write an example.',
    which: 'Which answer is correct? Circle A or B.',
    stretch: 'Find more than one answer. Fill in the table.',
    'cut-sort': 'Cut. Sort. Glue.',
    'cut-order': 'Cut. Put in order. Glue.',
    'find-color': 'Find every {n}. Color it.',
    // Added 2026-09-25 with the first real skill providers (PEDAGOGY_STANDARD.md 10.1): tasks
    // the library had no string for, so each skill was falling back to "Solve.".
    'line-jumps': 'Draw the jumps on the line. Write the answer.',
    'draw-blocks': 'Draw tens and ones to show the number.',
    'draw-blocks-100': 'Draw hundreds, tens and ones to show the number.',
    'check-groups': 'Look at the groups. Check one box.',
    'how-many-left': 'Write how many are left.',
    // O6 AP1 round 2 (2026-09-25): the K picture cells moved to the kit.
    'count-all': 'Count them all. Write how many.',
    'count-kind': 'Count one kind. Write how many.',
    'count-tens': 'Write how many tens.',
    'ring-remainder': 'Circle groups of {n}. Write the quotient and the remainder.',
    // 2026-09-25 critic round 2: the same tasks when the section's items do not share one {n}
    // (each cell prints its own group size / divisor). Their fallback used to be `groups-of`,
    // which asks for a group size the page already prints.
    'ring-groups-each': 'Circle groups of the number shown. Write how many groups.',
    'ring-remainder-each': 'Circle groups of the second number. Write the quotient and the remainder.',
    'missing-all': 'Write the missing numbers.',
    'story-k2': 'Solve. Write the number.',
    // Every whole-number word problem (owner ruling 2026-09-25): the word-work cell.
    'story-work': 'Circle the sign. Write the numbers in the boxes. Solve.',
    'pick-parts': 'Write one number from each list to make the sum.',
    'fact-family': 'Use the three numbers. Fill in the fact family.',
    'chart-fill': 'Fill in the missing products.',
    'groups-total': 'Write the groups, the number in each, and the total.',
    // Added 2026-09-25 with the P10 time + money providers (design/research/time-money.md).
    'check-clock': 'Check the clock that shows the time.',
    'order-times': 'Write 1, 2, 3 under the clocks. Start with the earliest.',
    'order-times-late': 'Write 1, 2, 3 under the clocks. Start with the latest.',
    'elapsed-end': 'Use the time line. Write the end time.',
    'elapsed-start': 'Use the time line. Write the start time.',
    'elapsed-how-long': 'Use the time line. Write how long it takes.',
    'elapsed-missing': 'Use the time line. Write the missing time.',
    'hour-hand': 'Which is the hour hand? Check one box.',
    'clock-numbers': 'Write the missing numbers on the clock.',
    'fives-ring': 'Count by 5. Write the minutes round the clock.',
    'am-pm': 'Read the time. Check a.m. or p.m.',
    'money-count': 'Count the money. Write the total.',
    'money-two': 'Count the notes, then the coins. Write both numbers.',
    'money-add': 'Add the prices.',
    'money-change': 'Subtract to find the change.',
    'coins-make': 'Do the coins make the amount? Check one box.',
    'fewest-coins': 'Use the fewest coins. Write how many of each.',
    'enough': 'Is there enough money? Check one box.',
    'notes-order': 'Write 1, 2, 3 under the notes. Start with the least.',
    'coin-find': 'Circle every coin worth the number. Write how many.',
    'money-write': 'Write the amount. Use the point.',
    'money-more': 'Which has more money? Check one box.',
    // Function tables (2026-09-25): the four table tasks the rule-given 'table' string does not say.
    'table-rule': 'Find the rule. Write the rule.',
    'table-in': 'Use the rule backward. Write each In number.',
    'table-make': 'Write your own In numbers. Use the rule for Out.',
    // Added 2026-09-25 with count by 1-12, number patterns, the chart tasks and x / ÷ on a line.
    'count-by-row': 'Count by the number in the box. Write the missing numbers.',
    'pattern-rule': 'Use the rule. Write the missing numbers.',
    'pattern-find-rule': 'Find the rule. Write the missing numbers and the rule.',
    'chart-fill-all': 'Fill in the whole multiplication chart.',
    'chart-headers': 'Fill in the missing row and column numbers.',
    'shade-multiples': 'Shade every multiple of {n}.',
    'chart-row-rule': 'Fill in the row. Write the rule.',
    'hop-draw': 'Draw the hops on the line. Write the product.',
    'hop-draw-div': 'Draw hops of the number you divide by. Write how many hops.',
    'hop-sentence': 'Look at the hops. Write the number sentence.',
    'hop-missing': 'Look at the hops. Write the missing number.',
    // P9 place value, rounding and estimation (2026-09-25, place-value-rounding.md §2.6 and §5-§12):
    // the family's providers (providers/pv.js) choose from these, never "Solve.".
    'place-circle': 'Circle the place of the underlined digit.',
    'place-write': 'Write the place of the underlined digit.',
    'unit-form': 'Write how many of each place.',
    'standard-form': 'Write the number.',
    'disk-read': 'Count the disks. Write the number.',
    'disk-count': 'Count the disks in the zone. Write how many.',
    'draw-disks': 'Draw disks to show the number.',
    'chart-digits': 'Write each digit in its place in the chart.',
    'times-ten': 'Move each digit. Write the answer.',
    'word-name': 'Circle the word name of the number.',
    'order-least': 'Write the numbers in order. Start with the least.',
    'order-down': 'Write the numbers in order. Start with the greatest.',
    'underline-place': 'Underline the {place} digit. Circle the digit after it.',
    'round-up-down': 'Check one box: Round up or Round down.',
    'circle-rounds-to': 'Circle every number that rounds to {n}.',
    'mark-round': 'Mark the number on the line. Then round it.',
    // Round on a number line to thousands and beyond (2026-09-25): place the dot, then round.
    'mark-dot-round': 'Mark the number with a dot. Round it to the nearest {place}.',
    'between-tens': 'Write the two tens the number is between.',
    'sort-round': 'Write each number under what it rounds to.',
    'round-table': 'Round each number. Fill in the table.',
    estimate: 'Round each number. Then estimate.',
    'estimate-place': 'Round each number to the nearest {place}. Then estimate.',
    // Round-3: the product rounds ONE number (the other is a one-digit factor), and the quotient
    // uses a compatible number, not rounding — each instruction now says what the key does.
    'estimate-product': 'Round the bigger number to the nearest {place}. Then multiply.',
    'estimate-compatible': 'Find a near number that divides easily. Then divide.',
    'estimate-closest': 'Circle the closest estimate.',
    'estimate-reasonable': 'Estimate. Check one box: Reasonable or Not reasonable.',
    // O6 lane AP3 (2026-09-25): the fraction family's kit cells (sheet/cells/frac-model.js).
    'frac-name': 'Write the fraction, or circle the model that shows it.',
    'models-complete': 'Look at the two models. Complete the number sentence.',
    'line-mark-each': 'Mark each number on the line.',
    // O6 lane AP2 round 3 (2026-09-25): the figure and data cells moved to the kit.
    'read-thermometer': 'Read the thermometer. Write the temperature.',
    'read-ruler': 'Read the ruler. Write the number the arrow points to.',
    'add-sides': 'Add the lengths of all the sides. Write the perimeter.',
    tally: 'Use the tally chart. Answer the questions.',
    // Build lane geometry (2026-09-25): Combine Shapes on the kit shape-grid cell.
    'compose-name': 'Check the name of the shape the pieces make.',
    'compose-name-write': 'Write the name of the shape the pieces make.',
    'compose-pieces': 'Check the pieces that make the shape.',
    // Build lane geometry: the area and perimeter family on the shape-grid figure.
    'count-squares': 'Count the unit squares. Write the area.',
    'count-edges': 'Count the units round the outside. Write the perimeter.',
    'perimeter-or-side': 'Find the perimeter, or the missing side.',
    'area-or-side': 'Find the area, or the missing side.',
    'area-perimeter': 'Write the perimeter and the area.',
    'composite-perimeter': 'Add all the sides. Write the perimeter.',
    'composite-area': 'Split the shape into rectangles. Write the area.',
    'triangle-area': 'Multiply the base by the height. Halve it. Write the area.',
    'fill-blocks': 'Draw lines to fill the shape with the blocks. Write how many.',
    'volume': 'Find the volume, or the missing edge.',
    'volume-composite': 'Split the solid into two prisms. Add their volumes.',
    // The five the DEFAULT ADAPTER may choose from, and nothing else (section 4.5).
    'default-write': 'Solve. Write the answer.',
    'default-circle': 'Circle the answer.',
    'default-circle-all': 'Circle all the correct answers.',
    'default-order': 'Write the numbers in order.',
    'default-solve': 'Solve.',
});

/**
 * The two judge check-box LABELS (they are labels, not instructions, so P-LG-1 does not apply).
 * A page where the pupil then writes the right answer uses Correct / Fix it (`check-fix`);
 * a page where the pupil only judges uses Correct / Not correct. Ruled 2026-09-19.
 */
export const JUDGE_LABELS = Object.freeze({
    correct: 'Correct',
    notCorrect: 'Not correct',
    fixIt: 'Fix it',
});

/** PEDAGOGY_STANDARD.md 10.2. The closed print verb list. `Tick` was removed on 2026-09-19. */
export const PRINT_VERBS = Object.freeze([
    'Look', 'Read', 'Say', 'Count', 'Circle', 'Underline', 'Box', 'Cross out', 'Trace', 'Write',
    'Draw', 'Shade', 'Mark', 'Match', 'Measure', 'Use', 'Find', 'Fill in', 'Finish', 'Check',
    'Fix', 'Think', 'Start', 'Put', 'Move', 'Add', 'Subtract', 'Multiply', 'Divide', 'Solve',
    'Round', 'Compare', 'Estimate', 'Regroup', 'Bring down', 'Cut', 'Sort', 'Glue', 'Color',
]);

/** Verbs that may NEVER appear in an instruction (P-LG-4). */
export const BANNED_INSTRUCTION_WORDS = Object.freeze([
    'explain', 'describe', 'justify', 'discuss', 'prove', 'in your own words', 'tick',
]);

/**
 * PEDAGOGY_STANDARD.md 10.2. The fixed print -> screen verb map. No other rewording is allowed
 * between paper and screen, so the instruction stays the same instruction (P-LG-2).
 * Longest phrase first, because the replacements run in order.
 */
// THREE of the standard's verb targets carry their OWN object - Shade -> "Tap the parts",
// Mark -> "Tap the line", Measure -> "Drag the ruler". Swapping the verb alone collides with the
// object the print sentence already has, and the result is not English:
//     "Shade the fraction."          -> "Tap the parts the fraction."
//     "Mark the number on the line." -> "Tap the line the number on the line."
//     "Measure the line. ..."        -> "Drag the ruler the line. ..."
// So each of those appears FIRST as a whole-phrase rule that rewrites verb AND object together.
// The phrase rules reach the same screen verb the standard names; they only supply the joining
// word the verb-only swap cannot. The bare verb stays below as the fallback for any string
// outside the closed library.
const SCREEN_VERB_MAP = Object.freeze([
    ['Draw hops of the number you divide by', 'Tap the line to hop by the number you divide by'],
    ['Draw the hops on the line', 'Tap the line to make the hops'],
    ['Shade every multiple of', 'Tap every multiple of'],
    ['Draw a line to match', 'Tap the two that match'],
    ['Mark the number on the line', 'Tap the number on the line'],
    ['Mark each number on the line', 'Tap each number, then its tick on the line'],
    ['Mark the number with a dot', 'Tap the line to place the number'],
    ['Shade the fraction', 'Tap the parts of the fraction'],
    ['Draw the hands', 'Drag the hands'],
    // round 4 (H7): the paper verbs the screen sweep (ws-screen-slots) still found
    ['Draw the lines of symmetry', 'Tap the lines of symmetry'],
    ['Draw disks to show', 'Tap the mat to show'],
    ['Check the clock', 'Tap the clock'],
    ['Measure the line', 'Drag the ruler to the line'],
    ['Check one box', 'Tap one box'],
    ['Check the box', 'Tap the box'],
    ['Cross out', 'Tap'],
    ['Measure', 'Drag the ruler'],
    ['Circle', 'Tap'],
    ['Underline', 'Tap'],
    ['Shade', 'Tap the parts'],
    ['Trace', 'Tap'],
    ['Color', 'Tap'],
    ['Mark', 'Tap the line'],
    ['Write', 'Type'],
    ['Box', 'Tap'],
    ['Cut', 'Drag'],
    ['Draw', 'Tap'],
    ['Sort', 'Drag'],
    ['Glue', 'Drag'],
]);

/**
 * Every entry whose `from` is a SINGLE word is also a common NOUN in these sentences, and the
 * nouns must be left alone: `compare` is "Write <, > or = in the circle.", and a blind swap
 * turned it into "Type <, > or = in the tap." - the one instruction every comparing skill
 * prints. So a single-word rule fires only in VERB POSITION: at the start of the string, after
 * a sentence end, or after "Then" / "and" / "or". Multi-word phrases carry their own context
 * and fire anywhere.
 */
const SCREEN_VERB_SINGLE = new Set(
    SCREEN_VERB_MAP.filter(([from]) => !/\s/.test(from)).map(([from]) => from.toLowerCase()),
);

/**
 * The instruction string for a library key, with `{n}` / `{place}` / `{unit}` filled in.
 * Throws on an unknown key ON PURPOSE: composing an instruction freely is the defect this
 * function exists to prevent (P-14).
 */
export function instructionFor(key, vars = {}) {
    const raw = INSTRUCTION_LIBRARY[key];
    if (raw === undefined) throw new Error(`instructionFor: "${key}" is not in the controlled library`);
    const out = raw.replace(/\{(\w+)\}/g, (m, name) => (
        vars[name] === undefined || vars[name] === null || vars[name] === '' ? m : String(vars[name])));
    // A placeholder left unfilled would print "{n}" on a pupil's page. Throw instead, so every
    // caller's existing fallback (the neutral default instruction) applies.
    if (/\{\w+\}/.test(out)) throw new Error(`instructionFor: "${key}" needs ${out.match(/\{\w+\}/g).join(', ')}`);
    return out;
}

/** The library key of a string, or '' when the string was composed freely (lint seam). */
export function instructionKeyOf(text) {
    const want = String(text || '').trim();
    for (const [key, value] of Object.entries(INSTRUCTION_LIBRARY)) if (value === want) return key;
    return '';
}

/** Is this exactly a library string? Used by the gallery's self-check and by future lints. */
export const isLibraryInstruction = (text) => instructionKeyOf(text) !== '';

// One pass, longest phrase first, so a phrase that has already been swapped is never swapped
// again by a shorter rule: "Check one box" must become "Tap one box", never "Tap one tap".
const SCREEN_VERB_RE = new RegExp(
    `\\b(${SCREEN_VERB_MAP.map(([from]) => from).join('|')})\\b`, 'gi',
);
const SCREEN_VERB_LOOKUP = new Map(SCREEN_VERB_MAP.map(([from, to]) => [from.toLowerCase(), to]));

/**
 * The screen wording of a print instruction (10.2). The swap is a fixed map applied in ONE
 * pass, not a rewrite: a string that needs no swap comes back unchanged, and a swapped phrase
 * is never re-read by a later rule.
 */
export function toScreenInstruction(text) {
    const src = String(text || '');
    return src.replace(SCREEN_VERB_RE, (match, _g, offset) => {
        const key = match.toLowerCase();
        const to = SCREEN_VERB_LOOKUP.get(key);
        if (to === undefined) return match;
        // A one-word rule is also a noun ("in the circle", "one box"): only swap it where a verb
        // can stand. `_` markers are skipped so "_Circle_" at the head of a sentence still counts.
        if (SCREEN_VERB_SINGLE.has(key)) {
            const before = src.slice(0, offset).replace(/[_\s]+$/, '');
            const verbPosition = before === ''
                || /[.?!:;]$/.test(before)
                || /\b(then|and|or)$/i.test(before)
                // a sentence after an expression ("81 ? 9 = 9   Write + − × or ÷ in the circle.")
                || (/^[A-Z]/.test(match) && /[0-9)=?]$/.test(before));
            if (!verbPosition) return match;
        }
        // Keep the case the sentence needs: a phrase mid-sentence stays lower case.
        return /^[A-Z]/.test(match) ? to : to.charAt(0).toLowerCase() + to.slice(1);
    });
}

/**
 * P-LG-1 / P-LG-4 checks on one instruction string. Returns the problems, empty when clean.
 * Underline markers (`_not_`) are stripped before counting words.
 */
export function lintInstruction(text) {
    const problems = [];
    const plain = String(text || '').replace(/_/g, '').trim();
    if (!plain) return ['empty instruction'];
    const words = plain.split(/\s+/).length;
    if (words > 12) problems.push(`${words} words (P-LG-1 caps it at 12)`);
    const sentences = plain.split(/(?<=[.?!])\s+/).filter(Boolean);
    if (sentences.length > 3) problems.push(`${sentences.length} sentences (P-LG-1 caps it at 3)`);
    for (const banned of BANNED_INSTRUCTION_WORDS) {
        if (new RegExp(`\\b${banned}\\b`, 'i').test(plain)) problems.push(`uses "${banned}" (P-LG-4)`);
    }
    const first = sentences[0] || '';
    const startsWithVerb = PRINT_VERBS.some((v) => first.startsWith(v + ' ') || first === v + '.');
    const isQuestion = /\?/.test(first);
    if (!startsWithVerb && !isQuestion) problems.push(`does not start with a print verb: "${first}"`);
    return problems;
}

/* ================================================================== the default adapters */
// The EMPTY forms (SCC-A1). `adapters.js` replaces every one of them at its module load; until
// then a provider still answers, with nothing in it, so tests and a bare import never crash.

const EMPTY_DEFAULTS = Object.freeze({
    renderCell: () => '',
    workedSteps: () => [],
    wrongAnswer: () => null,
    strings: (ref) => ({
        iCan: `I Can work on ${(ref && (ref.label || ref.skillId)) || 'this skill'}`,
        instruction: INSTRUCTION_LIBRARY['default-solve'],
        instructionKey: 'default-solve',
    }),
    footprint: () => ({ kind: 'legacy', factLike: false, maxCols: 2, wMm: 93, measure: true }),
    options: () => [],
    decision: () => null,
    setupOnly: () => null,
    open: () => null,
});

let DEFAULTS = EMPTY_DEFAULTS;

/**
 * The seam `adapters.js` uses to install the real default adapters. Keeps the dependency
 * pointing one way: adapters -> contract, never the reverse.
 */
export function installDefaultAdapters(adapters) {
    DEFAULTS = Object.freeze(Object.assign({}, EMPTY_DEFAULTS, adapters || {}));
    return DEFAULTS;
}

/** The default adapters currently installed. */
export const defaultAdapters = () => DEFAULTS;

/** Test seam: put the empty forms back. */
export function __resetDefaultAdapters() { DEFAULTS = EMPTY_DEFAULTS; }

/** Have the real adapters loaded, or are we still on the empty forms? */
export const adaptersInstalled = () => DEFAULTS !== EMPTY_DEFAULTS;

/* ====================================================================== the provider map */

/** @type {Map<string, Object>} keyed 'categoryId:skillId' or bare 'skillId' */
const PROVIDERS = new Map();

/**
 * Register one skill's provider (SCC-P1). The key is `categoryId:skillId` when the skill id is
 * reused across categories, or a bare `skillId` when it is not.
 *
 * Only the members a skill really implements are passed; everything else comes from the
 * defaults and is named in `provider.defaults`.
 */
export function registerSkill(key, provider) {
    if (typeof key !== 'string' || !key) throw new Error('registerSkill: key must be a non-empty string');
    if (!provider || typeof provider !== 'object') throw new Error(`registerSkill: "${key}" has no provider object`);
    if (PROVIDERS.has(key)) throw new Error(`registerSkill: "${key}" is already registered`);
    const unknown = Object.keys(provider).filter(
        (k) => !CONTRACT_MEMBERS.includes(k) && !OPTIONAL_MEMBERS.includes(k) && k !== 'defaults',
    );
    if (unknown.length) throw new Error(`registerSkill: "${key}" declares unknown members: ${unknown.join(', ')}`);
    PROVIDERS.set(key, provider);
    return provider;
}

export const hasProvider = (categoryId, skillId) =>
    PROVIDERS.has(`${categoryId}:${skillId}`) || PROVIDERS.has(String(skillId));

/** Which skills have a real provider today. Sorted, so a report is stable. */
export const listProviders = () => [...PROVIDERS.keys()].sort();

/** Test seam only: drop every registration. Never called by app code. */
export function __resetProviders() { PROVIDERS.clear(); }

/**
 * The provider for a skill. NEVER null: every gap is filled from the default adapters and
 * listed in `.defaults` so `coverageFor()` and the lints can see exactly what is real (SCC-P2).
 *
 * The returned object is a fresh shallow object each call, so a caller may not mutate the
 * registered provider by accident.
 */
export function getProvider(categoryId, skillId) {
    const key = `${categoryId}:${skillId}`;
    const raw = PROVIDERS.get(key) || PROVIDERS.get(String(skillId)) || null;
    const d = DEFAULTS;
    const out = {
        key: raw ? (PROVIDERS.has(key) ? key : String(skillId)) : key,
        categoryId, skillId,
        defaults: [],
        real: [],
    };
    for (const member of CONTRACT_MEMBERS) {
        if (raw && raw[member] !== undefined && raw[member] !== null) {
            out[member] = raw[member];
            out.real.push(member);
        } else {
            out[member] = d[member];
            out.defaults.push(member);
        }
    }
    for (const member of OPTIONAL_MEMBERS) {
        if (raw && raw[member] !== undefined && raw[member] !== null) {
            out[member] = raw[member];
            out.real.push(member);
        } else if (d[member] !== undefined) {
            out[member] = d[member];
        }
    }
    return out;
}

/* ======================================================================= coverage report */
// The map P4-P11 works through. It has to be ACCURATE rather than flattering: a member counts
// as REAL only when a registered provider implements it. Everything the default adapter derives
// from the legacy app - the print handler, the worked-solution text, SKILL_PRINT_SIZE, the
// skill label - is a DEFAULT, however good it looks, because a later family migration still
// has to replace it.
//
// Within "default" the report grades what the adapter had to work with, so the owner can see
// the difference between a default that prints something usable and one that prints a stub.

/** How good a DEFAULT is. `good` prints; `thin` prints but says little; `stub` should not go out. */
export const QUALITY = Object.freeze(['good', 'thin', 'stub']);

/**
 * @typedef {Object} CoverageProbe   one skill, MEASURED by running the default adapters over
 *                                   real generated questions (never guessed from a name)
 * @property {string} categoryId @property {string} skillId @property {string} label @property {string} grade
 * @property {number} n                  questions sampled
 * @property {number} errors             samples that threw
 * @property {boolean} hasCellData       a generator emitted q.cell with a registered non-legacy template
 * @property {boolean} legacyRendered     the legacy print handler returned real HTML for every sample
 * @property {number} colour             samples with colour in the question content
 * @property {number} emoji              samples with an emoji in the question content
 * @property {number} noPrintFormat      samples with no printFormat
 * @property {number} multipleChoice     samples whose screen answer type is multiple choice
 * @property {number} stepsOk            samples whose default workedSteps gave >= 3 steps
 * @property {number} stepsAny           samples that gave >= 1 step
 * @property {string} stepsBasis         'worked' | 'solution' | 'hint' | 'answer-only' | 'none'
 * @property {number} wrongMisconception samples whose default wrongAnswer was misconception-based
 * @property {number} wrongAny           samples that produced any wrong answer at all
 * @property {string} wrongBasis         'tagged' | 'option' | 'inverse-op' | 'place-value' | 'swap' | 'clock' | 'fixed-set' | 'nudge' | 'none'
 * @property {boolean} iCanVerb          the derived iCan begins with a library verb ("I Can add ...")
 * @property {string} instructionKey     the library key the default instruction chose
 * @property {string} printSize          compact | standard | medium | wide | spacious
 * @property {string} footprintBasis     'skill-print-size' | 'print-format-size' | 'fallback-standard'
 * @property {boolean} factLike
 * @property {number} optionCount        the skill's OWN option declarations (universal ones excluded)
 * @property {string} host               host layout from design/SKILL_CATALOGUE.md
 */

function gradeRenderCell(p, real) {
    if (real) return { source: 'provider', quality: 'good', note: 'skill provider' };
    if (p.hasCellData) return { source: 'default', quality: 'good', note: 'generator emits q.cell; kit template draws it' };
    const notes = [];
    if (p.colour) notes.push('colour in question content (INK-1)');
    if (p.emoji) notes.push('emoji in question content');
    if (p.multipleChoice) notes.push('multiple choice on screen (SCC-T15 parity)');
    if (p.noPrintFormat) notes.push('no printFormat: generic legacy branch');
    if (!p.legacyRendered) return { source: 'default', quality: 'stub', note: 'legacy print handler returned nothing' };
    const quality = (p.colour || p.emoji) ? 'thin' : 'good';
    return { source: 'default', quality, note: notes.length ? `legacy cell; ${notes.join('; ')}` : 'legacy cell' };
}

function gradeWorkedSteps(p, real) {
    if (real) return { source: 'provider', quality: 'good', note: 'authored steps' };
    const n = Math.max(1, p.n || 1);
    if (p.stepsBasis === 'none' || !p.stepsAny) return { source: 'default', quality: 'stub', note: 'no worked steps from either source' };
    if (p.stepsBasis === 'answer-only') return { source: 'default', quality: 'stub', note: 'only an Answer line: one step, no method' };
    if (p.stepsBasis === 'hint') return { source: 'default', quality: 'thin', note: 'steps split out of q.hint' };
    const quality = p.stepsOk / n >= 0.8 ? 'good' : 'thin';
    return { source: 'default', quality, note: `${p.stepsBasis === 'worked' ? 'generateWorkedSolution' : 'generateSolutionSteps'} text, normalised` };
}

function gradeWrongAnswer(p, real) {
    if (real) return { source: 'provider', quality: 'good', note: 'named misconceptions' };
    const n = Math.max(1, p.n || 1);
    if (!p.wrongAny) return { source: 'default', quality: 'stub', note: 'no plausible wrong answer: role must decline' };
    const rate = p.wrongMisconception / n;
    if (rate >= 0.8) return { source: 'default', quality: 'good', note: `${p.wrongBasis}: a real error, not a random number` };
    if (rate > 0) return { source: 'default', quality: 'thin', note: `${p.wrongBasis}: misconception on ${Math.round(100 * rate)}% of items, a nudge on the rest` };
    return { source: 'default', quality: 'stub', note: `${p.wrongBasis}: a nudged number, NOT a misconception - flagged so a role can decline` };
}

function gradeStrings(p, real) {
    if (real) return { source: 'provider', quality: 'good', note: 'authored strings' };
    const notes = [`instruction "${p.instructionKey}"`];
    if (!p.iCanVerb) notes.push('iCan falls back to "I Can work on ..."');
    notes.push('no whatsNew, no vocabulary, no oral frame');
    return { source: 'default', quality: p.iCanVerb ? 'thin' : 'stub', note: notes.join('; ') };
}

function gradeFootprint(p, real) {
    if (real) return { source: 'provider', quality: 'good', note: 'authored footprint' };
    if (p.footprintBasis === 'skill-print-size') return { source: 'default', quality: 'good', note: `SKILL_PRINT_SIZE: ${p.printSize}` };
    if (p.footprintBasis === 'print-format-size') return { source: 'default', quality: 'thin', note: `PRINT_FORMAT_SIZE fallback: ${p.printSize}` };
    return { source: 'default', quality: 'stub', note: 'no size entry: defaulted to standard, height must be measured' };
}

function gradeOptions(p, real) {
    if (real) return { source: 'provider', quality: 'good', note: 'provider option schema' };
    if (p.optionCount > 0) return { source: 'default', quality: 'good', note: `${p.optionCount} declared in SKILL_OPTIONS` };
    return { source: 'default', quality: 'stub', note: 'level only: the dialog shows "one type"' };
}

const GRADERS = { renderCell: gradeRenderCell, workedSteps: gradeWorkedSteps, wrongAnswer: gradeWrongAnswer, strings: gradeStrings, footprint: gradeFootprint, options: gradeOptions };

/**
 * Turn measured probes into the coverage map.
 * @param {CoverageProbe[]} probes
 * @returns {{generated: string, totals: Object, skills: Object[], worst: Object[]}}
 */
export function coverageFor(probes = []) {
    const skills = probes.map((p) => {
        const real = new Set(getProvider(p.categoryId, p.skillId).real);
        const members = {};
        for (const member of CONTRACT_MEMBERS) members[member] = GRADERS[member](p, real.has(member));
        const stubs = CONTRACT_MEMBERS.filter((m) => members[m].quality === 'stub');
        return {
            key: `${p.categoryId}:${p.skillId}`,
            categoryId: p.categoryId, skillId: p.skillId, label: p.label, grade: p.grade, host: p.host,
            n: p.n, errors: p.errors || 0,
            members,
            realCount: CONTRACT_MEMBERS.filter((m) => members[m].source === 'provider').length,
            stubCount: stubs.length,
            stubs,
        };
    });
    return { totals: summariseCoverage(skills), skills, worst: worstOffenders(skills) };
}

/** Per-member tallies across every skill. */
export function summariseCoverage(skills = []) {
    const totals = { skills: skills.length, members: {} };
    for (const member of CONTRACT_MEMBERS) {
        const row = { provider: 0, default: 0, good: 0, thin: 0, stub: 0 };
        for (const s of skills) {
            const m = s.members[member];
            row[m.source]++;
            row[m.quality]++;
        }
        totals.members[member] = row;
    }
    totals.fullyDefault = skills.filter((s) => s.realCount === 0).length;
    totals.withAnyStub = skills.filter((s) => s.stubCount > 0).length;
    totals.allSix = skills.filter((s) => s.realCount === CONTRACT_MEMBERS.length).length;
    return totals;
}

/** The skills whose defaults are worst - the ones a human should look at first. */
export function worstOffenders(skills = [], limit = 25) {
    return skills
        .filter((s) => s.stubCount > 0)
        .sort((a, b) => b.stubCount - a.stubCount || a.key.localeCompare(b.key))
        .slice(0, limit)
        .map((s) => ({ key: s.key, label: s.label, stubs: s.stubs, notes: s.stubs.map((m) => `${m}: ${s.members[m].note}`) }));
}
