// js/modules/sheet/cells/timeline.js
// The `timeline` template: elapsed time on a number line (design/research/time-money.md §8,
// §13.5; ruling Q5 "hop the hours, then the minutes"). One template for every elapsed step:
//
//   mode later     TE-1, TE-3, TE-6, TE-8, TE-9   Start given + a duration -> the end time
//   mode earlier   TE-2                            End given + a duration -> the start time
//   mode duration  TE-7, TE-10                     Start and end given -> how long
//                                                  (`__ h __ min`, or `__ minutes` at grade 4)
//   mode start     TE-11 elapsed_find_start        End and duration given -> the start time
//
// THE LINE IS STRUCTURAL: a 1.5 pt axis, labelled hour ticks, minor ticks at the section's step
// (never closer than 5 mm, so a pencil dot lands on one), the given time marked with a dot. Its
// length is fixed by the section's SPAN, never by the answer, so the line never shows where the
// unknown end is. HINTS fade by page role: Model (3) and Guided (2) pre-draw the hop arcs with
// empty label boxes (H1); `support: pupil` leaves the hour labels for the pupil to write (TE-5);
// `support: none` draws no line at all (the fade).
//
// Key (AK-1): the hops drawn at 1.5 pt with their labels ("2 h", "30 min"), the unknown time
// marked, and the answer written. Error analysis writes the wrong answer (ctx.wrong).
//
// `faces` (elapsed_visual_*, TE-7): the start and the end are GIVEN as two clock faces (or two
// readouts) above the line, which the pupil reads before hopping.
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import {
    L, P, INK, GREY, SW, PT_MM, n2, esc, isTwin, sizeOf, S, textPt, digitPt, zonePt, svg, levelOf, box,
    faceSVG, faceDiameter, readout, timeSlot, durationSlot, numberSlot, words, row, splitTime,
    fmtTime, fmtDuration, toMin, fromMin, ampmOf,
} from './tmkit.js';

const AXIS_MM = 158;

/** "2 h 30 min" as the pupil reads it in the cell: "2 hours 30 minutes". */
function durWords(total) {
    const h = Math.floor(total / 60), m = total % 60;
    const hs = h ? `${h} ${h === 1 ? 'hour' : 'hours'}` : '';
    const ms = m ? `${m} ${m === 1 ? 'minute' : 'minutes'}` : '';
    return [hs, ms].filter(Boolean).join(' ') || '0 minutes';
}

const hourLabel = (hh, ampm = false) => (ampm && hh % 24 === 12 ? '12 noon' : `${hh % 12 || 12}:00`);

/** The unknown of the item, as a time (minutes since midnight), or null for a duration. */
function unknownAt(p) {
    if (p.mode === 'later') return toMin(p.end);
    if (p.mode === 'earlier' || p.mode === 'start') return toMin(p.start);
    return null;
}

/** The hops of the worked answer: whole hours first, then the minutes (ruling Q5). */
export function hopsOf(p) {
    const s = toMin(p.start), total = Number(p.total);
    const back = p.mode === 'earlier' || p.mode === 'start';
    const from = back ? toMin(p.end) : s;
    const h = Math.floor(total / 60), m = total % 60;
    const out = [];
    let at = from;
    if (h) { const to = at + (back ? -60 * h : 60 * h); out.push({ from: at, to, label: `${h} h` }); at = to; }
    if (m) { const to = at + (back ? -m : m); out.push({ from: at, to, label: `${m} min` }); at = to; }
    return out;
}

