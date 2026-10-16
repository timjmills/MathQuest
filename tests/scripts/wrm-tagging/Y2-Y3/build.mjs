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
const root=new URL('../../../../',import.meta.url).pathname;
const [YEAR, MAXB] = [process.argv[2], +process.argv[3] || 99];
const _log=console.log;console.log=()=>{};
const {SKILLS}=await import(root+'js/modules/data.js');
const _warn=console.warn;console.warn=()=>{};
const {generateQuestionFor}=await import(root+'js/modules/generate-question.js');
console.log=_log;console.warn=_warn;
const MK=await import(HERE+'markers.mjs');
const CL=await import(HERE+'claims.mjs');
const DN=await import(HERE+'denoms.mjs'); // r13 (critic r12 N12): denominators read from the cell payload too
const {SKILL_WRM,WRM_PROPOSALS}=await import(root+'js/modules/wrm.js');
const {SKILL_STANDARDS}=await import(root+'js/modules/standards.js');
const {SKILL_ALIASES}=await import(root+'js/modules/skill-aliases.js');
const BL=await import(root+'js/modules/build-list.js');
const OV=(await import(HERE+'overrides.mjs?'+Date.now()));
const W=JSON.parse(fs.readFileSync(root+'data/curriculum/wrm-steps.json'));
// r11 (critic r10 N9): the PASSED lanes' links files are read-only inputs (vendored copies under
// tests/scripts/wrm-tagging/Y2-Y3/inputs/, from the R/Y1 and Y4 lane branches). An R.* / Y1.* step's skills and their opts
// come from its lane's file, so a K rung of a Grade 1 skill keeps its opts ({usd, like, band 50}) instead of arriving as {}.
const INP=root+'data/curriculum/links/';
const LANE={};for(const y of ['R','Y1'])LANE[y]=JSON.parse(fs.readFileSync(INP+y+'.json','utf8'));
const laneStep=id=>{const y=id.split('.')[0];return LANE[y]?.steps?.[id]||null;};
const SO=await import(root+'js/modules/skill-options.js');

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
const allOf=id=>{const ls=laneStep(id);if(ls)return [...new Set([...ls.direct,...ls.partial].map(e=>resolve(e.key)).filter(Boolean))];const o={...(OV.steps[id]||{}),...(OV.r3?.[id]||{})};if(o.mergeOnly)return allOf0(id,o).filter(k=>!o.mergeOnly.includes(k));return allOf0(id,o);};
// r11: o.mergeOnly = a partial tag carried for the cross-lane merge only (another lane's clause): never a link source
const allOf0=(id,o)=>{let d,p;if(o?.direct||o?.partials){d=(o.direct||[]).map(x=>x.key);p=(o.partials||[]).map(x=>x.key);}else{d=(tags[id]||[]).filter(t=>!t.partial).map(t=>t.key);p=(tags[id]||[]).filter(t=>t.partial).map(t=>t.key);}return [...new Set([...d,...p].map(k=>resolve(k)).filter(Boolean))];};
// r12: is key k a DIRECT (full) skill of step id? A citation prefers the step where the key is direct (its title is true of the items)
function directAt(id,k){const ls=laneStep(id);if(ls)return ls.direct.some(x=>resolve(x.key)===k);const ow={...(OV.steps[id]||{}),...(OV.r3?.[id]||{})};
  if(ow.direct||ow.partials)return (ow.direct||[]).some(x=>resolve(x.key)===k);return (tags[id]||[]).some(t=>!t.partial&&resolve(t.key)===k);}
function earlierStep(k,sid,sameYear){const y=sid.split('.')[0];const at=order.indexOf(sid);for(let j=at-1;j>=0;j--){const id=order[j];if(sameYear&&!id.startsWith(y+'.'))continue;if(typeof taughtBefore==='function'&&!taughtBefore(id,sid))continue;if(allOf(id).includes(k))return id;}return null;}
const SAMESTD_SKIP=/:mixed_|_plain$/;
// r3 rule 18: a pre/related LINK carries opts. Hand opts on the entry win; else the opts the referenced step (the first
// step id in its why) uses for that key; else the year's default for the key (OV.linkOpts[YEAR]); else {}.
function stepOptsFor(id,k){const ls=laneStep(id);if(ls){for(const d of [...ls.direct,...ls.partial])if(resolve(d.key)===k&&d.opts&&Object.keys(d.opts).length)return d.opts;return null;}const o={...(OV.steps[id]||{}),...(OV.r3?.[id]||{})};for(const d of [...(o.direct||[]),...(o.partials||[])])if(resolve(d.key)===k&&d.opts&&Object.keys(d.opts).length)return d.opts;
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
  if(k==='measurement:mass_volume_liquid'&&o.forms)t.push(o.forms.map(f=>['a cylinder in mL','a scale in g or kg','sorting by unit'][f]).join(', '));
  if(k==='measurement:estimate_length'&&o.forms)t.push('about how long is it? a sensible length in metric units');return t.join('; ');}
// r8 (A3): the earlier step (this year or an earlier grade) that owns key k with opts closest to o: exact opts first, then
// opts whose rows / tables / parts contain the link's, then any use of the key; ties go to the latest step
function bestOwner(k,sid,o){const want=JSON.stringify(o||{});const set=x=>(x?.rows||[]).map(r=>r.step).concat(x?.constant||[],x?.parts||[]);const ws=set(o);let best=null,bs=-1;
  for(const id of order){if(id===sid||!allOf(id).includes(k))continue;if(id.startsWith(YEAR+'.')?!taughtBefore(id,sid):order.indexOf(id)>order.indexOf(sid))continue;
    const so=stepOptsFor(id,k);const ss=set(so);const sc=(JSON.stringify(so||{})===want?3:(ws.length&&ws.every(v=>ss.includes(v)))?2:1)*2+(directAt(id,k)?1:0);if(sc>=bs){bs=sc;best=id;}}return best;}
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
// r9: two opts of one key share no content when their table / part / denominator / form lists are disjoint
// (mult_facts {constant:[5,10]} and {constant:[2]}); only then may a key sit in both pre and related
function disjointOpts(a,b){if(a&&b&&a.span!=null&&b.span!=null&&a.span!==b.span)return true; // r10: a 0-100 line in tens and a 0-1,000 line in hundreds
  const L=o=>{o=o||{};for(const f of ['constant','parts','denoms','forms'])if(Array.isArray(o[f]))return [f,o[f]];if(Array.isArray(o.rows))return ['rows',o.rows.map(r=>r.step)];return null;};
  const x=L(a),y=L(b);return !!(x&&y&&x[0]===y[0]&&!x[1].some(v=>y[1].includes(v)));}
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
// r10 (critic r9 N5a): a why that cites a count from 0 must deal >= 90% of its items on the multiples of that count
const COUNTKEY=/^(patterns:(seq_\d+|skip_count_line)|multiplication:count_by_tables|counting:number_seq_fill|composing:hundreds_chart_fill)$/;
const COUNTCITE=/\bCount in (2|5|10)s\b|counting in (2|5|10)s|\bTens to 100\b|\b(Y1\.B9\.S[123]|Y1\.B12\.S2|Y2\.B1\.S15)\b/i;
function countNs(why){const w=String(why);const ns=new Set();for(const m of w.matchAll(/\b(?:count(?:ing)? in|count by)\s+((?:\d+s?(?:,\s*|\s+and\s+|\s*\/\s*)?)+)/gi))for(const d of m[1].matchAll(/\d+/g))ns.add(+d[0]);
  if(/Tens to 100|Y1\.B12\.S2/i.test(w))ns.add(10);if(/Y1\.B9\.S1\b/.test(w))ns.add(2);if(/Y1\.B9\.S2\b/.test(w))ns.add(10);if(/Y1\.B9\.S3\b/.test(w))ns.add(5);if(/Y2\.B1\.S15\b/.test(w)&&!ns.size)[2,5,10].forEach(n=>ns.add(n));return [...ns].filter(n=>[2,3,4,5,8,10,50,100].includes(n));}
function countMultFrac(e,ns){const its=markerHits.items(e.key,e.opts||{}).slice(0,60);if(!its.length||!ns.length)return 1;let ok=0;
  for(const q of its){let p=null;try{p=q.p?JSON.parse(q.p):null;}catch(_){}const nums=Array.isArray(p?.values)?p.values.filter(x=>typeof x==='number'):[...(q.to+' '+q.a).replace(/\bt\d+\b/g,'').matchAll(/\d+/g)].map(x=>+x[0]);
    if(nums.length&&ns.some(n=>nums.every(x=>x%n===0)))ok++;}return ok/its.length;}
