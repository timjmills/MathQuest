// js/modules/sheet/roles/detailed-lesson.js
// THE DETAILED LESSON (Atomisation Lesson Planner V22, Appendix I; design/lesson-planner/DETAILED_MAKER.md):
// the role that draws what the standard lesson maker does not -
//
//   T1  Lesson at a glance      standards line · Lesson guidance boxes · Lesson flow table · Materials · Vocabulary
//   T2  Atomisation template    atoms table (>= 5) · routine table · How to teach · Common mistakes (+ 12 mm continuation)
//   T2b Reference key           page ids, fade levels, loop shapes, abbreviations, slot shapes, icons, band labels
//   T3-T5 Delivery              one `Section n · Name (min)` band per section: boxes, T-SCRIPT rows, T-LOOP,
//                               a real pupil-page thumbnail (26.2 %) beside the first rows
//   T6  Routing                 Prerequisite routing · Accepted answers · Answers at a glance (fade ★) · Wrong answers
//   P5  Word problem            story box + the RCDWS panel (`rcdws` template) · Workspace · equation frame · Say
//   P6  Exit slip               A4 landscape, two 132.5 mm halves, dashed cut line + scissors, 4 items, Say,
//                               "I can do this." / "I need one more day."
//
// The pupil pages P0-P4 are NOT drawn here: the bridge (print-sheet.js buildDetailedLesson) builds them
// with the existing roles (pre-skill-check, lesson, independent, mixed-practice) - Owner default Q1.
//
// Pagination of the teacher pages: the host measures every block (`heights`, mm) in the real
// stylesheet and `paginateTeacher` packs whole blocks into pages - a band whose blocks run over
// continues on a page with the 12 mm header, its strip repeated (V22 §10.9, PG-20...24). The last band of
// every page takes the spare height (`grow`), so a page's frame reaches the footer (site lint E9b).
//
// Pure module (SCC-01): no window, no DOM, no state, no Math.random, no app import.

import {
    teacherPage, tBand, tLine, tBox, tScript, tLoop, tTable, cellText, keyNamed, checkList, vocabCard, vocabCards,
    boardLine, keyIcon, stepMark, thumb, besideThumb, twoCols, subHead, TEACHER_BODY_MM, KEY_INK, LIFT_MAX_CHARS,
} from '../teacher-parts.js';
export { TEACHER_BODY_MM, LIFT_MAX_CHARS };
import { teacherIcon, routineIcon } from '../teacher-icons.js';
import { stepIcon } from '../lesson-icons.js';
import { esc, blank } from '../cell.js';
import { story, headerFields, strandTab, pageTitle } from '../frame.js';
import { barMini } from '../cells/word-work.js';

export const ROLE_ID = 'detailed-lesson';

/** PT-FRM-9 (V22 §8.7): every strand-tab id the detailed pack prints. */
export const DETAILED_TAB_IDS = Object.freeze(['Prerequisite', 'Number sense', 'Anchor chart', 'Lesson 1', 'Practice 1', 'Practice 2',
    'Mixed 1', 'Word problem', 'Exit slip', 'Answer Key', 'Teacher 1', 'Teacher 2', 'Teacher 3', 'Teacher 4', 'Teacher 5', 'Reference']);

/** V22 Part 11: which delivery page holds which sections, and the pupil page it shows. */
export const DELIVERY = Object.freeze({ T3: [1, 2, 3, 4], T4: [5, 6], T5: [7, 8, 9, 10] });

const STRIP_MM = 8;          // band strip (V22 §8.8)
const BAND_PAD_MM = 3.5;     // .dl-bandin padding top + bottom
const LINE_MM = 1.5;         // the band's shared 1.5 pt edge

/* ================================================================= placeholders and vars */

/** Fill {a.b} from vars; unknown names throw (a script never prints a typo or a typed number). */
export function fill(text, vars) {
    return String(text).replace(/\{([a-zA-Z0-9_.]+)\}/g, (m, path) => {
        const v = path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), vars);
        if (v === undefined || v === null) throw new Error(`detailed lesson: unknown placeholder {${path}}`);
        return String(v);
    });
}

