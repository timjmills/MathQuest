// Verifies:
//  1. symmetry skill produces 30 valid questions (mix of multi-select-check,
//     hot-spot, and original "lines of symmetry" multiple-choice).
//  2. time_analog_digital fires the new dnd-order variant ~30% of the time
//     and produces shape-valid dnd-order payloads (tiles, ans, no dup IDs,
//     ans IDs all in tiles).
//  3. Forced-original sweep (Math.random >= 0.7) yields 0 dnd variants.

const { spawnSync } = require('child_process');

const SCRIPT = `
// Stub browser globals before any module that touches them is imported.
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
globalThis.window = globalThis;
globalThis.document = { createElement: () => ({ style: {}, appendChild: () => {} }), body: { appendChild: () => {} } };

const { generateGeometryQuestion } = await import('./js/modules/gen-geometry.js');
const { generateMeasurementQuestion } = await import('./js/modules/gen-measurement.js');
const { state } = await import('./js/modules/state.js');

state.range = 100;
state.decimalPlaces = 0;

const helpers = {
  rng: (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo,
  range: 100,
  applyDecimals: v => v,
  ensureTables: () => {}
};

function genN(skill, n, generator) {
  const out = [];
  for (let i = 0; i < n; i++) {
    // Mirror generate-question.js dispatcher defaults so any unset fields fall through to defaults.
    const q = { text: "", ans: 0, hint: "", options: [], answerType: "number", visual: "", skillLabel: "" };
    try { generator(q, skill, helpers); }
    catch (e) { return { error: 'throw on ' + skill + ': ' + e.message }; }
    out.push(q);
  }
  return { questions: out };
}

const result = { symmetry: {}, timeAnalogDigital: {}, forcedOriginal: {} };

// --- Part 1: symmetry ---
const symRes = genN('symmetry', 30, generateGeometryQuestion);
if (symRes.error) {
  console.error('SYMMETRY THREW:', symRes.error);
  process.exit(2);
}
let symMsc = 0, symHs = 0, symOrig = 0, symBad = 0;
const symBadList = [];
for (let i = 0; i < symRes.questions.length; i++) {
  const q = symRes.questions[i];
  if (typeof q.text !== 'string' || !q.text.length) { symBad++; symBadList.push('iter ' + i + ': bad text'); continue; }
  if (q.ans === undefined || q.ans === null) { symBad++; symBadList.push('iter ' + i + ': missing ans'); continue; }
  if (!q.answerType) { symBad++; symBadList.push('iter ' + i + ': missing answerType'); continue; }
  if (!q.printFormat) { symBad++; symBadList.push('iter ' + i + ': missing printFormat'); continue; }
  if (q.answerType === 'multi-select-check') {
    symMsc++;
    if (!Array.isArray(q.ans) || q.ans.length === 0) { symBad++; symBadList.push('iter ' + i + ': msc ans not array'); }
    if (!Array.isArray(q.options) || q.options.length === 0) { symBad++; symBadList.push('iter ' + i + ': msc no options'); }
  } else if (q.answerType === 'hot-spot') {
    symHs++;
    if (!Array.isArray(q.hotSpots) || q.hotSpots.length === 0) { symBad++; symBadList.push('iter ' + i + ': hs no spots'); }
    if (!Array.isArray(q.ans) || q.ans.length === 0) { symBad++; symBadList.push('iter ' + i + ': hs ans not array'); }
  } else {
    symOrig++;
    if (typeof q.ans !== 'number' || q.ans < 0 || q.ans > 12) { symBad++; symBadList.push('iter ' + i + ': original ans not sensible: ' + q.ans); }
  }
}
result.symmetry = { msc: symMsc, hs: symHs, original: symOrig, bad: symBad, badList: symBadList };

// --- Part 2: time_analog_digital ---
const tadRes = genN('time_analog_digital', 200, generateMeasurementQuestion);
if (tadRes.error) {
  console.error('TIME_ANALOG_DIGITAL THREW:', tadRes.error);
  process.exit(3);
}
let tadDnd = 0, tadOther = 0, tadBad = 0;
const tadBadList = [];
for (let i = 0; i < tadRes.questions.length; i++) {
  const q = tadRes.questions[i];
  if (q.answerType === 'dnd-generic') {
    tadDnd++;
    if (q.dndMode !== 'order') { tadBad++; tadBadList.push('iter ' + i + ': dndMode != order'); continue; }
    if (!Array.isArray(q.tiles) || q.tiles.length !== 4) { tadBad++; tadBadList.push('iter ' + i + ': tiles not 4: ' + (q.tiles ? q.tiles.length : 'null')); continue; }
    if (!Array.isArray(q.ans) || q.ans.length !== 4) { tadBad++; tadBadList.push('iter ' + i + ': ans not 4'); continue; }
    const tileIds = new Set(q.tiles.map(t => t.id));
    if (tileIds.size !== 4) { tadBad++; tadBadList.push('iter ' + i + ': dup tile ids'); }
    const ansSet = new Set(q.ans);
    if (ansSet.size !== 4) { tadBad++; tadBadList.push('iter ' + i + ': dup ans ids'); }
    for (const id of q.ans) {
      if (!tileIds.has(id)) { tadBad++; tadBadList.push('iter ' + i + ': ans id ' + id + ' not in tiles'); break; }
    }
    for (const t of q.tiles) {
      if (typeof t.label !== 'string' || !t.label.length) { tadBad++; tadBadList.push('iter ' + i + ': bad tile label'); break; }
    }
    if (q.printFormat !== 'dnd-generic') { tadBad++; tadBadList.push('iter ' + i + ': printFormat=' + q.printFormat); }
  } else {
    tadOther++;
    if (typeof q.text !== 'string' || !q.text.length) { tadBad++; tadBadList.push('iter ' + i + ': non-dnd missing text'); }
  }
}
result.timeAnalogDigital = { dnd: tadDnd, other: tadOther, bad: tadBad, badList: tadBadList.slice(0, 5), totalRun: tadRes.questions.length };

// --- Part 3: Forced-original sweep (Math.random >= 0.7) ---
const origRandom = Math.random;
Math.random = () => 0.85;
const forced = genN('time_analog_digital', 50, generateMeasurementQuestion);
Math.random = origRandom;
let forcedDnd = 0;
for (const q of forced.questions) {
  if (q.answerType === 'dnd-generic') forcedDnd++;
}
result.forcedOriginal = { dnd: forcedDnd, total: 50 };

console.log('===JSON_BEGIN===');
console.log(JSON.stringify(result, null, 2));
console.log('===JSON_END===');
`;

