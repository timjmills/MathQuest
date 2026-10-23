#!/usr/bin/env node
// ws-slot-clip — the SLOT and CLIP lints on EVERY row the coverage matrix renders for a lane's skills (every page kind,
// role and option row, at S / M / L), not only the Independent page at its defaults, reported per row. (pilot-su-c
// critic r1: D3 "answer boxes 4.06 mm wide at S" and D7 "place heads collide at 5-6 digits" were on pages no slot or
// clip check measured; ws-precritic ran print-lint on the Independent defaults page only, and the matrix judged the
// other rows against pins that held the defects.)
//
//   node tests/scripts/ws-slot-clip.cjs --skills subtraction:sub_100_no_regroup
//   node tests/scripts/ws-slot-clip.cjs --skills a:b --rows single/defaults,single/ex-group --sizes S
//   node tests/scripts/ws-slot-clip.cjs --run <ws-coverage-matrix run file>   # its rows (args and partner skills)
//   node tests/scripts/ws-slot-clip.cjs --self-test                          # the geometry probe on fixture pages
//
// THE ROWS: the matrix's own row list (`ws-coverage-matrix --skills K --list`: the RUN rows and their flags; the
//   multi-skill kinds get the matrix's fixed partners, read the way the matrix reads them), or the rows of a matrix
//   run file (--run). Each row prints at each size through `ws-print-lint --source kit --jobs` (the matrix's own
//   mechanism; batches of 9 documents a browser start, --slots processes through /tmp/mq-browser-run.sh) with
//   `--save-html`, so the probe below reads the very documents print-lint linted.
// THE CHECKS, per (row, size):
//   SLOT   print-lint L-ANSAREA (SL-1 answer lines >= 14 mm, SL-6 no underscore blanks, H12 drawing zones)
//   CLIP   print-lint L-OVERFLOW (PG-12 out of the cell / page clipped, PG-13 outside the live area, TY-12 clipped text)
//          Both are judged as ws-sibling-compare judges a red row: a count above every approved sibling's count on the
//          same row and size is FAIL; at or below is engine debt (listed, non-blocking); no sibling measured is FAIL.
//   SLOT-W (new, TY-21, critic r1 D3) every answer-box segment of a digit strip (`.ab[data-ws-seg]`) on the pupil and
//          key pages is at least 4.4 mm wide as printed (A4, print media). Zero tolerance: a WDS minimum.
//   HEADS  (new, H2, critic r1 D7) no two place-value heads (`.head`) of one stack overlap: the ink boxes of their text
//          intersect by more than 0.2 mm. Zero tolerance (an illegible run is never engine debt).
// Options: --sizes S,M,L (default all), --slots N (default 2), --rows a,b (row names or full ids), --siblings-file,
//   --run-siblings / --sibling-run <file> / --matrix-baseline <file> (the sibling sources, as ws-sibling-compare),
//   --root <tree> (default MQ_ROOT, else this repository), --json <out>, --keep (keep the saved documents),
//   --report-only. Prints one line per row and size, then `ws-slot-clip: OK (...)` / `ws-slot-clip: FAIL - ...`;
//   exit 1 on FAIL, 2 on a usage or setup error. A selection that prints nothing is a FAIL, never OK.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const TOOL = 'ws-slot-clip';
const HERE = path.resolve(__dirname, '..', '..');
const argv = process.argv.slice(2);
const has = (k) => argv.includes('--' + k);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const argAll = (k) => argv.flatMap((a, i) => (a === '--' + k && i + 1 < argv.length ? String(argv[i + 1]).split(',') : [])).map((s) => s.trim()).filter(Boolean);
const ROOT = path.resolve(arg('root', process.env.MQ_ROOT || HERE));
const say = (...a) => console.log(...a);
const RUNNER = '/tmp/mq-browser-run.sh';
const PRINT_LINT = path.join(__dirname, 'ws-print-lint.cjs');
const MATRIX = path.join(__dirname, 'ws-coverage-matrix.cjs');
const SLOT_LINTS = ['L-ANSAREA', 'L-OVERFLOW'];
const MIN_SEG_MM = 4.4;
const HEAD_OVERLAP_MM = 0.2;

