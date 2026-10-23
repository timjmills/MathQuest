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
const OPT = await import(mod('skill-options.js'));
for (const f of ['skill-options-derived.js', 'skill-options-pools.js']) { try { await import(mod(f)); } catch (e) { /* the option tables load bare in node; a failure only drops those options */ } }
const { presetOf } = await import(mod('skill-presets.js'));
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
// Each skill's own options (skill-options.js offeredOptionsFor, the controls a teacher is shown), read-only, deduped into
// D.opts so the chip sheet shows the skill's real schema; a preset skill also carries its host and the values it sets.
const optSets = [], optKey = new Map();
const short = (x) => String(x ?? '').replace(/\s+/g, ' ').trim();
for (const r of rows) {
  let defs = [], dflt = {};
  try { defs = OPT.offeredOptionsFor(r.c, r.v); dflt = OPT.defaultOptions(r.c, r.v); } catch (e) { defs = []; }
  const list = [];
  for (const d of defs) {
    if (d.hidden || d.type === 'rows' && false) continue;
    let shown = true; if (typeof d.appliesTo === 'function') { try { shown = !!d.appliesTo(dflt); } catch (e) { shown = true; } }
    if (!shown) continue;                              // appears only after another choice; left out of the mock-up
    const o = { id: d.id, l: short(d.label), t: d.type, d: dflt[d.id] ?? d.default ?? null, g: d.group || '' };
    if (d.values) o.v = d.values.map(x => [x.v, short(x.l)]);
    if (d.type === 'int') { o.min = d.min ?? 0; o.max = d.max ?? 20; }
    if (d.allLabel) o.all = short(d.allLabel);
    const h = short(d.helpShort || d.help); if (h) o.h = h.length > 120 ? h.slice(0, 117).replace(/\s+\S*$/, '') + '…' : h;
    list.push(o);
  }
  const key = JSON.stringify(list);
  if (!optKey.has(key)) { optKey.set(key, optSets.length); optSets.push(list); }
  r.o = optKey.get(key);
  const pre = presetOf(r.c, r.v);
  if (pre) {
    const host = byId[r.c + ':' + pre.skillId];
    const vals = Object.entries(pre.opts).map(([id, val]) => { const d = defs.find(x => x.id === id); const lab = d && d.values ? (d.values.filter(x => JSON.stringify(Array.isArray(val) ? val : [val]).includes(JSON.stringify(x.v))).map(x => short(x.l)).join(', ')) : String(val); return [d ? short(d.label) : id, lab || String(val)]; });
    r.pre = { h: pre.skillId, hl: host ? host.l : pre.skillId, vals };
  }
}
// White Rose: years -> blocks -> steps, with the skills that teach each step and the skills still to be made.
const wrm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/curriculum/wrm-steps.json'), 'utf8'));
const stepSkills = {};
for (const [k, list] of Object.entries(SKILL_WRM)) for (const e of list) { const id = typeof e === 'string' ? e : e.step; if (byId[k]) (stepSkills[id] = stepSkills[id] || []).push(k); }
const toMake = {};
for (const p of Object.values(WRM_PROPOSALS)) for (const id of p.steps || []) (toMake[id] = toMake[id] || []).push(p.name);
const years = wrm.years.map(y => ({
  id: y.id, name: y.name, grade: y.usGrade === 'PK' || y.id === 'R' ? 'PK' : String(y.usGrade),
  blocks: y.blocks.map(b => {
    const steps = b.steps.map(s => ({ id: s.id, n: s.number, t: s.title, s: (s.ccss || [])[0] || '', a: (s.ccss || [])[0] ? areaOfCode(s.ccss[0], y.usGrade === '0' ? 'K' : String(y.usGrade)) || '' : '', k: (stepSkills[s.id] || []).slice(0, 6), m: (toMake[s.id] || []).slice(0, 4) }));
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
const out = { generated: new Date().toISOString().slice(0, 10), skills: rows, opts: optSets, years, standards, map };
fs.writeFileSync(path.join(DIR, 'data.js'), '// GENERATED by make-data.mjs from js/modules/data.js, standards.js, wrm.js and data/; do not hand-edit.\nwindow.MQ_DATA = ' + JSON.stringify(out) + ';\n');
const count = {}; for (const r of rows) count[r.a] = (count[r.a] || 0) + 1;
log('make-data: skills', rows.length, JSON.stringify(count), '| years', years.length, '| standards', standards.length, '| MAP tasks', map.length, '| option sets', optSets.length, '| presets', rows.filter(r => r.pre).length);
