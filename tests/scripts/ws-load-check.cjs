// Site capacity check: how heavy is a cold first load, and does a pupil's practice session call
// anything outside the page?  (design/audit/LOAD_CHECK.md has the measured numbers.)
//
//   node tests/scripts/ws-load-check.cjs                 # serves the repo itself, cold cache
//   node tests/scripts/ws-load-check.cjs --slow-cdn 8000 # hold every cdn.jsdelivr.net request 8 s; prints time to ready
//   node tests/scripts/ws-load-check.cjs --root <dir>    # serve another checkout (e.g. a worktree of an older commit)
//   node tests/scripts/ws-load-check.cjs --ready-only   # stop after the time-to-ready line (older trees lack the practice hooks)
//   node tests/scripts/ws-load-check.cjs --self-test     # negative probes: the gate must FAIL for each (see below)
//
// Prints requests and bytes for the cold load of index.html (local files, gzip-estimated; the
// third-party CDN files are listed apart, as they are not served by GitHub Pages). Then a practice
// session as a pupil plays it: five questions, each answered with the right answer typed into
// #answerInput and submitted through window.submitAnswer() (score, XP, progress and the
// session record all run); one online worksheet filled in and checked with checkAllWorksheet();
// and endGame() (saves the session). Every request is recorded at the moment it STARTS
// (page.on('request')) with the phase it started in, so a request that never finishes still counts.
// Exits 1 on any request in the practice phase to another origin (fetch / XHR / beacon / image /
// script), finished or not, and on any step that does not do what it claims; 0 otherwise.
//
// Probes (--probe <name>, used by --self-test): `fetch` runs fetch('https://fonts.gstatic.com/probe-fetch') during
// practice (an origin the page's CSP allows: example.invalid is refused by the CSP before any request starts); `hang` fetches a jsdelivr URL that the interceptor never answers. Both must give FAIL.
const zlib = require('zlib');
const { spawnSync } = require('child_process');
const A = process.argv;
const arg = (k, d) => { const i = A.indexOf('--' + k); return i > -1 ? A[i + 1] : d; };
const has = k => A.includes('--' + k);
if (arg('root')) process.env.MQ_ROOT = arg('root');

if (has('self-test')) {
    let allOk = true;
    for (const probe of ['fetch', 'hang']) {
        const r = spawnSync(process.execPath, [__filename, '--probe', probe], { encoding: 'utf8' });
        const failed = r.status === 1 && /ws-load-check: FAIL/.test(r.stdout) && /EXTERN/.test(r.stdout);
        console.log(`self-test probe ${probe}: gate ${failed ? 'FAILED as it must (exit 1)' : 'DID NOT FAIL (exit ' + r.status + ')'}`);
        if (!failed) allOk = false;
    }
    const clean = spawnSync(process.execPath, [__filename], { encoding: 'utf8' });
    const cleanOk = clean.status === 0 && /ws-load-check: OK/.test(clean.stdout);
    console.log(`self-test no probe: gate ${cleanOk ? 'OK' : 'FAILED (exit ' + clean.status + ')'}`);
    console.log(allOk && cleanOk ? 'ws-load-check --self-test: OK' : 'ws-load-check --self-test: FAIL');
    process.exit(allOk && cleanOk ? 0 : 1);
}

const puppeteer = require('puppeteer');
const { startServer, chromePath } = require('../lib/ws-harness.cjs');

const kb = n => (n / 1024).toFixed(1) + ' KB';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SLOW = parseInt(arg('slow-cdn', '0'), 10) || 0;
const PROBE = arg('probe', '');

