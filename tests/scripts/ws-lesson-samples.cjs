// Render the SAMPLE LESSONS (design/LESSONS_VISION.md, js/modules/sheet/roles/lesson.js) through
// window.buildSheet({role: 'lesson', ...}) and rasterise every pupil page and every key page.
//
//   node tests/scripts/ws-lesson-samples.cjs                       # the three samples at L and S
//   node tests/scripts/ws-lesson-samples.cjs --sizes L --only add  # one lesson, one size
//   node tests/scripts/ws-lesson-samples.cjs --copy                # also copy the PNGs for the owner
//                                                                  # to design/lesson-samples/<skill>/
//
// Writes under tests/audit-runs/lessons/<skill>/<size>/: pupil-p1.png ..., key-p1.png ...,
// chart-grey.png (the anchor chart page in greyscale: the accent colour must survive a
// black-and-white copy), meta.json (the lesson's tags, prerequisites, steps, parts, and the
// overflow / font check of every page). Needs python3 with PyMuPDF. Not a gate: a render.
//
//   node tests/scripts/ws-lesson-samples.cjs --check [--seeds 8]   # GATE: the short-lesson checks (lane lf-checks,
//     2026-11-07, from the lessons-phase0 critic r1 findings; prints `ws-lesson-samples --check: OK` / `FAIL (n)`):
//     PC-RANGE   (D3, D7) every Prerequisite Check item's numbers inside its route step's range: "within N" / "to N" in
//                the step's title, else its block's ("Place value (within 10)"); "Count in Ns" = multiples of N
//     PC-NAME    (D5, D2, D12) the item dealt does what its route step's title names ("10 more, 10 less" = a 10 more /
//                10 less item), and the prerequisite's `checks` text (the "What it checks" column) is true of it
//     PC-SLOTS   (D1, D6) on the check page and its key: every writing slot filled on the key, the key no answer
//                outside a slot, the same writing slots on pupil and key
//     PC-SCAFFOLD (D8) no scaffold (trace, grey ink, regroup / exchange box, Say, Steps) and one response a check cell
//     PC-LR6     (LR-6, lf-engine PC 2026-11-12) no two cells of the check page print the same given numbers (drawn text)
//     PC-H13     (D4, D9, D11) at every size: the check page has no cell band >= 30 % and no gap > 15 mm between its
//                cells; the check page and the lesson sheet have a blank foot <= 8 % (sheetCheck, now blocking; the sheet's
//                cell bands stay print-lint's L-DENSITY H13 / H13-ROW)
//     PC-CLIP    every band heading at the same place on a pupil page and its key twin (+/- 1 mm), and no heading
//                clipped by an overflow-hiding ancestor. D10 itself (a fill painted over a heading) is NOT seen by the DOM:
//                ws-print-lint L-OVERLAP SECTION reads it on the PDF (precritic lesson-samples-key-L / -S; critic r2 D1)
//     PC-PAGES   (lf-engine PC, lead ruling A) the Prerequisite Check prints on ONE pupil page; --force-check renders a
//                check whose LR-17 switch is still off (buildSheet prereqsForce)
//   --rules PC-X,PC-Y counts only those rules (backtest rows); --only add,sub,round as for the render.
//   The content rules (RANGE, NAME) read --seeds builds per lesson (seed 4242 + 1000 + 37 k); the layout rules the
//   4242 build at every size. A tree with no Prerequisite Check (no lesson.prereqCheck) prints the rules N/A.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ROOT, open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes('--' + k);
const SIZES = (arg('sizes', 'L,S') || 'L,S').split(',').map((s) => s.trim()).filter(Boolean);
const ONLY = arg('only', '');
const OUT = path.resolve(ROOT, arg('out', 'tests/audit-runs/lessons'));
const DPI = parseInt(arg('dpi', '110'), 10);
const PRACTICE = parseInt(arg('pages', '1'), 10);
const CHECK = has('check');
// --force-check (lane lf-engine, 2026-11-12; additive): build every packet WITH its Prerequisite Check even while the
// lesson's LR-17 switch is off (`prereqsLive: false`): buildSheet's render-only `prereqsForce`. --seed n: the render seed.
const FORCE = has('force-check');
const RSEED = parseInt(arg('seed', '4242'), 10);
const NSEEDS = Math.max(1, parseInt(arg('seeds', '8'), 10));
const LP = require('../lib/ws-lesson-lp.cjs');
// the route step's title and its block's name, by step id (Y1.B1.S6 -> "Count on from any number", "Place value (within 10)")
const STEPS = (() => { const m = new Map(); try { const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/curriculum/wrm-steps.json'), 'utf8'));
    for (const y of d.years || []) for (const b of y.blocks || []) for (const st of b.steps || []) m.set(st.id, { title: st.title, block: b.name }); } catch (e) { /* none */ } return m; })();
