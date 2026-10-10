import json, re, sys, os
import openpyxl
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = sys.argv[1]
LIMIT = sys.argv[2] if len(sys.argv) > 2 else None   # e.g. "R.B5" => only blocks up to and including R.B5
sys.path.insert(0, HERE)
from spec import S, NEW
dump = json.load(open(f'{HERE}/dump.json')); bl = json.load(open(f'{HERE}/bl.json'))
LIVE = dump['skills']; TAGS = dump['tags']; WP = dump['props']
W = json.load(open(f'{ROOT}/data/curriculum/wrm-steps.json'))
YEARS = {y['id']: y for y in W['years'][:2]}
order = []; info = {}
for y in W['years'][:2]:
    for b in y['blocks']:
        for s in b['steps']:
            order.append(s['id']); info[s['id']] = dict(s, block=b['id'], blockName=b['name'], year=y['id'])
missing_spec = [i for i in order if i not in S]
assert not missing_spec, missing_spec
idx = {s: i for i, s in enumerate(order)}
def label(k): return LIVE[k]['label'] if k in LIVE else k
def live(k): return k in LIVE
def norm(t): return re.sub(r'[^a-z0-9]+', ' ', t.lower().replace('3d', '3-d').replace('2d', '2-d')).strip()

# ---- xlsx prior learning (KG sheet -> Y1) ----
wb = openpyxl.load_workbook(f'{ROOT}/data/curriculum/source/Awsaj-Domain-Sequence-K-5-2026-27.xlsx', read_only=True)
ws = wb['Kindergarten']; rows = list(ws.iter_rows(values_only=True))
week_prior = {}; lesson_week = {}
for r in rows[1:]:
    if not r or not r[0]: continue
    wk = r[0]; les = r[6]
    if len(r) > 14 and r[14] and wk not in week_prior: week_prior[wk] = r[14]
    if les and les != 'EXAM':
        lesson_week.setdefault(norm(re.sub(r'\(US.*?\)', '', str(les))), wk)
r_by_title = {}
for i in order:
    if i.startswith('R.'): r_by_title.setdefault(norm(info[i]['title']), []).append(i)
def prior_r_steps(step):
    t = norm(info[step]['title']); wk = lesson_week.get(t)
    if not wk: return None, []
    out = []
    for item in re.split(r';\s*', week_prior.get(wk, '') or ''):
        m = re.match(r'\s*Rec/PK4\s+(.*)', item)
        if not m: continue
        cands = r_by_title.get(norm(m.group(1)), [])
        if not cands: continue
        cc = set(info[step]['ccss'])
        best = [c for c in cands if cc & set(info[c]['ccss'])] or cands
        out.append(best[-1])
    return wk, out

def dkeys(step): return [d[0] for d in S[step]['d']]
def fmt_step(s): return f"{s} {info[s]['title']}"

def build(step):
    sp = S[step]; s = info[step]; direct = []; partial = []
    for k, o, miss in sp['d']:
        assert live(k), (step, k)
        if miss: partial.append({'key': k, 'opts': o, 'missing': miss})
        else: direct.append({'key': k, 'opts': o})
    v = sp['v']
    if v == 'full': assert direct and not sp['b'], step
    if v == 'gap': assert not direct and not partial, step
    if v == 'partial': assert partial or direct, step
    if v != 'full': assert sp['b'], step
    own = set(dkeys(step)); pre = []; seen = set(own); pb = []
    def addp(k, why):
        if k in seen or not live(k) or len(pre) >= 8: return
        seen.add(k); pre.append({'key': k, 'why': why})
    for k, why in sp['p']: addp(k, why)
    wk, rsteps = (None, [])
    if s['year'] == 'Y1': wk, rsteps = prior_r_steps(step)
    cc0 = set(s['ccss']); cl0 = {c.rsplit('.', 1)[0] for c in cc0}
    rsteps = sorted(rsteps, key=lambda r: (0 if cc0 & set(info[r]['ccss']) else 1 if cl0 & {c.rsplit('.', 1)[0] for c in info[r]['ccss']} else 2))
    for rs in rsteps:
        if len(pre) >= 5: break
        for k in dkeys(rs): addp(k, f"{fmt_step(rs)} (prior learning wk {wk})")
        if S[rs]['v'] == 'gap':
            for b in S[rs]['b']:
                if b not in pb: pb.append(b)
    # previous step in block
    prev = [x for x in order if info[x]['block'] == s['block'] and idx[x] < idx[step]]
    for x in reversed(prev[-2:]):
        for k in dkeys(x): addp(k, f"{fmt_step(x)} (the step before in this block)")
    # earlier steps on the same CCSS, nearest first
    cc = set(s['ccss'])
    for x in reversed(order[:idx[step]]):
        if cc & set(info[x]['ccss']):
            for k in dkeys(x): addp(k, f"{fmt_step(x)} (same CCSS {', '.join(sorted(cc & set(info[x]['ccss'])))}, earlier)")
    # nothing yet (first steps with no CCSS): earlier steps in the same block family
    if not pre and prev:
        for x in reversed(prev):
            for k in dkeys(x): addp(k, f"{fmt_step(x)} (earlier in this block)")
    if s['year'] == 'Y1' and not pre:
        pass
    pb = []
    cand = [r for r in rsteps if cl0 & {c.rsplit('.', 1)[0] for c in info[r]['ccss']}] + list(reversed(prev[-2:])) + [x for x in reversed(prev) if cc & set(info[x]['ccss'])]
    for x in cand:
        if S[x]['v'] != 'full':
            for b in S[x]['b']:
                if b not in pb and b not in sp['b']: pb.append(b)
    pb = pb[:3]
    if not pre and not pb and prev and S[prev[-1]]['v'] == 'gap':
        pb = S[prev[-1]]['b'][:2]
    rel = []; rseen = set(own)
    def addr(k, why):
        if k in rseen or not live(k) or len(rel) >= 8: return
        rseen.add(k); rel.append({'key': k, 'why': why})
    for k, why in sp['r']: addr(k, why)
    nxt = [x for x in order if info[x]['block'] == s['block'] and idx[x] > idx[step]]
    if nxt:
        for k in dkeys(nxt[0]): addr(k, f"next step: {fmt_step(nxt[0])}")
    for x in order:
        if x != step and cc & set(info[x]['ccss']) and idx[x] > idx[step] and info[x]['year'] == s['year'] and abs(int(info[x]['block'].split('B')[1]) - int(s['block'].split('B')[1])) <= 2:
            for k in dkeys(x):
                if len(rel) < 6: addr(k, f"same CCSS {', '.join(sorted(cc & set(info[x]['ccss'])))} in {fmt_step(x)}")
    if len(rel) < 3:
        for x in [y for y in order if info[y]['block'] == s['block'] and y != step]:
            for k in dkeys(x): addr(k, f"same block: {fmt_step(x)}")
            if len(rel) >= 4: break
    return {'title': s['title'], 'direct': direct, 'partial': partial, 'verdict': v,
            'missing': '' if v == 'full' else sp['m'], 'build': sp['b'], 'pre': pre, 'preBuild': [b for b in pb if b not in sp['b']],
            'related': rel, 'note': sp['n']}

