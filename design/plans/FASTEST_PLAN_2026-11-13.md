# Fastest-implementation plan (lead draft for the owner, 2026-11-13)

## Where we are
- ~550 skills needed by the 817 CCSS short lessons (lessons-first QUEUE.md); 29 passed (redesign-passed.js); ~15 lessons fully ready.
- Rounds to PASS: median 4, mean 4.8, range 1-15 (metrics.md section 2). Each round ~1-2 h and $30-70.
- Budget: 70 % of the weekly limit = ~$1,960 / week.
- Today's pace: ~2 skills / day at full budget, because most spend went to shared foundations (roles, checkers, the ledger).

## The changes (biggest saving first)
1. **Build by school unit, not by family.** Round 1 of the school sequence = 6 units, 85 CCSS lessons, 59 new skills.
   A unit ships when all its skills pass; teachers get whole usable units early. Lanes are re-cut to the skills the
   current round needs; nothing outside the round is started.
2. **Copies of an approved drawing get a light pass.** First skill on a template: full critic. Every later skill on the
   same template: machine gates + ONE narrow critic page sample (its own content: answers, ladder, words), not a
   full S/M/L x every role x every host review. Most of the 520 remaining skills reuse ~15 templates.
3. **One critic per batch, not per skill.** A lane sends 3-6 same-template skills to one critic run.
4. **Round cap.** Two failed rounds on the same defect class -> stop, root-cause, machine check, then one more round
   (section 1.7 already says this; enforce it at 2 rounds, not "two rounds at medium").
5. **Deploy train twice a day** (lead merges every passed lane at once, one gate run) instead of one deploy per pass.
   Today about a third of lead time went to merge conflicts between lanes.
6. **Fewer, longer lanes** (6 instead of 10) cut by template family in the current round, so lanes stop editing the
   same shared files.
7. **Screens: print + Chromebook/computer (1280-1366) + tablet (820-1024); no phone width (390).** See below.
8. **Long (atomised) lessons stay paused**; shared-tool work only when a near-passing skill is blocked on it.

## Phones (owner question)
- Phone-width (390 px) findings are ~2 % of all 7,878 recorded critic findings (145), but every screen gate and
  critic renders 390 as one of 3-4 widths, and the narrow phone layouts cause reflow fights (touch targets, panel
  frames, two-step cards).
- Estimated saving: ~25-30 % of screen-host render/critic time, ~5-8 % of total time. Not the biggest lever,
  but cheap to take: drop 390 from the gates, critic briefs and RUBRIC hosts; keep 48 px touch targets for tablets.

## Expected effect
| | Skills / week | ~520 skills |
|---|---|---|
| Today | 4-7 | 1.5-2.5 years |
| Changes 1-8 | 25-35 (est.) | ~4-5 months; round 1 (59 skills) in ~2-3 weeks |

## Needs the owner
- Approve 1-8 (esp. 2: light pass for copies, and 7: no phone width).
