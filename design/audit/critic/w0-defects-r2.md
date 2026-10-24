# Critic r2: W0-defects lane, Board display rebuild and dark quiz dot (mq-opus-medium)

Branch `claude/sweet-newton-c8wrv1-wip-w0-defects` @ 91831a0. Change reviewed: `git diff 3454b55..91831a0 -- css js tests/fixtures`.
Start 2026-10-23T15:28:07Z, end 2026-10-23T15:52:02Z (24 min). I edited no app code and committed nothing. Every browser run went through `/tmp/mq-browser-run.sh` (chromium-1243), one at a time. I compared against 3454b55 in a scratch worktree, which I have since removed.

## Verdict

| Item | Verdict |
|---|---|
| Round-1 defect: the 2 pinned skills at 1366×768 | **FIXED**. Both fit and are whole, including the instruction line. 78 of 78 board renders OK. |
| Board display at 1366×768 and 1920×1080 | **PASS** (≥ 8 on all criteria, every group) |
| Board display at 1280×720 (a size the brief asks for) | **FAIL**. 7 of 39 sample skills lose part of the question, including both target skills. This is an older defect, not caused by this diff, but it is on the graded host. |
| Quiz dot, dark | **FAIL** at C1 7. The current dot is fixed (2.18 → 7.64:1). The answered dot is still 3.10:1. |
| Quiz dot, light | Unchanged: every state is byte-identical to 3454b55 |

## 1. Gates

- `ws-chromebook-fit --bigboard --baseline tests/fixtures/precritic/sweep-sample.json` (1366×768 and 1920×1080): **OK**. 78 of 78 ok, 0 pinned, 0 NEW.
  - At 1366×768: add_word_problems 734×606 and add_sub_fact_family 980×702, both with overflow 0/0.
  - On 3454b55 the same sweep fails: fact family scrolls by 81 px.
- `ws-screen-slots --bigboard --baseline design/audit/baselines/screen-slots.json`: **OK**. 39 renders, 0 pinned, 0 NEW.
- `ws-boot-smoke`: **OK**.
- `ws-code-snapshot`: **OK**. 722 codes, 35 categories, nothing moved or deleted.
- `node --input-type=module --check js/modules/launch-chrome.js`: OK.

## 2. Does the tighter frame hurt the skills that already fit?

**No, it helps them.** I compared the paper size at 1366×768, base against HEAD:
- Every changed skill got bigger, for example:
  - function_table_easy 720×523 → 842×611
  - elapsed_30min 1008×521 → 1152×598
  - long_div_2digit 835×541 → 914×592
  - arrays_groups 763×542 → 828×588
- No skill got smaller.

## 3. What I saw on the board

Probe: `cr2/probe.cjs`, reduced motion, teacher role. Each case was measured three ways: answer hidden, answer shown, answer hidden again.

| Skill | 1366×768 | 1280×720 | 1920×1080 |
|---|---|---|---|
| add_sub_fact_family | Rail, zoom 1, whole, over 0 | Rail, zoom 1, **card scrolls 34 px: last row "20 − 13 =" cut** | Stacked, zoom 1.40 (1.22 shown), whole |
| add_word_problems | Stacked 1.02; **shown → rail 1.16**; hidden → stacked 1.04; whole | Stacked 1.37, **work grid and unit bank cut: 201 px hidden in a nested scroll box** | Stacked 1.42 (1.25 shown), whole |
| add_facts | 1.6, whole | 1.6, whole | 1.6, whole |
| arrays_groups | 1.15 (1.04 shown), whole | 1.37, whole | 1.51, whole |
| long_div_2digit | 1.27 (1.14 shown), whole | 1.37, **remainder rows cut: 68 px nested** | 1.6, whole |

**The rail at 1366×768** (`shots/1366x768-add_sub_fact_family-rev.png`) is coherent:
- The chips, the wrapped title and Exit sit at the top right.
- The Answer box ("20, 20, 13, 7" at 40 px), Show me how, Hide answer and Next question sit at the foot.
- Everything is readable. The question takes the full height, and its instruction line is visible.

