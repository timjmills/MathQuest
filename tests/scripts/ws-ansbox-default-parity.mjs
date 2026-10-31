// ws-ansbox-default-parity — the answer-box option must not move a single byte of a DEFAULT page
// (ansBox lane rebuild r2, 2026-10-31; critic r1 "No regression on the 7 passed skills").
//
//   node tests/scripts/ws-ansbox-default-parity.mjs --write <file.json>   # record the hashes (baseline)
//   node tests/scripts/ws-ansbox-default-parity.mjs --check <file.json>   # compare against a recorded baseline
//   node tests/scripts/ws-ansbox-default-parity.mjs                       # print the hashes only
//   ... [--skills cat:skill,...]  (default: every id in js/modules/redesign-passed.js)
//
// For each skill, with the option UNTOUCHED (no opts): the print pupil page and key of roles
// independent / more-practice / review at sizes S and L (buildSheet, fixed seed), plus the practice
// card's #visualAid HTML (seeded generateQuestion + renderQuestion). Each document is hashed (sha256).
// --check prints `ws-ansbox-default-parity: OK` when every hash matches, else FAIL with the changed ones.
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = process.env.MQ_ROOT ? resolve(process.env.MQ_ROOT) : resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const { open } = require('../lib/ws-harness.cjs');
const args = process.argv.slice(2);
const arg = (f, d) => { const i = args.indexOf(f); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };

let skills = arg('--skills', '').split(',').map((s) => s.trim()).filter(Boolean);
if (!skills.length) {
    // read the ids from the source (importing it bare warns: the repo has no package.json "type")
    const src = readFileSync(resolve(ROOT, 'js/modules/redesign-passed.js'), 'utf8');
    skills = [...src.slice(src.indexOf('const IDS')).split(']')[0].matchAll(/'([a-z_]+:[a-z0-9_]+)'/g)].map((m) => m[1]);
}
const ROLES = ['independent', 'more-practice', 'review'];
const SIZES = ['S', 'L'];
const sha = (s) => createHash('sha256').update(String(s)).digest('hex').slice(0, 16);

const { page, close, problems } = await open({ seed: 4242 });
const out = {};
try {
    for (const key of skills) {
        const [categoryId, skillId] = key.split(':');
        for (const role of ROLES) for (const size of SIZES) {
            const r = await page.evaluate(async ({ categoryId, skillId, role, size }) => {
                try {
                    const rs = await window.buildSheet({ role, sections: [{ skills: [{ categoryId, skillId }], count: 6, columns: 'auto' }], size, seed: 777, key: true });
                    return { pupil: rs.pupilHtml || '', key: rs.keyHtml || '' };
                } catch (e) { return { error: String(e && e.message || e) }; }
            }, { categoryId, skillId, role, size });
            if (r.error) { out[`${key}|${role}|${size}|error`] = r.error; continue; }
            out[`${key}|${role}|${size}|pupil`] = sha(r.pupil);
            out[`${key}|${role}|${size}|key`] = sha(r.key);
        }
        const card = await page.evaluate(async ({ categoryId, skillId }) => {
            const st = window.state;
            window.__wsReseed && window.__wsReseed(9001);
            st.category = categoryId; st.skill = skillId; st.range = 100; st.gameMode = 'practice'; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
            window.showView('gameView');
            const q = window.generateQuestion(); st.currentQ = q; window.renderQuestion();
            await new Promise((res) => setTimeout(res, 150));
            const el = document.getElementById('visualAid');
            const html = el ? el.innerHTML : '';
            window.showView('homeView');
            return html;
        }, { categoryId, skillId });
        out[`${key}|card`] = sha(card);
    }
} finally { await close(); }

const errs = problems.filter((p) => p.type !== 'requestfailed');
if (arg('--write', null)) { writeFileSync(arg('--write'), JSON.stringify(out, null, 1)); console.log(`wrote ${Object.keys(out).length} hashes to ${arg('--write')}`); }
if (arg('--check', null)) {
    const base = JSON.parse(readFileSync(arg('--check'), 'utf8'));
    const keys = new Set([...Object.keys(base), ...Object.keys(out)]);
    const diff = [...keys].filter((k) => base[k] !== out[k]);
    for (const k of diff) console.log(`  changed ${k}: ${base[k]} -> ${out[k]}`);
    console.log(diff.length ? `ws-ansbox-default-parity: FAIL (${diff.length} of ${keys.size} documents changed)` : `ws-ansbox-default-parity: OK (${keys.size} documents byte-identical, ${skills.length} skills)`);
    process.exit(diff.length ? 1 : 0);
}
if (!arg('--write', null)) for (const [k, v] of Object.entries(out)) console.log(`${v}  ${k}`);
if (errs.length) console.log(`page errors: ${errs.length} (${errs[0].text})`);
