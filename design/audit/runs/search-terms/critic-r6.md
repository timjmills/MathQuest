# Critic round 6: Search terms for every skill (lane a21ec3ef403026c80, head 50a1bf84)

Independent critic, 2026-10-09. I only read and tested; I did not edit any code.

**Verdict: PASS.** Coverage **9**, Precision **8**, Ranking **9**, No regression (speed, UI, console, merge) **8**.

Every r5 defect is fixed, and I re-proved each one with real keystrokes and clicks at all three Chromebook sizes.
The gate is real: run against the r5 `search-notice.js`, it fails. One new minor defect remains (U-G: a two-line
correction covers the Sets "Level" caption at 1366 px wide), plus three minor precision and ranking notes. None of
them blocks the pass. All are listed under "To fix next".

## What I ran

| Check | Result |
|---|---|
| `node --input-type=module --check` search-notice.js, search-terms.js | clean |
| `ws-search-terms` | OK: 232/232 queries; 169 primary queries rank 1 in the list and in the grouped pickers; 592 skills |
| `ws-search-order` | OK: 72 notice checks (6 boxes × 4 corrections × 3 Chromebook sizes) plus the student rebuild checks |
| `ws-boot-smoke`, `ws-teacher-library`, `ws-teacher-shell` | OK, OK, OK (the shell passed on the first run; the font flake did not occur) |
| Gate mutation 1: the r5 `search-notice.js` and `teacher.css` served from a scratch copy (`MQ_ROOT`), tree untouched | **FAIL**, 78 lines: ELLIPSIS in the Navigator, Quiz, Library and Sets boxes; the print picker's notice is "NOT the first row"; the student notice is lost after "+", after blur and refocus, and after a `handleSkillSearch` rebuild ("NO NOTICE"); "the Level row moved 303 → 327" |
| Gate mutation 2: the r6 code, but the overlay is cut at the box width (`max-width` = box width, `nowrap`, `overflow:hidden`, no ellipsis) | **FAIL**: "TRUNCATED scrollWidth 226 > clientWidth 160" in the Navigator for all four words at 1280×720 and 1366×650. The `scrollWidth` check works on its own and does not depend on the ellipsis check. |
| Merge into `claude/sweet-newton-c8wrv1` (now 72e05d7b) | `git merge-tree` is clean. Since 268d0bea, main gained only an asset stamp and a STATUS note. |
| Node diff r5 (268d0bea) → r6, top 3 over **1,197 queries** (every SKILL_TERMS term, every PRIMARY_SKILLS phrase and every live label from both trees) | 22 top-1 changes and 2 top-2/3 changes, all intended (list below). 2 queries lost: "associative" and "associative property", which is intended. 3 corrections changed: "identity…" is no longer corrected to "identify…". |
| My Puppeteer run with real clicks and typing: 6 boxes × 3 sizes × 5 **new** corrections, including two multi-word ones ("subtracion with regroupping", "equivalant fractons", "multiplicaton facts", "measurment", "decimels") | 88/90 OK: the full text is shown, `scrollWidth` and `scrollHeight` fit, the notice is in the window, and it is topmost at both ends of the bold word on every line. The 2 failures are U-G (below). No notice sits over any button, select, link or input. Screenshots are in the scratchpad at `c6shots/`. |
| My U-D run at 1366×768, 1366×650 and 1280×720: type "tme" → click "+" → click ☆ → Tab away → click away → click back in → type "s" → correct the word → type "perimter" and scroll the list 200 px | The notice stays the list's first row and stays topmost through every step; it moves with the list when scrolled (sticky). When the list reopens it shows again. "tmes" shows "times". The notice goes away once the word is spelled right. |
| Print picker at 1366×650: "probabilty", scroll the list 120 px, clear the box | The notice is the first row, stays at the top while scrolling and is hidden when the box is cleared |
| Navigator: "tme", then a real "← Back" | The notice is hidden |
| Console errors | 0 in every run |
| Speed | 1–20 ms per query in Node |

## r5 defects, re-proved

| Item | Result |
|---|---|
| **U-F** Navigator notice truncated | **Fixed.** The overlay now runs past the narrow box. At 1280×720 and 1366×650 (box 160 px), "Showing results for **subtraction with regrouping**" is one line, 315 px wide. No ellipsis remains in any box: Quiz, Library and Sets were also at risk under r5, and they are fixed too. The print picker and the student list wrap inside the list, which is readable. |
| **U-D** student notice lost on rebuild | **Fixed.** A MutationObserver puts the notice back as the first row after every rebuild, and `focusin` reapplies it. Every step in the run above holds. |
| **U-E** Sets Level row moves | **Fixed** for one-line notices: the Level caption stays at y 315 (1366) and y 293 (1280) whether a correction shows or not. See U-G for two-line notices. |
| Print picker notice on the list border | **Fixed.** It is now the list's first row, inside the border, and it sticks to the top while the list scrolls. |
| **P-E** associative | **Fixed.** "associative", "associative property", "…of addition" and "…of multiplication" all return 0 results, and "associative" is no longer corrected. |
| Addition-property queries | **Fixed** for commutative and turnaround: "commutative addition", "commutative property of addition", "turnaround facts addition", "addition turnaround facts", "properties of addition" and "addition properties" → **Addition Fact Families** first, Multiplication Properties second. Plain "turnaround facts" now leads with Addition Fact Families, which is defensible (it is a grade 1 term). |
| **R-F** distributive property | **Fixed**: Distributive Property of Expressions first, Multiplication Properties second. |
| **C-G** zero / identity property | **Fixed**: "zero property", "identity property", "…of multiplication", "property of zero" and "property of one" → Multiplication Properties. "identity" is no longer corrected to "identify". "identfy shapes" is still corrected to "identify shapes", so the correction itself still works. |
| **R-G** multi digit multiplication | **Fixed**: Basic Multiplication first for "multi digit multiplication", "multi-digit multiplication", "multidigit multiplication" and "multiplying by multi-digit numbers". |
| Owner ruling: skip counting | Count by 1–12 (count_by_tables) first, then Skip Counting Number Line, then Skip Counting Grid |

