// Wave 4.4 lane test: the answer key options (owner 2026-10-03).
//
//   node tests/scripts/key-options.cjs            the gate
//   node tests/scripts/key-options.cjs --shots    also print every combination to PDF + PNG
//                                                 ($KEY_SHOTS, default <tmp>/mq-key-options)
//
// Checks, for a 3-page independent sheet of add_facts, a stack skill, a fractions skill and a
// clock skill, at S and L, in all four combinations (end / after-page x copy / short), and a
// mixed sheet of several skills:
//   1. Backward compatibility: key true / missing / {} build exactly today's sheet (byte-identical
//      pupil and key html, key at the end); key false builds no key; an old saved printout request
//      (boolean key) still builds.
//   2. Page order: end = P1 P2 P3 K1 K2 K3; after-page copy = P1 K1 P2 K2 P3 K3 (each key page is its
//      own pupil page filled in: same cell count); after-page short = P1 k(1) P2 k(2) ...
//   3. Footers: pupil pages keep "n/N"; key pages after each page say "Key n/N"; short keys "Key i/M".
//   4. The short key covers every labelled item exactly once, per pupil page, with the facsimile's
//      answer data, and fits fewer pages than the facsimile.
//   5. The colour token: the key ink is #c2410c on key answers only; no pupil page paints it;
//      contrast on white >= 4.5:1.
//   6. Old codes: the skill / settings codes do not carry key settings, so they decode unchanged
//      (ws-code-snapshot is the full gate); the teacher-print request carries {on, placement, style}.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ROOT, open } = require('../lib/ws-harness.cjs');

const SHOTS = process.argv.includes('--shots');
const OUT = process.env.KEY_SHOTS || path.join(require('os').tmpdir(), 'mq-key-options');
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const src0 = () => fs.readFileSync(path.join(ROOT, 'js', 'modules', 'teacher-print.js'), 'utf8');
const log = (...a) => console.log(...a);

const SINGLE = [
    { categoryId: 'addition', skillId: 'add_facts' },
    { categoryId: 'addition', skillId: 'add_20_regroup' },
    { categoryId: 'fractions', skillId: 'shade_fraction' },
    { categoryId: 'measurement', skillId: 'time_half_hour' },
];
const MIXED = [
    { categoryId: 'addition', skillId: 'add_facts' },
    { categoryId: 'subtraction', skillId: 'sub_facts' },
    { categoryId: 'fractions', skillId: 'write_fraction' },
    { categoryId: 'measurement', skillId: 'time_hour' },
];
const COMBOS = [['end', 'copy'], ['end', 'short'], ['after-page', 'copy'], ['after-page', 'short']];

