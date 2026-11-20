#!/usr/bin/env node
// ws-psc-lint — the Pre-skill Check's words and deal (lf-roles, critic D2-D4, 2026-11-20). Every passed skill whose signed card
// offers a pre-skill-check page, at M and L (seed 7, the critic's), built through buildSheet and read from its PagePlan:
//   PSC-TITLE    (D2) the page title carries no skill-id fragment: an underscore, or sub / add / mult / div followed by a digit
//                ("Pre-skill check: subtracting sub 1k").
//   PSC-INSTR    (D3) no two adjacent bands (in page order, across a page break too) print the same instruction ("Subtract." twice).
//   PSC-TWIN     (lead A10) no two bands of one plan are dealt from the same skill (twin pools merge into one band).
//   PSC-DEAL     (D4) in one band, at most 2 items share an answer, and no turnaround pair (a + b and b + a, a x b and b x a).
//
//   node tests/scripts/ws-psc-lint.mjs [--skills a:b,c:d] [--sizes M,L] [--seed 7] [--only PSC-TITLE,PSC-INSTR,PSC-DEAL]
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
    const skills = arg('skills', null) ? arg('skills').split(',') : pscSkills();
    const sizes = arg('sizes', 'M,L').split(',');
    const seed = Number(arg('seed', '7'));
    const only = arg('only', null) ? arg('only').split(',') : null;
    const app = await H.open({ seed: 1 });
    const fails = [];
    for (const k of skills) for (const size of sizes) {
        const [c, s] = k.split(':');
        const b = await app.page.evaluate(async (a) => {
            const r = await window.buildSheet({ role: 'pre-skill-check', sections: [{ skills: [{ categoryId: a.c, skillId: a.s }] }], size: a.size, paper: 'A4', seed: a.seed, key: false });
            const bands = [];
            const walk = (sec) => { if (!sec) return; if (sec.kind === 'band') bands.push({ instr: sec.instr || '', n: Number((/__\/(\d+)/.exec(sec.extra || '') || [])[1]) || 0 }); for (const p of sec.parts || []) walk(p); };
            for (const pg of r.plan.pages) for (const sec of pg.sections) walk(sec);
            return { title: (r.plan.header && r.plan.header.title) || '', bands, metaBands: (r.plan.meta && r.plan.meta.bands) || null, items: (r.items || []).map((it) => ({ pool: it.pool, skill: it.skill, text: String((it.q && it.q.text) || it.text || ''), ans: it.q ? it.q.ans : it.ans })) };
        }, { c, s, size, seed });
        const F = (rule, msg) => { if (!only || only.includes(rule)) fails.push(`  FAIL ${rule} ${k} pre-skill-check ${size}: ${msg}`); };
        // (the bands as the role lists them, when it does; else the dealt pools)
        const twinSrc = Array.isArray(b.metaBands) && b.metaBands.length && b.metaBands.every((x) => 'skill' in x) ? b.metaBands.map((x, i) => ({ pool: `b${i}`, skill: x.skill })) : b.items;
        for (const t of twinSkills(twinSrc)) F('PSC-TWIN', `${t} is dealt by two pools (two bands of one skill)`);
        const tb = titleBad(b.title); if (tb) F('PSC-TITLE', `the title "${b.title}" carries the id fragment "${tb}"`);
        for (const i of instrRepeats(b.bands.map((x) => x.instr))) F('PSC-INSTR', `bands ${i} and ${i + 1} both read "${b.bands[i].instr}"`);
        // (the role lists each band's printed items in plan.meta.bands; a tree without it: each band reads the first n of its pool)
        if (Array.isArray(b.metaBands) && b.metaBands.length === b.bands.length) { b.metaBands.forEach((bd, j) => { for (const why of dealBad(bd.items)) F('PSC-DEAL', `band ${j + 1}: ${why}`); }); }
        const pools = [...new Set(b.items.map((it) => it.pool))];
        if (!(Array.isArray(b.metaBands) && b.metaBands.length === b.bands.length)) b.bands.forEach((bd, j) => { const its = b.items.filter((it) => it.pool === pools[j]).slice(0, bd.n); for (const why of dealBad(its)) F('PSC-DEAL', `band ${j + 1}: ${why}`); });
    }
    await app.close();
    for (const f of fails) console.log(f);
    console.log(`ws-psc-lint: ${fails.length ? `FAIL (${fails.length})` : 'OK'} (${skills.length} skill(s) x ${sizes.join('/')}, seed ${seed})`);
    process.exit(fails.length ? 1 : 0);
}

if (argv.includes('--self-test')) selfTest();
else main().catch((e) => { console.log(`ws-psc-lint: FAIL (${String((e && e.message) || e).slice(0, 160)})`); process.exit(1); });
