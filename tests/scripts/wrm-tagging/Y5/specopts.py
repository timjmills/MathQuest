"""Critic r7 class N gate: every pre / related link in the built Y5.json carries exactly the key, opts and Max Number its spec gave
it (spec-links.json, written by build.py right after the spec files run). A build pass may not re-option a link; the old
`linkfit --fit` loop did, and three rounds of false whys followed. Removing a link is allowed only in the spec too: every built
link must match a spec link of the same unit and role, one to one.
usage: python3 specopts.py <Y5.json> <spec-links.json>      (exit 1 on any difference)"""
import json, sys
d = json.load(open(sys.argv[1])); spec = json.load(open(sys.argv[2]))
U = {**d['steps'], **d.get('lessons', {})}
bad = []
n = 0
for sid, st in U.items():
    for role in ('pre', 'related'):
        pool = [json.dumps(x, sort_keys=True) for x in spec.get(sid, {}).get(role, [])]
        for e in st[role]:
            n += 1
            sg = json.dumps({'key': e['key'], 'opts': e.get('opts') or {}, 'maxNumber': e.get('maxNumber') or None}, sort_keys=True)
            if sg in pool: pool.remove(sg)
            else: bad.append(f"{sid} {role} {e['key']} opts {json.dumps(e.get('opts') or {})} @{e.get('maxNumber') or ''}: not in the spec (spec has {[x['opts'] for x in spec.get(sid, {}).get(role, []) if x['key'] == e['key']]})")
        if pool: bad.append(f"{sid} {role}: spec links missing from the build (dropped by a pass): {pool}")
for b in bad: print(b)
print(f'specopts: {n} links checked against the spec; {len(bad)} differences')
sys.exit(1 if bad else 0)
