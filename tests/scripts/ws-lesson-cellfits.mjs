// CELL-FITS (lead via lf-engine, 2026-11-20): no cell ink falls outside its panel or its page, on any lesson page. Judged on
// the RENDER with bounding boxes, never on the plan's figures. Found by the owner's review of the two_step_letter_equation
// lesson Model page (M, seed 4242): its full-width story / bar / equation drawings were laid into the half-width 2 x 2
// panels of the anchor chart, and "= n" ran past the page edge into the Say band and the footer.
//
//   CELL-FITS  every `.ws-cell` box of a lesson page (a content cell, an anchor-chart panel, a Guided / Warm-up cell): each
//              piece of ink inside it - a text run (its Range rects), an svg shape, an img, a drawn border or fill - lies
//              inside the box, and inside the `.ws-page`, within TOL_MM. Ink in a nested box is judged against its NEAREST box.
//
//   node tests/scripts/ws-lesson-cellfits.mjs --self-test                 # the rule on planted boxes (node, no browser)
//   node tests/scripts/ws-lesson-cellfits.mjs                             # every library lesson (lessons/library.js LESSONS) x M, L
//   node tests/scripts/ws-lesson-cellfits.mjs --lessons id,id --sizes M   # some lessons / sizes
//   node tests/scripts/ws-lesson-cellfits.mjs --skills cat:skill,...      # by skill (the skill's default lesson)
//   node tests/scripts/ws-lesson-cellfits.mjs --dump out.json             # ... and write the measured boxes (the overflows only)
//   node tests/scripts/ws-lesson-cellfits.mjs --fixture f.json            # the rule on a dump (backtest fixtures)
//   --seed n (default 4242)   --key (also the answer-key pages)   --report-only (never exit 1)
// Prints `ws-lesson-cellfits: OK (n lessons, n pages, n boxes)` / `ws-lesson-cellfits: FAIL (n findings)`.
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const arg = (k, d = null) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const TOOL = 'ws-lesson-cellfits';
export const TOL_MM = 0.6;

/* ------------------------------------------------------------------ the rule (pure) */
/** A page summary: {boxes: [{box: {l,t,r,b}, ink: [{l,t,r,b,what}]}], page: {l,t,r,b}} in mm. → [{what, side, mm}] */
export function outside(box, ink, tol = TOL_MM) {
    const out = [];
    for (const [side, d] of [['left', box.l - ink.l], ['right', ink.r - box.r], ['top', box.t - ink.t], ['bottom', ink.b - box.b]]) if (d > tol) out.push({ side, mm: +d.toFixed(1) });
    return out;
}
export function judgePage(pg, tol = TOL_MM) {
    const found = [];
    for (const bx of pg.boxes || []) for (const ink of bx.ink || []) {
        const o = outside(bx.box, ink, tol);
        if (o.length) found.push({ kind: 'panel', box: bx.name || '', what: ink.what, sides: o });
        if (pg.page) { const p = outside(pg.page, ink, tol); if (p.length) found.push({ kind: 'page', box: bx.name || '', what: ink.what, sides: p }); }
    }
    return found;
}
export function judge(lessons) {
    const out = [];
    for (const l of lessons) for (const pg of l.pages || []) {
        const f = judgePage(pg);
        if (!f.length) continue;
        const panel = f.filter((x) => x.kind === 'panel'), page = f.filter((x) => x.kind === 'page');
        const worst = Math.max(...f.flatMap((x) => x.sides.map((s) => s.mm)));
        out.push({ id: l.id, size: l.size, page: pg.n, sheet: pg.sheet, msg: `${l.id} ${l.size} ${pg.sheet || ''} p${pg.n}: ${panel.length} ink piece(s) outside their panel${page.length ? `, ${page.length} outside the page` : ''} (worst ${worst} mm; e.g. "${String(f[0].what).slice(0, 40)}" ${f[0].sides.map((s) => `${s.side} ${s.mm} mm`).join(', ')} in ${f[0].box})` });
    }
    return out;
}

