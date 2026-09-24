// skill-options.js — the options a skill carries with it.
//
// Owner's rule (2026-09-19): options live ON THE SKILL, not on the page. A skill declares what
// it can be configured with; the chosen values travel with it into ANY page role — lesson
// opener, model, guided, independent, more practice, daily / mixed review, test A/B, error
// analysis — and govern both how it behaves on screen and how it prints there.
//
//   "Add 6, sums to 20, Level 2" is ONE configured skill usable on a lesson page, a review page
//   and a test. It is not three skill ids, and not three page settings.
//
// A ladder step is therefore a skill plus a set of option values, which is what lets us say
// "one new thing per step" without inventing a skill id for every step.
//
// Page-level choices (look, size, columns, label style, paper) are NOT here — they belong to the
// page composer's ComposeOptions. A page role never overrides a skill option.

// ---------------------------------------------------------------------------
// Option types
// ---------------------------------------------------------------------------
// { id, label, type, default, ... }
//   'int'     min, max, step          a number the teacher picks
//   'enum'    values: [{v, l}]        one of a fixed list
//   'bool'                            a tick-box
//   'set'     values: [{v, l}]        any number of a fixed list: all, none, or a selection.
//                                     None ticked means "no restriction", never an empty page.
//
// `appliesTo(opts)` (optional) hides an option that the current choices make meaningless.

export const OPTION_TYPES = ['int', 'enum', 'bool', 'set'];

// ---------------------------------------------------------------------------
// Shared option definitions, so families stay consistent
// ---------------------------------------------------------------------------

// The band bounds the ANSWER, never the operands (owner ruling 2026-09-19):
// the sum for +, the minuend for -, the product for x, the dividend for /.
export const bandOption = (values, dflt) => ({
    id: 'band', label: 'Numbers to', type: 'enum', default: dflt,
    values: values.map(v => ({ v, l: v.toLocaleString('en-US') })),
    help: 'Bounds the answer, not the numbers you start from.',
});

// Single-fact sets: the teacher ticks which facts the page drills — one ("Add 6"), a few
// ("x2, x5, x10" as a cumulative set) or all of them. All ticked is "mixed", and is the default
// (owner, 2026-09-19). + and - take a constant 0-13 and run to 30; x and / use the set order
// {0,1,2,5,10} -> {3,4,6} -> {7,8,9} -> {11,12} and run to 12.
//
// `titleVerb` is how the chosen set is NAMED on a sheet, and it is not always the dialog label:
// the × control reads "Times" beside a column of numerals, but a sheet headed "Times 6" reads
// wrong, so its title verb is "Multiply by". factSetTitle() below builds the whole string.
export const constantOption = (max, label, titleVerb) => ({
    id: 'constant', label, type: 'set', default: Array.from({ length: max + 1 }, (_, n) => n),
    values: Array.from({ length: max + 1 }, (_, n) => ({ v: n, l: String(n) })),
    allLabel: 'Mixed (all of them)',
    titleVerb: titleVerb || label,
    help: 'Tick one fact set to drill it on its own, or several to build a cumulative set. All ticked is mixed.',
});

// Scaffold level replaces the easy / medium / hard twin skills (owner ruling 2026-09-19).
// 3 = worked and traced, 2 = hints shown, 1 = structure only, 0 = bare.
// Support level is a SET for the same reason as notation (owner, 2026-09-20): "multiple support
// helps on the same page". Ticking several levels builds a FADING page — the first cells worked
// and traced, the middle ones hinted, the last ones bare — which is the scaffold fade the sample
// workbooks use within a single sheet, not just between sheets. Structural supports (digit grids,
// regroup boxes, frames) stay at every level; only hint supports fade.
export const levelOption = (dflt = 1) => ({
    id: 'level', label: 'Support level', type: 'set', default: [dflt],
    values: [
        { v: 3, l: '3 — worked example, traced' },
        { v: 2, l: '2 — hints shown' },
        { v: 1, l: '1 — structure only' },
        { v: 0, l: '0 — nothing given' },
    ],
    allLabel: 'All four, fading down the page',
    help: 'Tick one level for a page that stays at it, or several to fade across the page — most '
        + 'support first, least last. Structural supports stay at every level; hint supports fade.',
});