function lum(hex) {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

// Runs in the page: build each skill's copy and short key, align every key cell with its pupil twin.
async function alignProbe({ role, FAM }) {
    const out = [];
    const f = document.createElement('iframe'); f.style.cssText = 'position:absolute;left:-3000px;width:900px;height:1200px'; document.body.appendChild(f);
    const ORANGE = 'rgb(194, 65, 12)';
    const lcs = (a, b) => {
        const n = a.length, m = b.length; const dp = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
        for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        const got = new Set(); let i = 0, j = 0;
        while (i < n && j < m) { if (a[i] === b[j]) { got.add(j); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; }
        return got;
    };
    const lcsMap = (a, b) => {
        const n = a.length, m = b.length; const dp = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
        for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        const got = new Map(); let i = 0, j = 0;
        while (i < n && j < m) { if (a[i] === b[j]) { got.set(j, i); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; }
        return got;
    };
    for (const [categoryId, skillId] of FAM) {
        const req = { role, sections: [{ skills: [{ categoryId, skillId }] }], size: 'L', paper: 'A4', seed: 4242, key: { on: true, placement: 'end', style: 'copy' } };
        let res, sres;
        try { res = await window.buildSheet(req); sres = await window.buildSheet(Object.assign({}, req, { key: { on: true, placement: 'end', style: 'short' } })); } catch (e) { out.push({ skillId, skip: String(e && e.message || e).slice(0, 60) }); continue; }
        f.srcdoc = window.sheetDocument(res.docHtml, 'x'); await new Promise((ok) => { f.onload = ok; });
        const d = f.contentDocument, w = f.contentWindow;
        const pupil = [...d.querySelectorAll('section.ws-page[data-ws-mode="print"]')];
        const keys = [...d.querySelectorAll('section.ws-page[data-ws-mode="key"]')];
        const srows = sres.shortRows || [];
        const issues = [];
        const vis = (el) => { const cs = w.getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && el.getClientRects().length; };
        const texts = (cell) => { const tw = d.createTreeWalker(cell, NodeFilter.SHOW_TEXT); const o = []; let n; while ((n = tw.nextNode())) { const s = n.textContent.replace(/\s+/g, ' ').trim(); if (s && n.parentElement && vis(n.parentElement)) o.push({ s, el: n.parentElement }); } return o; };
        const svgs = (cell) => [...cell.querySelectorAll('svg line, svg path, svg circle, svg polyline, svg polygon, svg rect, svg ellipse')].filter(vis).map((el) => ({ el, s: [el.tagName, ...['d', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'points', 'x', 'y', 'width', 'height', 'stroke-dasharray', 'transform'].map((a) => el.getAttribute(a) || '')].join('|') }));
        const top = (pg) => [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]'));
        keys.forEach((kp, ki) => {
            const pp = pupil[ki]; if (!pp) return;
            const kc = top(kp), pc = top(pp);
            kc.forEach((cell, ci) => {
                const pcell = pc[ci]; if (!pcell) return;
                const where = `p${ki + 1}c${ci + 1}`;
                // counted per cell, order-free: every given the pupil page prints must keep its black
                // copy on the key; whatever the key adds beyond that must be key ink
                const K = texts(cell), P = texts(pcell);
                const tally = (list, f) => list.reduce((mp, x) => (f(x) ? mp.set(x.s, (mp.get(x.s) || 0) + 1) : mp), new Map());
                // lead ruling (critic r3, Q1): a Model cell that traces its answer is the worked example -
                // all given, nothing in key ink; a traced answer anywhere else is the pupil's, key ink
                const model = cell.matches('[data-ws-key-model]') || !!cell.querySelector('[data-ws-key-model]');
                const traced = !!pcell.querySelector('[data-ws-ink="trace"]');
                if (model && traced) {
                    const or = [...cell.querySelectorAll('*')].find((e) => vis(e) && (w.getComputedStyle(e).color === ORANGE || (e instanceof w.SVGElement && (w.getComputedStyle(e).stroke === ORANGE || w.getComputedStyle(e).fill === ORANGE))));
                    if (or) issues.push(`${where} the worked Model prints "${or.textContent.trim().slice(0, 16)}" in key ink`);
                    return;
                }
                const pT = tally(P, (x) => !x.el.closest('[data-ws-ink="trace"]')), kB = tally(K, (x) => w.getComputedStyle(x.el).color !== ORANGE);
                // (a hint the key leaves out, e.g. a model's traced count, is not a given in key ink)
                const kO = tally(K, (x) => w.getComputedStyle(x.el).color === ORANGE);
                for (const [t, n] of pT) if ((kB.get(t) || 0) < n && (kO.get(t) || 0) > 0) issues.push(`${where} given text "${t.slice(0, 24)}" in key ink`);
                for (const [t, n] of kB) if (n > (pT.get(t) || 0)) issues.push(`${where} answer text "${t.slice(0, 24)}" is black`);
                const paint = (x) => {
                    const cs = w.getComputedStyle(x.el);
                    const st = cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0 ? cs.stroke : '';
                    const fi = cs.fill !== 'none' && !/rgb\(255, 255, 255\)|rgba\(0, 0, 0, 0\)/.test(cs.fill) ? cs.fill : '';
                    return { st, fi, any: !!(st || fi), or: st === ORANGE || fi === ORANGE, full: (!st || st === ORANGE) && (!fi || fi === ORANGE) };
                };
                const KS = svgs(cell).map((x) => Object.assign(x, paint(x))).filter((x) => x.any);
                const PS = svgs(pcell).map((x) => Object.assign(x, paint(x))).filter((x) => x.any);
                // shapes paired by geometry: a given keeps its black stroke (only a part's new
                // shading may take the ink); a shape the key adds is key ink all over
                const byG = new Map();
                PS.forEach((y) => byG.set(y.s, (byG.get(y.s) || []).concat(y)));
                // a given pairs first (black marks claim their twins), so an added mark of the same
                // shape as a printed legend is not taken for that legend
                const twins = new Map();
                for (const x of KS) if (!x.or) { const l = byG.get(x.s) || []; const i = l.findIndex((y) => !y.or); if (i >= 0) twins.set(x, l.splice(i, 1)[0]); }
                for (const x of KS) if (!twins.has(x)) { const l = byG.get(x.s) || []; if (l.length) twins.set(x, l.shift()); }
                for (const x of KS) {
                    const twin = twins.get(x);
                    if (twin) {
                        if (x.st === ORANGE || (x.fi === ORANGE && twin.fi === 'rgb(0, 0, 0)')) issues.push(`${where} given ${x.el.tagName} in key ink`);
                    } else if (!x.full) issues.push(`${where} drawn answer ${x.el.tagName} not fully key ink (stroke ${x.st || '-'} fill ${x.fi || '-'})`);
                }
                // critic r3 (R3-1 / R3-2): a printed line, box or border is given - an element matched to
                // its pupil twin never takes the key ink on its border or outline unless the key rings it
                // (`data-ws-key-mark`); and a ring the key draws where the pupil twin draws none (or a
                // transparent one) is the answer, in key ink
                const els = (c) => [...c.querySelectorAll('*')].filter((e) => !(e instanceof w.SVGElement) && vis(e));
                const esig = (e) => [e.tagName, e.getAttribute('class') || '', e.getAttribute('data-ws-slot') || '', e.getAttribute('data-ws-shape') || ''].join('|');
                const edges = (cs) => {
                    const o = [];
                    for (const s of ['Top', 'Right', 'Bottom', 'Left']) if (cs['border' + s + 'Style'] !== 'none' && parseFloat(cs['border' + s + 'Width']) > 0 && cs['border' + s + 'Color'] !== 'rgba(0, 0, 0, 0)') o.push(cs['border' + s + 'Color']);
                    if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 && cs.outlineColor !== 'rgba(0, 0, 0, 0)') o.push(cs.outlineColor);
                    return o;
                };
                const KE = els(cell).filter((e) => !e.matches('[data-ws-key-text]')), PE = els(pcell);
                const me = lcsMap(PE.map(esig), KE.map(esig));
                KE.forEach((e, j) => {
                    const kb = edges(w.getComputedStyle(e));
                    if (!kb.length) return;
                    const nm = `${e.tagName.toLowerCase()}.${String(e.getAttribute('class') || '').split(' ')[0]}`;
                    if (me.has(j)) {
                        const pb = edges(w.getComputedStyle(PE[me.get(j)]));
                        if (kb.includes(ORANGE) && !e.hasAttribute('data-ws-key-mark') && pb.length) issues.push(`${where} given border of ${nm} in key ink`);
                        if (!pb.length && !kb.includes(ORANGE) && !e.closest('.mq-pupil')) issues.push(`${where} ring the key adds on ${nm} "${e.textContent.trim().slice(0, 16)}" is black`);
                    }
                });
                // R3-3: text never takes a stroke from the key ink (inherited from an added group)
                [...cell.querySelectorAll('svg text, svg tspan')].forEach((t) => {
                    const cs = w.getComputedStyle(t);
                    if (cs.stroke === ORANGE && parseFloat(cs.strokeWidth) > 0 && t.textContent.trim()) issues.push(`${where} svg text "${t.textContent.trim().slice(0, 8)}" stroked in key ink`);
                });
                const m = lcs(P.map((x) => x.s), K.map((x) => x.s));
                const added = K.filter((x, j) => !m.has(j)).map((x) => x.s).filter((t) => /\d/.test(t) && !/^[a-z]\.$/.test(t));
                const row = srows[ki];
                const it = row && row.items.find((i) => i.cell === ci + 1);
                if (added.length && srows.length && !it) issues.push(`${where} the copy key fills ${added.slice(0, 3).join('/')} but the short key lists nothing`);
            });
        });
        out.push({ skillId, issues: issues.slice(0, 6) });
    }
    f.remove();
    return out;
}

async function printDoc(page, html, pdf) {
    const sheet = await page.browser().newPage();
    try {
        await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });
        await sheet.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
        await sheet.evaluate(() => document.fonts && document.fonts.ready);
        await sheet.pdf({ path: pdf, printBackground: false, preferCSSPageSize: true });
    } finally { await sheet.close(); }
}
const RASTER = `
import sys, pymupdf
d = pymupdf.open(sys.argv[1])
for i, p in enumerate(d): p.get_pixmap(dpi=60).save('%s-p%d.png' % (sys.argv[2], i + 1))
print(len(d))
`;

