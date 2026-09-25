// standards.js — every live skill tied to the standards it teaches (owner request 2026-09-25:
// "have each skill tied to the CCSS (or multiple ones) so that they can be tagged if wanted. Also
// to the essential element").
//
// A pure module: no DOM, no storage. It reads the standards database (standards-db.js, generated
// from data/standards/ccss-math.json and ee-math.json by `node tests/scripts/ws-standards.cjs
// --write-db`) and the alias table, and answers three questions:
//
//   standardsFor(categoryId, skillId)  which CCSS standards and Essential Elements a skill covers
//   skillsForStandard(code)            which skills cover a standard (CCSS, Wisconsin or EE code)
//   coverage()                         every standard, covered or not, for the gap list
//
// THE MAP (SKILL_STANDARDS, below)
//   key    'categoryId:skillId' for every live skill in SKILLS (data.js). Retired skills are not
//          listed: they inherit from the skill they alias to (skill-aliases.js).
//   ccss   full CCSS codes (Grade.Domain.Cluster.Number, sub-standards add a letter: 2.NBT.A.1a),
//          the PRIMARY standard first. A skill whose content sits above its tagged level keeps the
//          standard the content belongs to (perimeter is 3.MD.D.8 wherever it is taught).
//   ee     Wisconsin Essential Elements codes exactly as the DPI document prints them (M.EE.3.OA.6).
//          It holds the Essential Element linked to each mapped CCSS standard, plus the EEs whose
//          own wording the skill practises directly (for example every add or subtract within 20
//          skill also carries M.EE.3.OA.6, "Solve addition and subtraction problems within 20").
//   approx true when no K-6 standard fits exactly and the closest one is given; `note` says why.
//          Approximate mappings are listed in the coverage report but never count a standard as
//          covered.
//   reason why a skill has no standard at all (vocabulary games, grade 7-8 content).
//   pool   a mixed review pool: it practises the standards of the skills it draws from.
//
// Every code here must exist in the database: `node tests/scripts/ws-standards.cjs` fails on an
// unknown code, on a live skill missing from the map, and on a map key that is not a live skill.

import { CCSS, EE, CLUSTERS, DOMAIN_NAMES, WI_ONLY } from './standards-db.js';
import { SKILL_ALIASES } from './skill-aliases.js';

const VOCAB = 'Vocabulary matching game: it supports the language of every standard at its level rather than one standard.';

