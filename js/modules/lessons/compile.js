// js/modules/lessons/compile.js
// THE LESSON COMPILER (E4, design/LESSONS_FIRST_PLAN.md §2.2 P2, design/IMPROVEMENT_PLAN.md §1.6.5 "Lessons" 3).
//
//   compileLesson(card) -> {
//     library:  {routines: {id: routine}, lessons: {id: lesson}}   the short lesson: one routine + one lesson
//               record in the lessons/families/*.js schema (lessons/schema.js validateRoutine / validateLesson)
//     detailed: <description>                                       the long lesson, the shape of lessons/detailed/<id>.js
//     notes:    [text]                                              what the compiler decided and why (DIFF.md reads them)
//   }
//
// A CARD (design/lessons/cards/README.md) is the lesson's one source: its skills and option values per part,
// ranges, edge cases, rulings, misconceptions, vocabulary, and the only hand-written fields - the story, the hook
// and the teaching notes. The compiler supplies the rest:
//   - the `vars` hook from the shape's item readers (shapes/readers.js), never per lesson;
//   - the atoms of the Pre-requisite rows from the Prerequisite Check (one atom per question, most basic first);
//   - the routine's steps from the chart's Steps (the provider's strings.steps, drafted into the card);
//   - the mistakes table from the misconceptions (provider ids): each row's "looks like" is the Check Question
//     option it takes ({cq.X}) or a dealt exit item's own wrong answer ({exit.k.wrong.<id>});
//   - the T6 wrong answers from the same misconceptions (each exit item that can show one);
//   - the Check Question with the ONE shared response, "which is right" (owner Q9): the board lists the options
//     A..D, the pupils show fingers;
//   - the delivery sections every lesson shares (1 Prerequisite Check, 2 Number sense, 3 Spaced retrieval,
//     7 Check Question, 8 You Do, 10 Plenary and exit slip) and the frames of 4 (the hook) and 9 (the story);
//   - the 60-minute budget from the shape (a card's `timing` overrides it), refused when it does not add to 60;
//   - the library entry entirely: archetype from the shape, the routine from the chart, the practice link,
//     the Prerequisite Check (when it names 3-4 distinct lessons), the Mixed partners (LR-18).
// Named refs: a card's `refs` holds skill refs used more than once; a part names one as "@NAME" or
// {"@": "NAME", ...overrides} (its `opts` merged over the named ref's).
// Pure module (SCC-01): no DOM, no window, no state, no Math.random.

import { SHAPES } from './shapes/index.js';
import { varsFrom, HOOKS, keysOf } from './shapes/readers.js';
import { kindOf } from './schema.js';

export const CARD_FORMAT = 'lesson-card/1';

/** The hand-written fields of a card (the only prose the builder writes; ws-lesson-card counts their lines). */
export const HAND_FIELDS = Object.freeze(['story', 'hook', 'teach']);

/** The Check Question response every lesson shares (owner Q9). */
export const CHECK_RESPONSE = 'which-right';

/** What every lesson's T1 materials list ends with (a card lists only its own). */
export const SHARED_MATERIALS = Object.freeze(['Mini whiteboards and pens', 'Pupil packet, one per pupil', 'Exit slips, cut in half']);

/** T2b's routing note when every prerequisite lesson is a CCSS code (no site lesson yet, V22 Appendix H). */
export const CCSS_ROUTE_NOTE = 'No site lesson exists yet for these prerequisites: T6 names a CCSS code and a short title (V22 Appendix H).';

/** The Check Question loop's first line (most pupils right). */
export const LOOP_MOST = 'Go on to You Do.';

const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const idnd = (id) => String(id || '').replace(/[^A-Za-z0-9]/g, '');

