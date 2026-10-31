// A detailed lesson's Practice link, opened by a PUPIL, plays every (skill, options) use — browser gate.
//   node tests/scripts/ws-lesson-link-uses.cjs                       every stage, every detailed lesson that uses a skill twice
//   node tests/scripts/ws-lesson-link-uses.cjs --lesson g4-nbt1-ten-times-value
//   node tests/scripts/ws-lesson-link-uses.cjs --stage codec,stale   only these stages (play, codec, stale, seeded, weights)
//
// 2026-10-31 (lessons-sharelink): lesson 6 uses placevalue:value six times, each with its own options. The link
// encodes all 14 uses (ws-teacher-wrm checks the code), but the pupil side loaded it into the skill queue and the
// option store, which key by skill, so every placevalue:value item came from the FIRST use's options.
//
// STAGES
//   play     the pupil opens each such link, presses Start Playing and deals three rounds: every item comes from one
//            of its skill's uses (its options equal that use's, normalised) and every use deals at least once.
//            Order-independent, so it cannot flap on the shuffle.
//   codec    (checker D1) a repeated skill with one use at its DEFAULTS: [A{opts}, A] and [A, A{opts}] each make a
//            link that decodes to two parts, the default one {} — never the other use's options (the encoder fell
//            back to the option store) — and every lesson link decodes use by use, default uses against {}.
//   stale    (checker D2) after the link session the pupil exits, removes a skill (or edits a skill's options) and
//            presses "Play with last settings": no item of the removed skill, the edit honoured, the uses dropped.
//   seeded   (checker D3) generateQuestionFor custom_mixed with the link's uses, seeded, an odd count (15), run twice:
//            the two runs are equal (whole items on a page with itemIndex; the dealt use with seeds alone) and each
//            item's skillOptions are its dealt use's.
//   weights  (checker D4) a code that repeats a skill with the SAME options (XX2-XX4-YY, or A{o}-A{o}-B) collapses as
//            it always did: no uses recorded, no uses in play, the queue's weights by skill.
//
// MQ_ROOT (ws-backtest commit-pair rows): the tree under test; the check itself is always this script.
const path = require('path');
const fs = require('fs');
const { open, waitFor } = require('../lib/ws-harness.cjs');

