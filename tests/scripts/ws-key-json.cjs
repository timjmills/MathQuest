// ws-key-json - L-KEY (lf-engine -roles critic r2 F5, lead 2026-11-14): no answer key prints raw JSON as an answer. The keys of
// coordinate_q1 and shape_name_match_3d printed `[{"x":3,...}]` / `{"a":...}` in their answer slots and "Answer:" lines. Reads
// every text node of the KEY (and the pupil page) of every skill x role: a text starting `[` or `{` then `"` (or `[{`) fails.
//
//   node tests/scripts/ws-key-json.cjs [--skills cat:skill,..] [--roles r,..] [--sizes M] [--seeds 7] [--fixture f.html]
//   default: every live skill x every role of sheet/roles/index.js (+ independent, more-practice). MQ_ROOT=<tree> another checkout.
// Sweep (container restart 2026-11-15: the full sweep died with "Target closed" / "Navigating frame was detached"): the
// browser restarts every --restart-every skills (40) and on a crash / protocol timeout (protocolTimeout 120 s); a skill that
// crashed or timed out is retried ONCE in a fresh browser, and one that fails twice is a finding ("not measured").
// MQ_KEYJSON_CRASH_AT=<n> (read only here) kills the browser on skill n's first try - the backtest that proves the retry.
// Last line `ws-key-json: OK (...)` / `FAIL - n finding(s)`; exit 1 on FAIL.
const fs = require('fs');
const path = require('path');
const H = require('../lib/ws-harness.cjs');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const RAW = /^\s*(\[\s*[{"\[]|\{\s*")/;
function scanText(text, label) {
    const out = [];
    const t = String(text).replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
    for (const m of t.matchAll(/>([^<]+)</g)) {
        const s = m[1].replace(/&quot;/g, '"').replace(/&#34;/g, '"');
        if (RAW.test(s)) out.push(`${label}: raw JSON "${s.trim().slice(0, 60)}"`);
        // (L-KEY ids: a generator's own keys - "t3, t0, t1", "opt1, opt3", "binEq" - printed in place of the answer)
        else if (/^\s*((t|opt)\d+|bin[A-Z0-9]\w*)(\s*,\s*((t|opt)\d+|bin[A-Z0-9]\w*))+\s*$/.test(s)) out.push(`${label}: internal ids "${s.trim().slice(0, 60)}"`);
    }
    for (const m of t.matchAll(/\b(?:value|data-ans|data-value)="([^"]*)"/g)) { const s = m[1].replace(/&quot;/g, '"').replace(/&#34;/g, '"'); if (RAW.test(s)) out.push(`${label}: raw JSON in an attribute "${s.slice(0, 60)}"`); }
    return out;
}
(async () => {
    const fx = arg('fixture', '');
    if (fx) {
        const bad = scanText(fs.readFileSync(fx, 'utf8'), path.basename(fx));
        for (const b of bad) console.log('  FAIL ' + b);
        console.log(bad.length ? `ws-key-json: FAIL - ${bad.length} finding(s) (fixture)` : 'ws-key-json: OK (fixture)');
        process.exit(bad.length ? 1 : 0);
    }
    const { pathToFileURL } = require('url');
    const ri = await import(pathToFileURL(path.join(H.ROOT, 'js/modules/sheet/roles/index.js')).href);
    const ROLES = list(arg('roles', '')).length ? list(arg('roles', '')) : ['independent', 'more-practice', ...Object.keys(ri.ROLE_MODULES)].filter((r, i, a) => a.indexOf(r) === i);
    const SIZES = list(arg('sizes', 'M')), SEEDS = list(arg('seeds', '7')).map(Number);
    const t0 = Date.now();
    const EVERY = Number(arg('restart-every', 40)) || 40;
    const CRASH_AT = process.env.MQ_KEYJSON_CRASH_AT ? Number(process.env.MQ_KEYJSON_CRASH_AT) : -1;
    let app = null, restarts = 0, used = 0, retried = 0;
    const fresh = async () => { if (app) { try { await app.close(); } catch (e) { /* dead browser */ } restarts++; } app = await H.open({ protocolTimeout: 120000 }); used = 0; };
    await fresh(); restarts = 0;
    const only = list(arg('skills', ''));
    const all = only.length ? only : await app.page.evaluate(() => Object.entries(window.SKILLS || {}).flatMap(([c, arr]) => (Array.isArray(arr) ? arr : []).filter((s) => s && s.v && !s.retired).map((s) => `${c}:${s.v}`)));
    const skills = [...new Set(all)];
    const one = (k) => app.page.evaluate(async ({ k, ROLES, SIZES, SEEDS }) => {
        const [cat, id] = k.split(':'); const res = [];
        for (const role of ROLES) for (const size of SIZES) for (const seed of SEEDS) {
            try { const s = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: cat, skillId: id }], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed, form: 'A', key: true, anchors: 'off' }); res.push({ role, size, seed, key: s.keyHtml || '', pupil: s.pupilHtml || '' }); } catch (e) { /* role not offered */ }
        }
        return res;
    }, { k, ROLES, SIZES, SEEDS });
    const bad = [], lost = []; let built = 0;
    for (let i = 0; i < skills.length; i++) {
        const k = skills[i];
        if (used >= EVERY) await fresh();
        let r = null;
        for (let attempt = 0; attempt < 2 && !r; attempt++) {
            try {
                if (attempt === 0 && i === CRASH_AT) { const pr = app.browser.process(); if (pr) pr.kill('SIGKILL'); }
                r = await one(k); used++;
            } catch (e) {
                console.log(`  retry ${k} (${attempt ? 'second failure' : 'crash/timeout'}: ${String(e.message || e).slice(0, 80)})`);
                if (attempt === 0) retried++;
                await fresh();
            }
        }
        if (!r) { lost.push(k); continue; }
        for (const x of r) { built++; bad.push(...scanText(x.key, `${k} ${x.role} ${x.size} key`), ...scanText(x.pupil, `${k} ${x.role} ${x.size} pupil`)); }
    }
    try { await app.close(); } catch (e) { /* dead browser */ }
    for (const k of lost) bad.push(`${k} not measured (crashed or timed out twice)`);
    console.log(`  sweep: ${skills.length} skills, measured ${skills.length - lost.length}, browser restarts ${restarts}, retried ${retried}, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    const hit = [...new Set(bad.map((b) => b.split(' ')[0]))];
    for (const b of bad.slice(0, 80)) console.log('  FAIL ' + b);
    if (bad.length > 80) console.log(`  ... ${bad.length - 80} more`);
    if (hit.length) console.log(`  skills hit (${hit.length}): ${hit.join(', ')}`);
    console.log(bad.length ? `ws-key-json: FAIL - ${bad.length} finding(s) in ${hit.length} skill(s)` : `ws-key-json: OK (${all.length} skills, ${built} sheets)`);
    process.exit(bad.length ? 1 : 0);
})();
