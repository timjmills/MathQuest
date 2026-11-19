# Critic r1: lf-tools-nos, print size S dropped (owner 2026-11-13, plan item 9)

Independent critic, Opus medium. Branch `claude/sweet-newton-c8wrv1-lf-tools-nos`, head c81e70178, base 76bc11c6.

## Verdict: FAIL (C1 6, C2 6, C3 9, C4 7)

| Criterion | Score | Why |
|---|---|---|
| C1 correctness / completeness | 6 | Every picker offers only M and L, and most restore paths alias S to M. But the saved-set and share-link (`&set=`) restore keeps S and prints at S (F1). The rule names "URL / share code" outright. |
| C2 checks catch regressions | 6 | `ws-no-size-s` is red first (76bc11c6 FAIL 52), it is on precritic's path and in deploy session 1, and its row passes. But it only matches the exact idioms this change removed. It did not catch F1, and it misses two easy re-introductions (F2). No browser check seeds a stored S and reads it back. |
| C3 no collateral damage | 9 | Code snapshot OK (734 codes, nothing moved). The capacity and empty-band pins lost only S keys (434 and 24, none at M or L). The lesson-baseline S keys were renamed to M with the same hashes. 342 → 344 backtest rows, none deleted. Fact sheets at 9 and 10 columns print at M at 16 pt. |
| C4 clarity of UI and docs | 7 | The pickers are clean (see screenshots). The "All 12 tables on one page" wording disagrees between two places, and its locked radiogroup has nothing checked (F3). The PRE-FLIGHT checklist in LESSONS_LEARNED still tells lanes to render "at S and L" (F4). Saved sets are still described as "Size S" (part of F1). |

## Defects

### F1 (C1, blocker): a saved set or share link with size S restores as S and prints at S
- `js/modules/teacher-sheet.js` `applyPrintSettings(p)` runs `Object.assign(S.opts, p.opts, …)` with no `offeredSize`. It is reached from:
  - `teacher-tray.js:230` (a tray snapshot);
  - `teacher-tray.js:290` (a saved set opened from the Library);
  - the share link's `&set=` print settings (`teacher-sheet.js:988` encodes `printSettings()`, and the tray decodes it through `window.tvSheetPrint.set`).
- From there, `common()` sends `size: 'S'` to `buildSheet`, which still accepts an explicit S (`print-sheet.js:222`, on the allow-list). The page prints at S, and the M/L picker shows neither button checked.
- `teacher-library.js:1166` `setPrintWords` still shows such a set as "Size S".
- **Browser evidence** (scratch probe, this tree):
  - S was seeded into `mq_simple_print`, `mq_teacher_sheet` and `mq_teacher_print_defaults`, then the page was reloaded;
  - `printDefaults().size = M` and the sheet's stored size = M, both correct;
  - `applyPrintSettings({opts:{size:'S'}})` left `S.opts.size` at `"S"`, which is the defect.
- **Fix:** `S.opts.size = offeredSize(S.opts.size, 'M')` after the assign in `applyPrintSettings`. `setPrintWords` should print `offeredSize(o.size)`.
- **Automatic check:** a browser gate, `ws-no-size-s --browser` or a mode of ws-simple-print. It seeds S into every restore entry and asserts M every time. The entries:
  - three localStorage keys;
  - `applyPrintSettings`;
  - a `&set=` link round-trip;
  - `cleanPrint` / a saved quick print;
  - `buildAll` on a recent printout;
  - `buildSimple({size:'S'})`.

  It also asserts that the built plan's `ctx.size` is M, and that no rendered `[aria-label="Size"]` control holds an S button. Add a backtest row: c81e70178 FAIL, then the fix OK.

### F2 (C2): the guard is idiom-bound
I mutated a copy of the tree and ran `ws-no-size-s --root <copy>`:

| Mutation | Result |
|---|---|
| Re-add `['S','S']` to the teacher-shell `segBtns('Size', …)` | FAIL (caught) |
| Deploy line `--sizes S,L` | FAIL (caught) |
| Picker list moved to its own line (`const SIZE_LIST = [[…],['S','Small']]; const SIZES = SIZE_LIST;`) | **OK (missed)** |
| Restore written as `/^[SML]$/.test(d.size) ? d.size : 'L'` | **OK (missed)** |
| `Object.assign(S.opts, saved.opts)` keeping S (the live F1) | **OK (missed)** |

