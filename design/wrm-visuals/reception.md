# WRM visual catalogue — Reception (PK)

Phase 3 of `design/WRM_ALIGNMENT_PLAN.md`: every representation White Rose Maths draws in the Reception
small-step materials, how WRM draws it, and whether our kit can already draw it in our own black-and-white
Andika style. **Descriptions only** — no WRM artwork, wording or layouts are copied into the repo; a
match means "our own drawing carries the same mathematical grammar", never "looks like WRM".
Format follows the Year 3 pilot (`design/wrm-visuals/year-3.md`).

- Source: Google Drive, `White Rose Maths Primary / Reception`, 18 blocks, 119 small steps (step ids
  `R.B1.S1` … `R.B18.S2`, file ids from `data/curriculum/wrm-steps.json`). Viewed 2026-09-25.
  Reception = PK4 in the school's grade rule (WRM Year N = US grade N−1).
- **Reception materials are shaped differently from Years 1–6.** The small-step PDF is **2 pages**:
  p1 is text (notes and guidance, key questions, sentence stems, daily routine, rationale) and **p2
  "Adult-led learning"** is 4–6 activity cards, each a short instruction plus an illustration of the
  real objects, picture cards, frames or scenes the adult uses. There is no *Key learning* /
  *Reasoning* page and no worksheet. So for every step we read the Teaching Guide's "Key model" and
  "Avoid" lines (text) **and** rendered and looked at p2. The pupil-facing slide pictures live in the
  teaching decks; their embedded images were extracted and looked at for a sample of 14 decks
  (B1 S7, B3 S2–S6, B4 S1–S4, B5 S2/S3/S7, B6 S4, B7 S3, B9 S5–S6) to confirm what the guide's key
  model describes (see method notes).
- Coverage: key-model line **and** p2 viewed for all 119 steps.

## Legend

| Status | Meaning |
|---|---|
| **MATCH** | An existing kit template / option (or a legacy skill visual that is already B&W-compliant) draws the representation with the same structure. Cite = what to use. |
| **PARTIAL** | We draw the representation, but something WRM relies on differs (task, number range, orientation, what is blank, labelling) — or the drawing exists only as a **support pane** that is not yet wired as a skill option, or only as a **legacy** (coloured, non-kit) visual. What differs is stated. |
| **GAP** | Nothing draws it. A proposal is given: new option on skill X, or new template / skill. Where `js/modules/wrm.js` `WRM_PROPOSALS` already names a skill for the step, that name is used. |

Citations: `template:<id>` = `js/modules/sheet/cells/<file>.js` registered cell; `pane:<id>` = support
pane in `js/modules/sheet/cells/panes/*.js` (the PK-2 pictures are `panes/k2.js`: `objects`,
`tenframe`, `dice`, `fingers`, `rekenrek`); `category:skill` = skill key; option ids are from
`js/modules/skill-options.js` (the K-2 picture kind is the shared `objects` control: `shapes`,
`pictures`, `frame`, `dice`, `blocks`). "Legacy (C)" = the skill's visual is still coloured HTML/emoji
(flag C/E in `design/SKILL_CATALOGUE.md`). Representation numbers below (`R01` …) are this file's
own; `= Y3 Rnn` points at the same row in `year-3.md`.

**Headline finding.** Reception is almost entirely **concrete and oral**: most activity cards show real
objects being handled (feely bags, hoops, towers, pouring, balance scales, small-world scenes), so a
large share of the year is *hands-on only* and should stay that way — our job is the pictorial
companion page, not a replacement. The **number** strand is well served already: the K kit's
`counters` (`objects` shapes / pictures / frame / dice), `compare` (two aligned 2×5 frames), `tenframe`,
`bond`, five frames (`make_ten` "Make 5", `add_5_pictures`, `sub_5_pictures`), `seqstrip` number tracks
and `chartwindow` cover counting, 1 more / 1 less, comparing and composition to 10 and teen numbers.
The pictures WRM leans on most that we **cannot yet print** are: **dot plates** in varied (not only
dice) arrangements and two-colour parts, **fingers** (drawn by `pane:fingers` but not offered on any
skill), **zero / empty set**, **pair-wise and vertical ten frames** (odd/even, doubles), **cube towers and
staircases**, **number shapes** (Numicon-style plates), **dominoes**, **sharing onto plates**, the
**pan balance**, **full/empty containers**, **matching / odd-one-out / sorting rings**, and the whole
**shape-and-space** strand in kit B&W (2-D and 3-D shapes are legacy coloured visuals; shapes in the
environment, face prints, roll/stack, shape-picture templates, positions and maps have nothing).
Patterns exist only as the legacy coloured `patterns:shape_pattern` (colour encodes the element, which
breaks our B&W rule). Every GAP here already has a named new skill in `WRM_PROPOSALS`; this catalogue
adds the **drawing** each one needs.

---

## Block 1 — Autumn 1 · Match, sort and compare (7 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Match objects | A **line-up of objects with one target above** — pick the one that is the same (guide key model); feely bag of classroom objects, duplicates lined up to match; painted pebbles with creatures to pair; two block towers to make the same. | **GAP** → proposed `counting:match_same`: a target picture beside a row of 3–4 line drawings, circle the same one; plus a two-column **draw-a-line** match (the `hands-match` page tag exists but no K cell feeds it). Real-object matching stays hands-on. |
| 2 Match pictures and objects | Real objects placed onto their **picture cards**; picture snap piles; picture → object (a drawn cup beside a real cup); **memory game** (6 cards face down in a 2×3 grid); animals put in a box labelled with a picture. | As S1 (`counting:match_same`, `pictures` kind). Memory / snap cards: GAP (hands-on card page, low priority). |
| 3 Identify a set | Objects put into a lunch box / **set mat**; story picture of place settings (one set differs); buttons grouped by colour; sets with a **missing member** (fork without knife). Guide: belonging, not counting. | **GAP** → proposed `comparing:odd_one_out` (row of four line drawings, circle the one not in the set; `task: 'missing'` shows an incomplete set). Colour sets must become shape/kind sets (B&W). |
| 4 Sort objects to a type | Loose parts into **two hoops / trays ("yes" and "not")**; buttons sorted by colour; farm vs wild animals; conkers vs leaves. | PARTIAL `comparing:classify_count` (`template:counters` kind `sort`: a key box and a mixed picture, count ONE kind; `objects` shapes/pictures) — it counts, it does not sort. **GAP** for the sort itself → proposed `comparing:sort_into_groups` with a new `template:sort-rings` (2–3 outline rings, a label above each, picture tiles to letter into rings; key = facsimile). `hands-sort` (cut-and-glue) page tag exists. |
| 5 Explore sorting techniques | The **same set sorted two ways** (buttons by holes, then by size) in hoops; children sorted by glasses / hair; pasta shapes; animals that roar / do not. | As S4 (`sort_into_groups`, `rule: 'given' \| 'find'`; a second ring pair re-sorts the same tiles). |
| 6 Create sorting rules | "Guess my rule": add items to a set one at a time; pencils vs pens into pots; picture cards (strawberries) sorted; **four socks each differing in one attribute** → odd one out. | As S4 (rule found) and S3 (odd one out). |
| 7 Compare amounts | Two sets in two hoops (5 vs 3); **two rows of conkers lined one under the other** — leftovers show more; balls sorted by kind not size; crate towers (more objects = taller?). Guide: say *fewer*, no "how many more". | MATCH `template:compare` (`comparing:compare_groups`: two groups in the same 2×5 frame one above the other, matched column by column; `objects` frame / shapes / pictures / dice; `dir` more / fewer / same). Loose one-under-one rows: PARTIAL (the frame imposes rows of five; fine for the grammar). Towers: see R06. |

