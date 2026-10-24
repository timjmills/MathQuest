// usage: node cmp2.cjs <siblings matrix json> <ours matrix json>
// Absolute counts (rows[].sizes[S|M|L].counts) of ours vs the paired approved siblings at the same row and size.
const sib = require(process.argv[2]), ours = require(process.argv[3]);
const pair = { sub_50_no_regroup: ['add_100_regroup', 'sub_100_regroup'], sub_100_no_regroup: ['add_100_regroup', 'sub_100_regroup'], sub_2d_1d: ['add_100_regroup', 'sub_100_regroup'],
  sub_1k_no_regroup: ['add_1k_regroup', 'sub_1k_regroup'], sub_10k_no_regroup: ['add_10k_regroup', 'sub_10k_regroup'], sub_100k_no_regroup: ['sub_100k_regroup'], sub_1m_no_regroup: ['sub_1m_regroup'] };
const idx = {};
for (const r of sib.rows) idx[`${r.skill.split(':')[1]}|${r.kind}/${r.row}`] = r;
const allSib = [...new Set(Object.values(pair).flat())];
let ok = 0; const over = []; const na = [];
for (const r of ours.rows) {
  const sk = r.skill.split(':')[1];
  for (const [sz, v] of Object.entries(r.sizes || {})) for (const [cls, n] of Object.entries((v && v.counts) || {})) {
    const get = (list) => Math.max(-1, ...list.map((s) => { const x = idx[`${s}|${r.kind}/${r.row}`]; const vv = x && x.sizes && x.sizes[sz]; return vv && vv.counts ? (vv.counts[cls] || 0) : -1; }));
    const p = get(pair[sk]), any = get(allSib);
    if (p < 0) na.push(`${r.id} ${sz} ${cls}: ours ${n}, no sibling row`);
    else if (p >= n) ok++;
    else over.push(`${r.id} ${sz} ${cls}: ours ${n}, paired sib ${p}, any sib ${any}`);
  }
}
console.log('within paired sibling counts:', ok); console.log('ABOVE:', over.length); console.log(over.join('\n'));
if (na.length) { console.log('NO SIBLING ROW:', na.length); console.log(na.join('\n')); }
