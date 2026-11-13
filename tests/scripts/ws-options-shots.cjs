#!/usr/bin/env node
// ws-options-shots — GATE: the option panel's live sample shows the problem, for EVERY skill with an options panel.
//
//   node tests/scripts/ws-options-shots.cjs                       # every skill with options, at 1280 and 390 px
//   node tests/scripts/ws-options-shots.cjs --skill algebra:growing [--skill cat:skill ...]   (or a comma list)
//   node tests/scripts/ws-options-shots.cjs --widths 1280 --workers 3 --shots <dir> --save-panels
//   node tests/scripts/ws-options-shots.cjs algebra:growing ...   # (bare cat:skill refs, as the old screenshot tool took them)
//   node tests/scripts/ws-options-shots.cjs --skill a:b --skip-no-panel  # a live skill with no options panel is SKIPPED, not FAIL
//   node tests/scripts/ws-options-shots.cjs --shard 1/2 --workers 1      # every i-th skill of the full list (deploy session 4)
//
// Each skill is opened the way a teacher does (lf-algebra F8/G11 repro): teacher mode → Sets → the skill's Options
// button → the shared editor (#skillOptionsPopover). The panel draws its sample, tidies it at once and again at +950 ms
// (skill-options-ui _tidySample); the gate reads it 1.5 s after the click, after both passes, and fails a skill when
//   (a) the stage `.tv-sko-frame > .tvp-stage` is not inside the frame (1 px tolerance; critic-panel-r1 F4: no "covers
//       90 %" escape, so a clipped drawing fails) — the F8/G11 defect put the stage at about (-183,-358);
//   (b) the frame's visible crop holds no ink: at most 0.5 % dark pixels (luma < 230, inside a 3 px inset);
//   (c) the sample is illegible (critic-panel-r1 F1): the smallest visible HTML text of the sample (question, labels,
//       answer choices), as drawn = computed font-size × its effective scale (bounding width / layout width), is under
//       9 px. A sample that cannot be drawn whole at 9 px is shown one whole part at a time ("1 of N"): the visible
//       part is what is measured, and it must be whole (inside the frame). The smallest SVG text is reported, not failed;
//   (d) the panel's controls leave the window (critic-panel-r1 F2): `.tv-sko-foot`'s bottom below innerHeight, or the
//       Done button not wholly inside the window, or the panel itself outside it;
//   (e) a page error is thrown while the panel opens or redraws (critic-panel-r1 F4).
// The main sweep is every skill at 1280×1000 and 390×844. The SPOT set (the critic's cases: the coordinates
// transformation skills, the long algebra word problems, the skills whose footer fell off the window, ...) and every
// --skill run also get: 1280×720 (`@1280x720`), a resize with the panel open from 1280×1000 to 1280×720
// (`@1280x1000>720`), and an option change at 1280 and 390: the first select / checkbox of the panel is changed and
// (a)-(e) are re-measured 50 ms and 1.5 s after it (`@<w> changed +50ms`, `+1.5s`).
// A skill whose sample is honestly unavailable (`.tvp-frame.is-unavailable`, its own message) is reported, not failed.
// A --skill that has no options panel FAILs (a typo or a skill that lost its options); with --skip-no-panel (ws-precritic's
// scoped row: a lane's skills need not all have options) a LIVE skill with no panel prints `skip <ref>: no options panel`
// and is not checked, while a skill that is not live (unknown, retired) still FAILs. Every skill skipped: `OK (0 skills ...)`.
// --shard i/n checks every n-th skill of the full list starting at the i-th (sorted list order; ws-deploy-gates session 4),
// and the same share of the spot set. --no-spot drops the spot passes from a full run.
// Prints `ws-options-shots: OK (n skills × w widths)` or `ws-options-shots: FAIL (n)`; exit 1 on FAIL.
// --shots <dir> saves every frame crop; --fail-shots <dir> (default: scratch-free, off) saves only the failing ones;
// --save-panels writes the whole panel to design/audit/options-panels/<cat>-<skill>.png (the old tool's P12 evidence).
// --verbose prints an `ok` line (scale, smallest text, part) for every check of a full run too.
// A full run is ~1.7 s a skill a width per worker; --workers (default 3) runs that many browsers side by side.
'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const many = (k) => { const out = []; argv.forEach((a, i) => { if (a === '--' + k && argv[i + 1]) out.push(argv[i + 1]); }); return out; };
const one = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const flag = (k) => argv.includes('--' + k);
const valued = new Set(['--skill', '--widths', '--workers', '--shots', '--fail-shots', '--shard']);
const bare = argv.filter((a, i) => /^[a-z0-9_]+:[a-z0-9_]+$/i.test(a) && !valued.has(argv[i - 1]));
const ONLY = [...new Set([...many('skill').flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean), ...bare])];
const WIDTHS = String(one('widths', '1280,390')).split(',').map(Number).filter(Boolean);
const WORKERS = Math.max(1, Number(one('workers', 3)) || 1);
const SHOTS = one('shots', '') ? path.resolve(one('shots')) : '';
const FAIL_SHOTS = one('fail-shots', '') ? path.resolve(one('fail-shots')) : '';
const SAVE_PANELS = flag('save-panels');
const SKIP_NO_PANEL = flag('skip-no-panel');
const SHARD = (() => {
    const v = one('shard', '');
    if (!v) return null;
    const m = /^(\d+)\/(\d+)$/.exec(v);
    if (!m || +m[1] < 1 || +m[1] > +m[2]) { console.log(`ws-options-shots: --shard ${v}: give i/n with 1 <= i <= n`); console.log('ws-options-shots: FAIL (usage)'); process.exit(2); }
    return { i: +m[1], n: +m[2] };
})();
if (SHARD && (many('skill').length || bare.length)) { console.log('ws-options-shots: --shard and --skill do not go together'); console.log('ws-options-shots: FAIL (usage)'); process.exit(2); }
const HEIGHT = { 1280: 1000, 390: 844 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const INK_MIN = 0.005, TEXT_MIN = 9;
const NO_SPOT = flag('no-spot');
const VERBOSE = flag('verbose');
// The critic's cases (critic-panel-r1): the transformation skills (k 0.17-0.23), the long algebra word problems, the skills
// whose footer fell below the window at 1280, a grown frame that shrinks on an option change, and plain short samples.
const SPOT = [
    'coordinates:geo_translate', 'coordinates:geo_reflect', 'coordinates:geo_rotate', 'coordinates:reflect_x_axis',
    'coordinates:rotate_quarter_turn', 'coordinates:translate_left_down', 'coordinates:coord_distance_q1',
    'algebra:two_step_add_then_div', 'algebra:two_step_add_then_mult', 'algebra:multi_step_word', 'algebra:multi_step_word_plain',
    'algebra_mixed:algebra_all', 'algebra:evaluate_expression', 'addition:add_word_problems', 'addition:add_5_pictures',
    'subtraction:sub_5_pictures', 'subtraction:sub_2d_1d', 'comparing:classify_count', 'integers:order_negatives',
    'integers:abs_value', 'number_ops_mixed:mixed', 'shapes_early:shape_attributes', 'fractions:fraction_of_set',
    'composing:number_bonds', 'multiplication:mult_facts', 'multiplication:mult_chart_easy',
];

// Count dark pixels of a PNG (base64) in the page itself: no image library in the repo.
async function inkOf(page, b64) {
    return page.evaluate(async (b64) => {
        const img = new Image();
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = 'data:image/png;base64,' + b64; });
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        // (a 3 px inset: the frame's own border and radius are not ink)
        const IN = 3, W = Math.max(1, c.width - 2 * IN), H = Math.max(1, c.height - 2 * IN);
        const d = g.getImageData(IN, IN, W, H).data;
        let dark = 0;
        for (let i = 0; i < d.length; i += 4) if (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] < 230) dark++;
        return dark / (W * H);
    }, b64);
}

