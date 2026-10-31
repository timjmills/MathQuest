"""Proof that every Y4 site-lesson gate fires: one mutation per failure class, each run through the gate that owns it, and each must be
CAUGHT by that gate's own message (the Y1 lessons lane's lessonmut.py, ported to the Grade 3 lessons and the Y4 gates).
  A. lessonfit.mjs, on a mutated copy of the built Y4.json (SIZE, CONTENT rule 19 / tables / SUPPORT / H, RESPONSE, CITE, WHY, CLAUSE,
     OWN / DUP, M, TITLEREP, RANGE, FULLAUDIT, DENOMS, G, NEVERUNIT, BETWEEN, R10 and the Y1 rule classes NOPIC, ASKED, ORIENT, ZERO,
     WINDOW, OBJN, story kind, share, bound)
  B. lessons_build.py --spec <mutated spec> --dry: the lesson checks of lessons.py
  C. lessonspec.py (a re-option after finish()), lessons_build.py --frozen-check (a frozen step / tagFix / step proposal changed),
     lessonmerge.mjs (a tagFix naming a lesson, a lesson missing, a shared proposal that differs)
  D. lessoncheck.py: edits to the WRITTEN file after finish() against the snapshot of the unmutated file, and the source gates
usage: python3 tests/scripts/wrm-tagging/Y4/lessonmut.py      (exit 1 if any mutation is missed)"""
import json, copy, subprocess, os, sys, tempfile, re
H = os.path.dirname(os.path.abspath(__file__))
R = os.path.abspath(os.path.join(H, '..', '..', '..', '..')) + '/'
Y4 = R + 'data/curriculum/links/Y4.json'
base = json.load(open(Y4))
G = 'G3|-|'
def L(d, slug): return d['lessons'][G + slug]
TMP = tempfile.mkdtemp(prefix='y4-lessonmut-')
env = dict(os.environ, NODE_NO_WARNINGS='1')
M = []
def m(name, target):
    def deco(f): M.append((name, target, f)); return f
    return deco
