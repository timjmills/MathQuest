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
    const PRINT_VERBS = ['Look', 'Read', 'Say', 'Count', 'Circle', 'Underline', 'Box', 'Cross out', 'Trace', 'Write', 'Draw', 'Shade', 'Mark', 'Match', 'Measure', 'Use', 'Find', 'Fill in', 'Finish', 'Check', 'Fix', 'Think', 'Start', 'Put', 'Move', 'Add', 'Subtract', 'Multiply', 'Divide', 'Solve', 'Turn', 'Round', 'Compare', 'Estimate', 'Regroup', 'Bring down', 'Cut', 'Sort', 'Glue', 'Color'];
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
            // (an outline too - lesson 4 r2: the chart's odd x odd ring was a dashed outline the border test missed)
            return (['Top', 'Right', 'Bottom', 'Left'].some((s) => cs['border' + s + 'Style'] === 'dashed' && parseFloat(cs['border' + s + 'Width']) > 0) || (/dashed|dotted/.test(cs.outlineStyle) && parseFloat(cs.outlineWidth) > 0))
                && !e.closest('[data-cut], [data-ws-cut]') && !e.classList.contains('ws-box--unknown'); }).length;
        // E13 underscores (pupil text, footer excepted)
        P.underscores = teacher ? 0 : texts.filter((x) => /_/.test(x.textContent) && !x.parentElement.closest('.ws-foot')).length;
        // E38 (lesson 5 critic r1 D5): a template placeholder left unfilled ("{pre.0.letters}") on any page
        P.braces = (pg.innerText.match(/\{[a-zA-Z][\w.]*\}/g) || []).slice(0, 3);
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
        // (E16c, lesson 4 critic r1 D1/D2: the Say band's own words, blanks left out)
        P.sayText = [...pg.querySelectorAll('.ws-band--say')].filter((e) => !e.closest('.dl-thumb')).map((e) => { const c = e.cloneNode(true); c.querySelectorAll('.ws-line, [data-ws-key-ans]').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); });
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
        // (E39, lesson 4 critic r2 D9: each item grid's column tracks and its item cells - a band of n items in more than n
        // columns leaves an empty bordered track that reads as a missing item)
        P.gridFill = [...pg.querySelectorAll('.ws-grid')].filter((g) => !g.closest('.dl-thumb') && g.getBoundingClientRect().height > 0).map((g) => ({
            cols: getComputedStyle(g).gridTemplateColumns.split(/\s+/).filter(Boolean).length, items: [...g.children].filter((c) => c.classList.contains('ws-cell')).length }));
        // E32 (AX-3 / SF-50, lesson 2 r4 - critic r2 D4): every story's sentences, each with the number of
        // printed lines it takes (a Range's line boxes, by their tops)
        P.stories = teacher ? [] : [...pg.querySelectorAll('.mq-wwstory, .dl-wpstory .ws-story')].filter((s0) => !s0.closest('.dl-thumb')).map((s0) => [...s0.children].filter((x) => x.tagName === 'DIV' && !x.classList.contains('dl-ansline') && x.textContent.trim()).map((x) => {
            // (lines = the sentence's height over its line height: a ringed number's box is not a line)
            const cs = getComputedStyle(x), lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
            return { t: x.textContent.trim().slice(0, 40), n: Math.round(x.getBoundingClientRect().height / lh) };
        }));
        P.hasSteps = !!pg.querySelector('[data-mq-lesson-strip]');
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
        // E30 (critic r3 S1): a pupil page's / key's own words and digits, the I Can title, tab and
        // footer left out (the title may name the band, "numbers to 1,000")
        if (!teacher) { const b0 = pg.querySelector(':scope > .ws-body') || pg; const tw = document.createTreeWalker(b0, NodeFilter.SHOW_TEXT); const parts = []; let tn;
            while ((tn = tw.nextNode())) { if (tn.parentElement.closest('.ws-title, .ws-tabbox, .ws-foot, .ws-copy, .dl-thumb, style, script')) continue; const v = tn.textContent.trim(); if (v) parts.push(v); }
            P.bodyText = parts.join(' | '); }
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
// One canonical sign in every fact key (lesson 3a critic r1 D6: the bridge wrote "2×8" for a P0 fact and "2x8" for an
// array, so E24 missed the repeat): × for x / * / ×, − for - / −, ÷ for / / ÷. An item's IDENTITY across the pack (lead
// ruling, 2026-10-17): for a commutative sign (+, ×) the unordered pair {a, b}, for − and ÷ the ordered pair. Inside one
// item a turned pair may be its content (an arrays-turn cell); across items 3 + 4 and 4 + 3 are one fact.
const canon = (k) => String(k).trim().replace(/^(\d+)\s*([x*×xX]|[-−–]|[/÷]|\+)\s*(\d+)$/, (m0, a, op, b) => `${a}${/[x*×X]/.test(op) ? '×' : /[-−–]/.test(op) ? '−' : /[/÷]/.test(op) ? '÷' : '+'}${b}`);
const factId = (k) => { const c = canon(k), m = c.match(/^(\d+)([+×])(\d+)$/); return m ? [+m[1], +m[3]].sort((x, y) => x - y).join(m[2]) : c; };
function poolCheck(POOL) {
    if (!POOL || !Array.isArray(POOL.places) || !POOL.places.length) return { ok: false, msg: 'no pool JSON or no items in the pack' };
    const d = POOL.decl || {};
    // (canon / factId above: one sign in every key, and a + / × fact's identity its unordered pair)
    const all = POOL.places.filter((x) => !x.copy).map((x) => Object.assign({}, x, { item: canon(x.item), id: factId(x.item) }));
    const inPool = new Set(POOL.pool.map(canon)), forb = new Set((POOL.forbidden || []).map(canon));
    const re = d.kind === 'list' ? d.items.map(canon) : [], ruleSet = new Set();
    // (`plus` - lesson 2 r5, critic r3 m7: the lesson skill's + facts recomputed from the declared RULE - parts at least
    // partMin, none in noPart, crossing ten (both parts 9 or less) or a whole in `sums`, the whole at most maxSum - and
    // the other skills' places from the declared list)
    if (d.kind === 'plus') {
        for (let a = Number(d.partMin) || 0; a <= (Number(d.maxSum) || 20); a++) for (let b = Number(d.partMin) || 0; a + b <= (Number(d.maxSum) || 20); b++) {
            if ((d.noPart || []).map(Number).some((x) => x === a || x === b)) continue;
            if (d.crossTen && !(a <= 9 && b <= 9 && a + b >= 11) && !(d.sums || []).map(Number).includes(a + b)) continue;
            re.push(`${a}+${b}`);
        }
        for (const k of re) ruleSet.add(k);
        re.push(...(d.items || []).map(canon));
    }
    const ruleOk = re.length > 0 && new Set(re).size === inPool.size && re.every((x) => inPool.has(x));
    // (usable: the pool's FACTS, a turned + / × pair one fact - the lead ruling's identity - less the forbidden ones that
    // are facts of their own: a chart example's turn-around is the chart example's fact, so it is no extra fact)
    const ids = new Set([...inPool].map(factId)), forbIds = new Set([...forb].map(factId).filter((k) => !all.some((x) => /^P2/.test(String(x.page)) && x.id === k)));
    const usable = ids.size - forbIds.size, small = usable < 12;
    const seenRep = new Set(), seenPage = new Set(), first = new Map(), rep = [], soft = [], bad = [], noRep = [];
    const pageOf = (p) => String(p).replace(/-key$/, '');
    // LR-5 (V22 Appendix E `js v21-selfcheck` poolCheck: "a chart (P2) example never returns, in any
    // representation, on any page, nor does its turn-around" - the port had dropped `turn`; lesson 2 critic r3 D1)
    // (a chart's turn-around is its identity too: ident() is the unordered pair)
    const chart = new Set(all.filter((x) => /^P2/.test(pageOf(x.page))).map((x) => x.id)); const chartBack = [];
    for (const x of all) {
        if (!/^P2/.test(pageOf(x.page)) && chart.has(x.id)) chartBack.push(`${x.item} (${x.rep}) ${x.page}`);
        // (a lesson-skill place - its skill or the word problem's story - the declared rule does not hold is outside the pool)
        if (!inPool.has(x.item) || forb.has(x.item) || (d.kind === 'plus' && (x.rep === d.skill || x.rep === 'story') && !ruleSet.has(x.item))) bad.push(`${x.item} ${x.page}`);
        if (!x.rep) noRep.push(`${x.item} ${x.page}`);
        const kr = `${x.id}|${x.rep}`, kp = `${x.id}|${pageOf(x.page)}`;
        if (seenRep.has(kr) || seenPage.has(kp)) rep.push(`${x.item} (${x.rep}) ${x.page}`);
        else if (first.has(x.id)) (small ? soft : rep).push(`${x.item} (${x.rep}) ${x.page}`);
        seenRep.add(kr); seenPage.add(kp); if (!first.has(x.id)) first.set(x.id, x.page);
    }
    // (V22: no turn-around pair on one page)
    const turns = [];
    for (const pg of [...new Set(all.map((x) => pageOf(x.page)))]) { const xs = all.filter((x) => pageOf(x.page) === pg);
        for (const x of xs) if (x.item !== x.id && xs.some((y) => y.item === x.id)) turns.push(`${x.item} on ${pg}`); }
    return { ok: ruleOk && !bad.length && !noRep.length && !rep.length && !chartBack.length && !turns.length && (small || all.length <= usable),
        msg: `${all.length} places (${first.size} numbers), usable pool ${usable} (pool ${inPool.size} keys, ${ids.size} facts, recomputed from its ${d.kind || '?'} rule: ${ruleOk ? 'matches' : 'MISMATCH'}; forbidden ${forb.size ? [...forb].join(', ') : 0}); repeats ${rep.length ? rep.join(', ') : 0}; chart examples or their turn-arounds returning ${chartBack.length ? chartBack.join(', ') : 0}; same-page turn-arounds ${turns.length ? turns.join(', ') : 0}; outside the pool / forbidden ${bad.length ? bad.join(', ') : 0}; items without a rep ${noRep.length}` };
}

