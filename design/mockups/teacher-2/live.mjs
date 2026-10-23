// Teacher site 2.0 T1 (fix round 5, critic r5 A1 / C1 / C2, stop rule §1.7): every thumbnail is drawn LIVE by the app.
//
// The thumbnail defect survived four rounds because each round COPIED the app's drawing into a mock-up format (hand
// drawings, then a sanitised DOM capture whose CSS reset broke SVG font sizes). Nothing is copied now. This module imports
// the app's own sheet bridge read-only (js/modules/print-sheet.js → buildSheet → generateQuestionFor, the skill's default
// options, seeded), prints a one-skill independent sheet exactly as the teacher print screen does, and shows ONE of its
// boxed cells inside an <iframe> holding the app's own sheet document (sheetDocument: the app's stylesheets, Andika).
//
//   <div class="live-thumb" data-k="cat:skill" data-seed="4101" data-n="0">  → drawn when it scrolls into view
//
// The crop (lead, 2026-10-23, critic r5 C2): the window is anchored at the LEFT and TOP of what the cell draws, never
// centred, so every line keeps its start; a place's --smp-min (Big 12 px, Medium 11, Small 9, the board 20) is met by
// CROPPING (fade on the right / bottom), never by shrinking below it. A place with --smp-min 0 (a page preview, the tray
// bar's mini picture) shows the whole cell, scaled to fit, never above print size.
//
// thumbs-check.cjs holds every drawn thumbnail to the app's own buildSheet in the booted app (index.html), cell for cell.

const PRINT_SHEET = new URL('../../../js/modules/print-sheet.js', import.meta.url).href;
const APP_BASE = new URL('../../../', import.meta.url).href;
const CELL_SEL = '.ws-page .ws-cell:not(.blankrun)';
export const CARD_SEED = 4101;          // a card's item: the first cell of the sheet printed at this seed

function hashStr(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
/** The mock-up's seed (a card: none; New numbers: a token) → the sheet seed buildSheet is given. */
export function sheetSeed(seed) {
  if (seed === undefined || seed === null || seed === '' || seed === 1 || seed === '1') return CARD_SEED;
  if (typeof seed === 'number' && Number.isFinite(seed)) return seed >>> 0;
  if (/^\d+$/.test(String(seed))) return Number(seed) >>> 0;
  return 1 + (hashStr('pick:' + seed) % 999983);
}
/** The request a thumbnail prints: the same one the check sends to the booted app. */
export function sheetRequest(key, seed, count) {
  const [c, v] = String(key).split(':');
  return { role: 'independent', sections: [{ skills: [{ categoryId: c, skillId: v }], count }], size: 'M', seed: sheetSeed(seed), key: false };
}
export const countFor = (n) => Math.max(4, Math.ceil((n + 1) / 4) * 4);

// ------------------------------------------------------------------ measuring a drawn cell (shared with the check)
// What a cell DRAWS: every text line (its words, effective font size, box) and every drawing (svg, img, a ruled or filled
// box), relative to the top-left of the union of what is drawn. Run on the app's sheet and on the mock-up's thumbnail,
// the two must agree; the crop reads the same numbers.
export function measureCell(cell) {
  const doc = cell.ownerDocument, win = doc.defaultView;
  const texts = [], draws = [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const grow = (r) => { if (r.width < 0.5 && r.height < 0.5) return; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); };
  const visible = (el) => { for (let e = el; e && e !== cell.parentElement; e = e.parentElement) { const cs = win.getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false; } return true; };
  const kCache = {};
  const contentRatio = (family, weight) => {      // a font's line-box height ÷ its font size, measured in this document
    const k = family + '|' + weight; if (kCache[k]) return kCache[k];
    const s = doc.createElement('span'); s.style.cssText = `position:absolute;left:-9999px;top:0;font-family:${family};font-weight:${weight};font-size:100px;line-height:normal;white-space:nowrap`;
    s.textContent = 'Hxg8'; doc.body.appendChild(s); const rg = doc.createRange(); rg.selectNodeContents(s);
    const h = rg.getBoundingClientRect().height / 100; s.remove(); return (kCache[k] = h || 1.2);
  };
  const walker = doc.createTreeWalker(cell, win.NodeFilter.SHOW_TEXT);
  for (let nd = walker.nextNode(); nd; nd = walker.nextNode()) {
    const t = nd.nodeValue.replace(/\s+/g, ' ').trim(); if (!t) continue;
    const el = nd.parentElement; if (!el || /^(script|style|title|desc)$/i.test(el.tagName) || !visible(el)) continue;
    const cs = win.getComputedStyle(el); const svgText = el instanceof win.SVGElement;
    let fs;
    if (svgText) { const m = el.getScreenCTM ? el.getScreenCTM() : null; fs = parseFloat(cs.fontSize) * (m ? Math.hypot(m.a, m.b) : 1); }
    const rg = doc.createRange(); rg.selectNodeContents(nd);
    const rects = [...rg.getClientRects()].filter(r => r.width > 0.5 && r.height > 0.5);
    if (!rects.length) { const r = (svgText ? el : rg).getBoundingClientRect(); if (r.width > 0.5) rects.push(r); }
    if (!rects.length) continue;
    if (!svgText) fs = rects.reduce((a, r) => Math.max(a, r.height), 0) / contentRatio(cs.fontFamily, cs.fontWeight);
    for (const r of rects) grow(r);
    const lines = rects.length;
    const L = Math.min(...rects.map(r => r.left)), T = Math.min(...rects.map(r => r.top)), R = Math.max(...rects.map(r => r.right)), B = Math.max(...rects.map(r => r.bottom));
    texts.push({ t, fs, svg: svgText, lines, lefts: rects.map(r => r.left), r: [L, T, R - L, B - T], css: parseFloat(cs.fontSize) });
  }
  for (const el of cell.querySelectorAll('*')) {
    if (!visible(el)) continue;
    const tag = el.tagName.toLowerCase();
    if (tag === 'svg' && !el.parentElement.closest('svg')) { const r = el.getBoundingClientRect(); grow(r); draws.push({ tag, r: [r.left, r.top, r.width, r.height] }); continue; }
    if (el instanceof win.SVGElement) continue;
    if (tag === 'img' || tag === 'canvas') { const r = el.getBoundingClientRect(); grow(r); draws.push({ tag, r: [r.left, r.top, r.width, r.height] }); continue; }
    const cs = win.getComputedStyle(el);
    const ruled = ['Top', 'Right', 'Bottom', 'Left'].some(s => parseFloat(cs['border' + s + 'Width']) > 0 && cs['border' + s + 'Style'] !== 'none');
    const filled = cs.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor) && cs.backgroundColor !== 'rgb(255, 255, 255)';
    if (ruled || filled || cs.backgroundImage !== 'none') { const r = el.getBoundingClientRect(); if (r.width > 1 && r.height > 1) { grow(r); draws.push({ tag, r: [r.left, r.top, r.width, r.height] }); } }
  }
  if (!Number.isFinite(x0)) { const r = cell.getBoundingClientRect(); x0 = r.left; y0 = r.top; x1 = r.right; y1 = r.bottom; }
  const rel = (o) => { o.r = [o.r[0] - x0, o.r[1] - y0, o.r[2], o.r[3]].map(v => Math.round(v * 10) / 10); if (o.lefts) o.lefts = o.lefts.map(v => Math.round((v - x0) * 10) / 10); return o; };
  const smallest = texts.reduce((a, t) => Math.min(a, t.fs), Infinity);
  return { box: [x0, y0, x1 - x0, y1 - y0], texts: texts.map(rel), draws: draws.map(rel), smallest: Number.isFinite(smallest) ? smallest : 0, text: texts.map(t => t.t).join(' ') };
}

