# Builder round 6 (critic r7, FAIL narrowly: B15.S2 and lesson 2 = 7). Class N, the structural fix.
# Until r6 build.py let `linkfit --fit` re-option any link that failed (and drop any with no fitting option set) without the
# spec ever saying so; three rounds of false whys came from that. From this round the fit loop is a REPORT and nothing in the
# build changes a link's opts: every link's opts come from the spec, and specopts.py fails the build when a built link differs.
# This file writes, by hand, the opts the old fit loop used to apply silently (145 links) and the drops it used to make silently
# (94 links). Each RELINK row was generated from the fit report's suggestion (the first option set that passes every check and
# every claim of the why, claims.mjs incl. the new form and representation claims), then re-read on its generated items
# (fit-report.txt in the build folder; `linkfit.mjs <file> --try` for a single link); where the why was not true of those
# items it is rewritten here (the "re-read" comment says what changed). Y5-report.md lists the 18 links whose spec set
# explicit opts that the fit had changed, with old opts, new opts and the why verified.
def _units(): return {**ST, **LESSONS}
def _find(uid, role, key, opts, mn):
    for e in _units()[uid][role]:
        if e['key'] == key and (e.get('opts') or {}) == opts and (e.get('maxNumber') or None) == mn: return e
    errs.append(f'spec_zz_r7: {uid} {role} has no {key}{opts}@{mn}')
def relink(uid, role, key, opts, mn, nopts, nmn, why):
    e = _find(uid, role, key, opts, mn)
    if not e: return
    if nopts: e['opts'] = nopts
    else: e.pop('opts', None)
    if nmn: e['maxNumber'] = nmn
    else: e.pop('maxNumber', None)
    e['why'] = why
def droplink(uid, role, key, opts, mn):
    e = _find(uid, role, key, opts, mn)
    if e: _units()[uid][role].remove(e)

