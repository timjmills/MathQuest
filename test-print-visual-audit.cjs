// Visual Print Quality Audit
// ----------------------------
// Generates 8 distinct worksheet scenarios, renders each in print mode
// (puppeteer mediaType: 'print'), screenshots them, and runs automated
// quality checks against the rendered DOM/text:
//
//   - No truncated skill labels (e.g. "Add Mixed Nu", "Subtract Fra", "Composite Vol")
//   - No emoji in print output (U+1F300..U+1FAFF, plus a hand-picked block list)
//   - No leftover <input> elements (must be styled blank boxes)
//   - No spoiler patterns (`LCD = 12`, `Rule: Add 3`, `Bottom: 2 × 3 × 4`,
//     partial-product numbers leaking into area-model interior cells)
//   - All visible text computes to a near-black colour in print mode
//   - Coordinate planes (when present) are >= 250px wide
//   - Answer-key sections are preceded by a `page-break-before: always` rule
//
// Usage:  node test-print-visual-audit.cjs

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-print-visual-audit-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const log = (...a) => console.log('[AUDIT]', ...a);

// ----- helpers --------------------------------------------------------------

async function waitFor(page, fn, timeout = 15000, label = 'condition') {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (await page.evaluate(fn)) return true; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error(`Timeout waiting for ${label}`);
}

// Build a {categoryId, skillId, ...} skill record by looking up SKILLS in-page
async function resolveSkills(page, list) {
  return page.evaluate((items) => {
    const { SKILLS, DOMAINS, getDomainByCategory } = window;
    // Resolve categoryId by scanning SKILLS map (getCategoryForSkill is not on window)
    const lookupCategory = (skillId) => {
      for (const [categoryId, skills] of Object.entries(SKILLS)) {
        if (!Array.isArray(skills)) continue;
        if (skills.some(s => s.v === skillId)) return categoryId;
      }
      return null;
    };
    return items.map(({ skillId, weight }) => {
      const categoryId = lookupCategory(skillId);
      if (!categoryId) return { skillId, _missing: true };
      const domainId = getDomainByCategory(categoryId);
      const dom = DOMAINS[domainId];
      const cat = dom?.categories?.find(c => c.id === categoryId);
      const skillEntry = (SKILLS[categoryId] || []).find(s => s.v === skillId);
      const skillLabel = skillEntry ? skillEntry.l : skillId;
      return {
        categoryId,
        skillId,
        skillLabel,
        categoryIcon: cat?.icon || '',
        categoryName: cat?.name || categoryId,
        domainColor: dom?.color || '#1565c0',
        percent: weight || 0,
      };
    });
  }, list);
}

