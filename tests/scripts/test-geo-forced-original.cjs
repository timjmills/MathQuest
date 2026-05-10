// When Math.random() always returns 0.95, NO variant should fire (all gates < 0.7).
const { spawnSync } = require('child_process');

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

const N = 60;

const child = spawnSync(process.execPath, ['--input-type=module', '-e', `
// Stub Math.random so it always returns 0.95 (above all variant gates 0.30/0.286)
const _origRand = Math.random;
Math.random = () => 0.95;

import('./js/modules/state.js').then(async (sm) => {
  const gm = await import('./js/modules/gen-geometry.js');
  const skills = ${JSON.stringify(SKILLS)};
  const out = {};
  const helpers = {
    rng: (lo, hi) => Math.floor(_origRand() * (hi - lo + 1)) + lo,
    range: 100,
    applyDecimals: v => v,
    ensureTables: () => {}
  };
  sm.state.range = 100;
  sm.state.decimalPlaces = 0;
  for (const sk of skills) {
    const counts = { msc: 0, hs: 0, original: 0 };
    for (let i = 0; i < ${N}; i++) {
      const q = {};
      gm.generateGeometryQuestion(q, sk, helpers);
      if (q.answerType === 'multi-select-check') counts.msc++;
      else if (q.answerType === 'hot-spot') counts.hs++;
      else counts.original++;
    }
    out[sk] = counts;
  }
  console.log(JSON.stringify(out, null, 2));
});
`], { cwd: __dirname, encoding: 'utf8' });

if (child.status !== 0) {
  console.error('Child failed status', child.status);
  console.error('stderr:', child.stderr);
  console.error('stdout:', child.stdout);
  process.exit(child.status || 1);
}

const data = JSON.parse(child.stdout);
let failures = 0;
console.log('=== Forced-original sweep (Math.random => 0.95) ===');
for (const sk of SKILLS) {
  const c = data[sk];
  console.log(`${sk.padEnd(22)} msc=${c.msc} hs=${c.hs} original=${c.original}`);
  if (c.msc !== 0 || c.hs !== 0) {
    console.error(`  FAIL: variants fired when Math.random=0.95 on ${sk}`);
    failures++;
  }
}
if (failures > 0) {
  console.error(`\n${failures} failures.`);
  process.exit(1);
}
console.log('\nAll forced-original checks passed (0 variants).');