P_ = lambda slug, i=0: (lambda d: L(d, slug)['pre'][i])
# ── A. lessonfit.mjs ──
@m('SIZE: Grade 1 source lesson pre to 10,000', r'size \d+ >')
def _(d): L(d, 'finddurationsoftime')['pre'].append({'key': 'placevalue:compare', 'opts': {'band': 9999}, 'why': 'Y2.B1.S13 Compare numbers (Grade 1, the source grade): comparing two numbers'})
@m('CONTENT rule 19: W05 lesson pre with fractions (first taught W07)', r'rule 19: fractions')
def _(d): L(d, 'findtheruleinaninputoutputtable')['pre'].append({'key': 'fractions:shade_fraction', 'why': 'Y3.B6.S3 Understand the numerators of non-unit fractions (Grade 2, lower grade): shading'})
@m('CONTENT rule 19: W05 lesson related with area (first taught W18)', r'rule 19: area')
def _(d): L(d, 'propertiesofmultiplicationcommutativeidentityanddistributive')['related'].append({'key': 'area_perimeter:area_unit_squares', 'opts': {'forms': [0]}, 'why': 'counting squares'})
@m('CONTENT rule 19: W17 lesson pre with decimals (first taught W29)', r'rule 19: decimals')
def _(d): L(d, 'solveadditionandsubtractionwordproblemswithin1000usingbarmodels')['related'].append({'key': 'decimals:compare_decimal', 'opts': {'decimals': 1}, 'why': 'comparing two numbers'})
@m('SUPPORT: Grade 1 source lesson related with decimals', r'SUPPORT: decimals')
def _(d): L(d, 'finddurationsoftime')['related'].append({'key': 'decimals:compare_decimal', 'opts': {'decimals': 1}, 'why': 'comparing two numbers'})
@m('SUPPORT: Kindergarten source lesson related with grams', r'SUPPORT: grams|uses standard units')
def _(d): L(d, 'introduceweightandmass')['related'] = [{'key': 'measurement:mass_volume_liquid', 'opts': {'forms': [1]}, 'why': 'reading a scale'}]
@m('SUPPORT FLAGS: Reception source lesson related with x', r'uses x or ÷')
def _(d): L(d, 'compareamountsmorefewersame')['related'].append({'key': 'multiplication:mult_facts', 'opts': {'constant': [2]}, 'why': 'groups of two'})
@m('SUPPORT R_EQ: Reception source lesson pre on a number line', r'R_EQ')
def _(d): L(d, 'sharingandgroupingfairshares')['pre'].append({'key': 'subtraction:number_line_sub', 'maxNumber': 10, 'why': 'R.B11.S6 1 less (Pre-K, block R.B11, before this Support lesson\'s source phase): one less'})
@m('H: Grade 2 source lesson related orders unlike fractions', r'H: compares or orders unlike')
def _(d): L(d, 'orderfractions')['related'].append({'key': 'fractions:order_frac_numline', 'why': 'placing fractions on a number line to order them'})
@m('CITE H: Support lesson cites a Grade 3 step', r'H: cites Y4')
def _(d): P_('selectmoney', 1)(d)['why'] = 'Y4.B10.S1 Write money using decimals (taught later): the value of each coin'
@m('CITE H: phase lesson cites an R step of its own phase', r'not before this Support lesson\'s source phase')
def _(d): P_('sharingandgroupingfairshares', 0)(d)['why'] = 'R.B16.S6 Play with and build doubles (Pre-K, block R.B16, before this Support lesson\'s source phase): doubling'
@m('CITE rule 19: W17 lesson cites a step taught W36', r'rule 19: cites Y4')
def _(d): L(d, 'solveadditionandsubtractionwordproblemswithin1000usingbarmodels')['pre'][0].update(key='multiplication:multiply', opts={'tiles': 31}, why='Y4.B5.S10 Multiply a 3-digit number by a 1-digit number (taught later, wk W36): multiplying')
@m('CITE: pre cites a step its key is not tagged to', r'not tagged to')
def _(d): P_('patternsonthemultiplicationtable', 1)(d)['why'] = 'Y4.B4.S1 Multiples of 3 (taught earlier this year, wk W01): the 9 times-table facts'
@m('CITE: why without the cited unit\'s own title', r'own title')
def _(d): P_('patternsonthemultiplicationtable', 1)(d)['why'] = 'Y4.B4.S5 Nines (taught earlier this year, wk W02): the 9 times-table facts'
@m('CITE: why that starts with no unit id', r'does not start with the step')
def _(d): P_('patternsonthemultiplicationtable', 1)(d)['why'] = 'the 9 times-table facts'
@m('WHY claim: count_by_tables why names money', r'money')
def _(d): P_('countmoneynotesandcoins', 1)(d)['why'] += ': counting nickels and dimes in dollars'
@m('WHY shape: mult_facts why names a number line', r'number line')
def _(d): P_('patternsonthemultiplicationtable', 1)(d)['why'] += ', shown on a number line'
@m('WHY K word: compare_objects why says heavier', r'heavier')
def _(d): P_('introducecapacityandvolume', 0)(d)['why'] = P_('introducecapacityandvolume', 0)(d)['why'].split(':')[0] + ': which object is heavier'
@m('WHY bound: make_ten band 10 why says "bonds to 100"', r'largest number dealt')
def _(d): P_('doublesandneardoubleswithin20', 1)(d)['why'] += ' (bonds to 100)'
@m('WHY units: coin_value why names kilograms', r'kilograms')
def _(d): P_('countmoneynotesandcoins', 0)(d)['why'] += ', each coin weighed in kilograms'
@m('WHY digit: mult_facts why says 4-digit', r'4-digit')
def _(d): P_('comparingmultiplicationstatements', 0)(d)['why'] += ' with 4-digit products'
@m('WHY picture: div_facts why says pictured', r'why says pictured')
def _(d): P_('findtheruleinaninputoutputtable', 1)(d)['why'] += ', pictured as counters'
@m('WHY ASKED: identify why says the pupil picks the circle', r'asked for the circle')
def _(d): P_('partitionshapesintoequalareas', 0)(d)['why'] = P_('partitionshapesintoequalareas', 0)(d)['why'].split(':')[0] + ': picking the circle that shows a fraction'
@m('WHY ORIENT: arrays_groups why "each turned a different way"', r'no item turns or resizes')
def _(d): P_('areaasmultiplication', 0)(d)['why'] += ', each turned a different way'
@m('WHY ZERO: count_by_tables why says zero', r'no item deals 0')
def _(d): P_('patternsonthemultiplicationtable', 0)(d)['why'] += ', starting from zero'
@m('WHY WINDOW: count_sequence why "after 8 and 9" (1 to 20 dealt)', r'among them')
def _(d): P_('doublesandneardoubleswithin20', 2)(d)['why'] = P_('doublesandneardoubleswithin20', 2)(d)['why'].split(':')[0] + ': the number after 8 or 9'
@m('WHY OBJN: classify_count why names cookies', r'names "cookie"')
def _(d): P_('compareamountsmorefewersame', 0)(d)['why'] += ' (cookies)'
@m('WHY share: number_bonds why says sharing', r'why says "shar')
def _(d): P_('sharingandgroupingfairshares', 1)(d)['why'] += ': sharing a number between two'
@m('WHY story kind: add_wp_100 why "add-more stories" (half are put-together)', r'put-together stories')
def _(d): P_('twostepwordproblemswiththefouroperations', 2)(d)['why'] = P_('twostepwordproblemswiththefouroperations', 2)(d)['why'].split(':')[0] + ': add-more stories to 100'
@m('WHY BETWEEN: fraction_number_line why "between 0 and 1" (5/2 dealt)', r'BETWEEN')
def _(d): P_('measuretothehalfandquarterinch', 0)(d)['why'] = P_('measuretothehalfandquarterinch', 0)(d)['why'].split(':')[0] + ': fractions between 0 and 1'
@m('WHY DENOMS: identify denoms 2 why names thirds only', r'DENOMS')
def _(d): P_('measuretothehalfandquarterinch', 2)(d)['why'] = P_('measuretothehalfandquarterinch', 2)(d)['why'].split(':')[0] + ': picking the model that shows thirds'
@m('CLAUSE NEVERUNIT: mass forms 1 "never grams" (the r1 sweep finding)', r'NEVERUNIT')
def _(d): L(d, 'measureandestimatemassandliquidvolumegkgmll')['partial'][1]['missing'] = 'reads a kilogram scale to 10 kg; never grams'
@m('CLAUSE claim: reading_ruler clause says centimetres', r'clause claims|centimet')
def _(d): L(d, 'measuretothehalfandquarterinch')['partial'][0]['missing'] = 'reads where an arrow points on a centimetre ruler; never an object'
@m('CLAUSE negated op: word_problems_mixed clause "never divides"', r'is not dealt')
def _(d): L(d, 'twostepwordproblemswiththefouroperations')['partial'][1]['missing'] = 'one-step stories; never divides and never a second step'
@m('CLAUSE bound: line_plot clause "numbers to 100"', r'largest number dealt|pass')
def _(d): L(d, 'buildalineplotfrominchmeasurements')['partial'][0]['missing'] = 'reads a line plot with numbers to 100; never makes the plot'
@m('CLAUSE digit: add_wp_1k... multi_step clause "never a 2-digit number"', r'never a 2-digit')
def _(d): L(d, 'twostepwordproblemswiththefouroperations')['partial'][0]['missing'] = 'two-step stories that add and subtract; never a 2-digit number'
@m('CLAUSE NOPIC: heavier_lighter clause "words only"', r'says no pictures')
def _(d): L(d, 'introduceweightandmass')['partial'][0]['missing'] = 'picks the heavier or lighter object named in words only; never a balance'
@m('CLAUSE NEVER0: div facts style: share_into_groups clause "never 0 as an answer" holds; count clause made false', r'have the answer 0')
def _(d): L(d, 'patternsonthemultiplicationtable')['partial'].append({'key': 'multiplication:mult_facts', 'opts': {'constant': [0, 1]}, 'missing': 'facts of 0 and 1; never 0 as an answer to write'})
@m('OWN class F: a pre that deals the lesson\'s own items', r'class F')
def _(d): L(d, 'doublesandneardoubleswithin20')['pre'].append({'key': 'number_sense:doubles_near_doubles', 'opts': {}, 'why': 'Y1.B5.S4 Doubles (Kindergarten, below the source grade): doubles'})
@m('DUP: two related links with the same items', r'duplicate')
def _(d): L(d, 'findtheruleinaninputoutputtable')['related'].append(copy.deepcopy(L(d, 'findtheruleinaninputoutputtable')['related'][0]) | {'why': 'counting on by a rule again'})
@m('R10: a pre key repeated as a related', r'^R10: ')
def _(d): L(d, 'comparedurationsoftime')['related'].append(copy.deepcopy(L(d, 'comparedurationsoftime')['pre'][0]) | {'why': 'telling the time'})
@m('M: a clause denies what mass_volume_liquid forms=2 "Click or sort by unit" deals, unnamed', r'^M: ')
def _(d): l = L(d, 'measureandestimatemassandliquidvolumegkgmll'); l['partial'] = l['partial'][:2]; l['partial'][0]['missing'] = 'reads millilitres in a cylinder; never click or sort by unit'; l['search'] = ''; l['rule5'] = 'x'; l['note'] = 'Awsaj lesson.'
@m('TITLEREP FULL: patterns lesson made full on mult_chart pattern + even (the explanation is never asked: title claim "patterns" holds, so use the input-output lesson on a chart)', r'TITLEREP FULL')
def _(d): l = L(d, 'findtheruleinaninputoutputtable'); l['direct'] = [{'key': 'multiplication:mult_chart', 'opts': {'task': 'pattern'}}]
@m('TITLEREP CLAUSE: partition lesson clause never names the cutting (partition)', r'TITLEREP CLAUSE')
def _(d): l = L(d, 'partitionshapesintoequalareas'); l['missing'] = 'sixths and eighths'; l['partial'][0]['missing'] = 'counts parts of halves, thirds or fourths'
@m('RANGE full: doubles lesson made full on doubling to 100', r'RANGE: full')
def _(d): L(d, 'doublesandneardoubleswithin20')['direct'] = [{'key': 'patterns:double', 'opts': {'band': 50}}]
@m('RANGE partial: compare durations? -> bar models partial clause silent on numbers past 1,000', r'RANGE: \d+ items')
def _(d): l = L(d, 'solveadditionandsubtractionwordproblemswithin1000usingbarmodels'); l.update(verdict='partial', missing='two-step stories', build=['multi_step_four_ops'], partial=[{'key': 'addition:add_wp_10k', 'opts': {'band': 10000}, 'missing': 'one-step stories'}], direct=[])
@m('RESPONSE: a full Reception-source lesson on a symbol number line', r'RESPONSE')
def _(d): L(d, 'compareamountsmorefewersame')['direct'].append({'key': 'addition:number_line_add', 'opts': {}, 'maxNumber': 10})
@m('G: a FULL lesson titled with decimals and no decimal item', r'^G: ')
def _(d): l = L(d, 'countmoneynotesandcoins'); l['title'] = 'Count money in decimals'
@m('FULLAUDIT: partial lesson made FULL with no row', r'FULLAUDIT: full, but no hand-audit row')
def _(d): l = L(d, 'introduceweightandmass'); l.update(verdict='full', missing='', build=[], envision=[], direct=[{'key': 'measurement:heavier_lighter_visual', 'opts': {}}], partial=[])
@m("FULLAUDIT: a full lesson re-optioned away from its row", r"FULLAUDIT: the audit row's links")
def _(d): L(d, 'finddurationsoftime')['direct'] = [{'key': 'measurement:elapsed_visual_easy', 'opts': {'notation': 'digital'}}]
# ── A, round 2 (lessons critic r1 G1-G3 and its 12 missed mutations) ──
def _f(lst, key): return [e for e in lst if e['key'] == key][0]
@m('G1 story tables: L4 pre div_word_problems without its range (÷ 13-15)', r'G1 rule 19: a story step')
def _(d): _f(L(d, 'twostepwordproblemswiththefouroperations')['pre'], 'division:div_word_problems').pop('opts', None)
@m('G1 lesson own maximum: L8 related composite_shapes at the default band (areas to 200)', r'size \d+ > 45 \(the lesson deals to')
def _(d): _f(L(d, 'distributiveandadditivearea')['related'], 'area_perimeter:composite_shapes')['opts'] = {'forms': [1]}
@m('G1 lesson own maximum: L3 related dot_array_mult band 100', r'size \d+ > [\d.]+ \(the lesson deals to 2\d\)')
def _(d): L(d, 'propertiesofmultiplicationcommutativeidentityanddistributive')['related'][0]['opts'] = {'band': 100}
@m('G1 a pre past the tables: L4 pre word_problems_mixed at the default Max Number', r'G1 rule 19: a story step')
def _(d): L(d, 'twostepwordproblemswiththefouroperations')['pre'].append({'key': 'number_ops_mixed:word_problems_mixed', 'why': 'Y3.B3.S5 Sharing and grouping (Grade 2, lower grade): one-step stories'})
@m('G2 "never dividing by more than 12" with ÷ 13-15 dealt', r'G2: says "never dividing by more than 12"')
def _(d): e = _f(L(d, 'twostepwordproblemswiththefouroperations')['pre'], 'division:div_word_problems'); e.pop('opts', None); e['why'] = e['why'].split(':')[0] + ': a one-step ÷ story, never dividing by more than 12'
@m('G2 "products to 90" with 108 dealt', r'G2: says "products to 90"')
def _(d): P_('patternsonthemultiplicationtable', 1)(d)['why'] += ', products to 90'
@m('G2 lower bound: L7 "areas 9 to 48" (4 dealt)', r'G2: says "areas 9 to 48", but items go below')
def _(d): p = L(d, 'areaasmultiplication')['partial'][0]; p['missing'] = p['missing'].replace('areas 4 to 48', 'areas 9 to 48')
@m('G2 "within the tables": L4 partial word_problems_mixed loses Max Number 100', r'G2: says "within the tables"')
def _(d): L(d, 'twostepwordproblemswiththefouroperations')['partial'][1].pop('maxNumber', None)
@m('G3 groups list: L23 "groups of 2, 3, 4, 5 or 6" (2 never dealt)', r'G3: says "groups of 2, 3, 4, 5 or 6"')
def _(d): p = L(d, 'sharingandgroupingfairshares')['partial'][0]; p['missing'] = p['missing'].replace('groups of 3, 4, 5 or 6', 'groups of 2, 3, 4, 5 or 6')
@m('G3 "never thirds" on a non-fraction skill (thirds dealt)', r'G3: says "never [^"]*thirds"')
def _(d): p = L(d, 'partitionshapesintoequalareas')['partial'][0]; p['missing'] = p['missing'].replace('never sixths or eighths', 'never thirds, sixths or eighths')
@m('G3 money: L21 "never a $5 or a $10 bill" ($5 dealt)', r'items show a \$5 bill')
def _(d): p = L(d, 'poundstensonesandpenceusdollarscents')['partial'][0]; p['missing'] = p['missing'].replace('never a $10 bill', 'never a $5 or a $10 bill')
@m('G3 "the other models in thirds, fifths or sixths" (r1 why)', r'G3: says "the other models')
def _(d): e = _f(L(d, 'measuretothehalfandquarterinch')['pre'], 'fractions:identify'); e['why'] = e['why'].replace('; some of the other models are in thirds, fifths or sixths', ' (the other models in thirds, fifths or sixths)')
@m('duration claim: L13 related why "how long an activity takes, in minutes"', r'ask for a duration')
def _(d): L(d, 'comparedurationsoftime')['related'][0]['why'] = 'how long an activity takes, in minutes'
@m('CITE week text: L1 pre why "(wk W09)" for a W02 step', r'the why says wk W09')
def _(d): P_('findtheruleinaninputoutputtable', 1)(d)['why'] += ' (wk W09)'
# critic r2 G4 / G5 / n7 (round 3)
@m('G4 layout: L8 related why "every side length given" (4 labels on 6 / 8 sides)', r'G4: says every side is given')
def _(d): L(d, 'distributiveandadditivearea')['related'][0]['why'] = 'the perimeter and the area of a small L- or T-shape with every side length given (areas 14 to 24)'
@m('G4 layout: L8 related why "with no side to work out"', r'G4: says every side is given')
def _(d): L(d, 'distributiveandadditivearea')['related'][0]['why'] = 'the perimeter and the area of a small L- or T-shape with no side to work out (areas 14 to 24)'
@m('G4 incomplete list: L23 clause "groups of 3, 4 or 5" (6 dealt)', r'G4: says "groups of 3, 4 or 5".*not complete')
def _(d): q = L(d, 'sharingandgroupingfairshares')['partial'][0]; q['missing'] = q['missing'].replace('groups of 3, 4, 5 or 6', 'groups of 3, 4 or 5')
@m('G4 incomplete list: L23 clause "groups of 3 or 4"', r'G4: says "groups of 3 or 4".*not complete')
def _(d): q = L(d, 'sharingandgroupingfairshares')['partial'][0]; q['missing'] = q['missing'].replace('groups of 3, 4, 5 or 6', 'groups of 3 or 4')
@m('G4 coin denial: L22 clause "never a quarter"', r'G4: says "never a quarter", but items deal a 25-cent coin')
def _(d): q = L(d, 'selectmoney')['partial'][0]; q['missing'] = q['missing'].replace('never chooses bills', 'never a quarter, never chooses bills')
@m('G4 coin denial: L22 clause "never a 25-cent coin"', r'G4: says "never a 25-cent(?: coin)?", but items deal a 25-cent coin')
def _(d): q = L(d, 'selectmoney')['partial'][0]; q['missing'] = q['missing'].replace('never chooses bills', 'never a 25-cent coin, never chooses bills')
@m('G4 coin denial: L22 clause "never uses dimes or nickels"', r'G4: says "never uses dimes or nickels"')
def _(d): q = L(d, 'selectmoney')['partial'][0]; q['missing'] = q['missing'].replace('never chooses bills', 'never uses dimes or nickels, never chooses bills')
@m('G4 "all the other models show thirds, fifths or sixths"', r'G3: says "the other models show')
def _(d): e = [x for x in L(d, 'measuretothehalfandquarterinch')['pre'] if x['key'] == 'fractions:identify'][0]; e['why'] = e['why'].replace('some of the other models are in thirds, fifths or sixths', 'all the other models show thirds, fifths or sixths')
@m('G5 Support Grade 2 source: L14 pre mult_facts x7, why "the 7 times-table"', r'G5 rule 19: the 7 times-table')
def _(d): e = L(d, 'comparingmultiplicationstatements')['pre'][0]; e['opts'] = {'constant': [7]}; e['why'] = 'Y3.B3.S11 The 4 times-table (Grade 2, the source grade): the 7 times-table facts'
@m('G5 Support Grade 1 source: L15 pre count_by_tables x3', r'G5 rule 19: the 3 times-table')
def _(d): e = [x for x in L(d, 'countmoneynotesandcoins')['pre'] if x['key'] == 'multiplication:count_by_tables'][0]; e['opts'] = {'constant': [3]}
@m('n7 free-text week: L2 pre why "week 9" for a W02 step', r'the why says week 9')
def _(d): e = L(d, 'patternsonthemultiplicationtable')['pre'][1]; e['why'] = e['why'].replace('wk W02', 'week 9')
# lessons critic r3 F5 / G7 / G8 / n7b (round 4)
L8W = lambda w: (lambda d: L(d, 'distributiveandadditivearea')['related'][0].update(why=w))
_A = 'the perimeter and the area of a small L- or T-shape (areas 14 to 24); '
for _n, _w, _t in [
    ('G7 count: the r3 why "two side lengths are not labelled" (T leaves 4)', _A + 'two side lengths are not labelled and are worked out from the others first', r'G7: says "2 side lengths are not labelled".*T-shapes'),
    ('G7 count: "one side length is not labelled"', _A + 'one side length is not labelled and is worked out first', r'G7: says "1 side length is not labelled"'),
    ('G4 layout: "with no unknown sides"', _A + 'with no unknown sides', r'G4: says every side is given'),
    ('G7 per shape: "2 sides of the L" (the T left out)', _A + 'not every side is labelled (2 sides of the L)', r'G7: the per-shape count .* leaves out the T'),
    ('G7 per shape: "2 of the T\'s 8 sides" (4 dealt)', _A + "not every side is labelled (2 of the L's 6 sides, 2 of the T's 8 sides)", r'G7: says "2 of the T.s 8 sides" \(unlabelled\)'),
    ('G7 per shape: "the T\'s 6 sides" (it has 8)', _A + "not every side is labelled (2 of the L's 6 sides, 4 of the T's 6 sides)", r'G7: says the T has 6 sides')]:
    m(_n, _t)(L8W(_w))
