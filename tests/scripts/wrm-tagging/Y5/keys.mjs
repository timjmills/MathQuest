globalThis.localStorage={getItem(){return null},setItem(){}};globalThis.window=globalThis;globalThis.document={};
const R=new URL('../../../../js/modules/',import.meta.url).pathname;
const fs=await import('fs');
const d=await import(R+'data.js');const w=await import(R+'wrm.js');const b=await import(R+'build-list.js');
const keys={};for(const[c,a] of Object.entries(d.SKILLS)) for(const s of a) if(s&&!s.retired) keys[c+':'+s.v]=s.l;
const props={};for(const n of ['STANDARD_PROPOSALS','WRM_EXTENSIONS','VISUAL_BUILDS']) for(const[k,v] of Object.entries(b[n]||{})) props[k]={...v,_src:n};
for(const[k,v] of Object.entries(w.WRM_PROPOSALS)) props[k]={...v,_src:'WRM_PROPOSALS'};
// critic r5 class F: each skill's numeric band values (smallest first), so the build can step a link one band down
const so=await import(R+'skill-options.js');const bands={};for(const k of Object.keys(keys)){const[c,s]=k.split(':');const b=(so.optionsFor(c,s)||[]).find(x=>x.id==='band');if(b&&b.values)bands[k]=b.values.map(x=>x.v).filter(v=>typeof v==='number').sort((a,z)=>a-z);}
fs.writeFileSync(process.argv[2],JSON.stringify({keys,props,tags:w.SKILL_WRM,bands}));
