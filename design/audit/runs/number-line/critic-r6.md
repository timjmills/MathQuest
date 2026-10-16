# Custom number line at the top of the page (MASTER_PLAN 5.2): critic, Round 6

Critic: independent. Tree `43a72132` (round-6 fixes for R5-D1 / R5-D2, `6310d884`, main merged at `fbfcd9ee`).
Date 2026-10-10. This file is my only change. Probes, output and screenshots are in the session scratchpad
(`nl-r6c/`): `screen` (card and online worksheet through the queue + `playSelectedSkills` and a real `?c=` link +
`startFromLanding`, 11 sets, 1366x650 and 1280x600, mouse and touch), `overlap` / `dots` (what sits on the band),
`printdiff` (print and quiz data, HEAD against the same tree with the two real-category lines taken out), `roles`
(independent, more-practice, review, guided, model at S/M/L, line on vs off, 150 builds), `sweep` (every offered
skill at S/M/L, seeds 314 and 11, 786 builds).

Rulings applied as in round 5: the 5 owner-accepted builds, the mixed_addition / mixed_subtraction ends-set row
loss at M / L, add_decimal's active-box fault and the mixed pools' band scrolling above at M / L. Stretch and the
thinking pages are not graded; nor are stand-alone Guided and Model pages (RUBRIC scope note). Phone not graded.

## Verdict: FAIL

R5-D1 is fixed: on the queue, a shared link and (by the same `playSelectedSkills`) the teacher screen's Start, the
card and the online worksheet now draw the line from each item's own skill, and the riskiest part of the round —
items carrying their real category — changes nothing on paper. But now that the line reaches the pupil path, it
meets something the direct path never had: **the question-dots row**. In a session with a problem count (every
link with `N10` / `N20`, the queue at the default 20), at Chromebook size the dots row is pulled up over the band
(`css/play-compact.css`, "the question dots ride in the card's top line", `margin: 12px … -44px 0`, `z-index: 3`).
It used to land in the card's top line; the band is now mounted between the dots row and the card, so the dots sit
on the line instead (R6-D1). At 1280x600 and 1366x650 a 20-question session hides the tick labels **14 to 20** of
add_facts' 0..20 line and **70 to 100** of nl_mult's 0..100; a 10-question session hides 17–20 / 90–100, on every
question. The part of the line hidden is exactly where the sums land (7 + 7 = 14 in `shots/overlap-queue20.png`).
Unlimited count has no dots and is clean. The builder's own link shots (`nl-r6/shots/link-add_facts@1366-card.png`)
show the same overlap.

| Criterion | Score | Why |
|---|---|---|
| C1 Ease of use | 7 | On the pupil path the band, problem, answer box and Check are all on screen at 1366x650 and 1280x600 on every set except the accepted ones; touch taps land on the active box with no page jump (dy 0) and Check stays in view; no horizontal scroll, 0 page errors. But in a counted session the progress dots cover the top of the line on every question (R6-D1): the pupil cannot read the part of the line the answer is on. |
| C2 Educational value | 8 | The right line on every item: queue and link, add_facts 0..20 x16, nl_mult 0..100/10, sub_100_regroup 0..100/5, abs_value −20..20/2, round_sort_100 0..1000/50. Two skills, one ticked: the ticked skill's items show its line, the other's none; the worksheet line is the ticked skill's and is not widened by the other (6310d884 holds). Two ticked: merged 0..100/5 on the sheet, each card item its own line. A pool queued beside a skill: the pool's 0..100 on its items, none on the other skill's. Pools without ends: none. Off: none. Paper and screen agree. |
| C3 Spacing and layout | 7 | Paper holds: independent sweep 786 builds, 0 pages added, 0 overflow, band on every pupil and key page; foot-strip growth only on accepted builds (mixed_subtraction @M both seeds, add_wp_10 @L). More-practice and review: 0 pages added, band on every page. But on screen the dots row and the band overlap (R6-D1, 362 x 32 px at N20). |
| C4 Standard fidelity | 8 | Black and white, Andika, live width; key a facsimile with the same band; lint at baseline (463 / 33). Main is already an ancestor of HEAD, `git merge-tree` exit 0. |

