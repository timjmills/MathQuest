#!/usr/bin/env node
// ws-pv-words-pages — what composing:number_word_form's printed Guided page SHOWS (lf-placevalue live1; lf-roles critic r8b D3 /
// D4). Browser: each page is built through window.buildSheet with the critic's seed (ws-grade-render's hash of
// "composing__number_word_form:guided") plus two more, at M and L, on the default deal and on every band (20 / 100 / 1,000),
// and read from its DOM: the Steps band, and each cell's number name, answer and grey hint line (.mq-hintline).
//
//   tests/scripts/mq-browser-run.sh node tests/scripts/ws-pv-words-pages.cjs
//   ... --only GUIDED-HINT-LEAK,GUIDED-ONE-KIND   --sizes M,L   --seeds 3
//   MQ_ROOT=<tree> ... (ws-backtest commit-pair)
//
// GUIDED-HINT-LEAK (D3)  PT 2.3: the first try row's grey hint is the problem's own first worked step holding NONE of its
//                        answer, as a gapped frame. Each hint is read for the number it gives: its place phrases built together
//                        ("2 tens, 6 ones" -> 26, "3 hundreds" ...) and its digits; FAIL when the place phrases build the answer,
//                        or the hint names every digit of the answer (as a multiset: 22 needs two 2s). r8b: '"twenty-six": 2 tens,
//                        6 ones.' under twenty-six.
// GUIDED-ONE-KIND (D4)   PT 2.3 "one kind of problem per page, so the Steps fit every item": each item is tagged one-word (0-9),
//                        teen (11-19), decade (10, 20 ... 90), two-word (21-99, not a decade), hundreds (100-999) or thousand;
//                        FAIL when an item's kind is one the page's Steps do not cover (the tens-word / ones-word Steps cover
//                        two-word names; "No ones word? Write 0" adds the decades; a teen needs its own "1 ten" step; the
//                        hundreds-word Steps cover 100-999). r8b: "eleven" on the tens-word / ones-word page at M.
// Prints `ws-pv-words-pages: OK` / `FAIL (n)` last; exits 1 on FAIL.
const H = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const ONLY = arg('only', '') ? list(arg('only')) : null;
const on = (id) => !ONLY || ONLY.includes(id);
const SIZES = list(arg('sizes', 'M,L'));   // (owner, 2026-11-13: print size S is dropped)
const NSEED = Number(arg('seeds', 3));
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const seedsFor = (role) => Array.from({ length: NSEED }, (_, k) => (hash(`composing__number_word_form:${role}`) + k * 7919) % 1000000);
// (critic live1 N1 / N2: the to_words deals and the H T O boxes at 1,000 too - the first version read only words to numeral)
const DEALS = [['default', null], ['band 20', { band: 20 }], ['band 100', { band: 100 }], ['band 1000', { band: 1000 }],
    ['band 1000 hto', { band: 1000, answerSlot: 'hto' }], ['band 100 hto', { band: 100, answerSlot: 'hto' }],
    ['to_words', { wordform: ['to_words'] }], ['to_words band 20', { wordform: ['to_words'], band: 20 }], ['to_words band 1000', { wordform: ['to_words'], band: 1000 }]];
// (critic live1 N3: the Opener's Guided band - its items share the Model's kind)
const ROLES = list(arg('roles', 'guided,opener'));

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
    'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
/** "three hundred twenty-six" -> 326; null when the text is not a number name. */
function nameValue(text) {
    const w = String(text || '').toLowerCase().replace(/[^a-z\s-]/g, ' ').split(/[\s-]+/).filter(Boolean);
    if (!w.length) return null;
    let total = 0, cur = 0;
    for (const x of w) {
        if (ONES.includes(x)) cur += ONES.indexOf(x);
        else if (x in TENS) cur += TENS[x];
        else if (x === 'hundred') cur = (cur || 1) * 100;
        else if (x === 'thousand') { total += (cur || 1) * 1000; cur = 0; } else return null;
    }
    return total + cur;
}
const PLACE = { thousand: 1000, hundred: 100, ten: 10, one: 1 };
/** The number a hint's place phrases build ("2 tens, 6 ones" -> 26), or null under two phrases. */
function placeBuilt(text) {
    let sum = 0, k = 0;
    for (const m of String(text).matchAll(/\b(\d+)\s+(thousand|hundred|ten|one)s?\b/gi)) { sum += Number(m[1]) * PLACE[m[2].toLowerCase()]; k++; }
    return k >= 2 ? sum : null;
}
/**
 * Does the hint give the answer away? Words to numeral (answer n): its place phrases build n, or it names ANY digit of n outside
 * a ruled gap (critic live1 N1, PT 2.3 "holds NONE of its answer": '"two hundred": 2 in the hundreds.' under 262 named the 2).
 * Numeral to words (answer: the name): it names any WORD of the name - its place-unit words after a count ("2 tens", "1 one")
 * are the counting, not the name.
 */
