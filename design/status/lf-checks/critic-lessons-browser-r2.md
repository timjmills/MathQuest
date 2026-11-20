# Critic: lessons browser, narrow round r2 (lane lf-checks), 2026-11-20

This is an independent narrow critic, run on Opus at medium effort. Graded: branch
`claude/sweet-newton-c8wrv1-lf-tools-lessons` @ 80c55c7ee, fix commits 91410f62a and 610885593, against the r1 defects
D1-D10 (`critic-lessons-browser-r1.md`) and the signed card. The budget is narrow, so this round re-verifies the fixes and
probes D1's cost on a tablet. It is not a full re-grade.

**Verdict: FAIL.** Scores: C1 8, C2 8, C3 **6**, C4 8.

D1-D10 are fixed in the product, and each new rule catches its own defect. The fix for D1, however, freezes the whole screen
while a first page is built (D11, new).

## Gates

| Gate | Result |
|---|---|
| ws-lessons-browse (default widths, now 1366 / 1280 / 1024 / 820) | OK: all 14 rules (LESSON-DOMAIN, AREA-LABELS, FILTER-PASSED, LESSON-BROWSE, SCREEN, THUMB-DETAILED-FIRST-PAGE, SKILLS-VIEWS, PENDING-WORDS, UNIT-NOW-ON-HASH, THUMB-NO-CLIP, HEAD-NO-REPEAT, ROUNDTRIP-VIEW, SKILLS-GRADE-PILLS) |
| ws-lessons-passed | OK (1 passed, 5 pending) |
| ws-boot-smoke | OK |
| ws-precritic-plan --checks-from-critics | OK (570 rows: 466 pass, 104 exempt, 0 fail) |
| ws-backtest, a **sample of 4 of the 9** new rows (budget) | 4 PASS: thumb-first-page, pending-words, screen-48, thumb-no-clip. Not run: skills-views, unit-now-hash, head-no-repeat, roundtrip-view, grade-pills |
| ws-teacher-shell on base 6d0d8ff4a (note, not scored) | FAIL 3, confirmed PRE-EXISTING. The 3 failures are the options popover summary, the sample, and the board code not being pupil-typeable. None of them is in the lessons browser |

**Scratch breaks** were run in a scratch worktree at 1024 with `--only`. Each turned its rule red:

| Defect | Break | Result |
|---|---|---|
| D1 | `cardHTML` given no detailed id | THUMB-DETAILED-FIRST-PAGE FAIL (10): every detailed row shows an item, and the first page is never drawn, cached or reloaded |
| D3 | `pendingWords` says "fix" for a changed-render lesson | PENDING-WORDS FAIL (4) |
| D4 | the 48 px floor removed from the teacher-library.css rules | SCREEN FAIL (2): 29 controls in the opened lesson and 85 on the Skills screen are 44 px |
| D6 | `fitWhole` made a no-op | THUMB-NO-CLIP FAIL (1): 3:D2:4 and 3:D2:5 spill out of their box |

One gap showed up in PENDING-WORDS. A break that returns an EMPTY reason passed: the screen read "Pending re-check: ." and
the rule did not fire. See D12.

## D1-D10 re-verified (product)

- **D1: fixed.**
  - A detailed lesson's card shows its first page, scaled whole into the box (scale 0.159 at 1024).
  - The card shows "First page…" while it waits, and the card does not move: its rect is 167 / 337 px before and after.
  - The page is cached by `lessonId|renderHash` in memory and in IndexedDB. After a reload it is drawn in 307 ms with 0 builds.
  - Its cost is D11 below.
- **D2: fixed.** `#tsOnlyRow` is hidden outside the area view and during search (SKILLS-VIEWS).
- **D3: fixed.**
  - The reasons now come from the registry. The opened g3-oa9 lesson reads "its pages changed after the reviewer passed them,
    so a reviewer checks the new pages".
  - The empty state lists only the pending lessons of the grades on screen.
- **D4: fixed.** Every control on the Skills and Lessons screens is at least 48 px, and the "(0)" toggles are gone.
- **D5: fixed.** UNIT-NOW-ON-HASH passes.
- **D6: fixed.** Item previews are fitted whole after they settle.
- **D7: fixed.**
  - The card has one band.
  - The opened lesson's chip row no longer repeats the CCSS Build / Full facts of the tag row.
- **D8: fixed.** The default widths are all four, and SCREEN measures every control.
- **D9: fixed.** ROUNDTRIP-VIEW passes.
- **D10: fixed.** SKILLS-GRADE-PILLS passes.

## Scores

- **C1 Fidelity: 8.** Card §7 is now built as signed: first page, cache, lazy loading. 0b (one 4 px top band) is met. Nothing
  else in the card changed.