// ------------------------------------------------------------------ the sheets (one buildSheet at a time, cached)
let modP = null;
const sheetCache = new Map();
let queue = Promise.resolve();
function bridge() { return modP || (modP = import(PRINT_SHEET)); }
/** The app's own sheet for one skill at one seed: {doc (the sheet document), items}. Cached by skill, seed and count. */
export function sheetFor(key, seed, n = 0) {
  const count = countFor(n); const ck = key + '|' + sheetSeed(seed) + '|' + count;
  if (sheetCache.has(ck)) return sheetCache.get(ck);
  const p = (queue = queue.catch(() => {}).then(async () => {
    const m = await bridge();
    const r = await m.buildSheet(sheetRequest(key, seed, count));
    return { doc: m.sheetDocument(r.pupilHtml, 'Thumbnail', { base: APP_BASE }), items: (r.items || []).map(it => ({ text: String(it.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), ans: it.ans === undefined ? '' : String(it.ans) })) };
  }));
  sheetCache.set(ck, p); return p;
}

// ------------------------------------------------------------------ drawing a thumbnail
const FRAME_CSS = `html,body{margin:0!important;padding:0!important;background:#fff!important;overflow:hidden!important}
body.mq-sheet{padding:0!important;background:#fff!important}
body *{visibility:hidden!important}
[data-live-on],[data-live-on] *{visibility:visible!important}
[data-live-on] [style*="visibility: hidden"],[data-live-on] [style*="visibility:hidden"]{visibility:hidden!important}`;
const frameReady = (f) => new Promise((ok) => { let done = false; const go = () => { if (!done) { done = true; ok(); } }; f.addEventListener('load', go, { once: true }); setTimeout(go, 15000); });
async function fontsReady(doc) { for (let t = 0; t < 200 && doc.documentElement.getAttribute('data-ws-fonts') !== 'ready'; t++) await new Promise(ok => setTimeout(ok, 25)); try { await doc.fonts.ready; } catch (e) { /* */ } }

function placeMin(host) { const v = parseFloat(getComputedStyle(host).getPropertyValue('--smp-min')); return Number.isFinite(v) ? v : 11; }
function placeCap(host) { const v = parseFloat(getComputedStyle(host).getPropertyValue('--smp-cap')); return Number.isFinite(v) && v > 0 ? v : 1; }

