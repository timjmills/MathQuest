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

MAXN = {}
def pk(k):
    # 'cat:skill{opts}@N' : opts are the skill's option values; @N is the Max Number (generateQuestionFor range)
    m = re.match(r'^([a-z_0-9]+:[a-z_0-9]+)(\{.*\})?(?:@(\d+))?$', k)
    if not m:
        errs.append('bad key ' + k); return k, {}
    key, o = m.group(1), json.loads(m.group(2)) if m.group(2) else {}
    MAXN['last'] = int(m.group(3)) if m.group(3) else None   # this entry's own Max Number
    if key not in keys:
        errs.append('unknown skill ' + key)
    return key, o
def mx(e, key, o):
    n = MAXN.get('last')   # set by the pk() call that parsed this entry
    if n: e['maxNumber'] = n
    return e

def why_for(sid, ref, kind):
    t = steps[ref]['title'] if ref in steps else ''
    if kind == 'P' and ref.startswith('Y4.') and ref in steps:
        # a Y4 step on the school's prior-learning list: say when THAT step is taught, not this step's week
        wk = ns.get('WK_OVERRIDE', {}).get(sid) or prior.get(sid, {}).get('wk')
        return why_for(sid, ref, 'B')[:-1] + f"; on the prior-learning list of wk {wk})"
    if kind == 'P':
        wk = ns.get('WK_OVERRIDE', {}).get(sid) or prior.get(sid, {}).get('wk')
        return f"{ref} {t or ''} (prior learning wk {wk})".replace('  ', ' ')
    if kind == 'C':
        return f"{ref} (Grade 2 lesson COPIED IN to the Grade 3 sequence, prior learning wk {prior.get(sid, {}).get('wk')})"
    if ref in steps and kind in ('B', 'L', 'X'):
        # say exactly where the pre-skill sits relative to this step
        if ref.startswith('Y4.'):
            # earlier / later is the SCHOOL's order (xlsx week), not the WRM order
            wko = ns.get('WK_OVERRIDE', {})
            wr, ws = wko.get(ref) or prior.get(ref, {}).get('wk'), wko.get(sid) or prior.get(sid, {}).get('wk')
            same_block = ref.rsplit('.', 1)[0] == sid.rsplit('.', 1)[0]
            if wr and ws:
                if wr > ws:
                    return f"{ref} {t} (taught later this year, wk {wr}; the building block this step uses, so meet it first)"
                if wr == ws:
                    return f"{ref} {t} (taught the same school week, {wr})"
                prev = same_block and order.index(ref) == order.index(sid) - 1
                return f"{ref} {t} ({'step before in the block' if prev else 'taught earlier this year'}, wk {wr})"
            if order.index(ref) > order.index(sid):
                return f"{ref} {t} (a later WRM step this year: the building block this step uses, so teach it first)"
            prev = same_block and order.index(ref) == order.index(sid) - 1
            return f"{ref} {t} ({'step before in the block' if prev else ('earlier step in the block' if same_block else 'earlier block this year')})"
        return f"{ref} {t} (lower grade, same idea)" if kind == 'X' else f"{ref} {t} (lower grade, same CCSS cluster)"
    return ref

