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
//   (a) the stage `.tv-sko-frame > .tvp-stage` lies neither inside the frame (1 px tolerance) nor over at least 90 % of it
//       — the F8/G11 defect: fit()'s `is-cropped` (origin top-left) under _tidySample's translate(-50%,-50%) put the stage
//       at about (-183,-358) and the frame showed white; or
//   (b) the frame's visible crop holds no ink: at most 0.5 % dark pixels (luma < 230, inside a 3 px inset so
//       the frame's border is not ink: a number bond's hairline legs, a fraction-of-set's grey counters and 20 px digits
//       count; an off-frame stage leaves 0.00 %) in a screenshot of the frame.
// A skill whose sample is honestly unavailable (`.tvp-frame.is-unavailable`, its own message) is reported, not failed.
// A --skill that has no options panel FAILs (a typo or a skill that lost its options); with --skip-no-panel (ws-precritic's
// scoped row: a lane's skills need not all have options) a LIVE skill with no panel prints `skip <ref>: no options panel`
// and is not checked, while a skill that is not live (unknown, retired) still FAILs. Every skill skipped: `OK (0 skills ...)`.
// --shard i/n checks every n-th skill of the full list starting at the i-th (sorted list order; ws-deploy-gates session 4).
// Prints `ws-options-shots: OK (n skills × w widths)` or `ws-options-shots: FAIL (n)`; exit 1 on FAIL.
// --shots <dir> saves every frame crop; --fail-shots <dir> (default: scratch-free, off) saves only the failing ones;
// --save-panels writes the whole panel to design/audit/options-panels/<cat>-<skill>.png (the old tool's P12 evidence).
// A full run is ~1.6 s a skill a width per worker; --workers (default 3) runs that many browsers side by side.
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
const INK_MIN = 0.005, COVER_MIN = 0.9;

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

