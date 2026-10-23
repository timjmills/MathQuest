// Teacher site 2.0 mock-up (T1): build data.js from the live app data, so the mock-up shows real skill names,
// grades, maths areas (IMPROVEMENT_PLAN §2.7 "Where the area comes from", same rules as
// design/audit/palette-2026-10-23/areas.mjs), White Rose steps, standards and MAP tasks.
//   node design/mockups/teacher-2/make-data.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIR, '../../..');
const mod = (f) => new URL('file://' + path.join(ROOT, 'js/modules', f)).href;
globalThis.window = globalThis;
globalThis.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, createElement: () => ({ style: {} }) };
globalThis.localStorage = { getItem: () => null, setItem() {} };
const log = console.log; console.log = () => {};
const { SKILLS, getSkillGrade } = await import(mod('data.js'));
const { SKILL_STANDARDS } = await import(mod('standards.js'));
const { SKILL_WRM, WRM_PROPOSALS } = await import(mod('wrm.js'));
const { teacherLabel } = await import(mod('teacher-label.js'));
console.log = log;

export function areaOfCode(code, g) {
  const m = String(code).match(/^(K|\d)\.([A-Z]+)(?:\.([A-Z]))?/); if (!m) return null; const [, cg, d, cl] = m;
  if (d === 'CC') return 'CC'; if (d === 'OA' || d === 'EE') return 'OA'; if (d === 'NBT') return 'NBT'; if (d === 'NF') return 'NF';
  if (d === 'MD') { const data = { K: 'B', 1: 'C', 2: 'D', 3: 'B', 4: 'B', 5: 'B' }; return cl === data[cg] ? 'DATA' : 'MEAS'; }
  if (d === 'SP') return 'DATA'; if (d === 'G') return 'G';
  if (d === 'RP' || d === 'NS') { if (g !== '6' && g !== 'M') { if (d === 'NS' && cl === 'C') return 'G'; if (d === 'NS' && cl === 'B') return 'OA'; } return 'RPNS'; }
  return null;
}
const rows = []; const votes = {};
for (const [cat, list] of Object.entries(SKILLS)) for (const s of list) {
  if (!s || !s.v || s.retired) continue;
  const g = String(getSkillGrade(s.v, cat) ?? '?'); const st = SKILL_STANDARDS[cat + ':' + s.v]; const code = st && st.ccss && st.ccss[0];
  const a = code ? areaOfCode(code, g) : null;
  rows.push({ c: cat, v: s.v, l: teacherLabel(s.l), g, a, s: code || '' });
  if (a) (votes[cat] = votes[cat] || {})[a] = (votes[cat][a] || 0) + 1;
}
const CATMAP = { probability: 'DATA' };
const maj = (c) => { if (CATMAP[c]) return CATMAP[c]; const v = votes[c]; if (!v) return null; const tot = Object.values(v).reduce((x, y) => x + y, 0); const [top, n] = Object.entries(v).sort((x, y) => y[1] - x[1])[0]; return n * 2 > tot ? top : null; };
for (const r of rows) {
  if (r.c === 'vocabulary') r.a = 'WORDS';
  else if (!r.a) { const m = maj(r.c); if (m) { r.a = m; r.p = 1; } else r.a = 'MIXED'; }
}
const byId = Object.fromEntries(rows.map(r => [r.c + ':' + r.v, r]));
// White Rose: years -> blocks -> steps, with the skills that teach each step and the skills still to be made.
const wrm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/curriculum/wrm-steps.json'), 'utf8'));
const stepSkills = {};
for (const [k, list] of Object.entries(SKILL_WRM)) for (const e of list) { const id = typeof e === 'string' ? e : e.step; if (byId[k]) (stepSkills[id] = stepSkills[id] || []).push(k); }
const toMake = {};
for (const p of Object.values(WRM_PROPOSALS)) for (const id of p.steps || []) (toMake[id] = toMake[id] || []).push(p.name);
const years = wrm.years.map(y => ({
  id: y.id, name: y.name, grade: y.usGrade === 'PK' || y.id === 'R' ? 'PK' : String(y.usGrade),
  blocks: y.blocks.map(b => {
    const steps = b.steps.map(s => ({ id: s.id, n: s.number, t: s.title, s: (s.ccss || [])[0] || '', k: (stepSkills[s.id] || []).slice(0, 6), m: (toMake[s.id] || []).slice(0, 4) }));
    const v = {}; for (const s of steps) { const a = s.s ? areaOfCode(s.s, y.usGrade === '0' ? 'K' : String(y.usGrade)) : null; if (a) v[a] = (v[a] || 0) + 1; }
    const top = Object.entries(v).sort((p, q) => q[1] - p[1])[0];
    return { id: b.id, n: b.number, term: b.term, name: b.name, a: top ? top[0] : 'NOSTD', steps };
  }),
}));
// Standards with at least one skill, for Quiz > Build from.
const ccss = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/standards/ccss-math.json'), 'utf8')).standards;
const tagged = {}; for (const [k, v] of Object.entries(SKILL_STANDARDS)) if (byId[k]) for (const c of v.ccss || []) (tagged[c] = tagged[c] || []).push(k);
const standards = ccss.filter(s => /^(K|[1-6])\./.test(s.code) && (tagged[s.code] || !(s.subs && s.subs.length))).map(s => ({ c: s.code, g: s.grade, t: s.text.length > 110 ? s.text.slice(0, 107).replace(/\s+\S*$/, '') + '…' : s.text, k: (tagged[s.code] || []).slice(0, 8) }));
const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/curriculum/links/MAP.json'), 'utf8')).rows
  .map(r => ({ t: r.task, st: r.strand, b: r.ritBand, k: (r.skills || []).filter(k => byId[k]).slice(0, 6) })).filter(r => r.k.length);
const out = { generated: new Date().toISOString().slice(0, 10), skills: rows, years, standards, map };
fs.writeFileSync(path.join(DIR, 'data.js'), '// GENERATED by make-data.mjs from js/modules/data.js, standards.js, wrm.js and data/; do not hand-edit.\nwindow.MQ_DATA = ' + JSON.stringify(out) + ';\n');
const count = {}; for (const r of rows) count[r.a] = (count[r.a] || 0) + 1;
log('make-data: skills', rows.length, JSON.stringify(count), '| years', years.length, '| standards', standards.length, '| MAP tasks', map.length);
