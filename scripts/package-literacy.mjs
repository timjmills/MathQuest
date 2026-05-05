#!/usr/bin/env node
// package-literacy.mjs — Extract Literacy Quest into a standalone WebStorm-ready project.
//
// Usage:
//   node scripts/package-literacy.mjs ../LiteracyQuest        (default)
//   node scripts/package-literacy.mjs C:\path\to\new\project
//
// What it does:
//   1. Creates the target directory (errors if it already exists with content).
//   2. Copies all literacy code, content, and docs.
//   3. Copies the small set of shared MathQuest modules literacy depends on.
//   4. Generates a slimmed standalone index.html with only the literacy nav.
//   5. Generates a literacy-only globals.js that imports only literacy modules.
//   6. Generates a CLAUDE.md for the new project.
//   7. Generates a README.md with run instructions.
//   8. Initializes a git repo with one commit.
//
// The output is ready to open in WebStorm and `npx serve .`.
//
// See docs/literacy-quest/PROJECT_SPLIT_GUIDE.md for the architectural rationale.

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TARGET = path.resolve(process.argv[2] || path.join(ROOT, '..', 'LiteracyQuest'));

// ─── Paths to copy verbatim ──────────────────────────────────────────────────

const COPY_TREES = [
    'js/modules/literacy',
    'data/literacy-skills',
    'data/literacy-content',
    'docs/literacy-quest',
    'css/literacy-quest.css',
];

const COPY_FILES = [
    'js/modules/literacy/widgets/README.md',
    'js/modules/literacy/README.md',
    'css/variables.css',
    'css/base.css',
];

// Shared MathQuest modules literacy reads from. Per PROJECT_SPLIT_GUIDE.md
// rule 2, only these six are allowed cross-imports.
const SHARED_MODULES = [
    'js/modules/state.js',
    'js/modules/utils.js',
    'js/modules/storage.js',
    'js/modules/navigation.js',
    'js/modules/features.js',
    'js/modules/widget-retry.js',
    'js/modules/ui-core.js',          // showToast, confetti, updateUI
    'js/modules/gamification.js',     // awardXP / streak / banner
    'js/modules/hints-speech.js',     // TTS used by phoneme-tts and several widgets
    'js/modules/settings-panel.js',   // panel chrome
];

// Phoneme TTS lives at the root of literacy/ but is sometimes referenced from
// outside; copy explicitly.
const EXTRA_FILES = [
    'js/modules/phoneme-tts.js',  // does not exist — actual lives at js/modules/literacy/phoneme-tts.js
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _exists(p) { return existsSync(p); }

function copyTree(src, dst) {
    if (!_exists(src)) return;
    const stat = statSync(src);
    if (stat.isDirectory()) {
        mkdirSync(dst, { recursive: true });
        for (const f of readdirSync(src)) {
            copyTree(path.join(src, f), path.join(dst, f));
        }
    } else {
        mkdirSync(path.dirname(dst), { recursive: true });
        copyFileSync(src, dst);
    }
}

function writeText(rel, content) {
    const full = path.join(TARGET, rel);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content, 'utf-8');
}

// ─── Pre-flight checks ───────────────────────────────────────────────────────

if (_exists(TARGET) && readdirSync(TARGET).length > 0) {
    console.error(`Target directory exists and is not empty: ${TARGET}`);
    console.error('Choose a fresh path or delete the existing one first.');
    process.exit(1);
}
mkdirSync(TARGET, { recursive: true });

// ─── 1. Copy literacy trees + files ──────────────────────────────────────────

console.log('Copying literacy trees…');
for (const tree of COPY_TREES) {
    const src = path.join(ROOT, tree);
    const dst = path.join(TARGET, tree);
    copyTree(src, dst);
    console.log(`  ${tree}`);
}
for (const f of COPY_FILES) {
    const src = path.join(ROOT, f);
    if (_exists(src)) {
        const dst = path.join(TARGET, f);
        mkdirSync(path.dirname(dst), { recursive: true });
        copyFileSync(src, dst);
    }
}

// ─── 2. Copy shared MathQuest modules ────────────────────────────────────────

console.log('Copying shared modules…');
for (const m of SHARED_MODULES) {
    const src = path.join(ROOT, m);
    if (_exists(src)) {
        const dst = path.join(TARGET, m);
        mkdirSync(path.dirname(dst), { recursive: true });
        copyFileSync(src, dst);
        console.log(`  ${m}`);
    }
}

// ─── 3. Generate standalone index.html ───────────────────────────────────────

