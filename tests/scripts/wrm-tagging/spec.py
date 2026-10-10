# Hand-authored decisions for R and Y1. Direct entry: (key, opts, missing) — missing None => full direct.
# S[step] = dict(d=[...], v=verdict, m=missing, b=[build], r=[(key,why)], n=note, pb=[preBuild], p=[(key,why)] extra pre)
CO='counting:count_objects'; CS='counting:count_sequence'; NSF='counting:number_seq_fill'
CG='comparing:compare_groups'; COB='comparing:compare_objects'; CC='comparing:classify_count'
NB='composing:number_bonds'; MT='composing:make_ten'; TC='composing:teen_compose'; TFB='composing:ten_frame_build'
TFT='composing:ten_frame_build_teen'; TFV='composing:tens_foundation_visual'; HCF='composing:hundreds_chart_fill'
B10='composing:base10_build'; OE='composing:odd_even'; NWF='composing:number_word_form'
N2D='shapes_early:name_2d_shapes'; N3D='shapes_early:name_3d_shapes'; M2D='shapes_early:shape_name_match_2d'
M3D='shapes_early:shape_name_match_3d'; POS='shapes_early:shape_positions'; CMP='shapes_early:compose_shapes'
HEX='shapes_early:compose_hexagon'; ATT='shapes_early:shape_attributes'; CFA='shapes_early:compose_from_attributes'
PART='shapes_early:partition_shapes'; OOL='shapes_early:order_objects_length'; MNS='shapes_early:measure_nonstandard'
CORN='shapes_early:shape_corners_count'; SV2='shapes_early:count_sides_vertices_2d'
HL='measurement:heavier_lighter_visual'; SP='patterns:shape_pattern'; DBL='patterns:double'; HALF='patterns:halve'
DND='number_sense:doubles_near_doubles'; MAT='number_sense:make_a_ten'; PNL='number_sense:place_on_number_line'
A5='addition:add_5_pictures'; A10='addition:add_10_mixed'; A10N='addition:add_10_no_regroup'; AWP='addition:add_wp_10'
AWPP='addition:add_wp_10_plain'; NLA='addition:number_line_add'; NLA2='addition:nl_add'; A3='addition:add_three'
FF='addition:add_sub_fact_family'; NFA='addition:number_families_add'; FFS='addition:fact_family_sort'
A20='addition:add_20_mixed'; A10R='addition:add_10_regroup'; CLZ='addition:cloze_addition'; CMPW='addition:comparison_word'
EQS='addition:equal_sign'; AF='addition:add_facts'
S5='subtraction:sub_5_pictures'; S10='subtraction:sub_10_mixed'; SWP='subtraction:sub_wp_10'; SWPP='subtraction:sub_wp_10_plain'
NLS='subtraction:nl_sub'; NLS2='subtraction:number_line_sub'; MAS='subtraction:missing_add_sub'; S10R='subtraction:sub_10_regroup'
S20='subtraction:sub_20_mixed'; SF='subtraction:sub_facts'
PVC='placevalue:compare'; OLG='placevalue:order_least_to_greatest'; OGL='placevalue:order_greatest_to_least'
ML10='placevalue:more_less_10'; UF='placevalue:unit_form'
SEQ2='patterns:seq_2'; SEQ5='patterns:seq_5'; SEQ10='patterns:seq_10'; SKL='patterns:skip_count_line'
EQG='multiplication:equal_or_unequal_groups'; ARR='multiplication:arrays_groups'; DAM='multiplication:dot_array_mult'
RAM='multiplication:repeated_add_to_mult'; SHG='division:share_into_groups'
SHF='fractions:shade_fraction'; FOS='fractions:fraction_of_set'
RUL='measurement:reading_ruler'; COIN='measurement:coin_value'; MON='measurement:money_count'
TH='measurement:time_hour'; THH='measurement:time_half_hour'; CLK='measurement:clock_parts'
PIC='measurement:pictograph_intro'; BAR='measurement:bar_graph_intro'
VK='vocabulary:vocab_grade_K_geometry'; VKM='vocabulary:vocab_grade_K_measurement'

def F(k, **o): return (k, o, None)
def P(k, missing, **o): return (k, o, missing)

A20N='addition:add_20_no_regroup'; S20N='subtraction:sub_20_no_regroup'

# Round 2 (critic R-Y1 r1): every verdict below was re-judged from generated items (items.mjs --links -> R-Y1-items.md).
# Range rule: a skill+opts is full only when its items stay inside the step's number range; `range` = Max Number.
S = {}
def st(i, d=(), v='full', m='', b=(), r=(), n='', pb=(), p=()):
    S[i] = dict(d=list(d), v=v, m=m, b=list(b), r=list(r), n=n, pb=list(pb), p=list(p))

# ---------------- Reception ----------------
# R.B1 Match, sort and compare
st('R.B1.S1', v='gap', m='matching an object to an identical object (same / different)', b=['match_same'],
   r=[(CG,'matching one to one is the next use of "same"')], n='Pre-number step; no existing skill matches pictures.')
st('R.B1.S2', v='gap', m='matching a picture to its object and objects to pictures', b=['match_same'])
st('R.B1.S3', v='gap', m='deciding which objects belong to a set and which does not', b=['odd_one_out'], r=[(CC,'counting one kind inside a mixed set')])
st('R.B1.S4', d=[P(CC,'the sort itself: putting every object into its group by type; the skill counts one kind', band=3, tiles=2)],
   v='partial', m='putting every object into a group by type (the skill only counts one kind)', b=['sort_groups'])
st('R.B1.S5', d=[P(CC,'sorting the same set in different ways (colour, size, kind)', band=3)], v='partial',
   m='sorting the same objects by different attributes', b=['sort_groups'])
st('R.B1.S6', v='gap', m='creating and saying a sorting rule', b=['sort_groups'])
st('R.B1.S7', d=[F(CG, band=5, level=[1])], r=[(COB,'compare by an attribute, not an amount')],
   n='Compare two groups to 5 by matching one to one (tap A or B).')
# R.B2 Talk about measure and patterns
st('R.B2.S1', d=[P(COB,'overall size (big / small); the skill compares length, height and thickness only')], v='partial',
   m='comparing overall size with big / bigger / small / smaller', b=['compare_size'])
st('R.B2.S2', d=[F(HL)], r=[(COB,'the same compare language for length and height')], n='Tap the heavier / lighter picture.')
st('R.B2.S3', v='gap', m='comparing capacity: full, empty, holds more / less', b=['capacity_early'])
st('R.B2.S4', d=[P(SP,'talking about what repeats in a pattern (finding the unit); the skill only fills missing shapes by typing names', points=[0])], v='partial',
   m='spotting and naming the repeating part of an AB pattern', b=['pattern_make'])
st('R.B2.S5', d=[P(SP,'copying a pattern; a response a 4-year-old can give (draw or choose the shape, not type its name)', points=[0])], v='partial',
   m='copying an AB pattern and continuing it by drawing or choosing the next shape (the skill asks for typed shape names and never asks to copy)', b=['pattern_make'])
st('R.B2.S6', v='gap', m='creating a pattern of one\'s own', b=['pattern_make'])
# R.B3 It's me 1, 2, 3
st('R.B3.S1', d=[P(CO,'groups of 1-3 only (band 5 deals 4 and 5 in most items)', band=5, objects='pictures')], v='partial',
   m='finding groups of exactly 1, 2 and 3 (the smallest band is 5)', b=['band_3'])
st('R.B3.S2', d=[P(CO,'recognising 1-3 at a glance; band 5 also deals 4 and 5', band=5, objects='dice')], v='partial',
   m='perceptual subitising of 1, 2 and 3 (seen, not counted)', b=['subitise', 'band_3'])
st('R.B3.S3', d=[P(TFB,'1-3 only (band 5 deals 4 and 5)', band=5)], v='partial', m='representing 1, 2 and 3 only', b=['band_3'],
   r=[('counting:write_numbers_0_20','proposal: write the numeral that represents the amount')])