out_steps = {}
used = {}
for sp in ns['STEPS']:
    sid = sp['id']
    if sid not in steps:
        errs.append('no step ' + sid); continue
    direct = []
    for k in sp.get('direct', []):
        key, o = pk(k); direct.append(mx({'key': key, 'opts': o}, key, o))
    partial = []
    for k, miss in sp.get('partial', []):
        key, o = pk(k); e = {'key': key, 'missing': miss}
        if o: e['opts'] = o
        partial.append(mx(e, key, o))
    dk = {(d['key'], json.dumps(d['opts'], sort_keys=True)) for d in direct} | {(p['key'], json.dumps(p.get('opts', {}), sort_keys=True)) for p in partial}
    pre = []
    seen_pre = set()
    for k, ref, kind in sp.get('pre', []):
        key, o = pk(k)
        if (key, json.dumps(o, sort_keys=True)) in dk: continue  # same skill as a direct one: dropped
        if (key, json.dumps(o, sort_keys=True)) in seen_pre: continue  # the same pre listed twice
        seen_pre.add((key, json.dumps(o, sort_keys=True)))
        e = {'key': key, 'why': why_for(sid, ref, kind)}
        if o: e['opts'] = o
        pre.append(mx(e, key, o))
    rel = []
    for k, w in sp.get('related', []):
        key, o = pk(k)
        if (key, json.dumps(o, sort_keys=True)) in dk: errs.append(f'{sid}: related repeats direct {key}'); continue
        e = {'key': key, 'why': w}
        if o: e['opts'] = o
        rel.append(mx(e, key, o))
    # Rule 19: after the main building block, the earlier-step tiers follow the SCHOOL's week order (nearest first);
    # lower-grade prior learning comes after this year's steps, in its ranked order
    def _wk(p):
        m = re.match(r'^(Y4\.B\d+\.S\d+)', p['why']); return (ns.get('WK_OVERRIDE', {}).get(m.group(1)) or prior.get(m.group(1), {}).get('wk') or '') if m else ''
    if len(pre) > 2:
        head, rest = pre[:1], pre[1:]
        y4 = sorted([p for p in rest if _wk(p)], key=_wk, reverse=True)
        pre = head + y4 + [p for p in rest if not _wk(p)]
    if len(pre) > 8 or len(rel) > 8: errs.append(sid + ' too many pre/related')
    # BRIEF rule 10: a key is never in both pre and related, whatever its options
    both = {p['key'] for p in pre} & {r['key'] for r in rel}
    if both: errs.append(f'{sid}: R10 key in both pre and related: {sorted(both)}')
    if not rel: errs.append(f'{sid}: no related')
    if not pre: errs.append(f'{sid}: no pre')
    if len(pre) < 3 and 'Pre-skills are few' not in sp.get('note', ''): errs.append(f'{sid}: rule 15, fewer than 3 pre and no note why')
    v = sp['verdict']
    if v == 'full' and (sp.get('build') or partial): errs.append(sid + ' full but build/partial')
    if v != 'full' and not sp.get('build'): errs.append(sid + ' not full but no build')
    if v == 'gap' and direct: errs.append(sid + ' gap with direct')
    if v == 'partial' and direct: errs.append(sid + ' partial step lists a direct skill (make it a partial with its clause)')
    if v == 'partial' and not partial: errs.append(sid + ' partial with no partial skill')
    sp['preBuild'] = [p for p in sp.get('preBuild', []) if p not in sp.get('build', [])]
    for p in sp.get('build', []) + sp.get('preBuild', []):
        used.setdefault(p, []).append(sid)
    out_steps[sid] = {'title': steps[sid]['title'], 'direct': direct, 'partial': partial, 'verdict': v,
                      'missing': sp.get('missing', ''), 'build': sp.get('build', []), 'pre': pre,
                      'preBuild': sp.get('preBuild', []), 'related': rel, 'note': sp.get('note', '')}
    if v != 'full': out_steps[sid]['envision'] = sp.get('envision')

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
# Critic r10 G18: a pre's cited step must be a step the skill is tagged to (SKILL_WRM, or a Y4 direct / partial here).
# When it is not, re-cite the nearest step the skill IS tagged to that the pupil has met by this week (an earlier
# grade, or a Y4 step taught by now); if there is none, say so in the why.
taught_at = {}
for k_, v_ in K['tags'].items():
    for t_ in v_: taught_at.setdefault(k_, set()).add(t_ if isinstance(t_, str) else t_['step'])
for sid_, st_ in out_steps.items():
    for e_ in st_['direct'] + st_['partial']: taught_at.setdefault(e_['key'], set()).add(sid_)