RELINK = [
    ("Y5.B1.S1", "related", "placevalue:number_word_names", {}, None, {"band": 999}, None,
     "another way of writing the same number (words)"),   # spec failed: size 979250 > 1500 — Which is the word name for 979,250? | rule 19: numbers past 10,000 first taught W05, step is W01 | rule 19: numbers past 100,000 
    ("Y5.B1.S2", "related", "placevalue:value", {}, None, {"band": 9999}, None,
     "value of a digit in a 4-digit number"),   # spec failed: why names "4-digit" but only 0 of 100 items have 4-digit numbers
    ("Y5.B1.S2", "related", "placevalue:number_word_names", {}, None, {"band": 9999}, None,
     "the number in words"),   # spec failed: size 979250 > 15000 — Which is the word name for 979,250? | rule 19: numbers past 100,000 first taught W06, step is W05
    ("Y5.B1.S3", "related", "placevalue:number_word_names", {}, None, {"band": 99999}, None,
     "5-digit numbers in words"),   # spec failed: size 979250 > 150000 — Which is the word name for 979,250? | rule 19: numbers past 100,000 first taught W06, step is W05 | why names "5-digit" but onl
    ("Y5.B1.S7", "pre", "placevalue:value", {}, None, {"band": 999999}, None,
     "Y5.B1.S4 Numbers to 1,000,000 (earlier Y5 step)"),   # spec failed: cited "to 1,000,000" but the items reach 994 | why claims 1000000 but the items reach 994
    ("Y5.B1.S10", "pre", "placevalue:identify", {}, None, {"band": 99999}, None,
     "Y5.B1.S3 Numbers to 100,000 (earlier Y5 step)"),   # spec failed: cited "to 100,000" but the items reach 994 | why claims 100000 but the items reach 994
    ("Y5.B1.S10", "related", "placevalue:number_word_names", {}, None, {"band": 99999}, None,
     "the same 5-digit numbers named in words, read before they are compared"),   # spec failed: size 979250 > 150000 — Which is the word name for 979,250? | why names "5-digit" but only 0 of 100 items have 5-digit numbers
    ("Y5.B1.S11", "pre", "placevalue:identify", {}, None, {"band": 999999}, None,
     "Y5.B1.S4 Numbers to 1,000,000 (earlier Y5 step)"),   # spec failed: cited "to 1,000,000" but the items reach 994 | why claims 1000000 but the items reach 994
    ("Y5.B2.S3", "pre", "subtraction:sub_across_zeros", {}, None, {"band": 10000}, None,
     "Y4.B2.S7 Subtract two 4-digit numbers - more than one exchange (prior learning wk W09): exchanging across zeros, ≤ 4 digits"),   # spec failed: why names "4-digit" but only 0 of 100 items have 4-digit numbers
    ("Y5.B2.S7", "pre", "placevalue:compare", {}, None, {"band": 999999}, None,
     "Y5.B1.S11 Compare and order numbers to 1,000,000 (earlier Y5 step)"),   # spec failed: cited "to 1,000,000" but the items reach 999 | why claims 1000000 but the items reach 999
    ("Y5.B3.S1", "pre", "patterns:seq_5", {"band": 1000}, None, {"band": 50}, None,
     "Y2.B1.S15 Count in 2s, 5s and 10s (prior learning wk W01)"),   # spec failed: size 992 > 216 — Complete: 977, ___, 987, 992
    ("Y5.B3.S1", "pre", "patterns:seq_10", {"band": 1000}, None, {"band": 50}, None,
     "Y2.B1.S15 Count in 2s, 5s and 10s (prior learning wk W01)"),   # spec failed: size 960 > 216 — Complete: ___, 940, 950, 960
    ("Y5.B3.S2", "pre", "multiplication:count_by_tables", {}, None, {"constant": [3]}, None,
     "Y4.B4.S1 Multiples of 3 (prior learning wk W01)"),   # spec failed: size 144 > 100 — Count by 12. Write the missing numbers. | why names 3 but only 10 of 100 items use it
    ("Y5.B3.S2", "pre", "multiplication:mult_facts", {"constant": [3, 6, 9]}, None, {"constant": [9], "band": 100}, None,
     "Y4.B4.S5 9 times-table and division facts (lower grade, same idea; the multiplication half)"),   # spec failed: size 108 > 100 — 9 × 12 = ? | why names 9 but only 41 of 100 items use it
    ("Y5.B3.S2", "related", "number_theory:divisibility_sort", {}, None, {"band": 50}, None,
     "sort by divisor"),   # spec failed: size 205 > 100 — Sort these numbers: Which are divisible by 10?
    ("Y5.B3.S5", "pre", "multiplication:mult_facts", {}, None, {"constant": [2, 4, 8]}, None,
     "Y3.B3.S15 The 2, 4 and 8 times-tables (prior learning wk W02)"),   # spec failed: why names 2, 4, 8 but only 38 of 100 items use them
    ("Y5.B3.S5", "related", "number_theory:divisibility_sort", {}, None, {"band": 50}, None,
     "divisibility rules rule numbers out"),   # spec failed: size 205 > 145.5 — Sort these numbers: Which are divisible by 10?
    ("Y5.B3.S5", "related", "number_theory:mixed_number_theory", {}, None, {}, 100,
     "mixed review"),   # spec failed: size 195 > 145.5 — Sort these numbers: Which are divisible by 5?
    ("Y5.B3.S7", "pre", "multiplication:mult_facts", {}, None, {"constant": [2, 4, 8]}, None,
     "Y3.B3.S15 The 2, 4 and 8 times-tables (lower grade, same cluster CCSS 3.OA.C.7)"),   # spec failed: why names 2, 4, 8 but only 38 of 100 items use them
    ("Y5.B3.S8", "pre", "multiplication:count_by_tables", {}, None, {"constant": [10]}, None,
     "Y2.B5.S13 The 10 times-table (prior learning wk W10)"),   # spec failed: why names 10 but only 5 of 100 items use it
    ("Y5.B3.S8", "pre", "patterns:seq_10", {}, None, {"band": 1000}, None,
     "Y1.B9.S2 Count in 10s (prior learning wk W10)"),   # spec failed: cited "Count in 10s" but only 4 of 100 items count in those steps
    ("Y5.B3.S9", "pre", "division:div_facts", {}, None, {"constant": [10]}, None,
     "Y2.B5.S14 Divide by 10 (prior learning wk W10)"),   # spec failed: why names 10 but only 12 of 100 items use it
    ("Y5.B3.S9", "related", "division:divide", {}, None, {"range": 100}, None,
     "division facts and beyond"),   # spec failed: rule 19: short division (the division bracket) first taught W11, step is W10
    ("Y5.B4.S1", "pre", "fractions:equiv_frac_nv", {}, None, {"denoms": [2]}, None,
     "Y4.B7.S10 Equivalent fraction families (prior learning wk W15)"),   # spec failed: denominator 30 (Grade 4: 2, 3, 4, 5, 6, 8, 10, 12, 100 and their doubles)
    ("Y5.B4.S1", "pre", "fractions:identify", {}, None, {"forms": [1]}, None,
     "Y2.B8.S10 Unit fractions (prior learning wk W15)"),   # spec failed: cited "unit fractions" but only 20 of 100 items are unit fractions
    ("Y5.B4.S1", "related", "fractions:select_equiv_frac", {}, None, {"denoms": [3]}, None,
     "recognise equivalents (next step Y5.B4.S3)"),   # spec failed: denominator 40 (Grade 4: 2, 3, 4, 5, 6, 8, 10, 12, 100 and their doubles)
    ("Y5.B4.S1", "related", "fractions:simplify", {}, None, {"forms": [1]}, None,
     "the inverse: simplify to the unit fraction"),   # spec failed: rule 19: unlike denominators ± first taught W17, step is W15 | rule 19: negative numbers first taught W38, step is W15 | denominator 32 (Grade 4: 2, 3
    ("Y5.B4.S2", "related", "fractions:select_equiv_frac", {}, None, {"denoms": [3]}, None,
     "recognise equivalents (next step)"),   # spec failed: denominator 40 (Grade 4: 2, 3, 4, 5, 6, 8, 10, 12, 100 and their doubles)
    ("Y5.B4.S2", "related", "fractions:simplify", {}, None, {"forms": [1]}, None,
     "inverse: simplify"),   # spec failed: rule 19: unlike denominators ± first taught W17, step is W15 | rule 19: negative numbers first taught W38, step is W15 | denominator 32 (Grade 4: 2, 3
    ("Y5.B4.S3", "related", "fractions:simplify", {}, None, {"forms": [1]}, None,
     "simplest form"),   # spec failed: rule 19: unlike denominators ± first taught W17, step is W15 | rule 19: negative numbers first taught W38, step is W15 | denominator 32 (Grade 4: 2, 3
    ("Y5.B4.S11", "related", "fraction_operations:sub_frac_unlike", {}, None, {"denoms": [2]}, None,
     "inverse"),   # spec failed: unrelated denominators ± (5.NF.A.1): 1/5 − 1/8 | denominator 60 (Grade 4: 2, 3, 4, 5, 6, 8, 10, 12, 100 and their doubles)
    ("Y5.B5.S1", "pre", "multiplication:mult_facts", {"constant": [3, 6, 9]}, None, {"constant": [9]}, None,
     "Y4.B4.S5 9 times-table and division facts (lower grade, same idea; the multiplication half)"),   # spec failed: why names 9 but only 41 of 100 items use it
    ("Y5.B5.S1", "related", "division:divide", {}, None, {"range": 100}, None,
     "the inverse: division facts and 2-digit ÷ 1-digit, before 4-digit ÷ 1-digit (Y5.B5.S8)"),   # spec failed: why claims 1000 but the items reach 96
    ("Y5.B5.S6", "pre", "multiplication:mult_facts", {"constant": [6, 7, 9]}, None, {"constant": [7]}, None,
     "Y4.B4.S8 7 times-table and division facts (lower grade, same idea; the multiplication half)"),   # spec failed: why names 7 but only 38 of 100 items use it
    ("Y5.B5.S6", "related", "division:div_word_problems_plain", {}, None, {"range": 100}, None,
     "the inverse: one-step division stories"),   # spec failed: divisor 14 in a division story (Grade 4 divides by one digit)
    ("Y5.B5.S7", "pre", "division:missing_mult_div", {}, None, {"range": 100}, None,
     "Y3.B4.S6 Link multiplication and division (prior learning wk W12)"),   # spec failed: divisor 20 (Grade 4 divides by one digit, 10, 100, 1,000)
    ("Y5.B5.S7", "pre", "division:div_facts", {}, None, {"constant": [10]}, None,
     "Y2.B5.S14 Divide by 10 (lower grade, same cluster CCSS 3.OA.C.7)"),   # spec failed: why names 10 but only 12 of 100 items use it
    ("Y5.B5.S8", "pre", "division:missing_mult_div", {}, None, {"range": 100}, None,
     "Y3.B4.S6 Link multiplication and division (prior learning wk W12)"),   # spec failed: divisor 20 (Grade 4 divides by one digit, 10, 100, 1,000)
    ("Y5.B5.S8", "related", "division:div_word_problems_plain", {}, None, {"range": 100}, None,
     "division stories"),   # spec failed: divisor 14 in a division story (Grade 4 divides by one digit)
    ("Y5.B5.S9", "related", "division:remainder_interpret", {}, None, {"range": 100}, None,
     "what the remainder means in a story"),   # spec failed: divisor 15 in a division story (Grade 4 divides by one digit)
    ("Y5.B5.S10", "pre", "division:missing_mult_div", {}, None, {"range": 100}, None,
     "Y3.B4.S6 Link multiplication and division (prior learning wk W12)"),   # spec failed: divisor 20 (Grade 4 divides by one digit, 10, 100, 1,000)
    ("Y5.B5.S10", "related", "division:div_check_by_multiplying", {}, None, {"range": 100}, None,
     "check the result"),   # spec failed: size 891 > 444 — Check by multiplying: 891 ÷ 9 = 99. Write the correct answer
    ("Y5.B5.S11", "related", "division:div_word_problems_plain", {}, None, {"range": 100}, None,
     "one-step division stories"),   # spec failed: divisor 14 in a division story (Grade 4 divides by one digit)
    ("Y5.B6.S1", "related", "fractions:fraction_of_set_nv", {}, None, {"denoms": [2]}, None,
     "a fraction of an amount (1/2 of 12, 6/8 of 16): halves, quarters and eighths, unit and non-unit"),   # spec failed: denominator 30 (Grade 4: 2, 3, 4, 5, 6, 8, 10, 12, 100 and their doubles)
    #   re-read: why said "1/n"; items also deal non-unit fractions
    ("Y5.B6.S2", "related", "fraction_operations:frac_mult_word", {}, None, {"denoms": [5]}, None,
     "fraction × whole number in stories (each serving uses 2/5 L: 3 servings = 1 1/5 L), some asking which numbers are needed; about half are 'how many 1/5 m pieces in 3 m' stories (Grade 5, 5.NF.B.7c), worked here by counting 5 fifths in each metre"),   # spec failed: rule 19: customary units first taught W33, step is W19
    #   re-read: critic r7 minor: the ÷-unit-fraction share named
    ("Y5.B6.S3", "related", "fraction_operations:frac_mult_word", {}, None, {"denoms": [5]}, None,
     "fraction × whole number in stories (each serving uses 2/5 L: 3 servings = 1 1/5 L), some asking which numbers are needed; about half are 'how many 1/5 m pieces in 3 m' stories (Grade 5, 5.NF.B.7c), worked here by counting 5 fifths in each metre"),   # spec failed: rule 19: customary units first taught W33, step is W19
    #   re-read: critic r7 minor
    ("Y5.B6.S3", "related", "fractions:fraction_of_set_nv", {}, None, {"denoms": [2]}, None,
     "next step: a fraction of a quantity"),   # spec failed: denominator 30 (Grade 4: 2, 3, 4, 5, 6, 8, 10, 12, 100 and their doubles)
    ("Y5.B6.S4", "pre", "division:div_word_problems", {}, None, {"range": 100}, None,
     "divide by the denominator (prior learning wk W20)"),   # spec failed: size 140 > 108 — Ana has 140 stamps. Ana puts 14 stamps in each jar. How many | divisor 14 in a division story (Grade 4 divides by one digit)
    ("Y5.B6.S4", "pre", "patterns:halve", {}, None, {"band": 50}, None,
     "halving (prior learning wk W20)"),   # spec failed: size 9990 > 108 — Half of 9,990
    ("Y5.B6.S4", "related", "fractions:fraction_of_set_hard_nv", {}, None, {"denoms": [2]}, None,
     "Y5.B6.S5 Fraction of an amount (next step)"),   # spec failed: size 200 > 108 — Click ALL expressions equal to 5/10 of 40.
    ("Y5.B6.S5", "pre", "fractions:fraction_of_set_nv", {}, None, {"denoms": [2]}, None,
     "Y5.B6.S4 (previous step)"),   # spec failed: denominator 30 (Grade 4: 2, 3, 4, 5, 6, 8, 10, 12, 100 and their doubles)
    ("Y5.B6.S5", "pre", "division:div_word_problems", {}, None, {"range": 100}, None,
     "divide by the denominator (prior learning wk W20)"),   # spec failed: divisor 14 in a division story (Grade 4 divides by one digit)
    ("Y5.B6.S5", "pre", "multiplication:mult_facts", {}, None, {"constant": [12]}, None,
     "Y4.B4.S10 12 times-table and division facts (lower grade, same idea; multiply the unit part back up; the multiplication half)"),   # spec failed: why names 12 but only 14 of 100 items use it
    ("Y5.B6.S5", "related", "fraction_operations:frac_mult_word", {}, None, {"denoms": [5]}, None,
     "fraction × whole number in stories (each serving uses 2/5 L: 3 servings = 1 1/5 L), some asking which numbers are needed; about half are 'how many 1/5 m pieces in 3 m' stories (Grade 5, 5.NF.B.7c), worked here by counting 5 fifths in each metre"),   # spec failed: rule 19: customary units first taught W33, step is W20
    #   re-read: critic r7 minor
    ("Y5.B6.S6", "pre", "fractions:fraction_of_set_nv", {}, None, {"denoms": [2]}, None,
     "Y5.B6.S4 (earlier step)"),   # spec failed: denominator 30 (Grade 4: 2, 3, 4, 5, 6, 8, 10, 12, 100 and their doubles)
    ("Y5.B6.S6", "pre", "division:missing_mult_div", {}, None, {"range": 100}, None,
     "inverse operations (CCSS 3.OA.A.4)"),   # spec failed: size 550 > 300 — ___ × 25 = 550 | divisor 20 (Grade 4 divides by one digit, 10, 100, 1,000)
    ("Y5.B6.S6", "pre", "multiplication:mult_facts", {}, None, {"constant": [12]}, None,
     "Y4.B4.S10 12 times-table and division facts (lower grade, same idea; multiply the unit part back up; the multiplication half)"),   # spec failed: why names 12 but only 14 of 100 items use it
    ("Y5.B6.S7", "pre", "division:div_word_problems", {}, None, {"range": 100}, None,
     "÷ by the denominator (prior learning wk W20)"),   # spec failed: size 140 > 100 — Ana has 140 stamps. Ana puts 14 stamps in each jar. How many | divisor 14 in a division story (Grade 4 divides by one digit)
    ("Y5.B7.S1", "pre", "conversions:f_to_d", {}, None, {"denoms": [5]}, None,
     "Y4.B8.S2 Tenths as decimals (prior learning wk W21)"),   # spec failed: rule 19: percent first taught W22, step is W21
    ("Y5.B7.S1", "pre", "fractions:write_fraction", {}, None, {"denoms": [5]}, None,
     "Y4.B8.S1 Tenths as fractions (prior learning wk W21; shaded fifths and tenths, as 3/5 and 2/10)"),   # spec failed: cited step names tenths but only 17 of 100 items deal it
    #   re-read: denoms 5 is the fifths-tenths family
    ("Y5.B7.S1", "pre", "placevalue:value", {}, None, {"band": 99}, None,
     "whole-number place value (CCSS 4.NBT.A.2)"),   # spec failed: size 994 > 100 — What is the underlined digit worth?
    ("Y5.B7.S3", "pre", "fractions:write_fraction", {}, None, {"denoms": [5]}, None,
     "Y4.B8.S1 Tenths as fractions (lower grade, same idea; shaded fifths and tenths, as 3/5 and 2/10)"),   # spec failed: cited step names tenths but only 17 of 100 items deal it
    #   re-read: same
    ("Y5.B7.S4", "pre", "fractions:simplify", {}, None, {"forms": [1]}, None,
     "simplest form (CCSS 4.NF.A.1)"),   # spec failed: rule 19: negative numbers first taught W38, step is W21 | denominator 32 (Grade 4: 2, 3, 4, 5, 6, 8, 10, 12, 100 and their doubles)
    ("Y5.B7.S6", "pre", "placevalue:value", {}, None, {"band": 99}, None,
     "value of a digit (CCSS 4.NBT.A.2)"),   # spec failed: size 994 > 513 — What is the underlined digit worth?
    ("Y5.B7.S7", "pre", "placevalue:value", {}, None, {"band": 99}, None,
     "value of a digit (CCSS 4.NBT.A.2)"),   # spec failed: size 994 > 100 — What is the underlined digit worth?
    ("Y5.B7.S8", "pre", "conversions:d_to_f", {}, None, {"forms": [1]}, None,
     "Y4.B8.S8 Hundredths as decimals (lower grade, same idea)"),   # spec failed: cited step names hundredths but only 32 of 100 items deal it
    ("Y5.B7.S9", "pre", "placevalue:compare", {}, None, {"band": 99}, None,
     "compare whole numbers (prior learning wk W22)"),   # spec failed: size 999 > 148.5 — Compare: 936 ___ 999
    ("Y5.B7.S13", "pre", "fractions:simplify", {}, None, {"forms": [1]}, None,
     "simplest form (CCSS 4.NF.A.1)"),   # spec failed: rule 19: negative numbers first taught W38, step is W22 | denominator 32 (Grade 4: 2, 3, 4, 5, 6, 8, 10, 12, 100 and their doubles)
    ("Y5.B8.S1", "pre", "multiplication:multiply", {}, None, {"range": 100}, None,
     "multiplication facts within 100 (8 × 5, 11 × 2): a perimeter uses the × 2 fact, a rectangle has two of each side (CCSS 3.OA.C.7)"),   # spec failed: size 7272 > 300 — 909 × 8 = ?
    #   re-read: why said "× 2 facts and doubling"; items are mixed facts
    ("Y5.B8.S1", "related", "area_perimeter:area", {}, None, {"forms": [1]}, None,
     "Y5.B8.S4 Area of rectangles (next idea, same shape)"),   # spec failed: size 2100 > 300 — Find the area of a rectangle: length = 50, width = 42 | rule 19: customary units first taught W33, step is W28 | triangle area (6.G.
    ("Y5.B8.S1", "related", "area_perimeter:area_perimeter", {}, None, {"band": 50}, None,
     "both measures of one rectangle"),   # spec failed: size 2500 > 300 — Find BOTH the perimeter AND area of this shape.
    ("Y5.B8.S2", "related", "area_perimeter:area_polygon_decompose", {}, None, {"band": 50}, None,
     "same L/T/U shapes, area instead of perimeter"),   # spec failed: size 106 > 100 — What is the total area of this U-shape?
    ("Y5.B8.S3", "pre", "area_perimeter:composite_shapes", {}, None, {"band": 40}, None,
     "Y5.B8.S2 Perimeter of rectilinear shapes (previous step)"),   # spec failed: size 177 > 100 — Find BOTH the perimeter AND area of this L-shape.
    ("Y5.B8.S4", "related", "area_perimeter:area_perimeter", {}, None, {"band": 50}, None,
     "area and perimeter of one rectangle"),   # spec failed: size 2500 > 100 — Find BOTH the perimeter AND area of this shape.
    ("Y5.B8.S4", "related", "area_perimeter:area_distributive_visual", {}, None, {"band": 50}, None,
     "split a rectangle to multiply"),   # spec failed: size 380 > 100 — The rectangle is split into two parts. What is the TOTAL are
    ("Y5.B8.S4", "related", "area_perimeter:area_polygon_decompose", {}, None, {"band": 50}, None,
     "Y5.B8.S5 compound shapes (next step)"),   # spec failed: size 106 > 100 — What is the total area of this U-shape?
    ("Y5.B8.S5", "pre", "area_perimeter:area", {}, None, {"forms": [1]}, None,
     "Y5.B8.S4 Area of rectangles (previous step)"),   # spec failed: size 2100 > 273 — Find the area of a rectangle: length = 50, width = 42 | rule 19: customary units first taught W33, step is W29 | triangle area (6.G.
    ("Y5.B8.S5", "pre", "area_perimeter:area_distributive_visual", {}, None, {"band": 50}, None,
     "split a rectangle into two parts (lower grade, CCSS 3.MD.C.7c)"),   # spec failed: size 380 > 273 — The rectangle is split into two parts. What is the TOTAL are
    ("Y5.B8.S6", "pre", "area_perimeter:area", {}, None, {"forms": [1], "band": 25}, None,
     "Y5.B8.S4 Area of rectangles"),   # spec failed: size 2100 > 100 — Find the area of a rectangle: length = 50, width = 42 | rule 19: customary units first taught W33, step is W30 | triangle area (6.G.
    ("Y5.B8.S6", "related", "area_perimeter:area_perimeter", {}, None, {"band": 50}, None,
     "the exact area of a rectangle, to check an estimate against"),   # spec failed: size 2500 > 100 — Find BOTH the perimeter AND area of this shape.
    ("Y5.B9.S1", "pre", "graphs:bar_graph", {}, None, {"forms": [0]}, None,
     "Y3/Gr.2 Interpret bar charts (prior learning wk W36)"),   # spec failed: size 145 > 100 — How many children chose a fruit in all?
    ("Y5.B9.S2", "pre", "graphs:bar_graph", {}, None, {"forms": [0]}, None,
     "Y3/Gr.2 Interpret bar charts (prior learning wk W36)"),   # spec failed: size 145 > 100 — How many children chose a fruit in all?
    ("Y5.B9.S3", "pre", "graphs:bar_graph", {}, None, {"forms": [0]}, None,
     "Y3/Gr.2 Interpret bar charts (prior learning wk W04)"),   # spec failed: size 145 > 100 — How many children chose a fruit in all?
    ("Y5.B9.S4", "pre", "graphs:bar_graph", {}, None, {"forms": [0]}, None,
     "Y3/Gr.2 Interpret bar charts (prior learning wk W04)"),   # spec failed: size 145 > 100 — How many children chose a fruit in all?
    ("Y5.B9.S4", "related", "graphs:pictograph", {}, None, {"forms": [0]}, None,
     "the same counts as a picture graph"),   # spec failed: size 575 > 100 — How many cars were counted in all?
    ("Y5.B10.S3", "related", "angles_lines:additive_angles", {}, None, {"forms": [0]}, None,
     "benchmark 90° plus a part"),   # spec failed: size 360 > 270 — An angle is split into two parts. One part is 176° and the w
    ("Y5.B10.S4", "pre", "measurement:temperature", {}, None, {"forms": [1]}, None,
     "Y2.B7.S9 Temperature (lower grade, same idea)"),   # spec failed: rule 19: customary units first taught W33, step is W25 | K: customary units (°F) on a metric / time unit
    ("Y5.B10.S4", "related", "angles_lines:additive_angles", {}, None, {"forms": [0]}, None,
     "two parts that make a right angle: find the missing part (80° and ? make 90°)"),   # spec failed: size 360 > 270 — An angle is split into two parts. One part is 176° and the w
    #   re-read: why said "measure two parts and add"; items give one part and the whole
    ("Y5.B10.S6", "pre", "subtraction:sub_1k_regroup", {}, None, {"band": 100}, None,
     "Y3.B2.S15 Subtract two numbers (across a 10) (lower grade, same idea; subtraction with an exchange, the step behind 360 − 145)"),   # spec failed: size 1000 > 540 — 1,000 − 452 = ?
    ("Y5.B10.S7", "pre", "subtraction:sub_1k_regroup", {}, None, {"band": 100}, None,
     "Y3.B2.S15 Subtract two numbers (across a 10) (lower grade, same idea; subtraction with an exchange, the step behind 180 − 45)"),   # spec failed: size 1000 > 540 — 1,000 − 452 = ?
    ("Y5.B10.S8", "related", "area_perimeter:composite_shapes", {}, None, {"band": 40}, None,
     "missing lengths in rectilinear shapes"),   # spec failed: size 177 > 100 — Find BOTH the perimeter AND area of this L-shape.
    ("Y5.B10.S8", "related", "angles_lines:additive_angles", {}, None, {"forms": [0]}, None,
     "angles that add up: the missing part of a right angle (46° and ? make 90°), the idea a missing angle in a shape is found with (Y5.B10.S6)"),   # spec failed: size 360 > 100 — An angle is split into two parts. One part is 176° and the w
    #   re-read: why said "a whole turn or a straight line"; forms 0 is parts of 90°
    ("Y5.B11.S1", "pre", "graphs:bar_graph", {}, None, {"forms": [0]}, None,
     "reading values off an axis"),   # spec failed: size 145 > 100 — How many children chose a fruit in all?
    ("Y5.B11.S3", "related", "coordinates:geo_rotate", {}, None, {"forms": [1]}, None,
     "another transformation"),   # spec failed: size 270 > 100 — Which figure shows this shape rotated 270° clockwise around 
    ("Y5.B11.S5", "pre", "shapes_early:partition_shapes", {}, None, {"forms": [1]}, None,
     "equal parts of shapes, halves and quarters (lower grade, same cluster CCSS 2.G.A.3)"),   # spec failed: why names halves but only 32 of 100 items deal it
    #   re-read: why said halves only
    ("Y5.B11.S6", "related", "coordinates:geo_rotate", {}, None, {"forms": [1]}, None,
     "another transformation"),   # spec failed: size 270 > 100 — Which figure shows this shape rotated 270° clockwise around 
    ("Y5.B12.S1", "related", "decimals:add_decimal", {}, None, {"range": 100}, None,
     "decimal addition written in a line (23.2 + 64.4): the written sums known facts make quick"),   # spec failed: size 187 > 100 — 92.2 + 95.6 = ?
    ("Y5.B12.S1", "related", "fraction_operations:add_fractions_like", {}, None, {"denoms": [5]}, None,
     "the same facts with fractions: 4/10 + 6/10 = 1, as 0.4 + 0.6 = 1 (fifths and tenths, click the sums that make 1)"),   # spec failed: why names tenths but only 11 of 100 items deal it
    #   re-read: why said "3/10 + 4/10"; items are click-all sums to 1 in fifths and tenths
    ("Y5.B12.S2", "related", "decimals:add_decimal", {}, None, {"range": 100}, None,
     "Y5.B12.S3 Add and subtract decimals across 1 (next step; the adding half)"),   # spec failed: size 187 > 100 — 92.2 + 95.6 = ?
    ("Y5.B12.S3", "pre", "addition:add_1k_regroup", {}, None, {"band": 100}, None,
     "Y3 Add two numbers (across a 10) (prior learning wk W13)"),   # spec failed: size 991 > 280.5 — 494 + 497 = ?
    ("Y5.B12.S3", "pre", "conversions:d_to_f", {}, None, {"forms": [0]}, None,
     "Y4.B8.S8 (prior learning wk W13)"),   # spec failed: rule 19: percent first taught W22, step is W13
    ("Y5.B12.S4", "pre", "addition:add_1k_regroup", {}, None, {"band": 100}, None,
     "Y3 Add two numbers (across a 10) (prior learning wk W13)"),   # spec failed: size 991 > 276 — 494 + 497 = ?
    ("Y5.B12.S5", "pre", "subtraction:sub_10k_regroup", {}, None, {"band": 100}, None,
     "column subtraction with exchange (prior learning wk W14)"),   # spec failed: size 9960 > 148.5 — 9,960 − 4,572 = ?
    ("Y5.B12.S6", "pre", "addition:add_10k_regroup", {}, None, {"band": 100}, None,
     "column addition with exchange (prior learning wk W14)"),   # spec failed: size 9840 > 276 — 3,798 + 6,042 = ?
    ("Y5.B12.S9", "pre", "patterns:count_by_step_up", {"range": 1000}, None, {"range": 50}, None,
     "count up in steps (lower grade, same cluster CCSS 4.OA.C.5)"),   # spec failed: size 1255 > 100 — Count up by 50s. Fill in the missing numbers.
    ("Y5.B12.S9", "pre", "patterns:count_by_step_down", {}, None, {"range": 50}, None,
     "count back in steps (CCSS 4.OA.C.5)"),   # spec failed: size 19578 > 100 — Count down by 2s. Fill in the missing numbers.
    ("Y5.B12.S9", "pre", "patterns:number_pattern", {}, None, {"band": 50}, None,
     "find the rule (CCSS 4.OA.C.5)"),   # spec failed: size 4936 > 100 — Find the pattern. Fill in the missing numbers.
    ("Y5.B12.S10", "pre", "conversions:d_to_f", {}, None, {"forms": [0]}, None,
     "tenths written as a decimal and as a fraction (0.7 = 7/10), lower grade (Y4.B8 tenths)"),   # spec failed: rule 19: percent first taught W22, step is W10
    ("Y5.B12.S11", "pre", "division:div_facts", {}, None, {"constant": [10]}, None,
     "Y2.B5.S14 Divide by 10 (prior learning wk W10)"),   # spec failed: why names 10 but only 12 of 100 items use it
    ("Y5.B12.S11", "related", "conversions:d_to_f", {}, None, {"forms": [0]}, None,
     "decimal to fraction"),   # spec failed: rule 19: percent first taught W22, step is W10
    ("Y5.B12.S12", "pre", "multiplication:mult_zeros", {}, None, {"forms": [0]}, None,
     "× multiples of 10 (CCSS 4.NBT.B.5)"),   # spec failed: why names 10 but only 34 of 100 items use it
    ("Y5.B12.S12", "pre", "multiplication:mult_facts", {"constant": [3, 6, 9]}, None, {"constant": [9]}, None,
     "Y4.B4.S5 9 times-table and division facts (lower grade, same idea; the multiplication half)"),   # spec failed: why names 9 but only 41 of 100 items use it
    ("Y5.B13.S1", "pre", "placevalue:compare", {}, None, {"band": 99}, None,
     "Y2/Gr.1 compare numbers (prior learning)"),   # spec failed: size 999 > 100 — Compare: 936 ___ 999
    ("Y5.B13.S1", "pre", "counting:number_seq_fill", {}, None, {"range": 100}, None,
     "fill a counting sequence (prior learning)"),   # spec failed: size 977 > 100 — Write the missing number in the number track.
    ("Y5.B13.S2", "pre", "counting:number_seq_fill", {}, None, {"range": 100}, None,
     "fill a counting sequence (prior learning)"),   # spec failed: size 977 > 100 — Write the missing number in the number track.
    ("Y5.B13.S2", "pre", "patterns:seq_10", {}, None, {"band": 50}, None,
     "counting sequences (prior learning)"),   # spec failed: size 9800 > 100 — Complete: 9,770, ___, 9,790, 9,800
    ("Y5.B13.S3", "pre", "patterns:seq_2", {}, None, {"band": 50}, None,
     "count in 2s (prior learning)"),   # spec failed: size 9776 > 100 — Complete: 9,770, ___, 9,774, 9,776
    ("Y5.B13.S3", "pre", "patterns:seq_5", {}, None, {"band": 50}, None,
     "count in 5s (prior learning)"),   # spec failed: size 9785 > 100 — Complete: 9,770, ___, 9,780, 9,785
    ("Y5.B13.S3", "pre", "patterns:seq_10", {}, None, {"band": 50}, None,
     "count in 10s (prior learning)"),   # spec failed: size 9800 > 100 — Complete: 9,770, ___, 9,790, 9,800
    ("Y5.B13.S4", "pre", "placevalue:compare", {}, None, {"band": 99}, None,
     "Y2/Gr.1 compare numbers (prior learning)"),   # spec failed: size 999 > 150 — Compare: 936 ___ 999
    ("Y5.B13.S4", "pre", "placevalue:order_least_to_greatest", {}, None, {"band": 99}, None,
     "order numbers (prior learning)"),   # spec failed: size 999 > 150 — Put the numbers in order. Start with the least.
    ("Y5.B14.S1", "related", "measurement:capacity", {}, None, {"units": [1], "forms": [0]}, None,
     "the same 1,000 rule for litres: 2 L = 2,000 mL, 250 mL = 0.25 L"),   # spec failed: rule 19: customary units first taught W33, step is W31 | K: customary units (pints) on a metric / time unit
    #   re-read: fit took units only (container clicks); the convert form is the "1,000 rule" the why names
    ("Y5.B14.S3", "pre", "measurement:mass_volume_liquid", {"forms": [0]}, None, {"forms": [2]}, None,
     "Y3.B7.S8 Measure capacity and volume in litres and millilitres (lower grade, same idea; this form chooses the unit for an object, g or kg, mL or L, by sorting and clicking: the sense of size behind a change of metric unit)"),   # spec failed: why claims "litres" (litres) but only 0 of 100 items show it | why claims "kg" (kilograms) but only 0 of 100 items show it | why names litres but only
    #   re-read: r7 explicit re-option: cylinder (forms 0) too big here; forms 2 is unit choice, said so
    ("Y5.B14.S4", "pre", "measurement:length_customary", {}, None, {"forms": [0]}, None,
     "customary lengths (lower grade, same CCSS 4.MD.A.1)"),   # spec failed: size 63360 > 855 — How many feet are in 12 miles?
    ("G4|-|multiplyanddividemultiplesof10usingbasicfactseg90x5030030", "pre", "placevalue:place_value_10x", {"op": "x", "power": [10, 100], "band": 10000}, None, {"op": "x", "power": [10, 100], "band": 1000}, None,
     "Y4.B5.S4 Multiply by 100 (lower grade, same idea)"),   # spec failed: size 9700 > 3600 — 97 × 100 = ?
    ("G4|-|extendgrowingshapepatterns", "pre", "patterns:count_by_step_up", {"step": [1]}, None, {"step": [1], "range": 100}, None,
     "Y2.B1.S16 Count in 3s (lower grade, same idea; this option counts on in 3s and in 4s)"),   # spec failed: size 9947 > 150 — Count up by 3s. Fill in the missing numbers.
    #   re-read: critic r7 carried minor: step [1] is "3s and 4s"
    ("G4|-|findemergentfeaturesegunitsdigitcycle", "pre", "patterns:skip_count_line", {"step": [0]}, None, {"step": [0], "band": 50}, None,
     "Y1.B9.S1 Count in 2s (lower grade, same idea; this option skip counts in 2s, 5s and 10s)"),   # spec failed: cited "Count in 2s" but only 28 of 100 items count in those steps
    #   re-read: step [0] is "2s, 5s and 10s"
    ("G4|-|followagivenruletoextendanumberpattern", "pre", "patterns:skip_count_line", {"step": [0]}, None, {"step": [0], "band": 50}, None,
     "Y1.B9.S1 Count in 2s (lower grade, same idea; this option skip counts in 2s, 5s and 10s)"),   # spec failed: cited "Count in 2s" but only 28 of 100 items count in those steps
    #   re-read: same
    ("G4|-|followagivenruletoextendanumberpattern", "pre", "patterns:count_by_step_up", {"step": [1]}, None, {"step": [1], "range": 1000}, None,
     "Y2.B1.S16 Count in 3s (lower grade, same idea; this option counts on in 3s and in 4s)"),   # spec failed: size 9947 > 2184 — Count up by 3s. Fill in the missing numbers.
    #   re-read: same
    ("G4|-|followagivenruletoextendanumberpattern", "related", "patterns:number_pattern", {}, None, {"band": 1000}, None,
     "find the rule yourself and fill the gaps: the inverse task"),   # spec failed: size 4936 > 2184 — Find the pattern. Fill in the missing numbers.
    ("G4|-|multiplicativecomparisontimesasmany", "pre", "multiplication:multiply", {}, None, {"range": 100}, None,
     "Y4.B5.S9 Multiply a 2-digit number by a 1-digit number (lower grade, same idea)"),   # spec failed: size 7272 > 270 — 909 × 8 = ? | why names "2-digit" but only 9 of 100 items have 2-digit numbers
    ("G4|-|multiplicativecomparisontimesasmany", "related", "number_ops_mixed:word_problems_mixed", {}, None, {}, 100,
     "times-as-many stories among other multiplication and division stories (Y5.B5.S11)"),   # spec failed: divisor 13 in a division story (Grade 4 divides by one digit)
    ("G4|-|multiplicativecomparisonwordproblemshowmanytimesasmanyunknownmultiplier", "pre", "division:div_word_problems", {}, None, {"range": 100}, None,
     "Y3.B3.S5 Sharing and grouping (lower grade, same idea)"),   # spec failed: divisor 14 in a division story (Grade 4 divides by one digit)
    ("G4|-|multistepwordproblemsdivideandinterprettheremainder", "pre", "division:div_word_problems", {}, None, {"range": 100}, None,
     "Y3.B3.S5 Sharing and grouping (lower grade, same idea)"),   # spec failed: divisor 14 in a division story (Grade 4 divides by one digit)
    ("G4|-|multistepwordproblemsdivideandinterprettheremainder", "pre", "number_ops_mixed:word_problems_mixed", {}, None, {}, 100,
     "Y5.B5.S11 Solve problems with multiplication and division (taught earlier this year, wk W03)"),   # spec failed: divisor 13 in a division story (Grade 4 divides by one digit)
    ("G4|-|pointslineslinesegmentsandrays", "related", "angles_lines:identify_angles", {}, None, {"forms": [1]}, None,
     "two rays from one point make an angle: the next idea (Y5.B10.S2)"),   # spec failed: size 180 > 100 — What type of angle is this? | rule 19: angles in degrees first taught W23, step is W21
    ("G4|-|customarycapacitycupspintsquartsandgallons", "pre", "division:div_facts", {}, None, {"constant": [4]}, None,
     "Y3.B3.S10 Divide by 4 (lower grade, same idea)"),   # spec failed: size 132 > 100 — 132 ÷ 12 = ? | why names 4 but only 8 of 100 items use it
    ("G4|-|customarycapacitycupspintsquartsandgallons", "pre", "measurement:capacity", {"units": [1], "forms": [0]}, None, {"units": [1], "forms": [1]}, None,
     "Y3.B7.S9 Equivalent capacities and volumes (litres and millilitres) (lower grade, same idea; this form clicks the metric containers larger than 1 litre, a bucket of 8 L against a can of 355 mL: the sense of a litre before cups, pints, quarts and gallons)"),   # spec failed: size 3000 > 1500 — Convert: 3 L = ___ mL
    #   re-read: critic r7 minor: the convert form (3 L = 3,000 mL) is too big for the lesson and capacity has no band, so the click form is cited honestly
    ("G4|-|customarylengthandweightinchesfeetyardsouncesandpounds", "pre", "measurement:length_metric", {"forms": [1]}, None, {"forms": [3]}, None,
     "Y4.B6.S1 Measure in kilometres and metres (lower grade, same idea; converting km to m, 2 km = 2,000 m: a larger unit changed into a smaller one, as the lesson does with its own units)"),   # spec failed: why claims "kilometres" (kilometres) but only 0 of 100 items show it | why names kilometres but only 0 of 100 items have that unit
    #   re-read: r7 explicit re-option: forms 1 failed; forms 3 is km to m, said so
    ("G4|-|comparefractions", "pre", "fractions:identify", {}, None, {"forms": [1]}, None,
     "Y3.B6.S1 Understand the denominators of unit fractions (lower grade, same idea)"),   # spec failed: cited "unit fractions" but only 20 of 100 items are unit fractions
    ("G4|-|dividea1digitnumberby100", "pre", "division:div_facts", {}, None, {"constant": [10]}, None,
     "Y2.B5.S14 Divide by 10 (lower grade, same idea)"),   # spec failed: why names 10 but only 12 of 100 items use it
    ("G4|-|hundredths", "related", "decimals:compare_decimal", {}, None, {"forms": [1]}, None,
     "comparing hundredths once they are on the chart"),   # spec failed: rule 19: thousandths first taught W12, step is W00
    ("G4|-|orderfractions", "pre", "fractions:identify", {}, None, {"forms": [1]}, None,
     "Y3.B6.S1 Understand the denominators of unit fractions (lower grade, same idea)"),   # spec failed: cited "unit fractions" but only 20 of 100 items are unit fractions
]
DROP = [
    ("Y5.B1.S4", "pre", "placevalue:place_value_10x", {}, None),   # rule 19: × / ÷ 1,000 or a decimal result of ÷ 10 / 100 first taught W10, step is W06
    ("Y5.B1.S6", "related", "order_of_operations:exponents_simple", {}, None),   # rule 19: square / cube numbers, powers first taught W37, step is W06 | rule 19: negative numbers first taught W38, step is W06
    ("Y5.B1.S7", "related", "placevalue:place_value_10x", {}, None),   # rule 19: × / ÷ 1,000 or a decimal result of ÷ 10 / 100 first taught W10, step is W06
    ("Y5.B1.S10", "related", "integers:order_negatives", {}, None),   # rule 19: negative numbers first taught W38, step is W07
    ("Y5.B1.S12", "related", "number_sense:nearest_10000", {}, None),   # size 100000 > 15000 — Round 96,072 to the nearest 10,000.
    ("Y5.B1.S13", "related", "number_sense:nearest_100000", {}, None),   # size 1000000 > 150000 — Round 960,725 to the nearest 100,000.
    ("Y5.B1.S14", "related", "number_sense:nearest_million", {}, None),   # size 10000000 > 1500000 — Round 9,607,255 to the nearest 1,000,000.
    ("Y5.B2.S8", "pre", "algebra:tape_diagram", {}, None),   # pre skill first taught at Y5.B2.S6 (W09), after this unit (W01), and in no lower year | rule 19: cites Y5.B2.S6, taught W09, after this step (W01)
    ("Y5.B3.S3", "related", "number_theory:prime_composite", {}, None),   # rule 19: prime / composite first taught W02, step is W01
    ("Y5.B3.S3", "related", "multiplication:mult_div_fact_family", {}, None),   # rule 19: square / cube numbers, powers first taught W37, step is W01
    ("Y5.B3.S10", "pre", "placevalue:place_value_10x", {}, None),   # size 97900 > 67950 — 979 × 100 = ? | rule 19: numbers past 10,000 first taught W05, step is W02 | rule 19: × / ÷ 1,000 or a decimal result of ÷ 10 / 100 first taught W10, step is W02
    ("Y5.B4.S1", "pre", "fractions:write_fraction", {}, None),   # cited "unit fractions" but only 0 of 100 items are unit fractions
    ("Y5.B4.S1", "related", "fraction_operations:frac_10_100", {}, None),   # size 1000 > 100 — Click ALL fractions equivalent to 0.4.
    ("Y5.B4.S2", "related", "fraction_operations:frac_10_100", {}, None),   # size 1000 > 100 — Click ALL fractions equivalent to 0.4.
    ("Y5.B4.S3", "related", "fraction_operations:frac_10_100", {}, None),   # size 1000 > 100 — Click ALL fractions equivalent to 0.4.
    ("Y5.B4.S4", "pre", "multiplication:mult_facts", {}, None),   # size 132 > 100 — 12 × 11 = ? | why names quarters but only 0 of 100 items deal it
    ("Y5.B4.S4", "related", "fractions:round_fractions", {}, None),   # rule 19: rounding decimals first taught W35, step is W16
    ("Y5.B4.S5", "pre", "multiplication:mult_facts", {}, None),   # size 132 > 100 — 12 × 11 = ? | why names quarters but only 0 of 100 items deal it
    ("Y5.B4.S5", "related", "fraction_operations:mult_frac_whole", {}, None),   # rule 19: fraction × whole number first taught W19, step is W16
    ("Y5.B4.S5", "related", "fractions:round_fractions", {}, None),   # rule 19: rounding decimals first taught W35, step is W16
    ("Y5.B4.S8", "related", "fractions:round_fractions", {}, None),   # rule 19: rounding decimals first taught W35, step is W17
    ("Y5.B4.S10", "related", "fraction_operations:estimate_frac_ops", {}, None),   # rule 19: negative numbers first taught W38, step is W17 | unrelated denominators ± (5.NF.A.1): 1/8 + 2/5
    ("Y5.B4.S17", "related", "fraction_operations:frac_word_mixed", {}, None),   # rule 19: customary units first taught W33, step is W16
    ("Y5.B4.S17", "related", "fraction_operations:mixed_fraction_ops", {}, None),   # size 1000 > 100 — Click ALL fractions equivalent to 0.1. | rule 19: fraction × whole number first taught W19, step is W16 | rule 19: customary units first taught W33, step is W16 | fraction 
    ("Y5.B5.S3", "pre", "multiplication:area_model_mult_hard", {}, None),   # size 37152 > 14404.5 — Use the area model to find 96 × 387 | rule 19: 3-digit × 2-digit first taught W34, step is W11
    ("Y5.B5.S4", "related", "division:long_div_2digit", {}, None),   # divisor 70 (Grade 4 divides by one digit, 10, 100, 1,000)
    ("Y5.B5.S5", "pre", "multiplication:mult_placeholder_zero", {"tiles": 22}, None),   # why names "3-digit" but only 0 of 100 items have 3-digit numbers
    ("Y5.B5.S5", "related", "decimals:mult_decimal", {}, None),   # size 70326 > 14998.5 — 78.14 × 9 = ? | decimal × / ÷ a whole number other than 10, 100, 1,000 (5.NBT.B.7)
    ("Y5.B5.S5", "related", "division:long_div_2digit", {}, None),   # divisor 70 (Grade 4 divides by one digit, 10, 100, 1,000)
    ("Y5.B5.S9", "related", "division:remainder_contexts", {}, None),   # divisor 15 in a division story (Grade 4 divides by one digit)
    ("Y5.B5.S11", "related", "division:remainder_contexts", {}, None),   # divisor 15 in a division story (Grade 4 divides by one digit)
    ("Y5.B6.S2", "related", "fraction_operations:mult_frac_frac", {}, None),   # fraction × fraction or ÷ a fraction (5.NF) | unrelated denominators ± (5.NF.A.1): 2/4 + 1/3 | denominator 25 (Grade 4: 2, 3, 4, 5, 6, 8, 10, 12, 100 and their doubles)
    ("Y5.B6.S7", "related", "conversions:percent_of_number", {}, None),   # size 120 > 100 — What is 25% of 120? | rule 19: percent first taught W22, step is W20 | rule 19: negative numbers first taught W38, step is W20 | decimal × / ÷ a whole number other than 10, 
    ("Y5.B7.S1", "related", "conversions:percent_visual", {}, None),   # rule 19: percent first taught W22, step is W21
    ("Y5.B7.S2", "related", "conversions:percent_visual", {}, None),   # rule 19: percent first taught W22, step is W21
    ("Y5.B7.S2", "related", "conversions:f_to_p", {}, None),   # rule 19: percent first taught W22, step is W21
    ("Y5.B7.S2", "related", "fraction_operations:frac_10_100_nv", {}, None),   # size 1000 > 150 — Click ALL fractions equivalent to 0.4.
    ("Y5.B7.S3", "related", "conversions:percent_visual", {}, None),   # rule 19: percent first taught W22, step is W21
    ("Y5.B7.S3", "related", "conversions:p_to_d", {}, None),   # rule 19: percent first taught W22, step is W21
    ("Y5.B7.S4", "related", "conversions:order_fdp", {}, None),   # rule 19: percent first taught W22, step is W21
    ("Y5.B7.S4", "related", "conversions:f_to_p", {}, None),   # rule 19: percent first taught W22, step is W21
    ("Y5.B7.S4", "related", "fraction_operations:frac_10_100_nv", {}, None),   # size 1000 > 150 — Click ALL fractions equivalent to 0.4.
    ("Y5.B7.S5", "related", "decimals:round_thousandths", {}, None),   # rule 19: rounding decimals first taught W35, step is W22
    ("Y5.B7.S5", "related", "placevalue:place_value_10x", {}, None),   # size 97900 > 1500 — 979 × 100 = ?
    ("Y5.B7.S6", "pre", "conversions:d_to_f", {}, None),   # rule 19: percent first taught W22, step is W12 | cited step names hundredths but only 32 of 100 items deal it
    ("Y5.B7.S6", "pre", "conversions:f_to_d", {}, None),   # rule 19: percent first taught W22, step is W12
    ("Y5.B7.S6", "pre", "placevalue:pv_digit_drag", {}, None),   # size 99538 > 513 — Write each digit in its place in the chart: 90,000 + 9,000 +
    ("Y5.B7.S7", "pre", "conversions:d_to_f", {}, None),   # rule 19: percent first taught W22, step is W13 | cited step names hundredths but only 32 of 100 items deal it
    ("Y5.B7.S7", "pre", "placevalue:pv_digit_drag", {}, None),   # size 99538 > 100 — Write each digit in its place in the chart: 90,000 + 9,000 +
    ("Y5.B7.S7", "related", "placevalue:place_value_10x", {}, None),   # size 97900 > 100 — 979 × 100 = ? | why names thousandths but only 0 of 100 items deal it | why claims "thousandths" (3 dp) but only 0 of 100 items show it
    ("Y5.B7.S7", "related", "decimals:round_thousandths", {}, None),   # rule 19: rounding decimals first taught W35, step is W13
    ("Y5.B7.S10", "pre", "number_sense:rounding_table", {}, None),   # size 1000 > 100 — Round each number to the nearest 10. 952: ___ 685: ___ 125: 
    ("Y5.B7.S12", "related", "conversions:d_to_p", {}, None),   # size 200 > 142.5 — Convert to a percent: 2
    ("Y5.B7.S13", "related", "conversions:d_to_p", {}, None),   # size 200 > 150 — Convert to a percent: 2
    ("Y5.B7.S13", "related", "conversions:p_to_d", {}, None),   # size 200 > 150 — Convert to a decimal: 200%
    ("Y5.B7.S15", "related", "conversions:mixed_conversions", {}, None),   # rule 19: customary units first taught W33, step is W23 | decimal × / ÷ a whole number other than 10, 100, 1,000 (5.NBT.B.7) | ratio (6.RP) | denominator 40 (Grade 4: 2, 3, 4, 5, 6, 8, 10, 12
    ("Y5.B7.S15", "related", "fraction_operations:frac_10_100", {}, None),   # size 1000 > 300 — Click ALL fractions equivalent to 0.4. | why claims "percent" (percent) but only 0 of 100 items show it
    ("Y5.B8.S3", "pre", "multiplication:multiply", {}, None),   # size 7272 > 100 — 909 × 8 = ?
    ("Y5.B8.S4", "related", "multiplication:area_model_mult", {}, None),   # size 2250 > 100 — Use the area model to find 6 × 375
    ("Y5.B8.S5", "related", "area_perimeter:volume_composite", {}, None),   # size 13824 > 273 — Find the volume of this cube (side = 24). | rule 19: volume; line graphs first taught W36, step is W29 | K: metric-only link on a customary unit, and its why names no metr
    ("Y5.B8.S5", "related", "area_perimeter:mixed_area_perimeter", {}, None),   # size 10648 > 273 — Find the volume of this cube (side = 22). | rule 19: customary units first taught W33, step is W29 | rule 19: volume; line graphs first taught W36, step is W29 | triangle 
    ("Y5.B8.S5", "related", "multiplication:area_model_mult", {"tiles": 21}, None),   # size 855 > 273 — Use the area model to find 9 × 95
    ("Y5.B8.S6", "related", "measurement:estimate_length", {}, None),   # size 600 > 100 — About how long is a door? | rule 19: customary units first taught W33, step is W30 | K: customary units (yd) on a metric / time unit
    ("Y5.B8.S6", "related", "area_perimeter:area_triangle", {}, None),   # size 200 > 100 — What is the area of this triangle? | triangle area (6.G.A.1)
    ("Y5.B9.S3", "related", "graphs:mixed_graphs", {}, None),   # size 425 > 100 — How many children chose a pet in all? | rule 19: percent first taught W22, step is W04 | rule 19: customary units first taught W33, step is W04
    ("Y5.B10.S3", "pre", "measurement:estimate_length", {}, None),   # size 600 > 270 — About how long is a door? | rule 19: customary units first taught W33, step is W31 | K: customary units (yd) on a metric / time unit
    ("Y5.B10.S4", "pre", "measurement:reading_ruler", {}, None),   # rule 19: customary units first taught W33, step is W25 | K: customary units (inches) on a metric / time unit
    ("Y5.B10.S5", "pre", "measurement:reading_ruler", {}, None),   # rule 19: customary units first taught W33, step is W25 | K: customary units (inches) on a metric / time unit
    ("Y5.B10.S5", "pre", "measurement:length_metric", {}, None),   # size 12000 > 100 — How many mm are in 12 m?
    ("Y5.B11.S1", "related", "coordinates:coordinate_graph", {}, None),   # rule 19: negative numbers first taught W38, step is W27
    ("Y5.B11.S3", "related", "coordinates:geo_reflect", {}, None),   # reflection in an axis
    ("Y5.B11.S4", "related", "coordinates:geo_reflect", {}, None),   # reflection in an axis
    ("Y5.B11.S5", "related", "coordinates:geo_reflect", {}, None),   # reflection in an axis
    ("Y5.B12.S1", "pre", "conversions:d_to_f", {}, None),   # rule 19: percent first taught W22, step is W13 | cited step names hundredths but only 32 of 100 items deal it
    ("Y5.B12.S3", "related", "placevalue:place_value_10x", {}, None),   # size 97900 > 280.5 — 979 × 100 = ? | why claims "decimal" (decimals) but only 0 of 100 items show it
    ("Y5.B12.S3", "related", "composing:number_bonds", {}, None),   # why names tenths but only 0 of 100 items deal it
    ("Y5.B12.S4", "pre", "conversions:d_to_f", {}, None),   # rule 19: percent first taught W22, step is W13 | cited step names hundredths but only 32 of 100 items deal it
    ("Y5.B12.S7", "pre", "subtraction:sub_across_zeros", {}, None),   # size 408 > 148.5 — 408 − 109 = ?
    ("Y5.B12.S8", "related", "number_sense:estimate_sums_diffs", {}, None),   # size 190 > 148.5 — Round each number to the nearest 10. 93 + 96 ≈ ___ + ___ = _
    ("Y5.B12.S10", "pre", "patterns:count_by_powers_of_10", {}, None),   # size 20000000 > 143550 — Count up by 1,000,000s. Fill in the missing numbers.
    ("Y5.B12.S10", "related", "decimals:mult_decimal", {}, None),   # decimal × / ÷ a whole number other than 10, 100, 1,000 (5.NBT.B.7)
    ("Y5.B12.S10", "related", "decimals:compare_thousandths", {}, None),   # rule 19: thousandths first taught W12, step is W10
    ("Y5.B12.S11", "related", "decimals:div_decimal", {}, None),   # decimal × / ÷ decimal (5.NBT.B.7) | decimal × / ÷ a whole number other than 10, 100, 1,000 (5.NBT.B.7)
    ("Y5.B12.S11", "related", "patterns:count_by_powers_of_10", {}, None),   # size 20000000 > 1500 — Count up by 1,000,000s. Fill in the missing numbers.
    ("Y5.B12.S12", "related", "decimals:mult_decimal", {}, None),   # size 70326 > 1500 — 78.14 × 9 = ? | decimal × / ÷ a whole number other than 10, 100, 1,000 (5.NBT.B.7)
    ("Y5.B12.S12", "related", "decimals:div_decimal", {}, None),   # decimal × / ÷ decimal (5.NBT.B.7) | decimal × / ÷ a whole number other than 10, 100, 1,000 (5.NBT.B.7)
    ("Y5.B13.S4", "related", "integers:ordering_rationals", {}, None),   # unrelated denominators ± (5.NF.A.1): 3/4 -1/3 | why claims "number line" (number line) but only 0 of 100 items show it
    ("Y5.B14.S2", "pre", "measurement:unit_conversions", {}, None),   # rule 19: customary units first taught W33, step is W31 | K: customary units (inches) on a metric / time unit | why claims "Kilograms" (kilograms) but only 11 of 100 items show it | why claim
    ("Y5.B14.S2", "related", "measurement:unit_conversion_word", {}, None),   # size 500000 > 18000 — A snake measured 5 km. How many cm is that? | rule 19: customary units first taught W33, step is W31 | K: customary units (ft) on a metric / time unit
    ("Y5.B14.S3", "pre", "measurement:reading_ruler", {}, None),   # rule 19: customary units first taught W33, step is W32 | K: customary units (inches) on a metric / time unit
    ("Y5.B14.S3", "related", "measurement:length_customary", {}, None),   # rule 19: customary units first taught W33, step is W32 | K: customary units (inches) on a metric / time unit
    ("Y5.B14.S4", "related", "measurement:unit_conversion_word", {}, None),   # size 500000 > 855 — A snake measured 5 km. How many cm is that?
    ("Y5.B15.S2", "pre", "area_perimeter:volume", {}, None),   # size 7560 > 100 — Ava has a rectangular storage box that is 21 ft long, 20 ft  | K: customary units (inches) on a metric / time unit | why claims "centimetres" (centimetres) but only 0 of 10
    ("G4|-|dividea1digitnumberby100", "related", "fraction_operations:frac_10_100", {}, None),   # rule 19: thousandths first taught W12, step is W00
]