function line(p, ctx) {
    const lv = levelOf(ctx);
    const from = Number(p.axis.from);                 // minutes since midnight, a whole hour (may pass 24:00)
    const hours = Math.max(1, Number(p.axis.hours));
    const perHour = AXIS_MM / hours;
    let step = Number(p.step) || 30;
    while (perHour * step / 60 < 5 && step < 60) step = step < 5 ? 5 : step < 15 ? 15 : step < 30 ? 30 : 60;
    const x0 = 7, y = 19, W = AXIS_MM + 14;
    const X = (t) => x0 + (t - from) * perHour / 60;
    // Hour labels a pupil reads: 11 pt at least (RUBRIC C1; critic round 3 measured 9 pt).
    const zone = Math.max(11, zonePt(ctx)) * PT_MM;
    let s = `<line x1="${n2(x0 - 3)}" y1="${y}" x2="${n2(x0 + AXIS_MM + 3)}" y2="${y}" stroke="${INK}" stroke-width="${n2(SW.heavy)}" data-tm-axis="1"/>`;
    for (let k = 0; k <= hours * 60; k += step) {
        const hourTick = k % 60 === 0;
        const x = X(from + k);
        s += `<line x1="${n2(x)}" y1="${n2(y - (hourTick ? 3 : 1.5))}" x2="${n2(x)}" y2="${n2(y + (hourTick ? 3 : 1.5))}" stroke="${INK}" stroke-width="${n2(hourTick ? SW.hair : SW.fine)}"/>`;
        if (hourTick && p.support !== 'pupil') {
            s += `<text x="${n2(x)}" y="${n2(y + 4 + zone)}" text-anchor="middle" font-size="${n2(zone)}" font-weight="700" font-family="Andika, 'Open Sans', sans-serif" fill="${INK}" data-tm-hourlabel="1">${hourLabel(Math.floor((from + k) / 60), p.ampm)}</text>`;
        }
    }
    // The given time(s): a solid dot on the line (a given, never the unknown). When the times are
    // GIVEN AS CLOCKS (elapsed_visual_*) the line stays bare: plotting them would let the pupil
    // skip reading the clocks (critic round 3).
    const given = p.faces ? [] : p.mode === 'later' ? [toMin(p.start)] : p.mode === 'duration' ? [toMin(p.start), toMin(p.end)] : [toMin(p.end)];
    for (const t of given) {
        const tt = t < from ? t + 1440 : t;
        s += `<circle cx="${n2(X(tt))}" cy="${y}" r="1.3" fill="${INK}" data-tm-given="1"/>`;
    }
    // Hops: pre-drawn arcs with empty label boxes in Model / Guided; drawn and labelled on the key.
    const keyed = ctx.state === 'answered' || ctx.state === 'traced';
    const showArcs = lv >= 2 || keyed;
    const col = ctx.state === 'traced' ? GREY : INK;
    const labels = [];
    if (showArcs) {
        for (const hop of hopsOf(p)) {
            const a = hop.from < from ? hop.from + 1440 : hop.from;
            const b = hop.to < from ? hop.to + 1440 : hop.to;
            const xa = X(a), xb = X(b), mid = (xa + xb) / 2, hgt = Math.min(7.5, 3 + Math.abs(xb - xa) * 0.1);
            s += `<path d="M${n2(xa)} ${n2(y - 1)}Q${n2(mid)} ${n2(y - 1 - 2 * hgt)} ${n2(xb)} ${n2(y - 1)}" fill="none" stroke="${keyed ? col : INK}" stroke-width="${n2(keyed ? SW.heavy : SW.hair)}" data-tm-hop="1"/>`;
            labels.push({ x: mid, y: y - 1 - hgt - 1, text: keyed ? hop.label : '', boxed: lv >= 2 });
        }
        if (keyed) {
            const u = unknownAt(p);
            if (u !== null) { const uu = u < from ? u + 1440 : u; s += `<circle cx="${n2(X(uu))}" cy="${y}" r="1.3" fill="${col}"/>`; }
        }
    }
    // Hop labels: small boxes above each arc (scratch, not graded, not a screen input).
    const bw = 16, bh = S(ctx).writeMm;
    // A page that printed no hop boxes (Independent, Test) gets its key's hop labels as pencil
    // writing, not as boxes the pupil page never had (AK-1 facsimile; critic round 3).
    const boxes = labels.map((l) => `<span style="position:absolute;left:${L(ctx, l.x - bw / 2)};top:${L(ctx, Math.max(0, l.y - bh))};line-height:0;">`
        + `<span data-ws-slot="hop" data-ws-shape="box" data-ws-graded="0" style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;`
        + `width:${L(ctx, bw)};height:${L(ctx, bh)};${l.boxed ? `border:${L(ctx, 0.26)} solid ${INK};background:#fff;` : ''}border-radius:${L(ctx, 1.25)};`
        + `font-size:${P(ctx, Math.max(11, zonePt(ctx) + 1))};font-weight:700;color:${col};white-space:nowrap;">${esc(l.text)}</span></span>`).join('');
    // Pupil-labelled hours (TE-5): empty write-in boxes under the hour ticks.
    const hourBoxes = p.support === 'pupil' ? Array.from({ length: hours + 1 }, (_, k) => {
        const x = X(from + 60 * k);
        const bw2 = 14, bh2 = S(ctx).writeMm;
        const t = keyed ? hourLabel(Math.floor((from + 60 * k) / 60)) : '';
        return `<span style="position:absolute;left:${L(ctx, x - bw2 / 2)};top:${L(ctx, y + 4)};line-height:0;">`
            + `<span data-ws-slot="hourlabel" data-ws-shape="box" data-ws-graded="0" style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;`
            + `width:${L(ctx, bw2)};height:${L(ctx, bh2)};border:${L(ctx, 0.26)} solid ${INK};border-radius:${L(ctx, 1.25)};background:#fff;font-size:${P(ctx, zonePt(ctx))};font-weight:700;color:${col};">${esc(t)}</span></span>`;
    }).join('') : '';
    const H = y + 6 + (p.support === 'pupil' ? S(ctx).writeMm + 2 : zone + 2);
    return `<div class="tm-line" data-ws-zone="timeline" style="position:relative;width:${L(ctx, W)};max-width:100%;line-height:0;">`
        + svg(ctx, W, H, s, { label: 'time line', attrs: ` data-tm-from="${from}" data-tm-hours="${hours}"` }) + boxes + hourBoxes + `</div>`;
}