def _c23(new):
    def f(d): q = L(d, 'sharingandgroupingfairshares')['partial'][0]; q['missing'] = q['missing'].replace('groups of 3, 4, 5 or 6', new)
    return f
for _n, _w, _t in [('G8 list range: "groups of 3 to 5" (6 dealt)', 'groups of 3 to 5', r'G4: says "groups of 3 to 5".*not complete'),
                   ('G8 list in words: "groups of three, four or five"', 'groups of three, four or five', r'G4: says "groups of 3, 4 or 5".*not complete'),
                   ('G8 list postfix: "3, 4 or 5 in each group"', '3, 4 or 5 in each group', r'G4: says "3, 4 or 5 in each".*not complete')]:
    m(_n, _t)(_c23(_w))
def _c22(ins):
    def f(d): q = L(d, 'selectmoney')['partial'][0]; q['missing'] = q['missing'].replace('never chooses bills', ins + ', never chooses bills')
    return f
m('G8 coin denial after the coin: "quarters are never used"', r'G4: says "quarters are never used", but items deal a 25-cent coin')(_c22('quarters are never used'))
m('G8 positive-only coins: "only dimes and pennies"', r'G8: says "only dimes and pennies"')(_c22('only dimes and pennies'))
@m('G8 nested coins: L15 related money_compare why "never a quarter" (a.coins / b.coins)', r'G4: says "never a quarter", but items deal a 25-cent coin')
def _(d): L(d, 'countmoneynotesandcoins')['related'][0]['why'] += ', never a quarter'
@m('G8 table skill with no table option: L14 pre mult_facts {}', r'G8 rule 19: \d+ dealt facts are in no times-table')
def _(d): [x for x in L(d, 'comparingmultiplicationstatements')['pre'] if x['key'] == 'multiplication:mult_facts'][0]['opts'] = {}
@m('G8 table skill with no table option: L14 related div_facts {}', r'G8 rule 19: \d+ dealt facts are in no times-table')
def _(d): L(d, 'comparingmultiplicationstatements')['related'].append({'key': 'division:div_facts', 'opts': {}, 'why': 'division facts: the inverse of the statements'})
@m('n7b bare week: L1 pre why "W09" for a W02 step', r'the why says W09')
def _(d): e = L(d, 'findtheruleinaninputoutputtable')['pre'][0]; e['why'] = e['why'].replace('wk W02', 'W09')
@m('sweep: L21 related money_compare why names a coin it never deals ("half-dollars")', r'G8: names half-dollars, but no item deals a 50-cent coin')
def _(d): L(d, 'poundstensonesandpenceusdollarscents')['related'][0]['why'] += ', with half-dollars'
# ── A, G9 (lessons critic r4 §6, critic 2026-10-30 finding 2): the r4 R-mutations, read on the fixed probe ──
def _g9cl(slug, role, i, old, new):
    def f(d):
        q = L(d, slug)[role][i]; fld = 'missing' if role == 'partial' else 'why'
        assert old in q[fld], (slug, old); q[fld] = q[fld].replace(old, new)
    return f
