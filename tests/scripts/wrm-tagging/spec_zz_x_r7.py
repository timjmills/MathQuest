# Round 7 after critic Y4 r6 (30 links on 25 steps the r6 linkfit could not see). Links only.
_by = {s['id']: s for s in STEPS}
def _base(k): return k.split('{')[0].split('@')[0]
def drop(sid, role, *keys): _by[sid][role] = [e for e in _by[sid][role] if _base(e[0]) not in keys]
def relink(sid, role, key, new, ref=None, kind='X'):
    lst = _by[sid][role]; hit = False
    for i, e in enumerate(lst):
        if _base(e[0]) == key:
            lst[i] = ((new, ref, kind) if role == 'pre' else (new, ref)) if ref else (new,) + tuple(e[1:]); hit = True
    assert hit, (sid, role, key)
def add(sid, role, *items): _by[sid][role] = list(_by[sid][role]) + list(items)

# A. size / content the r6 check could not read (dual answers, visuals, °F, answers, 8 items)
for sid in ('Y4.B6.S3', 'Y4.B6.S4'):
    for role in ('pre', 'related'):
        if any(_base(e[0]) == 'area_perimeter:area_perimeter' for e in _by[sid][role]):
            relink(sid, role, 'area_perimeter:area_perimeter', 'area_perimeter:area_perimeter{"band":20}')
relink('Y4.B13.S3', 'related', 'measurement:temperature', 'measurement:temperature{"forms":[1]}')   # °C only
drop('Y4.B9.S6', 'related', 'conversions:order_fdp')                                                  # unlike fractions and percents
drop('Y4.B7.S15', 'related', 'fraction_operations:estimate_frac_ops')                                 # unlike denominators, negative keys
for sid in ('Y4.B1.S16', 'Y4.B1.S17', 'Y4.B2.S3'):
    for role in ('pre', 'related'):
        _by[sid][role] = [e for e in _by[sid][role] if not (_base(e[0]) == 'number_sense:estimate_sums_diffs' and '"place":1000' in e[0] and 'reasonable' not in e[0])]   # 5-digit sums; `range` has no effect
# B. later-grade concepts
for sid in ('Y4.B3.S1', 'Y4.B3.S2', 'Y4.B3.S4', 'Y4.B6.S4'): drop(sid, 'related', 'area_perimeter:area')   # triangles on 6 of 16 items; no rectangle-only option
for sid in ('Y4.B8.S7', 'Y4.B8.S8', 'Y4.B9.S2', 'Y4.B9.S8'): drop(sid, 'related', 'conversions:percent_visual')
drop('Y4.B7.S10', 'related', 'fractions:simplify', 'conversions:ratio_tables')
drop('Y4.B5.S3', 'related', 'multiplication:mult_placeholder_zero')                                   # 2-digit × 2-digit long multiplication
for sid in ('Y4.B12.S7', 'Y4.B12.S8'): drop(sid, 'related', 'coordinates:geo_reflect')                # reflection in an axis; axes are W37-38
drop('Y4.B5.S1', 'related', 'number_theory:prime_composite')
for sid in ('Y4.B9.S3', 'Y4.B9.S4'): relink(sid, 'related', 'decimals:add_decimal', 'decimals:add_decimal{"decimals":1,"range":100}@10')
# C. chart rows that deal untaught tables
for sid, n in (('Y4.B4.S3', 6), ('Y4.B4.S5', 9), ('Y4.B4.S8', 7)):
    relink(sid, 'related', 'multiplication:mult_chart', f'multiplication:mult_chart{{"task":"fill","constant":[{n}]}}')
for sid in ('Y4.B4.S3', 'Y4.B4.S5'): drop(sid, 'related', 'multiplication:mult_chart_easy')
relink('Y4.B4.S11', 'related', 'multiplication:mult_chart', 'multiplication:mult_chart{"task":"fill","constant":[1]}', 'the 1 row of the chart: n × 1 = n')
# D. a halves-and-quarters step
relink('Y4.B9.S8', 'pre', 'fractions:equiv_frac_visual', 'fractions:equivalent{"denoms":[2]}', 'Y2.B8.S12', 'X')
# Labels and pre built only from met learning
for i, e in enumerate(_by['Y4.B13.S4']['pre']):
    if _base(e[0]) == 'coordinates:coordinate_q1': _by['Y4.B13.S4']['pre'][i] = (e[0], 'Y4.B14.S1', 'X')   # taught the same week, W37