(async () => {
    const { server, base } = await startServer();
    const browser = await puppeteer.launch({ headless: true, executablePath: chromePath(), args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setCacheEnabled(false);
    await page.evaluateOnNewDocument(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) {} });
    let phase = 'load';
    const seen = [];   // every request, recorded when it starts, tagged with the phase it started in
    const reqs = [];   // finished responses, for byte counts only
    await page.setRequestInterception(true);
    page.on('request', (r) => {
        const url = r.url();
        seen.push({ url, local: url.startsWith(base), phase });
        if (/never-answers/.test(url)) return;                                  // probe: never continue
        if (SLOW && /cdn\.jsdelivr\.net/.test(url)) { setTimeout(() => r.continue().catch(() => {}), SLOW); return; }
        r.continue().catch(() => {});
    });
    page.on('response', async (res) => {
        const url = res.url();
        const local = url.startsWith(base);
        let buf = null;
        try { buf = await res.buffer(); } catch (e) { /* redirect or streamed */ }
        const raw = buf ? buf.length : 0;
        const gz = local && buf && /javascript|css|html|json|svg|text/.test(res.headers()['content-type'] || '') ? zlib.gzipSync(buf).length : raw;
        reqs.push({ url, local, raw, gz, type: res.request().resourceType(), status: res.status() });
    });
    page.on('requestfailed', r => reqs.push({ url: r.url(), local: r.url().startsWith(base), raw: 0, gz: 0, type: r.resourceType(), status: 'FAILED ' + (r.failure() && r.failure().errorText) }));
    const problems = [];
    page.on('pageerror', e => problems.push('pageerror: ' + e.message));

    const t0 = Date.now();
    const nav = page.goto(base + '/index.html', { waitUntil: 'networkidle0', timeout: 120000 });
    nav.catch(() => {});
    await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 120000, polling: 50 });
    const readyMs = Date.now() - t0;
    await nav;
    if (has('ready-only')) {
        console.log(`time to app ready (window.generateQuestion exists): ${readyMs} ms${SLOW ? ` with every cdn.jsdelivr.net request held ${SLOW} ms` : ''}`);
        await browser.close().catch(() => {}); await new Promise(r => server.close(r));
        console.log('ws-load-check --ready-only: done'); return;
    }
    const loadReqs = reqs.slice();
    phase = 'play';

    // ---- practice: five questions answered through submitAnswer ----
    const scoreOf = () => page.evaluate(() => window.state.score || 0);
    const steps = [];
    await page.evaluate(() => {
        const st = window.state; st.quizMode = false; st.category = 'addition'; st.skill = 'add'; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
        window.showView('gameView');
    });
    const score0 = await scoreOf();
    let submits = 0;
    for (let i = 0; i < 5; i++) {
        const ok = await page.evaluate(() => {
            const st = window.state; st.hasAnswered = false; st.currentQ = window.generateQuestion(); window.renderQuestion();
            const inp = document.getElementById('answerInput');
            if (!inp || st.currentQ.answerType !== 'number') return false;
            inp.value = String(st.currentQ.ans);
            window.submitAnswer();
            return true;
        });
        if (ok) submits++;
        await sleep(450);
    }
    const score1 = await scoreOf();
    steps.push(`practice: ${submits} answers submitted through submitAnswer(), score ${score0} -> ${score1}`);
    if (submits !== 5 || score1 - score0 !== 5) problems.push(`practice: expected 5 submits and a score rise of 5, got ${submits} submits, ${score1 - score0}`);

    // ---- one online worksheet, filled in with the right answers and checked ----
    await page.evaluate(() => {
        const st = window.state; st.category = 'addition'; st.skill = 'add'; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 3;
        window.initWorksheet();
    });
    await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !!g && g.dataset.mqLaidOut === '1'; }, { timeout: 30000 });
    const filled = await page.evaluate(() => {
        let n = 0;
        window.state.worksheetQs.forEach((q, i) => {
            const card = document.getElementById(`ws_card_${i}`); if (!card) return;
            const digits = Array.from(card.querySelectorAll('input[data-ws-slot^="ans-"]'));
            const set = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
            if (digits.length) { const s = String(q.ans).split('').reverse(); digits.sort((a, b) => a.dataset.wsSlot.localeCompare(b.dataset.wsSlot, undefined, { numeric: true })); digits.forEach((d, j) => set(d, s[j] || '')); n++; }
            else { const inp = card.querySelector('input'); if (inp) { set(inp, String(q.ans)); n++; } }
        });
        return n;
    });
    const wsRes = await page.evaluate(() => { window.checkAllWorksheet(); return document.getElementById('worksheetResult').textContent.replace(/\s+/g, ' ').trim(); });
    const m = wsRes.match(/Score:\s*(\d+)\/(\d+)/);
    steps.push(`worksheet: ${filled} cards filled, check button: ${m ? m[0] : wsRes}`);
    if (!m || m[1] !== m[2] || !+m[2] || filled !== +m[2]) problems.push(`worksheet: not all marked correct (${wsRes}, ${filled} filled)`);

    // ---- end the session (saves the session record) ----
    const saved = await page.evaluate(() => {
        const n0 = (window.state.sessionHistory || []).length;
        window.state.gameMode = 'practice';
        window.endGame(true, 'load check');
        return { n0, n1: (window.state.sessionHistory || []).length };
    });
    steps.push(`endGame: session history ${saved.n0} -> ${saved.n1} entries`);
    if (saved.n1 !== saved.n0 + 1) problems.push('endGame: no session record was saved');

    // ---- negative probes (only with --probe) ----
    if (PROBE === 'fetch') await page.evaluate(() => { fetch('https://fonts.gstatic.com/probe-fetch').catch(() => {}); });
    if (PROBE === 'hang') await page.evaluate(() => { fetch('https://cdn.jsdelivr.net/npm/never-answers.js').catch(() => {}); });
    await sleep(1500);

    const play = seen.filter(r => r.phase === 'play');
    const local = loadReqs.filter(r => r.local);
    const ext = loadReqs.filter(r => !r.local && !/^(data|blob):/.test(r.url));
    const sum = (a, k) => a.reduce((s, r) => s + (r[k] || 0), 0);
    const byType = {};
    local.forEach(r => { byType[r.type] = byType[r.type] || { n: 0, raw: 0, gz: 0 }; byType[r.type].n++; byType[r.type].raw += r.raw; byType[r.type].gz += r.gz; });
    console.log(`time to app ready (window.generateQuestion exists): ${readyMs} ms${SLOW ? ` with every cdn.jsdelivr.net request held ${SLOW} ms` : ' (unthrottled, local server)'}`);
    console.log(`local (GitHub Pages) : ${local.length} requests, ${kb(sum(local, 'raw'))} raw, ~${kb(sum(local, 'gz'))} gzip`);
    Object.entries(byType).sort((a, b) => b[1].raw - a[1].raw).forEach(([t, v]) => console.log(`   ${t.padEnd(12)} ${String(v.n).padStart(4)} req  ${kb(v.raw).padStart(10)} raw  ~${kb(v.gz).padStart(10)} gzip`));
    console.log('largest local files:');
    local.slice().sort((a, b) => b.raw - a.raw).slice(0, 8).forEach(r => console.log(`   ${kb(r.raw).padStart(10)}  ${r.url.replace(base, '')}`));
    console.log(`third-party at load  : ${ext.length} requests`);
    ext.forEach(r => console.log(`   ${String(r.status).padEnd(10)} ${kb(r.raw).padStart(9)}  ${r.url}`));
    steps.forEach(s => console.log('   ' + s));
    const bad = play.filter(r => !r.local && !/^(data|blob):/.test(r.url));
    console.log(`after load, during practice: ${play.length} requests started, ${bad.length} to another origin`);
    play.forEach(r => console.log(`   ${r.local ? 'local ' : 'EXTERN'} ${r.url}`));
    problems.forEach(p => console.log('   PROBLEM ' + p));
    await browser.close().catch(() => {}); await new Promise(r => server.close(r));
    if (bad.length || problems.length) { console.log('ws-load-check: FAIL'); process.exit(1); }
    console.log('ws-load-check: OK');
})().catch(e => { console.error(e); console.log('ws-load-check: FAIL'); process.exit(1); });
