#!/usr/bin/env node
// ws-psc-lint — the Pre-skill Check's words and deal (lf-roles, critic D2-D4, 2026-11-20). Every passed skill whose signed card
// offers a pre-skill-check page, at M and L (seed 7, the critic's), built through buildSheet and read from its PagePlan:
//   PSC-TITLE    (D2) the page title carries no skill-id fragment: an underscore, or sub / add / mult / div followed by a digit
//                ("Pre-skill check: subtracting sub 1k").
//   PSC-INSTR    (D3) no two adjacent bands of one page print the same instruction ("Subtract." twice) - across a page break the
//                new page prints its own (PG-22: a page carries its instruction; one strip cannot span two sheets);
//                (critic d2d5 r1 D-1) and no strip carries a parenthesised tag or a skill's label ("Write the answer: subtraction
//                number line.", "(within 10, no pictures)"): two adjacent bands of one task kind SHARE one strip instead.
//   PSC-STRIP1   (critic d2d5 r1 L1) every strip's instruction prints on ONE line at its width (the page's heights count one line).
//   PSC-LESSON   (critic d2d5 r1 L1) a detailed lesson's Prerequisite Check pages (pupil and key, --lessons, seeds 4242 and 1;
//                the critic's g3-oa8-two-step-wp by default on a full run): every strip on one line, and every band's bottom
//                above the page's footer top (the frame never overprints the footer), measured in the DOM.
//   PSC-TWIN-MIX (critic d2d5 r1 M2) a band merged from twin pools holds items of both pools, when both have items.
//   PSC-TWIN     (lead A10) no two bands of one plan are dealt from the same skill (twin pools merge into one band).
//   PSC-DEAL     (D4) in one band, at most 2 items share an answer, and no turnaround pair (a + b and b + a, a x b and b x a).
//
//   Forms A and B both (critic d2d5 r1 M1: Form B's shuffle broke the sign floor).
//
//   node tests/scripts/ws-psc-lint.mjs [--skills a:b,c:d] [--sizes M,L] [--seeds 7,1] [--form A|B|A,B] [--only PSC-TITLE,...]
//                                      [--lessons id,id | --lessons none] [--lesson-seeds 4242,1]
//   node tests/scripts/ws-psc-lint.mjs --self-test          # the pure judges, no browser
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(`--${k}`); return i > -1 ? argv[i + 1] : d; };

/** D2: an id fragment in a title, or null. Pure. */
export const titleBad = (t) => { const m = /_|\b(?:sub|add|mult|div)\s*\d/i.exec(String(t || '')); return m ? m[0] : null; };
/** PSC-TWIN: the skills dealt by more than one pool, from [{pool, skill}]. Pure. */
export const twinSkills = (items) => { const by = new Map(); for (const it of items) { if (!it.skill) continue; const s = by.get(it.skill) || new Set(); s.add(it.pool); by.set(it.skill, s); } return [...by].filter(([, s]) => s.size > 1).map(([k]) => k); };
/** D3: the indexes i where band i and band i + 1 print the same (non-empty) instruction. Pure. */
export const instrRepeats = (instrs) => instrs.map((x, i) => (i && x && String(x).trim() === String(instrs[i - 1]).trim() ? i : -1)).filter((i) => i > -1);
/** D-1: a strip's text that carries a parenthesised tag or one of `labels` (a skill label, its tag dropped), or null; a string
 *  of the instruction library (`library`, its {n} slots filled by anything) is never a tail ("Count on (+) or back (−)."). Pure. */
