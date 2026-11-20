// ws-mix-review — the MIXED REVIEW page type's product checks (card design/cards/mixed-review/mixed-review.md §8, build
// step 1 MR-E). Six checks plus the AREA_LABELS assert and the card trace, each with ONE named fixture per FAIL state under
// tests/fixtures/mix-review/<check>/{fail,pass,pending}/.
//
//   node tests/scripts/ws-mix-review.mjs                          # every check (a pending state makes the run PENDING)
//   node tests/scripts/ws-mix-review.mjs --check count,share      # some checks: count|pool|share|hosts|week|breakdown|labels|trace
//   node tests/scripts/ws-mix-review.mjs --built-only             # pending states are listed, not counted (precritic's gate)
//   node tests/scripts/ws-mix-review.mjs --fixture <file|dir>     # only these fixtures (ws-backtest): a FAIL dir prints
//                                                                 # "ws-mix-review: FAIL" when EVERY fixture is caught for its reason
//   node tests/scripts/ws-mix-review.mjs --sample <json>          # also deal the pinned precritic filter sample through V1
//   node tests/scripts/ws-mix-review.mjs --pin                    # build step 2 ONCE: generate the frozen V1 table from the live
//                                                                 # registry (append-only after: an existing row never changes),
//                                                                 # pin the four V1 files by sha256, regenerate the golden codes
//   node tests/scripts/ws-mix-review.mjs --pin --reclass          # the same, letting an existing row change ONLY its kind (lead
//                                                                 # ruling 2026-11-20: allowed while no V1 code has shipped)
//
// The Node cores ARE check-v1's properties (design/cards/mixed-review/proto/check-v1.mjs), run on the PRODUCT dealer
// js/modules/mixed-review.js through check-v1's `configure()` (card §9b step 1, §10 L8):
//   COUNT b c d e h j j2 k l p · POOL g n (+ b c d) · SHARE a i m · WEEK f (+ a for the day codes) · HOSTS, BREAKDOWN browser.
// A state whose product code is not built reports PENDING, never PASS: a props fixture while js/modules/mixed-review.js is
// missing, a module state while its module or export is missing, and every fixture under pending/ (named with its build step).
// A FAIL fixture must be CAUGHT, and when it names `catchText`, caught for that reason.
// Prints `ws-mix-review: OK` / `FAIL (n)` / `PENDING (n)`; exit 0 / 1 / 3 (2 usage, 4 a FAIL fixture that was not caught).

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FIX = join(ROOT, 'tests/fixtures/mix-review');
const TOOL = 'ws-mix-review';
const args = process.argv.slice(2);
const arg = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const J = (x) => JSON.stringify(x);
globalThis.localStorage ||= { getItem: () => null, setItem() {}, removeItem() {} };   // data.js reads it at import
const quiet = async (url) => { const log = console.log; console.log = () => {}; try { return await import(url); } catch (e) { return { __error: e }; } finally { console.log = log; } };
const mod = async (rel) => (existsSync(join(ROOT, rel)) ? quiet(pathToFileURL(join(ROOT, rel)).href) : null);

export const CHECKS = {
    count: { core: ['b', 'c', 'd', 'e', 'h', 'j', 'j2', 'k', 'l', 'p'] },
    pool: { core: ['g', 'n', 'b', 'c', 'd'], failCore: ['g', 'n'] },
    share: { core: ['a', 'i', 'm'] },
    week: { core: ['f', 'a'], failCore: ['f'] },
    hosts: { core: [] },
    breakdown: { core: [] },
    labels: { core: [] },
    trace: { core: [] },
};
const PRODUCT_DEALER = 'js/modules/mixed-review.js';
const POOL_MODULE = 'js/modules/mixed-review-pool.js';
const PRODUCT_FROZEN = { dealer: PRODUCT_DEALER, interleave: 'js/modules/sheet/interleave.js', rng: 'js/modules/sheet/rng.js', registry: 'tests/fixtures/mix-review/v1-registry.json' };

/* ------------------------------------------------------------------------------------- tampers (FAIL states only) */
// A tamper edits the product's OUTPUT for a FAIL state the frozen dealer has no `_mutate` seam for. It never runs on a PASS
// fixture, and the dealer is never edited.
const TAMPERS = {
    'halves-misnumbered': (out) => { if (out.halves) out.halves[1] = out.halves[1].slice().reverse(); },
};

