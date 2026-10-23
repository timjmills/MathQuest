# Defect classes — the fixed vocabulary of the defect tally (S8)

Every finding in a past critic report is given **one** primary class from this table. `kind` says whether a machine
can measure it (`machine`), it needs judgement (`judgment`), or it is about the process (`process`). The tally
(`defect-tally.csv`, class × report), the findings it is built from (`defect-findings.csv`) and the metrics
(`metrics.md`) all use these ids. A new class is added here first, with its kind and the rule ids it covers, never
invented in a CSV.

| Class | Kind | What it covers | Rule ids it usually cites | Gate that covers it today (or "none") |
|---|---|---|---|---|
| VIEWPORT | machine | screen fit: page scroll, sticky header over the band or the answer, input / Check / Next unreachable at 1366 × 768, 1280, 820 or 390, touch target < 44 px, truncated notice | H6 | `ws-chromebook-fit`, `ws-screen-slots` (partly) |
| SCREEN_PARITY | machine | paper ≠ screen: a doubled answer area, a paper verb on screen or a screen verb on paper, a production item offered as multiple choice on screen, the screen cell not the kit cell | H7, H8, L5, SP-* | `ws-screen-slots`, `ws-screen-answer` |
| SLOT | machine | answer slot shape or size wrong for the answer, no room to write or draw, a slot too small for the widest answer, boxes missing | H9, H12, SL-* | `ws-print-lint` L-ANSAREA |
| CLIP_OVERLAP | machine | clipped, overlapping, illegible, outside its border, text below 8 pt, label collisions | H2 | `ws-print-lint` L-OVERFLOW, L-SIZE |
| SIZE | machine | size S / M / L ignored or wrong, digits too small or not the token size, a drawing that does not scale, S not fitting more than L | L1, TY-*, DN-* (sizes) | none (S2 builds L1) |
| SPACE | machine | wasted space: an empty band in a cell, a page under-filled, a lone item or lone state on a page, a split cell, a blank strip, a mid-page footer, rows sized for a taller item | H5, H13, L2, DN-* (density) | `ws-print-lint` L-DENSITY (H13, PAGEFILL), L-SPLIT; lone item none (S2) |
| INK_FONT | machine | colour, grey misuse, emoji, a non-Andika face, bold in cells, line weights off the token, a legacy-look cell | H4, L7, INK-* | `ws-print-lint` L-INK, L-FONT, L-EMOJI; `ws-ink-unit` |
| NOTATION | machine | × not x, ÷ not /, stacked fractions, number formatting (commas, decimals), wording off the instruction library | C4 (notation), P-* (wording) | none (S2 builds it) |
| KEY | machine | answer key wrong, missing, not matching the slots, not a facsimile, key ink wrong | H1, H10, AK-* | `ws-print-lint` L-KEY (subset) |
| GIVEAWAY | machine | the answer given away: drawn in the question, slot width equal to the answer length, labelled target tick, scaffold only where needed, a hint holding the answer | L3 | none (S2 builds L3) |
| PATTERN | machine | answers cycle, alternate or never vary; one draw deals two attributes | L10 | none (S2 builds L10) |
| REPEAT | machine | the same problem, line or example twice on a page or packet (chart example on the exit slip). Scope: what a pupil or teacher sees on a page or packet; duplicate proposals, rows or options in tagging / build-list data are DATA_SHAPE (2026-10-23, critic wave0-b r1 D2) | — | none (S2 builds it) |
| NAME_CONTENT | machine | an item contradicts the skill's name or an option's promise; wrong or incoherent maths; out-of-range numbers; a rule such as no-zero broken | H3, L4, P-* | `ws-content-audit` (≈ 310 skills), `ws-options-verify` |
| UNTRUE_TEXT | machine | written claims that the code or data do not bear out: a false FULL verdict, a wrong tag or why-line, "How it looks" naming an undeclared drawing, a count or kind claimed that the generator does not deal | — | TITLEREP / RANGECHECK (WRM tagging only); none in general (S2 builds text ≠ generator) |
| INSTRUCTION | machine | instruction, steps, Say line or title not following the item (other numbers, wrong task, wrong strand title) | L6 | none (S2 builds L6) |
| STEPS_LAYOUT | machine | steps squeezed beside a drawing, one word per line, running out of the border | L11 | none |
| TAG_LINK | machine | WRM / standards tagging data: a pre-skill or related link that is wrong, missing, too big, from the wrong school week or domain, padded or thin; the same key in pre and related; a step's own build listed as its pre (added 2026-10-23 at the merge: the three tagging readers had split these across PEDAGOGY, MISSING, UNTRUE_TEXT and OTHER) | WRM-rule-3, -10, -14, -15, -18, -19 | linkfit / lessonfit (WRM tagging lane only) |
| DATA_SHAPE | machine | tagging, standards or build-list DATA (not a page): a duplicate or overlapping proposal, a proposal for what an existing skill or option value already deals, duplicate rows or clauses, an option id that should fold into an existing one (added 2026-10-23 for critic wave0-b r1 D2: these had been classed REPEAT, OTHER or UNTRUE_TEXT; REPEAT is a page fault, and the claim is about duplicated data, not a false sentence) | — | none |
| PLAIN_WORDS | machine | jargon, codes or hard words in pupil or teacher text; a typo or misspelling (a typo is not UNTRUE_TEXT) | — | `ws-plain-words` |
| MISSING | machine | a page type, role, option, size or feature that must exist cannot be produced; an option missing a dimension | H11, L8, PT-CMP-* | `ws-coverage-matrix` (E1), `ws-options-verify` |
| INTERACTION | machine | on-screen behaviour: input refuses, wrong marking, focus / caret jumps, a flicker or bounce, navigation, a console error or crash, a toast covering a control | — | `ws-boot-smoke`, per-lane probes |
| SEARCH | machine | a search finds the wrong skill, none, or ranks it low; a correction notice missing | — | `ws-search-terms` |
| PEDAGOGY | judgment | teaching value: sequence, one new thing per step, scaffold fade, difficulty, misconceptions and distractors, worked examples, ordering of pre-skills | C2, P-* | — (critic) |
| CLARITY | judgment | the pupil or teacher cannot tell what to do; confusing layout or wording not covered by a machine class | C1 | — (critic) |
| VISUAL_DESIGN | judgment | the drawing does not look or read like the owner's workbooks; a representation wrong or unclear for the task | C4 | — (critic) |
| PROCESS | process | the builder's report, evidence or gates: a gate not run, numbers misreported, an unreviewed or unverified change, stale docs, a self-grade too generous | L9 | the precritic table (S1) |
| OTHER | judgment | anything that fits none of the above; the finding's summary says what it is | — | — |

**How a finding is counted.** One row per distinct numbered (or clearly separate) defect a report lists as open or
failing. A defect a later report lists again as still open is counted again in that report, with `carried=yes`. Items a
report confirms as fixed are not counted. Nits and optional findings are counted with `severity=minor`.
