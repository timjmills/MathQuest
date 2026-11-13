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
//   node tests/scripts/ws-cell-checks.cjs --skills k --card --card-opts --h13-abs [--rule-skills k]   # + H13-ABS on option pages (opt-in, N6)
//   node tests/scripts/ws-cell-checks.cjs --skills k --card --card-opts --words-rules [--rule-skills k]  # + the number-name rules
//                                          CLAIM-INK, MODEL-ANSWER, WORDS-TEXT, WORDS-BREAK, ROW-SLOT-Y (opt-in, critic nwf r1)
//   node tests/scripts/ws-cell-checks.cjs --self-test              # planted pages, each rule must fire / stay quiet
// MQ_ROOT=<tree> serves another checkout (ws-backtest commit-pair rows); the card plan is read from that tree.
// Last line `ws-cell-checks: OK (...)` / `FAIL - n finding(s) ...`; exit 1 on FAIL (--report-only: 0).
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const H = require('../lib/ws-harness.cjs');
const { cellChecksInPage, sizeSFindings } = require('../lib/ws-cell-checks.cjs');
const { wordsChecksInPage } = require('../lib/ws-words-cells.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const ROOT = H.ROOT;
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const RULES = list(arg('rules', 'OVERFLOW,TAGINK,KEYJOIN,SIZE-S,PUPILTAG,SIGNMATCH,EA-ROWX,EA-PAD,RI-DISTINCT,KEYFIT,LONE-PAGE,ABTAG'));
// --h13-abs (OPT-IN; critic lf-placevalue r2 N6, lead ruling D1): H13-ABS counts too, measured on every OPTION-VALUE page
// (--card-opts; --h13-abs-all: every page); --rule-skills a:b,c:d limits it to those skills (ws-precritic opt-in-rules.json)
const H13ABS = has('h13-abs') || has('h13-abs-all');
if (H13ABS && !RULES.includes('H13-ABS')) RULES.push('H13-ABS');
const RULE_SKILLS = list(arg('rule-skills', ''));
const h13On = (j) => H13ABS && (has('h13-abs-all') || !!j.variant) && (!RULE_SKILLS.length || RULE_SKILLS.includes(j.k));
// TITLE and LESSON-OPT (lf-ops critic r1 check 7) are OPT-IN: --rules ...,TITLE,LESSON-OPT (opt-in-rules.json lane lf-ops-props)
// --words-rules (OPT-IN; critic lf-placevalue nwf r1 N2 / N4 / N5 / N7 / N8, lead ruling D1): the number-name cell's checks
// (tests/lib/ws-words-cells.cjs: CLAIM-INK, MODEL-ANSWER, WORDS-TEXT, WORDS-BREAK, ROW-SLOT-Y), judged on --rule-skills
const WORDS_RULES = ['CLAIM-INK', 'MODEL-ANSWER', 'WORDS-TEXT', 'WORDS-BREAK', 'ROW-SLOT-Y'];
// (an explicit --rules list stays the list: a backtest row proves one rule alone)
if (has('words-rules') && !arg('rules', null)) for (const r of WORDS_RULES) if (!RULES.includes(r)) RULES.push(r);
const wordsOn = (j) => has('words-rules') && (!RULE_SKILLS.length || RULE_SKILLS.includes(j.k));
const SIZES = list(arg('size', 'S,M,L'));
// the titles a signed card decided ({skill, opts, iCan, source}); the TITLE rule holds the page to them
const DECIDED = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'precritic', 'card-titles.json'), 'utf8')).titles || []; } catch (e) { try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'precritic', 'card-titles.json'), 'utf8')).titles || []; } catch (e2) { return []; } } })();
const OPT_ROLES = list(arg('opt-roles', 'lesson,independent,guided,test,review'));
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const optsKey = (o) => (o ? JSON.stringify(o) : '');

