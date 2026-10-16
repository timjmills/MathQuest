# Round 3 after critic Y4 r2 (FAIL 7.57): R10, the S3 over-claims, owner rulings, smaller fixes.
# Every changed step was re-judged from GENERATED items (design/audit/runs/wrm-tagging/Y4-items.md).
_by = {s['id']: s for s in STEPS}
def P(sid, **k): _by[sid].update(k)
def drop_pre(sid, *keys): _by[sid]['pre'] = [p for p in _by[sid].get('pre', []) if p[0].split('{')[0] not in keys]
def drop_rel(sid, *keys): _by[sid]['related'] = [p for p in _by[sid].get('related', []) if p[0].split('{')[0] not in keys]
def add_rel(sid, *items): _by[sid]['related'] = list(_by[sid].get('related', [])) + list(items)
def add_pre(sid, *items, first=False):
    _by[sid]['pre'] = (list(items) + list(_by[sid].get('pre', []))) if first else (list(_by[sid].get('pre', [])) + list(items))
HAND_WHY = {}

# ── S3: mult_div_fact_family has no table option (generated: 12 × 9, 5 × 10, 11 × 2, 8 × 2) ─────────────
for sid, n in (('Y4.B4.S3', 6), ('Y4.B4.S5', 9), ('Y4.B4.S8', 7), ('Y4.B4.S9', 11), ('Y4.B4.S10', 12)):
    P(sid, direct=[d for d in _by[sid]['direct'] if not d.startswith('multiplication:mult_div_fact_family')])
    add_rel(sid, ('multiplication:mult_div_fact_family', f'the same facts as a family of four (× and ÷ both ways); no table option, so it deals any table, not only the {n}s'))
    _by[sid]['note'] = (f'Direct: mult_facts and div_facts with constant [{n}] (generated: every item is a {n}× or ÷{n} fact). '
                        'mult_div_fact_family moved to related: it has no table option (generated 12 × 9, 5 × 10, 11 × 2).')
for sid in ('Y4.B4.S9', 'Y4.B4.S10'):
    _by[sid]['note'] += (' The 11 and 12 tables go beyond CCSS 3.OA.C.7 (within 100); WRM teaches them in Y4. The owner\'s '
                         'tables_to_15 build (13-15 tables) is the next step up; no Y4 step asks for it.')
    drop_pre(sid, 'placevalue:expand')
drop_pre('Y4.B4.S7', 'placevalue:expand'); drop_pre('Y4.B4.S8', 'placevalue:expand')

# ── S3: improper_mixed deals both directions on one page (owner: YES to a one-direction option) ──────
NEW_PROPOSALS['improper_mixed_dir'] = dict(kind='option', skill='fractions:improper_mixed', option='dir: "to-improper" | "to-mixed" | "both" (default both)',
    name='Mixed to Improper, or Improper to Mixed (option)',
    teaches='one conversion direction per page: mixed number → improper fraction (2 3/4 = 11/4) or improper fraction → mixed number (11/4 = 2 3/4)',
    representation='the existing cell: the number to convert, fraction counters ringed into wholes beside it (hint, fades), one fraction answer slot',
    family='fractions', ccss=['3.NF.A.1', '4.NF.B.3b'], why='owner ruling 2026-10-10; generated improper_mixed {} deals "improper AND mixed", "click all equal to 2 3/6" and "convert to a mixed number" on one page')
P('Y4.B7.S7', direct=[], partial=[('fractions:improper_mixed', 'generated items mix both directions and the "write it both ways" picture item ("Convert to a mixed number", "Click ALL fractions equal to 2 1/2"); a page cannot be held to mixed → improper')],
  verdict='partial', missing='a page of mixed number → improper fraction only', build=['improper_mixed_dir'],
  note='Generated improper_mixed {}: both directions on one page. Owner said yes to a one-direction option.')
