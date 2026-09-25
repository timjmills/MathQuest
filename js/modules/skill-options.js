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

// ===========================================================================
// P9 · PLACE VALUE + ROUNDING  (design/research/place-value-rounding.md §2.5)
// ===========================================================================
// One contiguous block, merged into SKILL_OPTIONS below, so a parallel wave adding options for
// another family never edits the same lines. Every option here is READ by js/modules/gen-pv.js
// (the P9 generator) or by the estimation branch of gen-algebraic.js; an option a generator
// ignores is not declared (SCC-P11).
//
// THE BAND (owner ruling of 2026-09-25, superseding §2.1's "Max Number caps the band"). The
// skill's own `band` SETS the working range: "Numbers to 1,000" on "Round to the nearest 100" deals
// three-digit numbers whatever the app's Max Number says. Max Number caps the band only when the
// teacher has explicitly LOWERED it below the band — Max Number at its app default (100) counts as
// "not chosen", so a stand-alone skill never refuses at defaults. pvCap() below is the single
// source of that rule. The default band of a skill whose place needs more than 100 is its natural
// band (nearest_100 -> to 1,000). A refusal remains only for a genuinely impossible explicit
// choice: Max Number lowered below the place's floor (a nearest-100 item needs three digits).
//
// GROUPS. Every control carries `group` — 'difficulty' (Harder / easier), 'support' (Support) or
// 'layout' (Layout) — which the panel (skill-options-ui.js) uses to set the controls out under
// those three headings, and a one-line `help` in plain teacher English.

/** Max Number's app default. At this value the Max Number setting counts as "not chosen". */
export const APP_DEFAULT_RANGE = 100;

/**
 * The biggest number a P9 skill deals: its band, lowered only by a Max Number the teacher has
 * explicitly set below it (any value other than the app default).
 *
 * `strict` is for a skill dealt as a MEMBER of a mixed review (mixed_placevalue, ...): the review
 * has no band of its own, so its Max Number — default or not — is the only size control, and it
 * caps every member it draws.
 */
export function pvCap(band, range, strict = false) {
    const b = Number(band);
    const r = Number(range);
    if (!Number.isFinite(r) || r <= 0 || r >= b) return b;
    if (r === APP_DEFAULT_RANGE && !strict) return b;
    return r;
}

const _PV_BAND_HELP = 'The biggest number on the page. Max Number only lowers it if you set Max Number below this.';
const _pvBand = (values, dflt, help) => ({
    ...bandOption(values, dflt),
    group: 'difficulty',
    help: help || _PV_BAND_HELP,
});
const _pvMidpoint = (withOnly = true) => ({
    id: 'midpoint', label: 'Exactly halfway (like 350)', type: 'enum', default: 'seeded', group: 'difficulty',
    values: [
        { v: 'never', l: 'Never' },
        { v: 'seeded', l: 'At least one on every page' },
        ...(withOnly ? [{ v: 'only', l: 'Only halfway numbers (halfway rounds up)' }] : []),
    ],
    help: 'Halfway numbers round up. "Only" gives a page of nothing else, to teach that rule on its own.',
});
const _pvZeroPlace = (withAlways = true) => ({
    id: 'zeroPlace', label: 'A zero place (305, 340)', type: 'enum', default: 'none', group: 'difficulty',
    values: [
        { v: 'none', l: 'Never' },
        { v: 'some', l: 'Some numbers' },
        ...(withAlways ? [{ v: 'always', l: 'Every number' }] : []),
    ],
    help: 'A zero holds a place. It is harder: the pupil has to write or read the 0 part.',
});
const _pvPlaceSet = (upTo) => ({
    id: 'places', label: 'Which place is asked', type: 'set', group: 'difficulty',
    default: [1, 10, 100, 1000, 10000, 100000].filter(p => p <= upTo),
    values: [
        { v: 1, l: 'Ones' }, { v: 10, l: 'Tens' }, { v: 100, l: 'Hundreds' }, { v: 1000, l: 'Thousands' },
        { v: 10000, l: 'Ten thousands' }, { v: 100000, l: 'Hundred thousands' },
    ].filter(x => x.v <= upTo),
    allLabel: 'Every place the number has',
    help: 'Tick the places to ask about. A place bigger than "Numbers to" makes those numbers just long enough to have it.',
});
// Place-value support on the numeral (owner, 2026-09-25): the place letters over the digits are
// the default; a ruled place-value chart with the place NAMES is more support, a bare numeral is
// the fade (pv-support-cell.js draws the other two rungs, on screen and in print).
const _pvDigitSupport = () => ({
    id: 'support', label: 'Place-value support', type: 'enum', default: 'labels', group: 'support',
    values: [
        { v: 'chart', l: 'Place-value chart (place names over the digits)' },
        { v: 'labels', l: 'Place letters over the digits (H T O)' },
        { v: 'none', l: 'None: the number on its own' },
    ],
    help: 'Most support first: the chart names every place, the letters remind, "None" is the fade.',
});
const _PV_PLACE_BANDS = [99, 999, 9999, 99999, 999999];
const _pvRoundBands = (place) => [100, 1000, 10000, 100000, 1000000, 10000000].filter(b => b >= place * 10);
const _pvNearest = (place) => {
    const bands = _pvRoundBands(place);
    return [
        // A band with one value is a control with no choice: nearest_million only rounds numbers
        // to 10,000,000, so it has no band control (the generator uses its natural band).
        ...(bands.length > 1 ? [_pvBand(bands, place * 10)] : []),
        _pvMidpoint(true),
        {
            id: 'support', label: 'Support', type: 'enum', default: 'cut', group: 'support',
            values: [
                { v: 'line', l: 'Number line (ends labelled)' },
                { v: 'cut', l: 'Cut line (place letters over the digits)' },
                { v: 'none', l: 'None' },
            ],
            help: 'One support per page. The number line shows which end is nearer; "None" is the fade.',
        },
        {
            id: 'response', label: 'How the pupil answers', type: 'enum', default: 'write', group: 'layout',
            values: [
                { v: 'write', l: 'Write the rounded number' },
                { v: 'circle-all', l: 'Circle every number that rounds to N' },
            ],
            help: '"Circle every number" is its own step: eight numbers, with near misses either side of halfway.',
        },
    ];
};
const _pvSort = (place) => {
    const bands = place ? _pvRoundBands(place) : [];
    return [
        ...(bands.length > 1 ? [_pvBand(bands, place * 10)] : []),
        {
            id: 'tiles', label: 'Numbers to sort', type: 'enum', default: 6, group: 'layout',
            values: [{ v: 6, l: '6' }, { v: 8, l: '8' }],
            help: 'How many numbers go into the two bins.',
        },
        _pvMidpoint(false),
        {
            id: 'support', label: 'Support', type: 'enum', default: 'none', group: 'support',
            values: [
                { v: 'line', l: 'Number line from one bin to the other' },
                { v: 'none', l: 'None' },
            ],
            help: 'The number line runs between the two bins, so the pupil can see which end each number is nearer.',
        },
    ];
};
const _pvTask = () => ({
    id: 'task', label: 'Task', type: 'enum', default: 'compute', group: 'layout',
    values: [
        { v: 'compute', l: 'Round, then work it out' },
        { v: 'closest', l: 'Choose the closest estimate' },
        { v: 'reasonable', l: 'Is the answer reasonable?' },
    ],
    help: 'One task per page, so the instruction says one thing.',
});
// "Round to" on the estimation skills (owner, 2026-09-25). The place SETS the number size (a
// nearest-100 estimate has three-digit numbers), the same way a rounding skill's band does.
const _pvEstPlace = () => ({
    id: 'place', label: 'Round to the nearest', type: 'enum', default: 10, group: 'difficulty',
    values: [{ v: 10, l: '10 (two-digit numbers)' }, { v: 100, l: '100 (three-digit numbers)' }, { v: 1000, l: '1,000 (four-digit numbers)' }],
    help: 'The place each number is rounded to. It also sets how big the numbers are.',
});
const _pvQuotientPlace = () => ({
    id: 'place', label: 'Size of the estimate', type: 'enum', default: 1, group: 'difficulty',
    values: [{ v: 1, l: 'Ones (43 ÷ 6 is about 7)' }, { v: 10, l: 'Tens (430 ÷ 6 is about 70)' },
        { v: 100, l: 'Hundreds (4,300 ÷ 6 is about 700)' }, { v: 1000, l: 'Thousands (43,000 ÷ 6 is about 7,000)' }],
    help: 'The dividend is rounded to a number the divisor goes into; this sets how big the answer is.',
});
const _pvStep = (values, dflt) => ({
    id: 'step', label: 'How much more or less', type: 'enum', default: dflt, group: 'difficulty',
    values: values.map(v => ({ v, l: String(v) })),
    help: 'The jump the pupil adds or takes away.',
});
const _pvDir = () => ({
    id: 'dir', label: 'More or less', type: 'enum', default: 'more', group: 'difficulty',
    values: [{ v: 'more', l: 'More' }, { v: 'less', l: 'Less' }, { v: 'both', l: 'Both, alternating' }],
    help: '"Less" is harder than "More"; "Both" mixes them so the pupil must read the word.',
});
const _pvMoreLessSupport = (withChart) => ({
    id: 'support', label: 'Support', type: 'enum', default: 'none', group: 'support',
    values: [
        ...(withChart ? [{ v: 'chart', l: 'Hundreds chart (the rows around the number)' }] : []),
        { v: 'line', l: 'Number line (jumps of the step)' },
        { v: 'none', l: 'None' },
    ],
    help: withChart ? 'A picture to count on or back with: most support first, "None" is the fade.'
        : 'A number line to jump along: "None" is the fade.',
});
const P9_PV_OPTIONS = {
    'placevalue:identify': [_pvBand(_PV_PLACE_BANDS, 999), _pvPlaceSet(100000), _pvDigitSupport()],
    'placevalue:value': [_pvBand(_PV_PLACE_BANDS, 999), _pvDigitSupport()],
    'placevalue:expand': [_pvBand(_PV_PLACE_BANDS, 999), _pvZeroPlace(true)],
    'placevalue:combine': [_pvBand(_PV_PLACE_BANDS, 999), _pvZeroPlace(true), {
        id: 'order', label: 'Order of the parts', type: 'enum', default: 'largest', group: 'difficulty',
        values: [{ v: 'largest', l: 'Largest first' }, { v: 'scrambled', l: 'Scrambled (5 + 300 + 20)' }],
        help: 'Scrambled parts are harder: the pupil has to put each part in its place.',
    }],
    'placevalue:compare': [_pvBand([99, 999, 9999, 99999, 999999], 999)],
    'placevalue:order_least_to_greatest': [_pvBand([99, 999, 9999, 99999, 999999], 999)],
    'placevalue:order_greatest_to_least': [_pvBand([99, 999, 9999, 99999, 999999], 999)],
    'placevalue:place_value_disks': [_pvBand([99, 999, 9999], 999), {
        id: 'task', label: 'Task', type: 'enum', default: 'read', group: 'layout',
        values: [{ v: 'read', l: 'Read the number from the disks' }, { v: 'count', l: "Count one place's disks" }],
        help: 'Counting one place is the easier first step; reading the whole number comes next.',
    }, _pvZeroPlace(false)],
    // Draw to 999 only (owner ruling 3): nine 1,000 disks and 27 others is a poster, not a cell.
    'placevalue:pv_disks_build': [_pvBand([99, 999], 999), _pvZeroPlace(false)],
    'placevalue:pv_digit_drag': [_pvBand([999, 9999, 99999, 999999], 99999)],
    'placevalue:number_word_names': [_pvBand([999, 9999, 99999, 999999], 999999)],
    'placevalue:more_less_10': [_pvStep([1, 10], 1), _pvDir(), _pvBand([20, 50, 100, 120], 100), _pvMoreLessSupport(true)],
    // Numbers 100-900 (2.NBT.B.8): the band is fixed at 1,000, so there is no band control.
    'placevalue:more_less_100': [_pvStep([10, 100], 100), _pvDir(), _pvMoreLessSupport(false)],
    'placevalue:place_value_10x': [
        { id: 'op', label: 'Multiply or divide', type: 'enum', default: 'x', group: 'difficulty',
            values: [{ v: 'x', l: '× (digits move left)' }, { v: '/', l: '÷ (digits move right)' }],
            help: 'Dividing is the harder direction: the digits move right.' },
        { id: 'power', label: 'By', type: 'set', default: [10], group: 'difficulty',
            values: [{ v: 10, l: '10' }, { v: 100, l: '100' }, { v: 1000, l: '1,000' }], allLabel: '10, 100 and 1,000',
            help: 'Tick one power for a page that stays with it, or several to mix them.' },
        _pvBand([1000, 10000, 100000, 1000000], 10000, 'The biggest number on the page (the larger of the number and its answer).'),
        { id: 'decimals', label: 'Decimals (grade 5)', type: 'bool', default: false, group: 'difficulty',
            help: 'On gives numbers with a decimal point, such as 3.4 × 100.' },
    ],
    'number_sense:rounding_visual': [
        { id: 'place', label: 'Round to the nearest', type: 'enum', default: 10, group: 'difficulty',
            values: [{ v: 10, l: '10' }, { v: 100, l: '100' }, { v: 1000, l: '1,000' }],
            help: 'The place the number is rounded to. The numbers grow to fit the place.' },
        _pvBand([100, 1000, 10000], 100, 'The biggest number on the page. It grows to fit the place when the place needs more.'),
        _pvMidpoint(true),
    ],
    'number_sense:nearest_10': _pvNearest(10),
    'number_sense:nearest_100': _pvNearest(100),
    'number_sense:nearest_1000': _pvNearest(1000),
    'number_sense:nearest_10000': _pvNearest(10000),
    'number_sense:nearest_100000': _pvNearest(100000),
    'number_sense:nearest_million': _pvNearest(1000000),
    'number_sense:round_sort_10': _pvSort(10),
    'number_sense:round_sort_100': _pvSort(100),
    'number_sense:round_sort_1000': _pvSort(1000),
    'number_sense:round_sort_10000': _pvSort(10000),
    'number_sense:round_sort_100000': _pvSort(100000),
    'number_sense:round_sort_million': _pvSort(1000000),
    'number_sense:round_sort_tenths': _pvSort(0),
    'number_sense:round_sort_hundredths': _pvSort(0),
    'number_sense:estimate_sums_diffs': [_pvEstPlace(), _pvTask()],
    'number_sense:estimate_products': [_pvEstPlace(), _pvTask()],
    'number_sense:estimate_quotient': [_pvQuotientPlace(), _pvTask()],
};
Object.assign(SKILL_OPTIONS, P9_PV_OPTIONS);