st('R.B3.S4', d=[P(CS,'one more within 3 with objects; the skill is a number-name question to 10', band=10, dir='forward')], v='partial',
   m='one more than 1 and 2, shown by adding one object (the skill asks "what comes after 6?" to 10, with no objects)', b=['more_less_pictures', 'band_3'])
st('R.B3.S5', d=[P(CS,'one less within 3 with objects; the skill is a number-name question to 10', band=10, dir='back')], v='partial',
   m='one less than 2 and 3, shown by taking one object away', b=['more_less_pictures', 'band_3'])
st('R.B3.S6', d=[P(NB,'wholes of 2 and 3 only (band 5 deals wholes 4 and 5)', band=5)], v='partial', m='composition of 1, 2 and 3 only', b=['band_3'])
# R.B4 Circles and triangles
st('R.B4.S1', d=[F(N2D, forms=[1], shapes=[0, 1])], r=[(M2D,'match the word to the shape'),(CORN,'count corners: a circle has none')],
   n='Tap every circle / triangle (forms 1, shapes circles + triangles); ovals also appear as the circle family.')
st('R.B4.S2', d=[P(ATT,'comparing two shapes side by side: curved / straight sides, corners')], v='partial',
   m='comparing a circle and a triangle (same / different, curved / straight)', b=['compare_shapes'])
st('R.B4.S3', v='gap', m='finding circles and triangles in real objects', b=['shapes_world'])
st('R.B4.S4', d=[P(POS,'in front of, behind, on top of, under (the skill does above / below / beside / between)')], v='partial',
   m='the full early position vocabulary (in front, behind, on top, under)', b=['position_map'])
# R.B5 1, 2, 3, 4, 5
st('R.B5.S1', d=[F(CO, band=5, objects='pictures')], n='Band 5 deals 1-5: inside the block (to 5).')
st('R.B5.S2', d=[P(CO,'recognising 4 and 5 at a glance', band=5, objects='dice')], v='partial', m='perceptual subitising of 4 and 5', b=['subitise'])
st('R.B5.S3', d=[F(TFB, band=5)], n='Band 5 builds 1-5 on a frame.')
st('R.B5.S4', d=[P(CS,'one more within 5 with objects (the skill deals to 10, no objects)', band=10, dir='forward')], v='partial',
   m='one more within 5, shown with objects', b=['more_less_pictures', 'band_3'])
st('R.B5.S5', d=[P(CS,'one less within 5 with objects (the skill deals to 10, no objects)', band=10, dir='back')], v='partial',
   m='one less within 5, shown with objects', b=['more_less_pictures', 'band_3'])
st('R.B5.S6', d=[F(NB, band=5)], n='Wholes to 5 as a numeral bond; no pictured parts.')
st('R.B5.S7', d=[F(NB, band=5, unknown='mixed')], n='Wholes 3-5 as a numeral bond, any part unknown; no pictured parts.',
   p=[(CO,'R.B5.S1 count a group to 5 first'),(TFB,'R.B5.S3 build the amount on a frame')])
# R.B6 Shapes with 4 sides
st('R.B6.S1', d=[F(N2D, forms=[1], shapes=[2])], r=[(SV2,'count the 4 sides'),(M2D,'match the word to the shape')],
   n='Tap every square / rectangle (forms 1, shapes squares and rectangles).')
st('R.B6.S2', d=[F(CMP, shapes=[1])], r=[(HEX,'composing with pattern blocks')], n='Two shapes make a square or rectangle (tap the answer).')
st('R.B6.S3', v='gap', m='finding 4-sided shapes in the environment', b=['shapes_world'])
st('R.B6.S4', v='gap', m='sequencing a day (morning, afternoon, night) and talking about routines', b=['day_order'])
# R.B7 Alive in 5
st('R.B7.S1', v='gap', m='zero as none: an empty set and the numeral 0', b=['zero'])
st('R.B7.S2', d=[P(CO,'a group of zero (the skill always draws at least one)', band=5, objects='pictures')], v='partial', m='finding a group of zero', b=['zero'])
st('R.B7.S3', d=[P(CO,'recognising 0-5 at a glance, including an empty frame', band=5, objects='dice')], v='partial', m='subitising 0 to 5', b=['subitise'])
st('R.B7.S4', d=[P(TFB,'0 (an empty frame)', band=5)], v='partial', m='representing 0 (an empty frame)', b=['zero'])
st('R.B7.S5', d=[P(CS,'one more within 5 with objects (deals to 10, no objects)', band=10, dir='forward')], v='partial',
   m='one more within 0-5 with objects, including 1 more than 0', b=['more_less_pictures', 'band_3'])
st('R.B7.S6', d=[P(CS,'one less within 5 with objects, including 1 less than 1 (deals to 10, no objects)', band=10, dir='back')], v='partial',
   m='one less within 0-5 with objects, including 1 less than 1 is 0', b=['more_less_pictures', 'band_3'])
st('R.B7.S7', d=[F(NB, band=5)], n='Wholes to 5.')
st('R.B7.S8', v='gap', m='conceptual subitising to 5: seeing 3 and 2 and knowing 5', b=['subitise'], r=[(NB,'the parts named as a bond')])
# R.B8 Mass and capacity
st('R.B8.S1', d=[F(HL)], n='"Which is heavier?" about two pictured objects; the balance comes in S2.')
st('R.B8.S2', d=[P(HL,'equal mass: a level, balanced scale')], v='partial', m='balance: making both sides equal', b=['balance'])
st('R.B8.S3', v='gap', m='capacity language: full, empty, nearly full, half full', b=['capacity_early'])
st('R.B8.S4', v='gap', m='comparing what two containers hold', b=['capacity_early'])
# R.B9 Growing 6, 7, 8
st('R.B9.S1', d=[P(CO,'groups of 6-8 only (band 10 deals 1-10)', band=10, objects='frame')], v='partial', m='finding groups of exactly 6, 7 and 8', b=['band_6_8'])
st('R.B9.S2', d=[P(TFB,'6-8 only (band 10 deals 1-10)', band=10)], v='partial', m='representing 6, 7 and 8 only', b=['band_6_8'])
st('R.B9.S3', d=[P(CS,'one more within 8 with objects (deals to 10, no objects)', band=10, dir='forward')], v='partial',
   m='one more than 5, 6 and 7 with objects', b=['more_less_pictures', 'band_6_8'])
st('R.B9.S4', d=[P(CS,'one less within 8 with objects (deals to 10, no objects)', band=10, dir='back')], v='partial',
   m='one less than 6, 7 and 8 with objects', b=['more_less_pictures', 'band_6_8'])
st('R.B9.S5', d=[P(NB,'wholes 6-8 only, pictured parts (band 10 dealt wholes 4-10)', band=10)], v='partial',
   m='composition of 6, 7 and 8 only, with pictured parts', b=['band_6_8'],
   p=[(NB,'R.B7.S7 / R.B5.S7 bonds to 5 first'),(CO,'count the whole to 10')])
st('R.B9.S6', d=[P(OE,'making pairs of objects to see odd and even; the skill names odd or even numbers', forms=[2], range=10)], v='partial',
   m='pairing objects to see whether one is left over', b=['odd_even_pairs'])
st('R.B9.S7', d=[P(DND,'finding a double in a picture to 8 (the skill is abstract doubles to 10 + 10)', forms=[0])], v='partial',
   m='recognising a double (two equal groups) pictured, totals to 8', b=['doubles_pictured'])
st('R.B9.S8', d=[P(DBL,'building a double with objects to 8; the skill is abstract "Double 7"', band=20, range=10)], v='partial', m='making a double with objects to 8', b=['doubles_pictured'])
st('R.B9.S9', d=[F(A5), F(AWP, band=10)], r=[(NB,'the two groups are the parts of a bond')],
   n='Pictured join to 5 and picture stories to 10; the stories are read to the pupil.')
