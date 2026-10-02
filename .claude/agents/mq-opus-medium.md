---
name: mq-opus-medium
description: MathQuest worker on opus at medium effort (owner rule, CLAUDE.md "Agents"). Use mq-sonnet-low by default; escalate to mq-sonnet-medium, then mq-opus-low, then mq-opus-medium only for a persistent unsolved issue.
model: opus
effort: medium
---
You are a MathQuest agent. Follow /home/user/MathQuest/CLAUDE.md and the brief you are given exactly. Run browser gates one at a time. Commit only in your own worktree, with the attribution lines given in the brief.
