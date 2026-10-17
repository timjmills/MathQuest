// Skip-count lane r2 (critic r1 D5): the Scripted Model page of a count row.
//  - panel k shows, traced, the answers its steps 2..k wrote (at least k-1 traced answers, never fewer than the panel before);
//  - the model fits ONE page at S, M and L.
//  - (fix round 5, critic r4 D12) no Model page holds a lone state, over 3 skills x 7 option sets x S/M/L x A4/Letter, pupil + key;
//  - (critic r4 N10) 6+ digit numbers print at >= 11 pt on every page type at S/M/L.
// Run: node tests/scripts/wave1-c2-model.cjs [outdir]   (outdir: also saves each page as a PNG)
const { open } = require('../lib/ws-harness.cjs');
const OUT = process.argv[2] || '';
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
// critic r2 D8: count_by_tables with a taller drawing (a fact under each number, 15 numbers, a 7-digit row) keeps ONE page too
const SKILLS = [['multiplication', 'count_by_tables', {}, [7]], ['patterns', 'skip_count_grid', {}, [7]], ['patterns', 'skip_count_line', {}, [7]],
  ['multiplication', 'count_by_tables', { times: 'each' }, [7, 11, 23]], ['multiplication', 'count_by_tables', { jumps: 15 }, [7, 11, 23]],
  ['multiplication', 'count_by_tables', { rows: [{ step: 100000, start: 'custom', at: 1000000 }] }, [7, 11, 23]]];