st('R.B9.S10', v='gap', m='conceptual subitising to 8 (see 5 and 3)', b=['subitise'])
# R.B10 Length, height and time
st('R.B10.S1', d=[F(COB, task='length')], r=[(OOL,'put three in order by length')])
st('R.B10.S2', d=[F(COB, task='length')], r=[(OOL,'order three by length')])
st('R.B10.S3', d=[F(COB, task='height')], r=[(OOL,'order by height (towers) after comparing two')])
st('R.B10.S4', d=[F(COB, task='height')], r=[(OOL,'order by length or height')])
st('R.B10.S5', v='gap', m='time language: now, before, after, morning, night, yesterday, tomorrow', b=['time_talk'])
st('R.B10.S6', v='gap', m='ordering events in time (first, next, then)', b=['day_order'])
# R.B11 Building 9 and 10
st('R.B11.S1', d=[F(CO, band=10, objects='frame')], n='Band 10 deals 1-10; 9 and 10 sit at the top of the block range.')
st('R.B11.S2', d=[F(CG, band=10, level=[1]), P(PVC,'numbers within 10 (the lowest band is 99)', band=99)], v='partial',
   m='comparing two numerals to 10 (not groups) with more / fewer', b=['compare_small'])
st('R.B11.S3', d=[F(TFB, band=10)])
st('R.B11.S4', v='gap', m='conceptual subitising to 10 on frames and dice', b=['subitise'])
st('R.B11.S5', d=[P(CS,'one more within 10 shown with objects (the skill is a number-name question)', band=10, dir='forward')], v='partial',
   m='one more within 10 shown by adding one object', b=['more_less_pictures'])
st('R.B11.S6', d=[P(CS,'one less within 10 shown with objects', band=10, dir='back')], v='partial',
   m='one less within 10 shown by taking one object away', b=['more_less_pictures'])
st('R.B11.S7', d=[F(NB, band=10)])
st('R.B11.S8', d=[F(MT, band=10)], r=[(NB,'any bond; bonds to 10 are the special case')], n='make_ten: the frame shows n, how many more make 10.')
st('R.B11.S9', d=[P(TFB,'different arrangements of 10 (5 and 5, 4 and 6) seen as the same 10', band=10)], v='partial',
   m='seeing different arrangements of 10 as the same amount', b=['subitise'])
st('R.B11.S10', d=[P(A3,'three parts that make 10, shown as a part-whole picture', band=10, notation=['across'])], v='partial', m='bonds to 10 in three parts', b=['bonds_3_parts'])
st('R.B11.S11', d=[P(DND,'finding a double in a picture to 10', forms=[0])], v='partial', m='recognising a pictured double to 10', b=['doubles_pictured'])
st('R.B11.S12', d=[P(DBL,'building a double with objects to 10', band=20, range=10)], v='partial', m='making a double with objects to 10', b=['doubles_pictured'])
st('R.B11.S13', d=[P(OE,'making pairs to see odd and even', forms=[2], range=10)], v='partial', m='pairing objects to see odd and even', b=['odd_even_pairs'])
# R.B12 Explore 3-D shapes
st('R.B12.S1', d=[F(N3D, forms=[1]), F(M3D)], n='Tap every cube / sphere ... (forms 1).')
st('R.B12.S2', v='gap', m='finding the flat (2-D) faces on 3-D shapes', b=['shape_3d_tasks'], r=[(N2D,'naming the face shapes')])
st('R.B12.S3', v='gap', m='choosing a 3-D shape for a job (it rolls, it stacks)', b=['shape_3d_tasks'])
st('R.B12.S4', v='gap', m='finding 3-D shapes in the environment', b=['shapes_world'])
st('R.B12.S5', d=[P(SP,'a response a 4-year-old can give (the skill asks for typed shape names)', points=[1])], v='partial',
   m='identifying ABB / ABC patterns by choosing or drawing the next shape (typed names are not a Reception response)', b=['pattern_make'])
st('R.B12.S6', d=[P(SP,'copying; choosing or drawing the shape instead of typing its name', points=[0, 1])], v='partial',
   m='copying a pattern and continuing it by choosing or drawing', b=['pattern_make'])
st('R.B12.S7', d=[P(SP,'patterns in real objects and scenes', points=[0])], v='partial', m='spotting patterns in the environment', b=['pattern_make'])
# R.B13 To 20 and beyond
st('R.B13.S1', d=[P(TC,'10-13 only (band 15 deals 11-15)', band=15), P(TFT,'10-13 only (band 15 deals 11-15)', band=15)], v='partial',
   m='building 10, 11, 12 and 13 only', b=['teen_bands'])
st('R.B13.S2', d=[P(CS,'counting on in 10-13 (band 20 deals 1-20)', band=20, dir='forward'), P(NSF,'tracks inside 10-13', step=1, dir='forward', range=20)], v='partial',
   m='continuing the count 10, 11, 12, 13 only', b=['teen_bands'])
st('R.B13.S3', d=[P(TC,'20 as two tens; 11-13 also appear', band=19), P(TFT,'20 as two full frames', band=19)], v='partial',
   m='14 to 20, with 20 as two full tens (the band stops at 19 and starts at 11)', b=['teen_bands', 'teen_structure'])
st('R.B13.S4', d=[F(CS, band=20, dir='forward'), F(NSF, step=1, dir='forward', range=20)], n='Counting on within 20, tracks reach 20.')
st('R.B13.S5', d=[P(NSF,'saying the counting sequence aloud past 20; the skill fills a written track', step=1, range=50)], v='partial',
   m='oral counting past 20 (the written track is the only check)', b=['oral_count'])
st('R.B13.S6', d=[P(NSF,'the spoken pattern of the decades (21, 22 … 29, 30); a written track only', step=1, range=100)], v='partial',
   m='saying the counting pattern and noticing that 1-9 repeat in every decade', b=['oral_count'],
   r=[(HCF,'the hundred square shows the repeating ones digits')])
# R.B14 How many now?
st('R.B14.S1', d=[F(A5), F(AWP, band=10)], n='add_5_pictures: pictured join to 5; add_wp_10: get-more stories to 10 with pictures (read aloud to the pupil).',
   p=[(CO,'count each group'),(NB,'the two parts of a bond')])
st('R.B14.S2', d=[P(A5,'finding how many were added (change unknown); the skill asks for the total')], v='partial',
   m='change unknown: how many were added', b=['pictures_change_unknown'], r=[(MAS,'the abstract missing-number form, later')])
st('R.B14.S3', d=[F(S5), F(SWP)], n='sub_5_pictures crosses out to 5; sub_wp_10 take-away stories read aloud.')
st('R.B14.S4', d=[P(S5,'finding how many were taken away (change unknown)')], v='partial', m='change unknown: how many were taken away',
   b=['pictures_change_unknown'], r=[(MAS,'the abstract missing-number form, later')])
# R.B15 Manipulate, compose and decompose
st('R.B15.S1', d=[P(ATT,'choosing a shape for a purpose (it rolls, it stacks, it fits)', forms=[1])], v='partial', m='selecting a shape for a purpose', b=['shape_3d_tasks'])
st('R.B15.S2', d=[P(N2D,'recognising a shape when it is turned', forms=[1])], v='partial', m='recognising a turned shape as the same shape', b=['defining_attributes'],
   p=[(N2D,'R.B6.S1 / R.B4.S1 name the shape first')])
st('R.B15.S3', d=[F(CMP)])
st('R.B15.S4', d=[P(CMP,'explaining an arrangement of shapes')], v='partial', m='describing how shapes are arranged', b=['scenes'])
st('R.B15.S5', d=[F(CMP), F(HEX)])
st('R.B15.S6', d=[P(CMP,'decomposing: finding the shapes inside a shape (the skill only composes)')], v='partial', m='decomposing a shape into smaller shapes', b=['decompose_shapes'])
st('R.B15.S7', v='gap', m='copying a picture made of 2-D shapes', b=['scenes'], r=[(CMP,'combining shapes')])
st('R.B15.S8', v='gap', m='finding 2-D faces within 3-D shapes', b=['shape_3d_tasks'], r=[(N3D,'naming the 3-D shape')])
# R.B16 Sharing and grouping
st('R.B16.S1', v='gap', m='exploring sharing an amount fairly', b=['share_group'], r=[(SHG,'grouping, the inverse view')])
st('R.B16.S2', d=[P(SHG,'sharing one at a time (how many each); the skill makes groups of a size', band=12)], v='partial',
   m='sharing one by one between a given number (how many each)', b=['share_group'])
