// Teacher site 2.0 T1: a skill's thumbnail. Fix round 5 (critic r5 A1 / C1 / C2, stop rule §1.7): nothing is copied.
// A thumbnail is a placeholder the live renderer (live.mjs) fills with the APP's own drawing: the app's buildSheet prints
// the skill's sheet at the thumbnail's seed and the cell is shown in the app's own sheet document, cropped from its
// left / top so the place's minimum text size holds (Big 12, Medium 11, Small 9, the board 20; previews and the tray bar
// show the whole cell). Drawn when it scrolls into view, cached by skill and seed. thumbs-check.cjs holds every drawn
// thumbnail to the booted app's own sheet.
//   MQThumbs.draw(skill, seed)          a card's item (no seed: the card seed) or New numbers' item (a seed token)
//   MQThumbs.drawItem(skill, n, seed)   the n-th item of the sheet printed at that seed (a page deals 0, 1, 2 …)
//   MQThumbs.fit(root)                  re-crop drawn thumbnails (after a layout change)
(function (root) {
  const escA = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  // opened from file:// (or the renderer failed to load): the app cannot run here, so the box says where it can
  const off = () => typeof document !== 'undefined' && document.documentElement.getAttribute('data-live') === 'off';
  function host(s, seed, n) {
    const k = s.c + ':' + s.v; const sd = seed === undefined || seed === null || seed === 1 ? '' : String(seed);
    return `<div class="live-thumb" data-k="${escA(k)}" data-seed="${escA(sd)}" data-n="${n}" data-state="wait" role="img" aria-label="${escA(s.l)}: an item drawn by the app"><span class="live-wait">${off() ? 'Live preview in the served page' : 'Drawing…'}</span></div>`;
  }
  function draw(s, seed) { return host(s, seed, 0); }
  function drawItem(s, n, seed) { return host(s, seed, n || 0); }
  function fit(r) { if (typeof document === 'undefined' || !root.MQLive) return; (r || document).querySelectorAll('.live-thumb[data-state="done"]').forEach(root.MQLive.fitHost); }
  // the live renderer is an ES module (it imports the app's modules); a served page loads it once
  if (typeof document !== 'undefined' && !document.querySelector('script[data-mq-live]')) {
    const src = (document.currentScript && document.currentScript.src) ? new URL('live.mjs', document.currentScript.src).href : 'live.mjs';
    const sc = document.createElement('script'); sc.type = 'module'; sc.src = src; sc.dataset.mqLive = '1';
    sc.onerror = () => { document.documentElement.setAttribute('data-live', 'off'); document.querySelectorAll('.live-wait').forEach(w => { w.textContent = 'Live preview in the served page'; }); };
    (document.head || document.documentElement).appendChild(sc);
    if (location.protocol === 'file:') document.documentElement.setAttribute('data-live', 'off');
  }
  // a seeded random (the mixed page's deal order)
  function rng(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
  root.MQThumbs = { draw, drawItem, fit, rng };
})(typeof window !== 'undefined' ? window : globalThis);
