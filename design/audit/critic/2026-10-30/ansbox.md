# Critic: ansBox ("Answer boxes") re-land — worktree agent-aba6e1f626117b720, reland-wip @ d1689639

**Verdict: FAIL.** Lowest score is **O6 = 3** (cap OC13), on the legacy-stack skills on the practice card and in the quiz. Print **P (key matches pupil page) = 5** on the `fact` template.

Sample: add_100_regroup, sub_1k_regroup (kit stack); add_10_regroup, add_10_mixed (legacy stack); add_facts, mult_facts (fact); div_facts, add_sub_10s, divide (equation); multiply (legacy fact). Each was rendered with the option untouched and at digit, one and off. Print at Size S and L, pupil page and key; the screen hosts (practice card, online worksheet, quiz) at 1280.

## What passes
- **No regression on the 7 passed skills.** With the option untouched, the print pupil page and key are byte-identical to main for the 7 skills × 3 roles × S/L (84 documents). The practice-card HTML is identical too. Only the focus-pulse box-shadow differs, and it is animated.
- **ws-options-verify:** 12 skills, digit, one and off, all OK. That covers gen, print, screen and the share-code trip.
- **ws-code-snapshot:** OK (723 codes, no moves).
- **Teacher panel:** the "Answer boxes" disclosure is present and its wording is plain.
- **Kit stack and equation:** all three values work on print, key and every screen host.

## Findings
1. **Legacy-stack skills (add/sub_10, _20, equal_sign …): One box draws the same as one box per digit** on the practice card and in the quiz. The builder's report is confirmed. The online worksheet is correct. OC13/OC3, so O6 ≤ 3 and O4 ≤ 5. Fix: in screen-cell.js, add `mq-ans-one`/`mq-ans-off` to the card/quiz path for legacy stacks, and remove the `.mq-kit` scoping on those CSS rules.
2. **Fact template, digit:** the boxes are narrower than the digit tracks. The key overlays an orange full-width box on the digit boxes, and its digits ("10", "120") spill out of them. Fix: one box per FACT_TRACK, and the key fills those boxes without the outer box.
3. **Fact template, off:** the key draws a box that the pupil page does not have, so the key is not a facsimile of the page. Fix: the key honours `ws-factans--off`.
4. **Equation (add_sub_10s) and legacy multiply:** with any explicit value, the key digits are about half the size of the question digits (0.8em in a small slot). In multiply, the digit-box count varies within one section (3 boxes for 12×7, 2 for 2×5), which breaks the band rule SL-2.
5. **Option labels:** on stack skills, "Automatic" and "One box per digit" give identical output. On add_sub_10s, "Automatic: one box" gives a different page from "One box" (the "?" is dropped). Either way the labels mislead (O5 = 7).

## Checks that would have caught these
- #1, #2, #3: the verifier passed falsely. Its MARK regexes only test that a marker exists somewhere on the page, and `abSig` reads the animated focus shadow, so it never finds two values equal. Fix the check: compare the non-focused inputs only, with animations off. Add **key-vs-pupil slot-shape parity** per cell (the key's answer-place border set equals the pupil's) and **digit-box width ≥ digit track width**.
- #4: a key ink size check (key answer font ≥ 0.9 × question digit size), and a uniform box count per section.
- #5: a panel check that fails when two offered values render identically.

## PNGs (scratchpad)
- /tmp/claude-0/-home-user-MathQuest/5baf4bb0-98dd-5171-a72c-de2b791decbc/scratchpad/ansbox-stack-add_100_regroup-L-default-digit-one-off.png (best example: each value correct)
- /tmp/claude-0/-home-user-MathQuest/5baf4bb0-98dd-5171-a72c-de2b791decbc/scratchpad/ansbox-eq-div_facts-L.png
- /tmp/claude-0/-home-user-MathQuest/5baf4bb0-98dd-5171-a72c-de2b791decbc/scratchpad/ansbox-fact-add_facts-L-default-digit-one-off.png
- /tmp/claude-0/-home-user-MathQuest/5baf4bb0-98dd-5171-a72c-de2b791decbc/scratchpad/ansbox-fact-add_facts-digit-off-key-defect.png
- /tmp/claude-0/-home-user-MathQuest/5baf4bb0-98dd-5171-a72c-de2b791decbc/scratchpad/ansbox-card-add_10_regroup-one-equals-digit.png
- /tmp/claude-0/-home-user-MathQuest/5baf4bb0-98dd-5171-a72c-de2b791decbc/scratchpad/ansbox-quiz-add_10_regroup-one-equals-digit.png
- /tmp/claude-0/-home-user-MathQuest/5baf4bb0-98dd-5171-a72c-de2b791decbc/scratchpad/ansbox-eq-add_sub_10s-L-small-key.png
- /tmp/claude-0/-home-user-MathQuest/5baf4bb0-98dd-5171-a72c-de2b791decbc/scratchpad/ansbox-legacyfact-multiply-L.png