P('Y4.B7.S8', direct=[], partial=[('fractions:improper_mixed', 'generated items mix both directions ("write as an improper fraction AND a mixed number", "Click ALL fractions equal to 2 3/6"); a page cannot be held to improper → mixed')],
  verdict='partial', missing='a page of improper fraction → mixed number only (11/4 = 2 3/4, by grouping into wholes or dividing)', build=['improper_mixed_dir'],
  note='Generated improper_mixed {}: both directions on one page. Owner said yes to a one-direction option.')

# ── S3: B8.S4 ticks "one" labels every tick but the answer's; lines stop at 1 ───────────────────────────
NEW_PROPOSALS['dec_nl_past_1'] = dict(kind='option', skill='decimals:decimal_nl_drag', option='span "0-2" and "n to n+1" (e.g. 3-4); form "write the decimal at the arrow"',
    name='Tenths on Number Lines Past 1 (option)',
    teaches='placing and reading tenths on lines that go past 1 (0-2, 3-4): mark 1.7, write the decimal at the arrow (3.4)',
    representation='the existing nl-place line with 0, the halfway and the end labelled; one answer box under the arrow for the read form',
    family='decimals', ccss=['3.NF.A.2', '4.NF.C.6'], why='generated decimal_nl_drag deals 0-1 lines only and only the place form; WRM tenths lines run past 1 and ask for the number at a point')
P('Y4.B8.S4', direct=[], partial=[('decimals:decimal_nl_drag{"ticks":"some"}', 'generated: places a tenth on a 0-1 line with 0, 0.5 and 1 labelled (0.9, 0.2, 0.6); never a line past 1 and never reads the decimal at a marked point')],
  verdict='partial', missing='tenths on lines past 1 (0-2, 3-4) and writing the decimal at a marked point',
  build=['dec_nl_past_1'],
  note='ticks "one" labels every tenth except the answer, which gives it away; "some" (0, 0.5, 1) is the honest page.')

# ── S2: coordinate_q1 forms ───────────────────────────────────────────────────────────────────────────
_PRINT_BUG = (' DEFECT for the lead: the forms filter is honoured in live play, but generateQuestionFor with itemIndex (the print '
              'path, print-sheet.js) deals the other form too (3 of 8 items), because the page deal gives the same variant on every '
              'redraw of one item. Not a tagging question; reported in Y4-report.md.')
P('Y4.B14.S1', direct=['coordinates:coordinate_q1{"forms":[0]}'],
  note='forms [0] "Read the coordinates": generated without itemIndex, every item asks for the coordinates of drawn points.' + _PRINT_BUG)
P('Y4.B14.S2', direct=['coordinates:coordinate_q1{"forms":[1]}'],
  note='forms [1] "Plot the points": generated without itemIndex, every item plots given points.' + _PRINT_BUG)
add_pre('Y4.B14.S2', ('coordinates:coordinate_q1{"forms":[0]}', 'Y4.B14.S1', 'B'), first=True)
drop_rel('Y4.B14.S2', 'coordinates:coordinate_q1')

# ── S3: B6.S9 perimeter_intro deals triangles, rectangles and squares only ─────────────────────────────
P('Y4.B6.S9', direct=[], partial=[('area_perimeter:perimeter_intro', 'generated: triangles, rectangles and squares only (7 + 7 + 5, 9 + 8 + 9 + 8); no pentagon, hexagon or irregular polygon')],
  verdict='partial', missing='perimeter of polygons with 5 or more sides, regular and irregular, from their side lengths',
  build=['regular_polygon'])
add_pre('Y4.B6.S9', ('area_perimeter:perimeter{"forms":[0]}', 'Y3.B5.S12', 'P'), ('area_perimeter:perimeter_intro{"labels":"some"}', 'Y4.B6.S8', 'B'), first=True)
drop_rel('Y4.B6.S9', 'area_perimeter:perimeter')
drop_pre('Y4.B6.S9', 'addition:add_column_multi')
add_pre('Y4.B6.S9', ('addition:add_three', 'adding several side lengths in turn (Grade 1, 1.OA.A.2)', 'X'))

