const fs=require('fs');
const log=fs.readFileSync(process.argv[2],'utf8').split('\n');
const sib={}; let cur=null;
for(const l of log){ const m=/^((addition|subtraction):\S+)\|(\S+)\s/.exec(l); if(m){cur=m[1]+'|'+m[3]; sib[cur]=sib[cur]||{}; continue;}
  const r=/^\s+\+ ([SML]) (.+?): \d+ -> (\d+)/.exec(l); if(r&&cur){ sib[cur][r[1]+' '+r[2]]=+r[3]; } }
const ours=require(process.argv[3]);
const pair={sub_50_no_regroup:['add_100_regroup','sub_100_regroup'],sub_100_no_regroup:['add_100_regroup','sub_100_regroup'],sub_2d_1d:['add_100_regroup','sub_100_regroup'],
 sub_1k_no_regroup:['add_1k_regroup','sub_1k_regroup'],sub_10k_no_regroup:['add_10k_regroup','sub_10k_regroup'],sub_100k_no_regroup:['sub_100k_regroup'],sub_1m_no_regroup:['sub_1m_regroup']};
const allSib=Object.values(pair).flat().filter((v,i,a)=>a.indexOf(v)===i);
let over=[], ok=0;
for(const r of ours.rows){ if(r.status!=='RED')continue; const sk=r.skill.split(':')[1];
  for(const [sz,v] of Object.entries(r.sizes)) for(const [cls,n] of Object.entries(v.counts||{})){
    const key=sz+' '+cls;
    const get=(list)=>Math.max(-1,...list.map(s=>{const id=(s.startsWith('add')?'addition:':'subtraction:')+s+'|'+r.kind+'/'+r.row; return sib[id]? (sib[id][key]||0) : -1;}));
    const p=get(pair[sk]); const any=get(allSib);
    if(p>=n) ok++; else over.push(`${r.id} ${key}: ours ${n}, paired sib ${p<0?'n/a':p}, any sib ${any<0?'n/a':any}`);
  } }
console.log('within paired sibling counts:',ok); console.log('ABOVE:',over.length); console.log(over.join('\n'));
