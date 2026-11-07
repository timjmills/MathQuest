// js/modules/lessons/shapes/readers.js
// ITEM READERS AND NAMED HOOKS of the lesson compiler (E4, design/lessons/cards/README.md).
//
// A detailed lesson names a dealt item's parts in its scripts ({chart.rows}, {we.0.rule} ...). Those names
// come from the kit's base readers (print-sheet.js dlItemVars: n, ans, text, a, b, op, say, words, Words,
// wrong) plus the description's `vars(q, base)` hook. The hand-written lessons each wrote their own hook;
// the compiler builds it from READERS instead: one reader per item kind (a template's payload), each
// returning {} for an item it does not read. A shape lists its readers; a card may add one (`readers`).
// Each reader declares the names it can return (`keys`), so ws-lesson-compile-unit checks every
// placeholder of a compiled lesson statically, before any render.
//
// HOOKS are the other functions a description may carry (checkQuestion.show, lessonData.chartSay,
// answerShow, lastName): a card names them (`fns`), the compiler looks them up here. A card is JSON, so
// it never holds code.
//
// The readers of the five passed lessons are lifted from them unchanged (lessons 1, 2, 3a, 4, 5); a reader
// is added when a template first needs one, never per lesson.
// Pure module (SCC-01): no DOM, no window, no state, no Math.random.

/** The base names every dealt item has (print-sheet.js dlItemVars), for the static placeholder check. */
export const BASE_KEYS = Object.freeze(['n', 'ans', 'text', 'a', 'b', 'op', 'say', 'words', 'Words', 'wrong']);

const payloadOf = (q) => (q && q.cell && q.cell.payload) || {};
const GLYPH = { '+': '+', '-': '−', x: '×', '*': '×', '/': '÷' };
const fmt = (v) => Number(v).toLocaleString('en-US', { maximumFractionDigits: 6 });
const PLACE_WORD = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands' };

