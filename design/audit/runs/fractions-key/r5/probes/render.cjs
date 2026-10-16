// critic r4: render pupil + key pages. node render.cjs <repo> <outdir> <jobs.json>
// job: {c,s,role,size,seed,style}
const path = require('path'), fs = require('fs');
const { execFileSync } = require('child_process');
const ROOT = process.argv[2], OUT = process.argv[3];
const jobs = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const PY = `
import sys, json, pymupdf
src, outdir, prefix = sys.argv[1], sys.argv[2], sys.argv[3]
d = pymupdf.open(src); res=[]
for i, p in enumerate(d):
    pm = p.get_pixmap(dpi=60, colorspace=pymupdf.csGRAY)
    w,h = pm.width, pm.height; s = pm.samples
    # largest run of blank rows inside the live area (skip 6% top/bottom margins)
    best=cur=0; y0=int(h*0.06); y1=int(h*0.94)
    for y in range(y0,y1):
        row = s[y*w + int(w*0.06): y*w + int(w*0.94)]
        if min(row) > 235: cur+=1; best=max(best,cur)
        else: cur=0
    name='%s-p%d.png'%(prefix,i+1)
    p.get_pixmap(dpi=80).save(outdir+'/'+name)
    res.append({'file':name,'strip':round(100*best/h,1)})
print(json.dumps(res))
`;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const app = await open({ seed: 1 });
  const { page } = app;
  for (const j of jobs) {
    const built = await page.evaluate(async (j) => {
      try {
        const key = j.style ? { on: true, placement: 'end', style: j.style } : true;
        const r = await window.buildSheet({ role: j.role, sections: [{ skills: [{ categoryId: j.c, skillId: j.s }], count: j.count }], size: j.size, look: j.look || 'auto', seed: j.seed, key });
        const t = r.title || j.s;
        return { pupil: window.sheetDocument(r.pupilHtml, t), key: window.sheetDocument(r.keyHtml, t + ' - Answer Key'), n: r.items.length, pages: r.pageCount, fits: r.fits };
      } catch (e) { return { err: String(e && e.stack || e) }; }
    }, j);
    const tag = `${j.s}-${j.role}-${j.size}-s${j.seed}${j.style ? '-' + j.style : ''}`;
    if (built.err) { console.log(tag, 'ERR', built.err.slice(0, 300)); continue; }
    const res = {};
    for (const which of ['pupil', 'key']) {
      const sheet = await app.browser.newPage();
      await sheet.setViewport({ width: 900, height: 1200 });
      await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });
      await sheet.setContent(built[which], { waitUntil: 'networkidle0', timeout: 60000 });
      await sheet.evaluate(() => document.fonts && document.fonts.ready);
      await new Promise(r => setTimeout(r, 250));
      const pdf = path.join(OUT, `${tag}-${which}.pdf`);
      await sheet.pdf({ path: pdf, printBackground: false, preferCSSPageSize: true });
      await sheet.close();
      res[which] = JSON.parse(execFileSync('python3', ['-c', PY, pdf, OUT, `${tag}-${which}`], { encoding: 'utf8' }).trim().split('\n').pop());
      fs.unlinkSync(pdf);
    }
    console.log(tag, `items ${built.n} pages ${built.pages} fits ${JSON.stringify(built.fits)}`, 'pupil', res.pupil.map(p => p.strip + '%').join(' '), 'key', res.key.map(p => p.strip + '%').join(' '));
  }
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