(async () => {
  const app = await open({ seed: 3, viewport: { width: 1000, height: 1400, deviceScaleFactor: 1 } });
  const { page } = app;
  for (const [cat, skill, opts, seeds] of SKILLS) for (const seed of seeds) for (const size of ['S', 'M', 'L']) {
    const r = await page.evaluate(async ({ cat, skill, size, opts, seed }) => {
      const out = await window.buildSheet({ role: 'scripted-model', sections: [{ skills: [{ categoryId: cat, skillId: skill, opts }], count: 1 }], size, seed });
      const d = document.createElement('div'); d.innerHTML = out.pupilHtml;
      const panels = [...d.querySelectorAll('.k2-countrow')];
      const traced = panels.map((p) => [...p.querySelectorAll('[data-ws-slot]')].filter((s) => s.getAttribute('data-ws-ink') === 'trace' && s.textContent.trim()).length);
      const steps = [...d.querySelectorAll('.mq-steptext span')].map((s) => s.textContent);
      return { pages: out.pageCount, traced, steps, html: out.pupilHtml };
    }, { cat, skill, size, opts, seed });
    const oname = Object.keys(opts).length ? JSON.stringify(opts) : '';
    const tag = `${skill}${oname} seed ${seed} ${size}`;
    check(r.traced.length >= 3, `${tag}: ${r.traced.length} model states`);
    check(r.traced.every((n, k) => n >= k && (k === 0 || n >= r.traced[k - 1])), `${tag}: state k traces the answers of steps 2..k (traced per state ${r.traced.join(',')})`);
    r.steps.forEach((t, k) => { const m = /Write ([\d,]+)\./.exec(t); if (m) check(r.traced[k] >= 1, `${tag}: step ${k + 1} "${t}" shows its written answer`); });
    // one page; where two are unavoidable (15 numbers at L: three lines of 5 per state) no page holds a lone state
    // critic skip-count r3 D11: a 7-digit row takes 4 lines of 3 per state at every size, so its model may split, never alone
    const unavoidable = (!!opts.jumps && size === 'L') || !!opts.rows;
    check(r.pages === 1 || (unavoidable && r.traced.length >= 2 * r.pages), `${tag}: the model fits one page${unavoidable ? ', or no page holds a lone state' : ''} (${r.pages} page(s), ${r.traced.length} states)`);
    if (OUT) {
      const p2 = await app.browser.newPage();
      await p2.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
      const docHtml = await page.evaluate((h) => window.sheetDocument(h, 'Model'), r.html);
      await p2.setContent(docHtml, { waitUntil: 'networkidle0' }).catch(() => {});
      await p2.screenshot({ path: `${OUT}/model-${skill}${Object.keys(opts).length ? '-' + Object.keys(opts)[0] : ''}-s${seed}-${size}.png`, fullPage: true });
      await p2.close();
    }
  }
  // critic skip-count r4 D12 (fix round 5): NO page of a Model holds a lone state when the model has more than one, over every
  // option set the lane changes, at S / M / L, on A4 and Letter, pupil page and key (the key is the same plan)
  const LONE_SKILLS = [['multiplication', 'count_by_tables'], ['patterns', 'skip_count_grid'], ['patterns', 'skip_count_line']];
  const W7 = { step: 100000, start: 'custom', at: 1000000 };
  const LONE_OPTS = [['defaults', {}], ['times: each', { times: 'each' }], ['jumps: 15', { jumps: 15 }], ['step 25,000', { rows: [{ step: 25000 }] }],
    ['7-digit row', { rows: [W7] }], ['step 25,000 + one page', { rows: [{ step: 25000 }], onePage: true }], ['7-digit + one page', { rows: [W7], onePage: true }]];
  const lone = await page.evaluate(async ({ LONE_SKILLS, LONE_OPTS }) => {
    const out = [];
    const per = (h) => { const d = document.createElement('div'); d.innerHTML = h || ''; return [...d.querySelectorAll('section.ws-page')].map((pg) => pg.querySelectorAll('.k2-countrow').length); };
    for (const [cat, skill] of LONE_SKILLS) for (const [name, opts] of LONE_OPTS) for (const size of ['S', 'M', 'L']) for (const paper of ['A4', 'Letter']) for (const seed of [7, 4242]) {
      const o = await window.buildSheet({ role: 'scripted-model', sections: [{ skills: [{ categoryId: cat, skillId: skill, opts }], count: 1 }], size, paper, seed, key: true });
      out.push({ tag: `${skill} ${name} ${size} ${paper} seed ${seed}`, pages: o.pageCount, pupil: per(o.pupilHtml), key: per(o.keyHtml) });
    }
    return out;
  }, { LONE_SKILLS, LONE_OPTS });
  let loneBad = 0;
  for (const r of lone) {
    const ok = [r.pupil, r.key].every((a) => a.length > 0 && (a.reduce((x, y) => x + y, 0) < 2 || a.every((n) => n >= 2)));
    if (!ok) { loneBad++; check(false, `no lone state: ${r.tag} - pupil ${JSON.stringify(r.pupil)}, key ${JSON.stringify(r.key)}`); }
  }
  check(!loneBad, `no lone state on any Model page: ${lone.length} sheets (3 skills x 7 option sets x S/M/L x A4/Letter x 2 seeds), pupil and key (${loneBad} with a lone state)`);
  // the one-page option is a pupil-sheet layout: the Model of a wide row draws the same row with and without it (D12)
  for (const [name, base] of [['step 25,000', 'step 25,000 + one page'], ['7-digit row', '7-digit + one page']]) for (const paper of ['A4', 'Letter']) {
    const a = lone.find((r) => r.tag === `count_by_tables ${name} S ${paper} seed 4242`), b = lone.find((r) => r.tag === `count_by_tables ${base} S ${paper} seed 4242`);
    check(a && b && a.pages === b.pages && JSON.stringify(a.pupil) === JSON.stringify(b.pupil), `${base} ${paper}: the Model is the plain wide-row Model (${b && b.pages} page(s) ${b && JSON.stringify(b.pupil)} vs ${a && JSON.stringify(a.pupil)})`);
  }
  // critic skip-count r3 D11: no answer (key, model trace) runs out of its box for 5-, 6- and 7-digit rows, at S/M/L, on the
  // model, independent, guided and test pages (pupil + key), Boxes and Lines; a 6+ digit row's box is >= 5 mm a digit
  const WIDE = [{ rows: [{ step: 1000, start: 'custom', at: 14000 }] }, { rows: [{ step: 25000 }] }, { rows: [{ step: 100000, start: 'custom', at: 1000000 }] },
    { rows: [{ step: 100000, start: 'custom', at: 1000000 }], spaces: 'line' }, { rows: [{ step: 25000 }], onePage: true }];
  const p3 = await app.browser.newPage();
  await p3.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
  for (const opts of WIDE) for (const role of ['scripted-model', 'independent', 'guided', 'more-practice', 'review', 'test']) for (const size of ['S', 'M', 'L']) {
    const docs = await page.evaluate(async ({ opts, role, size }) => {
      const out = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts }], count: 4 }], size, seed: 7 });
      return [['pupil', window.sheetDocument(out.pupilHtml, 'P')], ['key', window.sheetDocument(out.keyHtml || '', 'K')]];
    }, { opts, role, size });
    for (const [which, html] of docs) {
      await p3.setContent(html, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
      await p3.evaluate(() => document.fonts && document.fonts.ready);
      const m = await p3.evaluate(() => {
        const PX_MM = 96 / 25.4; const bad = []; let n = 0; let minMmPerDigit = Infinity;
        for (const s of document.querySelectorAll('.k2-countrow [data-ws-slot]')) {
          const t = s.textContent.trim(); const br = s.getBoundingClientRect(); if (!br.width) continue;
          const digits = (t.match(/\d/g) || []).length;
          if (digits >= 6) minMmPerDigit = Math.min(minMmPerDigit, br.width / PX_MM / digits);
          if (!t) continue; n++;
          const rg = document.createRange(); rg.selectNodeContents(s); const tr = rg.getBoundingClientRect();
          if (tr.left < br.left - 0.5 || tr.right > br.right + 0.5) bad.push(`${t} ${(tr.width / PX_MM).toFixed(1)}mm in ${(br.width / PX_MM).toFixed(1)}mm`);
        }
        // critic skip-count r4 N10: a 6+ digit number (given or written) prints at >= 11 pt
        let minPt = Infinity;
        for (const el of document.querySelectorAll('.k2-countrow .k2-given, .k2-countrow [data-ws-slot]')) {
          if ((el.textContent.match(/\d/g) || []).length < 6) continue;
          minPt = Math.min(minPt, parseFloat(getComputedStyle(el).fontSize) * 0.75);
        }
        return { n, bad, minMmPerDigit, minPt };
      });
      const tag = `wide ${JSON.stringify(opts)} ${role} ${which} ${size}`;
      check(!m.bad.length, `${tag}: ${m.n} written answers, none outside its box${m.bad.length ? ' - ' + m.bad.slice(0, 3).join('; ') : ''}`);
      if (Number.isFinite(m.minPt)) check(m.minPt >= 10.95, `${tag}: 6+ digit numbers print at ${m.minPt.toFixed(1)} pt (>= 11)`);
      if (Number.isFinite(m.minMmPerDigit) && !opts.spaces) check(m.minMmPerDigit >= 4.99, `${tag}: a 6+ digit box gives ${m.minMmPerDigit.toFixed(2)} mm a digit (>= 5)`);
    }
  }
  await p3.close();
  check(!app.problems.some((p) => p.type === 'pageerror'), 'no page errors');
  await app.close();
  console.log(fails ? `wave1-c2-model: FAIL (${fails})` : 'wave1-c2-model: OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
