# Metrics — the S8 baseline (before Wave 0) and how we measure from Wave 0 on

Owner: Wave 0 lane B, step S8 (`design/IMPROVEMENT_PLAN.md` §1.4 S8, §1.6.7, §4.4 "How we will know").
Measured 2026-10-23 on tree `77e3225` (branch `claude/sweet-newton-c8wrv1-wip-wave0-process`).

Every number below says where it came from. Most of them are printed by one read-only helper:

```bash
python3 design/status/tally-src/metrics.py      # run from the repo root; writes nothing
```

It prints the class ranking (§1), the machine shares, the top classes with no gate and the
rounds-to-PASS table (§2) from `defect-findings.csv`, `defect-reports.csv` and `defect-classes.md`.
A few lane outcomes come from STATUS or git, not from a report; the helper holds them in its `LANES`
list with a note, so they are written down once.

**Git history.** The working clone is shallow (`git rev-parse --is-shallow-repository` → `true`, 69
commits). History numbers come from a full clone:
`git clone --no-single-branch https://github.com/timjmills/MathQuest <dir>` (2,148 commits, 68 remote
branches). Below, `<full clone>` means that directory.

---

## 1. Defect tally — class ranking

**Source.** `design/status/defect-findings.csv` (7,878 findings over 219 report rounds, from 217 report rows),
built by `design/status/tally-src/merge.py` from the seven readers' raw files (`tally-src/findings-G1..G7.csv`,
`reports-G1..G7.csv`). Groups G1–G6 read the narrative critic reports (2,046 findings). G7 read the structured
grade runs, `design/audit/runs/<run>/grades.jsonl` (5,832 findings). Classes and gates are from
`design/status/defect-classes.md`. Re-running `merge.py` in a copy of the tree gives byte-identical CSVs
(checked 2026-10-23).

**Reconciliation rules applied by merge.py** (printed by the script when it runs):

| Rule | Effect |
|---|---|
| TAG_LINK remap: in WRM-tagging reports, a PEDAGOGY / MISSING / OTHER / UNTRUE_TEXT finding that cites WRM-rule-3, -10, -14, -15, -18 or -19, or (except UNTRUE_TEXT) names a pre / related / building-block link, becomes TAG_LINK | 246 rows moved: PEDAGOGY → TAG_LINK 128, UNTRUE_TEXT → TAG_LINK 71, MISSING → TAG_LINK 35, OTHER → TAG_LINK 12 |
| wave1-E round 1: the superseded first grade (Sonnet, ids 1–6) is dropped; the Opus re-grade that replaced it (D1–D5) is kept | 6 rows dropped |
| `OPTIONS-CRITIC-R2.md` is counted as its 24 numbered fixes, not its ≈ 900 per-skill lines | 24 rows |
| G7 (grade runs) counts a defect once per skill × defect text in a run, not once per graded version | applied by the G7 reader |
| A defect a later report lists again as open is counted again, `carried=yes`; fixed items are not counted; nits are `severity=minor` | `defect-classes.md` "How a finding is counted" |

### 1.1 Every class

Sorted by blocking count. "Rounds" = distinct (report, round) pairs the class appears in (spread). Narrative =
critic reports (G1–G6); Grade runs = `grades.jsonl` (G7).

