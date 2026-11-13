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
// V22 (owner R-1, r7) every library picture has a FOCAL part, drawn as targeted SVG (.mq-vfocal) on the key and the screen,
//     with its halo (.mq-vhalo) in the single grey on the key and hidden on the screen until answered; the pupil page has neither
// V24 (owner R-2, r7) every word has an `explain`: "<Word> means ...", naming its own word, no word of its notWith list,
//     at most 14 words
// V-FEAT (r11, rule 5 root cause; replaces r9-r10's derived-rule list V-AMBIG+) every picture DECLARES the features it draws
//     (vocab-pictures.js PIC_FEAT) and fails when its markup shows one it does not declare (vocabReadFeatures); every word
//     declares its defining features (vocab-words.js VOCAB_DEFS). A picture of A dealt with B (the same set or grade pool, one
//     item) whose features satisfy B's definition FAILS unless A and B are notWith. An older tree (backtest rows) declares
//     none: its pictures take today's declaration where the drawing is today's, else the features its markup shows.
// V-REF (r11) every mark a wrong-answer explanation points at is drawn in its own picture and in no picture dealt with it
//     (same set or grade pool, compatible) - critic r10: cycle's "ones digits" beside shapes, unknown's "the one in the box"
//     beside factor's boxed 4 and 3
// V-HATCH (r11, the escape hatch) a set's noPicture words are never drawn for it (Match 3, the 1 picture, 3 words picture);
//     V6 / V7 / V5 judge the words drawn as pictures (pictureWords): five picture words split into a trio and a pair
// V7-ALL (r13) every bank dealtBanks lists is judged (V-FEAT reading + today's notWith); V-NUM ringed/boxed numbers all
//     even / all odd read as even / odd (r14: one ringed or boxed number too); V-TWIN pictures of one feature class share their
//     notWith lists (r14: and every run picture, grow's squares included, is notWith rule); V-PLACE (r14) a ringed or boxed
//     digit inside a number reads as one / ten / hundred
// V-STD (r12) any two of a set's words named in one sentence of its standards' text are notWith or kept apart by V-FEAT
// V-FIT (r10) every lesson set's core words (the first three) have pictures whose ccss / op teaches the set's standard;
//     V-FIT6 the other three words too, apart from the pinned misfits awaiting a lead decision (the pin only shrinks; --fit-report)
// V28 (lead ruling 2026-11-12) the Guided MIN_ITEMS counts SCORED ANSWERS: the Model + ONE Match 3 try (3 answers) meets it,
//     a single-answer page still needs the Model + 3 tries (guided.js minMet)
// V27 (r9) key dot underlays never overlap; the pick3 "Here is how" uses the screen verb; no broken comparison in an explain
// V26 (r9) the Pre-skill check of a picture vocabulary task tests 1-2 picture vocabulary tasks at its grade or below
//     (provider `preSkills`), never the Grade 6 definition-matching skills listed before it in data.js
// --browser: V23 (R-1) card-820 and worksheet-1280 highlight after the answer and not before, the pupil print pages are
//     byte-identical to 70cdbaf9 (sha256 per role / size / seed, tests/fixtures/precritic/vocab-pupil-hashes.json), the
//     key's highlight is GREY only; V25 (R-2) a wrong answer shows and speaks the RIGHT word's explanation once, with
//     sound off shows it and does not speak, a right answer shows none
//   --pin-pupil   (with --browser) write the pupil hashes of this tree to the fixture (run on 70cdbaf9 only)
//   --no-pupil-pin (with --browser) skip ONLY the pupil-hash comparison (lf-tools r1 A4: the pin is read from today's
//                 checkout, so on an old commit it misses on print pages later lanes changed; a backtest row that proves the
//                 SCREEN half of V23 / V25 at 820 uses it). Every other V23 check (no highlight on the pupil page, grey key) runs.