const nums = (t) => [...String(t || '').replace(/(\d),(\d{3})/g, '$1$2').matchAll(/\d+/g)].map((x) => Number(x[0]));
/** PC-RANGE on one prerequisite item: [problem] or []. Pure. */
function rangeCheck(item, pre) {
    const st = STEPS.get(pre.lesson) || { title: pre.title || '', block: '' };
    const own = String(st.title).match(/\b(?:within|to) (\d[\d,]*)\b/i), blk = String(st.block).match(/\b(?:within|to) (\d[\d,]*)\b/i);
    const max = own ? Number(own[1].replace(/,/g, '')) : blk ? Number(blk[1].replace(/,/g, '')) : null;
    const step = String(st.title).match(/\b[Cc]ount in (\d+)s\b/);
    const ns = [...nums(item.text), ...nums(item.ans)];
    const out = [];
    if (max != null) { const over = ns.filter((n) => n > max); if (over.length) out.push(`numbers ${[...new Set(over)].join(', ')} outside "${own ? st.title : st.block}" (max ${max})`); }
    if (step) { const k = Number(step[1]); const off = ns.filter((n) => n % k); if (off.length) out.push(`numbers ${[...new Set(off)].join(', ')} are not multiples of ${k} ("${st.title}")`); }
    return out;
}
const WORDS = ['more', 'fewer', 'less', 'same', 'bigger', 'smaller', 'between', 'round', 'tens', 'ones', 'add', 'subtract'];
/** PC-NAME on one prerequisite item: [problem] or []. Pure. */
function nameCheck(item, pre) {
    const out = [];
    const st = STEPS.get(pre.lesson) || { title: pre.title || '' };
    const said = `${item.text} ${item.ans}`.toLowerCase();
    const want = [...String(st.title).matchAll(/\b(\d+) (more|less)\b/gi)].map((m) => `${m[1]} ${m[2].toLowerCase()}`);
    if (want.length && !want.some((w) => said.includes(w))) out.push(`"${item.text}" is not what "${st.title}" names (${want.join(' / ')})`);
    if (!('checks' in pre)) out.push(`no \`checks\` text: the table prints the design why ("${String(pre.why || '').slice(0, 50)}")`);
    else {
        const ch = String(pre.checks).toLowerCase();
        // the item must use at least ONE of the operation words its checks text names ("10 more, 10 less": either; critic r2 D4)
        const named = WORDS.filter((w) => new RegExp(`\\b${w}\\b`).test(ch));
        if (named.length && !named.some((w) => new RegExp(`\\b${w}\\b`).test(said))) out.push(`checks "${pre.checks}" names ${named.join(' / ')}; the item ("${item.text}") uses none of them`);
    }
    return out;
}

