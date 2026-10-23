// Teacher site 2.0 T1: every live skill's thumbnail must BE that skill. A machine check, not a look:
//   node design/mockups/teacher-2/thumbs-check.cjs          exit 1 on any failure
//
// Fix round 4 (critic r4 C1; stop rule §1.7, the defect class survived r2 #6, r3 C1 and r4 C1). The root cause was that
// thumbs.js hand-drew stand-ins guessed from the id and label. Now every thumbnail is a real item: capture-samples.cjs
// prints a seeded sheet of each skill through the real app (buildSheet → generateQuestionFor) and stores its first cells
// in samples.js. This check holds:
//   1. coverage   every live skill has captured samples, or is a LISTED fallback (its generation threw); the list here
//                 must equal samples.js's own `fail` list, so a new failure, or a stale entry, fails;
//   2. provenance every thumbnail T.draw(skill, seed) returns, for 8 seeds, is the captured sample of THAT skill: its
//                 data-smp is the skill's key, its data-h is hash(key:captureSeed:item) of the item the seed picks, and
//                 its markup is that sample's markup, byte for byte;
//   3. the critic's named contradictions (r4 C1, 35 skills) are spot-tested by CONTENT: what the captured item shows;
//   4. in a browser (thumbs.html, every skill, 3 seeds): each card's picture carries its own card's skill, nothing written
//      falls outside the thumbnail's picture, and the hand-drawn fallbacks keep their old bounds and overlap rules;
//      app.html's Skills cards and tray thumbnails carry their own skill too;
//   5. the size budget: samples.js under 6 MB.
'use strict';
const fs = require('fs');
const path = require('path');
global.window = global;
require(path.join(__dirname, 'data.js'));
const SAMPLES_FILE = path.join(__dirname, 'samples.js');
if (fs.existsSync(SAMPLES_FILE)) require(SAMPLES_FILE);
require(path.join(__dirname, 'thumbs.js'));
const D = window.MQ_DATA, T = window.MQThumbs, S = window.MQ_SAMPLES;
const fails = [];
const say = (k, why) => fails.push(`${k}: ${why}`);

// skills whose real generation throws or deals no cell keep the hand drawing; each is listed here by name (none today)
const LISTED_FALLBACKS = {};

