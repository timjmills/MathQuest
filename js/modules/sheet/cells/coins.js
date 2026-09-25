// js/modules/sheet/cells/coins.js
// The `coins` template: every P10 cell built on coins and notes (design/research/time-money.md
// §9 - §12, §13.6 - §13.9). One template, switched on `payload.kind` (plain data, SCC-Q3):
//
//   count     MC, MB    coins (and / or notes) in rows, highest value first (RP-113); the answer
//                       box after them. Plain numbers carry no unit (SL-9); with a currency the
//                       unit word is printed after the box (ruling Q3). `answer: 'two'` (MB-4,
//                       notes AND coins) asks for two numbers: `[ ] riyals [ ] dirhams`.
//   find      MV-1      a field of mixed coins: circle every coin worth N, write how many.
//   order     MV-4      notes (or coins) in a row, an order box under each (least first).
//   tally     MS-2      "Make N with the fewest coins": a table, one row per coin value, the
//                       drawn coin and a "how many" box (§13.9).
//   enough    MP-1, 2   a collection and a price tag; check Enough or Not enough.
//   compare   MS-4      two collections A and B; check the one with more, or write < = >.
//   check     MS-3      one collection; does it make N? check Yes or No (a decision cell).
//   notation  MW        a collection (or words) and the money slot `[ ].[ ]` (§13.8).
//
// COINS ARE GENERIC (RP-110 ... RP-112, owner ruling 2026-09-19): outlined value circles sized by
// value, never national art, never a sign on a coin. HINTS: the count-by-five dots (RP-114) and,
// in Model and Guided, a count-on box under each coin of a single row (RP-113) — both fade by page
// role (ctx.scaffoldLevel); `dots: 'dots'` keeps the dots on every page.
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import {
    L, P, INK, GREY, esc, isTwin, sizeOf, S, textPt, digitPt, zonePt, box, levelOf,
    coinSVG, coinRow, noteRow, priceTag, moneySlot, numberSlot, words, row, tickList, tickedIndex, partValue, splitList,
    currencyOf, unitWord, fmtMoney,
} from './tmkit.js';

/** An amount in words for the cell text: "65" (plain), "65 dirhams", "3 riyals 25 dirhams". */
export function amountText(currency, minor, { major = false } = {}) {
    const c = currencyOf(currency);
    if (major) return c.major ? `${minor} ${unitWord(currency, minor, true)}` : String(minor);
    if (!c.minor) return String(minor);
    const M = Math.floor(minor / 100), m = minor % 100;
    if (!M) return `${m} ${unitWord(currency, m)}`;
    return `${M} ${unitWord(currency, M, true)}${m ? ` ${m} ${unitWord(currency, m)}` : ''}`;
}

const cellRoot = (ctx, cls, inner) => `<div class="tm-cell ${cls}"${isTwin(ctx) ? ' data-mq-tm="1"' : ''} `
    + `style="color:${INK};font-family:'Andika','Open Sans',sans-serif;text-align:center;display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3)};">${inner}</div>`;

const lbl = (ctx, t) => words(ctx, `<b>${t}</b>`, { pt: textPt(ctx) + 1 });

function dotsOn(p, ctx) {
    if (p.dots === 'dots') return true;
    if (p.dots === 'none') return false;
    return levelOf(ctx) >= 2;
}

/** The collection: notes row above, coins row below (MB-4). */
function collection(ctx, p, { compact = false } = {}) {
    const parts = [];
    if (Array.isArray(p.notes) && p.notes.length) parts.push(noteRow(ctx, p.notes, { compact }));
    if (Array.isArray(p.coins) && p.coins.length) parts.push(coinRow(ctx, p.coins, { dots: dotsOn(p, ctx), compact, wrap: p.wrap || (p.coins.length > 6 ? 5 : 6), scatter: !!p.scatter }));
    return parts.join('');
}

