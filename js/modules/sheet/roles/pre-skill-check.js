// js/modules/sheet/roles/pre-skill-check.js
// PRE-SKILL CHECK (design/PAGE_TYPES.md 2.10): a short check of the prerequisite sub-skills
// before a ladder starts. Two forms. No supports (level 0).
//
//   Quadrants   four boxed quadrants, one prerequisite skill each, each with its own strip (the
//               skill's instruction) and its own small score "__/4" (PT-PRE-1, P-25)
//   Grid        2 x 2 in a quadrant (cells about 46 mm wide) when the skill's cell fits that
//               width; otherwise the page stacks four full-width bands of up to 4 cells, and a
//               band that does not fit moves whole to the next page (PT-ENG-8)
//   Skills      the ladder's pre-skill list is not modelled yet (P-AT-1), so the prerequisites are
//               the skills just before this one in its category; a teacher-given set of 2 to 4
//               skills is used as it is (PT-PRE-3). A skill with no earlier skill checks itself.
//   Title       "Pre-skill check: <topic>" (HD-13); tab "Check A" / "Check B"; Score = all items
//   Routes      optional `input.routes` [{lesson, title, checks}] per question (design/LESSON_LIBRARY_PLAN.md §8b,
//               lead decision D1, lessons-phase0): a small teacher tag under that question's band, "If missed ->
//               Lesson <id> <title>" (class mq-lpretag, data-ws-teacher, inside its band, its height taken from the
//               band so no cell shrinks below its floor), and the key ends with the ROUTING TABLE page
//               (`routePlan`: question numbers, what each asks - `checks` -, the answers, what to teach first, room
//               for the names of the pupils who missed it, and the rule for one / two or more misses). Its styles
//               are classes (LESSON_ROUTE_CSS, lesson-css.js) that travel only in a routed page, so a page without
//               routes is drawn exactly as before (critic r1 D15).
//               The routed page is ONE grid (critic r1 D4 / D9): its question bands follow each other with the
//               band gap only, single-item questions that fit half the width pair two-up, and the spare height
//               grows the rows (each up to the H13 cap); a question deals `perQuestion` items (the lesson's
//               `items`, 2 by default - LESSON_RULES LR-17) and drops to 1 when the page would not hold it.
//               The DETAILED lesson's T6 is a different teacher table (its own columns: the T2 atom per question)
//               and does not use `routingTableHtml` (critic r1 D14: the earlier "same table" claim was wrong).
//
// Pure module (SCC-01).

import { LESSON_ROUTE_CSS } from '../lesson-css.js';
import { getProvider } from '../contract.js';
import { estimateTitleLines } from './practice.js';
import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, fitsAt, planItem, gridPart, instructionKeyOf,
    instructionText, assemble, poolItems, topicOf, labelStyleOf, rng, shuffle, deriveSeed,
} from './compose.js';
import { slotScore } from '../paginate.js';
import { roleCapacity } from '../role-capacity.js';

export const ROLE_ID = 'pre-skill-check';
const PER_QUAD = 4;

export function sources(skills, { earlier }) {
    let list;
    if (skills.length >= 2) list = skills.slice(0, 4);
    else {
        // (a provider may name the skills to check - `preSkills`, nearest first; lf-vocab r9 - else the earlier skills)
        const sk = skills[0] || {};
        let own = null;
        try { const pv = getProvider(sk.categoryId || '', sk.skillId || ''); own = typeof pv.preSkills === 'function' ? pv.preSkills(sk) : null; } catch (e) { own = null; }
        const prev = Array.isArray(own) && own.length ? own.slice(0, 4) : earlier(skills[0], 4);
        list = prev.length ? prev.slice().reverse() : [skills[0]];
    }
    // One quadrant per prerequisite, up to four. A skill with fewer earlier skills checks fewer
    // quadrants (a first skill checks itself once) rather than repeating one skill four times.
    return list.slice(0, 4).map((sk, i) => ({ id: `q${i}`, skills: [sk] }));
}
export const measureCols = () => [1, 2, 4];
/** A check draws its items at level 0 (PAGE_TYPES 2.10: no supports), so it measures them at level 0 too (critic r1 D8). */
export const MEASURE_LEVEL = () => 0;
// The detailed lesson's check grows its rows to fill the body (critic r3 R7: no bordered empty strip
// under the last row). Its items are centred in their cells (mq-lvcenter), so a cell keeps no empty
// band of 30 % (H13) up to about 2.5 x its content; 2 x the measured minimum stays well inside that.
const GROW_MAX = 2;
// `input.perQuestion` (the detailed lesson's Prerequisite Check, V22 §9.1: 3-4 questions, up to 8
// items): items per prerequisite when a caller asks; PER_QUAD otherwise.
// (An array gives each question its own count, in order.)
const perQuad = (input, i = 0) => {
    const v = input && Array.isArray(input.perQuestion) ? input.perQuestion[i] : input && input.perQuestion;
    return Number(v) >= 1 && Number(v) <= PER_QUAD ? Number(v) : PER_QUAD;
};
/* ------------------------------------------------------------------ routing (§8b, D1) */

/** THE title of a lesson's Prerequisite Check (critic r1 D13: one spelling, used by every page and table). */
export const PREREQ_CHECK_TITLE = 'Prerequisite Check';
/** The routing page's title (a teacher page: never an "I Can" title, critic r1 D12). */
export const ROUTE_PAGE_TITLE = `${PREREQ_CHECK_TITLE}: where next`;

