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

(async () => {
    const app = await open({ seed: 1 });
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
