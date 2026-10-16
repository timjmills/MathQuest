# MAP Growth builds still to make (owner 2026-10-10: "also add the builds yet to be built for MAP test")

Goal: one complete, checked list of every skill or option MathQuest still needs so pupils can practise every MAP Growth
math (K–5, RIT bands up to ~230) task type, written as build proposals in the SAME shape the Wave 2 taggers use
(design/audit/runs/wrm-tagging/BRIEF.md "Output" → `proposals`), so the lead merges them into the one build list.

## Sources
- design/MASTER_PLAN.md Wave 6.2 (the MAP task table: exists / partial / missing) and 6.4 (two-representation "match the
  two" audit: picture↔equation, model↔number, graph↔sentence, story↔operation, shape↔property, number line↔number,
  clock↔time words, array↔multiplication) and 6.3 (seven MAP practice strands).
- The MAP engine: js/modules/map-engine.js, teacher-map.js, data.js MAP_DOMAIN_CATEGORIES / MAP_BAND_MIDPOINTS and the
  RIT-band skill lists.
- Public NWEA material for MAP Growth Math 2–5 / K–2 (the learning continuum, published sample/practice items, item-type
  descriptions). Use them for WHAT is tested and HOW it is answered (drag, select, number entry, graph, multi-select);
  never copy items into the repo.
- Existing proposals to REUSE before inventing: js/modules/wrm.js WRM_PROPOSALS, js/modules/build-list.js
  (STANDARD_PROPOSALS, WRM_EXTENSIONS, VISUAL_BUILDS), design/BUILD_LIST.md, and any data/curriculum/links/*.json present.

## Do
1. Re-check every Wave 6.2 row against the code TODAY (skills may have been built or changed since 2026-10-02): status
   exists-ok / exists-regrade / partial / missing, with the skill keys. Generate items to see what a skill really deals.
2. Walk the MAP strands and RIT bands for K–5 and list every task type MAP asks that has no matching skill/option — beyond
   the 6.2 table (e.g. MAP's on-screen answer forms: drag to a number line, select all that apply, build a bar/picture
   graph, click a point, choose the equation for a story).
3. Do the 6.4 audit: for each strand and each representation pair, is there a "match the two" form? If not, propose it
   (option on an existing skill when the content fits, else a new skill).
4. For each gap write a proposal: { kind, skill, option?, name, teaches, representation (in OUR B&W boxed-cell design,
   WORKSHEET_DESIGN_STANDARD.md, and the screen answer mode — a MAP drag item is never turned into multiple choice when a
   production form fits), family, ccss:[codes], map:{strand, ritBand:"e.g. 181-190", taskType}, why, reused:true|false }.
   Reused ids keep their id and only add the `map` facet.
Output: `data/curriculum/links/MAP.json` = { "generatedBy":"map-audit", "rows":[{ task, strand, ritBand, status, skills:[keys],
proposal?: id }], "proposals": { id: {...} } } and `design/audit/runs/wrm-tagging/MAP-report.md` (counts; the 6.2 table
re-verified; new gaps; owner questions with suggested answers). Do NOT edit wrm.js / build-list.js / standards*.js.
A critic grades a sample (≥ 8/10): correct status, real MAP task types (not invented), proposals that would close the gap.
