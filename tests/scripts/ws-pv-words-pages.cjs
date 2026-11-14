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
//                        Round-cap r3 (critic live1 r2 N3 / N6, the class "the Steps on a page must fit EVERY item on that page"):
//                        11 and 12 are their own kind (teen-irregular: no ones word, not teen words) and 0-10 are one kind
//                        (one word each); --pages defaults to every role that sets a Model / Steps over items - guided,
//                        opener, lesson (the chart's worked example + the Guided Practice band), scripted-model - on every
//                        wordform x band x answer slot; and EVERY judged item must be the Model's kind.
// LESSON-RULE-FITS       each sheet's Rule / Remember / Steps lines name only a box, a place (tens, hundreds, thousands), a teen
//                        word or a dash that some number-name item ON THAT SHEET has (critic live1 r2 N6: "Rule: Every box gets
//                        a digit." over written words on a line; "Remember: A number name says the hundreds, then the rest."
//                        over two-digit numbers).
// --seeds N (default 8) hashed seeds a role plus --seed-list (default 913052, critic live2 N9); --deals 'band 1000,...' limits the deals.
// Prints `ws-pv-words-pages: OK` / `FAIL (n)` last; exits 1 on FAIL. --show N prints N findings (default 30).
const H = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const ONLY = arg('only', '') ? list(arg('only')) : null;
const on = (id) => !ONLY || ONLY.includes(id);
const SIZES = list(arg('sizes', 'M,L'));   // (owner, 2026-11-13: print size S is dropped)
// (critic live2 N9: 3 seeds missed a band-1000 Guided page with 'one thousand' under the hundreds Steps - seed 913052; 8 seeds
// find it, and the fixed --seed-list is dealt on every role besides)
const NSEED = Number(arg('seeds', 8));
const FIXED = list(arg('seed-list', '913052')).map(Number);
const DEAL_ONLY = arg('deals', '') ? list(arg('deals')) : null;
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
// (the Scripted Model deals ONE worked example a page: four times the seeds, so its kinds are sampled as widely)
const seedsFor = (role) => [...new Set([...Array.from({ length: role === 'scripted-model' ? NSEED * 4 : NSEED }, (_, k) => (hash(`composing__number_word_form:${role}`) + k * 7919) % 1000000), ...FIXED])];
// (critic live1 N1 / N2: the to_words deals and the H T O boxes at 1,000 too - the first version read only words to numeral)
const DEALS = [['default', null], ['band 20', { band: 20 }], ['band 100', { band: 100 }], ['band 1000', { band: 1000 }],
    ['band 1000 hto', { band: 1000, answerSlot: 'hto' }], ['band 100 hto', { band: 100, answerSlot: 'hto' }],
    ['band 20 hto', { band: 20, answerSlot: 'hto' }],
    ['to_words', { wordform: ['to_words'] }], ['to_words band 20', { wordform: ['to_words'], band: 20 }], ['to_words band 100', { wordform: ['to_words'], band: 100 }],
    ['to_words band 1000', { wordform: ['to_words'], band: 1000 }]];
