// Generate items for the direct and partial skills of Y4 steps, with the opts (and Max Number) the file lists.
// usage: node items.mjs <out.md> [stepId ...]   (no ids: every step). Print-path generation: seeded, itemIndex set.
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../', import.meta.url).pathname;
const { generateQuestionFor } = await import(R + 'js/modules/generate-question.js');
const fs = await import('fs');
const strip = s => String(s ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[|]/g, '/').replace(/\s+/g, ' ').trim();
const d = JSON.parse(fs.readFileSync(R + 'data/curriculum/links/Y4.json', 'utf8'));
const [out, ...ids] = process.argv.slice(2);
const want = ids.length ? ids : Object.keys(d.steps);
const N = 6, lines = [];
for (const sid of want) {
  const s = d.steps[sid]; if (!s) { lines.push(`## ${sid}: no such step`); continue; }
  lines.push(`## ${sid} ${s.title} — ${s.verdict}`, '');
  const ents = [...s.direct.map(e => ({ ...e, role: 'direct' })), ...s.partial.map(e => ({ ...e, role: 'partial' }))];
  if (!ents.length) lines.push('_No direct or partial skill (gap)._', '');
  for (const e of ents) {
    const [category, skill] = e.key.split(':'); const opts = e.opts || {};
    const range = e.maxNumber || 10000;
    lines.push(`**${e.role}** \`${e.key}\` opts \`${JSON.stringify(opts)}\` Max Number ${range}${e.missing ? ` — missing: ${e.missing}` : ''}`, '');
    for (let i = 0; i < N; i++) {
      let t;
      try {
        const q = generateQuestionFor({ category, skill, opts, range, seed: 9100 + i * 17, itemIndex: i, itemCount: N });
        t = q ? `${strip(q.text).slice(0, 150)} → ${strip(typeof q.ans === 'object' ? JSON.stringify(q.ans) : q.ans).slice(0, 60)}${q.cell ? ` [${q.cell.template}]` : ''}` : '(refused)';
      } catch (err) { t = 'ERR ' + err.message; }
      lines.push(`${i + 1}. ${t}`);
    }
    lines.push('');
  }
}
fs.writeFileSync(out, lines.join('\n') + '\n');
console.log('wrote', out, want.length, 'steps');
