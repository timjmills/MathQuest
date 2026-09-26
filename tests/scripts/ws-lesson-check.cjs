// THE LESSON GATE (design/LESSON_RULES.md): builds every sample lesson packet at many seeds and
// both sizes and fails on any lesson rule a critic round ever had to find - before a critic sees a
// page. It must pass before any critic round.
//
//   node tests/scripts/ws-lesson-check.cjs                     # 25 seeds x L, S x every lesson
//   node tests/scripts/ws-lesson-check.cjs --seeds 5 --only sub
//   node tests/scripts/ws-lesson-check.cjs --layout 3          # render + measure the first 3 seeds (default 3)
//   node tests/scripts/ws-lesson-check.cjs --rule-off LR-5     # PROOF: that rule's engine side off
//                                                              #   (the gate must then FAIL on it)
//   node tests/scripts/ws-lesson-check.cjs --report-only       # print, never exit 1
//
// What it checks (rule numbers are LESSON_RULES.md's):
//   data    LR-3 one icon per step, distinct; LR-1 declared cases; LR-9 Mixed partners are earlier
//           skills (grade at most the lesson's) and none is a later rung of the lesson skill
//   items   the packet's own check (buildSheet's lesson.check, sheet/lesson-rules.js): LR-1 every
//           declared case drawn on the chart; LR-2 no undeclared case dealt; LR-5 no repeat across
//           the packet (turnarounds of a chart example or on one page included); LR-6 near twins,
//           answers alike; LR-7 caps; LR-8 Mixed share; LR-10 the packet at its one size
//   layout  (rendered, the first --layout seeds) LR-11 answer rows 12 / 10 mm; LR-12 the accent
//           only on step marks; LR-13 no cell band of 30 % or more, no page foot over 20 %, no
//           overflow; LR-14 a key leaves no graded slot empty
//   sizes   LR-10 the packet at its one size; LR-16 the lesson's Mixed set printed as a Mixed page
//           at S holds more items than at L, every regroup stack at its M floor, and passes H13
//
// A `soft` finding (a turnaround of another page's item in a skill too small to avoid it) is
// printed and counted, never failed.
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes('--' + k);
const SEEDS = Math.max(1, parseInt(arg('seeds', '25'), 10));
const SIZES = (arg('sizes', 'L,S') || 'L,S').split(',').map((s) => s.trim()).filter(Boolean);
const ONLY = arg('only', '');
const LAYOUT = Math.max(0, parseInt(arg('layout', '3'), 10));
const RULE_OFF = (arg('rule-off', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const REPORT_ONLY = has('report-only');
const SEED_LIST = Array.from({ length: SEEDS }, (_, i) => (i === 0 ? 4242 : 1000 + i * 37));

const LESSONS = [
    { id: 'add', skill: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 10, constant: [1, 2, 3] } } },
    { id: 'sub', skill: { categoryId: 'subtraction', skillId: 'sub_100_regroup' } },
    { id: 'round', skill: { categoryId: 'number_sense', skillId: 'nearest_10' } },
].filter((l) => !ONLY || ONLY.split(',').includes(l.id));