allorder = [s_['id'] for y_ in wrm['years'] for b_ in y_['blocks'] for s_ in b_['steps']]
def _wk(x): return ns.get('WK_OVERRIDE', {}).get(x) or prior.get(x, {}).get('wk') or ''
recited = 0
for sid_, st_ in out_steps.items():
    for e_ in st_['pre']:
        m_ = re.match(r'^((?:R|Y\d)\.B\d+\.S\d+)', e_['why'])
        if not m_ or re.search(r"has no live skill|this step's build|nearest live practice", e_['why']): continue
        if m_.group(1) in taught_at.get(e_['key'], set()): continue
        _yr = lambda x: ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'].index(x.split('.')[0])
        cands = [t_ for t_ in taught_at.get(e_['key'], set()) if t_ in allorder and t_ != sid_ and
                 (_yr(t_) < 4 or (_yr(t_) == 4 and _wk(t_) and _wk(sid_) and _wk(t_) <= _wk(sid_)))]   # met by this week: earlier grade or taught already
        if cands:
            ref_ = m_.group(1)
            # the same grade as the cited step first, then the nearest step to it in WRM order
            best = min(cands, key=lambda t_: (t_.split('.')[0] != ref_.split('.')[0], abs(allorder.index(t_) - allorder.index(ref_)) if ref_ in allorder else 0))
            e_['why'] = why_for(sid_, best, 'X'); recited += 1
        else:
            e_['why'] = e_['why'].rstrip(')') + f"; nearest live practice: {e_['key'].split(':')[1]} is not tagged to {m_.group(1)})"
            recited += 1
# Rule 13 (revised): every partial or gap step names the skill or option, still to be made, that would make it full.
ENV, CLOSES, ENVREP = ns.get('ENVISION', {}), ns.get('CLOSES', {}), ns.get('ENVREP', {})
def short_rep(r):
    r = (r or '').split(';')[0].strip()
    return r if len(r) <= 160 else r[:157].rsplit(' ', 1)[0] + ' …'
for sid, st in out_steps.items():
    if st['verdict'] == 'full':
        continue
    env = []
    for pid in st['build']:
        p = proposals.get(pid, {})
        t = ENV.get(sid, {}).get(pid)
        if not t: errs.append(f'{sid}: no envisioned skill for {pid}')
        kind = p.get('kind') or 'new'
        if p.get('skill'):
            kind_s = f"new skill {p['skill']}" if kind == 'new' else f"option on {p['skill']}"
        else:
            kind_s = ('new template' if kind == 'template' else 'visual option') + ' on ' + ', '.join(p.get('hosts', [])[:3])
        env.append({'proposal': pid, 'name': p.get('name', pid), 'kind': kind_s.strip(), 'teaches': t or p.get('teaches', ''),
                    'closes': CLOSES.get(sid, {}).get(pid, st['missing']), 'representation': ENVREP.get(pid) or short_rep(p.get('representation') or p.get('build', ''))})
    st['envision'] = env
    for e in env:
        for f in ('name', 'kind', 'teaches', 'closes', 'representation'):
            if not e.get(f): errs.append(f"{sid}: envisioned {e['proposal']} has no {f}")
        if e['closes'] == proposals.get(e['proposal'], {}).get('teaches'): errs.append(f"{sid}: rule 16, closes copies the proposal's teaches")

# Tag fixes, DERIVED: what this file says each Y4 step's direct (full) and partial skills are, against SKILL_WRM now.
# action: add (no tag yet; `partial` carries the missing clause when it is a partial cover), full (an existing partial
# tag becomes full), partial (an existing full tag becomes partial), opts (tag unchanged, record the option values),
# remove (tagged now, not a direct or partial skill here). The hand-written why is kept where one exists.
cur = {}
for k, v in K['tags'].items():
    for e in v:
        sid_ = e if isinstance(e, str) else e['step']
        if sid_ in out_steps: cur[(k, sid_)] = None if isinstance(e, str) else e.get('partial', '')
