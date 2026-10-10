// node build.mjs <YEAR> [maxBlock] [--unmatched] -> writes data/curriculum/links/<YEAR>.json
// Round 2 method (after critic Y2-Y3 r1):
//  - direct/partial come from the step's hand verdict in overrides.mjs (`direct` / `partials` replace the old tags; every
//    judgement was made from items generated with items.mjs and logged in design/audit/runs/wrm-tagging/<Y>-items.md);
//    an old SKILL_WRM `note` is never copied into opts. tagFixes are the diff against SKILL_WRM.
//  - pre-skills: the xlsx week list is FILTERED by topic (a prior step is kept only when its topic feeds this step's topic,
//    see FEEDS), proposals in preBuild get the same filter and never repeat the step's own build; Test-row weeks and thin
//    lists fall back to the steps before in the block, then the previous year's steps on the same topic. Never empty.
//  - related: hand entries, the next step's skills, skills on the SAME standard code (max 3), and for measure/geometry steps
//    the neighbouring steps' skills in the block. No "same cluster" padding.
import fs from 'fs';
import { execFileSync } from 'child_process';
globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.window=globalThis;globalThis.document={};
const HERE=new URL('.',import.meta.url).pathname;
const root=new URL('../../../',import.meta.url).pathname;
const [YEAR, MAXB] = [process.argv[2], +process.argv[3] || 99];
const _log=console.log;console.log=()=>{};
const {SKILLS}=await import(root+'js/modules/data.js');
console.log=_log;
const {SKILL_WRM,WRM_PROPOSALS}=await import(root+'js/modules/wrm.js');
const {SKILL_STANDARDS}=await import(root+'js/modules/standards.js');
const {SKILL_ALIASES}=await import(root+'js/modules/skill-aliases.js');
const BL=await import(root+'js/modules/build-list.js');
const OV=(await import(HERE+'overrides.mjs?'+Date.now()));
const W=JSON.parse(fs.readFileSync(root+'data/curriculum/wrm-steps.json'));

const label={};for(const[c,l]of Object.entries(SKILLS))for(const s of l||[])if(s&&s.v)label[c+':'+s.v]=s.l;
const live=k=>!!label[k];
const resolve=k=>{if(live(k))return k;const a=SKILL_ALIASES[k];if(a){const c=k.split(':')[0];const r=c+':'+a.skillId;if(live(r))return r;}return null;};
const stepById={},titleIdx={};const order=[];
for(const y of W.years)for(const b of y.blocks)for(const s of b.steps){s.year=y.id;s.block=b;stepById[s.id]=s;order.push(s.id);(titleIdx[y.id+'|'+norm(s.title)]??=[]).push(s.id);}
function norm(t){return String(t).toLowerCase().replace(/\(us[^)]*\)/g,'').replace(/[–—-]/g,' ').replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,'');}

// ---- topics: which earlier learning can feed which step ----
function topic(s){const b=s.block.name.toLowerCase(),t=s.title.toLowerCase();
  if(/mass|capacity|volume|temperature|length, height and time/.test(b)){
    if(/time|clock|o.clock|day|week|month|morning|sequence events/.test(t)&&!/capacit/.test(t))return 'time';
    if(/capacit|volume|litre|ml\b|full|empty/.test(t))return 'capacity';
    if(/temperature|°|thermometer/.test(t))return 'temp';
    if(/length|height|tall|long|short|cm|metre/.test(t))return 'length';
    return 'mass';}
  if(/length|height|perimeter/.test(b))return 'length';
  if(/money/.test(b))return 'money';
  if(/time/.test(b))return 'time';
  if(/fraction/.test(b))return 'frac';
  if(/multiplication|sharing/.test(b))return 'muldiv';
  if(/addition|subtraction|how many now|manipulate/.test(b))return 'addsub';
  if(/position|visualise/.test(b))return 'position';
  if(/shape|circles|3-d|4 sides/.test(b))return 'shape';
  if(/statistic/.test(b))return 'stats';
  if(/place value|1, 2, 3|growing|alive|building|to 20|it.s me/.test(b))return 'pv';
  return 'misc';}
const MEAS=['length','mass','capacity','temp'];
const FEEDS={pv:['pv','misc'],addsub:['addsub','pv'],muldiv:['muldiv','pv','addsub'],money:['money','pv','addsub'],
  length:['length','pv','addsub'],mass:['mass','pv','addsub'],capacity:['capacity','pv','addsub'],temp:['temp','pv'],
  time:['time','pv','frac'],frac:['frac','muldiv','shape'],shape:['shape','position'],position:['position','shape','frac'],
  stats:['stats','pv','addsub'],misc:['pv','addsub','misc','shape']};