# ── S3: decimals options already built; dec_compare_2dp / dec_order_2dp dropped ───────────────────────
NEW_PROPOSALS['dec_same_whole'] = dict(kind='option', skill='decimals:compare_decimal', option='items "same whole part" (also on decimals:order_decimals)',
    name='Decimals With the Same Whole Part (option)',
    teaches='comparing and ordering decimals that share the whole-number part, with 1 and 2 places mixed (0.4 vs 0.38; 3.6, 3.65, 3.06), so the tenths digit decides',
    representation='the existing compare / order cell; a ones . tenths hundredths column header over the numbers (hint, fades)',
    family='decimals', ccss=['4.NF.C.7'], why='generated compare_decimal / order_decimals {decimals:2} at Max Number 10: whole parts differ on nearly every compare item (8.23 vs 9.92), and every number has exactly two places, so 0.4 vs 0.38 (the length misconception) never comes up')
P('Y4.B9.S5', partial=[('decimals:compare_decimal{"decimals":2,"forms":[0]}@10', 'generated: hundredths below 10 compared with < > (8.23 vs 9.92, 9.29 vs 1.42); the whole parts differ on nearly every item, so the decimal places seldom decide; no same-whole pair with 1 and 2 places (0.4 vs 0.38) and no hundred-square model')],
  verdict='partial', missing='comparing decimals with the same whole part (0.4 vs 0.38), reasoning with hundred squares',
  build=['dec_same_whole', 'dec_compare_model'],
  note='decimals 2 and Max Number 10 (maxNumber) hold the page to hundredths below 10: the old "cannot be held" reason was wrong. maxNumber is the generateQuestionFor range, not the skill\'s own range option.')
P('Y4.B9.S6', partial=[('decimals:order_decimals{"decimals":2}@10', 'generated: 3-6 decimals below 10 ordered both ways (9.92, 9.26, 8.23, 7.33 …); every number has exactly two places, so 1 and 2 places are never mixed (3.6, 3.65, 3.06), and same-whole sets come only by chance')],
  verdict='partial', missing='ordering decimals that share the whole part with 1 and 2 places mixed (3.6, 3.65, 3.06)',
  build=['dec_same_whole'],
  note='decimals 2 and Max Number 10 hold the page to hundredths below 10.')
drop_rel('Y4.B9.S5', 'decimals:order_decimals'); add_rel('Y4.B9.S5', ('decimals:order_decimals{"decimals":2}', 'the next step: the same comparison made three or more times to order'))
HAND_WHY[('decimals:order_decimals', 'Y4.B9.S6')] = 'with decimals 2 and Max Number 10 the page is held to hundredths; partial because every number has exactly two places (no 3.6 vs 3.65)'
HAND_WHY[('decimals:compare_decimal', 'Y4.B9.S5')] = 'with decimals 2, forms [0] and Max Number 10 the page is held to hundredths; partial because no same-whole items and no model'

# ── S3: B11.S2 unit_conversion_word {units:[0]} converts h → min → s (time_convert already built) ───────
P('Y4.B11.S2', partial=[('measurement:unit_conversion_word{"units":[0]}', 'generated: hours → minutes, minutes → seconds and hours → seconds word problems (4 min = 240 s, 2 hr = 120 min); never seconds → minutes, mixed units (1 min 20 s) or comparing durations')],
  verdict='partial', missing='converting from the smaller unit to the larger (180 s = 3 min), mixed units (1 min 20 s = 80 s) and comparing durations in different units',
  build=['time_calendar'], preBuild=['time_units'],
  note='time_convert is already built: unit_conversion_word {units:[0]} is the time-only page.')
drop_rel('Y4.B11.S2', 'measurement:unit_conversion_word')
add_rel('Y4.B11.S2', ('measurement:unit_conversion_word{"units":[1]}', 'the same conversion routine with lengths (multiply by the unit size)'))

