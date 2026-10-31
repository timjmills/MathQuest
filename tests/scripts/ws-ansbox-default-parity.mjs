// ws-ansbox-default-parity — GATE: the answer-box option must not move a single byte of a DEFAULT page of a
// passed skill, measured against MAIN (git merge-base), never against a lane commit (ansBox r3, 2026-10-31;
// LESSONS_LEARNED L17: r2 measured against b63c075, which already held the lane's own 8c21ca1).
//
//   node tests/scripts/ws-ansbox-default-parity.mjs                 # render merge-base (temp worktree) + this tree, compare
//   ... --base <rev>        compare against another rev (must be on main's line: an ancestor of the main ref)
//   ... --main <ref>        the main ref (default origin/claude/sweet-newton-c8wrv1)
//   ... --skills a:b,...    (default: every id in js/modules/redesign-passed.js; `ansbox` = every skill in skill-ansbox-skills.js)
//   ... --no-render         hash the HTML only (default also hashes a screenshot of every page and the card)
//   ... --write <file>      record THIS tree's hashes as a baseline: refused unless HEAD is on main's line
//                           (HEAD is an ancestor of the main ref) and the tree is clean
//   ... --emit              (internal) print this root's hashes as JSON (MQ_ROOT picks the root)
//
// Documents: for each skill, option UNTOUCHED: pupil page + key of roles independent / more-practice / review at
// sizes S / M / L (buildSheet, seed 777), plus the practice card's #visualAid HTML (seeded). sha256 each, of the HTML
// AND of a screenshot of the rendered document / card (a stylesheet change moves no HTML byte).
// Prints `ws-ansbox-default-parity: OK (...)` or `FAIL (...)` with every changed document.
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const SELF = fileURLToPath(import.meta.url);
const REPO = resolve(dirname(SELF), '..', '..');
const ROOT = process.env.MQ_ROOT ? resolve(process.env.MQ_ROOT) : REPO;
const args = process.argv.slice(2);
const arg = (f, d) => { const i = args.indexOf(f); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const git = (...a) => execFileSync('git', ['-C', REPO, ...a], { encoding: 'utf8' }).trim();
const isAncestor = (a, b) => spawnSync('git', ['-C', REPO, 'merge-base', '--is-ancestor', a, b]).status === 0;

function ansboxIds(root) {
    const src = readFileSync(resolve(root, 'js/modules/skill-ansbox-skills.js'), 'utf8');
    return [...src.matchAll(/'([a-z_]+:[a-z0-9_]+)':/g)].map((m) => m[1]);
}
function passedIds(root) {
    const src = readFileSync(resolve(root, 'js/modules/redesign-passed.js'), 'utf8');
    return [...src.slice(src.indexOf('const IDS')).split(']')[0].matchAll(/'([a-z_]+:[a-z0-9_]+)'/g)].map((m) => m[1]);
}

const PIXELS = !args.includes('--no-render');
const DUMP = arg('--dump', null);   // (internal) write each card's HTML to <dir>/<sanitised key>.html
async function emit(skills) {
    const { open } = require('../lib/ws-harness.cjs');
    const ROLES = ['independent', 'more-practice', 'review'];
    const SIZES = ['S', 'M', 'L'];
    const sha = (s) => createHash('sha256').update(String(s)).digest('hex').slice(0, 16);
    const { page, close } = await open({ seed: 4242 });
    const out = {};
    try {
        for (const key of skills) {
            const [categoryId, skillId] = key.split(':');
            for (const role of ROLES) for (const size of SIZES) {
                const r = await page.evaluate(async ({ categoryId, skillId, role, size }) => {
                    try {
                        const rs = await window.buildSheet({ role, sections: [{ skills: [{ categoryId, skillId }], count: 6, columns: 'auto' }], size, seed: 777, key: true });
                        // the RENDERED page too (a CSS rule can change the drawing with no byte of HTML moving)
                        let f = document.getElementById('__parity');
                        if (!f) { f = document.createElement('iframe'); f.id = '__parity'; f.style.cssText = 'position:absolute;left:0;top:0;width:900px;height:1200px;border:0;z-index:2147483647;background:#fff'; document.body.appendChild(f); }
                        f.srcdoc = window.sheetDocument(rs.docHtml, 'parity'); await new Promise((ok) => { f.onload = ok; });
                        try { await f.contentDocument.fonts.ready; } catch (e) { /* */ }
                        f.style.height = Math.min(16000, f.contentDocument.documentElement.scrollHeight) + 'px';
                        await new Promise((res) => setTimeout(res, 60));
                        return { pupil: rs.pupilHtml || '', key: rs.keyHtml || '' };
                    } catch (e) { return { error: String(e && e.message || e) }; }
                }, { categoryId, skillId, role, size });
                if (r.error) { out[`${key}|${role}|${size}|error`] = r.error; continue; }
                out[`${key}|${role}|${size}|pupil`] = sha(r.pupil);
                out[`${key}|${role}|${size}|key`] = sha(r.key);
                if (PIXELS) {
                    const el = await page.$('#__parity');
                    out[`${key}|${role}|${size}|render`] = sha((await el.screenshot({ captureBeyondViewport: true })).toString('base64'));
                }
            }
            await page.evaluate(() => { const f = document.getElementById('__parity'); if (f) f.remove(); });
            const card = await page.evaluate(async ({ categoryId, skillId }) => {
                const st = window.state;
                window.__wsReseed && window.__wsReseed(9001);
                st.category = categoryId; st.skill = skillId; st.range = 100; st.gameMode = 'practice'; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
                window.showView('gameView');
                const q = window.generateQuestion(); st.currentQ = q; window.renderQuestion();
                await new Promise((res) => setTimeout(res, 150));
                try { document.getAnimations().forEach((a) => { const t = a.effect && a.effect.getComputedTiming(); if (t && t.endTime !== Infinity) a.finish(); else { a.pause(); a.currentTime = 0; } }); } catch (e) { /* */ }
                const el = document.getElementById('visualAid');
                return el ? el.innerHTML : '';
            }, { categoryId, skillId });
            out[`${key}|card`] = sha(card);
            if (DUMP) writeFileSync(join(DUMP, `${key.replace(/[^\w]+/g, '_')}-card.html`), card);
            if (PIXELS) { const el = await page.$('#questionCard'); if (el) out[`${key}|card|render`] = sha((await el.screenshot()).toString('base64')); }
            await page.evaluate(() => window.showView('homeView'));
        }
    } finally { await close(); }
    return out;
}

function renderAt(root, skills) {
    const r = spawnSync(process.execPath, [SELF, '--emit', '--skills', skills.join(','), ...(PIXELS ? [] : ['--no-render'])], { env: { ...process.env, MQ_ROOT: root }, encoding: 'utf8', maxBuffer: 64 << 20 });
    const line = (r.stdout || '').split('\n').find((l) => l.startsWith('{'));
    if (r.status !== 0 || !line) { console.error(r.stderr || r.stdout); throw new Error(`render failed at ${root}`); }
    return JSON.parse(line);
}

let skills = arg('--skills', '').split(',').map((s) => s.trim()).filter(Boolean);
if (skills.length === 1 && skills[0] === 'ansbox') skills = ansboxIds(REPO);   // every skill that carries the option

if (args.includes('--emit')) {
    if (!skills.length) skills = passedIds(ROOT);
    console.log(JSON.stringify(await emit(skills)));
    process.exit(0);
}

const MAIN = arg('--main', 'origin/claude/sweet-newton-c8wrv1');
if (!skills.length) skills = passedIds(REPO);

if (arg('--write', null)) {
    const head = git('rev-parse', 'HEAD');
    const dirty = git('status', '--porcelain', '--untracked-files=no');
    if (!isAncestor(head, MAIN) || dirty) {
        console.log(`ws-ansbox-default-parity: REFUSED --write: HEAD ${head.slice(0, 7)} is ${dirty ? 'dirty' : 'not on ' + MAIN + "'s line"}; a baseline is only recorded on main (L17)`);
        process.exit(2);
    }
    const out = renderAt(REPO, skills);
    writeFileSync(arg('--write'), JSON.stringify(out, null, 1));
    console.log(`wrote ${Object.keys(out).length} hashes (main ${head.slice(0, 7)}) to ${arg('--write')}`);
    process.exit(0);
}

const base = arg('--base', null) ? git('rev-parse', arg('--base')) : git('merge-base', 'HEAD', MAIN);
if (!isAncestor(base, MAIN)) {
    console.log(`ws-ansbox-default-parity: REFUSED: base ${base.slice(0, 7)} is not on ${MAIN}'s line (L17)`);
    process.exit(2);
}
const wt = mkdtempSync(join(tmpdir(), 'mq-parity-'));
let baseOut;
try {
    execFileSync('git', ['-C', REPO, 'worktree', 'add', '--detach', wt, base], { stdio: 'ignore' });
    baseOut = renderAt(wt, skills);
} finally {
    try { execFileSync('git', ['-C', REPO, 'worktree', 'remove', '--force', wt], { stdio: 'ignore' }); } catch (e) { /* removed below */ }
    if (existsSync(wt)) rmSync(wt, { recursive: true, force: true });
    try { execFileSync('git', ['-C', REPO, 'worktree', 'prune'], { stdio: 'ignore' }); } catch (e) { /* ignore */ }
}
const headOut = renderAt(REPO, skills);
const keys = [...new Set([...Object.keys(baseOut), ...Object.keys(headOut)])];
const diff = keys.filter((k) => baseOut[k] !== headOut[k]);
for (const k of diff) console.log(`  changed ${k}: ${baseOut[k]} -> ${headOut[k]}`);
console.log(diff.length
    ? `ws-ansbox-default-parity: FAIL (${diff.length} of ${keys.length} documents changed vs merge-base ${base.slice(0, 7)}, ${skills.length} skills)`
    : `ws-ansbox-default-parity: OK (${keys.length} documents byte-identical to merge-base ${base.slice(0, 7)}, ${skills.length} skills)`);
process.exit(diff.length ? 1 : 0);