/* ============================================================================ the bands */

/**
 * The teacher bands of the pack, page group by page group: {T1: Band[], T2, T2b, T3, T4, T5, T6}.
 * A Band is {label, blocks: [html]} (label null = a plain block above the bands).
 *
 * @param {Object} d        the description (lessons/detailed/<id>.js)
 * @param {Object} V        the placeholder vars from the dealt items (the bridge)
 * @param {Object} pages    {thumbs: {P0, P2, P3, P4}: pupil page html; glance: [{page, answers, fade}];
 *                           routing: [{q, atom, lesson}]; tags: {ccss, ee}}
 */
export function teacherBands(d, V, pages) {
    const f = (s) => fill(s, V);
    const newCount = (d.routine || []).filter((r) => r.tag === 'New').length;
    const flow = newCount >= 4 ? 'Chunked' : 'Standard';
    const out = {};

    // ---------------------------------------------------------------------------- T1
    const pageOf = (s) => ({ P0: 'Prerequisite Check', P1: 'Number sense', P2: 'Anchor chart', P3: 'Lesson sheet', P4: 'Practice 1–2', P5: 'Word problem', P6: 'Exit slip' }[s.page] || 'Mini whiteboards');
    const flowRows = d.sections.map((s) => [String(s.n), cellText(s.name), cellText(pageOf(s)), `<span class="num">${s.min}</span>`]);
    if (d.transitionsMin) flowRows.push(['', 'Transitions', 'between pages', `<span class="num">${d.transitionsMin}</span>`]);
    flowRows.push(['', '<b>Total</b>', '', `<b>${d.sections.reduce((a, s) => a + s.min, 0) + (d.transitionsMin || 0)}</b>`]);
    const diagram = (g) => {
        if (!g) return '';
        if (g.kind === 'digit') return `<span class="dl-digit">${esc(g.text)}</span>`;
        if (g.kind === 'bar') return barMini({ whole: g.whole, a: g.a, b: g.b, mark: g.mark || '', wMm: 36, pt: 12 });
        if (g.kind === 'pv') return `<span class="dl-pv"><span>H</span><span>T</span><span>O</span>${String(g.digits).split('').map((c) => `<span>${esc(c)}</span>`).join('')}</span>`;
        return esc(g.text || '');
    };
    out.T1 = [
        { label: null, blocks: [tLine(`<b>CCSS</b> ${esc(pages.tags.ccss.join(', '))} · <b>EE</b> ${esc(pages.tags.ee.join(', '))} · <b>CRA:</b> ${esc(d.cra)} · <b>Flow:</b> ${flow}`, 'dl-flow tline')] },
        { label: 'Lesson guidance:', blocks: (d.t1Boxes || []).map((b) => tBox(b.kind, b.title, esc(f(b.text)))) },
        { label: 'Lesson flow:', blocks: [tTable(['#', 'Section', 'Pupil page', 'Min'], flowRows, { widths: ['8mm', '', '45mm', '14mm'] })] },
        { label: 'Materials:', blocks: [checkList(d.materials || [])] },
        { label: 'Vocabulary:', blocks: [vocabCards((d.vocabulary || []).map((v) => vocabCard(v.word, v.gloss, diagram(v.diagram))))] },
    ];

    // ---------------------------------------------------------------------------- T2
    const atoms = d.atoms.slice().sort((a, b) => (b.prereq ? 1 : 0) - (a.prereq ? 1 : 0));
    const atomRows = atoms.map((a, i) => ({
        cls: a.critical ? 'dl-crit' : '',
        cells: [String(i + 1), keyNamed(a.skill), `${esc(a.type)}${a.prereq ? ' · Pre-requisite' : ''}`, `${a.critical ? `${keyIcon()} <b>Critical Atom.</b> ` : ''}${esc(a.notes)}`],
    }));
    const routineRows = d.routine.map((r, i) => ({
        cls: r.critical ? 'dl-crit' : '',
        cells: [stepMark(i + 1), `${r.critical ? `${keyIcon()} ` : ''}${esc(r.step)}`, esc(r.tag), esc(r.check)],
    }));
    const mistakeRows = d.mistakes.map((m) => [`<b>${esc(m.name)}</b>`, `Step ${m.step}`, esc(m.looks), esc(m.fix)]);
    const links = d.mistakes.filter((m) => m.option).map((m) => `Check Question option ${m.option} catches <b>${esc(m.name)}</b>.`).join(' ');
    out.T2 = [
        { label: 'What students need to know:', blocks: [tTable(['#', 'Skill or Concept', 'Atom Type', 'Teacher Notes'], atomRows, { widths: ['7mm', '', '36mm', ''] })] },
        { label: 'What students do:', blocks: [tTable(['Step', 'Task / Routine atom', 'Tag', 'Check it with'], routineRows, { widths: ['16mm', '', '26mm', '48mm'] }),
            tLine(`Rows tagged New: ${newCount} → Flow: ${flow}.${d.flowNote ? ` ${esc(d.flowNote)}` : ''}`)] },
        { label: 'How to teach:', blocks: [`<ol class="dl-list">${d.howToTeach.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>`, boardLine()] },
        { label: 'Common mistakes:', blocks: [tTable(['Mistake', 'Broken step', 'Looks like', 'Fix'], mistakeRows, { widths: ['30mm', '20mm', '', ''] }), links ? tLine(links) : ''] },
    ];

    // ---------------------------------------------------------------------------- T2b
    const slotDraw = {
        line: '<span style="display:inline-block;width:14mm;border-bottom:0.75pt solid #000;height:5mm"></span>',
        box: '<span style="display:inline-block;width:10mm;height:8mm;border:1.5pt solid #000"></span>',
        check: '<span class="dl-cbox" style="display:inline-block"></span>',
    };
    const iconRow = (id, label, accent) => [accent ? stepIcon(id, 'L', { mm: 5 }) : teacherIcon(id, 5), esc(label)];
    out.T2b = [{ label: 'Reference key:', blocks: [twoCols(
        [subHead('Pages and order'), tTable(['Page', 'Tab', 'Score'], [
            ['P0', 'Prerequisite', 'one per question'], ['P1', 'Number sense', '/10'], ['P2', 'Anchor chart', 'none (a poster)'], ['P3', 'Lesson 1', 'Independent cells'],
            ['P4', 'Practice n / Mixed n', 'every cell'], ['P5', 'Word problem', '/1'], ['P6', 'Exit slip', '/4 a half'], ['T1–T5', 'Teacher n', '—'], ['T6', 'Answer Key', '—'],
        ].map((r) => r.map(cellText))),
        subHead('Fade levels'), tTable(['Label', 'Means'], [['★', 'Guided: hints on, step 1 traced'], ['★★', 'Independent: hints off'], ['★★★', 'Last row: the edge cases']].map((r) => r.map(cellText))),
        subHead('Data loop'), tLoop({ most: 'Go on.', half: 'Short reteach, then go on.', fewer: 'Stop. Reteach with a concrete example.' }),
        subHead('Abbreviations'), tTable(['Short', 'In full'], [['MWBs', 'mini whiteboards'], ['ELL', 'English language learners'], ['SPED', 'special education students'], ['RCDWS', 'Read, Circle, Draw, Write, Solve'], ['CRA', 'Concrete-Representational-Abstract']].map((r) => r.map(cellText))),
        ].join(''),
        [subHead('Answer slots'), tTable(['Shape', 'Used for'], [[slotDraw.line, 'a number after ='], [slotDraw.box, 'a part inside an expression'], [slotDraw.check, 'a tick (routine panel, exit slip)']]),
        subHead('Icons'), tTable(['Icon', 'Means'], [iconRow('tip', 'Tip'), iconRow('feedback', 'Feedback'), iconRow('watch', 'Watch'), iconRow('research', 'Research'),
            iconRow('key', 'Critical Atom'), iconRow('language', 'Language tip'), iconRow('why', 'Why it works'), iconRow('board', 'Board'),
            [d.lessonData.steps.map((s, i) => stepMark(i + 1, s.icon)).join(' '), 'The pupil Steps (accent)']]),
        subHead('Band labels'), tLine('Pupil: Vocabulary · Remember · Guided Practice · Steps · Independent Practice · Mixed Review · Number sense: A / B · Workspace · Another example · Say · Rule.'),
        tLine('Teacher: Lesson guidance · Lesson flow · Materials · What students need to know · What students do · How to teach · Common mistakes · Section n · Prerequisite routing · Accepted answers · Answers at a glance.'),
        ].join(''))] }];

    // ---------------------------------------------------------------------------- T3-T5
    const THUMB_OF = { 1: 'P0', 5: 'P2', 6: 'P3', 8: 'P4' };
    for (const [tid, nums] of Object.entries(DELIVERY)) {
        out[tid] = nums.map((n) => d.sections.find((s) => s.n === n)).filter(Boolean).map((s) => {
            const boxes = (s.boxes || []).map((b) => tBox(b.kind, b.title, esc(f(b.text))));
            const rows = s.rows.map((r, i) => ({ n: i + 1, do: r.do && f(r.do), say: r.say && f(r.say), ask: r.ask && f(r.ask), note: r.note && f(r.note) }));
            const th = THUMB_OF[s.n] && pages.thumbs[THUMB_OF[s.n]];
            // The thumbnail sits beside the first rows (the boxes and as many rows as its 77.8 mm hold).
            const lead = Math.min(rows.length, th ? 4 : 0);
            const blocks = [];
            if (th) blocks.push(besideThumb(boxes.join('') + tScript(rows.slice(0, lead)), thumb(th)));
            else if (boxes.length) blocks.push(boxes.join(''));
            for (const r of rows.slice(th ? lead : 0)) blocks.push(tScript([r]));
            if (s.loop) blocks.push(tLoop({ most: f(s.loop.most), half: f(s.loop.half), fewer: f(s.loop.fewer) }));
            return { label: `Section ${s.n} · ${s.name} (${s.min} min)`, blocks };
        });
    }

    // ---------------------------------------------------------------------------- T6
    out.T6 = [
        { label: 'Prerequisite routing:', blocks: [tTable(['Question', 'Prerequisite (T2 atom)', 'If missed → Lesson'], pages.routing.map((r) => [cellText(r.q), cellText(r.atom), cellText(r.lesson)])
            .concat([['', '<b>Rule</b>', '0 missed: go on · 1: that lesson first · 2+: the earliest first']]))] },
        { label: 'Accepted answers:', blocks: [`<ul class="dl-list">${(d.accepted || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`] },
        { label: 'Answers at a glance:', blocks: [tTable(['Page', 'Answers', 'Fade'], pages.glance.map((g) => [cellText(g.page), `<span class="dl-ka" data-ka>${esc(g.answers)}</span>`, esc(g.fade)]), { widths: ['32mm', '', '16mm'] })] },
        { label: 'Wrong answers to look for when marking:', blocks: [tTable(['Pupil wrote', 'Likely mistake', 'Next step'], d.wrongAnswers.map((w) => [cellText(w.wrote), `<b>${esc(w.mistake)}</b>`, cellText(w.next)]))] },
    ];
    return { bands: out, flow };
}