| Class | Kind | Total | Blocking | Narrative | Grade runs | Rounds | Gate today |
|---|---|--:|--:|--:|--:|--:|---|
| SPACE | machine | 1273 | 1067 | 72 | 1201 | 64 | `ws-print-lint` L-DENSITY (H13, PAGEFILL), L-SPLIT; lone item none (S2) |
| MISSING | machine | 524 | 402 | 73 | 451 | 62 | `ws-coverage-matrix` (E1), `ws-options-verify` |
| SIZE | machine | 616 | 377 | 25 | 591 | 48 | none (S2 builds L1) |
| PEDAGOGY | judgment | 569 | 355 | 77 | 492 | 64 | — (critic) |
| SLOT | machine | 441 | 307 | 16 | 425 | 37 | `ws-print-lint` L-ANSAREA |
| CLIP_OVERLAP | machine | 390 | 302 | 68 | 322 | 66 | `ws-print-lint` L-OVERFLOW, L-SIZE |
| UNTRUE_TEXT | machine | 512 | 296 | 512 | 0 | 100 | TITLEREP / RANGECHECK (WRM tagging only); none in general |
| SCREEN_PARITY | machine | 331 | 282 | 11 | 320 | 23 | `ws-screen-slots`, `ws-screen-answer` |
| INK_FONT | machine | 279 | 218 | 49 | 230 | 43 | `ws-print-lint` L-INK, L-FONT, L-EMOJI; `ws-ink-unit` |
| VISUAL_DESIGN | judgment | 344 | 202 | 50 | 294 | 55 | — (critic) |
| TAG_LINK | machine | 246 | 197 | 246 | 0 | 52 | linkfit / lessonfit (WRM tagging lane only) |
| INSTRUCTION | machine | 322 | 194 | 68 | 254 | 60 | none (S2 builds L6) |
| NAME_CONTENT | machine | 235 | 191 | 59 | 176 | 60 | `ws-content-audit` (≈ 310 skills), `ws-options-verify` |
| KEY | machine | 210 | 158 | 42 | 168 | 46 | `ws-print-lint` L-KEY (subset) |
| VIEWPORT | machine | 207 | 148 | 79 | 128 | 59 | `ws-chromebook-fit`, `ws-screen-slots` (partly) |
| CLARITY | judgment | 242 | 143 | 55 | 187 | 47 | — (critic) |
| GIVEAWAY | machine | 178 | 131 | 25 | 153 | 44 | none (S2 builds L3) |
| REPEAT | machine | 222 | 118 | 53 | 169 | 56 | none (S2 builds it) |
| PATTERN | machine | 167 | 90 | 15 | 152 | 34 | none (S2 builds L10) |
| INTERACTION | machine | 179 | 80 | 128 | 51 | 61 | `ws-boot-smoke`, per-lane probes |
| PROCESS | process | 188 | 68 | 188 | 0 | 107 | the precritic table (S1) |
| PLAIN_WORDS | machine | 52 | 29 | 36 | 16 | 22 | `ws-plain-words` |
| NOTATION | machine | 57 | 22 | 15 | 42 | 24 | none (S2 builds it) |
| SEARCH | machine | 45 | 15 | 45 | 0 | 10 | `ws-search-terms` |
| STEPS_LAYOUT | machine | 20 | 8 | 10 | 10 | 12 | none |
| OTHER | judgment | 29 | 5 | 29 | 0 | 25 | — |
| **All** | | **7878** | **5405** | **2046** | **5832** | **219** | |

### 1.2 Machine-measurable share

Counted by the helper from the `kind` of each finding's class.

| Set | Findings | Machine | Share |
|---|--:|--:|--:|
| All findings | 7,878 | 6,506 | **82.6 %** |
| Narrative critic reports only (G1–G6) | 2,046 | 1,647 | **80.5 %** |
| Blocking findings, all | 5,405 | 4,632 | 85.7 % |
| Blocking findings, narrative reports only | 1,000 | 852 | 85.2 % |

So about four in five things a critic has found could have been found by a machine. The rest is judgment
(PEDAGOGY, CLARITY, VISUAL_DESIGN, OTHER: 1,184) and process (PROCESS: 188).

### 1.3 Rankings

**By blocking count:** SPACE 1,067 · MISSING 402 · SIZE 377 · PEDAGOGY 355 · SLOT 307 · CLIP_OVERLAP 302 ·
UNTRUE_TEXT 296 · SCREEN_PARITY 282.

**By spread (report rounds it appears in, of 219):** PROCESS 107 · UNTRUE_TEXT 100 · CLIP_OVERLAP 66 · SPACE 64 ·
PEDAGOGY 64 · MISSING 62 · INTERACTION 61 · INSTRUCTION 60 · NAME_CONTENT 60 · VIEWPORT 59.

The two rankings differ because the grade runs (G7) count many skills per run, so page-layout classes (SPACE,
SIZE, SLOT, SCREEN_PARITY) pile up there. The narrative reports are led by UNTRUE_TEXT (512), TAG_LINK (246),
PROCESS (188) and INTERACTION (128): text that the code does not bear out, and builder reports that were wrong.

### 1.4 Top 8 machine classes with NO gate today — lane W0-A builds these first

