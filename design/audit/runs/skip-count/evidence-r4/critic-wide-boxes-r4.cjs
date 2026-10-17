// critic r4 (skip-count lane), D11: count_by_tables rows of 6 and 7 digits (step 25,000; 100,000 from 1,000,000) on
// EVERY print page type at S/M/L (A4), pupil page and key rendered in a same-origin iframe with the app's fonts.
// Per answer box: width >= digits x 5 mm + commas x 1.2 mm (the lead ruling), and in the key (and the model's traces)
// the written answer's ink box lies inside its box. Also the given numbers' font size (pt) and pages.
// node design/audit/runs/skip-count/evidence-r4/critic-wide-boxes-r4.cjs <out.txt>
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../../../../..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const ROWS = { w6: [{ step: 25000 }], w7: [{ step: 100000, start: 'custom', at: 1000000 }] };
const ROLES = ['scripted-model', 'guided', 'independent', 'more-practice', 'review', 'test'];
(async () => {
  const app = await open({ seed: 1, viewport: { width: 1000, height: 1400, deviceScaleFactor: 1 } });
  const out = await app.page.evaluate(async (ROWS, ROLES) => {
    const lines = []; let bad = 0;
    const measure = (html) => new Promise((resolve) => {
      const fr = document.createElement('iframe');
      fr.style.cssText = 'position:fixed;left:-3000px;top:0;width:900px;height:1400px;border:0;';
      document.body.appendChild(fr);
      fr.onload = async () => {
        const d = fr.contentDocument; try { await d.fonts.ready; } catch (e) { /* */ }
        await new Promise((r) => setTimeout(r, 80));
        const pxmm = 96 / 25.4; const res = { boxes: 0, narrow: [], spill: [], givenPt: Infinity, fonts: new Set() };
        // a count-row answer box: an element carrying data-ws-slot / data-ws-key-ans, or the svg rect of a slot
        const slots = [...d.querySelectorAll('[data-ws-slot], .ws-slot, [data-slot]')].filter((e) => e.closest('.k2-countrow-body, .k2-countrow, [data-ws-template="count-row"]') || true);
        for (const s of slots) {
          const r = s.getBoundingClientRect(); if (r.width < 8) continue;
          const txt = (s.textContent || '').trim();
          res.boxes++;
          const key = s.getAttribute('data-ws-key-ans') || txt;
          const digits = (String(key).match(/\d/g) || []).length, commas = (String(key).match(/,/g) || []).length;
          if (digits >= 6 && r.width / pxmm + 0.3 < digits * 5 + commas * 1.2) res.narrow.push(`${key}:${(r.width / pxmm).toFixed(1)}mm`);
          if (txt) {
            const rg = d.createRange(); rg.selectNodeContents(s); const tr = rg.getBoundingClientRect();
            if (tr.width && (tr.left < r.left - 0.5 || tr.right > r.right + 0.5)) res.spill.push(`${txt}:${tr.width.toFixed(0)}>${r.width.toFixed(0)}px`);
            res.fonts.add(d.defaultView.getComputedStyle(s).fontFamily.split(',')[0]);
          }
        }
        for (const g of d.querySelectorAll('.k2-given')) { const fs = parseFloat(d.defaultView.getComputedStyle(g).fontSize); if (fs) res.givenPt = Math.min(res.givenPt, fs * 0.75); }
        fr.remove(); res.fonts = [...res.fonts]; resolve(res);
      };
      fr.srcdoc = html.replace(/<head>/i, `<head><base href="${location.href}">`);
    });
    for (const [nm, rows] of Object.entries(ROWS)) for (const size of ['S', 'M', 'L']) for (const role of ROLES) {
      let o; try { o = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts: { rows } }] }], size, seed: 7, key: true }); } catch (e) { lines.push(`ERR ${nm} ${size} ${role} ${e.message}`); bad++; continue; }
      const p = await measure(window.sheetDocument(o.pupilHtml, 'P'));
      const k = await measure(window.sheetDocument(o.keyHtml || '', 'K'));
      const fail = p.narrow.length || k.narrow.length || p.spill.length || k.spill.length || !k.boxes;
      if (fail) bad++;
      lines.push(`${fail ? 'FAIL' : 'ok  '} ${nm} ${size} ${role}: pages ${o.pageCount}+${o.keyPageCount}k, boxes ${p.boxes}/${k.boxes}, given >= ${p.givenPt.toFixed(1)} pt, narrow ${JSON.stringify(p.narrow.concat(k.narrow).slice(0, 3))}, spill ${JSON.stringify(p.spill.concat(k.spill).slice(0, 3))}, fonts ${k.fonts.join('/')}`);
    }
    return { lines, bad };
  }, ROWS, ROLES);
  fs.writeFileSync(process.argv[2], out.lines.join('\n') + `\n${out.bad ? 'FAIL' : 'OK'} (${out.bad} failing)\n`);
  console.log(out.lines.join('\n')); console.log(out.bad ? `critic-wide-boxes-r4: FAIL (${out.bad})` : 'critic-wide-boxes-r4: OK');
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