import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

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
const HAND_NOW = await import(pathToFileURL(path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', 'js/modules/sheet/graphics/vocab-pictures.js')).href);
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
    // (r11 hatch: V6 / V7 judge the words dealt as pictures - a set's noPicture words are never drawn for it)
    const ws = typeof W0.pictureWords === 'function' ? W0.pictureWords(s) : s.words;
    if (!W.compatible(ws.slice(0, 3))) fail(`V6 ${s.lesson}: the first three words clash (notWith)`);
    // V7: the six words split into two trios with no notWith pair inside (a Match 3 page shows every word once); five
    // picture words (a hatch drop) split into a trio and a pair
    let split = false;
    for (let a = 0; a < ws.length && !split; a++) for (let b = a + 1; b < ws.length && !split; b++) for (let c = b + 1; c < ws.length && !split; c++) {
        const t = [ws[a], ws[b], ws[c]], rest = ws.filter((w) => !t.includes(w));
        if (W.compatible(t) && (rest.length > 3 || W.compatible(rest))) split = true;
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
// V-HATCH (r11): a set's noPicture words are never drawn for it (pictureWords), on any task
const hatched = (o) => (o.vocabSet !== undefined && W.VOCAB_SETS[o.vocabSet] ? W.VOCAB_SETS[o.vocabSet].noPicture || [] : []);
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
                if (hatched(r.opts).some((w) => p.words.includes(w))) fail(`V-HATCH ${tag}: a noPicture word drawn in Match 3 (${p.words})`);
                seen.push(...p.words);
            } else {
                if (!p.bank.includes(p.word) || new Set(p.bank).size !== 3) fail(`V4 ${tag}: bank ${p.bank} for ${p.word}`);
                if (p.bank.some((w) => w !== p.word && !W.compatible([p.word, w]))) fail(`V4 ${tag}: a bank word reads as the picture (${p.bank} / ${p.word})`);
                if (q.ans !== p.word) fail(`V4 ${tag}: key ${q.ans} is not ${p.word}`);
                if (hatched(r.opts).includes(p.word)) fail(`V-HATCH ${tag}: the noPicture word "${p.word}" drawn as the picture`);
                seen.push(p.word);
            }
        }
        // V5: no repeat before the pool is used up
        const pool = r.opts.vocabSet !== undefined ? (typeof W.pictureWords === 'function' ? W.pictureWords(W.VOCAB_SETS[r.opts.vocabSet]) : W.VOCAB_SETS[r.opts.vocabSet].words) : W.gradeWords(r.opts.vocabGrade);
        const firstRun = seen.slice(0, pool.length);
        if (new Set(firstRun).size !== firstRun.length && seen.length >= 2) {
            // a Match 3 page of 6 words takes 2 trios: only flag a repeat inside the first pool-length words
            const dup = firstRun.find((w, i) => firstRun.indexOf(w) !== i);
            fail(`V5 ${skill} ${JSON.stringify(r.opts)}: "${dup}" repeats on the page before the ${pool.length} words are used`);
        }
    }
}
// V-AMBIG (owner O-2 / O-3, lf-vocab r8): a picture must mean only its word. Every library picture and every lesson-band
// picture declares `alsoShows` (the words a pupil could defend for it); a picture whose alsoShows names a word that may share
// its bank or its Match 3 cell (compatible: not notWith), a lesson set's trio, or a lesson band's other word FAILS.
const ambig = [];
{
    const also = (id) => (typeof P.vocabPictureAlsoShows === 'function' ? P.vocabPictureAlsoShows(id) : null);
    for (const id of P.VOCAB_PICTURE_IDS) {
        const xs = also(id);
        if (!Array.isArray(xs)) { fail(`V-AMBIG "${id}": the picture declares no alsoShows`); continue; }
        // (the hand list - VOCAB_ALSO_SHOWS - is an extra: any pair of it that may share a bank fails, in any grade)
        // (r12: today's hand list too, so a backtest row judges an old tree's deals by today's known readings)
        const hand = [...new Set([...((P.VOCAB_ALSO_SHOWS || {})[id] || []), ...((HAND_NOW.VOCAB_ALSO_SHOWS || {})[id] || [])])];
        for (const b of hand) if (b !== id && W.VOCAB_WORDS[b] && W.compatible([id, b])) fail(`V-AMBIG "${id}": its picture could also show "${b}", and the two may share a bank (make them notWith)`);
    }
    // V-FEAT (r11, rule 5: the look-alike class failed r6, r7, r9 and r10, each time closed by one more derived rule). Today's
    // definitions (this checkout's VOCAB_DEFS) judge the checked tree's pictures and deals, so a backtest row judges an old
    // drawing by today's vocabulary of features.
    const here = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
    const HERE_P = await import(pathToFileURL(path.join(here, 'js/modules/sheet/graphics/vocab-pictures.js')).href);
    const HERE_W = await import(pathToFileURL(path.join(here, 'js/modules/sheet/lesson-pages/vocab-words.js')).href);
    const svgOf = (M, id) => M.vocabPictureSVG({}, id, { wMm: 46 });
    const featCache = new Map();
    const featOf = (id) => {
        if (featCache.has(id)) return featCache.get(id);
        const read = HERE_P.vocabReadFeatures(svgOf(P, id));
        const own = typeof P.vocabPictureFeatures === 'function' ? P.vocabPictureFeatures(id) : null;
        let fs;
        if (own) {
            for (const x of read) if (!own.includes(x)) fail(`V-FEAT "${id}": its drawing shows "${x}", which its picture does not declare`);
            for (const x of own) if (!HERE_P.VOCAB_FEATURES.includes(x) && !HERE_P.VOCAB_FEATURES.includes(x.replace(/:.*/, ':<n>')) && !HERE_P.VOCAB_FEATURES.includes(x.replace(/:.*/, ':<d>'))) fail(`V-FEAT "${id}": "${x}" is not a feature of the closed list`);
            fs = own;
        } else {
            const same = HERE_P.hasVocabPicture(id) && svgOf(HERE_P, id) === svgOf(P, id);
            fs = same ? HERE_P.vocabPictureFeatures(id) : read;
        }
        featCache.set(id, fs);
        return fs;
    };
    if (typeof P.vocabPictureFeatures !== 'function' && !process.env.MQ_ROOT) fail('V-FEAT: the library declares no picture features (vocabPictureFeatures)');
    for (const w of Object.keys(W.VOCAB_WORDS)) if (!HERE_W.VOCAB_DEFS[w]) fail(`V-FEAT "${w}": the word declares no defining features (VOCAB_DEFS)`);
    // (a picture reads as its own word: a declaration that does not is a wrong declaration or a wrong definition)
    if (typeof P.vocabPictureFeatures === 'function') for (const id of P.VOCAB_PICTURE_IDS) if (HERE_W.VOCAB_DEFS[id] && !HERE_W.featuresSatisfy(featOf(id), id)) fail(`V-FEAT "${id}": its features (${featOf(id).join(' ')}) do not satisfy its own word's definition`);
    const picsOf = (s) => (typeof W.pictureWords === 'function' ? W.pictureWords(s) : s.words);
    const pools = W.VOCAB_SETS.map((s) => ({ name: `set "${s.title}"`, pics: picsOf(s), words: s.words }))
        .concat(W.VOCAB_GRADES.map((g) => ({ name: `grade ${g}`, pics: W.gradeWords(g), words: W.gradeWords(g) })));
    const seenClash = new Set();
    for (const pl of pools) for (const a of pl.pics) {
        if (!P.hasVocabPicture(a)) continue;
        for (const b of pl.words) {
            if (a === b || !W.compatible([a, b]) || !HERE_W.featuresSatisfy(featOf(a), b)) continue;
            const k = `${pl.name}|${a}|${b}`;
            if (seenClash.has(k)) continue;
            seenClash.add(k);
            fail(`V-FEAT ${pl.name}: the "${a}" picture reads as "${b}" (${featOf(a).join(' ')}), and the two may be dealt together (notWith, redraw or the hatch)`);
        }
    }
    // V-STD (r12, critic r11 #2 root cause): the standards say which words go together. For every set, read the text (and the
    // Wisconsin wording and level descriptors) of its CCSS codes and of its pictures' codes (data/standards/ccss-math.json): any
    // two of the set's words named in ONE sentence there must be notWith, or kept apart by V-FEAT (neither picture satisfies the
    // other word's definition, by today's VOCAB_DEFS). 4.OA.B.4 / 3.OA.C.7 name product and multiple together.
    {
        const J = JSON.parse(fs.readFileSync(path.join(here, 'data/standards/ccss-math.json'), 'utf8'));
        const byCode = new Map(J.standards.map((x) => [x.code, x]));
        const sentences = (c) => { const x = byCode.get(c); if (!x) return []; return [x.text, ...(x.wi || []).flatMap((w) => [w.text, w.levelDescriptors || ''])].join(' ').toLowerCase().split(/(?<=[.;!?\n])\s+/); };
        const named = (w) => new RegExp(`\\b${w.replace(/ /g, '[ -]')}s?\\b`);
        const reads = (a, b) => P.hasVocabPicture(a) && HERE_W.featuresSatisfy(featOf(a), b);
        for (const s of W.VOCAB_SETS) {
            const codes = new Set(s.ccss || []);
            for (const w of s.words) { const t = P.vocabPictureTeaches && P.vocabPictureTeaches(w); if (t) t.ccss.forEach((c) => codes.add(c)); }
            const sens = [...codes].flatMap((c) => sentences(c).map((t) => [c, t]));
            for (let i = 0; i < s.words.length; i++) for (let j = i + 1; j < s.words.length; j++) {
                const a = s.words[i], b = s.words[j];
                if (!W.compatible([a, b])) continue;
                const hit = sens.find(([, t]) => named(a).test(t) && named(b).test(t));
                if (hit && (reads(a, b) || reads(b, a))) fail(`V-STD set "${s.title}": ${hit[0]} names "${a}" and "${b}" together, and the "${reads(a, b) ? a : b}" picture reads as "${reads(a, b) ? b : a}": make them notWith`);
            }
        }
    }
    // V7-ALL (r13, critic r12 root cause: pick3 dealt any clash-free pair of the whole set, across its trios): EVERY bank a set
    // can deal - dealtBanks(set) when the tree has it, else every clash-free trio holding a picture word (what the old
    // _compatiblePick could deal) - is judged: no picture in it reads as another bank word (today's VOCAB_DEFS) and no two of
    // its words are notWith by TODAY's word list.
    {
        const banksOf = (s) => {
            if (typeof W.dealtBanks === 'function') return W.dealtBanks(s);
            const out = [];
            for (const w of picsOf(s)) for (let i = 0; i < s.words.length; i++) for (let j = i + 1; j < s.words.length; j++) {
                const t = [w, s.words[i], s.words[j]];
                if (new Set(t).size === 3 && W.compatible(t)) out.push({ picture: w, bank: t });
            }
            return out;
        };
        const todayClash = (a, b) => ((HERE_W.VOCAB_WORDS[a] || {}).notWith || []).includes(b) || ((HERE_W.VOCAB_WORDS[b] || {}).notWith || []).includes(a);
        W.VOCAB_SETS.forEach((s, si) => {
            const seen = new Set();
            for (const { picture: a, bank } of banksOf(s)) for (const b of bank) {
                if (a === b) continue;
                const why = todayClash(a, b) ? 'notWith' : (P.hasVocabPicture(a) && HERE_W.featuresSatisfy([...featOf(a), ...HERE_P.vocabReadFeatures(svgOf(P, a))], b) ? `the picture reads as "${b}"` : null);
                const k = `${a}|${b}`;
                if (!why || seen.has(k)) continue;
                seen.add(k);
                fail(`V7-ALL set ${si} "${s.title}": the "${a}" picture is dealt with "${b}" (bank ${bank.join(', ')}; ${why})`);
            }
        });
    }
    // V-NUM (r13, critic r12 #1): the numbers a picture rings or boxes, read from its drawing by today's reader - two or more,
    // all even (or all odd) - read as even (odd); such a picture may not be dealt with that word unless they are notWith.
    for (const pl of pools) for (const a of pl.pics) {
        if (!P.hasVocabPicture(a)) continue;
        const read = HERE_P.vocabReadFeatures(svgOf(P, a));
        for (const [f, b] of [['all-even', 'even'], ['all-odd', 'odd']]) {
            if (a !== b && read.includes(f) && pl.words.includes(b) && W.compatible([a, b])) fail(`V-NUM ${pl.name}: the "${a}" picture rings or boxes only ${b} numbers, and it may be dealt with "${b}"`);
        }
        // (r14, critic r13 #1: the boundary case - exactly ONE ringed or boxed number is a parity feature too: 47[3] reads odd)
        for (const [f, b] of [['marked-even', 'even'], ['marked-odd', 'odd']]) {
            if (a !== b && read.includes(f) && pl.words.includes(b) && W.compatible([a, b])) fail(`V-NUM ${pl.name}: the "${a}" picture rings or boxes one number, ${b}, and it may be dealt with "${b}" (one mark)`);
        }
    }
    // V-PLACE (r14, critic r13 #2): a ringed or boxed digit inside a number has a place (place:ones / tens / hundreds, read from
    // the drawing by today's reader), which reads as one / ten / hundred; such a picture may not be dealt with that word
    for (const pl of pools) for (const a of pl.pics) {
        if (!P.hasVocabPicture(a)) continue;
        const read = HERE_P.vocabReadFeatures(svgOf(P, a));
        for (const [f, b] of [['place:ones', 'one'], ['place:tens', 'ten'], ['place:hundreds', 'hundred']]) {
            if (a !== b && read.includes(f) && pl.words.includes(b) && W.compatible([a, b])) fail(`V-PLACE ${pl.name}: the "${a}" picture marks a digit in the ${f.slice(6)} place, and it may be dealt with "${b}"`);
        }
    }
    // V-TWIN (r13, critic r12 #3: first term missed the term / rule pin): two pictures of one pool with the same feature
    // class (their features less the box position and skip-count, every step:n as step) are notWith the same other words.
    {
        const cls = (id) => [...new Set(featOf(id).filter((f) => !['boxed-first-of-run', 'boxed-in-run', 'skip-count', 'all-even', 'all-odd', 'marked-even', 'marked-odd'].includes(f) && !f.startsWith('place:')).map((f) => (f.startsWith('step:') ? 'step' : f)))].sort().join(' ');
        const nw = (a, b) => ((W.VOCAB_WORDS[a] || {}).notWith || []).includes(b) || ((W.VOCAB_WORDS[b] || {}).notWith || []).includes(a);
        // (r14, critic r13 #3: the class is EVERY run picture - grow's 1, 3, 5 squares included, read from its drawing by today's
        // reader: a run with a constant step reads as the rule "add n" / "take n", so it may not be dealt with rule)
        const seenR = new Set();
        for (const pl of pools) for (const a of pl.pics) {
            if (a === 'rule' || !P.hasVocabPicture(a) || !pl.words.includes('rule') || !W.compatible([a, 'rule'])) continue;
            const st = [...new Set([...featOf(a), ...HERE_P.vocabReadFeatures(svgOf(P, a))])].filter((f) => /^step:\d+$/.test(f));
            const k = `${pl.name}|${a}`;
            if (!st.length || seenR.has(k)) continue;
            seenR.add(k);
            fail(`V-TWIN ${pl.name}: "${a}" draws a run with a constant step (${st.join(' ')}), which reads as "rule", and the two may be dealt together (run)`);
        }
        const seenT = new Set();
        for (const pl of pools) for (let i = 0; i < pl.pics.length; i++) for (let j = i + 1; j < pl.pics.length; j++) {
            const a = pl.pics[i], b = pl.pics[j];
            if (!P.hasVocabPicture(a) || !P.hasVocabPicture(b) || cls(a) !== cls(b)) continue;
            for (const c of pl.words) {
                if (c === a || c === b || nw(a, c) === nw(b, c)) continue;
                const k = [pl.name, a, b, c].join('|');
                if (seenT.has(k)) continue;
                seenT.add(k);
                fail(`V-TWIN ${pl.name}: "${a}" and "${b}" draw the same kind of picture (${cls(a)}), but only "${nw(a, c) ? a : b}" is notWith "${c}"`);
            }
        }
    }
    // V-REF (r11, critic r10 R-2 #2 / #3): every mark an explanation POINTS at ("the 12 in the box", "the one in the box",
    // "the one drawn round", "the ?", "like the 4", "the 7 in 472", "ones digits") is drawn in its own picture, and is not
    // drawn in a picture dealt with it unless the two are notWith. Marks are read from the drawings (vocabReadMarks).
    const marksOfExplain = (e) => {
        const out = [];
        const x = String(e || '');
        for (const m of x.matchAll(/the ([\d?]+)(?: and the ([\d?]+))? in (?:the )?box(?:es)?/g)) for (const t of [m[1], m[2]].filter(Boolean)) out.push({ k: 'boxed', t, say: `the ${t} in the box` });
        if (/the one in the box/.test(x)) out.push({ k: 'boxed-any', say: 'the one in the box' });
        if (/the one drawn round/.test(x)) out.push({ k: 'ringed-own', say: 'the one drawn round' });
        for (const m of x.matchAll(/the (\d+) in (\d+)/g)) out.push({ k: 'digit-in', t: m[1], n: m[2], say: `the ${m[1]} in ${m[2]}` });
        for (const m of x.matchAll(/like the (\d+)\b(?! in| and)/g)) out.push({ k: 'text', t: m[1], say: `the ${m[1]}` });
        if (/the \?(?! in)/.test(x)) out.push({ k: 'text', t: '?', say: 'the ?' });
        if (/ones digits?\b(?! means)/i.test(x.replace(/^Ones digit means/, ''))) out.push({ k: 'digits', say: 'ones digits' });
        return out;
    };
    const marksCache = new Map();
    const marksOfPic = (id) => { if (!marksCache.has(id)) marksCache.set(id, HERE_P.vocabReadMarks(svgOf(P, id))); return marksCache.get(id); };
    const draws = (id, mk, ownId) => {
        const p = marksOfPic(id);
        if (mk.k === 'boxed') return p.boxed.includes(mk.t);
        if (mk.k === 'boxed-any') return p.boxed.length > 0;
        if (mk.k === 'ringed-own') { const own = marksOfPic(ownId).ringed; return p.ringed.some((r) => own.includes(r)); }
        if (mk.k === 'digit-in') return p.lines.some((l) => l.includes(mk.n)) && p.tokens.includes(mk.t);
        if (mk.k === 'text') return p.tokens.includes(mk.t);
        if (mk.k === 'digits') return p.tokens.some((t) => /^\d+$/.test(t));
        return false;
    };
    const seenRef = new Set();
    for (const [w, e] of Object.entries(W.VOCAB_WORDS)) {
        if (!P.hasVocabPicture(w)) continue;
        for (const mk of marksOfExplain(e.explain)) if (!draws(w, mk, w)) fail(`V-REF "${w}": its explanation points at "${mk.say}", which its picture does not draw`);
    }
    for (const pl of pools) for (const a of pl.words) {
        const e = (W.VOCAB_WORDS[a] || {}).explain;
        if (!e || !P.hasVocabPicture(a)) continue;
        for (const mk of marksOfExplain(e)) for (const b of pl.pics) {
            // ("ones digits" names a kind of mark, not one mark: its own picture must draw digits; other pictures' numbers are not it)
            if (mk.k === 'digits' || a === b || !P.hasVocabPicture(b) || !W.compatible([a, b]) || !draws(b, mk, a)) continue;
            const k = `${a}|${b}|${mk.say}`;
            if (seenRef.has(k)) continue;
            seenRef.add(k);
            fail(`V-REF ${pl.name}: "${a}"'s explanation points at "${mk.say}", and the "${b}" picture dealt with it draws one too (notWith or reword)`);
        }
    }
    if (process.argv.includes('--feat-list')) for (const id of P.VOCAB_PICTURE_IDS) console.log(`  feat ${id}: ${featOf(id).join(' ')} -> ${HERE_W.vocabWordsReading(featOf(id)).join(', ')}`);
    // (a lesson set's Match 3 cells are clash-free trios - lesson-pages/vocab-pages.js trios() by compatible - so the pair rule
    // above covers them, as it covers every dealt Match 3 cell and 1 picture, 3 words bank)
    // the lesson bands (lesson Warm-up vocabulary, sheet/lesson-pages/vocab.js): every {word, picture} list of the lesson
    // records (prereqs.js LESSONS, the families) and the detailed lessons; a band is the first three words
    const LV = await imp('js/modules/sheet/lesson-pages/vocab.js');
    const PR = await imp('js/modules/lessons/prereqs.js');
    const DL = await imp('js/modules/lessons/detailed/index.js');
    const bands = [];
    const walk = (o, where, depth = 0) => {
        if (!o || typeof o !== 'object' || depth > 7) return;
        if (Array.isArray(o)) {
            if (o.length && o.every((v) => v && typeof v === 'object' && typeof v.word === 'string' && v.picture)) { bands.push({ where, list: o.slice(0, 3) }); return; }
            o.forEach((v, i) => walk(v, `${where}[${i}]`, depth + 1));
            return;
        }
        for (const [k, v] of Object.entries(o)) walk(v, `${where}.${k}`, depth + 1);
    };
    walk(PR.LESSONS, 'LESSONS');
    walk(DL.DETAILED_LESSONS, 'DETAILED');
    const seenBand = new Set();
    for (const b of bands) {
        const sig = JSON.stringify(b.list);
        if (seenBand.has(sig)) continue;
        seenBand.add(sig);
        if (typeof LV.lessonPictureAlsoShows !== 'function') { fail(`V-AMBIG ${b.where}: the lesson band's pictures declare no alsoShows`); continue; }
        const words = b.list.map((v) => String(v.word).toLowerCase());
        for (const v of b.list) {
            const xs = LV.lessonPictureAlsoShows(v.picture, v.word);
            ambig.push(`${b.where} ${v.word}: ${JSON.stringify(xs)}`);
            for (const o of words) if (o !== String(v.word).toLowerCase() && xs.includes(o)) fail(`V-AMBIG ${b.where}: the "${v.word}" picture (${v.picture.kind}${v.picture.text ? ` "${v.picture.text}"` : ''}) could also show "${o}", in the same band`);
        }
    }
    if (process.argv.includes('--ambig-list')) for (const x of ambig) console.log(`  ambig: ${x}`);
}
// V-FIT (r10, critic r9 #4 / #5, rule 5): every CORE word (the first three) of every lesson set has a picture that teaches the
// set's standard - its declared `ccss` shares a code with the set, or its `op` is an operation the set's standard names
// (VOCAB_STANDARD_OPS). The tags are the checked tree's when it has them, else this checkout's (a backtest row judges an old
// set by today's tags: 6ae462d1's times-as-many core held "total", whose 5 + 3 bar is additive part-whole, in a 4.OA.A.1 set).
const FIT6_PINNED = [
    // (r10: the non-core misfits standing when V-FIT6 was written - each awaits a lead decision; remove a line when it is fixed)
    'G4|-|findemergentfeaturesegunitsdigitcycle product',
    'G4|-|extendgrowingshapepatterns equation',
    'G4|-|multiplicativecomparisontimesasmany compare',
    'G4|-|multiplicativecomparisontimesasmany unknown',
];
{
    const here = (p) => import(pathToFileURL(path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', p)).href);
    const teaches = typeof P.vocabPictureTeaches === 'function' ? P.vocabPictureTeaches : (await here('js/modules/sheet/graphics/vocab-pictures.js')).vocabPictureTeaches;
    const OPS = W.VOCAB_STANDARD_OPS || W0.VOCAB_STANDARD_OPS || (await here('js/modules/sheet/lesson-pages/vocab-words.js')).VOCAB_STANDARD_OPS;
    for (const s of W.VOCAB_SETS) {
        const ops = new Set((s.ccss || []).flatMap((c) => OPS[c] || []));
        for (const w of s.words.slice(0, 3)) {
            const t = teaches(w);
            if (!t || (!t.ccss.length && !t.op)) { fail(`V-FIT ${s.title}: core word "${w}" has a picture with no ccss / op tag`); continue; }
            if (!t.ccss.some((c) => (s.ccss || []).includes(c)) && !ops.has(t.op)) fail(`V-FIT ${s.title} (${(s.ccss || []).join(', ')}): core word "${w}"'s picture teaches ${t.ccss.join(', ')} / ${t.op}, not the set's standard`);
        }
        // V-FIT6: the other three words too. A misfit already pinned (FIT6_PINNED: awaiting a lead decision, design/status/lf-vocab.md)
        // is reported, never added to: a swapped word that does not teach the set's standard FAILS (r9 put "output" in follow a
        // rule and "total" in growing patterns - critic r9 #5). The pin only shrinks.
        for (const w of s.words.slice(3)) {
            const t = teaches(w);
            if (!t) continue;
            if (t.ccss.some((c) => (s.ccss || []).includes(c)) || ops.has(t.op)) continue;
            const k = `${s.lesson} ${w}`;
            if (FIT6_PINNED.includes(k)) { if (process.argv.includes('--fit-report')) console.log(`  V-FIT6 pinned: ${s.title} "${w}" (${t.ccss.join(', ')} / ${t.op})`); continue; }
            fail(`V-FIT6 ${s.title} (${(s.ccss || []).join(', ')}): word "${w}"'s picture teaches ${t.ccss.join(', ')} / ${t.op}, not the set's standard`);
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
export const LOOKALIKES = [['step', 'column'], ['term', 'sequence'], ['first term', 'sequence'], ['round up', 'quotient'], ['round up', 'remainder'], ['multiple', 'pattern'],
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

// V22 (owner R-1, lf-vocab r7): every picture's focal part is declared and drawn so it can be targeted
{
    const keyCtx = Object.assign(K.resolveCtx({ size: 'L', mode: 'print', state: 'answered' }), { keyPage: true });
    const pupilCtx = K.resolveCtx({ size: 'L', mode: 'print', state: 'blank' });
    const modelCtx = K.resolveCtx({ size: 'L', mode: 'print', state: 'answered' });
    const twinCtx = K.resolveCtx({ size: 'L', mode: 'screen', options: { twin: true } });
    const GREYV = '#949494';
    for (const id of P.VOCAB_PICTURE_IDS) {
        const segs = typeof P.vocabPictureFocal === 'function' ? P.vocabPictureFocal(id) : [];
        if (!segs.length) { fail(`V22 "${id}": no focal part declared`); continue; }
        const key = P.vocabPictureSVG(keyCtx, id, { wMm: 46 });
        // (the key's targeted mark is its halo - the drawing itself stays as the pupil page draws it; the screen's is .mq-vfocal)
        const haloMarks = ((/<g class="mq-vhalo"[^>]*>([\s\S]*?)<\/g>/.exec(key) || [])[1] || '').match(/<(rect|line|circle|path|text)\b/g) || [];
        if (!haloMarks.length) fail(`V22 "${id}": the key draws no targeted focal mark (.mq-vhalo)`);
        if (key.replace(/<g class="mq-vhalo"[^>]*>[\s\S]*?<\/g>/, '') !== P.vocabPictureSVG(pupilCtx, id, { wMm: 46 })) fail(`V22 "${id}": the key changes the drawing itself (only the halo may be added)`);
        const halo = /<g class="mq-vhalo"[^>]*style="color:([^";]+)"/.exec(key);
        if (!halo) fail(`V22 "${id}": the key has no focal highlight (.mq-vhalo)`);
        else if (halo[1].toLowerCase() !== GREYV) fail(`V22 "${id}": the key's highlight is ${halo[1]}, not the single grey ${GREYV}`);
        const colours = new Set([...key.matchAll(/(?:stroke|fill|color)[=:]"?(#[0-9a-fA-F]{3,6}|rgb[^)"]*\)?)/g)].map((m) => m[1].toLowerCase()));
        for (const c of colours) if (!['#000', GREYV].includes(c)) fail(`V22 "${id}": the key uses ${c} (only ink and the single grey)`);
        for (const [nm, ctx] of [['pupil', pupilCtx], ['model', modelCtx]]) if (/mq-vfocal|mq-vhalo|\u0001|\u0002/.test(P.vocabPictureSVG(ctx, id, { wMm: 46 }))) fail(`V22 "${id}": the ${nm} print page draws the focal highlight`);
        const tw = P.vocabPictureSVG(twinCtx, id, { wMm: 46 });
        const twMarks = [...tw.matchAll(/<g class="mq-vfocal" data-vfocal="1">([\s\S]*?)<\/g>/g)].reduce((n, m) => n + (m[1].match(/<(rect|line|circle|path|text)\b/g) || []).length, 0);
        if (!/<g class="mq-vhalo[^"]*"[^>]*visibility="hidden"/.test(tw) || !twMarks) fail(`V22 "${id}": the screen twin has no hidden halo and targeted focal part`);
        // V22+ (critic r6 #6, lf-vocab r8): the key's highlight never strokes a glyph or a dot (a stroke round "+2" or round each
        // dot of an array blurred them at print scale): no <text> in the key's halo, and a filled circle's halo is unstroked
        const kh = (/<g class="mq-vhalo"[^>]*>([\s\S]*?)<\/g>/.exec(key) || [])[1] || '';
        if (/<text\b/.test(kh)) fail(`V22 "${id}": the key's highlight strokes a glyph (a <text> in .mq-vhalo)`);
        for (const [c] of kh.matchAll(/<circle\b[^>]*>/g)) if (/\sfill="(?!none)[^"]*"/.test(c) && !/stroke="none"/.test(c)) { fail(`V22 "${id}": the key's highlight strokes a dot (${c.slice(0, 90)})`); break; }
    }
}

// (V24+: words above an ELL pupil's list, critic r6 #7: "figure(s)" for digit, the vague "amount" of times as many)
const HARD_WORDS = ['figure', 'figures', 'numeral', 'numerals', 'quantity', 'amount', 'represent', 'represents', 'equivalent', 'corresponding', 'respectively', 'denote', 'denotes'];
// V24 (owner R-2, lf-vocab r7): every bank word's wrong-answer explanation
{
    const has = (txt, w) => new RegExp(`(^|[^a-z])${String(w).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(txt);
    for (const [w, e] of Object.entries(W.VOCAB_WORDS)) {
        const x = e && e.explain;
        if (!x) { fail(`V24 "${w}": no explain`); continue; }
        const lc = String(x).toLowerCase();
        if (!has(lc, w)) fail(`V24 "${w}": its explain does not name its word`);
        if (!lc.startsWith(`${String(w).toLowerCase()} means `)) fail(`V24 "${w}": its explain does not read "<Word> means ..."`);
        const n = String(x).trim().split(/\s+/).length;
        if (n > 14) fail(`V24 "${w}": its explain is ${n} words (at most 14)`);
        const rest = lc.split(String(w).toLowerCase()).join(' ');
        for (const o of e.notWith || []) if (has(rest, o)) fail(`V24 "${w}": its explain names "${o}", a word of its notWith list`);
        // V24+ (critic r6 #7, lf-vocab r8): no word above the grade's word list (ELL), and long enough to follow
        for (const h of HARD_WORDS) if (has(rest, h)) fail(`V24 "${w}": its explain uses the hard word "${h}"`);
        if (n < 6) fail(`V24 "${w}": its explain is ${n} words (at least 6)`);
    }
}

// V28 (lead ruling 2026-11-12): Guided MIN_ITEMS counts scored answers per cell (footprint points, the EB-GDPCAP count)
{
    const G = await imp('js/modules/sheet/roles/guided.js');
    if (typeof G.minMet !== 'function') fail('V28: guided.js has no minMet - MIN_ITEMS counts cells, so a Match 3 Guided page at L (Model + 1 try = 3 answers) is held short');
    else {
        const m3 = [0, 1, 2].map(() => ({ footprint: { points: 3 } })), one = [0, 1, 2, 3].map(() => ({ footprint: {} }));
        if (!G.minMet(m3, 2)) fail('V28: Model + one Match 3 try (3 answers) does not meet MIN_ITEMS');
        if (G.minMet(m3, 1)) fail('V28: the Model alone meets MIN_ITEMS');
        if (G.minMet(one, 3) || !G.minMet(one, 4)) fail('V28: a single-answer page no longer needs the Model + 3 tries');
    }
}
// V27 (critic r7 #3, #4, #5; lf-vocab r9):
//   key underlays: no two dot underlays of a key picture overlap (one underlay per group, never a ring round each dot);
//   the ladder verb is the screen task's verb (pick3 says "Tap its word": its "Here is how" says "Tap <word>.");
//   no explanation uses a broken comparison ("is 3 of the other") or ends on a bare "like 4 dots."
{
    for (const id of P.VOCAB_PICTURE_IDS) {
        const svg = P.vocabPictureSVG({ keyPage: true, state: 'answered', size: 'L' }, id);
        const cs = [...svg.matchAll(/<circle data-vu="1" cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.-]+)"/g)].map((m) => ({ x: +m[1], y: +m[2], r: +m[3] }));
        for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
            if (Math.hypot(cs[i].x - cs[j].x, cs[i].y - cs[j].y) < cs[i].r + cs[j].r - 0.01) { fail(`V27 "${id}": two key dot underlays overlap (one underlay per group)`); i = cs.length; break; }
        }
    }
    if (typeof W0.vocabHowSteps !== 'function') fail('V27: no vocabHowSteps (the "Here is how" steps)');
    else {
        const q = deal('vocab_pick3_words', {}, 1, 4242)[0];
        const verb = String(q.screenInstr || q.text || '').split('.').map((x) => x.trim()).filter(Boolean).pop().split(/\s+/)[0];
        const last = W0.vocabHowSteps('vocab-pick3', 'even').slice(-1)[0];
        if (!last.startsWith(`${verb} `)) fail(`V27 pick3: the "Here is how" step "${last}" does not use the screen verb "${verb}"`);
    }
    const GRAMMAR = [/\bis \d+ of the\b/i, /\blike \d+ dots\.$/i];
    for (const [w, e] of Object.entries(W.VOCAB_WORDS)) for (const g of GRAMMAR) if (e && e.explain && g.test(e.explain)) fail(`V27 "${w}": its explain reads ${g} ("${e.explain}")`);
}

// V26 (lf-vocab r9, precritic render-gate / cell-checks: the Pre-skill check overflowed at S, M and L): the check of a
// picture vocabulary task tests the steps under it in its own routine - 1 or 2 picture vocabulary skills at its grade or
// below (the provider's `preSkills`, read by roles/pre-skill-check.js sources) - never the Grade 6 definition-matching
// skills data.js lists before it (legacy cells taller than any check band).
{
    let PV = null, PSC = null;
    try { PV = await imp('js/modules/sheet/providers/vocabulary.js'); PSC = await imp('js/modules/sheet/roles/pre-skill-check.js'); } catch (e) { fail(`V26: cannot load the provider or the role (${e.message})`); }
    if (PV && PSC) {
        if (typeof PV.vocabPreSkills !== 'function') fail('V26: the vocabulary provider declares no preSkills');
        const legacyEarlier = (sk, n) => Array.from({ length: n }, (_, i) => ({ categoryId: 'vocabulary', skillId: `vocab_grade_6_x${i}` }));
        const gradeOf = (r) => { const o = r.opts || {}; const st = o.vocabSet !== null && o.vocabSet !== undefined ? W0.vocabSetAt(o.vocabSet) : null; return st ? st.grade : Number(o.vocabGrade) || 3; };
        const cases = [];
        for (const skillId of ['vocab_grade_pictures', 'vocab_pick3_words']) {
            cases.push({ categoryId: 'vocabulary', skillId, opts: {} });
            for (const g of W0.VOCAB_GRADES) cases.push({ categoryId: 'vocabulary', skillId, opts: { vocabGrade: g, vocabSet: null } });
            W0.VOCAB_SETS.forEach((_, i) => cases.push({ categoryId: 'vocabulary', skillId, opts: { vocabSet: i } }));
        }
        for (const sk of cases) {
            const tag = `${sk.skillId} ${JSON.stringify(sk.opts)}`;
            const pools = PSC.sources([sk], { earlier: legacyEarlier });
            const refs = pools.flatMap((p) => p.skills);
            if (!refs.length || refs.length > 2) fail(`V26 ${tag}: the check tests ${refs.length} skill(s) (want 1 or 2, one page at S / M / L)`);
            for (const r of refs) {
                if (r.categoryId !== 'vocabulary' || !['vocab_grade_pictures', 'vocab_pick3_words'].includes(r.skillId)) fail(`V26 ${tag}: the check tests ${r.categoryId}:${r.skillId} (not a picture vocabulary task)`);
                else if (gradeOf(r) > gradeOf(sk)) fail(`V26 ${tag}: the check tests grade ${gradeOf(r)} words (above the skill's grade ${gradeOf(sk)})`);
            }
        }
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
        // (--only V23,V25: only the r7 screen checks, so a backtest row runs in a minute)
        if (ONLY && ONLY.every((k) => ['V23', 'V25', 'V26', 'V27'].includes(k))) { await r7Checks(page, fail, sheet); return; }
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
        // V23 (owner R-1) + V25 (owner R-2), lf-vocab r7: the screen feedback, and the print pupil pages unchanged
        await r7Checks(page, fail, sheet);
    } finally { await app2.close(); }
}