/** Fit a drawn thumbnail to its host: anchor top-left, meet the place's minimum by cropping. Called on resize too. */
export function fitHost(host) {
  const f = host.querySelector('iframe.live-frame'); const m = host.__mq; if (!f || !m) return;
  const W = host.clientWidth, H = host.clientHeight; if (W < 4 || H < 4) return;
  const min = placeMin(host), cap = placeCap(host);
  const [bx, by, bw, bh] = m.box; const pad = 2;
  const cw = bw + 2 * pad, ch = bh + 2 * pad;
  const sFit = Math.min(W / cw, H / ch);
  let s = Math.min(sFit, cap);
  if (min > 0 && m.smallest > 0 && s * m.smallest < min) s = min / m.smallest;
  s = Math.max(s, 0.05);
  const ww = W / s, wh = H / s;
  const ox = bx - pad, oy = by - pad;
  f.style.width = Math.ceil(ww) + 'px'; f.style.height = Math.ceil(wh) + 'px';
  f.style.transform = `scale(${s})`;
  const b = f.contentDocument && f.contentDocument.body; if (b) b.style.transform = `translate(${-ox}px, ${-oy}px)`;
  const cutR = cw > ww + 1, cutB = ch > wh + 1;
  host.classList.toggle('cut-r', cutR); host.classList.toggle('cut-b', cutB);
  host.dataset.scale = String(Math.round(s * 1000) / 1000);
  host.dataset.win = [ox, oy, ww, wh].map(v => Math.round(v * 10) / 10).join(' ');
}

async function drawHost(host) {
  host.dataset.state = 'busy';
  const key = host.dataset.k, seed = host.dataset.seed || undefined, n = Number(host.dataset.n || 0);
  try {
    const sh = await sheetFor(key, seed, n);
    const f = document.createElement('iframe');
    f.className = 'live-frame'; f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.setAttribute('scrolling', 'no');
    f.style.cssText = 'position:absolute;left:0;top:0;width:900px;height:1400px;border:0;transform-origin:0 0;visibility:hidden;pointer-events:none;background:#fff';
    host.appendChild(f);
    const ready = frameReady(f);
    f.srcdoc = sh.doc.replace('</head>', `<style data-live>${FRAME_CSS}</style></head>`);
    await ready;
    const d = f.contentDocument; await fontsReady(d);
    const cells = [...d.querySelectorAll(CELL_SEL)].filter(c => c.getBoundingClientRect().width > 4);
    const cell = cells[n];
    if (!cell) { host.dataset.state = 'none'; f.remove(); host.insertAdjacentHTML('beforeend', '<span class="live-wait">No item at these settings</span>'); return; }
    cell.setAttribute('data-live-on', '');
    // the body is translated to the window: measure with the body untranslated
    const m = measureCell(cell);
    host.__mq = m; host.dataset.text = m.text.slice(0, 300);
    const it = sh.items[n]; if (it) { host.dataset.ans = it.ans.slice(0, 80); }
    fitHost(host);
    f.style.visibility = 'visible';
    const w = host.querySelector('.live-wait'); if (w) w.remove();
    host.dataset.state = 'done';
    host.dispatchEvent(new CustomEvent('mq-live-drawn', { bubbles: true }));
  } catch (e) {
    host.dataset.state = 'error'; host.dataset.err = String(e && e.message || e).slice(0, 200);
    const w = host.querySelector('.live-wait'); if (w) w.textContent = 'Could not draw this item';
  }
}

// ------------------------------------------------------------------ lazy: draw what scrolls into view
const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); if (e.target.dataset.state === 'wait') drawHost(e.target); }
}, { rootMargin: '300px 0px' }) : null;
function scan(root) {
  (root || document).querySelectorAll('.live-thumb[data-state="wait"]:not([data-io])').forEach((h) => { h.dataset.io = '1'; if (io) io.observe(h); else drawHost(h); });
}
if (typeof document !== 'undefined') {
  new MutationObserver(() => scan(document)).observe(document.documentElement, { childList: true, subtree: true });
  scan(document);
  let tm = 0; window.addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => document.querySelectorAll('.live-thumb[data-state="done"]').forEach(fitHost), 80); });
}
/** Draw every thumbnail now, visible or not (the checks and shots); resolves when none is waiting or busy. */
export async function drawAll(root) {
  (root || document).querySelectorAll('.live-thumb[data-state="wait"]').forEach((h) => { if (io) io.unobserve(h); drawHost(h); });
  return settled(root);
}
/** Resolves when no thumbnail is busy (and, with all, none is waiting). */
export async function settled(root, all = false) {
  for (let t = 0; t < 2400; t++) {
    const r = root || document;
    const busy = r.querySelectorAll('.live-thumb[data-state="busy"]' + (all ? ', .live-thumb[data-state="wait"]' : '')).length;
    if (!busy) return true; await new Promise(ok => setTimeout(ok, 50));
  }
  return false;
}
const api = { sheetFor, sheetSeed, sheetRequest, measureCell, fitHost, drawAll, settled, CARD_SEED, countFor, ready: true };
if (typeof window !== 'undefined') { window.MQLive = api; window.dispatchEvent(new Event('mq-live-ready')); }
export default api;