add('Y4.B12.S6', 'pre', ('shapes_early:count_sides_vertices_2d', 'Y2/Gr.1 Count sides and vertices on 2D shapes (prior learning list; counting the sides names the polygon)', 'X'))
_rel = [e for e in _by['Y4.B14.S3']['related'] if _base(e[0]) == 'area_perimeter:perimeter_grid']
drop('Y4.B14.S3', 'related', 'area_perimeter:perimeter_grid')
add('Y4.B14.S3', 'pre', ('area_perimeter:perimeter_grid', 'Y4.B6.S3', 'X'))                          # shapes drawn on a squared grid, W19
for i, e in enumerate(_by['Y4.B12.S8']['related']):
    if _base(e[0]) == 'coordinates:coordinate_q1': _by['Y4.B12.S8']['related'][i] = (e[0], 'a later step (W38): positions on a grid named by coordinates')
add('Y4.B7.S10', 'related', ('composing:fraction_number_line', 'equivalent fractions name the same point on a number line'))
add('Y4.B7.S15', 'related', ('fractions:mixed_nl_drag', 'mixed numbers on a 0-3 line: subtracting is counting back along it'))

# Found by the closed linkfit (G1-G6) and rule 19 (content met by the step's school week)
drop('Y4.B1.S15', 'related', 'number_sense:estimate_sums_diffs')     # 973 + 610 ≈ 1,600: past the step; `range` has no effect
drop('Y4.B10.S4', 'pre', 'number_sense:estimate_sums_diffs')
drop('Y4.B3.S3', 'related', 'area_perimeter:composite_shapes')       # areas to 175
drop('Y4.B4.S2', 'related', 'multiplication:nl_mult')                # 9 × 9 in W01 (the 9s are W02)
relink('Y4.B4.S8', 'related', 'division:div_word_problems', 'division:div_word_problems{"range":100}')
drop('Y4.B4.S8', 'related', 'multiplication:mult_chart_easy')
drop('Y4.B5.S1', 'related', 'number_theory:multiples')               # multiples of 11 to 132; no table option
drop('Y4.B5.S14', 'related', 'algebra:multi_step_word'); drop('Y4.B10.S6', 'related', 'algebra:multi_step_word', 'number_ops_mixed:word_problems_mixed_plain')
drop('Y4.B7.S12', 'related', 'fractions:round_fractions')           # decimal keys in W10
for sid in ('Y4.B14.S4', 'Y4.B14.S5'): drop(sid, 'related', 'coordinates:geo_reflect')   # reflection in an axis (WRM Y6)
drop('Y4.B12.S6', 'pre', 'shapes_classify:classify_quads')           # rule 19: Quadrilaterals is W28, Polygons W27
drop('Y4.B14.S3', 'pre', 'coordinates:coordinate_q1')                # rule 19: coordinates are W37-W38, this step W29
add('Y4.B12.S6', 'pre', ('angles_lines:identify_lines', 'Y3.B11.S5', 'X'))   # parallel and perpendicular sides describe a polygon (count_sides is the step's own partial)
add('Y4.B14.S4', 'related', ('area_perimeter:perimeter_grid', 'shapes drawn on the same squared grid, counted square by square'))
for sid in ('Y4.B4.S1', 'Y4.B4.S2', 'Y4.B4.S7'): drop(sid, 'related', 'number_theory:multiples')   # multiples of 11 to 132; no table option
drop('Y4.B4.S1', 'related', 'patterns:skip_count_line')                                           # counts in 100s to 1,600
for i, e in enumerate(_by['Y4.B11.S1']['pre']):
    if _base(e[0]) == 'multiplication:count_by_tables': _by['Y4.B11.S1']['pre'][i] = (e[0], 'Y4.B4.S10', 'X')   # the 12s are taught W03
add('Y4.B4.S1', 'related', ('multiplication:mult_chart{"task":"fill","constant":[3]}', 'the 3 row of the chart: the multiples written as products'))

# The critic's scan6 / scan7 / full.mjs: denominators past 12, degrees in the visual, the last size margins
for sid in ('Y4.B7.S6', 'Y4.B7.S7', 'Y4.B7.S8'):
    relink(sid, 'pre', 'fractions:equiv_frac_visual', 'fractions:select_equiv_frac')        # 3rds-8ths; equiv_frac_visual deals 15ths-24ths and ignores denoms
