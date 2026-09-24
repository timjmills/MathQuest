# Share codes and the skill options they carry

Owner request, 2026-09-24: *"On the quick links that you send to students the skill options need
to be available ... so that you can pick specific things like only work on multiplying 8s and 7s
in the mixed skill code and mixed skill print. Right now it's all or nothing."*

Every share form names its skills one at a time. A skill's chosen options ride on the skill they
belong to, as an optional suffix. Code: `js/modules/skill-option-codec.js`.

## The option suffix (format version 1)

```
skill-ref [ "~" payload ]
payload = field *( "_" field )
field   = KEY value            KEY: one letter, table below
```

| Option id (skill-options.js) | KEY | Value written as |
|---|---|---|
| `constant` (fact set)     | `C` | set: one base-36 char per ticked value — `{7,8}` → `78`, `{10,11}` → `AB` |
| `notation`                | `N` | set: `S` stacked · `A` across · `B` bracket · `F` fraction |
| `level` (support level)   | `L` | set: `0`–`3` |
| `response`                | `R` | `S` standard · `W` which-numbers · `A` array-builder |
| `range` (Max Number)      | `M` | decimal digits — `M20`, `M1000` |
| `decimals`                | `D` | decimal digit — `D2` |
| `wordform`                | `W` | set: `N` to number · `W` to words |
| `regroup`                 | `G` | `N` · `A` · `M` |
| `orientation`             | `O` | `V` · `H` |
| `unknown`                 | `U` | `A` · `F` · `S` · `M` |
| `simplestForm`            | `S` | `1` / `0` |
| `pictures`                | `P` | `1` / `0` |
| `band`                    | `B` | decimal digits |

An empty set field (`C` alone) means "none ticked", which the option model reads as *no
restriction*. A field that is absent means the option is at its default.

**Only what differs from the skill's default is written** (`packOptions`). A skill at its defaults
writes no suffix at all, so every code a set produced before this existed is still produced, and
still decoded, byte for byte.

**Characters.** `A–Z 0–9 ~ _` only. All share parsers upper-case the code and split on `-`, `|`
and `.`; none of those appear in a payload. `~` and `_` are unreserved in URLs, so a link with
options needs no escaping.

**Versioning.** A payload whose first character is a digit names a later format version; version 1
(this one) has no version digit. A decoder that meets an unknown version ignores the whole payload
(the skill loads at its defaults) rather than misreading it. Unknown keys inside a v1 payload are
skipped, so new options join v1 without a bump. Values are written **by value, never by list
position**, so an option can gain values later without moving any existing code. Keys and value
tokens are append-only.

**Old apps, new codes.** The pre-existing parsers read a skill part as "2 characters + digits":
`EA~C78` still yields `EA`, and `parseInt('~C78')` is `NaN` → weight 0. An old copy of the app
opening a new link gets the right skills at their default options — never a different skill.

## Where the suffix goes

| Form | Example | Written by | Read by |
|---|---|---|---|
| Skill code | `EA~C78-AY` | `generateSkillCode` | `parseSkillCodeParts` / `applySkillCode` |
| Direct Play link | `?c=EA~C78-AY\|T300-N20` | `generateEnhancedSkillCode` | landing modal → `applySkillCode` |
| Quick Start link | `?qs=EA~C78-AY\|Q1` | `generateQuickStartLink` | `setQuickSkillsFromCode` (the card keeps `opts`) |
| MX- mixed code / link | `MX-T00~C78.A00-40MSS2000` | `buildMixedCode` (Mixed Settings) | `applyMixedCode`, `parseMixedCodeForPlay`, `?c=MX-…` |
| 7-char settings code | `T00403M~C78` | `generateSettingsCode` | `applySettingsCode`, `parseSingleSkillCodeForPlay` |

Weight digits sit before the suffix: `EA3~C78`.

**MX- codes** are now what the Mixed Settings dialog shows (the compact `M` bitfield it showed
before read a checkbox tree that is no longer on the page and always encoded zero skills; it also
cannot hold a category of more than ten skills). Format:
`MX-<skill>.<skill>…-<range><dec><diff><timer><mode>[<TT><CC>]`, a skill being its settings-code
category letter plus its frozen two-digit position. The optional `TT CC` are the problem goals
(total problems, correct goal; `00` = off). A 5-character settings part — every MX code written
before 2026-09-24 — has no goals and decodes as it always did. Compact `M` codes still decode
unchanged; nothing writes them any more.

## Where the options live while the app runs

`state.skillOptionsBySkill['categoryId:skillId']` — one map for the whole set (the home queue, the
Skills Navigator queue, the Mixed Settings list, the Add Skills list and the print dialog are all
copies of the one set). `js/modules/skill-option-store.js`. It lives for the session only; what
must survive a reload does so on its own carrier: a Quick Start card's `opts`, saved mixed
settings' `skillOptions`, a print section's `opts`.

Plain `generateQuestion()` consults this map whenever the caller set no options of its own, so
practice, boss, race, the online worksheet, mixed play and the quiz builder honour a set's options
with no change to any of them. `generateQuestionFor({ opts })` (print, preview, audits) passes its
own and wins.

## The editor, and the teacher view

`js/modules/skill-options-ui.js` is the one options editor. Lists that show a set draw it inline
(`skillOptionsGearHTML` / `skillOptionsPanelHTML`); screens that keep options on their own rows —
the teacher view's Sets and Print screens — call

```js
window.openSkillOptionsPanel(categoryId, skillId, anchorEl, { opts, onChange(nextPackedOpts) })
```

which opens the same controls in a popover beside the button (a bottom sheet under 600px) and
reports every change as packed options (`null` at the defaults). A queue item's `opts` property
(UnifiedSkills) is a live view of the store entry: reading it returns the stored options, assigning
it writes the store, so `item.opts = next` in the teacher view reaches the share code and play.
Only the options the generator honours are shown (`offeredOptionsFor`).

The teacher Print screen always hands `buildSheet` an explicit `skills[].opts` object (`{}` at the
defaults), so a row reset on that screen prints the defaults instead of falling back to the set.

`generateQuestionFor()` called WITHOUT `opts` (undefined / null) also takes the skill's options from
the set — the online worksheet generates that way. Inside a mixed pool (`custom_mixed`) each picked
skill takes its own options, never the pool's.

## Tests

- `node tests/scripts/ws-code-snapshot.mjs` — no frozen code or position moves (unchanged gate).
- `node tests/scripts/ws-share-options.cjs` — codec round-trips for every live skill's options,
  old codes decode exactly as before, every live skill has a valid schema and default, and the
  end-to-end pupil test (Quick Start link and MX- code, 12 answered items, then print).