// Render one scenario: build sections, call generateWorksheetFromSections,
// switch to print media, screenshot, then read back text/DOM for analysis.
async function renderScenario(page, name, skills, opts = {}) {
  const {
    title = name,
    problemCount = 8,
    columns = 2,
    includeAnswerKey = true,
    separateAnswerPage = true,
    grade = null,
  } = opts;

  log(`--- ${name} (${problemCount} problems, grade ${grade || 'mix'}) ---`);

  // Reset to a clean starting state
  await page.evaluate(() => {
    if (window.closePrintPreview) window.closePrintPreview();
    if (window.closeSimplePrintModal) window.closeSimplePrintModal();
    if (window.goHome) window.goHome();
    document.body.style.overflow = '';
    // Force-hide any leftover modal in case helper failed
    const m = document.getElementById('simplePrintModal');
    if (m) m.style.display = 'none';
  });
  await new Promise(r => setTimeout(r, 150));

  // Build a single section so layout is deterministic.
  const built = await page.evaluate(({ skills, title, problemCount, columns, includeAnswerKey, separateAnswerPage }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (typeof window.generateWorksheetFromSections !== 'function') {
          reject(new Error('generateWorksheetFromSections missing on window'));
          return;
        }
        const sections = [{
          label: title,
          columns,
          problemCount,
          countMode: 'problems',
          pageCount: 1,
          groupByType: false,
          skills,
        }];
        await window.generateWorksheetFromSections(
          sections,
          1,                    // numSets
          title,                // title
          'color',              // printStyle
          includeAnswerKey,
          false,                // useWorkedSolutions
          separateAnswerPage,
        );
        resolve({ ok: true });
      } catch (e) {
        reject(e);
      }
    });
  }, { skills, title, problemCount, columns, includeAnswerKey, separateAnswerPage });

  // Wait for printPreviewContent to populate
  await waitFor(
    page,
    () => {
      const el = document.getElementById('printPreviewContent');
      return el && el.innerHTML.length > 200 && !/Generating worksheet/.test(el.innerHTML);
    },
    20000,
    'printPreviewContent populated'
  );
  // Allow SVGs/KaTeX to settle
  await new Promise(r => setTimeout(r, 600));

  // Move the preview content into #printOutputContent (the element the
  // @media print CSS block keeps visible). Also inject a stylesheet that
  // forces printOutput to be visible (overriding inline display:none) and
  // hides the rest of the chrome, so the screenshot captures the worksheet.
  await page.evaluate(() => {
    const previewEl = document.getElementById('printPreviewContent');
    const outputEl = document.getElementById('printOutputContent');
    const outputContainer = document.getElementById('printOutput');
    if (previewEl && outputEl && outputContainer) {
      outputEl.innerHTML = previewEl.innerHTML;
      outputContainer.setAttribute('style',
        'display:block !important;' +
        'position:static;' +
        'background:#fff;' +
        'color:#000;' +
        'padding:24px;' +
        'max-width:8.5in;' +
        'margin:0 auto;'
      );
    }
    // Hide overlays / dialogs that could occlude the screenshot
    const m = document.getElementById('simplePrintModal');
    if (m) m.style.display = 'none';
    const overlay = document.getElementById('printProgressOverlay');
    if (overlay) overlay.style.display = 'none';
    const c = document.getElementById('printPreviewContainer');
    if (c) c.style.display = 'none';
    // Also hide the home/game/dashboard views that live on the same page
    document.querySelectorAll('.view').forEach(v => {
      v.style.visibility = 'hidden';
      v.style.position = 'absolute';
      v.style.left = '-9999px';
    });
    document.body.style.overflow = '';
    document.body.style.background = '#fff';
    window.scrollTo(0, 0);
  });
  // Switch to print media so @media print rules apply (B&W text colours etc.)
  await page.emulateMediaType('print');
  await new Promise(r => setTimeout(r, 400));

  // Use SCREEN media for the screenshot — print emulation hides .container
  // and .print-preview-container via @media print rules, leaving the page
  // blank in puppeteer's screenshot. We still emulate print briefly during
  // colour sampling below so the @media print colour overrides apply for
  // those checks.
  await page.emulateMediaType('screen');
  const renderHeight = await page.evaluate(() => {
    const out = document.getElementById('printOutput');
    if (!out) return 900;
    return Math.max(out.scrollHeight, document.body.scrollHeight, 900);
  });
  await page.setViewport({ width: 1280, height: Math.min(renderHeight + 40, 5000) });
  await new Promise(r => setTimeout(r, 200));

  const shotPath = path.join(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path: shotPath, fullPage: true });
  log(`  shot: ${path.basename(shotPath)} (height=${renderHeight}px)`);

  // Now switch to print media for colour-sample / page-break checks
  await page.emulateMediaType('print');
  await new Promise(r => setTimeout(r, 150));

  // Reset viewport for next scenario
  await page.setViewport({ width: 1280, height: 900 });

  // ---- Quality scan (still in print media) ----
  const scan = await page.evaluate(() => {
    // Prefer the visible printOutputContent (what's actually screenshotted in
    // print media); fall back to the preview if needed.
    const root = document.getElementById('printOutputContent') || document.getElementById('printPreviewContent');
    const out = {
      ok: !!root,
      inputCount: 0,
      coordSizes: [],
      colorSamples: [],
      pageBreakBeforeAnswerKey: null,
      bodyText: '',
      htmlSample: '',
      inputTypes: [],
    };
    if (!root) return out;
    out.bodyText = root.innerText || '';
    out.htmlSample = root.innerHTML.substring(0, 2000);

    // Count <input> elements (should be 0 — print uses styled blank boxes)
    const inputs = root.querySelectorAll('input, textarea, select');
    out.inputCount = inputs.length;
    out.inputTypes = Array.from(inputs).slice(0, 10).map(i => `${i.tagName}[type=${i.type || 'n/a'}]`);

    // Coordinate planes — must be approximately square SVGs at a "graph" size
    // (>= 100px each axis) AND contain BOTH horizontal and vertical lines.
    // The earlier "lines.length >= 8" heuristic also matched fraction-bar
    // segment grids and small tick marks; tighten it.
    const svgs = Array.from(root.querySelectorAll('svg'));
    for (const svg of svgs) {
      const lines = svg.querySelectorAll('line');
      if (lines.length < 8) continue;
      // Prefer rendered size; fall back to attribute width/height; then viewBox
      const r = svg.getBoundingClientRect();
      let w = Math.round(r.width), h = Math.round(r.height);
      if (w === 0 || h === 0) {
        const aw = parseFloat(svg.getAttribute('width') || '0');
        const ah = parseFloat(svg.getAttribute('height') || '0');
        if (aw > 0) w = Math.round(aw);
        if (ah > 0) h = Math.round(ah);
      }
      if (w === 0 || h === 0) {
        const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
        if (vb.length === 4) {
          if (w === 0) w = Math.round(vb[2]);
          if (h === 0) h = Math.round(vb[3]);
        }
      }
      // Tight filter: only consider it a "coordinate plane" if it is at least
      // 150px on each axis (otherwise it is a number line, fraction bar, etc.)
      if (w < 150 || h < 150) continue;
      // Verify it has both horizontal and vertical lines
      let hasH = false, hasV = false;
      for (const ln of lines) {
        const x1 = +ln.getAttribute('x1'), y1 = +ln.getAttribute('y1');
        const x2 = +ln.getAttribute('x2'), y2 = +ln.getAttribute('y2');
        if (Math.abs(y1 - y2) < 1) hasH = true;
        if (Math.abs(x1 - x2) < 1) hasV = true;
        if (hasH && hasV) break;
      }
      if (!hasH || !hasV) continue;
      out.coordSizes.push({ w, h, lines: lines.length });
    }

    // Random color sampling — pick visible text nodes
    const allText = Array.from(root.querySelectorAll('p, span, div, td, th, li'))
      .filter(el => {
        const t = (el.innerText || '').trim();
        return t.length > 0 && t.length < 400;
      });
    const sample = [];
    for (let i = 0; i < 8 && allText.length > 0; i++) {
      const idx = Math.floor(Math.random() * allText.length);
      const el = allText[idx];
      const cs = window.getComputedStyle(el);
      sample.push({
        text: (el.innerText || '').slice(0, 60),
        color: cs.color,
      });
    }
    out.colorSamples = sample;

    // Answer key page-break check.
    // Prefer the OUTER container — either a .worksheet-set wrapping the AK or
    // a .answer-key-section sibling of the worksheet body (separatePage=false
    // path). We walk up the DOM from any "Answer Key" text node to find the
    // enclosing block whose computed style sets a break-before.
    let akEl = null;
    const allEls = root.querySelectorAll('.worksheet-set, .answer-key-section, [class*="answer-key"]');
    for (const el of allEls) {
      const txt = (el.textContent || '').trim();
      if (!/answer key/i.test(txt)) continue;
      // We want the OUTER element that owns the page break, not the inner title.
      // Heuristic: if this element is an .answer-key-section, take it; otherwise
      // if it's a .worksheet-set whose ONLY heading is "Answer Key", take it.
      if (el.classList.contains('answer-key-section')) { akEl = el; break; }
      if (el.classList.contains('worksheet-set') && /^Answer Key/i.test(txt)) {
        akEl = el; break;
      }
    }
    if (akEl) {
      const cs = window.getComputedStyle(akEl);
      const inline = (akEl.getAttribute('style') || '').toLowerCase();
      out.pageBreakBeforeAnswerKey = {
        tag: akEl.tagName + '.' + akEl.className,
        inlineHas: /page-break-before\s*:\s*always|break-before\s*:\s*page|break-before\s*:\s*always/.test(inline),
        computedBreakBefore: cs.breakBefore || cs.pageBreakBefore || null,
      };
    }

    return out;
  });

  // Restore screen media so subsequent UI work isn't broken
  await page.emulateMediaType('screen');

  // Close the preview before next scenario AND clear printOutputContent
  await page.evaluate(() => {
    if (window.closePrintPreview) window.closePrintPreview();
    if (window.closeSimplePrintModal) window.closeSimplePrintModal();
    const outputContainer = document.getElementById('printOutput');
    if (outputContainer) outputContainer.setAttribute('style', 'display:none;');
    const outputEl = document.getElementById('printOutputContent');
    if (outputEl) outputEl.innerHTML = '';
    const m = document.getElementById('simplePrintModal');
    if (m) m.style.display = 'none';
    // Restore .view elements so goHome works for next scenario
    document.querySelectorAll('.view').forEach(v => {
      v.style.visibility = '';
      v.style.position = '';
      v.style.left = '';
    });
    document.body.style.overflow = '';
    document.body.style.background = '';
  });
  await new Promise(r => setTimeout(r, 150));

  return { name, shotPath, scan };
}