# ── Owner: ONE roman_numerals proposal, bands 12 / 100 / 1,000 / 3,999, read and write ─────────────────
NEW_PROPOSALS['roman_numerals'] = dict(kind='new', skill='placevalue:roman_numerals', option='band 12 | 100 | 1,000 | 3,999; direction read | write | both',
    name='Roman Numerals',
    teaches='reading and writing Roman numerals in four bands: to 12 (clock faces), to 100 (I V X L C), to 1,000 (D M) and to 3,999 (years); there is no zero',
    representation='one boxed cell: the numeral or the number, a symbol key (I = 1, V = 5 …) as a hint that fades, one answer box',
    family='placevalue', ccss=[], supersedes=['roman_12', 'roman_100', 'roman_1000'],
    why='owner ruling 2026-10-10: one skill with bands to 12 / 100 / 1,000 / 3,999 replaces roman_12, roman_100 and roman_1000')
P('Y4.B1.S13', build=['roman_numerals'], preBuild=[],
  missing='reading and writing Roman numerals to 100 (I, V, X, L, C)',
  note='Beyond CCSS (UK National Curriculum); taught as enrichment in W12. The prior learning "Y3 Roman numerals to 12" is band 12 of the same roman_numerals proposal, so it is not a separate preBuild.')

# ── Owner: the exchange-count option on EVERY regroup band ─────────────────────────────────────────────
_ADD_BANDS = ['addition:add_100_regroup', 'addition:add_1k_regroup', 'addition:add_10k_regroup', 'addition:add_100k_regroup', 'addition:add_1m_regroup']
_SUB_BANDS = ['subtraction:sub_100_regroup', 'subtraction:sub_1k_regroup', 'subtraction:sub_10k_regroup', 'subtraction:sub_100k_regroup', 'subtraction:sub_1m_regroup']
NEW_PROPOSALS['exchange_count_add'].update(skills=_ADD_BANDS, option='exchanges: exactly one / two or more (default mixed), on every addition regroup band (100, 1,000, 10,000, 100,000, 1,000,000)',
    why='owner ruling 2026-10-10: one shared option on every *_regroup band; WRM splits one exchange from several (P-1)')
NEW_PROPOSALS['exchange_count_sub'].update(skills=_SUB_BANDS, option='exchanges: exactly one / two or more (default mixed), on every subtraction regroup band (100, 1,000, 10,000, 100,000, 1,000,000)',
    why='owner ruling 2026-10-10: one shared option on every *_regroup band; WRM splits one exchange from several')

# ── R7: B2.S7 sub_across_zeros {band:10000} deals 3-digit minuends ─────────────────────────────────────
P('Y4.B2.S7', direct=[], partial=[
    ('subtraction:sub_10k_regroup', 'generated items mix one and several exchanges (5,710 − 2,907 has one, 4,266 − 2,398 three); a page cannot be held to two or more'),
    ('subtraction:sub_across_zeros{"band":10000}', 'generated: only exchanges across zeros, and half the items are 3-digit (900 − 205, 800 − 351, 801 − 427)')],
  missing='a page where every item is two 4-digit numbers with two or more exchanges, including numbers without zeros (5,342 − 2,868)')

# ── div10_small_numbers: the shift chart gains tenths and hundredths columns ─────────────────────────────
NEW_PROPOSALS['div10_small_numbers'].update(
    representation='the shift-chart cell with tenths and hundredths columns added (O . t h; today it shows H T O only on decimal items), arrows under the sliding digits, one decimal answer box with a fixed point',
    why='generated: place_value_10x {op:"/", power:[10], decimals:true} dealt 990 ÷ 10, 298 ÷ 10 = 29.8 (3-digit dividends, two whole answers) and drops to an H T O chart with no tenths column')

# ── Smaller fixes ──────────────────────────────────────────────────────────────────────────────────────
# B7.S4: fraction_number_line {} mostly deals 0-1 lines (generated: 2/5 shaded, 1/2 at the arrow) → related
P('Y4.B7.S4', direct=['fractions:mixed_nl_drag'],
  note='Generated mixed_nl_drag {}: mixed numbers and improper fractions placed on 0-3 lines with every whole labelled.')
