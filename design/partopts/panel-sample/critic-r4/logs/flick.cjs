const { chromium } = require('playwright'); const { serve, sleep, boot } = require('./common.cjs');
(async()=>{ const {srv,base}=await serve(process.env.ROOT); const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1280,height:1000}}); const page=await ctx.newPage(); await boot(page,base);
 for(const [c,s] of [['data_analysis','histogram_read'],['coordinates','coordinates_read_all'],['multiplication','mult_facts'],['graphs','pie_chart']]){
  await page.evaluate(() => { if (window.closeSkillOptionsPanel) window.closeSkillOptionsPanel(); });
  await page.evaluate(({ c, s }) => { if (!document.body.classList.contains('teacher-mode') && window.toggleUserRole) window.toggleUserRole(); const k = (window.SKILLS[c] || []).find(x => x.v === s); window.UnifiedSkills.clear(); window.UnifiedSkills.add({ domainId: 'x', categoryId: c, skillId: s, skillLabel: k ? k.l : s, categoryIcon: '', categoryName: c, domainColor: '#8b5cf6' }); window.UnifiedSkills._syncAllImmediate(); window.tvGo('sets'); }, { c, s });
  const sel = `.tv-opt-btn[data-key="${c}|${s}"]`; await page.waitForSelector(sel);
  await page.evaluate(sel=>{ window.__log=[]; const t0=performance.now(); const poll=()=>{ const f=document.querySelector('#skillOptionsPopover .tv-sko-frame'); const st=f&&f.querySelector('.tvp-stage'); if(f&&st){const a=f.getBoundingClientRect(), b=st.getBoundingClientRect(); const ix=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)), iy=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)); window.__log.push([Math.round(performance.now()-t0), +(ix*iy/Math.max(1,Math.min(b.width*b.height,a.width*a.height))).toFixed(2), st.style.transform.slice(0,40)]);} if(performance.now()-t0<2500) requestAnimationFrame(poll);}; document.querySelector(sel).click(); requestAnimationFrame(poll); setTimeout(()=>{const n=document.querySelector('#skillOptionsPopover .tv-sko-part:not([hidden]) [data-sko-part="1"]'); if(n) n.click();}, +(window.__NEXT||200)); }, sel);
  await sleep(2700);
  const log=await page.evaluate(()=>window.__log); const low=log.filter(x=>x[1]<0.5);
  let ch=[]; let prev=''; for(const x of log){ const k=x[1]+'|'+x[2]; if(k!==prev){ch.push(x.join(' ')); prev=k;} }
  console.log(s, 'frames', log.length, 'below50%:', low.length, low.length? `from ${low[0][0]}ms to ${low[low.length-1][0]}ms`:''); console.log('   '+ch.slice(0,12).join('\n   '));
 }
 await b.close(); srv.close(); })();
