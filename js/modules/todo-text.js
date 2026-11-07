// todo-text.js — the teacher's words for one "Skills to be made" entry and for a MAP task note (fix round 6).
// WHITELIST, not blacklist: every line is COMPOSED from structured fields (the entry's name, the live skill's
// label, option labels and values from skill-options.js, White Rose step grades and titles, standard codes, MAP
// task names). The build team's free text (teaches, representation, closes, option notes) is shown only when it
// passes plain-words.js WHOLE; otherwise the composed sentence stands alone. The CSV keeps every note as written.
//
// Pure: no window, no DOM, no state. The page installs real skill labels through wrm-links' setSkillLabeler
// (Node gates install theirs), and the queue's entries through setTodoNames().

import { liveSkillLabel, proposalName, gradeOfYear, stepTitle, taskName, siteLessonLabel } from './wrm-links.js';
import { wrmStep } from './wrm.js';
import { optionsFor } from './skill-options.js';
import { plainNote, isPlain } from './plain-words.js';
import { DOMAINS } from './build-queue.js';
import { VISUALS } from './visual-catalogue.js';

let NAMES = new Map();     // build-queue id -> entry
/** The queue's entries, so a MAP row can name the entry that closes it. */
export function setTodoNames(items) { NAMES = new Map((items || []).map((e) => [e.id, e])); }

