// Rule 17: every option value in Y4.json must change what is dealt. Generate 8 items with the opts and with {} (same
// seeds, print path) and flag entries whose items are identical.
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../', import.meta.url).pathname;
const { generateQuestionFor } = await import(R + 'js/modules/generate-question.js');
const so = await import(R + 'js/modules/skill-options.js');
const fs = await import('fs');
const d = JSON.parse(fs.readFileSync(R + 'data/curriculum/links/Y4.json', 'utf8'));
const sig = (c, k, opts, range) => Array.from({ length: 8 }, (_, i) => { try { const q = generateQuestionFor({ category: c, skill: k, opts, range, seed: 9100 + i * 17, itemIndex: i, itemCount: 8 }); return q ? JSON.stringify([q.text, q.ans, q.cell && q.cell.payload]) : 'null'; } catch (e) { return 'ERR'; } }).join('\n');
const seen = new Map(); let same = 0, dflt = 0;
for (const [sid, s] of Object.entries(d.steps)) for (const [role, list] of [['direct', s.direct], ['partial', s.partial], ['pre', s.pre], ['related', s.related]]) for (const e of list) {
  const o = e.opts || {}; if (!Object.keys(o).length) continue;
  const id = e.key + JSON.stringify(o) + (e.maxNumber || '');
  if (!seen.has(id)) { const [c, k] = e.key.split(':'); seen.set(id, sig(c, k, o, e.maxNumber || 10000) === sig(c, k, {}, e.maxNumber || 10000)); }
  if (!seen.get(id)) continue;
  // a value equal to the schema default is only recorded explicitly; that is fine (the items show it is the step's deal)
  const [c, k] = e.key.split(':'); const defs = so.optionsFor(c, k) || [];
  const nonDefault = Object.entries(o).filter(([oid, v]) => { const def = defs.find(x => x.id === oid); return !def || JSON.stringify(def.default) !== JSON.stringify(v); });
  if (!nonDefault.length) { dflt++; continue; }
  same++; console.log(`${sid} ${role} ${e.key} ${JSON.stringify(o)}: a non-default value changes nothing`);
}
console.log(`optchange: ${seen.size} distinct skill+opts; ${dflt} entries record default values only; ${same} entries whose non-default values change nothing`);
process.exitCode = same ? 1 : 0;
