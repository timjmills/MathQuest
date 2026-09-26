// js/modules/sheet/cells/picture-row.js
// The `picture-row` template (build lane k2, 2026-09-25; design/BUILD_LIST.md "New templates"):
// a row of line-drawn pictures the pupil looks at, matches, compares or orders. One template,
// switched on `payload.kind` (plain data, SCC-Q3):
//
//   pick    a row of 2-5 pictures, each tagged A, B, C ... with a check box UNDER it; an optional
//           TARGET in a key box at the left ("the same as this one"). The pupil checks one box.
//           match_same (same / shadow / same kind), odd_one_out, compare_size (bigger / smaller),
//           compare_capacity (holds more / less), ordinal (check the 3rd).
//   order   a row of 3 pictures, each with a number box under it: write 1, 2, 3 (smallest first,
//           or holds least first). The boxes are the answer, read left to right ("2, 1, 3").
//   words   a picture (or a row of pictures with one ringed) beside a list of words, each with a
//           check box on its right (the compare cell's form): full / half full / empty, what can
//           we measure, why does it not belong.
//   line    a start flag and a line of pictures (ordinal numbers): with `task: 'write'` the pupil
//           writes the position of the marked picture ("4th") in one box.
//
// THE PICTURES (one spec shape everywhere): {shape, s} a k2kit line-art picture at scale s of the
// row's picture size, {shape, sil: true} its grey silhouette (a shadow to match), {container,
// fill, w, h} an outline container with its fill in the single grey (INK-3a) under a 0.75 pt
// surface line, {tool} a ruler, a pan balance or a measuring jug. Every picture sits on the floor
// of a box of ONE size, so a row of different sizes shares a base line (the size comparison is
// fair) and every column of the row is the same width.
//
// Nothing prints the answer (RP-1): no count, no "bigger" caption. The key (AK-1, AK-2) checks the
// right box or writes the numbers; Error analysis draws the wrong work. The screen twin needs no
// widget: the check boxes are the tap rows screen-cell.js `wireTickBoxes` already wires (k2kit
// `choiceRow`), a number box carries `data-mq-cell` (several) or `data-mq-blank` (one).
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import {
    L, P, B, INK, GREY, SW, n2, svg, root, box, slotValue, shapeOf, silhouette, textPt, digitPt, inlineBoxMm, isTwin,
    pscale, checkedChoice, choiceRow, LETTERS, shownParts, inkOf, zonePt, k2StepCtx, workInk, ringWrap, stepSlot, sizeOf,
} from './k2kit.js';

/* ----------------------------------------------------------------------------- the pictures */