// The place a P9 skill rounds to, read off its id (the id IS its place, owner ruling 5).
const _PV_ID_PLACE = { '10': 10, '100': 100, '1000': 1000, '10000': 10000, '100000': 100000, million: 1000000 };
export function pvRoundPlace(skillId, opts) {
    const m = String(skillId).match(/^(?:nearest|round_sort)_(10|100|1000|10000|100000|million)$/);
    if (m) return _PV_ID_PLACE[m[1]];
    if (skillId === 'rounding_visual') return Number((opts && opts.place) || 10);
    return 0;
}

/**
 * The smallest band a P9 skill can be dealt at with these options. 0 = no floor.
 * The place sets it for rounding (a nearest-100 item is at least 3 digits, so it needs 1,000);
 * a step or a power sets it for more / less and x / ÷ 10.
 */
export function pvBandFloor(categoryId, skillId, opts) {
    const o = normalizeOptions(categoryId, skillId, opts);
    const place = pvRoundPlace(skillId, o);
    if (place) return place * 10;
    if (skillId === 'more_less_100') return 1000;
    if (skillId === 'more_less_10') return Number(o.step) === 10 ? 20 : 10;
    if (skillId === 'pv_digit_drag') return 1000;
    if (skillId === 'place_value_10x') {
        const powers = (Array.isArray(o.power) && o.power.length ? o.power : [10]).map(Number);
        return Math.max(...powers) * 10;
    }
    return 0;
}

/**
 * The band a P9 skill works to with these options: its own band option, raised to the place's
 * floor when the two disagree (rounding_visual "to the nearest 1,000" with "Numbers to 100"), or
 * the floor alone when the skill has no band control (nearest_million, more_less_100).
 */
export function pvBand(categoryId, skillId, opts, fallback = 0) {
    const o = normalizeOptions(categoryId, skillId, opts);
    const own = Number(o.band);
    const band = Number.isFinite(own) && own > 0 ? own : fallback;
    return Math.max(band, pvBandFloor(categoryId, skillId, o));
}

/**
 * The refusal line when an EXPLICITLY lowered Max Number cannot host the skill, or '' when it
 * can. Max Number at its app default never refuses (pvCap).
 */
export function pvRefusal(categoryId, skillId, range, opts, strict = false) {
    const floor = pvBandFloor(categoryId, skillId, opts);
    if (!floor) return '';
    const cap = pvCap(pvBand(categoryId, skillId, opts), range, strict);
    if (!(cap < floor)) return '';
    const place = pvRoundPlace(skillId, normalizeOptions(categoryId, skillId, opts));
    const what = place ? `Round to the nearest ${place.toLocaleString('en-US')}` : 'This skill';
    return `${what} needs Max Number ${floor.toLocaleString('en-US')} or more.`;
}
// ============================ end P9 · place value + rounding ============================

// ===========================================================================
// P11 · OPERATIONS OPTIONS  (+ − × ÷ — design/audit/OPTIONS-AUDIT.md §3, gen-operations.js)
// ===========================================================================
// One contiguous block, merged into SKILL_OPTIONS below and overriding the older entries for the
// same skills in the table above. Every option here is READ by js/modules/gen-operations.js (the
// "OPTION LAYER" section near its dispatcher). Defaults are the stand-alone values (R2): each is
// what the skill dealt before the option existed, so an untouched skill, an old share code and a
// saved set all print exactly what they printed before.
//
// Ids are reused where the meaning fits, because the share codec has one letter per option id and
// only one letter left: `band` (a number bound), `regroup` (never / mixed / always — also the
// remainder control on ÷, where "regrouping" is the remainder), `zeroPlace` (across zeros),
// `support` (the one HINT picture a page carries, which fades to None), `tiles` (how many — addends,
// or digits × digits written 21 for "2-digit × 1-digit"), `unknown`, `pictures`, `level`.
const _OPS_BANDS = { '10': 10, '20': 20, '50': 50, '100': 100, '1k': 1000, '10k': 10000, '100k': 100000, '1m': 1000000 };
const _opsBand = (values, dflt, { label = 'Numbers to', help, labels = {} } = {}) => ({
    id: 'band', label, type: 'enum', default: dflt,
    values: values.map(v => ({ v, l: labels[v] || (v === null ? 'As the support level sets it' : v.toLocaleString('en-US')) })),
    help: help || 'The largest answer on the page: the sum for +, the number you take from for −, the product '
        + 'for ×, the number shared for ÷.',
});
const _opsRegroup = (dflt, sub = false) => ({
    id: 'regroup', label: sub ? 'Regrouping (borrowing)' : 'Regrouping (carrying)', type: 'enum', default: dflt,
    values: [{ v: 'none', l: 'Never' }, { v: 'mixed', l: 'Some items' }, { v: 'always', l: 'Every item' }],
    help: sub ? 'Whether the ones column has to borrow. The regroup boxes stay on the page either way.'
        : 'Whether a column carries. The regroup boxes stay on the page either way.',
});
const _opsAcrossZeros = (withNone = true) => ({
    id: 'zeroPlace', label: 'Across zeros (5,003 − 2,847)', type: 'enum', default: 'some',
    values: [...(withNone ? [{ v: 'none', l: 'Never' }] : []), { v: 'some', l: 'Now and then' }, { v: 'always', l: 'Every item' }],
    help: 'A zero in the number you start from, with a digit under it, so the borrow crosses the zero.',
});
const _opsUnknown = (dflt = 'answer', { answer = 'The answer (8 + 7 = __)', first = 'The first number (__ + 7 = 15)', second = 'The second number (8 + __ = 15)' } = {}) => ({
    id: 'unknown', label: 'What is missing', type: 'enum', default: dflt,
    values: [{ v: 'answer', l: answer }, { v: 'first', l: first }, { v: 'second', l: second },
        { v: 'mixed', l: 'Mixed' }],
    help: 'One position per page, or Mixed. The missing number is a box in the number sentence.',
});
// The + / − fact cue: one HINT picture under the fact, faded to None. Structure (the fact's own
// rule and answer zone) never changes.
const _opsAddCue = (withTile = true) => ({
    id: 'support', label: 'Picture support', type: 'enum', default: 'none',
    values: [
        { v: 'none', l: 'None' },
        ...(withTile ? [{ v: 'tile', l: 'Dot tiles (one dot for each)' }] : []),
        { v: 'frame', l: 'Ten frames' },
        { v: 'line', l: 'Number line 0 to 20' },
    ],
    help: 'A hint drawn under every fact on the page, in print and on screen. None is the fade.',
});
const _opsMulCue = (div = false) => ({
    id: 'support', label: 'Picture support', type: 'enum', default: 'none',
    values: [
        { v: 'none', l: 'None' },
        { v: 'skip', l: div ? 'Skip-count strip of the number you divide by' : 'Skip-count strip (3, 6, 9 …)' },
        { v: 'array', l: 'Dot array' },
        ...(div ? [{ v: 'think', l: 'Think box (4 × __ = 28)' }] : []),
    ],
    help: 'A hint drawn under every fact on the page, in print and on screen. None is the fade.',
});
const _opsFactBand = () => ({ ..._opsBand([5, 10, 12, 15, 20], 20, {
    label: 'Facts to',
    help: 'The largest sum (or the largest number you start from, for −). Independent of the fact '
        + 'set: "Add 6, facts to 10". A fact set larger than the band is left out.',
}), helpShort: 'The largest answer (for −, the largest number you start from). Single-digit facts never pass 18.' });
const _opsTableBand = () => _opsBand([100, 144], 144, {
    label: 'Tables to', labels: { 100: '10 × 10', 144: '12 × 12' },
    help: 'Up to the 10s table or the whole 12s table: the largest product (or number shared) is 100 or 144.',
});
const _opsColumnLevel = () => levelSubset([3, 2, 1], 1,
    'Level 3 writes each answer in grey to trace (a worked example), level 2 adds the place-value '
    + 'heads over the columns, level 1 is the bare column. The regroup boxes stay at every level.');
