// js/modules/sheet/roles/lesson-warmup.check.cjs
// BACKTEST for the lesson Warm-up rows (pilot SU-C critic r2 N2, RUBRIC H13): every Warm-up cell
// sits in a row sized for its OWN kind of item, so no cell leaves an empty band of more than 40 %
// of its height (an across fact "7 - 3 = ___" in a row sized for a stack or a place-value item
// left 43-59 %). It also prints the lesson's page count, which the fix must not raise.
//   node js/modules/sheet/roles/lesson-warmup.check.cjs                 -> `lesson-warmup check: OK` / `FAIL`
//   node js/modules/sheet/roles/lesson-warmup.check.cjs --skills a:b,c:d --sizes S,M,L --max 0.4
// The band is measured as ws-print-lint L-DENSITY H13 measures it: the content box (every visible
// in-flow descendant, labels excluded) inside the cell's padding; the band is the larger of the
// gaps above and below it, over the cell's height; the width band likewise from the gaps left and
// right of it, over the cell's width (--hmax, default 0.3).
const path = require('path');
process.removeAllListeners('warning');
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const SKILLS = arg('skills', [
    'subtraction:sub_50_no_regroup', 'subtraction:sub_100_no_regroup', 'subtraction:sub_1k_no_regroup',
    'subtraction:sub_10k_no_regroup', 'subtraction:sub_100k_no_regroup', 'subtraction:sub_1m_no_regroup',
    'subtraction:sub_2d_1d', 'subtraction:sub_100_regroup', 'addition:add_100_regroup',
].join(',')).split(',');
const SIZES = arg('sizes', 'S,L').split(',');
const MAX = Number(arg('max', '0.4'));
// the width band (H13 width, the lint's 30 %): a narrow item pinned in a half-page cell
const HMAX = Number(arg('hmax', '0.3'));
// --fixture across: the lesson data as critic r2 graded it - the facts10 prerequisite drawn ACROSS and
// no `warmRows` - which put a one-line fact in a row sized for the stack or place-value item beside
// it (58-59 % empty on the 2-digit lessons). Default: both the live data and the fixture are run.
const FIXTURE = arg('fixture', 'both');
const sk = (id) => { const [categoryId, skillId] = id.split(':'); return { categoryId, skillId }; };

function measureInPage() {
    const PX = 96 / 25.4;
    const visible = (d) => { const s = getComputedStyle(d); return s.display !== 'none' && s.visibility !== 'hidden'; };
    const out = [];
    for (const c of document.querySelectorAll('.mq-lwarmcol .ws-cell')) {
        const cr = c.getBoundingClientRect();
        if (cr.height < 12 * PX) continue;
        const cs = getComputedStyle(c);
        const it = cr.top + parseFloat(cs.paddingTop), ib = cr.bottom - parseFloat(cs.paddingBottom);
        const il = cr.left + parseFloat(cs.paddingLeft), ir = cr.right - parseFloat(cs.paddingRight);
        let t = Infinity, b = -Infinity, l = Infinity, rr = -Infinity;
        for (const d of c.querySelectorAll('*')) {
            if (!visible(d) || d.closest('[data-ws-label], .ws-letter, .ws-tab, .ws-modeltab, .ws-legacy-answer')) continue;
            if (getComputedStyle(d).position === 'absolute') continue;
            const r = d.getBoundingClientRect();
            if (!r.width || !r.height) continue;
            if (d.children.length && !(d instanceof SVGElement) && !d.textContent.trim() && !/^(svg|img|canvas)$/i.test(d.tagName)) {
                const bs = getComputedStyle(d);
                if (!(parseFloat(bs.borderTopWidth) || parseFloat(bs.borderBottomWidth))) continue;
            }
            t = Math.min(t, r.top); b = Math.max(b, r.bottom); l = Math.min(l, r.left); rr = Math.max(rr, r.right);
        }
        if (t === Infinity) continue;
        const band = Math.max(t - it, ib - b, 0);
        // `empty`: all the height the content leaves (above + below), over the cell's height - in a
        // centred cell the larger band is half of it, so this is the stricter reading of H13.
        const empty = Math.max(0, (ib - it) - (b - t));
        out.push({ text: c.textContent.replace(/\s+/g, ' ').trim().slice(0, 24), hMm: +(cr.height / PX).toFixed(1), cMm: +((b - t) / PX).toFixed(1), band: +(band / cr.height).toFixed(3), hband: +(Math.max(l - il, ir - rr, 0) / cr.width).toFixed(3), wMm: +(cr.width / PX).toFixed(1), empty: +(empty / cr.height).toFixed(3) });
    }
    return out;
}

