const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=process.argv[2]; const TAG=process.argv[3];
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${srv.address().port}`;const b=await chromium.launch();
 for (const [w,h,touch] of [[1280,1000,false],[820,1180,true]]) {
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:touch});const page=await ctx.newPage();
 await page.goto(base+'/index.html');await page.waitForFunction(()=>window.UnifiedSkills&&window.tvGo);await sleep(800);
 const [c,s]=['multiplication','mult_chart_easy'];
 await page.evaluate(({c,s})=>{ if(!document.body.classList.contains('teacher-mode'))window.toggleUserRole();const k=window.SKILLS[c].find(x=>x.v===s);window.UnifiedSkills.clear();window.UnifiedSkills.add({domainId:'x',categoryId:c,skillId:s,skillLabel:k.l,categoryIcon:'',categoryName:c,domainColor:'#8b5cf6'});window.UnifiedSkills._syncAllImmediate();window.tvGo('sets');},{c,s});
 const sel=`.tv-opt-btn[data-key="${c}|${s}"]`;await page.waitForSelector(sel); await page.locator(sel).first().click(); await sleep(1500);
 // the "1" checkbox in Tables with blanks
 const cb=page.locator('#skillOptionsPopover .tv-sko-body input[type=checkbox]').first(); await cb.scrollIntoViewIfNeeded(); await sleep(300);
 const bx=await cb.boundingBox(); const before=await cb.isChecked();
 if(touch) await page.touchscreen.tap(bx.x+bx.width/2,bx.y+bx.height/2); else await page.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);
 await sleep(1200);
 const after=await cb.isChecked(); const tips=await page.evaluate(()=>[...document.querySelectorAll('#skillOptionsPopover .sko-tip[aria-expanded=true]')].map(t=>t.getAttribute('aria-label')));
 const sum=await page.evaluate(()=>(document.querySelector('#tvSkoSum')||{}).textContent);
 console.log(TAG,w,touch?'tap':'click','checkbox "1"',before,'->',after,'tips open:',tips,'summary:',sum);
 await page.locator('#skillOptionsPopover').screenshot({path:`P1-${TAG}-${w}.png`});
 // and the label text of row "2"
 const lab=page.locator('#skillOptionsPopover .sko-set-row').nth(1); const lb=await lab.boundingBox(); await page.mouse.click(lb.x+12,lb.y+lb.height/2); await sleep(800);
 console.log('   label "2" click ->', await page.locator('#skillOptionsPopover .tv-sko-body input[type=checkbox]').nth(1).isChecked());
 await ctx.close();}
 await b.close();srv.close();})();
