// node maxdealt.mjs < sigs.json > out.json : for each [key, opts] the largest number its 24 generated items show
// (text, answer and cell-payload numbers, seeds 4400 + 13i, the lead's relfit scan); `range` in opts is Max Number (default 10). Read by gen.py (rule 18).
import fs from 'fs';
const _m=new Map();globalThis.localStorage={getItem:k=>_m.get(k)??null,setItem:(k,v)=>_m.set(k,String(v)),removeItem:k=>_m.delete(k)};
globalThis.window=globalThis;globalThis.document=undefined;
const root=new URL('../../../',import.meta.url).pathname;
const _l=console.log;console.log=()=>{};console.warn=()=>{};
const g=await import(root+'js/modules/generate-question.js');
const strip=s=>String(s??'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ');
const out={};const SKIPK=new Set(['slotDigits','level','frames','places','wrap','correct','blanks','tiles']);
for(const [key,opts] of JSON.parse(fs.readFileSync(0,'utf8'))){const [c,k]=key.split(':');const o={...opts};const range=o.range??10;delete o.range;let max=0;
  for(let i=0;i<24;i++){let q;try{q=g.generateQuestionFor({category:c,skill:k,opts:o,range,seed:4400+i*13,itemIndex:i,itemCount:24});}catch(e){continue;}
    if(!q)continue;for(const m of (strip(q.text)+' '+JSON.stringify(q.ans??'')).matchAll(/\d+/g))max=Math.max(max,+m[0]);
    const walk=(v,kk)=>{if(v==null||SKIPK.has(kk))return;if(typeof v==='number')max=Math.max(max,v);else if(Array.isArray(v))v.forEach(x=>walk(x,kk));else if(typeof v==='object')for(const[a,b]of Object.entries(v))walk(b,a);};
    if(q.cell)walk(q.cell.payload,'');}
  out[key+' '+JSON.stringify(opts,Object.keys(opts).sort())]=max;}
console.log=_l;console.log(JSON.stringify(out));
