# Lane status files (design/status/)

Merge hygiene, `design/IMPROVEMENT_PLAN.md` §1.4 S6 and Q-S3: every lane keeps its progress notes in its own file
here, and `design/STATUS.md` shows a generated index of them. Lanes stop clashing on STATUS.md and on the
index.html stamp.

## The rules

- A lane writes **only** its own `design/status/<lane>.md`. Lanes **never edit `design/STATUS.md`** and **never run
  `ws-stamp-assets`** (the integrator stamps index.html once per deploy, §1.6.6).
- **Only the integrator or the lead** runs `node tests/scripts/ws-status-index.mjs`. It rewrites the region of
  STATUS.md between `<!-- status-index:start -->` and `<!-- status-index:end -->` and nothing else.
- `--check` fails when that region is stale (deploy gate); `--owner-go [--json]` lists every go line and fails on a
  malformed one; `--conflicts --since <date|commit>` re-runs every merge and counts STATUS / stamp / lane-file
  conflicts (the S6 measure: a week of lanes with none); `--self-test` checks the tool.

## The lane file

Copy `_TEMPLATE.md` to `<lane>.md`. The file starts with a header block, one `Key: value` per line, ending at the first
blank line:

| Key | Value |
|---|---|
| Lane | the lane id, the same as the file name (lowercase, digits, `-`) |
| Title | short title |
| Session | the cloud session id, or `—` |
| Branch | the lane's branch, or `—` |
| Owner of files | the files the lane owns, short |
| State | one of `planned`, `building`, `critic`, `fix`, `passed`, `merged`, `paused`, `done` |
| Updated | `YYYY-MM-DD` |
| Builder profile | `mq-opus-low`, `mq-opus-medium` or `—` (the profile name: an agent cannot see its own effort) |
| Critic rounds | `<n>, <last verdict>`, e.g. `3, FAIL C2 7` or `0, none` |

Then four sections, in this order: `## Now` (at most 5 lines), `## Owner go`, `## Open questions`, `## Log` (dated
entries, newest first).

## The go line

The owner's go for a family to go live (§1.6.3 step 6) is one line in the lane's `## Owner go` section:

```
Owner go: <family>, <YYYY-MM-DD>
```

`<family>` is the category / family id in lowercase (e.g. `addition`, `place_value`). Only go lines, blank lines and
HTML comments may stand in that section; anything else, an impossible date, or an `Owner go:` line elsewhere in the
file fails `ws-status-index`, so the S5 deploy runner can trust `--owner-go --json`.

## Files here that are not lane files

A file is a lane file only if it is a `.md`, its name does not start with `_`, and its first lines carry the `Lane:`
header. Everything else here — this README, `_TEMPLATE.md`, `defect-classes.md`, `defect-*.csv`, `metrics.md` — is
ignored by the tool and belongs to its own owner (S8 owns the defect tally and metrics).
