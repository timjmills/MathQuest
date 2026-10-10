# Round 13 after critic Y4 r12 (tagFix derivation, f_to_d bin branch, B2.S9 sums past 10,000, isolated cites).
_by = {s['id']: s for s in STEPS}
def _base(k): return k.split('{')[0].split('@')[0]
def relabel(sid, role, base, text=None, newkey=None, ref=None, kind='X', only=None):
    """Re-label (and optionally re-key) every link of `base` on a step. Pre tuples are (key, ref-or-text, kind)."""
    lst = _by[sid][role]; hit = False
    for i, e in enumerate(lst):
        if _base(e[0]) == base and (only is None or e[0] == only):
            k = newkey or e[0]
            if role == 'pre': lst[i] = (k, ref, kind) if ref else (k, text, kind)
            else: lst[i] = (k, text if text is not None else e[1])
            hit = True
    assert hit, (sid, role, base)
def drop(sid, role, full_key):
    n = len(_by[sid][role]); _by[sid][role] = [e for e in _by[sid][role] if _base(e[0]) != _base(full_key)]; assert len(_by[sid][role]) < n, (sid, full_key)

# N. the B6.S5 hand fix predates reading {step, note} as FULL: the tag is full (note 'L-shapes') and becomes partial
for t in TAGFIXES:
    if t['key'] == 'area_perimeter:perimeter_grid' and t['step'] == 'Y4.B6.S5':
        t['action'] = 'partial'; t['why'] = "tagged full (note 'L-shapes'); the generated items teach only the six-sided shapes"
    if t['key'] == 'fractions:write_fraction' and t['step'] == 'Y4.B8.S1':
        t['why'] = "tagged full (note 'tenths'); with denoms [5] the items mix fifths and hundredths with tenths"

# B. f_to_d has a drag-bin branch: halves and quarters sorted as percents, quarters as decimals, eighths/twelfths
BIN5 = ('; 49 of 150 items are a drag-bin sort of halves and quarters shown as 50% / 75%, 0.25 / 0.75 and eighths or twelfths '
        '(percent is later-grade; quarters as decimals are W33)')
for sid in ('Y4.B8.S2', 'Y4.B8.S8'):
    _by[sid]['partial'] = [((k, m + BIN5) if k == 'conversions:f_to_d{"denoms":[5]}' else (k, m)) for k, m in _by[sid]['partial']]
_by['Y4.B9.S8']['partial'] = [((k, m + '; most items (85-101 of 150) are that drag-bin sort, with percent tiles (25%, 50%, 75%) and twelfths')
                               if k == 'conversions:f_to_d{"denoms":[2]}' else (k, m)) for k, m in _by['Y4.B9.S8']['partial']]
NEW_PROPOSALS['f_to_d_one_item'] = dict(kind='option', skill='conversions:f_to_d', option='form "convert one fraction" / "drag-bin sort" (the _dragOrNot option d_to_f, f_to_p and p_to_f already have)',
    name='Fraction to Decimal: One Item (option)', teaches='convert one fraction to a decimal per cell (7/10 = 0.7); no percent or bin-sort items on the page',
    representation='equation cell 7/10 = □ with one decimal box and a fixed decimal point; the bin sort stays available as its own form',
    family='conversions', ccss=['4.NF.C.6'], why='f_to_d mixes a drag-bin sort of 50% / 75% / 0.25 tiles into every denominator set; d_to_f can switch it off, f_to_d cannot')
for sid, txt in (('Y4.B8.S2', 'convert one tenth per cell (7/10 = 0.7), with no percent bin sort on the page'),
                 ('Y4.B8.S8', 'convert one hundredth per cell (37/100 = 0.37), with no percent bin sort on the page'),
                 ('Y4.B9.S8', 'convert one half or quarter per cell (3/4 = 0.75), with no percent tiles or twelfths')):
    _by[sid]['build'] = list(_by[sid].get('build', [])) + ['f_to_d_one_item']
    ENVISION.setdefault(sid, {})['f_to_d_one_item'] = txt
    CLOSES.setdefault(sid, {})['f_to_d_one_item'] = 'the bin-sort items (percent tiles and quarters as decimals) are off the page'

