"""Lessons critic r1 F5 (class N, Y5 r7): every direct / partial / pre / related link of the FINAL written Y6.json `lessons` carries
exactly the key, opts and Max Number its spec gave it, in the spec's order (spec-lessons.json, the snapshot finish() takes from the
spec files before any later pass). build.py runs it on the written file as its last data gate, so a re-option, an added or a
dropped link anywhere after finish() fails the build (the Y5 lane's specopts.py, for lessons).
usage: python3 lessonspec.py <Y6.json> <spec-lessons.json>      (exit 1 on any difference)"""
import json, sys
d = json.load(open(sys.argv[1])); spec = json.load(open(sys.argv[2]))
sig = lambda e: json.dumps({'key': e['key'], 'opts': e.get('opts') or {}, 'maxNumber': e.get('maxNumber') or None}, sort_keys=True)
bad, n = [], 0
L = d.get('lessons', {})
for lid in sorted(set(L) | set(spec)):
    if lid not in L: bad.append(f'{lid}: in the spec, not in the written file'); continue
    if lid not in spec: bad.append(f'{lid}: in the written file, not in the spec'); continue
    for role in ('direct', 'partial', 'pre', 'related'):
        got = [sig(e) for e in L[lid][role]]; want = [sig(e) for e in spec[lid][role]]; n += len(got)
        if got != want: bad.append(f'{lid} {role}: written {got} but the spec has {want}')
for b in bad: print(b)
print(f'lessonspec: {n} lesson links checked against the spec; {len(bad)} differences')
sys.exit(1 if bad else 0)