/** An outline container with a grey fill `fill` (0..1) of its inside, drawn in a w x h box (mm). */
function container(kind, fill, w, h) {
    const o = SW.heavy / 2;
    const x0 = o, x1 = w - o, y0 = o + h * 0.06, y1 = h - o;
    let outline, inner, extra = '';
    // inner: the body the liquid fills, as a function y -> [xl, xr] (straight sides) plus its top/bottom
    const lerp = (a, b, t) => a + (b - a) * t;
    let side;   // (y) => [xl, xr]
    if (kind === 'jug') {
        const bx0 = x0 + w * 0.12, bx1 = x1 - w * 0.22;
        outline = `M${n2(bx0)} ${n2(y0)}L${n2(bx1)} ${n2(y0)}L${n2(bx1 + w * 0.06)} ${n2(y0 - h * 0.05)}L${n2(bx1 + w * 0.04)} ${n2(y0 + h * 0.08)}L${n2(bx1)} ${n2(y1)}L${n2(bx0)} ${n2(y1)}Z`;
        // the body's right wall slants from under the spout (bx1 + 4 %) down to bx1: the liquid follows
        // it, so a full jug has no white wedge under the spout (critic k2-r1)
        const ysp = y0 + h * 0.08;
        side = (y) => [bx0, y <= ysp ? bx1 + w * 0.04 : lerp(bx1 + w * 0.04, bx1, (y - ysp) / (y1 - ysp))];
        extra = `<path d="M${n2(bx0)} ${n2(y0 + h * 0.18)}Q${n2(x0 - w * 0.02)} ${n2(y0 + h * 0.2)} ${n2(x0)} ${n2(lerp(y0, y1, 0.42))}Q${n2(x0 + w * 0.02)} ${n2(lerp(y0, y1, 0.62))} ${n2(bx0)} ${n2(lerp(y0, y1, 0.64))}" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linecap="round"/>`;
        return draw(y0);
    } else if (kind === 'bucket') {
        const tx0 = x0 + w * 0.04, tx1 = x1 - w * 0.04, bx0 = x0 + w * 0.18, bx1 = x1 - w * 0.18, yt = y0 + h * 0.22;
        outline = `M${n2(tx0)} ${n2(yt)}L${n2(tx1)} ${n2(yt)}L${n2(bx1)} ${n2(y1)}L${n2(bx0)} ${n2(y1)}Z`;
        side = (y) => { const t = (y - yt) / (y1 - yt); return [lerp(tx0, bx0, t), lerp(tx1, bx1, t)]; };
        extra = `<path d="M${n2(tx0 + w * 0.04)} ${n2(yt)}Q${n2(w / 2)} ${n2(y0 - h * 0.1)} ${n2(tx1 - w * 0.04)} ${n2(yt)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
        return draw(yt);
    } else if (kind === 'bottle') {
        const bx0 = x0 + w * 0.12, bx1 = x1 - w * 0.12, nx0 = w * 0.38, nx1 = w * 0.62, ys = y0 + h * 0.34, yn = y0 + h * 0.14;
        outline = `M${n2(nx0)} ${n2(y0)}L${n2(nx1)} ${n2(y0)}L${n2(nx1)} ${n2(yn)}Q${n2(bx1)} ${n2(yn + h * 0.06)} ${n2(bx1)} ${n2(ys)}L${n2(bx1)} ${n2(y1)}L${n2(bx0)} ${n2(y1)}L${n2(bx0)} ${n2(ys)}Q${n2(bx0)} ${n2(yn + h * 0.06)} ${n2(nx0)} ${n2(yn)}Z`;
        side = (y) => (y >= ys ? [bx0, bx1] : [nx0, nx1]);
        return draw(y0 + h * 0.2);
    } else if (kind === 'bowl') {
        const yt = y0 + h * 0.4;
        outline = `M${n2(x0)} ${n2(yt)}L${n2(x1)} ${n2(yt)}Q${n2(x1)} ${n2(y1)} ${n2(w / 2)} ${n2(y1)}Q${n2(x0)} ${n2(y1)} ${n2(x0)} ${n2(yt)}Z`;
        side = (y) => { const t = Math.max(0, (y - yt) / (y1 - yt)); const half = (x1 - x0) / 2 * Math.sqrt(Math.max(0, 1 - t * t)); return [w / 2 - half, w / 2 + half]; };
        return draw(yt);
    } else {
        // glass: a little wider at the top
        const tx0 = x0 + w * 0.06, tx1 = x1 - w * 0.06, bx0 = x0 + w * 0.18, bx1 = x1 - w * 0.18;
        outline = `M${n2(tx0)} ${n2(y0)}L${n2(tx1)} ${n2(y0)}L${n2(bx1)} ${n2(y1)}L${n2(bx0)} ${n2(y1)}Z`;
        side = (y) => { const t = (y - y0) / (y1 - y0); return [lerp(tx0, bx0, t), lerp(tx1, bx1, t)]; };
    }
    return draw(y0);

    function draw(top) {
        const f = Math.max(0, Math.min(1, Number(fill) || 0));
        let body = `<path d="${outline}" fill="#fff" stroke="none"/>`;
        if (f > 0) {
            // the liquid (critic k2-r1: white wedges under the jug's spout, at the bowl's curve and the
            // bottle's shoulders): the WHOLE inside filled grey by the outline itself, then the part
            // above the surface painted back to paper. The outline and the handles are drawn after,
            // so the liquid follows every curve exactly; "full" fills to the rim.
            const ys = top + (y1 - top) * (1 - f);
            body += `<path d="${outline}" fill="${GREY}" stroke="none"/>`;
            if (f < 1) {
                body += `<rect x="-1" y="-1" width="${n2(w + 2)}" height="${n2(ys + 1)}" fill="#fff" stroke="none"/>`;
                const [sl, sr] = side(ys);
                body += `<path d="M${n2(sl + o)} ${n2(ys)}H${n2(sr - o)}" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
            }
        }
        body += `<path d="${outline}" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linejoin="round"/>${extra}`;
        return body;
    }
}

