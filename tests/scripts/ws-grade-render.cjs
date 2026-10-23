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
//                --lesson '{"practicePages":1,"mixed":true}' sets the lesson packet's options (role lesson).
//                Every role buildSheet knows is accepted (SHEET_ROLES in print-sheet.js): the two
//                practice roles, opener, scripted-model, guided, error-analysis, review, test,
//                pre-skill-check, word-problems, fact-rows, fact-probe, mixed-practice,
//                true-false, reason-it, stretch. A role the skill cannot take (a fact layout for
//                a non-fact skill) is recorded as `unsupported` with its reason, not an error.
// --supports all|id,id   S2: every skill carries supports (all = every render-time value its
//                Support control offers; else the listed ids it offers), on the roles and the screen
//                hosts (the set's option store). --cover whole|needed|fade and --mix section|problem
//                set the sheet's spread (buildSheet `coverage` / `mix`; the skill's cover / mix on screen).
// --set c:s,c:s  the skills of ONE multi-skill sheet (Mixed practice, or a grouped Independent):
//                rendered once under <out>/set__<first skill>+N/ with every --roles role.
//
// Deterministic: the app runs with a seeded Math.random, reseeded per skill and per host from
// hash(category:skill), so the same tree renders the same items.
//
// ---- Golden renders, the diff and contact sheets (IMPROVEMENT_PLAN §1.3, §1.4 S4) ----
//
//   node tests/scripts/ws-grade-render.cjs --template function-table --golden write
//   node tests/scripts/ws-grade-render.cjs --template function-table --golden diff      # critic brief
//   node tests/scripts/ws-grade-render.cjs --template stack --limit 2 --contact-sheet
//   node tests/scripts/ws-grade-render.cjs --template function-table --scores design/audit/runs/<run>/grades.jsonl --run <run> --round 3
//   node tests/scripts/ws-grade-render.cjs --envelope stack--single --golden write        # ws-envelope's all-pairs sample
//   node tests/scripts/ws-grade-render.cjs --envelope stack--single --sample pairs.json --contact-sheet
//
// --template <id>   every live skill whose kit cell template is <id>: the template kitCellSpec
//                   (print-generate.js, the resolver buildSheet itself uses) gives the most items
//                   of 8 seeded generateQuestionFor items. --template-any also takes a skill that
//                   deals <id> on any of the 8. --limit N keeps the first N skills (any mode).
// --golden write    renders into design/audit/golden/<name>/renders/ (git-ignored PNGs) and writes
//                   design/audit/golden/<name>/manifest.json: one entry per page — print pages per
//                   (role, size, pupil|key, page n) and the screen hosts (practice card 1280 / 820 /
//                   390 and 1366 x 768, online worksheet 1280, quiz 1280) — with its render path, its
//                   CONTENT HASH (sha256 of the canonical cell/page DOM, ids renamed; not pixels), the
//                   seed, the measured numbers, and the per-criterion scores with their source (critic
//                   run + round) and the RULE-SET VERSION they were given under. A page whose hash is
//                   unchanged keeps its recorded score; a changed page loses it. <name> is the
//                   template, the envelope pair, or --golden-name.
// --golden diff     renders now (into tests/audit-runs/golden-diff/<name>/), compares with the
//                   manifest and writes <out>/critic-brief.md: the changed / new / removed pages,
//                   the stale scores (the rule set changed, or the score is more than 2 rounds old:
//                   --round N gives the current round), a seeded 20 % sample of the rest
//                   (--sample-pct, --sample-seed), the recorded score and source of every unchanged
//                   page, and the PASS table of every page with where its score came from.
//                   Last line `ws-grade-render: OK` when no page changed, else FAIL (exit 1;
//                   --report-only exits 0). Content hashes only say WHICH PAGES CHANGED; they never
//                   decide inheritance (that is the structural fingerprint, ws-envelope, §1.6.2).
// --scores <grades.jsonl>  imports a critic's grades into the manifest (no browser): records match by
//                   "page" (a manifest page id) or by skill + version ("independent@M", "independent-M",
//                   "card-1280") + size + page ("pupil"|"key"), the shapes past runs used. --run and
//                   --round fill a record that lacks "run" / "round".
// --contact-sheet   composes <out>/contact/*.png for a batch reading (§1.6.3 step 3): the A4 pages at
//                   150 dpi (≈ 1240 px wide) two to a sheet with the measured numbers beside each
//                   (digit size, answer-slot sizes, the largest empty band in a cell, free space at
//                   the foot), and one screen sheet per skill (1280 / 820 / 390 / 1366 x 768,
//                   worksheet, quiz); <out>/contact/index.md lists them.
// --envelope <template>--<kind>  renders the all-pairs sample `node tests/scripts/ws-envelope.mjs
//                   --envelope <pair> --json` prints, or the file given with --sample <file.json>.
//                   Expected JSON: an array, or {sample: [...]} / {pages: [...]}, of entries
//                   {"skill": "cat:skill", "opts": {...}, "size": "S|M|L", "role": "independent"}
//                   ("kind": "single|sections|mixed" stands in for role; size defaults to M, role
//                   to the pair's kind). Each entry is one unit; its pages carry an opts key.
// In the golden, contact and envelope modes the defaults are --roles independent, --size M,
// --dpi 150, and the 1366 x 768 card is added. --size takes a list (S,M,L).
//
// Output goes under tests/audit-runs/ (git-ignored). Needs python3 with PyMuPDF to rasterise.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ROOT, open, waitFor, listSkills, renderPrint, hideOverlays } = require('../lib/ws-harness.cjs');
const G = require('../lib/ws-golden.cjs');
// MQ_GOLDEN_DUMP=1 writes each hashed canonical DOM beside its PNG (<file>.canon.html), to see why a hash moved
const hashOf = (html, file) => { if (process.env.MQ_GOLDEN_DUMP && file) fs.writeFileSync(file.replace(/\.png$/, '') + '.canon.html', html); return G.contentHash(html); };

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes('--' + k);

