# Status and handover — paused 2026-09-26 (owner: "stop our work for now, keep track of what is done")

> **2026-10-02: the work order is now `design/MASTER_PLAN.md`** (8 waves in the owner's order; owner to confirm the order before work starts). Key answer colour changed to **reddish orange**.


> **2026-10-03, Wave 1 lane B (answer boxes, `ansBox`) round 4 — open items:**
> - **R3-D9 (subtraction family, §10.1 migration):** `subtraction:sub_across_zeros` key prints its regroup boxes EMPTY (legacy
>   key fill). The answer digits are right and inside their boxes, and regroup boxes are unscored (RM-02), so it does not block
>   lane B; but for across-zeros the regroup marks are the lesson, and one box per column cannot hold the "10" a zero becomes.
>   Fix with the family migration: emit `q.cell` stack with a regroup trace so the kit key fills it.
> - **R3-D7 exclusions (no Answer-boxes option, by design for now):** `addition:add_three` (kit template `add-three`: counters plus a
>   sentence whose box is the template's own drawing; the option needs that template to read `ansBox` - addition family);
>   `division:missing_mult_div` (the unknown can be any term - factor, divisor, dividend - so its box is a mid-expression
>   missing-number box (SL-6), not the answer place after `=` that `ansBox` governs); `subtraction:sub_check_by_adding` and
>   `division:div_check_by_multiplying` (error-analysis items: the place written is the check drawing's "correct answer" box,
>   governed by the error-analysis page, not a fact/equation/column answer). Revisit each with its family migration.
> - Legacy key sizing (R3-D2) is fixed in this round: the legacy equation slot is at least 1.15 em tall, key digits are set at
>   the slot's writing size, the fact box stands 1.5 mm below its rule, and `ws-print-lint` L-KEY (AK-2) now fails any key
>   digit whose ink is not >= 0.3 mm inside its box.

> **2026-10-02, Wave 1 lane C (count-by + number charts):** `multiplication:count_by_tables` now defaults to **fill = two**
> (the first two numbers print). **An old count-by printout reprints with TWO numbers filled, not one, so a pre-lane share code
> or saved set gives a row with one fewer blank (owner request).** A row of 15 jumps is titled "I Can count by 1 to 12 (15 jumps)";
> the tables stay 1 to 12. The whole hundreds chart fills its page (17.5 x 19.5 mm squares at the L digit size, any S/M/L) and
> stays rows of ten on a phone.

Read this first when work resumes. It records what is live, what each work lane had done when it paused, what the
independent critics last found, and the next step for each lane. Owner rulings are recorded in the design docs named
below; this file only points to them.

## 1. What is live

- **master = `2e434cd`** (deployed to math.cultivatingthedigital.org). Branch `claude/sweet-newton-c8wrv1` = same tree
  plus this handover.
- Live since the last update: the copyright line on every printed page, key and lesson page (and on every web page);
  the guided / paginator round (one spare-height rule, min-size floors, answer-free hints, Model working, Review
  sections — one section per skill); Error analysis / Find-the-mistake paused; the three sample lessons (add within 10,
  subtract 2-digit regrouping, round to nearest 10) at 48/48 critic passes.
- Deploy gates on `2e434cd`: all unit gates, content-audit, standards, codes (608), share-options, teacher
  library / preview / quiz / shell OK. `ws-screen-answer` failed once on the base10_build online worksheet in a full run
  under heavy load and passed alone and in sequence (recorded as a load flake).
- A full `ws-print-lint --source kit` over every skill (never a deploy gate before): 33 of 191 documents fail, 463
  findings — mostly legacy operations and a few K-2 / fraction skills. List by lane in `design/audit/BACKLOG.md`.

## 2. Owner rulings this cycle (where they are written)

| Ruling | Recorded in |
|---|---|
| Lessons one size; Practice / Mixed honour S/M/L, an item that can't shrink keeps its size | `LESSON_LIBRARY_PLAN.md` §8a |
| Every lesson opens with a 3–4 question prerequisite check that routes a struggling pupil to the prerequisite lesson | §8b |
| Stand-alone page types merge into the lesson designs | §8c |
| Find-the-mistake paused for all future worksheets (may return later) | §8d, `LESSONS_VISION.md` "Later" |
| Three papers: Practice, Quiz, Lesson. Thinking pages paused. Fact rows/probes are column options. Word problems are skills. Lesson parts all required, teacher ticks parts to print and refreshes any part with new numbers. Per-skill weights (equal by default in mixed review). "Mix in prerequisite skills" lists all, none ticked. | §8e |
| Practice worked example: one example on top of each block only | §8f |
| Quiz by CCSS domain / standard / EE / WRM / lesson, tagged questions, custom scoring, same Practice engine; six-tile home; thumbnails 3 across + list view everywhere | `design/TEACHER_SCREENS.md` |
| Copyright "© <year> Cultivating the Digital. All rights reserved." on every print and web page | `WORKSHEET_DESIGN_STANDARD.md` §8.5, `PAGE_TYPES.md` PT-FRM-7a |
| Retire the I Can look; Daily look everywhere, single-skill pages keep an I Can line | `PAGE_TYPES.md` (on the teacher-UI lane branch) |
| Rounding: plain rounding with a written answer, and one number rounded to 2+ places | met (critic pv-r3) |
| Per-part "New numbers" for the built lessons; per-section refresh noted as a later option | `LESSON_LIBRARY_PLAN.md` §8e |
| **2026-09-27, recorded, not built:** answers on every printed key are reddish orange (owner 2026-10-02; was red) (rest of the key and the pupil page stay B&W) | `WORKSHEET_DESIGN_STANDARD.md` INK-31, `PAGE_TYPES.md` PT-KEY-1a |
| **2026-09-27, recorded, not built:** skill selection always opens a gallery (Big 3 / Medium 4 / Small 5 across, search, grade, domain, topic); the set auto-saves in the browser until deleted; a Sets area lists all sets for any paper; lessons have their own picker; several skills can be selected in one go in thumbnail or list view | `design/TEACHER_SCREENS.md` "Selecting skills" |

Open questions for the owner: (1) "Practice map" tile — the UI lane wired it to the existing MAP tests screen; confirm
or say what it should open. (2) money_count defaults to "all the same coin", so its worked example can't show two kinds
of coin unless the teacher changes it — keep the default?

## 3. Work lanes at pause (not merged, not deployed)

Each lane is a git worktree at `.claude/worktrees/agent-<id>` on branch `worktree-agent-<id>`; every tree was clean
(WIP-committed) at pause. **These branches exist only in this container** unless pushed — see §6.

| Lane | Branch head | Done | Next |
|---|---|---|---|
| Lessons engine (a77a1a3e) | `ea22a97` WIP | Round 5 + `LESSON_RULES.md` + `ws-lesson-check`; Phase 0 steps 1–9 (library lessons, `sheet/lesson-pages/*`, `prerequisiteSkillsFor`, seed / coverage / build-list tools, browser lock); per-part seeds (`lessonPartSeed`, `req.lessonSeeds`); Prerequisite Check (4 questions, teacher tags, routing table on the key; replaces Warm-up; 11 missing prerequisite lessons recorded) | Fix 1 seed failure (refreshed add chart repeats a Practice fact 4 + 3), rerun 25-seed gate, re-stamp + re-render samples, critic lessons-r5; then tell UI lane parts + New numbers are ready; then anchor-chart cell overflows (16, `ws-anchor-steps`) and near-empty Mixed pages; then Phase 1 archetype pilots |
| Teacher UI / papers (aadfac31) | `c9fd46d` done | Daily look (`ef45aac`); three papers + `sheet/papers.js` + per-skill weights (also on screen) + prerequisite mix (`prerequisite-skills.js`); Quiz paper (build by CCSS/EE/WRM/lesson, scoring, key summary with standard subtotals); six-tile home, shared search `teacher-find.js`, thumbnails 3/2/1 | Critic teacher-r1 (was started, nothing graded — restart from scratch); allocate a codec-registry range for Quiz source/scoring in share codes; per-part New numbers once lessons lane lands |
| Worked examples / anchors (a8143d27) | `8efc257` done | anchor-r2 fixes (per-template ease + real move, choice items never examples, one-state facts, function-table footprint, page filling, generator fixes, add_fractions answer shape) | Fix the partial anchor-r3 findings (§4), finish grading r3 (seed b, Mixed set, lint) or run r4 |
| Place value / rounding (a0588074) | `8d968fa` WIP | Merged 2e434cd; pv-r3 fixes coded (cell sizing, per-page balance, models, screen expand / disks / supports, quiz no longer prints the answer, wording, ladder parser) — only `ws-pv-deal` run | Re-render S/L + pixel scan; guided pages still 37–55 % empty and 2 pages for disks / build / number line; gates; critic pv-r4. Entry 5 vis_pv_exchange on hold |
| Figures / data (a5485dd3) | `fb2c296` WIP | figures-r8 fixes A (kind dealt per item, check-box section), B (no repeats), C (S floors), D (card targets 45 px), G, F; gates green on merged tree | Screenshot the worksheet graph row fix, rerun gates once, report → critic figures-r9 |
| Geometry (a7a96a9d) | `032a27d` WIP | Merged sweet-newton + geometry-r2 grades; guided Steps on page 1 only; perimeter / area 8 at S, 6 at L; aligned answer boxes | Apply `design/audit/runs/geometry-r2/pending-p60.py` (volume solid beside answers); area_perimeter + perimeter_intro S; coord / fill / compose footprints; fixes 3–6 (screen, labels, dealing, panels); gates; delete committed `tests/scripts/tmp-*.cjs/mjs`; critic geometry-r3 |
| K-2 (a19dcb87) | `99eca66` WIP | k2-r3 fixes (screen digits 56/48/40 px, targets ≥ 44, sort at 390, mixed spill, count_sequence test, make_ten "Drawn as"); lint list: parity + frac-wall cells | mixed_composing S 32 % band; mixed-pool test pages one column (shared layout); gates; critic k2-r4 |
| Operations (a507ccc1) | `1ce8868` WIP | Step 1 backlog; build-list entries count_through_zero, share_and_group_early, add_sub_patterns, long_multiplication (+ short division) — ready for a critic; lint list partly moved to kit cells | Re-gate the 5 moved skills; rest of the lint list (AK-4 legacy slots, fonts, mixed density); shared layout PAGEFILL (2-column pages can't stretch rows); entry 5 add_next_10; critic ops-r1 on the 4 entries |
| Fractions (ac31945a) | `af4963f` WIP | 4 files of fractions-r1 fixes started (never resumed after the restarts) | Resume fractions-r1 fixes (62/242 at r1) + lint list (fraction_number_line, whole_as_fraction) |

## 4. Critic results (grades in `design/audit/runs/<run>/grades.jsonl`)

| Run | Tree | Result | Top open defects |
|---|---|---|---|
| lessons-r4 | f7ead37 | 48/48 at seed 4242 | seed-proofing (now covered by `ws-lesson-check`) |
| figures-r8 | a01d539 | 75/120 (r7 66); in scope 74/100; 4/10 skills pass | kind per page (fixed on lane), repeats, S shrinking, build_pictograph card |
| geometry-r2 | edbc048 | 84/220 comparable (r1 47); 106/300; panels 7/20 | guided page geometry, footprints (too few items, empty bands at S), transform screens at 390, label clustering, dealing |
| pv-r3 | 0dfed8e | 72/123 (r2 31/155); 0/13 skills; panels 1/13; both owner rounding requests met | cell sizing at S / Plain / guided, per-page balance, guided models, expand screen, quiz prints answer |
| anchor-r2 | 162bb13 | 20/90 (r1 0/44); count_by_tables and time_5min pass | example choice, state merge, function-table overlap, page filling (fixed on lane, awaiting r3) |
| anchor-r3 (partial) | 8efc257 | 21/53 graded (default seeds S+L, part of seed a); count_by_tables 5/5, mult_facts 5/5, time_5min 3/3, sub_50 4/5; money_count, make_change, function_table, add_mixed 0 | no-zero rule broken (39+23+31+7=100, 27−17=10); 3–4 problems a page at L / S = L on 6 skills; add_mixed drops its example at L; money_count b = c and "Start with the biggest" meaningless under the all-same default; make_change "Make 25"; add_fractions key simplifies inconsistently; sub_50 seed a spills to a 60 % empty page. Not graded: seed b, Mixed set, lint |
| teacher-r1 | c9fd46d | not graded (paused before any grade) | restart |
| k2-r3, fractions-r1, guided-r1, pv-r1/r2, figures-r7, geometry-r1, anchor-r1 | — | earlier rounds, kept for comparison | — |

## 5. The goal still open (owner, 2026-09-26)

Lessons in the sample format for every WRM small step, skill, CCSS standard / part and EE, in a lesson library, each
tagged WRM / CCSS / EE and tied to a skill that practises it the same way; a record of lessons to make, when each
standard is fully hit by lessons and by skills, skills and options still to make; everything critic ≥ 8 before commit.
Plan: `design/LESSON_LIBRARY_PLAN.md` (phases 0–4, archetypes A1–A13, `ws-lesson-coverage` → `LESSON_COVERAGE.md`).
Skill / standard records: `design/STANDARDS_COVERAGE.md`, `design/WRM_COVERAGE.md`, `design/BUILD_LIST.md`.
Phase 0 is on the lessons lane (above); Phase 1 (archetype pilots) is next.

## 6. How to resume

**Backup branches on origin** (owner-approved, 2026-09-26; WIP, never merged or deployed):

| Branch | Head | Lane |
|---|---|---|
| claude/sweet-newton-c8wrv1-wip-lessons | ea22a97 | lessons engine |
| claude/sweet-newton-c8wrv1-wip-teacher-ui | c9fd46d | teacher UI / three papers / quiz / home |
| claude/sweet-newton-c8wrv1-wip-anchors | 8efc257 | worked examples |
| claude/sweet-newton-c8wrv1-wip-placevalue | 8d968fa | place value / rounding |
| claude/sweet-newton-c8wrv1-wip-figures | fb2c296 | figures / data |
| claude/sweet-newton-c8wrv1-wip-geometry | 032a27d | geometry |
| claude/sweet-newton-c8wrv1-wip-k2 | 99eca66 | K-2 |
| claude/sweet-newton-c8wrv1-wip-operations | 1ce8868 | operations |
| claude/sweet-newton-c8wrv1-wip-fractions | af4963f | fractions |

To recreate a lane: `git worktree add .claude/worktrees/<lane> -b <local-name> origin/<branch>`.

1. The lane branches are local to this container. If the container was reclaimed, only what is on `origin` survives:
   master / sweet-newton (this file, all critic grades above, the backlog) — the lane work in §3 is lost unless it was
   pushed. Check `git branch -a` first.
2. If the worktrees survive: resume each lane with "resumed after owner pause; your tree is WIP-committed; continue
   from the Next column", at most 8 agents, browser gates one at a time.
3. Critic every lane before merge; merge + full gates + stamp (`ws-stamp-assets`) + deploy what passes.
4. To build on resume (owner rulings of 2026-09-27): reddish-orange answers on keys (MASTER_PLAN 4.4; a small lane: key template colour + ink / print-lint rules), and the skill gallery + auto-saved sets + Sets area (teacher-UI lane).

## 7. Independent planning review (2026-10-02, Wave 1 start) — open items

Fixed at once: key colour wording (INK-31, PT-KEY-1a, §6 here) now says reddish orange; CLAUDE.md file and code counts.
Still open, for the owner or a later wave:
- Teacher files: `teacher-shell/print/library/quiz-ui/sets/standards.js` and the `ws-teacher-*` gates are on this branch, while `sheet/papers.js` and `prerequisite-skills.js` exist only on `wip-teacher-ui`; a live-vs-branch table is needed before Wave 3.
- One deploy-gate list: CLAUDE.md "Checks to run" omits `ws-screen-answer`, `ws-screen-slots`, `ws-share-options` and the `ws-teacher-*` gates.
- Backlog items with no wave owner (BACKLOG.md top: div_remainders counters, nl_sub, add_5_pictures, money_compare panels, mixed_placevalue, round_nl_hundred_thousands, support ladder on worksheet/quiz hosts, expand double edge) → fold into Wave 5.
- Owner answered 2026-10-02 (now in MASTER_PLAN "Owner answers"): Practice map = MAP strand picker; money_count defaults to mixed coins; skip N is per skill (default 5); each passing lane deploys.
- Research credentials file (`~/.claude/projects/*/memory/credentials.md`) is not present in this container, so MathWorksheets4Kids / IXL logins are unavailable to agents.
- The `effort:` field in `.claude/agents/*.md` cannot be seen by the agent itself; the model (Sonnet 5.5) was confirmed, the effort setting was not observable.
- Wave 2 has no recorded baseline: `ws-wrm` today = 872 steps, 359 not fully covered (149 partial, 210 gap), 162 proposals.
- 5.3 (same skill twice with different supports) needs a share-code decision, since a skill id would appear twice.

## 8. Container fix: browser gates and the proxy CA (2026-10-02)

Browser gates failed with `net::ERR_CERT_AUTHORITY_INVALID` on every CDN (fonts, jsDelivr, cdnjs): Chromium's NSS store
`/root/.pki/nssdb` was empty, so it did not trust the cloud container's proxy CA. This is environment, not app code. Fix
(rerun in any new container before browser gates; never disable TLS checks instead):

    apt-get install -y libnss3-tools
    mkdir -p /tmp/cabits && cd /tmp/cabits && awk '/BEGIN CERT/{n++} {print > ("c" n ".pem")}' /root/.ccr/ca-bundle.crt
    for f in c*.pem; do s=$(openssl x509 -in $f -noout -subject); case "$s" in *Anthropic*) certutil -d sql:/root/.pki/nssdb -A -t "C,," -n "$(echo "$s" | sed 's/.*CN = //; s/,.*//')" -i $f;; esac; done

Gate failures and load numbers measured before this fix (~12:30 UTC) are not trustworthy and are being rerun.

## 9. Escalations

- 2026-10-02 Wave 1 Lane C fix round 5: builder escalated to Opus low (builder ladder step 2 per the brief) - the ten-column chart's desktop digit size failed critic rounds 3 and 4 and the Sonnet-medium builder reported pre-fit-pass numbers (33.4 px vs 15.36 px rendered).
