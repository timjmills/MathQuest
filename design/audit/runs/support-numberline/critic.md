# Custom number line at the top of the page (MASTER_PLAN 5.2): critic, Round 1

Critic: independent, Opus 5.5, medium effort. Tree `f60ef13` (`b7d2c29` + `f60ef13` on `b684322`). Date 2026-10-03.
I ran everything on a scratch copy of `f60ef13`; this file is the only change in the tree. My probes and screenshots are in the session scratchpad (`nl-r1/`).

## Verdict: FAIL

| Criterion | Score | Why it is not 8 |
|---|---|---|
| C1 Ease of use | 6 | **The online worksheet never shows the line** when the teacher sets it in the option panel (D1). There are two controls called "Number line" on one panel with different meanings (D7). The rest is calm: the panel shows 4 groups at rest, the new disclosure stays closed, and its help texts are plain. |
| C2 Educational value | 5 | The Auto defaults are often wrong for the skill (D2–D5). Examples: rounding to 1,000 gets a 0–20 line; count by 2s gets a line in 5s; count by 5s / 10s print the answers in order; a fraction page gets twelfths for fifths, eighths and tenths; decimal rounding gets 0–11 in hundredths. One skill also gets a different scale on different pages of the same packet (D6). On a mixed page the first skill decides the scale (D8). |
| C3 Spacing and layout | 7 | The band is clean: one band per page, under the rule, never split or overflowing. No new lint failure at S (the 15 failing documents are identical with the line off). But a 16.5 mm band can cost a whole row and leave an empty strip (D9). Grid labels are dropped beside an end label, so the label spacing turns irregular (D10). |
| C4 Standard fidelity | 6 | The skill list misses families the spec names (D11). The design contract does not describe the new band (D12). P-SC-5 "hints on tests are a teacher option" is a request flag with no control (D13). |

## Gates (scratch copy of f60ef13; browser runs one at a time through /tmp/mq-browser-run.sh)

