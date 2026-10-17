// Small-fixes lane, item 7 (critic r2 N3): the count row that wraps in the Model cell must never cost a page.
// For every count_by_tables option combo, size S/M/L and paper A4/Letter, the Opener and the Scripted Model
// print no more pupil pages (and no more key pages) on this tree than on a base checkout (main before the lane).
// It also asserts the Opener is byte-identical to the base, and that no Scripted Model page holds a lone state (the count-row
// Model is the skip-count lane's intended change, so it is not byte-compared: see the comment at the check), and prints the
// Opener's Independent row count per sheet beside the base's, so a fuller page shows up in the log.
// Critic r3 N8/N9: every Opener pupil page (this tree only) is also rendered in Chromium and every cell measured - no cell may be
// EMPTY (a bordered box with no ink), and no cell's largest empty band (top or bottom, from the cell's inner edge to the nearest
// ink: text, a drawing, a box or a line) may reach 30 % of the cell's height (RUBRIC H13).
// Critic r6 N15: in every Opener KEY, each Guided / Independent count-row cell's narrowest answer slot holds its longest answer at
// the size's writing height (slot >= characters x 0.55 x Hw, Hw 6 / 8 / 10 mm; a one-page sheet prints at S), the given numbers
// print at >= 11 pt, and per option set and paper they never get smaller as the size grows (S <= M <= L). N16: the missing-row
// checks read the plan's natural row height (rowMm) and fail when the plan stops reporting it.
//   git archive 72e05d7 | tar -x -C /tmp/base-72e05d7
//   MQ_BASE_ROOT=/tmp/base-72e05d7 node tests/scripts/small-fixes-model-pages.cjs
// (it re-runs itself with MQ_ROOT=<base> and `--digest` to read the base's numbers)
const { spawnSync } = require('child_process');
const crypto = require('crypto');
const { open } = require('../lib/ws-harness.cjs');

const R = (step, start, at) => Object.assign({ step }, start ? { start } : {}, at !== undefined ? { at } : {});
const COMBOS_ALL = [
  { name: 'default', opts: {} },
  { name: 'one page', opts: { onePage: true } },
  { name: 'Lines', opts: { spaces: 'line' } },
  { name: 'Lines + one page', opts: { spaces: 'line', onePage: true } },
  { name: 'step 25', opts: { rows: [R(25)] } },
  { name: 'step 25 + one page', opts: { rows: [R(25)], onePage: true } },
  { name: '1,000 from 14,000', opts: { rows: [R(1000, 'custom', 14000)] } },
  { name: '1,000 from 14,000 + one page', opts: { rows: [R(1000, 'custom', 14000)], onePage: true } },
  { name: 'step 25,000', opts: { rows: [R(25000)] } },
  { name: 'step 25,000 + one page', opts: { rows: [R(25000)], onePage: true } },
  { name: '100,000 from 1,000,000', opts: { rows: [R(100000, 'custom', 1000000)] } },
  { name: '100,000 from 1,000,000 + Lines', opts: { rows: [R(100000, 'custom', 1000000)], spaces: 'line' } },
  { name: 'times under each', opts: { rows: [R(7)], times: 'each' } },
  // critic r5 N13: the sheets whose second Guided row went missing, and the Lines twin of times under each
  { name: 'step 25 + Lines + one page', opts: { rows: [R(25)], spaces: 'line', onePage: true } },
  { name: 'times under each + Lines', opts: { rows: [R(7)], times: 'each', spaces: 'line' } },
];
// SF_ONLY: names joined by ';' (or ',' when no name in the list has a comma of its own)
const ONLY = process.env.SF_ONLY ? process.env.SF_ONLY.split(process.env.SF_ONLY.includes(';') ? ';' : ',') : null;
const COMBOS = ONLY ? COMBOS_ALL.filter((c) => ONLY.includes(c.name)) : COMBOS_ALL;
const ROLES = (process.env.SF_ROLES || 'opener,scripted-model').split(',');   // SF_ROLES / SF_ONLY narrow a quick run
const SIZES = ['S', 'M', 'L'];
const WRITE_MM = { S: 6, M: 8, L: 10 };   // Hw, the writing height (sheet/tokens.js)
const PAPERS = ['A4', 'Letter'];
const sha = (s) => crypto.createHash('sha1').update(String(s)).digest('hex').slice(0, 12);

