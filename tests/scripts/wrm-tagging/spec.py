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

S = {}
def st(i, d=(), v='full', m='', b=(), r=(), n='', pb=(), p=()):
    S[i] = dict(d=list(d), v=v, m=m, b=list(b), r=list(r), n=n, pb=list(pb), p=list(p))

# ---------------- Reception ----------------
# R.B1 Match, sort and compare
st('R.B1.S1', v='gap', m='matching an object to an identical object (same / different)', b=['match_same'],
   r=[(CG,'matching one to one is the next use of "same"')], n='Pre-number step; no existing skill matches pictures.')
st('R.B1.S2', v='gap', m='matching a picture to its object and objects to pictures', b=['match_same'])
st('R.B1.S3', v='gap', m='deciding which objects belong to a set and which does not', b=['odd_one_out'], r=[(CC,'sorting by kind follows')])
st('R.B1.S4', d=[P(CC,'the sort itself: putting every object into its group by type; the skill counts one kind', band=3, tiles=2)],
   v='partial', m='putting every object into a group by type (the skill only counts one kind)', b=['sort_groups'])
st('R.B1.S5', d=[P(CC,'sorting the same set in different ways (colour, size, kind)', band=6)], v='partial',
   m='sorting the same objects by different attributes', b=['sort_groups'])
st('R.B1.S6', v='gap', m='creating and saying a sorting rule', b=['sort_groups'], r=[(CC,'counts one group of a sort')])
st('R.B1.S7', d=[F(CG, band=5, level=[1])], r=[(COB,'compare by an attribute, not an amount')],
   n='Compare amounts by looking and matching one to one (level 1, to 5).')
# R.B2 Talk about measure and patterns
st('R.B2.S1', d=[P(COB,'overall size (big / small); the skill compares length, height and thickness only')], v='partial',
   m='comparing overall size with big / bigger / small / smaller', b=['compare_size'])
st('R.B2.S2', d=[F(HL)], r=[(COB,'the same compare language for length'),('comparing:compare_capacity','proposal: capacity is the next measure')])
st('R.B2.S3', v='gap', m='comparing capacity: full, empty, holds more / less', b=['capacity_early'], r=[(HL,'mass, the measure before')])
st('R.B2.S4', d=[P(SP,'talking about what repeats in a pattern (finding the unit); the skill only fills missing shapes')], v='partial',
   m='spotting and naming the repeating part of an AB pattern', b=['pattern_make'])
st('R.B2.S5', d=[F(SP, points=[0])], n='AB / ABB patterns, fill the next two.')
st('R.B2.S6', v='gap', m='creating a pattern of one\'s own', b=['pattern_make'], r=[(SP,'continue a given pattern first')])
# R.B3 It's me 1, 2, 3
st('R.B3.S1', d=[F(CO, band=5, objects='pictures')], n='Find a group of 1, 2 or 3 among pictures; band 5 deals to 5 (no 3-only band).')
st('R.B3.S2', d=[P(CO,'recognising 1-3 at a glance (the skill counts one by one)', band=5, objects='dice')], v='partial',
   m='perceptual subitising of 1, 2 and 3 (seen, not counted)', b=['subitise'])
st('R.B3.S3', d=[F(TFB, band=5)], r=[('counting:write_numbers_0_20','proposal: write the numeral that represents the amount')],
   n='Represent with counters on a frame; fingers and marks are oral.')
st('R.B3.S4', d=[F(CS, band=10, dir='forward')], n='One more to 3; band 10 is the smallest.')
st('R.B3.S5', d=[F(CS, band=10, dir='back')])
st('R.B3.S6', d=[F(NB, band=5)], n='Wholes up to 5; 3 = 2 + 1 lies inside the band.')
# R.B4 Circles and triangles
st('R.B4.S1', d=[F(N2D)], r=[(M2D,'match the word to the shape'),(CORN,'count corners: a circle has none')])
st('R.B4.S2', d=[P(ATT,'comparing two shapes side by side: curved / straight sides, corners')], v='partial',
   m='comparing a circle and a triangle (same / different, curved / straight)', b=['compare_shapes'])
