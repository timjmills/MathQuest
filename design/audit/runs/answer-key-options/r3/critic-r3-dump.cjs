// dump docHtml/pupilHtml/keyHtml for a request matrix in MQ_ROOT
const path = require('path'); const fs = require('fs');
const ROOT = process.env.MQ_ROOT; const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const ROLES = ['lesson','scripted-model','guided','independent','more-practice','mixed-practice','review','test','opener','word-problems','fact-rows','pre-skill-check'];
const SK = [['addition','add_facts'],['addition','add_20_regroup'],['subtraction','sub_100_regroup'],['fractions','shade_fraction'],['measurement','time_half_hour'],['placevalue','place_value_disks'],['multiplication','nl_mult'],['composing','ten_frame_build']];
const KEYS = JSON.parse(process.env.KEYS || '[true]');
(async () => {
  const app = await open({ seed: 1 }); const { page } = app; page.setDefaultTimeout(0);
  const out = {};
  try {
    for (const role of ROLES) for (const [c, s] of SK) for (const k of KEYS) {
      const r = await page.evaluate(async ({ role, c, s, k }) => {
        const req = { role, sections: [{ skills: [{ categoryId: c, skillId: s }] }], letters: role === 'more-practice' ? ['A','B'] : undefined, size: 'L', paper: 'A4', seed: 4242 };
        if (k !== 'MISSING') req.key = k;
        try { const res = await window.buildSheet(req); return { pupil: res.pupilHtml, key: res.keyHtml, doc: res.docHtml, n: res.pageCount, kn: res.keyPageCount }; } catch (e) { return { err: String(e && e.message || e) }; }
      }, { role, c, s, k });
      out[`${role}|${s}|${JSON.stringify(k)}`] = r;
    }
  } finally { await app.close(); }
  fs.writeFileSync(process.env.OUT, JSON.stringify(out));
  console.log('dumped', Object.keys(out).length);
})().catch((e) => { console.error(e); process.exit(1); });
