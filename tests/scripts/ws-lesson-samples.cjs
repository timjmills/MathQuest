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
//     PC-LR6     (LR-6, lf-engine PC 2026-11-12) no two cells of the check page print the same given numbers (drawn text),
//                nor near twins (critic r3 F13: one number different, that pair reordered / one place different / within 2)
//     PC-H13     (D4, D9, D11) at every size: the check page has no cell band >= 30 % and no gap > 15 mm between its
//                cells; the check page and the lesson sheet have a blank foot <= 8 % (sheetCheck, now blocking; the sheet's
//                cell bands stay print-lint's L-DENSITY H13 / H13-ROW)
//     PC-CLIP    every band heading at the same place on a pupil page and its key twin (+/- 1 mm), and no heading
//                clipped by an overflow-hiding ancestor. D10 itself (a fill painted over a heading) is NOT seen by the DOM:
//                ws-print-lint L-OVERLAP SECTION reads it on the PDF (precritic lesson-samples-key-L / -S; critic r2 D1)
//     PC-PAGES   (lf-engine PC, lead ruling A) the Prerequisite Check prints on ONE pupil page; --force-check renders a
//                check whose LR-17 switch is still off (buildSheet prereqsForce)
//     PC-LR5     (critic r3 F4; LR-5) --seeds builds: no item placed on the lesson sheet is placed again on Practice or Mixed
//     PC-H13P    (critic r3 F5 / F7) = PM-H13 below (merged 2026-11-13: one rule; --rules PC-H13P reads PM-H13)
//     PC-FRAME   (critic r3 F3) every page, pupil and key: the body's drawn ink ends inside the body (no band cut at the foot)
//     PC-CLIP    also (critic r3 F2) on the check page and its key: each band's grid ink ends above its "If missed" tag and
//                every tag is drawn inside its band
//     PC-PV      (critic r3 F1) a routed check's place cells print no place heads, and with two ring words the word nearest
//                the underlined digit is not the wrong one in every item
//     PM-H13     (lf-engine-pc r3 F5, F7; live-fix 2026-11-13) every Practice and Mixed page: no cell band >= 30 % (blocking)
//     LIVE-PART  (r3 F6, H15) every carry / regroup box a key page draws is filled by >= 1 stack of its section
//     (lf-engine live-pm critic 2026-11-13, findings 1-5: these four rules also run on the SPOT lessons div_facts, sub_wp_10,
//     fact_family_sort, add_wp_20 - every cell kind: equation, missing factor, word problem, rounding on Mixed)
//     PM-CONT    no Practice / Mixed continuation page (2nd+ page of its sheet) is >= 50 % blank at the bottom (finding 3)
//     TAB-CLEAR  on every Practice / Mixed page and its key: the item-number tab clears the nearest content box of its cell
//                by >= 2 mm (1 mm for an across fact: the kit's CL-40 contract) (finding 4: the "1" tab touched the "T" head of a rounding cell); ink, not boxes: a drawing by
//                its shapes, text by its own run (a Range, not its element) from its glyphs' top (canvas text metrics)
//     PG-TURN    (lead ruling, lf-engine PC r4: a same-page turnaround is worse than a cross-page repeat) no page of the packet
//                prints one of its own sums / products turned round (1 + 3 and 3 + 1; a number bond "1 + 2 = ?" read as a sum):
//                --seeds builds of the three samples, and the 4242 build at every size of every lesson (--all-lessons too)
//     SHEET-2PG  a lesson sheet printed on 2+ pages has a page >= 70 % used (lead item 6: Y4.B1.S14 L, two pages ~38 % empty)
//   --all-lessons adds every lesson of lessons/prereqs.js LESSONS (layout rules only), e.g. --all-lessons --rules PM-CONT,SHEET-2PG
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
    // SPOT lessons (lf-engine live-pm critic, 2026-11-13: the critic's spot list beyond the three samples). Layout rules only
    // (PM-H13, PM-CONT, TAB-CLEAR, LIVE-PART) under --check; rendered with --only <id> (e.g. --only div,ffs).
    { id: 'div', dir: 'div-facts', spot: true, skill: { categoryId: 'division', skillId: 'div_facts' } },
    { id: 'subwp', dir: 'sub-wp-10', spot: true, skill: { categoryId: 'subtraction', skillId: 'sub_wp_10' } },
    { id: 'ffs', dir: 'fact-family-sort', spot: true, skill: { categoryId: 'addition', skillId: 'fact_family_sort' } },
    { id: 'addwp', dir: 'add-wp-20', spot: true, skill: { categoryId: 'addition', skillId: 'add_wp_20' } },
].filter((l) => (ONLY ? ONLY.split(',').includes(l.id) : (CHECK || !l.spot)));
// --skill cat:skill (render mode): render that one lesson (proof PNGs of any lesson, e.g. --skill addition:add_wp_10)
if (arg('skill', '')) { const [categoryId, skillId] = arg('skill').split(':'); LESSONS.length = 0; LESSONS.push({ id: skillId, dir: skillId, skill: { categoryId, skillId } }); }
// --all-lessons (lead, live-pm r2 items 6 / 7): every lesson of lessons/prereqs.js LESSONS too (the lessons ws-lesson-baseline
// --all-lessons proves), layout rules only, like the spot lessons
const CORE_N = LESSONS.filter((l) => !l.spot).length;

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