/** The rendered page checks (LR-11 ... LR-14), in the sheet's own document. */
function layoutCheck(page, size, isKey) {
    return page.evaluate(({ size, isKey }) => {
        const MM = 25.4 / 96;
        const out = [];
        const pages = [...document.querySelectorAll('.ws-page')];
        pages.forEach((pg, i) => {
            const sheet = pg.getAttribute('data-ws-sheet') || '';
            const body = pg.querySelector('.ws-body');
            if (body && body.scrollHeight > body.clientHeight + 1) out.push(['LR-13', `page ${i + 1} (${sheet}): the body overflows`]);
            if (body && !isKey) {
                const br = body.getBoundingClientRect();
                const kids = [...body.children].filter((x) => x.getBoundingClientRect().height > 0);
                const last = kids.length ? Math.max(...kids.map((x) => x.getBoundingClientRect().bottom)) : br.top;
                const blank = (br.bottom - last) / br.height;
                if (blank > 0.2) out.push(['LR-13', `page ${i + 1} (${sheet}): ${Math.round(blank * 100)}% of the body blank at the foot`]);
            }
            pg.querySelectorAll('.ws-cell').forEach((c, k) => {
                if (c.scrollHeight > c.clientHeight + 1 || c.scrollWidth > c.clientWidth + 1) out.push(['LR-13', `page ${i + 1} (${sheet}) cell ${k + 1}: content overflows`]);
                if (isKey) return;
                // H13 measured exactly as ws-print-lint's L-DENSITY H13: every visible in-flow
                // descendant with text, a picture or a border (labels, tabs and the key's stamp
                // excluded), inside the cell's padding.
                if (c.classList.contains('blankrun') || c.closest('.mq-anchorgrid') || c.querySelector('[data-ws-anchor]')) return;
                const cr = c.getBoundingClientRect();
                if (cr.height < 40 || cr.width < 40) return;
                const cs = getComputedStyle(c);
                const inner = { t: cr.top + parseFloat(cs.paddingTop), b: cr.bottom - parseFloat(cs.paddingBottom), l: cr.left + parseFloat(cs.paddingLeft), r: cr.right - parseFloat(cs.paddingRight) };
                let box = null;
                for (const d of c.querySelectorAll('*')) {
                    const st = getComputedStyle(d);
                    if (st.visibility === 'hidden' || st.display === 'none') continue;
                    if (d.closest('[data-ws-label], .ws-letter, .ws-tab, .ws-modeltab, .ws-legacy-answer')) continue;
                    if (st.position === 'absolute') continue;
                    const r = d.getBoundingClientRect();
                    if (!r.width || !r.height) continue;
                    if (d.children.length && !(d instanceof SVGElement) && !d.textContent.trim() && !/^(svg|img|canvas)$/i.test(d.tagName)
                        && !(parseFloat(st.borderTopWidth) || parseFloat(st.borderBottomWidth))) continue;
                    box = box ? { t: Math.min(box.t, r.top), b: Math.max(box.b, r.bottom), l: Math.min(box.l, r.left), r: Math.max(box.r, r.right) } : { t: r.top, b: r.bottom, l: r.left, r: r.right };
                }
                if (!box) return;
                const v = Math.max(box.t - inner.t, inner.b - box.b, 0) / cr.height;
                const h = Math.max(box.l - inner.l, inner.r - box.r, 0) / cr.width;
                if (v >= 0.3 || h >= 0.3) out.push(['LR-13', `page ${i + 1} (${sheet}) cell ${k + 1}: empty band ${Math.round(Math.max(v, h) * 100)}% (${(cr.width * MM).toFixed(0)} x ${(cr.height * MM).toFixed(0)} mm)`]);
            });
            // LR-11: the answer rows of column problems (the open row and the key's written row).
            pg.querySelectorAll('.ws-stack .ansrow, .ws-stack > span.an').forEach((r) => {
                // (the size the row is drawn at: its floor's, else the page's - LR-16)
                const own = r.closest('.ws-S, .ws-M, .ws-L');
                const sz = own ? (/ws-([SML])\b/.exec(own.className) || [])[1] : size;
                const want = { L: 12, M: 10, S: 8 }[sz || size];
                const hMm = r.getBoundingClientRect().height * MM;
                if (Math.abs(hMm - want) > 0.6 && !pg.closest('[data-ws-sheet="lesson-chart"]') && sheet !== 'lesson-chart') out.push(['LR-11', `page ${i + 1} (${sheet}): an answer row is ${hMm.toFixed(1)} mm (want ${want})`]);
            });
            // LR-12: the lesson accent only on step marks ([data-mq-accent]: numerals, circles, icons).
            for (const el of pg.querySelectorAll('*')) {
                const st = getComputedStyle(el);
                const acc = [st.color, st.fill, st.stroke, st.borderTopColor].some((v) => /rgb\(91, 42, 134\)/.test(v || ''));
                const painted = (el.textContent || '').trim() || el instanceof SVGElement || parseFloat(st.borderTopWidth);
                if (acc && painted && !el.closest('[data-mq-accent]')) { out.push(['LR-12', `page ${i + 1} (${sheet}): the accent on a ${el.tagName.toLowerCase()}.${String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).slice(0, 30)}`]); break; }
            }
            // LR-14: a key writes every graded slot.
            if (isKey) {
                pg.querySelectorAll('[data-ws-slot]:not([data-ws-graded="0"])').forEach((s) => {
                    const shape = s.getAttribute('data-ws-shape') || '';
                    if (/^(open|choice|none)$/.test(shape)) return;
                    if (!(s.textContent || '').trim() && !s.querySelector('svg, [data-ws-ink]')) out.push(['LR-14', `key page ${i + 1} (${sheet}): an empty ${shape} slot (${s.getAttribute('data-ws-slot')})`]);
                });
            }
        });
        return out;
    }, { size, isKey });
}

