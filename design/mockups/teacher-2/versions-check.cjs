// node design/mockups/teacher-2/versions-check.cjs — lane check (T3b): 3 worksheet versions give 3 different first pages
// and the same item count per skill, for Mixed / Sections / Single (pages) and Mixed (problems in all).
// N worksheet versions -> N different first pages, identical item counts per skill (owner 2026-10-24)
const H=require(require('path').resolve(__dirname,'../../../tests/lib/ws-harness.cjs'));
const THREE=[['addition','add_facts'],['subtraction','sub_facts'],['multiplication','mult_facts']];
(async()=>{
 const {page,close}=await H.open({viewport:{width:1366,height:768,deviceScaleFactor:1}});
 page.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,300))); page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,300))});
 await page.evaluate(()=>window.setUserRole('teacher'));
 let bad=0;
 for (const [kind,mode] of [['mixed','pages'],['sections','pages'],['single','pages'],['mixed','total']]) {
  const sk = kind==='single'? THREE.slice(0,1): THREE;
  await page.evaluate((sk)=>{tvCloseSheet(); UnifiedSkills.clear(); for(const [c,s] of sk){UnifiedSkills.add({categoryId:c,skillId:s,skillLabel:s});} window.skillQueue=[...UnifiedSkills.skills];},sk);
  await page.evaluate(()=>tvOpenSheet('print'));
  const clickV=async(sel)=>{await page.evaluate((sel)=>document.querySelector(sel).click(),sel);};
  await clickV(`[data-act="kind"][data-v="${kind}"]`);
  await clickV(`[data-act="mode"][data-v="${mode}"]`);
  // set Versions to 3 with the stepper (the sheet keeps its settings between opens)
  for (let g=0; g<25; g++) { const n=await page.evaluate(()=>Number(document.querySelector('[data-act="wversions"]').closest('.tvs-stepper').querySelector('output').textContent)); if(n===3) break; await clickV(`[data-act="wversions"][aria-label="${n>3?'Fewer':'More'}"]`); }
  const st=await page.evaluate(async()=>{const b=await tvSheetBuildNow(); return {built:b, summary:tvSheetState().summary};});
  const pv=st.built.perVersion; const firsts=new Set(pv.map(x=>x.firstHash));
  const counts=pv.map(x=>JSON.stringify(Object.entries(x.byKey).sort()));
  const ok = pv.length===3 && firsts.size===3 && new Set(counts).size===1 && st.built.matchesPlan && !st.built.formA;
  if(!ok) bad++;
  console.log(`${ok?'PASS':'FAIL'} ${kind}/${mode}: ${pv.length} versions, ${firsts.size} different first pages, counts ${[...new Set(counts)].join(' | ')} :: ${st.summary.line}`);
 }
 console.log(bad?'versions-check: FAIL':'versions-check: OK');
 await close(); process.exit(bad?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