// A skill that can only draw SOME of the four support levels declares the subset it can draw.
// Offering level 3 on a skill with no worked-and-traced form would be a dead control — the
// teacher ticks it, the page comes back identical, and the dialog stops being believed. The
// labels stay the canonical ones so the scale means the same thing on every sheet; `help` says
// what those levels look like for this particular skill.
export const levelSubset = (values, dflt, help) => {
    const all = levelOption();
    const keep = all.values.filter(v => values.includes(v.v));
    return {
        ...all,
        default: [dflt],
        values: keep,
        allLabel: `All ${keep.length}, fading down the page`,
        help: help ? `${help} Tick several to fade across the page — most support first.` : all.help,
    };
};

export const picturesOption = (dflt = true) => ({
    id: 'pictures', label: 'Pictures', type: 'bool', default: dflt,
    help: 'Off gives the same problems as text only.',
});

// What the pupil is asked to DO with a word problem (coordinator, 2026-09-20).
//
// Six word-problem skills used to divert 20% of items at random into a "Click ALL the numbers
// you need" multi-select — a different task, a different answer key and a screen-only response,
// landing unannounced on a page whose instruction said "solve". That is the silent type mixing
// the content audit reports (P-28/P-29). It becomes a choice the teacher makes once, and the
// choice is OFF by default, so a page that says solve only ever asks the pupil to solve.
//
// 'which-numbers' does not ask for an answer at all: the pupil picks out the numbers the story
// actually needs, which is the set-up step before computing, and is worth a page of its own.
export const responseOption = ({ arrayBuilder = false } = {}) => ({
    id: 'response', label: 'How the pupil answers', type: 'enum', default: 'standard',
    values: [
        { v: 'standard', l: 'Work it out and write the answer' },
        { v: 'which-numbers', l: 'Pick the numbers the story needs (no answer)' },
        ...(arrayBuilder ? [{ v: 'array-builder', l: 'Build the array, then answer' }] : []),
    ],
    help: '"Pick the numbers the story needs" asks the pupil to find which numbers the question '
        + 'depends on and mark them, instead of computing — the set-up step on its own. One choice '
        + 'per page: a page never mixes it with solving, because the instruction and the answer '
        + 'key can only say one thing.',
});

export const regroupOption = () => ({
    id: 'regroup', label: 'Regrouping', type: 'enum', default: 'mixed',
    values: [{ v: 'none', l: 'Never' }, { v: 'always', l: 'Always' }, { v: 'mixed', l: 'Mixed' }],
});

export const orientationOption = () => ({
    id: 'orientation', label: 'How it is written', type: 'enum', default: 'vertical',
    values: [{ v: 'vertical', l: 'Stacked' }, { v: 'horizontal', l: 'Across' }],
    help: 'One orientation per page: they are separate steps.',
});

export const unknownOption = () => ({
    id: 'unknown', label: 'What is missing', type: 'enum', default: 'answer',
    values: [{ v: 'answer', l: 'The answer' }, { v: 'first', l: 'The first number' }, { v: 'second', l: 'The second number' }, { v: 'mixed', l: 'Mixed' }],
});

export const simplestFormOption = () => ({
    id: 'simplestForm', label: 'Must be in simplest form', type: 'bool', default: false,
    help: 'Off accepts any equivalent fraction, as CCSS does. On adds it to the instruction.',
});