export function stripTagBad(text, labels = [], library = []) {
    const t = String(text || '');
    const reOf = (v) => new RegExp(`^${String(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{\w+\\\}/g, '.+?')}$`);
    if (library.some((v) => reOf(v).test(t.trim()))) return null;
    const m = /\([^)]*\)/.exec(t);
    if (m) return m[0];
    const low = t.toLowerCase().replace(/\s+/g, ' ');
    for (const l of labels) {
        const core = String(l || '').replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (core.split(' ').length >= 2 && low.includes(core)) return core;
    }
    return null;
}
/** M2: a merged twin band's pools, from its items' pools and the pools its skill dealt; true when it mixes them. Pure. */
export const twinMixed = (bandPools, skillPools) => skillPools.length < 2 || skillPools.every((p) => bandPools.includes(p));
const factOf = (text) => { const m = /(\d+)\s*([+×x*])\s*(\d+)/.exec(String(text || '')); return m ? { a: +m[1], op: m[2] === '+' ? '+' : 'x', b: +m[3] } : null; };
export const SIGN_ANS = /^"?(?:[<>=]|true|false|yes|no|True|False|Yes|No)"?$/;
/** D4: the defects of one band's items [{text, ans}]: answers shared by 3+, turnaround pairs. Pure. */
export function dealBad(items) {
    const out = [];
    const by = new Map();
    for (const it of items) { const k = JSON.stringify(it.ans); by.set(k, (by.get(k) || 0) + 1); }
    // (a sign or yes / no answer has only two or three values: a compare band shares them by nature)
    for (const [k, n] of by) if (n > 2 && !SIGN_ANS.test(k)) out.push(`${n} items share the answer ${k}`);
    // (lead A10 sign floor: a compare band - every answer a sign - shows at least 2 different signs, never one sign 3 in a row)
    const signs = items.map((it) => JSON.stringify(it.ans));
    if (signs.length >= 2 && signs.every((k) => /^"[<>=]"$/.test(k))) {
        if (new Set(signs).size < 2) out.push(`a compare band of ${signs.length} shows one sign only (${signs[0]})`);
        for (let i = 2; i < signs.length; i++) if (signs[i] === signs[i - 1] && signs[i] === signs[i - 2]) { out.push(`the sign ${signs[i]} three times in a row (items ${i - 1}-${i + 1})`); break; }
    }
    const fs0 = items.map((it) => factOf(it.text));
    for (let i = 0; i < fs0.length; i++) for (let j = i + 1; j < fs0.length; j++) {
        const p = fs0[i], q = fs0[j];
        if (p && q && p.op === q.op && p.a !== p.b && p.a === q.b && p.b === q.a) out.push(`turnaround pair ${p.a} ${p.op} ${p.b} / ${q.a} ${q.op} ${q.b}`);
    }
    return out;
}

function selfTest() {
    const t = [
        ['D2 id leak', titleBad('Pre-skill check: subtracting sub 1k'), 'sub 1'],
        ['D2 underscore', titleBad('Pre-skill check: sub_1k'), '_'],
        ['D2 clean', titleBad('Pre-skill check: subtracting within 1,000 (no regrouping)'), null],
        ['D2 "add 2-digit numbers" is a verb, not an id? (add + digit) flags', titleBad('Pre-skill check: add 2 numbers'), 'add 2'],
        ['D3 repeat', instrRepeats(['Subtract.', 'Subtract.', 'Add.']).join(), '1'],
        ['D-1 label tail', stripTagBad('Draw the jumps on the line. Write the answer: subtraction number line.', ['Subtraction Number Line']), 'subtraction number line'],
        ['D-1 option tag', stripTagBad('Solve: subtraction word problems (within 10, no pictures).', []), '(within 10, no pictures)'],
        ['D-1 clean', stripTagBad('Draw the jumps on the line. Write the answer.', ['Subtraction Number Line', 'Number Line Subtraction (b&w)']), null],
        ['D-1 one-word label is no tail', stripTagBad('Subtract.', ['Subtract']), null],
        ['D-1 a library string with brackets is no tag', stripTagBad('Count on (+) or back (−). Write the missing numbers.', [], ['Count on (+) or back (−). Write the missing numbers.']), null],
        ['D-1 a library string with a slot', stripTagBad('Count by 5. Write the missing numbers.', ['Count by 5s'], ['Count by {n}. Write the missing numbers.']), null],
        ['D-1 a label-made line is no library string', stripTagBad('Subtract within 10.', ['Subtract within 10'], ['Subtract.']), 'subtract within 10'],
        ['TWIN-MIX one pool only', twinMixed(['q2'], ['q2', 'q3']), false],
        ['TWIN-MIX both', twinMixed(['q2', 'q3'], ['q2', 'q3']), true],
        ['TWIN-MIX not a twin', twinMixed(['q0'], ['q0']), true],
        ['D3 none', instrRepeats(['Subtract.', 'Add.', 'Subtract.']).length, 0],
        ['TWIN two pools one skill', twinSkills([{ pool: 'q2', skill: 'a:b' }, { pool: 'q3', skill: 'a:b' }, { pool: 'q0', skill: 'a:c' }]).join(), 'a:b'],
        ['TWIN distinct', twinSkills([{ pool: 'q0', skill: 'a:b' }, { pool: 'q1', skill: 'a:c' }]).length, 0],
        ['D4 three 12s', dealBad([{ ans: 12 }, { ans: 12 }, { ans: 12 }]).length, 1],
        ['D4 two 12s ok', dealBad([{ ans: 12 }, { ans: 12 }]).length, 0],
        ['D4 turnaround', dealBad([{ text: '5 + 7 =', ans: 12 }, { text: '7 + 5 =', ans: 12 }]).length, 1],
        ['D4 three ">" is no shared-answer fail (the sign floor judges it)', dealBad([{ ans: '>' }, { ans: '>' }, { ans: '>' }]).some((x) => /share the answer/.test(x)), false],
        ['SIGN one sign only', dealBad([{ ans: '>' }, { ans: '>' }]).some((x) => /one sign only/.test(x)), true],
        ['SIGN three in a row', dealBad([{ ans: '<' }, { ans: '>' }, { ans: '>' }, { ans: '>' }]).some((x) => /three times in a row/.test(x)), true],
        ['SIGN mixed ok', dealBad([{ ans: '<' }, { ans: '>' }, { ans: '>' }, { ans: '=' }, { ans: '>' }]).length, 0],
        ['D4 double not a turnaround', dealBad([{ text: '6 + 6 =', ans: 12 }, { text: '6 + 6 =', ans: 12 }]).length, 0],
    ];
    const bad = t.filter(([, got, want]) => got !== want);
    for (const [n, got, want] of bad) console.log(`  FAIL ${n}: got ${got}, want ${want}`);
    console.log(`ws-psc-lint self-test: ${bad.length ? `FAIL (${bad.length})` : `OK (${t.length})`}`);
    process.exit(bad.length ? 1 : 0);
}

