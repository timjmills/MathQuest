// Layout snapshot tool: cycles through ~15 representative skills,
// triggers each through the real app, and screenshots at 1280x600.
//
// Usage: node test-layout-snapshot.cjs <before|after>
//
// Outputs: test-layout-screenshots/<dir>/<skill>.png plus a JSON report

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PHASE = (process.argv[2] || 'before').toLowerCase();
const OUT_DIR = path.join(__dirname, 'test-layout-screenshots', PHASE);
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE = 'http://localhost:8080/index.html';
const VW = 1280, VH = 600;

// 15 representative skills covering each category / widget type
const SKILLS = [
  { id: 'bar_graph',          category: 'graphs' },
  { id: 'pictograph',         category: 'graphs' },
  { id: 'line_plot',          category: 'graphs' },
  { id: 'tally_chart',        category: 'graphs' },
  { id: 'number_line_add',    category: 'addition' },
  { id: 'fraction_number_line', category: 'composing' },
  { id: 'time_hour',          category: 'measurement' },
  { id: 'elapsed_visual_easy', category: 'measurement' },
  { id: 'identify',           category: 'fractions' },
  { id: 'place_value_disks',  category: 'place_value' },
  { id: 'area_unit_squares',  category: 'area_perimeter' },
  { id: 'perimeter_grid',     category: 'area_perimeter' },
  { id: 'coordinate_q1',      category: 'coordinates' },
  { id: 'count_objects',      category: 'counting' },
  { id: 'divisibility_sort',  category: 'number_theory' },
];

const report = { phase: PHASE, viewport: `${VW}x${VH}`, skills: [] };

async function shoot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
}

async function trigger(page, skill) {
  // Force the question rendering pipeline directly.
  // Returns whatever the renderer generated, plus measured dims.
  return await page.evaluate(async (sk) => {
    try {
      // Reset visual aid first to ensure no stale render
      const visualAidEl = document.getElementById('visualAid');
      if (visualAidEl) visualAidEl.innerHTML = '';
      const qTextEl = document.getElementById('questionText');
      if (qTextEl) qTextEl.innerHTML = '';
      const ansOptsEl = document.getElementById('answerOptions');
      if (ansOptsEl) ansOptsEl.innerHTML = '';

      // Configure state
      const state = window.state;
      if (!state) return { ok: false, err: 'no state' };
      state.skill = sk.id;
      state.category = sk.category;
      state.gameMode = 'practice';
      state.range = 100;
      state.decimalPlaces = 0;
      state.questionCount = 1;
      state.timer = 0;
      state.score = 0;
      state.totalQuestions = 1;
      state.questionNumber = 1;
      state.selectedNumbers = state.selectedNumbers && state.selectedNumbers.length ? state.selectedNumbers : [2,3,4,5,6,7,8,9,10];

      // Generate the question via the dispatcher
      let q = null;
      try { q = window.generateQuestion(); } catch (e) { return { ok: false, err: 'gen: ' + e.message }; }
      if (!q) return { ok: false, err: 'no question' };

      // Place question in shared state where renderer reads it
      state.currentQ = q;
      state.qCount = 1;

      // Show the game view
      if (typeof window.showView === 'function') {
        window.showView('gameView');
      }

      // Render via question-render (reads state.currentQ)
      if (typeof window.renderQuestion === 'function') {
        try { window.renderQuestion(); } catch (e) { return { ok: false, err: 'render: ' + e.message }; }
      } else {
        return { ok: false, err: 'no renderQuestion' };
      }

      // Allow layout to settle
      await new Promise(r => setTimeout(r, 250));

      // Measure
      const card = document.querySelector('#questionCard');
      // Submit is whichever button looks like submit/check
      const submit = Array.from(document.querySelectorAll('button')).find(b => {
        const txt = (b.textContent || '').trim().toLowerCase();
        return /^(submit|check|next|check placement|check answer)$/i.test(txt) ||
               (b.getAttribute('onclick') || '').includes('submitAnswer');
      });
      const visualEl = document.querySelector('#visualAid');
      const visualSvg = document.querySelector('#visualAid svg');
      const opts = document.querySelector('#answerOptions') || document.querySelector('.options-container, .multi-select, .msc-grid, .answer-options-grid');

      const docW = document.documentElement.scrollWidth;
      const docH = document.documentElement.scrollHeight;
      const innerW = window.innerWidth;
      const innerH = window.innerHeight;

      // Convert DOMRect to plain object so it survives JSON serialization
      const rectOf = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left };
      };
      const cardRect = rectOf(card);
      const visualRect = rectOf(visualEl);
      const visualSvgRect = rectOf(visualSvg);
      const optsRect = rectOf(opts);
      const submitRect = rectOf(submit);

      return {
        ok: true,
        text: q.text,
        answerType: q.answerType,
        hasVisual: !!q.visual,
        docW, docH, innerW, innerH,
        cardRect, visualRect, visualSvgRect, optsRect, submitRect,
        horizontalScroll: docW > innerW,
        submitVisible: submitRect ? (submitRect.bottom <= innerH && submitRect.top >= 0) : null,
      };
    } catch (e) {
      return { ok: false, err: e.message };
    }
  }, skill);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: VW, height: VH },
  });
  const page = await browser.newPage();
  await page.setViewport({ width: VW, height: VH });

  page.on('pageerror', e => console.log('  PAGEERROR:', e.message));

  console.log(`=== Layout snapshot phase=${PHASE} viewport=${VW}x${VH} ===`);
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
  // Wait for module bootstrap
  await page.waitForFunction(() => typeof window.generateQuestion === 'function' && typeof window.renderQuestion === 'function', { timeout: 15000 });

  // Mark teacher mode so all skills are accessible
  await page.evaluate(() => {
    if (typeof window.state !== 'undefined') window.state.userRole = 'teacher';
  });

  for (const sk of SKILLS) {
    process.stdout.write(`  ${sk.id.padEnd(24)} ... `);
    let r = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      r = await trigger(page, sk);
      if (r.ok) break;
    }
    if (!r.ok) {
      console.log(`FAIL (${r.err})`);
      report.skills.push({ id: sk.id, ok: false, err: r.err });
      continue;
    }
    await shoot(page, sk.id);
    const hScroll = r.horizontalScroll ? ' [HSCROLL]' : '';
    const sub = r.submitVisible === false ? ' [SUBMIT-HIDDEN]' : '';
    console.log(`ok  doc=${r.docW}x${r.docH}  type=${r.answerType}${hScroll}${sub}`);
    report.skills.push({
      id: sk.id, ok: true, answerType: r.answerType,
      docW: r.docW, docH: r.docH,
      visualW: r.visualRect ? Math.round(r.visualRect.width) : null,
      visualH: r.visualRect ? Math.round(r.visualRect.height) : null,
      svgW: r.visualSvgRect ? Math.round(r.visualSvgRect.width) : null,
      svgH: r.visualSvgRect ? Math.round(r.visualSvgRect.height) : null,
      cardW: r.cardRect ? Math.round(r.cardRect.width) : null,
      cardH: r.cardRect ? Math.round(r.cardRect.height) : null,
      optsW: r.optsRect ? Math.round(r.optsRect.width) : null,
      optsH: r.optsRect ? Math.round(r.optsRect.height) : null,
      submitVisible: r.submitVisible,
      hScroll: r.horizontalScroll,
    });
  }

  fs.writeFileSync(path.join(OUT_DIR, '_report.json'), JSON.stringify(report, null, 2));
  console.log(`\nReport saved: ${path.join(OUT_DIR, '_report.json')}`);

  await browser.close();
})();