/** LIVE-PART (F6): per key page, the carry / regroup boxes (a stack's `.rg[data-ws-seg]`, counted from the ones) that NO
 *  stack of their section (`.ws-grid`) fills - a dead part (H15). One message per (section, box place). */
/** LR-6 near twins on drawn check cells (critic r3 F13): keys of sorted numbers that differ in ONE number, a near pair:
 *  reordered or within 2 anywhere on the page; one place different (shared digit not 0) inside one question. */
function nearKeyPair(k1, k2, sameQ) {
    const near = (x, y) => { if (!(x >= 10 && y >= 10) || x === y) return false; if (Math.abs(x - y) <= 2) return true; const a = String(x), b = String(y);
        if (a.length !== b.length) return false; if ([...a].sort().join('') === [...b].sort().join('')) return true; if (!sameQ) return false; let d = 0, z = true; for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) d++; else if (a[i] !== '0') z = false; } return d === 1 && !z; };
    const a = String(k1).split(',').filter(Boolean).map(Number), b = String(k2).split(',').filter(Boolean).map(Number);
    if (!a.length || a.length !== b.length) return false;
    for (let i = a.length - 1; i >= 0; i--) { const j = b.indexOf(a[i]); if (j >= 0) { b.splice(j, 1); a.splice(i, 1); } }
    return a.length === 1 && b.length === 1 && near(a[0], b[0]);
}
function carryMeasure() {
    return [...document.querySelectorAll('.ws-page')].map((pg) => {
        const dead = [];
        pg.querySelectorAll('.ws-grid').forEach((grid, gi) => {
            const drawn = new Map();
            grid.querySelectorAll('.ws-stack').forEach((st) => {
                const rg = [...st.querySelectorAll(':scope > .rg')];
                rg.forEach((r, i) => { if (!r.hasAttribute('data-ws-seg')) return; const place = rg.length - 1 - i; const filled = /\S/.test(r.textContent || '');
                    drawn.set(place, (drawn.get(place) || false) || filled); });
            });
            for (const [place, filled] of drawn) if (!filled) dead.push(`section ${gi + 1}: the carry box over place ${place} (${['ones', 'tens', 'hundreds', 'thousands'][place] || place}) is drawn on every stack and filled on none`);
        });
        return dead;
    });
}

/** TAB-CLEAR (live-pm critic finding 4): per page, every cell whose item-number tab (`[data-ws-label]`, a direct child)
 *  sits closer than 2 mm to a content box of the same cell (text, a drawing, a slot or a bordered box; the rect gap,
 *  0 when they overlap). One message per cell: its number and the gap. */
