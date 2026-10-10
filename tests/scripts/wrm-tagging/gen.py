import json, re, sys, os
import openpyxl
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = sys.argv[1]
LIMIT = sys.argv[2] if len(sys.argv) > 2 else None   # e.g. "R.B5" => only blocks up to and including R.B5
sys.path.insert(0, HERE)
from spec import S, NEW, FORMS, RM
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

READS = json.load(open(f'{HERE}/reads_range.json'))   # skill -> True when its items change with Max Number

SUBS = [  # (family, sub, regex on the step title) — first match wins; order matters
    ('money', 'money', r'coin|note|money|unitis'),
    ('time', 'time', r'\btime\b|\bdays?\b|month|hours|before and after'),
    ('fraction', 'fraction', r'half|quarter'),
    ('count', 'oral', r'verbal|patterns beyond'), ('pattern', 'pattern', r'pattern'),
    ('measure', 'mass', r'mass|balance|heavier'), ('measure', 'capacity', r'capacity|volume|full'),
    ('measure', 'length', r'length|height|size'),
    ('position', 'position', r'\bpositions?\b|map|turn|scene|visualis|instructions|ordinal'),
    ('shape', 'shape3d', r'3-d'), ('shape', 'shape2d', r'shape|circle|triangle|2-d|sides'),
    ('groups', 'skip', r'count in \d'), ('groups', 'oddeven', r'odd|even|pairs'),
    ('groups', 'share', r'shar|equal groups|grouping|array'),
    ('count', 'tens', r'tens and ones|groups of tens|tens to'),
    ('calc', 'double', r'double'), ('calc', 'fact', r'fact|sentence|missing|related'),
    ('calc', 'bond', r'compos|bond|part|arrangements'),
    ('calc', 'add', r'\badd|combine|how many did i add'), ('calc', 'sub', r'subtract|take away|difference|how many did i take'),
    ('sort', 'sort', r'sort|match objects|match pictures|identify a set'),
    ('count', 'more1', r'\b1 more|\b1 less'), ('count', 'nline', r'number line'),
    ('count', 'compare', r'compare|fewer|less than|order (objects and )?numbers|matching'),
    ('count', 'tens', r'tens|beyond 10|understand 1|understand 20|within 20|count from|20, 30')]
def topic2(step):
    t = info[step]['title'].lower()
    for fam, sub, rx in SUBS:
        if re.search(rx, t): return fam, sub
    return 'count', 'count'
def topic(step): return topic2(step)[1]
def dom(c): return c.split('.')[1] if '.' in c else c
def related_topic(a, b):
    (fa, sa), (fb, sb) = topic2(a), topic2(b)
    if sa == sb: return 2
    if fa == fb: return 1
    if {fa, fb} <= {'count', 'calc'} and {dom(c) for c in info[a]['ccss']} & {dom(c) for c in info[b]['ccss']}: return 1
    return 0

def dentries(step): return [(d[0], d[1]) for d in S[step]['d']]
def dkeys(step): return [d[0] for d in S[step]['d']]
def fmt_step(s): return f"{s} {info[s]['title']}"