// a measure step takes number pre-skills only when it calculates or compares with measures
const feeds=(target,src)=>{const t=topic(target),u=topic(src);if(MEAS.includes(t)&&u!==t)return /operation|add|subtract|difference|compare|problem/i.test(target.title)&&['pv','addsub'].includes(u);return (FEEDS[t]||[]).includes(u);};

// tags per step
const tags={};for(const[k,l]of Object.entries(SKILL_WRM))for(const e of l){const s=typeof e==='string'?e:e.step;(tags[s]??=[]).push({key:k,partial:e.partial||null});}
// a step's skills: its direct ones, else (rule 12) its partial ones
const directOf=id=>{const o=OV.steps[id];let d,p;if(o?.direct||o?.partials){d=(o.direct||[]).map(x=>x.key);p=(o.partials||[]).map(x=>x.key);}else{d=(tags[id]||[]).filter(t=>!t.partial).map(t=>t.key);p=(tags[id]||[]).filter(t=>t.partial).map(t=>t.key);}return d.length?d:p;};
const propsOf={};for(const[id,p]of Object.entries(WRM_PROPOSALS))for(const s of p.steps||[])(propsOf[s]??=[]).push(id);
for(const[id,ss]of Object.entries(OV.extendSteps||{}))for(const s of ss)if(!(propsOf[s]||[]).includes(id))(propsOf[s]??=[]).push(id);
for(const[id,p]of Object.entries(OV.proposals||{}))for(const s of p.steps||[])if(!(propsOf[s]||[]).includes(id))(propsOf[s]??=[]).push(id);
const byStd={};for(const[k,v]of Object.entries(SKILL_STANDARDS))for(const c of v.ccss||[])(byStd[c]??=[]).push(k);
// xlsx prior learning
const sheet={Y2:'Grade 1',Y3:'Grade 2',Y1:'KG',R:'PK'}[YEAR];
const rows=JSON.parse(execFileSync('python3',['-I',HERE+'xlsx.py',root+'data/curriculum/source/Awsaj-Domain-Sequence-K-5-2026-27.xlsx',sheet]).toString());
const prefYear={'Rec/PK4':'R','Y1/KG':'Y1','Y2/Gr.1':'Y2','Y3/Gr.2':'Y3'};
const weekPrior={},lessonWeek={};
for(const r of rows){if(r.prior)weekPrior[r.week]=r.prior;const ids=titleIdx[YEAR+'|'+norm(r.lesson)];if(ids)for(const id of ids)lessonWeek[id]??=r.week;}
const unmatchedPrior=new Set();
function priorSteps(week){const out=[];for(const raw of (weekPrior[week]||'').split(';')){const t=raw.trim();if(!t)continue;const m=t.match(/^(\S+)\s+(.*)$/);const y=prefYear[m?.[1]];if(!y){unmatchedPrior.add(t);continue;}let ids=titleIdx[y+'|'+norm(m[2])];if(!ids){unmatchedPrior.add(t);continue;}out.push(...ids.map(id=>({id,txt:t})));}return out;}
const prevYear={Y1:'R',Y2:'Y1',Y3:'Y2',Y4:'Y3'}[YEAR];

