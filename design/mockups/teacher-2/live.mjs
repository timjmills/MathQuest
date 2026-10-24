// Teacher site 2.0 T1 (fix round 5, critic r5 A1 / C1 / C2, stop rule §1.7): every thumbnail is drawn LIVE by the app.
//
// The thumbnail defect survived four rounds because each round COPIED the app's drawing into a mock-up format (hand
// drawings, then a sanitised DOM capture whose CSS reset blew SVG text up 2–4×). Nothing is copied now:
//   - the ITEM: the app itself prints it. A hidden frame runs the app's own index.html (unedited) and the mock-up calls
//     its window.buildSheet → generateQuestionFor (the skill's default options, seeded): a one-skill independent sheet,
//     exactly the request the teacher print screen sends;
//   - the DRAWING: the sheet's own markup, untouched, is shown in a shadow root styled by the very stylesheets the app's
//     sheetDocument() links (fetched from css/, plus the engine CSS it inlines), evaluated as that 900 px document
//     evaluates them: `@media` and rem by the sheet document itself, its html / body / :root rules on two wrappers that
//     stand for them, @font-face in the page (the same css/fonts/andika.css files);
//   - ONE boxed cell is shown: its page, body and grid are kept (so it lays out at the width it prints), its neighbours
//     are kept but hidden.
//   <div class="live-thumb" data-k="cat:skill" data-seed="" data-n="0">  → drawn when it scrolls into view, cached by
//   skill, seed and item, and re-drawn from the cache synchronously when the page re-renders (no flash).
//
// The crop (lead, 2026-10-23, critic r5 C2): the window is anchored at the LEFT and TOP of what the cell draws, never
// centred, so every line keeps its start; a place's --smp-min (Big 12 px, Medium 11, Small 9, the board 20) is met by
// CROPPING (fade on the right / bottom), never by shrinking below it. A place with --smp-min 0 (a page preview, the tray
// bar's mini picture) shows the whole cell, scaled to fit, never above print size (--smp-cap raises that cap).
//
// thumbs-check.cjs holds every drawn thumbnail to the booted app's own buildSheet (index.html), cell for cell.

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
export const countFor = (n) => Math.max(4, Math.ceil((n + 1) / 4) * 4);
/** The request a thumbnail prints: the same one the check sends to the booted app. */
export function sheetRequest(key, seed, count) {
  const [c, v] = String(key).split(':');
  return { role: 'independent', sections: [{ skills: [{ categoryId: c, skillId: v }], count }], size: 'M', seed: sheetSeed(seed), key: false };
}