/* ------------------------------------------------------------------------------------------- the card's tables */
const CARD = join(ROOT, 'design/cards/mixed-review/mixed-review.md');
/** The §7a "Area labels" table: {area: label}, read from the signed card (the source of truth). */
export function cardAreaLabels(md = readFileSync(CARD, 'utf8')) {
    const lines = md.split('\n'); const at = lines.findIndex((l) => /^\| Area \| Label \|/.test(l));
    const out = {};
    for (let i = at + 2; at >= 0 && i < lines.length && /^\|/.test(lines[i]); i++) { const c = lines[i].split('|').map((x) => x.trim()); out[c[1]] = c[2]; }
    return out;
}
function walk(dir, out = []) {
    for (const f of readdirSync(dir)) { const p = join(dir, f); const st = statSync(p); if (st.isDirectory()) walk(p, out); else if (/\.(m?js|cjs|json|html|css)$/.test(f)) out.push(p); }
    return out;
}

/* ------------------------------------------------------------------------------------------- module states */
// Each returns {pending: reason} or an array of violation strings. `fx.replace` / `fx.patch` tamper the product's output.
async function stateLabels(fx) {
    const A = await mod('js/modules/teacher-areas.js');
    if (!A || A.__error) return { pending: `teacher-areas.js does not import (${A && A.__error && A.__error.message})` };
    if (!A.AREA_LABELS) return { pending: 'AREA_LABELS is not exported by js/modules/teacher-areas.js yet (build step 1b)' };
    const want = cardAreaLabels(); const got = { ...A.AREA_LABELS, ...(fx.override || {}) };
    const v = [];
    if (Object.keys(want).length !== 11) v.push(`the card §7a Area labels table has ${Object.keys(want).length} rows, not 11`);
    if (J(Object.keys(got).sort()) !== J(Object.keys(want).sort())) v.push(`labels-changed: AREA_LABELS keys ${Object.keys(got).join(' ')} != the card's ${Object.keys(want).join(' ')}`);
    for (const [k, s] of Object.entries(want)) if (got[k] !== s) v.push(`labels-changed: AREA_LABELS.${k} = ${J(got[k])}, the card §7a says ${J(s)}`);
    const strings = Object.values(want);
    const files = walk(join(ROOT, 'js')).concat((fx.scanExtra || []).map((f) => join(ROOT, f)));
    for (const f of files) {
        if (relative(ROOT, f) === 'js/modules/teacher-areas.js') continue;
        const src = readFileSync(f, 'utf8');
        if (strings.every((s) => src.includes(s))) v.push(`labels-second-map: ${relative(ROOT, f)} holds all 11 AREA_LABELS strings (a second whole map)`);
    }
    return v;
}
// A row's kind is the provider's StaticFootprint.kind AS IS (a non-empty string). V1 classes it through its frozen
// KIND_CLASS, and rowOf reads a kind KIND_CLASS does not list as typical (not legacy): the class is V1's either way.
const KIND_OK = (D, k) => typeof k === 'string' && k.length > 0;
async function poolCtx() {
    const P = await mod(POOL_MODULE); const D = await mod(PRODUCT_DEALER);
    if (!P || !D) return { pending: `${!P ? POOL_MODULE : PRODUCT_DEALER} is not built yet (build step 2)` };
    if (P.__error || D.__error) return { error: `import failed: ${(P.__error || D.__error).message}` };
    const F = await mod('js/modules/skill-codes-frozen.js'); const R = await mod('js/modules/redesign-passed.js'); const DATA = await mod('js/modules/data.js');
    return { P, D, FROZEN: F.FROZEN_SKILL_CODES, PASSED: new Set(R.REDESIGN_PASSED), DATA };
}
const patchRows = (rows, patch = []) => rows.map((r, i) => { const p = patch.find((x) => x.index === i || x.id === r.id); return p ? { ...r, ...p.set } : r; });
async function statePool(fx) {
    const c = await poolCtx(); if (c.pending || c.error) return c.pending ? c : [c.error];
    const { P, D, FROZEN, PASSED } = c;
    for (const k of ['poolRows', 'DEFAULT_FILTERS', 'weightsFrom']) if (!(k in P)) return { pending: `${POOL_MODULE} has no ${k} export yet` };
    const v = [];
    let rows = patchRows(P.poolRows(), fx.rowsPatch);
    if (fx.rowsDropKind) rows = rows.map((r) => { const { kind, ...rest } = r; return { ...rest, fc: D.KIND_CLASS[kind] || 'typical' }; });
    // L4: rows carry the StaticFootprint kind, never a class (`fc`), so V1's frozen KIND_CLASS decides the class
    for (const r of rows) {
        if ('fc' in r) { v.push(`pool-row-fc: ${r.id} carries fc ${r.fc} (a class), not its footprint kind`); break; }
        if (!KIND_OK(D, r.kind)) { v.push(`pool-row-fc: ${r.id} kind ${J(r.kind)} is not a footprint kind`); break; }
    }
    // lead ruling 2026-11-20 ("footprint kinds"): a row's kind is the kind of the template its skill DRAWS, never the provider
    // footprint while a drawn template is recorded; every live row is recorded; every drawn template has a frozen TEMPLATE_KIND row
    const T = await mod('js/modules/mixed-review-templates.js');
    if (!T || T.__error || !D.TEMPLATE_KIND) v.push('pool-kind-footprint: js/modules/mixed-review-templates.js or V1 TEMPLATE_KIND is missing');
    else {
        const drawn = T.DRAWN_TEMPLATES;
        if (fx.rowsKindFrom === 'footprint') rows = rows.map((r) => ({ ...r, kind: P.footprintKind(...r.id.split(':')) }));
        for (const t of new Set(Object.values(drawn))) if (!(t in D.TEMPLATE_KIND)) { v.push(`pool-kind-footprint: drawn template ${t} has no frozen TEMPLATE_KIND row`); break; }
        for (const r of rows) {
            if (!(r.id in drawn)) { v.push(`pool-kind-footprint: ${r.id} has no drawn template recorded (run node tests/scripts/ws-mix-review-templates.cjs)`); break; }
            if (r.kind !== D.kindOfTemplate(drawn[r.id])) { v.push(`pool-kind-footprint: ${r.id} kind ${r.kind} is not the kind of its drawn template ${drawn[r.id]} (${D.kindOfTemplate(drawn[r.id])})`); break; }
        }
    }
    // L5: every row's code is its frozen share code
    for (const r of rows) if (r.code !== FROZEN[r.id]) { v.push(`pool-code-unfrozen: ${r.id} code ${r.code} != FROZEN_SKILL_CODES ${FROZEN[r.id]}`); break; }
    // only-8/10: passed is REDESIGN_PASSED membership, read live
    for (const r of rows) if (!!r.passed !== PASSED.has(r.id)) { v.push(`pool-passed-leak: ${r.id} passed=${!!r.passed}, REDESIGN_PASSED says ${PASSED.has(r.id)}`); break; }
    // MIXED / NOSTD never in the registry pool
    for (const r of rows) if (r.area === 'MIXED' || r.area === 'NOSTD') { v.push(`pool-filter-leak: ${r.id} is ${r.area}, never in the pool`); break; }
    const defs = { ...P.DEFAULT_FILTERS, ...(fx.defaultsPatch || {}) };
    if (defs.onlyPassed !== false) v.push(`pool-default-on: DEFAULT_FILTERS.onlyPassed = ${J(defs.onlyPassed)} (lead ruling §9.6: off while the passed pool is small)`);
    if (defs.count !== 10 || defs.order !== 'mixed' || defs.week || defs.fromLessons) v.push(`pool-default-on: defaults ${J(defs)} are not 10 problems, order mixed, week off, from my lessons off (§9.15)`);
    // 200 seeded filter sets through V1 deal alone: every dealt skill matches the filters, is passed when only-8/10 is on
    const grades = ['K', '1', '2', '3', '4', '5', '6']; const areas = ['CC', 'OA', 'NBT', 'NF', 'MEAS', 'DATA', 'G', 'RPNS', 'WORDS'];
    const { rng } = await mod('js/modules/sheet/rng.js');
    let dealt = 0, refused = 0;
    for (let s = 1; s <= 200 && v.length < 6; s++) {
        const r = rng(s * 7919);
        const f = { grades: grades.filter(() => r() < 0.35), areas: areas.filter(() => r() < 0.5), onlyPassed: r() < 0.4 };
        f.untick = rows.filter(() => r() < 0.05).map((x) => x.id);
        const N = D.COUNTS[Math.floor(r() * 6)];
        const out = D.deal({ pool: rows, filters: f, N, seed: s, size: r() < 0.5 ? 'm' : 'l', order: 'mixed' });
        if (out.error) { refused++; continue; }
        dealt++;
        const byId = new Map(rows.map((x) => [x.id, x]));
        for (const it of out.items) {
            const row = byId.get(it.skill);
            const pl = (row.placement && row.placement.length ? row.placement : [row.grade]).map(String);
            const gOk = !f.grades.length || pl.some((g) => f.grades.includes(g)) || (row.grade === 'M' && !(row.placement && row.placement.length));
            if (!gOk || (f.areas.length && !f.areas.includes(row.area)) || f.untick.includes(it.skill)) { v.push(`pool-filter-leak: seed ${s}: ${it.skill} is off the filters ${J(f).slice(0, 120)}`); break; }
            if (f.onlyPassed && !PASSED.has(it.skill)) { v.push(`pool-passed-leak: seed ${s}: ${it.skill} dealt with only-8/10 on, not in REDESIGN_PASSED`); break; }
        }
    }
    if (dealt < 50) v.push(`pool sweep: only ${dealt} of 200 filter sets dealt (${refused} refused): the sweep proves too little`);
    // the weighting formula (§7a Weighting): w = 1 + due + weak, due 1 (+1 at Leitner box 1 or 2), weak at total >= 5 and mastery < 70
    const today = '2026-11-20';
    const prog = { a: { total: 6, mastery: 50 }, b: { total: 4, mastery: 10 }, c: { total: 9, mastery: 90 } };
    const sr = { a: { nextReview: '2026-11-19', box: 1 }, b: { nextReview: '2026-11-25', box: 3 }, c: { nextReview: '2026-11-20', box: 4 } };
    const want = { a: 4, b: 1, c: 2, d: 1 };
    const weightsFrom = fx.replace && fx.replace.weightsFrom === 'ones' ? () => ({ a: 1, b: 1, c: 1, d: 1 }) : P.weightsFrom;
    const got = weightsFrom(prog, sr, ['a', 'b', 'c', 'd'], today);
    for (const [k, w] of Object.entries(want)) if (got[k] !== w) { v.push(`pool-weights-formula: w(${k}) = ${got[k]}, the §7a formula gives ${w}`); break; }
    return v;
}
async function stateShare(fx) {
    const c = await poolCtx(); if (c.pending || c.error) return c.pending ? c : [c.error];
    const { D, FROZEN } = c;
    const SC = await mod('js/modules/skill-codes.js');
    if (!SC || SC.__error) return [`skill-codes.js does not import: ${SC && SC.__error && SC.__error.message}`];
    const v = [];
    const tableFile = join(FIX, 'v1-registry.json');
    if (!existsSync(tableFile)) return { pending: 'tests/fixtures/mix-review/v1-registry.json is not generated yet (build step 2)' };
    const table = patchRows(JSON.parse(readFileSync(tableFile, 'utf8')).rows, fx.tablePatch);
    // L5: the frozen V1 table's codes ARE the frozen share codes; kinds are V1 kinds; no class column
    for (const r of table) if (r.code !== FROZEN[r.id]) { v.push(`share-table-code: V1 table ${r.id} code ${r.code} != FROZEN_SKILL_CODES ${FROZEN[r.id]}`); break; }
    for (const r of table) if ('fc' in r || !KIND_OK(D, r.kind)) { v.push(`share-table-code: V1 table ${r.id} has ${'fc' in r ? 'an fc class' : `kind ${J(r.kind)}`}, not a footprint kind`); break; }
    // ONE codec: skill-codes.js generateEnhancedSkillCode writes D.encode's string byte for byte; parseEnhancedSkillCode reads it back
    if (!SC.generateEnhancedSkillCode || !SC.parseEnhancedSkillCode) return [...v, 'skill-codes.js lacks generateEnhancedSkillCode / parseEnhancedSkillCode'];
    const hand = (input, out) => D.encode(input, out).replace(/-S([0-9A-Z]+)/, (m, s) => `-S${s.toLowerCase()}`).slice(3);   // a second, hand codec
    const gen = fx.replace && fx.replace.codec === 'hand' ? hand : (input, out) => SC.generateEnhancedSkillCode(null, { mixReview: { input, out } });
    const { rng } = await mod('js/modules/sheet/rng.js');
    const r = rng(20261120); let n = 0;
    for (let k = 0; k < 100 && v.length < 6; k++) {
        const N = D.COUNTS[Math.floor(r() * 6)]; const seed = 100000 + Math.floor(r() * 900000);
        const order = ['mixed', 'easyhard', 'area'][Math.floor(r() * 3)]; const size = r() < 0.5 ? 'm' : 'l';
        const wk = k % 5 === 0 ? 1 + Math.floor(r() * 40) : null; const day = wk && k % 10 === 0 ? 1 + Math.floor(r() * 5) : null;
        const pool = table.filter(() => r() < 0.04);
        const input = { pool, N, seed, order, size, ...(wk ? { week: wk } : {}), ...(day ? { day } : {}) };
        const out = wk ? D.week({ ...input, day: undefined }) : D.deal(input);
        if (out.error) continue;
        n++;
        const code = D.encode(input, out);
        const g = '?c=' + gen(input, out);
        if (g !== code) { v.push(`share-two-codecs: generateEnhancedSkillCode wrote ${g}, D.encode ${code}`); continue; }
        const p = SC.parseEnhancedSkillCode(code.slice(3)); const d = D.decode(code);
        const mr = p.settings && p.settings.mixReview;
        if (!mr) { v.push(`share-two-codecs: parseEnhancedSkillCode read no mixReview settings from ${code}`); continue; }
        for (const key of ['v', 'N', 'seed', 'order', 'week', 'day', 'adapt', 'size']) if (J(mr[key]) !== J(d[key])) { v.push(`share-two-codecs: ${code}: parseEnhancedSkillCode ${key} ${J(mr[key])} != D.decode ${J(d[key])}`); break; }
        if (J(mr.skills) !== J(d.skills)) v.push(`share-two-codecs: ${code}: skills / counts / ~options read back ${J(mr.skills)} != ${J(d.skills)}`);
    }
    if (n < 50) v.push(`share-two-codecs: only ${n} of 100 mixes dealt`);
    return v;
}
async function stateWeekDays(fx) {
    const D = await mod(PRODUCT_DEALER);
    if (!D) return { pending: `${PRODUCT_DEALER} is not built yet (build step 2)` };
    const v = [];
    const pools = ['pool-large', 'pool-6', 'pool-2mix', 'pool-kinds'].map((p) => JSON.parse(readFileSync(join(FIX, 'pools', `${p}.json`), 'utf8')));
    for (const pool of pools) for (const N of [5, 10, 20]) for (const size of ['m', 'l']) for (let seed = 1; seed <= 8 && v.length < 4; seed++) {
        const input = { pool, N, seed, size, order: 'mixed', week: 12 };
        const w = D.week(input); if (w.error) continue;
        for (let d = 1; d <= 5; d++) {
            const code = D.encode({ ...input, day: d }, w);
            const dec = D.decode(code); const rin = D.replayInput(dec, pool);
            if (fx.tamper === 'day-shift') rin.day = (d % 5) + 1;
            const alone = D.deal(rin);
            if (alone.error || J(alone.items) !== J(w.days[d - 1].items)) { v.push(`week-day-differs: ${code} rebuilds another sheet than day ${d} of its week`); break; }
        }
    }
    return v;
}
async function stateTrace(fx) {
    const C = await import(pathToFileURL(join(ROOT, 'design/cards/mixed-review/proto/check-v1.mjs')).href);
    let md = readFileSync(CARD, 'utf8');
    if (fx.insert) { const lines = md.split('\n'); const at = lines.findIndex((l) => l.startsWith(fx.insert.after)); lines.splice(at + 1, 0, fx.insert.text); md = lines.join('\n'); }
    return C.trace(md).bad.map((b) => `trace: ${b}`);
}
const MODULE_STATES = { labels: stateLabels, pool: statePool, share: stateShare, 'week-days': stateWeekDays, trace: stateTrace };