const _opsPictures = () => ({ ...picturesOption(true), help: 'Off gives the same stories as text only, with a work space.' });
const _opsBar = () => ({
    id: 'support', label: 'Bar model', type: 'enum', default: 'none',
    values: [{ v: 'none', l: 'None' }, { v: 'bar', l: 'Bar model under the story (whole and parts)' }],
    help: 'A part-part-whole bar drawn under every story, the unknown part left empty. None is the fade.',
});

const P11_OPS_OPTIONS = {
    // --- fact drills: the band and a fading picture cue sit beside the fact set -----------------
    'addition:add_facts': [constantOption(13, 'Add'), notationOption('+'), _opsFactBand(), _opsAddCue()],
    'subtraction:sub_facts': [constantOption(13, 'Subtract'), notationOption('-'), _opsFactBand(), _opsAddCue()],
    'multiplication:mult_facts': [constantOption(12, 'Times', 'Multiply by'), notationOption('x'), _opsTableBand(), _opsMulCue(false)],
    // Dividing BY 0 is undefined, so the 0 box is the zero facts it really deals: 0 ÷ n.
    'division:div_facts': [(() => {
        const c = constantOption(12, 'Divide by');
        c.values = c.values.map(x => (x.v === 0 ? { v: 0, l: '0 (zero shared: 0 ÷ n)' } : x));
        c.zeroTitle = 'Zero divided by a number';
        return c;
    })(), notationOption('/'), _opsTableBand(), _opsMulCue(true)],

    // --- the four basic skills: regrouping and the unknown position ----------------------------
    // Basic + and − are grade 1 (1.OA.6, within 20): the band is 10 or 20, the sum / the number taken from.
    'addition:add': [notationOption('+'), _opsBand([10, 20], 20), _opsRegroup('mixed'), _opsUnknown()],
    'subtraction:subtract': [notationOption('-'), _opsBand([10, 20], 20), _opsRegroup('mixed', true), _opsUnknown('answer',
        { answer: 'The answer (15 − 7 = __)', first: 'The number you start from (__ − 7 = 8)', second: 'The number taken away (15 − __ = 8)' })],
    'multiplication:multiply': [notationOption('x'), {
        id: 'tiles', label: 'Digits × digits', type: 'enum', default: null, group: 'difficulty',
        values: [{ v: null, l: 'Set by Max Number' }, { v: 11, l: '1-digit × 1-digit (7 × 8)' },
            { v: 21, l: '2-digit × 1-digit (34 × 6)' }, { v: 31, l: '3-digit × 1-digit (215 × 4)' },
            { v: 22, l: '2-digit × 2-digit (34 × 26)' }],
        help: 'This skill only: the size of the two numbers, instead of the Max Number setting.',
    }],
    'division:divide': [notationOption('/'), {
        id: 'tiles', label: 'Digits ÷ digit', type: 'enum', default: null, group: 'difficulty',
        values: [{ v: null, l: 'Set by Max Number' }, { v: 21, l: '2-digit ÷ 1-digit (84 ÷ 4)' },
            { v: 31, l: '3-digit ÷ 1-digit (756 ÷ 7)' }, { v: 41, l: '4-digit ÷ 1-digit (5,016 ÷ 8)' },
            { v: 32, l: '3-digit ÷ 2-digit (736 ÷ 23)' }],
        help: 'This skill only: the size of the number shared and the divisor, instead of Max Number.',
    }, {
        id: 'regroup', label: 'Remainders', type: 'enum', default: 'none',
        values: [{ v: 'none', l: 'None (it shares exactly)' }, { v: 'mixed', l: 'Some items' }, { v: 'always', l: 'Every item' }],
        help: 'A remainder is written R: 29 ÷ 4 = 7 R 1.',
    }],

    // --- the number lines: which number is missing ---------------------------------------------
    'addition:nl_add': [_opsUnknown('mixed', { answer: 'Where it lands (7 + 5 = __)', first: 'The start (__ + 5 = 12)', second: 'The jump (7 + __ = 12)' })],
    'subtraction:nl_sub': [_opsUnknown('mixed', { answer: 'Where it lands (12 − 5 = __)', first: 'The start (__ − 5 = 7)', second: 'The jump back (12 − __ = 7)' })],

    // --- add_three: the sum and the dot groups -------------------------------------------------
    'addition:add_three': [_opsBand([10, 20], 20, { label: 'Sum to', help: 'The largest total of the three numbers.' }),
        { ...picturesOption(true), help: 'Off leaves the number sentence without the three dot groups.' }],

    // --- add_column_multi: how many numbers are added ------------------------------------------
    'addition:add_column_multi': [{
        id: 'tiles', label: 'Numbers to add', type: 'enum', default: null, group: 'difficulty',
        values: [{ v: null, l: 'Dealt across the page (3 and 4)' }, { v: 3, l: '3 numbers' }, { v: 4, l: '4 numbers' }],
        help: 'How many numbers each column sum stacks. The column and its carry boxes stay the same.',
    }],

    // --- the tables: how far the chart and the number lines reach -------------------------------
    'multiplication:mult_chart': [_opsBand([25, 100, 144], 144, {
        label: 'Tables to', labels: { 25: '5 × 5', 100: '10 × 10', 144: '12 × 12' },
        help: 'The part of the chart the window is cut from: the largest factor is 5, 10 or 12.',
    })],
    'multiplication:nl_mult': [_opsBand([20, 50, 100], 100, { help: 'The largest product the hops reach.' })],
    'division:nl_div': [_opsBand([20, 50, 100], 100, { help: 'The largest number shared along the line.' })],

    // --- ÷ notation: every ticked way really prints ---------------------------------------------
    'division:missing_mult_div': [notationOption('/')],
    'multiplication:mult_div_fact_family': [notationOption('/')],

    // --- word problems: pictures on the stories that have them ----------------------------------
    'addition:add_word_problems': [responseOption(), _opsPictures()],
    'subtraction:sub_word_problems': [responseOption(), _opsPictures()],
    'addition:add_5_pictures': [{ ...picturesOption(true), help: 'Off writes the same sums as numbers only.' }],
    'subtraction:sub_5_pictures': [{ ...picturesOption(true), help: 'Off writes the same take-away as numbers only.' }],
    'addition:add_wp_10': [{ ...picturesOption(true), help: 'Off prints the same story with no picture row.' }],
};

// The 48 ranged ids (add_/sub_ × 8 bands × never / always / mixed) are ONE ladder per operation:
// each id is a band and a regrouping choice, so from any of them the teacher can move one step in
// either direction without leaving the skill (the id he picked is the default, R2). Within 10 and
// 20 the item is a one-line fact (notation + a fading picture cue); from 50 up it is column work
// (a support level: traced, heads, bare). Within 10 WITH regrouping is the bridging-ten rung, whose
// own support level (split frame, ten frames) already exists.
for (const op of ['add', 'sub']) {
    const cat = op === 'add' ? 'addition' : 'subtraction';
    for (const [code, max] of Object.entries(_OPS_BANDS)) {
        for (const rg of ['no_regroup', 'regroup', 'mixed']) {
            const id = `${op}_${code}_${rg}`;
            const dfltRg = rg === 'no_regroup' ? 'none' : rg === 'regroup' ? 'always' : 'mixed';
            const bridging = max === 10 && rg === 'regroup';
            // "To 10" with every item regrouping is the bridging rung (answers 11 to 18), so only
            // that rung offers it; elsewhere Every-item regrouping starts at 20.
            const bands = Object.values(_OPS_BANDS).filter(b => b !== 10 || rg !== 'regroup' || bridging);
            const opts = [_opsBand(bands, max, bridging ? {
                labels: { 10: '10 — bridging ten (9 + 5, answers 11 to 18)' },
            } : {}), _opsRegroup(dfltRg, op === 'sub')];
            if (max <= 20) {
                opts.unshift(notationOption(op === 'add' ? '+' : '-'));
                opts.push(bridging ? levelSubset([3, 2, 1], 1,
                    'Level 3 draws the two ten frames beside the split, level 2 the split frame alone '
                    + '(write both parts, then the answer), level 1 the answer only.') : _opsAddCue(false));
            } else {
                opts.push(_opsColumnLevel());
                if (op === 'sub' && max >= 1000 && rg !== 'no_regroup') opts.push(_opsAcrossZeros(rg === 'regroup'));
            }
            P11_OPS_OPTIONS[`${cat}:${id}`] = opts;
        }
    }
    // Word problems by band: one ladder too. The no-picture twins (_plain) keep the band only:
    // generate-question.js strips their visual after generation, so a bar model could not reach
    // them. Pictures exist on the stories to 100; the bar model on every band.
    for (const [code, max] of Object.entries(_OPS_BANDS)) {
        if (op === 'add' && max === 10) continue;      // add_wp_10 is the K picture story (gen-counting.js)
        const bands = Object.values(_OPS_BANDS).filter(b => b >= 20 || (op === 'sub' && b === 10));
        const band = _opsBand(bands, max, { help: 'Bounds the answer of every story (the total, or the number you start from).' });
        P11_OPS_OPTIONS[`${cat}:${op}_wp_${code}`] = [band, ...(max <= 100 ? [_opsPictures()] : []), _opsBar()];
        P11_OPS_OPTIONS[`${cat}:${op}_wp_${code}_plain`] = [band];
    }
}
Object.assign(SKILL_OPTIONS, P11_OPS_OPTIONS);
// ============================ end P11 · operations options ============================

