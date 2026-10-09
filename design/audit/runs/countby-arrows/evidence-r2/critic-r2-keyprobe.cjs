const path = require('path'); const TREE = process.env.TREE;
const { open } = require(path.join(TREE, 'tests/lib/ws-harness.cjs'));
(async () => {
  const app = await open({ seed: 1 });
  const out = await app.page.evaluate(async () => {
    const res = {};
    for (const role of ['scripted-model', 'lesson', 'opener']) for (const spaces of ['box', 'line']) {
      const r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts: spaces === 'line' ? { spaces } : {} }], count: 6, pages: 1, columns: 1 }], size: 'M', paper: 'A4', seed: 4242, key: true });
      const d = document.createElement('div'); d.innerHTML = r.keyHtml || '';
      const p = document.createElement('div'); p.innerHTML = r.pupilHtml || '';
      const slots = (x) => [...x.querySelectorAll('.k2-countrow [data-ws-slot], .k2-countrow [data-ws-shape]')];
      const empty = (x) => slots(x).filter((e) => !e.textContent.trim()).length;
      const ctx = (x) => slots(x).filter((e) => !e.textContent.trim()).slice(0, 3).map((e) => { let a = e; for (let i = 0; i < 8 && a; i++) a = a.parentElement; return (a ? a.textContent : '').replace(/\s+/g, ' ').slice(0, 140); });
      res[`${role}-${spaces}`] = { keySlots: slots(d).length, keyEmpty: empty(d), pupilSlots: slots(p).length, pupilEmpty: empty(p), ctx: ctx(d), keyPages: r.keyPageCount, hasKey: !!r.keyHtml };
    }
    return res;
  });
  console.log(JSON.stringify(out, null, 1)); await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
