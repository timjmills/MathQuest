// ws-anchor-steps: every worked example's STEPS have a real column (owner report 2026-09-25).
//
// "This anchor problem looks off both on spacing and on the text on the side": a count-by row's
// Model cell printed its steps one word a line in a column squeezed against the cell's right
// border, running past the border and down beside the next cell, and the cell was 40% of the page.
//
// For every skill whose provider really implements `workedSteps` (the skills that get anchors),
// this builds the anchor-bearing pages through the app's own `buildSheet`, lays each out in an
// A4 document (`sheetDocument`, the real stylesheets) and measures:
//   STEPS-COL    any steps list (beside its drawing or under it) narrower
//                than 18 characters of the page's step type (anchors.js stepsMinMm)
//   STEPS-WORD   a step line printed about one word a line (fewer than 2 words a line box)
//   STEPS-LEAVE  anything in a Model / anchor cell outside that cell's border
//   STEPS-H13    an anchor cell whose content leaves an empty band of 30% or more of its height
// plus the Guided page's worked lines (.mq-worklines) and the lesson chart's panels (.mq-cstate).
// It records each build's items per page, so the capacity can be compared before and after.
//
//   node tests/scripts/ws-anchor-steps.cjs                         # every eligible skill, S and L
//   node tests/scripts/ws-anchor-steps.cjs --skills multiplication:count_by_tables
//   node tests/scripts/ws-anchor-steps.cjs --sizes L --builds independent:side,guided:off
//   node tests/scripts/ws-anchor-steps.cjs --out tests/audit-runs/anchor-steps.json --report-only
//
// Builds: independent / more-practice with anchors 'side' and 'sections', guided and lesson (no
// anchor request: their Model cell and anchor chart), and one mixed-practice set per 3 skills.
// Exit code 1 on any finding unless --report-only. Prints `ws-anchor-steps: OK` / `FAIL`.
const fs = require('fs');
const path = require('path');
const { ROOT, open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes('--' + k);
const ONLY = (arg('skills', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const SIZES = (arg('sizes', 'S,L') || 'S,L').split(',').map((s) => s.trim()).filter(Boolean);
const BUILDS = (arg('builds', 'independent:side,independent:sections,more-practice:side,more-practice:sections,guided:off,lesson:off,mixed-practice:sections,mixed-practice:side') || '')
    .split(',').map((s) => s.trim().split(':')).filter((x) => x[0]);
const OUT = arg('out', null);
const LIMIT = parseInt(arg('limit', '0'), 10);

(async () => {
    const app = await open({ seed: 1 });
    const { page } = app;
    let failed = false;
    try {
        const skills = await page.evaluate(async (ONLY) => {
            const kit = await import('/js/modules/sheet/index.js');
            const out = [];
            for (const [cat, arr] of Object.entries(window.SKILLS)) {
                for (const s of arr || []) {
                    if (!s || s.retired || s.tombstone || s.hidden) continue;
                    const id = `${cat}:${s.v}`;
                    if (ONLY.length && !ONLY.includes(id)) continue;
                    const p = kit.getProvider(cat, s.v);
                    if (p && Array.isArray(p.real) && p.real.includes('workedSteps')) out.push(id);
                }
            }
            return out;
        }, ONLY);
        const list = LIMIT > 0 ? skills.slice(0, LIMIT) : skills;
        console.log(`ws-anchor-steps: ${list.length} skills with worked steps, sizes ${SIZES.join('/')}, ${BUILDS.length} builds each`);
        const rows = [];
        const findings = [];
        const t0 = Date.now();
        const jobs = [];
        for (const size of SIZES) {
            for (const [role, anchors] of BUILDS) {
                if (role === 'mixed-practice') {
                    for (let i = 0; i < list.length; i += 3) jobs.push({ size, role, anchors, skills: list.slice(i, i + 3) });
                } else for (const k of list) jobs.push({ size, role, anchors, skills: [k] });
            }
        }
        let n = 0;
        for (const job of jobs) {
            n++;
            const r = await page.evaluate(measureBuild, job);
            rows.push(Object.assign({ job }, r));
            const what = `${job.size} ${job.role}${job.anchors !== 'off' ? ` ${job.anchors}` : ''} ${job.skills.join('+')}`;
            if (r.error) { findings.push(`${what}: ERROR ${r.error.split('\n')[0]}`); console.log(`  ! ${findings[findings.length - 1]}`); continue; }
            for (const f of r.findings) { findings.push(`${what}: ${f}`); if (has('stream')) console.log(`  ! ${what}: ${f}`); }
            if (has('stream')) console.log(`  = ${what}: ${r.pages}p, ${(r.perPage || []).join('/')} per page, steps ${(r.steps || []).map((s) => `${s.w}${s.beside ? 'b' : 'u'}`).join(' ')}`);
            if (n % 25 === 0) console.log(`  ${n}/${jobs.length} builds, ${findings.length} findings, ${Math.round((Date.now() - t0) / 1000)}s`);
        }
        if (OUT) {
            fs.mkdirSync(path.dirname(path.resolve(ROOT, OUT)), { recursive: true });
            fs.writeFileSync(path.resolve(ROOT, OUT), JSON.stringify(rows, null, 1));
        }
        const anchorsSeen = rows.reduce((a, r) => a + (r.anchors || 0), 0);
        console.log(`ws-anchor-steps: ${jobs.length} builds, ${anchorsSeen} anchor / Model cells measured, ${findings.length} findings`);
        for (const f of findings.slice(0, 200)) console.log('  ' + f);
        if (findings.length > 200) console.log(`  ... ${findings.length - 200} more`);
        failed = findings.length > 0;
    } finally {
        await app.close();
    }
    console.log(`ws-anchor-steps: ${failed ? 'FAIL' : 'OK'}`);
    if (failed && !has('report-only')) process.exitCode = 1;
})().catch((e) => { console.error(e); process.exitCode = 2; });

/** In the page: one build, laid out in an A4 document, measured. */
async function measureBuild({ size, role, anchors, skills }) {
    const MM = 96 / 25.4;
    const zonePt = { S: 9, M: 10, L: 12 }[size] || 12;
    // anchors.js stepsMinMm: 18 characters of the step type (0.5 em each) and the number circle.
    const minChars = 18 * 0.5 * zonePt * 0.92 * 25.4 / 72 + 6.2;
    const findings = [];
    let r;
    try {
        r = await window.buildSheet({
            role, size, look: 'auto', paper: 'A4', seed: 4242, key: true, anchors,
            sections: [{ skills: skills.map((k) => { const [categoryId, skillId] = k.split(':'); return { categoryId, skillId }; }), columns: 'auto' }],
        });
    } catch (e) {
        if (e && e.unsupported) return { unsupported: e.message, findings: [] };
        return { error: (e && e.stack) || String(e), findings: [] };
    }
    const f = document.createElement('iframe');
    f.style.cssText = 'position:absolute;left:-6000px;top:0;width:900px;height:1300px;border:0';
    document.body.appendChild(f);
    try {
        await new Promise((res) => { f.onload = res; f.srcdoc = window.sheetDocument(r.pupilHtml, 'sweep', { paper: 'A4' }); });
        const d = f.contentDocument;
        await d.fonts.ready;
        await new Promise((res) => setTimeout(res, 50));
        const rect = (el) => el.getBoundingClientRect();
        const leaves = (cell) => {
            const cr = rect(cell);
            for (const el of cell.querySelectorAll('*')) {
                const er = rect(el);
                if (!er.width && !er.height) continue;
                if (getComputedStyle(el).position === 'absolute') continue;
                if (er.right > cr.right + 1.5 || er.left < cr.left - 1.5 || er.bottom > cr.bottom + 1.5) {
                    return `<${el.tagName.toLowerCase()} class="${String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).slice(0, 40)}"> leaves the cell by ${(Math.max(er.right - cr.right, cr.left - er.left, er.bottom - cr.bottom) / MM).toFixed(1)} mm`;
                }
            }
            return '';
        };
        /** Line boxes of a text element (Range client rects, merged by top). */
        const lineCount = (el) => {
            const rg = d.createRange();
            rg.selectNodeContents(el);
            const tops = new Set([...rg.getClientRects()].filter((x) => x.width > 0.5).map((x) => Math.round(x.top)));
            return tops.size || 1;
        };
        const wordy = (el) => {
            const words = el.textContent.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
            const lines = lineCount(el);
            return words >= 3 && lines >= 2 && words / lines < 2 ? `"${el.textContent.trim().slice(0, 40)}" prints ${words} words on ${lines} lines` : '';
        };
        const pages = [...d.querySelectorAll('.ws-page')];
        const perPage = pages.map((pg) => pg.querySelectorAll('[data-ws-label="letter"],[data-ws-label="tab"]').length);
        let nAnchors = 0;
        const steps = [];
        pages.forEach((pg, pi) => {
            // S5 / S6 anchors (independent, more practice, mixed practice)
            for (const a of pg.querySelectorAll('.mq-anchor')) {
                nAnchors++;
                const cell = a.closest('.ws-cell');
                const where = `p${pi + 1} anchor ${a.getAttribute('data-ws-anchor')}`;
                const out = cell ? leaves(cell) : '';
                if (out) findings.push(`STEPS-LEAVE ${where}: ${out}`);
                const draw = a.querySelector('.mq-anchor-cell');
                for (const ol of a.querySelectorAll('ol.mq-anchor-steps')) {
                    const w = rect(ol).width / MM;
                    const beside = !!(draw && ol.parentElement.classList.contains('mq-anchor-beside') && rect(ol).left >= rect(draw).right - 1 && rect(ol).top < rect(draw).bottom - 1);
                    steps.push({ where, w: Math.round(w * 10) / 10, beside });
                    if (w < minChars - 0.5) findings.push(`STEPS-COL ${where}: a steps column of ${w.toFixed(1)} mm holds fewer than 18 characters (${minChars.toFixed(1)} mm)`);
                    for (const s of ol.querySelectorAll('li span')) { const wd = wordy(s); if (wd) { findings.push(`STEPS-WORD ${where}: ${wd}`); break; } }
                }
                if (cell) {
                    const cr = rect(cell);
                    const cs = getComputedStyle(cell);
                    let bottom = cr.top + (parseFloat(cs.paddingTop) || 0);
                    for (const el of cell.querySelectorAll('*')) { const er = rect(el); if (er.height && getComputedStyle(el).position !== 'absolute') bottom = Math.max(bottom, er.bottom); }
                    const band = (cr.bottom - (parseFloat(cs.paddingBottom) || 0) - bottom) / cr.height;
                    if (band >= 0.3) findings.push(`STEPS-H13 ${where}: ${Math.round(band * 100)}% of the anchor cell (${(cr.height / MM).toFixed(0)} mm) is empty under its content`);
                }
            }
            // The Guided page's worked lines under / beside its Model cell
            for (const ul of pg.querySelectorAll('.mq-worklines')) {
                nAnchors++;
                const cell = ul.closest('.ws-cell');
                const where = `p${pi + 1} guided model`;
                const out = cell ? leaves(cell) : '';
                if (out) findings.push(`STEPS-LEAVE ${where}: ${out}`);
                const w = rect(ul).width / MM;
                steps.push({ where, w: Math.round(w * 10) / 10, beside: false });
                // The list is sized to its lines (width:auto): narrow is only a squeeze when a line wraps.
                const wraps = [...ul.querySelectorAll('li')].some((li) => lineCount(li) >= 2);
                if (wraps && w < minChars - 0.5) findings.push(`STEPS-COL ${where}: worked lines wrap in ${w.toFixed(1)} mm (< ${minChars.toFixed(1)} mm)`);
                for (const li of ul.querySelectorAll('li')) { const wd = wordy(li); if (wd) { findings.push(`STEPS-WORD ${where}: ${wd}`); break; } }
            }
            // The lesson's anchor chart panels
            for (const st of pg.querySelectorAll('.mq-cstate')) {
                nAnchors++;
                const cell = st.closest('.ws-cell');
                const where = `p${pi + 1} lesson chart`;
                const out = cell ? leaves(cell) : '';
                if (out) findings.push(`STEPS-LEAVE ${where}: ${out}`);
                const side = st.querySelector('.mq-cside');
                if (side) {
                    const w = rect(side).width / MM;
                    steps.push({ where, w: Math.round(w * 10) / 10, beside: true });
                    if (w < minChars - 0.5) findings.push(`STEPS-COL ${where}: step text beside the drawing in ${w.toFixed(1)} mm (< ${minChars.toFixed(1)} mm)`);
                }
                for (const b of st.querySelectorAll('.mq-chead b, .mq-cwords > div')) { const wd = wordy(b); if (wd) { findings.push(`STEPS-WORD ${where}: ${wd}`); break; } }
            }
        });
        return { pages: pages.length, perPage, anchors: nAnchors, steps, findings: [...new Set(findings)] };
    } finally {
        f.remove();
    }
}