// How the problem is WRITTEN on the page (owner report, 2026-09-19: "there is no horizontal
// multiplication or long division or fraction division signs — these should be somehow in the
// skill options when printing").
//
// The teacher chooses it once for the skill and it travels into every page role. It is NEVER
// rolled per item: a page that mixes stacked and across in one block is a defect the content
// audit flags, and it is what made his printed sheet stack 48 ÷ 4.
//
// `op` is '+', '-', 'x' or '/' (the real glyphs are accepted too).
//   + - x : stacked (default) | across
//   /     : across (default)  | bracket | fraction
//
// Multi-digit column work is not a notation choice. An item that needs a place-value grid is
// written stacked whatever this says, and a multi-digit dividend keeps the bracket, because
// that is where the working goes. The help string says so, so the teacher is told rather than
// quietly overruled.
// Notation is a SET, not a single choice (owner, 2026-09-20): "have the options be check boxes
// so you can have multiple ways to show a problem ... on the same page". Ticking one notation
// gives a page written only that way; ticking several writes the page in all of them, which is
// how a discrimination step is built — two procedures placed side by side so the pupil has to
// decide which one the problem calls for (PEDAGOGY_STANDARD.md). The generator deals the ticked
// notations round-robin rather than rolling each item, so a 6-item page with 3 ticked gives 2 of
// each instead of a lucky clump, and every ticked notation is certain to appear.
//
// One ticked is the default, so a page stays single-notation unless the teacher asks otherwise.
export const notationOption = (op) => {
    const glyph = { '+': '+', '-': '−', '−': '−', 'x': '×', '*': '×', '×': '×', '/': '÷', '÷': '÷' }[op] || op;

    if (glyph === '÷') {
        return {
            id: 'notation', label: 'How it is written', type: 'set', default: ['across'],
            values: [
                { v: 'across', l: 'Across  (48 ÷ 4 = __)' },
                { v: 'bracket', l: 'Long division bracket  (4⟌48)' },
                { v: 'fraction', l: 'Fraction bar  (48 over 4)' },
            ],
            allLabel: 'All three ways, mixed',
            help: 'Tick one way for a single-notation page, or several to mix them on one page so the '
                + 'pupil has to decide which is which. Long division with a multi-digit dividend always '
                + 'uses the bracket, whatever is ticked, because that is where the working goes. '
                + 'Fact rows at 5 columns and denser stack every fact so the ones digits line up.',
        };
    }

    const [a, b] = glyph === '×' ? ['7', '8'] : glyph === '−' ? ['15', '8'] : ['8', '7'];
    return {
        id: 'notation', label: 'How it is written', type: 'set', default: ['stacked'],
        values: [
            { v: 'stacked', l: `Stacked  (${a} above ${glyph} ${b}, with a rule under it)` },
            { v: 'across', l: `Across  (${a} ${glyph} ${b} = __)` },
        ],
        allLabel: 'Both ways, mixed',
        help: 'Tick one way for a single-notation page, or both to mix them so the pupil has to rewrite '
            + 'between the two. Across is used only where the item is a one-line fact: multi-digit column '
            + 'work stays stacked whatever is ticked, so it keeps its place-value columns.',
    };
};

// ---------------------------------------------------------------------------
// The registry: skillId -> option[]  (or categoryId:skillId for an id used twice)
// ---------------------------------------------------------------------------
// A skill appears here only when its generator ACTUALLY honours the option. An option a skill
// ignores is worse than no option: the teacher picks "across", the page prints stacked, and he
// stops trusting the dialog. Each family migration adds its own skills as the generator learns
// to honour them.
//
// Today that is `notation` on the twenty + - x / skills whose generator branch in
// gen-operations.js can write the item both ways. `band` and `constant` (see bandOption /
// constantOption above) are deliberately NOT attached yet: gen-operations.js does not read
// them, so declaring them would be a promise the page breaks.
const _add = () => [notationOption('+')];
const _sub = () => [notationOption('-')];
const _mul = () => [notationOption('x')];
const _div = () => [notationOption('/')];

