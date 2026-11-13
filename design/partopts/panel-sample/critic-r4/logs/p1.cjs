const { chromium } = require('playwright'); const { serve, sleep, openPanel, boot } = require('./common.cjs');
const SK=['multiplication:mult_chart_easy','coordinates:geo_translate','fractions:fraction_of_set'];
(async()=>{ const {srv,base}=await serve(process.env.ROOT); const b=await chromium.launch();
 for(const [w,h,touch] of [[1280,1000,false],[820,1180,true]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:touch,isMobile:touch,deviceScaleFactor:1}); const page=await ctx.newPage(); await boot(page,base);
  for(const ref of SK){ const [c,s]=ref.split(':'); await openPanel(page,c,s);
   // list rows with a tip
   const rows=await page.evaluate(()=>[...document.querySelectorAll('#skillOptionsPopover .tv-sko-row.sko-has-tip')].map((r,i)=>i));
   let lines=[]; console.log(w, touch?'touch':'mouse', ref, 'rows', rows.length);
   for(const ri of rows){
    const ctls=await page.evaluate(ri=>{const r=document.querySelectorAll('#skillOptionsPopover .tv-sko-row.sko-has-tip')[ri]; if(!r) return []; return [...r.querySelectorAll('input[type=checkbox],input[type=radio],select,button:not(.sko-tip)')].filter(e=>{const b=e.getBoundingClientRect(); return b.width&&b.height&&!e.closest('details:not([open])');}).map((e,j)=>({j,tag:e.tagName+(e.type?':'+e.type:''),t:(e.textContent||e.value||'').trim().slice(0,10)}));},ri);
    // test first checkbox, first button (All/None), first select
    const pickIdx=[]; for(const k of ['INPUT:checkbox','INPUT:radio','BUTTON:button','SELECT:select-one']){ const f=ctls.filter(x=>x.tag===k); if(f.length) pickIdx.push(f[0]); const g=ctls.filter(x=>x.tag==='BUTTON:button'&&/none/i.test(x.t)); if(k==='BUTTON:button'&&g.length&&g[0]!==f[0]) pickIdx.push(g[0]); }
    for(const ct of pickIdx){
     const info=await page.evaluate(({ri,j})=>{const r=document.querySelectorAll('#skillOptionsPopover .tv-sko-row.sko-has-tip')[ri]; if(!r) return null; const e=[...r.querySelectorAll('input[type=checkbox],input[type=radio],select,button:not(.sko-tip)')].filter(e=>{const b=e.getBoundingClientRect(); return b.width&&b.height&&!e.closest('details:not([open])');})[j]; e.scrollIntoView({block:'center'}); const b=e.getBoundingClientRect(); const x=b.left+b.width/2,y=b.top+b.height/2; const hit=document.elementFromPoint(x,y); const st=()=>{const r=document.querySelectorAll('#skillOptionsPopover .tv-sko-row.sko-has-tip')[ri]; if(!r) return 'gone'; return [...r.querySelectorAll('input')].map(i=>i.checked?1:0).join('')+'|'+[...r.querySelectorAll('select')].map(s=>s.value).join(',');}; window.__st=st; window.__e=e; return {x,y,hitOk: hit===e||e.contains(hit)||(hit&&hit.closest('label')&&hit.closest('label').contains(e)), hit: hit&&(hit.tagName+'.'+hit.className).slice(0,40), before: st()};},{ri,j:ct.j});
     if(!info||info.x===undefined) continue; if(touch) await page.touchscreen.tap(info.x,info.y); else await page.mouse.click(info.x,info.y);
     if(ct.tag.startsWith('SELECT')){ await sleep(150); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); }
     await sleep(350);
     const after=await page.evaluate(()=>({st: window.__st(), focus: document.activeElement===window.__e, tips:[...document.querySelectorAll('#skillOptionsPopover .sko-tip[aria-expanded="true"]')].map(t=>t.getAttribute('aria-label')), }));
     
     console.log(`  row${ri} ${ct.tag} "${ct.t}" hit=${info.hitOk?'ok':'MISS('+info.hit+')'} state ${info.before} -> ${after.st} ${ct.tag.startsWith('SELECT')?'focus='+after.focus:''} tipsOpen=${JSON.stringify(after.tips)}`);
     await sleep(1200);
    }
    // the ? itself
    const q=await page.evaluate(ri=>{const r=document.querySelectorAll('#skillOptionsPopover .tv-sko-row.sko-has-tip')[ri]; if(!r) return null; const t=r.querySelector('.sko-tip'); t.scrollIntoView({block:'center'}); const b=t.getBoundingClientRect(); return {x:b.left+b.width/2,y:b.top+b.height/2,w:b.width};},ri);
    if(!q){console.log('  row gone',ri, await page.evaluate(()=>!!document.getElementById('skillOptionsPopover'))); continue;} if(touch) await page.touchscreen.tap(q.x,q.y); else await page.mouse.click(q.x,q.y); await sleep(300);
    const tip=await page.evaluate(ri=>{const r=document.querySelectorAll('#skillOptionsPopover .tv-sko-row.sko-has-tip')[ri]; if(!r) return 'gone'; const t=r.querySelector('.sko-tip'); const line=r.querySelector('.sko-tip-text'); return t.getAttribute('aria-expanded')+' line='+(line&&!line.hidden);},ri);
    // hit area size of ?:after
    console.log(`  row${ri} "?" tap -> expanded=${tip}`);
    if(touch) await page.touchscreen.tap(q.x,q.y); else await page.mouse.click(q.x,q.y); await sleep(200);
   }
   
  }
  await ctx.close(); }
 await b.close(); srv.close(); })();