/* ======================================================================= pagination */

/** The height (mm) of one band on a page, from its blocks' measured heights. */
const bandH = (label, hs, over) => (label ? (over || STRIP_MM + LINE_MM + BAND_PAD_MM) : BAND_PAD_MM) + hs.reduce((a, h) => a + h, 0) + 2 * Math.max(0, hs.length - 1);

/**
 * Pack a group's bands into pages. `heights[b][k]` = the measured height (mm) of block k of band b.
 * A band runs over: its remaining blocks continue on the next page (12 mm header), strip repeated.
 * @returns {{head: 'lifted'|'cont', bands: {label, blocks: string[]}[]}[]}
 */
export function paginateTeacher(bands, heights, { body = TEACHER_BODY_MM } = {}) {
    // Flatten to blocks in order; a page holds consecutive blocks, a band's strip repeats on every
    // page its blocks reach (PG-21: a band is never separated from its first block).
    const flat = [];
    bands.forEach((b, bi) => b.blocks.forEach((html, k) => { if (html) flat.push({ bi, label: b.label, html, h: (heights[bi] && heights[bi][k]) || 0, over: heights[bi] && heights[bi].over }); }));
    const cost = (list) => {
        // (adjacent bands share their 1.5 pt edge: each band after the first is 0.53 mm shorter)
        let t = 0, prev = -1, run = [], nb = 0;
        const close = () => { if (run.length) { t += bandH(run[0].label, run.map((x) => x.h), run[0].over) - (nb++ ? 0.53 : 0); } run = []; };
        for (const x of list) { if (x.bi !== prev) { close(); prev = x.bi; } run.push(x); }
        close();
        return t;
    };
    const budgetOf = (i) => (i === 0 ? body.lifted : body.cont) - 1;
    const pack = (cap) => {
        const pages = [];
        let cur = [];
        for (const x of flat) {
            const lim = Math.min(budgetOf(pages.length), cap);
            if (cur.length && cost(cur.concat(x)) > lim) { pages.push(cur); cur = []; }
            cur.push(x);
        }
        if (cur.length) pages.push(cur);
        return pages;
    };
    let pages = pack(Infinity);
    // PG-23 / V22 §8.12.4: a page under half full is rebalanced with its neighbour - of every packing
    // with the same page count, the one whose emptiest page is fullest.
    if (pages.length > 1) {
        const n = pages.length;
        const fill = (ps) => Math.min(...ps.map((pg, i) => cost(pg) / budgetOf(i)));
        let best = pages, bestFill = fill(pages);
        for (let cap = budgetOf(1); cap > 40; cap -= 2) {
            const p2 = pack(cap);
            if (p2.length !== n) break;
            const f = fill(p2);
            if (f > bestFill) { best = p2; bestFill = f; }
        }
        pages = best;
    }
    return pages.map((list, i) => {
        const out = [];
        for (const x of list) { const last = out[out.length - 1]; if (last && last.bi === x.bi) last.blocks.push(x.html); else out.push({ bi: x.bi, label: x.label, blocks: [x.html] }); }
        return { head: i === 0 ? 'lifted' : 'cont', bands: out };
    });
}