st('R.B4.S3', v='gap', m='finding circles and triangles in real objects', b=['shapes_world'], r=[(N2D,'naming the shapes first')])
st('R.B4.S4', d=[P(POS,'in front of, behind, next to, on top of, under (the skill does above / below / beside)')], v='partial',
   m='the full early position vocabulary (in front, behind, on top, under, between)', b=['position_map'])
# R.B5 1, 2, 3, 4, 5
st('R.B5.S1', d=[F(CO, band=5, objects='pictures')])
st('R.B5.S2', d=[P(CO,'recognising 4 and 5 at a glance', band=5, objects='dice')], v='partial', m='perceptual subitising of 4 and 5', b=['subitise'])
st('R.B5.S3', d=[F(TFB, band=5)])
st('R.B5.S4', d=[F(CS, band=10, dir='forward')])
st('R.B5.S5', d=[F(CS, band=10, dir='back')])
st('R.B5.S6', d=[F(NB, band=5)])
st('R.B5.S7', d=[F(NB, band=5, unknown='mixed')])
# R.B6 Shapes with 4 sides
st('R.B6.S1', d=[F(N2D)], r=[(SV2,'count the 4 sides'),(M2D,'match the word to the shape')], n='Squares, rectangles and other 4-sided shapes.')
st('R.B6.S2', d=[F(CMP)], r=[(HEX,'composing with pattern blocks')])
st('R.B6.S3', v='gap', m='finding 4-sided shapes in the environment', b=['shapes_world'])
st('R.B6.S4', v='gap', m='sequencing a day (morning, afternoon, night) and talking about routines', b=['day_order'])
# R.B7 Alive in 5
st('R.B7.S1', v='gap', m='zero as none: an empty set and the numeral 0', b=['zero'], r=[(CS,'one less than 1 is 0')])
st('R.B7.S2', d=[F(CO, band=5, objects='pictures')], v='partial', m='finding a group of zero (the skill always draws at least one)', b=['zero'])
st('R.B7.S3', d=[P(CO,'recognising 0-5 at a glance, including an empty frame', band=5, objects='dice')], v='partial', m='subitising 0 to 5', b=['subitise'])
st('R.B7.S4', d=[F(TFB, band=5)], v='partial', m='representing 0 (an empty frame)', b=['zero'])
st('R.B7.S5', d=[F(CS, band=10, dir='forward')])
st('R.B7.S6', d=[F(CS, band=10, dir='back')])
st('R.B7.S7', d=[F(NB, band=5)])
st('R.B7.S8', v='gap', m='conceptual subitising to 5: seeing 3 and 2 and knowing 5', b=['subitise'], r=[(NB,'the parts named as a bond')])
# R.B8 Mass and capacity
st('R.B8.S1', d=[F(HL)])
st('R.B8.S2', d=[P(HL,'equal mass: a level, balanced scale')], v='partial', m='balance: making both sides equal', b=['balance'])
st('R.B8.S3', v='gap', m='capacity language: full, empty, nearly full, half full', b=['capacity_early'])
st('R.B8.S4', v='gap', m='comparing what two containers hold', b=['capacity_early'])
# R.B9 Growing 6, 7, 8
st('R.B9.S1', d=[F(CO, band=10, objects='frame')], n='Band 10 deals to 10; 6-8 sit inside it.')
st('R.B9.S2', d=[F(TFB, band=10)])
st('R.B9.S3', d=[F(CS, band=10, dir='forward')])
st('R.B9.S4', d=[F(CS, band=10, dir='back')])
st('R.B9.S5', d=[F(NB, band=10)])
st('R.B9.S6', d=[P(OE,'making pairs of objects to see odd and even; the skill names odd or even numbers')], v='partial',
   m='pairing objects to see whether one is left over', b=['share_group'])
st('R.B9.S7', d=[P(DND,'finding a double in a picture to 8 (the skill is abstract doubles to 10 + 10)', forms=[0])], v='partial',
   m='recognising a double (two equal groups) pictured, totals to 8', b=['doubles_pictured'])