// ------------------------------------------------------------------ measuring a drawn cell (shared with the check)
// What a cell DRAWS (its label, the item letter, left out: a page labels its cells, a thumbnail does not): every text run (its words, effective font size, line boxes) and every drawing (svg, img, a ruled or
// filled box), relative to the top-left of the union of what is drawn. Run on the app's sheet and on the mock-up's
// thumbnail, the two must agree; the crop reads the same numbers.
export function measureCell(cell) {
  const doc = cell.ownerDocument, win = doc.defaultView;
  const texts = [], draws = [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const grow = (r) => { if (r.width < 0.5 && r.height < 0.5) return; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); };
  const visible = (el) => { for (let e = el; e && e !== cell.parentElement; e = e.parentElement) { const cs = win.getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false; } return true; };
  const kCache = measureCell.k || (measureCell.k = {});
  const contentRatio = (family, weight, style) => {      // a font's text-box height ÷ its font size
    const k = family + '|' + weight + '|' + style; if (kCache[k]) return kCache[k];
    const s = doc.createElement('span'); s.style.cssText = `all:initial;position:absolute;left:-9999px;top:0;font-family:${family};font-weight:${weight};font-style:${style};font-size:100px;line-height:normal;white-space:nowrap`;
    s.textContent = 'Hxg8'; doc.body.appendChild(s); const rg = doc.createRange(); rg.selectNodeContents(s);
    const h = rg.getBoundingClientRect().height / 100; s.remove(); return (kCache[k] = h || 1.2);
  };
  const walker = doc.createTreeWalker(cell, win.NodeFilter.SHOW_TEXT);
  for (let nd = walker.nextNode(); nd; nd = walker.nextNode()) {
    const t = nd.nodeValue.replace(/\s+/g, ' ').trim(); if (!t) continue;
    const el = nd.parentElement; if (!el || /^(script|style|title|desc)$/i.test(el.tagName) || el.closest('[data-ws-label]') || !visible(el)) continue;
    const cs = win.getComputedStyle(el); const svgText = el instanceof win.SVGElement;
    let fs;
    if (svgText) { const m = el.getScreenCTM ? el.getScreenCTM() : null; fs = parseFloat(cs.fontSize) * (m ? Math.hypot(m.a, m.b) : 1); }
    const rg = doc.createRange(); rg.selectNodeContents(nd);
    const rects = [...rg.getClientRects()].filter(r => r.width > 0.5 && r.height > 0.5);
    if (!rects.length) { const r = (svgText ? el : rg).getBoundingClientRect(); if (r.width > 0.5) rects.push(r); }
    if (!rects.length) continue;
    if (!svgText) fs = rects.reduce((a, r) => Math.max(a, r.height), 0) / contentRatio(cs.fontFamily, cs.fontWeight, cs.fontStyle);
    for (const r of rects) grow(r);
    const L = Math.min(...rects.map(r => r.left)), T = Math.min(...rects.map(r => r.top)), R = Math.max(...rects.map(r => r.right)), B = Math.max(...rects.map(r => r.bottom));
    texts.push({ t, fs, svg: svgText, lines: rects.length, lefts: rects.map(r => r.left), r: [L, T, R - L, B - T] });
  }
  for (const el of cell.querySelectorAll('*')) {
    const tag = el.tagName.toLowerCase();
    if (el.closest('[data-ws-label]')) continue;      // the cell's label (its letter "a.") is the page's, not the item's
    if (el instanceof win.SVGElement && tag !== 'svg') continue;
    if (tag === 'svg' && el.parentElement && el.parentElement.closest('svg')) continue;
    if (!visible(el)) continue;
    if (tag === 'svg' || tag === 'img' || tag === 'canvas') { const r = el.getBoundingClientRect(); if (r.width > 0.5 || r.height > 0.5) { grow(r); draws.push({ tag, r: [r.left, r.top, r.width, r.height] }); } continue; }
    const cs = win.getComputedStyle(el);
    const ruled = ['Top', 'Right', 'Bottom', 'Left'].some(s => parseFloat(cs['border' + s + 'Width']) > 0 && cs['border' + s + 'Style'] !== 'none' && cs['border' + s + 'Style'] !== 'hidden');
    const filled = cs.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor) && cs.backgroundColor !== 'rgb(255, 255, 255)';
    if (ruled || filled || cs.backgroundImage !== 'none') { const r = el.getBoundingClientRect(); if (r.width > 1 && r.height > 1) { grow(r); draws.push({ tag, r: [r.left, r.top, r.width, r.height] }); } }
  }
  if (!Number.isFinite(x0)) { const r = cell.getBoundingClientRect(); x0 = r.left; y0 = r.top; x1 = r.right; y1 = r.bottom; }
  const q = (v) => Math.round(v * 10) / 10;
  const rel = (o) => { o.r = [q(o.r[0] - x0), q(o.r[1] - y0), q(o.r[2]), q(o.r[3])]; if (o.lefts) o.lefts = o.lefts.map(v => q(v - x0)); if (o.fs) o.fs = Math.round(o.fs * 100) / 100; return o; };
  const smallest = texts.reduce((a, t) => Math.min(a, t.fs), Infinity);
  return { box: [x0, y0, x1 - x0, y1 - y0], texts: texts.map(rel), draws: draws.map(rel), smallest: Number.isFinite(smallest) ? smallest : 0, text: texts.map(t => t.t).join(' ') };
}

