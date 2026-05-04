# Phase 1 — Decisions on the 6 Open Questions

User said "keep going" without specifying answers to the 6 open questions in `FEATURES.md` §8. These are the builder's-call defaults for Phase 2; document them so they can be revisited later.

| # | Question | Default | Rationale |
|---|---|---|---|
| 1 | Manual grading queue persistence | Persist in `localStorage` under `mathquest_literacy_grading_queue` | Teachers reviewing student work later expect grading queue items to survive a page reload. Single-user (no roster) so data stays in this browser. |
| 2 | Reports CSV column set | Include skill_id, skill_label, grade_level, rit_band, attempts, correct, accuracy, response_time_ms, mechanic_used, timestamp | More columns is more useful for teachers; trim is easy in spreadsheet. |
| 3 | OpenDyslexic font delivery | Bundle in `/css/fonts/` | No network dependency. Math Quest is offline-capable; literacy should match. |
| 4 | Reading 2-5 item sets per session | 1 passage per session (3-5 items) by default; configurable in Stage 2 Custom Play Settings | Focused; matches NWEA test simulation closer for shorter quick-practice. |
| 5 | Diagnostic-anchor field UI exposure | Hidden as data-only | Cleaner skill detail page; teachers can read raw skill files if they want anchor info. Phase 3 can add a "show advanced" toggle. |
| 6 | RIT 170-200 overlap routing | Persist student's choice in cookie `mathquest_literacy_settings.last_test_variant` | One-and-done is less friction; student can override via the test selector. |

These defaults are encoded in the Phase 2 build. Revisit after the vertical slice is playable.
