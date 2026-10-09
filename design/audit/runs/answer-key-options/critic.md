# Critic: Wave 1 lane "Answer-key options" (MASTER_PLAN 4.4, INK-31)

Lane tree `agent-a4ebafe2c94eb1dcd`, head `f035a47`. This is an independent critic run: the critic read and tested only and changed no code.
Graded against `design/audit/RUBRIC.md`, which needs 8 or more on all four criteria.

## Verdict: FAIL (blocking defects B1 to B4)

| Criterion | Score | Why |
|---|---|---|
| 1. Correct and complete content | **6** | The short key is empty or incomplete on Stretch, True or False and Error Analysis (B2). On Error Analysis and True or False pages the given claim, the stimulus, is coloured as if it were the answer (B1). |
| 2. Design contract (B&W + INK-31, geometry) | **6** | INK-31 is broken: question content goes reddish orange on 3 page types (B1). The lint allowance that should catch this is too broad (D5). |
| 3. Fit to the owner's request / usability | **7** | Both of the owner's orders work: "original unfilled, then filled, page by page" and "all unfilled, then all filled". But a short key cannot be matched to its sheet for More Practice letters or multi-section prints (B3, B4). |
| 4. Engineering / regressions | **8** | Byte-identical pupil and copy keys when the options are off. No splice, additive CSS, codes stable, lint baseline held. The lane did not merge main first (D6). |

## What was tested (real output)

- Lane test `key-options.cjs --shots`: OK. 4 single-skill sheets plus 1 mixed sheet, at sizes S and L, in all 4 combinations. Every PDF was rasterised and inspected.
- Teacher print screen, driven through the real UI (role cards, Key placement and Key style segments, then Open in tab). The captured documents were rendered to PDF:
  - More Practice A/B after-page/copy gives `P K P K`.
  - More Practice end/short gives `P P k`.
  - Independent after-page/short gives `P k`.
  - Independent end/copy gives `P K`.
  - The captions follow the choice, and there were no console errors.
- Every page type × {end copy, after-page copy, after-page short, end short} through `buildSheet`. The order is right on every type. The short-key item count equals the labelled cells on every page, and no pupil page carries `#c2410c`. Scripted model was not tested because the skill has no worked steps.
- `ws-print-lint --source kit` (default sweep): **463 findings in 33 of 191 documents, which equals the baseline**.
- Targeted lint with `--key-place after-page --key-style copy|short`: 3 skills × 6 roles. No L-KEY, L-INK, L-SPLIT or L-OVERFLOW findings. The only findings are a pre-existing pupil-page L-DENSITY H13 on shade_fraction More Practice.
- `ws-code-snapshot`: OK, 608 codes, nothing moved.
- `ws-boot-smoke` and `ws-share-options`: see the end of this file.
- `git merge-tree claude/sweet-newton-c8wrv1 HEAD`: clean, no conflicts.
- Syntax check passes on all 3 modified ES modules.

## Blocking defects

**B1. INK-31 colours question content on the copy key.** The CSS rule `.ws-page.ws-key [data-ws-ink="solid"]` paints every solid-ink element orange. Cells in the `wrong` state, such as error-analysis.js:648 `mq-pupilwork` and the true-false stack, also tag the given claim as solid.
- On **True or False** the claimed result in the stack is orange. For example, b. shows "5 + 7 = **2**" in orange with False ticked (`tf/true-false-copy-p2.png`).
- On **Error Analysis** the made-up pupil's wrong answer ("Sam wrote **0**") is orange next to the real answer "16" (`tf/error-analysis-copy-p2.png`). On the pupil page the same mark is grey.

A teacher reads orange as "the answer", so the key now shows a wrong number as the answer. INK-31 itself says "the key's copy of the question stay[s] black".

Fix: the colour must apply only to slots the pupil fills in. That is the `data-ws-slot` answer marks, ticks and fills. A cell drawn in the `wrong` state, and its given work, must stay ink. Add a lint mutation that proves this.

**B2. The short key leaves out answers on some page types.**
- **Stretch**: the short key lists only "a. 7 answers shown" and none of the pairs (`tf/stretch-short-p2.png`). For that page the short key is effectively empty.
- **True or False**: the short key lists "a. 16 b. 12 c. 7 d. 7" with no True/False. The judgement is the main answer on that page.
- **Error Analysis**: the short key lists "16, 12, 10, 12" with no Correct / Fix it choice.
- **Shade the fraction**: the short key prints "1 part shaded" for 1/8. A count with no whole, such as "1 of 8 parts", is a weak answer.