// ----- quality checks against scan + screenshot -----------------------------
function isNearBlack(rgb) {
  // expects strings like "rgb(34, 34, 34)" or "rgba(0, 0, 0, 1)"
  const m = rgb && rgb.match(/(\d+(?:\.\d+)?)/g);
  if (!m || m.length < 3) return true; // unknown — don't fail
  const r = +m[0], g = +m[1], b = +m[2];
  // accept anything where each channel <= 110 (Material grey-700 ish)
  return r <= 110 && g <= 110 && b <= 110;
}

// Truncation needles: words cut mid-letter at common positions.
// Each entry must NOT match a longer legitimate label that contains these
// letters as a prefix. We use a regex with a word boundary or end-of-line
// after the truncated fragment.
const TRUNCATION_NEEDLES = [
  /\bAdd Mixed Nu\b/,                 // not "Add Mixed Numbers"
  /\bSubtract Fra(?![a-z])/,          // not "Subtract Fractions"
  /\bComposite Vol(?![a-z])/,         // not "Composite Volume"
  /\bMultiplicat(?:io)?…/,
  /\bSubtractio…/,
  /\bFractio…/,
];

const SPOILER_PATTERNS = [
  /\bLCD\s*=\s*\d/i,
  /\bRule:\s*(Add|Subtract|Multiply|Divide|Multiply by|Divide by|Times|Minus|Plus)\s*\d/i,
  /\bBottom:\s*\d+\s*[×x*]\s*\d+\s*[×x*]\s*\d/i,
];

