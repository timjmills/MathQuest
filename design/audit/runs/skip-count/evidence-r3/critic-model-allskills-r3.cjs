// critic r3: the D8 merge (scripted-model.js) is shared by EVERY skill's model page. This lists, for every skill in
// SKILLS at S/M/L (seed 7), the model's page count and its step texts, so the lane head can be diffed against its parent
// (MQ_ROOT=<parent checkout>). Run from the tree root:
//   node design/audit/runs/skip-count/evidence-r3/critic-model-allskills-r3.cjs <out.json>
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../../../../..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
(async () => {
  const app = await open({ seed: 3, viewport: { width: 1000, height: 1400, deviceScaleFactor: 1 } });
  const out = await app.page.evaluate(async () => {
    const res = {};
    for (const [cat, list] of Object.entries(window.SKILLS || {})) for (const s of list) {
      const id = s && (s.v || s.id || s.skillId); if (!id || s.retired || s.tombstone || /^mixed_/.test(id)) continue;
      for (const size of ['S', 'M', 'L']) {
        try {
          const o = await window.buildSheet({ role: 'scripted-model', sections: [{ skills: [{ categoryId: cat, skillId: id }], count: 1 }], size, seed: 7 });
          const d = document.createElement('div'); d.innerHTML = o.pupilHtml || '';
          res[`${cat}:${id}:${size}`] = { pages: o.pageCount, steps: [...d.querySelectorAll('.mq-steptext span')].map((x) => x.textContent) };
        } catch (e) { res[`${cat}:${id}:${size}`] = { err: String(e && e.message || e).slice(0, 80) }; }
      }
    }
    return res;
  });
  fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
  console.log(Object.keys(out).length, 'entries; page errors', app.problems.filter((p) => p.type === 'pageerror').length);
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
