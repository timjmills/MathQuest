// Content audit for + - x / skills: does a skill actually generate what its name promises?
// The skill id encodes a number band ("within 10", "within 100", "within 1,000") and often a
// regrouping promise. This checks the generated items against both, and reports the edge-case
// coverage PEDAGOGY_STANDARD.md requires (a zero operand, ragged operand lengths, regrouping in
// each column, every unknown position).
//
//   node tests/scripts/ws-content-audit.cjs                  # all operations skills
//   node tests/scripts/ws-content-audit.cjs --n 300 --skill add_20
//   node tests/scripts/ws-content-audit.cjs --json out.json
const fs = require('fs');
const path = require('path');
const { ROOT, open, listSkills, hideOverlays } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const N = parseInt(arg('n', '200'), 10);
const ONLY = arg('skill', null);
const JSON_OUT = arg('json', null);
const CATS = ['addition', 'subtraction', 'multiplication', 'division'];

// The band a skill id promises. null = the id makes no numeric promise.
function declaredBand(id) {
  if (/_10k|_10000/.test(id)) return 10000;
  if (/_1k\b|_1000\b/.test(id)) return 1000;
  if (/_100\b|_100_/.test(id)) return 100;
  if (/_20\b|_20_/.test(id)) return 20;
  if (/_10\b|_10_/.test(id)) return 10;
  if (/_5\b/.test(id)) return 5;
  if (/facts?\b/.test(id)) return 12 * 12;      // fact tables: checked by operand, not by result
  return null;
}
const promisesRegroup = id => /_regroup\b|_regroup_|with_regroup/.test(id) && !/no_regroup/.test(id);
const promisesNoRegroup = id => /no_regroup/.test(id);
const isFacts = id => /facts?\b/.test(id);

function sample(skill, N) {
  const st = window.state;
  const saved = { category: st.category, skill: st.skill, range: st.range, decimalPlaces: st.decimalPlaces, gameMode: st.gameMode, isMixedMode: st.isMixedMode };
  st.category = skill.categoryId; st.skill = skill.skillId; st.range = 100; st.decimalPlaces = 0;
  st.gameMode = 'practice'; st.isMixedMode = false;
  if (!st.selectedNumbers || !st.selectedNumbers.length) st.selectedNumbers = Array.from({ length: 12 }, (_, i) => i + 1);
  const items = [];
  for (let i = 0; i < N; i++) {
    let q;
    try { q = window.generateQuestion(); } catch (e) { continue; }
    if (!q) continue;
    items.push({ a: q.a, b: q.b, op: q.op, ans: q.ans, fmt: q.printFormat || '', type: q.answerType || '', text: String(q.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90) });
  }
  Object.assign(st, saved);
  return items;
}

