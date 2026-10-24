// options-render — `ws-options-verify --render` (W0-B2 / B7, pilot-su-c critic r2 N4: "Across" was offered, passed the
// promise checks of ws-options-verify, and broke the printed page). The option verifier checks that a value DOES what it
// says; this checks that the page it prints is still a good page. For every OFFERED appearance value of the touched
// skills it prints the Independent page at each size (default S and L) through ws-print-lint --source kit (one browser
// start: a --jobs file), and compares it with the same skill's DEFAULT page at the same size and seed:
//
//   FAIL  a (lint, rule) the default page does not have, or one whose count PER ITEM printed is above the default
//         page's (the value made the page worse), or the value's page did not render;
//   FAIL  also when the value's fullest pupil page holds FEWER items than the default's and the value adds no drawing
//         (a notation or layout that costs the page items: critic r2 N4, Across printed 12 where stacked prints 20 at
//         S; a support level (heads, traces), a number line, pictures or a support pane may cost room: ADDS_DRAWING,
//         groups nline / support);
//   ok    every (lint, rule) at or below the default's rate per printed cell (a value that fits more items on the page,
//         as level 0 does by dropping the heads, repeats a per-cell finding on more cells: the same rate, not a worse
//         page). Findings the default page already has are engine / skill debt that the other gates own (print-lint's
//         own pins, the coverage matrix): they are printed, never blamed on the value.
// The cells are counted on the saved pages (print-lint --save-html: data-ws-cell per .ws-page, pupil and key).
//
// WHICH VALUES ("appearance"): every value offeredOptionsFor(cat, skill) returns (js/modules/skill-options.js, the tree
// under test: MQ_ROOT) except
//   - the default value itself (it IS the baseline page);
//   - the play controls (group 'play': calculator, skip) — no cell, page or key change;
//   - number-size controls (NUMBER_IDS: band, range, decimals, ...) — they change the numbers, not the drawing, and
//     the option verifier checks them;
//   - free numbers (int / rows editors: no finite value list);
//   - the number-line sub-controls (group 'nline' other than nlOn): rendered only through nlOn = true, listed as skipped.
// A set-type value is rendered alone ({id: [value]}); an enum value as {id: value}; a bool as {id: !default}.
//
// Exit / verdict (printed by ws-options-verify): `ws-options-verify --render: OK (...)` or `... FAIL (...)`; a scope with
// no appearance value prints OK "nothing to render" naming the skills (precritic shows N/A).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { pathToFileURL } = require('url');

const NUMBER_IDS = new Set(['band', 'range', 'decimals', 'places', 'maxNumber', 'digits', 'constant', 'count', 'within', 'minuend', 'size']);
const RUNNER = '/tmp/mq-browser-run.sh';
const ADDS_DRAWING = /^(level|poolSupport|nlOn|pictures|support|supports|counters|dots|tiles|blocks|model|frame|grid)$/;

