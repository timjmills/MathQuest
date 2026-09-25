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

/** The three samples the owner asked for (2026-09-25), with the options that make each one. */
const LESSONS = [
    { id: 'add', dir: 'add-within-10', skill: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 10 } } },
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
        const out = { pages: 0, problems: [], fonts: {} };
        document.querySelectorAll('.ws-page').forEach((pg, i) => {
            out.pages++;
            const body = pg.querySelector('.ws-body');
            if (body && body.scrollHeight > body.clientHeight + 1) out.problems.push(`page ${i + 1}: the body overflows by ${((body.scrollHeight - body.clientHeight) * 25.4 / 96).toFixed(1)} mm`);
            pg.querySelectorAll('.ws-cell').forEach((c, k) => {
                if (c.scrollHeight > c.clientHeight + 1 || c.scrollWidth > c.clientWidth + 1) out.problems.push(`page ${i + 1} cell ${k + 1}: content overflows its cell (${((c.scrollHeight - c.clientHeight) * 25.4 / 96).toFixed(1)} mm)`);
            });
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
    const app = await open({ seed: 1 });
    const { page } = app;
    const summary = [];
    for (const l of LESSONS) {
        for (const size of SIZES) {
            const dir = path.join(OUT, l.dir, size);
            fs.rmSync(dir, { recursive: true, force: true });
            fs.mkdirSync(dir, { recursive: true });
            const built = await page.evaluate(async ({ skill, size, PRACTICE }) => {
                try {
                    const r = await window.buildSheet({ role: 'lesson', sections: [{ skills: [skill] }], size, paper: 'A4', seed: 4242, key: true, practicePages: PRACTICE, mixed: true });
                    return {
                        pupil: window.sheetDocument(r.pupilHtml, r.title, { paper: 'A4' }),
                        key: window.sheetDocument(r.keyHtml, `${r.title} - Answer Key`, { paper: 'A4' }),
                        pageCount: r.pageCount, keyPageCount: r.keyPageCount, fits: r.fits, notes: r.notes, gaps: r.gaps, lesson: r.lesson, title: r.title,
                        meta: r.plan && r.plan.meta,
                        items: r.items.map((it) => ({ part: it.part, pool: it.pool, template: it.template, text: String(it.text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 60), ans: typeof it.ans === 'object' ? JSON.stringify(it.ans) : String(it.ans) })),
                    };
                } catch (e) { return { error: (e && e.stack) || String(e) }; }
            }, { skill: l.skill, size, PRACTICE });
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
