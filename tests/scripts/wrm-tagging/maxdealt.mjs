// node maxdealt.mjs < sigs.json > out.json : for each [key, opts] -> {max, flags} over 24 generated items (seeds 4400 + 13i).
// max: the largest number in text, answer and cell payload (tens_foundation_visual counts rods x 10).
// flags: content a PK / K link must not carry (the critic's r3 regexes): x / ÷, parallel / right angles, vertices,
// polygons past 4 sides, columns / regrouping, standard units, fractions, coordinates, typed words, drag.
// c19: the rule-19 content classes; distinct: how many different items 24 samples give (a link needs at least 3).
// `range` in opts is Max Number (default 10). Read by gen.py (rule 18).
import fs from 'fs';
const _m=new Map();globalThis.localStorage={getItem:k=>_m.get(k)??null,setItem:(k,v)=>_m.set(k,String(v)),removeItem:k=>_m.delete(k)};
globalThis.window=globalThis;globalThis.document=undefined;
const root=new URL('../../../',import.meta.url).pathname;
const _l=console.log;console.log=()=>{};console.warn=()=>{};
const g=await import(root+'js/modules/generate-question.js');
const strip=s=>String(s??'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const SKIPK=new Set(['slotDigits','level','frames','places','wrap','correct','blanks','tiles','seed','w','h','x','y','width','height','size','r','cx','cy','id','idx','index']);
const FLAGS={times:/×|÷|multipl|divid/i,parallel:/parallel|perpendicular|right angle|acute|obtuse/i,poly:/octagon|hexagon|pentagon|quadrilateral|trapez|rhomb|parallelogram|kite|heptagon/i,
 vert:/vert(ex|ices)/i,column:/column|carry|regroup|borrow|exchange/i,units:/\b(cm|mm|km|kg|g|ml|mL|inch|inches|feet|foot|yard|pound|ounce|liters?|litres?|grams?|meters?|metres?)\b/,
 frac:/\b(\d+)\s*\/\s*(\d+)\b|third|fifth|sixth|eighth/i,coord:/coordinate|\(\s*\d+\s*,\s*\d+\s*\)/i,word:/write the (word|name)|type the|spell/i,drag:/drag/i};
// r19 content classes (the critic's r4 regexes): counted per item over text, answer, cell and visual
const C19={skip25:/by 2s|by 5s|count-by-2s|count-by-5s|in 2s|in 5s/i,nline:/number.?line|numberLine|"nl/i,money:/¢|cent|penny|nickel|dime|dollar|\$/i,clock:/o'clock|half past|clock/i,
 frac:/\bhalf\b|\bhalves\b|quarter|\d\/\d/i,units:/\b(cm|inch|inches|centimet)/i,lt:/[<>]|greater than|less than/i,minus:/−|-\s*\d|subtract|take away/i,array:/\barray|rows of/i};
const out={};
for(const [key,opts] of JSON.parse(fs.readFileSync(0,'utf8'))){const [c,k]=key.split(':');const o={...opts};const range=o.range??10;delete o.range;let max=0;const flags={};const c19={};const seen=new Set();
  for(let i=0;i<24;i++){let q;try{q=g.generateQuestionFor({category:c,skill:k,opts:o,range,seed:4400+i*13,itemIndex:i,itemCount:24});}catch(e){continue;}
    if(!q)continue;const t=strip(q.text)+' '+JSON.stringify(q.ans??'');for(const m of t.matchAll(/\d+/g))max=Math.max(max,+m[0]);
    const walk=(v,kk)=>{if(v==null||SKIPK.has(kk))return;if(typeof v==='number'&&Number.isFinite(v))max=Math.max(max,v);else if(Array.isArray(v))v.forEach(x=>walk(x,kk));else if(typeof v==='object')for(const[a,b]of Object.entries(v))walk(b,a);};
    if(q.cell)walk(q.cell.payload,'');
    if(k==='tens_foundation_visual'&&q.cell?.payload?.n)max=Math.max(max,q.cell.payload.n*10);
    const full=t+' '+(q.cell?JSON.stringify(q.cell.payload):'')+' '+strip(q.visual||'').slice(0,400);
    for(const[n,r]of Object.entries(FLAGS))if(r.test(full))flags[n]=(flags[n]||0)+1;
    const t19=t+' '+(q.cell?JSON.stringify(q.cell):'')+' '+strip(q.visual||'').slice(0,600);
    for(const[n,r]of Object.entries(C19))if(r.test(t19))c19[n]=(c19[n]||0)+1;
    seen.add(strip(q.text)+'|'+JSON.stringify(q.ans??'')+'|'+JSON.stringify(q.cell?.payload??''));}
  out[key+' '+JSON.stringify(opts,Object.keys(opts).sort())]={max,flags,c19,distinct:seen.size};}
console.log=_l;console.log(JSON.stringify(out));