for r in RELINK: relink(*r)
for r in DROP: droplink(*r)

# ---------- critic r7 per-entry rows (by hand, each read on generated items with `linkfit.mjs --try`) ----------
# Y5.B15.S2 Compare volume: its only related was re-optioned by the old fit onto a g / kg unit sort (forms 2) under a "read on a
# scale in mL" why. The cylinder (forms 0) is too big for this gap step (to 1,000 mL), so the related is the volume skill itself,
# small cuboids in cubic units (length = 3, width = 2, height = 3 → 18): what is compared in this step.
droplink('Y5.B15.S2', 'related', 'measurement:mass_volume_liquid', {'forms': [0]}, None)
_units()['Y5.B15.S2']['related'].append({'key': 'area_perimeter:volume', 'opts': {'forms': [0], 'band': 30},
    'why': "working out each cuboid's volume in cubic units (length × width × height), then comparing two volumes"})
# Y5.B14.S4 Metric and imperial units: the old fit moved the related from the container sort (forms 1, too big: 3 L = 3,000 mL
# in its mix) to convert (forms 0) and left "sort containers" in the why. Convert is kept, the why says what it deals.
relink('Y5.B14.S4', 'related', 'measurement:capacity', {'units': [0], 'forms': [1]}, None, {'units': [0], 'forms': [0]}, None,
    'customary capacity conversions one a cell (4 pints = 2 quarts, 6 cups = 3 pints)')