// (critic live1 N3: the Opener's Guided band - its items share the Model's kind)
// (round-cap r3, critic live1 r2 N6: every role that sets a Model / Steps over items - the lesson and the Scripted Model too)
const ROLES = list(arg('pages', 'guided,opener,lesson,scripted-model'));   // (--pages, not --roles: the page kinds read, the plan's role path is precritic --skill)

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
    // (critic live2 N9: two place words in a row - '"one thousand hundred": ___ in the hundreds.')
    const m = /\bthe no\b|\bno is\b|\b(\w+)\s+\1\b|\b(?:thousands?|hundreds?)\s+(?:thousands?|hundreds?|tens|ones)\b|undefined|NaN|\$\{|\bnull\b/i.exec(t);
    return m ? m[0] : '';
}
// (round-cap r3, critic live1 r2 N3 / N6: 11 and 12 have no ones word, so they are their own kind; 0 and the one-word names
// one to ten are one kind - 'ten' is one word, not a tens word with a 0)
const kindOfN = (n) => (n <= 10 ? 'one-word' : n <= 12 ? 'teen-irregular' : n < 20 ? 'teen' : n < 100 && n % 10 === 0 ? 'decade' : n < 100 ? 'two-word' : n < 1000 ? 'hundreds' : 'thousand');
const kindOf = kindOfN;
/** The kinds a Steps band covers, read from its words (both ways round). */
function covered(steps) {
    const s = String(steps).toLowerCase();
    const k = new Set();
    if (/say the number|write its word|read the word|its number|its digit/.test(s)) k.add('one-word');
    // (every name from zero to twenty is one word: Steps that say so cover all of them)
    if (/one word up to twenty/.test(s)) ['one-word', 'teen-irregular', 'teen', 'decade'].forEach((x) => k.add(x));
    // (a teen Step - "find the ones in the word", "the teen word" - reads 13-19 only: eleven and twelve have no ones word and are
    // not teen words; they are covered only by Steps that name them)
    if (/teen word|thirteen to nineteen|eleven to nineteen|find the ones in the word/.test(s)) k.add('teen');
    if (/eleven and twelve|eleven or twelve/.test(s)) k.add('teen-irregular');
    if (/tens word alone|no ones/.test(s)) k.add('decade');
    if (/hundreds word/.test(s)) k.add('hundreds');
    if (/thousand/.test(s)) k.add('thousand');
    if (/tens word/.test(s) && /ones word/.test(s)) k.add('two-word');
    if (/tens word/.test(s) && /no (tens or )?ones word|write\s0/.test(s)) k.add('decade');
    return k;
}
/** The one-word Steps "Write its digit." cannot write ten (two digits). */
const stepsMiss = (steps, n) => (/its digit\b/i.test(String(steps)) && n >= 10);

/**
 * In the page: every printed sheet (.ws-page), each with its Steps text, its Rule / Remember lines and its number-name items:
 * {way, n (the name's value or the numeral), hint, hto, model, band}. The Model is the Guided page's model cell, the Opener's
 * and the Scripted Model's Model band, and the lesson's anchor chart (its worked example).
 */
function readPage() {
    const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
        'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
    const nameValue = (text) => {
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
    };
    const txt = (e) => (e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : '');
    const out = [];
    for (const pg of document.querySelectorAll('.ws-page')) {
        const sheet = pg.getAttribute('data-ws-sheet') || pg.getAttribute('data-ws-role') || '';
        const strips = [...pg.querySelectorAll('.ws-strip')].map((st) => ({ label: txt(st.querySelector('b')).replace(/[:\s]+$/, ''), st }));
        const stepsBand = [...pg.querySelectorAll('.ws-band')].find((b) => /^Steps$/.test(txt(b.querySelector('.ws-strip b')).replace(/[:\s]+$/, '')));
        const stepTexts = [];
        if (stepsBand) stepTexts.push(txt(stepsBand).replace(/^Steps:\s*/, ''));
        pg.querySelectorAll('.mq-lsteps li, .mq-steptext span, .mq-cheads .mq-chead b').forEach((e) => stepTexts.push(txt(e)));
        const rules = [...pg.querySelectorAll('.mq-cchant span, .mq-lchant, .mq-lstripchant span')].map(txt).filter(Boolean)
            .concat(strips.filter((x) => x.label === 'Rule').map((x) => txt(x.st).replace(/^Rule:\s*/, '')));
        const remember = strips.filter((x) => x.label === 'Remember').map((x) => txt(x.st).replace(/^Remember:\s*/, ''));
        const cells = [];
        for (const w of pg.querySelectorAll('.ws-words')) {
            const way = w.getAttribute('data-ws-words') || '';
            const first = w.querySelector(':scope > span');
            const shown = txt(first);
            const n = way === 'to_words' ? (/^[\d,]+$/.test(shown) ? Number(shown.replace(/,/g, '')) : null) : nameValue(shown);
            if (n === null) continue;
            const c = w.closest('[data-ws-cell]');
            const hl = c && c.querySelector('.mq-hintline');
            const band = w.closest('.ws-band');
            const lab = band ? txt(band.querySelector('.ws-strip b')).replace(/[:\s]+$/, '') : '';
            const chart = !!w.closest('.mq-chartgrid') || sheet === 'lesson-chart';
            const model = chart || (c && (!!c.querySelector('.ws-modeltab') || c.classList.contains('mq-modelcell'))) || lab === 'Model';
            cells.push({ way, n, name: shown, hint: hl ? txt(hl) : '', hto: !!w.querySelector('[data-ws-hto]'), model: !!model, band: lab, chart });
        }
        out.push({ sheet, role: pg.getAttribute('data-ws-role') || '', steps: stepTexts.join(' / '), rules, remember, cells });
    }
    return out;
}

