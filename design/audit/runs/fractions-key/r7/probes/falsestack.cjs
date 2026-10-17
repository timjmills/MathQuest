// critic r6: where does stackProseFractions stack in OTHER skills' prompts? Every skill, 12 seeds.
// node falsestack.cjs <repo>
const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
(async () => {
  const app = await open({ seed: 1 });
  const out = await app.page.evaluate(async () => {
    const { stackProseFractions } = await import('/js/modules/utils.js');
    const res = []; let n = 0, nStack = 0;
    for (const [c, list] of Object.entries(window.SKILLS)) for (const s of list) {
      const k = s.v || s.id; if (!k || /^mixed|_mixed$|all_domains|custom_mixed|grade_\d_mixed/.test(k)) continue;
      for (let sd = 1; sd <= 12; sd++) {
        let q; try { q = window.generateQuestionFor({ category: c, skill: k, seed: sd * 101 }); } catch (e) { continue; }
        if (!q) continue;
        const texts = [q.text, q.instr, q.instruction, q.cell && q.cell.payload && (q.cell.payload.prompt || q.cell.payload.instr || q.cell.payload.story)].filter(t => typeof t === 'string');
        for (const t0 of texts) {
          const t = t0.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]);
          if (!/\d\/\d/.test(t)) continue; n++;
          for (const all of [false, true]) {
            const h = stackProseFractions(t, { all });
            if (h === t) continue; nStack++;
            const toks = (t.match(/\S{0,25}\s?\S*\d+\/\d+\S*\s?\S{0,25}/g) || []).slice(0, 3);
            res.push(`${c}:${k} all=${all} cell=${!!q.cell} | ${toks.join(' || ')}`);
          }
        }
      }
    }
    return { n, nStack, res };
  });
  console.log('prompts with n/d', out.n, 'stacked', out.nStack);
  const uniq = {}; out.res.forEach(r => { const key = r.split(' | ')[0]; (uniq[key] = uniq[key] || []).push(r.split(' | ')[1]); });
  for (const [k, v] of Object.entries(uniq)) console.log(k, '|', [...new Set(v)].slice(0, 3).join(' ## '));
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
