// node items.mjs <YEAR> [stepPrefix] [n] -> for every step: title, ccss, note, and n generated items per direct/partial skill
// WITH the opts the links file records. Also: node items.mjs --key cat:skill '{"opt":1}' [n]
import fs from 'fs';
const _m=new Map();globalThis.localStorage={getItem:k=>_m.get(k)??null,setItem:(k,v)=>_m.set(k,String(v)),removeItem:k=>_m.delete(k)};
globalThis.window=globalThis;globalThis.document=undefined;
const root=new URL('../../../',import.meta.url).pathname;
const _l=console.log,_w=console.warn;console.log=()=>{};console.warn=()=>{};
const {generateQuestionFor}=await import(root+'js/modules/generate-question.js');
const SO=await import(root+'js/modules/skill-options.js');
console.log=_l;console.warn=_w;
const strip=s=>String(s??'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
export function items(key,opts={},n=6){const [category,skill]=key.split(':');const out=[];
  for(let i=0;i<n;i++){try{const q=generateQuestionFor({category,skill,opts,seed:9100+i*17,itemIndex:i});
    const pay=q.cell?JSON.stringify(q.cell.payload).replace(/"/g,'').slice(0,90):'';
    out.push(`${strip(q.text).slice(0,110)} | A=${JSON.stringify(q.ans).slice(0,40)}${pay?' | '+pay:''}`);}catch(e){out.push('ERR '+e.message);}}
  return out;}
function optSummary(key){const [c,s]=key.split(':');let d=[];try{d=SO.optionsFor(c,s)||[];}catch{}
  return d.filter(x=>!x.hidden&&!['level','calculator','skipAfter'].includes(x.id)).map(x=>x.id+(x.values?'['+x.values.map(v=>v.v).join(',')+']':'')+'='+JSON.stringify(x.default)).join('; ');}
const a=process.argv.slice(2);
if(a[0]==='--key'){console.log(a[1],'OPTS:',optSummary(a[1]));for(const l of items(a[1],a[2]?JSON.parse(a[2]):{},+a[3]||6))console.log('  '+l);process.exit(0);}
const [Y,pre,n]=a;const L=JSON.parse(fs.readFileSync(root+`data/curriculum/links/${Y}.json`));
const W=JSON.parse(fs.readFileSync(root+'data/curriculum/wrm-steps.json'));const st={};for(const y of W.years)for(const b of y.blocks)for(const s of b.steps)st[s.id]=s;
for(const[id,s]of Object.entries(L.steps)){if(pre&&!id.startsWith(pre))continue;const w=st[id];
  console.log(`\n## ${id} ${s.title} [${s.verdict}] ccss=${(w.ccss||[]).join(',')}\n  vocab: ${(w.vocab||[]).join(", ").slice(0,160)}${s.build.length?'\n  build: '+s.build.join(','):''}`);
  for(const d of [...s.direct.map(x=>({...x,k:'D'})),...s.partial.map(x=>({...x,k:'P'}))]){const o={...(d.opts||{})};delete o.note;
    console.log(`  ${d.k} ${d.key} ${JSON.stringify(d.opts||{})}${d.missing?' missing: '+d.missing:''}\n    OPTS: ${optSummary(d.key)}`);
    for(const l of items(d.key,o,+n||6))console.log('    - '+l);}}
