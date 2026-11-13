# Critic r2: lf-tools-nos, print size S dropped (owner 2026-11-13, plan item 9)

Independent critic, Opus medium. Branch `claude/sweet-newton-c8wrv1-lf-tools-nos`, head b47b84c35. The r1 head was c81e70178 and the base is 76bc11c6. I verified every claim myself and did not rely on `design/status/lf-checks.md`.

## Verdict: FAIL (C1 8, C2 7, C3 9, C4 7)

| Criterion | Score | Why |
|---|---|---|
| C1 correctness / completeness | 8 | All the restore paths I tried now read a stored S as M (browser, see below): stored defaults, the sheet, simple print, a saved set, a `&set=` link (import and open), `tvSheetPrint.set`, a quick print, and the Library label. Fact sheets keep 5–10 columns. The compact measurement holds. One surface still disagrees with the ruling (N1). |
| C2 checks catch regressions | 7 | `--browser` catches every code mutation I made (5 of 5). It is on precritic's path and in deploy session 1, and its backtest row goes FAIL on c81 and OK on the head. Two gaps remain. The COMPACT checks never open simple print, which is exactly where N1 lives. The DOC rule misses 3 of 6 phrasings (N2). |
| C3 no collateral damage | 9 | Code snapshot OK: 734 codes, nothing moved. Boot smoke OK. No backtest or ledger row was dropped. |
| C4 clarity of UI and docs | 7 | The Print screen and the worksheet sheet show one clean label, "Compact (12 tables on one page)". Simple print shows that label and also a live Big/Medium picker underneath it (N1). Some contract docs still define "S / M / L" with no note (N3). |

## F1–F4 re-verified

**F1 fixed.**
- What changed:
  - `applyPrintSettings` runs `offeredSize` after the assign (`teacher-sheet.js:1317`).
  - `decodeSetParam` maps the size (`teacher-ui.js:216`).
  - `common()` maps the size (`teacher-sheet.js:168`).
  - The Library shows `Size ${offeredSize(..)}`.
- Evidence: `ws-no-size-s --browser` passes 37 checks on the head. Backtest `no-size-s-browser-c81` is FAIL at c81, OK at the head, PASS overall.

**F2 fixed in behaviour, static guard still idiom-bound.**
- In a scratch worktree I made six mutations:
  - A: drop the applyPrintSettings and decode mapping.
  - B: simple-print restores `d.size = s.size`.
  - C: the Settings picker uses `'SML'.split('')`.
  - D: the Print Setup picker uses `'SML'.split('')`, labelled "Print size".
  - E: add a RUBRIC line "Render every page at size S and at L."
  - F: `printDefaults` uses `d.size || 'L'`.
- The static `ws-no-size-s --docs` returned **OK for all six**.
- `--browser` on A+B+C+D+F together: **FAIL, 12 findings**. Each code mutation was caught:
  - STORE-DEFAULTS;
  - SET-LINK ×3;
  - SAVED-SET;
  - APPLY;
  - PICKERS Settings (an S option, S checked);
  - PICKERS sheet (nothing checked);
  - PICKERS Print Setup (0 Size controls drawn);
  - STORE-SIMPLE.
- Because the browser gate is on precritic's path, this is acceptable. The doc mutation E was not caught (see N2).

**F3 ruled, measured, and labelled on two of three surfaces.**
- I re-measured in the browser by forcing M through `buildSheet` on count_by_tables with `onePage`. Results:

  | Paper | Rows at M | Pages (independent / more practice) |
  |---|---|---|
  | A4 | 12 | 1 |
  | Letter | 11 | 2 |

  The compact layout fits 13 rows on A4 and 12 on Letter. The builder's claim holds.
- The label is defined once (`COMPACT_LABEL`). It is used on Print Setup, the section note, the worksheet sheet, simple print and the option help. The option's own label "All rows on one page" is now quoted consistently.
- No caption says "Small" or "Size S".
- The allow-list reason reads "ruled exception (lead, owner informed)".
- Simple print still fails the ruling (N1).

**F4 fixed** for the PRE-FLIGHT checklist, RUBRIC, PT-DLG-5, L25, EXTENSION_PLAYBOOK item 27 and TEACHER_SCREENS. The L1 row now carries the "reads M against L" note. One leftover: the L2 row still says "count how many fit at S/M/L before building". It is outside the scanned PRE-FLIGHT section.

