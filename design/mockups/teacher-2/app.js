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
  };
  const icon = (k) => `<svg class="icon" viewBox="0 0 20 20" aria-hidden="true">${P[k] || ''}</svg>`;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const SK = Object.fromEntries(D.skills.map(s => [s.c + ':' + s.v, s]));
  const id = (s) => s.c + ':' + s.v;
  const areaName = (a) => AREAS[a].name;
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  // ---------------- state ----------------
  const qs = new URLSearchParams(location.search);
  const DEMO = {
    demo1: ['addition:add_facts'],
    demo3: ['addition:add_word_problems', 'subtraction:sub_word_problems', 'multiplication:arrays_groups'],
    demo3x: ['addition:add_facts', 'measurement:time_hour', 'fractions:shade_fraction'],
    lesson: ['composing:base10_build_hundreds', 'placevalue:place_value_disks'],
  };
  const S = {
    screen: 'skills', sheet: null, chip: null, browse: 'area', grade: '2', view: 'medium', q: '', open: {},
    tray: [], seed: 1, fromLesson: false, kind: null, opts: defaultOpts(), weights: {},
    quiz: { from: 'skills', points: 'one', versions: 1, breakdown: true, std: null, built: false },
    lessons: { grade: '2', area: 'NBT', lesson: 'Y3.B1.S3', last: 'Y3.B1.S3', panelOpen: false, q: '' },
    skillOpts: {}, parts: [], pop: null, confirm: null, quizzes: [
      { name: 'Place value check', skills: ['placevalue:expand', 'placevalue:compare', 'composing:base10_build'], n: 12, versions: 2, when: 'Monday' },
      { name: 'Time to the hour and half hour', skills: ['measurement:time_hour', 'measurement:time_half_hour'], n: 10, versions: 1, when: 'Last week' },
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
  const tp = qs.get('tray'); if (tp) S.tray = (DEMO[tp] || tp.split(',')).filter(k => SK[k]);
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
  if (S.tray.length) S.opts = kindDefaults(S.opts);

  function readHash() {
    const h = location.hash.replace(/^#/, '');
    const [k, arg] = h.split('/');
    S.sheet = null; S.profile = false; S.trayOpen = false;
    if (['skills', 'lessons', 'classes'].includes(k)) S.screen = k;
    else if (k === 'chip' && arg && SK[decodeURIComponent(arg)]) { S.sheet = 'chip'; S.chip = decodeURIComponent(arg); if (!S.tray.includes(S.chip)) S.tray.push(S.chip); }
    else if (['print', 'quiz', 'share', 'quizshare', 'board', 'lessonprint', 'buildfrom'].includes(k)) { S.sheet = k; if (k === 'buildfrom') { S.sheet = 'quiz'; S.quiz.from = 'standard'; } }
    else if (k === 'lessonpanel') { S.screen = 'lessons'; S.lessons.panelOpen = true; }
    else if (k === 'profile') S.profile = true;
    else if (k === 'trayopen') S.trayOpen = true;
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
    o.pages = k === 'single' ? Math.max(1, S.tray.length) : 1;
    if (k !== 'single') o.layout = 'standard';
    return o;
  }
  const PER_PAGE = { S: 12, M: 8, L: 6 };
  const WEIGHT = { less: 1, equal: 2, more: 3 };
  function plan() {
    const k = kind(), n = S.tray.length, per = PER_PAGE[S.opts.size];
    let pages = S.opts.pages, added = false;
    if (k === 'mixed' && n * 2 > per * pages) { pages = Math.ceil(n * 2 / per); added = true; }
    if (k === 'sections' && n > per * pages / 2) { pages = Math.ceil(n * 2 / per); added = true; }
    const total = per * pages;
    const w = S.tray.map(s => WEIGHT[S.weights[s] || 'equal']); const ws = w.reduce((a, b) => a + b, 0) || 1;
    const counts = S.tray.map((s, i) => Math.max(k === 'single' ? 0 : 2, Math.round(total * w[i] / ws)));
    let diff = total - counts.reduce((a, b) => a + b, 0); for (let i = 0; diff !== 0 && n; i = (i + 1) % n) { if (diff > 0) { counts[i]++; diff--; } else if (counts[i] > 2) { counts[i]--; diff++; } else if (counts.every(c => c <= 2)) break; }
    return { k, pages, added, total, counts };
  }
  function summaryText(isQuiz) {
    if (!S.tray.length) return { line: 'Tick skills first', more: '' };
    const p = plan();
    const names = S.tray.map((s, i) => `${short(SK[s].l)} ${p.counts[i]}`).join(', ');
    const pg = `${p.pages} page${p.pages > 1 ? 's' : ''}`;
    const ver = isQuiz && S.quiz.versions > 1 ? ` · ${S.quiz.versions} versions, each with its own order and key` : '';
    const pts = isQuiz ? ` · ${p.total * (S.quiz.points === 'two' ? 2 : 1)} points` : '';
    return {
      line: `${pg} · ${p.total} ${isQuiz ? 'questions' : 'problems'}${pts} · answer key at the end${ver}`,
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
      `${gbadge(s.g)}${opts.legend ? '' : `<span class="chip-dot">${icon(AREAS[a].icon)}</span>`}<span class="name">${esc(short(s.l))}</span>${opts.legend ? '' : `<span class="chip-area">${AREAS[a].short}</span>`}${opts.pressed ? icon('check') : ''}</${tag}>`;
  }
  // drop the area word on any chip whose name (or word) would otherwise be cut; called after every render
  function fitChips(root) {
    for (const c of (root || document).querySelectorAll('.chip')) {
      c.classList.remove('compact'); const a = c.querySelector('.chip-area'), n = c.querySelector('.name'); if (!a) continue;
      if (a.scrollWidth > a.clientWidth + 1 || (n && n.scrollWidth > n.clientWidth + 1)) c.classList.add('compact');
    }
  }
  function areaTag(a, pool) { return `<span class="area-tag">${icon(AREAS[a].icon)}${areaName(a)}</span>${pool ? '<span class="mixed-badge">mixed</span>' : ''}`; }
  function card(s, crossGrade) {
    const k = id(s), on = S.tray.includes(k);
    return `<button class="card" data-domain="${s.a}" data-grade-host data-act="tick" data-skill="${esc(k)}" ${pressed(on)}>` +
      `<div class="card-title">${gbadge(s.g)}<div class="card-name">${esc(s.l)}</div></div><div class="thumb">${T.draw(s, undefined, S.skillOpts[k])}</div>` +
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
    return `<section class="group" data-domain="${a}" data-group="${key}"><h2 class="band">${icon(AREAS[a].icon)}${esc(opts.title || AREAS[a].long)}<span class="count">${opts.count || plural(list.length, 'skill')}</span></h2>` + body +
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
      return ORDER.filter(a => by[a]).map(a => group(a, by[a].sort((x, y) => S.grade === 'M' ? GORDER.indexOf(x.g) - GORDER.indexOf(y.g) || stdSort(x, y) : stdSort(x, y)), { cross: S.grade === 'M' })).join('');
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
        by[a].slice(0, S.open['s' + a] ? 99 : 4).map(s => `<div class="weight-row mb-8"><span class="gpill">${esc(s.c)}</span><span class="badge ${s.k.length ? '' : 'quiet'}">${s.k.length ? '✓ Covered' : 'Not yet'}</span></div><p class="note mb-8">${esc(s.t)}</p>` +
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
  // the tray groups its chips by maths area under one legend each (the area word stays visible, the names get the room)
  function trayGroups() { const gs = []; S.tray.forEach(k => { const a = SK[k].a; let g = gs.find(x => x.a === a); if (!g) gs.push(g = { a, ks: [] }); g.ks.push(k); }); return gs; }
  function tray() {
    const n = S.tray.length; const dis = n ? '' : 'disabled aria-disabled="true"';
    const label = n ? `${n} skill${n > 1 ? 's' : ''}` : 'Empty';
    return `<div class="tray" role="region" aria-label="Tray">` +
      `<div class="tray-label"><b>Tray</b>${label}</div>` +
      (n ? `<div class="tray-chips">${trayGroups().map(g => `<div class="tray-group" data-domain="${g.a}"><span class="tray-lead"><span class="tray-legend">${icon(AREAS[g.a].icon)}${AREAS[g.a].short}</span>${chipHTML(g.ks[0], { legend: true })}</span>${g.ks.slice(1).map(k => chipHTML(k, { legend: true })).join('')}</div>`).join('')}</div>` : `<div class="tray-empty">Tick skills to put them here. Quiz can also start from a standard, a White Rose step or a lesson.</div>`) +
      `<button class="btn tray-count" data-act="trayopen">${n ? `${label} ▸` : 'Tray empty'}</button>` +
      `<div class="tray-actions">${n ? '' : '<span class="tray-hint">Tick skills first</span>'}` +
      `<button class="btn" data-act="tray-quiz">${icon('quiz')}Quiz</button>` +
      `<button class="btn" data-act="tray-share" ${dis}>${icon('share')}Share</button>` +
      `<button class="btn ${n ? 'btn-primary' : ''}" data-act="tray-print" ${dis}>${icon('print')}Print</button></div></div>` +
      `<div class="tray-sheet" ${S.trayOpen && n ? '' : 'hidden'}><b>Tray · ${label}</b><span class="note">Tap a skill to change its options.</span>${S.tray.map(k => chipHTML(k)).join('')}</div>`;
  }

  // ---------------- the worksheet sheet (Print) and the Quiz sheet ----------------
  function seg(name, choices, cur, act) { return `<div class="seg wrap" role="group" aria-label="${esc(name)}">${choices.map(([k, l]) => `<button data-act="${act}" data-arg="${k}" ${pressed(cur === k)}>${l}</button>`).join('')}</div>`; }
  function radios(choices, cur, act) { return `<div class="opt-ctl stack">${choices.map(([k, l]) => `<button class="radio" data-act="${act}" data-arg="${k}" ${pressed(cur === k)}>${l}</button>`).join('')}</div>`; }
  function opt(name, help, ctl) { return `<div class="opt"><div class="opt-name">${name}${help ? `<small>${help}</small>` : ''}</div><div class="opt-ctl">${ctl}</div></div>`; }
  function stepper(act, v, min, max) { return `<div class="stepper"><button data-act="${act}" data-arg="-1" aria-label="Fewer" ${v <= min ? 'disabled' : ''}>−</button><output>${v}</output><button data-act="${act}" data-arg="1" aria-label="More" ${v >= max ? 'disabled' : ''}>+</button></div>`; }
  function hasLayout() { return S.tray.some(k => /facts|fluency|place|value|today/.test(k)); }
  function kindOptions(isQuiz) {
    const k = kind(), o = S.opts, n = S.tray.length; let h = '';
    h += opt('How many pages?', k === 'single' && n > 1 ? 'Shared by how often each skill comes up; starts at one page per skill' : 'Every page has new numbers; the key follows', stepper('pages', o.pages, 1, 6));
    if (n > 1) h += opt('How often does each skill come up?', 'Less · Equal · More = 1 : 2 : 3', `<div class="weights">${S.tray.map(s => `<div class="weight-row w">${chipHTML(s)}${seg('How often', [['less', 'Less'], ['equal', 'Equal'], ['more', 'More']], S.weights[s] || 'equal', 'weight:' + s)}</div>`).join('')}</div>`);
    const ex = k === 'single'
      ? [['none', 'None'], ['top', 'An example at the top of each page'], ['group', 'An example to start each group'], ['each', 'An example with each problem (where it fits)']]
      : k === 'sections'
        ? [['none', 'None'], ['top', 'Examples at the top of the page (one for each skill)'], ['first', 'An example the first time each kind of problem appears in a section'], ['group', 'An example to start each group'], ['each', 'An example with each problem (where it fits)']]
        : [['none', 'None'], ['top', 'Examples at the top of the page'], ['first', 'An example the first time each skill appears, beside its first problem']];
    h += opt('Examples', S.fromLesson ? 'Set for you: these skills are new from a lesson' : 'Worked examples on the page', radios(ex, o.examples, 'examples'));
    if (k === 'sections') {
      h += opt('How the sections are made', '', radios([['per-skill', 'One section per skill'], ['grouped', 'Grouped by type — you name the sections and drag skills into them'], ['parts', 'Exam-style parts — Part A, Part B …']], o.sections, 'sections') + sectionsDetail());
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
    const p = plan(), k = p.k, per = PER_PAGE[S.opts.size]; const o = S.opts;
    const sameKind = k === 'mixed' || (k === 'single' && S.tray.length === 1) || (k === 'sections' && p.pages === 1);
    const nPages = sameKind ? 1 : Math.min(3, p.pages);
    const cellCls = S.opts.size === 'S' ? 's' : S.opts.size === 'L' ? 'l' : '';
    const cols = S.opts.size === 'L' ? 'c1' : 'c2';
    const pages = [];
    for (let pi = 0; pi < nPages; pi++) {
      let body = ''; const r = T.rng('seed' + S.seed + pi);
      const items = [];
      if (k === 'single') { const sk = S.tray[pi % S.tray.length]; for (let i = 0; i < per; i++) items.push(sk); }
      else if (k === 'mixed') { const pool = []; S.tray.forEach((s) => { for (let c = 0; c < Math.max(2, Math.round(per / S.tray.length)); c++) pool.push(s); }); while (items.length < per) items.push(pool.splice(Math.floor(r() * pool.length), 1)[0] || S.tray[items.length % S.tray.length]); }
      // each cell is drawn from ITS skill (category + id), with its own seed, so New numbers re-deals it
      const draw = (sk, i) => T.draw(SK[sk], S.seed + ':' + pi + ':' + i);
      const title = isQuiz ? (S.quiz.std ? `Quiz: ${S.quiz.std}` : 'Quiz') : k === 'single' ? `I can ${short(SK[S.tray[pi % S.tray.length]].l).toLowerCase()}` : k === 'mixed' ? 'Mixed practice' : 'Practice';
      body += `<div class="page-head"><span>Name ________________</span><span>Date ________</span></div><div class="page-title">${esc(title)}</div>`;
      if (k !== 'single') body += `<div class="page-names">${S.tray.map(s => esc(short(SK[s].l))).join(' · ')}</div>`;
      if (o.examples === 'top') body += `<div class="page-ex"><b>Example</b>${draw(k === 'single' ? S.tray[pi % S.tray.length] : S.tray[0], 99)}</div>`;
      if (k === 'sections') {
        const secs = o.sections === 'grouped' ? groupedSections() : o.sections === 'parts' ? partSections() : S.tray.map(t => [short(SK[t].l), [t]]);
        secs.filter(x => x[1].length).forEach(([nm, ks, cnt], si) => {
          body += `<div class="page-sec">${esc(nm)}</div>`;
          if (o.examples === 'first') body += `<div class="page-ex"><b>Example</b>${draw(ks[0], 90 + si)}</div>`;
          const n = cnt ? Math.min(cnt, 6) : Math.max(2, Math.floor(per / secs.length));
          body += `<div class="page-grid">${Array.from({ length: n }, (_, i) => `<div class="page-cell s">${draw(ks[i % ks.length], si * 10 + i)}</div>`).join('')}</div>`;
        });
      } else {
        body += `<div class="page-grid ${cols}">${items.map((sk, i) => `<div class="page-cell ${cellCls}">${(o.examples === 'first' && items.indexOf(sk) === i) ? '<b class="ex-tag">Example&nbsp;</b>' : ''}${draw(sk, i)}</div>`).join('')}</div>`;
      }
      body += `<div class="page-key">page ${pi + 1} of ${p.pages}</div>`;
      pages.push(`<div class="page p${nPages}"><div class="page-in">${body}</div></div>`);
    }
    return `<div class="previews">${pages.join('')}</div><p class="note center">${nPages > 1 ? `First ${nPages} pages` : 'First page'} · the PDF is the full view</p>`;
  }
  function kindChooser() {
    const k = kind();
    const K = [['single', 'Single skill', 'One skill on a page'], ['sections', 'Sections', 'Each skill in its own part'], ['mixed', 'Mixed practice', 'Skills mixed together']];
    const why = S.kind ? '' : (S.fromLesson ? 'Chosen for you: practice from a lesson starts as Sections.' : S.tray.length >= 2 ? `Chosen for you: ${S.tray.length} skills make a Mixed practice page.` : 'Chosen for you: one skill makes a Single skill page.');
    return `<div class="kinds" role="group" aria-label="Kind of worksheet">${K.map(([key, l, d]) => `<button class="kind" data-act="kind" data-arg="${key}" ${pressed(k === key)}><b>${k === key ? icon('check') : ''}${l}</b><span>${d}</span></button>`).join('')}</div>` +
      `<p class="chosen-note">${why}</p>`;
  }
  function trayRow() { return S.tray.length ? `<div class="panel-chips mb-16">${S.tray.map(k => chipHTML(k)).join('')}</div>` : ''; }
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
  function code() { const ids = S.tray.map(k => k.split(':')[1]).join(''); let h = 7; for (const c of ids) h = (h * 31 + c.charCodeAt(0)) % 46656; const b = (n) => n.toString(36).toUpperCase().padStart(3, '0'); return S.tray.length ? `${b(h)}-${b((h * 7) % 46656)}${S.tray.length > 1 ? '-' + b((h * 13) % 46656) : ''}` : '---'; }
  function shareSheet(isQuiz) {
    const c = code(); const sh = S.share;
    const link = isQuiz ? `math.cultivatingthedigital.org/?quiz=${c.replace(/-/g, '')}x7Qk2` : `math.cultivatingthedigital.org/?c=${c}`;
    const head = isQuiz ? 'Share the quiz with pupils' : 'Share with pupils';
    const body = `<div class="share-pad">${trayRow()}<div class="code-box"><span class="note">${isQuiz ? 'Quiz link' : 'Code'}</span>${isQuiz ? '' : `<div class="code" data-code>${c}</div>`}<div class="link">${link}</div></div>` +
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
    const w = S.weights[S.chip] || 'equal'; const defs = D.opts[s.o] || [];
    const own = defs.filter(o => o.g !== 'play' && o.g !== 'nline'), nl = defs.filter(o => o.id === 'nlOn'), play = defs.filter(o => o.g === 'play');
    const row = (o) => opt(esc(o.l) + (!same(optVal(S.chip, o), o.d) ? ' <span class="changed">changed</span>' : ''), o.h ? esc(o.h) : '', optControl(S.chip, o));
    const pre = s.pre ? `<div class="preset"><b>${icon('check')}A preset of ${esc(s.pre.hl)}</b><span class="note">This skill opens ${esc(s.pre.hl)} with ${s.pre.vals.map(([l, v]) => `<b>${esc(l)}: ${esc(v)}</b>`).join(', ')} already set. You can change them below.</span></div>` : '';
    const body = `<div class="share-pad"><div class="band band-flat" data-domain="${s.a}">${icon(AREAS[s.a].icon)}${areaName(s.a)}<span class="count">${gradeShort(s.g)}${s.s ? ' · ' + esc(s.s) : ''}</span></div>` +
      `<div class="thumb thumb-lg">${T.draw(s, S.seed, S.skillOpts[S.chip])}</div>` + pre +
      (own.length ? `<p class="col-title">This skill’s options</p>` + own.map(row).join('') : '<p class="note">This skill has no options of its own.</p>') +
      (nl.length ? nl.map(row).join('') : '') +
      `<p class="col-title">On screen</p>` + play.map(row).join('') +
      `<p class="col-title">On pages with other skills</p>` +
      opt('How often it comes up', 'Less · Equal · More = 1 : 2 : 3', seg('How often', [['less', 'Less'], ['equal', 'Equal'], ['more', 'More']], w, 'weight:' + S.chip)) +
      `</div><div class="narrow-foot"><button class="btn" data-act="remove" data-arg="${esc(S.chip)}">Take out of the tray</button><button class="btn btn-primary" data-act="close">Done</button></div>`;
    return `<div class="scrim" data-act="close"></div><div class="sheet narrow" role="dialog" aria-modal="true" aria-label="Skill options"><div class="sheet-head" data-grade-host>${gbadge(s.g)}<div class="head-text"><p class="eyebrow">Options · ${esc(AREAS[s.a].short)} · ${esc(gradeShort(s.g))}</p><h2>${esc(s.l)}</h2></div><button class="btn close" data-act="close" aria-label="Close">${icon('close')}</button></div>${body}</div>`;
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
        cur.blocks.map(b => `<p class="block-name">${esc(b.term)} block ${b.n}: ${esc(b.name)}</p>${b.steps.map(s => lessonRow(s, b, y, next)).join('')}`).join('') + '</div>';
    }
    const grades = GRADES.filter(g => g[0] !== 'M' && g[0] !== '6');
    return `<div class="head"><div class="head-text"><p class="eyebrow">White Rose · ${esc(y.name)} · ${esc(gradeName(L.grade))}</p><h1 class="title">Lessons</h1></div><label class="search">${icon('search')}<span class="sr">Find a lesson</span><input id="lsearch" type="search" placeholder="Find a lesson by name or code, e.g. “Hundreds” or “Y3.B1.S4”" value="${esc(L.q)}" data-act="lsearch"></label></div>` +
      `<p class="serif wide-only">Pick up where you left off.</p><p class="last-note wide-only">Opened where you were last: ${gradeName(L.grade)} · ${AREAS[cur.a].name} · ${esc(findStep(L.last).s.t)}. The next lesson is marked Next.</p>` +
      (next && !q ? `<button class="next-card" data-act="lesson" data-lesson="${esc(next)}">Next lesson: ${esc(findStep(next).s.t)}<span class="badge">Open ▸</span></button>` : '') + `<div class="lessons ${L.panelOpen ? 'panel-open' : ''}"><div class="lessons-nav"><div><p class="col-title">Grade</p><div class="pills wrap grade-pills">${grades.map(([g, l]) => `<button class="pill" data-act="lgrade" data-arg="${g}" ${pressed(L.grade === g)}>${L.grade === g ? icon('check') : ''}<span class="wide-only">${l}</span><span class="narrow-only">${g}</span></button>`).join('')}</div></div>` +
      `<div><p class="col-title">Maths area</p><div class="area-list">${areas.map(a => `<button class="area-row" data-domain="${a.a}" data-act="larea" data-arg="${a.a}" ${pressed(a.a === L.area)}>${icon(AREAS[a.a].icon)}<span class="area-name">${a.a === L.area ? '✓ ' : ''}<span class="wide-only">${AREAS[a.a].name}</span><span class="narrow-only">${AREAS[a.a].short}</span></span><span class="n">${a.blocks.reduce((n, b) => n + b.steps.length, 0)}</span></button>`).join('')}</div></div></div>` +
      `<div class="lessons-list">${list}</div>${L.panelOpen ? '<div class="panel-scrim" data-act="panelclose"></div>' : ''}${lessonPanel()}</div>`;
  }
  function lessonRow(s, b, y, next) {
    const a = stepArea(s, b);
    return `<button class="lesson" data-domain="${a}" data-grade-host data-act="lesson" data-lesson="${esc(s.id)}" ${pressed(S.lessons.lesson === s.id)}>${gbadge(y.grade)}<span class="num">${s.n}</span><span class="lesson-t">${esc(s.t)}${a !== b.a ? `<span class="area-tag">${icon(AREAS[a].icon)}${AREAS[a].short}</span>` : ''}</span>` +
      (s.id === next ? '<span class="badge">Next</span>' : s.id === S.lessons.last ? '<span class="badge quiet">Last opened</span>' : (!s.k.length ? '<span class="badge quiet">No practice yet</span>' : '')) + '</button>';
  }
  function lessonPanel() {
    const f = findStep(S.lessons.lesson); const s = f.s; const a = stepArea(s, f.b); const pre = preSkills(s.id);
    const has = s.k.filter(k => SK[k]).length > 0; const dis = has ? '' : 'disabled aria-disabled="true"';
    return `<aside class="panel ${S.lessons.panelOpen ? 'open' : ''}" data-domain="${a}" aria-label="Lesson"><div class="panel-band" data-grade-host>${gbadge(f.y.grade)}<p>${gradeName(f.y.grade)} · White Rose ${esc(f.y.name)} · ${esc(f.b.name)} · step ${s.n}</p><h2>${esc(s.t)}</h2><p>${icon(AREAS[a].icon)} ${areaName(a)}${s.s ? ' · ' + esc(s.s) : ''}</p></div>` +
      `<div class="panel-body"><button class="btn btn-primary btn-wide" data-act="lesson-print">${icon('print')}Print lesson</button>` +
      `<div class="two"><button class="btn" data-act="lesson-practice" ${dis}>${icon('print')}Print practice</button><button class="btn" data-act="lesson-share" ${dis}>${icon('share')}Share practice</button></div>` +
      `<button class="btn btn-wide" data-act="lesson-pre" ${pre.length ? '' : 'disabled aria-disabled="true"'}>Practise pre-skills${pre.length ? ` (${pre.length})` : ''}</button>` +
      `<div><p class="col-title">Skills in this lesson</p><div class="panel-chips">${has ? s.k.filter(k => SK[k]).map(k => chipHTML(k, { act: 'tick-chip' })).join('') : '<span class="note">No practice skill yet — see Skills to be made.</span>'}</div></div>` +
      `<details class="more"><summary>Skills to be made (${s.m.length})</summary>${s.m.length ? `<ul class="note">${s.m.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : '<p class="note">None: every part of this lesson has a skill.</p>'}</details>` +
      `<button class="btn btn-text lesson-close" data-act="panelclose">Back to the lessons</button></div></aside>`;
  }
  function lessonPrintSheet() {
    const f = findStep(S.lessons.lesson); const k0 = f.s.k.find(k => SK[k]);
    const side = `<div class="summary">Lesson · ${esc(f.s.t)}<small>Teacher pages, pupil pages and the answer key</small></div>` +
      `<div class="previews"><div class="page p2"><div class="page-in"><div class="page-head"><span>Name ________________</span><span>Date ________</span></div><div class="page-title">I can ${esc(f.s.t.toLowerCase())}</div>${k0 ? `<div class="page-ex"><b>Let’s learn</b>${T.draw(SK[k0], 'ex')}</div><div class="page-grid c2">${[0, 1, 2, 3].map(i => `<div class="page-cell">${T.draw(SK[k0], 'l' + i)}</div>`).join('')}</div>` : '<p class="page-names">This lesson’s pupil pages come with the later lesson wave.</p>'}</div></div></div>` +
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
      : S.sheet === 'chip' ? chipSheet() : S.sheet === 'board' ? boardView() : S.sheet === 'lessonprint' ? lessonPrintSheet() : S.sheet === 'setconfirm' ? setConfirm() : '';
    if (S.profile && innerWidth < 820) layer.innerHTML = `<div class="scrim" data-act="close"></div><div class="sheet narrow" role="dialog" aria-label="Me"><div class="sheet-head"><h2>Ms Rivera</h2><button class="btn close" data-act="close" aria-label="Close">${icon('close')}</button></div><div class="share-pad">${profileMenu().replace('class="menu"', 'class="menu menu-static"')}</div></div>`;
    document.body.style.overflow = S.sheet || (S.profile && innerWidth < 820) ? 'hidden' : '';
    const t = document.getElementById('toast'); t.hidden = !S.toast; t.textContent = S.toast;
    fitChips(); setHash(); window.dispatchEvent(new Event('mq:render'));
  }
  function toast(msg) { S.toast = msg; render(); clearTimeout(toast.t); toast.t = setTimeout(() => { S.toast = ''; document.getElementById('toast').hidden = true; }, 4000); }
  function openSheet(name) { S.sheet = name; S.copied = false; S.profile = false; S.trayOpen = false; if (name === 'print' || name === 'quiz') { S.kind = null; S.opts = kindDefaults(Object.assign(defaultOpts(), { size: S.opts.size })); } }

  // ---------------- events ----------------
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
    const act = el.dataset.act, arg = el.dataset.arg; const L = S.lessons;
    if (act === 'search' || act === 'lsearch') return;
    if (el.tagName === 'SUMMARY') return;
    e.preventDefault();
    if (act.startsWith('weight:')) { S.weights[act.slice(7)] = arg; return render(); }
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
      case 'trayopen': S.trayOpen = !S.trayOpen; break;
      case 'tray-print': if (S.tray.length) openSheet('print'); break;
      case 'tray-share': if (S.tray.length) openSheet('share'); break;
      case 'tray-quiz': openSheet('quiz'); S.quiz.built = false; S.quiz.from = S.tray.length ? 'skills' : 'standard'; break;
      case 'close': if (S.sheet === 'board' && S.prevSheet) { S.sheet = S.prevSheet; S.prevSheet = null; break; } S.sheet = null; S.profile = false; L.panelOpen = false; break;
      case 'kind': S.kind = arg; S.opts = kindDefaults(S.opts); break;
      case 'pages': S.opts.pages = Math.max(1, Math.min(6, S.opts.pages + Number(arg))); break;
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
  document.addEventListener('input', (e) => {
    if (e.target.id === 'search') { S.q = e.target.value; document.getElementById('skill-list').innerHTML = skillList(); const eb = document.querySelector('.head-skills .eyebrow'); if (eb) { const h = S.q.trim() ? skillHits().length : 0; eb.textContent = S.q.trim() ? `Maths Quest · Teacher · All grades · ${plural(h, 'skill')} ${h === 1 ? 'matches' : 'match'}` : `Maths Quest · Teacher · ${gradeName(S.grade)} · ${plural(D.skills.filter(s => s.g === S.grade).length, 'skill')}`; } fitChips(); window.dispatchEvent(new Event('mq:render')); }
    if (e.target.id === 'lsearch') { S.lessons.q = e.target.value; const pos = e.target.selectionStart; render(); const i = document.getElementById('lsearch'); i.focus(); i.setSelectionRange(pos, pos); }
  });
  document.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('details.more')) S.moreOpen = e.target.open; }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && (S.sheet || S.profile)) { S.sheet = null; S.profile = false; render(); } });
  window.addEventListener('hashchange', () => { readHash(); render(); });
  window.addEventListener('resize', () => { clearTimeout(window.__rz); window.__rz = setTimeout(render, 150); });

  readHash();
  if (S.sheet === 'print' || S.sheet === 'quiz') { const k = S.kind; S.opts = kindDefaults(S.opts); S.kind = k; S.opts = kindDefaults(S.opts); if (qs.get('examples')) S.opts.examples = qs.get('examples'); if (qs.get('pages')) S.opts.pages = Number(qs.get('pages')); }
  if (S.sheet === 'quiz' && !S.tray.length) S.quiz.from = 'standard';
  if (qs.get('confirm') && S.sets[Number(qs.get('confirm'))]) { S.confirm = Number(qs.get('confirm')); S.sheet = 'setconfirm'; }
  render();
  window.MQ = { S, render, plan, summaryText };
})();
