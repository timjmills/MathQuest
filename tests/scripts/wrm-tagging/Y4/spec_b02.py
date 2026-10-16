# ───────────────────────── Block 2: Addition and subtraction ─────────────────────────
S(id='Y4.B2.S1',
  partial=[('addition:add_sub_100s', 'adding/subtracting 1s, 10s and 1,000s, and any of them to a 4-digit number (3,452 + 300); it deals only 100s to about 1,000'),
           ('placevalue:more_less_100{"step":1000}', 'only 1 more/less of each unit, not adding several (3,452 + 3,000)')],
  verdict='partial', missing='adding and subtracting multiples of 1, 10, 100 and 1,000 to and from 4-digit numbers, including crossing a boundary',
  build=['add_sub_place_units', 'add_sub_patterns'],
  pre=[('addition:add_sub_100s{"band":500}', 'Y3.B2.S4', 'P'), ('addition:add_sub_10s', 'Y3.B2.S3', 'P'), ('addition:add_facts', 'Y3.B2.S1', 'P'),
       ('placevalue:value', 'Y3.B1.S8', 'P'), ('composing:number_bonds', 'Y1.B2.S7', 'P'), ('placevalue:more_less_100{"step":0}', 'Y3.B1.S9', 'L')],
  related=[('addition:add_10k_no_regroup', 'the next step: column addition'),
           ('placevalue:unit_form{"band":9999}', 'thinking of 300 as 3 hundreds'),
           ('patterns:count_by_powers_of_10', 'counting on in 10s, 100s, 1,000s')])

S(id='Y4.B2.S2',
  direct=['addition:add_10k_no_regroup'],
  verdict='full',
  pre=[('addition:add_1k_no_regroup', 'Y3.B2.S11', 'P'), ('addition:add_100_no_regroup', 'Y2.B2.S15', 'P'),
       ('placevalue:value', 'Y3.B1.S8', 'P'), ('placevalue:expand{"band":9999}', 'Y4.B1.S6', 'L')],
  preBuild=['add_sub_place_units'],
  related=[('subtraction:sub_10k_no_regroup', 'the inverse, same layout'), ('addition:add_column_multi', 'adding more than two numbers in columns'),
           ('addition:add_wp_10k_plain', 'the same sums in word problems'), ('addition:add_missing_digit', 'reasoning about digits in the column')])

S(id='Y4.B2.S3',
  partial=[('addition:add_10k_regroup', 'items cannot be held to exactly ONE exchange; the skill deals any number of exchanges')],
  verdict='partial', missing='a page where every item has exactly one exchange (in any one column)',
  build=['exchange_count_add'],
  pre=[('addition:add_10k_no_regroup', 'Y4.B2.S2', 'B'), ('addition:add_1k_regroup', 'Y3.B2.S13', 'P'), ('addition:add_100_regroup', 'Y2.B2.S16', 'P'),
       ('composing:base10_regroup', 'trading 1 ten for 10 ones with base-10 blocks (Grade 1-2 regrouping, the model of an exchange)', 'X'), ('composing:make_ten', 'Y1.B2.S7', 'P')],
  related=[('subtraction:sub_10k_regroup', 'the inverse with exchange'), ('addition:add_wp_10k_plain', 'word problems with 4-digit sums'),
           ('number_sense:estimate_sums_diffs{"place":1000}', 'estimate before adding')])

S(id='Y4.B2.S4',
  partial=[('addition:add_10k_regroup', 'items cannot be held to MORE THAN ONE exchange; many items have only one')],
  verdict='partial', missing='a page where every item has two or more exchanges (including a chain such as 2,999 + 1)',
  build=['exchange_count_add'],
  pre=[('addition:add_10k_regroup{"band":1000}', 'Y3.B2.S14', 'P'), ('addition:add_1k_regroup', 'Y3.B2.S14', 'P'), ('addition:add_100_regroup', 'Y2.B2.S16', 'P'),
       ('composing:base10_regroup', 'trading 1 ten for 10 ones with base-10 blocks (Grade 1-2 regrouping, the model of an exchange)', 'X')],
  related=[('addition:add_column_multi', 'three or four numbers, more exchanges'), ('addition:add_missing_digit', 'reasoning about carried digits'),
           ('addition:add_wp_10k', 'word problems')],
  note='Existing tag lists add_10k_regroup as full for S3 and S4; it is partial for both until the exchange-count option exists.')