add_rel('Y4.B7.S4', ('composing:fraction_number_line', 'reading a fraction at an arrow; mostly 0-1 lines, sometimes past 1 (3/2)'))
# B1.S10: place_on_number_line {span:1000} marks numbers between labelled thousands: a partial cover (gap → partial)
P('Y4.B1.S10', verdict='partial', partial=[('number_sense:place_on_number_line{"span":1000,"band":10000}', 'generated: marks 9,700 or 3,500 on a line between two labelled thousands (9,000-10,000); never a whole 0-10,000 line with only the ends labelled, never reads the number at an arrow')],
  missing='estimating on a 0-10,000 line with only the ends labelled (where is 6,500? what is at the arrow?)',
  note='')
add_pre('Y4.B1.S10', ('number_sense:place_on_number_line{"span":100,"band":1000}', 'Y3.B1.S11', 'P'))
# B1.S14: nearest_10 band 1,000 (generated 981 → 980, 295 → 300)
P('Y4.B1.S14', direct=['number_sense:rounding_visual{"place":10,"band":1000}', 'number_sense:nearest_10{"band":1000}'],
  note='Generated: rounding_visual {place:10, band:1000} and nearest_10 {band:1000} round 3-digit numbers (981 → 980, 295 → 300, 899 → 900).')
add_pre('Y4.B1.S14', ('number_sense:nearest_10', 'Y3.B1.S10', 'L'))
drop_pre('Y4.B1.S14', 'number_sense:place_on_number_line')
add_pre('Y4.B1.S14', ('number_sense:place_on_number_line{"span":100,"band":1000}', 'Y3.B1.S10', 'P'))
# B1.S8: more_less_10 step 0 is the legal "both 1 and 10" value
P('Y4.B1.S8', partial=[('placevalue:more_less_10{"step":0}', 'generated: 1 and 10 more or less, but only to 120 (99 + 1, 86 − 10); never a 4-digit number')])
# B3.S3 / B3.S4: drop the Y1 compare pre (noise)
drop_pre('Y4.B3.S3', 'placevalue:compare'); drop_pre('Y4.B3.S4', 'placevalue:compare')
add_pre('Y4.B3.S3', ('area_perimeter:area_unit_squares', 'Y4.B3.S2', 'B'))
# B13.S3: line_plot is a different chart
drop_rel('Y4.B13.S3', 'graphs:line_plot')
# critic's noise pre-skills
drop_pre('Y4.B1.S1', 'composing:teen_compose'); drop_pre('Y4.B2.S5', 'subtraction:sub_10_mixed')
drop_pre('Y4.B10.S1', 'number_sense:place_on_number_line'); drop_pre('Y4.B8.S10', 'subtraction:missing_add_sub')
# B10.S5: the two pre-skills whose why lacked the step title
P('Y4.B10.S5', pre=[(k if not k.endswith('{}') else k[:-2], r, 'P' if r in ('Y3.B9.S3', 'Y3.B9.S5') else kd) for k, r, kd in _by['Y4.B10.S5']['pre']])

# ── R10: a key is never in both pre and related. Keep it where it serves better (usually pre). ──────────
_KEEP_REL = {('Y4.B4.S4', 'number_theory:multiples')}   # mixes tables: a weak pre, a fair related
for st in STEPS:
    pk_ = {p[0].split('{')[0] for p in st.get('pre', [])}
    for r in list(st.get('related', [])):
        k = r[0].split('{')[0]
        if k in pk_:
            if (st['id'], k) in _KEEP_REL: drop_pre(st['id'], k)
            else: drop_rel(st['id'], k)
# steps whose related list R10 thinned: one real link each
add_rel('Y4.B8.S6', ('conversions:f_to_d', '34 ÷ 10 = 34/10 = 3.4: the same number as a fraction and a decimal'))
add_rel('Y4.B12.S2', ('shapes_classify:classify_quads', 'right angles name squares and rectangles'))
add_rel('Y4.B13.S4', ('graphs:bar_graph{"forms":[0,1]}', 'reading back the values a drawn graph shows'))
for st in STEPS:  # de-duplicate related (same key and opts)
    seen, out = set(), []
    for r in st.get('related', []):
        if r[0] in seen: continue
        seen.add(r[0]); out.append(r)
    st['related'] = out
