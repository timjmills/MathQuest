// Print a skill's option schema. usage: node opts.mjs cat:skill [cat:skill ...]
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../', import.meta.url).pathname;
await import(R + 'js/modules/generate-question.js');
const so = await import(R + 'js/modules/skill-options.js');
for (const key of process.argv.slice(2)) { const [c, k] = key.split(':');
  console.log(key, JSON.stringify((so.optionsFor(c, k) || []).map(o => ({ id: o.id, type: o.type, def: o.default, v: (o.values || []).map(x => x.v ?? x) }))));}
