#!/usr/bin/env node
// ws-role-sweep — hash every passed skill's role pages (pupil + key) so a shared-role change can be proved harmless
// (lf-placevalue round-cap r3, coordinator 2026-11-14: compose.js / opener.js / guided.js / lesson.js / we-do.js / chart.js
// changed for number_word_form; no other passed skill's page may change unless it is a fix).
//
//   MQ_ROOT=<tree> node tests/scripts/ws-role-sweep.cjs --out <file.json> [--roles opener,guided,scripted-model,lesson]
//        [--sizes M,L] [--skills a:b,..] [--from i --to j]       (default skills: js/modules/redesign-passed.js of the tree)
//   node tests/scripts/ws-role-sweep.cjs --diff <before.json> <after.json>
// Each key is skill|role|size|pupil|key -> md5 of the HTML with the server port blanked. Last line `ws-role-sweep: OK|FAIL`.
const fs = require('fs');
const crypto = require('crypto');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const md5 = (s) => crypto.createHash('md5').update(String(s).replace(/127\.0\.0\.1:\d+/g, 'HOST')).digest('hex');
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

if (argv.includes('--diff')) {
    const i = argv.indexOf('--diff');
    const a = JSON.parse(fs.readFileSync(argv[i + 1], 'utf8')), b = JSON.parse(fs.readFileSync(argv[i + 2], 'utf8'));
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    const diff = keys.filter((k) => a[k] !== b[k]);
    for (const k of diff) console.log(`  CHANGED ${k}${!(k in a) ? ' (new)' : !(k in b) ? ' (gone)' : ''}`);
    console.log(`ws-role-sweep: ${diff.length ? `FAIL (${diff.length} of ${keys.length} differ)` : `OK (${keys.length} identical)`}`);
    process.exit(diff.length ? 1 : 0);
}

const H = require('../lib/ws-harness.cjs');
(async () => {
    const OUT = arg('out');
    const ROLES = list(arg('roles', 'opener,guided,scripted-model,lesson'));
    const SIZES = list(arg('sizes', 'M,L'));
    const app = await H.open({});
    app.page.setDefaultTimeout(600000);
    let skills = arg('skills') ? list(arg('skills')) : await app.page.evaluate(async () => [...(await import('./js/modules/redesign-passed.js')).REDESIGN_PASSED]);
    skills = skills.slice(Number(arg('from', 0)), Number(arg('to', skills.length)));
    const out = OUT && fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
    for (const sk of skills) for (const role of ROLES) for (const size of SIZES) {
        const [categoryId, skillId] = sk.split(':');
        const seed = hash(`${categoryId}__${skillId}:${role}`) % 1000000;
        const r = await app.page.evaluate(async ({ categoryId, skillId, role, size, seed }) => {
            try {
                const r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId, skillId }], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed, form: 'A', key: true });
                return { p: r.pupilHtml, k: r.keyHtml };
            } catch (e) { return { err: String((e && e.message) || e).slice(0, 120) }; }
        }, { categoryId, skillId, role, size, seed });
        const base = `${sk}|${role}|${size}`;
        if (r.err) out[`${base}|error`] = r.err; else { out[`${base}|pupil`] = md5(r.p); out[`${base}|key`] = md5(r.k); }
        process.stdout.write('.');
    }
    if (OUT) fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
    console.log(`\n  ${skills.length} skills x ${ROLES.join(',')} x ${SIZES.join('/')}: ${Object.keys(out).length} hashes`);
    await app.close();
    console.log('ws-role-sweep: OK');
})().catch((e) => { console.log(String(e && e.stack || e)); console.log('ws-role-sweep: FAIL (error)'); process.exit(2); });