st('R.B16.S3', d=[P(SHG,'exploring: making equal groups freely; the skill gives the group size', band=12)], v='partial', m='exploring making equal groups', b=['share_group'])
st('R.B16.S4', d=[F(SHG, band=12)], n='Make groups of a size from up to 12 counters.')
st('R.B16.S5', d=[P(OE,'sharing an amount between two and seeing it is fair (even) or not (odd)', forms=[2], range=10)], v='partial',
   m='odd and even through sharing between two', b=['share_group'])
st('R.B16.S6', d=[P(DND,'building doubles with objects; the skill is abstract', forms=[0])], v='partial', m='playing with and building doubles with objects', b=['doubles_pictured'])
# R.B17 Visualise, build and map
st('R.B17.S1', d=[P(SP,'circling the unit that repeats', points=[0, 1])], v='partial', m='identifying the repeating unit', b=['pattern_make'])
st('R.B17.S2', v='gap', m='creating a pattern rule of one\'s own', b=['pattern_make'])
st('R.B17.S3', v='gap', m='explaining one\'s own pattern rule', b=['pattern_make'])
st('R.B17.S4', v='gap', m='replicating a scene or construction from a model', b=['scenes'], r=[(CMP,'combine shapes')])
st('R.B17.S5', v='gap', m='visualising objects from different positions', b=['scenes'])
st('R.B17.S6', d=[P(POS,'in front, behind, next to, on top of')], v='partial', m='the full position vocabulary', b=['position_map'])
st('R.B17.S7', d=[P(POS,'giving instructions to build (first, next, on top of)')], v='partial', m='giving instructions using position words', b=['position_map'])
st('R.B17.S8', v='gap', m='exploring simple maps', b=['position_map'])
st('R.B17.S9', v='gap', m='representing a map with models', b=['position_map'])
st('R.B17.S10', v='gap', m='creating a map of a familiar place', b=['position_map'])
st('R.B17.S11', v='gap', m='creating maps and plans from a story', b=['position_map'])
# R.B18 Make connections
st('R.B18.S1', v='gap', m='a consolidation review across the Reception year', b=['consolidate'],
   p=[(CO,'R.B11.S1 counting to 10'),(NB,'R.B11.S7 composition to 10'),(CG,'R.B11.S2 compare to 10'),(TFT,'R.B13.S3 numbers to 20'),(A5,'R.B14.S1 add more'),(S5,'R.B14.S3 take away')],
   r=[(SP,'patterns, reviewed in S2')], n='A review step: no single skill; served by the consolidate review pool.')
st('R.B18.S2', d=[P(SP,'relationships between numbers (1 more, doubles, bonds)', points=[0])], v='partial', m='number relationships (1 more, doubles, bonds) reviewed together',
   b=['consolidate'], p=[(CS,'1 more / 1 less'),(NB,'bonds'),(DND,'doubles')])

# ---------------- Year 1 (Kindergarten) ----------------
st('Y1.B1.S1', d=[P(CC,'sorting every object into groups by a rule; the skill counts one kind', band=6)], v='partial', m='sorting all objects into groups and naming the rule', b=['sort_groups'])
st('Y1.B1.S2', d=[F(CO, band=10)])
st('Y1.B1.S3', d=[P(CO,'counting out a given number from a larger group', band=10)], v='partial', m='counting out (take 6 from a pile of 10)', b=['ten_count_out'])
st('Y1.B1.S4', d=[F(TFB, band=10)], r=[('counting:write_numbers_0_20','proposal: write the numeral')])
st('Y1.B1.S5', d=[P(NWF,'number words 0 to 9 (the skill deals "ten" only at Max 10)', wordform=['to_number'], range=10)], v='partial', m='reading and matching the words zero to ten', b=['words_0_10'])
st('Y1.B1.S6', d=[F(CS, band=10, dir='forward'), F(NSF, step=1, dir='forward', range=10)])
st('Y1.B1.S7', d=[F(CS, band=10, dir='forward')], n='"What comes after n" within 10; more_less_10 starts at band 20, beyond this block.')
st('Y1.B1.S8', d=[F(CS, band=10, dir='back'), F(NSF, step=1, dir='back', range=10)])
st('Y1.B1.S9', d=[F(CS, band=10, dir='back')])
st('Y1.B1.S10', d=[F(CG, band=10, level=[1])])
st('Y1.B1.S11', d=[F(CG, band=10, dir='mixed')])
st('Y1.B1.S12', d=[P(CG,'the symbols <, > and = and the words greater than / less than', band=10)], v='partial',
   m='the symbols <, >, = and the words greater than, less than, equal to within 10', b=['compare_small'])
st('Y1.B1.S13', d=[P(PVC,'numbers within 10 (the lowest band is 99)', band=99)], v='partial', m='comparing two numbers within 10', b=['compare_small'])
st('Y1.B1.S14', d=[P(OLG,'ordering objects and numbers within 10 (the lowest band is 99)')], v='partial', m='ordering groups and numbers within 10', b=['compare_small'], r=[(OGL,'the reverse order')])
st('Y1.B1.S15', v='gap', m='the 0-10 number line: reading, counting along and placing numbers', b=['nl_20'], r=[(NLA,'jumps on a line, next block')])
# Y1.B2 Addition and subtraction within 10
st('Y1.B2.S1', d=[P(NB,'parts and wholes of real objects and groups, named in words (not yet a bond)', band=5)], v='partial',
   m='identifying the parts and the whole of a group in words', b=['part_whole'])
st('Y1.B2.S2', d=[F(NB, band=10), P(NFA,'the part-whole diagram itself', band=10)])
st('Y1.B2.S3', d=[P(A5,'writing the number sentence for a picture'), P(S5,'writing the number sentence for a picture')], v='partial',
   m='writing the + / − sentence that matches a picture (the skills give the sentence)', b=['pictures_to_sentence'])
st('Y1.B2.S4', d=[F(FF, range=10), F(NFA, band=10)], n='Addition facts of a family (both orders) within 10.')
st('Y1.B2.S5', d=[F(NB, band=10)])
st('Y1.B2.S6', v='gap', m='listing bonds of a number in order (0 + 5, 1 + 4 ...) and seeing the pattern', b=['systematic_bonds'], r=[(NB,'single bonds')])
st('Y1.B2.S7', d=[F(MT, band=10), P(NB,'wholes other than 10 (only 10 is the step)', band=10, unknown='second')])
st('Y1.B2.S8', d=[P(A5,'pictured parts with totals 6-10 (the skill stops at 5)')], v='partial', m='adding two pictured groups with totals to 10',
   b=['add_10_pictures'], r=[(A10,'the same facts as numbers (across)')])
st('Y1.B2.S9', d=[F(AWP, band=10), F(NLA, range=10)])
st('Y1.B2.S10', d=[F(AWP, band=10), F(AWPP, band=10)])
st('Y1.B2.S11', d=[F(NB, band=10, unknown='first')])
st('Y1.B2.S12', d=[F(NB, band=10, unknown='second'), F(MAS, range=10)])
st('Y1.B2.S13', d=[F(FF, range=10), F(NFA, band=10), F(FFS, range=10)])
st('Y1.B2.S14', d=[P(S5,'crossing out from amounts 6 to 10 (the pictures skill stops at 5)')], v='partial', m='crossing out to take away from amounts to 10',
   b=['sub_10_pictures'], r=[(SWP,'take-away stories')])
