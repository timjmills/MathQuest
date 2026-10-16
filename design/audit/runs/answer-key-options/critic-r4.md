# Critic round 4: Wave 1 lane "Answer-key options" (MASTER_PLAN 4.4, INK-31)

Lane tree `agent-a4ebafe2c94eb1dcd`, head `e7ba140c`, with main `03bd7b77` merged. This is an independent critic run: the critic read and tested only, and changed no code.
Graded against `design/audit/RUBRIC.md` (8 or more on all four criteria). Chromebook sizes first: 1366x768 and 1280x720.
Stretch, Reason It, True or False? and Error analysis were not graded (owner ruling 2026-10-09).
Critic scripts and evidence are in `r4/critic/`.

## Verdict: FAIL, on one small blocker (R4-1). Every r3 blocker is closed.

| Criterion | Score | Why |
|---|---|---|
| 1. Correct and complete content | **9** | Every answer is on the copy key and the short key, on every page type. The worked Model prints black and Guided Practice traces print orange, as the lead ruled. |
| 2. Design contract (B&W + INK-31, owner rulings) | **9** | Given lines, boxes, sign boxes, unit lines and chart cells stay black on all 568 skills. Rings are orange, drawn answers are fully orange, and disk numerals are clean. The blank back has the owner's small line in the footer band. |
| 3. Fit to the owner's request / usability | **7** | At 1366x768, the owner's main Chromebook size, the new Print button label is clipped on both sides when "Start each key on a new sheet" is on (R4-1). Everything else works as the owner asked. |
| 4. Engineering / regressions | **9** | Every gate is green or at baseline, on the lane and on a throwaway merge into current main. The new key-options checks catch all three planted defects. Multi-section new-sheet runs never start a section on a back. |

## r3 defects re-proved

| r3 | Status | Evidence |
|---|---|---|
| **R3-1**: given lines and boxes printed orange (215 skills) | **Fixed** | Rewritten critic sweep (`r4/critic/critic-r4-attack.cjs`) over **all 568 skills on Independent at L**. **0** given borders are orange, **0** given texts are orange and **0** given SVG shapes are orange. The sweep reads only edges whose style is not none, width > 0 and colour not transparent, and pairs elements by structure (tag, class, slot, shape, SVG geometry), never by text. On the r3 tree the same script flags R3-1 on `place_value_10x` (72 cell borders) and `round_sort_10` (24 lines), so it is not blind. Images: `make_ten` "Answer:" lines are black with orange digits. `add_sub_fact_family` boxes are black with orange numbers (`crop-ff.png`). `add_wp_10` sign box, digit boxes and unit line are black with an orange ring and answers (`mp-wp.png`). `area_model_mult` partial-product lines and the "+" signs are black (`indep-area_model_mult-L.png`). The `add_50_no_regroup` answer-row boxes are black (`g-add50.png`). |
| **R3-2**: `identify` / `number_word_names` key all black | **Fixed** | Both keys tag their rings (10 and 2 tagged). The rings are orange and the words stay black (builder `r4/indep-identify-p2.png`, confirmed). Builder's claim about `base10_build`, `area_model_mult` and `long_div_2digit` was checked element by element on the rendered pages. The black borders the sweep reports there are the Tens/Ones mats, the area-model frame and answer lines, and the long-division grid (grey #949494, as on the pupil page). They match the pupil page; the key builds them as differently nested elements, which is why a structural pairing misses them. These are not defects (`indep-base10_build-L.png`, `indep-long_div_2digit-L.png`). |
| **R3-3**: stroked SVG text | **Fixed** | 0 `textStroke` findings over 568 skills. On the r3 tree the same check flags 45 stroked numerals on `pv_disks_build`. The disks now read "100", "10" and "1" cleanly (`ns-pv.png`). |
| **N-1**: Model "Answer: 20" printed orange | **Fixed** | Opener `area`: the Model's "Answer: 20" is black. Guided and Independent answers are orange (`op-area.png`). Guided `make_ten` / `div_facts` / `add_50`: the traced Model answer is black on the key, and the traced Guided items ("11", "12", "44", "42") are orange (`guided-M.png`, `g-divfacts.png`, `g-add50.png`). This is the lead's ruling. |
| **N-2**: print button sheet count | **Fixed in logic, but see R4-1** | The label reads "Print 2 pupil pages + key on 4 sheets, double-sided" (P B K B P B K B = 8 faces = 4 sheets, which is correct). With the option off, at the end, or with the key off, the label is unchanged. |
| **N-3**: a section starting on a back | **Fixed** | Real `buildAll` (teacher-print.js, re-exported in a throwaway copy) over 4 multi-section printouts × copy/short × after/end × new-sheet on/off (`r4/critic/critic-r4-multi.cjs`). The printouts were: Independent 1 page + Guided + More Practice A/B; Lesson + Independent 3 pages + Opener; Review + Test + Model; and mixed S/M sizes. With after-page and new-sheet on, every run is `PBKB…` with an even length. **0** pupil pages or keys start on a back, and docPages / 2 equals the sheet count. With it off, the order is today's `PKPK…`. "At the end" ignores the option, as the owner asked. No section hit the "falls back to the end" path. That branch was read in code: it pads after the pupil pages and after the key. |