export const SKILL_OPTIONS = {
    // --- the four basic skills -------------------------------------------------
    // Within the fact bands these are one-line items and honour the choice; above them the
    // generator is doing column work / long division and stays stacked (see the help string).
    'addition:add': _add(),
    'subtraction:subtract': _sub(),
    'multiplication:multiply': _mul(),
    'division:divide': _div(),

    // --- the four fact drills --------------------------------------------------
    // The CONSTANT is what makes a fact drill a ladder step: "Add 6" is one step, "Add 7" is
    // the next, several ticked is a cumulative set, and all ticked is mixed — which is the
    // default, so an untouched skill drills everything exactly as it does today (owner ruling
    // 4). + and - take a constant 0-13 and run to 30; x and / use the set order
    // {0,1,2,5,10} -> {3,4,6} -> {7,8,9} -> {11,12} and run to 12 (ruling 3). Ticking 0 is what
    // finally puts n + 0 and n x 0 on a page: the zero facts are the last set, and until now no
    // generator in the family ever produced one.
    //
    // Registered 2026-09-20 on the coordinator's instruction, ahead of the read landing in
    // gen-operations.js this same pass. That is deliberately against the rule stated below —
    // an option is normally registered only once its generator honours it — and it is the one
    // exception: the two changes were waiting on each other. If the read has NOT landed,
    // this control does nothing and must be pulled, not left to lie to the teacher.
    'addition:add_facts': [constantOption(13, 'Add'), ..._add()],
    'subtraction:sub_facts': [constantOption(13, 'Subtract'), ..._sub()],
    'multiplication:mult_facts': [constantOption(12, 'Times', 'Multiply by'), ..._mul()],
    'division:div_facts': [constantOption(12, 'Divide by'), ..._div()],

    // --- the word problems that used to divert 20% of items into a select-all ---
    // See responseOption above. 'array-builder' is offered on mult_word_problems only, because
    // that is the only one of the six whose story has an array to build.
    'addition:add_word_problems': [responseOption()],
    'subtraction:sub_word_problems': [responseOption()],
    'multiplication:mult_word_problems': [responseOption({ arrayBuilder: true })],
    'division:div_word_problems': [responseOption()],
    'multiplication:mult_comparison': [responseOption()],
    'addition:comparison_word': [responseOption()],

    // --- add / subtract within 10 and within 20 --------------------------------
    // Single-digit items, so "across" is genuinely available. The bands from 50 up are
    // multi-digit column work and are deliberately absent: they could not honour it.
    'addition:add_10_no_regroup': _add(),
    'addition:add_10_regroup': _add(),
    'addition:add_10_mixed': _add(),
    'addition:add_20_no_regroup': _add(),
    'addition:add_20_regroup': _add(),
    'addition:add_20_mixed': _add(),
    'subtraction:sub_10_no_regroup': _sub(),
    'subtraction:sub_10_regroup': _sub(),
    'subtraction:sub_10_mixed': _sub(),
    'subtraction:sub_20_no_regroup': _sub(),
    'subtraction:sub_20_regroup': _sub(),
    'subtraction:sub_20_mixed': _sub(),

    // --- the two x/÷ skills that used to shuffle division notation per item -----
    // `missing_mult_div` wrote one of three notations per item and `mult_div_fact_family` wrote
    // one per equation INSIDE a single cell (catalogue mult-div-integers.md, "silent type
    // mixing"). Both now take the teacher's choice. Only the ÷ equations of a fact family are
    // affected; the × ones have only one form.
    'division:missing_mult_div': _div(),
    'multiplication:mult_div_fact_family': _div(),

    // --- the merged easy / medium / hard twins (owner ruling 5, 2026-09-20) ----------------
    // Three ids became one skill whose Support level chooses the scaffold. The option is
    // honoured for real: js/modules/skill-aliases.js routes the ticked level to the branch in
    // gen-operations.js that draws it, and deals several ticked levels round-robin so a page
    // fades. Level 3 (worked and traced) is NOT offered — none of these skills has a worked
    // form yet, and a level that changes nothing is worse than no level at all.
    //
    // KNOWN P-1 BREACH IN THE THREE NUMBER-FAMILY SKILLS, open against gen-operations.js.
    // Measured on the real generator (240 items, Max Number 100, 2026-09-20): the legacy
    // easy / medium / hard branches change the NUMBER SIZE as well as the scaffold —
    //   number_families_add     L2 operands 1-10   L1 1-20   L0 1-50
    //   number_families_mult    L2 factors  2-5    L1 2-10   L0 2-12  (products to 132)
    //   number_families_mixed   L2 bases    2-5    L1 2-8    L0 2-10
    // PEDAGOGY_STANDARD P-1 allows exactly ONE delta per step, `range` OR `scaffold`, and this
    // control moves both at once — so a fading page gets HARDER arithmetic as the support is
    // withdrawn, which is the opposite of a fade. The fix is to split the operand cap out of
    // the level branches in gen-operations.js (a `band` option, as ruling 1 has it: the band
    // bounds the ANSWER) and leave `level` owning the blank count alone. Until that lands the
    // help below states BOTH changes, because a dialog that names only half of what a control
    // does is worse than one that names all of it.
    // mult_chart_easy is clean: the same 12x12 chart at every level, only the blank count moves.
    'addition:number_families_add': [levelSubset([2, 1, 0], 2,
        'Level 2 leaves only each answer blank (numbers to 10), level 1 blanks two numbers in '
        + 'every row (numbers to 20), level 0 blanks the whole family (numbers to 50).')],
    'multiplication:number_families_mult': [levelSubset([2, 1, 0], 2,
        'Level 2 leaves only each answer blank (tables to 5), level 1 blanks two numbers in '
        + 'every row (tables to 10), level 0 blanks the whole family (tables to 12).')],
    'number_ops_mixed:number_families_mixed': [levelSubset([2, 1, 0], 2,
        'Level 2 leaves only each answer blank (numbers to 5), level 1 blanks two numbers in '
        + 'every row (numbers to 8), level 0 blanks the whole family (numbers to 10).')],
    'multiplication:mult_chart_easy': [levelSubset([2, 1, 0], 2,
        'The same 12 x 12 chart every time: level 2 leaves 2 cells to fill, level 1 leaves 6, '
        + 'level 0 leaves 22. Level 2 never blanks the 1 row or the 1 column.')],
};