// ---- S4 modes (see the header)
const TEMPLATE = arg('template', null);
const TEMPLATE_ANY = has('template-any');
const LIMIT = parseInt(arg('limit', '0'), 10) || 0;
const GOLDEN = arg('golden', null);
if (GOLDEN && !['write', 'diff'].includes(GOLDEN)) { console.error('ws-grade-render: FAIL - --golden write|diff'); process.exit(2); }
const SCORES = arg('scores', null);
const CONTACT = has('contact-sheet');
const ENVELOPE = arg('envelope', null);
const SAMPLE_ARG = arg('sample', '0');
const SAMPLE_FILE = /^\d+$/.test(String(SAMPLE_ARG)) ? null : SAMPLE_ARG;
const GOLDEN_MODE = !!(GOLDEN || CONTACT || ENVELOPE || SAMPLE_FILE);
const GOLDEN_NAME = arg('golden-name', ENVELOPE || TEMPLATE);
const GOLDEN_DIR = GOLDEN_NAME ? path.join(G.REPO, 'design', 'audit', 'golden', GOLDEN_NAME) : null;
const REPORT_ONLY = has('report-only');
const CHROMEBOOK = has('chromebook') || GOLDEN_MODE;

const OPS_CATS = ['addition', 'subtraction', 'multiplication', 'division'];
const K2_CATS = ['counting', 'comparing', 'composing', 'counting_mixed'];
const FAMILIES = { operations: OPS_CATS, k2: K2_CATS, redone: [...OPS_CATS, ...K2_CATS] };

const FAMILY = arg('family', null);
const ONLY = (arg('skills', '') || '').split(',').map(s => s.trim()).filter(Boolean);
const SAMPLE = SAMPLE_FILE ? 0 : parseInt(SAMPLE_ARG, 10);
const COUNT = parseInt(arg('count', '20'), 10);          // the print dialog's default section size
const OUT = arg('out', null) ? path.resolve(ROOT, arg('out'))
    : GOLDEN === 'write' ? path.join(GOLDEN_DIR, 'renders')
        : GOLDEN === 'diff' ? path.join(G.REPO, 'tests', 'audit-runs', 'golden-diff', GOLDEN_NAME)
            : path.resolve(ROOT, `tests/audit-runs/${new Date().toISOString().slice(0, 10)}`);
const DPI = parseInt(arg('dpi', GOLDEN_MODE ? '150' : '96'), 10);
const NO_SCREEN = has('no-screen');
const NO_PRINT = has('no-print');
const RESUME = has('resume');
const ROLES = (arg('roles', '') || '').split(',').map(s => s.trim()).filter(Boolean);
if (GOLDEN_MODE && !ROLES.length) ROLES.push('independent');
const LEGACY_PRINT = !ROLES.length || has('legacy-print');
const ROLE_COUNT = has('count') ? COUNT : undefined;     // roles: one page unless asked
const ROLE_SIZES = (arg('size', GOLDEN_MODE ? 'M' : 'L')).split(',').map(s => s.trim()).filter(Boolean);
const ROLE_SIZE = ROLE_SIZES[0];
// one size and no golden: the old file names (<role>-p1.png); else <role>-<size>-p1.png
const roleKey = (role, size) => (ROLE_SIZES.length > 1 || GOLDEN_MODE ? `${role}-${size}` : role);
const ROLE_LOOK = arg('look', 'auto');
// --anchors off|side|sections  S6 step-by-step anchor problems on the practice roles.
const ROLE_ANCHORS = arg('anchors', 'off');
const ROLE_PAPER = arg('paper', 'A4');
// --lesson '{"practicePages":1,"mixed":true}'  the lesson packet's options (role 'lesson').
const LESSON = arg('lesson', null) ? JSON.parse(arg('lesson', '{}')) : {};
const SUPPORTS = arg('supports', null);
const COVER = arg('cover', null);
const MIX = arg('mix', null);
/** In the page: the options each skill carries under --supports (null = none). */
function supportOptsInPage({ list, SUPPORTS, COVER, MIX }) {
    return list.map(([cat, skill]) => {
        if (!SUPPORTS) return null;
        const def = window.offeredOptionsFor(cat, skill).find((d) => d.id === 'support' && d.supportsModel);
        if (!def) return null;
        const want = SUPPORTS === 'all' ? def.render : SUPPORTS.split(',').filter((v) => def.render.includes(v));
        if (!want.length) return null;
        const o = { support: [...new Set([...(def.default || []), ...want])] };
        if (COVER) o.cover = COVER;
        if (MIX) o.mix = MIX;
        return o;
    });
}
// --opts '{"labels":"some"}'  O6: skill option values every skill in scope carries, on the roles and
// the screen hosts (merged over any --supports). A value a skill does not offer is dropped by the
// app's own normalizeOptions, so one --opts can serve a mixed skill list.
const OPTS = arg('opts', null) ? JSON.parse(arg('opts', '{}')) : null;
const withOpts = (o, unitOpts = null) => ((OPTS || unitOpts) ? Object.assign({}, o || {}, OPTS || {}, unitOpts || {}) : o);
/** Put the --supports / --opts options (and an envelope unit's opts) in the set's option store (the screen hosts read it). */
async function storeSupports(page, skill, unitOpts = null) {
    if (!SUPPORTS && !OPTS && !unitOpts) {
        await page.evaluate(() => { try { window.clearSetOptions({ silent: true }); } catch (e) {} });
        return;
    }
    const [raw] = await page.evaluate(supportOptsInPage, { list: [[skill.categoryId, skill.skillId]], SUPPORTS, COVER, MIX });
    const opts = withOpts(raw, unitOpts);
    await page.evaluate(({ skill, opts }) => {
        window.clearSetOptions({ silent: true });
        if (opts) window.setSetOptions(skill.categoryId, skill.skillId, opts, { silent: true });
    }, { skill, opts });
}
// --columns auto|N  the print dialog's Columns choice for every role (default Auto).
const ROLE_COLUMNS = (() => { const v = arg('columns', 'auto'); return v === 'auto' ? 'auto' : Math.max(1, parseInt(v, 10) || 1); })();
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
async function renderCard(page, skill, width, height, file, fitOnly = false) {
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
    // the Chromebook fit (1366 x 768): what one screen shows, not the whole card
    if (fitOnly) await page.screenshot({ path: file });
    else await (el || page).screenshot({ path: file, ...(el ? {} : { fullPage: true }) });
    return { ...info, seed: hash(slug(skill) + ':card'), contentHash: hashOf(await page.evaluate(G.canonicalHostInPage, '#questionCard'), file), measure: await measure(page, '#questionCard') };
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
    // the grid's scheduled layout passes (worksheet.js, up to 900 ms) end with data-mq-laid-out="1"
    await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !g || g.dataset.mqLaidOut !== '0'; }, { timeout: 5000 }).catch(() => {});
    const el = await page.$('#worksheetView');
    await (el || page).screenshot({ path: file, ...(el ? {} : { fullPage: true }) });
    return { ...info, seed: hash(slug(skill) + ':worksheet'), contentHash: hashOf(await page.evaluate(G.canonicalHostInPage, '#worksheetGrid'), file), measure: await measure(page, '#worksheetGrid') };
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
                // what the quiz builder stores (quiz-take.js quizQuestionData), so the quiz renders as a real one
                const qd = window.quizQuestionData ? window.quizQuestionData(q) : { text: q.text, ans: q.ans, hint: q.hint, options: q.options, answerType: q.answerType, visual: q.visual, skillLabel: q.skillLabel };
                questions.push({ id: i, skillId: skill.skillId, points: 1, questionData: qd });
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
    const contentHash = hashOf(await page.evaluate(G.canonicalHostInPage, '#quizTakeView'), file);
    // leave quiz mode so the next host starts clean
    await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) {} });
    return { ...info, seed: hash(slug(skill) + ':quiz'), contentHash, measure: m };
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
        // S4: the content hash of each printed page (canonical DOM, not pixels) and its measured numbers
        check.pageHashes = (await sheet.evaluate(G.canonicalPagesInPage, '.ws-page')).map((h, i) => hashOf(h, pdfPath.replace(/\.pdf$/, `-p${i + 1}.png`)));
        check.measured = await sheet.evaluate(G.measurePagesInPage);
        await sheet.pdf({ path: pdfPath, printBackground: false, preferCSSPageSize: true });
        return check;
    } finally { await sheet.close(); }
}

