// ws-lessonfit: the WRM site-lesson gate of every year that has one (tests/scripts/wrm-tagging/<Y>/lessonfit.mjs: Y1, Y4, Y6),
// run on the tree as it stands. Critic 2026-10-30 (WRM Y4 site lessons, finding 1, class GATE-DRIFT): the preset lanes changed
// skill-presets.js / skill-options.js / data.js SKILLS and never ran these gates, so a lesson gate went red after its deploy.
// It is on ws-precritic's path (every --skill scope) and in ws-deploy-gates.sh session 1 (a node gate).
// usage: node tests/scripts/ws-lessonfit.mjs [--year Y4] [--n 40]       prints `ws-lessonfit: OK` / `ws-lessonfit: FAIL`; exit 1 on FAIL
import { spawnSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const HERE = dirname(fileURLToPath(import.meta.url)), DIR = join(HERE, 'wrm-tagging');
const args = process.argv.slice(2), arg = f => (args.includes(f) ? args[args.indexOf(f) + 1] : null);
const only = arg('--year'), n = arg('--n');
const years = readdirSync(DIR).filter(y => existsSync(join(DIR, y, 'lessonfit.mjs')) && (!only || y === only)).sort();
if (!years.length) { console.log(`ws-lessonfit: FAIL (no lessonfit.mjs${only ? ' for ' + only : ''})`); process.exit(1); }
const bad = [];
for (const y of years) {
  const r = spawnSync(process.execPath, [join(DIR, y, 'lessonfit.mjs'), ...(n ? ['--n', n] : [])], { encoding: 'utf8', env: { ...process.env, NODE_NO_WARNINGS: '1' }, maxBuffer: 64 << 20 });
  const out = (r.stdout || '').trim().split('\n'), last = out.filter(l => /^lessonfit:/.test(l)).pop() || (r.stderr || '').trim().split('\n').pop();
  console.log(`${y}: exit ${r.status} | ${last}`);
  if (r.status !== 0) { bad.push(y); for (const l of out.filter(l => !/^lessonfit:/.test(l)).slice(0, 20)) console.log(`  ${l}`); }
}
console.log(bad.length ? `ws-lessonfit: FAIL (${bad.join(', ')} red of ${years.length} years)` : `ws-lessonfit: OK (${years.join(', ')}: 0 findings)`);
process.exit(bad.length ? 1 : 0);
