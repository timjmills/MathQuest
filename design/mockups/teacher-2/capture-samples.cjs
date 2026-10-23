// Teacher site 2.0 T1 (fix round 4, critic r4 C1, stop rule §1.7): the thumbnails are the REAL app's items.
// The root cause of three rounds of wrong pictures was that thumbs.js drew stand-ins guessed from the skill id and label.
// This script boots the real app in headless Chromium and, for every live skill in data.js, prints a seeded independent
// sheet through the real sheet kit (window.buildSheet → generateQuestionFor, the skill's own default options), then takes
// the first N boxed cells of the pupil page exactly as they print (print media: black and white, Andika).
// Each cell is SANITISED into standalone markup: scripts, handlers, ids, classes and data attributes are dropped; every
// element's computed style is written back (geometry inline, everything else as shared atom classes .smp-sN), SVG ids are
// renamed per sample, and ::before / ::after content becomes real spans. So a sample renders the same inside the mock-up's
// thumbnail box at any scale (it sits in an <svg viewBox> → <foreignObject>), with none of the app's CSS loaded.
//   node design/mockups/teacher-2/capture-samples.cjs [--only cat:skill,cat:skill] [--n 6] [--seed 4101]
// Writes samples.js (window.MQ_SAMPLES = {css, seed, n, s: {'cat:skill': [{h, w, ht, t, a, x}…]}, fail: {'cat:skill': why}}).
//   h = the sample's hash (cat:skill:seed:item) · w/ht = the cell's size in CSS px · t = the item's text · a = its answer
//   x = the sanitised cell markup · fail = skills whose sheet threw or dealt no cell (those keep the hand-drawn fallback)
'use strict';
const fs = require('fs');
const path = require('path');
const { open } = require('../../../tests/lib/ws-harness.cjs');
const DIR = __dirname;
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const N = Number(arg('n', 3));
const SEED = Number(arg('seed', 4101));
const ONLY = arg('only', '') ? arg('only', '').split(',') : null;
const OUT = arg('out', path.join(DIR, 'samples.js'));

global.window = global;
require(path.join(DIR, 'data.js'));
const skills = window.MQ_DATA.skills.filter(s => !ONLY || ONLY.includes(s.c + ':' + s.v));

