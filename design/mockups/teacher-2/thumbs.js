// Teacher site 2.0 mock-up: small black-and-white drawings standing in for each skill's real cell (pupil content:
// Andika, black on white, the single grey). In the app (T3) the thumbnail is the skill's own seeded cell
// (teacher-preview.js sampleFor); here a drawing is picked from the skill's name and maths area.
(function (root) {
  const FONT = 'font-family="Andika, sans-serif"';
  const GREY = '#949494';
  function rng(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-hidden="true">${body}</svg>`;
  const box = (x, y, w = 34, h = 34) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#000" stroke-width="2" rx="2"/>`;
  const txt = (x, y, s, size = 28, anchor = 'start', weight = 400) => `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="#000">${s}</text>`;
  function eq(a, op, b) { return svg(200, 60, txt(8, 42, `${a} ${op} ${b} =`) + box(146, 14)); }
  function stack(a, op, b) {
    return svg(120, 120, txt(100, 34, a, 28, 'end') + txt(100, 70, b, 28, 'end') + txt(18, 70, op) + '<line x1="14" y1="82" x2="104" y2="82" stroke="#000" stroke-width="2"/>' + box(30, 88, 74, 28));
  }
  function clock(r) {
    const h = int(r, 1, 12), m = [0, 15, 30, 45][int(r, 0, 3)];
    const ma = (m / 60) * 2 * Math.PI, ha = ((h % 12) / 12 + m / 720) * 2 * Math.PI;
    let ticks = ''; for (let i = 0; i < 12; i++) { const a = i / 12 * 2 * Math.PI; ticks += `<line x1="${50 + 36 * Math.sin(a)}" y1="${50 - 36 * Math.cos(a)}" x2="${50 + 42 * Math.sin(a)}" y2="${50 - 42 * Math.cos(a)}" stroke="#000" stroke-width="2"/>`; }
    return svg(170, 100, `<circle cx="50" cy="50" r="46" fill="#fff" stroke="#000" stroke-width="2.5"/>${ticks}` +
      `<line x1="50" y1="50" x2="${50 + 24 * Math.sin(ha)}" y2="${50 - 24 * Math.cos(ha)}" stroke="#000" stroke-width="4" stroke-linecap="round"/>` +
      `<line x1="50" y1="50" x2="${50 + 36 * Math.sin(ma)}" y2="${50 - 36 * Math.cos(ma)}" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>` + box(108, 30, 56, 36));
  }
  function bars(r) {
    let b = ''; for (let i = 0; i < 4; i++) { const h = int(r, 2, 6) * 10; b += `<rect x="${24 + i * 34}" y="${84 - h}" width="22" height="${h}" fill="${i === 1 ? GREY : '#fff'}" stroke="#000" stroke-width="2"/>`; }
    return svg(170, 100, '<line x1="16" y1="84" x2="164" y2="84" stroke="#000" stroke-width="2"/><line x1="16" y1="10" x2="16" y2="84" stroke="#000" stroke-width="2"/>' + b);
  }
  function tally(r) { const n = int(r, 6, 13); let s = ''; let x = 10; for (let i = 0; i < n; i++) { if (i % 5 === 4) { s += `<line x1="${x - 34}" y1="44" x2="${x - 2}" y2="16" stroke="#000" stroke-width="2.5"/>`; x += 12; } else { s += `<line x1="${x}" y1="14" x2="${x}" y2="46" stroke="#000" stroke-width="2.5"/>`; x += 8; } } return svg(170, 60, s + box(130, 14)); }
  function fracBar(r) {
    const d = int(r, 3, 6), n = int(r, 1, d - 1); let s = '';
    for (let i = 0; i < d; i++) s += `<rect x="${10 + i * (150 / d)}" y="10" width="${150 / d}" height="34" fill="${i < n ? GREY : '#fff'}" stroke="#000" stroke-width="2"/>`;
    return svg(170, 100, s + `<text x="70" y="72" ${FONT} font-size="20">shaded</text>` + box(124, 54, 30, 40) + '<line x1="124" y1="74" x2="154" y2="74" stroke="#000" stroke-width="2"/>');
  }
  function shapes() { return svg(180, 80, '<polygon points="10,70 40,12 70,70" fill="none" stroke="#000" stroke-width="2.5"/><rect x="80" y="20" width="44" height="44" fill="none" stroke="#000" stroke-width="2.5"/><polygon points="150,14 172,28 172,56 150,70 128,56 128,28" fill="none" stroke="#000" stroke-width="2.5"/>'); }
  function solid() { return svg(160, 90, '<rect x="20" y="30" width="60" height="50" fill="none" stroke="#000" stroke-width="2.5"/><polygon points="20,30 44,10 104,10 80,30" fill="none" stroke="#000" stroke-width="2.5"/><polygon points="80,30 104,10 104,60 80,80" fill="none" stroke="#000" stroke-width="2.5"/>' + box(118, 40)); }
  function rods(r) {
    const t = int(r, 2, 4), o = int(r, 1, 6); let s = '';
    for (let i = 0; i < t; i++) { s += `<rect x="${10 + i * 16}" y="6" width="12" height="80" fill="#fff" stroke="#000" stroke-width="2"/>`; for (let k = 1; k < 10; k++) s += `<line x1="${10 + i * 16}" y1="${6 + k * 8}" x2="${22 + i * 16}" y2="${6 + k * 8}" stroke="#000" stroke-width="1"/>`; }
    for (let i = 0; i < o; i++) s += `<rect x="${20 + t * 16 + (i % 3) * 14}" y="${62 - Math.floor(i / 3) * 14}" width="12" height="12" fill="#fff" stroke="#000" stroke-width="2"/>`;
    return svg(170, 92, s + box(128, 30));
  }
  function tenFrame(r) {
    const n = int(r, 4, 9); let s = '';
    for (let i = 0; i < 10; i++) { const x = 8 + (i % 5) * 26, y = 8 + Math.floor(i / 5) * 26; s += `<rect x="${x}" y="${y}" width="26" height="26" fill="#fff" stroke="#000" stroke-width="2"/>`; if (i < n) s += `<circle cx="${x + 13}" cy="${y + 13}" r="8" fill="#000"/>`; }
    return svg(190, 64, s + box(148, 14));
  }
  function nline(r) {
    const a = int(r, 2, 8) * 10; let s = '<line x1="8" y1="40" x2="192" y2="40" stroke="#000" stroke-width="2"/>';
    for (let i = 0; i <= 10; i++) s += `<line x1="${12 + i * 17.6}" y1="${i % 5 ? 33 : 28}" x2="${12 + i * 17.6}" y2="47" stroke="#000" stroke-width="2"/>`;
    return svg(200, 80, s + txt(12, 72, a, 18, 'middle') + txt(188, 72, a + 10, 18, 'middle') + '<path d="M118 20 l6 8 l6 -8" fill="none" stroke="#000" stroke-width="2"/>');
  }
  function coins(r) { const v = [1, 5, 10, 25]; let s = ''; for (let i = 0; i < 4; i++) { const c = v[int(r, 0, 3)]; s += `<circle cx="${24 + i * 34}" cy="34" r="${c === 25 ? 15 : c === 5 ? 13 : 11}" fill="#fff" stroke="#000" stroke-width="2"/>` + txt(24 + i * 34, 40, c + '¢', 13, 'middle'); } return svg(190, 68, s + box(150, 17)); }
  function ruler() { let s = '<rect x="8" y="40" width="170" height="26" fill="#fff" stroke="#000" stroke-width="2"/>'; for (let i = 0; i <= 10; i++) s += `<line x1="${12 + i * 16}" y1="40" x2="${12 + i * 16}" y2="${i % 5 ? 50 : 56}" stroke="#000" stroke-width="1.5"/>`; return svg(190, 72, s + `<rect x="12" y="18" width="${16 * 7}" height="12" fill="${GREY}" stroke="#000" stroke-width="2"/>`); }
  function ratio(r) { const a = int(r, 2, 5), b = int(r, 3, 7); return svg(190, 80, `<rect x="8" y="8" width="174" height="64" fill="none" stroke="#000" stroke-width="2"/><line x1="8" y1="40" x2="182" y2="40" stroke="#000" stroke-width="2"/><line x1="66" y1="8" x2="66" y2="72" stroke="#000" stroke-width="2"/><line x1="124" y1="8" x2="124" y2="72" stroke="#000" stroke-width="2"/>` + txt(37, 32, a, 22, 'middle') + txt(95, 32, a * 2, 22, 'middle') + txt(37, 64, b, 22, 'middle') + txt(95, 64, b * 2, 22, 'middle') + box(136, 44, 34, 24)); }
  function words() { return svg(200, 80, txt(8, 28, 'sum', 22) + txt(8, 66, 'half', 22) + txt(110, 28, '3 + 4 = 7', 18) + txt(110, 66, '½', 22) + '<circle cx="80" cy="21" r="4" fill="#000"/><circle cx="100" cy="21" r="4" fill="#000"/><circle cx="80" cy="59" r="4" fill="#000"/><circle cx="100" cy="59" r="4" fill="#000"/>'); }
  function story(r) { const a = int(r, 6, 19), b = int(r, 3, 9); return svg(210, 80, txt(6, 24, `Ana has ${a} shells.`, 17) + txt(6, 46, `She finds ${b} more.`, 17) + txt(6, 70, 'How many now?', 17) + box(160, 44, 40, 30)); }
  function draw(s) {
    const r = rng(s.c + ':' + s.v); const L = (s.l + ' ' + s.v).toLowerCase(); const a = s.a;
    if (a === 'WORDS') return words();
    if (a === 'MIXED') return svg(200, 90, txt(8, 36, `${int(r, 3, 9)} + ${int(r, 2, 9)} =`) + box(146, 10) + txt(8, 80, `${int(r, 11, 19)} − ${int(r, 2, 9)} =`) + box(146, 54));
    if (/word problem|_wp|story/.test(L)) return story(r);
    if (/time|clock/.test(L)) return clock(r);
    if (/money|coin|cent|dollar/.test(L)) return coins(r);
    if (/tally/.test(L)) return tally(r);
    if (/graph|pictograph|bar|plot|chart|data|probab|mean|median/.test(L) || a === 'DATA') return bars(r);
    if (/number line|_nl/.test(L)) return nline(r);
    if (/3d|solid|faces|edges/.test(L)) return solid();
    if (a === 'G' || /shape|angle|polygon|triangle/.test(L)) return shapes();
    if (/fraction|_frac/.test(L) || a === 'NF') return fracBar(r);
    if (/base-10|base10|regroup|rods|flats/.test(L)) return rods(r);
    if (a === 'CC' || /count|ten frame/.test(L)) return tenFrame(r);
    if (a === 'RPNS') return ratio(r);
    if (/odd|even/.test(L)) return svg(200, 60, txt(8, 42, `${int(r, 11, 49)}`) + txt(70, 40, 'odd', 20) + txt(124, 40, 'even', 20) + '<rect x="64" y="16" width="48" height="34" fill="none" stroke="#000" stroke-width="2" rx="17"/><rect x="118" y="16" width="56" height="34" fill="none" stroke="#000" stroke-width="2" rx="17"/>');
    if (/round/.test(L)) return svg(210, 60, txt(6, 40, `${int(r, 12, 98)} → nearest 10`, 22) + box(168, 14));
    if (/compar|greater|less/.test(L)) return svg(200, 60, txt(10, 42, int(r, 10, 99)) + box(78, 14) + txt(130, 42, int(r, 10, 99)));
    if (/word form|in words|vocab|name/.test(L)) return svg(210, 60, txt(6, 40, `${int(r, 21, 99)} =`, 26) + '<line x1="70" y1="44" x2="200" y2="44" stroke="#000" stroke-width="2"/>');
    if (/divi|÷|share/.test(L)) { const b = int(r, 2, 9), q = int(r, 2, 9); return eq(b * q, '÷', b); }
    if (/multipl|times|×|array|product/.test(L)) return eq(int(r, 2, 9), '×', int(r, 2, 9));
    if (a === 'MEAS' || /measure|length|mass|capacity|perimeter|area|volume/.test(L)) return ruler();
    if (/subtract|minus|take/.test(L)) return /2-digit|3-digit|column|100|1000|regroup/.test(L) ? stack(int(r, 51, 98), '−', int(r, 12, 49)) : eq(int(r, 11, 19), '−', int(r, 2, 9));
    if (/2-digit|3-digit|column|within 100|within 50|within 1000|100s|10s/.test(L)) return stack(int(r, 21, 68), '+', int(r, 11, 29));
    return eq(int(r, 3, 9), '+', int(r, 2, 9));
  }
  root.MQThumbs = { draw, rng, int };
})(typeof window !== 'undefined' ? window : globalThis);