// ===========================================================================
// P11 · K-2 COUNTING / COMPARING / COMPOSING OPTIONS  (gen-counting.js)
// ===========================================================================
// Read by js/modules/gen-counting.js (its `_kOpt()` reads) and drawn by the kit's counters /
// compare templates. Defaults reproduce the stand-alone page (R2).
const _k2CountTo = (values, dflt) => _opsBand(values, dflt, { label: 'Count to', help: 'The largest number on the page.' });
const P11_K2_OPTIONS = {
    'counting:count_objects': [
        _k2CountTo([5, 10, 20], 20),
        {
            id: 'objects', label: 'Objects', type: 'enum', default: 'shapes', group: 'support',
            values: [{ v: 'shapes', l: 'Plain shapes (one kind per item)' }, { v: 'pictures', l: 'Pictures (balls, apples, fish)' },
                { v: 'frame', l: 'Counters in ten frames' }, { v: 'dice', l: 'Dice patterns' }],
            help: 'What the pupil counts. Ten frames and dice let a pupil count on from a group he knows.',
        },
        {
            id: 'orientation', label: 'Arrangement', type: 'enum', default: 'rows', group: 'difficulty',
            values: [{ v: 'rows', l: 'Rows of five' }, { v: 'line', l: 'One line (ten to a row)' }, { v: 'scattered', l: 'Scattered' }],
            help: 'Scattered is the hardest: the pupil has to keep track of what he has counted.',
        },
        levelSubset([3, 2, 1], 1, 'Level 3 writes the answer in grey to trace, level 2 prints a number track '
            + '1 to 20 under the picture to point along, level 1 is the picture alone.'),
    ],
    'counting:count_sequence': [
        _k2CountTo([10, 20, 100], 20),
        {
            id: 'dir', label: 'Which number', type: 'enum', default: 'mixed',
            values: [{ v: 'forward', l: 'The number after' }, { v: 'back', l: 'The number before' }, { v: 'mixed', l: 'After, before and between' }],
            help: 'After is counting on, before is counting back: one per page, or all three.',
        },
        levelSubset([1, 0], 1, 'Level 1 shows the five-box number path with the gap; level 0 is the question alone.'),
    ],
    'counting:number_seq_fill': [
        {
            id: 'step', label: 'Count by', type: 'enum', default: null,
            values: [{ v: null, l: 'Mixed (set by Max Number)' }, { v: 1, l: '1s' }, { v: 2, l: '2s' }, { v: 5, l: '5s' }, { v: 10, l: '10s' }],
            help: 'One step for the whole page, or dealt across it.',
        },
        {
            id: 'dir', label: 'Direction', type: 'enum', default: 'mixed',
            values: [{ v: 'forward', l: 'Counting on' }, { v: 'back', l: 'Counting back' }, { v: 'mixed', l: 'Mostly on, some back' }],
        },
    ],
    'comparing:compare_groups': [
        {
            id: 'dir', label: 'Compare by', type: 'enum', default: 'mixed',
            values: [{ v: 'more', l: 'Which has more?' }, { v: 'fewer', l: 'Which has fewer?' }, { v: 'same', l: 'Same or not the same?' },
                { v: 'mixed', l: 'All three, mixed on the page' }],
            help: 'One question for the whole page, or all three mixed (the pupil reads each question).',
        },
        _k2CountTo([5, 10], 10),
        levelSubset([2, 1], 1, 'Level 2 writes how many under each group (compare the numbers); level 1 leaves the pupil to match one to one.'),
    ],
    'comparing:compare_objects': [
        {
            id: 'dir', label: 'Compare by', type: 'enum', default: 'mixed',
            values: [{ v: 'more', l: 'Longer / taller / thicker' }, { v: 'fewer', l: 'Shorter / thinner' }, { v: 'mixed', l: 'Both' }],
        },
        {
            id: 'task', label: 'What is compared', type: 'enum', default: 'all', group: 'difficulty',
            values: [{ v: 'length', l: 'Length (lines)' }, { v: 'height', l: 'Height (towers)' }, { v: 'thickness', l: 'Thickness (bars)' },
                { v: 'all', l: 'All three' }],
        },
    ],
    'comparing:classify_count': [
        _k2CountTo([3, 6, 10], 6),
        {
            id: 'tiles', label: 'Kinds of shape', type: 'enum', default: null, group: 'difficulty',
            values: [{ v: null, l: '2 or 3, dealt' }, { v: 2, l: '2 kinds' }, { v: 3, l: '3 kinds' }, { v: 4, l: '4 kinds' }],
            help: 'More kinds means more to ignore while counting one of them.',
        },
    ],
    'composing:number_bonds': [
        _opsBand([5, 10, 20], 10, { label: 'Bonds to', help: 'The largest whole.' }),
        {
            id: 'unknown', label: 'What is missing', type: 'enum', default: 'mixed',
            values: [{ v: 'answer', l: 'The whole' }, { v: 'first', l: 'The first part' }, { v: 'second', l: 'The second part' }, { v: 'mixed', l: 'Mixed' }],
        },
    ],
    'composing:make_ten': [levelSubset([1, 0], 1, 'Level 1 shows the ten frame; level 0 is the number sentence alone (6 + __ = 10).')],
    'composing:teen_compose': [levelSubset([1, 0], 1, 'Level 1 shows the full ten frame and the ones; level 0 is the number sentence alone.')],
    'composing:ten_frame_build': [_k2CountTo([5, 10], 10)],
    'composing:base10_build': [_opsBand([20, 50, 99], 99, { label: 'Numbers to', help: 'The largest number to build.' })],
    'composing:base10_regroup': [_opsBand([50, 99], 99, { label: 'Numbers to', help: 'The largest number to build and trade.' })],
    'composing:base10_build_hundreds': [_opsBand([500, 999], 999, { label: 'Numbers to', help: 'The largest number to build.' })],
    'composing:tens_foundation_visual': [_opsBand([50, 90], 90, { label: 'Tens to', labels: { 50: '5 tens (50)', 90: '9 tens (90)' }, help: 'The most rods drawn.' })],
    'composing:hundreds_chart_fill': [
        _opsBand([50, 100], 100, { label: 'Numbers to', help: 'Which part of the hundreds chart the window is cut from.' }),
        {
            id: 'tiles', label: 'Empty boxes', type: 'enum', default: null, group: 'difficulty',
            values: [{ v: null, l: '1 to 3, dealt' }, { v: 1, l: '1 box' }, { v: 2, l: '2 boxes' }, { v: 3, l: '3 boxes' }],
            help: 'How many numbers the pupil writes in each window.',
        },
    ],
};
Object.assign(SKILL_OPTIONS, P11_K2_OPTIONS);
// ============================ end P11 · K-2 options ============================
// number_word_form: which way round (gen-algebraic.js wordFormWay() reads it; the codec has had
// `W` since the option was specified). Words to numeral is the default: it is the lower writing
// load, and a misspelled "fourty" would be a spelling error marked as a maths error.
SKILL_OPTIONS['composing:number_word_form'] = [{
    id: 'wordform', label: 'Which way round', type: 'set', default: ['to_number'], group: 'difficulty',
    values: [{ v: 'to_number', l: 'Words to numeral (write 41)' },
        { v: 'to_words', l: 'Numeral to words (write forty-one)' }],
    allLabel: 'Both ways, alternating',
    help: 'Writing the words is harder (it is spelling too). Tick both and the page alternates.',
}];

// ===========================================================================
// P12 · EVERY OTHER FAMILY  (design/audit/OPTIONS-RUBRIC.md, 2026-09-25)
// ===========================================================================
// One contiguous block, merged into SKILL_OPTIONS below (P12_OPTIONS), for every live skill P9 and
// P11 did not cover: the × / ÷ ladder steps, the number families, the fractions, decimals,
// conversions, geometry, measurement, time, money, data, algebra, number theory and integer
// families, and — through the pool hook below — every mixed review. Every option here is READ by
// its generator (the "P12 OPTIONS" helpers in each gen-*.js file); defaults are the stand-alone
// values (R2), and at its default each option leaves the generator on exactly its old path.
//
// NEW OPTION IDS travel in share codes under the two-character "X" keys (skill-option-codec.js,
// OPTION_KEYS): members XA, forms XB, denoms XC, model XD, labels XE, precision XF, coins XG,
// shapes XH, points XI, scale XJ, digits XK, units XL. Every other control reuses an existing id
// whose meaning fits (`band`, `support`, `pictures`, `unknown`, `task`, `dir`, `tiles`, `step`,
// `place`, `simplestForm`, `level`, `regroup`, `response`).

/** A set option over a skill's item FORMS, dealt round-robin by the generator (one form per item). */
export const formsOption = (values, { label = 'What the items ask', help, dflt } = {}) => ({
    id: 'forms', label, type: 'set', group: 'difficulty',
    default: dflt || values.map(x => x.v),
    values,
    allLabel: 'All of them, mixed',
    help: help || 'Tick one kind for a page of it alone, or several to mix them. All ticked mixes every kind.',
});
/** Picture model on / off — `pictures` with its own honest help. */
const _p12Pictures = (help, dflt = true) => ({ ...picturesOption(dflt), group: 'support', help });

