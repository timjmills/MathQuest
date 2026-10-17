# Y1 (school Kindergarten) SITE LESSONS: every entry of data/curriculum/site-lessons.json with wrmYear "Y1" (39): the lessons the school
# site schedules or lists that are NOT White Rose small steps (owner rule 2026-10-16, "every site lesson tagged"):
#   4 committee lessons (Awsaj supplements and domain-test builds, all SUP in the pacing, school weeks W15, W21, W29, W29), and
#   35 Support titles (enrich-native, "Source: GPK": Reception lessons of the older WRM Reception scheme, "From <phase> (Phase N)",
#   that match no WRM step title). A Support lesson is judged at its SOURCE year, Reception: its links are Reception-sized and
#   pictured, and its pre cite only Reception steps of a block BEFORE its source phase (phases.json); a lesson of the first two
#   phases has nothing taught before it and says so ("Pre-skills are few").
# Contract: the Y5 lane's (Y5-report.md "Site lessons"); lessons.py writes, checks and gates it, lessonfit.mjs judges every link
# from generated items. Every direct / partial verdict below was judged from 40 generated items with the opts listed (fresh
# seeds, lessonfit.mjs, and the report's audit table). Lessons tag NOTHING into SKILL_WRM.
# Shape: lesson(id, direct=[(key, opts)], partial=[(key, opts, missing)], verdict, missing, build=[ids], closes={id: clause},
#   pre=[(key, opts, cited step or lesson, reason)], preBuild, related=[(key, opts, why)], note). '@max' in opts is the link's
#   Max Number (written as maxNumber).

K_ = 'K|-|'
FEW_P12 = ('Pre-skills are few: the lesson\'s source phase ({ph}) opens Reception, so no Reception step is taught before it and '
           'there is no lower grade; its building blocks are the pupil\'s own talk and play.')

# ── proposals reused verbatim from the R lane's links file (same id = same spec); R/Y1 proposals first, then the live lists ──
LANE.update({'band_3': 'R', 'more_less_pictures': 'R', 'compare_shapes': 'R', 'compare_size': 'R', 'doubles_pictured': 'R',
             'odd_even_pairs': 'R', 'shape_fit_turn': 'R', 'decompose_shapes': 'R', 'defining_attributes': 'R'})

# ── new proposals (only what no existing proposal does) ──
LNEW['k_vertical_5'] = {
    'kind': 'option', 'skill': 'addition:add_10_no_regroup', 'also': ['subtraction:sub_10_no_regroup'],
    'option': 'band "within 5" (sums and minuends to 5) with the stacked layout and no carrying / borrowing row, and a mix value that puts + and − on one page, the sign printed large beside the top number',
    'name': 'Add and Subtract Within 5, Written Vertically (option)',
    'teaches': 'reading and solving an addition or a subtraction within 5 written in a column (3 above + 2, with a rule under it), the same facts the pupil already knows across, with counters beside the column as a hint that fades',
    'representation': 'the existing stack cell: two one-digit numbers in a column, a large + or − sign, the rule and one answer box; five counters or a five frame beside it as a fading hint; no carrying row',
    'family': 'addition', 'ccss': ['K.OA.A.5'],
    'why': 'add_10_no_regroup / sub_10_no_regroup {notation:[stacked]} deal column facts within 10 (2 + 6, 9 − 3) with a "Use top row for carrying" row, one operation per skill; no live skill deals the within-5 column facts with + and − mixed'}
LNEW['classify_count_all'] = {
    'kind': 'option', 'skill': 'comparing:classify_count',
    'option': 'form "count every group": the pupil sorts all the pictured objects into 2 or 3 labelled groups, writes how many are in each group and the total, and says which group has the most',
    'name': 'Sort, Count Each Group and Find the Total (option)',
    'teaches': 'sorting a small set of pictured objects (to 10) into categories, counting each category, writing the count under each group, adding the counts to find how many objects there are in all, and ordering the groups by their counts',
    'representation': 'the existing classify-count cell: the bag of pictures above, 2 or 3 sorting boxes each labelled with a picture and an answer box under it, then "Total" with one answer box',
    'family': 'comparing', 'ccss': ['K.MD.B.3', 'K.CC.B.5'],
    'why': 'classify_count asks for the count of ONE kind in a mixed bag ("Count only the apples"); no skill counts every category or asks for the total of the sorted groups'}
LNEW['cuboid_find'] = {
    'kind': 'option', 'skill': 'shapes_early:name_3d_shapes',
    'option': 'forms 1 ("click every shape of one kind") also asks for the rectangular prism, labelled "cuboid (rectangular prism)", as often as the other four solids',
    'name': 'Find the Cuboid Too (option)',
    'teaches': 'finding every cuboid (rectangular prism, a box shape) among other solids, as the pupil already finds every cube, sphere, cone and cylinder',
    'representation': 'the existing click-every cell: four drawn solids, the pupil ticks every box shape; the name printed under the instruction',
    'family': 'shapes_early', 'ccss': ['K.G.A.2'],
    'why': 'name_3d_shapes {forms:[1]} draws the rectangular prism only as a distractor: in 40 items it asks for spheres, cubes, cones and cylinders, never the cuboid'}
LNEW['shape_build_kit'] = {
    'kind': 'option', 'skill': 'shapes_early:shape_attributes',
    'option': 'form "build it": a pictured shape with its sides as sticks and its corners as clay balls, the pupil writes how many sticks and how many balls build it; then the matching dot-grid cell to draw it (shape_draw)',
    'name': 'Build a Shape from Sticks and Balls (option)',
    'teaches': 'modelling a triangle, square or rectangle from components: counting the sticks (sides) and clay balls (corners) it needs, then building it and drawing it on dots',
    'representation': 'one boxed cell: a shape drawn as sticks with a ball at each corner, two answer boxes with a stick and a ball printed beside them; the drawing lives in the shape_draw cell',
    'family': 'shapes_early', 'ccss': ['K.G.B.5'],
    'why': 'shape_attributes counts the sides and the vertices of a drawn shape; nothing asks the pupil to build a shape from parts (K.G.B.5 "sticks and clay balls")'}