/** The three samples the owner asked for (2026-09-25), with the options that make each one. */
const LESSONS = [
    // Counting on is the strategy for adding 1, 2 or 3 (lessons r1: the sums spread over 1-10 and the
    // big number falls on either side, instead of eight make-10 facts in twelve).
    { id: 'add', dir: 'add-within-10', skill: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 10, constant: [1, 2, 3] } } },
    { id: 'sub', dir: 'subtract-2-digit-regroup', skill: { categoryId: 'subtraction', skillId: 'sub_100_regroup' } },
    { id: 'round', dir: 'round-nearest-10', skill: { categoryId: 'number_sense', skillId: 'nearest_10' } },
].filter((l) => !ONLY || ONLY.split(',').includes(l.id));

const RASTER_PY = `
import sys, json, pymupdf
src, outdir, dpi, prefix, grey = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4], sys.argv[5]
d = pymupdf.open(src)
pages = []
for i, p in enumerate(d):
    name = '%s-p%d.png' % (prefix, i + 1)
    p.get_pixmap(dpi=dpi).save(outdir + '/' + name)
    pages.append({'file': name, 'words': len(p.get_text().split())})
if grey != '-':
    d[int(grey)].get_pixmap(dpi=dpi, colorspace=pymupdf.csGRAY).save(outdir + '/chart-grey.png')
print(json.dumps(pages))
`;

function sheetCheck(page) {
    return page.evaluate(() => {
        const out = { pages: 0, problems: [], bands: [], stats: [], fonts: {} };
        document.querySelectorAll('.ws-page').forEach((pg, i) => {
            out.pages++;
            const stat = { page: i + 1, cells: 0, labelled: pg.querySelectorAll('[data-ws-label], .ws-letter').length, maxBand: 0, blank: 0 };
            out.stats.push(stat);
            const body = pg.querySelector('.ws-body');
            if (body && body.scrollHeight > body.clientHeight + 1) out.problems.push(`page ${i + 1}: the body overflows by ${((body.scrollHeight - body.clientHeight) * 25.4 / 96).toFixed(1)} mm`);
            pg.querySelectorAll('.ws-cell').forEach((c, k) => {
                if (c.scrollHeight > c.clientHeight + 1 || c.scrollWidth > c.clientWidth + 1) out.problems.push(`page ${i + 1} cell ${k + 1}: content overflows its cell (${((c.scrollHeight - c.clientHeight) * 25.4 / 96).toFixed(1)} mm)`);
                // H13 self-check (the critic's measure): the largest empty band inside the cell,
                // top/bottom and left/right, as a share of the cell (labels left out).
                const cr = c.getBoundingClientRect();
                let box = null;
                for (const d of c.querySelectorAll('*')) {
                    if (d.closest('[data-ws-label], .ws-letter')) continue;
                    const st = getComputedStyle(d);
                    if (st.visibility === 'hidden' || st.display === 'none') continue;
                    const r = d.getBoundingClientRect();
                    if (!r.width || !r.height) continue;
                    // An answer slot or zone is the pupil's writing space: it counts as content.
                    const leaf = !d.children.length || d instanceof SVGElement || /^(svg|img)$/i.test(d.tagName) || d.hasAttribute('data-ws-slot');
                    const bordered = parseFloat(st.borderTopWidth) || parseFloat(st.borderBottomWidth);
                    if (!leaf && !bordered && !(d.textContent || '').trim()) continue;
                    if (!leaf && !bordered) continue;
                    box = box ? { t: Math.min(box.t, r.top), b: Math.max(box.b, r.bottom), l: Math.min(box.l, r.left), r: Math.max(box.r, r.right) } : { t: r.top, b: r.bottom, l: r.left, r: r.right };
                }
                if (!box || cr.height < 40 || cr.width < 40) return;
                const v = Math.max(box.t - cr.top, cr.bottom - box.b, 0) / cr.height;
                const h = Math.max(box.l - cr.left, cr.right - box.r, 0) / cr.width;
                stat.cells++;
                stat.maxBand = Math.max(stat.maxBand, Math.round(Math.max(v, h) * 100));
                if (v >= 0.3 || h >= 0.3) out.bands.push(`page ${i + 1} cell ${k + 1}: empty band ${Math.round(Math.max(v, h) * 100)}% ${v >= h ? 'tall' : 'wide'} (${(cr.width * 25.4 / 96).toFixed(0)} x ${(cr.height * 25.4 / 96).toFixed(0)} mm)`);
            });
            // The page's own blank: the body below its last band.
            if (body) {
                const br = body.getBoundingClientRect();
                const kids = [...body.children].filter((x) => x.getBoundingClientRect().height > 0);
                const last = kids.length ? Math.max(...kids.map((x) => x.getBoundingClientRect().bottom)) : br.top;
                const blank = (br.bottom - last) / br.height;
                stat.blank = Math.round(Math.max(0, blank) * 100);
                if (blank > 0.08) out.bands.push(`page ${i + 1}: ${Math.round(blank * 100)}% of the body blank at the bottom`);
            }
            for (const el of pg.querySelectorAll('*')) {
                if (![...el.childNodes].some((t) => t.nodeType === 3 && t.textContent.trim())) continue;
                const f = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim();
                out.fonts[f] = (out.fonts[f] || 0) + 1;
            }
        });
        return out;
    });
}

