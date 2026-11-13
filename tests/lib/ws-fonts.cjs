// ws-fonts — wait for the web fonts a browser gate asserts, before it asserts them (lf-checks 2026-11-13).
//
// The race: a gate set its sheet with setContent(..., networkidle0), awaited document.fonts.ready and called
// document.fonts.check('700 28px Andika'). Under parallel load the face can still be unloaded at that moment (a face is
// fetched only once text uses it, and fonts.ready resolves on what was pending when it was read), so the check read
// false and the gate reported a PAGE FAIL (ws-detailed-lesson E2 on g2-nbt3, g3-oa8, g4-nbt1) on byte-identical HTML.
//
// The fix, in one place: before any font check, `document.fonts.load()` every face the check asserts, with a bounded
// retry (3 tries over about 10 s), then `document.fonts.ready`. The verdict separates two cases:
//   - the page DECLARES no matching @font-face            -> a page defect (the gate's own FAIL stands);
//   - the face is declared but never loads after the retry -> an ENVIRONMENT problem: the gate reports ERROR, not FAIL.
//
//   const F = require('../lib/ws-fonts.cjs');
//   const f = await F.awaitFonts(page);                     // default faces: Andika 400 + 700
//   if (F.isEnvError(f)) { console.log(`<gate>: ERROR (fonts) ${F.describe(f)}`); process.exit(2); }
//   page.evaluate(F.inPageAwaitFonts, opts)                 // the in-page function, for frames / custom evaluate
//
//   node tests/lib/ws-fonts.cjs --probe <fixture.html> [--old] [--delay ms]
//        serve the repo, open the fixture over HTTP (woff2 files held back `--delay` ms, default 2500), print
//        `ws-fonts: OK` / `ws-fonts: FAIL` (no face declared, or --old: the pre-fix one-shot check read false) or
//        `ws-fonts: ERROR ...` (exit 2: declared, never loaded). The backtest rows fonts-late / fonts-never use it.
//   node tests/lib/ws-fonts.cjs --self-test     both fixtures, old and new code (browser)
const path = require('path');

const DEFAULT_FACES = ['700 1em Andika', '400 1em Andika'];