st('R.B9.S8', d=[P(DBL,'building a double with objects to 8; the skill is abstract')], v='partial', m='making a double with objects', b=['doubles_pictured'])
st('R.B9.S9', d=[F(A5), F(AWP, band=10)], r=[(NB,'the two groups are the parts of a bond')])
st('R.B9.S10', v='gap', m='conceptual subitising to 8 (see 5 and 3)', b=['subitise'])
# R.B10 Length, height and time
st('R.B10.S1', d=[F(COB, task='length')])
st('R.B10.S2', d=[F(COB, task='length')], r=[(OOL,'order three by length')])
st('R.B10.S3', d=[F(COB, task='height')])
st('R.B10.S4', d=[F(COB, task='height')], r=[(OOL,'order by length or height')])
st('R.B10.S5', v='gap', m='time language: now, before, after, morning, night, yesterday, tomorrow', b=['time_talk'])
st('R.B10.S6', v='gap', m='ordering events in time (first, next, then)', b=['day_order'])
# R.B11 Building 9 and 10
st('R.B11.S1', d=[F(CO, band=10, objects='frame')])
st('R.B11.S2', d=[F(CG, band=10, level=[2]), P(PVC,'numbers within 10 (the lowest band is 99)')], v='partial',
   m='comparing two numerals to 10 (not groups) with more / fewer', b=['compare_small'])
st('R.B11.S3', d=[F(TFB, band=10)])
st('R.B11.S4', v='gap', m='conceptual subitising to 10 on frames and dice', b=['subitise'])
st('R.B11.S5', d=[F(CS, band=10, dir='forward')])
st('R.B11.S6', d=[F(CS, band=10, dir='back')])
st('R.B11.S7', d=[F(NB, band=10)])
st('R.B11.S8', d=[F(NB, band=10, unknown='second'), F(MT, band=10)])
st('R.B11.S9', d=[P(TFB,'different arrangements of 10 (5 and 5, 4 and 6) seen as the same 10', band=10)], v='partial',
   m='seeing different arrangements of 10 as the same amount', b=['subitise'])
st('R.B11.S10', d=[P(A3,'three parts that make 10, shown as a part-whole picture')], v='partial', m='bonds to 10 in three parts', b=['bonds_3_parts'])
st('R.B11.S11', d=[P(DND,'finding a double in a picture to 10', forms=[0])], v='partial', m='recognising a pictured double to 10', b=['doubles_pictured'])
st('R.B11.S12', d=[P(DBL,'building a double with objects to 10')], v='partial', m='making a double with objects to 10', b=['doubles_pictured'])
st('R.B11.S13', d=[P(OE,'making pairs to see odd and even')], v='partial', m='pairing objects to see odd and even', b=['share_group'])
# R.B12 Explore 3-D shapes
st('R.B12.S1', d=[F(N3D), F(M3D)])
st('R.B12.S2', v='gap', m='finding the flat (2-D) faces on 3-D shapes', b=['shape_3d_tasks'], r=[(N2D,'naming the face shapes')])
st('R.B12.S3', v='gap', m='choosing a 3-D shape for a job (it rolls, it stacks)', b=['shape_3d_tasks'])
st('R.B12.S4', v='gap', m='finding 3-D shapes in the environment', b=['shapes_world'])
st('R.B12.S5', d=[F(SP, points=[1])], n='ABB, AABB, ABC and ABBC are dealt.')
st('R.B12.S6', d=[F(SP)])
st('R.B12.S7', d=[P(SP,'patterns in real objects and scenes')], v='partial', m='spotting patterns in the environment', b=['pattern_make'])
# R.B13 To 20 and beyond
st('R.B13.S1', d=[F(TC, band=15), F(TFT, band=15)])
st('R.B13.S2', d=[F(CS, band=20), F(NSF, step=1, dir='forward')])
st('R.B13.S3', d=[F(TC, band=19), F(TFT, band=19)], n='14-20; 20 itself is the teen_structure option.')
st('R.B13.S4', d=[F(CS, band=20), F(NSF, step=1)])
st('R.B13.S5', d=[P(NSF,'saying the counting sequence aloud past 20; the skill fills a written track', step=1)], v='partial',
   m='oral counting past 20 (the written track is the only check)', b=['consolidate'])