- **C2 Correctness of data: 8.** It is as in r1, with the D3 wording now correct. One weakness, D12: the pending reason comes
  from a regular expression over free text.
- **C3 Usability: 6.** The cause is D11. In Thumbnails, scrolling a detailed-lesson card into view freezes the whole screen
  while its page builds. Below that point the screen is as good as r1 found it, with D4, D5 and D6 now fixed.
- **C4 Checks quality: 8.**
  - Every new rule catches its defect, and the 4 sampled backtest rows FAIL on the bad state and PASS on the fix.
  - The ledger is green.
  - Two gaps: no rule budgets main-thread time for the thumbnails (D11), and PENDING-WORDS misses an empty reason (D12).

## New defects

### D11 (blocker for C3): a first-page thumbnail build freezes the screen

**What happens.**
- `buildFirstPage` (`js/modules/teacher-wrm.js:601`) runs `buildSheet({ role: 'detailed-lesson' ... })` on the main thread.
  `mountLessonPage` (`js/modules/teacher-chip.js:384`) starts it the moment a card nears the viewport.
- The probe ran at 1024x768 with CPU throttled x4, which stands in for a Chromebook or tablet. The page was the grade 3 OA
  thumbnails with a cold cache, card g3-oa9-mult-table-patterns.
  - One **84,135 ms long task**. The longest frame gap was 84 s, and the first page was ready after 101 s.
  - No scroll, click or Escape is handled during that time. The other item previews cannot settle either, so a half-fitted
    preview stays on screen until the build ends.
- Unthrottled it is about 15-21 s, matching the builder's "about 15 s".
- Grade 3 alone has 4 detailed lessons, and they are built one after another, so scrolling a cold grade-3 list can freeze it
  several times.

**What is acceptable.** The cache works (307 ms after a reload) and the loading state is honest. The problem is the first
visit by each teacher on each device, after each deploy, because a deploy changes the render hash.

**Fix options.** Any one of these would do:
- (a) Ship the first-page PNG or HTML as a static asset made at deploy, e.g. in `ws-stamp-assets`, keyed by the render hash.
- (b) Build it in a Worker. This is only possible if the sheet kit can run there; the kit is pure, so this is plausible.
- (c) Until a page exists, show the item preview and build only on an explicit action, such as "Show first page" on the card.

**Automatic check: THUMB-NO-FREEZE.**
- In LESSON-BROWSE, under `Emulation.setCPUThrottlingRate 4` with a cold IndexedDB, observe `longtask` entries.
- Scroll a detailed-lesson card into view and wait until it is ready.
- FAIL if any long task is over 200 ms, or if a rAF round trip is over 500 ms.

### D12 (minor): the pending reason is a regex over free text

- `pendingKind` (`js/modules/lessons-passed.js:92`) classifies `why` with
  `/re-?pinned|render(?:s|ed)? differently|\bstale\b|pages changed/`.
- A new entry worded differently, such as "its render changed", silently becomes a "fix" reason.
- PENDING-WORDS takes its truth from the same function, so it cannot catch this. It also lets an empty reason through.
- Fix: give each `PENDING_RECHECK` entry an explicit `kind: 'changed' | 'fix'`.
- Automatic check: ws-lessons-passed LP-PENDING-KIND requires `kind` on every pending entry. PENDING-WORDS fails when a pending
  line has an empty reason, i.e. the text after "Pending re-check:" is shorter than 10 characters.

## Ruling on the builder's open item: the count-row tab "3" overlaps the first number

**Routed finding. It is not scored against the browser.**

| Render | Overlap? |
|---|---|
| Print, independent sheet for `multiplication:count_by_tables {constant:[3]}` at M | No. The arrow tab "3" sits clear of 3 → 6 → 9 |
| Full-size screen item, `mountCropped` 'large' at 560x420 | No |
| `mountCropped` 'preview' at 210x180 | No (narrow two-per-row layout) |
| **The Skills screen's own card** for that skill (seed `count by 2`, no lessons-browser code involved) | **Yes**: a large "2" is drawn over the tab and the first box |
| The Lessons browser card | Yes, the same way |

So it comes from the count-row template's screen drawing at card width, in the shared cropped-preview path. It is not caused
by the browser's scaling.

**Route:** the count-row / `count_by_tables` template owner, i.e. the screen cell at card width. It is visible on a passed skill
(the 8/10 corner on the Skills card).

**Proposed check:** a cropped-preview probe at the Skills card width for every skill on the count-row template. No text glyph's
box may intersect the tab's box.

Evidence (scratchpad, not committed): `tb/r2/mult3-print.png`, `mult3-screen.png`, `m3-preview.png`, `m3-skillscard.png`,
`mult3-thumb.png`.
