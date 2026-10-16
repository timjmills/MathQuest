// Render a DETAILED LESSON pack (js/modules/lessons/detailed/, print-sheet.js buildDetailedLesson;
// design/lesson-planner/DETAILED_MAKER.md) in Chromium print media (A4) and, with --check, run the
// Atomisation Lesson Planner V22 Appendix E self-check on it.
//
//   node tests/scripts/ws-detailed-lesson.cjs --lesson g2-nbt3-read-write-1000            # render
//   node tests/scripts/ws-detailed-lesson.cjs --lesson <id> --seed 4242 --out <dir>      # elsewhere
//   node tests/scripts/ws-detailed-lesson.cjs --lesson <id> --check                      # GATE
//   node tests/scripts/ws-detailed-lesson.cjs --lesson <id> --check --copy               # + copy for the owner
//
// Writes pack.html, pack.pdf, page-NN.png (PyMuPDF raster, like ws-lesson-samples) and, with
// --check, SELF-CHECK.md (the table format of design/lesson-planner/sample-v22/SELF-CHECK.md) to
// --out (default tests/audit-runs/detailed/<id>/). --copy copies them to
// design/lesson-samples/detailed/<id>/. The gate prints `ws-detailed-lesson: OK` / `FAIL` and exits
// non-zero on a failed check.
//
// THE CHECKS are V22 Appendix E's (its `js v21-selfcheck` reference implementation), ported to the
// kit's markup: `.ws-page` (data-dl-page / data-dl-kind written by the bridge), `.ws-body`, `.ws-tabbox`,
// `.ws-copy`, `.ws-title`, `.ws-instrline` (instructions), `.ws-band--say`, `[data-ws-slot]` (slots,
// ungraded tick boxes and Say blanks excluded where V22 excludes them), `.ws-cell`, `[data-ws-key-ans]` /
// `[data-ka]` (answer marks), `[data-mq-accent]` (step marks). E11 / E9b are the site's own sheetCheck
// (ws-lesson-samples.cjs H13 and its body-blank lint), reused line for line. E24 / E24b read the pool
// JSON (`#v21-pool`), whose `places` list is the kit's equivalent of V22's data-item / data-rep /
// data-row hooks (the bridge knows every dealt item and its page; the kit's cells do not carry them).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ROOT, open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes('--' + k);
const LESSON = arg('lesson', 'g2-nbt3-read-write-1000');
const SEED = parseInt(arg('seed', '4242'), 10);
const OUT = path.resolve(ROOT, arg('out', `tests/audit-runs/detailed/${LESSON}`));
const DPI = parseInt(arg('dpi', '110'), 10);
const V22 = path.join(ROOT, 'design/lesson-planner/Atomisation_Lesson_Planner_V22.md');

const RASTER_PY = `
import sys, json, pymupdf
src, outdir, dpi = sys.argv[1], sys.argv[2], int(sys.argv[3])
d = pymupdf.open(src)
out = []
for i, p in enumerate(d):
    name = 'page-%02d.png' % (i + 1)
    p.get_pixmap(dpi=dpi).save(outdir + '/' + name)
    out.append({'file': name, 'w': round(p.rect.width, 2), 'h': round(p.rect.height, 2)})
print(json.dumps(out))
`;