/** RP-113 count-on boxes (Model / Guided only, one row of at most 5 coins). */
function countOn(ctx, p) {
    const coins = p.coins || [];
    if (levelOf(ctx) < 2 || !coins.length || (p.notes || []).length || coins.length > 5) return '';
    const s = S(ctx);
    let run = 0;
    const kv = {};
    coins.forEach((v, i) => { run += v; kv[`run${i}`] = String(run); });
    const cells = coins.map((v, i) => {
        const shown = ctx.state === 'answered' || ctx.state === 'traced' ? kv[`run${i}`] : '';
        const w = Math.max(16, (v >= 25 ? 24.26 : 20));
        return `<span style="display:inline-flex;justify-content:center;width:${L(ctx, w)};">`
            + box(ctx, { id: `run${i}`, value: shown, w: 14, h: s.writeMm + 2, graded: false }) + `</span>`;
    }).join('');
    return `<div data-ws-zone="count-on" style="display:flex;justify-content:center;gap:${L(ctx, 2)};">${cells}</div>`;
}

/* ---------------------------------------------------------------- kinds */

function count(p, ctx) {
    const c = currencyOf(p.currency);
    let slot;
    if (p.answer === 'two') {
        const major = Math.floor(p.total / 100), minor = p.total % 100;
        const kv = { major: String(major), minor: String(minor) };
        const val = (id) => partValue(ctx, id, kv, (v) => { const m = /^\s*(\d+)\s*,\s*(\d+)/.exec(String(v || '')); return m ? { major: m[1], minor: m[2] } : null; });
        const b = (id) => box(ctx, { id, value: val(id), w: 16, h: S(ctx).writeMm + 2, mark: 'cell' });
        const join = isTwin(ctx) ? ' data-mq-join=", "' : '';
        slot = `<span data-ws-slot="two" data-ws-shape="unit"${join} style="display:inline-flex;align-items:center;gap:${L(ctx, 2)};">`
            + `${b('major')}${words(ctx, esc(c.major || 'in notes'))}${b('minor')}${words(ctx, esc(c.minor || 'in coins'))}</span>`;
    } else {
        const major = p.answer === 'major';
        const unit = major ? (c.major ? c.major : '') : (c.minor ? c.minor : '');
        slot = numberSlot(ctx, 'answer', p.total, { digits: String(p.total).length > 2 ? 3 : 2, unit, mark: 'blank' });
    }
    return cellRoot(ctx, 'tm-count', `${collection(ctx, p)}${countOn(ctx, p)}${row(ctx, lbl(ctx, 'Total') + slot, { gap: 3 })}`);
}

function find(p, ctx) {
    const unit = unitWord(p.currency, p.target);
    const head = lbl(ctx, `Worth ${p.target}${unit ? ` ${esc(unit)}` : ''}:`);
    return cellRoot(ctx, 'tm-find', `${collection(ctx, Object.assign({}, p, { dots: 'none', wrap: 6 }))}`
        + row(ctx, head + numberSlot(ctx, 'answer', p.count, { digits: 2, unit: p.count === 1 ? 'coin' : 'coins', mark: 'blank' }), { gap: 3 }));
}

function order(p, ctx) {
    const s = S(ctx);
    const ranks = (p.ranks || []).map(String);
    const kv = Object.fromEntries(ranks.map((r, i) => [`o${i}`, r]));
    const items = (p.notes && p.notes.length ? p.notes : p.coins || []);
    const isNote = !!(p.notes && p.notes.length);
    const cols = items.map((v, i) => `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 2)};">`
        + (isNote ? noteRow(ctx, [v]) : coinRow(ctx, [v]))
        + box(ctx, { id: `o${i}`, value: partValue(ctx, `o${i}`, kv, splitList('o')), w: 14, h: s.writeMm + 2, mark: 'cell' }) + `</div>`).join('');
    const join = isTwin(ctx) ? ' data-mq-join=", "' : '';
    return cellRoot(ctx, 'tm-order', `<div data-ws-slot="order"${join} style="display:flex;justify-content:center;align-items:flex-end;gap:${L(ctx, 4)};">${cols}</div>`);
}