/** A measuring tool: a ruler, a pan balance or a measuring jug, in a w x h box. */
function tool(kind, w, h) {
    const o = SW.heavy / 2;
    const stroke = `fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linejoin="round" stroke-linecap="round"`;
    const hair = `stroke="${INK}" stroke-width="${n2(SW.hair)}"`;
    if (kind === 'ruler') {
        const y0 = h * 0.38, y1 = h * 0.62;
        let t = `<rect x="${n2(o)}" y="${n2(y0)}" width="${n2(w - 2 * o)}" height="${n2(y1 - y0)}" fill="#fff" ${stroke}/>`;
        for (let k = 1; k < 10; k++) t += `<path d="M${n2(o + (w - 2 * o) * k / 10)} ${n2(y0)}v${n2((y1 - y0) * (k % 5 ? 0.35 : 0.6))}" ${hair}/>`;
        return t;
    }
    if (kind === 'scale') {
        // a pan balance: a post, a beam and two hanging pans
        const cx = w / 2, top = h * 0.2;
        return `<path d="M${n2(cx - w * 0.18)} ${n2(h - o)}H${n2(cx + w * 0.18)}M${n2(cx)} ${n2(h - o)}V${n2(top)}M${n2(w * 0.1)} ${n2(top)}H${n2(w * 0.9)}" ${stroke}/>`
            + `<path d="M${n2(w * 0.1)} ${n2(top)}L${n2(w * 0.02)} ${n2(h * 0.55)}M${n2(w * 0.1)} ${n2(top)}L${n2(w * 0.18)} ${n2(h * 0.55)}M${n2(w * 0.9)} ${n2(top)}L${n2(w * 0.82)} ${n2(h * 0.55)}M${n2(w * 0.9)} ${n2(top)}L${n2(w * 0.98)} ${n2(h * 0.55)}" ${hair}/>`
            + `<path d="M${n2(w * 0.0 + o)} ${n2(h * 0.55)}Q${n2(w * 0.1)} ${n2(h * 0.72)} ${n2(w * 0.2 - o)} ${n2(h * 0.55)}ZM${n2(w * 0.8 + o)} ${n2(h * 0.55)}Q${n2(w * 0.9)} ${n2(h * 0.72)} ${n2(w - o)} ${n2(h * 0.55)}Z" fill="#fff" ${stroke}/>`
            + `<circle cx="${n2(cx)}" cy="${n2(top)}" r="${n2(Math.min(1.2, w * 0.03))}" fill="${INK}"/>`;
    }
    // a measuring jug with lines up its side
    let t = container('jug', 0, w, h);
    for (let k = 1; k <= 4; k++) t += `<path d="M${n2(w * 0.18)} ${n2(h * (0.3 + k * 0.13))}h${n2(w * 0.14)}" ${hair}/>`;
    return t;
}

