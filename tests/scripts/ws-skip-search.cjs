// Skip-counting search (owner report 2026-10-03): "skip count", "skip counting", "count by" and "counting by" list
// multiplication:count_by_tables FIRST in every skill search, and its label says "Skip counting".
//   node tests/scripts/ws-skip-search.cjs [--shot out.png]
// Checks: the student search (skill-search.js), quick skills, mixed search, print searches (shared index + rankSkillHits),
// the teacher pickers (skillCatalogue + skillHay + rankSkillHits) and the Skills Navigator / quiz builder card order.
const { open } = require('../lib/ws-harness.cjs');

const QUERIES = ['skip count', 'skip counting', 'count by', 'counting by'];
const argv = process.argv.slice(2);
const shotAt = argv.indexOf('--shot') > -1 ? argv[argv.indexOf('--shot') + 1] : null;

(async () => {
  const failures = [];
  const app = await open({ seed: 1 });
  try {
    const res = await app.page.evaluate(async (queries) => {
      const T = await import('./js/modules/skill-search-terms.js');
      const S = await import('./js/modules/skill-search.js');
      const U = await import('./js/modules/teacher-ui.js');
      const out = {};
      for (const q of queries) {
        const words = q.toLowerCase().split(/\s+/);
        const idx = S.getSkillIndex().filter((it) => words.every((w) => it.searchText.includes(w)));
        const ranked = T.rankSkillHits(idx, q, (it) => `${it.categoryId}:${it.skillId}`, (it) => it.skillLabel);
        const cat = U.skillCatalogue().filter((s) => words.every((w) => T.skillHay(s.categoryId, s.skillId, s.label, s.categoryName).includes(w)));
        const rankedCat = T.rankSkillHits(cat, q, (s) => `${s.categoryId}:${s.skillId}`, (s) => s.label);
        // the student search box itself
        const input = document.getElementById('skillSearchInput');
        let dom = null;
        if (input && window.handleSkillSearch) {
          input.value = q; window.handleSkillSearch(q);
          const first = document.querySelector('#skillSearchResults .search-result-item div[onclick*="selectSkillFromSearch"]');
          dom = first ? first.getAttribute('onclick') : null;
        }
        out[q] = { index: ranked.slice(0, 3).map((it) => `${it.categoryId}:${it.skillId} ${it.skillLabel}`), catalogue: rankedCat.slice(0, 3).map((s) => `${s.categoryId}:${s.skillId}`), dom };
      }
      return out;
    }, QUERIES);
    for (const q of QUERIES) {
      const r = res[q];
      console.log(`  "${q}": ${r.index.join(' | ')}`);
      if (!r.index[0] || !r.index[0].startsWith('multiplication:count_by_tables')) failures.push(`"${q}": shared index lists ${r.index[0]} first`);
      if (r.catalogue[0] !== 'multiplication:count_by_tables') failures.push(`"${q}": teacher picker lists ${r.catalogue[0]} first`);
      if (r.dom !== null && !/count_by_tables/.test(r.dom)) failures.push(`"${q}": the student search box lists ${r.dom} first`);
      if (!r.index.some((s) => /skip_count_grid|skip_count_line/.test(s)) && r.index.length < 3) failures.push(`"${q}": too few hits`);
    }
    const label = await app.page.evaluate(() => (window.SKILLS.multiplication.find((s) => s.v === 'count_by_tables') || {}).l);
    if (!/skip counting/i.test(label || '')) failures.push(`label is "${label}"`);
    if (shotAt) {
      await app.page.setViewport({ width: 1280, height: 900 });
      await app.page.evaluate(() => {
        // the search box lives in the teacher view of the home screen
        if (window.showView) window.showView('homeView');
        const i = document.getElementById('skillSearchInput');
        if (i && !i.offsetParent && window.toggleUserRole) window.toggleUserRole();
        i.scrollIntoView({ block: 'start' }); i.focus(); i.value = 'skip counting'; window.handleSkillSearch('skip counting');
      });
      const box = await app.page.evaluate(() => {
        const i = document.getElementById('skillSearchInput').getBoundingClientRect(); const r = document.getElementById('skillSearchResults').getBoundingClientRect();
        const sy = window.scrollY, sx = window.scrollX;
        return { x: Math.max(0, Math.min(i.x, r.x) - 10 + sx), y: Math.max(0, i.y - 10 + sy), w: Math.max(i.width, r.width) + 20, h: Math.max(r.bottom, i.bottom) - i.y + 20 };
      });
      console.log('  shot box', JSON.stringify(box));
      await app.page.screenshot({ path: shotAt, clip: { x: box.x, y: box.y, width: box.w, height: Math.min(box.h, 700) } });
    }
    if (app.problems.length) failures.push(`console/page errors: ${app.problems.slice(0, 3).map((p) => p.text).join(' | ')}`);
  } catch (e) { failures.push(e.message); } finally { await app.close(); }
  if (failures.length) { console.error('ws-skip-search: FAIL'); failures.forEach((f) => console.error('  - ' + f)); process.exit(1); }
  console.log('ws-skip-search: OK');
})();
