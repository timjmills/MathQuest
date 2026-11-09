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

// (MQ_ROOT: check another checkout - ws-backtest's commit-pair rows run today's checks on the failed head)
const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
// --only V14,V15: judge only those checks (a backtest row proves one check)
const ONLY = (() => { const i = process.argv.indexOf('--only'); return i > 0 ? process.argv[i + 1].split(',').map((x) => x.trim()) : null; })();
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const fails = [];
const fail = (m) => { if (!ONLY || ONLY.some((k) => String(m).startsWith(k + ' ') || String(m).startsWith(k + ':'))) fails.push(m); };

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
    for (const f of fails.slice(0, Number(process.env.VOCAB_SHOW) || 40)) console.log(`  - ${f}`);
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
// ---- round 3 (rule 5): the checks of the five defects that survived critic rounds 1 and 2 ----------------------------
const K = await imp('js/modules/sheet/index.js');
const PG = await imp('js/modules/sheet/paginate.js');
// An independent reading of a drawn picture: its viewBox, its printed width (mm) and the extent and sizes of its marks.
function readSvg(svg) {
    const vb = /viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/.exec(svg).slice(1).map(Number);
    const wm = /width:([\d.]+)mm/.exec(svg);
    const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    const add = (x, y) => { box.x0 = Math.min(box.x0, x); box.x1 = Math.max(box.x1, x); box.y0 = Math.min(box.y0, y); box.y1 = Math.max(box.y1, y); };
    const num = (s, k) => Number((new RegExp(`\\b${k}="([-\\d.]+)"`).exec(s) || [])[1] || 0);
    const texts = [], rects = [], circles = [];
    for (const [t] of svg.matchAll(/<rect [^>]*>/g)) { const x = num(t, 'x'), y = num(t, 'y'), w = num(t, 'width'), h = num(t, 'height'); add(x, y); add(x + w, y + h); rects.push(Math.min(w, h)); }
    for (const [t] of svg.matchAll(/<line [^>]*>/g)) { add(num(t, 'x1'), num(t, 'y1')); add(num(t, 'x2'), num(t, 'y2')); }
    for (const [t] of svg.matchAll(/<circle [^>]*>/g)) { const x = num(t, 'cx'), y = num(t, 'cy'), r = num(t, 'r'); add(x - r, y - r); add(x + r, y + r); circles.push(2 * r); }
    for (const [, d] of svg.matchAll(/<path d="([^"]+)"/g)) {
        let cx = 0, cy = 0;
        for (const [, c, args] of d.matchAll(/([MLQHVAZmlhvz])([^MLQHVAZmlhvz]*)/g)) {
            const a = (args.match(/-?[\d.]+/g) || []).map(Number);
            if (c === 'M' || c === 'L') { cx = a[0]; cy = a[1]; } else if (c === 'Q') { add(a[0], a[1]); cx = a[2]; cy = a[3]; } else if (c === 'A') { cx = a[5]; cy = a[6]; }
            else if (c === 'H') cx = a[0]; else if (c === 'V') cy = a[0]; else if (c === 'h') cx += a[0]; else if (c === 'v') cy += a[0]; else if (c === 'l' || c === 'm') { cx += a[0]; cy += a[1]; }
            if (c !== 'Z' && c !== 'z') add(cx, cy);
        }
    }
    for (const [, t, body] of svg.matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)) {
        const x = num(t, 'x'), y = num(t, 'y'), s = num(t, 'font-size'), len = body.replace(/&[a-z#0-9]+;/g, 'x').length;
        const w = len * 0.56 * s, anchor = /text-anchor="start"/.test(t) ? 0 : /text-anchor="end"/.test(t) ? 1 : 0.5;
        add(x - anchor * w, y - s / 2); add(x + (1 - anchor) * w, y + s / 2); texts.push(s);
    }
    return { vb, wMm: wm ? Number(wm[1]) : null, box, texts, rects, circles };
}
const picsIn = (html) => [...html.matchAll(/<svg class="mq-vpic"[^]*?<\/svg>/g)].map((m) => ({ id: /data-vpic="([^"]+)"/.exec(m[0])[1], ...readSvg(m[0]) }));
const gradesOf = (w) => [...new Set(W.VOCAB_SETS.filter((s) => s.words.includes(w)).map((s) => s.grade))];
const classOf = (g) => (g <= 1 ? 0 : g <= 3 ? 1 : 2);
const PT = 0.3528;
// V8: every picture uses its drawing area (its marks span >= 50 % of the viewBox in BOTH directions) and no text in it is
// under 7 canvas units (r1 #13 / r2 #2: the ten rod 3.4 mm tall, "one" a lone square, number name at 10 pt)
for (const id of P.VOCAB_PICTURE_IDS) {
    const r = picsIn(P.vocabPictureSVG(K.resolveCtx({ size: 'L' }), id, { wMm: 40 }))[0];
    const fx = (r.box.x1 - r.box.x0) / r.vb[2], fy = (r.box.y1 - r.box.y0) / r.vb[3];
    if (fx < 0.5 || fy < 0.5) fail(`V8 "${id}": its marks span ${Math.round(fx * 100)} % x ${Math.round(fy * 100)} % of its drawing area (need 50 % both ways)`);
    for (const s of r.texts) if (s < 7) { fail(`V8 "${id}": text at ${s} canvas units (need 7)`); break; }
}
// V9: every picture, drawn as each cell draws it for the grades that deal its word (every size S/M/L), keeps its text
// >= 16 pt for K-1 and >= 14 pt for grades 2-5, and its smallest box >= 4 mm and ring / dot >= 2.5 mm
// (r1 #17 / r2 #10: grade 1 Match strips at 11 pt; r2 #2: the ten rod's 3.4 mm units)
for (const id of P.VOCAB_PICTURE_IDS) {
    for (const g of gradesOf(id)) {
        const floor = classOf(g) === 0 ? 16 : 14;
        for (const size of ['S', 'M', 'L']) {
            const ctx = K.resolveCtx({ size, mode: 'print' });
            const other = W.VOCAB_SETS.find((s) => s.grade === g && s.words.includes(id)).words.filter((w) => w !== id && W.compatible([w, id]));
            const hosts = [['vocab-match3', { words: [id, ...other.filter((w, i, a) => W.compatible([id, w, ...a.slice(0, i)])).slice(0, 2)], order: [1, 2, 0], grade: g }],
                ['vocab-pick3', { word: id, bank: [id, ...other.slice().sort((a, b) => b.length - a.length).slice(0, 2)], grade: g }]];   // (the bank's two longest words: the narrowest picture)
            for (const [tpl, payload] of hosts) {
                const pic = picsIn(K.renderCell({ cell: { template: tpl, v: 1, payload } }, ctx)).find((x) => x.id === id);
                if (!pic || !pic.wMm) { fail(`V9 ${tpl} "${id}": no printed width`); continue; }
                const sc = pic.wMm / pic.vb[2];
                const minT = Math.min(...pic.texts) * sc / PT, minR = Math.min(...pic.rects) * sc, minC = Math.min(...pic.circles) * sc;
                if (pic.texts.length && minT < floor - 0.05) fail(`V9 ${tpl} ${size} grade ${g} "${id}": text ${minT.toFixed(1)} pt (need ${floor})`);
                // (one, ten and hundred print ONE unit square, the hundred's tenth (V16): their box floor is 2.3 mm (the hundred flat's unit in a 25 mm box) -
                // a 4 mm "one" would need a 40 mm hundred, taller than any cell's picture box; critic r3 #8)
                const boxFloor = (P.BASE10_IDS || []).includes(id) ? 2.3 : 4;
                if (pic.rects.length && minR < boxFloor - 0.05) fail(`V9 ${tpl} ${size} grade ${g} "${id}": a box ${minR.toFixed(1)} mm (need ${boxFloor})`);
                if (pic.circles.length && minC < 2.5 - 0.05) fail(`V9 ${tpl} ${size} grade ${g} "${id}": a ring or dot ${minC.toFixed(1)} mm (need 2.5)`);
            }
        }
    }
}
// V10: a page dealt from one word set (vocabSet) or one grade (vocabGrade) carries that set's / grade's grade and CCSS for
// its footer (owner ruling Q-A; r1 #14 / r2 #1: "Grade 3 · 3.OA.9" on the grade 1, 2 and 4 pages)
const shortCode = (c) => String(c).replace(/\.([A-Z])\.(\d+[a-z]?)$/, '.$2');
if (typeof K.applySheetTags !== 'function') fail('V10: no applySheetTags (the footer hook) in the sheet kit');
else {
    const base = { categoryId: 'vocabulary', skillId: 'vocab_grade_pictures', grade: '3', ccss: '3.OA.9' };
    const runsT = W.VOCAB_SETS.map((s, i) => [{ vocabSet: i }, s.grade, s.ccss]).concat(W.VOCAB_GRADES.map((g) => [{ vocabGrade: g }, g, [...new Set(W.VOCAB_SETS.filter((s) => s.grade === g).flatMap((s) => s.ccss))]]));
    for (const [opts, g, codes] of runsT) for (const skill of ['vocab_grade_pictures', 'vocab_pick3_words']) {
        const qs = deal(skill, opts, 4, 7100);
        const metas = qs.map((q) => K.applySheetTags(Object.assign({}, base), q));
        for (const m of metas) {
            if (String(m.grade) !== String(g) || m.grades) fail(`V10 ${skill} ${JSON.stringify(opts)}: footer grade ${m.grade}${m.grades ? ` (${m.grades})` : ''}, the words are grade ${g}`);
            const want = codes.map(shortCode).join(', ');
            if (m.ccss !== want) fail(`V10 ${skill} ${JSON.stringify(opts)}: footer CCSS "${m.ccss}", the words teach "${want}"`);
        }
    }
    // additive: an item with no tags leaves the meta alone
    const plain = K.applySheetTags(Object.assign({}, base), { text: '2 + 3' });
    if (plain.grade !== '3' || plain.ccss !== '3.OA.9') fail('V10: an item without sheet tags changed the footer');
}
// V11: a Match 3 cell scores one point a word (owner ruling Q-C, r1 #18): 4 cells score 12; a 1 picture, 3 words cell 1
{
    const m3 = deal('vocab_grade_pictures', { vocabGrade: 3 }, 4, 7300).map((q) => ({ q, footprint: K.cellFootprint ? K.cellFootprint(q.cell) : K.getCell('vocab-match3').footprint(q.cell.payload) }));
    const p3 = deal('vocab_pick3_words', { vocabGrade: 3 }, 6, 7300).map((q) => ({ q, footprint: K.getCell('vocab-pick3').footprint(q.cell.payload) }));
    if (typeof PG.scorePoints !== 'function') fail('V11: no scorePoints in paginate.js (the page Score counts items)');
    else {
        if (PG.scorePoints(m3) !== 12) fail(`V11: a Match 3 page of 4 cells scores /${PG.scorePoints(m3)} (owner Q-C: /12)`);
        if (PG.scorePoints(p3) !== 6) fail(`V11: a 1 picture, 3 words page of 6 scores /${PG.scorePoints(p3)} (one point an item)`);
    }
}

// V12: the Guided page's grey hint (the first worked step that holds no answer, guided.js hintOf) names a CUE, never
// repeats the instruction (critic r2 #5: "Look at the picture." under "Look at the picture. Write its word on the line.")
{
    await imp('js/modules/sheet/providers/vocabulary.js');
    const prov = K.getProvider('vocabulary', 'vocab_grade_pictures');
    for (const [skill, n] of [['vocab_grade_pictures', 4], ['vocab_pick3_words', 6]]) for (const q of deal(skill, { vocabGrade: 3 }, n, 7500)) {
        const st = (prov.workedSteps(q) || [])[0];
        const t = String((st && st.text) || '').trim();
        const instr = `${q.printText || ''} ${q.text || ''} ${K.instructionFor ? '' : ''}`.toLowerCase();
        if (!t || instr.includes(t.toLowerCase().replace(/[.]$/, '')) || /^look at (the )?pictures?( [A-C](, [A-C])*( and [A-C])?)?\.?$/i.test(t)) fail(`V12 ${skill}: the first step "${t}" repeats the instruction (no cue)`);
        const ansWord = q.cell.template === 'vocab-pick3' ? q.cell.payload.word : null;
        if (ansWord && t.toLowerCase().includes(ansWord.toLowerCase())) fail(`V12 ${skill}: the first step "${t}" gives the answer`);
    }
}
// V13: the picture task's Error analysis wrong word is a real mistake: a misspelling of the word (1-2 letters off, M-V4)
// or a look-alike (notWith, M-V1) - never a bank word no pupil would pick (critic r2 #8: "left" for equal groups)
{
    const prov = K.getProvider('vocabulary', 'vocab_grade_pictures');
    const dist = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
        for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
    for (const g of W.VOCAB_GRADES) for (const q of deal('vocab_pick3_words', { vocabGrade: g }, 8, 7700)) {
        const w = q.cell.payload.word, r = prov.wrongAnswer(q);
        const v = r && String(r.value);
        if (!v || v === w) { fail(`V13 grade ${g} "${w}": no wrong word`); continue; }
        const ok = (dist(v, w) >= 1 && dist(v, w) <= 2) || (W.VOCAB_WORDS[w].notWith || []).includes(v);
        if (!ok) fail(`V13 grade ${g} "${w}": the wrong word "${v}" is neither a misspelling nor a look-alike`);
    }
}

// ---- round 5 (rule 5, critic r3): the checks of critic r3's findings, written before the fixes -----------------------
// V14 (hint uniqueness, critic r3 #5): the Guided page's grey hint (worked step 1) picks out exactly ONE bank word. A
// first-letter cue counts only when one bank word starts with that letter; otherwise the hint must give the word's meaning.
{
    const prov = K.getProvider('vocabulary', 'vocab_grade_pictures');
    for (const r of runs) for (const q of deal('vocab_pick3_words', r.opts, 8, 7900)) {
        const p = q.cell.payload, t = String(((prov.workedSteps(q) || [])[0] || {}).text || '');
        const m = /starts with "(.)"/.exec(t);
        if (m) {
            const hits = p.bank.filter((w) => String(w).charAt(0).toLowerCase() === m[1].toLowerCase());
            if (hits.length !== 1) fail(`V14 ${JSON.stringify(r.opts)} "${p.word}": the hint "${t}" fits ${hits.length} bank words (${p.bank.join(', ')})`);
        } else if (!t.toLowerCase().includes(String((W.VOCAB_WORDS[p.word] || {}).meaning || '@@').toLowerCase())) fail(`V14 ${JSON.stringify(r.opts)} "${p.word}": the hint "${t}" names no cue that picks one bank word`);
    }
}
// V15 (write-line length, critic r3 #7): the 1 picture, 3 words answer line is >= 1.2 x the widest bank word at the answer
// font (Andika bold, 0.6 em a character), at every grade and size; grades 4-5 at least 55 mm.
{
    for (const size of ['S', 'M', 'L']) for (const g of W.VOCAB_GRADES) {
        const ctx = K.resolveCtx({ size, mode: 'print' });
        const words = W.gradeWords(g);
        const longest = words.slice().sort((a, b) => b.length - a.length);
        const bank = [longest[0], ...longest.slice(1).filter((w) => W.compatible([longest[0], w])).slice(0, 2)];
        const html = K.renderCell({ cell: { template: 'vocab-pick3', v: 1, payload: { word: bank[0], bank, grade: g } } }, ctx);
        const ln = /class="mq-vp-line"[^>]*?width:([\d.]+)mm[^>]*?font-size:([\d.]+)pt/.exec(html);
        if (!ln) { fail(`V15 ${size} grade ${g}: no answer line read`); continue; }
        const lineMm = Number(ln[1]), pt = Number(ln[2]);
        const needMm = Math.max(...bank.map((w) => String(w).length)) * pt * PT * 0.6 * 1.2;
        if (lineMm < needMm - 0.05) fail(`V15 ${size} grade ${g}: the answer line is ${lineMm} mm, under 1.2 x "${bank[0]}" at ${pt} pt (${needMm.toFixed(1)} mm)`);
        if (classOf(g) === 2 && lineMm < 55) fail(`V15 ${size} grade ${g}: the answer line is ${lineMm} mm (grades 4-5 need 55 mm)`);
    }
}
// V16 (one base-ten unit WITHIN AN ITEM, critic r3 #8 / VQ-1, owner ruling OQ-1 2026-11-08): the one, ten and hundred of ONE
// item (a Match 3 cell's three pictures; a 1 picture, 3 words cell's picture) print one unit square - one's square, the ten
// rod's short side and a tenth of the hundred flat the same in mm (within 3 %); and an item with no hundred prints that unit
// at >= 5 mm (critic r4 OQ-1: a 2.5 mm "one" and a 25 x 2.5 mm "ten" on grade 2). Rendered through the cells, S, M and L.
{
    const unitOf = (svg, id) => {
        const r = readSvg(svg), sc = r.wMm / r.vb[2];
        const sides = [...svg.matchAll(/<rect [^>]*width="([\d.]+)" height="([\d.]+)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
        const big = sides.sort((x, y) => y[0] * y[1] - x[0] * x[1])[0];
        return (id === 'hundred' ? Math.min(...big) / 10 : Math.min(...big)) * sc;
    };
    const svgsIn = (html) => [...html.matchAll(/<svg class="mq-vpic"[^]*?<\/svg>/g)].map((m) => ({ id: /data-vpic="([^"]+)"/.exec(m[0])[1], svg: m[0] }));
    const items = [['vocab-match3', ['one', 'ten', 'hundred']], ['vocab-match3', ['ten', 'digit', 'one']], ['vocab-match3', ['digit', 'ten', 'expanded form']],
        ['vocab-match3', ['one', 'number name', 'digit']], ['vocab-match3', ['hundred', 'one', 'digit']], ['vocab-pick3', ['one']], ['vocab-pick3', ['ten']], ['vocab-pick3', ['hundred']]];
    for (const size of ['S', 'M', 'L']) for (const [tpl, words] of items) {
        const ctx = K.resolveCtx({ size, mode: 'print' });
        const payload = tpl === 'vocab-match3' ? { words, order: [1, 2, 0], grade: 2 } : { word: words[0], bank: [words[0], 'digit', 'expanded form'], grade: 2 };
        const pics = svgsIn(K.renderCell({ cell: { template: tpl, v: 1, payload } }, ctx)).filter((x) => (P.BASE10_IDS || []).includes(x.id));
        const u = pics.map((x) => unitOf(x.svg, x.id));
        const tag = `${tpl} ${size} [${words.join(', ')}]`;
        if (!u.length) { fail(`V16 ${tag}: no base-ten picture read`); continue; }
        if (Math.max(...u) > Math.min(...u) * 1.03) fail(`V16 ${tag}: the base-ten units differ within the item (${pics.map((x, i) => `${x.id} ${u[i].toFixed(2)} mm`).join(', ')})`);
        if (!words.includes('hundred') && Math.min(...u) < 5 - 0.02) fail(`V16 ${tag}: no hundred in the item, but the unit is ${Math.min(...u).toFixed(2)} mm (need >= 5 mm, owner OQ-1)`);
    }
}
// V17 (look-alikes, critic r1-r3): every critic-found look-alike pair is never offered together (notWith on either side).
// APPEND-ONLY: a pair leaves only by an owner ruling. If a pair breaks a set's split (V7), change the set's words.
export const LOOKALIKES = [['term', 'sequence'], ['first term', 'sequence'], ['round up', 'quotient'], ['round up', 'remainder'], ['multiple', 'pattern'],
    ['grow', 'sequence'], ['grow', 'pattern'], ['number name', 'hundred']];
for (const [a, b] of LOOKALIKES) if (W.compatible([a, b])) fail(`V17 "${a}" / "${b}": a critic-found look-alike pair is not notWith`);
// V17 (extended, critic r4 #4 / M-V2): a word a picture PRINTS is a look-alike of that picture's word - no word that may share
// its bank or its Match 3 cell (same lesson set or grade, not notWith) appears as a whole word in the picture's printed text
// ("number name" prints "three hundred forty-seven" while "hundred" sat in its bank)
{
    const textOf = (id) => [...P.vocabPictureSVG(K.resolveCtx({ size: 'L', mode: 'print' }), id, { wMm: 46 }).matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]).join(' ').toLowerCase();
    for (const id of P.VOCAB_PICTURE_IDS) {
        const txt = ` ${textOf(id).replace(/[^a-z0-9]+/g, ' ')} `;
        if (!txt.trim()) continue;
        const near = new Set(W.VOCAB_SETS.filter((st) => st.words.includes(id)).flatMap((st) => W.gradeWords(st.grade).concat(st.words)));
        for (const b of near) if (b !== id && W.compatible([id, b]) && txt.includes(` ${String(b).toLowerCase()} `)) fail(`V17 "${id}": its picture prints "${b}", a word that may share its bank (make them notWith)`);
    }
}

// V21 (referent, critic r4 #5 / M-V1): a picture whose word names a PART declares its `referent` (canvas x ranges), and the
// heavy mark is on that part and nowhere else: each range carries a heavy stroke spanning >= 80 % of it, and no heavy stroke
// lies outside the ranges ("left" marked the two crossed out, so it read as take away). Required: left, repeat.
{
    const NEED = ['left', 'repeat'];
    for (const id of NEED) if (typeof P.vocabPictureReferent !== 'function' || !P.vocabPictureReferent(id)) fail(`V21 "${id}": no declared referent (the part its word names)`);
    if (typeof P.vocabPictureReferent === 'function') for (const id of P.VOCAB_PICTURE_IDS) {
        const ref = P.vocabPictureReferent(id);
        if (!ref) continue;
        const svg = P.vocabPictureSVG(K.resolveCtx({ size: 'L', mode: 'print' }), id, { wMm: 46 });
        const heavy = [];
        for (const [t] of svg.matchAll(/<(line|path|rect|circle)\b[^>]*>/g)) {
            if (Number((/stroke-width="([\d.]+)"/.exec(t) || [])[1]) !== P.VOCAB_HEAVY) continue;
            const xs = t.startsWith('<line') ? [/x1="([-\d.]+)"/, /x2="([-\d.]+)"/].map((re) => Number(re.exec(t)[1]))
                : t.startsWith('<path') ? [...(/d="([^"]+)"/.exec(t) || ['', ''])[1].matchAll(/[MLH]\s*([-\d.]+)/g)].map((m) => Number(m[1]))
                : t.startsWith('<rect') ? (() => { const x = Number(/x="([-\d.]+)"/.exec(t)[1]); return [x, x + Number(/width="([\d.]+)"/.exec(t)[1])]; })()
                : (() => { const cx = Number(/cx="([-\d.]+)"/.exec(t)[1]), r = Number(/r="([\d.]+)"/.exec(t)[1]); return [cx - r, cx + r]; })();
            heavy.push([Math.min(...xs), Math.max(...xs)]);
        }
        for (const [a, b] of ref) if (!heavy.some(([x0, x1]) => Math.min(x1, b) - Math.max(x0, a) >= 0.8 * (b - a))) fail(`V21 "${id}": the referent ${a}-${b} carries no heavy mark`);
        for (const [x0, x1] of heavy) if (!ref.some(([a, b]) => x0 >= a - 1 && x1 <= b + 1)) fail(`V21 "${id}": a heavy mark at ${x0}-${x1} lies outside the referent (the eye goes to the wrong part)`);
    }
}

// ---- --browser: the checks only a browser can measure (on precritic's path as gate vocab-unit-browser) -----------------
if (process.argv.includes('--browser')) await browserChecks();
async function browserChecks() {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const { open } = require(path.join(ROOT, 'tests', 'lib', 'ws-harness.cjs'));
    const app2 = await open({ seed: 1 });
    const { page } = app2;
    const build = (skillId, role, size, opts, seed = 7) => page.evaluate(async (a) => {
        try {
            const r = await window.buildSheet({ role: a.role, sections: [{ skills: [Object.assign({ categoryId: 'vocabulary', skillId: a.skillId }, a.opts ? { opts: a.opts } : {})] }], size: a.size, paper: 'A4', seed: a.seed, key: false });
            return { html: window.sheetDocument(r.pupilHtml, 'x', { paper: 'A4' }) };
        } catch (e) { return { error: String(e && e.message || e) }; }
    }, { skillId, role, size, opts, seed });
    const sheet = async (html, fn, arg) => {
        const sh = await app2.browser.newPage();
        try {
            await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
            await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
            await sh.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
            await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
            await sh.emulateMediaType('print');
            return await sh.evaluate(fn, arg);
        } finally { await sh.close(); }
    };
    try {
        // V11R (critic r3 #2, Q-C): the Score is per word on EVERY role the card offers: each page's /N = the scored cells'
        // points (Match 3 3 a cell, 1 picture 3 words 1), the Model unscored.
        for (const [skillId, pts] of [['vocab_grade_pictures', 3], ['vocab_pick3_words', 1]]) for (const role of ['independent', 'guided', 'more-practice', 'test', 'error-analysis']) for (const size of ['S', 'M', 'L']) {
            const b = await build(skillId, role, size);
            if (b.error) { fail(`V11R ${skillId} ${role} ${size}: not composed (${b.error})`); continue; }
            const got = await sheet(b.html, () => {
                const pages = [...document.querySelectorAll('body > section.ws-page, body > .ws-page')];
                const sc = pages.map((pg) => { const s = pg.querySelector('.ws-field.score b'); return s ? Number(s.textContent.replace(/\D/g, '')) : null; }).filter((x) => x != null);
                const cells = pages.flatMap((pg) => [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]') && !c.closest('.mq-modelcell') && !/\bModel\b/.test((c.querySelector('[data-ws-label], .ws-letter') || {}).textContent || '')));
                return { score: sc[0], cells: cells.length };
            });
            if (got.score == null) fail(`V11R ${skillId} ${role} ${size}: no Score on the page`);
            else if (got.score !== got.cells * pts) fail(`V11R ${skillId} ${role} ${size}: Score /${got.score} for ${got.cells} scored cells (owner Q-C: /${got.cells * pts})`);
        }
        // V18 (critic r1 #6, r2 #4, r3 #6, r4 #2): the 1 picture, 3 words Guided rows are equal at S, M AND L (within 1 mm),
        // measured on the RENDERED ROW BOXES of the printed page (the band's grid rows, from one row's top to the next row's
        // top, the last to the grid's bottom) - never the planned cell height, with no "when there is room" exemption. Seeds:
        // 7 and ws-grade-render's guided seed (the critic's page: a two-line meaning hint made row 1 377 px, row 2 290 px).
        for (const size of ['S', 'M', 'L']) for (const [opts, seed] of [[{ vocabGrade: 3 }, 7], [null, 7], [null, 143869], [{ vocabGrade: 2 }, 143869], [{ vocabGrade: 4 }, 143869], [{ vocabGrade: 1 }, 143869]]) {
            const b = await build('vocab_pick3_words', 'guided', size, opts, seed);
            if (b.error) { fail(`V18 guided ${size}: not composed (${b.error})`); continue; }
            const hs = await sheet(b.html, () => {
                const out = [];
                for (const pg of document.querySelectorAll('body > section.ws-page, body > .ws-page')) {
                    const cells = [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]'));
                    const tops = [...new Set(cells.map((c) => Math.round(c.getBoundingClientRect().top)))].sort((a, b) => a - b);
                    const bottom = Math.max(...cells.map((c) => c.getBoundingClientRect().bottom));
                    if (tops.length > 1) out.push(tops.map((t, i) => ((i + 1 < tops.length ? tops[i + 1] : bottom) - t) * 25.4 / 96));
                }
                return out;
            });
            for (const rows of hs) if (Math.max(...rows) - Math.min(...rows) > 1) fail(`V18 guided ${size} ${JSON.stringify(opts)} seed ${seed}: rows ${rows.map((h) => h.toFixed(1)).join(' / ')} mm (need equal within 1 mm)`);
        }
        // V20 (critic r4 #3, H13 "sized for a taller item than it holds"): on Error analysis, a cell at S whose content is
        // smaller than at L is shorter than at L - cell height at S <= 0.9 x the height at L when the S ink is under 0.95 x
        // the L ink (Match 3 EA at S drew L's 76 mm cell round 60 mm of work: 24-28 % empty). Median top-level cell; ink =
        // text, drawings and stroked boxes from the first to the last.
        for (const skillId of ['vocab_grade_pictures', 'vocab_pick3_words']) {
            const m = {};
            for (const size of ['S', 'L']) {
                const b = await build(skillId, 'error-analysis', size);
                if (b.error) { fail(`V20 ${skillId} error-analysis ${size}: not composed (${b.error})`); continue; }
                m[size] = await sheet(b.html, () => {
                    const pg = document.querySelector('body > section.ws-page, body > .ws-page');
                    const cells = [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]'));
                    const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
                    const ink = cells.map((c) => {
                        let t = Infinity, bt = -Infinity;
                        for (const d of c.querySelectorAll('*')) {
                            if (d.closest('[data-ws-label], .ws-letter, .ws-tab')) continue;
                            const st = getComputedStyle(d); if (st.display === 'none' || st.visibility === 'hidden') continue;
                            const own = [...d.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
                            const stroked = ['Top', 'Bottom', 'Left'].some((k) => parseFloat(st[`border${k}Width`]) > 0 && st[`border${k}Style`] !== 'none');
                            if (own || stroked || d.tagName.toLowerCase() === 'svg') { const r = d.getBoundingClientRect(); if (r.height) { t = Math.min(t, r.top); bt = Math.max(bt, r.bottom); } }
                        }
                        return (bt - t) * 25.4 / 96;
                    });
                    return { cell: med(cells.map((c) => c.getBoundingClientRect().height * 25.4 / 96)), ink: med(ink) };
                });
            }
            if (m.S && m.L && m.S.ink < 0.95 * m.L.ink && m.S.cell > 0.9 * m.L.cell) fail(`V20 ${skillId} error-analysis: the S cell is ${m.S.cell.toFixed(1)} mm for ${m.S.ink.toFixed(1)} mm of ink, the L cell ${m.L.cell.toFixed(1)} mm for ${m.L.ink.toFixed(1)} mm (S must be <= 0.9 x L when its content is smaller)`);
        }
        // V19 (critic r1 #10, r2 #7, r3 #4): the online worksheet at 1280 px: every tile of one template has the same
        // structure - Match 3 one word a row in a fixed column, every letter box at the same x in its tile; 1 picture, 3 words
        // the same picture height and answer-line y in every tile, its pills on one row or one a row (never 2 + 1)
        await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
        for (const skillId of ['vocab_grade_pictures', 'vocab_pick3_words']) {
            const res = await page.evaluate(async (k) => {
                const st = window.state; st.category = 'vocabulary'; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6; window.initWorksheet();
                await new Promise((r) => setTimeout(r, 600));
                const tiles = [...document.querySelectorAll('#worksheetView .mq-wspaper')];
                return tiles.map((t) => {
                    const tr = t.getBoundingClientRect();
                    const rel = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left - tr.left), y: Math.round(r.top - tr.top), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom - tr.top) }; };
                    const words = [...t.querySelectorAll('.mq-vm-word')].map(rel), boxes = [...t.querySelectorAll('.mq-vm-box')].map(rel);
                    const pills = [...t.querySelectorAll('.mq-vp-btn')].map(rel), line = t.querySelector('.mq-vp-line'), pics = [...t.querySelectorAll('svg.mq-vpic')].map(rel);
                    return { words, boxes, pills, line: line ? rel(line) : null, pics, h: Math.round(tr.height) };
                });
            }, skillId);
            if (!res.length) { fail(`V19 ${skillId}: no worksheet tiles`); continue; }
            const sig = (t) => (skillId === 'vocab_grade_pictures'
                ? `rows ${new Set(t.words.map((w) => w.y)).size} box-x ${t.boxes.map((b) => b.x).join(',')}`
                : `pill-rows ${new Set(t.pills.map((p) => p.y)).size} line-y ${t.line ? t.line.y : '-'} pic-h ${t.pics.map((p) => p.h).join(',')}`);
            const sigs = res.map(sig);
            if (new Set(sigs).size > 1) fail(`V19 ${skillId} worksheet-1280: the tiles differ (${[...new Set(sigs)].join(' | ')})`);
            if (skillId === 'vocab_grade_pictures' && res.some((t) => new Set(t.words.map((w) => w.y)).size !== t.words.length)) fail(`V19 ${skillId} worksheet-1280: the words are not one a row (${sigs[0]})`);
            if (skillId === 'vocab_pick3_words' && res.some((t) => ![1, t.pills.length].includes(new Set(t.pills.map((p) => p.y)).size))) fail(`V19 ${skillId} worksheet-1280: the pills wrap 2 + 1 (${sigs.join(' | ')})`);
        }
    } finally { await app2.close(); }
}

console.log(`ws-vocab-unit: ${W.VOCAB_SETS.length} lesson sets, ${P.VOCAB_PICTURE_IDS.length} pictures, ${items} items dealt`);
for (const f of fails.slice(0, Number(process.env.VOCAB_SHOW) || 40)) console.log(`  - ${f}`);
console.log(`ws-vocab-unit: ${fails.length ? `FAIL (${fails.length})` : 'OK'}`);
process.exit(fails.length ? 1 : 0);