const out={year:YEAR,generatedBy:'wave2-tagging',method:'r2: items generated with real opts (items.mjs); pre filtered by topic; related share the idea',steps:{},proposals:{},tagFixes:[],retireBuilt:OV.retireBuilt||[]};
const yr=W.years.find(y=>y.id===YEAR);
const usedProps=new Set();const missingReview=[];
for(const b of yr.blocks){ if(b.number>MAXB)continue;
 b.steps.forEach((s,i)=>{
  const o=OV.steps[s.id]||{};
  if(!o.direct&&!o.partials&&!o.reviewed)missingReview.push(s.id);
  const T=tags[s.id]||[];
  let direct,partial;
  if(o.direct||o.partials){direct=(o.direct||[]).map(d=>({key:d.key,opts:d.opts||{}}));partial=(o.partials||[]).map(p=>({key:p.key,missing:p.missing,...(p.opts?{opts:p.opts}:{})}));}
  else{direct=T.filter(t=>!t.partial).map(t=>({key:t.key,opts:{}}));partial=T.filter(t=>t.partial).map(t=>({key:t.key,missing:t.partial}));}
  for(const d of [...direct,...partial]){const r=resolve(d.key);if(!r)throw new Error(s.id+' dead key '+d.key);d.key=r;}
  // tag fixes = diff against SKILL_WRM
  const why=o.why||{};
  for(const t of T){const k=resolve(t.key);const inD=direct.find(d=>d.key===k),inP=partial.find(p=>p.key===k);
    if(!k||(!inD&&!inP))out.tagFixes.push({key:t.key,step:s.id,action:'remove',why:why[t.key]||o.removeWhy||'items generated with every option do not teach this step'});
    else if(inP&&!t.partial)out.tagFixes.push({key:k,step:s.id,action:'partial',why:inP.missing});}
  for(const d of direct)if(!T.find(t=>resolve(t.key)===d.key&&!t.partial))out.tagFixes.push({key:d.key,step:s.id,action:'add',why:why[d.key]||('teaches the step with opts '+JSON.stringify(d.opts))});
  for(const p of partial)if(!T.find(t=>resolve(t.key)===p.key))out.tagFixes.push({key:p.key,step:s.id,action:'add',why:'partial: '+p.missing});
  let build=o.build?[...o.build]:[...(propsOf[s.id]||[])];
  const verdict=o.verdict||(direct.length&&!build.length?'full':(direct.length||partial.length)?'partial':'gap');
  if(verdict==='full')build=[];
  build=[...new Set(build.filter(x=>!(o.dropBuild||[]).includes(x)))];
  if(verdict!=='full'&&!build.length)console.error('NOBUILD',s.id,s.title);
  const missing=verdict==='full'?'':(o.missing??([...new Set(partial.map(p=>p.missing))].join('; ')||build.map(id=>propText(id)).join('; ')));
  // ---- pre-skills ----
  const allDirect=new Set([...direct,...partial].map(d=>d.key));
  const pre=[],preBuild=[];
  const addPre=(k,why)=>{k=resolve(k);if(!k||(OV.exclude||[]).includes(k)||allDirect.has(k)||pre.find(p=>p.key===k)||pre.length>=8)return;pre.push({key:k,why});};
  const addPB=pid=>{if(build.includes(pid)||preBuild.includes(pid)||preBuild.length>=3)return;preBuild.push(pid);usedProps.add(pid);};
  for(const p of [...(o.pre||[]),...(OV.extraPre?.[s.id]||[])])addPre(p.key,p.why);
  if(!o.preOnly){
   const wk=lessonWeek[s.id];const ps=wk?priorSteps(wk):[];
   const kept=ps.filter(x=>stepById[x.id]&&feeds(s,stepById[x.id])&&order.indexOf(x.id)<order.indexOf(s.id))
     .map(x=>({...x,same:topic(stepById[x.id])===topic(s)?0:1,dist:order.indexOf(s.id)-order.indexOf(x.id)})).sort((a,b)=>a.same-b.same||a.dist-b.dist);
   // step before in the block (same topic)
   const prev=b.steps[i-1];
   if(prev&&topic(prev)===topic(s))for(const k of directOf(prev.id).slice(0,2))addPre(k,`${prev.id} ${prev.title} (step before in the block)`);
   for(const x of kept){const st=stepById[x.id];const ks=directOf(x.id);
     if(!ks.length){for(const pid of propsOf[x.id]||[])addPB(pid);continue;}
     for(const k of ks.slice(0,2))addPre(k,`${x.id} ${st.title} (prior learning wk ${wk})`);}
   // fallbacks: earlier steps in the block on the same topic, then the previous year's steps on the same topic
   for(let j=i-2;j>=0&&pre.length<3;j--){const st=b.steps[j];if(topic(st)!==topic(s))continue;for(const k of directOf(st.id).slice(0,1))addPre(k,`${st.id} ${st.title} (earlier in the block)`);}
   if(pre.length<3&&prevYear){const py=W.years.find(y=>y.id===prevYear);const cand=py.blocks.flatMap(bb=>bb.steps).filter(st=>topic(st)===topic(s)).reverse();
     for(const st of cand){if(pre.length>=4)break;for(const k of directOf(st.id).slice(0,1))addPre(k,`${st.id} ${st.title} (${prevYear}, same topic)`);}}
  }
  for(const pid of o.preBuild||[])addPB(pid);
  if(!pre.length)console.error('NOPRE',s.id,s.title);
  // ---- related ----
  const related=[];const addRel=(k,why)=>{k=resolve(k);if(!k||(OV.exclude||[]).includes(k)||allDirect.has(k)||related.find(p=>p.key===k)||pre.find(p=>p.key===k)||related.length>=6)return;related.push({key:k,why});};
  for(const r of [...(o.related||[]),...(OV.extraRelated?.[s.id]||[])])addRel(r.key,r.why);
  if(!o.relOnly){
   const nx=b.steps[i+1];if(nx&&topic(nx)===topic(s))for(const k of directOf(nx.id).slice(0,2))addRel(k,`${nx.id} ${nx.title} (next step: the same idea one step on)`);
   if(false)for(const c of s.ccss)for(const k of byStd[c]||[]){if(nStd>=3)break;const n0=related.length;addRel(k,`same standard ${c}: ${label[k]}`);if(related.length>n0)nStd++;}
   if(related.length<2)
     for(const d of [-1,1,-2,2]){const st=b.steps[i+d];if(st&&topic(st)===topic(s))for(const k of directOf(st.id).slice(0,1))addRel(k,`${st.id} ${st.title} (neighbouring step on the same topic: the idea one step before or after)`);}
  }
  if(!related.length)console.error('NOREL',s.id,s.title);
  for(const id of build)usedProps.add(id);
  out.steps[s.id]={title:s.title,direct,partial,verdict,missing,build,pre,preBuild,related,note:o.note||(lessonWeek[s.id]?'':'not in the school sequence xlsx; pre-skills from the block and the previous year')};
 });
}
function propText(id){const p=OV.proposals?.[id]||WRM_PROPOSALS[id];if(p)return p.teaches;for(const n of ['STANDARD_PROPOSALS','WRM_EXTENSIONS','VISUAL_BUILDS']){const q=BL[n]?.[id];if(q)return q.teaches||q.name;}return id;}
for(const id of usedProps){
  const own=OV.proposals?.[id];
  if(own){out.proposals[id]={...own,reused:false};continue;}
  const p=WRM_PROPOSALS[id];
  if(p){const ccss=[...new Set(p.steps.flatMap(s=>stepById[s]?.ccss||[]))];
    out.proposals[id]={kind:p.kind,skill:p.skill,...(p.option?{option:p.option}:{}),name:p.name,teaches:p.teaches,representation:p.representation,family:p.family,steps:[...p.steps],ccss:p.ccss||ccss,why:'existing WRM_PROPOSALS entry; reused',reused:true};
    if(OV.extendSteps?.[id])for(const s of OV.extendSteps[id])if(!out.proposals[id].steps.includes(s))out.proposals[id].steps.push(s);
    continue;}
  for(const n of ['STANDARD_PROPOSALS','WRM_EXTENSIONS','VISUAL_BUILDS']){const q=BL[n]?.[id];if(q){out.proposals[id]={kind:q.kind==='repair'?'option':q.kind,skill:q.skill,...(q.option?{option:q.option}:{}),name:q.name,teaches:q.teaches,representation:(q.templates||[]).join(', ')+(q.answer?'; '+q.answer:''),family:q.family,steps:[...new Set([...(q.wrmSteps||[]),...(OV.extendSteps?.[id]||[])])],ccss:q.standards||[],why:`existing ${n} entry${q.kind==='repair'?' (repair)':''}; reused`,reused:true};break;}}
  if(!out.proposals[id])throw new Error('unknown proposal '+id);
}
for(const s of Object.values(out.steps))for(const x of [...s.direct,...s.partial,...s.pre,...s.related])if(!live(x.key))throw new Error('dead key '+x.key);
for(const s of Object.values(out.steps))for(const d of s.direct)if('note' in (d.opts||{}))throw new Error('note in opts '+d.key);
fs.mkdirSync(root+'data/curriculum/links',{recursive:true});
fs.writeFileSync(root+`data/curriculum/links/${YEAR}.json`,JSON.stringify(out,null,1)+'\n');
const c={full:0,partial:0,gap:0};for(const s of Object.values(out.steps))c[s.verdict]++;
const pr=Object.values(out.proposals);
console.log(YEAR,Object.keys(out.steps).length,'steps',JSON.stringify(c),'proposals new',pr.filter(p=>!p.reused).length,'reused',pr.filter(p=>p.reused).length,'tagFixes',out.tagFixes.length,'unreviewed',missingReview.length);
if(process.argv.includes('--unreviewed'))console.log(missingReview.join(' '));
if(process.argv.includes('--unmatched'))console.log('unmatched prior:',[...unmatchedPrior].join(' | '));