for _n, _t, _g9f in [
    ('G9 F6 / R6: L7 story objects narrowed to "floor, patio or wall"', r'G9 objects: says "story of a rectangular floor, patio or wall"', _g9cl('areaasmultiplication', 'partial', 1, 'kitchen floor, room, patio, wall or garden bed', 'floor, patio or wall')),
    ('G9 R10: L9 "scales to 100, 200 or 500 mL" (1,000 dealt)', r'G9 scale: .*scales to 1000', _g9cl('measureandestimatemassandliquidvolumegkgmll', 'partial', 0, '100, 200, 500 or 1,000 mL', '100, 200 or 500 mL')),
    ('G9 R9: L9 "(to 5 kg)" (10 kg dealt)', r'G9 top: says "\(to 5 kg\)"', _g9cl('measureandestimatemassandliquidvolumegkgmll', 'partial', 1, '(to 10 kg)', '(to 5 kg)')),
    ('G9 R14: L20 "three to five fractions" (6 dealt)', r'G9 count: says "3 to 5 fractions"', _g9cl('orderfractions', 'partial', 0, 'three to six fractions', 'three to five fractions')),
    ('G9 R15: L23 "8 to 10 counters" (12 dealt)', r'G9 count: says "8 to 10 counters"', _g9cl('sharingandgroupingfairshares', 'partial', 0, '8 to 12 counters', '8 to 10 counters')),
    ('G9 R17: L22 "to 25 cents" (50 dealt)', r'G9 amount: says "to 25 cents"', _g9cl('selectmoney', 'partial', 0, 'to 50 cents', 'to 25 cents')),
    ('G9 R16: L10 "a 12-inch ruler" (6 dealt)', r'G9 ruler: says "12-inch ruler"', _g9cl('measuretothehalfandquarterinch', 'partial', 0, '6-inch ruler', '12-inch ruler')),
    ('G9 n9: L10 ruler "marked in halves" (quarters drawn)', r'G9 ruler: says "ruler marked in halves', _g9cl('measuretothehalfandquarterinch', 'partial', 0, 'marked in quarters', 'marked in halves')),
    ('G9 R8: L13 related "1 or 2 hours later or earlier" (3 dealt)', r'G9 interval: .*180 min', _g9cl('comparedurationsoftime', 'related', 0, '1, 2 or 3 hours', '1 or 2 hours')),
    ('G9 R13: L17 related "30 minutes later" (earlier dealt)', r'G9 direction: .*also count earlier', _g9cl('finddurationsoftime', 'related', 0, '30 minutes later or earlier', '30 minutes later')),
    ('G9 R18: L13 partial "in whole hours" (half hours dealt)', r'G9 interval: says "in whole hours"', _g9cl('comparedurationsoftime', 'partial', 0, 'in whole and half hours', 'in whole hours')),
    ('G9 R12: L11 "in halves or quarters" (eighths dealt)', r'G9 family: says "in halves or quarters", but items show /8', _g9cl('buildalineplotfrominchmeasurements', 'partial', 0, 'in halves, quarters or eighths, many of the plots in halves only', 'in halves or quarters')),
    ('G9 R11 / r1-6: L7 "areas 6 to 48" (4 dealt, read on the fixed probe)', r'G2: says "areas 6 to 48", but items go below 6', _g9cl('areaasmultiplication', 'partial', 0, 'areas 4 to 48', 'areas 6 to 48'))]:
    m(_n, _t)(_g9f)