relink('Y4.B7.S10', 'pre', 'fractions:equiv_frac_visual', 'fractions:equivalent{"denoms":[2],"forms":[0]}')
relink('Y4.B7.S9', 'related', 'fractions:equiv_frac_nv', 'fractions:equiv_frac_nv{"denoms":[2,3]}')
relink('Y4.B9.S8', 'pre', 'fractions:equivalent', 'fractions:equivalent{"denoms":[2],"forms":[0]}')   # halves and quarters only (no 16ths)
for sid in STEPS:
    for role in ('pre', 'related'):
        sid[role] = [(('angles_lines:identify_angles{"labels":"none"}' if e[0] == 'angles_lines:identify_angles' else e[0]),) + tuple(e[1:]) for e in sid[role]]   # degrees are WRM Y5
drop('Y4.B13.S3', 'related', 'measurement:temperature')
add('Y4.B13.S3', 'related', ('graphs:bar_graph{"forms":[2,3]}', 'reading change and difference from a chart, the questions a line graph asks'))
drop('Y4.B2.S10', 'pre', 'number_sense:estimate_sums_diffs')        # the "reasonable?" decoys print 6-digit sums (110,420) in W16
for sid in ('Y4.B6.S5', 'Y4.B6.S6', 'Y4.B6.S7'):
    for role in ('pre', 'related'):
        if any(_base(e[0]) == 'area_perimeter:area_polygon_decompose' for e in _by[sid][role]):
            relink(sid, role, 'area_perimeter:area_polygon_decompose', 'area_perimeter:area_polygon_decompose{"band":50}')
drop('Y4.B7.S8', 'related', 'division:remainder_interpret')
# identify_angles prints a degree key ("Right = 90°, Obtuse 90°-180°") in its visual even with labels "none" (generator
# defect, report): it cannot be a link until that is fixed; perpendicular lines carry the right angle instead.
for sid in ('Y4.B12.S1', 'Y4.B12.S4', 'Y4.B12.S5', 'Y4.B12.S6'): drop(sid, 'pre', 'angles_lines:identify_angles')
add('Y4.B12.S1', 'pre', ('angles_lines:identify_lines', 'Y3.B11.S5', 'X'))
_by['Y4.B12.S6']['note'] = (_by['Y4.B12.S6'].get('note', '') + ' Pre-skills are few: Polygons (W27) comes before Quadrilaterals (W28) and '
    'Triangles in the school order, and the Identify angles skill prints degrees (a display defect), so naming shapes and '
    'parallel and perpendicular lines are the met building blocks.').strip()
drop('Y4.B13.S3', 'related', 'graphs:bar_graph')
add('Y4.B13.S3', 'related', ('graphs:tally_chart', 'the table of values a line graph is drawn from'))
add('Y4.B7.S8', 'related', ('composing:whole_as_fraction', '4/4 = 1 whole: the groups an improper fraction is split into'))
# Rule 19: hundredths are first taught W31 (B8.S7); tenths steps (W29-W30) link tenths-only
drop('Y4.B1.S17', 'related', 'number_sense:mixed_number_sense')      # its pool rounds hundredths
for sid, role in (('Y4.B8.S1', 'related'), ('Y4.B8.S4', 'pre'), ('Y4.B8.S5', 'pre')):
    relink(sid, role, 'conversions:d_to_f', 'conversions:d_to_f{"forms":[0]}')
drop('Y4.B8.S1', 'related', 'fraction_operations:frac_10_100')
drop('Y4.B8.S5', 'pre', 'conversions:f_to_d')
relink('Y4.B8.S3', 'pre', 'conversions:f_to_d', 'conversions:d_to_f{"forms":[0]}', 'Y4.B8.S2', 'X')
# d_to_f deals quarters as 0.25 / 0.75 even on its one-decimal form: no tenths-only conversion skill exists before W31
for sid in ('Y4.B8.S3', 'Y4.B8.S4', 'Y4.B8.S5'): drop(sid, 'pre', 'conversions:d_to_f')
relink('Y4.B8.S1', 'related', 'conversions:d_to_f', 'decimals:decimal_nl_drag{"ticks":"some"}', 'the same tenths placed on a 0-1 line (the next steps)')
add('Y4.B1.S17', 'related', ('number_sense:round_sort_100', 'sorting numbers by the hundred they round to'))