**The rail flip on reveal** (add_word_problems at 1366×768): Show answer switches the frame from stacked to rail.
- The chips move to the right.
- The problem moves up by about 37 px and grows by about 14 % (1.02 → 1.16).
- Hide answer switches it back.

My judgement: acceptable. The answer appears where the teacher expects it, the content stays whole, and the problem grows rather than shrinks. It is a bigger version of the zoom change on reveal that every skill already has. **Nit, not required:** decide the layout once per question with the answer's space reserved, so the frame does not change while the class is looking.

**The 1280×720 defect.** This is older code, identical at 3454b55, where the zoom was 1.24.
- Cause: `css/ui-components.css:4634–4642`, `@media (max-height: 760px) .visual-aid { max-height: 46vh; overflow: auto }`. The student-mode play override (`css/play-compact.css:195`) lifts this cap, but nothing lifts it on the board.
- `fitBoard()` only measures the scroll of `#questionCard` and `#gameView`. So it zooms up to 1.37 while the question is cut inside its own bordered cell (`shots/1280x720-add_word_problems.png`, `shots/1280x720-long_div_2digit.png`).
- Nested clipping on the board at 1280×720, from `cr2/clip720.txt`, whole sample:

| Skill | Hidden inside the cell |
|---|---|
| add_word_problems | 201 px |
| function_table_easy | 135 px |
| temperature | 85 px |
| long_div_2digit | 68 px |
| time_hour | 28 px |
| compare_groups | 27 px |
| add_sub_fact_family | card scrolls 34 px |

- At 1366×768 and 1920×1080 there is no nested clip above 11 px; those are 3–11 px padding remainders and nothing visible is cut.
- The sweep does not see any of this, because `--bigboard` only runs 1366×768 and 1920×1080 and only counts card and frame scroll.

## 4. fitBoard logic

**No loops.**
- Idle for 3 s on a rail question: 0 class mutations on `#gameView`, 0 attribute mutations on the paper.
- The class-watcher in `watchBoard` sees the rail toggle, but does nothing while `boardOn` is set.

**Rail cleared at the right times.**
- `fitBoard` removes the rail first, on every call.
- Mixed queue (add_facts, then fact family): question 1 is stacked at 1.6, question 2 is on the rail, and later questions are decided one at a time.
- Leaving the board: rail false, fitted false, `--tvb-fit` empty, bar removed.
- Re-entering the board puts the rail back.

**Resize, both ways.**
- Starting at 1366×768: rail at zoom 1 → grow to 1920×1080: stacked at 1.21 → shrink: rail at 1 → grow: stacked at 1.21. Correct.
- Nit, older behaviour: the fact family drawing is sized when it is drawn, so its zoom after a resize depends on the size it was drawn at.
  - Drawn at 1920: zoom 1.40, and shrunk to 1366 it fits stacked at zoom 1.
  - Drawn at 1366: grown to 1920 it gets 1.21.
  - Both results are whole.

## 5. Quiz dots

Computed colour, composited background and contrast, 12 px / 700. Probe: `cr2/probe-dot.cjs`, measured after the 0.2 s transition.

| State | Light (HEAD = base) | Dark base | Dark HEAD |
|---|---|---|---|
| current | #fff on #7c5ce6, 4.64 | #fff on #b5a5f4, **2.18** | #1f1b33 on #b5a5f4, **7.64** |
| current + flagged | #f97316 on #7c5ce6, 1.65 | 1.29 | **7.64** |
| plain | #8b879f on #dceeee, 2.89 | 7.16 | 7.16 |
| flagged | 2.34 | 6.22 | 6.22 |
| answered | #059669 on #b1e9de, 2.80 | #059669 on #163e40, **3.10** | **3.10** |
| current + answered | 2.80 | 3.10 | 3.10 |
| answered + flagged | 2.04 | 5.03 | 5.03 |

- The fix does what it says, and light mode is unchanged.
- **Dark answered dots are still 3.10:1**, below the 4.5:1 bar. The `:not(.answered)` keeps the green ink on purpose. This is the most common dot on a half-done quiz.
- In both modes, a **current dot that is answered looks exactly like an answered one** (`dot-dark.png`, dot 6). The pupil loses "which question am I on" once it is answered. This is older code.
- Light mode is below 4.5:1 on plain, answered and flagged dots. This is a palette issue outside this lane's dark-mode scope; I report it for the owner.

