"""Lessons critic r1 G1: the lesson checks of lessons.py, re-run on the WRITTEN Y1.json, plus a field-by-field snapshot gate.
build.py takes the snapshot (lesson-snapshot.json) from finish()'s own return value BEFORE anything is assigned into the output, and
runs this script on the file it wrote. Any edit made after finish() - a lesson field (verdict, missing, build, closes, envision, note,
a why, a clause), a proposal's `lessons` / `closes[<lesson>]` / `lessonCloses[<lesson>]`, a lesson-only proposal added or dropped -
is a difference and exits 1, and the semantic rules hold on what was written:
  full  => no build, no partial, no missing, no envision, a direct link, a full_audit.json row (G4)
  not full => a build, a missing clause, an envision whose proposals are exactly the build, each with the lesson's closes
  every proposal a lesson builds (or preBuilds) exists and lists the lesson in `lessons`; a proposal lists only lessons that use it
  closes[<lesson>] (or lessonCloses[<lesson>] beside a frozen string `closes`) is set and equals the envisioned closes; a lesson
  with one build closes exactly its `missing` (spec_lessons gives a clause only where two builds split it)
  no tagFix names a site lesson
Lessons critic r2 G7: the snapshot also holds EVERY field of every proposal a lesson uses (proposalsFull), and each written one must
equal it field by field (teaches, kind, skill, name, option, representation ...). Independently of the snapshot, a proposal copied from
another source must equal that source in every field but the lesson fields: one copied from R.json (source "R.json (passed lane ...)")
equals R.json's proposal except closes / lessons / lessonCloses / source / steps / reused (and the R-only correction fields); one copied
from the live lists (WRM_PROPOSALS, VISUAL_BUILDS, the build list; keys.json `props`) equals it except lessons / closes / lessonCloses /
reused / source; a lesson-only new one (reused false) has every field the contract asks for.
usage: python3 lessoncheck.py <Y1.json> [<lesson-snapshot.json> [<keys.json>]]      (exit 1 on any difference)"""
import json, os, sys
H = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(sys.argv[1]))
snap = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None
KEYS = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else None
R_ROOT = os.path.abspath(os.path.join(H, '..', '..', '..', '..'))
RJ = json.load(open(os.path.join(R_ROOT, 'data/curriculum/links/R.json')))
AUDIT = {k: v for k, v in json.load(open(os.path.join(H, 'full_audit.json'))).items() if not k.startswith('_')}
L, P = d.get('lessons', {}), d['proposals']
bad = []
def closes_of(p):
    return (p.get('lessonCloses') or {}) if isinstance(p.get('closes'), str) else (p.get('closes') or {})
uses = {}
for lid, l in L.items():
    v = l.get('verdict')
    for pid in l.get('build', []) + l.get('preBuild', []): uses.setdefault(pid, set()).add(lid)
    if v not in ('full', 'partial', 'gap'): bad.append(f'{lid}: verdict {v!r}')
    if v == 'full':
        if l.get('build') or l.get('partial') or l.get('missing') or l.get('envision'): bad.append(f'{lid}: full but build / partial / missing / envision')
        if not l.get('direct'): bad.append(f'{lid}: full with no direct link')
        if lid not in AUDIT: bad.append(f'{lid}: full with no full_audit.json row (G4)')
    else:
        if not l.get('build'): bad.append(f'{lid}: not full but no build')
        if not l.get('missing'): bad.append(f'{lid}: not full but no missing clause')
        if lid in AUDIT: bad.append(f'{lid}: an audit row for a lesson that is not full')
        env = [e.get('proposal') for e in l.get('envision', [])]
        if env != l.get('build'): bad.append(f'{lid}: envision {env} is not the build {l.get("build")}')
        if v == 'partial' and (l.get('direct') or not l.get('partial')): bad.append(f'{lid}: partial with a direct link or no partial link')
        if v == 'gap' and (l.get('direct') or l.get('partial')): bad.append(f'{lid}: gap with a direct / partial link')
        for e in l.get('envision', []):
            pid = e.get('proposal'); p = P.get(pid)
            if p is None: continue
            got = closes_of(p).get(lid)
            if not got: bad.append(f'{lid}: proposal {pid} has no closes[{lid}] (or lessonCloses)')
            elif e.get('closes') != got: bad.append(f'{lid}: envisioned {pid} closes {e.get("closes")!r}, but the proposal closes it with {got!r}')
            if len(l.get('build', [])) == 1 and got and got != l.get('missing'): bad.append(f'{lid}: its one build {pid} closes {got!r}, not the lesson\'s missing {l.get("missing")!r}')
for pid, ls in uses.items():
    if pid not in P: bad.append(f'proposal {pid} used by {sorted(ls)} is not in the file'); continue
    got = set(P[pid].get('lessons') or [])
    if got != ls: bad.append(f'proposal {pid}: lessons {sorted(got)} but used by {sorted(ls)}')
