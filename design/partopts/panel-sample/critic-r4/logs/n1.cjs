const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
const { serve, sleep, openPanel, boot } = require('./common.cjs');
const ROOT=process.env.ROOT, OUT=process.env.OUT; fs.mkdirSync(OUT,{recursive:true});
const SKILLS=process.env.SKILLS.split(',');
const VPS=(process.env.VPS||'1280x1000,1366x768,1024x768,820x1180,1280x720').split(',');
const M = () => {
  const pop=document.getElementById('skillOptionsPopover'); const frame=pop&&pop.querySelector('.tv-sko-frame'); if(!frame) return {noframe:1};
  const stage=frame.querySelector('.tvp-stage'); const cs=getComputedStyle(frame);
  const fb=frame.getBoundingClientRect();
  const bl=parseFloat(cs.borderLeftWidth), bt=parseFloat(cs.borderTopWidth);
  const inner={l:fb.left+bl+0, t:fb.top+bt, r:fb.left+bl+frame.clientWidth, b:fb.top+bt+frame.clientHeight};
  const o={part: (pop.querySelector('.tv-sko-part:not([hidden]) .tv-sko-part-n')||{}).textContent||'', isScroll: frame.classList.contains('is-scroll'),
    ovx: cs.overflowX, sw: frame.scrollWidth, cw: frame.clientWidth, sh: frame.scrollHeight, ch: frame.clientHeight,
    sbH: frame.offsetHeight-frame.clientHeight-bt-parseFloat(cs.borderBottomWidth), sbW: frame.offsetWidth-frame.clientWidth-bl-parseFloat(cs.borderRightWidth),
    tabindex: frame.getAttribute('tabindex'), role: frame.getAttribute('role'), aria: frame.getAttribute('aria-label'), touchAction: cs.touchAction,
    sbStyle: cs.scrollbarWidth+'/'+cs.scrollbarColor, sliced: frame.querySelectorAll('svg[data-sko-vb]').length,
    frameH: Math.round(fb.height), frameW: Math.round(fb.width)};
  // cue elements: anything in popover mentioning scroll / arrow cues
  o.cue = [...pop.querySelectorAll('*')].filter(e=>e.offsetParent && /scroll|swipe|more →|→/i.test((e.getAttribute('aria-label')||'')+' '+(e.childElementCount?'':e.textContent))).map(e=>e.className+':'+(e.textContent||'').trim().slice(0,30)).slice(0,4);
  // texts: visible fully, partially (cut), hidden (scrolled out)
  let full=0, part=[], hid=[]; let minPx=99, minT='';
  const tw=document.createTreeWalker(stage||frame, NodeFilter.SHOW_TEXT); let n;
  while((n=tw.nextNode())){ const t=n.textContent.trim(); if(!t) continue; const el=n.parentElement; const r=document.createRange(); r.selectNodeContents(n); const b=r.getBoundingClientRect(); if(!b.width) continue;
    const fs_=parseFloat(getComputedStyle(el).fontSize); const svg=el.closest('svg'); let px=fs_; if(svg&&el.getScreenCTM){const m=el.getScreenCTM(); px=fs_*Math.hypot(m.a,m.b);} else { const lw=el.offsetWidth; if(lw) px=fs_*el.getBoundingClientRect().width/lw; }
    if(px<minPx){minPx=px;minT=t.slice(0,15);}
    const inside=b.left>=inner.l-1&&b.right<=inner.r+1&&b.top>=inner.t-1&&b.bottom<=inner.b+1;
    const none=b.right<=inner.l+1||b.left>=inner.r-1||b.bottom<=inner.t+1||b.top>=inner.b-1;
    if(inside) full++; else if(none) hid.push(t.slice(0,12)); else part.push(t.slice(0,12)); }
  // svg text cut by own svg viewport (if svg overflow hidden)
  const svgCut=[]; for(const svg of (stage||frame).querySelectorAll('svg')){ const ov=getComputedStyle(svg).overflow; if(ov==='visible') continue; const sb=svg.getBoundingClientRect(); for(const t of svg.querySelectorAll('text')){const b=t.getBoundingClientRect(); if(!b.width) continue; if(b.left<sb.left-1||b.right>sb.right+1||b.top<sb.top-1||b.bottom>sb.bottom+1) svgCut.push(t.textContent.trim().slice(0,12));}}
  // shapes partially outside the frame inner box (only for non-scroll)
  o.full=full; o.partCut=part.slice(0,8); o.hidden=hid.length; o.hiddenSample=hid.slice(0,8); o.svgCut=svgCut.slice(0,6); o.minPx=+minPx.toFixed(1); o.minT=minT;
  o.done=[...pop.querySelectorAll('.tv-sko-foot button')].every(b=>{const r=b.getBoundingClientRect(); return r.bottom<=innerHeight&&r.right<=innerWidth&&r.top>=0;});
  o.hscrollPage=document.documentElement.scrollWidth>innerWidth+1;
  return o; };