async function printDoc(page, html, pdfPath) {
    const sheet = await page.browser().newPage();
    try {
        await sheet.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
        await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });
        await sheet.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
        await sheet.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
        await sheet.evaluate(() => document.fonts && document.fonts.ready);
        const check = await sheetCheck(sheet);
        await sheet.pdf({ path: pdfPath, printBackground: false, preferCSSPageSize: true });
        return check;
    } finally { await sheet.close(); }
}

/** In the page: per page (pupil or key doc), the strip headings, their rects, whether a later-painted element covers them,
 *  and the gaps between the cells of the body. */
function stripMeasure() {
    const MM = 96 / 25.4;
    return [...document.querySelectorAll('body > section.ws-page, body > .ws-page')].map((pg) => {
        const pr = pg.getBoundingClientRect();
        const all = [...pg.querySelectorAll('*')];
        const strips = [...pg.querySelectorAll('.ws-strip > b')].map((b) => {
            const r = b.getBoundingClientRect(); const idx = all.indexOf(b);
            const band = b.closest('.ws-band');
            const cover = all.slice(idx + 1).find((e) => { if (e.closest('.ws-strip') === b.closest('.ws-strip') || (band && band.contains(e) && e.closest('.ws-strip'))) return false;
                const cs = getComputedStyle(e); const q = e.getBoundingClientRect();
                if (!q.width || !q.height || cs.visibility === 'hidden') return false;
                const paints = (cs.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor)) || parseFloat(cs.borderTopWidth) > 0 || (e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
                if (!paints) return false;
                const ix = Math.min(r.right, q.right) - Math.max(r.left, q.left), iy = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
                return ix > 2 && iy > r.height * 0.3; });
            // clipped: the heading runs past an ancestor that hides its overflow (the band above squeezes it)
            let clip = null;
            for (let a = b.parentElement; a && a !== pg; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflow === 'visible' && cs.overflowY === 'visible') continue;
                const q = a.getBoundingClientRect(); if (r.bottom > q.bottom + 0.5 || r.top < q.top - 0.5) { clip = `${(a.className || a.tagName).toString().slice(0, 30)} (${Math.round(Math.max(r.bottom - q.bottom, q.top - r.top) / MM * 10) / 10} mm)`; break; } }
            return { clip, text: b.textContent.trim().slice(0, 40), top: Math.round((r.top - pr.top) / MM * 10) / 10, covered: cover ? (cover.className || cover.tagName).toString().slice(0, 40) : null };
        });
        const body = pg.querySelector('.ws-body'); const cells = body ? [...body.querySelectorAll('.ws-cell')].filter((c) => !c.parentElement.closest('.ws-cell')).map((c) => c.getBoundingClientRect()).sort((a, b) => a.top - b.top) : [];
        let gap = 0; for (let i = 1; i < cells.length; i++) { const g = (cells[i].top - Math.max(...cells.slice(0, i).map((c) => c.bottom))) / MM; if (g > gap) gap = g; }
        return { strips, maxGap: Math.round(gap * 10) / 10 };
    });
}