/* ------------------------------------------------------------------ the self-test */
function selfTest() {
    const B = { l: 0, t: 0, r: 90, b: 100 }, P = { l: -10, t: -10, r: 200, b: 280 };
    const pg = (ink) => ({ n: 1, page: P, boxes: [{ name: 'panel', box: B, ink }] });
    const cases = [
        ['ink inside its panel passes', pg([{ l: 2, t: 2, r: 88, b: 98, what: 'a' }]), 0],
        ['ink within the tolerance passes', pg([{ l: -0.4, t: 0, r: 90.5, b: 100, what: 'a' }]), 0],
        ['ink past the right edge fails', pg([{ l: 10, t: 10, r: 120, b: 20, what: '= n' }]), 1],
        ['ink below the panel fails', pg([{ l: 10, t: 90, r: 20, b: 112, what: 'bar' }]), 1],
        ['ink past the page fails twice (panel and page)', pg([{ l: 10, t: 10, r: 230, b: 20, what: '= n' }]), 2],
    ];
    const bad = [];
    for (const [name, p, want] of cases) { const got = judgePage(p).length; if (got !== want) bad.push(`${name}: ${got}, want ${want}`); }
    for (const b of bad) console.log(`  FAIL ${b}`);
    console.log(bad.length ? `${TOOL} --self-test: FAIL (${bad.length} of ${cases.length})` : `${TOOL} --self-test: OK (${cases.length} cases)`);
    return bad.length ? 1 : 0;
}

/* ------------------------------------------------------------------ the measurement (browser) */
async function measure({ lessonIds, skills, sizes, seed, withKey }) {
    const require = createRequire(import.meta.url);
    const H = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
    const app = await H.open({ seed: 1 });
    try {
        const ids = skills ? skills.map((k) => ({ skill: k })) : (lessonIds || await app.page.evaluate(async () => Object.keys((await import(new URL('js/modules/lessons/library.js', location.href).href)).LESSONS))).map((id) => ({ id }));
        const out = [];
        for (const l of ids) for (const size of sizes) {
            const r = await app.page.evaluate(async ({ l, size, seed, withKey }) => {
                const req = { role: 'lesson', size, paper: 'A4', seed, key: true, practicePages: 1, mixed: true };
                if (l.id) req.lessonId = l.id;
                else { const [categoryId, skillId] = l.skill.split(':'); req.sections = [{ skills: [{ categoryId, skillId, opts: {} }] }]; }
                let res;
                try { res = await window.buildSheet(req); } catch (e) { return { error: String((e && e.message) || e) }; }
                const host = document.createElement('div');
                host.style.cssText = 'position:absolute;left:0;top:0;width:210mm;visibility:visible';
                host.innerHTML = String(res.pupilHtml || '') + (withKey ? String(res.keyHtml || '') : '');
                document.body.appendChild(host);
                const pxMm = (() => { const d = document.createElement('div'); d.style.width = '100mm'; host.appendChild(d); const w = d.getBoundingClientRect().width / 100; d.remove(); return w; })();
                const R = (r) => ({ l: r.left / pxMm, t: r.top / pxMm, r: r.right / pxMm, b: r.bottom / pxMm });
                const SKIP = /^(STYLE|SCRIPT|TEMPLATE)$/;
                const pages = [...host.querySelectorAll('.ws-page')].map((pg, n) => {
                    const boxes = [];
                    for (const cell of pg.querySelectorAll('.ws-cell')) {
                        const ink = [];
                        const own = (e) => (e.closest('.ws-cell') === cell);
                        const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
                        for (let t = walker.nextNode(); t; t = walker.nextNode()) {
                            if (!t.textContent.trim() || !t.parentElement || !own(t.parentElement) || SKIP.test(t.parentElement.tagName)) continue;
                            const cs = getComputedStyle(t.parentElement);
                            if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
                            const rg = document.createRange(); rg.selectNodeContents(t);
                            for (const rc of rg.getClientRects()) if (rc.width > 0.5 && rc.height > 0.5) ink.push(Object.assign(R(rc), { what: t.textContent.trim().slice(0, 40) }));
                        }
                        for (const e of cell.querySelectorAll('*')) {
                            if (!own(e) || SKIP.test(e.tagName) || e.closest('svg') && e.tagName.toLowerCase() !== 'svg' && !/^(path|line|rect|circle|ellipse|polygon|polyline|text)$/i.test(e.tagName)) continue;
                            const rc = e.getBoundingClientRect();
                            if (rc.width < 0.5 && rc.height < 0.5) continue;
                            const tag = e.tagName.toLowerCase();
                            if (e.closest('svg')) { if (tag !== 'svg') ink.push(Object.assign(R(rc), { what: `<${tag}>` })); continue; }
                            if (tag === 'img' || tag === 'canvas') { ink.push(Object.assign(R(rc), { what: `<${tag}>` })); continue; }
                            const cs = getComputedStyle(e);
                            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
                            const border = ['Top', 'Right', 'Bottom', 'Left'].some((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== 'none' && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs[`border${s}Color`]));
                            const fill = cs.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent|rgb\(255, 255, 255\)/.test(cs.backgroundColor);
                            if (border || fill) ink.push(Object.assign(R(rc), { what: `<${tag}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''}> frame` }));
                        }
                        boxes.push({ name: `${cell.getAttribute('data-ws-cell') || ''}.${[...cell.classList].slice(0, 3).join('.')}`, box: R(cell.getBoundingClientRect()), ink });
                    }
                    return { n: n + 1, sheet: pg.getAttribute('data-ws-sheet') || '', page: R(pg.getBoundingClientRect()), boxes };
                });
                host.remove();
                return { pages };
            }, { l, size, seed, withKey });
            const id = l.id || l.skill;
            if (r.error) { out.push({ id, size, error: r.error, pages: [] }); continue; }
            out.push({ id, size, pages: r.pages });
        }
        return out;
    } finally { await app.close(); }
}

