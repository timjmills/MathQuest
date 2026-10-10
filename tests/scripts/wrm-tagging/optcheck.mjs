// Every opts value in Y4.json must be a real option of the skill and survive normalizeOptions unchanged.
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../', import.meta.url).pathname;
await import(R + 'js/modules/generate-question.js');
const so = await import(R + 'js/modules/skill-options.js');
const fs = await import('fs');
const d = JSON.parse(fs.readFileSync(R + 'data/curriculum/links/Y4.json', 'utf8'));
let bad = 0, n = 0;
const legacy = new Set(['constant']); // count_by_tables folds the hidden legacy `constant` into rows (critic r2: generates correctly)
for (const [sid, s] of Object.entries(d.steps)) for (const [role, list] of [['direct', s.direct], ['partial', s.partial], ['pre', s.pre], ['related', s.related]]) for (const e of list) {
  const o = e.opts || {}; if (!Object.keys(o).length) continue; n++;
  const [c, k] = e.key.split(':'); const defs = so.optionsFor(c, k) || []; const norm = so.normalizeOptions(c, k, o) || {};
  for (const [id, v] of Object.entries(o)) {
    const def = defs.find(x => x.id === id);
    if (!def && !(legacy.has(id) && k === 'count_by_tables')) { bad++; console.log(`${sid} ${role} ${e.key}: no option "${id}"`); continue; }
    if (def && !(legacy.has(id) && k === 'count_by_tables') && JSON.stringify(norm[id]) !== JSON.stringify(v)) { bad++; console.log(`${sid} ${role} ${e.key}: ${id}=${JSON.stringify(v)} normalises to ${JSON.stringify(norm[id])}`); }
  }
}
console.log(`optcheck: ${n} opts entries, ${bad} problems`);
process.exitCode = bad ? 1 : 0;