| Gate | Result |
|---|---|
| `support-numberline` | OK |
| `ws-supports-unit` | OK (257 / 0) |
| `ws-share-options` | OK |
| `ws-screen-answer` | OK |
| `ws-print-lint --source kit` on 10 skills (add_facts, add_100_mixed, sub_1k_mixed, compare, improper_mixed, round_decimals, add_int, nearest_100, seq_5, temperature) × independent / more-practice / guided / review, `--opts {"nlOn":true}` | S: 15 failing documents, the same 15 with the line off. L: every finding also appears in the line-off baseline, except one new PAGEFILL on improper_mixed more-practice (a 57 mm empty strip, 22% of the page). The line also turns improper_mixed more-practice S from 2 to 4 pupil pages. add_decimal AK-4 is ignored as instructed. |
| My sweep: all 133 skills × S / L, independent, with nlOn | 266 builds, 0 errors. **Every pupil page and every key page carries exactly one band, and the key's band is the pupil's band (266 / 266).** Auto ends cover every number found (but see D2). 49 builds lose capacity (D9). |
| My roles probe: 17 roles × 3 skills × S / L | The band prints on independent, more-practice, opener, scripted-model, guided, error-analysis, review, word-problems, fact-rows, mixed-practice, true-false, reason-it, stretch and lesson. It never prints on test, pre-skill-check or fact-probe. Key = pupil everywhere. Line ranges differ between roles (D6). |
| My screen probe: card and worksheet × 390×844 / 1280×900 × 7 skills | No horizontal overflow (scrollWidth = viewport). The card band is 63 px (80 px with fractions) plus a 10 px margin. On the phone the prompt stays above the fold: the card starts at 739 px and the prompt sits at about 800 px in an 844 px viewport. The answer place was already below the fold before the band (the app's chrome takes 666 px). **The worksheet shows no line at all (D1).** |

## Defects (RUBRIC §6)

```json
{
  "feature": "support-numberline",
  "round": 1,
  "pass": false,
  "scores": { "C1": 6, "C2": 5, "C3": 7, "C4": 6 },
  "defects": [
    { "id": "D1", "criterion": "C1", "severity": "critical",
      "where": "js/modules/worksheet.js:1746 and :1764 (syncWorksheetRefLine(..., { opts: state.skillOptions || null })); generate-question.js:265-279",
      "what": "The online worksheet draws no line when the option is set through the panel. Panel edits go to the per-skill set (setSetOptions / lookupSetOptions), and generateQuestion applies them only inside its own call, then restores state.skillOptions = null in `finally`. So syncWorksheetRefLine gets opts null, normalizeOptions gives nlOn false, and there is no line. Measured with window.setSetOptions(c, k, {nlOn:true}) then initWorksheet(): #mqWsRefLine absent for all 7 skills at 390 and 1280. The card works, because it reads skillOptionsBySkill. The lane's gate passes only because it writes state.skillOptions directly (support-numberline.cjs:247, :265), which the app never does.",
      "fix": "In syncWorksheetRefLine, resolve opts the way the card does: state.skillOptions, else lookupSetOptions(category, skill), else state.worksheetQs[0].skillOptions (generateQuestion stamps it, line 275). On a mixed worksheet, use each item's own options (q.skillOptions) and share one line, as print does.",
      "check": "In the gate, set the option with setSetOptions only, never state.skillOptions, then initWorksheet(): #mqWsRefLine is present and covers state.worksheetQs. Do the same through a skill code with ~0R1." },

    { "id": "D2", "criterion": "C2", "severity": "critical",
      "where": "sheet/refline.js lineNumbers / PAYLOAD_KEYS / numbersInText",
      "what": "When a skill's numbers are not found, the line silently falls back to 0-20 by ones and still reports `covers: true`. Observed: round_sort_100, round_sort_1000, round_sort_tenths and round_sort_hundredths all draw 0..20 by 1 over cards like 5,834 / 8,505 (the numbers are on drag cards, and the text says 'nearest thousand' in words). order_frac_numline draws 0..20 by 1 on a fractions page. order_fractions opener and reason-it draw 0..20 by 1. Second fault: comma-separated answer lists are read as thousands groups. order_negatives (answers like '-55,-52,-18,2,44,90' and lists ending ',100') gets a line from -10,000 to 90,000.",
      "fix": "(a) Read the numbers wherever the item holds them: drag cards / tiles / bins in the payload, and the item's own band. When no number is found, fall back to the skill's declared range (its within-N / place / band option), never 0-20, and never report covers:true from an empty set. (b) In numbersInText, accept a thousands group only when it is not part of a comma list: no ',-' or ', ' neighbours, and either at least two groups or the text has no other comma-separated numbers. Better still, read answer lists with split(',').",
      "check": "Sweep all 133 skills: no line is 0..20 unless the skill's numbers lie in 0..20. round_sort_1000 spans the page's thousands, order_negatives spans about -100..100, order_frac_numline is a fraction line." },

    { "id": "D3", "criterion": "C2", "severity": "major",
      "where": "sheet/refline.js defaultLine (whole numbers: NICE step from the span; ends rounded to 5 or 2 steps); numberLineFits list for patterns",
      "what": "The Auto step ignores what the skill counts in. seq_2 (count by 2s, items '41, 43, ___, 47') gets 0..90 by 5, so the 2s cannot be read from the line. seq_5 gets 0..100 by 5 and seq_10 / count_by_fill get 0..120 by 10, with every tick labelled: the line is the answer list, and the pupil copies it (LESSONS_LEARNED 'answer given away'). The ends also ignore the skill's band: add_wp_20 → 0..15, add_wp_50 → 0..28 by 2, add_1k_regroup → 0..900 while add_1k_no_regroup → 0..1000.",
      "fix": "Default the step from the skill, not from the span: skip-count skills use their count (2, 5, 10, or the option value). Default the ends from the skill's declared range (Within N / Facts to / band option), with the sample only to widen. On skip-count and sequence-fill skills (seq_*, count_by_*, count_sequence, number_seq_fill, skip_count_line), default labels to 'ends' (or every 10th) and hops on, so the pupil counts the jumps instead of reading the answers.",
      "check": "seq_2 Auto = steps of 2 with only the ends labelled. add_wp_20 = 0..20, add_wp_50 = 0..50, add_1k_* = 0..1000 for all three. Re-shoot seq_2 S." },

    { "id": "D4", "criterion": "C2", "severity": "major",
      "where": "sheet/refline.js defaultLine (fraction branch: den = L if offered, else the largest offered denominator present); refLineGeom labelEvery on fraction steps",
      "what": "Mixed denominators get one denominator that cannot place most of the page's fractions. compare / order_fractions / compare_frac_lcd: twelfths for pages of fifths, eighths and tenths (4/5 and 3/8 have no tick). The label interval uses the whole-number NICE list on fraction steps: equivalent (0..12 by sixths) labels 5/6, 10/6, 15/6 …; round_fractions labels 5/10, 15/10 …; improper_mixed labels 2/8, 4/8, 10/8. Wholes are only labelled when they happen to fall on that grid.",
      "fix": "When the lcm of the page's denominators is not an offered step, default to a benchmark line (0, 1/2, 1 … in halves or quarters, wholes labelled) and warn: 'This page uses fifths, eighths and tenths: one line cannot show them all.' Choose labelEvery for fractions from divisors of the denominator (every 1, 2, 3, 4, 6 or den steps), so every whole is labelled.",
      "check": "equivalent S labels only multiples of 1/2 or 1/6 that include every whole. order_fractions with mixed denominators gets a benchmark line plus a panel / sheet note." },

    { "id": "D5", "criterion": "C2", "severity": "major",
      "where": "defaultLine decimal branch (places >= 2 → step 0.01; range from 0); labelOf toFixed",
      "what": "Decimal skills get one long line from 0 to the largest number, in hundredths: round_decimals 0..11, add_decimal 0..19, sub_decimal / compare_decimal / order_decimals 0..10. Tenths cannot be read on it, and the item 'Round 5.43 to the nearest tenth' already draws its own 5.4 to 5.5 line. Labels mix formats ('0, 0.50, 1, 1.50, 2 …') and end irregularly ('0 2 4 6 8 11'). At 390 the card shows '0 2 4 6 8 11'.",
      "fix": "For decimal rounding / compare skills, take round_decimals, round_thousandths, the decimal round_sort skills and compare_decimal off the list. Their items already carry a local line, and one page-wide line cannot show the place. For add / sub decimal, default to a whole-number line with tenth minor ticks. Label every value with the same number of places as the step, or as whole numbers only (0, 0.5, 1 → never 0.50 next to 1).",
      "check": "add_decimal and sub_decimal default to wholes with tenth minor ticks and consistent labels; the rounding skills no longer offer the line." },

    { "id": "D6", "criterion": "C2", "severity": "minor",
      "where": "print-sheet.js buildRoleSheet drawNumberLine (the line is drawn from each role's own items); refline-screen.js sampleNumbers (seeds 9001+, 16 items) plus the item on the card",
      "what": "One skill gets different scales on different pages of the same packet: add_facts 0..20 on most roles but 0..15 on the scripted model and L stretch; nearest_10 0..100 but 0..60 on the model and L reason-it; order_fractions twelfths, eighths (true-false) or 0..20 whole (opener, reason-it). On the card the scale comes from a 16-item sample (add_facts 0..15 at 390) and jumps when an item outside it arrives.",
      "fix": "Resolve the Auto line once per skill and options (from the declared range, D3) and use it on every role, the card and the worksheet. Let the page's items only widen it.",
      "check": "The roles probe gives one range per skill across all 14 roles, and the card shows add_facts 0..20 from the first item." },

    { "id": "D7", "criterion": "C1", "severity": "major",
      "where": "skill-options-ui.js groupedOptionRowsHTML (the 'Number line' disclosure); the Support set's 'Number line 0 to 20' (tests/compliance/shots/support-numberline/option-panel*.png)",
      "what": "On add_facts the panel shows 'Number line 0 to 20' in Support (a pane inside each problem) and, below it, a separate 'Number line' disclosure (one line at the top of the page). Two controls with the same name do different things. A teacher cannot tell which to tick, and can tick both. The closed summary reads 'On · Auto to Auto · step Auto' when nothing is set. The warning prints '9 ….' (an ellipsis, then a period).",
      "fix": "Name the disclosure 'Number line at the top of the page'. Rename the pane 'Number line in each problem (0 to 20)'. Have each help text name the other. Show the resolved range in the summary ('On · 0 to 20 · steps of 1 (from the page)'). Drop the period after the ellipsis.",
      "check": "Re-shoot option-panel.png. No two controls share the label 'Number line'." },

    { "id": "D8", "criterion": "C2", "severity": "major",
      "where": "print-sheet.js numberLineRequest (`first` skill decides opts and `fraction`)",
      "what": "On a mixed page the first skill with the line decides the step and the teacher range. add_facts + order_fractions gives 0..17 by ones, so the fraction section has no fraction ticks, and there is no warning. add_facts (0..10) + add_int (teacher -20..20) uses add_facts' 0..10, ignores add_int's own range, and the warning blames the teacher's range. A section that did not ask for the line still prints under it (one on / one off: the nearest_100 page carries add_facts' 0..20 line).",
      "fix": "Merge the requests: the union of the teacher ranges, the finest step any section needs (fraction beats whole), and fraction = any. When the merged line cannot serve every section (wholes to 1,000 next to facts to 20), print one line per section above its first item, or say so in the sheet note. Print the band only on pages whose items asked for it.",
      "check": "The mixed probe: add_facts + order_fractions gives a fraction-step line or a note; the two teacher ranges merge to -20..20; the nearest_100 section page has no band." },

    { "id": "D9", "criterion": "C3", "severity": "minor",
      "where": "layout headerHeightMm(+band) → row count; sweep: 49 of 266 builds",
      "what": "The band takes whole rows instead of a few mm off each row. sub_100_regroup L: 9 → 6 items with about 43 mm left empty under the grid (screenshot). add_wp_10 L and equiv_frac_nv L: 4 → 2. sub_10_regroup S: 20 → 15. improper_mixed more-practice S: 2 → 4 pupil pages, and at L a new PAGEFILL (57 mm, 22%).",
      "fix": "When the band would drop a row, first see whether the rows fit at row height minus band / rows, keeping each cell's minimum footprint. Content never shrinks, but slack in the cells can go. Take the row only when they do not fit.",
      "check": "The sweep shows the per-page count unchanged wherever the old rows had at least band / rows of slack (sub_100 L stays 9). ws-print-lint shows no new PAGEFILL with --opts nlOn." },

    { "id": "D10", "criterion": "C3", "severity": "minor",
      "where": "refLineGeom labelled() / nearEnd()",
      "what": "A grid label next to an end is dropped, so the labels read '0 2 4 6 8 10 12 15' (card 390, add_facts) and '0 2 4 … 16 19' (add_decimal S). The last gap looks the same size as the others but holds 3 instead of 2.",
      "fix": "Choose the ends as multiples of labelEvery (round `to` up to the label grid), or label every tick at that interval and leave the end tick unlabelled.",
      "check": "No line has a last label gap that differs from the others." },

    { "id": "D11", "criterion": "C4", "severity": "major",
      "where": "skill-options.js _NL_SKILLS",
      "what": "The spec names add/sub, counting, skip counting, rounding, fractions, decimals, integers and measurement. Missing from the list: the whole fraction_operations category (add/sub_fractions_like, add/sub_mixed_like, decompose_fractions, mult_frac_whole and their _nv twins, where jumps of a unit fraction are the CCSS 4.NF.3 model); multiplication:nl_mult and division:nl_div (both named 'Number Line'); multiplication:count_by_tables and patterns:number_patterns_rule (skip counting / count on); integers:ordering_rationals ('Order Rationals on a Number Line'); number_sense:round_nl_thousands / round_nl_ten_thousands / round_nl_hundred_thousands ('Round on a Number Line') and estimate_sum / estimate_diff; measurement elapsed_* (the time line is the 3.MD.1 model); conversions f_to_d / d_to_f / order_fdp. Weak fits on the list: reading_ruler / reading_ruler_hard (the item is a ruler already) and the decimal rounding skills (D5).",
      "fix": "Add the missing skills, with the fraction_operations defaults from D4 and an elapsed-time line in hours and minutes (or log it as a later step with a reason in STATUS). Remove or justify the weak fits.",
      "check": "numberLineFits is true for each listed skill, and the sweep shows a sensible Auto line for each." },

    { "id": "D12", "criterion": "C4", "severity": "minor",
      "where": "WORKSHEET_DESIGN_STANDARD.md, design/PAGE_TYPES.md, design/SUPPORTS.md",
      "what": "The page anatomy gains a band between the header rule and the instruction, on every page and the key. It has a new support id (data-ws-support='refline') and fixed geometry (line rules, zone-label size 9 / 10 / 12 pt, label-thinning). None of the contract documents mentions it. Only STATUS changed.",
      "fix": "Add the band to PAGE_TYPES anatomy and to the WDS header rules (height, type, which roles carry it), and add a `refline` row to SUPPORTS.md S4.3, with RP-50 / the reference-scale rule.",
      "check": "grep refline in those three files." },

    { "id": "D13", "criterion": "C4", "severity": "minor",
      "where": "print-sheet.js NO_HINT_ROLES / req.testHints",
      "what": "P-SC-5: 'Hints on tests … are teacher OPTIONS … No page type hard-codes them.' The line is kept off test, pre-skill-check and fact-probe unless req.testHints, but nothing in the UI sets testHints. So for teachers it is hard-coded off.",
      "fix": "Add the teacher control in the print dialog (or reuse an existing hints-on-tests control), or record the gap in STATUS for the print-dialog lane.",
      "check": "A test page prints the line when the teacher ticks the control." }
  ],
  "to_raise_to_10": {
    "C1": "D1 and D7; the summary shows the resolved range; on phones the band could start collapsed to one row of end labels.",
    "C2": "D2–D6 and D8: every Auto line matches what the skill counts in and the range it declares, never hands over a sequence's answers, and stays one scale per skill across every page and host.",
    "C3": "D9 and D10; fraction labels at L-size on S pages, because two stacked 9 pt figures are small for this pupil.",
    "C4": "D11–D13."
  },
  "summary": "The plumbing is solid: one band on every page and key, the key matches, it never splits, share codes and the panel disclosure work, and no lint failures are added at S. It fails because the online worksheet never shows the line in the real flow, and because the Auto defaults are wrong on many skills (0-20 for rounding to 1,000, a 5s line for count by 2s, the answers printed for count by 5s, twelfths for fifths and eighths, a 0-11 hundredths line for rounding to tenths). Mixed pages let the first skill decide, the skill list misses whole named families, and the contract docs do not describe the band."
}
```