const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : path.join(__dirname, '..', '..');
const argOf = (f) => { const i = process.argv.indexOf(f); return i > 0 && i + 1 < process.argv.length ? String(process.argv[i + 1]) : ''; };
const ONLY = argOf('--lesson');
const ALL_STAGES = ['play', 'codec', 'stale', 'seeded', 'weights'];
const STAGES = argOf('--stage') ? argOf('--stage').split(',').map((s) => s.trim()).filter(Boolean) : ALL_STAGES;
const ROUNDS = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const failures = [];
  const check = (ok, msg) => { if (!ok) failures.push(msg); };
  for (const s of STAGES) check(ALL_STAGES.includes(s), `unknown stage ${s} (${ALL_STAGES.join(', ')})`);
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
  page.on('dialog', (d) => d.accept().catch(() => {}));
  const problems = [];
  const itemsOf = (r) => r.used.map((x) => { const [c, s] = x.key.split(':'); const it = { categoryId: c, skillId: s, weight: 1 }; if (x.opts && Object.keys(x.opts).length) it.opts = x.opts; return it; });
  const makeLink = (items) => page.evaluate(async (items) => (await import('./js/modules/teacher-skillpick.js')).makePracticeLink(items), items);
  const decodeLink = (link) => page.evaluate((link) => window.parseSkillCodeParts((new URL(link).searchParams.get('c') || '').split('|')[0])
    .map((s) => ({ key: `${s.categoryId}:${s.skillId}`, opts: s.opts || {} })), link);
  // a pupil: a fresh browser context (no cookies, no stored role), the link's own query, Start Playing pressed
  const pupil = async (tag, link) => {
    const ctx = browser.createBrowserContext ? await browser.createBrowserContext() : await browser.createIncognitoBrowserContext();
    const pp = await ctx.newPage();
    await pp.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    pp.on('pageerror', (e) => problems.push(`${tag} pageerror: ${e.message}`));
    pp.on('console', (m) => { if (m.type() === 'error') problems.push(`${tag} console.error: ${m.text()}`); });
    pp.on('dialog', (d) => d.accept().catch(() => {}));
    await pp.evaluateOnNewDocument(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* none */ } });
    await pp.goto(base + '/index.html' + new URL(link).search, { waitUntil: 'networkidle2', timeout: 60000 });
    await waitFor(pp, () => !!document.querySelector('#studentLandingOverlay .landing-start-btn'), 30000, `${tag} landing pop-up`);
    await pp.click('#studentLandingOverlay .landing-start-btn');
    await waitFor(pp, () => !!(window.state && window.state.currentQ) && document.body.classList.contains('student-mode'), 30000, `${tag} first question`);
    return { ctx, pp };
  };
  const stage = async (name, fn) => {
    if (!STAGES.includes(name)) return;
    try { await fn(); } catch (e) { failures.push(`${name}: exception: ${e.message}`); }
  };

  try {
    /* ---------------------------------------------------------------- codec (D1) */
    await stage('codec', async () => {
      const X = { form: 'times', band: 9999, tenDir: 'both', tenValues: true };
      const A = { categoryId: 'placevalue', skillId: 'value', weight: 1 };
      for (const [tag, items] of [['[A{opts}, A]', [{ ...A, opts: X }, { ...A }]], ['[A, A{opts}]', [{ ...A }, { ...A, opts: X }]]]) {
        const parts = await decodeLink(await makeLink(items));
        const got = parts.map((p) => JSON.stringify(p.opts));
        const want = await page.evaluate(async (items) => { const so = await import('./js/modules/skill-options.js'); return items.map((x) => JSON.stringify(so.packOptions(x.categoryId, x.skillId, x.opts || {}))); }, items);
        check(parts.length === 2 && got[0] !== got[1], `codec ${tag}: link decodes to ${JSON.stringify(got)}, not two different parts`);
        check(JSON.stringify(got) === JSON.stringify(want), `codec ${tag}: link decodes to ${JSON.stringify(got)}, want ${JSON.stringify(want)} (a default use is {})`);
      }
      for (const r of recs) {
        const parts = await decodeLink(await makeLink(itemsOf(r)));
        const bad = await page.evaluate(async (used, parts) => {
          const so = await import('./js/modules/skill-options.js');
          return used.map((x, i) => [x, i]).filter(([x, i]) => { const [c, s] = x.key.split(':'); const p = parts[i]; return !p || p.key !== x.key || JSON.stringify(so.packOptions(c, s, x.opts || {})) !== JSON.stringify(so.packOptions(c, s, p.opts || {})); }).map(([x, i]) => `${x.key}#${i}`);
        }, r.used, parts);
        check(parts.length === r.used.length && !bad.length, `codec ${r.id}: ${parts.length} parts for ${r.used.length} uses; uses not kept: ${bad.join(', ')}`);
      }
    });

    /* ---------------------------------------------------------------- play */
    await stage('play', async () => {
      for (const r of recs) {
        const link = await makeLink(itemsOf(r));
        check(/[?&]c=/.test(link || ''), `${r.id}: no Practice link (${link})`);
        if (!/[?&]c=/.test(link || '')) continue;
        const { ctx, pp } = await pupil(r.id, link);
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
          return { n: qs.length, hits, stray: stray.slice(0, 6), strays: stray.length, skill: S.skill };
        }, r.used, ROUNDS * r.used.length);
        check(res.skill === 'custom_mixed', `${r.id}: the pupil is not in the link's mixed practice (${res.skill})`);
        check(!res.strays, `${r.id}: ${res.strays} of ${res.n} items match none of their skill's uses: ${res.stray.join(' | ')}`);
        const missed = res.hits.map((h, i) => [h, i]).filter(([h]) => !h).map(([, i]) => `#${i} ${r.used[i].key} ${JSON.stringify(r.used[i].opts || {})}`);
        check(!missed.length, `${r.id}: ${missed.length} of ${r.used.length} uses never dealt in ${res.n} items: ${missed.join(' ; ')}`);
        console.log(`play ${r.id}: ${r.used.length} uses, ${res.n} items, dealt per use [${res.hits.join(' ')}]`);
        await ctx.close();
      }
    });

    /* ---------------------------------------------------------------- stale (D2) */
    await stage('stale', async () => {
      const r = recs[0];
      const link = await makeLink(itemsOf(r));
      // the skill to remove: one the link uses once; the skill to edit: the repeated one
      const counts = {};
      for (const x of r.used) counts[x.key] = (counts[x.key] || 0) + 1;
      const once = Object.keys(counts).find((k) => counts[k] === 1);
      const rep = Object.keys(counts).find((k) => counts[k] > 1);
      for (const scenario of ['remove', 'edit']) {
        const { ctx, pp } = await pupil(`stale-${scenario}`, link);
        await pp.evaluate(() => window.exitGame());
        await sleep(600);
        const res = await pp.evaluate(async (scenario, once, rep) => {
          const S = window.state;
          const U = (await import('./js/modules/unified-skills.js')).UnifiedSkills;
          const st = await import('./js/modules/skill-option-store.js');
          const so = await import('./js/modules/skill-options.js');
          const [oc, os] = once.split(':');
          const [rc, rs] = rep.split(':');
          let edited = null;
          if (scenario === 'remove') U.removeByIndex(U.skills.findIndex((s) => s.categoryId === oc && s.skillId === os));
          else {
            // a value no use of the link has: the defaults with one option moved
            const defs = so.offeredOptionsFor ? so.offeredOptionsFor(rc, rs) : so.optionsFor(rc, rs);
            const band = (defs.find((d) => d.id === 'band') || {}).values;
            edited = band && band.length ? { band: band[0].v } : {};
            st.setSetOptions(rc, rs, edited);
            edited = JSON.stringify(so.packOptions(rc, rs, edited));
          }
          await new Promise((res) => setTimeout(res, 500));
          window.playWithLastSettings();
          await new Promise((res) => setTimeout(res, 1500));
          const dealt = {};
          const repOpts = new Set();
          for (let k = 0; k < 42; k += 1) {
            const q = window.generateQuestion();
            const key = `${q.categoryId}:${q.requestedSkillId || q.skillId}`;
            dealt[key] = (dealt[key] || 0) + 1;
            if (key === rep) repOpts.add(JSON.stringify(so.packOptions(rc, rs, q.skillOptions || st.getSetOptions(rc, rs))));
          }
          return { skill: S.skill, uses: S.mixedModeSettings && S.mixedModeSettings.uses ? S.mixedModeSettings.uses.length : 0, dealt, repOpts: [...repOpts], edited };
        }, scenario, once, rep);
        check(res.skill === 'custom_mixed', `stale-${scenario}: not playing the last settings (${res.skill})`);
        check(!res.uses, `stale-${scenario}: ${res.uses} stale uses still in play after the set changed`);
        if (scenario === 'remove') check(!res.dealt[once], `stale-remove: ${res.dealt[once]} of 42 items from ${once}, which the pupil removed`);
        else check(res.repOpts.length === 1 && res.repOpts[0] === res.edited, `stale-edit: ${rep} dealt with ${res.repOpts.join(' | ')}, not the edited ${res.edited}`);
        console.log(`stale-${scenario}: ${JSON.stringify(res.dealt)}`);
        await ctx.close();
      }
    });

    /* ---------------------------------------------------------------- seeded (D3) */
    await stage('seeded', async () => {
      const r = recs[0];
      const { ctx, pp } = await pupil('seeded', await makeLink(itemsOf(r)));
      const res = await pp.evaluate(async () => {
        const G = await import('./js/modules/generate-question.js');
        const so = await import('./js/modules/skill-options.js');
        const uses = (window.state.mixedModeSettings || {}).uses || [];
        const N = 15;
        const run = (withIndex) => Array.from({ length: N }, (_, k) => {
          const q = G.generateQuestionFor({ category: 'all_mixed', skill: 'custom_mixed', seed: 900 + k, ...(withIndex ? { itemIndex: k, itemCount: N } : {}) });
          return q ? { t: String(q.text || ''), a: JSON.stringify(q.ans), u: q.linkUse, c: q.categoryId, s: q.requestedSkillId || q.skillId, o: q.skillOptions } : null;
        });
        const out = { uses: uses.length, bad: [] };
        for (const withIndex of [true, false]) {
          const a = run(withIndex), b = run(withIndex);
          // A page (itemIndex) reproduces whole items. Seed-only calls reproduce the dealt USE: the item inside
          // it is the member skill's own business (a plain skill's seed-only items are not reproducible either:
          // its page deals keep live counters without an itemIndex, e.g. placevalue:unit_form, checked 2026-10-31).
          const strip = (x) => JSON.stringify(x.map((q) => q && (withIndex ? { t: q.t, a: q.a, u: q.u } : { u: q.u })));
          if (strip(a) !== strip(b)) {
            const k = a.findIndex((q, i) => JSON.stringify(q) !== JSON.stringify(b[i]));
            out.bad.push(`${withIndex ? 'page' : 'seed-only'}: two seeded runs differ at item ${k}: use ${a[k] && a[k].u} "${a[k] && a[k].t.slice(0, 60)}" vs use ${b[k] && b[k].u} "${b[k] && b[k].t.slice(0, 60)}"`);
          }
          a.forEach((q, k) => {
            if (!q) { out.bad.push(`item ${k}: none`); return; }
            const u = uses[q.u];
            if (!u) { out.bad.push(`item ${k}: names no use (${q.u})`); return; }
            const got = JSON.stringify(so.packOptions(q.c, q.s, q.o || {})), want = JSON.stringify(so.packOptions(u.categoryId, u.skillId, u.opts || {}));
            if (`${q.c}:${q.s}` !== `${u.categoryId}:${u.skillId}` || got !== want) out.bad.push(`item ${k} (use ${q.u}): skillOptions ${got}, use has ${want}`);
          });
        }
        return out;
      });
      check(res.uses > 0, `seeded: the link session holds no uses (${res.uses})`);
      check(!res.bad.length, `seeded: ${res.bad.length} problems: ${res.bad.slice(0, 5).join(' | ')}`);
      await ctx.close();
    });

    /* ---------------------------------------------------------------- weights (D4) */
    await stage('weights', async () => {
      const res = await page.evaluate(async () => {
        const SC = (await import('./js/modules/data.js')).SKILL_CODES;
        const sp = await import('./js/modules/teacher-skillpick.js');
        const XX = SC['multiplication:mult_facts'], YY = SC['placevalue:value'];
        let inp = document.getElementById('_wsWeightsInput');
        if (!inp) { inp = document.createElement('input'); inp.id = '_wsWeightsInput'; inp.style.display = 'none'; document.body.appendChild(inp); }
        const load = (code) => { inp.value = code; window.applySkillCode('_wsWeightsInput'); return window.skillQueue.map((s) => `${s.categoryId}:${s.skillId}=${s.weight || 0}`); };
        const out = {};
        out.queue = load(`${XX}2-${XX}4-${YY}`);
        out.recorded = window.state.queueUses ? window.state.queueUses.length : 0;
        window.playSelectedSkills('practice');
        await new Promise((r) => setTimeout(r, 800));
        out.inPlay = window.state.mixedModeSettings && window.state.mixedModeSettings.uses ? window.state.mixedModeSettings.uses.length : 0;
        const dealt = {};
        for (let k = 0; k < 30; k += 1) { const q = window.generateQuestion(); dealt[q.skillId] = (dealt[q.skillId] || 0) + 1; if (q.linkUse != null) out.linkUse = true; }
        out.dealt = dealt;
        window.exitGame && window.exitGame();
        await new Promise((r) => setTimeout(r, 300));
        // the same options twice (a Practice link that repeats one use)
        const X = { form: 'times', band: 9999 };
        const link = sp.makePracticeLink([{ categoryId: 'placevalue', skillId: 'value', weight: 1, opts: X }, { categoryId: 'placevalue', skillId: 'value', weight: 1, opts: X }, { categoryId: 'multiplication', skillId: 'mult_facts', weight: 1 }]);
        load((new URL(link).searchParams.get('c') || '').split('|')[0]);
        out.recordedSame = window.state.queueUses ? window.state.queueUses.length : 0;
        return out;
      });
      check(JSON.stringify(res.queue) === JSON.stringify(['multiplication:mult_facts=2', 'placevalue:value=0']), `weights XX2-XX4-YY: queue ${JSON.stringify(res.queue)}`);
      check(!res.recorded && !res.inPlay && !res.linkUse, `weights XX2-XX4-YY: identical repeats recorded ${res.recorded} uses, ${res.inPlay} in play (they collapse as before)`);
      check(!res.recordedSame, `weights A{o}-A{o}-B: identical repeats recorded ${res.recordedSame} uses`);
      check(Object.keys(res.dealt || {}).every((k) => k === 'mult_facts' || k === 'value'), `weights XX2-XX4-YY dealt ${JSON.stringify(res.dealt)}`);
    });
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
  console.log(`ws-lesson-link-uses: OK (${recs.length} lesson${recs.length === 1 ? '' : 's'}; stages ${STAGES.join(', ')})`);
})();
