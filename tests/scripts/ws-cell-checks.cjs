// ws-cell-checks - the fast sheet gate of lane lf-ops critic r1 (build #4, 2026-11-07): every page role and option value
// the skill's SIGNED spec card offers, at S / M / L, through buildSheet -> sheetDocument, checked in the printed document
// (no PDF, no raster: a few seconds a page). Checks (tests/lib/ws-cell-checks.cjs):
//   OVERFLOW  a cell, the body or the page overflowing; an element leaving its cell or the page (check 2: Reason It
//             arrays and count rows ran out of the A / B boxes and off the page on all three skills, and precritic's
//             ws-grade-render --gate ran lesson / test / independent only)
//   TAGINK    tag over the slot's answer (check 9)               KEYJOIN   one slot, two answers, on the key (check 8)
//   SIZE-S    S = M layout with smaller drawings (check 4)
//
//   node tests/scripts/ws-cell-checks.cjs --skills multiplication:mult_properties --card            # card roles x S/M/L
//   node tests/scripts/ws-cell-checks.cjs --skills multiplication:mult_properties --card --card-opts # + every option value
//                                          (option values on --opt-roles, default lesson,independent,guided,test,review)
//   node tests/scripts/ws-cell-checks.cjs --skills k --roles reason-it,test --size S,L --opts '{"forms":[1]}'
//   node tests/scripts/ws-cell-checks.cjs --rules OVERFLOW,TAGINK   # only these rules count
//   node tests/scripts/ws-cell-checks.cjs --self-test              # planted pages, each rule must fire / stay quiet
// MQ_ROOT=<tree> serves another checkout (ws-backtest commit-pair rows); the card plan is read from that tree.
// Last line `ws-cell-checks: OK (...)` / `FAIL - n finding(s) ...`; exit 1 on FAIL (--report-only: 0).
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const H = require('../lib/ws-harness.cjs');
const { cellChecksInPage, sizeSFindings } = require('../lib/ws-cell-checks.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const ROOT = H.ROOT;
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const RULES = list(arg('rules', 'OVERFLOW,TAGINK,KEYJOIN,SIZE-S'));
const SIZES = list(arg('size', 'S,M,L'));
const OPT_ROLES = list(arg('opt-roles', 'lesson,independent,guided,test,review'));
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const optsKey = (o) => (o ? JSON.stringify(o) : '');

async function checkDoc(sheet, html, ctx) {
    await sheet.setContent(html, { waitUntil: 'load', timeout: 60000 });
    await sheet.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
    await sheet.evaluate(() => document.fonts && document.fonts.ready);
    return sheet.evaluate(cellChecksInPage, ctx);
}

function selfTest() {
    // planted documents: a fixture page each rule must fire on, and a control it must stay quiet on
    const page = (cells) => `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}.ws-page{width:210mm;height:297mm;overflow:hidden;position:relative}.ws-body{height:270mm}.c{display:flex;flex-direction:column;border:1pt solid #000;box-sizing:border-box;position:relative}.b{display:inline-block;border:0.75pt solid #000;height:9mm;box-sizing:border-box;font:20pt sans-serif;text-align:center}.ws-tab{position:absolute;left:0;top:0;width:6mm;height:6mm}</style></head><body><div class="ws-page"><div class="ws-body">${cells}</div></div></body></html>`;
    const dots = '<svg width="30mm" height="20mm" viewBox="0 0 30 20"><circle cx="5" cy="5" r="2" fill="#000"/><circle cx="25" cy="15" r="2" fill="#000"/></svg>';
    const cell = ({ t = 'arrays', h = 60, gapMm = 2, w = 15, val = '', tag = '', width = 90 } = {}) => `<div class="c" data-ws-cell="${t}" style="height:${h}mm;width:${width}mm"><span class="ws-tab" data-ws-label="tab">1</span>${dots}<div style="height:${gapMm}mm"></div><div><span class="b" data-ws-slot="a" ${tag ? 'data-ws-tagged="1" ' : ''}style="width:${w}mm;position:relative">${tag ? `<i class="mq-slottag" style="position:absolute;left:0.5mm;top:0.5mm;font:bold 14pt sans-serif">${tag}</i>` : ''}${val}</span></div></div>`;
    return [
        { name: 'tag over the grey answer (TAGINK)', html: page(cell({ h: 36, val: '<span style="color:#888">10</span>', tag: 'A', w: 15 })), want: 'TAGINK' },
        { name: 'tag outside the box (TAGINK control)', html: page(cell({ h: 36, val: '<span style="color:#888;padding-left:8mm">10</span>', tag: 'A', w: 22 })), want: null, rules: ['TAGINK'] },
        { name: 'two answers in one key slot (KEYJOIN)', html: page(cell({ h: 36, val: '15, 15' })), want: 'KEYJOIN', key: true },
        { name: 'one answer a key slot (KEYJOIN control)', html: page(cell({ h: 36, val: '15' })), want: null, key: true, rules: ['KEYJOIN'] },
        { name: 'off the page (OVERFLOW)', html: page(`<div class="c" data-ws-cell="arrays" style="height:30mm;width:90mm;margin-left:-20mm">${dots}</div>`), want: 'OVERFLOW' },
    ];
}

(async () => {
    if (has('self-test')) {
        const app = await H.open({});
        const sheet = await app.browser.newPage();
        await sheet.setViewport({ width: 900, height: 1200 });
        let bad = 0;
        for (const t of selfTest()) {
            await sheet.setContent(t.html, { waitUntil: 'load' });
            const r = await sheet.evaluate(cellChecksInPage, { role: t.role || '', key: !!t.key });
            const got = [...new Set([...(r.problems.length ? ['OVERFLOW'] : []), ...r.findings.map((f) => f.rule)])];
            const scoped = t.rules ? got.filter((g) => t.rules.includes(g)) : got;
            const ok = t.want ? got.includes(t.want) : scoped.length === 0;
            if (!ok) bad++;
            console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${t.name}: ${got.join(', ') || '-'}${ok ? '' : ` (want ${t.want || 'none'})`}`);
        }
        const sz = sizeSFindings([{ skill: 'k', role: 'independent', size: 'S', perPage: 6, cols: 2, optsKey: '', cells: [{ tmpl: 'arrays', inkH: 30 }] }, { skill: 'k', role: 'independent', size: 'M', perPage: 6, cols: 2, optsKey: '', cells: [{ tmpl: 'arrays', inkH: 40 }] }]);
        const sz0 = sizeSFindings([{ skill: 'k', role: 'independent', size: 'S', perPage: 9, cols: 3, optsKey: '', cells: [{ tmpl: 'arrays', inkH: 30 }] }, { skill: 'k', role: 'independent', size: 'M', perPage: 6, cols: 2, optsKey: '', cells: [{ tmpl: 'arrays', inkH: 40 }] }]);
        const szOk = sz.length === 1 && sz0.length === 0;
        if (!szOk) bad++;
        console.log(`  ${szOk ? 'ok  ' : 'FAIL'} S = M with smaller drawings (SIZE-S) and its control`);
        await app.close();
        console.log(bad ? `ws-cell-checks --self-test: FAIL (${bad})` : 'ws-cell-checks --self-test: OK');
        process.exit(bad ? 1 : 0);
    }
    const skills = list(arg('skills', arg('skill', '')));
    if (!skills.length) { console.log('usage: ws-cell-checks.cjs --skills cat:skill[,..] (--card [--card-opts] | --roles r1,r2) [--size S,M,L] [--opts json] | --self-test'); console.log('ws-cell-checks: FAIL (usage)'); process.exit(2); }
    // the jobs: [skill, role, size, opts]
    const jobs = [];
    const notes = [];
    let plans = [];
    if (has('card')) {
        const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'lib', 'ws-card-plan.mjs'), '--root', ROOT, '--skill', skills.join(',')], { encoding: 'utf8' });
        try { plans = JSON.parse(String(r.stdout).trim().split('\n').pop()); } catch (e) { console.log(`ws-cell-checks: FAIL - cannot read the card plan: ${(r.stderr || '').slice(0, 300)}`); process.exit(2); }
    }
    const baseOpts = arg('opts', null) ? JSON.parse(arg('opts')) : null;
    for (const k of skills) {
        const plan = plans.find((p) => p.skill === k);
        if (has('card') && (!plan || !plan.cards.length)) { notes.push(`${k}: no signed card lists it (--card): roles from --roles`); }
        const roles = plan && plan.cards.length ? plan.roles : list(arg('roles', 'independent'));
        for (const role of roles) for (const size of SIZES) jobs.push({ k, role, size, opts: baseOpts });
        if (plan && has('card-opts')) for (const v of plan.variants) for (const role of OPT_ROLES.filter((r) => roles.includes(r))) for (const size of SIZES) jobs.push({ k, role, size, opts: Object.assign({}, baseOpts || {}, v.opts) });
    }
    console.log(`ws-cell-checks: ${jobs.length} page(s) - ${skills.join(', ')}${has('card') ? ' (card plan' + (has('card-opts') ? ' + option values' : '') + ')' : ''}`);
    for (const n of notes) console.log(`  note ${n}`);
    const app = await H.open({});
    const page = app.page;
    const sheet = await app.browser.newPage();
    await sheet.setViewport({ width: 900, height: 1200 });
    await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });
    const findings = [];
    const runs = [];
    const t0 = Date.now();
    for (const j of jobs) {
        const [cat, id] = j.k.split(':');
        const seed = hash(`${cat}__${id}:${j.role}`) % 1000000;   // ws-grade-render's seed: the critic's pages
        const built = await page.evaluate(async ({ cat, id, role, size, seed, opts }) => {
            try {
                const r = await window.buildSheet({ role, sections: [{ skills: [Object.assign({ categoryId: cat, skillId: id }, opts ? { opts } : {})], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed, form: 'A', key: true, anchors: 'off' });
                const f = Array.isArray(r.fits) ? r.fits[0] : (r.fits && r.fits.sections ? r.fits.sections[0] : r.fits);
                return { pupil: window.sheetDocument(r.pupilHtml, r.title || 't', { paper: 'A4' }), key: window.sheetDocument(r.keyHtml, 'key', { paper: 'A4' }), title: r.title, perPage: f && f.perPage, cols: f && f.cols, pages: r.pageCount };
            } catch (e) { return e && e.unsupported ? { unsupported: e.message } : { error: String((e && e.stack) || e).slice(0, 300) }; }
        }, { cat, id, role: j.role, size: j.size, seed, opts: j.opts });
        const tag = `${j.k} ${j.role} ${j.size}${j.opts ? ' ' + optsKey(j.opts) : ''}`;
        if (built.unsupported) { console.log(`  n/a  ${tag}: ${built.unsupported.slice(0, 100)}`); continue; }
        if (built.error) { findings.push({ rule: 'ERROR', msg: `${tag}: ${built.error}` }); continue; }
        const p = await checkDoc(sheet, built.pupil, { role: j.role, key: false });
        const kk = await checkDoc(sheet, built.key, { role: j.role, key: true });
        const here = [
            ...p.problems.map((m) => ({ rule: 'OVERFLOW', msg: `pupil ${m}` })), ...kk.problems.map((m) => ({ rule: 'OVERFLOW', msg: `key ${m}` })),
            ...p.findings, ...kk.findings,
        ].filter((f) => RULES.includes(f.rule)).map((f) => Object.assign({}, f, { msg: `${tag}: ${f.msg}` }));
        findings.push(...here);
        runs.push({ skill: j.k, role: j.role, size: j.size, optsKey: optsKey(j.opts), perPage: built.perPage, cols: built.cols, cells: p.cells });
        console.log(`  ${here.length ? 'FAIL' : 'ok  '} ${tag}: ${built.pages}p ${built.cols}x? per ${built.perPage}${here.length ? ` - ${[...new Set(here.map((f) => f.rule))].join(', ')} (${here.length})` : ''}`);
    }
    if (RULES.includes('SIZE-S')) findings.push(...sizeSFindings(runs));
    await app.close();
    const by = {};
    for (const f of findings) by[f.rule] = (by[f.rule] || 0) + 1;
    for (const f of findings.slice(0, Number(arg('show', 60)))) console.log(`  FAIL ${f.rule} ${f.msg}`);
    const secs = Math.round((Date.now() - t0) / 1000);
    if (findings.length) console.log(`ws-cell-checks: FAIL - ${findings.length} finding(s) (${Object.entries(by).map(([k, v]) => `${k} ${v}`).join(', ')}) on ${runs.length} page(s), ${secs}s`);
    else console.log(`ws-cell-checks: OK (${runs.length} page(s), no finding; ${secs}s)`);
    process.exit(findings.length && !has('report-only') ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-cell-checks: FAIL - ' + e.message); process.exit(1); });