/** "Divide by": a set of divisors, read by gen-operations.js _p12Constant() only when changed. */
const _p12DivBy = (lo, hi, dflt, help) => {
    const all = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    return {
        id: 'constant', label: 'Divide by', type: 'set', group: 'difficulty',
        default: dflt || all, values: all.map(v => ({ v, l: String(v) })),
        allLabel: `Every divisor, ${lo} to ${hi}`, titleVerb: 'Divide by',
        help: help || 'Tick one divisor for a page of it alone, or a few to review them together.',
    };
};
const _p12Enum = (id, label, values, dflt, help, group = 'difficulty') => ({ id, label, type: 'enum', group, default: dflt, values, help });

const P12_OPTIONS = {
    // ======================= × and ÷ ladder steps (gen-operations.js, gen-counting.js) =========
    'multiplication:dot_array_mult': [
        _opsBand([25, 100], 100, { label: 'Rows and columns to', labels: { 25: '5 (5 × 5)', 100: '10 (10 × 10)' },
            help: 'The most rows, and the most dots in a row. The product is at most 25 or 100.' }),
        _p12Enum('support', 'Support', [{ v: 'label', l: 'Rows and columns written under the array' },
            { v: 'none', l: 'None: the pupil counts the rows and the columns' }], 'label',
        'The caption names the two factors; without it the pupil finds them in the picture.', 'support'),
    ],
    'multiplication:mult_properties': [
        formsOption([{ v: 0, l: 'Order (3 × 4 = 4 × 3)' }, { v: 1, l: 'Breaking apart (6 × 7 = 6 × 5 + 6 × 2)' },
            { v: 2, l: 'Times 1' }, { v: 3, l: 'Times 0' }], { label: 'Which property' }),
        _p12Pictures('Off prints the question alone: no arrays and no property name (the name tells the pupil which rule to use).'),
    ],
    'multiplication:area_model_mult': [_p12Enum('tiles', 'Digits × digit', [
        { v: null, l: 'Both sizes, dealt' }, { v: 21, l: '2-digit × 1-digit (4 × 36)' }, { v: 31, l: '3-digit × 1-digit (3 × 135)' }],
    null, 'The size of the number split into parts: two parts (tens, ones) or three (hundreds, tens, ones).')],
    'multiplication:area_model_mult_hard': [_p12Enum('tiles', 'Digits × digits', [
        { v: null, l: 'Both grids, dealt' }, { v: 22, l: '2-digit × 2-digit (a 2 × 2 grid)' }, { v: 23, l: '2-digit × 3-digit (a 2 × 3 grid)' }],
    null, 'The grid the pupil fills: four partial products, or six.')],
    'multiplication:repeated_add_to_mult': [
        _opsBand([25, 36, 100], 36, { label: 'Groups and group size to', labels: { 25: '5', 36: '6', 100: '10' },
            help: 'The most groups and the most in a group: the product is at most 25, 36 or 100.' }),
        _p12Pictures('Off leaves the two sentences to write, without the ringed groups.'),
    ],
    'multiplication:equal_or_unequal_groups': [
        formsOption([{ v: 0, l: 'Equal groups (multiply)' }, { v: 1, l: 'Unequal groups (add)' }], { label: 'Which groups',
            help: 'Both, mixed, is the default: the pupil has to look. One kind alone is a warm-up.' }),
        _p12Enum('step', 'Most in a group', [{ v: 6, l: '6' }, { v: 10, l: '10' }], 6, 'Bigger groups are harder to compare by eye.'),
    ],
    'multiplication:mult_zeros': [formsOption([{ v: 0, l: '× 10 (6 × 10)' }, { v: 1, l: '× 100 (6 × 100)' },
        { v: 2, l: '× a multiple of ten (6 × 40)' }], { label: 'Which kind' })],
    'multiplication:mult_placeholder_zero': [_p12Enum('tiles', 'Top number', [
        { v: 22, l: '2 digits (47 × 36)' }, { v: 32, l: '3 digits (215 × 36)' }], 22,
    'The multiplier always has two digits: the step is where the second row starts.')],
    'multiplication:mult_missing_digit': [_p12Enum('tiles', 'Top number', [
        { v: 21, l: '2 digits (47 × 6)' }, { v: 31, l: '3 digits (215 × 6)' }], 21,
    'A longer number has more places the missing digit can hide in.')],
    'division:div_remainders': [_p12DivBy(2, 9, [2, 3, 4, 5, 6],
        'The group size to ring. Above 6 the pictures get fewer groups, so every picture stays countable.')],
    'division:box_division_easy': [
        _p12DivBy(2, 9),
        { ..._opsRegroup('none'), label: 'Remainders', values: [{ v: 'none', l: 'None (it shares exactly)' }, { v: 'mixed', l: 'Some items' }, { v: 'always', l: 'Every item' }],
            help: 'A remainder is written R in the last box: 29 ÷ 4 = 7 R 1.' },
    ],
    'division:box_division_hard': [
        _p12DivBy(2, 9),
        { ..._opsRegroup('mixed'), label: 'Remainders', values: [{ v: 'none', l: 'None (it shares exactly)' }, { v: 'mixed', l: 'Some items' }, { v: 'always', l: 'Every item' }],
            help: 'A remainder is written R in the last box: 437 ÷ 4 = 109 R 1.' },
    ],
    'division:area_model_div_2by1': [_p12DivBy(2, 9)],
    'division:area_model_div_3by1': [_p12DivBy(2, 9)],
    'division:share_into_groups': [_opsBand([12, 24], 24, { label: 'Counters to', help: 'The most counters in the picture. 12 keeps it to 2 to 4 groups.' })],
    'division:div_equation_parts': [
        formsOption([{ v: 0, l: 'How many in all' }, { v: 1, l: 'How many in each group' }, { v: 2, l: 'How many groups' }],
            { label: 'Which number is asked' }),
        _opsBand([25, 81], 81, { label: 'Numbers to', labels: { 25: '25 (groups and sizes to 5)', 81: '81 (to 9)' },
            help: 'The largest total. Smaller totals draw fewer, smaller groups.' }),
    ],
    'division:remainder_too_big': [
        formsOption([{ v: 0, l: 'Already finished (check it)' }, { v: 1, l: 'Not finished (fix it)' }], { label: 'Which work',
            help: 'Both, mixed, is the default: the pupil has to check. "Not finished" alone practises the fix.' }),
        _p12DivBy(3, 9),
        _opsBand([null, 50, 100], null, { label: 'Numbers to', labels: { null: 'Any (to 119)' },
            help: 'The largest number shared.' }),
    ],
    'division:div_fix_estimate': [
        formsOption([{ v: 0, l: 'First try too big' }, { v: 1, l: 'First try too small' }], { label: 'Which mistake' }),
        _p12Enum('tiles', 'Divisor', [{ v: 19, l: '11 to 19' }, { v: 29, l: '11 to 29' }, { v: 49, l: '11 to 49' }], 49,
            'Smaller two-digit divisors are easier to multiply in the head.'),
    ],
    // The number families (the P-1 split): the band owns the number size, the level the blanks.
    'addition:number_families_add': [
        _opsBand([10, 20, 40, 100], 20, { help: 'The largest sum in the family, at every support level.' }),
        levelSubset([2, 1, 0], 2, 'Level 2 leaves only each answer blank, level 1 blanks two numbers in every row, level 0 blanks the whole family. The numbers stay the same size at every level.'),
    ],
    'multiplication:number_families_mult': [
        _opsBand([25, 100, 144], 25, { label: 'Tables to', labels: { 25: '5 × 5', 100: '10 × 10', 144: '12 × 12' },
            help: 'The largest table in the family, at every support level.' }),
        levelSubset([2, 1, 0], 2, 'Level 2 leaves only each answer blank, level 1 blanks two numbers in every row, level 0 blanks the whole family. The tables stay the same at every level.'),
    ],
    'number_ops_mixed:number_families_mixed': [
        _opsBand([5, 8, 10], 5, { label: 'Numbers to', help: 'The two starting numbers of every family, at every support level.' }),
        levelSubset([2, 1, 0], 2, 'Level 2 leaves only each answer blank, level 1 blanks two numbers in every row, level 0 blanks the whole family. The numbers stay the same size at every level.'),
    ],
};

// The pool hook: skill-options-pools.js builds the "Which skills" control for every mixed review
// from the dealer's own pool and registers it here, so this file stays import-free.
let _poolOptions = null;
/** Called once by skill-options-pools.js. */
export function registerPoolOptions(fn) { _poolOptions = typeof fn === 'function' ? fn : null; }

/** A skill's own declared options: its registry entry, else its mixed-pool control, else none. */
export function ownOptionsFor(categoryId, skillId) {
    const own = SKILL_OPTIONS[`${categoryId}:${skillId}`] || SKILL_OPTIONS[skillId];
    if (own) return own;
    if (_poolOptions) {
        try { const p = _poolOptions(categoryId, skillId); if (p) return p; } catch (e) { /* no pool */ }
    }
    return [];
}
// ======================= FRACTIONS (gen-fractions.js, through generate-question.js) =========
// Three mechanisms, none of which changes the untouched skill:
//   `denoms`   ACCEPT: an item is kept only when every fraction on it has a ticked denominator
//              family (generate-question.js denomAllowed); families, not single denominators,
//              because equivalence and unlike-denominator work move inside a family (1/2 = 4/8).
//              Each skill offers only the families its generator was measured to draw
//              (tests/scripts/ws-measure-denoms.cjs).
//   `forms`    VARIANT: the item forms the generator already rotates through (pickVariant), so
//              "only find-the-missing-number" is one tick.
//   `pictures` POST (`strip: true`): the fraction pictures come off and the same problem prints
//              as numbers, on the skills whose words already carry the whole problem.
const _FRAC_FAM = { 2: 'Halves, quarters, eighths', 3: 'Thirds, sixths, ninths, twelfths', 5: 'Fifths, tenths, hundredths', 7: 'Sevenths, elevenths' };
const _p12Denoms = (fams = [2, 3, 5]) => ({
    id: 'denoms', label: 'Denominators', type: 'set', group: 'difficulty', default: fams,
    values: fams.map(v => ({ v, l: _FRAC_FAM[v] })),
    allLabel: 'Every family, mixed',
    help: 'Tick one family of denominators for a page of it alone, or several. A fraction whose '
        + 'denominator joins two families (fifteenths) appears only when both are ticked.',
});
const _p12Strip = (help) => ({ ...picturesOption(true), group: 'support', strip: true,
    help: help || 'Off prints the same problems as numbers only, without the fraction pictures. An item the pupil drags or shades keeps its picture.' });