/** Small pictograms beside the words of a word bank (a hint that fades): long, tall, heavy, holds, colour. */
function icon(kind, d) {
    const st = `fill="none" stroke="${INK}" stroke-width="${n2(SW.one)}" stroke-linecap="round" stroke-linejoin="round"`;
    const s = d;
    if (kind === 'long') return `<path d="M${n2(s * 0.08)} ${n2(s / 2)}H${n2(s * 0.92)}M${n2(s * 0.25)} ${n2(s * 0.33)}L${n2(s * 0.08)} ${n2(s / 2)}L${n2(s * 0.25)} ${n2(s * 0.67)}M${n2(s * 0.75)} ${n2(s * 0.33)}L${n2(s * 0.92)} ${n2(s / 2)}L${n2(s * 0.75)} ${n2(s * 0.67)}" ${st}/>`;
    if (kind === 'tall') return `<path d="M${n2(s / 2)} ${n2(s * 0.08)}V${n2(s * 0.92)}M${n2(s * 0.33)} ${n2(s * 0.25)}L${n2(s / 2)} ${n2(s * 0.08)}L${n2(s * 0.67)} ${n2(s * 0.25)}M${n2(s * 0.33)} ${n2(s * 0.75)}L${n2(s / 2)} ${n2(s * 0.92)}L${n2(s * 0.67)} ${n2(s * 0.75)}" ${st}/>`;
    if (kind === 'heavy') return `<path d="M${n2(s * 0.3)} ${n2(s * 0.4)}Q${n2(s * 0.3)} ${n2(s * 0.12)} ${n2(s / 2)} ${n2(s * 0.12)}Q${n2(s * 0.7)} ${n2(s * 0.12)} ${n2(s * 0.7)} ${n2(s * 0.4)}M${n2(s * 0.15)} ${n2(s * 0.9)}L${n2(s * 0.25)} ${n2(s * 0.4)}H${n2(s * 0.75)}L${n2(s * 0.85)} ${n2(s * 0.9)}Z" ${st}/>`;
    if (kind === 'holds') return `<path d="M${n2(s * 0.22)} ${n2(s * 0.12)}H${n2(s * 0.7)}L${n2(s * 0.64)} ${n2(s * 0.9)}H${n2(s * 0.28)}Z" ${st}/><path d="M${n2(s * 0.26)} ${n2(s * 0.5)}H${n2(s * 0.66)}" ${st}/>`;
    if (/^tool-/.test(kind)) return tool(kind.slice(5), s, s);
    const FILL = { full: 1, nearfull: 0.84, half: 0.5, nearempty: 0.14, empty: 0 };
    if (kind in FILL) return `<g transform="translate(${n2(s * 0.12)} 0)">${container('glass', FILL[kind], s * 0.76, s)}</g>`;
    if (kind === 'colour') return `<circle cx="${n2(s * 0.3)}" cy="${n2(s * 0.35)}" r="${n2(s * 0.14)}" ${st}/><circle cx="${n2(s * 0.68)}" cy="${n2(s * 0.35)}" r="${n2(s * 0.14)}" ${st}/><circle cx="${n2(s / 2)}" cy="${n2(s * 0.7)}" r="${n2(s * 0.14)}" ${st}/>`;
    return '';
}

/**
 * One picture of the row in a box of `bw` x `bh` mm, standing on the box floor (a shared base
 * line). `ring` draws a pencil ring round it (the marked one of a "why?" item, given not answered).
 */
