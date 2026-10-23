// Colour maths for the Teacher site 2.0 palette page: a straight port of design/audit/palette-2026-10-23/colour.py
// (WCAG contrast, CIELAB, CIEDE2000, Machado 2009 CVD simulation at severity 1.0) plus the ramp rules of ramps.py, re-based for board C on the cream page (tint/soft over cream, deep >= 7 : 1 on cream).
// Works in the browser (window.MQColour) and in Node (module.exports). tests/scripts/ws-teacher-tokens.cjs holds
// its own copy so the gate has no dependency on the mock-up.
(function (root) {
  // Board C (owner 2026-10-23, the Awsaj look): cream page, warm ink, warm near-black dark page; text on a bold is cream or ink.
  const INK = '#1A1614', WHITE = '#FFFFFF', CREAM = '#FBF7EF', DARK = '#0F0E0C', KEY = '#C2410C', ERR = '#B91C1C';
  const M = {
    deut: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
    prot: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  };
  const rgb = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const unlin = (c) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  const lum = (h) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const cr = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
  const hex2 = (v) => Math.max(0, Math.min(255, v)).toString(16).toUpperCase().padStart(2, '0');
  function pyRound(x) { const f = Math.floor(x), d = x - f; if (d === 0.5) return f % 2 === 0 ? f : f + 1; return Math.round(x); }
  function simLin(h, mode) { const l = rgb(h).map(lin); if (mode === 'normal') return l; const m = M[mode]; return [0, 1, 2].map(i => Math.min(1, Math.max(0, m[i][0] * l[0] + m[i][1] * l[1] + m[i][2] * l[2]))); }
  function simulate(h, mode) { return '#' + simLin(h, mode).map(c => hex2(Math.round(255 * unlin(c)))).join(''); }
  function lab(h, mode = 'normal') {
    const l = simLin(h, mode);
    const X = 0.4124564 * l[0] + 0.3575761 * l[1] + 0.1804375 * l[2];
    const Y = 0.2126729 * l[0] + 0.7151522 * l[1] + 0.0721750 * l[2];
    const Z = 0.0193339 * l[0] + 0.1191920 * l[1] + 0.9503041 * l[2];
    const e = 216 / 24389, k = 24389 / 27; const f = (t) => t > e ? Math.cbrt(t) : (k * t + 16) / 116;
    const fx = f(X / 0.95047), fy = f(Y), fz = f(Z / 1.08883);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  }
  const rad = (d) => d * Math.PI / 180, deg = (r) => r * 180 / Math.PI;
  function de00(a, b, mode = 'normal') {
    const [l1, a1, b1] = lab(a, mode), [l2, a2, b2] = lab(b, mode);
    const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
    const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
    const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
    const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
    const md = (x) => ((x % 360) + 360) % 360;
    const h1 = md(deg(Math.atan2(b1, a1p))), h2 = md(deg(Math.atan2(b2, a2p)));
    const dL = l2 - l1, dC = C2p - C1p; let dh = h2 - h1;
    if (C1p * C2p === 0) dh = 0; else if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
    const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dh / 2));
    const Lb = (l1 + l2) / 2, Cbp = (C1p + C2p) / 2; let hb;
    if (C1p * C2p === 0) hb = h1 + h2; else if (Math.abs(h1 - h2) <= 180) hb = (h1 + h2) / 2; else if (h1 + h2 < 360) hb = (h1 + h2 + 360) / 2; else hb = (h1 + h2 - 360) / 2;
    const T = 1 - 0.17 * Math.cos(rad(hb - 30)) + 0.24 * Math.cos(rad(2 * hb)) + 0.32 * Math.cos(rad(3 * hb + 6)) - 0.20 * Math.cos(rad(4 * hb - 63));
    const dth = 30 * Math.exp(-(((hb - 275) / 25) ** 2)); const RC = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
    const SL = 1 + 0.015 * (Lb - 50) ** 2 / Math.sqrt(20 + (Lb - 50) ** 2), SC = 1 + 0.045 * Cbp, SH = 1 + 0.015 * Cbp * T;
    const RT = -Math.sin(rad(2 * dth)) * RC;
    return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
  }
  function mix(a, b, t) { const ra = rgb(a), rb = rgb(b); return '#' + [0, 1, 2].map(i => hex2(pyRound(255 * (ra[i] * t + rb[i] * (1 - t))))).join(''); }
  function textFor(h) { const w = cr(h, CREAM), i = cr(h, INK); return (w >= 4.5 && w >= i) ? 'cream' : (i >= 4.5 ? 'ink' : (w >= 4.5 ? 'cream' : null)); }
  function deep(b) { let t = 0.75; while (cr(mix(b, '#000000', t), CREAM) < 7) t -= 0.01; return mix(b, '#000000', t); }
  function light(b, under) { let t = 0.5; while (cr(mix(b, CREAM, t), under) < 7) t -= 0.01; return mix(b, CREAM, t); }
  function ramp(b) {
    const tint = mix(b, CREAM, 0.10), soft = mix(b, CREAM, 0.30), dTint = mix(b, DARK, 0.18), dSoft = mix(b, DARK, 0.40);
    return { bold: b, on: textFor(b) === 'cream' ? CREAM : INK, tint, soft, deep: deep(b), dTint, dSoft, dLight: light(b, dTint) };
  }
  const api = { INK, WHITE, CREAM, DARK, KEY, ERR, rgb, lum, cr, lab, de00, mix, textFor, deep, light, ramp, simulate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MQColour = api;
})(typeof window !== 'undefined' ? window : globalThis);
