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
const feeds=(target,src)=>{const t=topic(target),u=topic(src);
  // r2b: only this year or the year before (a Reception lesson is not the ladder for a Grade 2 step), and cross-topic
  // sources only where they are the building block: fractions take sharing/grouping, time takes counting in 5s,
  // multiplication takes counting steps (not "tens to 100")
  if(src.year!==target.year&&src.year!==prevYear)return false;
  if(t!==u){const st=src.title.toLowerCase();
    if(t==='frac'&&u==='muldiv'&&!/shar|group/.test(st))return false;
    if(t==='time'&&u!=='time'&&!/5s|fives|quarter|half/.test(st))return false;
    if(t==='muldiv'&&u==='pv'&&!/count in/.test(st)&&!(/partition/.test(st)&&/digit/i.test(target.title)))return false;}if(MEAS.includes(t)&&u!==t)return /operation|add|subtract|difference|compare|problem/i.test(target.title)&&['pv','addsub'].includes(u);return (FEEDS[t]||[]).includes(u);};

// tags per step
const tags={};for(const[k,l]of Object.entries(SKILL_WRM))for(const e of l){const s=typeof e==='string'?e:e.step;(tags[s]??=[]).push({key:k,partial:e.partial||null,note:e.note||null});}
// an old SKILL_WRM note that names a real option value becomes opts ("band 999"); any other note is dropped, never copied
const noteOpts=n=>{const m=/^band (\d+)$/.exec(n||'');return m?{band:+m[1]}:{};};
// a step's skills: its direct ones, else (rule 12) its partial ones
const directOf=id=>{const o={...(OV.steps[id]||{}),...(OV.r3?.[id]||{})};let d,p;if(o?.direct||o?.partials){d=(o.direct||[]).map(x=>x.key);p=(o.partials||[]).map(x=>x.key);}else{d=(tags[id]||[]).filter(t=>!t.partial).map(t=>t.key);p=(tags[id]||[]).filter(t=>t.partial).map(t=>t.key);}return d.length?d:p;};
// r3: every skill of a step (direct and partial), and the latest EARLIER step of the same year that has a key
const allOf=id=>{const o={...(OV.steps[id]||{}),...(OV.r3?.[id]||{})};let d,p;if(o?.direct||o?.partials){d=(o.direct||[]).map(x=>x.key);p=(o.partials||[]).map(x=>x.key);}else{d=(tags[id]||[]).filter(t=>!t.partial).map(t=>t.key);p=(tags[id]||[]).filter(t=>t.partial).map(t=>t.key);}return [...new Set([...d,...p].map(k=>resolve(k)).filter(Boolean))];};
function earlierStep(k,sid,sameYear){const y=sid.split('.')[0];const at=order.indexOf(sid);for(let j=at-1;j>=0;j--){const id=order[j];if(sameYear&&!id.startsWith(y+'.'))continue;if(allOf(id).includes(k))return id;}return null;}
const SAMESTD_SKIP=/:mixed_|_plain$/;
// r3 rule 18: a pre/related LINK carries opts. Hand opts on the entry win; else the opts the referenced step (the first
// step id in its why) uses for that key; else the year's default for the key (OV.linkOpts[YEAR]); else {}.
function stepOptsFor(id,k){const o={...(OV.steps[id]||{}),...(OV.r3?.[id]||{})};for(const d of [...(o.direct||[]),...(o.partials||[])])if(resolve(d.key)===k&&d.opts&&Object.keys(d.opts).length)return d.opts;
  for(const t of tags[id]||[])if(resolve(t.key)===k){const n=noteOpts(t.note);if(Object.keys(n).length)return n;}return null;}
function linkOpts(e){if(e.opts)return e.opts;const ids=[...String(e.why).matchAll(/(R|Y\d)\.B\d+\.S\d+/g)].map(m=>m[0]);
  for(const id of ids){const o=stepOptsFor(id,e.key);if(o)return o;}return OV.linkOpts?.[YEAR]?.[e.key]||{};}  // null (drop) is handled after
