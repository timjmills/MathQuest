// node linkscan.mjs Y2 Y3 [--year]  -> rule 18 check of every pre/related LINK, generated (8 items) WITH its opts.
// Default mode is WEEK-RELATIVE (brief rule 18, critic r3): a link's largest number must fit what the pupil has met by
// that school week = the largest number dealt by the step itself or by any step taught in an earlier (or the same) school
// week (xlsx order), and never less than the previous year's range (BASE: K counts to 100 = K.CC.A.1; Grade 1 to 120).
// --year falls back to the old year-wide ceiling (Y2 120, Y3 1,000).
// CONTENT and LAYOUT checks (always on): Y2 fraction denominators only 2, 3, 4; Y3 fraction compares must share a numerator
// or a denominator; no coordinate-plane / transformation skill; no × or ÷ in a Y2 sign or balance link; no customary units
// (ft, yd, in, mi, oz, lb, cup, pt, qt, gal) on a Y2/Y3 link (the school measures in metric; no skill is exempted by name: reading_ruler's
// inch ruler counts); no 2-digit column (stack) layout before Y2.B2.S15 and no
// 3-digit column layout before Y3.B2.S11. Clock, angle and shape skills are not number-range checked (fixed domains);
// money payloads are cents. RULE 19 (WEEK): markers.mjs content markers (thirds, quarter past, 5-minute times, ÷, ×8,
// ÷3/4/8, fractions beyond quarters, equivalence, angles and lines, L ↔ mL, decimals, 2-digit × ÷ 1-digit, rounding,
// perimeter, mm, tally, pictogram, a.m./p.m., tables beyond the grade, customary units) each have the school week the
// pupil first meets them; a link may not deal one more than 2 weeks after its step's week. Exit 1 on any flag; prints `linkscan: OK` / `linkscan: N`.
import fs from 'fs';
import { execFileSync } from 'child_process';
const _m=new Map();globalThis.localStorage={getItem:k=>_m.get(k)??null,setItem:(k,v)=>_m.set(k,String(v)),removeItem:k=>_m.delete(k)};
globalThis.window=globalThis;globalThis.document=undefined;
const HERE=new URL('.',import.meta.url).pathname;
const root=new URL('../../../',import.meta.url).pathname;
const _l=console.log,_w=console.warn;console.log=()=>{};console.warn=()=>{};
const {generateQuestionFor}=await import(root+'js/modules/generate-question.js');
console.log=_l;console.warn=_w;
const MK=await import(HERE+'markers.mjs');
const args=process.argv.slice(2);const YEARMODE=args.includes('--year');const years=args.filter(a=>!a.startsWith('--'));
const strip=s=>String(s??'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<svg[\s\S]*?<\/svg>/g,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ');
const YLIM={Y2:120,Y3:1000},BASE={Y2:100,Y3:120},ULIM={Y2:2000,Y3:5000};
const FIXED=/^measurement:(time_|elapsed_|clock_|order_clocks)|^angles_lines:|^shapes_early:|^shapes_classify:/;
const CENTS=/^measurement:(money|coin_|equiv_coin|enough_money|make_change)/;
const UNIT=/^measurement:(mass_volume_liquid|capacity|length_metric|estimate_length|unit_conversion_word|temperature|reading_ruler)/;
const CUST=/\b(feet|foot|ft|yards?|yd|inch(es)?|miles?|ounces?|oz|pounds?|lb|cups?|pints?|quarts?|gallons?|qt|gal)\b/i;
const cache=new Map();
function gen(key,opts){const id=key+JSON.stringify(opts);if(cache.has(id))return cache.get(id);const [category,skill]=key.split(':');
  const r={mx:0,err:0,dens:new Set(),unlike:0,muldiv:0,cust:0,col2:0,col3:0,ex:''};
  for(let i=0;i<8;i++){let q;try{q=generateQuestionFor({category,skill,opts,seed:5501+i*211,itemIndex:i});}catch(e){r.err++;continue;}
    const txt=strip(q.text).replace(/(\d),(\d{3})\b/g,'$1$2');const pay=q.cell?JSON.stringify(q.cell.payload):'';const ans=JSON.stringify(q.ans??'');
    const all=txt+' '+pay.replace(/,/g,' ')+' '+ans.replace(/,/g,' ');
    for(const m of all.replace(/#[0-9a-f]{3,6}/gi,'').matchAll(/(?<![\w.#\/-])\d+(?![\w\/])/g))if(+m[0]>r.mx){r.mx=+m[0];r.ex=txt.replace(/\s+/g,' ').trim().slice(0,80)+' A='+ans.slice(0,25);}
    for(const m of (txt+' '+pay+' '+ans).matchAll(/\b\d+\/(\d+)\b/g))r.dens.add(+m[1]);for(const m of pay.matchAll(/"d":(\d+)/g))r.dens.add(+m[1]);
    for(const w of ['fifth','sixth','eighth','ninth','tenth','twelfth'])if(new RegExp(w,'i').test(txt))r.dens.add(w);
    const t=q.cell?.payload?.terms;if(t&&t.length===2&&t[0].n!=null&&t[0].n!==t[1].n&&t[0].d!==t[1].d)r.unlike++;
    if(/[×÷]/.test(ans)||/[×÷]/.test(String(q.cell?.payload?.answer??'')))r.muldiv++;
    if(CUST.test(txt)||CUST.test(ans))r.cust++;
    if(q.cell?.template==='stack'){const ops=(q.cell.payload.operands||[q.cell.payload.a,q.cell.payload.b]).filter(x=>x!=null).map(Number);
      if(ops.length>=2&&ops.filter(x=>x>=10).length>=2)r.col2++;if(ops.length>=2&&ops.filter(x=>x>=100).length>=1&&ops.filter(x=>x>=10).length>=2)r.col3++;}}
  cache.set(id,r);return r;}
// school weeks (xlsx order)
const W=JSON.parse(fs.readFileSync(root+'data/curriculum/wrm-steps.json'));const order=[];for(const y of W.years)for(const b of y.blocks)for(const s of b.steps)order.push(s.id);
const norm=t=>String(t).toLowerCase().replace(/\(us[^)]*\)/g,'').replace(/[–—-]/g,' ').replace(/[^a-z0-9]/g,'');
const FIRSTCOL={Y2:'Y2.B2.S15',Y3:'Y3.B2.S11'};
let bad=0;const rows=[];
for(const Y of years){const L=JSON.parse(fs.readFileSync(root+`data/curriculum/links/${Y}.json`));
  const sheet={Y2:'Grade 1',Y3:'Grade 2'}[Y];const xl=JSON.parse(execFileSync('python3',['-I',HERE+'xlsx.py',root+'data/curriculum/source/Awsaj-Domain-Sequence-K-5-2026-27.xlsx',sheet]).toString());
  const wk={},own={};
  for(const[id,s]of Object.entries(L.steps)){const r=xl.find(x=>norm(x.lesson)===norm(s.title))||xl.find(x=>norm(x.lesson).includes(norm(s.title).slice(0,22)));wk[id]=r?+String(r.week).replace(/\D/g,''):999;
    let c=0;for(const e of [...s.direct,...s.partial])if(!FIXED.test(e.key)&&!CENTS.test(e.key)&&!UNIT.test(e.key))c=Math.max(c,gen(e.key,e.opts||{}).mx);
    const tm=s.title.replace(/(\d),(\d{3})/g,'$1$2').match(/\d+/g);own[id]=Math.max(c,tm?Math.max(...tm.map(Number)):0);}
  const known=id=>{let k=BASE[Y];for(const o in own)if(wk[o]<wk[id]||(wk[o]===wk[id]&&order.indexOf(o)<=order.indexOf(id)))k=Math.max(k,own[o]);return k;};
  // rule 19: content markers (markers.mjs) by school week, TOL 2 weeks; tables beyond the grade and customary units never
  const SWK=MK.schoolWeeks(Object.fromEntries(Object.entries(L.steps).map(([i,s])=>[i,s.title])),xl);const mhit=MK.makeMarkerCheck(generateQuestionFor,Y,SWK,2);
  for(const[id,s]of Object.entries(L.steps)){const ceil=YEARMODE?YLIM[Y]:known(id);
    for(const [kind,list] of [['pre',s.pre],['rel',s.related]])for(const e of list){const r=gen(e.key,e.opts||{});const tag=`${Y} ${id} ${kind} ${e.key} ${JSON.stringify(e.opts||{})}`;const flag=m=>{bad++;rows.push(`${m.padEnd(8)} ${tag} | ${r.ex}`);};
      if(r.err)flag('ERR');
      for(const h of mhit(e.key,e.opts||{},id)){bad++;rows.push(`WEEK    ${tag} | ${h.m} first met W${h.mw===999?'never':h.mw}, step W${SWK[id]} | ${h.ex}`);}
      if(/^coordinates:/.test(e.key))flag('COORD');
      const lim=CENTS.test(e.key)?ceil*100:UNIT.test(e.key)?ULIM[Y]:ceil;
      if(!FIXED.test(e.key)&&r.mx>lim)flag(`SIZE>${lim}`);
      if(/^(fractions|fraction_operations|composing:(compose_whole|fraction_number_line))/.test(e.key)){
        if(Y==='Y2'){const b=[...r.dens].filter(x=>![1,2,3,4].includes(x));if(b.length)flag('DENOM '+b.join(','));}
        if(Y==='Y3'&&r.unlike&&/:(compare|order_fractions|order_frac|compare_frac|benchmark)/.test(e.key))flag('UNLIKE');}
      if(Y==='Y2'&&r.muldiv&&/^(number_ops_mixed|algebra):/.test(e.key))flag('MULDIV');
      if(r.cust)flag('CUSTOMARY');
      if(Y==='Y2'&&r.col2&&order.indexOf(id)<order.indexOf(FIRSTCOL.Y2))flag('COLUMN');
      if(Y==='Y3'&&r.col3&&order.indexOf(id)<order.indexOf(FIRSTCOL.Y3))flag('COLUMN');}}}
console.log(rows.join('\n'));
console.log(`linkscan (${YEARMODE?'year':'week'} mode): `+(bad?bad+' links flagged':'OK'));
process.exitCode=bad?1:0;