function givenTime(ctx, t, ampm) {
    const ap = ampm ? ` ${ampmOf(t)}` : '';
    return readout(ctx, fmtTime(t.h, t.m) + ap, { small: true });
}

function faces(p, ctx) {
    const D = faceDiameter(ctx, { small: true });
    const pic = (t, name) => {
        const analog = p.faces === 'analog' || (p.faces === 'mixed' && name === 'Start');
        // O6 (AP4): `numerals` quarters / twelve leaves the other hour numbers off both faces.
        const missing = p.numerals === 'quarters' ? [1, 2, 4, 5, 7, 8, 10, 11] : p.numerals === 'twelve' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [];
        const face = analog ? faceSVG(ctx, { D, hands: true, hour: t.h, minute: t.m, label: `${name} clock`, ...(missing.length ? { missing } : {}) }) : readout(ctx, fmtTime(t.h, t.m));
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 1)};">${words(ctx, `<b>${name}</b>`)}${face}`
            + `${p.ampm ? words(ctx, ampmOf(t), { pt: zonePt(ctx), bold: true }) : ''}</div>`;
    };
    return `<div style="display:flex;justify-content:center;align-items:flex-end;gap:${L(ctx, 24)};">${pic(p.start, 'Start')}${pic(p.end, 'End')}</div>`;
}

function answerPart(p, ctx) {
    const lbl = (t) => words(ctx, `<b>${t}</b>`, { pt: textPt(ctx) + 1 });
    if (p.mode === 'duration') {
        if (p.answer === 'minutes') return row(ctx, lbl('How long?') + numberSlot(ctx, 'answer', p.total, { digits: 3, unit: 'minutes', mark: 'blank' }), { gap: 3 });
        return row(ctx, lbl('How long?') + durationSlot(ctx, fmtDuration(Math.floor(p.total / 60), p.total % 60)), { gap: 3 });
    }
    const t = unknownAt(p);
    const tt = fromMin(t);
    const name = p.mode === 'later' ? 'End' : 'Start';
    if (p.response === 'draw') {
        const lv = levelOf(ctx);
        let hands = null;
        if (ctx.state === 'wrong') {
            const w = ctx.wrong || {};
            const v = w.value && typeof w.value === 'object' ? w.value : splitTime(w.value);
            if (v) hands = { h: Number(v.hour), m: Number(v.minute), c: INK };
        } else if (ctx.state !== 'blank') hands = { h: tt.h, m: tt.m, c: ctx.state === 'traced' ? GREY : INK };
        const face = faceSVG(ctx, { D: faceDiameter(ctx, { draw: true }), hands: !!hands, hour: hands ? hands.h : 0, minute: hands ? hands.m : 0,
            handColor: hands ? hands.c : INK, guides: lv >= 2, guideLabels: lv >= 3, label: 'clock face with no hands' });
        const model = isTwin(ctx) ? ` data-mq-model="clock-set" data-mq-snap="5"` : '';
        return row(ctx, lbl(name) + `<div data-ws-slot="hands" data-ws-shape="draw"${model} style="line-height:0;">${face}</div>`, { gap: 3 });
    }
    const ap = p.ampm ? words(ctx, ampmOf(tt), { bold: true }) : '';
    return row(ctx, lbl(name) + timeSlot(ctx, fmtTime(tt.h, tt.m)) + ap, { gap: 3 });
}

