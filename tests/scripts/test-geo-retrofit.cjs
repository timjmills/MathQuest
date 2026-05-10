// Phase 4.5 batch 8 verification: multi-select + hot-spot variants on geometry skills.
// Spawns Node ESM child to import gen-geometry.js and exercise each retrofit skill.

const { spawnSync } = require('child_process');
const path = require('path');

const SKILLS = [
  'name_2d_shapes',
  'name_3d_shapes',
  'classify_triangles',
  'classify_quads',
  'identify_lines',
  'identify_angles',
  'symmetry',
  'shape_attributes'
];

const HS_SKILLS = ['identify_angles', 'identify_lines', 'symmetry'];

const N = 60;

const child = spawnSync(process.execPath, ['--input-type=module', '-e', `
import { generateGeometryQuestion } from './js/modules/gen-geometry.js';
import { state } from './js/modules/state.js';

const skills = ${JSON.stringify(SKILLS)};
const N = ${N};

state.range = 100;
state.decimalPlaces = 0;

const helpers = {
  rng: (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo,
  range: 100,
  applyDecimals: v => v,
  ensureTables: () => {}
};

const out = {};
for (const sk of skills) {
  const counts = { msc: 0, hs: 0, original: 0, totalShape: { textOk: 0, ansOk: 0, ridsOk: 0 } };
  for (let i = 0; i < N; i++) {
    const q = {};
    try {
      generateGeometryQuestion(q, sk, helpers);
    } catch (e) {
      console.error('Generator threw on', sk, ':', e.message);
      process.exit(2);
    }
    if (q.answerType === 'multi-select-check') {
      counts.msc++;
      if (typeof q.text === 'string' && q.text.length > 0) counts.totalShape.textOk++;
      if (Array.isArray(q.ans) && q.ans.length >= 1) counts.totalShape.ansOk++;
      if (Array.isArray(q.options) && q.options.every(o => typeof o.id === 'string')) counts.totalShape.ridsOk++;
      // Verify ans IDs all map to options with correct=true
      const optMap = new Map(q.options.map(o => [o.id, o.correct]));
      const allCorrectInAns = q.ans.every(id => optMap.get(id) === true);
      const noUncorrectMissing = q.options.filter(o => o.correct).every(o => q.ans.includes(o.id));
      if (!allCorrectInAns || !noUncorrectMissing) {
        console.error('MSC ans/options mismatch on', sk, JSON.stringify({ ans: q.ans, options: q.options.map(o => ({id: o.id, c: o.correct})) }));
        process.exit(3);
      }
    } else if (q.answerType === 'hot-spot') {
      counts.hs++;
      if (typeof q.text === 'string' && q.text.length > 0) counts.totalShape.textOk++;
      if (Array.isArray(q.ans) && q.ans.length >= 1) counts.totalShape.ansOk++;
      if (typeof q.backgroundSvg !== 'string' || q.backgroundSvg.indexOf('<svg') < 0) {
        console.error('HS missing backgroundSvg on', sk);
        process.exit(4);
      }
      if (!Array.isArray(q.hotSpots) || q.hotSpots.length === 0) {
        console.error('HS missing hotSpots on', sk);
        process.exit(5);
      }
      const ids = new Set(q.hotSpots.map(h => h.id));
      const ansIdsValid = q.ans.every(id => ids.has(id));
      if (!ansIdsValid) {
        console.error('HS ans IDs not in hotSpots on', sk, JSON.stringify({ans: q.ans, hsIds: [...ids]}));
        process.exit(6);
      }
    } else {
      counts.original++;
    }
  }
  out[sk] = counts;
}
console.log(JSON.stringify(out, null, 2));
`], { cwd: __dirname, encoding: 'utf8' });

if (child.status !== 0) {
  console.error('Child failed status', child.status);
  console.error('stderr:', child.stderr);
  console.error('stdout:', child.stdout);
  process.exit(child.status || 1);
}

const data = JSON.parse(child.stdout);
console.log('=== Variant rates per skill (N=' + N + ') ===');
let failures = 0;
for (const sk of SKILLS) {
  const c = data[sk];
  const mscPct = (c.msc / N * 100).toFixed(1);
  const hsPct = (c.hs / N * 100).toFixed(1);
  const oPct = (c.original / N * 100).toFixed(1);
  const isHsSkill = HS_SKILLS.includes(sk);
  console.log(`${sk.padEnd(22)} msc=${mscPct}%${isHsSkill ? `  hs=${hsPct}%` : ''}  original=${oPct}%`);
  if (c.msc < 1) {
    console.error(`  FAIL: MSC variant never fired for ${sk}`);
    failures++;
  }
  if (isHsSkill && c.hs < 1) {
    console.error(`  FAIL: HS variant never fired for ${sk}`);
    failures++;
  }
  // Sanity: msc rate should be in [10%, 50%] window for 60-question sample (~30% target, generous bounds)
  if (c.msc / N < 0.10 || c.msc / N > 0.55) {
    console.error(`  WARN: MSC rate outside expected window for ${sk}: ${mscPct}%`);
  }
  if (isHsSkill) {
    if (c.hs / N < 0.05 || c.hs / N > 0.45) {
      console.error(`  WARN: HS rate outside expected window for ${sk}: ${hsPct}%`);
    }
  } else {
    if (c.hs > 0) {
      console.error(`  FAIL: HS fired on non-HS skill ${sk}`);
      failures++;
    }
  }
  // Verify shape integrity on all variant questions
  const variantTotal = c.msc + c.hs;
  if (variantTotal > 0) {
    if (c.totalShape.textOk !== variantTotal) {
      console.error(`  FAIL: ${variantTotal - c.totalShape.textOk} variants missing q.text on ${sk}`);
      failures++;
    }
    if (c.totalShape.ansOk !== variantTotal) {
      console.error(`  FAIL: ${variantTotal - c.totalShape.ansOk} variants missing q.ans on ${sk}`);
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} failures.`);
  process.exit(1);
}
console.log('\nAll skills passed retrofit checks.');
