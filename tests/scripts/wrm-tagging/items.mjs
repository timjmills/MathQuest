// Generate items for the direct and partial skills of Y4 steps, with the opts (and Max Number) the file lists.
// usage: node items.mjs <out.md> [stepId ...]   (no ids: every step). Print-path generation: seeded, itemIndex set.
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../', import.meta.url).pathname;
const { generateQuestionFor } = await import(R + 'js/modules/generate-question.js');
const fs = await import('fs');
const strip = s => String(s ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[|]/g, '/').replace(/\s+/g, ' ').trim();
const d = JSON.parse(fs.readFileSync(R + 'data/curriculum/links/Y4.json', 'utf8'));
const args = process.argv.slice(2);
// --links <old Y4.json>: generate the pre/related links that are new or changed since that file (4 items each)
const li = args.indexOf('--links');
if (li >= 0) {
  const old = JSON.parse(fs.readFileSync(args[li + 1], 'utf8'));
  const sig = e => e.key + JSON.stringify(e.opts || {}) + (e.maxNumber || '');
  const lines = [];
  for (const [sid, s] of Object.entries(d.steps)) for (const role of ['pre', 'related']) {
    const before = new Set((old.steps[sid]?.[role] || []).map(sig));
    for (const e of s[role]) {
      if (before.has(sig(e))) continue;
      const [category, skill] = e.key.split(':'); const range = e.maxNumber || 10000;
      lines.push(`**${sid} ${role}** \`${e.key}\` opts \`${JSON.stringify(e.opts || {})}\` Max Number ${range} — ${e.why}`, '');
      for (let i = 0; i < 4; i++) {
        let t; try { const q = generateQuestionFor({ category, skill, opts: e.opts || {}, range, seed: 9100 + i * 17, itemIndex: i, itemCount: 4 });
          t = q ? `${strip(q.text).slice(0, 140)} → ${strip(typeof q.ans === 'object' ? JSON.stringify(q.ans) : q.ans).slice(0, 50)}` : '(refused)'; } catch (err) { t = 'ERR ' + err.message; }
        lines.push(`${i + 1}. ${t}`);
      }
      lines.push('');
    }
  }
  fs.writeFileSync(args[0], lines.join('\n') + '\n'); console.log('wrote', args[0]); process.exit(0);
}
const [out, ...ids] = args;
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
