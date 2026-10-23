# Teacher site 2.0 maths-area palette check (IMPROVEMENT_PLAN.md §2.7, v4 after critic r3). Run: python3 ramps.py
# Prints the four strengths of each area in light and dark mode, their contrasts, the CIEDE2000 separation of the
# bold colours (normal vision, deuteranopia, protanopia; same-grade pairs and any pair), and chip-edge contrasts.
import itertools, os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'colour.py')).read())
A = [('CC', 'Counting & cardinality', '#C026D3'), ('OA', 'Operations & algebraic thinking', '#3730A3'),
     ('NBT', 'Number & operations in base ten', '#EAB308'), ('NF', 'Fractions & decimals', '#F472B6'),
     ('MEAS', 'Measurement', '#6EE7B7'), ('DATA', 'Data', '#93C5FD'), ('G', 'Geometry', '#0F766E'),
     ('RPNS', 'Ratio & number system (grade 6)', '#BEF264')]
SLATE = '#475569'
GRADES = {'K': ['CC', 'OA', 'NBT', 'MEAS', 'DATA', 'G'], '1-2': ['OA', 'NBT', 'MEAS', 'DATA', 'G'],
          '3-5': ['OA', 'NBT', 'NF', 'MEAS', 'DATA', 'G'], '6': ['RPNS', 'OA', 'DATA', 'G']}
CO = {frozenset(p) for g in GRADES.values() for p in itertools.combinations(g, 2)}
def deep(b):          # light mode: text and outline colour of the area, >= 7 : 1 on white and >= 25 % darker than bold
    t = .75
    while cr(mix(b, '#000000', t), WHITE) < 7: t -= .01
    return mix(b, '#000000', t)
def light(b, under):  # dark mode: the same job, >= 7 : 1 on the dark tint
    t = .5
    while cr(mix(b, WHITE, t), under) < 7: t -= .01
    return mix(b, WHITE, t)
print('LIGHT MODE  | tint 10% | soft 30% | bold (text) | deep (on white / on tint)')
for k, n, b in A:
    ti, so, de = mix(b, WHITE, .10), mix(b, WHITE, .30), deep(b)
    t = text_for(b)
    print(f'  {k:5} {ti} ink {cr(ti, INK):4.1f} | {so} ink {cr(so, INK):4.1f} | {b} {t} {cr(b, WHITE if t == "white" else INK):4.1f}'
          f' | {de} {cr(de, WHITE):4.1f} / {cr(de, ti):4.1f}   hue {hue(b):3.0f} L* {lab(b)[0]:3.0f}')
print('DARK MODE (page #111318)  | tint 18% | soft 40% | bold on page | light (on tint)')
for k, n, b in A:
    ti, so = mix(b, DARK, .18), mix(b, DARK, .40); li = light(b, ti)
    print(f'  {k:5} {ti} #F3F4F6 {cr(ti, "#F3F4F6"):4.1f} | {so} #F3F4F6 {cr(so, "#F3F4F6"):4.1f} | {cr(b, DARK):4.1f} | {li} {cr(li, ti):4.1f}')
def sim(a, b): return min(de00(a, b, 'deut'), de00(a, b, 'prot'))
pairs = list(itertools.combinations(A, 2))
same = [p for p in pairs if frozenset((p[0][0], p[1][0])) in CO]
lo = lambda ps, f: min((round(f(a[2], b[2]), 1), a[0], b[0]) for a, b in ps)
print('CIEDE2000 bold vs bold: normal, any pair', lo(pairs, de00), '| simulated, same grade', lo(same, sim),
      '| simulated, any pair', lo(pairs, sim))
print('CIEDE2000 vs error red #B91C1C / key orange #C2410C, min over the three views:')
print('  ' + ' '.join(f'{k} {min(de00(b, ERR, m) for m in MODES):.1f}/{min(de00(b, KEY, m) for m in MODES):.1f}' for k, n, b in A))
print('slate vs areas, simulated min', min((round(sim(SLATE, b), 1), k) for k, n, b in A),
      'normal min', min((round(de00(SLATE, b), 1), k) for k, n, b in A))
print('bold chip vs page: light (white) / dark (#111318)')
print('  ' + ' '.join(f'{k} {cr(b, WHITE):.2f}/{cr(b, DARK):.2f}' for k, n, b in A + [('slate', '', SLATE)]))
print('soft chip vs page: light / dark', ' '.join(f'{k} {cr(mix(b, WHITE, .3), WHITE):.2f}/{cr(mix(b, DARK, .4), DARK):.2f}' for k, n, b in A))
print('outlines: deep vs white min', round(min(cr(deep(b), WHITE) for k, n, b in A), 1), '| #E5E7EB vs dark page', round(cr('#E5E7EB', DARK), 1),
      '| ink ring vs white', round(cr(INK, WHITE), 1), '| #F3F4F6 ring vs dark page', round(cr('#F3F4F6', DARK), 1))
# Board A (six areas): Measurement and Data share the Measurement colour; Ratio / number system shares Fractions'.
BA = {'CC': '#C026D3', 'OA': '#3730A3', 'NBT': '#EAB308', 'NF': '#F472B6', 'MD': '#6EE7B7', 'G': '#0F766E'}
GA = {'K': ['CC', 'OA', 'NBT', 'MD', 'G'], '1-2': ['OA', 'NBT', 'MD', 'G'], '3-5': ['OA', 'NBT', 'NF', 'MD', 'G'],
      '6': ['NF', 'OA', 'MD', 'G']}
COA = {frozenset(p) for g in GA.values() for p in itertools.combinations(g, 2)}
pa = list(itertools.combinations(BA, 2))
print('Board A: normal, any pair', min((round(de00(BA[x], BA[y]), 1), x, y) for x, y in pa),
      '| simulated, same grade', min((round(sim(BA[x], BA[y]), 1), x, y) for x, y in pa if frozenset((x, y)) in COA),
      '| simulated, any pair', min((round(sim(BA[x], BA[y]), 1), x, y) for x, y in pa))