// Everything the gate reads off the open panel, in one pass.
function measure(page) {
    return page.evaluate(() => {
        const pop = document.getElementById('skillOptionsPopover');
        const frame = pop && pop.querySelector('.tv-sko-frame');
        if (!frame) return { noFrame: true };
        const stage = frame.querySelector(':scope > .tvp-stage');
        const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
        // the sample's text as drawn: computed font-size × the element's effective scale (bounding width / layout width)
        let minPx = Infinity, minText = '', svgPx = Infinity;
        if (stage) {
            const sk = stage.offsetWidth ? stage.getBoundingClientRect().width / stage.offsetWidth : 1;
            const tw = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
            for (let n = tw.nextNode(); n; n = tw.nextNode()) {
                const t = n.textContent.trim();
                const el = n.parentElement;
                if (!t || !el || !el.getClientRects().length) continue;
                const cs = getComputedStyle(el);
                if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
                const fsz = parseFloat(cs.fontSize) || 0;
                if (el.closest('svg')) {
                    const m = el.getScreenCTM && el.getScreenCTM();
                    const px = fsz * (m ? Math.hypot(m.a, m.b) : sk);
                    if (px < svgPx) svgPx = px;
                    continue;
                }
                const eff = el.offsetWidth >= 4 ? el.getBoundingClientRect().width / el.offsetWidth : sk;
                const px = fsz * eff;
                if (px < minPx) { minPx = px; minText = t.slice(0, 24); }
            }
        }
        const foot = pop.querySelector('.tv-sko-foot');
        const done = foot && [...foot.querySelectorAll('button')].pop();
        const sample = frame.closest('.tv-sko-sample');
        const part = sample && sample.querySelector('.tv-sko-part');
        return {
            unavailable: frame.classList.contains('is-unavailable'), cropped: frame.classList.contains('is-cropped'),
            f: box(frame), s: box(stage), pop: box(pop), foot: box(foot), done: box(done),
            vw: document.documentElement.clientWidth || window.innerWidth, vh: window.innerHeight,
            transform: stage ? stage.style.transform : '', minPx, minText, svgPx,
            part: part && !part.hidden ? String(part.querySelector('.tv-sko-part-n') ? part.querySelector('.tv-sko-part-n').textContent : part.textContent).replace(/\s+/g, ' ').trim() : '',
        };
    });
}