const ODDEVEN=['composing:odd_even','composing:select_even_odd'];
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
  const o={...(OV.steps[s.id]||{}),...(OV.prePatch?.[s.id]||{}),...(OV.r3?.[s.id]||{})};if(OV.gapMissing?.[s.id])o.missing=OV.gapMissing[s.id];
  if(!o.direct&&!o.partials&&!o.reviewed)missingReview.push(s.id);
  const T=tags[s.id]||[];
  let direct,partial;
  if(o.direct||o.partials){direct=(o.direct||[]).map(d=>({key:d.key,opts:d.opts||{}}));partial=(o.partials||[]).map(p=>({key:p.key,missing:p.missing,...(p.opts?{opts:p.opts}:{})}));}
  else{direct=T.filter(t=>!t.partial).map(t=>({key:t.key,opts:noteOpts(t.note)}));partial=T.filter(t=>t.partial).map(t=>({key:t.key,missing:t.partial}));}
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
  // ---- pre-skills (r3, critic Y2-Y3 r2 S6/S7; brief rules 14-15) ----
  // Every candidate gets a TIER (how directly it is a building block); the list is sorted by tier, then nearness, and
  // only then capped at 8, so the main building block can never be pushed out by distance.
  //  0 hand pre (overrides)            1 the step before in the block, and hand `core` keys
  //  2 an EARLIER step's skill named as related (rule 14: it is pre, never only related)
  //  3 xlsx prior learning on the same topic   4 earlier steps of the block   5 xlsx prior learning, cross-topic
  //  6 previous year, same topic (only while < 3)   7 the topic ladder (only while < 3; rule 15)
  if(verdict!=='full'&&!o.missing&&verdict==='gap')console.error('NOMISSING',s.id,s.title);
  const allDirect=new Set([...direct,...partial].map(d=>d.key));
  const pre=[],preBuild=[];
  const cands=[];let ord=0;
  const dropPre=new Set((o.dropPre||[]).map(resolve));
  const oddOk=/odd|even/i.test(s.title);
  const okKey=k=>k&&!(OV.exclude||[]).includes(k)&&!allDirect.has(k)&&!dropPre.has(k)&&(oddOk||!ODDEVEN.includes(k));
  const cand=(k,why,tier,opts)=>{k=resolve(k);if(okKey(k))cands.push({key:k,why,tier,ord:ord++,...(opts?{opts}:{})});};
  const addPB=pid=>{if(build.includes(pid)||preBuild.includes(pid)||preBuild.length>=3)return;preBuild.push(pid);usedProps.add(pid);};
  for(const p of [...(o.pre||[]),...(OV.extraPre?.[s.id]||[])])cand(p.key,p.why,0,p.opts);
  for(const p of o.core||[])cand(p.key,p.why,1,p.opts);
  // rule 14: a related key that is the skill of an EARLIER step of this year is a building block -> pre
  const handRelAll=[...(o.related||[]),...(OV.extraRelated?.[s.id]||[]),...(OV.relR3?.[s.id]||[])];
  for(const r of handRelAll){const k=resolve(r.key);const e=earlierStep(k,s.id,true);if(e)cand(k,`${r.why} (earlier step this builds on: ${e} ${stepById[e].title})`,2);}
  const prev=b.steps[i-1];
  if(!o.preOnly){
   const wk=lessonWeek[s.id];const ps=wk?priorSteps(wk):[];
   const kept=ps.filter(x=>stepById[x.id]&&feeds(s,stepById[x.id])&&order.indexOf(x.id)<order.indexOf(s.id))
     .map(x=>({...x,same:topic(stepById[x.id])===topic(s)?0:1,dist:order.indexOf(s.id)-order.indexOf(x.id)})).sort((a,b)=>a.same-b.same||a.dist-b.dist);
   if(prev&&topic(prev)===topic(s))for(const k of allOf(prev.id).slice(0,2))cand(k,`${prev.id} ${prev.title} (step before in the block)`,1);
   for(const x of kept){const st=stepById[x.id];const ks=allOf(x.id);
     if(!ks.length){if(topic(st)===topic(s))for(const pid of propsOf[x.id]||[])addPB(pid);continue;}
     for(const k of ks.slice(0,2))cand(k,`${x.id} ${st.title} (prior learning wk ${wk})`,x.same?5:3);}
   for(let j=i-2,n=0;j>=0&&n<3;j--){const st=b.steps[j];if(topic(st)!==topic(s))continue;const ks=allOf(st.id);if(ks.length)n++;for(const k of ks.slice(0,1))cand(k,`${st.id} ${st.title} (earlier in the block)`,4);}
  }
  const take=()=>{pre.length=0;const seen=new Set();for(const c of [...cands].sort((a,b)=>a.tier-b.tier||a.ord-b.ord)){if(seen.has(c.key)||pre.length>=8)continue;seen.add(c.key);pre.push({key:c.key,why:c.why,...(c.opts?{opts:c.opts}:{})});}};
  take();
  if(pre.length<3&&prevYear&&!o.preOnly){const py=W.years.find(y=>y.id===prevYear);const cand6=py.blocks.flatMap(bb=>bb.steps).filter(st=>topic(st)===topic(s)).reverse();
    let n=0;for(const st of cand6){if(n>=2)break;const ks=allOf(st.id);if(!ks.length)continue;const k0=resolve(ks[0]);if(!okKey(k0)||cands.find(c=>c.key===k0))continue;cand(k0,`${st.id} ${st.title} (${prevYear}, same topic)`,6);n++;}
    take();}
  if(pre.length<3){for(const l of (OV.ladders?.[topic(s)]||[])){const k=resolve(l.key);if(cands.find(c=>c.key===k))continue;cand(k,l.why+' (topic ladder)',7,l.opts);take();if(pre.length>=3)break;}}
  for(const pid of o.preBuild||[])addPB(pid);
  if(pre.length<3&&!o.thinPreNote)console.error('THINPRE',s.id,s.title,pre.length);
  // ---- related (rule 5 / 14): the same idea in another form, the inverse, the NEXT step. Never an earlier step of
  // the block (that is pre), never a pre key. ----
  const related=[];
  const relOk=k=>k&&!(OV.exclude||[]).includes(k)&&!allDirect.has(k)&&!related.find(p=>p.key===k)&&!pre.find(p=>p.key===k)&&!b.steps.slice(0,i).some(st=>allOf(st.id).includes(k))&&related.length<6;
  const addRel=(k,why,opts)=>{k=resolve(k);if(relOk(k))related.push({key:k,why,...(opts?{opts}:{})});};
  for(const r of handRelAll)addRel(r.key,r.why,r.opts);
  if(!o.relOnly){
   for(const d of [1,2,3,4]){if(related.length>=2&&d>1)break;const nx=b.steps[i+d];if(nx&&topic(nx)===topic(s))for(const k of allOf(nx.id).slice(0,2))addRel(k,`${nx.id} ${nx.title} (${d===1?'next step':'a later step of the block'}: the same idea one step further)`);}
   // last resort: a skill tagged to the step's OWN standard code that no earlier step uses (the same idea in another form)
   if(false)for(const c of s.ccss){for(const k of byStd[c]||[]){if(related.length>=2)break;if(SAMESTD_SKIP.test(k))continue;addRel(k,`also teaches ${c} (this step's standard): ${label[k]}`);}}
  }
  if(!related.length)console.error('NOREL',s.id,s.title);
  for(const e of [...pre,...related])e.opts=linkOpts(e);
  const yo=OV.linkOpts?.[YEAR]||{};
  for(const list of [pre,related])for(let j=list.length-1;j>=0;j--)if(yo[list[j].key]===null&&!Object.keys(list[j].opts||{}).length)list.splice(j,1);
  const lf=OV.linkFix?.[s.id]||{};
  for(const list of [pre,related])for(let j=list.length-1;j>=0;j--){const f=lf[list[j].key];if(f===null)list.splice(j,1);else if(f)list[j].opts=f;}
  if(!related.length)console.error('NOREL(after linkFix)',s.id,s.title);
  if(pre.length<3)console.error('THINPRE(after linkFix)',s.id,s.title,pre.length);
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
// rule 13 (revised): every proposal says, per step of this year, the exact clause it closes
for(const[id,p]of Object.entries(out.proposals)){const c={};for(const[sid,st]of Object.entries(out.steps))if(st.build.includes(id))c[sid]=st.missing;else if(st.preBuild.includes(id))c[sid]='(prerequisite of this step)';
  p.closes=c;p.kindText=p.kind==='new'?'new skill':'option on '+(p.skills?p.skills.join(', '):p.skill);
  // r3: a step of THIS year that the proposal listed but no longer closes is moved to dropSteps (for the lead's merge)
  const drop=(p.steps||[]).filter(sid=>sid.startsWith(YEAR+'.')&&!c[sid]);if(drop.length){p.dropSteps=drop;p.steps=p.steps.filter(x=>!drop.includes(x));}
  for(const sid of Object.keys(c))if(!(p.steps||[]).includes(sid))(p.steps??=[]).push(sid);}
