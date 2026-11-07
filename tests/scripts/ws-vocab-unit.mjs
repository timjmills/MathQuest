// ws-vocab-unit — the machine checks of the picture vocabulary tasks (lane lf-vocab, 2026-11-07;
// design/cards/vocabulary/vocabulary.md). Node only (the app's generator through ws-card-rulings loadApp).
//
//   node tests/scripts/ws-vocab-unit.mjs            # prints ws-vocab-unit: OK | FAIL
//   node tests/scripts/ws-vocab-unit.mjs --fixture tests/fixtures/precritic/vocab-sets.fail.mjs   # the data rules on a fixture
//
// V1  every word of every lesson set has a library picture, a meaning (<= 8 words) and only known notWith words
// V2  every picture's alt text never contains its own word (a screen reader would give the answer away, L-LEAK)
// V3  Match 3 items: three different words, no two of them notWith; the word row is a derangement (no word
//     under its own picture); the key letters are the picture letters of the words
// V4  1 picture, 3 words items: the bank holds the word, three different words, none notWith the word
// V5  a page (a run of `perPage` items, dealt as print deals them, a new page resetting) never repeats a word in
//     Match 3 until the pool is used up, and never repeats a picture in 1 picture, 3 words before that either
//     (pre-critic render 2026-11-07: "column" in two Match 3 cells of one page)
// V6  every lesson set's first three words may sit in one Match 3 cell (the lesson page's first cell)
// V7  every lesson set's six words split into two clash-free trios (the lesson page's two Match 3 cells)

import { pathToFileURL } from 'url';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const fails = [];
const fail = (m) => fails.push(m);

// --fixture <file.mjs>: check a fixture's {VOCAB_WORDS, VOCAB_SETS} (the data rules V1, V6, V7 only; the backtest rows in
// tests/fixtures/precritic/backtests.json), with the library's pictures and compatible() rule.
const fxAt = process.argv.indexOf('--fixture');
const FIXTURE = fxAt > 0 ? process.argv[fxAt + 1] : null;
const W0 = await imp('js/modules/sheet/lesson-pages/vocab-words.js');
const P = await imp('js/modules/sheet/graphics/vocab-pictures.js');
let W = W0;
if (FIXTURE) {
    const fx = await import(pathToFileURL(path.resolve(FIXTURE)).href);
    const words = fx.VOCAB_WORDS || W0.VOCAB_WORDS;
    const compatible = (ws) => { for (const a of ws) for (const b of ws) if (a !== b && ((words[a] || {}).notWith || []).includes(b)) return false; return true; };
    W = { VOCAB_WORDS: words, VOCAB_SETS: fx.VOCAB_SETS, compatible, VOCAB_GRADES: [], gradeWords: () => [] };
}

// V1, V2, V6
for (const s of W.VOCAB_SETS) {
    for (const w of s.words) {
        if (!P.hasVocabPicture(w)) fail(`V1 ${s.lesson}: "${w}" has no picture`);
        const e = W.VOCAB_WORDS[w];
        if (!e) { fail(`V1 ${s.lesson}: "${w}" has no VOCAB_WORDS entry`); continue; }
        if (String(e.meaning).split(/\s+/).length > 8) fail(`V1 "${w}": meaning over 8 words`);
    }
    if (!W.compatible(s.words.slice(0, 3))) fail(`V6 ${s.lesson}: the first three words clash (notWith)`);
    // V7: the six words split into two trios with no notWith pair inside (a Match 3 page shows every word once)
    const ws = s.words;
    let split = false;
    for (let a = 0; a < ws.length && !split; a++) for (let b = a + 1; b < ws.length && !split; b++) for (let c = b + 1; c < ws.length && !split; c++) {
        const t = [ws[a], ws[b], ws[c]], rest = ws.filter((w) => !t.includes(w));
        if (W.compatible(t) && (rest.length !== 3 || W.compatible(rest))) split = true;
    }
    if (!split) fail(`V7 ${s.lesson}: the words cannot split into two clash-free trios`);
}
for (const [w, e] of Object.entries(W.VOCAB_WORDS)) for (const n of e.notWith) if (!W.VOCAB_WORDS[n]) fail(`V1 "${w}": notWith "${n}" is not a word`);
for (const w of P.VOCAB_PICTURE_IDS) if (new RegExp(`\\b${w}\\b`, 'i').test(P.vocabPictureAlt(w))) fail(`V2 "${w}": its alt text names the word`);

