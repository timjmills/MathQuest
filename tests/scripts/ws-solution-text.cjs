// SOL-TEXT (lf-placevalue, 2026-11-20; HINT-NO-BLANK r3 critic R3-3, R3-4): the Show Solution popup
// (solution-display.js generateSolutionSteps) prints readable text for every live skill.
//
//   SOL-OBJECT   no step contains "[object", "undefined" or "NaN" (R3-3: round_sort_* printed "Answer: [object Object]")
//   SOL-PROBLEM  the "Problem:" line is a faithful restatement: not empty, no gap "?" and no "__" blank, and any "=" of the
//                question kept, except a trailing "= ___" the restatement may drop (R3-4: "673 + ? + ___"). A Problem line that IS the question text (plain(q.text)) is
//                always fine, box glyphs and all: only built-up strings are judged.
//
// Sweep: every live skill (tombstones skipped), SEEDS seeds each, seeded as ws-hint-no-blank (hash("cat:skill") + i*7919).
//   node tests/scripts/ws-solution-text.cjs [--skill cat:skill[,..]] [--category cat] [--seeds 4] [--only SOL-OBJECT|SOL-PROBLEM]
//                                           [--report-only] [--verbose]
// Prints `ws-solution-text: OK` or `ws-solution-text: FAIL` (exit 1 on FAIL unless --report-only).
const { open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const SKILL = arg('skill', '');
const CATEGORY = arg('category', '');
const N_SEEDS = Math.max(1, parseInt(arg('seeds', '4'), 10) || 4);
const REPORT_ONLY = has('report-only');
const VERBOSE = has('verbose');
const ONLY = new Set(arg('only', 'SOL-OBJECT,SOL-PROBLEM').split(',').map((s) => s.trim()).filter(Boolean));

// Shrink-only pins: skills of other lanes that still fail because of their OWN generator, keyed by owning lane.
const PINS = {};

function exitAfterFlush(code) {
    if (process.stdout.write('')) process.exit(code);
    else process.stdout.once('drain', () => process.exit(code));
}

(async () => {
    let app = null; let code = 0;
    try {
        app = await open({ seed: 1, lock: 'ws-solution-text' });
        const res = await app.page.evaluate(async ({ SKILL, CATEGORY, N_SEEDS }) => {
            const gq = await import('/js/modules/generate-question.js');
            const plain = (h) => String(h == null ? '' : h).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
            const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
            const norm = (s) => plain(s).replace(/\s+/g, '').toLowerCase();
            // a gap "?": one that does not end a word/number (a question's own "?" follows a letter, digit or bracket)
            const GAP = /(^|[\s(=+\-−×÷*/:,<>])\?/;
            const want = SKILL ? new Set(SKILL.split(',').map((s) => s.trim()).filter(Boolean)) : null;
            const list = [];
            for (const [cat, skills] of Object.entries(window.SKILLS)) {
                if (!Array.isArray(skills) || (CATEGORY && cat !== CATEGORY)) continue;
                for (const s of skills) {
                    if (!s || !s.v || s.retired) continue;
                    if (want && !want.has(`${cat}:${s.v}`)) continue;
                    list.push({ cat, skill: s.v });
                }
            }
            const found = []; const errors = []; let items = 0;
            for (const { cat, skill } of list) {
                const key = `${cat}:${skill}`;
                for (let i = 0; i < N_SEEDS; i++) {
                    let q;
                    try { q = gq.generateQuestionFor({ category: cat, skill, seed: (hash(key) + i * 7919) >>> 0, itemIndex: i, itemCount: N_SEEDS }); }
                    catch (e) { errors.push(`${key} seed ${i}: generate threw ${e && e.message}`); continue; }
                    if (!q) continue;
                    items++;
                    let sol;
                    try { sol = window.generateSolutionSteps(q); } catch (e) { errors.push(`${key} seed ${i}: generateSolutionSteps threw ${e && e.message}`); continue; }
                    const lines = (Array.isArray(sol) ? sol : []).map(plain);
                    lines.forEach((t, k) => {
                        const m = t.match(/\[object|\bundefined\b|\bNaN\b/);
                        if (m) found.push({ check: 'SOL-OBJECT', key, seed: i, text: t.slice(0, 140), why: m[0] });
                    });
                    const pl = lines.find((t) => /^Problem\s*:/.test(t));
                    if (pl != null) {
                        const body = pl.replace(/^Problem\s*:\s*/, '');
                        const qt = plain(q.text || q.question);
                        if (norm(body) === norm(qt)) continue;   // the question as asked: always fine
                        let why = '';
                        if (!body || body === 'Problem') why = 'empty';
                        else if (/_{2,}/.test(body)) why = 'blank __';
                        else if (GAP.test(body)) why = 'gap ?';
                        else if (/=/.test(qt.replace(/=\s*(_+|\?|[□☐▢])\s*[.?]?\s*$/, '')) && !/=/.test(body)) why = 'lost "="';   // a trailing "= ___" may go
                        if (why) found.push({ check: 'SOL-PROBLEM', key, seed: i, text: pl.slice(0, 140), why });
                    }
                }
            }
            return { found, errors, items, skills: list.length };
        }, { SKILL, CATEGORY, N_SEEDS });
        const pinned = new Set(Object.values(PINS).flat());
        let fail = false;
        console.log(`ws-solution-text: ${res.skills} skills, ${res.items} items, ${N_SEEDS} seeds`);
        for (const chk of ['SOL-OBJECT', 'SOL-PROBLEM']) {
            if (!ONLY.has(chk)) continue;
            const rows = res.found.filter((r) => r.check === chk);
            const keys = [...new Set(rows.map((r) => r.key))];
            const live = keys.filter((k) => !pinned.has(k));
            console.log(`${chk}: ${keys.length} skills, ${rows.length} items${keys.length - live.length ? ` (${keys.length - live.length} pinned)` : ''}`);
            for (const k of live) {
                const r = rows.filter((x) => x.key === k);
                console.log(`  FAIL ${chk} ${k} (${r.length} items): "${r[0].text}" [${r[0].why}]`);
                if (VERBOSE) r.slice(1).forEach((x) => console.log(`       seed ${x.seed}: "${x.text}" [${x.why}]`));
            }
            if (live.length) fail = true;
        }
        for (const e of res.errors) console.log(`  ERROR ${e}`);
        if (res.errors.length) fail = true;
        console.log(`ws-solution-text: ${fail ? 'FAIL' : 'OK'}`);
        code = fail && !REPORT_ONLY ? 1 : 0;
    } catch (e) {
        console.log(`ws-solution-text: ERROR ${e && e.stack || e}`);
        console.log('ws-solution-text: FAIL');
        code = 1;
    } finally {
        if (app) try { await app.close(); } catch (_) {}
    }
    exitAfterFlush(code);
})();
