# Critic round 2: Wave 1 lane "Answer-key options" (MASTER_PLAN 4.4, INK-31)

Lane tree `agent-a4ebafe2c94eb1dcd`, head `27c276e`. This is an independent critic run. The critic read and tested only and changed no code.
Graded against `design/audit/RUBRIC.md`, which needs 8 or more on all four criteria. Chromebook-first (1366x768, 1280x720).

## Verdict: FAIL (blocking R2-1 and R2-2)

The round 1 defects are fixed: B1, B2 on the four named page types, B3, B4, D5 and D7. Two blocking defects remain.

- **R2-1.** On about 50 skills a real answer still prints black on the copy key. These are drawn answers: counters, blocks, disks, ticks drawn in SVG, circled coins and time-line jumps. They also include whole key pages whose template never tags its ink.
- **R2-2.** On Opener and Lesson pages the short key leaves out the Guided Practice answers that the copy key fills in. On an Opener page the short key says "Nothing to mark on this page" even though the copy key has three answers.

| Criterion | Score | Why |
|---|---|---|
| 1. Correct and complete content | **7** | The short key is complete on Independent, More Practice, Mixed, Review, Test, True or False, Error Analysis, Reason It, Stretch and Fact rows. It is incomplete on Opener and Lesson (R2-2). |
| 2. Design contract (B&W + INK-31) | **6** | No given content is orange any more (B1 is fixed). But the owner's rule "answers reddish orange" fails on about 50 of 576 skills, where the answer is black (R2-1). |
| 3. Fit to the owner's request / usability | **8** | Both orders work: page copy and short, at the end and after each page. Headings name the sheet ("Practice A", "Check A, page 1 of 2", "Section 2: I Can … · Lesson 1"). The choice is remembered. At 1366x768 the controls are 44 px high and on screen. A minor label overflow is noted under R2-5. |
| 4. Engineering / regressions | **9** | Clean merge into 4970e4b and into the newer 625dcb2. Pupil pages are byte-identical to main with the key on, with it off, and with the default key: 16 roles × 7 skills on the merged tree. Every gate is green or at baseline. |

## Round 1 defects re-proved

| r1 | Status | Evidence |
|---|---|---|
| B1: given claim in key ink | **Fixed** | True or False: the claim "8 + 3 = 1" is black, and the tick and "11" are orange (`r2/true-false-add_20_regroup-copy-end-p2.png`). Error Analysis: "Sam wrote 2" stays grey, and the tick and "12" are orange (`r2/error-analysis-…`). Number bonds: when the answer 5 sits beside a printed 5, only the answer is orange (`r2/independent-number_bonds-…`). A sweep of every skill on Independent (576 skills, alignment of key against pupil text) found no given text in key ink. The 3 hits it raised are circled choice letters and coin labels, and they are correct. |
| B2: short key incomplete (TF, EA, Stretch, shade) | **Fixed for those types** | TF "False; 11", EA "Fix it: 12" / "Correct", shade "1 of 3 parts shaded", Stretch lists the pairs (`r2/stretch-add_facts-short-end-p2.png`). See R2-2 for Opener and Lesson. |
| B3: More Practice headings | **Fixed** | "Practice A" / "Practice B", and "Practice B, page 1 of 2" when a sheet runs on. |
| B4: multi-section short keys | **Fixed** | "Section 1: I Can add facts to 20 · Lesson 1, page 1 of 2" … "Section 2: …". The footers carry the section too. `buildAll` adds `keySection` only when there are 2 or more sections. |
| D5: lint blind to orange on givens | **Fixed** | `ws-print-lint --self-test` passes 48 assertions. Two new planted defects fire L-INK INK-1: "key ink on a key page's question (a given)", which is solid ink with no answer tag, and "key ink on a pupil page answer". Limit: the lint trusts the `data-ws-key-ans` tag. A wrong tag is caught only by the `key-options` sweep and by this critic's alignment sweep (R2-4). |
| D7: key choice as a teacher default | **Fixed** | 1366x768, real UI: Short + After each page writes `{"keyPlace":"after-page","keyStyle":"short"}` to `mq_teacher_print_defaults`. After a reload both segments come back pressed, with the matching captions. `teacher-shell` saves through `{...printDefaults(), ...patch}`, so a size or paper change keeps the key choice. No share or settings code changed (`ws-code-snapshot` OK, `ws-share-options` OK). |
| D9: empty regroup boxes | **Fixed where they are answers** | sub_100_regroup Independent: every regroup box and crossed digit is orange (`r2/independent-sub_100_regroup-…`). The empty boxes left on TF, EA and Reason It belong to the given (made-up) work, which is correct. |

## Blocking defects

**R2-1. Real answers still print black on the copy key (about 50 skills).**
`tagKeyAnswers` tags only elements with `data-ws-ink="solid"`. The CSS then excludes check slots with children and draw slots, except for their grey fills. So any answer a template draws in other ink stays black. The critic's sweep compared each Independent key cell with its pupil twin across all 576 skills, and every case below was confirmed in a rendered PDF.

