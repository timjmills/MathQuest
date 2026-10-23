#!/usr/bin/env python3
"""Merge the seven reader groups' CSVs into the S8 defect tally (run from the repo root:
python3 design/status/tally-src/merge.py). Writes design/status/defect-findings.csv,
defect-reports.csv and defect-tally.csv (class x report). Reconciliation rules are listed below
and in metrics.md; the group files in tally-src/ are the readers' raw output, never edited.
Corrections to a reader's row go in tally-src/overrides.csv (report,round,defect_id,field,old,new,reason;
applied after the rules below, each must hit exactly one row whose field still holds `old`). Report rows a
reader left out go in tally-src/reports-extra.csv (the reports columns plus group). n_open is recomputed
from the merged findings; every (report, round) with findings must have a report row.
findings-G7.csv is generated: python3 design/status/tally-src/g7/build.py."""
import csv, glob, re, collections, os
SRC = 'design/status/tally-src'
OUT = 'design/status'
classes_md = open(f'{OUT}/defect-classes.md').read()
CLASSES = re.findall(r'^\| ([A-Z_]+) \| (machine|judgment|process) \|', classes_md, re.M)
KIND = dict(CLASSES); ORDER = [c for c, _ in CLASSES]

def rows(pat):
    out = []
    for f in sorted(glob.glob(f'{SRC}/{pat}')):
        g = re.search(r'-(G\d)\.csv', f).group(1)
        for r in csv.DictReader(open(f, newline='')):
            r['group'] = g; out.append(r)
    return out

F = rows('findings-G*.csv'); R = rows('reports-G*.csv')
R += list(csv.DictReader(open(f'{SRC}/reports-extra.csv', newline='')))
OV = list(csv.DictReader(open(f'{SRC}/overrides.csv', newline='')))
log = collections.Counter()
LINK_RULES = re.compile(r'WRM-rule-(3|10|14|15|18|19)\b')
LINK_WORDS = re.compile(r'\b(pre|pres|pre-skill|pre-skills|prerequisite|related|building[- ]block|preBuild|lead pre)\b', re.I)
keep = []
for r in F:
    # Rule 1: wave1-E round 1 holds a superseded first grade (ids 1-6) and the re-grade that replaced it (D1-D5).
    if r['report'].endswith('wave1-E/critic.md') and r['defect_id'] in {'1','2','3','4','5','6'}:
        log['dropped wave1-E superseded first grade'] += 1; continue
    # Rule 2: tagging pre/related link faults were split across PEDAGOGY / MISSING / OTHER / UNTRUE_TEXT by the
    # three tagging readers; they get the one class TAG_LINK.
    if 'wrm-tagging' in (r['report'] + r['run']) and r['class'] in ('PEDAGOGY', 'MISSING', 'OTHER', 'UNTRUE_TEXT'):
        by_rule = bool(LINK_RULES.search(r['rule_ids']))
        by_word = bool(LINK_WORDS.search(r['summary'])) and r['class'] != 'UNTRUE_TEXT'
        if by_rule or by_word:
            log[f"{r['class']} -> TAG_LINK"] += 1; r['class'] = 'TAG_LINK'
    keep.append(r)
# Overrides (tally-src/overrides.csv): one row each, applied after the rules above.
for o in OV:
    hit = [r for r in keep if (r['report'], r['round'], r['defect_id']) == (o['report'], o['round'], o['defect_id'])]
    assert len(hit) == 1, ('override must hit exactly one row', o, len(hit))
    assert hit[0][o['field']] == o['old'], ('override old value does not match', o, hit[0][o['field']])
    hit[0][o['field']] = o['new']; log[f"override {o['field']} {o['old']} -> {o['new']}"] += 1
for r in keep:
    assert r['class'] in KIND, r
    r['kind'] = KIND[r['class']]
    r['source'] = 'grade-run' if r['group'] == 'G7' else 'critic-report'

fcols = ['report','run','round','defect_id','class','kind','carried','severity','rule_ids','family','template','summary','source','group','caps']
with open(f'{OUT}/defect-findings.csv','w',newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=fcols, extrasaction='ignore', lineterminator='\n'); w.writeheader()
    for r in keep: w.writerow(r)
# n_open = the findings kept for that report round (after the drop rules), not the reader's own count.
nkept = collections.Counter((r['report'], r['round']) for r in keep)
for r in R:
    n = str(nkept[(r['report'], r['round'])])
    if r['n_open'] != n: log['n_open recomputed (reader count differed)'] += 1
    r['n_open'] = n
rkeys = collections.Counter((r['report'], r['round']) for r in R)
assert all(v == 1 for v in rkeys.values()), [k for k, v in rkeys.items() if v > 1]
missing = sorted(set(nkept) - set(rkeys))
assert not missing, ('findings without a report row', missing)
rcols = ['report','run','lane','round','date_added','commit_added','verdict','min_score','mean_score','n_open','notes','group']
with open(f'{OUT}/defect-reports.csv','w',newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=rcols, extrasaction='ignore', lineterminator='\n'); w.writeheader()
    for r in R: w.writerow(r)
# class x report matrix (one row per report and round; multi-round files have one row per round)
key = lambda r: (r['report'], r['round'])
cnt = collections.defaultdict(collections.Counter)
for r in keep: cnt[key(r)][r['class']] += 1
verdict = {key(r): r['verdict'] for r in R}
with open(f'{OUT}/defect-tally.csv','w',newline='') as fh:
    w = csv.writer(fh, lineterminator='\n'); w.writerow(['report','round','source','verdict','total'] + ORDER)
    for k in sorted(cnt):
        src = 'grade-run' if k[0].startswith('design/audit/runs/') and k[0].endswith('/') else 'critic-report'
        w.writerow([k[0], k[1], src, verdict.get(k, ''), sum(cnt[k].values())] + [cnt[k][c] for c in ORDER])
    tot = collections.Counter(r['class'] for r in keep)
    w.writerow(['ALL','','','',len(keep)] + [tot[c] for c in ORDER])
for k, v in sorted(log.items()): print(f'{v:5d}  {k}')
print(len(keep), 'findings,', len(cnt), 'report rounds,', len(R), 'report rows')