## View: "associative property" → 0 results vs Add Three Numbers

0 results is the right answer. Add Three Numbers (`add_three`, gen-operations.js) always adds left to right: `a + b + c`,
with the hint "Add the first two … then add the third". It never regroups to make a ten. `standards-audit.js` already
records the associative property as the missing clause of both 1.OA.B.3 and 3.OA.B.5, and the build-list entries that
close it are `add_three_forms` and `mult_three`. Sending a teacher to Add Three Numbers would promise a skill that does
not teach the property. When `add_three_forms` or `mult_three` is built, its terms should claim "associative". An
empty list that says "no skill teaches this yet" would help more than a blank one, but that is a UI choice for the
owner, not a defect in this lane.

## New defects (all minor)

- **U-G (minor, UI): a two-line correction covers the Sets "Level" caption at 1366 px wide.** In the Sets picker the
  overlay is limited to the panel's width (right edge x 603). A long multi-word correction such as "Showing results for
  **subtraction with regrouping**" wraps to two lines (y 289–328). The line reserved below the box is 12 px, so the
  second line covers "Level" (top 315) at 1366×768 and 1366×650. This is the same class as r4 U-C. At 1280×720 the
  panel is wider and it stays on one line. The notice itself can be read in full, and the K–6 buttons are not covered.
  It is cosmetic on a teacher screen. Fix: when the notice wraps, reserve its real height. A move only on two-line
  notices is acceptable. Alternatively, let the overlay run past the panel. Add one multi-word correction to the gate's
  `WORDS`, because all four of its words fit on one line.
- **P-H (minor, precision): "zero property of addition" and "identity property of addition" now return only
  Multiplication Properties.** In r5 they returned 0. That skill deals × 0 and × 1, never + 0, so this is the same
  kind of mistake as P-E. A partial match on "zero property" / "identity property" is the cause. Honest answers are 0,
  or a skill that deals + 0. Also "grouping property", another name for the associative property, still returns
  Multiplication Properties (this predates r6).
- **R-H (minor, ranking; predates r6): "comparing numbers" puts Add Three Numbers (≤20) first.** It ties with Compare
  Numbers (>, <, =) at 6.0, which comes second. "compare numbers" ranks correctly. r5 gives the same result.

## 40 fresh queries (none used in r1–r5)

I ran 46. **40 put a right skill first**: counting on, number line addition, subtract on a number line, fact families,
doubles plus one, near doubles, bar model, tape diagram, word problems addition, greater than less than, odd and even,
place value chart, rounding to nearest 10, estimate sums, equal groups, arrays, remainders, long division, divide by 10,
factor pairs, greatest common factor, least common multiple, improper fractions, equivalent fractions, simplify
fractions, fraction of a set, multiply fractions, divide fractions, elapsed time, telling time to the quarter hour,
analog clock, bar graph, pictograph, mean median mode, area of a triangle, order of operations, input output tables,
algebraic expressions, one step equations, inequalities.

3 have no skill to find: prime factorization (0, which is honest), angles in a triangle (no angle-sum skill; Classify
Triangles is second) and decimal place value (no dedicated skill).

3 misses, all present in r5 too:
- "comparing numbers" (R-H).
- "money word problems": only Remainder Contexts comes back. Add Money, Find the Change and Is There Enough Money?
  are not found.
- "count backwards": "Number Patterns: Count On, Count Back, Double" is not in the top 3.

## Scores

| Criterion | Score | Why |
|---|---|---|
| Coverage | **9** | 40/43 answerable fresh queries are right first; zero, identity and multi-digit now reach skills. Left: money word problems, count backwards. |
| Precision | **8** | Associative is now honest, "identity" is no longer rewritten, and nothing real was lost in the 1,197-query diff. P-H: addition zero/identity, and "grouping property", land on a multiplication-only skill. |
| Ranking | **9** | All 22 top-1 changes are intended; distributive and multi-digit are fixed. R-H "comparing numbers" predates r6. |
| No regression (speed, UI, console, merge) | **8** | U-F, U-D and U-E are fixed and gated (both mutations fail the gate). 0 console errors, fast, clean merge. U-G is a cosmetic overlap on a teacher caption, and only for two-line corrections at 1366 px. |

## To fix next (not blocking)

1. U-G: reserve the notice's real height in Sets when it wraps (or let it run past the panel), and add a multi-word
   correction to `ws-search-order`'s `WORDS`.
2. P-H: stop "zero/identity property of addition" (and "grouping property") from landing on Multiplication Properties.
3. R-H "comparing numbers"; add "money word problems" and "count backwards" terms.