## Owner rulings checked

- **Blank back.** Measured on the page and in a real PDF: the only text on the page is "This page is intentionally blank". It is in `footer.ws-foot` centre cell, 7 pt (9.33 px), weight 400, black, with no ©, header, tab or border. It sits level with the facing page's "1/1" line (`ns-foot.png`). `key-options` asserts the same values.
- **New sheet off by default.** With storage cleared, "After each page" shows the checkbox unchecked.
- **Each short key gets a whole sheet.** More Practice A/B, short, new sheet: the PDF is P B K B P B K B, 8 A4 pages (`pdf-ns-short-strip.png`).
- **A drawn answer is fully orange.** Counters, sticks, disks, hops with their end dots, and the remainder group rings are fully orange (`indep-div_remainders-L.png`, `indep-nl_add-L.png`, `indep-base10_build-L.png`).

## Blocking

**R4-1. At 1366x768 the primary Print button label is clipped when "Start each key on a new sheet" is on.**
The N-2 label "Print 2 pupil pages + key on 4 sheets, double-sided" does not fit the 48 px, single-line, centred button. Both ends are cut off, so the teacher reads "upil pages + key on 4 sheets, d" (`r4/critic/ui-1366-print-button-clipped.png`; measured `scrollWidth > clientWidth`). At 1280x720 the column is wider and the label fits. This is the owner's main device and the page's main action.
Fix: let the label wrap inside the button (additive CSS, as was done for the `tv-seg-wrap` pill), or move the sheet count to a caption under the button (for example "On 4 sheets, double-sided"). Then add a no-overflow check at 1366 to `key-options` or `ws-teacher-preview`.

## Non-blocking

- **N-5 (pre-existing, lesson / model lanes, not this lane).** The Lesson anchor chart for `nl_add` has several problems on the pupil page as well as the key. The number line runs past the cell edges and its labels overlap ("110121132143154"). The Say frame reads "10 plus 10 equals 10." while the steps say "You land on 20" (`lesson-M-p1.png`). This is the same family as r3 N-4. Pass it to the lesson lane; the Say text is a content error.
- **N-6 (pre-existing).** The Scripted Model key page is a plain copy of the pupil page. It has "Name" in the header, no "Answer Key" marker and no "Key" in the footer (`sm-M.png`). The page has nothing for the pupil to write, so there is nothing to colour. A key page that looks like a pupil page could still be handed out by mistake. Suggestion: give it the key header and footer like every other key.
- **N-7 (legacy, pre-existing).** On legacy word problems the copy key stamps the answer as small "Answer: 4" text under the line, not on it. On the Opener `area` Model the traced "20" on the line is replaced by the stamp. The colours are correct. Size and placement belong to the legacy-migration work.
- **Critic sweep residue (judged on the page, not defects).** 8 of 568 Independent skills, and some cells on the other roles, still raise structural findings. The cause is that the key builds its answer row with different nesting (fact families, long division, area model, arrays, remainder rows, the Tens/Ones mat, the Model cells). Every one was opened as an image, and the given content is black and the answers are orange. The 40 "traced, kept grey" findings on Lesson, Guided and Model pages are hint text ("Touch each one…", the times-fact hint box) and anchor-chart or worked-model traces. Those are given, not answers.

## Gates run (one at a time, through `/tmp/mq-browser-run.sh`)

| Gate | Lane | Throwaway merge into current `claude/sweet-newton-c8wrv1` (`5ff15129`) |
|---|---|---|
| Merge | — | **clean**, no conflicts. Lane JS passes the syntax check. |
| `key-options.cjs` | OK | OK |
| `ws-print-lint --self-test` | OK (48 assertions, 36 planted defects) | — |
| `ws-print-lint --source kit` | 463 findings in 33 of 191 documents (= baseline) | 463 / 33 (= baseline) |
| `ws-share-options` | OK | — |
| `ws-teacher-preview` | OK | — |
| `ws-teacher-print` | does not exist | — |
| `ws-code-snapshot.mjs` | OK (608 codes, nothing moved) | OK (608 codes, nothing moved) |
| `ws-boot-smoke` | OK | OK |
| Mutation test of `key-options` (throwaway copy, three defects planted, then the copy deleted) | **FAIL as expected**: 418 "given border … in key ink" (R3-1 re-planted), 35 "svg text stroked in key ink" (CSS `stroke:none` removed), 9 "worked Model prints … in key ink" (model rule removed) | — |
| Critic sweep, all 568 skills, Independent L | 0 given orange (text, border, SVG), 0 stroked text, 0 added marks left black or partial; 8 structural residues, all checked on the page | — |
| Critic sweep, 46 template-sampled skills × 11 roles at M | Same result. Residue as described above. | — |
| Images and PDFs | Lesson, Model, Guided, Independent, More Practice, Review and Test at S, M and L, with copy and short keys, at the end and after each page, with new sheet on and off (65 + 8 builds, 225 + 26 page images, 3 PDFs) | — |
| UI at 1366x768 and 1280x720 (`critic-r4-ui.cjs`) | 0 console errors. New sheet is off by default and hidden for At the end. The label counts sheets. **R4-1 at 1366.** | — |