## Block 2 — Autumn 2 · Talk about measure and patterns (6 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Compare size | Big bear and small bear with big/small plates, cups, food; two **ribbons** (long/short strips); towers tall/short; wrapping paper to fit an object. Guide: two real objects moved close together. | Overall size: **GAP** → proposed `comparing:compare_size` (the same outline object drawn at two or three sizes, circle the bigger/smaller). Ribbons/towers: MATCH `comparing:compare_objects` (length lines, height towers, common baseline). |
| 2 Compare mass | Suitcase vs balloon; **pan balance tipped** (heavier pan lower) with dough balls; child as a human balance holding two objects; boxes of different mass on a balance. | **GAP**: `measurement:heavier_lighter_visual` is emoji objects side by side, no balance, flagged C/E → `template:balance` (two pans, beam tipped left / right / level; objects drawn in the pans; = Y3 R50) for proposed `measurement:balance_scales`. |
| 3 Compare capacity | Boxes small/large/tall/thin — will it fit inside?; animals into boxes; buckets and pots filled with sand; **coloured water in a jug and beakers** (holds more / less). | **GAP** → proposed `comparing:compare_capacity`: outline containers (no scale) with a fill level in the single grey; circle full / empty / holds more. (Y3's jug R51 is the scaled successor.) |
| 4 Explore simple patterns | Pattern images from books (stripes, spots); **action picture rows** (jump, clap, jump, clap as pictograms); hands up/down row; children in a ring (song); a journey retold. Guide: notice and name only. | **GAP** → proposed `patterns:make_a_pattern`, `task: 'spot'` (is this a pattern? yes/no). Action pictograms: GAP (low; would need an `actions` picture set). |
| 5 Copy and continue simple patterns | **AB rows with three full units, left to right**: counters alternating two colours; stick–leaf–stick–leaf outdoors; circle–cube–circle–cube; drum beats. | PARTIAL `patterns:shape_pattern` (AB/ABC/ABB/AABB/ABBC with blanks) — **legacy (C)**: colour encodes the element. → `patterns:make_a_pattern` in kit B&W: elements differ by **shape or object kind** (k2kit `SHAPES` / `pictures`), never by colour; `task: 'copy' \| 'continue'`; three units before the blanks. |
| 6 Create simple patterns | Action cards laid in a line to make a pattern; fruit kebab; instrument sound pattern; **a row of leaves with a deliberate mistake** to find and fix. | As S5, plus `task: 'fix'` (circle the one that breaks the pattern) and `task: 'make'` (empty boxes after a given unit). |

## Block 3 — Autumn 3 · It's me 1, 2, 3 (6 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Find 1, 2 and 3 | **Representation cards** to match and sort: pictures (1 strawberry, 1 apple), numerals, two counters, a single tally stick; number hunt (a leaf, a pair of boots, conkers); numeral cards vs picture cards. | Count a picture: MATCH `counting:count_objects` (`objects` shapes / pictures, count to 5). Match card ↔ numeral: **GAP** → `task: 'match'` on count_objects (pictures on the left, numerals on the right, draw a line; `hands-match` tag) — the "Find N" steps across the year all use this. |
| 2 Subitise 1, 2 and 3 | **Dot plates** (a round plate, 1–3 black dots in varied positions: diagonal, vertical line, triangle), flashed then hidden; **finger pictures** 1–3; 1–3 dice/spinner track game; objects hidden under bowls. | Dice patterns: MATCH `counters` `objects: 'dice'`, `pane:dice`. Varied-arrangement round dot plate: **GAP** → proposed `counting:subitise` with `arrangement: 'dice' \| 'line' \| 'scatter'` on a round plate outline (screen: flash then hide). Fingers: PARTIAL `pane:fingers` (Tabler hands 1–10) — not offered on any skill → add `fingers` to the `objects` vocabulary on count_objects / subitise. |
| 3 Represent 1, 2 and 3 | **Five frame + counters** (1×5, filled from the left); claps shown on a five frame; bears with one cup/bowl/spoon each (1:1); candles on a cake; beanbags to drum beats; feely bag. | Five frame: PARTIAL — drawn in `make_ten` ("Make 5") and `add_5_pictures` / `sub_5_pictures` (`objects: 'frame'`), but the build task `composing:ten_frame_build` draws a 2×5 ten frame → add `frame: 'five'` to ten_frame_build (count to 5). 1:1 pictures: MATCH `count_objects`. |
| 4 1 more | Story characters placed **one per cell into a vertical ten frame** (2 columns × 5 rows); **cube staircase** (towers 1, 2, 3 side by side); drum beats +1. Guide: add one counter / build towers 1→2→3; no + sign. | Number after: MATCH `counting:count_sequence` (five-box number path, `dir: 'forward'`). Picture +1: PARTIAL `template:counters` kind `join` (add_5_pictures uses a + sign, which the guide avoids) → `sentence: 'none'`. Vertical frame: **GAP** (R19). Staircase: **GAP** (R23). |
| 5 1 less | Animals leaving a vertical ten frame; cube staircase 3, 2, 1; frogs jumping off a log; pebbles into a bucket. | Number before: MATCH `count_sequence` `dir: 'back'`. Picture −1: MATCH `template:counters` kind `takeaway` (bold X) — minus sign avoidable by the same `sentence` option. Staircase / vertical frame: GAP. |
| 6 Composition of 1, 2 and 3 | Horses in **two fields** (two pens); double-sided counters shaken and dropped (red/yellow parts); **dominoes** with 1–3 spots each side; hidden items under a bowl + fingers for the hidden part. Guide: **no part-whole diagram, no symbols**. | Numbers: `template:bond` exists (`composing:number_bonds`, bonds to 5) but the guide keeps the diagram out of this step → the picture form is **GAP**: two-region mat (R29), two-colour counters as solid / hollow (R22, PARTIAL `pane:objects` op + / `pane:tenframe` solid + hollow), dominoes (R34), hidden part (R48). |

## Block 4 — Autumn 4 · Circles and triangles (4 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Identify and name circles and triangles | Mixed circles and triangles of **varied size, colour and orientation** sorted into two hoops; feely bag (triangle, rotated square, circle, rectangle); a sun (circle + triangles); art made of circles. Guide: finger-trace the outline. | PARTIAL `shapes_early:name_2d_shapes` — **legacy (C)**, prototype orientations. Kit has outline circle / triangle / square in k2kit `SHAPES` → a kit cell for name_2d_shapes with `orientation: 'upright' \| 'turned'` and `size: 'mixed'`; sort into rings = R04. |
| 2 Compare circles and triangles | Mystery box of shapes; planks/sticks making an "almost triangle"; printing faces of 3-D shapes (cylinder → circle); tuff tray of triangles of different types. | PARTIAL `shapes_early:shape_attributes` (legacy (C)) → proposed `shapes_early:compare_two_shapes` (two outlines side by side, same / different checklist: straight sides, corners, curved). Non-examples (open or rounded "almost" triangles): GAP (`task: 'is-it'`). |
| 3 Shapes in the environment | **Photos** with the shape outlined: road marking circle, window triangle, roundabout sign, clock, bunting, tyre; shape hunt; objects pressed into dough. | **GAP** → proposed `shapes_early:shapes_around_us` (line drawings of everyday objects, circle the shape name from a bank). Our drawings, never photos. |
| 4 Describe position | Teddy **under a table**, beside a box, behind a haystack; crates obstacle course (over, through); treasure-hunt picture clues with an arrow. Guide: oral, no left/right. | PARTIAL `shapes_early:shape_positions` (above / below / beside; legacy (C)) → kit cell with an outline object and a reference object, words in / on / under / next to / behind / in front (a word bank). |

## Block 5 — Autumn 5 · 1, 2, 3, 4, 5 (7 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Find 4 and 5 | Rep cards (numeral, dice 4/5, tally sticks, pictures of chicks and pencils) sorted into **two hoops "4" / "5"**; memory game (hand of 5 fingers, tallies); 4 or 5 multilink cubes joined in different shapes. | Count: MATCH `count_objects` (to 5; shapes / pictures / dice). Card sort: GAP (R27, R04). Cube shapes: GAP (R24). |
| 2 Subitise 4 and 5 | **Dot plates 4–5** in many arrangements (dice 4 and 5, a line of 4/5, L shapes, 3 + 2 clusters, scattered); **one hand showing 4/5 fingers**; a **five frame of buttons**; picture cards 1–5 in order with one turned over (chick, 2 fingers, dice 3, blank, a row of 5 dots). | As B3 S2 (`counting:subitise`, arrangement option; `fingers`). Five frame: PARTIAL (B3 S3). Ordered cards with one hidden: PARTIAL `template:seqstrip` (numerals) → `tiles: 'pictures'` (R26). |
| 3 Represent 4 and 5 | Four shells in a row vs in clusters (same number, different arrangement); **fingers on two hands (3 + 2, 2 + 2)**; candles on a cake; 4–5 square tiles joined into shapes. Guide: objects in different patterns → five frame for 5. | Count any arrangement: MATCH `count_objects` `orientation: 'rows' \| 'line' \| 'scattered'`. Two hands: PARTIAL `pane:fingers` `hands(a, b)` (not wired). |
| 4 1 more | Caterpillar food, one more each day; **five frame of strawberries above a 1–5 number track** (numerals under the cells); **cube staircase 1–5**; bus stops +1. | Number after: MATCH `count_sequence`. Frame-over-track: **GAP** → `support: 'track'` under a five frame (count_objects already has a level-2 number track 1–20 under the picture — PARTIAL; the WRM track aligns one numeral under each frame cell). Staircase: GAP (R23). |
| 5 1 less | **Five frame of 4 counters (one cell empty)**; buns on a tray taken one at a time; rocket countdown 5 → 1; bag with one cube in / out. | MATCH `count_sequence` `dir: 'back'`; take-away MATCH `sub_5_pictures` `objects: 'frame'` (five frame, the taken counter crossed). |
| 6 Composition of 4 and 5 | Frogs on a log vs in a pool (two places); **five frame + double-sided counters** (log = one colour, pool = other); two hoops yes/no; **cube towers built in two colours**; pebbles hidden between two buckets. Guide: say part · whole, no + / =. | Five frame two sets: MATCH `add_5_pictures` `objects: 'frame'` (first group solid, second hollow; LS-5) — but that skill asks for the sum with + → PARTIAL; for composition use `composing:number_bonds` (bonds to 5) with a picture support → **GAP** `support: 'frame'` on number_bonds (five frame solid + hollow above the bond). Two-colour towers: GAP (R24). |
| 7 Composition of 1–5 | **Number shapes** 1–5 (plates with holes) combined in twos to make a whole; **beanbags thrown at a hoop — inside = one part, outside = the other**; children split across two book pages; teddies hidden under a blanket. | Bond: MATCH `template:bond` (bonds to 5, `unknown` part / whole). Number shapes: **GAP** (R31). In/out of a ring: **GAP** (R29 two-region mat, `region: 'ring'`). Hidden part: GAP (R48). |

## Block 6 — Autumn 6 · Shapes with 4 sides (4 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Identify and name shapes with 4 sides | Squares and rectangles in **different orientations** (a turned square, a tilted rectangle); two hoops "4 sides / not 4 sides"; matchstick squares and rectangles (how many sticks?). Guide: finger-trace 4 sides and 4 corners. | PARTIAL `shapes_early:name_2d_shapes`, `shape_corners_count`, `count_sides_vertices_2d` (legacy (C)) → kit cell as B4 S1 (`orientation: 'turned'`). Sort 4 sides / not: R04. Matchsticks: GAP (low). |
| 2 Combine shapes with 4 sides | Two squares → rectangle; four squares → a larger square; a folded square showing four smaller squares; **an outline to fill with 4-sided shapes** (gaps allowed); brick printing. | PARTIAL `shapes_early:compose_rect_from_squares` (G2), `compose_shapes` (legacy (C)) → kit `template:shape-fill` (R54): outline + tiles, key = filled outline. |
| 3 Shapes in the environment | Box and crate faces, picture frame, ruler; **street scene of houses** (find squares/rectangles in the picture); linking cubes joined to show square faces. | GAP → `shapes_early:shapes_around_us` (as B4 S3), plus `task: 'find-in-picture'` (a line-drawn scene, circle every rectangle). |
| 4 My day and night | **Visual timetable**: picture cards pegged on a line in order (first, next, then); picture cards (bed, school, pyjamas, cereal, toothbrush) to sort into **day / night**; a blank 3-box timetable to draw in; night scene with animals. Guide: time language only, no clock. | **GAP** → proposed `measurement:order_events` (3–4 picture cards, number them 1–4 in order; `task: 'sort'` into two labelled columns Day / Night = R04 layout). |

## Block 7 — Spring 1 · Alive in 5 (0–5) (8 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Introduce zero | **Empty vs full pairs** (tree with apples / bare tree; bus with people / empty bus; plate with food / empty plate); **five frame emptied counter by counter to 0** (monkeys song); zero hunt (empty pond, empty nest). | **GAP** → proposed `counting:zero_none`: the same outline container / frame drawn with n objects or none, write how many including 0; `count_objects` never deals 0. Five frame with 0: GAP (count to 5 frame starting at 0). |
| 2 Find 0 to 5 | Rep cards: **numeral 0**, 2 strawberries, 4 sticks, **a blank card (= 0)**, a hand; cards sorted into hoops **"0" / "not 0"**; skittles knocked (how many standing); circle game passing objects from a five frame. | As B3 S1 (`task: 'match'`) with 0 included; zero/not-zero sort = R04 rings. |
| 3 Subitise 0 to 5 | **Dot plates 0–5 (an empty plate for 0)**; fingers 0–5 incl. **a closed fist for 0**; dice faces; candles; memory cards; a chalked blank **number track** + large dice; paper plates with dabbed dots. Guide: dot plate / dice · fingers · numeral · empty five frame. | As B3 S2 (subitise, `min: 0`). Fist: GAP in `pane:fingers` (draws 1–10) → allow n = 0. |
| 4 Represent 0 to 5 | Feely-bag items shown on fingers or a five frame; numeral bag → actions; tray scene with animals + numeral card; rhyme books. | MATCH `ten_frame_build` (draw to 5; five-frame version PARTIAL, B3 S3); fingers PARTIAL. |
| 5 1 more | **Cube staircase 1–5**; crocodiles joining the pool → five frames; drum beats 0–4; **picture cards 0–5 (pots of pencils) pegged on a washing line with one missing**. | MATCH `count_sequence`. Washing line of picture cards: **GAP** → `tiles: 'pictures'` on `template:seqstrip` (each tile a small counted picture, one tile blank). |
| 6 1 less | Snowmen melting (5 → 4); **dot plates 1–5 laid out, find the one showing 1 less**; multicolour cube staircases; bag cube in/out. | MATCH `count_sequence` `dir: 'back'`; dot-plate choice GAP (subitise `task: 'one-less'`). |
| 7 Composition | Photos of pea pods (peas in groups); **dabbed dots in arrangements of 5 — draw round the groups**; beanbags in / out of a cauldron; two-colour butter beans dropped. | Bond to 5: MATCH `template:bond`. Ring the groups inside a dot picture: **GAP** → `task: 'ring-parts'` on subitise (key draws the rings). |
| 8 Conceptual subitising to 5 | **Five double-sided counters dropped (3 of one colour, 2 of the other)**; **two-colour dot plates** (dice-5 in two colours); pancakes flipped (two colours); plates dabbed in two / three colours. Guide: each colour is a group. | **GAP** → subitise `parts: true`: one plate, the two groups as **solid vs hollow** dots (LS-5, never two colours); say the whole, then the parts. `pane:dice` op + draws two separate tiles, not one plate → PARTIAL. |

## Block 8 — Spring 2 · Mass and capacity (4 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Compare mass | **Pan balance tipped** — heavier object lower, lighter higher; a home-made coat-hanger balance with pots; **number shapes on a balance** (the greater number is heavier); boats sinking. | GAP → `template:balance` (R08) for proposed `measurement:balance_scales`; `heavier_lighter_visual` (emoji, no balance) is PARTIAL at best. |
| 2 Find a balance | **Object in one pan, cubes added to the other until level** — count the cubes; number shapes balancing different combinations; plank-on-crate balance with tyres; **feather vs pebble** (bigger is not always heavier). Guide: cubes are the only unit. | GAP → balance `state: 'level'` with a row of unit cubes in one pan, "the ___ is ___ cubes" (non-standard mass). |
| 3 Explore capacity | Containers (bottle, bucket, spoon, colander) for a beach; **one container filled with pebbles → pine cones → bricks**; spoonfuls and ladlefuls; sand vs cubes in the same jug (gaps). | GAP → `comparing:compare_capacity` (R09); count-the-scoops version `task: 'count-fills'` (a row of the same small cup under a container). |
| 4 Compare capacity | Containers of different shapes filled by the **same small cup** and ordered by cupfuls (2, 2, 3); a row of cups **full / empty / nearly full / nearly empty** beside a jug; nesting bowls ordered; tall thin vs shallow wide container. | GAP (R09): outline containers with a single-grey fill level; `task: 'describe'` (word bank full / empty / nearly full / nearly empty), `'order'` (three containers, fewest to most cupfuls). |

## Block 9 — Spring 3 · Growing 6, 7, 8 (10 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Find 6, 7 and 8 | Three hoops **6 / 7 / 8** with rep cards (dice 6, fingers, ten-frame card, tallies, pictures); **dot plates 0–8** (2×4 arrays, dice patterns) turned over to match a numeral; fruit baskets; birthday cards 1–8 on a washing line, one removed. | Count: MATCH `count_objects` (to 10). Card match / sort: GAP (R27). Washing line: GAP (R26). |
| 2 Represent 6, 7 and 8 | A dot plate of 7 → **ten frame with counters filled left → right, five-wise** (a full top row of 5 + 2); banquet sets of 6; minibeast legs (6, 8); own collections with a numeral card. | MATCH `template:tenframe` (`ten_frame_build`: draw n on a ten frame) and `count_objects` `objects: 'frame'`. |
| 3 1 more | Ten frame counters for dinners eaten; train carriages + one animal; **0–8 spinner** → cubes or ten frame 1 more; ascending towers. Guide: towers 1…8 + ten frame filling. | MATCH `count_sequence`; ten-frame +1: PARTIAL `pane:tenframe` op + (solid + 1 hollow) — not wired on count_sequence → `support: 'frame'`. Spinner: GAP (hands-on). |
| 4 1 less | Bears rolling out of bed shown on a ten frame; toybox decreasing staircase; **numeral 6 beside a collection of 5 pine cones**; covered cubes, one taken. | MATCH `count_sequence` `dir: 'back'`; `pane:tenframe` op − (crossed counter) PARTIAL (not wired). |
| 5 Composition of 6, 7 and 8 | **Ladybird outline split down the middle, spots on each wing** (blank template to fill; slides show plain and spotted ladybirds); ducks on **two ponds**; **dominoes totalling 6/7/8**; beanbags in / out of a bucket. | Bond: MATCH `template:bond` (to 10). Ladybird / two-region picture: **GAP** (R29) → `support: 'two-part-mat'` on number_bonds (outline shape split by a line, dots drawn on each side, whole given). Dominoes: GAP (R34). |
| 6 Make pairs — odd and even | **Socks in pairs** (one without a partner); animals in pairs; **large ten frame with children standing pair-wise** (column by column); **egg boxes (2×5 dimples) filled pair-wise** with pom-poms. Guide: pair up two by two; no rules about final digits. | PARTIAL `composing:odd_even` (legacy (C); names odd/even numbers) → **GAP** kit: `layout: 'pairs'` on `template:counters` (objects in pairs, the odd one alone) and a **pair-wise ten frame fill** (R19), answer check box odd / even. |
| 7 Double to 8 (find a double) | **Two dice both showing 4** (a double) vs 2 + 1 strawberries (not a double); number-shape pairs; 0–4 dice doubles game; **caterpillar board of circles numbered 2, 4, 6, 8**. Guide: two matching pictures side by side — fingers, dice, dominoes, ten frames. | PARTIAL `number_sense:doubles_near_doubles` (legacy (C)), `patterns:double` (text) → kit: **double / not a double** check-box cell drawing two dot tiles (`pane:dice` op + draws two tiles — reuse) or two hands (`pane:fingers` `hands(a, a)`). Caterpillar: MATCH-ish `template:seqstrip` tile shape `circle`. |
| 8 Double to 8 (make a double) | A "magic doubling pot" (one in → two out); **paint blot folded to mirror spots**; **butterfly wings with the same pom-poms each side**; barrier game building the same number. Guide: ten frame pair-wise; fingers tapped together. | GAP → a symmetric two-wing outline with dots on one side, draw the same on the other (`task: 'make'`), sharing the R29 mat drawing; pair-wise frame R19. |
| 9 Combine 2 groups | Aquarium picture with **two groups** (starfish, shells); fish scooped by two nets; **dominoes parked in a numbered "car park" 0–8** (a row of numbered spaces); dot plates 1–6 paired to total 6/7/8 + numeral cards. Guide: two groups pushed together; the deck's ten frame shows each group in its own colour. | MATCH `addition:add_5_pictures` / `template:counters` kind `join` (two groups, `objects` shapes/pictures/frame/dice — **capped at 5**) and `template:wordpic` (`addition:add_wp_10`, two picture groups, to 10). Ten frame two sets to 8: PARTIAL `pane:tenframe` solid + hollow (not wired) → raise add_5_pictures band or wire the pane on add_wp_10. Numbered car park: MATCH `seqstrip` track. |
| 10 Conceptual subitising | Dot plates 0–8 with **two parts in two colours** (e.g. two columns of 4; 5 + 3); scattered dots — see the groups; **paper roll of dots — draw round two groups**; pictures of shells in groups. | GAP (as B7 S8: subitise `parts: true`, solid vs hollow; `task: 'ring-parts'`). |

## Block 10 — Spring 4 · Length, height and time (6 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Explore length | Dough worms long / short; sticks sorted into long / short piles; **two hoops of long objects (pencil, ruler) vs short (paperclip, cube)**; throwing distances. | Long / short sort: R04 rings with objects (GAP). Single comparison: MATCH `comparing:compare_objects` (length lines). |
| 2 Compare length | Drawn worms longer / shorter; **ribbons lined up with ends aligned**, ordered longest → shortest; **wool worms measured with a cube train** beside them; a journey between two houses measured with blocks / string. Guide: ends aligned, order three, no units. | MATCH `compare_objects` (`task: 'length'`, lines on a common start). Order three: PARTIAL `shapes_early:order_objects_length` (legacy (C), drag-and-drop). Cube-train measure: PARTIAL `shapes_early:measure_nonstandard` (legacy (C)) → kit cell: a line with a row of outline unit cubes beside it, "___ cubes long" (R12). |
| 3 Explore height | Beanstalks of tubes, tall / short; body outline on paper; block towers tall / short; **two brick towers the same height with different numbers of bricks**. | MATCH `compare_objects` (`task: 'height'`, towers on one baseline). Bricks-of-different-sizes tower: GAP (stretch; R12 with mixed units). |
| 4 Compare height | **Two children side by side on the same floor line**, taller / shorter; crates to measure a bush; a tower as tall as a penguin / a mouse; **paperclip chain beside a pot** to measure height. Guide: same floor line. | MATCH `compare_objects` (height, common baseline). Vertical non-standard measure: PARTIAL (as S2, `orientation: 'vertical'`). |
| 5 Talk about time | **Sand timers**; baby photos then / now; how long to toast bread; how many star jumps in a minute. Guide: hourglass while counting actions; no clocks. | GAP → proposed `measurement:time_words` (picture then/now, word bank before / after / now / later). Sand timer: GAP (low; oral). |
| 6 Order and sequence time | **Week timetable grid Mon–Sun** with picture events (P.E. on Thursday); **four picture cards of making a sandwich** in order (first, next, then, finally); own instruction pictures on a board. Guide: weekly strip + movable event cards; no dates. | GAP → `measurement:order_events` (sequence cards) and a **week strip** (seven labelled columns — a `span: 'week'` form of the Y3 calendar proposal R66). |

## Block 11 — Spring 5 · Building 9 and 10 (13 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Find 9 and 10 | Hands (10 fingers) and feet (10 toes); reps sorted **9 / not 9**: 2×5 dot arrays with one missing, dominoes, grass tallies, animals; photos of numbers outdoors. Guide: objects on a ten frame; full frame minus one = 9. | MATCH `count_objects` (`objects: 'frame'`, count to 10). Fingers: PARTIAL (not wired). Sort 9 / not 9: GAP (R04). |
| 2 Compare numbers to 10 | **Votes as cube towers beside each book** (compare heights); dominoes sorted into 9 spots / more / fewer; buttons in one hand checked on a ten frame; characters on two pages. Guide: one-to-one lines / towers side by side; no < > signs. | MATCH `template:compare` (`compare_groups`, count to 10, frames aligned) and `placevalue:compare` for numerals. Cube towers: GAP (R24, R06). |
| 3 Represent 9 and 10 | Fingers (9 = one bent); **bead string of 10** (5 of one colour + 5 of another); ten frame of counters; class counting book (dice, ten frame, numeral plate); **outdoor number track 1–10 with one card hidden**; 10 legs = 2 cows + 1 duck. Guide: ten frame (full = 10) + bead string. | Ten frame: MATCH `ten_frame_build`. Bead string: PARTIAL `pane:rekenrek` (two rows of ten, 5 solid + 5 hollow) → **GAP** single string: `pane:beadstring` (Y3 R07) with `n: 10 \| 20` (not wired). Track with a gap: MATCH `seqstrip` (`number_seq_fill`). |
| 4 Conceptual subitising to 10 | **Dot plates to 10 with groups set apart by a clear space** (3×3, two columns of 4, 5 + 3); **ten frame flashed (5 + 2) then rebuilt**; objects hidden under a bucket; plates dabbed in two colours. | GAP (subitise `parts: true`, to 10; `pane:dice` draws 7–10 only as two rows of five). Flash-and-rebuild: MATCH `ten_frame_build` (screen: flash the stimulus). |
| 5 1 more | **Cube staircase 1–10**; potatoes placed on a large ten frame one at a time; pom-poms into a jar; **number bingo card** (2×3 grid of numerals). | MATCH `count_sequence`; staircase GAP (R23); bingo GAP (hands-on). |
| 6 1 less | Aliens / tower of 10 cubes, one removed; **green bottles on a wall**; full ten frame, one counter removed per character; counting-back book (10 then 9 pictures). | MATCH `count_sequence` back; `template:counters` `takeaway` (to 5 in sub_5_pictures) PARTIAL at 10. Tower: GAP (R24). |
| 7 Composition to 10 | **Dot plates 0–10** spread out; spinner 5–10 → collect two plates totalling it; picture-card pairs to a "magic number"; **dough domino biscuits** with sprinkles on each side; 1–6 dice top and bottom (always 7). Guide: two plates / cards together total the target → part-whole. | Bond: MATCH `template:bond` (bonds to 10, `unknown`). Two dot plates to a total: PARTIAL `pane:dice` op + (two tiles, 1–6 each) — not wired on number_bonds → `support: 'dots'`. Dominoes: GAP (R34). |
| 8 Bonds to 10 (2 parts) | Fairies on **two toadstools**, cars in **two car parks** (two boxes); **number shapes paired to make 10** and checked against the 10-piece; large ten frame chalked outdoors; pots labelled 0–10 — find two that total 10. Guide: 10 cherries shared between two; ten frame; two containers. | MATCH `composing:make_ten` (ten frame, 6 + __ = 10) and `number_bonds` (to 10). Two containers: GAP (R29). Number shapes: GAP (R31). |
| 9 Make arrangements of 10 | 10 loose eggs / pom-poms in different layouts; **ten frames with different fill patterns** (5 + 5 in rows, 3 top + 2 bottom with gaps — what does each tell us?); a bus picture with rows of dots; barrier game (10 in a circle). Guide: 10 in two boxes (5&5, 7&3, 6&4, 9&1). | PARTIAL `ten_frame_build` (fills in reading order only) and `count_objects` `orientation: 'scattered'` → `fill: 'any'` on the frame drawing (cells filled in a dealt pattern) with the two parts solid / hollow. |
| 10 Bonds to 10 (3 parts) | **Three-colour counters dropped** (red / yellow / blue); **outline of the 10-piece number shape filled with three smaller shapes**; **ducks on a log, in a pond and on grass**; a train with three carriages of dice-pattern stickers totalling 10. | PARTIAL `addition:add_three` (numbers only). **GAP** → bond `parts: 3` (Y3 R13) and a three-region mat (R30); three sets need a third ink → hatched counters (only solid / hollow / hatched are legal in B&W — confirm with the design standard). |
| 11 Doubles to 10 (find a double) | Two hoops **double / not a double** with cards (dice pairs, chick pictures, pears); **fingers — the same on each hand**; number-shape partners. | As B9 S7 (double / not-a-double cell; `pane:fingers` `hands(a, a)`, two dot tiles). |
| 12 Doubles to 10 (make a double) | Dice 1–5 → **ten frame with the top row one colour and the bottom row the same number in the other** (pair-wise); barrier game with ducks; a number shape printed twice; numeral cards 2, 4, 6, 8, 10 + **two dice faces showing the double**. Guide: one row each part, max double 5. | PARTIAL `pane:tenframe` solid + hollow (fills in reading order: 4 + 4 would wrap) → **GAP** `fill: 'rows'` (part A on the top row, part B on the bottom) on the frame drawing; `patterns:double` gains a picture. |
| 13 Explore even and odd | Number shapes 1–10 in a feely bag sorted odd / even; **vertical ten frames (2 columns × 5 rows) filled pair-wise for 1–10** — equal columns = even, one left over = odd; an odd number of cubes in a row; monster pictures. | GAP (R19 vertical pair-wise frame; R42 pairs). `composing:odd_even` is legacy (C). |

## Block 12 — Spring 6 · Explore 3-D shapes (7 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Recognise and name 3-D shapes | Solids (cube, cuboid, cylinder, sphere, cone, square-based pyramid, triangular prism) beside **everyday objects** (crisp tube, cereal box); solids sorted into hoops; feely bag. Guide: hold, roll, stack. | PARTIAL `shapes_early:name_3d_shapes`, `shape_name_match_3d` (legacy (C)) → kit outline solids (no shading beyond the single grey on one face). Object ↔ solid: GAP (`shapes_around_us`, 3-D). |
| 2 Find 2-D shapes within 3-D shapes | **Printing faces** (cylinder → circle, cuboid → rectangle); **"footprints" pressed in dough** (circle, rectangle, triangle) — which solid made it?; dough solids. | GAP → proposed `shapes_early:shape_properties_3d`, `task: 'face-print'` (a 2-D outline, circle the solid that could print it). |
| 3 Use 3-D shapes for tasks | **A ramp: which solids roll**; towers — which stack (cone on top); castle building; obstacle course (crates, tyres, ball, box). | GAP → `shape_properties_3d` `task: 'roll' \| 'stack'` (tick roll / stack / slide per drawn solid). |
| 4 3-D shapes in the environment | Box, pot of pencils, party hat, cube block; photos of real scenes; objects wrapped in paper / foil — guess the shape. | GAP → `shapes_around_us` (3-D objects drawn as line art). |
| 5 Identify more complex patterns | **AAB and ABB shape rows** (circle circle triangle …); **action patterns** clap–jump–jump, head–head–shoulders (child pictures); **cube rows AAB / ABB / ABBA / ABCD with a deliberate extra item** to find. | PARTIAL `patterns:shape_pattern` (legacy (C); has AB, ABC, ABB, AABB, ABBC but not AAB / ABBA / ABCD, and no "find the mistake") → `make_a_pattern` `unit` option (AB … ABCD, ABBA) + `task: 'fix'`. |
| 6 Copy and continue patterns | Tyres and sticks ABB outdoors; **beads along wavy, zigzag and spiral lines**; copy a book page; **frames with a fixed number of spaces** — which patterns fit exactly? Guide: at least three full units first. | As S5 (`task: 'copy' \| 'continue'`). Fixed frame of spaces: GAP (stretch: `task: 'fits'`, a closed row of N boxes). Non-straight lines: not needed on paper. |
| 7 Patterns in the environment | Zigzag wrapping paper; fabric with repeated motifs; natural objects (stick, pebble, pebble); **a pattern arranged round a circle (hoop / paper plate)** — does it fit all the way round? | GAP (`make_a_pattern` `task: 'spot'`; circle layout = stretch). |

## Block 13 — Summer 1 · To 20 and beyond (6 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Build numbers beyond 10 (10–13) | **A full 10-hole egg box + a second with 1–3** (a ten and some more); cube staircases to 13; number shapes; counting book pages. Guide: full egg box (a ten) + loose pom-poms. | MATCH `composing:teen_compose` (`objects: 'frame'`: a full ten frame and loose counters; `'blocks'`: ten rod and cubes) and `ten_frame_build_teen` (two frames). Egg box = ten frame structure. |
| 2 Continue patterns beyond 10 (10–13) | **Number track 1–13** (numbered boxes, some shaded) with a 1–3 dice to move along; numbered crates as throwing targets with tally scoring; circle counting game. Guide: number track 1–13 and a bead string. | MATCH `counting:number_seq_fill` (`template:seqstrip`) and `count_sequence` (to 20). Bead string: PARTIAL (R33). |
| 3 Build numbers beyond 10 (14–20) | **Cube towers of 10 beside the extra ones**; picture and numeral cards 14–20 (rods of ten + cubes, two ten frames, dot arrays) to match; a cityscape outline filled with number shapes. Guide: a full ten plus extra ones. | MATCH `teen_compose` (frame / blocks), `ten_frame_build_teen`. Towers of 10: PARTIAL (`blocks` rod = a ten tower; loose cube towers R24 GAP). Card match: GAP (R27). |
| 4 Continue patterns beyond 10 (14–20) | **Staircase of towers 1–20 with one tower missing**; vehicles added one at a time; **birthday cards 12–14 pegged on a line, the missing card found**. Guide: staircase of towers each one taller. | MATCH `count_sequence` / `number_seq_fill`. Staircase with a gap: GAP (R23). Picture cards: GAP (R26). |
| 5 Verbal counting beyond 20 | Ping-pong counting; legs around a circle to 30; sea creatures caught and counted; **three ten frames filled with 30 objects**, dice to take them away. Guide: verbal counting only. | Verbal: hands-on. Three frames: PARTIAL `count_objects` `objects: 'frame'` (count to 20 max) → band 30. `consolidate` review pool proposed (`counting:number_sense_review`). |
| 6 Verbal counting patterns | Fruit counted onto a ten frame / a line; **number shapes laid end to end as an own number line**; "I count, you count"; **a chalked hundred square with numbers covered** — find the missing ones. | Hundred square: MATCH `template:chartwindow` (`composing:hundreds_chart_fill`, chart to 10 / 20 / 30 / 100) (= Y3 R23). Number-shape line: GAP (R31). |

## Block 14 — Summer 2 · How many now? (4 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Add more | Fingers: 5 then 2 more; **numeral card 6 + a ten frame of double-sided counters, first colour then the added ones flipped / added**; mice added to a jar; bus stops "first, then, now"; cubes under a cloth + hidden amount added. Guide: ten frame + double-sided counters; no + / =. | MATCH `addition:add_5_pictures` (`template:counters` `join`, `objects: 'frame'` = five frame solid + hollow, to 5) and `template:wordpic` (`add_wp_10`, first/then pictures to 10). Ten-frame form beyond 5: PARTIAL (`pane:tenframe` solid + hollow, not wired). No-symbol sentence: `sentence: 'words'` option GAP. |
| 2 How many did I add? | **Marbles in a jar shown on a ten frame in red, yellow counters added until the total** (yellow = how many added); boat characters join; a hidden numeral card + a pile of cubes; green bottles 7 + ? = 10 with a ten frame and separate counters. | PARTIAL `add_wp_10` (asks for the total only). **GAP** → `unknown: 'change'` on add_wp_10 / add_5_pictures (start drawn solid, empty cells to reach the total, "how many were added?"); `make_ten` covers the special case "to 10". |
| 3 Take away | Fingers 5, fold 1; **ten frame of 3 counters with 3 removed** (counters pushed off beside the frame); currant buns bought; pirate treasure coins stolen. Guide: remove, then count or subitise what is left. | MATCH `subtraction:sub_5_pictures` (`template:counters` `takeaway`, bold X; `objects: 'frame'` five frame) and `sub_wp_10`. Removed-beside-the-frame look: PARTIAL (we cross out in place, a documented house style). To 10 in a frame: PARTIAL (`pane:tenframe` op −, not wired). |
| 4 How many did I take away? | Towers of cubes start / now; train carriages, people get off; beach scene + numeral card 8; **Ten Little Ducks: 10 at the start, some swam away, 7 left — ten frame + separate counters**. Guide: build the start, remove until it matches "now" — the gap = how many taken. | **GAP** → `unknown: 'change'` on sub_wp_10 / sub_5_pictures (start and now pictures, "how many went away?"). |

## Block 15 — Summer 3 · Manipulate, compose and decompose (8 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Select shapes for a purpose | **"Which one doesn't belong?" — four shapes** (two squares, a turned square, a rectangle; any reasoned choice); sandwich shapes on a plate; a crate car; **a pattern-block picture beside its outline template** to recreate. | GAP → `comparing:odd_one_out` with shapes (no single key: the key prints "any, with a reason" — needs the Reason It role); template: R54. |
| 2 Rotate shapes | Hold up a shape, find the match among **rotated copies**; number shapes fitting **outlines drawn in different orientations**; **pattern-block templates: a coloured picture, then outline only**; visualise a cube model after a flip and pick the matching picture of three. | GAP → `shapes_early:compare_two_shapes` / `name_2d_shapes` `task: 'same-turned'` (circle the shape that is the same, turned); `template:shape-fill` (R54). Cube-model visualising: GAP (low; isometric drawing). |
| 3 Manipulate shapes | Tangram pieces; **outline templates of pictures to complete**; **a star outline filled with pattern blocks** different ways; postboxes with shaped openings in three orientations; a tangram bird. | PARTIAL `shapes_early:compose_shapes`, `compose_hexagon` (legacy (C); multiple choice / compose blocks) → **GAP** kit `template:shape-fill` (outline + piece set; draw / cut-and-place; key = one tiling). |
| 4 Explain shape arrangements | Shapes dropped on the floor — describe where each is; obstacle course; **a gummed-shape house picture**; barrier game (describe your arrangement to a partner). | PARTIAL `shapes_early:shape_positions` (legacy (C)) → a shape picture with "the ___ is under / next to the ___" frames. Barrier game: hands-on. |
| 5 Compose shapes | **A triangle outline built from 2, 3, then 4 triangles**; number rods arranged to build squares; **a 6×6 square outline filled with number shapes** (roll a dice). | PARTIAL `compose_shapes`, `compose_hexagon` (legacy (C)) → `template:shape-fill` `pieces: 2..4`. |
| 6 Decompose shapes | **Two right-angled triangles cut from a rectangle, rearranged** (new triangle, parallelogram, back to the rectangle); a square cut into pieces; quilt squares arranged into long / short rectangles; a picture cut into jigsaw pieces. | PARTIAL `compose_shapes` → GAP `task: 'split'` (draw a line to cut the shape into two named shapes; key = the line). |
| 7 Copy 2-D shape pictures | **A picture made of shapes (a street of houses, a tree)** to copy; pattern-block caterpillar / flower to copy; **two shape pictures — spot what is the same and different**. | GAP → proposed `shapes_early:build_and_copy` (model picture beside an empty frame; tick the matching copy / spot differences). |
| 8 Find 2-D shapes within 3-D shapes | Tablet photos of faces (a door rectangle); feely bag; a box robot; **two hoops: "has a rectangular face" / "has not"**. | GAP (as B12 S2; sort rings R04). |

## Block 16 — Summer 4 · Sharing and grouping (6 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Explore sharing | **Two plates of strawberries, one clearly more (3 vs 6) — is it fair?**; dough balls of different sizes; cards dealt unequally round a circle; conkers into two tyres. Guide: dealt one for you, one for me; fair vs unfair. | **GAP** → proposed `division:share_and_group_early`: 2–4 outline plates with objects drawn on them; `task: 'fair'` (check box fair / not fair). |
| 2 Sharing | **Teddies with plates, food shared out** (leftovers?); quoits shared between players; **12 cookies shared between 2, 3, 4 people**. Guide: dealt one for each teddy. | GAP (as S1, `task: 'share'`: n objects drawn loose, draw them onto the plates; "each gets ___", leftovers allowed). `template:counters` `share` is grouping-by-size (below), not dealing into a given number of plates. |
| 3 Explore grouping | Stickers 3 each; **pencils 3 to a pot (four pots)**; **sheep into fields, groups of 2 or 3**; plates and crackers. Guide: groups of a stated size, count the groups. | MATCH `template:counters` kind `share` (`division:share_into_groups`: counters in runs of the group size to ring, "[ ] groups of d") — grade-3 skill, numbers to 20 → PARTIAL for Reception band (≤ 10–12) and picture objects (`objects: 'pictures'`). |
| 4 Grouping | Relay teams of 4; **3 seeds per plant pot**; 3 buttons on each gingerbread biscuit; **12 cubes into towers of 2** — how many towers? Guide: objects placed into containers so groups are distinct. | As S3; containers drawn = GAP (`share_and_group_early` `task: 'group'`, outline pots). |
| 5 Even and odd sharing | Numeral card → counters **shared into two groups on a mat**, sorted into odd / even hoops; potions of natural objects in two cauldrons; beans shared between two; 30-second collect, then share into two hoops. | GAP (share into 2, `task: 'fair'` → odd / even check box; R42 pairs). |
| 6 Play with and build doubles | **Double bingo grid** + numeral card; **1–5 spinner → build a double with towers or draw spots on a blank domino**; **caterpillar track of doubles 2, 4, 6, 8, 10**; a "doubles town" small world. Guide: two equal towers, two equal groups, a domino. | PARTIAL `doubles_near_doubles` (legacy (C)), `patterns:double` → blank domino to complete: GAP (R34 `task: 'make-double'`). Caterpillar: MATCH-ish `seqstrip` (`circle` tiles). |

## Block 17 — Summer 5 · Visualise, build and map (11 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Identify units of repeating patterns | **A button line with each unit pulled apart** (pairs separated by gaps); a row of children's arm movements; bead lines ABB; photos of patterns that start mid-unit. Guide: move each unit down from the line. | GAP → `make_a_pattern` `task: 'unit'` (circle / ring the part that repeats; key draws the rings). |
| 2 Create own pattern rules | A puppet's cube line (what is the rule?); **beads on a string (ABC)**; a fruit line; **a pattern round a paper plate** with more than one possible unit. | GAP (`make_a_pattern` `task: 'make'`: a given unit, empty boxes to continue; the rule stated in words). |
| 3 Explore own pattern rules | **Tyres and crates ABB in a line, and the same rule redrawn with shapes in sand** (same rule, different objects); sound patterns; beach items; **a pattern on the inside of a plate repeated round the outside**. | GAP (`make_a_pattern` `task: 'translate'`: the same rule in shapes; stretch). |
| 4 Replicate and build scenes and constructions | Small-world town mat to copy; fairy town scene; large construction (crates, plank, hoop, tyres); junk-model houses picture to recreate. Guide: built one object at a time. | GAP (hands-on; `build_and_copy` is the paper companion). |
| 5 Visualise from different positions | A small-world zoo scene (look from each side); a block castle from different sides; **photos from unusual viewpoints** (from under a tree); a scene inside a clear cube. | GAP (low; would need drawn viewpoints — `build_and_copy` `task: 'view'`). |
| 6 Describe positions | **Photos of familiar places** (school, park, shop shelves) — describe where things are; a bear-hunt cave scene; **a street illustration** with houses and people. | PARTIAL `shape_positions` (legacy (C)) → proposed `shapes_early:position_and_maps` (a line-drawn scene, where-is questions with a position word bank). |
| 7 Give instructions to build | **Two identical sets of animals** arranged the same way; houses built from a description; **a plan drawing of a model on a board → build it brick by brick**; a fantasy house plan. Guide: two matching sets with a barrier. | GAP (hands-on; plan-to-model = `build_and_copy`). |
| 8 Explore mapping | **A story map** (roads, trees, houses from above); **an aerial map of the local area**; a world map with animals placed; maze maps. Guide: aerial map beside a photo / model of the same place. | GAP → `position_and_maps` (a simple picture map on a square grid; find and name landmarks). |
| 9 Represent maps with models | **A line-plan map of the school and area**; a farm map rebuilt as a model; **a maze (paths and walls)**; a street of junk-model houses. | GAP (`position_and_maps`; maze = stretch). |
| 10 Create own maps from familiar places | **A simple linear route map** (home → trees → park → school along a road, dashed path); **a treasure map with X**; a classroom map built from photos; **a bird's-eye plan of one room**. Guide: linear road built landmark by landmark. | GAP (`position_and_maps` `task: 'route'`: order the landmarks passed; draw-your-own = blank frame). |
| 11 Create own maps and plans from story situations | Farmyard scene; a story map showing a journey; an alternative-ending route map; own island story maps. Guide: story map + small-world scene. | GAP (as S10; drawing task). |

## Block 18 — Summer 6 · Make connections (2 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Deepen understanding | Foil boats holding marbles (predict, test, change); **animal legs recorded by drawing counters on a ten frame** (fill the frame first to win; one or two frames); tuff-tray number stories; how-many-legs stories. | Ten frame recording: MATCH `ten_frame_build` / `ten_frame_build_teen`. Investigation: hands-on. `counting:number_sense_review` (proposed) for the review page. |
| 2 Patterns and relationships | **Number rods** (Cuisenaire-style): how many of one rod make another, which is double; **construction blocks making stairs** (short vs long); a crate bridge problem; planning. Guide: rods lined up from a shared start. | **GAP** → `objects` kind `rods` (outline rods of lengths 1–10 on a common start, "___ of these make one of those") — low priority; stairs = R23. |

---

## Every Reception representation (de-duplicated)

"Where" lists the blocks/steps that use it. Status is the best match across the app.

| # | Representation | Where (R) | Status | Existing / proposed |
|---|---|---|---|---|
| R01 | Match the same: target + line-up / two columns to join | B1 S1–S2 | GAP | proposed `counting:match_same` (`hands-match` tag exists, no K cell) |
| R02 | Memory / snap picture cards (face-down grid) | B1 S2; B5 S1; B7 S3 | GAP | hands-on card page (low) |
| R03 | Odd one out / which one doesn't belong / incomplete set | B1 S3, S6; B15 S1 | GAP | proposed `comparing:odd_one_out` (Reason It key for open answers) |
| R04 | Sorting rings / hoops ("yes / not", by attribute, 0 / not 0, 4 sides / not) | B1 S4–S6; B4 S1; B5 S1; B6 S1, S4; B7 S2; B10 S1; B11 S1; B15 S8 | PARTIAL | `classify_count` (`counters` `sort`, counts one kind); `hands-sort` tag → new `template:sort-rings` + proposed `comparing:sort_into_groups` (≈ Y3 R59, R43) |
| R05 | One-to-one lines of two sets (more / fewer / same) | B1 S7; B11 S2 | MATCH | `template:compare` (`compare_groups`, aligned 2×5 frames, `objects`) |
| R06 | Cube towers side by side to compare | B1 S7; B11 S2 | PARTIAL | `compare_objects` towers (no unit cubes) → `objects` kind `cubes` (= Y3 R41) |
| R07 | Same object at two / three sizes (big / small) | B2 S1 | GAP | proposed `comparing:compare_size` |
| R08 | Pan balance tipped / level (objects; cubes as the unit; number shapes) | B2 S2; B8 S1–S2 | GAP | `heavier_lighter_visual` is emoji, no balance → `template:balance` (= Y3 R50) + proposed `measurement:balance_scales` |
| R09 | Unscaled containers: full / empty / nearly; holds more; count cupfuls | B2 S3; B8 S3–S4 | GAP | proposed `comparing:compare_capacity` (single-grey fill level; ≈ Y3 R51 without a scale) |
| R10 | Lengths compared / ordered with ends aligned (ribbons, worms, lines) | B2 S1; B10 S1–S2 | MATCH | `comparing:compare_objects` (length); order three PARTIAL `order_objects_length` (legacy (C)) |
| R11 | Heights compared on one floor line (towers, children) | B2 S1; B10 S3–S4 | MATCH | `compare_objects` (height, common baseline) |
| R12 | Non-standard units beside an object (cube train, paperclip chain, blocks) | B10 S2, S4; B8 S2 | PARTIAL | `shapes_early:measure_nonstandard` (legacy (C)) → kit cell, `orientation` h / v |
| R13 | Dot plate: 0–10 dots in varied arrangements, flashed | B3 S2; B5 S2; B7 S3, S6; B9 S1; B11 S4, S7 | PARTIAL | `pane:dice` / `counters` `objects: 'dice'` (dice 1–6; 7–10 as rows of five) → proposed `counting:subitise` `arrangement`, round plate |
| R14 | Two-part dot plate (groups apart / two colours); ring the parts | B7 S7–S8; B9 S10; B11 S4 | GAP | subitise `parts: true` (solid vs hollow, LS-5), `task: 'ring-parts'` |
| R15 | Fingers (one hand, 5 + n on two hands, fist = 0) | B3 S2; B5 S2–S3; B7 S3–S4; B9 S7; B11 S1, S3, S11; B14 S1, S3 | PARTIAL | `pane:fingers` (1–10, not wired; no 0) → `fingers` value in the `objects` control |
| R16 | Dice faces 1–6 | B3 S2; B5 S1–S2; B7 S3; B9 S1, S7; B11 S7, S12 | MATCH | `counters` `objects: 'dice'`, `compare` dice, `pane:dice` |
| R17 | Five frame (1×5) with counters | B3 S3; B5 S2–S6; B7 S1, S4 | MATCH / PARTIAL | `make_ten` "Make 5", `add_5_pictures` / `sub_5_pictures` `objects: 'frame'`; build task has no five frame → `frame: 'five'` on `ten_frame_build` |
| R18 | Ten frame (2×5) filled five-wise; egg box of 10 | B9 S2–S4; B11 S1, S3, S5–S6, S8; B13 S1; B18 S1 | MATCH | `template:tenframe` (`ten_frame_build`), `counters` `objects: 'frame'`, `pane:tenframe` (= Y3 R09) |
| R19 | Vertical ten frame / pair-wise fill (odd–even, doubles) | B3 S4–S5; B9 S6, S8; B11 S13 | GAP | `orientation: 'vertical'` + `fill: 'pairs'` on the frame drawing |
| R20 | Ten frame of two sets (start + added; doubles one row each; any-order fills) | B9 S9; B11 S9, S12; B14 S1–S2 | PARTIAL | `pane:tenframe` solid + hollow (not wired; reading order only); `add_5_pictures` five frame → `fill: 'rows' \| 'any'` |
| R21 | Ten / five frame take-away (counters removed or crossed) | B5 S5; B9 S4; B11 S6; B14 S3 | MATCH / PARTIAL | `sub_5_pictures` frame (to 5); `pane:tenframe` op − (to 10, not wired) |
| R22 | Two-colour (double-sided) counters dropped: part-part-whole; three colours | B3 S6; B5 S6; B7 S8; B11 S10 | PARTIAL | solid vs hollow two sets (LS-5) in `pane:objects` / `pane:tenframe`; three sets need a third fill (hatched) |
| R23 | Cube staircase (towers 1…n each one taller, one missing) | B3 S4–S5; B5 S4; B7 S5–S6; B9 S3–S4; B11 S5; B13 S4 | GAP | `objects` kind `cubes`, `model: 'staircase'` on `count_sequence` |
| R24 | Linking-cube towers (count, ±1, two-colour parts, 10 + ones) | B3 S4–S5; B5 S1, S6; B11 S6; B13 S3; B16 S4 | GAP / PARTIAL | `objects` kind `cubes` (= Y3 R41); teen: `teen_compose` `objects: 'blocks'` |
| R25 | Number track (1–5 … 1–20; under a frame; game track; one hidden) | B5 S4; B7 S3; B9 S9; B11 S3; B13 S2, S4 | MATCH | `template:seqstrip` (`number_seq_fill`), `count_sequence` path, `count-row`; tiles box / circle / hex (= Y3 R22) |
| R26 | Washing line of picture / numeral cards in order, one missing | B5 S2; B7 S5; B9 S1; B13 S4 | PARTIAL | `seqstrip` numerals only → `tiles: 'pictures'` |
| R27 | Representation cards matched / sorted to a number (numeral, dice, fingers, tally, frame, pictures) | B3 S1; B5 S1; B7 S2; B9 S1; B11 S1; B13 S3 | GAP | `count_objects` `task: 'match'` (draw a line; `hands-match`) |
| R28 | Tally sticks in rep cards | B3 S1; B5 S1; B7 S2 | PARTIAL | `graphs:tally_chart` (legacy) — low |
| R29 | Part-part in two places (two fields, ponds, pens, toadstools, wings, in / out of a hoop) | B3 S6; B5 S6–S7; B9 S5, S8; B11 S8 | GAP | two-region mat (outline split by a line / ring), `support` on `number_bonds` (≈ Y3 R12 pictures in the bond) |
| R30 | Three parts (log / pond / grass; three-colour counters; 10-piece filled with three) | B11 S10 | GAP | bond `parts: 3` (= Y3 R13), three-region mat; `add_three` numbers only |
| R31 | Number shapes (Numicon-style plates 1–10: holes in a two-column pattern) | B5 S7; B8 S1–S2; B9 S7; B11 S8, S10, S13; B13 S1, S6; B15 S5 | GAP | `objects` kind `numbershapes` (outline plate with hole circles) |
| R32 | Number rods (Cuisenaire-style) | B15 S5; B18 S2 | GAP | `objects` kind `rods` (low) |
| R33 | Bead string of 10 / 20 | B11 S3; B13 S2 | PARTIAL | `pane:rekenrek` (two rows of ten) → `pane:beadstring` `n: 10 \| 20 \| 100` (≈ Y3 R07) |
| R34 | Dominoes (spots each side; totals; blank to complete a double) | B3 S6; B9 S5, S9; B11 S2, S7; B16 S6 | PARTIAL | `pane:dice` op + (two tiles) → `objects` kind `domino` (one tile, two halves) |
| R35 | Two / three ten frames (teens; 30 objects) | B13 S1, S3, S5 | MATCH / PARTIAL | `ten_frame_build_teen`, `teen_compose`, `count_objects` frame (to 20; 30 PARTIAL) |
| R36 | Hundred square (cover / find missing) | B13 S6 | MATCH | `template:chartwindow` (`hundreds_chart_fill`, charts 10–100) (= Y3 R23) |
| R37 | Spinner / dice track game | B3 S2; B7 S3; B9 S3; B13 S2; B16 S6 | GAP | hands-on game page (low) |
| R38 | Bingo grid of numerals | B11 S5; B16 S6 | GAP | hands-on (low) |
| R39 | Doubles: two identical groups (two dice, hands the same, mirrored spots, butterfly wings); double / not a double | B9 S7–S8; B11 S11–S12; B16 S6 | PARTIAL | `doubles_near_doubles` (legacy (C)), `patterns:double` (text); `pane:dice` / `pane:fingers` pairs → kit double / not-a-double cell |
| R40 | Caterpillar board (numbered circles in a row) | B9 S7; B16 S6 | MATCH | `seqstrip` `circle` tiles |
| R41 | Pairs for odd / even (socks, animals, cubes in pairs; one left over) | B9 S6; B11 S13; B16 S5 | PARTIAL | `composing:odd_even` (legacy (C)) → `layout: 'pairs'` on `template:counters` |
| R42 | Sharing onto plates (dealt; fair / unfair; leftovers) | B16 S1–S2, S5 | MATCH | `template:share-plates` (`division:share_and_group_early`: share, fair / not fair, left over; plates or rings) |
| R43 | Grouping into containers of a stated size | B16 S3–S4 | MATCH | `template:share-plates` `group` (`division:share_and_group_early`: groups of 2-5 to 10, 20, 30); also `template:counters` `share` (`share_into_groups`) |
| R44 | Zero / empty set (empty plate, bare tree, empty bus, empty frame, blank card) | B7 S1–S3 | GAP | proposed `counting:zero_none` |
| R45 | First–then–now story pictures (join / take away) | B14 S1–S4; B9 S9 | MATCH / PARTIAL | `template:wordpic` (`add_wp_10`), `counters` `join` / `takeaway`; change-unknown GAP (`unknown: 'change'`) |
| R46 | Hidden part (under a bowl / cloth / blanket; fingers show it) | B3 S6; B5 S7; B11 S4; B14 S1 | GAP | a covered-part mark (outline "cloth" box with ?) on bond / counters |
| R47 | Take-away objects crossed out | B3 S5; B14 S3 | MATCH | `template:counters` `takeaway` (= Y3 R32) |
| R48 | 2-D shapes (circle, triangle, square, rectangle) varied size and orientation | B4 S1–S2; B6 S1; B15 S2 | PARTIAL | `name_2d_shapes`, `shape_corners_count`, `count_sides_vertices_2d` (legacy (C)); outlines exist in k2kit `SHAPES` |
| R49 | Shapes in the environment (everyday objects; find shapes in a scene) | B4 S3; B6 S3; B12 S4 | GAP | proposed `shapes_early:shapes_around_us` (line art, never photos) |
| R50 | Compare two shapes (same / different; "almost" triangles) | B4 S2; B15 S2 | PARTIAL | `shape_attributes` (legacy (C)) → proposed `shapes_early:compare_two_shapes` |
| R51 | Outline template to fill with pieces (pattern blocks, tangram, 4-sided shapes; picture vs outline) | B6 S2; B15 S1–S3, S5 | PARTIAL | `compose_shapes`, `compose_hexagon`, `compose_rect_from_squares` (legacy (C)) → `template:shape-fill` |
| R52 | Decompose a shape (rectangle → two triangles; cut a square) | B6 S2; B15 S6 | PARTIAL | `compose_shapes` → `task: 'split'` |
| R53 | Shape picture to copy / spot same and different | B15 S4, S7; B17 S4 | GAP | proposed `shapes_early:build_and_copy` |
| R54 | 3-D solids beside everyday objects | B12 S1, S4 | PARTIAL | `name_3d_shapes`, `shape_name_match_3d` (legacy (C)) |
| R55 | Face prints / footprints of 3-D shapes | B4 S2; B12 S2; B15 S8 | GAP | proposed `shapes_early:shape_properties_3d` `task: 'face-print'` |
| R56 | Roll / stack (ramp, towers) | B12 S3 | GAP | `shape_properties_3d` `task: 'roll' \| 'stack'` |
| R57 | Repeating pattern row (AB, AAB, ABB, ABC, AABB, ABBA, ABCD; continue, copy, fix) | B2 S5–S6; B12 S5–S7; B17 S2–S3 | PARTIAL | `patterns:shape_pattern` (legacy (C): colour = element; no AAB / ABBA / fix) → proposed `patterns:make_a_pattern` (shape / kind only) |
| R58 | Action / sound pattern pictograms | B2 S4, S6; B12 S5 | GAP | low (`actions` picture set) |
| R59 | Unit of repeat pulled apart / ringed | B17 S1 | GAP | `make_a_pattern` `task: 'unit'` |
| R60 | Pattern round a circle / in a frame of fixed spaces (does it fit?) | B12 S6–S7; B17 S2–S3 | GAP | `make_a_pattern` `task: 'fits'` (stretch) |
| R61 | Position picture (teddy under / beside / behind; describe arrangement) | B4 S4; B15 S4; B17 S6 | PARTIAL | `shape_positions` (above / below / beside, legacy (C)) → word bank in / on / under / next to / behind / in front |
| R62 | Viewpoints; barrier game; plan drawing → model | B15 S4; B17 S4–S5, S7 | GAP | hands-on; `build_and_copy` `task: 'view'` (low) |
| R63 | Maps: story map, aerial map, linear route, maze, treasure X, room plan | B17 S8–S11 | GAP | proposed `shapes_early:position_and_maps` |
| R64 | Day / night picture sort; visual timetable (sequence cards first–next–then) | B6 S4; B10 S6 | GAP | proposed `measurement:order_events` |
| R65 | Week strip Mon–Sun with events | B10 S6 | GAP | `span: 'week'` on the Y3 calendar proposal (≈ Y3 R66) |
| R66 | Sand timer; then / now photos | B10 S5 | GAP | proposed `measurement:time_words` (low) |
| R67 | Objects to count in rows / lines / scattered (pictures, shapes) | every number block | MATCH | `counting:count_objects` (`objects`, `orientation` rows / line / scattered, to 20) |

**Counts (67 representations):** MATCH 10 · MATCH/PARTIAL 4 · PARTIAL 21 · GAP/PARTIAL 1 · GAP 31.
Of the PARTIAL rows, about 8 close by **wiring existing K panes** as `support` / `objects` values
(R13, R15, R20, R21, R33, R34, R39 — `pane:dice`, `pane:fingers`, `pane:tenframe`, `pane:rekenrek`) —
the same finding as Year 3: the pictures are drawn, the options are not offered. About 9 are **legacy
coloured visuals** that need the kit B&W migration (shapes R48, R50–R52, R54, R61; patterns R57;
odd/even R41; doubles R39; measure R12).

**Suggested build order (by Reception reach × effort):**
1. **Wire the K panes** — add `fingers` to the `objects` vocabulary; `support: 'frame' | 'dots'` on
   `number_bonds`, `count_sequence`, `add_wp_10` / `sub_wp_10`; raise `pane:tenframe` two-set and take-away
   forms to 10 on the picture add/sub skills. No new drawing. Touches B3–B14 (≈ 45 steps).
2. **`counting:subitise`** (dot plate: arrangement option, `parts` solid / hollow, ring the parts,
   flash on screen) + **frame fills** (`frame: 'five'`, `orientation: 'vertical'`, `fill: 'pairs' |
   'rows' | 'any'`) — every "Subitise", "Represent", odd/even and doubles step (≈ 20 steps).
3. **New `objects` kinds** `cubes` (towers, staircase), `numbershapes`, `domino` (and later `rods`) —
   shared with Y1–Y3 (cube towers = Y3 R41).
4. **`patterns:make_a_pattern`** in kit B&W (units AB … ABCD, ABBA; copy / continue / fix / unit / make)
   — replaces the coloured `shape_pattern` for K (B2, B12, B17: 11 steps).
5. **Early measures**: `template:balance` (shared with Y3), `compare_capacity`, `compare_size`,
   non-standard-unit kit cell (B2, B8, B10: 11 steps).
6. **Matching and sorting**: `match_same`, `odd_one_out`, `template:sort-rings` / `sort_into_groups`,
   `zero_none`, count `task: 'match'` (B1, B7 and every "Find N" step).
7. **Sharing / grouping** `share_and_group_early` (plates, pots, fair / not fair) and change-unknown
   `unknown: 'change'` on the K word problems (B14, B16).
8. **Shape and space in kit B&W**: migrate `name_2d_shapes` / `name_3d_shapes` / `shape_positions` /
   `compose_shapes`, then `shapes_around_us`, `compare_two_shapes`, `shape_properties_3d`,
   `template:shape-fill`, `build_and_copy`, `position_and_maps`, `order_events` (B4, B6, B12, B15, B17:
   ≈ 30 steps, mostly hands-on in WRM — lowest print priority per step, but the largest block of GAPs).

---

## Representations NEW relative to Year 3

Year 3's table (R01–R84) has none of these; they are Reception-first and most recur in Year 1:
dot plates with varied and two-part arrangements (R13, R14) · fingers (R15) · dice faces as a count
picture (R16) · five frame (R17) · vertical / pair-wise ten frame (R19) · ten frame of two sets filled
by rows or in any order (R20) · two- and three-colour counters as parts (R22) · cube staircase (R23) ·
washing line of picture cards (R26) · representation-card matching (R27) · part-part in two places /
two-region mats (R29) · three-region mats (R30) · number shapes (R31) · number rods (R32) · bead
string of 10 / 20 (R33, a short form of Y3 R07) · dominoes (R34) · spinner / bingo games (R37, R38) ·
doubles pictures (R39) · pairs for odd / even (R41) · sharing onto plates (R42) · zero / empty set
(R44) · first–then–now pictures with change unknown (R45) · hidden part (R46) · match the same (R01) ·
memory cards (R02) · odd one out (R03) · sorting rings (R04, a single-set cousin of Y3's Venn R43 /
sort table R59) · one-to-one comparison of two sets (R05) · big / small (R07) · unscaled containers
full / empty (R09) · length and height compared directly (R10, R11) · non-standard units (R12) ·
2-D shapes in varied orientation (R48) · shapes in the environment (R49) · compare two shapes (R50) ·
shape-fill outlines, pattern blocks, tangrams (R51) · decompose a shape (R52) · copy a shape picture
(R53) · 3-D solids with everyday objects, face prints, roll / stack (R54–R56) · repeating patterns with
AAB / ABBA / ABCD, unit of repeat, fixed frame (R57–R60) · action pictograms (R58) · position pictures
(R61) · viewpoints / barrier / plans (R62) · maps (R63) · day / night sort and visual timetable (R64)
· week strip (R65) · sand timer / then–now (R66).

Shared with Year 3 (same drawing, lower range): ten frame (R18 = Y3 R09), number track (R25 = Y3 R22),
hundred square (R36 = Y3 R23), crossed-out take-away (R47 = Y3 R32), cube towers (R24 = Y3 R41),
pan balance (R08 ≈ Y3 R50), containers (R09 ≈ Y3 R51), grouping runs (R43 ≈ Y3 R40), part-whole with
pictures / three parts (R29, R30 ≈ Y3 R12, R13), bead string (R33 ≈ Y3 R07), week strip (R65 ≈ Y3 R66).

---

## Method notes (Reception-specific; add to the pilot's)

**What to open per step.** Reception's `NN Step N <title>.pdf` (0.5–1.5 MB) has **two pages**, and only
**page 2 ("Adult-led learning")** carries pictures; it is the page to render (pilot `multi.py` default
of "pages 2 to end" still works). Page 1 is notes, key questions and sentence stems — useful context
but already summarised by the Teaching Guide. The guide's "Key model" line is the best single source
for the representation the lesson leans on, and its "Avoid" line records what Reception deliberately
holds back (no + / − / = signs, no part-whole diagram before Spring, no units, no left / right) — these
become option defaults, not gaps.

**Slides.** The pupil-facing pictures are in the teaching decks (4–8 MB `.pptx`; `R.B17.S11` is 10.3 MB,
over the cap). They cannot be rendered here (`soffice` is installed but fails to load the decks
headless), but the embedded images can be pulled straight from the zip (`ppt/media`, per slide via
`ppt/slides/_rels`) and tiled — `media.py` in the working directory does this. Sampled on 14 decks:
dot plates, fingers, vertical ten frames and cube staircases come through as images; **shapes, frames
and counters drawn as PowerPoint shapes do not**, so the sample confirmed but did not extend the key
model lines. Not worth doing for every deck; the guide + p2 already name the model.

**Pitfalls seen this run.**
- **Parallel agents share one tool-results folder.** The pilot's `decall.py` decodes and deletes
  *every* saved download, so an agent running it swallows other agents' files (lost here: 4 files,
  re-downloaded). Decode only your own files: match the JSON `id` against the step's Drive ids
  (`dec.py` here builds `ids.json` from `wrm-steps.json` and ignores the rest).
- Same-millisecond filename collisions still happen (5 this run) — the decoder reports missing ids
  per block from `ids.json`, so a re-download is one call.
- Downloading several 5–8 MB decks in one parallel batch expired the Drive MCP session three times;
  keep slide downloads to one or two per batch (guides and 1 MB PDFs are fine at 10–16 per batch).
- PyMuPDF `Pixmap.copy` tiling crashed (double free) on one PDF; composing pages with
  `Page.show_pdf_page` onto one big page and rendering once is robust (`multi.py` here).

**Cost.** 119 steps: ≈ 280 downloads (guides, PDFs, 14 decks) in ≈ 35 batches, 20 contact-sheet reads.
