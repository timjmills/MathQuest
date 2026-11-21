#!/usr/bin/env node
// ws-lesson-player — the lesson player's gate (design/cards/lesson-player/lesson-player.md D10; lane lf-hosts, slice 1:
// I do on the board, the part bar jumping, D11 built in). Modes (default: every slice-1 mode):
//
//   --unit       node: PLAYER_PARTS order, parseLaunch / launchSearch round-trip for every part id, planLesson is the
//                same twice for every library lesson x 2 seeds, I do steps == the provider's workedSteps (M-LP1: never
//                invented), the Say line holds only the example's numbers (P-17); browser: SEED PARITY - the player's I do
//                example == the printed anchor chart's example for the same seed (buildSheet, the lesson print screen's
//                request AND the White Rose screen's skill-keyed request), M-LP2
//   --render     every width (tests/lib/ws-screen-widths.cjs + 1920 for the board) x every I do step: no horizontal scroll,
//                board controls >= 64 px (every pill and button), cell ink only #000 / #fff / #949494, Andika in the cell,
//                no emoji anywhere in the player, H13 (no empty band >= 30 % in the cell, read on its ink primitives; the
//                Steps column sized to its content: no empty band under its last row), digit floor (>= the host's SP floor
//                and >= 80 % of the board target 104 px x scale)
//   --reveal     n Next presses = n distinct cell states; each state has grey (newest) ink; Back restores the state before;
//                Right / Space / PageDown next, Left / PageUp back (clicker keys); R reads the step's words (+ the Say line on
//                the last step); the Say band is absent before the last step and == "Say: " + sayLineOf after it; Esc leaves
//   --any-part   PLAYER-ANY-PART: every part id opens directly by URL (?part=) at that part; the part bar jumps to every
//                other part and the URL follows; Next / Back step across parts (a not-yet-built part is navigable)
//   --leave      (critic r1 F1, F6-F8) Leave >= 64 / 48 px on every part stage and on the 'No such lesson' stage (no live
//                pills there), Leave closes as Esc does; the unknown name shown literally; mode=pupil -> Board; the I do tick
//                only after its last step
//   --stage-fill (lf-hosts player critic r2 F1 / F2, root cause under the round cap; lead ruling A22 2026-11-20) - in --render
//                and --reveal, at every width and step: the cell's top == the Steps' top +-4 px (Steps beside the cell) or the
//                cell directly under the chip row +-4 px; < 30 % of the stage (inside its padding) outside the cell and the
//                Steps; .mq-lp-say >= 95 % of the cell's inner width, below the drawing; the Say band's frame and "Say:"
//                label from step 1, its line text only after the last step; digits >= the signed size and <= 1.25 x it; the
//                cell inside the stage on every side; no orphan mode pill on the "No such lesson" screen. ON by default on
//                this tree; a backtest checkout (MQ_ROOT set) runs it only with --stage-fill, so the rows pinned before A22
//                (ink-still, dot-card, stage-h13-digits) keep judging the contract their commits were built to.
//   --hops-below (lf-hosts player critic r3 F1; lead ruling A26 2026-11-20) - in --render, at every width and step: the
//                count-on hops box never sits above the drawing, and where it overlaps the drawing's columns it starts at least
//                0.5 of a digit height below the drawing's foot (the answer row); beside the drawing (no shared column) is fine.
//                ON by default on this tree; a backtest checkout (MQ_ROOT set) runs it only with --hops-below.
//                A26b (lead 2026-11-20): at 820 portrait ONLY, the answer row + the hops' room under it is reserved room (H13:
//                <= 35 % without it, <= 47 % with it, and the last step inks all of it - a check of its own).
//   --slice2     (lane lf-hosts slice 2: Warm-up + We do, both modes) - ON by default on this tree; a backtest checkout (MQ_ROOT
//                set) runs it only with --slice2, so the slice-1 rows keep judging the contract their commits were built to. Adds:
//                --render  Warm-up and We do (every item, every rung) and the I do, in BOARD and PUPIL mode, at every width: the
//                          slice-1 checks (no scroll, cell ink, Andika, emoji, H13, Leave) + stage-fill (cell top level with the Steps /
//                          the stage top, < 30 % of the stage empty, the cell inside the stage), the digit window [signed, 1.25 x]
//                          (board 156 / 104 / 83, pupil the card scale 56 / 48), every button AND answer input >= 64 px (board) /
//                          48 px (pupil)
//                --hints   We do: items open at rungs 1 -> 2 -> 3, a correct Check moves the next item down a rung, a wrong Check
//                          keeps it (P-ON-7), Hint never writes into an input (P-ON-8), live per-digit marks (SP-31), the black ink
//                          never moves between rungs; rung 1 = grey working + the next step's sentence, rung 2 = the sentence,
//                          rung 3 = "What comes next?" + its Steps row highlighted; the board drives the rung with Hint / Next;
//                          Warm-up: Check marks it, a miss shows the "If missed" line; pupil I do reads itself only with sound on (A17)
//                --any-part  Warm-up and We do open as cells by URL in both modes; pupil mode resumes at the last part reached;
//                          You do / Exit ticket stay "coming soon" and navigable
//                --unit    D2: partSeed(S, part, i) = S+100+i / S+200+i / S+300+i / S+900+i; the player's Warm-up and We do items ==
//                          the printed packet's own Warm-up and Guided items for the same seed (buildSheet, P-ON-5)
//   --exit / --sheet-to-play / packet page ids: later slices (3, 5 / 4) - reported NOT IN THIS SLICE, never passed
//
//   --widths 1280,1920   override the widths (default SCREEN_WIDTHS + 1920)   --shots <dir>  write PNGs (dsf 2)
//   --lesson <id|slug>   default add-within-10 (the slice-1 lesson, D8)
// MQ_ROOT=<checkout> serves and imports another tree (ws-backtest commit-pair rows).
// Prints `ws-lesson-player: OK` / `ws-lesson-player: FAIL`.

import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.MQ_ROOT ? resolve(process.env.MQ_ROOT) : resolve(HERE, '..', '..');
const H = require(join(HERE, '..', 'lib', 'ws-harness.cjs'));
const SW = require(join(HERE, '..', 'lib', 'ws-screen-widths.cjs'));
const TOOL = 'ws-lesson-player';
const argv = process.argv.slice(2);
const arg = (k, d = null) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const MODES = ['unit', 'render', 'reveal', 'any-part', 'leave'];
// SLICE 2 (Warm-up + We do, both modes): on by default on this tree; a backtest checkout runs it only with --slice2
const S2 = argv.includes('--slice2') || !process.env.MQ_ROOT;
const LATER = Object.assign(S2 ? {} : { hints: 'slice 2 (We do)' }, { exit: 'slice 3 (Exit ticket)', 'sheet-to-play': 'slice 5 (D12 itemsFor)' });
if (S2 && !MODES.includes('hints')) MODES.push('hints');
let modes = MODES.filter((m) => argv.includes(`--${m}`));
const later = Object.keys(LATER).filter((m) => argv.includes(`--${m}`));
if (!modes.length && !later.length) modes = MODES.slice();
const LESSON = arg('--lesson', 'add-within-10');
// A22 (lead ruling 2026-11-20): the stage-fill / Say-band contract; see --stage-fill above
const A22 = argv.includes('--stage-fill') || !process.env.MQ_ROOT;
// A26 (lead ruling 2026-11-20): the hops go below the answer row (or beside the drawing), never above it; see --hops-below
const A26 = argv.includes('--hops-below') || !process.env.MQ_ROOT;
const BOARD_W = 1920;
const WIDTHS = SW.widthsArg(process.argv, [...SW.SCREEN_WIDTHS, BOARD_W]);
const HEIGHT = (w) => (w === BOARD_W ? 1080 : SW.heightOf(w));
// The signed cell-digit size per width (card drawing.sizes, D5): board 104 px at 1280 / 1366, x1.5 at 1920; the tablet
// (820 / 1024) board at the player's tablet scale 0.8 (83 px; the card names no tablet figure). Critic r1 F4: >= this.
const DIGIT_TARGET = (w) => (w >= 1600 ? 156 : w >= 1200 ? 104 : 83);
const SHOTS = arg('--shots');
const fails = [];
const notes = [];
const fail = (mode, msg) => { fails.push(`${mode}: ${msg}`); console.log(`  FAIL ${mode}: ${msg}`); };
const ok = (mode, msg) => console.log(`  ok   ${mode}: ${msg}`);

for (const m of later) notes.push(`--${m}: NOT IN SLICE 1 (${LATER[m]}); not run, not passed`);

/* ================================================================ --unit (node half) */
async function unitNode() {
    const planPath = join(ROOT, 'js/modules/lesson-player/plan.js');
    if (!existsSync(planPath)) { fail('unit', 'no js/modules/lesson-player/plan.js (no lesson player in this tree)'); return null; }
    const P = await import(pathToFileURL(planPath).href);
    const L = await import(pathToFileURL(join(ROOT, 'js/modules/lessons/library.js')).href);
    const A = await import(pathToFileURL(join(ROOT, 'js/modules/sheet/anchors.js')).href);
    const ids = P.PLAYER_PARTS.map((p) => p.id).join(',');
    if (ids !== 'warmup,ido,wedo,youdo,exit') fail('unit', `part order ${ids}`); else ok('unit', 'part order Warm-up, I do, We do, You do, Exit ticket');
    for (const part of P.PART_IDS) {
        const l = P.parseLaunch(`?lesson=${LESSON}&part=${part}&s=77&mode=board`);
        const back = P.parseLaunch(P.launchSearch(l));
        if (!l || l.part !== part || l.seed !== 77 || !back || back.part !== part || back.lesson !== l.lesson) fail('unit', `launch ?part=${part} did not round-trip`);
    }
    ok('unit', `every part id parses from ?part= and round-trips (${P.PART_IDS.length})`);
    const def = P.parseLaunch(`?lesson=${LESSON}`);
    if (!def || def.seed !== P.lessonSeedOf(def.lesson) || def.part !== 'ido') fail('unit', 'a bare ?lesson= link does not open I do at the packet seed (D2)');
    let n = 0;
    for (const id of Object.keys(L.LESSONS)) {
        for (const s of [P.lessonSeedOf(id), 12345]) {
            const a = JSON.stringify(P.planLesson(id, { seed: s }));
            const b = JSON.stringify(P.planLesson(id, { seed: s }));
            if (a !== b) fail('unit', `planLesson(${id}, ${s}) differs between two calls`);
            n++;
        }
    }
    ok('unit', `planLesson deterministic for ${n / 2} library lessons x 2 seeds`);
    return { P, L, A };
}

/** I do == the provider's steps; Say only the example's numbers. */
function checkIdo(mods, exampleQ) {
    const { P, L, A } = mods;
    const plan = P.planLesson(LESSON, { example: exampleQ });
    const ido = plan.parts.find((p) => p.part === 'ido');
    const ws = A.workedStepsOf({ q: exampleQ });
    if (!ido || ido.steps.length !== ws.length || ido.steps.some((s, i) => s.words !== ws[i].text)) fail('unit', `I do steps != workedSteps (${ido ? ido.steps.length : 0} vs ${ws.length})`);
    else ok('unit', `I do = ${ws.length} worked steps of ${exampleQ.text} (the provider's own words)`);
    if (ws.length < 2) fail('unit', 'M-LP1: the example has fewer than 2 worked steps');
    const nums = new Set((String(exampleQ.text).match(/\d+/g) || []).concat(String(exampleQ.ans)));
    const sayNums = String(ido.say).match(/\d+/g) || [];
    if (!ido.say) fail('unit', 'no Say line (P-17)');
    else if (sayNums.some((x) => !nums.has(x))) fail('unit', `Say "${ido.say}" has a number not in ${exampleQ.text} = ${exampleQ.ans}`);
    else ok('unit', `Say "${ido.say}" holds only the example's numbers`);
    const data = L.lessonData(LESSON);
    const names = (data.steps || []).map((s) => s.text);
    if (names.length && ido.steps.some((s, i) => names[i] && s.name !== names[i])) fail('unit', 'the Steps strip names differ from the routine steps');
}

