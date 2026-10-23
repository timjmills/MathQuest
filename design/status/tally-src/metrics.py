#!/usr/bin/env python3
"""S8 metrics helper (run from the repo root: python3 design/status/tally-src/metrics.py).
Reads design/status/defect-findings.csv, defect-reports.csv and defect-classes.md; prints the
class ranking, the machine share and the rounds-to-PASS table that design/status/metrics.md quotes.
Read-only: it writes nothing."""
import csv, re, collections, statistics
OUT = 'design/status'
md = open(f'{OUT}/defect-classes.md').read()
ROWS = re.findall(r'^\| ([A-Z_]+) \| (machine|judgment|process) \|.*\| ([^|]*) \|\s*$', md, re.M)
KIND = {c: k for c, k, _ in ROWS}; GATE = {c: g.strip() for c, _, g in ROWS}
F = list(csv.DictReader(open(f'{OUT}/defect-findings.csv', newline='')))
R = list(csv.DictReader(open(f'{OUT}/defect-reports.csv', newline='')))

def nogate(c):
    g = GATE[c]
    return KIND[c] == 'machine' and (g.startswith('none') or 'WRM tagging' in g and 'only' in g)

tot = collections.Counter(); blk = collections.Counter(); nar = collections.Counter(); grd = collections.Counter()
rounds = collections.defaultdict(set)
for r in F:
    c = r['class']; tot[c] += 1
    if r['severity'] == 'blocking': blk[c] += 1
    (nar if r['source'] == 'critic-report' else grd)[c] += 1
    rounds[c].add((r['report'], r['round']))

print('## Class ranking (sorted by blocking, then rounds)')
print('| Class | Kind | Total | Blocking | Narrative | Grade runs | Report rounds | Gate today |')
print('|---|---|--:|--:|--:|--:|--:|---|')
for c in sorted(KIND, key=lambda c: (-blk[c], -len(rounds[c]), c)):
    print(f'| {c} | {KIND[c]} | {tot[c]} | {blk[c]} | {nar[c]} | {grd[c]} | {len(rounds[c])} | {GATE[c]} |')
n = sum(tot.values()); nn = sum(nar.values())
m = sum(v for c, v in tot.items() if KIND[c] == 'machine'); mn = sum(v for c, v in nar.items() if KIND[c] == 'machine')
mb = sum(v for c, v in blk.items() if KIND[c] == 'machine'); nb = sum(blk.values())
mbn = sum(1 for r in F if r['source'] == 'critic-report' and r['severity'] == 'blocking' and KIND[r['class']] == 'machine')
nbn = sum(1 for r in F if r['source'] == 'critic-report' and r['severity'] == 'blocking')
print(f'\nfindings {n}; machine {m} ({100*m/n:.1f} %)')
print(f'narrative-report findings {nn}; machine {mn} ({100*mn/nn:.1f} %)')
print(f'blocking {nb}; machine {mb} ({100*mb/nb:.1f} %); narrative blocking {nbn}; machine {mbn} ({100*mbn/nbn:.1f} %)')
print(f'report rounds {len({(r["report"], r["round"]) for r in F})}')
print('\n## Top machine classes with no gate today (by blocking, then rounds)')
for c in sorted([c for c in KIND if nogate(c)], key=lambda c: (-blk[c], -len(rounds[c])))[:8]:
    print(f'{c}: blocking {blk[c]}, total {tot[c]}, rounds {len(rounds[c])}')

