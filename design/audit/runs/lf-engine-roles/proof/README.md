# lf-engine-roles — before/after proof for the critic

Engine round on three shared role layouts (findings from lf-placevalue on `placevalue:compare`, (2) and (3) pre-existing
on master and hit every skill on those roles). Branch `claude/sweet-newton-c8wrv1-lf-engine-roles` from master `8df014ab7`.

## What changed, by role

A render-hash sweep of every passed skill (`js/modules/redesign-passed.js`) on the affected roles, before (master `8df014ab7`)
vs after (this branch), with the matrix partners `addition:add_facts, algebra:tape_diagram, area_perimeter:perimeter_intro`:

| Role | pages changed | what changed |
|---|---|---|
| **opener** (finding 1) | 9 of 81: `placevalue:expand` S/M/L, `placevalue:unit_form` S/M/L, `placevalue:combine` L (and `compare` on w2) | the `tightRows` sections' rows and the one-column Model are held to their ink; a one-column Model takes the full width instead of being sized Infinity mm and dropping every Independent row. Items **rose** (expand / unit_form / combine L: 2 → 4). No other opener changed. |
| **mixed-practice** (finding 2) | 242 of ~405 (every lead × size × anchors off / first / top): side / sections anchors already filled | a Mixed page whose one-shelf-per-skill start runs past page 1 now fills the pages it takes (PG-23), instead of leaving a lone short last page. Items **rose**, pages never dropped. |
| **independent-sections** (finding 3) | **0 of 405** | finding 3 is a CHECK change (`ws-print-lint` DN-2 / PG-23 read a sections sheet by sub-section); the engine renders the same bytes. |

Lesson pages are byte-identical: `ws-lesson-baseline --all-lessons --sizes L,S --seeds 4242,1 --per-lesson` — 1596 hashes identical.

## The PNGs here

- `mix-addfacts-M-{before,after}-p2.png` — the PG-23 defect (page 2 held 2 perimeter cells, ~85 % empty) and the fix
  (6 well-sized perimeter cells filling the page).
- `mix-value-L-{before,after}-p1,p2.png` — page 1 unchanged and clean; page 2 fills with algebra + geometry cells, no
  overflow, tabs clear.

Every after page: cells sized to their content, no overflow, no stretched bands, correct tabs. The fills are the intended
behaviour of findings 1 and 2, not regressions.