// Emoji detection: the broad U+2600..U+27BF range includes legitimate
// print symbols like ☐ (ballot box, U+2610), ☑ (U+2611), ✓ (U+2713),
// ★ (U+2605), arrows, etc. We keep the high pictographic range as-is and
// allowlist a small set of useful low-range glyphs.
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}]/u;
const SYMBOL_RE = /[\u{2600}-\u{27BF}]/u;
const ALLOWED_LOW_SYMBOLS = new Set([
  '☐', // ☐ ballot box
  '☑', // ☑ ballot box w/check
  '☒', // ☒ ballot box w/X
  '✓', // ✓ check
  '✔', // ✔ heavy check
  '✕', // ✕ multiplication X
  '✖', // ✖ heavy multiplication
  '✘', // ✘ heavy ballot X
  '★', // ★ star
  '☆', // ☆ open star
  '⚫', // ⚫
  '■', // ■
  '□', // □
  '○', // ○
  '●', // ●
  '•', // •
  '→', // →
  '←', // ←
  '↑', // ↑
  '↓', // ↓
  '✿', // ✿ flower (B&W word-problem icon for "flowers" — see BW_ICONS in gen-operations.js)
  '✎', // ✎ pencil glyph (B&W friendly)
]);
// Specific blocked glyphs from earlier feedback (📏⚖️📝📚❌💡🎯)
const KNOWN_EMOJIS = ['\u{1F4CF}', '⚖', '\u{1F4DD}', '\u{1F4DA}', '❌', '\u{1F4A1}', '\u{1F3AF}'];

