const { chromium } = require('playwright'); const { serve, sleep, openPanel, boot } = require('./common.cjs');
(async()=>{ const {srv,base}=await serve(process.env.ROOT); const b=await chromium.launch({ignoreDefaultArgs:['--hide-scrollbars'],args:['--enable-features=OverlayScrollbar']});
 const ctx=await b.newContext({viewport:{width:1366,height:768},deviceScaleFactor:1}); const page=await ctx.newPage(); await boot(page,base);
 await openPanel(page,'data_analysis','histogram_read');
 await page.locator('#skillOptionsPopover [data-sko-part="1"]').first().click(); await sleep(400);
 const fr=page.locator('#skillOptionsPopover .tv-sko-frame'); const bb=await fr.boundingBox(); console.log('bb',bb, await fr.evaluate(f=>[f.scrollWidth,f.clientWidth]));
 const cdp=await ctx.newCDPSession(page); const x=Math.round(bb.x+bb.width*0.7), y=Math.round(bb.y+bb.height/2);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let i=1;i<=10;i++){ await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*20,y}]}); await sleep(16);} 
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await sleep(500);
 console.log('after touch drag scrollLeft', await fr.evaluate(f=>f.scrollLeft));
 await fr.evaluate(f=>f.scrollLeft=0); await sleep(3000);
 await page.locator('#skillOptionsPopover .tv-sko-sample').first().screenshot({path:process.env.OUT+'/hist-1366-overlay-after3s.png'});
 await b.close(); srv.close(); })();