function leak(hint, n, way, name) {
    const t = String(hint).replace(/,(?=\d{3}\b)/g, '');
    if (way === 'to_words') {
        const own = new Set(String(name || '').toLowerCase().split(/[\s-]+/).filter(Boolean));
        const said = t.toLowerCase().replace(/\d+\s+(ones?|tens?|hundreds?|thousands?)\b/g, ' ').replace(/[^a-z\s-]/g, ' ').split(/[\s-]+/).filter(Boolean);
        const hit = said.find((w) => own.has(w));
        return hit ? `it names "${hit}", a word of the answer "${name}"` : '';
    }
    if (placeBuilt(t) === n) return 'its place phrases build ' + n;
    const digits = new Set(String(n).split(''));
    const named = (t.match(/\d/g) || []).find((d) => digits.has(d));
    if (named) return `it names ${named}, a digit of ${n}, outside a gap`;
    return '';
}
/** GUIDED-HINT-GARBLE: a hint that does not read as English - a template filled with 'no' ("the no is"), a doubled word, a hole. */
function garble(hint) {
    const t = String(hint);
    const m = /\bthe no\b|\bno is\b|\b(\w+)\s+\1\b|undefined|NaN|\$\{|\bnull\b/i.exec(t);
    return m ? m[0] : '';
}
const kindOfN = (n) => (n < 10 ? 'one-word' : n < 20 && n !== 10 ? 'teen' : n < 100 && n % 10 === 0 ? 'decade' : n < 100 ? 'two-word' : n < 1000 ? 'hundreds' : 'thousand');
const kindOf = (n) => (n === 10 || n === 20 ? 'decade-to-20' : kindOfN(n));
/** The kinds a Steps band covers, read from its words (both ways round). */
function covered(steps) {
    const s = String(steps).toLowerCase();
    const k = new Set();
    if (/say the number|write its word/.test(s)) k.add('one-word');
    // (every name from zero to twenty is one word: Steps that say so cover all of them)
    if (/one word up to twenty/.test(s)) ['one-word', 'teen', 'decade-to-20'].forEach((x) => k.add(x));
    if (/teen word/.test(s)) k.add('teen');
    if (/tens word alone|no ones/.test(s)) { k.add('decade'); k.add('decade-to-20'); }
    if (/say the hundreds word/.test(s)) k.add('hundreds');
    if (/hundreds word/.test(s)) { k.add('hundreds'); }
    if (/thousand/.test(s)) k.add('thousand');
    if (/tens word/.test(s) && /ones word/.test(s)) k.add('two-word');
    if (/tens word/.test(s) && /no (tens or )?ones word|write 0/.test(s)) { k.add('decade'); k.add('decade-to-20'); }
    if (/eleven to nineteen|teen/.test(s)) k.add('teen');
    if (/read the word|its digit/.test(s)) k.add('one-word');
    return k;
}

/** In the page: the Steps band text, every cell (name, hint, Model?) and the cells of each band by its label. */
function readPage() {
    const steps = [...document.querySelectorAll('.ws-page')].slice(0, 1).map((pg) => {
        const b = [...pg.querySelectorAll('*')].find((e) => /^\s*Steps:/.test(e.textContent || '') && (e.textContent || '').length < 400);
        return b ? b.textContent.replace(/\s+/g, ' ').trim() : '';
    })[0] || '';
    const cells = [];
    for (const c of document.querySelectorAll('.ws-page [data-ws-cell]')) {
        if (c.parentElement && c.parentElement.closest('[data-ws-cell]')) continue;
        const hl = c.querySelector('.mq-hintline');
        const clone = c.cloneNode(true);
        clone.querySelectorAll('.mq-hintline, .ws-trace, [data-ws-ink="trace"], .ws-modeltab, .ws-tab, [data-ws-label]').forEach((e) => e.remove());
        const band = c.closest('.ws-band');
        const lab = band && band.querySelector('.ws-strip b, b');
        cells.push({ name: (clone.textContent || '').replace(/\s+/g, ' ').trim(), hint: hl ? hl.textContent.replace(/\s+/g, ' ').trim() : '', model: !!c.querySelector('.ws-modeltab') || c.classList.contains('mq-modelcell'),
            band: lab ? lab.textContent.replace(/[:\s]+$/, '').trim() : '' });
    }
    return { steps, cells };
}

(async () => {
    const app = await H.open({});
    const page = app.page;
    const sheet = await app.browser.newPage();
    await sheet.setViewport({ width: 900, height: 1200 });
    await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });
    const bad = [];
    let hints = 0, pages = 0, items = 0;
    for (const role of ROLES) for (const size of SIZES) for (const [tag, opts] of DEALS) for (const seed of seedsFor(role)) {
        // (the Opener on the deals it is graded on: the default and band 20, both ways round)
        if (role === 'opener' && !['default', 'band 20', 'to_words', 'to_words band 20'].includes(tag)) continue;
        const r = await page.evaluate(async ({ role, size, seed, opts }) => {
            try {
                const r = await window.buildSheet({ role, sections: [{ skills: [Object.assign({ categoryId: 'composing', skillId: 'number_word_form' }, opts ? { opts } : {})], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed, form: 'A', key: true });
                return { html: window.sheetDocument(r.pupilHtml, r.title || 't', { paper: 'A4' }) };
            } catch (e) { return { error: String((e && e.message) || e).slice(0, 200) }; }
        }, { role, size, seed, opts });
        const at = `${role} ${size} ${tag} seed ${seed}`;
        if (r.error) { bad.push(`BUILD ${at}: ${r.error}`); continue; }
        await sheet.setContent(r.html, { waitUntil: 'load', timeout: 60000 });
        const pg = await sheet.evaluate(readPage);
        pages++;
        const way = opts && opts.wordform && opts.wordform[0] === 'to_words' ? 'to_words' : 'to_number';
        // (a cell's text less its H T O / Th H T O heads; numeral to words shows the numeral itself)
        const valueOf = (c) => { const t = c.name.replace(/(?:Th)?H?T?O\b|\b(?:Th|H|T|O)\b/g, ' ').replace(/\s+/g, ' ').trim(); return way === 'to_words' ? (/^[\d,]+$/.test(t) ? Number(t.replace(/,/g, '')) : null) : nameValue(t); };
        const named = pg.cells.map((c) => ({ ...c, n: valueOf(c) })).filter((c) => c.n !== null);
        items += named.length;
        if (!named.length) { bad.push(`READ ${at}: no number read on the page`); continue; }
        const nameOf = (n) => { const ONES0 = ONES; const two = (v) => (v < 20 ? ONES0[v] : Object.keys(TENS).find((k) => TENS[k] === Math.floor(v / 10) * 10) + (v % 10 ? '-' + ONES0[v % 10] : ''));
            return n === 1000 ? 'one thousand' : n < 100 ? two(n) : `${ONES0[Math.floor(n / 100)]} hundred${n % 100 ? ' ' + two(n % 100) : ''}`; };
        for (const c of named) {
            if (!c.hint) continue;
            hints++;
            if (on('GUIDED-HINT-LEAK')) { const why = leak(c.hint, c.n, way, nameOf(c.n)); if (why) bad.push(`GUIDED-HINT-LEAK ${at}: the hint "${c.hint}" under "${c.name}" gives the answer away (${why})`); }
            if (on('GUIDED-HINT-GARBLE')) { const g = garble(c.hint); if (g) bad.push(`GUIDED-HINT-GARBLE ${at}: the hint "${c.hint}" under "${c.name}" does not read ("${g}")`); }
        }
        if (on('GUIDED-ONE-KIND')) {
            // (the Guided page: every cell; the Opener: the Model and its Guided band - the Independent band may mix)
            const judged = role === 'opener' ? named.filter((c) => /^(Model|Guided Practice)$/.test(c.band)) : named;
            const cov = covered(pg.steps);
            const kinds = [...new Set(judged.map((c) => kindOf(c.n)))];
            const off = judged.filter((c) => !cov.has(kindOf(c.n)));
            if (off.length) bad.push(`GUIDED-ONE-KIND ${at}: the Steps "${pg.steps.slice(0, 90)}" do not cover ${off.map((c) => `"${c.name}" (${kindOf(c.n)})`).slice(0, 3).join(', ')}; kinds: ${kinds.join(', ')}`);
            // (critic live1 N2: Steps that name a place no item has - "Say the hundreds" over 53, 26, 99)
            const st = pg.steps.toLowerCase();
            if (/hundred/.test(st) && !judged.some((c) => c.n >= 100)) bad.push(`GUIDED-ONE-KIND ${at}: the Steps name the hundreds ("${pg.steps.slice(0, 70)}") but no item has a hundreds digit`);
            if (/\btens?\b/.test(st) && judged.length && judged.every((c) => c.n < 10)) bad.push(`GUIDED-ONE-KIND ${at}: the Steps name the tens but no item has one`);
            // (the Opener's Model and Guided band: a kind its Steps do not cover is caught above with the Model's own Steps - the
            // band's Steps are read off the Model - so "twenty" beside a teen Model fails there)
        }
    }
    console.log(`  ${pages} pages (${ROLES.join(', ')} x ${SIZES.join('/')} x ${DEALS.length} deals x ${NSEED} seeds), ${items} items, ${hints} hints read`);
    await app.close();
    for (const b of bad.slice(0, 20)) console.log(`  FAIL ${b}`);
    if (bad.length > 20) console.log(`  ... ${bad.length - 20} more`);
    console.log(`ws-pv-words-pages: ${bad.length ? `FAIL (${bad.length})` : 'OK'}`);
    process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.log(String((e && e.stack) || e)); console.log('ws-pv-words-pages: FAIL (error)'); process.exit(2); });
