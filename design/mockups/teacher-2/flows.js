// Teacher site 2.0 mock-up: the flows of IMPROVEMENT_PLAN §2.6, as click lists. Used three ways: flows.html (the table),
// walk.js (?walk=<id> highlights each click in the mock-up) and shoot.cjs (Playwright clicks every flow at 1366 and
// 390 and asserts the counts). An action = a click, a typed search or a needed scroll; step = the screen / decision.
(function (root) {
  const OA3 = ['addition:add_word_problems', 'subtraction:sub_wp_start_unknown', 'number_ops_mixed:number_families_mixed'];
  const tick = (k, step, say) => ({ click: `[data-skill="${k}"]`, step, say: say || 'Tick the skill' });
  const FLOWS = [
    { id: 'one-skill', task: 'One skill on paper with its key', plan: { steps: 3, actions: '4', today: '6' }, done: 'print',
      actions: [{ type: '#search', text: 'addition facts', step: 1, say: 'Type in the search box' }, tick('addition:add_facts', 1), { click: '[data-act="tray-print"]', step: 2, say: 'Print in the tray' }, { click: '[data-act="sheet-print"]', step: 3, say: 'Print (Single skill is chosen for you)' }] },
    { id: 'mixed-3', task: 'A mixed page of 3 skills', plan: { steps: 3, actions: '5–8', today: '13' }, done: 'print', expectKind: 'mixed',
      actions: [tick(OA3[0], 1, 'Tick 3 skills from one maths-area list'), tick(OA3[1], 1, 'Tick the second skill'), tick(OA3[2], 1, 'Tick the third skill'), { click: '[data-act="tray-print"]', step: 2, say: 'Print in the tray (Mixed practice by default)' }, { click: '[data-act="sheet-print"]', step: 3, say: 'Print' }] },
    { id: 'code-one', task: 'A code for one skill', plan: { steps: 3, actions: '4', today: '5' }, done: 'copy',
      actions: [{ type: '#search', text: 'addition facts', step: 1, say: 'Type in the search box' }, tick('addition:add_facts', 1), { click: '[data-act="tray-share"]', step: 2, say: 'Share in the tray' }, { click: '[data-act="copy"]', step: 3, say: 'Copy the link' }] },
    { id: 'set-3', task: 'A set of 3 skills to pupils', plan: { steps: 3, actions: '5–8', today: '≈ 11' }, done: 'copy',
      actions: [tick(OA3[0], 1, 'Tick 3 skills'), tick(OA3[1], 1, 'Tick the second skill'), tick(OA3[2], 1, 'Tick the third skill'), { click: '[data-act="tray-share"]', step: 2, say: 'Share' }, { click: '[data-act="copy"]', step: 3, say: 'Copy the link' }] },
    { id: 'mixed-3-search', task: 'A mixed page of 3 skills from three areas, each by search', plan: { steps: 3, actions: '5–8', today: '13' }, done: 'print', expectKind: 'mixed',
      actions: [{ type: '#search', text: 'time to the hour', step: 1, say: 'Search the first skill' }, tick('measurement:time_hour', 1), { type: '#search', text: 'addition facts', step: 1, say: 'Search the second' }, tick('addition:add_facts', 1), { type: '#search', text: 'shade the fraction', step: 1, say: 'Search the third' }, tick('fractions:shade_fraction', 1), { click: '[data-act="tray-print"]', step: 2, say: 'Print (Mixed practice by default)' }, { click: '[data-act="sheet-print"]', step: 3, say: 'Print' }] },
    { id: 'board', task: 'Practice on the board', plan: { steps: 3, actions: '3–4', today: '≈ 5' }, done: 'board',
      actions: [tick(OA3[0], 1), { click: '[data-act="tray-share"]', step: 2, say: 'Share' }, { click: '[data-act="board"]', step: 3, say: 'Show on the board' }] },
    { id: 'quiz-paper', task: 'A quiz on paper', plan: { steps: 3, actions: '3–5', today: '≈ 8+' }, done: 'quiz-print',
      actions: [tick(OA3[0], 1), { click: '[data-act="tray-quiz"]', step: 2, say: 'Quiz in the tray' }, { click: '[data-act="quiz-print"]', step: 3, say: 'Print' }] },
    { id: 'quiz-standard', task: 'A quiz on paper, built from a standard', plan: { steps: 3, actions: '3–5', today: '≈ 8+' }, done: 'quiz-print',
      actions: [{ click: '[data-act="tray-quiz"]', step: 1, say: 'Quiz in the empty tray: Build from opens' }, { click: '[data-act="pickstd"][data-arg="2.NBT.B.5"]', step: 2, say: 'Pick the standard' }, { click: '[data-act="quiz-print"]', step: 3, say: 'Print' }] },
    { id: 'quiz-online', task: 'A quiz for pupils online', plan: { steps: 4, actions: '4–6', today: 'not possible in one place' }, done: 'quiz-copy',
      actions: [tick(OA3[0], 1), { click: '[data-act="tray-quiz"]', step: 2, say: 'Quiz' }, { click: '[data-act="quiz-share"]', step: 3, say: 'Share with pupils' }, { click: '[data-act="copy"]', step: 4, say: 'Copy the link' }] },
    { id: 'lesson-practice', task: 'A White Rose lesson’s practice', plan: { steps: 4, actions: '4', today: '5–6' }, done: 'print', expectKind: 'sections',
      actions: [{ click: '[data-act="go"][data-arg="lessons"]', step: 1, say: 'Lessons (opens where you were last)' }, { click: '[data-lesson="Y3.B1.S4"]', step: 2, say: 'The lesson marked Next' }, { click: '[data-act="lesson-practice"]', step: 3, say: 'Print practice' }, { click: '[data-act="sheet-print"]', step: 4, say: 'Print (Sections, examples the first time)' }] },
    { id: 'lesson-other', task: 'A lesson’s practice from another grade and area', plan: { steps: 4, actions: '6', today: '5–6' }, done: 'print', expectKind: 'sections',
      actions: [{ click: '[data-act="go"][data-arg="lessons"]', step: 1, say: 'Lessons' }, { click: '[data-act="lgrade"][data-arg="4"]', step: 1, say: 'Grade 4' }, { click: '[data-act="larea"][data-arg="NF"]', step: 1, say: 'Fractions & decimals' }, { click: '.lesson[data-act="lesson"]', step: 2, say: 'The first lesson' }, { click: '[data-act="lesson-practice"]', step: 3, say: 'Print practice' }, { click: '[data-act="sheet-print"]', step: 4, say: 'Print' }] },
    { id: 'my-quizzes', task: 'Print a saved quiz again', plan: { steps: 3, actions: '3–4', today: 'quizzes list' }, done: 'quiz-print',
      actions: [{ click: '[data-act="go"][data-arg="classes"]', step: 1, say: 'Classes' }, { click: '[data-act="ctab"][data-arg="quizzes"]', step: 1, say: 'Quizzes: your saved quizzes' }, { click: '[data-act="quizopen"][data-arg="0"]', step: 2, say: 'Print on the quiz' }, { click: '[data-act="quiz-print"]', step: 3, say: 'Print' }] },
    { id: 'lesson-pre', task: 'A lesson’s pre-skills', plan: { steps: 4, actions: '4', today: 'not offered' }, done: 'print',
      actions: [{ click: '[data-act="go"][data-arg="lessons"]', step: 1, say: 'Lessons' }, { click: '[data-lesson="Y3.B1.S4"]', step: 2, say: 'The lesson' }, { click: '[data-act="lesson-pre"]', step: 3, say: 'Practise pre-skills' }, { click: '[data-act="sheet-print"]', step: 4, say: 'Print' }] },
    { id: 'lesson-print', task: 'A detailed lesson', plan: { steps: 4, actions: '4', today: '7' }, done: 'print',
      actions: [{ click: '[data-act="go"][data-arg="lessons"]', step: 1, say: 'Lessons' }, { click: '[data-lesson="Y3.B1.S4"]', step: 2, say: 'The lesson' }, { click: '[data-act="lesson-print"]', step: 3, say: 'Print lesson' }, { click: '[data-act="sheet-print"]', step: 4, say: 'Print' }] },
    { id: 'map-task', task: 'MAP practice by task', plan: { steps: 4, actions: '4', today: '4–5' }, done: 'print',
      actions: [{ click: '[data-act="browse"][data-arg="map"]', step: 1, say: 'Browse by MAP strand' }, { click: '[data-act="maptask"]', step: 2, say: 'Pick a task: its skills go in the tray' }, { click: '[data-act="tray-print"]', step: 3, say: 'Print' }, { click: '[data-act="sheet-print"]', step: 4, say: 'Print' }] },
    { id: 'saved-set', task: 'A saved set', plan: { steps: 3, actions: '3–4', today: '3–4' }, done: 'print',
      actions: [{ click: '[data-act="browse"][data-arg="sets"]', step: 1, say: 'Browse by My sets' }, { click: '[data-act="openset"][data-arg="0"]', step: 2, say: 'Open the set' }, { click: '[data-act="tray-print"]', step: 3, say: 'Print' }, { click: '[data-act="sheet-print"]', step: 3, say: 'Print' }] },
    { id: 'chip-options', task: 'Change one skill’s options', plan: { steps: 1, actions: '1', today: 'buried per screen' }, start: 'tray=demo3', doneSheet: 'chip',
      actions: [{ click: '.tray-chips [data-act="chip"], .tray-count', step: 1, say: 'Tap its chip in the tray' }] },
  ];
  // the narrow (390) chip flow opens the collapsed tray first: the count bar is one tap, then the chip
  Object.assign(FLOWS.find(f => f.id === 'chip-options'), { narrowPlan: '2', narrowNote: 'On a phone the tray is collapsed to “3 skills ▸” (§2.3), so a chip is two taps away' });
  FLOWS.find(f => f.id === 'chip-options').narrow = [{ click: '.tray-count', step: 1, say: 'Tap “3 skills ▸”' }, { click: '.tray-sheet [data-act="chip"]', step: 1, say: 'Tap the chip' }];
  root.MQ_FLOWS = FLOWS;
  if (typeof module !== 'undefined' && module.exports) module.exports = FLOWS;
})(typeof window !== 'undefined' ? window : globalThis);