export const READERS = Object.freeze({
    // A 3-digit number's parts (lesson 1: pv expand / combine / unit_form / value, number_word_form) and a compare pair.
    hto: {
        keys: ['a', 'b', 'big', 'h', 't', 'o', 'hv', 'hto', 'tv', 'ov', 'parts', 'say', 'tens', 'eqParts', 'eqOp'],
        read: (q, b) => {
            const pc = payloadOf(q);
            if (pc.kind === 'compare') return { a: pc.a, b: pc.b, big: Math.max(Number(pc.a), Number(pc.b)) };
            const n = Number(b.n);
            if (!Number.isFinite(n) || b.n === '') return {};
            const h = Math.floor(n / 100) * 100, t = Math.floor((n % 100) / 10) * 10, o = n % 10;
            return { h: h / 100, t: t / 10, o, hv: h, hto: `${h / 100} | ${t / 10} | ${o}`, tv: t, ov: o, parts: `${h} + ${t} + ${o}`, say: `${h} plus ${t} plus ${o}`, tens: Math.floor(n / 10), eqParts: [h, t, o], eqOp: '+' };
        },
    },
    // A one-step story's unit word and its parts (lesson 2: the bar-model word-work cell).
    barStory: {
        keys: ['unit', 'parts', 'whole', 'slip', 'question'],
        read: (q, b) => {
            const p = payloadOf(q);
            const st = (p.steps || [])[0] || {};
            const whole = st.ans !== undefined ? st.ans : b.ans;
            const lines = Array.isArray(p.lines) ? p.lines : [];
            return { unit: p.unit || '', parts: st.a !== undefined ? `${st.a} + ${st.b}` : '', whole, slip: Number.isFinite(Number(whole)) ? Number(whole) - 1 : '', question: lines.length ? lines[lines.length - 1] : '' };
        },
    },
    // An array and its turn (lesson 3a: arrays_groups / mult_properties), or a bare × fact.
    arrayTurn: {
        keys: ['rows', 'cols', 'total', 'fact', 'turned', 'both', 'eqParts', 'eqOp', 'eqN', 'eqTurn'],
        read: (q, b) => {
            const p = payloadOf(q);
            if (p.rows !== undefined && p.cols !== undefined && !Array.isArray(p.rows)) {
                const r = Number(p.rows), c = Number(p.cols), t = r * c;
                return { rows: r, cols: c, total: t, fact: `${r} × ${c} = ${t}`, turned: `${c} × ${r} = ${t}`, both: `${r} × ${c} = ${t} and ${c} × ${r} = ${t}`, eqParts: [r, c], eqOp: '×', eqN: t, eqTurn: true };
            }
            const a = Number(b.a), c = Number(b.b);
            if (Number.isFinite(a) && Number.isFinite(c)) return { fact: `${a} × ${c} = ${a * c}`, turned: `${c} × ${a} = ${a * c}` };
            return {};
        },
    },
    // A window of the multiplication chart (lesson 4: mult_chart), or a bare × fact's parity.
    chartWindow: {
        keys: ['rows', 'cols', 'shaded', 'white', 'er', 'erHalf', 'ec', 'oa', 'ob', 'op', 'wa', 'wb', 'wp', 'wh', 'trap', 'ca', 'cb', 'cp',
            'sum', 'p', 'half', 'parity', 'eqParts', 'eqOp'],
        read: (q, b) => {
            const p = payloadOf(q);
            const rows = Array.isArray(p.rows) ? p.rows : [], cols = Array.isArray(p.cols) ? p.cols : [];
            if (rows.length && cols.length) {
                const er = rows.find((v) => v % 2 === 0), ec = cols.find((v) => v % 2 === 0);
                const or = rows.filter((v) => v % 2 === 1).pop(), oc = cols.filter((v) => v % 2 === 1).pop();
                const prods = [...new Set(rows.flatMap((r) => cols.map((c) => r * c)))].sort((x, y) => x - y);
                const out = { rows: rows.join(', '), cols: cols.join(', '), shaded: rows.flatMap((r) => cols.map((c) => r * c)).filter((v) => v % 2 === 0).join(', '), white: prods.filter((v) => v % 2 === 1).join(', ') };
                if (er !== undefined) Object.assign(out, { er, erHalf: er / 2 });
                if (ec !== undefined) Object.assign(out, { ec });
                const or1 = rows.find((v) => v % 2 === 1);
                if (or !== undefined && oc !== undefined) Object.assign(out, { oa: or1, ob: oc, op: or1 * oc });
                if (er !== undefined && ec !== undefined) Object.assign(out, { wa: er, wb: ec, wp: er * ec, wh: er * ec / 2 });
                const trap = prods.find((v) => v % 2 === 0 && v >= 10 && Math.floor(v / 10) % 2 === 1);
                if (trap !== undefined) out.trap = trap;
                if (or !== undefined && ec !== undefined) Object.assign(out, { ca: or, cb: ec, cp: or * ec });
                return out;
            }
            const x = Number(b.a), y = Number(b.b);
            if (!Number.isFinite(x) || !Number.isFinite(y)) return {};
            const pr = x * y;
            return { sum: x + y, p: pr, half: pr % 2 === 0 ? pr / 2 : '', parity: pr % 2 === 0 ? 'even' : 'odd', eqParts: [x, y], eqOp: '×' };
        },
    },
    // One input-output table's rows and rule (lesson 5: function_table_easy).
    ruleTable: {
        keys: ['wrong', 'x1', 'y1', 'x2', 'y2', 'x3', 'y3', 'sign', 'k', 'rule', 'd', 'plus', 'word', 'rows', 'next', 'nextOut', 'wpAns', 'eqN', 'eqParts', 'eqOp'],
        read: (q, base) => {
            const wrong = Object.fromEntries(Object.entries((base && base.wrong) || {}).map(([k, v]) => [k, String(v).replace(/^([+−×÷-]),\s*(\d+)$/, '$1 $2')]));
            const p = (q && q.cell && q.cell.template === 'function-table' && q.cell.payload) || (q && q.ftCheck) || null;
            if (!p || !Array.isArray(p.rows) || p.rows.length < 3 || !Array.isArray(p.rule) || !p.rule.length) return {};
            const [r1, r2, r3] = p.rows;
            const s = p.rule[0];
            const sign = GLYPH[s.op] || s.op;
            const d = Math.abs(r1.y - r1.x);
            const next = Math.max(r1.x, r2.x, r3.x) + 1;
            const nextOut = s.op === 'x' ? next * s.n : s.op === '+' ? next + s.n : next - s.n;
            return {
                wrong, x1: r1.x, y1: r1.y, x2: r2.x, y2: r2.y, x3: r3.x, y3: r3.y,
                sign, k: s.n, rule: `${sign} ${s.n}`, d, plus: r2.x + d,
                word: s.op === 'x' ? 'times' : s.op === '-' ? 'take away' : 'add',
                rows: `${r1.x} → ${r1.y}, ${r2.x} → ${r2.y}, ${r3.x} → ${r3.y}`,
                next, nextOut, wpAns: nextOut, eqN: nextOut, eqParts: [next, s.n], eqOp: sign,
            };
        },
    },
    // ADDED AFTER THE HOLD-OUT RUN (design/lessons/proof/DIFF.md, lesson 6): 10 times / one tenth of a digit's value
    // (placevalue:value form 'times', the pv-times template). Lesson 6's own hook, lifted as a template reader.
    pvTimes: {
        keys: ['big', 'd', 'nF', 'mF', 'v0', 'v1', 'rel', 'place', 'placeM', 'bigSmall', 'small', 'sent', 'sentQ', 'worths', 'eqN', 'wpAns', 'eqParts', 'eqOp'],
        read: (q) => {
            const pc = payloadOf(q);
            if (pc.kind === 'compare') return { big: fmt(Math.max(Number(pc.a), Number(pc.b))) };
            const p = q && q.pv;
            if (!p || p.kind !== 'times') return {};
            const n = fmt(p.n), m = fmt(p.m);
            return {
                d: p.digit, nF: n, mF: m, v0: fmt(p.v0), v1: fmt(p.v1), rel: p.rel,
                place: PLACE_WORD[p.place] || fmt(p.place), placeM: PLACE_WORD[p.placeM] || fmt(p.placeM),
                bigSmall: p.v0 > p.v1 ? 'Bigger' : 'Smaller',
                big: fmt(Math.max(p.v0, p.v1)), small: fmt(Math.min(p.v0, p.v1)),
                sent: `The ${p.digit} in ${n} is ${p.rel} the ${p.digit} in ${m}`,
                sentQ: `The ${p.digit} in ${n} is ___ the ${p.digit} in ${m}`,
                worths: `${fmt(p.v0)} and ${fmt(p.v1)}, ${p.rel}`,
                eqN: 10, wpAns: 10, eqParts: [fmt(Math.max(p.v0, p.v1)), fmt(Math.min(p.v0, p.v1))], eqOp: '÷',
            };
        },
    },
    // ADDED AFTER THE HOLD-OUT RUN (DIFF.md, lesson 7): a two-step story's steps (the word-work two-step cell,
    // algebra:multi_step_word msOps mult / div). A one-step story falls through to barStory's names.
    twoStep: {
        keys: ['unit', 'question', 'story', 'l0', 'l1', 'l2', 'qShort', 'g', 'e', 's1', 'c', 'whole', 'step1', 'step2', 'op1', 'op2', 'm3', 'eqSteps', 'eqParts', 'eqOp', 'eqN'],
        read: (q) => {
            const p = payloadOf(q);
            const st = Array.isArray(p.steps) ? p.steps : [];
            const lines = Array.isArray(p.lines) ? p.lines : [];
            if (st.length !== 2) return {};
            const [s1, s2] = st;
            const G = { '+': '+', '-': '−', '*': '×', '/': '÷' };
            return {
                unit: p.unit || '', question: lines[lines.length - 1] || '', story: lines.join(' '),
                l0: lines[0] || '', l1: lines[1] || '', l2: lines[2] || '',
                qShort: String(lines[lines.length - 1] || '').replace(/ does (?:each friend|[A-Z][a-z]+) have (left|now)\?$/, (m, w) => (w === 'left' ? ' are left?' : ' now?')),
                g: s1.a, e: s1.b, s1: s1.ans, c: s2.bottom, whole: s2.ans,
                step1: `${s1.a} ${G[s1.op]} ${s1.b} = ${s1.ans}`, step2: `${s1.ans} ${G[s2.op]} ${s2.bottom} = ${s2.ans}`,
                op1: G[s1.op], op2: G[s2.op],
                m3: s2.op === '+' ? s1.b + s2.bottom : Math.abs(s1.b - s2.bottom),
                eqSteps: [{ parts: [s1.a, s1.b], op: G[s1.op], n: s1.ans }, { parts: [s1.ans, s2.bottom], op: G[s2.op], n: s2.ans }],
                eqParts: [s1.ans, s2.bottom], eqOp: G[s2.op], eqN: s2.ans,
            };
        },
    },
});