async function checkMain() {
    const app = await open({ seed: 1 });
    const { page } = app;
    const findings = []; let na = 0; let read = 0;
    const F = (rule, where, msg) => findings.push({ rule, where, msg });
    try {
        for (const l of LESSONS) {
            // content: several seeds (no layout)
            const seeds = Array.from({ length: NSEEDS }, (_, i) => (i === 0 ? 4242 : 1000 + i * 37));
            for (const seed of seeds) {
                const b = await page.evaluate(async ({ skill, seed, FORCE }) => { try { const r = await window.buildSheet({ role: 'lesson', sections: [{ skills: [skill] }], size: 'L', paper: 'A4', seed, key: true, practicePages: 1, mixed: true, prereqsForce: FORCE });
                    return { pre: (r.lesson && r.lesson.prereqCheck) || null, items: r.items.filter((it) => it.part === 'prereq').map((it) => ({ pool: it.pool, text: String(it.text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), ans: typeof it.ans === 'object' ? JSON.stringify(it.ans) : String(it.ans) })) }; } catch (e) { return { error: String((e && e.message) || e) }; } }, { skill: l.skill, seed, FORCE });
                if (b.error) { F('PC-BUILD', `${l.id} seed ${seed}`, b.error.slice(0, 160)); continue; }
                if (!b.pre) { na++; break; }
                for (const it of b.items) {
                    const k = Number(String(it.pool).replace(/\D/g, '')); const pre = b.pre[k]; if (!pre) continue; read++;
                    for (const m of rangeCheck(it, pre)) F('PC-RANGE', `${l.id} seed ${seed} Q${k + 1} (${pre.lesson})`, m);
                    for (const m of nameCheck(it, pre)) F('PC-NAME', `${l.id} seed ${seed} Q${k + 1} (${pre.lesson})`, m);
                }
            }
            // layout: seed 4242 at every size
            for (const size of SIZES) {
                const built = await page.evaluate(async ({ skill, size, FORCE }) => { try { const r = await window.buildSheet({ role: 'lesson', sections: [{ skills: [skill] }], size, paper: 'A4', seed: 4242, key: true, practicePages: 1, mixed: true, prereqsForce: FORCE });
                    return { pupil: window.sheetDocument(r.pupilHtml, r.title, { paper: 'A4' }), key: window.sheetDocument(r.keyHtml, r.title, { paper: 'A4' }), parts: (r.lesson && r.lesson.parts) || [], pre: !!(r.lesson && r.lesson.prereqCheck) }; } catch (e) { return { error: String((e && e.message) || e) }; } }, { skill: l.skill, size, FORCE });
                if (built.error) { F('PC-BUILD', `${l.id} ${size}`, built.error.slice(0, 160)); continue; }
                const read2 = async (html) => { const sh = await page.browser().newPage(); try { await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 }); await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
                    await sh.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 }); await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                    await sh.emulateMediaType('print');
                    return { lp: await sh.evaluate(LP.lpMeasure, { layout: true }), sc: await sheetCheck(sh), st: await sh.evaluate(stripMeasure) }; } finally { await sh.close(); } };
                const P = await read2(built.pupil), K = await read2(built.key);
                // PC-PAGES (lf-engine PC 2026-11-12, lead ruling A): the Prerequisite Check is ONE pupil page (PAGE_TYPES 2.10)
                for (const pt of built.parts) if (pt.part === 'prereq' && pt.pages !== 1) F('PC-PAGES', `${l.id} ${size}`, `the check runs to ${pt.pages} pupil pages`);
                // page index -> part, pupil and key
                const map = (key) => { const o = []; for (const p of built.parts) for (let i = 0; i < (key ? p.keyPages : p.pages); i++) o.push({ part: p.part, i }); return o; };
                const pm = map(false), km = map(true);
                const where = (k, n) => `${l.id} ${size} ${k}-p${n + 1}`;
                // the sheetCheck rows, per page (page N of the doc)
                const bandsOf = (sc, n) => sc.bands.filter((x) => x.startsWith(`page ${n + 1} `) || x.startsWith(`page ${n + 1}:`));
                pm.forEach((m, n) => {
                    if (!['prereq', 'teach'].includes(m.part)) return;
                    // cell bands on the check page (D9); the blank foot on the check page and the lesson sheet (D4, D11). The sheet's
                    // cell bands are print-lint's (L-DENSITY H13 with H13-ROW: a Warm-up top cell is judged against its row)
                    for (const b of bandsOf(P.sc, n)) if (m.part === 'prereq' || /blank at the bottom/.test(b)) F('PC-H13', where('pupil', n), b.replace(/^page \d+:? ?/, ''));
                    if (m.part === 'prereq' && P.st[n] && P.st[n].maxGap > 15) F('PC-H13', where('pupil', n), `a gap of ${P.st[n].maxGap} mm between the check page's cells`);
                });
                if (has('debug')) console.log(JSON.stringify({ lesson: l.id, size, pupil: P.st.map((x) => x.strips), key: K.st.map((x) => x.strips) }));
                // strips covered; pupil vs key twin
                pm.forEach((m, n) => { for (const s of (P.st[n] || {}).strips || []) { if (s.covered && s.text) F('PC-CLIP', where('pupil', n), `heading "${s.text}" covered by ${s.covered}`); if (s.clip && s.text) F('PC-CLIP', where('pupil', n), `heading "${s.text}" clipped by ${s.clip}`); } });
                pm.forEach((m, n) => {
                    const kn = km.findIndex((x) => x.part === m.part && x.i === m.i); if (kn < 0 || !P.st[n] || !K.st[kn]) return;
                    const a = P.st[n].strips, b2 = K.st[kn].strips;
                    for (const s of a.filter((x) => x.text)) { const t = b2.find((x) => x.text === s.text); if (t && Math.abs(t.top - s.top) > 1) F('PC-CLIP', where('pupil', n), `heading "${s.text}" at ${s.top} mm, at ${t.top} mm on its key (twin geometry differs)`); }
                });
                if (!built.pre) continue;
                // the check page and its key (the prereq part's first pupil page, first key page)
                const pn = pm.findIndex((x) => x.part === 'prereq'), kn = km.findIndex((x) => x.part === 'prereq');
                const pp = P.lp.pages[pn], kp = K.lp.pages[kn];
                if (!pp || !kp) { F('PC-SLOTS', `${l.id} ${size}`, 'no check page / key read'); continue; }
                // PC-LR6 (lf-engine PC 2026-11-12; LR-6): no two check cells print the same given numbers (the sub check printed
                // 11 - 3 twice and a place item's 39 twice). Read from the drawn cell (a place item's 39 is drawn, not in q.text);
                // a cell with no numbers (a count, a picture compare) is not compared.
                { const seenK = new Map(); pp.cells.forEach((c, i) => { const k = [...new Set(nums(c.text))].sort((x, y) => x - y).join(',');
                    if (!k) return; if (seenK.has(k)) F('PC-LR6', `${l.id} ${size} check Q${c.letter || i + 1}`, `the same numbers (${k}) as Q${seenK.get(k)}`); else seenK.set(k, c.letter || i + 1); }); }
                if (has('debug')) console.log(JSON.stringify(pp.cells.map((c) => [c.letter, c.text])));
                pp.cells.forEach((c, i) => {
                    const kc = kp.cells[i]; const q = `${l.id} ${size} check Q${c.letter || i + 1}`;
                    if (!kc) { F('PC-SLOTS', q, 'no key cell'); return; }
                    if (kc.keyEmpty) F('PC-SLOTS', q, `${kc.keyEmpty} of ${kc.writing} writing slot(s) empty on the key`);
                    if (kc.emptyBox && kc.answerLine) F('PC-SLOTS', q, `two answer places: a drawn box left empty on the key and an "Answer:" line`);
                    if (kc.writing !== c.writing) F('PC-SLOTS', q, `${c.writing} writing slot(s) on the page, ${kc.writing} on the key`);
                    if (c.traces || c.greyInk || c.say || c.steps) F('PC-SCAFFOLD', q, `scaffold on a check cell (${[c.traces && 'trace', c.greyInk && 'grey ink', c.say && 'Say', c.steps && 'Steps'].filter(Boolean).join(', ')})`);
                    if (c.regroup) F('PC-SCAFFOLD', q, `a regroup / exchange box (${c.regroup}) on a check cell`);
                    if (c.responses > 1) F('PC-SCAFFOLD', q, `${c.responses} responses in one check cell (one point)`);
                });
            }
        }
    } finally { await app.close(); }
    // one line per (rule, lesson, question, message) across seeds: "seeds 4242, 1037, ..."
    const merged = new Map();
    for (const x of findings) { const w = x.where.replace(/ seed \d+/, ''); const k = `${x.rule}|${w}|${x.msg.replace(/\d+(, \d+)*/g, '#')}`; const seed = (x.where.match(/seed (\d+)/) || [])[1];
        if (!merged.has(k)) merged.set(k, Object.assign({}, x, { where: w, seeds: [] })); if (seed) merged.get(k).seeds.push(seed); }
    findings.length = 0; for (const x of merged.values()) findings.push(Object.assign(x, { where: x.seeds.length ? `${x.where} (seeds ${x.seeds.join(', ')})` : x.where }));
    const ONLY_RULES = (arg('rules', '') || '').split(',').map((x) => x.trim()).filter(Boolean);
    const rules = ['PC-RANGE', 'PC-NAME', 'PC-SLOTS', 'PC-SCAFFOLD', 'PC-LR6', 'PC-H13', 'PC-CLIP', 'PC-PAGES', 'PC-BUILD'].filter((r) => !ONLY_RULES.length || ONLY_RULES.includes(r) || r === 'PC-BUILD');
    { const keep = findings.filter((x) => rules.includes(x.rule)); findings.length = 0; findings.push(...keep); }
    for (const r of rules) { const fs2 = findings.filter((x) => x.rule === r); console.log(`${r.padEnd(12)} ${fs2.length ? `FAIL ${fs2.length}` : na === LESSONS.length && /RANGE|NAME|SLOTS|SCAFFOLD/.test(r) ? 'N/A (no Prerequisite Check in this tree)' : 'PASS'}`); for (const x of fs2.slice(0, 8)) console.log(`   ${x.where}: ${x.msg}`); if (fs2.length > 8) console.log(`   ... ${fs2.length - 8} more`); }
    if (na < LESSONS.length && !read) findings.push({ rule: 'PC-BUILD', where: 'all', msg: 'a Prerequisite Check exists but 0 prerequisite items were read (part / pool names changed?)' });
    console.log(`(${LESSONS.length} lessons, ${NSEEDS} seeds, sizes ${SIZES.join(',')}; ${read} prerequisite items read)`);
    console.log(`ws-lesson-samples --check: ${findings.length ? `FAIL (${findings.length})` : 'OK'}`);
    process.exit(findings.length ? 1 : 0);
}