/* ------------------------------------------------------------------ the measurements */
// Runs in the page. Ported from V22 Appendix E `js v21-selfcheck` (and ws-lesson-samples sheetCheck).
function measure(LIBRARY) {
    const MM = 96 / 25.4, PT = 96 / 72;
    const rgb = (c) => { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(',').map((x) => parseFloat(x));
        if (v.length === 4 && v[3] === 0) return null; return '#' + v.slice(0, 3).map((n) => Math.round(n).toString(16).padStart(2, '0')).join(''); };
    const PRINT_VERBS = ['Look', 'Read', 'Say', 'Count', 'Circle', 'Underline', 'Box', 'Cross out', 'Trace', 'Write', 'Draw', 'Shade', 'Mark', 'Match', 'Measure', 'Use', 'Find', 'Fill in', 'Finish', 'Check', 'Fix', 'Think', 'Start', 'Put', 'Move', 'Add', 'Subtract', 'Multiply', 'Divide', 'Solve', 'Round', 'Compare', 'Estimate', 'Regroup', 'Bring down', 'Cut', 'Sort', 'Glue', 'Color'];
    const emojiRe = /[\p{Extended_Pictographic}\u{1F000}-\u{1FAFF}]/u, allowed = new Set(['©', '★', '®', '™']);
    const pages = [...document.querySelectorAll('body > section.ws-page')];
    const out = { fonts: { a700: document.fonts.check('700 28px Andika'), a400: document.fonts.check('400 15px Andika') }, pages: [] };
    const QUIET = '[data-ws-label], .ws-letter, .ws-foot, .ws-tabbox, .dl-thumb';
    for (const pg of pages) {
        const id = pg.dataset.dlPage || '?', kind = pg.dataset.dlKind || 'pupil';
        const teacher = kind === 'teacher', key = kind === 'key' || pg.classList.contains('ws-key');
        const P = { id, kind, teacher, key };
        const all = [...pg.querySelectorAll('*')].filter((e) => !e.closest('.dl-thumb'));
        // E2 / E6 / E7 fonts and type floor
        let minPt = 99, minWhere = '', nonAndika = 0; const texts = [];
        const w = document.createTreeWalker(pg, NodeFilter.SHOW_TEXT); let t;
        while ((t = w.nextNode())) {
            if (!t.textContent.trim() || t.parentElement.closest('.dl-thumb, style, script')) continue;
            const el = t.parentElement, cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            texts.push(t);
            if (!/Andika/.test(cs.fontFamily.split(',')[0])) nonAndika++;
            const svg = el.closest('svg'); const scale = svg && el instanceof SVGElement && el.getScreenCTM() ? el.getScreenCTM().a : 1;
            const v = parseFloat(cs.fontSize) * scale / PT;
            if (!el.closest(QUIET) && v < minPt) { minPt = v; minWhere = t.textContent.trim().slice(0, 30); }
        }
        P.minPt = Math.round(minPt * 100) / 100; P.minWhere = minWhere; P.nonAndika = nonAndika;
        P.emoji = texts.flatMap((x) => [...x.textContent].filter((ch) => emojiRe.test(ch) && !allowed.has(ch))).length;
        // E3 / E4 paints
        const paints = {}; const bad = [];
        const add = (c, e, prop) => { if (!c) return; paints[c] = (paints[c] || 0) + 1;
            const ok = c === '#000000' || c === '#ffffff' || c === '#949494'
                || (c === '#5b2a86' && (e.closest('[data-mq-accent], .mq-lnum') || e.closest('[data-mq-accent]')))
                || (c === '#c2410c' && (e.closest('[data-ka], .dl-ka, [data-ws-key-ans], [data-ws-key-add], [data-ws-ink]') && (key || teacher)));
            if (!ok) bad.push(`${prop} ${c} on <${e.tagName.toLowerCase()} class="${(e.getAttribute('class') || '').slice(0, 40)}">`); };
        for (const e of all) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            if (e instanceof SVGElement) { if (e.tagName === 'svg' || e.tagName === 'g') continue;
                if (cs.fill !== 'none') add(rgb(cs.fill), e, 'fill'); if (cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0) add(rgb(cs.stroke), e, 'stroke'); continue; }
            if ([...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) add(rgb(cs.color), e, 'color');
            add(rgb(cs.backgroundColor), e, 'background');
            for (const s of ['Top', 'Right', 'Bottom', 'Left']) if (parseFloat(cs['border' + s + 'Width']) > 0 && cs['border' + s + 'Style'] !== 'none') add(rgb(cs['border' + s + 'Color']), e, 'border');
            if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) add(rgb(cs.outlineColor), e, 'outline'); }
        P.paints = paints; P.bad = bad.slice(0, 4); P.badCount = bad.length;
        // E14 dashes: only the cut line (data-cut / .ws-cut) and the missing-digit box
        P.dashed = all.filter((e) => { const cs = getComputedStyle(e);
            if (e instanceof SVGElement) { const dd = e.getAttribute('stroke-dasharray'); return dd && !/^0[ ,]/.test(dd.trim()) && !e.closest('[data-cut], [data-ws-cut]'); }
            return ['Top', 'Right', 'Bottom', 'Left'].some((s) => cs['border' + s + 'Style'] === 'dashed' && parseFloat(cs['border' + s + 'Width']) > 0)
                && !e.closest('[data-cut], [data-ws-cut]') && !e.classList.contains('ws-box--unknown'); }).length;
        // E13 underscores (pupil text, footer excepted)
        P.underscores = teacher ? 0 : texts.filter((x) => /_/.test(x.textContent) && !x.parentElement.closest('.ws-foot')).length;
        // E18 frame, E19 title
        const copy = pg.querySelector('.ws-copy');
        P.copy = !!copy && /© 20\d\d Cultivating the Digital\. All rights reserved\./.test(copy.textContent);
        P.tabs = pg.querySelectorAll('.ws-tabbox').length;
        P.titles = [...pg.querySelectorAll('.ws-title')].filter((e) => !e.closest('.dl-thumb')).map((e) => e.textContent.trim()).filter(Boolean);
        // E15 instructions
        // Instructions: instruction lines and the instruction beside a pupil band label (an
        // `Another example:` caption, `Rule:` chant and `Say:` frame are not instructions).
        P.instr = [...pg.querySelectorAll('.ws-instrline, .ws-strip > span:not(.ws-sayframe)')].filter((e) => !e.closest('.dl-thumb') && e.textContent.trim()
            && !/^(Another example|Rule|Say|Remember):/.test(((e.parentElement && e.parentElement.querySelector(':scope > b')) || {}).textContent || '')).map((e) => {
            const s = e.textContent.trim().replace(/\s+/g, ' ').replace(/__\/\d+$/, '').trim();
            const words = s.split(' ').length;
            const verbs = s.split(/(?<=[.?])\s+/).every((x) => PRINT_VERBS.some((v) => x.startsWith(v + ' ') || x.startsWith(v + '.')));
            const lib = LIBRARY.some((l) => new RegExp('^' + l.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\\{[a-z]+\\\}|\{[a-z]+\}/g, '.+') + '$').test(s));
            return { s, words, verbs, lib }; });
        // E16 say blanks
        P.sayBlanks = [...pg.querySelectorAll('.ws-band--say')].map((e) => e.querySelectorAll('.ws-line').length);
        // E17 slots (Say blanks excluded: said, not written; a Workspace drawing is not a slot)
        P.slots = [...pg.querySelectorAll('[data-ws-slot]')].filter((e) => !e.closest('.dl-thumb') && !e.closest('.ws-band--say') && !e.closest('[data-work]')).length;
        P.graded = [...pg.querySelectorAll('[data-ws-slot]')].filter((e) => !e.closest('.dl-thumb') && !e.closest('.ws-band--say') && e.getAttribute('data-ws-graded') !== '0').length;
        // E9 / E9b
        const body = pg.querySelector(':scope > .ws-body').getBoundingClientRect();
        let maxBottom = body.top;
        const inkEls = [...pg.querySelector(':scope > .ws-body').querySelectorAll('*')].filter((e) => !e.closest('.dl-thumb') || e.classList.contains('dl-thumb'));
        for (const e of inkEls) { const r = e.getBoundingClientRect(); if (!r.height) continue;
            const leaf = e instanceof SVGElement || e.hasAttribute('data-ws-slot') || [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
            if (leaf) maxBottom = Math.max(maxBottom, r.bottom); }
        P.usedPct = Math.round((maxBottom - body.top) / body.height * 100);
        const bodyEl = pg.querySelector(':scope > .ws-body');
        const kids = [...bodyEl.children].filter((x) => x.getBoundingClientRect().height > 0);
        const last = kids.length ? Math.max(...kids.map((x) => x.getBoundingClientRect().bottom)) : body.top;
        P.bottomBlank = Math.max(0, Math.round((body.bottom - last) / body.height * 100));
        P.overflow = bodyEl.scrollHeight > bodyEl.clientHeight + 1 ? Math.round((bodyEl.scrollHeight - bodyEl.clientHeight) / MM) : 0;
        // E10 / E11 cells (sheetCheck H13 line for line; E10 1 mm raster of ink)
        const gridIds = new Map();
        P.cells = [...pg.querySelectorAll('.ws-cell')].filter((c) => !c.closest('.dl-thumb')).map((c) => {
            const gEl = c.closest('.ws-grid') || c.parentElement; if (!gridIds.has(gEl)) gridIds.set(gEl, gridIds.size);
            const cr = c.getBoundingClientRect();
            let box = null; const rects = [];
            for (const dd of c.querySelectorAll('*')) {
                if (dd.closest('[data-ws-label], .ws-letter')) continue;
                const s = getComputedStyle(dd); if (s.visibility === 'hidden' || s.display === 'none') continue;
                const r = dd.getBoundingClientRect(); if (!r.width || !r.height) continue;
                const leaf = !dd.children.length || dd instanceof SVGElement || /^(svg|img)$/i.test(dd.tagName) || dd.hasAttribute('data-ws-slot');
                const bordered = parseFloat(s.borderTopWidth) || parseFloat(s.borderBottomWidth);
                if (!leaf && !bordered) continue;
                if (leaf) rects.push(r);
                box = box ? { t: Math.min(box.t, r.top), b: Math.max(box.b, r.bottom), l: Math.min(box.l, r.left), r: Math.max(box.r, r.right) } : { t: r.top, b: r.bottom, l: r.left, r: r.right };
            }
            const W = Math.max(1, Math.ceil(cr.width / MM)), H = Math.max(1, Math.ceil(cr.height / MM)), g = new Uint8Array(W * H);
            for (const r of rects) for (let y = Math.max(0, Math.floor((r.top - cr.top) / MM)); y < Math.min(H, Math.ceil((r.bottom - cr.top) / MM)); y++)
                for (let x = Math.max(0, Math.floor((r.left - cr.left) / MM)); x < Math.min(W, Math.ceil((r.right - cr.left) / MM)); x++) g[y * W + x] = 1;
            const ink = g.reduce((a, v) => a + v, 0);
            const small = !box || cr.height < 40 || cr.width < 40;
            const v = box ? Math.max(box.t - cr.top, cr.bottom - box.b, 0) / cr.height : 0;
            const h = box ? Math.max(box.l - cr.left, cr.right - box.r, 0) / cr.width : 0;
            const sec = (c.closest('.ws-band, .ws-grid') || {}).className || '';
            return { w: +(cr.width / MM).toFixed(1), h: +(cr.height / MM).toFixed(1), free: Math.round((1 - ink / (W * H)) * 100), band: Math.round(Math.max(v, h) * 100),
                skip: small, read: !!c.querySelector('[data-read], .ws-story') || !!c.closest('.dl-wppanel, .dl-wpstory'), draw: !!c.querySelector('[data-work], [data-draw]'),
                grid: `${gridIds.get(gEl)}:${gEl.classList.contains('ws-grid') ? 'ws-grid' : ''}`, empty: !rects.length };
        });
        P.bandHs = [...pg.querySelectorAll(':scope > .ws-body > .ws-band')].map((b) => [((b.querySelector(':scope > .ws-strip > b') || {}).textContent || '').slice(0, 14), Math.round(b.getBoundingClientRect().height / MM)]);
        P.bandLabels = [...pg.querySelectorAll('.ws-strip > b')].filter((b) => !b.closest('.dl-thumb')).map((b) => b.textContent.trim());
        P.thumbs = pg.querySelectorAll(':scope .dl-thumb').length;
        P.panelRows = [...pg.querySelectorAll('[data-panel-row]')].map((e) => Math.round(e.getBoundingClientRect().height / MM * 10) / 10);
        P.kaCount = pg.querySelectorAll('[data-ka], [data-ws-key-ans], .ws-key-stamp').length;
        P.perRow = [...pg.querySelectorAll('svg[data-per-row]')].map((e) => +e.dataset.perRow);
        P.halfW = pg.classList.contains('dl-land') ? [...pg.querySelectorAll('.dl-halves > .mq-rowcol')].filter((x) => x.querySelector('.dl-half')).map((x) => Math.round(x.getBoundingClientRect().width / MM * 10) / 10) : [];
        P.sizeMm = [Math.round(pg.getBoundingClientRect().width / MM), Math.round(pg.getBoundingClientRect().height / MM)];
        // E26: chart step panels (the lesson role's state cells) each show a grey mark
        P.panels = /^P2[a-z]?(-key)?$/.test(id) ? [...pg.querySelectorAll('.mq-cstatecell')].map((c) => [...c.querySelectorAll('*')].some((e) => {
            const cs = getComputedStyle(e); if (cs.display === 'none') return false;
            return [cs.color, cs.borderTopColor, cs.fill, cs.stroke, cs.outlineColor].some((v) => rgb(v) === '#949494') && (e.textContent.trim() || e instanceof SVGElement || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.outlineWidth) > 0); })) : [];
        const tables = [...pg.querySelectorAll('table.tt')];
        if (id === 'T2') { P.atoms = tables[0] ? [...tables[0].querySelectorAll('tbody tr')].map((tr) => tr.children[2].textContent.split('·')[0].trim()) : [];
            P.t2stars = tables.slice(0, 2).some((tb) => /★/.test(tb.textContent));
            P.newSteps = tables[1] ? [...tables[1].querySelectorAll('tbody tr')].filter((tr) => /New/.test(tr.children[2].textContent)).length : -1; }
        if (id === 'T1') P.flow = (pg.querySelector('.dl-flow') || {}).textContent || '';
        const glance = tables.find((tb) => /Fade/.test(tb.querySelector('tr').textContent));
        P.fadeRows = glance ? [...glance.querySelectorAll('tbody tr')].map((tr) => /★/.test(tr.lastElementChild.textContent)) : null;
        // E29 (critic D10): the teacher pages' text, and each key cell's letter and answer marks
        if (teacher) { const b0 = pg.querySelector(':scope > .ws-body') || pg; const th = [...b0.querySelectorAll('.dl-thumb')]; th.forEach((t) => { t.dataset.hide = t.style.display; t.style.display = 'none'; });
            P.text = b0.innerText.replace(/\s+/g, ' '); th.forEach((t) => { t.style.display = t.dataset.hide || ''; }); }
        if (key) P.keyCells = [...pg.querySelectorAll('.ws-cell')].filter((c) => !c.closest('.dl-copy, .dl-thumb')).map((c) => ({
            letter: ((c.querySelector('[data-ws-label], .ws-letter') || {}).textContent || '').trim().replace(/\.$/, ''),
            ans: [...c.querySelectorAll('[data-ws-key-ans]')].map((e) => e.textContent.trim()).join(' '),
            marks: [...c.querySelectorAll('[data-ws-key-ans]')].map((e) => e.textContent.trim()),
        })).filter((x) => x.letter);
        out.pages.push(P);
    }
    const pj = document.getElementById('v21-pool'); out.pool = pj ? JSON.parse(pj.textContent) : null;
    return out;
}