@m('G9 R3: L8 related half-unit claim "always a whole number" (halves shown)', r'G9 half: says')
def _(d): L(d, 'distributiveandadditivearea')['related'][0]['why'] += '; each side is always a whole number'
# controls: true claims of the same forms pass (the link has no finding)
CTRL = [('control: L8 related "(2 sides of the L, 4 of the T)"', 'distributiveandadditivearea', L8W(_A + 'not every side is labelled (2 sides of the L, 4 of the T), so the missing lengths are worked out first')),
        ('control: L23 "groups such as 3 or 4"', 'sharingandgroupingfairshares', _c23('groups such as 3 or 4')),
        ('control: L22 "never a half-dollar"', 'selectmoney', _c22('never a half-dollar')),
        ('control: L15 pre count_by_tables x5 at Grade 1', 'countmoneynotesandcoins', lambda d: None)]
AUD = json.load(open(os.path.join(H, 'full_audit.json')))
AM = []
def _a1(d, a): a[G + 'solveadditionandsubtractionwordproblemswithin1000usingbarmodels']['ccss']['3.OA.D.8'] = 'Solve two-step word problems with the four operations: the stories are dealt with a bar model on every item, as the title asks'
AM.append(('audit row reads 3.OA.D.8 as dealt (the stories are one step)', r'reads 3\.OA\.D\.8 as dealt', _a1))
def _a2(d, a): a[G + 'doublesandneardoubleswithin20']['ccss']['2.OA.B.2'] = 'Fluently add and subtract within 20 using mental strategies: both operations are dealt with the doubles strategy, every fact within 20'
AM.append(('audit row reads 2.OA.B.2 (subtraction) as dealt', r'reads 2\.OA\.B\.2 as dealt', _a2))
def _a3(d, a): del a[G + 'finddurationsoftime']['ccss']['3.MD.A.1']
AM.append(('audit row missing a site CCSS code', r"does not read the site's 3\.MD\.A\.1", _a3))
def _a4(d, a): a[G + 'compareamountsmorefewersame']['title'] = 'Compare amounts: two groups of 2 to 5 counters, the pupil says which group has more or fewer or whether they are the same, every question kind dealt'
AM.append(('audit row range "groups of 2 to 5" (groups of 1 are dealt)', r'groups of 2 to 5', _a4))
def _a5(d, a): a[G + 'orderfractions'] = {'links': [], 'title': 'x' * 50, 'ccss': {}}
AM.append(('audit row for a lesson that is not full', r'an audit row for a lesson that is not full', _a5))
missed = 0
def runfit(p, extra=None):
    return subprocess.run(['node', os.path.join(H, 'lessonfit.mjs'), p], capture_output=True, text=True, env=dict(env, **(extra or {})))
