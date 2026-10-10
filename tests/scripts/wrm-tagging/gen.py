import json, re, sys, os
import openpyxl
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = sys.argv[1]
LIMIT = sys.argv[2] if len(sys.argv) > 2 else None   # e.g. "R.B5" => only blocks up to and including R.B5
sys.path.insert(0, HERE)
from spec import S, NEW, FORMS, RM, FIT, hi, cap, LO_STEP, R_NOLINK, NOLINK, EXTRA
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

# Rule 18 (school week): Y1 is taught in the school's xlsx week order, not WRM block order. "Earlier" and "later" use SORD.
def school_week(x):
    w = lesson_week.get(norm(info[x]['title']))
    return int(str(w)[1:]) if w else 99
SORD = [x for x in order if x.startswith('R.')] + sorted([x for x in order if x.startswith('Y1.')], key=lambda x: (school_week(x), idx[x]))
sidx = {x: i for i, x in enumerate(SORD)}
READS = json.load(open(f'{HERE}/reads_range.json'))   # skill -> True when its items change with Max Number

SUBS = [  # (family, sub, regex on the step title) — first match wins; order matters
    ('money', 'money', r'coin|note|money|unitis'),
    ('time', 'time', r'\btime\b|\bdays?\b|month|hours|before and after'),
    ('fraction', 'fracshape', r'(half|quarter) of an object'), ('fraction', 'fracqty', r'(half|quarter) of a quantity'),
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

import subprocess
MD_PATH = f'{HERE}/maxdealt.json'
MD = json.load(open(MD_PATH)) if os.path.exists(MD_PATH) else {}
MISSING = set()
FIXED = re.compile(r'^measurement:(time_|clock_)')   # a clock face: its numerals are the domain, not a number range
def dsig(k, o): return k + ' ' + json.dumps(o or {}, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
def dealt(k, o):
    """The largest number the skill+opts deals (8 generated items, maxdealt.mjs); 0 for a clock face."""
    if FIXED.match(k): return 0
    s = dsig(k, o)
    if s not in MD: MISSING.add(s); return 0
    return MD[s]
def ceiling(step):
    """Rule 18, judged per step: the step's own top = its block number range, what its own skills deal, the title's numbers."""
    c = hi(step)
    for k, o, miss in S[step]['d']:
        if miss is None: c = max(c, dealt(k, o))   # a full direct skill only: a partial may deal past the step
    for m in re.findall(r'\d+', info[step]['title']): c = max(c, int(m))
    return c
def lcap(step):
    c = ceiling(step); return max(c * 1.5, c + 2)
def fits(k, o, step):
    if k in FIT and not FIT[k]: return False
    return dealt(k, o) <= lcap(step)
def fit(k, step):
    """The opts a pre / related link uses for this step: the largest FIT row whose items stay under the step's cap; None if none."""
    if k not in FIT: return {} if fits(k, {}, step) else None
    ok = [o for c, o in FIT[k] if fits(k, o, step)]
    return dict(ok[-1]) if ok else None
def split(e):
    return (e[0], e[1], e[2] if len(e) > 2 else None)
TAUGHT = {}   # key -> [(step, opts)] in curriculum order
for x in order:
    for k, o in dentries(x): TAUGHT.setdefault(k, []).append((x, o))

def build(step):
    sp = S[step]; s = info[step]; direct = []; partial = []
    for k, o, miss in sp['d']:
        assert live(k), (step, k)
        if READS.get(k): assert 'range' in o or 'band' in o, f'{step} {k}: reads Max Number, record range (or the band that overrides it)'
        if miss: partial.append({'key': k, 'opts': o, 'missing': miss})
        else: direct.append({'key': k, 'opts': o})
    v = sp['v']
    if v == 'full': assert direct and not sp['b'] and not partial, step
    if v == 'gap': assert not direct and not partial, step
    if v == 'partial': assert partial or direct, step
    if v != 'full': assert sp['b'], step
    own = set(dkeys(step)); pre = []; pb = []
    sig = lambda k, o: k + json.dumps(o or {}, sort_keys=True)
    seen = {sig(k, o) for k, o in dentries(step)}; seen_keys = set()
    xp = set(sp['xp']); xr = set(sp['xr'])
    nl = R_NOLINK if s['year'] == 'R' else NOLINK; xp |= nl; xr |= nl   # rule 18 content / layout (spec.NOLINK)
    def addp(k, why, o=None, explicit=False):
        # a pre may be the step's own skill on an earlier rung (other opts); never the same skill+opts as a direct
        if k in xp or not live(k) or len(pre) >= 8: return False
        if o is None:
            if k in own: return False
            o = fit(k, step)
            if o is None: return False
        elif not fits(k, o, step):
            o = fit(k, step) if k not in own else None
            if o is None: return False
        if sig(k, o) in seen: return False
        if k in seen_keys and k not in own: return False
        seen.add(sig(k, o)); seen_keys.add(k); e = {'key': k, 'why': why}
        if o: e['opts'] = o
        pre.append(e); return True
    def take_builds(x):
        if S[x]['v'] != 'full':
            for b in S[x]['b']:
                if b not in pb and b not in sp['b'] and b not in sp['xpb']: pb.append(b)
    for b in sp['pb']:
        if b not in pb and b not in sp['b']: pb.append(b)
    for e in sp['p']:
        k, why, o = split(e); addp(k, why, o, explicit=o is not None)
    wk = None
    if s['year'] == 'Y1':
        # rule 3/12: the xlsx week's prior R steps, kept only when they share the step's idea; partial-only steps count
        wk, rsteps = prior_r_steps(step)
        for rs in rsteps:
            if not (related_topic(step, rs) == 2 or (related_topic(step, rs) and len(pre) < 2)): continue
            for k, o in dentries(rs): addp(k, f"{fmt_step(rs)} (school prior learning, week {wk})", o)
            if S[rs]['v'] == 'gap': take_builds(rs)
    # earlier steps on the same idea: same sub-topic first, then the same family, nearest first (rule 11);
    # rule 15: keep going through the family until 3 pre-skills are found
    cands = [x for x in reversed(SORD[:sidx[step]]) if related_topic(step, x) and (info[x]['year'] == s['year'] or s['year'] == 'Y1')]
    cands.sort(key=lambda x: -related_topic(step, x))   # stable: nearest first inside each rank
    for x in cands:
        if len(pre) >= 6 or (related_topic(step, x) < 2 and len(pre) >= 3): break
        for k, o in dentries(x): addp(k, f"{fmt_step(x)} (earlier, same idea: {topic(x)})", o)
    for x in [c for c in cands if related_topic(step, c) == 2][:3]:
        if S[x]['v'] == 'gap': take_builds(x)   # a needed earlier step with no live skill: its build is a pre-build
    pb = pb[:3]
    rel = []; rseen = set(own) | {p['key'] for p in pre} | xr
    def earlier(k):   # rule 14: the latest earlier step that teaches k
        ts = [(x, o) for x, o in TAUGHT.get(k, []) if sidx[x] < sidx[step]]
        return ts[-1] if ts else None
    promoted = []
    def addr(k, why, o=None):
        if k in rseen or not live(k) or len(rel) >= 6: return
        ex = earlier(k)
        if ex:   # an earlier step's skill is a building block: pre, never only related (rule 14)
            rseen.add(k)
            x, eo = ex
            if related_topic(step, x) or any(k == e[0] for e in sp['r']):
                use = eo if fits(k, eo, step) else fit(k, step)
                if use is not None and addp(k, f"{fmt_step(x)} (earlier step; {why})", use): promoted.append(k)
            return
        if any(idx[x] < idx[step] for x, _ in TAUGHT.get(k, [])): return   # WRM-earlier but school-later: neither pre nor related
        if o is None:
            o = fit(k, step)
            if o is None: return
        elif not fits(k, o, step): return
        rseen.add(k); e = {'key': k, 'why': why}
        if o: e['opts'] = o
        rel.append(e)
    for e in sp['r']:
        k, why, o = split(e); addr(k, why, o)
    for k in dkeys(step):
        for e in FORMS.get(k, []):
            k2, why, o = split(e); addr(k2, why, o)
    # the next steps' skills when they carry the same idea forward (rule 4/10: a reason beyond "same block")
    later = [x for x in SORD[sidx[step] + 1:] if related_topic(step, x) == 2]
    for x in later[:3]:
        for k, o in dentries(x): addr(k, f"the next step on this idea: {fmt_step(x)}", o if fits(k, o, step) else None)
    if len(rel) < 2:   # a later step on the same idea whose skill is new (not taught yet): the next form a pupil meets
        for x in [x for x in SORD[sidx[step] + 1:] if related_topic(step, x) == 2 or (related_topic(step, x) and info[x]['block'] == s['block'])]:
            if len(rel) >= 2: break
            for k, o in dentries(x):
                if not earlier(k): addr(k, f"a later step on this idea: {fmt_step(x)}", o if fits(k, o, step) else None)
    if len(rel) < 2:
        for e in EXTRA.get(topic(step), []):
            k, why, o = split(e); addr(k, why, o)
    note = sp['n']
    def add_note(t):
        nonlocal note
        note = (note + ' ' if note else '') + t
    if len(pre) < 3:   # rule 15: say exactly why there are fewer than 3
        if not cands:
            add_note(f"Pre: {len(pre)} only; this is the first step on this idea ({topic(step)}) in the curriculum" + (", so its pre-skills are building blocks from other ideas." if pre else "."))
        else:
            why = {'own': set(), 'past': set(), 'gap': []}
            dsigs = {sig(k, o) for k, o in dentries(step)}
            for x in cands:
                if not S[x]['d']: why['gap'].append(x); continue
                for k, o in dentries(x):
                    if k in {p['key'] for p in pre}: continue
                    if sig(k, o) in dsigs or k in own: why['own'].add(k.split(':')[1])
                    elif not fits(k, o, step) and fit(k, step) is None: why['past'].add(k.split(':')[1])
            parts = []
            if why['own']: parts.append('the earlier steps on this idea use this step\'s own skill (' + ', '.join(sorted(why['own'])) + ')')
            if why['past']: parts.append('the other earlier skills on this idea deal numbers past this step (' + ', '.join(sorted(why['past'])) + '; rule 18)')
            if why['gap']: parts.append('the earlier steps ' + ', '.join(why['gap'][:3]) + ' have no live skill yet (see preBuild)')
            add_note(f"Pre: {len(pre)} only; " + ('; '.join(parts) if parts else 'no other live skill teaches an earlier step on this idea') + '.')
    if not rel:
        add_note('Related: no live skill shows this idea in another form yet (see build).' if v == 'gap' else 'Related: none; every other live form of this idea is already a pre-skill or a direct skill.')
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
    for pid, st in uses.items():
        if not st: uses[pid] = [x for x in order if pid in S[x]['b']]
    props = {pid: proposal(pid, st) for pid, st in uses.items()}
    return {'year': year, 'generatedBy': 'wave2-tagging', 'steps': steps, 'proposals': props, 'tagFixes': fixes}

# pass 1 finds every link signature whose dealt maximum is unknown; maxdealt.mjs generates them; pass 2 is the real run
for y in ('R', 'Y1'): run(y)
for _ in range(3):
    if not MISSING: break
    sigs = [[s.split(' ', 1)[0], json.loads(s.split(' ', 1)[1])] for s in sorted(MISSING)]
    res = subprocess.run(['node', f'{HERE}/maxdealt.mjs'], input=json.dumps(sigs), capture_output=True, text=True, check=True)
    MD.update(json.loads(res.stdout.strip().splitlines()[-1])); json.dump(MD, open(MD_PATH, 'w'))
    MISSING.clear()
    for y in ('R', 'Y1'): run(y)
assert not MISSING, MISSING
os.makedirs(f'{ROOT}/data/curriculum/links', exist_ok=True)
for y in ('R', 'Y1'):
    if LIMIT and LIMIT.startswith('R') and y == 'Y1': continue
    doc = run(y)
    if not doc['steps']: continue
    json.dump(doc, open(f'{ROOT}/data/curriculum/links/{y}.json', 'w'), indent=1, ensure_ascii=False)
    c = {v: sum(1 for s in doc['steps'].values() if s['verdict'] == v) for v in ('full', 'partial', 'gap')}
    nr = sum(1 for p in doc['proposals'].values() if p['reused']); nn = len(doc['proposals']) - nr
    print(y, len(doc['steps']), c, 'proposals new', nn, 'reused', nr, 'tagFixes', len(doc['tagFixes']))
