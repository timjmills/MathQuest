const { chromium } = require('playwright'); const { serve, sleep, openPanel, boot } = require('./common.cjs');
(async()=>{ const {srv,base}=await serve(process.env.ROOT); const b=await chromium.launch(); console.log('chromium', b.version());
 const ctx=await b.newContext({viewport:{width:1280,height:1000}}); const page=await ctx.newPage(); await boot(page,base);
 await openPanel(page,'data_analysis','histogram_read');
 await page.locator('#skillOptionsPopover [data-sko-part="1"]').first().click(); await sleep(400);
 await page.locator('#skillOptionsPopover [data-sko-part="-1"]').first().focus();
 const seq=[]; for(let i=0;i<4;i++){ await page.keyboard.press('Tab'); seq.push(await page.evaluate(()=>{const a=document.activeElement; return a.tagName+'.'+String(a.className).slice(0,25)+' '+(a.getAttribute('aria-label')||a.textContent||'').trim().slice(0,20);})); }
 console.log(seq.join('\n'));
 // is the frame in tab order?
 await page.locator('#skillOptionsPopover .tv-sko-frame').focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await sleep(200);
 console.log('after 2x ArrowRight scrollLeft', await page.evaluate(()=>document.querySelector('#skillOptionsPopover .tv-sko-frame').scrollLeft), 'focus ring', await page.evaluate(()=>getComputedStyle(document.querySelector('#skillOptionsPopover .tv-sko-frame')).outlineStyle));
 await b.close(); srv.close(); })();