st('R.B13.S6', d=[F(NSF, step=1), F(SEQ10)])
# R.B14 How many now?
st('R.B14.S1', d=[F(A5), F(AWP, band=10)])
st('R.B14.S2', d=[P(AWP,'finding how many were added (change unknown); the skill asks for the total')], v='partial',
   m='change unknown: how many were added', b=['pictures_change_unknown'], r=[(MAS,'the abstract missing-number form')])
st('R.B14.S3', d=[F(S5), F(SWP)])
st('R.B14.S4', d=[P(SWP,'finding how many were taken away (change unknown)')], v='partial', m='change unknown: how many were taken away',
   b=['pictures_change_unknown'], r=[(MAS,'the abstract missing-number form')])
# R.B15 Manipulate, compose and decompose
st('R.B15.S1', d=[P(ATT,'choosing a shape for a purpose (it rolls, it stacks, it fits)')], v='partial', m='selecting a shape for a purpose', b=['shape_3d_tasks'])
st('R.B15.S2', d=[P(N2D,'recognising a shape when it is turned')], v='partial', m='recognising a turned shape as the same shape', b=['compare_shapes'],
   r=[('shapes_early:defining_attributes','proposal: "is it still a triangle?"')])
st('R.B15.S3', d=[F(CMP)])
st('R.B15.S4', d=[P(CMP,'explaining an arrangement of shapes')], v='partial', m='describing how shapes are arranged', b=['scenes'])
st('R.B15.S5', d=[F(CMP), F(HEX)])
st('R.B15.S6', d=[P(CMP,'decomposing: finding the shapes inside a shape')], v='partial', m='decomposing a shape into smaller shapes', b=['scenes'])
st('R.B15.S7', v='gap', m='copying a picture made of 2-D shapes', b=['scenes'], r=[(CMP,'combining shapes')])
st('R.B15.S8', v='gap', m='finding 2-D faces within 3-D shapes', b=['shape_3d_tasks'], r=[(N3D,'naming the 3-D shape')])
# R.B16 Sharing and grouping
st('R.B16.S1', v='gap', m='exploring sharing an amount fairly', b=['share_group'], r=[(SHG,'grouping, the inverse view')])
st('R.B16.S2', d=[P(SHG,'sharing one at a time (how many each); the skill makes groups of a size, and works to 20', band=12)], v='partial',
   m='sharing one by one between a given number (how many each)', b=['share_group'])
st('R.B16.S3', v='gap', m='exploring making equal groups', b=['share_group'], r=[(SHG,'equal groups drawn')])
st('R.B16.S4', d=[F(SHG, band=12)])
st('R.B16.S5', d=[P(OE,'sharing an amount between two and seeing it is fair (even) or not (odd)')], v='partial',
   m='odd and even through sharing between two', b=['share_group'])
