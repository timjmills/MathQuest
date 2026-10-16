// For each Y6 step: its school week (xlsx sheet "Grade 5", first lesson whose title matches) and the week's PRIOR-LEARNING
// list mapped to WRM step ids. usage: node prior.mjs <out prior.json>
import fs from 'fs';
import { execFileSync } from 'child_process';
const R=new URL('../../../',import.meta.url).pathname;
const d=JSON.parse(fs.readFileSync(R+'data/curriculum/wrm-steps.json','utf8'));
const rows=JSON.parse(execFileSync('python3',['-I','-c',`
import openpyxl,json,sys
wb=openpyxl.load_workbook(sys.argv[1],read_only=True,data_only=True)
out=[]
for i,r in enumerate(wb['Grade 5'].iter_rows(values_only=True)):
  if i==0: continue
  r=list(r)+['']*16
  out.append([r[0],r[6],r[14] or ''])
print(json.dumps(out))`,R+'data/curriculum/source/Awsaj-Domain-Sequence-K-5-2026-27.xlsx']).toString());
const norm=s=>String(s).toLowerCase().replace(/\(us:[^)]*\)/g,'').replace(/[–—-]/g,'-').replace(/[^a-z0-9,]+/g,' ').trim();
const steps={};
for(const y of d.years) for(const b of y.blocks) for(const s of b.steps) steps[s.id]={...s,year:y.id};
const byTitle={};
for(const s of Object.values(steps)){ for(const t of [s.title,s.siteTitle].filter(Boolean)) (byTitle[s.year+'|'+norm(t)]??=[]).push(s.id);}
const prefix={'Rec/PK4':'R','Y1/KG':'Y1','Y2/Gr.1':'Y2','Y3/Gr.2':'Y3','Y4/Gr.3':'Y4','Y5/Gr.4':'Y5','Y6/Gr.5':'Y6'};
const weekPrior={};const firstWeek={};
for(const[wk,lesson,pl] of rows){ if(pl&&pl!=='None'&&!/Test/.test(pl)) weekPrior[wk]??=pl; const ids=byTitle['Y6|'+norm(lesson)]; if(ids) for(const id of ids) firstWeek[id]??=wk; }
const out={};
for(const s of Object.values(steps).filter(s=>s.year==='Y6')){
  const wk=firstWeek[s.id]; const pl=wk?weekPrior[wk]:'';
  const items=(pl||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/^(\S+)\s+(.*)$/);const y=m&&prefix[m[1]];const ids=y?(byTitle[y+'|'+norm(m[2])]||[]):[];return {raw:x,ids};});
  out[s.id]={wk:wk||'',items};
}
fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
const miss=Object.entries(out).filter(([k,v])=>!v.wk).map(([k])=>k);
console.log('prior: steps',Object.keys(out).length,'without a school week',miss.length,miss.join(' '));
