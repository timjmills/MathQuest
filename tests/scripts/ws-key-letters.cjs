// ws-key-letters: answer-key options (key {on, placement, style, newSheet}) through the public buildSheet for More Practice letters, pool pages and multi-page Independent sheets, S/M/L (lane D r11: the merge's mergeLetterSheets dropped letter B from pupilPages/keyPages).
const { open } = require('../lib/ws-harness.cjs');
const CASES = [
  { name: 'MP dot_array_mult A,B', role: 'more-practice', letters: ['A', 'B'], sk: ['multiplication', 'dot_array_mult'] },
  { name: 'MP number_families_add A,B,C', role: 'more-practice', letters: ['A', 'B', 'C'], sk: ['addition', 'number_families_add'] },
  { name: 'MP mixed_multiplication A,B (pool)', role: 'more-practice', letters: ['A', 'B'], sk: ['multiplication', 'mixed_multiplication'] },
  { name: 'IND mixed_composing (pool)', role: 'independent', sk: ['composing', 'mixed_composing'] },
  { name: 'IND add_sub_10s 2 pages', role: 'independent', pages: 2, sk: ['addition', 'add_sub_10s'] },
];
const KEYS = [true, { on: true, placement: 'end', style: 'copy' }, { on: true, placement: 'end', style: 'short' }, { on: true, placement: 'after-page', style: 'copy' }, { on: true, placement: 'after-page', style: 'short' }, { on: true, placement: 'after-page', style: 'copy', newSheet: true }, { on: false }];
(async () => {
  const { page, close, problems } = await open();
  const bad = [];
  for (const size of ['S', 'M', 'L']) for (const c of CASES) for (const key of KEYS) {
    const req = { role: c.role, letters: c.letters, size, seed: 7, sections: [{ skills: [{ categoryId: c.sk[0], skillId: c.sk[1], opts: {} }], columns: 'auto', pages: c.pages }], key };
    const r = await page.evaluate(async (req) => {
      const res = await window.buildSheet(req);
      const cnt = (h, re) => (String(h || '').match(re) || []).length;
      const doc = res.docHtml || '';
      const pupilIn = cnt(doc, /data-ws-mode="pupil"|<section [^>]*class="ws-page(?![^"]*ws-key)(?![^"]*blank)[^"]*"(?![^>]*data-ws-mode="key")/g);
      const order = [...doc.matchAll(/<section\b([^>]*class=\"ws-page[^>]*)>/g)].map((m) => /data-ws-mode="key"/.test(m[1]) ? 'K' : /blank/.test(m[1]) ? '_' : 'P').join('');
      const ko = res.keyOptions || {};
      return { pageCount: res.pageCount, pupilPages: (res.pupilPages || []).length, keyPageCount: res.keyPageCount, order, ko, shortRows: res.shortRows ? res.shortRows.map((r) => r.heading + ':' + r.items.length) : null, items: res.items.length, docLen: doc.length,
        nPupilHtml: cnt(res.pupilHtml, /<section\b[^>]*class="ws-page/g) };
    }, req);
    const keyOn = key === true || (key && key.on);
    const P = (r.order.match(/P/g) || []).length, K = (r.order.match(/K/g) || []).length;
    const errs = [];
    if (P !== r.pageCount) errs.push(`doc pupil pages ${P} != pageCount ${r.pageCount}`);
    if (r.pupilPages !== r.pageCount) errs.push(`pupilPages ${r.pupilPages} != pageCount ${r.pageCount}`);
    if (c.letters && r.pageCount < c.letters.length) errs.push(`pageCount ${r.pageCount} < letters ${c.letters.length}`);
    if (keyOn && K === 0) errs.push('no key pages in doc');
    if (!keyOn && K) errs.push('key pages with key off');
    if (keyOn && K !== r.keyPageCount) errs.push(`doc key ${K} != keyPageCount ${r.keyPageCount}`);
    if (keyOn && key.placement === 'after-page' && !/^P/.test(r.order)) errs.push('after-page not starting with P');
    if (keyOn && key.newSheet && (r.order.length % 2 || !/^(P_?|_)/.test(r.order))) errs.push('newSheet parity ' + r.order);
    if (keyOn && key.placement === 'after-page' && !key.newSheet && !/^(P+K+)+$/.test(r.order)) errs.push('after-page order ' + r.order);
    if (keyOn && key.placement === 'after-page' && (r.order.replace(/_/g, '').match(/PK/g) || []).length !== r.pageCount) errs.push('after-page pairs ' + r.order);
    if (keyOn && key.style === 'short' && (!r.shortRows || r.shortRows.length !== r.pageCount)) errs.push('short rows ' + JSON.stringify(r.shortRows));
    if (keyOn && key.style === 'short' && r.shortRows && r.shortRows.reduce((a, s) => a + +s.split(':').pop(), 0) !== r.items) errs.push(`short items != items ${r.items}`);
    const line = `${size} ${c.name} key=${JSON.stringify(key)} pages=${r.pageCount} order=${r.order} ${r.shortRows ? JSON.stringify(r.shortRows) : ''}`;
    console.log((errs.length ? 'FAIL ' : 'ok   ') + line + (errs.length ? ' :: ' + errs.join('; ') : ''));
    if (errs.length) bad.push(line);
  }
  if (problems.length) console.log('console problems', JSON.stringify(problems.slice(0, 5)));
  console.log(bad.length || problems.length ? `ws-key-letters: FAIL ${bad.length}` : 'ws-key-letters: OK');
  if (bad.length || problems.length) process.exitCode = 1;
  await close();
})().catch((e) => { console.error(e); process.exit(1); });
