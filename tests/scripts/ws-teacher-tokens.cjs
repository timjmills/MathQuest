#!/usr/bin/env node
/*
 * ws-teacher-tokens — the Teacher site 2.0 token gate, PALETTE PART (IMPROVEMENT_PLAN §2.7, §2.8; built in T1).
 *
 * Palette: BOARD C (owner 2026-10-23, after T1's first cut: the school's Awsaj maths site look — cream page, warm ink,
 * muted painted area colours). The §2.7 RULES are unchanged; only the values moved from board B to board C, and
 * contrast is measured against cream #FBF7EF (light) and #0F0E0C (dark).
 *
 *   node tests/scripts/ws-teacher-tokens.cjs            # GATE: prints a table, then ws-teacher-tokens: OK / FAIL
 *   node tests/scripts/ws-teacher-tokens.cjs --css <f>  # check another token file (default design/mockups/teacher-2/tokens.css)
 *
 * No dependencies. The colour maths is a port of design/audit/palette-2026-10-23/colour.py (WCAG contrast, CIELAB,
 * CIEDE2000, Machado 2009 deuteranopia / protanopia at severity 1.0) and the ramp rules of ramps.py, so every number
 * printed here agrees with `python3 design/audit/palette-2026-10-23/ramps.py`.
 *
 * Checks (any failure exits 1):
 *   1. ramps     every area's tint / soft / deep and dark tint / soft / light version follow the ramp rules and equal
 *                the board C table;
 *   2. normal    CIEDE2000 between bold colours >= 20 for every pair (normal vision);
 *   3. cvd       under deuteranopia AND protanopia: >= 12 for every pair of areas that share a single-grade list,
 *                >= 8 for any other pair. The shared-grade sets are derived from the live skills (every live skill's
 *                grade x its area, the areas.mjs rules); only if the app data cannot load does the gate fall back to
 *                the §2.7 sets, and it says so;
 *   4. slate     slate (Mixed / Words / No standard) >= 8 from every area in all three views;
 *   5. status    every bold >= 20 from error red #B91C1C and key orange #C2410C in all three views;
 *   6. contrast  text >= 4.5 : 1 on every strength with its stated text colour, light and dark; deep >= 7 on the cream page;
 *                the dark light-version >= 7 on the dark tint; the neutrals and the primary button too;
 *   7. tokens    the token CSS uses exactly these values (colours, both themes) and exactly the §2.8 scales
 *                (type 12 14 16 20 28 36, weights 500 700, spacing 4 8 16 24 32 48, radii 8 16, two shadows, 44 px controls);
 *   8. mock-up   the mock-up's own CSS (app.css beside the token file) uses no raw colour, font size, weight, radius or shadow;
 *   9. script    the mock-up's app.js writes no inline style (no style="…", no element.style; the body scroll lock excepted).
 *  10. action    (fix round 2) every bold, slate too, is clearly not the primary: CIEDE2000 >= 20 from ink #1A1614 and from
 *                the dark-mode primary #FBF7EF, and WCAG >= 2.0 : 1 against ink;
 *  11. dark      (fix round 2) every dark tint >= 1.2 : 1 against the dark page #0F0E0C and every bold >= 3 : 1 against it,
 *                so each group, band and card edge stays visibly coloured in dark mode.
 * The other §2.8 rules (one ink fill per screen, area colours only under data-domain, chips outlined and ringed, ...) are
 * screen checks: they join this gate in T2 with the real screens.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..', '..');
const argCss = process.argv.indexOf('--css');
const CSS_FILE = argCss > 0 ? path.resolve(process.argv[argCss + 1]) : path.join(ROOT, 'design/mockups/teacher-2/tokens.css');

// ---------------------------------------------------------------- colour maths (port of colour.py)
// Board C (owner 2026-10-23, the Awsaj look): warm ink on cream; dark page #0F0E0C with cream text.
const INK = '#1A1614', WHITE = '#FFFFFF', CREAM = '#FBF7EF', DARK = '#0F0E0C', KEY = '#C2410C', ERR = '#B91C1C', DARK_TEXT = '#FBF7EF';
const MODES = ['normal', 'deut', 'prot'];
const M = {
  deut: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  prot: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
};
const rgb = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const lum = (h) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const cr = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
const pyRound = (x) => { const f = Math.floor(x); return x - f === 0.5 ? (f % 2 === 0 ? f : f + 1) : Math.round(x); };
const hex2 = (v) => Math.max(0, Math.min(255, v)).toString(16).toUpperCase().padStart(2, '0');
const mix = (a, b, t) => { const ra = rgb(a), rb = rgb(b); return '#' + [0, 1, 2].map(i => hex2(pyRound(255 * (ra[i] * t + rb[i] * (1 - t))))).join(''); };
function lab(h, mode = 'normal') {
  let l = rgb(h).map(lin);
  if (mode !== 'normal') { const m = M[mode]; l = [0, 1, 2].map(i => Math.min(1, Math.max(0, m[i][0] * l[0] + m[i][1] * l[1] + m[i][2] * l[2]))); }
  const X = 0.4124564 * l[0] + 0.3575761 * l[1] + 0.1804375 * l[2];
  const Y = 0.2126729 * l[0] + 0.7151522 * l[1] + 0.0721750 * l[2];
  const Z = 0.0193339 * l[0] + 0.1191920 * l[1] + 0.9503041 * l[2];
  const e = 216 / 24389, k = 24389 / 27, f = (t) => t > e ? Math.cbrt(t) : (k * t + 16) / 116;
  const fx = f(X / 0.95047), fy = f(Y), fz = f(Z / 1.08883);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
const rad = (d) => d * Math.PI / 180, deg = (r) => r * 180 / Math.PI, mod360 = (x) => ((x % 360) + 360) % 360;
function de00(a, b, mode = 'normal') {
  const [l1, a1, b1] = lab(a, mode), [l2, a2, b2] = lab(b, mode);
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2, C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h1 = mod360(deg(Math.atan2(b1, a1p))), h2 = mod360(deg(Math.atan2(b2, a2p)));
  const dL = l2 - l1, dC = C2p - C1p; let dh = h2 - h1;
  if (C1p * C2p === 0) dh = 0; else if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dh / 2));
  const Lb = (l1 + l2) / 2, Cbp = (C1p + C2p) / 2; let hb;
  if (C1p * C2p === 0) hb = h1 + h2; else if (Math.abs(h1 - h2) <= 180) hb = (h1 + h2) / 2; else if (h1 + h2 < 360) hb = (h1 + h2 + 360) / 2; else hb = (h1 + h2 - 360) / 2;
  const T = 1 - 0.17 * Math.cos(rad(hb - 30)) + 0.24 * Math.cos(rad(2 * hb)) + 0.32 * Math.cos(rad(3 * hb + 6)) - 0.20 * Math.cos(rad(4 * hb - 63));
  const dth = 30 * Math.exp(-(((hb - 275) / 25) ** 2)), RC = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const SL = 1 + 0.015 * (Lb - 50) ** 2 / Math.sqrt(20 + (Lb - 50) ** 2), SC = 1 + 0.045 * Cbp, SH = 1 + 0.015 * Cbp * T;
  const RT = -Math.sin(rad(2 * dth)) * RC;
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
}
const textFor = (h) => { const w = cr(h, CREAM), i = cr(h, INK); return (w >= 4.5 && w >= i) ? CREAM : (i >= 4.5 ? INK : (w >= 4.5 ? CREAM : null)); };
function deep(b) { let t = 0.75; while (cr(mix(b, '#000000', t), CREAM) < 7) t -= 0.01; return mix(b, '#000000', t); }
function light(b, under) { let t = 0.5; while (cr(mix(b, CREAM, t), under) < 7) t -= 0.01; return mix(b, CREAM, t); }
// dark tint: 18 % of the bold over the dark page, raised 1 % at a time until it is >= 1.2 : 1 from the page (fix round 2)
function darkTint(b) { let t = 0.18, x = mix(b, DARK, t); while (cr(x, DARK) < 1.2) { t = Math.round((t + 0.01) * 100) / 100; x = mix(b, DARK, t); } return x; }
function ramp(b) { const dTint = darkTint(b); return { tint: mix(b, CREAM, 0.10), soft: mix(b, CREAM, 0.30), bold: b, on: textFor(b), deep: deep(b), dTint, dSoft: mix(b, DARK, 0.40), dLight: light(b, dTint) }; }

// ---------------------------------------------------------------- board C (owner 2026-10-23; supersedes board B of §2.7)
// The colours sampled from the school's Awsaj maths site, moved only as far as the §2.7 rules need
// (design/mockups/teacher-2/palette/board-c-search.py). [key, css prefix, name, tint, soft, bold, deep, dark light version, dark tint]
const PLAN = [
  ['CC', 'cc', 'Counting & cardinality (mauve)', '#F6EFEB', '#EDDEE2', '#CEA4C5', '#614D5D', '#E4CEDA', '#31292D'],
  ['OA', 'oa', 'Operations & algebraic thinking (mid indigo; fix round 2 lifted it from ink-indigo #2E2B71, which read as ink)', '#EAE7E8', '#C9C8DB', '#555BAE', '#404482', '#A8A9CE', '#1F2031'],
  ['NBT', 'nbt', 'Number & operations in base ten (gold)', '#F9F3E2', '#F5EBC7', '#E7CF69', '#5C532A', '#F1E3AC', '#36311D'],
  ['NF', 'nf', 'Fractions & decimals (plum)', '#EFE6E3', '#D8C5CA', '#865273', '#653E56', '#C0A4B1', '#2A1E24'],
  ['MEAS', 'meas', 'Measurement (sage)', '#F3F3E8', '#E2EBDA', '#A9CFAA', '#475747', '#D2E3CC', '#2B3128'],
  ['DATA', 'data', 'Data (blue)', '#E9EDEC', '#C6D8E4', '#4B8FCC', '#2E577C', '#A3C3DE', '#1A252F'],
  ['G', 'g', 'Geometry (sea teal)', '#E8EEE6', '#C1DBD3', '#399993', '#235D5A', '#9AC8C1', '#172724'],
  ['RPNS', 'rpns', 'Ratio & number system (peach)', '#F8EFE4', '#F0DECE', '#D8A480', '#684F3D', '#EACEB8', '#332921'],
];
const SLATE = '#706C6A';   // warm stone (fix round 2: lifted from #57534E, which was 19.7 from ink and 2.5 : 1 on the dark page)
const PLAN_GRADES = { K: ['CC', 'OA', 'NBT', 'MEAS', 'DATA', 'G'], '1': ['OA', 'NBT', 'MEAS', 'DATA', 'G'], '2': ['OA', 'NBT', 'MEAS', 'DATA', 'G'],
  '3': ['OA', 'NBT', 'NF', 'MEAS', 'DATA', 'G'], '4': ['OA', 'NBT', 'NF', 'MEAS', 'DATA', 'G'], '5': ['OA', 'NBT', 'NF', 'MEAS', 'DATA', 'G'], '6': ['RPNS', 'OA', 'DATA', 'G'] };
// Neutrals of the token file (§2.7 rank 4, §2.8): [token, light, dark]
const NEUTRALS = {
  page: ['#FBF7EF', '#0F0E0C'], surface: ['#FFFCF6', '#1A1614'], 'surface-2': ['#F3ECDF', '#221D1A'], text: ['#1A1614', '#FBF7EF'], 'text-2': ['#4A423B', '#D9CFC2'],
  'text-3': ['#6B6158', '#A89D90'], ring: ['#1A1614', '#FBF7EF'], 'primary-bg': ['#1A1614', '#FBF7EF'], 'primary-fg': ['#FBF7EF', '#1A1614'],
  rail: ['#1A1614', '#1A1614'], 'rail-text': ['#FBF7EF', null], 'rail-text-2': ['#CFC5B8', null],
  'chip-edge-dark': ['#E8DFD2', null], error: ['#B91C1C', null], key: ['#C2410C', null],
};

// ---------------------------------------------------------------- the shared-grade sets, from the live skills
async function gradeSets() {
  try {
    globalThis.window = globalThis;
    globalThis.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, createElement: () => ({ style: {} }) };
    globalThis.localStorage = { getItem: () => null, setItem() {} };
    const log = console.log; console.log = () => {};
    let data, std;
    try {
      data = await import(pathToFileURL(path.join(ROOT, 'js/modules/data.js')).href);
      std = await import(pathToFileURL(path.join(ROOT, 'js/modules/standards.js')).href);
    } finally { console.log = log; }
    const { SKILLS, getSkillGrade } = data; const { SKILL_STANDARDS } = std;
    const area = (code, g) => {
      const m = String(code).match(/^(K|\d)\.([A-Z]+)(?:\.([A-Z]))?/); if (!m) return null; const [, cg, d, cl] = m;
      if (d === 'CC') return 'CC'; if (d === 'OA' || d === 'EE') return 'OA'; if (d === 'NBT') return 'NBT'; if (d === 'NF') return 'NF';
      if (d === 'MD') { const dd = { K: 'B', 1: 'C', 2: 'D', 3: 'B', 4: 'B', 5: 'B' }; return cl === dd[cg] ? 'DATA' : 'MEAS'; }
      if (d === 'SP') return 'DATA'; if (d === 'G') return 'G';
      if (d === 'RP' || d === 'NS') { if (g !== '6' && g !== 'M') { if (d === 'NS' && cl === 'C') return 'G'; if (d === 'NS' && cl === 'B') return 'OA'; } return 'RPNS'; }
      return null;
    };
    const rows = [], votes = {};
    for (const [cat, list] of Object.entries(SKILLS)) for (const s of list) {
      if (!s || !s.v || s.retired) continue;
      const g = String(getSkillGrade(s.v, cat) ?? '?'); const st = SKILL_STANDARDS[cat + ':' + s.v]; const code = st && st.ccss && st.ccss[0];
      const a = code ? area(code, g) : null; rows.push({ cat, g, a }); if (a) (votes[cat] = votes[cat] || {})[a] = (votes[cat][a] || 0) + 1;
    }
    const maj = (c) => { if (c === 'probability') return 'DATA'; const v = votes[c]; if (!v) return null; const tot = Object.values(v).reduce((x, y) => x + y, 0); const [top, n] = Object.entries(v).sort((x, y) => y[1] - x[1])[0]; return n * 2 > tot ? top : null; };
    const sets = {}, how = { tagged: 0, category: 0, words: 0, mixed: 0 };
    for (const r of rows) {
      let a = r.a;
      if (r.cat === 'vocabulary') { a = 'WORDS'; how.words++; } else if (!a) { a = maj(r.cat); if (a) how.category++; else { a = 'MIXED'; how.mixed++; } } else how.tagged++;
      (sets[r.g] = sets[r.g] || new Set()).add(a);
    }
    const out = {};
    for (const g of ['K', '1', '2', '3', '4', '5', '6']) out[g === 'K' ? 'K' : g] = [...(sets[g] || [])].filter(a => PLAN.some(p => p[0] === a));
    return { sets: out, source: `live skills (${rows.length}: tagged ${how.tagged} · by category ${how.category} · Mixed ${how.mixed} · Words ${how.words})` };
  } catch (e) {
    return { sets: PLAN_GRADES, source: `FALLBACK to the §2.7 sets: the app data could not load (${e.message.split('\n')[0]})` };
  }
}

// ---------------------------------------------------------------- token CSS
function parseBlocks(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = {}; const re = /([^{}]+)\{([^{}]*)\}/g; let m;
  while ((m = re.exec(clean))) {
    const sel = m[1].trim().replace(/\s+/g, ' ');
    const vars = {}; for (const d of m[2].split(';')) { const mm = d.match(/^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/); if (mm) vars[mm[1]] = mm[2]; }
    blocks[sel] = Object.assign(blocks[sel] || {}, vars);
  }
  return blocks;
}

(async () => {
  const fails = []; const rows = [];
  const row = (check, value, need, where, ok) => { rows.push([check, value, need, where, ok ? 'ok' : 'FAIL']); if (!ok) fails.push(`${check}: ${value} (needs ${need}) ${where}`); };
  const r1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
  const A = PLAN.map(p => ({ k: p[0], css: p[1], name: p[2], plan: { tint: p[3], soft: p[4], bold: p[5], deep: p[6], dLight: p[7], dTint: p[8] }, r: ramp(p[5]) }));

  // 1. ramps
  let rampBad = [];
  for (const a of A) for (const f of ['tint', 'soft', 'deep', 'dLight', 'dTint']) if (a.plan[f] !== a.r[f]) rampBad.push(`${a.k} ${f} plan ${a.plan[f]} rule ${a.r[f]}`);
  row('ramps follow the rules = board C table', rampBad.length ? rampBad.length + ' differ' : '8 areas x 4 strengths x 2 modes', 'equal', rampBad.join('; '), !rampBad.length);

  // 2. normal vision
  const pairs = []; for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) pairs.push([A[i], A[j]]);
  const minOf = (list, f) => list.reduce((best, p) => { const v = f(p); return !best || v < best.v ? { v, p } : best; }, null);
  const n = minOf(pairs, ([a, b]) => de00(a.r.bold, b.r.bold));
  row('CIEDE2000 bold vs bold, normal, every pair', r1(n.v), '>= 20', `${n.p[0].k}–${n.p[1].k}`, n.v >= 20);

  // 3. colour-blind
  const { sets, source } = await gradeSets();
  const shared = new Set(); for (const list of Object.values(sets)) for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) shared.add([list[i], list[j]].sort().join('|'));
  const isShared = ([a, b]) => shared.has([a.k, b.k].sort().join('|'));
  for (const mode of ['deut', 'prot']) {
    const label = mode === 'deut' ? 'deuteranopia' : 'protanopia';
    const s = minOf(pairs.filter(isShared), ([a, b]) => de00(a.r.bold, b.r.bold, mode));
    row(`CIEDE2000 bold, ${label}, areas sharing a grade`, r1(s.v), '>= 12', `${s.p[0].k}–${s.p[1].k}`, s.v >= 12);
    const o = minOf(pairs, ([a, b]) => de00(a.r.bold, b.r.bold, mode));
    row(`CIEDE2000 bold, ${label}, any pair`, r1(o.v), '>= 8', `${o.p[0].k}–${o.p[1].k}`, o.v >= 8);
  }
  // 4. slate
  for (const mode of MODES) {
    const s = minOf(A, (a) => de00(SLATE, a.r.bold, mode));
    row(`slate vs every area, ${mode}`, r1(s.v), '>= 8', `slate–${s.p.k}`, s.v >= 8);
  }
  // 5. status colours
  const st = minOf(A.flatMap(a => MODES.flatMap(m => [[a, ERR, m, 'error red'], [a, KEY, m, 'key orange']])), ([a, c, m]) => de00(a.r.bold, c, m));
  row('bold vs error red / key orange, all views', r1(st.v), '>= 20', `${st.p[0].k}–${st.p[3]} (${st.p[2]})`, st.v >= 20);

  // 6. contrast
  const SL = Object.assign(ramp(SLATE), {}); const all = A.concat([{ k: 'slate', r: SL }]);
  const con = [];
  for (const a of all) {
    const r = a.r;
    con.push([`${a.k} light tint / ink`, cr(r.tint, INK), 4.5], [`${a.k} light soft / ink`, cr(r.soft, INK), 4.5], [`${a.k} bold / its text`, r.on ? cr(r.bold, r.on) : 0, 4.5],
      [`${a.k} deep / cream page`, cr(r.deep, CREAM), 7], [`${a.k} deep / surface`, cr(r.deep, NEUTRALS.surface[0]), 7], [`${a.k} deep / tint`, cr(r.deep, r.tint), 4.5],
      [`${a.k} dark tint / cream`, cr(r.dTint, DARK_TEXT), 4.5], [`${a.k} dark soft / cream`, cr(r.dSoft, DARK_TEXT), 4.5], [`${a.k} dark light-version / dark tint`, cr(r.dLight, r.dTint), 7]);
  }
  for (const [t, [l, d]] of Object.entries(NEUTRALS)) {
    if (['text', 'text-2', 'text-3'].includes(t)) { for (const bg of ['page', 'surface', 'surface-2']) con.push([`${t} on ${bg}, light`, cr(l, NEUTRALS[bg][0]), 4.5], [`${t} on ${bg}, dark`, cr(d, NEUTRALS[bg][1]), 4.5]); }
    if (['rail-text', 'rail-text-2'].includes(t)) con.push([`${t} on the rail`, cr(l, NEUTRALS.rail[0]), 4.5]);
  }
  con.push(['primary button, light', cr(NEUTRALS['primary-bg'][0], NEUTRALS['primary-fg'][0]), 4.5], ['primary button, dark', cr(NEUTRALS['primary-bg'][1], NEUTRALS['primary-fg'][1]), 4.5],
    ['chip outline #E8DFD2 / dark page', cr('#E8DFD2', DARK), 7], ['ring ink / cream', cr(INK, CREAM), 7], ['ring cream / dark page', cr(DARK_TEXT, DARK), 7]);
  const worst = con.filter(c => c[1] < c[2]);
  const low = con.reduce((b, c) => (c[1] / c[2] < b[1] / b[2] ? c : b));
  row(`text contrast (${con.length} pairs, light and dark)`, worst.length ? worst.map(w => `${w[0]} ${w[1].toFixed(2)}`).join('; ') : `closest ${low[0]} ${low[1].toFixed(2)}`, '>= 4.5 / 7', '', !worst.length);

  // 10. distinct from the action (fix round 2; critic r2 A3/D1, stop rule §1.7). The one primary action is solid ink in
  //     light mode and solid cream in dark mode; an area bold that sits near either reads as a second primary (OA #2E2B71
  //     was 1.45 : 1 from ink, so a tray of three OA chips looked like four black buttons). Thresholds:
  //       CIEDE2000 >= 20 from ink #1A1614 and from the dark-mode primary #FBF7EF (the same >= 20 the bolds keep from each
  //       other), AND WCAG >= 2.0 : 1 against ink. The brief's floor was 1.5; OA at 1.45 read as ink to the critic and NF
  //       plum at 2.37 did not, so the line sits at 2.0, between the two. Slate is held to the same rule (its tray chips are
  //       solid too).
  const INKMIN = { de: 20, cr: 2.0 };
  const inkRows = all.map(a => ({ k: a.k, b: a.plan ? a.plan.bold : SLATE }));
  const dInk = minOf(inkRows, (a) => de00(a.b, INK)), dCream = minOf(inkRows, (a) => de00(a.b, DARK_TEXT)), cInk = minOf(inkRows, (a) => cr(a.b, INK));
  row('CIEDE2000 bold vs the ink primary #1A1614', r1(dInk.v), '>= 20', dInk.p.k, dInk.v >= INKMIN.de);
  row('CIEDE2000 bold vs the dark-mode primary #FBF7EF', r1(dCream.v), '>= 20', dCream.p.k, dCream.v >= INKMIN.de);
  row('WCAG bold vs ink (an area never reads as ink)', cInk.v.toFixed(2), '>= 2.0', cInk.p.k, cInk.v >= INKMIN.cr);
  // 11. dark mode keeps every group visibly coloured (critic r2 D1: the OA tint was 1.05 : 1 on the page, so the OA group
  //     panel vanished). Measured on the values actually in the board table / token file, not on the rule:
  //       every dark tint >= 1.2 : 1 against the dark page #0F0E0C (the group panel shows), and
  //       every bold >= 3 : 1 against the dark page (WCAG 1.4.11 for the card edge, band rule and band icon that carry the area).
  const darkRows = all.map(a => ({ k: a.k, t: a.plan ? a.plan.dTint || a.r.dTint : a.r.dTint, b: a.plan ? a.plan.bold : SLATE }));
  const dt = minOf(darkRows, (a) => cr(a.t, DARK)), db = minOf(darkRows, (a) => cr(a.b, DARK));
  row('dark tint vs the dark page (the group shows)', dt.v.toFixed(2), '>= 1.2', `${dt.p.k} ${dt.p.t}`, dt.v >= 1.2);
  row('bold vs the dark page (edge, band, icon)', db.v.toFixed(2), '>= 3', db.p.k, db.v >= 3);

  // 7. tokens.css
  let tokBad = [];
  if (!fs.existsSync(CSS_FILE)) tokBad.push('missing ' + path.relative(ROOT, CSS_FILE));
  let blocks = {};
  if (!tokBad.length) {
    blocks = parseBlocks(fs.readFileSync(CSS_FILE, 'utf8'));
    const L = blocks[':root'] || {}, Dk = blocks[':root[data-theme="dark"]'] || {};
    if (!blocks[':root']) tokBad.push('no :root block'); if (!blocks[':root[data-theme="dark"]']) tokBad.push('no :root[data-theme="dark"] block');
    const want = (blk, name, v, label) => { const got = (blk[name] || '').toUpperCase(); if (got !== v.toUpperCase()) tokBad.push(`${label} ${name} = ${blk[name] || '(missing)'}, want ${v}`); };
    for (const a of all) {
      const p = a.css || 'slate';
      want(L, `--${p}-tint`, a.r.tint, 'light'); want(L, `--${p}-soft`, a.r.soft, 'light'); want(L, `--${p}-bold`, a.r.bold, 'light'); want(L, `--${p}-on`, a.r.on, 'light'); want(L, `--${p}-deep`, a.r.deep, 'light');
      want(Dk, `--${p}-tint`, a.r.dTint, 'dark'); want(Dk, `--${p}-soft`, a.r.dSoft, 'dark'); want(Dk, `--${p}-deep`, a.r.dLight, 'dark');
      if (Dk[`--${p}-bold`] && Dk[`--${p}-bold`].toUpperCase() !== a.r.bold) tokBad.push(`dark --${p}-bold must stay the bold`);
    }
    for (const [t, [l, d]] of Object.entries(NEUTRALS)) { want(L, '--' + t, l, 'light'); if (d) want(Dk, '--' + t, d, 'dark'); }
    const scale = (prefix, wantList) => { const got = Object.keys(L).filter(k => k.startsWith(prefix)).map(k => L[k].replace(/px$/, '')).sort((x, y) => x - y).join(' '); if (got !== wantList) tokBad.push(`${prefix}* = ${got || '(none)'}, want ${wantList}`); };
    scale('--fs-', '12 14 16 20 28 36'); scale('--fw-', '500 700'); scale('--sp-', '4 8 16 24 32 48'); scale('--r-', '8 16');
    const sh = Object.keys(L).filter(k => k.startsWith('--shadow-')); if (sh.length !== 2) tokBad.push(`${sh.length} shadows, want 2`);
    if ((L['--control'] || '') !== '44px') tokBad.push(`--control = ${L['--control']}, want 44px`);
  }
  row('token CSS = these values (both themes) + §2.8 scales', tokBad.length ? tokBad.length + ' differ' : path.relative(ROOT, CSS_FILE), 'exact', tokBad.slice(0, 6).join('; '), !tokBad.length);

  // 8. the mock-up's own CSS uses tokens only
  const appCss = path.join(path.dirname(CSS_FILE), 'app.css'); const raw = [];
  if (fs.existsSync(appCss)) {
    const css = fs.readFileSync(appCss, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    css.split('\n').forEach((line, i) => {
      const at = `app.css:${i + 1}`;
      if (/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(line)) raw.push(`${at} raw colour`);
      const decl = (prop) => [...line.matchAll(new RegExp(`(?:^|[;{\\s])${prop}\\s*:\\s*([^;}]+)`, 'g'))].map(m => m[1].trim());
      for (const v of decl('font-size')) if (!/^var\(--fs-\d+\)$/.test(v)) raw.push(`${at} font-size ${v}`);
      for (const v of decl('font-weight')) if (!/^var\(--fw-\d+\)$/.test(v)) raw.push(`${at} font-weight ${v}`);
      for (const v of decl('border-radius')) if (!/^(0|var\(--r-\d+\))$/.test(v)) raw.push(`${at} border-radius ${v}`);
      for (const v of decl('box-shadow')) if (!/^(none|var\(--shadow-[12]\)|(inset )?0 0 0 var\(--line-[12]\) var\(--ring\)|inset (0|var\(--sp-4\)) (0|var\(--sp-4\)) 0 (var\(--[\w-]+\))(, *)?)$/.test(v) && !/^inset 0 0 0 var\(--line-2\) var\(--surface\)$/.test(v)) raw.push(`${at} box-shadow ${v}`);
    });
  }
  row('mock-up CSS: no raw colour, size, weight, radius or shadow', raw.length ? raw.length + ' found' : 'app.css clean', '0', raw.slice(0, 6).join('; '), !raw.length);

  // 9. the mock-up's script writes no inline styles (critic r1 D3: app.js injected raw heights, widths and a scale that
  //    check 8 could not see). Every style="…" attribute and every element.style assignment in app.js is a failure,
  //    except document.body.style.overflow (the scroll lock while a sheet is open, a behaviour, not a look).
  const appJs = path.join(path.dirname(CSS_FILE), 'app.js'); const inl = [];
  if (fs.existsSync(appJs)) {
    fs.readFileSync(appJs, 'utf8').split('\n').forEach((line, i) => {
      const at = `app.js:${i + 1}`;
      for (const m of line.matchAll(/style\s*=\s*["'`\\]/g)) inl.push(`${at} style attribute`);
      for (const m of line.matchAll(/\.style\.([\w-]+)\s*=|\.style\.setProperty|\.style\.cssText/g)) if (!/document\.body\.style\.overflow\s*=/.test(line)) inl.push(`${at} .style.${m[1] || 'set'}`);
    });
  }
  row('mock-up script: no inline styles in app.js', inl.length ? inl.length + ' found' : 'app.js clean', '0', inl.slice(0, 6).join('; '), !inl.length);

  // ---------------------------------------------------------------- print
  console.log('ws-teacher-tokens — board C palette (the Awsaj look, owner 2026-10-23) under the IMPROVEMENT_PLAN §2.7 / §2.8 rules');
  console.log(`shared-grade sets from ${source}:`);
  for (const [g, l] of Object.entries(sets)) console.log(`  ${g === 'K' ? 'K' : 'Grade ' + g}: ${l.join(' ')}`);
  console.log('');
  console.log('area   tint     soft     bold     on       deep     | dark tint  soft     light');
  for (const a of all) { const r = a.r; console.log(`${a.k.padEnd(6)} ${r.tint}  ${r.soft}  ${r.bold}  ${r.on}  ${r.deep}  | ${r.dTint}    ${r.dSoft}  ${r.dLight}`); }
  console.log('');
  const w = [61, 28, 11, 24];
  console.log('check'.padEnd(w[0]) + 'found'.padEnd(w[1]) + 'needs'.padEnd(w[2]) + 'where'.padEnd(w[3]) + 'result');
  for (const r of rows) {
    const val = String(r[1]); const where = String(r[3]);
    console.log(r[0].padEnd(w[0]) + (val.length > w[1] - 1 ? val.slice(0, w[1] - 2) + '…' : val).padEnd(w[1]) + r[2].padEnd(w[2]) + (where.length > w[3] - 1 ? where.slice(0, w[3] - 2) + '…' : where).padEnd(w[3]) + r[4]);
  }
  if (fails.length) { console.log('\nws-teacher-tokens: FAIL'); for (const f of fails) console.log('  ' + f); process.exit(1); }
  console.log('\nws-teacher-tokens: OK');
})();