Every page type's short key must list what the copy key fills in: the choice plus the value, and an open problem's answers or "any of: …". Extend `key-options.cjs` to compare each short entry against the copy key's filled slots, on every role.

**B3. Short-key group headings do not match the sheets on More Practice.** The pupil sheets are "Practice A" and "Practice B", and both footers read "1/1". The short key heads its groups "Page 1" and "Page 2" (`ui/mp-end-short-p3.png`), so a teacher cannot tell which group belongs to which sheet. Fix: use the sheet's own name (the letter tab), or "Practice A · page 1".

**B4. In a multi-section print, each section's short key restarts at "Page 1".** `buildAll` calls `buildSheet` once per section, and each call numbers its own pages from 1. Every short-key page has the same title, "Answer Key", with no skill or section name; the skill appears only in the 7 pt footer. A two-section print at the end therefore gives two short keys that both begin "Page 1". Fix: give the printout one running page number, or head each group with the section and its "I Can" title.

## Non-blocking defects

- **D5. The lint is blind to B1.** The INK-31 allowance in `ws-print-lint` accepts `#c2410c` on any `[data-ws-ink="solid"]` in key mode. It should accept it only on answer slots, and a `--self-test` mutation should paint a stimulus orange to prove the rule bites. This is not a weakening of the gate, but as written it lets B1 through.
- **D6. The lane did not merge `claude/sweet-newton-c8wrv1` first**, though the brief's first step asks for it. The merge base is `b684322`, which is not `c91cc8b`. As a result, the diff against 20d4ef9 shows active-box.js, the pulse fix and other files as deleted. `git merge-tree` is clean, so the lead's merge should keep them, but the lane test and gates ran without main's latest code. Re-run `key-options` after the merge.
- **D7. The key options are not saved as teacher print defaults.** `printDefaults` and `PRINT_DEFAULTS_KEY` keep size and paper but not the key placement or style, so a teacher who always wants short keys must choose it every session. Recent printouts do keep it, through `rec.req` and `keyPlace`/`keyStyle`, and Reprint honours it.
- **D8. The preview's "Answer keys" tab shows only the first key page**, and does not show the order in after-page mode. This is pre-existing, but it matters more now.
- **D9. The copy key leaves the regroup carry box empty.** On add_20_regroup item d (3 + 17), the carry box is blank. The key is byte-identical to the one before this lane, so this is not new, but INK-31 now says "BUILT … carries and regroup marks" in orange.
- **D10. On "after each page" + short, each pupil page is followed by a whole sheet that holds 6 to 12 answers.** That is what the owner asked for, but it uses a lot of paper (see the owner question).

## Correct as built

- Both of the owner's orders work in every combination: end gives `P…P K…K`, after-page copy gives `P1 K1 P2 K2 …`, and each key page is its own pupil page filled in. Footers read "n/N" on pupil pages, "Key n/N" on after-page copy keys, and "Key i/M" on short keys.
- Fractions print stacked in the short key, and time answers print as "7:30". Labels follow the pupil page, including the a…z wrap. The short key fits 9 pupil pages onto 1 sheet at size L.
- Old requests (`key: true/false`, an old saved printout) build byte-identical pages, and share and settings codes do not change.
- Only answers carry colour on a correct copy key, and the colour shows on Independent, More Practice, shade (fill), clocks and fact stacks. Labels, headings and frames stay black. #C2410C has a contrast of 5.2:1 and stays dark when printed in mono.
- Cells are never split. The short key paginates by group and marks "(continued)".

## Owner questions

1. Duplex printing with "After each page": should each key start on a new sheet, so it is not printed on the back of the pupil page? Suggested: yes, as an option "Start keys on a new sheet (double-sided)", default off.
2. Short key + after each page: is a whole sheet per pupil page acceptable? Or should the short keys be gathered 2 to 4 per sheet with cut lines? Suggested: keep a whole sheet for now and add the cut-sheet option later.
3. Should the key placement and style become saved teacher defaults? Suggested: yes.

## Gates run alone in this critic pass

| Gate | Result |
|---|---|
| `key-options.cjs --shots` | OK |
| `ws-boot-smoke` | OK |
| `ws-share-options` | OK |
| `ws-code-snapshot.mjs` | OK (608 codes, nothing moved) |
| `ws-print-lint --source kit` (default) | 463 findings in 33 of 191 documents, equal to the baseline |
| `ws-print-lint --source kit`, after-page copy and short, 3 skills × 6 roles | no L-KEY / L-INK / L-SPLIT findings (1 pre-existing L-DENSITY on the pupil page) |
| `git merge-tree` into `claude/sweet-newton-c8wrv1` | clean |