// The routed plan's numbers (critic r1 D16), named:
const PT_MM = 25.4 / 72;
/** The teacher tag's type: 9 pt at 1.3 leading, 2 mm of padding. */
export const ROUTE_TAG_PT = 9;
export const ROUTE_TAG_LEADING = 1.3;
export const ROUTE_TAG_PAD_MM = 2;
/** One 9 pt Andika character is about 1.6 mm wide; a tag keeps 8 mm of its band for its padding. */
export const ROUTE_CHAR_MM = 1.6;
export const ROUTE_TAG_INSET_MM = 8;
/** An instruction character is about half an em wide (a strip that wraps takes a second line). */
export const INSTR_CHAR_EM = 0.5;
/** The live width (mm) of a full band and of a half (a pair two-up). */
export const FULL_W_MM = 186;
export const HALF_W_MM = 93;
/** A routed row grows at most this much past its measured height: the measured cell is already up to ~15 % taller
 *  than what it draws, and an item starts at the top of its box (CL-4b), so more growth is an empty band (H13). */
export const ROUTE_GROW = 1.05;
/** Two single-item questions pair two-up when the shorter is at least this share of the taller. */
export const PAIR_ALIKE = 0.6;
/** The default items a routed question deals, and its FLOOR (LESSON_RULES LR-17a (2): two, so one slip is not a route). */
export const ROUTE_ITEMS = 2;
/** When a question counts as missed (LR-17a (2), P-25; critic r2 N3): printed under the routing table. */
export const ROUTE_MISSED_RULE = 'A question is missed when any one of its items is wrong (its score is under full marks).';

