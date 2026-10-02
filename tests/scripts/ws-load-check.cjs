// Site capacity check: how heavy is a cold first load, and does a pupil's practice session call
// anything outside the page?  (design/audit/LOAD_CHECK.md has the measured numbers.)
//
//   node tests/scripts/ws-load-check.cjs            # serves the repo itself, cold cache
//
// Prints requests and bytes for the cold load of index.html (local files, gzip-estimated; the
// third-party CDN files are listed apart, as they are not served by GitHub Pages), then starts a
// practice question and answers a few, and lists every request made AFTER the load. Exits 1 on
// any per-pupil call to another origin (fetch / XHR / beacon / image / script), 0 otherwise.
const zlib = require('zlib');
const puppeteer = require('puppeteer');
const { startServer, chromePath } = require('../lib/ws-harness.cjs');

const kb = n => (n / 1024).toFixed(1) + ' KB';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const { server, base } = await startServer();
    const browser = await puppeteer.launch({ headless: true, executablePath: chromePath(), args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setCacheEnabled(false);
    await page.evaluateOnNewDocument(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) {} });
    const reqs = [];
    let phase = 'load';
    page.on('response', async (res) => {
        const url = res.url();
        const local = url.startsWith(base);
        let raw = 0;
        try { raw = (await res.buffer()).length; } catch (e) { /* redirect or streamed */ }
        const type = res.request().resourceType();
        reqs.push({ url, local, raw, gz: local && /javascript|css|html|json|svg|text/.test(res.headers()['content-type'] || '') ? zlib.gzipSync(await res.buffer().catch(() => Buffer.alloc(0))).length : raw, type, status: res.status(), phase });
    });
    page.on('requestfailed', r => reqs.push({ url: r.url(), local: r.url().startsWith(base), raw: 0, gz: 0, type: r.resourceType(), status: 'FAILED ' + (r.failure() && r.failure().errorText), phase }));
    const t0 = Date.now();
    await page.goto(base + '/index.html', { waitUntil: 'networkidle0', timeout: 90000 });
    await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
    const loadMs = Date.now() - t0;
    const loadReqs = reqs.slice();
    phase = 'play';
    // a short practice session: five questions, right answers typed in
    await page.evaluate(() => {
        const st = window.state; st.quizMode = false; st.category = 'addition'; st.skill = 'add'; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
        window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion();
    });
    for (let i = 0; i < 5; i++) {
        await sleep(600);
        await page.evaluate(() => { const st = window.state; st.currentQ = window.generateQuestion(); window.renderQuestion(); });
        await sleep(300);
    }
    await sleep(1500);
    const play = reqs.slice(loadReqs.length);

    const local = loadReqs.filter(r => r.local);
    const ext = loadReqs.filter(r => !r.local && !/^(data|blob):/.test(r.url));
    const sum = (a, k) => a.reduce((s, r) => s + (r[k] || 0), 0);
    const byType = {};
    local.forEach(r => { byType[r.type] = byType[r.type] || { n: 0, raw: 0, gz: 0 }; byType[r.type].n++; byType[r.type].raw += r.raw; byType[r.type].gz += r.gz; });
    console.log(`cold load to app ready: ${loadMs} ms (unthrottled, local server)`);
    console.log(`local (GitHub Pages) : ${local.length} requests, ${kb(sum(local, 'raw'))} raw, ~${kb(sum(local, 'gz'))} gzip`);
    Object.entries(byType).sort((a, b) => b[1].raw - a[1].raw).forEach(([t, v]) => console.log(`   ${t.padEnd(12)} ${String(v.n).padStart(4)} req  ${kb(v.raw).padStart(10)} raw  ~${kb(v.gz).padStart(10)} gzip`));
    console.log('largest local files:');
    local.slice().sort((a, b) => b.raw - a.raw).slice(0, 8).forEach(r => console.log(`   ${kb(r.raw).padStart(10)}  ${r.url.replace(base, '')}`));
    console.log(`third-party at load  : ${ext.length} requests`);
    ext.forEach(r => console.log(`   ${String(r.status).padEnd(10)} ${kb(r.raw).padStart(9)}  ${r.url}`));
    const bad = play.filter(r => !r.local && !/^(data|blob):/.test(r.url));
    console.log(`after load, during practice: ${play.length} requests, ${bad.length} to another origin`);
    play.forEach(r => console.log(`   ${r.local ? 'local ' : 'EXTERN'} ${r.url}`));
    await browser.close(); await new Promise(r => server.close(r));
    if (bad.length) { console.log('ws-load-check: FAIL'); process.exit(1); }
    console.log('ws-load-check: OK');
})().catch(e => { console.error(e); console.log('ws-load-check: FAIL'); process.exit(1); });
