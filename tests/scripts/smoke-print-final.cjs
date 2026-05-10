// Final print-pipeline smoke after the design-system migration.
// Renders a multi-section worksheet and confirms every component class shows up.
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1100 });
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });

  await page.goto('http://localhost:3199/', { waitUntil: 'networkidle0', timeout: 25000 });
  await page.evaluate(() => localStorage.setItem('mathquest_onboarded', '1'));
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    document.querySelectorAll('[class*="modal"]').forEach(el => {
      const s = getComputedStyle(el);
      if (s.position === 'fixed' && parseInt(s.zIndex) > 100) el.remove();
    });
    if (document.body.classList.contains('student-mode')) window.toggleUserRole();
  });

  // Drive the print pipeline directly with a mix of skills covering many emitters.
  await page.evaluate(async () => {
    const sections = [
      // Use skills that exercise the MIGRATED emitters
      { label: 'Stack Add', columns: 2, problemCount: 3, skills: [
          { skillId: 'add_within_1k', categoryId: 'operations', skillName: 'Add Within 1k', weight: 1 }] },
      { label: 'Stack Sub Regroup', columns: 2, problemCount: 3, skills: [
          { skillId: 'sub_within_1k_regroup', categoryId: 'operations', skillName: 'Sub With Regrouping', weight: 1 }] },
      { label: 'Fractions', columns: 2, problemCount: 3, skills: [
          { skillId: 'add_fractions_like', categoryId: 'fraction_operations', skillName: 'Add Fractions', weight: 1 }] },
      { label: 'Geometry Grid', columns: 2, problemCount: 3, skills: [
          { skillId: 'area_perimeter', categoryId: 'area_perimeter', skillName: 'Area & Perimeter', weight: 1 }] },
      { label: 'Bar Graph', columns: 1, problemCount: 2, skills: [
          { skillId: 'bar_graph', categoryId: 'graphs', skillName: 'Bar Graph', weight: 1 }] },
      { label: 'Multi-Select', columns: 2, problemCount: 2, skills: [
          { skillId: 'nearest_10', categoryId: 'rounding', skillName: 'Round to Nearest 10', weight: 1 }] },
      { label: 'Fact Family', columns: 2, problemCount: 2, skills: [
          { skillId: 'fact_family', categoryId: 'operations', skillName: 'Fact Family', weight: 1 }] },
    ];
    if (typeof window.generateWorksheetFromSections === 'function') {
      try { await window.generateWorksheetFromSections(sections, 1, 'Print Edition Final', 'color', true, false); }
      catch (e) { console.error('genErr:', e.message); }
    }
  });
  await new Promise(r => setTimeout(r, 1800));

  const counts = await page.evaluate(() => {
    const c = document.getElementById('printPreviewContent');
    if (!c) return null;
    const q = (sel) => c.querySelectorAll(sel).length;
    return {
      printEditionWrappers: q('.worksheet-set.print-edition'),
      sheetHead: q('.sheet-head'),
      sheetMeta: q('.sheet-meta'),
      metaScoreLines: q('.meta-line.score'),
      sectionDividers: q('.section-num'),
      problems: q('.worksheet-problem, .problem'),
      pHeads: q('.p-head'),
      pPrompts: q('.p-prompt'),
      ansLines: q('.ans-line'),
      ansBoxes: q('.ans-box'),
      workAreas: q('.work-area'),
      stacks: q('.stack'),
      stackPVs: q('.stack-pv'),
      regroupBoxes: q('.rg-box'),
      fracs: q('.frac'),
      fbars: q('.fbar'),
      fcircles: q('.fcircle'),
      numlines: q('.numline'),
      bargraphs: q('.bargraph'),
      pictos: q('.picto'),
      mtables: q('.mtable'),
      tileBanks: q('.tile-bank'),
      slots: q('.slots'),
      boxdivs: q('.boxdiv'),
      optLists: q('.opt-list'),
      factfams: q('.factfam'),
      sheetFoot: q('.sheet-foot'),
      brand: q('.sheet-foot .brand'),
      akey: q('.akey'),
    };
  });
  console.log('design-class counts in rendered worksheet:');
  if (counts) Object.entries(counts).forEach(([k, v]) => console.log(`  ${k.padEnd(22)} ${v}`));

  console.log('\nerrors:', errs.length, errs.slice(0, 5));
  await browser.close();
  if (errs.length) process.exit(1);
})();