## New defects

### N1 (C4 and C1, blocker): simple print shows the compact label and a live Big/Medium picker
- Steps: open simple print with `count_by_tables {onePage: true}`.
- Step 3 reads "Compact (12 tables on one page). Set by "All rows on one page"." Directly under it sit the **Big / Medium** buttons, with Medium checked and captioned "1 columns". After them comes "Columns: Auto — fitted by size (1)".
- Screenshot: `design/status/lf-checks/no-size-s/r2-simple-print-compact.png`.
- Root cause: `simple-print.js:1372` sets the `hidden` attribute on `.sp-sizes`. `css/simple-print.css:61` gives `.sp-root .sp-sizes { display: grid }`, which overrides `hidden`.
- The buttons are clickable but do nothing, because the page prints compact anyway. That breaks the lead ruling: one label, never an M/L picker.
- Probe result: `sizeCtl: 1` visible `[aria-label="Size"]` control while `[data-size-fixed]` is shown.
- **Fix:** do not render the radiogroup when the sheet is compact. Alternatively, add an additive rule `.sp-root .sp-sizes[hidden] { display: none; }`.
- **Automatic check:** in `ws-no-size-s --browser`, run `judgeCompact` on simple print too (it currently covers only Print Setup and the sheet). Add a backtest row that FAILs on b47b84c35.

### N2 (C2): the DOC rule misses common phrasings
`--lines` on six planted doc lines caught only three:

| Planted line | Result |
|---|---|
| "S and L" | caught |
| "S, M, L" | caught |
| "at S too" | caught |
| "at size S and at L" | **missed** |
| "Small and Large" | **missed** |
| "--sizes S,M,L" in a doc | **missed** |

- The scan also skips CLAUDE.md, `WORKSHEET_DESIGN_STANDARD.md`, and LESSONS_LEARNED outside PRE-FLIGHT.
- **Automatic check:** widen the regex to cover `\bsizes? S\b`, `--sizes? [^ ]*\bS\b` and `\bSmall\b(?=.*\b(Medium|Large)\b)`. Add those planted lines to the self-test.

### N3 (C4, minor): contract docs still define S with no note
- `WORKSHEET_DESIGN_STANDARD.md:22` still reads "**S / M / L** = the size preset".
- `EXTENSION_PLAYBOOK.md:72` still reads "Size: S / M / L".
- LESSONS_LEARNED L2 still reads "count … at S/M/L".
- The token tables can stay, since the S token still exists. The definitions need a "(S dropped 2026-11-13: offered M / L; S is the decode alias and the one compact layout)" note.
- **Automatic check:** N2's wider DOC scope.

### Nit
`teacher-print.js:1323` `fitsNotes` still rewrites "at size S" as "at size **Small**". I could not make it fire, because the one-page sheet forces one column. If a compact-sheet note ever names its size, though, the UI would print "Small". It should map S to the compact label.

## What I ran
| Check | Result |
|---|---|
| `ws-no-size-s --docs`, `--self-test` | OK (25 exemptions), OK (30 lines) |
| `ws-no-size-s --browser` (head) | OK, 37 checks |
| Mutations A–F, static | 6 of 6 missed |
| Mutations A+B+C+D+F, `--browser` | FAIL, 12 findings (all caught) |
| Compact measurement at M (A4 / Letter × 3 roles) | A4 12 rows on 1 page; Letter 11 rows, 2 pages (independent / more practice) |
| Simple print compact probe | N1 |
| `ws-backtest --row` no-size-s-r1-mutations, no-size-s-docs-c81, no-size-s-76bc, no-size-s-browser-c81 | 4 of 4 PASS |
| `ws-precritic --dry-run` (skill and `--role lesson`) | `no-size-s --docs` and `no-size-s --browser` both planned |
| `ws-deploy-gates.sh` | both in session 1 |
| `ws-precritic-plan --checks-from-critics` | 104 pass, 24 exempt, 15 fail. The 15 are older rows from other lanes. The four new nos rows pass, and none was dropped (r1: 100 / 24 / 15). |
| `ws-code-snapshot` | OK, 734 codes, nothing moved |
| `ws-boot-smoke` | OK |

## To pass r3
1. Fix N1 and extend the COMPACT check to simple print, with its backtest row.
2. Widen DOC (N2) and add the notes (N3).
