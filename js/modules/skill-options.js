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
// FOLDED CONTROLS (option-panel round 3, 2026-09-25)
// ---------------------------------------------------------------------------
// A panel may hold at most five controls (OPTIONS-RUBRIC.md O5). Where a skill had more, two or
// three old controls become one (the function table's "Rows" and "In numbers" become "Table").
// The old options stay in the model with `hidden: true` — so a share code written before still
// decodes through its own key — and a FOLD rewrites their values into the new control inside
// normalizeOptions(), then drops them (they fall back to their defaults, which a code never
// writes). `fold(raw)` receives the caller's raw object (a decoded code holds only what differed
// from the old defaults) and returns it rewritten. Each family registers its own fold beside its
// options.
export const OPTION_FOLDS = {};

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

// ---------------------------------------------------------------------------
// S2 · THE SUPPORTS MODEL (design/SUPPORTS.md §S2)
// ---------------------------------------------------------------------------
// `support` is the ONE Support control of a skill that has the supports model: a SET of the
// supports the skill can draw (its provider's `supports` declaration, or the family default in
// sheet/providers/util.js; ws-supports-unit checks the two agree). Every value is drawn AT RENDER
// TIME round the problem the generator made (sheet/support-draw.js): the generated items are the
// same with or without a support, so the pupil page, the key and the screen all draw the same
// thing. Nothing ticked (the default) is no support, so every existing page and link is unchanged.
// An old code that carried one cue ("~FD", dot tiles) decodes to that one tick.
//
// `cover` (where the supports go on the page) and `mix` (how two supports that clash on one
// problem are shared out) appear only once a support is ticked. The print screen can set both for
// a whole sheet; on its own a skill carries them into a link.
export const SUPPORT_LABELS = Object.freeze({
    touch: 'Touch dots: count on', touchall: 'Touch dots: count all',
    tile: 'Dot tiles (one dot for each)', frame: 'Ten frames', line: 'Number line 0 to 20',
    skip: 'Skip-count strip (3, 6, 9 …)', array: 'Dot array', think: 'Think box (4 × __ = 28)',
    boxsign: 'The sign in a box, named', startarrow: 'Start arrow over the ones column',
    steps: 'Step checklist',
    'round-pv': 'Place-value chart: ring the place, underline the next digit',
    'round-mark': 'Ring and underline on the number itself',
});
// The supports that are marks, not pictures: they stack with anything (§S4.7), so ticking one
// beside another support never needs the Mix control.
const _SUPPORT_MARKS = new Set(['boxsign', 'startarrow', 'steps', 'round-mark']);
const _supportTicks = (o) => (Array.isArray(o && o.support) ? o.support : []).filter(v => SUPPORT_LABELS[v]);
/** The unified Support set. `labels` overrides the wording per skill (count back, count by). */
export const supportsOption = (values, { help, labels = {}, render = null, dflt = [] } = {}) => ({
    id: 'support', label: 'Support', type: 'set', default: dflt.slice(), group: 'support',
    supportsModel: true,
    // The values drawn at render time (the rest, on a rounding skill, are its generation rungs).
    render: (render || values).slice(),
    values: values.map(v => ({ v, l: labels[v] || SUPPORT_LABELS[v] || v })),
    allLabel: 'Every support',
    help: help || 'Tick the help to draw on each problem, on paper and on screen. Supports that cannot '
        + 'share a problem are shared out by section or problem by problem. None ticked is the fade.',
    helpShort: 'Tick the help each problem carries. None ticked is no help.',
});
export const supportCoverOption = (render = null) => ({
    id: 'cover', label: 'Which problems get it', type: 'enum', default: 'whole', group: 'support',
    values: [{ v: 'whole', l: 'Every problem' }, { v: 'needed', l: 'Only the problems that need it' },
        { v: 'fade', l: 'Fade down the page (all, then less, then none)' }],
    help: '"Need it" skips the easy ones (a count of 1 or 2, a column that does not regroup). "Fade" '
        + 'gives the first third everything, the middle third the light part, the last third none.',
    appliesTo: (o) => _supportTicks(o).some(v => !render || render.includes(v)),
});
export const supportMixOption = (render = null) => ({
    id: 'mix', label: 'Supports that clash', type: 'enum', default: 'section', group: 'support',
    values: [{ v: 'section', l: 'Section by section' }, { v: 'problem', l: 'Problem by problem' }],
    help: 'Two supports that cannot share a problem (touch dots and dot tiles) take turns: section A '
        + 'one and section B the other, or alternating problem by problem.',
    appliesTo: (o) => _supportTicks(o).filter(v => !_SUPPORT_MARKS.has(v) && (!render || render.includes(v))).length >= 2,
});
/** The three controls of the supports model, for a skill's option list. */
export const supportsOptions = (values, o = {}) => {
    const render = o.render || values;
    const canClash = render.filter(v => !_SUPPORT_MARKS.has(v)).length >= 2;
    return [supportsOption(values, o), supportCoverOption(o.render), ...(canClash ? [supportMixOption(o.render)] : [])];
};

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
        'The same 12 x 12 chart every time: level 2 leaves 8 cells to fill, level 1 leaves 16, '
        + 'level 0 leaves 30. Level 2 never blanks the 1 row or the 1 column.')],
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
    id: 'zeroPlace', label: 'A zero place (305, 340)', type: 'enum', default: 'some', group: 'difficulty',
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
        // S2: the rounding supports are one set. "Cut line" and "Number line" are the generator's
        // own rungs (the cell it draws, as before: "~FL" still means the number line); the chart
        // and the marks are drawn round the problem at render time. None ticked is the fade.
        ...supportsOptions(['cut', 'line', 'round-pv', 'round-mark'], {
            dflt: ['cut'], render: ['round-pv', 'round-mark'],
            labels: { cut: 'Cut line (place letters over the digits)', line: 'Number line (ends labelled)' },
            help: 'The cut line and the number line change the problem\'s own drawing (tick one). The chart '
                + 'and the marks are drawn beside it. None ticked is the fade.',
        }),
        {
            id: 'response', label: 'How the pupil answers', type: 'enum', default: 'write', group: 'layout',
            values: [
                { v: 'write', l: 'Write the rounded number' },
                { v: 'circle-all', l: 'Circle every number that rounds to N' },
            ],
            help: '"Circle every number" is its own step: eight numbers, with near misses either side of halfway.',
        },
        _pvResponseScope(),
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
        // Bins one apart / three bins are whole-number steps (RS-2); the decimal sorts keep two.
        ...(place ? [_pvBins()] : []),
    ];
};
const _pvEstSupport = () => ({
    id: 'support', label: 'Support', type: 'enum', default: 'rewrite', group: 'support',
    values: [{ v: 'rewrite', l: 'A line to write the rounded numbers' }, { v: 'none', l: 'None: the estimate only' }],
    help: 'The rewrite line holds each rounded number under the one it came from; "None" is the fade.',
});
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
// `mixed` appends the value 0, "both jumps the skill's name promises, dealt in turn" (round-3:
// "1 More, 1 Less, 10 More, 10 Less" dealt only "1 more" at its defaults). 0 is written by value
// in a share code (no token needed), and it is appended, so no existing value moves.
const _pvStep = (values, dflt, mixed = '') => ({
    id: 'step', label: 'How much more or less', type: 'enum', default: dflt, group: 'difficulty',
    values: [...values.map(v => ({ v, l: String(v) })), ...(mixed ? [{ v: 0, l: mixed }] : [])],
    help: 'The jump the pupil adds or takes away. "Both" deals the two jumps in the name in turn.',
});
const _pvDir = (dflt = 'more') => ({
    id: 'dir', label: 'More or less', type: 'enum', default: dflt, group: 'difficulty',
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
// ---- P9 step 8 (§19.4 step 8): the remaining options of §2.5, each read by gen-pv.js. ----
const _pvIdentifyResponse = () => ({
    id: 'response', label: 'How the pupil answers', type: 'enum', default: 'circle', group: 'layout',
    values: [
        { v: 'circle', l: 'Circle one of three place words' },
        { v: 'bank', l: 'Write the place word from a word bank' },
    ],
    help: 'Circling is the first step; writing the word from a bank is the next one.',
});
const _pvRepeatDigit = () => ({
    id: 'repeatDigit', label: 'A repeated digit (747: which 7?)', type: 'bool', default: false, group: 'difficulty',
    help: 'On gives numbers with the same digit twice, so the pupil must read the underlined one.',
});
const _pvValueForm = () => ({
    id: 'form', label: 'How the value is written', type: 'enum', default: 'value', group: 'layout',
    values: [
        { v: 'value', l: 'The value (700)' },
        { v: 'unit', l: 'Unit form (7 hundreds)' },
        { v: 'notation', l: 'Expanded notation (7 × 100)' },
    ],
    help: 'One way per page. Unit form and expanded notation name the place and the digit.',
});
const _pvZeroDigit = () => ({
    id: 'zeroDigit', label: 'Ask the value of a 0', type: 'bool', default: false, group: 'difficulty',
    help: 'On underlines a zero on some items: its value is 0, but it holds the place.',
});
const _pvExpandFrame = () => ({
    id: 'frame', label: 'Answer frame', type: 'enum', default: 'boxes', group: 'support',
    values: [
        { v: 'boxes', l: 'One box for each place' },
        { v: 'line', l: 'A line (300 + 5 or 300 + 0 + 5 both right)' },
    ],
    help: 'The boxes are the support; the line is the fade. On the line a zero part may be left out.',
});
const _pvExpandForm = () => ({
    id: 'form', label: 'How the parts are written', type: 'enum', default: 'sum', group: 'layout',
    values: [
        { v: 'sum', l: 'Values (300 + 40 + 5)' },
        { v: 'notation', l: 'Expanded notation (3 × 100 + 4 × 10 + 5 × 1)' },
    ],
    help: 'Expanded notation is the grade 4 form: the pupil writes the digit for each place.',
});
const _pvCloseness = () => ({
    id: 'closeness', label: 'How close the numbers are', type: 'enum', default: 'some', group: 'difficulty',
    // 'some' (appended, round-3): a page where the first digit does NOT always decide — every
    // other item shares its first digit, so the pupil must go on to the next place.
    values: [{ v: 'far', l: 'Far apart' }, { v: 'close', l: 'Close (same first digit)' }, { v: 'some', l: 'Both (every other item close)' }],
    help: 'Close numbers share their first digit, so the pupil must look at the next place.',
});
const _pvLengths = () => ({
    id: 'lengths', label: 'Digit counts', type: 'enum', default: 'equal', group: 'difficulty',
    values: [{ v: 'equal', l: 'Same number of digits' }, { v: 'mixed', l: 'Different numbers of digits' }],
    help: 'Different lengths teach that more digits means a bigger number.',
});
const _pvOrderCount = () => ({
    id: 'count', label: 'How many numbers', type: 'enum', default: 3, group: 'difficulty',
    values: [3, 4, 5, 6].map(v => ({ v, l: String(v) })),
    help: 'The same count on every item of the page.',
});
const _pvResponseScope = () => ({
    id: 'responseScope', label: 'What the pupil does', type: 'enum', default: 'full', group: 'layout',
    values: [
        { v: 'full', l: 'Round the number' },
        { v: 'notation', l: 'Underline the place and circle the next digit (do not round)' },
        { v: 'decision', l: 'Decide: round up or round down' },
        { v: 'judge', l: 'Check a finished rounding (correct or fix it)' },
    ],
    help: 'The sub-steps before rounding, and checking a rounding, each as a page of their own.',
});
const _pvBins = () => ({
    id: 'bins', label: 'The bins', type: 'enum', default: 'adjacent', group: 'difficulty',
    values: [
        { v: 'adjacent', l: 'Two next to each other (40 and 50)' },
        { v: 'apart', l: 'One apart, with a Neither bin (40 and 60)' },
        { v: 'three', l: 'Three in a row (40, 50 and 60)' },
    ],
    help: 'Bins one apart stop the pupil sorting by the first digit alone.',
});
const _pvMoreLessUnknown = () => ({
    id: 'unknown', label: 'What is missing', type: 'enum', default: 'answer', group: 'difficulty',
    values: [{ v: 'answer', l: 'The answer (10 more than 47 is __)' }, { v: 'start', l: 'The start (47 is 10 more than __)' }],
    help: 'A missing start is the inverse: the pupil does the opposite of the word.',
});
const _pvMoreLessSupport2 = (withChart) => {
    const d = _pvMoreLessSupport(withChart);
    d.values = [{ v: 'strip', l: 'A strip of the hundreds chart (the number in its row or column)' }, ...d.values];
    d.help = 'Most support first. The strip shows only the number; the pupil works out the box beside it.';
    return d;
};
// Round on a number line to thousands and beyond (owner, 2026-09-25). The number SIZE is the
// skill (its id); the place is its option, offered from the tens up to one place above the
// number's own top place (648,000 -> nearest 1,000,000). The line options reuse rounding_visual's
// ids and tokens (`line`, `midLabel`), so the family reads as one system. No "mixed places"
// value: a page changes one thing, the place, by choosing it.
export const ROUND_NL = Object.freeze({
    round_nl_thousands: Object.freeze({ lo: 1000, hi: 9999, places: [10, 100, 1000, 10000], dflt: 1000 }),
    round_nl_ten_thousands: Object.freeze({ lo: 10000, hi: 99999, places: [10, 100, 1000, 10000, 100000], dflt: 10000 }),
    round_nl_hundred_thousands: Object.freeze({ lo: 100000, hi: 999999, places: [10, 100, 1000, 10000, 100000, 1000000], dflt: 100000 }),
});
function _pvRoundNl(id) {
    const d = ROUND_NL[id];
    return [
        { id: 'place', label: 'Round to the nearest', type: 'enum', default: d.dflt, group: 'difficulty',
            values: d.places.map(v => ({ v, l: v.toLocaleString('en-US') })),
            help: 'The place the number is rounded to. The line runs from one multiple of it to the next.' },
        _pvMidpoint(true),
        { id: 'line', label: 'Dot on the line', type: 'enum', default: 'mark', group: 'support',
            values: [
                { v: 'plotted', l: 'The dot is shown on the line' },
                { v: 'mark', l: 'The pupil places the dot' },
            ],
            help: 'Most support first: the dot is drawn for the pupil, then the pupil places it.' },
        { id: 'midLabel', label: 'Label the halfway point', type: 'bool', default: true, group: 'support',
            help: 'The halfway number printed under the middle tick. Off is the fade: the tick stays marked.' },
    ];
}
const P9_PV_OPTIONS = {
    'placevalue:identify': [_pvBand(_PV_PLACE_BANDS, 999), _pvPlaceSet(100000), _pvDigitSupport(), _pvIdentifyResponse(), _pvRepeatDigit()],
    'placevalue:value': [_pvBand(_PV_PLACE_BANDS, 999), _pvDigitSupport(), _pvValueForm(), _pvZeroDigit()],
    'placevalue:expand': [_pvBand(_PV_PLACE_BANDS, 999), _pvZeroPlace(true), _pvExpandFrame(), _pvExpandForm()],
    'placevalue:combine': [_pvBand(_PV_PLACE_BANDS, 999), _pvZeroPlace(true), {
        id: 'order', label: 'Order of the parts', type: 'enum', default: 'largest', group: 'difficulty',
        values: [{ v: 'largest', l: 'Largest first' }, { v: 'scrambled', l: 'Scrambled (5 + 300 + 20)' }],
        help: 'Scrambled parts are harder: the pupil has to put each part in its place.',
    }],
    'placevalue:compare': [_pvBand([99, 999, 9999, 99999, 999999], 999), _pvCloseness(), _pvLengths()],
    'placevalue:order_least_to_greatest': [_pvBand([99, 999, 9999, 99999, 999999], 999), _pvOrderCount(), _pvCloseness(), _pvLengths()],
    'placevalue:order_greatest_to_least': [_pvBand([99, 999, 9999, 99999, 999999], 999), _pvOrderCount(), _pvCloseness(), _pvLengths()],
    'placevalue:place_value_disks': [_pvBand([99, 999, 9999], 999), {
        id: 'task', label: 'Task', type: 'enum', default: 'read', group: 'layout',
        values: [{ v: 'read', l: 'Read the number from the disks' }, { v: 'count', l: "Count one place's disks" }],
        help: 'Counting one place is the easier first step; reading the whole number comes next.',
    }, _pvZeroPlace(false)],
    // Draw to 999 only (owner ruling 3): nine 1,000 disks and 27 others is a poster, not a cell.
    'placevalue:pv_disks_build': [_pvBand([99, 999], 999), _pvZeroPlace(false)],
    'placevalue:pv_digit_drag': [_pvBand([999, 9999, 99999, 999999], 99999), {
        id: 'source', label: 'The number is given as', type: 'enum', default: 'expanded', group: 'difficulty',
        values: [
            { v: 'expanded', l: 'Expanded form (40,000 + 300 + 6)' },
            { v: 'word', l: 'Words (forty thousand, three hundred six)' },
            { v: 'numeral', l: 'A numeral with commas (copying, the easiest)' },
        ],
        help: 'Expanded form and words make the pupil work out each digit\'s place; a numeral is copying.',
    }],
    'placevalue:number_word_names': [_pvBand([999, 9999, 99999, 999999], 999999)],
    'placevalue:more_less_10': [_pvStep([1, 10], 0, 'Both: 1 and 10'), _pvDir('both'), _pvBand([20, 50, 100, 120], 100), _pvMoreLessSupport2(true), _pvMoreLessUnknown()],
    // Numbers 100-900 (2.NBT.B.8): the band is fixed at 1,000, so there is no band control. The
    // 1,000 step (4.NBT) is appended to the enum (SCC-P12) and works to 10,000.
    'placevalue:more_less_100': [_pvStep([10, 100, 1000], 0, 'Both: 10 and 100'), _pvDir('both'), _pvMoreLessSupport2(false), _pvMoreLessUnknown()],
    'placevalue:place_value_10x': [
        // Round-3: the defaults deal what the name promises — × AND ÷, by 10, 100 AND 1,000 ('both'
        // is appended; a single op or power is still one tick away).
        { id: 'op', label: 'Multiply or divide', type: 'enum', default: 'both', group: 'difficulty',
            values: [{ v: 'x', l: '× (digits move left)' }, { v: '/', l: '÷ (digits move right)' }, { v: 'both', l: 'Both, in turn' }],
            help: 'Dividing is the harder direction: the digits move right.' },
        { id: 'power', label: 'By', type: 'set', default: [10, 100, 1000], group: 'difficulty',
            values: [{ v: 10, l: '10' }, { v: 100, l: '100' }, { v: 1000, l: '1,000' }], allLabel: '10, 100 and 1,000',
            help: 'Tick one power for a page that stays with it, or several to mix them.' },
        // Default 100,000 (round-3): with × and ÷ by 1,000 in the default mix, a band of 10,000
        // left ÷ 1,000 only 10,000 ÷ 1,000 to deal.
        _pvBand([1000, 10000, 100000, 1000000], 100000, 'The biggest number on the page (the larger of the number and its answer).'),
        { id: 'decimals', label: 'Decimals (grade 5)', type: 'bool', default: false, group: 'difficulty',
            help: 'On gives numbers with a decimal point, such as 3.4 × 100.' },
        { id: 'support', label: 'Support', type: 'enum', default: 'shift', group: 'support',
            values: [{ v: 'shift', l: 'Shift chart (the digits move across the places)' }, { v: 'none', l: 'None: the equation only' }],
            help: 'The chart shows each digit moving one place for each zero; "None" is the fade.' },
    ],
    'placevalue:unit_form': [_pvBand([99, 999, 9999], 999), {
        id: 'rename', label: 'More than 9 of one place', type: 'enum', default: 'standard', group: 'difficulty',
        values: [{ v: 'standard', l: 'No (476 = 4 hundreds 7 tens 6 ones)' }, { v: 'more', l: 'Yes (476 = 47 tens 6 ones)' }],
        help: 'Renaming (47 tens) is the idea regrouping is built on.',
    }],
    'number_sense:rounding_visual': [
        { id: 'place', label: 'Round to the nearest', type: 'enum', default: 10, group: 'difficulty',
            values: [{ v: 10, l: '10' }, { v: 100, l: '100' }, { v: 1000, l: '1,000' }],
            help: 'The place the number is rounded to. The numbers grow to fit the place.' },
        _pvBand([100, 1000, 10000], 100, 'The biggest number on the page. It grows to fit the place when the place needs more.'),
        _pvMidpoint(true),
        { id: 'line', label: 'The number line', type: 'enum', default: 'mark', group: 'support',
            values: [
                { v: 'plotted', l: 'The number is marked on the line' },
                { v: 'mark', l: 'The pupil marks the number' },
                { v: 'ends', l: 'The ends only (no marking)' },
            ],
            help: 'Most support first: the dot is drawn, then the pupil marks it, then the line alone.' },
        { id: 'midLabel', label: 'Label the halfway tick', type: 'bool', default: false, group: 'support',
            help: 'A hint: the halfway number is printed under the middle tick.' },
    ],
    'number_sense:between_tens': [_pvBand([100, 1000], 100)],
    'number_sense:round_nl_thousands': _pvRoundNl('round_nl_thousands'),
    'number_sense:round_nl_ten_thousands': _pvRoundNl('round_nl_ten_thousands'),
    'number_sense:round_nl_hundred_thousands': _pvRoundNl('round_nl_hundred_thousands'),
    'number_sense:place_on_number_line': [
        { id: 'span', label: 'The line goes from', type: 'enum', default: 10, group: 'difficulty',
            values: [{ v: 10, l: 'One ten to the next' }, { v: 100, l: 'One hundred to the next' }, { v: 1000, l: 'One thousand to the next' }],
            help: 'The two ends are the tens (hundreds, thousands) the number is between.' },
        _pvBand([100, 1000, 10000], 100, 'The biggest number on the page. It grows to fit the line.'),
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
    'number_sense:rounding_table': [
        { id: 'places', label: 'Columns (round to the nearest)', type: 'set', default: [10, 100], group: 'difficulty',
            values: [{ v: 10, l: '10' }, { v: 100, l: '100' }, { v: 1000, l: '1,000' }, { v: 10000, l: '10,000' }],
            allLabel: 'All four columns',
            help: 'One column per place. The numbers are as big as the biggest place needs.' },
        { id: 'blank', label: 'What the pupil fills in', type: 'enum', default: 'column', group: 'layout',
            values: [{ v: 'column', l: 'A whole column' }, { v: 'row', l: 'A whole row (one number to every place)' }],
            help: 'A whole column or row is blank, so no answer can be read off its neighbours.' },
    ],
    'number_sense:estimate_sum': [_pvEstPlace(), _pvEstSupport()],
    'number_sense:estimate_diff': [_pvEstPlace(), _pvEstSupport()],
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
    if (ROUND_NL[skillId]) return Number((opts && opts.place) || ROUND_NL[skillId].dflt);
    return 0;
}

/**
 * The smallest band a P9 skill can be dealt at with these options. 0 = no floor.
 * The place sets it for rounding (a nearest-100 item is at least 3 digits, so it needs 1,000);
 * a step or a power sets it for more / less and x / ÷ 10.
 */
export function pvBandFloor(categoryId, skillId, opts) {
    const o = normalizeOptions(categoryId, skillId, opts);
    // A round-on-a-number-line skill's numbers are its id's size, whatever place it rounds to.
    if (ROUND_NL[skillId]) return ROUND_NL[skillId].hi + 1;
    const place = pvRoundPlace(skillId, o);
    if (place) return place * 10;
    if (skillId === 'more_less_100') return Number(o.step) === 1000 ? 10000 : 1000;
    if (skillId === 'between_tens') return 100;
    if (skillId === 'place_on_number_line') return (Number(o.span) || 10) * 10;
    if (skillId === 'rounding_table') {
        const ps = (Array.isArray(o.places) && o.places.length ? o.places : [10, 100]).map(Number);
        return Math.max(...ps) * 10;
    }
    if (skillId === 'more_less_10') return Number(o.step) === 1 ? 10 : 20;
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
 * The refusal line when Max Number cannot host the skill, or '' when it can.
 *
 * A STAND-ALONE skill never refuses (owner direction of 2026-09-25, round-3 fix wave): a skill
 * owns its numbers ("Round to the nearest 1,000" printed blank pages at Max Number 1,000): its band
 * option, floored by its place, is its range whatever Max Number says (gen-pv.js capOf) — print,
 * worksheet, quiz and card alike. Only a MEMBER of a mixed
 * review (`strict`), which has no band of its own, is left out when Max Number cannot host it.
 */
export function pvRefusal(categoryId, skillId, range, opts, strict = false) {
    if (!strict) return '';
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
// One honest help sentence per operation (OPTIONS-CRITIC-R2 §5 #22): a + page is told about
// sums, a − page about the number it starts from, never the four-operation catch-all.
const _OPS_BAND_HELP = {
    add: 'The largest sum on the page (the answer). The numbers added are smaller.',
    sub: 'The largest number you start from (the first number). The answer is always smaller.',
    add_wp: 'The largest total in a story (the answer).',
    sub_wp: 'The largest number a story starts from. The answer is always smaller.',
};
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
const _opsAddCue = (withTile = true, sub = false) => supportsOptions(
    ['touch', 'touchall', ...(withTile ? ['tile'] : []), 'frame', 'line', 'boxsign'],
    { labels: sub ? { touch: 'Touch dots: count back (on the number taken away)' } : { touch: 'Touch dots: count on (on the smaller number)' } });
const _opsMulCue = (div = false) => supportsOptions(
    ['touch', 'skip', 'array', ...(div ? ['think'] : []), 'boxsign'],
    { labels: { touch: div ? 'Touch dots: a row to touch while counting by' : 'Touch dots: count by (on one factor)',
        skip: div ? 'Skip-count strip of the number you divide by' : 'Skip-count strip (3, 6, 9 …)' } });
const _opsFactBand = (sub = false) => ({ ..._opsBand([5, 10, 12, 15, 20], 20, {
    label: 'Facts to',
    help: sub
        ? 'The largest number you start from. Independent of the fact set: "Subtract 6, facts to 10". '
            + 'A fact set larger than the band is left out.'
        : 'The largest sum. Independent of the fact set: "Add 6, facts to 10". A fact set larger '
            + 'than the band is left out.',
}), helpShort: sub ? 'The largest number you start from. Single-digit facts never pass 18.'
    : 'The largest sum. Single-digit facts never pass 18.' });
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
    'addition:add_facts': [constantOption(13, 'Add'), notationOption('+'), _opsFactBand(), ..._opsAddCue()],
    'subtraction:sub_facts': [constantOption(13, 'Subtract'), notationOption('-'), _opsFactBand(true), ..._opsAddCue(true, true)],
    'multiplication:mult_facts': [constantOption(12, 'Times', 'Multiply by'), notationOption('x'), _opsTableBand(), ..._opsMulCue(false)],
    // Dividing BY 0 is undefined, so the 0 box is the zero facts it really deals: 0 ÷ n.
    'division:div_facts': [(() => {
        const c = constantOption(12, 'Divide by');
        c.values = c.values.map(x => (x.v === 0 ? { v: 0, l: '0 (zero shared: 0 ÷ n)' } : x));
        c.zeroTitle = 'Zero divided by a number';
        return c;
    })(), notationOption('/'), _opsTableBand(), ..._opsMulCue(true)],

    // --- the four basic skills: regrouping and the unknown position ----------------------------
    // Basic + and − are grade 1 (1.OA.6, within 20): the band is 10 or 20, the sum / the number taken from.
    'addition:add': [notationOption('+'), _opsBand([10, 20], 20, { help: _OPS_BAND_HELP.add }), _opsRegroup('mixed'), _opsUnknown(),
        ...supportsOptions(['touch', 'touchall', 'startarrow', 'boxsign'], { labels: { touch: 'Touch dots: count on (on the smaller number)' } })],
    'subtraction:subtract': [notationOption('-'), _opsBand([10, 20], 20, { help: _OPS_BAND_HELP.sub }), _opsRegroup('mixed', true), _opsUnknown('answer',
        { answer: 'The answer (15 − 7 = __)', first: 'The number you start from (__ − 7 = 8)', second: 'The number taken away (15 − __ = 8)' }),
        ...supportsOptions(['touch', 'touchall', 'startarrow', 'boxsign'], { labels: { touch: 'Touch dots: count back (on the number taken away)' } })],
    'multiplication:multiply': [notationOption('x'), {
        // `ownsNumbers`: this control IS the skill's number size, so the measured Max Number is
        // not shown beside it (OPTIONS-CRITIC-R2 §5 #8 / #17: two size controls, and "Up to 100"
        // dealt 12 × 11 = 132). It stays in the model, so an old share code still decodes.
        id: 'tiles', label: 'Digits × digits', type: 'enum', default: null, group: 'difficulty', ownsNumbers: true,
        values: [{ v: null, l: 'Tables facts to 12 × 12 (follows Max Number)' }, { v: 11, l: '1-digit × 1-digit (7 × 8)' },
            { v: 21, l: '2-digit × 1-digit (34 × 6)' }, { v: 31, l: '3-digit × 1-digit (215 × 4)' },
            { v: 22, l: '2-digit × 2-digit (34 × 26)' }],
        help: 'The size of the two numbers you multiply. The first choice deals the times-table facts '
            + '(products to 144), or bigger numbers when the Max Number setting is 1,000 or more.',
    }],
    'division:divide': [notationOption('/'), {
        id: 'tiles', label: 'Digits ÷ digit', type: 'enum', default: null, group: 'difficulty', ownsNumbers: true,
        values: [{ v: null, l: 'Tables facts to 144 ÷ 12 (follows Max Number)' }, { v: 21, l: '2-digit ÷ 1-digit (84 ÷ 4)' },
            { v: 31, l: '3-digit ÷ 1-digit (756 ÷ 7)' }, { v: 41, l: '4-digit ÷ 1-digit (5,016 ÷ 8)' },
            { v: 32, l: '3-digit ÷ 2-digit (736 ÷ 23)' }],
        help: 'The size of the number you share and the number you divide by. The first choice deals '
            + 'the times-table facts backwards (numbers shared to 144).',
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
    }, ...supportsOptions(['touch', 'touchall', 'startarrow', 'steps'], { labels: {
        touch: 'Touch dots: count on, column by column', touchall: 'Touch dots: count all, column by column' } })],

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

    // --- across zeros: its own bound on the number you start from (OPTIONS-CRITIC-R2 §5 #18) ----
    // The measured "Up to 100" dealt 408 − 89: a borrow can only travel through a zero from 100
    // up, so the skill draws from at least 400. Its own band says what it really deals and bounds
    // the minuend (the answer-side number of −); owning a band hides the measured Max Number.
    'subtraction:sub_across_zeros': [_opsBand([500, 1000, 10000], 500, {
        label: 'Start numbers to',
        labels: { 500: '500 (304 − 126)', 1000: '1,000 (905 − 367)', 10000: '10,000 (5,003 − 2,847)' },
        help: 'The largest number you start from. Every item still borrows across a zero.',
    })],
};

// The 48 ranged ids (add_/sub_ × 8 bands × never / always / mixed). Each id NAMES its band and,
// for _no_regroup / _regroup, its regrouping; the option panel may never contradict the name
// (OPTIONS-CRITIC-R2 §5 #1-#3; "within N" bounds the answer):
//   - `band` offers only the bands AT OR BELOW the id's own ("Add within 50" -> 10 / 20 / 50).
//     The next id up is the harder step. A band with one value left is no control, so it is dropped.
//   - `regroup` is offered only on the _mixed ids (the ids whose name leaves it open), and not
//     within 10, where no item can regroup and stay within 10 (bridging ten is its own id,
//     add_10_regroup / sub_10_regroup, whose numbers run 11 to 18).
//   - Across zeros shows only while it can happen: regrouping on, and a band of 1,000 or more.
// A hidden value in an old share code decodes to the id's own value (normalizeOptions keeps only
// listed values, and every hidden band is above the id's own, so its own band is also the nearest
// one); gen-operations.js clamps a raw, unnormalised value the same way.
// Within 10 and 20 the item is a one-line fact (notation + a fading picture cue); from 50 up it is
// column work (a support level: traced, heads, bare).
for (const op of ['add', 'sub']) {
    const cat = op === 'add' ? 'addition' : 'subtraction';
    for (const [code, max] of Object.entries(_OPS_BANDS)) {
        for (const rg of ['no_regroup', 'regroup', 'mixed']) {
            const id = `${op}_${code}_${rg}`;
            const bridging = max === 10 && rg === 'regroup';
            // Every item regrouping within 10 is only the bridging rung, never a lower band.
            const bands = Object.values(_OPS_BANDS).filter(b => b <= max && (b !== 10 || rg !== 'regroup'));
            const opts = [];
            if (bands.length > 1) opts.push(_opsBand(bands, max, { help: _OPS_BAND_HELP[op] }));
            if (rg === 'mixed' && max > 10) {
                opts.push({
                    ..._opsRegroup('mixed', op === 'sub'),
                    // At a band of 10 no item can regroup and stay within 10.
                    appliesTo: cur => !(Number(cur.band) <= 10),
                });
            }
            if (max <= 20) {
                opts.unshift(notationOption(op === 'add' ? '+' : '-'));
                opts.push(bridging ? levelSubset([3, 2, 1], 1,
                    'Level 3 draws the two ten frames beside the split, level 2 the split frame alone '
                    + '(write both parts, then the answer), level 1 the answer only.') : _opsAddCue(false, op === 'sub'));
                if (!bridging) opts.push(...opts.pop());
            } else {
                // The column support level draws on column work only (a band of 50 or more).
                opts.push({ ..._opsColumnLevel(), appliesTo: cur => !(Number(cur.band) <= 20) });
                if (op === 'sub' && max >= 1000 && rg !== 'no_regroup') {
                    opts.push({
                        ..._opsAcrossZeros(rg === 'regroup'),
                        appliesTo: cur => cur.regroup !== 'none' && !(Number(cur.band) < 1000),
                    });
                }
            }
            P11_OPS_OPTIONS[`${cat}:${id}`] = opts;
        }
    }
    // Word problems by band: one ladder too, bands at or below the id's own. The no-picture twins
    // (_plain) keep the band only: generate-question.js strips their visual after generation, so a
    // bar model could not reach them. Pictures exist on the stories to 100; the bar model on every band.
    for (const [code, max] of Object.entries(_OPS_BANDS)) {
        if (op === 'add' && max === 10) continue;      // add_wp_10 is the K picture story (gen-counting.js)
        const bands = Object.values(_OPS_BANDS).filter(b => b <= max && (b >= 20 || (op === 'sub' && b === 10)));
        const band = bands.length > 1 ? [_opsBand(bands, max, { help: _OPS_BAND_HELP[`${op}_wp`] })] : [];
        P11_OPS_OPTIONS[`${cat}:${op}_wp_${code}`] = [...band, ...(max <= 100 ? [_opsPictures()] : []), _opsBar()];
        P11_OPS_OPTIONS[`${cat}:${op}_wp_${code}_plain`] = band;
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
        // S2: the counting checklist beside the picture (point, say, the last number is how many).
        ...supportsOptions(['steps'], { labels: { steps: 'Counting checklist (point, say, last number)' },
            help: 'A three-step checklist beside each picture: point to each one, say one number for each, '
                + 'the last number is how many. It never shows the number.' }),
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
        // Capped at the skill's name ("within 10", OPTIONS-CRITIC-R2 §5 #10): bonds to 20 are the
        // next skill up, not a value of this one.
        _opsBand([5, 10], 10, { label: 'Bonds to', help: 'The largest whole. Bonds to 5 first, then to 10.' }),
        {
            id: 'unknown', label: 'What is missing', type: 'enum', default: 'mixed',
            values: [{ v: 'answer', l: 'The whole' }, { v: 'first', l: 'The first part' }, { v: 'second', l: 'The second part' }, { v: 'mixed', l: 'Mixed' }],
        },
    ],
    // OPTIONS-CRITIC-R2 §5 #11: a number-size ladder beside the support level on both.
    'composing:make_ten': [
        _opsBand([5, 10, 20], 10, { label: 'Make', labels: { 5: 'Make 5 (a five frame)', 10: 'Make 10 (a ten frame)', 20: 'Make 20 (two ten frames, the first one full)' },
            help: 'The number the pupil makes. Make 5 comes first; make 20 fills the second ten frame.' }),
        levelSubset([1, 0], 1, 'Level 1 shows the frame; level 0 is the number sentence alone (6 + __ = 10).'),
    ],
    'composing:teen_compose': [
        _opsBand([15, 19], 19, { label: 'Teen numbers to', labels: { 15: '15 (10 and up to 5 more)', 19: '19 (10 and up to 9 more)' },
            help: 'Up to 15 keeps the loose ones to one row of five.' }),
        levelSubset([1, 0], 1, 'Level 1 shows the full ten frame and the ones; level 0 is the number sentence alone.'),
    ],
    'composing:ten_frame_build': [_k2CountTo([5, 10], 10)],
    'composing:base10_build': [_opsBand([20, 50, 99], 99, { label: 'Numbers to', help: 'The largest number to build.' })],
    'composing:base10_regroup': [_opsBand([50, 99], 99, { label: 'Numbers to', help: 'The largest number to build and trade.' })],
    'composing:base10_build_hundreds': [_opsBand([500, 999], 999, { label: 'Numbers to', help: 'The largest number to build.' })],
    'composing:tens_foundation_visual': [_opsBand([50, 90], 90, { label: 'Tens to', labels: { 50: '5 tens (50)', 90: '9 tens (90)' }, help: 'The most rods drawn.' })],
    'composing:hundreds_chart_fill': [
        _opsBand([50, 100], 100, { label: 'Numbers to', help: 'Which part of the hundreds chart the window is cut from.' }),
        {
            id: 'tiles', label: 'Empty boxes', type: 'enum', default: null, group: 'difficulty',
            values: [{ v: null, l: '1 to 3, dealt' }, { v: 1, l: '1 box' }, ...[2, 3, 4, 5, 6, 7].map(n => ({ v: n, l: `${n} boxes` }))],
            help: 'How many numbers the pupil writes in each window.',
        },
    ],
};
Object.assign(SKILL_OPTIONS, P11_K2_OPTIONS);
// ============================ end P11 · K-2 options ============================
// ===========================================================================
// COUNT-BY · MULTIPLICATION CHART · × / ÷ NUMBER LINE · NUMBER PATTERNS  (2026-09-25)
// ===========================================================================
// One contiguous block, merged into SKILL_OPTIONS below (it REPLACES the earlier entries for
// mult_chart, mult_chart_easy, nl_mult and nl_div). Every option is read by
// js/modules/gen-mult-patterns.js, which gen-operations.js / gen-algebraic.js / gen-counting.js
// call for these skills. The share-code keys of the new option ids (missing, pattern, rule,
// chart, ticks, shape) are the two-character keys of skill-option-codec.js (EXT_OPTION_KEYS).
const _cbPercent = (dflt, { nullLabel = null, help } = {}) => ({
    id: 'missing', label: 'Numbers left blank', type: 'enum', default: dflt, group: 'support',
    values: [...(nullLabel ? [{ v: null, l: nullLabel }] : []),
        ...[20, 50, 70, 80, 90, 100].map(v => ({ v, l: `${v}%` }))],
    help: help || 'How many of the numbers the pupil writes. The first number is always printed.',
});
const _cbTables = (from, label, titleVerb, help) => ({
    id: 'constant', label, type: 'set', group: 'difficulty',
    default: Array.from({ length: 13 - from }, (_, k) => k + from),
    values: Array.from({ length: 13 - from }, (_, k) => ({ v: k + from, l: String(k + from) })),
    allLabel: from === 1 ? 'All twelve' : `All (${from} to 12)`,
    titleVerb,
    help,
});
const _cbShape = (dflt) => ({
    id: 'shape', label: 'Box shape', type: 'enum', default: dflt, group: 'layout',
    values: [{ v: 'box', l: 'Boxes' }, { v: 'circle', l: 'Circles' }, { v: 'hex', l: 'Hexagons' },
        { v: 'mixed', l: 'Circles and hexagons (younger pupils)' }],
    help: 'The outline each number is written in. Outlines only, black and white; every shape is big enough to write in.',
});
const _chartBand = (dflt) => _opsBand([25, 36, 100, 144], dflt, {
    label: 'Chart size', labels: { 25: '5 × 5', 36: '6 × 6', 100: '10 × 10', 144: '12 × 12' },
    help: 'The part of the chart used: its largest factor is 5, 6, 10 or 12. The whole chart at 12 × 12 fills a page.',
});
const _chartTask = () => ({
    id: 'task', label: 'Task', type: 'enum', default: 'fill', group: 'difficulty',
    values: [{ v: 'fill', l: 'Fill in the missing products' },
        { v: 'headers', l: 'Fill in the missing row and column numbers' },
        { v: 'shade', l: 'Shade every multiple of a number' },
        { v: 'pattern', l: 'Find the pattern in one row (write the rule)' }],
    help: 'One task per page. Shade and pattern print every product; the pupil looks for the pattern.',
});
const _hopLine = (div) => [
    div ? _cbTables(2, 'Divide by', 'Divide by', 'The size of each hop (the number you divide by). Tick one or several.')
        : _cbTables(2, 'Hop size (tables)', 'Hops of', 'The size of each hop: the table the page practises. Tick one or several.'),
    _opsBand([20, 50, 100, 144], 100, {
        label: 'Line from 0 to', labels: { 20: '0 to 20', 50: '0 to 50', 100: '0 to 100', 144: '0 to 144' },
        help: (div ? 'The longest line: the number shared is never bigger.' : 'The longest line: the product is never bigger.')
            + ' A longer line leans on the tables that need it (0 to 144: the 9s to 12s first).',
    }),
    {
        id: 'ticks', label: 'Numbers on the line', type: 'enum', default: 'step', group: 'support',
        values: [{ v: 'step', l: 'Every hop (0, 3, 6, 9 …)' }, { v: 'one', l: 'Every number (0, 1, 2, 3 …), lines to 36' }],
        help: 'Every number keeps the line to 0-36 so each label has room; the pupil counts every step of each hop.',
    },
    {
        id: 'response', label: 'Task', type: 'enum', default: 'draw', group: 'difficulty',
        values: [{ v: 'draw', l: div ? 'Draw the hops, write how many (12 ÷ 3 = __)' : 'Draw the hops, write the product (4 × 3 = __)' },
            { v: 'sentence', l: div ? 'Read the hops, write the sentence (__ ÷ __ = __)' : 'Read the hops, write the sentence (__ × __ = __)' },
            { v: 'missing', l: 'Read the hops, write the missing number' }],
        help: 'One task per page. Draw is the hardest to start; reading the hops is the model.',
    },
    {
        id: 'support', label: 'Hop numbers', type: 'enum', default: 'none', group: 'support',
        values: [{ v: 'none', l: 'None' }, { v: 'numbers', l: 'Number each hop 1, 2, 3 …' }],
        help: 'A number over each drawn hop (in the model and the key) so the pupil counts the hops. None is the fade.',
    },
];
const CB_CHART_LINE_OPTIONS = {
    'multiplication:count_by_tables': [
        _cbTables(1, 'Tables', 'Count by', 'One row per ticked table, in the order below. Tick one table for a page of it, or several.'),
        _cbPercent(50),
        {
            id: 'order', label: 'Order of the rows', type: 'enum', default: 'inorder', group: 'layout',
            values: [{ v: 'inorder', l: 'In order (2, 3, 4 …)' }, { v: 'mixed', l: 'Mixed tables' }],
            help: 'In order runs the ticked tables smallest first down the page; mixed shuffles them.',
        },
        _cbShape('box'),
    ],
    'patterns:number_patterns_rule': [
        {
            // R3 (critic round 3): the skill is named "Count On, Count Back, Double", so doubling is dealt by default.
            id: 'pattern', label: 'Pattern', type: 'set', default: ['add', 'sub', 'double'], group: 'difficulty',
            values: [{ v: 'add', l: 'Count on (+2, +5, +10, +25, +100 …)' }, { v: 'sub', l: 'Count back (−2, −5, −10 …)' },
                { v: 'double', l: 'Doubling and halving' }, { v: 'times10', l: '× 10 each time' },
                { v: 'grow', l: 'Growing steps (+1, +2, +3 …)' }],
            allLabel: 'All five, mixed',
            help: 'Tick one kind for a page of it, or several to mix them (the pupil must find which rule each row uses).',
        },
        {
            id: 'places', label: 'Start in the', type: 'set', default: [1, 10], group: 'difficulty',
            values: [{ v: 1, l: 'Ones (start 1-9)' }, { v: 10, l: 'Tens (start 10-99)' },
                { v: 100, l: 'Hundreds (start 100-999)' }, { v: 1000, l: 'Thousands (start 1,000-9,999)' }],
            allLabel: 'All four',
            help: 'Where the first number starts. A row that starts in the ones stays under 100, in the tens under 1,000, '
                + 'in the hundreds or thousands under 10,000 (× 10 runs on to the thousands). Max Number lowers this only if you set it lower.',
        },
        _cbPercent(null, { nullLabel: 'None: continue it (the first 3 shown, the rest to write)',
            help: 'None asks the pupil to continue the pattern. A percentage leaves that many numbers out ANYWHERE along the row; the first number is always printed.' }),
        {
            // R3 (critic round 3): "find the rule" is the skill, so the pupil writes the rule by default.
            id: 'rule', label: 'Write the rule', type: 'bool', default: true, group: 'support',
            help: 'On hides the rule and adds a Rule box for the pupil to fill. Off prints the rule above the row ("Rule: count on by 5.").',
        },
        _cbShape('box'),
    ],
    'multiplication:mult_chart': [
        {
            id: 'chart', label: 'Chart', type: 'enum', default: 'window', group: 'layout',
            values: [{ v: 'window', l: 'A window of the chart (4 rows × 5 columns)' },
                { v: 'whole', l: 'The whole chart (up to the chart size)' }],
            help: 'A window is a small piece cut from anywhere in the chart. The whole chart at 12 × 12 is one item per page.',
        },
        _chartBand(144),
        _cbPercent(null, { nullLabel: 'A few (3 in a window, half of a whole chart)',
            help: 'How many of the products (or, for Task: row and column numbers, the factors) are left blank. 100% is a blank chart to fill in.' }),
        _cbTables(1, 'Tables with blanks', 'Times tables', 'Only the rows and columns of the ticked tables have blanks (tick 7 and 8 to practise those two).'),
        _chartTask(),
    ],
    'multiplication:mult_chart_easy': [
        levelSubset([2, 1, 0], 2, 'The same chart every time: level 2 leaves 8 cells to fill, level 1 leaves 16, '
            + 'level 0 leaves 30. Level 2 never blanks the 1 row or the 1 column.'),
        _chartBand(144),
        _cbPercent(null, { nullLabel: 'As the support level sets it (8, 16 or 30 cells)',
            help: 'A percentage of the chart instead of the support level\'s count. 100% is a blank chart to fill in completely.' }),
        _cbTables(1, 'Tables with blanks', 'Times tables', 'Only the rows and columns of the ticked tables have blanks.'),
        _chartTask(),
    ],
    'multiplication:nl_mult': _hopLine(false),
    'division:nl_div': _hopLine(true),
    'counting:number_seq_fill': [
        ...(SKILL_OPTIONS['counting:number_seq_fill'] || []).filter(o => o.id !== 'shape'),
        _cbShape('mixed'),
    ],
};
Object.assign(SKILL_OPTIONS, CB_CHART_LINE_OPTIONS);
// ======================= end count-by · chart · number line · patterns =======================

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
// P10 · TIME + MONEY  (design/research/time-money.md §2.5, owner rulings of 2026-09-25 in §20)
// ===========================================================================
// One contiguous block, merged into SKILL_OPTIONS below. Every option here is READ by
// js/modules/gen-time-money.js (the P10 generator, which gen-measurement.js hands its time and
// money ids to); an option the generator ignores is not declared (SCC-P11). Defaults are the
// stand-alone values (R2).
//
// THE OWNER'S RULINGS THESE CARRY (§20):
//   Q1  `currency` on every money skill: Plain numbers (the DEFAULT) / Qatari riyal / US dollar.
//       The coin drawing never changes with it (generic value circles, RP-110); only the value set
//       (the 50 coin at QR only, Q2), the notes and the unit words do.
//   Q4  `response`: write the time / draw the hands, on each clock-reading skill. No new skill;
//       the hidden 30% "Set the clock" branch is gone.
//   Q5  elapsed time: the timeline is the working line (`support`); the answer is `__ h __ min`,
//       or total minutes (`response: minutes`, grade 4); two clock faces are `notation` on the
//       "Time Between Two Clocks" skills.
//   Q11 `words`: both spoken forms — "5 minutes past 2" / "five past two", and "two-oh-five".
//       Pupils always WRITE digital.
//   Q6, Q7, Q10, Q12 bands and coin counts, quarter past / to as separate steps, ordering within
//       one morning by default, QR coin pages deal 25 and 50 first.
const _tmResponse = () => ({
    id: 'response', label: 'How the pupil answers', type: 'enum', default: 'write', group: 'layout',
    values: [{ v: 'write', l: 'Write the time' }, { v: 'draw', l: 'Draw the hands' }],
    help: 'One way per page. "Draw the hands" prints an empty clock face big enough to draw two hands in pencil; on screen the pupil sets the hands.',
});
const _tmReview = () => ({
    id: 'review', label: 'Review earlier times', type: 'enum', default: 'none', group: 'difficulty',
    values: [{ v: 'none', l: 'None: only this step\'s times' }, { v: 'some', l: 'Some (1 in 6 from the steps before)' }],
    help: 'A step deals only its new clock positions. "Some" mixes in one earlier time in every six.',
});
const _tmFace = () => ({
    id: 'support', label: 'Minute ring', type: 'enum', default: 'plain', group: 'support',
    values: [{ v: 'plain', l: 'Only on Model and Guided pages' }, { v: 'ring', l: 'On every page (5, 10, 15 ... round the face)' }],
    help: 'The ring of minute numbers is a hint: it fades on Independent pages unless you keep it here.',
});
const _tmStimulus = () => ({
    id: 'stimulus', label: 'What the pupil reads', type: 'enum', default: 'clock', group: 'difficulty',
    values: [
        { v: 'clock', l: 'A clock (write) or digital time (draw)' },
        { v: 'words', l: 'Words: "5 minutes past 2"' },
        { v: 'words-past', l: 'Words: "five past two"' },
        { v: 'words-oh', l: 'Words: "two-oh-five"' },
    ],
    help: 'The time in words is its own step; say it the way your class says it (ruling Q11). The pupil always writes the digital time.',
});
const _tmWords = () => ({
    id: 'words', label: 'Time in words, said as', type: 'enum', default: 'numerals', group: 'difficulty',
    values: [
        { v: 'numerals', l: '"5 minutes past 2"' },
        { v: 'past', l: '"five past two"' },
        { v: 'oh', l: '"two-oh-five"' },
    ],
    help: 'Say it the way your class says it. The written answer is always digital (2:05).',
});
// The numbers printed on the clock face (P12 self-score O3): all twelve is the structural face;
// 12, 3, 6 and 9 only, then 12 only, are the fade a pupil who reads by position works towards.
const _tmNumerals = () => ({
    id: 'numerals', label: 'Numbers on the clock', type: 'enum', default: 'all', group: 'support',
    values: [{ v: 'all', l: 'All 12 numbers' }, { v: 'quarters', l: '12, 3, 6 and 9 only' }, { v: 'twelve', l: '12 only' }],
    help: 'Fewer numbers is harder: the pupil reads the hands by their position.',
});
// Which coins a money page may use (P12 self-score O1): the currency's usual coins, or a chosen few.
// All four ticked (the default) is "the currency's usual coins": 1, 5, 10, 25, and at Qatari riyal
// 25 and 50 first (ruling Q12). A subset uses exactly those coins.
const _tmCoinSet = (help) => ({
    id: 'values', label: 'Coins used', type: 'set', default: [1, 5, 10, 25], group: 'difficulty',
    values: [{ v: 1, l: '1' }, { v: 5, l: '5' }, { v: 10, l: '10' }, { v: 25, l: '25' }],
    allLabel: 'The currency\'s usual coins (at Qatari riyal: 25 and 50)',
    help: help || 'All ticked uses the usual coins. Tick a few to use only those.',
});
const _tmPrecision = (dflt = 5, withOne = true) => ({
    id: 'precision', label: 'Times to the nearest', type: 'enum', default: dflt, group: 'difficulty',
    values: [
        { v: 60, l: 'Hour' }, { v: 30, l: 'Half hour' }, { v: 15, l: 'Quarter hour' }, { v: 5, l: '5 minutes' },
        ...(withOne ? [{ v: 1, l: '1 minute' }] : []),
    ],
    help: 'The clock positions the page uses.',
});
// P10 critic round 3: the skills are named "... Later or Earlier", so the default page deals both
// (alternately); one direction per page is a choice. `both` is appended, so older values keep
// their place in a share code.
const _tmDir = () => ({
    id: 'dir', label: 'Later or earlier', type: 'enum', default: 'both', group: 'difficulty',
    values: [{ v: 'later', l: 'Later (find the end)' }, { v: 'earlier', l: 'Earlier (find the start)' }, { v: 'both', l: 'Both, mixed on the page' }],
    help: '"Earlier" counts back, which is harder. Choose one direction for a page of it alone.',
});
const _tmSupport = () => ({
    id: 'support', label: 'Time line', type: 'enum', default: 'labels', group: 'support',
    values: [
        { v: 'labels', l: 'Time line with the hours written' },
        { v: 'pupil', l: 'Time line, the pupil writes the hours' },
        { v: 'none', l: 'No time line' },
    ],
    help: 'The pupil hops the hours, then the minutes, on the line. Most support first.',
});
const _tmSpan = (values, dflt) => ({
    id: 'hours', label: 'Longest time', type: 'enum', default: dflt, group: 'difficulty',
    values: values.map(v => ({ v, l: `${v} ${v === 1 ? 'hour' : 'hours'}` })),
    help: 'The longest time on the page. The time line is drawn this long, so it never shows where the answer is.',
});
const _tmStep = (values, dflt) => ({
    id: 'step', label: 'Minutes in steps of', type: 'enum', default: dflt, group: 'difficulty',
    values: values.map(v => ({ v, l: `${v} ${v === 1 ? 'minute' : 'minutes'}` })),
    help: 'The minutes each time uses. 5 and 1 are harder.',
});
const _tmNoon = () => ({
    id: 'noon', label: 'Cross 12 noon', type: 'enum', default: 'never', group: 'difficulty',
    values: [{ v: 'never', l: 'Never' }, { v: 'seeded', l: 'Some items cross noon (a.m. and p.m. printed)' }],
    help: 'Going past 12 is its own hard case: 11:30 a.m. and 2 hours is 1:30 p.m.',
});
// `usd: false` for a skill whose page shows only coins and no unit word (money_compare): US
// coins are drawn exactly like Plain numbers there, so the value would change nothing.
const _tmCurrency = ({ usd = true } = {}) => ({
    id: 'currency', label: 'Currency', type: 'enum', default: 'plain', group: 'layout',
    values: [
        { v: 'plain', l: 'Plain numbers (coins 1, 5, 10, 25; no sign)' },
        { v: 'qar', l: 'Qatari riyal (dirham coins 1-50; riyal notes)' },
        ...(usd ? [{ v: 'usd', l: 'US dollar (cent coins; dollar notes)' }] : []),
    ],
    help: 'The coins are the same plain value circles in all three. A currency adds its unit words, its notes and, at Qatari riyal, the 50 coin.',
});
const _tmMoneyBand = (values, dflt) => ({
    id: 'band', label: 'Totals to', type: 'enum', default: dflt, group: 'difficulty',
    values: values.map(v => ({ v, l: v < 100 ? String(v) : v === 100 ? '100 (one riyal or dollar)' : `${v / 100} riyals or dollars` })),
    help: 'The biggest total on the page, counted in coin units (100 is one riyal or one dollar).',
});
const _tmCents = (dflt) => ({
    id: 'step', label: 'Prices in steps of', type: 'enum', default: dflt, group: 'difficulty',
    values: [
        { v: 100, l: 'Whole riyals or dollars (no point)' }, { v: 25, l: '25 dirhams or cents (2.25, 4.50)' },
        { v: 5, l: '5 dirhams or cents (3.45)' }, { v: 1, l: 'Any amount (3.47)' },
    ],
    help: 'Whole units first; the point comes in with 25s, then 5s, then any amount.',
});
const _tmRegroup = (dflt) => ({ ...regroupOption(), default: dflt, group: 'difficulty',
    help: 'Regrouping (a column makes 10 or more, or needs to borrow across the point) is the harder step.' });

const _TM_READ = ['time_hour', 'time_half_hour', 'time_quarter', 'time_5min', 'time_1min'];
const P10_TM_OPTIONS = {
    'measurement:time_hour': [_tmResponse(), _tmStimulus(), _tmNumerals()],
    'measurement:time_half_hour': [_tmResponse(), _tmReview(), _tmStimulus(), _tmNumerals()],
    'measurement:time_quarter': [_tmResponse(), {
        id: 'quarters', label: 'Quarter past or quarter to', type: 'set', default: ['past', 'to'], group: 'difficulty',
        values: [{ v: 'past', l: 'Quarter past (:15)' }, { v: 'to', l: 'Quarter to (:45)' }],
        allLabel: 'Both, alternating',
        help: 'Quarter to counts back from the next hour; it is a step of its own. Tick one for a single-step page.',
    }, _tmReview(), _tmStimulus(), _tmNumerals()],
    'measurement:time_5min': [_tmResponse(), _tmReview(), _tmFace(), _tmStimulus(), _tmNumerals()],
    'measurement:time_1min': [_tmResponse(), _tmReview(), _tmFace(), _tmStimulus(), _tmNumerals()],
    'measurement:time_analog_digital': [{
        id: 'dir', label: 'Which way', type: 'enum', default: 'to-digital', group: 'difficulty',
        values: [{ v: 'to-digital', l: 'Clock to digital (write the time)' }, { v: 'to-analog', l: 'Digital to clock (check one of three)' }],
        help: 'One direction per page.',
    }, _tmPrecision(5), _tmNumerals()],
    'measurement:time_match_clock': [_tmPrecision(5), _tmWords(), _tmNumerals()],
    'measurement:elapsed_hour': [_tmDir(), _tmSpan([3, 5], 3), _tmSupport(), _tmResponse()],
    'measurement:elapsed_30min': [_tmDir(), _tmSupport()],
    'measurement:elapsed_15min': [_tmDir(), {
        id: 'step', label: 'How many minutes', type: 'set', default: [15, 30, 45], group: 'difficulty',
        values: [{ v: 15, l: '15 minutes' }, { v: 30, l: '30 minutes' }, { v: 45, l: '45 minutes' }],
        allLabel: '15, 30 and 45, mixed',
        help: 'The name promises all three. Tick 15 alone for a first page of it.',
    }, _tmSupport()],
    'measurement:elapsed_mixed': [_tmSpan([2, 3, 5], 3), _tmStep([15, 5, 1], 15), _tmSupport(), _tmNoon()],
    'measurement:elapsed_find_duration': [{
        id: 'response', label: 'How the pupil answers', type: 'enum', default: 'hm', group: 'layout',
        values: [{ v: 'hm', l: 'Hours and minutes (__ h __ min)' }, { v: 'minutes', l: 'Total minutes (grade 4)' }],
        help: '"Total minutes" adds the conversion 1 hour = 60 minutes (4.MD.A.1).',
    }, _tmSpan([2, 3, 5], 3), _tmStep([15, 5, 1], 15), _tmSupport(), _tmNoon()],
    'measurement:elapsed_find_start': [_tmSpan([2, 3, 5], 3), _tmStep([15, 5, 1], 15), _tmSupport(), _tmNoon()],
    // FIVE CONTROLS (option-panel round 3, OPTIONS-CRITIC-R2 §5 #6 / #16). It had seven, and two
    // of them set the size of the page against each other ("Totals to 25" beside "Notes, totals
    // to 500"). Now "What to count" says WHAT is counted, "Totals to" alone says how big, and the
    // coins' arrangement and their count-by-five dots are one "Coins set out" ladder, most help
    // first. "Coins at most" is retired: 500 deals up to ten coins in a row. The old kinds, the
    // dots and the coin count stay hidden so an old code decodes (_mcFold).
    'measurement:money_count': [_tmCurrency(), {
        id: 'kind', label: 'What to count', type: 'enum', default: 'like', group: 'difficulty',
        values: [
            { v: 'like', l: 'Coins, all the same (six 10s)' }, { v: 'two', l: 'Coins, two kinds' },
            { v: 'mixed', l: 'Coins, mixed' }, { v: 'note', l: 'Notes' },
            { v: 'both', l: 'Notes and coins (write two numbers)' },
        ],
        help: 'Teach them in this order: one kind of coin, two kinds, mixed; then notes; then notes and coins together.',
    }, {
        ..._tmMoneyBand([20, 25, 50, 100, 500], 100),
        values: [20, 25, 50, 100, 500].map(v => ({ v, l: String(v) })),
        helpShort: 'The biggest number the pupil writes. Coins count in coin units (100 make one riyal or dollar); notes count in whole riyals or dollars.',
        help: 'The biggest total the pupil writes. Coins are counted in coin units (100 is one riyal or one dollar), notes in whole riyals or dollars, so "100" is up to one dollar of coins, or up to 100 dollars of notes. 500 lets a coin page hold up to ten coins in a row.',
    }, _tmCoinSet('All ticked uses the usual coins. Tick 10 alone for "count 10s". The coins in "Notes and coins" come from here too.'), {
        id: 'order', label: 'Coins set out', type: 'enum', default: 'largest', group: 'support',
        values: [
            { v: 'largest-dots', l: 'Biggest first, count-by-five dots on every page' },
            { v: 'largest', l: 'Biggest first (dots on Model and Guided pages only)' },
            { v: 'scrambled-dots', l: 'Scattered, with the count-by-five dots' },
            { v: 'scrambled', l: 'Scattered: the pupil finds the biggest first' },
        ],
        helpShort: 'Most help first. Dots under each coin count by fives; scattered coins make the pupil find the biggest first.',
        help: 'Dots under the number on each coin, one for each 5, are a hint that fades on Independent pages unless kept here. Scattered coins are harder: the pupil has to find the biggest coin first. Notes are always set out biggest first.',
    },
    // ---- hidden: the retired controls, kept so an old code decodes (folded by _mcFold) ----
    { id: 'tiles', hidden: true, label: 'Coins at most', type: 'enum', default: 6, values: [{ v: 6, l: '6' }, { v: 10, l: '10' }] },
    { id: 'support', hidden: true, label: 'Count-by-five dots', type: 'enum', default: 'auto',
        values: [{ v: 'auto', l: 'auto' }, { v: 'dots', l: 'dots' }] }],
    'measurement:money': [_tmCurrency(), _tmMoneyBand([500, 2000, 10000], 2000), _tmCents(100), _tmRegroup('none')],
    'measurement:money_change': [_tmCurrency(), _tmMoneyBand([100, 500, 2000, 10000], 500), _tmCents(25), _tmRegroup('mixed'), {
        id: 'paid', label: 'Paid with', type: 'enum', default: 'unit', group: 'difficulty',
        values: [{ v: 'unit', l: 'The next whole riyal or dollar' }, { v: 'note', l: 'The next note (a 10 for 7.40)' }],
        help: 'Change from a note is the harder step.',
    }],
    'measurement:equiv_coin_sets': [_tmCurrency(), _tmMoneyBand([25, 50, 100], 50), _tmCoinSet()],
    'measurement:make_change_least_coins': [_tmCurrency(), _tmMoneyBand([25, 50, 100], 50), _tmCoinSet('The rows of the table: the currency\'s coins, or only the ones you tick. Amounts are always makeable with the smallest ticked coin.')],
    'measurement:enough_money': [_tmCurrency(), _tmMoneyBand([25, 50, 100, 500], 100), {
        id: 'gap', label: 'How close to the price', type: 'enum', default: 'far', group: 'difficulty',
        values: [{ v: 'far', l: 'Far (10 or more away)' }, { v: 'near', l: 'Near (1 to 5 away)' }],
        help: 'Near the price is harder: the pupil must count exactly.',
    }, _tmCoinSet()],
    'measurement:coin_value': [_tmCurrency(), {
        id: 'task', label: 'Task', type: 'enum', default: 'find', group: 'layout',
        values: [{ v: 'find', l: 'Find every coin worth N' }, { v: 'order', l: 'Put notes in order, least first' }],
        help: '"Put notes in order" is the Qatari-currency workbook row; it uses the notes of the currency.',
    }],
    'measurement:money_notation': [_tmCurrency(), {
        id: 'task', label: 'The pupil reads', type: 'enum', default: 'collection', group: 'difficulty',
        values: [{ v: 'collection', l: 'Notes and coins' }, { v: 'words', l: 'The amount in words' }],
        help: 'Words ("2 riyals 50 dirhams") come after reading notes and coins. With a currency the sign (QR, $) is printed before the slot.',
    }],
    'measurement:money_compare': [_tmCurrency({ usd: false }), _tmMoneyBand([25, 50, 100], 100), {
        id: 'response', label: 'How the pupil answers', type: 'enum', default: 'ring', group: 'layout',
        values: [{ v: 'ring', l: 'Check the one with more' }, { v: 'sign', l: 'Write <, > or =' }],
        help: 'Writing the sign is the next step.',
    }, _tmCoinSet()],
    'measurement:clock_parts': [{
        id: 'task', label: 'Task', type: 'enum', default: 'numerals', group: 'layout',
        values: [{ v: 'numerals', l: 'Write the missing numbers' }, { v: 'hands', l: 'Which is the hour hand?' }],
        help: 'One task per page.',
    }],
    'measurement:time_fives_ring': [{
        id: 'task', label: 'Boxes to fill', type: 'enum', default: 'missing', group: 'support',
        values: [{ v: 'missing', l: 'Some filled in, write the rest' }, { v: 'all', l: 'All empty, write them all' }],
        help: 'Filling every box is the fade.',
    }],
    'measurement:mixed_time': [{
        // Critic round 3: "Mixed time skills" was read-the-clock only. The default now mixes
        // reading, matching and elapsed time (hours and 30 minutes later or earlier).
        id: 'members', label: 'Mix these skills', type: 'set', default: [..._TM_READ, 'time_match_clock', 'elapsed_30min', 'elapsed_hour'], group: 'difficulty',
        values: [
            { v: 'time_hour', l: 'Time to the hour' }, { v: 'time_half_hour', l: 'Half hour' },
            { v: 'time_quarter', l: 'Quarter hour' }, { v: 'time_5min', l: '5 minutes' }, { v: 'time_1min', l: '1 minute' },
            { v: 'time_analog_digital', l: 'Analog and digital' }, { v: 'time_match_clock', l: 'Find the clock' },
            { v: 'elapsed_30min', l: '30 minutes later or earlier' }, { v: 'elapsed_hour', l: 'Hours later or earlier' },
        ],
        allLabel: 'All of them',
        // Share-code tokens in the pool scheme (skill-options-pools.js): the category letter "M"
        // plus the member's position in SKILLS.measurement, two base-36 characters. Positions are
        // stable: a skill is never spliced out of its category.
        tokens: { time_hour: 'M00', time_half_hour: 'M01', time_quarter: 'M02', time_5min: 'M03', time_1min: 'M04',
            time_analog_digital: 'M05', time_match_clock: 'M06', elapsed_30min: 'M0B', elapsed_hour: 'M0C' },
        tokenWidth: 3,
        help: 'The review deals only the ticked skills, each at its own options.',
    }],
};
for (const id of ['order_clocks_analog_asc', 'order_clocks_analog_desc', 'order_clocks_digital_asc', 'order_clocks_digital_desc']) {
    P10_TM_OPTIONS[`measurement:${id}`] = [{
        id: 'tiles', label: 'How many clocks', type: 'enum', default: 3, group: 'difficulty',
        values: [{ v: 3, l: '3' }, { v: 4, l: '4' }, { v: 5, l: '5 (sizes S and M)' }],
        help: 'More clocks is harder. Five clocks fit a row only at sizes S and M.',
    }, _tmPrecision(id.indexOf('analog') !== -1 ? 30 : 15, false), ...(id.indexOf('analog') !== -1 ? [_tmNumerals()] : []), {
        id: 'noon', label: 'Times from', type: 'enum', default: 'never', group: 'difficulty',
        values: [{ v: 'never', l: 'One morning or one afternoon' }, { v: 'across', l: 'Across 12 o\'clock (a.m. and p.m. printed)' }],
        help: '12:30 comes before 1:00 in the afternoon but not at night: crossing 12 is its own step.',
    }];
}
for (const id of ['elapsed_visual_easy', 'elapsed_visual_medium', 'elapsed_visual_hard']) {
    P10_TM_OPTIONS[`measurement:${id}`] = [{
        id: 'notation', label: 'The start and end are shown on', type: 'enum', default: 'analog', group: 'difficulty',
        values: [{ v: 'analog', l: 'Two clock faces' }, { v: 'digital', l: 'Two digital times' }, { v: 'mixed', l: 'One of each' }],
        help: 'The pupil reads both times, then hops on the time line.',
    }, _tmSupport()];
}
Object.assign(SKILL_OPTIONS, P10_TM_OPTIONS);
// money_count's retired values, in the five controls: the notes kinds carried their own totals
// (to 20 / 100 / 500), the dots were their own control, and "Coins at most: 10" had its own.
OPTION_FOLDS['measurement:money_count'] = (raw) => {
    const NOTES = { notes: ['note', 20], notes100: ['note', 100], notes500: ['note', 500], 'notes-coins': ['both', 20] };
    if (NOTES[raw.kind]) { const [k, b] = NOTES[raw.kind]; raw.kind = k; raw.band = b; }
    if (raw.support === 'dots') {
        const base = raw.order === 'scrambled' || raw.order === 'scrambled-dots' ? 'scrambled' : 'largest';
        raw.order = `${base}-dots`;
    }
    delete raw.support;
    // An old "Coins at most: 10" stays in the hidden `tiles`, which the generator still honours
    // (Reset to default clears it); a new page gets ten coins from "Totals to 500".
    return raw;
};

/** The P10 ids js/modules/gen-time-money.js generates (the audit's `tm` family). */
export const TM_SKILLS = Object.freeze([
    ..._TM_READ, 'time_analog_digital', 'time_match_clock',
    'order_clocks_analog_asc', 'order_clocks_analog_desc', 'order_clocks_digital_asc', 'order_clocks_digital_desc',
    'elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed', 'elapsed_find_duration',
    'elapsed_visual_easy', 'elapsed_visual_medium', 'elapsed_visual_hard',
    'money_count', 'money', 'equiv_coin_sets', 'enough_money', 'make_change_least_coins', 'mixed_time',
    'clock_parts', 'time_fives_ring', 'time_sense', 'elapsed_find_start', 'coin_value', 'money_notation', 'money_change', 'money_compare',
]);
// ============================ end P10 · time + money ============================
// FUNCTION TABLES (function_table_easy / function_table_hard, 2026-09-25)
// ===========================================================================
// One contiguous block. Every option is READ by js/modules/gen-function-table.js (ftOptions); an
// option the generator ignores is not declared (SCC-P11). The two skills share the schema and
// differ only in their defaults: easy is one + / − step with small numbers, in order, filling
// the Out column; hard is every operation, one- and two-step rules, inputs out of order, finding
// the rule and testing it on a Check row.
//
// THE BAND caps every number in the table — In, Out, and the rule's own numbers — the same way
// the place-value band does (pvCap): Max Number only lowers it when the teacher has set Max
// Number below the band.
//
// FIVE CONTROLS (option-panel round 3, OPTIONS-CRITIC-R2 §5 #7). The panel had nine. Nothing a
// teacher could choose is lost; the nine are folded into five:
//   Task      the task and the Check row          (was task + response)
//   Rules     the rule kinds, one- and two-step   (was ops + step)
//   Numbers to                                     (unchanged)
//   Table     the rows and the In-number order    (was tiles + order)
//   Support   frame / line, with or without the machine picture   (was support + pictures)
// The old seven stay hidden so a code written before still decodes; _ftFold rewrites them.
const _FT_TASKS = [
    ['outputs', 'Complete the table (the rule is given, write each Out)'],
    ['rule', 'Find the rule (every row given, write the rule)'],
    ['inputs', 'Find the missing In numbers (work the rule backward)'],
    ['mixed', 'Mixed blanks (some In and some Out missing)'],
];
const _FT_RULES = [
    ['+', '+ (x + 7)'], ['-', '− (x − 3)'], ['x', '× (x × 4)'], ['/', '÷ (x ÷ 2, exact only)'],
    ['x+', 'Two steps: × then + (x × 2 + 1)'], ['x-', 'Two steps: × then − (x × 3 − 2)'],
    ['/+', 'Two steps: ÷ then + (x ÷ 2 + 5)'], ['/-', 'Two steps: ÷ then − (x ÷ 2 − 1)'],
];
/** A table value: rows × 10, then 1 = In numbers in order, 2 = out of order (41 = 4 rows, in order). */
export const ftTableValue = (rows, scrambled) => rows * 10 + (scrambled ? 2 : 1);
const _ftOptions = (easy) => [
    {
        id: 'ftTask', label: 'Task', type: 'enum', default: easy ? 'outputs' : 'rule-check', group: 'difficulty',
        values: [
            ..._FT_TASKS.flatMap(([v, l]) => [{ v, l }, { v: `${v}-check`, l: `${l.replace(/ \(.*$/, '')}, then a Check row` }]),
            { v: 'make', l: 'Make your own (the rule is given, the pupil chooses the In numbers)' },
        ],
        helpShort: 'One task per page. A Check row adds one more In number under the table to test the rule on.',
        help: 'One task per page, so the instruction says one thing. A Check row gives one more In number under the table to test the rule on. "Make your own" accepts any rows that follow the rule.',
    },
    {
        id: 'ftRules', label: 'Rules', type: 'set', default: easy ? ['+', '-'] : _FT_RULES.map(([v]) => v), group: 'difficulty',
        values: _FT_RULES.map(([v, l]) => ({ v, l })),
        allLabel: 'Every kind, one- and two-step',
        help: 'The page deals the ticked kinds of rule in turn. One-step rules come first; a two-step rule multiplies or divides, then adds or subtracts. Division always divides exactly.',
    },
    {
        id: 'band', label: 'Numbers to', type: 'enum', default: easy ? 20 : 100, group: 'difficulty',
        values: [10, 20, 50, 100, 1000].map((v) => ({ v, l: v.toLocaleString('en-US') })),
        help: 'The biggest number anywhere in the table. Max Number only lowers it if you set Max Number below this.',
    },
    {
        id: 'ftTable', label: 'Table', type: 'enum', default: easy ? ftTableValue(4, false) : ftTableValue(3, true), group: 'difficulty',
        values: [3, 4, 5].flatMap((r) => [
            { v: ftTableValue(r, false), l: `${r} rows, In numbers in order` },
            { v: ftTableValue(r, true), l: `${r} rows, In numbers out of order` },
        ]),
        helpShort: 'Three rows are enough to find a rule. Out of order stops the pupil just reading down the Out column.',
        help: 'Three rows are enough to find a rule. Out of order stops the pupil just following the Out column down. A tall table fits four to a page instead of six.',
    },
    {
        id: 'support', label: 'Support', type: 'enum', default: 'frame', group: 'support',
        values: [
            { v: 'frame', l: 'Frame and machine picture' },
            { v: 'frame-bare', l: 'Frame only' },
            { v: 'line', l: 'Line and machine picture' },
            { v: 'line-bare', l: 'Line only (no help)' },
        ],
        helpShort: 'Most help first. The frame shows the rule on each In number; the line is the fade.',
        help: 'The frame: completing, a middle column shows "3 + 7"; finding the rule, a circle for the sign and a box for the number. '
            + 'The machine picture is a small In → [rule] → Out drawing above the table. The line is the fade.',
    },
    // ---- hidden: the retired controls, kept so an old code decodes (folded by _ftFold) ----
    { id: 'task', hidden: true, label: 'Task', type: 'enum', default: easy ? 'outputs' : 'rule', group: 'layout',
        values: ['outputs', 'rule', 'inputs', 'mixed', 'make'].map((v) => ({ v, l: v })) },
    { id: 'ops', hidden: true, label: 'Operations', type: 'set', default: easy ? ['+', '-'] : ['+', '-', 'x', '/'],
        values: ['+', '-', 'x', '/'].map((v) => ({ v, l: v })) },
    { id: 'step', hidden: true, label: 'Steps', type: 'set', default: easy ? [1] : [1, 2], values: [{ v: 1, l: '1' }, { v: 2, l: '2' }] },
    { id: 'tiles', hidden: true, label: 'Rows', type: 'enum', default: easy ? 4 : 3, values: [3, 4, 5].map((v) => ({ v, l: String(v) })) },
    { id: 'order', hidden: true, label: 'In numbers', type: 'enum', default: easy ? 'inorder' : 'scrambled',
        values: [{ v: 'inorder', l: 'inorder' }, { v: 'scrambled', l: 'scrambled' }] },
    { id: 'pictures', hidden: true, label: 'Machine picture', type: 'bool', default: true },
    { id: 'response', hidden: true, label: 'Check row', type: 'enum', default: easy ? 'standard' : 'check',
        values: [{ v: 'standard', l: 'standard' }, { v: 'check', l: 'check' }] },
];
const _FT_LEGACY = ['task', 'ops', 'step', 'tiles', 'order', 'pictures', 'response'];
const _has = (o, k) => Object.prototype.hasOwnProperty.call(o, k) && o[k] !== undefined;
/** The fold: an old code's task / ops / step / tiles / order / pictures / response, in the new controls. */
const _ftFold = (easy) => (raw) => {
    const old = {};
    for (const d of _ftOptions(easy)) if (d.hidden) old[d.id] = d.default;
    const given = _FT_LEGACY.filter((k) => _has(raw, k) && JSON.stringify(raw[k]) !== JSON.stringify(old[k]));
    if (!given.length) { for (const k of _FT_LEGACY) delete raw[k]; return raw; }
    const eff = { ...old };
    for (const k of given) eff[k] = raw[k];
    const touched = (...ks) => ks.some((k) => given.includes(k));
    if (touched('task', 'response') && !_has(raw, 'ftTask')) {
        raw.ftTask = eff.task === 'make' || eff.response !== 'check' ? eff.task : `${eff.task}-check`;
    }
    if (touched('ops', 'step') && !_has(raw, 'ftRules')) {
        const ops = Array.isArray(eff.ops) && eff.ops.length ? eff.ops : ['+', '-', 'x', '/'];
        const steps = Array.isArray(eff.step) && eff.step.length ? eff.step : [1, 2];
        const out = [];
        if (steps.includes(1)) out.push(...ops);
        if (steps.includes(2)) {
            const M = ops.filter((o) => o === 'x' || o === '/'), A = ops.filter((o) => o === '+' || o === '-');
            for (const m of (M.length ? M : ['x'])) for (const a of (A.length ? A : ['+'])) out.push(m + a);
        }
        raw.ftRules = _FT_RULES.map(([v]) => v).filter((v) => out.includes(v));
    }
    if (touched('tiles', 'order') && !_has(raw, 'ftTable')) {
        const rows = [3, 4, 5].includes(Number(eff.tiles)) ? Number(eff.tiles) : 4;
        raw.ftTable = ftTableValue(rows, eff.order === 'scrambled');
    }
    if (touched('pictures') && eff.pictures === false) {
        const sup = raw.support === 'line' ? 'line' : raw.support === 'frame' || !_has(raw, 'support') ? 'frame' : null;
        if (sup) raw.support = `${sup}-bare`;
    }
    for (const k of _FT_LEGACY) delete raw[k];
    return raw;
};
SKILL_OPTIONS['algebra:function_table_easy'] = _ftOptions(true);
SKILL_OPTIONS['algebra:function_table_hard'] = _ftOptions(false);
OPTION_FOLDS['algebra:function_table_easy'] = _ftFold(true);
OPTION_FOLDS['algebra:function_table_hard'] = _ftFold(false);
// ============================ end function tables ============================
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
// NEW OPTION IDS travel in share codes under the block-5 digit + letter keys (skill-option-keys.js,
// the one key registry): members 5A, forms 5B, denoms 5C, model 5D, labels 5E, precision 5F,
// coins 5G, shapes 5H, points 5I, scale 5J, digits 5K, units 5L, parts 5M. Every other control reuses an existing id
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

// The fifty vocabulary skills share one panel: which kind of item the page asks. The drag
// matcher is not offered — it cannot sit on an online worksheet page, so a page of it alone
// would fail there; it stays in the mix when every kind is ticked.
// O2 (2026-09-25): the easier / harder ladder the fifty panels lacked.
//   wordSet  how many words the page draws from — the first 6 / 10 / 16 of the skill's list, which
//            data-vocabulary.js keeps core-first (Count, Number, Zero … before Ten Frame, Number
//            Bond), or every word. Read by gen-vocabulary.js. A value is offered only when the
//            list is longer than it (VOCAB_LIST_SIZE).
// A smaller pick list ("2 or 3 answers") was tried and withdrawn: the printed item is written, not
// picked, so it changed the screen and not the paper (OPTIONS-RUBRIC OC3).
export const VOCAB_LIST_SIZE = Object.freeze({
    K: 100, 1: 100, 2: 100, 3: 102, 4: 100, 5: 100, 6: 125,
    K_operations: 7, K_counting: 33, K_geometry: 25, K_data: 7, K_algebra: 6, K_measurement: 22,
    '1_operations': 23, '1_counting': 21, '1_geometry': 19, '1_data': 9, '1_algebra': 10, '1_measurement': 18,
    '2_operations': 27, '2_counting': 14, '2_fractions': 6, '2_geometry': 15, '2_data': 6, '2_algebra': 10, '2_measurement': 22,
    '3_operations': 24, '3_fractions': 16, '3_geometry': 18, '3_data': 10, '3_algebra': 15, '3_measurement': 19,
    '4_operations': 15, '4_fractions': 24, '4_geometry': 21, '4_data': 10, '4_algebra': 15, '4_measurement': 15,
    '5_operations': 15, '5_fractions': 25, '5_geometry': 21, '5_data': 10, '5_algebra': 15, '5_measurement': 14,
    '6_operations': 16, '6_fractions': 25, '6_geometry': 29, '6_data': 21, '6_algebra': 21, '6_measurement': 10,
});
const _vocabWordSet = (size) => {
    const vals = [6, 10, 16].filter(n => n < size);
    if (!vals.length) return null;
    return {
        id: 'wordSet', label: 'Words on the page', type: 'enum', group: 'difficulty', default: null,
        values: [{ v: null, l: `Every word on the list (${size})` }, ...vals.map(n => ({ v: n, l: `The first ${n} (the core words)` }))],
        help: 'Fewer words is the easier step: the same words come back more often. The list starts with the core words.',
    };
};
let _P12_VOCAB = null;
const _VOCAB_BY_SIZE = {};
function _vocabOptions(skillId) {
    const m = String(skillId).match(/^vocab_grade_(k|\d)(?:_(\w+))?$/i);
    const key = m ? (m[1].toUpperCase() + (m[2] ? '_' + m[2] : '')) : '';
    const size = VOCAB_LIST_SIZE[key] || 0;
    if (!_VOCAB_BY_SIZE[size]) {
        _VOCAB_BY_SIZE[size] = [..._vocabForms(), _vocabWordSet(size)].filter(Boolean);
    }
    return _VOCAB_BY_SIZE[size];
}
function _vocabForms() {
    if (!_P12_VOCAB) {
        _P12_VOCAB = [{
            id: 'forms', label: 'What the items ask', type: 'set', group: 'difficulty',
            default: [0, 1, 2],
            values: [{ v: 0, l: 'Which word matches the definition?' }, { v: 1, l: 'What does the word mean?' }, { v: 2, l: 'True or false?' }],
            allLabel: 'All of them, mixed (with matching and sorting)',
            match: ['^Which word matches', '^What does', '^True or False'],
            help: 'Reading a definition and naming the word is the easier step; explaining a word is harder. All ticked also mixes in matching and sorting.',
        }];
    }
    return _P12_VOCAB;
}

/** A skill's own declared options: its registry entry, else its mixed-pool control, else none. */
export function ownOptionsFor(categoryId, skillId) {
    const own = SKILL_OPTIONS[`${categoryId}:${skillId}`] || SKILL_OPTIONS[skillId];
    if (own) return own;
    if (categoryId === 'vocabulary' && /^vocab_grade_/.test(String(skillId))) return _vocabOptions(skillId);
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
    'fraction_operations:sub_frac_unlike': [_p12Denoms([2, 3]), _p12Strip()],
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
    'fraction_operations:mult_frac_frac': [_p12Denoms([2, 3]), _p12Strip()],
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
    'shapes_early:compose_from_attributes': [_p12Kinds('forms', 'Which property', [['A number of right angles', 'have (exactly )?\\d+ right angles?\\.'],
        ['Sides and equal sides', 'SIDES EQUAL'], ['Sides and no right angle', 'NO RIGHT ANGLES'], ['Sides and no parallel sides', 'NO PARALLEL']],
    'One property is the easier step; two together ("3 sides and no right angle") are harder.')],
});

const _clickOrName = (nameLabel, nameRe) => _p12Match([[nameLabel, nameRe], ['Click every one of a kind', '^Click']],
    { help: 'Writing the name is recall; clicking picks from a set. One kind per page, or both.' });
Object.assign(P12_OPTIONS, {
    'area_perimeter:perimeter_intro': [_p12Max([16, 24], 32, { label: 'Perimeter up to', help: 'The largest perimeter on the page.' })],
    'area_perimeter:area_unit_squares': [_p12Variants('area_unit_squares', ['rectangle', 'L'], ['Rectangles', 'L-shapes']),
        _p12Max([12, 24], 42, { label: 'Area up to', help: 'The most unit squares to count.' })],
    'area_perimeter:perimeter_grid': [_p12Match([['Count the edges of a rectangle', 'outside edges\\. What'], ['Count the edges of an L-shape', 'L-shap'],
        ['Find the perimeter of a rectangle', 'perimeter of this rectangle'], ['A composite shape', 'composite']]),
    _p12Max([16], 36, { label: 'Perimeter up to' })],
    'area_perimeter:perimeter': [_p12Variants('perimeter', ['standard', 'missing', 'word'], ['Find the perimeter', 'Find a missing side (the perimeter is given)', 'A story (a fence, a frame)'])],
    'area_perimeter:area': [_p12Variants('area', ['standard', 'missing', 'word'], ['Find the area', 'Find a missing side (the area is given)', 'A story (tiling a floor)'])],
    'area_perimeter:volume': [_p12Variants('volume', ['standard', 'missing', 'word'], ['Find the volume', 'Find a missing edge (the volume is given)', 'A story (a box, a tank)'])],
    'area_perimeter:area_polygon_decompose': [_p12Kinds('shapes', 'Which shapes', [['L-shapes', 'L-shape'], ['U-shapes', 'U-shape'], ['T-shapes', 'T-shape']])],
    'area_perimeter:composite_shapes': [_p12Variants('composite_shapes', ['perim_only', 'dual_pa'], ['The perimeter only', 'The perimeter and the area'])],
    'area_perimeter:volume_composite': [_p12Kinds('shapes', 'Which solids', [['Rectangular prisms', 'rectangular pr'], ['Cubes', 'this cube']])],
    'angles_lines:identify_angles': [_clickOrName('Name the angle (acute, right, obtuse)', '^What type'),
        _p12Kinds('shapes', 'Which angles', [['Right', 'right|=> Right$'], ['Acute', 'acute|=> Acute$'], ['Obtuse', 'obtuse|=> Obtuse$'], ['Straight', '=> Straight$']])],
    'angles_lines:measure_angles': [_p12Kinds('forms', 'Which angles', [['Multiples of 45° (45, 90, 135, 180)', '=> (45|90|135|180)°$'],
        ['Multiples of 30° (30, 60, 120, 150)', '=> (30|60|120|150)°$']], 'The 45° family is the easier step: half of a right angle.')],
    'angles_lines:identify_lines': [_clickOrName('Name the lines', '^What type'),
        _p12Kinds('shapes', 'Which lines', [['Parallel', 'parallel|=> Parallel$'], ['Perpendicular', 'perpendic|=> Perpendicular$'], ['Intersecting', 'intersecting|=> Intersecting$']])],
    'angles_lines:symmetry': [_p12Match([['How many lines of symmetry?', '^How many'], ['Click the shapes that have one', 'shapes that have'],
        ['Click the lines of symmetry', 'lines of symmetry on']])],
    'angles_lines:place_symmetry_lines': [_p12Kinds('shapes', 'Which figures', [['Letters', 'this letter'], ['Shapes', 'this (isosceles|rectangle|oval|rhombus|square|kite|equilateral)']])],
    'angles_lines:additive_angles': [_p12Kinds('forms', 'The whole angle', [['A right angle (90°)', 'whole angle is 90°'], ['A straight angle (180°)', 'whole angle is 180°'],
        ['A full turn (360°)', 'whole angle is 360°']], '90° is the easiest whole; a full turn the hardest.')],
    'shapes_classify:classify_triangles': [_clickOrName('Name the triangle', '^What type'),
        _p12Kinds('shapes', 'Classified by', [['Sides (equilateral, isosceles, scalene)', '(equilateral|isosceles|scalene)|=> (Equilateral|Isosceles|Scalene)$'],
            ['Angles (acute, right, obtuse)', '(acute|right|obtuse) triangles|=> (Acute|Right|Obtuse)$']])],
    'shapes_classify:classify_quads': [_p12Match([['Tick every name that fits one shape', 'categories that apply'], ['Click every shape of one kind', '^Click ALL the']])],
    'shapes_classify:net_identify': [_p12Kinds('shapes', 'Which solids', [['Cubes and rectangular prisms', 'cube|rectangular pri'], ['Pyramids and triangular prisms', 'pyramid|triangular pris']])],
    'shapes_classify:cross_section_3d': [_p12Kinds('forms', 'Which slice', [['Sliced across (horizontally)', 'horizontally'], ['Sliced top to bottom (vertically)', 'vertically']])],
    'coordinates:net_surface_area': [_p12Variants('net_surface_area', ['identify', 'sa'], ['Which solid does the net make?', 'Find the surface area'])],
    'coordinates:geo_reflect': [_p12Kinds('forms', 'Reflect over', [['The x-axis', 'x-axis'], ['The y-axis', 'y-axis']])],
    'coordinates:geo_rotate': [_p12Kinds('forms', 'Turn', [['A half turn (180°)', '180°'], ['A quarter turn (90°)', ' 90°'], ['Three quarters (270°)', '270°']],
        'A half turn is the easiest to see.')],
    'coordinates:geo_translate': [_p12Kinds('forms', 'Slide', [['Right and up', 'right and \\d+ up'], ['Left and up', 'left and \\d+ up'],
        ['Right and down', 'right and \\d+ down'], ['Left and down', 'left and \\d+ down']])],
    'coordinates:coord_polygon': [_p12Match([['The length of one side', 'length of side'], ['The perimeter', 'perimeter']])],
});

// ======================= DATA: GRAPHS, STATISTICS, PROBABILITY (gen-data-stats.js) ==========
const _statKinds = (word) => [
    _p12Match([[`Find the ${word}`, '^Find the'], ['Click the data sets that match', '^Click ALL']]),
    _p12Kinds('points', 'Numbers in the data set', [['4 or 5', ': \\d+(\\.\\d+)?(, \\d+(\\.\\d+)?){3,4} =>'], ['6 to 8', ': \\d+(\\.\\d+)?(, \\d+(\\.\\d+)?){5,7} =>']],
        'Fewer numbers is the easier step.'),
];
Object.assign(P12_OPTIONS, {
    'graphs:bar_graph': [_p12Match([['Which is the most or the least?', 'Which category has the'], ['How many for one bar?', 'How many chose'],
        ['The difference between two bars', 'difference'], ['The total of all the bars', 'total'], ['Click the bars that match', 'Click ALL']])],
    'graphs:pictograph': [
        _p12Match([['Which has the most?', 'Which has the most'], ['How many for one row?', 'How many for'], ['The total', 'total'], ['Click the rows that match', 'Click ALL']]),
        _p12Kinds('scale', 'Each picture stands for', [['2', 'Each . = 2\\)'], ['5', 'Each . = 5\\)'], ['10', 'Each . = 10\\)'], ['25', 'Each . = 25\\)']],
            'Counting in 2s is the easiest key; 25s the hardest.'),
    ],
    // Read by gen-data-stats.js (_dOpt): `tiles` the bars / rows, `band` the tallest one.
    'graphs:build_bar_graph': [_p12Enum('tiles', 'Bars to draw', [{ v: null, l: '3 or 4, dealt' }, { v: 3, l: '3' }, { v: 4, l: '4' }], null, 'More bars is more to draw.'),
        _opsBand([5, 10], 10, { label: 'Tallest bar', help: 'The largest value a bar has to reach.' })],
    'graphs:build_pictograph': [_p12Enum('tiles', 'Rows to draw', [{ v: null, l: '3 or 4, dealt' }, { v: 3, l: '3' }, { v: 4, l: '4' }], null, 'More rows is more to draw.'),
        _opsBand([5, 7], 7, { label: 'Most pictures in a row', help: 'The largest value a row has to reach.' })],
    'graphs:tally_chart': [_p12Match([['How many for one row?', 'How many tallies for'], ['Which has the most?', 'most tall'], ['The total', 'total'], ['Click the rows that match', 'Click ALL']])],
    'graphs:line_plot': [_p12Match([['How many at one mark?', 'How many plants (were|measure)'], ['Which is the most common?', 'Which measurement is mo']])],
    'graphs:line_plot_g2': [_p12Match([['The most common size', 'most common'], ['How many at one size?', 'wear size'], ['How many in all?', 'How many students are shown']])],
    'graphs:line_plot_fractions': [_p12Match([['How many in all?', 'total measurements'], ['The most common measurement', 'most common'], ['How many at one mark?', 'measurements are at']])],
    'graphs:pie_chart': [_p12Match([['What percent chose one?', 'What percent chose (?!.* OR )'], ['What percent chose two? (add them)', ' OR '],
        ['Which part is the largest or smallest?', 'Which category has']])],
    'data_analysis:mean': _statKinds('mean'),
    'data_analysis:median': _statKinds('median'),
    'data_analysis:mode': [_statKinds('mode')[0], _p12Kinds('points', 'Numbers in the data set', [['7 or 8', ': \\d+(, \\d+){6,7} =>'],
        ['9 or 10', ': \\d+(, \\d+){8,9} =>']], 'Fewer numbers is the easier step.')],
    'data_analysis:range': _statKinds('range'),
    'data_analysis:box_plot_intro': [_p12Match([['The median', 'the median'], ['The minimum or maximum', 'minimum|maximum'], ['The range', 'What is the range'],
        ['The quartiles', 'quartile|interquartile']], { help: 'The median, least and greatest come first; quartiles last.' })],
    'data_analysis:histogram_read': [_p12Match([['The highest or lowest bar', 'highest|lowest'], ['How many in an interval?', 'between|in the interv'], ['How many in all?', 'total data']])],
    'data_analysis:mad': [_p12Kinds('points', 'Numbers in the data set', [['4', ': \\d+(, \\d+){3} =>'], ['5 or more', ': \\d+(, \\d+){4,} =>']])],
    'probability:probability_basic': [_p12Match([['Find the probability (a bag of marbles)', '^A (bag|jar|box)'], ['Click the events that match', 'Click ALL'],
        ['Sort by how likely (drag)', 'Drag each']])],
});

// ======================= WORD PROBLEMS: WHAT IS MISSING (gen-operations.js) ===============
// The story kinds each word-problem generator already rotates through (pickVariant) become the
// teacher's "What is missing" control, added to the P11 panel. The _plain twin carries the same
// control: it is generated by its base skill, which reads it.
const _wpAdd = () => _p12Variants('add_word_problems', ['join', 'start_unknown', 'part_part_whole'],
    ['The total (Sam has 5 and gets 3 more)', 'The start (Sam had some, got 3, now has 8)', 'A part (8 in all, 5 are red)'],
    { label: 'What is missing', help: 'The total is the easiest; the start is the hardest (it has to be worked backwards).' });
const _wpSub = () => _p12Variants('sub_word_problems', ['take_away', 'compare', 'start_unknown'],
    ['What is left (had 9, gave away 4)', 'The difference (how many more?)', 'The start (had some, gave away 4, has 5)'],
    { label: 'What is missing', help: 'What is left is the easiest; the start is the hardest.' });
const _wpMul = () => _p12Variants('mult_word_problems', ['equal_groups', 'arrays', 'comparison'],
    ['Equal groups (4 bags of 6)', 'An array (rows and columns)', 'A comparison (3 times as many)'], { label: 'The story' });
const _wpDiv = () => _p12Variants('div_word_problems', ['equal_share', 'grouping', 'remainder'],
    ['Sharing (24 shared by 4)', 'Grouping (how many groups of 4?)', 'A remainder to interpret'], { label: 'The story' });
Object.assign(P12_OPTIONS, {
    'addition:add_word_problems': [...(SKILL_OPTIONS['addition:add_word_problems'] || []), _wpAdd()],
    'addition:add_word_problems_plain': [_wpAdd()],
    'subtraction:sub_word_problems': [...(SKILL_OPTIONS['subtraction:sub_word_problems'] || []), _wpSub()],
    'subtraction:sub_word_problems_plain': [_wpSub()],
    'multiplication:mult_word_problems': [...(SKILL_OPTIONS['multiplication:mult_word_problems'] || []), _wpMul()],
    'multiplication:mult_word_problems_plain': [_wpMul()],
    'division:div_word_problems': [...(SKILL_OPTIONS['division:div_word_problems'] || []), _wpDiv()],
    'division:div_word_problems_plain': [_wpDiv()],
    'algebra:multi_step_word_plain': [_p12Variants('multi_step_word', ['add_then_sub', 'sub_then_add', 'add_then_add', 'sub_then_sub'],
        ['Add, then take away', 'Take away, then add', 'Add twice', 'Take away twice'], { label: 'The two steps' })],
});

// ======================= FRACTION AND MEASUREMENT LEFTOVERS =================================
Object.assign(P12_OPTIONS, {
    'fractions:select_equiv_frac': [_p12Denoms([2, 3])],
    // Read by gen-fractions.js (_fChanged('denoms')): the line's denominator.
    'fractions:mixed_nl_drag': [{ ..._p12Denoms(), values: [{ v: 2, l: 'Fourths' }, { v: 3, l: 'Thirds and sixths' }, { v: 5, l: 'Fifths' }] }],
    // Its number size is the measured Max Number control (it draws to the Max Number setting).
    'subtraction:mixed_add_sub': [_p12Kinds('task', 'Operation', [['Adding', ' \\+ '], ['Subtracting', ' - ']], 'One operation for a warm-up; both mixed makes the pupil read the sign.')],
    'division:mixed_mult_div': [_p12Kinds('task', 'Operation', [['Multiplying', '×'], ['Dividing', '÷']], 'One operation for a warm-up; both mixed makes the pupil read the sign.')],
    'fractions:order_fractions': [_p12Match([['Least to greatest (write the order)', '^Order these fractions from least'],
        ['Greatest to least (write the order)', '^Order these fractions from greatest'], ['Drag into order', '^Drag the fractions']])],
    'fractions:benchmark_fractions': [_p12Match([['The closest benchmark (0, ¼, ½, ¾, 1)', 'closest to 0, '], ['Sort into benchmark bins (drag)', 'Drag each fraction into the bin'],
        ['Put in order (drag)', 'Drag the fractions from'], ['Click the fractions closest to one', 'Click ALL the fractions closest']])],
    'fraction_operations:frac_10_100_nv': [_p12Match([['Write tenths as hundredths', '^Write \\d+/10 as'], ['Find the missing numerator', 'Find the missing numerator'],
        ['Add tenths and hundredths', '^\\d+/10 \\+ \\d+/100'], ['Click the equal fractions', '^Click ALL']])],
    'fraction_operations:estimate_frac_ops': [_p12Kinds('task', 'Operation', [['Adding', '^Estimate: \\d+/\\d+ \\+'], ['Subtracting', '^Estimate: \\d+/\\d+ -']])],
    'measurement:unit_conversion_word': [_p12Kinds('units', 'Units', [['Time (hours, minutes, seconds)', ' (hr|min)\\. How many (min|sec)'],
        ['Metric (km, m, cm, kg, g)', ' (km|m|cm|kg|g|L)\\. How many'], ['Customary (yd, ft, in, lb, oz, qt, pt)', ' (mi|yd|ft|lb|gal|qt|pt)\\. How many']])],
});

// ======================= SECOND CONTROLS FOR THE MEASURED-ONLY SKILLS =======================
// These skills already had the measured Max Number (their number size). P12 adds what the
// items ask, so the teacher can also change the kind of work, not only the size.
const _ops4 = [['Adding', ' \\+ '], ['Subtracting', ' - '], ['Multiplying', ' × '], ['Dividing', ' ÷ ']];
Object.assign(P12_OPTIONS, {
    'composing:odd_even': [_p12Match([['Odd or even? (one number)', '^Is \\d+ odd or even'], ['Click all the even or odd numbers', '^Click all'],
        ['Which number is even or odd?', '^Which number']])],
    'subtraction:missing_add_sub': [
        _p12Kinds('unknown', 'What is missing', [['The answer (8 + 5 = __)', '= ___ =>'], ['A number before the = sign', '___ [+-]|[+-] ___']]),
        _p12Kinds('task', 'Operation', [['Adding', '\\+'], ['Subtracting', ' - ']]),
    ],
    // Read by gen-operations.js (_p12Form): 0 = arrays, 1 = equal groups.
    'multiplication:arrays_groups': [formsOption([{ v: 0, l: 'Arrays (rows of dots)' }, { v: 1, l: 'Equal groups (rings of dots)' }], { label: 'The picture' })],
    'decimals:div_decimal': [_p12Variants('div_decimal', ['dec_by_whole', 'whole_by_dec', 'dec_by_dec'],
        ['A decimal ÷ a whole number (31.6 ÷ 4)', 'A whole number ÷ a decimal (6 ÷ 0.2)', 'A decimal ÷ a decimal (1.8 ÷ 0.9)'], { label: 'Which division' })],
    'decimals:compare_decimal': [_p12Match([['Compare two decimals', '^Compare'], ['Click the decimals that match', '^Click ALL'], ['Put in order (drag)', '^Drag']])],
    'decimals:round_decimals': [_p12Kinds('precision', 'Round to the nearest', [['Tenth', 'nearest tenth'], ['Hundredth', 'nearest hundredth']])],
    'decimals:order_decimals': [
        _p12Kinds('dir', 'Order', [['Least to greatest', 'least to great'], ['Greatest to least', 'greatest to least']]),
        _p12Match([['Write the order', '^Order'], ['Drag into order', '^Drag']]),
    ],
    'coordinates:coordinate_q1': [_p12Match([['Read the coordinates', '^What are the coordinates'], ['Plot the points', '^Plot']])],
    'coordinates:coordinate_all': [_p12Match([['Read the coordinates', '^What are the coordinates'], ['Plot the points', '^Plot']])],
    'coordinates:coordinate_graph': [_p12Match([['Read the coordinates', '^What are the coordinates'], ['Plot the points', '^Plot']])],
    'number_ops_mixed:mixed': [_p12Kinds('task', 'Operations', _ops4, 'Tick the operations the page mixes.')],
    'order_of_operations:three_ops_no_paren': [_p12Match([['× written first (4 × 3 − 2 + 1)', '^\\d+ × \\d+ [-+]'], ['+ written first (4 + 3 + 2 × 1)', '^\\d+ \\+ \\d+']])],
    'order_of_operations:paren_multi': [_p12Match([['(a − b) × c + d', '^\\(\\d+ - \\d+\\) × \\d+ \\+'], ['a × (b + c) − d', '^\\d+ × \\('], ['(a + b) × (c + d)', '\\) × \\(']])],
});

// ======================= K-2 AND NUMBER-SENSE LEFTOVERS =====================================
Object.assign(P12_OPTIONS, {
    // Read by gen-counting.js (band) and gen-algebraic.js (_estForm).
    'composing:ten_frame_build_teen': [_opsBand([15, 19], 19, { label: 'Teen numbers to', labels: { 15: '15 (10 and up to 5 more)' },
        help: 'Up to 15 keeps the second frame to one row of five.' })],
    'composing:compose_whole': [_p12Kinds('parts', 'Pieces', [['Halves, quarters and eighths', '^Use (halves and quarters|quarters and eighths|halves and quarters and eighths) '],
        ['Thirds and sixths (and halves)', '^Use (halves and thirds and sixths|halves and sixths|thirds and sixths) ']], 'Halves and quarters are the easier pieces to fit together.')],
    'number_sense:make_a_ten': [formsOption([{ v: 0, l: 'Add using make a ten (8 + 5 = 8 + 2 + 3)' }, { v: 1, l: 'Which shows the make-a-ten way?' }])],
    'number_sense:doubles_near_doubles': [formsOption([{ v: 0, l: 'Doubles (6 + 6)' }, { v: 1, l: 'Doubles plus one (6 + 7)' }, { v: 2, l: 'Doubles minus one (6 + 5)' }],
        { help: 'Doubles come first; near doubles use a double the pupil knows.' })],
    'addition:add_sub_10s': [_p12Kinds('task', 'Operation', [['Adding tens', ' \\+ '], ['Subtracting tens', ' - ']]), _p12Max([50], 100)],
    'addition:add_sub_100s': [_p12Kinds('task', 'Operation', [['Adding hundreds', ' \\+ '], ['Subtracting hundreds', ' - ']]), _p12Max([500], 1000)],
    // Read by gen-counting.js add_wp_10 (the plain twin is generated there too).
    'addition:add_wp_10_plain': [_opsBand([5, 7, 10], 10, { label: 'Total to', help: 'The largest total in a story.' })],
    'addition:add_wp_10': [...(SKILL_OPTIONS['addition:add_wp_10'] || []), _opsBand([5, 7, 10], 10, { label: 'Total to', help: 'The largest total in a story.' })],
});

// ======================= PATTERNS, ALGEBRA, ORDER OF OPERATIONS (gen-algebraic.js) ==========
// Each skill offers the step groups its generator really deals (measured, 120 items each).
const _SKIP_GROUPS = {
    wide: [['1s, 2s, 5s and 10s', '(1|2|5|10)'], ['3s, 4s and 6s', '(3|4|6)'], ['7s, 8s, 9s, 11s and 12s', '(7|8|9|11|12)']],
    line: [['2s, 5s and 10s', '(2|5|10)'], ['3s, 4s and 6s', '(3|4|6)'], ['25s', '(25)']],
    step: [['2s, 5s and 10s', '(2|5|10)'], ['3s and 4s', '(3|4)']],
};
const _skipBy = (re, groups = 'wide') => _p12Kinds('step', 'Count by', _SKIP_GROUPS[groups].map(([l, g]) => [l, re(g)]),
    'The friendly steps (2s, 5s, 10s) come first.');
const _seqGap = () => _p12Kinds('unknown', 'Which number is missing', [['The next number', '___ =>'], ['A number in the middle', ', ___, '],
    ['The first number', '^Complete: ___']], 'The next number is the easiest; the first number means counting back.');
const _orderDrag = (fillLabel, fillRe) => _p12Match([[fillLabel, fillRe], ['Put numbers in order (drag)', '^Drag the numbers']]);
Object.assign(P12_OPTIONS, {
    'patterns:seq_2': [_orderDrag('Fill the gap', '^Complete'), _seqGap()],
    'patterns:seq_5': [_orderDrag('Fill the gap', '^Complete'), _seqGap()],
    'patterns:seq_10': [_orderDrag('Fill the gap', '^Complete'), _seqGap()],
    'patterns:count_by_fill': [_orderDrag('Fill the sequence', '^Complete the count'), _skipBy(n => `count-by-${n}s`)],
    'patterns:skip_count_line': [_skipBy(n => `by ${n}s\\.`, 'line')],
    'patterns:skip_count_grid': [_skipBy(n => `by ${n}s\\.`)],
    'patterns:count_by_step_up': [_skipBy(n => `by ${n}s\\.`, 'step')],
    'patterns:count_by_step_down': [_skipBy(n => `by ${n}s\\.`, 'step')],
    'patterns:count_by_powers_of_10': [
        _p12Kinds('step', 'Count by', [['10s', 'by 10s'], ['100s', 'by 100s'], ['1,000s and more', 'by \\d+,?\\d{3}s']]),
        _p12Kinds('dir', 'Direction', [['Counting up', '^Count up'], ['Counting down', '^Count down']]),
    ],
    'patterns:shape_pattern': [_p12Kinds('points', 'Shapes to fill in', [['2', '=> \\w+, \\w+$'], ['3', '=> \\w+, \\w+, \\w+$']])],
    'patterns:number_pattern': [_orderDrag('Fill in the pattern', '^Find the pattern')],
    'patterns:pattern_relationship': [
        _p12Match([['Name the rule between the patterns', '^Look at the two'], ['Build pattern B (drag)', '^Pattern A']]),
        _p12Kinds('task', 'The rule', [['Add a number', '=> Add|Add \\d'], ['Multiply by a number', '=> Multiply|Multiply by']]),
    ],
    'algebra:tape_diagram': [_p12Kinds('forms', 'The story', [['Joining (gets more)', 'gets \\d+ more'], ['Taking away (used some)', 'used \\d+'],
        ['How many more are needed', 'needs \\d+']])],
    'algebra:tape_diagram_plain': [_p12Kinds('forms', 'The story', [['Joining (gets more)', 'gets \\d+ more'], ['Taking away (used some)', 'used \\d+'],
        ['How many more are needed', 'needs \\d+']])],
    'algebra:multi_step_word': [_p12Variants('multi_step_word', ['add_then_sub', 'sub_then_add', 'add_then_add', 'sub_then_sub'],
        ['Add, then take away', 'Take away, then add', 'Add twice', 'Take away twice'], { label: 'The two steps' })],
    'algebra:solve_unknown': [_p12Match([['x + a = b', 'Solve: x \\+'], ['x − a = b', 'Solve: x -'], ['ax = b', 'Solve: \\d+x ='], ['Click the values that work', '^Click ALL']])],
    'algebra:balance_addsub': [_p12Kinds('unknown', 'Where the blank is', [['At the start (___ + 4 = 9 − 2)', 'equal: ___'], ['In the middle (12 − ___ = 3 + 4)', 'equal: \\d+ - ___'],
        ['On the right (5 + 3 = ___ + 2)', '= ___ \\+']])],
    'algebra:write_expression': [
        _p12Kinds('task', 'Operation', [['Adding', 'sum of|plus'], ['Subtracting', 'minus|difference'], ['Multiplying', 'product|times'], ['Dividing', 'divided']]),
        _p12Match([['Write the expression', '^Write an expression'], ['Click the matching expressions', '^Click ALL']]),
    ],
    'algebra:evaluate_expression': [_p12Match([['Evaluate one expression', '^Evaluate'], ['Click the expressions that equal it', '^Click ALL']])],
    'algebra:evaluate_expression_hard': [_p12Match([['Evaluate one expression', '^Evaluate'], ['Click the expressions that equal it', '^Click ALL']])],
    'algebra:inequalities': [_p12Match([['True or false?', 'true or false'], ['Drag a marker onto the line', 'Drag the marker'], ['Sort values into bins (drag)', 'Drag each value']])],
    'algebra:combine_like_terms': [_p12Match([['Simplify (3x + 2 + 5x)', '^Simplify'], ['How many x-terms?', 'How many x-terms']])],
    'algebra:distributive_expr': [_p12Match([['Expand a(x + b)', '\\(x \\+'], ['Expand a(x − b)', '\\(x -'], ['Factor out the greatest common factor', 'Factor out']])],
    'algebra:solve_eq_addsub': [_p12Match([['? + a = b (a box)', 'Solve: \\? '], ['x + a = b', 'Solve: [a-z] \\+'], ['x − a = b', 'Solve: [a-z] -'],
        ['b = x + a (turned round)', 'Solve: \\d+ = '], ['Drag the numbers that work', '^Equation']])],
    'algebra:solve_eq_multdiv': [_p12Match([['? ÷ a = b (a box)', 'Solve: \\? ÷'], ['ax = b', 'Solve: \\d+[a-z] ='], ['a × x = b', 'Solve: \\d+ × [a-z]'],
        ['x ÷ a = b', 'Solve: [a-z] ÷'], ['Drag the numbers that work', '^Equation']])],
    'algebra:solve_eq_twostep': [_p12Variants('solve_eq_twostep', ['ax_plus_b', 'paren_div', 'ax_minus_b', 'var_div_plus'],
        ['ax + b = c', '(x − b) ÷ a = c', 'ax − b = c', 'x ÷ a + b = c'], { label: 'Which form' })],
    'algebra:write_equation': [_p12Variants('write_equation', ['number_plus', 'twice_minus', 'story_give', 'story_earn'],
        ['"A number plus 5 is 12"', '"Twice a number minus 3 is 11"', 'A story: giving some away', 'A story: earning per hour'], { label: 'Which sentence' })],
    'algebra:build_expr_addsub': [_p12Kinds('task', 'Operation', [['Adding', '=> [^=]*\\+'], ['Subtracting', '=> [^=]*-']])],
    'algebra:build_expr_multdiv': [_p12Kinds('task', 'Operation', [['Multiplying', '=> [^=]*×'], ['Dividing', '=> [^=]*÷']])],
    'order_of_operations:oop_easy': [_p12Match([['Add or subtract first in the line (4 + 6 × 2)', '^\\d+ [+-] \\d+ [×÷] \\d+ ='],
        ['Multiply or divide first in the line (6 × 2 + 4)', '^\\d+ [×÷] \\d+ [+-] \\d+ ='], ['Click the expressions that equal it', '^Click ALL']])],
    'order_of_operations:oop_medium': [_p12Match([['(a + b) × c', '^\\(\\d+ \\+ \\d+\\) × \\d+ ='], ['a × (b − c) + d', '× \\(\\d+ - \\d+\\) \\+'],
        ['(a + b) ÷ c + d × e', '\\) ÷ \\d+ \\+ \\d+ ×'], ['Brackets inside brackets', '\\(\\d+ \\+ \\('], ['Click the expressions that equal it', '^Click ALL']])],
    'order_of_operations:oop_hard': [_p12Match([['Square brackets [ ]', '\\['], ['A power, no square brackets', '^[^\\[]*$']])],
    'order_of_operations:two_ops_no_paren': [_p12Match([['+ or − written first (4 + 6 × 2)', '^\\d+ [+-] \\d+ [×÷]'], ['× or ÷ written first (6 × 2 + 4)', '^\\d+ [×÷] \\d+ [+-]']])],
    'order_of_operations:paren_simple': [_p12Match([['a × (b ± c)', '^\\d+ × \\('], ['(a ± b) × c', '^\\([^)]*\\) ×'], ['(a + b) ÷ c', '\\) ÷']])],
    'order_of_operations:nested_complex': [_p12Max([20, 50], 100, { help: 'The largest number in the expression or its answer.' })],
    'order_of_operations:exponents_simple': [_p12Kinds('forms', 'Powers', [['Squares (5²)', '²'], ['Cubes (5³)', '³']], 'Squares come first.'),
        _p12Kinds('step', 'Steps', [['The power alone (5² = __)', '^\\d+[²³] = '], ['The power and one more step (5² + 3)', '[²³] [+-]']])],
    'order_of_operations:compare_expressions': [_p12Match([['Compare two sides (<, > or =)', '^Compare'], ['Sort statements (drag)', '^Evaluate each side']])],
    // ======================= INTEGERS AND NUMBER THEORY =======================
    'integers:number_line_int': [_p12Kinds('forms', 'Which numbers', [['Positive (and 0)', '=> \\d+$'], ['Negative', '=> -\\d+$']])],
    'integers:compare_int': [
        _p12Match([['Compare two integers', '^Compare'], ['Click the integers that match', '^Click ALL']]),
        _p12Kinds('shapes', 'Signs', [['Both positive', 'Compare: \\d+ ___ \\d+'], ['One negative', 'Compare: (-\\d+ ___ \\d+|\\d+ ___ -\\d+)'],
            ['Both negative', 'Compare: -\\d+ ___ -\\d+']]),
    ],
    'integers:add_int': [_p12Kinds('forms', 'Signs', [['5 + 3', '^\\d+ \\+ \\d+ ='], ['5 + (−3)', '^\\d+ \\+ \\(-'], ['−5 + 3', '^-\\d+ \\+ \\d+'], ['−5 + (−3)', '^-\\d+ \\+ \\(-']],
        'Both positive first; adding a negative is the new step.')],
    'integers:sub_int': [_p12Kinds('forms', 'Signs', [['5 − 3', '^\\d+ - \\d+ ='], ['5 − (−3)', '^\\d+ - \\(-'], ['−5 − 3', '^-\\d+ - \\d+'], ['−5 − (−3)', '^-\\d+ - \\(-']],
        'Subtracting a negative (5 − (−3)) is the hardest step.')],
    'integers:order_negatives': [_p12Kinds('points', 'How many numbers', [['3 or 4', '=> -?\\d+(,-?\\d+){2,3}$'], ['5 or 6', '=> -?\\d+(,-?\\d+){4,5}$']])],
    'integers:integer_nl_drag': [_p12Match([['Place one integer', '^Drag -?\\d'], ['Place several integers', '^Drag each']])],
    'integers:abs_value': [_p12Match([['|−7|', '\\|-\\d+\\|'], ['|7|', '\\|\\d+\\|'], ['Which has the greater absolute value?', 'greater absolute']])],
    'integers:opposite_numbers': [_p12Match([['The opposite of a negative', 'opposite of -'], ['The opposite of a positive', 'opposite of \\d'], ['The same distance from 0', 'same distance']])],
    'integers:ordering_rationals': [_p12Kinds('forms', 'Which numbers', [['Fractions only', 'GREATEST: [-\\d/, ]+ =>'], ['Fractions and decimals mixed', '\\d\\.\\d']])],
    'number_theory:prime_composite': [_p12Match([['Prime or composite?', '^Is \\d+ prime'], ['Which one is composite?', '^Which number is composite'],
        ['Click the primes', 'Click ALL the prime'], ['Sort into prime and composite (drag)', '^Sort']])],
    'number_theory:multiples': [_p12Match([['List the first multiples', '^List the first'], ['Circle the multiples', '^Circle all'],
        ['Click the multiples', '^Click ALL'], ['Fill in the missing multiples', '^Fill in the missing']])],
    'number_theory:gcf_easy': [_p12Match([['Find the greatest common factor', '^Find the'], ['Click every common factor', '^Click ALL']])],
    'number_theory:gcf_hard': [_p12Match([['Find the greatest common factor', '^Find the'], ['Click every common factor', '^Click ALL']])],
    'number_theory:lcm': [_p12Match([['Find the least common multiple', '^Find the LCM'], ['Click every common multiple', '^Click ALL']])],
    'number_theory:divisibility_sort': [_p12Kinds('step', 'Divisible by', [['2, 5 or 10', 'divisible by (2|5|10)\\?'], ['3, 4 or 6', 'divisible by (3|4|6)\\?'],
        ['7, 8 or 9', 'divisible by (7|8|9)\\?']], '2, 5 and 10 have the easiest rules (the last digit).')],
});

// ======================= MEASUREMENT, TIME, MONEY (gen-measurement.js) =====================
// NOTE: the time rungs, elapsed rungs and clock-ordering routes just below, and the TIME AND
// MONEY block at the end of P12, are supersedable stop-gaps (a P10 agent owns time and money).
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
// The time / elapsed / clock-ordering stop-gap routes that stood here were superseded by the P10
// time + money block (TM_SKILLS above); P12_ROUTES no longer routes any time or money id.
Object.assign(P12_OPTIONS, {
    'measurement:heavier_lighter_visual': [_p12Match([['Which is heavier?', 'heavier'], ['Which is lighter?', 'lighter']])],
    'measurement:pictograph_intro': [_p12Match([['How many?', '^How many (?!MORE)'], ['How many more?', 'How many MORE']])],
    'measurement:bar_graph_intro': [_p12Match([['Which has the most?', 'MOST'], ['How many?', '^How many (?!MORE)'], ['How many more?', 'How many MORE']])],
    'measurement:reading_ruler': [_p12Kinds('parts', 'Marks read', [['Whole inches', '=> \\d+$'], ['Half inches', '=> (\\d+ )?1/2$'],
        ['Quarter inches', '=> (\\d+ )?[13]/4$']], 'Whole inches first, then halves, then quarters.')],
    'measurement:reading_ruler_hard': [_p12Kinds('parts', 'Marks read', [['Whole inches', '=> \\d+$'], ['Half inches', '=> (\\d+ )?1/2$'],
        ['Quarter inches', '=> (\\d+ )?[13]/4$']], 'Whole inches first, then halves, then quarters.')],
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

// (The P12 TIME AND MONEY stop-gap entries were superseded by the P10 block and removed.)

// ======================= O2 · A REAL EASIER / HARDER LADDER  (2026-09-25) ==================
// design/audit/OPTIONS-CRITIC-R2.md §5 #5 and #13: 104 panels offered only "What the items ask",
// and 39 only the measured Max Number, which bounded an operand at best ("Up to 10" dealt factors
// of 24). Each skill below gains ONE size or complexity control of its own; the item kinds stay
// where they were. Every control defaults to "As dealt", which draws exactly what the skill drew
// before (so a saved page or a link without the option is unchanged), and owning a `band` hides the
// measured Max Number (OWNS_ITS_NUMBERS) — the band replaces it.
//
//   `band` + accept 'max'   "Numbers to N": EVERY number on the item, the answer included, is at
//                           most N (generate-question.js p12Acceptor redraws any item over it). A
//                           skill that sizes its numbers from the Max Number also carries
//                           `asRange` (the Max Number it draws at while the band is on), so the
//                           generator draws small numbers natively instead of by luck.
//   `band` read by the generator   integers (−N to N) and number theory (what the item asks about).
//   `tiles` / `most`               graphs: categories drawn, and the largest count (gen-data-stats.js).
//   `wordSet`                      vocabulary (_vocabOptions above).
// No per-family SUPPORT control is added here: a separate supports programme attaches those.
const _O2_FOLLOWS = 'As dealt (follows the Max Number setting)';
const _o2Band = (values, { label = 'Numbers to', natural, help, labels = {}, asRange } = {}) => ({
    id: 'band', label, type: 'enum', group: 'difficulty', default: null, accept: 'max',
    values: [{ v: null, l: natural ? `As dealt (to about ${natural.toLocaleString('en-US')})` : _O2_FOLLOWS },
        ...values.map(v => ({ v, l: labels[v] || v.toLocaleString('en-US') }))],
    help: help || 'The largest number anywhere on an item, the answer included. A smaller number is the easier step.',
    ...(asRange ? { asRange } : {}),
});
/** A band for a skill that sizes its numbers from the Max Number: it draws at `rangeFor(band)`. */
const _o2RangeBand = (values, opts = {}) => _o2Band(values, { ...opts, asRange: opts.asRange || (b => b) });
/** Integers: −N to N. */
const _o2IntBand = (values, { dflt = null, natural = '−20 to 20', help } = {}) => ({
    id: 'band', label: 'Numbers from', type: 'enum', group: 'difficulty', default: dflt, accept: 'max',
    values: [...(dflt === null ? [{ v: null, l: `As dealt (${natural}, follows the Max Number setting)` }] : []),
        ...values.map(v => ({ v, l: `−${v} to ${v}` }))],
    help: help || 'Every number on the item, the answer too, lies between −N and N. Numbers close to 0 are the easier step.',
});
/** Number theory: the band bounds what the item asks about (gen-number-theory.js ntBand). */
const _o2NtBand = (values, natural, what) => ({
    ..._o2Band(values, { natural, help: `${what} Smaller numbers are the easier step.` }),
    label: 'Numbers to',
});
const _o2Tiles = (label, values, dealt, help) => ({
    id: 'tiles', label, type: 'enum', group: 'difficulty', default: null,
    values: [{ v: null, l: `${dealt}, dealt` }, ...values.map(v => ({ v, l: String(v) }))], help,
});
const _o2Most = (label, values, dealt, help) => ({
    id: 'most', label, type: 'enum', group: 'difficulty', default: null,
    values: [{ v: null, l: `As dealt (${dealt})` }, ...values.map(v => ({ v, l: String(v) }))], help,
});
// Order of operations sizes its numbers steeply from the Max Number (Max Number 20 already deals
// 1,470 ÷ 42): a band to 100 draws at Max Number 10, a band to 1,000 at 20 (measured, 60 items).
const _o2OopBand = () => _o2RangeBand([20, 50, 100, 1000], { asRange: b => (b <= 100 ? 10 : 20),
    help: 'The largest number anywhere in the expression, the answer included. Smaller numbers let the pupil think about the order, not the arithmetic.' });
/** Append O2 controls to a skill's panel (its P12 entry, or its P9 / P11 registry entry). */
const _o2Add = (key, ...defs) => {
    const base = P12_OPTIONS[key] || SKILL_OPTIONS[key] || [];
    P12_OPTIONS[key] = [...base, ...defs];
};
[
    // ---- integers: −N to N (gen-operations.js intBand, gen-algebraic.js _intBand / order_negatives)
    ['integers:number_line_int', _o2IntBand([5, 10], { help: 'The number the arrow points to lies between −N and N. Beyond 20 the line counts in tens, so the ladder stops at the Max Number\'s 20.' })],
    ['integers:compare_int', _o2IntBand([5, 10, 50, 100])],
    ['integers:add_int', _o2IntBand([5, 10, 50, 100])],
    ['integers:sub_int', _o2IntBand([5, 10, 50, 100])],
    ['integers:order_negatives', _o2IntBand([10, 20, 50], { natural: '−100 to 100' })],
    ['integers:integer_nl_drag', _o2IntBand([5, 10, 20], { dflt: 10, help: 'The number line runs from −N to N, one tick for every whole number. −10 to 10 is the line the skill always drew.' })],
    ['integers:abs_value', _o2IntBand([5, 10, 100], { natural: '−20 to 20' })],
    ['integers:opposite_numbers', _o2IntBand([5, 10, 100], { natural: '−20 to 20' })],
    // ---- number theory (gen-number-theory.js ntBand): the number the item is about
    ['number_theory:prime_composite', _o2NtBand([30, 50], 100, 'Every number to sort or decide on is at most this.')],
    ['number_theory:factors_identify', _o2NtBand([20, 40, 60], 100, 'The number to factor is at most this.')],
    ['number_theory:factor_tchart_easy', _o2NtBand([20, 30], 48, 'The number to factor is at most this.')],
    ['number_theory:factor_links_easy', _o2NtBand([20, 30], 48, 'The number to factor is at most this.')],
    ['number_theory:factor_tchart_medium', _o2NtBand([24, 40], 60, 'The number to factor is at most this.')],
    ['number_theory:factor_links_medium', _o2NtBand([24, 40], 60, 'The number to factor is at most this.')],
    ['number_theory:factor_tchart_hard', _o2NtBand([40, 60], 100, 'The number to factor is at most this.')],
    ['number_theory:factor_links_hard', _o2NtBand([40, 60], 100, 'The number to factor is at most this.')],
    ['number_theory:multiples', _o2NtBand([30, 60], 144, 'The largest multiple written or asked for is at most this.')],
    ['number_theory:gcf_easy', _o2NtBand([20, 30], 48, 'Both numbers are at most this.')],
    ['number_theory:gcf_hard', _o2NtBand([36, 48], 90, 'Both numbers are at most this.')],
    ['number_theory:lcm', _o2NtBand([20, 30], 70, 'The least common multiple (the answer) is at most this.')],
    ['number_theory:divisibility_sort', _o2NtBand([50, 500], 100, 'Every number to sort is at most this.')],
    // ---- order of operations
    ['order_of_operations:two_ops_no_paren', _o2OopBand()],
    ['order_of_operations:three_ops_no_paren', _o2OopBand()],
    ['order_of_operations:multi_ops_no_paren', _o2OopBand()],
    ['order_of_operations:paren_simple', _o2OopBand()],
    ['order_of_operations:paren_multi', _o2OopBand()],
    ['order_of_operations:exponents_simple', _o2OopBand()],
    ['order_of_operations:oop_easy', _o2Band([10, 20], { natural: 45 })],
    ['order_of_operations:oop_medium', _o2Band([20, 50], { natural: 130 })],
    ['order_of_operations:oop_hard', _o2Band([20, 50], { natural: 140 })],
    ['order_of_operations:compare_expressions', _o2Band([10, 20], { natural: 40 })],
    // ---- algebra
    // A tape diagram's whole runs to about twice the Max Number: it draws at half the band.
    ['algebra:tape_diagram', _o2RangeBand([20, 50], { asRange: b => Math.max(10, Math.floor(b / 2)) })],
    ['algebra:tape_diagram_plain', _o2RangeBand([20, 50], { asRange: b => Math.max(10, Math.floor(b / 2)) })],
    ['algebra:multi_step_word', _o2RangeBand([30, 50])],
    ['algebra:multi_step_word_plain', _o2RangeBand([30, 50])],
    ['algebra:algebra_word_mixed_plain', _o2RangeBand([20, 50])],
    ['algebra:solve_unknown', _o2RangeBand([10, 20])],
    ['algebra:balance_addsub', _o2RangeBand([10, 20])],
    ['algebra:write_expression', _o2RangeBand([10, 20])],
    ['algebra:evaluate_expression', _o2RangeBand([10, 20])],
    ['algebra:inequalities', _o2RangeBand([10, 20])],
    ['algebra:solve_eq_addsub', _o2RangeBand([10, 20])],
    ['algebra:solve_eq_multdiv', _o2RangeBand([10, 20])],
    ['algebra:solve_eq_twostep', _o2RangeBand([20, 50])],
    ['algebra:write_equation', _o2RangeBand([10, 20])],
    ['algebra:build_expr_addsub', _o2RangeBand([10, 20, 50])],
    ['algebra:evaluate_expression_hard', _o2Band([20, 50], { natural: 170 })],
    ['algebra:combine_like_terms', _o2Band([10], { natural: 18 })],
    ['algebra:distributive_expr', _o2Band([20, 50], { natural: 110 })],
    ['algebra:build_expr_multdiv', _o2Band([20, 50], { natural: 100 })],
    // ---- patterns: doubling and halving
    ['patterns:double', _o2RangeBand([20, 50, 1000], { asRange: b => Math.max(10, Math.floor(b / 2)),
        help: 'The largest number on an item, the double included: to 20 doubles numbers to 10.' })],
    ['patterns:halve', _o2RangeBand([10, 20, 50, 1000], { help: 'The number to halve is at most this.' })],
    // compensation always uses a number next to a ten (18, 28, 48 …); the band bounds the sum or the
    // number taken from, and draws with the small second number (Max Number 10).
    ['number_sense:compensation', _o2RangeBand([30, 50], { asRange: () => 10,
        help: 'The sum, or the number you take from, is at most this. Smaller numbers keep the pupil on the strategy.' })],
    // ---- counting sequences: the measured Max Number bounded where a count STARTS ("Up to 10"
    // dealt 40); the band bounds every number in the row.
    ['patterns:seq_2', _o2RangeBand([20, 50, 1000], { help: 'Every number in the count, the missing one too, is at most this.' })],
    ['patterns:seq_5', _o2RangeBand([20, 50, 1000], { help: 'Every number in the count, the missing one too, is at most this.' })],
    ['patterns:seq_10', _o2RangeBand([50, 1000], { help: 'Every number in the count, the missing one too, is at most this.' })],
    ['patterns:number_pattern', _o2RangeBand([50, 1000], { help: 'Every number in the pattern, the missing ones too, is at most this.' })],
    ['patterns:skip_count_line', _o2RangeBand([50, 1000], { help: 'Every number on the line, the answer too, is at most this.' })],
    // ---- area, perimeter, volume (the answer is the largest number: the band bounds it)
    ['area_perimeter:area_perimeter', _o2RangeBand([20, 50, 1000], { label: 'Area and perimeter to' })],
    ['area_perimeter:area_distributive_visual', _o2RangeBand([30, 50], { label: 'Area to' })],
    ['area_perimeter:area_triangle', _o2RangeBand([10, 20], { label: 'Numbers to' })],
    ['area_perimeter:perimeter', _o2RangeBand([12, 20], { label: 'Numbers to' })],
    ['area_perimeter:area', _o2RangeBand([10, 25], { label: 'Numbers to' })],
    ['area_perimeter:volume', _o2RangeBand([12, 30], { label: 'Numbers to' })],
    ['area_perimeter:composite_shapes', _o2RangeBand([25, 40], { label: 'Numbers to' })],
    ['area_perimeter:area_polygon_decompose', _o2RangeBand([25, 50], { label: 'Area to' })],
    ['area_perimeter:volume_composite', _o2RangeBand([50, 100], { label: 'Volume to' })],
    // ---- shapes, angles, coordinates
    // The naming skills (name_2d / 3d_shapes, identify_angles / lines, classify_triangles,
    // measure_angles, cross_section_3d, shape_positions, compose_shapes) are NOT given a pick-list ladder:
    // their printed item is written (the name on a line), so a shorter pick list would change the
    // screen and not the paper (OC3). Their shape / angle / position sets are their ladder.
    ['shapes_early:count_edges_faces_vertices', _o2Band([6, 10], { label: 'Counts up to', natural: 18,
        help: 'The largest count asked for: to 6 keeps to shapes with few faces, edges or corners.' })],
    ['shapes_early:shape_attributes', _o2Band([4, 6], { label: 'Sides up to', natural: 8, help: 'The most sides or vertices a counted shape has.' })],
    ['coordinates:coord_polygon', _o2RangeBand([10, 20])],
    ['coordinates:coord_distance_q1', _o2RangeBand([5], { label: 'Coordinates to', help: 'Every coordinate and the distance are at most this.' })],
    ['coordinates:coordinate_q1', _o2Band([5], { label: 'Coordinates to', natural: 10, help: 'Every coordinate is at most this.' })],
    ['coordinates:coordinate_graph', _o2Band([5], { label: 'Coordinates to', natural: 10, help: 'Every coordinate is at most this.' })],
    ['coordinates:net_surface_area', _o2RangeBand([50, 100], { label: 'Numbers to' })],
    // ---- graphs (gen-data-stats.js _dNum): how much there is to read
    ['graphs:bar_graph', _o2Tiles('Bars', [3, 4, 5], '4 or 5', 'Fewer bars is the easier step.'),
        _o2Most('Tallest bar up to', [5, 10, 50], 'to 20 at Max Number 100', 'The largest value a bar shows. Small values read straight off the scale.')],
    ['graphs:pictograph', _o2Tiles('Rows', [3, 4, 5], '3, 4 or 5', 'Fewer rows is the easier step.')],
    ['graphs:tally_chart', _o2Tiles('Rows', [3, 4, 5], '3, 4 or 5', 'Fewer rows is the easier step.'),
        _o2Most('Most tallies in a row', [5, 10, 20], '3 to 15', 'To 5 is one bundle of tallies; more bundles is harder to count.')],
    ['graphs:pie_chart', _o2Tiles('Parts of the circle', [3, 4], '3 or 4', 'Three parts is the easier step.')],
    ['graphs:line_plot', _o2Tiles('Data points', [6, 8, 12], '8 to 12', 'Fewer marks is the easier step.')],
    ['graphs:line_plot_fractions', _o2Tiles('Data points', [6, 10, 15], '8 to 15', 'Fewer marks is the easier step.')],
    ['graphs:line_plot_g2', _o2Most('Most marks at one size', [2, 3, 6], '0 to 4', 'Fewer marks in a column is the easier step to count.')],
].forEach(([key, ...defs]) => _o2Add(key, ...defs));
// ============================ end O2 · easier / harder ladder ============================

// ======================= O6 · APPEARANCE: FIGURES AND DATA  (lane AP2, 2026-09-25) =========
// design/audit/OPTIONS-RUBRIC.md §1 O6. Each control changes how the figure LOOKS — never the
// numbers dealt (O2) or the Support level (O3) — and the generator draws the choice into the item
// itself, so the screen card (q.visual) and the printed cell (the legacy print handler, which reads
// the same choice off the item's data) change together. The default of every control draws exactly
// what the skill drew before, so an old link or saved page is unchanged.
//
//   `labels` (5E)  "Figure labels": the numbers written ON the figure — side lengths, the angle's
//                  degrees, axis numbers, point names, ruler and thermometer numbers, the counting
//                  numbers under a measured object. "Some" always leaves enough to solve (the other
//                  sides follow from equal sides; the unnumbered inches follow by counting on).
//                  "None" is offered only where the pupil does not need the numbers to answer
//                  (naming an angle by its look, counting units or sides themselves).
//   `bars`   (9F)  "Bars": a bar graph drawn standing up or lying down. Both are read the same way,
//                  so both teach the skill (CCSS 2.MD.10 / 3.MD.3 show both).
// Graph-versus-table is NOT offered: every graph skill here is named for reading its graph
// (picture graph, bar graph, line plot, histogram, box plot), and a table would remove the graph
// the skill teaches (see the AP2 lane report).
const _AP2_DEFAULT = ' (default)';
const _ap2Labels = (values, dflt, words, help, helpShort) => ({
    id: 'labels', label: 'Figure labels', type: 'enum', group: 'layout', default: dflt,
    values: values.map(v => ({ v, l: words[v] + (v === dflt ? _AP2_DEFAULT : '') })),
    help, helpShort: helpShort || 'How many numbers are written on the figure.',
});
const _ap2Bars = () => ({
    id: 'bars', label: 'Bars', type: 'enum', group: 'layout', default: 'vertical',
    values: [{ v: 'vertical', l: 'Standing up (vertical)' + _AP2_DEFAULT }, { v: 'horizontal', l: 'Lying down (horizontal)' }],
    help: 'The same graph turned on its side: the categories go down the left and the scale runs along the bottom. The numbers and the question do not change.',
    helpShort: 'Bars standing up, or lying down.',
});
const _AP2_SIDES = { all: 'Every side labelled', some: 'One length and one width (the pupil uses equal sides)' };
const _AP2_COUNT_UNITS = { all: 'Every unit numbered (1, 2, 3 …)', some: 'Only the first unit numbered', none: 'No numbers: the pupil counts' };
const _AP2_AXES = { all: 'Every number on the axes', some: 'Every other number on the axes' };
const _AP2_POINTS = { all: 'Points named with their coordinates: A(3, 2)', some: 'Points named by letter only: A' };
[
    ['shapes_early:measure_nonstandard', _ap2Labels(['all', 'some', 'none'], 'all', _AP2_COUNT_UNITS,
        'The numbers under the units. Fewer numbers leaves more of the counting to the pupil; the units are always drawn.')],
    ['shapes_early:shape_attributes', _ap2Labels(['all', 'some', 'none'], 'all',
        { all: 'Every side numbered, every corner dotted', some: 'Only the first side or corner marked', none: 'No marks: the pupil counts' },
        'The numbers on the sides (or the dots on the corners) of a "How many" shape. Fewer marks leaves the counting to the pupil. The click-every-shape items have no marks.')],
    ['area_perimeter:perimeter_intro', _ap2Labels(['all', 'some'], 'all', _AP2_SIDES,
        'Some labels one length and one width of a rectangle or square; the pupil knows the opposite sides are equal. A triangle keeps all three sides, since none can be worked out.')],
    ['angles_lines:identify_angles', _ap2Labels(['all', 'none'], 'all',
        { all: 'The angle\'s degrees written', none: 'No degrees: name it by its look' },
        'The degree number beside the angle. Without it the pupil names the angle by comparing it with a square corner (the right-angle mark stays).')],
    ['coordinates:coordinate_q1', _ap2Labels(['all', 'some'], 'some', _AP2_AXES,
        'The numbers along the x- and y-axes. Every number is the easier step; every other number means counting on from a numbered line.')],
    ['coordinates:coordinate_all', _ap2Labels(['all', 'some'], 'some', _AP2_AXES,
        'The numbers along the x- and y-axes, negatives included. Every number is the easier step.')],
    ['coordinates:coordinate_graph', _ap2Labels(['all', 'some'], 'some', _AP2_AXES,
        'The numbers along the x- and y-axes. Every number is the easier step.')],
    ['coordinates:coord_distance_q1', _ap2Labels(['all', 'some'], 'all', _AP2_POINTS,
        'How the points are named, on the grid and in the question. By letter only, the pupil reads each point\'s position off the grid before finding the distance.',
        'Points named with coordinates, or by letter only.')],
    ['coordinates:coord_polygon', _ap2Labels(['all', 'some'], 'all', _AP2_POINTS,
        'How the corners are named, on the grid and in the question. By letter only, the pupil reads each corner\'s position off the grid before finding a side or the perimeter.',
        'Corners named with coordinates, or by letter only.')],
    ['measurement:reading_ruler', _ap2Labels(['all', 'some'], 'all',
        { all: 'Every inch numbered', some: 'Every other inch numbered (0, 2, 4, 6)' },
        'The numbers under the inch marks. With every other inch numbered the pupil counts on from a numbered mark; the tick marks do not change.')],
    ['measurement:reading_ruler_hard', _ap2Labels(['all', 'some'], 'all',
        { all: 'Every inch numbered', some: 'Every other inch numbered (0, 2, 4, 6)' },
        'The numbers under the inch marks. With every other inch numbered the pupil counts on from a numbered mark; the tick marks do not change.')],
    ['measurement:temperature', _ap2Labels(['all', 'some'], 'all',
        { all: 'Every 5 degrees numbered', some: 'Every 10 degrees numbered' },
        'The numbers on the thermometer scale for the "What temperature is shown?" items. There is a mark for every degree either way.')],
    ['graphs:bar_graph', _ap2Bars()],
    ['measurement:bar_graph_intro', _ap2Bars()],
].forEach(([key, ...defs]) => _o2Add(key, ...defs));
// ============================ end O6 · appearance: figures and data (AP2) ===================

Object.assign(SKILL_OPTIONS, P12_OPTIONS);
// ============================ end P12 · every other family ============================

// ===========================================================================
// O6 · AP1 · K-2 PICTURE KIND — "Objects"  (counting, comparing, composing; 2026-09-25)
// ===========================================================================
// OPTIONS-RUBRIC.md O6: a K-2 counting or composing skill offers the PICTURE KIND the pupil counts,
// wherever the skill can honestly draw more than one. The family shares ONE control, `objects`
// (share key J), with ONE value vocabulary, so a teacher reads the same words on every K-2 panel:
//   shapes    plain outline shapes (circle, square, triangle, star)      RP-20 plain set
//   pictures  the in-house line-art (ball, apple, fish, flower)          RP-20 picture set
//   frame     counters in ten (or five) frames                           RP-10 / RP-11
//   dice      dice patterns of up to six pips
//   blocks    base-10 blocks: a ten rod and unit cubes                   RP-30
// It is an APPEARANCE control (group 'layout'): it never changes the numbers dealt, only what the
// numbers are drawn with. Each skill offers only the kinds its picture can carry, its own default
// first, marked "(default)". The generator writes the choice into q.cell.payload and a sheet-kit
// template draws it (every skill with this control is a kit cell since round 2), so paper, key and
// screen draw the same picture. The default reproduces today's items exactly (add_5_pictures,
// tens_foundation_visual, classify_count and teen_compose moved to the kit in round 2: their
// defaults draw the same content as before, in kit form).
//
// Skills that keep ONE form (the drawing is the lesson): make_ten and ten_frame_build(_teen) (the
// ten frame is what is taught and counted), hundreds_chart_fill / number_chart_fill (the chart),
// base10_* (the blocks), count_sequence and number_seq_fill (a number path), compare_objects (its "What is compared" already picks lines, towers or bars).
const K2_OBJECT_LABELS = Object.freeze({
    shapes: 'Plain shapes (circles, squares, triangles, stars)',
    pictures: 'Pictures (balls, apples, fish)',
    frame: 'Counters in ten frames',
    dice: 'Dice patterns',
    blocks: 'Base-10 blocks (a ten rod and ones)',
});
/** The family's picture-kind control: `values` in panel order, `dflt` marked "(default)". */
export const k2ObjectsOption = (values, dflt, { labels = {}, help, appliesTo } = {}) => ({
    id: 'objects', label: 'Objects', type: 'enum', default: dflt, group: 'layout',
    values: values.map(v => ({ v, l: `${labels[v] || K2_OBJECT_LABELS[v]}${v === dflt ? ' (default)' : ''}` })),
    help: help || 'What the pupil counts. The numbers stay the same; only the picture changes.',
    ...(appliesTo ? { appliesTo } : {}),
});
/** Put `def` into a skill's list: in place of its own `id`, or at the end. */
const _ap1Put = (key, def, at = null) => {
    const list = (SKILL_OPTIONS[key] || []).slice();
    const i = list.findIndex(o => o && o.id === def.id);
    if (i >= 0) list[i] = def;
    else if (at !== null) list.splice(at, 0, def);
    else list.push(def);
    SKILL_OPTIONS[key] = list;
};
// Support level 0 on the picture skills is "the number sentence alone": no picture to choose.
const _ap1HasPicture = (o) => !(Array.isArray(o && o.level) && o.level.length && o.level.every(v => Number(v) === 0));
// count_objects: the same four kinds it always had, now through the family factory (the values,
// the default and the share tokens are unchanged; it moves under the Layout heading).
_ap1Put('counting:count_objects', k2ObjectsOption(['shapes', 'pictures', 'frame', 'dice'], 'shapes', {
    labels: { shapes: 'Plain shapes (one kind per item)' },
    help: 'What the pupil counts. Ten frames and dice let a pupil count on from a group he knows.',
}));
// compare_groups: both groups drawn the same way. Frames, shapes and pictures stand in rows of
// five on the same 10 mm pitch, one above the other, so the pupil still matches column by column.
_ap1Put('comparing:compare_groups', k2ObjectsOption(['frame', 'shapes', 'pictures', 'dice'], 'frame', {
    labels: { frame: 'Counters in ten frames', shapes: 'Plain shapes in rows of five', pictures: 'Pictures in rows of five (balls, apples, fish)',
        dice: 'Dice patterns (match the dice, then the dots)' },
    help: 'What each group is drawn with; both groups always use the same kind. Frames, shapes and pictures '
        + 'line up column by column so the pupil can match one to one; dice are compared by their dot patterns.',
}));
// classify_count: the category IS the kind of object, so only kinds that differ from each other:
// four plain shapes, or four pictures.
_ap1Put('comparing:classify_count', k2ObjectsOption(['shapes', 'pictures'], 'shapes', {
    labels: { pictures: 'Pictures (balls, apples, fish, flowers)' },
    help: 'What the pupil sorts. The kind to count is shown in the key box beside the picture.',
}));
// sub_5_pictures: the take-away picture (the taken ones crossed out). Hidden with Pictures off.
_ap1Put('subtraction:sub_5_pictures', k2ObjectsOption(['shapes', 'pictures', 'frame'], 'shapes', {
    labels: { pictures: 'Pictures (balls, apples, fish, flowers)', frame: 'Counters in a five frame' },
    help: 'What the take-away is drawn with. The ones taken away are crossed out in every kind.',
    appliesTo: (o) => o.pictures !== false,
}));
// teen_compose: a teen number as "a ten and some ones": a full ten frame and loose counters, or a
// ten rod and unit cubes. Hidden at Support level 0 (the number sentence alone).
_ap1Put('composing:teen_compose', k2ObjectsOption(['frame', 'blocks'], 'frame', {
    labels: { frame: 'A full ten frame and loose counters', blocks: 'A ten rod and unit cubes' },
    help: 'How the ten and the ones are drawn. The number sentence under the picture stays the same.',
    appliesTo: _ap1HasPicture,
}), 1);
// add_5_pictures (round 2, now the kit's counters cell): the two groups drawn as plain shapes,
// pictures, one five frame (the first group solid, the second hollow) or two dice. Hidden with
// Pictures off (the number sentence alone).
_ap1Put('addition:add_5_pictures', k2ObjectsOption(['shapes', 'pictures', 'frame', 'dice'], 'shapes', {
    labels: { shapes: 'Plain shapes (circles, squares, triangles, stars, diamonds)', pictures: 'Pictures (balls, apples, fish, flowers)',
        frame: 'Counters in a five frame (one group solid, one hollow)', dice: 'Two dice' },
    help: 'What the two groups are drawn with. The sum and the sentence under the picture stay the same.',
    appliesTo: (o) => o.pictures !== false,
}));
// tens_foundation_visual (round 2, now the kit's counters cell): the tens as rods (base-10
// blocks) or as full ten frames, each with its rule ("One rod is one ten." / "One full frame
// is one ten."). Both are a ten the pupil counts as one; the count of tens is the same.
_ap1Put('composing:tens_foundation_visual', k2ObjectsOption(['blocks', 'frame'], 'blocks', {
    labels: { blocks: 'Rods of ten (base-10 blocks)', frame: 'Full ten frames' },
    help: 'What one ten is drawn as. The pupil counts the tens either way.',
}));
// number_bonds: the bond drawn with the whole on top (RP-60, the default) or with the whole at
// the side, the two parts stacked to its right. Same boxes, same missing box.
_ap1Put('composing:number_bonds', {
    id: 'orientation', label: 'How the bond is drawn', type: 'enum', default: 'vertical', group: 'layout',
    values: [{ v: 'vertical', l: 'Whole on top, parts below (default)' }, { v: 'horizontal', l: 'Whole at the side, parts stacked' }],
    help: 'One way for the whole page. Seeing both ways shows the whole is the whole wherever it sits.',
});

// hundreds_chart_fill (owner, 2026-09-25): "Numbers to" 10, 20, 30, 40, 50 and 100. Each chart
// is the first N numbers in rows of ten; the window is cut from inside it (1 to 10 is its one
// row, drawn whole). 100 stays the default, so every old page and code is unchanged.
_ap1Put('composing:hundreds_chart_fill', _opsBand([10, 20, 30, 40, 50, 100], 100, {
    labels: { 10: '10 (the row 1 to 10)', 20: '20 (two rows)', 30: '30 (three rows)', 100: '100 (the whole chart)' },
    help: 'The chart the window is cut from: the first 10, 20, 30, 40, 50 or 100 numbers, ten to a row. '
        + 'A small chart holds fewer empty boxes (at most 5 in the row to 10, 6 in the chart to 20).',
}));
// number_chart_fill: the same window cut from a chart of bigger numbers (the hundreds, then the
// thousands). "Numbers in" names the stretch of the chart; every number in the window is in it.
SKILL_OPTIONS['composing:number_chart_fill'] = [
    _opsBand([200, 500, 1000, 5000, 10000], 200, {
        label: 'Numbers in',
        labels: { 200: '101 to 200', 500: '201 to 500', 1000: '501 to 1,000', 5000: '1,001 to 5,000', 10000: '5,001 to 10,000' },
        help: 'The stretch of the number chart the window is cut from. 101 to 1,000 is counting in the hundreds '
            + '(Level 2); the thousands need four- and five-digit boxes, so at size L the window prints one to a row.',
    }),
    {
        id: 'tiles', label: 'Empty boxes', type: 'enum', default: null, group: 'difficulty',
        values: [{ v: null, l: '1 to 3, dealt' }, { v: 1, l: '1 box' }, ...[2, 3, 4, 5, 6].map(n => ({ v: n, l: `${n} boxes` }))],
        help: 'How many numbers the pupil writes in each window (3 rows of 4): at most two in a row, never side by side.',
    },
];
// ============================ end O6 · AP1 · K-2 picture kind ============================

// O6 APPEARANCE · FRACTION MODELS AND NUMBER LINES  (lane AP3, 2026-09-25)
// ===========================================================================
// design/audit/OPTIONS-RUBRIC.md O6: "how an item looks", never the number size or the help.
// Appended to the skill's own panel under Layout ("only changes the look"). Each value changes
// the printed cell AND the screen, through one builder used by both:
//   model  "Fraction model" - gen-fractions.js _fModelPick -> sheet/cells/frac-model.js (screen
//          q.visual; print: the legacy handler draws fractionData.model / prints q.visual).
//          Offered only for the models a skill can honestly draw: a pupil does not SHADE a line.
//   ticks  "Numbers on the line" - which ticks carry a numeral (sheet/cells/line-labels.js); the
//          ticks themselves never move (P-1). + / − jump lines: number-line.js via
//          gen-operations.js _nlKitItem. Drag onto the line: nlData.labelAt, read by
//          widgets/nl-drag.js and the print twin. number_line_int: sheet/cells/value-line.js.
// Each default is what the skill drew before (R2), so an untouched skill and every old link draw
// the same items. Share-code keys: `model` 5D (reserved for exactly this); `ticks` 2E, the id and
// vocabulary nl_mult / nl_div already use ('one' = every number), with two new tokens.
const _AP3_MODEL = { area: 'Rectangle (area model)', bar: 'Bar (fraction strip)', circle: 'Circle', line: 'Number line 0 to 1 (a dot marks it)' };
const _ap3Model = (values, dflt, help, appliesTo = null) => ({
    id: 'model', label: 'Fraction model', type: 'set', group: 'layout', default: dflt,
    values: values.map(v => ({ v, l: _AP3_MODEL[v] })), allLabel: 'Every model, mixed', help,
    ...(appliesTo ? { appliesTo } : {}),
});
const _ap3Ticks = (values, dflt, help) => ({
    id: 'ticks', label: 'Numbers on the line', type: 'enum', default: dflt, group: 'layout',
    values: values.map(([v, l]) => ({ v, l: v === dflt ? `${l} (default)` : l })), help,
});
const _AP3_ADD_LINE = _ap3Ticks([['one', 'Every number: 0, 1, 2, 3 …'], ['some', 'Every 2nd number: 0, 2, 4 …'], ['ends', 'The two ends only']], 'one',
    'Which ticks carry a numeral. Every number has a tick and every hop is one number whatever you choose; '
    + 'the dot the pupil starts from is always numbered. Fewer numerals make the pupil count along the ticks.');
const _AP3_OPTIONS = {
    'fractions:identify': [_ap3Model(['area', 'bar', 'circle', 'line'], ['bar', 'circle'],
        'Default: circles and bars, mixed, as the skill always drew. The picture on each "What fraction is shaded?" item, '
        + 'on paper and on screen: tick one model for a page of it, or several to mix them. On a number line a dot marks '
        + 'the fraction. The other kinds of item (pick the model, name the numerator) keep their own look.',
        (o) => !Array.isArray(o.forms) || !o.forms.length || o.forms.includes(0))],
    'fractions:write_fraction': [_ap3Model(['area', 'bar', 'circle', 'line'], ['area', 'bar', 'circle'],
        'Default: rectangles, bars and circles, mixed. The picture the pupil writes the fraction for, on paper and on '
        + 'screen. Tick one model for a page of it. On a number line a dot marks the fraction.')],
    'fractions:shade_fraction': [_ap3Model(['area', 'bar', 'circle'], ['area', 'bar', 'circle'],
        'Default: rectangles, bars and circles, mixed. The empty picture the pupil shades, on paper and on screen. '
        + 'A number line is not offered: a pupil marks a point on a line, he does not shade it.')],
    'fractions:compare': [_ap3Model(['bar', 'circle', 'area', 'line'], ['bar', 'circle'],
        'Default: bars on screen and circles on paper, as the skill always drew. The two pictures on each "compare the '
        + 'fractions" item: tick one model and both fractions are drawn that way, on the same size of whole, on paper and '
        + 'on screen. The other kinds of item (numbers only, compare to 1/2) have no picture.',
        (o) => !Array.isArray(o.forms) || !o.forms.length || o.forms.includes(0))],
    'fractions:equiv_frac_visual': [_ap3Model(['circle', 'bar', 'area'], ['circle'],
        'Default: circles, as the skill always drew. Both fractions are drawn as the ticked model on the same size of whole, '
        + 'so the pupil sees they cover the same amount; the shade-it items on paper give an empty one of the same model. '
        + 'Bars (fraction strips) are the usual picture for equivalence.')],
    'fraction_operations:add_fractions_like': [_ap3Model(['bar', 'area', 'circle'], ['bar'],
        'Default: the skill\'s own bars. A rectangle or a circle draws each fraction of the sum that way, in black and '
        + 'white, and never draws the answer. Pictures off prints numbers only.', (o) => o.pictures !== false)],
    'fraction_operations:sub_fractions_like': [_ap3Model(['bar', 'area', 'circle'], ['bar'],
        'Default: the skill\'s own bars. A rectangle or a circle draws both fractions that way, in black and white, and '
        + 'never draws the answer. Pictures off prints numbers only.', (o) => o.pictures !== false)],
    'addition:number_line_add': [_AP3_ADD_LINE],
    'subtraction:number_line_sub': [_AP3_ADD_LINE],
    'addition:nl_add': [_AP3_ADD_LINE],
    'subtraction:nl_sub': [_AP3_ADD_LINE],
    'integers:number_line_int': [_ap3Ticks([['one', 'Every number but the marked one'], ['some', 'Every 5th number: −10, −5, 0, 5, 10'],
        ['ends', 'The two ends and 0']], 'some',
    'Which ticks carry a numeral; the marked number is never numbered. Every 5th is the line the skill always drew. '
        + 'Every number and the ends draw a line of 20 with a tick at every whole number, so the pupil counts from a numeral.')],
    'integers:integer_nl_drag': [_ap3Ticks([['one', 'Every number: −10, −9, −8 …'], ['some', 'Every 5th number, the ends and 0'],
        ['ends', 'The two ends and 0']], 'some',
    'Which ticks carry a numeral; there is a tick at every whole number whatever you choose. With every number the '
        + 'pupil matches each number to its numeral; with fewer he counts along the ticks. On the −5 to 5 line every '
        + '5th becomes every 2nd.')],
    'decimals:decimal_nl_drag': [_ap3Ticks([['one', 'Every tenth: 0, 0.1, 0.2 …'], ['some', '0, 0.5 and 1'], ['ends', '0 and 1 only']], 'some',
        'Which ticks carry a numeral; there is a tick at every tenth whatever you choose. With every tenth the pupil '
        + 'matches each decimal to its numeral; with fewer he counts the tenths.')],
    'fractions:fraction_nl_drag': [_ap3Ticks([['one', 'Every part: 0, 1/4, 2/4 …'], ['some', '0, the halfway tick and 1'], ['ends', '0 and 1 only']], 'one',
        'Which ticks carry a numeral; the line is always cut into equal parts. With every part numbered the pupil '
        + 'matches each fraction to its numeral; with fewer he counts the parts. A line in thirds or fifths has no '
        + 'halfway tick, so there "halfway" numbers 0 and 1 only.')],
    'fractions:mixed_nl_drag': [_ap3Ticks([['some', 'Every whole number: 0, 1, 2, 3'], ['ends', '0 and 3 only']], 'some',
        'Which ticks carry a numeral; every whole number and every part has a tick whatever you choose. With the '
        + 'ends only the pupil counts the wholes too. (Every part is not offered: nineteen mixed numbers do not fit.)')],
};
for (const [key, defs] of Object.entries(_AP3_OPTIONS)) SKILL_OPTIONS[key] = [...(SKILL_OPTIONS[key] || []), ...defs];
// ============================ end O6 · fraction models and number lines ============================

// ===========================================================================
// WORD WORK · the keyword supports of every whole-number word problem (2026-09-25)
// ===========================================================================
// Every story is drawn by the word-work cell (sheet/cells/word-work.js: story, a small + − × ÷
// row, column boxes, "Answer: [ ] ____" with a unit bank). Its three supports are hints, so they
// are OFF by default and fade by being switched off (owner ruling 2026-09-25). Read by
// js/modules/word-work.js. The ranged stories (add_wp_* / sub_wp_*) already carry the bar model
// as `support: bar` (_opsBar), so they get the two keyword supports only.
const WORD_WORK_OPTIONS = (bar) => [
    { id: 'wpCues', label: 'Key words', type: 'bool', default: false, group: 'support',
        help: 'The words that point to the sign (in all, left, each, share equally) print bold and underlined.' },
    { id: 'wpBank', label: 'Keyword bank', type: 'bool', default: false, group: 'support',
        help: 'A small box beside each story lists the key words for + − × ÷.' },
    ...(bar ? [{ id: 'wpBar', label: 'Bar model', type: 'bool', default: false, group: 'support',
        help: 'A bar model under each story (parts and whole, compare, or equal parts) with empty labels to fill.' }] : []),
];
{
    const own = ['addition:add_word_problems', 'subtraction:sub_word_problems', 'multiplication:mult_word_problems',
        'division:div_word_problems', 'multiplication:mult_comparison', 'algebra:multi_step_word'];
    const keys = [...own, ...own.map(k => `${k}_plain`), 'division:remainder_interpret', 'division:remainder_contexts', 'addition:add_wp_10'];
    for (const op of ['add', 'sub']) for (const code of Object.keys(_OPS_BANDS)) keys.push(`${op === 'add' ? 'addition' : 'subtraction'}:${op}_wp_${code}`, `${op === 'add' ? 'addition' : 'subtraction'}:${op}_wp_${code}_plain`);
    for (const key of new Set(keys)) {
        const cur = SKILL_OPTIONS[key] || [];
        const hasBar = cur.some(o => o.id === 'support' && Array.isArray(o.values) && o.values.some(v => v.v === 'bar'));
        SKILL_OPTIONS[key] = [...cur, ...WORD_WORK_OPTIONS(!hasBar)];
    }
}

// ===========================================================================
// BUILD LANE k2 · COUNTING AND EARLY NUMBER (2026-09-25, design/BUILD_LIST.md lane k2)
// ===========================================================================
// The new K-1 skills and the options on existing K skills. Every control moves ONE thing (P-1):
// the number range (difficulty), the task (the problem type, one per page), the support level
// (hints that fade; the structure stays) and the picture (appearance). Each default is the
// stand-alone value (R2). Share keys: the existing one-letter keys (band B, objects J, task K,
// level L, tiles Y, orientation O, response R, model 5D, place Q) with new value tokens only.
const K2_LANE_OPTIONS = {
    'counting:zero_none': [
        _opsBand([3, 5, 10], 5, { label: 'Count to', labels: { 3: '0 to 3', 5: '0 to 5', 10: '0 to 10' },
            help: 'The most objects on a plate. A third of the items are empty (0) at every range.' }),
        {
            id: 'task', label: 'Task', type: 'enum', default: 'count', group: 'difficulty',
            values: [{ v: 'count', l: 'How many? (0 for none) (default)' }, { v: 'find', l: 'Which one has none? (check a box)' },
                { v: 'compute', l: 'Take them all away (5 − 5 = 0)' }],
            help: 'One task for the whole page. "How many?" writes a number, 0 included; "Which one has none?" checks the empty '
                + 'one of three; "Take them all away" crosses out every object and writes what is left.',
        },
        { ...levelSubset([2, 1], 1, 'Level 2 prints a number track 0 to the top number under each picture (0 comes first); '
            + 'level 1 is the picture alone.'), appliesTo: (o) => !o.task || o.task === 'count' },
        {
            id: 'objects', label: 'Objects', type: 'enum', default: 'plates', group: 'layout',
            values: [{ v: 'plates', l: 'Pictures on plates (default)' }, { v: 'boxes', l: 'Pictures in boxes' }, { v: 'frame', l: 'Counters in a ten frame' }],
            help: 'What holds the objects. An empty plate, an empty box or an empty ten frame is 0.',
        },
    ],
    'comparing:compare_size': [
        {
            id: 'task', label: 'Task', type: 'enum', default: 'find', group: 'difficulty',
            values: [{ v: 'find', l: 'Check the bigger or smaller one (default)' }, { v: 'order', l: 'Order three by size (write 1, 2, 3)' }],
            help: 'One task for the whole page. Ordering always shows three and starts with the smallest.',
        },
        {
            id: 'dir', label: 'Which one', type: 'enum', default: 'more', group: 'difficulty',
            values: [{ v: 'more', l: 'The bigger one (default)' }, { v: 'less', l: 'The smaller one' }],
            help: 'Bigger first; smaller is the harder word. One for the whole page.',
            appliesTo: (o) => o.task !== 'order',
        },
        {
            id: 'tiles', label: 'How many pictures', type: 'enum', default: 2, group: 'difficulty',
            values: [{ v: 2, l: 'Two (bigger / smaller) (default)' }, { v: 3, l: 'Three (biggest / smallest)' }],
            help: 'Two pictures, then three: with three the pupil compares twice.',
            appliesTo: (o) => o.task !== 'order',
        },
        {
            id: 'gap', label: 'How different', type: 'enum', default: 'far', group: 'difficulty',
            values: [{ v: 'far', l: 'Very different sizes (default)' }, { v: 'near', l: 'Close sizes (look carefully)' }],
            help: 'Close sizes are harder: the smaller picture is three quarters of the bigger one.',
        },
        { ...levelSubset([2, 1], 1, 'Level 2 draws a base line under the row, so the pupil sees the pictures stand on one floor; level 1 leaves it out.') },
        {
            id: 'objects', label: 'Objects', type: 'enum', default: 'pictures', group: 'layout',
            values: [{ v: 'pictures', l: 'Pictures (ball, apple, car, house ...) (default)' }, { v: 'shapes', l: 'Plain shapes (circle, square, triangle ...)' }],
            help: 'What is drawn. One kind in each item, at two or three sizes.',
        },
    ],
    'comparing:odd_one_out': [
        {
            id: 'task', label: 'Task', type: 'enum', default: 'find', group: 'difficulty',
            values: [{ v: 'find', l: 'Find the one that does not belong (default)' }, { v: 'rule', l: 'Say why: the odd one is circled, check the reason' }],
            help: 'One task for the whole page. "Say why" names the rule: a different kind or a different size.',
        },
        {
            id: 'attr', label: 'What is different', type: 'enum', default: 'kind', group: 'difficulty',
            values: [{ v: 'kind', l: 'The kind of thing (default)' }, { v: 'size', l: 'The size (all the same kind)' }, { v: 'mixed', l: 'Kind or size, mixed on the page' }],
            help: 'Kind first (three apples and a ball), then size (three small balls and a big one), then both on one page.',
        },
        {
            id: 'tiles', label: 'How many pictures', type: 'enum', default: 4, group: 'difficulty',
            values: [{ v: 3, l: 'Three' }, { v: 4, l: 'Four (default)' }],
            help: 'Three pictures (two alike) is easier to hold in mind than four.',
        },
        { ...levelSubset([2, 1], 1, 'Level 2 prints "Look at the kind." or "Look at the size." under the row; level 1 leaves the pupil to find what is different. (Find the one only: on "Say why" the cue would be the answer.)'),
            appliesTo: (o) => o.task !== 'rule' },
        {
            id: 'objects', label: 'Objects', type: 'enum', default: 'pictures', group: 'layout',
            values: [{ v: 'pictures', l: 'Pictures (ball, apple, car, house ...) (default)' }, { v: 'shapes', l: 'Plain shapes (circle, square, triangle ...)' }],
            help: 'What is drawn. With shapes, a different kind is a different shape.',
        },
    ],
    'counting:match_same': [
        {
            id: 'match', label: 'What matches', type: 'enum', default: 'same', group: 'difficulty',
            values: [{ v: 'same', l: 'The same picture (default)' }, { v: 'shadow', l: 'The picture that fits a shadow' }, { v: 'kind', l: 'The same kind, another size' }],
            help: 'One for the whole page: the identical picture first, then a picture to its grey shadow, then the same kind drawn smaller.',
        },
        {
            id: 'tiles', label: 'How many to choose from', type: 'enum', default: 3, group: 'difficulty',
            values: [{ v: 2, l: 'Two' }, { v: 3, l: 'Three (default)' }, { v: 4, l: 'Four' }],
            help: 'More pictures beside the box is harder: more to look at before finding the match.',
        },
        {
            id: 'objects', label: 'Objects', type: 'enum', default: 'pictures', group: 'layout',
            values: [{ v: 'pictures', l: 'Pictures (ball, apple, car, house ...) (default)' }, { v: 'shapes', l: 'Plain shapes (circle, square, triangle ...)' }],
            help: 'What is drawn in the box and in the row.',
        },
    ],
    'comparing:compare_capacity': [
        {
            id: 'task', label: 'Task', type: 'enum', default: 'read', group: 'difficulty',
            values: [{ v: 'read', l: 'Full, half full or empty? (check the word) (default)' }, { v: 'find', l: 'Which holds more? (two sizes, empty)' },
                { v: 'fill', l: 'Which has more in it? (two fills)' }, { v: 'order', l: 'Order three by how much they hold (write 1, 2, 3)' }],
            help: 'One task for the whole page: the words first, then comparing two (how much it holds, then how much is in it), then ordering three.',
        },
        {
            id: 'tiles', label: 'Words to choose from', type: 'enum', default: 3, group: 'difficulty',
            values: [{ v: 3, l: 'Three: full, half full, empty (default)' }, { v: 5, l: 'Five: also nearly full, nearly empty' }],
            help: 'Nearly full and nearly empty come after the three main words. (The word task only.)',
            appliesTo: (o) => !o.task || o.task === 'read',
        },
        { ...levelSubset([2, 1], 1, 'Level 2 draws a small glass beside each word (full, half full, empty) as a picture of the word; level 1 prints the words alone. (The word task only.)'),
            appliesTo: (o) => !o.task || o.task === 'read' },
        {
            id: 'objects', label: 'Containers', type: 'enum', default: null, group: 'layout',
            values: [{ v: null, l: 'Mixed: glass, jug, bucket, bottle, bowl (default)' }, { v: 'glass', l: 'Glasses' }, { v: 'jug', l: 'Jugs' },
                { v: 'bucket', l: 'Buckets' }, { v: 'bottle', l: 'Bottles' }, { v: 'bowl', l: 'Bowls' }],
            help: 'What is drawn. Mixed deals a different container in each item.',
        },
    ],
    'comparing:what_can_we_measure': [
        {
            id: 'task', label: 'Task', type: 'enum', default: 'read', group: 'difficulty',
            values: [{ v: 'read', l: 'What can we measure? (check the word) (default)' }, { v: 'find', l: 'Which tool measures it? (ruler, scale, jug)' }],
            help: 'One task for the whole page: name what can be measured first, then choose the tool.',
        },
        {
            id: 'count', label: 'Measures in play', type: 'enum', default: 2, group: 'difficulty',
            values: [{ v: 2, l: 'Two: how long, how heavy (default)' }, { v: 4, l: 'Four: also how tall, how much it holds' }],
            help: 'Long and heavy first; tall and how much it holds come next.',
        },
        {
            id: 'tiles', label: 'Choices', type: 'enum', default: 2, group: 'difficulty',
            values: [{ v: 2, l: 'Two to choose from (default)' }, { v: 3, l: 'Three to choose from' }],
            help: 'Two: one we can measure and one we cannot. Three adds another.',
        },
        { ...levelSubset([2, 1], 1, 'Level 2 draws a small picture beside each word (an arrow for long, a weight for heavy, a jug for holds); level 1 prints the words alone. (The word task only: the tools are always pictured.)'),
            appliesTo: (o) => o.task !== 'find' },
    ],
    'counting:ordinal_numbers': [
        _opsBand([3, 5, 10], 5, { label: 'Places to', labels: { 3: '1st to 3rd (three in the line)', 5: '1st to 5th (five in the line)', 10: '1st to 10th (ten in the line)' },
            help: 'How long the line is: 1st to 3rd first, then to 5th, then to 10th (a whole row, one item a row).' }),
        {
            id: 'task', label: 'Task', type: 'enum', default: 'find', group: 'difficulty',
            values: [{ v: 'find', l: 'Check the one in the place shown (3rd) (default)' }, { v: 'write', l: 'Write the place of the star (4th)' }],
            help: 'One task for the whole page: find the place first, then write it (the pupil writes 1st, 2nd, 3rd ...).',
        },
        { ...levelSubset([2, 1], 1, 'Level 2 prints 1, 2, 3 ... under the places (the boxes are numbered); level 1 keeps only the start flag.') },
        {
            id: 'objects', label: 'Objects', type: 'enum', default: 'pictures', group: 'layout',
            values: [{ v: 'pictures', l: 'Pictures (ball, car, fish ...) (default)' }, { v: 'shapes', l: 'Plain shapes (circle, square, triangle ...)' }],
            help: 'What stands in the line. The line is always one kind, with a star to find on "Write the place".',
        },
    ],
    'comparing:sort_into_groups': [
        {
            id: 'task', label: 'Task', type: 'enum', default: 'count', group: 'difficulty',
            values: [{ v: 'count', l: 'Sort the pictures, write how many in each ring (default)' }, { v: 'most', l: 'Sorted: check the ring with the most' },
                { v: 'order', l: 'Sorted: order three rings, fewest first (write 1, 2, 3)' }, { v: 'rule', l: 'Find the rule: how are they sorted?' }],
            help: 'One task for the whole page: sort and count first; then compare the groups; then name the rule of a finished sort.',
        },
        {
            id: 'attr', label: 'Sort by', type: 'enum', default: 'kind', group: 'difficulty',
            values: [{ v: 'kind', l: 'Kind of thing (apples, balls ...) (default)' }, { v: 'shape', l: 'Shape (circles, squares ...)' },
                { v: 'size', l: 'Size (big / small)' }, { v: 'weight', l: 'Heavy or light' }],
            help: 'The rule the rings sort by. Size and heavy / light are always two rings (ordering three rings sorts by kind).',
        },
        {
            id: 'tiles', label: 'Groups', type: 'enum', default: 2, group: 'difficulty',
            values: [{ v: 2, l: 'Two rings (default)' }, { v: 3, l: 'Three rings' }],
            help: 'Three rings is harder: each picture has three places it could go. (Kind or shape.)',
        },
        { ...levelSubset([3, 2, 1], 2, 'Level 3 places the first picture for the pupil (its letter written in its ring in grey); level 2 labels each ring with a picture; level 1 labels the rings in words only.') },
        {
            id: 'model', label: 'Drawn as', type: 'enum', default: 'circle', group: 'layout',
            values: [{ v: 'circle', l: 'Sorting rings (default)' }, { v: 'grid', l: 'Boxes side by side (a sorting table)' }],
            help: 'The same sort, in hoops or in the boxes of a table.',
        },
    ],
};
for (const [key, defs] of Object.entries(K2_LANE_OPTIONS)) SKILL_OPTIONS[key] = defs;

// Options the lane adds to EXISTING K skills (build list: count_objects_more, count_conserve,
// chart_120, hundreds_foundation, teen_structure, pictures_to_sentence, regroup_hundreds). Each
// keeps the skill's old default, so an old page or link deals exactly what it did (R2).
const _k2Swap = (key, id, fn) => {
    const list = (SKILL_OPTIONS[key] || []).slice();
    const i = list.findIndex((o) => o && o.id === id);
    if (i >= 0) list[i] = fn(list[i]); else list.push(fn(null));
    SKILL_OPTIONS[key] = list;
};
// count_objects: count to 30 (rows of ten, M.EE.2.NBT.2); objects in a circle (K.CC.B.5); the
// "same number?" task (conservation, K.CC.B.4b).
_k2Swap('counting:count_objects', 'band', () => _opsBand([5, 10, 20, 30], 20, { label: 'Count to',
    labels: { 30: '30 (rows of ten)' }, help: 'The largest number on the page. To 30 draws the objects in rows of ten.' }));
_k2Swap('counting:count_objects', 'orientation', (o) => ({ ...o,
    values: [...o.values.filter((v) => v.v !== 'circle'), { v: 'circle', l: 'In a circle (mark where you start)' }],
    help: 'Scattered and in a circle are the hardest: the pupil has to keep track of what he has counted '
        + '(in a circle, where he started). Support level 2 marks the first object of a circle.' }));
_k2Swap('counting:count_objects', 'task', () => ({
    id: 'task', label: 'Task', type: 'enum', default: 'count', group: 'difficulty',
    values: [{ v: 'count', l: 'How many? (default)' }, { v: 'same', l: 'Same number? (the same objects moved: check a box)' }],
    help: 'Same number? shows two pictures, the second spread out or in another order: the number does not change when '
        + 'objects move. Half the items really are the same. (Counted to 10 at most.)',
}));
// ============================ end build lane k2 ============================
// ================ O6 · APPEARANCE: OPERATIONS, CLOCKS, MONEY  (lane AP4, 2026-09-25) ================
// design/audit/OPTIONS-RUBRIC.md §1 O6. Each control changes how an item LOOKS — never the numbers
// dealt (O2) or the Support level (O3) — and the generator writes the choice into the item's kit
// cell (q.cell.payload), which the printed cell and the screen twin both draw. The default of every
// control draws exactly what the skill drew before, so an old link or saved page is unchanged.
// Keys: `notation` (N), `numerals` (1N) and `order` (V), with their existing value tokens.
//
// HOW IT IS WRITTEN — decided per skill (the pupils are SPED / ELL; one form is kept where the
// column or the bracket IS the lesson, and the help line says why):
//   add_/sub_ 50 … 1m ids  across is offered wherever the page is one-line work: within 100 with no
//                          regrouping (2.NBT.5: tens and ones, mentally). A regrouping item, and
//                          every item from within 1,000 up, stays stacked — the regroup box sits
//                          over the next column, and past two digits the columns line the places
//                          up. So the control is declared on the four 50 / 100 no-regrouping ids;
//                          on every other id the Support level's help line says "always stacked"
//                          and why.
//   mult_zeros             across (default) / stacked: 70 above × 8 is the column the algorithm
//                          will use, and a one-digit × a multiple of ten keeps its carry box.
//   div_remainders         across (default) / the long-division bracket (4.NBT.6 writes remainders
//                          both ways); the counters and the two answer boxes are the same.
//   add_three              across (default) / stacked; the dot groups belong to the across
//                          sentence, so "Pictures" shows while Across is ticked.
//   multiply / divide      the existing control shows only while the item is a fact: bigger
//                          numbers are always stacked / in the bracket (the tiles help says so).
//   one form, stated       sub_across_zeros and mult_placeholder_zero (the column is the lesson).
//   not here               integers (signed numbers are not added in columns; they are written
//                          across only) and add / sub / mult_decimal (gen-fractions.js; lining up
//                          the points is the lesson) — see the AP4 report.
// CLOCKS: "Numbers on the clock" (1N) on every skill that draws an analog face and lacked it.
// MONEY: "Coins set out" (V) on every skill that draws a collection of coins to count or compare.
const _AP4_DEFAULT = ' (default)';
const _ap4Add = (key, ...defs) => { if (SKILL_OPTIONS[key]) SKILL_OPTIONS[key] = [...SKILL_OPTIONS[key], ...defs]; };
const _ap4First = (key, def) => { if (SKILL_OPTIONS[key]) SKILL_OPTIONS[key] = [def, ...SKILL_OPTIONS[key]]; };
/** Replace one control of a skill with a patched copy (the original def objects are shared). */
const _ap4Patch = (key, id, patch) => {
    const list = SKILL_OPTIONS[key];
    if (!list) return;
    SKILL_OPTIONS[key] = list.map(d => (d.id === id ? { ...d, ...patch(d) } : d));
};
const _ap4Ticked = (cur, dflt) => {
    const t = cur && cur.notation;
    return Array.isArray(t) && t.length ? t : typeof t === 'string' ? [t] : dflt;
};

// ---- + / − from within 50 up -------------------------------------------------------------
/** Is the rung these choices deal one-line work (gen-operations.js ranged branch)? */
const _ap4OneLine = (ownMax, ownRg) => (cur) => {
    const b = Number(cur && cur.band);
    const band = b && b <= ownMax ? b : ownMax;
    const rg = ownRg === 'mixed' && cur && cur.regroup
        ? ({ none: 'no_regroup', always: 'regroup', mixed: 'mixed' }[cur.regroup] || 'mixed') : ownRg;
    return band <= 20 || (band <= 100 && rg === 'no_regroup');
};
const _ap4OpsNotation = (op, ownMax, ownRg) => {
    const g = op === 'add' ? '+' : '−';
    const [a, b] = op === 'add' ? ['34', '25'] : ['68', '25'];
    return {
        ...notationOption(op === 'add' ? '+' : '-'),
        values: [
            { v: 'stacked', l: `Stacked  (${a} above ${g} ${b}, with a rule under it)${_AP4_DEFAULT}` },
            { v: 'across', l: `Across  (${a} ${g} ${b} = __)` },
        ],
        help: 'Tick one way for a single-notation page, or both to mix them so the pupil has to rewrite between '
            + 'the two. Across is offered here because no item regroups and every number has at most two digits '
            + '(2.NBT.5: tens and ones, on one line). The regrouping skills, and every skill from within 1,000 up, '
            + 'stay stacked, because the regroup box sits over the next column and the columns line the places up.',
        helpShort: 'Stacked in columns, or across on one line. Regrouping and bigger numbers are always stacked.',
    };
};
for (const op of ['add', 'sub']) {
    const cat = op === 'add' ? 'addition' : 'subtraction';
    for (const [code, max] of Object.entries(_OPS_BANDS)) {
        if (max < 50) continue;
        for (const rg of ['no_regroup', 'regroup', 'mixed']) {
            const key = `${cat}:${op}_${code}_${rg}`;
            const oneLine = _ap4OneLine(max, rg);
            // Declared only where the id's OWN rung is one-line work (within 50 / 100, no
            // regrouping): a control whose value is overruled at the skill's default would be a
            // dead end (OC6). Lowering the band on those ids still reaches the within-20 rungs,
            // which honour it too.
            if (oneLine({})) _ap4First(key, _ap4OpsNotation(op, max, rg));
            // The column support level draws on stacked items only: hidden when every item is across.
            // Its help line carries the one-form reason where across is not on offer.
            const why = rg === 'no_regroup'
                ? 'Always stacked from within 1,000 up: the columns line the places up.'
                : 'Regrouping items are always stacked: the regroup box sits over the next column.';
            _ap4Patch(key, 'level', (d) => ({
                appliesTo: (cur) => (typeof d.appliesTo !== 'function' || d.appliesTo(cur))
                    && (!oneLine(cur) || _ap4Ticked(cur, ['stacked']).includes('stacked')),
                helpShort: `${why} 3 traces the answer, 2 adds the place heads, 1 is the bare column.`,
            }));
        }
    }
}

// ---- the other operations --------------------------------------------------------------------
_ap4Patch('subtraction:sub_across_zeros', 'band', () => ({
    helpShort: 'The largest number you start from. Always stacked: the borrow crosses the zero column by column.',
}));
_ap4Patch('multiplication:mult_placeholder_zero', 'tiles', (d) => ({
    helpShort: 'The multiplier always has two digits. Always stacked: the zero holds a place in the second row.',
    help: `${d.help} Always stacked: the placeholder zero is a place in the second row, which only the column shows.`,
}));
// × / ÷ by size: the existing notation control shows only while the item is a fact.
_ap4Patch('multiplication:multiply', 'notation', () => ({
    appliesTo: (cur) => cur.tiles === null || cur.tiles === undefined || Number(cur.tiles) === 11,
}));
_ap4Patch('multiplication:multiply', 'tiles', (d) => ({
    helpShort: 'The size of the two numbers. From 2-digit × 1-digit up the item is always stacked: the carries need the columns.',
    help: `${d.help} From 2-digit × 1-digit up the item is always stacked, because the carry boxes sit over the columns.`,
}));
_ap4Patch('division:divide', 'notation', () => ({
    appliesTo: (cur) => (cur.tiles === null || cur.tiles === undefined) && (cur.regroup || 'none') === 'none',
}));
_ap4Patch('division:divide', 'tiles', (d) => ({
    helpShort: 'The size of the numbers. A 2-digit number shared, or a remainder, is always in the bracket, where the working goes.',
    help: `${d.help} A 2-digit or bigger number shared, and any remainder, is always written in the long-division bracket, because that is where the working goes.`,
}));
_ap4Add('multiplication:mult_zeros', {
    id: 'notation', label: 'How it is written', type: 'set', default: ['across'],
    values: [
        { v: 'across', l: `Across  (8 × 70 = __)${_AP4_DEFAULT}` },
        { v: 'stacked', l: 'Stacked  (70 above × 8, with a rule under it)' },
    ],
    allLabel: 'Both ways, mixed',
    help: 'Across reads the pattern along one line (8 × 7 = 56, so 8 × 70 = 560). Stacked writes the multiple of '
        + 'ten on top and the one-digit number under it, the column the written method uses, with its carry box. '
        + 'Tick both to mix them on one page.',
    helpShort: 'Across on one line, or stacked in a column (multiple of ten on top).',
});
_ap4Add('division:div_remainders', {
    id: 'notation', label: 'How it is written', type: 'set', default: ['across'],
    values: [
        { v: 'across', l: `Across  (23 ÷ 5 = __ R __)${_AP4_DEFAULT}` },
        { v: 'bracket', l: 'Long division bracket  (5 ⟌ 23, the answer on top, R beside it)' },
    ],
    allLabel: 'Both ways, mixed',
    help: 'The same division under the same counters, written across or in the long-division bracket, the '
        + 'form written division grows into. The pupil writes the quotient and the remainder either way. Tick '
        + 'both to mix them on one page.',
    helpShort: 'Across (23 ÷ 5), or in the long-division bracket (5 ⟌ 23).',
});
_ap4First('addition:add_three', {
    id: 'notation', label: 'How it is written', type: 'set', default: ['across'],
    values: [
        { v: 'across', l: `Across  (8 + 5 + 3 = __)${_AP4_DEFAULT}` },
        { v: 'stacked', l: 'Stacked  (8, 5 and 3 in one column)' },
    ],
    allLabel: 'Both ways, mixed',
    help: 'Stacked puts the three numbers in one column over a rule, so the pupil can look for two that make ten. '
        + 'The dot pictures stand along the across sentence, so a stacked item is numbers only; tick both ways to '
        + 'mix pictured sentences with columns on one page.',
    helpShort: 'Across on one line (with the dot pictures), or the three numbers in one column.',
});
// The dot groups belong to the across sentence: "Pictures" shows while Across is ticked.
_ap4Patch('addition:add_three', 'pictures', () => ({
    appliesTo: (cur) => _ap4Ticked(cur, ['across']).includes('across'),
}));

// ---- clocks: "Numbers on the clock" (1N) -------------------------------------------------------
_ap4Add('measurement:time_fives_ring', { ..._tmNumerals(), group: 'layout',
    help: 'The hour numbers printed on the face. Fewer numbers is harder: the pupil finds each 5 by its place round the face. The minute boxes do not change.' });
_ap4Add('measurement:clock_parts', { ..._tmNumerals(), group: 'layout',
    help: 'The numbers printed on the face. "Write the missing numbers" always leaves 3 to 5 places as boxes; with fewer numbers printed the pupil counts round from the nearest printed one. "Which is the hour hand" prints the same face with its hands.',
    helpShort: 'The numbers printed on the face. Fewer is harder: the pupil counts round from 12.' });
for (const id of ['elapsed_visual_easy', 'elapsed_visual_medium', 'elapsed_visual_hard']) {
    _ap4Add(`measurement:${id}`, { ..._tmNumerals(), group: 'layout',
        help: 'The hour numbers on the two clock faces. Fewer numbers is harder: the pupil reads the hands by their position.',
        appliesTo: (cur) => cur.notation !== 'digital' });
}
{
    const FACE = ['time_hour', 'time_half_hour', 'time_quarter', 'time_5min', 'time_1min', 'time_analog_digital', 'time_match_clock'];
    _ap4Add('measurement:mixed_time', { ..._tmNumerals(), group: 'layout',
        help: 'The numbers on every clock face in the review. Fewer numbers is harder: the pupil reads the hands by their position.',
        appliesTo: (cur) => !Array.isArray(cur.members) || cur.members.some(m => FACE.includes(m)) });
}

// ---- money: "Coins set out" (V) ------------------------------------------------------------
const _ap4CoinsSetOut = () => ({
    id: 'order', label: 'Coins set out', type: 'enum', default: 'largest', group: 'layout',
    values: [
        { v: 'largest', l: `Biggest first, in a row${_AP4_DEFAULT}` },
        { v: 'scrambled', l: 'Scattered: the pupil finds the biggest first' },
    ],
    help: 'The same coins, set out biggest first or scattered. Scattered is harder: the pupil has to find the biggest coin before counting on. Notes stay biggest first.',
    helpShort: 'Biggest coin first, or scattered so the pupil finds the biggest.',
});
for (const id of ['equiv_coin_sets', 'enough_money', 'money_compare']) _ap4Add(`measurement:${id}`, _ap4CoinsSetOut());
_ap4Add('measurement:money_notation', { ..._ap4CoinsSetOut(), appliesTo: (cur) => cur.task !== 'words' });
// ============================ end O6 · appearance: operations, clocks, money (AP4) ============

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

// Decimal skills that live outside the decimals category (the decimals review of Mixed FDP).
const DECIMAL_SKILLS_ELSEWHERE = new Set(['decimals_all']);
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
// O2: a graph's `most` (the tallest bar) is its number size, so it owns its numbers too.
const OWNS_ITS_NUMBERS = new Set(['constant', 'band', 'place', 'most']);

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
        // A review's own "Numbers, for the whole review" (poolSize) pitches every member, so its
        // measured Max Number is not shown beside it; it stays (hidden) so an old code still decodes.
        out.push(own.some(o => o.id === 'poolSize') ? { ...rangeOption(d.range), hidden: true } : rangeOption(d.range));
    }
    if (Array.isArray(d.decimals) && d.decimals.length > 1 && !ids.has('decimals')) {
        // A decimals skill deals decimals at the app's "whole numbers" setting too, so its null
        // value must not read "Use the Decimals setting (now whole numbers)" (OPTIONS-CRITIC-R2 §5 #9).
        const own = categoryId === 'decimals' || DECIMAL_SKILLS_ELSEWHERE.has(skillId);
        out.push(own ? { ...decimalsOption(d.decimals), nullLabel: 'Tenths and hundredths (this skill\'s own)' } : decimalsOption(d.decimals));
    }
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
    // An own control flagged `ownsNumbers` (× / ÷ "Digits × digits") IS the number size: the
    // measured Max Number stays in the model (old share codes decode) but is not shown beside it.
    const sized = own.some(o => o.ownsNumbers);
    for (const o of optionsFor(categoryId, skillId)) {
        // A `hidden` option is a retired control folded into another one (OPTION_FOLDS below): it
        // stays in the model so an old share code still decodes, but the teacher never sees it.
        if (o.hidden) continue;
        if (sized && o.id === 'range' && !ownIds.has('range')) continue;
        if (ownIds.has(o.id) || o.id !== 'level') { out.push(o); continue; }
        // A review's own "Support, for the whole review" sets every member's level already.
        if (ownIds.has('poolSupport')) continue;
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
    // Retired controls folded into a newer one: an old code's values are rewritten into the
    // control that now carries them before anything else reads them (see OPTION_FOLDS).
    const fold = OPTION_FOLDS[`${categoryId}:${skillId}`];
    if (fold) { try { opts = fold({ ...opts }) || opts; } catch (e) { /* keep opts as given */ } }
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