async function renderRole(page, skill, role, dir, { size = ROLE_SIZE, unitOpts = null, prefix = role } = {}) {
    await viewport(page, 1280, 900);
    await applyRange(page);
    const seed = hash(slug(skill) + ':' + role) % 1000000;
    const set = skill.set || [{ categoryId: skill.categoryId, skillId: skill.skillId }];
    const supOpts = (await page.evaluate(supportOptsInPage, { list: set.map((k) => [k.categoryId, k.skillId]), SUPPORTS, COVER: null, MIX: null })).map((o) => withOpts(o, unitOpts));
    const built = await page.evaluate(async ({ skill, set, role, seed, count, size, look, paper, anchors, supOpts, COVER, MIX, columns, LESSON }) => {
        try {
            const skills = set.map((k, i) => (supOpts[i] ? Object.assign({}, k, { opts: supOpts[i] }) : k));
            const r = await window.buildSheet({
                role, sections: [{ skills, count, columns }],
                size, look, paper, seed, form: 'A', key: true, anchors,
                coverage: COVER || undefined, mix: MIX || undefined,
                ...(role === 'lesson' ? LESSON : {}),
            });
            const title = r.title || skill.label;
            return {
                pupil: window.sheetDocument(r.pupilHtml, title, { paper }),
                key: window.sheetDocument(r.keyHtml, title + ' - Answer Key', { paper }),
                fits: r.fits, pageCount: r.pageCount, keyPageCount: r.keyPageCount, seed: r.seed, title,
                notes: r.notes, gaps: (r.gaps || []).slice(0, 12), anchors: r.anchors && { mode: r.anchors.mode, examples: r.anchors.examples.map((a) => ({ variant: a.variant, text: a.text, ans: String(a.ans) })), notes: r.anchors.notes },
                items: r.items.map(it => ({ template: it.template, fclass: it.fclass, text: it.text.slice(0, 80), ans: typeof it.ans === 'object' ? JSON.stringify(it.ans) : String(it.ans), letter: it.letter, measured: it.measured })),
            };
        } catch (e) { return e && e.unsupported ? { unsupported: e.message } : { error: (e && e.stack) || String(e) }; }
    }, { skill, set, role, seed, count: ROLE_COUNT, size, look: ROLE_LOOK, paper: ROLE_PAPER, anchors: ROLE_ANCHORS, supOpts, COVER, MIX, columns: ROLE_COLUMNS, LESSON });
    if (built.error) return { error: built.error };
    if (built.unsupported) return { unsupported: built.unsupported };
    const pdfP = path.join(dir, `${prefix}.pdf`);
    const pdfK = path.join(dir, `${prefix}-key.pdf`);
    const checkP = await printDoc(page, built.pupil, pdfP);
    const checkK = await printDoc(page, built.key, pdfK);
    const pages = rasterisePrefix(pdfP, dir, prefix);
    const keyPages = rasterisePrefix(pdfK, dir, `${prefix}-key`);
    fs.unlinkSync(pdfP); fs.unlinkSync(pdfK);
    const { pupil, key, ...rest } = built;
    return { ...rest, role, size, opts: supOpts[0] || null, pages, keyPages, check: checkP, keyCheck: checkK };
}

// ---------------------------------------------------------------- S4: --template, the envelope sample
/** In the page: {"cat:skill": {template: count}} over 8 seeded items, by the resolver buildSheet uses. */
async function templatesOf(page, skills) {
    return page.evaluate(async (skills) => {
        const pg = await import('./js/modules/print-generate.js');
        const out = {};
        for (const s of skills) {
            const seen = {};
            for (let i = 0; i < 8; i++) {
                let t = 'error';
                try {
                    const q = window.generateQuestionFor({ category: s.categoryId, skill: s.skillId, seed: 1000 + i, itemIndex: i });
                    const r = q && pg.kitCellSpec(Object.assign({ skillId: s.skillId, categoryId: s.categoryId }, q));
                    t = r ? r.template : 'legacy';
                } catch (e) { /* counted as error */ }
                seen[t] = (seen[t] || 0) + 1;
            }
            out[`${s.categoryId}:${s.skillId}`] = seen;
        }
        return out;
    }, skills.map(({ categoryId, skillId }) => ({ categoryId, skillId })));
}