// ------------------------------------------------------------------ the app's sheet stylesheets, as sheetDocument links them
let modP = null, cssP = null;
// THE APP ITSELF prints the items: buildSheet is called in a hidden frame that runs the app's own index.html (globals.js,
// init, every stylesheet), because the generators lean on what globals.js attaches to window (pickVariant,
// tagDistractor, createFactorLinksSVG …) and buildSheet MEASURES cells in its own document with the app's stylesheets
// (print-sheet.js measureItems, SCC-A6). A bare module import got both wrong (critic r5 / thumbs-check r6). Nothing of the
// app is edited; the mock-up only calls window.buildSheet / window.sheetDocument, as the teacher print screen does.
function bridge() {
  return modP || (modP = (async () => {
    const f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.title = 'The app, printing thumbnails';
    f.style.cssText = 'position:fixed;left:-20000px;top:0;width:1366px;height:900px;border:0;visibility:hidden;pointer-events:none';
    f.src = new URL('index.html', APP_BASE).href;
    document.body.appendChild(f);
    let w = null;
    for (let t = 0; t < 1200; t++) { try { w = f.contentWindow; if (w && typeof w.buildSheet === 'function' && typeof w.sheetDocument === 'function') break; } catch (e) { /* */ } await new Promise(ok => setTimeout(ok, 50)); }
    if (!w || typeof w.buildSheet !== 'function') throw new Error('the app did not start in its frame');
    try { await Promise.all([w.document.fonts.load('400 16px Andika'), w.document.fonts.load('700 16px Andika')]); await w.document.fonts.ready; } catch (e) { /* */ }
    return { buildSheet: (r) => w.buildSheet(r), sheetDocument: (h, t, o) => w.sheetDocument(h, t, o) };
  })());
}
const nextFrame = () => new Promise(ok => requestAnimationFrame(() => ok()));
// rem is the ROOT's font size: in the sheet document that is the sheet's own root, in a shadow root it would be the
// mock-up page's. Every rem the sheet's CSS or inline styles use is read against the sheet document's root instead.
const remToVar = (t) => String(t).replace(/(-?\d*\.?\d+)rem\b/g, 'calc($1 * var(--mq-rem, 16px))');
const remInStyles = (html) => html.replace(/style="([^"]*)"/g, (m, st) => `style="${remToVar(st)}"`);
async function mediaFrame(docHtml) {      // the 900 px sheet document itself, so @media and rem are evaluated as there
  const f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1;
  f.style.cssText = 'position:fixed;left:-10000px;top:0;width:900px;height:1400px;border:0;visibility:hidden;pointer-events:none';
  document.body.appendChild(f);
  await new Promise((ok) => { f.addEventListener('load', ok, { once: true }); f.srcdoc = docHtml; setTimeout(ok, 5000); });
  return f.contentWindow;
}
const SEL_ROOT = /(^|[\s,>+~(])(?::root|html)(?![\w-])/g, SEL_BODY = /(^|[\s,>+~(])body(?![\w-])/g;
const rewriteSel = (sel) => sel.replace(SEL_ROOT, '$1.mq-html').replace(SEL_BODY, '$1.mq-body');
function flatten(rules, win, out, faces, base) {
  for (const r of rules) {
    if (r instanceof CSSImportRule) continue;
    if (r instanceof CSSFontFaceRule) { faces.push(r.cssText.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/g, (m, q, u) => `url("${new URL(u, base).href}")`)); continue; }
    if (r instanceof CSSMediaRule) { if (win.matchMedia(r.media.mediaText).matches) flatten(r.cssRules, win, out, faces, base); continue; }
    if (typeof CSSSupportsRule !== 'undefined' && r instanceof CSSSupportsRule) { if (CSS.supports(r.conditionText)) flatten(r.cssRules, win, out, faces, base); continue; }
    if (r instanceof CSSStyleRule) { const s = r.selectorText; out.push(rewriteSel(s) + r.cssText.slice(s.length)); continue; }
    if (typeof CSSPageRule !== 'undefined' && r instanceof CSSPageRule) continue;
    out.push(r.cssText);
  }
}
async function sheetOf(text, base, win, faces) {
  const raw = new CSSStyleSheet({ baseURL: base }); raw.replaceSync(remToVar(text));      // a constructed sheet drops @import itself (a regex here once ate a comment's "@import" and the rules after it)
  const out = []; flatten(raw.cssRules, win, out, faces, base);
  const sh = new CSSStyleSheet({ baseURL: base }); sh.replaceSync(out.join('\n')); return sh;
}
// the shadow root's own rules: the html wrapper starts from initial values (nothing of the mock-up's page is inherited),
// the body wrapper drops the screen tray (grey, padding), the chain around the cell paints nothing, neighbours are hidden
const FRAME_CSS = `:host{all:initial;display:block!important;position:relative}
.mq-html{all:initial;display:block;color:#000;background:#fff}
.mq-body.mq-sheet{padding:0!important;margin:0!important;background:#fff!important;width:900px;min-height:0!important}
.mq-zoom{position:absolute;left:0;top:0;transform-origin:0 0}
.mq-chain{background:transparent!important;outline:0!important;box-shadow:none!important;border-color:transparent!important}
.mq-chain::before,.mq-chain::after{visibility:hidden!important}
[data-live-off],[data-live-off] *,.ws-tabbox,.ws-tabbox *,[data-ws-label="tab"],[data-ws-label="tab"] *{visibility:hidden!important}
:host(.no-label) [data-live-on] [data-ws-label]{visibility:hidden!important}
[data-live-on]{border-color:transparent!important;outline:0!important;box-shadow:none!important;background:transparent!important}`;
function appCss() {
  return cssP || (cssP = (async () => {
    const m = await bridge();
    const docHtml = m.sheetDocument('', 'x', { base: APP_BASE });
    const doc = new DOMParser().parseFromString(docHtml, 'text/html');
    const win = await mediaFrame(docHtml);
    const rootPx = win.getComputedStyle(win.document.documentElement).fontSize || '16px';
    const faces = [], sheets = [];
    for (const el of doc.head.querySelectorAll('link[rel="stylesheet"], style')) {
      if (el.tagName === 'LINK') { const href = new URL(el.getAttribute('href'), APP_BASE).href; const tx = await (await fetch(href)).text(); sheets.push(await sheetOf(tx, href, win, faces)); }
      else sheets.push(await sheetOf(el.textContent, APP_BASE, win, faces));
    }
    const frame = new CSSStyleSheet(); frame.replaceSync(FRAME_CSS + `\n.mq-html{--mq-rem:${rootPx}}`);
    if (faces.length && !document.getElementById('mq-live-faces')) { const st = document.createElement('style'); st.id = 'mq-live-faces'; st.textContent = faces.join('\n'); document.head.appendChild(st); }
    // the sheet's faces must be in before a cell is measured (a cell measured in a fallback face would crop wrongly)
    try { await Promise.all([document.fonts.load('400 16px Andika'), document.fonts.load('700 16px Andika')]); await document.fonts.ready; } catch (e) { /* */ }
    return { sheets, frame, win, htmlClass: doc.documentElement.className || '' };
  })());
}

// ------------------------------------------------------------------ the sheets (one buildSheet at a time, cached)
const sheetCache = new Map();
let queue = Promise.resolve();
/** The app's own sheet for one skill at one seed: {html (the pupil page), items}. Cached by skill, seed and count. */
export function sheetFor(key, seed, n = 0) {
  const count = countFor(n); const ck = key + '|' + sheetSeed(seed) + '|' + count;
  if (sheetCache.has(ck)) return sheetCache.get(ck);
  const p = (queue = queue.catch(() => {}).then(async () => {
    const m = await bridge();
    const r = await m.buildSheet(sheetRequest(key, seed, count));
    return { html: r.pupilHtml, items: (r.items || []).map(it => ({ text: String(it.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), ans: it.ans === undefined ? '' : String(it.ans) })) };
  }));
  sheetCache.set(ck, p); return p;
}

// ------------------------------------------------------------------ one cell, kept in its page, body and grid
const cellCache = new Map();     // key|seed|n → {html, css (the sheet's own <style>s), m (measures at 1×), ans}
async function cellFor(key, seed, n) {
  const ck = key + '|' + sheetSeed(seed) + '|' + n;
  if (cellCache.has(ck)) return cellCache.get(ck);
  const p = (async () => {
    const [sh, css] = await Promise.all([sheetFor(key, seed, n), appCss()]);
    // the sheet as printed, on a staging host, to find the n-th DRAWN cell exactly as the sheet document does
    const stage = document.createElement('div'); stage.style.cssText = 'position:fixed;left:-20000px;top:0;width:900px;height:1400px;overflow:hidden;visibility:hidden;pointer-events:none';
    document.body.appendChild(stage);
    const sr = stage.attachShadow({ mode: 'open' });
    const tpl = document.createElement('template'); tpl.innerHTML = remInStyles(sh.html);
    const own = [];
    for (const st of tpl.content.querySelectorAll('style')) { own.push(await sheetOf(st.textContent, APP_BASE, css.win, [])); st.remove(); }
    sr.adoptedStyleSheets = [css.frame, ...css.sheets, ...own];
    sr.innerHTML = `<div class="mq-html ${css.htmlClass}"><div class="mq-body mq-sheet"></div></div>`;
    sr.querySelector('.mq-body').appendChild(tpl.content);
    const cells = [...sr.querySelectorAll(CELL_SEL)].filter(c => c.getBoundingClientRect().width > 4);
    const cell = cells[n];
    let out = null;
    if (cell) {
      // keep the cell's whole printed page, so it lays out exactly as printed: every branch off the chain page → … → cell
      // is hidden (visibility: it keeps its space), the chain itself paints nothing, the cell is shown
      const chain = []; for (let a = cell.parentElement; a && !a.classList.contains('mq-body'); a = a.parentElement) chain.push(a);
      const off = [];
      for (const a of [cell, ...chain].slice(0, -1)) for (const ch of a.parentElement.children) if (ch !== a) { ch.setAttribute('data-live-off', ''); off.push(ch); }
      cell.setAttribute('data-live-on', ''); chain.forEach(a => a.classList.add('mq-chain'));
      const node = chain[chain.length - 1].cloneNode(true);
      cell.removeAttribute('data-live-on'); chain.forEach(a => a.classList.remove('mq-chain')); off.forEach(e => e.removeAttribute('data-live-off'));
      out = { html: node.outerHTML, own, ans: (sh.items[n] || {}).ans || '' };
    }
    stage.remove();
    return out;
  })();
  cellCache.set(ck, p); return p;
}

function placeVar(host, name, dflt) { const v = parseFloat(getComputedStyle(host).getPropertyValue(name)); return Number.isFinite(v) ? v : dflt; }
/** Fit a drawn thumbnail to its host (fix round 6, critic r6 A1): scale the whole item to fit, but never below the place's
 *  minimum (prose >= --smp-min, an SVG's own labels >= --smp-min-draw); if it still does not fit, place the window over
 *  the DRAWING (the most drawn area shown, a line's start never cut when it can be kept), not the cell's top-left. */
export function fitHost(host) {
  const m = host.__mq, z = host.shadowRoot && host.shadowRoot.querySelector('.mq-zoom'); if (!m || !z) return;
  const W = host.clientWidth, H = host.clientHeight; if (W < 4 || H < 4) return;
  const min = placeVar(host, '--smp-min', 11), cap = placeVar(host, '--smp-cap', 1) || 1, minD = placeVar(host, '--smp-min-draw', 0);
  host.classList.toggle('no-label', min > 0);       // a card shows the item; a page preview shows the cell as printed
  const pad = 2; const [bx, by, bw, bh] = m.boxIn; const cw = bw + 2 * pad, ch = bh + 2 * pad;
  let s = Math.min(Math.min(W / cw, H / ch), cap);
  if (min > 0) {
    const prose = m.texts.filter(t => !t.svg).reduce((a, t) => Math.min(a, t.fs), Infinity);
    const drawn = m.texts.filter(t => t.svg).reduce((a, t) => Math.min(a, t.fs), Infinity);
    if (Number.isFinite(prose) && s * prose < min) s = min / prose;
    if (Number.isFinite(drawn) && minD > 0 && s * drawn < minD) s = Math.max(s, minD / drawn);
  }
  s = Math.max(s, 0.05);
  const ww = W / s, wh = H / s;
  // the window, in box coordinates (0,0 = the drawn content's top-left)
  let wx = -pad, wy = -pad;
  if (cw > ww + 1 || ch > wh + 1) {
    const dr = m.draws.filter((a, i) => !m.draws.some((b, j) => j !== i && b.r[0] <= a.r[0] + 0.5 && b.r[1] <= a.r[1] + 0.5 && b.r[0] + b.r[2] >= a.r[0] + a.r[2] - 0.5 && b.r[1] + b.r[3] >= a.r[1] + a.r[3] - 0.5 && (b.r[2] * b.r[3] > a.r[2] * a.r[3] || j < i)));
    const xs = new Set([-pad]), ys = new Set([-pad]);
    const clampX = (v) => Math.max(-pad, Math.min(v, bw + pad - ww)), clampY = (v) => Math.max(-pad, Math.min(v, bh + pad - wh));
    for (const d of [...dr, ...m.texts]) { xs.add(clampX(d.r[0] - pad)); xs.add(clampX(d.r[0] + d.r[2] + pad - ww)); ys.add(clampY(d.r[1] - pad)); ys.add(clampY(d.r[1] + d.r[3] + pad - wh)); }
    const ov = (r, x, y) => Math.max(0, Math.min(r[0] + r[2], x + ww) - Math.max(r[0], x)) * Math.max(0, Math.min(r[1] + r[3], y + wh) - Math.max(r[1], y));
    const dAll = dr.reduce((a, d) => a + d.r[2] * d.r[3], 0);
    const cand = [];
    for (const x of xs) for (const y of ys) {
      let dIn = 0; for (const d of dr) dIn += ov(d.r, x, y);
      let ink = 0; for (const d of dr) if (d.tag !== 'svg') ink += ov(d.r, x, y);
      for (const r of (m.prims || [])) ink += 4 * ov(r, x, y);
      let sc = ink, cut = false;
      m.texts.forEach((t, i) => {
        // a line on the window's rows that starts left of it is cut at its start, even when the window has skipped it whole
        if (t.r[1] < y + wh && t.r[1] + t.r[3] > y && t.lefts.some(L => L < x - 0.5 && L + 1 < x + ww)) { sc -= 2 * t.r[2] * t.r[3] + 400; cut = true; }
        const a = ov(t.r, x, y); if (!a) return;
        if (t.r[1] < y - 0.5 || t.r[1] + t.r[3] > y + wh + 0.5) { sc -= 1.5 * a; return; }   // a line sliced through its height
        sc += (i === 0 ? 1 : 0.6) * a;                                       // words tell items apart; the first line most
      });
      cand.push({ x, y, dIn, ink, cut, sc: sc - 0.01 * (x + y) });                     // ties: nearer the top-left
    }
    // the drawing first: only windows that show 60 % of it (or, where none can, near the most any can) compete on words
    // a line's start outranks the drawing (lead, r5 C2): windows that cut one compete only when every window does
    let pool = cand.some(c => !c.cut) ? cand.filter(c => !c.cut) : cand;
    // where no window can show 60 % of the drawing, the item's own first line (its problem) stays in view, so two items
    // that share a big empty work box never look alike (thumbs-check: no two different items share one picture)
    const t0 = m.texts[0];
    const first = (c) => t0 && t0.r[0] >= c.x - 0.5 && t0.r[1] >= c.y - 0.5 && t0.r[1] + t0.r[3] <= c.y + wh + 0.5 && t0.r[0] < c.x + ww;
    { const pm = Math.max(0, ...pool.map(c => c.ink)), fm = Math.max(0, ...pool.filter(first).map(c => c.ink));
      const big = dr.reduce((a, d) => (!a || d.r[2] * d.r[3] > a.r[2] * a.r[3] ? d : a), null);   // a work box, not a picture
      if (Math.max(0, ...pool.map(c => c.dIn)) < 0.61 * dAll && (fm >= 0.5 * pm || (fm >= 0.35 * pm && big && !/^(svg|img|canvas)$/.test(big.tag)))) pool = pool.filter(first); }
    const dMax = Math.max(0, ...pool.map(c => c.dIn)); const need = Math.min(0.61 * dAll, 0.98 * dMax);
    let best = -Infinity; for (const c of pool) if (c.dIn >= need - 0.5 && c.sc > best) { best = c.sc; wx = c.x; wy = c.y; }
    host.dataset.reach = dAll > 0 ? String(Math.round(dMax / dAll * 1000) / 1000) : '1';   // the most drawing any window can show at this scale
  } else host.dataset.reach = '1';
  z.style.transform = `scale(${s}) translate(${-(bx + wx)}px, ${-(by + wy)}px)`;
  host.classList.toggle('cut-r', bw + pad > wx + ww + 1); host.classList.toggle('cut-b', bh + pad > wy + wh + 1);
  host.classList.toggle('cut-l', wx > 0); host.classList.toggle('cut-t', wy > 0);
  host.dataset.scale = String(Math.round(s * 10000) / 10000);
  host.dataset.win = [wx, wy, ww, wh].map(v => Math.round(v * 10) / 10).join(' ');
}
/** Measure what a drawn thumbnail shows at 1× (the transform lifted for the measure). */
export function measureHost(host) {
  const z = host.shadowRoot && host.shadowRoot.querySelector('.mq-zoom'); const cell = z && z.querySelector('[data-live-on]'); if (!cell) return null;
  // measured at 1×: the thumbnail's own scale and any scale around it (a page preview is a miniature) are lifted for the
  // measure, so a hairline or a small label is read at its real size, then put back before the next paint
  const lifted = [];
  for (let e = host.parentElement; e && e !== document.documentElement; e = e.parentElement) { const tf = getComputedStyle(e).transform; if (tf && tf !== 'none') { lifted.push([e, e.style.transform]); e.style.transform = 'none'; } }
  const t = z.style.transform; z.style.transform = 'none';
  const zr = z.getBoundingClientRect(); const k = z.offsetWidth ? zr.width / z.offsetWidth : 1;   // an outer scale (a preview page)
  const m = measureCell(cell);
  // the INK of each SVG (its lines, shapes and labels, not its box), so the window looks for what is drawn (fix round 6)
  m.prims = [];
  for (const sv of cell.querySelectorAll('svg')) for (const el of sv.querySelectorAll('line,path,rect,circle,ellipse,polygon,polyline,text')) {
    const r = el.getBoundingClientRect(); if (r.width < 0.1 && r.height < 0.1) continue;
    m.prims.push([r.left - m.box[0], r.top - m.box[1], Math.max(r.width, 2), Math.max(r.height, 2)]);
  }
  if (Math.abs(k - 1) > 0.001) {
    const d = (v) => Math.round(v / k * 10) / 10;
    for (const o of m.texts) { o.fs = Math.round(o.fs / k * 100) / 100; o.r = o.r.map(d); o.lefts = o.lefts.map(d); }
    for (const o of m.draws) o.r = o.r.map(d);
    m.smallest = m.smallest / k; m.box = [m.box[0], m.box[1], m.box[2] / k, m.box[3] / k];
  }
  m.boxIn = [(m.box[0] - zr.left) / k, (m.box[1] - zr.top) / k, m.box[2], m.box[3]];
  m.outer = k;
  z.style.transform = t; for (const [e, tf] of lifted) e.style.transform = tf; return m;
}

function fill(host, c) {
  const sr = host.shadowRoot || host.attachShadow({ mode: 'open' });
  sr.adoptedStyleSheets = [host.__css.frame, ...host.__css.sheets, ...c.own];
  sr.innerHTML = `<div class="mq-html ${host.__css.htmlClass}"><div class="mq-zoom"><div class="mq-body mq-sheet">${c.html}</div></div></div>`;
  if (!c.m) c.m = measureHost(host);
  host.__mq = c.m; host.dataset.text = c.m.text.slice(0, 300); if (c.ans) host.dataset.ans = c.ans.slice(0, 80);
  fitHost(host);
  host.dataset.state = 'done';
}
const ready = new Map();          // key|seed|n → resolved cell (for a synchronous redraw after a re-render)
let cssNow = null;
async function drawHost(host) {
  host.dataset.state = 'busy';
  const key = host.dataset.k, seed = host.dataset.seed || undefined, n = Number(host.dataset.n || 0);
  try {
    const c = await cellFor(key, seed, n);
    host.__css = cssNow = await appCss();
    if (!c) { host.dataset.state = 'none'; const w = host.querySelector('.live-wait'); if (w) w.textContent = 'No item at these settings'; return; }
    ready.set(key + '|' + sheetSeed(seed) + '|' + n, c);
    if (!host.isConnected) { host.dataset.state = 'wait'; return; }
    fill(host, c);
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
  (root || document).querySelectorAll('.live-thumb[data-state="wait"]:not([data-io])').forEach((h) => {
    h.dataset.io = '1';
    const c = cssNow && ready.get(h.dataset.k + '|' + sheetSeed(h.dataset.seed || undefined) + '|' + Number(h.dataset.n || 0));
    if (c) { h.__css = cssNow; fill(h, c); return; }          // drawn before: redraw now, before the next paint
    if (io) io.observe(h); else drawHost(h);
  });
}
if (typeof document !== 'undefined') {
  new MutationObserver(() => scan(document)).observe(document.documentElement, { childList: true, subtree: true });
  scan(document);
  let tm = 0; window.addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => document.querySelectorAll('.live-thumb[data-state="done"]').forEach(fitHost), 80); });
}
/** Draw every thumbnail now, visible or not (the checks and shots); resolves when none is waiting or busy. */
export async function drawAll(root) {
  scan(root || document);
  (root || document).querySelectorAll('.live-thumb[data-state="wait"]').forEach((h) => { if (io) io.unobserve(h); drawHost(h); });
  return settled(root, true);
}
/** Resolves when no thumbnail is busy (and, with all, none is waiting). */
export async function settled(root, all = false) {
  for (let t = 0; t < 4800; t++) {
    const r = root || document;
    const busy = r.querySelectorAll('.live-thumb[data-state="busy"]' + (all ? ', .live-thumb[data-state="wait"]' : '')).length;
    if (!busy) { await nextFrame(); return true; }
    await new Promise(ok => setTimeout(ok, 50));
  }
  return false;
}
const api = { sheetFor, sheetSeed, sheetRequest, measureCell, measureHost, fitHost, drawAll, settled, CARD_SEED, countFor, ready: true };
if (typeof window !== 'undefined') { window.MQLive = api; window.dispatchEvent(new Event('mq-live-ready')); }
export default api;
