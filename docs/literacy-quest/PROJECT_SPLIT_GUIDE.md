# Literacy Quest — Future Project Split Guide

This document captures the architectural directive: **build Literacy Quest such that it can be lifted out of MathQuest into its own standalone project at any time**, with minimal rewrites.

Every PR that touches Literacy Quest code should respect this principle. When in doubt, optimize for portability over local convenience.

---

## 1. Why this matters

MathQuest and Literacy Quest serve different audiences (math vs. ELA), have different state shapes, and may eventually want different deployment cadences, hosting domains, branding, accessibility requirements, and localization. Keeping the option to split open costs us roughly nothing today but saves weeks of refactoring later.

We are NOT splitting today. The single-repo model is fine while the literacy surface area is small. But every line of literacy code should be writable in such a way that **the day we split, it's a `git filter-repo` + a few barrel-export tweaks, not a multi-week rewrite**.

---

## 2. The seven portability rules

### Rule 1 — All literacy code lives under `js/modules/literacy/` and `data/literacy-skills/` and `data/literacy-content/`

Already enforced. Do not place literacy logic in shared modules. If you need a shared utility, either:
- Duplicate a tiny copy into `js/modules/literacy/_utils.js` (preferred for pure helpers), or
- Promote it to a shared `js/modules/_shared/` directory (last resort).

### Rule 2 — Literacy MAY import from shared MathQuest infrastructure, but only via a documented interface

Allowed cross-imports today:
- `state.js` (state object — literacy adds its own keys with the `literacy*` / `passageSession` / `mapMode` / `mapVariant` prefix)
- `navigation.js` (`showView`)
- `features.js` (`FEATURES.LITERACY_QUEST_ENABLED`)
- `gamification.js` (XP / streak / banner — only `awardXP`, `bannerRecordAnswer`)
- `widget-retry.js` (1-retry-with-partial-lock — shared invariant)

**Not allowed cross-imports**: anything in `gen-*.js` (math generators), `answer-check.js` math paths, `worksheet.js`, `quiz-*.js`, `print-*.js`, `boss-race.js`, `tchart-factor.js`, `divisibility-sort.js`, `dashboard.js`. If you find yourself reaching for one, stop and either copy what you need or build a literacy equivalent.

### Rule 3 — All literacy state lives on `state.literacy*` keys

`state.subject`, `state.literacyEllScaffold`, `state.literacySpedScaffold`, `state.literacyGrade`, `state.literacyRitBand`, `state.literacySession`, `state.passageSession`, `state.mapMode`, `state.mapVariant`, `state.mapSessionMode`. New literacy state must use this prefix. Do not put literacy state on math keys.

When we split, `state.js` becomes two files: `math/state.js` keeps math keys, `literacy/state.js` becomes the new root. The grep is mechanical because the prefix is enforced.

### Rule 4 — Literacy uses its own data directory tree

```
data/
├── literacy-skills/        — skill atoms (10 strands × ~480 atoms)
├── literacy-content/       — passage corpora, word banks, ETC scope-and-sequence
│   ├── reading/
│   │   ├── ufli/           — UFLI Foundations corpus (extracted)
│   │   └── etc/            — Explode the Code scope-and-sequence
└── (math data lives elsewhere; do not co-mingle)
```

When splitting, copy `data/literacy-*` wholesale to the new project's `data/` root. No mixed math/literacy files.

### Rule 5 — Literacy widgets live under `js/modules/literacy/widgets/` and never under the shared widget tree

Literacy widgets are registered in `LITERACY_WIDGETS` (in `js/modules/literacy/literacy-question-render.js`), distinct from the math answer-type system. The widget contract (`render(q, container)` + `check(q, container) → { correct, submitted, feedback }`) matches Math Quest's contract on purpose so the dispatcher pattern is portable, but the widget files themselves are literacy-only.

### Rule 6 — Literacy CSS is namespaced

All literacy-specific styles use the `lq-` prefix and live in `css/literacy-quest.css`. Top-nav literacy controls use `lit-nav-*`. We do not mutate math view CSS. The `.view { display: none }` + `.view.active { display: block }` global is shared, and that's deliberate (Rule 2).

### Rule 7 — Literacy entry points are isolated

The HTML entry is the `📚 Literacy Quest ▾` dropdown in the top nav. All literacy views (`readingHomeView`, `languageHomeView`, `mapReadingK2View`, `mapReading25View`, `mapLanguageUsageView`, `literacyDashboardView`, `readingSkillBrowserView`, `languageSkillBrowserView`) are gated by `data-literacy-gated="true"` and only mount when `FEATURES.LITERACY_QUEST_ENABLED` is true (`literacy-init.js` enforces this).

When splitting, the math home view becomes the math project's only landing; the literacy dropdown becomes the literacy project's standalone navigation root. Both already work as independent surfaces today — the dropdown bypasses the math home view entirely.

---

## 3. The split — concrete steps when we decide to do it

When the day comes:

```bash
# 1. Create new repo, branch off current master
git clone https://github.com/timjmills/MathQuest LiteracyQuest
cd LiteracyQuest

# 2. Filter the repo to literacy paths only (preserves history)
git filter-repo \
  --path js/modules/literacy/ \
  --path js/modules/phoneme-tts.js \
  --path data/literacy-skills/ \
  --path data/literacy-content/ \
  --path docs/literacy-quest/ \
  --path css/literacy-quest.css \
  --path scripts/extract-ufli-content.mjs \
  --path-glob 'Tim'\''s Documents/Literacy Quest/**' \
  --invert-paths --refs HEAD  # then re-run inverted to keep only these
```

(filter-repo invocation will be refined when we actually do this; the point is the path list is short and known.)

```bash
# 3. Copy the small set of shared modules literacy depends on
cp ../MathQuest/js/modules/state.js js/modules/state.js
cp ../MathQuest/js/modules/navigation.js js/modules/navigation.js
cp ../MathQuest/js/modules/features.js js/modules/features.js
cp ../MathQuest/js/modules/gamification.js js/modules/gamification.js
cp ../MathQuest/js/modules/widget-retry.js js/modules/widget-retry.js
# Strip math-specific keys/code from these copies.
```

```bash
# 4. Build a new index.html with only the literacy nav + literacy views
# (gated views become the only views; math home becomes a "go to MathQuest" link)

# 5. Update CLAUDE.md to drop math-specific guidance
# 6. Push to its own GitHub Pages domain (e.g., literacy.cultivatingthedigital.org)
```

**Estimated effort**: 1-2 days when the time comes, assuming the seven rules have been respected. Most of the time is on (4) building the new index.html and trimming shared modules.

---

## 4. Anti-patterns to flag in PR review

These are the things that, if they sneak in, make a future split painful:

| Anti-pattern | Why it's bad | What to do instead |
|---|---|---|
| Importing from `js/modules/gen-*.js` (math generators) inside `js/modules/literacy/` | Couples literacy to math generators that won't ship in the split | Build a literacy equivalent under `js/modules/literacy/gen-*.js` |
| Adding literacy state to a non-prefixed key (e.g., `state.lastWord` instead of `state.literacyLastWord`) | Mixes namespaces; grep gets noisy | Use the `literacy*` prefix |
| Putting a literacy view inside the math home view div | Couples DOM | Add a new top-level `<div class="view" id="...">` after the math views |
| Sharing a CSS class between math and literacy without prefix | Theme drift in one project breaks the other | Use `lq-` for literacy-only, `mq-` for math-only |
| Writing literacy SKILLS into `data.js` (math's DOMAINS/SKILLS) | Conflates skill catalogs | Use `data/literacy-skills/` |
| Calling `goHome()` (math) from a literacy back-button instead of `goToMathHome()` | Routes through math state-clearing that knows nothing about literacy session cleanup | Use the literacy-namespaced navigation functions |
| Adding a `data-literacy-gated` element OUTSIDE the literacy gate (e.g., directly in `homeView`) | Pollutes math landing | Keep literacy DOM inside literacy view containers |

---

## 5. What stays "shared" forever

A small set of utilities are foundational enough that even after a split, both projects probably want a copy:

- **`utils.js`** — `randInt`, `shuffle`, `pick`, `normalizeText` (pure helpers; copy verbatim into both)
- **`storage.js`** — cookie + localStorage helpers (copy)
- **`widget-retry.js`** — 1-retry-with-partial-lock invariant (copy; same pedagogy applies)
- **CSS variables tokens** (`--bg-world`, `--accent-cyan`, dark-mode toggle) — base theming layer; both projects can fork and customize their own palette over the top
- **The widget contract** (`render(q, container)` + `check(q, container)`) — design pattern only, not code; both projects implement it independently

---

## 6. What changes when we split — UX / branding

- Math Quest gets its own home, no literacy nav, no `lit-nav-btn` dropdown.
- Literacy Quest gets a NEW landing screen (currently we navigate straight from the dropdown to the skill browser; on split we'd add a proper landing).
- Each project gets its own domain, GitHub Pages config, accessibility audit, ELL/SPED defaults.
- Skills shareable between domains (e.g., word problems in math reference reading skills) become a deliberate dependency rather than an accidental import.

---

## 7. Today's status: portability scorecard

| Rule | Status | Notes |
|---|---|---|
| 1 — Code lives under `literacy/` | ✅ Enforced | Every literacy module is in the right tree. |
| 2 — Limited cross-imports | ✅ Enforced | Audited 2026-05-04: only `state`, `navigation`, `features`, `gamification`, `widget-retry`, `utils` cross-imported. |
| 3 — `state.literacy*` prefix | ✅ Enforced | All new state keys use the prefix. |
| 4 — Own data tree | ✅ Enforced | `data/literacy-skills/` + `data/literacy-content/` are clean. |
| 5 — Own widgets tree | ✅ Enforced | `js/modules/literacy/widgets/` is the only widget home. |
| 6 — Namespaced CSS | ✅ Enforced | `lq-*` and `lit-*` prefixes. |
| 7 — Isolated entry | ✅ Enforced | Top-nav dropdown + gated views. |

Re-audit this scorecard once per phase. Add a row for any new rule that emerges from a real PR conflict.
