// Area of every skill under IMPROVEMENT_PLAN.md §2.7 "Where the area comes from"; per-grade area sets. Run: node areas.mjs
const root=new URL('../../../js/modules/', import.meta.url).href;
globalThis.window=globalThis; globalThis.document={getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},createElement:()=>({style:{}})}; globalThis.localStorage={getItem:()=>null,setItem(){}};
const {SKILLS,getSkillGrade}=await import(root+'data.js');
const {SKILL_STANDARDS}=await import(root+'standards.js');
function area(code,g){ const m=code.match(/^(K|\d)\.([A-Z]+)(?:\.([A-Z]))?/); if(!m) return null; const [_,cg,d,cl]=m;
 if(d==='CC')return'CC'; if(d==='OA'||d==='EE')return'OA'; if(d==='NBT')return'NBT'; if(d==='NF')return'NF';
 if(d==='MD'){const data={K:'B','1':'C','2':'D','3':'B','4':'B','5':'B'}; return cl===data[cg]?'DATA':'MEAS';}
 if(d==='SP')return'DATA'; if(d==='G')return'G';
 if(d==='RP'||d==='NS'){ if(g!=='6'&&g!=='M'){ if(d==='NS'&&cl==='C') return 'G'; if(d==='NS'&&cl==='B') return 'OA'; } return 'RPNS'; }
 return 'OTHER'; }
const rows=[]; const catVotes={};
for(const [cat,list] of Object.entries(SKILLS)) for(const s of list){ if(!s||!s.v||s.retired) continue;
  const g=String(getSkillGrade(s.v,cat)??'?'); const st=SKILL_STANDARDS[cat+':'+s.v]; const code=st&&st.ccss&&st.ccss[0];
  const a=code?area(code,g):null; rows.push({cat,v:s.v,g,a}); if(a){(catVotes[cat]=catVotes[cat]||{})[a]=(catVotes[cat][a]||0)+1;} }
const CATMAP={probability:'DATA'};
const maj=c=>{if(CATMAP[c]) return CATMAP[c]; const v=catVotes[c]; if(!v) return null; const tot=Object.values(v).reduce((x,y)=>x+y,0); const [top,n]=Object.entries(v).sort((x,y)=>y[1]-x[1])[0]; return n*2>tot?top:null;}; // a clear majority (more than half), else Mixed
const counts={}, sets={}, how={tagged:0,category:0,words:0,mixedgrey:0};
for(const r of rows){ let a=r.a;
  if(r.cat==='vocabulary'){a='WORDS';how.words++;}
  else if(!a){ a=maj(r.cat); if(a) how.category++; else {a='MIXED';how.mixedgrey++;} }
  else how.tagged++;
  (sets[r.g]=sets[r.g]||new Set()).add(a); counts[a]=(counts[a]||0)+1; }
console.log('how',JSON.stringify(how)); console.log('counts',JSON.stringify(counts));
for(const g of ['K','1','2','3','4','5','6','M','?']) console.log(g,[...(sets[g]||[])].sort().join(' '));
const fallback=rows.filter(r=>!r.a&&r.cat!=='vocabulary').map(r=>`${r.g} ${r.cat}:${r.v}->${maj(r.cat)}`);
console.log('category-fallback', fallback.length); console.log(fallback.join(' | '));