/** A card value with its named refs resolved ("@NAME" / {"@": NAME, ...}). Throws on an unknown name. */
export function resolveRefs(value, refs = {}) {
    const walk = (v) => {
        if (typeof v === 'string' && /^@[A-Za-z0-9_]+$/.test(v)) {
            const r = refs[v.slice(1)];
            if (!r) throw new Error(`card: unknown ref ${v}`);
            return walk(clone(r));
        }
        if (Array.isArray(v)) return v.map(walk);
        if (isObj(v)) {
            if (typeof v['@'] === 'string') {
                const base = refs[v['@']];
                if (!base) throw new Error(`card: unknown ref @${v['@']}`);
                const out = walk(clone(base));
                for (const [k, x] of Object.entries(v)) {
                    if (k === '@') continue;
                    if (k === 'opts' && isObj(x)) out.opts = Object.assign({}, out.opts || {}, walk(x));
                    else out[k] = walk(x);
                }
                return out;
            }
            const out = {};
            for (const [k, x] of Object.entries(v)) out[k] = walk(x);
            return out;
        }
        return v;
    };
    return walk(value);
}

/** Every skill ref of a resolved card (an object with categoryId and skillId), with where it sits. */
export function refsOf(card) {
    const out = [];
    const walk = (v, at) => {
        if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${at}[${i}]`));
        else if (isObj(v)) {
            if (typeof v.categoryId === 'string' && typeof v.skillId === 'string') out.push({ at, ref: v });
            for (const [k, x] of Object.entries(v)) if (k !== 'opts') walk(x, at ? `${at}.${k}` : k);
        }
    };
    walk(card.parts || {}, 'parts');
    return out;
}

/** The library id of a lesson id: a WRM step as it is; a site lesson "G3|-|slug" -> "sup:G3.slug"; a CCSS code -> "ccss:code". */
export function libraryIdOf(id) {
    const s = String(id || '').trim().replace(/^G?([K1-8]) ([A-Z]+) (\d+[a-z]?)$/, '$1.$2.$3');
    if (kindOf(s)) return s;
    const wrm = s.replace(/^(R|Y[1-6])[ .]B(\d+)[ .]S(\d+)$/, '$1.B$2.S$3');
    if (kindOf(wrm) === 'wrm') return wrm;
    const site = s.match(/^(G[0-9K])\|-\|([a-z0-9]+)$/i);
    if (site) return `sup:${site[1].toUpperCase()}.${site[2].toLowerCase()}`;
    if (/^[K1-8]\.[A-Z]+(\.[A-Za-z0-9]+)+$/.test(s)) return `ccss:${s}`;
    return null;
}

// The order of the sections and their default names and pages (V22 Lesson Time Budget, DETAILED_MAKER).
const SECTION_NAME = {
    1: 'Prerequisite Check', 2: 'Number sense', 3: 'Spaced retrieval', 4: 'Chaining bridge',
    5: 'I Do: the anchor chart', 6: 'We Do: Guided Practice', '6a': 'We Do 1: Guided Practice', '6b': 'We Do 2: Guided Practice',
    7: 'Check Question', 8: 'You Do: Independent Practice', 9: 'Word problem', 10: 'Plenary and exit slip',
};
const SECTION_PAGE = { 1: 'P0', 2: 'P1', 3: '', 4: '', 5: 'P2', '5a': 'P2', '5b': 'P2b', 6: 'P3', '6a': 'P3', '6b': 'P3b', 7: '', 8: 'P4', 9: 'P5', 10: 'P6' };
const DEFAULT_BOXES = {
    1: [{ kind: 'tip', title: 'Route before teaching', text: 'Mark it while pupils do the Number sense page.' }],
    8: [{ kind: 'watch', title: 'The last rows', text: 'Walk to the last rows first: {p4.last}.' }],
};
const LETTERS = ['A', 'B', 'C', 'D'];
const asRow = (r) => (typeof r === 'string' ? { say: r } : clone(r));
const lcFirst = (s) => String(s || '').replace(/^[A-Z](?![A-Z])/, (c) => c.toLowerCase());

/** The section numbers of a lesson, in teaching order. */
export function sectionOrder(chunked) {
    return chunked ? [1, 2, 3, 4, '5a', '6a', '5b', '6b', 7, 8, 9, 10] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}

/** The Check Question's letters: every option a misconception takes, and the right one. */
function checkLetters(card) {
    const used = new Set((card.misconceptions || []).map((m) => m.option).filter(Boolean));
    const cq = (card.parts && card.parts.checkQuestion) || {};
    if (cq.correct) used.add(cq.correct);
    const n = Math.max(3, cq.options || 0, ...[...used].map((L) => LETTERS.indexOf(L) + 1));
    return LETTERS.slice(0, Math.min(4, n));
}

/** The generated rows of one shared section (1, 2, 3, 7, 8, 9, 10), before the card's own rows (`add`). */
export function sharedRows(n, card, parts) {
    const t = card.teach || {};
    const own = (t.sections && t.sections[n]) || {};
    if (n === 1) return [
        { do: 'Hand out the Prerequisite Check, face down.' },
        { say: 'Do these on your own. Try every one.' },
        { do: 'Walk and mark as pupils finish.', note: 'Expected: [[{p0.list}]]. Routing is on the last page (T6).' },
    ];
    if (n === 2) return [
        { do: 'Hand out the Number sense page.' },
        { say: 'Band A: read each row. Write the answer.' },
        { ask: '{ns.A.0.text}', note: 'Expected: [[{ns.A.0.ans}]]. Band B: the same five kinds, harder numbers.' },
    ];
    if (n === 3) return [{ do: 'Pupils hold mini whiteboards. Write each question on the board.' }]
        .concat((parts.retrieval || []).map((r, i) => ({ ask: `{ret.${i}.ask}`, note: `Expected: [[${r.expect || `{ret.${i}.ans}`}]].` })));
    if (n === 7) {
        const L = checkLetters(card);
        const cq = parts.checkQuestion || {};
        return [
            { do: cq.board || 'Write on the board: {cq.text}' },
            { do: `Write ${['', '', 'two', 'three', 'four'][L.length]} answers. ${L.map((x) => `${x}: {cq.${x}}`).join(' · ')}.` },
            { ask: 'Which answer is right? Show fingers.', note: 'Correct: [[{cq.right}]]. Each wrong option is one T2 mistake: {cq.why}' },
        ];
    }
    if (n === 8) {
        const pages = (parts.practice && parts.practice.pages) || 1;
        const sheets = parts.chunks && parts.chunks.length > 1 ? 'both lesson sheets' : 'the lesson sheet';
        return [{ do: `Pupils finish ${sheets}, then Practice 1${pages > 1 ? ' and 2' : ''}.` }];
    }
    if (n === 9) return [{ do: 'Read the story aloud two times. Pupils tick each box.' }];
    if (n === 10) {
        const chart = parts.chart || {};
        const rule = own.say || chart.chant || ((chart.concepts || [])[0] || {}).text || 'Say the steps together.';
        // (an item's `show`: the name of what the key shows, or a whole template such as "[[{exit.0.v0}]], [[{exit.0.rel}]]")
        const items = ((parts.exit && parts.exit.items) || []).map((e, i) => `${i + 1}. ${String(e.show || '').includes('{') ? e.show : `[[{exit.${i}.${e.show || 'ans'}}]]`}`).join(' · ');
        return [
            { say: rule, note: rule === chart.chant ? 'Say the chant together twice.' : 'Say it together twice.' },
            { do: 'Hand out the exit slip. No help. Then sort the slips by the boxes ticked.', note: `${items}.` },
        ];
    }
    return [];
}

/** The generated I Do / We Do rows when a card has none (a draft): one row per Step, then the Say frame. */
function stepRows(kind, steps, chant) {
    if (kind === 'ido') return [{ do: 'Put the anchor chart up. Point to the worked example.' }]
        .concat(steps.map((s, i) => ({ say: s.text, note: `Step ${i + 1}.` })));
    return [
        { say: 'Look at the first cell. Step 1 is done in grey.', note: 'Expected ★: [[{we.0.ans}]].' },
        { do: 'Pupils do the next cell on their own.', note: 'Expected ★: [[{we.1.ans}]].' },
    ].concat(chant ? [{ say: chant, note: 'The chant. Say it twice together.' }] : []);
}

/** The delivery sections (T3-T5) of a card. */
function sectionsOf(card, parts, shape, notes) {
    const t = card.teach || {};
    const own = t.sections || {};
    const chunks = parts.chunks || [];
    const chunked = chunks.length > 1;
    const timing = Object.assign({}, shape.minutes, card.timing || {});
    const out = [];
    for (const n of sectionOrder(chunked)) {
        const o = own[n] || {};
        let name = o.name || SECTION_NAME[n];
        if (!name && /^5[ab]$/.test(String(n))) {
            const c = chunks[n === '5a' ? 0 : 1] || {};
            name = `I Do ${n === '5a' ? 1 : 2}: ${lcFirst(c.name || 'the anchor chart')}`;
        }
        let rows;
        if (n === 4) rows = (card.hook || []).map(asRow);
        else if ([5, 6, '5a', '6a', '5b', '6b'].includes(n)) {
            rows = (o.rows || []).map(asRow);
            const b = n === '5b' || n === '6b';
            const data = b ? (chunks[1] && chunks[1].lessonData) || {} : parts.chart || {};
            // (a We Do ends with the chant said together, when the chart has one - unless the card says `chant: false`)
            if (rows.length && String(n).startsWith('6') && data.chant && o.chant !== false) rows.push({ say: data.chant, note: 'The chant. Say it twice together.' });
            if (!rows.length) {
                rows = stepRows(String(n).startsWith('5') ? 'ido' : 'wedo', data.steps || [], data.chant || '');
                notes.push(`section ${n}: no teaching rows on the card; drafted one row per Step`);
            }
        } else {
            rows = sharedRows(n, card, parts).concat((o.add || []).map(asRow));
        }
        const s = { n, name, min: Number(timing[n]) || 0, page: o.page !== undefined ? o.page : SECTION_PAGE[n] };
        const boxes = o.boxes !== undefined ? o.boxes : DEFAULT_BOXES[n];
        if (boxes && boxes.length) s.boxes = clone(boxes);
        s.rows = rows;
        if (n === 7 && t.loop) s.loop = Object.assign({ most: LOOP_MOST }, clone(t.loop));
        out.push(s);
    }
    const total = out.reduce((a, s) => a + s.min, 0) + (Number(timing.transitions) || 0);
    if (total !== 60) throw new Error(`card ${card.id}: the sections add up to ${total} minutes, not 60 (timing)`);
    return { sections: out, transitionsMin: Number(timing.transitions) || 0 };
}

/** The T2 atoms: the Pre-requisite atoms from the Prerequisite Check, the rest from the card, by `n`. */
function atomsOf(card, parts) {
    const pre = (parts.prereqs || []).map((p, i) => {
        const a = p.atom || {};
        return { n: a.n !== undefined ? a.n : i + 1, atom: { type: a.type || 'Fact', prereq: true, skill: a.skill || (p.lesson && p.lesson.title) || '', notes: a.notes !== undefined ? a.notes : `Prerequisite Check {pre.${i}.letters}.` } };
    });
    const own = ((card.teach && card.teach.atoms) || []).map((a, i) => ({ n: a.n !== undefined ? a.n : 100 + i, atom: Object.fromEntries(Object.entries(a).filter(([k]) => k !== 'n')) }));
    return pre.concat(own).sort((x, y) => x.n - y.n).map((x) => {
        const a = x.atom;
        const o = { type: a.type };
        if (a.prereq) o.prereq = true;
        if (a.critical) o.critical = true;
        o.skill = a.skill;
        o.notes = a.notes || '';
        return o;
    });
}

/** T2 §2 routine: the Steps of the chart (and of chunk b), each with the card's tag and check. */
function routineOf(card, parts) {
    const steps = ((parts.chart && parts.chart.steps) || []).concat(((parts.chunks || [])[1] && parts.chunks[1].lessonData && parts.chunks[1].lessonData.steps) || []);
    const own = (card.teach && card.teach.routine) || [];
    const list = own.length ? own : steps.map(() => ({ tag: 'New', check: '' }));
    return list.map((r, i) => {
        const o = { step: r.step !== undefined ? r.step : ((steps[i] && steps[i].text) || ''), tag: r.tag || 'New' };
        if (r.critical) o.critical = true;
        o.check = r.check || '';
        return o;
    });
}

/** T2 Common mistakes from the misconceptions. */
function mistakesOf(card) {
    return (card.misconceptions || []).map((m) => {
        const o = { name: m.name, step: m.step, looks: m.looks !== undefined ? m.looks : (m.option ? `{cq.${m.option}}` : ''), fix: m.fix || '', option: m.option || '' };
        if (m.id) o.misconception = m.id;
        if (m.caught) o.caught = m.caught;
        return o;
    });
}

/** T6 wrong answers: each misconception on each exit item that can show it, then the card's own rows. */
function wrongAnswersOf(card) {
    const out = [];
    for (const m of card.misconceptions || []) {
        for (const e of m.exits || []) {
            out.push({ wrote: e.wrote || `{exit.${e.k}.wrong.${idnd(m.id)}} (${e.label !== undefined ? e.label : e.k + 1})`, mistake: m.name, next: e.next || m.next || m.fix || '' });
        }
    }
    return out.concat(clone((card.teach && card.teach.wrongAnswers) || []));
}

const WEDO_KEYS = /^(guided|guidedWants|guidedRows|guidedStack|independent|practiceShape|practiceBlocks|growAll|tailLast|tailRead)$/;

/** The engine's lessonData: the chart part and the We Do part, with its hooks. */
function lessonDataOf(chart, weDo, fns) {
    const out = Object.assign({ skills: [] }, clone(chart || {}), clone(weDo || {}));
    delete out.shortIcons;
    if (fns && fns.chartSay) {
        const f = HOOKS.chartSay[fns.chartSay];
        if (!f) throw new Error(`card: unknown chartSay hook "${fns.chartSay}"`);
        out.chartSay = f;
    }
    out.mixWith = clone((chart && chart.mixWith) || []);
    return out;
}

const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o && o[k] !== undefined).map((k) => [k, clone(o[k])]));
const keyOf = (ref) => `${ref.categoryId}:${ref.skillId}`;
const floorsOf = (ref) => Object.fromEntries(Object.entries(ref || {}).filter(([k]) => !['categoryId', 'skillId', 'opts'].includes(k)).map(([k, v]) => [k, clone(v)]));

/** The long lesson's description. */
function detailedOf(card, parts, shape, notes) {
    const t = card.teach || {};
    const fns = card.fns || {};
    const hook = (kind, name) => {
        if (!name) return undefined;
        const f = HOOKS[kind] && HOOKS[kind][name];
        if (!f) throw new Error(`card ${card.id}: unknown ${kind} hook "${name}"`);
        return f;
    };
    // (a card's `readers` add to the shape's; `shapeReaders: false` replaces them - an item kind the shape's readers
    // would misread, e.g. lesson 6's pv-times pairs on the forms shape, whose hto reader names `say`)
    const readers = [...new Set([...(card.shapeReaders === false ? [] : shape.readers || []), ...(card.readers || [])])];
    const prac = parts.practice || {};
    const ranges = card.ranges || {};
    const d = Object.assign({ id: card.id, title: card.title }, pick(card, ['packTitle']), {
        grade: String(card.grade), level: card.level, strand: card.strand, ccss: clone(card.ccss || []), ee: clone(card.ee || []),
    }, pick(card, ['eeAccess', 'eeOwnerList', 'eeNote']), { cra: card.cra || '' }, pick(card, ['flowNote', 'followOn']), pick(t, ['situations']));
    if (prac.fade) d.fade = clone(prac.fade);
    if ((parts.chunks || []).length) d.chunks = parts.chunks.map((c) => (c.lessonData ? Object.assign({}, clone(c), { lessonData: Object.assign({ skills: [] }, clone(c.lessonData), { mixWith: [] }) }) : clone(c)));
    d.skill = clone(parts.lesson);
    if (ranges.pool) d.pool = clone(ranges.pool);
    if (ranges.boardOnly) d.boardOnly = clone(ranges.boardOnly);
    if (prac.edgeTest) d.edgeTest = prac.edgeTest;
    if (prac.edgeOnlyLast) d.edgeOnlyLast = prac.edgeOnlyLast;
    d.practicePages = prac.pages || 1;
    if (prac.sheets) d.practiceSheets = clone(prac.sheets);
    if (parts.mixed) d.mixed = clone(parts.mixed);
    d.vars = varsFrom(readers);
    const lastName = hook('lastName', fns.lastName);
    if (lastName) d.lastName = lastName;
    const answerShow = hook('answerShow', fns.answerShow);
    if (answerShow) d.answerShow = answerShow;
    d.lessonData = lessonDataOf(parts.chart, parts.weDo, fns);
    d.prerequisites = (parts.prereqs || []).map((p, i) => Object.assign({ atom: p.atom && p.atom.n !== undefined ? p.atom.n : i + 1 }, p.items !== undefined ? { items: p.items } : {}, { ref: clone(p.ref), lesson: clone(p.lesson) }));
    if (parts.numberSense) d.numberSense = clone(parts.numberSense);
    if (parts.wordProblem) {
        const st = card.story || {};
        d.wordProblem = Object.assign(clone(parts.wordProblem), pick(st, ['instruction', 'lines', 'answerLine', 'say', 'sayAns']));
    }
    const ex = parts.exit || {};
    d.exit = clone(ex.items || []).map((e) => { delete e.show; return e; });
    if (ex.cols !== undefined) d.exitCols = ex.cols;
    if (prac.fadeMeans) d.fadeMeans = clone(prac.fadeMeans);
    if (ex.instruction !== undefined) d.exitInstruction = ex.instruction;
    if (ex.sayItem !== undefined) d.exitSayItem = ex.sayItem;
    if (ex.say !== undefined) d.exitSay = ex.say;
    if (ex.sayAns !== undefined) d.exitSayAns = ex.sayAns;
    d.retrieval = (parts.retrieval || []).map((r) => { const o = clone(r); delete o.expect; return o; });
    Object.assign(d, pick(t, ['t1Boxes']));
    if (card.edgeCases && card.edgeCases.caseNames && Object.keys(card.edgeCases.caseNames).length) d.caseNames = clone(card.edgeCases.caseNames);
    Object.assign(d, pick(t, ['slotRows']));
    const allCcss = (parts.prereqs || []).length && parts.prereqs.every((p) => /^ccss:/.test(String(libraryIdOf(p.lesson && p.lesson.id))));
    if (t.routeNote !== undefined) d.routeNote = t.routeNote;
    else if (allCcss) d.routeNote = CCSS_ROUTE_NOTE;
    if (t.materials) d.materials = t.materials.concat(SHARED_MATERIALS.filter((m) => !t.materials.includes(m)));
    d.vocabulary = clone(card.vocabulary || []);
    d.atoms = atomsOf(card, parts);
    d.routine = routineOf(card, parts);
    if (t.howToTeach !== undefined) d.howToTeach = clone(t.howToTeach);
    if (t.board !== undefined) d.board = t.board;
    d.mistakes = mistakesOf(card);
    const cq = Object.assign({}, clone(parts.checkQuestion || {}));
    delete cq.board; delete cq.options;
    const show = hook('cqShow', fns.cqShow);
    if (show) cq.show = show;
    cq.response = CHECK_RESPONSE;
    d.checkQuestion = cq;
    const sec = sectionsOf(card, parts, shape, notes);
    d.sections = sec.sections;
    d.transitionsMin = sec.transitionsMin;
    if (t.p3Score) d.p3Score = t.p3Score;
    d.accepted = clone(t.accepted || []);
    d.wrongAnswers = wrongAnswersOf(card);
    // engine flags the card carries as decided values (page fits a lesson needed: chartWide and friends live in
    // the chart part; these are description-level ones such as `supportsModel`)
    for (const [k, v] of Object.entries(parts.flags || {})) if (d[k] === undefined) d[k] = clone(v);
    // the declared repeat key (lesson 7 D2): every part's refs carry it, so the bridge keys an item by its
    // unordered × / ÷ family and its story frame
    if (card.rulings && card.rulings.some((r) => r.id === 'family-repeats')) {
        d.repeatKey = { family: 'unordered', frame: true };
        const mark = (v) => {
            if (Array.isArray(v)) v.forEach(mark);
            else if (isObj(v)) {
                if (typeof v.categoryId === 'string' && typeof v.skillId === 'string') v.repeatKey = 'family+frame';
                for (const [k, x] of Object.entries(v)) if (k !== 'opts' && typeof x !== 'function') mark(x);
            }
        };
        for (const k of ['skill', 'practiceSheets', 'chunks', 'mixed', 'wordProblem', 'exit', 'retrieval', 'checkQuestion', 'prerequisites']) mark(d[k]);
        notes.push('ruling family-repeats: repeatKey family+frame on every ref (the bridge reads it, print-sheet.js refAccepts)');
    }
    d.compiled = { from: `design/lessons/cards/${card.unit}/${card.id}.md`, shape: card.shape, readers, placeholderKeys: [...keysOf(readers)] };
    return d;
}

/** The short lesson: one routine + one lesson record (lessons/families/*.js schema). */
function libraryOf(card, parts, shape, notes) {
    const chart = parts.chart || {};
    const routineId = card.id;
    const routine = {
        archetype: shape.archetype,
        concepts: clone(chart.concepts || []),
        vocab: clone(chart.vocab || []).slice(0, 3),
        // (LR-3: one icon a step on the short lesson - the card's `shortIcons` when the long pack's chart repeats one)
        steps: clone(chart.steps || []).map((st, i) => (chart.shortIcons && chart.shortIcons[i] ? Object.assign(st, { icon: chart.shortIcons[i] }) : st)),
        chant: chart.chant || '',
        format: clone(chart.format || { kind: 'numbered steps with icons', why: '' }),
        example: Object.assign({ match: '[\\s\\S]' }, clone(chart.example || {})),
    };
    for (const k of ['second', 'third', 'fourth']) if (chart[k] && chart[k].test && chart[k].label) routine[k] = clone(chart[k]);
    const weDo = parts.weDo || {};
    if (weDo.guided) routine.guided = clone(weDo.guided);
    const ec = card.edgeCases || {};
    if (Array.isArray(ec.cases) && ec.cases.length) routine.cases = clone(ec.cases);
    else routine.casesPending = `Compiled from card ${card.id}: the long pack names its cases by test (${(parts.practice && parts.practice.edgeTest) || 'none'}); the LR-1 case family is declared when the short lesson is graded.`;
    const id = card.libraryId || libraryIdOf(card.lesson);
    if (!id) throw new Error(`card ${card.id}: lesson "${card.lesson}" has no library id kind`);
    const ref = parts.lesson || {};
    const lesson = { routine: routineId, practice: Object.assign({ skill: keyOf(ref) }, ref.opts ? { opts: clone(ref.opts) } : {}) };
    // The Prerequisite Check (LR-17): one question per prerequisite LESSON; the library needs 3-4 distinct lessons.
    const pre = (parts.prereqs || []).map((p) => {
        const lid = libraryIdOf(p.lesson && p.lesson.id);
        return Object.assign({ lesson: lid, title: (p.lesson && p.lesson.title) || '', key: keyOf(p.ref) }, p.ref.opts ? { opts: clone(p.ref.opts) } : {},
            // (`checks`, LR-17 D12: what the question asks, pupil-facing - the card's own line, else its atom; `why` is the
            // design reason and must differ from it)
            { checks: p.checks || (p.atom && p.atom.skill) || (p.lesson && p.lesson.title) || '' },
            { why: p.why || `${(p.lesson && p.lesson.title) || 'This lesson'} comes before ${card.title || 'this lesson'}.` }, p.items !== undefined ? { items: p.items } : {}, floorsOf(p.ref));
    });
    const distinct = new Set(pre.map((p) => p.lesson));
    if (pre.length >= 3 && pre.length <= 4 && pre.every((p) => p.lesson) && distinct.size === pre.length) {
        lesson.warmup = [];
        lesson.prereqs = pre;
    } else {
        lesson.warmup = pre.map((p) => Object.assign({ key: p.key, why: p.why }, p.opts ? { opts: p.opts } : {}));
        const why = pre.some((p) => !p.lesson) ? 'a prerequisite names no lesson id' : distinct.size < pre.length ? 'two questions route to the same lesson' : `${pre.length} question(s), not 3-4`;
        lesson.prereqsPending = `Compiled from card ${card.id}: the long pack's Prerequisite Check cannot be the library's yet (${why}); the Warm-up holds its skills.`;
        notes.push(`library: prereqsPending (${why})`);
    }
    // LR-18: the Mixed partners - the card's Mixed skills, else the earlier skills of the Prerequisite Check (LR-9).
    const mixSrc = parts.mixed && parts.mixed.skills && parts.mixed.skills.length ? parts.mixed.skills : (parts.prereqs || []).map((p) => p.ref);
    const seen = new Set();
    lesson.mixWith = mixSrc.filter((r) => r && r.categoryId && !seen.has(keyOf(r)) && keyOf(r) !== keyOf(ref) && seen.add(keyOf(r)))
        .map((r) => Object.assign({ key: keyOf(r) }, r.opts ? { opts: clone(r.opts) } : {}));
    // (`practiceBlocks`, parts.weDo: the short lesson's Practice page blocks - schema.js validatePracticeBlocks)
    if (Array.isArray(weDo.practiceBlocks) && weDo.practiceBlocks.length) lesson.practiceBlocks = clone(weDo.practiceBlocks);
    lesson.note = `Compiled from design/lessons/cards/${card.unit}/${card.id}.md (shape ${card.shape}).`;
    return { routines: { [routineId]: routine }, lessons: { [id]: lesson } };
}

/**
 * Compile one card. Throws on a card the compiler cannot read (unknown shape, unknown ref or hook, a budget
 * that is not 60 minutes); everything else it decides is in `notes`.
 */
export function compileLesson(rawCard) {
    if (!rawCard || rawCard.format !== CARD_FORMAT) throw new Error(`card ${rawCard && rawCard.id}: format is not ${CARD_FORMAT}`);
    const shape = SHAPES[rawCard.shape];
    if (!shape) throw new Error(`card ${rawCard.id}: unknown shape "${rawCard.shape}" (shapes/index.js)`);
    const refs = rawCard.refs || {};
    const card = Object.assign({}, rawCard, { parts: resolveRefs(rawCard.parts || {}, refs) });
    const parts = card.parts;
    const notes = [];
    const detailed = detailedOf(card, parts, shape, notes);
    const library = libraryOf(card, parts, shape, notes);
    return { library, detailed, notes };
}

/** Compile every card of a unit: {routines, lessons, detailed: {id: description}, notes: {id: [..]}}. */
export function compileUnit(cards) {
    const out = { routines: {}, lessons: {}, detailed: {}, notes: {} };
    for (const c of cards) {
        const r = compileLesson(c);
        Object.assign(out.routines, r.library.routines);
        Object.assign(out.lessons, r.library.lessons);
        out.detailed[c.id] = r.detailed;
        out.notes[c.id] = r.notes;
    }
    return out;
}

export default { CARD_FORMAT, HAND_FIELDS, CHECK_RESPONSE, SHARED_MATERIALS, CCSS_ROUTE_NOTE, LOOP_MOST, resolveRefs, refsOf, libraryIdOf, sectionOrder, compileLesson, compileUnit };