- **The whole key is black** (13 skills: nothing is tagged): `round_sort_10/100/1000/10000/100000/million/tenths/hundredths`, `rounding_table`, `place_on_number_line`, `place_value_10x`, `pv_disks_build`, `pv_digit_drag`. Images: `r2/independent-round_sort_10-…`, `r2/independent-place_value_10x-…`.
- **Drawn answers are black:**
  - Ten-frame counters: `ten_frame_build`, `ten_frame_build_teen`, `counting_all`.
  - Base-10 blocks: `base10_build`, `base10_build_hundreds`, `base10_regroup`, `grade_2_mixed`.
  - Place-value disks: `pv_disks_build`.
  - Rounding dots: `rounding_visual`, `round_nl_thousands/ten_thousands/hundred_thousands`, `place_on_number_line`.
  - Images: `r2/independent-ten_frame_build-…`, `r2/independent-base10_build-…`, `r2/independent-pv_disks_build-…`.
- **Ticks drawn in SVG are black:** `compare_groups`, `money_compare`, `enough_money`, `equiv_coin_sets`, `time_match_clock`, `time_sense`. By contrast, True or False and Error Analysis ticks are orange. Images: `r2/independent-compare_groups-…`, `r2/independent-money_compare-…`.
- **Circled choices are black:** `coin_value`, "Circle every coin worth the number". The answer rings are black and only the count is orange (`r2/independent-coin_value-…`).
- **Time-line jumps are black:** all 10 `elapsed_*` skills. The pupil page has only the dot, and the key adds the 30-minute arc, its label and the end dot, all in black (`r2/independent-elapsed_30min-copy-end-p1/p2`).

The same holds on every role that prints those cells: More Practice, Mixed, Review, Test, Pre-skill check, Lesson and Opener. Hop-line jumps (`nl_add`, `nl_mult`) are orange, which is correct.

The fix belongs in the kit, not per skill:
- `tagKeyAnswers` should also tag an element the key adds that its pupil twin does not have, whatever its ink, inside a slot (`data-ws-slot`).
- The CSS should colour the strokes and fills of a draw or check slot's added marks, not only grey fills.

Extend `key-options.cjs` with the alignment check (text and SVG marks) and run it over every skill on at least one role.

**R2-2. The short key leaves out Guided Practice answers on Opener and Lesson pages.**
`planPageRows` skips items with `nolabel` or `unlabelled`. The copy key fills those cells, but the short key never lists them.
- **Opener** `time_hour`: the copy key fills 9:00, 11:00 and 8:00. The short key prints "Lesson 1 – Nothing to mark on this page." (`r2/opener-time_hour-copy-end-p2.png` against `r2/opener-time_hour-short-end-p2.png`).
- **Lesson** `count_objects`: the page has 2 Guided Practice items (3 and 9) and 4 labelled items, and the short key lists only a–d (`r2/lesson-count_objects-short-end-p2/p4`).

In the critic's sweep, 40 of 46 template skills on Opener and 43 of 46 on Lesson had a cell that the copy key fills and the short key does not list. The `key-options` sweep misses this: it checks only entries that exist and accepts an empty item list.

Fix: list unlabelled answered items under a sub-heading such as "Guided Practice: 3, 9", or give them a label. Then make the test compare per cell against the copy key, as in R2-2's evidence.

## Non-blocking defects

- **R2-3.** The Stretch short key says "I found 7" but lists 6 pairs. The 7th is the printed example, which a teacher marking the sheet will not see in the key. Suggest "6 more (7 with the example)", or list the example first.
- **R2-4.** The L-INK allowance trusts the `data-ws-key-ans` tag. A mistagged given in key ink would pass the lint. This is acceptable while `key-options` carries a semantic check, but that check should be the alignment check described in R2-1.
- **R2-5.** At 1366x768 the "After each page" label runs past the right edge of its segment pill. The segment is 99 px wide (`r2/ui-1366-keyopts.png`). This is cosmetic, but it is on the owner's Chromebook width.
- **R2-6.** Number-line marks on `nl_add` / `integer_nl_drag` are mixed: the answer dot is an orange ring with a black centre, and the start dot of a hop line is black. This is minor and is covered once R2-1 colours added SVG marks.
- **D8 (r1).** The preview's "Answer keys" tab still shows one key page. This is pre-existing and not blocking.

## Correct as built

- **Byte-identity:** the lane was merged into `625dcb2`, the current `claude/sweet-newton-c8wrv1`. Pupil pages built with `key: true` and `key: false`, and the default key with the tag attribute stripped, are byte-identical to main's on all 16 roles × 7 skills: `add_facts`, `add_20_regroup`, `sub_100_regroup`, `shade_fraction`, `time_half_hour`, `place_value_disks`, `nl_mult`. Comparing against 4970e4b alone flagged lesson `nl_mult`, but that difference comes from main's own later commit (div_facts lane, lesson.js), not from this lane.
- **Page order** in the real UI with After each page + Short is `P k P k`.
- No console errors in the UI run.

## Gates run (one at a time)

| Gate | Result |
|---|---|
| `key-options.cjs`, lane tree | OK |
| `key-options.cjs`, merged tree (lane + 625dcb2) | OK |
| `ws-print-lint --self-test` | OK (48 assertions, 36 planted defects) |
| `ws-print-lint --source kit` | 463 findings in 33 of 191 documents, equal to the baseline |
| `ws-share-options` | OK |
| `ws-teacher-preview` | OK |
| `ws-boot-smoke` | OK |
| `ws-code-snapshot.mjs` | OK (608 codes, nothing moved) |
| `git merge-tree` into 4970e4b and into 625dcb2 | clean |
| Syntax check of the 7 lane JS files in the merged tree | OK |
| Critic alignment sweep (`r2/critic-r2-attack.cjs`): 16 roles × 46 template skills, plus every skill on Independent | R2-1, R2-2 |