/* ------------------------------------------------------------------- E24 (pure, V22) */
// V22 Appendix E `poolCheck`, list form, reading `places` (the kit's data-item hooks).
function poolCheck(POOL) {
    if (!POOL || !Array.isArray(POOL.places) || !POOL.places.length) return { ok: false, msg: 'no pool JSON or no items in the pack' };
    const d = POOL.decl || {};
    const inPool = new Set(POOL.pool), forb = new Set(POOL.forbidden || []);
    const re = d.kind === 'list' ? d.items.map(String) : [];
    const ruleOk = re.length > 0 && re.length === inPool.size && re.every((x) => inPool.has(x));
    const all = POOL.places.filter((x) => !x.copy);
    const usable = inPool.size - forb.size, small = usable < 12;
    const seenRep = new Set(), seenPage = new Set(), first = new Map(), rep = [], soft = [], bad = [], noRep = [];
    const pageOf = (p) => String(p).replace(/-key$/, '');
    const chart = new Set(all.filter((x) => pageOf(x.page) === 'P2').map((x) => x.item)); const chartBack = [];
    for (const x of all) {
        if (pageOf(x.page) !== 'P2' && chart.has(x.item)) chartBack.push(`${x.item} (${x.rep}) ${x.page}`);
        if (!inPool.has(x.item) || forb.has(x.item)) bad.push(`${x.item} ${x.page}`);
        if (!x.rep) noRep.push(`${x.item} ${x.page}`);
        const kr = `${x.item}|${x.rep}`, kp = `${x.item}|${x.page}`;
        if (seenRep.has(kr) || seenPage.has(kp)) rep.push(`${x.item} (${x.rep}) ${x.page}`);
        else if (first.has(x.item)) (small ? soft : rep).push(`${x.item} (${x.rep}) ${x.page}`);
        seenRep.add(kr); seenPage.add(kp); if (!first.has(x.item)) first.set(x.item, x.page);
    }
    return { ok: ruleOk && !bad.length && !noRep.length && !rep.length && !chartBack.length && (small || all.length <= usable),
        msg: `${all.length} places (${first.size} numbers), usable pool ${usable} (pool ${inPool.size} recomputed from its list rule: ${ruleOk ? 'matches' : 'MISMATCH'}); repeats ${rep.length ? rep.join(', ') : 0}; chart examples returning ${chartBack.length ? chartBack.join(', ') : 0}; outside the pool ${bad.length ? bad.join(', ') : 0}; items without a rep ${noRep.length}` };
}

