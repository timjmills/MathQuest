// Render what the independent critic grades (design/audit/RUBRIC.md).
//
// For every skill in scope this writes, under <out>/<category>__<skill>/:
//   print-p1.png ... print-pN.png   the pupil pages, exactly as the teacher's print dialog produces
//                                   them, printed to an A4 PDF by Chrome and rasterised
//   key-p1.png ...                  the answer-key pages of the same print
//   card-1280.png card-820.png card-390.png   the practice card (student view)
//   worksheet-1280.png              the online worksheet grid (student view)
//   quiz-1280.png                   the quiz-taking view
//   meta.json                       what the renderer measured (colours, fonts, overflow, targets)
// and <out>/manifest.json listing every skill rendered.
//
//   node tests/scripts/ws-grade-render.cjs --family redone            # operations + K-2 (the redone skills)
//   node tests/scripts/ws-grade-render.cjs --family operations
//   node tests/scripts/ws-grade-render.cjs --skills addition:add_20_regroup,composing:base10_build
//   node tests/scripts/ws-grade-render.cjs --sample 24 --out tests/audit-runs/baseline
//   node tests/scripts/ws-grade-render.cjs --count 6 --no-screen      # print only, 6 items
//   node tests/scripts/ws-grade-render.cjs --resume                   # skip skills already rendered
//   node tests/scripts/ws-grade-render.cjs --range 1000 --skills number_sense:nearest_100
//                                          # at Max Number 1,000 (the print dialog's #rangeSelect)
//   node tests/scripts/ws-grade-render.cjs --roles independent,more-practice --skills addition:add_20_regroup
//                                          # the PAGE ENGINE (P7.2): each role through window.buildSheet
//
// --roles r1,r2  renders each page role through the sheet engine (js/modules/print-sheet.js
//                `buildSheet` -> `sheetDocument`), prints the pupil sheet and its key as two A4
//                PDFs and rasterises them to <role>-p1.png ... and <role>-key-p1.png ..., recording
//                the engine's `fits` and an overflow check in meta.json under `roles`. With
//                --roles the legacy print path is skipped unless --legacy-print is also given.
//                The item count is one page (the role's own capacity) unless --count is given.
//                --size S|M|L, --look ican|daily and --paper A4|Letter pass through to buildSheet.
//                Every role buildSheet knows is accepted (SHEET_ROLES in print-sheet.js): the two
//                practice roles, opener, scripted-model, guided, error-analysis, review, test,
//                pre-skill-check, word-problems, fact-rows, fact-probe, mixed-practice,
//                true-false, reason-it, stretch. A role the skill cannot take (a fact layout for
//                a non-fact skill) is recorded as `unsupported` with its reason, not an error.
// --set c:s,c:s  the skills of ONE multi-skill sheet (Mixed practice, or a grouped Independent):
//                rendered once under <out>/set__<first skill>+N/ with every --roles role.
//
// Deterministic: the app runs with a seeded Math.random, reseeded per skill and per host from
// hash(category:skill), so the same tree renders the same items.
//
// Output goes under tests/audit-runs/ (git-ignored). Needs python3 with PyMuPDF to rasterise.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ROOT, open, waitFor, listSkills, renderPrint, hideOverlays } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes('--' + k);

const OPS_CATS = ['addition', 'subtraction', 'multiplication', 'division'];
const K2_CATS = ['counting', 'comparing', 'composing', 'counting_mixed'];
const FAMILIES = { operations: OPS_CATS, k2: K2_CATS, redone: [...OPS_CATS, ...K2_CATS] };