for pid, p in P.items():
    if p.get('lessons') and pid not in uses: bad.append(f'proposal {pid} lists lessons {p["lessons"]} but no lesson uses it')
    for lid in closes_of(p):
        if '|-|' in lid and pid not in L.get(lid, {}).get('build', []): bad.append(f'proposal {pid} closes lesson {lid}, which does not build it')
for t in d.get('tagFixes', []):
    if '|-|' in t.get('step', '') or t.get('step') in L: bad.append(f'a tagFix names a site lesson: {t}')
if snap is not None:
    if list(L) != list(snap['lessons']): bad.append('the written lessons are not the snapshot\'s lessons (ids or order)')
    for lid in snap['lessons']:
        a, b = L.get(lid), snap['lessons'][lid]
        if a is None: continue
        for f in sorted(set(a) | set(b)):
            if a.get(f) != b.get(f): bad.append(f'{lid}: field {f} differs from the snapshot finish() returned')
    sp = snap['proposals']
    for pid in sorted(set(sp) | {q for q, p in P.items() if p.get('lessons') or (isinstance(p.get('closes'), dict) and any('|-|' in k for k in p['closes'])) or p.get('lessonCloses')}):
        p = P.get(pid) or {}
        cur = {'lessons': p.get('lessons'), 'lessonCloses': p.get('lessonCloses'),
               'closes': {k: v for k, v in p['closes'].items() if '|-|' in k} if isinstance(p.get('closes'), dict) else None}
        if pid not in sp: bad.append(f'proposal {pid}: lesson fields not in the snapshot'); continue
        for f in ('lessons', 'lessonCloses', 'closes'):
            if cur[f] != sp[pid][f]: bad.append(f'proposal {pid}: {f} differs from the snapshot ({cur[f]!r} != {sp[pid][f]!r})')
    if sorted(snap.get('newIds', [])) != sorted(q for q, p in P.items() if p.get('reused') is False and not p.get('steps') and p.get('lessons')):
        bad.append('the lesson-only new proposals differ from the snapshot')
# G7: the proposals a lesson uses, every field
LESSON_F = {'lessons', 'lessonCloses', 'closes', 'source', 'steps', 'reused'}
for pid, p in P.items():
    if not p.get('lessons'): continue
    src = str(p.get('source') or '')
    if src.startswith('R.json'):
        rp = RJ['proposals'].get(pid)
        if rp is None: bad.append(f'proposal {pid}: says it is copied from R.json, which has no such id'); continue
        skip = LESSON_F | {'corrected', 'correctionWhy'}
        for f in sorted((set(p) | set(rp)) - skip):
            if p.get(f) != rp.get(f): bad.append(f'proposal {pid}: field {f} differs from R.json ({p.get(f)!r} != {rp.get(f)!r})')
        if p.get('steps') != [] or p.get('reused') is not True: bad.append(f'proposal {pid}: an R.json copy must have steps [] and reused true')
    elif 'source' in p:   # a copy from the live lists (a frozen R/Y1 base proposal has no `source`; the frozen gate holds it)
        if KEYS is None: continue
        if pid not in KEYS.get('props', {}): bad.append(f'proposal {pid}: source {src!r}, but no live proposal has this id'); continue
        kp = {k: v for k, v in KEYS['props'][pid].items() if k != '_src'}; kp.setdefault('steps', [])
        for f in sorted((set(p) | set(kp)) - (LESSON_F - {'steps'})):
            if p.get(f) != kp.get(f): bad.append(f'proposal {pid}: field {f} differs from its live source {KEYS["props"][pid].get("_src")} ({p.get(f)!r} != {kp.get(f)!r})')
        if src != KEYS['props'][pid].get('_src'): bad.append(f'proposal {pid}: source {src!r} is not its live source {KEYS["props"][pid].get("_src")!r}')
        if p.get('reused') is not True: bad.append(f'proposal {pid}: a live copy must have reused true')
    elif p.get('reused') is False and not p.get('steps'):
        for f in ('kind', 'skill', 'name', 'teaches', 'representation', 'family', 'ccss', 'why'):
            if not p.get(f): bad.append(f'new lesson proposal {pid} has no {f}')
if snap is not None:
    spf = snap.get('proposalsFull')
    if spf is None: bad.append('the snapshot has no proposalsFull (G7)')
    else:
        used_now = {q for q, p in P.items() if p.get('lessons')}
        if used_now != set(spf): bad.append(f'the proposals lessons use differ from the snapshot: {sorted(used_now ^ set(spf))}')
        for pid in sorted(used_now & set(spf)):
            for f in sorted(set(P[pid]) | set(spf[pid])):
                if P[pid].get(f) != spf[pid].get(f): bad.append(f'proposal {pid}: field {f} differs from the snapshot finish() returned (G7)')
for b in bad: print(b)
print(f'lessoncheck: {len(L)} lessons, {sum(1 for p in P.values() if p.get("lessons"))} lesson proposals checked on the written file; {len(bad)} differences')
sys.exit(1 if bad else 0)