(async () => {
    const app = await open({ seed: 1 });
    const { page, problems } = app;
    try {
        // ---- 5. the token
        check(1.05 / (lum('#c2410c') + 0.05) >= 4.5, 'key ink #c2410c is under 4.5:1 on white');

        // the in-page probe: build a sheet, return what the checks need
        const probe = (req) => page.evaluate(async (req) => {
            const r = await window.buildSheet(req);
            const cellsOf = (h) => (h.match(/data-ws-cell="/g) || []).length;
            const pageList = (html) => {
                const d = document.createElement('div'); d.innerHTML = html;
                return [...d.querySelectorAll('section.ws-page')].map((s) => ({
                    key: s.getAttribute('data-ws-mode') === 'key', short: s.getAttribute('data-ws-key-style') === 'short',
                    foot: ((s.querySelector('.ws-foot b') || {}).textContent || '').trim(),
                    cells: [...s.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]')).length,
                    labelled: [...s.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]') && c.querySelector('[data-ws-label="letter"],[data-ws-label="tab"]')).length,
                    shortItems: [...s.querySelectorAll('[data-ws-short-page]')].map((e) => `${e.getAttribute('data-ws-short-page')}:${e.getAttribute('data-ws-short-cell')}`),
                    orange: /c2410c/i.test(s.outerHTML),
                }));
            };
            return {
                pupilHtml: r.pupilHtml, keyHtml: r.keyHtml, pageCount: r.pageCount, keyPageCount: r.keyPageCount,
                doc: pageList(r.docHtml), pupilCells: cellsOf(r.pupilHtml), keyOptions: r.keyOptions,
                rows: r.shortRows || null, html: r.docHtml,
                sheet: window.sheetDocument(r.docHtml, 'Key options', { paper: req.paper || 'A4' }),
            };
        }, req);

        const sets = [
            ...SINGLE.map((s) => ({ name: s.skillId, skills: [s], pages: 3 })),
            { name: 'mixed', skills: MIXED, pages: 3 },
        ];
        for (const size of ['S', 'L']) for (const set of sets) {
            const base = { role: 'independent', sections: [{ skills: set.skills, pages: set.pages }], size, look: 'ican', paper: 'A4', seed: 4242 };
            // ---- 1. backward compatibility
            const today = await probe(Object.assign({}, base, { key: true }));
            for (const k of [undefined, {}, { on: true }, { on: true, placement: 'end', style: 'copy' }]) {
                const r = await probe(Object.assign({}, base, k === undefined ? {} : { key: k }));
                check(r.pupilHtml === today.pupilHtml && r.keyHtml === today.keyHtml, `${set.name} ${size}: key ${JSON.stringify(k)} differs from key:true`);
            }
            const off = await probe(Object.assign({}, base, { key: false }));
            check(!off.keyHtml && off.doc.every((p) => !p.key), `${set.name} ${size}: key:false still prints a key`);
            const off2 = await probe(Object.assign({}, base, { key: { on: false, style: 'short' } }));
            check(!off2.keyHtml && off2.doc.every((p) => !p.key), `${set.name} ${size}: key {on:false} still prints a key`);
            const N = today.pageCount;
            check(N >= 2, `${set.name} ${size}: expected a multi-page sheet, got ${N}`);
            // today's order: all pupil pages then all keys
            check(today.doc.map((p) => (p.key ? 'K' : 'P')).join('') === 'P'.repeat(N) + 'K'.repeat(N), `${set.name} ${size}: default order is not P..K..`);

            for (const [placement, style] of COMBOS) {
                const tag = `${set.name} ${size} ${placement}/${style}`;
                const r = await probe(Object.assign({}, base, { key: { on: true, placement, style } }));
                const seq = r.doc.map((p) => (p.key ? 'K' : 'P')).join('');
                const pupil = r.doc.filter((p) => !p.key);
                const keys = r.doc.filter((p) => p.key);
                check(pupil.length === N && pupil.every((p, i) => p.foot === `${i + 1}/${N}`), `${tag}: pupil footers ${pupil.map((p) => p.foot)}`);
                check(r.pupilHtml === today.pupilHtml, `${tag}: the pupil pages changed`);
                check(!pupil.some((p) => p.orange), `${tag}: a pupil page carries the key ink`);
                if (style === 'copy') {
                    check(keys.length === N && keys.every((k) => !k.short), `${tag}: ${keys.length} facsimile key pages for ${N}`);
                    if (placement === 'end') {
                        check(seq === 'P'.repeat(N) + 'K'.repeat(N), `${tag}: order ${seq}`);
                        check(r.keyHtml === today.keyHtml, `${tag}: the key is not today's key`);
                    } else {
                        check(seq === 'PK'.repeat(N), `${tag}: order ${seq} (want P1 K1 P2 K2 ...)`);
                        // each key is the page before it, filled in
                        r.doc.forEach((p, i) => { if (p.key) check(p.cells === r.doc[i - 1].cells, `${tag}: key page ${i} is not its pupil page (cells ${p.cells} vs ${r.doc[i - 1].cells})`); });
                        check(keys.every((k, i) => k.foot === `Key ${i + 1}/${N}`), `${tag}: key footers ${keys.map((k) => k.foot)}`);
                    }
                } else {
                    check(keys.every((k) => k.short && k.cells === 0), `${tag}: a short key page carries cells`);
                    if (placement === 'end') {
                        check(seq.startsWith('P'.repeat(N)) && !seq.slice(N).includes('P'), `${tag}: order ${seq}`);
                        check(keys.length < today.keyPageCount || today.keyPageCount === 1, `${tag}: the short key (${keys.length} pages) is not shorter than the copy (${today.keyPageCount})`);
                    } else {
                        // P then its own short key(s), page by page
                        check(/^(PK+)+$/.test(seq) && (seq.match(/P/g) || []).length === N, `${tag}: order ${seq}`);
                        check(keys.every((k) => /^Key \d+\/\d+/.test(k.foot)), `${tag}: short key footers ${keys.map((k) => k.foot)}`);
                        let pi = 0;
                        r.doc.forEach((p) => { if (!p.key) pi++; else check(p.shortItems.every((s) => s.startsWith(`${pi}:`)), `${tag}: a short key after page ${pi} lists other pages`); });
                    }
                    // 4. coverage: every labelled pupil cell once
                    const items = keys.flatMap((k) => k.shortItems);
                    check(new Set(items).size === items.length, `${tag}: an item is listed twice`);
                    pupil.forEach((p, i) => {
                        const mine = items.filter((s) => s.startsWith(`${i + 1}:`)).length;
                        check(mine === p.labelled, `${tag}: page ${i + 1} has ${p.labelled} labelled items, the short key lists ${mine}`);
                    });
                }
                if (SHOTS) {
                    fs.mkdirSync(OUT, { recursive: true });
                    const stem = path.join(OUT, `${set.name}-${size}-${placement}-${style}`);
                    await printDoc(page, r.sheet, stem + '.pdf');
                    execFileSync('python3', ['-c', RASTER, stem + '.pdf', stem]);
                }
                log(`  ${tag}: ${seq}`);
            }
        }
        // ---- 5. the key ink paints key answers on screen (computed style)
        const ink = await page.evaluate(async () => {
            const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'addition', skillId: 'add_facts' }], pages: 1 }], size: 'L', paper: 'A4', seed: 7, key: { on: true, style: 'copy' } });
            const f = document.createElement('iframe'); f.style.cssText = 'position:absolute;left:-3000px;width:900px;height:1200px'; document.body.appendChild(f);
            f.srcdoc = window.sheetDocument(r.docHtml, 'ink'); await new Promise((ok) => { f.onload = ok; });
            await f.contentDocument.fonts.ready;
            const d = f.contentDocument;
            const col = (el) => el && f.contentWindow.getComputedStyle(el).color;
            const out = {
                keyAns: col(d.querySelector('[data-ws-mode="key"] [data-ws-key-ans]:not([data-ws-key-mark]):not([data-ws-key-fill])')),
                pupilText: col(d.querySelector('[data-ws-mode="print"] [data-ws-cell]')),
                keyQuestion: col(d.querySelector('[data-ws-mode="key"] [data-ws-cell]')),
            };
            f.remove();
            return out;
        });
        check(ink.keyAns === 'rgb(194, 65, 12)', `key answer colour ${ink.keyAns}`);
        check(ink.pupilText === 'rgb(0, 0, 0)' && ink.keyQuestion === 'rgb(0, 0, 0)', `question ink ${ink.pupilText} / ${ink.keyQuestion}`);

        // ---- 7. every page type x a spread of families (critic r1, B1-B4)
        //   copy key: the key ink sits on tagged answers only - never on a given claim (True or
        //             False's statement), the made-up pupil's work (Error Analysis) or a pupil page;
        //   short key: every entry lists what the copy key fills in - each graded value it writes,
        //             and the choice (True / False, Correct / Fix it, There are more) as a word;
        //             group headings are the pupil page's own name and never repeat.
        const ROLES = ['lesson', 'scripted-model', 'guided', 'independent', 'more-practice', 'mixed-practice', 'review', 'test', 'error-analysis', 'reason-it', 'stretch', 'true-false', 'opener', 'word-problems', 'fact-rows', 'pre-skill-check'];
        const FAMILIES = [['addition', 'add_facts'], ['addition', 'add_20_regroup'], ['subtraction', 'sub_100_regroup'], ['multiplication', 'mult_facts'], ['fractions', 'shade_fraction'], ['fractions', 'write_fraction'], ['measurement', 'time_half_hour'], ['placevalue', 'more_less_10'], ['placevalue', 'place_value_disks']];
        const sweep = await page.evaluate(async ({ ROLES, FAMILIES }) => {
            const out = [];
            const f = document.createElement('iframe'); f.style.cssText = 'position:absolute;left:-3000px;width:900px;height:1200px'; document.body.appendChild(f);
            for (const role of ROLES) for (const [categoryId, skillId] of FAMILIES) {
                const base = { role, sections: [{ skills: [{ categoryId, skillId }] }], letters: role === 'more-practice' ? ['A', 'B'] : undefined, size: 'L', paper: 'A4', seed: 4242 };
                let copy, short;
                try {
                    copy = await window.buildSheet(Object.assign({}, base, { key: { on: true, placement: 'end', style: 'copy' } }));
                    short = await window.buildSheet(Object.assign({}, base, { key: { on: true, placement: 'end', style: 'short' } }));
                } catch (e) { out.push({ role, skillId, skip: String(e && e.message || e).slice(0, 80) }); continue; }
                f.srcdoc = window.sheetDocument(copy.docHtml, 'sweep'); await new Promise((ok) => { f.onload = ok; });
                const d = f.contentDocument, w = f.contentWindow;
                const bad = [];
                const orange = (el) => w.getComputedStyle(el).color === 'rgb(194, 65, 12)';
                for (const el of d.querySelectorAll('[data-ws-mode="print"] *')) if (orange(el)) { bad.push(`pupil page text in key ink: "${el.textContent.trim().slice(0, 20)}"`); break; }
                for (const el of d.querySelectorAll('[data-ws-mode="key"] *')) {
                    if (!orange(el) || !el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
                    const ans = el.closest('[data-ws-key-ans]');
                    const given = el.closest('.mq-pupil') || (el.closest('.mq-judge-work') && !el.closest('[data-ws-slot^="x"], [data-ws-slot^="fix"]'))
                        || el.closest('.mq-abbox');
                    if (!ans || given) { bad.push(`key ink on a given: "${el.textContent.trim().slice(0, 24)}"`); if (bad.length > 3) break; }
                }
                const tagged = d.querySelectorAll('[data-ws-mode="key"] [data-ws-key-ans]').length;
                const rgEmpty = [...d.querySelectorAll('[data-ws-mode="key"] .rg[data-ws-seg]')].length - [...d.querySelectorAll('[data-ws-mode="key"] .rg[data-ws-seg] .mq-rgink')].length;
                const rows = short.shortRows || [];
                const heads = rows.map((r) => r.heading);
                const items = rows.flatMap((r) => r.items.map((it) => Object.assign({ page: r.page }, it)));
                out.push({ role, skillId, bad, tagged, heads, items, rgInk: d.querySelectorAll('[data-ws-mode="key"] .mq-rgink').length, rgEmpty, copyKeys: copy.keyPageCount, pages: copy.pageCount });
            }
            f.remove();
            return out;
        }, { ROLES, FAMILIES });
        const norm = (v) => String(v).replace(/[\s,]/g, '').replace(/−/g, '-');
        for (const r of sweep) {
            if (r.skip) { log(`  sweep ${r.role} ${r.skillId}: skipped (${r.skip})`); continue; }
            const tag = `sweep ${r.role} ${r.skillId}`;
            r.bad.forEach((b) => check(false, `${tag}: ${b}`));
            check(r.tagged > 0 || !r.items.length, `${tag}: the copy key tags no answer`);
            check(new Set(r.heads).size === r.heads.length, `${tag}: short-key headings repeat (${r.heads.join(' | ')})`);
            if (r.role === 'more-practice') check(r.heads.some((h) => /Practice A/.test(h)) && r.heads.some((h) => /Practice B/.test(h)), `${tag}: headings ${r.heads.join(' | ')} do not name the sheets`);
            for (const it of r.items) {
                const t = String(it.text || '');
                check(t && t !== '-' && !/answers shown/i.test(t), `${tag} p${it.page} ${it.label}: short entry "${t}"`);
                const filled = Object.values(it.slots || {}).filter((s) => s && s.graded !== false && s.value !== undefined && s.value !== null && String(s.value) !== '');
                const ticks = filled.filter((s) => /^[✓✔]$/.test(String(s.value)));
                if (ticks.length) check(/[A-Za-z]{2}/.test(t), `${tag} p${it.page} ${it.label}: "${t}" names no choice`);
                if (!/Answers vary/.test(t) && !/ shaded$/.test(t)) {
                    const miss = filled.filter((s) => !/^[✓✔]$/.test(String(s.value)) && !norm(t).includes(norm(s.value)));
                    check(!miss.length, `${tag} p${it.page} ${it.label}: "${t}" leaves out ${miss.map((s) => s.value).join(', ')}`);
                }
            }
            log(`  ${tag}: ${r.pages}p, ${r.tagged} answers tagged, carries ${r.rgInk} written / ${r.rgEmpty} empty, short "${r.items.slice(0, 3).map((i) => i.text).join(' | ')}" heads ${r.heads.slice(0, 3).join(' | ')}`);
        }

        // ---- 8. several sections (critic r1, B4): each short key is named for its section
        const multi = await page.evaluate(async () => {
            const one = (skillId, i) => window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'addition', skillId }], pages: 2 }], size: 'L', paper: 'A4', seed: 11 + i, keySection: `Section ${i + 1}`, key: { on: true, placement: 'end', style: 'short' } });
            const a = await one('add_facts', 0), b = await one('add_20_regroup', 1);
            const heads = [...a.shortRows, ...b.shortRows].map((r) => r.heading);
            const foot = (h) => [...h.matchAll(/<footer class="ws-foot"[^>]*><span>([^<]*)<\/span>/g)].map((m) => m[1]);
            return { heads, feet: [...foot(a.keyHtml), ...foot(b.keyHtml)] };
        });
        check(new Set(multi.heads).size === multi.heads.length && multi.heads.every((h) => /^Section [12]: /.test(h)), `two sections: short-key headings ${multi.heads.join(' | ')}`);
        check(multi.feet.length >= 2 && multi.feet.every((f) => /^Section [12]/.test(f)), `two sections: short-key footers ${multi.feet.join(' | ')}`);
        log(`  two sections: ${multi.heads.join(' | ')}`);
        // the teacher's last key choice is a print default (critic r1, D7), outside every code
        const ui = fs.readFileSync(path.join(ROOT, 'js', 'modules', 'teacher-ui.js'), 'utf8');
        check(/keyPlace: d\.keyPlace === 'after-page'/.test(ui) && /keyStyle: d\.keyStyle === 'short'/.test(ui), 'printDefaults does not carry the key placement and style');
        check(/keyPlace: d\.keyPlace, keyStyle: d\.keyStyle/.test(src0()) && /rememberKeyDefaults\(\)/.test(src0()), 'teacher-print does not remember the key choice');

        // ---- 9. "Start each key on a new sheet" (owner 2026-10-09): every key starts on an odd page
        //         (the front of a sheet) and every pupil page too; off by default and only after each page
        const ns = await page.evaluate(async () => {
            const out = {};
            for (const style of ['copy', 'short']) for (const newSheet of [false, true]) {
                const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'addition', skillId: 'add_facts' }], pages: 3 }], size: 'L', paper: 'A4', seed: 5, key: { on: true, placement: 'after-page', style, newSheet } });
                const d = document.createElement('div'); d.innerHTML = r.docHtml;
                out[`${style}-${newSheet}`] = [...d.querySelectorAll('section.ws-page')].map((x) => ({ blank: 'B', key: 'K', print: 'P' })[x.getAttribute('data-ws-mode')] || '?').join('');
            }
            const e = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'addition', skillId: 'add_facts' }], pages: 2 }], size: 'L', paper: 'A4', seed: 5, key: { on: true, placement: 'end', style: 'copy', newSheet: true } });
            out.end = e.keyOptions.newSheet;
            return out;
        });
        check(ns['copy-false'] === 'PKPKPK' && ns['short-false'] === 'PKPKPK', `new sheet off: ${ns['copy-false']} / ${ns['short-false']}`);
        for (const st of ['copy', 'short']) {
            const q = ns[`${st}-true`];
            check(/^(?:PB?K+B?)+$/.test(q) && q.length % 2 === 0 && [...q].every((c, i) => (c === 'P' || (c === 'K' && q[i - 1] !== 'K')) ? i % 2 === 0 : true), `new sheet ${st}: ${q} (every pupil page and key must start a sheet)`);
        }
        check(ns.end === false, 'the new-sheet option applies only to "After each page"');
        // owner 2026-10-09: the blank back carries ONE very small line in the footer band's centre cell
        const bb = await page.evaluate(async () => {
            const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'addition', skillId: 'add_facts' }], pages: 2 }], size: 'L', paper: 'A4', seed: 5, key: { on: true, placement: 'after-page', style: 'copy', newSheet: true } });
            const f = document.createElement('iframe'); f.style.cssText = 'position:absolute;left:-3000px;width:900px;height:1400px'; document.body.appendChild(f);
            f.srcdoc = window.sheetDocument(r.docHtml, 'bb'); await new Promise((ok) => { f.onload = ok; });
            await f.contentDocument.fonts.ready;
            const d = f.contentDocument, w = f.contentWindow;
            const out = [...d.querySelectorAll('section[data-ws-mode="blank"]')].map((s) => {
                const note = s.querySelector('footer.ws-foot > .ws-blank-note');
                const foot = s.querySelector('footer.ws-foot');
                const cs = note && w.getComputedStyle(note);
                const pr = d.querySelector('section[data-ws-mode="print"] footer.ws-foot');
                return {
                    text: s.textContent.replace(/\s+/g, ' ').trim(), centre: note && foot.children[1] === note,
                    weight: cs && cs.fontWeight, size: cs && cs.fontSize, color: cs && cs.color,
                    head: !!s.querySelector('header, .ws-tabbox, .ws-copy'),
                    level: foot && pr ? Math.abs((foot.getBoundingClientRect().bottom - s.getBoundingClientRect().top) - (pr.getBoundingClientRect().bottom - pr.closest('section').getBoundingClientRect().top)) : 99,
                };
            });
            f.remove();
            return out;
        });
        check(bb.length > 0 && bb.every((b) => b.text === 'This page is intentionally blank' && b.centre && b.weight === '400' && b.color === 'rgb(0, 0, 0)' && Math.abs(parseFloat(b.size) - 9.33) < 0.2 && !b.head && b.level < 1),
            `blank back line: ${JSON.stringify(bb[0])}`);
        log(`  new sheet: copy ${ns['copy-true']} short ${ns['short-true']}`);

        // ---- 10. per-cell alignment (critic r2, R2-1 / R2-2): on the copy key, every mark it ADDS in a
        //          cell that the pupil twin lacks (text, and SVG strokes / fills) is in the key ink, and
        //          every mark the pupil page also prints is not; the short key lists every cell the copy
        //          key fills, Guided Practice too (never an empty list where the copy key has answers).
        const ALIGN_ROLES = (process.env.KEY_ALIGN_ROLES || 'independent:all,opener:tpl,lesson:tpl').split(',').map((x) => x.split(':'));
        const pick = await page.evaluate(() => {
            const by = {};
            for (const [cat, list] of Object.entries(window.SKILLS)) for (const s of list) {
                if (!s || !s.v || /^mixed/.test(s.v) || s.retired || s.tombstone) continue;
                let t = 'none';
                try { const q = window.generateQuestionFor({ category: cat, skill: s.v, seed: 3 }); t = (q && q.cell && q.cell.template) || 'legacy'; } catch (e) { t = 'err'; }
                (by[t] = by[t] || []).push([cat, s.v]);
            }
            return by;
        });
        const ALL = Object.entries(pick).filter(([t]) => t !== 'err' && t !== 'none').flatMap(([, l]) => l);
        const TPL = Object.entries(pick).filter(([t]) => t !== 'err' && t !== 'none' && t !== 'legacy').map(([, l]) => l[0]);
        for (const [role, which] of ALIGN_ROLES) {
            const list = which === 'all' ? ALL : TPL;
            for (let ch = 0; ch < list.length; ch += 20) {
                const res = await page.evaluate(alignProbe, { role, FAM: list.slice(ch, ch + 20) });
                for (const x of res) {
                    if (x.skip) continue;
                    const tag = `align ${role} ${x.skillId}`;
                    x.issues.forEach((b) => check(false, `${tag}: ${b}`));
                }
                log(`  align ${role}: ${Math.min(ch + 20, list.length)}/${list.length}`);
            }
        }

        // ---- 6. the teacher print request and an old saved printout
        const old = await page.evaluate(async () => {
            const r = await window.buildSheet({ role: 'more-practice', letters: ['A', 'B'], sections: [{ skills: [{ categoryId: 'addition', skillId: 'add_facts' }] }], size: 'M', paper: 'A4', seed: 99, key: true });
            return { ok: r.keyPageCount === r.pageCount && r.docHtml === [r.pupilHtml, r.keyHtml].join('\n'), opts: r.keyOptions };
        });
        check(old.ok && old.opts.placement === 'end' && old.opts.style === 'copy', `old boolean request: ${JSON.stringify(old)}`);
        const src = fs.readFileSync(path.join(ROOT, 'js', 'modules', 'teacher-print.js'), 'utf8');
        check(/key: \{ on: !!pr\.key, placement: pr\.keyPlace \|\| 'end', style: pr\.keyStyle \|\| 'copy', newSheet: !!pr\.keyNewSheet \}/.test(src), 'teacher-print request does not carry the key options');
        check(/keyNewSheet: d\.keyNewSheet === true/.test(ui) && /keyNewSheet: !!pr\.keyNewSheet \}/.test(src), 'the new-sheet choice is not a saved print default (off by default)');
        check(!/keyPlace|keyStyle/.test(fs.readFileSync(path.join(ROOT, 'js', 'modules', 'skill-codes.js'), 'utf8')), 'skill codes now carry key settings (old codes would move)');
        check(!problems.length, `console errors: ${problems.map((p) => p.text).slice(0, 3).join(' | ')}`);
    } finally { await app.close(); }
    if (fails.length) { log(fails.filter(Boolean).map((f) => '  FAIL ' + f).join('\n')); log('key-options: FAIL'); process.exit(1); }
    log('key-options: OK');
})().catch((e) => { console.error(e); console.log('key-options: FAIL'); process.exit(1); });