## R5 defects: re-check

| r5 | Status | Evidence (nl-r6c) |
|---|---|---|
| R5-D1 pupil paths draw no line | **fixed** | `screen-mouse.txt` / `screen-touch.txt`: queue and link, card + worksheet, 11 sets x 2 sizes, every line as in C2. Link built by `generateSkillCode()` from a cleared store (localStorage and cookies wiped before the `?c=`), with `|Gw-N12` / `|Gp-N20`. support-numberline now plays the queue and a real link (its "queue path" and "Direct link" lines). |
| R5-D2 trim and real-flow gate holes | **partly; acceptable** | The real-flow hole is closed (above). The trim is now `trimToPages`, covered by a fixture that calls it directly; removing its one call in `buildSheet` would still pass the gate. No real independent build needs the trim (my 786-build sweep and the gate's 393 add no page), so there is nothing real to fixture. Nit, not blocking. |
| nit: string list values | **fixed** | `normalizeOptions` maps '1' to 1 through the legal values. |

## The real-category change (the risky part): what I hunted

`generateQuestion`'s all_mixed branch now sets `q.categoryId` to the member's category and `q.mixedHost` to the
asked-for pair; print-sheet.js and print-settings.js put the asked-for pair back (`configuredItem`).

| Reader | Finding |
|---|---|
| Print (kit, every role) | **Unchanged.** 25 review / mixed hosts (counting_all … grade_6_mixed, custom_mixed) x independent / more-practice / review x line off / on, at M with key: 150 builds byte-identical between HEAD and the same tree without the two lines (`printdiff`, `pd-head.txt` vs `pd-nocat.txt`). |
| Quiz data (`quizQuestionData`) | categoryId is now the member's (`comparing`, `addition` …) instead of `all_mixed` / `*_mixed`. Everything else identical (bar timestamp ids). quiz-take's label reads `skillDisplayLabel(qd.categoryId, skillId)`, so a review quiz now shows the item's real skill name instead of falling back to `skillLabel`: an improvement. Saved quizzes keep their stored categoryId. |
| Support ladder, item skill label, worked preview | Read `q.poolMember || q.categoryId`; poolMember was already the member category, so unchanged. |
| Progress / adaptive | Keyed by `q.skillId` / `state.skill`, never by q.categoryId: unchanged. |
| Screen supports (`screenSupportsFor`) | Now finds the member skill's Support option: add_facts with touch dots ticked shows its touch dot in a queue session (`shots/queue-addf_touch-card-1366.png`), where before it showed none. That is what the teacher ticked; fit unchanged. |
| Online worksheet `screenTwin` | Gets the real category (was `all_mixed`): the right provider and instruction ("Add." / "Multiply." per item, `shots/link-addf_mult-worksheet-1366.png`). |
| Share codes | snapshot and codec registry OK. |

No wrong behaviour found.

## Paper on other roles (not graded separately, reported)

`roles.txt`: more-practice and review add no page at S/M/L for any set. Two ungraded roles do:
- **model, nl_mult @S**: line on makes the Scripted Model 2 pages (pupil and key), the second ~170 mm empty.
- **guided, mixed_addition 0..1000 @M**: 1 → 2 pages, 4 → 6 cells.
The trim is independent-only. Minor while Guided / Model are not graded as pages; they will matter in the lessons wave.

## Gates (browser runs through /tmp/mq-browser-run.sh, one script at a time)

| Check | Result |
|---|---|
| `support-numberline` | OK (393 builds, 0 pages added, 0 blank strips, 18 recorded capacity losses; queue path and Direct link lines) |
| `ws-print-lint --source kit` | 463 findings in 33 of 191 documents: **at the baseline** (exit 1 as at baseline; first run a load flake, rerun) |
| `ws-share-options` | OK |
| `ws-code-snapshot.mjs` | OK (608 codes / 35 categories, nothing moved, 2525 option round trips) |
| `ws-codec-registry.mjs` | OK (601 skills, 9731 codes) |
| `ws-screen-answer` | OK |
| `ws-chromebook-fit` | OK (it does not start a counted pupil session with the line on, so it cannot see R6-D1) |
| `ws-boot-smoke` | OK |
| `ws-content-audit` | OK |
| `ws-screen-slots` | OK |
| `wave1-a-probe` | OK |
| `ws-support-ladder` | OK |
| `ws-teacher-quiz` | OK |
| syntax | generate-question, refline-screen, print-sheet, print-settings, skill-options, question-render, worksheet: ok |
| merge into `claude/sweet-newton-c8wrv1` (`fbfcd9ee`) | already an ancestor of HEAD; `git merge-tree` exit 0 |

## Defects (RUBRIC §6)

```json
{
  "feature": "support-numberline",
  "round": 6,
  "pass": false,
  "scores": { "C1": 7, "C2": 8, "C3": 7, "C4": 8 },
  "caps": [],
  "defects": [
    { "id": "R6-D1", "criterion": "C1", "severity": "major",
      "where": "refline-screen.js mountRefLine (band inserted right before #questionCard, i.e. after #qDotsRow) vs css/play-compact.css @media (max-height:860px) and (min-width:1100px) `#gameView > .q-dots-row` (margin 12px … -44px 0, z-index 3: the row is pulled down into the card's top line)",
      "what": "In every counted pupil session (link N10 / N20, queue default 20) at 1280x600 and 1366x650, the question-dots row is drawn over the right end of the number line on every question: 362 x 32 px at N20 (tick labels 14..20 of 0..20, 70..100 of 0..100 hidden), 182 x 32 px at N10 (17..20 / 90..100). That is where the answers land (7 + 7 = 14). Unlimited count (no dots) is clean; the direct path never had dots, which is why no earlier round saw it.",
      "fix": "Keep the dots in the card's top line: mount the band before #qDotsRow when the row is a sibling above the card (or move the row after the band), so the row's negative bottom margin still lands it in the card, not on the band. Additive CSS only if CSS is touched.",
      "check": "Link ?c=<add_facts nlOn>|Gp-N20 → startFromLanding at 1366x650 and 1280x600: every tick label of the band is the topmost element at its point (elementFromPoint inside #mqRefLine), the dots still sit in the card's top line, and Check / the box stay in view. Add it to support-numberline's Direct-link check and to ws-chromebook-fit." },
    { "id": "R6-D2", "criterion": "C3", "severity": "minor",
      "where": "print-sheet.js buildRoleSheet (guided, model)",
      "what": "Ungraded roles: model nl_mult @S 1 → 2 pages with the line (second ~170 mm empty); guided mixed_addition 0..1000 @M 1 → 2 pages. The independent trim does not reach them.",
      "fix": "Before the lessons wave: give the band's height back on these roles the way independent does, or drop a cell.",
      "check": "roles.cjs: no PAGES+ on guided / model." },
    { "id": "R6-N1", "criterion": "C3", "severity": "nit",
      "where": "tests/scripts/support-numberline.cjs",
      "what": "The trim fixture calls trimToPages directly; deleting its call in buildSheet still passes. No real build needs it, so this is the best available cover.",
      "fix": "Optional: assert fits.trimmed is reported by buildSheet on a synthetic request.",
      "check": "-" }
  ],
  "to_raise_to_10": {
    "C1": "R6-D1; active-box for tall decimal boxes (outside this lane).",
    "C2": "-",
    "C3": "R6-D1; the content-bound strips; R6-D2 before the lessons wave.",
    "C4": "-"
  },
  "summary": "R5-D1 is fixed on every pupil path, and items carrying their real category leave paper byte-identical (150 review/mixed builds) and only improve the quiz label and screen supports. It fails on one new screen fault: in a counted session at Chromebook size the question-dots row, designed to ride in the card's top line, now lies on the band and hides the top quarter to third of the line on every question."
}
```

## Owner / lead questions

None new. R6-D1 is a layout fix inside the lane.