# lesson 2 Multiply / divide multiples of 10: the related claimed "45 hundreds = 4,500" on standard unit form; rename:'more'
# deals exactly the renaming (454 = 45 tens 4 ones; 3 hundreds 14 tens = 440), at the lesson's 3-digit band
L2 = 'G4|-|multiplyanddividemultiplesof10usingbasicfactseg90x5030030'
relink(L2, 'related', 'placevalue:unit_form', {'band': 9999}, None, {'band': 999, 'rename': 'more'}, None,
    'renaming in unit form (454 = 45 tens 4 ones; 3 hundreds 14 tens = 440): the step inside 9 tens times 5 tens = 45 hundreds = 4,500')
# lesson 1 Place value: 10 times and one tenth: the same renaming at 4 digits (7,576 = 757 tens 6 ones)
L1 = 'G4|-|placevalue10timesandonetenthofadigitsvalue'
relink(L1, 'related', 'placevalue:unit_form', {'band': 9999}, None, {'band': 9999, 'rename': 'more'}, None,
    'renaming a number in a smaller unit (7,576 = 757 tens 6 ones; 4 thousands 16 hundreds = 5,600): each place is ten of the place to its right')
# Y5.B14.S5 Convert units of time: "conversion" is a form claim now and the facts items convert nothing; the why says what they are
relink('Y5.B14.S5', 'pre', 'multiplication:mult_facts', {'constant': [6, 7]}, None, {'constant': [6, 7]}, None,
    '× 6 and × 7 facts (6 × 10 = 60, 7 × 3 = 21): the multiplying inside a time change, where the bigger unit holds 60 or 7 of the smaller one')
