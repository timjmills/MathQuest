// Baseline capture: every skill on the PRINT surface and on the on-screen QUESTION CARD, as it
// renders today, plus a few measurements of how far it is from the worksheet standard.
// The PNGs are the "before" pictures for the redesign and the regression net for refactors.
//
//   node tests/scripts/ws-baseline.cjs                       all skills
//   node tests/scripts/ws-baseline.cjs --category=addition   one category
//   node tests/scripts/ws-baseline.cjs --skills=add_facts,sub_facts
//   node tests/scripts/ws-baseline.cjs --out=after-foundation
//   node tests/scripts/ws-baseline.cjs --out=<name> --resume   continue an interrupted run
//
// Output: tests/compliance/baseline/<out>/{print,screen}/<category>__<skill>.png + index.json
const fs = require('fs');
const path = require('path');
const { ROOT, open, listSkills, renderPrint, renderScreen, shoot } = require('../lib/ws-harness.cjs');

const arg = (name, dflt = null) => {
  const hit = process.argv.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : dflt;
};
const OUT = path.join(ROOT, 'tests', 'compliance', 'baseline', arg('out', 'current'));
const onlyCategory = arg('category');
const onlySkills = arg('skills') ? new Set(arg('skills').split(',')) : null;

// Runs in the page: how much of the standard does this surface already meet?
function measure(selector) {
  const host = document.querySelector(selector);
  if (!host) return null;
  const emoji = (host.textContent.match(/\p{Extended_Pictographic}/gu) || []).length;
  const fonts = {};
  let coloured = 0, elements = 0, inputs = host.querySelectorAll('input, select, button').length;
  const isGrey = c => {
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
    if (!m) return true;
    if (m[4] !== undefined && parseFloat(m[4]) === 0) return true;
    const [r, g, b] = [+m[1], +m[2], +m[3]];
    return Math.max(r, g, b) - Math.min(r, g, b) <= 8;
  };
  for (const el of host.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    elements++;
    const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    if (el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) fonts[fam] = (fonts[fam] || 0) + 1;
    const paints = [cs.color, cs.backgroundColor, cs.borderTopColor, cs.fill, cs.stroke].filter(c => c && c !== 'none');
    if (paints.some(c => !isGrey(c))) coloured++;
  }
  return { emoji, coloured, elements, inputs, fonts, overflowX: host.scrollWidth > host.clientWidth + 1 };
}

(async () => {
  const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
  const index = { generated: new Date().toISOString(), skills: [] };
  const indexFile = path.join(OUT, 'index.json');
  if (process.argv.includes('--resume') && fs.existsSync(indexFile)) {
    index.skills = JSON.parse(fs.readFileSync(indexFile, 'utf8')).skills || [];
  }
  const done = new Set(index.skills.map(r => r.id));
  try {
    let skills = await listSkills(app.page);
    if (onlyCategory) skills = skills.filter(s => s.categoryId === onlyCategory);
    if (onlySkills) skills = skills.filter(s => onlySkills.has(s.skillId));
    skills = skills.filter(sk => !done.has(`${sk.categoryId}__${sk.skillId}`));
    console.log(`ws-baseline: ${skills.length} skills to capture (${done.size} already done) -> ${OUT}`);

    let n = 0;
    for (const skill of skills) {
      const id = `${skill.categoryId}__${skill.skillId}`;
      const seed = [...id].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) | 0, 7);
      const row = { ...skill, id };
      const before = app.problems.length;

      try {
        await app.page.evaluate(s => window.__wsReseed(s), seed);
        const sel = await renderPrint(app.page, skill, { problemCount: 6 });
        row.print = await app.page.evaluate(measure, sel);
        row.print.problems = await app.page.$eval(sel, el => el.querySelectorAll('.worksheet-problem').length);
        await shoot(app.page, sel, path.join(OUT, 'print', `${id}.png`));
      } catch (e) { row.printError = e.message; }

      try {
        await app.page.evaluate(s => window.__wsReseed(s), seed);
        const screen = await renderScreen(app.page, skill);
        row.screen = { ...screen.info, ...(await app.page.evaluate(measure, screen.selector)) };
        await shoot(app.page, screen.selector, path.join(OUT, 'screen', `${id}.png`));
      } catch (e) { row.screenError = e.message; }

      const fresh = app.problems.slice(before);
      if (fresh.length) row.consoleErrors = fresh.slice(0, 5).map(p => `[${p.type}] ${p.text}`.slice(0, 300));
      index.skills.push(row);
      if (++n % 25 === 0) {
        console.log(`  ${n}/${skills.length}`);
        fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1));
      }
    }
  } finally {
    await app.close();
  }

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1));
  const s = index.skills;
  const count = f => s.filter(f).length;
  console.log([
    `ws-baseline: ${s.length} skills captured`,
    `  print errors ${count(r => r.printError)} | screen errors ${count(r => r.screenError)} | skills with console errors ${count(r => r.consoleErrors)}`,
    `  print:  emoji ${count(r => r.print && r.print.emoji)} | colour ${count(r => r.print && r.print.coloured)} | live inputs ${count(r => r.print && r.print.inputs)} | fewer than 6 problems ${count(r => r.print && r.print.problems < 6)}`,
    `  screen: emoji ${count(r => r.screen && r.screen.emoji)} | colour ${count(r => r.screen && r.screen.coloured)}`,
  ].join('\n'));
})().catch(e => { console.error('ws-baseline: crashed —', e); process.exit(1); });
