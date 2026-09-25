// js/modules/sheet/cells/money-columns.js
// The `money-columns` template: adding prices and finding change in columns
// (design/research/time-money.md §12 MP-3 ... MP-8, §13.8; PAGE_TYPES §3.3 PT-CGR-6).
//
// The P4 computation stack with a POINT TRACK: every row's digits sit in one track per place,
// the decimal point in its own narrow track aligned through every row, and pre-printed in the
// answer row (PT-CGR-6: "the printed point on the operands always stays"). Whole-unit items
// (`cents: false`, MP-3) have no point track and a unit word after the answer. With a currency
// and `sign` the sign stands in a track LEFT of the top operand only (ruling Q3); never on a
// coin, a title or an instruction.
//
// Rows: regroup boxes (scratch, never graded, SL-10) / the top operand / the operator and the
// second operand / the rule / the answer strips (SL-12: one strip per run of digit tracks, the
// point track between them).
//
// Screen twin: each answer strip is ONE input (`data-mq-cell`, the whole units then the
// hundredths), joined "." in reading order, so the host's one answer input receives "12.50".
//
// Integer arithmetic only: every amount is in minor units (§2.4 rule 2).
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import {
    L, P, INK, GREY, PT_MM, esc, isTwin, sizeOf, S, digitPt, textPt, zonePt, partValue, splitMoney, words, currencyOf, fmtMoney,
} from './tmkit.js';
import { KEY_FEATURES } from './k2kit.js';

const MINUS = '−';

function geometry(p, ctx) {
    const res = p.op === '-' ? p.a - p.b : p.a + p.b;
    const whole = (v) => String(Math.floor(v / 100));
    const nW = Math.max(whole(p.a).length, whole(p.b).length, whole(res).length);
    const track = (ctx.metrics && ctx.metrics.trackMm) || digitPt(ctx) * PT_MM * 0.72;
    return { res, nW, track, pointW: Math.max(3, track * 0.35) };
}

/** The digit tracks of an amount, right-aligned into nW whole tracks (+ 2 hundredths). */
function digitsOf(v, nW, cents) {
    const w = String(Math.floor(v / 100)).padStart(nW, ' ').split('');
    const c = cents ? String(v % 100).padStart(2, '0').split('') : [];
    return { w, c };
}

function cellSpan(ctx, w, text, { color = INK } = {}) {
    return `<span style="display:inline-block;width:${L(ctx, w)};text-align:center;color:${color};">${esc(text === ' ' ? '' : text)}</span>`;
}

function strip(ctx, id, n, track, value, { twin }) {
    const s = S(ctx);
    const h = s.writeMm * 1.2;
    const chars = String(value || '').padStart(value ? n : 0, ' ').split('');
    const ink = value ? (ctx.state === 'traced' ? 'trace' : 'solid') : null;
    const segs = Array.from({ length: n }, (_, i) => `<span style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;`
        + `width:${L(ctx, track)};height:100%;${i < n - 1 ? `border-right:${L(ctx, 0.26)} solid ${INK};` : ''}">${esc((chars[i] || '').trim())}</span>`).join('');
    const hook = twin && isTwin(ctx) ? ` data-mq-cell="1" data-mq-w="${n}"` : '';
    return `<span data-ws-slot="${id}" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${hook} style="display:inline-flex;align-items:stretch;box-sizing:border-box;`
        + `width:${L(ctx, n * track)};height:${L(ctx, h)};border:${L(ctx, 0.26)} solid ${INK};border-radius:${L(ctx, 1.25)};background:#fff;`
        + `font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;color:${ctx.state === 'traced' ? GREY : INK};${KEY_FEATURES}">${segs}</span>`;
}

