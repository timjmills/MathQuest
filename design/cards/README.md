# Spec cards

A spec card is the short brief one template (or one family) is built from (`design/IMPROVEMENT_PLAN.md` §1.3, §1.4 S3).
It holds the exact rule excerpts by rule id, the owner rulings, the capacity rows, the options, the gates and the open
questions. **Builders read the card. Critics keep reading the full standards and `design/audit/RUBRIC.md`.** A build
starts only after the owner has signed its card.

Tool: `tests/scripts/ws-spec-card.mjs` (node, no browser, no dependencies). It prints `ws-spec-card: OK` / `FAIL`.

## Files

| Path | What it is |
|---|---|
| `rule-index.json` | GENERATED. Every rule id in the four standards (`WORKSHEET_DESIGN_STANDARD.md`, `PEDAGOGY_STANDARD.md`, `design/PAGE_TYPES.md`, `design/SKILL_CELL_CONTRACT.md`), `design/PROBLEM_TYPES.md`, and the ids critics cite from `design/audit/RUBRIC.md` (C1–C4, H1–H13), `design/audit/OPTIONS-RUBRIC.md` (O1–O6, OC1–OC15) and `design/audit/LESSONS_LEARNED.md` (L1–L11): file, line, heading path, form, excerpt and the excerpt's sha1. One rule per line. |
| `RULE_INDEX.md` | GENERATED. Counts per file and prefix, the collisions, duplicates and near-collisions. |
| `<id>/card.json` | The card's config, written by hand (see below). |
| `<id>/<id>.md` | GENERATED. The card. Edit `card.json`, never the card, except its Signed line when the owner signs. |

## The rule-id index

```bash
node tests/scripts/ws-spec-card.mjs --index            # rebuild
node tests/scripts/ws-spec-card.mjs --index --check    # exit 1 when the committed index is stale
```

A rule is **defined** where its id opens a bullet (`- **VA-1** …`), a paragraph (`**P-6 Title.** …`), a table row
(`| H1 | … |`) or a heading (`#### L-1 …`, `### C1 · …`). A rule whose text ends with `:` keeps the table or list right
under it. Excerpts are bounded at 60 lines / 4,000 characters. An id defined in two files is a **collision** and keeps
both entries as `ID@SRC` (for example `H1@RUBRIC`, the hard cap, and `H1@PED`, the first hint scaffold); an id defined
twice in one file is a **duplicate** (`SF-34@WDS.1`, `SF-34@WDS.2`). Neither is merged. Ids that differ only by a
hyphen or a leading zero (L1 / L-1) are listed as near-collisions. Fix collisions in the standards, not here.

Re-run `--index` after any edit to the sources; the index carries no timestamp, so a re-run is byte-identical.

## Making a card

1. Write `design/cards/<id>/card.json`:
   - `id`, `kind` (`template` or `family`), `title`, `template` {`id`, `source`, `also`}, `families` (categories);
   - `skills`: `printFormats` (a regex over the print formats in `design/SKILL_CATALOGUE.md`), `include`, `exclude`,
     `excludeCategories` (mixed pools);
   - `teaches`, `summary`, `research` (say where it came from), `problemTypes`, `progression`;
   - `drawing`: `sizes`, `notes`, `capacity` (bold table labels in a standard, copied with their table);
   - `ruleGroups`: `{title, rules, core, chars, full}` — rule ids or `ID@SRC` keys. Groups with `core: true` are
     section **4a**, the rules the builder must apply, quoted (`full: true` whole, otherwise cut at a sentence near
     `chars`); 4a may not exceed 5 KB (`coreBytes` in card.json may lower the cap; generation refuses a card over it).
     A group with `caps: true` is section **4a+**, quoted beside the core (at most 1.5 KB): the hard caps critics cite
     most on the card. Every other group goes to **4b**, one line per id (the id, then its first sentence cut at about
     100 characters), grouped under the heading of the standard that defines them. A group with `"applies": false` and a
     `reason` (a rule critics cited on the family that does not apply to this template) prints under its own heading,
     **4c** "Cited by critics on this family, but not applying to this template", with the reason; its ids still count
     for coverage;
   - `ownerRulings` `{date, ruling, source}`, `misconceptions` `{id, error, wrong}`, `options` (notes), `gates` `{cmd, note}`,
     `openQuestions` `{q, recommended}`; `findingsMatch` `{templates, families}` for the coverage test (families
     here are extra: the categories of the card's own skills are always matched).
2. Generate it:
   ```bash
   node tests/scripts/ws-spec-card.mjs --template <id>     # or --family <id>
   ```
   The tool adds what it can derive: the skills and their CCSS / EE / WRM tags (`standards.js`, `wrm.js`), the
   build-list entries on the template (`build-list.js`, `build-specs.js`), the options and preset skills declared on
   those skills (`skill-options.js`, `skill-presets.js`), the capacity rows, every rule id the template's source file
   cites (section 4, "Also cited in the template source"), and whether each gate's script exists yet (a missing one is
   marked PLANNED, as `ws-precritic` is until Wave 0 S1 lands).
