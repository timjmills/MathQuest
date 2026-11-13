#!/usr/bin/env node
// ws-pv-identify-heads — placevalue:identify's place heads follow the page role (lead ruling, PEDAGOGY 4.1a, 2026-11-13;
// lf-placevalue checks pass). identify's answer IS the place name, so the heads over its numeral - the H T O letters of the
// `labels` support, or the place names of the `chart` - give the answer away on the UNAIDED pages: Review, Test and the
// pre-skill check (the lesson's Check), on paper AND on screen (the quiz is the online test host). identify's own lesson
// Practice (independent) and Mixed (mixed-practice) pages keep them as taught support.
//
//   tests/scripts/mq-browser-run.sh node tests/scripts/ws-pv-identify-heads.cjs
//   ... --only PV-HEADS-UNAIDED,PV-HEADS-TAUGHT,PV-HEADS-QUIZ   --sizes S,L   --seeds 2
//   MQ_ROOT=<tree> ... (ws-backtest commit-pair)
//
// PV-HEADS-UNAIDED  review / test / pre-skill-check at S / M / L, the default support (labels) and support=chart: every
//                   "name the place" item (an underlined digit in a numeral) is drawn with NO heads row. FAIL per page with
//                   one or more headed items. (The pre-skill check is built for placevalue:value, whose earlier skills deal
//                   identify; one with no identify item is reported, not judged.)
// PV-HEADS-TAUGHT   the control: independent and mixed-practice at S / M / L keep the heads on every item (the support is
//                   the role's to drop only where the ruling says).
// PV-HEADS-QUIZ     the screen: the quiz builder deals 6 placevalue:identify questions (openQuizBuilder +
//                   addMultipleQuestions with the category), saves the quiz, opens it as the pupil's link does and starts
//                   it: no item on the quiz paper has heads, and the quiz draws place-value numerals at all (a builder that
//                   deals fractions:identify for the bare id 'identify' is a FAIL too).
// Prints `ws-pv-identify-heads: OK` / `FAIL (n)` last; exits 1 on FAIL.
const H = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const ONLY = arg('only', '') ? list(arg('only')) : null;
const on = (id) => !ONLY || ONLY.includes(id);
const SIZES = list(arg('sizes', 'S,M,L'));
const NSEED = Number(arg('seeds', 2));
const UNAIDED = ['review', 'test', 'pre-skill-check'];
const TAUGHT = ['independent', 'mixed-practice'];

