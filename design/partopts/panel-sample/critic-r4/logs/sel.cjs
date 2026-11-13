const { chromium } = require('playwright'); const { serve, sleep, openPanel, boot } = require('./common.cjs');
(async()=>{ const {srv,base}=await serve(process.env.ROOT); const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1280,height:1000}}); const page=await ctx.newPage(); await boot(page,base);
 for(const [c,s] of [['counting','count_objects'],['comparing','compare_groups'],['subtraction','subtract']]){
  await openPanel(page,c,s);
  const sel=page.locator('#skillOptionsPopover .tv-sko-body select').first();
  console.log(s, await sel.evaluate(e=>({label:(e.closest('[role=group]')||{}).getAttribute?.('aria-label'), val:e.value, idx:e.selectedIndex, opts:[...e.options].map(o=>o.value+(o.disabled?'(dis)':''))})));
  const bx=await sel.boundingBox(); await page.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2); await sleep(150); await page.keyboard.press('ArrowUp'); await page.keyboard.press('Enter'); await sleep(500);
  console.log('  after ArrowUp', await sel.evaluate(e=>e.value), await page.evaluate(()=>document.querySelector('#skillOptionsPopover .tv-sko-sum').textContent.trim().slice(0,80)));
 }
 await b.close(); srv.close(); })();