/* ------------------------------------------------------------------------- evaluate */
function evaluate(R, pdfPages, LIB, KIT = []) {
    const pages = R.pages, rows = [];
    const row = (id, check, measured, pass) => rows.push({ id, check, measured, pass: !!pass });
    const pupil = pages.filter((p) => p.kind === 'pupil'), keys = pages.filter((p) => p.kind === 'key'), teach = pages.filter((p) => p.teacher);
    const A4P = (s) => Math.abs(s.w - 595.28) < 1.5 && Math.abs(s.h - 841.89) < 1.5, A4L = (s) => Math.abs(s.w - 841.89) < 1.5 && Math.abs(s.h - 595.28) < 1.5;
    row('E1', 'Paper is A4 (595 × 842 pt; the 2-up exit slip A4 landscape)', `${pdfPages.filter(A4P).length} portrait + ${pdfPages.filter(A4L).length} landscape of ${pdfPages.length}; ${pages.length} pages in the DOM`, pdfPages.length === pages.length && pdfPages.every((s) => A4P(s) || A4L(s)));
    const land = pages.filter((p) => p.halfW.length);
    row('E1b', 'Exit-slip halves 132.5 ± 0.5 mm wide', land.map((p) => `${p.id}: ${p.halfW.join(' / ')}`).join('; ') || 'no exit slip', land.length >= 1 && land.every((p) => p.halfW.length === 2 && p.halfW.every((w) => Math.abs(w - 132.5) <= 0.5)));
    row('E2', 'Andika 400 + 700 loaded and on every text node', `700/28px ${R.fonts.a700}, 400/15px ${R.fonts.a400}; other faces ${pages.reduce((a, p) => a + p.nonAndika, 0)}`, R.fonts.a700 && R.fonts.a400 && pages.every((p) => p.nonAndika === 0));
    const allP = {}; pages.forEach((p) => Object.entries(p.paints).forEach(([c, n]) => { allP[c] = (allP[c] || 0) + n; }));
    const badP = pages.filter((p) => p.badCount);
    row('E3', 'Only #000, #FFF, #949494; accent #5B2A86 only on step marks; key #C2410C only on answer marks', `paints ${Object.keys(allP).sort().join(', ')}; out of place ${badP.reduce((a, p) => a + p.badCount, 0)}${badP.length ? ` (${badP.map((p) => `${p.id}: ${p.bad[0]}`).slice(0, 3).join('; ')})` : ''}`, !badP.length);
    const pupilPaints = [...new Set(pupil.flatMap((p) => Object.keys(p.paints)))].sort();
    row('E4', 'No colour on pupil pages except the accent on step marks', `pupil-page paints: ${pupilPaints.join(', ')}`, pupilPaints.every((c) => ['#000000', '#ffffff', '#949494', '#5b2a86'].includes(c)));
    row('E5', 'No emoji (© and the teacher-page ★ excepted)', `${pages.reduce((a, p) => a + p.emoji, 0)} found`, pages.every((p) => p.emoji === 0));
    const pMin = Math.min(...pages.filter((p) => !p.teacher).map((p) => p.minPt)), tMin = Math.min(...teach.map((p) => p.minPt));
    const pMinAt = pages.filter((p) => !p.teacher && p.minPt === pMin).map((p) => `${p.id} "${p.minWhere}"`).slice(0, 2).join(', ');
    row('E6', 'Pupil text ≥ 11 pt (quiet letters, tab, footer excepted)', `smallest ${pMin} pt (${pMinAt})`, pMin >= 11 - 0.01);
    row('E7', 'Teacher text ≥ 10 pt', `smallest ${tMin} pt (${teach.filter((p) => p.minPt === tMin).map((p) => `${p.id} "${p.minWhere}"`).slice(0, 2).join(', ')})`, tMin >= 10 - 0.01);
    row('E8', 'Working digits 28 pt outside the anchor chart', 'the kit sets --ws-digit 28pt at size L on every pupil page (one size L pack); measured by ws-print-lint --source kit', true);
    // V22 3131: a teacher page is filled to >= 92 % and only what does not fit continues on a 12 mm-header
    // page; that continuation holds whole bands and may be short (it is exempt from 50 % when the page
    // before it is >= 88 % used). Every other page: 50-100 %.
    const contOk = (p) => { const m = /^(T\w+)-(\d+)$/.exec(p.id); if (!m || !p.teacher) return false; const prev = pages.find((x) => x.id === (m[2] === '2' ? m[1] : `${m[1]}-${+m[2] - 1}`)); return !!prev && prev.usedPct >= 88; };
    const used = pages.filter((p) => (p.usedPct < 50 && !contOk(p)) || p.overflow > 0);
    row('E9', 'Every page ≥ 50 % used, nothing past the body', `min ${Math.min(...pages.map((p) => p.usedPct))} %; overflow ${pages.filter((p) => p.overflow).map((p) => `${p.id} +${p.overflow} mm`).join(', ') || 'none'}; under 50 %: ${pages.filter((p) => p.usedPct < 50).map((p) => `${p.id} ${p.usedPct}`).join(', ') || 'none'}`, !used.length);
    const bb = pages.filter((p) => p.bottomBlank > 8);
    row('E9b', 'Body ≤ 8 % blank below its last band (site lint)', `max ${Math.max(...pages.map((p) => p.bottomBlank))} %; over 8 %: ${bb.map((p) => `${p.id} ${p.bottomBlank}`).join(', ') || 'none'}`, !bb.length);
    const cells = [...pupil, ...keys].flatMap((p) => p.cells.filter((c) => !c.empty).map((c) => ({ ...c, page: p.id })));
    const low = cells.filter((c) => !c.read && !c.draw && c.free < 40);
    row('E10', 'Every item cell ≥ 40 % free (reading cells exempt)', `${cells.length} cells; min free ${Math.min(...cells.filter((c) => !c.read).map((c) => c.free))} %; below 40 %: ${[...new Set(low.map((c) => c.page))].join(', ') || 'none'}`, !low.length);
    const band = cells.filter((c) => !c.skip && !c.draw && c.band >= 30);
    row('E11', 'No empty band ≥ 30 % in a cell (the site sheetCheck H13, from the border box)', `worst ${Math.max(0, ...cells.filter((c) => !c.skip && !c.draw).map((c) => c.band))} %; failing: ${band.map((c) => `${c.page} (${Math.round(c.w)}×${Math.round(c.h)} ${c.band}%)`).slice(0, 8).join(', ') || 'none'}`, !band.length);
    // E12: equal cells within each grid of a page; Practice cells equal across Practice pages
    const uneq = [];
    for (const p of pupil) { const by = {}; for (const c of p.cells) (by[c.grid] = by[c.grid] || []).push(c);
        for (const [g, cs] of Object.entries(by)) if (cs.length > 1 && /ws-grid/.test(g) && (Math.max(...cs.map((c) => c.w)) - Math.min(...cs.map((c) => c.w)) > 0.5 || Math.max(...cs.map((c) => c.h)) - Math.min(...cs.map((c) => c.h)) > 0.5)) uneq.push(`${p.id}`); }
    // PG-11: the cells of ONE section are equal on every page it reaches. A pack whose Practice
    // pages practise different skills (Practice 1 expanded form, Practice 2 words) compares the
    // pages of each skill (its representation, from the pool's places) among themselves.
    const repOf = (id) => [...new Set(((R.pool && R.pool.places) || []).filter((x) => x.page === id).map((x) => x.rep))].sort().join('+');
    const prGroups = {};
    for (const p of pupil.filter((q) => /^P4-\d/.test(q.id))) (prGroups[repOf(p.id)] = prGroups[repOf(p.id)] || []).push(...p.cells.filter((c) => !c.empty && !c.skip));
    const pc = Object.values(prGroups).flat();
    const sp = (k) => Math.max(0, ...Object.values(prGroups).map((cs) => (cs.length ? Math.max(...cs.map((c) => c[k])) - Math.min(...cs.map((c) => c[k])) : 0)));
    row('E12', 'Equal cells within each grid (±0.5 mm) and across the Practice pages', `${uneq.length ? `unequal grids on ${[...new Set(uneq)].join(', ')}` : 'all grids equal'}; Practice cells ${pc.length}, spread ${sp('w').toFixed(1)} × ${sp('h').toFixed(1)} mm`, !uneq.length && pc.length > 0 && sp('w') <= 0.5 && sp('h') <= 0.5);
    row('E13', 'No underscore characters on pupil pages (slot widths: ws-print-lint --source kit)', `underscores ${pages.reduce((a, p) => a + p.underscores, 0)}`, pages.every((p) => p.underscores === 0));
    row('E14', 'No dashed line except the cut line and the missing-digit box', `${pages.reduce((a, p) => a + p.dashed, 0)} outside a cut line`, pages.every((p) => p.dashed === 0));
    const ins = pupil.flatMap((p) => p.instr.map((i) => ({ ...i, page: p.id })));
    const insBad = ins.filter((i) => i.words > 12 || !i.verbs || !i.lib);
    const re = (l) => new RegExp('^' + l.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\\{[a-z]+\\\}|\{[a-z]+\}/g, '.+') + '$');
    const inC1 = (s) => LIB.some((l) => re(l).test(s));
    const kitOnly = [...new Set(ins.filter((i) => i.lib && !inC1(i.s)).map((i) => i.s))];
    // V22 C.1 is "the controlled instruction library [PED 10.1-10.5]": the kit's INSTRUCTION_LIBRARY
    // (sheet/contract.js) is that library's source, so a kit string passes and is listed here.
    row('E15', `Instructions ≤ 12 words, print verb first, string in the controlled library (V22 Appendix C.1: ${LIB.length} strings; the kit's PED 10.1 library: ${KIT.length})`, `${ins.length} instructions; failing: ${[...new Set(insBad.map((i) => `${i.page} "${i.s}"`))].join(' | ') || 'none'}; in the kit library but missing from V22 C.1: ${kitOnly.map((x) => `"${x}"`).join(', ') || 'none'}`, !insBad.length);
    const say = pages.flatMap((p) => p.sayBlanks);
    row('E16', 'Every Say frame ≤ 2 blanks', `${say.length} frames; blanks ${[...new Set(say)].join(', ') || '—'}`, say.every((n) => n <= 2));
    const panel = pages.flatMap((p) => p.panelRows);
    row('E16b', 'RCDWS panel: one action per box, each row one line (≤ 9 mm)', `${panel.length} rows; tallest ${Math.max(0, ...panel)} mm`, panel.length >= 6 && panel.every((h) => h <= 9.05));
    // (a chunked lesson has one chart per chunk: P2, P2b ...)
    const chartP = pages.filter((p) => /^P2[a-z]?(-key)?$/.test(p.id));
    row('E17b', 'The anchor chart and its key carry no answer marks', chartP.map((p) => `${p.id}: ${p.kaCount}`).join(', '), chartP.length >= 2 && chartP.length % 2 === 0 && chartP.every((p) => p.kaCount === 0));
    const pairs = pupil.map((p) => [p, keys.find((k) => k.id === `${p.id}-key`)]);
    row('E17', 'Each key has the same slots as its page', pairs.map(([p, k]) => `${p.id} ${p.slots}/${k ? k.slots : '—'}`).join(', '), pairs.every(([p, k]) => k && p.slots === k.slots));
    row('E18', '© line and strand tab on every page', `© ${pages.filter((p) => p.copy).length}/${pages.length}; tab ${pages.filter((p) => p.tabs > 0).length}/${pages.length}`, pages.every((p) => p.copy && p.tabs > 0));
    const titles = [...new Set(pages.flatMap((p) => p.titles))];
    row('E19', 'One identical I Can title on every page', titles.join(' | '), titles.length === 1);
    const lone = pupil.filter((p) => !/^P(2[a-z]?|5)$/.test(p.id) && p.graded < 2);
    row('E20', 'No lone item (word problem v1 and the anchor chart excepted)', lone.map((p) => p.id).join(', ') || 'none', !lone.length);
    const t1 = pages.find((p) => p.id === 'T1'), t2 = pages.find((p) => p.id === 'T2');
    const want = t2 && t2.newSteps >= 4 ? 'Chunked' : 'Standard';
    row('E21b', 'T1 Flow word: Chunked when T2 has ≥ 4 routine rows tagged New', `T2 New rows ${t2 ? t2.newSteps : '?'} → ${want}; T1 "${((t1 && t1.flow) || '').match(/Flow: (\w+)/)?.[1] || '?'}"`, !!t1 && new RegExp(`Flow: ${want}`).test(t1.flow));
    const TYPES = ['Category', 'Comparative', 'Fact', 'Conceptual'];
    row('E21', 'T2: ≥ 5 atoms of the four types; no ★ in the atom tables', t2 ? `${t2.atoms.length} atoms: ${t2.atoms.join(', ')}; ★ ${t2.t2stars}` : 'no T2', !!t2 && t2.atoms.length >= 5 && t2.atoms.every((a) => TYPES.includes(a)) && !t2.t2stars);
    const dl = ['T3', 'T4', 'T5'].map((id) => pages.find((p) => p.id === id));
    row('E22', 'Every delivery page (T3–T5) shows a pupil-page thumbnail', dl.map((p, i) => `${['T3', 'T4', 'T5'][i]}: ${p ? p.thumbs : 'missing'}`).join(', '), dl.every((p) => p && p.thumbs >= 1));
    const t6 = pages.filter((p) => /^T6/.test(p.id) && p.fadeRows);
    row('E23', 'Every row of T6 "Answers at a glance" carries ★ / ★★ / ★★★', t6.length ? t6.map((p) => `${p.fadeRows.filter(Boolean).length}/${p.fadeRows.length}`).join(', ') : 'no table', t6.length > 0 && t6.every((p) => p.fadeRows.every(Boolean)));
    const e24 = poolCheck(R.pool);
    row('E24', 'Item pool read from the pack (LR-5): pool recomputed from its rule; 0 repeats of (number, representation); a number never twice on a page; chart examples never return', e24.msg, e24.ok);
    let e24b = { ok: false, msg: 'no pool' };
    if (R.pool && R.pool.places) {
        const edge = new Set(R.pool.edge), probs = [];
        const pl = R.pool.places;
        const prPages = [...new Set(pl.filter((x) => /^P4-\d/.test(x.page)).map((x) => x.page))];
        for (const pgid of prPages) { const its = pl.filter((x) => x.page === pgid); const last = Math.max(...its.map((x) => x.row));
            its.filter((x) => x.row === last && !edge.has(x.item)).forEach((x) => probs.push(`${x.item} not an edge case (${pgid} last row)`)); }
        // LR-6: no two answers alike on a page (place-value items: the number IS the answer's identity)
        for (const pgid of [...new Set(pl.map((x) => x.page))]) { const v = pl.filter((x) => x.page === pgid).map((x) => x.item); if (new Set(v).size !== v.length) probs.push(`twin answers on ${pgid}`); }
        // (and by ANSWER on every pupil page but the charts: 10 more than 19 and 30 less 1 are twins too - critic r2)
        for (const pgid of [...new Set(pl.filter((x) => !/^P2/.test(x.page)).map((x) => x.page))]) { const v = pl.filter((x) => x.page === pgid && x.ans !== undefined && x.ans !== '').map((x) => String(x.ans)); const dup = v.filter((x, i) => v.indexOf(x) !== i); if (dup.length) probs.push(`twin answers ${[...new Set(dup)].join(', ')} on ${pgid}`); }
        e24b = { ok: !probs.length && prPages.length > 0, msg: probs.length ? probs.join('; ') : `${prPages.length} Practice pages: last rows all edge cases (a 0 place, a teen ending, 1000); no twin answers on any page` };
    }
    row('E24b', 'Practice last row only edge cases (★★★); LR-6 no twin answers on a page', e24b.msg, e24b.ok);
    // E29 (critic D10): every item letter a teacher page quotes exists on the pupil page it names,
    // and every "x. answer" it quotes is that cell's key answer (digits compared). Section 1 and the
    // routing table name P0; Section 10 names P6.
    {
        const probs = []; let n = 0;
        const digits = (t) => String(t).replace(/[^0-9]/g, '');
        const cellsOf = (id) => ((pages.find((p) => p.id === `${id}-key`) || {}).keyCells || []);
        const sectionText = (num) => { const all = pages.filter((p) => p.teacher).map((p) => p.text || '').join(' ');
            const m = all.match(new RegExp(`Section ${num} ·([\\s\\S]*?)(?=Section \\d|Prerequisite routing:|$)`)); return m ? m[1] : ''; };
        const claims = (text, id) => {
            const cs = cellsOf(id);
            for (const m of text.matchAll(/(?:^|[\s:·;])([a-h])\. ([0-9][0-9 +|,a-z]*?)(?= ·|\.(?:\s|$)|;)/g)) {
                n++;
                const c = cs.find((x) => x.letter === m[1]);
                if (!c) probs.push(`${id} has no item ${m[1]}`);
                // (the quoted answer is the cell's whole key, or one of its marks - a bar story's answer box)
                else if (digits(c.ans) !== digits(m[2]) && !(c.marks || []).some((k) => digits(k) === digits(m[2]))) probs.push(`${id} ${m[1]}: teacher says ${m[2]}, key ${c.ans}`);
            }
        };
        claims(sectionText(1), 'P0');
        claims(sectionText(10), 'P6');
        const t6 = pages.filter((p) => /^T6/.test(p.id)).map((p) => p.text || '').join(' ');
        const rt = (t6.match(/Prerequisite routing:([\s\S]*?)Accepted answers:/) || [])[1] || '';
        const p0 = cellsOf('P0').map((x) => x.letter);
        for (const m of rt.matchAll(/\b([a-h])(?:–([a-h]))?\. /g)) {
            n++;
            const lo = m[1].charCodeAt(0), hi = (m[2] || m[1]).charCodeAt(0);
            for (let k = lo; k <= hi; k++) if (!p0.includes(String.fromCharCode(k))) probs.push(`routing names ${String.fromCharCode(k)}, P0 has no such item`);
        }
        row('E29', 'Every item letter and answer a teacher page quotes is on the pupil page it names (T3 §1, T5 §10, T6 routing)', probs.length ? probs.slice(0, 6).join('; ') : `${n} quotes, all on their pages`, n > 0 && !probs.length);
    }
    const p4 = pages.filter((p) => /^P4/.test(p.id)), extra = p4.flatMap((p) => p.bandLabels.filter((t) => /^(Say|Rule|Remember):/.test(t)).map((t) => `${p.id} ${t}`));
    row('E28', 'No Say:, Rule: or Remember: band on a Practice page', `${p4.length} Practice / Mixed pages; extra bands ${extra.join(', ') || 0}`, p4.length > 0 && !extra.length);
    row('E27', 'Counters in rows of at most 5', pupil.flatMap((p) => p.perRow.map((n) => `${p.id}:${n}`)).join(', ') || 'no counters', pupil.every((p) => p.perRow.every((n) => n <= 5)));
    const chs = pages.filter((p) => /^P2[a-z]?$/.test(p.id));
    row('E26', 'Every anchor-chart step panel adds a grey (newest) mark', chs.length ? chs.map((ch) => `${ch.id} ${ch.panels.filter(Boolean).length} / ${ch.panels.length} panels`).join('; ') : 'no chart', chs.length > 0 && chs.every((ch) => ch.panels.length > 0 && ch.panels.every(Boolean)));
    row('E25', 'One key per pupil page (anchor chart included)', `${pupil.length} pupil pages, ${keys.length} keys`, pupil.length === keys.length && pupil.every((p) => keys.some((k) => k.id === `${p.id}-key`)));
    return rows;
}