/** Named hooks a card may ask for (`fns`), by kind. */
export const HOOKS = Object.freeze({
    // checkQuestion.show(value, q): each option as the pupil reads it
    cqShow: {
        turnedFact: (v, q) => { const p = payloadOf(q); return `${p.cols} × ${p.rows} = ${v}`; },
        ruleAsWritten: (v) => String(v).replace(/^([+−×÷-]),\s*(\d+)$/, '$1 $2'),
        dropParen: (v) => String(v).replace(/ \(.*\)$/, ''),
    },
    // lessonData.chartSay(q): the chart's Say in the lesson's words
    chartSay: {
        ruleInOut: (q) => {
            const p = q && q.cell && q.cell.payload; const r = p && p.rows && p.rows[0]; const s0 = p && p.rule && p.rule[0];
            return r && s0 ? `In ${r.x}, out ${r.y}. ${r.x} ${{ '+': '+', '-': '−', x: '×' }[s0.op]} ${s0.n} = ${r.y}. I test every row.` : '';
        },
    },
    // answerShow(text): T6 answers as the pupil writes them
    answerShow: {
        ruleAsWritten: (t) => t.replace(/([+−×÷-]),\s*(\d+)/g, '$1 $2'),
        commas: (t) => String(t).replace(/(^|[^\d,])(\d{4,})(?![\d,])/g, (m, a, n) => a + Number(n).toLocaleString('en-US')),
    },
    // lastName(q): the lesson's words for a ★★★ last-row item (T5 Watch)
    lastName: {
        chartTraps: (q) => {
            const p = payloadOf(q); const rows = p.rows || [], cols = p.cols || [];
            if (!rows.length || !cols.length) return '';
            const span = (l) => (l.length > 2 ? `${l[0]}–${l[l.length - 1]}` : l.join(', '));
            const pr = [...new Set(rows.flatMap((r) => cols.map((c) => r * c)))].sort((x, y) => x - y);
            const trap = pr.filter((v) => v % 2 === 0 && v >= 30 && Math.floor(v / 10) % 2 === 1);
            const odd = [...new Set(rows.flatMap((r) => cols.filter((c) => r % 2 && c % 2 && r * c >= 55).map((c) => r * c)))].sort((x, y) => x - y);
            const and = (l) => (l.length > 1 ? `${l.slice(0, -1).join(', ')} and ${l[l.length - 1]}` : String(l[0]));
            const bits = [trap.length ? `${and(trap)} ${trap.length > 1 ? 'are' : 'is'} even (tens digit odd)` : '', odd.length ? `${and(odd)} ${odd.length > 1 ? 'stay' : 'stays'} white` : ''].filter(Boolean);
            return `${span(rows)} × ${span(cols)}: ${bits.join(', ')}`;
        },
        // (added after the hold-out run, lesson 6)
        pvPair: (q) => {
            const p = q && q.pv;
            if (!p || p.kind !== 'times') return '';
            return `${fmt(p.n)} and ${fmt(p.m)} (${PLACE_WORD[Math.max(p.place, p.placeM)]} and ${PLACE_WORD[Math.min(p.place, p.placeM)]}, ${p.dir === 'times' ? '10 times' : 'one tenth'})`;
        },
    },
});

/**
 * The `vars(q, base)` hook of a lesson from its readers, in order: each reader's names are added over the
 * earlier ones (a later reader wins a shared name only when it returns it).
 */
export function varsFrom(readerIds) {
    const list = (readerIds || []).map((id) => READERS[id]).filter(Boolean);
    return (q, base) => {
        const out = {};
        for (const r of list) {
            let got = {};
            try { got = r.read(q, base) || {}; } catch (e) { got = {}; }
            Object.assign(out, got);
        }
        return out;
    };
}

/** Every name the readers can return, plus the base names. */
export const keysOf = (readerIds) => new Set([...BASE_KEYS, ...(readerIds || []).flatMap((id) => (READERS[id] ? READERS[id].keys : []))]);

export default { BASE_KEYS, READERS, HOOKS, varsFrom, keysOf };