// mult-grid windows (lesson 4): a pool key "grid r0-r1 x c0-c1:task", its cells as unordered boxes (a turned box is the same
// box; one entry a cell), and the lead ruling's near twin - more than half of either window's cells inside the other.
const WIN = (k) => { const m = String(k || '').match(/^grid(\d+)-(\d+)x(\d+)-(\d+)(?::(\w+))?$/); return m ? { r0: +m[1], r1: +m[2], c0: +m[3], c1: +m[4], t: m[5] || '' } : null; };
const CELLS = (k) => { const g = WIN(k), o = []; if (g) for (let r = g.r0; r <= g.r1; r++) for (let c = g.c0; c <= g.c1; c++) o.push(`${Math.min(r, c)},${Math.max(r, c)}`); return o; };
const OVER = (a, b) => { const A = CELLS(a), B = CELLS(b); return A.filter((x) => B.includes(x)).length * 2 > A.length || B.filter((x) => A.includes(x)).length * 2 > B.length; };
/* ------------------------------------------------------------------------- evaluate */
// A + / − place's sign and numbers ("7+6" -> {op: '+', a: 7, b: 6}), else null.
const OPI = (x) => { const m = canon((x && x.item) || '').match(/^(\d+)([+−])(\d+)$/); return m ? { op: m[2], a: Number(m[1]), b: Number(m[3]) } : null; };
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
    // V22 §8.12.4 / RUBRIC H5: EVERY page 50-100 % used - a teacher continuation page too (critic r3: the
    // E9 continuation exemption was reverted; the gold packs have none). E9c holds teacher pages to V22 3131.
    const used = pages.filter((p) => p.usedPct < 50 || p.overflow > 0);
    row('E9', 'Every page ≥ 50 % used, nothing past the body', `min ${Math.min(...pages.map((p) => p.usedPct))} %; overflow ${pages.filter((p) => p.overflow).map((p) => `${p.id} +${p.overflow} mm`).join(', ') || 'none'}; under 50 %: ${pages.filter((p) => p.usedPct < 50).map((p) => `${p.id} ${p.usedPct}`).join(', ') || 'none'}`, !used.length);
    // E9c (V22 3131 "fill each teacher page to >= 92 %"): a teacher page that is not the last of its
    // group (T2 → T2-2) must be >= 92 % used - only what does not fit continues; the last page of a
    // group (or a page alone) >= 50 % (E9). T1 / T6 are single pages by V22 and also >= 50 %.
    const grpOf = (id) => id.replace(/-\d+$/, '');
    const notLast = teach.filter((p) => teach.some((q) => q !== p && grpOf(q.id) === grpOf(p.id) && teach.indexOf(q) > teach.indexOf(p)));
    const under = notLast.filter((p) => p.usedPct < 92);
    row('E9c', 'Teacher pages: one continued is ≥ 92 % used (V22 3131); every teacher page listed', `${teach.map((p) => `${p.id} ${p.usedPct}`).join(', ')}; continued under 92 %: ${under.map((p) => `${p.id} ${p.usedPct}`).join(', ') || 'none'}`, !under.length);
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
    // E16c (lesson 4 critic r1 D1/D2; narrowed by the lead ruling, 2026-10-17): a pupil page's Say band never states an
    // ANSWER of that page's items that is not also one of their GIVEN numbers, and never names an item letter ("b. ..." -
    // a frame that names an item coaches that item). A given is a number the page prints for the pupil: an item's operands
    // (a story's numbers, the factors shown: "5x6" gives 5 and 6) and a window's headers and printed products. So "5 times
    // 6 equals 6 times __" over the story 5 x 6 passes (5 is given), and "One number is even. So 28 is __" over 4 x 7 fails.
    {
        const pl = (R.pool && R.pool.places) || [];
        const nums = (t) => (String(t).match(/\d+/g) || []).map(Number);
        const givenOf = (x) => { const g = WIN(x.item); if (!g) { const m = canon(x.item).match(/^(\d+)[+×−÷](\d+)$/); return m ? [+m[1], +m[2]] : []; }
            const o = []; for (let r = g.r0; r <= g.r1; r++) o.push(r); for (let c = g.c0; c <= g.c1; c++) o.push(c);
            if (g.t !== 'fill') for (let r = g.r0; r <= g.r1; r++) for (let c = g.c0; c <= g.c1; c++) o.push(r * c); return o; };
        const bad = [];
        for (const p of pages.filter((x) => x.kind === 'pupil' && !/^P2/.test(x.id))) for (const t of p.sayText || []) {
            const its = pl.filter((x) => x.page === p.id);
            const ans = new Set(its.flatMap((x) => nums(x.ans))), given = new Set(its.flatMap(givenOf));
            const hit = nums(t).filter((v) => ans.has(v) && !given.has(v));
            if (hit.length) bad.push(`${p.id} says ${hit[0]} (an answer, not a given)`);
            if (/(^|["“\s])[a-h]\.\s/.test(t)) bad.push(`${p.id} Say names an item`);
        }
        row('E16c', 'No Say band states an answer of its page that is not a given number, nor names one item', bad.length ? bad.join('; ') : 'none', !bad.length);
    }
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
    row('E24', 'Item pool read from the pack (LR-5): pool recomputed from its rule; 0 repeats of (number, representation); a number never twice on a page; chart examples and their turn-arounds never return; no turn-around pair on a page', e24.msg, e24.ok);
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
        // (a Mixed page's skills are told apart by their own form: there the twins are counted per skill)
        // (a + / − item's answer is a plain number whatever its form - a story's 12 and a fact's 12 are twins too, critic r2 D2)
        for (const pgid of [...new Set(pl.filter((x) => !/^P2/.test(x.page)).map((x) => x.page))]) { const mixed = /^P4m/.test(pgid); const v = pl.filter((x) => x.page === pgid && x.ans !== undefined && x.ans !== '').map((x) => (mixed && !OPI(x) ? `${x.rep}:` : '') + String(x.ans)); const dup = v.filter((x, i) => v.indexOf(x) !== i); if (dup.length) probs.push(`twin answers ${[...new Set(dup)].join(', ')} on ${pgid}`); }
        // (LR-6 near twins, V22 2983 / critic r3 N1: two one-number items of one skill on a page within 2 of
        // each other - 405 and 406 - on every pupil page but the charts)
        for (const pgid of [...new Set(pl.filter((x) => !/^P2/.test(x.page)).map((x) => x.page))]) {
            const xs = pl.filter((x) => x.page === pgid && /^\d+$/.test(String(x.item)));
            for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++)
                if (xs[i].rep === xs[j].rep && Math.abs(Number(xs[i].item) - Number(xs[j].item)) <= 2) probs.push(`near twins ${xs[i].item} / ${xs[j].item} on ${pgid}`);
        }
        // (LR-6 for + and − items - word problems included, read from their operands; lesson 2 r4, critic r2 D2:
        // the old check read one-number items only, so 5 + 7 / 5 + 6 in a row passed. V22 E24b: + no first
        // addend twice in a row of a grid (a place's grid and row) nor three times running; − no number taken
        // away twice; no near twins - the same sign, both numbers within 2 of the other's)
        let opN = 0;
        for (const pgid of [...new Set(pl.filter((x) => !/^P2/.test(x.page)).map((x) => x.page))]) {
            const xs = pl.filter((x) => x.page === pgid && OPI(x)).map((x) => Object.assign({}, x, { o: OPI(x) }));
            opN += xs.length;
            const rows = {};
            for (const x of xs.filter((y) => y.o.op === '+')) (rows[`${x.grid || 0}:${x.row}`] = rows[`${x.grid || 0}:${x.row}`] || []).push(x.o.a);
            for (const [r, a] of Object.entries(rows)) { const d2 = a.filter((v, i) => a.indexOf(v) !== i); if (d2.length) probs.push(`first addend ${d2[0]} twice in a row (${r}) on ${pgid}`); }
            const plus = xs.filter((y) => y.o.op === '+');
            for (let i = 2; i < plus.length; i++) if (plus[i].o.a === plus[i - 1].o.a && plus[i].o.a === plus[i - 2].o.a) probs.push(`first addend ${plus[i].o.a} three times running on ${pgid}`);
            const subs = xs.filter((y) => y.o.op === '−').map((y) => y.o.b);
            if (new Set(subs).size !== subs.length) probs.push(`a number taken away twice on ${pgid}`);
            for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) {
                const A = xs[i].o, B = xs[j].o;
                // (V22 2983 as written: both numbers within 2 of the other's, place by place - 7 + 8 / 8 + 6, 51 − 44 / 53 − 45)
                const da = Math.abs(A.a - B.a), db = Math.abs(A.b - B.b);
                if (A.op === B.op && xs[i].item !== xs[j].item && da <= 2 && db <= 2) probs.push(`near twins ${xs[i].item} / ${xs[j].item} on ${pgid}`);
            }
        }
        // (× / ÷ - lead ruling 2026-10-17, lesson 3a critic r2 m1: V22's both-within-2 cannot be met on a 10-item ×
        // page, so its LR-6 rule is the + analogue: no first factor (÷: no divisor) twice in one grid row)
        let mdN = 0, winN = 0;
        const MD = (x) => { const m = String((x && x.item) || '').match(/^(\d+)\s*([x×÷])\s*(\d+)$/); return m ? { op: m[2] === '÷' ? '÷' : '×', f: Number(m[2] === '÷' ? m[3] : m[1]) } : null; };
        // (Practice, Mixed and exit pages: a Prerequisite Check's × 2 recall row is one table on purpose)
        for (const pgid of [...new Set(pl.filter((x) => /^P(4|6)/.test(x.page)).map((x) => x.page))]) {
            const rows = {};
            for (const x of pl.filter((y) => y.page === pgid && MD(y) && y.rep !== 'count_by_tables')) { mdN++; const o = MD(x); const k = `${o.op}${x.grid || 0}:${x.row}`; (rows[k] = rows[k] || []).push(o.f); }
            for (const [r, a] of Object.entries(rows)) { const d2 = a.filter((v, i) => a.indexOf(v) !== i); if (d2.length) probs.push(`${r[0] === '÷' ? 'divisor' : 'first factor'} ${d2[0]} twice in a row (${r.slice(1)}) on ${pgid}`); }
            // (mult-grid windows - lesson 4 r2, lead: no two windows in one grid row with the same rows or the same columns)
            const gr = {};
            for (const x of pl.filter((y) => y.page === pgid)) { const m = String(x.item || '').match(/^grid(\d+-\d+)x(\d+-\d+)/); if (m) for (const sp of [m[1], m[2]]) { const k = `${x.grid || 0}:${x.row}:${sp}`; if (gr[k]) probs.push(`windows ${gr[k]} / ${x.item} share ${sp} in a row on ${pgid}`); else gr[k] = x.item; } }
        }
        // (mult-grid windows - lesson 4 critic r1 D5, lead ruling r4, on every pupil page: two windows of one page share AT
        // MOST HALF their boxes, turned boxes counted - more than half of either window's cells in the other is a near twin; a
        // Practice window is never a copy of an earlier page's window - all its boxes inside that one; an exit window is
        // fresh - no window of another page, of any task, holds more than half its cells; the ★★★ row is the windows' real
        // edge case, so no Practice row above it holds one. WIN / CELLS / OVER are above evaluate.)
        for (const pgid of [...new Set(pl.filter((x) => /^P\d/.test(x.page) && !/-key$/.test(x.page) && WIN(x.item)).map((x) => x.page))]) {
            const wins = pl.filter((y) => y.page === pgid && WIN(y.item));
            const others = pl.filter((u) => WIN(u.item) && u.page !== pgid && !/-key$/.test(u.page));
            const before = pl.slice(0, pl.findIndex((x) => x.page === pgid)).filter((u) => WIN(u.item) && !/-key$/.test(u.page));
            for (let i = 0; i < wins.length; i++) for (let j = i + 1; j < wins.length; j++) if (WIN(wins[i].item).t === WIN(wins[j].item).t && OVER(wins[i].item, wins[j].item)) probs.push(`windows ${wins[i].item} / ${wins[j].item} share more than half their boxes on ${pgid}`);
            if (/^P4/.test(pgid)) for (const w of wins) { const c = before.find((u) => CELLS(w.item).every((x) => CELLS(u.item).includes(x))); if (c) probs.push(`window ${w.item} on ${pgid} copies ${c.item} (${c.page})`); }
            if (/^P6/.test(pgid)) for (const w of wins) { const c = others.find((u) => OVER(w.item, u.item)); if (c) probs.push(`exit window ${w.item} not fresh: ${c.item} (${c.page}) holds more than half`); }
            if (/^P4-\d/.test(pgid)) { const last = Math.max(...pl.filter((x) => x.page === pgid).map((x) => x.row)); wins.filter((w) => w.row !== last && edge.has(w.item)).forEach((w) => probs.push(`${w.item} an edge case above the last row on ${pgid}`)); }
            winN += wins.length;
        }
        // (`edgeOnly` - a description's declared case, lesson 3a r4 m3: only on the ★★★ last row of a Practice page)
        const eo = R.pool.edgeOnly;
        if (eo) for (const pgid of prPages) { const its = pl.filter((x) => x.page === pgid); const last = Math.max(...its.map((x) => x.row));
            its.filter((x) => x.row !== last && eo.items.includes(x.item)).forEach((x) => probs.push(`${x.item} (${eo.test}) before the last row on ${pgid}`));
            if (its.filter((x) => eo.items.includes(x.item)).length > 1) probs.push(`more than one ${eo.test} on ${pgid}`); }
        e24b = { ok: !probs.length && prPages.length > 0, msg: probs.length ? probs.join('; ') : `${prPages.length} Practice pages: last rows all edge cases (${[...edge].length} edge numbers dealt); no twin answers on any page; near twins checked for one-number and + / − items (${opN} + / −: no first addend twice in a grid row, no number taken away twice, both numbers within 2); ${mdN} × / ÷ items: no first factor / divisor twice in a grid row${winN ? `; ${winN} windows: no two of a page share more than half their boxes, no Practice window copies an earlier one, exit windows fresh, no edge case above a ★★★ row` : ''}${eo ? `; ${eo.test} only on the last row, at most one a page` : ''}` };
    }
    row('E24b', 'Practice last row only edge cases (★★★); LR-6 no twin answers and no near twins (one skill, numbers within 2) on a page; + / − items (stories too): no first addend twice in a grid row or three running, no number taken away twice, no near twins (both numbers within 2, place by place: V22 2983); × / ÷ (lead ruling): no first factor / divisor twice in a grid row; a declared edgeOnly case only on the last row', e24b.msg, e24b.ok);
    // E31 (lesson 2 r4, critic r2 D1 / D4): a lesson that declares its SITUATIONS (put together, add to)
    // models each in I Do (the chart or its board example: a P2 place), practises nothing it did not
    // model, and assesses each on the exit slip. A lesson without `situations` passes trivially.
    {
        const sits = (R.pool && R.pool.situations) || [], probs = [];
        const pl = (R.pool && R.pool.places) || [];
        const on = (re) => new Set(pl.filter((x) => re.test(x.page) && x.sit).map((x) => x.sit));
        const p2 = on(/^P2/), p6 = on(/^P6$/), used = on(/^P[3-6]/);
        if (sits.length && !pl.some((x) => x.sit)) probs.push('situations declared, no story read');
        for (const s0 of sits) { if (!p2.has(s0)) probs.push(`${s0} never modelled (no chart / I Do example)`); if (!p6.has(s0)) probs.push(`${s0} not on the exit slip`); }
        for (const s0 of used) if (!p2.has(s0)) probs.push(`${s0} practised but not modelled`);
        row('E31', 'Every situation the lesson declares is modelled in I Do (chart or board example), assessed on the exit slip, and nothing unmodelled is practised', sits.length ? (probs.length ? probs.join('; ') : `${sits.join(', ')}: modelled on P2, practised on ${[...used].length ? 'P3–P6' : '—'}, assessed on P6`) : 'no situations declared', !probs.length);
    }
    // E32 (AX-3 one sentence per line in stories; SF-50 at most 4 lines - critic r2 D4): every story
    // sentence on a pupil page or key prints on ONE line, and a story has at most 4 sentences.
    {
        const all = [...pupil, ...keys].flatMap((p) => (p.stories || []).map((st) => ({ p: p.id, st })));
        const bad = all.filter((x) => x.st.length > 4 || x.st.some((l) => l.n > 1));
        row('E32', 'Stories: one sentence per line (AX-3), at most 4 lines (SF-50)', all.length ? (bad.length ? bad.slice(0, 4).map((x) => `${x.p}: "${(x.st.find((l) => l.n > 1) || x.st[0]).t}" ${x.st.length} lines`).join('; ') : `${all.length} stories, every sentence on one line, at most ${Math.max(...all.map((x) => x.st.length))} lines`) : 'no stories', !bad.length);
    }
    // E33 (V22 §9.5, critic r2 D3): on a Mixed page the lesson's own skill (the chart's) holds at least half the items.
    {
        const pl = (R.pool && R.pool.places) || [];
        // (the lesson's own skills: every skill its charts, lesson sheets, Practice pages and exit slip deal - a chunked lesson has several)
        const lead = new Set(pl.filter((x) => /^P(2|3|4-|6)/.test(x.page)).map((x) => x.rep));
        const mx = [...new Set(pl.filter((x) => /^P4m/.test(x.page)).map((x) => x.page))];
        const res = mx.map((id) => { const its = pl.filter((x) => x.page === id); const k = its.filter((x) => lead.has(x.rep)).length; return { id, k, n: its.length }; });
        row('E33', 'Mixed page: the lesson\'s own skills hold at least half the items (V22 §9.5)', res.length ? res.map((r) => `${r.id}: ${r.k} of ${r.n} (${[...lead].join(', ')})`).join('; ') : 'no Mixed page', res.every((r) => 2 * r.k >= r.n));
    }
    // E34 (critic r2 D5): T2b's exit-slip score is the slip's own item count.
    {
        const t2b = (pages.find((p) => p.id === 'T2b') || {}).text || '';
        const m = t2b.match(/Exit slip \/(\d+) a half/);
        const n6 = ((R.pool && R.pool.places) || []).filter((x) => x.page === 'P6').length;
        row('E34', 'T2b scores the exit slip by its own item count', m ? `T2b /${m[1]}, P6 ${n6} items a half` : 'no T2b exit row', !!m && Number(m[1]) === n6);
    }
    // E35 (critic r2 D1): a lesson that declares situations quotes no story question on T4 that the pack
    // does not print or write on the board ("How many books in all?" for a chart that asks "now").
    {
        const sits = (R.pool && R.pool.situations) || [];
        const t4 = pages.filter((p) => /^T4/.test(p.id)).map((p) => p.text || '').join(' ');
        const printed = [...pupil, ...keys].map((p) => p.bodyText || '').join(' | ');
        const board = [...t4.matchAll(/(?:Write on the board|Read the story):\s*([^?]*\?)/g)].map((m) => m[1]);
        const qs = [...t4.matchAll(/How many [^?.]*\?/g)].map((m) => m[0]);
        const bad = qs.filter((q) => !printed.includes(q) && !board.some((b) => b.includes(q)));
        // (critic r3 D2: a teacher page that sends pupils to "the Steps at the top of the page" names a Practice page that prints them)
        const tAll = teach.map((p) => p.text || '').join(' ');
        const p41 = pages.find((p) => p.id === 'P4-1');
        const stepsBad = /Steps are at the top of the page/.test(tAll) && !(p41 && p41.hasSteps);
        row('E35', 'T4 quotes only story questions the pack prints or writes on the board; a "Steps at the top" line names a page that prints them', `${sits.length ? (bad.length ? bad.join('; ') : `${qs.length} questions, all printed or on the board`) : 'no situations declared'}; Practice 1 Steps band ${p41 && p41.hasSteps ? 'printed' : 'not printed'}${stepsBad ? ' - but a teacher page says "The Steps are at the top of the page"' : ''}`, (!sits.length || !bad.length) && !stepsBad);
    }
    // E36 (critic r3 D3): each exit-slip + item separates its mistakes - no part is the difference of the parts
    // (4 + 8: 8 − 4 = 4 is a story number) - and is fresh: neither it nor its turn-around on a lesson page (P3-P5).
    {
        const pl = (R.pool && R.pool.places) || [];
        const ex = pl.filter((x) => x.page === 'P6' && OPI(x) && OPI(x).op === '+');
        // (fresh: its FACT - the unordered pair, factId - on no other pupil page)
        const on = new Set(pl.filter((x) => !/^P6/.test(x.page)).map((x) => factId(x.item)));
        const probs = [];
        for (const x of ex) { const o = OPI(x), d0 = Math.abs(o.a - o.b); if (d0 === o.a || d0 === o.b) probs.push(`${x.item}: ${Math.max(o.a, o.b)} − ${Math.min(o.a, o.b)} = ${d0} is a part`); if (on.has(factId(x.item))) probs.push(`${x.item} (or its turn-around) is on another page`); }
        row('E36', 'Exit slip + items: no part equals the difference of the parts; each fresh (on no other page, nor turned round)', ex.length ? (probs.length ? probs.join('; ') : `${ex.map((x) => x.item).join(', ')}: clean and fresh`) : 'no + exit items', !probs.length);
    }
    // E37 (lesson 5 critic r1 D1): a function table is its rule AND its (In, Out) pairs. No pair on two pages; no rule on more
    // than two tables of the pack; the exit slip's tables share no pair with any page. Passes with no tables.
    {
        const pl = ((R.pool && R.pool.places) || []).filter((x) => /^ft[a-z]+[^:]+:/.test(String(x.item)));
        const parts = (k) => { const m = String(k).match(/^ft[a-z]+([^:]+):(.+)$/); return { rule: m[1], pairs: m[2].split(',') }; };
        const probs = [];
        const pairAt = new Map(), ruleN = new Map(), seenItem = new Set();
        for (const x of pl) {
            if (seenItem.has(`${x.page}|${x.item}`)) continue; seenItem.add(`${x.page}|${x.item}`);
            const t = parts(x.item);
            ruleN.set(t.rule, (ruleN.get(t.rule) || 0) + 1);
            for (const pr of t.pairs) { const was = pairAt.get(pr); if (was && was !== x.page.replace(/-key$/, '')) probs.push(`${pr} on ${was} and ${x.page}`); else pairAt.set(pr, x.page.replace(/-key$/, '')); }
        }
        for (const [r, n] of ruleN) if (n > 2) probs.push(`rule ${r} on ${n} tables`);
        row('E37', 'Function tables: no (In, Out) pair on two pages, no rule on more than two tables (table identity = rule + pairs)', pl.length ? (probs.length ? probs.slice(0, 6).join('; ') : `${seenItem.size} tables: fresh`) : 'no tables', !probs.length);
    }
    {
        const bad = pages.filter((p) => p.braces && p.braces.length);
        row('E38', 'No unfilled {placeholder} on any page', bad.length ? bad.map((p) => `${p.id}: ${p.braces.join(' ')}`).join('; ') : 'none', !bad.length);
    }
    // E39 (lesson 4 critic r2 D9): no band lays out its items in more columns than it has items
    { const bad = [...pupil, ...keys].flatMap((p) => (p.gridFill || []).filter((g) => g.items > 0 && g.items < g.cols).map((g) => `${p.id} ${g.items} item${g.items > 1 ? 's' : ''} in ${g.cols} columns`));
        row('E39', 'No band has more columns than items (an empty bordered track reads as a missing item)', bad.length ? bad.join('; ') : `${[...pupil, ...keys].reduce((a, p) => a + (p.gridFill || []).length, 0)} grids, none`, !bad.length); }
    // E30 (critic r3 S1): a number the lesson declares `boardOnly` (shown on the board only) is never a
    // pupil item's number or answer, and never printed on a pupil page or key (digits, with or without
    // a comma, or its name). The pool JSON carries the list; an empty list passes trivially.
    {
        const bo = (R.pool && Array.isArray(R.pool.boardOnly)) ? R.pool.boardOnly : null, probs = [];
        if (!bo) probs.push('no boardOnly list in the pool JSON');
        for (const b of bo || []) {
            const n = String(b.n), withComma = n.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            const re = new RegExp(`(?<![\\d,])(${n}|${withComma})(?![\\d]|,\\d)`);
            for (const x of (R.pool.places || [])) if (String(x.item) === n || String(x.ans).replace(/,(?=\d{3})/g, '').split(/[^0-9]+/).includes(n)) probs.push(`${n} dealt on ${x.page}`);
            for (const p of [...pupil, ...keys]) {
                if (re.test(p.bodyText || '')) probs.push(`${n} printed on ${p.id}`);
                if (b.words && new RegExp(`\\b${b.words.replace(/[-\s]+/g, '[-\\s]+')}\\b`, 'i').test(p.bodyText || '')) probs.push(`"${b.words}" printed on ${p.id}`);
            }
        }
        row('E30', 'No boardOnly number on a pupil page or key (item, answer, digits or name)', probs.length ? [...new Set(probs)].slice(0, 6).join('; ') : `${(bo || []).map((b) => b.n).join(', ') || 'none declared'}: on no pupil page or key (${pupil.length + keys.length} pages)`, !!bo && !probs.length);
    }
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