# ───────────────────────── committee lessons (Awsaj supplements and domain-test builds, Kindergarten) ─────────────────────────
lesson(K_ + 'addandsubtractwithin5writtenverticallycolumnform',
    partial=[('addition:add_10_no_regroup', {'notation': ['stacked']}, 'one-digit addition written in a column (2 + 6 = 8), with sums to 10, past 5, and a "Use top row for carrying" line; never a subtraction'),
             ('subtraction:sub_10_no_regroup', {'notation': ['stacked']}, 'one-digit subtraction written in a column (9 − 3 = 6), from numbers to 10, past 5, and a "Use top row for borrowing" line; never an addition')],
    verdict='partial',
    missing='addition and subtraction within 5 written vertically, on one page (3 above + 2; 5 above − 4), with no carrying or borrowing row',
    build=['k_vertical_5'],
    pre=[('addition:add_5_pictures', {}, 'Y1.B2.S8', 'adding two pictured groups within 5 (1 + 3 = 4)'),
         ('subtraction:sub_5_pictures', {}, 'Y1.B2.S14', 'taking away from 5 with pictures (5 take away 2 leaves 3)'),
         ('composing:number_bonds', {'band': 5}, 'Y1.B2.S5', 'the parts and the whole of every number to 5: the same facts, in a part-whole model')],
    related=[('composing:make_ten', {'band': 5}, 'how many more make 5: the missing part of a fact within 5')],
    note='Domain-test build lesson (site: "New CCSS BUILD lesson so the domain test only asks what has been taught"), W15-W16, K.OA.A.5. '
         'The site puts it after "Addition - add together" (W14) and "Subtraction - take away" (W14-W15). No live skill writes facts within 5 in a column: '
         'the stacked skills start at 10 and carry a regrouping row a Kindergarten page should not show.')

lesson(K_ + 'sortintocategoriescounteachgroupandfindthetotal',
    partial=[('comparing:classify_count', {'band': 10, 'objects': 'pictures'}, 'counts ONE kind of object in a mixed bag of pictures to 10 ("Count only the apples"); never sorts every object, never counts each group or finds the total')],
    verdict='partial',
    missing='sorting all the objects into categories, counting each group, finding the total and sorting the groups by their counts',
    build=['sort_groups', 'classify_count_all'],
    closes={'sort_groups': 'sorting every object into labelled categories (by kind, colour, size or shape)',
            'classify_count_all': 'counting each group, finding the total of the groups and ordering the groups by their counts (K.MD.B.3)'},
    pre=[('counting:count_objects', {'band': 10}, 'Y1.B1.S2', 'counting a group of objects to 10 and saying how many'),
         ('comparing:compare_groups', {'band': 10, 'dir': 'mixed'}, 'Y1.B1.S11', 'which of two groups has more, fewer or the same: the groups are ordered by count'),
         ('addition:add_5_pictures', {}, 'Y1.B2.S8', 'adding two pictured groups to find how many in all: the total of two groups')],
    related=[('measurement:pictograph_intro', {'forms': [0]}, 'the counted groups shown as rows of a picture graph: how many in each row')],
    note='Domain-test build lesson, W21, K.MD.B.3 and K.CC.B.5. Y1.B1.S1 "Sort objects" (W23, partial classify_count, build sort_groups) comes two weeks LATER in the '
         'school order, so it is not a pre; R.B1.S4-S6 sort with the same classify_count key the lesson lists as its own.')