function picture(ctx, spec, bw0, bh, { ring = false, label = '', floor = null, tight = false } = {}) {
    const sp = spec || {};
    // tight (critic k2-r3, H13: a small picture stood in a slot as wide as the big one, a 30 % band
    // between A and B): the slot is only as wide as its own picture, on the row's shared floor
    const narrow = tight && !sp.tool && (sp.container ? (sp.w || 1) : (sp.s || 1)) < 1;
    const bw = narrow ? Math.max(6, bw0 * (sp.container ? sp.w : sp.s)) : bw0;
    let body;
    if (sp.container) {
        const w = bw0 * (sp.w || 1), h = bh * (sp.h || 1);
        body = `<g transform="translate(${n2((bw - w) / 2)} ${n2(bh - h)})">${container(sp.container, sp.fill, w, h)}</g>`;
    } else if (sp.tool) {
        body = tool(sp.tool, bw, bh);
    } else {
        const d = Math.min(bw0, bh) * (sp.s || 1);
        const cx = bw / 2, cy = bh - d / 2;
        body = sp.sil ? silhouette(sp.shape, cx, cy, d) : shapeOf(sp.shape).draw(cx, cy, d);
    }
    if (ring) body += `<ellipse cx="${n2(bw / 2)}" cy="${n2(bh / 2)}" rx="${n2(bw / 2 + 1.4)}" ry="${n2(bh / 2 + 1.4)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    const pad = ring ? 2.4 : 0.4;
    // the base line hint: a floor the row's pictures all stand on, reaching half the gap each side
    // (overflow is visible) so the segments of one row join into one line
    const fl = floor === null ? '' : `<path d="M${n2(-floor / 2 - 1.2)} ${n2(bh + pad + SW.one / 2)}H${n2(bw + 2 * pad + floor / 2 + 1.2)}" stroke="${INK}" stroke-width="${n2(SW.one)}"/>`;
    return svg(ctx, bw + 2 * pad, bh + 2 * pad, `<g transform="translate(${pad} ${pad})">${body}</g>${fl}`, { label: label || 'a picture' });
}

/** A start flag: a pole and a pennant, then the word "Start" under it. */
function startFlag(ctx, h) {
    const w = 9;
    const body = `<path d="M1.2 ${n2(h)}V1" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linecap="round"/>`
        + `<path d="M1.2 1.2L${n2(w)} 4.2L1.2 7.2Z" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linejoin="round"/>`;
    return svg(ctx, w + 0.5, h + 0.5, body, { label: 'start flag' });
}

/** The picture box size of a row at this ctx: square pictures, containers taller. */
function boxSize(ctx, p) {
    const k = pscale(ctx);
    const base = p.pic || 20;
    const containers = [p.target, ...(p.choices || []), ...(p.row || []), p.pic0].some((s) => s && s.container);
    return { w: base * k, h: (containers ? base * 1.3 : base) * k };
}

/**
 * SIZE S FITS A THIRD OF THE PAGE (critic k2-r1, OC14: "match_same prints 10 at S and at L"). The
 * content width of a three-column cell at S: 61.5 mm inner less the 3 mm cell padding each side.
 * A target-and-choices row (match the same) whose pictures can stay at least 9 mm across in that
 * width draws them so, with 2.4 mm gaps, and the page takes three columns at S; else null.
 */
const S3_W = 55;
function pickFitS(p, ctx) {
    if (sizeOf(ctx) !== 'S' || isTwin(ctx) || p.kind !== 'pick' || !p.target) return null;
    const n = (p.choices || []).length, gap = 2.4;
    const bw = (S3_W - (n - 1) * gap - 2 * gap - 0.3 - 5.9) / (n + 1) - 0.8;
    const base = boxSize(ctx, p).w;
    if (bw >= base) return { bw: base, gap };
    return bw >= 9 ? { bw: Math.floor(bw * 10) / 10, gap } : null;
}

/** The label column of a word bank (mm): the longest word at the bank's type size, plus its icon. */
function wordsLabelW(p, ctx) {
    const lp = textPt(ctx) + 2;
    const longest = Math.max(0, ...(p.words || []).map((wd) => String(wd.label).length));
    return Math.max(26, Math.ceil(longest * lp * 0.54 * 0.3528) + (p.icons ? (p.iconSize || 6.5) + 3 : 0) + 2);
}
/**
 * A word bank beside its picture: at S it takes a third of the page when the picture can stay at
 * least 11 mm across; at M / L it keeps to half the page (82 mm of content) when the picture can
 * stay at least 16 mm across (a level-2 bank with icons otherwise pushed it to one column).
 * null when the picture keeps its own size.
 */
function wordsFitS(p, ctx) {
    if (isTwin(ctx) || p.kind !== 'words' || p.row || p.under) return null;
    const small = sizeOf(ctx) === 'S';
    const gap = small ? 4 : 8;
    const listW = wordsLabelW(p, ctx) + 3 + checkMmOf(ctx) + 0.5;
    const pic = (small ? S3_W : C2_W) - gap - listW - 0.8;
    const base = boxSize(ctx, p).w * 1.3;
    if (pic >= base) return small ? { pic: base, gap, third: true } : null;
    return pic >= (small ? 11 : 16) ? { pic: Math.floor(pic * 10) / 10, gap, third: small } : null;
}
const C2_W = 82;   // the content width of a two-column cell (88 mm inner less the 3 mm padding each side)
const checkMmOf = (ctx) => ({ S: 5, M: 6, L: 7 })[sizeOf(ctx)] || 7;   // tokens checkMm

/* ----------------------------------------------------------------------------- the template */

register('picture-row', {
    render(p, ctx) {
        const k = pscale(ctx);
        const { w: bw, h: bh } = boxSize(ctx, p);
        const lp = textPt(ctx) + 2;

        if (p.kind === 'order') {
            const keys = (p.order || []).map(String);
            const shown = shownParts(ctx, keys);
            const b = inlineBoxMm(ctx, 1);
            const cols = (p.choices || []).map((c, i) => {
                const st = stepSlot(ctx, `b${i}`, shown[i]);
                return `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3)};">`
                    + picture(ctx, c, bw, bh, { floor: p.base ? 7 * k : null }) + box(st.ctx, { id: `b${i}`, value: st.value, w: b.w + 2, h: b.h + 2, mark: 'cell' }) + '</div>';
            }).join('');
            const ink = inkOf(ctx);
            // the boxes carry their own ink; a trace on the row would grey the pictures (INK-3)
            return root(ctx, 'k2-prow', `<div data-ws-slot="answer" data-ws-shape="box"${ink === 'solid' && shown.some(Boolean) ? ' data-ws-ink="solid"' : ''} `
                + `${NOWRAP} style="display:flex;justify-content:center;align-items:flex-end;gap:${L(ctx, 7 * k)};">${cols}</div>`);
        }

        if (p.kind === 'words') {
            const labels = (p.words || []).map((wd) => wd.label);
            const on = checkedChoice(p, ctx, labels);
            const iconD = p.iconSize || 6.5;
            const choices = (p.words || []).map((wd) => ({
                label: wd.label,
                pic: p.icons && wd.icon ? svg(ctx, iconD, iconD, icon(wd.icon, iconD), { label: '' }) : '',
            }));
            const labelW = wordsLabelW(p, ctx);
            const fitS = wordsFitS(p, ctx);
            const pics = p.row
                ? `<div${NOWRAP} style="display:flex;align-items:flex-end;gap:${L(ctx, 5 * k)};">${p.row.map((s, i) => picture(ctx, s, bw * 0.8, bh * 0.8, { ring: i === p.ring })).join('')}</div>`
                : fitS ? picture(ctx, p.pic0, fitS.pic, (fitS.pic * bh) / bw) : picture(ctx, p.pic0, bw * 1.3, bh * 1.3);
            // Appearance "under" (p.under): the choices in a row under the picture instead of a list beside it
            const under = !!p.under && !p.row;
            const dir = p.row || under ? 'column' : 'row';
            const bank = under
                ? choiceRow(ctx, choices, { on, gapMm: 6, labelPt: lp, ring: { index: p.correct || 0, ink: workInk(ctx, 'ring') } })
                : choiceRow(ctx, choices, { on, vertical: true, labelW, labelPt: lp, ring: { index: p.correct || 0, ink: workInk(ctx, 'ring') } });
            return root(ctx, 'k2-prow', `<div style="display:flex;flex-direction:${dir};align-items:center;justify-content:center;gap:${L(ctx, p.row || under ? 4 : fitS ? fitS.gap : 8)};">`
                + `<div style="flex:none;">${pics}${cueLine(ctx, p.cue)}</div>`
                + `<div style="flex:none;text-align:${under ? 'center' : 'left'};">${p.caption ? `<div style="font-size:${P(ctx, lp)};font-weight:700;line-height:1.25;margin-bottom:${L(ctx, 1.5)};">${esc(p.caption)}</div>` : ''}`
                + `${bank}${noteLine(ctx, p.note)}</div></div>`);
        }

        if (p.kind === 'line') {
            const items = p.items || [];
            const gap = (p.gap || 4) * k;
            // model states: the flag ringed ("start at the flag"), the places numbered ("count"), the one ringed
            const flag = ringWrap(ctx, startFlag(ctx, bh * 0.9), workInk(ctx, 'flag'));
            const counted = workInk(ctx, 'count');
            if (p.task === 'write') {
                const b = inlineBoxMm(ctx, 3);
                const slot = box(ctx, { id: 'answer', value: slotValue(ctx, 'answer', p.ans), w: b.w + 4, h: b.h + 2, mark: 'blank' });
                const nums = p.numbers || counted ? numberRow(ctx, items.length, bw, gap, counted === 'trace' && !p.numbers) : '';
                return root(ctx, 'k2-prow', `<div${NOWRAP} style="display:flex;align-items:flex-end;justify-content:center;gap:${L(ctx, gap)};">`
                    + `<div style="flex:none;">${flag}</div>${items.map((s, i) => (i === p.target ? ringWrap(ctx, picture(ctx, s, bw, bh), workInk(ctx, 'ring')) : picture(ctx, s, bw, bh))).join('')}</div>${nums}`
                    + `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 3)};margin-top:${L(ctx, 4)};font-size:${P(ctx, lp)};">`
                    + `${picture(ctx, items[p.target], bw * 0.55, bh * 0.55)}<span>is</span>${slot}</div>`);
            }
            const labels = labelsOf(p, items.length);
            const on = checkedChoice(p, ctx, labels);
            const choices = items.map((s, i) => ({ pic: picture(ctx, s, bw, bh), label: labels[i] }));
            // the place asked for, printed once over the line ("3rd"): the item's own question
            const ask = p.ask ? `<div style="font-size:${P(ctx, digitPt(ctx) * 0.9)};font-weight:700;line-height:1;margin-bottom:${L(ctx, 3)};">${esc(p.ask)}</div>` : '';
            // the places numbered: a model's count step, or the level-2 hint (p.numbers)
            const nums = counted ? numberRow(ctx, items.length, bw, gap, counted === 'trace') : p.numbers ? numberRow(ctx, items.length, bw, gap, false) : '';
            return root(ctx, 'k2-prow', `${ask}${nums}<div${NOWRAP} style="display:flex;align-items:flex-start;justify-content:center;gap:${L(ctx, gap)};">`
                + `<div style="flex:none;padding-top:${L(ctx, 0.4)};">${flag}</div>${choiceRow(ctx, choices, { on, gapMm: gap, hideLabels: !!p.hideLabels, ring: { index: p.correct || 0, ink: workInk(ctx, 'ring') } })}</div>`);
        }

        // pick
        const labels = labelsOf(p, (p.choices || []).length);
        const on = checkedChoice(p, ctx, labels);
        const fitS = pickFitS(p, ctx);
        if (fitS) return pickRow(p, ctx, fitS.bw, (bh * fitS.bw) / bw, fitS.gap, labels, on, lp);
        return pickRow(p, ctx, bw, bh, (p.gap || 7) * k, labels, on, lp);
    },
    answerKey(p) {
        if (p.kind === 'order') {
            const v = (p.order || []).map(String).join(', ');
            const slots = {};
            (p.order || []).forEach((r, i) => { slots[`b${i}`] = { value: String(r), graded: true }; });
            return { value: v, display: v, slots };
        }
        if (p.kind === 'line' && p.task === 'write') return { value: p.ans, display: String(p.ans), slots: { answer: { value: String(p.ans), graded: true } } };
        const labels = p.kind === 'words' ? (p.words || []).map((w) => w.label) : labelsOf(p, (p.choices || p.items || []).length);
        const v = labels[p.correct || 0];
        return { value: v, display: v, slots: { answer: { value: v, graded: true } } };
    },
    footprint(p, ctx) {
        // the row's own width at this size: one cell of a 2-column page when it fits in 93 mm
        const k = ctx ? pscale(ctx) : 1;
        const bw = (p.pic || 20) * k;
        const n = (p.choices || p.items || p.row || []).length || 1;
        const gap = (p.gap || 7) * k;
        let w = n * (bw + 1) + (n - 1) * gap + (p.target ? bw + 6 + 2 * gap : 0) + (p.kind === 'line' ? 14 : 0);
        const wf = wordsFitS(p, ctx || {});
        if (pickFitS(p, ctx || {}) || (wf && wf.third)) return { wMm: S3_W + 6, hMm: null, measure: true, factLike: false, maxCols: 3 };
        if (wf) return { wMm: C2_W + 6, hMm: null, measure: true, factLike: false, maxCols: 2 };
        if (p.kind === 'words' && !p.row) {
            // beside: the picture and a list; under: the wider of the picture and the row of words
            const words = p.words || [];
            const rowW = words.reduce((a, wd) => a + Math.max(14, String(wd.label).length * 2.6 + (p.icons ? (p.iconSize || 6.5) + 2 : 0)), 0) + 6 * Math.max(0, words.length - 1);
            w = p.under ? Math.max(bw * 1.3, rowW) : bw * 1.3 + 60;
        }
        return { wMm: Math.min(186, Math.ceil(w + 6)), hMm: null, measure: true, factLike: false, maxCols: w + 6 <= 61 ? 3 : w + 6 <= 93 ? 2 : 1 };   // a row a third of the page wide takes three columns (measured)
    },
    inputs(p) {
        if (p && p.kind === 'order') return (p.order || []).map((_, i) => ({ id: `b${i}`, kind: 'number', shape: 'box', graded: true, order: i, scopes: ['full'] }));
        if (p && p.kind === 'line' && p.task === 'write') return [{ id: 'answer', kind: 'text', shape: 'box', graded: true, order: 0, scopes: ['full'] }];
        return [{ id: 'answer', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full'] }];
    },
    layout() { return { card: 'card-wide-visual', checker: 'choice' }; },
    /** PT-MOD-1: the scripted model's states, from the provider's `work` and slot marks (k2kit). */
    modelStates: true,
    stepState(p, steps, k, ctx) { return this.render(p, k2StepCtx(steps, k, ctx)); },
});

