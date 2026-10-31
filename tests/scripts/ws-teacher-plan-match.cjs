// ws-teacher-plan-match — the Print sheet's PLAN is what PRINTS (lane "mixed pages M2", dialog check r2 FAIL, IMPROVEMENT_PLAN
// §1.7 stop: "summary = what prints" survived two rounds because ws-teacher-arrangement compares the plan with the REQUESTS,
// never with the built pages). Every rule is a HARD FAIL; a lane may not soften, skip or exempt one to get green - fix the
// dialog or the engine.
//
// For every scenario (In sections AND Mixed up; facts 12/8 and 3/17 in 20; three skills with 50 %; the big-cell mixes
// add_facts + mult_2by2_standard and add_facts + add_word_problems in 20; ten skills), on the real Teacher site Print sheet:
//   pages    the built pages (tvSheetBuildNow, what Print prints) === plan.pages
//   titled   every printed pupil page carries a title (its .ws-title, or a continuation page's tab box)
//   counts   the built per-skill counts === plan.byKey (every skill, both ways)
//   numbered (r3 D1) footers read k/N over the whole print; problem numbers run 1, 2, 3 ... across pages (pupil and key)
//   filled   (r3 D2) Mixed up: no more pages than ceil(problems / the engine's perPage), every page but the last
//            >= 85 % of the even share
//   titled   also (r3 D3): no page carries the generic "I Can practise each skill in its own part"
//   summary  once the build has settled, the summary line's page count === the built pages, and it never says
//            "printed on N pages" or "the engine changed some counts" (the dialog admitting it planned wrong)
//
//   node tests/scripts/ws-teacher-plan-match.cjs [--quick] [--only 50pct,big-mult]
//   node tests/scripts/ws-teacher-plan-match.cjs --fixture <results.json>    # judge recorded results (backtest)
//   node tests/scripts/ws-teacher-plan-match.cjs --record <results.json>     # also write what was measured
// A results file is [{label, kind, plan:{pages, byKey}, built:{pages, byKey, error}, titles:[...], lineAfterBuild}].
// Prints `ws-teacher-plan-match: OK` / `FAIL (n)`; exits 1 on FAIL.
'use strict';
const fs = require('fs');
const path = require('path');

const TOOL = 'ws-teacher-plan-match';
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(`--${k}`); return i > -1 ? args[i + 1] : d; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The fails of one recorded scenario. Pure. */
function judgeScenario(r) {
    const out = [];
    const L = `${r.label} (${r.kind})`;
    if (!r.plan || r.plan.error) { out.push(`${L}: no plan (${r.plan && r.plan.error})`); return out; }
    if (!r.built || r.built.error) { out.push(`${L}: the build failed (${r.built && r.built.error})`); return out; }
    if (r.built.pages !== r.plan.pages) out.push(`pages: ${L}: plans ${r.plan.pages} page(s), prints ${r.built.pages}`);
    (r.titles || []).forEach((t, i) => { if (!String(t || '').trim()) out.push(`titled: ${L}: printed page ${i + 1} of ${r.titles.length} has no title`); });
    if ((r.titles || []).length !== r.built.pages) out.push(`titled: ${L}: ${(r.titles || []).length} pupil pages read, the build says ${r.built.pages}`);
    const keys = [...new Set([...Object.keys(r.plan.byKey || {}), ...Object.keys(r.built.byKey || {})])].sort();
    for (const k of keys) {
        const p = (r.plan.byKey || {})[k] || 0; const b = (r.built.byKey || {})[k] || 0;
        if (p !== b) out.push(`counts: ${L}: ${k} plans ${p}, prints ${b}`);
    }
    // r3 D3: never the generic parts title
    (r.titles || []).forEach((t, i) => { if (/^I Can practise each skill in its own part$/i.test(String(t || '').trim())) out.push(`titled: ${L}: printed page ${i + 1} has the generic title "${t}"`); });
    // r3 D1: one numbered sheet - footers k/N over the whole print, numbering continues across pages (pupil and key)
    if (r.numbering) for (const side of ['pupil', 'key']) {
        const pgs = r.numbering[side] || [];
        const N = pgs.length;
        pgs.forEach((pg, i) => { if (N && String(pg.foot || '').trim() !== `${i + 1}/${N}`) out.push(`numbered: ${L}: ${side} page ${i + 1} of ${N} is footed "${pg.foot}"`); });
        const nums = pgs.flatMap((pg) => pg.nums || []);
        const bad = nums.findIndex((n, i) => n !== i + 1);
        if (bad > -1) out.push(`numbered: ${L}: ${side} problem ${bad + 1} is numbered ${nums[bad]} (${pgs.map((pg) => (pg.nums || []).join(',')).join(' | ')})`);
    }
    // r3 D2: Mixed up - every page but the last at least 85 % of what one page of this mix holds (the engine's perPage)
    const per = Number(r.perPage) || 0;
    if (/^mixed/.test(r.kind) && per > 0 && r.numbering) {
        const pgs = r.numbering.pupil || [];
        const total = pgs.reduce((a, pg) => a + (pg.nums || []).length, 0);
        // no page more than the mix needs at its real capacity, and the pages shared evenly (a non-last page holds
        // >= 85 % of the even share): 20 at 12 a page is 2 pages, never 10 / 9 / 1
        // (critic r3 D2: a HARD FAIL - RED until mixed-practice.js lays the even pages at its own perPage; hand-over)
        if (pgs.length > Math.ceil(total / per)) out.push(`filled: ${L}: ${total} problems on ${pgs.length} pages where a page of this mix holds ${per}`);
        const share = total / Math.max(1, pgs.length);
        pgs.slice(0, -1).forEach((pg, i) => { const n = (pg.nums || []).length; if (n < 0.85 * share) out.push(`filled: ${L}: page ${i + 1} of ${pgs.length} holds ${n} of an even ${share.toFixed(1)}`); });
    }
    const line = String(r.lineAfterBuild || '');
    const m = /^(\d+) pages?\b/.exec(line);
    if (!m) out.push(`summary: ${L}: the summary line names no page count ("${line}")`);
    else if (Number(m[1]) !== r.built.pages) out.push(`summary: ${L}: the summary says ${m[1]} page(s), ${r.built.pages} print ("${line}")`);
    if (/printed on \d+ pages?|engine changed/i.test(line)) out.push(`summary: ${L}: the summary admits the plan was wrong ("${line}")`);
    return out;
}

