// r11 (critic r10 §4): the lane's five-year merge, adapted from the critic's independent mergeall.mjs (r10 scratch).
// Two changes, both on agreeing fixes only: a fix one lane carries on ANOTHER year's step, and the same tag fixed by two
// lanes, are NOTES when the tag state they produce is the same (and that year's file then matches it, which the step check
// below asserts); they stay problems when the two lanes would leave different tags. Inputs: the passed lanes' files as
// vendored under design/audit/runs/wrm-tagging/inputs/. usage: node mergeall5.mjs [R Y1 Y2 Y3 Y4 | reverse]
// Independent critic merge: apply R, Y1, Y2, Y3, Y4 tagFixes in sequence to ONE copy of live SKILL_WRM, one universal rule:
//  remove -> drop; partial -> clause = t.partial ?? t.why; add -> partial if 'partial' in t or why /^partial: /, else full;
//  full -> full; opts -> no-op. Then every year's steps must equal its file (after ALL merges, not just its own).
import fs from 'fs';
const m=new Map();globalThis.localStorage={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};globalThis.window=globalThis;globalThis.document={};
const ROOT=new URL('../../../',import.meta.url).pathname;const INP=ROOT+'design/audit/runs/wrm-tagging/inputs/';
const _l=console.log;console.log=()=>{};
const {SKILL_WRM}=await import(ROOT+'js/modules/wrm.js');const {SKILLS}=await import(ROOT+'js/modules/data.js');const {SKILL_ALIASES}=await import(ROOT+'js/modules/skill-aliases.js');
console.log=_l;
const live=k=>{const[c,s]=k.split(':');return (SKILLS[c]||[]).some(x=>x&&x.v===s);};
const files={R:INP+'R.json',Y1:INP+'Y1.json',Y2:ROOT+'data/curriculum/links/Y2.json',Y3:ROOT+'data/curriculum/links/Y3.json',Y4:INP+'Y4.json'};
const A=process.argv.slice(2);const order=A[0]==='reverse'?['Y4','Y3','Y2','Y1','R']:A.length?A:['R','Y1','Y2','Y3','Y4'];const N=[];const res=new Map();
const D={};for(const y of order)D[y]=JSON.parse(fs.readFileSync(files[y]));
const tag=new Map();for(const[k,v]of Object.entries(SKILL_WRM))for(const e of v){const s=typeof e==='string'?e:e.step;const id=k+'|'+s;if(tag.has(id))console.log('BASE-DUP',id);tag.set(id,typeof e==='object'&&'partial' in e?{st:'partial',c:e.partial}:{st:'full'});}
const P=[];const touched=new Map();
for(const y of order){for(const t of D[y].tagFixes){const id=t.key+'|'+t.step;
  const res1=t.action==='remove'?'none':t.action==='opts'?null:(t.action==='partial'?'partial:'+(t.partial??t.why):t.action==='add'?('partial' in t?'partial:'+t.partial:/^partial: /.test(t.why||'')?'partial:'+t.why.slice(9):'full'):'full');
  if(!t.step.startsWith(y+'.'))N.push(`${y}: fix on another year's step ${id} (checked against that year's file below)`);
  if(touched.has(id)&&touched.get(id)!==y){if(res1!==null&&res.get(id)!==undefined&&res.get(id)!==res1)P.push(`${y}: ${id} also fixed by ${touched.get(id)}, with a different result: ${res.get(id)} vs ${res1}`);else N.push(`${y}: ${id} also fixed by ${touched.get(id)}, same result (${res1})`);}
  const prevLane=touched.get(id);touched.set(id,y);if(res1!==null)res.set(id,res1);
  if(t.action!=='remove'&&!live(t.key))P.push(`${y}: fix names a non-live key ${t.key}`);
  const had=tag.get(id);
  if(t.action==='remove'){if(!had)P.push(`${y}: remove of untagged ${id}`);tag.delete(id);}
  else if(t.action==='partial'){const c=t.partial??t.why;if(had?.st==='partial'&&had.c===c)(prevLane&&prevLane!==y?N:P).push(`${y}: no-op partial ${id}${prevLane&&prevLane!==y?' (already set the same by '+prevLane+')':''}`);tag.set(id,{st:'partial',c});}
  else if(t.action==='add'){const mm=/^partial: ([\s\S]*)/.exec(t.why||'');if('partial' in t)tag.set(id,{st:'partial',c:t.partial});else if(mm)tag.set(id,{st:'partial',c:mm[1]});else{if(had?.st==='full')P.push(`${y}: add on already-full ${id}`);tag.set(id,{st:'full'});}}
  else if(t.action==='full'){tag.set(id,{st:'full'});}
  else if(t.action==='opts'){if(!had)P.push(`${y}: opts on untagged ${id}`);}
  else P.push(`${y}: unknown action ${t.action} ${id}`);}}
let n=0;
for(const y of order){const d=D[y];const want=new Map();
  for(const[sid,s]of Object.entries(d.steps)){for(const e of s.partial){const id=e.key+'|'+sid,w=want.get(id);want.set(id,{st:'partial',c:w&&!w.c.includes(e.missing)?w.c+'; '+e.missing:e.missing});}}
  for(const[sid,s]of Object.entries(d.steps))for(const e of s.direct)want.set(e.key+'|'+sid,{st:'full'});
  for(const[id,w]of want){n++;const g=tag.get(id);if(!g)P.push(`${y}: MISSING ${id} (${w.st})`);else if(g.st!==w.st)P.push(`${y}: VERDICT ${id} merged ${g.st} file ${w.st}`);else if(w.st==='partial'&&g.c!==w.c)P.push(`${y}: CLAUSE ${id}\n   merged: ${g.c}\n   file  : ${w.c}`);}
  for(const id of tag.keys()){const sid=id.split('|')[1];if(d.steps[sid]&&!want.has(id))P.push(`${y}: EXTRA ${id}`);}
  for(const[sid,s]of Object.entries(d.steps)){const ts=[...tag].filter(([id])=>id.split('|')[1]===sid).map(([,v])=>v.st);const v=ts.includes('full')?'full':ts.length?'partial':'gap';if(v!==s.verdict)P.push(`${y}: STEP ${sid} merged ${v} file ${s.verdict}`);
    if(s.verdict!=='full'&&s.direct.length)P.push(`${y}: ${sid} verdict ${s.verdict} with a direct`);
    for(const e of [...s.direct,...s.partial,...s.pre,...s.related])if(!live(e.key))P.push(`${y}: ${sid} non-live key ${e.key}`);}
  // proposal ids referenced exist
  for(const[sid,s]of Object.entries(d.steps))for(const b of [...(s.build||[]),...(s.preBuild||[])])if(!d.proposals[b])P.push(`${y}: ${sid} build id ${b} not in proposals`);
}
// cross-year proposal id clash with different content
const pid=new Map();for(const y of order)for(const[id,p]of Object.entries(D[y].proposals)){if(pid.has(id)){const[q,py]=pid.get(id);if(q.skill!==p.skill||q.kind!==p.kind)P.push(`proposal ${id}: ${py} ${q.kind} ${q.skill} vs ${y} ${p.kind} ${p.skill}`);}else pid.set(id,[p,y]);}
if(N.length)console.log(N.map(x=>'NOTE '+x).join('\n'));console.log(P.join('\n'));console.log(`mergeall ${order.join('+')}: ${n} tags checked; ${P.length} problems`);

process.exit(P.length?1:0);
