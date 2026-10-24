// node design/mockups/teacher-2/plan-pdf-check.cjs — lane check (T3b): the printed pages' per-skill counts equal the plan
// (planPages / planCounts) for 4 settings, versions carry their own footer, and a 89-skill tray opens fast.
const H = require(require('path').resolve(__dirname, '../../../tests/lib/ws-harness.cjs'));
const SIX = [['addition', 'add_facts'], ['subtraction', 'sub_facts'], ['multiplication', 'mult_facts'], ['division', 'div_facts'], ['addition', 'add_word_problems'], ['fractions', 'identify']];
const CASES = [
  ['6 skills, Equal, Mixed, 2 pages', SIX, `S=>{}`, [['kind', 'mixed'], ['pages', '2']]],
  ['3 skills, one counted at 6, Mixed', SIX.slice(0, 3), `S=>{S[0].count=6}`, [['kind', 'mixed']]],
  ['4 skills, 30 problems in all, Sections', SIX.slice(0, 4), `S=>{}`, [['kind', 'sections'], ['mode', 'total'], ['ntotal', '30']]],
  ['3 skills, 3 versions, Single skill', SIX.slice(0, 3), `S=>{}`, [['kind', 'single'], ['wversions', 'MORE'], ['wversions', 'MORE']]],
];
(async () => {
  const { page, close } = await H.open({ viewport: { width: 1366, height: 768, deviceScaleFactor: 1 } });
  await page.evaluate(() => window.setUserRole('teacher'));
  let bad = 0;
  for (const [name, sk, setup, clicks] of CASES) {
    await page.evaluate((sk, setup) => { tvCloseSheet(); try { localStorage.removeItem('mq_teacher_sheet'); } catch (e) { /* */ } UnifiedSkills.clear(); for (const [c, s] of sk) UnifiedSkills.add({ categoryId: c, skillId: s, skillLabel: s }); (eval(setup))(UnifiedSkills.skills); window.skillQueue = [...UnifiedSkills.skills]; tvOpenSheet('print'); }, sk, setup);
    for (const [act, v] of clicks) {
      await page.evaluate((act, v) => { const el = v === 'MORE' ? document.querySelector(`[data-act="${act}"][aria-label="More"]`) : document.querySelector(`[data-act="${act}"][data-v="${v}"]`); el.click(); }, act, v);
      await new Promise((r) => setTimeout(r, 300));
    }
    await page.waitForFunction(() => { const s = tvSheetState(); return s.preview && !s.building; }, { timeout: 120000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 500));
    await page.waitForFunction(() => { const s = tvSheetState(); return s.preview && !s.building; }, { timeout: 120000 }).catch(() => {});
    const r = await page.evaluate(async () => { const b = await tvSheetBuildNow(); return { plan: b.plan, byKey: b.byKey, pages: b.pages, matchesPlan: b.matchesPlan, versions: b.versions, sameCounts: b.sameCounts, formA: b.formA, firsts: new Set(b.perVersion.map((x) => x.firstHash)).size, summary: tvSheetState().summary.line }; });
    const ok = r.matchesPlan && r.sameCounts && !r.formA && r.firsts === r.versions;
    if (!ok) bad++;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: plan ${JSON.stringify(r.plan.byKey)} on ${r.plan.pages} p · printed ${JSON.stringify(r.byKey)} on ${r.pages} p · versions ${r.versions} · ${r.summary}`);
  }
  // a whole grade: the sheet's first render is fast and its numbers come from one plan
  await page.evaluate(async () => { for (let g = 0; g < 25; g++) { const f = document.querySelector('[data-act="wversions"][aria-label="Fewer"]'); if (!f || f.disabled) break; f.click(); await new Promise((r) => setTimeout(r, 50)); } document.querySelector('[data-act="kind"][data-v="mixed"]').click(); });
  const t = await page.evaluate(async () => {
    tvCloseSheet(); UnifiedSkills.clear();
    const all = []; for (const c of Object.keys(SKILLS)) for (const s of SKILLS[c]) if (all.length < 89 && !/mixed/.test(s.v) && !s.retired) all.push([c, s.v]);
    for (const [c, s] of all) UnifiedSkills.add({ categoryId: c, skillId: s, skillLabel: s }); window.skillQueue = [...UnifiedSkills.skills];
    const t0 = performance.now(); tvOpenSheet('print'); const t1 = performance.now();
    const st = tvSheetState(); return { ms: Math.round(t1 - t0), line: st.summary.line, total: st.plan.total, pages: st.plan.pages };
  });
  const okBig = t.ms < 2000 && t.line.includes(`${t.pages} pages · ${t.total} problems`);
  if (!okBig) bad++;
  console.log(`${okBig ? 'PASS' : 'FAIL'} 89 skills: first render ${t.ms} ms · ${t.line}`);
  console.log(bad ? 'plan-pdf-check: FAIL' : 'plan-pdf-check: OK');
  await close(); process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