async function checkSkill(app, ref, width) {
    const { page } = app;
    const [categoryId, skillId] = ref.split(':');
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
    const m = await page.evaluate(() => {
        const pop = document.getElementById('skillOptionsPopover');
        const frame = pop && pop.querySelector('.tv-sko-frame');
        if (!frame) return { noFrame: true };
        frame.scrollIntoView({ block: 'nearest' });
        const stage = frame.querySelector(':scope > .tvp-stage');
        const f = frame.getBoundingClientRect();
        const r = stage ? stage.getBoundingClientRect() : null;
        return {
            unavailable: frame.classList.contains('is-unavailable'), cropped: frame.classList.contains('is-cropped'),
            f: { x: f.left, y: f.top, w: f.width, h: f.height }, s: r && { x: r.left, y: r.top, w: r.width, h: r.height },
            transform: stage ? stage.style.transform : '',
        };
    });
    if (m.noFrame) return { ref, width, fails: ['no sample frame in the panel'] };
    const fails = [];
    const { f, s } = m;
    let cover = 0;
    if (s) {
        const ix = Math.max(0, Math.min(f.x + f.w, s.x + s.w) - Math.max(f.x, s.x));
        const iy = Math.max(0, Math.min(f.y + f.h, s.y + s.h) - Math.max(f.y, s.y));
        cover = (ix * iy) / Math.max(1, f.w * f.h);
        const inside = s.x >= f.x - 1 && s.y >= f.y - 1 && s.x + s.w <= f.x + f.w + 1 && s.y + s.h <= f.y + f.h + 1;
        if (!m.unavailable && !inside && cover < COVER_MIN) fails.push(`stage (${Math.round(s.x - f.x)},${Math.round(s.y - f.y)}) ${Math.round(s.w)}×${Math.round(s.h)} is neither inside the ${Math.round(f.w)}×${Math.round(f.h)} frame nor over 90 % of it (covers ${(cover * 100).toFixed(1)} %; ${m.cropped ? 'is-cropped, ' : ''}transform ${m.transform})`);
    } else if (!m.unavailable) fails.push('no .tvp-stage in the frame');
    // (the frame's own element shot: a page clip is in document coordinates, and at 390 the panel is a fixed bottom sheet
    // over a scrolled page, so a viewport rect clips the wrong place)
    const fh = await page.$('#skillOptionsPopover .tv-sko-frame');
    const b64 = await fh.screenshot({ encoding: 'base64' });
    const ink = await inkOf(page, b64);
    if (!m.unavailable && ink <= INK_MIN) fails.push(`the frame's visible crop holds ${(ink * 100).toFixed(2)} % dark pixels (needs > 0.5 %)`);
    const tag = `${categoryId}-${skillId}-${width}`;
    if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); fs.writeFileSync(path.join(SHOTS, tag + '.png'), Buffer.from(b64, 'base64')); }
    if (FAIL_SHOTS && fails.length) { fs.mkdirSync(FAIL_SHOTS, { recursive: true }); fs.writeFileSync(path.join(FAIL_SHOTS, tag + '.png'), Buffer.from(b64, 'base64')); }
    if (SAVE_PANELS && width === 1280) {
        const el = await page.$('#skillOptionsPopover');
        if (el) await el.screenshot({ path: path.join(ROOT, 'design', 'audit', 'options-panels', `${categoryId}-${skillId}.png`) });
    }
    await page.evaluate(() => { if (window.closeSkillOptionsPanel) window.closeSkillOptionsPanel(); });
    return { ref, width, fails, unavailable: m.unavailable, ink, cover };
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
    const skipNote = skipped.length ? `; ${skipped.length} skipped, no options panel` : '';
    const shardNote = SHARD ? `; shard ${SHARD.i}/${SHARD.n} of ${all.length}` : '';
    const jobs = [];
    for (const w of WIDTHS) for (const r of refs) jobs.push({ ref: r, width: w });
    const nWorkers = Math.min(WORKERS, Math.max(1, Math.ceil(jobs.length / 20)));
    const apps = [first];
    for (let i = 1; i < nWorkers; i++) apps.push(await open({ seed: 1, viewport: { width: 1280, height: 1000, deviceScaleFactor: 1 } }));
    const results = [];
    let next = 0;
    await Promise.all(apps.map(async (app) => {
        let cur = 0;
        while (next < jobs.length) {
            const job = jobs[next++];
            if (job.width !== cur) { await app.page.setViewport({ width: job.width, height: HEIGHT[job.width] || 900, deviceScaleFactor: 1 }); cur = job.width; await sleep(200); }
            let res;
            try { res = await checkSkill(app, job.ref, job.width); } catch (e) { res = { ref: job.ref, width: job.width, fails: [`could not open the panel: ${e.message.split('\n')[0]}`] }; }
            results.push(res);
            if (res.fails.length) console.log(`FAIL ${res.ref} @${res.width}: ${res.fails.join('; ')}`);
            else if (ONLY.length) console.log(`ok   ${res.ref} @${res.width}: ink ${(res.ink * 100).toFixed(2)} %, covers ${(res.cover * 100).toFixed(1)} %${res.unavailable ? ' (sample unavailable)' : ''}`);
        }
    }));
    const pageErrors = apps.flatMap((a) => a.problems.filter((p) => p.type === 'pageerror'));
    for (const a of apps) await a.close();
    const unavailable = [...new Set(results.filter((r) => r.unavailable).map((r) => r.ref))];
    if (unavailable.length) console.log(`  sample unavailable (reported, not failed): ${unavailable.join(', ')}`);
    if (pageErrors.length) console.log(`  page errors: ${pageErrors.slice(0, 5).map((e) => e.text).join(' | ')}`);
    const bad = results.filter((r) => r.fails.length);
    const secs = Math.round((Date.now() - t0) / 1000);
    console.log(`  ${refs.length} skills × ${WIDTHS.length} widths (${WIDTHS.join(', ')} px), ${apps.length} worker(s), ${secs} s${shardNote}`);
    if (bad.length) { console.log(`ws-options-shots: FAIL (${bad.length})`); process.exit(1); }
    console.log(`ws-options-shots: OK (${refs.length} skills × ${WIDTHS.length} widths${skipNote}${shardNote})`);
})().catch((e) => { console.error(e); console.log('ws-options-shots: FAIL (1)'); process.exit(1); });