st('Y1.B2.S15', d=[P(S5,'amounts 6 to 10 (stops at 5)'), P(SWP,'a pictured take-away; the stories are text with a picture row')], v='partial',
   m='pictured take-away from amounts to 10 (how many left)', b=['sub_10_pictures'], r=[(S10,'the same facts as numbers')])
st('Y1.B2.S16', d=[F(NLS, range=10), F(NLS2, range=10)])
st('Y1.B2.S17', d=[P(A10,'adding or subtracting only 1 or 2 (counting on or back by 1 or 2)', notation=['across'])], v='partial', m='+1, +2, −1, −2 as a fluency set', b=['add_sub_1_2'])
# Y1.B3 Shape
st('Y1.B3.S1', d=[F(N3D), F(M3D)])
st('Y1.B3.S2', v='gap', m='sorting 3-D shapes by a rule (rolls / stacks, faces)', b=['shape_sort'], r=[(N3D,'naming first')])
st('Y1.B3.S3', d=[F(N2D, shapes=[0, 1, 2, 4]), F(M2D)], n='Circles, triangles, squares, rectangles, pentagons, hexagons (no rhombus).')
st('Y1.B3.S4', d=[P(ATT,'sorting into groups by a rule; the skill picks every shape with n sides', forms=[1])], v='partial', m='sorting 2-D shapes into groups', b=['shape_sort'])
st('Y1.B3.S5', d=[P(SP,'patterns of 3-D shapes (the skill draws 2-D shapes only)')], v='partial', m='repeating patterns made of 3-D shapes', b=['pattern_make'])
# Y1.B4 Place value within 20
st('Y1.B4.S1', d=[F(CO, band=20)])
st('Y1.B4.S2', d=[P(TFB,'10 as one ten (a full frame is one ten)', band=10)], v='partial', m='10 as one ten', b=['teen_structure'])
st('Y1.B4.S3', d=[P(TC,'11-13 only (band 15 deals to 15)', band=15), P(TFT,'11-13 only', band=15)], v='partial', m='11, 12 and 13 only', b=['teen_bands'])
st('Y1.B4.S4', d=[P(TC,'14-16 only (band 19 deals 11-19)', band=19), P(TFT,'14-16 only', band=19)], v='partial', m='14, 15 and 16 only', b=['teen_bands'])
st('Y1.B4.S5', d=[P(TC,'17-19 only (band 19 deals 11-19)', band=19), P(TFT,'17-19 only', band=19)], v='partial', m='17, 18 and 19 only', b=['teen_bands'])
st('Y1.B4.S6', d=[P(TFT,'20 as two full tens', band=19)], v='partial', m='20 as two tens', b=['teen_structure'])
st('Y1.B4.S7', d=[F(CS, band=20), F(ML10, step=1, band=20)])
st('Y1.B4.S8', v='gap', m='the 0-20 number line: reading and labelling ticks', b=['nl_20'], r=[(NLA,'jumps on a line')])
st('Y1.B4.S9', d=[P(NLA,'using the line to find and place numbers (the skill is addition on a 0-10 line)', range=10), P(NLS2,'counting back on the line', range=10)], v='partial',
   m='finding and placing numbers on a 0-20 line', b=['nl_20'])
st('Y1.B4.S10', v='gap', m='estimating where a number lies on a 0-20 line with only the ends marked', b=['nl_20'])
st('Y1.B4.S11', d=[P(PVC,'numbers within 20 (the lowest band is 99)', band=99)], v='partial', m='comparing numbers within 20', b=['compare_small'])
st('Y1.B4.S12', d=[P(OLG,'numbers within 20')], v='partial', m='ordering numbers within 20', b=['compare_small'], r=[(OGL,'reverse order')])
# Y1.B5 Add and subtract within 20
st('Y1.B5.S1', d=[F(A20N, band=20, notation=['across']), P(NLA,'a 0-20 line (the line stops at 10)', range=10)], n='Counting on within 20, no bridging.')
st('Y1.B5.S2', d=[P(A20N,'using the bond 3 + 4 to add 13 + 4 (a ten-frame or part-whole picture); the skill is abstract', band=20, notation=['across'])], v='partial',
   m='adding ones to a teen number using a known bond, shown with a ten and ones', b=['ones_bonds_teen'])
st('Y1.B5.S3', d=[P(MT,'bonds to 20 (make 20 fills a second ten frame; bonds like 13 + 7)', band=20)], v='partial', m='all bonds to 20', b=['bonds_20'], p=[(MT,'Y1.B2.S7 bonds to 10 come first'),(NB,'Y1.B2.S5 bonds within 10'),(TFT,'Y1.B4 teen numbers on two frames')])
st('Y1.B5.S4', d=[F(DND, forms=[0])], n='Doubles 1 + 1 to 10 + 10.')
st('Y1.B5.S5', d=[F(DND, forms=[1, 2])], n='Doubles plus one and minus one.')
st('Y1.B5.S6', d=[P(S20N,'using the bond 7 − 3 to do 17 − 3 (a ten and ones picture); the skill is abstract', band=20, notation=['across'])], v='partial',
   m='subtracting ones from a teen number using a known bond', b=['ones_bonds_teen'])
st('Y1.B5.S7', d=[P(NLS,'counting back on a 0-20 line (the line stops at 10)', range=10), P(NLS2,'a 0-20 line', range=10)], v='partial',
   m='counting back within 20 on a line', b=['nl_20'])
st('Y1.B5.S8', d=[P(CMPW,'finding the difference by comparing two bars or a number line', range=10)], v='partial', m='difference as comparison (bars, line)', b=['difference'])
st('Y1.B5.S9', d=[F(NFA, band=20)], r=[(FF,'the same family within 10')])
st('Y1.B5.S10', d=[P(CLZ,'within 20 (deals within 10)', range=10), P(MAS,'within 20 (Max Number 10 or 100 only)', range=10)], v='partial',
   m='missing-number sentences within 20', b=['missing_20'])
# Y1.B6 Place value within 50
st('Y1.B6.S1', d=[F(NSF, step=1, range=50), F(HCF, band=50)])
st('Y1.B6.S2', d=[F(TFV, band=50)], n='Tens rods 10-50: how many tens.')
st('Y1.B6.S3', d=[P(TFV,'counting a large set by making groups of ten', band=50)], v='partial', m='grouping a loose set into tens to count it', b=['tens_ones_group'])
st('Y1.B6.S4', d=[F(B10, band=50)])
st('Y1.B6.S5', d=[F(B10, band=50)], r=[(UF,'the same partition written in words (to 99)')])
st('Y1.B6.S6', d=[P(PNL,'a whole 0-50 line counted in tens then ones (the skill shows one ten to the next)', span=10, band=100)], v='partial', m='the 0-50 line', b=['nl_20'])
st('Y1.B6.S7', d=[P(PNL,'estimating on a line with only the ends marked', span=10, band=100)], v='partial', m='estimating on a 0-50 line', b=['nl_20'])
st('Y1.B6.S8', d=[F(ML10, step=1, band=50)])
# Y1.B7 Length and height
st('Y1.B7.S1', d=[F(COB), F(OOL)])
st('Y1.B7.S2', d=[F(MNS)], r=[('shapes_early:order_length_tasks','proposal option: compare by units')])
st('Y1.B7.S3', d=[P(RUL,'a centimetre ruler (the skill reads inches only)')], v='partial', m='measuring in centimetres', b=['ruler_cm'])
# Y1.B8 Mass and volume
st('Y1.B8.S1', d=[F(HL)])
st('Y1.B8.S2', v='gap', m='measuring mass with cubes on a balance', b=['nonstandard_mass'], r=[(MNS,'the same idea for length')])
st('Y1.B8.S3', d=[P(HL,'comparing masses by the number of units')], v='partial', m='comparing two masses measured in cubes', b=['nonstandard_mass'])
st('Y1.B8.S4', v='gap', m='full, empty, half full', b=['capacity_early'])
st('Y1.B8.S5', v='gap', m='comparing volume in containers', b=['capacity_early'])
st('Y1.B8.S6', v='gap', m='measuring capacity with cups or scoops', b=['nonstandard_capacity'])
st('Y1.B8.S7', v='gap', m='comparing capacities measured in cups', b=['nonstandard_capacity'])
# Y1.B9 Multiplication and division
st('Y1.B9.S1', d=[P(SKL,'2s alone on a page; 2s, 5s and 10s come mixed, and no pictured pairs', step=[0], band=50, range=50)], v='partial',
   m='counting in 2s from 0 on true multiples, a page of 2s alone, with pictured pairs', b=['multiples_from_0'], p=[(OE,'R.B9.S6 / R.B11.S13 pairs: odd and even'),(CO,'Y1.B4.S1 count objects to 20 one by one')])