function whyContentBad(e){const head=String(e.why).split('—')[0].split(/\(Y\d|\(prior|\(earlier|\(taught/)[0].split(':')[0].replace(/\b(is |as )?(the )?same (exchange|idea|calculation|compare|count|language)\b[\s\S]*/i,'').replace(/\b(like|as in)\b[\s\S]*/i,'');const its=markerHits.items(e.key,e.opts||{}).slice(0,60);if(!its.length)return [];
  const txt=its.map(q=>q.to+' '+q.a+' '+q.p+' '+(q.v||'')).join(' \n ');const mx=Math.max(...its.map(q=>Math.max(0,...[...(q.t+' '+q.a).replace(/\d{1,2}:\d\d/g,'').replace(/\d+(?:,\d+){2,}/g,x=>x.replace(/,/g,' '))/* r9: an ordering answer "236,511,961" is a list, not one number */.replace(/(\d),(\d{3})(?!\d)/g,'$1$2').matchAll(/\d+/g)].map(m=>+m[0]))));const bad=[];const isTime=/^measurement:(time|elapsed|clock)/.test(e.key);
  for(const m of head.matchAll(/(?:within|to|up to) (\d[\d,]*)/gi)){const n=+m[1].replace(/,/g,'');if(mx>n*1.05&&n>=10)bad.push(m[0]);}
  for(const m of head.matchAll(/(\d+)s?(?: and (\d+))? times-tables?|counting in (\d+)s|dividing by (\d+)/g)){const n=+(m[1]||m[3]||m[4]);if(!new RegExp(`(\\b${n}\\s*[×x÷]|[×x÷]\\s*${n}\\b|"step":${n}\\b|\\b${n}, ?${2*n}, ?${3*n}|by ${n}\\b|in ${n}s\\b|\\b${n}s\\b)`,'i').test(txt)&&!payloadStep(its,n))bad.push(n+'s');}
  // r8: units, money and fraction words are content only for measurement / fraction / graph / shape skills; on a number
  // skill they are the analogy that explains the link ("1 kg = 1,000 g is the same exchange as 1 thousand = 10 hundreds")
  const unitSkill=/^(measurement|fractions|fraction_operations|graphs|shapes_early|composing:(fraction|compose_whole))/.test(e.key);
  for(const [re,u] of UNITS){if(!unitSkill)continue;if(isTime&&/third|quarter/.test(re.source)&&!/past|to/.test(re.source))continue;if(re.test(head)&&!new RegExp(u.source,'i').test(txt))bad.push(re.source.slice(0,12));}return bad;}
// r11 helpers for the rung chooser (critic r10 N8)
const TABLEKEYS=new Set(['multiplication:count_by_tables','multiplication:mult_facts','division:div_facts']);
const tabsOf=op=>Array.isArray(op?.rows)?op.rows.map(r=>r.step):Array.isArray(op?.constant)?op.constant:null;
const CBT_HOME='Y2.B1.S15';const CBT_ROWS={rows:[2,5,10].map(n=>({step:n,start:'zero',dir:'up'}))};
const OPTDEF=k=>{const[c,sk]=k.split(':');try{return SO.optionsFor(c,sk)||[];}catch(_){return [];}};
const effOpts=(k,op)=>{const o={};for(const x of OPTDEF(k))if(x.default!==undefined)o[x.id]=x.default;return {...o,...(op||{})};};
const IGN=new Set(['level','support','currency']);
// r12: two opts of one key that generate the same items (text, answer, payload, visual) on the marker seeds are the same link
const sameItems=(k,a,b)=>{const x=markerHits.items(k,a||{}).slice(0,40),y=markerHits.items(k,b||{}).slice(0,40);return x.length>0&&x.length===y.length&&x.every((q,i)=>q.t===y[i].t&&q.a===y[i].a&&q.p===y[i].p&&q.v===y[i].v);};
const effEq=(k,a,b)=>{const x=effOpts(k,a),y=effOpts(k,b);for(const f of ['level','support'])(delete x[f],delete y[f]);const n=o=>JSON.stringify(Object.entries(o).sort());return n(x)===n(y);};
// the rung deals the same content as the step in a smaller band, or a subset of its forms / tables / values
function rungSame(k,ro,dop){const a=effOpts(k,ro),b=effOpts(k,dop);for(const f of new Set([...Object.keys(a),...Object.keys(b)])){if(IGN.has(f))continue;const x=a[f],y=b[f];if(JSON.stringify(x)===JSON.stringify(y))continue;
  if(['band','range','span'].includes(f)&&typeof x==='number'&&(y==null||(typeof y==='number'&&x<y)))continue; // a direct with no band takes the Max Number setting
  const X=f==='rows'?tabsOf(a):x,Y=f==='rows'?tabsOf(b):y;if(Array.isArray(X)&&Array.isArray(Y)&&X.every(v=>Y.includes(v)))continue;return false;}return true;}
// what the rung deals, in the option labels of skill-options.js, for the options where it differs from the step
function rungDeals(k,ro,dop){const a=effOpts(k,ro),b=effOpts(k,dop);const out=[];const tb=tabsOf(a);
  if(TABLEKEYS.has(k)&&tb)return (k==='multiplication:count_by_tables'?'counting in '+tb.map(n=>n+'s').join(', ')+' from 0':k==='division:div_facts'?'dividing by '+tb.join(', '):'the '+tb.join(', ')+' times-table'+(tb.length>1?'s':''));
  for(const x of OPTDEF(k)){if(IGN.has(x.id))continue;const v=a[x.id],w=b[x.id];if(JSON.stringify(v)===JSON.stringify(w))continue;
    // r13 (N12): the denoms option is a FILTER the = / ≠ items escape: name the ticked families as the option, not as what is dealt
    if(x.id==='denoms'&&Array.isArray(v)){const f=v.map(d=>({2:'halves',3:'thirds',5:'fifths'})[d]||d+'s');out.push(`denominators option: the ${f.length>1?f.slice(0,-1).join(', ')+' and '+f[f.length-1]+' families':f[0]+' family'}`);continue;}
    const lab=z=>(x.values||[]).find(q=>q.v===z)?.l??String(z);
    let t=Array.isArray(v)?v.map(lab).join(' and '):lab(v);if(t==null||t==='undefined')continue;t=t.replace(/\s*\([^)]*\)$/,m=>/mL|g or kg/.test(m)?m:'');
    if(a.currency==='usd')t=t.replace(/riyals or dollars/g,'dollars').replace(/riyal or dollar/g,'dollar');
    const lb=String(x.label||x.id).toLowerCase(),tl=t.charAt(0).toLowerCase()+t.slice(1);out.push(tl.startsWith(lb)?tl:lb+': '+tl);}
  return out.join('; ');}
const RUNGREL={'measurement:mass_volume_liquid':'the same scale reading in another measure','measurement:length_metric':'the same exchange in another pair of units',
  'multiplication:arrays_groups':'the same multiplication in the other picture','placevalue:more_less_100':'the same jump on a number in another size',
  'measurement:money_count':'counting money of another kind first','measurement:money_change':'finding change with other amounts first',
  'measurement:money_notation':'reading money of another kind first','measurement:money':'adding money in other amounts first'};
// r12 (critic r11 N11, rule 14): rank pre by BUILDING BLOCK before WRM distance, for every step.
//  Hand pre (overrides) keep their order and lead; every other link gets a class from what its skill deals:
//  addition / subtraction steps (block topic addsub):
//   1 the same operation in the same layout one band lower, or with no exchange before exchange (and the step's own
//     skill at another rung); 2 the place-value parts (add or subtract 10s / 100s, tens and ones) and the 1s facts / bonds
//     (parts first on a 2- or 3-digit step, bonds first on a within-20 step); 3 the inverse operation in the same layout,
//     fact families and missing numbers; 4 word problems and the other operation's lower facts.
//  multiplication / division steps: 1 the same operation (tables, counts, arrays); 2 × facts for a ÷ step, other blocks;
//   3 ÷ for a × step, fact families; 4 word problems.
//  every other step: word problems last (unless the step is itself a problem step); the rest keep their tier order.
//  Inside a class the earlier tier order (step before, xlsx week list, block) still breaks ties.
function bbKey(k){const [cat,id]=k.split(':');
  let m=/^(add|sub)_(10|20|50|100|1k|10k)_(no_regroup|regroup|mixed)$/.exec(id);
  if(m){const lvl={10:1,20:1,50:2,100:3,'1k':4,'10k':5}[m[2]];return {op:m[1],kind:lvl===1?'fact':'calc',lvl,ex:m[3]!=='no_regroup'};}
  const opOf={addition:'add',subtraction:'sub',multiplication:'mul',division:'div'}[cat]||null;
  if(/^(add|sub)_wp_|word_problems|^comparison_word$|^multi_step_word$|^unknown_start_wp$|^two_step/.test(id))return {op:opOf,kind:'wp'};
  const T={'addition:add_facts':['add','fact',1],'addition:add_5_pictures':['add','fact',1],'addition:add_three':['add','fact',1],'addition:number_line_add':['add','nl',1],'addition:nl_add':['add','nl',1],
    'subtraction:sub_facts':['sub','fact',1],'subtraction:sub_5_pictures':['sub','fact',1],'subtraction:nl_sub':['sub','nl',1],'subtraction:number_line_sub':['sub','nl',1],
    'addition:add_sub_10s':['both','pvop'],'addition:add_sub_100s':['both','pvop'],'placevalue:more_less_10':['both','pvop'],'placevalue:more_less_100':['both','pvop'],
    'composing:make_ten':['both','bond'],'composing:number_bonds':['both','bond'],'number_sense:make_a_ten':['add','bond'],'composing:ten_frame_build':['both','bond'],'composing:ten_frame_build_teen':['both','bond'],'number_sense:doubles_near_doubles':['add','bond'],'number_sense:compensation':['both','bond'],
    'addition:add_sub_fact_family':['both','fam'],'addition:number_families_add':['both','fam'],'addition:fact_family_sort':['both','fam'],'addition:cloze_addition':['both','fam'],'subtraction:missing_add_sub':['both','fam'],'subtraction:sub_check_by_adding':['both','fam'],
    'multiplication:mult_div_fact_family':['both','fam'],'division:missing_mult_div':['both','fam'],'multiplication:count_by_tables':['mul','count'],'patterns:double':['mul','calc'],'patterns:halve':['div','calc']};
  if(T[k])return {op:T[k][0],kind:T[k][1],lvl:T[k][2]??null,ex:null};
  if(/^composing:(base10_build|tens_foundation_visual|teen_compose|hundreds_chart_fill)|^placevalue:(unit_form|identify|value|expand|combine|place_value_disks)$/.test(k))return {op:null,kind:'pvrep'};
  if(cat==='multiplication'||cat==='division')return {op:opOf,kind:'calc'};
  return null;}
function bbStep(s,own){const t=s.title.toLowerCase();const fs=own.map(bbKey).filter(Boolean).map(f=>f.kind==='nl'?{...f,kind:'fact'}:f);const area={addsub:'as',muldiv:'md'}[topic(s)]||'other';
  const wp=fs.some(f=>f.kind==='wp')||/problem|two-step|four operations|calculate|mixed addition|find change/.test(t);
  let op=null,titleOp=false;if(area==='as'){const a=/\badd|\bsum|plus|bonds|complements/.test(t),b=/subtract|minus|difference/.test(t);op=a&&b?'both':a?'add':b?'sub':null;titleOp=!!op;
    if(!op){const os=new Set(fs.filter(f=>['calc','fact','wp'].includes(f.kind)).map(f=>f.op));op=os.size===1?[...os][0]:'both';}}
  if(area==='md'){const a=/multipl|times|equal groups|arrays|repeated|doubl|lots of|scaling|how many ways/.test(t),b=/divid|shar|halv|÷|link/.test(t);op=a&&b?'both':b?'div':a?'mul':'both';}
  const cf=fs.filter(f=>['calc','fact'].includes(f.kind)&&f.lvl);
  // a bonds / related-facts step works at the facts level; a step whose own skills are place-value moves is a place-value step
  const lvl=cf.length?Math.max(...cf.map(f=>f.lvl)):fs.some(f=>['bond','fam'].includes(f.kind))?1:null;const pvStep=!cf.length&&fs.some(f=>['pvop','pvrep'].includes(f.kind));
  const ex=cf.length?cf.some(f=>f.ex):(/not across|no exchange/.test(t)?false:/across|exchange/.test(t)?true:null);
  // bonds lead on a bonds step, a step to the next 10 and a bridging step within 50 (8 + 5, 38 + 5); the place-value parts lead on a 2- or 3-digit step
  const bondsFirst=/bond|complement|next 10|making 10|make 10/.test(t)||lvl===1||(lvl===2&&ex===true);
  return {area,op,lvl,ex,wp,pvStep,bondsFirst,bondStep:/bond|complement|next 10/.test(t),famStep:!cf.length&&fs.some(f=>f.kind==='fam'),
    // a step that names no operation and deals no calculation or facts of its own (spot the pattern, make connections,
    // estimate, make decisions, compare number sentences): no operation ladder applies, only word problems go last
    neutral:area==='as'&&!titleOp&&!cf.length&&!fs.some(f=>['fam','wp','pvop','pvrep'].includes(f.kind)),own:new Set(own)};}
function bbRank(P,k){const f=bbKey(k);
  if(P.area==='other'||P.neutral)return f&&f.kind==='wp'&&!P.wp?[4,0]:[2,0];
  if(P.own.has(k))return [1,0];
  if(f&&f.kind==='wp')return P.wp?[1,1]:[4,0];
  if(P.area==='as'){if(!f)return [2,5];const big=P.lvl!=null&&P.lvl>=2;
    if(P.bondStep&&f.kind==='bond')return [1,0];
    if(P.famStep&&(f.kind==='fam'||f.kind==='bond'))return [1,f.kind==='fam'?0:1]; // related facts / missing numbers: the fact families and the part-whole bonds
    if(P.pvStep){if(f.kind==='pvop'||f.kind==='pvrep'||f.kind==='count')return [1,f.kind==='pvop'?0:f.kind==='count'?2:1];if(f.kind==='bond'||f.kind==='fact'||f.kind==='nl'||f.kind==='calc'&&f.lvl<=2)return [2,f.kind==='bond'?0:1];if(f.kind==='fam')return [3,1];return [3,0];}
    if(f.kind==='calc'||f.kind==='fact'||f.kind==='nl'){const same=P.op==='both'?['add','sub'].includes(f.op):f.op===P.op;
      if(same){if(P.lvl==null)return [1,f.kind==='nl'?3:2];const d=P.lvl-f.lvl;if(f.kind==='nl')return d<=0?[1,3]:[2,big?2:1];if(d===1&&f.ex===P.ex)return [1,0];if(d===0)return [1,f.ex?2:1];if(d===1)return [1,2];if(d<0)return [3,5];return [2,big?2:1];}
      if(P.lvl!=null&&f.kind==='calc'&&Math.abs(P.lvl-f.lvl)<=1)return [3,0];if(P.lvl===1&&f.kind!=='calc')return [3,0];return [4,1];}
    const bf=P.bondsFirst,rep1=/^composing:base10_build|^placevalue:unit_form$/.test(k);
    if(f.kind==='bond')return [2,bf?0:4];if(f.kind==='pvop')return [2,bf?3:0];if(f.kind==='pvrep')return [2,bf?4:rep1?1:3];if(f.kind==='fam')return P.lvl===1?[2,1]:[3,1];return [2,5];}
  if(P.area==='md'){if(!f)return [2,1];if(f.kind==='count')return P.op==='div'?[2,0]:[1,0];if(P.op==='both'&&['mul','div'].includes(f.op)||f.op===P.op)return [1,0];if(f.op==='mul'&&P.op==='div')return [2,0];if(f.kind==='fam')return [3,1];if(f.op==='div'&&P.op==='mul')return [3,0];return [2,1];}
  return [2,0];}
const bbSort=(P,list)=>{const r=list.map((e,i)=>({e,i,c:e.hand?[-e.hand,0]:bbRank(P,e.key)}));r.sort((a,b)=>a.c[0]-b.c[0]||a.c[1]-b.c[1]||a.i-b.i);return r.map(x=>x.e);};
const keyFirstWk={};for(const st of yr.blocks.flatMap(bb=>bb.steps))for(const k of allOf(st.id))keyFirstWk[k]=Math.min(keyFirstWk[k]??999,SWK[st.id]??999);
const titleStats={half:0,nlp:0,bad:0};
const CLAIMVERB={sorts:'sort',clicks:'click',drags:'drag',converts:'convert','number line':'use a number line',litres:'use litres','ruler / scale':'read a scale',money:'use money','ounces / pounds':'use pounds',centimetres:'use centimetres',millimetres:'use millimetres',kilometres:'use kilometres',metres:'use metres',kilograms:'use kilograms',grams:'use grams',millilitres:'use millilitres','minutes / hours / seconds':'tell the time','equal parts':'name equal parts','graph / chart / table':'use a graph or table',fractions:'use fractions'};
// the school teaches the UK money steps in US money: a cited title's pounds / pence / notes are dollars / cents / bills
const usTitle=id=>{const t=stepById[id].title;return /pound|pence|\bnotes\b/i.test(t)?t.replace(/\bpounds\b/gi,'dollars').replace(/\bpound\b/gi,'dollar').replace(/\bpence\b/gi,'cents').replace(/\bnotes\b/gi,'bills').replace(/£/g,'$'):t;};
// the items a title claim is judged on: 30 print-path items on the build's own seeds (not the sweep's), with the picture's raw
// markup, the cell template and payload (a representation claim reads them, as the sweep does)
const _ci=new Map();const _st=x=>String(x??'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&#?\w+;/g,' ').replace(/\s+/g,' ');
const _lb=x=>x==null?'':typeof x==='object'?(x.label??x.text??x.html??JSON.stringify(x)):String(x);
const claimItems=(k,o)=>{const id=k+JSON.stringify(o||{});if(_ci.has(id))return _ci.get(id);const [c,sk]=k.split(':');const out=[];
  for(let i=0;i<30;i++){let q;try{q=generateQuestionFor({category:c,skill:sk,opts:o||{},seed:61331+i*73,itemIndex:i%20,itemCount:20});}catch(_){continue;}if(!q)continue;
    out.push({text:_st(q.text),a:_st(typeof q.ans==='object'?JSON.stringify(q.ans):q.ans),x:_st([...(q.options||[]),...(q.tiles||[]),...(q.bins||[]),...(q.items||[])].map(_lb).join(' ; ')),vis:_st(q.visual),raw:String(q.visual||'').toLowerCase().slice(0,6000),tpl:q.cell?q.cell.template:'',pay:q.cell?JSON.stringify(q.cell.payload):''});}
  _ci.set(id,out);return out;};
  // r12 TITLECLAIM (the cited title is a claim, Y5 critic r6 H'): a why that cites a step claims that step's title. When the
  // title names what the link's items never deal: an "add and subtract" title on a one-operation skill gets the half marker
  // ("the adding half"); a skill that is only PARTIAL at the cited step gets "nearest live practice" (the title is the step's,
  // the skill is its partial practice); a skill that is DIRECT there is a build error (the why or the opts must change by hand)
// r13 (critic r12 N12): a denoms link whose why (or a title it cites) names a denominator family while its items deal other
// families (read from the cell payload too: denoms.mjs) gets the hand note OV.denomNote[key|opts], which says what is dealt.
// DENOMCHECK (end of the build) fails on any link, clause or why still untrue.
const DNOPT={n:120,seed:52807,step:113};
function denomNotePass(lists){for(const list of lists)for(const e of list){if(!Array.isArray(e.opts?.denoms))continue;
  const f=DN.denomFinds({steps:{x:{direct:[],partial:[],pre:[e],related:[]}}},DNOPT).finds;if(!f.some(x=>x.kind==='FAMILY'))continue;
  const note=OV.denomNote?.[e.key+'|'+JSON.stringify(e.opts)];if(!note){console.error('DENOMNOTE no note for',e.key,JSON.stringify(e.opts),'|',f.map(x=>x.msg).join('; '));process.exitCode=1;continue;}
  if(!e.why.includes(note))e.why+=' — '+note;}}
function titleClaimPass(sid,lists){for(const [role,list] of lists)for(const e of list){if(/nearest live practice/.test(e.why))continue;
    const ids=[...new Set([...String(e.why).matchAll(/(?:R|Y\d)\.B\d+\.S\d+/g)].map(m=>m[0]))].filter(id=>stepById[id]);if(!ids.length)continue;
    const its=claimItems(e.key,e.opts);if(!its.length)continue;
    for(const id of ids){const t=usTitle(id);const bad=CL.claimHits(t,its).filter(h=>!h.ok);if(!bad.length)continue;
      const ops=bad.map(h=>h.claim);const both=/\badd/i.test(t)&&/subtract/i.test(t)||/multipl/i.test(t)&&/divi/i.test(t);
      if(both&&ops.every(c=>['adds','subtracts','multiplies','divides'].includes(c))){const half={subtracts:'adding',adds:'subtracting',divides:'multiplication',multiplies:'division'}[ops[0]];
        if(!e.why.includes('the '+half+' half'))e.why=e.why.replace(/\)\s*$/,'')+(/\)\s*$/.test(e.why)?'; ':' (')+'the '+half+' half)';titleStats.half++;continue;}
      const ls=laneStep(id);const ow={...(OV.steps[id]||{}),...(OV.r3?.[id]||{})};
      const [dK,pK]=ls?[ls.direct.map(x=>resolve(x.key)),ls.partial.map(x=>resolve(x.key))]:(ow.direct||ow.partials)?[(ow.direct||[]).map(x=>resolve(x.key)),(ow.partials||[]).map(x=>resolve(x.key))]:[(tags[id]||[]).filter(t=>!t.partial).map(t=>resolve(t.key)),(tags[id]||[]).filter(t=>t.partial).map(t=>resolve(t.key))];const isPartial=pK.includes(e.key)&&!dK.includes(e.key);
      const notThere=!allOf(id).includes(e.key);
      if(isPartial||notThere){e.why=e.why.replace(/\)\s*$/,'')+(/\)\s*$/.test(e.why)?'; ':' (')+`nearest live practice: ${id} has ${isPartial?'it as a partial skill':'no skill that does this'}, and these items never ${ops.map(c=>CLAIMVERB[c]||c).join(' or ')})`;titleStats.nlp++;break;}
      console.error('TITLECLAIM',sid,role,e.key,JSON.stringify(e.opts||{}),'cites',id,t,'| false:',ops.join(','));process.exitCode=1;titleStats.bad++;}}}