async function checkDoc(sheet, html, ctx) {
    await sheet.setContent(html, { waitUntil: 'load', timeout: 60000 });
    await sheet.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
    await sheet.evaluate(() => document.fonts && document.fonts.ready);
    const r = await sheet.evaluate(cellChecksInPage, ctx);
    if (ctx.words) r.findings = r.findings.concat(await sheet.evaluate(wordsChecksInPage, { role: ctx.role, key: ctx.key }));
    return r;
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
        { name: 'a redraw zone printing a list (KEYJOIN open-zone control)', html: page(cell({ h: 36, val: '' }).replace('</div></div>', '<span data-ws-slot="ea-draw" data-ws-shape="open">12, 15, 18</span></div></div>')), want: null, key: true, rules: ['KEYJOIN'] },
        { name: 'grey pupil work with no label (PUPILTAG)', html: page(cell({ h: 36, val: '' }).replace('</div></div>', '<span class="mq-pupil" style="color:#949494">48</span></div></div>')), want: 'PUPILTAG' },
        { name: 'grey pupil work under "Sam wrote:" (PUPILTAG control)', html: page(cell({ h: 36, val: '' }).replace('</div></div>', '<div style="position:relative"><span class="mq-pupiltag" style="display:block;font:10pt sans-serif;line-height:1">Sam wrote:</span><span class="mq-pupil" style="display:block;margin-top:2mm;font:20pt sans-serif;line-height:1;color:#949494">48</span></div></div></div>')), want: null, rules: ['PUPILTAG'] },
        { name: 'a "Sam wrote:" label 20 mm over its work (PUPILTAG distance)', html: page(cell({ h: 60, val: '' }).replace('</div></div>', '<div><span class="mq-pupiltag" style="display:block">Sam wrote:</span><span class="mq-pupil" style="display:block;margin-top:20mm;color:#949494">48</span></div></div></div>')), want: 'PUPILTAG' },
        { name: 'an added answer under the minus sign (SIGNMATCH)', html: page(cell({ h: 36, val: '' }).replace('</div></div>', '<div class="mq-abbox">11 − 2 = 13</div></div></div>')), want: 'SIGNMATCH', role: 'reason-it' },
        { name: 'Reason It panels A and B show the same work (RI-DISTINCT)', html: page(cell({ h: 36, val: '' }).replace('</div></div>', '<div class="mq-abbox"><span class="mq-abtag">A</span>85 - 56 = 29</div><div class="mq-abbox"><span class="mq-abtag">B</span>85 - 56 = 29</div></div></div>')), want: 'RI-DISTINCT', role: 'reason-it' },
        { name: 'a Reason It tag on the first term (ABTAG)', html: page(cell({ h: 36, val: '' }).replace('</div></div>', '<div class="mq-abbox" style="position:relative;padding:0"><span class="mq-abtag" style="position:absolute;left:0;top:0;width:8mm;height:8mm">A</span><span style="display:inline-block;margin-left:5mm;border:1px solid #000;width:10mm">9</span></div><div class="mq-abbox">x</div></div></div>')), want: 'ABTAG', role: 'reason-it' },
        { name: 'a Reason It tag clear of the work (ABTAG control)', html: page(cell({ h: 36, val: '' }).replace('</div></div>', '<div class="mq-abbox" style="position:relative;padding:0"><span class="mq-abtag" style="position:absolute;left:0;top:0;width:8mm;height:8mm">A</span><span style="display:inline-block;margin-left:12mm;border:1px solid #000;width:10mm">9</span></div><div class="mq-abbox">y</div></div></div>')), want: null, role: 'reason-it', rules: ['ABTAG'] },
        { name: 'Reason It panels differ (RI-DISTINCT control)', html: page(cell({ h: 36, val: '' }).replace('</div></div>', '<div class="mq-abbox"><span class="mq-abtag">A</span>85 - 56 = 29</div><div class="mq-abbox"><span class="mq-abtag">B</span>85 - 56 = 39</div></div></div>')), want: null, role: 'reason-it', rules: ['RI-DISTINCT'] },
        { name: 'a miscount under its own sign (SIGNMATCH control)', html: page(cell({ h: 36, val: '' }).replace('</div></div>', '<div class="mq-abbox">11 − 2 = 8</div></div></div>')), want: null, role: 'reason-it', rules: ['SIGNMATCH'] },
        { name: 'a key word past its line (KEYFIT)', html: page(cell({ h: 36, val: '' }).replace('</div></div>', '<span data-ws-slot="x" class="ws-line" style="display:inline-block;width:8mm;white-space:nowrap;overflow:visible">hundreds</span></div></div>')), want: 'KEYFIT', key: true },
        { name: 'a key word on its line (KEYFIT control)', html: page(cell({ h: 36, val: '' }).replace('</div></div>', '<span data-ws-slot="x" class="ws-line" style="display:inline-block;width:40mm;white-space:nowrap">hundreds</span></div></div>')), want: null, key: true, rules: ['KEYFIT'] },
        { name: 'one answer a key slot (KEYJOIN control)', html: page(cell({ h: 36, val: '15' })), want: null, key: true, rules: ['KEYJOIN'] },
        // (cell 60 mm: dots 20 mm + gap 2 + slot 9 = 31 mm of ink, a 29 mm band >= 0.30 x 60 = 18 mm; the 36 mm control: 5 mm < 10.8 mm)
        { name: 'empty band under the lowest ink (H13-ABS, opt-in)', html: page(cell({ h: 60, val: '7' })), want: 'H13-ABS', h13abs: true },
        { name: 'a row sized to its ink (H13-ABS control)', html: page(cell({ h: 36, val: '7' })), want: null, h13abs: true, rules: ['H13-ABS'] },
        { name: 'the 60 mm cell with the rule off (H13-ABS opt-in control)', html: page(cell({ h: 60, val: '7' })), want: null, rules: ['H13-ABS'] },
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
            const r = await sheet.evaluate(cellChecksInPage, { role: t.role || '', key: !!t.key, h13abs: !!t.h13abs });
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
        if (plan && has('card-opts')) for (const v of plan.variants) for (const role of OPT_ROLES.filter((r) => roles.includes(r))) for (const size of SIZES) jobs.push({ k, role, size, opts: Object.assign({}, baseOpts || {}, v.opts), variant: true });
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
    const lessons = [];
    const t0 = Date.now();
    for (const j of jobs) {
        const [cat, id] = j.k.split(':');
        const seed = hash(`${cat}__${id}:${j.role}`) % 1000000;   // ws-grade-render's seed: the critic's pages
        const built = await page.evaluate(async ({ cat, id, role, size, seed, opts }) => {
            try {
                const r = await window.buildSheet({ role, sections: [{ skills: [Object.assign({ categoryId: cat, skillId: id }, opts ? { opts } : {})], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed, form: 'A', key: true, anchors: 'off' });
                const f = Array.isArray(r.fits) ? r.fits[0] : (r.fits && r.fits.sections ? r.fits.sections[0] : r.fits);
                // TITLE (check 7): the provider's own I Can line for THESE options - the print path must print it
                let want = '';
                try { const pr = await import('./js/modules/sheet/roles/practice.js'); want = pr.skillWords({ categoryId: cat, skillId: id, opts: opts || undefined }).iCan; } catch (e) { want = ''; }
                const rule = (() => { const d = document.createElement('div'); d.innerHTML = r.pupilHtml; const el = d.querySelector('.mq-cchant span, .mq-lstripchant span, .mq-lchant'); return el ? el.textContent.trim() : ''; })();
                return { want, rule, pupil: window.sheetDocument(r.pupilHtml, r.title || 't', { paper: 'A4' }), key: window.sheetDocument(r.keyHtml, 'key', { paper: 'A4' }), title: r.title, perPage: f && f.perPage, ceiling: f && f.ceiling, count: f && f.count, cols: f && f.cols, pages: r.pageCount };
            } catch (e) { return e && e.unsupported ? { unsupported: e.message } : { error: String((e && e.stack) || e).slice(0, 300) }; }
        }, { cat, id, role: j.role, size: j.size, seed, opts: j.opts });
        const tag = `${j.k} ${j.role} ${j.size}${j.opts ? ' ' + optsKey(j.opts) : ''}`;
        if (built.unsupported) { console.log(`  n/a  ${tag}: ${built.unsupported.slice(0, 100)}`); continue; }
        if (built.error) { findings.push({ rule: 'ERROR', msg: `${tag}: ${built.error}` }); continue; }
        // TITLE (check 7, D-MP-8, D-CB-2): the page prints the provider's title for its options, a title a signed card
        // decided (tests/fixtures/precritic/card-titles.json) exactly, and never an option value ("(15 jumps)")
        if (RULES.includes('TITLE')) {
            const got = String(built.title || '').replace(/^(Test [AB]|More Practice [A-J]|Reason It|Review|Guided Practice)[:\s-]*/i, '');
            const dec = DECIDED.find((d) => d.skill === j.k && optsKey(d.opts || null) === optsKey(j.opts));
            if (/^I Can /.test(built.title || '') && built.want && built.title !== built.want && !(dec && built.title === dec.iCan)) findings.push({ rule: 'TITLE', msg: `${tag}: the page is titled "${built.title}" but the skill's strings for these options say "${built.want}": the title follows the options dealt (VQ-9, H17)` });
            if (dec && /^I Can /.test(built.title || '') && built.title !== dec.iCan) findings.push({ rule: 'TITLE', msg: `${tag}: the page is titled "${built.title}"; ${dec.source} decided "${dec.iCan}"` });
            if (/\(\d+ jumps\)|\(\w+=/.test(got)) findings.push({ rule: 'TITLE', msg: `${tag}: an option value in the title "${built.title}" (H17)` });
        }
        if (j.role === 'lesson') lessons.push({ k: j.k, size: j.size, opts: j.opts, want: built.want, rule: built.rule });
        const p = await checkDoc(sheet, built.pupil, { role: j.role, key: false, h13abs: h13On(j), words: wordsOn(j) });
        const kk = await checkDoc(sheet, built.key, { role: j.role, key: true, words: wordsOn(j) });
        const here = [
            ...p.problems.map((m) => ({ rule: 'OVERFLOW', msg: `pupil ${m}` })), ...kk.problems.map((m) => ({ rule: 'OVERFLOW', msg: `key ${m}` })),
            ...p.findings, ...kk.findings,
            // LONE-PAGE (critic r6c / r6d D1, H5): a page that holds ONE item where its role's ceiling is 2 or more and 2 or more were
            // dealt - a Grade 2 story printed one a sheet; content never shrinks, so the LAYOUT must fit them (ws-capacity-pin reads
            // only the passed skills)
            ...(Number(built.perPage) === 1 && Number(built.ceiling) >= 2
                ? [{ rule: 'LONE-PAGE', msg: `one item a page where the role holds ${built.ceiling} (H5)` }] : []),
        ].filter((f) => RULES.includes(f.rule)).map((f) => Object.assign({}, f, { msg: `${tag}: ${f.msg}` }));
        findings.push(...here);
        runs.push({ skill: j.k, role: j.role, size: j.size, optsKey: optsKey(j.opts), perPage: built.perPage, cols: built.cols, cells: p.cells });
        console.log(`  ${here.length ? 'FAIL' : 'ok  '} ${tag}: ${built.pages}p ${built.cols}x? per ${built.perPage}${here.length ? ` - ${[...new Set(here.map((f) => f.rule))].join(', ')} (${here.length})` : ''}`);
    }
    if (RULES.includes('SIZE-S')) findings.push(...sizeSFindings(runs));
    // LESSON-OPT (check 7 + speed-up 5): a lesson printed for an option value whose title differs from the default's
    // (another property, another kind) carries its own Rule - never the default lesson's (D-MP-7 / D-MP-8)
    if (RULES.includes('LESSON-OPT')) {
        for (const l of lessons.filter((x) => x.opts)) {
            const d = lessons.find((x) => x.k === l.k && x.size === l.size && !x.opts);
            if (d && l.want && d.want && l.want !== d.want && l.rule && l.rule === d.rule) findings.push({ rule: 'LESSON-OPT', msg: `${l.k} lesson ${l.size} ${optsKey(l.opts)}: titled "${l.want}" but its Rule is the default lesson's ("${l.rule}"): no lesson data for this option value (lessons/prereqs.js byOption)` });
        }
    }
    await app.close();
    const by = {};
    for (const f of findings) by[f.rule] = (by[f.rule] || 0) + 1;
    for (const f of findings.slice(0, Number(arg('show', 60)))) console.log(`  FAIL ${f.rule} ${f.msg}`);
    const secs = Math.round((Date.now() - t0) / 1000);
    if (findings.length) console.log(`ws-cell-checks: FAIL - ${findings.length} finding(s) (${Object.entries(by).map(([k, v]) => `${k} ${v}`).join(', ')}) on ${runs.length} page(s), ${secs}s`);
    else console.log(`ws-cell-checks: OK (${runs.length} page(s), no finding; ${secs}s)`);
    process.exit(findings.length && !has('report-only') ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-cell-checks: FAIL - ' + e.message); process.exit(1); });