st('Y1.B9.S2', d=[P(SKL,'10s alone on a page; mixed with 2s and 5s, no ten frames', step=[0], band=50, range=50)], v='partial',
   m='counting in 10s from 0 on true multiples to 100, a page of 10s alone', b=['multiples_from_0'], p=[(TFV,'Y1.B6.S2 / Y1.B12.S2 20, 30, 40 ... as tens'),(NSF,'Y1.B12.S1 count to 100 in ones')])
st('Y1.B9.S3', d=[P(SKL,'5s alone on a page; mixed with 2s and 10s, no hands', step=[0], band=50, range=50)], v='partial',
   m='counting in 5s from 0 on true multiples, a page of 5s alone', b=['multiples_from_0'], p=[(CO,'Y1.B4.S1 count objects to 20'),(NSF,'Y1.B12.S1 count to 100 in ones')])
st('Y1.B9.S4', d=[P(EQG,'saying "equal" or "not equal"; the skill asks the pupil to write "multiply" or "add"', step=6)], v='partial',
   m='deciding whether groups are equal and saying equal / not equal', b=['equal_groups_early'])
st('Y1.B9.S5', d=[F(ARR, forms=[1], range=10)], r=[(RAM,'the same sum written with ×, later')], n='"___ groups of ___ make ___ in all" with rings of dots.')
st('Y1.B9.S6', d=[F(ARR, forms=[0], range=10)], r=[(DAM,'count a bigger array')], n='Rows of dots: "___ rows of ___ make ___".')
st('Y1.B9.S7', d=[F(DND, forms=[0]), F(DBL, band=20, range=20)])
st('Y1.B9.S8', d=[F(SHG, band=12)])
st('Y1.B9.S9', d=[P(SHG,'sharing one at a time between a given number of groups (how many in each)', band=12)], v='partial', m='sharing (how many each)', b=['share_group'])
# Y1.B10 Fractions
st('Y1.B10.S1', d=[F(PART, parts=[0])], n='Halves only (parts 0).')
st('Y1.B10.S2', d=[P(SHF,'halves only (denominator family 2 also deals quarters and eighths)', denoms=[2])], v='partial', m='finding (shading) a half of a shape only', b=['halves_quarters_only'])
st('Y1.B10.S3', d=[P(FOS,'recognising whether a set is split into two equal groups', denoms=[2], range=10)], v='partial', m='is this set in halves? (equal / not equal)', b=['half_quarter'])
st('Y1.B10.S4', d=[F(HALF, band=10, range=10), P(FOS,'halves only (family 2 deals quarters too)', denoms=[2], range=10)], n='halve: "Half of 8" within 10.')
st('Y1.B10.S5', d=[F(PART, parts=[2])], n='Fourths only (parts 2).')
st('Y1.B10.S6', d=[P(SHF,'quarters only (family 2 also deals halves and eighths)', denoms=[2])], v='partial', m='finding (shading) a quarter of a shape only', b=['halves_quarters_only'])
st('Y1.B10.S7', d=[P(FOS,'recognising a set split into four equal groups', denoms=[2], range=10)], v='partial', m='is this set in quarters?', b=['half_quarter'])
st('Y1.B10.S8', d=[P(FOS,'a quarter only (family 2 deals 1/2 and 2/4 too)', denoms=[2], range=10)], v='partial', m='finding a quarter of a quantity only', b=['halves_quarters_only'])
# Y1.B11 Position and direction
st('Y1.B11.S1', v='gap', m='whole, half and quarter turns', b=['turns'])
st('Y1.B11.S2', d=[P(POS,'left and right (the skill does above / below / beside)')], v='partial', m='left and right', b=['position_map'])
st('Y1.B11.S3', v='gap', m='forwards and backwards moves', b=['position_map'])
st('Y1.B11.S4', d=[F(POS, forms=[0])], n='Above and below only (forms 0).')
st('Y1.B11.S5', v='gap', m='ordinal numbers 1st, 2nd, 3rd ...', b=['ordinal'])
# Y1.B12 Place value within 100
st('Y1.B12.S1', d=[F(NSF, step=1, range=100), F(HCF, band=100)])
st('Y1.B12.S2', d=[F(TFV, band=90)], n='Tens rods 10-90; 100 as ten tens is said aloud.')
st('Y1.B12.S3', d=[F(B10, band=99), F(UF, band=99)])
st('Y1.B12.S4', d=[P(PNL,'a whole 0-100 line counted in tens then ones', span=10, band=100)], v='partial', m='the 0-100 line', b=['nl_20'])
st('Y1.B12.S5', d=[F(ML10, step=1, band=100)])
st('Y1.B12.S6', d=[P(PVC,'two numbers with the same tens (the skill mixes any two)', band=99)], v='partial', m='comparing numbers with the same number of tens', b=['compare_small'])
st('Y1.B12.S7', d=[F(PVC, band=99)])
# Y1.B13 Money
st('Y1.B13.S1', d=[P(TFV,'one coin standing for several ones (a rod is one ten, not money)', band=50), P(COIN,'one coin worth several 1s; the skill finds coins by value', currency='usd')], v='partial',
   m='unitising: one coin worth 5 or 10 is the same as 5 or 10 ones', b=['unitise_coins'])
st('Y1.B13.S2', d=[F(COIN, currency='usd')], n='US coins: circle every coin worth n.')
st('Y1.B13.S3', d=[P(COIN,'naming each bill\'s value', currency='usd', task='order'), P(MON,'naming each bill\'s value; it counts bills', currency='usd', kind='note', band=100)], v='partial',
   m='recognising bills and naming each bill\'s value', b=['money_notes'])
st('Y1.B13.S4', d=[F(MON, currency='usd', kind='like', band=50, values=[1, 5, 10])], n='Count like coins (1, 5, 10 cents) to 50.')
# Y1.B14 Time
st('Y1.B14.S1', v='gap', m='before and after; sequencing events', b=['day_order'])
st('Y1.B14.S2', v='gap', m='days of the week in order', b=['time_talk'])
st('Y1.B14.S3', v='gap', m='months of the year in order', b=['time_talk'])
st('Y1.B14.S4', v='gap', m='choosing hours, minutes or seconds for an activity', b=['time_units'], r=[(CLK,'parts of a clock')])
st('Y1.B14.S5', d=[F(TH)], p=[(CLK,'the hands and numbers of a clock')])
st('Y1.B14.S6', d=[F(THH)], r=[(TH,'the hour first')])

