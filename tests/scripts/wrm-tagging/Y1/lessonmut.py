"""Proof that every Y1 site-lesson gate fires: one mutation per failure class, each run through the gate that owns it, and each must be
CAUGHT by that gate's own message (the Y6 lane's lessonmut.py, for the Kindergarten / Reception gates).
  A. lessonfit.mjs, on a mutated copy of the built Y1.json (SIZE, CONTENT, RESPONSE, CITE, WHY, CLAUSE, OWN / DUP, M, TITLEREP, RANGE)
  B. build.py --spec <mutated spec> --dry: the lesson checks of lessons.py (verdict shape, rule 15, related citing, class F keys …)
  C. lessonspec.py: a re-option after finish(); build.py --frozen-check: a frozen step / tagFix / step proposal changed;
     mergecheck.mjs: a tagFix that names a lesson
  D. lessoncheck.py (lessons critic r1 G1): edits to the WRITTEN file after finish() (the critic's p1-p8 and more) against the
     snapshot of the unmutated file
usage: python3 tests/scripts/wrm-tagging/Y1/lessonmut.py      (exit 1 if any mutation is missed)"""
import json, copy, subprocess, os, sys, tempfile, re
H = os.path.dirname(os.path.abspath(__file__))
R = os.path.abspath(os.path.join(H, '..', '..', '..', '..')) + '/'
Y1 = R + 'data/curriculum/links/Y1.json'
base = json.load(open(Y1))
K = 'K|-|'
def L(d, slug): return d['lessons'][K + slug]
TMP = tempfile.mkdtemp(prefix='y1-lessonmut-')
env = dict(os.environ)
M = []
def m(name, target):
    def deco(f): M.append((name, target, f)); return f
    return deco