for _s in ('Y4.B4.S3', 'Y4.B4.S5', 'Y4.B4.S8', 'Y4.B4.S9', 'Y4.B4.S10'):
    HAND_WHY[('multiplication:mult_div_fact_family', _s)] = 'no table option: generated families are any table (12 × 9, 5 × 10, 11 × 2); kept as a related skill'
HAND_WHY[('composing:fraction_number_line', 'Y4.B7.S4')] = 'generated items are mostly 0-1 lines (2/5 shaded, 1/2 at the arrow), seldom a mixed number; kept as a related skill'
HAND_WHY[('division:div_remainders', 'Y4.B5.S12')] = 'the step has no remainders (52 ÷ 4 = 13); div_remainders is the next idea, kept as a pre skill'
HAND_WHY[('fractions:improper_mixed', 'Y4.B7.S7')] = 'generated items mix both directions on one page; partial until the one-direction option (improper_mixed_dir)'
HAND_WHY[('fractions:improper_mixed', 'Y4.B7.S8')] = 'generated items mix both directions on one page; partial until the one-direction option (improper_mixed_dir)'
HAND_WHY[('decimals:decimal_nl_drag', 'Y4.B8.S4')] = 'ticks "some": tenths placed on 0-1 lines only, never past 1 or read at a point; partial until dec_nl_past_1'
HAND_WHY[('area_perimeter:perimeter_intro', 'Y4.B6.S9')] = 'generated: triangles, rectangles and squares only; no 5- or 6-sided polygons'
HAND_WHY[('division:area_model_div_2by1', 'Y4.B5.S11')] = 'mixes exchange and no-exchange items and 1-digit quotients; partial until div_exchange'
HAND_WHY[('division:area_model_div_2by1', 'Y4.B5.S12')] = 'mixes exchange and no-exchange items and 1-digit quotients; partial until div_exchange'
TAGFIXES[:] = [dict(t, why=HAND_WHY.get((t['key'], t['step']), t['why'])) for t in TAGFIXES]
for (k, s), w in HAND_WHY.items():
    if not any(t['key'] == k and t['step'] == s for t in TAGFIXES): TAGFIXES.append(dict(key=k, step=s, action='partial', why=w))
for _pid in ('dec_compare_2dp', 'dec_order_2dp'): NEW_PROPOSALS.pop(_pid, None)   # already built (decimals option 1/2)
# B5.S11 / S12: area_model_div_2by1 {} mixes no-exchange (99 ÷ 9, 93 ÷ 3), exchange (98 ÷ 7, 52 ÷ 4) and 1-digit
# quotients (64 ÷ 8, 48 ÷ 6): the method is right, the page is not held to the step → partial, not direct.
for _sid, _cl in (('Y4.B5.S11', 'no exchange'), ('Y4.B5.S12', 'an exchange of a ten')):
    _by[_sid]['direct'] = [d for d in _by[_sid].get('direct', []) if not d.startswith('division:area_model_div_2by1')]
    _by[_sid]['partial'] = [('division:area_model_div_2by1', f'the WRM partition picture, but generated items mix no exchange (93 ÷ 3), an exchange (52 ÷ 4) and 1-digit quotients (64 ÷ 8); a page cannot be held to {_cl}')] + list(_by[_sid].get('partial', []))
    _by[_sid]['note'] = 'Generated: area_model_div_2by1, divide {tiles:21} and box_division_easy all mix exchange and no-exchange items; div_exchange is one shared option on the three.'
NEW_PROPOSALS['div_exchange'].update(skills=['division:divide', 'division:area_model_div_2by1', 'division:box_division_easy'],
    option='exchange "none" / "in the tens" (no remainder), on divide (tiles 21, 31), area_model_div_2by1 and box_division_easy')

