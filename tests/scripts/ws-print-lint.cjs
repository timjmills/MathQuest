// Print lint gate: does a PRINTED SHEET obey WORKSHEET_DESIGN_STANDARD.md?
//
// ws-content-audit reads question objects and never a page, which is how the owner's printout of
// 2026-09-24 got through: black place-value disks hiding their "100", blue and green zones, a page
// holding two items, a "Part 01" heading card with a drop shadow, a numbered-list answer key. This
// gate reads the RENDERED sheet - the DOM under print emulation at A4, and the PDF Chrome prints
// from it - and fails on the rules of standard section 17.2 it can measure.
//
//   node tests/scripts/ws-print-lint.cjs --self-test                  # every lint proven by mutation
//   node tests/scripts/ws-print-lint.cjs --source pack                # the approved mock-up pack (must be OK)
//   node tests/scripts/ws-print-lint.cjs --source pack --files 01,11  # only pages/01-*.mjs, pages/11-*.mjs
//   node tests/scripts/ws-print-lint.cjs --family redone              # the app, legacy print path (default source)
//   node tests/scripts/ws-print-lint.cjs --skills addition:add_20_regroup,composing:base10_build
//   node tests/scripts/ws-print-lint.cjs --source kit --family operations   # window.buildSheet (P7 kit pages)
//   node tests/scripts/ws-print-lint.cjs --source kit --skills addition:add_20_regroup --roles guided,review,test
//   node tests/scripts/ws-print-lint.cjs ... --report-only --json out.json --verbose
//
// OPTIONS
//   --source pack|legacy|kit  what to lint (default legacy). `pack` builds design/mockups/pages/*.mjs
//                             to design/mockups/out/*.html (the same HTML `build.cjs --no-pdf` writes)
//   --skills cat:skill,...    app sources: these skills (a bare skill id also matches)
//   --family operations|k2|redone   app sources: a family (default when no --skills: redone)
//   --files 01,11             pack: only page files whose name starts with one of these
//   --count N                 legacy: items per section (default 20, the print dialog's default)
//   --roles r1,r2             kit: the page roles to lint (default independent); any role buildSheet knows
//   --anchors side|sections   kit: print with step-by-step anchor problems (S6); adds L-ANCHOR
//   --supports all|id,id      kit: print every skill with supports on (S2): `all` ticks every
//                             render-time support its Support control offers; adds L-SUPPORT
//   --cover whole|needed|fade kit, with --supports: the sheet's coverage (default whole)
//   --mix section|problem     kit, with --supports: how clashing supports are shared (default section)
//   --no-combined             legacy: skip the combined multi-section sheet (see below)
//   --lints L-INK,L-KEY       only report these lints (the others still run)
//   --json out.json           machine-readable findings for the critic loop
//   --baseline base.json      RATCHET: fail only where a (document, lint, rule) count rose above the
//                             baseline written by an earlier --json run (P7.5 "as a ratchet")
//   --report-only             print everything, exit 0 (never prints OK when something failed)
//   --verbose                 print every finding group, not just the first 12 per document
//   --save-html dir           app sources: also write each linted document's HTML there (for the critic / debugging)
//
// WHAT A DOCUMENT IS
//   pack    one file of the mock-up pack; every `.ws-page` is one printed A4 sheet.
//   kit     window.buildSheet(req) -> window.sheetDocument(html, title): kit pages carrying the
//           section 17.1 hooks (`[data-ws-page]` or `.ws-page`, `data-ws-role`, `data-ws-mode`, ...).
//           If buildSheet is not on window in this tree, the run fails and says so.
//   legacy  the teacher's print path today: generateWorksheetFromSections (one section of one skill,
//           `--count` items, answer key on) -> the preview's Download-PDF document (downloadPDF,
//           print-generate.js), printed to A4 with Chrome's defaults (no background graphics), as
//           tests/scripts/ws-grade-render.cjs renderPrinted does. Legacy output has no page elements, so
//           its printed pages are recovered from the PDF: every cell and cell descendant gets an id and a
//           hidden link to it, Chrome writes a named destination for each, and PyMuPDF resolves them to
//           (page, offset). That is how L-SPLIT and L-DENSITY see the printed page breaks.
//           With more than one skill the run adds one COMBINED sheet (every skill as its own section,
//           4 items each), because that is the sheet the owner printed and the only place the legacy
//           path draws its "Part NN" section headings.
//
// THE LINTS (rule ids from WORKSHEET_DESIGN_STANDARD.md)
//   L-INK      INK-1 every paint (text colour, background, border, outline, underline, text stroke, SVG
//              fill / stroke) inside the sheet is #000, #fff or #949494; INK-2 no shadow, filter, blend,
//              gradient, background image or opacity < 1; INK-5 no solid black fill over 7 mm in both
//              dimensions (DOM shape size, and the PRINTED page: the largest disk that fits in a dark
//              region); ILLEGIBLE (critical) text whose paint does not contrast with what is painted
//              behind it (black "100" on a black disk); LS-4 a dashed stroke is a cut line or a
//              missing-digit box, nothing else; INK-7 no raster image. Also on the PDF: every printed
//              text / fill / stroke colour, including @page margin boxes the DOM cannot see.
//   L-EMOJI    INK-7 / TY-6 no emoji or pictographic code point in text, SVG text or ::before/::after;
//              no letter x, asterisk or hyphen used as an operator.
//   L-FONT     TY-1 computed family is Andika and the face is loaded; the PDF embeds only Andika;
//              TY-2 weights 400 / 700 only, no italic, font-synthesis none; TY-3 no Google Fonts link;
//              TY-4 no character variant but cv04.
//   L-SIZE     TY-11 (subset) no pupil-facing text under 8 pt (the teacher footer is exempt, HD-32).
//   L-OVERFLOW PG-12 / PG-13 nothing sticks out of its cell or the page's live area; no content clipped
//              by the page box; TY-12 no clipped text (a text box scrolled or cut off).
//   L-SPLIT    PG-21 no cell split across printed pages; a sheet page prints as exactly one A4 sheet;
//              the teacher footer / date line sits at the foot of its page, never mid-page.
//   L-DENSITY  12.1 items per page within the ceiling for the page role and size (Independent / More
//              Practice 6, or 16 for one-symbol answers); no page but the last of a sheet under half
//              used (area, or items against the sheet's fullest page); PG-23 short last page rebalanced.
//   L-KEY      AK-1..AK-4 the key exists, is a facsimile (same page count, same cells within 0.5 mm,
//              same slot count) and not a list; every slot answered; answers weight 700.
//   L-VERBS    BD-12 / BD-17 no screen verbs on paper (click, tap, drag, select, press, highlight, hover,
//              swipe, scroll, "tick" except tick marks; type / enter as an imperative); P-LG-4 no
//              explain / describe / justify / discuss / prove; BD-10 one instruction line of <= 12 words
//              above the cells; BD-1 no "Part NN" section headings.
//   L-ANSAREA  SL-1 answer lines >= 14 mm; SL-6 no underscore blanks; H12 an item that says draw / build /
//              show has a drawing zone >= 30 mm tall with >= 60 % of it empty (measured and reported).
//   L-INPUT    no <input>, <button>, <select>, <textarea> or contenteditable on a printed sheet.
//   L-CCSS     SC-5 / HD-6 no CCSS code, "Grade N" or snake_case skill id outside the teacher footer.
//   L-ANCHOR   S6 / PT-LBL-6 (kit, with --anchors side|sections): every step-by-step anchor cell carries
//              the outlined Model tab, no letter or tab label and no answer slot (anchors are unscored),
//              and draws identically on the key.
//   L-SUPPORT  S2 (kit, with --supports): no answer inside a support (a number the key adds to a cell
//              appears in no text of its [data-ws-support-on] parts, reference scales excepted); every
//              ÷ tally-dot row of a section has the same length (never the quotient); GEOMETRY PARITY:
//              in a section, cells of one shape put their answer slot in the same place whether their
//              supports are drawn or only reserved (the answer zone never moves); the key draws the
//              same supports as the pupil page.
//
// DETERMINISM. The app runs with a seeded Math.random, reseeded per skill from hash(category:skill)
// exactly as ws-grade-render does, so the same tree prints the same items and this gate's output is
// byte-identical between runs (findings are sorted; nothing time-dependent is printed or written).
//
// Needs python3 with PyMuPDF (import pymupdf). Headless Chromium comes from tests/lib/ws-harness.cjs.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer');
const { ROOT, chromePath, startServer, open, waitFor, listSkills, renderPrint, hideOverlays } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = k => argv.includes('--' + k);

const TOOL = 'ws-print-lint';
const LINTS = ['L-INK', 'L-EMOJI', 'L-FONT', 'L-SIZE', 'L-OVERFLOW', 'L-SPLIT', 'L-DENSITY', 'L-KEY', 'L-VERBS', 'L-ANSAREA', 'L-INPUT', 'L-CCSS', 'L-ANCHOR', 'L-SUPPORT'];

/**
 * L-SUPPORT (S2): runs IN the rendered sheet document (the page lintHtmlInSheetPage prints from).
 * Returns findings. Serialised by page.evaluate, so it uses nothing from this file.
 */
function supportCheckInPage() {
    const out = [];
    const MM = 96 / 25.4;
    const pages = (mode) => Array.from(document.querySelectorAll(`[data-ws-mode="${mode}"]`));
    const cellsOf = (mode) => pages(mode).flatMap((p) => Array.from(p.querySelectorAll('.ws-cell'))).filter((c) => !/mq-anchorcell/.test(c.className));
    const P = cellsOf('print'), K = cellsOf('key');
    const nums = (t) => (String(t).replace(/(\d),(?=\d{3}\b)/g, '$1').match(/\d+/g) || []);
    // Text nodes joined by spaces: digits written one per track still read as one number only
    // when they share a text node's neighbours, never glued to the next box's text.
    const words = (el) => {
        const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const out = [];
        let n;
        while ((n = w.nextNode())) out.push(n.nodeValue);
        return out.join(' ');
    };
    const textOf = (el) => {
        const c = el.cloneNode(true);
        c.querySelectorAll('[data-ws-ref], [aria-hidden="true"]').forEach((x) => x.remove());
        return words(c);
    };
    // 1. no answer inside a support
    P.forEach((cell, i) => {
        const sup = Array.from(cell.querySelectorAll('[data-ws-support-on]'));
        if (!sup.length) return;
        const k = K[i];
        if (!k) return;
        const pn = nums(words(cell)), kn = nums(words(k));
        const left = pn.slice();
        const answers = [];
        for (const n of kn) { const j = left.indexOf(n); if (j >= 0) left.splice(j, 1); else answers.push(n); }
        // a column answer written one digit per track reads as one number in the key's text
        for (const el of sup) {
            const t = nums(textOf(el));
            const hit = answers.find((a) => a.length && t.includes(a) && !nums(textOf(cell.querySelector('.ws-pane-problem') || document.createElement('i'))).includes(a));
            if (hit) out.push({ lint: 'L-SUPPORT', rule: 'RP-1', sev: 'critical', msg: `cell ${i + 1}: the ${el.getAttribute('data-ws-support-on')} support shows the answer ${hit}`, key: 'support answer' });
        }
    });
    // 2. the ÷ tally rows of a grid are one length
    const grids = Array.from(document.querySelectorAll('[data-ws-mode="print"] .ws-grid'));
    grids.forEach((g, gi) => {
        const rows = Array.from(g.querySelectorAll('.ws-td-tallyrow'));
        const lens = [...new Set(rows.map((r) => `${r.getAttribute('data-ws-tally')}:${r.querySelectorAll('.ws-td-mark').length}`))];
        if (lens.length > 1) out.push({ lint: 'L-SUPPORT', rule: 'S1.7', sev: 'major', msg: `section grid ${gi + 1}: the ÷ tally rows differ in length (${lens.join(', ')})`, key: 'tally length' });
    });
    // 3. geometry parity: one shape, one answer-slot place, supports drawn or reserved
    grids.forEach((g, gi) => {
        const seen = new Map();
        for (const cell of Array.from(g.querySelectorAll('.ws-cell'))) {
            if (!cell.querySelector('.ws-supported, [data-ws-support-reserve]')) continue;
            const slot = cell.querySelector('[data-ws-slot]');
            if (!slot) continue;
            const prob = cell.querySelector('.ws-fact, .ws-stack, .ws-eq, .ws-pane-problem');
            // One SHAPE: the same template and the same drawn problem box (to 0.5 mm). A cell whose
            // own problem is wider sits differently in any centred cell, support or none.
            const pb = prob ? prob.getBoundingClientRect() : null;
            const half = (v) => Math.round((v / MM) * 2) / 2;
            const sig = [...(cell.className.match(/mqt--[\w-]+/) || [''])].join('') + '|' + (prob ? prob.getAttribute('style') || '' : '') + '|' + (prob ? prob.children.length : 0)
                + '|' + (pb ? `${half(pb.width)}x${half(pb.height)}` : '');
            const cr = cell.getBoundingClientRect(), sr = slot.getBoundingClientRect();
            const off = [(sr.left - cr.left) / MM, (sr.top - cr.top) / MM];
            const drawn = !!cell.querySelector('[data-ws-support-on]');
            if (!seen.has(sig)) { seen.set(sig, { off, drawn }); continue; }
            const s0 = seen.get(sig);
            if (Math.abs(s0.off[0] - off[0]) > 0.6 || Math.abs(s0.off[1] - off[1]) > 0.6) {
                out.push({ lint: 'L-SUPPORT', rule: 'SCC-T10', sev: 'major', msg: `section grid ${gi + 1}: the answer zone moves between cells of one shape (${s0.off.map((v) => v.toFixed(1))} vs ${off.map((v) => v.toFixed(1))} mm, supports ${s0.drawn ? 'drawn' : 'reserved'} / ${drawn ? 'drawn' : 'reserved'})`, key: 'support parity' });
                break;
            }
        }
    });
    // 4. the key draws the same supports
    const tag = (cs) => cs.map((c) => Array.from(c.querySelectorAll('[data-ws-support-on]')).map((e) => e.getAttribute('data-ws-support-on')).join('+') + `#${c.querySelectorAll('.ws-td-svg').length}`).join(',');
    if (K.length && tag(P) !== tag(K)) out.push({ lint: "L-SUPPORT", rule: "AK-1", sev: "critical", msg: `the key draws the supports differently from the pupil page (${P.length} / ${K.length} cells; ${tag(P).slice(0, 60)} vs ${tag(K).slice(0, 60)})`, key: "support key" });
    const count = P.filter((c) => c.querySelector('[data-ws-support-on], .ws-td-svg')).length;
    return { findings: out, supported: count };
}

/**
 * L-ANCHOR (S6, PT-LBL-6): the anchor cells of a kit document, read from its HTML. Each anchor
 * cell must carry the Model tab, no letter / tab label and no data-ws-slot (unscored); the key
 * half of the document must draw the same anchors in the same order (AK-1).
 */