function runQualityChecks(scan) {
  const issues = [];

  if (!scan.ok) {
    issues.push('printPreviewContent root missing');
    return issues;
  }

  // 1. Truncated labels (regex needles).
  // Match against the global flag so we can iterate every occurrence and
  // print context. Also character-class-test the next char to catch any
  // NBSP/zero-width-character cases that bypass `[a-z]`.
  for (const needle of TRUNCATION_NEEDLES) {
    const reGlobal = new RegExp(needle.source, 'g');
    let mm;
    while ((mm = reGlobal.exec(scan.bodyText)) !== null) {
      const idx = mm.index;
      const after = scan.bodyText.slice(idx + mm[0].length, idx + mm[0].length + 8);
      // Skip if the next char (ignoring any zero-width / NBSP) is a real letter
      const cleanAfter = after.replace(/[​-‍⁠﻿ ]/g, '');
      if (/^[a-zA-Z]/.test(cleanAfter)) continue;
      const ctx = scan.bodyText.slice(Math.max(0, idx - 25), idx + mm[0].length + 25)
        .replace(/\s+/g, ' ');
      issues.push(`Truncated label match: "${mm[0]}" — context: "…${ctx}…"`);
      break;
    }
  }
  // Look for any "..." truncation in headings/labels (text ending mid-word)
  // (heuristic: a label-looking line ending with single ellipsis char)
  const ellipsisLines = scan.bodyText.split(/\n/).filter(l => /…$/.test(l.trim()));
  if (ellipsisLines.length > 0) {
    issues.push(`Possible truncation: ${ellipsisLines.length} lines end with ellipsis`);
  }

  // 2. Emojis in print — high pictographic range
  if (EMOJI_RE.test(scan.bodyText)) {
    const sample = scan.bodyText.match(EMOJI_RE);
    issues.push(`Emoji codepoint detected in print body: ${JSON.stringify(sample?.[0])}`);
  }
  // Symbol range (U+2600..U+27BF): only flag glyphs not on the allow-list
  {
    let m;
    const symRe = new RegExp(SYMBOL_RE.source, 'gu');
    while ((m = symRe.exec(scan.bodyText)) !== null) {
      if (!ALLOWED_LOW_SYMBOLS.has(m[0])) {
        const idx = m.index;
        const ctx = scan.bodyText.slice(Math.max(0, idx - 30), idx + 30).replace(/\s+/g, ' ');
        issues.push(`Disallowed low-range symbol ${JSON.stringify(m[0])} (U+${m[0].codePointAt(0).toString(16).toUpperCase()}) — context: "…${ctx}…"`);
        break; // one is enough to surface
      }
    }
  }
  for (const e of KNOWN_EMOJIS) {
    if (scan.bodyText.includes(e)) {
      issues.push(`Known print-blocked emoji found: ${e}`);
    }
  }

  // 3. <input> elements (should be styled blanks)
  if (scan.inputCount > 0) {
    issues.push(`${scan.inputCount} <input>/<textarea>/<select> in print output (types: ${scan.inputTypes.join(', ')})`);
  }

  // 4. Spoiler patterns
  for (const re of SPOILER_PATTERNS) {
    const m = scan.bodyText.match(re);
    if (m) {
      issues.push(`Spoiler pattern: ${m[0]}`);
    }
  }

  // 5. Color sampling (allow up to 2 samples to be coloured — captions, etc.)
  const nonBlack = scan.colorSamples.filter(s => !isNearBlack(s.color));
  if (nonBlack.length > 2) {
    issues.push(`${nonBlack.length}/${scan.colorSamples.length} text samples are not near-black: ${nonBlack.map(s => s.color).join(', ')}`);
  }

  // 6. Coordinate planes >= 250px when present
  for (const c of scan.coordSizes) {
    if (c.w < 250) {
      issues.push(`Coordinate-plane SVG too narrow: ${c.w}px x ${c.h}px (lines=${c.lines})`);
    }
  }

  // 7. Answer-key page break
  if (scan.pageBreakBeforeAnswerKey !== null) {
    const pb = scan.pageBreakBeforeAnswerKey;
    const ok = pb.inlineHas
      || (pb.computedBreakBefore && /always|page/i.test(pb.computedBreakBefore));
    if (!ok) {
      issues.push(`Answer key not preceded by page-break (inline=${pb.inlineHas}, computed=${pb.computedBreakBefore})`);
    }
  }

  return issues;
}