/** The html of one teacher page from its packed bands (the last band takes the spare height). */
export function teacherBody(pg) {
    return pg.bands.map((b, i) => {
        const inner = b.blocks.join('');
        if (!b.label) return `<div class="dl-plain">${inner}</div>`;
        return tBand(b.label, inner, { grow: i === pg.bands.length - 1 });
    }).join('');
}

/**
 * One teacher page. `tabId` 'Teacher n' | 'Reference' | 'Answer Key'.
 * @param {{tabId, level, strand, title, footer: {left, center, right, year}, head, id}} o
 */
export const renderTeacherPage = (pg, o) => teacherPage({
    tab: [`Level ${o.level}`, o.strand, o.tabId], title: o.title, head: pg.head, footer: o.footer, body: teacherBody(pg), id: o.id, kind: o.kind || 'teacher',
});

/** A block measured alone, as the host renders it (inside one band, page width). */
export const measureShell = (block) => `<div class="ws-band dl-band"><div class="dl-bandin">${block}</div></div>`;

/* ===================================================================== P5 word problem */

/**
 * P5 (V22 §9.6): the story box (our own words, one sentence a line, the answer line its last
 * line), the RCDWS panel (`rcdws` template), the Workspace band (the Draw-it zone), the equation
 * frame and the Say band. Two plan items carry slots: the answer line and the equation frame.
 *
 * @param {{lines: string[], answerLine: string, say: string, n: number, parts: number[], item: string}} wp
 * @param {Object} frame   {header, footer, seed, form}
 */
