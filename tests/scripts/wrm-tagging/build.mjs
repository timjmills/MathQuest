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
const _lsm=new Map();globalThis.localStorage={getItem:k=>_lsm.get(k)??null,setItem:(k,v)=>_lsm.set(k,String(v)),removeItem:k=>_lsm.delete(k)};globalThis.window=globalThis;globalThis.document={};
const HERE=new URL('.',import.meta.url).pathname;
const root=new URL('../../../',import.meta.url).pathname;
const [YEAR, MAXB] = [process.argv[2], +process.argv[3] || 99];
const _log=console.log;console.log=()=>{};
const {SKILLS}=await import(root+'js/modules/data.js');
const _warn=console.warn;console.warn=()=>{};
const {generateQuestionFor}=await import(root+'js/modules/generate-question.js');
console.log=_log;console.warn=_warn;
const MK=await import(HERE+'markers.mjs');
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
function earlierStep(k,sid,sameYear){const y=sid.split('.')[0];const at=order.indexOf(sid);for(let j=at-1;j>=0;j--){const id=order[j];if(sameYear&&!id.startsWith(y+'.'))continue;if(typeof taughtBefore==='function'&&!taughtBefore(id,sid))continue;if(allOf(id).includes(k))return id;}return null;}
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
// r5 (rule 19): SCHOOL week of every step of this year (xlsx); a same-year step counts as earlier learning only when it
// is taught in an earlier school week (or earlier in the same week). Earlier grades are always earlier learning.
const SWK=MK.schoolWeeks(Object.fromEntries(yr.blocks.flatMap(bb=>bb.steps).map(st=>[st.id,st.title])),rows);
const taughtBefore=(x,sid)=>{if(!x.startsWith(YEAR+'.'))return true;const a=SWK[x]??999,b=SWK[sid]??999;if(b===999||a===999)return order.indexOf(x)<order.indexOf(sid);return a<b||(a===b&&order.indexOf(x)<order.indexOf(sid));};
const markerHits=MK.makeMarkerCheck(generateQuestionFor,YEAR,SWK,2);
// r6 (S11): a why written from the skill and opts actually linked. Used after any swap, and whenever the hand why
// names a table, a count step or a unit the opts do not deal (whyMismatch).
const PARTS=['halves','thirds','quarters'];
function optsText(k,o={}){const t=[];if(o.constant)t.push((/div/.test(k)?'dividing by ':'tables: ')+o.constant.join(', '));
  if(o.rows)t.push('counting in '+o.rows.map(r=>r.step+'s').join(', ')+' from 0');if(o.parts)t.push(o.parts.map(i=>PARTS[i]).join(' and ')+' of a shape');
  if(o.notation&&o.notation.includes('across'))t.push('written across');
  if(k==='measurement:length_metric'&&o.forms)t.push(o.forms.map(f=>['cm ↔ mm','m ↔ cm','m ↔ mm','km ↔ m'][f]).join(', '));
  if(k==='measurement:estimate_length'&&o.forms)t.push('about how long is it? a sensible length in metric units');return t.join('; ');}
// r8 (A3): the earlier step (this year or an earlier grade) that owns key k with opts closest to o: exact opts first, then
// opts whose rows / tables / parts contain the link's, then any use of the key; ties go to the latest step
function bestOwner(k,sid,o){const want=JSON.stringify(o||{});const set=x=>(x?.rows||[]).map(r=>r.step).concat(x?.constant||[],x?.parts||[]);const ws=set(o);let best=null,bs=-1;
  for(const id of order){if(id===sid||!allOf(id).includes(k))continue;if(id.startsWith(YEAR+'.')?!taughtBefore(id,sid):order.indexOf(id)>order.indexOf(sid))continue;
    const so=stepOptsFor(id,k);const ss=set(so);const sc=JSON.stringify(so||{})===want?3:(ws.length&&ws.every(v=>ss.includes(v)))?2:1;if(sc>=bs){bs=sc;best=id;}}return best;}