# ── A. lessonfit.mjs ──
@m('SIZE: Reception 1-2-3 lesson pre count_objects band 20', r'size \d+ >')
def _(d): L(d, 'compositionof123partsmakethewhole')['pre'].append({'key': 'counting:count_objects', 'opts': {'band': 20}, 'why': 'R.B1.S4 Sort objects to a type (Pre-K, block R.B1, before this Support lesson\'s source phase): counting'})
@m('CONTENT FLAGS: Support lesson related multiplication (x)', r'uses x or ÷')
def _(d): L(d, 'makingpairs')['related'].append({'key': 'multiplication:mult_facts', 'why': 'groups of two'})
@m('CONTENT R_EQ: Support lesson pre on a number line', r'R_EQ')
def _(d): L(d, 'takingaway')['pre'].append({'key': 'subtraction:number_line_sub', 'maxNumber': 10, 'why': 'R.B11.S6 1 less (Pre-K, block R.B11, before this Support lesson\'s source phase): one less'})
@m('CONTENT quad: Phase 3 lesson related with squares and rectangles', r'squares and rectangles')
def _(d): L(d, 'compositionof123partsmakethewhole')['related'].append({'key': 'counting:count_objects', 'opts': {'band': 5, 'objects': 'shapes'}, 'why': 'counting a small group'})
@m('CONTENT rule 19: W21 lesson pre counting in 2s (first taught W33)', r'rule 19: counting in 2s')
def _(d): L(d, 'sortintocategoriescounteachgroupandfindthetotal')['pre'].append({'key': 'patterns:skip_count_line', 'opts': {'step': [0], 'band': 50}, 'why': 'Y1.B9.S1 Count in 2s (taught earlier this year, wk W33): counting'})
@m('CONTENT week limit: W15 lesson related with numbers to 100', r'past 100|past 20|numbers to \d+, past')
def _(d): L(d, 'addandsubtractwithin5writtenverticallycolumnform')['related'].append({'key': 'counting:number_seq_fill', 'opts': {'step': 1}, 'maxNumber': 1000, 'why': 'counting on'})
@m('CONTENT degenerate: compose_shapes {shapes:[1]} (2 distinct items)', r'degenerate')
def _(d): L(d, 'explore2dshapescircletrianglerectanglesquare')['related'][0]['opts'] = {'shapes': [1]}
@m('CITE H: Support lesson cites a Kindergarten step', r'H: cites Y1')
def _(d): L(d, 'takingaway')['pre'][0]['why'] = 'Y1.B1.S9 1 less (taught earlier this year, wk W03): one less'
@m('CITE H: Support lesson cites a Reception step of its own phase', r'not before this Support lesson\'s source phase')
def _(d): L(d, 'takingaway')['pre'][0]['why'] = 'R.B14.S4 How many did I take away (Pre-K, block R.B14, before this Support lesson\'s source phase): one less'
@m('CITE rule 19: W21 lesson cites a step taught W23', r'rule 19: cites Y1.B1.S1')
def _(d): L(d, 'sortintocategoriescounteachgroupandfindthetotal')['pre'][0]['why'] = 'Y1.B1.S1 Sort objects (taught later, wk W23): sorting'
@m('CITE: pre cites a step its key is not tagged to', r'not tagged to')
def _(d): L(d, 'takingaway')['pre'][2]['why'] = 'R.B4.S1 Identify and name circles and triangles (Pre-K, block R.B4, before this Support lesson\'s source phase): counting'
@m('CITE: why without the cited unit\'s own title', r'own title')
def _(d): L(d, 'takingaway')['pre'][2]['why'] = 'R.B11.S1 Count to ten (Pre-K): counting'
@m('WHY shape: count_objects why names a number line', r'number line')
def _(d): L(d, 'takingaway')['pre'][2]['why'] += ', shown on a number line'
@m('WHY K word: compare_objects why says heavier', r'heavier')
def _(d): L(d, 'comparecapacity2')['pre'][0]['why'] = L(d, 'comparecapacity2')['pre'][0]['why'].split(':')[0] + ': which object is heavier'
@m('WHY bound: number_bonds band 10 why says "to 5"', r'pass 5')
def _(d): L(d, 'takingaway')['pre'][1]['why'] += ' (wholes to 5)'
@m('CLAUSE bound: add_wp_10 band 10 clause says "within 5"', r'pass 5')
def _(d): L(d, 'addingmorefirstthennowstories')['partial'][1]['missing'] = 'add-more stories within 5 told in words'
@m('CLAUSE negated op: add_5_pictures clause "never adds"', r'is not dealt')
def _(d): L(d, 'combining2groups')['partial'][0]['missing'] = 'pictured groups; never adds'
@m('CLAUSE claim: sub_5_pictures clause says money', r'clause claims')
def _(d): L(d, 'takingaway')['partial'][0]['missing'] = 'takes away coins and money from 5'
@m('OWN class F: a pre that deals the lesson\'s own items', r'class F')
def _(d): L(d, 'compositionof4and5bonds')['pre'].append({'key': 'composing:number_bonds', 'opts': {'band': 5}, 'why': 'R.B5.S6 Composition of 4 and 5 (Pre-K, block R.B5, before this Support lesson\'s source phase): bonds'})
@m('DUP: two related links with the same items', r'duplicate')
def _(d): L(d, 'takingaway')['related'].append(copy.deepcopy(L(d, 'takingaway')['related'][0]) | {'why': 'joining two groups again'})
@m('M: a clause denies what compose_shapes shapes=1 "A square or a rectangle" deals, and no link uses it', r'^M: ')
def _(d): l = L(d, 'shapeswith4sidessquaresandrectangles'); l['partial'][0]['missing'] = 'clicks every square or rectangle; never counts the 4 sides and 4 corners that make it a square or a rectangle'; l['related'][0]['opts'] = {'shapes': [0]}; l['note'] = l['note'].replace('compose_shapes', 'the composing skill')
@m('TITLEREP FULL: 3-D lesson made full (the cuboid is never asked)', r'TITLEREP FULL.*cuboid')
def _(d): l = L(d, '3dshapescubecuboidsphereconecylinder'); l.update(verdict='full', missing='', build=[], direct=[{'key': 'shapes_early:name_3d_shapes', 'opts': {'forms': [1]}}], partial=[])
@m('TITLEREP CLAUSE: vertical lesson clause never names the vertical form', r'TITLEREP CLAUSE.*vertically')
def _(d): l = L(d, 'addandsubtractwithin5writtenverticallycolumnform'); l.update(verdict='partial', direct=[], build=['add_10_pictures'], missing='addition and subtraction facts within 5', partial=[{'key': 'addition:add_facts', 'opts': {'notation': ['across'], 'band': 5}, 'missing': 'addition facts within 5; never a subtraction'}])
@m('G2 NOPIC: lesson 12 clause "told in words, no pictures to count" (the story cell pictures both groups)', r'says no pictures, but')
def _(d): L(d, 'combining2groups')['partial'][1]['missing'] = 'combine and add-more stories with totals to 7, told in words, no pictures to count'
@m('G2 ASKED: lesson 24 clause "clicks every ... rectangular prism" (the prism is only drawn)', r'asked for the cuboid')
def _(d): L(d, 'deepeningunderstandingconsolidate2d3dshapes')['partial'][1]['missing'] = 'clicks every sphere, cylinder, cube, cone or rectangular prism among other solids; never links a solid to its flat faces'
@m('G2 share: lesson 25 related share_into_groups band 12 why "sharing a group equally" (the items group)', r'why says "sharing"')
def _(d): L(d, 'doublingupto55')['related'] = [{'key': 'division:share_into_groups', 'opts': {'band': 12}, 'why': 'sharing a group equally: the inverse of doubling'}]
@m('G3 column: lesson 22 related add_facts across band 5 why "written in a column"', r'why says column but no item is in columns')
def _(d): L(d, 'compositionof4and5bonds')['related'].append({'key': 'addition:add_facts', 'opts': {'notation': ['across'], 'band': 5}, 'why': 'facts within 5 written in a column'})
@m('G5 bound: lesson 9 pre number_bonds why "(wholes to 20)" on band 10', r'says "wholes to 20" but the largest number dealt is')
def _(d): L(d, 'bondsto10explorecombinationsthatmake10')['pre'][0]['why'] += ' (wholes to 20)'
@m('G4 FULLAUDIT: lesson 26 made FULL (no hand-audit row against K.G.A.2)', r'FULLAUDIT: full, but no hand-audit row')
def _(d): l = L(d, 'explore2dshapescircletrianglerectanglesquare'); l.update(verdict='full', missing='', build=[], envision=[], direct=[{'key': 'shapes_early:name_2d_shapes', 'opts': {'forms': [1], 'shapes': [0, 1, 2]}}], partial=[])
@m('G4 FULLAUDIT: lesson 5 direct re-optioned away from its audit row', r"FULLAUDIT: the audit row's links")
def _(d): L(d, '3dshapescubecuboidsphereconecylinder')['direct'] = [{'key': 'shapes_early:name_3d_shapes', 'opts': {'forms': [0]}}]
@m('RANGE full: 1-2-3 lesson made full on number_bonds band 5', r'RANGE: full')
def _(d): l = L(d, 'compositionof123partsmakethewhole'); l.update(verdict='full', missing='', build=[], direct=[{'key': 'composing:number_bonds', 'opts': {'band': 5}}], partial=[])
@m('RANGE partial: clause silent on numbers past the lesson', r'RANGE: \d+ items')
def _(d): L(d, 'sortobjectsbyoneattributecoloursizeshape')['partial'][0]['missing'] = 'counts one kind of picture in a mixed bag; never sorts every object into groups, never by colour or size'
@m('RESPONSE: a full Support lesson on a symbol number line', r'RESPONSE')
def _(d): L(d, 'bondsto10explorecombinationsthatmake10')['direct'].append({'key': 'addition:number_line_add', 'opts': {}, 'maxNumber': 10})
@m('RESPONSE: a full Kindergarten lesson with × items', r'RESPONSE.*uses x')
def _(d): L(d, 'composeshapesfromsmallershapes')['direct'].append({'key': 'shapes_early:compose_rect_from_squares', 'opts': {}})
missed = 0
for name, target, f in M:
    d = copy.deepcopy(base); f(d); p = os.path.join(TMP, 'm.json'); json.dump(d, open(p, 'w'), ensure_ascii=False)
    r = subprocess.run(['node', os.path.join(H, 'lessonfit.mjs'), p], capture_output=True, text=True, env=env)
    lines = [l.strip() for l in r.stdout.splitlines() if l.startswith('   ')]
    hit = [l for l in lines if re.search(target, l)]
    ok = bool(hit) and r.returncode == 1
    missed += 0 if ok else 1
    print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | A {name}\n      {hit[0][:200] if hit else (lines[:1] or [''])[0][:200]}")
