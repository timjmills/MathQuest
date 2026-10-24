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
// THE EXTRA DOCUMENTS (critic r6 N2; --no-extra skips them): the matrix renders the independent role only, so per skill
//   this tool also prints, at S, the test role (`extra/role-test`), the more-practice role (`extra/role-more-practice`)
//   and, when the skill's options offer a support level or a place-heading switch, one page with the highest support
//   level and the headings on (`extra/supports-on`; pilot r1 D7, heads at level 2+). With --rows only the extra rows
//   named there run (e.g. --rows extra/supports-on). Their SLOT / CLIP counts are judged against the same extra
//   documents of the skill's siblings, printed in the same run when a lane extra document has any.
// THE CHECKS, per (row, size):
//   SLOT   print-lint L-ANSAREA (SL-1 answer lines >= 14 mm, SL-6 no underscore blanks, H12 drawing zones)
//   CLIP   print-lint L-OVERFLOW (PG-12 out of the cell / page clipped, PG-13 outside the live area, TY-12 clipped text)
//          Both are judged as ws-sibling-compare judges a row: a count above every sibling's count on the same row and
//          size is FAIL; at or below is engine debt (listed, non-blocking); no sibling measured is FAIL. The siblings
//          are the PAIRED ones (siblings.json `pairs`) by default, every approved sibling with --all-siblings (N1).
//   SLOT-W (TY-21, critic r1 D3) every digit-strip segment (`[data-ws-seg]`) and stand-alone answer box on the pupil
//          and key pages is at least 4.4 mm wide as printed (A4, print media). Zero tolerance: a WDS minimum.
//   HEADS  (H2, critic r1 D7, r2 N8) neighbouring head labels (a stack's `.head`s, a pv mat's place letters) sit at
//          least 1 mm apart (overlap included). Zero tolerance (an illegible run is never engine debt).
//          SLOT-W and HEADS are tests/lib/ws-geom-probe.cjs, the definition print-lint's L-ANSAREA TY-21 and L-OVERLAP
//          read (one rule, two readers). D1 (W0-A critic r7): on a multi-skill row an item, or a SLOT / CLIP count,
//          on a partner skill's cell is listed as "partner skill (non-blocking)", never a lane FAIL.
//   Each line names what the two probes measured per template (N5): SLOT-W reads only digit strips (the stack's answer
//   boxes) and HEADS only stack heads, so a document without them says "SLOT-W N/A (equation ×6: no box segment(s))"
//   and the JSON row carries slotW / headsProbe "measured" or "N/A": never a silent 0.
// COST (measured on add_1k_no_regroup, critic r6 precritic): print-lint 159 s for 48 documents (3.3 s a document), the
//   probe 100 s, the siblings' matrix 900 s when ws-sibling-compare had not cached it. The matrix's own documents
//   cannot be reused: ws-coverage-matrix does not pass --save-html to its print-lint jobs (another lane's file).
// Options: --sizes S,M,L (default all), --slots N (default 2), --rows a,b (row names or full ids), --siblings-file,
//   --run-siblings / --sibling-run <file> / --matrix-baseline <file> (the sibling sources, as ws-sibling-compare),
//   --root <tree> (default MQ_ROOT, else this repository), --json <out>, --keep (keep the saved documents; the tmp
//   dir is removed on every other exit, a probe failure too: N4), --report-only. Prints one line per row and size, then `ws-slot-clip: OK (...)` / `ws-slot-clip: FAIL - ...`;
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
// TY-21 is print-lint's copy of SLOT-W (the shared probe): judged at zero tolerance below, never as a sibling count
const slotCounted = (f) => SLOT_LINTS.includes(f.lint) && !f.waived && !(f.lint === 'L-ANSAREA' && f.rule === 'TY-21');
// SLOT-W and HEADS read the ONE definition ws-print-lint's L-ANSAREA TY-21 and L-OVERLAP H2 read (S1 builder B):
// tests/lib/ws-geom-probe.cjs. HEADS is now the 1 mm minimum gap (critic r2 N8: 0.74 mm apart reads as one run),
// overlap included. Each item carries the skill of its cell (D1).
const { GEOM_PROBE, MIN_SEG_MM, HEAD_GAP_MM } = require('../lib/ws-geom-probe.cjs');
const PROBE_CFG = { minSeg: MIN_SEG_MM, minGap: HEAD_GAP_MM, wraps: false };
const PROBE = GEOM_PROBE;