/** In the page (within `scope`): every "name the place" numeral - an underlined digit - and whether a heads row sits over it. */
function readHeads(scope) {
    const root = scope ? document.querySelector(scope) : document;
    if (!root) return { error: `no ${scope}` };
    const HEAD = /^(O|T|H|Th|TTh|HTh|M|Ones|Tens|Hundreds|Thousands|Ten thousands|Hundred thousands|Millions)$/i;
    const items = [];
    for (const u of root.querySelectorAll('span[style*="border-bottom:0.08em"]')) {
        if (!/^\d$/.test((u.textContent || '').trim())) continue;
        const t = u.closest('table');
        let heads = false;
        if (t && t.rows.length >= 2) {
            const first = [...t.rows[0].cells].map((c) => (c.textContent || '').trim()).filter(Boolean);
            heads = first.length > 0 && first.every((x) => HEAD.test(x));
        }
        const cell = u.closest('[data-ws-cell], .mq-scell, .qt-question, .mq-qtq, .problem-card') || u.parentElement;
        items.push({ heads, text: ((cell && cell.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 60) });
    }
    return { items };
}

(async () => {
    const app = await H.open({});
    const page = app.page;
    const sheet = await app.browser.newPage();
    await sheet.setViewport({ width: 900, height: 1200 });
    await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });
    const bad = [];
    const notes = [];
    const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
    const build = async (role, size, seed, skillId, opts) => {
        const r = await page.evaluate(async ({ role, size, seed, skillId, opts }) => {
            try {
                const r = await window.buildSheet({ role, sections: [{ skills: [Object.assign({ categoryId: 'placevalue', skillId }, opts ? { opts } : {})], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed, form: 'A', key: true, anchors: 'off' });
                return { html: window.sheetDocument(r.pupilHtml, r.title || 't', { paper: 'A4' }) };
            } catch (e) { return { error: String((e && e.message) || e).slice(0, 200) }; }
        }, { role, size, seed, skillId, opts });
        if (r.error) return { error: r.error };
        await sheet.setContent(r.html, { waitUntil: 'load', timeout: 60000 });
        return sheet.evaluate(readHeads, null);
    };
    let pagesJudged = 0;
    const judge = (id, roles, want) => async () => {
        for (const role of roles) for (const size of SIZES) for (const [tag, opts] of (want ? [['labels', null]] : [['labels', null], ['chart', { support: 'chart' }]])) {
            for (let k = 0; k < NSEED; k++) {
                const seed = (hash(`placevalue__identify:${role}`) + k * 7919) % 1000000;
                const skillId = role === 'pre-skill-check' ? 'value' : 'identify';
                const r = await build(role, size, seed, skillId, opts);
                const where = `${role} ${size} ${tag} seed ${seed}${skillId !== 'identify' ? ` (for placevalue:${skillId})` : ''}`;
                if (r.error) { bad.push(`${id} ${where}: ${r.error}`); continue; }
                if (!r.items.length) { notes.push(`${id} ${where}: no "name the place" item dealt - not judged`); continue; }
                pagesJudged++;
                const headed = r.items.filter((x) => x.heads).length;
                if (want ? headed < r.items.length : headed > 0) bad.push(`${id} ${where}: ${headed} of ${r.items.length} "name the place" item(s) drawn with place heads${want ? ' - the taught support was lost' : ' (the heads give the place name: the answer)'}, e.g. "${(r.items.find((x) => (want ? !x.heads : x.heads)) || {}).text}"`);
            }
        }
    };
    if (on('PV-HEADS-UNAIDED')) await judge('PV-HEADS-UNAIDED', UNAIDED, false)();
    if (on('PV-HEADS-TAUGHT')) await judge('PV-HEADS-TAUGHT', TAUGHT, true)();
    if (on('PV-HEADS-QUIZ')) {
        // the real quiz path: the builder deals the questions (its own generation, quiz-builder safeGenerateQuestion), the quiz
        // is saved, opened as a pupil would open its link, started, and its paper read
        await page.setViewport({ width: 1280, height: 900 });
        const r = await page.evaluate(async () => {
            try {
                window.openQuizBuilder();
                window.addMultipleQuestions('identify', 6, 'placevalue');
                await window.saveQuiz();
                const tests = await window.listTests();
                const test = tests && tests[0];
                if (!test) return { error: 'no saved quiz' };
                const qs = test.sections.flatMap((s) => s.questions);
                const cats = qs.map((q) => q.categoryId || (q.questionData && q.questionData.categoryId) || '?');
                window.handleQuizURL(window.compressTestForURL(test));
                const nm = document.getElementById('qtStudentName'); if (nm) { nm.value = 'A'; nm.dispatchEvent(new Event('input')); }
                window.startQuizTest();
                return { n: qs.length, cats };
            } catch (e) { return { error: String((e && e.message) || e).slice(0, 200) }; }
        });
        await new Promise((res) => setTimeout(res, 600));
        const q = r.error ? r : await page.evaluate(readHeads, '#quizTakeView');
        if (q.error) bad.push(`PV-HEADS-QUIZ: ${q.error}`);
        else if (!q.items.length) bad.push(`PV-HEADS-QUIZ: the quiz drew no place-value numeral for ${r.n} placevalue:identify question(s) (categories dealt: ${[...new Set(r.cats)].join(', ')})`);
        else {
            pagesJudged++;
            const headed = q.items.filter((x) => x.heads).length;
            console.log(`  PV-HEADS-QUIZ: ${q.items.length} quiz item(s) drawn (${r.n} dealt, ${[...new Set(r.cats)].join(', ')}), ${headed} with heads`);
            if (headed) bad.push(`PV-HEADS-QUIZ: ${headed} of ${q.items.length} quiz item(s) drawn with place heads (the quiz is the online test: unaided), e.g. "${q.items.find((x) => x.heads).text}"`);
        }
    }
    await app.close();
    for (const n of notes) console.log(`  note ${n}`);
    for (const b of bad) console.log(`  FAIL ${b}`);
    console.log(bad.length ? `ws-pv-identify-heads: FAIL (${bad.length}; ${pagesJudged} page(s) judged)` : `ws-pv-identify-heads: OK (${pagesJudged} page(s) judged, ${notes.length} not dealt)`);
    process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.log(`ws-pv-identify-heads: FAIL (${(e && e.stack) || e})`); process.exit(1); });