// ----- scenarios -----------------------------------------------------------
const SCENARIOS = [
  {
    name: 'scenarioA-whole-number-ops',
    title: 'Grade 4 — Whole Number Operations',
    skills: [
      { skillId: 'add_facts' }, { skillId: 'add_facts' },
      { skillId: 'sub_facts' }, { skillId: 'sub_facts' },
      { skillId: 'mult_facts' }, { skillId: 'mult_facts' },
      { skillId: 'div_facts' }, { skillId: 'div_facts' },
    ],
    problemCount: 8,
    columns: 3,
  },
  {
    name: 'scenarioB-fractions',
    title: 'Grade 4 — Fractions',
    skills: [
      { skillId: 'add_fractions_like' }, { skillId: 'add_fractions_like' },
      { skillId: 'sub_fractions_like' }, { skillId: 'sub_fractions_like' },
      { skillId: 'equivalent' }, { skillId: 'equivalent' },
      { skillId: 'simplify' }, { skillId: 'simplify' },
    ],
    problemCount: 8,
    columns: 2,
  },
  {
    name: 'scenarioC-word-problems',
    title: 'Grade 3 — Word Problems',
    skills: [
      { skillId: 'add_word_problems' }, { skillId: 'add_word_problems' },
      { skillId: 'sub_word_problems' }, { skillId: 'sub_word_problems' },
      { skillId: 'mult_word_problems' }, { skillId: 'mult_word_problems' },
      { skillId: 'div_word_problems' }, { skillId: 'div_word_problems' },
    ],
    problemCount: 8,
    columns: 1,
  },
  {
    name: 'scenarioD-geometry',
    title: 'Grade 5 — Geometry',
    skills: [
      { skillId: 'area_perimeter' },
      { skillId: 'area_unit_squares' },
      { skillId: 'area_triangle' },
      { skillId: 'composite_shapes' },
      { skillId: 'classify_quads' },
    ],
    problemCount: 5,
    columns: 1,
  },
  {
    name: 'scenarioE-decimals-place-value',
    title: 'Grade 5 — Decimals & Place Value',
    skills: [
      { skillId: 'identify' },         // place value: name the place
      { skillId: 'value' },            // place value: value of digit
      { skillId: 'nearest_100' },      // rounding to nearest 100
      { skillId: 'round_decimals' },   // round decimals (visual)
      { skillId: 'order_decimals' },   // order decimals
      { skillId: 'add_decimal' },      // adding decimals
      { skillId: 'sub_decimal' },      // subtracting decimals
      { skillId: 'mult_decimal' },     // multiplying decimals
    ],
    problemCount: 8,
    columns: 2,
  },
  {
    name: 'scenarioF-functions-patterns',
    title: 'Grade 5 — Function Tables & Patterns',
    skills: [
      { skillId: 'function_table_easy' },
      { skillId: 'function_table_hard' },
      { skillId: 'function_table_easy' },
      { skillId: 'number_pattern' },
      { skillId: 'shape_pattern' },
    ],
    problemCount: 5,
    columns: 1,
  },
  {
    name: 'scenarioG-volume-area-models',
    title: 'Grade 5 — Composite Volume + Area Models',
    skills: [
      { skillId: 'volume_composite' }, { skillId: 'volume_composite' },
      { skillId: 'area_distributive_visual' }, { skillId: 'area_distributive_visual' },
      { skillId: 'area_model_mult' }, { skillId: 'area_model_mult' },
    ],
    problemCount: 6,
    columns: 1,
  },
  {
    name: 'scenarioH-mixed-map',
    title: 'Grades 3-5 — Mixed (MAP-style)',
    // Pull a mixed bag spanning operations, fractions, geometry, data, algebra.
    skills: [
      { skillId: 'add_facts' }, { skillId: 'sub_facts' },
      { skillId: 'mult_facts' }, { skillId: 'div_facts' },
      { skillId: 'add_fractions_like' }, { skillId: 'simplify' },
      { skillId: 'nearest_100' }, { skillId: 'round_decimals' },
      { skillId: 'area_perimeter' }, { skillId: 'function_table_easy' },
    ],
    problemCount: 10,
    columns: 2,
  },
  {
    name: 'scenarioI-coordinate-planes',
    title: 'Grade 5 — Coordinate Planes (≥250px target)',
    // §4.6: print coordinate planes must be ≥250×250px for legibility.
    // Hits coordinate_q1, coordinate_all, coord_distance_q1, coord_polygon.
    skills: [
      { skillId: 'coordinate_q1' }, { skillId: 'coordinate_q1' },
      { skillId: 'coordinate_all' },
      { skillId: 'coord_distance_q1' }, { skillId: 'coord_distance_q1' },
      { skillId: 'coord_polygon' },
    ],
    problemCount: 6,
    columns: 1,
  },
];