// The verdict on one reading: (a) inside, (b) ink, (c) legible, (d) the controls in the window.
function judge(m, ink) {
    const fails = [];
    if (m.noFrame) return ['no sample frame in the panel'];
    const { f, s } = m;
    if (s) {
        const inside = s.x >= f.x - 1 && s.y >= f.y - 1 && s.x + s.w <= f.x + f.w + 1 && s.y + s.h <= f.y + f.h + 1;
        if (!m.unavailable && !inside) fails.push(`stage (${Math.round(s.x - f.x)},${Math.round(s.y - f.y)}) ${Math.round(s.w)}×${Math.round(s.h)} is not inside the ${Math.round(f.w)}×${Math.round(f.h)} frame (${m.cropped ? 'is-cropped, ' : ''}transform ${m.transform})`);
    } else if (!m.unavailable) fails.push('no .tvp-stage in the frame');
    if (!m.unavailable && ink <= INK_MIN) fails.push(`the frame's visible crop holds ${(ink * 100).toFixed(2)} % dark pixels (needs > 0.5 %)`);
    if (!m.unavailable && s && m.minPx < TEXT_MIN - 0.05) fails.push(`text drawn at ${m.minPx.toFixed(1)} px ("${m.minText}"; needs >= ${TEXT_MIN} px; ${m.transform})`);
    if (m.foot && m.foot.y + m.foot.h > m.vh + 0.5) fails.push(`the panel footer's bottom is at ${Math.round(m.foot.y + m.foot.h)}, below the ${m.vh} px window`);
    if (m.done && (m.done.x < -0.5 || m.done.y < -0.5 || m.done.x + m.done.w > m.vw + 0.5 || m.done.y + m.done.h > m.vh + 0.5)) fails.push(`the Done button (${Math.round(m.done.x)},${Math.round(m.done.y)} ${Math.round(m.done.w)}×${Math.round(m.done.h)}) is not inside the ${m.vw}×${m.vh} window`);
    else if (m.pop && (m.pop.y < -0.5 || m.pop.y + m.pop.h > m.vh + 0.5)) fails.push(`the panel (top ${Math.round(m.pop.y)}, bottom ${Math.round(m.pop.y + m.pop.h)}) leaves the ${m.vh} px window`);
    return fails;
}