async function digest() {
  const app = await open({ seed: 1 });
  const withCells = !process.env.MQ_ROOT;   // the base is only read for page counts and the scripted model's bytes
  const out = await app.page.evaluate(async (COMBOS, ROLES, SIZES, PAPERS, withCells) => {
    const res = {};
    // render a sheet document in a same-origin iframe (so its fonts and styles load) and measure its cells
    const measureCells = withCells ? (doc) => new Promise((resolve) => {
      const fr = document.createElement('iframe');
      fr.style.cssText = 'position:fixed;left:-3000px;top:0;width:900px;height:1400px;border:0;';
      document.body.appendChild(fr);
      fr.onload = async () => {
        const d = fr.contentDocument;
        try { await d.fonts.ready; } catch (e) { /* measure anyway */ }
        await new Promise((r) => setTimeout(r, 50));
        let maxBand = 0, empty = 0, n = 0, worst = '', lastBottom = -Infinity, lastH = 0;
        for (const cell of d.querySelectorAll('.ws-cell')) {
          const cr = cell.getBoundingClientRect();
          if (cr.height < 4) continue;
          n++;
          const cs = d.defaultView.getComputedStyle(cell);
          const top = cr.top + parseFloat(cs.borderTopWidth || 0), bot = cr.bottom - parseFloat(cs.borderBottomWidth || 0);
          let lo = Infinity, hi = -Infinity;
          for (const el of cell.querySelectorAll('*')) {
            const er = el.getBoundingClientRect();
            if (!er.width || !er.height) continue;
            const es = d.defaultView.getComputedStyle(el);
            if (es.visibility === 'hidden') continue;
            const leafText = !el.children.length && el.textContent.trim().length > 0;
            const drawn = el.tagName.toLowerCase() === 'svg';
            const bordered = ['Top', 'Bottom', 'Left', 'Right'].some((s) => parseFloat(es['border' + s + 'Width']) > 0 && es['border' + s + 'Style'] !== 'none');
            if (!(leafText || drawn || bordered)) continue;
            if (el.closest('svg') && !drawn) continue;
            lo = Math.min(lo, er.top); hi = Math.max(hi, er.bottom);
          }
          const h = bot - top;
          if (cr.bottom > lastBottom) { lastBottom = cr.bottom; lastH = cr.height; }
          if (!(hi > lo)) { empty++; continue; }
          const band = Math.max(0, lo - top, bot - hi) / h;
          if (band > maxBand) { maxBand = band; worst = (cell.textContent || '').trim().slice(0, 16) + ` (top ${((lo - top) / h * 100).toFixed(0)} %, foot ${((bot - hi) / h * 100).toFixed(0)} %, cell ${(h / 3.7795).toFixed(1)} mm)`; }
        }
        // the blank foot: from the last cell's bottom to the top of the page footer (first page), in mm
        const foot = d.querySelector('.ws-foot');
        const pxmm = 96 / 25.4;
        const rawFoot = foot ? (foot.getBoundingClientRect().top - lastBottom) / pxmm : 0;
        const footMm = Math.max(0, rawFoot);
        // the room left in the BODY under the last cell (the footer stands a few mm below the body's foot)
        const body = d.querySelector('.ws-body');
        const roomMm = body ? (body.getBoundingClientRect().bottom - lastBottom) / pxmm : rawFoot;
        fr.remove();
        resolve({ n, empty, maxBand: Math.round(maxBand * 1000) / 1000, worst, footMm: Math.round(footMm * 10) / 10, overMm: Math.round(Math.max(0, -rawFoot) * 10) / 10, roomMm: Math.round(roomMm * 10) / 10, lastRowMm: Math.round(lastH / pxmm * 10) / 10 });
      };
      fr.srcdoc = doc.replace(/<head>/i, `<head><base href="${location.href}">`);
    }) : null;
    // critic r6 N15: in the KEY (the same plan, every answer written in its slot), every Guided / Independent count-row cell: the
    // narrowest answer slot (mm), the longest answer it holds (characters, "1,300,000" is 9), and the smallest given number (pt)
    const measureWrite = withCells ? (doc) => new Promise((resolve) => {
      const fr = document.createElement('iframe');
      fr.style.cssText = 'position:fixed;left:-3000px;top:0;width:900px;height:1400px;border:0;';
      document.body.appendChild(fr);
      fr.onload = async () => {
        const d = fr.contentDocument;
        try { await d.fonts.ready; } catch (e) { /* measure anyway */ }
        await new Promise((r) => setTimeout(r, 50));
        const pxmm = 96 / 25.4;
        let cells = 0, minW = Infinity, maxLen = 0, minPt = Infinity, worstRatio = Infinity, worst = '';
        for (const band of d.querySelectorAll('.ws-band')) {
          const lbl = band.querySelector('.ws-strip b');
          if (!lbl || !/Practice/.test(lbl.textContent)) continue;
          for (const cell of band.querySelectorAll('.ws-cell')) {
            const slots = [...cell.querySelectorAll('[data-ws-slot^="b"]')];
            if (!slots.length) continue;
            cells++;
            let w = Infinity, len = 0;
            for (const s of slots) { w = Math.min(w, s.getBoundingClientRect().width / pxmm); len = Math.max(len, s.textContent.trim().length); }
            minW = Math.min(minW, w); maxLen = Math.max(maxLen, len);
            if (len && w / len < worstRatio) { worstRatio = w / len; worst = `${w.toFixed(1)} mm for "${[...slots].map((s) => s.textContent.trim()).sort((a, b) => b.length - a.length)[0]}"`; }
            for (const g of cell.querySelectorAll('.k2-given')) minPt = Math.min(minPt, parseFloat(d.defaultView.getComputedStyle(g).fontSize) * 0.75);
          }
        }
        fr.remove();
        resolve({ cells, minW: Math.round(minW * 10) / 10, maxLen, mmPerChar: Math.round(worstRatio * 100) / 100, worst, minPt: Math.round(minPt * 10) / 10 });
      };
      fr.srcdoc = doc.replace(/<head>/i, `<head><base href="${location.href}">`);
    }) : null;
    for (const c of COMBOS) for (const role of ROLES) for (const size of SIZES) for (const paper of PAPERS) {
      const k = `${c.name} | ${role} | ${size} | ${paper}`;
      try {
        const r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts: c.opts }] }], size, paper, seed: 4242, key: true });
        const note = String((r.fits && r.fits.note) || '');
        const ind = /(\d+) independent/.exec(note), gd = /(\d+) guided/.exec(note);
        const statesPer = (h) => { const dd = document.createElement('div'); dd.innerHTML = h || ''; return [...dd.querySelectorAll('section.ws-page')].map((pg) => pg.querySelectorAll('.k2-countrow').length); };
        res[k] = { onePage: !!c.opts.onePage, pages: r.pageCount, keyPages: r.keyPageCount, html: r.pupilHtml + r.keyHtml, indep: ind ? Number(ind[1]) : null,
          states: role === 'scripted-model' ? statesPer(r.pupilHtml) : null, keyStates: role === 'scripted-model' ? statesPer(r.keyHtml) : null,
          guided: gd ? Number(gd[1]) : null, cols: r.fits && r.fits.cols };
        const sec = (r.fits && r.fits.sections && r.fits.sections[0]) || {};
        if (sec.rowMm !== undefined) Object.assign(res[k], { rowMm: sec.rowMm, growMm: sec.growMm || 0 });
        if (role === 'opener' && measureCells) {
          res[k].cells = await measureCells(window.sheetDocument(r.pupilHtml, 'probe', { paper })); res[k].cells.strip = size === 'L' ? 9.5 : 7.5;
          res[k].write = await measureWrite(window.sheetDocument(r.keyHtml, 'probe-key', { paper }));
        }
      } catch (e) { res[k] = { error: String(e && e.message || e).slice(0, 80) }; }
    }
    return res;
  }, COMBOS, ROLES, SIZES, PAPERS, withCells);
  await app.close();
  for (const v of Object.values(out)) if (v.html !== undefined) { v.sha = sha(v.html); delete v.html; }
  return out;
}

