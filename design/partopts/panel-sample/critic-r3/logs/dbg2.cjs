const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=process.argv[2];
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${srv.address().port}`;const b=await chromium.launch();
 for (const [w,h] of [[1280,1000],[820,1180]]) {
 const ctx=await b.newContext({viewport:{width:w,height:h}});const page=await ctx.newPage();
 await page.goto(base+'/index.html');await page.waitForFunction(()=>window.UnifiedSkills&&window.tvGo);await sleep(800);
 for (const [c,s] of [['coordinates','geo_translate'],['multiplication','mult_chart_easy'],['fractions','fraction_of_set']]) {
 await page.evaluate(({c,s})=>{ if(window.closeSkillOptionsPanel)window.closeSkillOptionsPanel(); if(!document.body.classList.contains('teacher-mode'))window.toggleUserRole();const k=window.SKILLS[c].find(x=>x.v===s);window.UnifiedSkills.clear();window.UnifiedSkills.add({domainId:'x',categoryId:c,skillId:s,skillLabel:k.l,categoryIcon:'',categoryName:c,domainColor:'#8b5cf6'});window.UnifiedSkills._syncAllImmediate();window.tvGo('sets');},{c,s});
 const sel=`.tv-opt-btn[data-key="${c}|${s}"]`;await page.waitForSelector(sel); await page.locator(sel).first().click(); await sleep(1500);
 const r=await page.evaluate(()=>{const p=document.getElementById('skillOptionsPopover');const t=p.querySelector('.sko-tip');let a=t.parentElement;while(a&&getComputedStyle(a).position==='static')a=a.parentElement;
  const ctrls=[...p.querySelectorAll('.tv-sko-body input, .tv-sko-body select, .tv-sko-body button:not(.sko-tip)')].filter(e=>e.offsetParent);
  let blocked=0, tot=0, ex=[];for(const e of ctrls){const r=e.getBoundingClientRect(); if(r.bottom<0||r.top>innerHeight)continue; tot++; const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2); if(hit&&hit!==e&&!e.contains(hit)&&!(hit.tagName==='LABEL'&&hit.contains(e))&&!(e.closest('label')&&e.closest('label').contains(hit))){blocked++; if(ex.length<3) ex.push((e.tagName+' '+(e.closest('label')||e).textContent.trim()).slice(0,30)+' -> '+hit.className);} }
  return {tipPos:getComputedStyle(t).position, cb:a&&(a.id||a.className), blocked, tot, ex};});
 console.log(w,s,JSON.stringify(r));
 }
 await ctx.close();}
 await b.close();srv.close();})();