/* ------------------------------------------------------------- the geometry probe (in the printed document) */
function PROBE(minSeg, headTol) {
    const mm = (px) => px * 25.4 / 96;
    const out = { segs: 0, narrow: [], heads: 0, overlaps: [] };
    const pageOf = (el) => { const p = el.closest('[data-ws-page], .ws-page'); const all = Array.from(document.querySelectorAll('[data-ws-page], .ws-page')); return p ? all.indexOf(p) + 1 : 0; };
    for (const el of document.querySelectorAll('.ab[data-ws-seg]')) {
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        out.segs++;
        const w = mm(r.width);
        if (w < minSeg - 0.005) out.narrow.push({ page: pageOf(el), w: +w.toFixed(2) });
    }
    const inkBox = (el) => {
        const range = document.createRange();
        let box = null;
        for (const n of el.childNodes) {
            if (n.nodeType !== 3 || !n.textContent.trim()) continue;
            range.selectNodeContents(n);
            for (const r of range.getClientRects()) if (r.width > 0) box = box ? { l: Math.min(box.l, r.left), r: Math.max(box.r, r.right), t: Math.min(box.t, r.top), b: Math.max(box.b, r.bottom) } : { l: r.left, r: r.right, t: r.top, b: r.bottom };
        }
        return box;
    };
    for (const stk of document.querySelectorAll('.ws-stack')) {
        const heads = Array.from(stk.querySelectorAll('.head')).map((h) => ({ h, box: inkBox(h), txt: h.textContent.trim() })).filter((x) => x.box);
        out.heads += heads.length;
        for (let i = 1; i < heads.length; i++) {
            const a = heads[i - 1], b = heads[i];
            const ox = Math.min(a.box.r, b.box.r) - Math.max(a.box.l, b.box.l);
            const oy = Math.min(a.box.b, b.box.b) - Math.max(a.box.t, b.box.t);
            if (mm(ox) > headTol && oy > 0) out.overlaps.push({ page: pageOf(stk), a: a.txt, b: b.txt, mm: +mm(ox).toFixed(2) });
        }
    }
    return out;
}
const summariseProbe = (p) => {
    const f = [];
    if (p.narrow.length) {
        const ws = p.narrow.map((x) => x.w);
        f.push({ rule: 'SLOT-W', n: p.narrow.length, msg: `${p.narrow.length} of ${p.segs} answer-box segment(s) under ${MIN_SEG_MM} mm (narrowest ${Math.min(...ws)} mm; pages ${[...new Set(p.narrow.map((x) => x.page))].slice(0, 6).join(', ')}) (TY-21)` });
    }
    if (p.overlaps.length) f.push({ rule: 'HEADS', n: p.overlaps.length, msg: `${p.overlaps.length} pair(s) of place heads overlap, e.g. "${p.overlaps[0].a}" / "${p.overlaps[0].b}" by ${p.overlaps[0].mm} mm on page ${p.overlaps[0].page} (H2)` });
    return f;
};

/* ------------------------------------------------------------- probe phase (a browser, through the runner) */
async function probePhase(manifestFile) {
    const { startServer, chromePath } = require('../lib/ws-harness.cjs');
    const puppeteer = require('puppeteer');
    const man = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    const srv = await startServer();
    const browser = await puppeteer.launch({ headless: 'new', executablePath: chromePath(), args: ['--no-sandbox', '--font-render-hinting=none'] });
    const res = {};
    try {
        // the saved documents link their stylesheets at print-lint's own (now closed) server: point them at ours, and
        // refuse a document whose stylesheets or fonts did not load (it would measure nothing real). A fresh page per
        // document, as print-lint lints each one (a second setContent on one page never reached network idle).
        for (const job of man.jobs) {
            const files = fs.existsSync(job.dir) ? fs.readdirSync(job.dir).filter((n) => /\.html$/.test(n)) : [];
            const agg = { segs: 0, narrow: [], heads: 0, overlaps: [], docs: files.length };
            for (const f of files) {
                const page = await browser.newPage();
                try {
                    const failed = [];
                    page.on('requestfailed', (r) => { if (/stylesheet|font/.test(r.resourceType())) failed.push(r.url()); });
                    page.on('response', (r) => { if (r.status() >= 400 && /stylesheet|font/.test(r.request().resourceType())) failed.push(`${r.status()} ${r.url()}`); });
                    await page.setViewport({ width: 794, height: 1100, deviceScaleFactor: 1 });
                    await page.goto(`${srv.base}/index.html`, { waitUntil: 'domcontentloaded' });
                    await page.emulateMediaType('print');
                    failed.length = 0;
                    const html = fs.readFileSync(path.join(job.dir, f), 'utf8').replace(/https?:\/\/(?:127\.0\.0\.1|localhost):\d+\//g, `${srv.base}/`);
                    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
                    if (failed.length) throw new Error(`${f}: stylesheet / font requests failed: ${failed.slice(0, 3).join(', ')}`);
                    try { await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 8000 }); } catch (e) { /* measured anyway */ }
                    const p = await page.evaluate(PROBE, MIN_SEG_MM, HEAD_OVERLAP_MM);
                    agg.segs += p.segs; agg.heads += p.heads; agg.narrow.push(...p.narrow); agg.overlaps.push(...p.overlaps);
                } finally { await page.close(); }
            }
            res[job.id] = agg;
        }
    } finally { await browser.close(); srv.server.close(); }
    fs.writeFileSync(man.out, JSON.stringify(res));
    say(`${TOOL} probe: ${Object.keys(res).length} job(s)`);
}