/** {pupil: [cells per pupil page], all: cells on every page} of a saved kit document (data-ws-cell per ws-page). */
function cellsOf(file) {
    let html = '';
    try { html = fs.readFileSync(file, 'utf8'); } catch (e) { return null; }
    const pages = html.split(/<section class="ws-page\b/).slice(1);
    if (!pages.length) return null;
    const pupil = [], key = [];
    for (const pg of pages) {
        const head = pg.slice(0, pg.indexOf('>'));
        const n = (pg.match(/\sdata-ws-cell="/g) || []).length;
        (/data-ws-mode="key"/.test(head) ? key : pupil).push(n);
    }
    return { pupil, all: [...pupil, ...key].reduce((a, n) => a + n, 0) };
}

/** The appearance values of one skill: [{option, label, value, opts}] plus the skipped ones with a reason. */
function appearanceValues(defs) {
    const out = [], skipped = [];
    for (const def of defs) {
        const id = def.id;
        const vals = def.type === 'bool' ? [true, false]
            : Array.isArray(def.values) ? def.values.map((v) => (v && typeof v === 'object' ? v.v : v)) : null;
        const why = def.group === 'play' ? 'play control'
            : NUMBER_IDS.has(id) ? 'number size'
                : !vals ? 'free value'
                    : def.group === 'nline' && id !== 'nlOn' ? 'number-line sub-control (rendered through nlOn)' : '';
        if (why) { skipped.push({ option: id, why }); continue; }
        const dflt = def.default;
        for (const v of vals) {
            const isDefault = def.type === 'set' ? Array.isArray(dflt) && dflt.length === 1 && String(dflt[0]) === String(v) : String(dflt) === String(v);
            if (isDefault) continue;
            const opts = { [id]: def.type === 'set' ? [v] : v };
            // a value that ADDS a drawing to the cell (a number line, pictures, a support pane) may cost page room
            const adds = def.group === 'nline' || def.group === 'support' || ADDS_DRAWING.test(id);
            out.push({ option: id, label: def.label || id, value: v, opts, adds });
        }
    }
    return { values: out, skipped };
}

async function readOffered(root, keys) {
    const M = (f) => pathToFileURL(path.join(root, 'js/modules', f)).href;
    const so = await import(M('skill-options.js'));
    for (const side of ['skill-options-derived.js', 'skill-options-pools.js', 'skill-presets.js']) {
        if (fs.existsSync(path.join(root, 'js/modules', side))) { try { await import(M(side)); } catch (e) { /* optional */ } }
    }
    let data = null;
    try { data = await import(M('data.js')); } catch (e) { data = null; }
    const out = [];
    for (const k of keys) {
        let cat, id;
        if (k.includes(':')) [cat, id] = k.split(':');
        else {
            id = k;
            cat = data && data.SKILLS ? Object.keys(data.SKILLS).find((c) => Array.isArray(data.SKILLS[c]) && data.SKILLS[c].some((s) => s && s.v === k)) : null;
            if (!cat) throw new Error(`skill "${k}": no category found (give cat:skill)`);
        }
        const defs = so.offeredOptionsFor(cat, id) || [];
        out.push({ key: `${cat}:${id}`, ...appearanceValues(defs) });
    }
    return out;
}

/** Count non-waived findings by "lint rule". */
function countsOf(doc) {
    const m = new Map();
    for (const f of (doc && doc.findings) || []) if (!f.waived) { const k = `${f.lint} ${f.rule}`; m.set(k, (m.get(k) || 0) + 1); }
    return m;
}

async function main({ root, here, keys, sizes, json, verbose, say }) {
    if (!keys.length) { say('ws-options-verify --render: FAIL (usage: --render needs --skill cat:skill[,...]: the touched skills)'); return 2; }
    const skills = await readOffered(root, keys);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-options-render-'));
    const HTML = path.join(tmp, 'html');
    const htmlOf = (id) => path.join(HTML, `${id.replace(/[^\w.-]+/g, '_')}.html`);
    const jobs = [];
    const plan = [];
    for (const s of skills) {
        for (const sz of sizes) {
            if (!s.values.length) continue;
            const base = `${s.key}@${sz}@default`;
            jobs.push({ id: base, args: ['--skills', s.key, '--size', sz, '--save-html', HTML] });
            for (const v of s.values) {
                const id = `${s.key}@${sz}@${v.option}=${JSON.stringify(v.value)}`;
                jobs.push({ id, args: ['--skills', s.key, '--size', sz, '--opts', JSON.stringify(v.opts), '--save-html', HTML] });
                plan.push({ skill: s.key, size: sz, option: v.option, value: v.value, adds: v.adds, id, base });
            }
        }
    }
    for (const s of skills) {
        say(`${s.key}: ${s.values.length} appearance value(s) to render${s.values.length ? `: ${s.values.map((v) => `${v.option}=${JSON.stringify(v.value)}`).join(', ')}` : ''}${s.skipped.length ? `; not rendered: ${[...new Set(s.skipped.map((x) => `${x.option} (${x.why})`))].join(', ')}` : ''}`);
    }
    if (!jobs.length) { say(`ws-options-verify --render: OK (nothing to render: no appearance value offered on ${keys.join(', ')})`); return 0; }
    const jobsFile = path.join(tmp, 'jobs.json'), outFile = path.join(tmp, 'print-lint.json');
    fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 1));
    const lint = path.join(here, 'ws-print-lint.cjs');
    const cmd = [process.execPath, lint, '--source', 'kit', '--jobs', jobsFile, '--json', outFile, '--report-only'];
    // inside a browser slot already (precritic's browser gate, or the runner): run print-lint in it; else take one
    const inSlot = !!process.env.MQ_BROWSER_SLOT || !fs.existsSync(RUNNER);
    const t0 = Date.now();
    const r = spawnSync(inSlot ? cmd[0] : RUNNER, inSlot ? cmd.slice(1) : cmd, { cwd: here, env: Object.assign({}, process.env, { MQ_ROOT: root }), encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    let res = null;
    try { res = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch (e) { res = null; }
    if (!res) {
        say(`${(r.stdout || '').split('\n').slice(-12).join('\n')}${(r.stderr || '').split('\n').slice(-6).join('\n')}`);
        say(`ws-options-verify --render: FAIL (ws-print-lint wrote no JSON; exit ${r.status})`);
        return 1;
    }
    const docs = new Map((res.documents || []).map((d) => [d.id, d]));
    const na = new Map((res.na || []).map((d) => [d.id, d.reason]));
    const pend = new Map((res.pending || []).map((d) => [d.id, d.reason]));
    const rows = [];
    for (const p of plan) {
        const d = docs.get(p.id), b = docs.get(p.base);
        const row = { ...p, status: 'ok', rises: [], debt: [] };
        if (na.has(p.id) || pend.has(p.id)) { row.status = 'n/a'; row.rises.push(na.get(p.id) || pend.get(p.id)); rows.push(row); continue; }
        if (!d || d.error) { row.status = 'FAIL'; row.rises.push(`the page did not render${d && d.error ? `: ${d.error}` : ''}`); rows.push(row); continue; }
        if (!b || b.error) { row.status = 'FAIL'; row.rises.push(`the default page did not render${b && b.error ? `: ${b.error}` : ''} (nothing to compare with)`); rows.push(row); continue; }
        const cv = countsOf(d), cb = countsOf(b);
        // per item: a value that fits more problems on the page (level 0 drops the heads) repeats the default page's
        // per-cell findings on more cells; that is the same rate, not a worse page. A (lint, rule) the default page
        // does not have at all is always a rise.
        const kv = cellsOf(htmlOf(p.id)), kb = cellsOf(htmlOf(p.base));
        const iv = kv ? kv.all : null, ib = kb ? kb.all : null;
        row.items = { default: kb && kb.pupil, value: kv && kv.pupil };
        for (const [k, n] of cv) {
            const was = cb.get(k) || 0;
            const sameRate = was > 0 && iv && ib && n / iv <= (was / ib) * 1.0001;
            if (n > was && !sameRate) {
                const ex = d.findings.filter((f) => !f.waived && `${f.lint} ${f.rule}` === k).slice(0, 1).map((f) => f.msg)[0] || '';
                row.rises.push(`${k}: ${was} -> ${n}${ex ? ` (${String(ex).slice(0, 140)})` : ''}`);
            } else row.debt.push(`${k} ${n}${n > was ? ` (${was} on the default page: the same rate per item, ${n}/${iv} vs ${was}/${ib})` : ''}`);
        }
        // capacity (critic r2 N4: "S prints 12 to 16 items, where the stacked page prints 20"): a value that only
        // changes how the item is written or supported may not cost the page items; one that adds a drawing may
        const mv = kv && kv.pupil.length ? Math.max(...kv.pupil) : null, mb = kb && kb.pupil.length ? Math.max(...kb.pupil) : null;
        if (mv !== null && mb !== null && mv < mb) {
            if (p.adds) row.debt.push(`capacity ${mv} items a page vs ${mb} (a value that adds a drawing: allowed)`);
            else row.rises.push(`capacity: ${mv} items on its fullest page where the default page prints ${mb} (the value costs the page items without adding a drawing; RUBRIC H13)`);
        }
        if (mv === null || mb === null) row.debt.push('capacity and per-cell rates not measured (no saved page)');
        if (row.rises.length) row.status = 'FAIL';
        rows.push(row);
    }
    for (const x of rows) {
        if (x.status === 'ok' && !verbose) continue;
        say(`  ${x.status === 'FAIL' ? 'FAIL' : x.status === 'n/a' ? 'n/a ' : 'ok  '} ${x.skill} ${x.size} ${x.option}=${JSON.stringify(x.value)}${x.rises.length ? `: ${x.rises.join('; ')}` : ''}${x.debt.length && verbose ? ` [at or below the default: ${x.debt.join(', ')}]` : ''}`);
    }
    const bad = rows.filter((x) => x.status === 'FAIL');
    const debtKeys = [...new Set(rows.flatMap((x) => x.debt.filter((t) => /^L-/.test(t)).map((t) => t.replace(/ \d+(?: \(.*)?$/, ''))))];
    if (json) fs.writeFileSync(path.resolve(json), JSON.stringify({ sizes, skills: skills.map((s) => ({ key: s.key, values: s.values.map((v) => ({ option: v.option, value: v.value })), skipped: s.skipped })), rows }, null, 1));
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* tmp */ }
    const summary = `${rows.length} value page(s) (${skills.filter((s) => s.values.length).length} skill(s) x ${sizes.join('/')}) against ${jobs.length - rows.length} default page(s) through ws-print-lint --source kit in ${((Date.now() - t0) / 1000).toFixed(0)} s; ${rows.filter((x) => x.status === 'n/a').length} n/a${debtKeys.length ? `; findings the default page has too (not the value's): ${debtKeys.join(', ')}` : ''}`;
    if (bad.length) { say(`ws-options-verify --render: FAIL (${bad.length} value page(s) worse than the default: ${[...new Set(bad.map((x) => `${x.skill.split(':')[1]} ${x.option}=${JSON.stringify(x.value)} @${x.size}`))].join(', ')}; ${summary})`); return 1; }
    say(`ws-options-verify --render: OK (${summary})`);
    return 0;
}

module.exports = { main, appearanceValues, NUMBER_IDS };
