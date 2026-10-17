// critic r7: under the per-line rule (all=false), which fractions NOT followed by "of" now stack? Every skill, 12 seeds.
const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
(async () => {
  const app = await open({ seed: 1 });
  const out = await app.page.evaluate(async () => {
    const { stackProseFractions } = await import('/js/modules/utils.js');
    const res = []; let n = 0, lines = 0;
    for (const [c, list] of Object.entries(window.SKILLS)) for (const s of list) {
      const k = s.v || s.id; if (!k || /^mixed|_mixed$|all_domains|custom_mixed|grade_\d_mixed/.test(k)) continue;
      for (let sd = 1; sd <= 12; sd++) {
        let q; try { q = window.generateQuestionFor({ category: c, skill: k, seed: sd * 101 }); } catch (e) { continue; }
        if (!q) continue;
        const texts = [q.text, q.instr, q.instruction, q.cell && q.cell.payload && (q.cell.payload.prompt || q.cell.payload.instr || q.cell.payload.story)].filter(t => typeof t === 'string');
        for (const t0 of texts) {
          const t = t0.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]);
          if (!/\d\/\d/.test(t)) continue; n++;
          const h = stackProseFractions(t, { all: false });
          if (h === t) continue; lines++;
          // tokens left slashed, and tokens stacked that are not "n/d of"
          const left = (h.replace(/<span[\s\S]*?<\/span><\/span>/g, '#').match(/\d+\/\d+/g) || []);
          const extra = []; t.replace(/(\d+)\/(\d+)(?![\d/])/g, (m, a, b, at) => { if (!/^\s+of\b/i.test(t.slice(at + m.length))) extra.push(t.slice(Math.max(0, at - 18), at + m.length + 12)); return m; });
          if (extra.length || left.length) res.push(`${c}:${k} | stacked-not-of: ${extra.slice(0, 3).join(' ## ')} | still slashed: ${left.join(',')}`);
        }
      }
    }
    return { n, lines, res };
  });
  console.log('prompts with n/d', out.n, 'changed under all=false', out.lines);
  const uniq = {}; out.res.forEach(r => { const [key, ...rest] = r.split(' | '); (uniq[key] = uniq[key] || []).push(rest.join(' | ')); });
  for (const [k, v] of Object.entries(uniq)) console.log(k, '|', [...new Set(v)].slice(0, 3).join(' ## '));
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