/** In-page: load every face, retry, then fonts.ready. Self-contained (it is serialised by page.evaluate). */
async function inPageAwaitFonts(opts) {
    const o = Object.assign({ faces: ['700 1em Andika', '400 1em Andika'], tries: 3, totalMs: 10000 }, opts || {});
    const d = (o.frameSelector && document.querySelector(o.frameSelector) && document.querySelector(o.frameSelector).contentDocument) || document;
    const fs = d.fonts;
    const t0 = Date.now();
    if (!fs) return { ok: false, declared: false, faces: o.faces.map((face) => ({ face, declared: false, loaded: false })), tries: 0, ms: 0, why: 'no document.fonts' };
    const parse = (face) => {
        const m = String(face).match(/^\s*(?:(normal|italic)\s+)?(\d{3}|normal|bold)?\s*[\d.]+(?:px|em|rem|pt)\s+["']?([^"',]+)["']?/i) || [];
        const w = { normal: 400, bold: 700 }[String(m[2] || 'normal').toLowerCase()] || Number(m[2]) || 400;
        return { weight: w, family: String(m[3] || '').trim().toLowerCase() };
    };
    const wOk = (fw, w) => { const s = String(fw).toLowerCase().replace('normal', '400').replace('bold', '700').split(/\s+/).map(Number);
        return s.length > 1 ? (w >= s[0] && w <= s[1]) : s[0] === w; };
    const matching = (face) => { const p = parse(face); return [...fs].filter((f) => String(f.family).replace(/["']/g, '').trim().toLowerCase() === p.family && wOk(f.weight, p.weight)); };
    const state = () => o.faces.map((face) => { const m = matching(face);
        let chk = false; try { chk = fs.check(face); } catch (e) { /* bad descriptor */ }
        return { face, declared: m.length > 0, loaded: m.length > 0 && chk && m.some((f) => f.status === 'loaded'), status: m.map((f) => f.status).join('/') || 'none' }; });
    const per = Math.max(500, Math.floor(o.totalMs / o.tries));
    let tries = 0, st = state();
    while (tries < o.tries && !st.every((x) => x.loaded)) {
        tries++;
        const t1 = Date.now();
        const loads = Promise.all(o.faces.map((face) => fs.load(face).catch(() => [])));
        await Promise.race([loads, new Promise((r) => setTimeout(r, per))]);
        st = state();
        // a load that settled early without the face (an errored or missing file): wait out the try before the next one
        if (!st.every((x) => x.loaded) && tries < o.tries) await new Promise((r) => setTimeout(r, Math.max(0, per - (Date.now() - t1))));
    }
    await Promise.race([fs.ready, new Promise((r) => setTimeout(r, 2000))]);
    st = state();
    return { ok: st.every((x) => x.loaded), declared: st.every((x) => x.declared), faces: st, tries, ms: Date.now() - t0 };
}

/** Node wrapper: `page` is a puppeteer Page (or Frame). */
async function awaitFonts(page, opts = {}) {
    try { return await page.evaluate(inPageAwaitFonts, Object.assign({ faces: DEFAULT_FACES }, opts)); }
    catch (e) { return { ok: false, declared: true, faces: [], tries: 0, ms: 0, why: `evaluate failed: ${(e && e.message) || e}` }; }
}

/** Declared but never loaded: an environment problem, never a page FAIL. */
const isEnvError = (r) => !!r && !r.ok && (r.declared || !!r.why);
const describe = (r) => (r && r.faces ? r.faces.map((x) => `${x.face} ${x.loaded ? 'loaded' : x.declared ? `not loaded (${x.status})` : 'not declared'}`).join('; ') : '') +
    (r && r.why ? ` ${r.why}` : '') + (r ? ` after ${r.tries} tries, ${r.ms} ms` : '');

module.exports = { DEFAULT_FACES, inPageAwaitFonts, awaitFonts, isEnvError, describe };

/* ---------------------------------------------------------------- CLI: --probe / --self-test */
async function probe(file, { old = false, delay = 2500 } = {}) {
    const fsx = require('fs'), http = require('http');
    const puppeteer = require('puppeteer');
    const { ROOT, chromePath } = require('./ws-harness.cjs');
    const html = fsx.readFileSync(path.resolve(file), 'utf8');
    const server = http.createServer((req, res) => {
        const rel = decodeURIComponent(req.url.split('?')[0]);
        if (rel === '/__fixture.html') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end(html); }
        const f = path.normalize(path.join(ROOT, rel));
        if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
        fsx.readFile(f, (err, buf) => {
            if (err) { res.writeHead(404); return res.end('not found'); }
            const send = () => { res.writeHead(200, { 'Content-Type': /\.woff2$/.test(f) ? 'font/woff2' : /\.css$/.test(f) ? 'text/css' : 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(buf); };
            if (/\.woff2$/.test(f)) setTimeout(send, delay); else send();   // the slow route: the font arrives late
        });
    });
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    const browser = await puppeteer.launch({ headless: true, executablePath: chromePath(), args: ['--no-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.goto(`http://127.0.0.1:${server.address().port}/__fixture.html`, { waitUntil: 'networkidle0', timeout: 60000 });
        await page.evaluate(() => document.fonts && document.fonts.ready);
        if (old) {   // the pre-fix gates: one check, straight after networkidle0 + fonts.ready
            const ok = await page.evaluate(() => document.fonts.check('700 28px Andika') && document.fonts.check('400 15px Andika'));
            return { verdict: ok ? 'OK' : 'FAIL', line: `old one-shot check 700/28px + 400/15px = ${ok}` };
        }
        const r = await awaitFonts(page);
        if (r.ok) return { verdict: 'OK', line: describe(r) };
        if (isEnvError(r)) return { verdict: 'ERROR', line: describe(r) };
        return { verdict: 'FAIL', line: describe(r) };
    } finally { await browser.close(); server.close(); }
}

if (require.main === module) {
    const argv = process.argv.slice(2);
    const arg = (k, d) => { const i = argv.indexOf(k); return i > -1 ? argv[i + 1] : d; };
    (async () => {
        if (argv.includes('--self-test')) {
            const FX = path.resolve(__dirname, '..', 'fixtures', 'precritic');
            const cases = [
                ['fonts-late.html', true, 'FAIL'], ['fonts-late.html', false, 'OK'], ['fonts-never.html', false, 'ERROR'], ['fonts-undeclared.html', false, 'FAIL'],
            ];
            const bad = [];
            for (const [f, old, want] of cases) {
                const r = await probe(path.join(FX, f), { old });
                console.log(`  ${f}${old ? ' (old code)' : ''}: ${r.verdict} (want ${want}) ${r.line}`);
                if (r.verdict !== want) bad.push(f);
            }
            console.log(bad.length ? `ws-fonts --self-test: FAIL (${bad.join(', ')})` : 'ws-fonts --self-test: OK');
            process.exit(bad.length ? 1 : 0);
        }
        const file = arg('--probe', null);
        if (!file) { console.log('usage: ws-fonts.cjs --probe <fixture.html> [--old] [--delay ms] | --self-test'); process.exit(2); }
        const r = await probe(file, { old: argv.includes('--old'), delay: Number(arg('--delay', 2500)) });
        console.log(`  ${r.line}`);
        if (r.verdict === 'ERROR') { console.log(`ws-fonts: ERROR (font never arrived: environment, not a page fault)`); process.exit(2); }
        console.log(`ws-fonts: ${r.verdict}`);
        process.exit(r.verdict === 'OK' ? 0 : 1);
    })().catch((e) => { console.log(`ws-fonts: ERROR ${(e && e.message) || e}`); process.exit(2); });
}