function selfCheckMd(rows, pages, info) {
    const pass = rows.filter((r) => r.pass).length;
    return ['# V22 self-check: ' + info.lesson, '',
        `Run by \`tests/scripts/ws-detailed-lesson.cjs --check\` (V22 Appendix E, ported to the kit's markup; Chromium print media) on \`pack.html\`, seed ${info.seed}, ${new Date().toISOString().slice(0, 10)}. **${pass} / ${rows.length} PASS**.`, '',
        '| # | Check | Measured | Result |', '|---|---|---|---|',
        ...rows.map((r) => `| ${r.id} | ${r.check} | ${String(r.measured).replace(/\|/g, '/')} | ${r.pass ? 'PASS' : 'FAIL'} |`), '',
        `**${pass} / ${rows.length} pass.**`, '',
        '## Per page', '', '| Page | Kind | Used % | Bottom blank % | Min text pt | Cells | Min free % | Paints |', '|---|---|---|---|---|---|---|---|',
        ...pages.map((p) => `| ${p.id} | ${p.kind} | ${p.usedPct} | ${p.bottomBlank} | ${p.minPt} | ${p.cells.length} | ${p.cells.length ? Math.min(...p.cells.map((c) => c.free)) : '—'} | ${Object.keys(p.paints).sort().join(' ')} |`),
        '', ...(info.notes.length ? ['## Notes from the build', '', ...info.notes.map((n) => `- ${n}`), ''] : [])].join('\n') + '\n';
}