function hash(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

// ---- runs in the page: serialise one element (the boxed cell) with its computed style
function serialiseInPage(opts) {
  const { sel, n, prefix } = opts;
  const doc = window.__smpDoc;
  const cells = [...doc.querySelectorAll(sel)].filter(c => c.getBoundingClientRect().width > 4).slice(0, n);
  const SVGNS = 'http://www.w3.org/2000/svg';
  const HTML_TAGS = new Set(['div', 'span', 'b', 'i', 'em', 'strong', 'sub', 'sup', 'br', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'p', 'ul', 'ol', 'li', 'small', 'u', 's', 'hr', 'img', 'caption', 'colgroup', 'col']);
  const INH = ['color', 'font-family', 'font-feature-settings', 'font-variant-ligatures', 'font-size', 'font-weight', 'font-style', 'line-height', 'text-align', 'white-space', 'letter-spacing', 'word-spacing', 'text-transform', 'visibility', 'font-variant-numeric', 'text-indent', 'direction', 'word-break', 'overflow-wrap', 'border-collapse', 'border-spacing', 'list-style-type',
    'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'stroke-opacity', 'fill-opacity', 'text-anchor', 'dominant-baseline', 'paint-order', 'stroke-miterlimit', 'fill-rule'];
  const NON = ['display', 'position', 'top', 'right', 'bottom', 'left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
    'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius',
    'background-color', 'background-image', 'vertical-align', 'text-decoration-line', 'text-decoration-style', 'text-decoration-thickness', 'text-underline-offset',
    'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-self', 'align-content', 'justify-items', 'justify-self', 'flex-grow', 'flex-shrink', 'flex-basis', 'order',
    'row-gap', 'column-gap', 'grid-template-columns', 'grid-template-rows', 'grid-column-start', 'grid-column-end', 'grid-row-start', 'grid-row-end', 'grid-auto-flow',
    'min-width', 'min-height', 'max-width', 'max-height', 'transform', 'transform-origin', 'overflow-x', 'overflow-y', 'opacity', 'z-index', 'writing-mode', 'table-layout', 'outline-style', 'outline-width', 'outline-color', 'outline-offset', 'box-shadow', 'zoom', 'float', 'clear', 'object-fit'];
  const SVG_NON = ['display', 'opacity', 'transform', 'transform-origin', 'overflow-x', 'overflow-y'];
  const GEOM = new Set(['top', 'right', 'bottom', 'left']);
  const blank = window.__smpBlank;
  const defCache = {};
  const defOf = (tag, svg, top) => {
    const k = (svg ? (top ? 't:' : 's:') : 'h:') + tag;
    if (defCache[k]) return defCache[k];
    const el = svg ? blank.createElementNS(SVGNS, tag) : blank.createElement(tag);
    (svg && !top ? blank.querySelector('svg') : blank.body).appendChild(el);
    const cs = blank.defaultView.getComputedStyle(el); const o = {};
    for (const p of NON) o[p] = cs.getPropertyValue(p);
    el.remove(); return (defCache[k] = o);
  };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escA = (s) => esc(s).replace(/"/g, '&quot;');
  const atoms = window.__smpAtoms;           // style text -> class index, shared across the run
  const atom = (decl) => { if (!decl) return ''; let i = atoms.get(decl); if (i === undefined) { i = atoms.size; atoms.set(decl, i); } return '_' + i.toString(36); };
  const px = (v) => { const f = parseFloat(v); return Number.isFinite(f) ? (Math.round(f * 10) / 10) + 'px' : v; };
  const hex = (v) => String(v).replace(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/g, (m, r, g, b, a) => a !== undefined && a !== '1' ? (a === '0' ? 'transparent' : m) : '#' + [r, g, b].map(x => (+x).toString(16).padStart(2, '0')).join('').replace(/^(.)\1(.)\2(.)\3$/, '$1$2$3'));
  const normVal = (p, v) => {
    v = hex(v);
    if (p === 'font-family') return /mono/i.test(v) ? '"JetBrains Mono", monospace' : '"MQ Andika", Andika, sans-serif';
    if (/^(top|right|bottom|left|margin|padding|border-.*-width|border-.*-radius|row-gap|column-gap|font-size|letter-spacing|word-spacing|stroke-width|text-indent|line-height|outline-width|outline-offset|text-underline-offset|flex-basis|border-spacing)/.test(p) && /^-?[\d.]+px$/.test(v)) return px(v);
    return v;
  };
  const results = [];
  for (const [ci, cell] of cells.entries()) {
    const idMap = {}; const sp = prefix + ci + '-';
    cell.querySelectorAll('svg [id]').forEach(e => { idMap[e.id] = sp + e.id; });
    const fixRefs = (v) => String(v).replace(/url\(\s*["']?#([^"')\s]+)["']?\s*\)/g, (m, id) => idMap[id] ? `url(#${idMap[id]})` : 'none').replace(/^#(.+)$/, (m, id) => idMap[id] ? '#' + idMap[id] : m);
    const pseudo = (el, which, parentCs) => {
      const cs = doc.defaultView.getComputedStyle(el, which); const c = cs.getPropertyValue('content');
      if (!c || c === 'none' || c === 'normal') return '';
      let txt = c; const m = c.match(/^"(.*)"$/s); if (m) txt = m[1].replace(/\\"/g, '"').replace(/\\a /g, '\n'); else if (c === '""') txt = ''; else if (/counter|attr/.test(c)) txt = ''; else txt = '';
      const decl = []; let geo = '';
      for (const p of INH) { const v = cs.getPropertyValue(p); if (v !== parentCs.getPropertyValue(p)) decl.push(p + ':' + normVal(p, fixRefs(v))); }
      const d = defOf('span', false);
      for (const p of NON) { const v = cs.getPropertyValue(p); if (p === 'transform-origin' && cs.getPropertyValue('transform') === 'none') continue; if (v !== d[p]) { if (GEOM.has(p)) geo += p + ':' + px(v) + ';'; else decl.push(p + ':' + normVal(p, v)); } }
      const disp = cs.getPropertyValue('display');
      if (disp !== 'inline') { const w = cs.getPropertyValue('width'), h = cs.getPropertyValue('height'); if (w !== 'auto') geo += 'width:' + px(w) + ';'; if (h !== 'auto') geo += 'height:' + px(h) + ';'; }
      return `<span class="${atom(decl.join(';'))}"${geo ? ` style="${geo}"` : ''}>${esc(txt)}</span>`;
    };
    const walk = (el, parentCs, isRoot, subst) => {
      if (el.nodeType === 3) {
        // whitespace collapses as the browser would (indentation in the legacy markup is not content)
        const ws = el.parentElement ? doc.defaultView.getComputedStyle(el.parentElement).whiteSpace : 'normal';
        if (/^pre/.test(ws) || ws === 'break-spaces') return esc(el.nodeValue);
        const t = el.nodeValue.replace(/[ \t\n\r]+/g, ' ');
        if (t === ' ') { const a = el.previousSibling, b = el.nextSibling; const blockish = (n) => !n || (n.nodeType === 1 && /^(block|flex|grid|table|list-item|none)/.test(doc.defaultView.getComputedStyle(n).display)); const pd = el.parentElement ? doc.defaultView.getComputedStyle(el.parentElement).display : 'block'; if (blockish(a) || blockish(b) || /flex|grid/.test(pd)) return ''; }
        return esc(t);
      }
      if (el.nodeType !== 1) return '';
      const tag = el.tagName.toLowerCase();
      if (['script', 'style', 'noscript', 'template', 'link', 'meta', 'title'].includes(tag)) return '';
      const isSvg = el.namespaceURI === SVGNS;
      const cs = doc.defaultView.getComputedStyle(el);
      if (cs.display === 'none') return '';
      const sub = subst || (!isSvg && !/andika|mono/i.test(cs.fontFamily));
      let outTag = tag, attrs = '';
      if (isSvg) {
        if (tag === 'script' || tag === 'foreignobject' || tag === 'foreignObject') return '';
        for (const a of el.attributes) {
          const n = a.name;
          if (/^on/i.test(n) || n === 'style' || n === 'class' || /^data-/.test(n) || /^aria-/.test(n) || n === 'role' || n === 'tabindex' || n === 'xmlns') continue;
          if (n === 'id') { attrs += ` id="${escA(idMap[a.value] || sp + a.value)}"`; continue; }
          if (n === 'href' || n === 'xlink:href') { if (!/^#/.test(a.value)) continue; attrs += ` href="${escA(fixRefs(a.value))}"`; continue; }
          attrs += ` ${n}="${escA(fixRefs(a.value))}"`;
        }
      } else {
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button') outTag = 'span';
        else if (!HTML_TAGS.has(tag)) outTag = /^(block|flex|grid|table|list-item)/.test(cs.display) ? 'div' : 'span';
        if (tag === 'img') { const src = el.currentSrc || el.src || ''; if (/^data:image\/(svg\+xml|png|gif|jpeg)/.test(src) && src.length < 20000) attrs += ` src="${escA(src)}" alt=""`; else return ''; }
        if (tag === 'td' || tag === 'th') { if (el.colSpan > 1) attrs += ` colspan="${el.colSpan}"`; if (el.rowSpan > 1) attrs += ` rowspan="${el.rowSpan}"`; }
      }
      const decl = []; let geo = '';
      for (const p of INH) { if (!isSvg && /^(fill|stroke|text-anchor|dominant-baseline|paint-order|fill-rule)/.test(p) && !el.querySelector('svg')) continue; const v = cs.getPropertyValue(p);
        if (isSvg && !isRoot && el.hasAttribute(p)) { const av = el.getAttribute(p); if (hex(v) === hex(av) || (/width|opacity|size/.test(p) && parseFloat(v) === parseFloat(av))) continue; } if (isRoot || v !== parentCs.getPropertyValue(p)) decl.push(p + ':' + normVal(p, fixRefs(v))); }
      // an <svg> in the page is a CSS box like any other (it can be absolutely placed, e.g. a drag layer over a number line)
      const topSvg = isSvg && !el.ownerSVGElement;
      const list = isSvg && !topSvg ? SVG_NON : NON; const d = defOf(isSvg ? tag : (outTag === tag ? tag : (outTag === 'div' ? 'div' : 'span')), isSvg, topSvg);
      for (const p of list) {
        const v = cs.getPropertyValue(p);
        if (isRoot && /^(margin|top|right|bottom|left|position|grid-|align-self|justify-self|order|flex-grow|flex-shrink|flex-basis|float)/.test(p)) continue;
        if (p === 'transform-origin' && cs.getPropertyValue('transform') === 'none') continue;
        if (v !== d[p]) { if (GEOM.has(p)) geo += p + ':' + px(v) + ';'; else decl.push(p + ':' + normVal(p, fixRefs(v))); }
      }
      if (isRoot) decl.push('position:relative', 'margin:0', 'background-color:#fff');
      // fixed geometry: the border-box size the cell had (layout size, before transforms)
      if (isSvg) {
        if (tag === 'svg') { const r = el.getBoundingClientRect(); const z = el.ownerSVGElement ? 0 : 1; if (z) geo += `width:${px(r.width / (window.__smpZoom(el) || 1))};height:${px(r.height / (window.__smpZoom(el) || 1))};`; }
      } else if (cs.display !== 'inline' && cs.display !== 'contents' && !/^table-(row|row-group|header-group|footer-group|column)/.test(cs.display)) {
        // a size is written only where the cell set it: with width / height forced to auto the box would differ
        const br = el.getBoundingClientRect(); const zf = window.__smpZoom(el) || 1; const W = br.width / zf, H = br.height / zf; const sw = el.style.getPropertyValue('width'), swp = el.style.getPropertyPriority('width'), sh = el.style.getPropertyValue('height'), shp = el.style.getPropertyPriority('height');
        el.style.setProperty('width', 'auto', 'important'); const aw = el.getBoundingClientRect().width / zf; el.style.setProperty('width', sw, swp); if (!sw) el.style.removeProperty('width');
        el.style.setProperty('height', 'auto', 'important'); const ah = el.getBoundingClientRect().height / zf; el.style.setProperty('height', sh, shp); if (!sh) el.style.removeProperty('height');
        // a form control or picture keeps its own size (it becomes an empty span, which has no intrinsic size)
        const fixed = isRoot || outTag !== tag || /^(img|canvas|video|object|embed|iframe)$/.test(tag);
        // a width is left to the layout only for a plain block in normal flow inside a plain block (it fills its parent);
        // anywhere else (flex / grid items, inline-blocks, floats, shrink-to-fit parents) it is written, because one
        // auto width there changes its neighbours' (measured: dropping them one at a time is not safe)
        const pcs = el.parentElement ? doc.defaultView.getComputedStyle(el.parentElement) : null;
        const plainBlock = cs.display === 'block' && cs.position === 'static' && cs.cssFloat === 'none' && pcs && /^(block|list-item|flow-root)$/.test(pcs.display) && !isRoot;
        // text the app set in another face (some legacy cells use Arial) is drawn in Andika here (pupil content is Andika),
        // which is wider: such boxes get a MINIMUM width and no fixed height, so the text never wraps where it did not
        if (sub && !fixed) { if (!plainBlock || Math.abs(aw - W) > 0.5) geo += 'min-width:' + Math.ceil(W) + 'px;'; }
        else if (fixed || !plainBlock || Math.abs(aw - W) > 0.5) geo += 'width:' + Math.ceil(W) + 'px;';
        if (fixed || (!sub && Math.abs(ah - H) > 0.5)) geo += 'height:' + Math.round(H) + 'px;';
      }
      const cls = atom(decl.join(';'));
      if (opts.debug && !isSvg) { const r = el.getBoundingClientRect(), c0 = cell.getBoundingClientRect(); attrs += ` data-r="${Math.round(r.left - c0.left)},${Math.round(r.top - c0.top)},${Math.round(r.width)},${Math.round(r.height)}"`; }
      let inner = '';
      if (!isSvg) inner += pseudo(el, '::before', cs);
      for (const ch of el.childNodes) inner += walk(ch, cs, false, sub);
      if (!isSvg) inner += pseudo(el, '::after', cs);
      if (outTag === 'br' || outTag === 'hr' || outTag === 'img' || outTag === 'col') return `<${outTag}${cls ? ` class="${cls}"` : ''}${geo ? ` style="${geo}"` : ''}${attrs}>`;
      return `<${outTag}${cls ? ` class="${cls}"` : ''}${geo ? ` style="${geo}"` : ''}${attrs}>${inner}</${outTag}>`;
    };
    const parentCs = doc.defaultView.getComputedStyle(cell.parentElement);
    const html = walk(cell, parentCs, true);
    // the crop: the union of what is drawn (text, drawings, ruled or filled boxes), the item letter left out, so a small
    // thumbnail shows the problem and not the cell's empty writing room
    const cr = cell.getBoundingClientRect(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    const add = (r) => { if (!r || r.width < 0.5 && r.height < 0.5) return; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); };
    const tw = doc.createTreeWalker(cell, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (let nd = tw.nextNode(); nd; nd = tw.nextNode()) {
      if (nd.nodeType === 1 && (nd.classList.contains('ws-letter') || nd.closest('.ws-letter'))) continue;
      if (nd.nodeType === 3) { if (!nd.nodeValue.trim() || (nd.parentElement && nd.parentElement.closest('.ws-letter'))) continue; const rg = doc.createRange(); rg.selectNodeContents(nd); for (const r of rg.getClientRects()) add(r); continue; }
      if (nd.namespaceURI === SVGNS) { if (nd.tagName.toLowerCase() === 'svg' && !nd.ownerSVGElement) add(nd.getBoundingClientRect()); continue; }
      const cs = doc.defaultView.getComputedStyle(nd); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const bordered = ['top', 'right', 'bottom', 'left'].some(sd => parseFloat(cs.getPropertyValue('border-' + sd + '-width')) > 0 && cs.getPropertyValue('border-' + sd + '-style') !== 'none');
      const filled = !/rgba\(0, 0, 0, 0\)|transparent|rgb\(255, 255, 255\)/.test(cs.backgroundColor);
      if (bordered || filled) add(nd.getBoundingClientRect());
    }
    let crop = null;
    if (x1 > x0) { const P = 8; const cx = Math.max(0, x0 - cr.left - P), cy = Math.max(0, y0 - cr.top - P); crop = [Math.floor(cx), Math.floor(cy), Math.ceil(Math.min(cr.width, x1 - cr.left + P) - cx), Math.ceil(Math.min(cr.height, y1 - cr.top + P) - cy)]; }
    results.push({ crop, w: Math.round(cell.offsetWidth), ht: Math.round(cell.offsetHeight), x: html, txt: (cell.innerText || cell.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 400) });
  }
  return results;
}

(async () => {
  const t0 = Date.now();
  const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
  const page = app.page;
  page.setDefaultTimeout(120000);
  await page.emulateMediaType('print');
  // a frame that holds each printed sheet with the sheet's own stylesheets, and a blank frame for default styles
  await page.evaluate(async () => {
    window.__smpAtoms = new Map();
    window.__smpZoom = (el) => { let z = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const v = parseFloat(e.ownerDocument.defaultView.getComputedStyle(e).zoom); if (v && v !== 1) z *= v; } return z; };
    const b = document.createElement('iframe'); b.style.cssText = 'position:fixed;left:-3000px;top:0;width:800px;height:600px'; document.body.appendChild(b);
    b.contentDocument.open(); b.contentDocument.write('<!doctype html><html><body><svg></svg></body></html>'); b.contentDocument.close();
    window.__smpBlank = b.contentDocument;
  });
  const out = { seed: SEED, n: N, s: {}, fail: {} };
  let i = 0;
  for (const s of skills) {
    const key = s.c + ':' + s.v; i++;
    let res;
    try {
      res = await page.evaluate(async ({ c, v, seed, n }) => {
        const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: c, skillId: v }], count: Math.max(n, 4) }], size: 'M', seed, key: false });
        const old = document.getElementById('__smpFrame'); if (old) old.remove();
        const f = document.createElement('iframe'); f.id = '__smpFrame'; f.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:1400px;border:0;background:#fff';
        document.body.appendChild(f);
        await new Promise((ok) => { f.onload = ok; f.srcdoc = window.sheetDocument(r.pupilHtml, 'capture'); setTimeout(ok, 15000); });
        const d = f.contentDocument;
        for (let t = 0; t < 100 && d.documentElement.getAttribute('data-ws-fonts') !== 'ready'; t++) await new Promise(ok => setTimeout(ok, 50));
        await new Promise(ok => setTimeout(ok, 30));
        window.__smpDoc = d;
        return { items: r.items.map(it => ({ text: it.text, ans: it.ans })) };
      }, { c: s.c, v: s.v, seed: SEED, n: N });
      const cells = await page.evaluate(serialiseInPage, { sel: '.ws-page .ws-cell:not(.blankrun)', n: N, prefix: 'q' + i.toString(36) + '-', debug: !!process.env.SMP_DEBUG });
      if (!cells.length) { out.fail[key] = 'the sheet dealt no cell'; continue; }
      out.s[key] = cells.map((c, j) => ({ h: hash(`${key}:${SEED}:${j}`), w: c.w, ht: c.ht, t: String((res.items[j] || {}).text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300), a: (res.items[j] || {}).ans === undefined ? '' : String((res.items[j] || {}).ans).slice(0, 120), v: c.txt, c: c.crop, x: c.x }));
    } catch (e) { out.fail[key] = String(e.message || e).split('\n')[0].slice(0, 200); }
    if (i % 25 === 0) process.stderr.write(`  ${i}/${skills.length} ${Math.round((Date.now() - t0) / 1000)} s\n`);
  }
  const atoms = await page.evaluate(() => [...window.__smpAtoms.entries()]);
  const errs = app.problems.length;
  // the CSS: a reset that keeps the mock-up's own rules (border-box, button font, table width …) out of the sample, then the atoms
  // the app's own Andika 6.200 (SIL release, with the open-top 4), so a sample wraps and measures exactly as it printed
  out.css = '@font-face{font-family:"MQ Andika";font-weight:400;font-display:block;src:url("../../../css/fonts/Andika-Regular.woff2") format("woff2")}' +
    '@font-face{font-family:"MQ Andika";font-weight:700;font-display:block;src:url("../../../css/fonts/Andika-Bold.woff2") format("woff2")}' +
    '.smp-fo{overflow:visible}.smp,.smp *{box-sizing:border-box;max-width:none;max-height:none;min-width:0;min-height:0;cursor:inherit}' +
    '.smp table{width:auto}.smp p{margin:0}.smp svg{overflow:visible}' +
    atoms.map(([decl, k]) => decl ? `.smp ._${k.toString(36)}{${decl}}` : '').join('');
  // the crop, measured where the sample is SHOWN: each sample is rendered on its own in a clean page with only this CSS
  // (no app stylesheet), and the crop is the union of what is drawn there (the item letter left out), so a thumbnail
  // never cuts off a word even where Andika is wider than the face a legacy cell printed in
  const rp = await app.browser.newPage(); await rp.setViewport({ width: 1600, height: 1200 });
  await rp.goto(app.base + '/design/mockups/teacher-2/__capture_replay__', { waitUntil: 'load' }).catch(() => {});
  await rp.evaluate((css) => { document.documentElement.innerHTML = '<head></head><body style="margin:0;background:#fff"></body>'; const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }, out.css);
  await rp.evaluate(async () => { await document.fonts.load('400 20px "MQ Andika"'); await document.fonts.load('700 20px "MQ Andika"'); });
  const keys = Object.keys(out.s);
  for (let b = 0; b < keys.length; b += 40) {
    const batch = keys.slice(b, b + 40).map(k => [k, out.s[k].map(it => it.x)]);
    const crops = await rp.evaluate(async (batch) => {
      const res = {};
      for (const [k, xs] of batch) {
        res[k] = [];
        for (const x of xs) {
          const host = document.createElement('div'); host.className = 'smp'; host.style.cssText = 'position:absolute;left:0;top:0'; host.innerHTML = x; document.body.appendChild(host);
          const root = host.firstElementChild; const R = root.getBoundingClientRect(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
          const add = (r) => { if (!r || (r.width < 0.5 && r.height < 0.5)) return; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); };
          const letter = root.firstElementChild && /^[a-z]\.$/.test((root.firstElementChild.textContent || '').trim()) ? root.firstElementChild : null;
          const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
          for (let nd = tw.nextNode(); nd; nd = tw.nextNode()) {
            if (letter && (nd === letter || letter.contains(nd))) continue;
            if (nd.nodeType === 3) { if (!nd.nodeValue.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(nd); for (const r of rg.getClientRects()) add(r); continue; }
            if (nd.namespaceURI === 'http://www.w3.org/2000/svg') { if (nd.tagName.toLowerCase() === 'svg' && !nd.ownerSVGElement) add(nd.getBoundingClientRect()); continue; }
            const cs = getComputedStyle(nd); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            const bordered = ['top', 'right', 'bottom', 'left'].some(sd => parseFloat(cs.getPropertyValue('border-' + sd + '-width')) > 0 && cs.getPropertyValue('border-' + sd + '-style') !== 'none');
            const filled = !/rgba\(0, 0, 0, 0\)|transparent|rgb\(255, 255, 255\)/.test(cs.backgroundColor);
            if (bordered || filled) add(nd.getBoundingClientRect());
          }
          const P = 10;
          res[k].push(x1 > x0 ? [Math.floor(Math.max(-40, x0 - R.left - P)), Math.floor(Math.max(-40, y0 - R.top - P)), 0, 0].map((v, i, a) => i === 2 ? Math.ceil(x1 - R.left + P) - a[0] : i === 3 ? Math.ceil(y1 - R.top + P) - a[1] : v) : null);
          host.remove();
        }
      }
      return res;
    }, batch);
    for (const [k, list] of Object.entries(crops)) list.forEach((c, j) => { if (c) out.s[k][j].c = c; });
  }
  await app.close();
  const js = '// GENERATED by `node capture-samples.cjs` from the real app (buildSheet → generateQuestionFor, seed ' + SEED + '). Do not edit.\n' +
    'window.MQ_SAMPLES = ' + JSON.stringify(out) + ';\n';
  fs.writeFileSync(OUT, js);
  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log(`capture-samples: ${Object.keys(out.s).length} skills captured, ${Object.keys(out.fail).length} failed, ${atoms.length} style atoms, ${kb} KB, ${Math.round((Date.now() - t0) / 1000)} s, ${errs} console errors`);
  for (const [k, why] of Object.entries(out.fail)) console.log('  fallback ' + k + ': ' + why);
})();
