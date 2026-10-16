// Every opts value in Y5.json must be a real option of the skill and survive normalizeOptions unchanged.
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../', import.meta.url).pathname;
const _l = console.log; console.log = () => {}; await import(R + 'js/modules/generate-question.js'); console.log = _l;
const so = await import(R + 'js/modules/skill-options.js');
const fs = await import('fs');
const d = JSON.parse(fs.readFileSync(process.argv[2] || R + 'data/curriculum/links/Y5.json', 'utf8'));
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
// critic r4 class B: an option value a clause, why or note NAMES ("{denoms:[5]}", "units [0]", "Decimal Places 2") must be the
// value the entry really carries; a note is never a substitute for opts
function tokens(t) {
  const out = []; t = String(t || '');
  for (const m of t.matchAll(/\{([^{}]*)\}/g)) { try { const o = JSON.parse('{' + m[1].replace(/'/g, '"').replace(/([A-Za-z_]\w*)\s*:/g, '"$1":') + '}'); for (const [k, v] of Object.entries(o)) out.push([k, v, m[0]]); } catch { /* prose braces */ } }
  for (const m of t.matchAll(/\bunits \[(\d+(?:,\s*\d+)*)\]/g)) out.push(['units', m[1].split(',').map(Number), m[0]]);
  for (const m of t.matchAll(/\bDecimal Places (\d)\b/g)) out.push(['decimals', +m[1], m[0]]);
  return out;
}
const has = (e, k) => (so.optionsFor(...e.key.split(':')) || []).some(x => x.id === k);
const same = (e, k, v) => JSON.stringify((e.opts || {})[k]) === JSON.stringify(v);
let named = 0;
for (const [sid, s] of Object.entries(d.steps)) {
  for (const [role, list] of [['direct', s.direct], ['partial', s.partial], ['pre', s.pre], ['related', s.related]]) for (const e of list) {
    for (const [k, v, raw] of tokens(role === 'partial' ? e.missing : e.why)) { if (!has(e, k)) continue; named++;
      if (!same(e, k, v)) { bad++; console.log(`${sid} ${role} ${e.key}: the ${role === 'partial' ? 'clause' : 'why'} names ${raw} but opts are ${JSON.stringify(e.opts || {})}`); } } }
  const own = [...s.direct, ...s.partial];
  for (const [f, t] of [['missing', s.missing], ['note', s.note]]) for (const [k, v, raw] of tokens(t)) {
    const cand = own.filter(e => has(e, k)); if (!cand.length) continue; named++;
    if (!cand.some(e => same(e, k, v))) { bad++; console.log(`${sid} ${f} names ${raw} but no direct/partial skill carries it`); } }
}
console.log(`optcheck: ${n} opts entries, ${named} named option values checked, ${bad} problems`);
process.exitCode = bad ? 1 : 0;