/** The teacher tag's height (mm) at one line. */
export const ROUTE_TAG_MM = ROUTE_TAG_PT * PT_MM * ROUTE_TAG_LEADING + ROUTE_TAG_PAD_MM;
/** A question's route, or null: {lesson, title, checks?}. */
const routeOf = (input, i) => {
    const r = input && Array.isArray(input.routes) ? input.routes[i] : null;
    return r && (r.lesson || r.title) ? r : null;
};
const escT = (t) => String(t === undefined || t === null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** The words of a route's tag. */
export const routeText = (r) => `If missed → Lesson ${r.lesson || ''}${r.title ? ` ${r.title}` : ''}`.replace(/\s+/g, ' ').trim();
/** A tag's height (mm) at `lines` lines. */
export const routeTagMm = (lines = 1) => ROUTE_TAG_PT * PT_MM * ROUTE_TAG_LEADING * Math.max(1, lines) + ROUTE_TAG_PAD_MM;
/** The lines a route's tag wraps to in a band `wMm` wide (never clipped, TY-12). */
export const routeTagLines = (r, wMm) => (r ? Math.max(1, Math.ceil((routeText(r).length * ROUTE_CHAR_MM) / Math.max(20, wMm - ROUTE_TAG_INSET_MM))) : 1);
/** The teacher tag under a question: classes only (LESSON_ROUTE_CSS); its height is the band's geometry. */
export const routeTagHtml = (r, lines = 1) => `<p class="mq-lpretag" data-ws-teacher style="height:${routeTagMm(lines).toFixed(2)}mm">${r ? escT(routeText(r)) : ''}</p>`;
/** The routed page's stylesheet, carried by that page alone (no other page changes, critic r1 D15). */
export const routeCssHtml = () => `<style data-mq-route-css>${LESSON_ROUTE_CSS}</style>`;

/**
 * THE ROUTING TABLE - the one builder of the "where next" table (the lesson packet's Prerequisite Check key; critic r1
 * D14). `rows`: [{letters, checks, answers?, lesson, title}]. `rowMm`: each row's height (the names column is the
 * teacher's writing room).
 */
export function routingTableHtml(rows, { rowMm = 0 } = {}) {
    const h = rowMm > 0 ? ` style="height:${rowMm.toFixed(2)}mm"` : '';
    const body = rows.map((r) => `<tr${h}><td class="mq-lroute-q">${escT(r.letters)}</td><td>${escT(r.checks || '')}</td>`
        + `<td class="mq-lroute-a">${escT(r.answers || '')}</td>`
        + `<td><b>Lesson ${escT(r.lesson || '')}</b>${r.title ? ` ${escT(r.title)}` : ''}</td><td class="mq-lroute-names"></td></tr>`).join('');
    return `<div class="mq-lroute">${routeCssHtml()}`
        + `<table><thead><tr><th>Question</th><th>What it asks</th><th>Answers</th><th>If missed, teach first</th><th>Pupils who missed it</th></tr></thead><tbody>${body}</tbody></table>`
        + `<p class="mq-lroute-rule"><b>${ROUTE_MISSED_RULE}</b></p>`
        + '<ul><li><b>All correct:</b> start this lesson with its anchor chart.</li>'
        + '<li><b>One question missed:</b> teach that lesson first, then come back to this lesson.</li>'
        + '<li><b>Two or more missed:</b> start with the earliest one missed (the lowest number), then the next, then come back to this lesson.</li></ul></div>';
}

/** The routing table's fixed margins (mm): the table's top and bottom rules and padding and the list's margins. */
export const ROUTE_TABLE_FIXED_MM = 24;
/** The text under the routing table, in em: the table head, the miss rule and the three rule lines with their leading. */
export const ROUTE_TEXT_EM = 16;

/** The key's routing page (a teacher page: no Name, Date or Score, never an "I Can" title), or null without routes. */
export function routePlan(input, rows) {
    if (!rows.length) return null;
    const lesson = input.lesson || {};
    const ctx = ctxOf(input);
    const target = input.checkFor ? [input.checkFor] : input.targetSkill ? [input.targetSkill] : (input.skills || []).slice(0, 1);
    const f = frameOf({ skills: target, input, tabId: 'Check key', score: 0, footerLeft: lesson.tagLine, title: ROUTE_PAGE_TITLE });
    const header = Object.assign({}, f.header, { name: false, date: false, score: false, title: ROUTE_PAGE_TITLE });
    // (the rows share the body: the table head, the rule list and the band's strip take the rest - critic r1 D12, a
    // half-blank teacher page)
    const m = bandMetrics(ctx, layoutHeader(header));
    const em = ((ctx.s && ctx.s.textPt) || 14) * PT_MM;
    // (the rest of the body: the table head (2 lines), the miss rule (2 lines, critic r2 N3) and the three rule lines -
    // about 10 lines with their leading, 13 em - plus 3 em for rows whose words wrap past their share, 16 em in all, and
    // the table and list margins, ROUTE_TABLE_FIXED_MM - critic r1 D16; P1c: at 10 em the sub L routing page ran 14 mm
    // into its footer once the miss rule printed)
    const rowMm = Math.max(12, (m.budget - m.strip - ROUTE_TEXT_EM * em - ROUTE_TABLE_FIXED_MM - em) / rows.length);
    const section = { kind: 'band', label: '', instr: '', html: routingTableHtml(rows, { rowMm }) };
    return assemble(ROLE_ID, input, Object.assign({}, f, { header }), [{ header, sections: [section] }], { scaffoldLevel: 1, meta: { items: 0, part: 'prereq-route' } });
}

// (a lesson's routed check is dealt a whole row's worth - up to PER_QUAD - and `plan` keeps what one page holds)
const routedCheck = (input) => !!(input && input.perQuestion && Array.isArray(input.routes) && input.routes.some(Boolean));
// (lf-roles PSC fill, lead ruling 1c 2026-11-20): a stacked check fills each page to its declared ceiling (role-capacity.js,
// a SHORT check: 12 at M / 8 at L) while the next row fits, so each prerequisite deals more than its base PER_QUAD - up
// to twice its share of the ceiling (one prerequisite: the whole ceiling), plus a row's spare for items passed over. `plan` keeps only what each page holds.
export const ceilingOf = (ctx) => { const c = roleCapacity(ROLE_ID); return (c && (c[ctx.size] || c.M)) || PER_QUAD * 4; };
const fillDeal = (input, n) => { const cap = ceilingOf(ctxOf(input)); return Math.max(PER_QUAD, Math.min(cap, Math.ceil((2 * cap) / Math.max(1, n)))) + PER_QUAD; };
export const counts = (pools, input) => { const ids = Object.keys(pools); return Object.fromEntries(ids.map((id) => [id, routedCheck(input) ? PER_QUAD : input && input.perQuestion ? perQuad(input, Number(String(id).replace(/\D/g, '')) || 0) : fillDeal(input, ids.length)])); };

export function plan(input = {}) {
    if (!(Array.isArray(input.routes) && input.routes.some(Boolean))) return planCheck(input, 1);
    // A lesson's routed check (perQuestion): each question deals its items (2 by default, LR-17); while the page cannot
    // hold them, the last question above its floor (2, ROUTE_ITEMS) gives one up (the check is one page, PT 2.10).
    if (input.perQuestion) {
        // A lesson's routed check: each question deals a ROW of items - as many as lie side by side (at most PER_QUAD),
        // never fewer than it asks (`perQuestion`, 2 by default, LR-17) - so a narrow item never sits alone in a wide
        // cell (critic r1 D9); while the page cannot hold them, the last question above its floor of 2 gives one up
        // (the check is one page, PT 2.10).
        const ctx = ctxOf(input);
        const n = input.routes.length;
        const asked = (i) => (Array.isArray(input.perQuestion) ? Number(input.perQuestion[i]) || 1 : Number(input.perQuestion) || 1);
        const per = Array.from({ length: n }, (_, i) => {
            const its = poolItems(input, `q${i}`);
            const row = [PER_QUAD, 3, 2].find((k) => its.length >= k && fitsAt(its.slice(0, k), k, ctx)) || 1;
            return Math.min(its.length || 1, Math.max(asked(i), row));
        });
        // (a count is whole rows only: k items at the most columns they lie at, every row full - never a lone item
        // stretched across a row its neighbours share)
        const whole = (i, k) => { const its = poolItems(input, `q${i}`).slice(0, k); const c = [4, 3, 2, 1].filter((x) => x <= k).find((x) => fitsAt(its, x, ctx)) || 1; return k === 1 || k % c === 0; };
        // (critic r2 N2: a question NEVER prints one item - one item is a coin flip, LR-17a (2), P-25: the floor is
        // ROUTE_ITEMS, or the question's own pool when it holds fewer; the page holds the floor by its rows, ROUTE_GROW)
        const floor = (i) => Math.max(1, Math.min(ROUTE_ITEMS, poolItems(input, `q${i}`).length || 1));
        const down = (i) => { for (let k = per[i] - 1; k >= floor(i); k--) if (whole(i, k)) return k; return floor(i); };
        for (let i = 0; i < n; i++) if (!whole(i, per[i])) per[i] = down(i);
        let p = planCheck(Object.assign({}, input, { perQuestion: per.slice() }), 1);
        for (let guard = 0; guard < 4 * n && (p.pages.length > 1 || !p.meta.fitsPage); guard++) {
            const k = per.map((v, i) => [v, i]).filter(([v, i]) => v > floor(i)).sort((a, b) => b[0] - a[0] || b[1] - a[1]).map(([, i]) => i)[0];
            if (k === undefined) break;
            per[k] = down(k);
            p = planCheck(Object.assign({}, input, { perQuestion: per.slice() }), 1);
        }
        // (then each question, most basic first, takes back an item while the page still holds it)
        const want = per.map((v, i) => Math.min(PER_QUAD, poolItems(input, `q${i}`).length));
        for (let changed = true; changed && p.pages.length === 1;) {
            changed = false;
            for (let i = 0; i < n; i++) {
                if (per[i] >= want[i]) continue;
                const tryPer = per.slice();
                let up = per[i] + 1;
                while (up <= want[i] && !whole(i, up)) up++;
                if (up > want[i]) continue;
                tryPer[i] = up;
                const q = planCheck(Object.assign({}, input, { perQuestion: tryPer }), 1);
                if (q.pages.length === 1 && q.meta.fitsPage && (q.meta.foot || 0) < (p.meta.foot || 0)) { per[i] = up; p = q; changed = true; }
            }
        }
        return p;
    }
    // With routes, the tags never cost the check a page: a stacked check that would run onto another page
    // keeps fewer rows a band (each band still at least one row; every cell at its measured size).
    const plain = planCheck(Object.assign({}, input, { routes: undefined }), 1).pages.length;
    let p = null;
    for (const cut of [1, 0.85, 0.7, 0.55]) { p = planCheck(input, cut); if (p.pages.length <= plain) break; }
    return p;
}

/**
 * The stacked Pre-skill Check's pages (lead ruling R13, 2026-11-13): whole bands in order, every prerequisite kept. One page
 * when the bands fit it; otherwise every page has the full body (each page prints the full header) and two pages split as
 * evenly as the bands allow (2 + 2 for four prerequisites), never leaving one page a single item. `bands` [{h, n, sec}].
 */
export function paginateBands(bands, budget, gap = 0) {
    const hOf = (bs) => bs.reduce((t, b, i) => t + b.h + (i ? gap : 0), 0);
    const nOf = (bs) => bs.reduce((t, b) => t + b.n, 0);
    const page = (bs) => ({ sections: bs.map((b) => b.sec), used: hOf(bs), budget, fullHeader: true });
    if (hOf(bands) <= budget) return [Object.assign(page(bands), { fullHeader: false })];
    let best = null;
    for (let k = 1; k < bands.length; k++) {
        const a = bands.slice(0, k), b = bands.slice(k);
        if (hOf(a) > budget || hOf(b) > budget) continue;
        const score = [nOf(a) < 2 || nOf(b) < 2 ? 1 : 0, Math.abs(a.length - b.length), Math.abs(hOf(a) - hOf(b))];
        const d = best ? score.findIndex((v, i) => v !== best.score[i]) : -1;
        if (!best || (d > -1 && score[d] < best.score[d])) best = { k, score };
    }
    if (best) return [page(bands.slice(0, best.k)), page(bands.slice(best.k))];
    const out = [];
    let cur = [];
    for (const b of bands) { if (cur.length && hOf(cur.concat([b])) > budget) { out.push(page(cur)); cur = []; } cur.push(b); }
    if (cur.length) out.push(page(cur));
    return out;
}

/**
 * The stacked check's fill (lf-roles PSC fill, lead request 2026-11-20), in place: on each page of `pgs` (the bands' indexes
 * into `bands`, as paginateBands left them - R13's split is kept), the band with the fewest rows takes its next row of items
 * (from `more`, its deal past the base) while the page holds the new row (every cell at its measured size, never shrunk) and
 * the page stays within its ceiling `cap` (items). Pure.
 */
export function fillBands(pgs, bands, m, tag, ctx, cap) {
    const heightOf = (b) => m.strip + tag + Math.ceil(b.its.length / b.cols) * b.rowH;
    for (const pg of pgs) {
        const on = pg.sections.map((j) => bands[j]);
        const done = new Set();
        let used = on.reduce((t, b) => t + b.h, 0);
        let items = on.reduce((t, b) => t + b.its.length, 0);
        for (let guard = 0; guard < 200; guard++) {
            // (an item too wide for the band's columns is passed over, never squeezed: the band keeps its columns)
            // ... and so is one whose ink is narrower than the band's narrowest base item at these columns: its cell would have
            // an empty side the base never had (EB-SIDE, lead ruling 2 2026-11-20: div_facts M "0 ÷ 8" at 30.8 %; ink widths
            // from the bridge's measure, measured[cols].inkMm)
            const inkOf = (it, c) => { const w = it && it.measured && it.measured[c] && it.measured[c].inkMm; return w > 0 ? w : null; };
            for (const b of on) if (b.more.length && !b.fitted) {
                const base = b.its.map((it) => inkOf(it, b.cols));
                const floor = base.every((w) => w !== null) ? Math.min(...base) : 0;
                b.more = b.more.filter((it) => fitsAt([it], b.cols, ctx) && !(floor && inkOf(it, b.cols) !== null && inkOf(it, b.cols) < floor - 0.5));
                b.fitted = true;
            }
            const cand = on.filter((b) => !done.has(b) && b.more.length).sort((a, b) => Math.ceil(a.its.length / a.cols) - Math.ceil(b.its.length / b.cols))[0];
            if (!cand) break;
            // (whole rows only: a lone item in a row of a multi-column band draws a full-width cell, half of it empty -
            // EB-SIDE, lead ruling 2 2026-11-20; a band that cannot take a whole row is done)
            const k = cand.cols - (cand.its.length % cand.cols);
            if (k > cand.more.length || k > cap - items) { done.add(cand); continue; }
            const its = cand.its.concat(cand.more.slice(0, k));
            const rowH = Math.max(cand.rowH, hMinAt(its, cand.cols, ctx));
            const h = m.strip + tag + Math.ceil(its.length / cand.cols) * rowH;
            const rest = on.filter((b) => b !== cand).reduce((t, b) => t + b.h, 0);
            if (!fitsAt(its, cand.cols, ctx) || rest + h > m.budget) { done.add(cand); continue; }
            cand.its = its; cand.more = cand.more.slice(k); cand.rowH = rowH; cand.h = heightOf(cand);
            used = rest + h; items += k;
        }
        pg.used = used;
    }
    return pgs;
}

// PSC-DEAL (critic D4, 2026-11-20): a prerequisite's items, in their seeded order, keeping no answer a third time and no
// turnaround of an item already kept (a + b after b + a). A sign answer (<, >, =) shares by nature. Pure, so reproducible.
const SIGN_ANS = /^"?(?:[<>=]|true|false|yes|no)"?$/i;
const factOf = (it) => { const m = /(\d+)\s*([+\u00d7x*])\s*(\d+)/.exec(String((it && it.q && it.q.text) || '')); return m ? `${m[2] === '+' ? '+' : 'x'}|${m[1]}|${m[3]}` : null; };
export function dedupeDeal(items) {
    const seen = new Map();
    const facts = new Set();
    return (items || []).filter((it) => {
        const a = JSON.stringify(it && it.q ? it.q.ans : null);
        const f = factOf(it);
        const turn = f ? f.split('|') : null;
        if (turn && turn[1] !== turn[2] && facts.has(`${turn[0]}|${turn[2]}|${turn[1]}`)) return false;
        if (!SIGN_ANS.test(a) && (seen.get(a) || 0) >= 2) return false;
        seen.set(a, (seen.get(a) || 0) + 1);
        if (f) facts.add(f);
        return true;
    });
}

// PSC-INSTR (critic D3, 2026-11-20): two neighbouring bands never print the same instruction - each of a run of equal
// instructions names its own prerequisite ("Subtract within 20."), from the prerequisite's own label. In place.
export function distinctInstrs(bands) {
    for (let i = 0; i < bands.length; i++) {
        const same = (j) => bands[j] && bands[j].instr && bands[j].instr === bands[i].instr;
        if (!(same(i - 1) || same(i + 1))) continue;
        bands[i].mark = true;
    }
    // (only where the label tells the neighbours apart: two bands of ONE prerequisite skill keep the instruction - a twin pool,
    // left for a ruling - and a label must read as words, not an id ("div word"))
    const wordy = (l) => /\s/.test(String(l || '')) && !/_/.test(String(l)) && String(l).length > 12;
    for (let i = 0; i < bands.length; i++) if (bands[i].mark && bands.some((o, j) => j !== i && o.mark && o.instr === bands[i].instr && (o.label === bands[i].label || !wordy(o.label)))) bands[i].keep = true;
    for (const b of bands) if (b.mark && !b.keep && wordy(b.label)) {
        const base = String(b.instr).replace(/\.\s*$/, '');
        // (sentence case: a label's Title Case words read as a sentence in an instruction line)
        const lab0 = String(b.label).replace(/\.\s*$/, '');
        const lab = lab0.charAt(0) + lab0.slice(1).toLowerCase();
        b.instr = lab.toLowerCase().startsWith(base.toLowerCase()) ? `${lab}.` : `${base}: ${lab.charAt(0).toLowerCase()}${lab.slice(1)}.`;
    }
    for (const b of bands) { delete b.mark; delete b.keep; }
    return bands;
}

function planCheck(input, cut) {
    const ctx = ctxOf(input);
    const form = String(input.form || 'A').toUpperCase() === 'B' ? 'B' : 'A';
    // (the base items a prerequisite starts from, as before; `extra0` the rest of its deal, which the stacked page's fill
    // takes row by row while the next row fits - lf-roles PSC fill; a lesson's check, perQuestion, takes none)
    const extra0 = [];
    const quads0 = [0, 1, 2, 3].map((i) => {
        const pool = dedupeDeal(poolItems(input, `q${i}`));
        let its = pool.slice(0, perQuad(input, i));
        let more = input.perQuestion ? [] : pool.slice(PER_QUAD);
        if (form === 'B') its = shuffle(rng(deriveSeed(input.seed === undefined ? 0 : input.seed, ROLE_ID, 'B', i)), its);
        if (form === 'B' && more.length) more = shuffle(rng(deriveSeed(input.seed === undefined ? 0 : input.seed, ROLE_ID, 'B+', i)), more);
        extra0.push(more);
        return its;
    });
    // (lead A10, 2026-11-20, PSC-TWIN: two pools that deal ONE skill - a preset and its host, vocab_pick3_words and
    // vocab_grade_pictures - are one band: the later pool's items join the first's, its counts summed; a lesson's routed
    // check keeps one question per route)
    if (!input.perQuestion) {
        const keyOf = (q) => (q[0] && q[0].skill) || '';
        for (let i = 0; i < quads0.length; i++) for (let j = i + 1; j < quads0.length; j++) {
            if (!quads0[i].length || !quads0[j].length || keyOf(quads0[i]) !== keyOf(quads0[j])) continue;
            quads0[i] = dedupeDeal(quads0[i].concat(quads0[j]));
            extra0[i] = dedupeDeal((extra0[i] || []).concat(extra0[j] || []));
            quads0[j] = []; extra0[j] = [];
        }
    }
    const quads = quads0.filter((q) => q.length);
    // (each band's question index, for its route; a route's tag takes TAG mm of its band)
    const qIndex = quads0.map((q, i) => (q.length ? i : -1)).filter((i) => i >= 0);
    const routed = !!(input.routes && quads.some((q, j) => routeOf(input, qIndex[j])));
    const TAG = routed ? ROUTE_TAG_MM : 0;
    const routeRows = [];
    const all = quads.flat();
    // (a lesson's Prerequisite Check, LR-17: titled by the lesson it prepares - `checkFor`, the lesson skill's meta)
    const target = (routed && input.checkFor && input.checkFor.iCan) || (input.targetSkill && input.targetSkill.iCan) || ((input.skills || [])[0] || {}).iCan || '';
    // (critic r1 D13: one title spelling; the topic only while the title stays on one line)
    const titleOf = () => {
        if (!(routed && input.checkFor)) return `Pre-skill check: ${topicOf(target)}`;
        const t = `${PREREQ_CHECK_TITLE}: ${topicOf(target)}`;
        return estimateTitleLines(t, ctx.size) <= 1 ? t : PREREQ_CHECK_TITLE;
    };
    const skillsOn = (input.skills || []).filter((s) => all.some((it) => it.q && it.q.skillId === s.skillId && (!it.q.categoryId || it.q.categoryId === s.categoryId)));
    const frame = frameOf({ skills: skillsOn.length ? skillsOn : input.skills || [], input: Object.assign({}, input, { form }),
        tabId: `Check ${form}`, title: titleOf(), score: slotScore(all), twoLine: false });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const mCont = bandMetrics(ctx, layoutHeader(frame.header), { cont: true });
    const labels = labelStyleOf(ctx.look, input.labels);
    const scoreTag = (n) => `<span class="mq-quadscore">__/${n}</span>`;
    let start = 1;
    let bandNo = 0;
    // (the cell's own label: a black number tab on every look, CL-11a)
    const letterOf = (k) => String(k);
    // (an item's answer as the routing table prints it: "B", "70 and 80", "40, 60, 70")
    const answerOf = (it) => { const a = it && it.q ? it.q.ans : ''; return Array.isArray(a) ? a.join(', ') : a && typeof a === 'object' ? Object.values(a).join(', ') : String(a === undefined || a === null ? '' : a); };
    const band = (its, cols, rows, cellH, pageCols, tagLines = 1) => {
        const qi = qIndex[bandNo++];
        const instr = instructionText(instructionKeyOf(its, input.skills), its);
        // (the detailed lesson's check centres each item in its grown cell, H13; a lesson's routed check keeps CL-4b's top
        // start - its rows grow only to the H13 cap, ROUTE_GROW)
        const centre = input.perQuestion && !routed;
        const grid = gridPart(its.map((it) => planItem(centre ? Object.assign({}, it, { cellCls: [it.cellCls || '', 'mq-lvcenter'].join(' ').trim() }) : it, { cols: pageCols, level: 0 })), { cols, rows, cellH, labels, start });
        const r = routed ? routeOf(input, qi) : null;
        const b = {
            // (a routed question carries its own score, __/n - P-25, critic r2 N3: the routing table reads it)
            kind: 'band', label: '', instr, pscLabel: ((input.skills || []).find((s0) => its[0] && (`${s0.categoryId}:${s0.skillId}` === its[0].skill || (its[0].q && s0.skillId === its[0].q.skillId))) || {}).label || (its[0] && its[0].q && its[0].q.skillLabel) || '', pscSkill: (its[0] && its[0].skill) || '', pscItems: its.map((it) => ({ text: String((it.q && it.q.text) || ''), ans: it.q ? it.q.ans : null })), extra: input.perQuestion && !routed ? '' : scoreTag(slotScore(its)),
            // (the detailed lesson's check centres each item in its grown cell, H13)
            content: routed ? { kind: 'col', cls: 'mq-lprecol', parts: [grid, { kind: 'html', html: (bandNo === 1 ? routeCssHtml() : '') + routeTagHtml(r, tagLines) }] } : grid,
        };
        if (r) routeRows.push({ letters: its.length > 1 ? `${letterOf(start)}\u2013${letterOf(start + its.length - 1)}` : letterOf(start), checks: r.checks || instr, answers: its.map(answerOf).join('; '), lesson: r.lesson, title: r.title });
        start += its.length;
        return b;
    };
    const pages = [];
    let kept = 0;
    let routedFoot = null;
    let routedUnits = null;
    let routedFits = true;
    const quadFits = quads.length === 4 && quads.every((q) => fitsAt(q, 4, ctx));
    if (quadFits) {
        // Two rows of two quadrants; each quadrant a band over a 2 x 2 grid (PT-PRE-2 at L).
        const quadH = (m.body - 2 - 3) / 2;
        const cellH = (quadH - m.strip - TAG) / 2;
        const need = Math.max(...quads.map((q) => hMinAt(q, 4, ctx)));
        if (need <= cellH) {
            const rowPart = (a, b) => ({ kind: 'row', widths: ['1fr', '1fr'], cls: 'mq-quadrow', height: `${quadH.toFixed(2)}mm`, parts: [band(a, 2, 2, cellH, 4), band(b, 2, 2, cellH, 4)] });
            pages.push({ sections: [rowPart(quads[0], quads[1]), rowPart(quads[2], quads[3])] });
        }
    }
    if (!pages.length) {
        // Stacked full-width bands, whole bands per page. A check is short (PT 2.10): each band
        // keeps the whole rows its share of one page holds (at least one row), so four wide
        // pictures print one page of four one-row bands instead of four pages.
        let cur = { sections: [], used: 0, budget: m.budget };
        // (the stacked Pre-skill Check's bands, paginated below - lead ruling R13)
        const stacked = [];
        // `perQuestion` (the detailed lesson's Prerequisite Check, V22 §9.1): the bands fill the body
        // (flex weights by content), each cell growing to at most 1.45 x its content so no empty band
        // reaches 30 % (H13). Absent on every other check.
        let grow = 1;
        let whole = false;
        if (input.perQuestion) {
            const own = quads.map((q0) => { const c = [4, 2, 1].find((cc) => fitsAt(q0, cc, ctx)) || 1; return { h: hMinAt(q0, c, ctx), rows: Math.ceil(q0.length / c) }; });
            const need = own.reduce((a, o) => a + m.strip + TAG + o.rows * o.h, 0);
            const rowsH = own.reduce((a, o) => a + o.rows * o.h, 0);
            if (need < m.budget && rowsH > 0) grow = Math.min(GROW_MAX, 1 + (m.budget - need - 1) / rowsH);
            // (every item the description asks for prints when the whole check fits one page - critic D15)
            whole = need <= m.budget;
        }
        if (routed && input.perQuestion) {
            // A lesson's Prerequisite Check (LR-17): ONE grid (critic r1 D4 / D9) - routedLayout() pairs single items two-up
            // and lays each question's items side by side where they fit; the bands follow each other with the band gap
            // only; the spare height grows the rows, each up to the H13 cap (ROUTE_GROW,
            // CL-4b top start). What the rows cannot take is left at the foot (reported in meta.foot).
            const lay = routedLayout(quads, qIndex, input, ctx, m);
            lay.units.forEach((u) => {
                const uh = u.fixed + u.rows * u.h + (cur.sections.length ? m.gap : 0);
                if (cur.sections.length && cur.used + uh > cur.budget + 0.5) { pages.push(cur); cur = { sections: [], used: 0, budget: mCont.budget }; }
                cur.used += uh;
                if (u.qs.length === 2) cur.sections.push({ kind: 'row', widths: u.qs.map((q) => `${q.length}fr`), cls: 'mq-quadrow mq-lprerow', parts: u.qs.map((q) => band(q, q.length, 1, u.h, u.cols, u.tagLines)) });
                else cur.sections.push(band(u.qs[0], u.cols, u.rows, u.h, u.cols, u.tagLines));
                kept += u.qs.reduce((t, q) => t + slotScore(q), 0);
            });
            routedFoot = lay.foot;
            routedFits = lay.fits;
            routedUnits = lay.units.map((u) => ({ qs: u.qs.map((q) => q.length), cols: u.cols, rows: u.rows, h0: +u.h0.toFixed(1), cap: +u.cap.toFixed(1), h: +u.h.toFixed(1), slack: u.slack }));
        } else for (const [j, q0] of quads.entries()) {
            const cols = [4, 2, 1].find((c) => fitsAt(q0, c, ctx)) || 1;
            const h = hMinAt(q0, cols, ctx) * grow;
            const share = (m.budget / quads.length - m.strip - TAG) * cut;
            const q = whole ? q0 : q0.slice(0, Math.min(q0.length, cols * Math.max(1, Math.floor(share / Math.max(1, h)))));
            kept += slotScore(q);
            const rows = Math.ceil(q.length / cols);
            const bandH = m.strip + TAG + rows * h;
            if (!input.perQuestion) { kept -= slotScore(q); stacked.push({ h: bandH, n: q.length, sec: j, its: q, cols, rowH: h, more: q0.slice(q.length).concat(extra0[qIndex[j]] || []) }); continue; }
            if (cur.sections.length && cur.used + bandH > cur.budget) { pages.push(cur); cur = { sections: [], used: 0, budget: mCont.budget }; }
            // (the detailed lesson's check never lays a band out in more columns than it has items: one item in a two-up
            // band left an empty bordered half - lesson 4 critic r2 D9; the item keeps its measured size, centred)
            cur.sections.push(band(q, input.perQuestion ? Math.max(1, Math.min(cols, q.length)) : cols, rows, h, cols));
            cur.used += bandH;
        }
        // (gap 0: the bands stand edge to edge, as the one-page sum always counted them)
        if (stacked.length) {
            const pgs = paginateBands(stacked, m.budget, 0);
            fillBands(pgs, stacked, m, TAG, ctx, ceilingOf(ctx));
            // (the bands are drawn only now, in order, at their filled counts: numbering runs on across the pages)
            for (const pg of pgs) pg.sections = pg.sections.map((j) => { const b = stacked[j]; kept += slotScore(b.its); return band(b.its, b.cols, Math.ceil(b.its.length / b.cols), b.rowH, b.cols); });
            pages.push(...pgs);
        }
        if (cur.sections.length) pages.push(cur);
        // The detailed lesson's check: the last band takes the page's spare height (one unruled
        // trailing area inside the frame, V22 §8.12.4), so the body is not blank at its foot.
        // (only when the rows could not grow to the body: an empty bordered strip under the last row reads
        // as a missing item - critic r2 R7)
        if (input.perQuestion && !routed && grow >= GROW_MAX) for (const pg of pages) { const last = pg.sections[pg.sections.length - 1]; if (last) last.grow = true; }
    }
    // (kept and n count answer slots - a chart window its empty squares, critic r1 F6; one a cell for every other template)
    // (PSC-INSTR: the bands in page order, a quadrant row's two included; meta.bands lists them for ws-psc-lint)
    let pscBands = [];
    {
        const bs = [];
        const walk = (sec) => { if (!sec) return; if (sec.kind === 'band') bs.push(sec); for (const x of sec.parts || []) walk(x); };
        for (const pg of pages) for (const sec of pg.sections) walk(sec);
        distinctInstrs(bs.map((b) => Object.assign(b, { label: b.pscLabel, _l: b.label })));
        pscBands = bs.map((b) => ({ instr: b.instr, skill: b.pscSkill || '', items: b.pscItems || [] }));
        for (const b of bs) { b.label = b._l; delete b._l; delete b.pscLabel; delete b.pscItems; delete b.pscSkill; }
    }
    const n = kept || slotScore(all);
    const finalFrame = n === slotScore(all) ? frame : frameOf({ skills: skillsOn.length ? skillsOn : input.skills || [], input: Object.assign({}, input, { form }),
        tabId: `Check ${form}`, title: titleOf(), score: n, twoLine: false });
    const rp = routed ? routePlan(input, routeRows) : null;
    // (lead ruling R13: a check that runs to a second page prints the FULL header on every page - name, date, score, title)
    return assemble(ROLE_ID, Object.assign({}, input, { form }), finalFrame, pages.map((p, i) => (p.fullHeader && i > 0 ? { header: finalFrame.header, sections: p.sections } : { sections: p.sections })), {
        scaffoldLevel: 0,
        meta: Object.assign({ bands: pscBands, foot: routedFoot, units: routedUnits, fitsPage: routedFits, items: n, scoreOutOf: n, form, quadrants: quadFits && pages.length === 1, fits: [{ cols: quadFits ? 2 : 4, rows: 2, line: `Fits: ${quads.length} prerequisite skills, ${all.length} items.` }] },
            rp ? { routePlan: rp, routes: routeRows } : {}),
    });
}

/**
 * The routed check's layout (critic r1 D4 / D9 / D16), pure: units (a question alone, or two single-item questions
 * paired two-up), each with its columns, rows, row height and tag lines; the height used and the foot left blank.
 *   - a question's items lie side by side where they fit (at most its item count across), else in rows;
 *   - two consecutive single-item questions that each fit half the width, of like height (PAIR_ALIKE), share a row;
 *   - every band is its strip (a second line when its instruction wraps) + its rows + its tag;
 *   - the spare height grows the rows in proportion, each row up to ROUTE_GROW x its measured height (H13).
 */
export function routedLayout(quads, qIndex, input, ctx, m) {
    const em = ((ctx.s && ctx.s.textPt) || 14) * PT_MM;
    const instrOf = (q) => String(instructionText(instructionKeyOf(q, input.skills), q) || '');
    const extraLines = (q, w) => Math.max(0, Math.ceil((instrOf(q).length * INSTR_CHAR_EM * em) / Math.max(30, w - 10)) - 1);
    const colsOf = (q) => [4, 3, 2, 1].filter((c) => c <= q.length).find((c) => fitsAt(q, c, ctx)) || 1;
    const units = [];
    for (let j = 0; j < quads.length; j++) {
        const a = quads[j], b = quads[j + 1];
        // (two questions share a row when all their items lie side by side at the row's column count - at most 4 - and
        // are of like height: four narrow items across, never a full-width band each with its items pinned to the
        // middle, critic r1 D9)
        const across = b ? a.length + b.length : 0;
        const alike = () => { const ha = hMinAt(a, across, ctx), hb = hMinAt(b, across, ctx); return Math.min(ha, hb) >= PAIR_ALIKE * Math.max(ha, hb); };
        if (b && across <= 4 && fitsAt(a, across, ctx) && fitsAt(b, across, ctx) && alike()) { units.push({ qs: [a, b], qi: [qIndex[j], qIndex[j + 1]], cols: across, rows: 1 }); j++; }
        else { const c = colsOf(a); units.push({ qs: [a], qi: [qIndex[j]], cols: c, rows: Math.ceil(a.length / c) }); }
    }
    for (const u of units) {
        const two = u.qs.length === 2;
        const w = two ? (FULL_W_MM * u.qs[0].length) / u.cols : FULL_W_MM;
        const hs = u.qs.map((q) => hMinAt(q, u.cols, ctx));
        u.h0 = Math.max(...hs);
        // (a legacy cell is measured taller than it draws - its own text and answer line: it keeps its measured height)
        const legacy = u.qs.some((q) => q.some((it) => it.legacy));
        u.cap = legacy ? u.h0 : u.h0 * ROUTE_GROW;
        u.tagLines = Math.max(...u.qi.map((qi, x) => routeTagLines(routeOf(input, qi), two ? (x ? FULL_W_MM - w : w) : FULL_W_MM)));
        u.fixed = m.strip + Math.max(0, ...u.qs.map((q, x) => extraLines(q, two ? (x ? FULL_W_MM - w : w) : FULL_W_MM))) * em * 1.25 + routeTagMm(u.tagLines);
        u.h = u.h0;
    }
    const gaps = Math.max(0, units.length - 1) * m.gap;
    const used0 = units.reduce((t, u) => t + u.fixed + u.rows * u.h, 0) + gaps;
    let spare = m.budget - used0 - 1;
    for (let pass = 0; pass < 8 && spare > 0.5; pass++) {
        const open = units.filter((u) => u.h < u.cap - 0.05);
        if (!open.length) break;
        const w = open.reduce((t, u) => t + u.rows * u.h, 0);
        let took = 0;
        for (const u of open) { const add = Math.min(u.cap - u.h, (spare * u.h) / w); u.h += add; took += add * u.rows; }
        spare -= took;
    }
    const used = units.reduce((t, u) => t + u.fixed + u.rows * u.h, 0) + gaps;
    return { units, used, foot: +(Math.max(0, m.budget - used) / m.budget).toFixed(3), fits: used <= m.budget + 0.5 };
}

export default { ROLE_ID, sources, measureCols, counts, plan, routeText, routeTagHtml, routingTableHtml, routePlan, routedLayout, ROUTE_TAG_MM, PREREQ_CHECK_TITLE };