Machine classes whose gate in `defect-classes.md` is "none", or exists only inside one lane. Ordered by blocking
count, then spread.

| # | Class | Blocking | Total | Rounds | Gate today |
|--:|---|--:|--:|--:|---|
| 1 | SIZE | 377 | 616 | 48 | none (S2 builds L1) |
| 2 | UNTRUE_TEXT | 296 | 512 | 100 | WRM tagging only; none in general |
| 3 | TAG_LINK | 197 | 246 | 52 | linkfit / lessonfit, inside the WRM tagging lane only |
| 4 | INSTRUCTION | 194 | 322 | 60 | none (S2 builds L6) |
| 5 | GIVEAWAY | 131 | 178 | 44 | none (S2 builds L3) |
| 6 | REPEAT | 118 | 222 | 56 | none |
| 7 | PATTERN | 90 | 167 | 34 | none (S2 builds L10) |
| 8 | NOTATION | 22 | 57 | 24 | none |

Next after these: STEPS_LAYOUT (8 blocking, 12 rounds, no gate). TAG_LINK is listed because its gate lives
only in the tagging lane's own scripts; if the lead counts that as covered, STEPS_LAYOUT takes eighth place.
Classes with a partial gate (SPACE's lone item, KEY's subset, NAME_CONTENT beyond ≈ 310 skills) are not
in this list but still leak: they lead the blocking ranking.

---

## 2. Rounds to PASS per lane (before Wave 0)

**Source.** `defect-reports.csv` verdicts, grouped into lanes by the helper's `LANES` list. "Rounds" for a PASS
lane = the critic round that gave the PASS the lane kept. For a lane that did not pass = the last round graded.
Where a report is missing, the outcome comes from STATUS or git, as noted.

| Lane | Rounds | Outcome | Note |
|---|--:|---|---|
| WRM tagging MAP | 5 | PASS | |
| WRM tagging R + Y1 | 12 | PASS | |
| WRM tagging Y2-Y3 | 15 | PASS | |
| WRM tagging Y4 | 13 | PASS | round 1 has no report |
| WRM tagging Y5 | 8 | PASS | r3 PASS under old rules 1-13; re-graded under rules 1-19; final PASS r8 |
| WRM tagging Y6 | 5 | PASS | r3 PASS under old rules; re-graded; final PASS r5 |
| WRM Y1 site lessons | 3 | PASS | |
| WRM Y6 site lessons | 2 | PASS | |
| WRM Y4 site lessons | 4 | not passed | owner accepted r4 7.96 after the F6 fix (STATUS 2026-10-17) |
| White Rose page | 8 | not passed | r10 merged by the owner without critic r9 (STATUS) |
| Lesson planner V21 / V22 | 7 | PASS | |
| Detailed lesson 1 (g2-nbt3) | 4 | PASS | |
| Detailed lesson 2 (g1-oa1) | 4 | PASS | |
| Detailed lesson 3a (g3-oa5) | 3 | PASS | |
| Detailed lesson 4 (g3-oa9 table patterns) | 3 | PASS | |
| Detailed lesson 5 (g3-oa9 input-output) | 3 | PASS | |
| Lessons engine (grade runs lessons-r1..r4) | 4 | PASS | 48/48 pages at seed 4242 |
| Number line 5.2 | 8 | PASS | r9 PASS too |
| Small fixes | 7 | PASS | item 8 went on as rounds 8-11 after the merge (r10 PASS, r11 FAIL; git) |
| Answer-key options 4.4 | 5 | PASS | |
| Search terms | 6 | PASS | |
| Touch numerals | 6 | PASS | |
| Skip-count | 4 | not passed | r5 merged by the owner without critic r5 (STATUS) |
| Steps box | 3 | PASS | |
| Chromebook fit | 3 | PASS | |
| div_facts forms | 4 | PASS | |
| Count-by arrows + Lines | 2 | PASS | |
| Long-division hug | 2 | PASS | |
| Number families order | 1 | PASS | |
| Landing (many skills) | 1 | PASS | |
| Place value phones | 3 | PASS | |
| Next-box pulse | 3 | PASS | re-opened for auto-select r4-r6, PASS again r6 |
| Wave 1 lane A | 2 | PASS | |
| Wave 1 lane A fix (Start buttons) | 2 | PASS | |
| Wave 1 lane A2 | 5 | PASS | r1 PASS, re-opened r2-r4, final PASS r5 |
| Wave 1 lane A3 | 2 | PASS | |
| Wave 1 lane C | 5 | PASS | |
| Wave 1 lane C2 | 8 | PASS | |
| Wave 1 lane E | 2 | PASS | |
| Lane D print backlog | 8 | not passed, paused | git: "Lane D critic round 8 report (FAIL ...)"; no report in the tally |
| Fraction key | 8 | not passed, paused | STATUS: critic r8 FAIL; reports not in the tally |
| Teacher screens audit | 2 | not passed | |
| Option panels | 3 | not passed | options-panel r2, options-r3 |
| Anchors (grade runs) | 3 | not passed, paused | |
| Place value (grade runs) | 3 | not passed, paused | |
| Figures (grade runs) | 8 | not passed, paused | r1-r6 have no report |
| Error analysis (grade run) | 5 | not passed | r1-r4 have no report |
| K-2 (grade runs) | 3 | not passed, paused | r1 has no report |
| Geometry (grade runs) | 2 | not passed, paused | |
| Fractions (grade run) | 1 | not passed, paused | |
| Guided (grade run) | 1 | not passed | |