# Y5.B10.S9: hotspot_quads is a click-all of the quadrilaterals, not a sort
relink('Y5.B10.S9', 'related', 'shapes_classify:hotspot_quads', {}, None, {}, None,
    'click every quadrilateral among other shapes: the family named before regular and irregular are told apart')
# Duplicates (critic r4 class E): the old build removed the second of two equal links silently after the fit had made them equal.
# Now the spec drops them: B3.S1's unoptioned mult_facts would become {constant:[2,4,8]}, the same as its explicit one; B12.S12's
# unoptioned missing_mult_div would become {range:100}, the same as its explicit one; B3.S1 lists count_by_tables {constant:[3]}
# twice and B4.S11 add_mixed_like twice in the spec (the first, with the step cite, is kept)
droplink('Y5.B3.S1', 'pre', 'multiplication:mult_facts', {}, None)
droplink('Y5.B12.S12', 'pre', 'division:missing_mult_div', {}, None)
def droplast(uid, role, key, opts, mn):
    hit = [e for e in _units()[uid][role] if e['key'] == key and (e.get('opts') or {}) == opts and (e.get('maxNumber') or None) == mn]
    if len(hit) < 2: errs.append(f'spec_zz_r7 droplast: {uid} {role} has no duplicate {key}'); return
    _units()[uid][role].remove(hit[-1])