const FAMILY = arg('family', null);
const ONLY = (arg('skills', '') || '').split(',').map(s => s.trim()).filter(Boolean);
const SAMPLE = parseInt(arg('sample', '0'), 10);
const COUNT = parseInt(arg('count', '20'), 10);          // the print dialog's default section size
const OUT = path.resolve(ROOT, arg('out', `tests/audit-runs/${new Date().toISOString().slice(0, 10)}`));
const DPI = parseInt(arg('dpi', '96'), 10);
const NO_SCREEN = has('no-screen');
const NO_PRINT = has('no-print');
const RESUME = has('resume');
const ROLES = (arg('roles', '') || '').split(',').map(s => s.trim()).filter(Boolean);
const LEGACY_PRINT = !ROLES.length || has('legacy-print');
const ROLE_COUNT = has('count') ? COUNT : undefined;     // roles: one page unless asked
const ROLE_SIZE = arg('size', 'L');
const ROLE_LOOK = arg('look', 'auto');
const ROLE_PAPER = arg('paper', 'A4');
// Max Number for every surface. A place-value skill whose place needs more than the default 100
// (Round to the nearest 100 needs 1,000) is refused below it, so its page is only visible here.
const RANGE = arg('range', null);
async function applyRange(page) {
    if (!RANGE) return;
    await page.evaluate((v) => {
        const sel = document.getElementById('rangeSelect');
        if (sel) {
            if (![...sel.options].some(o => o.value === String(v))) sel.add(new Option(String(v), String(v)));
            sel.value = String(v);
        }
        if (window.state) window.state.range = Number(v);
    }, RANGE);
}
const SET = (arg('set', '') || '').split(',').map(s => s.trim()).filter(Boolean);

const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const slug = s => `${s.categoryId}__${s.skillId}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------------------------------------------------------------- rasterising the PDF
const RASTER_PY = `
import sys, json, pymupdf
src, outdir, dpi = sys.argv[1], sys.argv[2], int(sys.argv[3])
d = pymupdf.open(src)
pages = []
key = False
n_print = n_key = 0
for i, p in enumerate(d):
    t = p.get_text()
    if 'Answer Key' in t or 'ANSWER KEY' in t: key = True
    if key: n_key += 1; name = 'key-p%d.png' % n_key
    else: n_print += 1; name = 'print-p%d.png' % n_print
    p.get_pixmap(dpi=dpi).save(outdir + '/' + name)
    words = len(t.split())
    pages.append({'file': name, 'key': key, 'words': words})