register('money-columns', {
    render(p, ctx) {
        const g = geometry(p, ctx);
        const cents = !!p.cents;
        const c = currencyOf(p.currency);
        const sign = p.sign && c.sign ? c.sign : '';
        const signW = sign ? Math.max(g.track, (sign.length * 0.6 + 0.4) * digitPt(ctx) * PT_MM) : 0;
        const opW = g.track;
        const A = digitsOf(p.a, g.nW, cents), Bd = digitsOf(p.b, g.nW, cents);
        const fontRow = `font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1.25;${KEY_FEATURES}`;
        const numRow = (lead, d) => `<div style="display:flex;align-items:center;${fontRow}">${lead}`
            + d.w.map((x) => cellSpan(ctx, g.track, x)).join('')
            + (cents ? cellSpan(ctx, g.pointW, '.') + d.c.map((x) => cellSpan(ctx, g.track, x)).join('') : '') + `</div>`;
        const lead = (sym, withSign) => (signW ? cellSpan(ctx, signW, withSign ? sign : '') : '') + cellSpan(ctx, opW, sym);
        // Regroup boxes above the digit tracks (scratch: never graded, never a screen input).
        const reg = `<div style="display:flex;align-items:flex-end;height:${L(ctx, S(ctx).regroupMm)};">${lead('', false)}`
            + Array.from({ length: g.nW + (cents ? 2 : 0) + (cents ? 1 : 0) }, (_, i) => {
                const isPoint = cents && i === g.nW;
                const w = isPoint ? g.pointW : g.track;
                if (isPoint || i === 0) return `<span style="display:inline-block;width:${L(ctx, w)};"></span>`;
                return `<span style="display:inline-flex;justify-content:center;width:${L(ctx, w)};"><span data-ws-slot="regroup" data-ws-shape="box" data-ws-graded="0" `
                    + `style="display:inline-block;box-sizing:border-box;width:${L(ctx, Math.max(4.4, w - 2))};height:${L(ctx, S(ctx).regroupMm - 1)};border:${L(ctx, 0.26)} solid ${INK};border-radius:${L(ctx, 1)};"></span></span>`;
            }).join('') + `</div>`;
        const ruleW = signW + opW + (g.nW + (cents ? 2 : 0)) * g.track + (cents ? g.pointW : 0);
        const rule = `<div style="width:${L(ctx, ruleW)};border-top:${L(ctx, 0.79)} solid ${INK};margin:${L(ctx, 0.8)} 0;"></div>`;
        // The answer: the key's value, or the wrong work, per strip.
        const key = splitMoney(fmtMoney(g.res)) || { whole: String(Math.floor(g.res / 100)), cents: '00' };
        const kv = cents ? { whole: key.whole, cents: key.cents } : { whole: String(Math.floor(g.res / 100)) };
        const val = (id) => partValue(ctx, id, kv, (v) => (cents ? splitMoney(v) : { whole: String(v) }));
        const ansRow = `<div style="display:flex;align-items:center;${fontRow}">${signW ? cellSpan(ctx, signW, '') : ''}${cellSpan(ctx, opW, '')}`
            + strip(ctx, 'whole', g.nW, g.track, val('whole'), { twin: true })
            + (cents ? cellSpan(ctx, g.pointW, '.') + strip(ctx, 'cents', 2, g.track, val('cents'), { twin: true }) : '')
            + (!cents && c.major ? `<span style="margin-left:${L(ctx, 2)};">${words(ctx, esc(c.major))}</span>` : '') + `</div>`;
        const join = isTwin(ctx) ? ' data-mq-join="."' : '';
        return `<div class="tm-cell tm-columns"${isTwin(ctx) ? ' data-mq-tm="1"' : ''}${join} style="color:${INK};font-family:'Andika','Open Sans',sans-serif;`
            + `display:flex;flex-direction:column;align-items:center;"><div style="display:inline-flex;flex-direction:column;align-items:flex-start;">`
            + reg + numRow(lead('', true), A) + numRow(lead(p.op === '-' ? MINUS : '+', false), Bd) + rule + ansRow + `</div></div>`;
    },
    answerKey(p) {
        const res = p.op === '-' ? p.a - p.b : p.a + p.b;
        if (!p.cents) {
            const v = Math.floor(res / 100);
            return { value: v, display: String(v), slots: { whole: { value: String(v), graded: true } } };
        }
        const v = fmtMoney(res);
        const [w, c] = v.split('.');
        return { value: v, display: v, slots: { whole: { value: w, graded: true }, cents: { value: c, graded: true } } };
    },
    footprint(p, ctx) {
        return { wMm: sizeOf(ctx) === 'L' ? 93 : 62, hMm: null, measure: true, factLike: false, maxCols: sizeOf(ctx) === 'L' ? 2 : 3 };
    },
    inputs(p) {
        const out = [{ id: 'whole', kind: 'money', shape: 'box', graded: true, order: 0, scopes: ['full', 'answer-only'] }];
        if (p.cents) out.push({ id: 'cents', kind: 'money', shape: 'box', graded: true, order: 1, scopes: ['full', 'answer-only'] });
        return out;
    },
    layout() { return { card: 'card-column', checker: 'value' }; },
});
