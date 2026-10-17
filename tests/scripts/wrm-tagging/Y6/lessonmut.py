"""Proof that every site-lesson gate fires: 15 mutations of the built Y6.json lessons, one failure class each (the Y5 critics r5-r8
and the Y2-Y3 critics r12-r15), each run through lessonfit.mjs; every one must be CAUGHT by its own gate's message.
usage: python3 tests/scripts/wrm-tagging/Y6/lessonmut.py      (exit 1 if any mutation is missed)"""
import json, copy, subprocess, os, sys, tempfile, re
H = os.path.dirname(os.path.abspath(__file__))
R = os.path.abspath(os.path.join(H, '..', '..', '..', '..')) + '/'; base=json.load(open(R+'data/curriculum/links/Y6.json'))
G='G5|-|'
def L(d, slug): return d['lessons'][G+slug]
M = {}
def m(name):
    def deco(f): M[name]=f; return f
    return deco
@m('N  re-option: L1 related unit_form rename more -> standard, why still "renaming"')
def _(d): L(d,'comparedigitvaluesadigitisworth10timestheplacetoitsrightand110oftheplacetoitsleft')['related'][0]['opts']={'band':9999,'rename':'standard'}
@m('TITLEREP FULL: customary length lesson made full on length_metric')
def _(d): l=L(d,'convertcustomaryunitsoflengthinchesfeetyardsmiles'); l.update(verdict='full', missing='', build=[], partial=[], direct=[{'key':'measurement:length_metric','opts':{}}])
@m('TITLEREP CLAUSE: line-plot lesson partial swapped to fraction adding, clause never names the line plot')
def _(d): l=L(d,'fractionlineplots'); l['missing']='using fraction operations on data'; l['partial']=[{'key':'fraction_operations:add_fractions_like','missing':'adds two fractions with one denominator'}]
@m('K customary on a metric lesson (title made metric)')
def _(d): l=L(d,'volumeofcompositesolids'); l['title']='Volume in cubic centimetres and litres'; l['related'].append({'key':'measurement:unit_conversions','opts':{'units':[1],'forms':[0]},'why':'conversions'})
@m('H Support pre harder than its source: Order fractions pre compare {} (unlike pairs)')
def _(d): L(d,'orderfractions')['pre'].append({'key':'fractions:compare','why':'Y3.B6.S2 Compare and order unit fractions (Grade 2): comparing'})
@m('H Support cites above source: Write decimals pre cites a Y6 step')
def _(d): L(d,'writedecimals')['pre'][0]['why']='Y6.B9.S1 Decimal and fraction equivalents (taught earlier): a decimal as a fraction'
@m('rule 19: W08 lesson pre with fraction x fraction (W17)')
def _(d): L(d,'dividebyadecimal')['pre'].append({'key':'fraction_operations:mult_frac_frac','why':'Y6.B4.S2 Multiply fractions by fractions (taught later): fractions'})
@m('DENOMS: equiv_frac_visual {denoms:[2]} why "halves and quarters" (payload has thirds, fifths)')
def _(d): L(d,'fractionlineplots')['related'].append({'key':'fractions:equiv_frac_visual','opts':{'denoms':[2]},'why':'halves and quarters shown as equal pictures'})
@m('F: a pre that deals the lesson\'s own items')
def _(d): L(d,'divideawholenumberbyaunitfraction')['pre'].append({'key':'fraction_operations:div_unit_frac_nv','opts':{'forms':[0,1]},'why':'Y6.B4.S3 Divide a fraction by an integer (taught earlier this year, wk W17): dividing'})
@m('RANGE: Support lesson made full on a 1,000,000 band (source Y4)')
def _(d): l=L(d,'dividea2digitnumberby100'); l.update(verdict='full', missing='', build=[], partial=[], direct=[{'key':'placevalue:place_value_10x','opts':{'op':'/','band':1000000}}])
@m('M: a clause denies a story that volume forms=2 deals')
def _(d): L(d,'problemsolvingacrossstrands')['partial'].append({'key':'area_perimeter:volume','opts':{'forms':[0]},'missing':'never a story (a box, a tank)'})
@m('CITE: pre cites a step its key is not tagged to')
def _(d): L(d,'multiplicationasscaling')['pre'][1]['why']='Y6.B3.S4 Compare and order (numerator) (taught earlier this year, wk W15): times as many'
@m('CLAUSE negated op: div_decimal partial clause "never divides"')
def _(d): L(d,'dividebyadecimal')['partial'][0]['missing']='a whole number by a tenths decimal; never divides by a decimal'
@m('G: a decimals lesson made full with whole-number items')
def _(d): l=L(d,'dividebyadecimal'); l.update(verdict='full', missing='', build=[], partial=[], direct=[{'key':'division:box_division_hard','opts':{}}])
@m('claims: a why that says "number line" on items with no line')
def _(d): L(d,'consolidationofarithmetic')['related'][0]['why']='expressions with parentheses, shown on a number line'
# lessons critic r1 F3, F4, F6 (its own mutations 1, 3, 4, 7, 12, and the two committed r1 defects)
@m('F3 Support (src Y3) related round_thousandths: thousandths above the source year')
def _(d): L(d,'orderfractions')['related'].append({'key':'decimals:round_thousandths','why':'rounding decimals to the nearest tenth'})
@m('F3 lesson 24 as committed in r1: related compare_decimal {} deals thousandths')
def _(d): L(d,'writedecimals')['related'][0]['opts']={}
@m('F4 nested_complex clause "never square brackets" (the items have [ ])')
def _(d): L(d,'evaluateexpressionswithparenthesesbracketsandbraces')['partial'][0]['missing']='parentheses only; never square brackets and never braces { }'
@m('F4 place_value_10x clause "never a 3-digit number" (3-digit dealt)')
def _(d): L(d,'multiplyanddividedecimalsbypowersof10writtenwithexponents101102103andexplainthepattern')['partial'][0]['missing']='multiplies and divides by 10, 100 and 1,000; never a 3-digit number and never an exponent'
@m('F4 lesson 21 as committed in r1: "never a 2-digit number" (2-digit dividends now and then)')
def _(d): L(d,'dividea2digitnumberby100')['partial'][0]['missing']='divides 3-digit numbers by 100 (697 ÷ 100 = 6.97); never a 2-digit number (34 ÷ 100 = 0.34)'
@m('F6 lesson 6 made FULL on nested_complex (braces never dealt)')
def _(d): l=L(d,'evaluateexpressionswithparenthesesbracketsandbraces'); l.update(verdict='full',missing='',build=[],direct=[{'key':'order_of_operations:nested_complex','opts':{'band':50}}],partial=[])
@m('F6 lesson 13 made FULL on unit_conversions customary (smaller to larger rare, weight and capacity mixed)')
def _(d): l=L(d,'convertcustomaryunitsoflengthinchesfeetyardsmiles'); l.update(verdict='full',missing='',build=[],direct=[{'key':'measurement:unit_conversions','opts':{'units':[1],'forms':[0]}}],partial=[]); l['related']=[]
@m('T  why "the 7 times-table" on mult_facts {constant:[12]} (critic mutation 5)')
def _(d): L(d,'convertcustomaryunitsoflengthinchesfeetyardsmiles')['pre'][1]['why']='Y4.B4.S10 12 times-table and division facts (Grade 3, lower grade): the 7 times-table (× 7)'
TG={'T  why': 'times-table', 'F3 ': 'SUPPORT: thousandths', 'F4 nested': 'never square brackets', 'F4 place': 'never a 3-digit', 'F4 lesson 21': 'never a 2-digit', 'F6 lesson 6': 'TITLEREP FULL.*braces', 'F6 lesson 13': 'TITLEREP FULL.*(larger unit|customary length)', 'N ': 'renamed unit form', 'TITLEREP FULL': 'TITLEREP FULL', 'TITLEREP CLAUSE': 'TITLEREP CLAUSE', 'K ': 'on a metric lesson', 'H Support pre': 'H: compares', 'H Support cites': 'H: cites', 'rule 19': 'mult_frac_frac.*rule 19', 'DENOMS': 'DENOMS', 'F:': 'class F', 'RANGE': 'RANGE', 'M:': 'M:', 'CITE': 'not tagged to', 'CLAUSE negated': 'is not dealt', 'G:': 'G: full', 'claims': 'number line'}
env=dict(os.environ)
missed=0
TMP=tempfile.mkdtemp(prefix='y6-lessonmut-')
for name,f in M.items():
    d=copy.deepcopy(base); f(d); p=os.path.join(TMP, 'm.json')
    json.dump(d,open(p,'w'),ensure_ascii=False)
    r=subprocess.run(['node',os.path.join(H, 'lessonfit.mjs'),p],capture_output=True,text=True,env=env)
    lines=[l.strip() for l in r.stdout.splitlines() if l.startswith('   ')]
    tg=next(v for k,v in TG.items() if name.startswith(k))
    hit=[l for l in lines if re.search(tg,l)]
    missed += 0 if hit else 1
    print(f"{'CAUGHT' if hit else 'MISSED'} exit {r.returncode} | {name}\n      {hit[0][:220] if hit else (lines[:1] or [''])[0][:200]}")