async function renderDoc(app, html) {
    const sheet = await app.page.browser().newPage();
    await sheet.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
    await sheet.goto(app.page.url(), { waitUntil: 'domcontentloaded' });
    await sheet.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    await sheet.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
    await sheet.evaluate(() => document.fonts && document.fonts.ready);
    await sheet.emulateMediaType('print');
    return sheet;
}

(async () => {
    const t0 = Date.now();
    const fails = [];
    const softs = [];
    const fail = (where, rule, msg) => fails.push(`${where}: ${rule} ${msg}`);

    // ---- the lesson data (static)
    const prereqs = await import(path.join(__dirname, '../../js/modules/lessons/prereqs.js'));
    const rules = await import(path.join(__dirname, '../../js/modules/sheet/lesson-rules.js'));
    for (const l of LESSONS) {
        const data = prereqs.lessonFor(l.skill.categoryId, l.skill.skillId);
        const where = `${l.id} data`;
        if (!data) { fail(where, 'LR-0', 'no lesson data'); continue; }
        const icons = data.steps.map((s) => s.icon);
        if (new Set(icons).size !== icons.length) fail(where, 'LR-3', `two steps share an icon (${icons.join(', ')})`);
        for (const ic of icons) if (!prereqs.STEP_ICONS.includes(ic)) fail(where, 'LR-3', `step icon ${ic} is not a drawn icon`);
        const fam = Object.values(rules.CASE_FAMILIES).find((f) => (data.cases || []).every((c) => c in f));
        if (!Array.isArray(data.cases) || !data.cases.length) fail(where, 'LR-1', 'no declared `cases`');
        else if (!fam) fail(where, 'LR-1', `cases ${data.cases.join(', ')} are not one family of lesson-rules.js`);
        if (!Array.isArray(data.mixWith) || !data.mixWith.length) fail(where, 'LR-9', 'no Mixed partners');
    }

    const app = await open({ seed: 1, lock: 'ws-lesson-check' });
    // LR-9: a partner is an EARLIER skill - its grade at most the lesson's.
    const grades = await app.page.evaluate((keys) => Object.fromEntries(keys.map((k) => {
        const [c, s] = k.split(':');
        let g = '';
        try { g = window.getSkillGrade(s, c); } catch (e) { g = ''; }
        return [k, String(g)];
    })), LESSONS.flatMap((l) => {
        const d = prereqs.lessonFor(l.skill.categoryId, l.skill.skillId) || { mixWith: [] };
        return [`${l.skill.categoryId}:${l.skill.skillId}`].concat((d.mixWith || []).map((m) => m.key));
    }));
    const G = (g) => (g === 'K' ? 0 : Number(g));
    for (const l of LESSONS) {
        const d = prereqs.lessonFor(l.skill.categoryId, l.skill.skillId) || { mixWith: [] };
        const own = grades[`${l.skill.categoryId}:${l.skill.skillId}`];
        for (const m of d.mixWith || []) {
            const g = grades[m.key];
            if (Number.isFinite(G(g)) && Number.isFinite(G(own)) && G(g) > G(own)) fail(`${l.id} data`, 'LR-9', `Mixed partner ${m.key} is grade ${g}, after the lesson's ${own}`);
            if (m.key === `${l.skill.categoryId}:${l.skill.skillId}`) fail(`${l.id} data`, 'LR-9', 'the lesson skill is its own partner');
        }
    }

    // ---- every lesson, every seed, both sizes
    let builds = 0;
    for (const l of LESSONS) {
        for (const size of SIZES) {
            for (const [si, seed] of SEED_LIST.entries()) {
                // (A packet prints at one size, LR-10: at S only the first seed is built, to check that.)
                if (size !== SIZES[0] && si > 0 && !has('all-sizes')) continue;
                const where = `${l.id} ${size} seed ${seed}`;
                const layout = si < LAYOUT;
                let r = null;
                try {
                    r = await app.page.evaluate(async ({ skill, size, seed, layout, rulesOff }) => {
                        const b = await window.buildSheet({ role: 'lesson', sections: [{ skills: [skill] }], size, paper: 'A4', seed, key: layout, practicePages: 1, mixed: true, rulesOff });
                        return {
                            pageCount: b.pageCount, notes: b.notes, check: b.lesson && b.lesson.check, parts: b.lesson && b.lesson.parts,
                            pupil: layout ? window.sheetDocument(b.pupilHtml, b.title, { paper: 'A4' }) : '',
                            key: layout ? window.sheetDocument(b.keyHtml, b.title, { paper: 'A4' }) : '',
                        };
                    }, { skill: l.skill, size, seed, layout, rulesOff: RULE_OFF });
                } catch (e) { fail(where, 'BUILD', String(e && e.message || e).slice(0, 200)); continue; }
                builds++;
                if (has('verbose')) console.log(`  built ${where}`);
                if (!r.check) { fail(where, 'LR-0', 'the build carries no lesson.check'); continue; }
                for (const v of r.check.violations || []) (v.soft ? softs : fails).push(`${where}: ${v.rule} ${v.msg}`);
                // Every part on its own page count (a packet part never spills overleaf).
                for (const p of r.parts || []) if (p.pages > 1) fail(where, 'LR-13', `${p.part} runs to ${p.pages} pages`);
                if (layout) {
                    for (const [doc, isKey] of [[r.pupil, false], [r.key, true]]) {
                        const pg = await renderDoc(app, doc);
                        try {
                            for (const [rule, msg] of await layoutCheck(pg, size === 'S' ? 'M' : size, isKey)) fail(where, rule, msg);
                        } finally { await pg.close(); }
                    }
                }
            }
            console.log(`  ${l.id} ${size}: built`);
        }
    }
    // ---- LR-16: the lesson's Mixed set as a Mixed practice page at S and at L (owner ruling
    // 2026-09-26): S holds more, an item with a floor keeps it, the page passes H13.
    for (const l of LESSONS) {
        const d = prereqs.lessonFor(l.skill.categoryId, l.skill.skillId);
        if (!d || !d.mixWith) continue;
        const skills = [Object.assign({}, l.skill)].concat(d.mixWith.map((m) => prereqs.skillRef(m)));
        const where = `${l.id} mixed-page`;
        const at = {};
        for (const size of ['S', 'L']) {
            at[size] = await app.page.evaluate(async ({ skills, size }) => {
                const b = await window.buildSheet({ role: 'mixed-practice', sections: [{ skills }], size, seed: 4242, key: false });
                return { n: b.items.length, pages: b.pageCount, doc: window.sheetDocument(b.pupilHtml, b.title, { paper: 'A4' }) };
            }, { skills, size });
        }
        if (!(at.S.n / at.S.pages > at.L.n / at.L.pages)) fail(where, 'LR-16', `S holds ${at.S.n} on ${at.S.pages} page(s), L ${at.L.n} on ${at.L.pages}`);
        const pg = await renderDoc(app, at.S.doc);
        try {
            const low = await pg.evaluate(() => [...document.querySelectorAll('.ws-stack')].filter((st) => st.querySelector('.rg'))
                .filter((st) => parseFloat(getComputedStyle(st).fontSize) < 22 * 96 / 72 - 0.5).length);
            if (low) fail(where, 'LR-16', `${low} regroup stack(s) below their M floor at S`);
            for (const [rule, msg] of await layoutCheck(pg, 'S', false)) fail(where, rule, msg);
        } finally { await pg.close(); }
        console.log(`  ${l.id} mixed page: S ${at.S.n} items on ${at.S.pages}, L ${at.L.n} on ${at.L.pages}`);
    }
    await app.close();

    const byRule = {};
    for (const f of fails) { const r = (/: (LR-\d+|BUILD)/.exec(f) || [])[1] || '?'; byRule[r] = (byRule[r] || 0) + 1; }
    for (const f of fails.slice(0, 60)) console.log(`  FAIL ${f}`);
    if (fails.length > 60) console.log(`  ... and ${fails.length - 60} more`);
    if (softs.length) console.log(`  (${softs.length} soft: a turnaround of another page's item in a skill too small to avoid it, e.g. ${softs[0]})`);
    const tail = `${LESSONS.length} lesson(s), ${builds} builds (${SEED_LIST.length} seeds x ${SIZES.join('/')}), layout on ${Math.min(LAYOUT, SEED_LIST.length)} seed(s)${RULE_OFF.length ? `, RULE OFF: ${RULE_OFF.join(',')}` : ''}, ${Math.round((Date.now() - t0) / 1000)} s`;
    if (fails.length) {
        console.log(`ws-lesson-check: FAIL (${fails.length} finding(s): ${Object.entries(byRule).map(([k, v]) => `${k} ${v}`).join(', ')}; ${tail})`);
        process.exit(REPORT_ONLY ? 0 : 1);
    }
    console.log(`ws-lesson-check: OK (${tail})`);
})().catch((e) => { console.error(e); process.exit(1); });