function statement(p, ctx) {
    const lbl = (t) => words(ctx, `<b>${t}</b>`, { pt: textPt(ctx) + 1 });
    const dur = words(ctx, esc(durWords(p.total)), { pt: textPt(ctx) + 1 });
    if (p.faces) return '';
    switch (p.mode) {
        case 'later': return row(ctx, `${lbl('Start')}${givenTime(ctx, p.start, p.ampm)}${dur}${words(ctx, '<b>later</b>')}`, { gap: 3 });
        case 'earlier': return row(ctx, `${lbl('End')}${givenTime(ctx, p.end, p.ampm)}${dur}${words(ctx, '<b>earlier</b>')}`, { gap: 3 });
        case 'start': return row(ctx, `${lbl('End')}${givenTime(ctx, p.end, p.ampm)}${words(ctx, '<b>It took</b>')}${dur}`, { gap: 3 });
        default: return row(ctx, `${lbl('Start')}${givenTime(ctx, p.start, p.ampm)}${lbl('End')}${givenTime(ctx, p.end, p.ampm)}`, { gap: 4 });
    }
}

function keyOf(p) {
    if (p.mode === 'duration') {
        if (p.answer === 'minutes') return { value: Number(p.total), display: `${p.total} minutes`, slots: { answer: { value: String(p.total), graded: true } } };
        const h = Math.floor(p.total / 60), m = p.total % 60;
        return { value: fmtDuration(h, m), display: fmtDuration(h, m), slots: { hours: { value: String(h), graded: true }, minutes: { value: String(m), graded: true } } };
    }
    const t = fromMin(unknownAt(p));
    const disp = fmtTime(t.h, t.m);
    if (p.response === 'draw') return { value: { hour: t.h % 12, minute: t.m }, display: disp, slots: { hands: { value: disp, graded: true } } };
    const [hh, mm] = disp.split(':');
    return { value: disp, display: disp, slots: { hour: { value: hh, graded: true }, minute: { value: mm, graded: true, accept: [String(Number(mm))] } } };
}

register('timeline', {
    render(p, ctx) {
        const parts = [];
        if (p.faces) parts.push(faces(p, ctx));
        const st = statement(p, ctx);
        if (st) parts.push(st);
        if (p.support !== 'none') parts.push(line(p, ctx));
        parts.push(answerPart(p, ctx));
        return `<div class="tm-cell tm-timeline"${isTwin(ctx) ? ' data-mq-tm="1"' : ''} style="color:${INK};font-family:'Andika','Open Sans',sans-serif;`
            + `display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3)};">${parts.join('')}</div>`;
    },
    answerKey: keyOf,
    footprint() { return { wMm: 186, hMm: null, measure: true, factLike: false, maxCols: 1 }; },
    inputs(p) {
        if (p.mode === 'duration') {
            if (p.answer === 'minutes') return [{ id: 'answer', kind: 'number', shape: 'unit', graded: true, order: 0, scopes: ['full', 'answer-only'] }];
            return [{ id: 'hours', kind: 'number', shape: 'box', graded: true, order: 0, scopes: ['full', 'answer-only'] },
                { id: 'minutes', kind: 'number', shape: 'box', graded: true, order: 1, scopes: ['full', 'answer-only'] }];
        }
        if (p.response === 'draw') return [{ id: 'hands', kind: 'time', shape: 'draw', graded: true, order: 0, scopes: ['full', 'answer-only'] }];
        return [{ id: 'hour', kind: 'time', shape: 'box', graded: true, order: 0, scopes: ['full', 'answer-only'] },
            { id: 'minute', kind: 'time', shape: 'box', graded: true, order: 1, scopes: ['full', 'answer-only'] }];
    },
    layout() { return { card: 'card-wide-visual', checker: 'value' }; },
});

export { durWords };
