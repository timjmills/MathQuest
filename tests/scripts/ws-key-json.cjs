// ws-key-json - L-KEY (lf-engine -roles critic r2 F5, lead 2026-11-14): no answer key prints raw JSON as an answer. The keys of
// coordinate_q1 and shape_name_match_3d printed `[{"x":3,...}]` / `{"a":...}` in their answer slots and "Answer:" lines. Reads
// every text node of the KEY (and the pupil page) of every skill x role: a text starting `[` or `{` then `"` (or `[{`) fails.
//
//   node tests/scripts/ws-key-json.cjs [--skills cat:skill,..] [--roles r,..] [--sizes M] [--seeds 7] [--fixture f.html]
//   default: every live skill x every role of sheet/roles/index.js (+ independent, more-practice). MQ_ROOT=<tree> another checkout.
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
    for (const m of t.matchAll(/>([^<]+)</g)) { const s = m[1].replace(/&quot;/g, '"').replace(/&#34;/g, '"'); if (RAW.test(s)) out.push(`${label}: raw JSON "${s.trim().slice(0, 60)}"`); }
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
    let app = await H.open({});
    const only = list(arg('skills', ''));
    const all = only.length ? only : await app.page.evaluate(() => Object.entries(window.SKILLS || {}).flatMap(([c, arr]) => (Array.isArray(arr) ? arr : []).filter((s) => s && s.v && !s.retired).map((s) => `${c}:${s.v}`)));
    const bad = []; let built = 0, n = 0;
    for (const k of [...new Set(all)]) {
        if (++n % 40 === 0) { await app.close(); app = await H.open({}); }
        const r = await app.page.evaluate(async ({ k, ROLES, SIZES, SEEDS }) => {
            const [cat, id] = k.split(':'); const res = [];
            for (const role of ROLES) for (const size of SIZES) for (const seed of SEEDS) {
                try { const s = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: cat, skillId: id }], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed, form: 'A', key: true, anchors: 'off' }); res.push({ role, size, seed, key: s.keyHtml || '', pupil: s.pupilHtml || '' }); } catch (e) { /* role not offered */ }
            }
            return res;
        }, { k, ROLES, SIZES, SEEDS });
        for (const x of r) { built++; bad.push(...scanText(x.key, `${k} ${x.role} ${x.size} key`), ...scanText(x.pupil, `${k} ${x.role} ${x.size} pupil`)); }
    }
    await app.close();
    const hit = [...new Set(bad.map((b) => b.split(' ')[0]))];
    for (const b of bad.slice(0, 80)) console.log('  FAIL ' + b);
    if (bad.length > 80) console.log(`  ... ${bad.length - 80} more`);
    if (hit.length) console.log(`  skills hit (${hit.length}): ${hit.join(', ')}`);
    console.log(bad.length ? `ws-key-json: FAIL - ${bad.length} finding(s) in ${hit.length} skill(s)` : `ws-key-json: OK (${all.length} skills, ${built} sheets)`);
    process.exit(bad.length ? 1 : 0);
})();