# R. B2.S9: estimate_sums_diffs {place:1000, task:'reasonable'} adds two 4-digit numbers past 10,000 (to 19,191; decoys to 174,380)
P('Y4.B2.S9', direct=[],
  partial=[('number_sense:estimate_sums_diffs{"place":100}', 'with place 100: 3-digit numbers rounded to the nearest 100 (427 + 753, sums to 2,000); no 4-digit numbers'),
           ('number_sense:estimate_sums_diffs{"place":1000,"task":"reasonable"}',
            "4-digit sums pass 10,000 in 56 of 150 items (9,884 + 7,610 = 17,494) and the 'not reasonable' answers reach 174,380; the step stays within 10,000")],
  verdict='partial', missing='estimating 4-digit sums and differences, and judging answers, within 10,000',
  note='Both option sets are partial covers: {place:100} rounds 3-digit numbers only (sums to 2,000); {place:1000, task:"reasonable"} '
       'deals 4-digit numbers but its sums pass 10,000. The build list holds both within 10,000.')
_by['Y4.B2.S9']['build'] = ['estimate_within_10k']
NEW_PROPOSALS['estimate_within_10k'] = dict(kind='option', skill='number_sense:estimate_sums_diffs', option='limit "within 9,999": operands, the true sum and every shown answer held to 9,999',
    name='Estimate Within 10,000 (option)', teaches='round two 4-digit numbers to the nearest 1,000 or 100 and judge an answer, with every number on the page within 10,000',
    representation='equation cell 4,267 + 3,527 = 7,794 with "Reasonable / Not reasonable" check boxes and a rounding line beneath (hint, fades)',
    family='number_sense', ccss=['4.NBT.A.3', '3.NBT.A.1'], why='place 1,000 with task reasonable deals sums to 19,191 and decoys to 174,380; Y4 add/sub is held within 10,000')
ENVISION['Y4.B2.S9'] = {'estimate_within_10k': 'estimate 4-digit sums and differences and judge answers, every number within 10,000'}
CLOSES['Y4.B2.S9'] = {'estimate_within_10k': 'sums, differences and shown answers held within 10,000'}

# Isolated
for t in TAGFIXES:
    if t['key'] == 'patterns:count_by_step_up' and t['step'] == 'Y2.B1.S15':
        t['action'] = 'add'
        t['partial'] = 'counts on in 2s, 5s and 10s from any number (381, 386 ...), not the multiples from 0; answers pass 100 even at Max Number 100 (to 190)'
        t['why'] = 'its step [0] counts in 2s, 5s and 10s, but from any number and past 100: a partial cover of Y2.B1.S15 (critic Y4 r12)'
relabel('Y4.B1.S3', 'pre', 'patterns:count_by_step_up', ref=None, text='Y2.B1.S15 Count in 2s, 5s and 10s (prior learning wk W18; tagged there as a partial cover by a hand tagFix)')
relabel('Y4.B1.S8', 'pre', 'placevalue:value', newkey='placevalue:value{"band":999}', ref='Y3.B1.S8', kind='L')
relabel('Y4.B5.S2', 'pre', 'multiplication:mult_facts', only='multiplication:mult_facts{"constant":[10],"band":100}', ref='Y2.B5.S13', kind='L')
relabel('Y4.B6.S1', 'pre', 'placevalue:place_value_10x', newkey='placevalue:place_value_10x{"op":"x","power":[100],"band":10000}', ref='Y4.B5.S4', kind='L')

# Minor
drop('Y4.B6.S3', 'pre', 'area_perimeter:perimeter_grid')
relabel('Y4.B3.S2', 'related', 'area_perimeter:perimeter_grid', newkey='area_perimeter:perimeter_grid{"forms":[0,1]}')
relabel('Y4.B14.S4', 'related', 'area_perimeter:perimeter_grid', newkey='area_perimeter:perimeter_grid{"forms":[0,1]}')
for sid in ('Y4.B1.S3', 'Y4.B8.S7'):
    relabel(sid, 'pre', 'composing:hundreds_chart_fill', text='filling the gaps on a 1-100 hundred chart (Y1.B6.S1 and Y1.B12.S1: counting to 50, and from 50 to 100)')
relabel('Y4.B2.S8', 'pre', 'patterns:seq_10', text='Y1.B9.S2 Count in 10s (prior learning wk W16; counting on in 10s from any number)')
relabel('Y4.B5.S3', 'pre', 'patterns:seq_10', text='Y1.B9.S2 Count in 10s (prior learning wk W16; counting on in 10s from any number)')
relabel('Y4.B5.S4', 'pre', 'patterns:seq_10', text='Y1.B9.S2 Count in 10s (lower grade, same idea; counting on in 10s from any number)')
for sid in ('Y4.B11.S2', 'Y4.B13.S1'):
    relabel(sid, 'pre', 'patterns:seq_5', text='Y1.B9.S3 Count in 5s (lower grade, same idea; counting on in 5s from any number)')