# New proposals (rule 13: short — name, kind, teaches, closes, representation; full designs are the next job).
# `closes` is filled by gen.py from the steps' missing clauses.
NEW = {
 'doubles_pictured': dict(kind='option', skill='number_sense:doubles_near_doubles', option='pictures: two equal rows, totals to 8 / 10',
   name='Doubles with Pictures (option)', teaches='find the double in a picture of two equal groups, or draw the matching group to make a double; write the total (to 8, then to 10)',
   representation='two identical rows of counters in one boxed cell; write the total', family='algebra', ccss=['K.OA.A.1'],
   why='doubles_near_doubles and double are abstract (9 + 9, "Double 7")'),
 'bonds_3_parts': dict(kind='option', skill='composing:number_bonds', option='parts: 3',
   name='Bonds to 10 in Three Parts (option)', teaches='split a whole of 10 into three parts and write the missing part',
   representation='part-whole diagram, one whole and three part circles', family='counting', ccss=['K.OA.A.3'],
   why='number_bonds has two parts only; add_three is an addition fact, not a part-whole'),
 'pictures_change_unknown': dict(kind='option', skill='addition:add_5_pictures', option='unknown: change (the same option on subtraction:sub_5_pictures); within 5',
   name='How Many Were Added / Taken Away? (option)', teaches='look at the before and after pictures and write how many were added, or how many were taken away (within 5)',
   representation='a before box and an after box of counters in one cell; write the change', family='operations', ccss=['K.OA.A.2', 'K.OA.A.1'],
   why='the picture skills ask only for the result; one change only (no band lift: P-1, and the skills are named "within 5")'),
 'add_10_pictures': dict(kind='new', skill='addition:add_10_pictures', name='Add Within 10 with Pictures',
   teaches='count two pictured groups and write how many in all, totals 6 to 10',
   representation='two groups of counters (or a ten frame split in two) in one cell; one answer box', family='operations', ccss=['K.OA.A.1', 'K.OA.A.2'],
   why='add_5_pictures stops at 5 by name; add_10_mixed is abstract'),
 'sub_10_pictures': dict(kind='new', skill='subtraction:sub_10_pictures', name='Take Away Within 10 with Pictures',
   teaches='cross out the objects taken away and write how many are left, from amounts 6 to 10',
   representation='a row of up to 10 counters to cross out; one answer box', family='operations', ccss=['K.OA.A.1', 'K.OA.A.2'],
   why='sub_5_pictures stops at 5 by name; sub_10_mixed is column subtraction'),
 'band_3': dict(kind='option', skill='counting:count_objects', option='band 3 (shared: count_objects, ten_frame_build, number_bonds; count_sequence band 5)',
   name='Count to 3 (shared band option)', teaches='count, build and split groups of 1, 2 and 3 only (and 1 more / 1 less within 5)',
   representation='the skill\'s own cell with at most 3 objects (5 for the more / less track)', family='counting', ccss=['K.CC.B.4', 'K.CC.B.5', 'K.OA.A.3'],
   why='the smallest live band is 5 (10 for count_sequence); generated pages deal 4-5 in most items'),
 'band_6_8': dict(kind='option', skill='counting:count_objects', option='band 6-8 (shared: count_objects, ten_frame_build, number_bonds, count_sequence)',
   name='Numbers 6, 7 and 8 (shared band option)', teaches='count, build and split groups of 6, 7 and 8 only',
   representation='the skill\'s own cell, amounts and wholes 6-8', family='counting', ccss=['K.CC.B.5', 'K.OA.A.3'],
   why='band 10 deals 1-10; the R.B9 steps are 6-8'),
 'more_less_pictures': dict(kind='option', skill='counting:count_sequence', option='objects: show the group, add or take one',
   name='One More, One Less with Objects (option)', teaches='see a group, add one (or take one away) and write how many now',
   representation='a tower or ten frame of n counters with one counter added or crossed out; one answer box', family='counting', ccss=['K.CC.B.4'],
   why='count_sequence asks "what comes after 6?" with no objects'),
 'teen_bands': dict(kind='option', skill='composing:teen_compose', option='band 10-13 / 14-16 / 17-20 (shared: ten_frame_build_teen, count_sequence)',
   name='Teen Number Bands (option)', teaches='build and continue only the numbers of the step: 10-13, 14-16 or 17-20',
   representation='the skill\'s own ten-frame cell, numbers held to the band', family='counting', ccss=['K.NBT.A.1', 'K.CC.B.5'],
   why='the bands are 15 and 19 (11-15, 11-19), which overreach each WRM step and never reach 20'),
 'oral_count': dict(kind='option', skill='counting:number_seq_fill', option='mode: say and point (teacher ticks)',
   name='Count Aloud Track (option)', teaches='point to each number on a track and say it, past 20 and across a decade; the teacher ticks the numbers said',
   representation='a long number track (to 30 or 100) with tick boxes under it; no writing', family='counting', ccss=['K.CC.A.1'],
   why='the steps are oral; the live skill checks only written gaps'),
 'decompose_shapes': dict(kind='option', skill='shapes_early:compose_shapes', option='reverse: find the shapes inside',
   name='Find the Shapes Inside (option)', teaches='look at a shape cut by lines and say which smaller shapes make it (two triangles make a square)',
   representation='one shape with its cut lines drawn; tap or circle the parts from a choice of shapes', family='geometry', ccss=['K.G.B.6'],
   why='compose_shapes only puts two shapes together'),
 'ones_bonds_teen': dict(kind='option', skill='addition:add_20_no_regroup', option='support: a ten and ones picture with the bond (same on subtraction:sub_20_no_regroup)',
   name='Add and Subtract Ones Using a Bond (option)', teaches='add or take away ones in a teen number using the known bond (13 + 4 because 3 + 4 = 7)',
   representation='a full ten frame and a ones frame above the sentence; the bond written beside it', family='operations', ccss=['1.OA.C.6', 'K.OA.A.1'],
   why='the no-regroup skills are abstract; the bond step is what WRM teaches'),
 'missing_20': dict(kind='option', skill='subtraction:missing_add_sub', option='range 20 (also cloze_addition)',
   name='Missing Numbers Within 20 (option)', teaches='find the missing number in + and − sentences within 20',
   representation='the skill\'s own sentence cell with numbers to 20', family='operations', ccss=['1.OA.D.8'],
   why='the range is 10 or 100 only'),
 'multiples_from_0': dict(kind='option', skill='patterns:seq_2', option='start at 0 (multiples only), band 20 / 50 / 100; the same on seq_5 and seq_10',
   name='Count in 2s, 5s, 10s from Zero (option)', teaches='count in 2s (or 5s, 10s) from 0 on true multiples and fill the next number, one count per page',
   representation='a number track of multiples with a picture strip (pairs of socks, hands, ten frames) above it', family='patterns', ccss=['2.OA.C.3', '2.NBT.A.2', 'K.CC.A.1'],
   why='seq_2/5/10 deal 1, 3, 5 and 1, 11, 21; skip_count_line mixes 2s, 5s and 10s on one page'),
 'halves_quarters_only': dict(kind='option', skill='fractions:shade_fraction', option='denoms: halves only / quarters only (also fraction_of_set)',
   name='Halves Only / Quarters Only (option)', teaches='shade a half (or a quarter) of a shape, or find a half (quarter) of a small set',
   representation='the skill\'s own shape or set cell, denominator 2 or 4 alone', family='fractions', ccss=['1.G.A.3'],
   why='the denominator family 2 also deals quarters and eighths'),
 'unitise_coins': dict(kind='option', skill='measurement:coin_value', option='task: swap (one coin = n ones)',
   name='One Coin, Many Ones (option)', teaches='match one 5-cent or 10-cent coin to the same number of 1-cent coins',
   representation='one coin on the left, rows of 1-cent coins on the right; circle the matching row', family='measurement', ccss=['2.MD.C.8'],
   why='coin_value finds coins by value; unitising is not dealt'),
}

# Extra pre-skills where the earlier steps on the idea share the step's own skill+opts (rule 11)
S['R.B3.S6']['p'] += [(CO,'R.B3.S1 count the whole group first'),(TFB,'R.B3.S3 show the amount on a frame')]
S['R.B5.S6']['p'] += [(CO,'R.B5.S1 count the whole group to 5')]
S['R.B9.S6']['p'] += [(CO,'R.B9.S1 count the objects before pairing them')]
S['R.B1.S7']['p'] += [(CO,'count each group; matching one to one needs no count, so this is a light pre-skill')]
S['Y1.B10.S1']['p'] += [(SHG,'R.B16 grouping into equal groups: equal parts')]
S['Y1.B13.S1']['p'] += [(CO,'Y1.B1.S2 count ones'),(B10,'Y1.B6.S4 a ten as one rod')]

