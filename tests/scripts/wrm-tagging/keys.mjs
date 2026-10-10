globalThis.localStorage={getItem(){return null},setItem(){}};globalThis.window=globalThis;globalThis.document={};
const R='/home/user/MathQuest/.claude/worktrees/agent-aa09d8d25584eba48/js/modules/';
const fs=await import('fs');
const d=await import(R+'data.js');const w=await import(R+'wrm.js');const b=await import(R+'build-list.js');
const keys={};for(const[c,a] of Object.entries(d.SKILLS)) for(const s of a) if(s&&!s.retired) keys[c+':'+s.v]=s.l;
const props={};for(const n of ['STANDARD_PROPOSALS','WRM_EXTENSIONS','VISUAL_BUILDS']) for(const[k,v] of Object.entries(b[n]||{})) props[k]={...v,_src:n};
for(const[k,v] of Object.entries(w.WRM_PROPOSALS)) props[k]={...v,_src:'WRM_PROPOSALS'};
fs.writeFileSync(process.argv[2],JSON.stringify({keys,props,tags:w.SKILL_WRM}));