export function wordProblemPlan(wp, frame) {
    const digits = String(wp.n).length;
    const ans = { slots: { answer: { value: String(wp.n) } }, display: String(wp.n) };
    const storyItem = {
        nolabel: true, drawsAnswer: true, key: ans,
        render: (c) => story(wp.lines.map((l) => `<div>${esc(l)}</div>`).join('')
            + `<div class="dl-ansline">${String(wp.answerLine).split('__').map(esc).join(blank({ id: 'answer', kind: 'number', shape: 'line', digits, graded: true }, c, c.state === 'answered' ? ans : null))}</div>`)
            .replace('<div class="ws-story">', '<div class="ws-story" data-item="' + esc(wp.item) + '" data-rep="story" data-row="0">'),
    };
    const parts = wp.parts.filter((v) => v !== null && v !== undefined);
    const eqKey = { slots: Object.fromEntries([...parts.map((v, i) => [`e${i}`, { value: String(v) }]), ['eq', { value: String(wp.n) }]]) };
    const eqItem = {
        nolabel: true, drawsAnswer: true, key: eqKey,
        render: (c) => {
            const k = c.state === 'answered' ? eqKey : null;
            const box = (id, dg) => blank({ id, kind: 'number', shape: 'box', digits: dg, graded: false }, c, k);
            return `<div class="dl-eq">${parts.map((v, i) => box(`e${i}`, Math.max(2, String(v).length))).join(`<span>${esc(wp.op || '+')}</span>`)}<span>=</span>${box('eq', Math.max(2, String(wp.n).length))}</div>`;
        },
    };
    const panelItem = { nolabel: true, q: { cell: { template: 'rcdws', payload: {} }, text: '' }, drawsAnswer: true, key: { slots: {} } };
    const sections = [
        { kind: 'instruction', text: wp.instruction || 'Read the story. Draw it. Solve.' },
        { kind: 'row', cls: 'dl-wptoprow', widths: ['58fr', '42fr'], height: '72mm', parts: [
            { kind: 'grid', cols: 1, rows: 1, items: [storyItem], cls: 'fixed dl-wpstory', height: '72mm' },
            { kind: 'grid', cols: 1, rows: 1, items: [panelItem], cls: 'fixed dl-wppanel', height: '72mm' },
        ] },
        { kind: 'band', label: 'Workspace:', instr: '', grow: true, content: { kind: 'html', html: '<div class="dl-work" data-work data-draw></div>' } },
        { kind: 'grid', cols: 1, rows: 1, items: [eqItem], cls: 'fixed dl-wpeq', height: '26mm' },
        { kind: 'say', frame: wp.say, digits },
    ];
    return Object.assign({ role: 'word-problem', ctx: { look: 'ican', size: 'L', paper: 'A4', scaffoldLevel: 1 }, cls: 'dl-page dl-pupil', pages: [{ sections }] }, frame);
}