/* ---------------------------------------------------------------------------------------------------- runner */
let C1 = null;
async function propsEngine() {
    if (C1) return C1;
    if (!existsSync(join(ROOT, PRODUCT_DEALER))) return (C1 = { pending: `${PRODUCT_DEALER} is not built yet (build step 2: the V1 dealer moved)` });
    const C = await import(pathToFileURL(join(ROOT, 'design/cards/mixed-review/proto/check-v1.mjs')).href);
    const D = await import(pathToFileURL(join(ROOT, PRODUCT_DEALER)).href);
    if (!existsSync(join(FIX, 'frozen.json'))) return (C1 = { pending: 'tests/fixtures/mix-review/frozen.json is not pinned yet (build step 2)' });
    C.configure({ dealer: D, fixDir: FIX, poolDir: join(FIX, 'pools'), frozenFiles: PRODUCT_FROZEN });
    return (C1 = C);
}
/** One fixture: {status: PASS | CAUGHT | FAIL | PENDING, why}. */
async function runOne(fx) {
    if (fx.pending) return { status: 'PENDING', why: `${fx.pending}: ${fx.note || ''}` };
    let viol;
    if (fx.module) {
        const res = await MODULE_STATES[fx.module](fx);
        if (res && res.pending) return { status: 'PENDING', why: res.pending };
        viol = res;
    } else {
        const C = await propsEngine();
        if (C.pending) return { status: 'PENDING', why: C.pending };
        viol = C.runFixture(fx, fx.tamper ? { tamper: TAMPERS[fx.tamper] } : {});
    }
    if (fx.expect === 'pass') return viol.length ? { status: 'FAIL', why: `PASS fixture has ${viol.length} violation(s): ${viol.slice(0, 3).join(' | ')}` } : { status: 'PASS', why: '' };
    const hit = viol.find((x) => (!fx.catch || x.startsWith(`(${fx.catch})`)) && (!fx.catchText || x.includes(fx.catchText)) && (!fx.catchState || x.includes(fx.catchState)));
    return hit ? { status: 'CAUGHT', why: hit.slice(0, 140) } : { status: 'NOT-CAUGHT', why: `FAIL fixture not caught${fx.catch ? ` by (${fx.catch})` : ''}${fx.catchText ? ` "${fx.catchText}"` : ''} [${viol.slice(0, 2).join('; ')}]` };
}
function fixturesOf(p) {
    const abs = resolve(ROOT, p);
    if (!existsSync(abs)) return [];
    if (statSync(abs).isFile()) return [abs];
    return walk(abs).filter((f) => f.endsWith('.json') && !f.includes('/pools/'));
}
/** --pin (card §9b step 2): the product's frozen V1 table, its sha256 pins and its golden codes. Append-only: a row already in
 *  the table is never changed or removed (a changed row FAILS the pin); new live skills are appended. */