const child = spawnSync(process.execPath, ['--input-type=module', '-e', SCRIPT], { cwd: __dirname, encoding: 'utf8' });
if (child.status !== 0) {
  console.error('Child failed:', child.status);
  console.error('stderr:', child.stderr);
  console.error('stdout:', child.stdout);
  process.exit(child.status || 1);
}

const beginIdx = child.stdout.indexOf('===JSON_BEGIN===');
const endIdx = child.stdout.indexOf('===JSON_END===');
if (beginIdx < 0 || endIdx < 0) {
  console.error('Could not find JSON markers in stdout:');
  console.error(child.stdout);
  process.exit(1);
}
const jsonStr = child.stdout.slice(beginIdx + '===JSON_BEGIN==='.length, endIdx).trim();
const data = JSON.parse(jsonStr);
let failures = 0;

// Symmetry
const sym = data.symmetry;
console.log('=== Symmetry (30 questions) ===');
console.log('  multi-select-check:', sym.msc, ' hot-spot:', sym.hs, ' original:', sym.original, ' bad:', sym.bad);
if (sym.bad > 0) {
  console.error('  FAIL: bad symmetry questions:', sym.badList.slice(0, 5));
  failures++;
}
if (sym.msc + sym.hs + sym.original !== 30) {
  console.error('  FAIL: count mismatch');
  failures++;
}
if (sym.original < 1) {
  console.error('  FAIL: never produced original lines-of-symmetry variant');
  failures++;
}

// time_analog_digital
const tad = data.timeAnalogDigital;
const dndPct = (tad.dnd / tad.totalRun * 100).toFixed(1);
console.log('\n=== time_analog_digital (' + tad.totalRun + ' questions) ===');
console.log('  dnd-order:', tad.dnd, '(' + dndPct + '%)  other:', tad.other, '  bad:', tad.bad);
if (tad.bad > 0) {
  console.error('  FAIL: bad time_analog_digital questions:', tad.badList);
  failures++;
}
if (tad.dnd / tad.totalRun < 0.18 || tad.dnd / tad.totalRun > 0.42) {
  console.error('  FAIL: dnd variant rate ' + dndPct + '% outside [18%, 42%] (target 30%)');
  failures++;
}
if (tad.dnd < 1) {
  console.error('  FAIL: dnd-order variant never fired');
  failures++;
}

// Forced-original sweep
const fo = data.forcedOriginal;
console.log('\n=== Forced original sweep (Math.random=0.85, ' + fo.total + ' questions) ===');
console.log('  dnd-order count:', fo.dnd, ' (expected 0)');
if (fo.dnd !== 0) {
  console.error('  FAIL: dnd variant fired even when Math.random >= 0.7');
  failures++;
}

if (failures > 0) {
  console.error('\n' + failures + ' failure(s).');
  process.exit(1);
}
console.log('\nAll checks passed.');