const isMigrate = (e) => /^vis_migrate/.test(e.id || '') || /^Migrate Legacy/i.test(e.name || '');
const isVisual = (e) => /^vis_/.test(e.id || '');
const lowerFirst = (s) => (/^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const andList = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
/** An entry name the build list left as a placeholder ("A new picture in Fractions"). */
const placeholder = (t) => /^A new (?:picture|skill) in\b/.test(t);
/**
 * M11 (critic r7): what a picture entry ADDS, in the White Rose catalogue's own words (VISUALS: the representations
 * the entry closes), each name without its bracket and shown only when plain: "fraction shapes and fraction bars".
 */
function visualWhat(e) {
    const names = [];
    for (const [, name, ids] of Object.values(VISUALS)) {
        if (!(ids || []).includes(e.id)) continue;
        const t = lowerFirst(String(name).replace(/\s*\([^()]*\)/g, '').split(/[,;]/)[0].replace(/\s*\/\s*/g, ' or ').replace(/\s{2,}/g, ' ').trim());
        if (t && isPlain(t, { fragment: false }) && !names.includes(t)) names.push(t);
    }
    return names.length ? names.slice(0, 3).join('; ') : '';
}

/** An entry's name in a teacher's words: the name when plain, else without its bracket, else what it is for. */
export function todoName(e) {
    const n = String(e.name || '');
    const mig = /^Migrate Legacy (.+?)(?: Visuals?)? to (?:the )?B&W .+$/i.exec(n);
    if (mig) return isPlain(`${mig[1]} pictures`) ? `${mig[1]} pictures redrawn in the black-and-white worksheet style` : 'Pictures redrawn in the black-and-white worksheet style';
    // n40 (critic r8): the build list's priority marker ("(low)") is not part of the name
    const t = n.replace(/\s*\((?:low|medium|high)\)\s*$/i, '').replace(/\s*\(new skill [^)]*\)/i, '').replace(/\s*\((?:template )?option\)\s*$/i, ' (new option on an existing skill)');
    if (isPlain(t)) return t;
    const bare = t.replace(/\s*\([^()]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
    if (bare && isPlain(bare)) return bare;
    if (isVisual(e)) {
        const w = visualWhat(e);
        if (w) return `New pictures: ${w}`;
        // n41 (critic r8): the picture the build note describes after its colon ("a row of three boxes (…)")
        for (const src of [e.representation, e.teaches]) {
            const tail = String(src || '').split(':').pop().trim();
            for (const c of [tail, tail.replace(/\s*\([^()]*\)/g, '').trim()]) if (c && c.length > 8 && isPlain(c, { fragment: false })) return `New picture: ${lowerFirst(c)}`;
        }
    }
    const lab = e.skill ? liveSkillLabel(e.skill) : null;
    if (lab && isPlain(lab)) return `${lab}: a new option`;
    const st = (e.wrmSteps || []).map(stepTitle).find(Boolean);
    if (st) return `A new ${isVisual(e) ? 'picture' : 'skill'} for "${st}"`;
    const dom = (DOMAINS.find((d) => d[0] === e.domain) || [])[1];
    return `A new ${isVisual(e) ? 'picture' : 'skill'}${dom ? ` in ${dom}` : ''}`;
}
const nameWords = (e) => todoName(e).replace(/\s*\(new option on an existing skill\)$/i, '');

/** A step as a teacher reads it: 'Grade 2, "Hundreds"'. */
export const stepLabel = (id) => { const t = stepTitle(id); return t ? `${gradeOfYear(String(id).split('.')[0])}, "${t}"` : ''; };
const stepsJoin = (ids) => {
    const l = [...new Set(ids.map(stepLabel).filter(Boolean))];
    return `${l.slice(0, 3).join('; ')}${l.length > 3 ? ` and ${l.length - 3} more` : ''}`;
};

/** "What pupils will do": the plain teaches sentence, else composed from the name and its first step. */
export function todoTeaches(e) {
    if (isMigrate(e)) return 'The same questions as now, drawn in the black-and-white worksheet style, the same on paper and on screen.';
    // n40 (critic r8): the picture is named once, in the entry's name
    if (isVisual(e)) return 'New pictures for worksheets and the screen; the pupil answers questions about them.';
    const note = plainNote(e.teaches);
    if (note) return note;
    const st = (e.wrmSteps || []).find((s) => wrmStep(s));
    return st ? `Practise "${nameWords(e)}", for ${stepLabel(st)}.` : `Practise "${nameWords(e)}".`;
}

// M12 (critic r8): "How it looks" NEVER GUESSES. The response clause comes only from the entry's own `spec.answer`
// or its option's "How the pupil answers" value (the Kind line's source, so the two cannot disagree); no answer
// field, no response clause. The drawing clause comes only from structured data: the kit template ids of a
// representation written as an id list, the White Rose pictures (VISUALS) the entry closes, or an exact whole-word
// drawing noun from DRAW_NOUNS in the representation (never a negated one, never the problem types).
/** Response verbs, each to the group it belongs to and its "answers by …" words. */
const RESPONSE = [
    ['write', 'write', 'writing'], ['writes', 'write', 'writing'], ['written', 'write', 'writing'], ['type', 'write', 'typing'],
    ['fill', 'write', 'filling in'], ['complete', 'write', 'filling in'], ['number', 'write', 'numbering'],
    ['circle', 'circle', 'circling'], ['ring', 'circle', 'circling'], ['tick', 'tick', 'ticking'],
    ['draw', 'draw', 'drawing'], ['drawn', 'draw', 'drawing'], ['plot', 'draw', 'plotting points'], ['mark', 'draw', 'marking'], ['tally', 'draw', 'making tally marks'],
    ['shade', 'shade', 'shading'], ['colour', 'shade', 'colouring'], ['color', 'shade', 'colouring'],
    ['match', 'match', 'matching'], ['drag', 'drag', 'dragging'], ['build', 'drag', 'building'],
    ['tap', 'choose', 'tapping'], ['choose', 'choose', 'choosing'], ['pick', 'choose', 'choosing'],
    ['say', 'say', 'saying'], ['copy', 'write', 'copying'], ['count', 'count', 'counting'], ['order', 'write', 'ordering'],
];
const RESP = new Map(RESPONSE.map(([w, g, ing]) => [w, { g, ing }]));
/** groups that answer one another (a screen tap is the paper circle or tick; a typed digit is the written one) */
const RESP_SAME = { choose: ['circle', 'tick', 'choose'], circle: ['circle', 'choose'], tick: ['tick', 'choose'] };
/** The option's "How the pupil answers" value as written in the build list (`response "drag"`, `response: pick …`). */
export function optionResponse(e) {
    const m = /\bresponse\s*(?::\s*|")([^"—(;]+)/i.exec(String(e && e.option || ''));
    return m ? m[1].trim() : '';
}
/**
 * The response verbs of an answer text, in order: every clause's first word ("write the total; ring the pair"), and
 * a verb after "or" / "," inside a clause ("circle or write"). A clause that does not start with a verb adds nothing,
 * except "written" / "drawn" ("the written numeral in a large box").
 */
export function responseVerbs(text) {
    const out = [];
    const add = (w) => { const r = RESP.get(String(w || '').toLowerCase()); if (r && !out.some((x) => x.ing === r.ing)) out.push(r); };
    for (const clause of String(text || '').replace(/\([^()]*\)/g, '').split(/;|\bthen\b/)) {
        const words = clause.trim().split(/[\s,]+/);
        if (!words[0]) continue;
        if (RESP.has(words[0].toLowerCase()) && !/^(?:written|drawn)$/i.test(words[0])) {
            add(words[0]);
            // "circle or write", "tick, count or draw": the verbs joined to the first
            for (const [, w] of clause.matchAll(/(?:,|\bor\b|\band\b)\s+([a-z]+)/gi)) if (RESP.has(w.toLowerCase()) && !/^(?:number|order|count)$/i.test(w)) add(w);
        } else for (const w of words) if (/^(?:written|drawn)$/i.test(w)) add(w);
    }
    return out;
}
/** The response groups the entry declares (its answer field and its option's response), for the gate too. */
export function declaredResponse(e) {
    const src = [e && e.spec && typeof e.spec === 'object' ? e.spec.answer : '', optionResponse(e)].filter(Boolean).join('; ');
    return responseVerbs(src);
}
/** "answers by writing", "answers by circling or writing", "answers by ticking and writing" */
function responseClause(e) {
    const opt = optionResponse(e);
    // the option's response is what the Kind line names: it leads when there is one
    const vs = opt ? responseVerbs(opt) : responseVerbs(e && e.spec && e.spec.answer);
    if (!vs.length) return '';
    const ing = vs.slice(0, 3).map((v) => v.ing);
    const joint = !opt && /\bor\b/.test(String(e.spec.answer).split(';')[0]) && !/;/.test(String(e.spec.answer)) ? ' or ' : ' and ';
    return `the pupil answers by ${ing.length < 2 ? ing[0] : `${ing.slice(0, -1).join(', ')}${joint}${ing[ing.length - 1]}`}`;
}
/** A response verb in the third person ("write" -> "writes", "match" -> "matches", "copy" -> "copies"). */
export const thirdPerson = (w) => (/(?:sh|ch|x|s)$/.test(w) ? `${w}es` : /[^aeiou]y$/.test(w) ? `${w.slice(0, -1)}ies` : `${w}s`);
/**
 * W2 (critic 2026-10-30): what the pupil does, from the entry's own answer field (spec.answer), clause by clause:
 * "write the difference and the sentence" -> "the pupil writes the difference and the sentence". Only clauses that
 * start with a response verb and say what is written (two words or more) are used, at most two; '' when none is.
 * An option's own response leads instead (the Kind line names it), through responseClause.
 */
export function answerPhrase(e) {
    if (optionResponse(e)) return '';
    const ans = e && e.spec && typeof e.spec === 'object' ? String(e.spec.answer || '') : '';
    const out = [];
    for (const c of ans.replace(/\([^()]*\)/g, '').split(/;/)) {
        const words = c.trim().replace(/[.,]$/, '').split(/\s+/);
        const v = (words[0] || '').toLowerCase();
        if (!RESP.has(v) || /^(?:written|drawn|number|order|count)$/.test(v) || words.length < 3) continue;
        // "draw or write the letter": every joined response verb in the third person
        const rest = words.slice(1).join(' ').replace(/\b(or|and) ([a-z]+)\b/g, (m, j, w) => (RESP.has(w) && !/^(?:written|drawn|number|order|count)$/.test(w) ? `${j} ${thirdPerson(w)}` : m));
        out.push(`${thirdPerson(v)} ${rest}`);
        if (out.length === 2) break;
    }
    return out.length ? `the pupil ${out.join(' and ')}` : '';
}
/** Exact whole-word drawing nouns (and only these) a representation may name, in our words. */
export const DRAW_NOUNS = [
    [/\bten[- ]frames?\b/i, 'a ten frame'], [/\bcounters\b/i, 'counters'], [/\bdominoe?s\b/i, 'dominoes'],
    [/\bbase[- ](?:10|ten) (?:blocks?|rods?|pictures?)\b|\btens rods?\b/i, 'base-ten blocks'], [/\bplace[- ]value (?:charts?|counters|dis[ck]s)\b/i, 'a place-value chart'],
    [/\bnumber lines?\b/i, 'a number line'], [/\bnumber tracks?\b/i, 'a number track'], [/\bhundred (?:square|chart)s?\b/i, 'a hundred chart'],
    [/\bbar models?\b/i, 'a bar model'], [/\bpart[- ]whole (?:diagrams?|models?|bonds?|bars?|splits?)\b/i, 'a part-whole diagram'],
    [/\barrays?\b/i, 'an array'], [/\bcube trains?\b/i, 'cube trains'], [/\bclock faces?\b|\banalogue clocks?\b/i, 'a clock face'],
    [/\bcoins?\b/i, 'coins'], [/\bbank ?notes\b/i, 'notes'], [/\bprice tags?\b/i, 'price tags'], [/\brulers?\b/i, 'a ruler'], [/\bthermometers?\b/i, 'a thermometer'],
    [/\bprotractors?\b/i, 'a protractor'], [/\bpan balance\b|\bbalance scales?\b/i, 'a pan balance'], [/\bmeasuring jugs?\b/i, 'a measuring jug'],
    [/\bfraction (?:bars?|strips?|circles?|walls?|shapes?)\b/i, 'fraction pictures'],
    // "circles" and "squares" are left out: in a note they are as often sharing rings or grid squares as shapes
    [/\b(?:triangles?|rectangles?|polygons?|quadrilaterals?|pentagons?|hexagons?|(?<!number )shapes?|solids)\b/i, 'shapes'],
    [/\bcoordinate grids?\b|\bdot grids?\b|\bsquared paper\b|\bquadrant grids?\b/i, 'a grid'], [/\bbar (?:charts?|graphs?)\b|\bline graphs?\b|\bline plots?\b|\bpictographs?\b|\bpictograms?\b/i, 'a graph or chart'],
    [/\btally charts?\b/i, 'a tally chart'], [/\b(?:two-column |two-way |input-output |ratio )?tables?\b/i, 'a table'],
    [/\bsorting rings?\b|\bvenn diagrams?\b/i, 'sorting rings'], [/\bcalendars?\b/i, 'a calendar'], [/\btimelines?\b|\btime lines?\b/i, 'a timeline'],
    // W2 (critic 2026-10-30): more exact drawing nouns, so "How it looks" is composed for every entry, never the note
    [/\bdice\b|\bdot patterns?\b|\bdot arrays?\b/i, 'dot patterns'], [/\bpicture cards?\b|\bnumeral cards?\b|\bfraction cards?\b/i, 'cards'],
    [/\bcontainers?\b|\bjugs?\b/i, 'containers'], [/\bdials?\b/i, 'a dial'], [/\bbead strings?\b/i, 'a bead string'],
    [/\bsquare grid\b|\bsquared grid\b/i, 'a grid'], [/\bmirror lines?\b/i, 'a mirror line'], [/\btree diagrams?\b/i, 'a tree diagram'],
    [/\barrow diagrams?\b/i, 'an arrow diagram'], [/\bprice lists?\b/i, 'a price list'], [/\bisometric\b|\bcube drawings?\b/i, 'cube drawings'],
    [/\bmachine boxes\b|\bfunction machines?\b/i, 'a function machine'], [/\bmetre sticks?\b/i, 'a metre stick'], [/\bpicture maps?\b/i, 'a picture map'],
    [/\bcarroll\b/i, 'a sorting table'], [/\bfact ladders?\b/i, 'a fact ladder'], [/\bformula cards?\b/i, 'a formula card'], [/\brule cards?\b/i, 'a rule card'],
    [/\bdigit[- ]cards?\b/i, 'digit cards'], [/\bword banks?\b/i, 'a word bank'], [/\bpyramids?\b/i, 'a number pyramid'], [/\bgattegno\b/i, 'a Gattegno chart'],
    [/\bangles?\b/i, 'angles'], [/\bdrawn (?:bars|scales)\b|\bmeasuring scales?\b/i, 'measuring scales'], [/(?<!fact )\bladders?\b/i, 'a conversion ladder'],
    [/\b(?:line[- ]drawn |line )?pictures?\b|\bpictured\b|\bline drawings?\b/i, 'pictures'],
];
/** A representation without its negated drawings ("no column boxes", "without a number line"). */
const unNegated = (t) => String(t || '').replace(/\b(?:no|not|without)\s+(?:a\s+|an\s+|the\s+)?[\w-]+(?:\s+[\w-]+)?/gi, ' ');
/** The structured drawing sources of an entry: kit ids, White Rose pictures, exact drawing nouns. */
export function looksDrawings(e) {
    const raw = String(e.representation || '').trim();
    const idList = TEMPLATE_LIST.test(raw.charAt(0).toUpperCase() + raw.slice(1)) || /\+ new:/.test(raw);
    if (idList) { const k = [...new Set(kitIds(raw).map((x) => KIT_WORDS[x]))]; if (k.length) return { from: 'kit', words: k }; }
    const wr = visualNames(e);
    if (wr.length) return { from: 'visual', words: wr };
    const t = unNegated(raw);
    return { from: 'noun', words: [...new Set(DRAW_NOUNS.filter(([re]) => re.test(t)).map(([, w]) => w))] };
}
// M11 (critic r7): the sheet kit's template ids (js/modules/sheet/cells/, plus the ones the build list names as new),
// in a teacher's words. A representation note that is a list of these ids is never shown as written.
export const KIT_WORDS = {
    'add-three': 'three numbers to add', 'area-model': 'an area model', arrays: 'an array', 'arrays-turn': 'an array turned round',
    'bar-graph': 'a bar graph', 'bar-model': 'a bar model', base10: 'base-ten blocks', bond: 'a part-whole bond', chartwindow: 'part of a hundred chart',
    clock: 'a clock face', 'cloze-bank': 'a word bank', coins: 'coins and notes', compare: 'two groups to compare', 'coord-grid': 'a grid',
    'count-row': 'a counting row', counters: 'counters', 'data-table': 'a table', division: 'a long division', equation: 'a number sentence',
    expression: 'an expression', fact: 'a number fact', 'fact-family': 'a fact family', family: 'a fact family', figures: 'shapes',
    'frac-model': 'shaded fraction pictures', 'function-table': 'a table', 'hop-line': 'jumps on a number line',
    'long-division': 'a long division', 'money-columns': 'money in columns', 'mult-chart': 'part of a multiplication chart',
    'mult-grid': 'a multiplication grid', 'nl-place': 'a number line', 'number-line': 'a number line', 'perimeter-shape': 'a shape with its sides',
    pictograph: 'a pictograph', pv: 'a place-value chart', rcdws: 'a word problem checklist', remainder: 'a division with a remainder',
    ruler: 'a ruler', seqstrip: 'a number track', shapes: 'shapes', stack: 'a column method', 'tally-chart': 'a tally chart', tenframe: 'a ten frame',
    thermometer: 'a thermometer', timeline: 'a timeline', 'value-line': 'a number line', 'word-work': 'a short story', wordpic: 'a picture story',
    words: 'number words',
    // the new ones the build list names ("+ new: …")
    'picture-row': 'pictures of objects', 'measure-scale': 'a scale', 'graph-axes': 'a graph or chart', 'shape-grid': 'a grid',
    'pv-support': 'a place-value chart', 'angle-kit': 'angles', 'solid-kit': 'shapes',
};
/** A representation note the teacher never reads as written: a template-id list, "+ new:", or the build team's own words. */
export const TEMPLATE_LIST = /^[A-Z][a-z0-9-]+(?:, [a-z0-9-]+)*(?: \+ new: [a-z0-9-]+(?:, [a-z0-9-]+)*)?\.?$/;
export const BUILD_NOTE = /\+ new:|^The existing\b|^The skill['’]s own\b|\bno [a-z]+ (?:row|boxes|bank)\b/i;
const kitIds = (t) => String(t || '').toLowerCase().split(/[\s,.+:]+/).filter((w) => Object.prototype.hasOwnProperty.call(KIT_WORDS, w));
/** White Rose picture names (VISUALS) an entry closes, plain, as the catalogue names them. */
function visualNames(e) {
    const names = [];
    for (const [, name, ids] of Object.values(VISUALS)) {
        if (!(ids || []).includes(e.id)) continue;
        const t = String(name).replace(/\s*\([^()]*\)/g, '').split(/[,;:]/)[0].replace(/\s*\/\s*/g, ' or ').replace(/\s{2,}/g, ' ').trim();
        if (t && isPlain(t, { fragment: false }) && !names.includes(t)) names.push(t);
    }
    return names.slice(0, 3);
}
/**
 * M13: a "How it looks" line that reads as a build note (the owner's ruling, critic 2026-10-30 W2: teachers see composed
 * sentences only; the build team's free text stays in the CSV). The gate counts these; todoLooks never makes one.
 */
export const LOOKS_BUILD_NOTE = /\boption\b|\bon the \w+ skill\b|\w\/\w(?!\d)|`|\bprint-first\b|\btemplate\b|\bpane\b/i;
/** The drawings an entry's "How it looks" names: kit ids anywhere in the note, then exact drawing nouns (never negated). */
function looksWords(e) {
    const raw = String(e.representation || '').trim();
    // a kit id read as a drawing: in an id list, or a hyphenated id, or one named as a template / pane / "<id> gains"
    // (a plain word such as "division" or "fact" in a sentence is not the template)
    const idList = TEMPLATE_LIST.test(raw.charAt(0).toUpperCase() + raw.slice(1)) || /\+ new:/.test(raw);
    const named = (id) => /-/.test(id) || new RegExp(`(?:template|pane):${id}\\b|^${id} gains?\\b`, 'i').test(raw);
    const kit = kitIds(raw).filter((id) => idList || named(id)).map((x) => KIT_WORDS[x]);
    // an "option: …" clause is a later setting, not what every question shows
    const t = unNegated(raw.replace(/(?:^|;)\s*option:[^;]*/gi, ';'));
    const nouns = DRAW_NOUNS.filter(([re]) => re.test(t)).map(([, w]) => w);
    const all = [...new Set([...kit, ...nouns])];
    // the generic "pictures" only when nothing more exact is named
    return (all.length > 1 ? all.filter((w) => w !== 'pictures') : all).slice(0, 3);
}
/**
 * "How it looks" (W2, critic 2026-10-30: COMPOSED ONLY, never the representation note): the drawings the note names
 * (kit template ids and exact drawing nouns), else the White Rose pictures the entry closes; the host skill an option
 * changes (by its live label); and the response the entry declares (M12: from its answer field only).
 */
export function todoLooks(e) {
    const draws = looksWords(e);
    const said = answerPhrase(e);
    const ans = said && isPlain(said, { fragment: false }) && !LOOKS_BUILD_NOTE.test(said) ? said : responseClause(e);
    const lab = e.skill ? liveSkillLabel(e.skill) : null;
    const host = lab && isPlain(lab, { fragment: false }) && !LOOKS_BUILD_NOTE.test(lab) ? lab : '';
    const tail = ans ? `; ${ans}` : '';
    const where = isMigrate(e) || isVisual(e) ? ', the same on paper and on screen' : '';
    const on = host && (e.kind === 'option' || isVisual(e) || isMigrate(e)) ? ` on "${host}"` : '';
    const lines = [];
    if (draws.length) lines.push(`Shows ${andList(draws)} in black and white${on}${where}${tail}.`);
    const wr = visualNames(e);
    if (!draws.length && wr.length && !isVisual(e)) lines.push(`Shows the White Rose picture${wr.length > 1 ? 's' : ''} ${andList(wr.map((w) => `"${w}"`))} in black and white${tail}.`);
    if (host && e.kind === 'option') lines.push(`The same black-and-white questions as "${host}", with the new setting${tail}.`);
    if (host) lines.push(`Black-and-white boxed questions${on || ` like "${host}"`}, the same on paper and on screen${tail}.`);
    lines.push(`Black-and-white boxed questions, the same on paper and on screen${tail}.`);
    return lines.find((t) => isPlain(t) && !LOOKS_BUILD_NOTE.test(t)) || '';
}

/**
 * "Gap it fills": one line per gap, composed from its structured lead (a White Rose step, a standard code, a MAP
 * task) and the gap note when it is plain, never twice.
 */
export function todoCloses(e) {
    const out = [];
    // m17 (critic r7): the steps and school lessons with no note of their own share ONE line, said once
    const bare = [];
    let bareAt = -1;
    const addBare = (lab) => { if (bareAt < 0) { bareAt = out.length; out.push(''); } if (!bare.includes(lab)) bare.push(lab); };
    const labelled = new Map();
    const addLabelled = (lab, school, note) => {
        const key = `${lab}\u0000${school}`;
        if (!labelled.has(key)) { labelled.set(key, { lab, school, at: out.length, notes: [] }); out.push(''); }
        const n = String(note).trim().replace(/\.$/, '');
        const L = labelled.get(key);
        if (n && !L.notes.some((x) => x.toLowerCase() === n.toLowerCase())) L.notes.push(n);
    };
    for (const g of e.gaps || []) {
        if (/^\s*none\.?\s*$/i.test(String(g.text || '')) && !g.step && !g.lesson && !g.code && !g.map) continue;   // m12: no "None." line
        const note = plainNote(g.text);
        let line = '';
        if (g.step && stepLabel(g.step) && !note) { addBare(stepLabel(g.step)); continue; }
        if (g.lesson && siteLessonLabel(g.lesson) && !note) { addBare(siteLessonLabel(g.lesson)); continue; }
        // m18 (critic r8): steps or school lessons that share one title are one line, their notes grouped under it
        if (g.step && stepLabel(g.step)) { addLabelled(stepLabel(g.step), '', note); continue; }
        if (g.lesson && siteLessonLabel(g.lesson)) { addLabelled(siteLessonLabel(g.lesson), 'school ', note); continue; }
        if (g.step || g.lesson) line = note;
        else if (g.code) line = `${g.code}: ${note || 'not yet fully taught.'}`;
        else if (g.map) { const tn = taskName(g.map); line = isPlain(`MAP task "${tn}"`) ? `MAP task "${tn}": ${note || 'no skill practises it yet.'}` : ''; }
        else if (g.none) line = `No skill teaches ${stepsJoin(g.none)}.`;
        else if (g.improves) line = `Today's skills cover only part of ${stepsJoin(g.improves)}.`;
        else if (!/\breused\b/i.test(String(g.text || ''))) line = note;
        if (line && !out.includes(line)) out.push(line);
    }
    // m18: a title that has a note elsewhere in the list is not also listed bare
    const noted = new Set([...labelled.values()].map((L) => L.lab));
    for (let i = bare.length - 1; i >= 0; i -= 1) if (noted.has(bare[i])) bare.splice(i, 1);
    if (bareAt >= 0 && !bare.length) { out.splice(bareAt, 1); for (const L of labelled.values()) if (L.at > bareAt) L.at -= 1; bareAt = -1; }
    const COUNT = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    for (const { lab, school, at, notes } of labelled.values()) {
        const many = notes.length > 1 ? ` (${COUNT[notes.length] || notes.length} ${school}lessons)` : school ? ', a school lesson' : '';
        const body = notes.map((n, i) => (i ? lowerFirst(n) : n)).join('; ');
        out[at] = `${lab}${many}: ${body}.`;
    }
    for (let i = out.length - 1; i >= 0; i -= 1) if (out[i] && out.indexOf(out[i]) < i) { out.splice(i, 1); if (bareAt > i) bareAt -= 1; }
    if (bareAt >= 0) {
        if (bare.length === 1) out[bareAt] = `${bare[0]}: no skill teaches all of it yet.`;
        else {
            // one lead-in, then the lessons grouped by grade: 'Grade 2: "Add lengths", "Compare lengths"; Grade 3: "…"'
            const by = new Map();
            for (const b of bare.slice(0, 12)) { const m = /^(.+?), (".*")$/.exec(b) || [b, '', b]; if (!by.has(m[1])) by.set(m[1], []); by.get(m[1]).push(m[2]); }
            const GO = ['Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
            const list = [...by].sort((x, y) => (GO.indexOf(x[0]) + 1 || 99) - (GO.indexOf(y[0]) + 1 || 99)).map(([gr, ts]) => (gr ? `${gr}: ${ts.join(', ')}` : ts.join(', '))).join('; ');
            out[bareAt] = `No skill teaches these lessons in full yet. ${list}${bare.length > 12 ? `; and ${bare.length - 12} more lessons` : ''}.`;
        }
    }
    if (!out.length && (e.wrmSteps || []).length) out.push(`No skill teaches ${stepsJoin(e.wrmSteps)}.`);
    if (!out.length && (e.ccss || []).length) out.push(`${e.ccss.join(', ')}: not yet fully taught.`);   // n44: one form of the gap lead
    return out;
}

// An option written as "<id> <value>: <what it does>" in a build note: the id is read against the skill's own
// option labels (skill-options.js) or this table of the setting names the build list uses.
const OPTION_LABELS = { band: 'Numbers to', bands: 'Numbers to', forms: 'What the items ask', form: 'What the items ask', parts: 'Parts',
    denoms: 'Denominators', denominators: 'Denominators', span: 'Number line range', places: 'Decimal places', decimals: 'Decimal places',
    objects: 'Objects', pictures: 'Pictures', support: 'Support', response: 'How the pupil answers', task: 'Task', unknown: 'What is missing',
    level: 'Support level', steps: 'Count in', step: 'Count in', words: 'Number words', layout: 'Layout', focus: 'Focus', items: 'Items',
    size: 'Size', mode: 'Mode' };
const VAL = `(?:"[^"]*"|'[^']*'|\\d+(?:,\\d{3})*(?:\\s*[-–]\\s*\\d+(?:,\\d{3})*)?)`;
const OPT_HEAD = new RegExp(`^([a-z]+)\\s*:?\\s*(${VAL}(?:\\s*(?:\\/|\\||\\bor\\b|\\band\\b|,)\\s*${VAL})*)\\s*([:;,(—-]?)\\s*([\\s\\S]*)$`, 'i');
/** The option of an entry in the dialog's words: its label and values (always kept), then the note when plain. */
export function optionLine(skill, raw) {
    // M11 (critic r7): a value code in brackets ("(tiles 41)") is the build list's, not a word
    const text = String(raw || '').replace(/\s*\((?:tiles|codec|code|key)\s+\d+\)/g, '').trim();
    if (!text) return '';
    // two settings joined by "+" ('mode "share among M" + response "drag"'): each in the dialog's words
    const both = /^[a-z]+\s+"[^"]*"(?:\s+\+\s+[a-z]+\s+"[^"]*")+$/.test(text) ? text.split(/\s+\+\s+/) : [];
    if (both.length > 1) {
        const parts = both.map((t) => optionLine(skill, t));
        return parts.every(Boolean) ? parts.join('. ') : '';
    }
    const m = OPT_HEAD.exec(text);
    if (m) {
        const id = m[1].toLowerCase();
        let def = null;
        if (skill && skill.includes(':')) { try { const [c, s] = skill.split(':'); def = optionsFor(c, s).find((d) => d.id === id) || null; } catch (x) { def = null; } }
        // M11: a setting the dialog does not name yet is named by its own word ("method" -> "Method")
        // (only for quoted values with no further quoted value after them: 'set "tenths", "hundredths"')
        const named0 = /^["']/.test(m[2]) && !/["']/.test(m[4]) && /^[a-z]{3,}$/.test(id) && isPlain(id, { fragment: false });
        const label = def ? String(def.label || '') : OPTION_LABELS[id] || (named0 ? id.charAt(0).toUpperCase() + id.slice(1) : '');
        if (label) {
            const vals = m[2].split(/\s*(?:\/|\||\bor\b|\band\b|,(?!\d{3}))\s*/).map((v) => v.replace(/^["']|["']$/g, '').trim()).filter(Boolean)
                .map((v) => { const hit = def && (def.values || []).find((x) => String(x.v) === v.replace(/,/g, '')); return hit ? String(hit.l).replace(/\s*\(default\)$/i, '') : v; });
            const head = /^bands?$/.test(id) && (!def || /^numbers to$/i.test(label)) ? `Numbers to ${vals.join(' or ')}` : `${label}: ${vals.join(', ')}`;
            let rest = m[4].trim();
            if (m[3] === '(' && rest.endsWith(')')) rest = rest.slice(0, -1);
            // "and pictures" runs on from the values; a clause after ":" or "(" is its own sentence
            const runOn = !m[3] && /^[a-z]/.test(rest);
            const tail = !rest ? '' : runOn ? (isPlain(rest, { fragment: false }) ? ` ${rest.replace(/[.;,]$/, '')}` : '') : (plainNote(rest) ? `${/[.?!]$/.test(head) ? '' : '.'} ${plainNote(rest).replace(/\.$/, '')}` : '');
            if (isPlain(head)) return `${head}${tail}`;
        }
    }
    // "objects: show the group, add or take one": the setting's name, then its words when they are plain
    const named = /^([a-z]+):\s+(.+)$/i.exec(text);
    if (named) {
        const id = named[1].toLowerCase();
        let def = null;
        if (skill && skill.includes(':')) { try { const [c, s] = skill.split(':'); def = optionsFor(c, s).find((d) => d.id === id) || null; } catch (x) { def = null; } }
        const label = (def && def.label) || OPTION_LABELS[id] || id.charAt(0).toUpperCase() + id.slice(1);
        const line = `${label}: ${named[2].replace(/[.;,]$/, '')}`;
        if (isPlain(line)) return line;
    }
    // never the build list's own form, a setting word then its quoted value ('mode "share among M"')
    if (/^[a-z]+ ["']/.test(text)) return '';
    return isPlain(text, { fragment: false }) && isPlain(`Option: ${text}`) ? text.replace(/[.;,]$/, '') : '';
}

/** The kind line's tail: the live skill it changes (by its label) and the option in the dialog's words. */
export function todoKindTail(e) {
    const parts = [];
    const lab = e.skill ? liveSkillLabel(e.skill) : null;   // N19: a skill not made yet is the entry itself
    if (lab && isPlain(lab, { fragment: false })) parts.push(lab);
    if (e.option) {
        // a bracket that is not plain is left out before the line is given up (N37: "(incl. zero place)")
        const o = optionLine(e.skill, e.option) || optionLine(e.skill, String(e.option).replace(/\s*\([^()]*\)/g, ''));
        parts.push(o ? `Option: ${o}` : 'A new setting on this skill');
    }
    return parts;
}

/** Every field a teacher reads for one entry, for the screen, the print and the gates. */
export function todoTexts(e) {
    return { name: todoName(e), teaches: todoTeaches(e), closes: todoCloses(e), looks: todoLooks(e), kind: todoKindTail(e) };
}

/**
 * A MAP task's note (MAP · Practise by task): the row's note when it is plain, else a sentence composed from the
 * entry that closes it ('"Meaning of the equal sign" will add: …'), else nothing. Never starts with an id.
 */
export function mapNote(text, row = {}) {
    const whole = plainNote(text);
    if (whole && !/^Adds?\b/.test(whole)) return whole;   // N37: a note with no subject ("Adds writing …") is composed instead
    const id = row.proposal || '';
    if (!id) return '';
    const e = row.entry || NAMES.get(id) || { id, name: proposalName(id) };
    // N31 (critic r6): the row's own clause when the note is "<entry id> adds <what>" — what THIS task gains — read
    // by the entry id the row names, and shown only when that clause is plain
    const own = new RegExp(`^${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:['’]s?)?(?: MAP clause)? (?:adds|will add)\\s+(.+)$`, 'i').exec(String(text || '').trim());
    const clause = own ? plainNote(own[1]) : '';
    if (clause) return `"${nameWords(e)}" will add: ${lowerFirst(clause)}`;
    const teaches = plainNote(e.teaches);
    if (teaches) return `"${nameWords(e)}" will add: ${lowerFirst(teaches)}`;
    return `"${nameWords(e)}" is still to be built.`;
}

/** One MAP line of an entry: strand · RIT band · the task (its MAP name) or the kind of item MAP asks. */
export function mapLine(m) {
    const what = m.task ? taskName(m.task) : taskName(m.taskType || '');
    return [m.strand, m.ritBand ? `RIT ${m.ritBand}` : '', what && isPlain(what, { fragment: false }) ? what : ''].filter(Boolean).join(' · ');
}
