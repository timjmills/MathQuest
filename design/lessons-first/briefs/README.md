# Lessons-first lane briefs — common rules (read first)

Every brief in this folder is a complete lane brief for the program in `design/LESSONS_FIRST_PLAN.md`. The lead launches
each as one cloud session (`create_session`, source `https://github.com/timjmills/MathQuest`, revision = the integration
branch `claude/sweet-newton-c8wrv1`, permission mode inherited) unless the brief says in-session. Paste the brief whole as
the session's prompt.

**Before wave 1 the lead fast-forwards `claude/sweet-newton-c8wrv1` to `origin/master`** (on 2026-11-07 it is 8 commits
behind master and 0 ahead), so every lane starts from the live tree.

## Model and effort

**Opus 5.5 at MEDIUM effort for every agent and session in this program** — builders, fixers, critics, auditors
(owner 2026-11-07, `design/STATUS.md:712`; it replaces CLAUDE.md "Agents"' low-effort builder rule for this program). Agent
calls pass `subagent_type: "mq-opus-medium"` and `model: "opus"`. Say in each sub-agent's brief which step it is on.

## Rules every lane keeps (from CLAUDE.md and `design/audit/LESSONS_LEARNED.md`)

1. Read `CLAUDE.md` whole, `design/audit/LESSONS_LEARNED.md` (the classes, the PRE-FLIGHT, the process rules 00–9 and
   L16–L21), `design/audit/RUBRIC.md` and this plan's §3 (pipeline) and §6 (checks) before building.
2. **Checks first.** Write the machine check for each known defect, prove it FAILS on the current head, then fix; each check
   gets a backtest row in `tests/fixtures/precritic/backtests.json` and must be on precritic's path (`ws-precritic-plan`).
3. **Clean before critic** (rule 0b): `ws-precritic … --strict` and the unit gates green on the lane branch MERGED WITH the
   current integration branch. A critic never sees a red page. The builder's report is the precritic table.
4. **Browser gates one at a time** in the lane container, always through `/tmp/mq-browser-run.sh`. Never run
   `ws-chromebook-perf` in a lane.
5. **Two rounds at medium, then stop** (rule 7): if the same defect survives two rounds, stop, write the root cause as a
   machine check, and hand over to the lead.
6. **The critic is independent**: a fresh `mq-opus-medium` sub-agent that did not build the work, given RUBRIC, the
   visual-quality questions (RUBRIC §6.1), the signed card and the renders; it grades ≥ 8 on every criterion or FAIL.
7. **After every critic round**, pass or fail, write in the lane status file the two lists of rule 00 (automatic checks,
   speed-ups) and append them to `design/status/speed-audit.md` "Per-round findings".
8. **Files:** edit only the files the brief lists as owned. Shared registries are append-only, in your own block
   (`js/modules/build-list.js` `SHARED_APPEND_ONLY`); registry additions (new skills, tags, presets) go in your manifest
   `design/lanes/<lane>/manifest.json` (`design/lanes/README.md`); in `data/curriculum/links/<Y>.json` edit only the steps and site
   lessons your own skills teach and list each edit in your status file (ws-integrate has no links operation yet, plan §4.1); never splice `SKILLS[category]`;
   CSS changes additive; never run `ws-stamp-assets`; never edit `design/STATUS.md` (write `design/status/<lane>.md`, format
   `design/status/README.md`).
9. **A skill that passes** is added to `js/modules/redesign-passed.js` in the same change, with its evidence line; a new skill
   gets SKILL_STANDARDS, SKILL_WRM, links (`direct`, `pre`, `related`), search terms and an appended share code in the same
   change (CLAUDE.md).
10. **Run `node --input-type=module --check < file.js` on every touched ES module and `node --check` on .cjs files.**
11. **Budget:** the brief's cap is in session `cost_usd` ($20 ≈ 1 % of the weekly limit). At 80 % of the cap, stop at the
    next clean point. If the lead says the week reached 60 %, start nothing new; at 70 %, stop at the next clean point.
12. **Hand-over** (always, pass or stop): commit and push the lane branch; open or update a draft PR into
    `claude/sweet-newton-c8wrv1` (never master); `design/status/<lane>.md` with State, Times lines, the precritic table, the
    critic verdicts, cost in $ and %, what remains, owner questions with suggested answers; then report to the lead.
13. Commit messages end with the attribution lines the session's system reminder gives; no model names in the message body.

## Critic briefs (every critic brief carries this line)

> **Legibility is scored.** Anything you notice that is small, hard to read, cramped, faint or thin (dots, digits, labels,
> strokes, a tall narrow drawing in a wide cell) is a numbered defect with its criterion and hard cap, never an "unscored note".
> A page or host carrying one does not pass. (Owner, 2026-11-13; LESSONS_LEARNED process rule 10; RUBRIC "How a page counts as
> graded".)

## Briefs in wave 1

| Brief | Lane id (status file) | Where |
|---|---|---|
| `w1-lesson-engine.md` | `lf-engine` | cloud |
| `w1-lesson-checks.md` | `lf-checks` | cloud |
| `w1-ops-pilot.md` | `lf-ops` | cloud |
| `w1-algebra-pilot.md` | `lf-algebra` | cloud |
| `w1-vocab-lessons.md` | `lf-vocab` (only after the owner's yes to Q7) | cloud |
| `w1-inflight.md` | the two in-flight items | in-session worktree agents |

## Critic brief templates (owner rule 2026-11-13, fastest plan 2-3)

| Brief | When |
|---|---|
| `critic-copy-light.md` | a later skill on an already-passed template (`ws-precritic --skill X --copy-light`: ELIGIBLE, anchor named) — narrow critic on its own content, on the run's page sample |
| `critic-batch.md` | 3–6 copy-light skills on ONE passed template (`ws-precritic --batch k1,k2,…`) — one run, per-skill verdicts, one shared sample |

Neither applies to a template's FIRST skill (full critic); any layout defect they find escalates to a full critic.