const KIND_ROLE = { single: 'independent', sections: 'independent', mixed: 'mixed-practice' };
/** The envelope's all-pairs sample: ws-envelope's JSON when it exists, else --sample <file.json>. */
function loadEnvelopeSample() {
    let json = null, from = null;
    if (SAMPLE_FILE) { json = JSON.parse(fs.readFileSync(path.resolve(G.REPO, SAMPLE_FILE), 'utf8')); from = SAMPLE_FILE; }
    else {
        const tool = path.join(G.REPO, 'tests', 'scripts', 'ws-envelope.mjs');
        if (!fs.existsSync(tool)) throw new Error(`--envelope ${ENVELOPE}: tests/scripts/ws-envelope.mjs is not in this tree; pass --sample <file.json> (format in the header)`);
        json = JSON.parse(execFileSync('node', [tool, '--envelope', ENVELOPE, '--json'], { encoding: 'utf8', cwd: G.REPO, maxBuffer: 64 << 20 }));
        from = `ws-envelope --envelope ${ENVELOPE} --json`;
    }
    const list = Array.isArray(json) ? json : (json.sample || json.pages || (json.pairs && json.pairs.flatMap((p) => p.sample || [])) || []);
    const kindOfPair = ENVELOPE ? ENVELOPE.split('--')[1] : null;
    const units = list.map((e, i) => {
        const key = e.skill || `${e.categoryId}:${e.skillId}`;
        const [categoryId, skillId] = String(key).split(':');
        if (!categoryId || !skillId) throw new Error(`sample entry ${i}: no skill ("cat:skill")`);
        const role = e.role || KIND_ROLE[e.kind || kindOfPair] || 'independent';
        return { categoryId, skillId, role, size: e.size || 'M', opts: e.opts && Object.keys(e.opts).length ? e.opts : null, index: i };
    });
    return { units, from };
}

// ---------------------------------------------------------------- S4: page records
const optsKeyOf = (o) => (o && Object.keys(o).length ? G.contentHash(JSON.stringify(o)).slice(0, 8) : null);
const relRepo = (p) => path.relative(G.REPO, p).split(path.sep).join('/');

/** One manifest entry per printed page and per screen host of a rendered unit. */
function pageRecords(meta, unit, dir) {
    const out = [];
    const skill = meta.skill;
    for (const [rk, r] of Object.entries(meta.roles || {})) {
        if (!r || r.error || r.unsupported || !r.pages) continue;
        const ok = optsKeyOf(unit.opts);
        for (const [part, list, check] of [['pupil', r.pages, r.check], ['key', r.keyPages, r.keyCheck]]) {
            list.forEach((p, i) => {
                out.push({
                    id: [skill, r.role, r.size, ok ? 'o:' + ok : null, part, `p${i + 1}`].filter(Boolean).join('|'),
                    kind: 'print', skill, label: meta.label, role: r.role, size: r.size, part, page: i + 1,
                    opts: unit.opts || null, optsKey: ok, seed: r.seed,
                    render: relRepo(path.join(dir, p.file)),
                    // the DOM's .ws-page count matches the PDF when nothing overflows; otherwise the hash is the whole document's
                    contentHash: (check.pageHashes && check.pageHashes.length === list.length) ? check.pageHashes[i] : G.contentHash((check.pageHashes || []).join('|') + `#${i}`),
                    measured: Object.assign({}, (check.measured || [])[i] || {}, { fits: r.fits ? `${r.fits.cols}x${r.fits.rows}` : null, problems: (check.problems || []).length }),
                });
            });
        }
    }
    for (const [hk, h] of Object.entries(meta.screen || {})) {
        if (!h || h.error || !h.contentHash) continue;
        const [host, wh] = hk.split('-');
        const [w, ht] = wh.split('x').map(Number);
        out.push({
            id: [skill, unit.opts ? 'o:' + optsKeyOf(unit.opts) : null, 'screen', host, wh].filter(Boolean).join('|'),
            kind: 'screen', skill, label: meta.label, host, width: w, height: ht || null, opts: unit.opts || null, optsKey: optsKeyOf(unit.opts), seed: h.seed,
            render: relRepo(path.join(dir, `${hk}.png`)), contentHash: h.contentHash,
            measured: h.measure ? { hScroll: h.measure.hScroll, smallTargets: h.measure.smallTargetCount, colours: (h.measure.colours || []).length, fonts: (h.measure.fonts || []).map((f) => f[0]).slice(0, 3) } : null,
        });
    }
    return out;
}

// ---------------------------------------------------------------- S4: the golden manifest
const manifestPath = () => path.join(GOLDEN_DIR, 'manifest.json');
function readManifest() {
    try { return JSON.parse(fs.readFileSync(manifestPath(), 'utf8')); } catch (e) { return null; }
}
function writeManifest(m) {
    fs.mkdirSync(GOLDEN_DIR, { recursive: true });
    m.pages.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    fs.writeFileSync(manifestPath(), JSON.stringify(m, null, 1) + '\n');
    // the PNGs stay out of git (repo size); the manifest is the record
    const gi = path.join(G.REPO, 'design', 'audit', 'golden', '.gitignore');
    if (!fs.existsSync(gi)) fs.writeFileSync(gi, '# golden PNGs and contact sheets are re-rendered on demand; only manifest.json is committed\n*/renders/\n');
}
const currentRound = (old) => (arg('round', null) !== null ? Number(arg('round')) : Number((old && old.round) || 0));