S(id='Y4.B2.S5',
  direct=['subtraction:sub_10k_no_regroup'],
  verdict='full',
  pre=[('subtraction:sub_1k_no_regroup', 'Y3.B2.S12', 'P'), ('subtraction:sub_100_no_regroup', 'Y2.B2.S17', 'P'),
       ('addition:add_10k_no_regroup', 'Y4.B2.S2', 'L'), ('subtraction:sub_10_mixed', 'Y1.B2.S15', 'P')],
  related=[('subtraction:sub_check_by_adding', 'check by adding'), ('subtraction:sub_wp_10k_plain', 'word problems'),
           ('subtraction:sub_missing_digit', 'digits in the column')])

S(id='Y4.B2.S6',
  partial=[('subtraction:sub_10k_regroup', 'items cannot be held to exactly ONE exchange')],
  verdict='partial', missing='a page where every item has exactly one exchange',
  build=['exchange_count_sub'],
  pre=[('subtraction:sub_10k_no_regroup', 'Y4.B2.S5', 'B'), ('subtraction:sub_1k_regroup', 'Y3.B2.S15', 'P'), ('subtraction:sub_100_regroup', 'Y2.B2.S18', 'P'),
       ('composing:base10_regroup', 'trading 1 ten for 10 ones with base-10 blocks (Grade 1-2 regrouping, the model of an exchange)', 'X')],
  related=[('addition:add_10k_regroup', 'the inverse with exchange'), ('subtraction:sub_check_by_adding', 'check by adding'),
           ('subtraction:sub_wp_10k_plain', 'word problems')])

S(id='Y4.B2.S7',
  direct=['subtraction:sub_across_zeros{"band":10000}'],
  partial=[('subtraction:sub_10k_regroup', 'items cannot be held to MORE THAN ONE exchange')],
  verdict='partial', missing='two or more exchanges in numbers without zeros (5,342 − 2,868)',
  build=['exchange_count_sub'],
  pre=[('subtraction:sub_10k_regroup{"band":1000}', 'Y3.B2.S16', 'P'), ('subtraction:sub_1k_regroup', 'Y3.B2.S16', 'P'), ('subtraction:nl_sub', 'Y1.B2.S16', 'P'),
       ('addition:add_sub_fact_family', 'Y2.B2.S2', 'P'), ('composing:base10_regroup', 'trading 1 ten for 10 ones with base-10 blocks (Grade 1-2 regrouping, the model of an exchange)', 'X')],
  related=[('subtraction:sub_check_by_adding', 'the checking step'), ('subtraction:sub_missing_digit', 'digits in the column'),
           ('number_sense:compensation', 'a mental alternative (Y4.B2.S8)')])

S(id='Y4.B2.S8',
  partial=[('number_sense:compensation', 'only 2-digit numbers; no counting on, constant difference or "choose the method" with 4-digit numbers (7,000 − 2,999)')],
  verdict='partial', missing='choosing an efficient method for 4-digit subtraction: counting on, constant difference, compensating, column',
  build=['mental_add_sub', 'vis_strategy_pictures'],
  pre=[('subtraction:sub_across_zeros{"band":10000}', 'Y4.B2.S7', 'B'), ('number_sense:compensation{"band":50}', 'Y3.B2.S10', 'P'),
       ('subtraction:number_line_sub', 'Y1.B2.S16', 'P'), ('patterns:seq_10', 'Y1.B9.S2', 'P'), ('addition:number_families_add', 'Y2.B2.S2', 'P')],
  related=[('subtraction:sub_10k_regroup', 'the column method it is compared with'), ('number_sense:make_a_ten', 'bridging as a mental method'),
           ('subtraction:sub_check_by_adding', 'counting on is the inverse')])

S(id='Y4.B2.S9',
  direct=['number_sense:estimate_sums_diffs{"place":1000,"task":"reasonable"}', 'number_sense:estimate_sums_diffs{"place":100}'],
  verdict='full',
  pre=[('number_sense:nearest_1000', 'Y4.B1.S16', 'L'), ('number_sense:nearest_100', 'Y4.B1.S15', 'L'), ('number_sense:estimate_sum', 'Y3.B2.S20', 'P'),
       ('number_sense:place_on_number_line{"span":100,"band":1000}', 'Y3.B1.S11', 'P')],
  related=[('number_sense:estimate_diff', 'differences only'),
           ('number_sense:rounding_table', 'which place to round to'), ('subtraction:sub_check_by_adding', 'the next step: checking')],
  note='Existing partial tag becomes full with place 1,000 and task "Is the answer reasonable?".')