function taughtAt(k,sid,o){if(o&&Object.keys(o).length){const b=bestOwner(k,sid,o);if(b)return b;}if(o&&Object.keys(o).length){let b2=null;for(const id of order){if(id===sid||!allOf(id).includes(k))continue;if(id.startsWith(YEAR+'.')?!taughtBefore(id,sid):order.indexOf(id)>order.indexOf(sid))continue;if(JSON.stringify(stepOptsFor(id,k))===JSON.stringify(o))b2=id;}if(b2)return b2;}
  let best=null;for(const id of order){if(id===sid||!allOf(id).includes(k))continue;if(id.startsWith(YEAR+'.')?!taughtBefore(id,sid):order.indexOf(id)>order.indexOf(sid))continue;if(!best||taughtBefore(best,id))best=id;}return best;}
// r8 (A2): the rebuilt why says what the skill does in words (whyText; else the catalogue label without its "(Visual)"
// tags), keeps the old why's reason (the clause after its first colon) when that reason is true of the items, cites the
// step that owns the key and opts, and says "the same week" when that step is taught in this step's week.
const cleanLabel=k=>String(label[k]||k).replace(/\s*\((Visual|No Visuals|Interactive)\)/gi,'').replace(/^Count by 1–12$/,'counting in equal steps from 0');
function descWhy(k,o,sid,old){const src=taughtAt(k,sid,o);const ot=optsText(k,o);
  let reason='';const o2=String(old||'').replace(/\([^()]*\)/g,'').split('—')[0];if(o2.includes(':')){reason=o2.split(':').slice(1).join(':').trim();if(/[{}()]|Y\d\.B\d/.test(reason))reason='';
    {const tb=(o?.constant||[]).concat((o?.rows||[]).map(r=>r.step));const nm=[...reason.matchAll(/(?:dividing by|multiplying by|counting in|the) (\d+)(?:s| times-table)?/g)].map(m=>+m[1]);if(tb.length&&nm.some(n=>!tb.includes(n)))reason='';}
    if(reason&&whyContentBad({key:k,opts:o,why:reason}).length)reason='';}
  let tail=' — earlier learning';
  if(src)tail=` — ${src} ${stepById[src].title}`+(src.startsWith(YEAR+'.')&&SWK[src]===SWK[sid]?` (the same week, W${SWK[sid]})`:'');
  else{const ys=yr.blocks.flatMap(bb=>bb.steps).filter(st=>st.id!==sid&&allOf(st.id).includes(k));const sw=ys.find(st=>SWK[st.id]===SWK[sid]);
    const lt=ys.filter(st=>(SWK[st.id]??999)>(SWK[sid]??999)).sort((a,c)=>SWK[a.id]-SWK[c.id])[0];
    if(sw)tail=` — taught the same week (W${SWK[sid]}): ${sw.id} ${sw.title}`;else if(lt)tail=` — taught later (W${SWK[lt.id]}): ${lt.id} ${lt.title}`;else tail='';}
  return `${OV.whyText?.[k]||cleanLabel(k)}${ot?' ('+ot+')':''}${reason?': '+reason:''}${tail}`;}