function goldenWrite(records, ctx) {
    const old = readManifest();
    const rs = G.ruleSetVersion();
    const byId = new Map(((old && old.pages) || []).map((p) => [p.id, p]));
    let kept = 0, dropped = 0;
    const pages = records.map((p) => {
        const was = byId.get(p.id);
        if (was && was.scores && was.contentHash === p.contentHash) { kept++; return Object.assign({}, p, { scores: was.scores, scoreSource: was.scoreSource }); }
        if (was && was.scores) dropped++;
        return p;
    });
    const m = {
        tool: 'tests/scripts/ws-grade-render.cjs', version: 1, name: GOLDEN_NAME, template: TEMPLATE || (ENVELOPE ? ENVELOPE.split('--')[0] : null), envelope: ENVELOPE || null,
        args: ctx.args, ruleSet: rs.version, ruleSetFiles: rs.files, round: currentRound(old), written: new Date().toISOString().slice(0, 10),
        renders: relRepo(OUT), skills: ctx.skills, pages,
    };
    writeManifest(m);
    console.log(`ws-grade-render golden write: ${pages.length} pages -> ${relRepo(manifestPath())} (scores kept ${kept}, dropped on a changed hash ${dropped}; rule set ${rs.version}, round ${m.round})`);
}

function goldenImportScores() {
    const m = readManifest();
    if (!m) throw new Error(`no golden manifest at ${relRepo(manifestPath())}: run --golden write first`);
    const rs = G.ruleSetVersion();
    const lines = fs.readFileSync(path.resolve(G.REPO, SCORES), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
    let matched = 0;
    const unmatched = [];
    for (const [i, l] of lines.entries()) {
        let rec;
        try { rec = JSON.parse(l); } catch (e) { unmatched.push(`line ${i + 1}: not JSON`); continue; }
        if (!rec.scores) { unmatched.push(`line ${i + 1}: no scores`); continue; }
        const run = rec.run || arg('run', null);
        const round = rec.round !== undefined ? Number(rec.round) : (arg('round', null) !== null ? Number(arg('round')) : null);
        if (!run || round === null) { unmatched.push(`line ${i + 1}: no run / round (give --run and --round)`); continue; }
        const hits = G.matchGrade(rec, m.pages);
        if (!hits.length) { unmatched.push(`line ${i + 1}: ${rec.page || [rec.skill, rec.version, rec.size, rec.page].filter(Boolean).join(' ')} matches no page`); continue; }
        for (const p of hits) {
            p.scores = { C1: rec.scores.C1, C2: rec.scores.C2, C3: rec.scores.C3, C4: rec.scores.C4 };
            p.scoreSource = { run, round, ruleSet: rec.ruleSet || rs.version, contentHash: p.contentHash, commit: rec.commit || null, line: i + 1 };
            matched++;
            m.round = Math.max(Number(m.round) || 0, round);
        }
    }
    writeManifest(m);
    console.log(`ws-grade-render scores: ${lines.length} records, ${matched} page scores set, ${unmatched.length} unmatched -> ${relRepo(manifestPath())}`);
    for (const u of unmatched.slice(0, 20)) console.log('  ' + u);
    return unmatched.length;
}

const fmtScores = (s) => (s ? ['C1', 'C2', 'C3', 'C4'].map((k) => s[k]).join(' / ') : '—');
const pageLabel = (p) => (p.kind === 'print' ? `${p.skill} · ${p.role} ${p.size}${p.optsKey ? ' o:' + p.optsKey : ''} · ${p.part} p${p.page}` : `${p.skill}${p.optsKey ? ' o:' + p.optsKey : ''} · ${p.host} ${p.width}${p.height ? '×' + p.height : ''}`);

function goldenDiff(records) {
    const m = readManifest();
    if (!m) throw new Error(`no golden manifest at ${relRepo(manifestPath())}: run --golden write first`);
    const rs = G.ruleSetVersion();
    const round = currentRound(m);
    const ctx = { ruleSet: rs.version, round, maxAge: 2 };
    const old = new Map(m.pages.map((p) => [p.id, p]));
    const now = new Map(records.map((p) => [p.id, p]));
    const changed = [], added = [], removed = [], same = [];
    for (const p of records) {
        const was = old.get(p.id);
        if (!was) added.push(p);
        else if (was.contentHash !== p.contentHash) changed.push(Object.assign({}, p, { was: was.contentHash }));
        else same.push(Object.assign({}, p, { scores: was.scores, scoreSource: was.scoreSource }));
    }
    for (const p of m.pages) if (!now.has(p.id)) removed.push(p);
    const stale = [], ungraded = [], scored = [];
    for (const p of same) {
        const st = G.scoreStatus(p, ctx);
        p.status = st;
        (st.state === 'scored' ? scored : st.state === 'ungraded' ? ungraded : stale).push(p);
    }
    const seed = arg('sample-seed', null) !== null ? Number(arg('sample-seed')) : hash(`${GOLDEN_NAME}:${round}:${rs.version}`);
    const pct = Number(arg('sample-pct', '20'));
    // the near-miss safeguard: a fresh sample of the pages that would otherwise ride on a recorded score
    const sample = G.seededSample(scored.map((p) => p.id).sort(), pct, seed);
    const L = [];
    L.push(`# Critic brief — golden diff \`${GOLDEN_NAME}\``, '');
    L.push(`Rendered ${new Date().toISOString().slice(0, 10)} by \`node tests/scripts/ws-grade-render.cjs ${process.argv.slice(2).join(' ')}\`.`);
    L.push(`Golden manifest: \`${relRepo(manifestPath())}\` (written ${m.written}, rule set ${m.ruleSet}, round ${m.round}). Now: rule set ${rs.version}${rs.version !== m.ruleSet ? ' — **CHANGED: every recorded score is stale**' : ''}, round ${round}.`);
    L.push('', `Content hashes (canonical DOM, not pixels) say which pages changed since a critic last looked; they never decide inheritance (IMPROVEMENT_PLAN §1.6.2). Renders: \`${relRepo(OUT)}\`.`, '');
    L.push(`| | pages |`, `|---|---|`, `| changed | ${changed.length} |`, `| new | ${added.length} |`, `| removed | ${removed.length} |`, `| unchanged, score stands | ${scored.length} |`, `| unchanged, score stale | ${stale.length} |`, `| unchanged, never graded | ${ungraded.length} |`, `| ${pct} % sample of the scored unchanged (seed ${seed}) | ${sample.size} |`, '');
    const grade = [...changed.map((p) => [p, 'changed']), ...added.map((p) => [p, 'new']), ...stale.map((p) => [p, p.status.why]), ...ungraded.map((p) => [p, 'never graded'])];
    L.push(`## 1. Grade these pages in full (${grade.length})`, '', '| page | why | render |', '|---|---|---|');
    for (const [p, why] of grade) L.push(`| ${pageLabel(p)} | ${why} | \`${p.render}\` |`);
    if (!grade.length) L.push('| — | nothing changed | |');
    L.push('', `## 2. Re-grade this random ${pct} % sample of the unchanged, scored pages (${sample.size})`, '', '| page | recorded C1 / C2 / C3 / C4 | source | render |', '|---|---|---|---|');
    for (const p of same.filter((x) => sample.has(x.id))) L.push(`| ${pageLabel(p)} | ${fmtScores(p.scores)} | ${p.scoreSource ? `${p.scoreSource.run} r${p.scoreSource.round}` : 'never graded'} | \`${p.render}\` |`);
    L.push('', `## 3. Unchanged pages carrying their recorded score (${scored.length}; the sampled ones also in section 2)`, '', '| page | C1 / C2 / C3 / C4 | source |', '|---|---|---|');
    for (const p of scored) L.push(`| ${pageLabel(p)} | ${fmtScores(p.scores)} | ${p.scoreSource.run} round ${p.scoreSource.round} (rule set ${p.scoreSource.ruleSet}) |`);
    if (removed.length) {
        L.push('', `## 4. Removed pages (${removed.length}) — in the golden, not rendered now`, '', '| page | last score | source |', '|---|---|---|');
        for (const p of removed) L.push(`| ${pageLabel(p)} | ${fmtScores(p.scores)} | ${p.scoreSource ? `${p.scoreSource.run} r${p.scoreSource.round}` : '—'} |`);
    }
    // The PASS table: every page, where its score comes from
    L.push('', '## PASS table', '', 'A page passes on four scores of 8 or more that still stand. Until the critic returns its grades (import them with `--scores`), the pages of sections 1 and 2 read NEEDS GRADE.', '', '| page | C1 / C2 / C3 / C4 | min | score from | result |', '|---|---|---|---|---|');
    const rows = [];
    for (const p of records) {
        const was = old.get(p.id);
        let from, result, sc = null;
        if (!was) { from = 'new page'; result = 'NEEDS GRADE'; }
        else if (was.contentHash !== p.contentHash) { from = 'changed page'; result = 'NEEDS GRADE'; }
        else {
            const st = G.scoreStatus(Object.assign({}, p, { scores: was.scores, scoreSource: was.scoreSource }), ctx);
            sc = was.scores;
            if (st.state !== 'scored') { from = st.why; result = 'NEEDS GRADE'; }
            else {
                from = `inherited: ${was.scoreSource.run} round ${was.scoreSource.round}`;
                if (sample.has(p.id)) { from += ' (in the re-grade sample)'; result = 'NEEDS GRADE'; } else result = G.minScore(sc) >= 8 ? 'PASS' : 'FAIL';
            }
        }
        rows.push(`| ${pageLabel(p)} | ${fmtScores(sc)} | ${sc ? G.minScore(sc) : '—'} | ${from} | ${result} |`);
    }
    L.push(...rows);
    fs.mkdirSync(OUT, { recursive: true });
    const brief = path.join(OUT, 'critic-brief.md');
    fs.writeFileSync(brief, L.join('\n') + '\n');
    console.log(`ws-grade-render golden diff: ${records.length} pages: ${changed.length} changed, ${added.length} new, ${removed.length} removed, ${scored.length} scored, ${stale.length} stale, ${ungraded.length} never graded, sample ${sample.size}`);
    for (const p of changed) console.log(`  CHANGED  ${pageLabel(p)}  ${p.was} -> ${p.contentHash}`);
    for (const p of added) console.log(`  NEW      ${pageLabel(p)}`);
    for (const p of removed) console.log(`  REMOVED  ${pageLabel(p)}`);
    console.log(`  brief: ${relRepo(brief)}`);
    return changed.length + added.length + removed.length;
}

// ---------------------------------------------------------------- S4: contact sheets
const dataUri = (file) => 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
const esc = (s) => String(s === null || s === undefined ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function numbersHtml(p) {
    const m = p.measured || {};
    const rows = [['page', pageLabel(p)], ['seed', p.seed], ['hash', p.contentHash]];
    if (p.opts) rows.push(['opts', JSON.stringify(p.opts)]);
    if (p.kind === 'print') {
        rows.push(['cells', `${m.cells ?? '—'}${m.fits ? ` (grid ${m.fits})` : ''}`]);
        rows.push(['digits', m.digitPt ? `${m.digitPt.max} pt max · ${m.digitPt.median} median · ${m.digitPt.min} min` : '—']);
        rows.push(['answer slots', m.slots ? `${m.slots.n}${m.slots.minMm ? ` · smallest ${m.slots.minMm[0]} × ${m.slots.minMm[1]} mm` : ''}` : '—']);
        if (m.slots && m.slots.sizes && m.slots.sizes.length) rows.push(['slot sizes', m.slots.sizes.join('<br>')]);
        rows.push(['empty band', m.band ? `${m.band.hPct} % of cell height${m.band.cell ? ` (cell ${m.band.cell})` : ''} · ${m.band.wPct} % width` : '—']);
        rows.push(['free at foot', m.footPct !== null && m.footPct !== undefined ? `${m.footPct} % of the body` : '—']);
        rows.push(['overflow', m.problems ? `${m.problems} finding(s)` : 'none']);
    } else {
        rows.push(['viewport', `${p.width}${p.height ? ' × ' + p.height : ''}`]);
        rows.push(['h-scroll', m.hScroll ? `${m.hScroll} px` : 'none']);
        rows.push(['targets < 44 px', m.smallTargets ?? '—']);
        rows.push(['non-grey colours', m.colours ?? '—']);
        rows.push(['fonts', (m.fonts || []).join(', ')]);
    }
    return `<table>${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${k === 'slot sizes' ? v : esc(v)}</td></tr>`).join('')}</table>`;
}

async function contactSheets(browser, records) {
    const dir = path.join(OUT, 'contact');
    fs.mkdirSync(dir, { recursive: true });
    const css = `body{margin:0;padding:24px;background:#fff;font:16px/1.35 Arial,sans-serif;color:#000}
h1{font-size:22px;margin:0 0 14px}.row{display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap}
.tile{display:flex;gap:14px;align-items:flex-start}.tile img{border:1px solid #888;display:block}
.screen{display:flex;flex-direction:column;gap:8px}.screen img{border:1px solid #888;display:block}
table{border-collapse:collapse;width:330px;font-size:19px}th{text-align:left;vertical-align:top;padding:3px 8px 3px 0;white-space:nowrap}
td{padding:3px 0;word-break:break-word}`;
    const sheets = [];
    const shot = async (name, title, inner, width) => {
        const pg = await browser.newPage();
        try {
            await pg.setViewport({ width, height: 800, deviceScaleFactor: 1 });
            await pg.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><h1>${esc(title)}</h1>${inner}</body></html>`, { waitUntil: 'load' });
            const file = path.join(dir, name);
            await pg.screenshot({ path: file, fullPage: true });
            sheets.push({ file: relRepo(file), title });
        } finally { await pg.close(); }
    };
    // print: two pages to a sheet, grouped by skill, role, size and option set, pupil pages then key
    const groups = new Map();
    for (const p of records.filter((r) => r.kind === 'print')) {
        const k = [p.skill, p.role, p.size, p.optsKey || ''].join('|');
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(p);
    }
    for (const [k, list] of groups) {
        list.sort((a, b) => (a.part === b.part ? a.page - b.page : a.part === 'pupil' ? -1 : 1));
        for (let i = 0; i < list.length; i += 2) {
            const two = list.slice(i, i + 2);
            const inner = `<div class="row" style="flex-wrap:nowrap">${two.map((p) => `<div class="tile"><img src="${dataUri(path.join(G.REPO, p.render))}">${numbersHtml(p)}</div>`).join('')}</div>`;
            const [skill, role, size, ok] = k.split('|');
            const name = `${skill.replace(':', '__')}__${role}-${size}${ok ? '-o' + ok : ''}__${Math.floor(i / 2) + 1}.png`;
            await shot(name, `${list[0].label || skill} — ${role} ${size}${ok ? ' (opts ' + ok + ')' : ''} — sheet ${Math.floor(i / 2) + 1} of ${Math.ceil(list.length / 2)}`, inner, 2 * (1240 + 14 + 330) + 28 + 48 + 20);
        }
    }
    // screen: one sheet per skill (and option set)
    const scr = new Map();
    for (const p of records.filter((r) => r.kind === 'screen')) {
        const k = p.skill + '|' + (p.optsKey || '');
        if (!scr.has(k)) scr.set(k, []);
        scr.get(k).push(p);
    }
    const ORDER = ['card|1280', 'card|820', 'card|390', 'card|1366', 'worksheet|1280', 'quiz|1280'];
    for (const [k, list] of scr) {
        list.sort((a, b) => ORDER.indexOf(`${a.host}|${a.width}`) - ORDER.indexOf(`${b.host}|${b.width}`));
        const inner = `<div class="row">${list.map((p) => `<div class="screen"><img src="${dataUri(path.join(G.REPO, p.render))}">${numbersHtml(p)}</div>`).join('')}</div>`;
        const [skill, ok] = k.split('|');
        await shot(`${skill.replace(':', '__')}${ok ? '-o' + ok : ''}__screens.png`, `${list[0].label || skill} — screen hosts${ok ? ' (opts ' + ok + ')' : ''}`, inner, 2700);
    }
    const idx = ['# Contact sheets', '', `Generated by \`node tests/scripts/ws-grade-render.cjs ${process.argv.slice(2).join(' ')}\`. A4 pages at ${DPI} dpi, two to a sheet, with the measured numbers beside each; one screen sheet per skill.`, '', '| sheet | contents |', '|---|---|', ...sheets.map((s) => `| \`${s.file}\` | ${s.title} |`)];
    fs.writeFileSync(path.join(dir, 'index.md'), idx.join('\n') + '\n');
    console.log(`ws-grade-render contact sheets: ${sheets.length} -> ${relRepo(dir)}/index.md`);
    return sheets;
}