print(json.dumps(pages))
`;

function rasterise(pdf, dir) {
    const out = execFileSync('python3', ['-c', RASTER_PY, pdf, dir, String(DPI)], { encoding: 'utf8' });
    return JSON.parse(out.trim().split('\n').pop());
}

// ---------------------------------------------------------------- measuring a host
// Colours, fonts and overflow the critic cannot measure from a PNG.
function measure(page, selector) {
    return page.evaluate((selector) => {
        const root = document.querySelector(selector);
        if (!root) return { missing: true };
        const colours = new Map(); const fonts = new Map();
        const grey = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return true; const [r, g, b, a = 1] = m[1].split(',').map(Number); if (+a === 0) return true; return Math.abs(r - g) < 6 && Math.abs(g - b) < 6; };
        const note = (map, k) => map.set(k, (map.get(k) || 0) + 1);
        for (const el of root.querySelectorAll('*')) {
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            for (const prop of ['color', 'backgroundColor', 'fill', 'stroke', 'borderTopColor']) {
                const v = cs[prop];
                if (v && v !== 'none' && !grey(v)) note(colours, `${prop}:${v}`);
            }
            if (el.childNodes && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) note(fonts, cs.fontFamily.split(',')[0].replace(/["']/g, '').trim());
            if (cs.boxShadow && cs.boxShadow !== 'none') note(colours, 'box-shadow');
            if (cs.filter && cs.filter !== 'none') note(colours, `filter:${cs.filter}`);
        }
        const targets = [];
        for (const el of root.querySelectorAll('input, button, select, textarea, [role="button"], [onclick]')) {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height) continue;
            const s = getComputedStyle(el);
            if (s.display === 'none' || s.visibility === 'hidden') continue;
            if (Math.min(r.width, r.height) < 44) targets.push({ tag: el.tagName.toLowerCase(), cls: String(el.className || '').slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), text: (el.innerText || el.value || '').trim().slice(0, 24) });
        }
        const de = document.documentElement;
        return {
            hScroll: de.scrollWidth > de.clientWidth + 1 ? de.scrollWidth - de.clientWidth : 0,
            colours: [...colours.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12),
            fonts: [...fonts.entries()].sort((a, b) => b[1] - a[1]),
            smallTargets: targets.slice(0, 20),
            smallTargetCount: targets.length,
        };
    }, selector);
}

async function viewport(page, width, height) {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await sleep(150);
}

// ---------------------------------------------------------------- the three screen hosts
async function renderCard(page, skill, width, height, file) {
    await viewport(page, width, height);
    await hideOverlays(page);
    const info = await page.evaluate(({ skill, seed }) => {
        try {
            if (window.__wsReseed) window.__wsReseed(seed);
            const st = window.state;
            st.category = skill.categoryId; st.skill = skill.skillId;
            st.gameMode = 'practice'; st.isMixedMode = false;
            window.showView('gameView');
            const q = window.generateQuestion();
            if (!q || (!q.text && !q.visual)) return { error: 'empty question' };
            st.currentQ = q;
            window.renderQuestion();
            window.scrollTo(0, 0);
            return { answerType: q.answerType || '', printFormat: q.printFormat || '', text: String(q.text || '').slice(0, 200), ans: String(q.ans).slice(0, 80) };
        } catch (e) { return { error: e.message || String(e) }; }
    }, { skill, seed: hash(slug(skill) + ':card') });
    if (info.error) return { error: info.error };
    await sleep(300);
    const el = await page.$('#gameView');
    await (el || page).screenshot({ path: file, ...(el ? {} : { fullPage: true }) });
    return { ...info, measure: await measure(page, '#questionCard') };
}

async function renderWorksheet(page, skill, file) {
    await viewport(page, 1280, 900);
    await hideOverlays(page);
    const info = await page.evaluate(({ skill, seed }) => {
        try {
            if (window.__wsReseed) window.__wsReseed(seed);
            const st = window.state;
            st.category = skill.categoryId; st.skill = skill.skillId;
            st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6;
            window.initWorksheet();
            window.scrollTo(0, 0);
            return { cards: document.querySelectorAll('#worksheetGrid .problem-card').length };
        } catch (e) { return { error: e.message || String(e) }; }
    }, { skill, seed: hash(slug(skill) + ':worksheet') });
    if (info.error) return { error: info.error };
    await sleep(400);
    const el = await page.$('#worksheetView');
    await (el || page).screenshot({ path: file, ...(el ? {} : { fullPage: true }) });
    return { ...info, measure: await measure(page, '#worksheetGrid') };
}

async function renderQuiz(page, skill, file) {
    await viewport(page, 1280, 900);
    await hideOverlays(page);
    const info = await page.evaluate(async ({ skill, seed }) => {
        try {
            const questions = [];
            for (let i = 0; i < 3; i++) {
                const q = window.generateQuestionFor({ category: skill.categoryId, skill: skill.skillId, seed: seed + i, itemIndex: i });
                if (!q) continue;
                questions.push({ id: i, skillId: skill.skillId, points: 1, questionData: { text: q.text, ans: q.ans, hint: q.hint, options: q.options, answerType: q.answerType, visual: q.visual, skillLabel: q.skillLabel } });
            }
            if (!questions.length) return { error: 'no quiz questions' };
            const test = {
                id: null, name: 'Audit quiz', createdAt: null, updatedAt: null,
                sections: [{ id: 0, label: 'Problem Set A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 },
            };
            window.handleQuizURL(window.compressTestForURL(test));
            const name = document.getElementById('qtStudentName');
            if (!name) return { error: 'quiz landing did not render' };
            name.value = 'Audit'; name.dispatchEvent(new Event('input'));
            window.startQuizTest();
            window.scrollTo(0, 0);
            return { questions: questions.length };
        } catch (e) { return { error: e.message || String(e) }; }
    }, { skill, seed: hash(slug(skill) + ':quiz') });
    if (info.error) return { error: info.error };
    await sleep(400);
    const el = await page.$('#quizTakeView');
    await (el || page).screenshot({ path: file, ...(el ? {} : { fullPage: true }) });
    const m = await measure(page, '#quizTakeView');
    // leave quiz mode so the next host starts clean
    await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) {} });
    return { ...info, measure: m };
}

// ---------------------------------------------------------------- the printed sheet
async function renderPrinted(page, skill, dir) {
    await viewport(page, 1280, 900);
    await page.evaluate(seed => { if (window.__wsReseed) window.__wsReseed(seed); }, hash(slug(skill) + ':print'));
    await applyRange(page);
    await renderPrint(page, skill, { problemCount: COUNT, includeAnswerKey: true });
    const dom = await measure(page, '#printPreviewContent');
    // The preview's "Download PDF" button (downloadPDF, print-generate.js) writes a standalone
    // sheet document into a hidden iframe and prints that. We let it build the document, stub
    // the iframe's print() so headless Chrome does not block, and print the same document to A4
    // with Chrome's defaults (no background graphics), as a teacher's browser would.
    // (The "Print" button's own path hides its output under `.container { display: none }` in
    // @media print, so it cannot be the path teachers' sheets come from.)
    const html = await page.evaluate(async () => {
        let f = document.getElementById('pdfPrintFrame');
        if (!f) {
            f = document.createElement('iframe');
            f.id = 'pdfPrintFrame';
            f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
            document.body.appendChild(f);
        }
        f.contentWindow.print = () => {};
        f.contentWindow.focus = () => {};
        await window.downloadPDF();
        return '<!doctype html>' + f.contentDocument.documentElement.outerHTML;
    });
    const sheet = await page.browser().newPage();
    try {
        await sheet.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
        await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });   // same origin, so relative assets resolve
        await sheet.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
        await sheet.evaluate(() => document.fonts && document.fonts.ready);
        await sleep(250);
        const pdf = path.join(dir, 'print.pdf');
        await sheet.pdf({ path: pdf, format: 'A4', printBackground: false, preferCSSPageSize: true });
    } finally { await sheet.close(); }
    const pdf = path.join(dir, 'print.pdf');
    const pages = rasterise(pdf, dir);
    fs.unlinkSync(pdf);
    return { pages, measure: dom };
}

// ---------------------------------------------------------------- the page engine (--roles)
const RASTER_PREFIX_PY = `
import sys, json, pymupdf
src, outdir, dpi, prefix = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
d = pymupdf.open(src)
pages = []
for i, p in enumerate(d):
    name = '%s-p%d.png' % (prefix, i + 1)
    p.get_pixmap(dpi=dpi).save(outdir + '/' + name)
    pages.append({'file': name, 'words': len(p.get_text().split()), 'w_mm': round(p.rect.width * 25.4 / 72, 1), 'h_mm': round(p.rect.height * 25.4 / 72, 1)})