/** LESSON-RULE-FITS: the places, slot shapes and word kinds a Rule / Remember / Steps line names, each needing an item that has it. */
const NAMED = [
    ['a box', /\bbox(es)?\b/i, (c) => c.hto],
    ['the hundreds', /\bhundreds?\b/i, (c) => c.n >= 100],
    ['the thousands', /\bthousands?\b/i, (c) => c.n >= 1000],
    ['the tens', /\btens?\b/i, (c) => c.n >= 10],
    ['a teen word', /\bteen\b|teen word|thirteen to nineteen|eleven to nineteen/i, (c) => c.n >= 11 && c.n <= 19],
    ['a dash', /\bdash\b/i, (c) => c.n > 20 && c.n % 100 > 20 && c.n % 10 !== 0],
];
function ruleMisfits(text, cells) {
    return NAMED.filter(([, re, has]) => re.test(String(text || '')) && !cells.some(has)).map(([what]) => what);
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
        if (DEAL_ONLY && !DEAL_ONLY.includes(tag)) continue;
        const r = await page.evaluate(async ({ role, size, seed, opts }) => {
            try {
                const r = await window.buildSheet({ role, sections: [{ skills: [Object.assign({ categoryId: 'composing', skillId: 'number_word_form' }, opts ? { opts } : {})], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed, form: 'A', key: true });
                return { html: window.sheetDocument(r.pupilHtml, r.title || 't', { paper: 'A4' }) };
            } catch (e) { return { error: String((e && e.message) || e).slice(0, 200) }; }
        }, { role, size, seed, opts });
        const at = `${role} ${size} ${tag} seed ${seed}`;
        if (r.error) { bad.push(`BUILD ${at}: ${r.error}`); continue; }
        await sheet.setContent(r.html, { waitUntil: 'load', timeout: 60000 });
        const sheets = await sheet.evaluate(readPage);
        // (the role's own sheets: a lesson packet's Practice pages are the Independent role, judged on its own run)
        const own = sheets.filter((p) => p.role === role);
        pages += own.length;
        const all = own.flatMap((p) => p.cells);
        items += all.length;
        if (!all.length) { bad.push(`READ ${at}: no number read on the page`); continue; }
        const nameOf = (n) => { const ONES0 = ONES; const two = (v) => (v < 20 ? ONES0[v] : Object.keys(TENS).find((k) => TENS[k] === Math.floor(v / 10) * 10) + (v % 10 ? '-' + ONES0[v % 10] : ''));
            return n === 1000 ? 'one thousand' : n < 100 ? two(n) : `${ONES0[Math.floor(n / 100)]} hundred${n % 100 ? ' ' + two(n % 100) : ''}`; };
        for (const c of all) {
            if (!c.hint) continue;
            hints++;
            if (on('GUIDED-HINT-LEAK')) { const why = leak(c.hint, c.n, c.way, nameOf(c.n)); if (why) bad.push(`GUIDED-HINT-LEAK ${at}: the hint "${c.hint}" under "${c.name}" gives the answer away (${why})`); }
            if (on('GUIDED-HINT-GARBLE')) { const g = garble(c.hint); if (g) bad.push(`GUIDED-HINT-GARBLE ${at}: the hint "${c.hint}" under "${c.name}" does not read ("${g}")`); }
        }
        if (on('GUIDED-ONE-KIND')) {
            // The items a Model / Steps is set over: the Guided page - every cell; the Opener - its Model and Guided band (the
            // Independent band may mix); the lesson - the chart's worked example and the Guided Practice band (round-cap r3,
            // critic live1 r2 N6); the Scripted Model - its worked example.
            const judged = role === 'guided' || role === 'scripted-model' ? all
                : all.filter((c) => c.model || c.band === 'Guided Practice');
            const steps = own.map((p) => p.steps).filter(Boolean).join(' / ');
            const model = judged.find((c) => c.model) || judged[0];
            // (1) every item is the Model's kind (PT 2.3: the Model's Steps fit every Guided item)
            if (model) {
                const off = judged.filter((c) => kindOf(c.n) !== kindOf(model.n));
                if (off.length) bad.push(`GUIDED-ONE-KIND ${at}: the Model "${model.name}" (${kindOf(model.n)}) sits over ${off.map((c) => `"${c.name}" (${kindOf(c.n)})`).slice(0, 3).join(', ')}`);
            }
            // (2) the page's general Steps cover each item's kind (the Guided page and the Opener print the provider's Steps; the
            // lesson and the Scripted Model print the example's worked steps, judged by (1) and LESSON-RULE-FITS)
            if (role === 'guided' || role === 'opener' || role === 'scripted-model') {
                const gen = role === 'scripted-model' ? steps : own.map((p) => p.steps).filter(Boolean)[0] || '';
                const cov = covered(gen);
                const general = role !== 'scripted-model' || cov.size > 0;   // (a Scripted Model of worked steps only names no kind)
                const off = general ? judged.filter((c) => !cov.has(kindOf(c.n)) || stepsMiss(gen, c.n)) : [];
                if (off.length) bad.push(`GUIDED-ONE-KIND ${at}: the Steps "${gen.slice(0, 90)}" do not cover ${off.map((c) => `"${c.name}" (${kindOf(c.n)})`).slice(0, 3).join(', ')}`);
                // (critic live1 N2: Steps that name a place no item has - "Say the hundreds" over 53, 26, 99)
                const st = gen.toLowerCase();
                if (/hundred/.test(st) && !judged.some((c) => c.n >= 100)) bad.push(`GUIDED-ONE-KIND ${at}: the Steps name the hundreds ("${gen.slice(0, 70)}") but no item has a hundreds digit`);
                if (/\btens?\b/.test(st) && judged.length && judged.every((c) => c.n < 10)) bad.push(`GUIDED-ONE-KIND ${at}: the Steps name the tens but no item has one`);
            }
        }
        if (on('LESSON-RULE-FITS')) {
            // Each sheet's Rule, Remember and Steps lines name only boxes, places and word kinds that some number-name item ON
            // THAT SHEET has (round-cap r3, critic live1 r2 N6: "Rule: Every box gets a digit." with no box; "Remember: ... the
            // hundreds" over two-digit numbers)
            for (const p of own) {
                if (!p.cells.length) continue;
                for (const [what, list] of [['Rule', p.rules], ['Remember', p.remember], ['Steps', p.steps ? [p.steps] : []]]) for (const t of list) {
                    const miss = ruleMisfits(t, p.cells);
                    if (miss.length) bad.push(`LESSON-RULE-FITS ${at} (${p.sheet}): ${what} "${t.slice(0, 80)}" names ${miss.join(', ')}, which no item on the sheet has (${p.cells.map((c) => c.name).slice(0, 6).join(', ')})`);
                }
            }
        }
    }
    console.log(`  ${pages} sheets (${ROLES.join(', ')} x ${SIZES.join('/')} x ${DEALS.length} deals x ${NSEED} seeds), ${items} items, ${hints} hints read`);
    await app.close();
    for (const b of bad.slice(0, Number(arg("show", 30)))) console.log(`  FAIL ${b}`);
    if (bad.length > Number(arg("show", 30))) console.log(`  ... ${bad.length - Number(arg("show", 30))} more`);
    console.log(`ws-pv-words-pages: ${bad.length ? `FAIL (${bad.length})` : 'OK'}`);
    process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.log(String((e && e.stack) || e)); console.log('ws-pv-words-pages: FAIL (error)'); process.exit(2); });