st('R.B16.S6', d=[P(DBL,'building doubles with objects'), P(DND,'building doubles with objects; the skill is abstract', forms=[0])], v='partial', m='playing with and building doubles with objects', b=['doubles_pictured'])
# R.B17 Visualise, build and map
st('R.B17.S1', d=[P(SP,'circling the unit that repeats')], v='partial', m='identifying the repeating unit', b=['pattern_make'])
st('R.B17.S2', v='gap', m='creating a pattern rule of one\'s own', b=['pattern_make'], r=[(SP,'continue a given pattern')])
st('R.B17.S3', v='gap', m='explaining one\'s own pattern rule', b=['pattern_make'], r=[(SP,'continue a given pattern')])
st('R.B17.S4', v='gap', m='replicating a scene or construction from a model', b=['scenes'], r=[(CMP,'combine shapes')])
st('R.B17.S5', v='gap', m='visualising objects from different positions', b=['scenes'])
st('R.B17.S6', d=[P(POS,'in front, behind, between, next to')], v='partial', m='the full position vocabulary', b=['position_map'])
st('R.B17.S7', d=[P(POS,'giving instructions to build (first, next, on top of)')], v='partial', m='giving instructions using position words', b=['position_map'])
st('R.B17.S8', v='gap', m='exploring simple maps', b=['position_map'])
st('R.B17.S9', v='gap', m='representing a map with models', b=['position_map'])
st('R.B17.S10', v='gap', m='creating a map of a familiar place', b=['position_map'])
st('R.B17.S11', v='gap', m='creating maps and plans from a story', b=['position_map'])
# R.B18 Make connections
st('R.B18.S1', v='gap', m='a consolidation review across the Reception year', b=['consolidate'],
   p=[(CO,'R.B11.S1 counting to 10'),(NB,'R.B11.S7 composition to 10'),(CG,'R.B11.S2 compare to 10'),(TC,'R.B13.S3 numbers to 20'),(A5,'R.B14.S1 add more'),(S5,'R.B14.S3 take away')], r=[(CO,'counting'),(NB,'composition'),(CG,'compare'),(SP,'patterns')], n='A review step: no single skill; served by a review pool.')
st('R.B18.S2', d=[P(SP,'relationships between numbers (1 more, doubles, bonds)')], v='partial', m='number relationships (1 more, doubles, bonds) reviewed together',
   b=['consolidate'], r=[(CS,'1 more / 1 less'),(NB,'bonds'),(DND,'doubles')])

# ---------------- Year 1 (Kindergarten) ----------------
st('Y1.B1.S1', d=[P(CC,'sorting every object into groups by a rule; the skill counts one kind', band=6)], v='partial', m='sorting all objects into groups and naming the rule', b=['sort_groups'])
st('Y1.B1.S2', d=[F(CO, band=10)])
st('Y1.B1.S3', d=[P(CO,'counting out a given number from a larger group', band=10)], v='partial', m='counting out (take 6 from a pile of 10)', b=['ten_count_out'])
st('Y1.B1.S4', d=[F(TFB, band=10)], r=[('counting:write_numbers_0_20','proposal: write the numeral')])
st('Y1.B1.S5', d=[P(NWF,'number words 0 to 9 (the skill starts at 10)')], v='partial', m='reading and matching the words zero to ten', b=['words_0_10'])
st('Y1.B1.S6', d=[F(CS, band=10, dir='forward'), F(NSF, step=1, dir='forward')])
st('Y1.B1.S7', d=[F(CS, band=10, dir='forward'), F(ML10, step=1, dir='more', band=20)])
st('Y1.B1.S8', d=[F(CS, band=10, dir='back'), F(NSF, step=1, dir='back')])
st('Y1.B1.S9', d=[F(CS, band=10, dir='back'), F(ML10, step=1, dir='less', band=20)])
st('Y1.B1.S10', d=[F(CG, band=10, level=[1])])
st('Y1.B1.S11', d=[F(CG, band=10, dir='mixed')])
st('Y1.B1.S12', d=[P(CG,'the symbols <, > and = and the words greater than / less than', level=[2])], v='partial',
   m='the symbols <, >, = and the words greater than, less than, equal to within 10', b=['compare_small'])
st('Y1.B1.S13', d=[P(PVC,'numbers within 10 (the lowest band is 99)')], v='partial', m='comparing two numbers within 10', b=['compare_small'])
st('Y1.B1.S14', d=[P(OLG,'ordering objects and numbers within 10 (the lowest band is 99)')], v='partial', m='ordering groups and numbers within 10', b=['compare_small'], r=[(OGL,'the reverse order')])
st('Y1.B1.S15', v='gap', m='the 0-10 number line: reading, counting along and placing numbers', b=['nl_20'], r=[(NLA,'jumps on a line'),(CS,'next number')])
# Y1.B2 Addition and subtraction within 10
st('Y1.B2.S1', d=[P(NB,'parts and wholes of real objects and groups, named in words (not yet a bond)', band=5)], v='partial',
   m='identifying the parts and the whole of a group in words', b=['part_whole'])