**Result.** 36 lanes passed. Rounds to PASS: **median 4**, quartiles 2.25–6, **range 1–15**, mean 4.8.
15 lanes or runs never passed (paused, owner-merged, or superseded).

**Against §1.1** (median ≈ 5, range 2–15): the range matches. The median here is 4, one lower, because this
count includes small one-screen lanes (landing, number families order: 1 round each) and UI fix lanes. The
skill, page and tagging lanes alone (WRM tagging, White Rose page, lessons, number line, skip-count, Wave 1 C /
C2, small fixes) sit at 5–15. The 15 lanes that never passed are not in the median; counting them as "at least
their last round" would raise it. The baseline we compare against is **median 4–5, range 1–15**.

---

## 3. Hours

The reports' git add dates are useless: every report was bulk-imported in `fbcc9bb` on 2026-10-17 (column
`date_added` of `defect-reports.csv`). Round timing comes from commit messages instead:

```bash
git -C <full clone> log --all --format='%aI %s'      # then match "critic r<n>" / "round <n>" / "PASS" per lane
```

**Elapsed hours = first lane commit → the commit that records the PASS.** "Median gap" = median time between
the lane's "critic round / critic r<n>" commits (gaps over 3 days dropped as pauses). Times are author dates.

| Lane | First commit → PASS commit | Elapsed h | Critic rounds | Median gap between rounds (h) |
|---|---|--:|--:|--:|
| Wave 1 lane A | 10-02 12:40 → 10-02 15:18 | 2.6 | 3 | — |
| Wave 1 lane A2 | 10-02 17:34 → 10-02 21:44 (merge) | 4.2 | 5 | — |
| Wave 1 lane A3 | 10-03 06:14 → 10-03 08:24 | 2.2 | 2 | — |
| Wave 1 lane C | 10-02 11:49 → 10-02 16:39 | 4.8 | 5 | — |
| Wave 1 lane C2 | 10-02 17:53 → 10-03 03:21 | 9.5 | 8 | — |
| div_facts forms | 10-09 02:52 → 10-09 09:05 | 6.2 | 4 | 1.6 |
| Chromebook fit | 10-09 09:58 → 10-09 13:00 | 3.0 | 3 | 0.8 |
| Search terms | 10-09 02:02 (critic r1; build start not in git) → 10-09 21:18 | ≥ 19.3 | 6 | 2.8 |
| MAP audit | 10-10 09:17 → 10-10 10:31 | 1.2 | 5 | 0.2 |
| WRM tagging R + Y1 | 10-10 09:18 → 10-10 13:51 | 4.6 | 12 | 0.3 |
| WRM tagging Y4 | 10-10 10:00 → 10-10 13:31 | 3.5 | 13 | 0.2 |
| WRM tagging Y2-Y3 | 10-10 09:26 → 10-17 00:12 | 158 calendar, ≈ 12 active | 15 | 0.3 |
| WRM tagging Y5 | 10-10 09:21 → 10-16 21:11 | 156 calendar, ≈ 9 active | 8 | 0.2 |
| WRM tagging Y6 | 10-10 09:20 → 10-16 17:43 | 152 calendar, ≈ 6 active | 5 | 0.2 |
| WRM Y6 site lessons | 10-17 00:46 → 10-17 01:43 | 1.0 | 2 | — |
| Lesson planner V21 | 10-16 17:56 → 10-16 19:52 | 1.9 | 7 | 0.1 |
| Detailed lessons 1-5 (one helper) | 10-16 18:51 → 10-17 03:25 (all five PASS) | 8.6 | 3-4 each | — |
| Answer-key options 4.4 | 10-03 07:38 → 10-10 10:48 | 171 calendar | 5 | 6.4 |
| Touch numerals | 10-03 05:36 → 10-10 07:03 | 169 calendar | 6 | — |
| Small fixes | 10-09 20:47 → 10-16 20:05 | 167 calendar | 7 | 1.1 |
| Number line 5.2 | 10-03 08:10 → 10-16 19:34 (r8 PASS) | 323 calendar | 8 | 6.8 |

