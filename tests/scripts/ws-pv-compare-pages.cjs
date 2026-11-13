#!/usr/bin/env node
// ws-pv-compare-pages — what placevalue:compare's printed pages SHOW (lf-placevalue compare r2; critic r1 F2, F3, F4). Browser:
// each page is built through window.buildSheet (as ws-cell-checks builds it, the critic's seed plus two more) and read from
// its DOM - every ".pv-compare" problem: its two numbers and the sign it shows.
//
//   tests/scripts/mq-browser-run.sh node tests/scripts/ws-pv-compare-pages.cjs
//   ... --only M6-SHOWN,EQ-MODEL,STATE-MARKS,MODEL-RESERVE   --sizes S,L   --seeds 3
//   MQ_ROOT=<tree> ... (ws-backtest commit-pair)
//
// M6-SHOWN (F3)      on Error analysis, True or False? and Reason It, at every size, on the default deal and lengths=mixed: at
//                    least half of the WRONG signs shown are the card's M6 (the last digits compared, or - lengths
//                    differing - the first digits), and a lengths=mixed page with two or more errors shows the first-digit
//                    form (89 > 312) at least once. r1: "509 < 508", "418 < 418" - the reversed sign, no M6, at L.
// EQ-MODEL (F4)      the worked example is never "=" (it decides nothing): the Guided Model, every Scripted Model state, the
//                    Opener Model and the lesson's anchor. r1: the Guided page's only Model was "691 = 691".
// STATE-MARKS (F2)   the Scripted Model's states and the lesson anchor's first four panels each draw something new: no two
//                    consecutive states are the same drawing. r1: "States 1 and 2 draw the same picture."
// MODEL-RESERVE      (lf-roles review of compare r3, b2) the Guided page's Model row - the Model beside the hinted tries - reserves
//                    max(the Model tab's clearance, the hint line), never their sum: its fullest cell leaves at most 3 mm white
//                    under its ink. 023cafca: the row 41 / 54 / 61 mm at S / M / L, 21-25 mm white under the hint line.
// Prints `ws-pv-compare-pages: OK` / `FAIL (n)` last; exits 1 on FAIL.
const H = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const ONLY = arg('only', '') ? list(arg('only')) : null;
const on = (id) => !ONLY || ONLY.includes(id);
const SIZES = list(arg('sizes', 'S,M,L'));
const NSEED = Number(arg('seeds', 3));
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const seedsFor = (role) => Array.from({ length: NSEED }, (_, k) => (hash(`placevalue__compare:${role}`) + k * 7919) % 1000000);