/** The pick row: the choices (A, B, C) and, with a target, its key box left of them. */
function pickRow(p, ctx, bw, bh, gap, labels, on, lp) {
    const choices = (p.choices || []).map((c, i) => ({ pic: picture(ctx, c, bw, bh, { floor: p.base ? gap : null, tight: !p.target }), label: labels[i] }));
    const row = choiceRow(ctx, choices, { on, gapMm: gap, ring: { index: p.correct || 0, ink: workInk(ctx, 'ring') } });
    if (!p.target) return root(ctx, 'k2-prow', `<div style="display:inline-block;">${row}</div>${cueLine(ctx, p.cue)}${noteLine(ctx, p.note)}`);
    // the target in a key box, left of the row, on the same floor as the pictures
    const tb = `<div style="flex:none;display:inline-flex;flex-direction:column;align-items:center;gap:${L(ctx, 1.5)};">`
        + `<div style="border:${B(ctx, 1.5)} solid ${INK};border-radius:${L(ctx, 2)};padding:${L(ctx, 2)};background:#fff;">${picture(ctx, p.target, bw, bh)}</div>`
        // Support level 2 (p.name): the target's name under its box - what to look for, never where
        + `${p.name ? `<div style="font-size:${P(ctx, lp)};font-weight:700;line-height:1;">${esc(p.name)}</div>` : ''}</div>`;
    return root(ctx, 'k2-prow', `<div${NOWRAP} style="display:flex;align-items:flex-start;justify-content:center;gap:${L(ctx, gap)};">`
        + `${tb}<div style="width:${B(ctx, 0.75)};align-self:stretch;background:${INK};"></div>${row}</div>`);
}