function tally(p, ctx) {
    const s = S(ctx);
    const vals = p.values || [];
    const counts = (p.counts || []).map(String);
    const kv = Object.fromEntries(counts.map((c, i) => [`n${i}`, c]));
    const rows = vals.map((v, i) => `<tr><td style="padding:${L(ctx, 1)} ${L(ctx, 3)};border:${L(ctx, 0.26)} solid ${INK};text-align:center;line-height:0;">${coinSVG(ctx, v, { compact: true })}</td>`
        + `<td style="padding:${L(ctx, 1)} ${L(ctx, 3)};border:${L(ctx, 0.26)} solid ${INK};text-align:center;">`
        + box(ctx, { id: `n${i}`, value: partValue(ctx, `n${i}`, kv, splitList('n')), w: 14, h: s.writeMm + 2, mark: 'cell' }) + `</td></tr>`).join('');
    const head = `<tr><th style="font-size:${P(ctx, zonePt(ctx))};padding:${L(ctx, 1)} ${L(ctx, 3)};border:${L(ctx, 0.26)} solid ${INK};">Coin</th>`
        + `<th style="font-size:${P(ctx, zonePt(ctx))};padding:${L(ctx, 1)} ${L(ctx, 3)};border:${L(ctx, 0.26)} solid ${INK};">How many</th></tr>`;
    const join = isTwin(ctx) ? ' data-mq-join=", "' : '';
    return cellRoot(ctx, 'tm-tally', `${lbl(ctx, `Make ${esc(amountText(p.currency, p.target))}`)}`
        + `<table data-ws-slot="tally"${join} style="border-collapse:collapse;background:#fff;">${head}${rows}</table>`);
}

function enough(p, ctx) {
    const labels = ['Enough', 'Not enough'];
    const on = tickedIndex(ctx, labels, p.enough ? 'Enough' : 'Not enough');
    return cellRoot(ctx, 'tm-enough', `${collection(ctx, p)}${row(ctx, lbl(ctx, 'Price') + priceTag(ctx, amountText(p.currency, p.price)), { gap: 3 })}`
        + tickList(ctx, labels, { on, vertical: false }));
}

function compare(p, ctx) {
    const side = (name, c) => `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 2)};">${lbl(ctx, name)}`
        + `${collection(ctx, { coins: c.coins || [], notes: c.notes || [], dots: 'none', wrap: 3 })}</div>`;
    if (p.response === 'sign') {
        const s = S(ctx);
        const d = s.writeMm + 2;
        let v = '';
        if (ctx.state === 'wrong') v = String((ctx.wrong && ctx.wrong.value) || '');
        else if (ctx.state !== 'blank') v = p.sign;
        const circle = `<span data-ws-slot="sign" data-ws-shape="circle"${isTwin(ctx) ? ' data-mq-blank="box"' : ''} style="display:inline-flex;align-items:center;justify-content:center;`
            + `box-sizing:border-box;width:${L(ctx, d + 4)};height:${L(ctx, d + 4)};border:${L(ctx, 0.26)} solid ${INK};border-radius:50%;background:#fff;`
            + `font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;color:${ctx.state === 'traced' ? GREY : INK};">${esc(v)}</span>`;
        return cellRoot(ctx, 'tm-compare', `<div style="display:flex;justify-content:center;align-items:center;gap:${L(ctx, 6)};">${side('A', p.a)}${circle}${side('B', p.b)}</div>`);
    }
    const labels = ['A', 'B'];
    const on = tickedIndex(ctx, labels, p.more);
    return cellRoot(ctx, 'tm-compare', `<div style="display:flex;justify-content:center;align-items:flex-start;gap:${L(ctx, 12)};">${side('A', p.a)}${side('B', p.b)}</div>`
        + row(ctx, lbl(ctx, 'More money:') + tickList(ctx, labels, { on, vertical: false }), { gap: 3 }));
}

function check(p, ctx) {
    const labels = ['Yes', 'No'];
    const on = tickedIndex(ctx, labels, p.makes ? 'Yes' : 'No');
    return cellRoot(ctx, 'tm-check', `${collection(ctx, p)}${row(ctx, lbl(ctx, `Makes ${esc(amountText(p.currency, p.target))}?`) + tickList(ctx, labels, { on, vertical: false }), { gap: 3 })}`);
}

function notation(p, ctx) {
    const c = currencyOf(p.currency);
    const top = p.words ? words(ctx, `<b>${esc(p.words)}</b>`, { pt: textPt(ctx) + 2 }) : collection(ctx, p);
    const sign = p.sign && c.sign ? c.sign : '';
    const nWhole = Math.max(1, String(Math.floor(p.total / 100)).length);
    return cellRoot(ctx, 'tm-notation', `${top}${row(ctx, moneySlot(ctx, fmtMoney(p.total), { nWhole, sign }), { gap: 3 })}`);
}

