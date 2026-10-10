# Wave 2 tagging — every WRM small step: its skills, pre-skills, related skills, and what must be built (owner 2026-10-10)

Owner: "continue to build and find all the skills, related skills, prerequisites. If they need to be built, identify what
skill needs to be built to fully cover the skill and write it in as a skill to still be built." This is MASTER_PLAN Wave
2.1–2.3 (read design/MASTER_PLAN.md Wave 2 and 3.4). The White Rose page (Wave 3.4, being built in another lane) READS
your output, so the format below is a contract — do not change it.

## Your scope
One or more WRM years (given in your prompt). Every small step in data/curriculum/wrm-steps.json for those years
(R=PK, Y1=K, Y2=G1, Y3=G2, Y4=G3, Y5=G4, Y6=G5), in block order, none skipped. The school's order and its weekly
PRIOR-LEARNING lists are in data/curriculum/source/Awsaj-Domain-Sequence-K-5-2026-27.xlsx (one sheet per grade; 15th
column on the first lesson of each week; prefixes Rec/PK4=R, Y1/KG=Y1, Y2/Gr.1=Y2 …; python3 + openpyxl is installed);
the grade handbooks/pacing PDFs are beside it. Use them.

## For each step, decide (read the skills, do not guess from names)
Know the skills: design/SKILL_CATALOGUE.md (generated, every skill, what it supplies), js/modules/data.js labels,
js/modules/skill-options.js (a skill's options — a ladder step is a skill + options), the gen-*.js generator for what it
really deals (you may generate items: `node` + generateQuestionFor, or the ws-content-audit sampler), js/modules/wrm.js
SKILL_WRM (existing tags), js/modules/standards.js SKILL_STANDARDS, design/catalogue/<family>.md, design/BUILD_LIST.md.
1. DIRECT skills: skills (optionally with option values) that teach THIS step. Verify existing SKILL_WRM tags (wrong tag →
   list it in `tagFixes`), add missing ones. Mark `partial` with the missing clause when a skill teaches only part.
2. VERDICT: `full` (one or more skills, with their options, teach every part of the step's title AND its WRM lesson intent —
   read the step's CCSS + note in wrm-steps.json), `partial`, or `gap` (no skill).
3. BUILD: when not `full`, name what must be built to make it full — a NEW skill or an OPTION on an existing skill — as a
   proposal. FIRST search existing proposals (js/modules/wrm.js WRM_PROPOSALS, js/modules/build-list.js STANDARD_PROPOSALS /
   WRM_EXTENSIONS / VISUAL_BUILDS, design/BUILD_LIST.md) and REUSE an existing id when it fits (add this step to it in your
   output; never duplicate). Only then invent a new proposal id. A proposal follows the existing WRM_PROPOSALS shape:
   { kind:'new'|'option', skill:'category:skill_id' (new id, snake_case, category from DOMAINS), option?, name, teaches,
     representation (how it looks in OUR B&W boxed-cell standard — WORKSHEET_DESIGN_STANDARD.md), family, steps:[ids],
     ccss:[codes], why: one line }.
4. PRE-SKILLS (prerequisites, ≤ 8, nearest first): skills a pupil should practise BEFORE this step — start from the xlsx
   prior-learning list of the step's week (map those lessons to WRM steps, take their direct skills), then the step just
   before in the same block, then lower-grade skills on the same CCSS cluster. If a needed pre-skill does not exist, add a
   proposal (step 3) and list its proposal id in `preBuild`.
5. RELATED skills (≤ 8, best first): skills that go with it — same idea in another form/representation, the inverse
   operation, the same CCSS code in a neighbouring skill, the next step's skill. Never repeat a direct skill.
6. Use only live skill keys (check SKILLS in data.js; follow js/modules/skill-aliases.js for retired ids).

## Output (one file per year, plus a short report)
`data/curriculum/links/<YEAR>.json`:
{ "year": "Y3", "generatedBy": "wave2-tagging", "steps": {
   "Y3.B1.S1": { "title": "...", "direct": [{"key":"placevalue:value","opts":{}}], "partial": [{"key":"...","missing":"..."}],
     "verdict": "full|partial|gap", "missing": "what is not taught (empty when full)", "build": ["proposalId"],
     "pre": [{"key":"...","why":"Y2.B1.S3 Recognise tens and ones (prior learning wk W01)"}], "preBuild": ["proposalId"],
     "related": [{"key":"...","why":"..."}], "note": "" } },
  "proposals": { "<id>": { ...shape above..., "reused": true|false } },
  "tagFixes": [ { "key":"...", "step":"...", "action":"add|remove|partial", "why":"..." } ] }
`design/audit/runs/wrm-tagging/<YEAR>-report.md`: counts (steps, full, partial, gap; new proposals vs reused), the hardest
calls, and owner questions with suggested answers.
Do NOT edit wrm.js / build-list.js / standards*.js yourself (several taggers run at once; the lead merges your proposals and
tag fixes into them afterwards). You MAY add a node check script tests/scripts/ws-wrm-links.cjs only if your prompt says so.

## Quality
A critic will grade a random sample of your steps (≥ 8/10: right direct skills, honest verdicts, useful pre-skills,
proposals that would really close the gap and fit our design). Be honest: "partial" with the precise missing clause beats a
generous "full". Pupils are ELL / special-education — pre-skills matter.
Commit + push often to your branch (given in your prompt) with trailers:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01M5EMD5ufNjURHDiNDLJjwD
Scratch files only under a scratch folder outside the repo.

## MANDATORY after critic Y2–Y3 r1 (FAIL, means 6.65 / 6.73) — every year must meet these
1. GENERATE, don't infer: for every direct/partial skill, generate ≥ 6 real items WITH the opts you list
   (node + generateQuestionFor) and judge the verdict from those items. Never inherit a verdict from an old SKILL_WRM tag
   without generating. Record the opts you generated with.
2. OPTIONS ARE VALUES, NOT NOTES: when a step needs an option ("8 times-table", "m and cm", "L and mL", "to words",
   US money), put the real option values in `opts` (read the skill's schema in js/modules/skill-options.js:
   e.g. {constant:[8]}, {forms:[1]}, {units:[1]}, {wordform:['to_words']}, {currency:'usd'}, {kind:'both'}). A step is
   `full` only if those opts make the generator deal exactly the step. A note is never a substitute.
3. FILTER PRE-SKILLS: the xlsx week list mixes blocks. Keep only entries that share the step's CCSS domain/cluster or are
   a genuine building block of it (state why). No pre from an unrelated domain. A Test row is not a lesson — fall back.
   Never put a step's own `build` proposal in its `preBuild`.
4. RELATED must share the IDEA (same concept in another form, inverse, next step) — not merely the same cluster; fewer,
   better entries beat padding. Every step should have some, or say why not.
5. Before reusing a proposal, check it is not ALREADY BUILT (the option may exist now — then the step is full with opts)
   and that it really closes THIS step; otherwise write a new option proposal.
6. Self-check before you report: a random 10 of your steps re-judged by generating items; fix and repeat until you'd
   score them ≥ 8.

## OWNER RULING 2026-10-10: keep every WRM step, even beyond CCSS
Every White Rose small step is covered or gets a build proposal, even when it goes beyond (or has no) CCSS code — e.g.
24-hour clock, Roman numerals, UK-only steps (converted to US money/units where the school does), above-grade steps,
11/12 times-tables. Never drop a step or mark it "not needed" because CCSS does not ask for it; tag its CCSS as [] and say
"beyond CCSS" in `note`. Build priority may be lower, but it goes on the list.

## MANDATORY after critic R–Y1 r1 (FAIL, means 6.80 / 6.23)
7. RANGE MUST MATCH: a skill+opts is `full` only if its generated items stay inside the step's number range
   ("Find 1, 2 and 3" → only 1–3; "14–20" must include 20). A band that goes past the step is `partial` + an option proposal
   (e.g. a shared `band_3`). Record Max Number in opts when the skill reads it (`range`).
8. RESPONSE MODE FITS THE PUPIL: judge the generated items for the age (Reception/K: pictures, counting, tap/circle, one
   digit; no typed words, no column layouts, no 24 counters). A wrong response mode is `partial`.
9. MULTIPLES ARE MULTIPLES: "count in 2s/5s/10s" needs items on true multiples from 0 within the step's limit — check.
10. RELATED ≠ PRE: never list the same key in both; related needs a reason beyond "same block / same CCSS".
11. Reception (no xlsx sheet): pre-skills from earlier R steps on the SAME topic (counting, shape, measure, pattern …), not
    simply the step before in the block.
12. Partial-only prior steps still count as pre-skills (use their partial skill) — don't drop the xlsx's listed prior steps.
Owner 2026-10-10 additions: KEEP the 24-hour clock (propose it); Roman numerals all the way to large numbers (one
`roman_numerals` skill, bands to 12 / 100 / 1,000 / 3,999, read and write); times-tables up to 15 (`tables_to_15`);
`improper_mixed` one-direction option; one-exchange / two-or-more-exchanges option on every regroup band. Reception
"Make connections" (R.B18) keeps a build (mixed review) — never left without one.

## OWNER RULE 2026-10-10: every partial or gap step gets an ENVISIONED skill to be made
13. When a step is `partial` or `gap`, imagine the exact skill (or option) that would make it `full`, and write it as a
    skill yet to be made — a real spec, not a label. Reuse an existing proposal only if its spec really does this; otherwise
    write a new one, or extend the reused one's spec (add `extends`). Each proposal must carry, in addition to the fields
    above:
    - `problemTypes`: 3–5 item types, easiest first (what the pupil sees and does), e.g. "picture of 3 apples + 2 apples →
      write the total", "number track, missing number", "story → number sentence";
    - `levels`: the scaffold ladder (one new thing per step, PEDAGOGY_STANDARD.md P-1) as option values;
    - `range`: the numbers/bands it deals, matched to the step(s);
    - `response`: the written response on paper and the screen answer mode (production stays production);
    - `edgeCases` and `misconceptions` (2–4 real errors);
    - `closes`: the exact missing clause(s) of each step it closes.
    The owner will build Wave 6 straight from these specs, so a reader must be able to picture the page.