/* ------------------------------------------------------------- the rows */
function partnersFor(key) {
    const rsF = path.join(ROOT, 'tests', 'fixtures', 'precritic', 'role-sample.json');
    let P = null;
    try { const rs = JSON.parse(fs.readFileSync(rsF, 'utf8')); if (Array.isArray(rs.partners) && rs.partners.length) P = { partners: rs.partners.map((p) => (typeof p === 'string' ? { skill: p } : p)), spare: (rs.spare || []).map((p) => (typeof p === 'string' ? { skill: p } : p)) }; } catch (e) { /* fallback */ }
    if (!P) { const fb = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'precritic', 'matrix-partners.json'), 'utf8')); P = { partners: fb.partners, spare: fb.spare || [] }; }
    const used = new Set([key]);
    return P.partners.map((p) => {
        let pick = p.skill;
        if (used.has(pick)) { const alt = P.spare.find((s) => s.sizeClass === p.sizeClass && !used.has(s.skill)) || P.spare.find((s) => !used.has(s.skill)); pick = alt ? alt.skill : null; }
        if (pick) used.add(pick);
        return pick;
    }).filter(Boolean);
}
function listRows(keys, onlyRows) {
    const a = [MATRIX, '--skills', keys.join(','), '--list', '--verbose'];
    if (onlyRows.length) a.push('--rows', onlyRows.join(','));
    const r = spawnSync(process.execPath, a, { cwd: HERE, env: Object.assign({}, process.env, { MQ_ROOT: ROOT }), encoding: 'utf8', maxBuffer: 64 << 20 });
    const out = String(r.stdout || '');
    if (!/: LIST \(/.test(out)) throw new Error(`ws-coverage-matrix --list failed: ${out.trim().split('\n').slice(-2).join(' | ')} ${String(r.stderr || '').slice(-300)}`);
    const rows = [];
    for (const line of out.split('\n')) {
        const m = /^ {2}(RUN)\s+(\S+\|(\w+)\/(\S+))\s*(.*)$/.exec(line);
        if (!m) continue;
        const [, , id, kind, name, rest] = m;
        const skill = id.split('|')[0];
        rows.push({ id, skill, kind, row: name, args: rest.trim() ? rest.trim().split(/\s+/) : [], skills: kind === 'single' ? [skill] : [skill, ...partnersFor(skill)] });
    }
    return rows;
}

/* ------------------------------------------------------------- print-lint jobs */
async function runJobs(jobs, slots, tmp) {
    if (!fs.existsSync(RUNNER)) { fs.copyFileSync(path.join(__dirname, 'mq-browser-run.sh'), RUNNER); fs.chmodSync(RUNNER, 0o755); }
    const chunks = [];
    for (let i = 0; i < jobs.length; i += 9) chunks.push(jobs.slice(i, i + 9));
    const docs = new Map(), pend = new Map(), na = new Map();
    let next = 0;
    const worker = async () => {
        while (next < chunks.length) {
            const ci = next++;
            const jf = path.join(tmp, `jobs-${ci}.json`), of = path.join(tmp, `out-${ci}.json`), lf = path.join(tmp, `log-${ci}.txt`);
            fs.writeFileSync(jf, JSON.stringify(chunks[ci].map((j) => ({ id: j.id, args: j.args }))));
            const c0 = Date.now();
            await new Promise((resolve) => {
                const log = fs.openSync(lf, 'w');
                const p = spawn(RUNNER, ['node', PRINT_LINT, '--source', 'kit', '--jobs', jf, '--json', of, '--report-only'], { env: { ...process.env, MQ_ROOT: ROOT, MQ_BROWSER_WAIT_LOG: '1' }, stdio: ['ignore', log, log] });
                p.on('close', () => { fs.closeSync(log); resolve(); });
            });
            let o = null; try { o = JSON.parse(fs.readFileSync(of, 'utf8')); } catch (e) { o = null; }
            if (o) { for (const d of o.documents || []) docs.set(d.id, d); for (const x of o.pending || []) pend.set(x.id, x); for (const x of o.na || []) na.set(x.id, x); }
            process.stderr.write(`${TOOL}: batch ${ci + 1}/${chunks.length}: ${chunks[ci].length} document(s) in ${((Date.now() - c0) / 1000).toFixed(1)} s\n`);
        }
    };
    await Promise.all(Array.from({ length: Math.max(1, slots) }, worker));
    return { docs, pend, na };
}

/* ------------------------------------------------------------- self-test (fixture pages through the probe) */
async function selfTest() {
    const puppeteer = require('puppeteer');
    const { chromePath } = require('../lib/ws-harness.cjs');
    const browser = await puppeteer.launch({ headless: 'new', executablePath: chromePath(), args: ['--no-sandbox'] });
    const fails = [];
    const page = (seg, headGap) => `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:12pt sans-serif}.ws-stack{display:grid;grid-template-columns:repeat(3,${seg}mm)}.head{font-size:9pt;white-space:nowrap;letter-spacing:${headGap}}.ab{height:8mm}</style>
<div data-ws-page="1"><div class="ws-stack"><span class="head">HTh</span><span class="head">TTh</span><span class="head">Th</span>
<span class="ab" data-ws-seg="l"></span><span class="ab" data-ws-seg="m"></span><span class="ab" data-ws-seg="r"></span></div></div>`;
    try {
        const p = await browser.newPage();
        await p.setViewport({ width: 794, height: 1100 });
        const run = async (seg, gap) => { await p.setContent(page(seg, gap)); return summariseProbe(await p.evaluate(PROBE, MIN_SEG_MM, HEAD_OVERLAP_MM)); };
        const good = await run(6, '0');
        if (good.length) fails.push(`6 mm segments, short heads: ${JSON.stringify(good)}`);
        const narrow = await run(4.06, '0');
        if (!narrow.some((f) => f.rule === 'SLOT-W')) fails.push('4.06 mm segments: no SLOT-W finding');
        const clash = await run(4.06, '2pt');
        if (!clash.some((f) => f.rule === 'HEADS')) fails.push('heads wider than their 4 mm tracks: no HEADS finding');
    } finally { await browser.close(); }
    for (const f of fails) say(`  self-test FAIL: ${f}`);
    say(fails.length ? `${TOOL}: FAIL - self-test (${fails.length})` : `${TOOL}: OK (self-test, 3 fixture pages)`);
    process.exit(fails.length ? 1 : 0);
}

/* ------------------------------------------------------------- main */
async function main() {
    if (arg('probe', null)) return probePhase(arg('probe'));
    if (has('self-test')) return selfTest();
    const VALUE = new Set(['skills', 'run', 'rows', 'sizes', 'slots', 'json', 'root', 'siblings-file', 'sibling-run', 'matrix-baseline', 'probe']);
    const BOOL = new Set(['run-siblings', 'report-only', 'keep', 'self-test', 'paired']);
    for (let i = 0; i < argv.length; i++) {
        const m = /^--([a-z-]+)$/.exec(argv[i]);
        if (!m || (!VALUE.has(m[1]) && !BOOL.has(m[1]))) { say(`${TOOL}: unknown argument ${argv[i]}`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
        if (VALUE.has(m[1])) i++;
    }
    const T0 = Date.now();
    const sizes = argAll('sizes').length ? argAll('sizes') : ['S', 'M', 'L'];
    if (sizes.some((z) => !['S', 'M', 'L'].includes(z))) { say(`${TOOL}: --sizes takes S,M,L`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
    const onlyRows = argAll('rows');
    let keys = argAll('skills');
    let rows;
    if (argAll('run').length) {
        rows = argAll('run').flatMap((f) => JSON.parse(fs.readFileSync(path.resolve(f), 'utf8')).rows || [])
            .filter((r) => r.sizes && Array.isArray(r.args) && Array.isArray(r.skills) && !['N/A'].includes(r.status) && !(r.status === 'PENDING' && !/no-baseline/.test(`${r.step || ''} ${r.reason || ''}`)))
            .map((r) => ({ id: r.id, skill: r.skill, kind: r.kind, row: r.row, args: r.args, skills: r.skills }));
        if (keys.length) rows = rows.filter((r) => keys.includes(r.skill)); else keys = [...new Set(rows.map((r) => r.skill))];
        if (onlyRows.length) rows = rows.filter((r) => onlyRows.includes(`${r.kind}/${r.row}`) || onlyRows.includes(r.id));
    } else {
        if (!keys.length) { say(`${TOOL}: give --skills or --run`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
        rows = listRows(keys, onlyRows);
    }
    if (!rows.length) { say(`${TOOL}: no printable matrix row for ${keys.join(', ')}${onlyRows.length ? ` (rows ${onlyRows.join(',')})` : ''}`); say(`${TOOL}: FAIL - nothing to check`); process.exit(1); }
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-slotclip-'));
    // ---- print every row at every size, saving each document
    const jobs = [];
    rows.forEach((r, ri) => sizes.forEach((sz) => {
        const dir = path.join(tmp, 'html', `${ri}-${sz}`);
        jobs.push({ id: `${r.id}@${sz}`, row: r, size: sz, dir, args: ['--skills', r.skills.join(','), ...r.args, '--size', sz, '--lints', SLOT_LINTS.join(','), '--save-html', dir] });
    }));
    const t1 = Date.now();
    const { docs, pend, na } = await runJobs(jobs, +arg('slots', '2'), tmp);
    const lintSecs = (Date.now() - t1) / 1000;
    // ---- the geometry probe over the saved documents (one browser, through the runner)
    const man = path.join(tmp, 'probe.json'), pout = path.join(tmp, 'probe-out.json');
    fs.writeFileSync(man, JSON.stringify({ out: pout, jobs: jobs.filter((j) => docs.has(j.id)).map((j) => ({ id: j.id, dir: j.dir })) }));
    const t2 = Date.now();
    const pr = spawnSync(RUNNER, ['node', __filename, '--probe', man], { cwd: HERE, env: Object.assign({}, process.env, { MQ_ROOT: ROOT }), encoding: 'utf8', maxBuffer: 64 << 20 });
    const probeSecs = (Date.now() - t2) / 1000;
    let probe = {};
    try { probe = JSON.parse(fs.readFileSync(pout, 'utf8')); } catch (e) { say(`${TOOL}: the probe wrote nothing (exit ${pr.status}): ${String((pr.stdout || '') + (pr.stderr || '')).split('\n').filter((l) => /Error|error:/.test(l)).slice(0, 3).join(' | ')}`); say(`${TOOL}: FAIL - probe`); process.exit(2); }
    // ---- SLOT / CLIP counts as matrix-style rows, judged against the siblings
    const asRows = rows.map((r) => {
        const s = {};
        for (const sz of sizes) {
            const d = docs.get(`${r.id}@${sz}`);
            if (!d) continue;
            const counts = {};
            for (const f of d.findings || []) if (SLOT_LINTS.includes(f.lint) && !f.waived) counts[`${f.lint} ${f.rule}`] = (counts[`${f.lint} ${f.rule}`] || 0) + 1;
            s[sz] = { counts };
        }
        return Object.assign({}, r, { status: 'OK', sizes: s });
    });
    const SC = require('./ws-sibling-compare.cjs');
    const pinFile = path.resolve(ROOT, arg('matrix-baseline', 'design/audit/matrix/baseline.json'));
    const S = SC.loadSiblings({ keys, onlyRows, pinFile, tmp, paired: has('paired'), runSiblings: has('run-siblings'), siblingRuns: argAll('sibling-run'), siblingsFile: arg('siblings-file', 'tests/fixtures/precritic/siblings.json') });
    const cmp = SC.compare(asRows, (k) => S.sibOf[k] || [], SC.sibTable(S.sources), { allRows: true });
    // ---- report per row and size
    const fails = [];
    const perRow = [];
    for (const j of jobs) {
        const tag = `${j.row.id} ${j.size}`;
        if (pend.has(j.id) || na.has(j.id)) { perRow.push({ id: j.row.id, size: j.size, status: pend.has(j.id) ? 'PENDING' : 'N/A' }); say(`${tag}: ${pend.has(j.id) ? `PENDING (${pend.get(j.id).reason || pend.get(j.id).step})` : `n/a (${na.get(j.id).reason})`}`); continue; }
        const d = docs.get(j.id);
        if (!d) { fails.push(`${tag}: no result (print-lint crashed)`); say(`${tag}: ERROR no result`); perRow.push({ id: j.row.id, size: j.size, status: 'ERROR' }); continue; }
        if (d.error) { fails.push(`${tag}: did not render: ${d.error}`); say(`${tag}: ERROR ${String(d.error).slice(0, 120)}`); perRow.push({ id: j.row.id, size: j.size, status: 'ERROR' }); continue; }
        const lintF = (d.findings || []).filter((f) => SLOT_LINTS.includes(f.lint) && !f.waived);
        const slot = lintF.filter((f) => f.lint === 'L-ANSAREA').length, clip = lintF.filter((f) => f.lint === 'L-OVERFLOW').length;
        const above = cmp.above.filter((x) => x.id === j.row.id && x.size === j.size), noSib = cmp.noSibling.filter((x) => x.id === j.row.id && x.size === j.size);
        const geo = summariseProbe(probe[j.id] || { segs: 0, narrow: [], heads: 0, overlaps: [] });
        const msgs = [];
        for (const x of above) msgs.push(`${x.rule} ${x.n} above the siblings' ${x.max}`);
        for (const x of noSib) msgs.push(`${x.rule} ${x.n}: no sibling measured this row`);
        for (const g of geo) msgs.push(g.msg);
        const p = probe[j.id] || {};
        const status = msgs.length ? 'FAIL' : 'ok';
        perRow.push({ id: j.row.id, size: j.size, status, slot, clip, segs: p.segs || 0, heads: p.heads || 0, findings: msgs });
        for (const m of msgs) fails.push(`${tag}: ${m}`);
        say(`${tag}: ${status} (SLOT ${slot}, CLIP ${clip}${slot + clip && !above.length && !noSib.length ? ' at or below the siblings' : ''}; ${p.segs || 0} box segment(s), ${p.heads || 0} head(s) measured)${msgs.length ? '\n    ' + msgs.join('\n    ') : ''}`);
    }
    const printed = perRow.filter((r) => !['PENDING', 'N/A'].includes(r.status)).length;
    if (!printed) fails.push('no document printed: nothing was checked');
    const secs = ((Date.now() - T0) / 1000).toFixed(1);
    if (has('json')) fs.writeFileSync(path.resolve(arg('json')), JSON.stringify({ tool: TOOL, root: ROOT, skills: keys, sizes, rows: perRow, siblings: S.sibOf, sources: S.sources.map((s) => s.name), fails, seconds: +secs }, null, 1) + '\n');
    if (!has('keep')) fs.rmSync(tmp, { recursive: true, force: true }); else say(`  documents kept in ${tmp}`);
    const tail = `${rows.length} row(s) × ${sizes.length} size(s): ${printed} document(s) checked, ${perRow.filter((r) => r.status === 'PENDING' || r.status === 'N/A').length} pending / n/a; print-lint ${lintSecs.toFixed(1)} s, probe ${probeSecs.toFixed(1)} s, total ${secs} s`;
    say(fails.length ? `${TOOL}: FAIL - ${fails.length} finding(s) in ${new Set(fails.map((f) => f.split(':')[0] + f.split(':')[1].split(' ')[0])).size} row(s) (${tail})` : `${TOOL}: OK (${tail})`);
    process.exit(fails.length && !has('report-only') ? 1 : 0);
}
main().catch((e) => { say(`${TOOL}: ${e && e.stack || e}`); say(`${TOOL}: FAIL - error`); process.exit(2); });