/* ======================================================================= P6 exit slip */

/**
 * P6 (V22 §9.7, PG-5): A4 landscape; two identical 132.5 mm halves, 6 mm apart, a dashed 0.75 pt
 * cut line between them with the scissors at its top. Each half: its own Name / Score header, the
 * tab and the I Can title, the instruction, a 2 x 2 grid of the 4 items (`items`: plan items of the
 * kit's own cells), the Say band, and the two self-report boxes. The second half is a copy.
 */
export function exitSlipPlan({ items, instr, say, tab, title, cellH, cols = 2 }, frame) {
    const head = `<div class="dl-halfhead"><div class="ws-rowA">${headerFields({ name: true, score: items.length })}${strandTab(tab)}</div>${pageTitle(title)}<div class="ws-headrule"></div></div>`;
    const self = '<div class="dl-selfrow"><span><span class="dl-cbox"></span>I can do this.</span><span><span class="dl-cbox"></span>I need one more day.</span></div>';
    const rows = Math.ceil(items.length / cols);
    const half = (copy) => ({ kind: 'col', cls: 'dl-half', parts: [
        { kind: 'html', html: head },
        { kind: 'instruction', text: instr },
        { kind: 'grid', cols, rows, labels: 'letter', start: 1, cls: `fixed dl-exitgrid${copy ? ' dl-copy' : ''}`, height: `${(rows * cellH).toFixed(2)}mm`, items: copy ? items.map((it) => Object.assign({}, it, { copy: true })) : items },
        ...(say ? [{ kind: 'say', frame: say, digits: 3 }] : []),
        { kind: 'html', html: self },
    ] });
    const cut = { kind: 'html', html: `<div class="dl-cut" data-cut><i data-cut></i>${teacherIcon('scissors', 6)}</div>` };
    const sections = [{ kind: 'row', cls: 'dl-halves', widths: ['132.5mm', '6mm', '132.5mm'], parts: [half(false), cut, half(true)] }];
    return Object.assign({ role: 'exit-slip', ctx: { look: 'ican', size: 'L', paper: 'A4', scaffoldLevel: 0 }, cls: 'dl-page dl-pupil dl-land', pages: [{ sections, header: { name: false, date: false, score: false, tab: false, title: '' } }] }, frame);
}

