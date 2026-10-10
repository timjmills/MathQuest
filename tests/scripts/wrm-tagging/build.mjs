// node build.mjs <YEAR> <maxBlock>  -> writes data/curriculum/links/<YEAR>.json (blocks 1..maxBlock)
import fs from 'fs';
import { execFileSync } from 'child_process';
globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.window=globalThis;globalThis.document={};
const root='/home/user/MathQuest/.claude/worktrees/agent-ad8778bcecd171add';
const SCR='/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-tag-Y2';
const [YEAR, MAXB] = [process.argv[2], +process.argv[3] || 99];
const _log=console.log;console.log=()=>{};
const {SKILLS}=await import(root+'/js/modules/data.js');
console.log=_log;
const {SKILL_WRM,WRM_PROPOSALS}=await import(root+'/js/modules/wrm.js');
const {SKILL_STANDARDS}=await import(root+'/js/modules/standards.js');
const {SKILL_ALIASES}=await import(root+'/js/modules/skill-aliases.js');
const BL=await import(root+'/js/modules/build-list.js');
const OV=(await import(SCR+'/overrides.mjs?'+Date.now()));
const W=JSON.parse(fs.readFileSync(root+'/data/curriculum/wrm-steps.json'));

const label={};for(const[c,l]of Object.entries(SKILLS))for(const s of l||[])if(s&&s.v)label[c+':'+s.v]=s.l;
const live=k=>!!label[k];
const resolve=k=>{if(live(k))return k;const a=SKILL_ALIASES[k];if(a){const c=k.split(':')[0];const r=c+':'+a.skillId;if(live(r))return r;}return null;};
const stepById={},titleIdx={};const order=[];
for(const y of W.years)for(const b of y.blocks)for(const s of b.steps){s.year=y.id;s.block=b;stepById[s.id]=s;order.push(s.id);(titleIdx[y.id+'|'+norm(s.title)]??=[]).push(s.id);}
function norm(t){return String(t).toLowerCase().replace(/\(us[^)]*\)/g,'').replace(/[–—-]/g,' ').replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,'');}
// tags per step
const tags={};for(const[k,l]of Object.entries(SKILL_WRM))for(const e of l){const s=typeof e==='string'?e:e.step;(tags[s]??=[]).push({key:k,partial:e.partial||null,note:e.note||''});}
const directOf=id=>(tags[id]||[]).map(t=>t.key);
// proposals per step
const propsOf={};for(const[id,p]of Object.entries(WRM_PROPOSALS))for(const s of p.steps||[])(propsOf[s]??=[]).push(id);
const stdProps={};for(const n of ['STANDARD_PROPOSALS','WRM_EXTENSIONS','VISUAL_BUILDS']){const o=BL[n];if(!o)continue;for(const[id,p]of Object.entries(o)){for(const s of new Set(JSON.stringify(p).match(/Y\d\.B\d+\.S\d+/g)||[]))(stdProps[s]??=[]).push({src:n,id,p});}}
// skills by ccss
const byStd={};for(const[k,v]of Object.entries(SKILL_STANDARDS))for(const c of v.ccss||[])(byStd[c]??=[]).push(k);
const gradeOf=c=>{const g=c.split('.')[0];return g==='K'?0:+g;};
const cluster=c=>c.split('.').slice(0,3).join('.');
// xlsx prior learning
const sheet={Y2:'Grade 1',Y3:'Grade 2'}[YEAR];
const rows=JSON.parse(execFileSync('python3',['-I',SCR+'/xlsx.py',root+'/data/curriculum/source/Awsaj-Domain-Sequence-K-5-2026-27.xlsx',sheet]).toString());
const prefYear={'Rec/PK4':'R','Y1/KG':'Y1','Y2/Gr.1':'Y2','Y3/Gr.2':'Y3'};
const weekPrior={},lessonWeek={};
for(const r of rows){if(r.prior)weekPrior[r.week]=r.prior;const ids=titleIdx[YEAR+'|'+norm(r.lesson)];if(ids)for(const id of ids)lessonWeek[id]??=r.week;}
const unmatchedPrior=new Set();
function priorSteps(week){const out=[];for(const raw of (weekPrior[week]||'').split(';')){const t=raw.trim();if(!t)continue;const m=t.match(/^(\S+)\s+(.*)$/);const y=prefYear[m?.[1]];if(!y){unmatchedPrior.add(t);continue;}let ids=titleIdx[y+'|'+norm(m[2])];if(!ids){unmatchedPrior.add(t);continue;}out.push(...ids.map(id=>({id,txt:t})));}return out;}

