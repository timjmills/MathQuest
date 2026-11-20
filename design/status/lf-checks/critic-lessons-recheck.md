# Narrow critic re-check: six detailed lessons (critic-lessons-recheck)

Critic: Opus, medium effort, 2026-11-20. Independent. Graded cold at master `d38308824ecee61cdd14f752f7397df5d5448087`.
Rubric: design/audit/RUBRIC.md (C1 ease of use, C2 educational value, C3 spacing, C4 standard fidelity; PASS = every
criterion >= 8 on every page, plus green gates). Earlier PASS reports: design/lesson-planner/lessons/<id>/critic-r3|r4.md
(g2-nbt3 r4 2026-10-16, g1-oa1 r4 2026-10-17, g3-oa5 r3, g3-oa9-io r3, g3-oa9-mtp r3 2026-10-17, g4-nbt1 r3 2026-10-30).

What ran (all through /tmp/mq-browser-run.sh):
- Per lesson: `ws-detailed-lesson --check --repeats`, `--lp`, `--sweep` (the three lesson gates of `ws-precritic --lesson`).
- `ws-precritic --lesson <all six> --strict` ran its role-wide gates, then was stopped for time (shared slots). Role-wide
  results: PASS ws-grade-render --roles lesson, capacity-pin, teacher-wrm (detailed-lesson cards), lesson-coverage,
  checks-from-critics, no-size-s, no-phone-width, screen-widths-plan, conflict-markers. FAIL on master, none naming a
  detailed lesson: ws-lesson-unit (4 of 320: D13, N3, D18 x2, part-opts), raster-fit RR-CLIP (number_sense:rounding_visual),
  print-lint L/M, empty-band, cell-checks (rounding_visual OVERFLOW, KEYJOIN coordinate_q1 / f_to_d / seq_2), ws-lesson-samples
  --check. These are master-wide short-lesson reds, recorded here, not charged to the six lessons. Not run: link-uses,
  partopts-unit/shots, CHART-HEAD --detailed.
- Render: the pack of `ws-detailed-lesson --check` (seed 4242), every page read as a contact sheet. **Size:** a detailed
  lesson has no M / L size; it prints one fixed size (the baseline key has no size), so one render per lesson covers it.
- Render stamp: `ws-lesson-baseline --write` at this commit; every detailed page at seed 4242 is byte-identical to the
  pinned design/audit/baselines/lesson-baseline.json (g2 37/37, g1 26/26, g3-oa5 30/30, g3-oa9-io 28/28, g3-oa9-mtp 26/26,
  g4 28/28, 0 differ). The stamp is the baseline keys `detailed/<id>/{4242,1}/pNN` at this commit; digest = first 16 hex of
  sha1 over the sorted "key=hash" lines of that lesson and seed.

| lesson | gates | C1 | C2 | C3 | C4 | PASS / FAIL | render stamp (commit + hash list or baseline keys) | defects |
|---|---|---|---|---|---|---|---|---|
| g2-nbt3-read-write-1000 | check OK, lp OK, **sweep FAIL (1)** | 8 | 8 | 8 | 9 | **FAIL (gate)** | d38308824 · detailed/g2-nbt3-read-write-1000/{4242,1}/p01-p37 · s4242:51b0b7c70b7b1677(37 pp) s1:34c3ba760b46513a(37 pp)  | Sweep seed 17 does not build: "no more_less_10 item for \"any\" (turned away: used 67, ans 8, hard 488, near 37)" - the P1 Number sense dealer runs dry. Pages at 4242 grade >= 8 (every key re-derived: P0, P1, P3, P4-1/2, mixed, story 406, exit). |
| g1-oa1-bar-model-wp-20 | **check FAIL** (E9, E35), **lp FAIL** (LP-RASTER), **sweep FAIL** | - | - | <=7 | - | **FAIL (gate)** | d38308824 · detailed/g1-oa1-bar-model-wp-20/{4242,1}/p01-p26 · s4242:7d71a8b9149f9c64(26 pp) s1:ffb205e09a9c6313(26 pp)  (not a pass stamp) | E9: P6 overflows +5 mm, P6-key +4 mm (C3 defect). E35: "How many cards in all?" / Practice 1 Steps band not printed (script names a band the page lacks). LP-RASTER: 0.75 / 1.5 pt rules leave no ink at 72 dpi on pages 10, 11, 13. Sweep: build error at a seed (puppeteer evaluate throw). Not graded further. |
| g3-oa5-mult-properties | check OK, lp OK, sweep OK | 8 | 8 | 8 | 9 | **PASS** | d38308824 · detailed/g3-oa5-mult-properties/{4242,1}/p01-p30 · s4242:0cda3e0c24a33489(30 pp) s1:7c734ff89b44c1bc(30 pp)  | None at defect level. Every array, turn and key re-checked (P4-1 6x5/5x2/3x5/4x4, P4-2 ten facts, story 5 / 5x8=8x5=40, exit). Nit: P4-1 item 4 (4x4) turns to itself, as accepted in r3. |
| g3-oa9-input-output-rule | check OK, lp OK, **sweep FAIL (1)** | 8 | 8 | 8 | 9 | **FAIL (gate)** | d38308824 · detailed/g3-oa9-input-output-rule/{4242,1}/p01-p28 · s4242:366e92654432eaa6(28 pp) s1:16d48f278030ffa8(28 pp)  | Sweep seed 25 does not build: "unknown placeholder {exit.0.wrong.neighbouroutputs}" (a T6 wrong-answer template names a field the exit deal lacks at that seed). Pages at 4242 grade >= 8 (every rule re-derived: Guided +8/-3/x2, P4-1 +2/-4/x3/-6, P4-2 +3/-10/-9/x5, story +5, exit +7/-8/x10). |
| g3-oa9-mult-table-patterns | check OK, lp OK, sweep OK | 8 | 8 | 8 | 9 | **PASS** | d38308824 · detailed/g3-oa9-mult-table-patterns/{4242,1}/p01-p26 · s4242:ff995039ee67d75a(26 pp) s1:01212d690ea75536(26 pp)  | None at defect level. Chart shading, Guided / Independent windows, story (3 x 4 = 12, even) and keys checked. |
| g4-nbt1-ten-times-value | check OK, lp OK, sweep OK | 8 | 8 | 8 | 9 | **PASS** | d38308824 · detailed/g4-nbt1-ten-times-value/{4242,1}/p01-p28 · s4242:a3df41cd05c748f5(28 pp) s1:53d68b783f764412(28 pp)  | None at defect level. Every worth box and 10 times / one tenth ring re-derived (P3, P4-1, P4-2, story 6,000 / 600 = 10, exit, P0). |

Pass list for lessons-passed.js: g3-oa5-mult-properties, g3-oa9-mult-table-patterns, g4-nbt1-ten-times-value (stamp above).
Re-check after fix: g2-nbt3 (sweep seed 17), g3-oa9-input-output-rule (sweep seed 25), g1-oa1 (E9 P6 overflow, E35, LP-RASTER, sweep).
Logs were in the critic's scratchpad (dl-check/lp/sweep-<id>.log); re-run with the commands above.