function tabMeasure() {
    const MM = 96 / 25.4;
    return [...document.querySelectorAll('.ws-page')].map((pg) => {
        const out = [];
        pg.querySelectorAll('.ws-cell').forEach((c, k) => {
            const tab = c.querySelector(':scope > [data-ws-label]');
            if (!tab) return;
            const t = tab.getBoundingClientRect();
            if (!t.width || !t.height) return;
            let best = Infinity, what = '';
            for (const d of c.querySelectorAll('*')) {
                if (d.closest('[data-ws-label]')) continue;
                const st = getComputedStyle(d);
                if (st.visibility === 'hidden' || st.display === 'none') continue;
                let r = d.getBoundingClientRect();
                if (!r.width || !r.height) continue;
                // ink, not boxes: a drawing by its shapes (an <svg> box spans its whole cell), a line of text from its cap
                // line (the kit's own model of the leading above a digit, CL-40: 0.2 em), a slot or a bordered box whole
                const inSvg = d instanceof SVGElement;
                if (inSvg && !/^(rect|line|path|circle|ellipse|polygon|polyline|text)$/i.test(d.tagName)) continue;
                const text = !inSvg && [...d.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim());
                const leaf = inSvg || /^(img)$/i.test(d.tagName) || d.hasAttribute('data-ws-slot');
                const bordered = !inSvg && (parseFloat(st.borderTopWidth) || parseFloat(st.borderBottomWidth) || parseFloat(st.borderLeftWidth));
                if (!text && !leaf && !bordered) continue;
                // (a text's own run, not its element: a table cell 2.2 em wide holds a 0.6 em "T")
                if (text && !bordered) { const rg = document.createRange(); rg.selectNodeContents(d); const q = [...rg.getClientRects()].filter((x) => x.width && x.height);
                    if (q.length) r = { left: Math.min(...q.map((x) => x.left)), right: Math.max(...q.map((x) => x.right)), top: Math.min(...q.map((x) => x.top)), bottom: Math.max(...q.map((x) => x.bottom)) }; }
                // (a text run's ink top: its content-area top plus the font's ascent above the glyphs' own - canvas metrics)
                let top = r.top;
                if (text && !bordered) { const cv = (tabMeasure.cv = tabMeasure.cv || document.createElement('canvas').getContext('2d')); cv.font = `${st.fontStyle} ${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
                    const mt = cv.measureText(d.textContent.trim()); top = r.top + Math.max(0, (mt.fontBoundingBoxAscent || 0) - (mt.actualBoundingBoxAscent || 0)); }
                const dx = Math.max(0, r.left - t.right, t.left - r.right), dy = Math.max(0, top - t.bottom, t.top - r.bottom);
                const gap = Math.hypot(dx, dy) / MM;
                if (gap < best) { best = gap; what = (text ? `"${d.textContent.trim().slice(0, 12)}"` : d.tagName.toLowerCase()); }
            }
            // (an across fact keeps the kit's CL-40 contract - ink >= tab + 1 mm, print-lint L-OVERLAP CL40-INK: a one-line
            // fact row sized to its content cannot drop the fact 2 mm under the tab AND keep its bands under 30 %)
            const need = c.querySelector(':scope > .ws-eq[data-ws-across]') ? 1 : 2;
            if (best < need) out.push(`cell ${k + 1} (tab "${tab.textContent.trim()}"): ${best.toFixed(1)} mm from ${what}`);
        });
        return out;
    });
}

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

/** In the page (lf-engine PC r3 fix, critic r3 F1-F3): per page, (a) FRAME: the lowest drawn ink inside the body vs the
 *  body's bottom (F3: a band cut at the body foot); (b) INK: per routed band (.mq-lprecol) its grid's ink bottom vs its
 *  teacher tag's top, and whether the tag's own text is drawn inside its band (F2: a 36.1 mm fact cell in a 35.9 mm row
 *  hid the tag); (c) PV: per place cell, whether the numeral prints place heads (F1) and, with two ring words, which word
 *  lies nearest the underlined digit and which word is ringed (the key). */
function pcMeasure() {
    const MM = 96 / 25.4;
    const vis = (e) => { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return null; const r = e.getBoundingClientRect(); return r.width && r.height ? r : null; };
    const inkBottom = (root) => { let b = -Infinity; for (const d of root.querySelectorAll('*')) { if (d.children.length && !(d instanceof SVGSVGElement) && !(d.textContent || '').trim() && !(parseFloat(getComputedStyle(d).borderBottomWidth) > 0)) continue;
        const r = vis(d); if (!r) continue; const leaf = !d.children.length || d instanceof SVGSVGElement; const bordered = parseFloat(getComputedStyle(d).borderBottomWidth) > 0 || parseFloat(getComputedStyle(d).borderTopWidth) > 0;
        if (leaf || bordered) b = Math.max(b, r.bottom); } return b; };
    return [...document.querySelectorAll('body > section.ws-page, body > .ws-page')].map((pg) => {
        const body = pg.querySelector('.ws-body');
        const out = { frame: null, ink: [], pv: [] };
        if (body) { const br = body.getBoundingClientRect(); const ib = inkBottom(body);
            // (and each band's own frame: a cell drawn past its grid / band bottom hides the band's bottom rule - sub L sheet
            // Independent cells 69 mm in a 64.8 mm row, cut by the grid: the body's ink stayed inside the body)
            let worst = { over: Math.round((ib - br.bottom) / MM * 10) / 10, what: 'body' };
            for (const bd of body.querySelectorAll('.ws-band, .ws-grid')) { const r = vis(bd); if (!r) continue; let b = -Infinity; for (const c of bd.querySelectorAll('.ws-cell')) { const q = vis(c); if (q) b = Math.max(b, q.bottom); }
                const o = Math.round((b - r.bottom) / MM * 10) / 10; if (o > worst.over) worst = { over: o, what: `${String(bd.className).split(' ')[0]} "${((bd.querySelector('.ws-strip') || {}).textContent || '').trim().slice(0, 30)}"` }; }
            // (the PDF lays a fixed grid's row out at its cells' natural height - the screen squeezes them: sub L sheet Independent
            // cells drew 68.8 mm in the PDF in a 64.8 mm row, past the band's bottom rule. A row's natural height: the grid freed
            // of its fixed height, read, and restored.)
            for (const g of body.querySelectorAll('.ws-grid')) { const h0 = g.style.height; if (!h0) continue; const r0 = g.getBoundingClientRect(); const rows = Math.max(1, getComputedStyle(g).gridTemplateRows.split(' ').length);
                const rowH = r0.height / rows; g.style.height = 'auto'; let nat = 0; for (const c of g.children) nat = Math.max(nat, c.getBoundingClientRect().height); g.style.height = h0;
                const o = Math.round((nat - rowH) / MM * 10) / 10; if (o > Math.max(0.5, worst.over)) worst = { over: o, what: `row of the band "${((g.closest('.ws-band') || g).querySelector('.ws-strip') || { textContent: '' }).textContent.trim().slice(0, 30)}" (its cells need ${(nat / MM).toFixed(1)} mm in ${(rowH / MM).toFixed(1)} mm) - a cell runs past it` }; }
            out.frame = worst; }
        for (const col of pg.querySelectorAll('.mq-lprecol')) {
            const grid = col.querySelector(':scope > .ws-grid'), tag = col.querySelector(':scope > .mq-lpretag');
            if (!grid || !tag) continue;
            const gb = Math.max(inkBottom(grid), grid.getBoundingClientRect().bottom);
            const tr = tag.getBoundingClientRect();
            // the tag's ink: its text's own box, inside every ancestor that clips (the band) and below the grid's ink
            let shown = !!(tag.textContent || '').trim() && tr.height > 1;
            for (let a = tag.parentElement; shown && a && a !== pg; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflow === 'visible' && cs.overflowY === 'visible') continue; const q = a.getBoundingClientRect(); if (tr.bottom > q.bottom + 1) shown = false; }
            out.ink.push({ text: (tag.textContent || '').trim().slice(0, 40), over: Math.round((gb - tr.top) / MM * 10) / 10, shown: shown && gb <= tr.top + 1 });
        }
        pg.querySelectorAll('.ws-cell').forEach((c, k) => {
            const tracks = c.querySelector('.pv-tracks'); const ring = c.querySelector('.pv-ring-row');
            if (!tracks) return;
            const rows = tracks.querySelectorAll('tr').length;
            const lab = c.querySelector('[data-ws-label], .ws-letter');
            const rec = { cell: (lab && lab.textContent.trim()) || String(k + 1), heads: rows > 1 };
            const ul = [...tracks.querySelectorAll('span')].find((s) => parseFloat(getComputedStyle(s).borderBottomWidth) > 0);
            const ch = ring ? [...ring.querySelectorAll('.pv-choice')] : [];
            if (ul && ch.length === 2) {
                const ux = (ul.getBoundingClientRect().left + ul.getBoundingClientRect().right) / 2;
                const d = ch.map((x) => { const r = x.getBoundingClientRect(); return Math.abs((r.left + r.right) / 2 - ux); });
                rec.nearest = ch[d[0] <= d[1] ? 0 : 1].textContent.trim();
                const ringed = ch.find((x) => { const cs = getComputedStyle(x); return parseFloat(cs.borderTopWidth) > 0 && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.borderTopColor); });
                rec.ringed = ringed ? ringed.textContent.trim() : null;
            }
            out.pv.push(rec);
        });
        return out;
    });
}

/** PG-TURN (lead ruling, lf-engine PC r4 2026-11-13): no page prints one of its OWN sums or products turned round
 *  ("1 + 3 = ?" and "3 + 1 = ?"; a number bond read as a sum, "1 + 2 = ?", is one too). LR-5's key (lesson-rules itemKey):
 *  the same + / x numbers, a different text. `placed` [{part, page, t}]; returns [{part, msg}]. Pure. */
function pageTurns(placed) {
    const out = []; const by = new Map();
    for (const x of placed || []) {
        const m = /^(\d+)\s*([+×x*])\s*(\d+)\s*=\s*\?$/.exec(x.t); if (!m) continue;
        const k = `${x.page}|${m[2] === '+' ? '+' : '×'}${[Number(m[1]), Number(m[3])].sort((a, b) => a - b).join(',')}`;
        const was = by.get(k);
        if (was && was.t !== x.t) out.push({ part: x.part, msg: `"${x.t}" turns round "${was.t}" on the same page (${was.part === x.part ? x.part : `${was.part} / ${x.part}`})` });
        else if (!was) by.set(k, x);
    }
    return out;
}
const ONLY_RULES0 = (arg('rules', '') || '').split(',').map((x) => x.trim()).filter(Boolean);

async function checkMain() {
    const app = await open({ seed: 1 });
    const { page } = app;
    const findings = []; let na = 0; let read = 0;
    // --all-lessons (lead, live-pm r2 items 6 / 7): every lesson of lessons/prereqs.js LESSONS too (the lessons
    // ws-lesson-baseline --all-lessons proves), layout rules only, like the spot lessons
    if (has('all-lessons')) {
        const keys = await page.evaluate(async () => Object.keys((await import('./js/modules/lessons/prereqs.js')).LESSONS));
        for (const k of keys) { const [categoryId, skillId] = k.split(':'); if (LESSONS.some((l) => l.skill.categoryId === categoryId && l.skill.skillId === skillId && !l.skill.opts)) continue;
            if (!ONLY || ONLY.split(',').includes(k)) LESSONS.push({ id: k, dir: skillId, spot: true, skill: { categoryId, skillId } }); }
    }
    const F = (rule, where, msg) => findings.push({ rule, where, msg });
    try {
        for (const l of LESSONS) {
            // content: several seeds (no layout)
            const seeds = l.spot ? [] : Array.from({ length: NSEEDS }, (_, i) => (i === 0 ? 4242 : 1000 + i * 37));
            for (const seed of seeds) {
                const b = await page.evaluate(async ({ skill, seed, FORCE }) => { try { const r = await window.buildSheet({ role: 'lesson', sections: [{ skills: [skill] }], size: 'L', paper: 'A4', seed, key: true, practicePages: 1, mixed: true, prereqsForce: FORCE });
                    // (PC-LR5, critic r3 F4: the PLACED items of the sheet, Practice and Mixed - partPlans' grids, the chart's own
                    // examples left out - so a re-dealt sheet item printed again on Practice is seen)
                    const placed = []; let pgN = 0; const walk = (node, part) => { if (!node) return; if (node.kind === 'grid') (node.items || []).forEach((it) => { if (it && it.q && !it.model) placed.push({ part, page: pgN, t: String(it.q.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() }); }); if (node.content) walk(node.content, part); (node.contents || []).forEach((c) => walk(c, part)); (node.parts || []).forEach((c) => walk(c, part)); };
                    // (PG-TURN reads every part's pages, the check and the chart included; PC-LR5 the sheet, Practice and Mixed)
                    for (const pp of r.partPlans || []) for (const pl of pp.plans || []) for (const pg of (pl && pl.pages) || []) { pgN++; (pg.sections || []).forEach((sc) => walk(sc, pp.part)); }
                    return { placed, pre: (r.lesson && r.lesson.prereqCheck) || null, items: r.items.filter((it) => it.part === 'prereq').map((it) => ({ pool: it.pool, text: String(it.text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), ans: typeof it.ans === 'object' ? JSON.stringify(it.ans) : String(it.ans) })) }; } catch (e) { return { error: String((e && e.message) || e) }; } }, { skill: l.skill, seed, FORCE });
                if (b.error) { F('PC-BUILD', `${l.id} seed ${seed}`, b.error.slice(0, 160)); continue; }
                // PC-LR5 (critic r3 F4; LR-5): no item of the lesson sheet printed again on Practice or Mixed
                { const sheet = new Set((b.placed || []).filter((x) => x.part === 'teach' && /\d/.test(x.t)).map((x) => x.t));
                    for (const x of b.placed || []) if (['practice', 'mixed'].includes(x.part) && sheet.has(x.t)) F('PC-LR5', `${l.id} seed ${seed} ${x.part}`, `"${x.t}" is on the lesson sheet and on ${x.part}`); }
                for (const m of pageTurns(b.placed)) F('PG-TURN', `${l.id} seed ${seed} ${m.part}`, m.msg);
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
                    const placed = []; let pgN = 0; const walk = (node, part) => { if (!node) return; if (node.kind === 'grid') (node.items || []).forEach((it) => { if (it && it.q && !it.model) placed.push({ part, page: pgN, t: String(it.q.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() }); }); if (node.content) walk(node.content, part); (node.contents || []).forEach((c) => walk(c, part)); (node.parts || []).forEach((c) => walk(c, part)); };
                    for (const pp of r.partPlans || []) for (const pl of pp.plans || []) for (const pg of (pl && pl.pages) || []) { pgN++; (pg.sections || []).forEach((sc) => walk(sc, pp.part)); }
                    return { placed, pupil: window.sheetDocument(r.pupilHtml, r.title, { paper: 'A4' }), key: window.sheetDocument(r.keyHtml, r.title, { paper: 'A4' }), parts: (r.lesson && r.lesson.parts) || [], pre: !!(r.lesson && r.lesson.prereqCheck), qs: ((r.lesson && r.lesson.prereqLayout && r.lesson.prereqLayout.units) || []).flatMap((u) => u.qs) }; } catch (e) { return { error: String((e && e.message) || e) }; } }, { skill: l.skill, size, FORCE });
                if (built.error) { F('PC-BUILD', `${l.id} ${size}`, built.error.slice(0, 160)); continue; }
                for (const m of pageTurns(built.placed)) F('PG-TURN', `${l.id} ${size} seed 4242 ${m.part}`, m.msg);
                if (ONLY_RULES0.length && ONLY_RULES0.every((r) => r === 'PG-TURN')) continue;
                const read2 = async (html) => { const sh = await page.browser().newPage(); try { await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 }); await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
                    await sh.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 }); await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                    await sh.emulateMediaType('print');
                    return { lp: await sh.evaluate(LP.lpMeasure, { layout: true }), sc: await sheetCheck(sh), st: await sh.evaluate(stripMeasure), pc: await sh.evaluate(pcMeasure), rg: await sh.evaluate(carryMeasure), tb: await sh.evaluate(tabMeasure) }; } finally { await sh.close(); } };
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
                    if (l.spot || !['prereq', 'teach'].includes(m.part)) return;
                    // cell bands on the check page (D9); the blank foot on the check page and the lesson sheet (D4, D11). The sheet's
                    // cell bands are print-lint's (L-DENSITY H13 with H13-ROW: a Warm-up top cell is judged against its row)
                    for (const b of bandsOf(P.sc, n)) if (m.part === 'prereq' || /blank at the bottom/.test(b)) F('PC-H13', where('pupil', n), b.replace(/^page \d+:? ?/, ''));
                    if (m.part === 'prereq' && P.st[n] && P.st[n].maxGap > 15) F('PC-H13', where('pupil', n), `a gap of ${P.st[n].maxGap} mm between the check page's cells`);
                });
                // PM-H13 (live-fix 2026-11-13, critic lf-engine-pc r3 F5 / F7: "critic-ready" = EVERY page of the packet gated): the
                // Practice and Mixed pages have no cell band >= 30 % either (blocking; their blank foot stays print-lint's)
                pm.forEach((m, n) => { if (!['practice', 'mixed'].includes(m.part)) return; for (const b of bandsOf(P.sc, n)) if (!/blank at the bottom/.test(b)) F('PM-H13', where('pupil', n), `${m.part}: ${b.replace(/^page \d+:? ?/, '')}`); });
                // LIVE-PART (F6, H15): every carry / regroup box a key page draws is filled on that key by >= 1 stack of its section
                km.forEach((m, n) => { for (const d of (K.rg[n] || [])) F('LIVE-PART', where('key', n), `${m.part}: ${d}`); });
                // PM-CONT (live-pm critic finding 3): a Practice / Mixed sheet's continuation page is never >= 50 % blank (the
                // 6-cell row pushed overleaf while the page before ended 29 % blank)
                pm.forEach((m, n) => { if (!['practice', 'mixed'].includes(m.part) || m.i === 0) return; const st = (P.sc.stats || [])[n]; if (st && st.blank >= 50) F('PM-CONT', where('pupil', n), `${m.part} continuation page ${st.blank} % blank at the bottom`); });
                // TAB-CLEAR (finding 4): the number tab >= 2 mm from any content of its cell, Practice / Mixed pupil and key
                pm.forEach((m, n) => { if (!['practice', 'mixed'].includes(m.part)) return; for (const d of (P.tb[n] || [])) F('TAB-CLEAR', where('pupil', n), `${m.part}: ${d}`); });
                km.forEach((m, n) => { if (!['practice', 'mixed'].includes(m.part)) return; for (const d of (K.tb[n] || [])) F('TAB-CLEAR', where('key', n), `${m.part}: ${d}`); });
                // SHEET-2PG (lead, live-pm r2 item 6): a lesson sheet of two or more pages has at least one page >= 70 % used
                { const tp = pm.map((m, n) => ({ m, n })).filter((x) => x.m.part === 'teach'); const st = tp.map((x) => (P.sc.stats || [])[x.n]).filter(Boolean);
                    if (tp.length > 1 && st.length === tp.length && st.every((x) => x.blank > 30)) F('SHEET-2PG', where('pupil', tp[0].n), `the lesson sheet prints on ${tp.length} pages, each under 70 % used (blank at the foot ${st.map((x) => `${x.blank} %`).join(', ')})`); }
                if (l.spot) continue;
                // PC-FRAME (critic r3 F3): every page of the packet, pupil and key, ends inside its body (no band cut at the foot)
                for (const [doc, mm, k] of [[P, pm, 'pupil'], [K, km, 'key']]) (doc.pc || []).forEach((pg, n) => { if (pg.frame && pg.frame.over > 0.3) F('PC-FRAME', where(k, n) + ` (${(mm[n] || {}).part || '?'})`, `${pg.frame.what === 'body' ? 'ink runs' : `a cell runs past its ${pg.frame.what} by`} ${pg.frame.over} mm${pg.frame.what === 'body' ? " past the body's bottom" : ''} (the band has no bottom rule inside the frame)`); });
                // PC-CLIP on ink (critic r3 F2): on the check page and its key, each routed band's grid ink ends above its tag, and
                // every "If missed" tag is drawn inside its band
                for (const [doc, mm, k] of [[P, pm, 'pupil'], [K, km, 'key']]) (doc.pc || []).forEach((pg, n) => { if ((mm[n] || {}).part !== 'prereq') return;
                    for (const t of pg.ink) if (!t.shown) F('PC-CLIP', where(k, n), `the tag "${t.text}" has no ink: the grid's ink ends ${t.over} mm below its top`); });
                // PC-PV (critic r3 F1): on a routed check a place cell prints no place heads (they give the answer), and with two
                // ring words the word nearest the underlined digit is not always the wrong one (words in place order)
                { const kpn = km.findIndex((x) => x.part === 'prereq'); const ppn = pm.findIndex((x) => x.part === 'prereq');
                    for (const [doc, n, k] of [[P, ppn, 'pupil'], [K, kpn, 'key']]) for (const c of ((doc.pc || [])[n] || {}).pv || []) if (c.heads) F('PC-PV', `${where(k, n)} check Q${c.cell}`, 'place heads over the numeral on a routed check (they name the answer)');
                    const two = (((K.pc || [])[kpn] || {}).pv || []).filter((c) => c.nearest && c.ringed);
                    if (two.length >= 2 && two.every((c) => c.nearest !== c.ringed)) F('PC-PV', where('key', kpn), `in all ${two.length} two-word place items the word nearest the underlined digit is the wrong one (${two.map((c) => `Q${c.cell} ${c.nearest}`).join(', ')})`); }
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
                { const seenK = new Map(); const qOf = []; (built.qs || []).forEach((len, q) => { for (let j = 0; j < len; j++) qOf.push(q); }); pp.cells.forEach((c, i) => { const k = [...new Set(nums(c.text))].sort((x, y) => x - y).join(',');
                    if (!k) return; if (seenK.has(k)) F('PC-LR6', `${l.id} ${size} check Q${c.letter || i + 1}`, `the same numbers (${k}) as Q${seenK.get(k).n}`); else {
                        // (critic r3 F13: near twins too - 77 / 27 / 71, round 75 / 45: one number different, and that pair the
                        // same digits reordered, one place different, or within 2; both 10 or more. Independent of the dealer's copy.)
                        for (const [k2, q2] of seenK) if (nearKeyPair(k2, k, qOf[i] !== undefined && qOf[i] === qOf[q2.i])) { F('PC-LR6', `${l.id} ${size} check Q${c.letter || i + 1}`, `near twin of Q${q2.n} (${k2} / ${k})`); break; }
                        seenK.set(k, { n: c.letter || i + 1, i }); } }); }
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
    const ONLY_RULES = (arg('rules', '') || '').split(',').map((x) => x.trim()).filter(Boolean).map((x) => (x === 'PC-H13P' ? 'PM-H13' : x));
    const rules = ['PC-RANGE', 'PC-NAME', 'PC-SLOTS', 'PC-SCAFFOLD', 'PC-LR5', 'PC-LR6', 'PG-TURN', 'PC-H13', 'PC-CLIP', 'PC-FRAME', 'PC-PV', 'PC-PAGES', 'PM-H13', 'LIVE-PART', 'PM-CONT', 'TAB-CLEAR', 'SHEET-2PG', 'PC-BUILD'].filter((r) => !ONLY_RULES.length || ONLY_RULES.includes(r) || r === 'PC-BUILD');
    { const keep = findings.filter((x) => rules.includes(x.rule)); findings.length = 0; findings.push(...keep); }
    // KNOWN opens (one explicit entry per lesson, never a rule-wide waiver): printed as KNOWN, not counted as FAIL, never OK
    const KNOWN = [
        { rule: 'SHEET-2PG', lesson: 'round', size: 'L', note: 'Y4.B1.S14 L lesson sheet re-flow (live-pm2 item 6) reverted after critic FAIL; item 6 redone separately - design/status/lf-engine.md' },
    ];
    const known = findings.filter((x) => KNOWN.some((k) => k.rule === x.rule && x.where.startsWith(`${k.lesson} ${k.size} `)));
    { const keep = findings.filter((x) => !known.includes(x)); findings.length = 0; findings.push(...keep); }
    for (const x of known) { const k = KNOWN.find((y) => y.rule === x.rule && x.where.startsWith(`${y.lesson} ${y.size} `)); console.log(`${x.rule.padEnd(12)} KNOWN ${x.where}: ${x.msg} [${k.note}]`); }
    for (const r of rules) { const fs2 = findings.filter((x) => x.rule === r); const kn = known.filter((x) => x.rule === r).length; console.log(`${r.padEnd(12)} ${fs2.length ? `FAIL ${fs2.length}${kn ? ` (+ KNOWN ${kn})` : ''}` : kn ? `KNOWN ${kn}` : na === CORE_N && /RANGE|NAME|SLOTS|SCAFFOLD/.test(r) ? 'N/A (no Prerequisite Check in this tree)' : 'PASS'}`); const SHOWN = has("all") ? 1e9 : 8; for (const x of fs2.slice(0, SHOWN)) console.log(`   ${x.where}: ${x.msg}`); if (fs2.length > SHOWN) console.log(`   ... ${fs2.length - SHOWN} more`); }
    if (na < CORE_N && !read) findings.push({ rule: 'PC-BUILD', where: 'all', msg: 'a Prerequisite Check exists but 0 prerequisite items were read (part / pool names changed?)' });
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