droplast('Y5.B3.S1', 'pre', 'multiplication:count_by_tables', {'constant': [3]}, None)
droplast('Y5.B4.S11', 'related', 'fraction_operations:add_mixed_like', {}, None)
# Y5.B6.S2 / S3 / S5 / S7 (critic r7 minor): frac_mult_word {denoms:[5]} deals 52 of 100 'each serving 2/5 L, 3 servings'
# stories (fraction × whole, this block) and 48 of 100 'how many 1/5 m pieces in 3 m' stories (whole ÷ unit fraction, Grade 5
# 5.NF.B.7c). The skill has no option that keeps only the × stories (its one option is the denominator family), so the why
# names both (the RELINK rows above for S2 / S3 / S5; S7's spec opts already fit, so its why is set here)
relink('Y5.B6.S7', 'related', 'fraction_operations:frac_mult_word', {'denoms': [5]}, None, {'denoms': [5]}, None,
    [r for r in RELINK if r[0] == 'Y5.B6.S2' and r[2] == 'fraction_operations:frac_mult_word'][0][7])
# Y5.B5.S5 (critic r7 minor, rule 3): make_ten (bonds to 10) was an unfiltered week-list entry for 4-digit × 2-digit
droplink('Y5.B5.S5', 'pre', 'composing:make_ten', {}, None)
# composing:whole_as_fraction deals 54 of 100 '1 as a fraction with denominator 3' and 46 of 100 '9 as a fraction with
# denominator 1' (critic r7 minor on B4.S4; the same why on B4.S14 / S16 said only 1 = n/n)
relink('Y5.B4.S4', 'pre', 'composing:whole_as_fraction', {}, None, {}, None,
    'Y4.B7.S1 Understand the whole (prior learning wk W16; 1 = 3/3 and 9 = 9/1: a whole number written as a fraction)')
