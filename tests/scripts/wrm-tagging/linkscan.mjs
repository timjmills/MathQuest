// node linkscan.mjs Y2 Y3 -> rule 18: every pre/related LINK generated with its opts; flags items whose largest number
// passes the year's range (Y2 120, Y3 1,000; units Y2 2,000, Y3 5,000) or that fail to generate.
import fs from 'fs';
const _m=new Map();globalThis.localStorage={getItem:k=>_m.get(k)??null,setItem:(k,v)=>_m.set(k,String(v)),removeItem:k=>_m.delete(k)};
globalThis.window=globalThis;globalThis.document=undefined;
const root=new URL('../../../',import.meta.url).pathname;
const _l=console.log,_w=console.warn;console.log=()=>{};console.warn=()=>{};
const {generateQuestionFor}=await import(root+'js/modules/generate-question.js');
console.log=_l;console.warn=_w;
const strip=s=>String(s??'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ');
// the YEAR's number range (what a pupil of any step of the year already handles: Y2 = Grade 1, count to 120
// (1.NBT.A.1); Y3 = Grade 2, to 1,000); measures in g / ml / cm are checked against the year's unit range instead
const YLIM={R:10,Y1:100,Y2:120,Y3:1000,Y4:10000};const ULIM={Y2:2000,Y3:5000};
const cache=new Map();
function maxOf(key,opts){const id=key+JSON.stringify(opts);if(cache.has(id))return cache.get(id);const [category,skill]=key.split(':');let mx=0,err=0;
  for(let i=0;i<8;i++){try{const q=generateQuestionFor({category,skill,opts,seed:5501+i*211,itemIndex:i});// thousands separators are merged in the TEXT only; payload/answer JSON is split on commas
    const t=strip(q.text).replace(/(\d),(\d{3})\b/g,'$1$2')+' '+(q.cell?JSON.stringify(q.cell.payload):'').replace(/,/g,' ')+' '+JSON.stringify(q.ans).replace(/,/g,' ');
    for(const m of t.replace(/#[0-9a-f]{3,6}/gi,'').matchAll(/(?<![\w.#-])\d+(?![\w])/g))mx=Math.max(mx,+m[0]);}catch(e){err++;}}
  const r={mx,err};cache.set(id,r);return r;}
// fixed-domain skills (clock minutes, angles in degrees, grid coordinates) are not number-range checked; money payloads are in cents
const FIXED=/^measurement:(time_|elapsed_|clock_)|^angles_lines:|^coordinates:|^shapes_early:/;const CENTS=/^measurement:(money|coin_|equiv_coin|enough_money|make_change)/;
const UNIT=/^measurement:(mass_volume_liquid|capacity|length_metric|estimate_length|unit_conversion_word|temperature|reading_ruler)/;
let bad=0;
for(const Y of process.argv.slice(2)){const L=JSON.parse(fs.readFileSync(root+`data/curriculum/links/${Y}.json`));
  for(const[id,s]of Object.entries(L.steps)){const lim=YLIM[Y];
    for(const [kind,list] of [['pre',s.pre],['rel',s.related]])for(const e of list){if(FIXED.test(e.key))continue;const r=maxOf(e.key,e.opts||{});const L2=CENTS.test(e.key)?lim*100:UNIT.test(e.key)?ULIM[Y]:lim;
      if(r.mx>L2||r.err){bad++;console.log(`${Y} ${id} ${kind} ${e.key} ${JSON.stringify(e.opts||{})} max=${r.mx} lim=${L2}${r.err?' ERR'+r.err:''}`);}}}}
console.log('linkscan: '+(bad?bad+' links outside the step':'OK'));