async function r7Checks(page, fail, sheet) {
    // the pupil print pages' sha256, per skill / role / size / seed (V23: byte-identical to 70cdbaf9); the pin is read from THIS
    // checkout's tests (a backtest row runs today's checks on an old tree with MQ_ROOT)
    const PUPIL_PIN = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'fixtures', 'precritic', 'vocab-pupil-hashes.json');
    const { createHash } = await import('crypto');
    const fs = await import('fs');
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const SK = ['vocab_grade_pictures', 'vocab_pick3_words'];
    // ---- the print pages: pupil hash, key highlight GREY only
    const hashes = {};
    let keyHalos = 0;
    for (const skillId of SK) for (const role of ['independent', 'guided', 'more-practice', 'test', 'error-analysis']) for (const size of ['S', 'M', 'L']) for (const seed of [7, 143869]) {
        const r = await page.evaluate(async (a) => {
            try {
                const x = await window.buildSheet({ role: a.role, sections: [{ skills: [{ categoryId: 'vocabulary', skillId: a.skillId }] }], size: a.size, paper: 'A4', seed: a.seed, key: true });
                return { pupil: x.pupilHtml, key: x.keyHtml || '' };
            } catch (e) { return { error: String(e && e.message || e) }; }
        }, { skillId, role, size, seed });
        const id = `${skillId} ${role} ${size} ${seed}`;
        if (r.error) { fail(`V23 ${id}: not composed (${r.error})`); continue; }
        hashes[id] = createHash('sha256').update(r.pupil).digest('hex').slice(0, 16);
        if (/mq-vhalo|mq-vfocal/.test(r.pupil)) fail(`V23 ${id}: the pupil page draws the focal highlight`);
        const halos = [...r.key.matchAll(/<g [^>]*class="mq-vhalo"[^>]*>/g)].map((m) => m[0]);
        keyHalos += halos.length;
        for (const h of halos) if (!/style="color:#949494"/.test(h) || /visibility="hidden"/.test(h)) fail(`V23 ${id}: a key highlight is not shown in the single grey (${h})`);
        // (the marks themselves carry the grey: a key page recolours what it adds through `color` - the r7 render drew them orange)
        for (const [, g] of r.key.matchAll(/<g [^>]*class="mq-vhalo"[^>]*>([\s\S]*?)<\/g>/g)) for (const [t] of g.matchAll(/<(?:rect|line|circle|path|text)\b[^>]*>/g)) if (!(/stroke="#949494"/.test(t) || (/stroke="none"/.test(t) && /fill="#949494"/.test(t))) || /fill="(?!none|#949494)[^"]*"/.test(t)) { fail(`V23 ${id}: a key highlight mark is not GREY (${t.slice(0, 120)})`); break; }
    }
    if (!keyHalos) fail('V23: no key page shows the focal highlight');
    // the PRINTED key's highlight as the browser paints it: every halo mark's stroke (and solid fill) is the grey, never the
    // key ink (the r7 build's key drew it orange: the key page recolours the marks it adds, sheet-kit.css)
    for (const skillId of SK) {
        const k = await page.evaluate(async (a) => { const x = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'vocabulary', skillId: a }] }], size: 'L', paper: 'A4', seed: 42200, key: true }); return window.sheetDocument(x.keyHtml, 'k', { paper: 'A4' }); }, skillId);
        const [paint, own] = await sheet(k, () => [[...document.querySelectorAll('.mq-vhalo *')].map((e) => { const cs = getComputedStyle(e); return `${cs.stroke}|${cs.fill}`; }),
            [...document.querySelectorAll('svg.mq-vpic *:not(g)')].filter((e) => !e.closest('.mq-vhalo')).map((e) => { const cs = getComputedStyle(e); return `${cs.stroke}|${cs.fill}`; })]);
        // (and the drawing itself stays black: the r7 build's key painted the focal marks it wrapped in the key ink)
        const inked = own.filter((p) => p.split('|').some((c) => c !== 'none' && c !== 'rgb(0, 0, 0)'));
        if (inked.length) fail(`V23 ${skillId} key: ${inked.length} of the picture's own mark(s) painted ${inked[0]} (the drawing stays black; only the halo is grey)`);
        if (!paint.length) fail(`V23 ${skillId} key: no focal highlight painted`);
        const bad = paint.filter((p) => !/^(rgb\(148, 148, 148\)\|(none|rgb\(148, 148, 148\))|none\|rgb\(148, 148, 148\))$/.test(p));   // (r8: an unstroked grey underlay too)
        if (bad.length) fail(`V23 ${skillId} key: ${bad.length} highlight mark(s) painted ${bad[0]} (want the single grey rgb(148, 148, 148))`);
    }
    if (process.argv.includes('--pin-pupil')) { fs.writeFileSync(PUPIL_PIN, JSON.stringify(hashes, null, 1) + '\n'); console.log(`ws-vocab-unit: pinned ${Object.keys(hashes).length} pupil hashes`); }
    else if (process.argv.includes('--no-pupil-pin')) console.log('ws-vocab-unit: note: --no-pupil-pin: the pupil-hash pin is not compared');
    else {
        const pin = fs.existsSync(PUPIL_PIN) ? JSON.parse(fs.readFileSync(PUPIL_PIN, 'utf8')) : null;
        if (!pin) fail('V23: no pinned pupil hashes (tests/fixtures/precritic/vocab-pupil-hashes.json)');
        else for (const [id, h] of Object.entries(pin)) if (hashes[id] !== h) fail(`V23 ${id}: the pupil print page changed (${hashes[id] || 'missing'} vs pinned ${h})`);
    }
    // ---- the screen: card-820 and worksheet-1280
    // (in the page) the state of a host's vocabulary cell: highlight shown, glowing words, explanation
    const READ = (sel) => {
        const root = document.querySelector(sel);
        if (!root) return null;
        const cell = root.querySelector('.mq-vp, .mq-vm');
        const halos = [...root.querySelectorAll('svg.mq-vpic .mq-vhalo')];
        return {
            cell: !!cell,
            focal: [...root.querySelectorAll('svg.mq-vpic')].map((sv) => sv.querySelectorAll('.mq-vfocal *').length),
            haloOn: halos.filter((h) => getComputedStyle(h).visibility === 'visible').length,
            haloN: halos.length,
            // (the PAINTED stroke of the halo's marks: the screen cell's black-and-white ink pass rewrites colours inline, and
            // the r7 build's yellow halo painted grey - its group's color was yellow, its marks were not)
            haloColor: [...root.querySelectorAll('svg.mq-vpic .mq-vhalo *')].map((m) => getComputedStyle(m).stroke).find((c) => !/148, 148, 148/.test(c)) || [...root.querySelectorAll('svg.mq-vpic .mq-vhalo *')].map((m) => getComputedStyle(m).stroke)[0] || '',
            haloGrey: [...root.querySelectorAll('svg.mq-vpic .mq-vhalo *')].filter((m) => !/255, 2\d\d, \d+/.test(getComputedStyle(m).stroke)).length,
            exBorder: [...root.querySelectorAll('.mq-vexplain')].map((e) => getComputedStyle(e).borderLeftColor)[0] || '',
            haloW: halos.map((h) => { const m = h.querySelector('*'); return m ? parseFloat(getComputedStyle(m).strokeWidth) : 0; })[0] || 0,
            glow: [...root.querySelectorAll('.mq-vglow')].map((e) => e.textContent.trim()),
            glowBg: [...root.querySelectorAll('.mq-vglow')].map((e) => getComputedStyle(e).backgroundColor)[0] || '',
            explain: [...root.querySelectorAll('.mq-vexplain p')].map((e) => e.textContent.trim()),
            // (r8) the letters of the Match 3 pictures whose highlight shows, the lit letters, the pick3 line's wrong mark, the
            // visible "Here is how" text, and the set of feedback blocks the card shows
            haloLetters: [...root.querySelectorAll('.mq-vm-pic')].filter((pc) => [...pc.querySelectorAll('svg.mq-vpic .mq-vhalo')].some((h) => getComputedStyle(h).visibility === 'visible')).map((pc) => (pc.querySelector('.mq-vm-let') || {}).textContent || '?').sort(),
            litLetters: [...root.querySelectorAll('.mq-vglow-let')].map((e) => e.textContent.trim()).sort(),
            lineWrong: [...root.querySelectorAll('.mq-vp-line')].map((e) => e.classList.contains('box-wrong')),
            ladder: [...root.querySelectorAll('.mq-ladder-worked, .mq-vhow')].filter((e) => e.offsetParent !== null && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden').map((e) => e.innerText.replace(/\s+/g, ' ').trim()),
            blocks: ['.mq-vexplain', '.mq-vhow', '.mq-ladder-worked', '.mq-ladder-msg', '.mq-ladder-extra'].filter((k) => [...root.querySelectorAll(k)].some((e) => e.offsetParent !== null && getComputedStyle(e).display !== 'none')),
        };
    };
    // (in the page) answer the item right or wrong, the way the pupil does: tap a bank word / write the letters
    const ANSWER = (a) => {
        const st = window.state;
        const q = a.host === 'card' ? st.currentQ : st.worksheetQs[a.i];
        const root = document.querySelector(a.sel);
        const p = q.cell.payload;
        let want;
        if (q.cell.template === 'vocab-pick3') {
            const w = a.right ? p.word : p.bank.find((x) => x !== p.word);
            root.querySelector(`button[data-mq-choice="${w}"]`).click();
            want = { tpl: 'pick3', word: p.word, right: [p.word], wrong: a.right ? [] : [p.word], letters: [] };
        } else {
            const L = ['A', 'B', 'C'];
            const ins = [...root.querySelectorAll('.mq-vm-box input')];
            // wrong: the first two rows swapped, the third right
            const vals = p.order.map((wi) => L[wi]);
            if (!a.right) { const t = vals[0]; vals[0] = vals[1]; vals[1] = t; }
            ins.forEach((el, n) => { el.value = vals[n]; el.dispatchEvent(new Event('input', { bubbles: true })); });
            want = { tpl: 'match3', right: a.right ? p.order.map((wi) => p.words[wi]) : [p.words[p.order[2]]], wrong: a.right ? [] : [p.words[p.order[0]], p.words[p.order[1]]], letters: a.right ? [] : [L[p.order[0]], L[p.order[1]]] };
        }
        return want;
    };
    // (r8, critic r6 #1: Match 3's line names the LETTER the pupil writes, "<Word> is picture <L>!"; pick3 the word)
    const EXPECT = (want) => want.wrong.map((w, i) => (want.tpl === 'match3' ? `${w.charAt(0).toUpperCase() + w.slice(1)} is picture ${want.letters[i]}! ` : `The answer is ${w}! `) + W.VOCAB_WORDS[w].explain);
    const judge = (tag, before, after, want, spoken, tts) => {
        if (!before || !before.cell) { fail(`V23 ${tag}: no vocabulary cell`); return; }
        if (before.haloOn || before.glow.length || before.explain.length) fail(`V23 ${tag}: highlighted BEFORE the answer (${JSON.stringify(before)})`);
        if (before.focal.some((n) => !n)) fail(`V23 ${tag}: a picture with no targeted focal part (${before.focal})`);
        if (!after) { fail(`V23 ${tag}: the cell is gone after the answer`); return; }
        if (want.tpl === 'match3' && want.wrong.length) {
            // V25+ (critic r6 #1): only the pictures of the wrongly matched words glow, each with its letter lit
            if (after.haloOn !== want.wrong.length) fail(`V25 ${tag}: ${after.haloOn} picture(s) glow, want ${want.wrong.length} (only the wrongly matched words' pictures)`);
            if (JSON.stringify(after.haloLetters) !== JSON.stringify(want.letters.slice().sort())) fail(`V25 ${tag}: the glowing pictures are ${JSON.stringify(after.haloLetters)}, want ${JSON.stringify(want.letters.slice().sort())}`);
            if (JSON.stringify(after.litLetters) !== JSON.stringify(want.letters.slice().sort())) fail(`V25 ${tag}: the lit letters are ${JSON.stringify(after.litLetters)}, want ${JSON.stringify(want.letters.slice().sort())}`);
            for (const [i] of want.wrong.entries()) if (!(after.explain[i] || '').includes(`picture ${want.letters[i]}!`)) fail(`V25 ${tag}: the line "${after.explain[i] || ''}" does not name the letter ${want.letters[i]}`);
        } else if (!after.haloN || after.haloOn !== after.haloN) fail(`V23 ${tag}: the focal part is not highlighted after the answer (${after.haloOn}/${after.haloN})`);
        // V25+ (critic r6 #5): a wrong pick3 word on the line carries the slot's wrong outline
        if (want.tpl === 'pick3' && want.wrong.length && !after.lineWrong.some(Boolean)) fail(`V25 ${tag}: the wrong word's line has no box-wrong`);
        // V26 (critic r6 #2, #3): after the explanation, a "Here is how" never repeats it, never gives a first-letter rung or a
        // blank, and its last step names the answer
        if (after.explain.length) {
            const sentences = after.explain.join(' ').split(/(?<=[.!?])\s+/).map((x) => x.trim().toLowerCase().replace(/[.!?]$/, '')).filter((x) => x.split(' ').length >= 3);
            for (const l of after.ladder) {
                const lc = l.toLowerCase();
                for (const se of sentences) if (lc.includes(se)) { fail(`V26 ${tag}: "Here is how" repeats the explanation ("${se}")`); break; }
                if (/starts with/.test(lc)) fail(`V26 ${tag}: "Here is how" gives a first-letter rung after the explanation`);
                if (/_{2,}|"\s*"/.test(l)) fail(`V26 ${tag}: "Here is how" has a blank after the explanation (${l.slice(0, 80)})`);
                if (want.tpl === 'pick3' && !lc.includes(String(want.word).toLowerCase())) fail(`V26 ${tag}: "Here is how" does not name the word ${want.word}`);
            }
            if (!after.ladder.length) fail(`V26 ${tag}: a wrong answer shows no "Here is how"`);
        }
        if (after.haloW < 4) fail(`V23 ${tag}: the highlight is not thick (${after.haloW} px)`);
        if (after.haloGrey) fail(`V23 ${tag}: ${after.haloGrey} highlight mark(s) are not painted yellow (${after.haloColor})`);
        if (after.explain.length && !/255, 2\d\d, \d+/.test(after.exBorder)) fail(`V25 ${tag}: the explanation's yellow edge is painted ${after.exBorder}`);
        if (JSON.stringify(after.glow.slice().sort()) !== JSON.stringify(want.right.slice().sort())) fail(`V23 ${tag}: the glowing words are ${JSON.stringify(after.glow)}, want ${JSON.stringify(want.right)}`);
        if (after.glow.length && !/255, 2\d\d, \d+/.test(after.glowBg)) fail(`V23 ${tag}: the right word does not glow yellow (${after.glowBg})`);
        const ex = EXPECT(want);
        if (JSON.stringify(after.explain) !== JSON.stringify(ex)) fail(`V25 ${tag}: the explanation is ${JSON.stringify(after.explain)}, want ${JSON.stringify(ex)}`);
        if (spoken) {
            const wantSpoken = ex.length && tts ? [ex.join(' ')] : [];
            if (JSON.stringify(spoken) !== JSON.stringify(wantSpoken)) fail(`V25 ${tag}: spoken ${JSON.stringify(spoken)}, want ${JSON.stringify(wantSpoken)} (sound ${tts ? 'on' : 'off'})`);
        }
    };
    // card-820 (owner 2026-11-13: no phone width; was card-390): wrong with sound on, wrong with sound off, right
    await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 1 });
    for (const skillId of SK) for (const [right, tts] of [[false, true], [false, false], [true, true]]) {
        const tag = `${skillId} card-820 ${right ? 'right' : 'wrong'} sound ${tts ? 'on' : 'off'}`;
        await page.evaluate((k, tts) => {
            window.__spoken = []; window.speak = (t) => { window.__spoken.push(String(t)); };
            const st = window.state; st.ttsEnabled = tts; st.quizMode = false; st.mapMode = false; st.category = 'vocabulary'; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
            window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion();
        }, skillId, tts);
        await sleep(400);
        const before = await page.evaluate(READ, '#questionCard');
        const want = await page.evaluate(ANSWER, { host: 'card', sel: '#questionCard', right });
        await sleep(150);
        await page.evaluate(() => { const b = document.querySelector('#qcCheckBtn'); if (b && !window.state.hasAnswered) b.click(); });
        await sleep(250);
        const after = await page.evaluate(READ, '#questionCard');
        const spoken = await page.evaluate(() => window.__spoken);
        judge(tag, before, after, want, spoken, tts);
        // (a right answer's card moves on after 2.5 s: let that timer pass, or it replaces the next case's question)
        if (right) await sleep(3200);
    }
    // worksheet-1280: item 1 wrong, item 2 right, then Check all (1 picture, 3 words grades a wrong tap only there: a model
    // twin's verdict waits); the first wrong card's explanation is spoken, once
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    for (const skillId of SK) {
        // (r8: a fresh page - the card runs above leave state behind that kept the support ladder off the worksheet)
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForFunction(() => typeof window.initWorksheet === 'function' && !!window.SKILLS, { timeout: 30000 });
        await page.evaluate((k) => {
            window.__spoken = []; window.speak = (t) => { window.__spoken.push(String(t)); };
            const st = window.state; st.ttsEnabled = true; st.category = 'vocabulary'; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 3; window.initWorksheet();
        }, skillId);
        await sleep(900);
        const before = [], want = [];
        for (const [i, right] of [[0, false], [1, true]]) {
            const sel = `#ws_card_${i}`;
            before.push(await page.evaluate(READ, sel));
            want.push(await page.evaluate(ANSWER, { host: 'worksheet', sel, i, right }));
            await sleep(150);
            // (r8, critic r6 #4: item 1 is also checked on its own while it is the current card - up to 4 tries, the support
            // ladder climbing a rung a try to its worked "Here is how", the critic's state - and item 3 is left empty, so Check
            // all judges both kinds of wrong card)
            if (i === 0) {
                await page.evaluate(async () => { for (let t = 0; t < 4 && !document.querySelector('#ws_card_0 .mq-ladder-worked'); t++) { try { window.checkWorksheetAnswer(0); } catch (e) { /* optional */ } await new Promise((r) => setTimeout(r, 250)); } });
                await sleep(300);
            }
        }
        await page.evaluate(() => { window.__spoken = []; window.checkAllWorksheet(); });
        await sleep(300);
        // V27: every wrong card shows the same feedback blocks
        {
            const bl = [];
            for (const i of [0, 2]) { const r = await page.evaluate(READ, `#ws_card_${i}`); bl.push(r ? r.blocks.join(',') : 'none'); }
            if (bl[0] !== bl[1]) fail(`V27 ${skillId} worksheet-1280: wrong cards show different feedback blocks (item 1: ${bl[0]}; item 3: ${bl[1]})`);
        }
        for (const [i, right] of [[0, false], [1, true]]) {
            const after = await page.evaluate(READ, `#ws_card_${i}`);
            judge(`${skillId} worksheet-1280 item ${i + 1} ${right ? 'right' : 'wrong'}`, before[i], after, want[i], null, true);
        }
        const spoken = await page.evaluate(() => window.__spoken);
        const ex = EXPECT(want[0]).join(' ');
        if (JSON.stringify(spoken) !== JSON.stringify([ex])) fail(`V25 ${skillId} worksheet-1280 Check all: spoken ${JSON.stringify(spoken)}, want once ${JSON.stringify([ex])}`);
        await page.evaluate(() => { Array.from(document.body.children).filter((e) => getComputedStyle(e).position === 'fixed' && getComputedStyle(e).zIndex === '9999').forEach((e) => e.remove()); });
    }
}

console.log(`ws-vocab-unit: ${W.VOCAB_SETS.length} lesson sets, ${P.VOCAB_PICTURE_IDS.length} pictures, ${items} items dealt`);
for (const f of fails.slice(0, Number(process.env.VOCAB_SHOW) || 40)) console.log(`  - ${f}`);
console.log(`ws-vocab-unit: ${fails.length ? `FAIL (${fails.length})` : 'OK'}`);
process.exit(fails.length ? 1 : 0);
