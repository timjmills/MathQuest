# lf-engine-roles — before/after proof for the critic (round 2)

Engine round on three shared role layouts (findings 1-3 from lf-placevalue on `placevalue:compare`), then the critic r1
rebuild (B1 second Guided row, N2 Model column rule, the sections DN-2 fill guard). Branch
`claude/sweet-newton-c8wrv1-lf-engine-roles` from master `8df014ab7`.

## The sweep (re-run for r2; it replaces the r1 table, which under-reported combine S)

A render-hash sweep of every passed skill (`js/modules/redesign-passed.js`, 27 skills), master `8df014ab7` (before) vs this
branch (after), seed 4242, pupil and key pages hashed one by one:

- **opener**: each skill at S, M, L (81 builds);
- **mixed-practice**: each skill as the lead with the partners `addition:add_facts, algebra:tape_diagram,
  area_perimeter:perimeter_intro`, at S, M, L, anchors `off` / `side` / `sections` (243 builds);
- **independent sections**: finding 3 and the GUARD are check-only changes (ws-print-lint); the engine renders the same bytes.

No build errored. No page count fell. No item count fell.

### Every changed page

**Opener: 9 of 81 builds changed** (one pupil page + one key page each), all placevalue. Counts are models / guided / independent;
"used" is the bands' height over the body above the footer.

| Skill | Size | Before (master) | After | What changed |
|---|---|---|---|---|
| `placevalue:expand` | S | 1 / 1 / 0, 31 % used | 1 / 2 / 2, 56 % used | full-width Model (was sized Infinity mm, every Independent row dropped); 2nd Guided row (B1); rows held to ink |
| `placevalue:expand` | M | 1 / 1 / 0, 33 % | 1 / 2 / 2, 68 % | as S |
| `placevalue:expand` | L | 1 / 1 / 0, 40 % | 1 / 2 / 2, 89 % | as S |
| `placevalue:unit_form` | S | 1 / 1 / 2, 53 % (rows stretched) | 1 / 2 / 2, 53 % | rows held to ink (finding 1), 2nd Guided row (B1) |
| `placevalue:unit_form` | M | 1 / 1 / 2, 63 % (rows stretched) | 1 / 2 / 2, 64 % | as S |
| `placevalue:unit_form` | L | 1 / 1 / 0, 41 % | 1 / 2 / 2, 85 % | full-width Model, 2nd Guided row |
| `placevalue:combine` | S | 2 / 4 / 8, 64 % (rows stretched) | 2 / 4 / 8, 57 % | rows held to ink (finding 1); the two-Model grid keeps the band's height (N2) |
| `placevalue:combine` | M | 1 / 3 / 6, 76 % (rows stretched) | 1 / 3 / 6, 71 % | rows held to ink (finding 1), the one Model held to its ink |
| `placevalue:combine` | L | 1 / 1 / 0, 36 % | 1 / 2 / 2, 85 % | full-width Model, 2nd Guided row |

The other 72 opener builds (24 skills x 3 sizes) are byte-identical.

**Mixed practice: 81 of 243 builds changed (finding 2): every lead at S, M and L with anchors `off`.** The 162 builds with
anchors `side` or `sections` are byte-identical (their spilled start already filled its pages). The 27 leads, each at
S/off, M/off and L/off:
`addition:add_facts, add_wp_10, add_wp_10_plain, add_wp_20, add_wp_20_plain, fact_family_sort`;
`composing:number_word_form`; `division:div_facts, div_facts_long`; `multiplication:mult_facts`;
`placevalue:combine, expand, identify, unit_form, value`; `subtraction:sub_100_no_regroup, sub_100k_no_regroup,
sub_10k_no_regroup, sub_1k_no_regroup, sub_1m_no_regroup, sub_2d_1d, sub_50_no_regroup, sub_facts, sub_wp_10,
sub_wp_10_plain, sub_wp_20, sub_wp_20_plain`. In every one the page count is unchanged and the item count rose or stayed
(a spilled start now fills the pages it takes, PG-23).

**Lessons:** byte-identical — `ws-lesson-baseline --all-lessons --sizes L,S --seeds 4242,1 --per-lesson`, 1596 hashes
written on `8df014ab7`, checked on this branch.

## The PNGs here

Opener, every changed page, before (master `8df014ab7`) and after (this branch), pupil and key:
`opener-<skill>-<size>-<before|after>-<pupil|key>-p1.png` for skill `expand`, `unit_form`, `combine` at size `S`, `M`, `L`
(36 files).

Mixed (finding 2, from r1): `mix-addfacts-M-{before,after}-p1,p2.png` (page 2 held 2 perimeter cells; now 6) and
`mix-value-L-{before,after}-p1,p2.png`.