if (CHECK) checkMain().catch((e) => { console.error(e); console.log('ws-lesson-samples --check: FAIL'); process.exit(1); });
else (async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const app = await open({ seed: 1, lock: 'ws-lesson-samples' });
    const { page } = app;
    const summary = [];
    for (const l of LESSONS) {
        for (const size of SIZES) {
            const dir = path.join(OUT, l.dir, size);
            fs.rmSync(dir, { recursive: true, force: true });
            fs.mkdirSync(dir, { recursive: true });
            const built = await page.evaluate(async ({ skill, size, PRACTICE, FORCE, RSEED }) => {
                try {
                    const r = await window.buildSheet({ role: 'lesson', sections: [{ skills: [skill] }], size, paper: 'A4', seed: RSEED, key: true, practicePages: PRACTICE, mixed: true, prereqsForce: FORCE });
                    return {
                        pupil: window.sheetDocument(r.pupilHtml, r.title, { paper: 'A4' }),
                        key: window.sheetDocument(r.keyHtml, `${r.title} - Answer Key`, { paper: 'A4' }),
                        pageCount: r.pageCount, keyPageCount: r.keyPageCount, fits: r.fits, notes: r.notes, gaps: r.gaps, lesson: r.lesson, title: r.title,
                        meta: r.plan && r.plan.meta,
                        items: r.items.map((it) => ({ part: it.part, pool: it.pool, template: it.template, text: String(it.text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 60), ans: typeof it.ans === 'object' ? JSON.stringify(it.ans) : String(it.ans) })),
                    };
                } catch (e) { return { error: (e && e.stack) || String(e) }; }
            }, { skill: l.skill, size, PRACTICE, FORCE, RSEED });
            if (built.error) { console.log(`${l.dir} ${size}: ERROR ${built.error}`); summary.push({ lesson: l.dir, size, error: built.error }); continue; }
            const pdfP = path.join(dir, 'pupil.pdf');
            const pdfK = path.join(dir, 'key.pdf');
            const checkP = await printDoc(page, built.pupil, pdfP);
            const checkK = await printDoc(page, built.key, pdfK);
            const pages = JSON.parse(execFileSync('python3', ['-c', RASTER_PY, pdfP, dir, String(DPI), 'pupil', '0'], { encoding: 'utf8' }).trim().split('\n').pop());
            const keyPages = JSON.parse(execFileSync('python3', ['-c', RASTER_PY, pdfK, dir, String(DPI), 'key', '-'], { encoding: 'utf8' }).trim().split('\n').pop());
            fs.unlinkSync(pdfP); fs.unlinkSync(pdfK);
            const { pupil, key, ...rest } = built;
            const meta = { ...rest, pages, keyPages, check: checkP, keyCheck: checkK };
            fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 1));
            console.log(`${l.dir} ${size}: ${built.pageCount} pages + ${built.keyPageCount} key; ${[...checkP.problems, ...checkK.problems].length} layout problems; fonts ${Object.keys(checkP.fonts).join(',')}`);
            for (const p of [...checkP.problems, ...checkK.problems.map((x) => `key ${x}`)].slice(0, 12)) console.log(`   ${p}`);
            for (const b of checkP.bands.slice(0, 16)) console.log(`   H13? ${b}`);
            if (has('stats')) for (const st of checkP.stats) console.log(`   p${st.page}: ${st.labelled} lettered items, ${st.cells} cells, largest empty band ${st.maxBand}%, body blank at foot ${st.blank}%`);
            summary.push({ lesson: l.dir, size, pages: built.pageCount, keyPages: built.keyPageCount, problems: checkP.problems.length + checkK.problems.length });
            if (has('copy') && size === 'L') {
                const dest = path.join(ROOT, 'design', 'lesson-samples', l.dir);
                fs.rmSync(dest, { recursive: true, force: true });
                fs.mkdirSync(dest, { recursive: true });
                for (const f of fs.readdirSync(dir)) if (/\.png$/.test(f)) fs.copyFileSync(path.join(dir, f), path.join(dest, f));
            }
        }
    }
    fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 1));
    if (app.problems && app.problems.length) console.log('page problems:', app.problems.slice(0, 5));
    await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