print(json.dumps(pages))
`;

function rasterisePrefix(pdf, dir, prefix) {
    const out = execFileSync('python3', ['-c', RASTER_PREFIX_PY, pdf, dir, String(DPI), prefix], { encoding: 'utf8' });
    return JSON.parse(out.trim().split('\n').pop());
}

// What the critic cannot see in a PNG: does anything overflow its cell, its page or the live
// area, which fonts rendered, how many cells each page holds.
function sheetCheck(page) {
    return page.evaluate(() => {
        const out = { pages: 0, cells: [], problems: [], fonts: {}, fontsReady: document.documentElement.getAttribute('data-ws-fonts') === 'ready',
            andika: !!(document.fonts && document.fonts.check('700 28px Andika') && document.fonts.check('400 28px Andika')) };
        document.querySelectorAll('.ws-page').forEach((pg, i) => {
            out.pages++;
            if (pg.scrollHeight > pg.clientHeight + 1 || pg.scrollWidth > pg.clientWidth + 1) out.problems.push(`page ${i + 1}: content overflows the sheet`);
            const body = pg.querySelector('.ws-body');
            if (body && body.scrollHeight > body.clientHeight + 1) out.problems.push(`page ${i + 1}: the body overflows by ${((body.scrollHeight - body.clientHeight) * 25.4 / 96).toFixed(1)} mm`);
            let n = 0;
            pg.querySelectorAll('[data-ws-cell]').forEach((c, k) => {
                n++;
                const cr = c.getBoundingClientRect();
                if (c.scrollHeight > c.clientHeight + 1 || c.scrollWidth > c.clientWidth + 1) out.problems.push(`page ${i + 1} cell ${k + 1}: content overflows its cell`);
                for (const el of c.querySelectorAll('*')) {
                    const r = el.getBoundingClientRect();
                    if (!r.width && !r.height) continue;
                    if (r.right > cr.right + 1 || r.bottom > cr.bottom + 1 || r.left < cr.left - 1) { out.problems.push(`page ${i + 1} cell ${k + 1}: <${el.tagName.toLowerCase()} class="${String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).slice(0, 40)}"> leaves the cell`); break; }
                }
            });
            out.cells.push(n);
            for (const el of pg.querySelectorAll('*')) {
                if (![...el.childNodes].some(t => t.nodeType === 3 && t.textContent.trim())) continue;
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
        await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });   // same origin, so the links resolve
        await sheet.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
        await sheet.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
        await sheet.evaluate(() => document.fonts && document.fonts.ready);
        await sleep(200);
        const check = await sheetCheck(sheet);
        await sheet.pdf({ path: pdfPath, printBackground: false, preferCSSPageSize: true });
        return check;
    } finally { await sheet.close(); }
}

async function renderRole(page, skill, role, dir) {
    await viewport(page, 1280, 900);
    await applyRange(page);
    const seed = hash(slug(skill) + ':' + role) % 1000000;
    const set = skill.set || [{ categoryId: skill.categoryId, skillId: skill.skillId }];
    const built = await page.evaluate(async ({ skill, set, role, seed, count, size, look, paper }) => {
        try {
            const r = await window.buildSheet({
                role, sections: [{ skills: set, count, columns: 'auto' }],
                size, look, paper, seed, form: 'A', key: true,
            });
            const title = r.title || skill.label;
            return {
                pupil: window.sheetDocument(r.pupilHtml, title, { paper }),
                key: window.sheetDocument(r.keyHtml, title + ' - Answer Key', { paper }),
                fits: r.fits, pageCount: r.pageCount, keyPageCount: r.keyPageCount, seed: r.seed, title,
                notes: r.notes, gaps: (r.gaps || []).slice(0, 12),
                items: r.items.map(it => ({ template: it.template, fclass: it.fclass, text: it.text.slice(0, 80), ans: typeof it.ans === 'object' ? JSON.stringify(it.ans) : String(it.ans), letter: it.letter, measured: it.measured })),
            };
        } catch (e) { return e && e.unsupported ? { unsupported: e.message } : { error: (e && e.stack) || String(e) }; }
    }, { skill, set, role, seed, count: ROLE_COUNT, size: ROLE_SIZE, look: ROLE_LOOK, paper: ROLE_PAPER });
    if (built.error) return { error: built.error };
    if (built.unsupported) return { unsupported: built.unsupported };
    const pdfP = path.join(dir, `${role}.pdf`);
    const pdfK = path.join(dir, `${role}-key.pdf`);
    const checkP = await printDoc(page, built.pupil, pdfP);
    const checkK = await printDoc(page, built.key, pdfK);
    const pages = rasterisePrefix(pdfP, dir, role);
    const keyPages = rasterisePrefix(pdfK, dir, `${role}-key`);
    fs.unlinkSync(pdfP); fs.unlinkSync(pdfK);
    const { pupil, key, ...rest } = built;
    return { ...rest, pages, keyPages, check: checkP, keyCheck: checkK };
}

// ---------------------------------------------------------------- main
(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const app = await open({ seed: 1 });
    const { page, problems } = app;
    await page.evaluate(() => { try { window.setUserRole('student'); } catch (e) {} });

    let skills = await listSkills(page);
    skills = skills.filter(s => !/^_?tomb|retired/i.test(s.skillId) && !/\(retired\)/i.test(s.label || ''));
    if (FAMILY) {
        if (!FAMILIES[FAMILY]) throw new Error(`unknown --family ${FAMILY} (${Object.keys(FAMILIES).join(', ')})`);
        skills = skills.filter(s => FAMILIES[FAMILY].includes(s.categoryId));
    }
    if (ONLY.length) skills = skills.filter(s => ONLY.includes(`${s.categoryId}:${s.skillId}`) || ONLY.includes(s.skillId));
    if (SET.length) {
        const set = SET.map(k => { const [categoryId, skillId] = k.split(':'); return { categoryId, skillId }; });
        const first = skills.find(s => `${s.categoryId}:${s.skillId}` === SET[0]) || { label: SET[0] };
        skills = [{ categoryId: 'set', skillId: `${set[0].skillId}+${set.length - 1}`, label: `Set: ${first.label}`, grade: first.grade, set }];
    }
    const tombs = await page.evaluate(() => {
        const out = [];
        try { for (const [c, arr] of Object.entries(window.SKILLS)) for (const s of arr || []) if (s && (s.retired || s.tombstone || s.hidden)) out.push(`${c}:${s.v}`); } catch (e) {}
        return out;
    });
    skills = skills.filter(s => !tombs.includes(`${s.categoryId}:${s.skillId}`));
    if (SAMPLE > 0 && skills.length > SAMPLE) {
        // Stratified: every category keeps at least one skill, then an even stride through the rest.
        const byCat = new Map();
        for (const s of skills) { if (!byCat.has(s.categoryId)) byCat.set(s.categoryId, []); byCat.get(s.categoryId).push(s); }
        const picked = new Set();
        for (const arr of byCat.values()) picked.add(arr[0]);
        const stride = skills.length / Math.max(1, SAMPLE - picked.size);
        for (let i = 0; picked.size < SAMPLE && i < skills.length; i += stride) picked.add(skills[Math.floor(i)]);
        skills = skills.filter(s => picked.has(s));
    }
    console.log(`ws-grade-render: ${skills.length} skills -> ${path.relative(ROOT, OUT)}`);

    const manifest = [];
    const t0 = Date.now();
    for (const [i, s] of skills.entries()) {
        const dir = path.join(OUT, slug(s));
        if (RESUME && fs.existsSync(path.join(dir, 'meta.json'))) { manifest.push(JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'))); continue; }
        fs.mkdirSync(dir, { recursive: true });
        const errorsBefore = problems.length;
        const meta = { skill: `${s.categoryId}:${s.skillId}`, category: s.categoryId, skillId: s.skillId, label: s.label, grade: s.grade, dir: path.relative(OUT, dir) };
        try {
            if (!NO_PRINT && LEGACY_PRINT && !s.set) meta.print = await renderPrinted(page, s, dir);
        } catch (e) { meta.print = { error: e.message }; }
        if (ROLES.length && !NO_PRINT) {
            meta.roles = {};
            for (const role of ROLES) {
                try { meta.roles[role] = await renderRole(page, s, role, dir); } catch (e) { meta.roles[role] = { error: e.message }; }
            }
        }
        await hideOverlays(page);
        if (!NO_SCREEN && !s.set) {
            meta.screen = {};
            for (const [w, h] of [[1280, 900], [820, 1180], [390, 844]]) {
                try { meta.screen[`card-${w}`] = await renderCard(page, s, w, h, path.join(dir, `card-${w}.png`)); } catch (e) { meta.screen[`card-${w}`] = { error: e.message }; }
            }
            try { meta.screen['worksheet-1280'] = await renderWorksheet(page, s, path.join(dir, 'worksheet-1280.png')); } catch (e) { meta.screen['worksheet-1280'] = { error: e.message }; }
            try { meta.screen['quiz-1280'] = await renderQuiz(page, s, path.join(dir, 'quiz-1280.png')); } catch (e) { meta.screen['quiz-1280'] = { error: e.message }; }
        }
        meta.consoleErrors = problems.slice(errorsBefore).map(p => p.text).slice(0, 10);
        fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
        manifest.push(meta);
        const el = ((Date.now() - t0) / 1000).toFixed(0);
        const roleLine = meta.roles ? Object.entries(meta.roles).map(([r, v]) => v.error ? `${r} ERR` : v.unsupported ? `${r} n/a` : `${r} ${v.pages.length}p+${v.keyPages.length}k ${v.fits && v.fits.cols}x${v.fits && v.fits.rows}${(v.check.problems.length + v.keyCheck.problems.length) ? ' OVERFLOW' : ''}`).join('  ') : '';
        const printLine = meta.print ? `print ${meta.print.pages ? meta.print.pages.length + 'p' : 'ERR'}` : '';
        console.log(`  [${i + 1}/${skills.length}] ${meta.skill}  ${[printLine, roleLine].filter(Boolean).join('  ')}  ${el}s`);
    }
    fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
    await app.close();
    console.log(`ws-grade-render: done, ${manifest.length} skills, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
})().catch(e => { console.error('ws-grade-render: FAIL -', e.stack || e.message); process.exit(1); });
