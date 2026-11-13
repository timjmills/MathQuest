# Critic r3: lf-tools-nos, print size S dropped (round 3, after the round cap)

Independent critic, Opus medium. Branch `claude/sweet-newton-c8wrv1-lf-tools-nos`, head ab9738a94. The r2 head was 4a8e539b4. I verified every claim myself.

## Verdict: FAIL (C1 9, C2 7, C3 9, C4 9)

| Criterion | Score | Why |
|---|---|---|
| C1 correctness / completeness | 9 | N1 is fixed. In compact mode, simple print shows one label, "Compact (12 tables on one page). Set by "All rows on one page".", and no Size picker. The fix is additive CSS: `.sp-root .sp-sizes[hidden] { display: none; }`. I confirmed it in the screenshot `r3-simple-print-compact.png` and with `--browser` on the head: OK, 73 checks, including `FIXED simple print (compact)`. Every restore path reads a stored S as M. The `fitsNotes` nit is fixed: S now reads "in the Compact … layout". |
| C2 checks catch regressions | **7** | The browser gate caught both new code mutations. The static and docs rules missed 2 of my 4 new mutations, and both misses are on precritic's path (D1, D2). The DOC rule also no longer catches one of the ORIGINAL c81 findings (D3). The backtest fixture rows cannot see this, because they pass when any one line fails (D4). This is the third round in which the DOC rule has missed phrasings (r2 N2, then here). |
| C3 no collateral damage | 9 | `ws-code-snapshot`: OK, 734 codes, nothing moved. `ws-boot-smoke`: OK. No backtest row was deleted (66 lines added, 6 changed, 0 rows removed). The CHECKS_FROM_CRITICS ledger went from 145 to 148 rows. `checks-from-critics` gives 107 pass, 24 exempt and 15 fail; the 15 are older rows from other lanes, and none of them is a nos row. |
| C4 clarity of UI and docs | 9 | N3 is fixed. `WORKSHEET_DESIGN_STANDARD.md:22` now defines "**M / L** = the size preset" with the note about the S token. LESSONS_LEARNED L2 now says "count how many fit at M and L". The RUBRIC scope says "M and L since 2026-11-13". The compact label is the same on all three surfaces. |

## The 4 new mutations (scratch copy, `--root`)

| # | Mutation | Static / `--docs` | `--browser` | On precritic's path? |
|---|---|---|---|---|
| M1 | Appended CSS `.sp-root .sp-step .sp-sizes[hidden] { display: grid !important; }`. The existing rule stays, so this is not the corpus's "removed" row. | n/a | **caught**: `FIXED simple print (compact)` sees Big and Medium, both clickable | yes |
| M2 | A MutationObserver in `simple-print.js` clones a size button with `data-v = String.fromCharCode(83)`, labelled "Tiny" | missed (expected) | **caught**: `VISIBLE … no visible or clickable S option` fires on all 4 simple print modes | yes |
| M3 | Doc line "When you print, choose small, medium or large size for the worksheet." added to `design/PAGE_TYPES.md` | **missed** | n/a | **no catch** |
| M4 | `ws-lesson-check.cjs:36` default changed to `(arg('sizes', '') \|\| Object.keys({ S: 1, M: 1, L: 1 }).join(','))` | **missed** | n/a | **no catch** |

`ws-no-size-s --docs --root <copy with M1–M4>` reports **OK**.

## Defects

### D1 (C2): the DOC rule is case-sensitive for size words
- `docLineFindings` matches `\bSmall\b … (Medium|Large)` with a capital S only.
- Evidence from `--lines` on three phrasings:
  - "choose small, medium or large size": clean.
  - "Sizes: small / medium / large.": clean.
  - "Pick a Small, Medium or Large print size.": caught.
- Lowercase is the most natural way prose offers a size, so this is the same class as r2 N2.
- **Automatic check:** match the size words without regard to case (`/\bsmall\b(?:\W+\w+){0,3}?\W+(?:medium|large|big)\b/i` and the reverse order). Add M3 and the slash line to `MUTATIONS` as doc rows.