# ── B. lessons.py checks, through build.py --dry on a mutated spec ──
SPEC = open(os.path.join(H, 'spec_lessons.py')).read()
B = [('full with a build', "    direct=[('composing:make_ten', {'band': 10})],\n    verdict='full',", "    direct=[('composing:make_ten', {'band': 10})],\n    verdict='full', build=['number_focus'],", r'full but build'),
     ('rule 15: 2 pre, no "Pre-skills are few"', "         ('comparing:compare_groups', {'band': 5, 'level': [1]}, 'R.B1.S7', 'fewer: none is the fewest of all')],", "         ],", r'rule 15'),
     ('related cites a step (belongs in pre)', "related=[('addition:add_5_pictures', {}, 'the inverse: join two groups and say how many in all')]", "related=[('addition:add_5_pictures', {}, 'R.B9.S9 the inverse: join two groups and say how many in all')]", r'belongs in pre'),
     ('class F key: a pre repeats the partial key', "    pre=[('counting:count_sequence', {'band': 10, 'dir': 'back'}, 'R.B11.S6', 'one less: taking one away'),", "    pre=[('subtraction:sub_5_pictures', {'objects': 'pictures'}, 'R.B11.S6', 'one less: taking one away'),", r'class F'),
     ('unknown skill key', "('composing:make_ten', {'band': 5}, 'how many more make 5: the missing part of a fact within 5')", "('composing:make_eleven', {'band': 5}, 'how many more make 5')", r'unknown or retired'),
     ('closes names a proposal outside the build', "    closes={'sort_groups': 'sorting every object", "    closes={'nl_20': 'x', 'sort_groups': 'sorting every object", r'not its build'),
     ('a lesson left out', "lesson(K_ + 'takingaway',", "(lambda *a, **k: None)(K_ + 'takingaway',", r'site lesson not tagged')]
