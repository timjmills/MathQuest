// A detailed lesson's Practice link, opened by a PUPIL, plays every (skill, options) use — browser gate.
//   node tests/scripts/ws-lesson-link-uses.cjs                       every detailed lesson that uses a skill twice
//   node tests/scripts/ws-lesson-link-uses.cjs --lesson g4-nbt1-ten-times-value
//
// 2026-10-31 (lessons-sharelink): lesson 6 uses placevalue:value six times, each with its own options. The link
// encodes all 14 uses (ws-teacher-wrm checks the code), but the pupil side loaded it into the skill queue and the
// option store, which key by skill, so every placevalue:value item came from the FIRST use's options and the other
// five uses were never dealt. This gate opens each such link in a fresh browser as a pupil, presses Start Playing,
// and deals three rounds of items: every item must come from one of its skill's uses (its options equal that use's,
// normalised), and every use must deal at least one item. Order-independent, so it cannot flap on the shuffle.
//
// MQ_ROOT (ws-backtest commit-pair rows): the tree under test; the check itself is always this script.
const path = require('path');
const fs = require('fs');
const { open, waitFor } = require('../lib/ws-harness.cjs');

const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : path.join(__dirname, '..', '..');
const argOf = (f) => { const i = process.argv.indexOf(f); return i > 0 && i + 1 < process.argv.length ? String(process.argv[i + 1]) : ''; };
const ONLY = argOf('--lesson');
const ROUNDS = 3;

(async () => {
  const failures = [];
  const check = (ok, msg) => { if (!ok) failures.push(msg); };
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'curriculum', 'detailed-lessons.json'), 'utf8'));
  const D = await import(path.join(ROOT, 'js/modules/detailed-links.js'));
  const recs = D.indexDetailed(raw).all.filter((r) => {
    if (ONLY) return r.id === ONLY;
    const keys = (r.used || []).map((x) => x.key);
    return new Set(keys).size < keys.length;   // only a link that repeats a skill can collapse
  });
  check(recs.length > 0, ONLY ? `no detailed lesson ${ONLY}` : 'no detailed lesson uses a skill twice (the gate has nothing to test)');
  if (ONLY) check(recs.every((r) => new Set(r.used.map((x) => x.key)).size < r.used.length), `${ONLY} does not use a skill twice`);

  const app = await open({ seed: 7, viewport: { width: 1366, height: 768, deviceScaleFactor: 1 } });
  const { page, browser, base } = app;
  const problems = [];
  try {
    for (const r of recs) {
      const items = r.used.map((x) => { const [c, s] = x.key.split(':'); const it = { categoryId: c, skillId: s, weight: 1 }; if (x.opts && Object.keys(x.opts).length) it.opts = x.opts; return it; });
      // the teacher's link, made the way the detailed-lesson card makes it
      const link = await page.evaluate(async (items) => (await import('./js/modules/teacher-skillpick.js')).makePracticeLink(items), items);
      check(/[?&]c=/.test(link || ''), `${r.id}: no Practice link (${link})`);
      if (!/[?&]c=/.test(link || '')) continue;
      const u = new URL(link);

      // a pupil: a fresh browser context (no cookies, no stored role), the link's own query
      const ctx = browser.createBrowserContext ? await browser.createBrowserContext() : await browser.createIncognitoBrowserContext();
      const pp = await ctx.newPage();
      await pp.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
      pp.on('pageerror', (e) => problems.push(`${r.id} pageerror: ${e.message}`));
      pp.on('console', (m) => { if (m.type() === 'error') problems.push(`${r.id} console.error: ${m.text()}`); });
      await pp.evaluateOnNewDocument(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* none */ } });
      await pp.goto(base + '/index.html' + u.search, { waitUntil: 'networkidle2', timeout: 60000 });
      await waitFor(pp, () => !!document.querySelector('#studentLandingOverlay .landing-start-btn'), 30000, `${r.id} landing pop-up`);
      await pp.click('#studentLandingOverlay .landing-start-btn');
      await waitFor(pp, () => !!(window.state && window.state.currentQ) && document.body.classList.contains('student-mode'), 30000, `${r.id} first question`);

      const res = await pp.evaluate(async (used, n) => {
        const so = await import('./js/modules/skill-options.js');
        const st = await import('./js/modules/skill-option-store.js');
        const S = window.state;
        const canon = (c, s, o) => JSON.stringify(so.packOptions(c, s, o || {}));
        const uses = used.map((x) => { const [c, s] = x.key.split(':'); return { key: x.key, c, s, want: canon(c, s, x.opts) }; });
        const hits = uses.map(() => 0);
        const stray = [];
        const qs = [S.currentQ];
        for (let i = 0; i < n; i += 1) qs.push(window.generateQuestion());
        for (const q of qs) {
          if (!q) { stray.push('no item'); continue; }
          const c = q.categoryId, s = q.requestedSkillId || q.skillId;
          const key = `${c}:${s}`;
          // the options the item was dealt with: its own, else the set's (what the old path used)
          const got = canon(c, s, q.skillOptions || st.getSetOptions(c, s));
          const mine = uses.map((u, i) => [u, i]).filter(([u]) => u.key === key && u.want === got);
          if (!mine.length) { stray.push(`${key} dealt with ${got}`); continue; }
          // an item that names its use must match that use; otherwise credit every equal use
          const named = q.linkUse != null ? mine.filter(([, i]) => i === q.linkUse) : mine;
          if (q.linkUse != null && !named.length) { stray.push(`${key} names use ${q.linkUse} but has ${got}`); continue; }
          for (const [, i] of named) hits[i] += 1;
        }
        return { n: qs.length, hits, stray: stray.slice(0, 6), strays: stray.length, mode: S.gameMode, skill: S.skill };
      }, r.used, ROUNDS * r.used.length);
      check(res.skill === 'custom_mixed', `${r.id}: the pupil is not in the link's mixed practice (${res.skill})`);
      check(!res.strays, `${r.id}: ${res.strays} of ${res.n} items match none of their skill's uses: ${res.stray.join(' | ')}`);
      const missed = res.hits.map((h, i) => [h, i]).filter(([h]) => !h).map(([, i]) => `#${i} ${r.used[i].key} ${JSON.stringify(r.used[i].opts || {})}`);
      check(!missed.length, `${r.id}: ${missed.length} of ${r.used.length} uses never dealt in ${res.n} items: ${missed.join(' ; ')}`);
      console.log(`${r.id}: ${r.used.length} uses, ${res.n} items, dealt per use [${res.hits.join(' ')}]`);
      await ctx.close();
    }
  } catch (e) {
    failures.push(`exception: ${e.message}`);
  } finally {
    await app.close();
  }
  for (const p of [...app.problems.map((x) => `${x.type}: ${x.text}`), ...problems]) failures.push(p);
  if (failures.length) {
    for (const f of failures) console.log('  - ' + f);
    console.log(`ws-lesson-link-uses: FAIL (${failures.length})`);
    process.exit(1);
  }
  console.log(`ws-lesson-link-uses: OK (${recs.length} lesson${recs.length === 1 ? '' : 's'})`);
})();