/** In the page: every compare problem, in document order, as {a, b, sign, html}. */
function readCompares() {
    const out = [];
    for (const el of document.querySelectorAll('.pv-compare')) {
        const txt = (el.textContent || '').replace(/\s+/g, ' ');
        // (the two numbers are the first and the last child - a number, or a step state's column of label and number)
        const kids = [...el.children];
        const numOf = (k) => ((k && k.textContent) || '').replace(/\d+ digits?/g, ' ').replace(/\s+/g, '');
        const nums = kids.length >= 2 ? [numOf(kids[0]), numOf(kids[kids.length - 1])].filter((x) => /^\d[\d,]*$/.test(x)) : (txt.match(/\d[\d,]*/g) || []);
        const sign = (txt.match(/[<>=]/) || [''])[0];
        const traced = !!el.querySelector('.ws-trace, [data-ws-ink="trace"]');
        out.push({ a: nums.length ? Number(nums[0].replace(/,/g, '')) : NaN, b: nums.length > 1 ? Number(nums[nums.length - 1].replace(/,/g, '')) : NaN, sign, traced, html: el.outerHTML.replace(/ data-ws-a?slot="[^"]*"/g, '') });
    }
    return out;
}

const truth = (a, b) => (a > b ? '>' : a < b ? '<' : '=');
const m6Of = (a, b, sign) => {
    const sa = String(a), sb = String(b);
    const last = truth(Number(sa.slice(-1)), Number(sb.slice(-1)));
    const first = sa.length !== sb.length ? truth(Number(sa[0]), Number(sb[0])) : null;
    return first && sign === first ? 'M-C3' : sign === last ? 'M-C2' : null;
};

(async () => {
    const app = await H.open({});
    const page = app.page;
    const sheet = await app.browser.newPage();
    await sheet.setViewport({ width: 900, height: 1200 });
    await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });
    const bad = [];
    const build = async (role, size, seed, opts) => {
        const r = await page.evaluate(async ({ role, size, seed, opts }) => {
            try {
                const r = await window.buildSheet({ role, sections: [{ skills: [Object.assign({ categoryId: 'placevalue', skillId: 'compare' }, opts ? { opts } : {})], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed, form: 'A', key: true, anchors: 'off' });
                return { html: window.sheetDocument(r.pupilHtml, r.title || 't', { paper: 'A4' }) };
            } catch (e) { return { error: String((e && e.message) || e).slice(0, 200) }; }
        }, { role, size, seed, opts });
        if (r.error) { bad.push(`${role} ${size} seed ${seed}: ${r.error}`); return []; }
        await sheet.setContent(r.html, { waitUntil: 'load', timeout: 60000 });
        return sheet.evaluate(readCompares);
    };

    if (on('M6-SHOWN')) {
        for (const role of ['error-analysis', 'true-false', 'reason-it']) for (const size of SIZES) for (const [tag, opts] of [['default', null], ['mixed', { lengths: 'mixed' }]]) {
            let err = 0, m6 = 0, c3 = 0, pages = 0;
            for (const seed of seedsFor(role)) {
                const cs = await build(role, size, seed, opts);
                let e = 0, k3 = 0, mm = 0;
                for (const c of cs) {
                    if (!c.sign || !Number.isFinite(c.a) || !Number.isFinite(c.b) || c.sign === truth(c.a, c.b)) continue;
                    e++;
                    const m = m6Of(c.a, c.b, c.sign);
                    if (m) mm++;
                    if (m === 'M-C3') k3++;
                }
                pages++; err += e; m6 += mm; c3 += k3;
                if (e && mm < e / 2) bad.push(`M6-SHOWN ${role} ${size} ${tag} seed ${seed}: ${mm} of ${e} errors shown are M6`);
                if (tag === 'mixed' && e >= 2 && !k3) bad.push(`M6-SHOWN ${role} ${size} mixed seed ${seed}: ${e} errors, none in the first-digit form (89 > 312)`);
            }
            if (!err) bad.push(`M6-SHOWN ${role} ${size} ${tag}: no error shown on ${pages} page(s)`);
            console.log(`  M6-SHOWN ${role} ${size} ${tag}: ${err} errors on ${pages} pages, ${m6} M6 (${c3} first-digit)`);
        }
    }
    if (on('EQ-MODEL')) {
        for (const role of ['guided', 'scripted-model', 'opener', 'lesson']) for (const size of SIZES) for (const seed of seedsFor(role)) {
            const cs = await build(role, size, seed, null);
            // the model: guided / opener - the traced problem first on the page; scripted model - every state; lesson - the anchor
            const models = role === 'scripted-model' ? cs : role === 'lesson' ? cs.slice(0, 1) : cs.filter((c) => c.traced).slice(0, 1);
            const eq = models.filter((c) => c.a === c.b);
            if (!models.length) bad.push(`EQ-MODEL ${role} ${size} seed ${seed}: no worked example found`);
            if (eq.length) bad.push(`EQ-MODEL ${role} ${size} seed ${seed}: the worked example is "${eq[0].a} = ${eq[0].b}"`);
        }
        console.log('  EQ-MODEL: guided, scripted-model, opener, lesson checked');
    }
    if (on('STATE-MARKS')) {
        for (const role of ['scripted-model', 'lesson']) for (const size of SIZES) for (const seed of seedsFor(role).slice(0, 1)) {
            const cs = await build(role, size, seed, null);
            const states = role === 'lesson' ? cs.slice(0, 4) : cs;
            for (let i = 1; i < states.length; i++) {
                if (states[i].a !== states[0].a || states[i].b !== states[0].b) break;
                if (states[i].html === states[i - 1].html) bad.push(`STATE-MARKS ${role} ${size}: state ${i + 1} draws the same picture as state ${i} (${states[i].a} / ${states[i].b})`);
            }
        }
        console.log('  STATE-MARKS: scripted-model, lesson anchor checked');
    }
    if (on('MODEL-RESERVE')) {
        // (lf-roles review of compare r3, 2026-11-13, item b2: the Guided page's Model row - the Model beside the hinted tries
        // of a `tightRows` host - reserves the LARGER of the Model's tab clearance and the tries' hint line, never their sum;
        // the sum left the row 38 mm at M for 10 mm of ink, 023cafca. Read: the row's fullest cell leaves at most 3 mm white
        // under its ink inside its bottom pad.)
        for (const size of SIZES) for (const seed of seedsFor('guided')) {
            await build('guided', size, seed, null);
            const r = await sheet.evaluate(() => {
                const MM = 96 / 25.4;
                const m = document.querySelector('.ws-page .mq-modelcell');
                if (!m) return { error: 'no Model cell' };
                const mr = m.getBoundingClientRect();
                const row = [...m.parentElement.children].filter((c) => c.classList.contains('ws-cell')).filter((c) => { const r = c.getBoundingClientRect(); return Math.abs(r.top - mr.top) < 0.5 * MM && Math.abs(r.height - mr.height) < 0.5 * MM; });
                const white = row.map((c) => {
                    const cr = c.getBoundingClientRect();
                    let low = -Infinity;
                    for (const d of c.querySelectorAll('*')) {
                        if (d.closest('.ws-modeltab, .ws-tab, .ws-letter, [data-ws-label]')) continue;
                        const ink = [...d.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) || /^(svg|img)$/i.test(d.tagName);
                        if (!ink) continue;
                        const r = d.getBoundingClientRect(); if (r.height) low = Math.max(low, r.bottom);
                    }
                    return (cr.bottom - parseFloat(getComputedStyle(c).paddingBottom) - low) / MM;
                });
                return { h: mr.height / MM, cells: row.length, minWhite: Math.min(...white) };
            });
            if (r.error) { bad.push(`MODEL-RESERVE guided ${size} seed ${seed}: ${r.error}`); continue; }
            if (r.minWhite > 3) bad.push(`MODEL-RESERVE guided ${size} seed ${seed}: the Model row (${r.h.toFixed(1)} mm, ${r.cells} cells) leaves ${r.minWhite.toFixed(1)} mm white under its fullest cell's ink (over 3 mm: the row reserves the tab clearance AND the hint line, or is stretched past its content)`);
        }
        console.log('  MODEL-RESERVE: guided Model row at ' + SIZES.join('/'));
    }
    await app.close();
    for (const b of bad.slice(0, 30)) console.log(`  FAIL ${b}`);
    console.log(`ws-pv-compare-pages: ${bad.length ? `FAIL (${bad.length})` : 'OK'}`);
    process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-pv-compare-pages: FAIL - ' + e.message); process.exit(1); });