for name, a, b, target in B:
    if a not in SPEC: print(f'MISSED (anchor not found) | B {name}'); missed += 1; continue
    p = os.path.join(TMP, 'spec.py'); open(p, 'w').write(SPEC.replace(a, b, 1))
    r = subprocess.run([sys.executable, os.path.join(H, 'build.py'), '--spec', p, '--dry'], capture_output=True, text=True, env=env)
    out = r.stdout + r.stderr; hit = re.search(target, out)
    ok = bool(hit) and r.returncode != 0
    missed += 0 if ok else 1
    print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | B {name}\n      {[l for l in out.splitlines() if re.search(target, l)][:1] or out.strip().splitlines()[-1:]}")
# ── C. lessonspec, frozen, mergecheck ──
S = os.path.join(TMP, 'spec.json'); json.dump(base['lessons'], open(S, 'w'), ensure_ascii=False)
d = copy.deepcopy(base); L(d, 'takingaway')['pre'][0]['opts'] = {'band': 20, 'dir': 'back'}
p = os.path.join(TMP, 'm.json'); json.dump(d, open(p, 'w'), ensure_ascii=False)
r = subprocess.run([sys.executable, os.path.join(H, 'lessonspec.py'), p, S], capture_output=True, text=True)
r0 = subprocess.run([sys.executable, os.path.join(H, 'lessonspec.py'), Y1, S], capture_output=True, text=True)
ok = r.returncode == 1 and r0.returncode == 0; missed += 0 if ok else 1
print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} (unmutated {r0.returncode}) | C lessonspec: re-option after finish(), count_sequence band 10 -> 20")
for name, f in [('a step\'s verdict', lambda d: d['steps']['Y1.B1.S2'].update(verdict='partial')),
                ('a tagFix why', lambda d: d['tagFixes'][0].update(why=d['tagFixes'][0]['why'] + ' ')),
                ('a step proposal\'s teaches', lambda d: d['proposals']['sort_groups'].update(teaches='sorting')),
                ('a step proposal\'s steps (a lesson id added)', lambda d: d['proposals']['zero']['steps'].append('K|-|introducingzero'))]:
    d = copy.deepcopy(base); f(d); json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)
    r = subprocess.run([sys.executable, os.path.join(H, 'build.py'), '--frozen-check', p], capture_output=True, text=True)
    ok = r.returncode != 0 and 'FROZEN' in (r.stdout + r.stderr); missed += 0 if ok else 1
    print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | C frozen: {name} changed")