- **Automatic check:** the behavioural browser gate in F1 is the real catch. Statically, also flag any `['S', …]` tuple list or `/[SML]/` test in an app module outside `sheet/`, unless it is on the allow-list.

### F3 (C4, needs an owner ruling): "All 12 tables on one page" still prints at the kit S
- `print-sheet.js:338` forces `size: 'S'`. The Setup control shows M and L disabled, both `aria-checked="false"`, with "Size fixed … only with smaller digits".
- The section note at `teacher-print.js:492` still says "…on one page, **Small**, one column."
- **Judgement:** this is not acceptable as built. The owner ruled that the sizes are M and L. The page silently prints at a third size the UI no longer names: a radiogroup with nothing checked, a label that hides the size in one place and names it in another. It may be the right exception, since 12 rows may not fit at M, but only the owner can grant it.
- **Options:**
  - (a) Measure whether 12 rows fit at M (or at M with a smaller row height) and move the option to M.
  - (b) Get an explicit owner exception and record it in CLAUDE.md item 9. Then show one honest, consistent label in both places (e.g. "Fixed: smaller digits so all 12 rows fit on one page"), as a plain locked note rather than an unchecked radiogroup.
- **Automatic check:** an ARIA rule that every `role="radiogroup"` has exactly one `aria-checked="true"`. Also a text check that "Small" does not appear in any teacher-print size or section caption.

### F4 (C4, minor): live instructions still name S
- `design/audit/LESSONS_LEARNED.md` PRE-FLIGHT items 1–2 say "Rendered at **S and L**" and "items per page at S and L". Every lane runs this list before its critic, and owner rule (3) says briefs drop S.
- The L1 row's check ("S must fit more items … than L") needs a note that it now applies to M against L.
- The signed cards (facts, vocabulary) are historical records and can stay.
- **Automatic check:** extend `ws-no-size-s` to scan RUBRIC, LESSONS_LEARNED PRE-FLIGHT and briefs/*.md for `S and L` and `S / M / L` outside dated history rows.

## What I ran
| Check | Result |
|---|---|
| `ws-no-size-s` (and `--self-test`) | OK (23 exemptions). The allow-list reasons are honest: the 9 dated scripts are on no precritic, deploy or backtest path, and the kit-unit and print-lint entries are token readers. |
| `ws-backtest --row no-size-s-76bc` | PASS |
| `ws-backtest --row fact-cols-m-fixture` | PASS. It is a fixture row, so I also ran the live gate. |
| `ws-fact-cols-m` (live) | OK, 14 sheets: + − ÷ at 9/10 across, × at its own cap of 8, all at 16 pt. I rendered add_facts 10 columns at M: 70 facts, one page, digits clean. |
| Random changed rows | `options-render-pilot` PASS; `slot-clip-pilot` PASS. `eb-fact-roles` FAIL on the pass side, but it fails the same way on the base 76bc11c6, so it predates this change. `cc-size-s` PENDING (a placeholder commit, also older than this change). `facts-print-fix-r3` hit my 590 s cap with no verdict. |
| `ws-precritic-plan --checks-from-critics` | 100 pass, 24 exempt, 15 fail. The 15 are older rows from other lanes. Both new rows pass, and no row was dropped. |
| `ws-code-snapshot` | OK |
| `ws-boot-smoke` | OK |

## Screenshots
`design/status/lf-checks/no-size-s/` shows the change clearly. The simple print goes from Big/Medium/Small (9 columns) to Big/Medium in two even columns, and the teacher Size picker goes from S/M/L to M/L. Not shown: the worksheet sheet's fact Columns row, Settings → Printing defaults, and the one-page locked state (F3), which is the case that most needs a picture.

## To pass r2
1. Fix F1 and land the behavioural gate with its backtest row.
2. Get the owner's ruling on F3, or move the option to M, and make the wording consistent.
3. Fix F4.