(async()=>{ const {srv,base}=await serve(ROOT); const browser=await chromium.launch(process.env.REALSB?{ignoreDefaultArgs:['--hide-scrollbars']}:{}); const res=[];
 for(const v of VPS){ const [w,h,mode]=v.split('x'); const touch=mode==='t';
  const ctx=await browser.newContext({viewport:{width:+w,height:+h}, deviceScaleFactor:1, hasTouch:touch, isMobile:touch});
  const page=await ctx.newPage(); const errs=[]; page.on('pageerror',e=>errs.push(String(e).slice(0,120)));
  await boot(page,base);
  for(const ref of SKILLS){ const [c,s]=ref.split(':'); const tag=`${s}-${v}`; const rec={ref,vp:v,parts:[]};
   try{ await openPanel(page,c,s);
    for(let i=1;i<20;i++){ const m=await page.evaluate(M); rec.parts.push(m);
      if(process.env.SHOT && m.isScroll){ await page.locator('#skillOptionsPopover .tv-sko-sample').first().screenshot({path:path.join(OUT,`${tag}-p${i}.png`)}).catch(()=>{}); }
      if(m.isScroll && process.env.SCROLLTEST){
        // keyboard: focus frame and press ArrowRight
        const fr=page.locator('#skillOptionsPopover .tv-sko-frame');
        const kb=await fr.evaluate(f=>{f.focus(); return document.activeElement===f;});
        await page.keyboard.press('ArrowRight'); await sleep(200); const sl1=await fr.evaluate(f=>f.scrollLeft);
        // tab reachability: count tabs from Previous/first control until frame focused
        await fr.evaluate(f=>{f.scrollLeft=0;});
        // touch / wheel
        const bb=await fr.boundingBox(); let sl2=-1;
        if(touch){ const cdp=await ctx.newCDPSession(page); await cdp.send('Input.synthesizeScrollGesture',{x:Math.round(bb.x+bb.width/2),y:Math.round(bb.y+bb.height/2),xDistance:-150,yDistance:0,gestureSourceType:'touch',speed:800}); await sleep(300); sl2=await fr.evaluate(f=>f.scrollLeft); }
        else { await page.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2); await page.keyboard.down('Shift'); await page.mouse.wheel(0,200); await page.keyboard.up('Shift'); await sleep(300); sl2=await fr.evaluate(f=>f.scrollLeft); }
        const tabReach=await page.evaluate(async()=>{const pop=document.getElementById('skillOptionsPopover'); const f=pop.querySelector('.tv-sko-frame'); return f.tabIndex;});
        rec.scroll={tabIndex:tabReach,focusable:kb, arrowScrollLeft:sl1, gestureScrollLeft:sl2};
        if(process.env.SHOT){ await fr.evaluate(f=>{f.scrollLeft=f.scrollWidth;}); await sleep(150); await page.locator('#skillOptionsPopover .tv-sko-sample').first().screenshot({path:path.join(OUT,`${tag}-p${i}-end.png`)}).catch(()=>{}); await fr.evaluate(f=>{f.scrollLeft=0;}); }
      }
      const nb=page.locator('#skillOptionsPopover .tv-sko-part:not([hidden]) [data-sko-part="1"]').first();
      if(!(await nb.count())||!(await nb.isVisible())||await nb.isDisabled()) break;
      await nb.click(); await sleep(300); }
   }catch(e){rec.error=String(e).slice(0,150);}
   rec.errs=errs.splice(0); res.push(rec);
   const P=rec.parts; console.log(ref.padEnd(36),v.padEnd(10),`parts=${P.length}`, P.map(p=>`[${p.isScroll?'SCROLL '+p.sw+'/'+p.cw+'x'+p.sh+'/'+p.ch+' sb='+p.sbH+','+p.sbW:'whole'} min=${p.minPx} cut=${p.partCut.join('/')||'-'} hid=${p.hidden} svgcut=${p.svgCut.join('/')||'-'} sl=${p.sliced}]`).join(' '), rec.scroll?JSON.stringify(rec.scroll):'', rec.error||'', rec.errs.length?'ERR '+rec.errs[0]:'');
  }
  await ctx.close(); }
 fs.writeFileSync(path.join(OUT,'n1.json'),JSON.stringify(res,null,1)); await browser.close(); srv.close(); })();