const out={year:YEAR,generatedBy:'wave2-tagging',steps:{},proposals:{},tagFixes:[]};
const yr=W.years.find(y=>y.id===YEAR);
const usedProps=new Set();
for(const b of yr.blocks){ if(b.number>MAXB)continue;
 b.steps.forEach((s,i)=>{
  const o=OV.steps[s.id]||{};
  let T=(tags[s.id]||[]).filter(t=>!(o.remove||[]).includes(t.key));
  const direct=[],partial=[];
  for(const t of T){const k=resolve(t.key);if(!k){out.tagFixes.push({key:t.key,step:s.id,action:'remove',why:'not a live skill key'});continue;}
    const op=o.partial?.[k];
    if(t.partial||op)partial.push({key:k,missing:op||t.partial});else direct.push({key:k,opts:{...optsFrom(t.note),...(o.opts?.[k]||{})}});}
  for(const a of o.addDirect||[]){direct.push({key:a.key,opts:a.opts||{}});out.tagFixes.push({key:a.key,step:s.id,action:'add',why:a.why});}
  for(const a of o.addPartial||[]){partial.push({key:a.key,missing:a.missing});out.tagFixes.push({key:a.key,step:s.id,action:'add',why:'partial: '+a.missing});}
  for(const k of Object.keys(o.partial||{}))if(!(T.find(t=>t.key===k)?.partial))out.tagFixes.push({key:k,step:s.id,action:'partial',why:o.partial[k]});
  for(const k of o.remove||[])out.tagFixes.push({key:k,step:s.id,action:'remove',why:o.removeWhy||''});
  // move partial-duplicates out of direct
  const dk=new Set(direct.map(d=>d.key));for(let j=partial.length-1;j>=0;j--)if(dk.has(partial[j].key))partial.splice(j,1);
  let build=[...(propsOf[s.id]||[])];
  const verdict=o.verdict||(direct.length&&!build.length?'full':(direct.length||partial.length)?'partial':'gap');
  if(verdict!=='full'){for(const x of stdProps[s.id]||[])if(!build.includes(x.id)&&!(o.dropBuild||[]).includes(x.id))build.push(x.id);}
  else build=[];
  build.push(...(o.build||[]));build=[...new Set(build.filter(x=>!(o.dropBuild||[]).includes(x)))];
  if(verdict!=='full'&&!build.length)console.error('NOBUILD',s.id,s.title,'|',JSON.stringify(partial));
  let missing=o.missing??(verdict==='full'?'':[...new Set(partial.map(p=>p.missing))].join('; ')||build.map(id=>propText(id)).join('; '));
  // pre-skills
  const allDirect=new Set([...direct,...partial].map(d=>d.key));
  const pre=[],preBuild=[];const addPre=(k,why)=>{k=resolve(k);if(!k||(OV.exclude||[]).includes(k)||allDirect.has(k)||pre.find(p=>p.key===k)||pre.length>=8)return;pre.push({key:k,why});};
  for(const p of o.pre||[])addPre(p.key,p.why);
  const prevSteps=[];for(let j=i-1;j>=0&&j>=i-2;j--)prevSteps.push(b.steps[j]);
  if(prevSteps[0]&&relScore(s,prevSteps[0])>=2)for(const k of directOf(prevSteps[0].id))addPre(k,`${prevSteps[0].id} ${prevSteps[0].title} (step before in the block)`);
  const wk=lessonWeek[s.id];const ps=wk?priorSteps(wk):[];
  const psScored=ps.map(x=>({...x,dist:order.indexOf(s.id)-order.indexOf(x.id),rel:relScore(s,stepById[x.id])})).sort((a,b)=>b.rel-a.rel||a.dist-b.dist);
  for(const x of psScored){const st=stepById[x.id];const ks=directOf(x.id);if(!ks.length){for(const pid of propsOf[x.id]||[])if(!preBuild.includes(pid)&&preBuild.length<4){preBuild.push(pid);usedProps.add(pid);}continue;}
    for(const k of ks.slice(0,2))addPre(k,`${x.id} ${st.title} (prior learning wk ${wk})`);}
  for(const c of s.ccss){if(c.includes('.MD.')&&pre.length>=4)continue;const g=gradeOf(c);for(const[cc,ks]of Object.entries(byStd))if(cluster(cc)===cluster(c)&&gradeOf(cc)<g)for(const k of ks)addPre(k,`lower-grade skill on ${cc} (same cluster as ${c})`);}
  for(const c of s.ccss){if(/\.(MD|G)\./.test(c))continue;const g=gradeOf(c);for(const[cc,ks]of Object.entries(byStd))if(cc.split('.')[1]===c.split('.')[1]&&gradeOf(cc)===g-1)for(const k of ks)addPre(k,`lower-grade skill on ${cc} (same domain as ${c})`);}
  for(const pid of o.preBuild||[]){if(!preBuild.includes(pid))preBuild.push(pid);usedProps.add(pid);}
  // related
  let nClu=0;const related=[];const addRel=(k,why,clu)=>{k=resolve(k);if(!k||(OV.exclude||[]).includes(k)||(clu&&nClu>=3)||allDirect.has(k)||related.find(p=>p.key===k)||pre.find(p=>p.key===k)||related.length>=8)return;related.push({key:k,why});if(clu)nClu++;};
  for(const r of o.related||[])addRel(r.key,r.why);
  const nx=b.steps[i+1];if(nx)for(const k of directOf(nx.id))addRel(k,`${nx.id} ${nx.title} (next step)`);
  for(const c of s.ccss)for(const k of byStd[c]||[])addRel(k,`same standard ${c}: ${label[k]}`);
  for(const c of s.ccss)if(!c.includes('.MD.'))for(const[cc,ks]of Object.entries(byStd))if(cluster(cc)===cluster(c)&&cc!==c)for(const k of ks)addRel(k,`same cluster ${cc}: ${label[k]}`,1);
  for(const id of build)usedProps.add(id);
  out.steps[s.id]={title:s.title,direct,partial,verdict,missing,build,pre,preBuild,related,note:o.note||(wk?'':'not in the school sequence xlsx; pre-skills from the block and the CCSS cluster')};
 });
}
function relScore(s,t){if(!t)return 0;let r=0;for(const c of s.ccss)for(const d of t.ccss){if(d===c)r+=3;else if(cluster(d)===cluster(c))r+=2;else if(d.split('.')[1]===c.split('.')[1])r+=1;}if(t.block.name===s.block.name)r+=1;return r;}
function optsFrom(note){if(!note)return {};const m=note.match(/^band (\d+)$/);return m?{band:+m[1]}:{note};}
function propText(id){const p=WRM_PROPOSALS[id]||OV.proposals[id];if(p)return p.teaches;for(const n of ['STANDARD_PROPOSALS','WRM_EXTENSIONS','VISUAL_BUILDS']){const q=BL[n]?.[id];if(q)return q.teaches||q.name;}return id;}
for(const id of usedProps){
  const own=OV.proposals[id];
  if(own){out.proposals[id]={...own,reused:false};continue;}
  const p=WRM_PROPOSALS[id];
  if(p){const ccss=[...new Set(p.steps.flatMap(s=>stepById[s]?.ccss||[]))];
    out.proposals[id]={kind:p.kind,skill:p.skill,...(p.option?{option:p.option}:{}),name:p.name,teaches:p.teaches,representation:p.representation,family:p.family,steps:[...p.steps],ccss:p.ccss||ccss,why:'existing WRM_PROPOSALS entry; reused',reused:true};
    if(OV.extendSteps?.[id])for(const s of OV.extendSteps[id])if(!out.proposals[id].steps.includes(s))out.proposals[id].steps.push(s);
    continue;}
  for(const n of ['STANDARD_PROPOSALS','WRM_EXTENSIONS','VISUAL_BUILDS']){const q=BL[n]?.[id];if(q){out.proposals[id]={kind:q.kind==='repair'?'option':q.kind,skill:q.skill,...(q.option?{option:q.option}:{}),name:q.name,teaches:q.teaches,representation:(q.templates||[]).join(', ')+(q.answer?'; '+q.answer:''),family:q.family,steps:q.wrmSteps||[],ccss:q.standards||[],why:`existing ${n} entry${q.kind==='repair'?' (repair)':''}; reused`,reused:true};break;}}
  if(!out.proposals[id])throw new Error('unknown proposal '+id);
}
for(const s of Object.values(out.steps))for(const x of [...s.direct,...s.partial,...s.pre,...s.related])if(!live(x.key))throw new Error('dead key '+x.key);
fs.mkdirSync(root+'/data/curriculum/links',{recursive:true});
fs.writeFileSync(root+`/data/curriculum/links/${YEAR}.json`,JSON.stringify(out,null,1)+'\n');
const c={full:0,partial:0,gap:0};for(const s of Object.values(out.steps))c[s.verdict]++;
const pr=Object.values(out.proposals);
console.log(YEAR,Object.keys(out.steps).length,'steps',JSON.stringify(c),'proposals new',pr.filter(p=>!p.reused).length,'reused',pr.filter(p=>p.reused).length,'tagFixes',out.tagFixes.length);
if(process.argv[4])console.log('unmatched prior:',[...unmatchedPrior].join(' | '));
