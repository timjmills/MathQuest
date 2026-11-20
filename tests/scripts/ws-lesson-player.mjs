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
//   --hints / --exit / --sheet-to-play / packet page ids: later slices (2, 3, 5 / 4) - reported NOT IN SLICE 1, never passed
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
const MODES = ['unit', 'render', 'reveal', 'any-part'];
const LATER = { hints: 'slice 2 (We do)', exit: 'slice 3 (Exit ticket)', 'sheet-to-play': 'slice 5 (D12 itemsFor)' };
let modes = MODES.filter((m) => argv.includes(`--${m}`));
const later = Object.keys(LATER).filter((m) => argv.includes(`--${m}`));
if (!modes.length && !later.length) modes = MODES.slice();
const LESSON = arg('--lesson', 'add-within-10');
const BOARD_W = 1920;
const WIDTHS = SW.widthsArg(process.argv, [...SW.SCREEN_WIDTHS, BOARD_W]);
const HEIGHT = (w) => (w === BOARD_W ? 1080 : SW.heightOf(w));
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
    const h = await H.open({ viewport: { width, height: HEIGHT(width), deviceScaleFactor: SHOTS ? 2 : 1 }, pagePath: `/index.html?lesson=${encodeURIComponent(LESSON)}&part=${part}&mode=board${extra}`, lock: TOOL });
    await H.waitFor(h.page, () => window.lessonPlayerState && !window.lessonPlayerState.__mqStub && window.lessonPlayerState().ready, 90000, 'lesson player ready');
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
    out.small = [...r.querySelectorAll('button')].filter((b) => b.offsetParent !== null).map((b) => { const q = b.getBoundingClientRect(); return { t: b.textContent.trim(), w: q.width, h: q.height }; });
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
    out.digitPx = dpx;
    out.k = parseFloat(getComputedStyle(r).getPropertyValue('--lp-k')) || 1;
    out.say = (r.querySelector('.mq-lp-say') || {}).textContent || '';
    out.draw = (r.querySelector('.mq-lp-draw') || {}).innerHTML || '';
    out.grey = !!r.querySelector('.mq-lp-draw :is([data-ws-ink="trace"], [data-ws-mark="trace"])') || [...r.querySelectorAll('.mq-lp-draw *')].some((e) => { const c = getComputedStyle(e); return c.color === 'rgb(148, 148, 148)' || (parseFloat(c.borderTopWidth) > 0 && c.borderTopColor === 'rgb(148, 148, 148)') || c.fill === 'rgb(148, 148, 148)' || c.stroke === 'rgb(148, 148, 148)' || /#949494/i.test(e.getAttribute('fill') || '') || /#949494/i.test(e.getAttribute('stroke') || ''); });
    return out;
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
                const target = 104 * m.k;
                if (m.digitPx < floor) fail('render', `${tag}: digits ${m.digitPx.toFixed(0)} px under the ${floor} px floor`);
                if (m.mode === 'board' && m.digitPx < target * 0.8) fail('render', `${tag}: board digits ${m.digitPx.toFixed(0)} px under 80 % of the ${target.toFixed(0)} px target`);
                console.log(`       ${tag}: band ${(m.band * 100).toFixed(1)} %, steps foot ${Math.round(m.stepsFoot || 0)} px, digits ${m.digitPx.toFixed(0)} px`);
                if (SHOTS) { mkdirSync(SHOTS, { recursive: true }); await h.page.screenshot({ path: join(SHOTS, `ido-board-${w}-step${k + 1}.png`) }); }
                if (k < st.steps - 1) await press(h.page, 'ArrowRight');
            }
            // H13, with PT-MOD-3 (lead ruling 2026-11-12, as ws-empty-band reads a Scripted Model): a state that is not the last
            // is excused when its band is <= 35 % AND a later state draws ink in that band (the room kept for a later mark: the
            // cell is top-aligned at one zoom, so a later mark lands where the band is). The last state is never excused.
            for (const { k, tag, m } of bands) {
                const later = ms.slice(k + 1);
                const [a, b] = m.bandAt;
                const inked = later.some((x) => x.inkAt.some(([p, q]) => q > a + 2 && p < b - 2));
                if (k < ms.length - 1 && m.band <= 0.35 && inked) { notes.push(`${tag}: band ${(m.band * 100).toFixed(1)} % excused (PT-MOD-3: a later step inks it)`); continue; }
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
            await press(page, 'r');
            const s = await state(page);
            const words = await page.evaluate(() => (document.querySelector('.mq-lp-words') || {}).textContent || '');
            const want = [words, last ? `Say: ${st0.say}` : ''].filter(Boolean).join(' ');
            if (s.spoke !== want) fail('reveal', `step ${k + 1}: R read "${s.spoke}" not "${want}"`);
            if (s.step !== k) fail('reveal', `step ${k + 1}: state says step ${s.step + 1}`);
            if (!last) await press(page, nextKeys[k % nextKeys.length]);
        }
        if (new Set(draws).size !== n) fail('reveal', `${n} reveals drew ${new Set(draws).size} distinct states`);
        else ok('reveal', `${n} reveals = ${n} distinct cell states, each with its grey newest mark; Say only after the last`);
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
            const want = part === 'ido' ? 'cell' : 'soon';
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

/* ================================================================ run */
(async () => {
    console.log(`${TOOL}: lesson ${LESSON}, modes ${modes.join(', ') || '-'}${modes.some((m) => m !== 'unit') ? `, widths ${WIDTHS.join(', ')}` : ''}`);
    let mods = null;
    try {
        if (modes.includes('unit')) { mods = await unitNode(); if (mods) await unitBrowser(mods); }
        if (modes.includes('render') && !fails.some((f) => /player did not open|no js\/modules\/lesson-player/.test(f))) await render();
        if (modes.includes('reveal')) await reveal();
        if (modes.includes('any-part')) await anyPart();
    } catch (e) { fail('run', e.stack || String(e)); }
    for (const n of notes) console.log(`  note ${n}`);
    console.log(fails.length ? `${TOOL}: FAIL (${fails.length})` : `${TOOL}: OK`);
    process.exit(fails.length ? 1 : 0);
})();
