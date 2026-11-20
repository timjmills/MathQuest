# My Worksheets: critic round 2 (narrow re-grade at the round cap)

- **Branch:** `claude/sweet-newton-c8wrv1-lf-myworksheets` @ ffdc349f6 (base 35bc9ebb5, merged with master).
- **Critic:** independent, round 2, 2026-11-20.
- **Bar:** `design/audit/RUBRIC.md`. PASS needs ≥ 8 on C1–C4 at every width. The card is `CARD.md` with rulings A15 and A19.
- **Lead rulings applied:**
  - F4: the saved sheet is what is on screen.
  - F7: the label reads "Save to My Worksheets".
  - F5: the message reads "Play opens the practice pages of this lesson."
- **Method:** my own Puppeteer scripts on `tests/lib/ws-harness.cjs`, run in teacher mode:
  - real `mouse.click` and keyboard at 1280×1000 and 1366×768;
  - real `touchscreen.tap` at 1024×768 and 820×1180;
  - My Worksheets opened by tapping **Me**, then **My Worksheets** in the profile menu;
  - the sheets saved by clicking each host's Save button, then the dialog's Save;
  - fresh browser contexts for the `?sheet=` links;
  - CPU throttled ×4 and ×8 for the slow-device edge case of F4.
- **Screenshots:** in `critic-r2/`.

## Verdict: PASS

All ten round-1 findings are fixed. I found no regression and no console error at any width. One new finding, N1, is minor and does not block.

## Scores

| Width | Input | C1 Ease of use | C2 Does the job | C3 Spacing / layout | C4 Card + A19 fidelity | Result |
|---|---|---|---|---|---|---|
| 1280 × 1000 | mouse | 9 | 9 | 9 | 9 | PASS |
| 1366 × 768 | mouse | 9 | 9 | 8 | 9 | PASS |
| 1024 × 768 | touch | 9 | 9 | 8 (N1) | 9 | PASS |
| 820 × 1180 | touch | 8 | 9 | 8 (N1) | 9 | PASS |

## Gate

```
node tests/scripts/ws-my-worksheets.cjs --widths 1280,820      (on ffdc349f6)
  @1280: checked
  @820: checked
(13 sheets saved; widths 1280,820; 204 s)
ws-my-worksheets: OK          exit 0
```

## Round-1 findings, re-checked with real input

| # | What I did | Result |
|---|---|---|
| F1 | On each host (Print worksheets, simple print, online worksheet), I clicked Save, then pressed Tab ×12, Shift+Tab ×12 and Esc. | **Fixed** at 1280 and 1366. Focus left the dialog on 0 of 24 key presses on every host. Esc closed only the dialog, the host stayed open, and focus went back to "Save to My Worksheets" (`critic-r2/sp-after-esc-1280.png`). |
| F2 | I scrolled the page to the bottom, tapped ⋯ on the last card without centring it, waited 2.5 s, then tapped **Duplicate** where it was. | **Fixed** at 1024, 1366 and 820. The menu opens upward, and every one of its 8 items is in the viewport and is the top element at its own centre. On touch it was still open after 2.5 s. The Duplicate tap worked: 4 sheets became 5 (`menu-last-1024.png`, `menu-last-1366.png`, `menu-last-820.png`). |
| F3 | I measured every button, image and text block against its card's box. | **Fixed.** Nothing sticks out at any width. The card is 250 px wide at 1366 and its ⋯ is 48 × 48 (`lib-1366.png`). |
| F4 | I played fresh online worksheets as a teacher: add_facts, then mult_facts + sub_facts. I waited, saved, then played the saved card again from the library. | **Fixed.** The saved page 1 equals the on-screen items (20/20 and 16/16), and Play from the library deals them again. The sheet appears about 0.35–0.55 s after Play, already dealt from the request, so no swap is visible. |
| F4, quick answer | I typed an answer into the first box as soon as it appeared, then saved. | **Fixed.** The first box was ready after 450–600 ms. The answer was kept, and the saved sheet equals the screen. With the CPU throttled ×4 and ×8 the box was ready after 3.2 s and 7.1 s, and both times the saved sheet still equalled the screen. **In real use this does not matter:** the sheet stays hidden until it is dealt, so the teacher has nothing to answer before the swap. The code path that remains (the deal fails, or finishes after the 4-s reveal once someone has answered) is described in N2. |
| F5 | I pressed Play on a saved detailed lesson. | **Fixed.** The toast says "Play opens the practice pages of this lesson.", and 12 expanded-form practice items open (`lesson-play-1280.png`). |
| F6 | I pressed ⋯ › Send as a set on "Friday facts". | **Works.** `mq_teacher_sets` went from 0 to 1 set, "Friday facts", holding mult_facts and add_facts. The gate now has a row for it (`mws-send-set` backtest). |
| F7 | I read each Save control's visible text. | **Fixed.** All three hosts read "Save to My Worksheets": Print worksheets, simple print and the online worksheet. |
| F8 | I looked for Send code on the card face and pressed it. | **Fixed.** It is a full-width button on the card, under Print · Play · ⋯. It copied a 720-character `?sheet=` link and showed the toast "Link copied: it opens this worksheet to print or play". |
| F9 | I read each card's meta line, then made a New mix. | **Fixed.** The meta line drops what the name already says, for example "M · 4 pages · Y4 · B1" under "Lesson · Round to Nearest 10 · 20 Nov", so the date is not repeated. The New mix copy keeps "1 page", with seed 4242 → 194079. |
| F10 | I measured the Save buttons at 820 and 1024. | **Fixed.** Simple print: 230 × 48. Online worksheet: 207 × 48. Print screen: 298 × 48 at 1024 and 498 × 48 at 820. |