## 6. Grades

| Screen | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Board, short skills (add_facts), all three sizes | 9 | 9 | 9 | 8 |
| Board, medium skills (arrays_groups; long_div_2digit at 1366 and 1920) | 9 | 9 | 8 | 8 |
| Board, add_sub_fact_family, 1366×768 (rail) and 1920×1080 | 8 | 9 | 8 | 8 |
| Board, add_word_problems, 1366×768 (with flip) and 1920×1080 | 8 | 9 | 8 | 8 |
| **Board at 1280×720**: add_word_problems, long_div_2digit, temperature, function_table_easy, time_hour, compare_groups | **6** | 9 | **6** | 8 |
| **Board at 1280×720**: add_sub_fact_family | 8 | 9 | **7** | 8 |
| Quiz dots, dark | **7** | 9 | 8 | 8 |
| Quiz dots, light | unchanged, not graded | | | |

## 7. Required fixes

### R1. Board at heights ≤ 760 px: lift the 46vh visual cap on the board

- **Defect:** at 1280×720 the question is cut inside a nested scroll box for 6 sample skills, while the fit reports that it fits.
- **Evidence:** `cr2/clip720.txt`, and `cr2/shots/1280x720-add_word_problems.png` and `cr2/shots/1280x720-long_div_2digit.png`.
- **Fix:**
  - **CSS** (additive, `css/play-teacher.css`): add `body.teacher-mode.tv-bigboard #gameView .visual-aid, body.teacher-mode.tv-bigboard #gameView #visualAid { max-height: none; overflow: visible; }`. This mirrors the student rule at play-compact.css:195.
    - Also check the 38vh `!important` SVG cap in the same media query, so the board does not shrink drawings.
  - **fitBoard:** make `fits()` also fail when any scroll container inside `#questionPaper` overflows by more than a few px. The 3–11 px padding remainders seen at 1366 show the tolerance it needs.
  - **Check:** add 1280×720 to the `--bigboard` sizes, and count nested clipping in the sweep, so this cannot come back.

### R2. add_sub_fact_family at 1280×720: still scrolls 34 px at zoom 1 on the rail

- Once R1 is in, re-measure.
- If it still scrolls:
  - Either get an owner ruling that the board alone may fit down to about 0.95 (a projected board stays larger than the pupil card),
  - or shorten the fact family's drawing height on the board.

### R3. Dark answered dot

- **Defect:** 3.10:1.
- **Fix** (additive, `css/quiz-mode.css`): `html.dark .qt-q-dot.answered { color: #34D399 }`, which gives 6.08:1 on the composited #163e40. Or #6EE7B7, which gives 7.67:1.
- Also mark current + answered in both modes, for example with a 2–3 px `--accent-purple` outline or border on `.qt-q-dot.current.answered`, so the current question stays visible.

## 8. Follow-ups (not blocking)

- **Rail flip on reveal:** reserve the answer's space when choosing the layout (§3).
- **Light-mode quiz dot palette** is below 4.5:1 on plain, answered and flagged dots (§5). It needs an owner or palette decision.
- **Number lines on the board:** `.mq-nl-scroll` and `.mq-nlp-scroll` keep a sideways inner scroll at zoom 1.6.
  - nl_add: 188 px at 1366.
  - integer_nl_drag: 228 px at all sizes.
  - The part each question needs is visible, but the fit should take it into account once R1's nested check exists.

## Probes and outputs

All under `/tmp/claude-0/-home-user-MathQuest/4e2682a4-988c-5e1a-82ad-51f8a66da3e0/scratchpad/cr2/`:
- Scripts: `probe.cjs`, `probe-clip.cjs`, `probe-grow.cjs`, `probe-dot.cjs`
- Outputs: `sweep.txt`, `sweep-base.txt`, `slots.txt`, `probe.txt`, `dyn.txt`, `clip720.txt`, `clip768.txt`
- Screenshots: `shots/`, `dyn/`, `sweep/`, `dot-*.png`, `basedot/`