// r13 SPECOPTS (critic r12 M1, the Y5 lane's specopts): the spec snapshot of every entry's skills, compared one to one with the
// WRITTEN file after the write, so a re-option anywhere after the gates (or after the step pass) fails the build
const specSnap={};const sig=e=>e.key+'|'+JSON.stringify(e.opts||{});
const usedProps=new Set();const missingReview=[];const bbStats={n:0,bad:0,cls:{}};const optStats={n:0,spec:0,bad:0,rule:{}};
for(const b of yr.blocks){ if(b.number>MAXB)continue;
 b.steps.forEach((s,i)=>{
  const o={...(OV.steps[s.id]||{}),...(OV.prePatch?.[s.id]||{}),...(OV.r3?.[s.id]||{})};if(OV.gapMissing?.[s.id])o.missing=OV.gapMissing[s.id];
  if(!o.direct&&!o.partials&&!o.reviewed)missingReview.push(s.id);
  const T=tags[s.id]||[];
  let direct,partial;
  if(o.direct||o.partials){direct=(o.direct||[]).map(d=>({key:d.key,opts:d.opts||{}}));partial=(o.partials||[]).map(p=>({key:p.key,missing:p.missing,...(p.opts?{opts:p.opts}:{})}));}
  else{direct=T.filter(t=>!t.partial).map(t=>({key:t.key,opts:noteOpts(t.note)}));partial=T.filter(t=>t.partial).map(t=>({key:t.key,missing:t.partial}));}
  for(const d of [...direct,...partial]){const r=resolve(d.key);if(!r)throw new Error(s.id+' dead key '+d.key);d.key=r;}
  specSnap[s.id]={direct:direct.map(sig),partial:partial.map(sig)};
  // tag fixes = diff against SKILL_WRM
  const why=o.why||{};
  for(const t of T){const k=resolve(t.key);const inD=direct.find(d=>d.key===k),inP=partial.find(p=>p.key===k);
    if(!k||(!inD&&!inP))out.tagFixes.push({key:t.key,step:s.id,action:'remove',why:why[t.key]||o.removeWhy||'items generated with every option do not teach this step'});
    // r10 (critic r9 N7): a partial whose clause changed is re-emitted too, so the merged SKILL_WRM clause equals this file's
    else if(inP&&!inD&&(!t.partial||t.partial!==inP.missing))out.tagFixes.push({key:k,step:s.id,action:'partial',...(inP.opts&&Object.keys(inP.opts).length?{opts:inP.opts}:{}),why:inP.missing,partial:inP.missing});}
  // r11 (critic r10 A3c): one tagFix shape that the R/Y1, Y4 and Y2/Y3 merge readers all read the same way:
  //  a new or changed PARTIAL tag is action 'partial' with a `partial` field (the clause); a new FULL tag is 'add' with no
  //  `partial`; a PARTIAL tag that becomes FULL is 'remove' then 'add' (R/Y1 reads 'add' on a partial tag as needing
  //  "drop the partial flag", Y4 reads it as an add on an existing tag: remove + add is the same merge for both)
  for(const d of direct)if(!T.find(t=>resolve(t.key)===d.key&&!t.partial)){
    for(const t of T.filter(t=>resolve(t.key)===d.key&&t.partial))out.tagFixes.push({key:t.key,step:s.id,action:'remove',why:'drop the partial tag: the skill teaches the step in full with these opts, re-added full by the next fix'});
    out.tagFixes.push({key:d.key,step:s.id,action:'add',...(d.opts&&Object.keys(d.opts).length?{opts:d.opts}:{}),why:why[d.key]||('teaches the step with opts '+JSON.stringify(d.opts))});}
  for(const p of partial)if(!direct.find(d=>d.key===p.key)&&!T.find(t=>resolve(t.key)===p.key))out.tagFixes.push({key:p.key,step:s.id,action:'partial',...(p.opts&&Object.keys(p.opts).length?{opts:p.opts}:{}),why:p.missing,partial:p.missing});
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
  // r10: a direct with {} takes the skill's DEFAULTS, so a link with other explicit opts is another rung (key + opts, as the critic's scans read it)
  const isDirect=(k,op)=>{if(!allDirect.has(k))return false;const js=JSON.stringify(op||{});if(js==='{}'||dOpts[k].includes(js))return true;return false;};
  // r9 (N4a): a PRE whose opts contain a direct's own parts / tables / denominators would deal the step itself
  const ARR=['parts','constant','denoms','forms']; // r10: forms too (length_metric {forms:[0,1,2]} holds the step's own form 1)
  // related: a link that contains the step's own parts / denominators / forms deals the step itself (mixed table facts stay)
  // r10: a related link whose parts / denoms / forms lie inside the direct's is the step's own content (length_metric form 0 on forms 0-2)
  const isDirectRel=(k,op)=>{if(isDirect(k,op))return true;if(!allDirect.has(k)||!op)return false;return [...direct,...partial].filter(d=>d.key===k).some(d=>['parts','denoms','forms'].some(a=>Array.isArray(d.opts?.[a])&&Array.isArray(op[a])&&(d.opts[a].every(v=>op[a].includes(v))||op[a].every(v=>d.opts[a].includes(v)))));};
  // r10 (critic r9 N6): for pre, a link with opts under a direct that takes every option ({}) is a lower rung, not the step itself
  const RS=o=>Array.isArray(o?.rows)?o.rows.map(r=>r.step):null; // count rows compare by their steps
  // o.selfPre: a PARTIAL skill whose dealt content is exactly an earlier step's (the number line to 100 on an estimating step)
  const isDirectPre=(k,op)=>{if(!allDirect.has(k))return false;if((o.selfPre||[]).includes(k)&&!direct.some(d=>d.key===k))return false;const js=JSON.stringify(op||{});if(js==='{}'||dOpts[k].includes(js))return true;if(!op)return false;
    if([...direct,...partial].some(d=>d.key===k&&effEq(k,d.opts,op)))return true; // r11: the same items as the step's own skill (key + EFFECTIVE opts) add no rung
    if([...direct,...partial].some(d=>d.key===k&&sameItems(k,d.opts,op)))return true; // r12 (critic r11 residual): opts outside the schema ({range:20}) that change nothing: the generated items equal the step's own
    return [...direct,...partial].filter(d=>d.key===k).some(d=>ARR.some(a=>Array.isArray(d.opts?.[a])&&Array.isArray(op[a])&&d.opts[a].every(v=>op[a].includes(v)))||(RS(d.opts)&&RS(op)&&RS(d.opts).every(v=>RS(op).includes(v))));};
  const pre=[],preBuild=[];const BB=bbStep(s,[...direct,...partial].map(d=>d.key));
  const cands=[];let ord=0;
  const dropPre=new Set((o.dropPre||[]).map(resolve));
  const oddOk=/odd|even/i.test(s.title);
  const okKey=(k,op)=>k&&!(OV.exclude||[]).includes(k)&&!isDirectPre(k,op)&&!dropPre.has(k)&&(oddOk||!ODDEVEN.includes(k));
  const cand=(k,why,tier,opts)=>{k=resolve(k);if(okKey(k,opts))cands.push({key:k,why,tier,ord:ord++,...(opts?{opts}:{})});};
  const addPB=pid=>{if(build.includes(pid)||preBuild.includes(pid)||preBuild.length>=3)return;preBuild.push(pid);usedProps.add(pid);};
  const candK=(p,tier)=>{if(p.keep){const k=resolve(p.key);if(k&&!dropPre.has(k))cands.push({key:k,why:p.why,tier,ord:ord++,...(p.opts?{opts:p.opts}:{}),keep:true,...(p.core?{core:true}:{})});}else{cand(p.key,p.why,tier,p.opts);if(p.core&&cands.length&&cands[cands.length-1].ord===ord-1&&cands[cands.length-1].key===resolve(p.key))cands[cands.length-1].core=true;}};
  for(const p of [...(o.pre||[]),...(OV.extraPre?.[s.id]||[])])candK(p,0);
  // r10 (critic r9 N6): automatic candidates carry the cited step's own opts, so a lower rung of a direct key (same key,
  // other opts) survives isDirectPre instead of being dropped as the step's own skill
  for(const p of o.core||[])candK({...p,core:true},1);
  // r12: o.addPre = extra candidates that are ranked by building block like the automatic ones (not pinned first)
  for(const p of o.addPre||[])candK(p,1);
  // r10 (critic r9 N6, rule 14): the lower rung of each of the step's own skills. The latest step taught before this one (this
  // year by school week, else the year before) that deals the same key with OTHER opts is a building block; isDirectPre still
  // drops a rung whose opts are the step's own or a superset of them.
  // r11 (critic r10 N8): the rung is the nearest BUILDING BLOCK, not the latest use of the key.
  //  - a table key (count_by_tables / mult_facts / div_facts): a rung whose every table divides one of the step's tables
  //    (10 for 100, 4 for 8; the largest such table, then the latest), this year first, then the 2s/5s/10s count from 0
  //    (Y2.B1.S15) for a count, then the year before; never a sibling table (5 for 100, {3, 5} for 10, 50 for 10);
  //    failing all of these, the 2s/5s/10s count from 0.
  //  - any other key: the latest earlier use with other opts, as before.
  //  The why says "as it was met then" only when the rung deals the same content in a smaller band or a subset of the
  //  step's forms / tables / values (rungSame); otherwise it says what the rung deals (rungDeals) and how it relates.
  if(!o.noRung)for(const d of [...direct,...partial]){const pool=order.filter(id=>id!==s.id&&(id.startsWith(YEAR+'.')?taughtBefore(id,s.id):id.startsWith(prevYear+'.'))&&allOf(id).includes(d.key));
    const so=x=>stepOptsFor(x,d.key)||{};let rungs=pool.filter(x=>JSON.stringify(so(x))!==JSON.stringify(d.opts||{})&&Object.keys(so(x)).length&&!isDirectPre(d.key,so(x)));
    const latest=(x,y)=>{const sx=x.startsWith(YEAR+'.')?1:0,sy=y.startsWith(YEAR+'.')?1:0;return sx-sy||(sx?((SWK[x]??0)-(SWK[y]??0)):0)||(order.indexOf(x)-order.indexOf(y));};
    const tabsD=TABLEKEYS.has(d.key)?tabsOf(d.opts):null;let r=null,fallback=false;
    if(tabsD&&tabsD.length){const divs=rungs.filter(x=>{const t=tabsOf(so(x));return t&&t.length&&t.every(v=>tabsD.some(w=>w%v===0&&v*20>w));});  // 10 for 100, 5 for 10, 4 for 8; never 5 for 100
      const pick=l=>l.sort((x,y)=>Math.max(...tabsOf(so(x)))-Math.max(...tabsOf(so(y)))||latest(x,y)).pop()||null;
      r=pick(divs.filter(x=>x.startsWith(YEAR+'.')))||pick(divs.filter(x=>!x.startsWith(YEAR+'.')));
      if(!r&&CBT_HOME!==s.id&&taughtBefore(CBT_HOME,s.id))fallback=true;
      if(fallback){const ns=tabsD;const tn=ns.map(n=>n+'s').join(' and ');
        const w=`counting in 2s, 5s and 10s from 0: `+(d.key==='division:div_facts'?`the multiples used when this step divides${ns.every(n=>[2,5,10].includes(n))?' ('+tn+')':' are counted the same way, in '+tn}`:ns.every(n=>[2,5,10].includes(n))?`the count this step writes as a table (${tn})`:`the same count from 0 that this step makes in ${tn}`)+` — ${CBT_HOME} Count in 2s, 5s and 10s (${CBT_HOME.startsWith(YEAR+'.')?'W'+SWK[CBT_HOME]:'Grade '+({Y1:'K',Y2:'1',Y3:'2'}[prevYear]??prevYear)})`;
        if(!dropPre.has('multiplication:count_by_tables')&&!cands.some(c=>c.key==='multiplication:count_by_tables'))cands.push({key:'multiplication:count_by_tables',why:w,tier:1,ord:ord++,opts:CBT_ROWS,keep:true});
        continue;}}
    else{rungs.sort(latest);r=rungs.pop()||null;if(r&&!directAt(r,d.key)){const same=[...rungs].reverse().find(x=>JSON.stringify(so(x))===JSON.stringify(so(r))&&directAt(x,d.key));if(same)r=same;}}
    if(!r)continue;const same=r.startsWith(YEAR+'.');const ro=so(r);const when=same?'taught earlier, W'+SWK[r]:'Grade '+({Y1:'K',Y2:'1',Y3:'2'}[prevYear]??prevYear);
    let rel;if(rungSame(d.key,ro,d.opts))rel="this step's skill as it was met then"+(rungDeals(d.key,ro,d.opts)?' ('+rungDeals(d.key,ro,d.opts)+')':'');
    else if(tabsD){const t=tabsOf(ro);const big=tabsD.filter(w=>t.every(v=>w%v===0));rel=`${rungDeals(d.key,ro,d.opts)}: every multiple of ${big.join(' and ')} is a multiple of ${t.join(' and ')}`;}
    else rel=`${rungDeals(d.key,ro,d.opts)||'the same skill with other options'}: ${RUNGREL[d.key]||'a neighbouring rung of this step\'s skill, not the step itself'}`;
    cand(d.key,`${rel} — ${r} ${stepById[r].title} (${when})`,1,ro);}
  // rule 14: a related key that is the skill of an EARLIER step of this year is a building block -> pre
  // r8 (A4): relOnly with its own related list (even []) replaces extraRelated and relR3
  const handRelAll=o.relOnly&&o.related?[...o.related]:[...(o.related||[]),...(OV.extraRelated?.[s.id]||[]),...(OV.relR3?.[s.id]||[])];
  for(const r of handRelAll){const k=resolve(r.key);const e0=earlierStep(k,s.id,true);// r9: with opts, promote only when an earlier-taught step owns these opts (or a superset of them); a later step's own
    // opts (mult_facts {constant:[2]} from Y2.B5.S9) stay related even when an earlier step uses the key with other opts
    const bo=r.opts&&Object.keys(r.opts).length?bestOwner(k,s.id,r.opts):null;const boOk=bo&&(()=>{const set=x=>(x?.rows||[]).map(z=>z.step).concat(x?.constant||[],x?.parts||[]);const so=stepOptsFor(bo,k)||{};const ws=set(r.opts);return JSON.stringify(so)===JSON.stringify(r.opts)||(ws.length&&ws.every(v=>set(so).includes(v)));})();
    const e=e0?(r.opts&&Object.keys(r.opts).length?(boOk?bo:null):e0):null;if(e)cand(k,`${r.why} (earlier step this builds on: ${e} ${stepById[e].title})`,2,r.opts);}
  // r5: "the step before" is the latest step on the same topic TAUGHT before this one (school week), not the WRM neighbour
  const prev=yr.blocks.flatMap(bb=>bb.steps).filter(st=>st.id!==s.id&&topic(st)===topic(s)&&taughtBefore(st.id,s.id)).sort((a,c)=>((SWK[a.id]??999)-(SWK[c.id]??999))||(order.indexOf(a.id)-order.indexOf(c.id))).pop();
  if(!o.preOnly){
   const wk=lessonWeek[s.id];const ps=wk?priorSteps(wk):[];
   const kept=ps.filter(x=>stepById[x.id]&&feeds(s,stepById[x.id])&&order.indexOf(x.id)<order.indexOf(s.id)&&taughtBefore(x.id,s.id))
     .map(x=>({...x,same:topic(stepById[x.id])===topic(s)?0:1,dist:order.indexOf(s.id)-order.indexOf(x.id)})).sort((a,b)=>a.same-b.same||a.dist-b.dist);
   if(prev&&topic(prev)===topic(s))for(const k of allOf(prev.id).slice(0,2))cand(k,`${prev.id} ${prev.title} (taught before this step${prev.block===s.block?' in the block':''})`,1,stepOptsFor(prev.id,k)||undefined);
   for(const x of kept){const st=stepById[x.id];const ks=allOf(x.id);
     if(!ks.length){if(topic(st)===topic(s))for(const pid of propsOf[x.id]||[])addPB(pid);continue;}
     for(const k of ks.slice(0,2))cand(k,`${x.id} ${st.title} (prior learning wk ${wk})`,x.same?5:3,stepOptsFor(x.id,k)||undefined);}
   // r8 (A1, rule 19): every block step TAUGHT EARLIER (school week), nearest week first, whatever its WRM position
   {let n=0;for(const st of b.steps.filter(x=>x.id!==s.id&&x.id!==prev?.id&&topic(x)===topic(s)&&taughtBefore(x.id,s.id)).sort((a,c)=>((SWK[c.id]??0)-(SWK[a.id]??0))||(order.indexOf(c.id)-order.indexOf(a.id)))){if(n>=3)break;const ks=allOf(st.id);if(ks.length)n++;for(const k of ks.slice(0,1))cand(k,`${st.id} ${st.title} (taught earlier, W${SWK[st.id]})`,4,stepOptsFor(st.id,k)||undefined);}}
  }
  const rk=c=>c.tier===0?[-2,0]:c.core?[-1,0]:bbRank(BB,c.key);
  const take=()=>{pre.length=0;const seen=new Set();for(const c of [...cands].sort((a,b)=>{const x=rk(a),y=rk(b);return x[0]-y[0]||x[1]-y[1]||a.tier-b.tier||a.ord-b.ord;})){const sk=c.keep?c.key+'|'+JSON.stringify(c.opts||{}):c.key;if(seen.has(sk)||(!c.keep&&seen.has(c.key))||pre.length>=14)continue;seen.add(sk);seen.add(c.key);pre.push({key:c.key,why:c.why,...(c.opts?{opts:c.opts}:{}),...(c.keep?{keep:true}:{}),...(c.tier===0||c.core?{hand:c.tier===0?2:1}:{})});}};
  take();
  if(pre.length<3&&prevYear&&!o.preOnly){const py=W.years.find(y=>y.id===prevYear);const cand6=py.blocks.flatMap(bb=>bb.steps).filter(st=>topic(st)===topic(s)).reverse();
    let n=0;for(const st of cand6){if(n>=2)break;const ks=allOf(st.id);if(!ks.length)continue;const k0=resolve(ks[0]);if(!okKey(k0,stepOptsFor(st.id,k0))||cands.find(c=>c.key===k0))continue;cand(k0,`${st.id} ${st.title} (${prevYear}, same topic)`,6,stepOptsFor(st.id,k0)||undefined);n++;}
    take();}
  if(pre.length<3){for(const l of (OV.ladders?.[topic(s)]||[])){const k=resolve(l.key);if(cands.find(c=>c.key===k))continue;cand(k,l.why+' (topic ladder)',7,l.opts);take();if(pre.length>=3)break;}}
  for(const pid of o.preBuild||[])addPB(pid);
  if(pre.length<3&&!o.thinPreNote)console.error('THINPRE',s.id,s.title,pre.length);
  // ---- related (rule 5 / 14): the same idea in another form, the inverse, the NEXT step. Never an earlier step of
  // the block (that is pre), never a pre key. ----
  const related=[];
  const relOk=(k,op)=>k&&!(OV.exclude||[]).includes(k)&&!isDirect(k,op)&&!related.find(p=>p.key===k)&&!pre.find(p=>p.key===k&&!disjointOpts(linkOpts({...p}),op))&&!b.steps.some(st=>st.id!==s.id&&taughtBefore(st.id,s.id)&&allOf(st.id).includes(k)&&(!op||!Object.keys(op).length||JSON.stringify(stepOptsFor(st.id,k)||{})===JSON.stringify(op)))&&related.length<6;
  const addRel=(k,why,opts)=>{k=resolve(k);if(relOk(k,opts))related.push({key:k,why,...(opts?{opts}:{})});};
  for(const r of handRelAll)addRel(r.key,r.why,r.opts);
  if(!o.relOnly){
   // r8 (A1, rule 19): the next steps in SCHOOL-WEEK order (taught after this one), never a step taught earlier
   {const byWk=(a,c)=>((SWK[a.id]??999)-(SWK[c.id]??999))||(order.indexOf(a.id)-order.indexOf(c.id));
    const later=[...b.steps.filter(x=>x.id!==s.id&&topic(x)===topic(s)&&!taughtBefore(x.id,s.id)).sort(byWk),...yr.blocks.flatMap(bb=>bb.steps).filter(x=>x.block!==b&&topic(x)===topic(s)&&!taughtBefore(x.id,s.id)).sort(byWk)];
    let dn=0;for(const nx of later){if(related.length>=2)break;const n0=related.length;for(const k of allOf(nx.id).slice(0,2))addRel(k,`${nx.id} ${nx.title} (${dn===0?'next step':'a later step'}, W${SWK[nx.id]}: the same idea one step further)`,stepOptsFor(nx.id,k)||undefined);if(related.length>n0)dn++;}}
   // last resort: a skill tagged to the step's OWN standard code that no earlier step uses (the same idea in another form)
   if(false)for(const c of s.ccss){for(const k of byStd[c]||[]){if(related.length>=2)break;if(SAMESTD_SKIP.test(k))continue;addRel(k,`also teaches ${c} (this step's standard): ${label[k]}`);}}
  }
  if(!related.length&&!o.relNote)console.error('NOREL',s.id,s.title);
  for(const e of [...pre,...related]){e.opts=linkOpts(e);e.o0=e.key+'|'+JSON.stringify(e.opts||{});e.why0=e.why;e.rules=[];}
  // r12 OPTGATE (the root-cause guard, Y5 critic r7 class N): from here on a link's key / opts change ONLY through a named
  // spec rule: linkFix (per step), linkSwap (year-wide), markerFix (only when OV.markerFixOk lists that exact change for the
  // step, written by hand after the why was re-read on items), count0 (a count from 0 named by its why). Anything else is a
  // build error at the end of the step.
  const setRule=(e,r,from)=>{e.o0=from?.o0??e.o0;e.why0=from?.why0??e.why0;e.rules=[...(from?.rules||e.rules||[]),r];return e;};
  const yo=OV.linkOpts?.[YEAR]||{};
  for(const list of [pre,related])for(let j=list.length-1;j>=0;j--)if(yo[list[j].key]===null&&!Object.keys(list[j].opts||{}).length)list.splice(j,1);
  const lf=OV.linkFix?.[s.id]||{};
  for(const list of [pre,related])for(let j=list.length-1;j>=0;j--){const f=lf[list[j].key];if(f===null)list.splice(j,1);else if(f){list[j].opts=f;setRule(list[j],'linkFix');}}
  // r4 (critic r3 S9, rule 18 content): year-wide link swaps. {to:null} drops the link (and may name a preBuild that
  // stands in for it); {to:key, opts} replaces it. `only` limits a swap to matching step ids. Rule 12 (keep an earlier
  // partial as pre) yields to rule 18 when that partial deals content above the pupil.
  const SW=OV.linkSwap?.[YEAR]||{};
  for(const list of [pre,related])for(let j=list.length-1;j>=0;j--){const e=list[j];const sw=SW[e.key];if(!sw||(sw.only&&!sw.only.test(s.id))||(sw.not&&sw.not.test(s.id)))continue;
    if(sw.preBuild&&list===pre&&!build.includes(sw.preBuild)&&!preBuild.includes(sw.preBuild)){preBuild.push(sw.preBuild);usedProps.add(sw.preBuild);}
    if(!sw.to){list.splice(j,1);continue;}
    list[j]=setRule({key:sw.to,why:sw.to===e.key?e.why:descWhy(sw.to,sw.opts||{},s.id,''),opts:sw.opts||{},swapped:true,...(e.hand?{hand:e.hand}:{})},'linkSwap',e);}
  for(const list of [pre,related]){const seen=new Set();const preKO=new Set(pre.map(x=>x.key+'|'+JSON.stringify(x.opts||{})));const preK=new Set(pre.map(x=>x.key));for(let j=0;j<list.length;j++){const k=list[j].key;const ko=k+'|'+JSON.stringify(list[j].opts||{});
    // r9: a related link repeats a pre only when its opts are the same (or it has none): mult_facts {2} next to pre mult_facts {5,10} is a new table
    const dupPre=list===related&&preK.has(k)&&!pre.filter(p=>p.key===k).every(p=>disjointOpts(p.opts,list[j].opts));if(list[j].keep?seen.has(ko):((list===pre?isDirectPre:isDirectRel)(k,list[j].opts)||seen.has(k)||dupPre)){list.splice(j,1);j--;}else{seen.add(k);seen.add(ko);}}}
  if(pre.length<3)for(const l of (OV.ladders?.[topic(s)]||[])){const k=resolve(l.key);if(pre.length>=3)break;if(isDirectPre(k,l.opts)||pre.find(x=>x.key===k)||(SW[k]&&!SW[k].to&&(!SW[k].only||SW[k].only.test(s.id))))continue;const rr=related.findIndex(x=>x.key===k);if(rr>=0)related.splice(rr,1);{const le={key:k,why:l.why+' (topic ladder)',opts:l.opts||OV.linkOpts?.[YEAR]?.[k]||{},rules:[]};le.o0=le.key+'|'+JSON.stringify(le.opts);pre.push(le);}}
  // r5 (rules 18-19): every link must be content met by this step's SCHOOL week. A pre that cites a step of this year
  // taught later is dropped; a link whose generated items carry a content marker first met later (scan TOL 2 weeks) tries
  // OV.markerFix alternatives (other opts / another skill) and is otherwise dropped. Then the topic ladder refills pre.
  const citesLater=e=>{const all=[...String(e.why).matchAll(/(R|Y\d)\.B\d+\.S\d+/g)].map(m=>m[0]);if(all.some(x=>!x.startsWith(YEAR+'.')))return false; // also earlier-grade learning
    const c=all.filter(x=>x.startsWith(YEAR+'.'));
    if(c.length)return c.some(x=>!taughtBefore(x,s.id))&&!c.some(x=>taughtBefore(x,s.id));
    return (keyFirstWk[e.key]??0)>(SWK[s.id]??999)+1&&!/Y\d\.|R\./.test(e.why);};
  const fixLink=(e)=>{if(!markerHits(e.key,e.opts,s.id).length)return e;
    for(const alt of OV.markerFix?.[YEAR]?.[e.key]||[]){const ne=setRule({key:alt.key||e.key,why:descWhy(alt.key||e.key,alt.opts||{},s.id,(alt.key&&alt.key!==e.key)?'':e.why),opts:alt.opts||{}},'markerFix',e);
      if(!isDirect(ne.key,ne.opts)&&!markerHits(ne.key,ne.opts,s.id).length)return ne;}
    return null;};
  const dropped=[];const coreKeys=new Set((o.core||[]).map(c=>resolve(c.key)));
  for(const list of [pre,related])for(let j=list.length-1;j>=0;j--){const e=list[j];if(list===pre&&citesLater(e)){dropped.push(e.key+' (taught later)');if(coreKeys.has(e.key)){console.error('COREDROP',s.id,e.key,'taught later');process.exitCode=1;}list.splice(j,1);continue;}
    const ne=fixLink(e);if(ne&&ne!==e&&e.hand)ne.hand=e.hand;if(!ne){if(list===pre&&coreKeys.has(e.key)){console.error('COREDROP',s.id,e.key,markerHits(e.key,e.opts,s.id).map(h=>h.m).join(','));process.exitCode=1;}dropped.push(e.key+' ('+markerHits(e.key,e.opts,s.id).map(h=>h.m).join(',')+')');list.splice(j,1);}else list[j]=ne;}
  for(const list of [pre,related]){const seen=new Set();const preKO=new Set(pre.map(x=>x.key+'|'+JSON.stringify(x.opts||{})));const preK=new Set(pre.map(x=>x.key));for(let j=0;j<list.length;j++){const k=list[j].key;const ko=k+'|'+JSON.stringify(list[j].opts||{});
    // r9: a related link repeats a pre only when its opts are the same (or it has none): mult_facts {2} next to pre mult_facts {5,10} is a new table
    const dupPre=list===related&&preK.has(k)&&!pre.filter(p=>p.key===k).every(p=>disjointOpts(p.opts,list[j].opts));if(list[j].keep?seen.has(ko):((list===pre?isDirectPre:isDirectRel)(k,list[j].opts)||seen.has(k)||dupPre)){list.splice(j,1);j--;}else{seen.add(k);seen.add(ko);}}}
  if(pre.length<3)for(const l of (OV.ladders?.[topic(s)]||[])){const k=resolve(l.key);if(pre.length>=3)break;if(isDirectPre(k,l.opts)||pre.find(x=>x.key===k))continue;
    const e={key:k,why:l.why+' (topic ladder)',opts:l.opts||OV.linkOpts?.[YEAR]?.[k]||{},rules:[]};e.o0=e.key+'|'+JSON.stringify(e.opts);if(citesLater(e))continue;const ne=fixLink(e);if(!ne)continue;const rr=related.findIndex(x=>x.key===ne.key);if(rr>=0)related.splice(rr,1);pre.push(ne);}
  // a kept pre whose why also names a same-year step taught LATER (the content is earlier-grade learning): drop that name
  for(const e of pre){for(const x of [...String(e.why).matchAll(/Y\d\.B\d+\.S\d+/g)].map(m=>m[0]))if(x.startsWith(YEAR+'.')&&!taughtBefore(x,s.id)){const q=x.replace(/\./g,'\\.');e.why=e.why.replace(new RegExp('\\s*/\\s*'+q),'').replace(new RegExp(q+'\\s*/\\s*'),'');}}
  // r10 (critic r9 N5a): seq_2/5/10 count on from ANY number ("16, 26, 36"); a link that cites a count from 0 ("Count in 10s",
  // "Tens to 100", the count steps Y1.B9.S1-S3 / Y1.B12.S2 / Y2.B1.S15) is the true count, count_by_tables from zero.
  // Rows of several such links in one list merge into one count_by_tables link.
  for(const list of [pre,related])for(let j=0;j<list.length;j++){const e=list[j];const m=/^patterns:(?:seq_(2|5|10)|skip_count_line)$/.exec(e.key);if(!m||!COUNTCITE.test(e.why)||/from any number|counting on/i.test(e.why))continue;
    // skip_count_line also jumps on from any number: it becomes the count from 0 its why names
    const N=m[1]?+m[1]:countNs(e.why)[0];if(!N)continue;const row={step:N,start:'zero',dir:'up'};if(list===pre&&isDirectPre('multiplication:count_by_tables',{rows:[row]})){list.splice(j,1);j--;continue;}
    // a row always holds 12 numbers (0 ... 110 in 10s): above 100 before Grade 1 counts past 100 (Y2.B1.S15, W4), so it is dropped there
    if(YEAR==='Y2'&&N*11>100&&(SWK[s.id]??999)<(SWK['Y2.B1.S15']??0)){list.splice(j,1);j--;continue;}const ex=list.find((x,i)=>i!==j&&x.key==='multiplication:count_by_tables');
    if(ex){const rows=[...(ex.opts?.rows||[])];if(!rows.some(r=>r.step===row.step)){rows.push(row);rows.sort((x,y)=>x.step-y.step);if(!(list===pre&&isDirectPre(ex.key,{...(ex.opts||{}),rows}))){ex.opts={...(ex.opts||{}),rows};setRule(ex,'count0');const ns=rows.map(r=>r.step);const ci=[...new Set([...String(ex.why).matchAll(/(R|Y\d)\.B\d+\.S\d+/g),...String(e.why).matchAll(/(R|Y\d)\.B\d+\.S\d+/g)].map(x=>x[0]))];
      ex.why=`counting in ${ns.slice(0,-1).join(', ')}${ns.length>1?' and ':''}${ns[ns.length-1]}s from 0${ci.length?' ('+ci.join(', ')+')':''}`;}}list.splice(j,1);j--;continue;}
    {const own=order.find(id=>id.startsWith(YEAR+'.')&&id!==s.id&&taughtBefore(id,s.id)&&allOf(id).includes('multiplication:count_by_tables')&&(stepOptsFor(id,'multiplication:count_by_tables')?.rows||[]).some(r=>r.step===N&&r.start==='zero'));
     const ci=[...new Set([...[...String(e.why).matchAll(/(R|Y\d)\.B\d+\.S\d+/g)].map(x=>x[0]),...(own?[own]:[])])];const tail=String(e.why).replace(/\([^)]*\)/g,'').split(':').slice(1).join(':').trim().replace(/\b(the )?tens on the line\b/,'the tens marked on the line');
     list[j]=setRule({...(e.hand?{hand:e.hand}:{}),key:'multiplication:count_by_tables',opts:{rows:[row]},why:`${ci.length?ci.join(' / ')+' ':''}counting in ${N}s from 0${tail?': '+tail:''}`},'count0',e);}}
  {const pk=new Set(pre.map(x=>x.key));for(let j=related.length-1;j>=0;j--)if(related[j].key==='multiplication:count_by_tables'&&pk.has(related[j].key)&&!pre.filter(x=>x.key===related[j].key).every(x=>disjointOpts(x.opts,related[j].opts)))related.splice(j,1);}
  for(const e of [...pre,...related]){if(e.swapped&&e.why.includes('[rule'))e.why=descWhy(e.key,e.opts,s.id,e.why);delete e.swapped;
    e.why=String(e.why).replace(/\s*\[rule \d+[^\]]*\]/g,'');
    // r7: a cited step whose own opts for this key differ from the link's: cite the step that uses these opts instead
    if(e.opts&&Object.keys(e.opts).length&&!/\((next step|a later step|taught earlier|taught later|the same week)/.test(e.why))for(const c of [...String(e.why).matchAll(/Y\d\.B\d+\.S\d+/g)].map(m=>m[0])){const so=stepOptsFor(c,e.key);if(JSON.stringify(so||{})!==JSON.stringify(e.opts)){const t=taughtAt(e.key,s.id,e.opts);if(t&&t!==c&&JSON.stringify(stepOptsFor(t,e.key))===JSON.stringify(e.opts))e.why=e.why.replace(c,t).replace(stepById[c].title,stepById[t].title);}}
    e.why=e.why.replace(/\b((?:R|Y\d)\.B\d+\.S\d+)\s*\/\s*\1\b/g,'$1');
    if(whyMismatch(e))e.why=descWhy(e.key,e.opts,s.id,e.why);
    // r10 (critic r9 N5b): share_into_groups deals GROUPING only ("Make groups of M. How many groups?"): never cite a sharing step
    if(e.key==='division:share_into_groups'&&/shar/i.test(e.why))e.why=(YEAR==='Y2'?'Y1.B9.S8':'Y2.B5.S7')+' making equal groups (grouping): ring the counters in groups of a size';
    if(COUNTKEY.test(e.key)&&COUNTCITE.test(e.why)&&!/from any number|counting on/i.test(e.why)){const ns=countNs(e.why);const fr=countMultFrac(e,ns);if(fr<0.9){console.error('COUNTCHECK',s.id,e.key,JSON.stringify(e.opts),'counts',ns.join('/'),'multiples',fr.toFixed(2),'|',e.why.slice(0,80));process.exitCode=1;}}
    if(whyContentBad(e).length)console.error('WHYBAD',s.id,e.key,JSON.stringify(e.opts),whyContentBad(e).join(','),'|',e.why.slice(0,80));}
  // r12 (critic r11 N10): a link whose generated items are partly wrong (a generator bug) never stands as if sound. OV.brokenLinks
  // [{key, opts, swap:{when, key, opts, why}, why:{stepId: text}, note}]: on a step `when` matches, the link is swapped for a
  // sound skill (and that skill leaves related); on any other step its why says what is broken (`why` per step, else + note)
  for(const bl of OV.brokenLinks||[])for(let j=0;j<pre.length;j++){const e=pre[j];if(e.key!==bl.key||JSON.stringify(e.opts||{})!==JSON.stringify(bl.opts))continue;
    if(bl.swap&&bl.swap.when.test(s.id)){const sw=bl.swap;if(pre.some(x=>x.key===sw.key&&JSON.stringify(x.opts||{})===JSON.stringify(sw.opts))){pre.splice(j,1);j--;continue;}
      pre[j]=setRule({key:sw.key,opts:sw.opts,why:sw.why,...(e.hand?{hand:e.hand}:{})},'brokenLink',e);for(let r=related.length-1;r>=0;r--)if(related[r].key===sw.key)related.splice(r,1);continue;}
    if(bl.why?.[s.id])e.why=bl.why[s.id];else if(!e.why.includes(bl.note))e.why+=bl.note;}
  // r12: OV.whyFix[stepId][key] = the why of that pre link, written for this step (applied last, after every rewrite)
  for(const e of pre){const w=OV.whyFix?.[s.id]?.[e.key];if(w)e.why=w;}
  for(const e of related){const w=OV.relWhyFix?.[s.id]?.[e.key];if(w)e.why=w;}
  denomNotePass([pre,related]);
  titleClaimPass(s.id,[['pre',pre],['related',related]]);
  {const srt=bbSort(BB,pre);pre.splice(0,pre.length,...srt);}
  // r12 BBCHECK (the building-block sweep, a build gate): the lead pre is a building block of the step (never a word problem
  // on a non-problem step; on an addition / subtraction or multiplication / division step never the inverse, a fact family
  // or the other operation's facts), and no word problem stands before a non-word-problem pre
  {const rs=pre.slice(0,8).map(e=>bbRank(BB,e.key));const isWp=e=>bbKey(e.key)?.kind==='wp';const bad=[];
    if(pre.length&&isWp(pre[0])&&!BB.wp)bad.push('lead is a word problem');
    if(pre.length&&['as','md'].includes(BB.area)&&!BB.neutral&&rs[0][0]>=3)bad.push('lead class '+rs[0][0]+' (inverse / fact family / other operation)');
    if(!BB.wp){const fw=pre.slice(0,8).findIndex(isWp);if(fw>=0&&pre.slice(fw+1,8).some(e=>!isWp(e)))bad.push('a word problem before a building block');}
    bbStats.n++;bbStats.cls[pre.length?(pre[0].hand?'hand':rs[0][0]):'none']=(bbStats.cls[pre.length?(pre[0].hand?'hand':rs[0][0]):'none']||0)+1;
    if(bad.length){console.error('BBCHECK',s.id,s.title,'|',bad.join('; '),'|',pre.slice(0,3).map(e=>e.key).join(', '));process.exitCode=1;bbStats.bad++;}}
  pre.splice(8);related.splice(6);
  // r12 OPTGATE: every link's final key + opts is its spec value, or the change is a named spec rule (markerFix only when approved)
  for(const [role,list] of [['pre',pre],['related',related]])for(const e of list){const now=e.key+'|'+JSON.stringify(e.opts||{});
    if(!e.o0){console.error('OPTGATE',s.id,role,now,'link has no spec origin');process.exitCode=1;optStats.bad++;continue;}
    optStats.n++;if(now===e.o0){optStats.spec++;continue;}
    const rs=e.rules||[];if(!rs.length){console.error('OPTGATE',s.id,role,e.o0,'->',now,'changed by no named rule');process.exitCode=1;optStats.bad++;continue;}
    if(rs.includes('markerFix')){const sig=`${s.id}|${e.o0}->${now}`;if(!(OV.markerFixOk||[]).includes(sig)){console.error('OPTGATE',s.id,role,'markerFix not approved:',sig,'\n     spec why:',e.why0,'\n     now why :',e.why);process.exitCode=1;optStats.bad++;continue;}}
    for(const r of new Set(rs))optStats.rule[r]=(optStats.rule[r]||0)+1;}
  // r13 SPECOPTS snapshot (critic r12 M1): the key + opts each link has when OPTGATE passes it; the written file must equal it
  specSnap[s.id].pre=pre.map(sig);specSnap[s.id].related=related.map(sig);
  for(const e of [...pre,...related]){delete e.keep;delete e.hand;delete e.o0;delete e.rules;delete e.why0;}
  // r6: never-in-grade content on the step's own skills must be named (critic r5: B4.S8 class)
  for(const d of [...direct,...partial])for(const h of markerHits(d.key,d.opts,s.id).filter(h=>MK.NEVERDIRECT[YEAR].includes(h.m)))
    if(!(o.neverNamed||[]).includes(d.key))console.error('NEVERDIRECT',s.id,verdict,d.key,JSON.stringify(d.opts||{}),h.m,h.ex);
  if(process.argv.includes('--dropped')&&dropped.length)console.error('DROPPED',s.id,dropped.join('; '));
  // r9 (N1): an empty related list gets a note computed for THIS step: every later-taught block step and why its skills
  // are not linked (already linked here; content first taught later, rule 19; a gap step). A later step whose skill is
  // free to link would have been linked above, so the build reports one as an error (the notecheck rule).
  let relNoteAuto='';
  // an earlier-taught step of this year that deals key k with these same opts
  const esOpts=(k,op)=>order.find(id=>id.startsWith(YEAR+'.')&&id!==s.id&&taughtBefore(id,s.id)&&allOf(id).includes(k)&&JSON.stringify(stepOptsFor(id,k)||{})===JSON.stringify(op||{}))||null;
  if(!related.length){const have=new Set([...pre,...direct,...partial].map(e=>e.key+JSON.stringify(e.opts||{})));const haveK=new Set([...pre,...direct,...partial].map(e=>e.key));
    const later=b.steps.filter(x=>x.id!==s.id&&!taughtBefore(x.id,s.id)).sort((a,c)=>((SWK[a.id]??999)-(SWK[c.id]??999)));const why=[];
    for(const st of later){const sk=[...(OV.steps[st.id]?.direct||[]),...(OV.steps[st.id]?.partials||[]),...(OV.r3?.[st.id]?.direct||[]),...(OV.r3?.[st.id]?.partials||[])];
      const keys=allOf(st.id);if(!keys.length){why.push(`${st.id} ${st.title} (W${SWK[st.id]}) has no skill yet`);continue;}
      const reasons=[];for(const k of keys){const op=stepOptsFor(st.id,k)||{};const hits=markerHits(k,op,s.id);
        const swp=SW[k]&&(!SW[k].only||SW[k].only.test(s.id))&&(!SW[k].not||!SW[k].not.test(s.id))&&SW[k].to!==k?SW[k]:null;
        // r10 (critic r9 A5): already linked by key AND opts (mass_volume_liquid forms 1 linked does not cover the later forms 0)
        if(have.has(k+JSON.stringify(op))||(haveK.has(k)&&!Object.keys(op).length))reasons.push(`${k.split(':')[1]} is already linked here`);
        else if(hits.length)reasons.push(`${k.split(':')[1]} deals ${hits[0].m} content first taught ${hits[0].mw===999?'in a later grade':'W'+hits[0].mw} (rule 19)`);
        else if(swp)reasons.push(`${k.split(':')[1]} deals content above this grade (rule 18), so it is not linked`);
        else if(esOpts(k,op))reasons.push(`${k.split(':')[1]} is already taught in ${esOpts(k,op)} (W${SWK[esOpts(k,op)]}), before this step: earlier learning, not a next step`);
        else if(topic(st)!==topic(s))reasons.push(`${k.split(':')[1]} is another topic`);
        else{reasons.push(`${k.split(':')[1]} is FREE`);console.error('NOTECHECK',s.id,'later',st.id,k,'could be related');}}
      if(reasons.every(r=>/already linked here/.test(r)))continue; // nothing to explain
      why.push(`${st.id} (W${SWK[st.id]}): ${[...new Set(reasons)].join('; ')}`);if(why.length>=4)break;}
    relNoteAuto='no related skill: '+(why.length?'the later-taught steps of the block are '+why.join(' | '):(later.length?'every later-taught step of the block uses skills already linked here':'no step of the block is taught after this one'));}
  if(!related.length&&!o.relNote&&!relNoteAuto)console.error('NOREL(after linkFix)',s.id,s.title);
  if(pre.length<3)console.error('THINPRE(after linkFix)',s.id,s.title,pre.length);
  for(const id of build)usedProps.add(id);
  out.steps[s.id]={title:s.title,direct,partial,verdict,missing,build,pre,preBuild,related,note:[o.note||(lessonWeek[s.id]?'':'not in the school sequence xlsx; pre-skills from the block and the previous year'),!related.length?(o.relNote||relNoteAuto):''].filter(Boolean).join('. ')};
 });
}

