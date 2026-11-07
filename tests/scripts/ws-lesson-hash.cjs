// RENDER-HASH STAMPS of the sample lessons (design/LESSON_LIBRARY_PLAN.md phase 0): a hash of each
// packet's pupil and key HTML, per lesson, seed and size. A refactor of the lesson engine must
// leave every stamp unchanged (byte-identical samples); a stamp that changes after a critic pass
// makes that lesson `stale`.
//
//   node tests/scripts/ws-lesson-hash.cjs            # compare with design/lessons/render-stamps.json
//   node tests/scripts/ws-lesson-hash.cjs --write    # (re)take the baseline
//   node tests/scripts/ws-lesson-hash.cjs --seeds 4242,1001,777 --sizes L,S
//
// Prints one line per stamp that differs and `ws-lesson-hash: OK` / `FAIL`.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ROOT, open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes('--' + k);
const SEEDS = (arg('seeds', '4242,1001,777') || '').split(',').map((s) => parseInt(s, 10) >>> 0);
const SIZES = (arg('sizes', 'L,S') || '').split(',').map((s) => s.trim()).filter(Boolean);
const FILE = path.join(ROOT, 'design', 'lessons', 'render-stamps.json');

/** The sample lessons: by lesson id once the library lands, else by skill (the old request). */
const SAMPLES = [
    { id: 'add-within-10', skill: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 10, constant: [1, 2, 3] } } },
    { id: 'subtract-2-digit-regroup', skill: { categoryId: 'subtraction', skillId: 'sub_100_regroup' } },
    { id: 'round-nearest-10', skill: { categoryId: 'number_sense', skillId: 'nearest_10' } },
];

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex').slice(0, 16);

/**
 * --sheets (lf-engine P1c, critic r2 N1): EVERY lesson sheet - the three samples and every library lesson with a practice
 * skill, at L and S - prints at least one Independent Practice row and a Score, and its page ends on a blank foot of at
 * most 20 % of the body. A browser check (rendered pages). `--only sub,Y4.B1.S14` limits it; `--sizes L` too.
 * Prints `ws-lesson-hash --sheets: OK (n sheets)` / `FAIL (n)`.
 */