lesson(K_ + 'buildanddrawshapes',
    partial=[('shapes_early:shape_attributes', {'forms': [0], 'band': 4}, 'counts the sides or the vertices of a drawn triangle, square or rectangle (a rectangle has 4 sides); never builds a shape from sticks and clay balls and never draws one')],
    verdict='partial',
    missing='building shapes from components (sticks and clay balls) and drawing shapes (K.G.B.5)',
    build=['shape_draw', 'shape_build_kit'],
    closes={'shape_draw': 'drawing triangles, squares, rectangles and circles (on a dot grid)',
            'shape_build_kit': 'building a shape from components: sticks for the sides, clay balls for the corners'},
    pre=[('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [0, 1]}, 'R.B4.S1', 'finding every circle and every triangle among other shapes'),
         ('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [2]}, 'R.B6.S1', 'finding every square and every rectangle'),
         ('shapes_early:compose_shapes', {'shapes': [0, 1]}, 'R.B15.S5', 'two shapes put together make a new shape')],
    related=[],
    note='Awsaj supplement lesson, W29-W30, K.G.B.5, block Y1.B3 (Shape). The Y1.B3 shape steps have no school week in the xlsx, so they are not cited; '
         'Reception taught the shapes it builds. shape_draw (WRM_PROPOSALS) is the drawing half. No related: the side-counting skills name quadrilaterals and vertices, above Kindergarten.')

lesson(K_ + 'composeshapesfromsmallershapes',
    direct=[('shapes_early:compose_shapes', {}), ('shapes_early:compose_hexagon', {})],
    verdict='full',
    pre=[('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [2]}, 'R.B6.S1', 'naming the square and the rectangle two triangles make'),
         ('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [0, 1]}, 'R.B4.S1', 'naming the triangles that are joined')],
    related=[],
    note='Awsaj supplement lesson, W29-W30, K.G.B.6 ("compose simple shapes to form larger shapes"): compose_shapes joins two shapes and asks which '
         'shape they make (two triangles make a square, a rectangle or a larger triangle), compose_hexagon fills a hexagon with pattern blocks. '
         'Pre-skills are few: the composing steps R.B6.S2 and R.B15.S5 use the lesson\'s own two keys (compose_shapes, compose_hexagon), so they are not '
         'listed again; the Y1.B3 shape steps have no school week. No related: decompose_shapes (the inverse) is not built, and '
         'compose_rect_from_squares writes its rectangles as "2 × 3".')

# ───────────────────────── Support lessons (Reception, "Source: GPK") ─────────────────────────
lesson(K_ + '3dshapescubecuboidsphereconecylinder',
    partial=[('shapes_early:name_3d_shapes', {'forms': [1]}, 'clicks every sphere, cube, cone or cylinder among other solids; the rectangular prism (cuboid) is only ever a distractor, never the solid asked for')],
    verdict='partial',
    missing='finding and naming the cuboid (rectangular prism) as well as the cube, sphere, cone and cylinder',
    build=['cuboid_find'],
    pre=[('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [0, 1]}, 'R.B4.S1', 'circles and triangles: shapes the pupil later sees on the faces of solids'),
         ('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [2]}, 'R.B6.S1', 'squares and rectangles: the shapes of the faces of boxes'),
         ('comparing:classify_count', {'band': 3, 'tiles': 2, 'objects': 'pictures'}, 'R.B1.S4', 'picking out every object of one kind among others')],
    related=[],
    note='Support lesson from "Building 9 and 10" (Phase 7) = R.B12.S1 "Recognise and name 3-D shapes" under another title. name_3d_shapes {forms:[1]} '
         'asks the pupil to click every sphere, cylinder, cube or cone; the rectangular prism (the US name of the cuboid) is drawn but never asked for. No related: the other 3-D skills '
         'ask for vertices or match written names, above Reception.')

lesson(K_ + '67and8countingandsubitising',
    partial=[('counting:count_objects', {'band': 10, 'objects': 'frame'}, 'counts counters in ten frames from 1 to 10, not only 6, 7 and 8'),
             ('counting:count_objects', {'band': 10, 'objects': 'dice'}, 'counts dice dots from 1 to 10 one by one; never asks the pupil to see 6, 7 or 8 as two small groups without counting')],
    verdict='partial',
    missing='a page on 6, 7 and 8 only, and subitising them (seeing 6 as 3 and 3, 7 as 5 and 2) instead of counting',
    build=['number_focus', 'subitise'],
    closes={'number_focus': 'counting groups of 6, 7 and 8 only (the band deals 1 to 10)',
            'subitise': 'conceptual subitising of 6, 7 and 8 (two small groups seen, not counted)'},
    pre=[('composing:ten_frame_build', {'band': 5}, 'R.B5.S3', 'building 4 and 5 on a ten frame: a full row of 5 is the start of 6, 7, 8'),
         ('composing:number_bonds', {'band': 5}, 'R.B5.S6', 'a number to 5 made of two parts'),
         ('comparing:compare_groups', {'band': 5, 'level': [1]}, 'R.B1.S7', 'comparing two pictured groups: more, fewer or the same')],
    related=[('counting:count_sequence', {'band': 10, 'dir': 'forward'}, 'the number after 5, 6 and 7 on a track: one more each time')],
    note='Support lesson from "Growing 6, 7, 8" (Phase 6) = R.B9.S1 "Find 6, 7 and 8" with R.B9.S10 "Conceptual subitising".')

lesson(K_ + '9and10countrepresentorder',
    partial=[('counting:count_objects', {'band': 10, 'objects': 'frame'}, 'counts counters in ten frames from 1 to 10, not only 9 and 10'),
             ('composing:ten_frame_build', {'band': 10}, 'builds any number from 1 to 10 on a ten frame (represent), not only 9 and 10')],
    verdict='partial',
    missing='a page on 9 and 10 only, and ordering 9 and 10 with the numbers before them (7, 8, 9, 10)',
    build=['number_focus', 'compare_small'],
    closes={'number_focus': 'counting and representing 9 and 10 only (the skills deal 1 to 10)',
            'compare_small': 'ordering numbers and groups to 10 (put 9, 7, 10, 8 in order)'},
    pre=[('composing:number_bonds', {'band': 10}, 'R.B9.S5', 'two parts make a whole (wholes to 10)'),
         ('counting:count_sequence', {'band': 10, 'dir': 'forward'}, 'R.B9.S3', 'the number after a number: one more'),
         ('comparing:compare_groups', {'band': 5, 'level': [1]}, 'R.B1.S7', 'which group has more or fewer: the start of ordering')],
    related=[('composing:make_ten', {'band': 10}, 'how many more make 10 (9 and 1 more)')],
    note='Support lesson from "Building 9 and 10" (Phase 7) = R.B11.S1 "Find 9 and 10" and R.B11.S3 "Represent 9 and 10", with ordering added.')

lesson(K_ + 'addingmorefirstthennowstories',
    partial=[('addition:add_5_pictures', {}, 'a pictured join within 5 written as a sum (1 + 3 = ?, "How many in all?"); never a first / then / now story and never a total past 5'),
             ('addition:add_wp_10', {'band': 10}, 'add-more stories to 10 told in words (I have 3 balls. I get 2 more balls.); no first / then / now pictures, the pupil reads the story')],
    verdict='partial',
    missing='pictured First / Then / Now add-more stories to 10: a first picture, then some more come, now how many',
    build=['add_10_pictures', 'vis_story_strip'],
    closes={'add_10_pictures': 'adding more with pictures to 10 (a group and the ones that join it)',
            'vis_story_strip': 'the three-panel First / Then / Now story strip the lesson is taught with'},
    pre=[('composing:number_bonds', {'band': 10}, 'R.B11.S7', 'two parts make a whole to 10: the "then" part joins the "first" part'),
         ('counting:count_sequence', {'band': 10, 'dir': 'forward'}, 'R.B11.S5', 'one more: adding 1 is the smallest "then"'),
         ('composing:make_ten', {'band': 10}, 'R.B11.S8', 'how many more make 10')],
    related=[('subtraction:sub_5_pictures', {}, 'the inverse: start with 5, take some away, how many are left')],
    note='Support lesson from "First Then Now" (Phase 9) = R.B14.S1 "Add more". vis_story_strip (VISUAL_BUILDS) is exactly the First / Then / Now strip.')

lesson(K_ + 'bondsto10explorecombinationsthatmake10',
    direct=[('composing:make_ten', {'band': 10})],
    verdict='full',
    pre=[('composing:number_bonds', {'band': 10}, 'R.B9.S5', 'a whole split into two parts'),
         ('composing:ten_frame_build', {'band': 10}, 'R.B9.S2', 'building a number on a ten frame: the empty boxes are the other part of 10'),
         ('addition:add_5_pictures', {}, 'R.B9.S9', 'combining two pictured groups and saying how many in all')],
    related=[('counting:count_objects', {'band': 10, 'objects': 'frame'}, 'counting the counters in ten frames up to a full frame of 10')],
    note='Support lesson from "Building 9 and 10" (Phase 7) = R.B11.S8 "Bonds to 10 (2 parts)" (full there with the same skill): make_ten shows a ten '
         'frame with some counters and asks how many more make 10, every pair from 1 + 9 to 9 + 1.')

lesson(K_ + 'buildingnumbersbeyond10',
    partial=[('composing:teen_compose', {'band': 19}, 'a teen number as 10 and some more ones (10 and 4 more is 14), 11 to 19; never 20'),
             ('composing:ten_frame_build_teen', {'band': 19}, 'builds 11 to 19 on two ten frames; never 20 as two full frames')],
    verdict='partial',
    missing='20 as two full tens (the numbers beyond 10 run to 20)',
    build=['teen_structure'],
    pre=[('composing:make_ten', {'band': 10}, 'R.B11.S8', 'how many more make 10: 10 is the first ten'),
         ('composing:ten_frame_build', {'band': 10}, 'R.B11.S3', 'building 9 and 10 on a ten frame'),
         ('counting:count_objects', {'band': 10, 'objects': 'frame'}, 'R.B11.S1', 'counting counters in ten frames to 10'),
         ('composing:number_bonds', {'band': 10}, 'R.B11.S7', 'a number to 10 made of two parts: 10 and 4 is the next step')],
    related=[('counting:number_seq_fill', {'step': 1, 'dir': 'forward', '@max': 20}, 'the teen numbers in order on a number track, counting on past 10')],
    note='Support lesson from "To 20 and Beyond" (Phase 8) = R.B13.S1 / S3 "Build numbers beyond 10".')

lesson(K_ + 'circlesandtrianglesproperties',
    partial=[('shapes_early:shape_attributes', {'forms': [0], 'band': 4}, 'counts the sides or the vertices of a triangle, a square or a rectangle (a triangle has 3 sides); never a circle, never a curved side, never compares a circle with a triangle')],
    verdict='partial',
    missing='the properties of circles and triangles compared: a circle has one curved side and no corners, a triangle has 3 straight sides and 3 corners',
    build=['compare_shapes'],
    pre=[('comparing:classify_count', {'band': 3, 'tiles': 2, 'objects': 'pictures'}, 'R.B1.S4', 'sorting objects to a type: looking at what makes things the same'),
         ('comparing:compare_groups', {'band': 5, 'level': [1]}, 'R.B1.S7', 'comparing: saying what is the same and what is different')],
    related=[('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [0, 1]}, 'finding every circle and every triangle among other shapes')],
    note='Support lesson from "It\'s Me 1, 2, 3" (Phase 3) = R.B4.S2 "Compare circles and triangles". shape_attributes also shows squares and rectangles '
         'and says "vertices", which Reception meets later. Pre-skills are few: before this phase Reception teaches only R.B1-R.B2 (match, sort, '
         'compare, patterns, measure talk); naming circles and triangles (R.B4.S1) is the same phase, so it is related.')

lesson(K_ + 'combining2groups',
    partial=[('addition:add_5_pictures', {}, 'combines two pictured groups with totals to 5 only (2 + 3 = 5)'),
             ('addition:add_wp_10', {'band': 7}, 'combine and add-more stories with totals to 7, told in words, no pictures to count')],
    verdict='partial',
    missing='combining two pictured groups with totals 6, 7 and 8 (Growing 6, 7, 8)',
    build=['add_10_pictures'],
    pre=[('composing:number_bonds', {'band': 5}, 'R.B5.S7', 'two parts make a whole to 5'),
         ('counting:count_sequence', {'band': 10, 'dir': 'forward'}, 'R.B5.S4', 'one more: adding one object to a group'),
         ('composing:ten_frame_build', {'band': 5}, 'R.B5.S3', 'building 4 and 5 on a frame: one group of counters')],
    related=[('subtraction:sub_5_pictures', {}, 'the inverse: take some away from a group and say how many are left')],
    note='Support lesson from "Growing 6, 7, 8" (Phase 6) = R.B9.S9 "Combine 2 groups" (partial there with the same skills and build).')

lesson(K_ + 'compareamountsmorefewersame',
    direct=[('comparing:compare_groups', {'band': 5, 'level': [1]})],
    verdict='full',
    pre=[],
    related=[('comparing:compare_objects', {'task': 'length'}, 'comparing two lines: which is longer, which is shorter'),
             ('measurement:heavier_lighter_visual', {}, 'comparing two objects: which is heavier, which is lighter')],
    note='Support lesson from "Just Like Me!" (Phase 2) = R.B1.S7 "Compare amounts" (full there with the same skill): two pictured groups to 5, '
         'which has more, which has fewer, are they the same. ' + FEW_P12.format(ph='Just Like Me!, Phase 2'))

for n_, p_ in (('1', 'Alive in 5!, Phase 5'), ('2', 'Alive in 5!, Phase 5')):
    lesson(K_ + 'comparecapacity' + n_,
        verdict='gap',
        missing='capacity: full, empty, nearly full, and which of two containers holds more or less',
        build=['capacity_early'],
        pre=[('comparing:compare_objects', {}, 'R.B2.S1', 'comparing two objects by one attribute: longer, taller, thicker'),
             ('measurement:heavier_lighter_visual', {}, 'R.B2.S2', 'comparing two objects by mass: heavier and lighter'),
             ('comparing:compare_groups', {'band': 5, 'level': [1]}, 'R.B1.S7', 'more, fewer, the same: the words a capacity comparison uses')],
        related=[],
        note=f'Support lesson from "{p_.split(",")[0]}" (Phase 5) = R.B8.S4 "Compare capacity" ({"the first" if n_ == "1" else "the second"} of the two capacity lessons; R.B2.S3 '
             'and R.B8.S3-S4 are gaps with the same build). No related: no live skill compares capacity, and the mass and size skills are its pre.')

for n_ in ('1', '2'):
    lesson(K_ + 'comparemass' + n_,
        direct=[('measurement:heavier_lighter_visual', {})],
        verdict='full',
        pre=[('comparing:compare_objects', {}, 'R.B2.S1', 'comparing two objects by one attribute: longer, taller, thicker'),
             ('comparing:compare_groups', {'band': 5, 'level': [1]}, 'R.B1.S7', 'comparing: more and fewer, the same comparison language')],
        related=[],
        note=f'Support lesson from "Alive in 5!" (Phase 5) = R.B8.S1 "Compare mass" ({"the first" if n_ == "1" else "the second"} of the two mass lessons; full there with the same skill): '
             'two or three pictured objects, which is heavier, which is lighter. Pre-skills are few: before this phase Reception compares mass only in R.B2.S2 '
             'with the lesson\'s own key; the other comparing steps are listed. No related: the balance (R.B8.S2) is not built yet (build balance), '
             'and comparing capacity has no live skill.')

lesson(K_ + 'comparesizemassandcapacityinformally',
    partial=[('measurement:heavier_lighter_visual', {}, 'compares mass only: which pictured object is heavier or lighter'),
             ('comparing:compare_objects', {}, 'compares the length, height or thickness of two drawn lines, towers or bars; never overall size (big, small) and never capacity')],
    verdict='partial',
    missing='comparing overall size (big, bigger, small) and capacity (full, empty, holds more)',
    build=['compare_size', 'capacity_early'],
    closes={'compare_size': 'comparing the overall size of two or three objects (big, bigger, small, smaller)',
            'capacity_early': 'comparing capacity informally: full, empty, which holds more'},
    pre=[],
    related=[('comparing:compare_groups', {'band': 5, 'level': [1]}, 'comparing amounts: which group has more, which has fewer')],
    note='Support lesson from "Just Like Me!" (Phase 2) = R.B2.S1 "Compare size", R.B2.S2 "Compare mass" and R.B2.S3 "Compare capacity" in one lesson. '
         + FEW_P12.format(ph='Just Like Me!, Phase 2'))

lesson(K_ + 'comparingnumbersto10',
    partial=[('comparing:compare_groups', {'band': 10, 'level': [1]}, 'compares two pictured groups to 10 (which has more, fewer, the same); the numbers are never written, so no numerals are compared')],
    verdict='partial',
    missing='comparing written numbers (numerals) to 10, beside their groups: 7 is more than 5',
    build=['compare_small'],
    pre=[('counting:count_objects', {'band': 10, 'objects': 'frame'}, 'R.B9.S1', 'counting a group of 6, 7 or 8 and saying the number'),
         ('counting:count_sequence', {'band': 10, 'dir': 'forward'}, 'R.B9.S3', 'the number after: one more is a bigger number'),
         ('composing:ten_frame_build', {'band': 10}, 'R.B9.S2', 'building a number on a ten frame so two numbers can be seen side by side')],
    related=[('counting:number_seq_fill', {'step': 1, 'dir': 'forward', '@max': 10}, 'the numbers to 10 in order on a number track: a later number is bigger')],
    note='Support lesson from "Building 9 and 10" (Phase 7) = R.B11.S2 "Compare numbers to 10" (partial there with the same skill and build).')

lesson(K_ + 'comparingnumbersto5',
    partial=[('comparing:compare_groups', {'band': 5, 'level': [1]}, 'compares two pictured groups to 5 (which has more, fewer, the same); the numbers are never written, so no numerals are compared')],
    verdict='partial',
    missing='comparing written numbers (numerals) to 5, beside their groups: 4 is more than 2',
    build=['compare_small'],
    pre=[('counting:count_objects', {'band': 5, 'objects': 'pictures'}, 'R.B5.S1', 'counting a group of 4 or 5 and saying the number'),
         ('counting:count_objects', {'band': 5, 'objects': 'dice'}, 'R.B5.S2', 'seeing how many dots: a number for each group'),
         ('composing:ten_frame_build', {'band': 5}, 'R.B5.S3', 'building a number to 5 on a frame so two numbers can be seen side by side')],
    related=[('comparing:compare_objects', {'task': 'height'}, 'comparing two towers: which is taller (the same more / less idea for size)')],
    note='Support lesson from "Alive in 5!" (Phase 5): Reception compares numbers to 5 before R.B11.S2 compares to 10; same build.')

lesson(K_ + 'compositionof123partsmakethewhole',
    partial=[('composing:number_bonds', {'band': 5}, 'parts and the whole for wholes 2 to 5 (2 + 3 = 5); never a whole of 1 and never a zero part')],
    verdict='partial',
    missing='the composition of 1, 2 and 3 only (3 is 2 and 1, 1 and 1 and 1), with pictured parts',
    build=['band_3'],
    pre=[('comparing:classify_count', {'band': 3, 'tiles': 2, 'objects': 'pictures'}, 'R.B1.S4', 'sorting a group into two kinds: the parts of a group'),
         ('comparing:compare_groups', {'band': 5, 'level': [1]}, 'R.B1.S7', 'comparing two small groups')],
    related=[('composing:ten_frame_build', {'band': 5}, 'building a small number on a frame (Represent 1, 2 and 3)')],
    note='Support lesson from "It\'s Me 1, 2, 3" (Phase 3) = R.B3.S6 "Composition of 1, 2 and 3" (partial there with the same skill and build). '
         'Pre-skills are few: before this phase Reception teaches only R.B1-R.B2 (match, sort, compare, patterns, measure talk); two of them are building blocks.')

lesson(K_ + 'compositionof4and5bonds',
    partial=[('composing:number_bonds', {'band': 5}, 'parts and the whole for wholes 2 to 5 (2 + 1 = 3); not only 4 and 5')],
    verdict='partial',
    missing='a page on the bonds of 4 and 5 only (4 = 3 + 1, 5 = 2 + 3), every pair in order',
    build=['number_focus'],
    pre=[('composing:ten_frame_build', {'band': 5}, 'R.B5.S3', 'building 4 and 5 on a frame'),
         ('counting:count_objects', {'band': 5, 'objects': 'pictures'}, 'R.B5.S1', 'finding groups of 4 and 5'),
         ('counting:count_objects', {'band': 5, 'objects': 'dice'}, 'R.B5.S2', 'seeing 4 and 5 as dot patterns (2 and 2, 3 and 2)')],
    related=[('composing:make_ten', {'band': 5}, 'a five frame with some counters: how many more make 5')],
    note='Support lesson from "Alive in 5!" (Phase 5) = R.B5.S6 "Composition of 4 and 5" (partial there with the same skill and build).')

lesson(K_ + 'countingpatternsbeyond10teennumbers',
    partial=[('counting:count_sequence', {'band': 20, 'dir': 'forward'}, 'the number after a number to 20 on a track, many of them below 10 (after 3 comes 4); never the teen pattern (10 and 1, 10 and 2)'),
             ('counting:number_seq_fill', {'step': 1, 'dir': 'forward', '@max': 20}, 'fills missing numbers on a track from 0 to 20, many of them below 10; never the teen pattern')],
    verdict='partial',
    missing='the counting pattern of the teen numbers only (11 to 20: ten and one, ten and two …)',
    build=['number_focus'],
    pre=[('counting:count_objects', {'band': 10, 'objects': 'frame'}, 'R.B11.S1', 'counting to 10 in ten frames: a full frame is the 10 of every teen number'),
         ('composing:make_ten', {'band': 10}, 'R.B11.S8', 'how many more make 10'),
         ('composing:ten_frame_build', {'band': 10}, 'R.B11.S3', 'building 9 and 10 on a ten frame')],
    related=[('composing:teen_compose', {'band': 19}, 'a teen number as 10 and some more ones (10 and 4 more is 14)')],
    note='Support lesson from "To 20 and Beyond" (Phase 8) = R.B13.S2 / S4 "Continue patterns beyond 10" (partial there with the same skills and build).')

lesson(K_ + 'deepeningunderstandingconsolidate2d3dshapes',
    partial=[('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [0, 1, 2]}, 'clicks every circle, triangle, square or rectangle among other shapes'),
             ('shapes_early:name_3d_shapes', {'forms': [1]}, 'clicks every sphere, cylinder, cube, cone or rectangular prism among other solids; never links a solid to its flat faces')],
    verdict='partial',
    missing='consolidating 2-D and 3-D shapes together: the flat faces of 3-D shapes and shapes found in the world around the pupil',
    build=['shape_3d_tasks', 'shapes_world'],
    closes={'shape_3d_tasks': 'the 2-D faces seen in 3-D shapes, and what each solid can do (roll, stack)',
            'shapes_world': 'recognising 2-D and 3-D shapes in everyday objects'},
    pre=[('shapes_early:compose_shapes', {'shapes': [0, 1]}, 'R.B15.S5', 'two shapes put together make a new shape'),
         ('comparing:classify_count', {'band': 3, 'tiles': 2, 'objects': 'pictures'}, 'R.B1.S4', 'picking out every object of one kind'),
         ('shapes_early:shape_positions', {}, 'R.B4.S4', 'describing where one picture is from another: above, below, beside')],
    related=[],
    note='Support lesson from "On the Move" (Phase 11) = R.B18.S1 "Deepen understanding" for shape (a gap there, build consolidate). '
         'No related: every other shape skill is its own direct or pre, or asks for vertices above Reception.')

lesson(K_ + 'doublingupto55',
    partial=[('number_sense:doubles_near_doubles', {'forms': [0]}, 'doubles written as sums from 1 + 1 up to 10 + 10, past 5 + 5; no pictures of two equal groups')],
    verdict='partial',
    missing='doubles to 5 + 5 only, shown as two equal pictured groups (dice, fingers, a mirror)',
    build=['doubles_pictured'],
    pre=[('composing:number_bonds', {'band': 10}, 'R.B11.S7', 'a whole to 10 split into two parts'),
         ('addition:add_5_pictures', {}, 'R.B9.S9', 'combining two pictured groups'),
         ('composing:make_ten', {'band': 10}, 'R.B11.S8', 'the pairs that make 10, 5 and 5 among them')],
    related=[('division:share_into_groups', {'band': 12}, 'sharing a group equally: the inverse of doubling')],
    note='Support lesson from "Find My Pattern" (Phase 10) = R.B11.S11 / S12 "Doubles to 10" (partial there with the same skill and build); R.B16.S6 too.')

lesson(K_ + 'explore2dshapescircletrianglerectanglesquare',
    partial=[('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [0, 1, 2]}, 'clicks every circle, triangle, square or rectangle among four drawn shapes; each shape is always drawn the same way up and the same size, never turned or made bigger or smaller')],
    verdict='partial',
    missing='naming circles, triangles, rectangles and squares whatever way they are turned and whatever their size (K.G.A.2)',
    build=['defining_attributes'],
    pre=[],
    related=[('shapes_early:compose_shapes', {'shapes': [0, 1]}, 'two shapes put together make a new shape')],
    note='Support lesson from "Just Like Me!" (Phase 2): name_2d_shapes {forms:[1], shapes:[0,1,2]} asks the pupil to click every circle, triangle, '
         'square or rectangle among other drawn shapes (R.B4.S1 and R.B6.S1 are full with the same skill), but every shape is one fixed picture, so the '
         'site\'s K.G.A.2 clause "regardless of their orientations or overall size" is not dealt; defining_attributes (the R lane\'s) turns and resizes them. '
         + FEW_P12.format(ph='Just Like Me!, Phase 2'))

lesson(K_ + 'introducingzero',
    verdict='gap',
    missing='zero as the count of an empty set (no counters left, an empty plate) and writing 0',
    build=['zero'],
    pre=[('counting:count_objects', {'band': 5, 'objects': 'pictures'}, 'R.B5.S1', 'counting a group to 5: zero is the count when there are none'),
         ('composing:ten_frame_build', {'band': 5}, 'R.B5.S3', 'building a number to 5 on a frame: an empty frame shows 0'),
         ('comparing:compare_groups', {'band': 5, 'level': [1]}, 'R.B1.S7', 'fewer: none is the fewest of all')],
    related=[('subtraction:sub_5_pictures', {}, 'taking away from 5 and saying how many are left')],
    note='Support lesson from "Alive in 5!" (Phase 5) = R.B7.S1 "Introduce zero" (a gap there with the same build).')

lesson(K_ + 'makingpairs',
    partial=[('composing:odd_even', {'forms': [2], 'range': 10}, 'picks the odd or the even number from three written numbers to 10; never pairs objects')],
    verdict='partial',
    missing='making pairs of objects (two by two) and seeing whether every object has a partner',
    build=['odd_even_pairs'],
    pre=[('counting:count_objects', {'band': 5, 'objects': 'pictures'}, 'R.B5.S1', 'counting a small group of pictures'),
         ('composing:number_bonds', {'band': 5}, 'R.B5.S6', 'a number to 5 as two parts'),
         ('composing:ten_frame_build', {'band': 5}, 'R.B5.S3', 'building a number on a frame: counters fill the frame in twos, one above the other')],
    related=[('comparing:compare_groups', {'band': 10, 'dir': 'same'}, 'are two groups the same: matching objects one to one, as pairs do')],
    note='Support lesson from "Growing 6, 7, 8" (Phase 6) = R.B9.S6 "Make pairs - odd and even" (partial there with the same skill and build).')

lesson(K_ + 'onemoreandlesswithin5',
    partial=[('counting:count_sequence', {'band': 10, 'dir': 'forward'}, 'the number after a number on a track to 10 (after 8 comes 9); never a pictured group with one more added'),
             ('counting:count_sequence', {'band': 10, 'dir': 'back'}, 'the number before a number on a track to 10; never a pictured group with one taken away')],
    verdict='partial',
    missing='one more and one less within 5, shown with objects: add one to a pictured group, take one away, and say how many now',
    build=['more_less_pictures', 'band_3'],
    closes={'more_less_pictures': 'one more and one less shown with objects (a group, one added or taken away)',
            'band_3': 'one more and one less within 5 (the track runs to 10)'},
    pre=[('counting:count_objects', {'band': 5, 'objects': 'pictures'}, 'R.B3.S1', 'counting a small group of pictures'),
         ('composing:ten_frame_build', {'band': 5}, 'R.B3.S3', 'building a small number on a frame'),
         ('comparing:compare_groups', {'band': 5, 'level': [1]}, 'R.B1.S7', 'which group has more and which has fewer')],
    related=[('addition:add_5_pictures', {'objects': 'pictures'}, 'joining a group and some more and saying how many in all')],
    note='Support lesson from "Light and Dark" (Phase 4) = R.B3.S4 / S5 and R.B5.S4 / S5 "1 more" / "1 less" (partial there with the same skill and builds).')

lesson(K_ + 'positionallanguage',
    partial=[('shapes_early:shape_positions', {}, 'says where one picture is from another: above, below, beside or between; never in front, behind, on, under or in')],
    verdict='partial',
    missing='the positional words in front, behind, on top, under, in and next to, said about real objects',
    build=['position_map'],
    pre=[('comparing:compare_objects', {}, 'R.B2.S1', 'comparing two objects side by side: the words of where things are start here')],
    related=[],
    note='Support lesson from "It\'s Me 1, 2, 3" (Phase 3) = R.B4.S4 "Describe position" (partial there with the same skill and build). '
         'Pre-skills are few: before this phase Reception teaches only R.B1-R.B2, none of them about position except the side-by-side comparisons. '
         'No related: shape_positions is the only live position skill.')

lesson(K_ + 'positionallanguageonunderinnextto',
    partial=[('shapes_early:shape_positions', {'forms': [1]}, 'says that one picture is beside another (next to); never on, under or in')],
    verdict='partial',
    missing='the position words on, under and in',
    build=['position_map'],
    pre=[],
    related=[],
    note='Support lesson from "Getting to Know You" (Phase 1). ' + FEW_P12.format(ph='Getting to Know You, Phase 1') +
         ' No related: shape_positions is the only live position skill.')

lesson(K_ + 'representnumbersto5',
    direct=[('composing:ten_frame_build', {'band': 5})],
    verdict='full',
    pre=[('counting:count_objects', {'band': 5, 'objects': 'pictures'}, 'R.B3.S1', 'counting a small group of pictures'),
         ('composing:number_bonds', {'band': 5}, 'R.B3.S6', 'a small number as two parts'),
         ('comparing:compare_groups', {'band': 5, 'level': [1]}, 'R.B1.S7', 'comparing two small groups')],
    related=[('composing:make_ten', {'band': 5}, 'a five frame with some counters: how many more make 5')],
    note='Support lesson from "Light and Dark" (Phase 4): ten_frame_build {band:5} asks the pupil to build each number from 1 to 5 on a ten frame '
         '(R.B5.S3 "Represent 4 and 5" is the same skill with a narrower window). The site tags it 2.NBT.A.1; the content is K.CC.B.4.')

lesson(K_ + 'shapeswith4sidessquaresandrectangles',
    partial=[('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [2]}, 'clicks every square or every rectangle among other shapes; it never counts sides or corners')],
    verdict='partial',
    missing='the 4 sides (and 4 corners) of squares and rectangles: counting them and comparing the two shapes',
    build=['compare_shapes'],
    pre=[('comparing:classify_count', {'band': 3, 'tiles': 2, 'objects': 'pictures'}, 'R.B1.S4', 'picking out every object of one kind'),
         ('counting:count_objects', {'band': 5, 'objects': 'shapes'}, 'R.B3.S1', 'counting a group to 5 one by one')],
    related=[('shapes_early:compose_shapes', {'shapes': [0, 1]}, 'two shapes put together make a new shape')],
    note='Support lesson from "Light and Dark" (Phase 4) = R.B6.S1 "Identify and name shapes with 4 sides". The R lane judged that step full on naming; '
         'this title also names the property, 4 sides, which no live Reception item counts. Pre-skills are few: naming circles and triangles (R.B4.S1) '
         'uses the lesson\'s own key; R.B1-R.B4 give the sorting and counting listed.')

lesson(K_ + 'sortobjectsbyoneattributecoloursizeshape',
    partial=[('comparing:classify_count', {'band': 6, 'objects': 'pictures'}, 'counts one kind of picture in a mixed bag (by kind: apples, fish, balls), counts to 6; never sorts every object into groups, never by colour or size')],
    verdict='partial',
    missing='sorting objects into groups by one attribute (colour, size or shape) and saying the rule',
    build=['sort_groups'],
    pre=[],
    related=[('comparing:compare_groups', {'band': 5, 'level': [1]}, 'comparing two groups: which has more')],
    note='Support lesson from "Just Like Me!" (Phase 2) = R.B1.S4-S6 sorting (partial there with the same skill and build). '
         + FEW_P12.format(ph='Just Like Me!, Phase 2'))

lesson(K_ + 'spatialreasoning1matchrotatemanipulate',
    partial=[('shapes_early:compose_shapes', {}, 'puts two shapes together and names the shape they make; never matches a shape to its turned copy and never rotates one to fit')],
    verdict='partial',
    missing='matching a shape to the same shape, and rotating (turning or flipping) a shape so it fits an outline',
    build=['match_same', 'shape_fit_turn'],
    closes={'match_same': 'matching a shape to an identical shape (one to one)',
            'shape_fit_turn': 'rotating a shape (a turned or flipped copy) so it fits an outline'},
    pre=[('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [2]}, 'R.B6.S1', 'finding every square and rectangle, whichever way it is drawn'),
         ('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [0, 1]}, 'R.B4.S1', 'finding every circle and triangle'),
         ('shapes_early:name_3d_shapes', {'forms': [1]}, 'R.B12.S1', 'finding every solid of one kind')],
    related=[],
    note='Support lesson from "To 20 and Beyond" (Phase 8) = R.B15.S2 "Rotate shapes" and R.B15.S3 "Manipulate shapes" (partial there, builds '
         'defining_attributes and shape_fit_turn). No related: no live skill matches or turns shapes.')

lesson(K_ + 'spatialreasoning2composeanddecompose',
    partial=[('shapes_early:compose_shapes', {}, 'puts two shapes together and names the shape they make (compose); never splits a shape into smaller shapes')],
    verdict='partial',
    missing='decomposing a shape: which smaller shapes make it (a square cut into two triangles)',
    build=['decompose_shapes'],
    pre=[('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [2]}, 'R.B6.S1', 'naming squares and rectangles, the shapes that are made and split'),
         ('shapes_early:name_2d_shapes', {'forms': [1], 'shapes': [0, 1]}, 'R.B4.S1', 'naming triangles, the parts of a square'),
         ('composing:number_bonds', {'band': 10}, 'R.B11.S7', 'parts make a whole: the same idea with numbers')],
    related=[],
    note='Support lesson from "First Then Now" (Phase 9) = R.B15.S5 "Compose shapes" and R.B15.S6 "Decompose shapes". No related: compose_hexagon '
         'fills hexagons and compose_rect_from_squares writes "2 × 3", above Reception.')

lesson(K_ + 'spatialreasoning3visualizebuild',
    verdict='gap',
    missing='visualising a construction from another viewpoint and building it from a picture',
    build=['scenes'],
    pre=[('shapes_early:compose_shapes', {'shapes': [0, 1]}, 'R.B15.S5', 'putting shapes together to make a new shape'),
         ('shapes_early:name_3d_shapes', {'forms': [1]}, 'R.B12.S1', 'naming the solids a model is built from'),
         ('shapes_early:shape_positions', {}, 'R.B4.S4', 'saying where one picture is from another')],
    related=[],
    note='Support lesson from "Find My Pattern" (Phase 10) = R.B17.S4 "Replicate and build scenes" and R.B17.S5 "Visualise from different positions" '
         '(gaps there with the same build). No related: no live skill builds or changes viewpoint.')

lesson(K_ + 'spatialreasoning4mappingdirection',
    verdict='gap',
    missing='mapping and direction: following and giving directions (forwards, backwards, left, right, turn) on a simple map',
    build=['position_map'],
    pre=[('shapes_early:shape_positions', {}, 'R.B4.S4', 'position words (above, below, beside) for where things are')],
    related=[],
    note='Support lesson from "On the Move" (Phase 11) = R.B17.S8-S11 mapping (gaps there with the same build). Pre-skills are few: position '
         '(R.B4.S4) is the one Reception step with a live skill that a map builds on; R.B17.S6-S7 come in the same phase. No related: no live skill draws a map.')

lesson(K_ + 'takingaway',
    partial=[('subtraction:sub_5_pictures', {}, 'takes away from 5 with pictures (start with 5, take away 2); never from 6 to 10'),
             ('subtraction:sub_wp_10', {}, 'take-away stories within 10 told in words (Leo has 6 apples. Leo gives 3 apples to Mia.); no pictures to cross out')],
    verdict='partial',
    missing='taking away from 6 to 10 with pictures: cross out the objects taken away and say how many are left',
    build=['sub_10_pictures'],
    pre=[('counting:count_sequence', {'band': 10, 'dir': 'back'}, 'R.B11.S6', 'one less: taking one away'),
         ('composing:number_bonds', {'band': 10}, 'R.B11.S7', 'a number to 10 as two parts: the part taken away and the part left'),
         ('counting:count_objects', {'band': 10, 'objects': 'frame'}, 'R.B11.S1', 'counting the counters that are left')],
    related=[('addition:add_5_pictures', {}, 'the inverse: join two groups and say how many in all')],
    note='Support lesson from "First Then Now" (Phase 9) = R.B14.S3 "Take away" (partial there with the same skills and build).')
