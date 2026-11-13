# lf-tools: no phone width in the screen gates (owner rule 2026-11-13)

CLAUDE.md "Fastest-implementation plan" item 7: the screens are print, computer / Chromebook (1280–1366 px) and tablet
(820–1024 px). There is no phone width (390 px). Answer boxes keep 48 px touch targets for tablets.

## State

Done in this worktree (builder, Opus medium; first build of the tool `ws-no-phone-width`). Not pushed.

## What changed

- **Shared defaults** `tests/lib/ws-screen-widths.cjs`: `SCREEN_WIDTHS` 1280, 1366 (× 768), 820, 1024; `TABLET_WIDTHS` 820,
  1024; `DIGIT_FLOOR`; `widthsArg()` so `--widths 390` still runs on request.
- **SCREEN-DIGIT floors** (ws-screen-slots): the standard's SP table gives 40 / 48 / 56 px at 375 / 768 / 1440 and names no
  1024 or 1366 row. **1366 takes the 1280 floor (56 px); 1024 takes the 820 floor (48 px).**
- **Gate defaults now 1280 / 1366 / 820 / 1024 on the practice card**: ws-empty-band, ws-screen-ink-size, ws-screen-slots
  `--screen-digit`, ws-grade-render (1366 × 768 always on; `--chromebook` kept as a no-op), ws-screen-support-eq. Each takes
  `--widths`. Worksheet and quiz hosts stay at 1280.
- **ws-phone-card is the TABLET CARD CHECK** (name kept for precritic and the backtests): defaults 820 × 1180 and
  1024 × 768; new rule TOUCH, answer boxes ≥ 48 px at a tablet width (regroup / carry scratch boxes ≥ 44 px, SP-10 / SP-23);
  `--sizes 390x844,390x664` still runs the phone check on request.
- **ws-grade-render --gate TOUCH-TARGET**: answer boxes ≥ 48 px on card-820 / card-1024, other controls ≥ 44 px (SP-10). The
  card at 1024 × 768 lays out with `#gameView` as `display: contents` (the short-screen play layout), so it is shot as the page.
- ws-next-box and ws-vocab-unit `--browser`: card-390 → card-820. ws-ldiv-hug, ws-touchdots, ws-div-facts-forms: [390, 1280]
  → [820, 1280].
- ws-precritic: gate texts, `phone-card` scope, `next-box` scope; new node gate `no-phone-width` on every run.
  ws-deploy-gates.sh session 1: `node_gate 1 ws-no-phone-width`.
- RUBRIC.md "Screen" hosts (1280 computer, 1366 × 768 Chromebook, 820 and 1024 tablets) + the rule, touch-target line, digit
  line, "cut off" line, H6; briefs/README.md critic-brief line "Screen hosts"; LESSONS_LEARNED L25 host list.
- **New check** `tests/scripts/ws-no-phone-width.mjs` (self-test 20 cases): FAIL on a 390 default in a screen gate, the RUBRIC
  host row or the brief template, or shared widths that drift. 91182e61: FAIL (21 findings); this tree: OK.

## Backtest rows touched (none deleted)

Kept proving at 390 by an explicit override: `phone-card-pilot` (`--sizes 390x844,390x664`), `vq-r2-render-gate`
(`--widths 390`), `screen-ink-size-divfacts`, `vocab-r14-sis-pick3`, `vocab-r14-sis-match3-tile`, `pv-words-parity`
(`--widths 390,820,1280`), `screen-support-eq-divfacts`, `screen-cue-size-divfacts`, `screen-support-place-divfacts`,
`screen-digit-npr-worksheet` (`--widths 1280,820,390`). Moved to 820 with the tool (no width flag): `vocab-o1-next-box-blue`,
`vocab-r9-nb6-quiz-red`, `vocab-r9-nb7-pick3-line`, `vocab-r10-nb8-wrong-focus-tick`, `vocab-r11-nb9-blur`,
`vocab-r12-nb9-every-card` (ws-next-box card host) and `vocab-v23-v25-screen-feedback`, `vocab-v23-painted`,
`vocab-r8-v25plus-v26-v27` (ws-vocab-unit card host). New row: `no-phone-width-default` (FAIL 91182e61b → OK 29ef1eb21; ws-backtest PASS) and its CHECKS_FROM_CRITICS row (sweep PASS).

## Pin

`design/audit/baselines/screen-ink-size.json`: the 9 `card 390px` keys removed, 18 new `card 1366px` / `card 1024px` keys
appended (from `--passed --widths 1366,1024`); every other key unchanged; 42 → 51 keys, 99 → 121 findings. The sweep
`design/status/lf-checks/screen-ink-size-sweep.md` is regenerated from the run that judged it.

## New findings for routing (reds go to the owning lane)

| Finding | Owner |
|---|---|
| SIZE-INK / SIZE-WIDTH at card 1366 / 1024 on add_facts (tile, frame), mult_facts (skip, array), div_facts (array): the same classes already pinned at 390 / 820 / 1280 (18 keys, now pinned) | lf-ops |
| ws-screen-slots `--screen-digit` division:div_facts: worksheet numeral "45" is 40 px at 1280 / 1366 (want 56) and 820 / 1024 (want 48). Pre-existing at 1280 and 820 on 91182e61; not caused by this change | lf-ops (and lf-checks to rule whether the worksheet grid takes the card floors or SP's 29 px) |
| ws-screen-ink-size `--passed`: 4 SIZE-REF OVER on vocab_grade_pictures / vocab_pick3_words worksheet 1280 (unchanged host width; not caused by this change) | lf-vocab |
| ws-vocab-unit `--browser` V23: 60 "pupil print page changed" pin misses on this tree (print hashes, not the screen; the lf-vocab lane is not integrated here) | lf-vocab |

## Not changed (named so the lead can route them)

Teacher and app-UI browser tests still test 390 as a phone layout (touch emulation, chip rows, slide-over lists):
ws-teacher-wrm, ws-teacher-library, ws-teacher-preview, ws-teacher-shell, ws-simple-print, ws-student-explorer,
ws-share-options, ws-pdf-preview, ws-wrm-r10-shots, ws-vocab-answered, ws-support-ladder (`--shots` only),
support-numberline and the wave1-* / small-fixes-* probes. They are not skill screen-host gates; dropping their phone
assertions is an owner / lead call per tool. `design/audit/golden/function-table/manifest.json` still lists card-390 pages:
`--golden diff` will report them removed and card-1024 new until a `--golden write` re-records it.

## Verify

Self-tests: ws-no-phone-width (20), ws-phone-card (11 pages), ws-screen-slots, ws-screen-ink-size (55), ws-screen-support-eq,
ws-precritic-plan (48). `ws-precritic-plan` OK (157 rows on path; checks-from-critics: no lf-checks row failing, none dropped;
15 pre-existing WARNING rows of other lanes). ws-boot-smoke OK. Real runs on division:div_facts at the new defaults:
ws-phone-card OK (A14 siblings clean), ws-empty-band OK (42 renders), ws-grade-render --gate OK, ws-screen-support-eq OK,
ws-next-box OK (19 hosts), ws-screen-ink-size `--passed` against the re-pin: all 51 pinned keys held, 4 OVER at worksheet 1280 (vocab SIZE-REF, a width this change did not touch; pre-existing here, lf-vocab), ws-screen-slots --screen-digit
FAIL (the pre-existing worksheet digit finding above).