/* ================================================================ browser */
async function openPlayer(width, part = 'ido', extra = '') {
    const h = await H.open({ viewport: { width, height: HEIGHT(width), deviceScaleFactor: SHOTS ? 2 : 1 }, pagePath: `/index.html?lesson=${encodeURIComponent(LESSON)}&part=${part}${/[?&]?mode=/.test(extra) ? '' : '&mode=board'}${extra}`, lock: TOOL });
    try {
        // (fail fast where no player exists - a tree before slice 1 - then give the lesson build its time)
        await H.waitFor(h.page, () => typeof window.openLessonPlayer === 'function' && !!document.getElementById('mqLessonPlayer'), 15000, 'lesson player opened');
        await H.waitFor(h.page, () => window.lessonPlayerState && !window.lessonPlayerState.__mqStub && window.lessonPlayerState().ready, 90000, 'lesson player ready');
    } catch (e) { await h.close(); throw e; }
    await new Promise((r) => setTimeout(r, 150));
    return h;
}
const state = (page) => page.evaluate(() => window.lessonPlayerState());
const press = async (page, key) => { await page.keyboard.press(key); await new Promise((r) => setTimeout(r, 120)); };

async function unitBrowser(mods) {
    let h;
    try { h = await openPlayer(1280); } catch (e) { fail('unit', `the player did not open (${e.message.split('\n')[0]})`); return; }
    try {
        const r = await h.page.evaluate(async (lesson) => {
            const P = await import('/js/modules/lesson-player/plan.js');
            const ps = await import('/js/modules/print-sheet.js');
            const W = await import('/js/modules/wrm-links.js');
            const st = window.lessonPlayerState();
            const id = P.resolveLessonId(lesson);
            const req = P.chartRequest(id, st.seed);
            const a = await ps.buildSheet(req);
            // the White Rose screen's own request (teacher-wrm.js: skill-keyed, its seed and variant)
            const ref = P.planLesson(id).practice;
            const b = await ps.buildSheet({ role: 'lesson', sections: [{ skills: [{ categoryId: ref.categoryId, skillId: ref.skillId, opts: ref.opts || {} }] }], practicePages: 1, mixed: false,
                size: 'M', look: 'auto', paper: 'A4', header: { name: true, date: true, score: true, title: true }, key: { on: true, placement: 'end', style: 'copy' },
                seed: W.wrmLessonSeed({ step: id, key: id }), lessonVariant: W.wrmLessonVariant({ step: id, key: id }) });
            const q = a.lesson.chart.exampleQs[0];
            return { player: st.example, chartA: a.lesson.example, chartB: b.lesson.example, seed: st.seed, wrmSeed: W.wrmLessonSeed({ step: id, key: id }), q: JSON.parse(JSON.stringify(q)) };
        }, LESSON);
        if (r.seed !== r.wrmSeed) fail('unit', `D2: the player's default seed ${r.seed} is not the lesson's packet seed ${r.wrmSeed}`);
        if (r.player !== r.chartA || r.player !== r.chartB) fail('unit', `M-LP2 seed parity: I do ${r.player} vs anchor chart ${r.chartA} (print screen) / ${r.chartB} (White Rose screen)`);
        else ok('unit', `seed parity: I do ${r.player} == the anchor chart's example on both print screens (seed ${r.seed})`);
        if (mods) checkIdo(mods, r.q);
        if (h.problems.length) fail('unit', `console errors: ${h.problems.map((p) => p.text).join(' | ').slice(0, 300)}`);
    } finally { await h.close(); }
}

