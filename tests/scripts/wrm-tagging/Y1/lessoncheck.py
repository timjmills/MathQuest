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
usage: python3 lessoncheck.py <Y1.json> [<lesson-snapshot.json>]      (exit 1 on any difference)"""
import json, os, sys
H = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(sys.argv[1]))
snap = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None
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
for b in bad: print(b)
print(f'lessoncheck: {len(L)} lessons, {sum(1 for p in P.values() if p.get("lessons"))} lesson proposals checked on the written file; {len(bad)} differences')
sys.exit(1 if bad else 0)
