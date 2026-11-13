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
// Visual-quality lane (2026-10-31): only the skills a critic graded on their OWN renders (RUBRIC: no inheritance across
// variants or bands). The five same-layout copies passed their own render check in critic r5 (VQ5 below).
const VQ = 'Lane visual-quality (family-check cell / word-work sentence layout, signed card design/cards/family-check), critics r1-r4: r2 every default page and host >= 8, r3 N1-N4 fixed, r4 N12 PASS lowest 8; design/audit/runs/visual-quality/critic-r2.md, critic-r3.md, critic-r4.md, 2026-10-31';
const VQ_IDS = [
  'addition:fact_family_sort',
  'addition:add_wp_20_plain',
  'addition:add_wp_10',
  'subtraction:sub_wp_20',
];
const VQ5 = 'Lane visual-quality, critic r5 (own renders, S + L, every page and host >= 8, lowest 8); design/audit/runs/visual-quality/critic-r5-copies.md, 2026-10-31';
const VQ5_IDS = [
  'addition:add_wp_10_plain',
  'addition:add_wp_20',
  'subtraction:sub_wp_10',
  'subtraction:sub_wp_10_plain',
  'subtraction:sub_wp_20_plain',
];
const VOC = 'Lane lf-vocab, critic r5 PASS min 8 (independent, more-practice, test, guided, error-analysis at S/M/L + keys, 10 screen hosts, grades 1-4, 4 lesson vocab pages); design/lanes/lf-vocab/critic-r5.md, 2026-11-09';
const VOC_IDS = [
  'vocabulary:vocab_grade_pictures',
  'vocabulary:vocab_pick3_words',
];
// lf-placevalue (lessons-first wave 1, CCSS BUILD lesson 1, 2.NBT.A.3): the first family on the pv template (lead ruling R1).
const PV = 'Lane lf-placevalue, critic r3 + r3b PASS (independent Opus medium critics; every pv-owned page type at S / M / L, every §7a option value, card 1280 / 820 / 390, worksheet, quiz >= 8; engine / role findings recorded, not held, lead D3); design/audit/runs/lf-placevalue/critic-r3.md + critic-r3b.md, 2026-11-08';
const PV3C = 'Lane lf-placevalue, critic r3 + r3b grades for unchanged pages, critic r3c PASS for every changed page (independent Opus medium critics; every pv-owned page type at S / M / L, every §7a option value, card 1280 / 820 / 390, worksheet, quiz >= 8; engine / role findings recorded, not held, lead D3); design/audit/runs/lf-placevalue/critic-r3.md + critic-r3b.md + critic-r3c.md, 2026-11-08';
const PV_IDS = [
    'placevalue:expand',
];
const PV4 = 'Lane lf-placevalue, critic r3 / r3b / r3c grades for unchanged pages, critic r4 + r5 PASS for the changed pages (independent Opus medium critics; identify E-A1 compact ones picture and r5 Guided two across, unit_form G2 rename=more at S with r5 margin and the G5 Fix-it words; every pv-owned page type at S / M / L, every §7a option value, card 1280 / 820 / 390, worksheet, quiz >= 8; engine / role findings recorded, not held, lead D3); design/audit/runs/lf-placevalue/critic-r3.md + critic-r3b.md + critic-r3c.md + critic-r4.md + critic-r5.md, 2026-11-08 / 2026-11-09';
const PV4_IDS = [
    'placevalue:identify',
    'placevalue:unit_form',
];
const PVW = 'Lane lf-placevalue week 2, critic nwf r1 FAIL, r2 FAIL, r3 PASS (independent Opus medium critics; every pv-owned page type at S / M / L, every option value of the signed pv card, card 1280 / 820 / 390, worksheet, quiz >= 8; the live detailed lesson 1 re-graded; engine / role findings recorded, not held, lead D3); design/audit/runs/lf-placevalue/critic-nwf1.md + critic-nwf2.md + critic-nwf3.md, 2026-11-13';
const PVW_IDS = [
    'composing:number_word_form',
];
const PV3C_IDS = [
    'placevalue:value',
    'placevalue:combine',
];
const OPS_DF = 'Lane lf-ops, division:div_facts: support-aid print pages narrow critics r5-r7 + r8 re-check PASS (Independent / Test / Review / More practice x touch, skip, array, think, boxsign, supports off, fade packet, S / M / L; design/audit/runs/lf-ops/critic-divfacts-r8.md, 2026-11-09); shared fact roles guided + scripted-model critics factroles r2 / r3 / r4 PASS (critic-factroles-r4.md, 2026-11-12); screen hosts card 1280 / 820 / 390, worksheet, quiz x every support critic divfacts-screen r2 PASS (critic-divfacts-screen-r2.md, 2026-11-12); every page type and host >= 8 (independent Opus medium critics)';
const OPS_DF_IDS = [
    'division:div_facts',
];
export const REDESIGN_PASSED = new Set([...IDS, ...LD_IDS, ...VQ_IDS, ...VQ5_IDS, ...PV_IDS, ...PV3C_IDS, ...PV4_IDS, ...VOC_IDS, ...OPS_DF_IDS, ...PVW_IDS]);
export const REDESIGN_EVIDENCE = Object.fromEntries([...IDS.map((id) => [id, S3]), ...VQ_IDS.map((id) => [id, VQ]), ...VQ5_IDS.map((id) => [id, VQ5]), ...LD_IDS.map((id) => [id, LD]), ...PV_IDS.map((id) => [id, PV]), ...PV3C_IDS.map((id) => [id, PV3C]), ...PV4_IDS.map((id) => [id, PV4]), ...VOC_IDS.map((id) => [id, VOC]), ...OPS_DF_IDS.map((id) => [id, OPS_DF]), ...PVW_IDS.map((id) => [id, PVW])]);