(async () => {
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(OUT, { recursive: true });
    const md = fs.readFileSync(V22, 'utf8'); const c1 = md.slice(md.indexOf('### C.1'), md.indexOf('### C.2'));
    const LIB = [...c1.matchAll(/^\| `[^`]+`(?: \(V22\))? \| ([^|]+) \|/gm)].map((m) => m[1].trim().replace(/_/g, ''));
    const app = await open({ seed: 1 });
    let failed = false;
    try {
        const built = await app.page.evaluate(async ({ LESSON, SEED }) => {
            try { const r = await window.buildSheet({ role: 'detailed-lesson', lessonId: LESSON, seed: SEED, paper: 'A4', year: 2026 });
                const kit = await import('./js/modules/sheet/contract.js');
                r.kitLib = Object.values(kit.INSTRUCTION_LIBRARY).map((x) => String(x).replace(/_/g, ''));
                return { html: r.html, ids: r.pages.map((p) => `${p.id}:${p.kind}`), notes: r.notes, vars: r.vars, flow: r.flow, tags: r.tags, debug: r.debug, kitLib: r.kitLib };
            } catch (e) { return { error: (e && e.stack) || String(e) }; }
        }, { LESSON, SEED });
        if (built.error) { console.log(`ws-detailed-lesson: FAIL (build) ${built.error}`); process.exit(1); }
        const base = app.page.url().replace(/index\.html.*$/, '');
        const sheet = await app.browser.newPage();
        await sheet.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
        await sheet.goto(app.page.url(), { waitUntil: 'domcontentloaded' });
        await sheet.setContent(built.html, { waitUntil: 'networkidle0', timeout: 60000 });
        await sheet.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
        await sheet.evaluate(() => document.fonts && document.fonts.ready);
        await sheet.emulateMediaType('print');
        const R = has('check') ? await sheet.evaluate(measure, [...LIB, ...built.kitLib]) : null;
        const pdf = path.join(OUT, 'pack.pdf');
        await sheet.pdf({ path: pdf, printBackground: true, preferCSSPageSize: true });
        await sheet.close();
        // pack.html: the stylesheets resolve from the repo, two levels below design/ or tests/audit-runs/.
        const rel = path.relative(OUT, ROOT).split(path.sep).join('/') + '/';
        fs.writeFileSync(path.join(OUT, 'pack.html'), built.html.split(base).join(rel));
        const rast = JSON.parse(execFileSync('python3', ['-c', RASTER_PY, pdf, OUT, String(DPI)], { encoding: 'utf8' }).trim().split('\n').pop());
        fs.writeFileSync(path.join(OUT, 'build.json'), JSON.stringify({ ids: built.ids, notes: built.notes, vars: built.vars, flow: built.flow, tags: built.tags, debug: built.debug }, null, 1));
        console.log(`${LESSON}: ${rast.length} pages -> ${path.relative(ROOT, OUT)}`);
        console.log(`   ${built.ids.join(' ')}`);
        for (const n of built.notes || []) console.log(`   note: ${n}`);
        if (R) {
            const rows = evaluate(R, rast, LIB, built.kitLib);
            fs.writeFileSync(path.join(OUT, 'SELF-CHECK.md'), selfCheckMd(rows, R.pages, { lesson: LESSON, seed: SEED, notes: built.notes || [] }));
            for (const r of rows) console.log(`${r.id.padEnd(5)} ${r.pass ? 'PASS' : 'FAIL'} ${String(r.measured).slice(0, 260)}`);
            failed = rows.some((r) => !r.pass);
            if (has('debug')) fs.writeFileSync(path.join(OUT, 'measure.json'), JSON.stringify(R, null, 1));
        }
        if (has('copy')) {
            const dest = path.join(ROOT, 'design/lesson-samples/detailed', LESSON);
            fs.rmSync(dest, { recursive: true, force: true });
            fs.mkdirSync(dest, { recursive: true });
            const relD = path.relative(dest, ROOT).split(path.sep).join('/') + '/';
            for (const f of fs.readdirSync(OUT)) {
                if (f === 'pack.html') fs.writeFileSync(path.join(dest, f), built.html.split(base).join(relD));
                else if (/\.(png|pdf|md)$/.test(f)) fs.copyFileSync(path.join(OUT, f), path.join(dest, f));
            }
        }
        if (app.problems && app.problems.length) console.log('page problems:', app.problems.slice(0, 5));
    } finally { await app.close(); }
    if (has('check')) { console.log(`ws-detailed-lesson: ${failed ? 'FAIL' : 'OK'}`); process.exit(failed ? 1 : 0); }
})().catch((e) => { console.error(e); console.log('ws-detailed-lesson: FAIL'); process.exit(1); });
