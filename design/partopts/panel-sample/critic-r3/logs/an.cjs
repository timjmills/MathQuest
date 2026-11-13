const fs=require('fs');const R=[...(process.env.DIRS||'A,B,C').split(',').flatMap(d=>JSON.parse(fs.readFileSync(d+'/results.json')))];
for(const r of R){const flags=[];let minH=99,minS=99,parts=0;
 for(const m of r.reads){ if(m.nopop){flags.push(m.at+' NOPOP');continue;}
  if(m.part) parts=Math.max(parts,+(m.part.split(' of ')[1]||0));
  if(m.minHtml<minH)minH=m.minHtml; if(m.minSvg<minS)minS=m.minSvg;
  if(m.minHtml<9)flags.push(`${m.at} html ${m.minHtml}"${m.minHtmlT}"`);
  if(m.minSvg<9)flags.push(`${m.at} svg ${m.minSvg}"${m.minSvgT}"`);
  if(m.clips&&m.clips.length)flags.push(`${m.at} CLIP ${m.clips[0]}`);
  if(m.cut&&m.cut.length)flags.push(`${m.at} CUT ${m.cut.join('/')}`);
  if(m.repeat&&m.repeat.length)flags.push(`${m.at} REPEAT ${m.repeat[0]}`);
  if(m.sliceCut&&m.sliceCut.length)flags.push(`${m.at} SLICECUT ${m.sliceCut.join('/')}`);
  if(m.hscroll)flags.push(m.at+' HSCROLL');
  const d=m.done&&m.done.find(x=>/Done/.test(x.t)); if(d&&(d.r[1]+d.r[3]>m.vh||d.r[1]<0))flags.push(m.at+' DONE-OUT');
  if(m.fill!==undefined&&m.fill<0.15&&m.stage)flags.push(`${m.at} fill ${m.fill}`);
  if(m.unavailable)flags.push(m.at+' UNAVAIL '+m.unavailable.slice(0,40));
  if(m.sum&&m.sum.clamped&&!m.sum.moreVisible)flags.push(m.at+' SUM-CLAMPED-NO-MORE');
 }
 console.log(`${r.ref} ${r.vp} reads ${r.reads.length} parts ${parts} minH ${minH} minS ${minS===99?'-':minS} chg[${r.change}] ${r.error||''} ${r.pageerrors.length?'PAGEERR '+r.pageerrors[0]:''}`);
 if(flags.length)console.log('   '+[...new Set(flags)].slice(0,8).join('\n   '));}