# Related by idea (rule 4/10): the same idea in another form, or its inverse. gen.py adds these after the hand-written ones.
_f = 'the same idea in another form: '; _i = 'the inverse: '
FORMS = {
 CO: [(TFB, _f+'build the count on a ten frame'), (CC, _f+'count one kind inside a mixed set')],
 TFB: [(CO, _f+'count a drawn group')], CS: [(NSF, _f+'the number track'), (ML10, _f+'"1 more than" sentences')],
 NSF: [(CS, _f+'next / before questions'), (HCF, _f+'the hundred square')], HCF: [(NSF, _f+'the number track')],
 NB: [(MT, _f+'bonds to 10 on a frame'), (NFA, _f+'the number family')], MT: [(NB, _f+'any bond as a part-whole')],
 A5: [(S5, _i+'take away with pictures'), (AWP, _f+'the same join as a story')], S5: [(A5, _i+'add with pictures'), (SWP, _f+'the same take-away as a story')],
 AWP: [(A5, _f+'pictures only'), (SWP, _i+'take-away stories')], SWP: [(S5, _f+'pictures only'), (AWP, _i+'addition stories')],
 AWPP: [(AWP, _f+'with a picture row')], NLA: [(NLS2, _i+'subtract on the line')], NLS: [(NLA, _i+'add on the line')], NLS2: [(NLA, _i+'add on the line')],
 CG: [(CC, _f+'count one kind of a sort'), (PVC, _f+'compare numerals, later')], COB: [(OOL, _f+'order three'), (HL, _f+'compare mass')],
 HL: [(COB, _f+'compare length and height')], OOL: [(COB, _f+'compare two'), (MNS, _f+'measure with units')],
 N2D: [(M2D, _f+'match the word to the shape'), (SV2, _f+'count sides and corners')], N3D: [(M3D, _f+'match the word to the shape')],
 M2D: [(N2D, _f+'tap the shapes')], M3D: [(N3D, _f+'tap the shapes')], CMP: [(HEX, _f+'fill a hexagon with blocks')], HEX: [(CMP, _f+'two shapes make one')],
 TC: [(TFT, _f+'build on two ten frames'), (B10, _f+'base-10 blocks')], TFT: [(TC, _f+'10 and n more')],
 TFV: [(B10, _f+'build with rods and cubes')], B10: [(TFV, _f+'count the tens'), (UF, _f+'write tens and ones')], UF: [(B10, _f+'build it with blocks')],
 PVC: [(OLG, _f+'order three numbers')], OLG: [(OGL, _f+'greatest to least'), (PVC, _f+'compare two')], ML10: [(CS, _f+'next / before'), (HCF, _f+'the hundred square')],
 DND: [(DBL, _f+'"double n"'), (HALF, _i+'halve')], DBL: [(DND, _f+'n + n'), (HALF, _i+'halve')], HALF: [(DBL, _i+'double'), (FOS, _f+'a fraction of a set')],
 OE: [(SHG, _f+'make equal groups')], SHG: [(ARR, _f+'groups drawn in rings'), (EQG, _f+'equal or not')], ARR: [(SHG, _i+'make groups from a total'), (RAM, _f+'repeated addition, later')],
 EQG: [(ARR, _f+'groups of ... make ...')], SHF: [(PART, _f+'how many equal parts'), (FOS, _f+'a fraction of a set')], PART: [(SHF, _f+'shade the part')],
 FOS: [(HALF, _f+'half of a number'), (SHF, _f+'a fraction of a shape')], COIN: [(MON, _f+'count the coins')], MON: [(COIN, _f+'find each coin')],
 TH: [(THH, _f+'the half hour next'), (CLK, _f+'the parts of the clock')], THH: [(TH, _f+'the hour')], RUL: [(MNS, _f+'measure with objects')],
 MNS: [(RUL, _f+'a ruler'), (OOL, _f+'order by length')], FF: [(NFA, _f+'the number family'), (FFS, _f+'is it a fact family?')], NFA: [(FF, _f+'the fact family')],
 FFS: [(FF, _f+'complete the family')], MAS: [(CLZ, _f+'pick numbers to make a total'), (NB, _f+'the part-whole picture')], CLZ: [(MAS, _f+'missing number sentences')],
 A20N: [(S20N, _i+'subtract ones'), (NLA, _f+'count on along a line')], S20N: [(A20N, _i+'add ones')], CMPW: [(CG, _f+'compare two groups')],
 A3: [(NB, _f+'a two-part bond')], A10: [(S10, _i+'subtract within 10')], S10: [(A10, _i+'add within 10')], ATT: [(SV2, _f+'count sides and vertices')],
 CFA: [(ATT, _f+'one property at a time')], NWF: [(CO, _f+'count the objects')], PNL: [(NLA, _f+'jumps along a line')], CC: [(CG, _f+'compare the groups')],
 SKL: [(TFV, _f+'tens as rods')], POS: [(N2D, 'naming the shapes being placed')], SP: [(N2D, 'naming the shapes in the pattern')],
}

# Why an old SKILL_WRM tag is removed (judged from generated items)
RM = {
 ('R.B11.S8', NB): 'number_bonds {band:10} deals wholes 4-10; bonds to 10 are make_ten',
 ('R.B13.S6', SEQ10): 'seq_10 deals 1, 11, 21, 31 and 87, 97, 107: not Reception counting patterns',
 ('R.B14.S2', AWP): 'add_wp_10 asks for the total, never how many were added',
 ('R.B14.S4', SWP): 'sub_wp_10 asks how many are left, never how many were taken away',
 ('Y1.B1.S7', ML10): 'more_less_10 starts at band 20; the step is within 10',
 ('Y1.B1.S9', ML10): 'more_less_10 starts at band 20; the step is within 10',
 ('Y1.B2.S8', A10): 'add_10_mixed is a column / abstract layout, not a pictured part-whole for Kindergarten',
 ('Y1.B2.S15', S10): 'sub_10_mixed is column subtraction, not a pictured take-away',
 ('Y1.B3.S4', CFA): 'compose_from_attributes deals "3 sides and at least 2 sides equal": above Kindergarten',
 ('Y1.B5.S1', A20): 'add_20_mixed regroups (bridges 10) in some items; counting on is add_20_no_regroup',
 ('Y1.B5.S2', A10R): 'add_10_regroup bridges 10 in columns: that is Y2.B2.S6 "Add by making 10"',
 ('Y1.B5.S2', MAT): 'make_a_ten bridges 10: Y2.B2.S6, not adding ones without crossing 10',
 ('Y1.B5.S6', S10R): 'sub_10_regroup bridges 10: Y2.B2.S10, not subtracting ones within a teen',
 ('Y1.B5.S6', MAT): 'make_a_ten bridges 10: not this step',
 ('Y1.B5.S9', FF): 'add_sub_fact_family reads Max Number 10 or 100: below or far past "within 20"; number_families_add {band:20} fits',
 ('Y1.B6.S2', SEQ10): 'seq_10 deals 1, 11, 21 and 46, 56: not multiples of ten',
 ('Y1.B6.S5', UF): 'unit_form {band:99} deals numbers to 99, past "within 50"; kept as related',
 ('Y1.B9.S1', SEQ2): 'seq_2 deals 1, 3, 5 and 87, 89, 91: not counting in 2s from 0',
 ('Y1.B9.S2', SEQ10): 'seq_10 deals 1, 11, 21: not multiples of ten',
 ('Y1.B9.S3', SEQ5): 'seq_5 deals 1, 6, 11: not multiples of five',
 ('Y1.B9.S5', RAM): 'repeated_add_to_mult writes "4 × 5": the × sign is not Kindergarten; kept as related',
 ('Y1.B9.S6', DAM): 'dot_array_mult deals 6 × 8 arrays with ×: past the step; kept as related',
 ('Y1.B12.S2', SEQ10): 'seq_10 deals 73, 83, 93, 103: not tens',
}