"Active" = calendar minus the owner pause 10-10 ≈ 14:20 → 10-16 16:50 (≈ 146 h). The other calendar rows span
owner pauses too (09-27 → 10-02, 10-05 → 10-09, 10-10 → 10-16): commits fall on only 12 days between 09-24 and
10-17 (`git log --all --since=2026-09-23 --until=2026-10-18 --format=%aI | cut -c1-10 | sort -u`).

**Result.** Over the 17 lanes where an elapsed time without a pause can be read, **first commit → PASS has a
median of ≈ 4.6 h (range 1.0–19 h)**. The median gap between critic rounds, over the 19 lanes with two or more
round commits, is **≈ 1.0 h** (range 0.1–6.8 h).

**Where timestamps are missing or weak:**
- The grade-run families (pv, geometry, figures, K-2, fractions, anchors, error analysis, guided) have one
  commit per grade file; their build rounds are "AP2 round n" / "WIP" commits that do not name the lane
  reliably, so no elapsed time is given.
- WRM tagging rounds are often 10–20 minutes apart. The commits look checkpointed in bursts (a helper
  committing several finished rounds at once), so these short gaps are a lower bound on real round time.
- Search terms: the first commit is the critic r1 commit; when the build started is not in git.
- Wave 1 lane E, steps box, landing, number families order, long-division hug, place value phones: one or two
  matching commits only; no elapsed time.
- Lane-match regexes and outputs: the helper used for this table is a scratch script (git log + regex per lane);
  the commit times above are copied from its output and can be re-read with the `git log` command above.

---

## 4. Skills passed per lane-week before Wave 0

**Counting rule.** A skill counts when a critic gave PASS (≥ 8 on every criterion graded) on its pages and the
work was merged. A UI, search, tagging, key-colour or lesson-maker lane passes no skill. A grade-run family that
did not pass counts only the skills its own SUMMARY lists as passing, and only in the upper bound (those passes
were role-scoped and never merged as a certified family).

| Source | Skills | Lower | Upper |
|---|---|--:|--:|
| Wave 1 lane C (PASS r5, merged 10-02) + C2 (r8) + count-by arrows (r2) | `count_by_tables`, number grid | 2 | 2 |
| div_facts forms (PASS r4, merged 10-09) | `division:div_facts` | 1 | 1 |
| Long-division hug (PASS r2, merged 10-10) | long division | 1 | 1 |
| Number families order (PASS r1) | number families | 1 | 1 |
| anchor-r2 / r3 (role: anchor only) | `time_5min`, `mult_facts` (`count_by_tables` already counted) | 0 | 2 |
| figures-r8 SUMMARY "4/10 skills pass" | 4 figure skills | 0 | 4 |
| ea-r5 SUMMARY "3/27 skills pass" | 3 error-analysis skills | 0 | 3 |
| Skip-count (owner-merged, no critic PASS) | — | 0 | 0 |
| **Total** | | **5** | **14** |

Not skills, but passed in the same period: 5 detailed lessons, the lesson planner, 48/48 lesson-engine pages,
6 WRM tagging years, 3 years of site lessons, the MAP audit.