function anchorFindings(pupilHtml, keyHtml) {
    const out = [];
    const cells = (h) => String(h || '').split(/(?=<div class="ws-cell )/).filter((c) => /^<div class="ws-cell [^"]*mq-anchorcell/.test(c));
    const P = cells(pupilHtml), K = cells(keyHtml);
    P.forEach((c, i) => {
        if (!/data-ws-label="model"/.test(c)) out.push({ lint: 'L-ANCHOR', rule: 'PT-LBL-6', sev: 'major', msg: `anchor ${i + 1} has no Model tab (PT-LBL-6)`, key: 'anchor tab' });
        if (/data-ws-label="(?:letter|tab)"/.test(c)) out.push({ lint: 'L-ANCHOR', rule: 'PT-LBL-6', sev: 'major', msg: `anchor ${i + 1} is labelled like a problem (PT-LBL-6: unlabelled)`, key: 'anchor label' });
        if (/ data-ws-slot=/.test(c)) out.push({ lint: 'L-ANCHOR', rule: 'PT-LBL-6', sev: 'critical', msg: `anchor ${i + 1} carries an answer slot: an anchor is unscored`, key: 'anchor slot' });
    });
    const body = (c) => (c.match(/<div class="mq-anchor[\s\S]*/) || [''])[0];
    if (keyHtml && (P.length !== K.length || P.some((c, i) => body(c).slice(0, 4000) !== body(K[i] || '').slice(0, 4000)))) {
        out.push({ lint: 'L-ANCHOR', rule: 'AK-1', sev: 'critical', msg: `the key draws the anchors differently (${P.length} on the pupil pages, ${K.length} on the key)`, key: 'anchor key' });
    }
    return out;
}
const OPS_CATS = ['addition', 'subtraction', 'multiplication', 'division'];
const K2_CATS = ['counting', 'comparing', 'composing', 'counting_mixed'];
const FAMILIES = { operations: OPS_CATS, k2: K2_CATS, redone: [...OPS_CATS, ...K2_CATS] };
const PX_PER_MM = 96 / 25.4;
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SEV_RANK = { critical: 0, major: 1, minor: 2 };

// ---------------------------------------------------------------------------------------------
// Section 12.1 ceilings, items per page by role and size [S, M, L]. `one` = the one-symbol variant
// (2 x 5 and 2 x 8 grids). Roles are the kit's data-ws-role keys plus the aliases a pack page
// declares through its band label or tab line 3. A role that is not here gets no ceiling check.
// ---------------------------------------------------------------------------------------------
const CEILINGS = {
    independent: { base: [6, 6, 6], one: [16, 16, 16], name: 'Independent / More Practice' },
    guided: { base: [8, 6, 6], name: 'Guided page' },
    'wide-visual': { base: [5, 4, 3], name: 'Wide-visual rows' },
    decision: { base: [12, 8, 8], name: 'Sub-skill / decision' },
    'error-analysis': { base: [6, 4, 4], name: 'Error analysis' },
    review: { base: [16, 12, 12], name: 'Review' },
    // PT 2.9's table: facts and equations 4 x 5 = 20 at every size (45.6 mm rows); critic round 2
    // (C3) asked for fact tests packed from the measured height, not 4 x 3 of 75 mm cells.
    test: { base: [20, 16, 12], one: [20, 20, 20], name: 'Test A / B' },
    'pre-skill': { base: [24, 20, 16], name: 'Pre-skill check' },
    'true-false': { base: [8, 6, 4], name: 'True or False?' },
    'reason-it': { base: [4, 3, 2], name: 'Reason It' },
    stretch: { base: [2, 2, 1], name: 'Stretch' },
    'word-problems': { base: [4, 3, 3], name: 'Word problems, plain rows' },
    flashcards: { base: [9, 9, 9], name: 'Flashcards' },
};
const ROLE_ALIASES = {
    'more-practice': 'independent', practice: 'independent', 'independent-practice': 'independent',
    'test-a': 'test', 'test-b': 'test', 'guided-page': 'guided', 'sub-skill': 'decision', 'error': 'error-analysis',
    'tf': 'true-false', 'true-or-false': 'true-false', 'reason': 'reason-it', 'wp-rows': 'word-problems',
};
const ceilingFor = (role, size, oneSymbol) => {
    const r = CEILINGS[ROLE_ALIASES[role] || role];
    if (!r) return null;
    const i = { S: 0, M: 1, L: 2 }[size] ?? 2;
    return { n: (oneSymbol && r.one ? r.one : r.base)[i], name: r.name + (oneSymbol && r.one ? ' (one-symbol answers)' : '') };
};

// ---------------------------------------------------------------------------------------------
// Pack exemptions. The pack is the definition of compliant, so a lint that fails on it is wrong -
// unless the pack page itself demonstrates something the standard later rejected, or breaks a rule
// outright. Those pages are listed here, by page id (the id printed in the pack's teacher footer or
// its file:page position), with the reason, and every waived finding is still printed under
// "waived" so nothing is hidden. Keep this list short and argued.
// ---------------------------------------------------------------------------------------------
const PACK_WAIVERS = [
    // 11-B / 11-C show the digit variants cv01 and cv06 so the owner could choose; TY-4 records that
    // both were REJECTED (owner ruling 2026-09-19). The pages exist to show a rejected option.
    { file: '11-options-and-variants', page: '11-B', lint: 'L-FONT', rule: 'TY-4', reason: 'decision-aid page showing the rejected cv01 variant (TY-4 owner ruling 2026-09-19)' },
    { file: '11-options-and-variants', page: '11-C', lint: 'L-FONT', rule: 'TY-4', reason: 'decision-aid page showing the rejected cv06 variant (TY-4 owner ruling 2026-09-19)' },
    // GENUINE PACK DEFECTS, reported rather than hidden. The pack predates rules it breaks; the kit must
    // follow the standard, not these pages. Each is listed in the gate's output as WAIVED.
    // BD-5 sets the Day tab 5 / 6 / 7 mm tall; kit.mjs dayBand() stretches it to the full write-in
    // strip (a hard-coded 10 mm on 01-F, 8 mm on 08-G, both at size M), so it is a solid black
    // block 14.7 x 10 mm - over the INK-5 7 mm limit.
    { file: '01-computation', page: '01-computation:6', lint: 'L-INK', rule: 'INK-5', reason: 'PACK DEFECT: Day tab 10 mm tall at size M (BD-5: 6 mm); the kit must draw BD-5 tabs' },
    { file: '08-daily-review', page: '08-daily-review:7', lint: 'L-INK', rule: 'INK-5', reason: 'PACK DEFECT: Day tab 8 mm tall at size M (BD-5: 6 mm); the kit must draw BD-5 tabs' },
    // Section 12.1 ceilings the pack exceeds (the capacity tables of 12.3 would allow these counts;
    // 12.1 says a ceiling is never exceeded). Owner ruling needed on which table governs.
    { file: '01-computation', page: '01-computation:3', lint: 'L-DENSITY', rule: 'DN-1', reason: 'PACK DEFECT: 01-C More Practice holds 12 stacked items at size M; the 12.1 ceiling is 6 (12.3 capacity allows 12 with regroup boxes at 3 columns)' },
    { file: '06-lesson-packet-level4', page: '06-lesson-packet-level4:3', lint: 'L-DENSITY', rule: 'DN-1', reason: 'PACK DEFECT: Independent Practice page holds 8 missing-number items at size M; the 12.1 ceiling is 6' },
    { file: '09-thinking-pages', page: '09-thinking-pages:3', lint: 'L-DENSITY', rule: 'DN-1', reason: 'PACK DEFECT: Reason It B holds 4 items at size M; the 12.1 ceiling is 3' },
];

// 12-screen-and-dialog is not a sheet: its header says the frames "carry the class ws-page only so
// build.cjs screenshots them". They are screen mock-ups with colour chrome by design (SC-2, SP-30).
const PACK_NOT_SHEETS = ['12-screen-and-dialog'];

// =============================================================================================
// IN-PAGE COLLECTOR. Runs inside the printed document (print media emulated). Self-contained:
// puppeteer serialises it, so it may not reference anything outside its own body.
// Returns DOM findings plus the geometry the node side combines with the PDF.
// =============================================================================================
function wsLintPage(cfg) {
    const PX = 96 / 25.4;
    const mm = px => Math.round((px / PX) * 10) / 10;
    const findings = [];
    const isLegacy = cfg.mode === 'legacy';
    let tagN = 0;
    const tags = [];
    const tagOf = el => {
        if (!el.__wslTag) {
            if (!el.id || !/^[A-Za-z][\w-]*$/.test(el.id) || document.querySelectorAll('#' + CSS.escape(el.id)).length > 1) el.id = 'wsl-' + (++tagN);
            el.__wslTag = el.id;
            tags.push(el.id);
        }
        return el.__wslTag;
    };

    /* ------------------------------------------------------------------ roots, pages, cells */
    const visible = el => {
        if (!el.isConnected) return false;
        if (el.closest('defs, clipPath, mask, marker, symbol, pattern, title, desc, style, script, noscript, template, head')) return false;
        if (typeof el.checkVisibility === 'function') return el.checkVisibility({ checkVisibilityCSS: true });
        const cs = getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden';
    };
    let pages = [];
    let roots = [];
    if (!isLegacy) {
        pages = [...document.querySelectorAll('[data-ws-page]')];
        if (!pages.length) pages = [...document.querySelectorAll('.ws-page')];
        pages = pages.filter(visible);
        roots = pages;
    } else {
        roots = [...document.querySelectorAll('.worksheet-set')].filter(visible);
    }
    const PAGE_SEL = isLegacy ? '.worksheet-set' : (document.querySelector('[data-ws-page]') ? '[data-ws-page]' : '.ws-page');
    const CELL_SEL = isLegacy ? '.worksheet-problem' : '[data-ws-cell], .ws-cell:not(.blankrun)';
    const isKeyRoot = r => {
        if (r.closest('[data-ws-mode="key"]') || r.matches('[data-ws-mode="key"]')) return true;
        if (r.querySelector('[data-ws-key], .answer-key-grid, .answer-key-section')) return true;
        const tab = [...r.querySelectorAll('.ws-tabbox span, .ws-field.name')].map(s => s.textContent.trim());
        return tab.some(t => /^Answer Key$/i.test(t));
    };
    const allCells = [];
    const rootInfo = roots.map((r, i) => {
        const cells = [...r.querySelectorAll(CELL_SEL)].filter(c => visible(c) && !c.parentElement.closest(CELL_SEL));
        cells.forEach(c => allCells.push(c));
        return { el: r, idx: i, key: isKeyRoot(r), cells };
    });
    const rootOf = el => rootInfo.find(ri => ri.el === el.closest(PAGE_SEL));
    const cellNo = el => { const c = el.closest(CELL_SEL); if (!c) return null; const ri = rootOf(c); return ri ? ri.cells.indexOf(c) + 1 : null; };

    /* ------------------------------------------------------------------ describing an element */
    const ownText = el => {
        let s = '';
        for (const n of el.childNodes) if (n.nodeType === 3) s += n.nodeValue;
        return s.replace(/\s+/g, ' ').trim();
    };
    // innerText keeps the gap between blocks ("219" + "Draw" stays two words); SVG has no innerText
    const textOf = el => (typeof el.innerText === 'string' ? el.innerText : el.textContent) || '';
    const describe = el => {
        const t = el.tagName.toLowerCase();
        const cls = el.getAttribute('class') ? '.' + el.getAttribute('class').trim().split(/\s+/).filter(c => !/^wsl-/.test(c)).slice(0, 2).join('.') : '';
        const ws = [...el.attributes].filter(a => /^data-ws-(cell|slot|shape|label|zone|role)$/.test(a.name)).map(a => `[${a.name}${a.value ? '="' + a.value + '"' : ''}]`).join('');
        let txt = ownText(el) || textOf(el).replace(/\s+/g, ' ').trim();
        txt = txt ? ` "${txt.slice(0, 28)}${txt.length > 28 ? '...' : ''}"` : '';
        return `<${t}${cls}${ws}>${txt}`;
    };
    const where = el => {
        const out = { el: describe(el) };
        const ri = rootOf(el);
        if (ri) { if (isLegacy) out.part = ri.key ? 'key' : 'pupil'; else out.page = ri.idx + 1; }
        const c = cellNo(el);
        if (c) out.cell = c;
        if (isLegacy) out.tag = tagOf(el);
        return out;
    };
    // `key` groups identical defects (the same wrong colour on 20 cells is one defect, x20)
    const F = (lint, rule, sev, el, msg, key) => findings.push({ lint, rule, sev, msg, key: key || msg, ...(el ? where(el) : {}) });

    /* ------------------------------------------------------------------ colour */
    const parseColor = v => {
        if (!v) return null;
        v = String(v).trim();
        if (v === 'none' || v === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
        let m = v.match(/^rgba?\(([^)]+)\)/);
        if (m) {
            const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(s => (s.endsWith('%') ? parseFloat(s) * 2.55 : parseFloat(s)));
            return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? (m[1].includes('%') && /\/\s*[\d.]+%/.test(m[1]) ? p[3] / 255 : p[3]) : 1 };
        }
        m = v.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
        if (m) return { r: +m[1] * 255, g: +m[2] * 255, b: +m[3] * 255, a: m[4] === undefined ? 1 : +m[4] };
        return null;
    };
    const ALLOWED = [[0, 0, 0], [255, 255, 255], [148, 148, 148]];
    const isAllowed = c => ALLOWED.some(a => Math.abs(c.r - a[0]) <= 1.5 && Math.abs(c.g - a[1]) <= 1.5 && Math.abs(c.b - a[2]) <= 1.5);
    const hex = c => '#' + [c.r, c.g, c.b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
    const isBlack = c => c && c.a > 0.99 && c.r < 40 && c.g < 40 && c.b < 40;
    const lumin = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
    const contrast = (a, b) => { const x = lumin(a), y = lumin(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const printsBg = cs => cfg.printBackground || cs.printColorAdjust === 'exact' || cs.webkitPrintColorAdjust === 'exact';
    const svgGeom = el => el instanceof SVGGeometryElement || el instanceof SVGUseElement;
    const svgText = el => el instanceof SVGTextContentElement;
    const lenPx = (v, el) => { const n = parseFloat(v); if (!isFinite(n)) return 0; if (/mm$/.test(v)) return n * PX; if (/pt$/.test(v)) return n * 96 / 72; if (/%$/.test(v)) return 0; return n; };
    const svgScale = el => { try { const m = el.getScreenCTM(); return m ? Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) : 1; } catch (e) { return 1; } };

    const inFeedback = el => !!el.closest('[data-ws-feedback]');
    const cutOrUnknown = el => !!(el.closest('[data-ws-cut]') || el.closest('[data-ws-shape="box-unknown"]'));

    /* ------------------------------------------------------------------ element sweep */
    const elems = [];
    for (const ri of rootInfo) {
        for (const el of [ri.el, ...ri.el.querySelectorAll('*')]) {
            if (inFeedback(el) || !visible(el)) continue;
            elems.push(el);
        }
    }
    const textEls = [];
    const blackCands = [];
    const TEACHER_SEL = '[data-ws-teacher], .ws-foot, .sheet-foot, .worksheet-footer-bar, .worksheet-footer';
    const reported = new Set();
    const once = (k, fn) => { if (!reported.has(k)) { reported.add(k); fn(); } };

    for (const el of elems) {
        const cs = getComputedStyle(el);
        const svg = el instanceof SVGElement;
        const txt = ownText(el);
        const textBearing = txt.length > 0 && (!svg || svgText(el));
        const parentCs = el.parentElement ? getComputedStyle(el.parentElement) : null;
        if (textBearing) textEls.push(el);

        // ---- INK-1: paints
        const paint = (value, what, sevIfBad = 'major', note = '') => {
            const c = parseColor(value);
            if (!c || c.a === 0) return;
            if (c.a < 0.995) { F('L-INK', 'INK-2', 'major', el, `${what} is semi-transparent (${value}): no opacity below 1 (INK-2)`, `alpha ${what} ${value}`); return; }
            if (!isAllowed(c)) F('L-INK', 'INK-1', sevIfBad, el, `${what} ${hex(c)} is not ink #000, paper #fff or grey #949494 (INK-1)${note}`, `${what} ${hex(c)}`);
        };
        if (textBearing && !svg) paint(cs.color, 'text colour');
        if (textBearing && svg) { if (!/^url/.test(cs.fill)) paint(cs.fill, 'SVG text fill'); }
        {
            const bg = parseColor(cs.backgroundColor);
            if (bg && bg.a > 0) {
                const printed = printsBg(cs);
                paint(cs.backgroundColor, 'background', printed ? 'major' : 'minor', printed ? '' : ' - prints whenever the teacher\'s "Background graphics" box is on');
            }
            if (cs.backgroundImage && cs.backgroundImage !== 'none') F('L-INK', 'INK-2', 'major', el, `background-image ${cs.backgroundImage.slice(0, 60)}: no gradients or background images (INK-2)`, `bgimage ${cs.backgroundImage.slice(0, 40)}`);
        }
        if (!svg || el instanceof SVGSVGElement) {
            const byColour = new Map();
            let dashed = false;
            for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
                const w = parseFloat(cs[`border${side}Width`]);
                const st = cs[`border${side}Style`];
                if (!(w > 0) || st === 'none' || st === 'hidden') continue;
                const col = cs[`border${side}Color`];
                if (!byColour.has(col)) byColour.set(col, []);
                byColour.get(col).push(side.toLowerCase());
                if (st === 'dashed') dashed = true;
                if (/double|groove|ridge|inset|outset/.test(st)) F('L-INK', 'INK-2', 'minor', el, `border-style ${st}: borders are solid, dotted or the two dashed uses (LS)`, `border-style ${st}`);
            }
            for (const [col, sides] of byColour) paint(col, `border (${sides.length === 4 ? 'all sides' : sides.join(', ')})`);
            if (dashed && !cutOrUnknown(el)) F('L-INK', 'LS-4', 'major', el, `dashed border: a dashed line means "cut here" (data-ws-cut) or the missing-digit box (data-ws-shape="box-unknown"), nothing else (LS-2, LS-4)`, 'dashed border');
            if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) paint(cs.outlineColor, 'outline');
        }
        if (textBearing && cs.textDecorationLine && cs.textDecorationLine !== 'none') paint(cs.textDecorationColor, 'text-decoration');
        if (textBearing && parseFloat(cs.webkitTextStrokeWidth) > 0) paint(cs.webkitTextStrokeColor, 'text stroke');
        if (svg && (svgGeom(el) || svgText(el))) {
            const fillUrl = /url\(/.test(cs.fill);
            if (fillUrl) {
                const id = (cs.fill.match(/url\(\s*["']?#([^"')]+)/) || [])[1];
                const ref = id && document.getElementById(id);
                if (ref && /gradient/i.test(ref.tagName)) F('L-INK', 'INK-2', 'major', el, `fill is a ${ref.tagName} (INK-2: no gradients)`, `gradient fill ${ref.tagName}`);
            } else if (!svgText(el) && !(el instanceof SVGLineElement)) paint(cs.fill, 'SVG fill');
            const sw = lenPx(cs.strokeWidth, el);
            if (cs.stroke && cs.stroke !== 'none' && sw > 0) {
                if (/url\(/.test(cs.stroke)) F('L-INK', 'INK-2', 'major', el, 'stroke paint is a paint server (INK-2)', 'paint-server stroke');
                else paint(cs.stroke, 'SVG stroke');
                if (cs.strokeDasharray && cs.strokeDasharray !== 'none' && !cutOrUnknown(el)) {
                    const d = cs.strokeDasharray.split(/[\s,]+/).map(v => lenPx(v, el)).filter(v => isFinite(v));
                    const dotted = d.length && (d[0] === 0 || d.filter((_, i) => i % 2 === 0).every(v => v <= sw * 1.01));
                    if (!dotted) F('L-INK', 'LS-4', 'major', el, `dashed SVG stroke (dasharray ${cs.strokeDasharray}): dashed is only a cut line or the missing-digit box (LS-2, LS-4)`, 'dashed svg stroke');
                }
            }
            for (const [p, what] of [['fillOpacity', 'fill-opacity'], ['strokeOpacity', 'stroke-opacity']]) {
                const v = parseFloat(cs[p]);
                if (v < 0.995 && (p !== 'fillOpacity' || cs.fill !== 'none') && (p !== 'strokeOpacity' || (cs.stroke !== 'none' && sw > 0))) F('L-INK', 'INK-2', 'major', el, `${what} ${v}: no opacity below 1 (INK-2)`, `${what} ${v}`);
            }
        }

        // ---- INK-2: effects (reported where declared, not where inherited)
        if (cs.boxShadow && cs.boxShadow !== 'none') F('L-INK', 'INK-2', 'major', el, `box-shadow ${cs.boxShadow}: no shadows (INK-2)`, `box-shadow ${cs.boxShadow}`);
        if (cs.textShadow && cs.textShadow !== 'none' && !(parentCs && parentCs.textShadow === cs.textShadow)) F('L-INK', 'INK-2', 'major', el, `text-shadow ${cs.textShadow}: no shadows (INK-2)`, `text-shadow ${cs.textShadow}`);
        if (cs.filter && cs.filter !== 'none') F('L-INK', 'INK-2', 'major', el, `filter ${cs.filter}: no filters (INK-2) - grey must be ink, not a greyscale filter`, `filter ${cs.filter}`);
        if (cs.backdropFilter && cs.backdropFilter !== 'none') F('L-INK', 'INK-2', 'major', el, `backdrop-filter ${cs.backdropFilter} (INK-2)`, `backdrop ${cs.backdropFilter}`);
        if (cs.mixBlendMode && cs.mixBlendMode !== 'normal') F('L-INK', 'INK-2', 'major', el, `mix-blend-mode ${cs.mixBlendMode} (INK-2)`, `blend ${cs.mixBlendMode}`);
        if (parseFloat(cs.opacity) < 0.995) F('L-INK', 'INK-2', 'major', el, `opacity ${cs.opacity}: ink is never faded (INK-2)`, `opacity ${cs.opacity}`);
        if (/^(img|canvas|video|object|embed|iframe|image)$/i.test(el.tagName)) F('L-INK', 'INK-7', 'major', el, `raster/embedded <${el.tagName.toLowerCase()}> on the sheet: its colours cannot be checked; pictures are in-house SVG line art (INK-7, RP-20)`, `raster ${el.tagName}`);

        // ---- INK-5: solid black fills over 7 mm in both dimensions (measured below, after the sweep)
        const r = el.getBoundingClientRect();
        if (r.width > 7.3 * PX && r.height > 7.3 * PX) {
            if (svg && svgGeom(el) && !(el instanceof SVGLineElement) && !/url\(/.test(cs.fill) && isBlack(parseColor(cs.fill)) && parseFloat(cs.fillOpacity) > 0.99) blackCands.push({ el, kind: 'svg' });
            if (!svg && isBlack(parseColor(cs.backgroundColor)) && printsBg(cs)) blackCands.push({ el, kind: 'html' });
        }

        // ---- L-FONT (DOM): family, weight, style, variants
        if (textBearing) {
            const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
            if (!/^andika$/i.test(fam)) F('L-FONT', 'TY-1', 'major', el, `font-family "${cs.fontFamily}": every character of question content is Andika (TY-1)`, `family ${fam}`);
            const wt = parseInt(cs.fontWeight, 10);
            if (wt !== 400 && wt !== 700) F('L-FONT', 'TY-2', 'major', el, `font-weight ${cs.fontWeight}: Andika has only 400 and 700 (TY-2)`, `weight ${cs.fontWeight}`);
            if (cs.fontStyle !== 'normal') F('L-FONT', 'TY-2', 'major', el, `font-style ${cs.fontStyle}: no italic anywhere (TY-2, AX-3)`, `style ${cs.fontStyle}`);
            const cv = (cs.fontFeatureSettings.match(/"cv\d\d"\s*(?:1|on)?/g) || []).map(s => s.match(/cv\d\d/)[0]).filter(f => f !== 'cv04');
            if (cv.length) F('L-FONT', 'TY-4', 'major', el, `font-feature-settings ${cs.fontFeatureSettings}: only "cv04" is set; ${cv.join(', ')} were rejected (TY-4)`, `cv ${cv.join(',')}`);
            if (/\d/.test(txt) && !/cv04/.test(cs.fontFeatureSettings)) F('L-FONT', 'TY-4', 'minor', el, `digits without font-feature-settings "cv04" (the open-top 4, TY-4)`, 'no cv04');
            if ((cs.fontSynthesisWeight && cs.fontSynthesisWeight !== 'none') || (cs.fontSynthesisStyle && cs.fontSynthesisStyle !== 'none')) {
                const ri = rootOf(el);
                once(`synth ${ri ? ri.idx : ''}`, () => F('L-FONT', 'TY-2', 'minor', el, `font-synthesis is not none (weight ${cs.fontSynthesisWeight}, style ${cs.fontSynthesisStyle}): the browser may fake bold or italic (TY-2)`, 'font-synthesis'));
            }
            // ---- L-SIZE TY-11 floor
            if (!el.closest(TEACHER_SEL)) {
                const pt = parseFloat(cs.fontSize) * 72 / 96 * (svg ? svgScale(el) : 1);   // SVG text: user units scaled by the viewBox
                if (pt < 7.95) F('L-SIZE', 'TY-11', 'major', el, `${pt.toFixed(1)} pt text: nothing a pupil reads is under 8 pt (TY-11)`, `size ${pt.toFixed(1)}`);
            }
        }
        // ---- L-INPUT
        if (/^(input|button|select|textarea)$/i.test(el.tagName) || el.isContentEditable && el.getAttribute('contenteditable') !== null) F('L-INPUT', 'SP-10', 'major', el, `<${el.tagName.toLowerCase()}> on a printed sheet: print and key modes carry no inputs (L-INPUT)`, `input ${el.tagName}`);
    }

    /* ------------------------------------------------------------------ ILLEGIBLE: text vs what is behind it */
    const styleEl = document.createElement('style');
    styleEl.textContent = '* { pointer-events: auto !important; }';
    document.head.appendChild(styleEl);
    const vh = window.innerHeight;
    const textPoint = el => {
        if (el instanceof SVGElement) { const b = el.getBoundingClientRect(); return b.width || b.height ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : null; }
        const range = document.createRange();
        for (const n of el.childNodes) {
            if (n.nodeType !== 3 || !n.nodeValue.trim()) continue;
            range.selectNodeContents(n);
            const rr = [...range.getClientRects()].find(q => q.width > 0.5 && q.height > 0.5);
            if (rr) return { x: rr.left + rr.width / 2, y: rr.top + rr.height / 2 };
        }
        return null;
    };
    const paintAt = (node, x, y) => {
        // what `node` paints at viewport point (x, y): a colour, null (nothing), or 'unknown'
        const cs = getComputedStyle(node);
        if (node instanceof SVGElement && !(node instanceof SVGSVGElement)) {
            if (!svgGeom(node) || !(node instanceof SVGGeometryElement)) return null;
            let pt;
            try { pt = new DOMPoint(x, y).matrixTransform(node.getScreenCTM().inverse()); } catch (e) { return 'unknown'; }
            const stroke = parseColor(cs.stroke);
            if (stroke && stroke.a > 0 && lenPx(cs.strokeWidth, node) > 0 && node.isPointInStroke(pt)) return stroke;
            const fill = /url\(/.test(cs.fill) ? 'unknown' : parseColor(cs.fill);
            if (fill && (fill === 'unknown' || fill.a > 0) && node.isPointInFill(pt)) return fill;
            return null;
        }
        if (cs.backgroundImage && cs.backgroundImage !== 'none' && printsBg(cs)) return 'unknown';
        const bg = parseColor(cs.backgroundColor);
        if (bg && bg.a > 0.5 && printsBg(cs)) return bg;
        return null;
    };
    const byY = textEls.map(el => ({ el, p: null })).filter(o => !(o.el.closest(TEACHER_SEL)));
    for (const o of byY) {
        const el = o.el;
        const r = el.getBoundingClientRect();
        const docY = r.top + window.scrollY;
        if (docY < window.scrollY + 20 || docY > window.scrollY + vh - 40) window.scrollTo(0, Math.max(0, docY - vh / 2));
        const pt = textPoint(el);
        if (!pt || pt.y < 0 || pt.y > vh || pt.x < 0 || pt.x > window.innerWidth) continue;
        const cs = getComputedStyle(el);
        const svg = el instanceof SVGElement;
        const inks = [];
        let fillC = parseColor(svg ? cs.fill : cs.color);
        // Chrome printing without background graphics (print-color-adjust: economy) darkens text that
        // is near white (Blink TextColorForWhiteBackground -> Color::Dark), so white-on-a-dropped-
        // background still prints. Model it, or every such label would read as white on white.
        if (fillC && !svg && !printsBg(cs) && (255 - fillC.r) ** 2 + (255 - fillC.g) ** 2 + (255 - fillC.b) ** 2 <= 65025) {
            const v = Math.max(fillC.r, fillC.g, fillC.b) / 255, k = v > 0 ? Math.max(0, (v - 0.33) / v) : 0;
            fillC = { r: fillC.r * k, g: fillC.g * k, b: fillC.b * k, a: fillC.a };
        }
        if (fillC && fillC.a > 0.3) inks.push(fillC);
        const strokeC = svg ? parseColor(cs.stroke) : parseColor(cs.webkitTextStrokeColor);
        const strokeW = svg ? lenPx(cs.strokeWidth, el) : parseFloat(cs.webkitTextStrokeWidth);
        if (strokeC && strokeC.a > 0.3 && strokeW > 0) inks.push(strokeC);
        if (!inks.length) continue;
        const stack = document.elementsFromPoint(pt.x, pt.y);
        let start = stack.indexOf(el);
        if (start < 0) { start = stack.findIndex(n => n.contains(el)); }
        let bg = null;
        for (let i = Math.max(0, start); i < stack.length; i++) {
            const n = stack[i];
            if (n === document.documentElement || n === document.body) break;
            if (n !== el && svgText(n)) continue;
            const p = paintAt(n, pt.x, pt.y);
            if (p) { bg = p; break; }
        }
        if (bg === 'unknown') continue;
        if (!bg) bg = { r: 255, g: 255, b: 255, a: 1 };
        const best = Math.max(...inks.map(c => contrast(c, bg)));
        if (best < 1.5) {
            F('L-INK', 'ILLEGIBLE', 'critical', el, `ILLEGIBLE: text "${ownText(el).slice(0, 20)}" in ${inks.map(hex).join(' / ')} on ${hex(bg)} (contrast ${best.toFixed(2)}:1) - the pupil cannot read it (INK-5, AX-1)`, `illegible ${inks.map(hex).join('/')} on ${hex(bg)}`);
        }
    }

    /* ------------------------------------------------------------------ INK-5: measure the black fills */
    // The largest disk that fits inside the black area decides (a bar 7 mm wide is allowed, a 20 mm
    // disk is not). SVG shapes are sampled with isPointInFill; an HTML box only where its OWN black
    // background is what shows (the kit's grid is a black box under white cells: only its gaps show).
    const chamfer = (mask, cols, rows) => {
        const d = new Float64Array(cols * rows);
        for (let i = 0; i < d.length; i++) d[i] = mask[i] ? 1e9 : 0;
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
            const i = y * cols + x; if (!d[i]) continue;
            d[i] = Math.min(d[i], y ? d[i - cols] + 3 : 3, x ? d[i - 1] + 3 : 3, x && y ? d[i - cols - 1] + 4 : 4, y && x < cols - 1 ? d[i - cols + 1] + 4 : 4);
        }
        let best = 0;
        for (let y = rows - 1; y >= 0; y--) for (let x = cols - 1; x >= 0; x--) {
            const i = y * cols + x; if (!d[i]) continue;
            d[i] = Math.min(d[i], y < rows - 1 ? d[i + cols] + 3 : 3, x < cols - 1 ? d[i + 1] + 3 : 3, x < cols - 1 && y < rows - 1 ? d[i + cols + 1] + 4 : 4, y < rows - 1 && x ? d[i + cols - 1] + 4 : 4);
            if (d[i] > best) best = d[i];
        }
        return best / 3;    // in samples: the radius of the largest disk
    };
    const textPts = textEls.map(t => { const b = t.getBoundingClientRect(); return { t, x: b.left + b.width / 2 + window.scrollX, y: b.top + b.height / 2 + window.scrollY }; });
    let counters = 0;
    for (const { el, kind } of blackCands) {
        let b = el.getBoundingClientRect();
        const docTop = b.top + window.scrollY;
        if (b.top < 0 || b.bottom > vh) { window.scrollTo(0, Math.max(0, docTop - 20)); b = el.getBoundingClientRect(); }
        const pitch = Math.max(0.5 * PX, Math.max(b.width, b.height) / (kind === 'svg' ? 120 : 80));
        const cols = Math.max(1, Math.floor(b.width / pitch)), rows = Math.max(1, Math.floor(b.height / pitch));
        const mask = new Uint8Array(cols * rows);
        let inv = null;
        if (kind === 'svg') { try { inv = el.getScreenCTM().inverse(); } catch (e) { continue; } }
        const hit = (x, y) => {
            if (kind === 'svg') return el.isPointInFill(new DOMPoint(x, y).matrixTransform(inv));
            if (y < 0 || y > vh) return false;
            for (const n of document.elementsFromPoint(x, y)) { const p = paintAt(n, x, y); if (p) return n === el; }
            return false;
        };
        if (kind === 'html') {      // cheap pre-check: is any of the box's own black showing at all?
            let seen = 0;
            for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (hit(b.left + (x + 0.5) * b.width / 8, b.top + (y + 0.5) * b.height / 8)) seen++;
            if (seen < 2) continue;
        }
        let filled = 0;
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (hit(b.left + (x + 0.5) * pitch, b.top + (y + 0.5) * pitch)) { mask[y * cols + x] = 1; filled++; }
        const dia = mm(2 * chamfer(mask, cols, rows) * pitch);
        if (dia <= 7.3) continue;
        const wMm = mm(b.width), hMm = mm(b.height);
        const ratio = filled / (cols * rows);
        const round = /^(circle|ellipse)$/i.test(el.tagName) || (ratio > 0.7 && ratio < 0.86 && Math.abs(wMm - hMm) < 1);
        const bx = b.left + window.scrollX, by = b.top + window.scrollY;
        const hasText = textPts.some(p => p.t !== el && !el.contains(p.t) && p.x > bx && p.x < bx + b.width && p.y > by && p.y < by + b.height) || (kind === 'html' && ownText(el));
        // RP-11 / RP-20 / 11.2: counters are solid black at the 9 / 10 / 12 mm item size, and INK-5
        // names counters among its allowed fills. A bare round counter up to 12 mm with nothing
        // written on it is therefore compliant; a disk carrying a label ("100") or wider is not.
        if (round && !hasText && Math.max(wMm, hMm) <= 12.3) { counters++; continue; }
        F('L-INK', 'INK-5', 'major', el, `${kind === 'svg' ? `<${el.tagName}> filled black` : `<${el.tagName.toLowerCase()}> black background`}, ${wMm} x ${hMm} mm (a ${dia} mm disk fits inside the black): solid black only where the smaller side is <= 7 mm; larger shapes are outlined, grey or hatched (INK-5)${hasText ? ' - and it carries text' : ''}`, `black fill ${el.tagName} ${wMm}x${hMm}`);
    }
    window.scrollTo(0, 0);
    styleEl.remove();

    /* ------------------------------------------------------------------ L-EMOJI */
    const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{20E3}\u{1F1E6}-\u{1F1FF}\u{2605}\u{2606}]/gu;
    for (const ri of rootInfo) {
        const walker = document.createTreeWalker(ri.el, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const p = n.parentElement;
            if (!p || inFeedback(p) || !visible(p)) continue;
            const s = n.nodeValue;
            const em = s.match(EMOJI);
            if (em) F('L-EMOJI', 'INK-7', 'major', p, `emoji / pictographic ${[...new Set(em)].map(c => `"${c}" U+${c.codePointAt(0).toString(16).toUpperCase()}`).join(', ')} in sheet text (INK-7, TY-6, RP-7)`, `emoji ${[...new Set(em)].join('')}`);
            if (/\d\s*[xX*]\s*\d/.test(s)) F('L-EMOJI', 'TY-6', 'major', p, `"${s.trim().slice(0, 24)}": multiplication written with a letter x or asterisk; the operator is the true glyph U+00D7 (TY-6)`, 'letter x operator');
            if (!p.closest(TEACHER_SEL) && /(^|[^\d/])\d{1,3}\s*\/\s*\d{1,3}(?![\d/])/.test(s)) F('L-FONT', 'TY-7', 'major', p, `slash fraction "${(s.match(/\d{1,3}\s*\/\s*\d{1,3}/) || [''])[0]}": fractions are always stacked over a bar, a slash fraction is a defect (TY-7)`, 'slash fraction');
            if (/\d\s+-\s+\d/.test(s)) F('L-EMOJI', 'TY-6', 'major', p, `"${s.trim().slice(0, 24)}": subtraction written with a hyphen; the operator is U+2212 (TY-6)`, 'hyphen operator');
            if (/^[-*xX]$/.test(s.trim()) && p.parentElement && /\d/.test(p.parentElement.textContent) && p.closest('.stack, .ws-stack, .ws-fact, .stack-row, .op, .ws-eq')) F('L-EMOJI', 'TY-6', 'major', p, `operator "${s.trim()}" is not a true glyph (+ U+2212 U+00D7 U+00F7) (TY-6)`, `ascii operator ${s.trim()}`);
        }
        for (const el of ri.el.querySelectorAll('*')) {
            for (const pe of ['::before', '::after']) {
                const c = getComputedStyle(el, pe).content;
                if (c && c !== 'none' && c !== 'normal') { const em = c.match(EMOJI); if (em) F('L-EMOJI', 'INK-7', 'major', el, `emoji ${[...new Set(em)].join(' ')} in ${pe} content (INK-7)`, `emoji ${pe} ${em.join('')}`); }
            }
        }
    }

    /* ------------------------------------------------------------------ L-FONT (document) */
    const fontsLoaded = document.fonts ? (document.fonts.check('400 20px Andika') && document.fonts.check('700 20px Andika')) : false;
    const andikaFaces = document.fonts ? [...document.fonts].filter(f => /andika/i.test(f.family)) : [];
    const andikaLoaded = andikaFaces.some(f => f.status === 'loaded');
    const google = [...document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]')].map(l => l.href.slice(0, 90));

    /* ------------------------------------------------------------------ L-OVERFLOW */
    const TOL = 0.75; // px (0.2 mm), the same tolerance design/mockups/build.cjs uses
    for (const ri of rootInfo) {
        for (const c of ri.cells) {
            const cr = c.getBoundingClientRect();
            for (const d of c.querySelectorAll('*')) {
                if (!visible(d)) continue;
                const r = d.getBoundingClientRect();
                if (!r.width || !r.height) continue;
                const over = Math.max(r.right - cr.right, cr.left - r.left, r.bottom - cr.bottom, cr.top - r.top);
                if (over > TOL) { F('L-OVERFLOW', 'PG-12', 'major', d, `sticks out of its cell by ${mm(over)} mm (cell ${mm(cr.width)} x ${mm(cr.height)} mm) (PG-12, CL-1)`, 'out of cell'); break; }
            }
        }
        if (!isLegacy) {
            const pg = ri.el;
            const pr = pg.getBoundingClientRect();
            const pcs = getComputedStyle(pg);
            if (pg.scrollHeight > pg.clientHeight + 1) F('L-OVERFLOW', 'PG-12', 'critical', pg, `page content is ${mm(pg.scrollHeight - pg.clientHeight)} mm taller than the page box and is cut off at the bottom (PG-12, PG-20)`, 'page clipped');
            const live = { l: pr.left + parseFloat(pcs.paddingLeft), r: pr.right - parseFloat(pcs.paddingRight), t: pr.top + parseFloat(pcs.paddingTop), b: pr.bottom - parseFloat(pcs.paddingBottom) };
            let n = 0;
            for (const d of pg.querySelectorAll('*')) {
                if (n > 2 || !visible(d)) continue;
                const r = d.getBoundingClientRect();
                if (!r.width || !r.height) continue;
                const over = Math.max(r.right - live.r, live.l - r.left, r.bottom - live.b, live.t - r.top);
                if (over > TOL && !d.parentElement.closest(CELL_SEL)) { n++; F('L-OVERFLOW', 'PG-13', 'major', d, `extends ${mm(over)} mm outside the page's live area (186 mm wide, margins 12 / 12 / 14 mm) (PG-1, PG-13)`, 'outside live area'); }
            }
        } else {
            const rr = ri.el.getBoundingClientRect();
            const w = cfg.contentWidthPx || rr.width;
            for (const d of ri.el.querySelectorAll('*')) {
                if (!visible(d)) continue;
                const r = d.getBoundingClientRect();
                if (!r.width) continue;
                if (r.right > w + TOL || r.left < -TOL) { F('L-OVERFLOW', 'PG-13', 'major', d, `extends ${mm(Math.max(r.right - w, -r.left))} mm past the ${mm(w)} mm printable width (PG-1, PG-13)`, 'off the paper'); break; }
            }
        }
    }
    for (const el of textEls) {
        if (el instanceof SVGElement) continue;
        const cs = getComputedStyle(el);
        if (/^inline/.test(cs.display) || cs.display === 'contents') continue;
        const clipX = /hidden|clip|scroll|auto/.test(cs.overflowX), clipY = /hidden|clip|scroll|auto/.test(cs.overflowY);
        // vertically the line box carries ~0.3 em of the font's own leading above and below the glyphs,
        // so a tall numeral may overhang its box by that much without a glyph being cut
        const slackY = 0.35 * parseFloat(cs.fontSize);
        if ((clipX && el.scrollWidth > el.clientWidth + 1) || (clipY && el.scrollHeight > el.clientHeight + slackY) || (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1)) {
            F('L-OVERFLOW', 'TY-12', 'major', el, `text is clipped: content ${mm(el.scrollWidth)} x ${mm(el.scrollHeight)} mm in a ${mm(el.clientWidth)} x ${mm(el.clientHeight)} mm box (TY-12: long words wrap, never clip)`, 'clipped text');
        }
    }

    /* ------------------------------------------------------------------ L-VERBS */
    const CONTENT_BANDS = /^(What's New|Vocabulary|Rule|Remember|Steps|Say)\s*:/i;
    const instructions = [];
    for (const ri of rootInfo) {
        const list = [...ri.el.querySelectorAll('[data-ws-instruction], .ws-instrline, .ws-strip > span:not(.ws-daytab):not(.ws-sayframe)')].filter(visible)
            .filter(s => { const strip = s.closest('.ws-strip'); if (!strip) return true; const lab = strip.querySelector(':scope > b'); return !(lab && CONTENT_BANDS.test(lab.textContent.trim())); });
        ri.instructions = list.length;
        for (const s of list) {
            const t = s.textContent.replace(/\s+/g, ' ').trim();
            if (!t || /^Day \d+$/.test(t)) continue;
            instructions.push({ el: s, t });
            const words = t.split(' ').filter(w => /[A-Za-z0-9]/.test(w));
            if (words.length > 12) F('L-VERBS', 'BD-10', 'major', s, `instruction "${t.slice(0, 60)}${t.length > 60 ? '...' : ''}" has ${words.length} words; at most 12 (BD-10)`, 'long instruction');
            if (/\b(explain|describe|justify|discuss|prove)\b/i.test(t)) F('L-VERBS', 'P-LG-4', 'major', s, `instruction "${t.slice(0, 60)}" asks for composed language (${t.match(/\b(explain|describe|justify|discuss|prove)\b/i)[0]}) (BD-12, P-LG-4)`, 'composed language');
            if (/\bcheck\s+(true|false|yes|no)\b/i.test(t)) F('L-VERBS', 'BD-17', 'minor', s, `"${t.slice(0, 40)}": Check takes its object ("Check one box."), never an option word (BD-17)`, 'check option');
        }
        // (not on the pack: its Daily-look panels, BD-6, set their instructions in page-local markup)
        const titled = ri.el.querySelector('.ws-title, .sheet-title, .worksheet-title');
        if (cfg.mode !== 'pack' && ri.cells.length && !list.length && !ri.key && titled && titled.textContent.trim()) F('L-VERBS', 'BD-10', 'minor', ri.el, `no instruction line above the cells: the task sentence is not a section instruction (BD-10: one instruction per section, never inside a cell)`, 'no instruction line');
        const HEAD_SEL = '.section-num, .worksheet-section-header, .ws-strip > b, h2, h3';
        for (const h of ri.el.querySelectorAll(HEAD_SEL)) {
            if (!visible(h) || (h.parentElement && h.parentElement.closest(HEAD_SEL))) continue;
            const t = h.textContent.replace(/\s+/g, ' ').trim();
            if (/^part\s*\d+/i.test(t)) F('L-VERBS', 'BD-1', 'major', h, `section heading "${t.slice(0, 40)}": "Part NN" is not a band label; bands use the fixed vocabulary of BD-1 (and the Daily look plain titles of BD-6)`, 'part heading');
        }
    }
    const SCREEN_ANY = /\b(click(?:s|ed|ing)?|tap(?:s|ped|ping)?|drag(?:s|ged|ging)?|select(?:s|ed|ing)?|press(?:es|ed|ing)?|highlight(?:s|ed|ing)?|hover(?:s|ed|ing)?|swipe(?:s|d)?|scroll(?:s|ed|ing)?|tick(?:s|ed|ing)?(?!\s*marks?\b))\b/i;
    const SCREEN_IMPERATIVE = /(?:^|[.!?:]\s+)(type|enter)\b/i;
    for (const ri of rootInfo) {
        const walker = document.createTreeWalker(ri.el, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const p = n.parentElement;
            if (!n.nodeValue.trim() || !p || inFeedback(p) || !visible(p) || p.closest(TEACHER_SEL)) continue;
            // the word is matched in its own text node (words do not cross nodes), so each is reported once;
            // the message quotes the surrounding block
            const v = n.nodeValue.replace(/\s+/g, ' ').trim();
            const m = v.match(SCREEN_ANY) || v.match(SCREEN_IMPERATIVE);
            if (!m) continue;
            const block = p.closest('p, li, div, td, th, span, text, h1, h2, h3, label') || p;
            const t = textOf(block).replace(/\s+/g, ' ').trim();
            F('L-VERBS', 'BD-12', 'major', block, `screen verb "${m[1] || m[0]}" on paper: "${t.slice(0, 60)}" (BD-11, BD-12, BD-17)`, `screen verb ${String(m[1] || m[0]).toLowerCase()}`);
        }
    }

    /* ------------------------------------------------------------------ L-ANSAREA */
    const SLOT_EXEMPT = '.ws-field, .sheet-field, .worksheet-field, .stack, .ws-stack, .ws-fact, .stack-answer, .stack-row, ' + TEACHER_SEL;
    const lines = new Set();
    for (const ri of rootInfo) {
        for (const s of ri.el.querySelectorAll('[data-ws-shape="line"], [data-ws-shape="unit"] .ws-line, .ws-line, .blank, .answer-blank')) lines.add(s);
        if (isLegacy) for (const s of ri.el.querySelectorAll('span, div, i')) {
            if (s.children.length || ownText(s)) continue;
            const cs = getComputedStyle(s);
            const onlyBottom = parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== 'none' && !(parseFloat(cs.borderTopWidth) > 0) && !(parseFloat(cs.borderLeftWidth) > 0) && !(parseFloat(cs.borderRightWidth) > 0);
            if (!onlyBottom || s.getBoundingClientRect().height >= 15 * PX) continue;
            // a row of equal ruled tracks (a division work grid, a digit row) is not an answer line (SL-1 exempts tracks)
            const sib = s.parentElement ? [...s.parentElement.children].filter(o => o !== s && o.tagName === s.tagName && Math.abs(o.getBoundingClientRect().width - s.getBoundingClientRect().width) < 1 && parseFloat(getComputedStyle(o).borderBottomWidth) > 0) : [];
            if (sib.length >= 1 && s.getBoundingClientRect().width < 14 * PX) continue;
            lines.add(s);
        }
    }
    for (const s of lines) {
        if (!visible(s) || s.closest(SLOT_EXEMPT) || inFeedback(s)) continue;
        const r = s.getBoundingClientRect();
        if (!r.width) continue;
        if (r.width < 14 * PX - 1) F('L-ANSAREA', 'SL-1', 'major', s, `answer line ${mm(r.width)} mm wide; no answer line or stand-alone box is under 14 mm (SL-1, AX-5)`, `short line ${mm(r.width)}`);
    }
    for (const ri of rootInfo) {
        const walker = document.createTreeWalker(ri.el, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const p = n.parentElement;
            if (p && visible(p) && !p.closest(TEACHER_SEL) && /_{3,}/.test(n.nodeValue)) F('L-ANSAREA', 'SL-6', 'major', p, `blank drawn with underscore characters "${n.nodeValue.trim().slice(0, 24)}": blanks are ruled lines or boxes (SL-6)`, 'underscore blank');
        }
    }
    // H12: an item that says draw / build / show needs room to draw the model
    const DRAW = /\b(draw|build|show)\b/i;
    for (const ri of rootInfo) {
        const sectionInstr = [...ri.el.querySelectorAll('[data-ws-instruction], .ws-instrline, .ws-strip > span')].map(s => s.textContent).join(' ');
        for (const c of ri.cells) {
            const ctext = textOf(c).replace(/\s+/g, ' ');
            if (!DRAW.test(ctext) && !DRAW.test(sectionInstr)) continue;
            if (!DRAW.test(ctext) && !isLegacy && ri.cells.length > 1 && !DRAW.test(sectionInstr)) continue;
            // a zone is `[data-ws-zone]` (the kit hook). Legacy output has no hooks, so there a zone is
            // an innermost box bordered on all four sides inside the item (its dashed / labelled boxes).
            let zones = [...c.querySelectorAll('[data-ws-zone]')].filter(visible);
            if (!zones.length && !isLegacy) continue;
            if (!zones.length) {
                zones = [...c.querySelectorAll('div, span, section')].filter(z => {
                    if (!visible(z) || z.closest('[data-ws-slot], .stack, .ws-stack')) return false;
                    const cs = getComputedStyle(z);
                    const all4 = ['Top', 'Right', 'Bottom', 'Left'].every(sd => parseFloat(cs[`border${sd}Width`]) > 0 && cs[`border${sd}Style`] !== 'none');
                    const r = z.getBoundingClientRect();
                    return all4 && r.width > 15 * PX && r.height > 10 * PX;
                });
                zones = zones.filter(z => !zones.some(o => o !== z && z.contains(o)));   // innermost boxes
            }
            if (!zones.length) {
                if (!c.querySelector('svg') && DRAW.test(ctext)) F('L-ANSAREA', 'H12', 'major', c, `the item asks the pupil to ${ctext.match(DRAW)[1].toLowerCase()} but has no drawing zone (RUBRIC H12, PG-14)`, 'no draw zone');
                continue;
            }
            for (const z of zones) {
                const zr = z.getBoundingClientRect();
                // A structured workspace (a ten frame, a chart) is drawn in cell by cell: then each cell
                // must hold a counter - 11.2 "Ten frame, pupil draws counters": cell 10 / 10 / 11 mm.
                const subs = [...z.querySelectorAll('*')].filter(d => {
                    if (!visible(d)) return false;
                    const dcs = getComputedStyle(d), dr = d.getBoundingClientRect();
                    return ['Top', 'Right', 'Bottom', 'Left'].every(sd => parseFloat(dcs[`border${sd}Width`]) > 0 && dcs[`border${sd}Style`] !== 'none') && dr.width > 3 * PX && dr.height > 3 * PX;
                });
                if (subs.length >= 4) {
                    const small = Math.min(...subs.map(d => { const dr = d.getBoundingClientRect(); return Math.min(dr.width, dr.height); }));
                    if (small < 9.5 * PX) F('L-ANSAREA', 'H12', 'major', z, `drawing grid of ${subs.length} cells, the smallest ${mm(small)} mm: a cell the pupil draws a counter in is >= 10 mm (11.2 ten frame, pupil draws counters; RP-5)`, 'small draw cells');
                    continue;
                }
                const G = 1 * PX;   // 1 mm grid
                const cols = Math.max(1, Math.floor(zr.width / G)), rows = Math.max(1, Math.floor(zr.height / G));
                const grid = new Uint8Array(cols * rows);
                const cover = (r, pad = 0) => {
                    const x0 = Math.max(0, Math.floor((r.left - zr.left - pad) / G)), x1 = Math.min(cols - 1, Math.floor((r.right - zr.left + pad) / G));
                    const y0 = Math.max(0, Math.floor((r.top - zr.top - pad) / G)), y1 = Math.min(rows - 1, Math.floor((r.bottom - zr.top + pad) / G));
                    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y * cols + x] = 1;
                };
                const range = document.createRange();
                const tw = document.createTreeWalker(z, NodeFilter.SHOW_TEXT);
                for (let n = tw.nextNode(); n; n = tw.nextNode()) { if (!n.nodeValue.trim() || !visible(n.parentElement)) continue; range.selectNodeContents(n); for (const q of range.getClientRects()) cover(q); }
                for (const d of z.querySelectorAll('*')) {
                    if (!visible(d)) continue;
                    const cs = getComputedStyle(d), r = d.getBoundingClientRect();
                    if (!r.width || !r.height) continue;
                    if (d instanceof SVGElement) { if (d instanceof SVGSVGElement) cover(r); continue; }
                    const bg = parseColor(cs.backgroundColor);
                    if (bg && bg.a > 0 && !(bg.r > 250 && bg.g > 250 && bg.b > 250)) { cover(r); continue; }
                    for (const sd of ['Top', 'Bottom']) if (parseFloat(cs[`border${sd}Width`]) > 0 && cs[`border${sd}Style`] !== 'none') cover({ left: r.left, right: r.right, top: sd === 'Top' ? r.top : r.bottom - 1, bottom: sd === 'Top' ? r.top + 1 : r.bottom });
                    for (const sd of ['Left', 'Right']) if (parseFloat(cs[`border${sd}Width`]) > 0 && cs[`border${sd}Style`] !== 'none') cover({ top: r.top, bottom: r.bottom, left: sd === 'Left' ? r.left : r.right - 1, right: sd === 'Left' ? r.left + 1 : r.right });
                }
                let used = 0; for (const v of grid) used += v;
                const empty = 1 - used / grid.length;
                const hMm = mm(zr.height), wMm = mm(zr.width);
                const label = (z.getAttribute('data-ws-zone') || textOf(z).replace(/\s+/g, ' ').trim()).slice(0, 24);
                if (hMm < 30 - 0.2 || empty < 0.6) F('L-ANSAREA', 'H12', 'major', z, `drawing zone "${label}" is ${wMm} x ${hMm} mm, ${Math.round(empty * 100)}% empty: a zone to draw or build in needs >= 30 mm height and >= 60% empty area (RUBRIC H12, RP-3)`, 'small draw zone');
            }
        }
    }

    /* ------------------------------------------------------------------ L-CCSS */
    const CCSS = /\b(?:K|[1-8])\.[A-Z]{1,3}\.(?:[A-Z]\.)?\d{1,2}[a-z]?\b/;
    const GRADE = /\bGrade\s+(?:K|\d{1,2})\b/i;
    const SKILLID = /\b[a-z]{2,}(?:_[a-z0-9]+){1,}\b/;
    for (const ri of rootInfo) {
        const walker = document.createTreeWalker(ri.el, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const p = n.parentElement;
            if (!p || !visible(p) || p.closest(TEACHER_SEL)) continue;
            const s = n.nodeValue;
            const m = s.match(CCSS) || s.match(GRADE) || s.match(SKILLID);
            if (m) F('L-CCSS', 'SC-5', 'major', p, `"${m[0]}" printed for the pupil: grade, CCSS codes and skill ids appear only in the teacher footer (SC-5, HD-6, HD-30)`, `ccss ${m[0].replace(/\d/g, 'n')}`);
        }
    }

    /* ------------------------------------------------------------------ geometry for the node side */
    const mmRect = (r, o) => [mm(r.left - o.left), mm(r.top - o.top), mm(r.width), mm(r.height)];
    const slotAnswered = s => {
        if (s.matches('[data-ws-ink]') || s.querySelector('[data-ws-ink], [data-ws-key]')) return true;
        const shape = s.getAttribute('data-ws-shape');
        if (shape === 'open') {
            for (const d of s.querySelectorAll('*')) {
                if (d.matches('.op, .head, .headcap') || !visible(d)) continue;
                const t = ownText(d);
                if (t && parseInt(getComputedStyle(d).fontWeight, 10) >= 700) return true;
            }
            return false;
        }
        if ((s.textContent || '').trim()) return true;
        if (s.querySelector('path, line, polyline, circle, ellipse')) return true;
        return false;
    };
    const slotWeightOk = s => { for (const d of [s, ...s.querySelectorAll('*')]) { const t = ownText(d); if (t && !d.matches('.op, .head') && parseInt(getComputedStyle(d).fontWeight, 10) < 700 && s.getAttribute('data-ws-shape') !== 'open') return false; } return true; };
    const oneSymbolShapes = new Set(['circle', 'check', 'choice']);
    const out = { findings, tags, counters, fontsLoaded, andikaLoaded, andikaFaces: andikaFaces.map(f => `${f.family} ${f.weight} ${f.status}`), google, pages: [], legacy: null };
    const ITEM_BANDS = /^(Model|Guided Practice|Steps|Say|What's New|Vocabulary|Rule|Remember|Warm-up)\s*:/i;
    if (!isLegacy) {
        for (const ri of rootInfo) {
            const pg = ri.el;
            const pr = pg.getBoundingClientRect();
            tagOf(pg);
            const cs = getComputedStyle(pg);
            const tab = [...pg.querySelectorAll('.ws-tabbox span')].map(s => s.textContent.trim());
            const bands = [...pg.querySelectorAll('.ws-strip > b')].map(b => b.textContent.trim());
            const foot = pg.querySelector('[data-ws-teacher], .ws-foot');
            const footParts = foot ? [...foot.children].map(c => c.textContent.trim()) : [];
            const cells = ri.cells.map(c => {
                tagOf(c);
                const slots = [...c.querySelectorAll('[data-ws-slot]')].filter(s => s.getAttribute('data-ws-graded') !== '0');
                const band = c.closest('.ws-band');
                const bandLabel = band ? ((band.querySelector('.ws-strip > b') || {}).textContent || '').trim() : '';
                const model = !!c.querySelector('[data-ws-label="model"]') || /^(traced|answered)$/.test(c.getAttribute('data-ws-state') || '') && !ri.key;
                return {
                    tag: c.id, rect: mmRect(c.getBoundingClientRect(), pr), slots: slots.length,
                    answered: slots.filter(slotAnswered).length, weightOk: slots.every(slotWeightOk),
                    shapes: [...new Set(slots.map(s => s.getAttribute('data-ws-shape')))],
                    item: !model && !ITEM_BANDS.test(bandLabel),
                    // a one-line fact, equation or number track: one short answer (PT 2.9 packs 20)
                    short: !!c.querySelector('.ws-fact, .ws-eq, .mq-hfact, .k2-seqstrip'),
                };
            });
            let role = pg.getAttribute('data-ws-role') || '';
            if (!role) {
                const t3 = tab.length >= 3 ? tab[2] : (tab[tab.length - 1] || '');
                if (bands.some(b => /^(Independent Practice|More Practice)\s*:/i.test(b))) role = 'independent';
                else if (/^Test [AB]\b/.test(t3)) role = 'test';
                else if (/^Review\b/.test(t3)) role = 'review';
                else if (/^True or False/i.test(t3)) role = 'true-false';
                else if (/^Reason It/i.test(t3)) role = 'reason-it';
                else if (/^Stretch/i.test(t3)) role = 'stretch';
            }
            const items = cells.filter(c => c.item);
            const itemShapes = items.flatMap(c => c.shapes);
            const size = pg.getAttribute('data-ws-size') || (['S', 'M', 'L'].find(s => pg.classList.contains('ws-' + s)) || 'L');
            const footRect = foot ? mmRect(foot.getBoundingClientRect(), pr) : null;
            out.pages.push({
                idx: ri.idx + 1, tag: pg.id, key: ri.key, role, size, look: pg.getAttribute('data-ws-look') || '',
                sheet: pg.getAttribute('data-ws-sheet') || '', tab, bands, foot: footParts,
                pageId: (footParts[2] || '').split('·').map(s => s.trim()).filter(s => /^\d\d-[A-Z]\d?$/.test(s))[0] || '',
                w: mm(pr.width), h: mm(pr.height), padB: mm(parseFloat(cs.paddingBottom)), padT: mm(parseFloat(cs.paddingTop)),
                footRect, cells, items: items.length,
                oneSymbol: (itemShapes.length > 0 && itemShapes.every(s => oneSymbolShapes.has(s)))
                    || (/^test\b/.test(role) && items.length > 0 && items.every(c => c.short)),
                slots: cells.reduce((n, c) => n + c.slots, 0), instructions: ri.instructions,
            });
        }
    } else {
        const lg = { roots: [] };
        for (const ri of rootInfo) {
            tagOf(ri.el);
            const cells = ri.cells.map((c, i) => {
                tagOf(c);
                const desc = [...c.querySelectorAll('*')].filter(d => visible(d) && d.getBoundingClientRect().height > 0).map(tagOf);
                const r = c.getBoundingClientRect();
                return { tag: c.id, n: i + 1, hPt: Math.round(r.height * 0.75 * 10) / 10, desc };
            });
            const footer = ri.el.querySelector('.sheet-foot, .worksheet-footer-bar, .worksheet-footer');
            const keyAns = [...ri.el.querySelectorAll('.answer-key-ans, .answer-key-item .v')].map(a => a.textContent.trim());
            const keyItems = ri.el.querySelectorAll('.answer-key-item').length;
            lg.roots.push({
                tag: ri.el.id, key: ri.key, cells,
                footer: footer && visible(footer) ? { tag: tagOf(footer), hPt: Math.round(footer.getBoundingClientRect().height * 0.75 * 10) / 10, text: footer.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) } : null,
                keyItems, keyAns, listKey: !!ri.el.querySelector('.answer-key-grid, ol, ul'),
            });
        }
        out.legacy = lg;
    }
    // hidden links so Chrome writes a named destination for every tagged element (PyMuPDF reads them)
    const holder = document.createElement('div');
    holder.id = 'wsl-anchors';
    holder.style.display = 'none';
    holder.innerHTML = tags.map(t => `<a href="#${t}"></a>`).join('');
    document.body.appendChild(holder);
    return out;
}

// In-page: the @page box the document asks for (size, margins in mm), read from its stylesheets.
function wsPageBox() {
    const toMm = v => {
        if (!v) return null;
        const n = parseFloat(v);
        if (!isFinite(n)) return null;
        if (/mm$/.test(v)) return n; if (/cm$/.test(v)) return n * 10; if (/in$/.test(v)) return n * 25.4;
        if (/pt$/.test(v)) return n * 25.4 / 72; if (/px$/.test(v)) return n * 25.4 / 96; if (n === 0) return 0;
        return null;
    };
    const box = { w: 210, h: 297, t: 0, r: 0, b: 0, l: 0, found: false };
    const SIZES = { a4: [210, 297], letter: [215.9, 279.4], a5: [148, 210], legal: [215.9, 355.6] };
    const visit = rules => {
        for (const rule of rules) {
            if (rule instanceof CSSPageRule) {
                if (rule.selectorText && rule.selectorText.trim() && rule.selectorText.trim() !== ':first') continue;
                const s = rule.style;
                box.found = true;
                const sz = (s.getPropertyValue('size') || '').trim().toLowerCase();
                if (sz) {
                    const named = SIZES[sz.split(/\s+/)[0]];
                    if (named) { [box.w, box.h] = named; if (/landscape/.test(sz)) [box.w, box.h] = [box.h, box.w]; }
                    else { const p = sz.split(/\s+/).map(toMm).filter(v => v !== null); if (p.length) { box.w = p[0]; box.h = p[1] ?? p[0]; } }
                }
                for (const [k, prop] of [['t', 'margin-top'], ['r', 'margin-right'], ['b', 'margin-bottom'], ['l', 'margin-left']]) {
                    const v = toMm(s.getPropertyValue(prop)); if (v !== null) box[k] = v;
                }
            } else if (rule instanceof CSSMediaRule) {
                if (/print|all/.test(rule.media.mediaText) || !rule.media.mediaText) visit(rule.cssRules);
            } else if (rule.cssRules && !(rule instanceof CSSStyleRule)) visit(rule.cssRules);
            else if (rule instanceof CSSImportRule && rule.styleSheet) { try { visit(rule.styleSheet.cssRules); } catch (e) {} }
        }
    };
    for (const sh of document.styleSheets) { try { visit(sh.cssRules); } catch (e) { /* cross-origin */ } }
    return box;
}

// =============================================================================================
// PDF ANALYSER (python3 + PyMuPDF). What actually printed: page count, every text / fill / stroke
// colour, the fonts embedded, italic spans, raster images, opacity, the content extent inside the
// page margins, solid dark regions measured on the raster, and the named destinations the collector
// planted (element id -> page, offset from the top of the page's content box).
// =============================================================================================
const PDF_PY = String.raw`
import sys, json, pymupdf
pdf, cfg = sys.argv[1], json.loads(sys.argv[2])
MM = 72 / 25.4
MT, MB = cfg.get('mt', 0) * MM, cfg.get('mb', 0) * MM
ALLOWED = ((0, 0, 0), (255, 255, 255), (148, 148, 148))
def rgb(c):
    if c is None: return None
    if isinstance(c, int): return ((c >> 16) & 255, (c >> 8) & 255, c & 255)
    c = list(c)
    if len(c) == 1: v = round(c[0] * 255); return (v, v, v)
    if len(c) == 4:
        C, M, Y, K = c
        return tuple(round(255 * (1 - min(1, x + K))) for x in (C, M, Y))
    return tuple(round(x * 255) for x in c[:3])
def allowed(t): return any(all(abs(a - b) <= 2 for a, b in zip(t, c)) for c in ALLOWED)
def hexs(t): return '#%02x%02x%02x' % t
def lum(t): return (0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2]) / 255
def mmr(r): return [round(r.x0 / MM, 1), round(r.y0 / MM, 1), round(r.width / MM, 1), round(r.height / MM, 1)]
def dark_regions(page, r):
    # Solid dark regions inside r, measured on the raster: for each connected dark component, the
    # diameter (mm) of the largest disk that fits in it (chamfer 3-4 distance), its box and how much
    # of the box it fills (a disk fills ~0.79, a square 1.0).
    side = max(r.width, r.height) / MM
    dpi = max(40, min(100, int(400 / max(side, 1) * 25.4)))
    pix = page.get_pixmap(dpi=dpi, clip=r, colorspace=pymupdf.csGRAY, alpha=False)
    w, h, s = pix.width, pix.height, pix.samples
    if w * h == 0: return []
    pxmm = dpi / 25.4
    INF = 1 << 30
    d = [INF if s[i] < 90 else 0 for i in range(w * h)]
    for y in range(h):
        for x in range(w):
            i = y * w + x
            if not d[i]: continue
            d[i] = min(d[i], (d[i - w] + 3) if y else 3, (d[i - 1] + 3) if x else 3,
                       (d[i - w - 1] + 4) if (x and y) else 4, (d[i - w + 1] + 4) if (y and x < w - 1) else 4)
    for y in range(h - 1, -1, -1):
        for x in range(w - 1, -1, -1):
            i = y * w + x
            if not d[i]: continue
            d[i] = min(d[i], (d[i + w] + 3) if y < h - 1 else 3, (d[i + 1] + 3) if x < w - 1 else 3,
                       (d[i + w + 1] + 4) if (x < w - 1 and y < h - 1) else 4, (d[i + w - 1] + 4) if (y < h - 1 and x) else 4)
    need = 7.3 / 2 * pxmm * 3        # only components holding a disk wider than 7.3 mm matter
    seen = bytearray(w * h)
    out = []
    for i0 in range(w * h):
        if d[i0] < need or seen[i0]: continue
        stack = [i0]; seen[i0] = 1
        x0 = x1 = i0 % w; y0 = y1 = i0 // w; n = 0; best = 0
        while stack:
            i = stack.pop(); n += 1
            x, y = i % w, i // w
            if d[i] > best: best = d[i]
            if x < x0: x0 = x
            if x > x1: x1 = x
            if y < y0: y0 = y
            if y > y1: y1 = y
            for j in ((i - 1) if x else -1, (i + 1) if x < w - 1 else -1, (i - w) if y else -1, (i + w) if y < h - 1 else -1):
                if j >= 0 and d[j] and not seen[j]:
                    seen[j] = 1; stack.append(j)
        bw, bh = (x1 - x0 + 1) / pxmm, (y1 - y0 + 1) / pxmm
        box = pymupdf.Rect(r.x0 + x0 / pxmm * MM, r.y0 + y0 / pxmm * MM, r.x0 + (x1 + 1) / pxmm * MM, r.y0 + (y1 + 1) / pxmm * MM)
        out.append({'box': box, 'dia': round(2 * (best / 3.0) / pxmm, 1), 'w': round(bw, 1), 'h': round(bh, 1), 'fill': round(n / ((x1 - x0 + 1) * (y1 - y0 + 1)), 2)})
    return out
doc = pymupdf.open(pdf)
res = {'pages': [], 'dests': {}}
try:
    names = doc.resolve_names()
except Exception:
    names = {}
for name, v in names.items():
    p = v.get('page', -1)
    to = v.get('to')
    if p is None or p < 0 or to is None: continue
    H = doc[p].rect.height
    res['dests'][name] = [p, round(to[0], 2), round(H - to[1], 2)]
for pno, page in enumerate(doc):
    W, H = page.rect.width, page.rect.height
    pg = {'w': round(W / MM, 1), 'h': round(H / MM, 1), 'colours': {}, 'fonts': {}, 'italic': [], 'images': [], 'alpha': 0, 'solid': [], 'top': None, 'bottom': None, 'words': 0, 'chroma': 0, 'illegible': []}
    # The page as it prints, at 72 dpi: colour pixels anywhere (vector, raster, shadow, gradient), and
    # text whose glyphs cannot be told from what is under them (black "100" on a black disk).
    DPI = 72
    pix = page.get_pixmap(dpi=DPI, colorspace=pymupdf.csRGB, alpha=False)
    PW, PH, PS = pix.width, pix.height, pix.samples
    for col, n in pix.color_count(colors=True).items():
        r_, g_, b_ = col[0], col[1], col[2]
        if max(r_, g_, b_) - min(r_, g_, b_) > 40: pg['chroma'] += n
    pg['chroma'] = round(pg['chroma'] * (25.4 / DPI) ** 2, 1)          # mm2 of clearly coloured ink
    def legible(bbox, colour):
        x0, y0 = max(0, int(bbox.x0 * DPI / 72)), max(0, int(bbox.y0 * DPI / 72))
        x1, y1 = min(PW, int(bbox.x1 * DPI / 72 + 0.999)), min(PH, int(bbox.y1 * DPI / 72 + 0.999))
        if x1 - x0 < 2 or y1 - y0 < 2: return True
        tg = 0.2126 * colour[0] + 0.7152 * colour[1] + 0.0722 * colour[2]
        same = tot = 0
        for y in range(y0, y1):
            row = y * PW * 3
            for x in range(x0, x1):
                i = row + x * 3
                g = 0.2126 * PS[i] + 0.7152 * PS[i + 1] + 0.0722 * PS[i + 2]
                tot += 1
                if abs(g - tg) <= 40: same += 1
        return same / tot < 0.96
    def ext(r):
        if r.y1 <= MT + 0.5 or r.y0 >= H - MB - 0.5: return
        pg['top'] = round(r.y0 / MM, 1) if pg['top'] is None else min(pg['top'], round(r.y0 / MM, 1))
        pg['bottom'] = round(r.y1 / MM, 1) if pg['bottom'] is None else max(pg['bottom'], round(r.y1 / MM, 1))
    def bad(kind, t, sample, r):
        k = kind + ' ' + hexs(t)
        e = pg['colours'].setdefault(k, {'kind': kind, 'hex': hexs(t), 'n': 0, 'sample': sample, 'at': mmr(r), 'margin': r.y0 >= H - MB - 0.5 or r.y1 <= MT + 0.5})
        e['n'] += 1
    for b in page.get_text('dict')['blocks']:
        if b.get('type') == 1:
            pg['images'].append(mmr(pymupdf.Rect(b['bbox']))); continue
        for l in b.get('lines', []):
            for sp in l['spans']:
                t = sp['text'].strip()
                if not t: continue
                r = pymupdf.Rect(sp['bbox'])
                c = rgb(sp['color'])
                if not allowed(c): bad('text', c, t[:30], r)
                f = sp['font']
                if 'andika' not in f.lower() and not f.startswith('Type3'):   # Type3 = glyphs Chrome drew as paths (stroked text): no name to check
                    e = pg['fonts'].setdefault(f, {'n': 0, 'sample': t[:30], 'margin': r.y0 >= H - MB - 0.5 or r.y1 <= MT + 0.5}); e['n'] += 1
                if sp['flags'] & 2: pg['italic'].append(t[:30])
                pg['words'] += len(t.split())
                ext(r)
                if not legible(r, c): pg['illegible'].append({'text': t[:20], 'hex': hexs(c), 'at': mmr(r)})
    cands = []
    for dr in page.get_drawings():
        r = dr['rect']
        if r.width <= 0 and r.height <= 0: continue
        f = rgb(dr.get('fill')); s = rgb(dr.get('color'))
        if f is not None:
            fo = dr.get('fill_opacity')
            if fo is not None and fo < 0.995: pg['alpha'] += 1
            if not allowed(f): bad('fill', f, dr.get('type'), r)
            if f != (255, 255, 255): ext(r)
            if lum(f) < 0.35 and r.width > 7.3 * MM and r.height > 7.3 * MM: cands.append(r)
        if s is not None and (dr.get('width') or 0) > 0:
            so = dr.get('stroke_opacity')
            if so is not None and so < 0.995: pg['alpha'] += 1
            if not allowed(s): bad('stroke', s, dr.get('type'), r)
            if s != (255, 255, 255): ext(r)
    for im in page.get_image_info():
        r = pymupdf.Rect(im['bbox'])
        if r.width > 0.5 and r.height > 0.5: pg['images'].append(mmr(r))
        if r.width > 7.3 * MM and r.height > 7.3 * MM: cands.append(r)     # a rasterised box (shadow, filter) is measured too
    spans = [pymupdf.Rect(sp['bbox']) for b in page.get_text('dict')['blocks'] if b.get('type') == 0 for l in b['lines'] for sp in l['spans'] if sp['text'].strip()]
    done, found = [], []
    for r in sorted(cands, key=lambda q: -q.width * q.height):
        if any(q.contains(r) for q in done): continue
        done.append(r)
        for c in dark_regions(page, r):
            if c['dia'] <= 7.3 or any(abs(f['box'].x0 - c['box'].x0) < 1 and abs(f['box'].y0 - c['box'].y0) < 1 for f in found): continue
            found.append(c)
            text = any(c['box'].contains(pymupdf.Point((sp.x0 + sp.x1) / 2, (sp.y0 + sp.y1) / 2)) for sp in spans)
            # RP-11 / RP-20 / 11.2: a bare round counter up to 12 mm is a compliant solid fill
            if 0.7 < c['fill'] < 0.86 and abs(c['w'] - c['h']) < 1.2 and max(c['w'], c['h']) <= 12.8 and not text: continue
            pg['solid'].append({'at': mmr(c['box']), 'inscribed': c['dia'], 'text': text})
    res['pages'].append(pg)
print(json.dumps(res))
`;

function analysePdf(pdfPath, box) {
    const out = execFileSync('python3', ['-c', PDF_PY, pdfPath, JSON.stringify({ mt: box.t || 0, mb: box.b || 0 })], { encoding: 'utf8', maxBuffer: 64 << 20 });
    return JSON.parse(out.trim().split('\n').pop());
}

// =============================================================================================
// NODE SIDE: lint one printed document (DOM collector + PDF)
// =============================================================================================
let TMP = null;
process.on('exit', () => { if (TMP) try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* best effort */ } });
function tmpFile(name) {
    if (!TMP) TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-print-lint-'));
    return path.join(TMP, name);
}

async function lintDocument(page, { id, mode, printBackground = false, notes = [] }) {
    await page.emulateMediaType('print');
    await page.evaluate(() => document.fonts && document.fonts.ready);
    const box = await page.evaluate(wsPageBox);
    const contentW = box.w - box.l - box.r;
    const contentH = box.h - box.t - box.b;
    // Lay the document out at the width Chrome prints it at: the page's content box.
    await page.setViewport({ width: Math.round((mode === 'legacy' ? contentW : Math.max(box.w, 210)) * PX_PER_MM), height: 1400, deviceScaleFactor: 1 });
    await sleep(120);
    await page.evaluate(() => document.fonts && document.fonts.ready);
    const dom = await page.evaluate(wsLintPage, { mode, printBackground, contentWidthPx: contentW * PX_PER_MM });
    const pdfPath = tmpFile(`${id.replace(/[^\w.-]+/g, '_')}.pdf`);
    await page.pdf({ path: pdfPath, format: 'A4', printBackground, preferCSSPageSize: true });
    const pdf = analysePdf(pdfPath, box);
    fs.unlinkSync(pdfPath);
    const findings = dom.findings.map(f => ({ ...f }));
    const F = (lint, rule, sev, loc, msg, key) => findings.push({ lint, rule, sev, msg, key: key || msg, ...loc });
    const dest = t => pdf.dests[t] || null;
    const info = { id, mode, printedPages: pdf.pages.length, box, notes: [...notes] };

    // ---- legacy: printed page of every tagged element
    if (mode === 'legacy') {
        for (const f of findings) if (f.tag) { const d = dest(f.tag); if (d) f.page = d[0] + 1; }
    }
    // ---- L-FONT (document + PDF)
    if (!dom.fontsLoaded || !dom.andikaLoaded) F('L-FONT', 'TY-3', 'critical', {}, `Andika is not loaded (document.fonts.check 400/700 = ${dom.fontsLoaded}; faces: ${dom.andikaFaces.join(', ') || 'none'}): the sheet prints in a fallback face (TY-3)`, 'andika not loaded');
    for (const g of dom.google) F('L-FONT', 'TY-3', 'minor', {}, `the document links Google Fonts (${g}): Andika is self-hosted and Google is never a source (TY-3)`, 'google fonts');
    pdf.pages.forEach((p, i) => {
        for (const [font, e] of Object.entries(p.fonts)) F('L-FONT', 'TY-1', 'major', { page: i + 1 }, `printed page ${i + 1}: ${e.n} text run(s) embedded in "${font}", not Andika (e.g. "${e.sample}")${e.margin ? ' - in the page margin box' : ''} (TY-1, TY-3)`, `pdf font ${font}`);
        if (p.italic.length) F('L-FONT', 'TY-2', 'major', { page: i + 1 }, `printed page ${i + 1}: ${p.italic.length} italic run(s), e.g. "${p.italic[0]}" (TY-2)`, 'pdf italic');
    });
    // ---- L-INK on the printed PDF: colours the DOM check did not already name, raster, solid black
    const domHex = new Set(findings.filter(f => f.lint === 'L-INK').map(f => (f.msg.match(/#[0-9a-f]{6}/) || [])[0]).filter(Boolean));
    const pagesWith = rule => new Set(findings.filter(f => f.rule === rule).map(f => f.page).filter(Boolean));
    const domInk5Pages = pagesWith('INK-5'), domIllegiblePages = pagesWith('ILLEGIBLE');
    const domColourPages = new Set(findings.filter(f => f.rule === 'INK-1' && !/background.*Background graphics/.test(f.msg)).map(f => f.page).filter(Boolean));
    pdf.pages.forEach((p, i) => {
        for (const e of Object.values(p.colours)) {
            if (domHex.has(e.hex) && !e.margin) continue;
            F('L-INK', 'INK-1', 'major', { page: i + 1 }, `printed page ${i + 1}: ${e.n} ${e.kind} paint(s) in ${e.hex}${e.kind === 'text' ? ` (e.g. "${e.sample}")` : ''}${e.margin ? ' in the @page margin box' : ` at ${e.at[0]}, ${e.at[1]} mm`} - only #000, #fff and #949494 print (INK-1${e.kind === 'text' ? ', INK-3' : ''})`, `pdf ${e.kind} ${e.hex}`);
        }
        if (p.illegible.length && !domIllegiblePages.has(i + 1)) {
            const e = p.illegible[0];
            F('L-INK', 'ILLEGIBLE', 'critical', { page: i + 1 }, `ILLEGIBLE on printed page ${i + 1}: ${p.illegible.length} text run(s) printed in the colour of what lies under them (first "${e.text}" in ${e.hex} at ${e.at[0]}, ${e.at[1]} mm) - the pupil cannot read them (INK-5, AX-1)`, 'pdf illegible');
        }
        if (p.chroma > 1 && !domColourPages.has(i + 1) && !Object.keys(p.colours).length) F('L-INK', 'INK-1', 'major', { page: i + 1 }, `printed page ${i + 1}: ${p.chroma} mm2 of coloured ink on the rendered page (raster or effect colour the vector check cannot name) (INK-1)`, 'pdf colour pixels');
        if (p.images.length) F('L-INK', 'INK-7', 'major', { page: i + 1 }, `printed page ${i + 1}: ${p.images.length} raster image(s) (first ${p.images[0][2]} x ${p.images[0][3]} mm at ${p.images[0][0]}, ${p.images[0][1]} mm) - a shadow, filter or bitmap was rasterised onto the sheet (INK-2, INK-7)`, 'pdf raster');
        if (p.alpha) F('L-INK', 'INK-2', 'major', { page: i + 1 }, `printed page ${i + 1}: ${p.alpha} paint(s) with opacity below 1 (INK-2)`, 'pdf alpha');
        if (p.solid.length && !domInk5Pages.has(i + 1)) {
            const s = p.solid[0];
            F('L-INK', 'INK-5', 'major', { page: i + 1 }, `printed page ${i + 1}: ${p.solid.length} solid black region(s) over 7 mm (first ${s.at[2]} x ${s.at[3]} mm at ${s.at[0]}, ${s.at[1]} mm; a ${s.inscribed} mm disk fits inside${s.text ? '; text printed on it' : ''}): solid black only where the smaller side is <= 7 mm (INK-5)`, 'pdf solid black');
        }
    });

    // ---- pages, parts, split, density, key
    if (mode !== 'legacy') lintKitGeometry(dom, pdf, info, F);
    else lintLegacyGeometry(dom, pdf, info, F, contentH);

    // location & de-duplication
    for (const f of findings) { delete f.tag; }
    return { info, findings, dom, pdf };
}

// ---- kit / pack pages: every [data-ws-page] / .ws-page is one printed A4 sheet
function lintKitGeometry(dom, pdf, info, F) {
    const pages = dom.pages;
    info.pages = pages.length;
    info.keyPages = pages.filter(p => p.key).length;
    if (!pages.length) { F('L-SPLIT', 'PG-21', 'critical', {}, 'no sheet page found ([data-ws-page] / .ws-page)', 'no pages'); return; }
    // one sheet page = one printed page
    if (pdf.pages.length !== pages.length) F('L-SPLIT', 'PG-21', 'critical', {}, `${pages.length} sheet page(s) printed on ${pdf.pages.length} A4 page(s): a sheet page spills onto another sheet`, 'page count');
    for (const p of pages) {
        const d = pdf.dests[p.tag];
        if (d && d[0] !== p.idx - 1) F('L-SPLIT', 'PG-21', 'critical', { page: p.idx }, `sheet page ${p.idx} starts on printed page ${d[0] + 1}`, 'page shifted');
        if (p.h > 297.5 || p.w > 210.5) F('L-SPLIT', 'PG-21', 'critical', { page: p.idx }, `page box ${p.w} x ${p.h} mm is larger than A4 (210 x 297 mm): its lower part prints on the next sheet`, 'page too big');
        for (const [k, c] of p.cells.entries()) {
            const cd = pdf.dests[c.tag];
            const bottom = c.rect[1] + c.rect[3];
            if ((cd && d && cd[0] !== d[0]) || bottom > 297 + 0.3) F('L-SPLIT', 'PG-21', 'critical', { page: p.idx, cell: k + 1 }, `cell ${k + 1} (${c.rect[2]} x ${c.rect[3]} mm at y ${c.rect[1]} mm) crosses the edge of the A4 sheet and is split across printed pages (PG-21)`, 'split cell');
        }
        if (p.footRect) {
            const liveBottom = p.h - p.padB;
            const gap = liveBottom - (p.footRect[1] + p.footRect[3]);
            if (gap > 2) F('L-SPLIT', 'HD-30', 'major', { page: p.idx }, `teacher footer ends ${Math.round(gap * 10) / 10} mm above the foot of the live area: the footer sits at the page foot, never mid-page (HD-30, PG-3)`, 'footer mid-page');
        }
    }
    // parts: pages that make up one handed-out sheet
    const parts = [];
    const sheetIds = pages.map(p => p.sheet);
    if (info.mode === 'kit' || sheetIds.some(Boolean)) {
        const groups = new Map();
        for (const p of pages) { const k = (p.sheet || 'sheet') + (p.key ? '#key' : ''); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(p); }
        for (const [k, ps] of groups) parts.push({ key: /#key$/.test(k), pages: ps });
    } else {
        // pack: a run of consecutive pages whose footers read 1/N .. N/N is one sheet; otherwise each page stands alone
        let i = 0;
        while (i < pages.length) {
            const m = String(pages[i].foot[1] || '').match(/^1\/(\d+)$/);
            const n = m ? +m[1] : 1;
            const run = pages.slice(i, i + n);
            if (n > 1 && run.length === n && run.every((p, j) => String(p.foot[1] || '') === `${j + 1}/${n}`)) { parts.push({ key: run[0].key, pages: run }); i += n; }
            else { parts.push({ key: pages[i].key, pages: [pages[i]] }); i++; }
        }
    }
    info.parts = parts.map(pt => ({ key: pt.key, pages: pt.pages.map(p => p.idx) }));
    // density. Pages are compared with each other only inside one section: every page of a kit sheet,
    // or a pack run whose pages all share one role (a lesson packet mixes opener, decision and
    // independent pages, whose item counts are not comparable).
    for (const pt of parts) {
        const max = Math.max(...pt.pages.map(p => p.items));
        const comparable = info.mode === 'kit' || pt.pages.every(p => p.role === pt.pages[0].role && p.items > 0);
        pt.pages.forEach((p, j) => {
            const c = ceilingFor(p.role, p.size, p.oneSymbol);
            if (c && p.items > c.n) F('L-DENSITY', 'DN-1', 'major', { page: p.idx }, `page ${p.idx} holds ${p.items} items; the ${c.name} ceiling at size ${p.size} is ${c.n} (section 12.1)`, `over ceiling ${p.role}`);
            if (p.role && !c) info.notes.push(`page ${p.idx}: role "${p.role}" has no ceiling in this gate`);
            const last = j === pt.pages.length - 1;
            if (comparable && !last && max > 0 && p.items < max / 2) F('L-DENSITY', 'DN-2', 'major', { page: p.idx }, `page ${p.idx} holds ${p.items} item(s) while page ${pt.pages[pt.pages.length - 1].idx} of the same sheet follows and its fullest page holds ${max}: a page is never less than half used (PG-20, PG-23)`, 'half-empty page');
            if (comparable && last && pt.pages.length > 1 && max > 0 && p.items > 0 && p.items < max / 3) F('L-DENSITY', 'PG-23', 'major', { page: p.idx }, `last page ${p.idx} holds ${p.items} item(s), under a third of a full page (${max}): rows are rebalanced across the sheet's pages (PG-23)`, 'short last page');
        });
    }
    // key
    const pupilParts = parts.filter(p => !p.key), keyParts = parts.filter(p => p.key);
    if (info.mode === 'kit') {
        if (!keyParts.length) F('L-KEY', 'AK-1', 'critical', {}, 'no answer key pages: every generated page has a facsimile key (AK-1)', 'no key');
        const pupil = pages.filter(p => !p.key), key = pages.filter(p => p.key);
        if (key.length && key.length !== pupil.length) F('L-KEY', 'AK-4', 'critical', {}, `the key has ${key.length} page(s), the pupil sheet ${pupil.length}: the key is the same pages (AK-1, AK-4)`, 'key page count');
        key.forEach((k, i) => pupil[i] && compareKey(pupil[i], k, F));
    } else {
        for (const pt of keyParts) for (const k of pt.pages) {
            // pack: the pupil twin is the page with the same cell geometry
            const cands = pages.filter(p => !p.key && p.cells.length === k.cells.length);
            let best = null, bestDev = Infinity;
            for (const c of cands) { const dev = maxDev(c, k); if (dev < bestDev) { bestDev = dev; best = c; } }
            if (!best) F('L-KEY', 'AK-1', 'critical', { page: k.idx }, `key page ${k.idx} has ${k.cells.length} cells and no pupil page in the document has the same cells: a key is a facsimile, not a list (AK-1)`, 'key without twin');
            else compareKey(best, k, F);
        }
    }
    for (const p of pages.filter(q => q.key)) {
        const empty = p.cells.reduce((n, c) => n + (c.slots - c.answered), 0);
        if (empty > 0) F('L-KEY', 'AK-2', 'critical', { page: p.idx }, `key page ${p.idx}: ${empty} of ${p.slots} answer slot(s) carry no answer (AK-2, AK-4)`, 'unanswered slot');
        if (p.cells.some(c => !c.weightOk)) F('L-KEY', 'AK-2', 'minor', { page: p.idx }, `key page ${p.idx}: answers not in weight 700 (AK-2)`, 'key weight');
    }
}
function maxDev(a, b) {
    let dev = 0;
    a.cells.forEach((c, i) => { const d = b.cells[i]; if (!d) { dev = Infinity; return; } for (let k = 0; k < 4; k++) dev = Math.max(dev, Math.abs(c.rect[k] - d.rect[k])); });
    return dev;
}
function compareKey(pupil, key, F) {
    if (key.cells.length === 0 && pupil.cells.length) { F('L-KEY', 'AK-1', 'critical', { page: key.idx }, `key page ${key.idx} is a list: 0 cells against ${pupil.cells.length} on pupil page ${pupil.idx} (AK-1: the key is a facsimile)`, 'list key'); return; }
    if (key.cells.length !== pupil.cells.length) { F('L-KEY', 'AK-1', 'critical', { page: key.idx }, `key page ${key.idx} has ${key.cells.length} cells, pupil page ${pupil.idx} has ${pupil.cells.length} (AK-1, AK-4)`, 'key cell count'); return; }
    const dev = maxDev(pupil, key);
    if (dev > 0.5) F('L-KEY', 'AK-1', 'critical', { page: key.idx }, `key page ${key.idx} cells differ from pupil page ${pupil.idx} by up to ${Math.round(dev * 10) / 10} mm (a facsimile matches within 0.5 mm, AK-1)`, 'key geometry');
    if (key.slots !== pupil.slots) F('L-KEY', 'AK-4', 'critical', { page: key.idx }, `key page ${key.idx} has ${key.slots} answer slots, pupil page ${pupil.idx} has ${pupil.slots} (AK-4)`, 'key slot count');
}

// ---- legacy: printed pages recovered from the PDF's named destinations
function lintLegacyGeometry(dom, pdf, info, F, contentH) {
    const hPt = contentH * 72 / 25.4;
    const lg = dom.legacy;
    const pupil = lg.roots.filter(r => !r.key), key = lg.roots.filter(r => r.key);
    const pageOf = t => (pdf.dests[t] ? pdf.dests[t][0] + 1 : null);
    const pagesOfRoot = r => {
        const ps = new Set();
        const add = t => { const p = pageOf(t); if (p) ps.add(p); };
        add(r.tag);
        for (const c of r.cells) { add(c.tag); c.desc.forEach(add); }
        if (r.footer) add(r.footer.tag);
        return [...ps].sort((a, b) => a - b);
    };
    const pupilPages = [...new Set(pupil.flatMap(pagesOfRoot))].sort((a, b) => a - b);
    const keyPages = [...new Set(key.flatMap(r => { const ps = pagesOfRoot(r); const s = pageOf(r.tag); if (s) { for (let p = s; p <= pdf.pages.length; p++) ps.push(p); } return ps; }))].sort((a, b) => a - b);
    info.pages = pupilPages.length;
    info.keyPages = keyPages.length;
    const cellsTotal = pupil.reduce((n, r) => n + r.cells.length, 0);
    // L-SPLIT: a cell is on one printed page, and fits on it
    for (const r of pupil) for (const c of r.cells) {
        const ps = new Set([c.tag, ...c.desc].map(pageOf).filter(Boolean));
        const d = pdf.dests[c.tag];
        const tooTall = d && d[2] + c.hPt > hPt + 1.5;
        if (ps.size > 1 || tooTall) F('L-SPLIT', 'PG-21', 'critical', { page: d ? d[0] + 1 : null, cell: c.n }, `item ${c.n} is split across printed pages ${ps.size > 1 ? [...ps].sort().join(' and ') : `${d[0] + 1} and ${d[0] + 2}`} (${Math.round(c.hPt / 72 * 25.4)} mm tall, starting ${Math.round(d[2] / 72 * 25.4)} mm down a ${Math.round(contentH)} mm page) (PG-21)`, 'split cell');
        if (c.hPt > hPt) F('L-SPLIT', 'PG-20', 'critical', { cell: c.n }, `item ${c.n} is ${Math.round(c.hPt / 72 * 25.4)} mm tall, taller than the ${Math.round(contentH)} mm page (PG-20)`, 'cell taller than page');
    }
    // the footer / date line belongs at the foot of the page
    for (const r of lg.roots) if (r.footer) {
        const d = pdf.dests[r.footer.tag];
        if (!d) continue;
        const gapMm = (hPt - (d[2] + r.footer.hPt)) / 72 * 25.4;
        if (gapMm > 15) F('L-SPLIT', 'HD-30', 'major', { page: d[0] + 1 }, `footer "${r.footer.text}" ends ${Math.round(gapMm)} mm above the foot of printed page ${d[0] + 1}: a footer or date line in mid-page reads as the end of the work (HD-30, PG-3)`, 'footer mid-page');
    }
    // L-DENSITY: items per printed page against the Independent ceiling; half-empty pages
    const keyAns = key.flatMap(r => r.keyAns);
    const oneSymbol = keyAns.length > 0 && keyAns.every(a => a.replace(/\s+/g, '').length <= 1);
    const ceil = ceilingFor('independent', 'L', oneSymbol);
    info.notes.push(`legacy sheet read as role independent (${ceil.name}), ceiling ${ceil.n} per page`);
    const perPage = new Map(pupilPages.map(p => [p, 0]));
    for (const r of pupil) for (const c of r.cells) { const p = pageOf(c.tag); if (p) perPage.set(p, (perPage.get(p) || 0) + 1); }
    info.itemsPerPage = pupilPages.map(p => perPage.get(p) || 0);
    const max = Math.max(0, ...info.itemsPerPage);
    pupilPages.forEach((p, j) => {
        const n = perPage.get(p) || 0;
        if (n > ceil.n) F('L-DENSITY', 'DN-1', 'major', { page: p }, `printed page ${p} holds ${n} items; the ${ceil.name} ceiling is ${ceil.n} (section 12.1; the legacy dialog packs 20 per section)`, 'over ceiling');
        const last = j === pupilPages.length - 1;
        const pg = pdf.pages[p - 1];
        const used = pg && pg.bottom != null ? (pg.bottom - info.box.t) / (contentH) : 0;
        if (!last && (used < 0.5 || (max > 0 && n < max / 2))) F('L-DENSITY', 'DN-2', 'major', { page: p }, `printed page ${p} is ${Math.round(used * 100)}% used and holds ${n} item(s) (fullest page ${max}) while page ${pupilPages[pupilPages.length - 1]} follows: a page is never less than half used (PG-20)`, 'half-empty page');
        if (last && pupilPages.length > 1 && n > 0 && n < max / 3) F('L-DENSITY', 'PG-23', 'major', { page: p }, `last printed page ${p} holds ${n} item(s), under a third of a full page (${max}): not rebalanced (PG-23)`, 'short last page');
    });
    // L-KEY: a facsimile, not a list
    if (!key.length) F('L-KEY', 'AK-1', 'critical', {}, 'no answer key: every page prints an answer key (AK-1)', 'no key');
    for (const r of key) {
        const kc = r.cells.length;
        if (kc === 0 && cellsTotal) F('L-KEY', 'AK-1', 'critical', { page: pageOf(r.tag) }, `the answer key is a list (${r.keyItems} numbered answers${r.listKey ? ' in .answer-key-grid' : ''}), not a facsimile: 0 cells against ${cellsTotal} on the pupil sheet; a teacher marks by laying the key beside the sheet (AK-1)`, 'list key');
        else if (kc !== cellsTotal) F('L-KEY', 'AK-4', 'critical', { page: pageOf(r.tag) }, `the key has ${kc} cells, the pupil sheet ${cellsTotal} (AK-4)`, 'key cell count');
    }
    if (key.length && keyPages.length !== pupilPages.length) F('L-KEY', 'AK-4', 'critical', {}, `the key prints on ${keyPages.length} page(s), the pupil sheet on ${pupilPages.length}: the key is the same pages (AK-1, AK-4)`, 'key page count');
}

// =============================================================================================
// SOURCES
// =============================================================================================
const PACK_DIR = path.join(ROOT, 'design', 'mockups');

async function buildPackHtml(only) {
    const outDir = path.join(PACK_DIR, 'out');
    fs.mkdirSync(outDir, { recursive: true });
    const files = fs.readdirSync(path.join(PACK_DIR, 'pages')).filter(f => f.endsWith('.mjs') && (!only.length || only.some(o => f.startsWith(o)))).sort();
    const built = [];
    for (const f of files) {
        const name = f.replace(/\.mjs$/, '');
        const mod = await import(pathToFileURL(path.join(PACK_DIR, 'pages', f)).href);
        fs.writeFileSync(path.join(outDir, `${name}.html`), mod.default);
        built.push(name);
    }
    return built;
}

async function launchBare() {
    const { server, base } = await startServer();
    const browser = await puppeteer.launch({ headless: true, executablePath: chromePath(), args: ['--no-sandbox', '--font-render-hinting=none'] });
    return { browser, base, close: async () => { await browser.close(); await new Promise(r => server.close(r)); } };
}

async function runPack(only) {
    const names = (await buildPackHtml(only)).filter(n => !PACK_NOT_SHEETS.includes(n));
    const env = await launchBare();
    const results = [];
    try {
        for (const name of names) {
            const page = await env.browser.newPage();
            const errors = [];
            page.on('pageerror', e => errors.push(e.message));
            page.on('requestfailed', r => errors.push(`request failed ${r.url()}`));
            await page.setViewport({ width: 794, height: 1100, deviceScaleFactor: 1 });
            await page.goto(`${env.base}/design/mockups/out/${name}.html`, { waitUntil: 'networkidle0' });
            const r = await lintDocument(page, { id: name, mode: 'pack' });
            applyPackWaivers(name, r);
            if (errors.length) r.findings.push({ lint: 'L-FONT', rule: 'TY-3', sev: 'major', msg: `page errors: ${errors.slice(0, 3).join(' | ')}`, key: 'page errors' });
            results.push(r);
            await page.close();
            process.stdout.write(`  ${name}: ${r.info.pages} pages, ${r.findings.filter(f => !f.waived).length} finding(s)\n`);
        }
    } finally { await env.close(); }
    return results;
}
function applyPackWaivers(file, r) {
    for (const f of r.findings) {
        const pg = f.page ? r.dom.pages[f.page - 1] : null;
        const w = PACK_WAIVERS.find(w => w.file === file && w.lint === f.lint && w.rule === f.rule && pg && (pg.pageId === w.page || `${file}:${pg.idx}` === w.page));
        if (w) { f.waived = w.reason; }
    }
}

function selectSkills(all) {
    const ONLY = (arg('skills', '') || '').split(',').map(s => s.trim()).filter(Boolean);
    const FAMILY = arg('family', ONLY.length ? null : 'redone');
    let skills = all.filter(s => !/^_?tomb|retired/i.test(s.skillId) && !/\(retired\)/i.test(s.label || ''));
    if (FAMILY) {
        if (!FAMILIES[FAMILY]) throw new Error(`unknown --family ${FAMILY} (${Object.keys(FAMILIES).join(', ')})`);
        skills = skills.filter(s => FAMILIES[FAMILY].includes(s.categoryId));
    }
    if (ONLY.length) {
        const missing = ONLY.filter(o => !skills.some(s => `${s.categoryId}:${s.skillId}` === o || s.skillId === o));
        if (missing.length) throw new Error(`no such skill: ${missing.join(', ')}`);
        skills = skills.filter(s => ONLY.includes(`${s.categoryId}:${s.skillId}`) || ONLY.includes(s.skillId));
        skills.sort((a, b) => ONLY.findIndex(o => o === `${a.categoryId}:${a.skillId}` || o === a.skillId) - ONLY.findIndex(o => o === `${b.categoryId}:${b.skillId}` || o === b.skillId));
    }
    return skills;
}

// The legacy print path, many sections in one sheet (what a teacher builds from several skills).
async function renderLegacySections(page, skills, perSection) {
    await page.evaluate(() => { const el = document.getElementById('printPreviewContent'); if (el) el.replaceChildren(); });
    const err = await page.evaluate(async ({ skills, perSection }) => {
        try {
            const sections = skills.map(skill => {
                const dom = window.DOMAINS[window.getDomainByCategory(skill.categoryId)];
                const cat = dom && dom.categories ? dom.categories.find(c => c.id === skill.categoryId) : null;
                return {
                    label: skill.label, columns: 0, problemCount: perSection, countMode: 'problems', pageCount: 1, groupByType: false,
                    skills: [{ categoryId: skill.categoryId, skillId: skill.skillId, skillLabel: skill.label, categoryIcon: '', categoryName: cat ? cat.name : skill.categoryId, domainColor: '#000', percent: 100, weight: 100 }],
                };
            });
            await window.generateWorksheetFromSections(sections, 1, 'Math Practice Worksheet', 'color', true, false, true);
            return null;
        } catch (e) { return e.message || String(e); }
    }, { skills, perSection });
    if (err) throw new Error(`print render failed: ${err}`);
    await waitFor(page, () => { const el = document.getElementById('printPreviewContent'); return el && el.innerHTML.length > 200 && !/Generating worksheet/.test(el.innerHTML); }, 30000, 'print preview');
    await hideOverlays(page, { keepPreview: true });
}

// The preview's Download-PDF document (downloadPDF builds it into #pdfPrintFrame; print is stubbed).
async function legacyDocumentHtml(page) {
    return page.evaluate(async () => {
        let f = document.getElementById('pdfPrintFrame');
        if (!f) { f = document.createElement('iframe'); f.id = 'pdfPrintFrame'; f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'; document.body.appendChild(f); }
        f.contentWindow.print = () => {};
        f.contentWindow.focus = () => {};
        await window.downloadPDF();
        return '<!doctype html>' + f.contentDocument.documentElement.outerHTML;
    });
}

async function lintHtmlInSheetPage(app, html, id, mode) {
    const SAVE = arg('save-html', null);
    if (SAVE) { fs.mkdirSync(path.resolve(process.cwd(), SAVE), { recursive: true }); fs.writeFileSync(path.resolve(process.cwd(), SAVE, id.replace(/[^\w.-]+/g, '_') + '.html'), html); }
    const sheet = await app.page.browser().newPage();
    const failed = [];
    sheet.on('requestfailed', r => { if (/stylesheet|font/.test(r.resourceType()) && !/fonts\.(googleapis|gstatic)\.com/.test(r.url())) failed.push(r.url()); });
    sheet.on('response', r => { if (r.status() >= 400 && /stylesheet|font/.test(r.request().resourceType())) failed.push(`${r.status()} ${r.url()}`); });
    try {
        await sheet.setViewport({ width: 794, height: 1100, deviceScaleFactor: 1 });
        await sheet.goto(app.page.url(), { waitUntil: 'domcontentloaded' });   // same origin: relative assets resolve
        failed.length = 0;
        await sheet.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
        // a sheet linted without its own stylesheets or fonts measures nothing real
        if (failed.length) throw new Error(`the document's stylesheet / font requests failed: ${failed.slice(0, 3).join(', ')}`);
        const res = await lintDocument(sheet, { id, mode });
        if (mode === 'kit' && arg('supports', null)) {
            const sr = await sheet.evaluate(supportCheckInPage);
            res.findings.push(...sr.findings);
            res.info.supported = sr.supported;
        }
        return res;
    } finally { await sheet.close(); }
}

async function runApp(source) {
    const app = await open({ seed: 1 });
    const results = [];
    try {
        const { page } = app;
        await page.evaluate(() => { try { window.setUserRole('teacher'); } catch (e) {} });
        const skills = selectSkills(await listSkills(page));
        if (!skills.length) throw new Error('no skills selected');
        if (source === 'kit') {
            const ok = await page.evaluate(() => typeof window.buildSheet === 'function' && typeof window.sheetDocument === 'function');
            if (!ok) throw new Error('--source kit needs window.buildSheet(req) and window.sheetDocument(html, title) (js/modules/print-sheet.js), and this tree does not put them on window. Lint the legacy print path with --source legacy, or run on a tree that has the kit renderer.');
        }
        const COUNT = parseInt(arg('count', '20'), 10);
        console.log(`${TOOL}: source ${source}, ${skills.length} skill(s)${source === 'legacy' ? `, ${COUNT} items per section` : ''}`);
        // --roles (kit only): every page role buildSheet composes, per skill. A role the skill
        // cannot take (a fact layout for a non-fact skill) is reported as n/a, not linted.
        const kitRoles = source === 'kit' ? (arg('roles', 'independent') || 'independent').split(',').map(r => r.trim()).filter(Boolean) : [null];
        for (const s of skills) for (const role of kitRoles) {
            const id = `${s.categoryId}:${s.skillId}${role && role !== 'independent' ? '#' + role : ''}`;
            const seed = hash(`${s.categoryId}__${s.skillId}:print`);
            let r;
            let kitHalves = null;
            try {
                await page.evaluate(sd => { if (window.__wsReseed) window.__wsReseed(sd); }, seed);
                let html;
                if (source === 'legacy') {
                    await renderPrint(page, s, { problemCount: COUNT, includeAnswerKey: true });
                    html = await legacyDocumentHtml(page);
                } else {
                    html = await page.evaluate(async ({ s, seed, COUNT, role, ANCHORS, SUPPORTS, COVER, MIX }) => {
                        // js/modules/print-sheet.js buildSheet(req): sections carry the skills; the result has
                        // pupilHtml and keyHtml (the facsimile key, same plan).
                        const practice = role === 'independent' || role === 'more-practice';
                        // S2: --supports ticks the skill's supports (all = every render-time value offered).
                        let opts;
                        if (SUPPORTS) {
                            const def = window.offeredOptionsFor(s.categoryId, s.skillId).find((d) => d.id === 'support' && d.supportsModel);
                            if (def) {
                                const want = SUPPORTS === 'all' ? def.render : SUPPORTS.split(',').filter((v) => def.render.includes(v));
                                opts = { support: [...new Set([...(def.default || []), ...want])] };
                            }
                        }
                        const req = { role, sections: [{ skills: [{ categoryId: s.categoryId, skillId: s.skillId, opts }], count: practice ? COUNT : undefined }], size: 'L', look: practice ? 'ican' : 'auto', key: true, seed, anchors: ANCHORS, coverage: COVER || undefined, mix: MIX || undefined };
                        let out;
                        try { out = await window.buildSheet(req); } catch (e) { if (e && e.unsupported) return { unsupported: e.message }; throw e; }
                        const body = [out.pupilHtml, out.keyHtml].filter(Boolean).join('\n');
                        return { doc: window.sheetDocument(body, s.label), pupilHtml: out.pupilHtml, keyHtml: out.keyHtml };
                    }, { s, seed, COUNT: parseInt(arg('count', '6'), 10), role, ANCHORS: arg('anchors', 'off'), SUPPORTS: arg('supports', null), COVER: arg('cover', null), MIX: arg('mix', null) });
                    if (html && html.doc) { kitHalves = html; html = html.doc; }
                }
                if (html && html.unsupported) {
                    process.stdout.write(`  ${id}: n/a (${html.unsupported})\n`);
                    continue;
                }
                r = await lintHtmlInSheetPage(app, html, id, source === 'legacy' ? 'legacy' : 'kit');
                if (kitHalves) r.findings.push(...anchorFindings(kitHalves.pupilHtml, kitHalves.keyHtml));
            } catch (e) {
                r = { info: { id, mode: source, error: e.message }, findings: [{ lint: 'L-SPLIT', rule: 'RENDER', sev: 'critical', msg: `the sheet did not render: ${e.message}`, key: 'render error' }] };
            }
            r.info.label = s.label + (role && role !== 'independent' ? ` (${role})` : '');
            results.push(r);
            process.stdout.write(`  ${id}: ${r.info.pages ?? '?'}+${r.info.keyPages ?? '?'} pages, ${r.findings.length} finding(s)\n`);
            await hideOverlays(page);
        }
        if (source === 'legacy' && skills.length > 1 && !has('no-combined')) {
            const id = 'combined:' + skills.length + '-sections';
            let r;
            try {
                await page.evaluate(sd => { if (window.__wsReseed) window.__wsReseed(sd); }, hash('combined:' + skills.map(s => s.skillId).join(',')));
                await renderLegacySections(page, skills, 4);
                r = await lintHtmlInSheetPage(app, await legacyDocumentHtml(page), id, 'legacy');
            } catch (e) {
                r = { info: { id, mode: source, error: e.message }, findings: [{ lint: 'L-SPLIT', rule: 'RENDER', sev: 'critical', msg: `the combined sheet did not render: ${e.message}`, key: 'render error' }] };
            }
            r.info.label = `all ${skills.length} skills as sections, 4 items each`;
            results.push(r);
            process.stdout.write(`  ${id}: ${r.info.pages ?? '?'}+${r.info.keyPages ?? '?'} pages, ${r.findings.length} finding(s)\n`);
        }
        const errs = app.problems.filter(p => !/favicon/.test(p.text));
        if (errs.length) console.log(`  (app console: ${errs.length} error(s), first: ${errs[0].text.slice(0, 120)})`);
    } finally { await app.close(); }
    return results;
}

// =============================================================================================
// REPORT
// =============================================================================================
function groupFindings(findings) {
    const groups = new Map();
    for (const f of findings) {
        const k = [f.lint, f.rule, f.sev, f.key, f.waived || ''].join('\u0001');
        if (!groups.has(k)) groups.set(k, { lint: f.lint, rule: f.rule, sev: f.sev, msg: f.msg, n: 0, pages: new Set(), cells: [], examples: [], waived: f.waived || null });
        const g = groups.get(k);
        g.n++;
        if (f.page) g.pages.add(f.page);
        if (f.cell && g.cells.length < 8) g.cells.push(f.cell);
        if (f.el && g.examples.length < 2 && !g.examples.includes(f.el)) g.examples.push(f.el);
    }
    return [...groups.values()].map(g => ({ ...g, pages: [...g.pages].sort((a, b) => a - b) }))
        .sort((a, b) => (a.waived ? 1 : 0) - (b.waived ? 1 : 0) || SEV_RANK[a.sev] - SEV_RANK[b.sev] || LINTS.indexOf(a.lint) - LINTS.indexOf(b.lint) || a.rule.localeCompare(b.rule) || a.msg.localeCompare(b.msg));
}
const sortFindings = fs2 => fs2.sort((a, b) => LINTS.indexOf(a.lint) - LINTS.indexOf(b.lint) || a.rule.localeCompare(b.rule) || (a.page || 0) - (b.page || 0) || (a.cell || 0) - (b.cell || 0) || a.msg.localeCompare(b.msg));

function report(results, source) {
    const only = (arg('lints', '') || '').split(',').map(s => s.trim()).filter(Boolean);
    const keep = f => !only.length || only.includes(f.lint);
    const idW = Math.max(28, ...results.map(r => r.info.id.length)) + 2;
    const cols = LINTS.map(l => l.replace('L-', ''));
    console.log('\n' + 'document'.padEnd(idW) + 'pages '.padStart(8) + cols.map(c => c.padStart(Math.max(5, c.length + 1))).join('') + '  result');
    const totals = Object.fromEntries(LINTS.map(l => [l, 0]));
    let failing = 0;
    for (const r of results) {
        const live = r.findings.filter(f => !f.waived && keep(f));
        const counts = LINTS.map(l => live.filter(f => f.lint === l).length);
        counts.forEach((n, i) => { totals[LINTS[i]] += n; });
        if (live.length) failing++;
        const pg = r.info.error ? 'ERR' : `${r.info.pages ?? '?'}${r.info.keyPages ? '+' + r.info.keyPages + 'k' : ''}`;
        console.log(r.info.id.padEnd(idW) + pg.padStart(8) + counts.map((n, i) => String(n || '.').padStart(Math.max(5, cols[i].length + 1))).join('') + '  ' + (live.length ? 'FAIL' : 'ok'));
    }
    console.log('TOTAL'.padEnd(idW) + ''.padStart(8) + LINTS.map((l, i) => String(totals[l] || '.').padStart(Math.max(5, cols[i].length + 1))).join(''));
    const verbose = has('verbose');
    for (const r of results) {
        const groups = groupFindings(r.findings.filter(keep));
        if (!groups.length && !r.info.notes?.length) continue;
        console.log(`\n${r.info.id}${r.info.label ? ` (${r.info.label})` : ''}${r.info.itemsPerPage ? ` - items per printed page ${r.info.itemsPerPage.join(' / ')}` : ''}`);
        const shown = verbose ? groups : groups.slice(0, 12);
        for (const g of shown) {
            const loc = [g.pages.length ? `p${g.pages.join(',')}` : '', g.cells.length ? `cells ${g.cells.join(',')}${g.n > g.cells.length ? '...' : ''}` : ''].filter(Boolean).join(' ');
            console.log(`  ${g.waived ? 'WAIVED ' : ''}[${g.lint} ${g.rule} ${g.sev}]${g.n > 1 ? ` x${g.n}` : ''}${loc ? ` (${loc})` : ''} ${g.msg}${g.examples.length ? `\n      e.g. ${g.examples.join(' | ')}` : ''}${g.waived ? `\n      waived: ${g.waived}` : ''}`);
        }
        if (groups.length > shown.length) console.log(`  ... ${groups.length - shown.length} more group(s) (--verbose)`);
        if (verbose) for (const n of r.info.notes || []) console.log(`  note: ${n}`);
    }
    return { totals, failing };
}

function writeJson(results, source, file) {
    const out = {
        tool: TOOL, source, lints: LINTS,
        documents: results.map(r => ({
            id: r.info.id, label: r.info.label || '', mode: r.info.mode, pages: r.info.pages ?? null, keyPages: r.info.keyPages ?? null,
            printedPages: r.info.printedPages ?? null, itemsPerPage: r.info.itemsPerPage || null, parts: r.info.parts || null, error: r.info.error || null,
            counts: Object.fromEntries(LINTS.map(l => [l, r.findings.filter(f => f.lint === l && !f.waived).length])),
            findings: sortFindings(r.findings.map(f => { const { key, ...rest } = f; return rest; })),
            notes: r.info.notes || [],
        })),
    };
    fs.writeFileSync(path.resolve(process.cwd(), file), JSON.stringify(out, null, 1));
    console.log(`wrote ${file}`);
}

// RATCHET: a (document, lint, rule) count may fall, never rise; a document the baseline has not seen
// must be clean.
function ratchet(results, file) {
    const base = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file), 'utf8'));
    const idx = new Map();
    for (const d of base.documents) { const m = new Map(); for (const f of d.findings) if (!f.waived) { const k = `${f.lint} ${f.rule}`; m.set(k, (m.get(k) || 0) + 1); } idx.set(d.id, m); }
    const rises = [];
    for (const r of results) {
        const m = new Map();
        for (const f of r.findings) if (!f.waived) { const k = `${f.lint} ${f.rule}`; m.set(k, (m.get(k) || 0) + 1); }
        const b = idx.get(r.info.id) || new Map();
        for (const [k, n] of m) if (n > (b.get(k) || 0)) rises.push(`${r.info.id} ${k}: ${b.get(k) || 0} -> ${n}`);
    }
    return rises;
}

// =============================================================================================
// SELF-TEST: every lint is proven by planting its defect in a copy of an approved pack page.
// The clean copy must lint clean first, so each firing is caused by the planted defect.
// =============================================================================================
const SELF_TESTS = [
    { name: 'coloured fill', expect: ['L-INK', 'INK-1'], fn: () => { document.querySelector('.ws-page [data-ws-cell]').style.background = '#3b82f6'; } },
    { name: 'coloured text', expect: ['L-INK', 'INK-1'], fn: () => { document.querySelector('.ws-page .ws-instrline').style.color = '#7c3aed'; } },
    { name: 'drop shadow on a heading', expect: ['L-INK', 'INK-2'], fn: () => { document.querySelector('.ws-page .ws-title').style.boxShadow = '0 3px 0 0 #000'; } },
    { name: 'greyscale filter', expect: ['L-INK', 'INK-2'], fn: () => { document.querySelector('.ws-page [data-ws-cell]').style.filter = 'grayscale(1)'; } },
    { name: 'black 20 mm disk with black text', expect: [['L-INK', 'INK-5'], ['L-INK', 'ILLEGIBLE']], fn: () => {
        const c = document.querySelector('.ws-page [data-ws-cell]');
        c.insertAdjacentHTML('beforeend', '<svg width="22mm" height="22mm" viewBox="0 0 22 22" style="position:absolute;right:3mm;bottom:3mm"><circle cx="11" cy="11" r="10" fill="#000"/><text x="11" y="13" text-anchor="middle" font-size="6" fill="#000" font-family="Andika">100</text></svg>');
    } },
    { name: 'dashed box that is not a cut line', expect: ['L-INK', 'LS-4'], fn: () => { document.querySelector('.ws-page [data-ws-cell]').insertAdjacentHTML('beforeend', '<div style="width:20mm;height:10mm;border:0.75pt dashed #000"></div>'); } },
    { name: 'emoji', expect: ['L-EMOJI', 'INK-7'], fn: () => { document.querySelector('.ws-page .ws-instrline').textContent += ' ⭐'; } },
    { name: 'letter x as times sign', expect: ['L-EMOJI', 'TY-6'], fn: () => { document.querySelector('.ws-page .ws-instrline').textContent = '3 x 4 = ?'; } },
    { name: 'serif font', expect: [['L-FONT', 'TY-1']], fn: () => { document.querySelector('.ws-page [data-ws-cell]').style.fontFamily = '"Times New Roman", serif'; } },
    { name: 'italic', expect: ['L-FONT', 'TY-2'], fn: () => { document.querySelector('.ws-page .ws-title').style.fontStyle = 'italic'; } },
    { name: 'rejected digit variant cv01', expect: ['L-FONT', 'TY-4'], fn: () => { document.querySelector('.ws-page').style.fontFeatureSettings = '"cv04" 1, "cv01" 1'; } },
    { name: '6 pt pupil text', expect: ['L-SIZE', 'TY-11'], fn: () => { document.querySelector('.ws-page .ws-instrline').style.fontSize = '6pt'; } },
    { name: 'element sticking out of its cell', expect: ['L-OVERFLOW', 'PG-12'], fn: () => { document.querySelector('.ws-page [data-ws-cell]').insertAdjacentHTML('beforeend', '<div style="width:150mm;height:4mm;border-top:0.75pt solid #000"></div>'); } },
    { name: 'clipped text', expect: ['L-OVERFLOW', 'TY-12'], fn: () => { const t = document.querySelector('.ws-page .ws-title'); t.style.overflow = 'hidden'; t.style.width = '30mm'; t.style.justifyContent = 'flex-start'; } },
    { name: 'split cell (page box taller than A4)', expect: ['L-SPLIT', 'PG-21'], fn: () => { document.querySelector('.ws-page').style.height = '380mm'; } },
    { name: 'footer in mid-page', expect: ['L-SPLIT', 'HD-30'], fn: () => { const b = document.querySelector('.ws-page .ws-body'); b.style.flex = 'none'; b.style.height = '120mm'; } },
    { name: 'two-item page in a two-page sheet', expect: ['L-DENSITY', 'DN-2'], fn: () => {
        const p1 = document.querySelector('.ws-page');
        const p2 = p1.cloneNode(true);
        p1.after(p2);
        p1.querySelector('.ws-foot b').textContent = '1/2'; p2.querySelector('.ws-foot b').textContent = '2/2';
        [...p1.querySelectorAll('[data-ws-cell]')].slice(2).forEach(c => c.remove());
    } },
    { name: 'eight items on an Independent page', expect: ['L-DENSITY', 'DN-1'], fn: () => {
        const p1 = document.querySelector('.ws-page');
        p1.setAttribute('data-ws-role', 'independent');
        const g = p1.querySelector('.ws-grid');
        const cells = [...g.querySelectorAll('[data-ws-cell]')];
        g.append(cells[0].cloneNode(true), cells[1].cloneNode(true));
        g.style.gridTemplateRows = 'repeat(4, 1fr)';
    } },
    { name: 'list answer key', expect: ['L-KEY', 'AK-1'], fn: () => {
        const k = [...document.querySelectorAll('.ws-page')].find(p => /Answer Key/.test(p.querySelector('.ws-tabbox')?.textContent || ''));
        k.querySelector('.ws-grid').outerHTML = '<ol class="p11-list"><li>365</li><li>583</li><li>455</li><li>765</li><li>360</li><li>810</li></ol>';
    } },
    { name: 'unanswered key slot', expect: ['L-KEY', 'AK-2'], fn: () => {
        const k = [...document.querySelectorAll('.ws-page')].find(p => /Answer Key/.test(p.querySelector('.ws-tabbox')?.textContent || ''));
        k.querySelector('[data-ws-cell] [data-ws-slot]').querySelectorAll('.p11-key').forEach(e => e.remove());
    } },
    { name: 'screen verb on paper', expect: ['L-VERBS', 'BD-12'], fn: () => { document.querySelector('.ws-page .ws-instrline').textContent = 'Click the right answer.'; } },
    { name: 'instruction over 12 words', expect: ['L-VERBS', 'BD-10'], fn: () => { document.querySelector('.ws-page .ws-instrline').textContent = 'Add the two numbers and then write the answer in the boxes below the line.'; } },
    { name: '"Part 01" section heading', expect: ['L-VERBS', 'BD-1'], fn: () => { document.querySelector('.ws-page .ws-body').insertAdjacentHTML('afterbegin', '<h2 class="section-num" style="font-size:12pt;margin:0">Part 01</h2>'); } },
    { name: 'answer line under 14 mm', expect: ['L-ANSAREA', 'SL-1'], fn: () => { document.querySelector('.ws-page [data-ws-cell]').insertAdjacentHTML('beforeend', '<span class="ws-line" data-ws-slot="x" data-ws-shape="line" style="--w:10mm"></span>'); } },
    { name: 'underscore blank', expect: ['L-ANSAREA', 'SL-6'], fn: () => { document.querySelector('.ws-page [data-ws-cell]').insertAdjacentHTML('beforeend', '<span>_____ blocks</span>'); } },
    { name: 'draw zone too small for the model', expect: ['L-ANSAREA', 'H12'], fn: () => { document.querySelector('.ws-page [data-ws-cell]').insertAdjacentHTML('beforeend', '<div style="font-size:11pt">Draw 169 with disks.</div><div data-ws-zone="hundreds" style="width:40mm;height:18mm;border:0.75pt solid #000"></div>'); } },
    { name: 'an input on paper', expect: ['L-INPUT', 'SP-10'], fn: () => { document.querySelector('.ws-page [data-ws-cell]').insertAdjacentHTML('beforeend', '<input style="width:14mm">'); } },
    { name: 'grade and CCSS code in a cell', expect: ['L-CCSS', 'SC-5'], fn: () => { document.querySelector('.ws-page [data-ws-cell]').insertAdjacentHTML('beforeend', '<span style="font-size:11pt">Grade 3 3.NBT.A.2</span>'); } },
];

// A synthetic sheet in the legacy DOM shape (.worksheet-set / .worksheet-problem / .answer-key-grid,
// flowing through @page margins) proves the PDF-destination path the legacy source depends on.
function legacyFixture({ items = 6, tall = 0, midFooter = false, listKey = false, perPageDense = false } = {}) {
    const cell = (n, h) => `<div class="worksheet-problem" style="break-inside:avoid;height:${h}mm;border-top:0.75pt solid #000;padding:2mm 0"><span class="p-num" style="font-weight:700">${n}.</span><div class="problem-content" style="font-size:22pt">${n} + ${n} = <span class="blank" style="display:inline-block;width:20mm;border-bottom:0.75pt solid #000"></span></div></div>`;
    const h = perPageDense ? 25 : 60;
    let cells = '';
    for (let i = 1; i <= items; i++) cells += cell(i, i === 2 && tall ? tall : h);
    const key = listKey
        ? `<div class="answer-key-grid">${Array.from({ length: items }, (_, i) => `<div class="answer-key-item"><span class="answer-key-num">${i + 1}.</span><span class="answer-key-ans">${2 * (i + 1)}</span></div>`).join('')}</div>`
        : Array.from({ length: items }, (_, i) => cell(i + 1, i === 1 && tall ? tall : h).replace('<span class="blank"', `<b style="font-weight:700">${2 * (i + 1)}</b><span class="blank"`)).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/css/fonts/andika.css"><style>
@page { size: A4; margin: 12mm 12mm 14mm 12mm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Andika, sans-serif; font-synthesis: none; font-feature-settings: "cv04" 1; color: #000; background: #fff; }
.ws-instrline { font-size: 15pt; height: 9mm; }
.sheet-foot { display: flex; justify-content: space-between; font-size: 7pt; ${midFooter ? '' : 'position: fixed; bottom: 0; left: 0; right: 0;'} }
</style></head><body><div class="print-preview-content">
<div class="worksheet-set print-edition"><div class="ws-instrline">Add.</div>${cells}<footer class="sheet-foot"><span>MathQuest</span><span>Form A</span></footer></div>
<div class="worksheet-set print-edition" style="break-before:page"><div class="answer-key-section"><div class="ws-instrline">Answer Key</div>${key}</div></div>
</div></body></html>`;
}
const LEGACY_SELF_TESTS = [
    { name: 'legacy: clean fixture', fixture: {}, expect: [] },
    { name: 'legacy: list answer key', fixture: { listKey: true }, expect: [['L-KEY', 'AK-1']] },
    { name: 'legacy: item taller than the space left on its page', fixture: { tall: 300 }, expect: [['L-SPLIT', 'PG-21']] },
    { name: 'legacy: footer / date line in mid-page', fixture: { items: 2, midFooter: true }, expect: [['L-SPLIT', 'HD-30']] },
    { name: 'legacy: ten items per printed page', fixture: { items: 12, perPageDense: true }, expect: [['L-DENSITY', 'DN-1']] },
];

async function selfTest() {
    await buildPackHtml(['11']);
    const env = await launchBare();
    const bad = [];
    let asserts = 0;
    let supportCovered = false;
    // 11-A (the plain sheet) and 11-I (its facsimile key): a pupil page and its key, both approved
    const prepare = async () => {
        const page = await env.browser.newPage();
        await page.setViewport({ width: 794, height: 1100, deviceScaleFactor: 1 });
        await page.goto(`${env.base}/design/mockups/out/11-options-and-variants.html`, { waitUntil: 'networkidle0' });
        await page.evaluate(() => {
            const pages = [...document.querySelectorAll('.ws-page')];
            pages.forEach((p, i) => { if (i !== 0 && i !== pages.length - 1) p.remove(); });
            document.querySelectorAll('.ws-note').forEach(n => n.remove());
        });
        return page;
    };
    const fired = (r, [lint, rule]) => r.findings.some(f => f.lint === lint && f.rule === rule);
    try {
        {
            const page = await prepare();
            const r = await lintDocument(page, { id: 'self-test clean', mode: 'pack' });
            await page.close();
            asserts++;
            if (r.findings.length) bad.push(`clean fixture (pack 11-A + 11-I) is not clean: ${groupFindings(r.findings).map(g => `[${g.lint} ${g.rule}] ${g.msg}`).slice(0, 5).join(' | ')}`);
            else console.log('  ok   clean fixture: 0 findings');
        }
        for (const t of SELF_TESTS) {
            const page = await prepare();
            await page.evaluate(t.fn);
            await sleep(50);
            const r = await lintDocument(page, { id: `self-test ${t.name}`, mode: 'pack' });
            await page.close();
            const exp = Array.isArray(t.expect[0]) ? t.expect : [t.expect];
            for (const e of exp) {
                asserts++;
                if (fired(r, e)) console.log(`  ok   ${t.name}: ${e.join(' ')} fired - ${r.findings.find(f => f.lint === e[0] && f.rule === e[1]).msg.slice(0, 110)}`);
                else bad.push(`${t.name}: expected ${e.join(' ')}, got ${groupFindings(r.findings).map(g => `${g.lint} ${g.rule}`).join(', ') || 'nothing'}`);
            }
        }
        for (const t of LEGACY_SELF_TESTS) {
            const page = await env.browser.newPage();
            await page.setViewport({ width: 794, height: 1100, deviceScaleFactor: 1 });
            await page.goto(`${env.base}/index.html`, { waitUntil: 'domcontentloaded' });
            await page.setContent(legacyFixture(t.fixture), { waitUntil: 'networkidle0' });
            const r = await lintDocument(page, { id: `self-test ${t.name}`, mode: 'legacy' });
            await page.close();
            asserts++;
            if (!t.expect.length) {
                const real = r.findings.filter(f => !(f.lint === 'L-VERBS' && f.rule === 'BD-10'));
                if (real.length) bad.push(`${t.name}: expected no findings, got ${groupFindings(real).map(g => `[${g.lint} ${g.rule}] ${g.msg}`).slice(0, 4).join(' | ')}`);
                else console.log(`  ok   ${t.name}: 0 findings (${r.info.pages} pupil + ${r.info.keyPages} key page(s))`);
                continue;
            }
            for (const e of t.expect) {
                if (fired(r, e)) console.log(`  ok   ${t.name}: ${e.join(' ')} fired - ${r.findings.find(f => f.lint === e[0] && f.rule === e[1]).msg.slice(0, 110)}`);
                else bad.push(`${t.name}: expected ${e.join(' ')}, got ${groupFindings(r.findings).map(g => `${g.lint} ${g.rule}`).join(', ') || 'nothing'}`);
            }
        }
        // L-SUPPORT runs in the rendered document (supportCheckInPage): proven on planted pages.
        {
            const page = await env.browser.newPage();
            const cell = (sup, slotStyle = '', extra = '') => `<div class="ws-cell mqt--fact" style="position:relative;width:60mm;height:40mm">`
                + `<div class="ws-supported"><div class="ws-pane-problem"><div class="ws-fact" style="x">7 5<span data-ws-slot="ans" style="display:block;${slotStyle}">&nbsp;</span></div></div>${sup}</div>${extra}</div>`;
            const doc = (pupil, key) => `<html><body><section data-ws-mode="print"><div class="ws-grid">${pupil.join('')}</div></section><section data-ws-mode="key"><div class="ws-grid">${key.join('')}</div></section></body></html>`;
            const tile = '<div data-ws-support-on="tile">7 and 5</div>';
            const keyed = (c) => c.replace('&nbsp;', '12');
            const cases = [
                ['support clean', doc([cell(tile), cell(tile)], [keyed(cell(tile)), keyed(cell(tile))]), null],
                ['support showing the answer', doc([cell('<div data-ws-support-on="line">12</div>')], [keyed(cell('<div data-ws-support-on="line">12</div>'))]), ['L-SUPPORT', 'RP-1']],
                ['tally rows of two lengths', doc([cell('<div data-ws-support-on="touch"><div class="ws-td-tallyrow" data-ws-tally="10"></div></div>'), cell('<div data-ws-support-on="touch"><div class="ws-td-tallyrow" data-ws-tally="12"></div></div>')], []), ['L-SUPPORT', 'S1.7']],
                ['answer zone moves', doc([cell(tile), cell('<div data-ws-support-reserve="tile"></div>', 'margin-top:9mm')], []), ['L-SUPPORT', 'SCC-T10']],
                ['key without the supports', doc([cell(tile)], [keyed(cell(''))]), ['L-SUPPORT', 'AK-1']],
            ];
            let allOk = true;
            for (const [name, html, want] of cases) {
                asserts++;
                await page.setContent(html);
                const f = (await page.evaluate(supportCheckInPage)).findings;
                const hit = want ? f.some(x => x.lint === want[0] && x.rule === want[1]) : !f.length;
                if (hit) console.log(`  ok   ${name}: ${want ? want.join(' ') + ' fired' : '0 findings'}`);
                else { allOk = false; bad.push(`${name}: expected ${want ? want.join(' ') : 'no findings'}, got ${f.map(x => `${x.lint} ${x.rule} ${x.msg}`).join(', ') || 'nothing'}`); }
            }
            await page.close();
            if (allOk) supportCovered = true;
        }
    } finally { await env.close(); }
    const lintsCovered = new Set(SELF_TESTS.flatMap(t => (Array.isArray(t.expect[0]) ? t.expect : [t.expect]).map(e => e[0])));
    {
        // L-ANCHOR reads the kit's HTML halves (anchorFindings), so it is proven on planted strings.
        const cell = (inner, tab = true) => `<div class="ws-cell mq-anchorcell">${tab ? '<span class="ws-modeltab" data-ws-label="model">Model</span>' : ''}<div class="mq-anchor mq-anchor-band">${inner}</div></div>`;
        const clean = cell('<span data-ws-aslot="ans">5</span>');
        const cases = [
            ['anchor clean', clean, clean, null],
            ['anchor without its Model tab', cell('<b>5</b>', false), cell('<b>5</b>', false), ['L-ANCHOR', 'PT-LBL-6']],
            ['anchor with a letter label', cell('<span class="ws-letter" data-ws-label="letter">a.</span>'), cell('<span class="ws-letter" data-ws-label="letter">a.</span>'), ['L-ANCHOR', 'PT-LBL-6']],
            ['anchor with an answer slot', cell('<span data-ws-slot="ans"></span>'), cell('<span data-ws-slot="ans"></span>'), ['L-ANCHOR', 'PT-LBL-6']],
            ['anchor drawn differently on the key', clean, cell('<b>6</b>'), ['L-ANCHOR', 'AK-1']],
        ];
        let allOk = true;
        for (const [name, pupil, key, want] of cases) {
            asserts++;
            const f = anchorFindings(pupil, key);
            const hit = want ? f.some(x => x.lint === want[0] && x.rule === want[1]) : !f.length;
            if (hit) console.log(`  ok   ${name}: ${want ? want.join(' ') + ' fired' : '0 findings'}`);
            else { allOk = false; bad.push(`${name}: expected ${want ? want.join(' ') : 'no findings'}, got ${f.map(x => `${x.lint} ${x.rule}`).join(', ') || 'nothing'}`); }
        }
        if (allOk) lintsCovered.add('L-ANCHOR');
    }
    if (supportCovered) lintsCovered.add('L-SUPPORT');
    const uncovered = LINTS.filter(l => !lintsCovered.has(l));
    if (uncovered.length) bad.push(`lints with no self-test: ${uncovered.join(', ')}`);
    if (bad.length) { console.error(`${TOOL}: FAIL - ${bad.length} self-test(s)`); bad.forEach(b => console.error('  - ' + b)); process.exit(1); }
    console.log(`${TOOL}: OK (self-test, ${asserts} assertions, ${SELF_TESTS.length + LEGACY_SELF_TESTS.length} planted defects, every lint covered)`);
}

// =============================================================================================
// MAIN
// =============================================================================================
module.exports = { wsLintPage, wsPageBox, lintDocument, lintHtmlInSheetPage, analysePdf, CEILINGS, PACK_WAIVERS };
if (require.main === module) (async () => {
    if (has('self-test')) return selfTest();
    const source = arg('source', 'legacy');
    if (!['pack', 'legacy', 'kit'].includes(source)) throw new Error(`unknown --source ${source} (pack, legacy, kit)`);
    let results;
    if (source === 'pack') {
        const only = (arg('files', '') || '').split(',').map(s => s.trim()).filter(Boolean);
        console.log(`${TOOL}: source pack (design/mockups/pages${only.length ? ' ' + only.join(',') : ''}; not linted: ${PACK_NOT_SHEETS.join(', ')} - screen mock-ups, not sheets)`);
        results = await runPack(only);
    } else {
        results = await runApp(source);
    }
    const { totals, failing } = report(results, source);
    const JSON_OUT = arg('json', null);
    if (JSON_OUT) writeJson(results, source, JSON_OUT);
    const waived = results.reduce((n, r) => n + r.findings.filter(f => f.waived).length, 0);
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    const summary = `${results.length} document(s), source ${source}; ${total} finding(s) in ${failing} document(s)${waived ? `, ${waived} waived` : ''}`;
    const BASE = arg('baseline', null);
    if (BASE) {
        const rises = ratchet(results, BASE);
        if (rises.length && !has('report-only')) { console.error(`\n${TOOL}: FAIL - ratchet: ${rises.length} count(s) rose above ${BASE}`); rises.forEach(r => console.error('  - ' + r)); process.exit(1); }
        console.log(rises.length ? `\n${TOOL}: WOULD FAIL - ratchet: ${rises.length} rise(s) [report-only, exit 0]\n  - ${rises.join('\n  - ')}` : `\n${TOOL}: OK (ratchet against ${BASE}: nothing rose; ${summary})`);
        return;
    }
    if (failing && !has('report-only')) { console.error(`\n${TOOL}: FAIL - ${summary}`); process.exit(1); }
    console.log(failing ? `\n${TOOL}: WOULD FAIL - ${summary} [report-only, exit 0]` : `\n${TOOL}: OK (${summary})`);
})().catch(e => { console.error(`${TOOL}: FAIL - ${has('verbose') ? (e && e.stack) || e : (e && e.message) || e}`); process.exit(1); });
