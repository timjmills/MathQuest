// Rule 18 + 19 content markers, shared by build.mjs (to filter links) and linkscan.mjs (to check them).
// Each marker names the STEP whose school week (xlsx) is the first week a pupil of this grade meets that content;
// 'NEVER' = not in this grade at all (tables beyond the grade, decimals, right angles at Grade 1, customary units).
// A link may not deal a marker first met more than TOL school weeks after the step's own week (TOL = 2 spares a
// next-step related link). Items are generated on the print path with two seed families (8 + 10 items).
const strip=s=>String(s??'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<svg[\s\S]*?<\/svg>/g,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&times;/g,'×').replace(/&divide;/g,'÷').replace(/\s+/g,' ').trim();
const dens=q=>{const s=q.t+' '+q.a+' '+q.p;const d=[...s.matchAll(/(?<![\d:])\b\d+\/(\d+)\b/g)].map(m=>+m[1]).concat([...q.p.matchAll(/"d":(\d+)/g)].map(m=>+m[1]));
  for(const [w,n] of [['half',2],['third',3],['quarter',4],['fifth',5],['sixth',6],['eighth',8],['ninth',9],['tenth',10]])if(new RegExp('\\b'+w,'i').test(q.t))d.push(n);return d;};
const times=q=>[...(q.t+' '+q.a).matchAll(/\b(\d{1,2}):(\d{2})\b/g)].map(m=>+m[2]);
const TB={Y2:[1,2,5,10],Y3:[1,2,3,4,5,8,10]};
const red=n=>{n=+n;while(n>=10&&n%10===0)n/=10;return n;};
const beyond=Y=>(q,k)=>{if(k==='multiplication:repeated_add_to_mult')return false; // equal groups of 3 or 4 by repeated addition: fine (critic r4)
  const t=q.t+' '+q.p;const pr=[...t.matchAll(/(\d+)\s*[×x*]\s*(\d+)/g)].concat([...t.matchAll(/"a":(\d+),"b":(\d+),"op":"[*]"/g)]).concat([...t.matchAll(/has (\d+) \w+\. Each \w+ has (\d+)/g)]);
  if(pr.some(m=>!TB[Y].includes(red(m[1]))&&!TB[Y].includes(red(m[2]))&&+m[1]>1&&+m[2]>1))return true;
  return [...t.matchAll(/(\d+)\s*÷\s*(\d+)/g)].some(m=>!TB[Y].includes(+m[2])&&!TB[Y].includes(+m[1]/+m[2]));};
const CUST=/\b(feet|foot|ft|yards?|yd|inch(es)?|miles?|ounces?|oz|pounds?|lbs?|cups?|pints?|quarts?|gallons?|°F|fahrenheit)\b/i;
export const MARKERS={
 Y2:{
  thirds:['Y2.B8.S7',(q,k)=>/fraction|partition|shade|halve|compose_whole|equal_parts/.test(k)&&dens(q).includes(3)],
  quarterPastTo:['Y2.B9.S2',(q,k)=>/^measurement:(time|clock|elapsed)/.test(k)&&(times(q).some(m=>m===15||m===45)||/quarter (past|to)/i.test(q.t+q.a))],
  fiveMinutes:['Y2.B9.S5',(q,k)=>/^measurement:(time|clock|elapsed)/.test(k)&&times(q).some(m=>m%15!==0)],
  divide:['Y2.B5.S10',(q)=>/÷/.test(q.t+q.a)],
  times:['Y2.B5.S13',(q)=>/×/.test(q.t+q.a)],
  kg_g:['Y2.B7.S2',(q)=>/\b(grams?|kg|kilograms?)\b|\d\s?g\b/.test(q.t+q.a)],
  ml_l:['Y2.B7.S6',(q)=>/\b(ml|mL|millilit|litres?|liters?)\b/.test(q.t+q.a)],
  tally:['Y2.B10.S1',(q,k)=>/tally/i.test(q.t+k)],
  pictogram:['Y2.B10.S4',(q,k)=>/pictogra/i.test(q.t+k)],
  rightAngleParallel:['NEVER',(q)=>/right angle|parallel|perpendicular|90°|acute|obtuse/i.test(q.t+q.a)],
  customary:['NEVER',(q,k)=>k!=='measurement:reading_ruler'&&CUST.test(q.t+' '+q.a)],
  tablesBeyond:['NEVER',beyond('Y2')],
 },
 Y3:{
  div348:['Y3.B3.S7',(q)=>[...(q.t+' '+q.a).matchAll(/(\d+)\s*÷\s*(\d+)/g)].some(m=>[3,4,8].includes(+m[2]))],
  times8:['Y3.B3.S12',(q,k,o)=>!(o.constant&&!o.constant.includes(8))&&[...(q.t).matchAll(/(\d+)\s*×\s*(\d+)/g)].some(m=>(+m[1]===8||+m[2]===8))],
  bigDen:['Y3.B6.S1',(q,k)=>/fraction|partition|shade|compose_whole|frac/.test(k)&&dens(q).some(d=>d>4)],
  equivFrac:['Y3.B6.S9',(q,k)=>/equiv_frac|select_equiv/.test(k)],
  parallelPerp:['Y3.B11.S6',(q)=>/parallel|perpendicular/i.test(q.t+q.a)],
  rightAngle:['Y3.B11.S2',(q)=>/right angle|acute|obtuse/i.test(q.t+q.a)],
  minute:['Y3.B10.S3',(q,k)=>/^measurement:(time|clock|elapsed)/.test(k)&&times(q).some(m=>m%5!==0)],
  ampm:['Y3.B10.S5',(q)=>/\b(a\.m\.|p\.m\.)/i.test(q.t+q.a)],
  Lml:['Y3.B7.S9',(q)=>/\bL\b|litre|liter/.test(q.t+q.a)&&/mL|ml|millil/.test(q.t+q.a)],
  kg_gconv:['Y3.B7.S4',(q)=>/kg|kilogram/.test(q.t+q.a)&&/\bg\b|gram/.test(q.t+q.a)],
  decimal:['NEVER',(q,k)=>!/money|change|coin/.test(k)&&/(?<![$\d.])\d+\.\d+/.test((q.t+' '+q.a).replace(/\$\d+\.\d+/g,''))],
  money_dec:['Y3.B9.S1',(q)=>/\$\d+\.\d\d/.test(q.t+q.a)],
  mult2x1:['Y3.B4.S4',(q)=>[...q.t.matchAll(/(\d+)\s*×\s*(\d+)/g)].some(m=>(+m[1]>=11&&+m[1]%10&&+m[2]<10)||(+m[2]>=11&&+m[2]%10&&+m[1]<10))],
  div2x1:['Y3.B4.S7',(q)=>[...q.t.matchAll(/(\d+)\s*÷\s*(\d+)/g)].some(m=>+m[1]/+m[2]>10)],
  rounding:['Y3.B2.S20',(q)=>/\bround(ed)? (each|to|the)/i.test(q.t)],
  perimeter:['Y3.B5.S10',(q)=>/perimeter/i.test(q.t)],
  mm:['Y3.B5.S2',(q)=>/\bmm\b|millimet/.test(q.t+q.a)],
  customary:['NEVER',(q,k)=>k!=='measurement:reading_ruler'&&CUST.test(q.t+' '+q.a)],
  tablesBeyond:['NEVER',beyond('Y3')],
 }};
export function makeMarkerCheck(generateQuestionFor,Y,wk,TOL=2){
  const cache=new Map();
  const gen=(key,opts)=>{const id=key+JSON.stringify(opts);if(cache.has(id))return cache.get(id);const [c,k]=key.split(':');const it=[];
    for(const [base,step,n] of [[33331,97,10],[5501,211,8]])for(let i=0;i<n;i++){try{const q=generateQuestionFor({category:c,skill:k,opts,seed:base+i*step,itemIndex:i});it.push({t:strip(q.text),a:JSON.stringify(q.ans??''),p:q.cell?JSON.stringify(q.cell.payload):''});}catch(e){}}
    cache.set(id,it);return it;};
  // markers a link (key, opts) deals that the pupil of stepId has not met by its week (+TOL)
  return (key,opts,stepId)=>{const its=gen(key,opts||{});const hit=[];
    for(const [m,[st,f]] of Object.entries(MARKERS[Y])){const mw=st==='NEVER'?999:(wk[st]??999);if(mw<=(wk[stepId]??999)+TOL)continue;const q=its.find(q=>f(q,key,opts||{}));if(q)hit.push({m,mw,ex:q.t.slice(0,70)+' A='+q.a.slice(0,20)});}
    return hit;};
}
// school week per step id of year Y from the xlsx rows ({week, lesson}); same matching as the critic's scripts
export function schoolWeeks(stepTitles,rows){const norm=t=>String(t).toLowerCase().replace(/\(us[^)]*\)/g,'').replace(/[–—-]/g,' ').replace(/[^a-z0-9]/g,'');
  const wk={};for(const[id,t]of Object.entries(stepTitles)){const r=rows.find(x=>norm(x.lesson)===norm(t))||rows.find(x=>norm(x.lesson).includes(norm(t).slice(0,22)));wk[id]=r?+String(r.week).replace(/\D/g,''):999;}return wk;}