**Lane-weeks.** Active period 2026-09-24 → 2026-10-17 (3.4 calendar weeks; 12 commit days).

| Count | Value | Command |
|---|--:|---|
| Lower: branch-days with a commit ÷ 7 | 113 / 7 ≈ **16** | `git -C <full clone> log --all --source --no-merges --since=2026-09-23 --until=2026-10-18 --format='%S %aI'`, distinct (branch, day), main / master / sweet-newton / gh-pages excluded |
| Middle: lanes running at once × calendar weeks | ≈ 7–9 lanes (STATUS §3 lists 9 at the 09-26 pause; Wave 1 ran 6–8; Wave 2 four to six helpers) × 3.4 ≈ **25** | STATUS §3, §11 |
| Upper: distinct (branch, ISO week) | **81** (weeks 39-42: 10 + 26 + 22 + 23) | same git command, grouped by ISO week |

**Result: ≈ 0.2 skills passed per lane-week** (5 skills / 25 lane-weeks), with an uncertainty range of
**0.06–0.9** (5 / 81 to 14 / 16).

**Data-instance reference point.** Presets: **114 named skills in two builder runs** (STATUS 2026-10-17: batch
1 = 14, batch 2 = 100 more, "114 in all"; deployed 60c4fa53; IMPROVEMENT_PLAN §1.1 row "Presets"). Once the
drawing exists, a new skill is data. The §1.6.7 target is ≥ 5× the lane-week rate above, i.e. ≥ 1 skill per
lane-week as the floor; a family made as data on a certified drawing should be far above it.

---

## 5. Other baselines

### 5.1 Escalations (STATUS archive §9, plus git)

| Move | Count | Lanes (critic rounds failed before the move) |
|---|--:|---|
| Sonnet medium → Opus low | 1 | Wave 1 lane C (4) |
| Opus low → Opus medium (the ceiling) | 13 | C2 (7), number line (4), touch numerals (4), answer-key options (3), search terms (5), White Rose page (4), WRM Y2-Y3 (11), WRM Y1 site lessons (2), small fixes item 7 (5), skip-count (4), detailed lesson 1 (3), detailed lesson 2 (2), detailed lesson 4 (1) |
| Further rounds already at the ceiling (recorded) | 7 | White Rose page r6, r7, r8, r9; WRM Y2-Y3 r13, r14, r15 |
| In git, not in §9 | 2 | "Record Lane D round 7 escalation ... to Opus medium" (10-09); "Small fixes item 8, round 5 (escalated to Opus medium)" (10-17) |

Rounds failed before an escalation: **median 4** (range 1–11), over the 14 recorded moves. After moving to the
ceiling, 11 of 13 lanes passed (most within 1–3 more rounds); White Rose page and skip-count ended owner-merged
without a final PASS; Y2-Y3 needed 4 more rounds at the ceiling.

### 5.2 Quoted from the plan (not re-measured here)

| Baseline | Value | Source |
|---|---|---|
| Deploy gates, one after another | **≈ 80 min** (screen-slots 22, chromebook-fit 17.4, teacher-wrm 12 + 12 = 80 % of it) | IMPROVEMENT_PLAN §1.1 — quoted |
| Print-lint standing red | **458 findings / 33 documents** (accepted ≤ 461/33) | §1.1 and STATUS 2026-10-17 deploy line "print-lint 458/33" — quoted |
| Builder brief | **≈ 740 KB ≈ 185 k tokens** (`wc -c` on 2026-10-23) | §1.1 — quoted |

### 5.3 Merge conflicts (re-measured)

```bash
node tests/scripts/ws-status-index.mjs --conflicts --since 2026-09-23 --root <full clone>
```