def build(step):
    sp = S[step]; s = info[step]; direct = []; partial = []
    for k, o, miss in sp['d']:
        assert live(k), (step, k)
        if READS.get(k): assert 'range' in o, f'{step} {k}: reads Max Number, record range'
        if miss: partial.append({'key': k, 'opts': o, 'missing': miss})
        else: direct.append({'key': k, 'opts': o})
    v = sp['v']
    if v == 'full': assert direct and not sp['b'], step
    if v == 'gap': assert not direct and not partial, step
    if v == 'partial': assert partial or direct, step
    if v != 'full': assert sp['b'], step
    own = set(dkeys(step)); pre = []; pb = []
    sig = lambda k, o: k + json.dumps(o or {}, sort_keys=True)
    seen = {sig(k, o) for k, o in dentries(step)}; seen_keys = set()
    def addp(k, why, o=None):
        # a pre may be the step's own skill on an earlier rung (other opts); never the same skill+opts as a direct
        if sig(k, o) in seen or not live(k) or len(pre) >= 8: return
        if o is None and k in own: return
        if k in seen_keys and k not in own: return
        seen.add(sig(k, o)); seen_keys.add(k); e = {'key': k, 'why': why}
        if o: e['opts'] = o
        pre.append(e)
    def take_builds(x):
        if S[x]['v'] != 'full':
            for b in S[x]['b']:
                if b not in pb and b not in sp['b']: pb.append(b)
    for k, why in sp['p']: addp(k, why)
    wk = None
    if s['year'] == 'Y1':
        # rule 3/12: the xlsx week's prior R steps, kept only when they share the step's idea; partial-only steps count
        wk, rsteps = prior_r_steps(step)
        for rs in rsteps:
            if not (related_topic(step, rs) == 2 or (related_topic(step, rs) and len(pre) < 2)): continue
            for k, o in dentries(rs): addp(k, f"{fmt_step(rs)} (school prior learning, week {wk})", o)
            if S[rs]['v'] == 'gap': take_builds(rs)
    # earlier steps on the same idea: same sub-topic first, then the same family, nearest first (rule 11)
    cands = [x for x in reversed(order[:idx[step]]) if related_topic(step, x) and (info[x]['year'] == s['year'] or s['year'] == 'Y1')]
    cands.sort(key=lambda x: -related_topic(step, x))   # stable: nearest first inside each rank
    for x in cands:
        if len(pre) >= 6 or (related_topic(step, x) < 2 and len(pre) >= 2): break
        for k, o in dentries(x): addp(k, f"{fmt_step(x)} (earlier, same idea: {topic(x)})", o)
    for x in [c for c in cands if related_topic(step, c) == 2][:3]:
        if S[x]['v'] == 'gap': take_builds(x)   # a needed earlier step with no live skill: its build is a pre-build
    pb = pb[:3]
    rel = []; rseen = set(own) | {p['key'] for p in pre}
    def addr(k, why):
        if k in rseen or not live(k) or len(rel) >= 6: return
        rseen.add(k); rel.append({'key': k, 'why': why})
    for k, why in sp['r']: addr(k, why)
    for k in dkeys(step):
        for k2, why in FORMS.get(k, []): addr(k2, why)
    # the next step's skill when it carries the same idea forward (rule 4/10: a reason beyond "same block")
    later = [x for x in order[idx[step] + 1:] if info[x]['year'] == s['year'] and related_topic(step, x) == 2]
    for x in later[:2]:
        for k in dkeys(x): addr(k, f"the next step on this idea: {fmt_step(x)}")
    note = sp['n']
    def add_note(t):
        nonlocal note
        note = (note + ' ' if note else '') + t
    if not pre:
        same = [x for x in cands if related_topic(step, x) == 2]
        live_same = [x for x in same if S[x]['d']]
        if live_same: add_note(f"Pre: the earlier steps on this idea ({', '.join(live_same[:3])}) use this same skill and options.")
        elif same: add_note(f"Pre: the earlier steps on this idea ({', '.join(same[:3])}) have no live skill yet; see preBuild.")
        else: add_note('Pre: none; this is the first step on this idea.')
    if not rel:
        add_note('Related: no live skill shows this idea yet (see build).' if v == 'gap' else 'Related: none beyond the pre-skills; the other forms of this idea are already listed as pre-skills or direct skills.')
    return {'title': s['title'], 'direct': direct, 'partial': partial, 'verdict': v,
            'missing': '' if v == 'full' else sp['m'], 'build': sp['b'], 'pre': pre, 'preBuild': pb,
            'related': rel, 'note': note}

def closes(steps): return '; '.join(f"{x}: {S[x]['m']}" for x in steps)
def proposal(pid, steps):
    if pid in NEW:
        p = dict(NEW[pid]); p['steps'] = steps; p['closes'] = closes(steps); p['reused'] = False; return p
    src = WP.get(pid) or bl.get(pid)
    assert src, pid
    p = {k: src[k] for k in ('kind', 'skill', 'option', 'name', 'teaches', 'representation', 'family') if k in src}
    if 'representation' not in p and 'problemTypes' in src: p['representation'] = '; '.join(src['problemTypes'])
    p['steps'] = steps
    cc = src.get('ccss') or src.get('standards') or sorted({c for st in steps for c in info[st]['ccss']})
    p['ccss'] = cc
    p['why'] = src.get('why') or f"existing {'WRM_PROPOSALS' if pid in WP else bl[pid]['_src']} entry; covers these steps"
    p['closes'] = closes(steps)
    p['reused'] = True
    return p

def tagfixes(step, out):
    fixes = []
    old = {t['key']: t for t in TAGS.get(step, [])}
    new = {d['key']: None for d in out['direct']}; new.update({d['key']: d['missing'] for d in out['partial']})
    for k, t in old.items():
        if k not in new:
            fixes.append({'key': k, 'step': step, 'action': 'remove', 'why': RM.get((step, k)) or ('does not teach this step: ' + (t.get('partial') or 'tagged full but no generated item matches the step'))})
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