hand = {(t['key'], t['step']): t for t in ns['TAGFIXES']}
want = {}
for sid, st in out_steps.items():
    for d in st['direct']:
        w = want.setdefault((d['key'], sid), {'status': 'full', 'opts': []}); w['opts'].append(d['opts'])
        if d.get('maxNumber'): w['maxNumber'] = d['maxNumber']
    for pz in st['partial']:
        w = want.setdefault((pz['key'], sid), {'status': 'partial', 'opts': [], 'missing': pz['missing']})
        w['opts'].append(pz.get('opts', {}))
        if pz.get('maxNumber'): w['maxNumber'] = pz['maxNumber']
        if w['status'] == 'partial': w['missing'] = pz['missing']
tagfixes = []
def why_of(key, sid, dflt):
    h = hand.get((key, sid)); return h['why'] if h else dflt
for (key, sid), w in sorted(want.items(), key=lambda x: (order.index(x[0][1]), x[0][0])):
    opts = [o for o in w['opts'] if o]
    t = {'key': key, 'step': sid}
    if (key, sid) not in cur:
        t['action'] = 'add'
        if w['status'] == 'partial': t['partial'] = w['missing']
        t['why'] = why_of(key, sid, 'not tagged yet; generated items teach this step' + (' in part' if w['status'] == 'partial' else ''))
    elif cur[(key, sid)] is not None and w['status'] == 'full':
        t['action'] = 'full'; t['why'] = why_of(key, sid, 'tagged partial; with these option values the generated items teach the whole step')
    elif cur[(key, sid)] is None and w['status'] == 'partial':
        t['action'] = 'partial'; t['partial'] = w['missing']; t['why'] = why_of(key, sid, 'tagged full; generated items teach only part of the step')
    elif opts:
        t['action'] = 'opts'; t['why'] = why_of(key, sid, 'tag unchanged; record the option values that make the generated items fit the step')
    else:
        continue
    if opts: t['opts'] = opts if len(opts) > 1 else opts[0]
    if w.get('maxNumber'): t['maxNumber'] = w['maxNumber']
    tagfixes.append(t)
for (key, sid), pz in sorted(cur.items(), key=lambda x: (order.index(x[0][1]), x[0][0])):
    if (key, sid) in want: continue
    st = out_steps[sid]
    where = 'related' if any(r['key'] == key for r in st['related']) else ('pre' if any(p['key'] == key for p in st['pre']) else '')
    tagfixes.append({'key': key, 'step': sid, 'action': 'remove',
                     'why': why_of(key, sid, 'generated items do not teach this step' + (f'; kept as a {where} skill' if where else ''))})
stale = [k for k in hand if k not in {(t['key'], t['step']) for t in tagfixes}]

missing_steps = [s for s in order if s not in out_steps]
doc = {'year': 'Y4', 'generatedBy': 'wave2-tagging', 'steps': {s: out_steps[s] for s in order if s in out_steps},
       'proposals': proposals, 'tagFixes': tagfixes}
os.makedirs(R + 'data/curriculum/links', exist_ok=True)
json.dump(doc, open(R + 'data/curriculum/links/Y4.json', 'w'), indent=1, ensure_ascii=False)
from collections import Counter
c = Counter(s['verdict'] for s in out_steps.values())
print('steps', len(out_steps), dict(c), 'remaining', len(missing_steps))
print('proposals new', sum(1 for p in proposals.values() if not p['reused']), 'reused', sum(1 for p in proposals.values() if p['reused']), 'tagFixes', len(tagfixes), {a: sum(1 for t in tagfixes if t['action'] == a) for a in ('add', 'full', 'partial', 'opts', 'remove')}, 'hand fixes now moot', len(stale))
if os.environ.get('SHOW_STALE'): print('\n'.join(f'stale: {k}' for k in stale))
print('pre labels re-cited to a tagged step (G18):', recited)
print('\n'.join(errs) or 'OK')
