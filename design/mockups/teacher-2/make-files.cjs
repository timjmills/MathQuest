// Teacher site 2.0 T1: the live-vs-branch table of teacher files (STATUS §7 open item), written to files.html.
//   node design/mockups/teacher-2/make-files.cjs     (run `git fetch origin master claude/sweet-newton-c8wrv1-wip-teacher-ui` first)
const { execSync } = require('child_process');
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '../../..');
const sh = (c) => { try { return execSync(c, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch (e) { return ''; } };
const REFS = [['origin/master', 'master (live)'], ['origin/claude/sweet-newton-c8wrv1-wip-teacher-ui', 'wip-teacher-ui'], ['HEAD', 'this branch']];
const refInfo = REFS.map(([r, l]) => ({ r, l, h: sh(`git log -1 --format=%h ${r}`), d: sh(`git log -1 --format=%cs ${r}`) }));
const size = (r, f) => { const s = sh(`git cat-file -s ${r}:${f}`); return s ? Number(s) : null; };
const same = (a, b, f) => sh(`git rev-parse ${a}:${f}`) === sh(`git rev-parse ${b}:${f}`);
// What the T2–T6 plan (IMPROVEMENT_PLAN §2.9, §2.10) does with each file.
const PLAN = {
  'js/modules/teacher-shell.js': 'T2: the four places, profile menu, bottom bar below 820 px. T6: redirects (#wrm/ #map/ #todo/, tvGo aliases), old entry points retired.',
  'js/modules/teacher-ui.js': 'T2: shared controls on the new tokens.',
  'js/modules/teacher-areas.js': 'NEW in T2: areaOf(category, skill), used by every screen and by ws-teacher-tokens.',
  'js/modules/teacher-library.js': 'T3: becomes Skills (search, Browse by, grade chips, Big / Medium / Small / List).',
  'js/modules/teacher-skillpick.js': 'T3: ticking into the tray.',
  'js/modules/teacher-sets.js': 'T3: the tray IS the set (mq_teacher_sets carried over); Browse by › My sets.',
  'js/modules/teacher-print.js': 'T3: the worksheet sheet (three kinds + options); PAGE_GROUPS / PAGE_TYPES and the Look control leave the chrome (code kept).',
  'js/modules/teacher-preview.js': 'T3: the summary line and the small preview, checked against the built PDF.',
  'js/modules/teacher-quiz-ui.js': 'T3: the Quiz sheet (Build from, points, 1–6 versions, Save, Share with pupils).',
  'js/modules/teacher-map-tasks.js': 'T3: Skills › Browse by › MAP strand.',
  'js/modules/teacher-standards.js': 'T3: Skills › Browse by › Standard (covered / not yet).',
  'js/modules/teacher-wrm.js': 'T4: Lessons (2026-10-17 layout restyled, opens where the teacher was last).',
  'js/modules/lesson-tomake.js': 'T4: “Skills to be made” folded into each lesson and area.',
  'js/modules/teacher-todo.js': 'T4: its content moves onto lessons; T6: the screen leaves the menu, #todo/ redirects.',
  'js/modules/teacher-map.js': 'T5: Classes › MAP tests.',
  'js/modules/teacher-label.js': 'Not named in §2.10: kept as is (plain-words labels on every teacher screen).',
  'js/modules/teacher-find.js': 'Only on wip-teacher-ui (the 2026-09-26 find bar). Not in §2.10: T3 search must use the one skill finder (skill-finder.js, CLAUDE.md), so do not bring it over without a decision.',
  'js/modules/prerequisite-skills.js': 'Only on wip-teacher-ui. Needed by Lessons › Practise pre-skills (T4) and More options › Mix in prerequisite skills (T3) but NOT in the §2.10 file lists: a gap to assign before T3.',
  'js/modules/sheet/papers.js': 'Only on wip-teacher-ui. Not in §2.10; the three kinds of worksheet map to existing roles (§2.5 engine mapping), so likely superseded: confirm before T3.',
  'js/modules/quiz-builder.js': 'T3: save path only; the legacy builder pane leaves the teacher chrome (Q-T2), old links keep working.',
  'js/modules/quiz-storage.js': 'T3: Save (saveTest) and Share with pupils (compressTestForURL → ?quiz=), unchanged formats.',
  'js/modules/sheet/roles/test.js': 'T3: the Quiz layer (scoring, versions).',
  'js/modules/print-sheet.js': 'T3: request normalising only.',
  'js/modules/dashboard.js': 'T5: wrapping only (Classes › Progress).',
  'css/teacher-brand.css': 'T2: tokens (this mock-up’s tokens.css is the source).',
  'css/teacher.css': 'T2: shell styles.',
  'css/teacher-library.css': 'T3.',
  'css/teacher-quiz.css': 'T3 (CSS additive: saved quizzes keep their HTML).',
  'css/teacher-wrm.css': 'T4.',
  'tests/scripts/ws-teacher-shell.cjs': 'T6: rewritten for the four places.',
  'tests/scripts/ws-teacher-library.cjs': 'T6: rewritten for Skills.',
  'tests/scripts/ws-teacher-preview.cjs': 'T6: checks the summary line and thumbnails against the PDF.',
  'tests/scripts/ws-teacher-quiz.cjs': 'T6: rewritten for the Quiz sheet.',
  'tests/scripts/ws-teacher-wrm.cjs': 'T6: rewritten for Lessons.',
  'tests/scripts/ws-teacher-tokens.cjs': 'NEW in T1 (palette part, this branch); T2 adds the screen checks.',
  'tests/scripts/ws-teacher-flows.cjs': 'NEW in T3/T6: every §2.6 flow clicked; this mock-up’s shoot.cjs is its prototype.',
};
const files = Object.keys(PLAN);
const kb = (n) => n == null ? '—' : (n / 1024).toFixed(1) + ' KB';
let rows = '';
for (const f of files) {
  const s = REFS.map(([r]) => size(r, f));
  let state;
  if (s[0] == null && s[2] == null && s[1] == null) state = 'not yet made';
  else if (s[0] == null && s[2] == null) state = 'only on wip-teacher-ui';
  else if (s[0] == null) state = 'this branch only';
  else if (s[2] != null && same('origin/master', 'HEAD', f)) state = s[1] == null ? 'live; this branch = live' : (same('origin/master', REFS[1][0], f) ? 'live; same on all three' : 'live; this branch = live; wip-teacher-ui differs');
  else state = 'live; this branch differs';
  rows += `<tr><td><code>${f}</code></td>${s.map(x => `<td class="n">${kb(x)}</td>`).join('')}<td>${state}</td><td>${PLAN[f]}</td></tr>`;
}
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Teacher Files Table</title>
<script>document.documentElement.setAttribute('data-theme','light');/* dark mode parked: owner 2026-10-23 */</script>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Fraunces:ital,opsz,wght@1,9..144,500&family=Inter:wght@500;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="docs.css"></head>
<body><div class="doc"><div class="top"><a class="btn" href="index.html">← Overview</a></div>
<p class="eyebrow">STATUS §7 · teacher files</p><h1>Teacher files: live and branches</h1>
<p class="lead">The open item in STATUS §7: which teacher files are live, which sit only on a branch, and what the T2–T6 plan does with each.</p>
<p class="note">Generated by <code>node design/mockups/teacher-2/make-files.cjs</code> on ${new Date().toISOString().slice(0, 10)} from git. ${refInfo.map(x => `<b>${x.l}</b> = ${x.r.replace('origin/', '')} ${x.h} (${x.d})`).join(' · ')}. Sizes are the file in each; “—” means the file is not there. The app code on this branch is the same as master: T1 changes only the mock-up and the token gate.</p>
<div class="scroll"><table><thead><tr><th>File</th>${refInfo.map(x => `<th>${x.l}<br>${x.h}</th>`).join('')}<th>State</th><th>The plan (§2.9, §2.10)</th></tr></thead><tbody>${rows}</tbody></table></div>
</div></body></html>
`;
fs.writeFileSync(path.join(__dirname, 'files.html'), html);
console.log('make-files: files.html,', files.length, 'files;', refInfo.map(x => x.l + ' ' + (x.h || 'MISSING')).join(' · '));