// ======================= r12: SITE LESSONS (owner rule 2026-10-16: every site lesson tagged; the Y5 lane's shape) =======================
// lessons.mjs is the spec (hand verdicts judged from generated items); this pass writes the section and CHECKS every link as a
// step's: the cited step owns the key and is taught before the lesson (same year: by school week; a Support lesson: only steps
// of its SOURCE year or below), content markers at the lesson's week (a Support lesson at week 0 of this grade, an above-grade
// core title with no week at W38), no pre repeating the lesson's own direct / partial, no duplicate, >= 3 pre or a note that
// says why few, the cited-title claim (TITLECLAIM). Lessons tag nothing into SKILL_WRM: no tagFixes.
const LS=await import(HERE+'lessons.mjs');
const SITE=JSON.parse(fs.readFileSync(root+'data/curriculum/site-lessons.json','utf8'));
const wkNum=w=>w?+String(w).replace(/\D/g,''):null;
const myLessons=SITE.lessons.filter(l=>l.wrmYear===YEAR).sort((a,b)=>(wkNum(a.firstWeek)??99)-(wkNum(b.firstWeek)??99)||(a.id<b.id?-1:a.id>b.id?1:0));
const YR={R:0,Y1:1,Y2:2,Y3:3,Y4:4,Y5:5,Y6:6};const SRC={GPK:'R',GK:'Y1',G1:'Y2',G2:'Y3',G3:'Y4',G4:'Y5',G5:'Y6'};
const gradeName=y=>({R:'Reception',Y1:'Grade K',Y2:'Grade 1',Y3:'Grade 2',Y4:'Grade 3'})[y]||y;
const lessonStats={n:0,full:0,partial:0,gap:0,links:0,bad:0};const LERR=(...a)=>{console.error('LESSON',...a);process.exitCode=1;lessonStats.bad++;};
out.lessons={};
for(const l of myLessons){const sp=LS.lessons[l.id];lessonStats.n++;
  if(!sp){LERR(l.id,'no spec in lessons.mjs');continue;}
  const src=(String(l.note||'').match(/^Source: (G\w+)\./)||[])[1];const srcY=src?SRC[src]:null;const support=l.flag==='enrich-native';
  const week=l.firstWeek?wkNum(l.firstWeek):support?0:38;SWK[l.id]=week;
  const direct=(sp.direct||[]).map(([k,o])=>({key:resolve(k)||(LERR(l.id,'dead key',k),k),opts:o||{}}));
  const partial=(sp.partial||[]).map(([k,o,m])=>({key:resolve(k)||(LERR(l.id,'dead key',k),k),...(o&&Object.keys(o).length?{opts:o}:{}),missing:m}));
  const build=[...(sp.build||[])];const verdict=direct.length&&!build.length?'full':(direct.length||partial.length)?'partial':'gap';
  if(sp.verdict!==verdict)LERR(l.id,'verdict',sp.verdict,'but the skills say',verdict);
  if(verdict!=='full'&&!build.length)LERR(l.id,'not full and no build');if(verdict==='full'&&sp.missing)LERR(l.id,'full with a missing clause');
  const own=new Set([...direct,...partial].map(d=>d.key+'|'+JSON.stringify(d.opts||{})));
  specSnap[l.id]={direct:(sp.direct||[]).map(([k,o])=>sig({key:resolve(k)||k,opts:o})),partial:(sp.partial||[]).map(([k,o])=>sig({key:resolve(k)||k,opts:o&&Object.keys(o).length?o:{}})),
    pre:(sp.pre||[]).filter(([k0,,c])=>resolve(k0)&&stepById[c]).map(([k,o])=>sig({key:resolve(k),opts:o})),related:(sp.related||[]).map(([k,o])=>sig({key:resolve(k)||k,opts:o}))};
  const pre=[];for(const [k0,o,cite,reason] of sp.pre||[]){const k=resolve(k0);if(!k){LERR(l.id,'dead pre key',k0);continue;}
    const st=stepById[cite];if(!st){LERR(l.id,'pre cites an unknown step',cite);continue;}
    if(!allOf(cite).includes(k))LERR(l.id,'pre',k,'cites',cite,'which does not tag that skill');
    const cy=cite.split('.')[0];let rel;
    if(cy===YEAR&&!support){if(!((SWK[cite]??999)<=week))LERR(l.id,'pre',k,'cites',cite,'taught W'+SWK[cite]+', after the lesson (W'+week+')');rel=SWK[cite]===week?`the same school week, W${week}`:`taught earlier, W${SWK[cite]}`;}
    else{if(support&&srcY&&YR[cy]>YR[srcY])LERR(l.id,'Support lesson (source',src+') pre cites',cite,'above its source year');if(!support&&YR[cy]>YR[YEAR])LERR(l.id,'pre cites a later year',cite);rel=gradeName(cy)+(support&&cy===srcY?', the source grade':'');}
    if(own.has(k+'|'+JSON.stringify(o||{})))LERR(l.id,'pre repeats the lesson\'s own skill',k);
    pre.push({key:k,opts:o||{},why:`${cite} ${st.title} (${rel})${reason?': '+reason:''}`,cite});}
  const related=(sp.related||[]).map(([k0,o,why])=>({key:resolve(k0)||k0,opts:o||{},why}));
  for(const [role,list] of [['pre',pre],['related',related]]){const seen=new Set();for(const e of list){lessonStats.links++;const sig=e.key+'|'+JSON.stringify(e.opts);if(seen.has(sig))LERR(l.id,role,'duplicate',sig);seen.add(sig);
    if(role==='related'&&own.has(sig))LERR(l.id,'related repeats the lesson\'s own skill',e.key);
    // a Support lesson's pre that is its source-grade step's own skill and opts is that grade's lesson content; the customary
    // marker is the lesson's own content in the school's customary length unit (sp.customaryOk says why)
    const srcOwn=support&&role==='pre'&&e.cite&&JSON.stringify(stepOptsFor(e.cite,e.key)||{})===JSON.stringify(e.opts||{});
    const hits=srcOwn?[]:markerHits(e.key,e.opts,l.id).filter(h=>!(sp.customaryOk&&h.m==='customary'));if(hits.length)LERR(l.id,role,e.key,JSON.stringify(e.opts),'deals content first met later:',hits.map(h=>h.m+' (W'+h.mw+') '+h.ex).join(' | '));}}
  denomNotePass([pre,related]);
  titleClaimPass(l.id,[['pre',pre],['related',related]]);
  for(const e of pre)delete e.cite;
  if(pre.length<3&&!/few/i.test(sp.note||''))LERR(l.id,'fewer than 3 pre and no note saying why');if(!related.length)LERR(l.id,'no related link');
  for(const id of build)usedProps.add(id);lessonStats[verdict]++;
  out.lessons[l.id]={title:l.title,site:{flag:l.flag,supplement:!!l.supplement,firstWeek:l.firstWeek||null,ccss:l.ccss||[],ee:l.ee||[],domain:l.domain||null,unit:l.unit||null,block:l.block||null,power:!!l.power},
    direct,partial,verdict,missing:verdict==='full'?'':sp.missing,build,pre,preBuild:[],related,note:sp.note||''};}