## Regressions: none found

These all worked in my own runs:
- **Print** reprints the same sheet: the pupil and key HTML are identical to the request build. This held for every sheet I checked, at every width.
- **Play** deals the same items in print order (16/16 on page 1).
- **The `?sheet=` link, as a teacher:** a fresh page opens "Friday facts: A worksheet was shared with you… Close · Play · Print · Save to My Worksheets" (`link-teacher-1280.png`).
- **The `?sheet=` link, as a pupil:** a fresh context opens the online worksheet with 16 items and is not in teacher mode.
- **Export and import:** the round trip is covered by the gate's EXPORT row (green). I did not repeat it by hand.
- **Delete with Undo:** after Delete the sheet is gone, the Undo bar is in view, and Undo brings the sheet back.
- **Console:** 0 errors and 0 failed requests across all four width runs, the link contexts and the throttled run.
- **Sideways scroll:** none at any width.

## New findings

### N1 · minor · C3 · 820 and 1024: the online worksheet's header buttons are two heights

- **What happens:** "Save to My Worksheets" is now 48 px tall, but "Check answers" and "New sheet" in the same row stay 44 px. The row looks uneven (`online-820.png`).
- **Why it does not block:** every control works and every one is at least 44 px.
- **Fix direction:** set the header row to a 48-px minimum height for all its buttons. Use additive CSS on `#worksheetView` header buttons in teacher mode.
- **Automatic check:** add a TOUCH-WIDTH row to `ws-my-worksheets`. At 820 and 1024, every button in `#wsSaveSheet`'s parent bar has the same height, and that height is ≥ 48.

### N2 · note · C2: the fallback when the fresh online worksheet is not re-dealt

- **The code path:** `_wsDealFromRequest` skips the swap when the deal fails, or when it lands after the 4-s reveal and the teacher has already answered. Save then still keeps the request build, which is a different sheet from the screen.
- **Why it is only a note:** I could not reproduce it, even at ×8 CPU throttle.
- **Fix direction:** if the swap is skipped, Save should keep the on-screen items, or say so in the dialog.
- **Automatic check:** add a row to `ws-my-worksheets` that stubs `pageOneItems` with a 5-s delay, types an answer at 4.5 s, then presses Save. Assert that the saved page 1 equals the on-screen items, or that a stated message is shown.

## Out of scope, seen in passing

- In the simple print, the Size cards show "…" under Big and Medium. This belongs to simple print, not to this lane.