# ── Whole-file sweep (r3): every FULL step re-generated (print path: seeded, itemIndex) ───────────────
# B1.S17: rounding_table {} rounds 3-digit numbers to 10 or 100 only; places [10,100,1000] deals 4-digit numbers to all three
P('Y4.B1.S17', direct=['number_sense:rounding_table{"places":[10,100,1000],"blank":"row"}', 'number_sense:rounding_table{"places":[10,100,1000]}'],
  note='Generated: rounding_table {places:[10,100,1000], blank:"row"} rounds one 4-digit number to 10, 100 and 1,000 (6,745 → 6,750; 6,700; 7,000); the column form rounds four numbers to one place. rounding_table {} only reaches 10 and 100 on 3-digit numbers.')
add_rel('Y4.B1.S17', ('number_sense:round_nl_thousands', 'rounding to 1,000 shown on a number line'))
# B5.S13: box_division_hard {} gives remainders (195 ÷ 8 = 24 R 3); the step has none; regroup "none" = shares exactly
P('Y4.B5.S13', direct=['division:divide{"tiles":31}', 'division:box_division_hard{"regroup":"none"}', 'division:area_model_div_3by1'],
  note='Generated: divide {tiles:31} (775 ÷ 5 = 155), box_division_hard {regroup:"none"} (816 ÷ 4 = 204) and area_model_div_3by1 (215 ÷ 5 = 43): 3-digit ÷ 1-digit with no remainder. box_division_hard {} gives remainders (195 ÷ 8 = 24 R 3), which is Y5.')
# B7.S15: sub_mixed_like breaks a whole on some items (4 2/8 − 3 5/8); WRM keeps that for Y5.B4.S16
P('Y4.B7.S15', direct=[], partial=[
    ('fraction_operations:sub_mixed_like', 'generated: mixed − mixed with a bar model, but some items break a whole (4 2/8 − 3 5/8 = 5/8), which WRM keeps for Y5 (Y5.B4.S16); a page cannot be held to no exchange'),
    ('fraction_operations:sub_mixed_like_nv', 'generated: some items break a whole (9 1/5 − 6 4/5) or write a whole as 2/2 (4 1/2 − 1 2/2)')],
  verdict='partial', missing='a page of mixed-number subtractions with no exchange of a whole (3 4/5 − 1 2/5, 3 4/5 − 2/5)',
  build=['sub_break_whole'], preBuild=[],
  note='sub_break_whole is an option on sub_mixed_like ("breaking the whole"): set to never it gives this step, set to always it gives Y5.B4.S16.')
# B7.S12: add_mixed_like adds two mixed numbers only; never a fraction to a mixed number (2 1/5 + 3/5)
P('Y4.B7.S12', direct=[], partial=[
    ('fraction_operations:add_mixed_like', 'generated: mixed + mixed only (3 3/4 + 1 2/4, 4 1/2 + 3 1/2) and "sums greater than 3"; never a proper fraction added to a mixed number'),
    ('fraction_operations:add_mixed_like_nv', 'generated: mixed + mixed and missing addends (2 2/6 + ? = 5 2/3); never fraction + mixed number')],
  verdict='partial', missing='adding a proper fraction to a mixed number (2 1/5 + 3/5, 1 3/4 + 2/4)', build=['frac_add_multi'])
# B14.S1 / S2: forms is not honoured on the print path → partial until it is (generated with itemIndex: 3 of 6 off-form)
NEW_PROPOSALS['coord_forms_fix'] = dict(kind='option', skill='coordinates:coordinate_q1', option='forms honoured on every page: read-only / plot-only as a pickVariant forms option (variantKey), not a redraw filter',
    name='Read Only or Plot Only, on Every Page (option fix)',
    teaches='a page of only reading coordinates of drawn points, or only plotting given points, on screen and on paper',
    representation='the existing first-quadrant grid cell; only the dealing changes',
    family='coordinates', ccss=['5.G.A.1', '5.G.A.2'],
    why='generated with itemIndex (the print path), coordinate_q1 {forms:[0]} still deals "Plot point A" on 3 of 6 items: the page deal gives the same variant on every redraw, so the forms filter keeps the last draw')