r0 = subprocess.run([sys.executable, os.path.join(H, 'build.py'), '--frozen-check', Y1], capture_output=True, text=True)
ok = r0.returncode == 0; missed += 0 if ok else 1
print(f"{'OK    ' if ok else 'FAILED'} exit {r0.returncode} | C frozen: the built file passes unmutated")
d = copy.deepcopy(base); d['tagFixes'].append({'key': 'composing:make_ten', 'step': K + 'bondsto10explorecombinationsthatmake10', 'action': 'add', 'why': 'lesson'})
json.dump(d, open(p, 'w'), ensure_ascii=False)
r = subprocess.run(['node', os.path.join(H, 'mergecheck.mjs'), p], capture_output=True, text=True)
ok = r.returncode == 1 and 'tagFix names a site lesson' in r.stdout; missed += 0 if ok else 1
print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | C mergecheck: a tagFix names a site lesson")
d = copy.deepcopy(base); del d['lessons'][K + 'takingaway']; json.dump(d, open(p, 'w'), ensure_ascii=False)
r = subprocess.run(['node', os.path.join(H, 'mergecheck.mjs'), p], capture_output=True, text=True)
ok = r.returncode == 1 and 'site lesson not in the lessons section' in r.stdout; missed += 0 if ok else 1
print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | C mergecheck: a site lesson missing from the section")
# ── D. lessoncheck.py (critic r1 G1): an edit made after finish(), on the written file, against the snapshot finish() returned ──
def _plf(p): return {'lessons': copy.deepcopy(p.get('lessons')), 'lessonCloses': copy.deepcopy(p.get('lessonCloses')),
                     'closes': {k: v for k, v in p['closes'].items() if '|-|' in k} if isinstance(p.get('closes'), dict) else None}
SN = os.path.join(TMP, 'snap.json')
json.dump({'lessons': base['lessons'], 'newIds': sorted(q for q, p in base['proposals'].items() if p.get('reused') is False and not p.get('steps') and p.get('lessons')),
           'proposals': {q: _plf(p) for q, p in base['proposals'].items() if p.get('lessons') or p.get('lessonCloses') or (isinstance(p.get('closes'), dict) and any('|-|' in k for k in p['closes']))}},
          open(SN, 'w'), ensure_ascii=False)
def _p7(d): L(d, 'bondsto10explorecombinationsthatmake10')['build'] = ['zero']
def _p4(d):
    q = [x for x in d['proposals'] if (d['proposals'][x].get('lessons') or []) and d['proposals'][x].get('reused') is False and not d['proposals'][x].get('steps')][0]
    d['proposals'][q]['lessons'] = []
D = [('p1 re-option of lesson 39 pre count_sequence to band 20', lambda d: L(d, 'takingaway')['pre'][0]['opts'].update(band=20)),
     ('p2 lesson 26 verdict flipped to full', lambda d: L(d, 'explore2dshapescircletrianglerectanglesquare').update(verdict='full')),
     ('p3 zero.lessonCloses[introducingzero] = "counting to 100"', lambda d: d['proposals']['zero'].setdefault('lessonCloses', {}).update({K + 'introducingzero': 'counting to 100'})),
     ('p4 a lesson-only proposal\'s lessons emptied', _p4),
     ('p5 lesson 39 missing changed', lambda d: L(d, 'takingaway').update(missing='taking away from 20 with a number line')),
     ('p7 FULL lesson 9 given build zero', _p7),
     ('p8 lesson 39 pre why "wholes to 100"', lambda d: L(d, 'takingaway')['pre'][1].update(why=L(d, 'takingaway')['pre'][1]['why'] + ' (wholes to 100)')),
     ('a lesson note changed', lambda d: L(d, 'makingpairs').update(note='x')),
     ('an envision closes changed', lambda d: L(d, 'takingaway')['envision'][0].update(closes='y')),
     ('a FULL lesson\'s audit row: lesson 1 back to partial with its row kept', lambda d: L(d, 'addandsubtractwithin5writtenverticallycolumnform').update(verdict='partial'))]
r0 = subprocess.run([sys.executable, os.path.join(H, 'lessoncheck.py'), Y1, SN], capture_output=True, text=True)
ok = r0.returncode == 0; missed += 0 if ok else 1
print(f"{'OK    ' if ok else 'FAILED'} exit {r0.returncode} | D lessoncheck: the built file passes unmutated")
for name, f in D:
    d = copy.deepcopy(base); f(d); json.dump(d, open(p, 'w'), ensure_ascii=False)
    r = subprocess.run([sys.executable, os.path.join(H, 'lessoncheck.py'), p, SN], capture_output=True, text=True)
    ok = r.returncode == 1; missed += 0 if ok else 1
    print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} | D lessoncheck: {name}\n      {r.stdout.strip().splitlines()[:1]}")
n = len(M) + len(B) + 1 + 4 + 2 + 1 + len(D)
print(f'lessonmut: {n} mutations, {missed} missed')
sys.exit(1 if missed else 0)