/**
 * D1 (W0-A critic r7): split a probe's items by skill. On a multi-skill row (the lane skill plus the matrix's
 * partners) an item on a partner's cell never blocks the lane: it is listed as partner (non-blocking); an item no
 * cell names stays with the lane.
 */
function splitBySkill(p, laneSkill, multi) {
    const mine = (x) => !multi || !x.skill || x.skill === laneSkill;
    const own = Object.assign({}, p, { narrow: (p.narrow || []).filter(mine), overlaps: (p.overlaps || []).filter(mine) });
    const partner = Object.assign({}, p, { narrow: (p.narrow || []).filter((x) => !mine(x)), overlaps: (p.overlaps || []).filter((x) => !mine(x)) });
    return { own, partner };
}
const summariseProbe = (p) => {
    const f = [];
    if (p.narrow.length) {
        const ws = p.narrow.map((x) => x.w);
        f.push({ rule: 'SLOT-W', n: p.narrow.length, msg: `${p.narrow.length} of ${p.segs} answer-box segment(s) under ${MIN_SEG_MM} mm (narrowest ${Math.min(...ws)} mm; pages ${[...new Set(p.narrow.map((x) => x.page))].slice(0, 6).join(', ')}) (TY-21)` });
    }
    if (p.overlaps.length) { const o = p.overlaps[0]; f.push({ rule: 'HEADS', n: p.overlaps.length, msg: `${p.overlaps.length} pair(s) of place heads overlap or sit under ${HEAD_GAP_MM} mm apart, e.g. "${o.a}" / "${o.b}" ${o.gap < 0 ? `overlap by ${-o.gap} mm` : `${o.gap} mm apart`} on page ${o.page} (H2)` }); }
    return f;
};

/**
 * N5: what the probes measured on one document, per template: SLOT-W measures only digit strips (`.ab[data-ws-seg]`,
 * the stack's answer boxes) and HEADS only stack place heads, so every other template is N/A for them, never a silent 0.
 */
function measuredLine(p) {
    const tpl = Object.entries((p && p.tpl) || {});
    if (!tpl.length) return 'SLOT-W N/A, HEADS N/A (no kit cell in the document)';
    const on = (k) => tpl.filter(([, v]) => v[k] > 0).map(([t, v]) => `${t} ${v[k]}`);
    const off = (k) => tpl.filter(([, v]) => !(v[k] > 0)).map(([t, v]) => `${t} ×${v.cells}`);
    const part = (name, k, what) => (on(k).length ? `${name} measured ${on(k).join(', ')} ${what}${off(k).length ? `; N/A on ${off(k).join(', ')}` : ''}` : `${name} N/A (${off(k).join(', ')}: no ${what})`);
    return `${part('SLOT-W', 'segs', 'box segment(s)')}; ${part('HEADS', 'heads', 'place head(s)')}`;
}

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
            const agg = { segs: 0, narrow: [], heads: 0, overlaps: [], docs: files.length, tpl: {} };
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
                    const p = await page.evaluate(PROBE, PROBE_CFG);
                    agg.segs += p.segs; agg.heads += p.heads; agg.narrow.push(...p.narrow); agg.overlaps.push(...p.overlaps);
                    for (const [t, v] of Object.entries(p.tpl || {})) { const a = (agg.tpl[t] = agg.tpl[t] || { cells: 0, segs: 0, heads: 0 }); a.cells += v.cells; a.segs += v.segs; a.heads += v.heads; }
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

/**
 * N2 (critic r6): the matrix renders the independent role (and the layout / sections / mixed rows) only, never the test
 * or more-practice roles nor a skill's support options, so pilot r1 D7 (place heads overlapping at 5-6 digits, heads
 * on only at support level 2+) was on no page this tool read. Per skill, at S: the test role, the more-practice role
 * and, when its options offer a support level (`level`, numeric values) or a place-heading switch (a bool option whose
 * id or label says head / heading), ONE page with the highest support level and the headings on. Read in node from
 * offeredOptionsFor (what the option panel offers).
 */
