# Critic ebitem r1: exact item pairing for ws-empty-band EB-FOOT, graded at 719674c69 (frozen; cut from master 4474a995)

Independent critic, Opus medium, 2026-11-13. All runs were made in worktrees at 719674c69 (/tmp/claude-0/wt-ebc) and 4474a995
(/tmp/claude-0/wt-ebm), both removed at the end. Browser runs went one at a time through /tmp/mq-browser-run.sh. The probe scripts
(dump.cjs, cmp.cjs, ans.cjs, rev.cjs) are in the critic's scratchpad. No tracked file was edited except this report.

**VERDICT: PASS.** C1 9 · C2 9 · C3 8 · C4 9

## Evidence (runs)
| Run | Result |
|---|---|
| `node --input-type=module --check` on the 4 changed kit files; `node --check ws-empty-band.cjs` | OK |
| `ws-empty-band --self-test` | OK: 9 EB-GDPCAP + 6 PT-MOD-3 + 6 EB-GAP + 15 EB-FOOT pairing cases. Each fallback note is printed: position, multi-item with no measure, index out of range, unindexed cell, not paired |
| **Pixel parity:** buildSheet with key on, for arrays_groups, add_facts, div_facts and subtract_within_100 × independent / review / test / more-practice × S / L (32 renders), branch against master | After the ` data-eb-item="…"` attribute is removed, **32 of 32 pupil pages AND 32 of 32 keys are byte-identical to master**. No CSS file or selector reads `data-eb-item` (grep), so no pixel can move |
| **Key leak:** the order of data-eb-item on the pupil page against the key | Identical on 32 of 32. On every page read cell by cell (arrays_groups independent and review L, add_facts, subtract, div_facts review L), each key cell shows the answer of the item it indexes, including the Mixed Review cells (items 12–14 and 24–26). No index appears twice on a page |
| Reordered page | arrays_groups is laid tallest first, with indexes `2 4 7 0 1 3 5 6`. Each cell reads its own item |
| `ws-backtest --row eb-foot-div-facts,eb-foot-reorder-arrays-groups` | 2 PASS. div-facts: FAIL 149.6 s / OK 162.7 s. arrays-groups: FAIL 77.0 s / OK 77.5 s |
| `ws-empty-band --skill add_facts,mult_facts --hosts none --only EB-FOOT` (pinned) | OK, with no fallback note: every grid cell is indexed |
| The same run on add_facts with `--no-baseline` | 28 findings: 12 are review S/M/L, 4 at each size; the other 16 are `{notation: across}`, already pinned on master. The re-pin touches only the 3 review keys |
| The 12 review findings (rev.cjs) | All 12 are Mixed Review add_sub_10s cells. Each is measured at 12.5 mm (S) or 16 mm (L) at every column count, but drawn 16.4 / 21.6 mm in a 2-column grid. These are real stretches, correctly routed to lf-ops |
| `ws-precritic-plan`, branch and master | Both FAIL on the same 26 rows (diff: only the 2 new rows, both OK on the path) |
| `ws-boot-smoke` | OK |
| `ws-code-snapshot` | OK (732 codes, nothing moved) |

## Defects
None blocks the pass.

**m1 (C1/C3): one fallback is still silent.**
- `fpOf` uses `mi[cols]`, the page's first fit, when an item has no measure at the cell's own grid column count. It prints no note, although the header says every fallback is a NOTE.
- It does not fire today, because items are measured at 1–4 columns.
- **Check:** add a self-test case where the item lacks `m[k]`. It must print `fallback (unmeasured at k across)` and judge nothing.

**m2 (C1): a multi-item cell that is matched only in part is not flagged.**
- In `tagItemIndex`, if a `qs` cell matches only some of its questions, it is written with only the matched indexes. A cell with one match is then judged against one item.
- **Check:** a unit case for tagItemIndex. When `ebItem.length !== qs.length`, set the cell to a flag that EB-FOOT notes ("partly indexed").

**m3 (C3): the parity and key-order probes are not gates.**
- The two strongest proofs in this round are not on precritic's path: the attribute-stripped byte identity, and the pupil key index order.
- **Check:** a backtest or self-test row that strips `data-eb-item` and compares with master's HTML, and asserts that the pupil and key index sequences are equal.

## Scores
- **C1 9:** pairing is exact on reordered, review and mixed pages, and a real foot error still FAILs (self-test, the add_facts review and the div_facts fail state). m1 and m2 are small.
- **C2 9:** arrays_groups goes from 35 false findings to 0. No pixel or key change. The new findings are real.
- **C3 8:** self-test, both backtests, boot-smoke, code-snapshot and the plan are clean (26 rows, the same as master). m3 is open.
- **C4 9:** each note names its mode, the cell and the item number. Every finding gives the item, the column count and the percentage.