// Options every skill understands, whether or not it declares anything of its own.
export const UNIVERSAL_OPTIONS = [levelOption()];

// ---------------------------------------------------------------------------
// MEASURED OPTIONS — every skill gets the settings its generator was seen to read
// ---------------------------------------------------------------------------
// Owner, 2026-09-24: "Design so every skill has options and a default." The hand-written registry
// above covers the operations family. Everything else gets what tests/scripts/ws-options-derive.cjs
// MEASURED its generator to honour — the same seeded items generated at each Max Number and each
// decimal setting, a value kept only when the items change — written to skill-options-derived.js
// and registered here by that module (this file stays import-free so node can load it bare).
//
// Both options DEFAULT TO null, which means "use the app's Max Number / Decimals setting". That is
// what the skill does today, under whatever setting the teacher has, so nothing printed or shared
// before this landed changes, and a code without the option decodes to exactly the old page. A
// literal default of 100 could not keep that promise: packOptions() stores only what differs from
// the default, so a teacher who picked "Up to 100" while his Max Number said 1,000 would have had
// his choice silently dropped. Choosing a value overrides the setting FOR THIS SKILL ONLY
// (generate-question.js applySkillSettings), which is what lets one set hold "add within 20"
// beside "multiply to 1,000".
export const rangeOption = (values) => ({
    id: 'range', label: 'Max Number', type: 'enum', default: null,
    values: [{ v: null, l: 'Use the Max Number setting' },
        ...values.map(v => ({ v, l: `Up to ${Number(v).toLocaleString('en-US')}` }))],
    help: 'This skill only: overrides the Max Number setting for this skill wherever the set goes. '
        + 'Only the numbers that really change this skill\'s problems are listed.',
});

const DECIMAL_LABELS = { 0: 'Whole numbers', 1: 'Tenths (1 place)', 2: 'Hundredths (2 places)', 3: 'Thousandths (3 places)' };
export const decimalsOption = (values) => ({
    id: 'decimals', label: 'Decimal places', type: 'enum', default: null,
    values: [{ v: null, l: 'Use the Decimals setting' },
        ...values.map(v => ({ v, l: DECIMAL_LABELS[v] || `${v} places` }))],
    help: 'This skill only: overrides the Decimals setting for this skill wherever the set goes.',
});