/* ---------------------------------------------------------------- the key */

function keyOf(p) {
    switch (p.kind) {
        case 'find': return { value: p.count, display: String(p.count), slots: { answer: { value: String(p.count), graded: true } } };
        case 'order': case 'tally': {
            const list = (p.kind === 'order' ? p.ranks : p.counts || []).map(String);
            const pre = p.kind === 'order' ? 'o' : 'n';
            return { value: list.join(', '), display: list.join(', '), slots: Object.fromEntries(list.map((x, i) => [`${pre}${i}`, { value: x, graded: true }])) };
        }
        case 'enough': { const v = p.enough ? 'Enough' : 'Not enough'; return { value: v, display: v, slots: { choice: { value: v, graded: true } } }; }
        case 'check': { const v = p.makes ? 'Yes' : 'No'; return { value: v, display: v, slots: { choice: { value: v, graded: true } } }; }
        case 'compare': {
            const v = p.response === 'sign' ? p.sign : p.more;
            return { value: v, display: v, slots: { [p.response === 'sign' ? 'sign' : 'choice']: { value: v, graded: true } } };
        }
        case 'notation': {
            const v = fmtMoney(p.total);
            const [w, c] = v.split('.');
            return { value: v, display: v, slots: { whole: { value: w, graded: true }, cents: { value: c, graded: true } } };
        }
        default: {
            if (p.answer === 'two') {
                const M = Math.floor(p.total / 100), m = p.total % 100;
                return { value: `${M}, ${m}`, display: `${M} ${unitWord(p.currency, M, true) || 'in notes'}, ${m} ${unitWord(p.currency, m) || 'in coins'}`,
                    slots: { major: { value: String(M), graded: true }, minor: { value: String(m), graded: true } } };
            }
            return { value: p.total, display: String(p.total), slots: { answer: { value: String(p.total), graded: true } } };
        }
    }
}

register('coins', {
    render(p, ctx) {
        switch (p.kind) {
            case 'find': return find(p, ctx);
            case 'order': return order(p, ctx);
            case 'tally': return tally(p, ctx);
            case 'enough': return enough(p, ctx);
            case 'compare': return compare(p, ctx);
            case 'check': return check(p, ctx);
            case 'notation': return notation(p, ctx);
            default: return count(p, ctx);
        }
    },
    answerKey: keyOf,
    footprint(p, ctx) {
        const coins = (p.coins || []).length, notes = (p.notes || []).length;
        const wide = p.kind === 'compare' || p.kind === 'order' || p.kind === 'find' || notes > 3 || coins > 6
            || (notes && coins) || (levelOf(ctx) >= 2 && p.kind === 'count' && coins && coins <= 5 && !notes);
        return { wMm: wide ? 186 : 93, hMm: null, measure: true, factLike: false, maxCols: wide ? 1 : 2 };
    },
    inputs(p) {
        const one = (id, kind = 'number', shape = 'box') => ({ id, kind, shape, graded: true, order: 0, scopes: ['full', 'answer-only'] });
        switch (p.kind) {
            case 'enough': case 'check': return [Object.assign(one('choice', 'check', 'check'), { scopes: ['full', 'answer-only', 'decision'] })];
            case 'compare': return [p.response === 'sign' ? one('sign', 'sign', 'circle') : Object.assign(one('choice', 'check', 'check'), { scopes: ['full', 'answer-only', 'decision'] })];
            case 'order': return (p.ranks || []).map((_, i) => Object.assign(one(`o${i}`), { order: i }));
            case 'tally': return (p.counts || []).map((_, i) => Object.assign(one(`n${i}`), { order: i }));
            case 'notation': return [one('whole', 'money'), Object.assign(one('cents', 'money'), { order: 1 })];
            default:
                if (p.answer === 'two') return [one('major'), Object.assign(one('minor'), { order: 1 })];
                return [one('answer', 'number', 'unit')];
        }
    },
    layout(p) {
        const wide = p && (p.kind === 'compare' || p.kind === 'order' || p.kind === 'find' || ((p.notes || []).length && (p.coins || []).length));
        return { card: wide ? 'card-wide-visual' : 'card-medium-visual', checker: 'value' };
    },
});