Result on 2026-10-23 (matches the S6 builder's run): **288 merges re-run, 96 conflicted** — STATUS.md 17,
index.html 4, `design/status/*` 0 (any of these three: 20); 76 conflicted only on other files. Tool line:
`ws-status-index: OK`.

---

## 6. WRM baseline (§4.2)

```bash
node tests/scripts/ws-wrm.cjs --report-only
```

Run 2026-10-23. It rewrote `design/WRM_COVERAGE.md` byte-identically (`git status --short` showed no change).

| Measure | Value |
|---|---|
| Years / blocks / small steps | 7 / 97 / 872 |
| Skills tagged | 392 |
| Proposals (build list) | 162 |
| Covered (full) | **513 / 872 (59 %)** |
| Partial only | 149 |
| Gap | 210 |
| Not fully covered | 359 |
| By year | R 49 % · Y1 62 % · Y2 65 % · Y3 58 % · Y4 63 % · Y5 60 % · Y6 55 % |

These counts are added to this file at every deploy (one dated row in §7.3), so coverage growth is measured
against this row.

---

## 7. Measurement from Wave 0 on

### 7.1 The per-lane table (the lead fills one row after every template / critic round)

| Date | Lane | Template / family | Builder profile | Round | Verdict | Rounds to PASS | Hours (first commit → PASS) | Findings by class (critic tags, RUBRIC §6) | Skills passed | Lane-weeks |
|---|---|---|---|--:|---|--:|--:|---|--:|--:|
| | | | | | | | | | | |

- **Builder profile** is the profile **name** (`mq-opus-low` / `mq-opus-medium`): an agent cannot see its own effort.
- **Findings by class** come from the critic's class tags (`design/audit/RUBRIC.md` §6): one count per class, e.g.
  `SPACE 2, GIVEAWAY 1`.
- **Hours** from the lane's commits (`git log --format='%aI %s'`), first lane commit to the PASS commit; give
  calendar hours and say if the lane was paused.
- **Lane-weeks**: weeks the lane was open (building or waiting for a critic).

### 7.2 Targets

| Measure | Before Wave 0 (this file) | Target | Source |
|---|---|---|---|
| Rounds to PASS | median 4–5, range 1–15 | **2** | §1.4 "Expected effect" |
| Deploy gates | ≈ 80 min | **≤ 30 min** | §1.4, §4.4 |
| Builder brief | ≈ 185 k tokens | **≈ 10 k tokens** (spec card, S3) | §1.4 |
| Skills passed per lane-week | ≈ 0.2 (0.06–0.9) | **≥ 5×** | §1.6.7 |
| First E3 family (made as data on an approved drawing) | — | **≤ 2 rounds and one builder run**; if not, the next audit says why and the plan changes before the next family | §4.4 |
| Shared-file merge conflicts (S6) | 20 of 288 merges on STATUS / index.html | 0 | §1.4 S6 |
| Six lanes for a week with no shared-file conflict (E5) | not yet met | met | §1.6 E5 |

### 7.3 Rules

1. **A rising measurable class becomes the next machine check.** After each round, compare each machine class's
   count with its count in earlier Wave 0 rounds. A class that rises (or appears in two lanes) gets a check in S2,
   proved by a **backtest**: it FAILS on the state the critic failed and PASSES on the fix (§1.4 S2).
2. **Appending critic findings to the tally.** Add a new group file pair in `design/status/tally-src/`
   (`findings-G8.csv`, `reports-G8.csv`, then G9 …) with the same columns as the existing ones
   (findings: `report,run,round,defect_id,class,kind,carried,severity,rule_ids,family,template,summary`;
   reports: `report,run,lane,round,date_added,commit_added,verdict,min_score,mean_score,n_open,notes`). Use only
   classes from `defect-classes.md` (a new class is added there first). Then, from the repo root:
   `python3 design/status/tally-src/merge.py` (rewrites the three CSVs) and
   `python3 design/status/tally-src/metrics.py` (prints the new ranking). The raw group files are never edited.
3. **S6 measure:** `node tests/scripts/ws-status-index.mjs --conflicts --since <Wave 0 start commit or date>` on a
   full clone; target 0 conflicts on STATUS.md, index.html and `design/status/*`.
4. **E5 measure:** the same command over one week with six lanes running; met when no merge in that week
   conflicts on a shared file.
5. **WRM row at every deploy:** re-run `node tests/scripts/ws-wrm.cjs --report-only` and add a dated row below.

| Date | Deploy commit | Covered | Partial only | Gap | Skills tagged | Proposals |
|---|---|--:|--:|--:|--:|--:|
| 2026-10-23 | baseline (77e3225) | 513 / 872 (59 %) | 149 | 210 | 392 | 162 |
