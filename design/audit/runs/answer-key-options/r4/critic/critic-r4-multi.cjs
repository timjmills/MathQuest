const path = require('path'); const fs = require('fs');
const ROOT = process.env.MQ_ROOT; const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
(async () => {
  const app = await open({ seed: 1 }); const { page } = app; page.setDefaultTimeout(0);
  try {
    const r = await page.evaluate(async () => {
      const m = await import('/js/modules/__crit-tp-probe.js');
      const base = (role, skillId, extra, key, i) => Object.assign({ role, sections: [{ skills: [{ categoryId: 'addition', skillId }], pages: role === 'independent' ? (extra.pages || 1) : undefined }], size: extra.size || 'L', paper: 'A4', header: {}, seed: 100 + i * 7919, key }, extra.top || {});
      const out = [];
      const combos = [
        [['independent', 'add_facts', { pages: 1 }], ['guided', 'add_facts', {}], ['more-practice', 'add_20_regroup', { top: { letters: ['A', 'B'] } }]],
        [['lesson', 'add_facts', {}], ['independent', 'add_20_regroup', { pages: 3 }], ['opener', 'add_facts', {}]],
        [['review', 'add_facts', {}], ['test', 'add_facts', {}], ['scripted-model', 'add_facts', {}]],
        [['independent', 'add_facts', { pages: 1, size: 'S' }], ['lesson', 'add_20_regroup', { size: 'M' }], ['independent', 'add_facts', { pages: 2, size: 'M' }]],
      ];
      for (const combo of combos) for (const style of ['copy', 'short']) for (const placement of ['after-page', 'end']) for (const newSheet of [true, false]) {
        const key = { on: true, placement, style, newSheet };
        const parts = combo.map(([role, s, extra], i) => base(role, s, extra, key, i));
        let b; try { b = await m.__critBuildAll({ paper: 'A4', parts, idx: parts.map((_, i) => i) }); } catch (e) { out.push({ combo: combo.map((c) => c[0]).join('+'), style, placement, newSheet, err: String(e.message || e) }); continue; }
        const d = document.createElement('div'); d.innerHTML = b.docHtml;
        const secs = [...d.querySelectorAll('section.ws-page')];
        const seq = secs.map((x) => ({ blank: 'B', key: 'K', print: 'P' })[x.getAttribute('data-ws-mode')] || '?').join('');
        // section starts: each part's first page index
        const starts = []; let idx = 0;
        for (const p of b.parts) { const dd = document.createElement('div'); dd.innerHTML = p.res.docHtml || p.res.pupilHtml; const n = dd.querySelectorAll('section.ws-page').length; starts.push(idx); idx += n; if (newSheet && placement === 'after-page' && n % 2) idx += 1; }
        // pupil/key starts: a P or K that follows a non-K/P
        const badFronts = [...seq].map((c, i) => ((c === 'P' && seq[i - 1] !== 'P') || (c === 'K' && seq[i - 1] !== 'K')) && i % 2 ? i : -1).filter((i) => i >= 0);
        out.push({ combo: combo.map((c) => c[0]).join('+'), style, placement, newSheet, seq, docPages: b.docPages, sheetsLabel: b.newSheet ? Math.ceil(b.docPages / 2) : 0, nPupil: b.pages.length, starts, badFronts, notes: b.parts.map((p) => (p.res.notes || []).filter((t) => /key/i.test(t)).join('|')) });
      }
      return out;
    });
    for (const x of r) console.log(JSON.stringify(x));
  } finally { await app.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