st('Y1.B2.S2', d=[F(NB, band=10), P(NFA,'the part-whole diagram itself')])
st('Y1.B2.S3', d=[P(A5,'writing the number sentence for a picture'), P(S5,'writing the number sentence for a picture')], v='partial',
   m='writing the + / − sentence that matches a picture (the skills give the sentence)', b=['pictures_to_sentence'])
st('Y1.B2.S4', d=[F(FF), F(NFA)], n='Addition facts of a family (two orders).')
st('Y1.B2.S5', d=[F(NB, band=10)])
st('Y1.B2.S6', v='gap', m='listing bonds of a number in order (0 + 5, 1 + 4 ...) and seeing the pattern', b=['systematic_bonds'], r=[(NB,'single bonds')])
st('Y1.B2.S7', d=[F(NB, band=10, unknown='second'), F(MT, band=10)])
st('Y1.B2.S8', d=[F(A5), F(A10)])
st('Y1.B2.S9', d=[F(AWP, band=10), F(NLA)])
st('Y1.B2.S10', d=[F(AWP, band=10), F(AWPP, band=10)])
st('Y1.B2.S11', d=[F(NB, band=10, unknown='first')])
st('Y1.B2.S12', d=[F(NB, band=10, unknown='second'), F(MAS)])
st('Y1.B2.S13', d=[F(FF), F(NFA), F(FFS)])
st('Y1.B2.S14', d=[F(S5)], v='partial', m='crossing out to take away from amounts 6 to 10 (the pictures skill stops at 5)', b=['pictures_change_unknown'],
   r=[(SWP,'take-away stories with a picture row')], n='Proposal pictures_change_unknown also lifts the pictures band to 10.')
st('Y1.B2.S15', d=[F(S10), F(SWP)])
st('Y1.B2.S16', d=[F(NLS), F(NLS2)])
st('Y1.B2.S17', d=[P(A10,'adding or subtracting only 1 or 2 (counting on or back by 1 or 2)')], v='partial', m='+1, +2, −1, −2 as a fluency set', b=['add_sub_1_2'])
# Y1.B3 Shape
st('Y1.B3.S1', d=[F(N3D), F(M3D)])
st('Y1.B3.S2', v='gap', m='sorting 3-D shapes by a rule (rolls / stacks, faces)', b=['shape_sort'], r=[(N3D,'naming first')])
st('Y1.B3.S3', d=[F(N2D), F(M2D)])
st('Y1.B3.S4', d=[P(CFA,'sorting into groups by a rule; the skill selects by one property')], v='partial', m='sorting 2-D shapes into groups', b=['shape_sort'])
st('Y1.B3.S5', d=[P(SP,'patterns of 3-D shapes (the skill draws 2-D shapes only)')], v='partial', m='repeating patterns made of 3-D shapes', b=['pattern_make'])
# Y1.B4 Place value within 20
st('Y1.B4.S1', d=[F(CO, band=20)])
st('Y1.B4.S2', d=[P(TFB,'10 as one ten (a full frame is one ten)', band=10)], v='partial', m='10 as one ten', b=['teen_structure'])
st('Y1.B4.S3', d=[F(TC, band=15), F(TFT, band=15)])
st('Y1.B4.S4', d=[F(TC, band=19), F(TFT, band=19)])
st('Y1.B4.S5', d=[F(TC, band=19), F(TFT, band=19)])
st('Y1.B4.S6', d=[P(TFT,'20 as two full tens')], v='partial', m='20 as two tens', b=['teen_structure'])
st('Y1.B4.S7', d=[F(CS, band=20), F(ML10, step=1, band=20)])
st('Y1.B4.S8', v='gap', m='the 0-20 number line: reading and labelling ticks', b=['nl_20'], r=[(NLA,'jumps on a line to 20')])
st('Y1.B4.S9', d=[P(NLA,'using the line to count on and back (the skill is addition only)'), P(NLS2,'counting back on the line')], v='partial',
   m='finding and placing numbers on a 0-20 line', b=['nl_20'])