for _sid, _f, _cl in (('Y4.B14.S1', 0, 'reading'), ('Y4.B14.S2', 1, 'plotting')):
    P(_sid, direct=[], partial=[(f'coordinates:coordinate_q1{{"forms":[{_f}]}}', f'right form in live play, but on a printed page (generated with itemIndex) half the items are the other form; the page is not held to {_cl}')],
      verdict='partial', missing=f'a printed page of {_cl} only (the forms option is lost on the print path)', build=['coord_forms_fix'],
      note=f'forms [{_f}] is the right option and live play honours it; the print path does not (see coord_forms_fix and the report).')

# A partial step lists no "direct" skill: each skill that teaches part of it is a partial, with its own clause.
_MOVE = {
 'Y4.B1.S8': {'placevalue:more_less_100{"step":1000}': 'only 1,000 more or less (4,890 + 1,000); never 1 or 10, never the four steps mixed',
              'placevalue:more_less_100{"step":100}': '100 more or less on 3-digit numbers only (489 + 100); the skill has no 4-digit band'},
 'Y4.B3.S1': {'area_perimeter:area_unit_squares{"forms":[0]}': 'counts the unit squares of a drawn shape (area 25, 35); never compares two surfaces or asks why squares'},
 'Y4.B4.S12': {'division:div_facts{"constant":[1]}': 'n ÷ 1 = n only (11 ÷ 1, 8 ÷ 1); never n ÷ n = 1 and no sharing picture'},
 'Y4.B5.S2': {'number_theory:factor_links_easy': 'finds the factor pairs of a number (24: 1 × 24, 2 × 12 …); never uses one to multiply'},
 'Y4.B6.S7': {'area_perimeter:composite_shapes{"forms":[0]}': 'perimeter of a composite shape; generated items label the sides, so no missing length has to be found first'},
 'Y4.B7.S11': {'fraction_operations:add_frac_like_nv': 'two addends only (10/11 + 3/11, 7/8 + 5/8); never three or more'},
}
for _sid, _m in _MOVE.items():
    _st = _by[_sid]
    _norm = lambda k: k.split('{')[0] + (json.dumps(json.loads(k[k.index('{'):]), sort_keys=True) if '{' in k else '')
    import json
    _left = []
    for d in _st.get('direct', []):
        hit = [k for k in _m if _norm(k) == _norm(d)]
        if hit: _st['partial'] = list(_st.get('partial', [])) + [(d, _m[hit[0]])]
        else: _left.append(d)
    _st['direct'] = _left
for _s, _f in (('Y4.B14.S1', 'reading'), ('Y4.B14.S2', 'plotting')):
    HAND_WHY[('coordinates:coordinate_q1', _s)] = f'forms option set to {_f}; partial because a printed page (itemIndex) still deals the other form on about half the items'
for _s in ('Y4.B7.S12',):
    for _k in ('fraction_operations:add_mixed_like', 'fraction_operations:add_mixed_like_nv'):
        HAND_WHY[(_k, _s)] = 'mixed + mixed only; never a proper fraction added to a mixed number'
for _k in ('fraction_operations:sub_mixed_like', 'fraction_operations:sub_mixed_like_nv'):
    HAND_WHY[(_k, 'Y4.B7.S15')] = 'some items break a whole (4 2/8 − 3 5/8), which WRM keeps for Y5.B4.S16; a page cannot be held to no exchange'
HAND_WHY[('division:box_division_hard', 'Y4.B5.S13')] = 'regroup "none" (shares exactly): 3-digit ÷ 1-digit with no remainder; the default deals remainders (195 ÷ 8 = 24 R 3)'
HAND_WHY[('number_sense:rounding_table', 'Y4.B1.S17')] = 'places [10, 100, 1,000]: 4-digit numbers rounded to all three places; the default reaches only 10 and 100 on 3-digit numbers'
TAGFIXES[:] = [dict(t, why=HAND_WHY.get((t['key'], t['step']), t['why'])) for t in TAGFIXES]
for (k, s), w in HAND_WHY.items():
    if not any(t['key'] == k and t['step'] == s for t in TAGFIXES): TAGFIXES.append(dict(key=k, step=s, action='partial', why=w))