### D2 (C2): a gate's S default built without a quoted 'S' passes
- Evidence from `--lines`: these two spellings are clean in a gate:
  - `Object.keys({ S: 1, M: 1, L: 1 })`
  - `['L', 'M'].concat(String.fromCharCode(83))`
- `['L','M','L'].replace('L','S')` is caught.
- The browser half judges behaviour for the app, but no behaviour check exists for gates.
- **Automatic check (behaviour, not more regex):**
  - Each gate that takes `--size(s)` reads its default from ONE shared constant, for example `tests/lib/print-sizes.cjs`, which re-exports the kit's `OFFERED_SIZES`.
  - The guard fails any gate that parses `--sizes` without importing that constant.
  - Or each gate prints its resolved sizes under `--dry-run`, and the guard runs that and asserts no S.
- Add M4 as a corpus row.

### D3 (C2): one DOC_EXEMPT phrase anywhere on the line exempts the whole line, so an original c81 finding no longer fires
- c81 `design/audit/RUBRIC.md:5` reads "Practice (single skill and mixed, **S and L**, with keys) … are **not graded** as separate pages".
- `not (?:offered|graded)` in `DOC_EXEMPT` matches the unrelated tail of that line, so the S offer passes.
- Evidence: `--lines` on the four original `no-size-s-docs-c81` lines finds only 3 of 4. RUBRIC:5 is clean.
- **Automatic check:** an exemption must sit within the same clause as the S token, for example within 40 characters of it and with no `;` or `.` between them, or be an explicit `<!-- nos: -->` marker. Add the c81 RUBRIC:5 line to the self-test as a line that must fail.

### D4 (C2): the fixture and commit-pair rows cannot see D3
- `no-size-s-docs-c81` still FAILs on c81 through the other 3 lines (and 186 more), so the row stays green.
- `--lines` fixtures FAIL on any one line, not on each line.
- **Automatic check:** `--lines` fixtures take a per-line `expect` (fail / clean), and the FAIL side requires every `fail` line to produce a finding. Re-cut `r1-mutations-fail.json` and `r2-mutations-fail.json` that way.

## Brief items

1. **N1:** fixed (C1 above).
2. **Mutations:** M1 and M2 caught; M3 and M4 missed (D1 and D2).
3. **Backtest rows.** `ws-backtest --row` passes on all seven nos rows: 76bc, docs-c81, browser-c81, r1-mutations, n1-4a8e, r3-static-4a8e and r2-mutations. Did the moved FAIL sides still fail on their original findings?
   - **76bc: yes.** The current guard reports these on 76bc:
     - APP-PICKER at teacher-print 968/969, teacher-shell 1015, teacher-sheet 770/773 and simple-print 50;
     - APP-RESTORE ×2 and APP-ALIAS ×2;
     - GATE-DEFAULT ×42, including `ws-precritic.cjs:885 ['S','M']`.

     These are the original classes, not only TOKEN findings.
   - **browser-c81: yes.** All 17 original findings are present: SET-LINK, decode, SAVED-SET, APPLY and the Library "Size S"; the sheet has nothing checked; the one-page radiogroup is under "Size fixed …". There are 23 findings in all.
   - **docs-c81: partly.** PRE-FLIGHT items 1 and 2 and PT-DLG-5 are caught. RUBRIC scope "S and L" is no longer caught (D3).
4. **CLAUDE.md allow entries: handled honestly.**
   - In a copy I rewrote CLAUDE.md:60 and :461 without S. `--docs` then FAILs with `ALLOW-STALE: 2`.
   - Because precritic runs `--docs`, the entries cannot outlive the owner's fix.
   - `design/status/lf-checks.md:549` records the report to the lead.
   - Note: :60 names the old L1 title "Size S ignored". That is history, not an offer.
5. **N3 and L2:** fixed. `ws-code-snapshot`: OK. `ws-boot-smoke`: OK. `checks-from-critics`: no row dropped. `--self-test`: OK, 29 planted mutations.

## To pass r4
Fix D1–D4. D2 should be a behaviour rule, not another regex. Then add M3, M4 and the c81 RUBRIC:5 line to the corpus, with per-line expectations.
