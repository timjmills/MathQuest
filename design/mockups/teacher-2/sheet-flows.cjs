// The §2.6 flows, counted in actions INSIDE the sheets (the tray's search / tick / button are T3a's and are added
// by the fixed counts below). node flows.cjs <width> <height>
const H=require(require('path').resolve(__dirname,'../../../tests/lib/ws-harness.cjs'));
const fs=require('fs');
const OUT=process.env.OUT||require('os').tmpdir()+'/sheet-flows'; fs.mkdirSync(OUT,{recursive:true});
const W=Number(process.argv[2]||1366), HH=Number(process.argv[3]||768);
const ONE=[['addition','add_facts']], THREE=[['addition','add_facts'],['subtraction','sub_facts'],['multiplication','mult_facts']];
const FLOWS=[
 // name, skills, before-sheet actions (search+tick per skill + the tray button), sheet, clicks in the sheet, target
 ['one skill + key', ONE, 3, 'print', ['[data-act="print"]'], '4'],
 ['a mixed page of 3', THREE, 4, 'print', ['[data-act="print"]'], '5-8'],
 ['a code for one skill', ONE, 3, 'share', ['[data-act="copylink"]'], '4'],
 ['a set of 3 to pupils', THREE, 4, 'share', ['[data-act="copylink"]'], '5-8'],
 ['board', ONE, 2, 'share', ['[data-act="board"]'], '3-4'],
 ['quiz on paper', ONE, 2, 'quiz', ['[data-act="print"]'], '3-5'],
 ['quiz online', ONE, 2, 'quiz', ['[data-act="quizshare"]','[data-act="copyquiz"]'], '4-6'],
];
(async()=>{
 const {page,close}=await H.open({viewport:{width:W,height:HH,deviceScaleFactor:1}});
 const errs=[]; page.on('pageerror',e=>errs.push(String(e))); page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await page.evaluate(()=>{window.setUserRole('teacher'); window.__printed=0; });
 // count the print dialog instead of opening it
 await page.evaluateOnNewDocument(()=>{});
 for (const [name, sk, pre, sheet, clicks, target] of FLOWS) {
   await page.evaluate((sk)=>{ window.tvCloseSheet&&tvCloseSheet(); document.getElementById('tvBoardOverlay')?.remove(); UnifiedSkills.clear(); for(const [c,s] of sk){ const hit=SKILLS[c].find(x=>x.v===s); UnifiedSkills.add({categoryId:c,skillId:s,skillLabel:hit.l}); } window.skillQueue=[...UnifiedSkills.skills];},sk);
   await page.evaluate((k)=>tvOpenSheet(k),sheet);
   await page.waitForFunction(()=>{const s=tvSheetState(); return s.sheet==='share' ? !!s.share : (s.preview && !s.building);},{timeout:120000});
   let ok=true, n=0;
   for (const sel of clicks) {
     const el=await page.waitForSelector('#tvSheet '+sel+', '+sel,{timeout:30000}).catch(()=>null);
     if(!el){ok=false;break;}
     const vis=await el.evaluate(b=>{const r=b.getBoundingClientRect(); return r.top>=0 && r.bottom<=innerHeight && r.height>=44 && b.getAttribute('aria-disabled')!=='true';});
     if(!vis){ok=false;}
     // print: stub the dialog
     await page.evaluate(()=>{const f=document.getElementById('tvPrintFrame'); if(f) f.contentWindow.print=()=>{window.__printed++;};});
     await el.click(); n++;
     await new Promise(r=>setTimeout(r,1200));
   }
   const res=await page.evaluate(()=>({printed:!!tvSheetState().lastDoc, board:!!document.getElementById('tvBoardOverlay'), quiz:tvSheetState().quizLink.slice(0,60), code:tvSheetState().share&&tvSheetState().share.code}));
   console.log(`${name}: ${pre}+${n} = ${pre+n} (target ${target}) ${ok?'all in view':'NOT IN VIEW'} ${JSON.stringify(res)}`);
   await page.screenshot({path:`${OUT}/flow-${name.replace(/\W+/g,'-')}-${W}.png`});
 }
 console.log('errors', JSON.stringify(errs.slice(0,6)));
 await close();
})().catch(e=>{console.error(e);process.exit(1)});