function audit(skill, items) {
  const band = declaredBand(skill.skillId);
  const facts = isFacts(skill.skillId);
  const r = { n: items.length, withAB: 0, overBand: 0, maxResult: 0, zeroOperand: 0, ragged: 0,
    regroupItems: 0, noRegroupItems: 0, ops: {}, formats: {}, types: {}, unknownPositions: {}, worst: [] };
  for (const it of items) {
    const f = it.fmt || '(none)'; r.formats[f] = (r.formats[f] || 0) + 1;
    const t = it.type || '(none)'; r.types[t] = (r.types[t] || 0) + 1;
    if (it.a === undefined || it.b === undefined || !it.op) {
      // a missing-number item still counts for unknown-position coverage
      if (/_+\s*[+−\-x×*\/÷]/.test(it.text)) r.unknownPositions.first = (r.unknownPositions.first || 0) + 1;
      continue;
    }
    r.withAB++;
    const a = +it.a, b = +it.b, op = String(it.op);
    r.ops[op] = (r.ops[op] || 0) + 1;
    // The number the band is about: + -> the sum, - -> the minuend, x -> the product, / -> the dividend
    const result = op === '+' ? a + b : (op === '-' || op === '−') ? a : (op === '/' || op === '÷') ? a : a * b;
    r.maxResult = Math.max(r.maxResult, result);
    const measured = facts ? Math.max(Math.abs(a), Math.abs(b)) : result;
    if (band !== null && measured > band) {
      r.overBand++;
      if (r.worst.length < 4) r.worst.push(`${a}${op}${b}`);
    }
    if (a === 0 || b === 0) r.zeroOperand++;
    if (String(Math.abs(a)).length !== String(Math.abs(b)).length) r.ragged++;
    if (op === '+') ((a % 10) + (b % 10) >= 10 ? r.regroupItems++ : r.noRegroupItems++);
    else if (op === '-' || op === '−') ((a % 10) < (b % 10) ? r.regroupItems++ : r.noRegroupItems++);
    const m = it.text.match(/(_{2,}|\?)/g);
    if (m) r.unknownPositions.some = (r.unknownPositions.some || 0) + 1;
  }
  r.band = band;
  r.distinctResults = new Set(items.map(i => (i.a !== undefined && i.b !== undefined ? `${i.a}${i.op}${i.b}` : i.text))).size;
  const fails = [];
  if (r.n === 0) fails.push('generates nothing');
  if (band !== null && r.overBand > r.withAB * 0.02) fails.push(`${Math.round(100 * r.overBand / Math.max(1, r.withAB))}% outside the band of ${band} (worst ${r.worst.join(', ')}, max ${r.maxResult})`);
  if (promisesRegroup(skill.skillId) && r.regroupItems < r.withAB * 0.95) fails.push(`promises regrouping but ${r.withAB - r.regroupItems} of ${r.withAB} items do not regroup`);
  if (promisesNoRegroup(skill.skillId) && r.regroupItems > 0) fails.push(`promises no regrouping but ${r.regroupItems} of ${r.withAB} items regroup`);
  if (promisesRegroup(skill.skillId) && band !== null && band <= 10) fails.push('the band makes regrouping impossible: a sum within 10 never regroups');
  if (Object.keys(r.ops).length > 1) fails.push(`mixes operations in one skill: ${Object.entries(r.ops).map(([k, v]) => k + ' x' + v).join(', ')}`);
  if (r.n >= 20 && r.distinctResults < r.n * 0.5) fails.push(`repeats itself: only ${r.distinctResults} distinct items in ${r.n}`);
  // A missing zero operand is a ladder-level note, not a per-skill failure: by the owner's
  // ruling the zero set comes last for + and -, so a mid-ladder skill rightly has none. Only a
  // fact set, which claims to cover a whole table, must include its zero facts.
  const notes = [];
  if (r.withAB >= 20 && r.zeroOperand === 0) (facts ? fails : notes).push('never generates a zero operand; a fact set must cover its zero facts (P-AT-5)');
  if (Object.keys(r.formats).length > 2) fails.push(`silently mixes ${Object.keys(r.formats).length} print formats: ${Object.keys(r.formats).join(', ')}`);
  if ((r.types['multiple-choice'] || 0) > 0) fails.push(`${r.types['multiple-choice']} items are multiple choice on screen (parity rule P-29)`);
  return { ...r, fails, notes };
}

(async () => {
  const { page, close } = await open({ seed: 4242 });
  await hideOverlays(page);
  let skills = (await listSkills(page)).filter(s => CATS.includes(s.categoryId));
  if (ONLY) skills = skills.filter(s => s.skillId === ONLY);
  const out = [];
  for (let i = 0; i < skills.length; i++) {
    await page.evaluate(n => window.__wsReseed(n), 5000 + i);
    const items = await page.evaluate(sample, skills[i], N);
    const a = audit(skills[i], items);
    out.push({ ...skills[i], ...a });
  }
  await close();

  const bad = out.filter(s => s.fails.length);
  for (const s of out) {
    const tag = s.fails.length ? 'FAIL' : (s.notes || []).length ? 'note' : ' ok ';
    const lines = [...s.fails.map(f => '       - ' + f), ...(s.notes || []).map(n => '       . ' + n)];
    console.log(`${tag} ${s.categoryId}/${s.skillId}${lines.length ? '\n' + lines.join('\n') : ''}`);
  }
  console.log(`\n${out.length} operations skills audited, ${bad.length} fail, ${out.length - bad.length} pass (${N} items each, Max Number 100).`);
  const tally = {};
  for (const s of out) for (const f of s.fails) {
    const k = f.replace(/\d+(\.\d+)?%?/g, 'N').replace(/\(.*/, '').trim();
    tally[k] = (tally[k] || 0) + 1;
  }
  console.log('\nFailures by kind:');
  for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
  if (JSON_OUT) { fs.writeFileSync(path.resolve(ROOT, JSON_OUT), JSON.stringify(out, null, 1)); console.log('wrote', JSON_OUT); }
  process.exitCode = 0;   // report-only: this is a baseline today, a gate after P4
})().catch(e => { console.error(e); process.exit(1); });