st('Y1.B4.S10', v='gap', m='estimating where a number lies on a 0-20 line with only the ends marked', b=['nl_20'])
st('Y1.B4.S11', d=[P(PVC,'numbers within 20 (the lowest band is 99)')], v='partial', m='comparing numbers within 20', b=['compare_small'])
st('Y1.B4.S12', d=[P(OLG,'numbers within 20')], v='partial', m='ordering numbers within 20', b=['compare_small'], r=[(OGL,'reverse order')])
# Y1.B5 Add and subtract within 20
st('Y1.B5.S1', d=[F(A20), F(NLA)])
st('Y1.B5.S2', d=[F(A10R), F(MAT)])
st('Y1.B5.S3', d=[P(MT,'bonds to 20 (make 20 fills a second ten frame; bonds like 13 + 7)', band=20)], v='partial', m='all bonds to 20', b=['bonds_20'])
st('Y1.B5.S4', d=[F(DND, forms=[0])])
st('Y1.B5.S5', d=[F(DND)])
st('Y1.B5.S6', d=[F(S10R), P(MAT,'subtracting through 10 using bonds')])
st('Y1.B5.S7', d=[F(NLS), F(NLS2)])
st('Y1.B5.S8', d=[P(CMPW,'finding the difference by comparing two bars or a number line')], v='partial', m='difference as comparison (bars, line)', b=['difference'])
st('Y1.B5.S9', d=[F(FF), F(NFA)])
st('Y1.B5.S10', d=[F(CLZ), F(MAS)])
# Y1.B6 Place value within 50
st('Y1.B6.S1', d=[F(NSF, step=1), F(HCF)])
st('Y1.B6.S2', d=[F(TFV, band=50), F(SEQ10)])
st('Y1.B6.S3', d=[P(TFV,'counting a large set by making groups of ten', band=50)], v='partial', m='grouping a loose set into tens to count it', b=['tens_ones_group'])
st('Y1.B6.S4', d=[F(B10, band=50)])
st('Y1.B6.S5', d=[F(B10, band=50), F(UF)])
st('Y1.B6.S6', d=[P(PNL,'a whole 0-50 line counted in tens then ones (the skill shows one ten to the next)')], v='partial', m='the 0-50 line', b=['nl_20'])
st('Y1.B6.S7', d=[P(PNL,'estimating on a line with only the ends marked')], v='partial', m='estimating on a 0-50 line', b=['nl_20'])
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
st('Y1.B9.S1', d=[F(SEQ2), F(SKL)])
st('Y1.B9.S2', d=[F(SEQ10), F(NSF, step=10)])
st('Y1.B9.S3', d=[F(SEQ5), F(NSF, step=5)])
st('Y1.B9.S4', d=[F(EQG)])
st('Y1.B9.S5', d=[F(ARR), F(RAM)])
st('Y1.B9.S6', d=[F(ARR), F(DAM)])
st('Y1.B9.S7', d=[F(DBL), F(DND, forms=[0])])
st('Y1.B9.S8', d=[F(SHG, band=12)])
st('Y1.B9.S9', d=[P(SHG,'sharing one at a time between a given number of groups (how many in each)', band=12)], v='partial', m='sharing (how many each)', b=['share_group'])
# Y1.B10 Fractions
st('Y1.B10.S1', d=[F(PART)])
st('Y1.B10.S2', d=[F(SHF)], n='Denominator 2.')
st('Y1.B10.S3', d=[P(FOS,'recognising whether a set is split into two equal groups')], v='partial', m='is this set in halves? (equal / not equal)', b=['half_quarter'])
st('Y1.B10.S4', d=[F(FOS), F(HALF)])
st('Y1.B10.S5', d=[F(PART)])
st('Y1.B10.S6', d=[F(SHF)], n='Denominator 4.')
st('Y1.B10.S7', d=[P(FOS,'recognising a set split into four equal groups')], v='partial', m='is this set in quarters?', b=['half_quarter'])
st('Y1.B10.S8', d=[F(FOS)])
# Y1.B11 Position and direction
st('Y1.B11.S1', v='gap', m='whole, half and quarter turns', b=['turns'])
st('Y1.B11.S2', d=[P(POS,'left and right (the skill does above / below / beside)')], v='partial', m='left and right', b=['position_map'])
st('Y1.B11.S3', v='gap', m='forwards and backwards moves', b=['position_map'], r=[(POS,'position words')])
st('Y1.B11.S4', d=[F(POS)])
st('Y1.B11.S5', v='gap', m='ordinal numbers 1st, 2nd, 3rd ...', b=['ordinal'], r=[(CS,'counting order')])
# Y1.B12 Place value within 100
st('Y1.B12.S1', d=[F(NSF, step=1), F(HCF)])
st('Y1.B12.S2', d=[F(TFV, band=90), F(SEQ10)], n='To 90 tens; 100 itself is said orally.')
st('Y1.B12.S3', d=[F(B10, band=99), F(UF)])
st('Y1.B12.S4', d=[P(PNL,'a whole 0-100 line counted in tens then ones')], v='partial', m='the 0-100 line', b=['nl_20'])
st('Y1.B12.S5', d=[F(ML10, step=1, band=100)])
st('Y1.B12.S6', d=[F(PVC, band=99)])
st('Y1.B12.S7', d=[F(PVC, band=99)])
# Y1.B13 Money
st('Y1.B13.S1', d=[F(COIN)], n='Unitising: one coin can stand for several ones.')
st('Y1.B13.S2', d=[F(COIN)])
st('Y1.B13.S3', d=[P(COIN,'notes / bills')], v='partial', m='recognising notes (bills)', b=['money_notes'])
st('Y1.B13.S4', d=[F(MON)])
# Y1.B14 Time
st('Y1.B14.S1', v='gap', m='before and after; sequencing events', b=['day_order'])
st('Y1.B14.S2', v='gap', m='days of the week in order', b=['time_talk'])
st('Y1.B14.S3', v='gap', m='months of the year in order', b=['time_talk'])
st('Y1.B14.S4', v='gap', m='choosing hours, minutes or seconds for an activity', b=['time_units'], r=[(CLK,'parts of a clock')])
st('Y1.B14.S5', d=[F(TH)], r=[(CLK,'parts of a clock')])
st('Y1.B14.S6', d=[F(THH)])