ONLY = os.environ.get('LESSONMUT_ONLY')   # e.g. LESSONMUT_ONLY=G9: run only the A mutations whose name holds it
for name, target, f in M:
    if ONLY and ONLY not in name: continue
    d = copy.deepcopy(base); f(d); p = os.path.join(TMP, 'm.json'); json.dump(d, open(p, 'w'), ensure_ascii=False)
    r = runfit(p)
    lines = [l.strip() for l in r.stdout.splitlines() if l.startswith('   ')]
    hit = [l for l in lines if re.search(target, l)]
    ok = bool(hit) and r.returncode == 1
    missed += 0 if ok else 1
    print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | A {name}\n      {hit[0][:200] if hit else (lines[:1] or [r.stderr[-200:]])[0][:200]}")
for name, slug, f in CTRL:
    d = copy.deepcopy(base); f(d); p = os.path.join(TMP, 'm.json'); json.dump(d, open(p, 'w'), ensure_ascii=False)
    r = runfit(p)
    bad = [l.strip() for l in r.stdout.splitlines() if l.startswith(G + slug)]
    ok = r.returncode == 0 and not bad
    missed += 0 if ok else 1
    print(f"{'OK    ' if ok else 'FAILED'} exit {r.returncode} | A {name}\n      {(bad or [r.stdout.strip().splitlines()[-1] if r.stdout.strip() else ''])[0][:200]}")
for name, target, f in AM:
    d = copy.deepcopy(base); a = copy.deepcopy(AUD); f(d, a); p = os.path.join(TMP, 'm.json'); json.dump(d, open(p, 'w'), ensure_ascii=False)
    ap = os.path.join(TMP, 'audit.json'); json.dump(a, open(ap, 'w'), ensure_ascii=False)
    r = runfit(p, {'WRM_FULL_AUDIT': ap})
    lines = [l.strip() for l in r.stdout.splitlines() if l.startswith('   ') or l.startswith('FULLAUDIT')]
    hit = [l for l in lines if re.search(target, l)]
    ok = bool(hit) and r.returncode == 1
    missed += 0 if ok else 1
    print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | A audit {name}\n      {hit[0][:200] if hit else (lines[:1] or [''])[0][:200]}")
