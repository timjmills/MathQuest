// Teacher site 2.0 — the clickable mock-up (T1). Static: no app code, no network. Data from data.js (make-data.mjs).
// URL: app.html?theme=dark&tray=demo3#print   (theme light|dark; tray demo1|demo3|lesson|<cat:skill,...>; hash = screen)
// Screens: #skills #lessons #classes; sheets on top: #print #quiz #buildfrom #share #quizshare #chip/<cat:skill> #board
// #lessonprint #profile #trayopen. ?walk=<flow id> runs a walk-through from flows.js.
(function () {
  const D = window.MQ_DATA; const T = window.MQThumbs;
  const AREAS = {
    CC: { name: 'Counting', short: 'Counting', long: 'Counting & cardinality', icon: 'dots' },
    OA: { name: 'Operations & algebra', short: 'Operations', long: 'Operations & algebraic thinking', icon: 'plus' },
    NBT: { name: 'Place value', short: 'Place value', long: 'Number & operations in base ten', icon: 'blocks' },
    NF: { name: 'Fractions & decimals', short: 'Fractions', long: 'Fractions & decimals', icon: 'half' },
    MEAS: { name: 'Measurement', short: 'Measure', long: 'Measurement: length, mass, time, money, area, angles', icon: 'ruler' },
    DATA: { name: 'Data', short: 'Data', long: 'Data: graphs, tables, chance', icon: 'chart' },
    G: { name: 'Geometry', short: 'Geometry', long: 'Geometry', icon: 'shape' },
    RPNS: { name: 'Ratio & number system', short: 'Ratio', long: 'Ratio & number system (grade 6)', icon: 'ratio' },
    MIXED: { name: 'Mixed', short: 'Mixed', long: 'Mixed: skills from several areas', icon: 'mixed' },
    WORDS: { name: 'Words', short: 'Words', long: 'Maths words', icon: 'book' },
    NOSTD: { name: 'No standard', short: 'No standard', long: 'No standard', icon: 'nostd' },
  };
  // short forms for the tray's area segments when the full short names do not all fit on one row
  const ABBR = { CC: 'Count', OA: 'Ops', NBT: 'PV', NF: 'Frac', MEAS: 'Meas', DATA: 'Data', G: 'Geo', RPNS: 'Ratio', MIXED: 'Mixed', WORDS: 'Words', NOSTD: 'None' };
  const ORDER = ['CC', 'OA', 'NBT', 'NF', 'MEAS', 'DATA', 'G', 'RPNS', 'MIXED', 'WORDS'];
  const GRADES = [['K', 'Kindergarten'], ['1', 'Grade 1'], ['2', 'Grade 2'], ['3', 'Grade 3'], ['4', 'Grade 4'], ['5', 'Grade 5'], ['6', 'Grade 6'], ['M', 'Mixed levels']];
  const gradeName = (g) => (GRADES.find(x => x[0] === g) || [g, g === 'PK' ? 'Pre-K' : 'Grade ' + g])[1];
  const gradeShort = (g) => g === 'K' ? 'K' : g === 'M' ? 'Mixed levels' : g === 'PK' ? 'Pre-K' : 'Grade ' + g;
  const P = {
    dots: '<circle cx="6" cy="6" r="2.2" fill="currentColor"/><circle cx="14" cy="6" r="2.2" fill="currentColor"/><circle cx="6" cy="14" r="2.2" fill="currentColor"/><circle cx="14" cy="14" r="2.2" fill="currentColor"/>',
    plus: '<path d="M6 3v6M3 6h6M11 14h6M3 17l6-6M3 11l6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
    blocks: '<rect x="3" y="3" width="4" height="14" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="9" y="3" width="4" height="14" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="15" y="13" width="3" height="3" fill="currentColor"/>',
    half: '<circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 3a7 7 0 0 1 0 14z" fill="currentColor"/>',
    ruler: '<rect x="2" y="7" width="16" height="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 7v3M8 7v2M11 7v3M14 7v2" stroke="currentColor" stroke-width="1.6"/>',
    chart: '<path d="M3 17h14M5 17V10M10 17V5M15 17v-5" stroke="currentColor" stroke-width="2.6" fill="none"/>',
    shape: '<path d="M10 3l7 13H3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    ratio: '<circle cx="5" cy="6" r="2" fill="currentColor"/><circle cx="5" cy="14" r="2" fill="currentColor"/><path d="M10 15l6-10" stroke="currentColor" stroke-width="2"/>',
    mixed: '<path d="M3 6h3l8 8h3M3 14h3l8-8h3M15 4l2 2-2 2M15 12l2 2-2 2" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    book: '<path d="M3 4h5a2 2 0 0 1 2 2v11a2 2 0 0 0-2-2H3zM17 4h-5a2 2 0 0 0-2 2v11a2 2 0 0 1 2-2h5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    nostd: '<rect x="4" y="4" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2"/>',
    search: '<circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M14 14l4 4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    skills: '<rect x="3" y="3" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><rect x="11" y="3" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3" y="11" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><rect x="11" y="11" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2"/>',
    lessons: '<path d="M3 4h14v10H3zM7 17h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    classes: '<circle cx="7" cy="7" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="14" cy="8" r="2.4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 17c0-3 2.5-5 5-5s5 2 5 5M12 17c0-2 1.4-4 3-4s3 1.6 3 4" fill="none" stroke="currentColor" stroke-width="2"/>',
    me: '<circle cx="10" cy="7" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 18c0-4 3-6 7-6s7 2 7 6" fill="none" stroke="currentColor" stroke-width="2"/>',
    print: '<path d="M5 8V3h10v5M5 14H3V8h14v6h-2M6 12h8v6H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    quiz: '<path d="M5 3h10v14H5zM8 7h4M8 10h4M8 13h2" fill="none" stroke="currentColor" stroke-width="2"/>',
    share: '<circle cx="5" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="15" cy="5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="15" cy="15" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 9l6-3M7 11l6 3" stroke="currentColor" stroke-width="2"/>',
    copy: '<rect x="7" y="7" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 4H4v9" fill="none" stroke="currentColor" stroke-width="2"/>',
    board: '<rect x="2" y="3" width="16" height="11" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 14v4M6 18h8" stroke="currentColor" stroke-width="2"/>',
    close: '<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    dice: '<rect x="3" y="3" width="14" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7.5" cy="7.5" r="1.4" fill="currentColor"/><circle cx="12.5" cy="12.5" r="1.4" fill="currentColor"/><circle cx="12.5" cy="7.5" r="1.4" fill="currentColor"/><circle cx="7.5" cy="12.5" r="1.4" fill="currentColor"/>',
    check: '<path d="M4 10l4 4 8-9" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    up: '<path d="M5 12l5-5 5 5" stroke="currentColor" stroke-width="2.4" fill="none"/>',
    lock: '<rect x="4" y="9" width="12" height="9" rx="1.5" fill="currentColor"/><path d="M7 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" stroke-width="2" fill="none"/>',
    unlock: '<rect x="4" y="9" width="12" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 9V6a3 3 0 0 1 6 0" stroke="currentColor" stroke-width="2" fill="none"/>',
  };
  const icon = (k) => `<svg class="icon" viewBox="0 0 20 20" aria-hidden="true">${P[k] || ''}</svg>`;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const SK = Object.fromEntries(D.skills.map(s => [s.c + ':' + s.v, s]));
  const id = (s) => s.c + ':' + s.v;
  const areaName = (a) => AREAS[a].name;
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  // ---------------- state ----------------
  const qs = new URLSearchParams(location.search);
  const GORDER0 = ['PK', 'K', '1', '2', '3', '4', '5', '6', 'M'];
  const DEMO = {
    demo1: ['addition:add_facts'],
    demo3: ['addition:add_word_problems', 'subtraction:sub_word_problems', 'multiplication:arrays_groups'],
    demo3x: ['addition:add_facts', 'measurement:time_hour', 'fractions:shade_fraction'],
    lesson: ['composing:base10_build_hundreds', 'placevalue:place_value_disks'],
  };
  const S = {
    screen: 'skills', sheet: null, chip: null, browse: 'area', grade: '2', view: 'medium', q: '', open: {},
    tray: [], seed: 1, fromLesson: false, kind: null, opts: defaultOpts(), w: {}, lock: {}, rest: 'even', sel: [], collapsed: {}, tq: '', detailed: false,
    quiz: { from: 'skills', points: 'one', versions: 1, breakdown: true, std: null, built: false, n: 0 },
    lessons: { grade: '2', area: 'NBT', lesson: 'Y3.B1.S3', last: 'Y3.B1.S3', panelOpen: false, q: '' },
    skillOpts: {}, parts: [], pop: null, confirm: null, quizzes: [
      { name: 'Place value check', skills: ['placevalue:expand', 'placevalue:compare', 'composing:base10_build'], n: 12, versions: 2, when: 'Monday' },
      { name: 'Time to the hour and half hour', skills: ['measurement:time_hour', 'measurement:time_half_hour'], n: 10, versions: 1, when: 'last week' },
    ],
    classes: 'board', profile: false, trayOpen: false, copied: false, last: null, toast: '', sets: [
      { name: 'Grade 2 Monday warm-up', skills: ['addition:add_facts', 'subtraction:sub_facts', 'measurement:time_hour'] },
      { name: 'Place value catch-up', skills: ['composing:base10_build', 'placevalue:expand', 'placevalue:compare'] },
      { name: 'Word problems within 100', skills: ['addition:add_wp_100', 'subtraction:sub_wp_100'] },
    ], share: { mode: 'practice', timer: 'off', count: '20', lock: false, quick: false },
  };
  function defaultOpts() { return { pages: 1, examples: 'none', sections: 'per-skill', fade: 'none', layout: 'standard', review: false, size: 'M', prereq: false, header: true, key: 'end', keyStyle: 'answers', nline: false, cols: 'auto' }; }
  const theme = qs.get('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  // a WHOLE GRADE (or area) = every skill of that grade, one of each: no Mixed pools, no Maths words cards, and no
  // "(No Pictures)" / "(No Visuals)" twin of a skill that is already in
  function wholeSet(g, a) { return D.skills.filter(s => s.g === g && !s.p && s.a !== 'WORDS' && (!a || s.a === a) && !/\((no pictures|no visuals)\)/i.test(s.l)).map(id); }
  const tp = qs.get('tray');
  if (tp) {
    const m = tp.match(/^grades?(\w)(?:-(\w))?$/), dm = tp.match(/^demo(\d+)$/);
    if (m) { const g1 = GORDER0.indexOf(m[1]), g2 = m[2] ? GORDER0.indexOf(m[2]) : g1; S.tray = GORDER0.slice(g1, g2 + 1).flatMap(g => wholeSet(g)); }
    else if (dm && !DEMO[tp]) { const n = Number(dm[1]); S.tray = wholeSet('3').concat(wholeSet('2')).slice(0, n); }
    else S.tray = (DEMO[tp] || tp.split(',')).filter(k => SK[k]);
  }
  if (tp === 'lesson') { S.fromLesson = true; }
  if (qs.get('kind')) S.kind = qs.get('kind');
  if (qs.get('sections')) S.opts.sections = qs.get('sections');
  if (qs.get('view')) S.view = qs.get('view');
  if (qs.get('browse')) S.browse = qs.get('browse');
  if (qs.get('grade')) S.grade = qs.get('grade');
  if (qs.get('q')) S.q = qs.get('q');
  if (qs.get('more')) S.moreOpen = true;
  if (qs.get('built')) { S.quiz.built = true; S.quiz.from = 'standard'; S.quiz.std = qs.get('built'); }
  if (qs.get('ctab')) S.classes = qs.get('ctab') === 'results' ? 'quizzes' : qs.get('ctab');
  if (qs.get('lw')) S.lessons.panelOpen = false;
  try { S.detailed = localStorage.getItem('mq_t2_detailed') === '1'; S.tview = localStorage.getItem('mq_t2_tview') || 'list'; } catch (e) { /* private window: off */ }
  if (!['list', 'chips', 'thumbs'].includes(S.tview)) S.tview = 'list';
  if (qs.get('tview')) S.tview = qs.get('tview');
  if (qs.get('detailed')) S.detailed = qs.get('detailed') === '1';

  function readHash() {
    const h = location.hash.replace(/^#/, '');
    const [k, arg] = h.split('/');
    S.sheet = null; S.profile = false; S.trayOpen = false;
    if (['skills', 'lessons', 'classes'].includes(k)) S.screen = k;
    else if (k === 'chip' && arg && SK[decodeURIComponent(arg)]) { S.sheet = 'chip'; S.chip = decodeURIComponent(arg); if (!S.tray.includes(S.chip)) S.tray.push(S.chip); }
    else if (['print', 'quiz', 'share', 'quizshare', 'board', 'lessonprint', 'buildfrom'].includes(k)) { S.sheet = k; if (k === 'buildfrom') { S.sheet = 'quiz'; S.quiz.from = 'standard'; } }
    else if (k === 'lessonpanel') { S.screen = 'lessons'; S.lessons.panelOpen = true; }
    else if (k === 'profile') S.profile = true;
    else if (k === 'trayopen' || k === 'tray') S.sheet = 'tray';
    else if (k === 'bulkopts') S.sheet = 'bulkopts';
    if (S.sheet === 'lessonprint') S.screen = 'lessons';
  }
  function setHash() {
    const h = S.sheet === 'chip' ? 'chip/' + encodeURIComponent(S.chip) : S.sheet || (S.profile ? 'profile' : S.screen);
    history.replaceState(null, '', location.pathname + location.search + '#' + h);
  }

  // ---------------- worksheet rules (§2.5) ----------------
  function autoKind() { if (S.fromLesson) return 'sections'; return S.tray.length >= 2 ? 'mixed' : 'single'; }
  function kind() { return S.kind || autoKind(); }
  function kindDefaults(o) {
    // Examples: None, or "the first time each kind appears" (top of the page on Single skill) when the paper comes from a lesson.
    const k = kind();
    o.examples = S.fromLesson ? (k === 'single' ? 'top' : 'first') : 'none';
    // a big tray (> 8 skills) starts with enough pages for every skill once; Single skill starts at one page per skill
    o.pages = k === 'single' ? Math.max(1, S.tray.length) : big() ? Math.min(30, Math.ceil(activeTray().length / PER_PAGE[o.size || 'M'])) : 1;
    if (big() && k === 'sections') o.sections = 'per-area';
    if (k !== 'single') o.layout = 'standard';
    return o;
  }
  const PER_PAGE = { S: 12, M: 8, L: 6 };
  // ---- weights (fix round 3, owner 2026-10-23): ONE place for How often. Each skill has a number weight 0–10 (Less ·
  //      Equal · More = 1 · 2 · 3; 0 = left out for now, still in the tray). A skill, a grade inside an area, or an area
  //      can be LOCKED at a target percentage; the rest share what is left by weight ("split evenly" resets their
  //      weights to Equal when a lock is set, "keep proportions" leaves them). Counts are whole numbers by largest
  //      remainder, ties broken by the seed, and the summary line and the preview both read plan().
  const WEIGHT = { less: 1, equal: 2, more: 3 };
  const WNAME = { 1: 'Less', 2: 'Equal', 3: 'More' };
  const wOf = (k) => (k in S.w ? S.w[k] : 2);
  const wWord = (n) => WNAME[n] || (n === 0 ? 'Left out' : 'Weight ' + n);
  const activeTray = () => S.tray.filter(k => wOf(k) > 0);
  const gkey = (k) => SK[k].a + '|' + SK[k].g;
  function alloc(skills, pct, depth, out, errs) {
    const fixed = []; let rest = skills.slice();
    const take = (pred) => { const t = rest.filter(pred); rest = rest.filter(k => !pred(k)); return t; };
    if (depth < 1) for (const a of [...new Set(rest.map(k => SK[k].a))]) if (S.lock['a:' + a] !== undefined) fixed.push({ sk: take(k => SK[k].a === a), pct: S.lock['a:' + a], d: 1, key: 'a:' + a });
    if (depth < 2) for (const g of [...new Set(rest.map(gkey))]) if (S.lock['g:' + g] !== undefined) fixed.push({ sk: take(k => gkey(k) === g), pct: S.lock['g:' + g], d: 2, key: 'g:' + g });
    for (const k of rest.slice()) if (S.lock['k:' + k] !== undefined) fixed.push({ sk: take(x => x === k), pct: S.lock['k:' + k], d: 3, key: 'k:' + k });
    const used = fixed.reduce((t, f) => t + f.pct, 0);
    if (used > pct + 0.01) errs.push(`${fixed.map(f => f.key.replace(/^[akg]:/, '')).join(' + ')} come to ${Math.round(used)} %, more than the ${Math.round(pct)} % there is`);
    const rem = Math.max(0, pct - used);
    for (const f of fixed) { if (f.d === 3) out[f.sk[0]] = f.pct; else alloc(f.sk, f.pct, f.d, out, errs); }
    const ws = rest.reduce((t, k) => t + wOf(k), 0);
    if (rest.length) rest.forEach(k => { out[k] = ws ? rem * wOf(k) / ws : 0; });
    else if (rem > 0.01 && fixed.length) { const tot = fixed.reduce((t, f) => t + f.pct, 0) || 1; fixed.forEach(f => f.sk.forEach(k => { out[k] += rem * (out[k] || 0) / tot; })); }
  }
  function shares() { const out = {}, errs = []; const act = activeTray(); if (act.length) alloc(act, 100, 0, out, errs); return { pct: out, errs }; }
  function hash(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function roundLR(exact, total, seed) {   // largest remainder; ties broken by the seed (New numbers re-deals a sample)
    const ks = Object.keys(exact); const fl = {}; let used = 0;
    ks.forEach(k => { fl[k] = Math.floor(exact[k] + 1e-9); used += fl[k]; });
    ks.slice().sort((x, y) => (exact[y] - fl[y]) - (exact[x] - fl[x]) || hash(seed + x) - hash(seed + y)).slice(0, Math.max(0, total - used)).forEach(k => { fl[k]++; });
    return fl;
  }
  // rounded area by area, then grade by grade, then skill by skill, so an area held at 40 % gets its 40 % (± 1) and not
  // the sum of its skills' rounded-down shares
  function roundTree(exact, total, seed) {
    const out = {}; const keys = Object.keys(exact); const sum = (ks) => ks.reduce((t, k) => t + exact[k], 0);
    const areas = {}; keys.forEach(k => (areas[SK[k].a] = areas[SK[k].a] || []).push(k));
    const aN = roundLR(Object.fromEntries(Object.entries(areas).map(([a, ks]) => [a, sum(ks)])), total, seed + 'a');
    for (const [a, ks] of Object.entries(areas)) {
      const gs = {}; ks.forEach(k => (gs[SK[k].g] = gs[SK[k].g] || []).push(k)); const as = sum(ks) || 1;
      const gN = roundLR(Object.fromEntries(Object.entries(gs).map(([g, gk]) => [g, aN[a] * sum(gk) / as])), aN[a], seed + a);
      for (const [g, gk] of Object.entries(gs)) { const s2 = sum(gk) || 1; Object.assign(out, roundLR(Object.fromEntries(gk.map(k => [k, gN[g] * exact[k] / s2])), gN[g], seed + a + g)); }
    }
    return out;
  }
  const big = () => S.tray.length > 8;
  const anyLock = () => Object.keys(S.lock).length > 0;
  function plan(isQuiz) {
    const k = kind(), n = S.tray.length, per = PER_PAGE[S.opts.size], act = activeTray();
    let pages = S.opts.pages, added = false, total, counts = {};
    const sh = shares();
    if (k === 'single') {
      // each skill its own pages, shared out by weight; the count starts at one page per skill
      const pg = roundLR(Object.fromEntries(act.map(x => [x, pages * (sh.pct[x] || 0) / 100])), pages, 'p' + S.seed);
      act.forEach(x => { counts[x] = pg[x] * per; }); total = pages * per;
    } else {
      total = isQuiz && S.quiz.n ? S.quiz.n : per * pages;
      // a small tray (2–8 skills, no locks): pages are added so every skill comes up at least twice
      if (!isQuiz && n <= 8 && !anyLock() && k === 'mixed' && act.length * 2 > total) { pages = Math.ceil(act.length * 2 / per); total = per * pages; added = true; }
      if (!isQuiz && n <= 8 && k === 'sections' && act.length > total / 2) { pages = Math.ceil(act.length * 2 / per); total = per * pages; added = true; }
      counts = roundTree(Object.fromEntries(act.map(x => [x, total * (sh.pct[x] || 0) / 100])), total, 's' + S.seed);
      if (n <= 8 && !anyLock()) {   // at least two of each when there is room (the old rule for small trays)
        for (const x of act) while (counts[x] < 2 && total >= act.length * 2) { const donor = act.filter(y => counts[y] > 2).sort((a, b) => counts[b] - counts[a])[0]; if (!donor) break; counts[donor]--; counts[x]++; }
      }
      if (isQuiz) pages = Math.max(1, Math.ceil(total / per));
    }
    // deal the problems onto pages: Mixed shuffles (seeded), Sections and Single keep each skill together
    const items = []; S.tray.forEach(x => { for (let i = 0; i < (counts[x] || 0); i++) items.push(x); });
    if (k === 'mixed') { const r = T.rng('deal' + S.seed); for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; } }
    if (k === 'sections' && big()) items.sort((x, y) => ORDER.indexOf(SK[x].a) - ORDER.indexOf(SK[y].a) || GORDER.indexOf(SK[x].g) - GORDER.indexOf(SK[y].g));
    const pageItems = []; for (let i = 0; i < items.length; i += per) pageItems.push(items.slice(i, i + per));
    const perPage = pageItems.map(pg => { const o = {}; pg.forEach(x => { o[x] = (o[x] || 0) + 1; }); return o; });
    const countsArr = S.tray.map(x => counts[x] || 0);
    const shown = act.filter(x => counts[x] > 0).length;
    return { k, pages: Math.max(pages, pageItems.length), added, total, counts: countsArr, byKey: counts, perPage, pageItems, shown, active: act.length, left: n - act.length, pct: sh.pct, errs: sh.errs };
  }
  function areasOf(list) { const by = {}; list.forEach(k => (by[SK[k].a] = by[SK[k].a] || []).push(k)); return ORDER.concat(['NOSTD']).filter(a => by[a]).map(a => ({ a, ks: by[a] })); }
  function gradesOf(list) { const by = {}; list.forEach(k => (by[SK[k].g] = by[SK[k].g] || []).push(k)); return GORDER.filter(g => by[g]).map(g => ({ g, ks: by[g] })); }
  function trayTitle() {
    const gs = gradesOf(S.tray).map(x => x.g); const as = areasOf(S.tray).length;
    const gt = gs.length === 1 ? gradeName(gs[0]) : gs.length === 2 ? `Grades ${gs[0]}–${gs[1]}`.replace('Grades K', 'Grades K') : `${gs.length} grades`;
    return `${gt} · ${plural(S.tray.length, 'skill')} · ${plural(as, 'maths area')}`;
  }
  function summaryText(isQuiz) {
    if (!S.tray.length) return { line: 'Tick skills first', more: '' };
    const p = plan(isQuiz);
    const pg = `${p.pages} page${p.pages > 1 ? 's' : ''}`;
    const ver = isQuiz && S.quiz.versions > 1 ? ` · ${S.quiz.versions} versions, each with its own order and key` : '';
    const pts = isQuiz ? ` · ${p.total * (S.quiz.points === 'two' ? 2 : 1)} points` : '';
    const left = p.left ? ` · ${p.left} left out` : '';
    if (big()) {
      const areas = areasOf(activeTray());
      const cover = p.shown >= p.active ? 'every skill at least once' : `a sample of ${p.shown} of ${p.active} skills, New numbers re-deals the sample`;
      return { line: `${pg} · ${p.total} ${isQuiz ? 'questions' : 'problems'} · ${plural(areas.length, 'area')} · ${cover}${left}${pts}${ver}`,
        more: areas.map(x => `${AREAS[x.a].short} ${x.ks.reduce((t, k) => t + (p.byKey[k] || 0), 0)}`).join(', ') + ' · answer key at the end' };
    }
    const names = S.tray.map((s, i) => `${short(SK[s].l)} ${wOf(s) ? (anyLock() || S.detailed ? '≈ ' : '') + p.counts[i] : '(left out)'}`).join(', ');
    return {
      line: `${pg} · ${p.total} ${isQuiz ? 'questions' : 'problems'}${pts} · answer key at the end${left}${ver}`,
      more: (S.tray.length > 1 ? names : short(SK[S.tray[0]].l)) + (p.added ? ` · pages added so every skill comes up at least twice` : ''),
    };
  }
  const short = (l) => l.replace(/\s*\((?:Visual|MAP|black and white)\)/g, '').replace(/\s*\(No Pictures\)/, ' (no pictures)');

  // ---------------- render helpers ----------------
  const pressed = (b) => `aria-pressed="${b ? 'true' : 'false'}"`;
  // The GRADE badge (owner 2026-10-23): a numbered ink circle, never an area colour, always the first thing in its card,
  // chip or row (the fixed slot), so grade and area are told apart without a second colour code.
  const gradeMark = (g) => g === 'K' ? 'K' : g === 'M' ? 'M' : g === 'PK' ? 'P' : String(g);
  const gbadge = (g) => `<span class="gbadge" title="${esc(gradeShort(g))}" aria-label="${esc(gradeShort(g))}">${gradeMark(g)}</span>`;
  // A chip: grade badge, area icon, the skill NAME (it has priority), then the area's short word. The word drops (the chip
  // goes compact, fitChips) before the name would be cut; on the tray the area word is the group's legend instead.
  function chipHTML(k, opts = {}) {
    const s = SK[k]; const a = s.a; const tag = opts.tag || 'button';
    const attrs = tag === 'button' ? `data-act="${opts.act || 'chip'}" data-arg="${esc(k)}" ${opts.pressed ? pressed(true) : ''}` : '';
    return `<${tag} class="chip" data-domain="${a}" data-grade-host ${attrs} title="${esc(s.l)} · ${areaName(a)} · ${gradeShort(s.g)}">` +
      `${gbadge(s.g)}${opts.legend && !opts.dot ? '' : `<span class="chip-dot">${icon(AREAS[a].icon)}</span>`}<span class="name">${esc(short(s.l))}</span>${opts.legend ? '' : `<span class="chip-area">${AREAS[a].short}</span>`}${opts.pressed ? icon('check') : ''}</${tag}>`;
  }
  // drop the area word on any chip whose name (or word) would otherwise be cut; called after every render
  // Critic r3 A3 / D3: the area word is decided per CONTAINER. If any chip in a stack would lose its word, every chip in
  // that stack drops it and the stack carries one legend (area icon + short name) instead.
  function fitChips(root) {
    (root || document).querySelectorAll('.chip-legend').forEach(l => l.remove());
    const stacks = new Map();
    for (const c of (root || document).querySelectorAll('.chip')) {
      c.classList.remove('compact'); const a = c.querySelector('.chip-area'), n = c.querySelector('.name'); if (!a) continue;
      if (!stacks.has(c.parentElement)) stacks.set(c.parentElement, []); stacks.get(c.parentElement).push(c);
      c.classList.add('measure');     // measured on one line: if the name or the word would not fit, the word goes
      c.dataset.cut = (a.scrollWidth > a.clientWidth + 1 || (n && n.scrollWidth > n.clientWidth + 1)) ? '1' : '';
      c.classList.remove('measure');  // a name still too long for its whole row then wraps to a second line, never ellipsized
    }
    for (const [box, chips] of stacks) {
      if (!chips.some(c => c.dataset.cut)) continue;
      chips.forEach(c => c.classList.add('compact'));
      if (chips.length < 2) continue;   // one chip (a table cell): its row names the skill; no legend needed
      const as = [...new Set(chips.map(c => c.dataset.domain))];
      const lg = document.createElement('span'); lg.className = 'chip-legend';
      lg.innerHTML = as.map(a => `<span data-domain="${a}">${icon(AREAS[a].icon)}${AREAS[a].short}</span>`).join('');
      box.insertBefore(lg, chips[0]);
    }
  }
  function areaTag(a, pool) { return `<span class="area-tag">${icon(AREAS[a].icon)}${areaName(a)}</span>${pool ? '<span class="mixed-badge">mixed</span>' : ''}`; }
  function card(s, crossGrade) {
    const k = id(s), on = S.tray.includes(k);
    return `<button class="card" data-domain="${s.a}" data-grade-host data-act="tick" data-skill="${esc(k)}" ${pressed(on)}>` +
      `<div class="card-title">${gbadge(s.g)}<div class="card-name">${esc(s.l).replace(/\//g, '/<wbr>')}</div></div><div class="thumb">${T.draw(s, undefined, S.skillOpts[k])}</div>` +
      `<div class="card-meta">${areaTag(s.a, s.p)}</div>` +
      `<span class="tick" aria-hidden="true"><span>${on ? '✓' : ''}</span></span><span class="sr">${on ? 'In the tray' : 'Tick to add'}</span></button>`;
  }
  function group(a, list, opts = {}) {
    const key = opts.key || a; const lim = S.open[key] ? list.length : (opts.limit || 8);
    const shown = list.slice(0, lim); let body;
    if (opts.cross && new Set(shown.map(s => s.g)).size > 1) {
      // across grades (a search, Mixed levels): the area's skills sub-grouped by grade, each under its badge
      const gs = []; shown.forEach(s => { let g = gs.find(x => x.g === s.g); if (!g) gs.push(g = { g: s.g, l: [] }); g.l.push(s); });
      body = gs.map(g => `<h3 class="grade-head">${gbadge(g.g)}${esc(gradeName(g.g))}<span class="count">${plural(g.l.length, 'skill')}</span></h3><div class="grid mb-16" data-view="${S.view}">${g.l.map(s => card(s, true)).join('')}</div>`).join('');
    } else body = `<div class="grid" data-view="${S.view}">${shown.map(s => card(s, opts.cross)).join('')}</div>`;
    const addA = opts.addArea ? `<button class="btn btn-add" data-act="addarea" data-arg="${a}">+ Add whole area (${wholeSet(S.grade, a).length})</button>` : '';
    return `<section class="group" data-domain="${a}" data-group="${key}"><div class="band-row"><h2 class="band">${icon(AREAS[a].icon)}${esc(opts.title || AREAS[a].long)}<span class="count">${opts.count || plural(list.length, 'skill')}</span></h2>${addA}</div>` + body +
      (list.length > lim ? `<button class="btn more-btn" data-act="showall" data-arg="${esc(key)}">Show all ${list.length}</button>` : '') + '</section>';
  }
  const GORDER = ['PK', 'K', '1', '2', '3', '4', '5', '6', 'M'];
  const stdSort = (x, y) => (x.s || 'zz').localeCompare(y.s || 'zz', 'en', { numeric: true }) || x.l.localeCompare(y.l);

  // ---------------- Skills ----------------
  function skillsScreen() {
    const browse = [['area', 'Maths area', 'Area'], ['wrm', 'White Rose step', 'White Rose'], ['std', 'Standard', 'Standard'], ['map', 'MAP strand', 'MAP'], ['sets', 'My sets', 'Sets']];
    const views = [['big', 'Big'], ['medium', 'Medium'], ['small', 'Small'], ['list', 'List']];
    const n = D.skills.filter(s => s.g === S.grade).length; const searching = !!S.q.trim();
    const gradePills = GRADES.map(([g, l]) => `<button class="pill" data-act="grade" data-arg="${g}" ${pressed(S.grade === g && !searching)}>${S.grade === g && !searching ? icon('check') : ''}${l}</button>`).join('');
    const viewSeg = `<div class="seg wrap" role="group" aria-label="View">${views.map(([k, l]) => `<button data-act="view" data-arg="${k}" ${pressed(S.view === k)}>${l}</button>`).join('')}</div>`;
    const gradeName2 = searching ? 'All grades' : gradeName(S.grade);
    const hitN = searching ? skillHits().length : 0;
    return `<div class="head head-skills"><div class="head-text"><p class="eyebrow wide-only">Maths Quest · Teacher · ${searching ? `All grades · ${plural(hitN, 'skill')} ${hitN === 1 ? 'matches' : 'match'}` : `${esc(gradeName(S.grade))} · ${plural(n, 'skill')}`}</p><h1 class="title">Skills</h1></div><label class="search">${icon('search')}<span class="sr">Find a skill</span>` +
      `<input id="search" type="search" placeholder="Find a skill: “add within 20”, “2.NBT.5”, “clocks”" value="${esc(S.q)}" autocomplete="off" data-act="search"></label></div>` +
      `<p class="serif roomy-only">Tick what you need; it waits in the tray below.</p>` +
      `<div class="row"><span class="row-label wide-only">Browse by</span><div class="seg seg-big wrap" role="group" aria-label="Browse by">${browse.map(([k, l, sh]) => `<button data-act="browse" data-arg="${k}" ${pressed(S.browse === k)}><span class="roomy-only">${l}</span><span class="compact-only">${sh}</span></button>`).join('')}</div>` +
      `<span class="spacer roomy-only"></span><div class="roomy-only">${viewSeg}</div></div>` +
      `<div class="row roomy-only"><div class="pills wrap" role="group" aria-label="Grade">${gradePills}</div>${searching ? '<span class="note">Searching all grades</span>' : ''}</div>` +
      `<div class="row compact-only compact"><button class="btn pop-btn" data-act="pop" data-arg="grade" aria-expanded="${S.pop === 'grade'}">${gradeName2} ▾</button><button class="btn pop-btn" data-act="pop" data-arg="view" aria-expanded="${S.pop === 'view'}">${views.find(v => v[0] === S.view)[1]} cards ▾</button></div>` +
      (S.pop === 'grade' ? `<div class="pop compact-only" role="group" aria-label="Grade"><div class="pills wrap">${gradePills}</div></div>` : '') +
      (S.pop === 'view' ? `<div class="pop compact-only">${viewSeg}</div>` : '') +
      `<div id="skill-list">${skillList()}</div>`;
  }
  function skillHits() { const words = S.q.trim().toLowerCase().split(/\s+/); return D.skills.filter(s => words.every(w => (s.l + ' ' + s.v + ' ' + s.c + ' ' + s.s + ' ' + areaName(s.a)).toLowerCase().includes(w))); }
  function skillList() {
    const q = S.q.trim().toLowerCase();
    if (q) {
      const hits = skillHits();
      if (!hits.length) return `<p class="note">No skill matches “${esc(S.q)}”. Try fewer words.</p>`;
      const by = {}; hits.forEach(s => (by[s.a] = by[s.a] || []).push(s));
      return `<p class="note mb-16">${hits.length === 1 ? '1 skill matches' : hits.length + ' skills match'} “${esc(S.q)}” across all grades — each shows its grade.</p>` +
        ORDER.filter(a => by[a]).map(a => group(a, by[a].sort((x, y) => (x.g === S.grade ? -1 : 0) - (y.g === S.grade ? -1 : 0) || GORDER.indexOf(x.g) - GORDER.indexOf(y.g) || stdSort(x, y)), { key: 'q-' + a, cross: true })).join('');
    }
    if (S.browse === 'area') {
      const list = D.skills.filter(s => s.g === S.grade); const by = {}; list.forEach(s => (by[s.a] = by[s.a] || []).push(s));
      const whole = S.grade !== 'M' ? wholeSet(S.grade) : [];
      return (whole.length ? `<div class="add-row"><button class="btn btn-add" data-act="addgrade">+ Add whole grade</button><span class="note">All ${whole.length} ${esc(gradeName(S.grade))} skills, one of each (no Mixed pools or Maths words), into the tray</span></div>` : '') +
        ORDER.filter(a => by[a]).map(a => group(a, by[a].sort((x, y) => S.grade === 'M' ? GORDER.indexOf(x.g) - GORDER.indexOf(y.g) || stdSort(x, y) : stdSort(x, y)), { cross: S.grade === 'M', addArea: S.grade !== 'M' && wholeSet(S.grade, a).length > 1 })).join('');
    }
    if (S.browse === 'wrm') return wrmBrowse();
    if (S.browse === 'std') return stdBrowse();
    if (S.browse === 'map') return mapBrowse();
    return setsBrowse();
  }
  function yearForGrade(g) { return D.years.find(y => y.grade === g) || D.years.find(y => y.grade === '2'); }
  function wrmBrowse() {
    const y = yearForGrade(S.grade === 'M' ? '2' : S.grade);
    return `<p class="note mb-16">White Rose ${esc(y.name)} is ${gradeName(y.grade)}. Each step lists the skills that teach it.</p>` +
      y.blocks.slice(0, 6).map(b => {
        const steps = b.steps.filter(s => s.k.length);
        return `<section class="group" data-domain="${b.a}"><h2 class="band">${icon(AREAS[b.a].icon)}${esc(b.term)} block ${b.n}: ${esc(b.name)}<span class="count">${areaName(b.a)} · ${b.steps.length} steps</span></h2>` +
          steps.slice(0, S.open['w' + b.id] ? 99 : 3).map(st => `<div class="weight-row mb-8"><b>Step ${st.n}: ${esc(st.t)}</b><span class="gpill">${esc(st.s)}</span></div><div class="grid mb-16" data-view="${S.view}">${st.k.map(k => SK[k] && card(SK[k])).join('')}</div>`).join('') +
          (steps.length > 3 && !S.open['w' + b.id] ? `<button class="btn" data-act="showall" data-arg="w${b.id}">Show all ${steps.length} steps</button>` : '') + '</section>';
      }).join('');
  }
  function stdBrowse() {
    const g = S.grade === 'M' ? '2' : S.grade; const list = D.standards.filter(s => s.g === g);
    const by = {}; list.forEach(s => { const a = (s.k[0] && SK[s.k[0]] && SK[s.k[0]].a) || codeArea(s.c); (by[a] = by[a] || []).push(s); });
    return `<div class="row"><div class="seg" role="group" aria-label="Standards"><button aria-pressed="true">Common Core</button><button aria-pressed="false">Essential Elements</button></div><span class="note">${list.filter(s => s.k.length).length} of ${list.length} ${gradeName(g)} standards have skills.</span></div>` +
      ORDER.filter(a => by[a]).map(a => `<section class="group" data-domain="${a}"><h2 class="band">${icon(AREAS[a].icon)}${AREAS[a].long}<span class="count">${by[a].length} standards</span></h2>` +
        by[a].slice(0, S.open['s' + a] ? 99 : 4).map(s => `<div class="weight-row mb-8"><span class="gpill">${esc(s.c)}</span><span class="badge ${s.k.length ? '' : 'quiet'}">${s.k.length ? '✓ Covered' : 'Not yet'}</span>${s.k.length > 1 ? `<button class="btn btn-add" data-act="addstd" data-arg="${esc(s.c)}">+ Add all ${s.k.length}</button>` : ''}</div><p class="note mb-8">${esc(s.t)}</p>` +
          (s.k.length ? `<div class="grid mb-16" data-view="${S.view}">${s.k.slice(0, 4).map(k => card(SK[k])).join('')}</div>` : '')).join('') +
        (by[a].length > 4 && !S.open['s' + a] ? `<button class="btn" data-act="showall" data-arg="s${a}">Show all ${by[a].length}</button>` : '') + '</section>').join('');
  }
  function codeArea(c) { const m = c.match(/^(K|\d)\.([A-Z]+)\.?([A-Z])?/); if (!m) return 'NOSTD'; const d = m[2]; return d === 'CC' ? 'CC' : d === 'OA' || d === 'EE' ? 'OA' : d === 'NBT' ? 'NBT' : d === 'NF' ? 'NF' : d === 'MD' ? 'MEAS' : d === 'G' ? 'G' : d === 'SP' ? 'DATA' : 'RPNS'; }
  function mapBrowse() {
    const strands = {}; D.map.forEach(t => (strands[t.st] = strands[t.st] || []).push(t));
    const SA = { 'Operations & algebra': 'OA', 'Number & place value': 'NBT', 'Fractions & decimals': 'NF', 'Multiplication & division': 'OA', 'Geometry': 'G', 'Measurement': 'MEAS', 'Data & graphing': 'DATA' };
    return `<p class="note mb-16">Pick a MAP task: its skills go into the tray.</p>` + Object.entries(strands).map(([st, ts]) => {
      const a = SA[st] || 'NOSTD'; const lim = S.open['m' + st] ? 99 : 6;
      return `<section class="group" data-domain="${a}"><h2 class="band">${icon(AREAS[a].icon)}${esc(st)}<span class="count">${ts.length} tasks</span></h2><div class="grid" data-view="list">` +
        ts.slice(0, lim).map((t, i) => `<button class="card" data-domain="${a}" data-act="maptask" data-arg="${esc(st)}|${i}"><div class="card-name">${esc(t.t)}</div><div class="card-meta">${areaTag(a)}<span class="gpill">RIT ${esc(t.b)}</span><span class="gpill">${t.k.length} skill${t.k.length > 1 ? 's' : ''}</span></div></button>`).join('') +
        `</div>${ts.length > lim ? `<button class="btn more-btn" data-act="showall" data-arg="m${esc(st)}">Show all ${ts.length}</button>` : ''}</section>`;
    }).join('');
  }
  function setsBrowse() {
    return `<p class="note mb-16">Your tray saves itself as a set. Open a set to put its skills in the tray. Saved quizzes are in Classes › Quizzes.</p><div class="cards2">` +
      S.sets.map((st, i) => `<button class="box box-btn" data-act="openset" data-arg="${i}"><h3>${esc(st.name)}</h3><div class="panel-chips">${st.skills.map(k => chipHTML(k, { tag: 'span' })).join('')}</div><span class="note">${plural(st.skills.length, 'skill')} · open to print, quiz or share</span></button>`).join('') + '</div>';
  }

  // ---------------- tray ----------------
  // Fix round 3 (critic r3 A1, owner 2026-10-23: trays of 40–100+ skills). The tray NEVER grows with its skills:
  //  - up to 8 skills: ONE row of chips (grade badge, area icon, name; the area words are a legend once, beside the count);
  //    chips that do not fit become "+N more" (fitTray, after every render);
  //  - more than 8: ONE summary bar, "Grade 3 · 110 skills · 6 maths areas", with a segment per area (icon, short name,
  //    count, outlined in the area colour) in the fixed area order;
  //  - the phone: "N skills ▸".
  // Every one of them opens the TRAY POPUP (trayPop): area → grade → skill, where skills are found, selected, weighted
  // and removed — the one place How often is set.
  function tray() {
    const n = S.tray.length; const dis = n ? '' : 'disabled aria-disabled="true"';
    const label = n ? plural(n, 'skill') : 'Empty';
    const areas = areasOf(S.tray);
    const legend = `<span class="tray-key" title="${esc(areas.map(x => AREAS[x.a].name).join(' · '))}">${areas.map(x => `<span data-domain="${x.a}">${icon(AREAS[x.a].icon)}${areas.length > 1 ? ABBR[x.a] : AREAS[x.a].short}</span>`).join('')}</span>`;
    let mid;
    if (!n) mid = `<div class="tray-empty">Tick skills to put them here. Quiz can also start from a standard, a White Rose step or a lesson.</div>`;
    // the bar follows the tray's view (owner 2026-10-23): List = one line of names, Chips = chips, Thumbnails = mini pictures
    else if (!big()) mid = `<div class="tray-chips tray-v-${S.tview}">${S.tray.map(k => S.tview === 'chips' ? chipHTML(k, { legend: true, dot: true })
      : S.tview === 'thumbs' ? `<button class="tray-mini" data-domain="${SK[k].a}" data-grade-host data-act="chip" data-arg="${esc(k)}" title="${esc(SK[k].l)}">${gbadge(SK[k].g)}<span class="tray-mini-pic">${T.draw(SK[k], 1, S.skillOpts[k])}</span><span class="sr">${esc(short(SK[k].l))}</span></button>`
      : `<button class="tray-li" data-domain="${SK[k].a}" data-act="chip" data-arg="${esc(k)}">${icon(AREAS[SK[k].a].icon)}${esc(short(SK[k].l))}</button>`).join('')}<button class="btn tray-more" data-act="trayopen" hidden>+0 more</button></div>`;
    else mid = `<div class="tray-summary"><div class="tray-segs">${areas.map(x => `<button class="tray-seg" data-domain="${x.a}" data-act="trayarea" data-arg="${x.a}" title="${esc(AREAS[x.a].name)}: open in the tray">${icon(AREAS[x.a].icon)}<span class="seg-long">${AREAS[x.a].short}</span><span class="seg-abbr">${ABBR[x.a]}</span><b>${x.ks.length}</b></button>`).join('')}<button class="btn tray-more" data-act="trayopen" hidden>+0</button></div></div>`;
    const gs = gradesOf(S.tray).map(x => x.g);
    return `<div class="tray ${big() ? 'tray-big' : ''}" role="region" aria-label="Tray">` +
      (big() ? `<button class="tray-label tray-label-btn" data-act="trayopen"><b>Tray</b><span>${esc(gs.length === 1 ? gradeName(gs[0]) : gs.length === 2 ? `Grades ${gs[0]}–${gs[1]}` : plural(gs.length, 'grade'))}</span><span>${label} · ${plural(areas.length, 'area')} ▸</span></button>`
        : `<div class="tray-label"><b>Tray</b><span>${label}</span>${n && areas.length <= 3 ? legend : ''}</div>`) + mid +
      `<button class="btn tray-count ${big() ? 'tray-summary' : ''}" data-act="trayopen">${n ? `${label} ▸` : 'Tray empty'}</button>` +
      `<div class="tray-actions">${n ? '' : '<span class="tray-hint">Tick skills first</span>'}` +
      `<button class="btn" data-act="tray-quiz">${icon('quiz')}Quiz</button>` +
      `<button class="btn" data-act="tray-share" ${dis}>${icon('share')}Share</button>` +
      `<button class="btn ${n ? 'btn-primary' : ''}" data-act="tray-print" ${dis}>${icon('print')}Print</button></div></div>`;
  }
  // one row only: hide the chips (or area segments) that do not fit and say how many more there are
  function fitTray() {
    const t = document.querySelector('.tray'); if (!t) return;
    for (const row of t.querySelectorAll('.tray-chips, .tray-segs')) {
      row.hidden = false;
      const more = row.querySelector('.tray-more'); const items = [...row.children].filter(c => c !== more);
      items.forEach(c => { c.hidden = false; }); more.hidden = true; row.classList.remove('abbr');
      if (row.scrollWidth <= row.clientWidth + 1) continue;
      if (row.classList.contains('tray-segs')) { row.classList.add('abbr'); if (row.scrollWidth <= row.clientWidth + 1) continue; }
      more.hidden = false; let hid = 0;
      for (let i = items.length - 1; i >= 0 && row.scrollWidth > row.clientWidth + 1; i--) { items[i].hidden = true; hid++; more.textContent = row.classList.contains('tray-segs') ? `+${hid} area${hid > 1 ? 's' : ''}` : `+${hid} more`; }
      // not even the "+N" fits (a narrow tablet): the area row goes, the count button beside it still opens the tray
      if (row.scrollWidth > row.clientWidth + 1 && row.classList.contains('tray-segs')) row.hidden = true;
    }
  }
  // ---- the tray popup: area → grade → skill (owner 2026-10-23)
  const sel = () => new Set(S.sel);
  function scopeKeys(scope) {   // 'all' | 'a:OA' | 'g:OA|3' | 'k:<key>'
    if (scope === 'all') return S.tray.slice();
    const [t, v] = [scope.slice(0, 1), scope.slice(2)];
    return t === 'a' ? S.tray.filter(k => SK[k].a === v) : t === 'g' ? S.tray.filter(k => gkey(k) === v) : t === 'r' ? S.tray.filter(k => SK[k].g === v) : [v];
  }
  function selBox(scope, label) {
    const ks = scopeKeys(scope), on = ks.filter(k => S.sel.includes(k)).length;
    const st = on === 0 ? 'false' : on === ks.length ? 'true' : 'mixed';
    return `<button class="selbox" role="checkbox" aria-checked="${st}" aria-label="Select ${esc(label)}" data-act="sel" data-arg="${esc(scope)}"><i>${st === 'true' ? '✓' : st === 'mixed' ? '–' : ''}</i></button>`;
  }
  function howOften(scope) {
    const ks = scopeKeys(scope).filter(k => S.lock['k:' + k] === undefined); const ws = new Set(ks.map(wOf)); const cur = ws.size === 1 ? String([...ws][0]) : '';
    return `<div class="seg seg-sm" role="group" aria-label="How often">${[['1', 'Less'], ['2', 'Equal'], ['3', 'More']].map(([v, l]) => `<button data-act="hw" data-arg="${esc(scope)}|${v}" ${pressed(cur === v)}>${l}</button>`).join('')}</div>${cur ? '' : `<span class="tag">Mixed</span>`}`;
  }
  function pctCtl(scope, p) {
    const locked = S.lock[scope] !== undefined; const v = locked ? S.lock[scope] : Math.round(p * 10) / 10;
    return `<span class="pct-ctl"><label class="pct-in"><span class="sr">Share of the page</span><input type="number" min="0" max="100" step="1" class="pct" data-scope="${esc(scope)}" value="${Math.round(v)}" aria-label="Target %"><span>%</span></label>` +
      `<button class="btn icon-btn lock" data-act="lock" data-arg="${esc(scope)}" aria-pressed="${locked}" title="${locked ? 'Held at this %' : 'Hold this %'}" aria-label="${locked ? 'Unlock' : 'Lock'} this %">${icon(locked ? 'lock' : 'unlock')}</button></span>`;
  }
  function trayPop() {
    const p = plan(); const q = S.tq.trim().toLowerCase(); const det = S.detailed;
    const match = (k) => !q || (SK[k].l + ' ' + SK[k].v + ' ' + (SK[k].s || '')).toLowerCase().includes(q);
    const areas = areasOf(S.tray); const collapsedDefault = areas.length > 3;
    const isCollapsed = (a) => !q && (a in S.collapsed ? S.collapsed[a] : collapsedDefault);
    const sumOf = (ks) => ks.reduce((t, k) => t + (p.pct[k] || 0), 0);
    const nOf = (ks) => ks.reduce((t, k) => t + (p.byKey[k] || 0), 0);
    // one skill in the chosen view (List · Chips · Thumbnails); selecting, weighting and removing are the same in each
    const row = (k) => {
      const s = SK[k], w = wOf(k), changed = S.skillOpts[k] && Object.keys(S.skillOpts[k]).length, locked = S.lock['k:' + k] !== undefined;
      const tags = `<span class="tp-tags">${changed ? '<span class="tag">changed</span>' : ''}${w !== 2 || locked ? `<span class="tag tag-w">${locked ? Math.round(S.lock['k:' + k]) + ' %' : wWord(w)}</span>` : ''}</span>`;
      const detail = det ? `<span class="tp-det"><span class="stepper stepper-sm"><button data-act="wstep" data-arg="${esc(k)}|-1" aria-label="Less weight" ${w <= 0 ? 'disabled' : ''}>−</button><output>${w}</output><button data-act="wstep" data-arg="${esc(k)}|1" aria-label="More weight" ${w >= 10 ? 'disabled' : ''}>+</button></span>${pctCtl('k:' + k, p.pct[k] || 0)}<span class="tp-share">≈ ${p.byKey[k] || 0} of ${p.total}</span></span>` : '';
      const x = `<button class="btn icon-btn" data-act="tpremove" data-arg="k:${esc(k)}" aria-label="Take ${esc(short(s.l))} out of the tray">${icon('close')}</button>`;
      if (S.tview === 'chips') return `<div class="tp-item tp-chipitem ${w === 0 ? 'out' : ''}">${selBox('k:' + k, s.l)}${chipHTML(k, { legend: true, dot: true })}${tags}${detail}${x}</div>`;
      if (S.tview === 'thumbs') return `<div class="tp-item tp-thumb ${w === 0 ? 'out' : ''}" data-domain="${s.a}"><div class="tp-thumb-top" data-grade-host>${gbadge(s.g)}<button class="tp-name" data-act="chip" data-arg="${esc(k)}">${esc(short(s.l))}</button></div><div class="thumb">${T.draw(s, 1, S.skillOpts[k])}</div><div class="tp-thumb-foot">${selBox('k:' + k, s.l)}${tags}${x}</div>${detail}</div>`;
      return `<div class="tp-row ${w === 0 ? 'out' : ''}" data-domain="${s.a}" data-grade-host>${gbadge(s.g)}${selBox('k:' + k, s.l)}<span class="tp-icon">${icon(AREAS[s.a].icon)}</span><button class="tp-name" data-act="chip" data-arg="${esc(k)}">${esc(s.l)}</button>${tags}${detail}${x}</div>`;
    };
    const body = areas.map(({ a, ks }) => {
      const vis = ks.filter(match); if (!vis.length) return '';
      const col = isCollapsed(a); const gs = gradesOf(ks);
      return `<section class="tp-area ${col ? 'collapsed' : ''}" data-domain="${a}" id="tp-${a}"><div class="tp-ahead">${selBox('a:' + a, AREAS[a].name)}` +
        `<button class="tp-toggle" data-act="tpcol" data-arg="${a}" aria-expanded="${!col}">${icon(AREAS[a].icon)}<b>${AREAS[a].name}</b><span class="count">${plural(ks.length, 'skill')}${col && gs.length > 1 ? ' · ' + gs.map(g => `${g.g} ${g.ks.length}`).join(' · ') : ''}</span><span class="chev">${col ? '▸' : '▾'}</span></button>` +
        `<span class="tp-ctl">${howOften('a:' + a)}${det ? pctCtl('a:' + a, sumOf(ks)) + `<button class="btn btn-text" data-act="reseteq" data-arg="a:${a}">Reset to equal</button>` : `<span class="tp-p">${Math.round(sumOf(ks))} %</span>`}<button class="btn btn-text" data-act="tpremove" data-arg="a:${a}">Remove area</button></span></div>` +
        (col ? '' : gs.map(({ g, ks: gk }) => { const gv = gk.filter(match); if (!gv.length) return ''; const sc = 'g:' + a + '|' + g;
          return `<div class="tp-grade"><div class="tp-ghead" data-grade-host>${gbadge(g)}${selBox(sc, gradeShort(g))}<b>${esc(gradeShort(g))}</b><span class="count">${plural(gk.length, 'skill')} · ≈ ${nOf(gk)} of ${p.total}</span>` +
            `<span class="tp-ctl">${howOften(sc)}${det ? pctCtl(sc, sumOf(gk)) + `<button class="btn btn-text" data-act="reseteq" data-arg="${esc(sc)}">Reset to equal</button>` : `<span class="tp-p">${Math.round(sumOf(gk))} %</span>`}<button class="btn btn-text" data-act="tpremove" data-arg="${esc(sc)}">Remove grade</button></span></div>` +
            `<div class="tp-items tp-v-${S.tview}">${gv.map(row).join('')}</div></div>`; }).join('')) + '</section>';
    }).join('');
    const grades = gradesOf(S.tray);
    const nSel = S.sel.length;
    const bulk = nSel ? `<div class="tp-bulk" role="group" aria-label="Selected skills"><b>${nSel} selected</b><span class="row-label">How often</span><div class="seg seg-sm">${[['1', 'Less'], ['2', 'Equal'], ['3', 'More']].map(([v, l]) => `<button data-act="bulkw" data-arg="${v}">${l}</button>`).join('')}</div>` +
      (det ? `<span class="stepper stepper-sm"><button data-act="bulkn" data-arg="-1" aria-label="Lower">−</button><output>${S.bulkN ?? 2}</output><button data-act="bulkn" data-arg="1" aria-label="Higher">+</button></span><button class="btn" data-act="bulkset">Set weight</button>` : '') +
      `<button class="btn" data-act="bulkopts">Options…</button><button class="btn" data-act="bulkremove">Remove</button><button class="btn btn-text" data-act="selnone">Clear selection</button></div>` : '';
    const sm = summaryText(false);
    const head = `<div class="tp-tools"><label class="search search-small">${icon('search')}<span class="sr">Find a skill in the tray</span><input id="tsearch" type="search" placeholder="Find a skill in the tray" value="${esc(S.tq)}" data-act="tsearch"></label>` +
      `<button class="toggle" data-act="detailed" ${pressed(det)}><i></i>Detailed weights</button>` +
      `<button class="btn tp-more-btn" data-act="tpmore" aria-expanded="${!!S.tpMore}">View and more ${S.tpMore ? '▴' : '▾'}</button><div class="tp-extra ${S.tpMore ? 'open' : ''}">` +
      `<div class="seg wrap tp-view" role="group" aria-label="View">${[['list', 'List'], ['chips', 'Chips'], ['thumbs', 'Thumbnails']].map(([v, l]) => `<button data-act="tview" data-arg="${v}" ${pressed(S.tview === v)}>${l}</button>`).join('')}</div>` +
      `<button class="btn btn-text" data-act="tpall" data-arg="${areas.some(x => isCollapsed(x.a)) ? 'open' : 'close'}">${areas.some(x => isCollapsed(x.a)) ? 'Expand all' : 'Collapse all'}</button>` +
      `<button class="btn btn-text" data-act="trayclear">Clear tray</button></div></div>` +
      (det ? `<div class="tp-rest tp-extra ${S.tpMore ? 'open' : ''}"><span class="row-label">When you set a %, the rest</span>${seg('The rest', [['even', 'Split evenly'], ['prop', 'Keep proportions']], S.rest, 'rest')}<button class="btn btn-text" data-act="reseteq" data-arg="all">Reset all to equal</button><span class="note">Weight 0 leaves a skill out for now; Less · Equal · More = 1 · 2 · 3.</span></div>` : '') +
      (grades.length > 1 ? `<div class="tp-grades tp-extra ${S.tpMore ? 'open' : ''}"><span class="row-label">Grades</span>${grades.map(x => `<span class="tp-gchip" data-grade-host>${gbadge(x.g)}<span>${esc(gradeShort(x.g))} · ${x.ks.length}</span><button class="btn btn-text" data-act="tpremove" data-arg="r:${x.g}">Remove</button></span>`).join('')}</div>` : '') +
      (S.lockErr ? `<p class="warn" role="alert">⚠ ${esc(S.lockErr)}</p>` : '') + bulk;
    return `<div class="scrim" data-act="close"></div><div class="sheet traypop" role="dialog" aria-modal="true" aria-label="Tray"><div class="sheet-head"><div class="head-text"><p class="eyebrow">Tray · ${esc(trayTitle())}</p><h2>Your tray</h2></div><button class="btn close" data-act="close" aria-label="Close">${icon('close')}</button></div>` +
      `<div class="tp-head">${head}</div><div class="tp-body">${body || `<p class="note">No skill in the tray matches “${esc(S.tq)}”.</p>`}</div>` +
      `<div class="sheet-foot tp-foot"><div class="summary" data-summary>${esc(sm.line)}</div><button class="btn" data-act="tray-quiz">${icon('quiz')}Quiz</button><button class="btn" data-act="tray-share">${icon('share')}Share</button><button class="btn btn-primary" data-act="tray-print">${icon('print')}Print</button></div></div>`;
  }
  // set a target % on a skill, a grade or an area: it is locked there, the rest share what is left (refused over 100 %)
  function setLock(scope, v) {
    const old = S.lock[scope]; const oldW = Object.assign({}, S.w);
    S.lock[scope] = Math.max(0, Math.min(100, v));
    if (S.rest === 'even') S.tray.forEach(k => { if (S.lock['k:' + k] === undefined && wOf(k) > 0 && !scopeKeys(scope).includes(k)) S.w[k] = 2; });
    const errs = shares().errs;
    if (errs.length) { if (old === undefined) delete S.lock[scope]; else S.lock[scope] = old; S.w = oldW; S.lockErr = `Not set: ${errs[0]}. Lower another held % first.`; }
    else S.lockErr = '';
  }
  function bulkOptsSheet() {
    const ks = S.sel.filter(k => SK[k]); const sets = ks.map(k => (D.opts[SK[k].o] || []).filter(o => o.g !== 'play'));
    const common = (sets[0] || []).filter(o => sets.every(st => st.some(x => x.id === o.id && x.t === o.t && JSON.stringify(x.v) === JSON.stringify(o.v))));
    const body = `<div class="share-pad"><p class="note">${plural(ks.length, 'skill')} selected. These are the settings they all share; a change here is made in each of them.</p>` +
      (common.length ? common.map(o => opt(esc(o.l), o.h ? esc(o.h) : '', optControl(ks[0], o).replace(/data-act="opt:/g, 'data-act="bopt:'))).join('') : '<p class="note">These skills share no settings. Open one skill to change its own.</p>') +
      `</div><div class="narrow-foot"><button class="btn btn-primary" data-act="trayopen">Done</button></div>`;
    return `<div class="scrim" data-act="close"></div><div class="sheet narrow" role="dialog" aria-modal="true" aria-label="Options for the selected skills"><div class="sheet-head"><div class="head-text"><p class="eyebrow">Options · ${plural(ks.length, 'skill')}</p><h2>Shared settings</h2></div><button class="btn close" data-act="close" aria-label="Close">${icon('close')}</button></div>${body}</div>`;
  }

  // ---------------- the worksheet sheet (Print) and the Quiz sheet ----------------
  // Less · Equal · More for one skill (a number weight 0–10 shows as its number)
  function wSeg(k) { const w = wOf(k); return seg('How often', [['less', 'Less'], ['equal', 'Equal'], ['more', 'More']], ({ 1: 'less', 2: 'equal', 3: 'more' })[w] || '', 'weight:' + k); }
  // the worksheet sheet's read-only list for a big tray: area, then grade, each with its How often and share
  function areaWeightList() {
    const p = plan(); const many = gradesOf(S.tray).length > 1; return areasOf(S.tray).map(x => `<div class="aw-row" data-domain="${x.a}"><span class="aw-name">${icon(AREAS[x.a].icon)}${AREAS[x.a].short}</span><span class="aw-n">${plural(x.ks.length, 'skill')}</span><b class="aw-w">${groupWord(x.ks)}</b><span class="aw-p">${Math.round(x.ks.reduce((t, k) => t + (p.pct[k] || 0), 0))} %</span></div>` +
      (many ? gradesOf(x.ks) : []).map(g => `<div class="aw-row aw-g" data-domain="${x.a}"><span class="aw-name">${gbadge(g.g)}${esc(gradeShort(g.g))}</span><span class="aw-n">${plural(g.ks.length, 'skill')}</span><b class="aw-w">${groupWord(g.ks)}</b><span class="aw-p">${Math.round(g.ks.reduce((t, k) => t + (p.pct[k] || 0), 0))} %</span></div>`).join('')).join('');
  }
  function groupWord(ks) { const ws = new Set(ks.map(wOf)); return ws.size === 1 ? wWord([...ws][0]) : 'Mixed'; }
  function seg(name, choices, cur, act) { return `<div class="seg wrap" role="group" aria-label="${esc(name)}">${choices.map(([k, l]) => `<button data-act="${act}" data-arg="${k}" ${pressed(cur === k)}>${l}</button>`).join('')}</div>`; }
  function radios(choices, cur, act) { return `<div class="opt-ctl stack">${choices.map(([k, l]) => `<button class="radio" data-act="${act}" data-arg="${k}" ${pressed(cur === k)}>${l}</button>`).join('')}</div>`; }
  function opt(name, help, ctl) { return `<div class="opt"><div class="opt-name">${name}${help ? `<small>${help}</small>` : ''}</div><div class="opt-ctl">${ctl}</div></div>`; }
  function stepper(act, v, min, max) { return `<div class="stepper"><button data-act="${act}" data-arg="-1" aria-label="Fewer" ${v <= min ? 'disabled' : ''}>−</button><output>${v}</output><button data-act="${act}" data-arg="1" aria-label="More" ${v >= max ? 'disabled' : ''}>+</button></div>`; }
  function hasLayout() { return S.tray.some(k => /facts|fluency|place|value|today/.test(k)); }
  function kindOptions(isQuiz) {
    const k = kind(), o = S.opts, n = S.tray.length; let h = '';
    if (k === 'single' && big()) h += `<p class="warn">⚠ ${plural(n, 'skill')} on Single skill = ${n} pages or more, one skill on each. Mixed practice puts them all on fewer pages.</p>`;
    if (isQuiz && big()) h += opt('How many questions?', `The quiz takes a sample of the ${n} skills; New numbers re-deals it`, stepper('qn', S.quiz.n || 20, 5, 60));
    else h += opt('How many pages?', k === 'single' && n > 1 ? 'Shared by how often each skill comes up; starts at one page per skill' : big() ? `${plan(isQuiz).total} problems; fewer pages take a sample of the skills` : 'Every page has new numbers; the key follows', stepper('pages', o.pages, 1, 30));
    if (n > 1 && !big()) h += opt('How often does each skill come up?', 'Less · Equal · More = 1 : 2 : 3', `<div class="weights">${S.tray.map(s => `<div class="weight-row w">${chipHTML(s)}${wSeg(s)}</div>`).join('')}</div>`);
    if (big()) h += opt('How often does each area come up?', 'Set in the tray: one place for every skill’s How often', `<div class="opt-stack"><div class="area-weights">${areaWeightList()}</div><button class="btn" data-act="trayopen">Fine-tune in the tray ▸</button></div>`);
    const ex = k === 'single'
      ? [['none', 'None'], ['top', 'An example at the top of each page'], ['group', 'An example to start each group'], ['each', 'An example with each problem (where it fits)']]
      : k === 'sections'
        ? [['none', 'None'], ['top', 'Examples at the top of the page (one for each skill)'], ['first', 'An example the first time each kind of problem appears in a section'], ['group', 'An example to start each group'], ['each', 'An example with each problem (where it fits)']]
        : [['none', 'None'], ['top', 'Examples at the top of the page'], ['first', 'An example the first time each skill appears, beside its first problem']];
    h += opt('Examples', S.fromLesson ? 'Set for you: these skills are new from a lesson' : 'Worked examples on the page', radios(ex, o.examples, 'examples'));
    if (k === 'sections') {
      h += opt('How the sections are made', '', radios([...(big() ? [['per-area', 'One section per maths area']] : []), ['per-skill', 'One section per skill'], ['grouped', 'Grouped by type — you name the sections and drag skills into them'], ['parts', 'Exam-style parts — Part A, Part B …']], o.sections, 'sections') + sectionsDetail());
    }
    if (k === 'single') h += opt('Fade supports', 'Supports step back as pupils go', seg('Fade supports', [['none', 'No fading'], ['problems', 'Faded problems'], ['page', 'Faded page'], ['packet', 'Faded packet']], o.fade, 'fade'));
    if (k === 'sections') h += opt('Fade supports', 'Supports step back within each section', `<button class="toggle" data-act="fadeT" ${pressed(o.fade === 'problems')}><i></i>Faded problems</button>`);
    if (k === 'single' && hasLayout()) h += opt('Layout', 'Only for skills that have one', seg('Layout', [['standard', 'Standard'], ['rows', 'Fact rows (5–10 across)'], ['timed', 'Timed check'], ['today', 'Today’s Number']].filter(([key]) => key !== 'today' || S.tray.some(t => /place|value/.test(t))), o.layout, 'layout'));
    if (k !== 'single') h += opt('Bring back earlier skills', 'Spaced review from skills you used before', `<button class="toggle" data-act="review" ${pressed(o.review)}><i></i>${o.review ? 'On: 2 earlier skills come back' : 'Off'}</button>`);
    h += opt('Size', 'Bigger digits, fewer problems', seg('Size', [['S', 'S'], ['M', 'M'], ['L', 'L']], o.size, 'size'));
    if (isQuiz) {
      h += opt('Points', 'Shown on the answer key with a breakdown by standard', seg('Points', [['one', '1 per question'], ['two', '2 per question'], ['type', 'By type of question']], S.quiz.points, 'points') + `<button class="toggle" data-act="breakdown" ${pressed(S.quiz.breakdown)}><i></i>Standards breakdown on the key</button>`);
      h += opt('How many versions?', 'Each version has its own order and its own key', stepper('versions', S.quiz.versions, 1, 6));
    }
    h += `<details class="more" ${S.moreOpen ? 'open' : ''}><summary>More options</summary>` +
      opt('Mix in prerequisite skills', '', `<button class="toggle" data-act="prereq" ${pressed(o.prereq)}><i></i>${o.prereq ? 'On' : 'Off'}</button>`) +
      opt('Header', '', `<button class="toggle" data-act="header" ${pressed(o.header)}><i></i>Name, date and class lines</button>`) +
      opt('Answer key', '', seg('Key placement', [['end', 'At the end'], ['own', 'On its own pages'], ['none', 'No key']], o.key, 'key') + seg('Key style', [['answers', 'Answers only'], ['worked', 'Worked answers']], o.keyStyle, 'keyStyle')) +
      opt('Number line at the top', '', `<button class="toggle" data-act="nline" ${pressed(o.nline)}><i></i>${o.nline ? 'On' : 'Off'}</button>`) +
      opt('Columns', '', seg('Columns', [['auto', 'Automatic'], ['1', '1'], ['2', '2'], ['3', '3']], o.cols, 'cols')) + '</details>';
    return h;
  }
  // Grouped by type: sections named by the kind of problem ("Adding", "Taking away", "Time" …), similar skills together.
  function typeName(k) {
    const v = k.split(':')[1], c = k.split(':')[0], a = SK[k].a;
    if (/^add|addition/.test(c + ' ' + v) && !/fraction|decimal/.test(c)) return 'Adding';
    if (/^sub|subtraction/.test(c + ' ' + v) && !/fraction|decimal/.test(c)) return 'Taking away';
    if (c === 'multiplication') return 'Multiplying'; if (c === 'division') return 'Dividing';
    if (/time|clock|elapsed/.test(v)) return 'Time'; if (/money|coin|note/.test(v)) return 'Money';
    if (c === 'placevalue' || /base10|teen|tens/.test(v)) return 'Place value';
    return AREAS[a].short;
  }
  function groupedSections() { const out = []; S.tray.forEach(k => { const n = typeName(k); let g = out.find(x => x[0] === n); if (!g) out.push(g = [n, []]); g[1].push(k); }); return out; }
  function partSections() { const half = Math.ceil(S.tray.length / 2); return [S.tray.slice(0, half), S.tray.slice(half)].filter(x => x.length).map((ks, i) => ['Part ' + 'ABCDEF'[i], ks, S.parts[i] || (i ? 6 : 4)]); }
  function sectionsDetail() {
    const o = S.opts; if (o.sections === 'per-skill') return '';
    if (o.sections === 'grouped') {
      return groupedSections().map(([nm, ks]) => `<div class="sect-box"><input value="${esc(nm)}" aria-label="Section name"><div class="chips">${ks.map(k => chipHTML(k)).join('')}</div></div>`).join('') + '<button class="btn btn-text">+ Add a section</button>';
    }
    return partSections().map(([nm, ks, n], i) => `<div class="sect-box"><div class="weight-row"><b>${nm}</b><span class="note">problems</span>${stepper('partn:' + i, n, 1, 12)}</div><div class="chips">${ks.map(k => chipHTML(k)).join('')}</div></div>`).join('') + '<button class="btn btn-text">+ Add a part</button>';
  }
  function previewHTML(isQuiz) {
    if (!S.tray.length) return '';
    const p = plan(isQuiz), k = p.k, o = S.opts;
    const nPages = Math.min(3, p.pageItems.length);
    const cellCls = S.opts.size === 'S' ? 's' : S.opts.size === 'L' ? 'l' : '';
    const cols = S.opts.size === 'L' ? 'c1' : 'c2';
    const pages = [];
    for (let pi = 0; pi < nPages; pi++) {
      const items = p.pageItems[pi]; let body = '';
      // each cell is drawn from ITS skill with its own seed; an item never repeats on a page (re-dealt until new)
      const seen = new Set();
      const draw = (sk, i) => { let out = ''; for (let t = 0; t < 12; t++) { out = T.draw(SK[sk], S.seed + ':' + pi + ':' + i + (t ? ':' + t : ''), S.skillOpts[sk]); if (!seen.has(out)) break; } seen.add(out); return out; };
      const cell = (sk, i, cls) => `<div class="page-cell ${cls}" data-skill="${esc(sk)}">${(o.examples === 'first' && k === 'mixed' && items.indexOf(sk) === i) ? '<b class="ex-tag">Example&nbsp;</b>' : ''}${draw(sk, i)}</div>`;
      const exDraw = (sk, n) => T.draw(SK[sk], 'ex' + S.seed + ':' + n);
      const title = isQuiz ? (S.quiz.std ? `Quiz: ${S.quiz.std}` : 'Quiz') : k === 'single' ? icanTitle(SK[items[0]]) : k === 'mixed' ? 'Mixed practice' : 'Practice';
      body += `<div class="page-head"><span>Name ________________</span><span>Date ________</span></div><div class="page-title">${esc(title)}</div>`;
      const onPage = [...new Set(items)];
      if (k !== 'single') body += `<div class="page-names">${onPage.length > 4 ? `${plural(onPage.length, 'skill')} from ${areasOf(onPage).map(x => AREAS[x.a].short).join(', ')}` : onPage.map(x => esc(short(SK[x].l))).join(' · ')}</div>`;
      if (o.examples === 'top') body += `<div class="page-ex"><b>Example</b>${exDraw(items[0], 99)}</div>`;
      if (k === 'sections') {
        const secs = []; items.forEach((sk, i) => { const name = o.sections === 'per-area' || big() ? AREAS[SK[sk].a].name : o.sections === 'grouped' ? typeName(sk) : short(SK[sk].l); let g = secs[secs.length - 1]; if (!g || g.name !== name) secs.push(g = { name, list: [] }); g.list.push([sk, i]); });
        secs.forEach((sec, si) => {
          body += `<div class="page-sec">${esc(sec.name)}</div>`;
          if (o.examples === 'first') body += `<div class="page-ex"><b>Example</b>${exDraw(sec.list[0][0], 90 + si)}</div>`;
          body += `<div class="page-grid">${sec.list.map(([sk, i]) => cell(sk, i, 's')).join('')}</div>`;
        });
      } else body += `<div class="page-grid ${cols}">${items.map((sk, i) => cell(sk, i, cellCls)).join('')}</div>`;
      body += `<div class="page-key">page ${pi + 1} of ${p.pages}</div>`;
      pages.push(`<div class="page p${nPages}"><div class="page-in">${body}</div></div>`);
    }
    return `<div class="previews">${pages.join('')}</div><p class="note center">${nPages > 1 ? `First ${nPages} pages` : 'First page'} · the PDF is the full view</p>`;
  }
  // the I Can title is the skill's GOAL ("I can add within 20"), from its name; when a name cannot be read as a goal the
  // page says the skill's name plainly, without "I can" (critic r3 C4)
  function icanTitle(s) {
    const l = short(s.l).replace(/\s*\(.*?\)\s*/g, ' ').trim(); const within = (s.l.match(/within ([\d,]+)/i) || [])[1];
    const R = [
      [/^addition facts/i, () => `I can add within ${within || 20}`], [/^subtraction facts/i, () => `I can subtract within ${within || 20}`],
      [/^addition word problems/i, () => `I can solve adding stories${within ? ' within ' + within : ''}`], [/^subtraction word problems/i, () => `I can solve taking-away stories${within ? ' within ' + within : ''}`],
      [/^time to the (hour|half hour)/i, (m) => `I can tell the time to the ${m[1].toLowerCase()}`], [/^shade the fraction/i, () => 'I can shade a fraction'],
      [/^identify fractions/i, () => 'I can name a fraction'], [/^number line to (\d+)/i, (m) => `I can use a number line to ${m[1]}`],
      [/^(add|subtract|multiply|divide|count|compare|round|order|measure|read|write|find|name|tell|solve|make|use|place|shade|identify|draw|sort|skip)\b/i, () => 'I can ' + l.charAt(0).toLowerCase() + l.slice(1)],
    ];
    for (const [re, f] of R) { const m = l.match(re); if (m) return f(m); }
    return l;
  }
  function kindChooser() {
    const k = kind();
    const K = [['single', 'Single skill', 'One skill on a page'], ['sections', 'Sections', 'Each skill in its own part'], ['mixed', 'Mixed practice', 'Skills mixed together']];
    const why = S.kind ? '' : (S.fromLesson ? 'Chosen for you: practice from a lesson starts as Sections.' : S.tray.length >= 2 ? `Chosen for you: ${S.tray.length} skills make a Mixed practice page.` : 'Chosen for you: one skill makes a Single skill page.');
    return `<div class="kinds" role="group" aria-label="Kind of worksheet">${K.map(([key, l, d]) => `<button class="kind" data-act="kind" data-arg="${key}" ${pressed(k === key)}><b>${k === key ? icon('check') : ''}${l}</b><span>${d}</span></button>`).join('')}</div>` +
      `<p class="chosen-note">${why}</p>`;
  }
  // the sheets show the tray's chips for a small tray; a big tray is one line with a link back to the tray popup
  function trayRow() {
    if (!S.tray.length) return '';
    if (big()) return `<div class="tray-line mb-16"><b>${esc(trayTitle())}</b><button class="btn" data-act="trayopen">Open the tray ▸</button></div>`;
    return `<div class="panel-chips mb-16">${S.tray.map(k => chipHTML(k)).join('')}</div>`;
  }
  // PROPOSAL (needs work in js/modules/skill-codes.js, not built): a whole grade, a grade range or one area of a grade
  // shares as a short token ("G3-ALL", "G2-3-ALL", "G3-NF-ALL") instead of one code segment per skill
  function wholeCode() {
    const t = S.tray.slice().sort().join(',');
    for (const g of GORDER0) { if (wholeSet(g).length && wholeSet(g).slice().sort().join(',') === t) return `G${g}-ALL`; for (const a of ORDER) { const w = wholeSet(g, a); if (w.length > 1 && w.slice().sort().join(',') === t) return `G${g}-${a}-ALL`; } }
    for (let i = 0; i < GORDER0.length; i++) for (let j = i + 1; j < GORDER0.length; j++) { const w = GORDER0.slice(i, j + 1).flatMap(g => wholeSet(g)); if (w.length && w.slice().sort().join(',') === t) return `G${GORDER0[i]}-${GORDER0[j]}-ALL`; }
    return null;
  }
  function printSheet() {
    const sm = summaryText(false);
    const side = `<div class="summary" data-summary>${esc(sm.line)}<small>${esc(sm.more)}</small></div>${previewHTML()}` +
      `<div class="side-actions"><button class="btn btn-primary btn-wide" data-act="sheet-print">${icon('print')}Print</button><button class="btn btn-wide" data-act="newnumbers">${icon('dice')}New numbers</button></div>`;
    return sheetFrame('Print a worksheet', `${trayRow()}${kindChooser()}${kindOptions(false)}`, side,
      `<div class="summary">${esc(sm.line)}</div><button class="btn" data-act="newnumbers">${icon('dice')}New numbers</button><button class="btn btn-primary" data-act="sheet-print">${icon('print')}Print</button>`);
  }
  function buildFrom() {
    const F = [['skills', 'Ticked skills'], ['standard', 'A standard (CCSS)'], ['ee', 'An Essential Element'], ['wrm', 'A White Rose unit or step'], ['lesson', 'A lesson']];
    let h = `<p class="row-label mb-8">Build from</p><div class="pills wrap mb-16" role="group" aria-label="Build from">${F.map(([k, l]) => `<button class="pill" data-act="from" data-arg="${k}" ${pressed(S.quiz.from === k)}>${S.quiz.from === k ? icon('check') : ''}${l}</button>`).join('')}</div>`;
    if (S.quiz.from !== 'skills' && !S.quiz.built) {
      const g = S.grade === 'M' ? '2' : S.grade;
      if (S.quiz.from === 'standard' || S.quiz.from === 'ee') {
        const list = D.standards.filter(s => s.g === g && s.k.length);
        h += `<p class="note mb-8">${gradeName(g)} standards with skills. Pick one: its skills make the quiz.</p><div class="grid" data-view="list">` +
          list.map(s => { const a = SK[s.k[0]].a; return `<button class="card" data-domain="${a}" data-act="pickstd" data-arg="${esc(s.c)}"><div class="card-name">${S.quiz.from === 'ee' ? 'EE.' : ''}${esc(s.c)} · ${esc(s.t)}</div><div class="card-meta">${areaTag(a)}<span class="gpill">${s.k.length} skills</span></div></button>`; }).join('') + '</div>';
      } else {
        const y = yearForGrade(g);
        h += `<div class="grid" data-view="list">${y.blocks.map(b => `<button class="card" data-domain="${b.a}" data-act="pickblock" data-arg="${esc(b.id)}"><div class="card-name">${esc(b.name)} (${esc(y.name)}, ${esc(b.term)})</div><div class="card-meta">${areaTag(b.a)}<span class="gpill">${b.steps.length} steps</span></div></button>`).join('')}</div>`;
      }
      return h;
    }
    if (S.quiz.built && S.quiz.std) h += `<p class="note mb-8">Built from ${esc(S.quiz.std)}. Tap a skill to change it.</p>`;
    return h + trayRow() + kindChooser() + kindOptions(true);
  }
  function quizSheet() {
    const sm = summaryText(true); const ready = S.tray.length > 0 && (S.quiz.from === 'skills' || S.quiz.built);
    const dis = ready ? '' : 'disabled aria-disabled="true"';
    const side = ready ? `<div class="summary" data-summary>${esc(sm.line)}<small>${esc(sm.more)}</small></div>${previewHTML(true)}` +
      `<div class="side-actions"><button class="btn btn-primary btn-wide" data-act="quiz-print">${icon('print')}Print</button><div class="two"><button class="btn" data-act="quiz-share">${icon('share')}Share with pupils</button><button class="btn" data-act="quiz-save">Save</button></div><span class="note">Save keeps it in Classes › Quizzes. Pupils take it exactly as today.</span></div>`
      : `<div class="summary">Pick what the quiz is built from</div><p class="note">A standard, an Essential Element, a White Rose unit or step, or a lesson. Its skills make the quiz; you can change any of them after.</p><div class="side-actions"><button class="btn btn-wide" ${dis}>${icon('print')}Print</button></div>`;
    return sheetFrame('Make a quiz', buildFrom(), side,
      ready ? `<div class="summary">${esc(sm.line)}</div><div class="foot-two"><button class="btn" data-act="quiz-save">Save</button><button class="btn" data-act="quiz-share">${icon('share')}Share with pupils</button></div><button class="btn btn-primary" data-act="quiz-print">${icon('print')}Print</button>` : `<div class="summary">Pick what the quiz is built from</div>`);
  }
  function sheetFrame(title, opts, side, foot) {
    const eb = S.sheet === 'lessonprint' ? 'Lesson · ' + esc(findStep(S.lessons.lesson).s.id) : `${S.sheet === 'quiz' ? 'Quiz' : 'Print'} · ${S.tray.length} skill${S.tray.length === 1 ? '' : 's'}`;
    return `<div class="scrim" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-head"><div class="head-text"><p class="eyebrow">${eb}</p><h2>${esc(title)}</h2></div><button class="btn close" data-act="close" aria-label="Close">${icon('close')}</button></div>` +
      `<div class="sheet-body"><div class="sheet-opts">${opts}</div><aside class="sheet-side">${side}</aside></div><div class="sheet-foot">${foot}</div></div>`;
  }
  function code() { const w = wholeCode(); if (w) return w; if (S.tray.length > 3) return S.tray.map(k => { let h = 7; for (const c of k) h = (h * 31 + c.charCodeAt(0)) % 46656; return h.toString(36).toUpperCase().padStart(3, '0'); }).join('-'); const ids = S.tray.map(k => k.split(':')[1]).join(''); let h = 7; for (const c of ids) h = (h * 31 + c.charCodeAt(0)) % 46656; const b = (n) => n.toString(36).toUpperCase().padStart(3, '0'); return S.tray.length ? `${b(h)}-${b((h * 7) % 46656)}${S.tray.length > 1 ? '-' + b((h * 13) % 46656) : ''}` : '---'; }
  function shareSheet(isQuiz) {
    const c = code(); const sh = S.share;
    const link = isQuiz ? `math.cultivatingthedigital.org/?quiz=${c.replace(/-/g, '')}x7Qk2` : `math.cultivatingthedigital.org/?c=${c}`;
    const head = isQuiz ? 'Share the quiz with pupils' : 'Share with pupils';
    const whole = !isQuiz && wholeCode(); const long = !isQuiz && !whole && c.length > 24;
    const codeHTML = isQuiz ? '' : long ? `<p class="note">This hand-picked set’s code is ${c.length} characters: too long to type, so share the link.</p>` : `<div class="code" data-code>${c}</div>`;
    const body = `<div class="share-pad">${trayRow()}<div class="code-box"><span class="note">${isQuiz ? 'Quiz link' : `Code · ${c.length} characters${whole ? ' · the whole set in one short code' : ''}`}</span>${codeHTML}<div class="link">${long ? link.slice(0, 60) + '… (the full link is copied)' : link}</div></div>` +
      (whole ? `<p class="note">Proposal: a short code for a whole grade or area needs work in the app’s share codes before it is real (see README).</p>` : '') +
      `<p class="note">${isQuiz ? 'The whole quiz travels in the link; pupils take it exactly as today. It is also saved in your quizzes.' : 'Pupils open the link, or type the code, and start straight away.'}</p>` +
      `<div class="share-actions"><button class="btn btn-primary" data-act="copy">${icon(S.copied ? 'check' : 'copy')}${S.copied ? 'Copied' : 'Copy link'}</button>${isQuiz ? '<button class="btn" data-act="copycode">Copy as text</button>' : `<button class="btn" data-act="board">${icon('board')}Show on the board</button>`}<button class="btn" data-act="close">Done</button></div>` +
      (isQuiz ? '' : `<details class="more" ${S.moreOpen ? 'open' : ''}><summary>More options</summary>` +
        opt('How pupils practise', '', seg('Mode', [['practice', 'Practice'], ['boss', 'Boss battle'], ['race', 'Car race'], ['worksheet', 'Online worksheet']], sh.mode, 'smode')) +
        opt('Timer', '', seg('Timer', [['off', 'Off'], ['5', '5 min'], ['10', '10 min'], ['15', '15 min']], sh.timer, 'stimer')) +
        opt('Questions', '', seg('Questions', [['10', '10'], ['20', '20'], ['30', '30']], sh.count, 'scount')) +
        opt('Lock the settings', 'Pupils cannot change them', `<button class="toggle" data-act="slock" ${pressed(sh.lock)}><i></i>${sh.lock ? 'Locked' : 'Not locked'}</button>`) +
        opt('Quick Start link', 'Puts the skills as buttons on the pupil’s start screen to choose from', `<button class="toggle" data-act="squick" ${pressed(sh.quick)}><i></i>${sh.quick ? 'Make a Quick Start link instead' : 'Off'}</button>`) +
        opt('Google Forms', '', '<button class="btn">Export to Google Forms</button>') + '</details>') + '</div>';
    return `<div class="scrim" data-act="close"></div><div class="sheet narrow" role="dialog" aria-modal="true" aria-label="${head}"><div class="sheet-head"><h2>${head}</h2><button class="btn close" data-act="close" aria-label="Close">${icon('close')}</button></div>${body}</div>`;
  }
  // A chip's own options: the skill's real option schema (skill-options.js offeredOptionsFor, generated into data.js),
  // with preset values shown as set, the on-screen options (calculator, skip) and how often it comes up.
  function optVal(k, o) { const m = S.skillOpts[k] || {}; return o.id in m ? m[o.id] : o.d; }
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  function optControl(k, o) {
    const v = optVal(k, o); const act = 'opt:' + o.id;
    if (o.t === 'bool') return `<button class="toggle" data-act="${act}" ${pressed(!!v)}><i></i>${v ? 'On' : 'Off'}</button>`;
    if (o.t === 'int') return stepper(act, Number(v ?? 0), o.min ?? 0, o.max ?? 20) + (o.id === 'skipAfter' ? `<span class="note">${Number(v) ? 'Skip after ' + v + ' wrong tries' : 'Skip off'}</span>` : '');
    if (o.t === 'enum') {
      const cur = o.v.findIndex(x => same(x[0], v));
      const shortL = o.v.length <= 6 && o.v.every(x => x[1].length <= 22);
      return shortL ? `<div class="seg wrap" role="group" aria-label="${esc(o.l)}">${o.v.map((x, i) => `<button data-act="${act}" data-arg="${i}" ${pressed(i === cur)}>${esc(x[1])}</button>`).join('')}</div>`
        : radios(o.v.map((x, i) => [String(i), esc(x[1])]), String(cur), act);
    }
    if (o.t === 'set') {
      const list = Array.isArray(v) ? v : []; const all = o.v.every(x => list.some(y => same(x[0], y)));
      return `<div class="set-pills">${o.v.map((x, i) => { const on = list.some(y => same(x[0], y)); return `<button class="pill" data-act="${act}" data-arg="${i}" ${pressed(on)}>${on ? icon('check') : ''}${esc(x[1])}</button>`; }).join('')}</div>` +
        (o.all && all ? `<span class="note">${esc(o.all)}</span>` : '');
    }
    return `<span class="note">Set in the app (${esc(o.t)})</span>`;
  }
  function chipSheet() {
    const s = SK[S.chip]; if (!s) return '';
    const defs = D.opts[s.o] || [];
    const own = defs.filter(o => o.g !== 'play' && o.g !== 'nline'), nl = defs.filter(o => o.id === 'nlOn'), play = defs.filter(o => o.g === 'play');
    // help in teacher words: the option's first sentence only (the full notes stay in the app's own options sheet)
    const helpShort = (h) => { const t = String(h).replace(/^Default: [^.]*\.\s*/, ''); const m = t.match(/^.*?[.!?](?=\s|$)/); return m ? m[0] : t; };
    const row = (o) => opt(esc(o.l) + (!same(optVal(S.chip, o), o.d) ? ' <span class="changed">changed</span>' : ''), o.h ? esc(helpShort(o.h)) : '', optControl(S.chip, o));
    const pre = s.pre ? `<div class="preset"><b>${icon('check')}A preset of ${esc(s.pre.hl)}</b><span class="note">This skill opens ${esc(s.pre.hl)} with ${s.pre.vals.map(([l, v]) => `<b>${esc(l)}: ${esc(v)}</b>`).join(', ')} already set. You can change them below.</span></div>` : '';
    const body = `<div class="share-pad"><div class="band band-flat" data-domain="${s.a}">${icon(AREAS[s.a].icon)}${areaName(s.a)}<span class="count">${s.s ? esc(s.s) : ''}</span></div>` +
      `<div class="thumb thumb-lg">${T.draw(s, S.seed, S.skillOpts[S.chip])}</div>` + pre +
      (own.length ? `<p class="col-title">This skill’s options</p>` + own.map(row).join('') : '<p class="note">This skill has no options of its own.</p>') +
      (nl.length ? nl.map(row).join('') : '') +
      `<p class="col-title">On screen</p>` + play.map(row).join('') +
      `<p class="col-title">On pages with other skills</p>` +
      opt('How often it comes up', 'Less · Equal · More = 1 : 2 : 3', wSeg(S.chip)) +
      `</div><div class="narrow-foot"><button class="btn" data-act="remove" data-arg="${esc(S.chip)}">Take out of the tray</button><button class="btn btn-primary" data-act="close">Done</button></div>`;
    return `<div class="scrim" data-act="close"></div><div class="sheet narrow" role="dialog" aria-modal="true" aria-label="Skill options"><div class="sheet-head" data-grade-host>${gbadge(s.g)}<div class="head-text"><p class="eyebrow">Options · ${esc(AREAS[s.a].short)}</p><h2>${esc(s.l)}</h2></div><button class="btn close" data-act="close" aria-label="Close">${icon('close')}</button></div>${body}</div>`;
  }
  function setConfirm() {
    const st = S.sets[S.confirm];
    return `<div class="scrim" data-act="close"></div><div class="sheet narrow sheet-small" role="dialog" aria-modal="true" aria-label="Open a set"><div class="sheet-head"><h2>Open “${esc(st.name)}”?</h2><button class="btn close" data-act="close" aria-label="Close">${icon('close')}</button></div>` +
      `<div class="share-pad"><p>Your tray already has ${plural(S.tray.length, 'skill')}. Put this set in its place, or add its ${plural(st.skills.length, 'skill')} to them?</p><p class="note">Your tray saves itself, so the skills in it now stay under My sets either way.</p>` +
      `<div class="share-actions"><button class="btn btn-primary" data-act="setreplace">Use this set instead</button><button class="btn" data-act="setadd">Add to the tray</button><button class="btn" data-act="close">Cancel</button></div></div></div>`;
  }
  function boardView() {
    const s = SK[S.tray[0]] || D.skills[0];
    return `<div class="board" role="dialog" aria-label="On the board"><div class="board-top"><b>On the board · ${esc(short(s.l))}</b><span class="spacer"></span><span class="note">Code ${code()}</span><button class="btn" data-act="close">${icon('close')}Close the board</button></div>` +
      `<div class="board-card">${T.draw(s, S.seed)}</div><div class="board-foot"><span class="note">Question 1 of 20</span><span class="spacer"></span><button class="btn">Show the answer</button><button class="btn btn-primary" data-act="noop">Next question</button></div></div>`;
  }

  // ---------------- Lessons ----------------
  function lessonData(g) {
    const y = yearForGrade(g); const areas = [];
    y.blocks.forEach(b => { let a = areas.find(x => x.a === b.a); if (!a) areas.push(a = { a: b.a, blocks: [] }); a.blocks.push(b); });
    return { y, areas };
  }
  function findStep(sid) { for (const y of D.years) for (const b of y.blocks) for (const s of b.steps) if (s.id === sid) return { y, b, s }; return null; }
  function nextOf(sid) { const f = findStep(sid); if (!f) return null; const i = f.b.steps.indexOf(f.s); return f.b.steps[i + 1] ? f.b.steps[i + 1].id : null; }
  function preSkills(sid) { const f = findStep(sid); const i = f.b.steps.indexOf(f.s); const out = []; for (let j = i - 1; j >= 0 && out.length < 3; j--) f.b.steps[j].k.forEach(k => { if (SK[k] && !out.includes(k) && !f.s.k.includes(k)) out.push(k); }); return out.slice(0, 3); }
  const stepArea = (st, b) => st.a || b.a;   // a lesson takes the area of its own CCSS (§2.7 rule 5)
  function lessonsScreen() {
    const L = S.lessons; const { y, areas } = lessonData(L.grade);
    if (!areas.find(a => a.a === L.area)) L.area = areas[0].a;
    const cur = areas.find(a => a.a === L.area); const next = nextOf(L.last);
    const q = L.q.trim().toLowerCase();
    let list = '';
    if (q) {
      const hits = []; D.years.forEach(yy => yy.blocks.forEach(b => b.steps.forEach(s => { if ((s.t + ' ' + s.id + ' ' + s.s).toLowerCase().includes(q)) hits.push({ yy, b, s }); })));
      list = `<div class="lesson-list lesson-hits" data-domain="NOSTD"><p class="col-title">${hits.length === 1 ? '1 lesson matches' : hits.length + ' lessons match'}</p>${hits.slice(0, 20).map(h => lessonRow(h.s, h.b, h.yy)).join('')}</div>`;
    } else {
      const toMake = []; cur.blocks.forEach(b => b.steps.forEach(st => st.m.forEach(m => { if (!toMake.includes(m)) toMake.push(m); })));
      list = `<div class="lesson-list" data-domain="${cur.a}"><h2 class="band">${icon(AREAS[cur.a].icon)}${AREAS[cur.a].name} · ${gradeName(L.grade)}<span class="count">${plural(cur.blocks.reduce((n, b) => n + b.steps.length, 0), 'lesson')}</span></h2>` +
        `<details class="more area-tomake"><summary>Skills to be made in ${AREAS[cur.a].name} (${toMake.length})</summary>${toMake.length ? `<ul class="note">${toMake.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : '<p class="note">None: every lesson here has its skills.</p>'}</details>` +
        cur.blocks.map(b => { const nk = new Set(b.steps.flatMap(st => st.k.filter(k => SK[k]))).size; return `<div class="block-row"><p class="block-name">${esc(b.term)} block ${b.n}: ${esc(b.name)}</p>${nk ? `<button class="btn btn-add" data-act="addunit" data-arg="${esc(b.id)}" aria-label="Add this unit (${nk} skills) to the tray"><span class="wide-only">+ Add this unit (${nk})</span><span class="narrow-only">+ Unit (${nk})</span></button>` : ''}</div>${b.steps.map(s => lessonRow(s, b, y, next, true)).join('')}`; }).join('') + '</div>';
    }
    const grades = GRADES.filter(g => g[0] !== 'M' && g[0] !== '6');
    return `<div class="head"><div class="head-text"><p class="eyebrow">White Rose · ${esc(y.name)} · ${esc(gradeName(L.grade))}</p><h1 class="title">Lessons</h1></div><label class="search">${icon('search')}<span class="sr">Find a lesson</span><input id="lsearch" type="search" placeholder="Find a lesson by name or code, e.g. “Hundreds” or “Y3.B1.S4”" value="${esc(L.q)}" data-act="lsearch"></label></div>` +
      `<p class="serif wide-only">Pick up where you left off.</p><p class="last-note wide-only">Opened where you were last: ${gradeName(L.grade)} · ${AREAS[cur.a].name} · ${esc(findStep(L.last).s.t)}. The next lesson is marked Next.</p>` +
      (next && !q ? `<button class="next-card" data-act="lesson" data-lesson="${esc(next)}">Next lesson: ${esc(findStep(next).s.t)}<span class="badge">Open ▸</span></button>` : '') + `<div class="lessons ${L.panelOpen ? 'panel-open' : ''}"><div class="lessons-nav"><div><p class="col-title">Grade</p><div class="pills wrap grade-pills">${grades.map(([g, l]) => `<button class="pill" data-act="lgrade" data-arg="${g}" ${pressed(L.grade === g)}>${L.grade === g ? icon('check') : ''}<span class="wide-only">${l}</span><span class="narrow-only">${g}</span></button>`).join('')}</div></div>` +
      `<div><p class="col-title">Maths area</p><div class="area-list">${areas.map(a => `<button class="area-row" data-domain="${a.a}" data-act="larea" data-arg="${a.a}" ${pressed(a.a === L.area)}>${icon(AREAS[a.a].icon)}<span class="area-name">${a.a === L.area ? '✓ ' : ''}<span class="wide-only">${AREAS[a.a].name}</span><span class="narrow-only">${AREAS[a.a].short}</span></span><span class="n">${a.blocks.reduce((n, b) => n + b.steps.length, 0)}</span></button>`).join('')}</div></div></div>` +
      `<div class="lessons-list">${list}</div>${L.panelOpen ? '<div class="panel-scrim" data-act="panelclose"></div>' : ''}${lessonPanel()}</div>`;
  }
  // A lesson row carries a grade badge only in a list across grades (a search); a list of one grade says the grade once,
  // in its header, and the step number is what the teacher scans for (critic r3 A2)
  function lessonRow(s, b, y, next, oneGrade) {
    const a = stepArea(s, b);
    return `<button class="lesson" data-domain="${a}" ${oneGrade ? '' : 'data-grade-host'} data-act="lesson" data-lesson="${esc(s.id)}" ${pressed(S.lessons.lesson === s.id)}>${oneGrade ? '' : gbadge(y.grade)}<span class="num">${s.n}</span><span class="lesson-t">${esc(s.t)}${a !== b.a ? `<span class="area-tag">${icon(AREAS[a].icon)}${AREAS[a].short}</span>` : ''}</span>` +
      (s.id === next ? '<span class="badge">Next</span>' : s.id === S.lessons.last ? '<span class="badge quiet">Last opened</span>' : (!s.k.length ? '<span class="badge quiet">No practice yet</span>' : '')) + '</button>';
  }
  function lessonPanel() {
    const f = findStep(S.lessons.lesson); const s = f.s; const a = stepArea(s, f.b); const pre = preSkills(s.id);
    const has = s.k.filter(k => SK[k]).length > 0; const dis = has ? '' : 'disabled aria-disabled="true"';
    return `<aside class="panel ${S.lessons.panelOpen ? 'open' : ''}" data-domain="${a}" aria-label="Lesson"><div class="panel-band"><p class="panel-eyebrow" data-grade-host>${gbadge(f.y.grade)}<span>White Rose ${esc(f.y.name)} · ${esc(f.b.name)} · step ${s.n}</span></p><h2>${esc(s.t)}</h2><p>${icon(AREAS[a].icon)} ${areaName(a)}${s.s ? ' · ' + esc(s.s) : ''}</p></div>` +
      `<div class="panel-body"><button class="btn btn-primary btn-wide" data-act="lesson-print">${icon('print')}Print lesson</button>` +
      `<div class="two"><button class="btn" data-act="lesson-practice" ${dis}>${icon('print')}Print practice</button><button class="btn" data-act="lesson-share" ${dis}>${icon('share')}Share practice</button></div>` +
      `<button class="btn btn-wide" data-act="lesson-pre" ${pre.length ? '' : 'disabled aria-disabled="true"'}>Practise pre-skills${pre.length ? ` (${pre.length})` : ''}</button>` +
      `<div><p class="col-title">Skills in this lesson</p><div class="panel-chips">${has ? s.k.filter(k => SK[k]).map(k => chipHTML(k, { act: 'tick-chip' })).join('') : '<span class="note">No practice skill yet — see Skills to be made.</span>'}</div></div>` +
      `<details class="more"><summary>Skills to be made (${s.m.length})</summary>${s.m.length ? `<ul class="note">${s.m.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : '<p class="note">None: every part of this lesson has a skill.</p>'}</details>` +
      `<button class="btn btn-text lesson-close" data-act="panelclose">Back to the lessons</button></div></aside>`;
  }
  // a lesson's step title as a goal: a verb starts "I can …", anything else is the title itself
  function lessonGoal(t) { return /^(add|subtract|multiply|divide|count|compare|round|order|measure|read|write|find|name|tell|solve|make|use|represent|partition|recognise|recognize|identify|draw|sort|share|group|estimate|convert|calculate|understand|explore|know|describe|interpret|complete|build)\b/i.test(t) ? 'I can ' + t.charAt(0).toLowerCase() + t.slice(1) : t; }
  function lessonPrintSheet() {
    const f = findStep(S.lessons.lesson); const k0 = f.s.k.find(k => SK[k]);
    const side = `<div class="summary">Lesson · ${esc(f.s.t)}<small>Teacher pages, pupil pages and the answer key</small></div>` +
      `<div class="previews"><div class="page p2"><div class="page-in"><div class="page-head"><span>Name ________________</span><span>Date ________</span></div><div class="page-title">${esc(lessonGoal(f.s.t))}</div>${k0 ? `<div class="page-ex"><b>Let’s learn</b>${T.draw(SK[k0], 'ex')}</div><div class="page-grid c2">${[0, 1, 2, 3].map(i => `<div class="page-cell">${T.draw(SK[k0], 'l' + i)}</div>`).join('')}</div>` : '<p class="page-names">This lesson’s pupil pages come with the later lesson wave.</p>'}</div></div></div>` +
      `<div class="side-actions"><button class="btn btn-primary btn-wide" data-act="sheet-print">${icon('print')}Print</button></div>`;
    const opts = opt('What to print', '', seg('Pages', [['both', 'Teacher and pupil pages'], ['pupil', 'Pupil pages'], ['teacher', 'Teacher pages']], 'both', 'noop')) + opt('Size', '', seg('Size', [['S', 'S'], ['M', 'M'], ['L', 'L']], S.opts.size, 'size'));
    return sheetFrame('Print lesson', opts, side, `<div class="summary">Lesson · ${esc(f.s.t)}</div><button class="btn btn-primary span-all" data-act="sheet-print">${icon('print')}Print</button>`);
  }

  // ---------------- Classes ----------------
  const bar10 = (pct) => `<span class="bar10" role="img" aria-label="${pct} %">${Array.from({ length: 10 }, (_, i) => `<i class="${i < Math.round(pct / 10) ? 'on' : ''}"></i>`).join('')}</span><b class="pct">${pct} %</b>`;
  function classesScreen() {
    const tabs = [['board', 'Run on the board'], ['quizzes', 'Quizzes'], ['map', 'MAP tests'], ['progress', 'Progress']];
    let body = '';
    if (S.classes === 'board') {
      body = `<div class="cards2">${S.sets.map((st, i) => `<div class="box"><h3>${esc(st.name)}</h3><div class="panel-chips">${st.skills.map(k => chipHTML(k, { tag: 'span' })).join('')}</div><button class="btn ${i === 0 ? 'btn-primary' : ''}" data-act="runboard" data-arg="${i}">${icon('board')}Start on the board</button></div>`).join('')}</div>`;
    } else if (S.classes === 'quizzes') {
      body = `<h2 class="sub-title">My quizzes</h2><p class="note mb-16">Quizzes you saved from Quiz › Save. Print one again, share it with pupils, or change it.</p>` +
        (S.quizzes.length ? `<div class="cards2 mb-24">${S.quizzes.map((qz, i) => `<div class="box quiz-box" data-quiz="${i}"><h3>${esc(qz.name)}</h3><p class="note">${plural(qz.n, 'question')} · ${qz.versions > 1 ? qz.versions + ' versions' : '1 version'} · saved ${esc(qz.when)}</p><div class="panel-chips">${qz.skills.filter(k => SK[k]).map(k => chipHTML(k, { tag: 'span' })).join('')}</div>` +
          `<div class="box-actions"><button class="btn" data-act="quizopen" data-arg="${i}">${icon('print')}Print</button><button class="btn" data-act="quizshareopen" data-arg="${i}">${icon('share')}Share</button><button class="btn" data-act="quizopen" data-arg="${i}">Change</button></div></div>`).join('')}</div>` : '<p class="note mb-24">No saved quizzes yet. Make one with Quiz in the Skills tray, then Save.</p>') +
        `<h2 class="sub-title">Results on this device</h2><p class="warn mb-16">⚠ These are the quizzes taken on this device (the board, a shared Chromebook). Results stay on each pupil’s device.</p>` +
        `<table class="t t-stack"><thead><tr><th>Quiz</th><th>Pupil</th><th>Score</th><th>Taken</th></tr></thead><tbody>` +
        [['Place value check', 'Amira', '9 / 10', 'Today 10:42'], ['Place value check', 'Ben', '7 / 10', 'Today 10:40'], ['Time to the hour', 'Chloe', '12 / 12', 'Yesterday'], ['Add within 20', 'Dev', '15 / 20', 'Monday']].map(r => `<tr><td data-label="Quiz">${r[0]}</td><td data-label="Pupil">${r[1]}</td><td data-label="Score"><b>${r[2]}</b></td><td data-label="Taken">${r[3]}</td></tr>`).join('') + '</tbody></table>';
    } else if (S.classes === 'map') {
      body = `<div class="cards2"><div class="box"><h3>Start a MAP test</h3><p class="note">Pick the level and the strands, then start here or share the link.</p>${seg('Level', [['k2', 'Grades K–2'], ['35', 'Grades 3–5']], 'k2', 'noop')}<button class="btn btn-primary" data-act="noop">Start the MAP test</button></div><div class="box"><h3>Last results</h3><p class="note">Grade 2 · 12 pupils · on this device</p><p class="note">Number & place value</p>${bar10(64)}<p class="note">Measurement</p>${bar10(48)}</div></div>`;
    } else {
      body = `<table class="t t-stack"><thead><tr><th>Skill</th><th>Practised</th><th>Correct</th></tr></thead><tbody>` +
        ['addition:add_facts', 'measurement:time_hour', 'composing:base10_build', 'subtraction:sub_word_problems'].map((k, i) => `<tr><td data-label="Skill">${chipHTML(k, { tag: 'span' })}</td><td data-label="Practised">${[42, 18, 25, 9][i]} times</td><td data-label="Correct">${bar10([88, 61, 74, 40][i])}</td></tr>`).join('') + '</tbody></table>';
    }
    return `<div class="head"><div class="head-text"><p class="eyebrow">This device · Ms Rivera · Grade 2</p><h1 class="title">Classes</h1></div></div><p class="serif">Everything that happens in the room.</p><div class="tabs" role="group" aria-label="Classes">${tabs.map(([k, l]) => `<button data-act="ctab" data-arg="${k}" ${pressed(S.classes === k)}>${S.classes === k ? icon('check') : ''}${l}</button>`).join('')}</div>${body}`;
  }

  // ---------------- shell ----------------
  const PLACES = [['skills', 'Skills', 'skills'], ['lessons', 'Lessons', 'lessons'], ['classes', 'Classes', 'classes']];
  function profileMenu() {
    return `<div class="menu" role="menu"><p class="menu-label">Ms Rivera · Grade 2</p><button class="btn" data-act="noop">Settings</button><button class="btn" data-act="noop">Switch to pupil view</button><button class="btn" data-act="noop">Teacher help</button><hr><p class="menu-label">Theme</p><button class="btn" data-act="theme">${theme === 'dark' ? 'Use light' : 'Use dark'}</button></div>`;
  }
  function render() {
    const scr = S.screen === 'lessons' ? lessonsScreen() : S.screen === 'classes' ? classesScreen() : skillsScreen();
    const withTray = S.screen === 'skills' && !S.sheet;
    document.getElementById('app').innerHTML =
      `<div class="shell"><nav class="rail" aria-label="Places"><div class="brand"><span class="brand-mark">MQ</span>Maths Quest</div>` +
      PLACES.map(([k, l, ic]) => `<button class="place" data-act="go" data-arg="${k}" ${S.screen === k ? 'aria-current="page"' : ''}>${icon(ic)}${l}</button>`).join('') +
      `<div class="rail-foot">${S.profile ? profileMenu() : ''}<button class="btn profile-btn" data-act="profile"><span class="avatar">MR</span>Ms Rivera</button></div></nav>` +
      `<main class="main ${withTray ? 'has-tray' : 'no-tray'}" id="main">${scr}${withTray ? tray() : ''}</main></div>` +
      `<nav class="bottombar" aria-label="Places">${PLACES.map(([k, l, ic]) => `<button data-act="go" data-arg="${k}" ${S.screen === k && !S.profile ? 'aria-current="page"' : ''}>${icon(ic)}${l}</button>`).join('')}<button data-act="profile" ${S.profile ? 'aria-current="page"' : ''}>${icon('me')}Me</button></nav>`;
    const layer = document.getElementById('layer');
    layer.innerHTML = S.sheet === 'print' ? printSheet() : S.sheet === 'quiz' ? quizSheet() : S.sheet === 'share' ? shareSheet(false) : S.sheet === 'quizshare' ? shareSheet(true)
      : S.sheet === 'tray' ? trayPop() : S.sheet === 'bulkopts' ? bulkOptsSheet() : S.sheet === 'chip' ? chipSheet() : S.sheet === 'board' ? boardView() : S.sheet === 'lessonprint' ? lessonPrintSheet() : S.sheet === 'setconfirm' ? setConfirm() : '';
    if (S.profile && innerWidth < 820) layer.innerHTML = `<div class="scrim" data-act="close"></div><div class="sheet narrow" role="dialog" aria-label="Me"><div class="sheet-head"><h2>Ms Rivera</h2><button class="btn close" data-act="close" aria-label="Close">${icon('close')}</button></div><div class="share-pad">${profileMenu().replace('class="menu"', 'class="menu menu-static"')}</div></div>`;
    document.body.style.overflow = S.sheet || (S.profile && innerWidth < 820) ? 'hidden' : '';
    const t = document.getElementById('toast'); t.hidden = !S.toast; t.innerHTML = esc(S.toast) + (S.toast && S.undo ? ' <button class="btn btn-undo" data-act="undo">Undo</button>' : '');
    fitChips(); fitTray(); setHash();
    if (S.scrollTo) { const el = document.getElementById(S.scrollTo); if (el) el.scrollIntoView({ block: 'start' }); S.scrollTo = null; }
    window.dispatchEvent(new Event('mq:render'));
  }
  function toast(msg, undo) { S.toast = msg; S.undo = undo || null; render(); clearTimeout(toast.t); toast.t = setTimeout(() => { S.toast = ''; S.undo = null; document.getElementById('toast').hidden = true; }, S.undo ? 8000 : 4000); }
  // put skills in the tray in bulk (a whole grade, an area, a unit, a standard) and say what was added, with Undo
  function addMany(keys, what) {
    const before = S.tray.slice(); const add = keys.filter(k => SK[k] && !S.tray.includes(k));
    add.forEach(k => S.tray.push(k)); S.fromLesson = false;
    toast(add.length ? `${plural(add.length, 'skill')} from ${what} added to the tray (${plural(S.tray.length, 'skill')} now).` : `Every skill from ${what} is already in the tray.`, add.length ? { tray: before } : null);
  }
  function takeOut(keys, what) { const before = S.tray.slice(); S.tray = S.tray.filter(k => !keys.includes(k)); S.sel = S.sel.filter(k => S.tray.includes(k)); keys.forEach(k => { delete S.lock['k:' + k]; }); toast(`${what} taken out of the tray (${plural(S.tray.length, 'skill')} left).`, { tray: before }); }
  function openSheet(name) { S.sheet = name; S.copied = false; S.toast = ''; S.undo = null; S.profile = false; S.trayOpen = false; if (name === 'print' || name === 'quiz') { S.kind = null; S.opts = kindDefaults(Object.assign(defaultOpts(), { size: S.opts.size })); S.quiz.n = big() ? 20 : 0; } }

  // ---------------- events ----------------
  document.addEventListener('click', (e) => {
    if (S.pendingPct) applyPct(false);
    const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
    const act = el.dataset.act, arg = el.dataset.arg; const L = S.lessons;
    if (act === 'search' || act === 'lsearch' || act === 'tsearch') return;
    if (el.tagName === 'SUMMARY') return;
    e.preventDefault();
    if (act.startsWith('weight:')) { const k = act.slice(7); S.w[k] = WEIGHT[arg] || 2; delete S.lock['k:' + k]; return render(); }
    if (act.startsWith('bopt:')) {   // the shared options sheet: one change, made in every selected skill
      const id = act.slice(5); for (const k of S.sel) { const o = (D.opts[SK[k].o] || []).find(x => x.id === id); if (!o) continue; const m = S.skillOpts[k] = S.skillOpts[k] || {}; const v = optVal(k, o);
        if (o.t === 'bool') m[id] = !v; else if (o.t === 'int') m[id] = Math.max(o.min ?? 0, Math.min(o.max ?? 20, Number(v ?? 0) + Number(arg))); else if (o.t === 'enum') m[id] = o.v[Number(arg)][0];
        else if (o.t === 'set') { const x = o.v[Number(arg)][0]; const list = (Array.isArray(v) ? v : []).slice(); const i = list.findIndex(y => same(y, x)); if (i >= 0) list.splice(i, 1); else list.push(x); m[id] = list; } }
      return render();
    }
    if (act.startsWith('partn:')) { const i = Number(act.slice(6)); S.parts[i] = Math.max(1, Math.min(12, (S.parts[i] || (i ? 6 : 4)) + Number(arg))); return render(); }
    if (act.startsWith('opt:')) {
      const k = S.chip, o = (D.opts[SK[k].o] || []).find(x => x.id === act.slice(4)); if (!o) return;
      const m = S.skillOpts[k] = S.skillOpts[k] || {}; const v = optVal(k, o);
      if (o.t === 'bool') m[o.id] = !v;
      else if (o.t === 'int') m[o.id] = Math.max(o.min ?? 0, Math.min(o.max ?? 20, Number(v ?? 0) + Number(arg)));
      else if (o.t === 'enum') m[o.id] = o.v[Number(arg)][0];
      else if (o.t === 'set') { const x = o.v[Number(arg)][0]; const list = (Array.isArray(v) ? v : []).slice(); const i = list.findIndex(y => same(y, x)); if (i >= 0) list.splice(i, 1); else list.push(x); m[o.id] = list; }
      return render();
    }
    switch (act) {
      case 'go': S.screen = arg; S.sheet = null; S.profile = false; L.panelOpen = false; break;
      case 'profile': S.profile = !S.profile; break;
      case 'theme': { const u = new URLSearchParams(location.search); u.set('theme', theme === 'dark' ? 'light' : 'dark'); location.search = u.toString(); return; }
      case 'browse': S.browse = arg; S.q = ''; break;
      case 'grade': S.grade = arg; S.pop = null; if (S.q) { S.q = ''; } break;
      case 'view': S.view = arg; S.pop = null; break;
      case 'pop': S.pop = S.pop === arg ? null : arg; break;
      case 'showall': S.open[arg] = true; break;
      case 'tick': { const k = el.dataset.skill; const i = S.tray.indexOf(k); if (i >= 0) S.tray.splice(i, 1); else S.tray.push(k); S.fromLesson = false; break; }
      case 'tick-chip': { if (!S.tray.includes(arg)) S.tray.push(arg); toast('Added to the tray'); return; }
      case 'chip': S.chip = arg; S.sheet = 'chip'; break;
      case 'remove': S.tray = S.tray.filter(k => k !== arg); S.sheet = null; break;
      case 'trayopen': S.sheet = 'tray'; S.lockErr = ''; break;
      case 'trayarea': S.sheet = 'tray'; S.collapsed[arg] = false; S.scrollTo = 'tp-' + arg; break;
      case 'tpcol': S.collapsed[arg] = !(arg in S.collapsed ? S.collapsed[arg] : areasOf(S.tray).length > 3); break;
      case 'tpall': areasOf(S.tray).forEach(x => { S.collapsed[x.a] = arg !== 'open'; }); break;
      case 'detailed': S.detailed = !S.detailed; try { localStorage.setItem('mq_t2_detailed', S.detailed ? '1' : '0'); } catch (e2) { /* not kept */ } break;
      case 'rest': S.rest = arg; break;
      case 'tpmore': S.tpMore = !S.tpMore; break;
      case 'tview': S.tview = arg; try { localStorage.setItem('mq_t2_tview', arg); } catch (e2) { /* not kept */ } break;
      case 'sel': { const ks = scopeKeys(arg); const all = ks.every(k => S.sel.includes(k)); S.sel = all ? S.sel.filter(k => !ks.includes(k)) : [...new Set(S.sel.concat(ks))]; break; }
      case 'selnone': S.sel = []; break;
      case 'hw': { const [sc, v] = arg.split(/\|(?=\d+$)/); scopeKeys(sc).forEach(k => { S.w[k] = Number(v); delete S.lock['k:' + k]; }); delete S.lock[sc]; break; }
      case 'wstep': { const [k, d] = arg.split(/\|(?=-?\d+$)/); S.w[k] = Math.max(0, Math.min(10, wOf(k) + Number(d))); break; }
      case 'lock': if (S.lock[arg] !== undefined) { delete S.lock[arg]; S.lockErr = ''; } else { const p = plan().pct; setLock(arg, Math.round(scopeKeys(arg).reduce((t, k) => t + (p[k] || 0), 0))); } break;
      case 'reseteq': { const ks = scopeKeys(arg); ks.forEach(k => { S.w[k] = 2; delete S.lock['k:' + k]; }); Object.keys(S.lock).forEach(l => { if (arg === 'all' || l === arg || scopeKeys(l).every(k => ks.includes(k))) delete S.lock[l]; }); S.lockErr = ''; break; }
      case 'tpremove': { const ks = scopeKeys(arg); const what = arg.startsWith('a:') ? AREAS[arg.slice(2)].name : arg.startsWith('g:') ? `${AREAS[arg.slice(2).split('|')[0]].short} ${gradeShort(arg.split('|')[1])}` : arg.startsWith('r:') ? gradeName(arg.slice(2)) : short(SK[arg.slice(2)].l); delete S.lock[arg]; takeOut(ks, `${what} (${plural(ks.length, 'skill')})`); if (!S.tray.length) S.sheet = null; return render(); }
      case 'trayclear': S.sheet = null; takeOut(S.tray.slice(), 'Every skill'); return;
      case 'undo': if (S.undo && S.undo.tray) { S.tray = S.undo.tray.slice(); } S.undo = null; S.toast = ''; break;
      case 'bulkw': S.sel.forEach(k => { S.w[k] = Number(arg); delete S.lock['k:' + k]; }); break;
      case 'bulkn': S.bulkN = Math.max(0, Math.min(10, (S.bulkN ?? 2) + Number(arg))); break;
      case 'bulkset': S.sel.forEach(k => { S.w[k] = S.bulkN ?? 2; delete S.lock['k:' + k]; }); break;
      case 'bulkremove': { const ks = S.sel.slice(); S.sel = []; takeOut(ks, plural(ks.length, 'skill')); if (!S.tray.length) S.sheet = null; return render(); }
      case 'bulkopts': if (S.sel.length === 1) { S.chip = S.sel[0]; S.sheet = 'chip'; } else S.sheet = 'bulkopts'; break;
      case 'addgrade': addMany(wholeSet(S.grade), gradeName(S.grade)); return;
      case 'addarea': addMany(wholeSet(S.grade, arg), `${gradeName(S.grade)} ${AREAS[arg].name}`); return;
      case 'addunit': { let b = null; D.years.forEach(y => y.blocks.forEach(x => { if (x.id === arg) b = x; })); const ks = []; b.steps.forEach(st => st.k.forEach(k => { if (SK[k] && !ks.includes(k)) ks.push(k); })); addMany(ks, `the unit “${b.name}”`); return; }
      case 'addstd': { const st = D.standards.find(x => x.c === arg); addMany(st.k, arg); return; }
      case 'tray-print': if (S.tray.length) openSheet('print'); break;
      case 'tray-share': if (S.tray.length) openSheet('share'); break;
      case 'tray-quiz': openSheet('quiz'); S.quiz.built = false; S.quiz.from = S.tray.length ? 'skills' : 'standard'; break;
      case 'close': if (S.sheet === 'board' && S.prevSheet) { S.sheet = S.prevSheet; S.prevSheet = null; break; } S.sheet = null; S.profile = false; L.panelOpen = false; break;
      case 'kind': S.kind = arg; S.opts = kindDefaults(S.opts); break;
      case 'pages': S.opts.pages = Math.max(1, Math.min(30, S.opts.pages + Number(arg))); break;
      case 'qn': S.quiz.n = Math.max(5, Math.min(60, (S.quiz.n || 20) + 5 * Number(arg))); break;
      case 'versions': S.quiz.versions = Math.max(1, Math.min(6, S.quiz.versions + Number(arg))); break;
      case 'examples': case 'sections': case 'fade': case 'layout': case 'size': case 'key': case 'keyStyle': case 'cols': S.opts[act] = arg; break;
      case 'fadeT': S.opts.fade = S.opts.fade === 'problems' ? 'none' : 'problems'; break;
      case 'review': case 'prereq': case 'header': case 'nline': S.opts[act] = !S.opts[act]; break;
      case 'points': S.quiz.points = arg; break;
      case 'breakdown': S.quiz.breakdown = !S.quiz.breakdown; break;
      case 'from': S.quiz.from = arg; S.quiz.built = false; break;
      case 'pickstd': { const s = D.standards.find(x => x.c === arg); S.tray = s.k.filter(k => SK[k]).slice(0, 4); S.quiz.built = true; S.quiz.std = arg; S.kind = null; S.opts = kindDefaults(S.opts); break; }
      case 'pickblock': { const b = yearForGrade(S.grade === 'M' ? '2' : S.grade).blocks.find(x => x.id === arg); const ks = []; b.steps.forEach(s => s.k.forEach(k => { if (SK[k] && !ks.includes(k)) ks.push(k); })); S.tray = ks.slice(0, 4); S.quiz.built = true; S.quiz.std = b.name; S.kind = null; S.opts = kindDefaults(S.opts); break; }
      case 'newnumbers': S.seed++; break;
      case 'sheet-print': S.last = 'print'; S.sheet = null; toast(S.screen === 'lessons' ? 'Your lesson PDF opens in a new tab.' : `Your PDF opens in a new tab: ${summaryText(false).line}.`); return;
      case 'quiz-print': S.last = 'quiz-print'; S.sheet = null; toast('Quiz saved. Your quiz PDF opens in a new tab.'); return;
      case 'quiz-save': { S.last = 'quiz-save'; const nm = S.quiz.std ? `Quiz: ${S.quiz.std}` : `Quiz: ${S.tray.map(k => short(SK[k].l)).slice(0, 2).join(' and ')}`; S.quizzes.unshift({ name: nm, skills: S.tray.slice(), n: plan().total, versions: S.quiz.versions, when: 'just now' }); S.sheet = null; toast('Quiz saved. It is in Classes › Quizzes.'); return; }
      case 'quizopen': case 'quizshareopen': { const qz = S.quizzes[Number(arg)]; S.tray = qz.skills.filter(k => SK[k]); S.fromLesson = false; S.quiz.versions = qz.versions; S.screen = 'skills'; openSheet('quiz'); S.quiz.built = false; S.quiz.from = 'skills'; if (act === 'quizshareopen') { S.sheet = 'quizshare'; } break; }
      case 'quiz-share': S.sheet = 'quizshare'; S.copied = false; break;
      case 'copy': case 'copycode': S.copied = true; S.last = S.sheet === 'quizshare' ? 'quiz-copy' : 'copy'; toast('Link copied. Paste it in Google Classroom or on the board.'); return;
      case 'board': S.prevSheet = S.sheet; S.sheet = 'board'; S.last = 'board'; break;
      case 'runboard': S.tray = S.sets[Number(arg)].skills.slice(); S.sheet = 'board'; S.last = 'board'; break;
      case 'maptask': { const [st, i] = arg.split('|'); const t = D.map.filter(x => x.st === st)[Number(i)]; t.k.forEach(k => { if (!S.tray.includes(k)) S.tray.push(k); }); S.fromLesson = false; toast(`${t.k.length} skill${t.k.length > 1 ? 's' : ''} from “${t.t}” are in the tray.`); return; }
      case 'openset': { const st = S.sets[Number(arg)]; if (S.tray.length && !same(S.tray, st.skills)) { S.confirm = Number(arg); S.sheet = 'setconfirm'; break; } S.tray = st.skills.slice(); S.fromLesson = false; toast(`“${st.name}” is in the tray.`); return; }
      case 'setreplace': case 'setadd': { const st = S.sets[S.confirm]; if (act === 'setreplace') S.tray = st.skills.slice(); else st.skills.forEach(k => { if (!S.tray.includes(k)) S.tray.push(k); }); S.fromLesson = false; S.sheet = null; toast(act === 'setreplace' ? `“${st.name}” is in the tray. Your last tray is kept under My sets.` : `“${st.name}” was added to the tray.`); return; }
      case 'ctab': S.classes = arg; break;
      case 'lgrade': L.grade = arg; L.area = lessonData(arg).areas[0].a; { const f = lessonData(arg).areas[0].blocks[0].steps[0]; L.lesson = f.id; } break;
      case 'larea': L.area = arg; { const a = lessonData(L.grade).areas.find(x => x.a === arg); L.lesson = a.blocks[0].steps[0].id; } break;
      case 'lesson': L.lesson = el.dataset.lesson; L.panelOpen = true; break;
      case 'panelclose': L.panelOpen = false; break;
      case 'lesson-print': S.sheet = 'lessonprint'; break;
      case 'lesson-practice': case 'lesson-share': case 'lesson-pre': {
        const f = findStep(L.lesson); S.tray = act === 'lesson-pre' ? preSkills(L.lesson) : f.s.k.filter(k => SK[k]); S.fromLesson = true; L.last = L.lesson; L.panelOpen = false;
        S.screen = 'skills'; openSheet(act === 'lesson-share' ? 'share' : 'print'); break;
      }
      case 'smode': S.share.mode = arg; break; case 'stimer': S.share.timer = arg; break; case 'scount': S.share.count = arg; break;
      case 'slock': S.share.lock = !S.share.lock; break; case 'squick': S.share.quick = !S.share.quick; break;
      default: break;
    }
    render();
  });
  // a target % is set when the box is left or Enter is pressed (typing "40" never sets 4 % on the way)
  // a target % is applied when typing pauses (0.6 s), on Enter, or before the next click is handled — never on the way
  // ("40" never sets 4 %), and a click right after typing still lands (no re-render between mousedown and click)
  function applyPct(rerender) { const p = S.pendingPct; if (!p) return; S.pendingPct = null; clearTimeout(applyPct.t); setLock(p.scope, p.v); if (rerender) { render(); const i = document.querySelector(`input.pct[data-scope="${CSS.escape(p.scope)}"]`); if (i && p.focus) { i.focus(); } } }
  document.addEventListener('input', (e) => { if (e.target.matches && e.target.matches('input.pct') && e.target.value !== '') { S.pendingPct = { scope: e.target.dataset.scope, v: Number(e.target.value), focus: true }; clearTimeout(applyPct.t); applyPct.t = setTimeout(() => applyPct(true), 600); } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches && e.target.matches('input.pct')) { e.preventDefault(); S.pendingPct = { scope: e.target.dataset.scope, v: Number(e.target.value), focus: true }; applyPct(true); } });
  document.addEventListener('mousedown', (e) => { if (S.pendingPct && !(e.target.matches && e.target.matches('input.pct'))) { S.pendingPct.focus = false; applyPct(false); } }, true);
  document.addEventListener('input', (e) => {
    if (e.target.id === 'tsearch') { S.tq = e.target.value; const pos = e.target.selectionStart; render(); const i = document.getElementById('tsearch'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } return; }
    // a search re-renders the whole screen, so the grade pill is not pressed while all grades are searched (critic r3 A4)
    if (e.target.id === 'search') { S.q = e.target.value; const pos = e.target.selectionStart; render(); const i = document.getElementById('search'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }
    if (e.target.id === 'lsearch') { S.lessons.q = e.target.value; const pos = e.target.selectionStart; render(); const i = document.getElementById('lsearch'); i.focus(); i.setSelectionRange(pos, pos); }
  });
  document.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('details.more')) S.moreOpen = e.target.open; }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && (S.sheet || S.profile)) { S.sheet = null; S.profile = false; render(); } });
  window.addEventListener('hashchange', () => { readHash(); render(); });
  window.addEventListener('resize', () => { clearTimeout(window.__rz); window.__rz = setTimeout(render, 150); });

  if (document.fonts) { document.fonts.ready.then(() => fitChips()); document.fonts.addEventListener('loadingdone', () => fitChips()); }
  // demo state for the shots: ?open=all|<AREA> (popup groups open), ?sel=<scope> (selected), ?lockp=<scope>:<pct>, ?tq=<search>
  if (qs.get('open')) { const o = qs.get('open'); areasOf(S.tray).forEach(x => { S.collapsed[x.a] = !(o === 'all' || o.split(',').includes(x.a)); }); }
  if (qs.get('sel')) S.sel = scopeKeys(qs.get('sel'));
  if (qs.get('tq')) S.tq = qs.get('tq');
  if (qs.get('lockp')) { const m = qs.get('lockp').match(/^(.*):(\d+)$/); if (m) setLock(m[1], Number(m[2])); }
  if (S.tray.length) S.opts = kindDefaults(S.opts);
  readHash();
  if (S.sheet === 'print' || S.sheet === 'quiz') { const k = S.kind; S.opts = kindDefaults(S.opts); S.kind = k; S.opts = kindDefaults(S.opts); if (qs.get('examples')) S.opts.examples = qs.get('examples'); if (qs.get('pages')) S.opts.pages = Number(qs.get('pages')); }
  if (S.sheet === 'quiz' && !S.tray.length) S.quiz.from = 'standard';
  if (qs.get('confirm') && S.sets[Number(qs.get('confirm'))]) { S.confirm = Number(qs.get('confirm')); S.sheet = 'setconfirm'; }
  render();
  window.MQ = { S, render, plan, summaryText, setLock, shares };
})();