/** `forms` over a pickVariant() key: the values are positions in `variants`. */
const _p12Variants = (key, variants, labels, opts = {}) => ({
    ...formsOption(labels.map((l, i) => ({ v: i, l })), opts), variantKey: key, variants,
});
const _fracNvForms = (key, simplify = true) => _p12Variants(key, simplify ? ['straight', 'missing_num', 'simplify'] : ['straight', 'missing_num'],
    ['Work it out (2/6 + 3/6 = __)', 'Find the missing number (2/6 + __/6 = 5/6)', ...(simplify ? ['Work it out and simplify'] : [])],
    { label: 'What the items ask' });
const _mixedNvForms = (key, simplify = true) => _p12Variants(key, simplify ? ['straight', 'missing', 'simplify'] : ['straight', 'missing'],
    ['Work it out (2 1/3 + 1 1/3 = __)', 'Find the missing number (2 1/3 + __ = 4)', ...(simplify ? ['Work it out and simplify'] : [])],
    { label: 'What the items ask' });
Object.assign(P12_OPTIONS, {
    'fractions:identify': [_p12Denoms(), _p12Variants('identify', ['standard', 'pickModel', 'partLabel'],
        ['What fraction is shaded?', 'Pick the model that shows the fraction', 'Name the numerator or the denominator'])],
    'fractions:write_fraction': [_p12Denoms()],
    'fractions:shade_fraction': [_p12Denoms()],
    'fractions:equiv_frac_visual': [_p12Denoms()],
    'fractions:equiv_frac_nv': [_p12Denoms()],
    'fractions:equivalent': [_p12Denoms(), _p12Variants('equivalent', ['standard', 'yesNoEquiv', 'multiSelectHalf'],
        ['Find the missing number (1/2 = __/8)', 'Equivalent or not? (yes or no)', 'Click every fraction equal to 1/2'])],
    'fractions:compare': [_p12Denoms([2, 3]), _p12Variants('compare', ['standard', 'numericOnly', 'compareHalf'],
        ['Compare with fraction bars', 'Compare the numbers only', 'Compare with one half'])],
    'fractions:simplify': [_p12Variants('simplify_main', ['standard', 'isSimplest', 'gcfStep'],
        ['Simplify the fraction', 'Is it in simplest form? (yes or no)', 'Find the greatest common factor first'])],
    'fractions:improper_mixed': [_p12Denoms()],
    'fractions:mixed_improper_visual': [_p12Denoms()],
    'fractions:compose_target_frac': [_p12Denoms()],
    'fractions:identify_nv': [_p12Denoms([2, 3, 5, 7]), _p12Variants('identify_nv', ['type1', 'type2', 'type3'],
        ['"6 out of 7 parts are shaded"', '"Numerator 1, denominator 2"', 'A short story (a cake cut into slices)'])],
    'fractions:fraction_of_set': [_p12Denoms()],
    'fractions:fraction_of_set_hard': [_p12Denoms()],
    'fractions:fraction_of_set_nv': [_p12Denoms([2, 3, 5, 7]), _p12Variants('fraction_of_set_nv', ['type1', 'type2', 'type3'],
        ['A unit fraction of a number (1/4 of 12)', 'Any fraction of a number (3/4 of 12)', 'A short story'])],
    'fractions:fraction_of_set_hard_nv': [_p12Denoms(), _p12Variants('fraction_of_set_hard_nv', ['type1', 'type2', 'type3'],
        ['A fraction of a number (4/12 of 96)', 'Find the whole (3/7 of a number is 12)', 'A short story'])],
    'fractions:order_frac_numline': [_p12Denoms()],
    'fractions:compare_frac_lcd': [_p12Denoms()],
    'fractions:graph_fractions': [_p12Denoms([2, 3])],
    'fractions:round_fractions': [_p12Denoms()],
    'fractions:fraction_bar_ops': [_p12Denoms()],
    'fractions:fraction_nl_drag': [_p12Denoms()],
    'composing:fraction_number_line': [_p12Denoms()],
    'composing:whole_as_fraction': [_p12Denoms()],

    'fraction_operations:add_fractions_like': [_p12Denoms([2, 3, 5, 7]), _p12Strip()],
    'fraction_operations:sub_fractions_like': [_p12Denoms([2, 3, 5, 7]), _p12Strip()],
    'fraction_operations:add_mixed_like': [_p12Denoms(), _p12Strip()],
    'fraction_operations:sub_mixed_like': [_p12Denoms(), _p12Strip()],
    'fraction_operations:mult_frac_whole': [_p12Denoms(), _p12Strip()],
    'fraction_operations:decompose_fractions': [_p12Denoms(), _p12Strip()],
    'fraction_operations:frac_word_problems': [_p12Denoms()],
    'fraction_operations:frac_word_problems_plain': [_p12Denoms()],
    'fraction_operations:frac_10_100': [_p12Strip('Off prints the same problems as numbers only, without the tenths and hundredths grids.')],
    'fraction_operations:add_frac_unlike': [_p12Denoms(), _p12Strip()],
    'fraction_operations:sub_frac_unlike': [_p12Denoms(), _p12Strip()],
    'fraction_operations:add_mixed_unlike': [_p12Denoms(), _p12Strip()],
    'fraction_operations:sub_mixed_unlike': [_p12Denoms(), _p12Strip()],
    'fraction_operations:add_frac_like_nv': [_p12Denoms([2, 3, 5, 7]), _fracNvForms('add_frac_like_nv')],
    'fraction_operations:sub_frac_like_nv': [_p12Denoms([2, 3, 5, 7]), _fracNvForms('sub_frac_like_nv')],
    'fraction_operations:add_frac_unlike_nv': [_p12Denoms(), _fracNvForms('add_frac_unlike_nv')],
    'fraction_operations:sub_frac_unlike_nv': [_p12Denoms(), _fracNvForms('sub_frac_unlike_nv')],
    'fraction_operations:add_mixed_like_nv': [_p12Denoms(), _mixedNvForms('add_mixed_like_nv')],
    'fraction_operations:sub_mixed_like_nv': [_p12Denoms(), _mixedNvForms('sub_mixed_like_nv')],
    'fraction_operations:add_mixed_unlike_nv': [_p12Denoms([2, 3]), _mixedNvForms('add_mixed_unlike_nv')],
    'fraction_operations:sub_mixed_unlike_nv': [_p12Denoms([2, 3]), _mixedNvForms('sub_mixed_unlike_nv', false)],
    'fraction_operations:mult_frac_whole_nv': [_p12Denoms([2, 3, 5, 7]), _p12Variants('mult_frac_whole_nv', ['straight', 'missing_whole', 'simplify'],
        ['Work it out (5/6 × 2 = __)', 'Find the missing whole number (__ × 1/2 = 3 1/2)', 'Work it out and simplify'])],
    'fraction_operations:decompose_frac_nv': [_p12Denoms([2, 3, 5, 7]), _p12Variants('decompose_frac_nv', ['type1', 'type2', 'type3'],
        ['A sum of unit fractions (1/6 + 1/6 + …)', 'A sum of two fractions', 'How many unit fractions make it?'])],
    'fraction_operations:mult_frac_frac_nv': [_p12Denoms(), _p12Variants('mult_frac_frac_nv', ['straight', 'missing', 'simplify'],
        ['Work it out (1/2 × 2/3 = __)', 'Find the missing number', 'Work it out and simplify'])],
    'fraction_operations:div_unit_frac_nv': [_p12Denoms(), _p12Variants('div_unit_frac_nv', ['A_straight', 'A_missing', 'B_straight', 'B_missing'],
        ['Unit fraction ÷ whole (1/3 ÷ 2)', 'Unit fraction ÷ whole, a number missing', 'Whole ÷ unit fraction (7 ÷ 1/4)', 'Whole ÷ unit fraction, a number missing'])],
    'fraction_operations:frac_as_div_nv': [_p12Denoms(), _p12Variants('frac_as_div_nv', ['type1', 'type2', 'type3'],
        ['Write the division as a fraction', 'A sharing story', 'Write the result as a mixed number'])],
    'fraction_operations:frac_as_div_word': [_p12Denoms([2, 3, 5, 7])],
    'fraction_operations:mult_scaling_nv': [_p12Variants('mult_scaling_nv', ['type1', 'type2', 'type3'],
        ['A fraction less than 1: is the product smaller?', 'A fraction greater than 1: is the product bigger?', 'Write >, < or ='])],
    'fraction_operations:mult_frac_frac': [_p12Denoms(), _p12Strip()],
    'fraction_operations:div_unit_fraction': [_p12Denoms(), _p12Strip()],
    'fraction_operations:frac_as_division': [_p12Denoms([2, 5]), _p12Strip()],
    'fraction_operations:mult_scaling': [_p12Strip('Off prints the same comparisons as numbers only, without the scaling bars.')],
    'fraction_operations:frac_mult_word': [_p12Denoms()],
    'fraction_operations:frac_mult_word_plain': [_p12Denoms()],
    'fraction_operations:frac_word_mixed_plain': [_p12Denoms()],
});