# F5 (class N after finish()): a silent re-option in the WRITTEN file must fail lessonspec.py against the spec snapshot. The
# committed file equals the spec (the build's last gate), so it stands in for spec-lessons.json here
S=os.path.join(TMP,'spec.json'); json.dump(base['lessons'],open(S,'w'),ensure_ascii=False)
d=copy.deepcopy(base)
for l in d['lessons'].values():
    for e in l['pre']:
        if e['key']=='multiplication:mult_facts': e['opts']={'constant':[7]}
p=os.path.join(TMP,'m.json'); json.dump(d,open(p,'w'),ensure_ascii=False)
r=subprocess.run([sys.executable,os.path.join(H,'lessonspec.py'),p,S],capture_output=True,text=True)
r0=subprocess.run([sys.executable,os.path.join(H,'lessonspec.py'),R+'data/curriculum/links/Y6.json',S],capture_output=True,text=True)
ok=r.returncode==1 and r0.returncode==0
missed += 0 if ok else 1
print(f"{'CAUGHT' if ok else 'MISSED'} exit {r.returncode} (unmutated {r0.returncode}) | F5 re-option after finish(): mult_facts {{constant:[7]}}, why still 12\n      {(r.stdout.splitlines() or [''])[0][:200]}")
print(f'lessonmut: {len(M) + 1} mutations, {missed} missed')
sys.exit(1 if missed else 0)
