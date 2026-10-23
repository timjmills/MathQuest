# Lane manifests and the integrator (IMPROVEMENT_PLAN §1.6.6, step E5)

**No lane edits a shared registry file.** A lane writes what it adds to the shared registries as data in
`design/lanes/<lane>/manifest.json`. The integrator, `tests/scripts/ws-integrate.mjs`, applies the manifests in
merge order. Every change it makes to a shared file is an **insertion of whole lines at a named anchor**, so
share codes stay append-only by construction: an existing line is never edited, moved or removed. (The one
exception: when it appends after a registry's last entry and that entry has no trailing comma, it adds the comma.)

This removes the conflict class behind 152 merge commits and 10 conflict fixes (§1.1): two lanes that each add
skills no longer both edit `data.js`, `standards.js`, `search-terms.js` … — they each add a manifest file of
their own, and the integrator writes the shared files once, in order.

| File | What it is |
|---|---|
| `design/lanes/<lane>/manifest.json` | One lane's additions. Owned by that lane. |
| `design/lanes/manifest.schema.json` | The format (JSON Schema), version 1. |
| `design/lanes/applied.json` | The ledger, written by the integrator only: what each lane applied, so a later manifest cannot drop or reorder it. Created by the first `--apply` that adds something. |
| `design/lanes/DRY_RUN.md` | The record of the gate's dry run. |

Current lanes (empty starter manifests, merge order in brackets): `wave0-a` (10), `wave0-b` (20),
`mixed-pages` (30), `teacher-site` (40).

## What the integrator owns, and what stays lane code

**Manifest data (the integrator writes these; lanes never edit them):**

| Manifest section / skill field | File | Registry (anchor) | How it is written |
|---|---|---|---|
| `skills[].entry` | `js/modules/data.js` | `SKILLS[category]` | appended at the **end** of the category; anything else is refused (positions are share codes) |
| `skills[].code` (required) | `js/modules/skill-codes-frozen.js` | `FROZEN_SKILL_CODES` | `"cat:id": "XY",` — must be free; refused if any existing code or position would move |
| `skills[].grade` | `js/modules/data.js` | `SKILL_GRADES` | `'id': 3,` (`keys.grades` = `'cat:id'` when the bare id is shared) |
| `skills[].timeCategory` | `js/modules/data.js` | `SKILL_TIME_CATEGORY` | `id: "quick",` |
| `skills[].printSize` | `js/modules/data.js` | `SKILL_PRINT_SIZE` | `id: "medium",` (a real new skill still needs it for the legacy path; a preset inherits its host's) |
| `skills[].mixedPoolExclude` | `js/modules/data.js` | `MIXED_POOL_EXCLUDE` | a **new** pool entry; adding to an existing pool's list is an edit and is refused |
| `skills[].preset` | `js/modules/skill-presets.js` | `SKILL_PRESETS` | `'cat:id': { skill: 'host', opts: {...} },` (the host must be live) |
| `skills[].standards` | `js/modules/standards.js` | `SKILL_STANDARDS` | `'cat:id': { ccss: [...], ee: [...] }, // label` |
| `skills[].wrm` | `js/modules/wrm.js` | `SKILL_WRM` | `'cat:id': [...],` |
| `skills[].terms` | `js/modules/search-terms.js` | `SKILL_TERMS` | `'cat:id': [...],` |
| `skills[].primaryTerms` | `js/modules/search-terms.js` | `PRIMARY_SKILLS` | `'cat:id': [...],` |
| `skills[].concepts` | `js/modules/search-terms.js` | `CONCEPT_RULES` | one exact-id rule `[/^cat:id$/, [...]],`; a rule may match only this manifest's skills |
| `skills[].generatorCategory` | `js/modules/generate-question.js` | `skillCategoryOverride` | `'id': 'fractions',` (the dispatcher's routing map is data) |
| `providers[]` | `js/modules/sheet/providers/index.js` | the import list | `import './family.js';` after the last import |
| `lessons[]` | `js/modules/lessons/detailed/index.js` | imports + `DETAILED_LESSONS` | `import x from './id.js';` and `[x.id]: x,` (the lesson registry) |

**Lane code (in files the lane owns, §1.6.5 / §4.1 — not manifest data):**

- the generator branch in `gen-*.js` (and lists of skill ids inside a generator, e.g. the P4 set in `gen-operations.js`);
- the provider's body (`registerSkill(...)` in `sheet/providers/<family>.js`) and any cell template in `sheet/cells/`;
- the lesson description file `lessons/detailed/<id>.js`;
- tests and audit fixtures (`tests/scripts/*` queries, `ws-content-audit` rules), owned per §4.1;
- design documents (`PRESET_SKILLS.md`, the lane's `design/status/<lane>.md`).

**Not yet manifest data (v1 gaps; each still needs the owning lane, one at a time):**

- `js/modules/skill-options.js` (option schemas are code: helpers, patches) and the option-key registry
  `js/modules/skill-option-keys.js` (append-only allocation). Proposal for v2: per-family option modules a lane
  owns, plus a `optionKeys` manifest section the integrator allocates.
- Edits to an **existing** `CONCEPT_RULES` regex or `MIXED_POOL_EXCLUDE` list (a manifest only adds a rule or a
  pool entry of its own).
- A new SKILLS **category** (touches `DOMAINS` and several maps).
- Changing an applied skill's data (e.g. better search terms): refused by design in v1; the lead edits the
  integration branch directly, and the next extract picks it up.
- `FROZEN_CATEGORY_ORDER` is frozen history: new skills never get an entry there (data.js assigns their position).

Generated files are never in a manifest: the integrator regenerates them (`--regen`).

## The manifest

```json
{
  "$schema": "../manifest.schema.json",
  "version": 1,
  "lane": "wave0-a",
  "mergeOrder": 10,
  "skills": [{
    "key": "addition:add_within_20_demo",
    "entry": { "v": "add_within_20_demo", "l": "Add Within 20", "presetOf": "add" },
    "code": "Z9",
    "grade": 1,
    "preset": { "skill": "add", "opts": { "range": 20 } },
    "standards": { "ccss": ["1.OA.C.6"], "ee": ["M.EE.1.OA.6"] },
    "wrm": ["Y1.B2.S1"],
    "terms": ["add within 20", "sums to 20", "plus within 20", "adding to 20", "addition to 20"],
    "concepts": ["addition"]
  }],
  "providers": [],
  "lessons": []
}
```

Rules the integrator enforces:

- **Append only.** `skills` grows only at its end; the ledger refuses a manifest that drops or reorders a skill it
  applied. There is no remove / rename / move field (unknown fields are refused). Retire a skill with a tombstone and
  an alias (`skill-aliases.js`), never by deleting it.
- **No conflicts.** A skill id that already exists with different data is refused; so is a key already present in
  any registry, a share code already pinned, a bare id shared with another skill (give `keys`), a preset host that is
  not live.
- **Share codes never move.** After applying, the integrator imports the tree's `data.js` and compares every
  existing skill's code and positional index with before; any change refuses the whole run and restores the files.
- **Idempotent.** Re-applying an applied manifest is a no-op (every entry is checked to be present with the same data).
- **All or nothing.** A run that fails writes nothing; a check that fails after writing restores every file.
- **Layout is only layout.** A `layout` block (written by `--extract`) is checked entry by entry against the skills
  data; a block that says anything else is refused.

### Merge order

Manifests apply in ascending `mergeOrder`, ties by lane name (`--order file` applies them in the order given by
`--lanes`). The lead gives each lane its number when its branch merges, so the order in which lanes land is the
order their skills are appended — the same as if each had appended by hand, one after the other. Applying lane A
then lane B gives byte-for-byte the files one combined manifest gives (self-test).

## Workflow

**A lane:** add your skills to your manifest; put your generator, provider body and tests in your own files; check
with `node tests/scripts/ws-integrate.mjs --apply --preview --lanes <lane>` (prints the lines it would insert,
touches nothing). To try the gates on your branch, apply in a scratch worktree, never commit the shared files.
Lanes never stamp `index.html`.

**The lead (integration branch, in merge order):**

```bash
node tests/scripts/ws-integrate.mjs --apply           # every lane, merge order; then commit the shared files + applied.json
node tests/scripts/ws-integrate.mjs --regen           # catalogue, standards / WRM coverage reports, STATUS index
node tests/scripts/ws-integrate.mjs --stamp           # ONCE, at deploy (refused with --dry-run / --self-test / --preview)
```

**Onboarding existing work into a manifest:** `--extract --skills cat:id,... --out <dir>` (or `--since <commit>`,
or `--cut <code>` with `--group pins` for one manifest per share-code pin section).

## The gate

```bash
node tests/scripts/ws-integrate.mjs --self-test       # seeded fixtures in a temp dir (26 checks)
node tests/scripts/ws-integrate.mjs --dry-run         # rebuild the 150 appended skills from manifests (see DRY_RUN.md)
```

**What the dry run covers:** it is the E5 gate as built, not a rebuild of the whole tree. It rebuilds the **150 skills
appended since the share codes were frozen** (114 presets + 36 real skills, codes `T6` on), not the 572 frozen
skills: their entries sit in packed, non-uniform lines (two to four codes per line in `FROZEN_SKILL_CODES`, with no
pin-section headers; `SKILL_TIME_CATEGORY` / `SKILL_PRINT_SIZE` in `data.js` and some `search-terms.js` lines pack
several skills per line), which a manifest
cannot carry and a peel would cut in half. Peeling them would take a layout-only reflow of those tables to one entry
per line plus a pin header per category (owner approval first), then `--cut AA`. As built, `--cut <code>` moves the
start of the cut (a later code narrows it; `T6` is already the earliest pin section), and `--extract --skills
cat:id,...` writes manifests for any skills, frozen ones included. Details in `DRY_RUN.md`.

The dry run makes a temporary `git worktree` of HEAD (the main working tree is never touched), extracts a manifest
per share-code pin section for every skill pinned from `T6` (the P4 appends, 2026-09-20) on, peels those entries
out of the shared files (the base must still parse), re-applies the manifests in merge order, requires
`git diff --exit-code` to be empty and a second apply to be a no-op, and runs `ws-code-snapshot`, `ws-standards`,
`ws-search-terms` and `ws-presets-unit` in the rebuilt tree. It then rebuilds once more from the skills **data
alone** (layout removed, every line rendered by the integrator) and requires the same share codes and positions and
the same four gates green. `--no-browser` skips `ws-presets-unit`; `--keep` keeps the worktree; set
`WS_INTEGRATE_SCRATCH` to put temp dirs in a scratch folder.