function whyMismatch(e){const w=String(e.why).split('(')[0];const o=e.opts||{};const tabs=o.constant||(o.rows||[]).map(x=>x.step);
  const named=[...w.matchAll(/(?:counting in (\d+)s|dividing by (\d+)|multiplying by (\d+)|the (\d+) times-table|Divide by (\d+)|Multiply by (\d+))/g)].map(m=>+(m[1]||m[2]||m[3]||m[4]||m[5]||m[6]));
  if(tabs.length&&named.length&&named.some(n=>!tabs.includes(n)))return true;
  if(tabs.length&&/counting in/.test(w)){const ns=[...w.replace(/[\s\S]*?counting in/,'').split(/[:—]/)[0].matchAll(/(\d+)s\b/g)].map(m=>+m[1]);if(ns.some(n=>!tabs.includes(n))||tabs.some(t=>ns.length&&!ns.includes(t)))return true;}
  if(/time_half_hour|time_hour/.test(e.key)&&/quarter past|quarter to/.test(w))return true;
  if(e.key==='multiplication:repeated_add_to_mult'&&/stories/.test(w))return true;
  if(e.key==='measurement:estimate_length'&&/cm or m|mm or cm|m or cm/.test(w))return true; // say what form 0 does: 'about how long is a shoe? 25 cm'
  if(e.key==='measurement:length_metric'&&JSON.stringify(o.forms)==='[0]'&&/\bm and cm|exchange with 100/.test(w))return true;
  if(/:mult_zeros$/.test(e.key)&&/2-digit number by a 1-digit/.test(w))return true;
  if(/:div_facts$/.test(e.key)&&/mult_facts \{constant/.test(e.why))return true;
  if(/counting in 5s and 10s|counting in 2s, 5s and 10s/.test(w)&&o.rows&&!o.rows.some(r=>r.step===5))return true;
  return whyContentBad(e).length>0;}
// r7 (critic r6 A4): every why, hand-written or not, must name only what the link's generated items deal (units, count
// steps, tables, "within N", time words, fraction words). The same test as the critic's whyscan C.
const UNITS=[[/\bmillilit|\bmL\b|\bml\b/i,/mL|ml\b|millil/i],[/\bkilogram|\bkg\b/i,/kg|kilogram/i],[/\bgrams?\b/i,/\bg\b|gram/i],[/\bmm\b|millimet/i,/mm\b|millimet/i],[/\bcm\b|centimet/i,/cm\b|centimet/i],[/\bmetres?\b|\bm and cm/i,/\d\s?m\b|metre|meter/i],[/\blitres?\b/i,/\bL\b|litre|liter/i],[/quarter past|quarter to/i,/:15|:45|quarter/i],[/\bthirds?\b/i,/\/3\b|third|"d":3/],[/\bquarters?\b/i,/\/4\b|quarter|"d":4/],[/\bpictogra/i,/pictogra|picto/i],[/\btally/i,/tally/i],[/\bnumber line/i,/number line|"ticks"|numberline|nl/i],[/\bdollars?|\$|cents?\b|¢/i,/\$|¢|cent|dollar/i]];
// r8 (A2): a count step is dealt when a number-track / count-row payload steps by it (values [10,12,14,16] = 2s)
function payloadStep(its,n){for(const q of its)for(const m of String(q.p).matchAll(/\[(\d+(?:,\d+){2,})\]/g)){const v=m[1].split(',').map(Number);const d=v.slice(1).map((x,i)=>Math.abs(x-v[i]));if(d.every(x=>x===n))return true;}return false;}
function whyContentBad(e){const head=String(e.why).split('—')[0].split(/\(Y\d|\(prior|\(earlier|\(taught/)[0].split(':')[0].replace(/\b(is |as )?(the )?same (exchange|idea|calculation|compare|count|language)\b[\s\S]*/i,'').replace(/\b(like|as in)\b[\s\S]*/i,'');const its=markerHits.items(e.key,e.opts||{}).slice(0,60);if(!its.length)return [];
  const txt=its.map(q=>q.to+' '+q.a+' '+q.p+' '+(q.v||'')).join(' \n ');const mx=Math.max(...its.map(q=>Math.max(0,...[...(q.t+' '+q.a).replace(/\d{1,2}:\d\d/g,'').replace(/(\d),(\d{3})(?!\d)/g,'$1$2').matchAll(/\d+/g)].map(m=>+m[0]))));const bad=[];const isTime=/^measurement:(time|elapsed|clock)/.test(e.key);
  for(const m of head.matchAll(/(?:within|to|up to) (\d[\d,]*)/gi)){const n=+m[1].replace(/,/g,'');if(mx>n*1.05&&n>=10)bad.push(m[0]);}
  for(const m of head.matchAll(/(\d+)s?(?: and (\d+))? times-tables?|counting in (\d+)s|dividing by (\d+)/g)){const n=+(m[1]||m[3]||m[4]);if(!new RegExp(`(\\b${n}\\s*[×x÷]|[×x÷]\\s*${n}\\b|"step":${n}\\b|\\b${n}, ?${2*n}, ?${3*n}|by ${n}\\b|in ${n}s\\b|\\b${n}s\\b)`,'i').test(txt)&&!payloadStep(its,n))bad.push(n+'s');}
  // r8: units, money and fraction words are content only for measurement / fraction / graph / shape skills; on a number
  // skill they are the analogy that explains the link ("1 kg = 1,000 g is the same exchange as 1 thousand = 10 hundreds")
  const unitSkill=/^(measurement|fractions|fraction_operations|graphs|shapes_early|composing:(fraction|compose_whole))/.test(e.key);
  for(const [re,u] of UNITS){if(!unitSkill)continue;if(isTime&&/third|quarter/.test(re.source)&&!/past|to/.test(re.source))continue;if(re.test(head)&&!new RegExp(u.source,'i').test(txt))bad.push(re.source.slice(0,12));}return bad;}
const keyFirstWk={};for(const st of yr.blocks.flatMap(bb=>bb.steps))for(const k of allOf(st.id))keyFirstWk[k]=Math.min(keyFirstWk[k]??999,SWK[st.id]??999);
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
  // r8 (A6, rule 2: options are values): a link with the same key as a direct skill is excluded only when it IS that skill:
  // its opts are empty, or equal one of the direct's opts, or the direct has no opts. mult_facts {constant:[4]} is a
  // different ladder step from the direct mult_facts {constant:[8]}.
  const dOpts={};for(const d of [...direct,...partial])(dOpts[d.key]??=[]).push(JSON.stringify(d.opts||{}));
  const isDirect=(k,op)=>{if(!allDirect.has(k))return false;const js=JSON.stringify(op||{});if(js==='{}'||dOpts[k].includes('{}')||dOpts[k].includes(js))return true;return false;};
  const pre=[],preBuild=[];
  const cands=[];let ord=0;
  const dropPre=new Set((o.dropPre||[]).map(resolve));
  const oddOk=/odd|even/i.test(s.title);
  const okKey=(k,op)=>k&&!(OV.exclude||[]).includes(k)&&!isDirect(k,op)&&!dropPre.has(k)&&(oddOk||!ODDEVEN.includes(k));
  const cand=(k,why,tier,opts)=>{k=resolve(k);if(okKey(k,opts))cands.push({key:k,why,tier,ord:ord++,...(opts?{opts}:{})});};
  const addPB=pid=>{if(build.includes(pid)||preBuild.includes(pid)||preBuild.length>=3)return;preBuild.push(pid);usedProps.add(pid);};
  for(const p of [...(o.pre||[]),...(OV.extraPre?.[s.id]||[])])cand(p.key,p.why,0,p.opts);
  for(const p of o.core||[])cand(p.key,p.why,1,p.opts);
  // rule 14: a related key that is the skill of an EARLIER step of this year is a building block -> pre
  // r8 (A4): relOnly with its own related list (even []) replaces extraRelated and relR3
  const handRelAll=o.relOnly&&o.related?[...o.related]:[...(o.related||[]),...(OV.extraRelated?.[s.id]||[]),...(OV.relR3?.[s.id]||[])];
  for(const r of handRelAll){const k=resolve(r.key);const e0=earlierStep(k,s.id,true);const e=e0?(r.opts?bestOwner(k,s.id,r.opts)||e0:e0):null;if(e)cand(k,`${r.why} (earlier step this builds on: ${e} ${stepById[e].title})`,2,r.opts);}
  // r5: "the step before" is the latest step on the same topic TAUGHT before this one (school week), not the WRM neighbour
  const prev=yr.blocks.flatMap(bb=>bb.steps).filter(st=>st.id!==s.id&&topic(st)===topic(s)&&taughtBefore(st.id,s.id)).sort((a,c)=>((SWK[a.id]??999)-(SWK[c.id]??999))||(order.indexOf(a.id)-order.indexOf(c.id))).pop();
  if(!o.preOnly){
   const wk=lessonWeek[s.id];const ps=wk?priorSteps(wk):[];
   const kept=ps.filter(x=>stepById[x.id]&&feeds(s,stepById[x.id])&&order.indexOf(x.id)<order.indexOf(s.id)&&taughtBefore(x.id,s.id))
     .map(x=>({...x,same:topic(stepById[x.id])===topic(s)?0:1,dist:order.indexOf(s.id)-order.indexOf(x.id)})).sort((a,b)=>a.same-b.same||a.dist-b.dist);
   if(prev&&topic(prev)===topic(s))for(const k of allOf(prev.id).slice(0,2))cand(k,`${prev.id} ${prev.title} (taught before this step${prev.block===s.block?' in the block':''})`,1);
   for(const x of kept){const st=stepById[x.id];const ks=allOf(x.id);
     if(!ks.length){if(topic(st)===topic(s))for(const pid of propsOf[x.id]||[])addPB(pid);continue;}
     for(const k of ks.slice(0,2))cand(k,`${x.id} ${st.title} (prior learning wk ${wk})`,x.same?5:3);}
   // r8 (A1, rule 19): every block step TAUGHT EARLIER (school week), nearest week first, whatever its WRM position
   {let n=0;for(const st of b.steps.filter(x=>x.id!==s.id&&x.id!==prev?.id&&topic(x)===topic(s)&&taughtBefore(x.id,s.id)).sort((a,c)=>((SWK[c.id]??0)-(SWK[a.id]??0))||(order.indexOf(c.id)-order.indexOf(a.id)))){if(n>=3)break;const ks=allOf(st.id);if(ks.length)n++;for(const k of ks.slice(0,1))cand(k,`${st.id} ${st.title} (taught earlier, W${SWK[st.id]})`,4);}}
  }
  const take=()=>{pre.length=0;const seen=new Set();for(const c of [...cands].sort((a,b)=>a.tier-b.tier||a.ord-b.ord)){if(seen.has(c.key)||pre.length>=14)continue;seen.add(c.key);pre.push({key:c.key,why:c.why,...(c.opts?{opts:c.opts}:{})});}};
  take();
  if(pre.length<3&&prevYear&&!o.preOnly){const py=W.years.find(y=>y.id===prevYear);const cand6=py.blocks.flatMap(bb=>bb.steps).filter(st=>topic(st)===topic(s)).reverse();
    let n=0;for(const st of cand6){if(n>=2)break;const ks=allOf(st.id);if(!ks.length)continue;const k0=resolve(ks[0]);if(!okKey(k0,null)||cands.find(c=>c.key===k0))continue;cand(k0,`${st.id} ${st.title} (${prevYear}, same topic)`,6);n++;}
    take();}
  if(pre.length<3){for(const l of (OV.ladders?.[topic(s)]||[])){const k=resolve(l.key);if(cands.find(c=>c.key===k))continue;cand(k,l.why+' (topic ladder)',7,l.opts);take();if(pre.length>=3)break;}}
  for(const pid of o.preBuild||[])addPB(pid);
  if(pre.length<3&&!o.thinPreNote)console.error('THINPRE',s.id,s.title,pre.length);
  // ---- related (rule 5 / 14): the same idea in another form, the inverse, the NEXT step. Never an earlier step of
  // the block (that is pre), never a pre key. ----
  const related=[];
  const relOk=(k,op)=>k&&!(OV.exclude||[]).includes(k)&&!isDirect(k,op)&&!related.find(p=>p.key===k)&&!pre.find(p=>p.key===k)&&!b.steps.some(st=>st.id!==s.id&&taughtBefore(st.id,s.id)&&allOf(st.id).includes(k))&&related.length<6;
  const addRel=(k,why,opts)=>{k=resolve(k);if(relOk(k,opts))related.push({key:k,why,...(opts?{opts}:{})});};
  for(const r of handRelAll)addRel(r.key,r.why,r.opts);
  if(!o.relOnly){
   // r8 (A1, rule 19): the next steps in SCHOOL-WEEK order (taught after this one), never a step taught earlier
   {const byWk=(a,c)=>((SWK[a.id]??999)-(SWK[c.id]??999))||(order.indexOf(a.id)-order.indexOf(c.id));
    const later=[...b.steps.filter(x=>x.id!==s.id&&topic(x)===topic(s)&&!taughtBefore(x.id,s.id)).sort(byWk),...yr.blocks.flatMap(bb=>bb.steps).filter(x=>x.block!==b&&topic(x)===topic(s)&&!taughtBefore(x.id,s.id)).sort(byWk)];
    later.slice(0,4).forEach((nx,d)=>{if(related.length>=2&&d>0)return;for(const k of allOf(nx.id).slice(0,2))addRel(k,`${nx.id} ${nx.title} (${d===0?'next step':'a later step'}, W${SWK[nx.id]}: the same idea one step further)`);});}
   // last resort: a skill tagged to the step's OWN standard code that no earlier step uses (the same idea in another form)
   if(false)for(const c of s.ccss){for(const k of byStd[c]||[]){if(related.length>=2)break;if(SAMESTD_SKIP.test(k))continue;addRel(k,`also teaches ${c} (this step's standard): ${label[k]}`);}}
  }
  if(!related.length&&!o.relNote)console.error('NOREL',s.id,s.title);
  for(const e of [...pre,...related])e.opts=linkOpts(e);
  const yo=OV.linkOpts?.[YEAR]||{};
  for(const list of [pre,related])for(let j=list.length-1;j>=0;j--)if(yo[list[j].key]===null&&!Object.keys(list[j].opts||{}).length)list.splice(j,1);
  const lf=OV.linkFix?.[s.id]||{};
  for(const list of [pre,related])for(let j=list.length-1;j>=0;j--){const f=lf[list[j].key];if(f===null)list.splice(j,1);else if(f)list[j].opts=f;}
  // r4 (critic r3 S9, rule 18 content): year-wide link swaps. {to:null} drops the link (and may name a preBuild that
  // stands in for it); {to:key, opts} replaces it. `only` limits a swap to matching step ids. Rule 12 (keep an earlier
  // partial as pre) yields to rule 18 when that partial deals content above the pupil.
  const SW=OV.linkSwap?.[YEAR]||{};
  for(const list of [pre,related])for(let j=list.length-1;j>=0;j--){const e=list[j];const sw=SW[e.key];if(!sw||(sw.only&&!sw.only.test(s.id))||(sw.not&&sw.not.test(s.id)))continue;
    if(sw.preBuild&&list===pre&&!build.includes(sw.preBuild)&&!preBuild.includes(sw.preBuild)){preBuild.push(sw.preBuild);usedProps.add(sw.preBuild);}
    if(!sw.to){list.splice(j,1);continue;}
    list[j]={key:sw.to,why:sw.to===e.key?e.why:descWhy(sw.to,sw.opts||{},s.id,e.why),opts:sw.opts||{},swapped:true};}
  for(const list of [pre,related]){const seen=new Set(list===related?pre.map(x=>x.key):[]);for(let j=0;j<list.length;j++){const k=list[j].key;if(isDirect(k,list[j].opts)||seen.has(k)){list.splice(j,1);j--;}else seen.add(k);}}
  if(pre.length<3)for(const l of (OV.ladders?.[topic(s)]||[])){const k=resolve(l.key);if(pre.length>=3)break;if(isDirect(k,l.opts)||pre.find(x=>x.key===k)||(SW[k]&&!SW[k].to&&(!SW[k].only||SW[k].only.test(s.id))))continue;const rr=related.findIndex(x=>x.key===k);if(rr>=0)related.splice(rr,1);pre.push({key:k,why:l.why+' (topic ladder)',opts:l.opts||OV.linkOpts?.[YEAR]?.[k]||{}});}
  // r5 (rules 18-19): every link must be content met by this step's SCHOOL week. A pre that cites a step of this year
  // taught later is dropped; a link whose generated items carry a content marker first met later (scan TOL 2 weeks) tries
  // OV.markerFix alternatives (other opts / another skill) and is otherwise dropped. Then the topic ladder refills pre.
  const citesLater=e=>{const all=[...String(e.why).matchAll(/(R|Y\d)\.B\d+\.S\d+/g)].map(m=>m[0]);if(all.some(x=>!x.startsWith(YEAR+'.')))return false; // also earlier-grade learning
    const c=all.filter(x=>x.startsWith(YEAR+'.'));
    if(c.length)return c.some(x=>!taughtBefore(x,s.id))&&!c.some(x=>taughtBefore(x,s.id));
    return (keyFirstWk[e.key]??0)>(SWK[s.id]??999)+1&&!/Y\d\.|R\./.test(e.why);};
  const fixLink=(e)=>{if(!markerHits(e.key,e.opts,s.id).length)return e;
    for(const alt of OV.markerFix?.[YEAR]?.[e.key]||[]){const ne={key:alt.key||e.key,why:descWhy(alt.key||e.key,alt.opts||{},s.id,e.why),opts:alt.opts||{}};
      if(!isDirect(ne.key,ne.opts)&&!markerHits(ne.key,ne.opts,s.id).length)return ne;}
    return null;};
  const dropped=[];const coreKeys=new Set((o.core||[]).map(c=>resolve(c.key)));
  for(const list of [pre,related])for(let j=list.length-1;j>=0;j--){const e=list[j];if(list===pre&&citesLater(e)){dropped.push(e.key+' (taught later)');if(coreKeys.has(e.key)){console.error('COREDROP',s.id,e.key,'taught later');process.exitCode=1;}list.splice(j,1);continue;}
    const ne=fixLink(e);if(!ne){if(list===pre&&coreKeys.has(e.key)){console.error('COREDROP',s.id,e.key,markerHits(e.key,e.opts,s.id).map(h=>h.m).join(','));process.exitCode=1;}dropped.push(e.key+' ('+markerHits(e.key,e.opts,s.id).map(h=>h.m).join(',')+')');list.splice(j,1);}else list[j]=ne;}
  for(const list of [pre,related]){const seen=new Set(list===related?pre.map(x=>x.key):[]);for(let j=0;j<list.length;j++){const k=list[j].key;if(isDirect(k,list[j].opts)||seen.has(k)){list.splice(j,1);j--;}else seen.add(k);}}
  if(pre.length<3)for(const l of (OV.ladders?.[topic(s)]||[])){const k=resolve(l.key);if(pre.length>=3)break;if(isDirect(k,l.opts)||pre.find(x=>x.key===k))continue;
    const e={key:k,why:l.why+' (topic ladder)',opts:l.opts||OV.linkOpts?.[YEAR]?.[k]||{}};if(citesLater(e))continue;const ne=fixLink(e);if(!ne)continue;const rr=related.findIndex(x=>x.key===ne.key);if(rr>=0)related.splice(rr,1);pre.push(ne);}
  // a kept pre whose why also names a same-year step taught LATER (the content is earlier-grade learning): drop that name
  for(const e of pre){for(const x of [...String(e.why).matchAll(/Y\d\.B\d+\.S\d+/g)].map(m=>m[0]))if(x.startsWith(YEAR+'.')&&!taughtBefore(x,s.id)){const q=x.replace(/\./g,'\\.');e.why=e.why.replace(new RegExp('\\s*/\\s*'+q),'').replace(new RegExp(q+'\\s*/\\s*'),'');}}
  for(const e of [...pre,...related]){if(e.swapped&&e.why.includes('[rule'))e.why=descWhy(e.key,e.opts,s.id,e.why);delete e.swapped;
    e.why=String(e.why).replace(/\s*\[rule \d+[^\]]*\]/g,'');
    // r7: a cited step whose own opts for this key differ from the link's: cite the step that uses these opts instead
    if(e.opts&&Object.keys(e.opts).length)for(const c of [...String(e.why).matchAll(/Y\d\.B\d+\.S\d+/g)].map(m=>m[0])){const so=stepOptsFor(c,e.key);if(JSON.stringify(so||{})!==JSON.stringify(e.opts)){const t=taughtAt(e.key,s.id,e.opts);if(t&&t!==c&&JSON.stringify(stepOptsFor(t,e.key))===JSON.stringify(e.opts))e.why=e.why.replace(c,t).replace(stepById[c].title,stepById[t].title);}}
    if(whyMismatch(e))e.why=descWhy(e.key,e.opts,s.id,e.why);
    if(whyContentBad(e).length)console.error('WHYBAD',s.id,e.key,JSON.stringify(e.opts),whyContentBad(e).join(','),'|',e.why.slice(0,80));}
  pre.splice(8);related.splice(6);
  // r6: never-in-grade content on the step's own skills must be named (critic r5: B4.S8 class)
  for(const d of [...direct,...partial])for(const h of markerHits(d.key,d.opts,s.id).filter(h=>MK.NEVERDIRECT[YEAR].includes(h.m)))
    if(!(o.neverNamed||[]).includes(d.key))console.error('NEVERDIRECT',s.id,verdict,d.key,JSON.stringify(d.opts||{}),h.m,h.ex);
  if(process.argv.includes('--dropped')&&dropped.length)console.error('DROPPED',s.id,dropped.join('; '));
  if(!related.length&&!o.relNote)console.error('NOREL(after linkFix)',s.id,s.title);
  if(pre.length<3)console.error('THINPRE(after linkFix)',s.id,s.title,pre.length);
  for(const id of build)usedProps.add(id);
  out.steps[s.id]={title:s.title,direct,partial,verdict,missing,build,pre,preBuild,related,note:[o.note||(lessonWeek[s.id]?'':'not in the school sequence xlsx; pre-skills from the block and the previous year'),!related.length&&o.relNote?o.relNote:''].filter(Boolean).join('. ')};
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