// { 'cat:skill': { range: [..], decimals: [..], level: [..], mode } } — see skill-options-derived.js
let DERIVED = {};
/** Called once by skill-options-derived.js. Kept as a hook so this file imports nothing. */
export function registerDerivedOptions(table) { DERIVED = table || {}; }
export function derivedEntry(categoryId, skillId) { return DERIVED[`${categoryId}:${skillId}`] || null; }

// A fact drill names its page by the fact set the teacher ticks ("Multiply by 7 and 8"), and a
// band option bounds its answers. A Max Number override on top would contradict both: measured on
// mult_facts, Max Number 1,000 deals 882 × 2 on a page called Multiplication Facts. So a skill
// that owns a `constant` or a `band` is never offered the measured Max Number (backlog: the
// generators should stop reading state.range for fact drills at all).
const OWNS_ITS_NUMBERS = new Set(['constant', 'band']);

function _measuredOptions(categoryId, skillId, own) {
    const d = DERIVED[`${categoryId}:${skillId}`];
    if (!d) return [];
    const ids = new Set(own.map(o => o.id));
    const out = [];
    if (Array.isArray(d.range) && d.range.length > 1 && !ids.has('range') && !own.some(o => OWNS_ITS_NUMBERS.has(o.id))) {
        out.push(rangeOption(d.range));
    }
    if (Array.isArray(d.decimals) && d.decimals.length > 1 && !ids.has('decimals')) out.push(decimalsOption(d.decimals));
    return out;
}

/** The option definitions for a skill: its own, then the measured ones, then the universal ones. */
export function optionsFor(categoryId, skillId) {
    const own = SKILL_OPTIONS[`${categoryId}:${skillId}`] || SKILL_OPTIONS[skillId] || [];
    const all = [...own, ..._measuredOptions(categoryId, skillId, own)];
    const ids = new Set(all.map(o => o.id));
    return [...all, ...UNIVERSAL_OPTIONS.filter(o => !ids.has(o.id))];
}

/**
 * The options a teacher is SHOWN for a skill: optionsFor() minus anything the generator does not
 * honour. The universal Support level stays in the model for every skill (a ladder step or a
 * saved page may carry it), but its control appears only where the skill declares it itself or
 * the measurement saw it change the problems. A control that changes nothing is a lie on the
 * teacher's screen.
 */
export function offeredOptionsFor(categoryId, skillId) {
    const own = SKILL_OPTIONS[`${categoryId}:${skillId}`] || SKILL_OPTIONS[skillId] || [];
    const ownIds = new Set(own.map(o => o.id));
    const d = DERIVED[`${categoryId}:${skillId}`];
    const out = [];
    for (const o of optionsFor(categoryId, skillId)) {
        if (ownIds.has(o.id) || o.id !== 'level') { out.push(o); continue; }
        // The universal level: only the levels measured to draw something different.
        if (d && Array.isArray(d.level) && d.level.length > 1) out.push(levelSubset(d.level, 1));
    }
    return out;
}

/** The defaults for a skill: what it generates when the teacher chooses nothing. */
export function defaultOptions(categoryId, skillId) {
    const out = {};
    for (const o of optionsFor(categoryId, skillId)) out[o.id] = o.default;
    return out;
}

/**
 * Drop unknown keys and coerce the rest to legal values, so a stale share code or a hand-edited
 * saved worksheet can never make a skill generate something impossible.
 */
