# lf-roles — the teacher's page title (owner request 2026-11-13)

Branch `claude/sweet-newton-c8wrv1-lf-roles-title` (from origin/master `fdfddfdd2`). First build of a new frame option (medium).
Checks were written first and shown failing on master (`f4294f68b`), then the feature was built (`cbfb4e9ca`).

## What the teacher gets
- **Page title**: the teacher's own words replace the skill's "I Can …" title on every page and every answer key
  (default unchanged: the skill's title). Teacher Print screen: the "Page title" box (was "Sheet title", which already
  existed but printed the words raw, unfitted); simple print: More options › Page title.
- **Title place**: Below name (default, today's layout) | Above name. Teacher Print screen: Page setup, under Size / Look;
  simple print: More options.
- **Long titles**: the title keeps the size's title token (M 16 pt, L 18 pt) and NEVER shrinks. It wraps to two lines (the
  layout already takes the second line's 6 mm off the body, HEADER_PARTS_MM.titleWrap). Past two lines it is **cut at the
  last whole word that fits, with "…"**, and the dialog shows a warning with the exact words that print.

### Why cut-with-warning rather than limiting the box
The design standard fixes the title size (HD-14: never shrinks) and the header band (HD-12: at most 26 mm; a third line
would take another 6 mm off every page body and change capacity). Two choices were possible: refuse typing past two lines,
or print two lines and warn. Two lines depend on the size (and a lesson's teaching sheet prints at L whatever is asked), so
a box-level limit would be wrong at one size or the other; fitting at print time measures the real Andika 700 line at the
real size. The ellipsis keeps the cut VISIBLE on paper (a silently cut sentence reads as complete), and the warning says
exactly what prints, so the teacher can shorten it. A one-word title longer than two lines is cut inside the word.

## Changes (file:line at `cbfb4e9ca`)
- `js/modules/sheet/frame.js:42-64` — `pageTitle(text, note, {custom})` (adds `data-ws-title="custom"` only for the
  teacher's words), `TITLE_POSITIONS`, and **the hook `pageHeader(h, {cls})`**: the whole header band (Name / Date / Score
  row, title above or below, the rule). `page()` (`:98`) now draws its header through it; with no option the bytes are
  identical. Exported from `sheet/index.js:39`.
- `css/sheet-kit.css:146-150` (additive) — `[data-ws-title="custom"]` wraps (line-height 7 mm, overflow-wrap anywhere);
  `.ws-head--title-above > .ws-title` swaps the 1 mm margin to below.
- `js/modules/print-sheet.js:2618` — `fitTitle(asked, size)` (`TITLE_MAX_LINES` 2, `TITLE_MAX_CHARS` 200; measures in Andika 700
  at the print size, S → M, lesson → L) and `withTitleOption(req)` (`:2657`, called from `buildSheet`): `req.header.titleText` / `titlePos` become the header
  every role already reads (`title`, `titleLines`, `titleCustom`, `titlePos`); a request without them is passed through
  UNCHANGED. `buildSheet` returns `res.titleFit` `{asked, text, lines, truncated, size}` for the dialog. The practice path
  and the compose path keep a custom title's measured lines (`titleLines`).
- `js/modules/sheet/roles/compose.js` (`frameOf`) and `js/modules/sheet/roles/practice.js` (`sheetHeaders`) — carry
  `titlePos` / `titleCustom` onto page 1's header (continuation pages carry no title, HD-20). The key keeps them
  (`keyHeader` copies the header). `guided.js` untouched.
- `js/modules/teacher-print.js` — `pr.titlePos`, the "Title place" control, the request header (`titleText`, `titlePos`
  only when set), `titleFitCaption()` (the warning under the Page title box, `data-tv-warn="title-cut"`).
- `js/modules/simple-print.js` — `titleHeaderOf(print)`, `PAGE_TITLE_MAX`; `cleanPrint` appends `pageTitle` / `titlePos`
  to the QP1 share code ONLY when set (old codes decode and re-encode unchanged); `openQuickPrint` restores them; the
  More options controls and warning (`fitTitle` at the chosen size). `css/simple-print.css` (additive) `.sp-ptitle*`.

## Hook for lf-engine (anchor charts with Name / Date)
Call `pageHeader({ name: true, date: true, title, titlePos, titleCustom })` from `sheet/index.js`; it returns the same
`<header class="ws-head">` band `page()` prints (Name / Date / Score row, title above or below, rule). `page()`'s signature
is unchanged; `pageTitle` gained an optional third argument only.

## Checks (all new; written first)
| Check | Before (master + checks, `f4294f68b`) | After |
|---|---|---|
| `ws-frame-title` TITLE-IDENT / TITLE-PLACE / TITLE-LONG | FAIL (66, independent/guided/test × add_facts; `design/status/lf-roles/title/ws-frame-title-before.log`) | OK: 690 builds, 1,338 titled pages measured, every role of ROLE_IDS × 3 skills × M/L (`…-after.log`) |
| `ws-title-code` TITLE-CODE-RT / -OLD / -REQ | FAIL (9) | OK |
| `ws-frame-title-ui` (dialog shots) | — | OK |

**Hash proof:** `tests/fixtures/precritic/frame-title/master-hashes.json` — 196 pupil + key hashes rendered on origin/master
(first pinned on `fdfddfdd2`; re-pinned after merging deploy-6 on `a6883082c`, whose Guided round changed 4 Guided pages) (every buildSheet role of `roles/index.js` × addition:add_facts, subtraction:sub_100_no_regroup,
addition:add_wp_10 × M/L, seed 4242; 4 role/skill pairs skipped as unsupported fact layouts). On the feature: **196 of 196
identical**, and the option at its defaults (below, empty text) is byte-identical too.

Backtests (`tests/fixtures/precritic/backtests.json`): `frame-title-place-long` (commit-pair f4294f68b FAIL → cbfb4e9ca OK),
`frame-title-ident-planted` (fixture: planted changed page FAIL → master pin OK), `title-code-roundtrip` (commit-pair) —
all PASS. On precritic's path: `ws-frame-title --skills <keys>` on every `--skill` run; `ws-title-code` on `--teacher`
(registered in ws-precritic-plan `LANE_TOOLS`). Ledger: two lf-roles rows in `design/lessons-first/CHECKS_FROM_CRITICS.md`.

## Gates
All on the tree MERGED with origin/master `a6883082c` (deploy-6, merge `8f6768e0f`; backtests.json / ledger taken as a union):
syntax (`node --input-type=module --check`) on every changed module: OK · ws-boot-smoke OK · ws-code-snapshot OK (734
codes) · ws-frame-title OK (690 builds, 196/196 hashes identical to a6883082c) · ws-title-code OK · ws-roles-unit OK (87) ·
ws-precritic-plan OK (192 rows) · ws-lesson-baseline --all-lessons --sizes M,L --seeds 4242,1 --per-lesson --unpinned
--check: OK (1732 hashes identical) · backtests frame-title-place-long, frame-title-ident-planted, title-code-roundtrip PASS.

## PNGs (`design/status/lf-roles/title/`)
`{independent,guided,test}-{M,L}-{default,above,below,two-line-above,long,long-above}.png` (page 1 of the pupil page,
addition:add_facts) and `dialog-teacher-print-1280.png`, `dialog-simple-print-1280.png`.

## Not covered
- The detailed lesson maker (`role: 'detailed-lesson'`, its own teacher pack) is not a `roles/index.js` role and does not
  read the option.
- The `&set=` link of My sets carries the teacher sheet's print settings, which have no title control; the simple print's
  QP1 code is the share code that carries it.