/** The pupil pages' titles of a built document. Pure. */
function titlesOf(doc) {
    const parts = String(doc || '').split(/(?=<section\b[^>]*class="ws-page)/).filter((s) => /^<section/.test(s));
    return parts.filter((p) => !/data-ws-mode="key"/.test(p.slice(0, 400))).map((p) => {
        const strip = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const t = strip((p.match(/<div class="ws-title">([\s\S]*?)<\/div>/) || [])[1]);
        const tab = strip((p.match(/<div class="ws-tabbox[^"]*">([\s\S]*?)<\/div>/) || [])[1]);
        return t || tab;
    });
}

/** Per pupil / key page: the footer's centre (k/N) and the problem numbers in print order. Pure. */
function numberingOf(doc) {
    const parts = String(doc || '').split(/(?=<section\b[^>]*class="ws-page)/).filter((s) => /^<section/.test(s));
    const out = { pupil: [], key: [] };
    for (const p of parts) {
        const foot = ((p.match(/<footer class="ws-foot"[^>]*>[\s\S]*?<b>([\s\S]*?)<\/b>/) || [])[1] || '').replace(/<[^>]+>/g, '').trim();
        const nums = [...p.matchAll(/class="ws-tab[^"]*" data-ws-label="tab">(\d+)</g)].map((m) => Number(m[1]));
        out[/data-ws-mode="key"/.test(p.slice(0, 400)) ? 'key' : 'pupil'].push({ foot, nums });
    }
    return out;
}

const SCEN = [
    { id: '12-8', label: 'facts 12/8 in 20', skills: [['addition', 'add_facts'], ['subtraction', 'sub_facts']], total: 20, typed: { 'addition:add_facts': '12', 'subtraction:sub_facts': '8' } },
    { id: '3-17', label: 'facts 3/17 in 20', skills: [['addition', 'add_facts'], ['subtraction', 'sub_facts']], total: 20, typed: { 'addition:add_facts': '3', 'subtraction:sub_facts': '17' } },
    { id: '50pct', label: 'three skills, add 50 % of 20', skills: [['addition', 'add_facts'], ['subtraction', 'sub_facts'], ['multiplication', 'mult_facts']], total: 20, typed: { 'addition:add_facts': '50%' } },
    { id: 'big-mult', label: 'add_facts + mult_2by2_standard in 20', skills: [['addition', 'add_facts'], ['multiplication', 'mult_2by2_standard']], total: 20 },
    { id: 'big-word', label: 'add_facts + add_word_problems in 20', skills: [['addition', 'add_facts'], ['addition', 'add_word_problems']], total: 20 },
    { id: 'ten', label: 'ten skills, default', skills: [['addition', 'add_facts'], ['subtraction', 'sub_facts'], ['multiplication', 'mult_facts'], ['division', 'div_facts'], ['addition', 'add_within_100'], ['subtraction', 'sub_within_100'], ['addition', 'add_doubles'], ['subtraction', 'sub_within_10'], ['addition', 'add_within_10'], ['multiplication', 'multiply']] },
];

async function live() {
    const { open, waitFor } = require('../lib/ws-harness.cjs');
    const QUICK = args.includes('--quick');
    const only = arg('only', '') ? arg('only', '').split(',') : QUICK ? ['50pct', 'big-mult'] : null;
    const app = await open({ viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page } = app;
    page.on('dialog', (d) => d.accept());
    const results = [];
    try {
        await page.evaluate(() => { try { localStorage.removeItem('mq_teacher_sheet'); } catch (e) { /* */ } window.setUserRole('teacher'); });
        await waitFor(page, () => document.body.classList.contains('teacher-mode'), 10000, 'teacher mode');
        const setup = async (skills) => {
            await page.evaluate((skills) => {
                try { window.tvCloseSheet(); } catch (e) { /* */ }
                try { localStorage.removeItem('mq_teacher_sheet'); } catch (e) { /* */ }
                window.UnifiedSkills.clear();
                for (const [c, s] of skills) window.UnifiedSkills.add({ domainId: window.getDomainByCategory(c), categoryId: c, skillId: s, skillLabel: s });
                window.skillQueue = [...window.UnifiedSkills.skills];
                window.tvOpenSheet('print');
            }, skills);
            await sleep(600);
        };
        const click = async (a, v) => { const ok = await page.evaluate(([a, v]) => { const b = document.querySelector(`[data-act="${a}"][data-v="${v}"]`); if (b) { b.click(); return true; } return false; }, [a, v]); await sleep(350); return ok; };
        const type = async (key, txt) => {
            await page.evaluate((k) => document.querySelector(`[data-act="shareedit"][data-v="${k}"]`).click(), key);
            await sleep(250);
            await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control');
            await page.keyboard.type(txt); await page.keyboard.press('Enter'); await sleep(600);
        };
        const settle = async () => {
            let prev = '';
            for (let i = 0; i < 60; i++) {
                await sleep(400);
                const cur = await page.evaluate(() => { const s = window.tvSheetState(); return JSON.stringify([s.summary && s.summary.line, s.plan && s.plan.pages, s.built && s.built.pages, s.building, (document.querySelector('.tvs-side') || {}).innerText]); });
                if (cur === prev && !/Working out|Making|"building":true/.test(cur)) return;
                prev = cur;
            }
        };
        for (const sc of SCEN.filter((s) => !only || only.includes(s.id))) for (const kind of ['sections', 'mixed']) {
            await setup(sc.skills);
            const okKind = await click('kind', kind);
            if (sc.total) { await click('mode', 'total'); await click('ntotal', String(sc.total)); }
            for (const [k, v] of Object.entries(sc.typed || {})) await type(k, v);
            await settle(); await sleep(1200); await settle();
            const b = await page.evaluate(async () => { const r = await window.tvSheetBuildNow(); return r.error ? { error: r.error } : { pages: r.pages, byKey: r.byKey, plan: r.plan, doc: r.doc, perPage: r.fits0 && r.fits0.perPage }; });
            await settle();
            const line = await page.evaluate(() => { const s = window.tvSheetState(); return s.summary && s.summary.line; });
            const r = { label: sc.label, kind: okKind ? kind : `${kind} (no choice)`, plan: b.plan ? { pages: b.plan.pages, byKey: b.plan.byKey } : { error: b.error }, built: b.error ? { error: b.error } : { pages: b.pages, byKey: b.byKey }, titles: titlesOf(b.doc), numbering: b.doc ? numberingOf(b.doc) : null, perPage: b.perPage || 0, lineAfterBuild: line };
            results.push(r);
        }
        const errs = app.problems.filter((p) => p.type !== 'requestfailed' && !/ERR_ABORTED/.test(p.text || ''));
        if (errs.length) results.push({ label: 'page errors', kind: '-', plan: { error: errs.map((e) => e.text).slice(0, 3).join(' | ') } });
    } finally {
        await app.close();
    }
    return results;
}

if (require.main === module) (async () => {
    const fixture = arg('fixture', '');
    const results = fixture ? JSON.parse(fs.readFileSync(path.resolve(fixture), 'utf8')) : await live();
    if (arg('record', '')) fs.writeFileSync(path.resolve(arg('record', '')), JSON.stringify(results, null, 1));
    const fails = results.flatMap(judgeScenario);
    const by = {};
    for (const f of fails) { const k = (/^(\w+):/.exec(f) || [])[1] || 'other'; by[k] = (by[k] || 0) + 1; }
    for (const f of fails) console.log(`  FAIL ${f}`);
    console.log(`  ${results.length} scenario(s) judged; per rule: ${['pages', 'titled', 'counts', 'summary', 'numbered', 'filled'].map((k) => `${k} ${by[k] || 0}`).join(' · ')}${by.other ? ` · other ${by.other}` : ''}`);
    console.log(fails.length ? `${TOOL}: FAIL (${fails.length})` : `${TOOL}: OK`);
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log(`${TOOL}: FAIL (crash)`); process.exit(1); });

module.exports = { judgeScenario, titlesOf, numberingOf };
