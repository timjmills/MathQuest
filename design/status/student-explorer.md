# Lane: student explorer (owner, 2026-11-05)

"On the student side I also want a skill explorer by grade or by domain — we used to have one similarly — so kids can
pick the skills as well to play/print/send/add to quick start."

Built: an "Explore skills" button under the pupil Quick Start cards opens `js/modules/student-explorer.js` (lazy: module and
`css/student-explorer.css` load on the first press). Tabs By grade (K, 1-6, Mix) and By area (DOMAINS chips → their
categories); cards (name, grade badge, area colour, a short example question generated at idle for on-screen cards only,
tick); search through skill-finder.js. Picks are the app's selection (UnifiedSkills), so the bottom row (Add to Quick Start ·
Play · Send · Print) acts on them; Done closes, refreshes Quick Start, scrolls the row into view and focuses Play.

Reused: DOMAINS, visibleSkills (tombstones out), getSkillGrade, GRADE_COLORS (data.js); UnifiedSkills (unified-skills.js);
findSkills (skill-finder.js); generateQuestionFor; makeLazy (globals.js). Same data the Skills Navigator and the
category dropdowns used.

Gate: `node tests/scripts/ws-student-explorer.cjs` (deploy session 1). Screenshots: `design/status/student-explorer/`.
Not yet graded by an independent critic.
