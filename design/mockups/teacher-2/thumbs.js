// Teacher site 2.0 mock-up: small black-and-white drawings standing in for each skill's real cell (pupil content:
// Andika, black on white, the single grey). In the app (T3) the thumbnail is the skill's own seeded cell
// (teacher-preview.js sampleFor). Here the drawing is picked by the skill's CATEGORY and ID first (then its label),
// never by one word of the label alone, so "Find the Start" draws a start-unknown story, place-value skills draw
// place value, and each Maths words card draws its own words. `node thumbs-check.cjs` holds every live skill to this
// (fix round 1, critic r1 C1) and thumbs.html shows them all.
//   MQThumbs.kindOf(skill) -> the drawing's name        MQThumbs.draw(skill, seed) -> an <svg>
(function (root) {
  const FONT = 'font-family="Andika, sans-serif"';
  const GREY = '#949494';
  function rng(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const pickOf = (r, list) => list[Math.floor(r() * list.length)];
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-hidden="true">${body}</svg>`;
  const box = (x, y, w = 34, h = 34) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#000" stroke-width="2" rx="2"/>`;
  const txt = (x, y, s, size = 26, anchor = 'start', weight = 400) => `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="#000">${s}</text>`;
  const ln = (x1, y1, x2, y2, w = 2, dash = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  const circ = (cx, cy, r, fill = '#fff', w = 2) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="#000" stroke-width="${w}"/>`;
  const rect = (x, y, w, h, fill = '#fff', sw = 2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#000" stroke-width="${sw}"/>`;
  const fmt = (n) => Number(n).toLocaleString('en-US');
  const cw = (size) => size * 0.56;                 // Andika digit width, roughly
  const tw = (s, size) => String(s).length * cw(size);

  // ---- one line of maths with answer boxes: parts are strings, or null for a box
  function line(parts, size = 26) {
    let x = 8, body = ''; const h = size + 24;
    for (const p of parts) {
      if (p === null) { body += box(x, 6, size + 10, size + 10); x += size + 18; continue; }
      body += txt(x, size + 6, p, size); x += tw(p, size) + 8;
    }
    return svg(Math.max(120, Math.ceil(x + 10)), h, body);
  }
  function lines(rows, size = 22) {      // several rows, each a parts list
    let body = '', w = 120; const lh = size + 20;
    rows.forEach((parts, i) => {
      let x = 8; const y = i * lh;
      for (const p of parts) {
        if (p === null) { body += box(x, y + 4, size + 8, size + 8); x += size + 16; continue; }
        body += txt(x, y + size + 4, p, size); x += tw(p, size) + 8;
      }
      w = Math.max(w, x + 4);
    });
    return svg(Math.ceil(w), rows.length * lh + 6, body);
  }
  function story(textRows, answer = true, extra = '') {
    const size = 17; let body = '', w = 150;
    textRows.forEach((t, i) => { body += txt(6, 22 + i * 24, t, size); w = Math.max(w, tw(t, size) + 12); });
    const h = 22 + textRows.length * 24;
    if (answer) body += box(w - 6, h - 30, 44, 32);
    return svg(Math.ceil(w + 44), h + 8, body + extra);
  }
  function frac(x, y, n, d, size = 22) {   // a stacked fraction centred on x, bar at y
    const w = Math.max(tw(n, size), tw(d, size)) + 6;
    return txt(x, y - 6, n, size, 'middle') + ln(x - w / 2, y, x + w / 2, y, 2) + txt(x, y + size + 2, d, size, 'middle');
  }
  function fracBox(x, y) { return box(x - 15, y - 34, 30, 28) + ln(x - 18, y, x + 18, y, 2) + box(x - 15, y + 6, 30, 28); }

  // ---- sizes from the skill id: "within N" bounds the ANSWER
  function bound(s) {
    const m = (s.v + ' ').match(/_(5|10|20|50|100|1k|10k|100k|1m)[_ ]/) || (s.l.match(/within ([\d,]+)/i) || []);
    const k = m && m[1] ? String(m[1]).replace(/,/g, '') : null;
    return { 5: 5, 10: 10, 20: 20, 50: 50, 100: 100, '1k': 1000, '1000': 1000, '10k': 10000, '10000': 10000, '100k': 100000, '100000': 100000, '1m': 1000000, '1000000': 1000000 }[k] || null;
  }
  function addPair(r, max, regroup) {
    max = max || 20;
    if (max <= 10) { const a = int(r, 1, max - 2); return [a, int(r, 1, max - a)]; }
    if (max <= 20) { if (regroup === false) { const a = int(r, 11, 15); return [a, int(r, 1, 19 - a < 1 ? 1 : Math.min(4, 19 - a))]; } const a = int(r, 5, 9); return [a, int(r, 10 - a + 1, 9)]; }
    const digits = String(max).length - 1;               // 100 -> 2 digits each
    const lo = Math.pow(10, digits - 1), hi = max / 2 - 1;
    for (let t = 0; t < 40; t++) {
      const a = int(r, lo, Math.max(lo, Math.floor(hi))), b = int(r, lo, Math.max(lo, max - a - 1));
      const carry = String(a).split('').reverse().some((d, i) => Number(d) + Number(String(b).split('').reverse()[i] || 0) >= 10);
      if (regroup === undefined || carry === regroup) return [a, b];
    }
    return [int(r, lo, hi), int(r, lo, hi)];
  }
  function subPair(r, max, regroup) {
    const [a, b] = addPair(r, max, regroup); return [a + b, b];
  }
  const regroupOf = (v) => /no_regroup/.test(v) ? false : /_regroup/.test(v) ? true : undefined;

  // ---- vertical (column) calculation, optionally with one missing digit
  function stack(a, op, b, missing) {
    const sa = String(a), sb = String(b); const n = Math.max(sa.length, sb.length) + 1; const W = 40 + n * 17;
    const right = W - 12; let body = '';
    const digits = (s, y, hideAt) => s.split('').map((d, i) => { const x = right - (s.length - 1 - i) * 17; return hideAt === i ? box(x - 13, y - 23, 18, 26) : txt(x, y, d, 28, 'end'); }).join('');
    body += digits(sa, 34, missing === 'a' ? 1 : -1) + digits(sb, 70, missing === 'b' ? sb.length - 1 : -1) + txt(10, 70, op, 28);
    body += ln(8, 82, W - 6, 82) + box(right - n * 17 + 4, 88, n * 17, 30);
    return svg(W, 124, body);
  }
  function longDiv(dividend, divisor) {
    const s = String(dividend); const W = 70 + s.length * 17 + 20;
    return svg(W, 92, txt(10, 64, divisor, 28) + `<path d="M44 34 q10 16 0 40" fill="none" stroke="#000" stroke-width="2.5"/>` + ln(44, 34, W - 8, 34, 2.5) + txt(54, 64, s, 28) + box(56, 2, s.length * 17 + 4, 28));
  }

  // ---- pictures
  function dotsRow(n, x0, y, gap = 18, fill = '#fff', cross = 0) { let s = ''; for (let i = 0; i < n; i++) { const x = x0 + i * gap; s += circ(x, y, 7, fill); if (i >= n - cross) s += ln(x - 8, y + 8, x + 8, y - 8, 2); } return s; }
  function pics(a, b, op) {
    const take = op === '−';
    const w = 16 + (take ? a : a + b) * 18 + 40 + 60;
    const body = take ? dotsRow(a, 16, 26, 18, '#fff', b) + txt(28 + a * 18, 34, '=', 26) + box(52 + a * 18, 8, 36, 36)
      : dotsRow(a, 16, 26) + txt(8 + a * 18, 34, '+', 26) + dotsRow(b, 36 + a * 18, 26) + txt(36 + (a + b) * 18, 34, '=', 26) + box(60 + (a + b) * 18, 8, 36, 36);
    return svg(w + 20, 54, body);
  }
  function arrayDots(rows, cols, withEq = true) {
    let s = ''; for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) s += circ(14 + j * 18, 14 + i * 18, 6, '#000', 1);
    const W = 20 + cols * 18; const H = 10 + rows * 18;
    if (!withEq) return svg(W, H, s);
    return svg(W + 140, Math.max(H, 46), s + txt(W + 6, 30, `${rows} × ${cols} =`, 20) + box(W + 96, 8, 32, 32));
  }
  function groups(g, n, op = '×') {
    let s = ''; for (let i = 0; i < g; i++) { const cx = 30 + i * 56; s += circ(cx, 34, 24, '#fff'); for (let k = 0; k < n; k++) s += circ(cx - 10 + (k % 3) * 10, 26 + Math.floor(k / 3) * 12, 4, '#000', 1); }
    const W = 16 + g * 56;
    return svg(W + 150, 74, s + txt(W, 42, op === '×' ? `${g} groups of ${n}` : `${g * n} shared by ${g}`, 17) + box(W + 112, 18, 32, 32));
  }
  function areaModel(a, b) {
    const t = Math.floor(a / 10) * 10, o = a % 10;
    return svg(240, 116, place(rect(40, 26, 120, 70) + rect(160, 26, 60, 70) + txt(100, 18, t, 20, 'middle') + txt(190, 18, o, 20, 'middle') + txt(24, 68, b, 20, 'middle') + box(84, 44, 34, 34) + box(174, 44, 34, 34), 0, 6));
  }
  function multChart(r) {
    let s = ''; const n = 5; const blank = [int(r, 1, 4), int(r, 1, 4)];
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
      const x = 8 + j * 30, y = 8 + i * 22; s += rect(x, y, 30, 22, i === 0 || j === 0 ? GREY : '#fff', 1.5);
      if (i === blank[0] && j === blank[1]) continue;
      const v = i === 0 && j === 0 ? '×' : i === 0 ? j : j === 0 ? i : i * j; s += txt(x + 15, y + 17, v, 14, 'middle');
    }
    return svg(200, 144, s);
  }
  function seqRow(vals, blanks) { return line(vals.flatMap((v, i) => (blanks.includes(i) ? [null] : [String(v)]).concat(i < vals.length - 1 ? [','] : [])), 24); }
  function nline(lo, hi, opts = {}) {
    const W = 240, x0 = 16, x1 = W - 16, n = opts.ticks || 10; let s = ln(x0 - 6, 44, x1 + 6, 44);
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; s += ln(x, i % (n / 2) ? 37 : 32, x, 51); }
    s += txt(x0, 74, opts.loLabel ?? lo, 16, 'middle') + txt(x1, 74, opts.hiLabel ?? hi, 16, 'middle');
    if (opts.mid !== undefined) s += txt((x0 + x1) / 2, 74, opts.mid, 16, 'middle');
    if (opts.hop) { const [a, b] = opts.hop; const xa = x0 + (x1 - x0) * a / n, xb = x0 + (x1 - x0) * b / n; s += `<path d="M${xa} 34 Q${(xa + xb) / 2} 4 ${xb} 34" fill="none" stroke="#000" stroke-width="2"/><path d="M${xb - 6} 26 l6 8 l3 -9" fill="none" stroke="#000" stroke-width="2"/>`; }
    if (opts.point !== undefined) { const x = x0 + (x1 - x0) * opts.point / n; s += circ(x, 44, 6, '#000'); }
    if (opts.arrowAt !== undefined) { const x = x0 + (x1 - x0) * opts.arrowAt / n; s += `<path d="M${x - 6} 18 l6 9 l6 -9" fill="none" stroke="#000" stroke-width="2"/>`; }
    if (opts.box) s += box(W / 2 - 18, 82, 36, 30);
    return svg(W, opts.box ? 116 : 82, s);
  }
  function tenFrame(n, x0 = 8, y0 = 8, second = 0) { let s = ''; for (let i = 0; i < 10; i++) { const x = x0 + (i % 5) * 26, y = y0 + Math.floor(i / 5) * 26; s += rect(x, y, 26, 26); if (i < n) s += circ(x + 13, y + 13, 8, '#000', 1); else if (i < n + second) s += circ(x + 13, y + 13, 8, '#fff'); } return s; }
  function rods(t, o, hundreds = 0) {
    let s = '', x = 8;
    for (let i = 0; i < hundreds; i++) { s += rect(x, 6, 60, 60); for (let k = 1; k < 10; k++) s += ln(x + k * 6, 6, x + k * 6, 66, 0.8) + ln(x, 6 + k * 6, x + 60, 6 + k * 6, 0.8); x += 66; }
    for (let i = 0; i < t; i++) { s += rect(x, 6, 10, 80); for (let k = 1; k < 10; k++) s += ln(x, 6 + k * 8, x + 10, 6 + k * 8, 1); x += 14; }
    for (let i = 0; i < o; i++) s += rect(x + 4 + (i % 3) * 13, 62 - Math.floor(i / 3) * 13, 11, 11);
    x += 50; return svg(x + 44, 92, s + box(x, 30, 40, 34));
  }
  function pvDisks(h, t, o) {
    let s = '', x = 22;
    const put = (n, lab) => { for (let i = 0; i < n; i++) { s += circ(x + (i % 2) * 30, 22 + Math.floor(i / 2) * 30, 13) + txt(x + (i % 2) * 30, 27 + Math.floor(i / 2) * 30, lab, lab.length > 2 ? 10 : 12, 'middle'); } x += n > 1 ? 70 : 40; };
    put(h, '100'); put(t, '10'); put(o, '1');
    return svg(x + 50, 112, s + box(x, 36, 44, 34));
  }
  function pvChart(n, ask) {
    const d = String(n).padStart(3, '0').split(''); const heads = ['H', 'T', 'O']; let s = '';
    heads.forEach((hd, i) => { s += rect(8 + i * 46, 4, 46, 32, GREY, 1.5) + txt(31 + i * 46, 26, hd, 18, 'middle', 700) + rect(8 + i * 46, 36, 46, 46); s += ask === i ? box(18 + i * 46, 44, 26, 30) : txt(31 + i * 46, 68, d[i], 24, 'middle'); });
    return svg(156, 88, s);
  }
  function analogClock(h, m, x = 50, y = 50, rr = 44) {
    const ma = (m / 60) * 2 * Math.PI, ha = ((h % 12) / 12 + m / 720) * 2 * Math.PI; let t = '';
    for (let i = 0; i < 12; i++) { const a = i / 12 * 2 * Math.PI; t += ln(x + (rr - 8) * Math.sin(a), y - (rr - 8) * Math.cos(a), x + (rr - 2) * Math.sin(a), y - (rr - 2) * Math.cos(a), 2); }
    return circ(x, y, rr, '#fff', 2.5) + t + `<line x1="${x}" y1="${y}" x2="${x + rr * 0.52 * Math.sin(ha)}" y2="${y - rr * 0.52 * Math.cos(ha)}" stroke="#000" stroke-width="4" stroke-linecap="round"/>` +
      `<line x1="${x}" y1="${y}" x2="${x + rr * 0.8 * Math.sin(ma)}" y2="${y - rr * 0.8 * Math.cos(ma)}" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>`;
  }
  const hhmm = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
  function minutesFor(v, r) { if (/hour/.test(v) && !/half|quarter/.test(v)) return 0; if (/half/.test(v)) return 30; if (/quarter|15/.test(v)) return pickOf(r, [15, 45]); if (/1min|minute/.test(v)) return int(r, 1, 59); return int(r, 1, 11) * 5; }
  function coins(r, n = 4) { const v = [1, 5, 10, 25]; let s = ''; for (let i = 0; i < n; i++) { const c = v[int(r, 0, 3)]; s += circ(24 + i * 36, 34, c === 25 ? 16 : c === 5 ? 14 : 12) + txt(24 + i * 36, 40, c + '¢', 13, 'middle'); } return s; }
  function notes(r, n = 3) { let s = ''; for (let i = 0; i < n; i++) { const v = pickOf(r, [1, 5, 10, 20]); s += rect(8 + i * 62, 14, 56, 30) + txt(36 + i * 62, 35, '$' + v, 16, 'middle', 700); } return s; }
  function shape(kind, cx, cy, sz = 26, fill = 'none') {
    if (kind === 'tri') return `<polygon points="${cx},${cy - sz} ${cx + sz},${cy + sz * 0.8} ${cx - sz},${cy + sz * 0.8}" fill="${fill}" stroke="#000" stroke-width="2.5"/>`;
    const poly = (w, h) => `<polygon points="${cx - w},${cy - h} ${cx + w},${cy - h} ${cx + w},${cy + h} ${cx - w},${cy + h}" fill="${fill}" stroke="#000" stroke-width="2.5"/>`;
    if (kind === 'sq') return poly(sz * 0.85, sz * 0.85);
    if (kind === 'circ') return `<circle cx="${cx}" cy="${cy}" r="${sz * 0.9}" fill="${fill}" stroke="#000" stroke-width="2.5"/>`;
    if (kind === 'rect') return poly(sz * 1.2, sz * 0.7);
    const pts = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; pts.push(`${cx + sz * Math.cos(a)},${cy + sz * Math.sin(a)}`); }
    return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="#000" stroke-width="2.5"/>`;
  }
  function cube(x, y, w = 60, h = 46, d = 22) { return `<rect x="${x}" y="${y + d}" width="${w}" height="${h}" fill="none" stroke="#000" stroke-width="2.5"/><polygon points="${x},${y + d} ${x + d},${y} ${x + d + w},${y} ${x + w},${y + d}" fill="none" stroke="#000" stroke-width="2.5"/><polygon points="${x + w},${y + d} ${x + w + d},${y} ${x + w + d},${y + h} ${x + w},${y + d + h}" fill="none" stroke="#000" stroke-width="2.5"/>`; }
  function grid(cols, rows, x0 = 8, y0 = 8, c = 14) { let s = ''; for (let i = 0; i <= cols; i++) s += ln(x0 + i * c, y0, x0 + i * c, y0 + rows * c, 1); for (let j = 0; j <= rows; j++) s += ln(x0, y0 + j * c, x0 + cols * c, y0 + j * c, 1); return s; }
  function coordGrid(pts, poly) {
    let s = grid(8, 6, 20, 6, 16) + ln(20, 102, 152, 102, 2.5) + ln(20, 6, 20, 102, 2.5);
    for (let i = 0; i <= 8; i += 2) s += txt(20 + i * 16, 118, i, 12, 'middle');
    if (poly) s += `<polygon points="${pts.map(([x, y]) => `${20 + x * 16},${102 - y * 16}`).join(' ')}" fill="${GREY}" stroke="#000" stroke-width="2"/>`;
    else pts.forEach(([x, y]) => { s += circ(20 + x * 16, 102 - y * 16, 5, '#000'); });
    return s;
  }
  function bars(r, n = 4) { let b = ''; for (let i = 0; i < n; i++) { const h = int(r, 2, 6) * 10; b += rect(28 + i * 32, 84 - h, 22, h, i === 1 ? GREY : '#fff'); } return ln(18, 84, 166, 84) + ln(18, 8, 18, 84) + b; }
  function tallyMarks(n, x0 = 10, y = 14) { let s = '', x = x0; for (let i = 0; i < n; i++) { if (i % 5 === 4) { s += ln(x - 36, y + 30, x - 2, y + 2, 2.5); x += 12; } else { s += ln(x, y, x, y + 32, 2.5); x += 8; } } return { s, x }; }

  // ---- maths words: each card draws its own word with a small picture
  const WORDS = {
    operations: { K: ['plus', '2 + 1'], 1: ['add', '4 + 3'], 2: ['difference', '9 − 4'], 3: ['product', '3 × 4'], 4: ['quotient', '12 ÷ 3'], 5: ['factor', '2 × 6'], 6: ['exponent', '2³'] },
    counting: { K: ['more', 'dots'], 1: ['tens', 'rods'], 2: ['hundreds', 'flats'], 3: ['round', '47 → 50'] },
    geometry: { K: ['circle', 'circ'], 1: ['triangle', 'tri'], 2: ['hexagon', 'hex'], 3: ['quadrilateral', 'sq'], 4: ['right angle', 'angle'], 5: ['vertex', 'cube'], 6: ['area', 'rect'] },
    data: { K: ['sort', 'sort'], 1: ['tally', 'tally'], 2: ['bar graph', 'bars'], 3: ['scale', 'bars'], 4: ['line plot', 'plot'], 5: ['coordinate', 'pt'], 6: ['median', 'list'] },
    algebra: { K: ['pattern', 'pat'], 1: ['equal', '3 + 2 = 5'], 2: ['even', '6'], 3: ['unknown', '□ + 4 = 9'], 4: ['multiple', '4, 8, 12'], 5: ['expression', '3 × (2 + 4)'], 6: ['variable', 'x + 5'] },
    measurement: { K: ['longer', 'len'], 1: ['hour', 'clock'], 2: ['inch', 'ruler'], 3: ['perimeter', 'rect'], 4: ['angle', 'angle'], 5: ['volume', 'cube'], 6: ['unit rate', '60 per 1'] },
    fractions: { 2: ['half', 'half'], 3: ['numerator', '3/4'], 4: ['equivalent', '1/2 = 2/4'], 5: ['denominator', '2/5'], 6: ['ratio', '3 : 4'] },
    all: { K: ['count', 'dots'], 1: ['sum', '3 + 4 = 7'], 2: ['digit', '347'], 3: ['array', 'array'], 4: ['factor', '3 × 4'], 5: ['decimal', '0.25'], 6: ['integer', '−3'] },
  };
  function wordCard(s) {
    const m = s.v.match(/vocab_grade_([K\d])(?:_(\w+))?/) || []; const g = m[1] || 'K'; const topic = m[2] || 'all';
    const bank = WORDS[topic] || WORDS.all; const w = bank[g] || Object.values(bank)[0];
    const [word, pic] = w; let p = '';
    const px = 150;
    if (pic === 'dots') p = dotsRow(5, px, 40, 14, '#000');
    else if (pic === 'rods') { for (let i = 0; i < 3; i++) { p += rect(px + i * 16, 6, 10, 64); for (let k = 1; k < 8; k++) p += ln(px + i * 16, 6 + k * 8, px + i * 16 + 10, 6 + k * 8, 1); } }
    else if (pic === 'flats') { p = rect(px, 8, 60, 60); for (let k = 1; k < 10; k++) p += ln(px + k * 6, 8, px + k * 6, 68, 0.8) + ln(px, 8 + k * 6, px + 60, 8 + k * 6, 0.8); }
    else if (['circ', 'tri', 'hex', 'sq', 'rect'].includes(pic)) p = shape(pic, px + 30, 40, 22);
    else if (pic === 'angle') p = ln(px, 62, px + 60, 62, 2.5) + ln(px, 62, px, 12, 2.5) + rect(px, 50, 12, 12, 'none', 1.5);
    else if (pic === 'cube') p = cube(px, 8, 44, 34, 16) + circ(px + 16, 8, 4, '#000');
    else if (pic === 'tally') p = tallyMarks(6, px, 20).s;
    else if (pic === 'bars') p = place(bars(rng(word)), px - 14, -4, 0.55);
    else if (pic === 'plot') p = ln(px, 56, px + 70, 56) + txt(px + 14, 46, '×', 16, 'middle') + txt(px + 14, 34, '×', 16, 'middle') + txt(px + 40, 46, '×', 16, 'middle');
    else if (pic === 'pt') p = grid(5, 4, px, 12, 12) + circ(px + 36, 36, 4, '#000');
    else if (pic === 'list') p = txt(px, 46, '2 5 7 8 9', 16) + `<circle cx="${px + 30}" cy="41" r="10" fill="none" stroke="#000" stroke-width="2"/>`;
    else if (pic === 'pat') p = shape('circ', px + 10, 40, 10) + shape('sq', px + 36, 40, 10) + shape('circ', px + 62, 40, 10) + box(px + 78, 26, 26, 28);
    else if (pic === 'len') p = rect(px, 22, 80, 12, GREY) + rect(px, 46, 50, 12);
    else if (pic === 'clock') p = analogClock(3, 0, px + 34, 40, 30);
    else if (pic === 'ruler') { p = rect(px, 34, 90, 22); for (let i = 0; i <= 6; i++) p += ln(px + 6 + i * 13, 34, px + 6 + i * 13, i % 2 ? 42 : 48, 1.5); }
    else if (pic === 'half') p = circ(px + 30, 40, 24) + `<path d="M${px + 30} 16 a24 24 0 0 1 0 48z" fill="${GREY}" stroke="#000" stroke-width="2"/>`;
    else if (pic === 'sort') p = shape('circ', px + 12, 30, 10) + shape('circ', px + 12, 56, 10) + shape('tri', px + 56, 34, 12) + ln(px + 34, 12, px + 34, 70, 1.5, '4 3');
    else if (pic === 'array') p = arrayDots(2, 4, false).replace(/<svg[^>]*>|<\/svg>/g, '').replace(/cx="(\d+)/g, (a, x) => `cx="${Number(x) + px}`).replace(/cy="(\d+)/g, (a, y) => `cy="${Number(y) + 20}`);
    else if (pic === 'half' || /^\d+\/\d+$/.test(pic)) { const [n, d] = pic.split('/'); p = frac(px + 30, 42, n, d); }
    else p = txt(px, 46, pic.replace(/(\d)\/(\d)/g, '$1⁄$2'), 18);
    return svg(262, 80, txt(8, 34, word, word.length > 11 ? 18 : 24, 'start', 700) + ln(8, 46, 130, 46, 1.5) + txt(8, 70, 'means …', 15) + p);
  }

  // ---------------------------------------------------------------- which drawing for which skill
  function kindOf(s) {
    const c = s.c, v = s.v, L = (s.l || '').toLowerCase();
    const any = (re) => re.test(v) || re.test(L);
    if (c === 'vocabulary') return 'words';
    const ALLS = { placevalue_all: 'pool-placevalue', patterns_all: 'pool-patterns', algebra_all: 'pool-algebra', order_ops_all: 'pool-oop', number_sense_all: 'pool-number-sense', number_theory_all: 'pool-number-theory', fractions_all: 'pool-fraction-ops', decimals_all: 'pool-decimals', conversions_all: 'pool-conversions', measurement_all: 'pool-measurement', geometry_all: 'pool-shapes', data_stats_all: 'pool-data_mixed', counting_all: 'pool-counting_mixed' };
    if (ALLS[v]) return ALLS[v];
    if (c === 'all_mixed' || c === 'algebra_mixed' || c === 'frac_dec_mixed' || c === 'geo_mixed' || c === 'data_mixed' || c === 'counting_mixed' || v === 'operations_all' || v === 'mixed') return 'pool-' + c;
    switch (c) {
      case 'addition':
        if (v === 'add_sub_10s') return 'add-sub-tens';
        if (v === 'add_sub_100s') return 'add-sub-hundreds';
        if (/fact_family|number_families/.test(v)) return 'fact-family';
        if (v === 'fact_family_sort') return 'fact-family-sort';
        if (v === 'add_three') return 'add-three';
        if (v === 'comparison_word') return 'story-compare';
        if (v === 'equal_sign') return 'true-false';
        if (v === 'add_5_pictures') return 'pics-add';
        if (/^add_wp|add_word/.test(v)) return 'story-add';
        if (/nl_add|number_line_add/.test(v)) return 'nl-add';
        if (v === 'cloze_addition') return 'missing-addend';
        if (v === 'add_missing_digit') return 'stack-add-missing';
        if (v === 'add_column_multi') return 'stack-add-multi';
        if (v === 'mixed_addition') return 'pool-addition';
        if ((bound(s) || 20) >= 100) return 'stack-add';
        return 'eq-add';
      case 'subtraction':
        if (v === 'missing_add_sub') return 'missing-sub';
        if (v === 'sub_5_pictures') return 'pics-sub';
        if (v === 'unknown_start_wp' || v === 'sub_wp_start_unknown') return 'story-sub-start';
        if (v === 'sub_wp_compare') return 'story-compare';
        if (/^sub_wp|sub_word/.test(v)) return 'story-sub';
        if (/nl_sub|number_line_sub/.test(v)) return 'nl-sub';
        if (v === 'sub_missing_digit') return 'stack-sub-missing';
        if (v === 'sub_check_by_adding') return 'sub-check';
        if (v === 'sub_across_zeros') return 'stack-sub-zeros';
        if (v === 'mixed_add_sub') return 'pool-add-sub';
        if (v === 'mixed_subtraction') return 'pool-subtraction';
        if ((bound(s) || 20) >= 100) return 'stack-sub';
        return 'eq-sub';
      case 'multiplication':
        if (/^count_by_|^count_by_tables/.test(v)) return 'skip-count';
        if (/array|dot_array|repeated_add/.test(v)) return 'array';
        if (/equal_groups|equal_or_unequal/.test(v)) return 'groups-mult';
        if (/area_model|break_apart/.test(v)) return 'area-model';
        if (/mult_chart/.test(v)) return 'mult-chart';
        if (/fact_family|number_families/.test(v)) return 'fact-family-mult';
        if (/word_problems/.test(v)) return 'story-mult';
        if (/comparison/.test(v)) return 'story-mult-compare';
        if (v === 'mult_properties') return 'mult-properties';
        if (/column|standard|^multiply$/.test(v)) return 'stack-mult';
        if (v === 'nl_mult') return 'nl-mult';
        if (/zeros|placeholder|multiples_of_ten|by_ten|by_hundred/.test(v)) return 'mult-tens';
        if (v === 'mult_missing_digit') return 'stack-mult-missing';
        if (v === 'mixed_multiplication') return 'pool-multiplication';
        return 'eq-mult';
      case 'division':
        if (/long|box_division|^divide$|zero_in_quotient|fix_estimate/.test(v)) return 'long-div';
        if (/area_model/.test(v)) return 'area-model-div';
        if (/remainder/.test(v)) return /interpret|contexts/.test(v) ? 'story-remainder' : 'div-remainder';
        if (/word_problems/.test(v)) return /grouping/.test(v) ? 'story-div-group' : 'story-div';
        if (v === 'share_into_groups') return 'groups-div';
        if (v === 'missing_mult_div' || v === 'div_equation_parts') return 'missing-div';
        if (v === 'div_check_by_multiplying') return 'div-check';
        if (v === 'nl_div') return 'nl-div';
        if (/mixed/.test(v)) return 'pool-division';
        return 'eq-div';
      case 'number_ops_mixed':
        if (/word_problems/.test(v)) return 'story-mixed';
        if (v === 'number_families_mixed') return 'fact-family-mult';
        if (v === 'which_sign') return 'which-sign';
        if (v === 'missing_factor_or_addend') return 'missing-either';
        return 'pool-ops';
      case 'integers':
        if (/compare/.test(v)) return 'int-compare';
        if (/order|ordering/.test(v)) return 'int-order';
        if (/abs/.test(v)) return 'int-abs';
        if (/opposite/.test(v)) return 'int-opposite';
        if (/add/.test(v)) return 'int-add';
        if (/sub/.test(v)) return 'int-sub';
        if (/mixed/.test(v)) return 'pool-integers';
        return 'int-nl';
      case 'fractions':
        if (/nl|numline|number_line|drag/.test(v)) return 'frac-nl';
        if (/of_set/.test(v)) return 'frac-set';
        if (/equiv|equivalent/.test(v)) return 'frac-equiv';
        if (/compare|benchmark/.test(v)) return 'frac-compare';
        if (/order/.test(v)) return 'frac-order';
        if (/simplify/.test(v)) return 'frac-simplify';
        if (/improper|mixed_fractions/.test(v)) return 'frac-mixed-number';
        if (/round/.test(v)) return 'frac-round';
        if (/graph/.test(v)) return 'frac-nl';
        if (/bar_ops|compose_target/.test(v)) return 'frac-bar-add';
        if (/shade/.test(v)) return 'frac-shade';
        return 'frac-bar';
      case 'fraction_operations':
        if (/word/.test(v)) return /mult/.test(v) ? 'story-frac-mult' : /div/.test(v) ? 'story-frac-div' : 'story-frac';
        if (/mult_frac_whole/.test(v)) return 'frac-times-whole';
        if (/mult_frac_frac/.test(v)) return 'frac-times-frac';
        if (/scaling/.test(v)) return 'frac-scaling';
        if (/div_unit|unit_frac_div|whole_div_unit/.test(v)) return 'frac-div';
        if (/as_div/.test(v)) return 'frac-as-div';
        if (/decompose/.test(v)) return 'frac-decompose';
        if (/10_100/.test(v)) return 'frac-tenths';
        if (/estimate/.test(v)) return 'frac-estimate';
        if (/mixed_like|mixed_unlike/.test(v)) return /^sub/.test(v) ? 'frac-sub-mixed' : 'frac-add-mixed';
        if (/^sub/.test(v)) return /_nv/.test(v) ? 'frac-sub' : 'frac-sub-bars';
        if (/^add/.test(v)) return /_nv/.test(v) ? 'frac-add' : 'frac-add-bars';
        return 'pool-fraction-ops';
      case 'decimals':
        if (/nl/.test(v)) return 'dec-nl';
        if (/compare/.test(v)) return 'dec-compare';
        if (/order/.test(v)) return 'dec-order';
        if (/round/.test(v)) return 'dec-round';
        if (/add/.test(v)) return 'dec-add';
        if (/sub/.test(v)) return 'dec-sub';
        if (/mult/.test(v)) return 'dec-mult';
        if (/div/.test(v)) return 'dec-div';
        return 'pool-decimals';
      case 'conversions':
        if (v === 'percent_visual') return 'percent-grid';
        if (/percent_of/.test(v)) return 'percent-of';
        if (/whole_from/.test(v)) return 'percent-whole';
        if (/double_num/.test(v)) return 'double-nl';
        if (/ratio_tables|equiv_ratios|equivalent_or_not/.test(v)) return 'ratio-table';
        if (/ratio/.test(v)) return 'ratio-write';
        if (/unit_rate/.test(v)) return 'unit-rate';
        if (/order_fdp/.test(v)) return 'fdp-order';
        if (/^[fdp]_to_[fdp]$/.test(v)) return 'convert-' + v;
        return 'pool-conversions';
      case 'shapes_early':
        if (/3d/.test(v)) return 'solid-name';
        if (/edges_faces/.test(v)) return 'solid-count';
        if (/positions/.test(v)) return 'positions';
        if (/corners|sides_vertices/.test(v)) return 'corners';
        if (/order_objects_length/.test(v)) return 'length-order';
        if (/nonstandard/.test(v)) return 'nonstandard';
        if (/hexagon/.test(v)) return 'compose-hex';
        if (/rect_from_squares/.test(v)) return 'compose-rect';
        if (/compose_shapes/.test(v)) return 'compose';
        if (/partition/.test(v)) return 'partition';
        if (/attributes/.test(v)) return 'attributes';
        if (/mixed/.test(v)) return 'pool-shapes';
        return 'shapes-name';
      case 'area_perimeter':
        if (/volume/.test(v)) return 'volume';
        if (/triangle/.test(v)) return 'area-triangle';
        if (/composite|decompose|polygon/.test(v)) return 'area-composite';
        if (/unit_squares|perimeter_grid|distributive/.test(v)) return 'area-grid';
        if (/perimeter/.test(v)) return 'perimeter';
        if (/mixed/.test(v)) return 'pool-area';
        return 'area-rect';
      case 'angles_lines':
        if (/lines/.test(v) && !/symmetry/.test(v)) return 'lines';
        if (/symmetry/.test(v)) return 'symmetry';
        if (/measure/.test(v)) return 'angle-measure';
        if (/additive|right_angle|straight|around/.test(v)) return 'angle-missing';
        if (/mixed/.test(v)) return 'pool-angles';
        return 'angle-name';
      case 'shapes_classify':
        if (/net/.test(v)) return 'net';
        if (/cross/.test(v)) return 'solid-count';
        if (/tri/.test(v)) return 'classify-tri';
        if (/mixed/.test(v)) return 'pool-shapes';
        return 'classify-quad';
      case 'coordinates':
        if (/reflect/.test(v)) return 'transform-reflect';
        if (/rotate/.test(v)) return 'transform-rotate';
        if (/translate/.test(v)) return 'transform-translate';
        if (/polygon|distance/.test(v)) return 'coord-polygon';
        if (/net_surface/.test(v)) return 'net';
        if (/mixed/.test(v)) return 'pool-coordinates';
        return 'coord-point';
      case 'measurement':
        if (v === 'mixed_time') return 'pool-time';
        if (/pictograph/.test(v)) return 'pictograph';
        if (/bar_graph/.test(v)) return 'bar-graph';
        if (/elapsed_visual|elapsed_find_duration/.test(v)) return 'clock-elapsed';
        if (/elapsed/.test(v)) return 'clock-later';
        if (/order_clocks_digital/.test(v)) return 'digital-order';
        if (/order_clocks/.test(v)) return 'clock-order';
        if (/time_sense/.test(v)) return 'am-pm';
        if (/clock_parts|clock_hands/.test(v)) return 'clock-parts';
        if (/fives/.test(v)) return 'clock-fives';
        if (/time|clock/.test(v)) return 'clock';
        if (/notes|bills/.test(v) && !/coins/.test(v)) return 'notes';
        if (/money|coin|change|enough/.test(v)) return /words/.test(v) ? 'money-words' : 'coins';
        if (/ruler|estimate_length/.test(v)) return 'ruler';
        if (/temperature/.test(v)) return 'thermometer';
        if (/capacity|mass_volume/.test(v)) return 'jug';
        if (/heavier/.test(v)) return 'balance';
        if (/convert|conversion|length_customary|length_metric/.test(v)) return /word/.test(v) ? 'story-convert' : 'convert';
                return 'pool-measurement';
      case 'graphs':
        if (/tally/.test(v)) return 'tally';
        if (/pictograph/.test(v)) return 'pictograph';
        if (/line_plot/.test(v)) return 'line-plot';
        if (/pie/.test(v)) return 'pie';
        if (/bar/.test(v)) return 'bar-graph';
        return 'pool-graphs';
      case 'data_analysis':
        if (/box_plot/.test(v)) return 'box-plot';
        if (/histogram/.test(v)) return 'histogram';
        if (/statistical/.test(v)) return 'stat-question';
        if (/mixed/.test(v)) return 'pool-data';
        return 'data-list';
      case 'probability': return 'spinner';
      case 'patterns':
        if (/shape_pattern/.test(v)) return 'shape-pattern';
        if (/double|halve/.test(v)) return 'double-halve';
        if (/skip_count_line/.test(v)) return 'nl-skip';
        if (/grid/.test(v)) return 'hundred-grid';
        if (/relationship|rule/.test(v)) return 'function-table';
        if (/mixed/.test(v)) return 'pool-patterns';
        return 'skip-count';
      case 'algebra':
        if (/tape/.test(v)) return 'tape';
        if (/balance/.test(v)) return 'balance-eq';
        if (/function_table/.test(v)) return 'function-table';
        if (/inequal/.test(v)) return 'inequality';
        if (/combine/.test(v)) return 'like-terms';
        if (/distributive|factor_out/.test(v)) return 'distributive';
        if (/evaluate/.test(v)) return 'evaluate';
        if (/write_expression|build_expr/.test(v)) return 'write-expression';
        if (/word|story/.test(v)) return 'story-algebra';
        if (/write_equation/.test(v)) return 'story-algebra';
        if (/mixed/.test(v)) return 'pool-algebra';
        return 'solve-eq';
      case 'order_of_operations':
        if (/exponent|square|cube/.test(v)) return 'exponent';
        if (/compare/.test(v)) return 'oop-compare';
        if (/paren|nested|hard/.test(v)) return 'oop-paren';
        if (/mixed/.test(v)) return 'pool-oop';
        return 'oop';
      case 'placevalue':
        if (/disks/.test(v)) return 'pv-disks';
        if (/digit_drag|identify/.test(v)) return 'pv-chart';
        if (/more_less/.test(v)) return 'pv-more-less';
        if (/word_names/.test(v)) return 'pv-words';
        if (/10x/.test(v)) return 'pv-times-ten';
        if (/digit_value|^value$/.test(v)) return 'pv-digit-value';
        if (/unit_form/.test(v)) return 'pv-unit-form';
        if (v === 'combine') return 'pv-standard';
        if (/expand/.test(v)) return 'pv-expanded';
        if (/compare/.test(v)) return 'pv-compare';
        if (/order/.test(v)) return 'pv-order';
        return 'pool-placevalue';
      case 'number_sense':
        if (/estimate|reasonable/.test(v)) return 'estimate';
        if (/round_sort/.test(v)) return 'round-sort';
        if (/round|nearest/.test(v)) return 'round-nl';
        if (/make_a_ten/.test(v)) return 'make-ten';
        if (/doubles/.test(v)) return 'near-doubles';
        if (/compensation/.test(v)) return 'compensation';
        if (/between|place_on/.test(v)) return 'nl-place';
        return 'pool-number-sense';
      case 'number_theory':
        if (/tchart/.test(v)) return 't-chart';
        if (/links/.test(v)) return 'factor-links';
        if (/prime/.test(v)) return 'prime';
        if (/multiples/.test(v)) return 'multiples';
        if (/gcf|common_factors/.test(v)) return 'gcf';
        if (/lcm/.test(v)) return 'lcm';
        if (/divisib/.test(v)) return 'div-sort';
        if (/factors_identify/.test(v)) return 'factors';
        return 'pool-number-theory';
      case 'counting':
        if (/sequence|seq_fill/.test(v)) return /fill/.test(v) ? 'number-grid' : 'count-next';
        if (/mixed/.test(v)) return 'pool-counting';
        return 'count-objects';
      case 'comparing':
        if (/compare_groups/.test(v)) return 'compare-groups';
        if (/compare_objects/.test(v)) return 'length-compare';
        if (/classify/.test(v)) return 'classify';
        return 'pool-comparing';
      case 'composing':
        if (/number_bonds/.test(v)) return 'number-bond';
        if (/make_ten/.test(v)) return 'make-ten';
        if (/teen/.test(v)) return 'teen-frames';
        if (/tens_foundation/.test(v)) return 'rods';
        if (/hundreds_chart|number_chart/.test(v)) return 'number-grid';
        if (/ten_frame/.test(v)) return 'ten-frame';
        if (/base10_build_hundreds/.test(v)) return 'flats';
        if (/base10/.test(v)) return 'rods';
        if (/odd_even/.test(v)) return 'odd-even';
        if (/even_odd/.test(v)) return 'odd-even-select';
        if (/word_form|in_words/.test(v)) return 'number-words';
        if (/fraction_number_line/.test(v)) return 'frac-nl';
        if (/whole_as_fraction|compose_whole/.test(v)) return 'frac-whole';
        return 'pool-composing';
    }
    if (any(/time|clock/)) return 'clock';
    return 'unknown';
  }

  // ---------------------------------------------------------------- the drawings
  const D = {
    'eq-add': (r, s) => { const [a, b] = addPair(r, bound(s) || 20, regroupOf(s.v)); return line([`${a} + ${b} =`, null]); },
    'eq-sub': (r, s) => { const [a, b] = subPair(r, bound(s) || 20, regroupOf(s.v)); return line([`${a} − ${b} =`, null]); },
    'stack-add': (r, s) => { const [a, b] = addPair(r, bound(s) || 100, regroupOf(s.v)); return stack(a, '+', b); },
    'stack-sub': (r, s) => { const [a, b] = subPair(r, bound(s) || 100, regroupOf(s.v)); return stack(a, '−', b); },
    'stack-add-missing': (r) => stack(int(r, 31, 68), '+', int(r, 12, 29), 'b'),
    'stack-sub-missing': (r) => stack(int(r, 61, 98), '−', int(r, 12, 39), 'b'),
    'stack-sub-zeros': (r) => stack(int(r, 1, 9) * 100, '−', int(r, 12, 89)),
    'stack-add-multi': (r) => { const a = int(r, 12, 49), b = int(r, 12, 49), c = int(r, 12, 49); return svg(130, 150, txt(100, 32, a, 28, 'end') + txt(100, 64, b, 28, 'end') + txt(100, 96, c, 28, 'end') + txt(14, 96, '+', 28) + ln(10, 106, 110, 106) + box(40, 112, 64, 32)); },
    'stack-mult': (r, s) => { const v = s.v; const a = /2by2|2by2_standard/.test(v) ? int(r, 12, 49) : /3by1/.test(v) ? int(r, 112, 489) : int(r, 12, 89); const b = /2by2/.test(v) ? int(r, 12, 39) : int(r, 3, 9); return stack(a, '×', b); },
    'stack-mult-missing': (r) => stack(int(r, 12, 49), '×', int(r, 3, 9), 'a'),
    'eq-mult': (r) => line([`${int(r, 2, 9)} × ${int(r, 2, 9)} =`, null]),
    'eq-div': (r) => { const b = int(r, 2, 9), q = int(r, 2, 9); return line([`${b * q} ÷ ${b} =`, null]); },
    'add-sub-tens': (r) => { const a = int(r, 2, 8) * 10 + int(r, 1, 9); return lines([[`${a} + 10 =`, null], [`${a} − 10 =`, null]]); },
    'add-sub-hundreds': (r) => { const a = int(r, 2, 8) * 100 + int(r, 11, 99); return lines([[`${a} + 100 =`, null], [`${a} − 100 =`, null]]); },
    'add-three': (r) => line([`${int(r, 2, 6)} + ${int(r, 2, 6)} + ${int(r, 1, 6)} =`, null]),
    'missing-addend': (r) => { const a = int(r, 3, 9), b = int(r, 2, 9); return line([`${a} +`, null, `= ${a + b}`]); },
    'missing-sub': (r) => { const b = int(r, 2, 9), c = int(r, 2, 9); return lines([[null, `− ${b} = ${c}`], [`${b + c} −`, null, `= ${c}`]]); },
    'missing-either': (r) => { const a = int(r, 3, 9), b = int(r, 2, 6); return lines([[`${a} +`, null, `= ${a + b}`], [`${a} ×`, null, `= ${a * b}`]]); },
    'missing-div': (r) => { const b = int(r, 2, 9), q = int(r, 2, 9); return lines([[null, `÷ ${b} = ${q}`], [`${b} ×`, null, `= ${b * q}`]]); },
    'true-false': (r) => { const a = int(r, 2, 9), b = int(r, 2, 9); return svg(250, 56, txt(8, 36, `${a} + ${b} = ${a + b + pickOf(r, [0, 1])}`, 24) + `<rect x="150" y="12" width="44" height="34" rx="17" fill="none" stroke="#000" stroke-width="2"/>` + txt(172, 35, 'T', 18, 'middle') + `<rect x="200" y="12" width="44" height="34" rx="17" fill="none" stroke="#000" stroke-width="2"/>` + txt(222, 35, 'F', 18, 'middle')); },
    'which-sign': (r) => { const a = int(r, 3, 9), b = int(r, 2, 3); return line([`${a}`, null, `${b} = ${a * b}`]); },
    'fact-family': (r) => { const a = int(r, 2, 9), b = int(r, 2, 9); return svg(240, 110, `<polygon points="50,8 92,94 8,94" fill="none" stroke="#000" stroke-width="2.5"/>` + txt(50, 46, a + b, 20, 'middle') + txt(26, 86, a, 18, 'middle') + txt(74, 86, b, 18, 'middle') + txt(104, 30, `${a} + ${b} =`, 17) + box(186, 10, 26, 26) + txt(104, 66, `${a + b} − ${b} =`, 17) + box(186, 46, 26, 26) + txt(104, 100, '+ 2 more', 15)); },
    'fact-family-mult': (r) => { const a = int(r, 2, 9), b = int(r, 2, 9); return svg(240, 110, `<polygon points="50,8 92,94 8,94" fill="none" stroke="#000" stroke-width="2.5"/>` + txt(50, 46, a * b, 20, 'middle') + txt(26, 86, a, 18, 'middle') + txt(74, 86, b, 18, 'middle') + txt(104, 30, `${a} × ${b} =`, 17) + box(186, 10, 26, 26) + txt(104, 66, `${a * b} ÷ ${b} =`, 17) + box(186, 46, 26, 26) + txt(104, 100, '+ 2 more', 15)); },
    'fact-family-sort': (r) => { const a = int(r, 2, 9), b = int(r, 2, 9); return svg(240, 90, txt(8, 28, `${a} + ${b} = ${a + b}`, 18) + txt(8, 56, `${a + b} − ${a} = ${b}`, 18) + txt(8, 84, `${a + b} − ${b + 1} = ${a - 1}`, 18) + txt(160, 50, 'family?', 16) + box(170, 58, 26, 26)); },
    'pics-add': (r) => { const a = int(r, 1, 3); return pics(a, int(r, 1, 5 - a), '+'); },
    'pics-sub': (r) => { const a = int(r, 3, 5); return pics(a, int(r, 1, a - 1), '−'); },
    'story-add': (r, s) => { const [a, b] = addPair(r, bound(s) || 20); return story([`Ana has ${fmt(a)} shells.`, `She finds ${fmt(b)} more.`, 'How many shells now?']); },
    'story-sub': (r, s) => { const [a, b] = subPair(r, bound(s) || 20); return story([`Ana has ${fmt(a)} shells.`, `She gives ${fmt(b)} away.`, 'How many are left?']); },
    'story-sub-start': (r) => { const b = int(r, 2, 9), c = int(r, 3, 12); return story(['Ana had some shells.', `She gave ${b} away.`, `Now she has ${c}.`, 'How many at the start?']); },
    'story-compare': (r) => { const a = int(r, 8, 19), b = int(r, 2, 7); return story([`Ana has ${a} shells.`, `Ben has ${b} shells.`, 'How many more has Ana?']); },
    'story-mult': (r) => { const a = int(r, 3, 6), b = int(r, 2, 9); return story([`There are ${a} bags.`, `Each bag has ${b} apples.`, 'How many apples?']); },
    'story-mult-compare': (r) => { const a = int(r, 2, 5), b = int(r, 3, 9); return story([`Ben has ${b} cards.`, `Ana has ${a} times as many.`, 'How many has Ana?']); },
    'story-div': (r) => { const b = int(r, 2, 6), q = int(r, 2, 9); return story([`${b * q} cookies are shared`, `equally by ${b} children.`, 'How many each?']); },
    'story-div-group': (r) => { const b = int(r, 2, 6), q = int(r, 2, 9); return story([`${b * q} pupils sit in groups`, `of ${b}.`, 'How many groups?']); },
    'story-remainder': (r) => { const b = int(r, 3, 6), q = int(r, 2, 8), rem = int(r, 1, b - 1); return story([`${b * q + rem} pupils, ${b} in each car.`, 'How many cars are needed?']); },
    'story-mixed': (r) => story([`A box holds ${int(r, 4, 9)} pens.`, `Sam buys ${int(r, 2, 5)} boxes and`, `gives ${int(r, 2, 6)} pens away.`, 'How many pens are left?']),
    'story-frac': () => story(['Mia ate 2/8 of a pizza.', 'Leo ate 3/8.', 'How much did they eat?']),
    'story-frac-mult': () => story(['A ribbon is 3/4 m long.', 'Ana uses 2/3 of it.', 'How long is that?']),
    'story-frac-div': () => story(['3 pizzas are shared by', '4 friends equally.', 'How much each?']),
    'story-convert': () => story(['A rope is 3 yards long.', 'How many feet is that?']),
    'story-algebra': (r) => { const n = int(r, 3, 9); return story([`A number plus ${n} is ${n + int(r, 5, 12)}.`, 'Write an equation', 'and find the number.']); },
    'nl-add': (r) => { const a = int(r, 1, 5), b = int(r, 2, 4); return svg(240, 116, nline(0, 10, { hop: [a, a + b] }).replace(/<svg[^>]*>|<\/svg>/g, '') + txt(20, 106, `${a} + ${b} =`, 20) + box(110, 84, 32, 30)); },
    'nl-sub': (r) => { const a = int(r, 6, 10), b = int(r, 2, 4); return svg(240, 116, nline(0, 10, { hop: [a, a - b] }).replace(/<svg[^>]*>|<\/svg>/g, '') + txt(20, 106, `${a} − ${b} =`, 20) + box(110, 84, 32, 30)); },
    'nl-mult': (r) => { const b = int(r, 2, 3); return svg(240, 116, nline(0, 10, { hop: [0, b] }).replace(/<svg[^>]*>|<\/svg>/g, '') + txt(20, 106, `3 jumps of ${b} =`, 18) + box(160, 84, 32, 30)); },
    'nl-div': () => svg(240, 116, nline(0, 10, { hop: [10, 8] }).replace(/<svg[^>]*>|<\/svg>/g, '') + txt(20, 106, '10 ÷ 2 =', 20) + box(110, 84, 32, 30)),
    'nl-skip': () => nline(0, 50, { mid: 25, hop: [2, 4], box: true }),
    'nl-place': (r) => { const t = int(r, 2, 8); return nline(t * 10, t * 10 + 10, { arrowAt: int(r, 1, 9), box: true }); },
    'skip-count': (r, s) => { const m = s.v.match(/(\d+)s?$/); const step = m && Number(m[1]) <= 12 && !/seq_10|_10s/.test(s.v) ? Number(m[1]) : /seq_10|_10s/.test(s.v) ? 10 : int(r, 2, 9); const st = step * int(r, 1, 3); return seqRow([st, st + step, st + 2 * step, st + 3 * step, st + 4 * step], [3, 4]); },
    'array': (r) => arrayDots(int(r, 2, 4), int(r, 3, 6)),
    'groups-mult': (r) => groups(int(r, 2, 3), int(r, 2, 5), '×'),
    'groups-div': (r) => groups(int(r, 2, 3), int(r, 2, 5), '÷'),
    'area-model': (r) => areaModel(int(r, 12, 89), int(r, 3, 9)),
    'area-model-div': (r) => { const b = int(r, 3, 6); return svg(240, 110, rect(40, 26, 120, 70) + rect(160, 26, 60, 70) + txt(24, 68, b, 20, 'middle') + txt(100, 66, b * 20, 18, 'middle') + txt(190, 66, b * int(r, 2, 6), 18, 'middle') + box(84, 0, 32, 22) + box(174, 0, 32, 22)); },
    'mult-chart': (r) => multChart(r),
    'mult-properties': (r) => { const a = int(r, 2, 9), b = int(r, 2, 9); return line([`${a} × ${b} = ${b} ×`, null]); },
    'mult-tens': (r) => { const a = int(r, 2, 9), b = int(r, 2, 9); return line([`${a} × ${b}0 =`, null]); },
    'long-div': (r, s) => { const b = /3by2/.test(s.v) ? int(r, 12, 29) : int(r, 3, 9); const q = /4by1/.test(s.v) ? int(r, 200, 999) : /3by1|3by2/.test(s.v) ? int(r, 21, 99) : int(r, 11, 29); return longDiv(b * q, b); },
    'div-remainder': (r) => { const b = int(r, 3, 6), q = int(r, 2, 8), rem = int(r, 1, b - 1); return line([`${b * q + rem} ÷ ${b} =`, null, 'r', null], 24); },
    'div-check': (r) => { const b = int(r, 3, 9), q = int(r, 11, 29); return lines([[`${b * q} ÷ ${b} = ${q}`], [`${q} × ${b} =`, null]]); },
    'sub-check': (r) => { const a = int(r, 41, 98), b = int(r, 12, 39); return lines([[`${a} − ${b} = ${a - b}`], [`${a - b} + ${b} =`, null]]); },
    'int-nl': (r) => nline(-5, 5, { mid: 0, point: int(r, 1, 9), box: true }),
    'int-compare': (r) => line([`−${int(r, 2, 9)}`, null, `${int(r, -6, 6)}`.replace('-', '−')]),
    'int-order': (r) => line([`−${int(r, 2, 9)}, ${int(r, 1, 9)}, −${int(r, 1, 5)}, 0 →`, null], 20),
    'int-abs': (r) => line([`|−${int(r, 2, 19)}| =`, null]),
    'int-opposite': (r) => line([`the opposite of ${int(r, 2, 19)} is`, null], 20),
    'int-add': (r) => line([`−${int(r, 2, 9)} + ${int(r, 2, 9)} =`, null]),
    'int-sub': (r) => line([`${int(r, 2, 9)} − ${int(r, 10, 15)} =`, null]),
    'frac-bar': (r) => { const d = int(r, 3, 6), n = int(r, 1, d - 1); let s = ''; for (let i = 0; i < d; i++) s += rect(10 + i * (150 / d), 10, 150 / d, 34, i < n ? GREY : '#fff'); return svg(220, 120, s + txt(14, 82, 'shaded', 18) + fracBox(140, 84)); },
    'frac-shade': (r) => { const d = int(r, 3, 6), n = int(r, 1, d - 1); let s = ''; for (let i = 0; i < d; i++) s += rect(10 + i * (150 / d), 10, 150 / d, 34); return svg(220, 110, s + txt(14, 80, 'Shade', 18) + frac(110, 74, n, d)); },
    'frac-equiv': (r) => { const d = int(r, 2, 4), n = int(r, 1, d - 1); let s = ''; for (let i = 0; i < d; i++) s += rect(10 + i * (120 / d), 8, 120 / d, 24, i < n ? GREY : '#fff'); for (let i = 0; i < 2 * d; i++) s += rect(10 + i * (60 / d), 40, 60 / d, 24, i < 2 * n ? GREY : '#fff'); return svg(240, 110, s + frac(160, 50, n, d) + txt(184, 58, '=', 22) + fracBox(214, 50)); },
    'frac-set': (r) => { const d = int(r, 4, 6), n = int(r, 1, d - 1); let s = ''; for (let i = 0; i < d; i++) s += circ(16 + i * 24, 24, 9, i < n ? GREY : '#fff'); return svg(220, 108, s + txt(10, 78, 'part grey', 18) + fracBox(150, 70)); },
    'frac-compare': (r) => { const d1 = int(r, 3, 8), d2 = int(r, 3, 8); return svg(200, 80, frac(40, 40, int(r, 1, d1 - 1), d1) + box(80, 20, 36, 36) + frac(160, 40, int(r, 1, d2 - 1), d2)); },
    'frac-order': (r) => svg(240, 84, frac(30, 40, 1, 2) + txt(56, 46, ',', 22) + frac(84, 40, 1, 4) + txt(110, 46, ',', 22) + frac(138, 40, 3, 4) + txt(166, 46, '→', 22) + box(196, 20, 34, 34)),
    'frac-simplify': (r) => { const d = int(r, 3, 6), n = int(r, 1, d - 1), k = int(r, 2, 4); return svg(160, 84, frac(36, 40, n * k, d * k) + txt(70, 48, '=', 24) + fracBox(116, 40)); },
    'frac-mixed-number': (r) => { const d = int(r, 3, 6), w = int(r, 1, 3), n = int(r, 1, d - 1); return svg(200, 84, frac(36, 40, w * d + n, d) + txt(70, 48, '=', 24) + box(96, 22, 30, 34) + fracBox(160, 40)); },
    'frac-round': () => svg(220, 84, txt(8, 48, '2', 28) + frac(44, 40, 7, 8) + txt(70, 48, '≈', 24) + box(100, 22, 36, 36)),
    'frac-nl': (r) => { const d = int(r, 3, 4); return svg(240, 128, nline(0, 1, { ticks: d * 2, arrowAt: int(r, 1, d * 2 - 1) }).replace(/<svg[^>]*>|<\/svg>/g, '') + fracBox(120, 92)); },
    'frac-whole': (r) => { const d = int(r, 2, 4); let s = ''; for (let i = 0; i < d; i++) s += rect(10 + i * (120 / d), 10, 120 / d, 30, GREY); return svg(220, 90, s + txt(150, 34, '1 =', 22) + fracBox(196, 34)); },
    'frac-bar-add': (r) => { const d = int(r, 4, 6); let s = ''; for (let i = 0; i < d; i++) s += rect(10 + i * (150 / d), 10, 150 / d, 30, i < 2 ? GREY : '#fff'); return svg(220, 112, s + frac(40, 74, 1, d) + txt(64, 82, '+', 22) + frac(90, 74, 1, d) + txt(114, 82, '=', 22) + fracBox(150, 74)); },
    'frac-add': (r) => { const d = int(r, 4, 9); return svg(220, 84, frac(30, 40, int(r, 1, 3), d) + txt(56, 48, '+', 24) + frac(84, 40, int(r, 1, 3), d) + txt(110, 48, '=', 24) + fracBox(150, 40)); },
    'frac-sub': (r) => { const d = int(r, 5, 9); return svg(220, 84, frac(30, 40, int(r, 4, d - 1), d) + txt(56, 48, '−', 24) + frac(84, 40, int(r, 1, 3), d) + txt(110, 48, '=', 24) + fracBox(150, 40)); },
    'frac-add-bars': (r) => { const d = int(r, 4, 6); let s = ''; for (let i = 0; i < d; i++) s += rect(10 + i * (120 / d), 4, 120 / d, 22, i < 1 ? GREY : '#fff') + rect(10 + i * (120 / d), 30, 120 / d, 22, i < 2 ? GREY : '#fff'); return svg(220, 122, s + frac(30, 84, 1, d) + txt(56, 92, '+', 22) + frac(84, 84, 2, d) + txt(110, 92, '=', 22) + fracBox(150, 84)); },
    'frac-sub-bars': (r) => { const d = int(r, 4, 6); let s = ''; for (let i = 0; i < d; i++) { s += rect(10 + i * (150 / d), 8, 150 / d, 30, i < 3 ? GREY : '#fff'); if (i === 2) s += ln(10 + i * (150 / d), 38, 10 + (i + 1) * (150 / d), 8, 2); } return svg(220, 110, s + frac(30, 74, 3, d) + txt(56, 82, '−', 22) + frac(84, 74, 1, d) + txt(110, 82, '=', 22) + fracBox(150, 74)); },
    'frac-add-mixed': () => svg(240, 84, txt(8, 48, '1', 26) + frac(40, 40, 1, 4) + txt(64, 48, '+', 24) + txt(84, 48, '2', 26) + frac(116, 40, 2, 4) + txt(140, 48, '=', 24) + box(162, 22, 26, 34) + fracBox(214, 40)),
    'frac-sub-mixed': () => svg(240, 84, txt(8, 48, '3', 26) + frac(40, 40, 3, 5) + txt(64, 48, '−', 24) + txt(84, 48, '1', 26) + frac(116, 40, 1, 5) + txt(140, 48, '=', 24) + box(162, 22, 26, 34) + fracBox(214, 40)),
    'frac-times-whole': (r) => svg(200, 84, txt(8, 48, int(r, 2, 6) + ' ×', 26) + frac(80, 40, 1, int(r, 3, 8)) + txt(104, 48, '=', 24) + fracBox(150, 40)),
    'frac-times-frac': () => svg(200, 84, frac(30, 40, 2, 3) + txt(56, 48, '×', 24) + frac(84, 40, 3, 4) + txt(110, 48, '=', 24) + fracBox(150, 40)),
    'frac-scaling': () => svg(240, 84, frac(30, 40, 3, 4) + txt(54, 48, '× 12 is', 20) + box(132, 22, 34, 34) + txt(172, 40, 'than 12', 16)),
    'frac-div': () => svg(200, 84, txt(8, 48, '3 ÷', 26) + frac(76, 40, 1, 4) + txt(100, 48, '=', 24) + box(124, 22, 36, 36)),
    'frac-as-div': (r) => { const a = int(r, 2, 7), b = int(r, 3, 8); return svg(200, 84, txt(8, 48, `${a} ÷ ${b} =`, 26) + fracBox(140, 40)); },
    'frac-decompose': () => svg(240, 84, frac(30, 40, 3, 5) + txt(54, 48, '=', 24) + fracBox(96, 40) + txt(120, 48, '+', 24) + fracBox(160, 40) + txt(184, 48, '+ …', 20)),
    'frac-tenths': () => svg(200, 84, frac(30, 40, 3, 10) + txt(56, 48, '=', 24) + box(80, 6, 34, 28) + ln(76, 40, 118, 40) + txt(97, 70, '100', 22, 'middle')),
    'frac-estimate': () => svg(240, 84, frac(30, 40, 7, 8) + txt(56, 48, '+', 24) + frac(84, 40, 5, 12) + txt(110, 48, '≈', 24) + box(138, 22, 36, 36)),
    'dec-add': (r) => line([`${int(r, 1, 9)}.${int(r, 1, 9)} + ${int(r, 1, 9)}.${int(r, 10, 99)} =`, null], 22),
    'dec-sub': (r) => line([`${int(r, 5, 9)}.${int(r, 1, 9)} − ${int(r, 1, 4)}.${int(r, 10, 99)} =`, null], 22),
    'dec-mult': (r) => line([`${int(r, 1, 9)}.${int(r, 1, 9)} × ${int(r, 2, 9)} =`, null], 22),
    'dec-div': (r) => line([`${int(r, 1, 9)}.${int(r, 1, 9)}${int(r, 1, 9)} ÷ ${int(r, 2, 5)} =`, null], 22),
    'dec-compare': (r) => line([`0.${int(r, 1, 9)}`, null, `0.${int(r, 10, 99)}`]),
    'dec-order': (r) => line([`0.${int(r, 1, 9)}, 0.${int(r, 10, 99)}, 0.${int(r, 1, 9)}${int(r, 1, 9)} →`, null], 20),
    'dec-round': (r) => line([`${int(r, 1, 9)}.${int(r, 11, 99)} → nearest tenth`, null], 18),
    'dec-nl': (r) => svg(240, 110, nline(0, 1, { arrowAt: int(r, 1, 9) }).replace(/<svg[^>]*>|<\/svg>/g, '') + box(102, 82, 40, 26)),
    'percent-grid': (r) => { const n = int(r, 12, 78); let s = ''; for (let i = 0; i < 100; i++) s += rect(8 + (i % 10) * 9, 8 + Math.floor(i / 10) * 9, 9, 9, i < n ? GREY : '#fff', 0.8); return svg(200, 100, s + txt(110, 56, '%', 22) + box(132, 30, 40, 36)); },
    'percent-of': (r) => line([`${pickOf(r, [10, 25, 50, 20])}% of ${int(r, 2, 9) * 20} =`, null], 22),
    'percent-whole': (r) => line([`30% of`, null, `= ${int(r, 2, 9) * 6}`], 22),
    'double-nl': () => svg(240, 100, ln(10, 30, 230, 30) + ln(10, 70, 230, 70) + [0, 1, 2, 3].map(i => ln(20 + i * 66, 24, 20 + i * 66, 36) + ln(20 + i * 66, 64, 20 + i * 66, 76)).join('') + txt(20, 18, '0', 14, 'middle') + txt(86, 18, '3', 14, 'middle') + txt(152, 18, '6', 14, 'middle') + txt(20, 96, '0', 14, 'middle') + txt(86, 96, '5', 14, 'middle') + box(136, 80, 30, 20)),
    'ratio-table': (r) => { const a = int(r, 2, 5), b = int(r, 3, 7); let s = ''; [[a, 2 * a, 3 * a], [b, 2 * b, null]].forEach((row, i) => row.forEach((v, j) => { s += rect(8 + j * 54, 8 + i * 34, 54, 34); s += v === null ? box(18 + j * 54, 12 + i * 34, 34, 26) : txt(35 + j * 54, 32 + i * 34, v, 20, 'middle'); })); return svg(180, 84, s); },
    'ratio-write': (r) => svg(240, 70, dotsRow(int(r, 2, 4), 16, 22, 18, '#000') + dotsRow(int(r, 2, 5), 110, 22) + txt(8, 62, 'black : white =', 18) + box(146, 40, 40, 28)),
    'unit-rate': (r) => line([`${int(r, 2, 6) * 30} miles in ${int(r, 2, 6)} hours →`, null, 'per hour'], 16),
    'fdp-order': () => line(['0.4,  1/2,  35%  →', null], 20),
    'convert-f_to_d': () => svg(180, 84, frac(30, 40, 3, 4) + txt(56, 48, '=', 24) + box(80, 22, 70, 36)),
    'convert-d_to_f': () => svg(180, 84, txt(8, 48, '0.6 =', 26) + fracBox(110, 40)),
    'convert-f_to_p': () => svg(180, 84, frac(30, 40, 1, 4) + txt(56, 48, '=', 24) + box(80, 22, 50, 36) + txt(136, 48, '%', 24)),
    'convert-p_to_f': () => svg(180, 84, txt(8, 48, '40% =', 26) + fracBox(120, 40)),
    'convert-d_to_p': () => line(['0.35 =', null, '%']),
    'convert-p_to_d': () => line(['72% =', null]),
    'shapes-name': (r) => { const k = pickOf(r, ['tri', 'sq', 'hex', 'circ', 'rect']); return svg(220, 70, shape(k, 40, 34, 26) + ln(90, 52, 210, 52, 1.5)); },
    'solid-name': () => svg(220, 90, cube(10, 8) + ln(110, 70, 210, 70, 1.5)),
    'solid-count': () => svg(240, 92, cube(10, 8) + txt(110, 30, 'faces', 16) + box(166, 10, 28, 26) + txt(110, 66, 'edges', 16) + box(166, 46, 28, 26)),
    'positions': () => svg(200, 90, shape('circ', 50, 20, 14) + rect(26, 40, 48, 40) + txt(100, 56, 'The ball is', 15) + box(110, 62, 70, 24)),
    'corners': (r) => { const k = pickOf(r, ['tri', 'sq', 'hex']); return svg(200, 76, shape(k, 40, 38, 28) + txt(90, 44, 'corners', 18) + box(160, 20, 32, 32)); },
    'length-order': () => svg(200, 90, rect(10, 8, 120, 16) + txt(146, 22, '1st', 14) + rect(10, 34, 70, 16) + box(146, 30, 30, 24) + rect(10, 60, 160, 16)),
    'length-compare': () => svg(220, 80, rect(10, 12, 140, 16, GREY) + rect(10, 44, 80, 16) + txt(160, 30, 'longer?', 15) + box(170, 38, 30, 28)),
    'nonstandard': () => { let s = rect(10, 12, 150, 16, GREY); for (let i = 0; i < 5; i++) s += `<rect x="${10 + i * 30}" y="38" width="28" height="10" rx="5" fill="none" stroke="#000" stroke-width="2"/>`; return svg(220, 70, s + txt(166, 30, 'clips', 14) + box(170, 38, 30, 26)); },
    'compose': () => svg(200, 80, `<polygon points="10,70 50,10 50,70" fill="none" stroke="#000" stroke-width="2.5"/><polygon points="56,70 56,10 96,70" fill="none" stroke="#000" stroke-width="2.5"/>` + txt(108, 50, 'make', 16) + box(150, 26, 40, 40)),
    'compose-hex': () => { let s = ''; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, b = (i + 1) * Math.PI / 3; s += `<polygon points="50,40 ${50 + 30 * Math.cos(a)},${40 + 30 * Math.sin(a)} ${50 + 30 * Math.cos(b)},${40 + 30 * Math.sin(b)}" fill="none" stroke="#000" stroke-width="2"/>`; } return svg(200, 80, s + txt(96, 46, 'triangles', 16) + box(170, 24, 28, 28)); },
    'compose-rect': () => svg(200, 80, grid(4, 2, 10, 10, 26) + txt(124, 46, 'squares', 16) + box(124, 54, 30, 24)),
    'partition': (r) => { const k = pickOf(r, [2, 3, 4]); let s = circ(40, 40, 32); for (let i = 0; i < k; i++) { const a = i * 2 * Math.PI / k - Math.PI / 2; s += ln(40, 40, 40 + 32 * Math.cos(a), 40 + 32 * Math.sin(a)); } return svg(200, 84, s + txt(84, 46, 'equal parts?', 15) + box(170, 24, 28, 28)); },
    'attributes': () => svg(220, 80, shape('tri', 30, 40, 20) + shape('sq', 80, 40, 18) + shape('hex', 136, 40, 22) + txt(8, 78, 'Ring the shapes with 4 sides', 13)),
    'classify-tri': () => svg(220, 84, `<polygon points="10,74 60,10 110,74" fill="none" stroke="#000" stroke-width="2.5"/>` + txt(26, 46, '5', 14) + txt(88, 46, '5', 14) + txt(60, 90 - 8, '5', 14, 'middle') + txt(120, 46, 'equilateral?', 14) + box(150, 54, 30, 26)),
    'classify-quad': () => svg(220, 84, `<polygon points="20,70 40,14 120,14 100,70" fill="none" stroke="#000" stroke-width="2.5"/>` + txt(130, 42, 'name', 15) + ln(130, 64, 210, 64, 1.5)),
    'net': () => svg(200, 100, grid(1, 3, 40, 4, 30).replace(/stroke-width="1"/g, 'stroke-width="2"') + rect(10, 34, 30, 30) + rect(70, 34, 30, 30) + txt(116, 50, 'which solid?', 14) + box(130, 60, 50, 28)),
    'area-rect': (r) => { const w = int(r, 3, 9), h = int(r, 2, 6); return svg(220, 90, rect(10, 10, 120, 64) + txt(70, 88, `${w} cm`, 14, 'middle') + txt(136, 46, `${h} cm`, 14) + txt(178, 30, 'A =', 15) + box(176, 38, 36, 30)); },
    'perimeter': (r) => { const w = int(r, 3, 9), h = int(r, 2, 6); return svg(220, 90, rect(10, 10, 120, 64) + txt(70, 88, `${w} m`, 14, 'middle') + txt(136, 46, `${h} m`, 14) + txt(178, 30, 'P =', 15) + box(176, 38, 36, 30)); },
    'area-grid': (r) => { const w = int(r, 3, 6), h = int(r, 2, 4); return svg(220, 80, grid(w, h, 10, 10, 15) + `<rect x="10" y="10" width="${w * 15}" height="${h * 15}" fill="none" stroke="#000" stroke-width="2.5"/>` + txt(120, 40, 'squares', 15) + box(136, 46, 34, 28)); },
    'area-triangle': () => svg(220, 98, `<polygon points="10,76 120,76 70,10" fill="none" stroke="#000" stroke-width="2.5"/>` + ln(70, 10, 70, 76, 1.5, '4 3') + txt(74, 50, '6', 14) + txt(64, 92, '10', 14) + txt(140, 40, 'A =', 15) + box(140, 48, 36, 30)),
    'area-composite': () => svg(220, 90, `<polygon points="10,10 70,10 70,44 120,44 120,80 10,80" fill="none" stroke="#000" stroke-width="2.5"/>` + txt(140, 40, 'A =', 15) + box(140, 48, 36, 30)),
    'volume': (r) => svg(220, 108, cube(10, 8, 70, 50, 26) + txt(36, 104, int(r, 2, 6) + ' cm', 13) + txt(130, 40, 'V =', 15) + box(130, 48, 40, 30)),
    'angle-name': () => svg(200, 80, ln(20, 66, 110, 66, 2.5) + ln(20, 66, 70, 14, 2.5) + `<path d="M44 66 A24 24 0 0 0 36 50" fill="none" stroke="#000" stroke-width="1.5"/>` + txt(120, 50, 'acute?', 15) + box(130, 54, 50, 24)),
    'angle-measure': () => { let s = `<path d="M10 80 A80 80 0 0 1 170 80" fill="none" stroke="#000" stroke-width="2"/>` + ln(10, 80, 170, 80); for (let i = 0; i <= 18; i++) { const a = Math.PI - i * Math.PI / 18; s += ln(90 + 80 * Math.cos(a), 80 - 80 * Math.sin(a), 90 + 72 * Math.cos(a), 80 - 72 * Math.sin(a), 1); } return svg(220, 90, s + ln(90, 80, 150, 30, 2.5) + box(176, 40, 40, 30)); },
    'angle-missing': (r) => { const a = int(r, 3, 6) * 10; return svg(220, 84, ln(10, 70, 200, 70, 2.5) + ln(100, 70, 40, 14, 2.5) + ln(100, 70, 160, 20, 2.5) + txt(124, 60, a + '°', 14) + txt(84, 52, 'x', 16) + txt(14, 26, 'x =', 15) + box(50, 6, 34, 28)); },
    'lines': () => svg(200, 80, ln(10, 20, 100, 20, 2.5) + ln(10, 50, 100, 50, 2.5) + txt(110, 40, 'parallel?', 15) + box(126, 46, 40, 26)),
    'symmetry': () => svg(214, 90, `<polygon points="50,6 90,40 70,84 30,84 10,40" fill="none" stroke="#000" stroke-width="2.5"/>` + ln(50, 2, 50, 88, 2, '5 4') + txt(104, 40, 'line of', 14) + txt(104, 58, 'symmetry?', 14) + box(184, 38, 26, 26)),
    'coord-point': (r) => svg(200, 124, coordGrid([[int(r, 1, 7), int(r, 1, 5)]]) + txt(160, 50, '(', 18) + box(168, 30, 24, 26) + txt(160, 92, ', ', 18) + box(168, 72, 24, 26)),
    'coord-polygon': () => svg(200, 124, coordGrid([[1, 1], [5, 1], [5, 4], [1, 4]], true) + txt(160, 40, 'side', 14) + box(166, 48, 28, 26)),
    'transform-reflect': () => svg(200, 124, coordGrid([[1, 1], [3, 1], [1, 4]], true) + ln(84, 6, 84, 102, 2.5, '6 4') + txt(160, 56, 'reflect', 14)),
    'transform-rotate': () => svg(200, 124, coordGrid([[4, 2], [7, 2], [4, 5]], true) + circ(84, 70, 4, '#000') + txt(160, 56, 'turn ¼', 14)),
    'transform-translate': () => svg(232, 124, coordGrid([[1, 1], [3, 1], [1, 3]], true) + `<path d="M60 70 L110 40" stroke="#000" stroke-width="2" marker-end=""/>` + txt(160, 56, '→ 3, ↑ 2', 14)),
    'clock': (r, s) => { const m = minutesFor(s.v, r); return svg(180, 100, analogClock(int(r, 1, 12), m) + box(108, 30, 64, 36)); },
    'clock-fives': () => svg(180, 100, analogClock(2, 25) + txt(108, 30, 'minutes', 14) + box(108, 38, 56, 34)),
    'clock-parts': () => svg(200, 100, analogClock(4, 0) + ln(76, 40, 120, 30, 1.5) + box(124, 14, 70, 28) + txt(124, 72, 'hour hand?', 13)),
    'clock-later': (r) => { const h = int(r, 1, 10), m = pickOf(r, [0, 15, 30]); return svg(220, 100, analogClock(h, m) + txt(106, 34, pickOf(r, ['30 min later', '1 hour later', '15 min earlier']), 14) + box(112, 46, 70, 34)); },
    'clock-elapsed': (r) => { const h = int(r, 1, 9); return svg(240, 100, analogClock(h, 0, 46, 50, 40) + txt(98, 56, '→', 22) + analogClock(h + 1, 30, 164, 50, 40) + box(210, 34, 28, 30)); },
    'clock-order': () => svg(240, 70, analogClock(3, 0, 32, 34, 28) + analogClock(1, 30, 102, 34, 28) + analogClock(5, 0, 172, 34, 28)).replace('</svg>', box(206, 20, 30, 28) + '</svg>'),
    'digital-order': () => line(['4:15,  2:40,  9:05  →', null], 20),
    'am-pm': () => svg(240, 64, txt(8, 28, 'Eat breakfast at 7:30', 16) + `<rect x="10" y="38" width="56" height="24" rx="12" fill="none" stroke="#000" stroke-width="2"/>` + txt(38, 56, 'a.m.', 14, 'middle') + `<rect x="76" y="38" width="56" height="24" rx="12" fill="none" stroke="#000" stroke-width="2"/>` + txt(104, 56, 'p.m.', 14, 'middle')),
    'coins': (r) => svg(200, 70, coins(r) + box(152, 16, 44, 34)),
    'notes': (r) => svg(240, 64, notes(r) + box(194, 14, 42, 32)),
    'money-words': () => story(['four dollars and', 'twenty-five cents'], true),
    'ruler': () => { let s = rect(8, 42, 180, 26); for (let i = 0; i <= 12; i++) s += ln(12 + i * 14, 42, 12 + i * 14, i % 2 ? 50 : 58, 1.5); for (let i = 0; i <= 6; i++) s += txt(12 + i * 28, 66 + 12, i, 11, 'middle'); return svg(240, 84, s + rect(12, 18, 14 * 7, 12, GREY) + box(196, 14, 40, 30)); },
    'thermometer': () => { let s = `<rect x="30" y="6" width="16" height="80" rx="8" fill="#fff" stroke="#000" stroke-width="2"/>` + circ(38, 90, 12, GREY) + rect(34, 40, 8, 48, GREY, 0); for (let i = 0; i < 8; i++) s += ln(46, 12 + i * 10, 54, 12 + i * 10, 1.5); return svg(160, 108, s + txt(70, 50, '°C', 18) + box(100, 30, 44, 32)); },
    'jug': () => { let s = `<path d="M20 10 L20 90 L90 90 L90 10" fill="none" stroke="#000" stroke-width="2.5"/>` + rect(22, 48, 66, 40, GREY, 0); for (let i = 0; i < 4; i++) s += ln(20, 20 + i * 20, 32, 20 + i * 20, 1.5); return svg(200, 100, s + txt(100, 44, 'mL', 18) + box(140, 22, 48, 32)); },
    'balance': () => svg(220, 96, ln(110, 20, 110, 90, 2.5) + ln(40, 34, 180, 10, 2.5) + `<path d="M20 34 h40 l-6 14 h-28z" fill="none" stroke="#000" stroke-width="2"/><path d="M160 10 h40 l-6 14 h-28z" fill="none" stroke="#000" stroke-width="2"/>` + circ(40, 24, 9, GREY) + rect(170, 0 + 2, 18, 8, '#fff', 1.5) + txt(8, 80, 'heavier?', 14) + box(70, 62, 30, 28)),
    'convert': (r, s) => { const p = /yards_to_feet/.test(s.v) ? ['yd', 'ft'] : /yards_to_inches/.test(s.v) ? ['yd', 'in'] : /miles/.test(s.v) ? ['mi', 'ft'] : /cm_to_mm/.test(s.v) ? ['cm', 'mm'] : /m_to_cm/.test(s.v) ? ['m', 'cm'] : /m_to_mm/.test(s.v) ? ['m', 'mm'] : /km/.test(s.v) ? ['km', 'm'] : /metric/.test(s.v) ? ['m', 'cm'] : /capacity/.test(s.v) ? ['L', 'mL'] : ['ft', 'in']; return line([`${int(r, 2, 9)} ${p[0]} =`, null, p[1]]); },
    'tally': (r) => { const t = tallyMarks(int(r, 6, 13)); return svg(Math.max(160, t.x + 50), 60, t.s + box(t.x + 6, 14, 34, 32)); },
    'bar-graph': (r) => svg(220, 100, bars(r) + box(176, 30, 36, 30)),
    'pictograph': (r) => { let s = ''; for (let row = 0; row < 3; row++) { s += txt(8, 24 + row * 26, ['A', 'B', 'C'][row], 14); const n = int(r, 2, 5); for (let i = 0; i < n; i++) s += circ(34 + i * 20, 19 + row * 26, 8, row === 1 ? GREY : '#fff'); } return svg(220, 100, s + txt(8, 96, 'each ○ = 2', 12) + box(170, 22, 36, 30)); },
    'line-plot': (r) => { let s = ln(10, 70, 200, 70); for (let i = 0; i <= 5; i++) { s += ln(20 + i * 34, 66, 20 + i * 34, 74) + txt(20 + i * 34, 90, i, 12, 'middle'); const n = int(r, 0, 3); for (let k = 0; k < n; k++) s += txt(20 + i * 34, 60 - k * 14, '×', 16, 'middle'); } return svg(220, 96, s); },
    'pie': () => svg(200, 90, circ(46, 44, 38) + `<path d="M46 44 L46 6 A38 38 0 0 1 84 44 Z" fill="${GREY}" stroke="#000" stroke-width="2"/>` + ln(46, 44, 14, 66) + txt(100, 40, 'fraction', 14) + box(110, 48, 34, 30)),
    'histogram': (r) => { let b = ''; for (let i = 0; i < 5; i++) { const h = int(r, 2, 6) * 10; b += rect(24 + i * 26, 84 - h, 26, h, '#fff'); } return svg(220, 100, ln(18, 84, 160, 84) + ln(18, 8, 18, 84) + b + box(176, 30, 36, 30)); },
    'box-plot': () => svg(220, 76, ln(10, 60, 210, 60) + ln(30, 30, 60, 30) + rect(60, 16, 70, 28) + ln(96, 16, 96, 44) + ln(130, 30, 180, 30) + ln(30, 22, 30, 38) + ln(180, 22, 180, 38) + txt(8, 74, 'median =', 12) + box(64, 60, 30, 16)),
    'data-list': (r, s) => { const nm = /mean/.test(s.v) ? 'mean' : /median/.test(s.v) ? 'median' : /mode/.test(s.v) ? 'mode' : /range/.test(s.v) ? 'range' : 'MAD'; return lines([[`${int(r, 2, 4)}, ${int(r, 5, 6)}, ${int(r, 6, 7)}, ${int(r, 8, 9)}, ${int(r, 9, 12)}`], [`${nm} =`, null]], 20); },
    'stat-question': () => story(['How tall are the pupils', 'in my class?', 'Statistical question?']),
    'spinner': () => { let s = circ(44, 44, 38); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; s += ln(44, 44, 44 + 38 * Math.cos(a), 44 + 38 * Math.sin(a)); } s += `<path d="M44 44 L44 6 A38 38 0 0 1 82 44 Z" fill="${GREY}" stroke="#000" stroke-width="2"/>` + ln(44, 44, 64, 20, 3); return svg(200, 90, s + txt(96, 40, 'grey: likely?', 13) + box(110, 48, 60, 28)); },
    'shape-pattern': () => svg(240, 60, shape('circ', 20, 30, 12) + shape('sq', 52, 30, 12) + shape('circ', 84, 30, 12) + shape('sq', 116, 30, 12) + shape('circ', 148, 30, 12) + box(170, 10, 40, 40)),
    'double-halve': (r, s) => { const n = int(r, 3, 12); return line([/halve/.test(s.v) ? `half of ${n * 2} =` : `double ${n} =`, null], 22); },
    'hundred-grid': (r) => { let s = ''; const st = int(r, 1, 6) * 10; for (let i = 0; i < 20; i++) { const x = 8 + (i % 10) * 22, y = 8 + Math.floor(i / 10) * 26; s += rect(x, y, 22, 26, '#fff', 1.5); if (i % 2 === 1) s += txt(x + 11, y + 18, st + i + 1, 11, 'middle'); } return svg(240, 70, s); },
    'function-table': (r) => { const k = int(r, 2, 5); let s = ''; [['in', 1, 2, 3, 4], ['out', 1 + k, 2 + k, 3 + k, null]].forEach((row, i) => row.forEach((v, j) => { s += rect(8 + j * 44, 8 + i * 30, 44, 30, j === 0 ? GREY : '#fff', 1.5); s += v === null ? box(16 + j * 44, 11 + i * 30, 28, 24) : txt(30 + j * 44, 29 + i * 30, v, 16, 'middle'); })); return svg(240, 76, s); },
    'tape': (r) => { const a = int(r, 3, 9), b = int(r, 3, 9); return svg(220, 90, rect(10, 30, 100, 30) + rect(110, 30, 80, 30) + txt(60, 52, a, 18, 'middle') + txt(150, 52, '?', 18, 'middle') + `<path d="M10 20 q90 -20 180 0" fill="none" stroke="#000" stroke-width="1.5"/>` + txt(100, 14, a + b, 15, 'middle') + txt(10, 84, '? =', 15) + box(40, 64, 34, 24)); },
    'balance-eq': (r) => { const a = int(r, 2, 6), b = int(r, 7, 12); return svg(220, 90, ln(110, 30, 110, 86, 2.5) + ln(20, 30, 200, 30, 2.5) + `<path d="M10 30 h80 l-8 18 h-64z" fill="none" stroke="#000" stroke-width="2"/><path d="M130 30 h80 l-8 18 h-64z" fill="none" stroke="#000" stroke-width="2"/>` + txt(50, 24, `x + ${a}`, 15, 'middle') + txt(170, 24, b, 15, 'middle') + txt(10, 78, 'x =', 15) + box(40, 60, 30, 26)); },
    'solve-eq': (r, s) => { const a = int(r, 2, 9), x = int(r, 2, 9); const e = /ax_plus|twostep/.test(s.v) ? `${a}x + 3 = ${a * x + 3}` : /ax_minus/.test(s.v) ? `${a}x − 2 = ${a * x - 2}` : /div_a/.test(s.v) ? `x ÷ ${a} = ${x}` : /ax_eq|multdiv/.test(s.v) ? `${a}x = ${a * x}` : /minus/.test(s.v) ? `x − ${a} = ${x}` : /bracket/.test(s.v) ? `(x + ${a}) ÷ 2 = ${x}` : `x + ${a} = ${a + x}`; return lines([[e], ['x =', null]], 22); },
    'evaluate': (r) => lines([[`3n + ${int(r, 2, 9)}, n = ${int(r, 2, 6)}`], ['=', null]], 20),
    'write-expression': (r) => story([`${int(r, 3, 9)} more than a number n`], true),
    'inequality': () => svg(220, 90, txt(8, 26, 'x > 3', 18) + ln(10, 60, 210, 60) + [0, 1, 2, 3, 4, 5, 6].map(i => ln(20 + i * 30, 54, 20 + i * 30, 66) + txt(20 + i * 30, 84, i, 12, 'middle')).join('') + circ(110, 60, 6, '#fff') + ln(116, 60, 206, 60, 4)),
    'like-terms': (r) => line([`${int(r, 2, 6)}x + ${int(r, 2, 6)}x =`, null], 24),
    'distributive': (r) => line([`${int(r, 2, 6)}(x + ${int(r, 2, 9)}) =`, null], 24),
    'oop': (r) => line([`${int(r, 2, 9)} + ${int(r, 2, 6)} × ${int(r, 2, 5)} =`, null], 24),
    'oop-paren': (r) => line([`(${int(r, 2, 9)} + ${int(r, 2, 6)}) × ${int(r, 2, 5)} =`, null], 24),
    'oop-compare': () => line(['3 + 4 × 2', null, '(3 + 4) × 2'], 20),
    'exponent': (r, s) => line([/cube/.test(s.v) ? `${int(r, 2, 5)}³ =` : `${int(r, 2, 9)}² =`, null], 26),
    'pv-disks': (r) => pvDisks(int(r, 1, 3), int(r, 1, 4), int(r, 1, 4)),
    'pv-chart': (r) => pvChart(int(r, 102, 987), int(r, 0, 2)),
    'pv-more-less': (r) => { const n = int(r, 112, 879); return lines([[`10 more than ${n} =`, null], [`100 less than ${n} =`, null]], 18); },
    'pv-words': (r) => story(['three hundred forty-six'], true),
    'pv-times-ten': (r) => { const n = int(r, 2, 9) * 10 + int(r, 1, 9); return lines([[`${n} × 10 =`, null], [`${n} × 100 =`, null]], 20); },
    'pv-digit-value': (r) => { const n = String(int(r, 213, 987)); return svg(240, 64, txt(8, 40, n.slice(0, 1), 30) + `<text x="${8 + cw(30)}" y="40" ${FONT} font-size="30" text-decoration="underline">${n[1]}</text>` + txt(8 + 2 * cw(30), 40, n.slice(2), 30) + txt(80, 40, 'value of the', 14) + txt(80, 58, 'underlined digit', 14) + box(196, 16, 40, 34)); },
    'pv-unit-form': (r) => lines([[`${int(r, 1, 9)} hundreds ${int(r, 0, 9)} tens ${int(r, 0, 9)} ones`], ['=', null]], 18),
    'pv-expanded': (r) => { const h = int(r, 1, 9), t = int(r, 1, 9), o = int(r, 1, 9); return line([`${h}${t}${o} = ${h}00 +`, null, `+ ${o}`], 22); },
    'pv-standard': (r) => { const h = int(r, 1, 9), t = int(r, 1, 9), o = int(r, 1, 9); return line([`${h}00 + ${t}0 + ${o} =`, null], 22); },
    'pv-compare': (r) => line([`${int(r, 301, 699)}`, null, `${int(r, 301, 699)}`]),
    'pv-order': (r) => line([`${int(r, 301, 399)}, ${int(r, 130, 199)}, ${int(r, 310, 399)} →`, null], 20),
    'estimate': (r) => line([`${int(r, 21, 89)} + ${int(r, 21, 89)} ≈`, null], 24),
    'round-nl': (r) => { const t = int(r, 2, 8); const n = int(r, 1, 9); return svg(240, 116, nline(t * 10, t * 10 + 10, { arrowAt: n, mid: t * 10 + 5 }).replace(/<svg[^>]*>|<\/svg>/g, '') + txt(10, 108, `${t * 10 + n} → nearest 10`, 16) + box(160, 84, 40, 30)); },
    'round-sort': (r) => { const t = int(r, 3, 7); return svg(240, 90, rect(10, 10, 100, 70) + rect(124, 10, 100, 70) + txt(60, 30, `rounds to ${t}0`, 12, 'middle') + txt(174, 30, `rounds to ${t + 1}0`, 12, 'middle') + txt(60, 60, `${t}${int(r, 1, 4)}`, 18, 'middle') + txt(174, 60, `${t}${int(r, 5, 9)}`, 18, 'middle')); },
    'make-ten': (r) => { const a = int(r, 5, 8); return svg(220, 80, tenFrame(a, 8, 8, 0) + txt(146, 34, `${a} +`, 18) + box(178, 12, 32, 30) + txt(146, 70, '= 10', 18)); },
    'near-doubles': (r) => { const n = int(r, 3, 9); return lines([[`${n} + ${n} = ${2 * n}`], [`${n} + ${n + 1} =`, null]], 22); },
    'compensation': (r) => { const a = int(r, 2, 8) * 10 - 1, b = int(r, 12, 39); return lines([[`${a} + ${b}`], [`= ${a + 1} +`, null]], 22); },
    't-chart': (r) => { const n = pickOf(r, [12, 18, 20, 24]); let s = txt(70, 22, `factors of ${n}`, 15, 'middle') + ln(70, 30, 70, 100) + ln(20, 30, 120, 30); s += txt(46, 52, 1, 16, 'middle') + txt(94, 52, n, 16, 'middle') + txt(46, 78, 2, 16, 'middle') + box(80, 60, 28, 24); return svg(160, 106, s + box(32, 84, 28, 20) + box(80, 84, 28, 20)); },
    'factor-links': (r) => { const n = pickOf(r, [12, 18, 24]); const fs = [1, 2, 3, 4, 6, 8, 9, 12, 18, 24].filter(f => n % f === 0); let s = ''; fs.forEach((f, i) => { s += txt(14 + i * 30, 84, f, 14, 'middle'); }); for (let i = 0; i < Math.floor(fs.length / 2); i++) { const a = 14 + i * 30, b = 14 + (fs.length - 1 - i) * 30; s += `<path d="M${a} 68 Q${(a + b) / 2} ${60 - (b - a) / 3} ${b} 68" fill="none" stroke="#000" stroke-width="2"/>`; } return svg(Math.max(160, fs.length * 30 + 10), 94, s); },
    'prime': (r) => svg(240, 64, txt(8, 40, pickOf(r, [17, 21, 23, 27, 29, 33]), 30) + `<rect x="64" y="14" width="74" height="34" rx="17" fill="none" stroke="#000" stroke-width="2"/>` + txt(101, 37, 'prime', 16, 'middle') + `<rect x="144" y="14" width="92" height="34" rx="17" fill="none" stroke="#000" stroke-width="2"/>` + txt(190, 37, 'composite', 16, 'middle')),
    'multiples': (r) => { const k = int(r, 3, 9); return seqRow([k, 2 * k, 3 * k, 4 * k], [2, 3]); },
    'gcf': (r) => line([`GCF of ${pickOf(r, [12, 18, 24])} and ${pickOf(r, [16, 30, 36])} =`, null], 20),
    'lcm': (r) => line([`LCM of ${int(r, 3, 6)} and ${int(r, 4, 9)} =`, null], 20),
    'factors': (r) => line([`Is ${int(r, 3, 6)} a factor of ${int(r, 12, 36)}?`, null], 18),
    'div-sort': () => svg(240, 90, rect(10, 10, 104, 70) + rect(124, 10, 104, 70) + txt(62, 28, '÷ by 3', 13, 'middle') + txt(176, 28, 'not ÷ by 3', 13, 'middle') + txt(40, 60, '27', 16) + txt(150, 60, '25', 16)),
    'count-objects': (r) => { const n = int(r, 5, 12); let s = ''; for (let i = 0; i < n; i++) s += shape('circ', 14 + (i % 6) * 22, 16 + Math.floor(i / 6) * 24, 9); return svg(200, 64, s + box(150, 14, 40, 36)); },
    'count-next': (r) => { const n = int(r, 3, 17); return line([`${n - 1}, ${n},`, null], 26); },
    'number-grid': (r) => D['hundred-grid'](r),
    'compare-groups': (r) => svg(220, 70, dotsRow(int(r, 3, 6), 16, 20, 18, '#000') + dotsRow(int(r, 2, 5), 16, 48, 18, '#fff') + txt(130, 30, 'more?', 15) + box(140, 36, 50, 26)),
    'classify': () => svg(220, 76, shape('circ', 18, 20, 9) + shape('tri', 42, 22, 10) + shape('circ', 66, 20, 9) + shape('sq', 90, 20, 9) + shape('circ', 114, 20, 9) + txt(8, 66, 'circles:', 15) + box(70, 46, 30, 26)),
    'number-bond': (r) => { const a = int(r, 2, 5), b = int(r, 1, 5); return svg(180, 100, circ(90, 24, 20) + txt(90, 31, a + b, 18, 'middle') + ln(78, 40, 52, 66) + ln(102, 40, 128, 66) + circ(44, 78, 18) + txt(44, 85, a, 18, 'middle') + circ(136, 78, 18) + box(122, 64, 28, 28)); },
    'teen-frames': (r) => { const n = int(r, 1, 9); return svg(330, 70, tenFrame(10, 8, 8) + tenFrame(n, 146, 8) + box(286, 16, 36, 34)); },
    'ten-frame': (r) => svg(190, 70, tenFrame(int(r, 3, 9)) + box(146, 16, 36, 34)),
    'rods': (r) => rods(int(r, 2, 4), int(r, 1, 6)),
    'flats': (r) => rods(int(r, 1, 3), int(r, 1, 4), int(r, 1, 2)),
    'odd-even-select': (r) => { const ns = []; while (ns.length < 5) { const n = int(r, 11, 59); if (!ns.includes(n)) ns.push(n); } return svg(250, 70, txt(6, 20, 'Ring the even numbers.', 15) + ns.map((n, i) => txt(26 + i * 48, 56, n, 24, 'middle')).join('')); },
    'odd-even': (r) => svg(240, 60, txt(8, 42, `${int(r, 11, 49)}`, 30) + `<rect x="64" y="16" width="64" height="34" rx="17" fill="none" stroke="#000" stroke-width="2"/>` + txt(96, 39, 'odd', 18, 'middle') + `<rect x="138" y="16" width="70" height="34" rx="17" fill="none" stroke="#000" stroke-width="2"/>` + txt(173, 39, 'even', 18, 'middle')),
    'number-words': (r) => svg(240, 64, txt(6, 40, `${int(r, 21, 99)} =`, 26) + ln(76, 44, 230, 44)),
    'words': (r, s) => wordCard(s),
  };
  // pools: a few lines from the kinds the pool deals, so a mixed skill shows mixing
  const POOL = {
    'pool-addition': ['eq-add', 'stack-add'], 'pool-add-sub': ['eq-add', 'eq-sub'], 'pool-subtraction': ['eq-sub', 'stack-sub'], 'pool-multiplication': ['eq-mult', 'array'],
    'pool-division': ['eq-div', 'div-remainder'], 'pool-ops': ['eq-add', 'eq-sub', 'eq-mult', 'eq-div'], 'pool-integers': ['int-add', 'int-compare'], 'pool-fraction-ops': ['frac-add', 'frac-times-whole'],
    'pool-decimals': ['dec-add', 'dec-compare'], 'pool-conversions': ['convert-f_to_d', 'convert-d_to_p'], 'pool-shapes': ['shapes-name', 'corners'], 'pool-area': ['area-rect', 'perimeter'], 'pool-angles': ['angle-name', 'lines'],
    'pool-coordinates': ['coord-point', 'transform-reflect'], 'pool-time': ['clock', 'clock-later'], 'pool-measurement': ['ruler', 'coins'], 'pool-graphs': ['bar-graph', 'tally'], 'pool-data': ['data-list', 'box-plot'],
    'pool-patterns': ['skip-count', 'shape-pattern'], 'pool-algebra': ['solve-eq', 'tape'], 'pool-oop': ['oop', 'oop-paren'], 'pool-placevalue': ['pv-expanded', 'pv-compare'], 'pool-number-sense': ['round-nl', 'estimate'],
    'pool-number-theory': ['prime', 'multiples'], 'pool-counting': ['count-objects', 'count-next'], 'pool-comparing': ['compare-groups', 'length-compare'], 'pool-composing': ['number-bond', 'rods'],
    'pool-all_mixed': ['eq-add', 'frac-bar', 'clock'], 'pool-algebra_mixed': ['skip-count', 'solve-eq', 'pv-expanded'], 'pool-frac_dec_mixed': ['frac-add', 'dec-add', 'convert-f_to_p'], 'pool-geo_mixed': ['shapes-name', 'area-rect', 'clock'],
    'pool-data_mixed': ['bar-graph', 'data-list'], 'pool-counting_mixed': ['count-objects', 'ten-frame'], 'pool-number_ops_mixed': ['eq-add', 'eq-sub', 'eq-mult', 'eq-div'],
  };
  // place(body, dx, dy, k): move (and scale) a drawing by rewriting its coordinates, not with a transform, so every
  // element's own box is where it is drawn (the critic's probe reads getBBox without transforms; fix round 3)
  function place(body, dx, dy, k = 1) {
    const f = (v) => +(v * k).toFixed(2);
    const X = (v) => +(Number(v) * k + dx).toFixed(2), Y = (v) => +(Number(v) * k + dy).toFixed(2);
    body = body.replace(/ (x|cx|x1|x2)="([-\d.]+)"/g, (m, a, v) => ` ${a}="${X(v)}"`).replace(/ (y|cy|y1|y2)="([-\d.]+)"/g, (m, a, v) => ` ${a}="${Y(v)}"`);
    if (k !== 1) body = body.replace(/ (width|height|r|rx|font-size)="([\d.]+)"/g, (m, a, v) => ` ${a}="${f(Number(v))}"`);
    body = body.replace(/ points="([^"]+)"/g, (m, pts) => ` points="${pts.trim().split(/\s+/).map(pr => { const [a, b] = pr.split(','); return X(a) + ',' + Y(b); }).join(' ')}"`);
    body = body.replace(/ d="([^"]+)"/g, (m, d) => {
      const toks = d.match(/[a-zA-Z]|-?[\d.]+(?:e-?\d+)?/g); let out = [], cmd = '', i = 0, n = 0;
      const ARGS = { M: 2, L: 2, T: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, A: 7, Z: 0 };
      while (i < toks.length) {
        const t = toks[i];
        if (/[a-zA-Z]/.test(t)) { cmd = t; out.push(t); i++; n = 0; if (/z/i.test(t)) continue; continue; }
        const C = cmd.toUpperCase(), abs = cmd === C, v = Number(t); const pos = n % ARGS[C];
        let r;
        if (C === 'A') r = pos < 2 ? f(v) : pos < 5 ? v : abs ? (pos === 5 ? X(v) : Y(v)) : f(v);
        else if (C === 'H') r = abs ? X(v) : f(v);
        else if (C === 'V') r = abs ? Y(v) : f(v);
        else r = abs ? (pos % 2 ? Y(v) : X(v)) : f(v);
        out.push(r); i++; n++;
      }
      return ` d="${out.join(' ')}"`;
    });
    return body;
  }
  function poolDraw(kind, s, r) {
    const parts = (POOL[kind] || ['eq-add', 'eq-sub']).slice(0, 3);
    // stack two small drawings with a "mixed" label: each drawn at its own size inside one svg
    const inner = parts.map(k => (D[k] || D['eq-add'])(r, Object.assign({}, s, { v: '', l: '' })));
    const sized = inner.map(x => { const m = x.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); return { w: Number(m[1]), h: Number(m[2]), body: x.replace(/<svg[^>]*>|<\/svg>$/g, '') }; });
    const scale = 0.62; let y = 0, body = '', W = 0;
    sized.slice(0, 2).forEach(p => { body += place(p.body, 0, y, scale); y += p.h * scale + 4; W = Math.max(W, p.w * scale); });
    return svg(Math.ceil(W), Math.ceil(y), body);
  }
  // ---- variants (fix round 2, critic r2 C2): a "(Visual)" / "with Pictures" skill and a word problem with Pictures on show a
  //      picture; its "(No Pictures)" / "(No Visuals)" twin, or Pictures off on the chip, is text and numbers only.
  const PLAIN = /no pictures|no visuals/i, PICT = /\(visual|with pictures|visual pizza/i;
  function picCount(svgStr) {   // how much of the drawing is a picture (shapes and filled parts, not text, answer boxes or rules)
    return (svgStr.match(/<(circle|ellipse|polygon|path|polyline)\b/g) || []).length + (svgStr.match(/<rect[^>]*fill="(?!none)[^"]*"/g) || []).length + ([...svgStr.matchAll(/<line x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g)].filter(m => !(m[2] === m[4] && Math.abs(m[3] - m[1]) < 60)).length >= 2 ? 1 : 0);   // fraction bars are not pictures
  }
  // ---- fix round 3 (critic r3 C1): an added picture is drawn FROM the problem — the numbers in the problem's own text,
  //      in order — or not at all. Each is a <g data-pic="type" data-vals="…"> group that thumbs-check reads back: its
  //      values must be the problem's numbers, and the counters (class ctr), crossed-out counters (class x), parts
  //      (class pp) and grey parts it draws must be the counts it declares. Grey means one thing: the part that is
  //      counted (the added group, the shaded fraction).
  const numsIn = (svgStr) => (svgStr.replace(/<[^>]+>/g, ' ').replace(/(\d),(?=\d{3})/g, '$1').match(/\d+(?:\.\d+)?/g) || []).map(Number);
  const pic = (type, vals, extra, w, h, b) => ({ w, h, b: `<g data-pic="${type}" data-vals="${vals.join(',')}"${Object.entries(extra || {}).map(([k, v]) => ` data-${k}="${v}"`).join('')}>${b}</g>` });
  const ctr = (x, y, fill = '#fff', r = 5.5) => `<circle class="ctr" cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#000" stroke-width="1.8"/>`;
  const xOut = (x, y) => `<path class="x" d="M${x - 6} ${y - 6}L${x + 6} ${y + 6}M${x + 6} ${y - 6}L${x - 6} ${y + 6}" stroke="#000" stroke-width="2"/>`;
  const pp = (x, y, w, h, on) => `<rect class="pp" x="${x}" y="${y}" width="${w}" height="${h}" fill="${on ? GREY : '#fff'}" stroke="#000" stroke-width="1.6"/>`;
  function ctrRows(n, x0, y0, fill, per = 5, step = 14) { let b = ''; for (let i = 0; i < n; i++) b += ctr(x0 + (i % per) * step + 7, y0 + Math.floor(i / per) * step + 7, typeof fill === 'function' ? fill(i) : fill); return b; }
  const P = {
    // a + b: two groups, the added group grey
    add(a, b) { const rows = Math.max(Math.ceil(a / 5), Math.ceil(b / 5)); return pic('counters-add', [a, b], { count: a + b }, 2 * 70 + 10, rows * 14 + 2, ctrRows(a, 0, 1, '#fff') + ctrRows(b, 80, 1, GREY)); },
    // a, b of them crossed out (take away)
    take(a, b) { let x = ''; for (let i = a - b; i < a; i++) x += xOut((i % 5) * 14 + 7, Math.floor(i / 5) * 14 + 8); return pic('counters-take', [a, b], { count: a, x: b }, 72, Math.ceil(a / 5) * 14 + 2, ctrRows(a, 0, 1, '#fff') + x); },
    // two rows lined up to compare
    compare(a, b) { const per = Math.max(a, b) > 10 ? 10 : Math.max(a, b); const w = per * 12; const row = (n, y) => { let o = ''; for (let i = 0; i < n; i++) o += ctr((i % per) * 12 + 6, y + Math.floor(i / per) * 12, '#fff', 4.8); return o; }; const ra = Math.ceil(a / per), rb = Math.ceil(b / per); return pic('counters-compare', [a, b], { count: a + b }, w + 2, (ra + rb) * 12 + 8, row(a, 7) + row(b, ra * 12 + 13)); },
    // a groups of b
    groups(a, b) { let o = ''; const gw = Math.min(b, 3) * 11 + 8, gh = Math.ceil(b / 3) * 11 + 8; for (let g = 0; g < a; g++) { const gx = (g % 3) * (gw + 6), gy = Math.floor(g / 3) * (gh + 6); o += `<rect x="${gx + 1}" y="${gy + 1}" width="${gw}" height="${gh}" rx="6" fill="none" stroke="#000" stroke-width="1.5"/>`; for (let i = 0; i < b; i++) o += ctr(gx + 9 + (i % 3) * 11, gy + 9 + Math.floor(i / 3) * 11, '#fff', 4.2); } return pic('groups', [a, b], { count: a * b }, 3 * (gw + 6), Math.ceil(a / 3) * (gh + 6), o); },
    // rows × columns of squares
    array(r, c) { const k = Math.min(12, Math.floor(84 / Math.max(r, c))); let o = ''; for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) o += pp(1 + j * k, 1 + i * k, k, k, false); return pic('array', [r, c], { cells: r * c }, c * k + 3, r * k + 3, o); },
    // N counters in columns of b (equal groups, the last one short)
    columnsOf(n, b) { let o = ''; for (let i = 0; i < n; i++) o += ctr(Math.floor(i / b) * 12 + 6, (i % b) * 12 + 6, '#fff', 4.6); return pic('rows-of', [n, b], { count: n }, Math.ceil(n / b) * 12 + 2, b * 12 + 2, o); },
    // a bar model: parts [{label, w, dashed}], the whole's label above
    bar(type, vals, parts, whole) { const tot = parts.reduce((t, x) => t + x.w, 0); const ws = parts.map(q => Math.max(150 * q.w / tot, tw(q.label, 14) + 10)); const W = ws.reduce((a, b) => a + b, 0); let x = 1, o = ''; parts.forEach((q, k) => { const w = ws[k]; o += q.dashed ? `<rect x="${x}" y="22" width="${w}" height="26" fill="none" stroke="#000" stroke-width="1.6" stroke-dasharray="4 3"/>` : pp(x, 22, w, 26, q.on); o += txt(x + w / 2, 41, q.label, 14, 'middle'); x += w; }); o += `<path d="M1 18 v-5 h${W} v5" fill="none" stroke="#000" stroke-width="1.5"/>` + txt(W / 2 + 1, 11, whole, 13, 'middle'); return pic(type, vals, { cells: parts.filter(q => !q.dashed).length }, W + 3, 52, o); },
    // fraction bars: rows of d parts, the first `shade` parts grey across the bars
    bars(type, vals, nBars, d, shade, extra = {}, label, W = 100) { const h = 12, per = nBars > 4 ? Math.ceil(nBars / 2) : nBars, top = label ? 16 : 0; let o = '', left = shade; for (let k = 0; k < nBars; k++) { const bx = Math.floor(k / per) * (W + 10), by = top + (k % per) * (h + 4); for (let i = 0; i < d; i++) o += pp(bx + 1 + i * W / d, by + 1, W / d, h, left-- > 0); } if (label) o += `<path d="M1 13 v-4 h${W} v4" fill="none" stroke="#000" stroke-width="1.5"/>` + txt(W / 2, 8, label, 12, 'middle'); return pic(type, vals, Object.assign({ cells: nBars * d, shaded: Math.max(0, shade) }, extra), nBars > 4 ? 2 * W + 13 : W + 3, top + per * (h + 4), o); },
    // pizzas: circles of d slices, `shade` slices grey across them
    pizzas(type, vals, n, d, shade) { const R = 20; let o = '', left = shade; for (let k = 0; k < n; k++) { const cx = 22 + k * 46, cy = 22; for (let i = 0; i < d; i++) { const a0 = -Math.PI / 2 + i * 2 * Math.PI / d, a1 = a0 + 2 * Math.PI / d; const p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)]; o += `<path class="pp" d="M${cx} ${cy}L${p0[0].toFixed(1)} ${p0[1].toFixed(1)}A${R} ${R} 0 0 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}Z" fill="${left-- > 0 ? GREY : '#fff'}" stroke="#000" stroke-width="1.5"/>`; } } return pic(type, vals, { cells: n * d, shaded: Math.max(0, shade) }, n * 46, 46, o); },
  };
  // the picture for each kind, from the problem's numbers (nums: the numbers of the problem's text, in order); null = none
  const PICS = {
    'story-add': ([a, b]) => a + b <= 20 ? P.add(a, b) : P.bar('bar', [a, b], [{ label: fmt(a), w: a }, { label: fmt(b), w: b }], '?'),
    'story-sub': ([a, b]) => a <= 20 ? P.take(a, b) : P.bar('bar', [a, b], [{ label: fmt(b), w: b }, { label: '?', w: a - b }], fmt(a)),
    'story-sub-start': ([b, c]) => P.bar('bar', [b, c], [{ label: fmt(b), w: b }, { label: fmt(c), w: c }], '?'),
    'story-compare': ([a, b]) => P.compare(a, b),
    'story-mult': ([a, b]) => a * b <= 30 ? P.groups(a, b) : P.bar('bar', [a, b], Array.from({ length: a }, () => ({ label: fmt(b), w: 1 })), '?'),
    'story-mult-compare': ([b, a]) => P.bar('bar', [b, a], Array.from({ length: a }, () => ({ label: fmt(b), w: 1 })), '?'),
    'story-div': ([t, b]) => P.bar('bar', [t, b], Array.from({ length: b }, () => ({ label: '?', w: 1 })), fmt(t)),
    'story-div-group': ([t, b]) => P.bar('bar', [t, b], [{ label: fmt(b), w: b }, { label: fmt(b), w: b }, { label: '…', w: Math.max(b, t - 2 * b), dashed: true }], fmt(t)),
    'story-remainder': ([t, b]) => P.bar('bar', [t, b], [{ label: fmt(b), w: b }, { label: fmt(b), w: b }, { label: '…', w: Math.max(b, t - 2 * b), dashed: true }], fmt(t)),
    'story-mixed': ([a, b, c]) => { let o = ''; for (let i = 0; i < b; i++) o += pp(1 + i * 34, 4, 30, 30, false) + txt(16 + i * 34, 25, a, 15, 'middle'); o += txt(b * 34 + 6, 25, `− ${c}`, 16); return pic('boxes', [a, b, c], { cells: b }, b * 34 + 40, 38, o); },
    'story-frac': ([n1, d1, n2, d2]) => { const A = P.pizzas('frac', [n1, d1], 1, d1, n1), B = P.pizzas('frac', [n2, d2], 1, d2, n2); return { w: A.w + B.w, h: 46, b: A.b + place(B.b, A.w, 0) }; },
    'story-frac-mult': ([n, d]) => P.bars('frac', [n, d], 1, d, n),
    'story-frac-div': ([a, b]) => P.pizzas('wholes', [a, b], a, b, 0),
    'story-convert': ([a], s, out) => { const u = (out.match(/(\d+) (yards?|feet|foot|inch(?:es)?|miles?|metres?|meters?|km|cm|m)\b/) || [])[2] || 'unit'; let o = ''; for (let i = 0; i < a; i++) o += pp(1 + i * 40, 4, 40, 22, false) + txt(21 + i * 40, 20, u.replace(/s$/, '').replace('yard', 'yd'), 12, 'middle'); return pic('units', [a], { cells: a }, a * 40 + 3, 30, o); },
    'story-algebra': ([n, m]) => P.bar('bar', [n, m], [{ label: '?', w: Math.max(1, m - n) }, { label: fmt(n), w: n }], fmt(m)),
    'count-next': ([a, b]) => { let o = ''; [a, b, ''].forEach((v, i) => { o += pp(1 + i * 34, 2, 34, 30, false) + (v !== '' ? txt(18 + i * 34, 23, v, 15, 'middle') : ''); }); return pic('track', [a, b], { cells: 3 }, 106, 36, o); },
    'odd-even': ([n]) => { const t = Math.floor(n / 10), u = n % 10; let o = ''; for (let i = 0; i < t; i++) o += `<rect class="rod" x="${1 + i * 12}" y="1" width="9" height="60" fill="#fff" stroke="#000" stroke-width="1.6"/>`; for (let i = 0; i < u; i++) o += ctr(t * 12 + 10 + (i % 2) * 13, 7 + Math.floor(i / 2) * 13, '#fff', 5); return pic('pairs', [n], { count: u }, t * 12 + 34, 64, o); },
    'true-false': ([a, b]) => P.add(a, b),
    'mult-properties': ([a, b]) => P.array(a, b),
    'div-remainder': ([n, b]) => P.columnsOf(n, b),
    'missing-div': ([b, q]) => P.array(b, q),
    'frac-mixed-number': ([n, d]) => P.pizzas('frac-improper', [n, d], Math.ceil(n / d), d, n),
    'frac-add-mixed': (v) => mixedPair(v), 'frac-sub-mixed': (v) => mixedPair(v),
    'frac-times-whole': ([k, n, d]) => copies(k, n, d),
    'frac-times-frac': ([n1, d1, n2, d2]) => { const c = 14; let o = ''; for (let i = 0; i < d1; i++) for (let j = 0; j < d2; j++) o += pp(1 + j * c, 1 + i * c, c, c, i < n1 && j < n2); return pic('frac-area', [n1, d1, n2, d2], { cells: d1 * d2, shaded: n1 * n2 }, d2 * c + 3, d1 * c + 3, o); },
    'frac-div': ([a, , d]) => P.bars('wholes', [a, d], a, d, 0),
    'frac-as-div': ([a, b]) => P.bars('wholes', [a, b], a, b, 0),
    'frac-scaling': ([n, d, t]) => P.bars('frac-of-amount', [n, d, t], 1, d, n, {}, String(t)),
    'frac-decompose': ([n, d]) => P.bars('frac', [n, d], 1, d, n),
    'frac-tenths': ([n, d]) => P.bars('frac', [n, d], 1, d, n),
    'dec-round': (v, s, out) => { const m = out.replace(/<[^>]+>/g, ' ').match(/\d+\.\d+/); if (!m) return null; const at = Number(m[0]); const from = Math.floor(at * 10 + 1e-9) / 10, to = Math.round((from + 0.1) * 10) / 10; const x = 10 + (at - from) / 0.1 * 120; let o = ln(10, 26, 130, 26, 2); for (let i = 0; i <= 10; i++) o += ln(10 + i * 12, i % 5 ? 21 : 18, 10 + i * 12, i % 5 ? 31 : 34, 1.5); o += txt(10, 52, from.toFixed(1), 13, 'middle') + txt(130, 52, to.toFixed(1), 13, 'middle') + `<path d="M${x.toFixed(1)} 6 l-5 -6 h10 z" fill="#000"/>` + ln(x, 6, x, 24, 2); return pic('numline', [m[0]], { at: m[0], from: from.toFixed(1), to: to.toFixed(1) }, 142, 56, o); },
    'convert': ([a], s, out) => { const u = (out.replace(/<[^>]+>/g, ' ').match(/\d+ ([a-zA-Z]+) =/) || [])[1] || ''; let o = ''; for (let i = 0; i < a; i++) o += pp(1 + i * 24, 4, 24, 22, false) + txt(13 + i * 24, 20, u, 11, 'middle'); return pic('units', [a], { cells: a }, a * 24 + 3, 30, o); },
  };
  function mixedPair(v) { const groups = []; for (let i = 0; i + 2 < v.length && groups.length < 2; i += 3) groups.push(v.slice(i, i + 3)); let o = '', x = 0, H = 0; for (const [w, n, d] of groups) { const g = P.bars('frac-mixed', [w, n, d], w + 1, d, w * d + n, {}, null, 56); o += place(g.b, x, 0); x += g.w + 8; H = Math.max(H, g.h); } return { w: x, h: H, b: o }; }
  function copies(k, n, d) { const W = 72, h = 11, per = k > 4 ? Math.ceil(k / 2) : k; let o = ''; for (let b = 0; b < k; b++) { const bx = Math.floor(b / per) * (W + 8), by = (b % per) * (h + 4); for (let i = 0; i < d; i++) o += pp(bx + 1 + i * W / d, by + 1, W / d, h, i < n); } return pic('frac-copies', [k, n, d], { cells: k * d, shaded: k * n }, (k > 4 ? 2 * W + 10 : W + 3), per * (h + 4), o); }
  function withPicture(out, s, kind) {
    const m = out.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); const make = PICS[kind]; if (!m || !make) return out;
    const p = make(numsIn(out), s, out); if (!p) return out;
    const W = Number(m[1]), H = Number(m[2]); const h = Math.max(H, p.h); const body = out.replace(/<svg[^>]*>|<\/svg>$/g, '');
    return svg(Math.ceil(W + 16 + p.w), Math.ceil(h), place(body, 0, (h - H) / 2) + place(p.b, W + 16, (h - p.h) / 2));
  }
  const PLAIN_DRAW = {
    'tape': (r) => { const a = int(r, 3, 9), b = int(r, 3, 9); return lines([[`${a} + `, null, ` = ${a + b}`], ['? =', null]]); },
    'frac-bar': (r) => { const d = int(r, 3, 8), n = int(r, 1, d - 1); return svg(250, 84, txt(6, 30, `${n} of ${d} equal parts`, 18) + txt(6, 58, 'are shaded:', 18) + fracBox(222, 44)); },
    'frac-set': (r) => { const d = int(r, 4, 9), n = int(r, 1, d - 1); return svg(260, 84, txt(6, 30, `${n} of ${d} cats are black.`, 18) + txt(6, 60, 'What fraction?', 18) + fracBox(200, 44)); },
    'frac-equiv': (r) => { const a = int(r, 1, 3), b = a + int(r, 1, 3), k = int(r, 2, 4); return svg(200, 84, frac(30, 40, a, b) + txt(60, 48, '=', 24) + box(84, 6, 34, 28) + ln(80, 40, 122, 40) + txt(101, 70, b * k, 22, 'middle')); },
  };
  // the bare drawing: the problem as text and numbers (a "(No Pictures)" twin or Pictures off drops its pictures)
  function bare(s, seed, opts) {
    const kind = kindOf(s); const r = rng(s.c + ':' + s.v + ':' + (seed === undefined ? '' : seed));
    if (kind.startsWith('pool-')) return { kind, out: poolDraw(kind, s, r), off: true };
    const f = D[kind]; if (!f) return { kind, out: '', off: true };            // no drawing rather than a wrong one
    let out = f(r, s);
    const off = PLAIN.test(s.l) || (opts && opts.pictures === false);
    if (off && picCount(out) && PLAIN_DRAW[kind]) out = PLAIN_DRAW[kind](rng(s.c + ':' + s.v + ':' + (seed === undefined ? '' : seed)), s);
    return { kind, out, off };
  }
  function drawHand(s, seed, opts) {
    const { kind, out, off } = bare(s, seed, opts); if (off) return out;
    // a Visual skill or a word problem with Pictures on gets a picture drawn from its own numbers (PICS), never a stand-in
    const wantsPic = PICT.test(s.l) || /^story-/.test(kind);
    return wantsPic && (picCount(out) === 0 || /^story-/.test(kind)) ? withPicture(out, s, kind) : out;
  }
  // the bare drawing, before any picture is added (thumbs-check compares the two: an added picture must carry its data)
  function base(s, seed, opts) { return bare(s, seed, opts).out; }
  // ---- fix round 4 (critic r4 C1, stop rule §1.7): the thumbnail IS the real app's item. samples.js (capture-samples.cjs)
  // holds each live skill's first seeded cells exactly as the real sheet kit prints them, sanitised; a seed picks one of
  // them. The hand drawing above is only the fallback for a skill whose generation threw (MQ_SAMPLES.fail).
  function hashStr(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  const escA = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  function samplesOf(s) { const S = root.MQ_SAMPLES; return S && S.s ? S.s[s.c + ':' + s.v] || null : null; }
  // seed → which captured item: none (a card) is the first item; any other seed picks by its hash (New numbers re-deals)
  function sampleIndex(seed, n) { return seed === undefined || seed === null || seed === 1 ? 0 : hashStr('pick:' + seed) % n; }
  // A sample in a thumbnail: its opening sentences (prose) as live text, then the KEY part (the drawing and the problem
  // line) as the captured cell in an <svg viewBox> window. fit() sizes the window so nothing is smaller than the place's
  // minimum (Big 12 px, Medium 11, Small 9, read from --smp-min), cropping and fading rather than shrinking; a place with
  // --smp-min 0 (a page preview, the tray bar's mini picture) shows the whole item as printed.
  const escT = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function sampleSvg(key, it, j) {
    const c = it.c || [0, 0, it.w, it.ht], k = it.k === undefined ? c : it.k;
    const prose = it.p ? `<div class="smp-prose">${it.p.split('\n').map(escT).join('<br>')}</div>` : '';
    const box = k || c;
    const pic = `<svg class="smp-svg" data-c="${c.join(' ')}" data-k="${k ? k.join(' ') : ''}" data-f="${it.f || ''}" viewBox="${box.join(' ')}" width="${box[2]}" height="${box[3]}" preserveAspectRatio="xMidYMin meet" aria-hidden="true">` +
      `<foreignObject x="0" y="0" width="${it.w}" height="${it.ht}" class="smp-fo"><div xmlns="http://www.w3.org/1999/xhtml" class="smp">${it.x}</div></foreignObject></svg>`;
    return `<div class="smp-thumb${prose ? ' has-prose' : ''}${k ? '' : ' prose-only'}" data-smp="${escA(key)}" data-h="${it.h}" data-i="${j}" role="img" aria-label="${escA(it.v || it.t || '')}">${prose}${pic}</div>`;
  }
  function fitOne(t) {
    const svg = t.querySelector('.smp-svg'); if (!svg) return;
    const cs = getComputedStyle(t); const min = parseFloat(cs.getPropertyValue('--smp-min')) || 0;
    const c = svg.dataset.c.split(' ').map(Number), k = svg.dataset.k ? svg.dataset.k.split(' ').map(Number) : null, f = Number(svg.dataset.f) || 0;
    t.classList.toggle('full', !min);
    if (!min || !k) {                                   // the whole item as printed (page previews, the bar) or prose only
      svg.setAttribute('viewBox', (min ? c : c).join(' ')); t.classList.remove('cut');
      const pr = t.querySelector('.smp-prose'); if (pr) t.classList.toggle('prose-cut', min > 0 && pr.scrollHeight > pr.clientHeight + 1);
      return;
    }
    const pr = t.querySelector('.smp-prose'); if (pr) t.classList.toggle('prose-cut', pr.scrollHeight > pr.clientHeight + 1);
    const r = svg.getBoundingClientRect(); const W = r.width, H = r.height; if (W < 4 || H < 4) return;
    const meet = Math.min(W / k[2], H / k[3]); let sc = meet;
    if (f && f * meet < min) sc = min / f;
    if (sc === meet) { svg.setAttribute('viewBox', k.join(' ')); t.classList.remove('cut'); return; }
    const w = W / sc, h = H / sc; const x = k[0] + Math.max(0, (k[2] - w) / 2);
    svg.setAttribute('viewBox', [x, k[1], w, h].map(v => Math.round(v * 10) / 10).join(' '));
    t.classList.toggle('cut', w < k[2] - 1 || h < k[3] - 1);
  }
  function fit(root) { if (typeof document === 'undefined') return; (root || document).querySelectorAll('.smp-thumb').forEach(fitOne); }
  if (typeof window !== 'undefined' && window.addEventListener) { let tm = 0; window.addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => fit(document), 80); }); }
  function draw(s, seed, opts) {
    const list = samplesOf(s);
    if (!list || !list.length) return drawHand(s, seed, opts).replace(/^<svg /, '<svg data-fallback="1" ');
    const j = sampleIndex(seed, list.length);
    return sampleSvg(s.c + ':' + s.v, list[j], j);
  }
  // the n-th distinct item of a skill (previews deal 0, 1, 2 … so an item never repeats on a page); null past the last
  function drawItem(s, n, offset) {
    const list = samplesOf(s); if (!list || !list.length) return n === 0 ? draw(s, offset) : null;
    if (n >= list.length) return null; const j = (n + (offset ? hashStr('pick:' + offset) : 0)) % list.length;
    return sampleSvg(s.c + ':' + s.v, list[j], j);
  }
  // the sample a seed shows (text, answer, visible text) — previews, the board and the checks read it
  function sample(s, seed) { const list = samplesOf(s); if (!list || !list.length) return null; const j = sampleIndex(seed, list.length); return Object.assign({ i: j }, list[j]); }
  function sampleCount(s) { const list = samplesOf(s); return list ? list.length : 0; }
  // the samples' own stylesheet (atoms + a reset that keeps the page's rules out), added once
  if (typeof document !== 'undefined' && root.MQ_SAMPLES && root.MQ_SAMPLES.css && !document.getElementById('mq-samples-css')) {
    const st = document.createElement('style'); st.id = 'mq-samples-css'; st.textContent = root.MQ_SAMPLES.css; (document.head || document.documentElement).appendChild(st);
  }
  root.MQThumbs = { draw, drawItem, fit, drawHand, sample, sampleCount, sampleIndex, hashStr, base, kindOf, rng, int, picCount, KINDS: Object.keys(D), POOLS: Object.keys(POOL) };
})(typeof window !== 'undefined' ? window : globalThis);