async function frameInk(page) {
    const fh = await page.$('#skillOptionsPopover .tv-sko-frame');
    if (!fh) return { ink: 0, b64: '' };
    const b64 = await fh.screenshot({ encoding: 'base64' });
    return { ink: await inkOf(page, b64), b64 };
}

const scaleOf = (t) => (/scale\(([\d.]+)\)/.exec(t || '') || [0, '1'])[1];
const note = (m, ink) => (m.noFrame ? '' : `ink ${(ink * 100).toFixed(2)} %, scale ${scaleOf(m.transform)}, text >= ${Number.isFinite(m.minPx) ? m.minPx.toFixed(1) : '-'} px${Number.isFinite(m.svgPx) ? ` (svg text ${m.svgPx.toFixed(1)} px)` : ''}, frame ${Math.round(m.f.h)} px${m.part ? `, part ${m.part}` : ''}${m.unavailable ? ' (sample unavailable)' : ''}`);

// Change the panel's first option (the first select or tick box of its body).
function changeFirstOption(page) {
    return page.evaluate(() => {
        const c = document.querySelector('#skillOptionsPopover .tv-sko-body select, #skillOptionsPopover .tv-sko-body input[type="checkbox"]');
        if (!c) return '';
        if (c.tagName === 'SELECT') {
            if (c.options.length < 2) return '';
            c.selectedIndex = (c.selectedIndex + 1) % c.options.length;
            c.dispatchEvent(new Event('change', { bubbles: true }));
            return 'select';
        }
        c.click();
        return 'tick box';
    });
}