function extraSpecs(keys) {
    const code = `
import { pathToFileURL } from 'node:url'; import { join } from 'node:path';
const ROOT = process.env.SC_ROOT; const M = (p) => pathToFileURL(join(ROOT, 'js', 'modules', p)).href;
const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === Symbol.iterator ? undefined : stub()), apply: () => stub(), construct: () => stub(), set: () => true });
const store = {}; globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
globalThis.sessionStorage = globalThis.localStorage; globalThis.window = globalThis; globalThis.document = stub();
const out = process.stdout.write.bind(process.stdout); console.log = console.warn = console.error = console.info = console.debug = () => {};
const so = await import(M('skill-options.js'));
for (const side of ['skill-options-derived.js', 'skill-options-pools.js', 'skill-presets.js']) { try { await import(M(side)); } catch (e) {} }
const res = {};
for (const key of JSON.parse(process.env.SC_KEYS)) { const [c, k] = key.split(':'); let o = []; try { o = so.offeredOptionsFor(c, k) || []; } catch (e) {}
  const opts = {}; const what = [];
  const lvl = o.find((d) => d && (d.id === 'level' || /support level/i.test(d.label || '')));
  const vals = lvl ? (lvl.values || []).map((v) => (v && typeof v === 'object' ? v.v : v)).filter((v) => typeof v === 'number') : [];
  if (vals.length) { const top = Math.max(...vals); opts[lvl.id] = lvl.type === 'set' ? [top] : top; what.push(lvl.id + ' ' + top); }
  for (const d of o) if (d && d.type === 'bool' && /head/i.test((d.id || '') + ' ' + (d.label || ''))) { opts[d.id] = true; what.push(d.id + ' on'); }
  res[key] = { opts: what.length ? opts : null, what: what.join(', ') }; }
out('\\n' + JSON.stringify(res) + '\\n'); process.exit(0);`;
    const r = spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd: HERE, env: Object.assign({}, process.env, { SC_ROOT: ROOT, SC_KEYS: JSON.stringify(keys) }), encoding: 'utf8', maxBuffer: 64 << 20 });
    try { return JSON.parse(String(r.stdout || '').trim().split('\n').pop()); } catch (e) { throw new Error(`cannot read the skills' options in node: ${String(r.stderr || '').slice(0, 400)}`); }
}
const EXTRA_SIZES = ['S'];
function extraRows(keys) {
    const spec = extraSpecs(keys);
    const rows = [];
    for (const k of keys) {
        rows.push({ id: `${k}|extra/role-test`, skill: k, kind: 'extra', row: 'role-test', args: ['--roles', 'test'], skills: [k], sizes: EXTRA_SIZES });
        rows.push({ id: `${k}|extra/role-more-practice`, skill: k, kind: 'extra', row: 'role-more-practice', args: ['--roles', 'more-practice'], skills: [k], sizes: EXTRA_SIZES });
        const sp = spec[k];
        if (sp && sp.opts) rows.push({ id: `${k}|extra/supports-on`, skill: k, kind: 'extra', row: 'supports-on', args: ['--opts', JSON.stringify(sp.opts)], skills: [k], sizes: EXTRA_SIZES, what: sp.what });
    }
    return rows;
}