export const SKILL_STANDARDS = {

    // ---- counting
    'counting:count_objects': { ccss: ['K.CC.B.5', 'K.CC.B.4b', 'K.CC.A.3', 'K.CC.B.4a'], ee: ['M.EE.K.CC.6', 'M.EE.K.CC.4', 'M.EE.2.NBT.2', 'M.EE.1.NBT.1'] }, // Count Objects (1-20) (Visual)
    'counting:count_sequence': { ccss: ['K.CC.A.2', 'K.CC.B.4c'], ee: ['M.EE.K.CC.4', 'M.EE.1.NBT.1', 'M.EE.K.CC.1', 'M.EE.2.NBT.2'] }, // Next/Before/After Number (Visual)
    'counting:number_seq_fill': { ccss: ['1.NBT.A.1', 'K.CC.A.2', 'K.CC.A.1'], ee: ['M.EE.1.NBT.1', 'M.EE.2.NBT.3', 'M.EE.K.CC.1'] }, // Number Sequence: Fill Missing (Grid)
    'counting:mixed_counting': { ccss: [], ee: [], pool: true }, // Mixed Counting

    // ---- comparing
    'comparing:compare_groups': { ccss: ['K.CC.C.6'], ee: ['M.EE.K.CC.7', 'M.EE.1.NBT.3', 'M.EE.2.NBT.4', 'M.EE.1.OA.7'] }, // More/Fewer/Same Groups (Visual)
    'comparing:compare_objects': { ccss: ['K.MD.A.2', 'K.MD.A.1'], ee: ['M.EE.K.MD.2', 'M.EE.K.MD.1', 'M.EE.1.MD.1', 'M.EE.1.MD.2'] }, // Compare Attributes (Visual)
    'comparing:classify_count': { ccss: ['K.MD.B.3'], ee: ['M.EE.K.MD.3'] }, // Sort & Count by Category (Visual)
    'comparing:mixed_comparing': { ccss: [], ee: [], pool: true }, // Mixed Comparing

    // ---- composing
    'composing:number_bonds': { ccss: ['K.OA.A.3', '1.OA.C.6'], ee: ['M.EE.1.NBT.4', 'M.EE.1.NBT.6', 'M.EE.2.NBT.6'] }, // Number Bonds within 10 (Visual)
    'composing:make_ten': { ccss: ['K.OA.A.4'], ee: ['M.EE.1.NBT.2', 'M.EE.2.NBT.6'] }, // Make 10 (Visual)
    'composing:teen_compose': { ccss: ['K.NBT.A.1', '1.NBT.B.2b'], ee: ['M.EE.2.NBT.1'] }, // Teen Numbers: 10 + Ones (Visual)
    'composing:tens_foundation_visual': { ccss: ['1.NBT.B.2c', '1.NBT.B.2a'], ee: ['M.EE.1.NBT.2', 'M.EE.2.NBT.1', 'M.EE.3.NBT.2', 'M.EE.3.NBT.3'] }, // How Many Tens? (Visual)
    'composing:hundreds_chart_fill': { ccss: ['1.NBT.A.1', 'K.CC.A.1'], ee: ['M.EE.1.NBT.1'] }, // Hundreds Chart - Find the Missing Number (Visual)
    'composing:number_chart_fill': { ccss: ['2.NBT.A.2', '4.NBT.A.2'], ee: ['M.EE.2.NBT.2', 'M.EE.4.NBT.2'] }, // Number Chart - Find the Missing Number (to 1,000 and beyond)
    'composing:ten_frame_build': { ccss: ['K.CC.B.5', 'K.CC.B.4b'], ee: ['M.EE.K.CC.6', 'M.EE.K.CC.4', 'M.EE.1.NBT.2'] }, // Build a Number on a Ten Frame
    'composing:ten_frame_build_teen': { ccss: ['K.NBT.A.1', 'K.CC.B.5', '1.NBT.B.2b'], ee: ['M.EE.K.CC.6', 'M.EE.2.NBT.1'] }, // Build a Teen Number on Two Ten Frames
    'composing:base10_build': { ccss: ['1.NBT.B.2', '2.NBT.A.1'], ee: ['M.EE.1.NBT.2', 'M.EE.2.NBT.1', 'M.EE.3.NBT.2'] }, // Build a Number with Base-10 Blocks
    'composing:base10_regroup': { ccss: ['1.NBT.B.2a'], ee: ['M.EE.2.NBT.1', 'M.EE.1.NBT.2'] }, // Regroup with Base-10 Blocks
    'composing:base10_build_hundreds': { ccss: ['2.NBT.A.1', '2.NBT.A.3'], ee: ['M.EE.2.NBT.1', 'M.EE.2.NBT.3'] }, // Build 3-Digit Numbers with Flats
    'composing:odd_even': { ccss: ['2.OA.C.3'], ee: ['M.EE.2.OA.3'] }, // Odd or Even? (Visual)
    'composing:select_even_odd': { ccss: ['2.OA.C.3'], ee: ['M.EE.2.OA.3'] }, // Circle the Even or Odd Numbers (MAP)
    'composing:number_word_form': { ccss: ['2.NBT.A.3'], ee: ['M.EE.2.NBT.3'] }, // Number Word Form
    'composing:fraction_number_line': { ccss: ['3.NF.A.2a', '3.NF.A.2b'], ee: ['M.EE.3.NF.2'] }, // Fractions on Number Line (Visual)
    'composing:whole_as_fraction': { ccss: ['3.NF.A.3c'], ee: ['M.EE.3.NF.3'] }, // Whole Numbers as Fractions (Visual)
    'composing:compose_whole': { ccss: ['3.NF.A.1', '3.NF.A.3c'], ee: ['M.EE.3.NF.1', 'M.EE.3.NF.3'] }, // Compose 1 Whole from Unit Fractions
    'composing:mixed_composing': { ccss: [], ee: [], pool: true }, // Mixed Number Sense

    // ---- counting_mixed
    'counting_mixed:counting_all': { ccss: [], ee: [], pool: true }, // All Counting & Cardinality

    // ---- addition
    'addition:add_facts': { ccss: ['1.OA.C.6', '2.OA.B.2', 'K.OA.A.5'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Addition Facts (within 20)
    'addition:add_sub_10s': { ccss: ['1.NBT.C.4', '1.NBT.C.6', '1.NBT.C.5'], ee: ['M.EE.1.NBT.4', 'M.EE.1.NBT.6'] }, // Add & Subtract by 10s
    'addition:add_sub_100s': { ccss: ['2.NBT.B.8', '2.NBT.B.7'], ee: ['M.EE.2.NBT.7'] }, // Add & Subtract by 100s
    'addition:add': { ccss: ['1.OA.C.6', '2.NBT.B.5'], ee: ['M.EE.2.NBT.5', 'M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Basic Addition
    'addition:add_word_problems': { ccss: ['2.OA.A.1', '1.OA.A.1'], ee: ['M.EE.1.OA.1'] }, // Addition Word Problems
    'addition:add_word_problems_plain': { ccss: ['2.OA.A.1', '1.OA.A.1'], ee: ['M.EE.1.OA.1'] }, // Addition Word Problems (No Pictures)
    'addition:add_sub_fact_family': { ccss: ['1.OA.B.4', '1.OA.B.3'], ee: ['M.EE.6.EE.3'] }, // Addition Fact Families
    'addition:number_families_add': { ccss: ['1.OA.B.4', '1.OA.C.6'], ee: [] }, // Number Families (Add & Subtract)
    'addition:add_three': { ccss: ['1.OA.A.2'], ee: ['M.EE.1.OA.2'] }, // Add Three Numbers (≤20)
    'addition:comparison_word': { ccss: ['1.OA.A.1'], ee: ['M.EE.1.OA.1'] }, // How Many More/Fewer? (Visual)
    'addition:equal_sign': { ccss: ['1.OA.D.7'], ee: ['M.EE.1.OA.7'] }, // True/False Equations (Visual)
    'addition:add_5_pictures': { ccss: ['K.OA.A.5', 'K.OA.A.1'], ee: ['M.EE.K.OA.1', 'M.EE.1.OA.1', 'M.EE.2.NBT.7', 'M.EE.1.OA.2'] }, // Add Within 5 with Pictures (Visual)
    'addition:add_10_no_regroup': { ccss: ['K.OA.A.2', '1.OA.C.6'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Add within 10 (No Regrouping)
    'addition:add_10_regroup': { ccss: ['1.OA.C.6'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Add — Bridging Ten (sums 11–18)
    'addition:add_10_mixed': { ccss: ['K.OA.A.2', '1.OA.C.6'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Add within 10
    'addition:add_20_no_regroup': { ccss: ['1.OA.C.6', '2.OA.B.2'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Add within 20 (No Regrouping)
    'addition:add_20_regroup': { ccss: ['1.OA.C.6', '2.OA.B.2'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Add within 20 (With Regrouping)
    'addition:add_20_mixed': { ccss: ['1.OA.C.6', '2.OA.B.2'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Add within 20
    'addition:add_50_no_regroup': { ccss: ['2.NBT.B.5', '1.NBT.C.4'], ee: ['M.EE.2.NBT.5', 'M.EE.1.NBT.4', 'M.EE.4.NBT.4'] }, // Add within 50 (No Regrouping)
    'addition:add_50_regroup': { ccss: ['2.NBT.B.5', '1.NBT.C.4'], ee: ['M.EE.2.NBT.5', 'M.EE.1.NBT.4', 'M.EE.4.NBT.4'] }, // Add within 50 (With Regrouping)
    'addition:add_50_mixed': { ccss: ['2.NBT.B.5', '1.NBT.C.4'], ee: ['M.EE.2.NBT.5', 'M.EE.1.NBT.4', 'M.EE.4.NBT.4'] }, // Add within 50
    'addition:add_100_no_regroup': { ccss: ['2.NBT.B.5', '1.NBT.C.4'], ee: ['M.EE.2.NBT.5', 'M.EE.1.NBT.4', 'M.EE.4.NBT.4'] }, // Add within 100 (No Regrouping)
    'addition:add_100_regroup': { ccss: ['2.NBT.B.5', '1.NBT.C.4'], ee: ['M.EE.2.NBT.5', 'M.EE.1.NBT.4', 'M.EE.4.NBT.4'] }, // Add within 100 (With Regrouping)
    'addition:add_100_mixed': { ccss: ['2.NBT.B.5', '1.NBT.C.4'], ee: ['M.EE.2.NBT.5', 'M.EE.1.NBT.4', 'M.EE.4.NBT.4'] }, // Add within 100
    'addition:add_1k_no_regroup': { ccss: ['3.NBT.A.2', '2.NBT.B.7'], ee: ['M.EE.3.NBT.2', 'M.EE.2.NBT.7'] }, // Add within 1,000 (No Regrouping)
    'addition:add_1k_regroup': { ccss: ['3.NBT.A.2', '2.NBT.B.7'], ee: ['M.EE.3.NBT.2', 'M.EE.2.NBT.7'] }, // Add within 1,000 (With Regrouping)
    'addition:add_1k_mixed': { ccss: ['3.NBT.A.2', '2.NBT.B.7'], ee: ['M.EE.3.NBT.2', 'M.EE.2.NBT.7'] }, // Add within 1,000
    'addition:add_10k_no_regroup': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Add within 10,000 (No Regrouping)
    'addition:add_10k_regroup': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Add within 10,000 (With Regrouping)
    'addition:add_10k_mixed': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Add within 10,000
    'addition:add_100k_no_regroup': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Add within 100,000 (No Regrouping)
    'addition:add_100k_regroup': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Add within 100,000 (With Regrouping)
    'addition:add_100k_mixed': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Add within 100,000
    'addition:add_1m_no_regroup': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Add within 1,000,000 (No Regrouping)
    'addition:add_1m_regroup': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Add within 1,000,000 (With Regrouping)
    'addition:add_1m_mixed': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Add within 1,000,000
    'addition:add_wp_10': { ccss: ['K.OA.A.2'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6', 'M.EE.3.OA.7', 'M.EE.1.OA.2'] }, // Addition Word Problems (within 10)
    'addition:add_wp_10_plain': { ccss: ['K.OA.A.2'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6', 'M.EE.3.OA.7'] }, // Addition Word Problems (within 10, No Pictures)
    'addition:add_wp_20': { ccss: ['1.OA.A.1'], ee: ['M.EE.1.OA.1', 'M.EE.2.NBT.7', 'M.EE.3.OA.6', 'M.EE.3.OA.7'] }, // Addition Word Problems (within 20)
    'addition:add_wp_20_plain': { ccss: ['1.OA.A.1'], ee: ['M.EE.1.OA.1', 'M.EE.2.NBT.7', 'M.EE.3.OA.6', 'M.EE.3.OA.7'] }, // Addition Word Problems (within 20, No Pictures)
    'addition:add_wp_50': { ccss: ['2.OA.A.1'], ee: [] }, // Addition Word Problems (within 50)
    'addition:add_wp_50_plain': { ccss: ['2.OA.A.1'], ee: ['M.EE.4.NBT.4'] }, // Addition Word Problems (within 50, No Pictures)
    'addition:add_wp_100': { ccss: ['2.OA.A.1'], ee: ['M.EE.3.OA.7', 'M.EE.4.OA.3'] }, // Addition Word Problems (within 100)
    'addition:add_wp_100_plain': { ccss: ['2.OA.A.1'], ee: ['M.EE.3.OA.7', 'M.EE.4.NBT.4'] }, // Addition Word Problems (within 100, No Pictures)
    'addition:add_wp_1k': { ccss: ['3.NBT.A.2', '2.NBT.B.7'], ee: ['M.EE.3.NBT.2', 'M.EE.2.NBT.7'] }, // Addition Word Problems (within 1,000)
    'addition:add_wp_1k_plain': { ccss: ['3.NBT.A.2', '2.NBT.B.7'], ee: ['M.EE.3.NBT.2', 'M.EE.2.NBT.7'] }, // Addition Word Problems (within 1,000, No Pictures)
    'addition:add_wp_10k': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4', 'M.EE.3.OA.7'] }, // Addition Word Problems (within 10,000)
    'addition:add_wp_10k_plain': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4', 'M.EE.3.OA.7'] }, // Addition Word Problems (within 10,000, No Pictures)
    'addition:add_wp_100k': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4', 'M.EE.3.OA.7'] }, // Addition Word Problems (within 100,000)
    'addition:add_wp_100k_plain': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4', 'M.EE.3.OA.7'] }, // Addition Word Problems (within 100,000, No Pictures)
    'addition:add_wp_1m': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Addition Word Problems (within 1,000,000)
    'addition:add_wp_1m_plain': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Addition Word Problems (within 1,000,000, No Pictures)
    'addition:nl_add': { ccss: ['1.OA.C.5', '2.MD.B.6'], ee: ['M.EE.1.OA.5', 'M.EE.2.MD.6'] }, // Addition Number Line (Visual)
    'addition:number_line_add': { ccss: ['1.OA.C.5', '2.MD.B.6'], ee: ['M.EE.1.OA.5', 'M.EE.2.MD.6'] }, // Number Line Addition (B&W)
    'addition:cloze_addition': { ccss: ['2.OA.B.2', '1.OA.D.8'], ee: [] }, // Pick the Missing Addends
    'addition:mixed_addition': { ccss: [], ee: [], pool: true }, // Mixed Addition
    'addition:add_column_multi': { ccss: ['2.NBT.B.6'], ee: ['M.EE.2.NBT.6'] }, // Add Three or Four Numbers in Columns
    'addition:add_missing_digit': { ccss: ['3.NBT.A.2'], ee: ['M.EE.3.NBT.2'] }, // Find the Missing Digit (Addition)
    'addition:fact_family_sort': { ccss: ['1.OA.B.4', '1.OA.B.3'], ee: [] }, // Is It a Fact Family? (+/−)

    // ---- subtraction
    'subtraction:sub_facts': { ccss: ['1.OA.C.6', '2.OA.B.2', 'K.OA.A.5'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Subtraction Facts (within 20)
    'subtraction:subtract': { ccss: ['1.OA.C.6', '2.NBT.B.5'], ee: ['M.EE.2.NBT.5', 'M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Basic Subtraction
    'subtraction:sub_word_problems': { ccss: ['2.OA.A.1', '1.OA.A.1'], ee: ['M.EE.1.OA.1'] }, // Subtraction Word Problems
    'subtraction:sub_word_problems_plain': { ccss: ['2.OA.A.1', '1.OA.A.1'], ee: ['M.EE.1.OA.1'] }, // Subtraction Word Problems (No Pictures)
    'subtraction:missing_add_sub': { ccss: ['1.OA.D.8', '1.OA.B.4'], ee: [] }, // Missing Numbers (+/−)
    'subtraction:sub_5_pictures': { ccss: ['K.OA.A.5', 'K.OA.A.1'], ee: ['M.EE.K.OA.1', 'M.EE.1.OA.1', 'M.EE.2.NBT.7'] }, // Subtract Within 5 with Pictures (Visual)
    'subtraction:unknown_start_wp': { ccss: ['2.OA.A.1', '1.OA.A.1'], ee: ['M.EE.1.OA.1'] }, // Unknown Start Word Problems (Visual)
    'subtraction:sub_10_no_regroup': { ccss: ['K.OA.A.2', '1.OA.C.6'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Subtract within 10 (No Regrouping)
    'subtraction:sub_10_regroup': { ccss: ['1.OA.C.6'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Subtract — Bridging Ten (minuends 11–18)
    'subtraction:sub_10_mixed': { ccss: ['K.OA.A.2', '1.OA.C.6'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Subtract within 10
    'subtraction:sub_20_no_regroup': { ccss: ['1.OA.C.6', '2.OA.B.2'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Subtract within 20 (No Regrouping)
    'subtraction:sub_20_regroup': { ccss: ['1.OA.C.6', '2.OA.B.2'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Subtract within 20 (With Regrouping)
    'subtraction:sub_20_mixed': { ccss: ['1.OA.C.6', '2.OA.B.2'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6'] }, // Subtract within 20
    'subtraction:sub_50_no_regroup': { ccss: ['2.NBT.B.5'], ee: ['M.EE.2.NBT.5', 'M.EE.4.NBT.4'] }, // Subtract within 50 (No Regrouping)
    'subtraction:sub_50_regroup': { ccss: ['2.NBT.B.5'], ee: ['M.EE.2.NBT.5', 'M.EE.4.NBT.4'] }, // Subtract within 50 (With Regrouping)
    'subtraction:sub_50_mixed': { ccss: ['2.NBT.B.5'], ee: ['M.EE.2.NBT.5', 'M.EE.4.NBT.4'] }, // Subtract within 50
    'subtraction:sub_100_no_regroup': { ccss: ['2.NBT.B.5'], ee: ['M.EE.2.NBT.5', 'M.EE.4.NBT.4'] }, // Subtract within 100 (No Regrouping)
    'subtraction:sub_100_regroup': { ccss: ['2.NBT.B.5'], ee: ['M.EE.2.NBT.5', 'M.EE.4.NBT.4'] }, // Subtract within 100 (With Regrouping)
    'subtraction:sub_100_mixed': { ccss: ['2.NBT.B.5'], ee: ['M.EE.2.NBT.5', 'M.EE.4.NBT.4'] }, // Subtract within 100
    'subtraction:sub_1k_no_regroup': { ccss: ['3.NBT.A.2', '2.NBT.B.7'], ee: ['M.EE.3.NBT.2', 'M.EE.2.NBT.7'] }, // Subtract within 1,000 (No Regrouping)
    'subtraction:sub_1k_regroup': { ccss: ['3.NBT.A.2', '2.NBT.B.7'], ee: ['M.EE.3.NBT.2', 'M.EE.2.NBT.7'] }, // Subtract within 1,000 (With Regrouping)
    'subtraction:sub_1k_mixed': { ccss: ['3.NBT.A.2', '2.NBT.B.7'], ee: ['M.EE.3.NBT.2', 'M.EE.2.NBT.7'] }, // Subtract within 1,000
    'subtraction:sub_10k_no_regroup': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Subtract within 10,000 (No Regrouping)
    'subtraction:sub_10k_regroup': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Subtract within 10,000 (With Regrouping)
    'subtraction:sub_10k_mixed': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Subtract within 10,000
    'subtraction:sub_100k_no_regroup': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Subtract within 100,000 (No Regrouping)
    'subtraction:sub_100k_regroup': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Subtract within 100,000 (With Regrouping)
    'subtraction:sub_100k_mixed': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Subtract within 100,000
    'subtraction:sub_1m_no_regroup': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Subtract within 1,000,000 (No Regrouping)
    'subtraction:sub_1m_regroup': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Subtract within 1,000,000 (With Regrouping)
    'subtraction:sub_1m_mixed': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Subtract within 1,000,000
    'subtraction:sub_wp_10': { ccss: ['K.OA.A.2'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6', 'M.EE.3.OA.7'] }, // Subtraction Word Problems (within 10)
    'subtraction:sub_wp_10_plain': { ccss: ['K.OA.A.2'], ee: ['M.EE.2.NBT.7', 'M.EE.3.OA.6', 'M.EE.3.OA.7'] }, // Subtraction Word Problems (within 10, No Pictures)
    'subtraction:sub_wp_20': { ccss: ['1.OA.A.1'], ee: ['M.EE.1.OA.1', 'M.EE.2.NBT.7', 'M.EE.3.OA.6', 'M.EE.3.OA.7'] }, // Subtraction Word Problems (within 20)
    'subtraction:sub_wp_20_plain': { ccss: ['1.OA.A.1'], ee: ['M.EE.1.OA.1', 'M.EE.2.NBT.7', 'M.EE.3.OA.6', 'M.EE.3.OA.7'] }, // Subtraction Word Problems (within 20, No Pictures)
    'subtraction:sub_wp_50': { ccss: ['2.OA.A.1'], ee: [] }, // Subtraction Word Problems (within 50)
    'subtraction:sub_wp_50_plain': { ccss: ['2.OA.A.1'], ee: ['M.EE.4.NBT.4'] }, // Subtraction Word Problems (within 50, No Pictures)
    'subtraction:sub_wp_100': { ccss: ['2.OA.A.1'], ee: ['M.EE.3.OA.7', 'M.EE.4.OA.3'] }, // Subtraction Word Problems (within 100)
    'subtraction:sub_wp_100_plain': { ccss: ['2.OA.A.1'], ee: ['M.EE.3.OA.7', 'M.EE.4.NBT.4'] }, // Subtraction Word Problems (within 100, No Pictures)
    'subtraction:sub_wp_1k': { ccss: ['3.NBT.A.2', '2.NBT.B.7'], ee: ['M.EE.3.NBT.2', 'M.EE.2.NBT.7'] }, // Subtraction Word Problems (within 1,000)
    'subtraction:sub_wp_1k_plain': { ccss: ['3.NBT.A.2', '2.NBT.B.7'], ee: ['M.EE.3.NBT.2', 'M.EE.2.NBT.7'] }, // Subtraction Word Problems (within 1,000, No Pictures)
    'subtraction:sub_wp_10k': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4', 'M.EE.3.OA.7'] }, // Subtraction Word Problems (within 10,000)
    'subtraction:sub_wp_10k_plain': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4', 'M.EE.3.OA.7'] }, // Subtraction Word Problems (within 10,000, No Pictures)
    'subtraction:sub_wp_100k': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4', 'M.EE.3.OA.7'] }, // Subtraction Word Problems (within 100,000)
    'subtraction:sub_wp_100k_plain': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4', 'M.EE.3.OA.7'] }, // Subtraction Word Problems (within 100,000, No Pictures)
    'subtraction:sub_wp_1m': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Subtraction Word Problems (within 1,000,000)
    'subtraction:sub_wp_1m_plain': { ccss: ['4.NBT.B.4'], ee: ['M.EE.4.NBT.4'] }, // Subtraction Word Problems (within 1,000,000, No Pictures)
    'subtraction:nl_sub': { ccss: ['1.OA.C.5', '2.MD.B.6'], ee: ['M.EE.1.OA.5', 'M.EE.2.MD.6'] }, // Subtraction Number Line (Visual)
    'subtraction:number_line_sub': { ccss: ['1.OA.C.5', '2.MD.B.6'], ee: ['M.EE.1.OA.5', 'M.EE.2.MD.6'] }, // Number Line Subtraction (B&W)
    'subtraction:mixed_add_sub': { ccss: ['2.NBT.B.5', '2.OA.B.2'], ee: ['M.EE.2.NBT.5'] }, // Mixed Addition & Subtraction
    'subtraction:mixed_subtraction': { ccss: [], ee: [], pool: true }, // Mixed Subtraction
    'subtraction:sub_across_zeros': { ccss: ['3.NBT.A.2', '2.NBT.B.7'], ee: ['M.EE.3.NBT.2', 'M.EE.2.NBT.7'] }, // Subtract Across Zeros
    'subtraction:sub_missing_digit': { ccss: ['3.NBT.A.2'], ee: ['M.EE.3.NBT.2'] }, // Find the Missing Digit (Subtraction)
    'subtraction:sub_check_by_adding': { ccss: ['3.NBT.A.2', '2.NBT.B.7'], ee: ['M.EE.3.NBT.2', 'M.EE.2.NBT.7'] }, // Check a Subtraction by Adding

    // ---- multiplication
    'multiplication:mult_facts': { ccss: ['3.OA.C.7'], ee: ['M.EE.3.OA.6', 'M.EE.5.NBT.5', 'M.EE.6.NS.3'] }, // Multiplication Facts (1-12)
    'multiplication:multiply': { ccss: ['3.OA.C.7', '4.NBT.B.5', '5.NBT.B.5'], ee: ['M.EE.3.OA.6'] }, // Basic Multiplication
    'multiplication:arrays_groups': { ccss: ['2.OA.C.4', '3.OA.A.1'], ee: ['M.EE.2.OA.4', 'M.EE.3.OA.1', 'M.EE.4.OA.4'] }, // Arrays & Equal Groups (Visual)
    'multiplication:dot_array_mult': { ccss: ['2.OA.C.4', '3.OA.A.1'], ee: ['M.EE.2.OA.4', 'M.EE.3.OA.1', 'M.EE.4.OA.4'] }, // Dot Array Multiplication (B&W)
    'multiplication:mult_properties': { ccss: ['3.OA.B.5'], ee: [] }, // Multiplication Properties (Visual)
    'multiplication:mult_word_problems': { ccss: ['3.OA.A.3'], ee: [] }, // Multiplication Word Problems
    'multiplication:mult_word_problems_plain': { ccss: ['3.OA.A.3'], ee: [] }, // Multiplication Word Problems (No Pictures)
    'multiplication:mult_comparison': { ccss: ['4.OA.A.2', '4.OA.A.1'], ee: ['M.EE.4.OA.2', 'M.EE.4.OA.1'] }, // Times as Many Word Problems (Visual)
    'multiplication:mult_comparison_plain': { ccss: ['4.OA.A.2', '4.OA.A.1'], ee: ['M.EE.4.OA.2', 'M.EE.4.OA.1'] }, // Times as Many (No Pictures)
    'multiplication:area_model_mult': { ccss: ['4.NBT.B.5'], ee: [] }, // Area Model Multiplication
    'multiplication:area_model_mult_hard': { ccss: ['4.NBT.B.5', '5.NBT.B.5'], ee: ['M.EE.5.NBT.5'] }, // Area Model (2×2 and 2×3)
    'multiplication:mult_div_fact_family': { ccss: ['3.OA.C.7', '3.OA.B.6'], ee: ['M.EE.3.OA.6'] }, // Multiplication Fact Families
    'multiplication:number_families_mult': { ccss: ['3.OA.C.7', '3.OA.B.6'], ee: ['M.EE.3.OA.6'] }, // Number Families (Multiply & Divide)
    'multiplication:mult_chart': { ccss: ['3.OA.C.7', '3.OA.D.9'], ee: ['M.EE.3.OA.6', 'M.EE.3.OA.8'] }, // Multiplication Chart (Visual)
    'multiplication:mult_chart_easy': { ccss: ['3.OA.C.7', '3.OA.D.9'], ee: ['M.EE.3.OA.6', 'M.EE.3.OA.8'] }, // Multiplication Chart - Fill the Missing Cells
    'multiplication:nl_mult': { ccss: ['3.OA.A.1', '3.OA.C.7'], ee: ['M.EE.3.OA.1', 'M.EE.3.OA.6'] }, // Multiplication Number Line (Visual)
    'multiplication:mixed_multiplication': { ccss: [], ee: [], pool: true }, // Mixed Multiplication
    'multiplication:repeated_add_to_mult': { ccss: ['2.OA.C.4', '3.OA.A.1'], ee: ['M.EE.2.OA.4', 'M.EE.3.OA.1', 'M.EE.3.OA.2', 'M.EE.4.OA.1', 'M.EE.4.OA.2'] }, // Write Repeated Addition as Multiplication (Visual)
    'multiplication:equal_or_unequal_groups': { ccss: ['2.OA.C.4', '3.OA.A.1'], ee: ['M.EE.2.OA.4', 'M.EE.3.OA.1'] }, // Equal Groups or Not? (Visual)
    'multiplication:mult_zeros': { ccss: ['3.NBT.A.3'], ee: ['M.EE.3.NBT.3'] }, // Multiply by 10, 100 and Multiples of Ten
    'multiplication:mult_placeholder_zero': { ccss: ['4.NBT.B.5', '5.NBT.B.5'], ee: ['M.EE.5.NBT.5'] }, // Write the Placeholder Zero
    'multiplication:mult_missing_digit': { ccss: ['4.NBT.B.5'], ee: [] }, // Find the Missing Digit (Multiplication)
    'multiplication:count_by_tables': { ccss: ['3.OA.C.7', '3.OA.D.9'], ee: ['M.EE.3.OA.8'] }, // Count by 1–12 (3.OA.7 prep: skip-counting the tables)

    // ---- division
    'division:div_facts': { ccss: ['3.OA.C.7'], ee: ['M.EE.3.OA.6'] }, // Division Facts (1-12)
    'division:divide': { ccss: ['3.OA.C.7', '4.NBT.B.6'], ee: ['M.EE.3.OA.6'] }, // Basic Division
    'division:div_remainders': { ccss: ['4.NBT.B.6'], ee: [] }, // Division with Remainders (Visual)
    'division:div_word_problems': { ccss: ['3.OA.A.3', '3.OA.A.2'], ee: ['M.EE.3.OA.2', 'M.EE.5.NBT.6', 'M.EE.6.NS.2'] }, // Division Word Problems
    'division:div_word_problems_plain': { ccss: ['3.OA.A.3', '3.OA.A.2'], ee: ['M.EE.3.OA.2'] }, // Division Word Problems (No Pictures)
    'division:remainder_interpret': { ccss: ['4.OA.A.3'], ee: ['M.EE.4.OA.3'] }, // Interpret the Remainder (Word Problems)
    'division:remainder_contexts': { ccss: ['4.OA.A.3'], ee: ['M.EE.4.OA.3'] }, // Remainder Contexts (Buses, Boxes, Cookies, Money, Cars)
    'division:box_division_easy': { ccss: ['4.NBT.B.6'], ee: [] }, // Box Method Division (2÷1 digit)
    'division:box_division_hard': { ccss: ['4.NBT.B.6'], ee: [] }, // Box Method Division (3÷1 digit)
    'division:area_model_div_2by1': { ccss: ['4.NBT.B.6'], ee: [] }, // Area Model Division (2÷1 digit)
    'division:area_model_div_3by1': { ccss: ['4.NBT.B.6'], ee: [] }, // Area Model Division (3÷1 digit)
    'division:long_div_2digit': { ccss: ['5.NBT.B.6', '6.NS.B.2'], ee: ['M.EE.5.NBT.6', 'M.EE.6.NS.2'] }, // Divide by 2-Digit Numbers (Visual)
    'division:missing_mult_div': { ccss: ['3.OA.A.4', '3.OA.B.6'], ee: [] }, // Missing Factors (×/÷)
    'division:nl_div': { ccss: ['3.OA.A.2', '3.OA.C.7'], ee: ['M.EE.3.OA.2', 'M.EE.3.OA.6'] }, // Division Number Line (Visual)
    'division:mixed_mult_div': { ccss: ['3.OA.C.7'], ee: ['M.EE.3.OA.6'] }, // Mixed Multiplication & Division
    'division:mixed_division': { ccss: [], ee: [], pool: true }, // Mixed Division
    'division:share_into_groups': { ccss: ['3.OA.A.2'], ee: ['M.EE.3.OA.2', 'M.EE.5.NBT.6', 'M.EE.6.NS.2'] }, // Make Equal Groups to Divide (Visual)
    'division:div_equation_parts': { ccss: ['3.OA.A.2', '3.OA.B.6'], ee: ['M.EE.3.OA.2'], approx: true, note: "Names the dividend, divisor and quotient; CCSS has no vocabulary standard, 3.OA.2 is the closest." }, // Parts of a Division Equation (Visual)
    'division:div_zero_in_quotient': { ccss: ['4.NBT.B.6', '5.NBT.B.6'], ee: ['M.EE.5.NBT.6'] }, // Zero in the Quotient
    'division:remainder_too_big': { ccss: ['4.NBT.B.6'], ee: [] }, // Is the Remainder Finished?
    'division:div_check_by_multiplying': { ccss: ['4.NBT.B.6', '3.OA.B.6'], ee: [] }, // Check a Division by Multiplying
    'division:div_fix_estimate': { ccss: ['5.NBT.B.6'], ee: ['M.EE.5.NBT.6'] }, // Fix the Estimate (Long Division)

    // ---- integers
    'integers:number_line_int': { ccss: ['6.NS.C.6c', '6.NS.C.5'], ee: ['M.EE.6.NS.6', 'M.EE.6.NS.5', 'M.EE.6.NS.7', 'M.EE.6.NS.8'] }, // Number Lines with Negatives
    'integers:compare_int': { ccss: ['6.NS.C.7a', '6.NS.C.7b'], ee: ['M.EE.6.NS.7'] }, // Comparing Integers
    'integers:add_int': { ccss: ['6.NS.C.5', '6.NS.C.6a'], ee: ['M.EE.6.NS.5', 'M.EE.6.NS.6'], approx: true, note: "Adding and subtracting integers is CCSS 7.NS.A.1 (grade 7); 6.NS.5-6 are the grade-6 foundation." }, // Adding Integers
    'integers:sub_int': { ccss: ['6.NS.C.5', '6.NS.C.6a'], ee: ['M.EE.6.NS.5', 'M.EE.6.NS.6'], approx: true, note: "Adding and subtracting integers is CCSS 7.NS.A.1 (grade 7); 6.NS.5-6 are the grade-6 foundation." }, // Subtracting Integers
    'integers:order_negatives': { ccss: ['6.NS.C.7a', '6.NS.C.7b'], ee: ['M.EE.6.NS.7'] }, // Order Integers: Least to Greatest
    'integers:integer_nl_drag': { ccss: ['6.NS.C.6c'], ee: ['M.EE.6.NS.6'] }, // Place Integers on a Number Line
    'integers:mixed_integers': { ccss: [], ee: [], pool: true }, // Mixed Integers
    'integers:abs_value': { ccss: ['6.NS.C.7c'], ee: ['M.EE.6.NS.7'] }, // Absolute Value
    'integers:opposite_numbers': { ccss: ['6.NS.C.6a'], ee: ['M.EE.6.NS.6'] }, // Opposites of Integers
    'integers:ordering_rationals': { ccss: ['6.NS.C.7a', '6.NS.C.6c'], ee: ['M.EE.6.NS.7', 'M.EE.6.NS.6'] }, // Order Rationals on a Number Line

    // ---- number_ops_mixed
    'number_ops_mixed:mixed': { ccss: [], ee: [], pool: true }, // All Four Operations (+ − × ÷)
    'number_ops_mixed:word_problems_mixed': { ccss: ['3.OA.A.3', '2.OA.A.1', '4.OA.A.2'], ee: ['M.EE.3.OA.7', 'M.EE.4.OA.3'] }, // Mixed Word Problems (+−×÷) (Visual)
    'number_ops_mixed:word_problems_mixed_plain': { ccss: ['3.OA.A.3', '2.OA.A.1', '4.OA.A.2'], ee: ['M.EE.3.OA.7', 'M.EE.4.OA.3'] }, // Mixed Word Problems (+−×÷) (No Pictures)
    'number_ops_mixed:number_families_mixed': { ccss: ['1.OA.B.4', '3.OA.B.6'], ee: [] }, // Number Families (All Four Operations)
    'number_ops_mixed:operations_all': { ccss: [], ee: [], pool: true }, // All Operations Skills
    'number_ops_mixed:which_sign': { ccss: ['1.OA.D.7', '3.OA.A.4'], ee: ['M.EE.1.OA.7', 'M.EE.2.NBT.5'] }, // Which Sign Makes It True? (+ − × ÷)
    'number_ops_mixed:missing_factor_or_addend': { ccss: ['1.OA.D.8', '3.OA.A.4'], ee: [] }, // Missing Addend or Missing Factor?

    // ---- fractions
    'fractions:identify': { ccss: ['3.NF.A.1', '3.G.A.2'], ee: ['M.EE.3.NF.1', 'M.EE.3.G.2', 'M.EE.4.NF.1', 'M.EE.5.NF.1', 'M.EE.3.NF.2', 'M.EE.4.NF.2', 'M.EE.4.NF.3'] }, // Identify Fractions (Visual)
    'fractions:write_fraction': { ccss: ['3.NF.A.1'], ee: ['M.EE.3.NF.1', 'M.EE.5.NBT.7'] }, // Write the Fraction Shown
    'fractions:shade_fraction': { ccss: ['3.NF.A.1'], ee: ['M.EE.3.NF.1'] }, // Shade the Fraction
    'fractions:equiv_frac_visual': { ccss: ['3.NF.A.3a', '3.NF.A.3b', '4.NF.A.1'], ee: ['M.EE.3.NF.3'] }, // Equivalent Fractions (Visual)
    'fractions:equiv_frac_nv': { ccss: ['3.NF.A.3b', '4.NF.A.1'], ee: ['M.EE.3.NF.3', 'M.EE.4.NF.1'] }, // Equivalent Fractions (No Visuals)
    'fractions:select_equiv_frac': { ccss: ['4.NF.A.1', '3.NF.A.3b'], ee: ['M.EE.4.NF.1', 'M.EE.3.NF.3'] }, // Circle the Equivalent Fractions (MAP)
    'fractions:equivalent': { ccss: ['4.NF.A.1'], ee: ['M.EE.4.NF.1'] }, // Equivalent Fractions
    'fractions:fraction_of_set': { ccss: ['3.NF.A.1', '5.NF.B.4a'], ee: ['M.EE.3.NF.1'] }, // Fraction of a Set (Visual)
    'fractions:fraction_of_set_hard': { ccss: ['5.NF.B.4a', '4.NF.B.4c'], ee: [] }, // Fraction of a Set - Hard (Visual)
    'fractions:compare': { ccss: ['4.NF.A.2', '3.NF.A.3d'], ee: ['M.EE.4.NF.2', 'M.EE.3.NF.3', 'M.EE.6.NS.1'] }, // Compare Fractions (>, <, =)
    'fractions:simplify': { ccss: ['4.NF.A.1'], ee: ['M.EE.4.NF.1'] }, // Simplify Fractions
    'fractions:improper_mixed': { ccss: ['4.NF.B.3c', '4.NF.B.3b'], ee: ['M.EE.4.NF.3'] }, // Improper ↔ Mixed Numbers
    'fractions:mixed_improper_visual': { ccss: ['4.NF.B.3c', '4.NF.B.3b'], ee: ['M.EE.4.NF.3'] }, // Mixed ↔ Improper (Visual Pizza)
    'fractions:mixed_fractions': { ccss: [], ee: [], pool: true }, // Mixed Fractions
    'fractions:compose_target_frac': { ccss: ['4.NF.B.3b', '4.NF.B.3a'], ee: ['M.EE.4.NF.3'] }, // Compose a Target Fraction
    'fractions:identify_nv': { ccss: ['3.NF.A.1', '3.G.A.2'], ee: ['M.EE.3.NF.1', 'M.EE.3.G.2'] }, // Identify Fractions (No Visuals)
    'fractions:fraction_of_set_nv': { ccss: ['3.NF.A.1', '5.NF.B.4a'], ee: ['M.EE.3.NF.1'] }, // Fraction of a Set (No Visuals)
    'fractions:fraction_of_set_hard_nv': { ccss: ['5.NF.B.4a', '4.NF.B.4c'], ee: [] }, // Fraction of a Set - Hard (No Visuals)
    'fractions:order_fractions': { ccss: ['4.NF.A.2', '3.NF.A.3d'], ee: ['M.EE.4.NF.2', 'M.EE.3.NF.3'] }, // Order Fractions
    'fractions:order_frac_numline': { ccss: ['3.NF.A.2b', '4.NF.A.2'], ee: ['M.EE.3.NF.2', 'M.EE.4.NF.2'] }, // Fractions on Number Line
    'fractions:benchmark_fractions': { ccss: ['4.NF.A.2', '3.NF.A.2b'], ee: ['M.EE.4.NF.2', 'M.EE.3.NF.2'] }, // Benchmark Fractions (0, ¼, ½, ¾, 1)
    'fractions:compare_frac_lcd': { ccss: ['4.NF.A.2'], ee: ['M.EE.4.NF.2'] }, // Compare Fractions (LCD)
    'fractions:graph_fractions': { ccss: ['3.NF.A.2b', '3.NF.A.2a'], ee: ['M.EE.3.NF.2'] }, // Place Fractions on Number Line
    'fractions:round_fractions': { ccss: ['5.NF.A.2'], ee: [], approx: true, note: "Rounds mixed numbers to the nearest whole; CCSS names benchmark estimation (5.NF.2) but not rounding fractions." }, // Round Mixed Numbers
    'fractions:fraction_bar_ops': { ccss: ['4.NF.B.3a', '5.NF.A.1'], ee: ['M.EE.4.NF.3', 'M.EE.5.NF.1'] }, // Fraction Bar Operations (Visual)
    'fractions:fraction_nl_drag': { ccss: ['3.NF.A.2b', '3.NF.A.2a'], ee: ['M.EE.3.NF.2'] }, // Place Fractions on a Number Line
    'fractions:mixed_nl_drag': { ccss: [], ee: [], pool: true }, // Place Mixed Numbers on a Number Line

    // ---- fraction_operations
    'fraction_operations:add_fractions_like': { ccss: ['4.NF.B.3a'], ee: ['M.EE.4.NF.3'] }, // Add Fractions (Like Denom) (Visual)
    'fraction_operations:sub_fractions_like': { ccss: ['4.NF.B.3a'], ee: ['M.EE.4.NF.3'] }, // Subtract Fractions (Like Denom) (Visual)
    'fraction_operations:add_mixed_like': { ccss: ['4.NF.B.3c'], ee: ['M.EE.4.NF.3'] }, // Add Mixed Numbers (Like Denom) (Visual)
    'fraction_operations:sub_mixed_like': { ccss: ['4.NF.B.3c'], ee: ['M.EE.4.NF.3'] }, // Subtract Mixed Numbers (Like Denom) (Visual)
    'fraction_operations:mult_frac_whole': { ccss: ['4.NF.B.4b', '4.NF.B.4a'], ee: [] }, // Fraction × Whole Number (Visual)
    'fraction_operations:decompose_fractions': { ccss: ['4.NF.B.3b'], ee: ['M.EE.4.NF.3'] }, // Decompose to Unit Fractions (Visual)
    'fraction_operations:frac_word_problems': { ccss: ['4.NF.B.3d'], ee: ['M.EE.4.NF.3'] }, // Fraction Word Problems (+/−) (Visual)
    'fraction_operations:frac_word_problems_plain': { ccss: ['4.NF.B.3d'], ee: ['M.EE.4.NF.3'] }, // Fraction Word Problems (No Pictures)
    'fraction_operations:frac_10_100': { ccss: ['4.NF.C.5'], ee: [] }, // Fractions /10 as /100 (Visual)
    'fraction_operations:add_frac_unlike': { ccss: ['5.NF.A.1'], ee: ['M.EE.5.NF.1'] }, // Add Fractions (Unlike Denom) (Visual)
    'fraction_operations:sub_frac_unlike': { ccss: ['5.NF.A.1'], ee: ['M.EE.5.NF.1'] }, // Subtract Fractions (Unlike Denom) (Visual)
    'fraction_operations:add_mixed_unlike': { ccss: ['5.NF.A.1'], ee: ['M.EE.5.NF.1'] }, // Add Mixed Numbers (Unlike Denom) (Visual)
    'fraction_operations:sub_mixed_unlike': { ccss: ['5.NF.A.1'], ee: ['M.EE.5.NF.1'] }, // Subtract Mixed Numbers (Unlike Denom) (Visual)
    'fraction_operations:add_frac_like_nv': { ccss: ['4.NF.B.3a'], ee: ['M.EE.4.NF.3'] }, // Add Fractions (Like Denom) (No Visuals)
    'fraction_operations:sub_frac_like_nv': { ccss: ['4.NF.B.3a'], ee: ['M.EE.4.NF.3'] }, // Subtract Fractions (Like Denom) (No Visuals)
    'fraction_operations:add_frac_unlike_nv': { ccss: ['5.NF.A.1'], ee: ['M.EE.5.NF.1'] }, // Add Fractions (Unlike Denom) (No Visuals)
    'fraction_operations:sub_frac_unlike_nv': { ccss: ['5.NF.A.1'], ee: ['M.EE.5.NF.1'] }, // Subtract Fractions (Unlike Denom) (No Visuals)
    'fraction_operations:add_mixed_like_nv': { ccss: ['4.NF.B.3c'], ee: ['M.EE.4.NF.3'] }, // Add Mixed Numbers (Like Denom) (No Visuals)
    'fraction_operations:sub_mixed_like_nv': { ccss: ['4.NF.B.3c'], ee: ['M.EE.4.NF.3'] }, // Subtract Mixed Numbers (Like Denom) (No Visuals)
    'fraction_operations:add_mixed_unlike_nv': { ccss: ['5.NF.A.1'], ee: ['M.EE.5.NF.1'] }, // Add Mixed Numbers (Unlike Denom) (No Visuals)
    'fraction_operations:sub_mixed_unlike_nv': { ccss: ['5.NF.A.1'], ee: ['M.EE.5.NF.1'] }, // Subtract Mixed Numbers (Unlike Denom) (No Visuals)
    'fraction_operations:mult_frac_whole_nv': { ccss: ['4.NF.B.4b', '4.NF.B.4a'], ee: [] }, // Fraction × Whole Number (No Visuals)
    'fraction_operations:decompose_frac_nv': { ccss: ['4.NF.B.3b'], ee: ['M.EE.4.NF.3'] }, // Decompose to Unit Fractions (No Visuals)
    'fraction_operations:frac_10_100_nv': { ccss: ['4.NF.C.5'], ee: [] }, // Fractions /10 as /100 (No Visuals)
    'fraction_operations:mult_frac_frac_nv': { ccss: ['5.NF.B.4a'], ee: [] }, // Fraction × Fraction (No Visuals)
    'fraction_operations:div_unit_frac_nv': { ccss: ['5.NF.B.7a', '5.NF.B.7b'], ee: [] }, // Divide with Unit Fractions (No Visuals)
    'fraction_operations:frac_as_div_nv': { ccss: ['5.NF.B.3'], ee: [] }, // Fraction as Division (No Visuals)
    'fraction_operations:frac_as_div_word': { ccss: ['5.NF.B.3'], ee: [] }, // Fraction as Division Word Problems
    'fraction_operations:mult_scaling_nv': { ccss: ['5.NF.B.5a', '5.NF.B.5b'], ee: [] }, // Multiplication as Scaling (No Visuals)
    'fraction_operations:mult_frac_frac': { ccss: ['5.NF.B.4a', '5.NF.B.4b'], ee: [] }, // Fraction × Fraction (Visual)
    'fraction_operations:div_unit_fraction': { ccss: ['5.NF.B.7a', '5.NF.B.7b'], ee: [] }, // Divide with Unit Fractions (Visual)
    'fraction_operations:frac_as_division': { ccss: ['5.NF.B.3'], ee: [] }, // Fraction as Division (a/b = a÷b) (Visual)
    'fraction_operations:mult_scaling': { ccss: ['5.NF.B.5a', '5.NF.B.5b'], ee: [] }, // Multiplication as Scaling (Visual)
    'fraction_operations:frac_mult_word': { ccss: ['5.NF.B.6', '5.NF.B.7c', '5.NF.B.4b'], ee: [] }, // Fraction Mult/Div Word Problems (Visual)
    'fraction_operations:frac_mult_word_plain': { ccss: ['5.NF.B.6', '5.NF.B.7c'], ee: [] }, // Fraction Mult/Div Word (No Pictures)
    'fraction_operations:frac_word_mixed': { ccss: ['4.NF.B.3d', '4.NF.B.4c'], ee: ['M.EE.4.NF.3'] }, // Mixed Fraction Word Problems (Visual)
    'fraction_operations:frac_word_mixed_plain': { ccss: ['4.NF.B.3d', '4.NF.B.4c'], ee: ['M.EE.4.NF.3'] }, // Mixed Fraction Word Problems (No Pictures)
    'fraction_operations:mixed_fraction_ops': { ccss: [], ee: [], pool: true }, // Mixed Fraction Operations
    'fraction_operations:estimate_frac_ops': { ccss: ['5.NF.A.2'], ee: [] }, // Estimate Fraction Sums/Differences

    // ---- decimals
    'decimals:add_decimal': { ccss: ['5.NBT.B.7', '6.NS.B.3'], ee: ['M.EE.5.NBT.7'] }, // Adding Decimals
    'decimals:sub_decimal': { ccss: ['5.NBT.B.7', '6.NS.B.3'], ee: ['M.EE.5.NBT.7'] }, // Subtracting Decimals
    'decimals:mult_decimal': { ccss: ['5.NBT.B.7', '6.NS.B.3'], ee: ['M.EE.5.NBT.7'] }, // Multiplying Decimals
    'decimals:div_decimal': { ccss: ['6.NS.B.3', '5.NBT.B.7'], ee: ['M.EE.6.NS.3', 'M.EE.5.NBT.7'] }, // Dividing Decimals
    'decimals:compare_decimal': { ccss: ['4.NF.C.7'], ee: [] }, // Comparing Decimals
    'decimals:compare_thousandths': { ccss: ['5.NBT.A.3b'], ee: ['M.EE.5.NBT.3'] }, // Compare Decimals to Thousandths
    'decimals:round_decimals': { ccss: ['5.NBT.A.4'], ee: ['M.EE.5.NBT.4'] }, // Round Decimals (Visual)
    'decimals:round_thousandths': { ccss: ['5.NBT.A.4'], ee: ['M.EE.5.NBT.4'] }, // Round Thousandths
    'decimals:order_decimals': { ccss: ['5.NBT.A.3b', '4.NF.C.7'], ee: ['M.EE.5.NBT.3'] }, // Order Decimals
    'decimals:decimal_nl_drag': { ccss: ['4.NF.C.6'], ee: [] }, // Place Decimals on a Number Line
    'decimals:mixed_decimals': { ccss: [], ee: [], pool: true }, // Mixed Decimals

    // ---- conversions
    'conversions:f_to_d': { ccss: ['4.NF.C.6'], ee: [] }, // Fraction → Decimal
    'conversions:d_to_f': { ccss: ['4.NF.C.6'], ee: [] }, // Decimal → Fraction
    'conversions:f_to_p': { ccss: ['6.RP.A.3c'], ee: [] }, // Fraction → Percent
    'conversions:p_to_f': { ccss: ['6.RP.A.3c'], ee: [] }, // Percent → Fraction
    'conversions:d_to_p': { ccss: ['6.RP.A.3c'], ee: [] }, // Decimal → Percent
    'conversions:p_to_d': { ccss: ['6.RP.A.3c'], ee: [] }, // Percent → Decimal
    'conversions:percent_visual': { ccss: ['6.RP.A.3c'], ee: [] }, // Percent Grid (Visual)
    'conversions:percent_of_number': { ccss: ['6.RP.A.3c'], ee: [] }, // Percent of a Number
    'conversions:find_whole_from_pct': { ccss: ['6.RP.A.3c'], ee: [] }, // Find the Whole from Percent
    'conversions:order_fdp': { ccss: ['6.RP.A.3c', '6.NS.C.7a'], ee: ['M.EE.6.NS.7'] }, // Order Fractions, Decimals & Percents
    'conversions:ratio_intro': { ccss: ['6.RP.A.1'], ee: ['M.EE.6.RP.1'] }, // Write Ratios (a:b)
    'conversions:unit_rate_intro': { ccss: ['6.RP.A.2', '6.RP.A.3b'], ee: [] }, // Compute Unit Rates
    'conversions:double_num_line': { ccss: ['6.RP.A.3', '6.RP.A.3b'], ee: [] }, // Double Number Lines (Visual)
    'conversions:mixed_conversions': { ccss: [], ee: [], pool: true }, // Mixed Conversions
    'conversions:equiv_ratios': { ccss: ['6.RP.A.3a'], ee: [] }, // Equivalent Ratios
    'conversions:ratio_tables': { ccss: ['6.RP.A.3a'], ee: [] }, // Ratio Tables (Find Missing Value)

    // ---- frac_dec_mixed
    'frac_dec_mixed:fractions_all': { ccss: [], ee: [], pool: true }, // All Fraction Skills
    'frac_dec_mixed:decimals_all': { ccss: [], ee: [], pool: true }, // All Decimal Skills
    'frac_dec_mixed:conversions_all': { ccss: [], ee: [], pool: true }, // All Conversion Skills
    'frac_dec_mixed:fdp_all': { ccss: [], ee: [], pool: true }, // All FDP Skills

    // ---- shapes_early
    'shapes_early:name_2d_shapes': { ccss: ['K.G.A.2'], ee: ['M.EE.K.G.2', 'M.EE.2.G.1', 'M.EE.3.G.1', 'M.EE.K.G.3', 'M.EE.1.G.2'] }, // Identify 2D Shapes (Visual)
    'shapes_early:name_3d_shapes': { ccss: ['K.G.A.2', 'K.G.A.3'], ee: ['M.EE.K.G.2', 'M.EE.K.G.3', 'M.EE.5.MD.3'] }, // Identify 3D Shapes (Visual)
    'shapes_early:shape_name_match_2d': { ccss: ['K.G.A.2'], ee: ['M.EE.K.G.2'] }, // Match Names to 2D Shapes
    'shapes_early:shape_name_match_3d': { ccss: ['K.G.A.2', 'K.G.A.3'], ee: ['M.EE.K.G.2', 'M.EE.K.G.3'] }, // Match Names to 3D Shapes
    'shapes_early:shape_positions': { ccss: ['K.G.A.1'], ee: [] }, // Shape Positions: Above/Below/Beside (Visual)
    'shapes_early:shape_corners_count': { ccss: ['K.G.B.4'], ee: [] }, // Count Corners on a Shape (Visual)
    'shapes_early:count_edges_faces_vertices': { ccss: ['2.G.A.1'], ee: ['M.EE.2.G.1'] }, // Count Edges, Faces & Vertices on 3D Shape (Visual)
    'shapes_early:count_sides_vertices_2d': { ccss: ['2.G.A.1', 'K.G.B.4'], ee: ['M.EE.2.G.1', 'M.EE.3.G.1'] }, // Count Sides & Vertices on 2D Shape (Visual)
    'shapes_early:order_objects_length': { ccss: ['1.MD.A.1'], ee: ['M.EE.1.MD.1', 'M.EE.2.MD.3', 'M.EE.2.MD.4'] }, // Order Objects by Length (Visual)
    'shapes_early:measure_nonstandard': { ccss: ['1.MD.A.2'], ee: ['M.EE.1.MD.2', 'M.EE.2.MD.1'] }, // Measure with Non-Standard Units (Visual)
    'shapes_early:compose_shapes': { ccss: ['K.G.B.6', '1.G.A.2'], ee: ['M.EE.1.G.2', 'M.EE.1.G.3'] }, // Combine Shapes (Visual)
    'shapes_early:compose_hexagon': { ccss: ['1.G.A.2'], ee: ['M.EE.1.G.2', 'M.EE.1.G.3'] }, // Compose a Hexagon from Pattern Blocks
    'shapes_early:compose_rect_from_squares': { ccss: ['2.G.A.2'], ee: [] }, // Compose a Rectangle from Squares
    'shapes_early:partition_shapes': { ccss: ['1.G.A.3', '2.G.A.3', '3.G.A.2'], ee: ['M.EE.1.G.3'] }, // Halves/Thirds/Fourths (Visual)
    'shapes_early:shape_attributes': { ccss: ['1.G.A.1'], ee: ['M.EE.1.G.1', 'M.EE.3.G.1', 'M.EE.4.G.2'] }, // Shapes by Attributes (Visual)
    'shapes_early:compose_from_attributes': { ccss: ['1.G.A.1', '2.G.A.1', '4.G.A.2'], ee: ['M.EE.1.G.1', 'M.EE.2.G.1', 'M.EE.5.G.1', 'M.EE.5.G.2', 'M.EE.5.G.3', 'M.EE.5.G.4'] }, // Find Shapes by Attributes (Multi-Select)
    'shapes_early:mixed_shapes_early': { ccss: [], ee: [], pool: true }, // Mixed Early Shapes

    // ---- area_perimeter
    'area_perimeter:perimeter_intro': { ccss: ['3.MD.D.8'], ee: [] }, // Perimeter Intro - Sum the Sides (Visual)
    'area_perimeter:area_unit_squares': { ccss: ['3.MD.C.6', '3.MD.C.5b', '3.MD.C.5a', '3.MD.C.7a'], ee: ['M.EE.4.MD.3', 'M.EE.6.G.1'] }, // Area - Unit Square Counting (Visual)
    'area_perimeter:perimeter_grid': { ccss: ['3.MD.D.8'], ee: [] }, // Perimeter - Grid Counting (Visual)
    'area_perimeter:perimeter': { ccss: ['3.MD.D.8', '4.MD.A.3'], ee: ['M.EE.4.MD.3'] }, // Perimeter Only
    'area_perimeter:area': { ccss: ['3.MD.C.7b', '4.MD.A.3'], ee: ['M.EE.4.MD.3'] }, // Area Only
    'area_perimeter:area_perimeter': { ccss: ['4.MD.A.3', '3.MD.D.8'], ee: ['M.EE.4.MD.3'] }, // Area AND Perimeter
    'area_perimeter:area_distributive_visual': { ccss: ['3.MD.C.7c'], ee: [] }, // Distributive Area Model (Visual)
    'area_perimeter:area_triangle': { ccss: ['6.G.A.1'], ee: ['M.EE.6.G.1'] }, // Area of a Triangle (b×h÷2)
    'area_perimeter:area_polygon_decompose': { ccss: ['6.G.A.1', '3.MD.C.7d'], ee: ['M.EE.6.G.1'] }, // Decompose Polygon Area (L/T/U)
    'area_perimeter:composite_shapes': { ccss: ['6.G.A.1', '3.MD.C.7d'], ee: ['M.EE.6.G.1'] }, // Composite Shapes (L, T, U)
    'area_perimeter:volume': { ccss: ['5.MD.C.5b', '5.MD.C.5a'], ee: ['M.EE.5.MD.5', 'M.EE.6.G.2'] }, // Volume (Rectangular Prisms)
    'area_perimeter:volume_composite': { ccss: ['5.MD.C.5b'], ee: ['M.EE.5.MD.5'] }, // Composite 3D Volume (Visual)
    'area_perimeter:mixed_area_perimeter': { ccss: [], ee: [], pool: true }, // Mixed Area & Perimeter

    // ---- angles_lines
    'angles_lines:identify_angles': { ccss: ['4.G.A.1'], ee: ['M.EE.4.G.1', 'M.EE.4.MD.5'] }, // Identify Angles
    'angles_lines:measure_angles': { ccss: ['4.MD.C.6'], ee: ['M.EE.4.MD.6'] }, // Measure/Estimate Angles
    'angles_lines:identify_lines': { ccss: ['4.G.A.1'], ee: ['M.EE.4.G.1'] }, // Identify Lines (∥, ⊥)
    'angles_lines:symmetry': { ccss: ['4.G.A.3'], ee: ['M.EE.4.G.3'] }, // Lines of Symmetry
    'angles_lines:place_symmetry_lines': { ccss: ['4.G.A.3'], ee: ['M.EE.4.G.3'] }, // Draw Lines of Symmetry
    'angles_lines:additive_angles': { ccss: ['4.MD.C.7'], ee: [] }, // Two Angles Sum (Visual)
    'angles_lines:mixed_angles_lines': { ccss: [], ee: [], pool: true }, // Mixed Angles & Lines

    // ---- shapes_classify
    'shapes_classify:classify_triangles': { ccss: ['4.G.A.2', '5.G.B.4'], ee: ['M.EE.4.G.2'] }, // Classify Triangles
    'shapes_classify:classify_quads': { ccss: ['5.G.B.4', '5.G.B.3', '3.G.A.1', '4.G.A.2'], ee: ['M.EE.5.G.4', 'M.EE.5.G.3'] }, // Classify Quadrilaterals
    'shapes_classify:hotspot_quads': { ccss: ['3.G.A.1'], ee: ['M.EE.3.G.1'] }, // Circle the Quadrilaterals
    'shapes_classify:net_identify': { ccss: ['6.G.A.4'], ee: [] }, // Identify Net of 3D Shape (Visual)
    'shapes_classify:cross_section_3d': { ccss: ['6.G.A.4'], ee: [], approx: true, note: "Cross-sections are CCSS 7.G.A.3 (grade 7); 6.G.4 (nets of 3-D figures) is the closest K-6 standard." }, // Cross-Section of 3D Shape (Visual)
    'shapes_classify:mixed_shapes': { ccss: [], ee: [], pool: true }, // Mixed Shape Classification

    // ---- coordinates
    'coordinates:coordinate_q1': { ccss: ['5.G.A.1', '5.G.A.2'], ee: ['M.EE.5.G.1'] }, // Coordinates (Quadrant I)
    'coordinates:coordinate_all': { ccss: ['6.NS.C.6c', '6.NS.C.6b', '6.NS.C.8'], ee: ['M.EE.6.NS.6'] }, // Coordinates (All 4 Quadrants)
    'coordinates:coordinate_graph': { ccss: ['5.G.A.2', '5.G.A.1'], ee: ['M.EE.5.G.2', 'M.EE.5.G.1'] }, // Coordinate Graphing
    'coordinates:coord_distance_q1': { ccss: ['6.NS.C.8', '6.G.A.3'], ee: ['M.EE.6.NS.8'] }, // Distance Between Points (Visual, Q1)
    'coordinates:coord_polygon': { ccss: ['6.G.A.3'], ee: [] }, // Polygon on Coord Grid (Side Lengths/Perimeter)
    'coordinates:net_surface_area': { ccss: ['6.G.A.4'], ee: [] }, // Net → Surface Area (Visual)
    'coordinates:geo_reflect': { ccss: ['6.NS.C.6b'], ee: ['M.EE.6.NS.6'], approx: true, note: "Reflections are CCSS 8.G.A.1 (grade 8); 6.NS.6b (points reflected across the axes) is the closest K-6 standard." }, // Reflections (Visual, MC)
    'coordinates:geo_rotate': { ccss: [], ee: [], reason: "Rotations and translations are CCSS grade 8 (8.G.A.1-3); no K-6 standard covers them." }, // Rotations (Visual, MC)
    'coordinates:geo_translate': { ccss: [], ee: [], reason: "Rotations and translations are CCSS grade 8 (8.G.A.1-3); no K-6 standard covers them." }, // Translations (Visual, MC)
    'coordinates:mixed_coordinates': { ccss: [], ee: [], pool: true }, // Mixed Coordinates

    // ---- measurement
    'measurement:time_hour': { ccss: ['1.MD.B.3'], ee: ['M.EE.1.MD.3', 'M.EE.2.MD.7', 'M.EE.3.MD.1', 'M.EE.4.MD.2'] }, // Time to the Hour
    'measurement:time_half_hour': { ccss: ['1.MD.B.3'], ee: ['M.EE.1.MD.3', 'M.EE.5.MD.1'] }, // Time to Half Hour
    'measurement:time_quarter': { ccss: ['2.MD.C.7'], ee: ['M.EE.2.MD.7', 'M.EE.5.MD.1'] }, // Time to Quarter Hour
    'measurement:time_5min': { ccss: ['2.MD.C.7'], ee: ['M.EE.2.MD.7', 'M.EE.5.MD.1'] }, // Time to 5 Minutes
    'measurement:time_1min': { ccss: ['3.MD.A.1'], ee: ['M.EE.3.MD.1', 'M.EE.5.MD.1'] }, // Time to the Minute
    'measurement:time_analog_digital': { ccss: ['2.MD.C.7', '1.MD.B.3'], ee: ['M.EE.2.MD.7', 'M.EE.1.MD.3', 'M.EE.4.MD.2', 'M.EE.3.MD.1'] }, // Analog ↔ Digital Match
    'measurement:time_match_clock': { ccss: ['2.MD.C.7'], ee: ['M.EE.2.MD.7'] }, // Match Time to Clock
    'measurement:order_clocks_analog_asc': { ccss: ['2.MD.C.7'], ee: ['M.EE.2.MD.7', 'M.EE.1.MD.3'], approx: true, note: 'Ordering times is not itself a CCSS standard; EE 1.MD.3.c (before, next, after) is the closest.' }, // Order Clocks (Analog) — Earliest to Latest
    'measurement:order_clocks_analog_desc': { ccss: ['2.MD.C.7'], ee: ['M.EE.2.MD.7', 'M.EE.1.MD.3'], approx: true, note: 'Ordering times is not itself a CCSS standard; EE 1.MD.3.c (before, next, after) is the closest.' }, // Order Clocks (Analog) — Latest to Earliest
    'measurement:order_clocks_digital_asc': { ccss: ['2.MD.C.7'], ee: ['M.EE.2.MD.7', 'M.EE.1.MD.3'], approx: true, note: 'Ordering times is not itself a CCSS standard; EE 1.MD.3.c (before, next, after) is the closest.' }, // Order Clocks (Digital) — Earliest to Latest
    'measurement:order_clocks_digital_desc': { ccss: ['2.MD.C.7'], ee: ['M.EE.2.MD.7', 'M.EE.1.MD.3'], approx: true, note: 'Ordering times is not itself a CCSS standard; EE 1.MD.3.c (before, next, after) is the closest.' }, // Order Clocks (Digital) — Latest to Earliest
    'measurement:elapsed_30min': { ccss: ['3.MD.A.1'], ee: ['M.EE.3.MD.1'] }, // Elapsed Time (30 min)
    'measurement:elapsed_hour': { ccss: ['3.MD.A.1'], ee: ['M.EE.3.MD.1', 'M.EE.4.MD.1'] }, // Elapsed Time (Hours)
    'measurement:elapsed_15min': { ccss: ['3.MD.A.1'], ee: ['M.EE.3.MD.1'] }, // Elapsed Time (15 min)
    'measurement:elapsed_mixed': { ccss: ['3.MD.A.1'], ee: ['M.EE.3.MD.1', 'M.EE.4.MD.1'] }, // Elapsed Time (Hours & Minutes)
    'measurement:elapsed_find_duration': { ccss: ['3.MD.A.1', '4.MD.A.1', '4.MD.A.2'], ee: ['M.EE.3.MD.1', 'M.EE.4.MD.1'] }, // Find the Duration
    'measurement:elapsed_visual_easy': { ccss: ['3.MD.A.1'], ee: ['M.EE.3.MD.1'] }, // Elapsed Time Clocks - Easy (Visual)
    'measurement:elapsed_visual_medium': { ccss: ['3.MD.A.1'], ee: ['M.EE.3.MD.1'] }, // Elapsed Time Clocks - Medium (Visual)
    'measurement:elapsed_visual_hard': { ccss: ['3.MD.A.1', '4.MD.A.2'], ee: ['M.EE.3.MD.1', 'M.EE.4.MD.2'] }, // Elapsed Time Clocks - Hard (Visual)
    'measurement:heavier_lighter_visual': { ccss: ['K.MD.A.2'], ee: ['M.EE.K.MD.2'] }, // Heavier or Lighter? (Visual)
    'measurement:pictograph_intro': { ccss: ['1.MD.C.4', '2.MD.D.10'], ee: ['M.EE.1.MD.4', 'M.EE.2.MD.10'] }, // Picture Graph Intro (Visual)
    'measurement:bar_graph_intro': { ccss: ['1.MD.C.4', '2.MD.D.10'], ee: ['M.EE.1.MD.4', 'M.EE.2.MD.10'] }, // Bar Graph Intro (Visual)
    'measurement:reading_ruler': { ccss: ['2.MD.A.1'], ee: ['M.EE.2.MD.1', 'M.EE.3.MD.4', 'M.EE.5.MD.1'] }, // Reading a Ruler (Visual)
    'measurement:reading_ruler_hard': { ccss: ['3.MD.B.4'], ee: ['M.EE.3.MD.4'] }, // Reading a Ruler - Quarter Inches (Visual)
    'measurement:money_count': { ccss: ['2.MD.C.8'], ee: ['M.EE.2.MD.8', 'M.EE.3.NBT.3', 'M.EE.5.MD.1', 'M.EE.4.MD.2', 'M.EE.4.MD.5.d'] }, // Counting Coins & Bills (Visual)
    'measurement:money': { ccss: ['2.MD.C.8', '4.MD.A.2'], ee: ['M.EE.2.MD.8', 'M.EE.4.MD.2'] }, // Money & Making Change
    'measurement:equiv_coin_sets': { ccss: ['2.MD.C.8'], ee: ['M.EE.2.MD.8', 'M.EE.5.MD.1'] }, // Equivalent Coin Sets (Visual)
    'measurement:enough_money': { ccss: ['2.MD.C.8'], ee: ['M.EE.2.MD.8', 'M.EE.5.MD.1'] }, // Do You Have Enough? (Visual)
    'measurement:make_change_least_coins': { ccss: ['2.MD.C.8', '4.MD.A.2'], ee: ['M.EE.2.MD.8', 'M.EE.4.MD.2'] }, // Fewest Coins to Make Amount (Visual)
    'measurement:temperature': { ccss: ['2.MD.B.6'], ee: ['M.EE.2.MD.6'], approx: true, note: "CCSS K-6 does not name temperature; reading a thermometer scale is closest to the number-line scale of 2.MD.6." }, // Temperature (°C/°F)
    'measurement:capacity': { ccss: ['4.MD.A.1', '4.MD.A.2', '5.MD.A.1'], ee: ['M.EE.4.MD.1', 'M.EE.4.MD.2'] }, // Capacity/Volume Units
    'measurement:unit_conversions': { ccss: ['4.MD.A.1', '5.MD.A.1'], ee: ['M.EE.4.MD.1', 'M.EE.5.MD.1'] }, // Measurement Conversions (Visual)
    'measurement:length_customary': { ccss: ['4.MD.A.1', '5.MD.A.1'], ee: ['M.EE.4.MD.1', 'M.EE.5.MD.1'] }, // Customary Length (in/ft/yd/mi)
    'measurement:length_metric': { ccss: ['4.MD.A.1', '5.MD.A.1'], ee: ['M.EE.4.MD.1', 'M.EE.5.MD.1'] }, // Metric Length (mm/cm/m/km)
    'measurement:unit_conversion_word': { ccss: ['4.MD.A.2', '5.MD.A.1'], ee: ['M.EE.4.MD.2', 'M.EE.5.MD.1'] }, // Unit Conversion Word Problems
    'measurement:mass_volume_liquid': { ccss: ['3.MD.A.2'], ee: ['M.EE.3.MD.2', 'M.EE.4.MD.2', 'M.EE.5.MD.1'] }, // Grams, kg, Liters (Visual)
    'measurement:estimate_length': { ccss: ['2.MD.A.3'], ee: ['M.EE.2.MD.3'] }, // Estimate Lengths (Visual)
    'measurement:mixed_measurement': { ccss: [], ee: [], pool: true }, // Mixed Measurement
    'measurement:mixed_time': { ccss: [], ee: [], pool: true }, // Mixed Time Skills
    // ---- measurement: P10 appends (design/research/time-money.md §21)
    'measurement:clock_parts': { ccss: ['1.MD.B.3'], ee: ['M.EE.1.MD.3'], approx: true, note: 'Naming the parts of the face comes before reading it; 1.MD.B.3 is the reading standard it prepares.' }, // Parts of a Clock
    'measurement:time_fives_ring': { ccss: ['2.MD.C.7', '2.NBT.A.2'], ee: ['M.EE.2.MD.7', 'M.EE.2.NBT.2'] }, // Count the Minutes by Fives
    'measurement:time_sense': { ccss: ['2.MD.C.7'], ee: ['M.EE.1.MD.3', 'M.EE.2.MD.7'] }, // a.m. or p.m.?
    'measurement:elapsed_find_start': { ccss: ['3.MD.A.1'], ee: ['M.EE.3.MD.1'] }, // Find the Start Time
    'measurement:coin_value': { ccss: ['2.MD.C.8'], ee: ['M.EE.2.MD.8', 'M.EE.4.MD.2', 'M.EE.4.MD.5.d'] }, // Coins and Notes by Value
    'measurement:money_notation': { ccss: ['2.MD.C.8', '4.MD.A.2'], ee: ['M.EE.2.MD.8'] }, // Write an Amount of Money
    'measurement:money_change': { ccss: ['2.MD.C.8', '4.MD.A.2'], ee: ['M.EE.2.MD.8', 'M.EE.4.MD.2'] }, // Find the Change
    'measurement:money_compare': { ccss: ['2.MD.C.8'], ee: ['M.EE.5.MD.1', 'M.EE.2.MD.8'] }, // Which Has More Money?

    // ---- geo_mixed
    'geo_mixed:geometry_all': { ccss: [], ee: [], pool: true }, // All Geometry Skills
    'geo_mixed:measurement_all': { ccss: [], ee: [], pool: true }, // All Measurement Skills
    'geo_mixed:geo_meas_all': { ccss: [], ee: [], pool: true }, // All Geometry & Measurement

    // ---- graphs
    'graphs:bar_graph': { ccss: ['3.MD.B.3'], ee: ['M.EE.3.MD.3', 'M.EE.2.MD.10', 'M.EE.4.MD.4', 'M.EE.5.MD.2', 'M.EE.6.SP.5'] }, // Bar Graphs
    'graphs:build_bar_graph': { ccss: ['3.MD.B.3', '2.MD.D.10'], ee: ['M.EE.3.MD.3', 'M.EE.2.MD.10', 'M.EE.2.MD.9', 'M.EE.4.MD.4', 'M.EE.6.SP.1', 'M.EE.6.SP.2', 'M.EE.6.SP.4'] }, // Build a Bar Graph
    'graphs:pictograph': { ccss: ['3.MD.B.3'], ee: ['M.EE.3.MD.3', 'M.EE.2.MD.10', 'M.EE.4.MD.4', 'M.EE.5.MD.2'] }, // Pictographs
    'graphs:build_pictograph': { ccss: ['2.MD.D.10', '1.MD.C.4'], ee: ['M.EE.2.MD.10', 'M.EE.6.SP.4'] }, // Build a Pictograph
    'graphs:tally_chart': { ccss: ['1.MD.C.4'], ee: ['M.EE.1.MD.4'] }, // Tally Charts
    'graphs:line_plot': { ccss: ['3.MD.B.4', '4.MD.B.4'], ee: ['M.EE.3.MD.4', 'M.EE.4.MD.4'] }, // Line Plots
    'graphs:line_plot_g2': { ccss: ['2.MD.D.9'], ee: ['M.EE.2.MD.9', 'M.EE.5.MD.2'] }, // Line Plots (Grade 2)
    'graphs:line_plot_fractions': { ccss: ['4.MD.B.4', '5.MD.B.2'], ee: ['M.EE.4.MD.4', 'M.EE.5.MD.2'] }, // Line Plots with Fractions (Visual)
    'graphs:pie_chart': { ccss: ['3.MD.B.3'], ee: ['M.EE.3.MD.3'], approx: true, note: "Circle graphs are not in CCSS K-6; 3.MD.3 (read and answer questions from a graph) is the closest." }, // Pie Charts
    'graphs:mixed_graphs': { ccss: [], ee: [], pool: true }, // Mixed Graphs

    // ---- data_analysis
    'data_analysis:mean': { ccss: ['6.SP.B.5c', '6.SP.A.3'], ee: ['M.EE.6.SP.5'] }, // Mean (Average)
    'data_analysis:median': { ccss: ['6.SP.B.5c', '6.SP.A.3'], ee: ['M.EE.6.SP.5'] }, // Median
    'data_analysis:mode': { ccss: ['6.SP.B.5c'], ee: ['M.EE.6.SP.5'], approx: true, note: "CCSS names mean and median as measures of centre; the mode is not named." }, // Mode
    'data_analysis:range': { ccss: ['6.SP.A.3', '6.SP.B.5c'], ee: ['M.EE.6.SP.5'] }, // Range
    'data_analysis:box_plot_intro': { ccss: ['6.SP.B.4', '6.SP.B.5c'], ee: ['M.EE.6.SP.4', 'M.EE.6.SP.5'] }, // Box Plot - Median, IQR, Range (Visual)
    'data_analysis:histogram_read': { ccss: ['6.SP.B.4', '6.SP.B.5a'], ee: ['M.EE.6.SP.4'] }, // Read a Histogram (Visual)
    'data_analysis:mad': { ccss: ['6.SP.B.5c'], ee: ['M.EE.6.SP.5'] }, // Mean Absolute Deviation (MAD)
    'data_analysis:statistical_question': { ccss: ['6.SP.A.1'], ee: ['M.EE.6.SP.1'] }, // Identify Statistical Questions
    'data_analysis:mixed_data_analysis': { ccss: [], ee: [], pool: true }, // Mixed Data Analysis

    // ---- probability
    'probability:probability_basic': { ccss: [], ee: [], reason: "Probability is CCSS grade 7 (7.SP.C.5-7); no K-6 standard covers it." }, // Basic Probability
    'probability:mixed_probability': { ccss: [], ee: [], pool: true }, // Mixed Probability

    // ---- data_mixed
    'data_mixed:data_stats_all': { ccss: [], ee: [], pool: true }, // All Data & Stats Skills

    // ---- patterns
    'patterns:seq_2': { ccss: ['2.NBT.A.2'], ee: ['M.EE.2.NBT.2'] }, // Count by 2s
    'patterns:seq_5': { ccss: ['2.NBT.A.2'], ee: ['M.EE.2.NBT.2'] }, // Count by 5s
    'patterns:seq_10': { ccss: ['2.NBT.A.2', 'K.CC.A.1'], ee: ['M.EE.2.NBT.2', 'M.EE.K.CC.1', 'M.EE.3.NBT.3'] }, // Count by 10s
    'patterns:count_by_fill': { ccss: ['2.NBT.A.2', '3.OA.D.9'], ee: ['M.EE.2.NBT.2', 'M.EE.3.OA.8'] }, // Count-By Fill-In (1-12)
    'patterns:skip_count_line': { ccss: ['2.NBT.A.2'], ee: ['M.EE.2.NBT.2'] }, // Skip Counting Number Line (Visual)
    'patterns:skip_count_grid': { ccss: ['2.NBT.A.2'], ee: ['M.EE.2.NBT.2'] }, // Skip Counting Grid (Visual)
    'patterns:count_by_step_up': { ccss: ['2.NBT.A.2', '3.OA.D.9'], ee: ['M.EE.2.NBT.2', 'M.EE.3.OA.8'] }, // Count Up by Step (Grid)
    'patterns:count_by_step_down': { ccss: ['2.NBT.A.2', '3.OA.D.9'], ee: ['M.EE.2.NBT.2', 'M.EE.3.OA.8'] }, // Count Down by Step (Grid)
    'patterns:count_by_powers_of_10': { ccss: ['2.NBT.A.2'], ee: ['M.EE.2.NBT.2'] }, // Count by Powers of 10 (Grid)
    'patterns:double': { ccss: ['2.OA.C.3', '1.OA.C.6'], ee: ['M.EE.2.OA.3'] }, // Doubling
    'patterns:halve': { ccss: ['2.OA.C.3', '3.OA.A.2'], ee: ['M.EE.2.OA.3', 'M.EE.3.OA.2'] }, // Halving
    'patterns:shape_pattern': { ccss: ['4.OA.C.5'], ee: ['M.EE.4.OA.5'] }, // Shape Patterns (Visual)
    'patterns:number_pattern': { ccss: ['4.OA.C.5'], ee: ['M.EE.4.OA.5', 'M.EE.3.OA.8', 'M.EE.5.OA.3'] }, // Number Patterns
    'patterns:pattern_relationship': { ccss: ['5.OA.B.3'], ee: ['M.EE.5.OA.3'] }, // Two Patterns, Find Relationship (Visual)
    'patterns:mixed_patterns': { ccss: [], ee: [], pool: true }, // Mixed Patterns
    'patterns:number_patterns_rule': { ccss: ['3.OA.D.9', '4.OA.C.5'], ee: ['M.EE.3.OA.8', 'M.EE.4.OA.5'] }, // Number Patterns: Count On, Count Back, Double

    // ---- algebra
    'algebra:tape_diagram': { ccss: ['2.OA.A.1', '3.NBT.A.2'], ee: ['M.EE.4.OA.3', 'M.EE.3.OA.7'] }, // Tape Diagrams / Bar Models (Visual)
    'algebra:tape_diagram_plain': { ccss: ['2.OA.A.1', '3.NBT.A.2'], ee: ['M.EE.4.OA.3', 'M.EE.3.OA.7'] }, // Tape Diagrams (No Pictures)
    'algebra:multi_step_word': { ccss: ['4.OA.A.3', '3.OA.D.8', '2.OA.A.1'], ee: ['M.EE.4.OA.3', 'M.EE.3.OA.7'] }, // Multi-Step Word Problems (Visual)
    'algebra:multi_step_word_plain': { ccss: ['4.OA.A.3', '3.OA.D.8', '2.OA.A.1'], ee: ['M.EE.4.OA.3', 'M.EE.3.OA.7'] }, // Multi-Step Word Problems (No Pictures)
    'algebra:solve_unknown': { ccss: ['6.EE.B.7', '6.EE.B.5'], ee: ['M.EE.6.EE.5-7'] }, // Solve for Unknown (x + 5 = 12)
    'algebra:balance_addsub': { ccss: ['1.OA.D.7', '1.OA.D.8'], ee: ['M.EE.1.OA.7'] }, // Balance Equations (7 + 5 = __ + 3) (MAP)
    'algebra:write_expression': { ccss: ['6.EE.A.2a'], ee: [] }, // Write Expressions from Words
    'algebra:evaluate_expression': { ccss: ['6.EE.A.2c'], ee: [] }, // Evaluate Expressions (Easy)
    'algebra:evaluate_expression_hard': { ccss: ['6.EE.A.2c', '6.EE.A.1'], ee: ['M.EE.6.EE.1-2'] }, // Evaluate Expressions (Multi-Step)
    'algebra:inequalities': { ccss: ['6.EE.B.8', '6.EE.B.5'], ee: ['M.EE.6.EE.5-7', 'M.EE.6.EE.1-2'] }, // Inequalities (>, <, ≥, ≤)
    'algebra:combine_like_terms': { ccss: ['6.EE.A.3', '6.EE.A.4'], ee: ['M.EE.6.EE.3'] }, // Combine Like Terms
    'algebra:distributive_expr': { ccss: ['6.EE.A.3'], ee: ['M.EE.6.EE.3'] }, // Distributive Property of Expressions
    'algebra:function_table_easy': { ccss: ['4.OA.C.5', '5.OA.B.3'], ee: ['M.EE.4.OA.5', 'M.EE.5.OA.3'] }, // Function Tables - Easy (Visual)
    'algebra:function_table_hard': { ccss: ['4.OA.C.5', '5.OA.B.3', '6.EE.C.9'], ee: ['M.EE.4.OA.5', 'M.EE.5.OA.3'] }, // Function Tables - Hard (Visual)
    'algebra:algebra_word_mixed': { ccss: ['4.OA.A.3', '3.OA.D.8'], ee: ['M.EE.4.OA.3', 'M.EE.3.OA.7'] }, // Mixed Algebra Word Problems (Visual)
    'algebra:algebra_word_mixed_plain': { ccss: ['4.OA.A.3', '3.OA.D.8'], ee: ['M.EE.4.OA.3', 'M.EE.3.OA.7'] }, // Mixed Algebra Word Problems (No Pictures)
    'algebra:solve_eq_addsub': { ccss: ['6.EE.B.7', '6.EE.B.5'], ee: ['M.EE.6.EE.5-7'] }, // Solve One-Step Equations (+/−)
    'algebra:solve_eq_multdiv': { ccss: ['6.EE.B.7', '6.EE.B.5'], ee: ['M.EE.6.EE.5-7'] }, // Solve One-Step Equations (×/÷)
    'algebra:solve_eq_twostep': { ccss: ['6.EE.B.7'], ee: ['M.EE.6.EE.5-7'], approx: true, note: "Two-step equations are CCSS 7.EE.B.4a (grade 7); 6.EE.7 (one-step) is the closest K-6 standard." }, // Solve Two-Step Equations
    'algebra:write_equation': { ccss: ['6.EE.B.7', '6.EE.B.6'], ee: ['M.EE.6.EE.5-7'] }, // Write Equations from Words
    'algebra:build_expr_addsub': { ccss: ['2.OA.A.1', '5.OA.A.2'], ee: [] }, // Build the Expression: +/−
    'algebra:build_expr_multdiv': { ccss: ['3.OA.A.3', '5.OA.A.2'], ee: [] }, // Build the Expression: ×/÷
    'algebra:mixed_algebra': { ccss: [], ee: [], pool: true }, // Mixed Algebra

    // ---- order_of_operations
    'order_of_operations:oop_easy': { ccss: ['5.OA.A.1', '6.EE.A.2c'], ee: [] }, // OoO Easy: Two Ops, No Parens
    'order_of_operations:oop_medium': { ccss: ['5.OA.A.1'], ee: [] }, // OoO Medium: Parentheses
    'order_of_operations:oop_hard': { ccss: ['6.EE.A.1', '6.EE.A.2c'], ee: ['M.EE.6.EE.1-2'] }, // OoO Hard: Brackets & Exponents
    'order_of_operations:two_ops_no_paren': { ccss: ['5.OA.A.1', '6.EE.A.2c'], ee: [] }, // Level 1: Two Operations
    'order_of_operations:three_ops_no_paren': { ccss: ['5.OA.A.1', '6.EE.A.2c'], ee: [] }, // Level 2: Three Operations
    'order_of_operations:multi_ops_no_paren': { ccss: ['5.OA.A.1', '6.EE.A.2c'], ee: [] }, // Level 3: Four to Six Operations
    'order_of_operations:paren_simple': { ccss: ['5.OA.A.1'], ee: [] }, // Level 4: Simple Parentheses
    'order_of_operations:paren_multi': { ccss: ['5.OA.A.1'], ee: [] }, // Level 5: Multiple Ops with Parens
    'order_of_operations:nested_complex': { ccss: ['5.OA.A.1'], ee: [] }, // Level 6: Complex Nested Brackets
    'order_of_operations:exponents_simple': { ccss: ['6.EE.A.1', '6.EE.A.2c'], ee: ['M.EE.6.EE.1-2'] }, // Level 7: Exponents
    'order_of_operations:compare_expressions': { ccss: ['5.OA.A.1'], ee: ['M.EE.6.EE.1-2'] }, // Compare Expressions (=, ≠, <, >)
    'order_of_operations:mixed_order_ops': { ccss: [], ee: [], pool: true }, // Mixed Order of Operations

    // ---- placevalue
    'placevalue:more_less_10': { ccss: ['1.NBT.C.5'], ee: ['M.EE.1.OA.5'] }, // 1 More, 1 Less, 10 More, 10 Less
    'placevalue:more_less_100': { ccss: ['2.NBT.B.8'], ee: [] }, // 10 More, 10 Less, 100 More, 100 Less
    'placevalue:place_value_disks': { ccss: ['2.NBT.A.1'], ee: ['M.EE.2.NBT.1'] }, // Read Place-Value Disks
    'placevalue:pv_disks_build': { ccss: ['2.NBT.A.1', '2.NBT.A.3'], ee: ['M.EE.2.NBT.1', 'M.EE.2.NBT.3'] }, // Draw Place-Value Disks for a Number
    'placevalue:pv_digit_drag': { ccss: ['4.NBT.A.2', '4.NBT.A.1'], ee: ['M.EE.4.NBT.2'] }, // Write the Digits in a Place-Value Chart
    'placevalue:number_word_names': { ccss: ['4.NBT.A.2', '2.NBT.A.3'], ee: ['M.EE.4.NBT.2', 'M.EE.2.NBT.3'] }, // Choose the Word Name
    'placevalue:place_value_10x': { ccss: ['5.NBT.A.2', '5.NBT.A.1'], ee: ['M.EE.5.NBT.2', 'M.EE.5.NBT.1'] }, // Multiply and Divide by 10, 100, 1,000
    'placevalue:identify': { ccss: ['2.NBT.A.1', '4.NBT.A.1'], ee: ['M.EE.2.NBT.1'] }, // Name the Place
    'placevalue:value': { ccss: ['2.NBT.A.1', '4.NBT.A.1'], ee: ['M.EE.2.NBT.1'] }, // Value of a Digit
    'placevalue:compare': { ccss: ['2.NBT.A.4', '4.NBT.A.2', '1.NBT.B.3', 'K.CC.C.7'], ee: ['M.EE.2.NBT.4', 'M.EE.4.NBT.2', 'M.EE.1.NBT.3', 'M.EE.5.NBT.3', 'M.EE.5.NBT.1'] }, // Compare Numbers (>, <, =)
    'placevalue:expand': { ccss: ['2.NBT.A.3', '4.NBT.A.2'], ee: ['M.EE.2.NBT.3', 'M.EE.4.NBT.2'] }, // Expanded Form
    'placevalue:unit_form': { ccss: ['2.NBT.A.1', '2.NBT.A.3'], ee: ['M.EE.2.NBT.3'] }, // Unit Form
    'placevalue:combine': { ccss: ['2.NBT.A.3', '4.NBT.A.2'], ee: ['M.EE.2.NBT.3', 'M.EE.4.NBT.2'] }, // Standard Form
    'placevalue:order_least_to_greatest': { ccss: ['2.NBT.A.4', '4.NBT.A.2'], ee: ['M.EE.2.NBT.4', 'M.EE.4.NBT.2'] }, // Order: Least to Greatest
    'placevalue:order_greatest_to_least': { ccss: ['2.NBT.A.4', '4.NBT.A.2'], ee: ['M.EE.2.NBT.4', 'M.EE.4.NBT.2'] }, // Order: Greatest to Least
    'placevalue:mixed_placevalue': { ccss: [], ee: [], pool: true }, // Mixed Place Value

    // ---- number_sense
    'number_sense:rounding_visual': { ccss: ['3.NBT.A.1'], ee: ['M.EE.3.NBT.1'] }, // Round on a Number Line
    'number_sense:between_tens': { ccss: ['3.NBT.A.1'], ee: ['M.EE.3.NBT.1'] }, // Find the Two Tens a Number Is Between
    'number_sense:place_on_number_line': { ccss: ['2.MD.B.6', '3.NBT.A.1'], ee: ['M.EE.3.NBT.1'] }, // Mark a Number on a Number Line
    'number_sense:round_nl_thousands': { ccss: ['4.NBT.A.3'], ee: ['M.EE.4.NBT.3'] }, // Round on a Number Line: Thousands
    'number_sense:round_nl_ten_thousands': { ccss: ['4.NBT.A.3'], ee: ['M.EE.4.NBT.3'] }, // Round on a Number Line: Ten Thousands
    'number_sense:round_nl_hundred_thousands': { ccss: ['4.NBT.A.3'], ee: ['M.EE.4.NBT.3'] }, // Round on a Number Line: Hundred Thousands
    'number_sense:nearest_10': { ccss: ['3.NBT.A.1'], ee: ['M.EE.3.NBT.1'] }, // Round to Nearest 10
    'number_sense:nearest_100': { ccss: ['3.NBT.A.1'], ee: ['M.EE.3.NBT.1'] }, // Round to Nearest 100
    'number_sense:nearest_1000': { ccss: ['4.NBT.A.3'], ee: ['M.EE.4.NBT.3'] }, // Round to Nearest 1,000
    'number_sense:nearest_10000': { ccss: ['4.NBT.A.3'], ee: ['M.EE.4.NBT.3'] }, // Round to Nearest 10,000
    'number_sense:nearest_100000': { ccss: ['4.NBT.A.3'], ee: ['M.EE.4.NBT.3'] }, // Round to Nearest 100,000
    'number_sense:nearest_million': { ccss: ['4.NBT.A.3'], ee: ['M.EE.4.NBT.3'] }, // Round to Nearest 1,000,000
    'number_sense:round_sort_10': { ccss: ['3.NBT.A.1'], ee: ['M.EE.3.NBT.1'] }, // Rounding Sort: Nearest 10
    'number_sense:round_sort_100': { ccss: ['3.NBT.A.1'], ee: ['M.EE.3.NBT.1'] }, // Rounding Sort: Nearest 100
    'number_sense:round_sort_1000': { ccss: ['4.NBT.A.3'], ee: ['M.EE.4.NBT.3'] }, // Rounding Sort: Nearest 1,000
    'number_sense:round_sort_10000': { ccss: ['4.NBT.A.3'], ee: ['M.EE.4.NBT.3'] }, // Rounding Sort: Nearest 10,000
    'number_sense:round_sort_100000': { ccss: ['4.NBT.A.3'], ee: ['M.EE.4.NBT.3'] }, // Rounding Sort: Nearest 100,000
    'number_sense:round_sort_million': { ccss: ['4.NBT.A.3'], ee: ['M.EE.4.NBT.3'] }, // Rounding Sort: Nearest 1,000,000
    'number_sense:round_sort_tenths': { ccss: ['5.NBT.A.4'], ee: ['M.EE.5.NBT.4'] }, // Rounding Sort: Nearest Tenth
    'number_sense:round_sort_hundredths': { ccss: ['5.NBT.A.4'], ee: ['M.EE.5.NBT.4'] }, // Rounding Sort: Nearest Hundredth
    'number_sense:estimate_sum': { ccss: ['3.NBT.A.1', '3.OA.D.8'], ee: ['M.EE.3.NBT.1', 'M.EE.3.OA.7'] }, // Estimate Sums
    'number_sense:estimate_diff': { ccss: ['3.NBT.A.1', '3.OA.D.8'], ee: ['M.EE.3.NBT.1', 'M.EE.3.OA.7'] }, // Estimate Differences
    'number_sense:estimate_sums_diffs': { ccss: ['3.NBT.A.1', '3.OA.D.8'], ee: ['M.EE.3.NBT.1', 'M.EE.3.OA.7', 'M.EE.4.NBT.3', 'M.EE.5.NBT.4'] }, // Estimate Sums & Differences
    'number_sense:estimate_products': { ccss: ['4.OA.A.3', '4.NBT.A.3'], ee: ['M.EE.4.OA.3', 'M.EE.4.NBT.3'] }, // Estimate Products
    'number_sense:estimate_quotient': { ccss: ['4.NBT.B.6', '4.OA.A.3'], ee: ['M.EE.4.OA.3'] }, // Estimate Quotients
    'number_sense:rounding_table': { ccss: ['3.NBT.A.1'], ee: ['M.EE.3.NBT.1'] }, // Rounding Table
    'number_sense:make_a_ten': { ccss: ['1.OA.C.6'], ee: [] }, // Make a Ten Strategy
    'number_sense:doubles_near_doubles': { ccss: ['1.OA.C.6'], ee: [] }, // Doubles & Near Doubles
    'number_sense:compensation': { ccss: ['2.NBT.B.5'], ee: ['M.EE.2.NBT.5'] }, // Compensation Strategy
    'number_sense:mixed_number_sense': { ccss: [], ee: [], pool: true }, // Mixed Rounding & Estimation

    // ---- number_theory
    'number_theory:prime_composite': { ccss: ['4.OA.B.4'], ee: ['M.EE.4.OA.4'] }, // Prime vs Composite
    'number_theory:factors_identify': { ccss: ['4.OA.B.4'], ee: ['M.EE.4.OA.4'] }, // Identify Factors (Circle All)
    'number_theory:factor_tchart_easy': { ccss: ['4.OA.B.4'], ee: ['M.EE.4.OA.4'] }, // Factor T-Chart - Easy (Visual)
    'number_theory:factor_tchart_medium': { ccss: ['4.OA.B.4'], ee: ['M.EE.4.OA.4'] }, // Factor T-Chart - Medium (Visual)
    'number_theory:factor_tchart_hard': { ccss: ['4.OA.B.4'], ee: ['M.EE.4.OA.4'] }, // Factor T-Chart - Hard (Visual)
    'number_theory:factor_links_easy': { ccss: ['4.OA.B.4'], ee: ['M.EE.4.OA.4'] }, // Factor Links - Easy (Visual)
    'number_theory:factor_links_medium': { ccss: ['4.OA.B.4'], ee: ['M.EE.4.OA.4'] }, // Factor Links - Medium (Visual)
    'number_theory:factor_links_hard': { ccss: ['4.OA.B.4'], ee: ['M.EE.4.OA.4'] }, // Factor Links - Hard (Visual)
    'number_theory:multiples': { ccss: ['4.OA.B.4'], ee: ['M.EE.4.OA.4'] }, // Multiples of a Number
    'number_theory:gcf_easy': { ccss: ['6.NS.B.4'], ee: [] }, // Greatest Common Factor (Easy)
    'number_theory:gcf_hard': { ccss: ['6.NS.B.4'], ee: [] }, // Greatest Common Factor (Hard)
    'number_theory:lcm': { ccss: ['6.NS.B.4'], ee: [] }, // Least Common Multiple
    'number_theory:divisibility_sort': { ccss: ['4.OA.B.4'], ee: ['M.EE.4.OA.4'] }, // Divisibility Sort
    'number_theory:mixed_number_theory': { ccss: [], ee: [], pool: true }, // Mixed Number Theory

    // ---- algebra_mixed
    'algebra_mixed:patterns_all': { ccss: [], ee: [], pool: true }, // All Pattern Skills
    'algebra_mixed:algebra_all': { ccss: [], ee: [], pool: true }, // All Algebra Skills
    'algebra_mixed:order_ops_all': { ccss: [], ee: [], pool: true }, // All Order of Operations
    'algebra_mixed:placevalue_all': { ccss: [], ee: [], pool: true }, // All Place Value Skills
    'algebra_mixed:number_sense_all': { ccss: [], ee: [], pool: true }, // All Number Sense Skills
    'algebra_mixed:number_theory_all': { ccss: [], ee: [], pool: true }, // All Number Theory Skills
    'algebra_mixed:algebraic_all': { ccss: [], ee: [], pool: true }, // All Algebraic Thinking

    // ---- all_mixed
    'all_mixed:all_domains_mixed': { ccss: [], ee: [], pool: true }, // All Skills from All Domains
    'all_mixed:custom_mixed': { ccss: [], ee: [], pool: true }, // Custom Mixed (From Settings)
    'all_mixed:grade_k_mixed': { ccss: [], ee: [], pool: true }, // All Kindergarten Skills
    'all_mixed:grade_1_mixed': { ccss: [], ee: [], pool: true }, // All Grade 1 Skills
    'all_mixed:grade_2_mixed': { ccss: [], ee: [], pool: true }, // All Grade 2 Skills
    'all_mixed:grade_3_mixed': { ccss: [], ee: [], pool: true }, // All Grade 3 Skills
    'all_mixed:grade_4_mixed': { ccss: [], ee: [], pool: true }, // All Grade 4 Skills
    'all_mixed:grade_5_mixed': { ccss: [], ee: [], pool: true }, // All Grade 5 Skills
    'all_mixed:grade_6_mixed': { ccss: [], ee: [], pool: true }, // All Grade 6 Skills

    // ---- vocabulary
    'vocabulary:vocab_grade_K': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Kindergarten (Match)
    'vocabulary:vocab_grade_1': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 1 (Match)
    'vocabulary:vocab_grade_2': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 2 (Match)
    'vocabulary:vocab_grade_3': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 3 (Match)
    'vocabulary:vocab_grade_4': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 4 (Match)
    'vocabulary:vocab_grade_5': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 5 (Match)
    'vocabulary:vocab_grade_6': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 6 (Match)
    'vocabulary:vocab_grade_K_operations': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Kindergarten: Operations (Match)
    'vocabulary:vocab_grade_K_counting': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Kindergarten: Counting (Match)
    'vocabulary:vocab_grade_K_geometry': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Kindergarten: Geometry (Match)
    'vocabulary:vocab_grade_K_data': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Kindergarten: Data (Match)
    'vocabulary:vocab_grade_K_algebra': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Kindergarten: Algebra (Match)
    'vocabulary:vocab_grade_K_measurement': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Kindergarten: Measurement (Match)
    'vocabulary:vocab_grade_1_operations': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 1: Operations (Match)
    'vocabulary:vocab_grade_1_counting': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 1: Counting (Match)
    'vocabulary:vocab_grade_1_geometry': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 1: Geometry (Match)
    'vocabulary:vocab_grade_1_data': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 1: Data (Match)
    'vocabulary:vocab_grade_1_algebra': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 1: Algebra (Match)
    'vocabulary:vocab_grade_1_measurement': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 1: Measurement (Match)
    'vocabulary:vocab_grade_2_operations': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 2: Operations (Match)
    'vocabulary:vocab_grade_2_counting': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 2: Counting (Match)
    'vocabulary:vocab_grade_2_fractions': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 2: Fractions (Match)
    'vocabulary:vocab_grade_2_geometry': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 2: Geometry (Match)
    'vocabulary:vocab_grade_2_data': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 2: Data (Match)
    'vocabulary:vocab_grade_2_algebra': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 2: Algebra (Match)
    'vocabulary:vocab_grade_2_measurement': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 2: Measurement (Match)
    'vocabulary:vocab_grade_3_operations': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 3: Operations (Match)
    'vocabulary:vocab_grade_3_fractions': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 3: Fractions (Match)
    'vocabulary:vocab_grade_3_geometry': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 3: Geometry (Match)
    'vocabulary:vocab_grade_3_data': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 3: Data (Match)
    'vocabulary:vocab_grade_3_algebra': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 3: Algebra (Match)
    'vocabulary:vocab_grade_3_measurement': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 3: Measurement (Match)
    'vocabulary:vocab_grade_4_operations': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 4: Operations (Match)
    'vocabulary:vocab_grade_4_fractions': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 4: Fractions (Match)
    'vocabulary:vocab_grade_4_geometry': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 4: Geometry (Match)
    'vocabulary:vocab_grade_4_data': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 4: Data (Match)
    'vocabulary:vocab_grade_4_algebra': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 4: Algebra (Match)
    'vocabulary:vocab_grade_4_measurement': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 4: Measurement (Match)
    'vocabulary:vocab_grade_5_operations': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 5: Operations (Match)
    'vocabulary:vocab_grade_5_fractions': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 5: Fractions (Match)
    'vocabulary:vocab_grade_5_geometry': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 5: Geometry (Match)
    'vocabulary:vocab_grade_5_data': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 5: Data (Match)
    'vocabulary:vocab_grade_5_algebra': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 5: Algebra (Match)
    'vocabulary:vocab_grade_5_measurement': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 5: Measurement (Match)
    'vocabulary:vocab_grade_6_operations': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 6: Operations (Match)
    'vocabulary:vocab_grade_6_fractions': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 6: Fractions (Match)
    'vocabulary:vocab_grade_6_geometry': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 6: Geometry (Match)
    'vocabulary:vocab_grade_6_data': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 6: Data (Match)
    'vocabulary:vocab_grade_6_algebra': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 6: Algebra (Match)
    'vocabulary:vocab_grade_6_measurement': { ccss: [], ee: [], reason: VOCAB }, // Math Vocabulary – Grade 6: Measurement (Match)
};

/* ================================================================= lookup */

const ccssByCode = new Map();   // '3.OA.C.7' -> record
const ccssByShort = new Map();  // '3.OA.7'   -> record
const ccssByWi = new Map();     // 'M.3.OA.C.6' -> record
const eeByCode = new Map();     // 'M.EE.3.OA.6' -> record
for (const s of CCSS) {
    ccssByCode.set(s.code.toUpperCase(), s);
    ccssByShort.set(s.short.toUpperCase(), s);
    for (const w of s.wi || []) ccssByWi.set(w.toUpperCase(), s);
}
for (const e of EE) eeByCode.set(e.code.toUpperCase(), e);

function ccssRecord(s) {
    return {
        type: 'ccss', code: s.code, short: s.short, grade: s.grade,
        domainCode: s.domain, domainName: DOMAIN_NAMES[s.domain] || s.domain,
        cluster: s.cluster, clusterText: CLUSTERS[`${s.grade}.${s.domain}.${s.cluster}`] || '',
        text: s.text, parent: s.parent || null, subs: s.subs || [], ee: s.ee || [], wi: s.wi || [],
    };
}
function eeRecord(e, sub) {
    return {
        type: 'ee', code: e.code, short: e.code.replace(/^M\./, ''), grade: e.grade,
        domainCode: e.domain, domainName: DOMAIN_NAMES[e.domain] || e.domain,
        text: e.text, subs: e.subs || [], ccss: e.ccss || [], wi: e.wi || [],
        sub: sub || null,
    };
}

/** Tidy a typed code: trims, drops a CCSS.MATH.CONTENT. prefix and spaces, upper-cases. */
function clean(code) {
    return String(code == null ? '' : code).trim().replace(/\s+/g, '')
        .replace(/^CCSS\.MATH\.CONTENT\./i, '').toUpperCase();
}

/**
 * Find one standard by any code a teacher might type: a CCSS code with or without its cluster
 * letter (3.OA.C.7, 3.OA.7, 2.NBT.A.1a, 2.nbt.1.a), a Wisconsin code (M.3.OA.C.6), or an
 * Essential Element with or without the M. prefix (M.EE.3.OA.6, EE.3.OA.6, EE.1.OA.5.a).
 * Returns a record ({ type: 'ccss' | 'ee', code, text, ... }) or null.
 */
export function findStandard(code) {
    const c = clean(code);
    if (!c) return null;
    // Essential Elements
    let m = c.match(/^(?:M\.)?EE\.?(K|\d)\.([A-Z]{1,3})\.(?:[A-D]\.)?(\d{1,2})(?:-(\d{1,2}))?(?:\.?([A-H]))?$/);
    if (m) {
        const [, g, d, n, n2, sub] = m;
        const exact = eeByCode.get(`M.EE.${g}.${d}.${n}${n2 ? `-${n2}` : ''}`);
        if (exact) return eeRecord(exact, sub ? sub.toLowerCase() : null);
        // a single number inside a range code (EE.6.EE.1 -> M.EE.6.EE.1-2)
        for (const e of EE) {
            const r = e.code.match(/^M\.EE\.(K|\d)\.([A-Z]+)\.(\d+)-(\d+)$/);
            if (r && r[1] === g && r[2] === d && +r[3] <= +n && +n <= +r[4]) return eeRecord(e, null);
        }
        return null;
    }
    // Wisconsin codes (M.3.OA.C.6) map to the CCSS standard they revise
    if (/^M\.(K|\d)\./.test(c)) {
        const base = c.replace(/(\.\d+)\.?([A-H])$/, '$1');
        const hit = ccssByWi.get(base);
        if (hit) return ccssRecord(hit);
        const only = WI_ONLY.find((w) => w.code.toUpperCase() === base);
        return only ? { type: 'wi', code: only.code, short: only.code, grade: only.grade, domainCode: only.domain,
            domainName: DOMAIN_NAMES[only.domain] || only.domain, text: only.text, related: only.related, note: only.note } : null;
    }
    m = c.match(/^(K|\d)\.([A-Z]{1,3})\.(?:([A-D])\.)?(\d{1,2})(?:\.?([A-H]))?$/);
    if (!m) return null;
    const [, g, d, cl, n, sub] = m;
    const tail = `${n}${sub ? sub.toLowerCase() : ''}`;
    const hit = cl ? ccssByCode.get(`${g}.${d}.${cl}.${tail}`.toUpperCase()) : ccssByShort.get(`${g}.${d}.${tail}`.toUpperCase());
    return hit ? ccssRecord(hit) : null;
}

/** True when the text looks like a standard code rather than words (for the library search). */
export function looksLikeStandardCode(text) {
    const c = clean(text);
    return /^(?:M\.)?EE\.?(K|\d)\./.test(c) || /^M\.(K|\d)\.[A-Z]/.test(c) || /^(K|\d)\.[A-Z]{1,3}(\.|$)/.test(c);
}

/* ================================================================= per skill */

function resolveAlias(categoryId, skillId) {
    const a = SKILL_ALIASES[`${categoryId}:${skillId}`] || SKILL_ALIASES[skillId];
    if (!a) return null;
    return { categoryId: a.categoryId || categoryId, skillId: a.skillId };
}

/** The raw map entry for a skill, following an alias for a retired id. */
export function standardsEntry(categoryId, skillId) {
    const own = SKILL_STANDARDS[`${categoryId}:${skillId}`];
    if (own) return { key: `${categoryId}:${skillId}`, ...own };
    const to = resolveAlias(categoryId, skillId);
    if (to && SKILL_STANDARDS[`${to.categoryId}:${to.skillId}`]) {
        return { key: `${to.categoryId}:${to.skillId}`, via: `${categoryId}:${skillId}`, ...SKILL_STANDARDS[`${to.categoryId}:${to.skillId}`] };
    }
    return null;
}

/**
 * The standards a skill covers, as records with their descriptors:
 * { ccss: [record...], ee: [record...], approx, note, reason, pool, key, via }.
 * Returns empty lists (never null) for an unknown skill.
 */
export function standardsFor(categoryId, skillId) {
    const e = standardsEntry(categoryId, skillId);
    if (!e) return { ccss: [], ee: [], approx: false, note: '', reason: '', pool: false, key: '' };
    return {
        key: e.key, via: e.via || '',
        ccss: (e.ccss || []).map(findStandard).filter(Boolean),
        ee: (e.ee || []).map(findStandard).filter(Boolean),
        approx: !!e.approx, note: e.note || '', reason: e.reason || '', pool: !!e.pool,
    };
}

/**
 * The primary CCSS code of a skill ('' when it has none or only an approximate one), e.g. for the
 * teacher footer of a printed sheet. `{ short: true }` gives the form without the cluster letter
 * (3.OA.7), which is how teachers usually write it.
 */
export function primaryStandard(categoryId, skillId, { short = false } = {}) {
    const e = standardsEntry(categoryId, skillId);
    if (!e || e.approx || !e.ccss || !e.ccss.length) return '';
    if (!short) return e.ccss[0];
    const r = ccssByCode.get(e.ccss[0].toUpperCase());
    return r ? r.short : e.ccss[0];
}

/* ================================================================= per standard */

let reverse = null;  // code -> [{ key, approx }]
function reverseIndex() {
    if (reverse) return reverse;
    reverse = new Map();
    const add = (code, key, approx) => {
        if (!reverse.has(code)) reverse.set(code, []);
        const list = reverse.get(code);
        if (!list.some((x) => x.key === key)) list.push({ key, approx });
    };
    for (const [key, e] of Object.entries(SKILL_STANDARDS)) {
        for (const c of e.ccss || []) {
            add(c, key, !!e.approx);
            const rec = ccssByCode.get(c.toUpperCase());
            if (rec && rec.parent) add(rec.parent, key, !!e.approx);   // a sub-standard also counts for its parent
        }
        for (const c of e.ee || []) add(c, key, !!e.approx);
    }
    return reverse;
}

/**
 * The skills that cover a standard, as 'categoryId:skillId' keys. Accepts any code findStandard
 * accepts. Pass { withApprox: true } to get [{ key, approx }] instead.
 */
export function skillsForStandard(code, { withApprox = false } = {}) {
    const rec = findStandard(code);
    if (!rec) return [];
    const list = reverseIndex().get(rec.code) || [];
    return withApprox ? list.map((x) => ({ ...x })) : list.map((x) => x.key);
}

/**
 * Skills whose codes start with a partial code: '3.OA' finds every grade-3 OA skill, '3.NF.3'
 * finds 3.NF.3a-d too, 'EE.4' every grade-4 Essential Element. For the library search when the
 * typed code is not one whole standard.
 */
export function skillsMatchingCode(prefix) {
    const p = clean(prefix).replace(/^M\.(?=EE)/, '').replace(/\.$/, '');
    if (!p) return [];
    const hit = (c) => c === p || c.startsWith(`${p}.`) || (c.startsWith(p) && /^[A-D]$/.test(c.slice(p.length)));
    const out = [];
    for (const [key, e] of Object.entries(SKILL_STANDARDS)) {
        const codes = [];
        for (const c of e.ccss || []) {
            codes.push(c.toUpperCase());
            const r = ccssByCode.get(c.toUpperCase());
            if (r) codes.push(r.short.toUpperCase());
        }
        for (const c of e.ee || []) codes.push(c.toUpperCase().replace(/^M\./, ''));
        if (codes.some(hit)) out.push(key);
    }
    return out;
}

/**
 * Every standard with its coverage, for the gap list:
 * { ccss: [{ ...record, skills, approxSkills, covered }], ee: [...], summary }.
 * A standard is covered when at least one skill maps to it without `approx`. A parent standard
 * is covered when any of its sub-standards is; a sub-standard only by a skill that names it.
 * Summary percentages count top-level CCSS standards (not sub-standards) and every EE.
 */
export function coverage() {
    const idx = reverseIndex();
    const one = (rec) => {
        const hits = idx.get(rec.code) || [];
        const skills = hits.filter((h) => !h.approx).map((h) => h.key);
        const approxSkills = hits.filter((h) => h.approx).map((h) => h.key);
        return { ...rec, skills, approxSkills, covered: skills.length > 0 };
    };
    const ccss = CCSS.map((s) => one(ccssRecord(s)));
    const ee = EE.map((e) => one(eeRecord(e)));
    const tally = (list) => {
        const out = { total: 0, covered: 0, byGrade: {} };
        for (const r of list) {
            const g = out.byGrade[r.grade] || (out.byGrade[r.grade] = { total: 0, covered: 0 });
            g.total += 1; out.total += 1;
            if (r.covered) { g.covered += 1; out.covered += 1; }
        }
        return out;
    };
    return {
        ccss, ee,
        summary: { ccss: tally(ccss.filter((r) => !r.parent)), ccssSubs: tally(ccss.filter((r) => r.parent)), ee: tally(ee) },
    };
}

export { CCSS as CCSS_STANDARDS, EE as ESSENTIAL_ELEMENTS, DOMAIN_NAMES };