// ---------------------------------------------------------------- main
(async () => {
    // --scores alone: import a critic's grades into the golden manifest, no browser
    if (SCORES && !GOLDEN) {
        if (!GOLDEN_DIR) throw new Error('--scores needs --template, --envelope or --golden-name (which manifest)');
        const bad = goldenImportScores();
        console.log(bad && !REPORT_ONLY ? `ws-grade-render: FAIL - ${bad} grade record(s) matched no page` : 'ws-grade-render: OK');
        process.exit(bad && !REPORT_ONLY ? 1 : 0);
    }
    if (GOLDEN && !GOLDEN_NAME) throw new Error('--golden needs --template, --envelope or --golden-name');
    if (GOLDEN === 'diff' && !readManifest()) throw new Error(`no golden manifest at ${relRepo(manifestPath())}: run --golden write first`);
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
    if (TEMPLATE) {
        // S1: every live skill whose kit cell template is TEMPLATE (the most items of 8; --template-any: any)
        const tpl = await templatesOf(page, skills);
        skills = skills.filter((s) => {
            const seen = tpl[`${s.categoryId}:${s.skillId}`] || {};
            if (TEMPLATE_ANY) return !!seen[TEMPLATE];
            const top = Math.max(0, ...Object.values(seen));
            return (seen[TEMPLATE] || 0) > 0 && seen[TEMPLATE] === top;
        });
        if (!skills.length) throw new Error(`--template ${TEMPLATE}: no live skill draws with it`);
        console.log(`ws-grade-render: --template ${TEMPLATE}: ${skills.map((s) => `${s.categoryId}:${s.skillId}`).join(', ')}`);
    }
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

    // A unit is one rendered directory: a skill with every --roles x --size (the usual case), or one
    // entry of the envelope's all-pairs sample (one role, one size, one option set).
    let units;
    let sampleFrom = null;
    if (ENVELOPE || SAMPLE_FILE) {
        const { units: entries, from } = loadEnvelopeSample();
        sampleFrom = from;
        const byKey = new Map(skills.map((s) => [`${s.categoryId}:${s.skillId}`, s]));
        const screened = new Set();
        units = entries.map((e) => {
            const s = byKey.get(`${e.categoryId}:${e.skillId}`) || { categoryId: e.categoryId, skillId: e.skillId, label: e.skillId };
            const ok = optsKeyOf(e.opts);
            const sk = `${e.categoryId}:${e.skillId}|${ok || ''}`;
            const screens = !screened.has(sk);
            screened.add(sk);
            return { skill: s, roles: [e.role], sizes: [e.size], opts: e.opts, screens, dirName: `${slug(s)}__e${e.index}${ok ? '-o' + ok : ''}` };
        });
    } else {
        units = skills.map((s) => ({ skill: s, roles: ROLES, sizes: ROLE_SIZES, opts: null, screens: true, dirName: slug(s) }));
    }
    if (LIMIT > 0) units = units.slice(0, LIMIT);
    console.log(`ws-grade-render: ${units.length} ${ENVELOPE || SAMPLE_FILE ? `sample entries (${sampleFrom})` : 'skills'} -> ${path.relative(ROOT, OUT) || OUT}`);

    const manifest = [];
    const records = [];
    const t0 = Date.now();
    const HOSTS = [[1280, 900], [820, 1180], [390, 844], ...(CHROMEBOOK ? [[1366, 768, true]] : [])];
    for (const [i, unit] of units.entries()) {
        const s = unit.skill;
        const dir = path.join(OUT, unit.dirName);
        if (RESUME && fs.existsSync(path.join(dir, 'meta.json'))) {
            const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
            manifest.push(meta); records.push(...pageRecords(meta, unit, dir));
            continue;
        }
        fs.mkdirSync(dir, { recursive: true });
        const errorsBefore = problems.length;
        const meta = { skill: `${s.categoryId}:${s.skillId}`, category: s.categoryId, skillId: s.skillId, label: s.label, grade: s.grade, dir: path.relative(OUT, dir) };
        if (unit.opts) meta.opts = unit.opts;
        try {
            if (!NO_PRINT && LEGACY_PRINT && !s.set) meta.print = await renderPrinted(page, s, dir);
        } catch (e) { meta.print = { error: e.message }; }
        if (unit.roles.length && !NO_PRINT) {
            meta.roles = {};
            for (const role of unit.roles) {
                for (const size of unit.sizes) {
                    const key = roleKey(role, size);
                    try { meta.roles[key] = await renderRole(page, s, role, dir, { size, unitOpts: unit.opts, prefix: key }); } catch (e) { meta.roles[key] = { error: e.message }; }
                }
            }
        }
        await hideOverlays(page);
        if (!NO_SCREEN && !s.set && unit.screens) {
            meta.screen = {};
            await storeSupports(page, s, unit.opts);
            for (const [w, h, fit] of HOSTS) {
                const k = fit ? `card-${w}x${h}` : `card-${w}`;
                try { meta.screen[k] = await renderCard(page, s, w, h, path.join(dir, `${k}.png`), !!fit); } catch (e) { meta.screen[k] = { error: e.message }; }
            }
            try { meta.screen['worksheet-1280'] = await renderWorksheet(page, s, path.join(dir, 'worksheet-1280.png')); } catch (e) { meta.screen['worksheet-1280'] = { error: e.message }; }
            try { meta.screen['quiz-1280'] = await renderQuiz(page, s, path.join(dir, 'quiz-1280.png')); } catch (e) { meta.screen['quiz-1280'] = { error: e.message }; }
        }
        meta.consoleErrors = problems.slice(errorsBefore).map(p => p.text).slice(0, 10);
        fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
        manifest.push(meta);
        records.push(...pageRecords(meta, unit, dir));
        const el = ((Date.now() - t0) / 1000).toFixed(0);
        const roleLine = meta.roles ? Object.entries(meta.roles).map(([r, v]) => v.error ? `${r} ERR` : v.unsupported ? `${r} n/a` : `${r} ${v.pages.length}p+${v.keyPages.length}k ${v.fits && v.fits.cols}x${v.fits && v.fits.rows}${(v.check.problems.length + v.keyCheck.problems.length) ? ' OVERFLOW' : ''}`).join('  ') : '';
        const printLine = meta.print ? `print ${meta.print.pages ? meta.print.pages.length + 'p' : 'ERR'}` : '';
        const scrErr = meta.screen ? Object.entries(meta.screen).filter(([, v]) => v && v.error).map(([k]) => k) : [];
        console.log(`  [${i + 1}/${units.length}] ${meta.skill}${unit.opts ? ' ' + JSON.stringify(unit.opts) : ''}  ${[printLine, roleLine].filter(Boolean).join('  ')}${scrErr.length ? '  screen ERR ' + scrErr.join(',') : ''}  ${el}s`);
    }
    fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
    let fail = 0;
    if (CONTACT) await contactSheets(app.browser, records);
    await app.close();
    const errs = manifest.flatMap((m) => [...Object.entries(m.roles || {}).filter(([, v]) => v && v.error).map(([k, v]) => `${m.skill} ${k}: ${String(v.error).split('\n')[0]}`),
        ...Object.entries(m.screen || {}).filter(([, v]) => v && v.error).map(([k, v]) => `${m.skill} ${k}: ${v.error}`)]);
    if (GOLDEN === 'write') {
        goldenWrite(records, { args: process.argv.slice(2).join(' '), skills: [...new Set(units.map((u) => `${u.skill.categoryId}:${u.skill.skillId}`))] });
        if (SCORES) goldenImportScores();
    } else if (GOLDEN === 'diff') {
        fail += goldenDiff(records);
    }
    console.log(`ws-grade-render: done, ${manifest.length} units, ${records.length} pages, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    for (const e of errs.slice(0, 12)) console.log('  ERROR ' + e);
    if (GOLDEN_MODE) {
        if (errs.length) console.log(`ws-grade-render: FAIL - ${errs.length} render error(s)`);
        else if (fail) console.log(`ws-grade-render: FAIL - ${fail} page(s) changed, new or removed since the golden`);
        else console.log('ws-grade-render: OK');
        if ((errs.length || fail) && !REPORT_ONLY) process.exit(1);
    }
})().catch(e => { console.error('ws-grade-render: FAIL -', e.stack || e.message); process.exit(1); });