// One check: open the panel at `vp`, read it after both tidies; then optionally resize it while open (`resizeTo`), or
// change its first option (`change`) and read it again at +50 ms and +1.5 s. Returns one result per reading.
async function checkSkill(app, ref, vp, mode = {}) {
    const { page } = app;
    const [categoryId, skillId] = ref.split(':');
    const errs0 = app.problems.filter((p) => p.type === 'pageerror').length;
    await page.evaluate(() => { if (window.closeSkillOptionsPanel) window.closeSkillOptionsPanel(); });
    await page.evaluate(({ categoryId, skillId }) => {
        if (!document.body.classList.contains('teacher-mode') && window.toggleUserRole) window.toggleUserRole();
        const s = (window.SKILLS[categoryId] || []).find((x) => x.v === skillId);
        window.UnifiedSkills.clear();
        window.UnifiedSkills.add({ domainId: 'x', categoryId, skillId, skillLabel: s ? s.l : skillId, categoryIcon: '', categoryName: categoryId, domainColor: '#8b5cf6' });
        window.UnifiedSkills._syncAllImmediate();
        window.tvGo('sets');
    }, { categoryId, skillId });
    const sel = `.tv-opt-btn[data-key="${categoryId}|${skillId}"]`;
    await page.waitForSelector(sel, { timeout: 10000 });
    await page.evaluate((sel) => { const b = document.querySelector(sel); b.scrollIntoView({ block: 'center' }); }, sel);
    await page.click(sel);
    await page.waitForSelector('#skillOptionsPopover', { timeout: 5000 });
    await sleep(1500);   // the repro's wait: both _tidySample passes (now and +950 ms) and fit()'s settle have run
    const out = [];
    const read = async (label, keep = true) => {
        const m = await measure(page);
        const { ink, b64 } = m.noFrame ? { ink: 0, b64: '' } : await frameInk(page);
        const fails = judge(m, ink);
        const errs = app.problems.filter((p) => p.type === 'pageerror');
        if (errs.length > errs0) fails.push(`page error: ${errs.slice(errs0).map((e) => e.text.split('\n')[0]).join(' | ').slice(0, 200)}`);
        const tag = `${categoryId}-${skillId}-${label.replace(/[^\w]+/g, '_')}`;
        if (keep && SHOTS && b64) { fs.mkdirSync(SHOTS, { recursive: true }); fs.writeFileSync(path.join(SHOTS, tag + '.png'), Buffer.from(b64, 'base64')); }
        if (keep && FAIL_SHOTS && b64 && fails.length) { fs.mkdirSync(FAIL_SHOTS, { recursive: true }); fs.writeFileSync(path.join(FAIL_SHOTS, tag + '.png'), Buffer.from(b64, 'base64')); }
        if (keep) out.push({ ref, width: label, fails, unavailable: !!m.unavailable, note: note(m, ink) });
    };
    // (a resize check's reading before the resize is the main sweep's own: not reported twice)
    await read(vp.label, !mode.resizeTo);
    if (SAVE_PANELS && vp.label === '1280' && !mode.resizeTo) {
        const el = await page.$('#skillOptionsPopover');
        if (el) await el.screenshot({ path: path.join(ROOT, 'design', 'audit', 'options-panels', `${categoryId}-${skillId}.png`) });
    }
    if (mode.resizeTo) {
        await page.setViewport({ width: vp.w, height: mode.resizeTo, deviceScaleFactor: 1 });
        await sleep(1500);
        await read(`${vp.w}x${vp.h}>${mode.resizeTo}`);
    }
    if (mode.change && await changeFirstOption(page)) {
        await sleep(50);
        await read(`${vp.label} changed +50ms`);
        await sleep(1450);
        await read(`${vp.label} changed +1.5s`);
    }
    await page.evaluate(() => { if (window.closeSkillOptionsPanel) window.closeSkillOptionsPanel(); });
    return out;
}

