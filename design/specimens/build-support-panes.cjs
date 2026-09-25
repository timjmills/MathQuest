// Builds the SUPPORT-PANE specimen (design/SUPPORTS.md §S4) for owner approval.
//
//   node design/specimens/build-support-panes.cjs
//
// Writes design/specimens/support-panes.html and one PNG per board to design/specimens/png/.
// Every pane is drawn attached to a real problem cell (the mock-up kit's fact / stack / equation)
// at L and at M, beside or under the problem as `placePane` decides (L prefers beside, M prefers
// under, so both placements are shown), then as screen twins in a 1280 px and a 390 px frame.
// The build fails when Andika is missing, a pane sticks out of its cell, or a frame scrolls
// sideways.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer');
const { startServer, chromePath } = require('../../tests/lib/ws-harness.cjs');

const DIR = __dirname;
const ROOT = path.resolve(DIR, '..', '..');
const imp = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);

(async () => {
    const kit = await imp('design/mockups/kit/kit.mjs');
    const P = await imp('js/modules/sheet/cells/panes/index.js');
    // The problems are the REAL kit's cells (the stack and fact templates the app prints), so the
    // operator keeps its own track exactly as on a worksheet; the equation is the kit's line.
    const SHEET = await imp('js/modules/sheet/index.js');
    const { PANES, placePane, attachPane, compat } = P;
    const { equation, TIMES, DIV } = kit;

    const DIGIT = { L: 28, M: 22 };
    // Problem widths (mm) for placement: measured off the kit at 28 / 22 pt.
    const PW = { fact: { L: 34, M: 27 }, stack: { L: 42, M: 34 }, eq: { L: 78, M: 62 }, round: { L: 70, M: 56 } };
    // An equation's width: digits 0.56 em, each sign 1 em plus its two 0.28 em gaps, the blank B(n).
    const eqW = (p, size) => {
        const em = DIGIT[size] * 25.4 / 72, digits = String(p.a).length + String(p.b).length;
        return Math.ceil(digits * 0.56 * em + 2 * 1.56 * em + kit.blankWidth(String(p.a).length + 1, size) + 2);
    };
    const glyph = { '+': '+', '-': '−', '*': TIMES, '/': DIV };

    function problem(kind, p, size, spec = null) {
        if (kind === 'fact') {
            const f = SHEET.fact(p.a, p.b, p.op, { pt: DIGIT[size] });
            return `<div class="spec-fact" style="${f.style}">${f.html}</div>`;
        }
        if (kind === 'stack') return SHEET.renderCell({ cell: { template: 'stack', payload: { op: p.op, a: p.a, b: p.b, heads: true } } }, { size, look: 'ican' });
        if (kind === 'round') {
            const nFmt = Number(p.n).toLocaleString('en-US');
            const eq = spec && spec.pane === 'round-mark'
                ? `<div class="ws-eq">${P.PANES['round-mark'].draw(p, { size, ...(spec.ctx || {}) }).replace('class="ws-pane"', 'class="ws-pane spec-inline"')}<span class="o">→</span>${kit.line(String(p.n).length + 1, size)}</div>`
                : equation([nFmt, '→', '_line'], size, String(p.n).length + 1);
            return `<div class="spec-round"><div style="font-size:var(--ws-text);font-weight:700;margin-bottom:1mm">Round to the nearest ${Number(p.place).toLocaleString('en-US')}.</div>${eq}</div>`;
        }
        return equation([p.a, p.op === '*' ? 'x' : p.op, p.b, '=', '_line'], size, String(p.a).length + 1);
    }

    const tag = (t) => `<span class="spec-tag">${t}</span>`;

    /** One cell: problem + pane, placed beside or under; spans both columns when it needs 180 mm. */
    function cellFor(spec, size) {
        const { pane, p, kind } = spec;
        const ctx = Object.assign({ size }, spec.ctx || {});
        const fp = PANES[pane].footprint(p, ctx);
        const pw = kind === 'eq' ? eqW(p, size) : PW[kind][size];
        const fits = (pl, w) => (pl === 'over-ones' ? true : pl === 'beside' ? pw + 4 + fp.wMm <= w : fp.wMm <= w);
        const pref = spec.place || (size === 'L' ? 'beside' : 'under');
        const other = pref === 'beside' ? 'under' : 'beside';
        const auto = placePane(fp, { problemWMm: pw, cellWMm: 87, problemHMm: 30 });
        let pl, wide = pw > 84 || !!spec.wide;
        const only = fp.placements.length === 1 ? fp.placements[0] : null;
        if (only === 'before' || only === 'over-ones') pl = only;
        else if (wide) pl = fp.placements.includes(pref) && fits(pref, 180) ? pref : other;
        else if (auto === 'over-ones') pl = 'over-ones';
        else if (fp.placements.includes(pref) && fits(pref, 87)) pl = pref;
        else if (fp.placements.includes(other) && fits(other, 87)) pl = other;
        else { wide = true; pl = fp.placements.includes(pref) && fits(pref, 180) ? pref : other; }
        // round-mark is drawn ON the problem's numeral (the problem() above), so it has no pane.
        const html = pane === 'round-mark' ? `<div class="ws-with-pane">${problem(kind, p, size, spec)}</div>` : attachPane(problem(kind, p, size), PANES[pane].draw(p, ctx), pl);
        const label = `${pane} · ${size} · ${pl}${spec.note ? ` · ${spec.note}` : ''} · ${fp.wMm}×${fp.hMm} mm`;
        return `<div class="ws-cell spec-cell${wide ? ' spec-wide' : ''}" data-ws-cell>${tag(label)}${html}</div>`;
    }

    function board(title, size, specs, note = '') {
        const cells = specs.map((s) => cellFor(s, s.size || size)).join('');
        return `<section class="ws-page ws-${size} ws-ican spec-board" data-board="${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}">`
            + `<header class="spec-head"><b>${title}</b><span>${note}</span></header>`
            + `<div class="spec-grid">${cells}</div></section>`;
    }

    // ---------------------------------------------------------------- the specs
    const K2 = [
        { pane: 'tenframe', kind: 'fact', p: { op: '+', a: 7, b: 5 } },
        { pane: 'tenframe', kind: 'fact', p: { op: '-', a: 13, b: 4 } },
        { pane: 'dice', kind: 'fact', p: { op: '+', a: 4, b: 3 } },
        { pane: 'dice', kind: 'fact', p: { op: '+', a: 6, b: 8 } },
        { pane: 'fingers', kind: 'fact', p: { op: '+', a: 3, b: 2 } },
        { pane: 'fingers', kind: 'fact', p: { op: '+', a: 1, b: 4 } },
        { pane: 'fingers', kind: 'eq', p: { op: '-', a: 8, b: 3 } },
        { pane: 'fingers', kind: 'eq', p: { op: '-', a: 10, b: 4 } },
        { pane: 'rekenrek', kind: 'fact', p: { op: '+', a: 8, b: 6 } },
        { pane: 'rekenrek', kind: 'fact', p: { op: '-', a: 12, b: 5 } },
        { pane: 'rekenrek', kind: 'fact', p: { op: '-', a: 9, b: 3 } },
        { pane: 'objects', kind: 'fact', p: { op: '+', a: 4, b: 3, object: 'car' } },
        { pane: 'objects', kind: 'fact', p: { op: '-', a: 9, b: 4, object: 'turtle' } },
        { pane: 'objects', kind: 'eq', p: { op: '+', a: 5, b: 2, object: 'flower' } },
        { pane: 'objects', kind: 'eq', p: { op: '*', a: 3, b: 4, object: 'block' } },
    ];
    const PLACE = [
        { pane: 'base10', kind: 'stack', p: { op: '+', a: 47, b: 25 } },
        { pane: 'base10', kind: 'stack', p: { op: '-', a: 52, b: 17 } },
        { pane: 'base10-quick', kind: 'stack', p: { op: '+', a: 368, b: 257 } },
        { pane: 'disks', kind: 'stack', p: { op: '+', a: 146, b: 238 } },
        { pane: 'pvgrid', kind: 'eq', p: { op: '+', a: 3254, b: 1618 } },
        { pane: 'pvgrid', kind: 'eq', p: { op: '+', a: 3254, b: 1618 }, ctx: { key: true }, note: 'KEY' },
        { pane: 'hundreds', kind: 'eq', p: { op: '+', a: 37, b: 20 }, note: 'top-down' },
        { pane: 'hundreds', kind: 'eq', p: { op: '+', a: 37, b: 20, bottomUp: true }, note: 'bottom-up' },
        { pane: 'round-line', kind: 'round', p: { kind: 'round', n: 47, place: 10 } },
        { pane: 'round-line', kind: 'round', p: { kind: 'round', n: 350, place: 100 } },
        { pane: 'round-chart', kind: 'round', p: { kind: 'round', n: 64, place: 10 } },
    ];
    const ROUND = [
        { pane: 'round-pv', kind: 'round', p: { kind: 'round', n: 4672, place: 100, level: 4 }, note: 'level 4: ring, look here, rule, zeros' },
        { pane: 'round-pv', kind: 'round', p: { kind: 'round', n: 4672, place: 100, level: 4 }, ctx: { key: true }, note: 'KEY' },
        { pane: 'round-pv', kind: 'round', p: { kind: 'round', n: 38415, place: 10, level: 3 }, wide: true, note: 'level 3: ring, look here, rule' },
        { pane: 'round-pv', kind: 'round', p: { kind: 'round', n: 1250, place: 100, level: 2 }, note: 'level 2: ring, look here · halfway' },
        { pane: 'round-pv', kind: 'round', p: { kind: 'round', n: 1250, place: 100, level: 2 }, ctx: { key: true }, note: 'KEY · halfway rounds up' },
        { pane: 'round-pv', kind: 'round', p: { kind: 'round', n: 38415, place: 10, level: 1 }, wide: true, note: 'level 1: ring only' },
        { pane: 'round-pv', kind: 'round', p: { kind: 'round', n: 4672, place: 100, level: 3 }, ctx: { ink: 'grey' }, note: 'grey (Guided)' },
        { pane: 'round-mark', kind: 'round', p: { kind: 'round', n: 4672, place: 100 }, note: 'marks on the numeral' },
        { pane: 'round-mark', kind: 'round', p: { kind: 'round', n: 38415, place: 10 }, note: 'marks on the numeral' },
        { pane: 'round-mark', kind: 'round', p: { kind: 'round', n: 1250, place: 100 }, note: 'marks on the numeral' },
    ];
    const MODELS = [
        { pane: 'gridpaper', kind: 'eq', p: { op: '+', a: 47, b: 25 } },
        { pane: 'gridpaper', kind: 'eq', p: { op: '-', a: 403, b: 167 } },
        { pane: 'numberline', kind: 'fact', p: { op: '+', a: 7, b: 5 } },
        { pane: 'numberline', kind: 'eq', p: { op: '-', a: 62, b: 30 } },
        { pane: 'openline', kind: 'eq', p: { op: '+', a: 58, b: 26 } },
        { pane: 'openline', kind: 'eq', p: { op: '-', a: 83, b: 27 } },
        { pane: 'array', kind: 'fact', p: { op: '*', a: 3, b: 6 } },
        { pane: 'array', kind: 'eq', p: { op: '/', a: 24, b: 6 } },
        { pane: 'area', kind: 'fact', p: { op: '*', a: 4, b: 7 } },
        { pane: 'bar', kind: 'eq', p: { op: '+', a: 38, b: 25 }, note: 'part-whole' },
        { pane: 'bar', kind: 'eq', p: { op: '-', a: 45, b: 18, model: 'compare' }, note: 'compare' },
        { pane: 'bar', kind: 'eq', p: { op: '*', a: 4, b: 6 }, note: 'equal parts' },
        { pane: 'bar', kind: 'eq', p: { op: '/', a: 30, b: 5 }, note: 'share' },
    ];
    const EXTRAS = [
        { pane: 'boxsign', kind: 'fact', p: { op: '-', a: 15, b: 8 } },
        { pane: 'boxsign', kind: 'eq', p: { op: '*', a: 7, b: 8 } },
        { pane: 'startarrow', kind: 'stack', p: { op: '+', a: 47, b: 25 } },
        { pane: 'startarrow', kind: 'stack', p: { op: '-', a: 72, b: 38 } },
        { pane: 'steps', kind: 'stack', p: { op: '+', a: 47, b: 25 } },
        { pane: 'steps', kind: 'round', p: { kind: 'round', n: 47, place: 10 } },
        { pane: 'tenframe', kind: 'fact', p: { op: '+', a: 7, b: 5 }, ctx: { ink: 'grey' }, note: 'grey: ignored, pictures fade by removal' },
        { pane: 'hundreds', kind: 'eq', p: { op: '+', a: 37, b: 20 }, ctx: { ink: 'grey' }, note: 'grey (Guided)' },
        { pane: 'gridpaper', kind: 'eq', p: { op: '*', a: 36, b: 4 }, ctx: { ink: 'grey' }, note: 'grey (Guided)' },
    ];

    // Stacked supports: several compatible panes on ONE problem (compat() = ok).
    function stacked(size) {
        const p = { op: '+', a: 47, b: 25 };
        const ids = ['boxsign', 'gridpaper', 'steps'];
        const ok = ids.every((x, i) => ids.slice(i + 1).every((y) => compat(x, y) !== 'clash'));
        const eq = problem('eq', p, size);
        const inner = `<div style="display:flex;align-items:flex-start;justify-content:center;gap:4mm">${PANES.boxsign.draw(p, { size })}${eq}</div>`;
        const withGrid = attachPane(inner, `<div style="display:flex;gap:6mm;align-items:flex-start">${PANES.gridpaper.draw(p, { size })}${PANES.steps.draw(p, { size })}</div>`, 'under');
        return `<div class="ws-cell spec-cell spec-wide" data-ws-cell>${tag(`stacked: boxsign + gridpaper + steps · ${size} · compat ${ok ? 'ok' : 'CLASH'}`)}${withGrid}</div>`;
    }

    const boards = [
        board('PK–2 pictures', 'L', K2, 'Every pane shows the GIVEN numbers only; the sentence is printed over the picture.'),
        board('PK–2 pictures', 'M', K2),
        board('Grades 2–4 place value and charts', 'L', PLACE, 'To-scale blocks → quick sketch → disks (CRA). Charts: reference numbers only, nothing marked but the start.'),
        board('Grades 2–4 place value and charts', 'M', PLACE),
        board('Grades 3–4 rounding on the place-value chart', 'L', ROUND, 'Ring = the place you round to; underline = the digit you look at. Each mark is its own level and fades; the answer row is empty on the pupil page.'),
        board('Grades 3–4 rounding on the place-value chart', 'M', ROUND),
        board('Grades 2–4 grid paper, lines, arrays, bars', 'L', MODELS, 'The answer\'s tick is unlabelled; bar lengths are schematic; the unknown is a "?" box.'),
        board('Grades 2–4 grid paper, lines, arrays, bars', 'M', MODELS),
        board('Extras, grey (Guided) and stacking', 'L', EXTRAS, 'Boxed sign, start-here arrow over the ones, step checklist.').replace('</div></section>', `${stacked('L')}</div></section>`),
        board('Extras, grey (Guided) and stacking', 'M', EXTRAS).replace('</div></section>', `${stacked('M')}</div></section>`),
    ];

    // ---------------------------------------------------------------- screen twins
    const ALLSPECS = [...K2, ...PLACE, ...ROUND.filter((s) => !s.ctx && s.pane !== 'round-mark'), ...MODELS, ...EXTRAS.filter((s) => !s.ctx)];
    const seen = new Set();
    const screenSpecs = ALLSPECS.filter((s) => { const k = s.pane + (s.note || ''); if (seen.has(k)) return false; seen.add(k); return true; });
    function screenCard(s, digitPx) {
        const p = s.p;
        const q = p.kind === 'round' ? `Round ${Number(p.n).toLocaleString('en-US')} to the nearest ${Number(p.place).toLocaleString('en-US')}.` : `${p.a} ${glyph[p.op]} ${p.b} =`;
        const prob = `<div class="scr-q" style="font-size:${p.kind === 'round' ? Math.round(digitPx * 0.55) : digitPx}px">${q} <span class="scr-in"></span></div>`;
        const pane = PANES[s.pane].draw(p, { size: 'L', twin: true, ...(s.ctx || {}) });
        const pl = PANES[s.pane].placements.includes('before') ? 'before' : 'under';
        return `<div class="scr-card">${tag(`${s.pane}${s.note ? ` · ${s.note}` : ''}`)}${attachPane(prob, pane, pl, { twin: true })}</div>`;
    }
    // One board per chunk of cards, so each PNG stays readable.
    const screen = (w, k2, digitPx, per) => {
        const out = [];
        for (let i = 0; i < screenSpecs.length; i += per) {
            const part = screenSpecs.slice(i, i + per);
            out.push(`<section class="scr-frame" data-board="screen-${w}-${i / per + 1}" style="width:${w}px;--mq-k2:${k2}px">`
                + `<header class="spec-head"><b>Screen twins · ${w} px · ${i / per + 1}</b><span>--mq-k2 ${k2} px/mm (css/screen-cell.css) · card digits ${digitPx} px</span></header>`
                + `<div class="scr-grid" style="grid-template-columns:repeat(${w >= 1000 ? 3 : 1}, minmax(0,1fr))">${part.map((s) => screenCard(s, digitPx)).join('')}</div></section>`);
        }
        return out.join('');
    };
    const css = `
body { background:#d9d9d9; }
.spec-board { height:auto !important; overflow:visible !important; margin:8mm auto; }
.spec-head { display:flex; gap:4mm; align-items:baseline; margin:0 0 3mm; font:14px/1.3 system-ui, sans-serif; color:#222; }
.spec-head b { font-size:16px; } .spec-head span { color:#555; }
.spec-grid { display:grid; grid-template-columns:repeat(2, 93mm); grid-auto-flow:dense; border:1.5pt solid #000; background:#fff; }
.spec-grid > .spec-cell { box-shadow:0 0 0 0.375pt #000, inset 0 0 0 0.375pt #000; }
.spec-cell { padding:7mm 3mm 4mm; justify-content:flex-start; }
.spec-cell.spec-wide { grid-column:1 / -1; }
.spec-tag { position:absolute; left:1.5mm; top:1mm; font:9px/1.2 system-ui, sans-serif; color:#666; }
.spec-fact .ws-fact { font-size:var(--fd); }
.spec-inline { vertical-align:baseline !important; align-self:flex-end; margin-bottom:-1mm; }
.spec-round .ws-eq span:nth-child(2) { font-weight:700; }
.scr-frame { margin:10mm auto; background:#f1f3f6; padding:16px; box-sizing:border-box; font-family:Andika, sans-serif; overflow:hidden; }
.scr-grid { display:grid; gap:16px; }
.scr-card { position:relative; background:#fff; border-radius:16px; box-shadow:0 1px 3px rgba(0,0,0,.2); padding:26px 14px 18px; min-width:0; overflow:hidden; }
.scr-card .spec-tag { left:12px; top:8px; }
.scr-q { font-weight:700; color:#000; line-height:1.1; display:flex; align-items:center; gap:.3em; flex-wrap:wrap; justify-content:center; }
.scr-in { display:inline-block; width:2.4em; height:1.25em; border:2px solid #000; border-radius:6px; }
`;
    const html = kit.doc('Support panes specimen', [...boards, screen(1280, 5.4, 56, 15), screen(390, 3.8, 40, 8)], css)
        .replace('../kit/sheet-kit.css', '../../css/sheet-kit.css');
    const outHtml = path.join(DIR, 'support-panes.html');
    fs.writeFileSync(outHtml, html);

    // ---------------------------------------------------------------- render + check
    const PNG = path.join(DIR, 'png');
    fs.mkdirSync(PNG, { recursive: true });
    for (const f of fs.readdirSync(PNG)) if (f.startsWith('support-panes-')) fs.unlinkSync(path.join(PNG, f));
    const { server, base } = await startServer();
    const browser = await puppeteer.launch({ headless: true, executablePath: chromePath(), args: ['--no-sandbox', '--font-render-hinting=none'] });
    let failed = 0;
    try {
        const page = await browser.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });
        page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`));
        page.on('response', (r) => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push(`${r.status()} ${r.url()}`); });
        await page.setViewport({ width: 1400, height: 1200, deviceScaleFactor: 1.5 });
        await page.goto(`${base}/design/specimens/support-panes.html`, { waitUntil: 'networkidle0' });
        await page.evaluate(() => document.fonts.ready);
        const report = await page.evaluate(() => {
            const out = { font: document.fonts.check('700 28px Andika'), problems: [], panes: 0 };
            document.querySelectorAll('.spec-cell, .scr-card').forEach((c, k) => {
                const cr = c.getBoundingClientRect();
                c.querySelectorAll('.ws-pane, .ws-pane-problem').forEach((el) => {
                    out.panes += el.classList.contains('ws-pane') ? 1 : 0;
                    const r = el.getBoundingClientRect();
                    if (r.right > cr.right + 0.75 || r.left < cr.left - 0.75 || r.bottom > cr.bottom + 0.75) {
                        out.problems.push(`${c.querySelector('.spec-tag').textContent}: ${el.className} sticks out by ${Math.round(Math.max(r.right - cr.right, cr.left - r.left, r.bottom - cr.bottom))}px`);
                    }
                });
            });
            document.querySelectorAll('.scr-frame').forEach((f) => { if (f.scrollWidth > f.clientWidth + 1) out.problems.push(`${f.dataset.board}: scrolls sideways`); });
            return out;
        });
        if (!report.font) report.problems.unshift('Andika did not load');
        report.problems.push(...errors);
        const boardsEls = await page.$$('[data-board]');
        const counts = {};
        for (const el of boardsEls) {
            const name = await el.evaluate((e) => e.dataset.board + (e.classList.contains('ws-M') ? '-m' : e.classList.contains('ws-L') ? '-l' : ''));
            counts[name] = (counts[name] || 0) + 1;
            await el.screenshot({ path: path.join(PNG, `support-panes-${name}.png`) });
        }
        console.log(`support-panes: ${report.panes} panes drawn, ${boardsEls.length} boards -> design/specimens/png/`);
        if (report.problems.length) { failed = 1; console.log(report.problems.map((p) => `  PROBLEM ${p}`).join('\n')); }
    } finally {
        await browser.close();
        server.close();
    }
    console.log(`support-panes: ${failed ? 'FAIL' : 'OK'}`);
    process.exit(failed);
})().catch((e) => { console.error(e); process.exit(1); });