for(const id of Object.keys(LS.lessons))if(!myLessons.some(l=>l.id===id)&&id.startsWith(({Y2:'G1|',Y3:'G2|'})[YEAR]))LERR(id,'spec for a lesson the site does not list for',YEAR);
const LANEF={};const laneProp=(y,id)=>{LANEF[y]??=JSON.parse(fs.readFileSync(root+'data/curriculum/links/'+y+'.json','utf8'));return LANEF[y].proposals?.[id]||null;};
function propText(id){const p=OV.proposals?.[id]||WRM_PROPOSALS[id];if(p)return p.teaches;for(const n of ['STANDARD_PROPOSALS','WRM_EXTENSIONS','VISUAL_BUILDS']){const q=BL[n]?.[id];if(q)return q.teaches||q.name;}return id;}
for(const id of usedProps){
  const own=OV.proposals?.[id];
  if(own){out.proposals[id]={...own,reused:false};continue;}
  if(LS.lessonProposals?.[id]){out.proposals[id]={...LS.lessonProposals[id],steps:[],reused:false};continue;}
  if(LS.laneProposals?.[id]){const y=LS.laneProposals[id];const q=laneProp(y,id);if(!q)throw new Error('lane proposal '+id+' not in '+y+'.json');
    const {closes,lessons,reused,dropSteps,kindText,...rest}=q;out.proposals[id]={...rest,steps:[...(q.steps||[])],why:(q.why||'')+` (reused from the ${y} lane's links file: the same id is the same spec)`,reused:true,source:y+'.json'};continue;}
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
  const ls=Object.entries(out.lessons||{}).filter(([,L])=>L.build.includes(id));for(const [lid,L] of ls)c[lid]=L.missing;if(ls.length)p.lessons=ls.map(([lid])=>lid);
  p.closes=c;p.kindText=p.kind==='new'?'new skill':'option on '+(p.skills?p.skills.join(', '):p.skill);
  // r3: a step of THIS year that the proposal listed but no longer closes is moved to dropSteps (for the lead's merge)
  const drop=(p.steps||[]).filter(sid=>sid.startsWith(YEAR+'.')&&!c[sid]);if(drop.length){p.dropSteps=drop;p.steps=p.steps.filter(x=>!drop.includes(x));}
  for(const sid of Object.keys(c))if(stepById[sid]&&!(p.steps||[]).includes(sid))(p.steps??=[]).push(sid);}