(async () => {
    const t0 = Date.now();
    const first = await open({ seed: 1, viewport: { width: 1280, height: 1000, deviceScaleFactor: 1 } });
    // Every skill whose Sets row offers an Options button (the same test teacher-sets.js uses).
    const all = await first.page.evaluate(async () => {
        const ui = await import('./js/modules/skill-options-ui.js');
        const out = [];
        for (const [cat, list] of Object.entries(window.SKILLS)) {
            if (!Array.isArray(list)) continue;
            for (const s of list) if (s && s.v && !s.retired && ui.skillHasOfferedOptions(cat, s.v)) out.push(`${cat}:${s.v}`);
        }
        return out;
    });
    const live = await first.page.evaluate((refs) => refs.filter((r) => { const [c, v] = r.split(':'); return (window.SKILLS[c] || []).some((s) => s && s.v === v && !s.retired); }), ONLY);
    let missing = ONLY.filter((r) => !all.includes(r));
    const skipped = SKIP_NO_PANEL ? missing.filter((r) => live.includes(r)) : [];
    for (const r of skipped) console.log(`skip ${r}: no options panel (not checked)`);
    missing = missing.filter((r) => !skipped.includes(r));
    if (missing.length) { console.log(`FAIL no options panel (${SKIP_NO_PANEL ? 'not a live skill' : 'unknown skill or no options'}): ${missing.join(', ')}`); await first.close(); console.log(`ws-options-shots: FAIL (${missing.length})`); process.exit(1); }
    const refs = ONLY.length ? ONLY.filter((r) => !skipped.includes(r)) : SHARD ? all.filter((_, k) => k % SHARD.n === SHARD.i - 1) : all;
    // The spot passes: every --skill run; a full run's share of SPOT (a SPOT skill that lost its panel is noted, not run).
    const spotGone = ONLY.length || NO_SPOT ? [] : SPOT.filter((r) => !all.includes(r));
    for (const r of spotGone) console.log(`  note: spot skill ${r} has no options panel now (not checked)`);
    const spotAll = SPOT.filter((r) => all.includes(r));
    const spot = ONLY.length ? refs : NO_SPOT ? [] : SHARD ? spotAll.filter((_, k) => k % SHARD.n === SHARD.i - 1) : spotAll;
    const skipNote = skipped.length ? `; ${skipped.length} skipped, no options panel` : '';
    const shardNote = SHARD ? `; shard ${SHARD.i}/${SHARD.n} of ${all.length}` : '';
    const jobs = [];
    for (const w of WIDTHS) for (const r of refs) jobs.push({ ref: r, vp: { w, h: HEIGHT[w] || 900, label: String(w) }, mode: { change: spot.includes(r) } });
    if (spot.length) {
        for (const r of spot) jobs.push({ ref: r, vp: { w: 1280, h: 720, label: '1280x720' } });
        for (const r of spot) jobs.push({ ref: r, vp: { w: 1280, h: 1000, label: '1280' }, mode: { resizeTo: 720 } });
    }
    const nWorkers = Math.min(WORKERS, Math.max(1, Math.ceil(jobs.length / 20)));
    const apps = [first];
    for (let i = 1; i < nWorkers; i++) apps.push(await open({ seed: 1, viewport: { width: 1280, height: 1000, deviceScaleFactor: 1 } }));
    const results = [];
    let next = 0;
    await Promise.all(apps.map(async (app) => {
        let cur = '';
        while (next < jobs.length) {
            const job = jobs[next++];
            const key = `${job.vp.w}x${job.vp.h}`;
            if (key !== cur || (job.mode && job.mode.resizeTo)) { await app.page.setViewport({ width: job.vp.w, height: job.vp.h, deviceScaleFactor: 1 }); cur = job.mode && job.mode.resizeTo ? '' : key; await sleep(200); }
            let res;
            try { res = await checkSkill(app, job.ref, job.vp, job.mode); } catch (e) { res = [{ ref: job.ref, width: job.vp.label, fails: [`could not open the panel: ${e.message.split('\n')[0]}`] }]; }
            for (const r of res) {
                results.push(r);
                if (r.fails.length) console.log(`FAIL ${r.ref} @${r.width}: ${r.fails.join('; ')}`);
                else if (ONLY.length || VERBOSE) console.log(`ok   ${r.ref} @${r.width}: ${r.note}`);
            }
        }
    }));
    const pageErrors = apps.flatMap((a) => a.problems.filter((p) => p.type === 'pageerror'));
    for (const a of apps) await a.close();
    const unavailable = [...new Set(results.filter((r) => r.unavailable).map((r) => r.ref))];
    if (unavailable.length) console.log(`  sample unavailable (reported, not failed): ${unavailable.join(', ')}`);
    if (pageErrors.length) console.log(`  page errors (each FAILs the check it was thrown in): ${pageErrors.slice(0, 5).map((e) => e.text.split('\n')[0]).join(' | ')}`);
    const bad = results.filter((r) => r.fails.length);
    const nBad = bad.length + (pageErrors.length && !bad.some((r) => r.fails.some((f) => /^page error/.test(f))) ? 1 : 0);
    const secs = Math.round((Date.now() - t0) / 1000);
    const spotNote = spot.length ? `; spot passes on ${spot.length} skill(s): 1280x720, a resize to 720, an option change at ${WIDTHS.join(' and ')}` : '';
    console.log(`  ${refs.length} skills × ${WIDTHS.length} widths (${WIDTHS.join(', ')} px)${spotNote}, ${results.length} readings, ${apps.length} worker(s), ${secs} s${shardNote}`);
    if (nBad) { console.log(`ws-options-shots: FAIL (${nBad})`); process.exit(1); }
    console.log(`ws-options-shots: OK (${refs.length} skills × ${WIDTHS.length} widths${skipNote}${shardNote})`);
})().catch((e) => { console.error(e); console.log('ws-options-shots: FAIL (1)'); process.exit(1); });