console.log('Generating index.html…');
writeText('index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Literacy Quest</title>
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/literacy-quest.css">
</head>
<body>
  <div class="container">
    <nav class="topnav">
      <h1 class="brand">Literacy Quest</h1>
      <div class="nav-tip-wrap lit-nav-wrap" id="litNavWrap">
        <button class="btn btn-sm lit-nav-btn"
                onclick="event.stopPropagation();document.getElementById('litNavWrap').classList.toggle('open');">
          Choose Skill ▾
        </button>
        <div class="lit-nav-menu" onclick="event.stopPropagation();">
          <button class="lit-nav-reading"   onclick="document.getElementById('litNavWrap').classList.remove('open');openReadingSkillBrowser();">📖 Reading</button>
          <button class="lit-nav-language"  onclick="document.getElementById('litNavWrap').classList.remove('open');openLanguageSkillBrowser();">✏️ Language</button>
          <button class="lit-nav-map-k2"    onclick="document.getElementById('litNavWrap').classList.remove('open');goToMapReadingK2();">📊 MAP Reading K-2</button>
          <button class="lit-nav-map-25"    onclick="document.getElementById('litNavWrap').classList.remove('open');goToMapReading25();">📊 MAP Reading 2-5</button>
          <button class="lit-nav-map-lang"  onclick="document.getElementById('litNavWrap').classList.remove('open');goToMapLanguageUsage();">📊 MAP Language Usage</button>
          <button class="lit-nav-dashboard" onclick="document.getElementById('litNavWrap').classList.remove('open');goToLiteracyDashboard();">📈 Dashboard</button>
        </div>
      </div>
      <script>
        document.addEventListener('click', function(e) {
          var w = document.getElementById('litNavWrap');
          if (w && !w.contains(e.target)) w.classList.remove('open');
        });
      </script>
    </nav>

    <div class="view active" id="homeView">
      <div style="text-align:center; padding:60px 20px;">
        <h1 style="font-size:clamp(2rem,6vw,3rem); font-weight:900; margin-bottom:10px;">Welcome to Literacy Quest</h1>
        <p style="color:var(--text-dim); font-size:1.1rem;">Choose a skill from the menu above to begin.</p>
      </div>
    </div>

    <!-- Literacy views -->
    <div class="view" id="readingHomeView"><div class="lq-strand-container"><header class="lq-strand-header"><h1>📖 Reading Quest</h1></header></div></div>
    <div class="view" id="languageHomeView"><div class="lq-strand-container"><header class="lq-strand-header"><h1>✏️ Language Quest</h1></header></div></div>
    <div class="view" id="mapReadingK2View"><div class="lq-map-container"><header class="lq-strand-header"><h1>MAP Quest — Reading K-2</h1></header><div class="lq-placeholder"><p>Adaptive engine under construction.</p></div></div></div>
    <div class="view" id="mapReading25View"><div class="lq-map-container"><header class="lq-strand-header"><h1>MAP Quest — Reading 2-5</h1></header><div class="lq-placeholder"><p>Adaptive engine under construction.</p></div></div></div>
    <div class="view" id="mapLanguageUsageView"><div class="lq-map-container"><header class="lq-strand-header"><h1>MAP Quest — Language Usage</h1></header><div class="lq-placeholder"><p>Adaptive engine under construction.</p></div></div></div>
    <div class="view" id="literacyDashboardView"><div class="lq-dashboard-container"><header class="lq-strand-header"><h1>Dashboard</h1></header><div class="lq-placeholder"><p>Per-skill mastery, RIT estimate history, session timeline.</p></div></div></div>
    <div class="view" id="readingSkillBrowserView"><div class="lq-strand-container"><header class="lq-strand-header"><h1>📖 Browse Reading Skills</h1></header><div id="readingSkillBrowserBody" class="lq-skill-browser-body"></div></div></div>
    <div class="view" id="languageSkillBrowserView"><div class="lq-strand-container"><header class="lq-strand-header"><h1>✏️ Browse Language Skills</h1></header><div id="languageSkillBrowserBody" class="lq-skill-browser-body"></div></div></div>
    <div class="view" id="gameView"><div id="questionCard"></div></div>
  </div>

  <script type="module" src="js/globals.js"></script>
</body>
</html>
`);

// ─── 4. Generate standalone globals.js ───────────────────────────────────────

console.log('Generating globals.js…');
writeText('js/globals.js', `// globals.js — Literacy Quest standalone barrel.
// Initializes literacy and attaches public functions to window for inline handlers.

import { state }    from './modules/state.js';
import { showView } from './modules/navigation.js';
import { initLiteracy } from './modules/literacy/literacy-init.js';

window.state = state;
window.showView = showView;

// Boot
window.addEventListener('DOMContentLoaded', () => {
    initLiteracy();
});
`);

// ─── 5. CLAUDE.md ────────────────────────────────────────────────────────────

console.log('Generating CLAUDE.md…');
writeText('CLAUDE.md', `# CLAUDE.md — Literacy Quest

This is the standalone Literacy Quest project, extracted from MathQuest.
For the architectural rationale and the seven portability rules that kept
this split clean, see \`docs/literacy-quest/PROJECT_SPLIT_GUIDE.md\`.

## Running

\`\`\`bash
npx serve .
# Open http://localhost:3000
\`\`\`

ES modules require HTTP — \`file://\` won't work.

## Structure

- \`js/modules/literacy/\` — all literacy code
- \`js/modules/literacy/widgets/\` — 30+ answer widgets (auto-graded only)
- \`data/literacy-skills/\` — ~480 skill atoms across 10 strands
- \`data/literacy-content/\` — UFLI corpus, ETC scope-and-sequence
- \`docs/literacy-quest/\` — design + research docs (incl. ANSWER_MECHANICS_LIBRARY.md)
- \`js/modules/state.js\`, \`navigation.js\`, \`features.js\`, etc. — shared infra
  copied from MathQuest. Trim math-only state keys when you have time.

## Hard rules going forward

1. Every skill must be **auto-gradable**. No voice-memo-graded, no canvas
   free-form, no constructed-response. See \`ANSWER_MECHANICS_LIBRARY.md\` §10.
2. Every skill atom should rotate among **≥3 distinct mechanic widgets** in
   its \`question_types\` array (Variety Rule, §13).
3. New widgets go in \`js/modules/literacy/widgets/\` with the standard
   \`render(q, container)\` + \`check(q, container) → {correct, submitted, feedback}\`
   contract, using \`widget-retry.js\` for the 1-retry-with-partial-lock pattern.

## Researching skills before implementation

Before creating or updating ANY skill, research how similar skills are
implemented on real educational platforms (worksheets and digital). Reference
sites and credentials are documented in \`docs/literacy-quest/\`.
`);