/* ===================================================================== P1 number sense */

/**
 * P1 (V22 §9.2, owner default Q4): the Daily look - black number tabs, 1.5 pt cells - two bands,
 * `Number sense: A` and `Number sense: B`, five rows each. Each row: its tab, the item's library
 * instruction in a 58 mm column, the kit's own cell beside it. Ten rows share the body.
 * @param {{bands: {label: string, instr: string, items: Object[]}[], cellH: number}} o  items: plan items
 */
export function numberSensePlan({ bands, cellH }, frame) {
    let start = 1;
    const sections = bands.map((b) => {
        const items = b.items.map((it) => Object.assign({}, it, {
            render: (c) => `<div class="dl-nsrow"><span class="dl-nsinstr ws-instrline">${esc(b.instr)}</span><div class="dl-nsitem">${it.render ? it.render(c) : ''}</div></div>`,
        }));
        const part = { kind: 'band', label: b.label, instr: '', content: { kind: 'grid', cols: 1, rows: items.length, labels: 'tab', start, cls: 'fixed dl-nsgrid', height: `${(items.length * cellH).toFixed(2)}mm`, items } };
        start += items.length;
        return part;
    });
    return Object.assign({ role: 'number-sense', ctx: { look: 'daily', size: 'L', paper: 'A4', scaffoldLevel: 1 }, cls: 'dl-page dl-pupil', pages: [{ sections }] }, frame);
}

/** The extra pupil-page CSS of P5 and P6 (additive; `dl-*` only). */
export const DETAILED_PUPIL_CSS = `
.ws-page .dl-wptoprow{flex:none}
.ws-page .dl-wptoprow .ws-grid{height:100%}
.ws-page .dl-wpstory .ws-cell,.ws-page .dl-wppanel .ws-cell{justify-content:stretch;align-items:stretch;padding:3mm}
.ws-page .dl-wpstory .ws-story{height:100%;display:flex;flex-direction:column;justify-content:space-evenly;font-size:15pt;line-height:1.45;padding:3mm 4mm}
.ws-page .dl-ansline{display:flex;align-items:flex-end;gap:2mm}
.ws-page .dl-work{flex:1 1 auto;min-height:60mm}
.ws-page .dl-wpeq .ws-cell{justify-content:center;align-items:center}
.ws-page .dl-eq{display:flex;align-items:center;gap:3mm;font-size:28pt}
.ws-page .dl-eq .ws-box{height:14mm;display:inline-flex;align-items:center;justify-content:center;font-size:28pt;font-weight:400}
.ws-page.dl-land .ws-body>.mq-row{flex:1 1 auto}
.ws-page .dl-half>.ws-instrline{flex:none}
.ws-page .dl-half>.ws-grid{flex:none}
.ws-page .dl-nsgrid .ws-cell{justify-content:stretch;align-items:center}
.ws-page .dl-nsrow{display:grid;grid-template-columns:58mm 1fr;align-items:center;width:100%;gap:3mm}
.ws-page .dl-nsrow>.dl-nsinstr{height:auto;padding:0;font-size:15pt;line-height:1.2;white-space:normal}
.ws-page .dl-nsitem{display:flex;justify-content:center;align-items:center;min-width:0}
`;

export default {
    ROLE_ID, DETAILED_TAB_IDS, DELIVERY, fill, teacherBands, paginateTeacher, teacherBody, renderTeacherPage, measureShell,
    wordProblemPlan, exitSlipPlan, numberSensePlan, DETAILED_PUPIL_CSS, KEY_INK, routineIcon,
};