// r12: each lesson that is not full envisions the skill that closes it (the Y5 lessons shape)
for(const L of Object.values(out.lessons))if(L.verdict!=='full')L.envision=L.build.map(id=>{const p=out.proposals[id];return {proposal:id,name:p.name,kind:p.kindText,teaches:p.teaches,closes:L.missing,representation:p.representation};});
// rule 16 check: on a gap step `closes` is the step's own clause, never the proposal's `teaches` copied
for(const[id,p]of Object.entries(out.proposals))for(const[sid,txt]of Object.entries(p.closes))if((out.steps[sid]||out.lessons[sid]).verdict==='gap'&&txt===p.teaches)console.error('CLOSES=TEACHES',sid,id);
for(const s of [...Object.values(out.steps),...Object.values(out.lessons)])for(const x of [...s.direct,...s.partial,...s.pre,...s.related])if(!live(x.key))throw new Error('dead key '+x.key);
for(const t of out.tagFixes)if(out.lessons[t.step])LERR(t.step,'a tagFix names a lesson');
for(const s of Object.values(out.steps))for(const d of s.direct)if('note' in (d.opts||{}))throw new Error('note in opts '+d.key);
fs.mkdirSync(root+'data/curriculum/links',{recursive:true});
{const o2={};for(const k of ['year','generatedBy','method','steps','lessons','proposals','tagFixes','retireBuilt'])if(k in out)o2[k]=out[k];for(const k of Object.keys(out))if(!(k in o2))o2[k]=out[k];fs.writeFileSync(root+`data/curriculum/links/${YEAR}.json`,JSON.stringify(o2,null,1)+'\n');}
// r13 SPECOPTS: the written file, read back from disk, against the spec snapshot
{const wr=JSON.parse(fs.readFileSync(root+`data/curriculum/links/${YEAR}.json`,'utf8'));let n=0,bad=0;
  for(const[id,sn]of Object.entries(specSnap)){const w=wr.steps?.[id]||wr.lessons?.[id];if(!w){console.error('SPECOPTS',id,'missing from the written file');bad++;continue;}
    for(const role of ['direct','partial','pre','related']){const a=sn[role],b=(w[role]||[]).map(sig);n+=a.length;
      if(a.length!==b.length||a.some((x,i)=>x!==b[i])){bad++;console.error('SPECOPTS',id,role,'spec',JSON.stringify(a.filter(x=>!b.includes(x))),'written',JSON.stringify(b.filter(x=>!a.includes(x))),a.length!==b.length?`(${a.length} vs ${b.length} links)`:'(order)');}}}
  for(const id of [...Object.keys(wr.steps||{}),...Object.keys(wr.lessons||{})])if(!specSnap[id]){console.error('SPECOPTS',id,'written but has no spec snapshot');bad++;}
  if(bad)process.exitCode=1;console.error(`specopts ${YEAR}: ${n} links of ${Object.keys(specSnap).length} entries checked against the spec snapshot; ${bad} differences`);}