// ----- main -----------------------------------------------------------------
(async () => {
  let browser;
  let exitCode = 0;
  const consoleErrors = [];
  const pageErrors = [];

  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    page.on('console', m => {
      if (m.type() === 'error') consoleErrors.push(`[${m.type()}] ${m.text()}`);
    });
    page.on('pageerror', e => pageErrors.push(e.stack || String(e)));

    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitFor(page, () => typeof window.state === 'object', 10000, 'state');

    // Switch to teacher mode (print system requires teacher UI flow)
    await page.evaluate(() => {
      if (window.setUserRole) window.setUserRole('teacher');
    });
    await new Promise(r => setTimeout(r, 200));

    // Sanity: required globals
    const wired = await page.evaluate(() => ({
      genFromSections: typeof window.generateWorksheetFromSections === 'function',
      domains: typeof window.DOMAINS,
      skills: typeof window.SKILLS,
      getDomainByCategory: typeof window.getDomainByCategory,
    }));
    log('globals wired:', JSON.stringify(wired));
    for (const [k, v] of Object.entries(wired)) {
      if (v === 'undefined' || v === false) {
        throw new Error(`Required global missing: ${k} (${v})`);
      }
    }

    // Run all scenarios
    const results = [];
    for (const sc of SCENARIOS) {
      try {
        const skills = await resolveSkills(page, sc.skills);
        const missing = skills.filter(s => s._missing).map(s => s.skillId);
        if (missing.length) {
          results.push({
            name: sc.name,
            status: 'FAIL',
            issues: [`Unknown skill IDs: ${missing.join(', ')}`],
          });
          log(`  !! ${sc.name}: unknown skills ${missing.join(', ')}`);
          continue;
        }
        const r = await renderScenario(page, sc.name, skills, {
          title: sc.title,
          problemCount: sc.problemCount,
          columns: sc.columns,
        });
        const issues = runQualityChecks(r.scan);
        results.push({
          name: sc.name,
          status: issues.length === 0 ? 'PASS' : 'FAIL',
          issues,
          inputCount: r.scan.inputCount,
          coordSizes: r.scan.coordSizes,
          textBytes: r.scan.bodyText.length,
        });
        log(`  ${issues.length === 0 ? 'PASS' : 'FAIL'} ${sc.name}` +
            (issues.length ? ` — ${issues.length} issue(s)` : ''));
        for (const iss of issues) log(`     · ${iss}`);
      } catch (e) {
        log(`  !! ${sc.name} crashed: ${e.message}`);
        results.push({ name: sc.name, status: 'CRASH', issues: [e.message] });
        // Try to recover
        try {
          await page.evaluate(() => {
            if (window.closePrintPreview) window.closePrintPreview();
            if (window.goHome) window.goHome();
            document.body.style.overflow = '';
          });
        } catch {}
      }
    }

    // ---- Summary ----
    log('');
    log('======== SUMMARY ========');
    let passCount = 0;
    for (const r of results) {
      const tag = r.status === 'PASS' ? 'PASS ' : r.status === 'FAIL' ? 'FAIL ' : 'CRASH';
      log(`${tag} ${r.name}` +
          (r.issues && r.issues.length ? ` — ${r.issues.length} issue(s)` : '') +
          (typeof r.inputCount === 'number' ? ` [inputs=${r.inputCount}, textBytes=${r.textBytes}]` : ''));
      if (r.issues && r.issues.length) {
        for (const iss of r.issues) log(`       · ${iss}`);
      }
      if (r.status === 'PASS') passCount++;
    }
    log(`-------- ${passCount}/${results.length} scenarios PASS --------`);

    const realErrors = consoleErrors.filter(e =>
      !/favicon\.ico/.test(e) &&
      !/Failed to load resource: the server responded with a status of 404/.test(e)
    );
    if (realErrors.length) {
      log('Console errors (filtered):');
      realErrors.slice(0, 12).forEach(e => log('  ', e));
    }
    if (pageErrors.length) {
      log('Page errors:');
      pageErrors.slice(0, 8).forEach(e => log('  ', e));
      exitCode = 3;
    }
    if (passCount < results.length) exitCode = 2;
  } catch (e) {
    log('!!! CRASH:', e.stack || e.message);
    exitCode = 1;
  } finally {
    if (browser) await browser.close();
    process.exit(exitCode);
  }
})();