# ── B. lessons.py checks, through lessons_build.py --dry on a mutated spec ──
SPEC = open(os.path.join(H, 'lessons_spec.py')).read()
B = [('full with a build', "    direct=[('number_sense:doubles_near_doubles', {})],\n    verdict='full',", "    direct=[('number_sense:doubles_near_doubles', {})],\n    verdict='full', build=['mult_three'],", r'full but build'),
     ('rule 15: 2 pre, no "Pre-skills are few"', "         ('division:div_facts', {'constant': [6]}, 'Y4.B4.S2', 'dividing by 6')],", "         ],", r'rule 15'),
     ('related cites a step (belongs in pre)', "related=[('composing:fraction_number_line', {}, 'placing a fraction on a number line')]", "related=[('composing:fraction_number_line', {}, 'Y3.B6.S7 placing a fraction on a number line')]", r'belongs in pre'),
     ('class F key: a pre repeats the partial key', "    pre=[('multiplication:count_by_tables', {'constant': [3]}, 'Y4.B4.S1', 'counting in 3s: one row of the table'),", "    pre=[('multiplication:mult_chart', {'task': 'fill'}, 'Y4.B4.S1', 'counting in 3s: one row of the table'),", r'class F'),
     ('unknown skill key', "('composing:odd_even', {'forms': [2], '@max': 10}", "('composing:odd_or_even', {'forms': [2], '@max': 10}", r'unknown or retired'),
     ('closes names a proposal outside the build', "closes={'mass_scales':", "closes={'nl_20': 'x', 'mass_scales':", r'not its build'),
     ('a lesson left out', "lesson(G + 'selectmoney',", "(lambda *a, **k: None)(G + 'selectmoney',", r'site lesson not tagged'),
     ('rule 5: a partial lesson with no search record', "lesson(G + 'sharingandgroupingfairshares',", "LESSONS[G + 'buildalineplotfrominchmeasurements']['search'] = ''\nlesson(G + 'sharingandgroupingfairshares',", r'rule 5')]
for name, a, b, target in B:
    if a not in SPEC: print(f'MISSED (anchor not found) | B {name}'); missed += 1; continue
    p = os.path.join(TMP, 'spec.py'); open(p, 'w').write(SPEC.replace(a, b, 1))
    r = subprocess.run([sys.executable, os.path.join(H, 'lessons_build.py'), '--spec', p, '--dry'], capture_output=True, text=True, env=env)
    out = r.stdout + r.stderr; hit = re.search(target, out)
    ok = bool(hit) and r.returncode != 0
    missed += 0 if ok else 1
    print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | B {name}\n      {[l for l in out.splitlines() if re.search(target, l)][:1] or out.strip().splitlines()[-1:]}")
# ── C. lessonspec, frozen, lessonmerge ──
S = os.path.join(TMP, 'spec.json'); json.dump(base['lessons'], open(S, 'w'), ensure_ascii=False)
d = copy.deepcopy(base); L(d, 'selectmoney')['pre'][0]['opts'] = {'currency': 'usd', 'kind': 'note'}
p = os.path.join(TMP, 'm.json'); json.dump(d, open(p, 'w'), ensure_ascii=False)
r = subprocess.run([sys.executable, os.path.join(H, 'lessonspec.py'), p, S], capture_output=True, text=True)
r0 = subprocess.run([sys.executable, os.path.join(H, 'lessonspec.py'), Y4, S], capture_output=True, text=True)
ok = r.returncode == 1 and r0.returncode == 0; missed += 0 if ok else 1
print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} (unmutated {r0.returncode}) | C lessonspec: re-option after finish(), money_count kind both -> note")
FROZ = [('a step\'s verdict', lambda d: d['steps']['Y4.B1.S1'].update(verdict='partial')),
        ('a tagFix why', lambda d: d['tagFixes'][0].update(why=d['tagFixes'][0]['why'] + ' ')),
        ('a step proposal\'s teaches', lambda d: d['proposals']['mult_three'].update(teaches='multiplying')),
        ('a step proposal\'s steps (a lesson id added)', lambda d: d['proposals']['time_units']['steps'].append(G + 'comparedurationsoftime')),
        ('a step proposal given a non-lesson closes key', lambda d: d['proposals']['mult_three'].update(closes={'Y4.B4.S13': 'x'}))]
for name, f in FROZ:
    d = copy.deepcopy(base); f(d); json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)
    r = subprocess.run([sys.executable, os.path.join(H, 'lessons_build.py'), '--frozen-check', p], capture_output=True, text=True)
    ok = r.returncode != 0 and 'FROZEN' in (r.stdout + r.stderr); missed += 0 if ok else 1
    print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | C frozen: {name} changed")
r0 = subprocess.run([sys.executable, os.path.join(H, 'lessons_build.py'), '--frozen-check', Y4], capture_output=True, text=True)
ok = r0.returncode == 0; missed += 0 if ok else 1
print(f"{'OK    ' if ok else 'FAILED'} exit {r0.returncode} | C frozen: the built file passes unmutated")
d = copy.deepcopy(base); d['tagFixes'].append({'key': 'number_sense:doubles_near_doubles', 'step': G + 'doublesandneardoubleswithin20', 'action': 'add', 'why': 'lesson'})
json.dump(d, open(p, 'w'), ensure_ascii=False)
r = subprocess.run(['node', os.path.join(H, 'lessonmerge.mjs'), p], capture_output=True, text=True, env=env)
ok = r.returncode == 1 and 'tagFix names a site lesson' in r.stdout; missed += 0 if ok else 1
print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | C lessonmerge: a tagFix names a site lesson")
d = copy.deepcopy(base); del d['lessons'][G + 'selectmoney']; json.dump(d, open(p, 'w'), ensure_ascii=False)
r = subprocess.run(['node', os.path.join(H, 'lessonmerge.mjs'), p], capture_output=True, text=True, env=env)
ok = r.returncode == 1 and 'site lesson not in the lessons section' in r.stdout; missed += 0 if ok else 1
print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | C lessonmerge: a site lesson missing from the section")
d = copy.deepcopy(base); d['proposals']['make_amount_notes']['teaches'] = 'x'; json.dump(d, open(p, 'w'), ensure_ascii=False)
r = subprocess.run(['node', os.path.join(H, 'lessonmerge.mjs'), p, R + 'data/curriculum/links/Y3.json'], capture_output=True, text=True, env=env)
ok = r.returncode == 1 and "differs from Y3's in teaches" in r.stdout; missed += 0 if ok else 1
print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | C lessonmerge: a proposal shared with Y3.json differs in teaches")
# ── D. lessoncheck.py: an edit made after finish(), on the written file, against the snapshot finish() returned ──
def _plf(p): return {'lessons': copy.deepcopy(p.get('lessons')), 'closes': {k: v for k, v in p['closes'].items() if '|-|' in k} if isinstance(p.get('closes'), dict) else None}
BASE_PIDS = set(json.loads(re.search(r'^BASE_PIDS = (\[.*\])$', open(os.path.join(H, 'lessons_build.py')).read(), re.M).group(1)))
SN = os.path.join(TMP, 'snap.json')
SNAPD = {'lessons': base['lessons'], 'newIds': sorted(q for q, p in base['proposals'].items() if p.get('reused') is False and not p.get('steps') and p.get('lessons') and q not in BASE_PIDS),
         'proposals': {q: _plf(p) for q, p in base['proposals'].items() if p.get('lessons') or (isinstance(p.get('closes'), dict) and any('|-|' in k for k in p['closes']))},
         'proposalsFull': {q: p for q, p in base['proposals'].items() if p.get('lessons')}}