def proposal(pid, steps):
    if pid in NEW:
        p = dict(NEW[pid]); p['steps'] = steps; p['reused'] = False; return p
    src = WP.get(pid) or bl.get(pid)
    assert src, pid
    p = {k: src[k] for k in ('kind', 'skill', 'option', 'name', 'teaches', 'representation', 'family') if k in src}
    if 'representation' not in p and 'problemTypes' in src: p['representation'] = '; '.join(src['problemTypes'])
    p['steps'] = steps
    cc = src.get('ccss') or src.get('standards') or sorted({c for st in steps for c in info[st]['ccss']})
    p['ccss'] = cc
    p['why'] = src.get('why') or f"existing {'WRM_PROPOSALS' if pid in WP else bl[pid]['_src']} entry; covers these steps"
    p['reused'] = True
    return p

def tagfixes(step, out):
    fixes = []
    old = {t['key']: t for t in TAGS.get(step, [])}
    new = {d['key']: None for d in out['direct']}; new.update({d['key']: d['missing'] for d in out['partial']})
    for k, t in old.items():
        if k not in new:
            fixes.append({'key': k, 'step': step, 'action': 'remove', 'why': 'does not teach this step: ' + (t.get('partial') or 'tagged full but no item matches the step')})
        elif (t.get('partial') is None) != (new[k] is None):
            if new[k]: fixes.append({'key': k, 'step': step, 'action': 'partial', 'why': new[k]})
            else: fixes.append({'key': k, 'step': step, 'action': 'add', 'why': 'teaches the whole step with the options given; drop the partial flag'})
    for k, miss in new.items():
        if k not in old:
            fixes.append({'key': k, 'step': step, 'action': 'add' if miss is None else 'partial', 'why': ('teaches this step' if miss is None else miss)})
    return fixes

def run(year):
    steps = {}; fixes = []; uses = {}
    for i in order:
        if info[i]['year'] != year: continue
        if LIMIT and idx[i] > max(idx[x] for x in order if info[x]['block'] == LIMIT or x.startswith(LIMIT + '.')) : continue
        o = build(i); steps[i] = o; fixes += tagfixes(i, o)
        for b in o['build']: uses.setdefault(b, []).append(i)
        for b in o['preBuild']: uses.setdefault(b, [])
    props = {pid: proposal(pid, st) for pid, st in uses.items()}
    for pid, p in props.items():
        if not p['steps']: p['steps'] = []
    return {'year': year, 'generatedBy': 'wave2-tagging', 'steps': steps, 'proposals': props, 'tagFixes': fixes}

os.makedirs(f'{ROOT}/data/curriculum/links', exist_ok=True)
for y in ('R', 'Y1'):
    if LIMIT and LIMIT.startswith('R') and y == 'Y1': continue
    doc = run(y)
    if not doc['steps']: continue
    json.dump(doc, open(f'{ROOT}/data/curriculum/links/{y}.json', 'w'), indent=1, ensure_ascii=False)
    c = {v: sum(1 for s in doc['steps'].values() if s['verdict'] == v) for v in ('full', 'partial', 'gap')}
    nr = sum(1 for p in doc['proposals'].values() if p['reused']); nn = len(doc['proposals']) - nr
    print(y, len(doc['steps']), c, 'proposals new', nn, 'reused', nr, 'tagFixes', len(doc['tagFixes']))