export function normalizeOptions(categoryId, skillId, opts) {
    const defs = optionsFor(categoryId, skillId);
    const out = defaultOptions(categoryId, skillId);
    if (!opts || typeof opts !== 'object') return out;
    for (const def of defs) {
        if (!(def.id in opts)) continue;
        const v = opts[def.id];
        if (def.type === 'bool') { out[def.id] = !!v; continue; }
        if (def.type === 'int') {
            const n = Number(v);
            if (Number.isFinite(n)) out[def.id] = Math.min(def.max ?? n, Math.max(def.min ?? n, Math.round(n)));
            continue;
        }
        if (def.type === 'enum') {
            if (def.values.some(x => x.v === v || String(x.v) === String(v))) {
                const hit = def.values.find(x => x.v === v || String(x.v) === String(v));
                out[def.id] = hit.v;
            }
            continue;
        }
        if (def.type === 'set') {
            // All, none, or any selection in between (owner, 2026-09-19). None ticked is legal
            // and means "no restriction" — the skill generates across its whole natural range —
            // so a cleared control still produces a usable page rather than an empty one.
            const legal = new Set(def.values.map(x => x.v));
            // A bare value is accepted as a one-item tick. `notation` and `level` shipped as
            // single-choice enums before they became check boxes, so a share code, a saved print
            // section or a stored quiz written then still holds a scalar. Without this it would
            // fail Array.isArray, fall back to the default, and silently discard the teacher's
            // choice — the page would print in a notation nobody picked.
            const list = Array.isArray(v) ? v : (v === undefined || v === null ? null : [v]);
            if (list) out[def.id] = list.filter(x => legal.has(x));
        }
    }
    return out;
}

/** Only the values that differ from the defaults — what a share code needs to carry. */
export function packOptions(categoryId, skillId, opts) {
    const dflt = defaultOptions(categoryId, skillId);
    const out = {};
    for (const [k, v] of Object.entries(normalizeOptions(categoryId, skillId, opts))) {
        if (JSON.stringify(v) !== JSON.stringify(dflt[k])) out[k] = v;
    }
    return out;
}

// ---------------------------------------------------------------------------
// ONE DEFAULT PER OPTION, AND A LADDER STEP CARRIES VALUES  (owner ruling R2, 2026-09-20)
// ---------------------------------------------------------------------------
// PEDAGOGY_STANDARD.md P-31 now asks for two different starting values for the SAME option:
//
//   Fact constant, + and −  |  the ladder step's constant, named in the title ("Add 6");
//                           |  on a stand-alone print from the dialog, Mixed (every set ticked)
//
// Both have to be true at once, so the obvious reading is "the default depends on how the skill
// was reached". Three ways to express that were on the table. Only one of them survives contact
// with the rest of this file, and the reason matters, because whatever is chosen here is
// inherited by every family that migrates after this one.
//
// (a) A SECOND DEFAULT FIELD — `default` plus `stepDefault`, and the caller picks. Rejected.
//     `default` is not decoration here: packOptions() is defined as "only the values that differ
//     from the default", and that delta is what a share code, a saved print section and a stored
//     quiz all carry. Two defaults means two deltas. The same eight bytes of a share code would
//     then decode to "Add 6" when a ladder opened it and to Mixed when the dialog opened it —
//     the teacher's own link would print a different sheet depending on the door he came in by.
//     normalizeOptions() has the same problem in reverse. A delta encoding needs exactly one
//     canonical base, so `default` must stay single-valued.
//
// (b) A DIALOG-LEVEL OVERRIDE — the print dialog forces Mixed when the skill arrives unset.
//     Rejected: it puts a value on the PAGE that the skill never chose, which is the one thing
//     the option model forbids ("options live on the skill, not the page"), and it makes the
//     printed sheet and the saved section disagree about what was printed.
//
// (c) THE LADDER PASSES EXPLICIT VALUES, so the default never applies to it. Chosen.
//     It needs no new field and no new rule, because it is what the model already says a ladder
//     step IS: "a ladder step is a skill plus a set of option values, not a new skill id" (top of
//     this file). AF-11 is not a skill whose constant defaults to 6; it is `add_facts` carrying
//     `constant: [6]`. There is nothing left to default, and the one canonical default is free to
//     be the stand-alone one — Mixed — which is what the dialog needs and what gen-operations.js
//     already produces from an untouched skill.
//
// The precedent was already set and already shipped: `practiceLevel` reads "the step's level; 1
// on a stand-alone print" (design/research/operations-facts-v2.md §2.5), and levelOption()'s
// `default` is [1] — the stand-alone value — with the step expected to name its own. The fact
// constant now follows the same shape, so the two rows of P-31 are one mechanism rather than two.
//
// THE RULE THIS LEAVES BEHIND, for the family that migrates next:
//   an option's `default` is ALWAYS the stand-alone value — what the teacher gets from the print
//   dialog having chosen nothing. A page role, a ladder step or a lesson supplies anything else
//   as an explicit value through stepOptions(), and never by asking for a different default.