// rule 16 check: on a gap step `closes` is the step's own clause, never the proposal's `teaches` copied
for(const[id,p]of Object.entries(out.proposals))for(const[sid,txt]of Object.entries(p.closes))if(out.steps[sid].verdict==='gap'&&txt===p.teaches)console.error('CLOSES=TEACHES',sid,id);
for(const s of Object.values(out.steps))for(const x of [...s.direct,...s.partial,...s.pre,...s.related])if(!live(x.key))throw new Error('dead key '+x.key);
for(const s of Object.values(out.steps))for(const d of s.direct)if('note' in (d.opts||{}))throw new Error('note in opts '+d.key);
fs.mkdirSync(root+'data/curriculum/links',{recursive:true});
fs.writeFileSync(root+`data/curriculum/links/${YEAR}.json`,JSON.stringify(out,null,1)+'\n');
const c={full:0,partial:0,gap:0};for(const s of Object.values(out.steps))c[s.verdict]++;
const pr=Object.values(out.proposals);
console.log(YEAR,Object.keys(out.steps).length,'steps',JSON.stringify(c),'proposals new',pr.filter(p=>!p.reused).length,'reused',pr.filter(p=>p.reused).length,'tagFixes',out.tagFixes.length,'unreviewed',missingReview.length);
if(process.argv.includes('--unreviewed'))console.log(missingReview.join(' '));
if(process.argv.includes('--unmatched'))console.log('unmatched prior:',[...unmatchedPrior].join(' | '));
