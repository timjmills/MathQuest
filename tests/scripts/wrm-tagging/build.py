"""Build data/curriculum/links/Y4.json from spec.py (hand-authored) + wrm-steps.json + prior.json + keys.json."""
import json, re, sys, os
H = os.path.dirname(os.path.abspath(__file__))
R = '/home/user/MathQuest/.claude/worktrees/agent-aa09d8d25584eba48/'
ns = {}
import glob
for f in sorted(glob.glob(os.path.join(H, 'spec*.py'))): exec(open(f).read(), ns)
# keys.json / prior.json are generated (keys.mjs / prior.mjs) into DATA, a scratch folder outside the repo
DATA = os.environ.get('WRM_TAG_DATA', '/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-tag-Y4')
K = json.load(open(os.path.join(DATA, 'keys.json')))
keys, props = K['keys'], K['props']
prior = json.load(open(os.path.join(DATA, 'prior.json')))
wrm = json.load(open(R + 'data/curriculum/wrm-steps.json'))
steps = {}
order = []
for y in wrm['years']:
    for b in y['blocks']:
        for s in b['steps']:
            steps[s['id']] = s
            if y['id'] == 'Y4':
                order.append(s['id'])
errs = []

def pk(k):
    m = re.match(r'^([a-z_0-9]+:[a-z_0-9]+)(\{.*\})?$', k)
    if not m:
        errs.append('bad key ' + k); return k, {}
    key, o = m.group(1), json.loads(m.group(2)) if m.group(2) else {}
    if key not in keys:
        errs.append('unknown skill ' + key)
    return key, o

def why_for(sid, ref, kind):
    if kind == 'P':
        wk = prior.get(sid, {}).get('wk')
        t = steps[ref]['title'] if ref in steps else ref
        return f"{ref} {t} (prior learning wk {wk})"
    if kind == 'B':
        return f"{ref} {steps[ref]['title']} (step before in the block)"
    if kind == 'L':
        return f"{ref} {steps[ref]['title']} (lower grade, same CCSS cluster)"
    if kind == 'C':
        return f"{ref} (Grade 2 lesson COPIED IN to the Grade 3 sequence, prior learning wk {prior.get(sid, {}).get('wk')})"
    return ref

out_steps = {}
used = {}
for sp in ns['STEPS']:
    sid = sp['id']
    if sid not in steps:
        errs.append('no step ' + sid); continue
    direct = []
    for k in sp.get('direct', []):
        key, o = pk(k); direct.append({'key': key, 'opts': o})
    partial = []
    for k, miss in sp.get('partial', []):
        key, o = pk(k); e = {'key': key, 'missing': miss}
        if o: e['opts'] = o
        partial.append(e)
    dk = {(d['key'], json.dumps(d['opts'], sort_keys=True)) for d in direct} | {(p['key'], json.dumps(p.get('opts', {}), sort_keys=True)) for p in partial}
    pre = []
    for k, ref, kind in sp.get('pre', []):
        key, o = pk(k)
        if (key, json.dumps(o, sort_keys=True)) in dk: continue  # same skill as a direct one: dropped
        e = {'key': key, 'why': why_for(sid, ref, kind)}
        if o: e['opts'] = o
        pre.append(e)
    rel = []
    for k, w in sp.get('related', []):
        key, o = pk(k)
        if (key, json.dumps(o, sort_keys=True)) in dk: errs.append(f'{sid}: related repeats direct {key}'); continue
        e = {'key': key, 'why': w}
        if o: e['opts'] = o
        rel.append(e)
    if len(pre) > 8 or len(rel) > 8: errs.append(sid + ' too many pre/related')
    v = sp['verdict']
    if v == 'full' and (sp.get('build') or partial): errs.append(sid + ' full but build/partial')
    if v != 'full' and not sp.get('build'): errs.append(sid + ' not full but no build')
    if v == 'gap' and direct: errs.append(sid + ' gap with direct')
    sp['preBuild'] = [p for p in sp.get('preBuild', []) if p not in sp.get('build', [])]
    for p in sp.get('build', []) + sp.get('preBuild', []):
        used.setdefault(p, []).append(sid)
    out_steps[sid] = {'title': steps[sid]['title'], 'direct': direct, 'partial': partial, 'verdict': v,
                      'missing': sp.get('missing', ''), 'build': sp.get('build', []), 'pre': pre,
                      'preBuild': sp.get('preBuild', []), 'related': rel, 'note': sp.get('note', '')}

NEW = ns['NEW_PROPOSALS']
proposals = {}
for pid, sids in used.items():
    if pid in NEW:
        p = dict(NEW[pid]); p['steps'] = sorted(set(sids), key=order.index); p['reused'] = False
        if pid in props: errs.append('new proposal id clashes ' + pid)
    elif pid in props:
        src = props[pid]
        p = {k: v for k, v in src.items() if k != '_src'}
        p['steps'] = sorted(set(list(src.get('steps') or []) + sids), key=lambda s: (s not in order, order.index(s) if s in order else 0, s))
        p['reused'] = True; p['source'] = src['_src']
    else:
        errs.append('unknown proposal ' + pid); continue
    proposals[pid] = p
for pid in NEW:
    if pid not in used: errs.append('unused new proposal ' + pid)
missing_steps = [s for s in order if s not in out_steps]
doc = {'year': 'Y4', 'generatedBy': 'wave2-tagging', 'steps': {s: out_steps[s] for s in order if s in out_steps},
       'proposals': proposals, 'tagFixes': ns['TAGFIXES']}
os.makedirs(R + 'data/curriculum/links', exist_ok=True)
json.dump(doc, open(R + 'data/curriculum/links/Y4.json', 'w'), indent=1, ensure_ascii=False)
from collections import Counter
c = Counter(s['verdict'] for s in out_steps.values())
print('steps', len(out_steps), dict(c), 'remaining', len(missing_steps))
print('proposals new', sum(1 for p in proposals.values() if not p['reused']), 'reused', sum(1 for p in proposals.values() if p['reused']), 'tagFixes', len(ns['TAGFIXES']))
print('\n'.join(errs) or 'OK')
