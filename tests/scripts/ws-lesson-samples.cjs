// Render the SAMPLE LESSONS (design/LESSONS_VISION.md, js/modules/sheet/roles/lesson.js) through
// window.buildSheet({role: 'lesson', ...}) and rasterise every pupil page and every key page.
//
//   node tests/scripts/ws-lesson-samples.cjs                       # the three samples at L and S
//   node tests/scripts/ws-lesson-samples.cjs --sizes L --only add  # one lesson, one size
//   node tests/scripts/ws-lesson-samples.cjs --seed 1001           # another seed (default 4242)
//   node tests/scripts/ws-lesson-samples.cjs --copy                # also copy the PNGs for the owner
//                                                                  # to design/lesson-samples/<skill>/
//
// Writes under tests/audit-runs/lessons/<skill>/<size>/: pupil-p1.png ..., key-p1.png ...,
// chart-grey.png (the anchor chart page in greyscale: the accent colour must survive a
// black-and-white copy), meta.json (the lesson's tags, prerequisites, steps, parts, and the
// overflow / font check of every page). Needs python3 with PyMuPDF. Not a gate: a render.
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
const SEED = parseInt(arg('seed', '4242'), 10) >>> 0;

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

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const app = await open({ seed: 1, lock: 'ws-lesson-samples' });
    const { page } = app;
    const summary = [];
    for (const l of LESSONS) {
        for (const size of SIZES) {
            const dir = path.join(OUT, l.dir, size);
            fs.rmSync(dir, { recursive: true, force: true });
            fs.mkdirSync(dir, { recursive: true });
            const built = await page.evaluate(async ({ skill, size, PRACTICE, SEED }) => {
                try {
                    const r = await window.buildSheet({ role: 'lesson', sections: [{ skills: [skill] }], size, paper: 'A4', seed: SEED, key: true, practicePages: PRACTICE, mixed: true });
                    return {
                        pupil: window.sheetDocument(r.pupilHtml, r.title, { paper: 'A4' }),
                        key: window.sheetDocument(r.keyHtml, `${r.title} - Answer Key`, { paper: 'A4' }),
                        pageCount: r.pageCount, keyPageCount: r.keyPageCount, fits: r.fits, notes: r.notes, gaps: r.gaps, lesson: r.lesson, title: r.title,
                        meta: r.plan && r.plan.meta,
                        items: r.items.map((it) => ({ part: it.part, pool: it.pool, template: it.template, text: String(it.text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 60), ans: typeof it.ans === 'object' ? JSON.stringify(it.ans) : String(it.ans) })),
                    };
                } catch (e) { return { error: (e && e.stack) || String(e) }; }
            }, { skill: l.skill, size, PRACTICE, SEED });
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
