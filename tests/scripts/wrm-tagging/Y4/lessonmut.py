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
for name, target, f in M:
    d = copy.deepcopy(base); f(d); p = os.path.join(TMP, 'm.json'); json.dump(d, open(p, 'w'), ensure_ascii=False)
    r = runfit(p)
    lines = [l.strip() for l in r.stdout.splitlines() if l.startswith('   ')]
    hit = [l for l in lines if re.search(target, l)]
    ok = bool(hit) and r.returncode == 1
    missed += 0 if ok else 1
    print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | A {name}\n      {hit[0][:200] if hit else (lines[:1] or [r.stderr[-200:]])[0][:200]}")
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
n = len(M) + len(AM) + len(B) + 1 + len(FROZ) + 1 + 3 + len(D) + 1
print(f'lessonmut: {n} mutations and controls, {missed} missed')
sys.exit(1 if missed else 0)
