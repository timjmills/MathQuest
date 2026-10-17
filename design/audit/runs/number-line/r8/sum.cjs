// node sum.cjs file.jsonl : one line per case: flags per step and scroll moves (bounce = down then up)
const fs = require('fs');
const rows = fs.readFileSync(process.argv[2], 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const tot = { cases: 0, fitsUnder: 0, boxOut: 0, chkOut: 0, labels: 0, labelsQ1: 0, bounces: 0, bigJumps: 0, err: 0, tapJump: 0, pageErr: 0 };
for (const r of rows) {
  tot.cases++;
  if (r.error) tot.err++;
  if (r.errors && r.errors.length) tot.pageErr++;
  const parts = [];
  for (const s of r.steps) {
    if (s.dy !== undefined && s.dy !== 0) { tot.tapJump++; parts.push(`${s.at} dy${s.dy}`); }
    if (!s.m) { if (/forced/.test(s.at)) parts.push(s.at); continue; }
    const f = s.bad;
    if (f.some((b) => b.startsWith('BAND-UNDER-HDR(fits)'))) tot.fitsUnder++;
    if (f.includes('BOX-OUT')) tot.boxOut++;
    if (f.includes('CHECK-OUT')) tot.chkOut++;
    if (f.some((b) => b.startsWith('LABELS'))) { if (s.at === 'q1') tot.labelsQ1++; else tot.labels++; }
    // moves seen by the pupil: positions held >= 2 frames
    const seg = (s.trace && s.trace.seg) || [];
    const held = seg.map((x) => x.split('x')).filter(([, n]) => +n >= 2).map(([p]) => +p.split('/')[0]);
    let rev = 0; for (let i = 2; i < held.length; i++) if ((held[i] - held[i - 1]) * (held[i - 1] - held[i - 2]) < 0) rev++;
    if (rev) tot.bounces++;
    let big = 0; for (let i = 1; i < held.length; i++) big = Math.max(big, Math.abs(held[i] - held[i - 1]));
    if (big >= 30) tot.bigJumps++;
    const flag = f.length ? '[' + f.join(' ') + ']' : '';
    parts.push(`${s.at}:sy${s.m.sy}/h${s.m.hdr}/b${s.m.band ? s.m.band.top : '-'}${flag}${seg.length > 1 ? ' seg ' + seg.join('>') : ''}`);
  }
  console.log(r.tag + (r.error ? ' ERROR ' + r.error : '') + (r.errors && r.errors.length ? ' PAGEERR ' + r.errors.join(';') : '') + '\n   ' + parts.join('\n   '));
}
console.log('TOTAL', JSON.stringify(tot));