NEW = {
 'doubles_pictured': dict(kind='option', skill='number_sense:doubles_near_doubles', option='pictures and band 8 / 10',
   name='Doubles with Pictures (option)', teaches='finding and making a double with objects: two equal groups, totals to 8 and to 10',
   representation='two identical rows of counters (or a ten frame split in two) in one boxed cell; write the total; option: draw the matching group to make a double',
   family='algebra', ccss=['K.OA.A.1'], why='doubles_near_doubles deals abstract doubles up to 10 + 10; Reception finds and builds doubles from pictures'),
 'bonds_3_parts': dict(kind='option', skill='composing:number_bonds', option='parts: 3',
   name='Bonds to 10 in Three Parts (option)', teaches='a whole of 10 split into three parts (2, 3 and 5)',
   representation='a part-whole diagram with one whole and three part circles; write the missing part',
   family='counting', ccss=['K.OA.A.3'], why='number_bonds has two parts only; add_three is an addition fact, not a part-whole'),
 'pictures_change_unknown': dict(kind='option', skill='addition:add_5_pictures', option='unknown: change; band to 10',
   name='How Many Were Added / Taken Away? (option)', teaches='change-unknown stories with pictures: how many were added or taken away, totals to 10; also lifts the pictures band to 10',
   representation='a before box and an after box of counters in one cell; write how many were added (or crossed out); applies to subtraction:sub_5_pictures too',
   family='operations', ccss=['K.OA.A.2','K.OA.A.1'], why='the picture skills ask only for the result and stop at 5'),
}