/** A row that stays one line on screen too (screen-cell fitTwinRows shrinks it instead of wrapping it). */
const NOWRAP = ' data-mq-nowrap="1"';

/** Support level 2: which attribute to look at, under the row (a hint that fades; never the answer). */
function cueLine(ctx, cue) {
    if (!cue) return '';
    return `<div class="k2-cue" style="margin-top:${L(ctx, 2)};font-size:${P(ctx, textPt(ctx))};line-height:1.2;">Look at the ${esc(cue)}.</div>`;
}

/** A support line in the item's own words (a hint that fades: Support level 2), or ''. */
function noteLine(ctx, note) {
    if (!note) return '';
    return `<div class="k2-cue" style="margin-top:${L(ctx, 2)};font-size:${P(ctx, textPt(ctx))};font-weight:700;line-height:1.2;">${esc(note)}</div>`;
}

/** The tags of a row's choices: the payload's own (place numbers 1, 2, 3 on a supported ordinal line), else A, B, C. */
const labelsOf = (p, n) => (Array.isArray(p.labels) && p.labels.length === n ? p.labels.map(String) : LETTERS.slice(0, n));

/** The place numeral under a picture of an ordinal line (the support that fades). */
function numeral(ctx, n, bw, grey = false) {
    return svg(ctx, bw, 5, `<text x="${n2(bw / 2)}" y="4.2" text-anchor="middle" font-size="4.2" font-weight="700" font-family="Andika, sans-serif" fill="${grey ? GREY : INK}"${grey ? ' data-ws-ink="trace"' : ''}>${n}</text>`, { label: '' });
}
/** The place numbers 1, 2, 3 ... under (or, in a model's "count" state, over) the line; grey as the newest mark. */
function numberRow(ctx, n, bw, gap, grey = false) {
    return `<div${NOWRAP} style="display:flex;justify-content:center;gap:${L(ctx, gap)};margin-top:${L(ctx, 1)};"><div style="flex:none;width:${L(ctx, 9.5)};"></div>`
        + Array.from({ length: n }, (_, i) => numeral(ctx, i + 1, bw + 0.8, grey)).join('') + '</div>';
}

export const PICTURE_ROW_TEMPLATE = 'picture-row';