# ---- Rounds to PASS per lane. The CSV gives the rounds; a few outcomes come from STATUS / git (noted).
# lane -> (runs in defect-reports.csv, override or None, note)
LANES = [
 ('WRM tagging MAP', ['wrm-tagging/MAP'], None, ''),
 ('WRM tagging R + Y1', ['wrm-tagging/R-Y1'], None, ''),
 ('WRM tagging Y2-Y3', ['wrm-tagging/Y2-Y3'], None, ''),
 ('WRM tagging Y4', ['wrm-tagging/Y4'], None, 'round 1 has no report'),
 ('WRM tagging Y5', ['wrm-tagging/Y5'], ('PASS', 8), 'r3 PASS under old rules 1-13, re-graded under rules 1-19; final PASS r8'),
 ('WRM tagging Y6', ['wrm-tagging/Y6'], ('PASS', 5), 'r3 PASS under old rules, re-graded; final PASS r5'),
 ('WRM Y1 site lessons', ['wrm-tagging/Y1-lessons'], None, ''),
 ('WRM Y4 site lessons', ['wrm-tagging/Y4-lessons'], ('NOT PASSED', 4), 'owner accepted r4 7.96 after F6 fix (STATUS 2026-10-17)'),
 ('WRM Y6 site lessons', ['wrm-tagging/Y6-lessons'], None, ''),
 ('White Rose page', ['wrm-page'], ('NOT PASSED', 8), 'r10 merged by owner without critic r9 (STATUS)'),
 ('Lesson planner V21/V22', ['lesson-planner'], None, ''),
 ('Detailed lesson 1 g2-nbt3', ['g2-nbt3-read-write-1000'], None, ''),
 ('Detailed lesson 2 g1-oa1', ['g1-oa1-bar-model-wp-20'], None, ''),
 ('Detailed lesson 3a g3-oa5', ['g3-oa5-mult-properties'], None, ''),
 ('Detailed lesson 4 g3-oa9 table', ['g3-oa9-mult-table-patterns'], None, ''),
 ('Detailed lesson 5 g3-oa9 in-out', ['g3-oa9-input-output-rule'], None, ''),
 ('Number line 5.2', ['support-numberline', 'number-line'], None, ''),
 ('Small fixes', ['small-fixes'], None, 'item 8 continued as rounds 8-11 after the merge (r10 PASS, r11 FAIL; git)'),
 ('Answer-key options 4.4', ['answer-key-options'], None, ''),
 ('Search terms', ['search-terms'], None, ''),
 ('Skip-count', ['skip-count'], ('NOT PASSED', 4), 'r5 merged by owner without critic r5 (STATUS)'),
 ('Touch numerals', ['touchdots'], None, ''),
 ('Steps box', ['steps-box-r1', 'steps-box-r2', 'steps-box-r3'], None, ''),
 ('Chromebook fit', ['chromebook-fit'], None, ''),
 ('div_facts forms', ['div-facts-forms'], None, ''),
 ('Count-by arrows + Lines', ['countby-arrows'], None, ''),
 ('Long-division hug', ['ldiv-hug'], None, ''),
 ('Number families order', ['nf-order'], None, ''),
 ('Landing (many skills)', ['landing-many'], None, ''),
 ('Place value phones', ['placevalue-phones'], None, ''),
 ('Next-box pulse', ['pulse-fix'], ('PASS', 3), 'PASS r3; re-opened for auto-select r4-r6, PASS r6'),
 ('Wave 1 lane A', ['wave1-A'], None, ''),
 ('Wave 1 lane A fix (Start buttons)', ['wave1-A-fix'], None, ''),
 ('Wave 1 lane A2', ['wave1-A2'], ('PASS', 5), 'r1 PASS, re-opened r2-r4, final PASS r5'),
 ('Wave 1 lane A3', ['wave1-A3'], None, ''),
 ('Wave 1 lane C', ['wave1-C'], None, ''),
 ('Wave 1 lane C2', ['wave1-C2'], None, ''),
 ('Wave 1 lane E', ['wave1-E'], None, ''),
 ('Lessons engine (grade runs)', ['lessons-r1', 'lessons-r2', 'lessons-r3', 'lessons-r4'], None, ''),
 ('Lane D print backlog', [], ('NOT PASSED', 8), 'git: "Lane D critic round 8 report (FAIL ...)"; paused; no report in the tally'),
 ('Fraction key', [], ('NOT PASSED', 8), 'STATUS: critic r8 FAIL R8-1/R8-2, paused; reports not in the tally'),
 ('Teacher screens audit', ['teacher-screens'], None, ''),
 ('Option panels', ['options-panel', 'options-r3'], None, ''),
 ('Anchors (grade runs)', ['anchor-r1', 'anchor-r2', 'anchor-r3'], None, 'paused'),
 ('Place value (grade runs)', ['pv-r1', 'pv-r2', 'pv-r3'], None, 'paused'),
 ('Geometry (grade runs)', ['geometry-r1', 'geometry-r2'], None, 'paused'),
 ('Figures (grade runs)', ['figures-r7', 'figures-r8'], ('NOT PASSED', 8), 'paused; r1-r6 have no report'),
 ('K-2 (grade runs)', ['k2-r2', 'k2-r3'], None, 'paused; r1 has no report'),
 ('Error analysis (grade run)', ['ea-r5'], None, 'r1-r4 have no report'),
 ('Fractions (grade run)', ['fractions-r1'], None, 'paused'),
 ('Guided (grade run)', ['guided-r1'], None, ''),
]
print('\n## Rounds to PASS per lane')
print('| Lane | Runs in defect-reports.csv | Rounds | Outcome | Note |')
print('|---|---|--:|---|---|')
byrun = collections.defaultdict(list)
for r in R: byrun[r['run']].append(r)
passed = []
for name, runs, ov, note in LANES:
    rs = [x for run in runs for x in byrun[run]]
    nums = sorted({int(x['round']) for x in rs if x['round'].isdigit()})
    p = sorted(int(x['round']) for x in rs if x['verdict'] == 'PASS' and x['round'].isdigit())
    if ov: outcome, n = ov
    elif p: outcome, n = 'PASS', p[0]
    else: outcome, n = 'NOT PASSED', max(nums)
    if outcome == 'PASS': passed.append(n)
    print(f"| {name} | {', '.join(runs) or '—'} | {n} | {outcome} | {note} |")
q = statistics.quantiles(passed, n=4)
print(f'\npassed lanes {len(passed)}: median {statistics.median(passed)}, quartiles {q[0]}-{q[2]}, range {min(passed)}-{max(passed)}, mean {statistics.mean(passed):.1f}')