async function pin() {
    const { writeFileSync } = await import('node:fs');
    const { createHash } = await import('node:crypto');
    const c = await poolCtx(); if (c.pending || c.error) { console.log(`${TOOL}: FAIL (--pin: ${c.pending || c.error})`); return 1; }
    const tf = join(FIX, 'v1-registry.json');
    const old = existsSync(tf) ? JSON.parse(readFileSync(tf, 'utf8')).rows : [];
    const live = c.P.poolRows().map((r) => ({ id: r.id, code: r.code, grade: r.grade, area: r.area, kind: r.kind }));
    const byId = new Map(old.map((r) => [r.id, r]));
    const reclass = args.includes('--reclass');       // lead ruling 2026-11-20: kinds re-derived BEFORE any V1 code ships
    if (reclass) for (const r of live) { const o = byId.get(r.id); if (o && J({ ...o, kind: r.kind }) === J(r)) byId.set(r.id, r); }
    if (reclass) for (let i = 0; i < old.length; i++) old[i] = byId.get(old[i].id);
    for (const r of live) { const o = byId.get(r.id); if (o && J(o) !== J(r)) { console.log(`${TOOL}: FAIL (--pin: frozen row ${r.id} would change ${J(o)} -> ${J(r)}; append-only, a change ships as V2)`); return 1; } }
    const rows = [...old, ...live.filter((r) => !byId.has(r.id))];
    writeFileSync(tf, JSON.stringify({ note: 'FROZEN V1 TABLE (card §9b step 2, §10 L4 / L5): code -> {id, kind, grade, area} of every live skill outside MIXED / NOSTD, generated ONCE by `node tests/scripts/ws-mix-review.mjs --pin` from mixed-review-pool.js poolRows (code = FROZEN_SKILL_CODES[id]; kind = the provider footprint kind as is; grade = data.js getSkillGrade, M when none). A V1 code replays through this table only, never the live registry. Append-only: a new skill appends a row; no row changes. Pinned by sha256 in frozen.json.', rows }, null, 1) + '\n');
    const sha = (f) => createHash('sha256').update(readFileSync(join(ROOT, f), 'utf8')).digest('hex');
    writeFileSync(join(FIX, 'frozen.json'), JSON.stringify({ files: PRODUCT_FROZEN, sha256: Object.fromEntries(Object.entries(PRODUCT_FROZEN).map(([k, f]) => [k, sha(f)])), note: 'V1 freeze of the PRODUCT (card §7a, §9b step 2): js/modules/mixed-review.js (= design/cards/mixed-review/proto/dealer-v1.mjs with its two import paths changed, the only diff), the two kit files it imports (pins unchanged from the prototype) and the product frozen table. A change that changes a deal ships as V2.' }, null, 1) + '\n');
    const g = JSON.parse(readFileSync(join(ROOT, 'design/cards/mixed-review/proto/fixtures/golden-v1.json'), 'utf8'));
    const D = c.D; const listOf = (o) => (o.days ? o.days : [o]).map((s) => s.items.map((it) => [it.n, it.skill, it.opts || '', it.seed, it.page]));
    const goldenOf = (o) => ({ pages: (o.days ? o.days : [o]).map((s) => s.pages.map((p) => p.n)), items: listOf(o) });
    const codes = [];
    for (const sp of g.specs) {
        const input = { ...sp, pool: rows };
        const o = input.week ? D.week({ ...input, day: undefined }) : D.deal(input);
        if (o.error) { console.log(`${TOOL}: FAIL (--pin: golden spec ${J(sp)} refused: ${o.error})`); return 1; }
        const code = D.encode(sp, o);
        const rin = D.replayInput(D.decode(code), rows); const r2 = rin.week && !rin.day ? D.week(rin) : D.deal(rin);
        const want = goldenOf(sp.day ? o.days[sp.day - 1] : o);
        if (J(goldenOf(r2)) !== J(want)) { console.log(`  (spec ${J(sp)}: ${code} replays to another sheet: card §10 L1, MR-SHARE-EXACT; not pinned as golden)`); continue; }
        codes.push({ code, ...want });
    }
    writeFileSync(join(FIX, 'golden-v1.json'), JSON.stringify({ note: 'PRODUCT GOLDEN V1 CODES (card §9b step 2): each code replays, through tests/fixtures/mix-review/v1-registry.json alone, to its pinned pages and items [n, skill, ~options, seed, page] (check-v1 prop i on the product). The specs are the prototype golden specs over the product table.', specs: g.specs, codes }, null, 1) + '\n');
    console.log(`${TOOL}: OK (--pin: ${rows.length} table rows (${rows.length - old.length} appended), 4 sha256 pins, ${codes.length} of ${g.specs.length} golden codes)`);
    return 0;
}
async function main() {
    if (args.includes('--pin')) return pin();
    if (args.includes('--help')) { console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n')); return 0; }
    const want = (arg('--check') || Object.keys(CHECKS).join(',')).split(',').map((s) => s.trim()).filter(Boolean);
    for (const c of want) if (!CHECKS[c]) { console.log(`${TOOL}: unknown check ${c} (${Object.keys(CHECKS).join('|')})\n${TOOL}: FAIL (usage)`); return 2; }
    const builtOnly = args.includes('--built-only');
    const fixArg = arg('--fixture');
    const files = fixArg ? fixturesOf(fixArg) : want.flatMap((c) => fixturesOf(`tests/fixtures/mix-review/${c}`));
    if (!files.length) { console.log(`${TOOL}: no fixtures under ${fixArg || want.join(',')}\n${TOOL}: FAIL (no fixtures)`); return 2; }
    const tally = {}; const bad = []; const pend = []; const notCaught = [];
    for (const f of files.sort()) {
        const fx = JSON.parse(readFileSync(f, 'utf8'));
        if (fixArg && !want.includes(fx.check) && arg('--check')) continue;
        const r = await runOne(fx);
        const name = relative(FIX, f).replace(/\.json$/, '');
        console.log(`  ${r.status.padEnd(10)} ${name}${r.why ? `  ${r.why}` : ''}`);
        (tally[fx.check] ||= { pass: 0, caught: 0, pending: 0, props: { pass: new Set(), fail: new Set() } });
        const t = tally[fx.check];
        if (r.status === 'PASS') { t.pass++; (fx.props || []).forEach((p) => t.props.pass.add(p)); }
        else if (r.status === 'CAUGHT') { t.caught++; if (fx.catch) t.props.fail.add(fx.catch); }
        else if (r.status === 'PENDING') { t.pending++; pend.push(`${name} (${r.why.split(':')[0]})`); }
        else if (r.status === 'NOT-CAUGHT') notCaught.push(`${name}: ${r.why}`);
        else bad.push(`${name}: ${r.why}`);
    }
    // every core property of a check has a PASS and a FAIL fixture once the product dealer runs (r2 resolution 6)
    if (!fixArg) for (const c of want) {
        const t = tally[c]; if (!t || !CHECKS[c].core.length) continue;
        if ((await propsEngine()).pending) continue;
        for (const p of CHECKS[c].core) {
            if (!t.props.pass.has(p)) bad.push(`check ${c}: core property ${p} has no PASS fixture`);
            if ((CHECKS[c].failCore || CHECKS[c].core).includes(p) && !t.props.fail.has(p)) bad.push(`check ${c}: core property ${p} has no FAIL fixture`);
        }
    }
    if (args.includes('--sample')) {
        const sample = JSON.parse(readFileSync(resolve(ROOT, arg('--sample')), 'utf8'));
        const c = await poolCtx();
        if (c.pending) pend.push(`sample (${c.pending})`);
        else for (const s of sample.sample || []) {
            const out = c.D.deal({ pool: c.P.poolRows(), filters: s.filters, N: s.N, seed: s.seed, size: s.size, order: s.order });
            console.log(`  SAMPLE     ${s.id}: ${out.error ? `refused: ${out.error}` : `${out.items.length} items on ${out.pages.length} page(s), ${new Set(out.items.map((i) => i.skill)).size} skills`}`);
            if (out.error && !s.expectRefusal) bad.push(`sample ${s.id}: refused: ${out.error}`);
        }
    }
    for (const [c, t] of Object.entries(tally)) console.log(`  check ${c}: ${t.pass} PASS, ${t.caught} CAUGHT, ${t.pending} PENDING`);
    if (notCaught.length) { console.log(`${TOOL}: ERROR (${notCaught.length} FAIL fixture(s) not caught)\n  ${notCaught.join('\n  ')}`); return 4; }
    if (bad.length) { console.log(`${TOOL}: FAIL (${bad.length})\n  ${bad.join('\n  ')}`); return 1; }
    // a --fixture run over FAIL states: every one caught is the FAIL the backtest expects
    const caught = Object.values(tally).reduce((a, t) => a + t.caught, 0);
    if (fixArg && caught && !pend.length) { console.log(`${TOOL}: FAIL (${caught} FAIL state(s) caught, each for its reason)`); return 1; }
    if (pend.length && !builtOnly) { console.log(`${TOOL}: PENDING (${pend.length} state(s) not built: ${pend.slice(0, 8).join(', ')}${pend.length > 8 ? ', ...' : ''})`); return 3; }
    console.log(`${TOOL}: OK (${Object.values(tally).reduce((a, t) => a + t.pass, 0)} PASS, ${caught} CAUGHT${pend.length ? `; built states only, ${pend.length} PENDING: ${[...new Set(pend.map((p) => p.split('/')[0]))].join(', ')}` : ''})`);
    return 0;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exit(await main());