if (FIXTURE) {
    console.log(`ws-vocab-unit: fixture ${path.basename(FIXTURE)}, ${W.VOCAB_SETS.length} lesson sets (data rules V1, V6, V7)`);
    for (const f of fails.slice(0, 40)) console.log(`  - ${f}`);
    console.log(`ws-vocab-unit: ${fails.length ? `FAIL (${fails.length})` : 'OK'}`);
    process.exit(fails.length ? 1 : 0);
}
// V3-V5 through the app's generator
const { loadApp } = await imp('tests/scripts/ws-card-rulings.mjs');
const app = await loadApp(ROOT);
const LET = ['A', 'B', 'C'];
const deal = (skill, opts, n, seed) => {
    const out = [];
    try { app.pageDeal && app.pageDeal.resetPageDeals && app.pageDeal.resetPageDeals(); } catch (e) { /* none */ }
    for (let i = 0; i < n; i++) out.push(app.gq.generateQuestionFor({ category: 'vocabulary', skill, opts, seed: seed + i, itemIndex: i, itemCount: n }));
    return out;
};
const runs = [];
for (const g of W.VOCAB_GRADES) runs.push({ opts: { vocabGrade: g } });
W.VOCAB_SETS.forEach((_, i) => runs.push({ opts: { vocabSet: i } }));
let items = 0;
for (const r of runs) {
    for (const [skill, task] of [['vocab_grade_pictures', 'match3'], ['vocab_pick3_words', 'pick3']]) {
        const qs = deal(skill, r.opts, task === 'match3' ? 4 : 8, 9000);
        const seen = [];
        for (const q of qs) {
            items++;
            const tag = `${skill} ${JSON.stringify(r.opts)}`;
            const p = q && q.cell && q.cell.payload;
            if (!q || !q.cell || q.cell.template !== (task === 'match3' ? 'vocab-match3' : 'vocab-pick3') || !p) { fail(`V3/V4 ${tag}: no ${task} cell`); continue; }
            if (task === 'match3') {
                if (new Set(p.words).size !== 3) fail(`V3 ${tag}: words not three different (${p.words})`);
                if (!W.compatible(p.words)) fail(`V3 ${tag}: notWith words together (${p.words})`);
                if (p.order.some((wi, n) => wi === n)) fail(`V3 ${tag}: a word under its own picture (${p.order})`);
                if (q.ans !== p.order.map((i) => LET[i]).join(', ')) fail(`V3 ${tag}: key ${q.ans} is not the picture letters`);
                seen.push(...p.words);
            } else {
                if (!p.bank.includes(p.word) || new Set(p.bank).size !== 3) fail(`V4 ${tag}: bank ${p.bank} for ${p.word}`);
                if (p.bank.some((w) => w !== p.word && !W.compatible([p.word, w]))) fail(`V4 ${tag}: a bank word reads as the picture (${p.bank} / ${p.word})`);
                if (q.ans !== p.word) fail(`V4 ${tag}: key ${q.ans} is not ${p.word}`);
                seen.push(p.word);
            }
        }
        // V5: no repeat before the pool is used up
        const pool = r.opts.vocabSet !== undefined ? W.VOCAB_SETS[r.opts.vocabSet].words : W.gradeWords(r.opts.vocabGrade);
        const firstRun = seen.slice(0, pool.length);
        if (new Set(firstRun).size !== firstRun.length && seen.length >= 2) {
            // a Match 3 page of 6 words takes 2 trios: only flag a repeat inside the first pool-length words
            const dup = firstRun.find((w, i) => firstRun.indexOf(w) !== i);
            fail(`V5 ${skill} ${JSON.stringify(r.opts)}: "${dup}" repeats on the page before the ${pool.length} words are used`);
        }
    }
}
console.log(`ws-vocab-unit: ${W.VOCAB_SETS.length} lesson sets, ${P.VOCAB_PICTURE_IDS.length} pictures, ${items} items dealt`);
for (const f of fails.slice(0, 40)) console.log(`  - ${f}`);
console.log(`ws-vocab-unit: ${fails.length ? `FAIL (${fails.length})` : 'OK'}`);
process.exit(fails.length ? 1 : 0);