async function sheetsMain() {
    const ONLY = (arg('only', '') || '').split(',').filter(Boolean);
    const app = await open({ seed: 1, lock: 'ws-lesson-hash' });
    const ids = await app.page.evaluate(async () => {
        const lib = await import('/js/modules/lessons/library.js');
        return Object.entries(lib.LESSONS).filter(([, l]) => l && l.practice && l.practice.skill).map(([id]) => id);
    });
    const jobs = [];
    for (const l of SAMPLES) jobs.push({ name: l.id, short: l.id.split('-')[0], skill: l.skill, lessonId: '' });
    for (const id of ids) jobs.push({ name: id, short: id, skill: { categoryId: 'addition', skillId: 'add_facts' }, lessonId: id });
    const want = (j) => !ONLY.length || ONLY.some((o) => j.name === o || j.short === o || j.name.startsWith(o));
    const bad = [];
    let n = 0;
    for (const j of jobs.filter(want)) for (const size of SIZES) {
        const r = await app.page.evaluate(async ({ j, size }) => {
            try {
                const b = await window.buildSheet(Object.assign({ role: 'lesson', sections: [{ skills: [j.skill] }], size, paper: 'A4', seed: 4242, key: true, practicePages: 1, mixed: true }, j.lessonId ? { lessonId: j.lessonId } : {}));
                const pages = (b.pupilPages || []).filter((h) => /data-ws-sheet="lesson-sheet"/.test(h));
                return { doc: window.sheetDocument(pages.join('\n'), 'x', { paper: 'A4' }), n: pages.length };
            } catch (e) { return { error: String(e && e.message || e) }; }
        }, { j, size });
        if (r.error) { bad.push(`${j.name} ${size}: build error ${r.error}`); continue; }
        if (!r.n) continue;   // (a lesson with no lesson sheet)
        n++;
        const sheet = await app.page.browser().newPage();
        try {
            await sheet.setViewport({ width: 900, height: 1200 });
            await sheet.goto(app.page.url(), { waitUntil: 'domcontentloaded' });
            await sheet.setContent(r.doc, { waitUntil: 'networkidle0', timeout: 60000 });
            await sheet.evaluate(() => document.fonts && document.fonts.ready);
            const st = await sheet.evaluate(() => {
                const pgs = [...document.querySelectorAll('.ws-page')];
                const text = pgs.map((p) => p.textContent).join(' ');
                const last = pgs[pgs.length - 1];
                const body = last && last.querySelector('.ws-body');
                let blank = 0;
                if (body) {
                    const br = body.getBoundingClientRect();
                    const kids = [...body.children].filter((x) => x.getBoundingClientRect().height > 0);
                    const bottom = kids.length ? Math.max(...kids.map((x) => x.getBoundingClientRect().bottom)) : br.top;
                    blank = Math.round(Math.max(0, (br.bottom - bottom) / br.height) * 100);
                }
                const scoreM = /Score[^/]*\/\s*(\d+)/.exec(pgs[0] ? pgs[0].textContent : '');
                return { indep: /Independent Practice:/.test(text), score: scoreM ? Number(scoreM[1]) : 0, blank };
            });
            const probs = [];
            if (!st.indep) probs.push('no Independent Practice row');
            if (!(st.score > 0)) probs.push('no Score');
            if (st.blank > 20) probs.push(`blank foot ${st.blank} %`);
            if (probs.length) bad.push(`${j.name} ${size}: ${probs.join(', ')}`);
            else console.log(`  ${j.name} ${size}: Independent row, Score /${st.score}, foot ${st.blank} %`);
        } finally { await sheet.close(); }
    }
    await app.close();
    for (const b of bad) console.log(`  FAIL ${b}`);
    console.log(bad.length ? `ws-lesson-hash --sheets: FAIL (${bad.length} of ${n})` : `ws-lesson-hash --sheets: OK (${n} sheets)`);
    process.exit(bad.length ? 1 : 0);
}

if (has('sheets')) { sheetsMain().catch((e) => { console.error(e); process.exit(1); }); } else (async () => {
    const app = await open({ seed: 1, lock: 'ws-lesson-hash' });
    const stamps = {};
    for (const l of SAMPLES) for (const seed of SEEDS) for (const size of SIZES) {
        const r = await app.page.evaluate(async ({ skill, size, seed, lessonId }) => {
            const req = { role: 'lesson', sections: [{ skills: [skill] }], size, paper: 'A4', seed, key: true, practicePages: 1, mixed: true };
            if (lessonId && window.lessonById && window.lessonById(lessonId)) req.lessonId = lessonId;
            const b = await window.buildSheet(req);
            return { pupil: b.pupilHtml, key: b.keyHtml };
        }, { skill: l.skill, size, seed, lessonId: has('by-id') ? l.id : '' });
        stamps[`${l.id}|${seed}|${size}`] = { pupil: sha(r.pupil), key: sha(r.key) };
    }
    await app.close();
    if (has('write')) {
        fs.mkdirSync(path.dirname(FILE), { recursive: true });
        fs.writeFileSync(FILE, JSON.stringify(stamps, null, 1) + '\n');
        console.log(`ws-lesson-hash: wrote ${Object.keys(stamps).length} stamps to ${path.relative(ROOT, FILE)}`);
        return;
    }
    const base = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};
    const diff = Object.entries(stamps).filter(([k, v]) => !base[k] || base[k].pupil !== v.pupil || base[k].key !== v.key);
    for (const [k, v] of diff) console.log(`  CHANGED ${k}: pupil ${base[k] ? base[k].pupil : '-'} -> ${v.pupil}, key ${base[k] ? base[k].key : '-'} -> ${v.key}`);
    if (diff.length) { console.log(`ws-lesson-hash: FAIL (${diff.length} of ${Object.keys(stamps).length} stamps changed)`); process.exit(1); }
    console.log(`ws-lesson-hash: OK (${Object.keys(stamps).length} stamps byte-identical)`);
})().catch((e) => { console.error(e); process.exit(1); });
