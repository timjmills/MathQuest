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
export const constantOption = (max, label) => ({
    id: 'constant', label, type: 'set', default: Array.from({ length: max + 1 }, (_, n) => n),
    values: Array.from({ length: max + 1 }, (_, n) => ({ v: n, l: String(n) })),
    allLabel: 'Mixed (all of them)',
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
    'multiplication:mult_facts': [constantOption(12, 'Times'), ..._mul()],
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

/** The option definitions for a skill, its own first, then the universal ones. */
export function optionsFor(categoryId, skillId) {
    const own = SKILL_OPTIONS[`${categoryId}:${skillId}`] || SKILL_OPTIONS[skillId] || [];
    const ids = new Set(own.map(o => o.id));
    return [...own, ...UNIVERSAL_OPTIONS.filter(o => !ids.has(o.id))];
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
