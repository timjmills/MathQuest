// For each Y5 step (Grade 4 sheet): school week, PRIOR list for that week mapped to WRM step ids, and their tagged skills.
import fs from 'fs';
import { execFileSync } from 'child_process';
const R=new URL('../../../',import.meta.url).pathname;
const w=await import(R+'js/modules/wrm.js');
const d=JSON.parse(fs.readFileSync(R+'data/curriculum/wrm-steps.json','utf8'));
const rows=JSON.parse(execFileSync('python3',['-I','-c',`
import openpyxl,json
wb=openpyxl.load_workbook('${R}data/curriculum/source/Awsaj-Domain-Sequence-K-5-2026-27.xlsx',read_only=True,data_only=True)
out=[]
for i,r in enumerate(wb['Grade 4'].iter_rows(values_only=True)):
  if i==0: continue
  r=list(r)+['']*16
  out.append([r[0],r[6],r[14] or ''])
print(json.dumps(out))`]).toString());
const norm=s=>String(s).toLowerCase().replace(/\(us:[^)]*\)/g,'').replace(/[–—-]/g,'-').replace(/[^a-z0-9,]+/g,' ').trim();
const steps={};
for(const y of d.years) for(const b of y.blocks) for(const s of b.steps) steps[s.id]={...s,year:y.id};
const byTitle={};
for(const s of Object.values(steps)){ for(const t of [s.title,s.siteTitle].filter(Boolean)) (byTitle[s.year+'|'+norm(t)]??=[]).push(s.id);}
const prefix={'Rec/PK4':'R','Y1/KG':'Y1','Y2/Gr.1':'Y2','Y3/Gr.2':'Y3','Y4/Gr.3':'Y4','Y5/Gr.4':'Y5'};
const weekPrior={};let cur=null;const firstWeek={};
for(const[wk,lesson,pl] of rows){ if(pl&&!String(pl).startsWith('Operations')&&!/Test/.test(pl)) weekPrior[wk]=pl; const ids=byTitle['Y5|'+norm(lesson)]; if(ids) for(const id of ids) firstWeek[id]??=wk; }
// The sheet writes "3D shapes" (W26) where WRM writes "3-D shapes"; the normaliser cannot join them
for(const[id,wk] of Object.entries({'Y5.B10.S10':'W26'})) firstWeek[id]??=wk;
const tags={};
for(const[k,v] of Object.entries(w.SKILL_WRM)) for(const e of v){const s=typeof e==='string'?e:e.step;(tags[s]??=[]).push(k+(typeof e==='string'?'':'*'));}
const out={};
for(const s of Object.values(steps).filter(s=>s.year==='Y5')){
  const wk=firstWeek[s.id]; const pl=wk?weekPrior[wk]:'';
  const items=(pl||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/^(\S+)\s+(.*)$/);const y=prefix[m[1]];const ids=byTitle[y+'|'+norm(m[2])]||[];return {raw:x,ids,skills:ids.flatMap(i=>tags[i]||[])};});
  out[s.id]={wk,items};
}
fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
if(process.argv.includes('-v')) for(const[id,o] of Object.entries(out)){ console.log(id,o.wk); for(const it of o.items) console.log('   ',it.raw,'=>',it.ids.join(','),'::',it.skills.join(' '));}