// ─── 6. README.md ────────────────────────────────────────────────────────────

console.log('Generating README.md…');
writeText('README.md', `# Literacy Quest

Reading + Language practice app for K-5 ELL/SPED students.

## Run locally

\`\`\`bash
npx serve .
\`\`\`

Browser-native ES modules. No build step. No bundler. Open in any browser
that supports ES2022.

## Status

- ~480 skill atoms across 10 strands (phonics, fluency, phonemic awareness,
  vocabulary, comprehension lit + info, grammar, mechanics, sentence
  structure, writing).
- ~180 atoms currently playable (see \`js/modules/literacy/coming-soon.js\`).
- 33+ answer widgets registered, all auto-gradable.
- UFLI Foundations corpus integrated (decodable passages + roll-and-read +
  home-practice + slide titles).
- Explode the Code (EPS) scope-and-sequence integrated.

## Docs

See \`docs/literacy-quest/\`:
- \`ARCHITECTURE.md\` — module layout
- \`DATA_MODEL.md\` — skill atom schema
- \`ANSWER_MECHANICS_LIBRARY.md\` — 120+ pedagogically-effective answer mechanics
- \`PROJECT_SPLIT_GUIDE.md\` — how this project was extracted from MathQuest
- \`LIVE_ROADMAP.md\` — phase-by-phase build plan
`);

// ─── 7. .gitignore ───────────────────────────────────────────────────────────

writeText('.gitignore', `node_modules/
.DS_Store
.idea/
.vscode/
*.log
/tmp/
`);

// ─── 8. package.json (minimal — no deps; just metadata) ──────────────────────

writeText('package.json', JSON.stringify({
    name: 'literacy-quest',
    version: '0.1.0',
    private: true,
    type: 'module',
    description: 'Reading + Language practice for K-5 ELL/SPED students',
    scripts: {
        start: 'npx serve .',
        check: "find js/modules -name '*.js' -exec node --input-type=module --check < {} \\;",
    },
}, null, 2) + '\n');

// ─── 9. Initialize git ───────────────────────────────────────────────────────

console.log('Initializing git…');
try {
    execSync('git init', { cwd: TARGET, stdio: 'ignore' });
    execSync('git add -A', { cwd: TARGET, stdio: 'ignore' });
    execSync('git commit -m "Initial commit — extracted from MathQuest"', { cwd: TARGET, stdio: 'ignore' });
    console.log('  done');
} catch (e) {
    console.log('  git init skipped:', e.message);
}

// ─── 10. Summary ─────────────────────────────────────────────────────────────

console.log(`
Literacy Quest packaged successfully.
Target: ${TARGET}

Open in WebStorm:
  1. File → Open → ${TARGET}
  2. From the integrated terminal: npx serve .
  3. Open http://localhost:3000

What's in the new project:
  - All literacy code (js/modules/literacy/)
  - All skill atoms + content (data/literacy-skills/, data/literacy-content/)
  - All design docs (docs/literacy-quest/)
  - Shared MathQuest infrastructure literacy depends on (state, navigation, etc.)
  - Slimmed standalone index.html + globals.js
  - CLAUDE.md, README.md, package.json, .gitignore
  - Git initialized with one commit

Next steps in the new project:
  - Trim unused math-only state keys from js/modules/state.js
  - Customize index.html branding
  - Hook up your own GitHub repo / Netlify / Pages target
`);
