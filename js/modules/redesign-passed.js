// redesign-passed.js — the skills that passed the 8/10 redesign (independent critic ≥ 8 on all four RUBRIC criteria).
// THE ONE PLACE (owner 2026-10-25): a skill is marked as redesigned only here. A lane that passes a skill at ≥ 8 adds it in
// the same change, with its evidence (lane, critic round, file, date); nowhere else records it. Read by teacher-library.js
// (the corner mark on the Skills screen); `node tests/scripts/ws-redesign-passed.mjs` checks every id is a live skill.
// Compiled from the records on 2026-10-25; the owner confirmed "only the clear 7" (uncertain stack and single-feature
// lanes stay unmarked until they pass a critic on the redesign).
const S3 = 'Lane S3 (stack × Single + pilot SU-C), critic r2 every page ≥ 8 except F1, F1/R1 fixed, focused re-check PASS lowest 8; design/STATUS.md 2026-10-24 22:45, design/status/s3-stack.md';
const LD = 'Lane D restart (fact family), critic r3 PASS lowest 8 on every in-scope page type (shared page-type defects ruled to their own lane, owner 2026-10-31), screen hosts r2 9/9/8-9/9 + ws-screen-answer/ws-screen-slots --uniform OK on the r3 tree; design/audit/runs/laned-restart/critic-r3.md, design/status/laned-restart.md, 2026-10-31';
const LD_IDS = [
  'addition:add_facts',
  'subtraction:sub_facts',
  'multiplication:mult_facts',
  'division:div_facts_long',
];
const IDS = [
  'subtraction:sub_50_no_regroup',
  'subtraction:sub_100_no_regroup',
  'subtraction:sub_1k_no_regroup',
  'subtraction:sub_10k_no_regroup',
  'subtraction:sub_100k_no_regroup',
  'subtraction:sub_1m_no_regroup',
  'subtraction:sub_2d_1d',
];
export const REDESIGN_PASSED = new Set([...IDS, ...LD_IDS]);
export const REDESIGN_EVIDENCE = Object.fromEntries([...IDS.map((id) => [id, S3]), ...LD_IDS.map((id) => [id, LD])]);
