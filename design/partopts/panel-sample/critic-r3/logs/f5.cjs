const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const ROOT='/home/user/wt-critic-r3'; const OUT=path.join(__dirname,'F5'); fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${srv.address().port}`;const b=await chromium.launch();
for (const [w,h,touch] of [[1280,1000,false],[820,1180,true],[1024,768,true]]) {
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:touch,deviceScaleFactor:1});const page=await ctx.newPage();
 await page.goto(base+'/index.html');await page.waitForFunction(()=>window.UnifiedSkills&&window.tvGo);await sleep(800);
 for (const [c,s] of [['multiplication','mult_chart_easy'],['algebra_mixed','algebra_all']]) {
 await page.evaluate(({c,s})=>{ if(window.closeSkillOptionsPanel)window.closeSkillOptionsPanel(); if(!document.body.classList.contains('teacher-mode'))window.toggleUserRole();const k=window.SKILLS[c].find(x=>x.v===s);window.UnifiedSkills.clear();window.UnifiedSkills.add({domainId:'x',categoryId:c,skillId:s,skillLabel:k.l,categoryIcon:'',categoryName:c,domainColor:'#8b5cf6'});window.UnifiedSkills._syncAllImmediate();window.tvGo('sets');},{c,s});
 const sel=`.tv-opt-btn[data-key="${c}|${s}"]`;await page.waitForSelector(sel);
 await page.locator(sel).first().click(); await sleep(1500);
 // untick every other checkbox in the body to lengthen the summary
 const boxes=page.locator('#skillOptionsPopover .tv-sko-body input[type=checkbox]'); const n=await boxes.count();
 for(let i=1;i<n && i<14;i+=2){ const bx=boxes.nth(i); await bx.scrollIntoViewIfNeeded(); await bx.focus(); await page.keyboard.press('Space'); await sleep(150);} 
 await sleep(1500);
 const st=()=>page.evaluate(()=>{const p=document.getElementById('skillOptionsPopover');const s=p.querySelector('.tv-sko-sum'),m=p.querySelector('.tv-sko-more');const d=[...p.querySelectorAll('.tv-sko-foot button')].pop().getBoundingClientRect();return {txt:s.textContent,clamped:s.scrollHeight>s.clientHeight+1,h:s.clientHeight,more:m&&!m.hidden?{t:m.textContent,exp:m.getAttribute('aria-expanded'),r:(()=>{const r=m.getBoundingClientRect();return [r.width,r.height].map(Math.round)})()}:null,doneBottom:Math.round(d.bottom),vh:innerHeight};});
 const s0=await st(); console.log(w,s,'after changes',JSON.stringify(s0));
 await page.locator('#skillOptionsPopover').screenshot({path:path.join(OUT,`${s}-${w}-clamped.png`)});
 if(s0.more){
   // keyboard: focus by Tab from the title area
   await page.focus('#skillOptionsPopover .tv-sko-head button, #skillOptionsPopover button'); let reached=false;
   for(let k=0;k<6;k++){ const a=await page.evaluate(()=>document.activeElement&&document.activeElement.className); if(/tv-sko-more/.test(a)){reached=true;break;} await page.keyboard.press('Shift+Tab'); }
   if(!reached){ await page.focus('#skillOptionsPopover .tv-sko-more'); }
   console.log('  keyboard reached Show all by Tab:',reached);
   await page.keyboard.press('Enter'); await sleep(300); const s1=await st(); console.log('  after Enter',JSON.stringify(s1).slice(0,300));
   await page.locator('#skillOptionsPopover').screenshot({path:path.join(OUT,`${s}-${w}-open.png`)});
   if(touch){ await page.locator('#skillOptionsPopover .tv-sko-more').tap(); await sleep(300); console.log('  after tap',JSON.stringify(await st()).slice(0,200)); }
 }
 }
 await ctx.close();}
await b.close();srv.close();})();