/* ------------------------------------------------------------- print-lint jobs */
async function runJobs(jobs, slots, tmp, tag = '') {
    if (!fs.existsSync(RUNNER)) { fs.copyFileSync(path.join(__dirname, 'mq-browser-run.sh'), RUNNER); fs.chmodSync(RUNNER, 0o755); }
    const chunks = [];
    for (let i = 0; i < jobs.length; i += 9) chunks.push(jobs.slice(i, i + 9));
    const docs = new Map(), pend = new Map(), na = new Map();
    let next = 0;
    const worker = async () => {
        while (next < chunks.length) {
            const ci = next++;
            const jf = path.join(tmp, `${tag}jobs-${ci}.json`), of = path.join(tmp, `${tag}out-${ci}.json`), lf = path.join(tmp, `${tag}log-${ci}.txt`);
            fs.writeFileSync(jf, JSON.stringify(chunks[ci].map((j) => ({ id: j.id, args: j.args }))));
            const c0 = Date.now();
            await new Promise((resolve) => {
                const log = fs.openSync(lf, 'w');
                const p = spawn(RUNNER, ['node', PRINT_LINT, '--source', 'kit', '--jobs', jf, '--json', of, '--report-only'], { env: { ...process.env, MQ_ROOT: ROOT, MQ_BROWSER_WAIT_LOG: '1' }, stdio: ['ignore', log, log] });
                p.on('close', () => { fs.closeSync(log); resolve(); });
            });
            let o = null; try { o = JSON.parse(fs.readFileSync(of, 'utf8')); } catch (e) { o = null; }
            if (o) { for (const d of o.documents || []) docs.set(d.id, d); for (const x of o.pending || []) pend.set(x.id, x); for (const x of o.na || []) na.set(x.id, x); }
            process.stderr.write(`${TOOL}: ${tag ? 'sibling extras ' : ''}batch ${ci + 1}/${chunks.length}: ${chunks[ci].length} document(s) in ${((Date.now() - c0) / 1000).toFixed(1)} s\n`);
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
<div data-ws-page="1"><div data-ws-cell="stack"><div class="ws-stack"><span class="head">HTh</span><span class="head">TTh</span><span class="head">Th</span>
<span class="ab" data-ws-seg="l"></span><span class="ab" data-ws-seg="m"></span><span class="ab" data-ws-seg="r"></span></div></div></div>`;
    const eqPage = '<!doctype html><meta charset="utf-8"><div data-ws-page="1"><div data-ws-cell="equation">7 + 2 = <span class="ws-box" style="display:inline-block;width:20mm;height:9mm"></span></div><div data-ws-cell="equation">5 + 3 = <span class="ws-box"></span></div></div>';
    try {
        const p = await browser.newPage();
        await p.setViewport({ width: 794, height: 1100 });
        const run = async (seg, gap) => { await p.setContent(page(seg, gap)); return summariseProbe(await p.evaluate(PROBE, PROBE_CFG)); };
        const good = await run(8, '0');
        if (good.length) fails.push(`8 mm segments, short heads: ${JSON.stringify(good)}`);
        // critic r2 N8: heads that do not touch but sit 0.5 mm apart still read as one run (the shared 1 mm minimum)
        await p.setContent(page(8, '0'));
        await p.evaluate(() => {
            const hs = [...document.querySelectorAll('.head')];
            const stk = hs[0].parentElement; stk.style.position = 'relative'; stk.style.height = '20mm';
            let x = 0;
            for (const h of hs) { h.style.position = 'absolute'; h.style.top = '0'; h.style.left = `${x}px`; const r = document.createRange(); r.selectNodeContents(h.firstChild); x += r.getBoundingClientRect().width + 0.5 * 96 / 25.4; }
        });
        const tight = summariseProbe(await p.evaluate(PROBE, PROBE_CFG));
        if (!tight.some((f) => f.rule === 'HEADS' && /0\.5 mm apart/.test(f.msg))) fails.push(`heads 0.5 mm apart: no HEADS finding (${JSON.stringify(tight)})`);
        // D1 (W0-A critic r7): on a multi-skill page only the lane skill's cells block; a partner's narrow boxes are reported
        const twoSkill = (laneSeg, partnerSeg) => `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:12pt sans-serif}.ab{display:inline-block;height:8mm}</style><div data-ws-page="1">`
            + `<div data-ws-cell="stack" data-ws-skill="a:lane"><span class="ab" data-ws-seg="l" style="width:${laneSeg}mm"></span><span class="ab" data-ws-seg="r" style="width:${laneSeg}mm"></span></div>`
            + `<div data-ws-cell="stack" data-ws-skill="b:partner"><span class="ab" data-ws-seg="l" style="width:${partnerSeg}mm"></span><span class="ab" data-ws-seg="r" style="width:${partnerSeg}mm"></span></div></div>`;
        await p.setContent(twoSkill(6, 4.06));
        const po = splitBySkill(await p.evaluate(PROBE, PROBE_CFG), 'a:lane', true);
        if (summariseProbe(po.own).length || !summariseProbe(po.partner).some((f) => f.rule === 'SLOT-W')) fails.push(`D1: narrow boxes on the partner's cells only must not block the lane (own ${JSON.stringify(summariseProbe(po.own))})`);
        await p.setContent(twoSkill(4.06, 6));
        const lo = splitBySkill(await p.evaluate(PROBE, PROBE_CFG), 'a:lane', true);
        if (!summariseProbe(lo.own).some((f) => f.rule === 'SLOT-W') || summariseProbe(lo.partner).length) fails.push('D1: narrow boxes on the lane skill\'s cells must block');
        const narrow = await run(4.06, '0');
        if (!narrow.some((f) => f.rule === 'SLOT-W')) fails.push('4.06 mm segments: no SLOT-W finding');
        const clash = await run(4.06, '2pt');
        if (!clash.some((f) => f.rule === 'HEADS')) fails.push('heads wider than their 4 mm tracks: no HEADS finding');
        // N5 (critic r6): a document without digit strips says SLOT-W N/A per template, never a silent 0
        await p.setContent(page(8, '0'));
        const onStack = measuredLine(await p.evaluate(PROBE, PROBE_CFG));
        if (!/^SLOT-W measured stack 3 box segment\(s\); HEADS measured stack 3 place head\(s\)$/.test(onStack)) fails.push(`stack page: SLOT-W and HEADS measured on stack (${onStack})`);
        await p.setContent(eqPage);
        const eq = await p.evaluate(PROBE, PROBE_CFG);
        const eqLine = measuredLine(eq);
        if (eq.segs !== 0 || !/^SLOT-W N\/A \(equation ×2: no box segment\(s\)\); HEADS N\/A \(equation ×2/.test(eqLine)) fails.push(`equation page: SLOT-W N/A named (${eqLine})`);
    } finally { await browser.close(); }
    for (const f of fails) say(`  self-test FAIL: ${f}`);
    say(fails.length ? `${TOOL}: FAIL - self-test (${fails.length})` : `${TOOL}: OK (self-test, 7 fixture pages)`);
    process.exit(fails.length ? 1 : 0);
}

/* ------------------------------------------------------------- main */
async function main() {
    if (arg('probe', null)) return probePhase(arg('probe'));
    if (has('self-test')) return selfTest();
    const VALUE = new Set(['skills', 'run', 'rows', 'sizes', 'slots', 'json', 'root', 'siblings-file', 'sibling-run', 'matrix-baseline', 'probe']);
    const BOOL = new Set(['run-siblings', 'report-only', 'keep', 'self-test', 'paired', 'all-siblings', 'no-extra']);
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
        const mRows = onlyRows.filter((x) => !/(^|\|)extra\//.test(x));
        rows = onlyRows.length && !mRows.length ? [] : listRows(keys, mRows);
    }
    // N2: the extra documents (test, more-practice, supports on) at S; with --rows, only the extra rows named there
    if (!has('no-extra')) {
        const ex = extraRows(keys).filter((r) => !onlyRows.length || onlyRows.includes(`${r.kind}/${r.row}`) || onlyRows.includes(r.id));
        rows = rows.concat(ex);
    }
    if (!rows.length) { say(`${TOOL}: no printable matrix row for ${keys.join(', ')}${onlyRows.length ? ` (rows ${onlyRows.join(',')})` : ''}`); say(`${TOOL}: FAIL - nothing to check`); process.exit(1); }
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-slotclip-'));
    // N4 (critic r6): the tmp dir goes on EVERY exit (a probe failure too), unless --keep
    process.on('exit', () => { if (!has('keep')) try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* gone */ } });
    // ---- print every row at every size, saving each document
    const jobs = [];
    rows.forEach((r, ri) => (r.sizes || sizes).filter((sz) => sizes.includes(sz)).forEach((sz) => {
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
            const counts = {}, bySkill = { '?': {} };
            for (const f of d.findings || []) if (slotCounted(f)) { const k = `${f.lint} ${f.rule}`; counts[k] = (counts[k] || 0) + 1; const who = f.skill || (f.cell ? '?' : ''); const m = (bySkill[who] = bySkill[who] || {}); m[k] = (m[k] || 0) + 1; }
            s[sz] = { counts, bySkill: (r.skills || []).length > 1 ? bySkill : undefined };
        }
        return Object.assign({}, r, { status: 'OK', sizes: s });
    });
    const SC = require('./ws-sibling-compare.cjs');
    const pinFile = path.resolve(ROOT, arg('matrix-baseline', 'design/audit/matrix/baseline.json'));
    const withCounts = (r) => Object.values(r.sizes).some((v) => Object.values(v.counts).some((n) => n > 0));
    const S = SC.loadSiblings({ keys, onlyRows: onlyRows.filter((x) => !/(^|\|)extra\//.test(x)), pinFile, tmp, allSiblings: has('all-siblings'), runSiblings: has('run-siblings') && asRows.some((r) => r.kind !== 'extra' && withCounts(r)), siblingRuns: argAll('sibling-run'), siblingsFile: arg('siblings-file', 'tests/fixtures/precritic/siblings.json') });
    // the extra documents are judged against the SAME extra documents of the skill's siblings, printed now (the
    // matrix runs and pins hold none), and only when a lane extra document has SLOT / CLIP findings
    let sibExtraSecs = 0;
    const exWith = asRows.filter((r) => r.kind === 'extra' && withCounts(r));
    if (exWith.length) {
        const want = new Map();
        for (const r of exWith) for (const sib of S.sibOf[r.skill] || []) want.set(`${sib}|extra/${r.row}`, { sib, row: r.row });
        const sibKeys = [...new Set([...want.values()].map((x) => x.sib))];
        const sRows = sibKeys.length ? extraRows(sibKeys).filter((r) => want.has(r.id)) : [];
        const sJobs = [];
        sRows.forEach((r, ri) => EXTRA_SIZES.forEach((sz) => sJobs.push({ id: `${r.id}@${sz}`, row: r, size: sz, args: ['--skills', r.skills.join(','), ...r.args, '--size', sz, '--lints', SLOT_LINTS.join(',')] })));
        if (sJobs.length) {
            const t3 = Date.now();
            const sr = await runJobs(sJobs, +arg('slots', '2'), tmp, 'sib-');
            sibExtraSecs = (Date.now() - t3) / 1000;
            const srcRows = {};
            for (const j of sJobs) {
                const d = sr.docs.get(j.id);
                if (!d || d.error) continue;
                const counts = {};
                for (const f of d.findings || []) if (slotCounted(f)) counts[`${f.lint} ${f.rule}`] = (counts[`${f.lint} ${f.rule}`] || 0) + 1;
                (srcRows[j.row.id] = srcRows[j.row.id] || {})[j.size] = { counts };
            }
            S.sources.push({ name: `the siblings' extra documents (printed now, ${Object.keys(srcRows).length} row(s))`, rows: srcRows });
        }
    }
    const cmp = SC.compare(asRows, (k) => S.sibOf[k] || [], SC.sibTable(S.sources), {});
    // ---- report per row and size
    const fails = [];
    const perRow = [];
    for (const j of jobs) {
        const tag = `${j.row.id} ${j.size}`;
        if (pend.has(j.id) || na.has(j.id)) { perRow.push({ id: j.row.id, size: j.size, status: pend.has(j.id) ? 'PENDING' : 'N/A' }); say(`${tag}: ${pend.has(j.id) ? `PENDING (${pend.get(j.id).reason || pend.get(j.id).step})` : `n/a (${na.get(j.id).reason})`}`); continue; }
        const d = docs.get(j.id);
        if (!d) { fails.push(`${tag}: no result (print-lint crashed)`); say(`${tag}: ERROR no result`); perRow.push({ id: j.row.id, size: j.size, status: 'ERROR' }); continue; }
        if (d.error) { fails.push(`${tag}: did not render: ${d.error}`); say(`${tag}: ERROR ${String(d.error).slice(0, 120)}`); perRow.push({ id: j.row.id, size: j.size, status: 'ERROR' }); continue; }
        const lintF = (d.findings || []).filter(slotCounted);
        const slot = lintF.filter((f) => f.lint === 'L-ANSAREA').length, clip = lintF.filter((f) => f.lint === 'L-OVERFLOW').length;
        const above = cmp.above.filter((x) => x.id === j.row.id && x.size === j.size), noSib = cmp.noSibling.filter((x) => x.id === j.row.id && x.size === j.size);
        const split = splitBySkill(probe[j.id] || { segs: 0, narrow: [], heads: 0, overlaps: [] }, j.row.skill, (j.row.skills || []).length > 1);
        const geo = summariseProbe(split.own);
        const geoPartner = summariseProbe(split.partner);
        // D1 fix r1: on a multi-skill row, probe items on cells that name no skill must not pass silently
        const pItems = [...((probe[j.id] || {}).narrow || []), ...((probe[j.id] || {}).overlaps || [])].filter((x) => x.cell);
        const pUnnamed = pItems.filter((x) => !x.skill).length;
        const attrGap = (j.row.skills || []).length > 1 && pItems.length && pUnnamed * 2 > pItems.length ? `attribution missing: ${pUnnamed} of ${pItems.length} probe item(s) on cells that name no skill (D1)` : null;
        const msgs = [];
        for (const x of above) msgs.push(`${x.rule} ${x.n} above the siblings' ${x.max}`);
        for (const x of noSib) msgs.push(`${x.rule} ${x.n}: no sibling measured this row`);
        for (const g of geo) msgs.push(g.msg);
        if (attrGap) msgs.push(attrGap);
        for (const e of cmp.errors.filter((x) => x.id === j.row.id && String(x.msg).startsWith(`${j.size}:`))) msgs.push(e.msg);
        const notes = geoPartner.map((g) => `partner skill (non-blocking, D1): ${g.msg}`).concat(cmp.partner.filter((x) => x.id === j.row.id && x.size === j.size).map((x) => `partner skill (non-blocking, D1): ${x.rule} ${x.n}`));
        const p = probe[j.id] || {};
        const status = msgs.length ? 'FAIL' : 'ok';
        const measured = measuredLine(p);
        perRow.push({ id: j.row.id, size: j.size, status, partner: notes.length ? notes : undefined, slot, clip, segs: p.segs || 0, heads: p.heads || 0, slotW: p.segs ? 'measured' : 'N/A', headsProbe: p.heads ? 'measured' : 'N/A', templates: p.tpl || {}, measured, extra: j.row.kind === 'extra' ? (j.row.what || j.row.row) : undefined, findings: msgs });
        for (const m of msgs) fails.push(`${tag}: ${m}`);
        say(`${tag}${j.row.what ? ` (${j.row.what})` : ''}: ${status} (SLOT ${slot}, CLIP ${clip}${slot + clip && !above.length && !noSib.length ? ' at or below the siblings' : ''}; ${measured})${msgs.length ? '\n    ' + msgs.join('\n    ') : ''}${notes.length ? '\n    ' + notes.join('\n    ') : ''}`);
    }
    const printed = perRow.filter((r) => !['PENDING', 'N/A'].includes(r.status)).length;
    if (!printed) fails.push('no document printed: nothing was checked');
    const secs = ((Date.now() - T0) / 1000).toFixed(1);
    if (has('json')) fs.writeFileSync(path.resolve(arg('json')), JSON.stringify({ tool: TOOL, root: ROOT, skills: keys, sizes, rows: perRow, siblings: S.sibOf, sources: S.sources.map((s) => s.name), fails, seconds: +secs }, null, 1) + '\n');
    if (has('keep')) say(`  documents kept in ${tmp}`);
    const nEx = rows.filter((r) => r.kind === 'extra').length;
    const naW = perRow.filter((r) => r.slotW === 'N/A').length;
    const tail = `${rows.length - nEx} matrix row(s) × ${sizes.length} size(s) + ${nEx} extra document(s) at S (test, more-practice, supports on): ${printed} document(s) checked, ${perRow.filter((r) => r.status === 'PENDING' || r.status === 'N/A').length} pending / n/a; SLOT-W N/A on ${naW} document(s) (no digit strip); print-lint ${lintSecs.toFixed(1)} s, probe ${probeSecs.toFixed(1)} s${sibExtraSecs ? `, sibling extras ${sibExtraSecs.toFixed(1)} s` : ''}, sibling matrix ${S.sibSecs || 0} s, total ${secs} s`;
    say(fails.length ? `${TOOL}: FAIL - ${fails.length} finding(s) in ${new Set(fails.map((f) => f.split(':')[0] + f.split(':')[1].split(' ')[0])).size} row(s) (${tail})` : `${TOOL}: OK (${tail})`);
    process.exit(fails.length && !has('report-only') ? 1 : 0);
}
main().catch((e) => { say(`${TOOL}: ${e && e.stack || e}`); say(`${TOOL}: FAIL - error`); process.exit(2); });