(async () => {
    const app = await open({ seed: 12345 });
    const fails = [];
    try {
        const runs = [];
        for (const id of SKILLS) for (const fx of (FIXTURE === 'both' ? ['live', 'across'] : [FIXTURE])) {
            if (fx === 'across' && !/no_regroup|sub_2d_1d/.test(id)) continue;
            for (const size of SIZES) runs.push({ id, fx, size });
        }
        for (const { id, fx, size } of runs) {
            {
                const built = await app.page.evaluate(async ({ s, size, fx, key }) => {
                    try {
                        let lessonData;
                        if (fx === 'across') {
                            const { LESSONS } = await import('./js/modules/lessons/prereqs.js');
                            const d = LESSONS[key];
                            if (!d) return { skip: true };
                            lessonData = Object.assign({}, d, { warmRows: undefined, skills: d.skills.map((x) => (x.key === 'subtraction:subtract' ? Object.assign({}, x, { opts: Object.assign({}, x.opts, { notation: ['across'] }) }) : x)) });
                        }
                        const r = await window.buildSheet(Object.assign({ role: 'lesson', sections: [{ skills: [s] }], size, seed: 4242, key: true }, lessonData ? { lessonData } : {}));
                        return { html: window.sheetDocument(r.pupilHtml, 'Lesson'), pages: r.pageCount };
                    } catch (e) { return { error: String((e && e.stack) || e) }; }
                }, { s: sk(id), size, fx, key: id });
                if (built.skip) continue;
                if (built.error) { fails.push(`${id} ${size}: ${built.error.slice(0, 200)}`); continue; }
                const pg = await app.browser.newPage();
                await pg.setViewport({ width: 900, height: 1200 });
                await pg.goto(app.page.url(), { waitUntil: 'domcontentloaded' });
                await pg.setContent(built.html, { waitUntil: 'networkidle0', timeout: 60000 });
                await pg.evaluate(() => document.fonts && document.fonts.ready);
                const cells = await pg.evaluate(measureInPage);
                await pg.close();
                const worst = cells.reduce((a, c) => Math.max(a, c.band), 0);
                const worstE = cells.reduce((a, c) => Math.max(a, c.empty), 0);
                const worstH = cells.reduce((a, c) => Math.max(a, c.hband), 0);
                const ok = cells.length > 0 && worst <= MAX && worstH <= HMAX;
                console.log(`${ok ? 'ok  ' : 'FAIL'} ${id} ${fx} ${size}: pages ${built.pages}, ${cells.length} warm-up cells, worst band ${Math.round(worst * 100)} % (empty ${Math.round(worstE * 100)} %), worst width band ${Math.round(worstH * 100)} % [${cells.map((c) => `${c.text.slice(0, 12)}:${c.cMm}/${c.hMm}mm band ${Math.round(c.band * 100)}% empty ${Math.round(c.empty * 100)}% w ${c.wMm}mm/${Math.round(c.hband * 100)}%`).join(' | ')}]`);
                if (!ok) fails.push(`${id} ${fx} ${size}: worst band ${Math.round(worst * 100)} %, width band ${Math.round(worstH * 100)} %${cells.length ? '' : ' (no warm-up cells)'}`);
            }
        }
        if (app.problems.length) fails.push(`console: ${app.problems.slice(0, 3).map((p) => p.text).join(' | ')}`);
    } finally { await app.close(); }
    if (fails.length) { console.log('lesson-warmup check: FAIL'); fails.forEach((f) => console.log('  - ' + f)); process.exit(1); }
    console.log('lesson-warmup check: OK');
})();