// ======================= SHARED P12 CONTROLS FOR THE LEGACY GENERATORS =====================
// Most of the families below were written before options existed and draw their numbers from
// fixed tables. Rather than rewrite each branch, three ACCEPT controls (generate-question.js
// p12Acceptor) keep only the items that have the property asked for, and redraw the rest:
//   _p12Match   "What the items ask" by the item's own words (one regular expression per kind)
//   _p12Max     "Numbers to": every number on the item, answer included, is at most the value
//   _p12Dp      "Decimal places": every decimal on the item has a ticked number of places
// Each value offered was checked by ws-options-verify to be drawn often enough to be found.
const _p12Match = (pairs, opts = {}) => ({
    ...formsOption(pairs.map(([l], i) => ({ v: i, l })), opts), match: pairs.map(([, re]) => re),
});
const _p12Max = (values, natural, { label = 'Numbers to', help, labels = {} } = {}) => ({
    ..._opsBand([null, ...values], null, { label, labels: { null: `As dealt (to about ${natural.toLocaleString('en-US')})`, ...labels },
        help: help || 'The largest number anywhere on the item, the answer included.' }),
    group: 'difficulty', accept: 'max',
});
const _p12Dp = (values = [1, 2], help) => ({
    id: 'digits', label: 'Decimal places', type: 'set', group: 'difficulty', accept: 'dp',
    default: values,
    values: [{ v: 1, l: 'Tenths (0.7)' }, { v: 2, l: 'Hundredths (0.25)' }, { v: 3, l: 'Thousandths (0.125)' }].filter(x => values.includes(x.v)),
    allLabel: 'All of them, mixed',
    help: help || 'Tick one for a page of it alone. Tenths are the easiest step.',
});
const _dragOrNot = (convertLabel, convertRe = '^Convert') => _p12Match([[convertLabel, convertRe],
    ['Sort values into bins (drag)', 'Drag each']], { label: 'What the items ask',
    help: 'The sorting items are a drag task on screen and a matching task on paper. One kind per page, or both.' });

// ======================= CONVERSIONS AND DECIMALS (gen-fractions.js) =======================
Object.assign(P12_OPTIONS, {
    'conversions:f_to_d': [_p12Denoms([2, 5])],
    'conversions:d_to_f': [_dragOrNot('Convert one decimal (0.75 = 3/4)')],
    'conversions:f_to_p': [_dragOrNot('Convert one fraction (3/5 = 60%)')],
    'conversions:p_to_f': [_p12Denoms([2, 5]), _dragOrNot('Convert one percent (75% = 3/4)')],
    'conversions:d_to_p': [_p12Dp([1, 2], 'Tenths (0.7 = 70%) come before hundredths (0.08 = 8%).')],
    'conversions:p_to_d': [_p12Dp([1, 2], 'Tenths (70% = 0.7) come before hundredths (8% = 0.08).')],
    'conversions:percent_visual': [_p12Match([['What percent is shaded?', 'What percent'], ['What fraction is shaded?', 'What fraction'],
        ['"80% is shaded": how many squares?', 'How many squares'], ['Click every grid that shows it', 'Click ALL']])],
    'conversions:percent_of_number': [_p12Match([['What is 20% of 60?', '^What is'], ['Click every expression equal to it', 'Click ALL']]),
        _p12Max([50], 100)],
    'conversions:find_whole_from_pct': [_p12Match([['"16 is 40% of what number?"', 'of what number'], ['Click every value that works', 'Click ALL']])],
    'conversions:order_fdp': [_p12Match([['Least to greatest', 'least to greatest'], ['Greatest to least', 'greatest to least']],
        { label: 'Which order' })],
    'conversions:ratio_intro': [_p12Variants('ratio_intro', ['standard', 'partWhole', 'equivRatio'],
        ['Write the ratio (apples to oranges)', 'A part to the whole', 'Find the missing number (6:2 = __:6)']), _p12Max([20], 100)],
    'conversions:unit_rate_intro': [_p12Max([20, 50], 100, { help: 'The largest total in the story (the number shared out).' })],
    'conversions:double_num_line': [_p12Max([10, 20], 50)],
    'conversions:equiv_ratios': [_p12Variants('equiv_ratios', ['findMissing', 'isEquiv', 'simplify'],
        ['Find the missing value (5 : 9 = __ : 54)', 'Equivalent or not? (yes or no)', 'Write in simplest form']), _p12Max([50, 100], 100)],
    'conversions:ratio_tables': [_p12Max([20], 100)],
    'decimals:round_thousandths': [_p12Match([['Round to the nearest tenth', 'nearest tenth'], ['Round to the nearest hundredth', 'nearest hundredth']],
        { label: 'Round to the nearest' })],
    'decimals:decimal_nl_drag': [_p12Match([['Place one decimal', '^Drag \\d'], ['Place several decimals', 'Drag each']],
        { label: 'How many to place' })],
    // Read by gen-fractions.js (_fChanged('forms')): 0 = two different values, 1 = equal pairs.
    'decimals:compare_thousandths': [formsOption([{ v: 0, l: 'Two different values (0.844 and 0.722)' },
        { v: 1, l: 'The same value written two ways (0.450 and 0.45)' }],
    { label: 'Which pairs', help: 'A trailing zero changes nothing: 0.450 = 0.45. A page of those alone teaches it; the default mixes one in four.' })],
});

/** A set option of kinds told apart by the item's words or answer (see _p12Match), any id. */
const _p12Kinds = (id, label, pairs, help) => ({
    ..._p12Match(pairs, { label, help: help || 'Tick one for a page of it alone, or several. All ticked mixes them.' }), id,
});

// ======================= GEOMETRY (gen-geometry.js, gen-measurement.js) ====================
Object.assign(P12_OPTIONS, {
    'shapes_early:name_2d_shapes': [
        _p12Match([['Name the shape (write its name)', '^What shape'], ['Click every shape of one kind', '^Click ALL']]),
        _p12Kinds('shapes', 'Which shapes', [['Circles and ovals', '\\b(circles?|ovals?)\\b'], ['Triangles', '\\btriangles?\\b'],
            ['Squares and rectangles', '\\b(squares?|rectangles?)\\b'], ['Rhombuses', '\\brhomb'], ['Pentagons and hexagons', '\\b(pentagons?|hexagons?)\\b']]),
    ],
    'shapes_early:name_3d_shapes': [
        _p12Match([['Name the shape (write its name)', '^What'], ['Click every shape of one kind', '^Click ALL']]),
        _p12Kinds('shapes', 'Which shapes', [['Spheres', 'spheres?\\b'], ['Cylinders', 'cylinders?\\b'], ['Cubes', 'cubes?\\b'],
            ['Cones', 'cones?\\b'], ['Rectangular prisms', 'rectangular prism']]),
    ],
    'shapes_early:shape_positions': [_p12Kinds('forms', 'Which position words', [['Above and below', '=> (Above|Below)$'],
        ['Beside', '=> Beside$'], ['Between', '=> Between$']], 'Above and below come first; between is the hardest (two shapes to look at).')],
    'shapes_early:shape_corners_count': [_p12Max([4, 6], 8, { label: 'Corners up to', help: 'The most corners a shape on the page has.' })],
    'shapes_early:count_edges_faces_vertices': [
        _p12Kinds('forms', 'What is counted', [['Faces', '\\bfaces\\b'], ['Edges', '\\bedges\\b'], ['Vertices', '\\bvertices\\b']]),
        _p12Kinds('shapes', 'Which shapes', [['Cubes and prisms', 'cube|prism'], ['Pyramids', 'pyramid'],
            ['Curved shapes (cylinder, cone, sphere)', 'cylinder|cone|sphere']]),
    ],
    'shapes_early:count_sides_vertices_2d': [
        _p12Kinds('forms', 'What is counted', [['Sides', '\\bsides\\b'], ['Vertices', '\\bvertices\\b']]),
        _p12Max([4, 6], 10, { label: 'Sides up to', help: 'The most sides a shape on the page has.' }),
    ],
    'shapes_early:measure_nonstandard': [
        _p12Kinds('units', 'Measured with', [['Paper clips', 'paper clips'], ['Cubes', '\\bcubes\\b'], ['Crayons', 'crayons']]),
        _p12Max([5], 8, { label: 'Lengths up to', help: 'The longest length, in units.' }),
    ],
    'shapes_early:compose_shapes': [_p12Kinds('shapes', 'The shape made', [['A triangle', '=> Triangle$'],
        ['A square or a rectangle', '=> (Square|Rectangle)$'], ['A hexagon', '=> Hexagon$']])],
    'shapes_early:compose_hexagon': [_p12Kinds('shapes', 'Blocks used', [['Triangles', '\\(triangles\\)'], ['Trapezoids', '\\(trapezoids\\)'], ['Rhombi', '\\(rhombi\\)']],
        'Two trapezoids is the easiest fill; six triangles the most blocks to place.')],
    'shapes_early:partition_shapes': [
        _p12Variants('partition_shapes', ['count_parts', 'fraction_shaded'], ['How many equal parts?', 'What fraction is shaded?']),
        _p12Kinds('parts', 'Equal parts', [['Halves', '=> (2|\\d/2)$'], ['Thirds', '=> (3|\\d/3)$'], ['Fourths', '=> (4|\\d/4)$']]),
    ],
    'shapes_early:shape_attributes': [_p12Match([['How many sides or vertices?', '^How many'], ['Click every shape with a property', '^Click ALL']])],
    'shapes_early:compose_from_attributes': [_p12Kinds('forms', 'Which property', [['Right angles', 'right angle'],
        ['Number of sides', 'have (exactly )?\\d+ sides(?! AND)'], ['Parallel sides', 'parallel']])],
});

// ======================= MEASUREMENT, TIME, MONEY (gen-measurement.js) =====================
// ROUTES. Several measurement skills are one rung each of a ladder that lives in sibling ids
// (time_hour … time_1min; elapsed_30min … elapsed_mixed; the four clock-ordering ids). Their
// option picks the sibling rung, whose own branch draws the item (generate-question.js asks
// p12RouteFor before it dispatches), so from any rung the teacher can go a step easier or harder
// without leaving the skill. The skill's own rung is the default (R2).
export const P12_ROUTES = {};
/** The sibling skill id this skill's options route to, or null (its own branch). */
export function p12RouteFor(categoryId, skillId, opts) {
    const f = P12_ROUTES[`${categoryId}:${skillId}`];
    if (!f || !opts || typeof opts !== 'object') return null;
    try { return f(normalizeOptions(categoryId, skillId, opts)) || null; } catch (e) { return null; }
}
const _TIME_RUNGS = [['hour', 'time_hour', 'The hour (3:00)'], ['half', 'time_half_hour', 'The half hour (3:30)'],
    ['quarter', 'time_quarter', 'The quarter hour (3:15)'], ['five', 'time_5min', '5 minutes (3:25)'], ['one', 'time_1min', '1 minute (3:27)']];
const _timeForms = () => _p12Match([['Read the clock', 'What time does this clock show'], ['Set the clock (move the hands)', 'Set the clock']],
    { help: 'Setting the hands is harder than reading them. One kind per page, or both.' });