/**
 * The option values a LADDER STEP carries. `values` is what the step teaches — `{ constant: [6] }`
 * for AF-11 — laid over the skill's stand-alone defaults and normalised, so a step can never
 * inherit a default it did not mean to (the point of ruling R2: the dialog defaults to Mixed, a
 * step never does).
 *
 * Returns the full option object, ready to hand to generateQuestionFor({ opts }). Pass it through
 * packOptions() before saving or sharing it, exactly as a dialog-chosen set is.
 */
export function stepOptions(categoryId, skillId, values) {
    return normalizeOptions(categoryId, skillId, { ...defaultOptions(categoryId, skillId), ...(values || {}) });
}

// Consecutive numbers read as a run: [0,1,2,3,4,5,9] is "0–5 and 9", not seven numerals in a row.
// A run of two stays spelled out, because "6–7" is longer to read than "6 and 7".
function _numberRuns(list) {
    const s = [...new Set(list.map(Number))].filter(Number.isFinite).sort((a, b) => a - b);
    const parts = [];
    for (let i = 0; i < s.length;) {
        let j = i;
        while (j + 1 < s.length && s[j + 1] === s[j] + 1) j++;
        if (j - i >= 2) { parts.push(`${s[i]}–${s[j]}`); i = j + 1; }
        else { parts.push(String(s[i])); i++; }
    }
    return parts;
}

function _joinAnd(parts) {
    if (parts.length <= 1) return parts[0] || '';
    return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/**
 * What a page drilling this skill's chosen fact sets is CALLED: "Add 6", "Add 6 and 7",
 * "Multiply by 0–5 and 9". Empty string when the page is mixed — every set ticked, or none,
 * which the set semantics above make the same thing — because a mixed page must not claim a set
 * it is not drilling (P-31, owner 2026-09-20).
 *
 * This is the single source of the name, so the sheet header, the per-cell skill label and the
 * answer key cannot drift apart, and a ladder step and a hand-ticked dialog page that carry the
 * same values print the same title.
 */
export function factSetTitle(categoryId, skillId, opts) {
    const def = optionsFor(categoryId, skillId).find(o => o.id === 'constant');
    if (!def) return '';
    const legal = (def.values || []).map(x => x.v);
    const ticked = normalizeOptions(categoryId, skillId, opts).constant;
    const chosen = Array.isArray(ticked) ? ticked.filter(v => legal.includes(v)) : [];
    // None ticked means "no restriction" (the set semantics at the top of this file), so it is
    // the same page as all ticked: mixed, and unnamed.
    if (!chosen.length || chosen.length === legal.length) return '';
    return `${def.titleVerb || def.label} ${_joinAnd(_numberRuns(chosen))}`.trim();
}

/** A short human summary for the dialog and the teacher footer, e.g. "Add 6 · to 20 · Level 2". */
export function describeOptions(categoryId, skillId, opts) {
    const defs = optionsFor(categoryId, skillId);
    const packed = packOptions(categoryId, skillId, opts);
    const parts = [];
    for (const def of defs) {
        if (!(def.id in packed)) continue;
        const v = packed[def.id];
        if (def.type === 'bool') { parts.push(v ? def.label : `No ${def.label.toLowerCase()}`); continue; }
        if (def.type === 'set') {
            const all = (def.values || []);
            const labels = all.filter(x => v.includes(x.v)).map(x => x.l);
            // Every box ticked reads better as the one phrase the option names it by
            // ("All three ways, mixed") than as the whole list spelled out on a dialog row.
            const text = !labels.length ? 'any'
                : (labels.length === all.length && def.allLabel) ? def.allLabel
                : labels.join(', ');
            parts.push(`${def.label}: ${text}`);
            continue;
        }
        const hit = (def.values || []).find(x => x.v === v);
        parts.push(hit ? `${def.label}: ${hit.l}` : `${def.label}: ${v}`);
    }
    return parts.join(' · ');
}