/** Measure the open I do (in the page). */
function measureInPage() {
    const r = document.getElementById('mqLessonPlayer');
    const out = { problems: [] };
    const doc = document.documentElement;
    out.hscroll = Math.max(doc.scrollWidth, document.body.scrollWidth) > window.innerWidth + 1 || r.scrollWidth > r.clientWidth + 1;
    out.mode = r.dataset.mode;
    // the Leave control (critic r1 F1): visible on every stage
    const lv = r.querySelector('[data-act="leave"]');
    const lq = lv && lv.getBoundingClientRect();
    out.leave = lv && lv.offsetParent !== null && getComputedStyle(lv).visibility !== 'hidden' ? { w: lq.width, h: lq.height } : null;
    // stage-level H13 (critic r1 F4): the largest band of the stage (rows, then columns) that no content block covers
    const stgEl = r.querySelector('.mq-lp-stage');
    if (stgEl) {
        const sq = stgEl.getBoundingClientRect();
        const blocks = [...stgEl.querySelectorAll('.mq-lp-steps, .mq-lp-cell, .mq-lp-msg')].map((e) => e.getBoundingClientRect()).filter((q) => q.width > 1 && q.height > 1);
        const band = (lo, hi, spans) => { let cur = lo, g = 0; for (const [a, b] of spans.sort((x, y) => x[0] - y[0])) { g = Math.max(g, a - cur); cur = Math.max(cur, b); } return Math.max(g, hi - cur) / Math.max(1, hi - lo); };
        out.stageBandY = band(sq.top, sq.bottom, blocks.map((q) => [q.top, q.bottom]));
        out.stageBandX = band(sq.left, sq.right, blocks.map((q) => [q.left, q.right]));
    }
    out.small = [...r.querySelectorAll('button, .mq-lp-cell input')].filter((b) => b.offsetParent !== null && getComputedStyle(b).visibility !== 'hidden').map((b) => { const q = b.getBoundingClientRect(); return { t: b.tagName === 'INPUT' ? `input ${b.getAttribute('aria-label') || ''}` : b.textContent.trim(), w: q.width, h: q.height }; });
    out.part = r.dataset.part || '';
    const EMOJI = /\p{Extended_Pictographic}/u;
    const walker = document.createTreeWalker(r, NodeFilter.SHOW_TEXT);
    const emo = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (EMOJI.test(n.nodeValue)) emo.push(n.nodeValue.trim());
    out.emoji = emo;
    const cell = r.querySelector('.mq-lp-cell');
    out.cell = !!cell;
    if (!cell) return out;
    // nothing clipped: the cell ends inside the stage (content never runs under the presenter bar)
    const stg = r.querySelector('.mq-lp-stage').getBoundingClientRect();
    out.clip = Math.round(cell.getBoundingClientRect().bottom - stg.bottom);
    // ink colours and fonts inside the cell (INK-1, L7)
    const allowed = new Set(['rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(148, 148, 148)', 'rgba(0, 0, 0, 0)', 'none', 'transparent', 'currentcolor']);
    const bad = new Set();
    const fonts = new Set();
    const cr = cell.getBoundingClientRect();
    const inkY = [];
    const addInk = (q) => { if (q.width > 0.5 && q.height > 0.5 && q.bottom > cr.top && q.top < cr.bottom) inkY.push([Math.max(q.top, cr.top), Math.min(q.bottom, cr.bottom)]); };
    for (const el of cell.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        // (SP-30: feedback marks are chrome, data-ws-feedback, outside INK-1)
        if (el.closest('[data-ws-feedback]')) continue;
        const hasText = [...el.childNodes].some((c) => c.nodeType === 3 && c.nodeValue.trim());
        if (hasText) { if (!allowed.has(cs.color)) bad.add(`color ${cs.color}`); fonts.add(cs.fontFamily.split(',')[0].replace(/["']/g, '').trim()); }
        for (const s of ['Top', 'Right', 'Bottom', 'Left']) if (parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== 'none' && !allowed.has(cs[`border${s}Color`])) bad.add(`border ${cs[`border${s}Color`]}`);
        if (el instanceof SVGElement) {
            for (const p of ['fill', 'stroke']) { const v = cs[p]; if (v && !allowed.has(v) && !/url\(/.test(v)) bad.add(`${p} ${v}`); }
            if (['path', 'text', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline'].includes(el.tagName)) addInk(el.getBoundingClientRect());
        } else {
            if (cs.backgroundColor && !allowed.has(cs.backgroundColor)) bad.add(`background ${cs.backgroundColor}`);
            const q = el.getBoundingClientRect();
            if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') addInk({ top: q.top, bottom: q.top + parseFloat(cs.borderTopWidth), width: q.width, height: parseFloat(cs.borderTopWidth) });
            if (parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== 'none') addInk({ top: q.bottom - parseFloat(cs.borderBottomWidth), bottom: q.bottom, width: q.width, height: parseFloat(cs.borderBottomWidth) });
            if (parseFloat(cs.borderLeftWidth) > 0 && cs.borderLeftStyle !== 'none' && el !== cell) addInk(q);
        }
        for (const c of el.childNodes) if (c.nodeType === 3 && c.nodeValue.trim()) { const rg = document.createRange(); rg.selectNodeContents(c); for (const q of rg.getClientRects()) addInk(q); }
    }
    out.badInk = [...bad];
    out.fonts = [...fonts];
    // H13: the largest band of the cell's inner height with no ink (above, between, below)
    const bw = parseFloat(getComputedStyle(cell).borderTopWidth) || 0;
    const top = cr.top + bw;
    const bottom = cr.bottom - bw;
    const spans = inkY.map(([a, b]) => [Math.max(a, top), Math.min(b, bottom)]).filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0]);
    let cur = top;
    let gap = 0;
    for (const [a, b] of spans) { gap = Math.max(gap, a - cur); cur = Math.max(cur, b); }
    let at = null;
    cur = top;
    for (const [a, b] of spans) { if (a - cur >= gap - 0.01 && at === null) at = [cur, a]; cur = Math.max(cur, b); }
    if (bottom - cur > gap) { gap = bottom - cur; at = [cur, bottom]; }
    if (at === null) at = [cur, cur + gap];
    gap = Math.max(gap, bottom - cur);
    out.band = (bottom - top) > 0 ? gap / (bottom - top) : 0;
    out.bandAt = at.map((v) => v - top);
    out.inkAt = spans.map(([a, b]) => [a - top, b - top]);
    out.cellH = Math.round(bottom - top);
    // the Steps column: no empty band under its last row
    const sc = r.querySelector('.mq-lp-steps');
    if (sc) {
        const kids = [...sc.querySelectorAll('.mq-lp-step, .mq-lp-chant, h2')];
        const last = Math.max(...kids.map((k) => k.getBoundingClientRect().bottom));
        const sq = sc.getBoundingClientRect();
        const pad = parseFloat(getComputedStyle(sc).paddingBottom) + parseFloat(getComputedStyle(sc).borderBottomWidth);
        out.stepsFoot = sq.bottom - pad - last;
        out.stepsH = sq.height;
    }
    // the digits as drawn: the largest digit text's font size x its zoom
    let dpx = 0;
    for (const el of r.querySelectorAll('.mq-lp-draw *')) {
        const own = [...el.childNodes].some((c) => c.nodeType === 3 && /\d/.test(c.nodeValue));
        if (!own) continue;
        let z = 1;
        for (let a = el; a && a !== r; a = a.parentElement) z *= parseFloat(getComputedStyle(a).zoom) || 1;
        dpx = Math.max(dpx, parseFloat(getComputedStyle(el).fontSize) * z);
    }
    for (const el of r.querySelectorAll('.mq-lp-draw input')) {
        let z = 1;
        for (let a = el; a && a !== r; a = a.parentElement) z *= parseFloat(getComputedStyle(a).zoom) || 1;
        dpx = Math.max(dpx, parseFloat(getComputedStyle(el).fontSize) * z);
    }
    out.digitPx = dpx;
    {
        // how much of the cell's work area the drawing takes (card §3: a drawing too big for the stage takes the whole stage)
        const wk = r.querySelector('.mq-lp-cell .mq-lp-work'), dz = r.querySelector('.mq-lp-cell .mq-lp-draw');
        if (wk && dz) { const a = wk.getBoundingClientRect(), b = dz.getBoundingClientRect(), cs = getComputedStyle(wk); const ih = a.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom), iw = a.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); out.drawFill = { h: ih > 0 ? b.height / ih : 0, w: iw > 0 ? b.width / iw : 0 }; }
    }
    out.k = parseFloat(getComputedStyle(r).getPropertyValue('--lp-k')) || 1;
    // the Say band: its frame, its label and its line (A22: the frame and label from step 1, the line after the last step)
    const sayEl = r.querySelector('.mq-lp-say');
    const sayLineEl = sayEl && sayEl.querySelector('.mq-lp-say-line');
    const sayAll = sayEl ? sayEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const sayLine = sayLineEl ? sayLineEl.textContent.trim() : sayAll.replace(/^Say:\s*/, '');
    out.say = sayLine ? sayAll : '';
    out.sayLine = sayLine;
    if (sayEl) {
        const sq = sayEl.getBoundingClientRect();
        const cs = getComputedStyle(sayEl);
        const lab = sayEl.querySelector('b');
        const dq = (r.querySelector('.mq-lp-draw') || cell).getBoundingClientRect();
        const innerW = cell.clientWidth;
        out.sayBand = { w: sq.width, innerW, ratio: innerW ? sq.width / innerW : 0, top: sq.top, drawBottom: dq.bottom, visible: cs.display !== 'none' && cs.visibility !== 'hidden' && sq.height > 1,
            frame: parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none', label: !!lab && /^Say:$/.test(lab.textContent.trim()) && lab.getBoundingClientRect().height > 1 };
    } else out.sayBand = null;
    // the stage around the cell (A22): the cell's top against the Steps', and how much of the stage neither covers
    {
        const stEl = r.querySelector('.mq-lp-stage');
        const sq = stEl.getBoundingClientRect();
        const scs = getComputedStyle(stEl);
        const L = sq.left + parseFloat(scs.paddingLeft), R = sq.right - parseFloat(scs.paddingRight);
        const T = sq.top + parseFloat(scs.paddingTop), B = sq.bottom - parseFloat(scs.paddingBottom);
        const area = (q) => Math.max(0, Math.min(q.right, R) - Math.max(q.left, L)) * Math.max(0, Math.min(q.bottom, B) - Math.max(q.top, T));
        const stp = r.querySelector('.mq-lp-steps');
        const pq = stp ? stp.getBoundingClientRect() : null;
        const fbs = [...r.querySelectorAll('.mq-lp-stage .mq-lp-fb')].filter((e) => e.offsetParent !== null).map((e) => e.getBoundingClientRect());
        out.stageEmpty = 1 - (area(cr) + (pq ? area(pq) : 0) + fbs.reduce((a, q) => a + area(q), 0)) / Math.max(1, (R - L) * (B - T));
        out.stageTopD = cr.top - T;
        out.cellOut = Math.max(0, sq.left - cr.left, cr.right - sq.right, sq.top - cr.top, cr.bottom - sq.bottom);
        if (pq) {
            const beside = pq.right <= cr.left + 1;
            const gapY = parseFloat(getComputedStyle(stEl).rowGap) || 0;
            out.align = beside ? { beside: true, d: cr.top - pq.top } : { beside: false, d: cr.top - (pq.bottom + gapY), gapY };
        }
    }
    // the count-on hops box against the drawing (A26): above, below or beside, in px
    {
        const hp = r.querySelector('.mq-lp-hops');
        const dr = r.querySelector('.mq-lp-draw');
        if (hp && dr && getComputedStyle(hp).display !== 'none') {
            const hq = hp.getBoundingClientRect(), dq = dr.getBoundingClientRect();
            // (rel*: from the cell's inner top, as bandAt / inkAt, for the A26b reserved room)
            if (hq.width > 1 && hq.height > 1) out.hops = { overlapX: Math.min(hq.right, dq.right) - Math.max(hq.left, dq.left), top: hq.top, bottom: hq.bottom, drawTop: dq.top, drawBottom: dq.bottom, relTop: hq.top - top, relBottom: hq.bottom - top, relDrawTop: dq.top - top, relDrawBottom: dq.bottom - top };
        }
    }
    out.draw = (r.querySelector('.mq-lp-draw') || {}).innerHTML || '';
    out.grey = !!r.querySelector('.mq-lp-draw :is([data-ws-ink="trace"], [data-ws-mark="trace"])') || [...r.querySelectorAll('.mq-lp-draw *')].some((e) => { const c = getComputedStyle(e); return c.color === 'rgb(148, 148, 148)' || (parseFloat(c.borderTopWidth) > 0 && c.borderTopColor === 'rgb(148, 148, 148)') || c.fill === 'rgb(148, 148, 148)' || c.stroke === 'rgb(148, 148, 148)' || /#949494/i.test(e.getAttribute('fill') || '') || /#949494/i.test(e.getAttribute('stroke') || ''); });
    return out;
}

/** Every black mark of the drawing (cell drawing + hops), keyed by kind + text + its nth occurrence (critic r1 F3). */
function inkMarksInPage() {
    const r = document.getElementById('mqLessonPlayer');
    const roots = [...r.querySelectorAll('.mq-lp-cell .mq-lp-draw, .mq-lp-cell .mq-lp-hops')];
    const BLACK = 'rgb(0, 0, 0)';
    const out = [];
    const seen = {};
    const add = (key, q) => { if (!(q.width > 0.5 || q.height > 0.5)) return; seen[key] = (seen[key] || 0) + 1; out.push({ key: `${key}#${seen[key]}`, x: q.left, y: q.top, w: q.width, h: q.height }); };
    for (const root of roots) {
        for (const el of root.querySelectorAll('*')) {
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            if (el instanceof SVGElement) {
                if (!['path', 'text', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline'].includes(el.tagName)) continue;
                const black = (cs.fill === BLACK && el.tagName !== 'line') || (cs.stroke === BLACK && parseFloat(cs.strokeWidth) > 0);
                if (black) add(`S:${el.tagName}:${(el.textContent || '').trim()}`, el.getBoundingClientRect());
                continue;
            }
            for (const c of el.childNodes) if (c.nodeType === 3 && c.nodeValue.trim() && cs.color === BLACK) { const rg = document.createRange(); rg.selectNodeContents(c); add(`T:${c.nodeValue.trim()}`, rg.getBoundingClientRect()); }
            for (const side of ['Top', 'Bottom', 'Left', 'Right']) if (parseFloat(cs[`border${side}Width`]) > 0 && cs[`border${side}Style`] !== 'none' && cs[`border${side}Color`] === BLACK) add(`B:${side}:${el.className && el.className.baseVal === undefined ? el.className : ''}`, el.getBoundingClientRect());
        }
    }
    return out;
}

/**
 * The dot card's place against the digits, on screen and on the printed chart panel of the same state (critic r1 F2): every
 * digit's centre from the card's centre, in card heights. The chart is drawn in its own document (sheetDocument: the
 * print stylesheet), so the check never borrows the player's CSS.
 */
async function cueVsChart(page, lesson) {
    return page.evaluate(async (lessonArg) => {
        const rel = (draw) => {
            const cue = draw && draw.querySelector('.mq-cue');
            if (!cue) return null;
            const cq = cue.getBoundingClientRect();
            const cx = cq.left + cq.width / 2, cy = cq.top + cq.height / 2;
            const out = {};
            const seen = {};
            const doc = draw.ownerDocument;
            const walker = doc.createTreeWalker(draw, NodeFilter.SHOW_TEXT);
            for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                const t = n.nodeValue.trim();
                if (!/^\d+$/.test(t) || n.parentElement.closest('.mq-cue, .mq-hops, .mq-chops, svg')) continue;
                const rg = doc.createRange(); rg.selectNodeContents(n);
                const q = rg.getBoundingClientRect();
                seen[t] = (seen[t] || 0) + 1;
                out[`${t}#${seen[t]}`] = [((q.left + q.width / 2) - cx) / cq.height, ((q.top + q.height / 2) - cy) / cq.height];
            }
            return out;
        };
        const P = await import('/js/modules/lesson-player/plan.js');
        const ps = await import('/js/modules/print-sheet.js');
        const st = window.lessonPlayerState();
        const id = P.resolveLessonId(lessonArg);
        const res = await ps.buildSheet(P.chartRequest(id, st.seed));
        const fr = document.createElement('iframe');
        fr.style.cssText = 'position:fixed;left:-5000px;top:0;width:900px;height:1300px;border:0;';
        document.body.appendChild(fr);
        await new Promise((ok) => { fr.onload = ok; fr.srcdoc = ps.sheetDocument(res.pupilHtml, 'chart'); });
        await new Promise((ok) => setTimeout(ok, 400));
        try { await fr.contentDocument.fonts.ready; } catch (e) { /* no fonts api */ }
        const panels = [...fr.contentDocument.querySelectorAll('.mq-cstate')].slice(0, st.steps).map((p) => rel(p.querySelector('.mq-cdraw')));
        const notes = [...fr.contentDocument.querySelectorAll('.mq-cnote')].map((e) => e.textContent.trim());
        fr.remove();
        return { panels, notes };
    }, lesson);
}
const cueOnScreen = (page) => page.evaluate(() => {
    const draw = document.querySelector('#mqLessonPlayer .mq-lp-cell .mq-lp-draw');
    const cue = draw && draw.querySelector('.mq-cue');
    if (!cue) return null;
    const cq = cue.getBoundingClientRect();
    const cx = cq.left + cq.width / 2, cy = cq.top + cq.height / 2;
    const out = {};
    const seen = {};
    const walker = document.createTreeWalker(draw, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const t = n.nodeValue.trim();
        if (!/^\d+$/.test(t) || n.parentElement.closest('.mq-cue, .mq-hops, .mq-chops, svg')) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        const q = rg.getBoundingClientRect();
        seen[t] = (seen[t] || 0) + 1;
        out[`${t}#${seen[t]}`] = [((q.left + q.width / 2) - cx) / cq.height, ((q.top + q.height / 2) - cy) / cq.height];
    }
    return out;
});

/** Ink never moves (F3), the dot card sits where the chart puts it (F2), every chart step note is on screen (F5). */
async function stillAndChart(w) {
    let h;
    try { h = await openPlayer(w); } catch (e) { fail('reveal', `${w}: the player did not open (${e.message.split('\n')[0]})`); return; }
    try {
        const { page } = h;
        const st = await state(page);
        const chart = await cueVsChart(page, LESSON);
        let prev = null;
        let moved = 0;
        let cueBad = 0;
        let cueSeen = 0;
        const shownNotes = [];
        for (let k = 0; k < st.steps; k++) {
            const marks = await page.evaluate(inkMarksInPage);
            if (prev) {
                const at = new Map(marks.map((m) => [m.key, m]));
                for (const m of prev) {
                    const n = at.get(m.key);
                    if (!n) continue;
                    if (Math.abs(n.x - m.x) > 1 || Math.abs(n.y - m.y) > 1) { moved++; if (moved <= 4) fail('reveal', `${w} step ${k} -> ${k + 1}: F3 black mark ${m.key} moved ${Math.round(n.x - m.x)}, ${Math.round(n.y - m.y)} px`); }
                }
            }
            prev = marks;
            const scr = await cueOnScreen(page);
            const pap = chart.panels[k];
            if (pap && !scr) { cueBad++; fail('reveal', `${w} step ${k + 1}: F2 the chart panel draws the dot card, the screen does not`); }
            if (pap && scr) {
                cueSeen++;
                for (const key of Object.keys(pap)) {
                    const a = pap[key], b = scr[key];
                    if (!b) continue;
                    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
                    if (d > 0.35) { cueBad++; fail('reveal', `${w} step ${k + 1}: F2 digit ${key} sits (${b.map((v) => v.toFixed(2)).join(', ')}) card heights from the dot card on screen, (${a.map((v) => v.toFixed(2)).join(', ')}) on the chart`); }
                }
            }
            shownNotes.push(await page.evaluate(() => (document.querySelector('#mqLessonPlayer .mq-lp-cell') || {}).textContent || ''));
            if (k < st.steps - 1) await press(page, 'ArrowRight');
        }
        if (!moved) ok('reveal', `${w}: F3 no black mark moved across ${st.steps} steps`);
        if (!cueBad && cueSeen) ok('reveal', `${w}: F2 the dot card sits where the chart puts it (${cueSeen} states)`);
        const missing = chart.notes.filter((n) => !shownNotes.some((t) => t.replace(/\s+/g, ' ').includes(n.replace(/\s+/g, ' '))));
        if (missing.length) fail('reveal', `${w}: F5 chart step note(s) not on screen: ${missing.map((n) => `"${n}"`).join(', ')}`);
        else ok('reveal', `${w}: F5 every chart step note on screen (${chart.notes.length})`);
    } finally { await h.close(); }
}

/** A22 (lf-hosts player critic r2 F1 / F2, root cause): the stage around the cell, the Say band, the digit window. */
function stageFill(tag, m, target) {
    const mode = 'render';
    if (!m.align) fail(mode, `${tag}: A22 no Steps strip to align the cell with`);
    else if (Math.abs(m.align.d) > 4) fail(mode, `${tag}: A22 F1 the cell top is ${m.align.d.toFixed(0)} px from ${m.align.beside ? "the Steps' top" : 'directly under the chip row'} (+-4)`);
    if (m.stageEmpty >= 0.30) fail(mode, `${tag}: A22 F1 ${(m.stageEmpty * 100).toFixed(1)} % of the stage is outside the cell and the Steps (< 30 %)`);
    if (m.cellOut > 1) fail(mode, `${tag}: A22 the cell runs ${m.cellOut.toFixed(0)} px past the stage`);
    if (m.mode === 'board' && m.digitPx > target * 1.25 + 1) fail(mode, `${tag}: A22 digits ${m.digitPx.toFixed(0)} px over 1.25 x the signed ${target} px`);
    if (m.mode === 'board' && m.digitPx < target - 1) fail(mode, `${tag}: A22 digits ${m.digitPx.toFixed(0)} px under the signed ${target} px`);
    const sb = m.sayBand;
    if (!sb || !sb.visible) fail(mode, `${tag}: A22 F2 no Say band (its frame and "Say:" label show from step 1)`);
    else {
        if (!sb.frame || !sb.label) fail(mode, `${tag}: A22 F2 the Say band lacks its ${!sb.frame ? 'frame (rule)' : '"Say:" label'}`);
        if (sb.ratio < 0.95) fail(mode, `${tag}: A22 F2 the Say band is ${(sb.ratio * 100).toFixed(1)} % of the cell's inner width (full width: >= 95 %)`);
        if (sb.top < sb.drawBottom - 1) fail(mode, `${tag}: A22 F2 the Say band starts ${(sb.drawBottom - sb.top).toFixed(0)} px above the drawing's foot (it sits below the drawing)`);
    }
}

/** A26 (lf-hosts player critic r3 F1): the hops never above the drawing, never within 0.5 digit of it in a shared column. */
function hopsBelow(tag, m) {
    const hp = m.hops;
    if (!hp) return;
    const d = m.digitPx * 0.5;
    if (hp.overlapX <= 0) return;
    if (hp.top < hp.drawTop) fail('render', `${tag}: A26 the count-on hops sit above the drawing (hops ${Math.round(hp.top)}-${Math.round(hp.bottom)} px, drawing from ${Math.round(hp.drawTop)} px, ${Math.round(hp.overlapX)} px of shared columns): they read as a top row of the sum`);
    else if (hp.top < hp.drawBottom + d - 0.5) fail('render', `${tag}: A26 the count-on hops start ${Math.round(hp.top - hp.drawBottom)} px under the drawing's foot in its columns (>= 0.5 digit, ${Math.round(d)} px)`);
}

/**
 * A26b (lead ruling 2026-11-20): the reserved room of the 820-portrait stacked I do - from the band's top (inside the drawing,
 * under its rule) to the hops' foot - and the band left with it inked; null anywhere else (another width, landscape, the
 * hops not under the drawing, a band that does not start in the drawing's answer row). Scoped here on purpose.
 */
function a26bReserved(w, m, last) {
    if (w !== 820 || HEIGHT(w) <= w || !m.hops || !last || !last.hops) return null;
    const hp = m.hops;
    const [a] = m.bandAt;
    if (hp.top < hp.drawBottom || a < hp.relDrawTop || a > hp.relDrawBottom) return null;
    const res = [a, hp.relBottom];
    const spans = [...m.inkAt, res].sort((x, y) => x[0] - y[0]);
    let cur = 0, gap = 0;
    for (const [p, q] of spans) { gap = Math.max(gap, p - cur); cur = Math.max(cur, q); }
    gap = Math.max(gap, m.cellH - cur);
    const hits = (lo, hi) => last.inkAt.some(([p, q]) => q > lo + 2 && p < hi - 2);
    const lastAns = hits(a, hp.relDrawBottom), lastHops = hits(hp.relTop, hp.relBottom);
    return { rest: m.cellH ? gap / m.cellH : 0, lastAns, lastHops, lastInks: lastAns && lastHops };
}

/** A22 minor 2: the "No such lesson" screen shows no orphan mode pill. */
async function unknownLessonPill() {
    const h = await H.open({ viewport: { width: 1280, height: 900 }, pagePath: `/index.html?lesson=${encodeURIComponent('no-such-lesson-x')}&mode=board`, lock: TOOL });
    try {
        try { await H.waitFor(h.page, () => !!document.querySelector('#mqLessonPlayer .mq-lp-stage-msg'), 15000, 'message stage'); } catch (e) { fail('render', 'A22 unknown lesson: no message stage'); return; }
        const pill = await h.page.evaluate(() => { const e = document.querySelector('#mqLessonPlayer .mq-lp-mode'); if (!e) return ''; const cs = getComputedStyle(e); return e.offsetParent !== null && cs.visibility !== 'hidden' && cs.display !== 'none' ? e.textContent.trim() : ''; });
        if (pill) fail('render', `A22 minor 2: the "No such lesson" screen shows an orphan "${pill}" mode pill`);
        else ok('render', 'A22: the "No such lesson" screen shows no mode pill');
    } finally { await h.close(); }
}

async function render() {
    for (const w of WIDTHS) {
        let h;
        try { h = await openPlayer(w); } catch (e) { fail('render', `${w}: the player did not open (${e.message.split('\n')[0]})`); continue; }
        try {
            const st = await state(h.page);
            const floor = Math.max(SW.DIGIT_FLOOR[w] || 56, 0);
            const ms = [];
            const bands = [];
            for (let k = 0; k < st.steps; k++) {
                const m = await h.page.evaluate(measureInPage);
                const tag = `${w} step ${k + 1}/${st.steps}`;
                if (m.hscroll) fail('render', `${tag}: horizontal scroll`);
                const min = m.mode === 'board' ? 64 : 48;
                const small = m.small.filter((b) => b.h < min - 0.5 || b.w < min - 0.5);
                if (small.length) fail('render', `${tag}: controls under ${min} px: ${small.map((b) => `${b.t} ${Math.round(b.w)}x${Math.round(b.h)}`).join(', ')}`);
                if (m.emoji.length) fail('render', `${tag}: emoji in the player: ${m.emoji.join(' ')}`);
                if (!m.cell) { fail('render', `${tag}: no screen cell`); continue; }
                if (m.clip > 1) fail('render', `${tag}: the cell runs ${m.clip} px past the stage (clipped under the bar)`);
                if (m.badInk.length) fail('render', `${tag}: cell ink not #000/#fff/#949494: ${m.badInk.join(', ')}`);
                if (m.fonts.some((f) => !/^Andika$/i.test(f))) fail('render', `${tag}: non-Andika type in the cell: ${m.fonts.join(', ')}`);
                ms.push(m);
                if (m.band >= 0.30) bands.push({ k, tag, m });
                if (m.stepsFoot !== undefined && m.stepsFoot > 6) fail('render', `${tag}: H13 the Steps column has ${Math.round(m.stepsFoot)} px empty under its last row`);
                const target = DIGIT_TARGET(w);
                if (m.digitPx < floor) fail('render', `${tag}: digits ${m.digitPx.toFixed(0)} px under the ${floor} px floor`);
                if (m.mode === 'board' && m.digitPx < target - 1) fail('render', `${tag}: F4 board digits ${m.digitPx.toFixed(0)} px under the signed ${target} px`);
                if (!m.leave) fail('render', `${tag}: F1 no visible Leave control`);
                else if (m.leave.w < min - 0.5 || m.leave.h < min - 0.5) fail('render', `${tag}: F1 Leave ${Math.round(m.leave.w)}x${Math.round(m.leave.h)} under ${min} px`);
                if (m.stageBandY >= 0.30 || m.stageBandX >= 0.30) fail('render', `${tag}: F4 stage H13 empty band ${(Math.max(m.stageBandY, m.stageBandX) * 100).toFixed(1)} % of the stage (rows ${(m.stageBandY * 100).toFixed(1)} %, columns ${(m.stageBandX * 100).toFixed(1)} %)`);
                if (k > 0 && ms[0] && Math.abs(ms[0].cellH - m.cellH) > 1) fail('render', `${tag}: F4 the cell is ${m.cellH} px tall, ${ms[0].cellH} px at step 1 (the cell grows: fix it at its largest state)`);
                if (A22) stageFill(tag, m, target);
                if (A26) hopsBelow(tag, m);
                console.log(`       ${tag}: band ${(m.band * 100).toFixed(1)} %, stage band ${(Math.max(m.stageBandY, m.stageBandX) * 100).toFixed(1)} %, steps foot ${Math.round(m.stepsFoot || 0)} px, cell ${m.cellH} px, digits ${m.digitPx.toFixed(0)} px (target ${target})${A22 ? `, stage empty ${(m.stageEmpty * 100).toFixed(1)} %, cell top ${m.align ? `${m.align.beside ? 'vs Steps top' : 'under chips'} ${m.align.d.toFixed(1)}` : '-'} px, Say ${m.sayBand ? `${(m.sayBand.ratio * 100).toFixed(1)} % wide` : 'none'}` : ''}`);
                if (SHOTS) { mkdirSync(SHOTS, { recursive: true }); await h.page.screenshot({ path: join(SHOTS, `ido-board-${w}-step${k + 1}.png`) }); }
                if (k < st.steps - 1) await press(h.page, 'ArrowRight');
            }
            // H13, with PT-MOD-3 (lead ruling 2026-11-12, as ws-empty-band reads a Scripted Model): a state that is not the last
            // is excused when its band is <= 35 % AND a later state draws ink in that band (the room kept for a later mark: the
            // cell is top-aligned at one zoom, so a later mark lands where the band is). The last state is never excused.
            // PT-MOD-3 + A22 (lead 2026-11-20): the full-width Say band shows its frame and "Say:" label from step 1 with its line
            // empty; that line's room, inked after the last step, is reserved room a later step inks - not an empty band.
            for (const { k, tag, m } of bands) {
                const later = ms.slice(k + 1);
                const [a, b] = m.bandAt;
                const inked = later.some((x) => x.inkAt.some(([p, q]) => q > a + 2 && p < b - 2));
                if (k < ms.length - 1 && m.band <= 0.35 && inked) { notes.push(`${tag}: band ${(m.band * 100).toFixed(1)} % excused (PT-MOD-3: a later step inks it)`); continue; }
                // A26b (lead ruling 2026-11-20, as A22(a)): ONLY in this player at 820 portrait, where A26 puts the hops under the
                // answer row, the answer row plus the hops' room below it is reserved room later steps ink, not an empty band:
                // the band with that room taken out stays <= 35 %, with it <= 47 %, and the LAST step inks all of it (both the
                // answer row and the hops). Never at another width, never outside ws-lesson-player.
                const res = a26bReserved(w, m, ms[ms.length - 1]);
                if (k < ms.length - 1 && res && m.band <= 0.47 && res.rest <= 0.35) {
                    if (!res.lastInks) fail('render', `${tag}: A26b the last step does not ink all of the reserved room (answer row ${res.lastAns ? 'inked' : 'EMPTY'}, hops ${res.lastHops ? 'inked' : 'EMPTY'})`);
                    else notes.push(`${tag}: band ${(m.band * 100).toFixed(1)} % excused (A26b, 820 portrait only: the answer row + the hops' room below it is reserved room the last step inks; ${(res.rest * 100).toFixed(1)} % without it)`);
                    continue;
                }
                fail('render', `${tag}: H13 empty band ${(m.band * 100).toFixed(1)} % of the cell (${m.cellH} px)`);
            }
            if (SHOTS) {
                // the part bar after a jump (I do -> You do -> back to I do keeps its step)
                await h.page.click('.mq-lp-pill[data-part="youdo"]');
                await new Promise((r) => setTimeout(r, 150));
                await h.page.screenshot({ path: join(SHOTS, `partbar-jump-youdo-${w}.png`) });
                await h.page.click('.mq-lp-pill[data-part="ido"]');
                await new Promise((r) => setTimeout(r, 150));
                await h.page.screenshot({ path: join(SHOTS, `partbar-back-ido-${w}.png`) });
            }
            if (h.problems.length) fail('render', `${w}: console errors: ${h.problems.map((p) => p.text).join(' | ').slice(0, 300)}`);
            ok('render', `${w}: ${st.steps} steps measured`);
        } finally { await h.close(); }
    }
    if (A22) notes.push('PT-MOD-3 (A22, lead 2026-11-20): the Say band (full width under the cell) shows its frame and "Say:" label from step 1; its empty line is reserved room the last step inks, not an empty band');
    if (A22) await unknownLessonPill();
}

async function reveal() {
    let h;
    try { h = await openPlayer(1280); } catch (e) { fail('reveal', `the player did not open (${e.message.split('\n')[0]})`); return; }
    try {
        const { page } = h;
        const st0 = await state(page);
        const n = st0.steps;
        const draws = [];
        const nextKeys = ['ArrowRight', 'Space', 'PageDown'];
        for (let k = 0; k < n; k++) {
            const m = await page.evaluate(measureInPage);
            draws.push(m.draw);
            if (!m.grey) fail('reveal', `step ${k + 1}: no grey (newest) mark (P-LC-9)`);
            const last = k === n - 1;
            if (!last && m.say) fail('reveal', `step ${k + 1}: the Say band shows before the last step`);
            if (last && m.say.replace(/\s+/g, ' ').trim() !== `Say: ${st0.say}`) fail('reveal', `last step: Say band "${m.say.trim()}" != "Say: ${st0.say}"`);
            if (A22) {
                const sb = m.sayBand;
                if (!sb || !sb.visible || !sb.frame || !sb.label) fail('reveal', `step ${k + 1}: A22 F2 the Say band's frame and "Say:" label are not shown (they show from step 1)`);
                if (!last && m.sayLine) fail('reveal', `step ${k + 1}: A22 the Say line "${m.sayLine}" shows before the last step`);
            }
            await press(page, 'r');
            const s = await state(page);
            const words = await page.evaluate(() => (document.querySelector('.mq-lp-words') || {}).textContent || '');
            const want = [words, last ? `Say: ${st0.say}` : ''].filter(Boolean).join(' ');
            if (s.spoke !== want) fail('reveal', `step ${k + 1}: R read "${s.spoke}" not "${want}"`);
            if (s.step !== k) fail('reveal', `step ${k + 1}: state says step ${s.step + 1}`);
            if (!last) await press(page, nextKeys[k % nextKeys.length]);
        }
        if (new Set(draws).size !== n) fail('reveal', `${n} reveals drew ${new Set(draws).size} distinct states`);
        else ok('reveal', `${n} reveals = ${n} distinct cell states, each with its grey newest mark; Say only after the last${A22 ? ' (A22: its frame and label from step 1)' : ''}`);
        // Back restores (Left, then PageUp)
        const backKeys = ['ArrowLeft', 'PageUp'];
        for (let k = n - 1; k > 0; k--) {
            await press(page, backKeys[k % 2]);
            const d = await page.evaluate(() => document.querySelector('.mq-lp-draw').innerHTML);
            if (d !== draws[k - 1]) fail('reveal', `Back to step ${k}: the drawing is not step ${k}'s`);
        }
        ok('reveal', 'Back (Left / PageUp) restores every earlier state; Next on Right / Space / PageDown; R reads the step');
        // the last step's Next moves to the next part; Esc leaves
        for (let k = 0; k < n; k++) await press(page, 'ArrowRight');
        const s2 = await state(page);
        if (s2.part !== 'wedo') fail('reveal', `Next after the last step went to ${s2.part}, not We do`);
        await press(page, 'Escape');
        const gone = await page.evaluate(() => !document.getElementById('mqLessonPlayer') && !/lesson=/.test(location.search));
        if (!gone) fail('reveal', 'Esc did not leave the player'); else ok('reveal', 'Next after the last step -> We do; Esc leaves (URL cleaned)');
        if (h.problems.length) fail('reveal', `console errors: ${h.problems.map((p) => p.text).join(' | ').slice(0, 300)}`);
    } finally { await h.close(); }
    for (const w of [1280, BOARD_W, 820]) await stillAndChart(w);
}

const leaveBox = (page) => page.evaluate(() => {
    const b = document.querySelector('#mqLessonPlayer [data-act="leave"]');
    if (!b || b.offsetParent === null || getComputedStyle(b).visibility === 'hidden') return null;
    const q = b.getBoundingClientRect();
    return { w: q.width, h: q.height };
});

/**
 * Critic r1 F1 (Leave on every stage, closing like Esc; the message stage leaves no dead pills), F6 (the lesson name as
 * typed, escaped once), F7 (mode=pupil: not built, so Board with no Pupil pill), F8 (the I do tick only after its last step).
 */
async function leaveAndMarks() {
    const leaveOk = async (page, tag, minPx) => {
        const b = await leaveBox(page);
        if (!b) { fail('leave', `${tag}: F1 no visible Leave control`); return false; }
        if (b.w < minPx - 0.5 || b.h < minPx - 0.5) fail('leave', `${tag}: F1 Leave ${Math.round(b.w)}x${Math.round(b.h)} under ${minPx} px`);
        return true;
    };
    // every built / not-yet-built part stage, at the board (64) and on a tablet (48)
    for (const [w, minPx] of [[1280, 64], [820, 48]]) {
        let h;
        try { h = await openPlayer(w, 'ido'); } catch (e) { fail('leave', `${w}: the player did not open`); continue; }
        try {
            const { page } = h;
            for (const part of ['warmup', 'ido', 'wedo', 'youdo', 'exit']) {
                await page.click(`.mq-lp-pill[data-part="${part}"]`);
                await new Promise((r) => setTimeout(r, 100));
                await leaveOk(page, `${w} ${part}`, minPx);
            }
            await page.click('.mq-lp-pill[data-part="ido"]');
            await new Promise((r) => setTimeout(r, 100));
            if (await leaveBox(page)) {
                await page.click('#mqLessonPlayer [data-act="leave"]');
                await new Promise((r) => setTimeout(r, 200));
                const gone = await page.evaluate(() => !document.getElementById('mqLessonPlayer') && !/lesson=/.test(location.search) && !document.body.classList.contains('mq-lp-open'));
                if (!gone) fail('leave', `${w}: F1 Leave did not close the player (as Esc does)`);
                else ok('leave', `${w}: F1 Leave on every part stage (>= ${minPx} px); Leave closes the player`);
            }
        } finally { await h.close(); }
    }
    // the "No such lesson" stage: Leave shown, no dead pills, the typed name shown literally (escaped once)
    {
        const raw = '<b>x';
        const h = await H.open({ viewport: { width: 1280, height: 900 }, pagePath: `/index.html?lesson=${encodeURIComponent(raw)}&mode=board`, lock: TOOL });
        try {
            const { page } = h;
            try { await H.waitFor(page, () => !!document.querySelector('#mqLessonPlayer .mq-lp-stage-msg'), 15000, 'message stage'); } catch (e) { fail('leave', 'unknown lesson: no message stage'); }
            const m = await page.evaluate((rawArg) => {
                const r = document.getElementById('mqLessonPlayer');
                if (!r) return null;
                const msg = r.querySelector('.mq-lp-stage').textContent;
                const live = [...r.querySelectorAll('.mq-lp-pill')].filter((b) => b.offsetParent !== null && getComputedStyle(b).visibility !== 'hidden' && !b.disabled);
                return { literal: msg.includes(`“${rawArg}”`), entity: /&lt;|&gt;|&amp;/.test(msg), injected: !!r.querySelector('.mq-lp-stage b'), livePills: live.length, msg: msg.trim().slice(0, 120) };
            }, raw);
            if (!m) fail('leave', 'unknown lesson: no player');
            else {
                if (!m.literal || m.entity || m.injected) fail('leave', `F6 unknown lesson name not shown literally: "${m.msg}"`);
                else ok('leave', `F6 the unknown lesson name shows literally ("${raw}"), escaped once, no markup`);
                if (m.livePills) fail('leave', `F1 the message stage shows ${m.livePills} live part pills that do nothing`);
            }
            if (await leaveOk(page, 'unknown lesson', 64)) {
                await page.click('#mqLessonPlayer [data-act="leave"]');
                await new Promise((r) => setTimeout(r, 200));
                if (await page.evaluate(() => !!document.getElementById('mqLessonPlayer'))) fail('leave', 'F1 Leave did not close the "No such lesson" stage');
                else ok('leave', 'F1 the "No such lesson" stage: Leave shown and closes it; no dead pills');
            }
        } finally { await h.close(); }
    }
    // mode=pupil (not built in slice 1): Board, with no Pupil pill
    {
        let h;
        try { h = await openPlayer(1280, 'ido', '&mode=pupil'); } catch (e) { fail('leave', 'mode=pupil: the player did not open'); h = null; }
        if (h) {
            try {
                const m = await h.page.evaluate(() => { const r = document.getElementById('mqLessonPlayer'); return { mode: r.dataset.mode, pill: (r.querySelector('.mq-lp-mode') || {}).textContent || '', url: location.search }; });
                if (S2) {
                    // (slice 2 builds pupil mode: mode=pupil opens it, and says so)
                    if (m.mode !== 'pupil' || !/pupil/i.test(m.pill) || !/mode=pupil/.test(m.url)) fail('leave', `S2 mode=pupil opened the ${m.mode} layout (pill "${m.pill}", url ${m.url})`);
                    else ok('leave', 'S2 mode=pupil opens pupil mode (Pupil pill, the URL keeps mode=pupil)');
                } else if (m.mode !== 'board' || /pupil/i.test(m.pill)) fail('leave', `F7 mode=pupil shows "${m.pill}" in the ${m.mode} layout (pupil mode is not built: Board, no Pupil pill)`);
                else ok('leave', 'F7 mode=pupil opens the Board (pupil mode not built), no Pupil pill');
            } finally { await h.close(); }
        }
    }
    // the I do tick only after its last step has been reached
    {
        let h;
        try { h = await openPlayer(1280, 'ido'); } catch (e) { fail('leave', 'tick: the player did not open'); h = null; }
        if (h) {
            try {
                const { page } = h;
                const tick = () => page.evaluate(() => { const b = document.querySelector('.mq-lp-pill[data-part="ido"]'); return /\u2713/.test(b.textContent) || b.classList.contains('is-done'); });
                await page.click('.mq-lp-pill[data-part="wedo"]');
                await new Promise((r) => setTimeout(r, 100));
                const early = await tick();
                await page.click('.mq-lp-pill[data-part="ido"]');
                await new Promise((r) => setTimeout(r, 100));
                const st = await state(page);
                for (let k = 0; k < st.steps - 1; k++) await press(page, 'ArrowRight');
                await page.click('.mq-lp-pill[data-part="wedo"]');
                await new Promise((r) => setTimeout(r, 100));
                const late = await tick();
                if (early) fail('leave', 'F8 the I do pill shows its tick after a visit that never reached the last step');
                if (!late) fail('leave', 'F8 the I do pill shows no tick after its last step was reached');
                if (!early && late) ok('leave', 'F8 the I do tick appears only once its last step has been reached');
            } finally { await h.close(); }
        }
    }
}

async function anyPart() {
    const parts = ['warmup', 'ido', 'wedo', 'youdo', 'exit'];
    for (const part of parts) {
        let h;
        try { h = await openPlayer(1280, part); } catch (e) { fail('any-part', `?part=${part}: the player did not open (${e.message.split('\n')[0]})`); continue; }
        try {
            const { page } = h;
            const s = await state(page);
            const cur = await page.evaluate(() => (document.querySelector('.mq-lp-pill[aria-current]') || {}).dataset?.part || '');
            const shows = await page.evaluate(() => (document.querySelector('.mq-lp-cell') ? 'cell' : document.querySelector('[data-soon]') && document.querySelector('.mq-lp-stage [data-soon]') ? 'soon' : 'none'));
            const want = part === 'ido' || (S2 && (part === 'warmup' || part === 'wedo')) ? 'cell' : 'soon';
            if (s.part !== part || cur !== part || shows !== want) fail('any-part', `?part=${part} opened ${s.part} (bar ${cur}, stage ${shows})`);
            // the part bar jumps to every other part; the URL follows
            for (const to of parts.filter((x) => x !== part)) {
                await page.click(`.mq-lp-pill[data-part="${to}"]`);
                await new Promise((r) => setTimeout(r, 100));
                const t = await state(page);
                const url = await page.evaluate(() => new URLSearchParams(location.search).get('part'));
                if (t.part !== to || url !== to) fail('any-part', `from ${part}: the part bar did not jump to ${to} (state ${t.part}, url ${url})`);
            }
            if (h.problems.length) fail('any-part', `?part=${part}: console errors: ${h.problems.map((p) => p.text).join(' | ').slice(0, 300)}`);
        } finally { await h.close(); }
    }
    // Next / Back across parts, through a not-yet-built part, and the I do place kept for the session
    let h;
    try { h = await openPlayer(1280, 'warmup'); } catch (e) { fail('any-part', 'warmup did not open'); return; }
    try {
        const { page } = h;
        // (S2: Next steps through the Warm-up's items first, as through the I do's steps)
        if (S2) { const w0 = await state(page); for (let i = 1; i < (w0.items || 1); i++) await press(page, 'ArrowRight'); }
        await press(page, 'ArrowRight');
        let s = await state(page);
        if (s.part !== 'ido' || s.step !== 0) fail('any-part', `Next from Warm-up went to ${s.part} step ${s.step + 1}`);
        await press(page, 'ArrowRight');
        await page.click('.mq-lp-pill[data-part="exit"]');
        await new Promise((r) => setTimeout(r, 100));
        await press(page, 'ArrowLeft');
        s = await state(page);
        if (s.part !== 'youdo') fail('any-part', `Back from Exit ticket went to ${s.part}`);
        await page.click('.mq-lp-pill[data-part="ido"]');
        await new Promise((r) => setTimeout(r, 100));
        s = await state(page);
        if (s.part !== 'ido' || s.step !== 1) fail('any-part', `a jump back to I do did not keep its step (step ${s.step + 1}, want 2)`);
        ok('any-part', 'PLAYER-ANY-PART: every part opens by ?part=, the part bar jumps to every part (URL follows), Next / Back cross parts, I do keeps its step');
    } finally { await h.close(); }
    notes.push('PLAYER-ANY-PART packet page ids (anchor chart, Guided, Independent ...): slice 4, not in slice 1');
}


/* ================================================================ slice 2: Warm-up + We do, both modes (S2) */
const PUPIL_DIGIT = (w) => (w >= 1200 ? 56 : 48);
const targetOf = (w, mode) => (mode === 'pupil' ? PUPIL_DIGIT(w) : DIGIT_TARGET(w));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const gotoPart = async (page, part) => { await page.click(`.mq-lp-pill[data-part="${part}"]`); await sleep(160); };
/** Press a presenter-bar control by its act (a hidden or disabled one is a miss: false). */
const act = async (page, a) => { const okd = await page.evaluate((x) => { const b = document.querySelector(`#mqLessonPlayer .mq-lp-bar [data-act="${x}"]`); if (!b || b.disabled || b.hidden || b.offsetParent === null) return false; b.click(); return true; }, a); await sleep(160); return okd; };
const inputsOf = (page) => page.evaluate(() => [...document.querySelectorAll('#mqLessonPlayer .mq-lp-cell input')].map((i) => i.value));
/** Type an answer into the cell's boxes, right-aligned (one box: the whole answer), as the pupil does. */
const fillAns = (page, v) => page.evaluate((val) => {
    const ins = [...document.querySelectorAll('#mqLessonPlayer .mq-lp-cell input')];
    const d = String(val);
    const set = (e, x) => { e.value = x; e.dispatchEvent(new Event('input', { bubbles: true })); };
    if (ins.length === 1) { set(ins[0], d); return ins.length; }
    const pad = ins.length - d.length;
    ins.forEach((e, i) => set(e, i >= pad ? d.charAt(i - pad) : ''));
    return ins.length;
}, v);
/** The live per-digit marks (SP-31): each box's data-mq-lp ('ok' / 'bad' / ''), and a badge drawn for each mark. */
const liveMarks = (page) => page.evaluate(() => [...document.querySelectorAll('#mqLessonPlayer .mq-lp-cell input')].map((i) => ({ v: i.value, mark: i.dataset.mqLp || '', badge: !!(i.parentElement && i.parentElement.querySelector(`[data-ws-feedback][data-for="${i.id}"]`)) })));
const greyCount = (page) => page.evaluate(() => [...document.querySelectorAll('#mqLessonPlayer .mq-lp-draw *')].filter((e) => !e.closest('[data-ws-feedback]')).filter((e) => { const c = getComputedStyle(e); return e.matches('[data-ws-ink="trace"], [data-ws-mark="trace"]') || c.color === 'rgb(148, 148, 148)' && [...e.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim()) || c.fill === 'rgb(148, 148, 148)' || c.stroke === 'rgb(148, 148, 148)'; }).length);

/** One measured item state (Warm-up / We do / pupil I do), judged against slice 2's contract. */
function checkS2(tag, m, w, mode, part) {
    const mode0 = 'render';
    if (m.hscroll) fail(mode0, `${tag}: horizontal scroll`);
    const min = mode === 'board' ? 64 : 48;
    const small = m.small.filter((b) => b.h < min - 0.5 || b.w < min - 0.5);
    if (small.length) fail(mode0, `${tag}: targets under ${min} px: ${small.map((b) => `${b.t} ${Math.round(b.w)}x${Math.round(b.h)}`).join(', ')}`);
    if (m.emoji.length) fail(mode0, `${tag}: emoji in the player: ${m.emoji.join(' ')}`);
    if (!m.cell) { fail(mode0, `${tag}: no screen cell`); return; }
    if (m.part !== part) fail(mode0, `${tag}: the stage shows ${m.part}, not ${part}`);
    if (m.clip > 1) fail(mode0, `${tag}: the cell runs ${m.clip} px past the stage`);
    if (m.badInk.length) fail(mode0, `${tag}: cell ink not #000/#fff/#949494: ${m.badInk.join(', ')}`);
    if (m.fonts.some((f) => !/^Andika$/i.test(f))) fail(mode0, `${tag}: non-Andika type in the cell: ${m.fonts.join(', ')}`);
    if (m.band >= 0.30) fail(mode0, `${tag}: H13 empty band ${(m.band * 100).toFixed(1)} % of the cell (${m.cellH} px)`);
    if (m.stepsFoot !== undefined && m.stepsFoot > 6) fail(mode0, `${tag}: H13 the Steps column has ${Math.round(m.stepsFoot)} px empty under its last row`);
    const t = targetOf(w, mode);
    // (card §3: "a drawing too big for the stage takes the whole stage" - under the signed size only when the drawing already
    // fills its work area's height or width, so no room was left; reported as a note, never silently)
    const full = m.drawFill && (m.drawFill.h >= 0.9 || m.drawFill.w >= 0.9);
    if (m.digitPx < t - 1 && full) notes.push(`${tag}: digits ${m.digitPx.toFixed(0)} px under the signed ${t} px - the drawing takes the whole stage (${(m.drawFill.h * 100).toFixed(0)} % of the height, ${(m.drawFill.w * 100).toFixed(0)} % of the width)`);
    else if (m.digitPx < t - 1) fail(mode0, `${tag}: digits ${m.digitPx.toFixed(0)} px under the signed ${t} px`);
    if (m.digitPx > t * 1.25 + 1) fail(mode0, `${tag}: digits ${m.digitPx.toFixed(0)} px over 1.25 x the signed ${t} px`);
    if (!m.leave) fail(mode0, `${tag}: no visible Leave control`);
    else if (m.leave.w < min - 0.5 || m.leave.h < min - 0.5) fail(mode0, `${tag}: Leave ${Math.round(m.leave.w)}x${Math.round(m.leave.h)} under ${min} px`);
    if (m.stageEmpty >= 0.30) fail(mode0, `${tag}: ${(m.stageEmpty * 100).toFixed(1)} % of the stage is outside the cell and the Steps (< 30 %)`);
    if (m.cellOut > 1) fail(mode0, `${tag}: the cell runs ${m.cellOut.toFixed(0)} px past the stage`);
    if (m.align) { if (Math.abs(m.align.d) > 4) fail(mode0, `${tag}: the cell top is ${m.align.d.toFixed(0)} px from ${m.align.beside ? "the Steps' top" : 'directly under the chip row'} (+-4)`); }
    else if (Math.abs(m.stageTopD) > 4) fail(mode0, `${tag}: the cell top is ${m.stageTopD.toFixed(0)} px under the stage's top (+-4)`);
    console.log(`       ${tag}: band ${(m.band * 100).toFixed(1)} %, stage empty ${(m.stageEmpty * 100).toFixed(1)} %, cell ${m.cellH} px, digits ${m.digitPx.toFixed(0)} px (signed ${t})`);
}

async function shotS2(page, w, mode, name) {
    if (!SHOTS) return;
    if (!((mode === 'board' && (w === 1920 || w === 1280)) || (mode === 'pupil' && (w === 1024 || w === 820)))) return;
    mkdirSync(SHOTS, { recursive: true });
    await page.screenshot({ path: join(SHOTS, `${name}.png`) });
}

async function renderS2() {
    for (const mode of ['board', 'pupil']) {
        for (const w of WIDTHS) {
            let h;
            try { h = await openPlayer(w, 'warmup', `&mode=${mode}`); } catch (e) { fail('render', `S2 ${mode} ${w}: the player did not open (${e.message.split('\n')[0]})`); continue; }
            try {
                const { page } = h;
                const st0 = await state(page);
                if (st0.mode !== mode) fail('render', `S2 ${w}: mode=${mode} opened ${st0.mode}`);
                const parts = mode === 'pupil' ? ['ido', 'warmup', 'wedo'] : ['warmup', 'wedo'];
                for (const part of parts) {
                    await gotoPart(page, part);
                    let st = await state(page);
                    if (st.part !== part) { fail('render', `S2 ${mode} ${w}: ${part} did not open`); continue; }
                    if (part === 'ido') {
                        for (let k = 0; k < st.steps; k++) {
                            const m = await page.evaluate(measureInPage);
                            checkS2(`${mode} ${w} ido step ${k + 1}/${st.steps}`, m, w, mode, part);
                            await shotS2(page, w, mode, `ido-${mode}-${w}-step${k + 1}`);
                            if (k < st.steps - 1) await press(page, 'ArrowRight');
                        }
                        continue;
                    }
                    const n = st.items || 0;
                    if (!n) { fail('render', `S2 ${mode} ${w}: ${part} has no items`); continue; }
                    for (let i = 0; i < n; i++) {
                        st = await state(page);
                        if (st.item !== i) fail('render', `S2 ${mode} ${w} ${part}: expected item ${i + 1}, at ${st.item + 1}`);
                        if (part === 'warmup') {
                            const m = await page.evaluate(measureInPage);
                            checkS2(`${mode} ${w} warmup item ${i + 1}/${n}`, m, w, mode, part);
                            await shotS2(page, w, mode, `warmup-${mode}-${w}-item${i + 1}`);
                        } else {
                            let cellH = null;
                            for (let guard = 0; guard < 4; guard++) {
                                st = await state(page);
                                const m = await page.evaluate(measureInPage);
                                checkS2(`${mode} ${w} wedo item ${i + 1}/${n} rung ${st.rung}`, m, w, mode, part);
                                if (cellH !== null && Math.abs(cellH - m.cellH) > 1) fail('render', `S2 ${mode} ${w} wedo item ${i + 1}: the cell is ${m.cellH} px at rung ${st.rung}, ${cellH} px before (it must not jump between rungs)`);
                                cellH = m.cellH;
                                await shotS2(page, w, mode, `wedo-${mode}-${w}-item${i + 1}-rung${st.rung}`);
                                if (st.rung <= 1) break;
                                if (!(await act(page, 'hint'))) { fail('render', `S2 ${mode} ${w} wedo item ${i + 1}: no Hint control at rung ${st.rung}`); break; }
                            }
                        }
                        if (i < n - 1 && !(await act(page, 'next'))) fail('render', `S2 ${mode} ${w} ${part}: no Next to item ${i + 2}`);
                    }
                }
                if (h.problems.length) fail('render', `S2 ${mode} ${w}: console errors: ${h.problems.map((p) => p.text).join(' | ').slice(0, 300)}`);
                ok('render', `S2 ${mode} ${w}: ${parts.join(', ')} measured`);
            } finally { await h.close(); }
        }
    }
}

async function hintsS2() {
    const M = 'hints';
    // PUPIL: the rung follows the pupil (P-ON-7), Hint never writes (P-ON-8), live per-digit marks (SP-31), ink still
    {
        let h;
        try { h = await openPlayer(1280, 'wedo', '&mode=pupil'); } catch (e) { fail(M, `pupil We do did not open (${e.message.split('\n')[0]})`); h = null; }
        if (h) try {
            const { page } = h;
            let st = await state(page);
            if (st.items < 2 || st.items > 3) fail(M, `We do has ${st.items} items (2-3)`);
            const plan = st.plan && st.plan.wedo;
            if (!plan || plan.some((it, i) => it.rung !== Math.min(3, i + 1))) fail(M, `the plan's rungs are ${plan ? plan.map((x) => x.rung).join(',') : '-'} (1, 2, 3)`);
            // item 1 at rung 1: grey working + the next step's sentence; Hint at rung 1 writes nothing
            if (st.rung !== 1) fail(M, `item 1 opens at rung ${st.rung}, not 1`);
            if (!(await greyCount(page))) fail(M, 'rung 1: no grey working marks in the cell');
            if (!st.words || st.words !== st.nextSentence) fail(M, `rung 1: the words "${st.words}" are not the next step's sentence "${st.nextSentence}"`);
            await press(page, 'h');
            if ((await inputsOf(page)).some(Boolean)) fail(M, 'P-ON-8: a hint wrote into an answer box (item 1)');
            // a right answer: every typed box marked right, live
            await fillAns(page, st.itemAns);
            let lm = await liveMarks(page);
            if (lm.filter((x) => x.v).some((x) => x.mark !== 'ok' || !x.badge)) fail(M, `SP-31: the right answer ${st.itemAns} is not marked right per digit, live (${JSON.stringify(lm)})`);
            await act(page, 'check');
            st = await state(page);
            if (st.checked !== 'right') fail(M, `Check on the right answer: ${st.checked}`);
            await act(page, 'next');
            st = await state(page);
            if (st.item !== 1 || st.rung !== 2) fail(M, `after a right item 1: item ${st.item + 1} at rung ${st.rung} (want item 2 at rung 2)`);
            if (!st.words || st.words !== st.nextSentence) fail(M, `rung 2: the words "${st.words}" are not the next step's sentence`);
            const g2 = await greyCount(page);
            const ink2 = await page.evaluate(inkMarksInPage);
            // a wrong answer: the wrong digit marked live; Check keeps the rung
            const wrong = String(Number(st.itemAns) + 1);
            await fillAns(page, wrong);
            lm = await liveMarks(page);
            if (!lm.some((x) => x.mark === 'bad' && x.badge)) fail(M, `SP-31: the wrong answer ${wrong} shows no live wrong-digit mark (${JSON.stringify(lm)})`);
            if (SHOTS) { mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: join(SHOTS, 'wedo-pupil-1280-wrong-live.png') }); }
            await act(page, 'check');
            if (SHOTS) await page.screenshot({ path: join(SHOTS, 'wedo-pupil-1280-wrong-checked.png') });
            st = await state(page);
            if (st.checked !== 'wrong' || st.rung !== 2) fail(M, `a wrong Check: ${st.checked}, rung ${st.rung} (want wrong, rung kept at 2)`);
            const before = await inputsOf(page);
            await act(page, 'hint');
            st = await state(page);
            const after = await inputsOf(page);
            if (st.rung !== 1) fail(M, `Hint at rung 2 opened rung ${st.rung} (want 1)`);
            if (JSON.stringify(before) !== JSON.stringify(after)) fail(M, `P-ON-8: Hint changed the answer boxes ${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
            if (!((await greyCount(page)) > g2)) fail(M, 'rung 1 (after Hint) draws no more grey working than rung 2');
            const ink1 = await page.evaluate(inkMarksInPage);
            const at = new Map(ink1.map((x) => [x.key, x]));
            const moved = ink2.filter((x) => { const y = at.get(x.key); return y && (Math.abs(y.x - x.x) > 1 || Math.abs(y.y - x.y) > 1); });
            if (moved.length) fail(M, `ink-still: ${moved.length} black mark(s) moved between rung 2 and rung 1 (${moved[0].key})`);
            await fillAns(page, st.itemAns);
            await act(page, 'check');
            await act(page, 'next');
            st = await state(page);
            if (st.items === 3) {
                if (st.item !== 2 || st.rung !== 3) fail(M, `after a right item 2: item ${st.item + 1} at rung ${st.rung} (want item 3 at rung 3)`);
                const hl = await page.evaluate(() => { const e = document.querySelector('#mqLessonPlayer .mq-lp-steps .mq-lp-step.is-now'); return e ? e.textContent.trim() : ''; });
                if (st.words !== 'What comes next?' || !hl) fail(M, `rung 3: words "${st.words}", highlighted Steps row "${hl}" (want "What comes next?" and the next step's row)`);
            }
            if (h.problems.length) fail(M, `pupil: console errors: ${h.problems.map((p) => p.text).join(' | ').slice(0, 300)}`);
        } finally { await h.close(); }
    }
    // PUPIL: a wrong item keeps the rung for the next item
    {
        let h;
        try { h = await openPlayer(1280, 'wedo', '&mode=pupil'); } catch (e) { h = null; fail(M, 'pupil We do (2) did not open'); }
        if (h) try {
            const { page } = h;
            let st = await state(page);
            await fillAns(page, String(Number(st.itemAns) + 1));
            await act(page, 'check');
            await act(page, 'next');
            st = await state(page);
            if (st.item !== 1 || st.rung !== 1) fail(M, `after a wrong item 1 the next item opens at rung ${st.rung} (P-ON-7: a wrong Check keeps the rung, 1)`);
            else ok(M, 'pupil: rungs 1 -> 2 -> 3 on right items, a wrong Check keeps the rung, Hint writes nothing, live per-digit marks, ink still');
        } finally { await h.close(); }
    }
    // BOARD: the teacher drives the rung with Hint / Next; Show answer is the teacher's (A), never a hint
    {
        let h;
        try { h = await openPlayer(1280, 'wedo', '&mode=board'); } catch (e) { h = null; fail(M, 'board We do did not open'); }
        if (h) try {
            const { page } = h;
            let st = await state(page);
            const seen = [];
            for (let i = 0; i < st.items; i++) {
                st = await state(page);
                seen.push(`${st.item + 1}@${st.rung}`);
                if (st.rung !== Math.min(3, i + 1)) fail(M, `board item ${i + 1} opens at rung ${st.rung} (want ${Math.min(3, i + 1)})`);
                while (st.rung > 1) {
                    const r0 = st.rung;
                    await act(page, 'hint');
                    st = await state(page);
                    if (st.rung !== r0 - 1) { fail(M, `board Hint at rung ${r0} -> ${st.rung}`); break; }
                    if ((await inputsOf(page)).some(Boolean)) fail(M, `P-ON-8: board Hint wrote into an answer box (item ${i + 1})`);
                }
                if (i < st.items - 1) await act(page, 'next');
            }
            if (!(await act(page, 'show'))) fail(M, 'board: no Show answer control on We do');
            else { const v = (await inputsOf(page)).join(''); st = await state(page); if (v !== String(st.itemAns)) fail(M, `board Show answer shows "${v}", not ${st.itemAns}`); }
            ok(M, `board: items open at rungs ${seen.join(', ')}, Hint lowers the rung and writes nothing, Show answer reveals`);
        } finally { await h.close(); }
    }
    // WARM-UP (pupil): Check marks it; a miss shows the "If missed" line (the Prerequisite Check's route), in chrome
    {
        let h;
        try { h = await openPlayer(1280, 'warmup', '&mode=pupil'); } catch (e) { h = null; fail(M, 'pupil Warm-up did not open'); }
        if (h) try {
            const { page } = h;
            let st = await state(page);
            await fillAns(page, String(Number(st.itemAns) + 1));
            await act(page, 'check');
            st = await state(page);
            const fb = await page.evaluate(() => { const e = document.querySelector('#mqLessonPlayer .mq-lp-fb'); return e && e.offsetParent !== null ? e.textContent.replace(/\s+/g, ' ').trim() : ''; });
            if (st.checked !== 'wrong') fail(M, `Warm-up wrong Check: ${st.checked}`);
            if (st.ifMissed && !/If missed/.test(fb)) fail(M, `Warm-up miss: no "If missed" line (feedback "${fb}")`);
            if (!st.ifMissed) notes.push(`Warm-up item 1 (${st.itemText}) has no Prerequisite Check route: no "If missed" line expected`);
            await fillAns(page, st.itemAns);
            await act(page, 'check');
            st = await state(page);
            if (st.checked !== 'right') fail(M, `Warm-up right Check: ${st.checked}`);
            else ok(M, `Warm-up: Check marks it, a miss shows "${fb.slice(0, 80)}"`);
        } finally { await h.close(); }
    }
    // PUPIL I do reads itself, only while sound is on (D6, A17)
    {
        let h;
        try { h = await openPlayer(1280, 'ido', '&mode=pupil'); } catch (e) { h = null; fail(M, 'pupil I do did not open'); }
        if (h) try {
            const { page } = h;
            await page.evaluate(() => { window.setTTS(false); window.speechSynthesis && (window.speechSynthesis.speak = () => {}); });
            await press(page, 'ArrowRight');
            let st = await state(page);
            if (st.autoSpoke) fail(M, `A17: pupil I do spoke "${st.autoSpoke}" with sound off`);
            await page.evaluate(() => window.setTTS(true));
            await press(page, 'ArrowLeft');
            st = await state(page);
            const words = await page.evaluate(() => (document.querySelector('.mq-lp-words') || {}).textContent || '');
            if (!st.autoSpoke || !st.autoSpoke.startsWith(words)) fail(M, `D6: pupil I do with sound on did not read "${words}" (spoke "${st.autoSpoke}")`);
            else ok(M, 'pupil I do reads each step itself with sound on, never with sound off (A17)');
        } finally { await h.close(); }
    }
}

async function anyPartS2() {
    const M = 'any-part';
    for (const mode of ['board', 'pupil']) {
        for (const part of ['warmup', 'ido', 'wedo', 'youdo', 'exit']) {
            let h;
            try { h = await openPlayer(1280, part, `&mode=${mode}`); } catch (e) { fail(M, `S2 ${mode} ?part=${part}: did not open`); continue; }
            try {
                const { page } = h;
                const s0 = await state(page);
                const shows = await page.evaluate(() => (document.querySelector('.mq-lp-cell') ? 'cell' : document.querySelector('.mq-lp-stage [data-soon]') ? 'soon' : 'none'));
                const want = ['youdo', 'exit'].includes(part) ? 'soon' : 'cell';
                if (s0.part !== part || s0.mode !== mode || shows !== want) fail(M, `S2 ${mode} ?part=${part} opened ${s0.part} (${s0.mode}, stage ${shows}, want ${want})`);
                for (const to of ['warmup', 'ido', 'wedo', 'youdo', 'exit'].filter((x) => x !== part)) {
                    await gotoPart(page, to);
                    const t = await state(page);
                    if (t.part !== to) fail(M, `S2 ${mode} from ${part}: the part bar did not jump to ${to}`);
                }
            } finally { await h.close(); }
        }
    }
    // pupil mode resumes at the last part reached (D4); a link with ?part= opens that part
    let h;
    try { h = await openPlayer(1280, 'wedo', '&mode=pupil'); } catch (e) { fail(M, 'S2 resume: pupil did not open'); return; }
    try {
        const { page } = h;
        // lead ruling A30-5: with no progress record for the lesson's practice skill, reaching a part creates NONE
        const made = await page.evaluate(() => { const sk = window.lessonPlayerState().practice; const sp = (window.state && window.state.skillProgress) || {}; return { sk, has: !!sp[sk] }; });
        if (!made.sk) fail(M, 'A30-5: the player exposes no practice skill');
        else if (made.has) fail(M, `A30-5: reaching a part created a progress record for ${made.sk} (lead ruling: never create a 0-attempt record)`);
        else ok(M, 'A30-5: no progress record is created just to store the part reached');
        // resume needs a record the pupil already has (A30-5): give one, as a pupil who has practised the skill has, then reach We do again
        await page.evaluate(async (lesson) => {
            const sk = window.lessonPlayerState().practice;
            window.state.skillProgress[sk] = window.state.skillProgress[sk] || { correct: 1, total: 1, streak: 1, bestStreak: 1, mastery: 0, lastPracticed: Date.now(), history: [] };
            window.closeLessonPlayer(); await window.openLessonPlayer(`?lesson=${encodeURIComponent(lesson)}&part=wedo&mode=pupil`);
        }, LESSON);
        await H.waitFor(page, () => window.lessonPlayerState().ready, 90000, 'reopened at We do');
        await page.evaluate(async (lesson) => { history.replaceState({}, '', `/index.html?lesson=${encodeURIComponent(lesson)}&mode=pupil`); window.closeLessonPlayer(); await window.openLessonPlayer(`?lesson=${encodeURIComponent(lesson)}&mode=pupil`); }, LESSON);
        await H.waitFor(page, () => window.lessonPlayerState().ready, 90000, 'resumed');
        const s = await state(page);
        if (s.part !== 'wedo') fail(M, `D4: pupil mode reopened at ${s.part}, not the last part reached (We do)`);
        else ok(M, 'S2: Warm-up and We do open as cells by URL in both modes, the part bar jumps, pupil mode resumes at the last part reached, You do / Exit stay coming soon');
    } finally { await h.close(); }
}

/** D2 seeds and paper parity of the Warm-up and We do (browser). */
async function unitS2(mods) {
    const { P } = mods;
    if (typeof P.partSeed !== 'function') { fail('unit', 'D2: plan.js has no partSeed(S, part, i)'); return; }
    const S = 1000;
    const want = { warmup: 1100, wedo: 1200, youdo: 1300, exit: 1900 };
    for (const [k, v] of Object.entries(want)) if (P.partSeed(S, k, 0) !== v || P.partSeed(S, k, 2) !== v + 2) fail('unit', `D2: partSeed(S, ${k}, i) != S + ${v - S} + i`);
    let h;
    try { h = await openPlayer(1280, 'wedo'); } catch (e) { fail('unit', 'S2: the player did not open'); return; }
    try {
        const r = await h.page.evaluate(async (lesson) => {
            const P2 = await import('/js/modules/lesson-player/plan.js');
            const ps = await import('/js/modules/print-sheet.js');
            const st = window.lessonPlayerState();
            const res = await ps.buildSheet(P2.chartRequest(P2.resolveLessonId(lesson), st.seed));
            const t = (res.lesson && res.lesson.teach) || {};
            return { plan: st.plan, warm: (t.warmQs || []).map((l) => l.map((q) => ({ text: q.text, ans: q.ans, seed: q.seed }))), wedo: (t.weDoQs || []).map((q) => ({ text: q.text, ans: q.ans, seed: q.seed })) };
        }, LESSON);
        const pw = (r.plan && r.plan.warmup) || [], pd = (r.plan && r.plan.wedo) || [];
        const paperWarm = r.warm.map((l) => l[0]).filter(Boolean).slice(0, 3);
        const same = (a, b) => a.length === b.length && a.every((x, i) => x.text === b[i].text && String(x.ans) === String(b[i].ans) && x.seed === b[i].seed);
        if (!pw.length) fail('unit', 'S2: the plan has no Warm-up items');
        else if (paperWarm.length && !same(pw, paperWarm)) fail('unit', `P-ON-5: Warm-up ${pw.map((x) => x.text).join(' | ')} != the packet's ${paperWarm.map((x) => x.text).join(' | ')}`);
        else ok('unit', `Warm-up = the packet's own (${pw.map((x) => `${x.text} [seed ${x.seed}]`).join('; ')})`);
        if (!pd.length) fail('unit', 'S2: the plan has no We do items');
        else if (r.wedo.length && !same(pd, r.wedo)) fail('unit', `P-ON-5: We do ${pd.map((x) => x.text).join(' | ')} != the packet's Guided ${r.wedo.map((x) => x.text).join(' | ')}`);
        else ok('unit', `We do = the packet's Guided cells (${pd.map((x) => `${x.text} [seed ${x.seed}]`).join('; ')})`);
    } finally { await h.close(); }
}

/* ================================================================ run */
(async () => {
    console.log(`${TOOL}: lesson ${LESSON}, modes ${modes.join(', ') || '-'}${modes.some((m) => m !== 'unit') ? `, widths ${WIDTHS.join(', ')}` : ''}`);
    let mods = null;
    try {
        if (modes.includes('unit')) { mods = await unitNode(); if (mods) { await unitBrowser(mods); if (S2) await unitS2(mods); } }
        if (modes.includes('render') && !fails.some((f) => /player did not open|no js\/modules\/lesson-player/.test(f))) { await render(); if (S2) await renderS2(); }
        if (modes.includes('reveal')) await reveal();
        if (modes.includes('hints') && S2) await hintsS2();
        if (modes.includes('any-part')) await anyPart();
        if (modes.includes('any-part') && S2) await anyPartS2();
        if (modes.includes('leave')) await leaveAndMarks();
    } catch (e) { fail('run', e.stack || String(e)); }
    for (const n of notes) console.log(`  note ${n}`);
    console.log(fails.length ? `${TOOL}: FAIL (${fails.length})` : `${TOOL}: OK`);
    process.exit(fails.length ? 1 : 0);
})();
