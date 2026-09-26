// Shared harness for the worksheet-standard ("ws-") tests.
//   - serves the repo itself (no external server; MQ_BASE overrides)
//   - optional seeded Math.random so a render is reproducible
//   - collects console / page errors
//   - renders one skill on the PRINT surface or the on-screen QUESTION CARD
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..', '..');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8',
};

function startServer(port = 0) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let rel = decodeURIComponent(req.url.split('?')[0]);
      if (rel.endsWith('/')) rel += 'index.html';
      const file = path.normalize(path.join(ROOT, rel));
      if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); return res.end('not found'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(buf);
      });
    });
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => resolve({ server, base: `http://127.0.0.1:${server.address().port}` }));
  });
}

// Puppeteer's own Chrome download is not present in cloud containers; fall back to the
// preinstalled Playwright Chromium when PUPPETEER_EXECUTABLE_PATH is not set.
function chromePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const root = '/opt/pw-browsers';
  try {
    for (const d of fs.readdirSync(root).filter(n => /^chromium-\d+$/.test(n)).sort().reverse()) {
      const exe = path.join(root, d, 'chrome-linux', 'chrome');
      if (fs.existsSync(exe)) return exe;
    }
  } catch (e) { /* no preinstalled browser: let puppeteer find its own */ }
  return undefined;
}

// mulberry32, installed before any page script runs
function seedScript(seed) {
  return `(() => { let a = ${seed >>> 0}; window.__wsReseed = n => { a = n >>> 0; }; Math.random = function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`;
}

async function open({ seed = null, viewport = { width: 1280, height: 900, deviceScaleFactor: 2 }, pagePath = '/index.html' } = {}) {
  let server = null;
  let base = process.env.MQ_BASE ? process.env.MQ_BASE.replace(/\/index\.html$/, '').replace(/\/$/, '') : null;
  if (!base) ({ server, base } = await startServer());
  const browser = await puppeteer.launch({ headless: true, executablePath: chromePath(), args: ['--no-sandbox', '--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const problems = [];
  page.on('pageerror', e => problems.push({ type: 'pageerror', text: e.message }));
  page.on('console', m => { if (m.type() === 'error') problems.push({ type: 'console.error', text: m.text() }); });
  // An ABORTED request is not a failure: a preview iframe rebuilt while its fonts were still
  // loading cancels them (net::ERR_ABORTED). Anything else (404, refused) is reported.
  page.on('requestfailed', r => {
    if (!r.url().startsWith(base)) return;
    const why = (r.failure() && r.failure().errorText) || '';
    if (/ERR_ABORTED/.test(why)) return;
    problems.push({ type: 'requestfailed', text: `${r.url()}${why ? ` (${why})` : ''}` });
  });
  if (seed !== null) await page.evaluateOnNewDocument(seedScript(seed));
  // Returning-user flags so first-run overlays do not cover the app
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) {} });
  await page.goto(base + pagePath, { waitUntil: 'networkidle2', timeout: 60000 });
  await waitFor(page, () => typeof window.generateQuestion === 'function' && !!window.SKILLS, 30000, 'app boot');
  await page.evaluate(() => document.fonts && document.fonts.ready);
  const close = async () => { await browser.close(); if (server) await new Promise(r => server.close(r)); };
  return { browser, page, base, problems, close };
}

async function waitFor(page, fn, timeout = 15000, label = 'condition') {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (await page.evaluate(fn)) return true; } catch (e) { /* page still loading */ }
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error(`Timeout waiting for ${label}`);
}

// Every selectable skill with its category, label and grade.
function listSkills(page) {
  return page.evaluate(() => {
    const out = [];
    for (const [categoryId, skills] of Object.entries(window.SKILLS)) {
      if (!Array.isArray(skills)) continue;
      for (const s of skills) out.push({ categoryId, skillId: s.v, label: s.l, grade: window.getSkillGrade ? String(window.getSkillGrade(s.v, categoryId)) : '' });
    }
    return out;
  });
}

// PRINT surface: one section of one skill through the live print pipeline. Returns the
// worksheet HTML host selector once populated.
async function renderPrint(page, skill, { problemCount = 6, columns = 0, title = null, includeAnswerKey = false } = {}) {
  await page.evaluate(() => {
    const el = document.getElementById('printPreviewContent');
    if (el) el.replaceChildren();
  });
  const err = await page.evaluate(async ({ skill, problemCount, columns, title, includeAnswerKey }) => {
    try {
      const dom = window.DOMAINS[window.getDomainByCategory(skill.categoryId)];
      const cat = dom && dom.categories ? dom.categories.find(c => c.id === skill.categoryId) : null;
      const sections = [{
        label: title || skill.label, columns, problemCount, countMode: 'problems', pageCount: 1, groupByType: false,
        skills: [{ categoryId: skill.categoryId, skillId: skill.skillId, skillLabel: skill.label, categoryIcon: '', categoryName: cat ? cat.name : skill.categoryId, domainColor: '#000', percent: 100, weight: 100 }],
      }];
      await window.generateWorksheetFromSections(sections, 1, title || skill.label, 'color', includeAnswerKey, false, true);
      return null;
    } catch (e) { return e.message || String(e); }
  }, { skill, problemCount, columns, title, includeAnswerKey });
  if (err) throw new Error(`print render failed: ${err}`);
  await waitFor(page, () => {
    const el = document.getElementById('printPreviewContent');
    return el && el.innerHTML.length > 200 && !/Generating worksheet/.test(el.innerHTML);
  }, 30000, 'print preview');
  await hideOverlays(page, { keepPreview: true });
  await new Promise(r => setTimeout(r, 250));
  return '#printPreviewContent';
}

// The print dialog and preview are overlays; closePrintPreview() re-opens the dialog, so the
// harness hides them directly instead.
function hideOverlays(page, { keepPreview = false } = {}) {
  return page.evaluate((keepPreview) => {
    const hide = id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };
    hide('simplePrintModal');
    hide('printProgressOverlay');
    if (!keepPreview) hide('printPreviewContainer');
    document.body.style.overflow = '';
  }, keepPreview);
}

// SCREEN surface: the real game question card for one generated question.
async function renderScreen(page, skill, { range = 100, decimals = 0 } = {}) {
  await hideOverlays(page);
  const info = await page.evaluate(({ skill, range, decimals }) => {
    try {
      const st = window.state;
      st.category = skill.categoryId; st.skill = skill.skillId; st.range = range; st.decimalPlaces = decimals;
      st.gameMode = 'practice'; st.isMixedMode = false;
      if (window.showView) window.showView('gameView');
      const q = window.generateQuestion();
      if (!q || (!q.text && !q.visual)) return { error: 'empty question' };
      st.currentQ = q;
      window.renderQuestion();
      return { printFormat: q.printFormat || '', answerType: q.answerType || '', hasVisual: !!q.visual, text: String(q.text || '').slice(0, 160) };
    } catch (e) { return { error: e.message || String(e) }; }
  }, { skill, range, decimals });
  if (info.error) throw new Error(`screen render failed: ${info.error}`);
  await new Promise(r => setTimeout(r, 250));
  return { selector: '#questionCard', info };
}

async function shoot(page, selector, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const el = await page.$(selector);
  if (!el) throw new Error(`no element ${selector}`);
  await el.screenshot({ path: file });
}

module.exports = { ROOT, chromePath, startServer, open, waitFor, listSkills, renderPrint, renderScreen, hideOverlays, shoot };