// r13 DENOMCHECK (critic r12 N12): every denoms link, clause and why against its items, fractions read from the payload too
{const {rows,finds}=DN.denomFinds(out,DNOPT);for(const f of finds)console.error('DENOMCHECK',f.kind,f.sid,f.role,f.key,JSON.stringify(f.opts),'|',f.msg);if(finds.length)process.exitCode=1;
  console.error(`denomcheck ${YEAR}: ${rows.length} denoms links, ${DNOPT.n} items each; ${rows.filter(r=>r.off).length} deal an off-family fraction; ${finds.length} problems`);}
// r10 (critic r9 N7): the merge assertion — tagFixes applied to SKILL_WRM must reproduce every tag, clause and step verdict
{const MC=await import(HERE+'mergecheck23.mjs');const mr=await MC.mergeCheck(JSON.parse(JSON.stringify(out)));for(const p of mr.problems)console.error('MERGE',p);if(mr.problems.length)process.exitCode=1;console.error(`mergecheck ${YEAR}: ${mr.problems.length} problems`);}
console.error(`optgate ${YEAR}: ${optStats.n} links, ${optStats.spec} at their spec opts, changed by a named rule ${JSON.stringify(optStats.rule)}, ${optStats.bad} problems`);
console.error(`titleclaim ${YEAR}: half markers ${titleStats.half}, nearest-live-practice ${titleStats.nlp}, ${titleStats.bad} problems`);
console.error(`lessons ${YEAR}: ${lessonStats.n} site lessons (${lessonStats.full} full / ${lessonStats.partial} partial / ${lessonStats.gap} gap), ${lessonStats.links} links checked, ${lessonStats.bad} problems`);
console.error(`bbcheck ${YEAR}: ${bbStats.n} steps swept, ${bbStats.bad} problems; lead pre by class ${JSON.stringify(bbStats.cls)}`);
const c={full:0,partial:0,gap:0};for(const s of Object.values(out.steps))c[s.verdict]++;
const pr=Object.values(out.proposals);
console.log(YEAR,Object.keys(out.steps).length,'steps',JSON.stringify(c),'proposals new',pr.filter(p=>!p.reused).length,'reused',pr.filter(p=>p.reused).length,'tagFixes',out.tagFixes.length,'unreviewed',missingReview.length);
if(process.argv.includes('--unreviewed'))console.log(missingReview.join(' '));
if(process.argv.includes('--unmatched'))console.log('unmatched prior:',[...unmatchedPrior].join(' | '));