3. Read it. Re-running gives the same bytes.

The card has nine sections — 1 What it teaches · 2 Problem types and progression · 3 The drawing · 4 Rules that apply ·
5 Owner rulings · 6 Misconceptions · 7 Options and presets · 8 Gates · 9 Open questions with recommended answers —
then the line `Signed: (not yet signed)`, then the informational block **§7b Current options in the repo** (see "The
signed part and the informational block"). Section 4 has up to four parts: **4a Core rules** (quoted, at most 5 KB), **4a+ Caps** (quoted in full,
at most 1.5 KB), **4b Also applies** (every other rule that applies, one line per id with its first sentence, grouped by
heading; the full text is in `rule-index.json`) and **4c** (cited on the family, not applying, with the reason). All
parts count as "on the card" for coverage. The machine block also records the `generated` date (kept while the card's
content is unchanged); `--check-signed` refuses a signing date before it. A machine block at the top (an HTML comment) records the card id, the
rule-index sha, the **bodySha** (sha of the generated card without its Signed line), the ids critics had cited at
generation (`cited`), `format: 2` and `configSha` (sha of the parsed card.json), and the 6-hex sha of every rule on the card (`rules`: `REF SHA …`, a ref that shares the
previous ref's prefix written as its number only: `VA-1 12d322 2 26885a` = VA-1, VA-2).

## Signing

The owner answers section 9 (answers go into `card.json` and the card is regenerated), then replaces the Signed line
(the line just above the informational §7b) with `Signed: owner, YYYY-MM-DD`. The build-start gate:

```bash
node tests/scripts/ws-spec-card.mjs --check-signed design/cards/<id>/<id>.md   # [--findings <csv>] [--require-findings]
```

It passes only when **all four** hold, and prints every one that fails with its fix:

1. the Signed line is `Signed: owner, YYYY-MM-DD`, a real calendar date, not after today, and not before the card's
   `generated` date (a card from before that field existed gets a NOTE instead);
2. the card was not edited by hand: the signed part (everything above the informational block, without the Signed
   line) still matches the `bodySha` stored at generation, and the informational block is well formed (below);
3. the card-coverage test (below) passes against the **current** rule index: a rule on the card that changed or was
   deleted after signing fails by id, and so does a rule a critic cited for the card's skills that is not on it;
4. `card.json` and the repo still generate the same **signed content**: any card.json change fails (`configSha`, and
   the compared body), and so does any change to rules, rulings, misconceptions, the options the card itself asks for,
   gates or open questions. The repo-derived listings a correct build changes are masked and reported as NOTE lines
   (next section). A change only to the ids cited in the tally does not count.

The fix for 2–4 is the same: edit `card.json` if needed, run `--template <id> --resign` (or `--family`), and have the
owner sign the new card.

Regenerating keeps the Signed line when nothing else changes. If the content of a **signed** card would change, the
tool refuses and writes nothing; `--resign` writes it and resets the line to `Signed: (not yet signed)`, so the owner
signs the new version.

## The signed part and the informational block

A correct build changes the repo: it adds the options the card asked for, adds preset skills, tags them, deletes its
built entry from the build list, lands a planned gate. If those listings sat in the signed body, every correct build
would break the signature (the subtraction pilot found this: its §7 listed the options declared today, and adding
`lengths` and `zeros` made `--check-signed` fail). So the card is split in two:

- **The signed part** — everything above and including the Signed line. It holds everything the owner signs: the
  card.json content, the rules and their excerpts, the owner rulings, the misconceptions, the open questions and their
  answers, the gates, and in §7 the options and presets the card itself declares or asks for (`options` in card.json).
  `bodySha` covers exactly this part, and every check reads only this part (rules for coverage, skills, the Signed line).
- **The informational block** — below the Signed line, between `<!-- informational: not signed. … -->` and
  `<!-- /informational -->`: **§7b Current options in the repo**, the options declared in `skill-options.js` on the
  card's skills and the preset skills on its hosts today. It is not hashed, not compared and never read by a check, so
  editing it by hand changes nothing. It may not fake signed content: `--check-signed` fails when the fence does not
  sit right after the Signed line (so it cannot fence off signed text), when there is more than one fence or any text
  after the closing one, or when the block holds a rule line (`- **ID** …`) or any heading other than §7b.

Regenerating a signed card whose only changes are repo-derived keeps the signed part byte for byte and refreshes §7b;
the Signed line stays.

**What a build may change in the signed part, case by case** (`comparableBody` in the tool masks these in check 4;
`bodySha` still covers them, so a hand edit to any of them fails check 2):

| Section | Repo-derived content | Decision |
|---|---|---|
| §1 | skill list (catalogue print formats), its count, CCSS / EE / WRM tags | Masked: a preset skill or a new tag is a correct build. Additions print as NOTE; a skill or tag signed on the card that is **gone** from the repo FAILS (a narrowed `printFormats` or a dropped tag is not a build step). A card.json change to the skill selection fails on `configSha`. |
| §2 | build-list entries on the template | Masked: a built entry is deleted from the build list (CLAUDE.md), and other lanes append entries. Gone and added both print as NOTE. Problem types and progression come from card.json and stay compared. |
| §3 | capacity rows copied from the standards | Compared: a build does not edit the standards' capacity tables; a change there is a standards change the owner re-signs. |
| §4 | rules | Compared, and checked by sha per rule (check 3). Never masked. |
| §7 | `options` notes from card.json | Compared (signed). The live listing moved to §7b. In a format-1 card (no informational block) the old live listing is masked in check 4, with a NOTE, but stays hashed. |
| §8 | the PLANNED marker on a gate whose script is not in the repo | Masked: a gate landing is expected. The gate list itself comes from card.json and stays compared. |

**Older cards (format 1, no informational block)** — `bodySha` is computed the same way it always was (the whole card
without the Signed line), and check 4 masks the old §7 listing, so a format-1 card does not fail only because options
were added. Running `--family <id>` / `--template <id>` on it keeps its signed text byte for byte and appends §7b. An
r1-era card (signed before the r2 renderer: ids-only 4b lines, no 4a+, no `generated`) is read correctly (its 4b ids
count for coverage; the missing `generated` is a NOTE), but the r2 renderer generates a different §4 and machine block
for it, so check 4 fails on that format change, not on options: such a card needs one `--resign` and a fresh owner
signature after the r2 tool lands on its branch.

## The card-coverage test

```bash
node tests/scripts/ws-spec-card.mjs --check-coverage design/cards/<id>/<id>.md   # or --all
#   [--findings <csv>]  default design/status/defect-findings.csv (the S8 tally)
#   [--require-findings]  fail when the findings file is missing (default: a warning)
```

It FAILS when

1. a rule id a critic cited on a finding for the card (`rule_ids` of `design/status/defect-findings.csv`) is not in
   section 4 (4a or 4b). The tally's fields are free text, so a finding is the card's when its `family` is a category
   of the card's skills (section 1) or a family in card.json, or its `template` is the card's template, or its `run` /
   `summary` names one of the card's skills (`cat:skill`, or a bare id that holds an underscore);
2. a rule on the card is no longer in the current rule index, or its excerpt changed since the card was generated —
   a rule changed after signing. Regenerate with `--resign` and have the owner sign again.

It warns about cited ids that are not in the index (typos in reports; known ones such as `H0` are explained), notes ids
defined outside the indexed standards (the lesson rules `LR-1`–`LR-18` of `design/LESSON_RULES.md`, not on this branch;
`KNOWN_EXTERNAL` in the tool, listed in `RULE_INDEX.md`), and lists ids cited since the card was generated.
It reads the standards fresh every time (never the committed index), so it is run again when each build starts.
