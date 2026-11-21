# Critic: lessons browser, narrow round r3 (lane lf-checks), 2026-11-21

Independent narrow critic, run on Opus at medium effort. Graded: head cdf071d2f, against r2 (1c8bb3aa2). The round was
limited to four changes:
- the D11 revert, d744efeeb;
- D12;
- THUMB-NO-FREEZE;
- the stall fix, c2f413dfb.

The budget was hard, so nothing else was re-graded.

**Verdict: FAIL.** C1 8, C2 8, C3 8, C4 **7**.

The product is now fine on the points in scope: the 84 s and 5 s freezes are gone, and the thumbnails look the same. The
one problem is the new deploy gate, THUMB-NO-FREEZE. It flakes at its own budget: on the head it went red in 2 of 4 runs.

## 1. The D11 revert: correct

- No first-page build happens on load or scroll.
  - `cardHTML` emits no `data-w-page` host.
  - `buildFirstPage` (`js/modules/teacher-wrm.js:627`) and `mountLessonPage` are kept for next week's button but never called:
    they are marked `void` at `teacher-wrm.js:640-641`.
  - THUMB-DETAILED-ITEM is green in the backtest.
- The waiver text in `design/cards/lessons-browser/lessons-browser.md:273` agrees with what the lead ruled, as recorded in
  `design/status/lf-checks.md:1014-1016`:
  - waiver A20, delegated approval, 2026-11-20;
  - card §7's first-page thumbnail is waived for detailed lessons;
  - the waiver holds until the on-request "Show first page" button and THUMB-NO-FREEZE both ship (next week, item 1).
- No first-page build means no build-time freeze.

## 2. D12: correct

- Every `PENDING_RECHECK` entry now carries `kind` (`js/modules/lessons-passed.js:37-57`), and `pendingKind` reads it first
  (`:100`).
- The old regex survives only as a fallback, and LP-PENDING-KIND makes that fallback unreachable on a green tree.
- Spot break: I removed `kind` from g3-oa9-input-output-rule.
  - Result: `FAIL LP-PENDING-KIND g3-oa9-input-output-rule: a pending entry needs kind ... has undefined` and
    `ws-lessons-passed: FAIL (1)`.
  - After restoring the file: OK.
- Backtest `lessons-passed-pending-kind`: PASS (fail state FAIL, pass state OK).

## 3. THUMB-NO-FREEZE and the stall fix

### Is the gate stable? No: it flakes at the 200 ms budget

| Run on the head | Conditions | Result |
|---|---|---|
| 1 | Another job was starting alongside it | **FAIL**: "a long task of 221 ms (budget 200 ms)" |
| 2 | | OK |
| 3, the ws-backtest pass side at c2f413dfb | Run directly, alongside my screenshot runs | **FAIL (1)** |
| 4 | Fully isolated, nothing else running | OK |

The builder measured 166 ms. Under the deploy train, gates run two browser slots side by side, so this gate will go red about
half the time.

### Does the look stay the same? Yes

- I rendered grade 3 Thumbnails, settled, at 1366 and 1024, at two scroll positions, on 2db6cd1b4 (the revert, before the
  stall fix) and on the head.
- The pixel differences are anti-aliasing only:
  - 3 of the 4 frames have 0 pixels differing by more than 16 levels;
  - the fourth has 1 such pixel.
- The cards, previews, chips and bands are identical. The r2 build shots (`build/b-thumbs-*.png`) show the same layout.

### Did other callers of mountBuilt or fit change behaviour? No

ws-teacher-library is OK and ws-teacher-wrm is OK, one run each on the head.

## 4. ws-backtest (run directly)

| Row | Fail state | Pass state | Verdict |
|---|---|---|---|
| lessons-passed-pending-kind | FAIL | OK | **PASS** |
| lessons-browse-thumb-no-freeze | 1c8bb3aa2: FAIL (2) | c2f413dfb: **FAIL (1)** | **FAIL** (the flake above) |

## Scores

| Criterion | Score | Why |
|---|---|---|
| C1 Fidelity | 8 | Carried from r2. The A20 waiver is recorded in the card and agrees with the lead's ruling |
| C2 Correctness of data | 8 | Carried from r2. The pending reason is now explicit (D12 closed) |
| C3 Usability | **8** | Re-scored. The 84 s first-page freeze (r2 D11) is gone. The 5 s item-thumbnail stalls in the stall profile are now about 166-221 ms tasks at CPU x4 |
| C4 Checks quality | **7** | Re-scored. LP-PENDING-KIND and PENDING-WORDS are good, but THUMB-NO-FREEZE is a flaky deploy gate and its backtest pass state is red |

## Defect

### R3-1: THUMB-NO-FREEZE has no margin

**Where.**
- The rule: `tests/scripts/ws-lessons-browse.mjs:398-401`.
- The step pump: `js/modules/teacher-wrm.js` `drawLessonThumb`, which calls `mountCroppedSteps` (`js/modules/teacher-chip.js`)
  and `mountSteps` / `fitSteps` (`js/modules/teacher-preview.js`).

**Problem.** The heaviest single step costs about 166-221 ms at CPU x4, against a 200 ms budget. The pass/fail result follows
machine load, not the code.

**Fix.** Make the margin real rather than raise the budget. Split the heaviest step (the first style flush after the sample
is inserted, plus `inkTrees`) so that no step goes over about 140 ms, i.e. at least a 30 % margin.

**Automatic check.**
- The rule runs 3 cold passes and fails if the worst long task of any pass is over 200 ms.
- It also prints that worst value on OK, so the margin is visible in every log.
- The backtest pass side must be green on 3 of 3 runs while a second browser job holds the other slot (deploy conditions).

## Routed, not scored

**The `:has()` whole-document restyle** (design/status/lf-checks/lessons-browser/stall-profile.md) is ROUTED to the CSS owners.

The profile measured the cost on the teacher screens, at CPU x4:
- Inserting any element and then reading a style restyles the whole document, about 35 ms.
- With every `:has()` rule deleted, the same restyle takes 1 ms.

At least 8 rules each cause it on their own, in three files. All of them have `:has()` outside the subject compound:
- **sheet-kit.css:**
  - `[data-ws-shape="check"]:has(*)`
  - `.ws-stack-legacy:not(:has(...))`
  - `.ws-cell:has(.ws-eq-left) .ws-with-pane > div`
  - `.ws-cell[data-ws-cell]:not(:has(...))`
- **screen-cell.css:** `.k2-twin:has([data-mq-swiperow]) > *`
- **ui-components.css:** `#questionCard:has(#dndGenericHost) ...`, three rules

These are shared print and play rules, so the lessons browser should not change them.

Proposed check for the owners: a restyle-cost probe on the teacher screen. Insert one element and read `getComputedStyle`,
and fail if this takes more than 5 ms at CPU x4, or a CSS lint that rejects new `:has()` outside the subject compound.

Count-row ruling (r2): unchanged, still routed to the template owner.
