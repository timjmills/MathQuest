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
// TOF-SHARE (r2 N1)  True or False? at S / M / L on every offered option value (band 99 .. 999,999, closeness close / far,
//                    lengths mixed, the default): 40-60 % of the statements on each page are false (PT-TOF-1). r2: 12-33 %.
// MARK-CLEAR (r2 N2) the Scripted Model's states, the lesson anchor and the Guided page at S / M / L: every mark - the box round
//                    the deciding digits (its outline), the bigger number's underline - keeps 0.5 mm from every character it
//                    does not mark (the character's box from Range.getClientRects). r2: the box ran through "4" and "7" of 417.
// MODEL-M6 (r2 N4)   the worked example - Guided Model, Scripted Model, Opener Model, lesson anchor - on the default, band
//                    999,999 and lengths=mixed: an item M6 (the last digits; lengths differing, the first) gets WRONG.
//                    r2: band 999,999's Guided Model 992,323 > 992,321, decided at the ones place.
// EQ-SHARE-PAGE (r2 N7) independent, more-practice, test, guided, opener, lesson at S / M / L: each page holds at most
//                    ceil(n / 6) "=" of its n compare problems; a Test's item 1 and a Guided page's first two are never "=".
// WRAP-SIGN (r2)     scripted-model, guided and lesson at S / M / L: no line of text ends in a sign (< > = and the operators)
//                    with the rest of its expression on the next line (ws-geom-probe WRAP-OP with wrapOps; r2: "7 >" / "5.").
// SIDE-PAD (r1 F9)   independent at L (3 across) on the default and band 9,999 / 999,999: every digit of every problem stands
//                    at least 5 mm inside its cell's rules. r2: 4.5-4.8 mm.
// Prints `ws-pv-compare-pages: OK` / `FAIL (n)` last; exits 1 on FAIL.
const H = require('../lib/ws-harness.cjs');
const { GEOM_PROBE } = require('../lib/ws-geom-probe.cjs');

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
    // (M-C3: lengths differing, the digits read from the left without counting them - the first that differs decides: 89 > 312, 345 < 37)
    const k = [...sa.slice(0, Math.min(sa.length, sb.length))].findIndex((d, i) => d !== sb[i]);
    const first = sa.length !== sb.length && k >= 0 ? truth(Number(sa[k]), Number(sb[k])) : null;
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
    const m6Wrong = (a, b) => { const t = truth(a, b), sa = String(a), sb = String(b); const last = truth(Number(sa.slice(-1)), Number(sb.slice(-1))); const k = [...sa.slice(0, Math.min(sa.length, sb.length))].findIndex((d, i) => d !== sb[i]); const first = sa.length !== sb.length && k >= 0 ? truth(Number(sa[k]), Number(sb[k])) : '='; return (last !== '=' && last !== t) || (first !== '=' && first !== t); };
    if (on('TOF-SHARE')) {
        const OPTS = [['default', null], ['band 99', { band: 99 }], ['band 9999', { band: 9999 }], ['band 99999', { band: 99999 }], ['band 999999', { band: 999999 }],
            ['close', { closeness: 'close' }], ['far', { closeness: 'far' }], ['mixed', { lengths: 'mixed' }]];
        for (const size of SIZES) for (const [tag, opts] of OPTS) for (const seed of seedsFor('true-false').slice(0, 2)) {
            const cs = (await build('true-false', size, seed, opts)).filter((c) => c.sign && Number.isFinite(c.a) && Number.isFinite(c.b));
            if (!cs.length) { bad.push(`TOF-SHARE ${size} ${tag} seed ${seed}: no statement read`); continue; }
            const f = cs.filter((c) => c.sign !== truth(c.a, c.b)).length / cs.length;
            if (f < 0.4 || f > 0.6) bad.push(`TOF-SHARE true-false ${size} ${tag} seed ${seed}: ${Math.round(f * 100)} % of ${cs.length} statements are false (PT-TOF-1: 40-60 %)`);
        }
        console.log('  TOF-SHARE: true-false at ' + SIZES.join('/') + ' x 8 option values');
    }
    if (on('MARK-CLEAR')) {
        for (const role of ['scripted-model', 'lesson', 'guided']) for (const size of SIZES) for (const [tag, opts] of [['default', null], ['band 999999', { band: 999999 }]]) {
            const seed = seedsFor(role)[0];
            await build(role, size, seed, opts);
            const r = await sheet.evaluate(() => {
                const MM = 96 / 25.4;
                const out = { marks: 0, hits: [] };
                const range = document.createRange();
                for (const pc of document.querySelectorAll('.pv-compare')) {
                    const marks = [...pc.querySelectorAll('[data-pv-mark="digit"], [data-pv-mark="win"]')];
                    if (!marks.length) continue;
                    const glyphs = [];
                    const tw = document.createTreeWalker(pc, NodeFilter.SHOW_TEXT);
                    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
                        if (getComputedStyle(n.parentElement).color === 'rgba(0, 0, 0, 0)' || n.parentElement.closest('[data-ws-slot]')) continue;
                        for (let i = 0; i < n.nodeValue.length; i++) {
                            if (/\s/.test(n.nodeValue[i])) continue;
                            range.setStart(n, i); range.setEnd(n, i + 1);
                            const rr = range.getClientRects()[0];
                            if (rr && rr.width) glyphs.push({ ch: n.nodeValue[i], node: n, r: rr });
                        }
                    }
                    for (const m of marks) {
                        out.marks++;
                        const cs = getComputedStyle(m);
                        const b = m.getBoundingClientRect();
                        let box;
                        if (m.dataset.pvMark === 'digit') {
                            const e = parseFloat(cs.outlineOffset) + parseFloat(cs.outlineWidth);
                            box = { l: b.left - e, r: b.right + e, t: b.top - e, b: b.bottom + e, what: 'box' };
                        } else {
                            const w = parseFloat(cs.borderBottomWidth);
                            box = { l: b.left, r: b.right, t: b.bottom - w, b: b.bottom, what: 'underline' };
                        }
                        const pad = 0.5 * MM;
                        for (const g of glyphs) {
                            if (m.contains(g.node)) continue;
                            const gr = g.r;
                            if (gr.right > box.l - pad && gr.left < box.r + pad && gr.bottom > box.t - pad && gr.top < box.b + pad) {
                                const dx = Math.max(box.l - gr.right, gr.left - box.r, 0), dy = Math.max(box.t - gr.bottom, gr.top - box.b, 0);
                                out.hits.push(`${box.what} round "${m.textContent.trim()}" ${(Math.max(dx, dy) / MM).toFixed(2)} mm from "${g.ch}" (${pc.textContent.replace(/\s+/g, ' ').trim().slice(0, 40)})`);
                            }
                        }
                    }
                }
                return out;
            });
            // (the Guided page draws its tries at step 1 - the digit counts - and may draw no box or underline: judged where drawn)
            if (!r.marks && role !== 'guided') bad.push(`MARK-CLEAR ${role} ${size} ${tag}: no mark drawn`);
            for (const h of r.hits.slice(0, 3)) bad.push(`MARK-CLEAR ${role} ${size} ${tag}: the ${h} (want 0.5 mm clear of every character it does not mark)`);
        }
        console.log('  MARK-CLEAR: scripted-model, lesson, guided at ' + SIZES.join('/'));
    }
    if (on('MODEL-M6')) {
        for (const role of ['guided', 'scripted-model', 'opener', 'lesson']) for (const size of SIZES) for (const [tag, opts] of [['default', null], ['band 999999', { band: 999999 }], ['mixed', { lengths: 'mixed' }]]) for (const seed of seedsFor(role).slice(0, 2)) {
            const cs = await build(role, size, seed, opts);
            const models = role === 'scripted-model' || role === 'lesson' ? cs.slice(0, 1) : cs.filter((c) => c.traced).slice(0, 1);
            if (!models.length) { bad.push(`MODEL-M6 ${role} ${size} ${tag} seed ${seed}: no worked example found`); continue; }
            const mo = models[0];
            if (!m6Wrong(mo.a, mo.b)) bad.push(`MODEL-M6 ${role} ${size} ${tag} seed ${seed}: the worked example ${mo.a} / ${mo.b} is one M6 gets right (the last digits - or the first, lengths differing - give the right sign)`);
        }
        console.log('  MODEL-M6: guided, scripted-model, opener, lesson');
    }
    if (on('EQ-SHARE-PAGE')) {
        for (const role of ['independent', 'more-practice', 'test', 'guided', 'opener', 'lesson']) for (const size of SIZES) for (const seed of seedsFor(role)) {
            await build(role, size, seed, null);
            const pages = await sheet.evaluate(() => [...document.querySelectorAll('.ws-page')].map((pg) => [...pg.querySelectorAll('.pv-compare')].map((el) => {
                const t = (el.textContent || '').replace(/\d+ digits?/g, ' ');
                const nums = (t.match(/\d[\d,]*/g) || []).map((x) => Number(x.replace(/,/g, '')));
                return nums.length >= 2 ? nums[0] === nums[nums.length - 1] : null;
            }).filter((x) => x !== null)));
            pages.forEach((eqs, pi) => {
                const n = eqs.length, k = eqs.filter(Boolean).length;
                if (k > Math.ceil(n / 6)) bad.push(`EQ-SHARE-PAGE ${role} ${size} seed ${seed} p${pi + 1}: ${k} "=" in ${n} problems (at most ${Math.ceil(n / 6)})`);
                if (pi === 0 && role === 'test' && eqs[0]) bad.push(`EQ-SHARE-PAGE test ${size} seed ${seed}: item 1 is "="`);
                if (pi === 0 && role === 'guided' && eqs.slice(0, 2).some(Boolean)) bad.push(`EQ-SHARE-PAGE guided ${size} seed ${seed}: the Model or the first try is "="`);
            });
        }
        console.log('  EQ-SHARE-PAGE: six roles at ' + SIZES.join('/'));
    }
    if (on('WRAP-SIGN')) {
        for (const role of ['scripted-model', 'guided', 'lesson']) for (const size of SIZES) for (const seed of seedsFor(role)) {
            await build(role, size, seed, null);
            const g = await sheet.evaluate(GEOM_PROBE, { wrapOps: '−+×÷=<>' });
            for (const w of g.wraps.slice(0, 2)) bad.push(`WRAP-SIGN ${role} ${size} seed ${seed} p${w.page}: a line ends in "${w.op}": "${w.before}" / "${w.after}..." (join the sign to its numbers with no-break spaces)`);
        }
        console.log('  WRAP-SIGN: scripted-model, guided, lesson at ' + SIZES.join('/'));
    }
    if (on('SIDE-PAD')) {
        for (const [tag, opts] of [['default', null], ['band 9999', { band: 9999 }], ['band 999999', { band: 999999 }]]) for (const seed of seedsFor('independent').slice(0, 2)) {
            await build('independent', 'L', seed, opts);
            const r = await sheet.evaluate(() => {
                const MM = 96 / 25.4;
                const range = document.createRange();
                let min = Infinity, at = '';
                for (const pc of document.querySelectorAll('.ws-page .pv-compare')) {
                    const cell = pc.closest('.ws-cell, [data-ws-cell]');
                    if (!cell) continue;
                    const cr = cell.getBoundingClientRect();
                    const tw = document.createTreeWalker(pc, NodeFilter.SHOW_TEXT);
                    for (let n = tw.nextNode(); n; n = tw.nextNode()) for (let i = 0; i < n.nodeValue.length; i++) {
                        if (!/\d/.test(n.nodeValue[i])) continue;
                        range.setStart(n, i); range.setEnd(n, i + 1);
                        const g = range.getBoundingClientRect();
                        const d = Math.min(g.left - cr.left, cr.right - g.right) / MM;
                        if (d < min) { min = d; at = pc.textContent.replace(/\s+/g, ' ').trim(); }
                    }
                }
                return { min, at };
            });
            if (r.min < 5) bad.push(`SIDE-PAD independent L ${tag} seed ${seed}: a digit of "${r.at}" stands ${r.min.toFixed(2)} mm inside its cell's rule (want 5 mm)`);
            console.log(`  SIDE-PAD independent L ${tag} seed ${seed}: nearest digit ${r.min.toFixed(2)} mm from a cell rule`);
        }
    }
    await app.close();
    for (const b of bad.slice(0, 30)) console.log(`  FAIL ${b}`);
    console.log(`ws-pv-compare-pages: ${bad.length ? `FAIL (${bad.length})` : 'OK'}`);
    process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-pv-compare-pages: FAIL - ' + e.message); process.exit(1); });