(async () => {
  if (process.argv.includes('--digest')) { console.log('DIGEST ' + JSON.stringify(await digest())); return; }
  const base = process.env.MQ_BASE_ROOT;
  if (!base) { console.log('small-fixes-model-pages: set MQ_BASE_ROOT to a checkout of main before the lane (git archive 72e05d7 | tar -x -C <dir>)'); process.exit(2); }
  const r = spawnSync(process.execPath, [__filename, '--digest'], { env: Object.assign({}, process.env, { MQ_ROOT: base }), encoding: 'utf8', maxBuffer: 1 << 26 });
  const line = String(r.stdout || '').split('\n').find((l) => l.startsWith('DIGEST '));
  if (!line) { console.log(r.stdout, r.stderr); console.log('small-fixes-model-pages: FAIL - no base digest'); process.exit(1); }
  const was = JSON.parse(line.slice(7));
  const now = await digest();
  let bad = 0;
  for (const k of Object.keys(now)) {
    const a = now[k], b = was[k] || {};
    const errs = [];
    if (a.error) errs.push(`error ${a.error}`);
    if (!a.error && !b.error) {
      const model = k.includes('| scripted-model |');
      // skip-count lane (critic r3 D11, fix round 5 / critic r4 N9): a 6+ digit row is a hand-writing row (>= 5 mm a digit), so its
      // Model may go from 1 page to 2 - only as 2 + 2 states (no lone state). That is the lane's one intended page increase.
      const wideRow = /\b(25,000|100,000)\b/.test(k);
      const okRise = (n0, n1, st) => model && wideRow && n0 === 1 && n1 === 2 && JSON.stringify(st) === '[2,2]';
      if (a.pages > b.pages && !okRise(b.pages, a.pages, a.states)) errs.push(`pupil pages ${b.pages} -> ${a.pages}`);
      if (a.keyPages > b.keyPages && !okRise(b.keyPages, a.keyPages, a.keyStates)) errs.push(`key pages ${b.keyPages} -> ${a.keyPages}`);
      // The Scripted Model of a COUNT ROW is the skip-count lane's intended change (critic skip-count r4 N9), so it is not byte-compared
      // with the base: traced partial states (r1 D5), "Write 10." (N2), the one-line step text (D5), steps 2 and 3 merged when they are
      // the same parallel action (D8 / D10), wide-row boxes and digits >= 11 pt (D11 / N10), and the one-page option ignored by a wide
      // row's Model with its states paired (D12). Instead it is held to the lane's rule: no page holds a lone state (pupil and key).
      // Every other role compared here (the Opener) must still be byte-identical to the base.
      if (model) {
        for (const [which, st] of [['pupil', a.states], ['key', a.keyStates]]) {
          if (Array.isArray(st) && st.length > 1 && st.some((n) => n < 2)) errs.push(`${which} model states per page ${JSON.stringify(st)} (a lone state)`);
        }
      } else if (a.sha !== b.sha && !(/Lines/.test(k) && /\| (M|L) \|/.test(k))) errs.push(`${k.split(' | ')[1]} differs from base`);
      // (the one Opener exemption: its Model cell of a Lines row at M and L draws the lane's owner-ruled Lines - two lines of 6 with
      // ~14 mm write-on lines, owner 2026-10-09, skip-count critic r1 D2/D3 - and the rows under it re-fit to that cell; those sheets
      // keep every other check here: pages, empty cells, bands, slots and given sizes)
    }
    if (a.cells) {
      // A row the plan left out "fits" when the body still holds it within PT-ENG-3's budget (fixed heights <= bodyH - 4): the room
      // under the last cell, plus the grow the drawn rows would hand back, less the 4 mm the budget keeps, holds the row's natural
      // height (and a band strip when it would open a band). r6: measured to the BODY's foot - the blank to the footer also counts
      // the gap between the body and the footer, which no row may use - so the r5 form of this check (foot >= strip + row) passed
      // sheets the budget forbids and could not see a missing second row of a band (no strip).
      const rows = a.cols ? Math.round(((a.guided || 0) + (a.indep || 0)) / a.cols) : 0;
      // critic r6 N16: the plan's natural row height (no grow); a plan that stops reporting it fails rather than passing on the
      // drawn height, which includes up to 8 mm of grow and hides a dropped row
      if (a.rowMm === undefined) errs.push('no rowMm in the plan fits (the missing-row checks cannot run)');
      const natural = a.rowMm !== undefined ? a.rowMm : a.cells.lastRowMm - 8;
      // less 1 mm: the same sheet measures up to ~1.5 mm apart in two Chromium hosts (fonts, rounding), so a row the plan's own
      // drawn heights put 2.5 mm over the budget (100,000 + Lines, S Letter) must not read as fitting by 0.1 mm here
      const free = Math.round((a.cells.roomMm + (a.growMm || 0) * rows - 4 - 1) * 10) / 10;
      // critic r4 N12 (PT-OPN-7): fewer than 2 Independent rows while the budget holds one more (with its strip if it opens the band)
      if (a.indep !== null && a.indep < 2 && free >= (a.indep ? 0 : a.cells.strip) + natural) errs.push(`${a.indep} Independent row(s) with ${free} mm free in the budget (a${a.indep ? '' : ' strip +'} row is ${((a.indep ? 0 : a.cells.strip) + natural).toFixed(1)} mm)`);
      // critic r5 N13 (PT-OPN-6: one Guided column gives 2 rows): a single Guided row while the budget holds a second one
      if (a.cols === 1 && a.guided === 1 && free >= natural) errs.push(`1 Guided row with ${free} mm free in the budget (a row is ${natural.toFixed(1)} mm)`);
      if (a.cells.overMm > 0.5) errs.push(`the last row runs ${a.cells.overMm} mm into the footer`);
      if (a.cells.empty) errs.push(`${a.cells.empty} empty cell(s)`);
      // critic r6 N15 (RUBRIC H9, TY-11): every answer slot holds its longest answer handwritten at the size's writing height
      // (0.55 x Hw a character, Hw 6 / 8 / 10 mm), and the given numbers print at >= 11 pt
      const w = a.write;
      if (w && w.cells) {
        // "All rows on one page" prints the whole sheet at Size S (owner 2026-10-02, print-sheet.js), so its rows write at S's height
        const hw = WRITE_MM[a.onePage ? 'S' : k.split(' | ')[2]];
        if (w.minW + 0.05 < w.maxLen * 0.55 * hw) errs.push(`answer slot ${w.minW} mm < ${w.maxLen} characters x 0.55 x ${hw} mm = ${(w.maxLen * 0.55 * hw).toFixed(1)} mm (${w.worst})`);
        if (w.minPt < 11 - 0.05) errs.push(`given numbers at ${w.minPt} pt (< 11 pt)`);
      }
      if (a.cells.maxBand >= 0.3) errs.push(`empty band ${Math.round(a.cells.maxBand * 100)} % (>= 30 %) in "${a.cells.worst}"`);
    }
    if (errs.length) bad++;
    const ind = k.includes('| opener |') ? `  guided ${b.guided === undefined ? '?' : b.guided} -> ${a.guided}, independent rows ${b.indep} -> ${a.indep}${a.cells ? `  cells ${a.cells.n}, band ${Math.round(a.cells.maxBand * 100)} %, foot ${a.cells.footMm} mm, room ${a.cells.roomMm} mm` : ''}${a.write && a.write.cells ? `  slot ${a.write.minW} mm / ${a.write.maxLen} ch, given ${a.write.minPt} pt` : ''}` : '';
    const st = a.states ? `  states ${JSON.stringify(b.states || '?')} -> ${JSON.stringify(a.states)}` : '';
    console.log(`${errs.length ? 'FAIL' : 'ok  '} ${k.padEnd(52)} pages ${b.pages}/${b.keyPages} -> ${a.pages}/${a.keyPages}${st}${ind}${errs.length ? '  ' + errs.join('; ') : ''}`);
  }
  // critic r6 N15 (lessons-learned L1): the givens never get smaller as the size grows (L >= M >= S), per combo and paper
  for (const c of COMBOS) for (const paper of PAPERS) {
    const pts = SIZES.map((sz) => ((now[`${c.name} | opener | ${sz} | ${paper}`] || {}).write || {}).minPt);
    if (pts.some((v) => !(v > 0) || !Number.isFinite(v))) continue;
    const ok = pts[0] <= pts[1] + 0.05 && pts[1] <= pts[2] + 0.05;
    if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${`${c.name} | opener | S/M/L | ${paper}`.padEnd(52)} given numbers ${pts.join(' / ')} pt${ok ? '' : '  (a larger size prints them smaller)'}`);
  }
  console.log(`small-fixes-model-pages: ${bad ? 'FAIL' : 'OK'} (${Object.keys(now).length} sheets${bad ? `, ${bad} failing` : ''})`);
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); console.log('small-fixes-model-pages: FAIL'); process.exit(1); });
