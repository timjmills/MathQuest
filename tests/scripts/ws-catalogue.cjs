// Skill capability catalogue: what does every skill supply TODAY for the page roles in
// design/PAGE_TYPES.md section 10? Generates N seeded questions per skill in the real app and
// records facts (answer types, print formats, visuals, colour, emoji, options, worked steps,
// story text, fact-likeness, errors). Writes tests/compliance/catalogue.json and
// design/SKILL_CATALOGUE.md.
//
//   node tests/scripts/ws-catalogue.cjs                 # all skills, 12 samples each
//   node tests/scripts/ws-catalogue.cjs --n 20 --category addition
const fs = require('fs');
const path = require('path');
const { ROOT, open, listSkills, hideOverlays } = require('../lib/ws-harness.cjs');

const arg = (name, dflt) => { const i = process.argv.indexOf('--' + name); return i > -1 ? process.argv[i + 1] : dflt; };
const N = parseInt(arg('n', '12'), 10);
const onlyCategory = arg('category', null);

function sampleSkill(skill, N) {
  const st = window.state;
  const saved = { category: st.category, skill: st.skill, range: st.range, decimalPlaces: st.decimalPlaces, gameMode: st.gameMode, isMixedMode: st.isMixedMode };
  const out = { n: 0, errors: [], empty: 0, answerTypes: {}, printFormats: {}, interactiveTypes: {}, visual: 0, colourVisual: 0, emoji: 0,
    options: 0, hint: 0, keyAns: 0, numericAns: 0, abop: 0, maxDigits: 0, maxOperand: 0, ops: {}, story: 0, maxWords: 0, worked: 0, workedMax: 0,
    solSteps: 0, solStepsMax: 0, payloadKeys: {}, texts: {}, stateLeak: false, samples: [] };
  const isColour = html => {
    const hexes = html.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
    for (const h of hexes) {
      let s = h.slice(1); if (s.length === 3 || s.length === 4) s = [...s].map(c => c + c).join('');
      if (s.length < 6) continue;
      const r = parseInt(s.slice(0, 2), 16), g = parseInt(s.slice(2, 4), 16), b = parseInt(s.slice(4, 6), 16);
      if (Math.max(r, g, b) - Math.min(r, g, b) > 24) return true;
    }
    return /(?:fill|stroke|color|background)\s*[:=]\s*["']?\s*(?:red|blue|green|orange|purple|pink|yellow|gold|teal|crimson|tomato|violet)\b/i.test(html) || /var\(--(?:accent|primary|success|danger|warning)/.test(html);
  };
  const emojiRe = /\p{Extended_Pictographic}/u;
  // the generators fall back to Problem / Hint / Answer lines; only the lines between count as steps
  const realSteps = w => (Array.isArray(w) ? w : []).filter(t => !/^\s*(<strong>)?\s*(Problem|Answer|Hint)/i.test(String(t))).length;
  if (!st.selectedNumbers || !st.selectedNumbers.length) st.selectedNumbers = Array.from({ length: 12 }, (_, i) => i + 1);
  for (let i = 0; i < N; i++) {
    st.category = skill.categoryId; st.skill = skill.skillId; st.range = 100; st.decimalPlaces = 0; st.gameMode = 'practice'; st.isMixedMode = false;
    let q;
    try { q = window.generateQuestion(); } catch (e) { out.errors.push(String(e && e.message || e).slice(0, 140)); continue; }
    if (st.skill !== skill.skillId || st.category !== skill.categoryId) out.stateLeak = true;
    if (!q || (!q.text && !q.visual)) { out.empty++; continue; }
    out.n++;
    const text = String(q.text || ''), visual = String(q.visual || '');
    const plain = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
    bump(out.answerTypes, q.answerType || '(none)');
    bump(out.printFormats, q.printFormat || '(none)');
    if (q.interactiveType) bump(out.interactiveTypes, q.interactiveType);
    if (visual) out.visual++;
    if (visual && isColour(visual) || isColour(text)) out.colourVisual++;
    if (emojiRe.test(text) || emojiRe.test(visual)) out.emoji++;
    if (Array.isArray(q.options) && q.options.length > 1) out.options++;
    if (q.hint) out.hint++;
    { const a = q.ans; const str = a === null || a === undefined ? '' : (typeof a === 'object' ? JSON.stringify(a) : String(a)); if (str.trim() && str !== '{}' && str !== '[]' && !/\[object |undefined|NaN/.test(str)) out.keyAns++; }
    if (typeof q.ans === 'number' || (typeof q.ans === 'string' && /^-?[\d,]+(\.\d+)?$/.test(q.ans.trim()))) out.numericAns++;
    if (q.a !== undefined && q.b !== undefined && q.op) {
      out.abop++; bump(out.ops, q.op);
      const d = Math.max(String(Math.abs(q.a)).replace(/\D/g, '').length, String(Math.abs(q.b)).replace(/\D/g, '').length);
      out.maxDigits = Math.max(out.maxDigits, d);
      out.maxOperand = Math.max(out.maxOperand, Math.abs(+q.a) || 0, Math.abs(+q.b) || 0);
    }
    const words = plain ? plain.split(' ').length : 0;
    out.maxWords = Math.max(out.maxWords, words);
    if (words >= 14 && /[.?!]/.test(plain)) out.story++;
    for (const k of Object.keys(q)) if (/Data$/.test(k) && q[k]) bump(out.payloadKeys, k);
    bump(out.texts, plain + '|' + String(q.ans));
    try {
      const w = window.generateWorkedSolution ? window.generateWorkedSolution(q) : null;
      const len = realSteps(w);
      if (len >= 2) out.worked++; out.workedMax = Math.max(out.workedMax, len);
    } catch (e) { /* counted as no worked steps */ }
    try {
      const s = window.generateSolutionSteps ? window.generateSolutionSteps(q) : null;
      const len = realSteps(s);
      if (len >= 2) out.solSteps++; out.solStepsMax = Math.max(out.solStepsMax, len);
    } catch (e) { /* none */ }
    if (out.samples.length < 3) out.samples.push({ text: plain.slice(0, 140), ans: String(q.ans).slice(0, 60), fmt: q.printFormat || '', type: q.answerType || '' });
  }
  out.distinct = Object.keys(out.texts).length; delete out.texts;
  Object.assign(st, saved);
  out.printSize = window.getSkillPrintSize ? window.getSkillPrintSize(skill.skillId, Object.keys(out.printFormats)[0] || '') : '';
  return out;
}

// ---- role readiness, per design/PAGE_TYPES.md section 10 ----
// 'ready' = the default adapter has real material; 'basic' = adapter works but thin; 'author' = needs authored members; 'n/a'
function readiness(s) {
  const r = {};
  const n = s.n || 1;
  const broken = s.n === 0 || s.errors.length > 0 || s.empty > s.n;
  r.key = broken ? 'broken' : s.keyAns >= s.n ? 'ready' : 'author';                    // facsimile answer key: every item needs a printable answer
  r.core = broken ? 'broken' : 'ready';                                           // independent, practice, review, test, grids, spiral, mixed, daily 4, key
  const steps = Math.max(s.worked, s.solSteps) / n;
  r.model = broken ? 'broken' : steps >= 0.8 ? 'basic' : 'author';                // opener, scripted model, guided, K one-page, anchor chart, steps card
  r.error = broken ? 'broken' : (s.options / n >= 0.8 || s.numericAns / n >= 0.8) ? 'basic' : 'author';   // error analysis, true/false, reason it
  r.subskill = broken ? 'broken' : 'author';                                      // decide / notate / set-up: never supplied today
  r.stretch = broken ? 'broken' : s.numericAns / n >= 0.8 ? 'basic' : 'author';
  r.word = broken ? 'broken' : s.story / n >= 0.5 ? 'basic' : 'wrap';             // story skills vs neutral story frame
  const factLike = s.abop / n >= 0.8 && s.maxDigits <= 2 && s.maxOperand <= 20 || (s.abop / n >= 0.8 && Object.keys(s.ops).every(o => /[×x*÷/]/.test(o)) && s.maxOperand <= 144 && s.maxDigits <= 3);
  r.fact = broken ? 'broken' : factLike ? 'basic' : 'n/a';
  return r;
}

// ---- page tags: which SPECIALISED pages a skill can produce (base pages are open to every skill) ----
// First pass is derived from behaviour; design/catalogue/<family>.overrides.json
// ({ "category:skill": { host, add: [], remove: [] } }) records the family reviews and always wins.
const OVERRIDES_DIR = path.join(ROOT, 'design', 'catalogue');
const OVERRIDES = {};
if (fs.existsSync(OVERRIDES_DIR)) for (const f of fs.readdirSync(OVERRIDES_DIR).filter(f => f.endsWith('.overrides.json')).sort()) Object.assign(OVERRIDES, JSON.parse(fs.readFileSync(path.join(OVERRIDES_DIR, f), 'utf8')));
const HOSTS = ['computation-grid', 'equation-drill', 'long-division', 'visual-grid', 'k-counting', 'chart-table', 'word-problems', 'unassigned'];
const SPECIAL = ['fact-layouts', 'fact-family', 'flashcards', 'todays-number', 'k-one-page', 'sub-decide', 'sub-notate', 'sub-setup', 'schema-story', 'hands-sort', 'hands-order', 'hands-match', 'hands-find', 'hands-strips'];
function pageTags(s) {
  const n = s.n || 1, id = s.skillId, cat = s.categoryId;
  const fmts = Object.keys(s.printFormats), types = Object.keys(s.answerTypes);
  const hasF = re => fmts.some(f => re.test(f)), hasT = re => types.some(t => re.test(t));
  const story = s.story / n >= 0.5, visual = s.visual / n >= 0.5, numeric = s.numericAns / n >= 0.5;
  const column = hasF(/^(decimal-)?column-|facts-vertical|mult-vertical/) || hasT(/^col-/);
  let host;
  if (story) host = 'word-problems';
  else if (/long_div|div_remainder|div_\d?digit|divide_.*digit/.test(id) || hasF(/^div-(remainders|facts-long)|box-division|decimal-div/)) host = 'long-division';
  else if (column) host = 'computation-grid';
  else if (hasF(/hundreds-chart|mult-chart|rounding-table|skip-count-grid|grid-fill|function-table|data-tally/) || s.payloadKeys.tableData || s.payloadKeys.chartData) host = 'chart-table';
  else if (cat === 'counting' || cat === 'counting_mixed' || (s.grade === 'K' && /count|trace|numeral/.test(id))) host = 'k-counting';
  else if (visual) host = 'visual-grid';
  else if (numeric || hasT(/^(number|fraction-input|text|dual|symbol|inline-)/)) host = 'equation-drill';
  else host = 'unassigned';
  const t = new Set();
  if (s.roles.fact === 'basic' || /_facts?$|_facts_|^doubles|make_a_ten|make_10/.test(id)) { t.add('fact-layouts'); t.add('flashcards'); }
  if (hasF(/^(number|fact)-family/) || hasT(/^(number|fact)-family/)) t.add('fact-family');
  if (['placevalue', 'number_sense', 'comparing', 'counting'].includes(cat) || /round|compare_(numbers|whole)|expanded|place_value|number_word|odd_even|skip_count|ten_more|hundred_more/.test(id)) t.add('todays-number');
  if (s.grade === 'K' || s.grade === '1') t.add('k-one-page');
  if (/regroup|across_zero|borrow|carry/.test(id) || (column && ['addition', 'subtraction'].includes(cat))) t.add('sub-decide');
  if (column && /regroup|across_zero/.test(id)) t.add('sub-notate');
  if (column) t.add('sub-setup');
  if (story && ['addition', 'subtraction', 'multiplication', 'division', 'number_ops_mixed', 'algebra', 'fraction_operations'].includes(cat)) t.add('schema-story');
  if (hasT(/divisibility-sort|odd-even-select|multi-select|dnd-generic|tchart/) || /classify|sort|odd_even|prime_composite/.test(id)) t.add('hands-sort');
  if (s.interactiveTypes.ordering || hasF(/order(ing)?$|^fdp-order|fraction-order|decimal-order|numline-order/) || /^order_|_order(ing)?$|least_greatest/.test(id)) t.add('hands-order');
  if (hasF(/match/) || hasT(/match/)) t.add('hands-match');
  if (hasT(/hot-?spot|shade-parts|odd-even-select/) || /identify|find_/.test(id)) t.add('hands-find');
  if (hasF(/expanded|pv-disks|place-value-disks|pv-digit/) || s.interactiveTypes.expanded || /expanded_form/.test(id)) t.add('hands-strips');
  const o = OVERRIDES[cat + ':' + id];
  if (o) { if (o.host) host = o.host; (o.add || []).forEach(x => t.add(x)); (o.remove || []).forEach(x => t.delete(x)); }
  return { host, special: SPECIAL.filter(x => t.has(x)), reviewed: !!o, verdict: o && o.verdict || '', mergeInto: o && o.mergeInto || '' };
}

(async () => {
  const { page, problems, close } = await open({ seed: 20260919 });
  await hideOverlays(page);
  let skills = await listSkills(page);
  if (onlyCategory) skills = skills.filter(s => s.categoryId === onlyCategory);
  const rows = [];
  for (let i = 0; i < skills.length; i++) {
    const sk = skills[i];
    await page.evaluate(n => window.__wsReseed(n), 1000 + i);
    let facts;
    try { facts = await page.evaluate(sampleSkill, sk, N); }
    catch (e) { facts = { n: 0, errors: ['harness: ' + String(e.message).slice(0, 120)], empty: 0, answerTypes: {}, printFormats: {}, interactiveTypes: {}, visual: 0, colourVisual: 0, emoji: 0, options: 0, hint: 0, keyAns: 0, numericAns: 0, abop: 0, maxDigits: 0, maxOperand: 0, ops: {}, story: 0, maxWords: 0, worked: 0, workedMax: 0, solSteps: 0, solStepsMax: 0, payloadKeys: {}, distinct: 0, samples: [], stateLeak: false, printSize: '' }; }
    const row = { ...sk, ...facts, roles: readiness(facts) };
    row.pages = pageTags(row);
    rows.push(row);
    if ((i + 1) % 50 === 0) console.log(`${i + 1}/${skills.length}`);
  }
  await close();

  // a --category run is a spot check: it never replaces the full catalogue
  const outJson = path.join(ROOT, 'tests', 'compliance', onlyCategory ? `catalogue.${onlyCategory}.json` : 'catalogue.json');
  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(outJson, JSON.stringify({ samplesPerSkill: N, range: 100, skills: rows, consoleProblems: problems.slice(0, 50) }, null, 1));

  // ---- markdown ----
  const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';
  const ROLE_COLS = [['core', 'Practice / review / test'], ['key', 'Answer key (every page)'], ['model', 'Opener / Model / Guided'], ['error', 'Error analysis / T-F / Reason It'], ['subskill', 'Sub-skill pages'], ['stretch', 'Stretch'], ['word', 'Word problems'], ['fact', 'Fact layouts']];
  const count = (list, key, val) => list.filter(s => s.roles[key] === val).length;
  let md = `# Skill catalogue: what every skill supplies today\n\nGenerated by \`node tests/scripts/ws-catalogue.cjs\` (${N} seeded questions per skill, Max Number 100, no decimals). Do not edit by hand.\n\n`;
  md += `Readiness is measured against the role groups in \`design/PAGE_TYPES.md\` section 10:\n\n- **ready**: the skill already supplies what the role reads.\n- **basic**: the default adapter has material to work from (worked-solution text, answer options, numeric answer), so the page prints, but the content is thin until the family is migrated.\n- **author**: nothing to adapt from; the member has to be written in the family migration.\n- **wrap**: not a story skill; the word-problem role prints its cell inside the band or a neutral story frame.\n- **n/a**: fact layouts apply to fact-like skills only.\n- **broken**: the generator threw or returned nothing in this run.\n\n`;
  md += `## Totals (${rows.length} skills)\n\n| Role group | ready | basic | author | wrap | n/a | broken |\n|---|---|---|---|---|---|---|\n`;
  for (const [k, name] of ROLE_COLS) md += `| ${name} | ${count(rows, k, 'ready')} | ${count(rows, k, 'basic')} | ${count(rows, k, 'author')} | ${count(rows, k, 'wrap')} | ${count(rows, k, 'n/a')} | ${count(rows, k, 'broken')} |\n`;
  const sum = f => rows.filter(f).length;
  md += `\n## Design and content flags\n\n| Flag | Skills |\n|---|---|\n`;
  md += `| Generator error or empty question | ${sum(s => s.roles.core === 'broken')} |\n| Colour inside the question or its visual | ${sum(s => s.colourVisual > 0)} |\n| Emoji inside the question or its visual | ${sum(s => s.emoji > 0)} |\n| Multiple choice on screen (check print/screen parity) | ${sum(s => (s.answerTypes['multiple-choice'] || 0) > 0)} |\n| No print format set | ${sum(s => (s.printFormats['(none)'] || 0) > 0)} |\n| No worked steps from either source | ${sum(s => s.n > 0 && s.worked === 0 && s.solSteps === 0)} |\n| No hint | ${sum(s => s.n > 0 && s.hint === 0)} |\n| Low variety (fewer than half the samples distinct) | ${sum(s => s.n >= 6 && s.distinct < s.n / 2)} |\n| Leaves \`state.skill\` changed after generating | ${sum(s => s.stateLeak)} |\n`;

  md += `\n## Page tags\n\n**Base pages** are open to every skill and need no tag: opener, scripted model, guided, independent, more practice, error analysis, review, test A/B, pre-skill check, daily spiral, mixed skill practice, Daily 4, True or False?, Reason It, stretch, steps card, anchor chart, blank template. **Every page of every skill also prints a facsimile answer key.**\n\n**Host layout** (exactly one per skill) is the practice grid the skill's cell naturally sits in. **Specialised pages** are offered only to skills that carry the tag. Tags are derived from behaviour, then corrected by the family reviews in \`design/catalogue/*.overrides.json\` (${rows.filter(s => s.pages.reviewed).length} of ${rows.length} skills reviewed so far).\n\n| Host layout | Skills |\n|---|---|\n`;
  for (const h of HOSTS) md += `| ${h} | ${rows.filter(s => s.pages.host === h).length} |\n`;
  md += `\n| Specialised page tag | Pages it unlocks | Skills |\n|---|---|---|\n`;
  const UNLOCKS = { 'fact-layouts': 'fact rows 5-10 columns, fact fluency probe, practice strips, cumulative fact review', 'fact-family': 'fact-family intro, warm-up, probe A-D', flashcards: 'flashcards (hands-on)', 'todays-number': "Today's Number", 'k-one-page': 'K one-page lesson (2 model / 2 guided / 2 alone)', 'sub-decide': 'sub-skill: decide-only', 'sub-notate': 'sub-skill: notate-only', 'sub-setup': 'sub-skill: set-up (rewrite horizontal to vertical)', 'schema-story': 'schema word problems v1 / v2 / two-step, keyword panel', 'hands-sort': 'cut-and-glue sort', 'hands-order': 'cut-and-order', 'hands-match': 'match with a line', 'hands-find': 'find-and-colour', 'hands-strips': 'layered place-value strips' };
  for (const k of SPECIAL) md += `| ${k} | ${UNLOCKS[k]} | ${rows.filter(s => s.pages.special.includes(k)).length} |\n`;

  const cats = [...new Set(rows.map(s => s.categoryId))];
  md += `\n## By category\n\n| Category | Skills | Broken | Colour | Emoji | Multiple choice | Worked steps | Options | Story | Fact-like |\n|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const c of cats) {
    const L = rows.filter(s => s.categoryId === c);
    md += `| ${c} | ${L.length} | ${count(L, 'core', 'broken')} | ${L.filter(s => s.colourVisual).length} | ${L.filter(s => s.emoji).length} | ${L.filter(s => s.answerTypes['multiple-choice']).length} | ${L.filter(s => s.roles.model === 'basic').length} | ${L.filter(s => s.options > 0).length} | ${L.filter(s => s.roles.word === 'basic').length} | ${L.filter(s => s.roles.fact === 'basic').length} |\n`;
  }
  md += `\n## Every skill\n\nColumns: grade, print size class, answer types, print formats, then role readiness in the order ${ROLE_COLS.map(c => c[0]).join(' / ')}; flags: C colour, E emoji, V has a visual, L state leak, D low variety.\n`;
  for (const c of cats) {
    md += `\n### ${c}\n\n| Skill | Gr | Size | Answer types | Print formats | core | key | model | error | sub | stretch | word | fact | Flags | Host layout | Specialised pages |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
    for (const s of rows.filter(x => x.categoryId === c)) {
      const flags = [s.colourVisual ? 'C' : '', s.emoji ? 'E' : '', s.visual ? 'V' : '', s.stateLeak ? 'L' : '', (s.n >= 6 && s.distinct < s.n / 2) ? 'D' : ''].join('');
      const r = s.roles;
      md += `| \`${s.skillId}\` ${String(s.label).replace(/\|/g, '/')} | ${s.grade} | ${s.printSize} | ${Object.keys(s.answerTypes).join(', ')} | ${Object.keys(s.printFormats).join(', ')} | ${r.core} | ${r.key} | ${r.model} | ${r.error} | ${r.subskill} | ${r.stretch} | ${r.word} | ${r.fact} | ${flags} | ${s.pages.host}${s.pages.reviewed ? ' (reviewed)' : ''} | ${s.pages.special.join(', ')} |\n`;
    }
  }
  const broken = rows.filter(s => s.roles.core === 'broken');
  if (broken.length) {
    md += `\n## Broken in this run\n\n| Skill | Category | Errors | Empty |\n|---|---|---|---|\n`;
    for (const s of broken) md += `| \`${s.skillId}\` | ${s.categoryId} | ${[...new Set(s.errors)].slice(0, 2).join(' ; ').replace(/\|/g, '/')} | ${s.empty} |\n`;
  }
  if (!onlyCategory) fs.writeFileSync(path.join(ROOT, 'design', 'SKILL_CATALOGUE.md'), md);
  console.log(`catalogue: ${rows.length} skills -> tests/compliance/catalogue.json, design/SKILL_CATALOGUE.md`);
  console.log('broken:', broken.length, '| colour:', sum(s => s.colourVisual > 0), '| emoji:', sum(s => s.emoji > 0), '| MC:', sum(s => s.answerTypes['multiple-choice']), '| no steps:', sum(s => s.n > 0 && s.worked === 0 && s.solSteps === 0));
})().catch(e => { console.error(e); process.exit(1); });
