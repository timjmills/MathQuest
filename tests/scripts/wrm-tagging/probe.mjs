// Print N generated items (print path, seeded) for one skill with opts and Max Number.
// usage: node probe.mjs <category:skill> ['{"opt":..}'] [maxNumber=10000] [N=12] [seedBase=9100]
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../', import.meta.url).pathname;
const { generateQuestionFor } = await import(R + 'js/modules/generate-question.js');
const strip = s => String(s ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const [key, o = '{}', mx = '10000', n = '12', sb = '9100'] = process.argv.slice(2);
const [category, skill] = key.split(':'); const opts = JSON.parse(o);
for (let i = 0; i < +n; i++) {
  try { const q = generateQuestionFor({ category, skill, opts, range: +mx, seed: +sb + i * 17, itemIndex: i, itemCount: +n });
    console.log(`${i + 1}. ${strip(q.text).slice(0, 150)} → ${strip(typeof q.ans === 'object' ? JSON.stringify(q.ans) : q.ans).slice(0, 60)}${q.cell ? ' [' + q.cell.template + ']' : ''}`);
  } catch (e) { console.log(`${i + 1}. ERR ${e.message}`); }
}
