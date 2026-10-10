// Regenerate reads_range.json (read by gen.py): node items.mjs --reads-range <every skill key in spec.py> > reads_range.json
// node items.mjs --key cat:skill '{"opt":1,"range":10}' [n]   -> option schema + n generated items
// node items.mjs --links R Y1 [n] [--md file]                  -> every distinct skill+opts in the links files, n items each
// `range` in opts is passed as generateQuestionFor's Max Number (not as a skill option).
import fs from 'fs';
const _m=new Map();globalThis.localStorage={getItem:k=>_m.get(k)??null,setItem:(k,v)=>_m.set(k,String(v)),removeItem:k=>_m.delete(k)};
globalThis.window=globalThis;globalThis.document=undefined;
const root=new URL('../../../',import.meta.url).pathname;
const _l=console.log,_w=console.warn;console.log=()=>{};console.warn=()=>{};
const {generateQuestionFor}=await import(root+'js/modules/generate-question.js');
const SO=await import(root+'js/modules/skill-options.js');
console.log=_l;console.warn=_w;
const strip=s=>String(s??'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
export function items(key,opts={},n=6){const [category,skill]=key.split(':');const o={...opts};const range=o.range??10;delete o.range;const out=[];
  for(let i=0;i<n;i++){try{const q=generateQuestionFor({category,skill,range,opts:o,seed:9100+i*17,itemIndex:i});
    const pay=q.cell?JSON.stringify(q.cell.payload).replace(/"/g,'').slice(0,110):'';
    out.push(`${strip(q.text).slice(0,120)} | A=${JSON.stringify(q.ans).slice(0,40)} | ${q.answerType||''}${pay?' | '+pay:''}`);}catch(e){out.push('ERR '+e.message);}}
  return out;}
function optSummary(key){const [c,s]=key.split(':');let d=[];try{d=SO.optionsFor(c,s)||[];}catch{}
  return d.filter(x=>!x.hidden).map(x=>x.id+(x.values?'['+x.values.map(v=>v.v+(v.label?'='+v.label:'')).join(',')+']':'')+'='+JSON.stringify(x.default)).join('; ');}
const a=process.argv.slice(2);
if(a[0]==='--key'){console.log(a[1],'OPTS:',optSummary(a[1]));for(const l of items(a[1],a[2]?JSON.parse(a[2]):{},+a[3]||6))console.log('  '+l);process.exit(0);}
if(a[0]==='--reads-range'){const out={};for(const k of a.slice(1)){const x=items(k,{range:10},6).join('\n'),y=items(k,{range:100},6).join('\n');out[k]=x!==y;}console.log(JSON.stringify(out));process.exit(0);}
if(a[0]==='--links'){const years=a.slice(1).filter(x=>/^(R|Y\d)$/.test(x));const n=+(a.find(x=>/^\d+$/.test(x))||6);const mi=a.indexOf('--md');
  const md=['# R and Y1: generated items per step (wave 2 tagging, round 11)','',
  'Every direct and partial skill of every step, generated with the opts the links file gives: '+n+' items each (seeds 9100 + 17i), the first 3 shown.',
  '"Max Number" is the range passed to generateQuestionFor; "not read" means the skill ignores it (its own band option sets the numbers).',
  'Regenerate: `node tests/scripts/wrm-tagging/items.mjs --links R Y1 6 --md design/audit/runs/wrm-tagging/R-Y1-items.md`.'];
  const seen=new Map();const rr=new Map();const reads=k=>{if(!rr.has(k))rr.set(k,items(k,{range:10},4).join()!==items(k,{range:100},4).join());return rr.get(k);};
  for(const Y of years){const L=JSON.parse(fs.readFileSync(root+`data/curriculum/links/${Y}.json`));
    md.push(`\n## ${Y}\n`);
    for(const[id,s]of Object.entries(L.steps)){const ds=[...s.direct.map(x=>({...x,k:'full'})),...s.partial.map(x=>({...x,k:'partial'}))];
      md.push(`### ${id} ${s.title} — **${s.verdict}**${s.missing?' (missing: '+s.missing+')':''}`);
      if(!ds.length)md.push(`- no live skill; build: ${s.build.join(', ')}`);
      for(const d of ds){const sig=d.key+' '+JSON.stringify(d.opts||{});if(!seen.has(sig))seen.set(sig,items(d.key,d.opts||{},n));const it=seen.get(sig);
        md.push(`- ${d.k} \`${d.key}\` opts \`${JSON.stringify(d.opts||{})}\` (${n} generated; Max Number ${reads(d.key)?((d.opts||{}).range??10):'not read'})`);
        for(const l of it.slice(0,3))md.push(`  - ${l.replace(/\|/g,'/')}`);}
      md.push('');}}
  const txt=md.join('\n');if(mi>=0)fs.writeFileSync(a[mi+1],txt);else console.log(txt);
  console.error('distinct skill+opts generated:',seen.size,'errors:',[...seen.values()].flat().filter(l=>l.startsWith('ERR')).length);}