S(id='Y4.B2.S10',
  partial=[('subtraction:sub_check_by_adding', '2-digit items only; no checking an addition by subtracting, no 4-digit numbers, no checking by estimating')],
  verdict='partial', missing='using the inverse to check 4-digit additions and subtractions both ways, and estimating to check',
  build=['inverse_check'],
  pre=[('number_sense:estimate_sums_diffs{"place":1000,"task":"reasonable"}', 'Y4.B2.S9', 'B'), ('subtraction:missing_add_sub', 'Y2.B2.S21', 'L'),
       ('addition:add_sub_fact_family', 'Y2.B2.S2', 'P'), ('addition:add_10k_regroup', 'Y4.B2.S4', 'L'), ('subtraction:sub_10k_regroup', 'Y4.B2.S7', 'L')],
  related=[('division:div_check_by_multiplying', 'the same inverse check for division'), ('addition:number_families_add', 'the four related facts'),
           ('algebra:tape_diagram', 'the bar model that shows why the inverse works')])

NEW_PROPOSALS['add_sub_place_units'] = dict(kind='option', skill='addition:add_sub_100s', option='task "1s, 10s, 100s or 1,000s to a 4-digit number" and band 9,999',
    name='Add and Subtract 1s, 10s, 100s and 1,000s (option)', teaches='adding and subtracting a multiple of one place value to a 4-digit number (3,452 + 300, 6,105 − 4,000) with and without crossing a boundary',
    representation='equation cell (3,452 + 300 = □) with an optional place-value chart above it, the changing column outlined in black; one answer box',
    family='addition', ccss=['3.NBT.A.2', '4.NBT.B.4'], why='add_sub_100s deals only 100s to about 1,000; the WRM step opens the 4-digit block')
NEW_PROPOSALS['exchange_count_add'] = dict(kind='option', skill='addition:add_10k_regroup', option='exchanges: exactly one / two or more',
    name='How Many Exchanges? Addition (option)', teaches='column addition held to exactly one exchange, or to two or more exchanges, so the WRM one-exchange and more-than-one-exchange steps are separate pages',
    representation='the existing stack cell with regroup boxes (structural, every level); only the dealing changes',
    family='addition', ccss=['3.NBT.A.2', '4.NBT.B.4'], why='WRM splits one exchange from several (P-1: one new thing per step); the skill mixes them')
NEW_PROPOSALS['exchange_count_sub'] = dict(kind='option', skill='subtraction:sub_10k_regroup', option='exchanges: exactly one / two or more',
    name='How Many Exchanges? Subtraction (option)', teaches='column subtraction held to exactly one exchange, or to two or more exchanges (not only across zeros)',
    representation='the existing stack cell with exchange boxes; only the dealing changes',
    family='subtraction', ccss=['3.NBT.A.2', '4.NBT.B.4'], why='WRM splits one exchange from several; the skill mixes them')

TAGFIXES += [
    dict(key='addition:add_10k_regroup', step='Y4.B2.S3', action='partial', why='cannot hold a page to exactly one exchange'),
    dict(key='addition:add_10k_regroup', step='Y4.B2.S4', action='partial', why='cannot hold a page to more than one exchange'),
    dict(key='subtraction:sub_10k_regroup', step='Y4.B2.S6', action='partial', why='cannot hold a page to exactly one exchange'),
    dict(key='subtraction:sub_10k_regroup', step='Y4.B2.S7', action='partial', why='cannot hold a page to more than one exchange'),
    dict(key='number_sense:compensation', step='Y4.B2.S8', action='partial', why='2-digit only; the step is 4-digit efficient subtraction'),
    dict(key='number_sense:estimate_sums_diffs', step='Y4.B2.S9', action='add', why='re-tag as FULL with place 1,000 and task reasonable'),
    dict(key='subtraction:sub_check_by_adding', step='Y4.B2.S10', action='partial', why='2-digit subtraction only; the step checks 4-digit sums and differences both ways'),
    dict(key='addition:add_sub_100s', step='Y4.B2.S1', action='partial', why='kept partial; missing clause now names 1s, 10s, 1,000s on 4-digit numbers'),
]