for (const [v, id] of _TIME_RUNGS) {
    P12_OPTIONS[`measurement:${id}`] = [
        _p12Enum('precision', 'To the nearest', _TIME_RUNGS.map(([x, , l]) => ({ v: x, l })), v,
            'Each step down the list is one step harder: the hour, then the half hour, the quarter, 5 minutes, 1 minute.'),
        _timeForms(),
    ];
    P12_ROUTES[`measurement:${id}`] = (o) => (_TIME_RUNGS.find(r => r[0] === o.precision) || [])[1];
}
const _ELAPSED = [[60, 'elapsed_hour', 'Whole hours'], [30, 'elapsed_30min', '30 minutes'], [15, 'elapsed_15min', '15 minutes'],
    [0, 'elapsed_mixed', 'Hours and minutes together']];
for (const [v, id] of _ELAPSED) {
    P12_OPTIONS[`measurement:${id}`] = [
        _p12Enum('step', 'Time that passes', _ELAPSED.map(([x, , l]) => ({ v: x, l })), v,
            'The jump on the clock: whole hours are the easiest, hours and minutes together the hardest.'),
        // The hours-and-minutes rung only counts on, so it offers no "Earlier".
        v === 0 ? _p12Match([['Later (what time will it be?)', 'will it be'], ['Set the clock', 'Set the clock']])
            : _p12Match([['Later (what time will it be?)', 'will it be'], ['Earlier (what time was it?)', 'was it'], ['Set the clock', 'Set the clock']],
                { help: 'Counting back (earlier) is harder than counting on. One kind per page, or all of them.' }),
    ];
    P12_ROUTES[`measurement:${id}`] = (o) => (_ELAPSED.find(r => r[0] === Number(o.step)) || [])[1];
}
const _EV = [['half', 'elapsed_visual_easy', 'Half hours (1 hr 30 min)'], ['quarter', 'elapsed_visual_medium', 'Quarter hours (1 hr 15 min)'],
    ['one', 'elapsed_visual_hard', 'Any minute (2 hr 7 min)']];
for (const [v, id] of _EV) {
    P12_OPTIONS[`measurement:${id}`] = [
        _p12Enum('precision', 'Time passed, to the nearest', _EV.map(([x, , l]) => ({ v: x, l })), v, 'Half hours are the easiest step.'),
        _p12Match([['How much time has passed?', 'How much time'], ['Set the clock', 'Set the clock']]),
    ];
    P12_ROUTES[`measurement:${id}`] = (o) => (_EV.find(r => r[0] === o.precision) || [])[1];
}
const _ORD = { analog: { asc: 'order_clocks_analog_asc', desc: 'order_clocks_analog_desc' }, digital: { asc: 'order_clocks_digital_asc', desc: 'order_clocks_digital_desc' } };
for (const [model, byDir] of Object.entries(_ORD)) {
    for (const [dir, id] of Object.entries(byDir)) {
        P12_OPTIONS[`measurement:${id}`] = [
            _p12Enum('dir', 'Order', [{ v: 'forward', l: 'Earliest first' }, { v: 'back', l: 'Latest first' }], dir === 'asc' ? 'forward' : 'back',
                'Latest first is harder: the pupil counts back through the day.'),
            _p12Enum('model', 'Clocks', [{ v: 'analog', l: 'Analog (hands)' }, { v: 'digital', l: 'Digital (numbers)' }], model,
                'Digital clocks are easier to compare; analog clocks need reading first.', 'support'),
        ];
        P12_ROUTES[`measurement:${id}`] = (o) => _ORD[o.model === 'digital' ? 'digital' : 'analog'][o.dir === 'back' ? 'desc' : 'asc'];
    }
}
Object.assign(P12_OPTIONS, {
    'measurement:time_analog_digital': [_p12Match([['Which analog clock shows the time?', 'Which analog clock'],
        ['Which digital clock shows the same time?', 'Which digital clock'], ['Put the clocks in order (drag)', 'Drag the clocks']])],
    'measurement:time_match_clock': [_p12Kinds('precision', 'Times to', [['The hour', '=> \\d+:00$'], ['The half hour', '=> \\d+:30$'],
        ['The quarter hour', '=> \\d+:(15|45)$'], ['5 minutes', '=> \\d+:(05|10|20|25|35|40|50|55)$']])],
    'measurement:elapsed_find_duration': [_p12Max([120, 180], 300, { label: 'Longest time', labels: { 120: '2 hours', 180: '3 hours' },
        help: 'The longest time that passes, in minutes.' })],
    'measurement:heavier_lighter_visual': [_p12Match([['Which is heavier?', 'heavier'], ['Which is lighter?', 'lighter']])],
    'measurement:pictograph_intro': [_p12Match([['How many?', '^How many (?!MORE)'], ['How many more?', 'How many MORE']])],
    'measurement:bar_graph_intro': [_p12Match([['Which has the most?', 'MOST'], ['How many?', '^How many (?!MORE)'], ['How many more?', 'How many MORE']])],
    'measurement:reading_ruler': [_p12Kinds('parts', 'Marks read', [['Whole inches', '=> \\d+$'], ['Half inches', '=> (\\d+ )?1/2$'],
        ['Quarter inches', '=> (\\d+ )?[13]/4$']], 'Whole inches first, then halves, then quarters.')],
    'measurement:reading_ruler_hard': [_p12Kinds('parts', 'Marks read', [['Whole inches', '=> \\d+$'], ['Half inches', '=> (\\d+ )?1/2$'],
        ['Quarter inches', '=> (\\d+ )?[13]/4$']], 'Whole inches first, then halves, then quarters.')],
    'measurement:money_count': [_p12Match([['Count coins (cents)', 'Count the coins|cents do these'], ['Count bills (dollars)', 'Count the bills'],
        ['Coins and bills together', 'Count all the money'], ['Click the sets that make it', 'Click ALL']])],
    'measurement:money': [_p12Match([['Add two amounts', 'Find the total'], ['Find the change', 'You paid'], ['Click every way to make it', 'Click ALL']])],
    'measurement:equiv_coin_sets': [_p12Max([25, 50], 100, { label: 'Amounts to', help: 'The amount in cents the coin sets must make.' })],
    'measurement:enough_money': [_p12Match([['Enough money (yes)', '=> Yes$'], ['Not enough money', '=> No']], { label: 'Which answer',
        help: 'Both, mixed, is the default: the pupil has to add up. One kind alone is a warm-up.' })],
    'measurement:temperature': [
        _p12Match([['Read the thermometer (°F)', 'shown\\? \\(°F\\)'], ['Read the thermometer (°C)', 'shown\\? \\(°C\\)'],
            ['Convert between °C and °F', '^Convert'], ['Click or sort temperatures', 'Click ALL|Sort each']]),
    ],
    'measurement:capacity': [
        _p12Kinds('units', 'Units', [['Customary (cups, pints, quarts, gallons)', 'cups|pints|quarts|gallons'], ['Metric (mL and L)', '\\bmL\\b|\\bL\\b|lit']]),
        _p12Match([['Convert', '^Convert'], ['Click or sort containers', 'Click ALL|Sort each']]),
    ],
    'measurement:unit_conversions': [
        _p12Kinds('units', 'Units', [['Metric (m, g, L)', 'meters|grams|liters|milli|centi|kilo'], ['Customary (ft, lb, qt)', 'feet|inches|yards|ounces|pounds|quarts|gallons|cups|pints']]),
        _p12Match([['Convert one measurement', '^(Convert|How many)'], ['Click every equal measurement', '^Click ALL']]),
    ],
    'measurement:length_customary': [_p12Kinds('forms', 'Which units', [['Feet to inches', 'inches are in \\d+ feet'], ['Yards to feet', 'feet are in \\d+ yards'],
        ['Yards to inches', 'inches are in \\d+ yards'], ['Miles to feet', 'feet are in \\d+ miles']], 'Feet to inches (× 12) and yards to feet (× 3) come first.')],
    'measurement:length_metric': [_p12Kinds('forms', 'Which units', [['cm to mm', 'mm are in \\d+ cm'], ['m to cm', 'cm are in \\d+ m\\b'],
        ['m to mm', 'mm are in \\d+ m\\b'], ['km to m', '\\bm are in \\d+ km']], 'cm to mm (× 10) comes first.')],
    'measurement:mass_volume_liquid': [_p12Match([['Read the cylinder (mL)', 'graduated cylinder'], ['Read the scale (g or kg)', 'Read the scale'],
        ['Click or sort by unit', 'Click ALL|Sort each']])],
    'measurement:estimate_length': [_p12Match([['About how long?', 'About how long'], ['Click every reasonable estimate', 'Click ALL'], ['Sort by unit (drag)', 'Sort each']])],
    'shapes_early:order_objects_length': [_p12Enum('tiles', 'Objects to order', [{ v: null, l: '3 or 4, dealt' }, { v: 3, l: '3' }, { v: 4, l: '4' }], null,
        'Four objects is harder: one more comparison to make.')],
});

Object.assign(SKILL_OPTIONS, P12_OPTIONS);
// ============================ end P12 · every other family ============================

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
// A rounding / estimation `place` sets the number size the same way (numbers to 10 x the place),
// so it owns its numbers too.
const OWNS_ITS_NUMBERS = new Set(['constant', 'band', 'place']);

// P12: skills whose measured Max Number / Decimals would mislead. word_problems_mixed deals the
// four story kinds at their own sizes, so "Up to 10" still printed 49 and "Tenths" printed whole
// numbers (the stories have no decimal form).
const P12_NO_MEASURED = new Set(['number_ops_mixed:word_problems_mixed', 'number_ops_mixed:word_problems_mixed_plain']);

function _measuredOptions(categoryId, skillId, own) {
    const d = DERIVED[`${categoryId}:${skillId}`];
    if (!d || P12_NO_MEASURED.has(`${categoryId}:${skillId}`)) return [];
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
    const own = ownOptionsFor(categoryId, skillId);
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
    const own = ownOptionsFor(categoryId, skillId);
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
    // ÷: the 0 set is 0 ÷ n, never "Divide by 0" (P11, `zeroTitle` on the div_facts constant).
    if (def.zeroTitle && chosen.includes(0)) {
        const rest = chosen.filter(v => v !== 0);
        return rest.length ? `${def.titleVerb || def.label} ${_joinAnd(_numberRuns(rest))}, and ${def.zeroTitle.toLowerCase()}`
            : def.zeroTitle;
    }
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
