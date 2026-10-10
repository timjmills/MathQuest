// node tests/scripts/wrm-tagging/wholes.mjs : checks every "wholes" claim in data/curriculum/links/{R,Y1}.json against
// generated number_bonds items (3 seeds x 64 items per band; critic r11 M10). Prints "wholes: OK" or "wholes: FAIL".
// Claims read: "band N (also) deals wholes A-B" / "A and B" (range = exact min-max; "and" = each appears),
// "number_bonds {band:N} deals wholes A-B", "whole below N", "whole 1 ... never" and "zero part ... never" (band 5 and band 10),
// "in 192 items whole 2 once, 3-5 in 45, 6-10 in 146" (exact counts on the same 192 items).
import fs from 'fs';
const _m=new Map();globalThis.localStorage={getItem:k=>_m.get(k)??null,setItem:(k,v)=>_m.set(k,String(v)),removeItem:k=>_m.delete(k)};
globalThis.window=globalThis;globalThis.document=undefined;
const root=new URL('../../../',import.meta.url).pathname;
const _l=console.log;console.log=()=>{};console.warn=()=>{};
const {generateQuestionFor}=await import(root+'js/modules/generate-question.js');
console.log=_l;
const SEEDS=[2510007,2610011,2710013];   /* the R.B9.S5 note counts these 192 items (round 11) */
const obs={};
for(const band of [5,10]){const c={};let zero=0;
  for(const b of SEEDS)for(let i=0;i<64;i++){const q=generateQuestionFor({category:'composing',skill:'number_bonds',range:10,opts:{band},seed:b+i*37,itemIndex:i,itemCount:64});
    const p=q.cell.payload;c[p.whole]=(c[p.whole]||0)+1;if(p.a===0||p.b===0)zero++;}
  obs[band]={c,zero,min:Math.min(...Object.keys(c).map(Number)),max:Math.max(...Object.keys(c).map(Number))};
  console.log(`number_bonds band ${band}: wholes ${JSON.stringify(c)}, zero parts ${zero} (192 items)`);}
const texts=[];
const walk=(v,where)=>{if(typeof v==='string')texts.push([where,v]);else if(Array.isArray(v))v.forEach((x,i)=>walk(x,where));else if(v&&typeof v==='object')for(const[k,x]of Object.entries(v))walk(x,where+(where.split('.').length<3?'.'+k:''));};
for(const y of ['R','Y1'])walk(JSON.parse(fs.readFileSync(root+`data/curriculum/links/${y}.json`,'utf8')),y);
let n=0;const bad=[];
const sum=(c,a,b)=>Object.entries(c).filter(([w])=>+w>=a&&+w<=b).reduce((s,[,k])=>s+k,0);
for(const [w,t] of texts){
  for(const m of t.matchAll(/(?:band (\d+)|number_bonds \{band:(\d+)\}) (?:also )?deals wholes (\d+)(-| and )(\d+)/g)){
    const band=+(m[1]||m[2]),a=+m[3],b=+m[5],o=obs[band];n++;
    if(!o){bad.push([w,m[0],'band not generated']);continue;}
    if(m[4]==='-'?(o.min!==a||o.max!==b):!(o.c[a]&&o.c[b]))bad.push([w,m[0],`observed ${o.min}-${o.max}`]);}
  for(const m of t.matchAll(/whole below (\d+)/g)){n++;const lo=Math.min(obs[5].min,obs[10].min);if(lo<+m[1])bad.push([w,m[0],`whole ${lo} dealt`]);}
  if(/whole 1[^.;)]*never|never deals whole 1/.test(t)){n++;if(obs[5].c[1]||obs[10].c[1])bad.push([w,'whole 1 never','whole 1 dealt']);}
  if(/zero part[^.;)]*never|never[^.;)]*zero part/.test(t)){n++;if(obs[5].zero||obs[10].zero)bad.push([w,'zero part never','zero part dealt']);}
  for(const m of t.matchAll(/in 192 items whole 2 (once|\d+), 3-5 in (\d+), 6-10 in (\d+)/g)){n++;const c=obs[10].c;
    const w2=m[1]==='once'?1:+m[1];if((c[2]||0)!==w2||sum(c,3,5)!==+m[2]||sum(c,6,10)!==+m[3])bad.push([w,m[0],`observed whole 2 ${c[2]||0}, 3-5 ${sum(c,3,5)}, 6-10 ${sum(c,6,10)}`]);}
}
for(const b of bad)console.log('FALSE',b.join(' | '));
console.log(`claims checked ${n}, false ${bad.length}`);
console.log(bad.length?'wholes: FAIL':'wholes: OK');process.exit(bad.length?1:0);