relink('Y5.B4.S14', 'pre', 'composing:whole_as_fraction', {}, None, {}, None,
    'a whole number written as a fraction (1 = 3/3, 9 = 9/1): the whole renamed, the first move when a fraction is taken from a whole (CCSS 3.NF.A.3c)')
relink('Y5.B4.S16', 'pre', 'composing:whole_as_fraction', {}, None, {}, None,
    'a whole number written as a fraction: 1 = n/n and 9 = 9/1 (CCSS 3.NF.A.3c)')
# Y5.B10.S10 3-D shapes (critic r7 M'): the M gate now reads every option (net_identify's shapes "Pyramids and triangular
# prisms") and excuses a skill only when its key is named; the name_3d_shapes clause names the net skill that has them
for e in ST['Y5.B10.S10']['partial']:
    if e['key'] == 'shapes_early:name_3d_shapes':
        e['missing'] = 'names basic solids; no triangular/pentagonal prisms or square-based vs triangular-based pyramids (shapes_classify:net_identify has them, as nets to fold, not as solids to name)'
# Self-check (fresh seeds 80923 / 41077) on the entries touched this round:
# lesson 3's skip_count_line keeps its spec opts but its why gets the same "2s, 5s and 10s" note as lessons 4 and 5
relink('G4|-|extendgrowingshapepatterns', 'pre', 'patterns:skip_count_line', {'step': [0], 'band': 50}, None, {'step': [0], 'band': 50}, None,
    'Y1.B9.S1 Count in 2s (lower grade, same idea; this option skip counts in 2s, 5s and 10s)')
# Y5.B14.S3's related capacity {units:[1]} mixed container clicks into "the same 1,000-to-1 conversion": the convert form, as B14.S1
relink('Y5.B14.S3', 'related', 'measurement:capacity', {'units': [1]}, None, {'units': [1], 'forms': [0]}, None,
    'the same 1,000-to-1 conversion for litres and millilitres (2,000 mL = 2 L, 250 mL = 0.25 L)')