json.dump(SNAPD, open(SN, 'w'), ensure_ascii=False)
KJ = os.path.join(os.environ.get('WRM_TAG_DATA') or TMP, 'keys.json')
if not os.path.exists(KJ): subprocess.run(['node', os.path.join(H, 'keys.mjs'), KJ], check=True, env=env)
def _p4(d):
    q = [x for x in d['proposals'] if (d['proposals'][x].get('lessons') or []) and d['proposals'][x].get('reused') is False and x not in BASE_PIDS][0]
    d['proposals'][q]['lessons'] = []
D = [('p1 re-option of a pre', lambda d: L(d, 'selectmoney')['pre'][0]['opts'].update(kind='note')),
     ('p2 a partial lesson flipped to full', lambda d: L(d, 'orderfractions').update(verdict='full')),
     ('p3 a base proposal\'s closes[lesson] changed', lambda d: d['proposals']['time_units']['closes'].update({G + 'comparedurationsoftime': 'counting to 100'})),
     ('p4 a lesson-only proposal\'s lessons emptied', _p4),
     ('p5 a lesson\'s missing changed', lambda d: L(d, 'selectmoney').update(missing='counting to 20')),
     ('p6 a lesson\'s rule-5 record emptied', lambda d: L(d, 'selectmoney').update(rule5='')),
     ('p7 a FULL lesson given a build', lambda d: L(d, 'doublesandneardoubleswithin20').update(build=['mult_three'])),
     ('p8 a pre why changed', lambda d: L(d, 'selectmoney')['pre'][1].update(why=L(d, 'selectmoney')['pre'][1]['why'] + ' (to 100)')),
     ('a lesson note changed', lambda d: L(d, 'selectmoney').update(note='x')),
     ('an envision closes changed', lambda d: L(d, 'selectmoney')['envision'][0].update(closes='y')),
     ('a FULL lesson back to partial with its audit row kept', lambda d: L(d, 'countmoneynotesandcoins').update(verdict='partial')),
     ('a new proposal\'s teaches changed', lambda d: d['proposals']['estimate_mass_volume'].update(teaches='estimating')),
     ('a live copy (patterns_notice, STANDARD_PROPOSALS) name changed', lambda d: d['proposals']['patterns_notice'].update(name='x')),
     ('a lane copy (make_amount_notes, Y3.json) kind changed', lambda d: d['proposals']['make_amount_notes'].update(kind='new')),
     ('a base proposal (balance-less: time_units) lessons list changed', lambda d: d['proposals']['time_units'].update(lessons=[]))]
r0 = subprocess.run([sys.executable, os.path.join(H, 'lessoncheck.py'), Y4, SN, KJ], capture_output=True, text=True)
ok = r0.returncode == 0; missed += 0 if ok else 1
print(f"{'OK    ' if ok else 'FAILED'} exit {r0.returncode} | D lessoncheck: the built file passes unmutated {r0.stdout.strip().splitlines()[-1:]}")
for name, f in D:
    d = copy.deepcopy(base); f(d); json.dump(d, open(p, 'w'), ensure_ascii=False)
    r = subprocess.run([sys.executable, os.path.join(H, 'lessoncheck.py'), p, SN, KJ], capture_output=True, text=True)
    ok = r.returncode == 1; missed += 0 if ok else 1
    print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | D lessoncheck: {name}\n      {r.stdout.strip().splitlines()[:1]}")
for name, pid, f in [('make_amount_notes (Y3.json copy) teaches, snapshot edited too', 'make_amount_notes', lambda p: p.update(teaches='x')),
                     ('frac_compare_same_part (Y5.json copy) name, snapshot edited too', 'frac_compare_same_part', lambda p: p.update(name='x')),
                     ('capacity_early (WRM_PROPOSALS copy) teaches, snapshot edited too', 'capacity_early', lambda p: p.update(teaches='x'))]:
    d = copy.deepcopy(base); f(d['proposals'][pid]); json.dump(d, open(p, 'w'), ensure_ascii=False)
    sn = copy.deepcopy(SNAPD); f(sn['proposalsFull'][pid]); sp = os.path.join(TMP, 'snap2.json'); json.dump(sn, open(sp, 'w'), ensure_ascii=False)
    r = subprocess.run([sys.executable, os.path.join(H, 'lessoncheck.py'), p, sp, KJ], capture_output=True, text=True)
    ok = r.returncode == 1 and 'differs from' in r.stdout; missed += 0 if ok else 1; D.append((name, None))
    print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | D lessoncheck source gate: {name}\n      {r.stdout.strip().splitlines()[:1]}")
n = len(M) + len(CTRL) + len(AM) + len(B) + 1 + len(FROZ) + 1 + 3 + len(D) + 1
print(f'lessonmut: {n} mutations and controls, {missed} missed')
sys.exit(1 if missed else 0)