/** The passed skills whose signed card offers pre-skill-check. */
function pscSkills() {
    const src = fs.readFileSync(path.join(ROOT, 'js', 'modules', 'redesign-passed.js'), 'utf8');
    const ids = [...new Set([...src.matchAll(/^\s*'([a-z0-9_]+:[a-z0-9_]+)',?\s*$/gm)].map((m) => m[1]))];
    return ids.filter((k) => { try { const p = JSON.parse(execFileSync(process.execPath, [path.join(ROOT, 'tests', 'lib', 'ws-card-plan.mjs'), '--skill', k, '--root', ROOT], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))[0]; return p && (p.roles || []).includes('pre-skill-check') && !(p.hidden || []).includes('pre-skill-check'); } catch (e) { return false; } });
}

async function main() {
    const H = require(path.join(__dirname, '..', 'lib', 'ws-harness.cjs'));
    const skills = arg('skills', null) === 'none' ? [] : arg('skills', null) ? arg('skills').split(',') : pscSkills();
    const sizes = arg('sizes', 'M,L').split(',');
    const seeds = String(arg('seeds', arg('seed', '7'))).split(',').map(Number);
    const forms = String(arg('form', 'A,B')).toUpperCase().split(',');
    const only = arg('only', null) ? arg('only').split(',') : null;
    const app = await H.open({ seed: 1 });
    // (PSC-STRIP1 measures the printed strips in a page of their own, the sheet's own document and styles)
    const doc = await app.browser.newPage();
    await doc.setViewport({ width: 900, height: 1200 });
    await doc.goto(app.page.url(), { waitUntil: 'domcontentloaded' });
    // (the instruction library of the served tree)
    const LIB = await app.page.evaluate(async () => Object.values((await import('./js/modules/sheet/contract.js')).INSTRUCTION_LIBRARY));
    const fails = [];
    for (const k of skills) for (const size of sizes) for (const seed of seeds) for (const form of forms) {
        const [c, s] = k.split(':');
        const b = await app.page.evaluate(async (a) => {
            const r = await window.buildSheet({ role: 'pre-skill-check', sections: [{ skills: [{ categoryId: a.c, skillId: a.s }] }], size: a.size, paper: 'A4', seed: a.seed, form: a.form, key: false });
            const bands = [];
            const walk = (sec) => { if (!sec) return; if (sec.kind === 'band') bands.push({ page: pi, instr: sec.instr || '', n: Number((/__\/(\d+)/.exec(sec.extra || '') || [])[1]) || 0 }); for (const p of sec.parts || []) walk(p); };
            let pi = 0;
            for (const pg of r.plan.pages) { for (const sec of pg.sections) walk(sec); pi++; }
            const items = (r.items || []).map((it) => ({ pool: it.pool, skill: it.skill, text: String((it.q && it.q.text) || it.text || ''), ans: it.q ? it.q.ans : it.ans }));
            const labelOf = (key) => { const [cc, ss] = String(key || '').split(':'); const row = ((window.SKILLS || {})[cc] || []).find((x) => x.v === ss); return row ? row.l : ''; };
            const labels = [...new Set(items.map((it) => it.skill).filter(Boolean))].map(labelOf).filter(Boolean);
            return { title: (r.plan.header && r.plan.header.title) || '', bands, labels, html: window.sheetDocument(r.pupilHtml, 't', { paper: 'A4' }), metaBands: (r.plan.meta && r.plan.meta.bands) || null, items };
        }, { c, s, size, seed, form });
        const tagOf = `${k} pre-skill-check ${size} seed ${seed} Form ${form}`;
        const F = (rule, msg) => { if (!only || only.includes(rule)) fails.push(`  FAIL ${rule} ${tagOf}: ${msg}`); };
        // (the bands as the role lists them, when it does; else the dealt pools)
        const metaOk = Array.isArray(b.metaBands) && b.metaBands.length && b.metaBands.every((x) => 'skill' in x);
        const twinSrc = metaOk ? b.metaBands.map((x, i) => ({ pool: `b${i}`, skill: x.skill })) : b.items;
        for (const t of twinSkills(twinSrc)) F('PSC-TWIN', `${t} is dealt by two pools (two bands of one skill)`);
        const tb = titleBad(b.title); if (tb) F('PSC-TITLE', `the title "${b.title}" carries the id fragment "${tb}"`);
        // (PSC-INSTR: the printed strips in page order - a shared strip is one band section, so it is one strip here)
        for (const i of instrRepeats(b.bands.map((x) => (x.instr ? `p${x.page} ${x.instr}` : '')))) F('PSC-INSTR', `bands ${i} and ${i + 1} both read "${b.bands[i].instr}" (two strips of one instruction: share one)`);
        for (const [j, bd] of b.bands.entries()) { const bad = stripTagBad(bd.instr, b.labels, LIB); if (bad) F('PSC-INSTR', `strip ${j + 1} "${bd.instr}" carries "${bad}" (a tag or a skill label means nothing to a pupil)`); }
        // (PSC-DEAL: the role lists each band's printed items in plan.meta.bands; a tree without it: each band reads the first n of its pool)
        if (Array.isArray(b.metaBands) && b.metaBands.length && b.metaBands.every((x) => Array.isArray(x.items))) b.metaBands.forEach((bd, j) => { for (const why of dealBad(bd.items)) F('PSC-DEAL', `band ${j + 1}: ${why}`); });
        else { const pools = [...new Set(b.items.map((it) => it.pool))]; b.bands.forEach((bd, j) => { const its = b.items.filter((it) => it.pool === pools[j]).slice(0, bd.n); for (const why of dealBad(its)) F('PSC-DEAL', `band ${j + 1}: ${why}`); }); }
        // (PSC-TWIN-MIX: a band whose skill two pools dealt holds items of both; an item's pool from the role, else by its text)
        if (metaOk) for (const [j, bd] of b.metaBands.entries()) {
            const skillPools = [...new Set(b.items.filter((it) => it.skill && it.skill === bd.skill).map((it) => it.pool))];
            if (skillPools.length < 2) continue;
            const bandPools = [...new Set((bd.items || []).map((x) => x.pool || (b.items.find((it) => it.skill === bd.skill && it.text === x.text) || {}).pool).filter(Boolean))];
            if (!twinMixed(bandPools, skillPools)) F('PSC-TWIN-MIX', `band ${j + 1} (${bd.skill}) prints items of ${bandPools.join(', ') || 'no pool'} only, of the pools ${skillPools.join(', ')} that deal it`);
        }
        // (PSC-STRIP1: each strip's instruction on one line, measured)
        await doc.setContent(b.html, { waitUntil: 'load' });
        await doc.evaluate(() => document.fonts && document.fonts.ready);
        const lines = await doc.evaluate(() => [...document.querySelectorAll('.ws-strip > span:not(.mq-quadscore)')].map((e) => ({ t: e.textContent, n: (() => { const rg = document.createRange(); rg.selectNodeContents(e); return new Set([...rg.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top))).size; })() })));
        for (const l of lines) if (l.n > 1) F('PSC-STRIP1', `the strip "${l.t}" wraps to ${l.n} lines (the page counts one)`);
    }
    // (PSC-LESSON: a lesson's check deals perQuestion, its own path - its pages are measured as printed)
    const lessons = arg('lessons', arg('skills', null) ? 'none' : 'g3-oa8-two-step-wp');
    if (lessons !== 'none') {
        const conn = await require('puppeteer').connect({ browserWSEndpoint: app.browser.wsEndpoint(), protocolTimeout: 0, defaultViewport: null });
        const lp = (await conn.pages()).find((p) => p.url() === app.page.url());
        for (const id of lessons.split(',')) for (const seed of String(arg('lesson-seeds', '4242,1')).split(',').map(Number)) {
            await lp.evaluate(`window.__psc = undefined; window.buildSheet({ role: 'detailed-lesson', lessonId: ${JSON.stringify(id)}, seed: ${seed}, paper: 'A4', year: 2026 }).then((r) => { window.__psc = { html: r.html }; }, (e) => { window.__psc = { error: String(e && e.message || e) }; }); 0`);
            await lp.waitForFunction(() => window.__psc !== undefined, { timeout: 0, polling: 500 });
            const r = await lp.evaluate(() => window.__psc);
            const F = (rule, msg) => { if (!only || only.includes(rule)) fails.push(`  FAIL ${rule} detailed/${id} seed ${seed}: ${msg}`); };
            if (r.error) { F('PSC-LESSON', `the lesson did not build (${r.error.slice(0, 100)})`); continue; }
            await doc.setContent(r.html, { waitUntil: 'load' });
            await doc.evaluate(() => document.fonts && document.fonts.ready);
            const pgs = await doc.evaluate(() => [...document.querySelectorAll('.ws-page')].map((pg, i) => ({ i: i + 1, psc: pg.getAttribute('data-ws-role') === 'pre-skill-check', title: `${pg.classList.contains('ws-key') ? 'key' : 'pupil'} check`,
                foot: pg.querySelector('.ws-foot') ? pg.querySelector('.ws-foot').getBoundingClientRect().top : null,
                bottom: Math.max(0, ...[...pg.querySelectorAll('.ws-band')].map((b) => b.getBoundingClientRect().bottom)),
                strips: [...pg.querySelectorAll('.ws-strip > span:not(.mq-quadscore)')].map((e) => ({ t: e.textContent, n: (() => { const rg = document.createRange(); rg.selectNodeContents(e); return new Set([...rg.getClientRects()].filter((q) => q.width > 0).map((q) => Math.round(q.top))).size; })() })) }))
                .filter((pg) => pg.psc));
            if (!pgs.length) F('PSC-LESSON', 'no Prerequisite Check page in the lesson');
            for (const pg of pgs) {
                for (const l of pg.strips) if (l.n > 1) F('PSC-LESSON', `page ${pg.i} "${pg.title}": the strip "${l.t}" wraps to ${l.n} lines`);
                if (pg.foot !== null && pg.bottom > pg.foot + 0.5) F('PSC-LESSON', `page ${pg.i} "${pg.title}": the frame ends ${((pg.bottom - pg.foot) * 25.4 / 96).toFixed(1)} mm below the footer top (it overprints the footer)`);
            }
            console.log(`  (lesson ${id} seed ${seed}: ${pgs.length} Prerequisite Check page(s) measured)`);
        }
        conn.disconnect();
    }
    await doc.close();
    await app.close();
    for (const f of fails) console.log(f);
    console.log(`ws-psc-lint: ${fails.length ? `FAIL (${fails.length})` : 'OK'} (${skills.length} skill(s) x ${sizes.join('/')} x seed ${seeds.join('/')} x Form ${forms.join('/')})`);
    process.exit(fails.length ? 1 : 0);
}

if (argv.includes('--self-test')) selfTest();
else main().catch((e) => { console.log(`ws-psc-lint: FAIL (${String((e && e.message) || e).slice(0, 160)})`); process.exit(1); });