# ───────────────────────── Block 3: Area ─────────────────────────
S(id='Y4.B3.S1',
  direct=['area_perimeter:area_unit_squares{"forms":[0]}'],
  partial=[('shapes_early:compose_rect_from_squares', 'covers a shape with squares but never names "area" or compares surfaces')],
  verdict='partial', missing='area as the amount of surface covered: comparing two surfaces by covering, and why squares (not circles) tile',
  build=['area_compare'],
  pre=[('multiplication:arrays_groups', 'Y3.B3.S2', 'P'), ('area_perimeter:perimeter_intro', 'Y3.B5.S10', 'P'), ('area_perimeter:perimeter_grid', 'Y3.B5.S11', 'P'),
       ('comparing:compare_objects', 'R.B2.S1', 'P'), ('counting:count_objects', 'Y1.B4.S1', 'P'), ('patterns:seq_2', 'Y2.B1.S15', 'P')],
  related=[('multiplication:dot_array_mult', 'rows of squares as an array'), ('shapes_early:partition_shapes', 'cutting a shape into equal parts'),
           ('area_perimeter:area', 'area by multiplying, the Grade 3 build that follows')],
  note='area_unit_squares counts squares; the "what is area" comparing idea is in the area_compare proposal.')

S(id='Y4.B3.S2',
  partial=[('area_perimeter:area_unit_squares', 'whole squares in rectangles and L-shapes only; WRM counts half squares too')],
  verdict='partial', missing='counting squares where shapes include half squares (two halves make one)',
  build=['area_half_squares'],
  pre=[('shapes_early:compose_rect_from_squares', 'Y4.B3.S1', 'B'), ('multiplication:arrays_groups', 'Y3.B3.S2', 'P'), ('counting:count_objects', 'Y1.B4.S1', 'P'),
       ('patterns:seq_5', 'Y2.B1.S15', 'P'), ('shapes_early:partition_shapes', 'Y2.B8.S3', 'L')],
  related=[('area_perimeter:area', 'area by multiplying (3.MD.C.7)'), ('area_perimeter:perimeter_grid', 'counting edges on the same grid'),
           ('multiplication:dot_array_mult', 'count rows of squares')])

S(id='Y4.B3.S3',
  partial=[('shapes_early:compose_rect_from_squares', 'fills a given rectangle; does not ask for different shapes with the same area')],
  verdict='partial', missing='making several different rectilinear shapes with a given number of squares (area stays the same)',
  build=['area_compare'],
  pre=[('area_perimeter:area_unit_squares', 'Y4.B3.S2', 'B'), ('shapes_early:compose_shapes', 'R.B15.S5', 'P'),
       ('multiplication:arrays_groups', 'Y3.B3.S2', 'P'), ('placevalue:compare{"band":99}', 'Y1.B1.S13', 'L')],
  related=[('area_perimeter:perimeter_grid', 'same area, different perimeter'), ('area_perimeter:composite_shapes', 'L, T, U shapes'),
           ('number_theory:factor_tchart_easy', 'rectangles with the same area are factor pairs (Y4.B5.S1)')])

S(id='Y4.B3.S4',
  verdict='gap', missing='comparing and ordering the areas of shapes by counting squares (which is larger, by how much)',
  build=['area_compare'],
  pre=[('area_perimeter:area_unit_squares', 'Y4.B3.S2', 'B'), ('shapes_early:compose_rect_from_squares', 'Y4.B3.S3', 'B'),
       ('placevalue:compare{"band":99}', 'Y1.B1.S13', 'P'), ('comparing:compare_groups', 'R.B1.S7', 'P'), ('addition:comparison_word', 'Y1.B5.S8', 'L')],
  related=[('area_perimeter:area', 'computing area to compare'), ('area_perimeter:perimeter_grid', 'compare perimeters on the same shapes'),
           ('graphs:bar_graph{"forms":[2]}', '"how many more" comparison in another form')])

NEW_PROPOSALS['area_half_squares'] = dict(kind='option', skill='area_perimeter:area_unit_squares', option='form "with half squares"',
    name='Count Squares and Half Squares (option)', teaches='finding the area of shapes on a square grid where some squares are cut in half on the diagonal (two halves make one square)',
    representation='black-line square grid in the boxed cell; the shape outlined with the heavy line, half squares cut on the diagonal; answer slot "__ squares"; the single grey optional for the shape fill',
    family='area_perimeter', ccss=['3.MD.C.6', '3.MD.C.5'], why='WRM Count squares includes half squares; the skill deals whole squares only')

TAGFIXES += [
    dict(key='area_perimeter:area_unit_squares', step='Y4.B3.S2', action='partial', why='no half squares'),
    dict(key='area_perimeter:area_unit_squares', step='Y4.B3.S1', action='add', why='kept as direct (forms rectangles) but the step verdict is partial: comparing surfaces is missing'),
    dict(key='shapes_early:compose_rect_from_squares', step='Y4.B3.S1', action='add', why='covering a rectangle with unit squares is the "what is area" model (partial)'),
]