function hash(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
const SEEDS = [undefined, 1, 2, 3, 'a', 'b', 'ex7', '42:0:3'];
let nSamples = 0, nDraws = 0;

// ---- 1 + 2: coverage and provenance
if (!S || !S.s) say('samples.js', 'missing: run node capture-samples.cjs');
else {
  if (typeof T.sample !== 'function' || typeof T.sampleIndex !== 'function') say('thumbs.js', 'has no sample(): thumbnails are not drawn from the captured items');
  const failed = Object.keys(S.fail || {}).sort(), listed = Object.keys(LISTED_FALLBACKS).sort();
  for (const k of failed) if (!LISTED_FALLBACKS[k]) say(k, `generation failed in the capture (${S.fail[k]}) and the skill is not a listed fallback`);
  for (const k of listed) if (!failed.includes(k)) say(k, 'listed as a fallback, but samples.js has its items now: take it off the list');
  for (const s of D.skills) {
    const key = s.c + ':' + s.v, list = S.s[key];
    if (!list || !list.length) { if (!LISTED_FALLBACKS[key]) say(key, 'no captured sample'); continue; }
    nSamples += list.length;
    list.forEach((it, j) => {
      if (it.h !== hash(`${key}:${S.seed}:${j}`)) say(key, `sample ${j} hash ${it.h} is not hash(${key}:${S.seed}:${j})`);
      if (!it.x || !/<(svg|div|span)/.test(it.x)) say(key, `sample ${j} has no markup`);
      if (!(it.v || '').trim() && !/<svg/.test(it.x)) say(key, `sample ${j} shows nothing (no text, no drawing)`);
      if (/<script|\son[a-z]+=|javascript:/i.test(it.x)) say(key, `sample ${j} is not sanitised (script or handler)`);
      if (/\b(?:id|for)="(?!q[0-9a-z]+-\d+-)/.test(it.x)) say(key, `sample ${j} keeps an app id`);
    });
    for (const seed of SEEDS) {
      if (typeof T.sample !== 'function') break;
      nDraws++;
      const out = T.draw(s, seed); const j = T.sampleIndex(seed, list.length); const it = list[j];
      const m = out.match(/^<svg class="smp-svg" data-smp="([^"]+)" data-h="([^"]+)" data-i="(\d+)"/);
      if (!m) { say(key, `seed ${seed}: the thumbnail is not a captured sample (${out.slice(0, 60)})`); continue; }
      if (m[1].replace(/&amp;/g, '&') !== key) say(key, `seed ${seed}: draws the sample of ${m[1]}`);
      if (Number(m[3]) !== j || m[2] !== it.h) say(key, `seed ${seed}: shows item ${m[3]} (${m[2]}), the seed picks item ${j} (${it.h})`);
      if (!out.includes(it.x)) say(key, `seed ${seed}: the markup is not the captured item's markup`);
    }
  }
}

// ---- 3: the critic's r4 C1 list, by content. v = what the item shows as text (the cell's innerText), x = its markup
const byKey = Object.fromEntries(D.skills.map(s => [s.c + ':' + s.v, s]));
const shown = (k) => (S && S.s && S.s[k] || []).map(it => ({ v: String(it.v || ''), x: String(it.x || ''), t: String(it.t || ''), a: String(it.a || '') }));
const nums = (str) => (String(str).replace(/(\d),(?=\d{3})/g, '$1').match(/\d+(?:\.\d+)?/g) || []).map(Number);
const SPOT = [];
const spot = (keys, rule, why) => { for (const k of keys) SPOT.push([k, rule, why]); };
// unlike denominators: the item's fractions have two different denominators
spot(['add_frac_unlike', 'sub_frac_unlike', 'add_mixed_unlike', 'sub_mixed_unlike', 'add_frac_unlike_nv', 'sub_frac_unlike_nv', 'add_mixed_unlike_nv', 'sub_mixed_unlike_nv'].map(v => 'fraction_operations:' + v),
  (it) => { const d = dens(it); return d.length >= 2 && new Set(d).size >= 2; }, 'two different denominators');
// rounding sorts: the two bins say "rounds to X" and "rounds to Y", one place apart (500 and 600 for the nearest 100,
// 0.4 and 0.5 for the nearest tenth), and the numbers to sort lie between them
const PLACE = { '100': 100, '1000': 1000, '10000': 10000, '100000': 100000, million: 1000000, tenths: 0.1, hundredths: 0.01 };
for (const [suf, size] of Object.entries(PLACE)) {
  spot(['number_sense:round_sort_' + suf], (it) => { const m = [...it.v.replace(/(\d),(?=\d{3})/g, '$1').matchAll(/rounds to (\d+(?:\.\d+)?)/g)].map(x => Number(x[1])); return m.length >= 2 && Math.abs(Math.abs(m[1] - m[0]) - size) < size / 1000 && m.every(x => Math.abs(x / size - Math.round(x / size)) < 1e-6); },
    `a nearest-${suf} sort (bins one ${size} apart)`);
}
for (const [id, size] of [['nearest_10', 10], ['nearest_100', 100], ['nearest_1000', 1000], ['nearest_10000', 10000], ['nearest_100000', 100000], ['nearest_million', 1000000]]) {
  spot(['number_sense:' + id], (it) => nums(it.v + ' ' + it.t).some(n => n > size) && !(size > 10 && /nearest 10\b/i.test(it.v)), `rounding to the nearest ${size} (a number past ${size}, never "nearest 10")`);
}
spot(['decimals:round_to_tenth'], (it) => /\d\.\d{2}/.test(it.v + ' ' + it.t), 'a number with hundredths, to round to the tenth');
spot(['decimals:round_to_hundredth'], (it) => /\d\.\d{3}/.test(it.v + ' ' + it.t), 'a number with thousandths, to round to the hundredth');
spot(['number_sense:estimate_products'], (it) => /×|x\s*\d/.test(it.v), 'an estimate with ×');
spot(['number_sense:estimate_quotient', 'number_sense:reasonable_quotients'], (it) => /÷|\)|divid|quotient/i.test(it.v), 'a quotient (÷ or a division)');
spot(['number_sense:estimate_diff'], (it) => /[−–-]/.test(it.v), 'an estimate with −');
spot(['data_analysis:mode'], (it) => { const n = nums(it.v.split(/count each/i)[0]); return n.length > 2 && new Set(n).size < n.length; }, 'a list with a repeated value');
spot(['angles_lines:angles_around_point'], (it) => /360/.test(it.v), 'a full turn (360°)');
spot(['angles_lines:angles_in_right_angle'], (it) => /90/.test(it.v), 'a right angle (90°)');
spot(['multiplication:area_model_mult_hard'], (it) => { const m = it.v.match(/(\d+)\s*[×x]\s*(\d+)/); return !!m && +m[1] >= 10 && +m[2] >= 10; }, 'a 2-digit by 2- or 3-digit area model');
spot(['multiplication:equal_or_unequal_groups'], (it) => /equal|groups?/i.test(it.v), 'an equal / not equal groups question');
spot(['multiplication:nl_mult'], (it) => /<svg/.test(it.x) && /jump|×|groups? of|number line/i.test(it.v + ' ' + it.t), 'a multiplication number line');
// denominators of an item: the cell's own text lists a stacked fraction as "n d" and a mixed number as "w n d"; read the
// pairs around + / − (a mixed number's whole is the lone number before its fraction)
function dens(it) {
  const t = it.v.replace(/\s+/g, ' ');
  const side = t.split(/=|Answer/)[0];
  const parts = side.split(/[+−–-]/).map(p => nums(p.replace(/\?/g, ' 0 '))).filter(p => p.length >= 2);
  const fromStack = parts.map(p => p[p.length - 1]);
  const slash = [...t.matchAll(/(\d+)\s*\/\s*(\d+)/g)].map(m => +m[2]);
  return fromStack.length >= 2 ? fromStack : slash;
}
let spotN = 0;
for (const [k, rule, why] of SPOT) {
  if (!byKey[k]) { say(k, 'is named by the spot test but is not a live skill'); continue; }
  const items = shown(k); spotN++;
  if (!items.length) { say(k, `spot test: no captured item (wants ${why})`); continue; }
  if (!rule(items[0])) say(k, `spot test: the first item does not show ${why} — it shows “${items[0].v.slice(0, 90)}”`);
  const bad = items.filter(it => !rule(it)).length; if (bad > 1) say(k, `spot test: ${bad} of ${items.length} items do not show ${why}`);
}

// ---- 4: in a browser
(async () => {
  let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
  const { startServer } = require('../../../tests/lib/ws-harness.cjs');
  const { server, base } = await startServer();
  const browser = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  let geo = [], app = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    await page.goto(`${base}/design/mockups/teacher-2/thumbs.html`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    geo = await page.evaluate(() => {
      const out = [];
      // every card on the page draws its own skill
      for (const c of document.querySelectorAll('.thumb-card[data-key]')) {
        const svg = c.querySelector('.thumb > svg'); const k = c.getAttribute('data-key');
        if (!svg) { out.push(`${k}: thumbs.html card has no picture`); continue; }
        if (svg.getAttribute('data-smp') !== k && !svg.hasAttribute('data-fallback')) out.push(`${k}: thumbs.html card shows ${svg.getAttribute('data-smp')}`);
      }
      const host = document.createElement('div'); host.className = 'thumb'; host.style.cssText = 'position:absolute;left:0;top:0;width:300px;height:200px'; document.body.appendChild(host);
      for (const s of MQ_DATA.skills) for (const seed of [undefined, 2, 'b']) {
        host.innerHTML = MQThumbs.draw(s, seed); const svg = host.querySelector('svg'); if (!svg) { out.push(`${s.c}:${s.v}: no picture`); continue; }
        const R = svg.getBoundingClientRect(); const probs = [];
        if (svg.classList.contains('smp-svg')) {
          // the crop keeps every written word and number inside the picture (a sample is never cut off)
          const fo = svg.querySelector('foreignObject'); const tw = document.createTreeWalker(fo, NodeFilter.SHOW_TEXT);
          for (let n = tw.nextNode(); n; n = tw.nextNode()) {
            if (!n.nodeValue.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n);
            for (const b of rg.getClientRects()) { if (b.width < 0.5) continue; const tol = 1.5;
              // the item letter (a., b.) sits outside the crop on purpose
              if (/^[a-z]\.$/.test(n.nodeValue.trim())) continue;
              if (b.left < R.left - tol || b.right > R.right + tol || b.top < R.top - tol || b.bottom > R.bottom + tol) { probs.push(`“${n.nodeValue.trim().slice(0, 16)}” outside the picture`); break; } }
            if (probs.length) break;
          }
          if (fo.getBoundingClientRect().width < 4) probs.push('the sample did not render');
        } else {
          const leaves = [...svg.querySelectorAll('text, rect, circle, ellipse, line, path, polygon, polyline')];
          for (const el of leaves) {
            const b = el.getBoundingClientRect(); if (!b.width && !b.height) continue; const sw = el.tagName === 'text' ? 0 : 1.5;
            if (b.left < R.left - sw - 1 || b.top < R.top - sw - 1 || b.right > R.right + sw + 1 || b.bottom > R.bottom + sw + 1) { probs.push(`${el.tagName} past the edge`); break; }
          }
        }
        if (probs.length) out.push(`${s.c}:${s.v} seed ${seed}: ${probs.join('; ')}`);
      }
      host.remove(); return out;
    });
    // the mock-up itself: every Skills card and every tray thumbnail shows its own skill's sample
    await page.goto(`${base}/design/mockups/teacher-2/app.html?tray=demo10&tview=thumbs#skills`, { waitUntil: 'networkidle' });
    app = await page.evaluate(() => {
      const out = []; let n = 0;
      for (const c of document.querySelectorAll('[data-skill]')) {
        const svg = c.querySelector('svg.smp-svg, svg[data-fallback]'); if (!svg) continue; n++;
        if (svg.getAttribute('data-smp') !== c.getAttribute('data-skill') && !svg.hasAttribute('data-fallback')) out.push(`app.html: ${c.getAttribute('data-skill')} shows ${svg.getAttribute('data-smp')}`);
      }
      if (n < 10) out.push(`app.html: only ${n} thumbnails carry their skill (data-skill)`);
      return out;
    });
  } finally { await browser.close(); server.close(); }
  geo.forEach(x => fails.push(x)); app.forEach(x => fails.push(x));

  // ---- 5: size
  const mb = fs.existsSync(SAMPLES_FILE) ? fs.statSync(SAMPLES_FILE).size / 1048576 : 0;
  if (mb > 6) say('samples.js', `${mb.toFixed(2)} MB, over the 6 MB budget`);

  const listed = Object.keys(LISTED_FALLBACKS);
  console.log(`${D.skills.length} live skills · ${S && S.s ? Object.keys(S.s).length : 0} with captured items (${nSamples} items, capture seed ${S && S.seed}) · ${listed.length} listed fallbacks${listed.length ? ': ' + listed.join(', ') : ''}`);
  console.log(`${nDraws} thumbnails checked against their own captured item · ${spotN} critic-named skills spot-tested by content · samples.js ${mb.toFixed(2)} MB`);
  const once = [...new Set(fails)];
  if (once.length) { console.log(`\nthumbs-check: FAIL (${once.length})`); once.slice(0, 150).forEach(f => console.log('  ' + f)); if (once.length > 150) console.log(`  … ${once.length - 150} more`); process.exit(1); }
  console.log('thumbs-check: OK');
})();