/* ------------------------------------------------------------------ main */
async function main() {
    if (has('self-test')) return selfTest();
    let lessons;
    if (arg('fixture')) lessons = JSON.parse(fs.readFileSync(path.resolve(arg('fixture')), 'utf8')).lessons || [];
    else lessons = await measure({
        lessonIds: arg('lessons') ? arg('lessons').split(',') : null, skills: arg('skills') ? arg('skills').split(',') : null,
        sizes: (arg('sizes', 'M,L')).split(','), seed: Number(arg('seed', '4242')), withKey: has('key'),
    });
    const found = judge(lessons.filter((l) => !l.error));
    const errs = lessons.filter((l) => l.error);
    if (arg('dump')) {
        // (a dump keeps only the boxes with ink outside, and that ink: small enough to commit as a fixture)
        const slim = lessons.map((l) => Object.assign({}, l, { pages: (l.pages || []).map((pg) => Object.assign({}, pg, { boxes: pg.boxes.map((bx) => Object.assign({}, bx, { ink: bx.ink.filter((k) => outside(bx.box, k).length || outside(pg.page, k).length) })).filter((bx) => bx.ink.length) })) }));
        fs.writeFileSync(path.resolve(arg('dump')), JSON.stringify({ about: `${TOOL} measured boxes (overflowing ink only)`, lessons: slim }) + '\n');
    }
    for (const e of errs) console.log(`  ERROR ${e.id} ${e.size}: ${e.error}`);
    for (const f of found) console.log(`  FAIL CELL-FITS ${f.msg}`);
    const pages = lessons.reduce((a, l) => a + (l.pages || []).length, 0);
    const boxes = lessons.reduce((a, l) => a + (l.pages || []).reduce((b, p) => b + (p.boxes || []).length, 0), 0);
    const n = found.length + errs.length;
    console.log(n ? `${TOOL}: FAIL (${found.length} page(s) with ink outside, ${errs.length} error(s); ${lessons.length} lesson builds)` : `${TOOL}: OK (${lessons.length} lesson builds, ${pages} pages, ${boxes} boxes)`);
    return n && !has('report-only') ? 1 : 0;
}
main().then((c) => process.exit(c), (e) => { console.log(`${TOOL}: FAIL (${e && e.stack || e})`); process.exit(1); });
