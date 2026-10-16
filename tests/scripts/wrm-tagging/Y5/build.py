"""Build data/curriculum/links/Y5.json (US Grade 4), reproducibly.

Inputs (all in the repo):
  y5_r0.json      the round-0 hand-authored steps and proposals (helper session, a181f8a4), the base
  spec_*.py       hand fixes, applied in file-name order (spec_r1.py: critic local r1; spec_r2.py: critic r4)
  wrm-steps.json, the Grade 4 sheet of the school xlsx (prior.mjs), live SKILL_WRM / proposals (keys.mjs)
Passes (ported from the Y4 lane, critic r13):
  1. hand fixes;  2. own build never in preBuild;  3. a pre cites a step its skill is tagged to and that the school
  teaches by this week (re-cited, or named "nearest live practice");  4. linkfit.mjs --fit: every pre / related link gets
  the nearest option set whose 100 generated items fit the step (size, Grade-4 school-week content, later-grade content,
  why claims); a link with no fitting option set is dropped;  5. tagFixes DERIVED by diffing against live SKILL_WRM;
  6. every partial / gap step gets its envisioned skill (name, kind, teaches, closes, representation);  7. mergecheck.mjs
  (live wrm.js) must report 0 problems, else the build fails.
usage: python3 tests/scripts/wrm-tagging/Y5/build.py      (exit 1 on any problem; output is byte-identical run to run)
"""
import json, re, sys, os, glob, subprocess, copy
H = os.path.dirname(os.path.abspath(__file__))
R = os.path.abspath(os.path.join(H, '..', '..', '..', '..')) + '/'
DATA = os.environ.get('WRM_TAG_DATA') or os.path.join(os.environ.get('TMPDIR', '/tmp'), 'wrm-tag-Y5')
os.makedirs(DATA, exist_ok=True)
NENV = dict(os.environ, WRM_TAG_DATA=DATA)
def node(*a):
    p = subprocess.run(['node', *a], capture_output=True, text=True, env=NENV, cwd=R)
    if p.returncode not in (0, 1): sys.exit(f'node {a[0]} failed:\n{p.stdout[-2000:]}\n{p.stderr[-2000:]}')
    return p
node(os.path.join(H, 'keys.mjs'), os.path.join(DATA, 'keys.json'))
node(os.path.join(H, 'prior.mjs'), os.path.join(DATA, 'prior.json'))
K = json.load(open(os.path.join(DATA, 'keys.json')))
keys, props = K['keys'], K['props']
prior = json.load(open(os.path.join(DATA, 'prior.json')))
# site lessons (data/curriculum/site-lessons.json, Year 5 = school Grade 4): every lesson the school site schedules that is
# not a WRM small step. Tagged in spec_z_lessons.py into the "lessons" section; their week joins prior.json so the
# pass-3 re-cite and linkfit judge their links against the school week too (a Support lesson with no week: W38, any time)
SL = json.load(open(R + 'data/curriculum/site-lessons.json'))
LES = [l for l in SL['lessons'] if l['wrmYear'] == 'Y5']
for l in LES: prior[l['id']] = {'wk': l['firstWeek'] or 'W38', 'lesson': True}
json.dump(prior, open(os.path.join(DATA, 'prior.json'), 'w'), indent=1, ensure_ascii=False)
LESSONS = {}
wrm = json.load(open(R + 'data/curriculum/wrm-steps.json'))
steps, order, allorder = {}, [], []
for y in wrm['years']:
    for b in y['blocks']:
        for s in b['steps']:
            steps[s['id']] = s; allorder.append(s['id'])
            if y['id'] == 'Y5': order.append(s['id'])
base = json.load(open(os.path.join(H, 'y5_r0.json')))
ST = copy.deepcopy(base['steps'])
NEW = {k: v for k, v in copy.deepcopy(base['proposals']).items() if not v.get('reused')}
errs = []
def wk(sid): return prior.get(sid, {}).get('wk') or ''

# ---------- helpers for spec files ----------
def E(k):
    """'cat:skill{json}@N' -> link dict (key, opts, maxNumber)."""
    m = re.match(r'^([a-z_0-9]+:[a-z_0-9]+)(\{.*\})?(?:@(\d+))?$', k)
    if not m: errs.append('bad key ' + k); return {'key': k}
    e = {'key': m.group(1)}
    if m.group(2): e['opts'] = json.loads(m.group(2))
    if m.group(3): e['maxNumber'] = int(m.group(3))
    if e['key'] not in keys: errs.append('unknown skill ' + e['key'])
    return e
def cite(sid, ref, extra=''):
    """A why that cites step `ref` and says where it sits for step `sid` (school-week order)."""
    t = steps[ref]['title']
    if ref.startswith('Y5.'):
        w1, w2 = wk(ref), wk(sid)
        where = f'taught earlier this year, wk {w1}' if w1 < w2 else f'taught the same school week, {w1}'
    else:
        where = 'lower grade, same idea'
    return f"{ref} {t} ({where}{'; ' + extra if extra else ''})"
def _match(e, k):
    return e['key'] == k.split('{')[0].split('@')[0] and ('{' not in k or e.get('opts') == E(k).get('opts'))
def drop(sid, role, k):
    n = len(ST[sid][role]); ST[sid][role] = [e for e in ST[sid][role] if not _match(e, k)]
    if len(ST[sid][role]) == n: errs.append(f'spec drop: {sid} {role} has no {k}')
def add(sid, role, k, why, at=None):
    e = E(k); e['why'] = why
    if role in ('direct',): e = {x: y for x, y in e.items() if x != 'why'}; e.setdefault('opts', {})
    lst = ST[sid][role]
    if at is None: lst.append(e)
    else: lst.insert(at, e)
def add_partial(sid, k, missing):
    e = E(k); e['missing'] = missing; ST[sid]['partial'].append(e)
def setopts(sid, role, k, opts=None, maxNumber=None, why=None):
    hit = False
    for e in ST[sid][role]:
        if _match(e, k):
            if opts is not None:
                if opts: e['opts'] = opts
                else: e.pop('opts', None)
            if maxNumber: e['maxNumber'] = maxNumber
            if why: e['why' if role != 'partial' else 'missing'] = why
            hit = True
    if not hit: errs.append(f'spec setopts: {sid} {role} has no {k}')
def to_partial(sid, k, missing):
    """Move a direct skill to partial with its own clause."""
    for e in list(ST[sid]['direct']):
        if _match(e, k):
            ST[sid]['direct'].remove(e); p = {'key': e['key']}
            if e.get('opts'): p['opts'] = e['opts']
            if e.get('maxNumber'): p['maxNumber'] = e['maxNumber']
            p['missing'] = missing; ST[sid]['partial'].append(p); return
    errs.append(f'spec to_partial: {sid} has no direct {k}')
def move(sid, k, src, dst, why):
    for e in list(ST[sid][src]):
        if _match(e, k):
            ST[sid][src].remove(e); e['why'] = why; ST[sid][dst].insert(0 if dst == 'pre' else len(ST[sid][dst]), e); return
    errs.append(f'spec move: {sid} {src} has no {k}')
def lesson(lid, **f):
    """One site lesson: direct / partial / pre / related as E() keys ('key{opts}' or (key, missing) / (key, why))."""
    if lid in LESSONS: errs.append('lesson twice: ' + lid)
    o = {'title': next((l['title'] for l in LES if l['id'] == lid), ''), 'direct': [], 'partial': [], 'pre': [], 'related': [], 'build': [], 'preBuild': [], 'missing': '', 'note': ''}
    o.update({k: v for k, v in f.items() if k not in ('direct', 'partial', 'pre', 'related')})
    for k in f.get('direct', []): e = E(k); e.setdefault('opts', {}); o['direct'].append(e)
    for k, m in f.get('partial', []): e = E(k); e['missing'] = m; o['partial'].append(e)
    for role in ('pre', 'related'):
        for k, w in f.get(role, []): e = E(k); e['why'] = w; o[role].append(e)
    LESSONS[lid] = o
ns = dict(R_ROOT=R, ST=ST, NEW=NEW, LESSONS=LESSONS, lesson=lesson, LES=LES, E=E, cite=cite, _match=_match, drop=drop, add=add, add_partial=add_partial, setopts=setopts, to_partial=to_partial,
          move=move, steps=steps, wk=wk, errs=errs, CLOSES={}, KEEP_LINKS=set(), RENAME={}, PATCH={}, re=re, json=json)
for f in sorted(glob.glob(os.path.join(H, 'spec_*.py'))): exec(open(f).read(), ns)
CLOSES = ns['CLOSES']
lids = [l['id'] for l in LES]
for lid in LESSONS:
    if lid not in lids: errs.append('lesson not on the site (site-lessons.json Y5): ' + lid)
for lid in lids:
    if lid not in LESSONS: errs.append('site lesson not tagged: ' + lid)
UNITS = {**ST, **LESSONS}   # steps and site lessons: passes 1-4 and the checks run on both
# proposal ids folded into another (owner rulings / cross-year reuse)
for sid, st in UNITS.items():
    for f in ('build', 'preBuild'):
        out = []
        for p in st[f]:
            p = ns['RENAME'].get(p, p)
            if p and p not in out: out.append(p)
        st[f] = out
    st['preBuild'] = [p for p in st['preBuild'] if p not in st['build']]   # rule 3: never the step's own build

# option values live in `opts` now: drop the round-0 "- easier: {...}" / ": option tiles 22" notes from the whys
for st in UNITS.values():
    for e in st['pre'] + st['related']:
        e['why'] = re.sub(r'\s*[-:]\s*(?:option [a-z]+ \S+\s*-\s*)?easier: \{.*?\}\s*$', '', e['why'])
# ---------- critic r5 class F: a pre / related link may not repeat the unit's own direct or partial ----------
# Same key and opts (and Max Number) as an own direct / partial: a pre with a numeric band steps one band down (the same skill
# one place smaller, with a why that says so, no step cite); otherwise, and for a related link, it is dropped. Run again after
# the linkfit pass (which can re-option a link onto the unit's own opts), and linkfit fails a link that deals the same items.
BANDS = K.get('bands', {})
def _sig(e): return e['key'] + json.dumps(e.get('opts', {}), sort_keys=True) + str(e.get('maxNumber') or '')
def own_repeats(stage):
    n_sub, n_drop = 0, 0
    for sid, st in UNITS.items():
        mine = {_sig(e) for e in st['direct'] + st['partial']}
        for role in ('pre', 'related'):
            keep = []
            for e in st[role]:
                if _sig(e) not in mine: keep.append(e); continue
                b = (e.get('opts') or {}).get('band'); lower = [v for v in BANDS.get(e['key'], []) if b and v < b]
                if stage == 'before fit' and role == 'pre' and lower:
                    e = dict(e); e['opts'] = dict(e['opts'], band=lower[-1])
                    if _sig(e) not in mine and _sig(e) not in {_sig(x) for x in keep}:
                        e['why'] = f"{keys.get(e['key'], e['key'])} with numbers to {lower[-1]:,}: the same skill one band below this unit's own (lower band)"
                        keep.append(e); n_sub += 1; continue
                n_drop += 1
            st[role] = keep
    return n_sub, n_drop
OWNREP = {'before fit': own_repeats('before fit')}
# ---------- pass 3: pre cites a tagged step met by this week ----------
taught_at = {}
for k_, v_ in K['tags'].items():
    for t_ in v_: taught_at.setdefault(k_, set()).add(t_ if isinstance(t_, str) else t_['step'])
for sid_, st_ in ST.items():
    for e_ in st_['direct'] + st_['partial']: taught_at.setdefault(e_['key'], set()).add(sid_)
YR = ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6']
recited = 0
for sid_, st_ in UNITS.items():
    for e_ in st_['pre']:
        m_ = re.match(r'^((?:R|Y\d)\.B\d+\.S\d+)', e_['why'])
        if not m_ or re.search(r"has no live skill|this step's build|nearest live practice", e_['why']): continue
        ref_ = m_.group(1)
        later = ref_.startswith('Y5.') and wk(ref_) and wk(ref_) > wk(sid_)
        if ref_ in taught_at.get(e_['key'], set()) and not later: continue
        cands = [t_ for t_ in taught_at.get(e_['key'], set()) if t_ in steps and t_ != sid_ and
                 (YR.index(t_.split('.')[0]) < 5 or (t_.startswith('Y5.') and wk(t_) and wk(t_) <= wk(sid_)))]
        if cands:
            best = min(sorted(cands), key=lambda t_: (t_.split('.')[0] != ref_.split('.')[0], abs(allorder.index(t_) - allorder.index(ref_))))
            e_['why'] = cite(sid_, best); recited += 1
        else:
            e_['why'] = re.sub(r'\)?$', '', e_['why'].split(' (')[0]) + f" (nearest live practice: {e_['key'].split(':')[1]} is not tagged to {ref_}" + (f", which the school teaches later, {wk(ref_)}" if later else '') + ')'
            recited += 1

# ---------- pass 3b (critic r6 sweep): a link that cites an "A and B" step and deals one half says which half ----------
# "Y4.B4.S5 9 times-table and division facts" on mult_facts, "Y5.B4.S9 Add and subtract fractions …" on add_fractions_like: the
# why names the half the skill deals ("the multiplication half"), so the cited title does not claim the other operation
# (claims.mjs reads the marker; sweep.mjs found these links in round 5)
HALVES = [('adding', r'^addition:|:add_', r'\badd', r'\bsubtract'), ('subtracting', r'^subtraction:|:sub_', r'\bsubtract', r'\badd'),
          ('multiplication', r'^multiplication:', r'multipl|times-table', r'divi'), ('division', r'^division:|:div_', r'divi', r'multipl|times-table')]
halved = 0
for sid_, st_ in UNITS.items():
    for role_ in ('pre', 'related'):
        for e_ in st_[role_]:
            m_ = re.match(r'^((?:R|Y\d)\.B\d+\.S\d+)', e_['why'])
            # a skill that deals both halves (add_sub_100s, missing_mult_div, sub_check_by_adding, fact families) is not marked
            if not m_ or ' half' in e_['why'] or re.search(r'nearest live practice|has no live skill', e_['why']) or re.search(r'add_sub|mult_div|check|famil|inverse|missing', e_['key']): continue
            t_ = steps.get(m_.group(1), {}).get('title', '')
            for h_, kre, mine, other in HALVES:
                if re.search(kre, e_['key']) and re.search(mine, t_, re.I) and re.search(other, t_, re.I):
                    e_['why'] = (e_['why'][:-1] + f'; the {h_} half)') if e_['why'].endswith(')') else e_['why'] + f' (the {h_} half)'
                    halved += 1; break

# ---------- pass 4: linkfit --fit ----------
cand = os.path.join(DATA, 'Y5.candidate.json')
json.dump({'year': 'Y5', 'steps': ST, 'lessons': LESSONS, 'tagFixes': []}, open(cand, 'w'), indent=1, ensure_ascii=False)
fitf = os.path.join(DATA, 'fit.json')
p = node(os.path.join(H, 'linkfit.mjs'), cand, '--fit', fitf)
fit = json.load(open(fitf))
dropped, changed = [], 0
for sid, st in UNITS.items():
    for role in ('pre', 'related'):
        keep = []
        for e in st[role]:
            r = fit[f"{sid}|{role}|{e['key']}|{json.dumps(e.get('opts', {}), separators=(',', ':'), ensure_ascii=False)}"]
            if 'drop' in r:
                dropped.append((sid, role, e['key'], r['drop'][:2])); continue
            if r['opts'] != e.get('opts', {}) or (r.get('maxNumber') or None) != e.get('maxNumber'): changed += 1
            if r['opts']: e['opts'] = r['opts']
            else: e.pop('opts', None)
            if r.get('maxNumber'): e['maxNumber'] = r['maxNumber']
            else: e.pop('maxNumber', None)
            keep.append(e)
        st[role] = keep
json.dump(dropped, open(os.path.join(DATA, 'dropped.json'), 'w'), indent=1, ensure_ascii=False)
OWNREP['after fit'] = own_repeats('after fit')
# critic r4 class E: one link per key + opts in a role (the first, best-ranked, is kept); linkfit also fails two links
# of one role that deal the same items
deduped = 0
for sid, st in UNITS.items():
    for role in ('pre', 'related'):
        seen, keep = set(), []
        for e in st[role]:
            sg = e['key'] + json.dumps(e.get('opts', {}), sort_keys=True) + str(e.get('maxNumber') or '')
            if sg in seen: deduped += 1; continue
            seen.add(sg); keep.append(e)
        st[role] = keep

# ---------- step checks ----------
for sid, st in UNITS.items():
    if len(st['pre']) > 8: st['pre'] = st['pre'][:8]
    if len(st['related']) > 8: st['related'] = st['related'][:8]
    v = st['verdict']
    if len(st['pre']) < 3 and 'Pre-skills are few' not in st['note']:
        errs.append(f'{sid}: rule 15, {len(st["pre"])} pre and no "Pre-skills are few" note')
    if not st['related'] and 'No related' not in st['note']: errs.append(f'{sid}: no related and no note why')
    both = {e['key'] for e in st['pre']} & {e['key'] for e in st['related']}
    if both: errs.append(f'{sid}: R10 key in both pre and related: {sorted(both)}')
    dk = {e['key'] for e in st['direct'] + st['partial']}
    if dk & {e['key'] for e in st['related']}: errs.append(f'{sid}: related repeats a direct/partial skill')
    if v == 'full' and st['build']: errs.append(sid + ' full but build')   # a full step may list a partial skill beside its full directs
    if v != 'full' and not st['build']: errs.append(sid + ' not full but no build')
    if v == 'gap' and (st['direct'] or st['partial']): errs.append(sid + ' gap with direct/partial')
    if v == 'partial' and st['direct']: errs.append(sid + ' partial step lists a direct skill')
    if v == 'partial' and not st['partial']: errs.append(sid + ' partial with no partial skill')
    if v == 'full' and st['missing']: errs.append(sid + ' full with a missing clause')

# ---------- proposals ----------
used = {}
for sid in order:
    for pid in ST[sid]['build'] + ST[sid]['preBuild']: used.setdefault(pid, []).append(sid)
proposals = {}
def okey(s): return (s not in allorder, allorder.index(s) if s in allorder else 0, s)
for pid in sorted(used, key=lambda x: (order.index(used[x][0]), x)):
    sids = used[pid]
    if pid in props:
        src = props[pid]; pr = {k: v for k, v in src.items() if k != '_src'}
        pr['steps'] = sorted(set(list(src.get('steps') or []) + sids), key=okey); pr['reused'] = True; pr['source'] = src['_src']
    elif pid in NEW:
        pr = dict(NEW[pid]); pr['steps'] = sorted(set(sids + list(pr.get('stepsOtherYears', []))), key=okey); pr.pop('stepsOtherYears', None)
        pr['reused'] = bool(pr.get('source'))
    else:
        errs.append('unknown proposal ' + pid); continue
    if pid in ns['PATCH']:
        pr.update(ns['PATCH'][pid]); pr['corrected'] = sorted(k for k in ns['PATCH'][pid] if k != 'correctionWhy')
    cl = {}
    for sid in sids:
        if pid in ST[sid]['build']:
            cl[sid] = CLOSES.get(sid, {}).get(pid) or ST[sid]['missing']
    if cl: pr['closes'] = cl
    for sid, c in cl.items():
        if c.strip() == (pr.get('teaches') or '').strip(): errs.append(f'{sid}: rule 16, closes copies the teaches of {pid}')
    proposals[pid] = pr
# site lessons: a proposal a lesson builds lists the lesson under `lessons` (never under `steps`, which the lead merges into
# WRM_PROPOSALS) and its clause under closes[<lesson id>]; a proposal only lessons use is emitted after the step ones
used_l = {}
for lid in lids:
    if lid in LESSONS:
        for pid in LESSONS[lid]['build'] + LESSONS[lid]['preBuild']: used_l.setdefault(pid, []).append(lid)
for pid in sorted(used_l, key=lambda x: (lids.index(used_l[x][0]), x)):
    if pid not in proposals:
        if pid in props:
            src = props[pid]; pr = {k: v for k, v in src.items() if k != '_src'}
            pr['steps'] = sorted(set(src.get('steps') or []), key=okey); pr['reused'] = True; pr['source'] = src['_src']
        elif pid in NEW:
            pr = dict(NEW[pid]); pr['steps'] = sorted(set(pr.get('stepsOtherYears', [])), key=okey); pr.pop('stepsOtherYears', None)
            pr['reused'] = bool(pr.get('source'))
        else:
            errs.append('unknown proposal ' + pid); continue
        if pid in ns['PATCH']:
            pr.update(ns['PATCH'][pid]); pr['corrected'] = sorted(k for k in ns['PATCH'][pid] if k != 'correctionWhy')
        proposals[pid] = pr
    pr = proposals[pid]
    pr['lessons'] = used_l[pid]
    for lid in used_l[pid]:
        if pid in LESSONS[lid]['build']:
            pr.setdefault('closes', {})[lid] = CLOSES.get(lid, {}).get(pid) or LESSONS[lid]['missing']
            if pr['closes'][lid].strip() == (pr.get('teaches') or '').strip(): errs.append(f'{lid}: rule 16, closes copies the teaches of {pid}')
for pid in NEW:
    if pid not in used and not NEW[pid].get('source'): pass   # unused new proposals are simply not emitted
def short_rep(r):
    r = (r or '').split(';')[0].strip()
    return r if len(r) <= 160 else r[:157].rsplit(' ', 1)[0] + ' …'
for sid in order + [l for l in lids if l in LESSONS]:
    st = UNITS[sid]
    if st['verdict'] == 'full': st.pop('envision', None); continue
    env = []
    for pid in st['build']:
        pr = proposals.get(pid, {})
        kind = pr.get('kind') or 'new'
        if pr.get('skill'): ks = f"new skill {pr['skill']}" if kind == 'new' else f"option on {pr['skill']}"
        else: ks = ('new template' if kind == 'template' else 'visual option') + ' on ' + ', '.join(pr.get('hosts', [])[:3])
        env.append({'proposal': pid, 'name': pr.get('name', pid), 'kind': ks, 'teaches': pr.get('teaches') or short_rep(pr.get('build') or pr.get('adds') or ''),
                    'closes': pr.get('closes', {}).get(sid, st['missing']), 'representation': short_rep(pr.get('representation') or pr.get('build') or ((pr.get('option') + ' on the existing ' + pr['skill'].split(':')[1] + ' cell') if pr.get('option') and pr.get('skill') else '') or (('the ' + ', '.join(pr['templates']) + ' template' + ('s' if len(pr['templates']) > 1 else '')) if pr.get('templates') else ''))})
    for e in env:
        for f in ('name', 'kind', 'teaches', 'closes', 'representation'):
            if not e.get(f): errs.append(f"{sid}: envisioned {e['proposal']} has no {f}")
    st['envision'] = env

# ---------- pass 5: tagFixes derived from live SKILL_WRM ----------
cur, notes = {}, {}
for k, v in K['tags'].items():
    for e in v:
        s_ = e if isinstance(e, str) else e['step']
        if s_ in ST: cur[(k, s_)] = None if isinstance(e, str) or 'partial' not in e else e['partial']
        if s_ in ST and isinstance(e, dict) and e.get('note'): notes[(k, s_)] = e['note']
want = {}
for sid in order:
    st = ST[sid]
    for dd in st['direct']:
        w = want.setdefault((dd['key'], sid), {'status': 'full', 'opts': []}); w['status'] = 'full'; w['opts'].append(dd.get('opts', {}))
        if dd.get('maxNumber'): w['maxNumber'] = dd['maxNumber']
    for pz in st['partial']:
        w = want.setdefault((pz['key'], sid), {'status': 'partial', 'opts': [], 'missing': pz['missing']})
        w['opts'].append(pz.get('opts', {}))
        if pz.get('maxNumber'): w['maxNumber'] = pz['maxNumber']
        if w['status'] == 'partial' and pz['missing'] not in w['missing']: w['missing'] += '; ' + pz['missing']
tagfixes = []
for (key, sid), w in sorted(want.items(), key=lambda x: (order.index(x[0][1]), x[0][0])):
    opts = [o for o in w['opts'] if o]
    t = {'key': key, 'step': sid}
    if (key, sid) not in cur:
        t['action'] = 'add'
        if w['status'] == 'partial': t['partial'] = w['missing']
        t['why'] = 'not tagged yet; generated items teach this step' + (' in part' if w['status'] == 'partial' else '')
    elif cur[(key, sid)] is not None and w['status'] == 'full':
        t['action'] = 'full'; t['why'] = 'tagged partial; with these option values the generated items teach the whole step'
    elif cur[(key, sid)] is None and w['status'] == 'partial':
        t['action'] = 'partial'; t['partial'] = w['missing']
        t['why'] = 'tagged full' + (f" (note '{notes[(key, sid)]}')" if (key, sid) in notes else '') + '; generated items teach only part of the step'
    elif w['status'] == 'partial' and cur[(key, sid)] != w['missing']:
        t['action'] = 'partial'; t['partial'] = w['missing']; t['why'] = 'tagged partial; the clause is replaced by what the generated items leave out'
    elif opts:
        t['action'] = 'opts'; t['why'] = 'tag unchanged; record the option values that make the generated items fit the step'
    else:
        continue
    if opts: t['opts'] = opts if len(opts) > 1 else opts[0]
    if w.get('maxNumber'): t['maxNumber'] = w['maxNumber']
    tagfixes.append(t)
for (key, sid) in sorted(cur, key=lambda x: (order.index(x[1]), x[0])):
    if (key, sid) in want: continue
    st = ST[sid]
    where = 'related' if any(r['key'] == key for r in st['related']) else ('pre' if any(p_['key'] == key for p_ in st['pre']) else '')
    tagfixes.append({'key': key, 'step': sid, 'action': 'remove', 'why': 'generated items do not teach this step' + (f'; kept as a {where} skill' if where else '')})

# ---------- write ----------
FIELDS = ['title', 'direct', 'partial', 'verdict', 'missing', 'build', 'pre', 'preBuild', 'related', 'note', 'envision']
def clean(e, role):
    o = {'key': e['key']}
    if role == 'direct': o['opts'] = e.get('opts', {})
    elif e.get('opts'): o['opts'] = e['opts']
    if e.get('maxNumber'): o['maxNumber'] = e['maxNumber']
    if role == 'partial': o['missing'] = e['missing']
    if role in ('pre', 'related'): o['why'] = e['why']
    return o
out_steps = {}
for sid in order:
    st = ST[sid]; o = {}
    for f in FIELDS:
        if f == 'title': o[f] = steps[sid]['title']
        elif f in ('direct', 'partial', 'pre', 'related'): o[f] = [clean(e, f) for e in st[f]]
        elif f == 'envision':
            if st.get('envision') is not None: o[f] = st['envision']
        else: o[f] = st.get(f, [] if f in ('build', 'preBuild') else '')
    out_steps[sid] = o
out_lessons = {}
for l in LES:
    if l['id'] not in LESSONS: continue
    st = LESSONS[l['id']]; o = {'title': l['title'],
        'site': {k: l[k] for k in ('flag', 'supplement', 'firstWeek', 'ccss', 'ee', 'domain', 'unit', 'block', 'power')}}
    for f in FIELDS[1:]:
        if f in ('direct', 'partial', 'pre', 'related'): o[f] = [clean(e, f) for e in st[f]]
        elif f == 'envision':
            if st.get('envision') is not None: o[f] = st['envision']
        else: o[f] = st.get(f, [] if f in ('build', 'preBuild') else '')
    out_lessons[l['id']] = o
missing_steps = [s for s in order if s not in ST]
if missing_steps: errs.append(f'steps missing: {missing_steps}')
doc = {'year': 'Y5', 'generatedBy': 'wave2-tagging', 'steps': out_steps, 'lessons': out_lessons, 'proposals': proposals, 'tagFixes': tagfixes}
OUT = R + 'data/curriculum/links/Y5.json'
# the other years' links files merged into main: mergecheck merges all their tagFixes with Y5's (0 real problems required)
OTHER_YEARS = [y for y in ('R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y6') if os.path.exists(R + f'data/curriculum/links/{y}.json')]
with open(OUT, 'w') as f:
    json.dump(doc, f, indent=1, ensure_ascii=False); f.write('\n')
from collections import Counter
c = Counter(s['verdict'] for s in out_steps.values())
print('steps', len(out_steps), dict(c))
print('lessons', len(out_lessons), dict(Counter(s['verdict'] for s in out_lessons.values())), 'site-lessons Y5', len(LES))
print('proposals new', sum(1 for p_ in proposals.values() if not p_['reused']), 'reused', sum(1 for p_ in proposals.values() if p_['reused']),
      'tagFixes', len(tagfixes), {a: sum(1 for t in tagfixes if t['action'] == a) for a in ('add', 'full', 'partial', 'opts', 'remove')})
print(f'pre re-cited: {recited}; "A and B" cites marked with the half dealt: {halved}; links re-optioned by linkfit: {changed}; links dropped by linkfit: {len(dropped)}; duplicates removed: {deduped}')
print('own direct/partial repeated as a link (critic r5 F): ' + '; '.join(f'{k}: {a} stepped a band down, {b} dropped' for k, (a, b) in OWNREP.items()))
mc = node(os.path.join(H, 'mergecheck.mjs'), OUT, *[R + f'data/curriculum/links/{y}.json' for y in OTHER_YEARS])
print(mc.stdout.strip().splitlines()[-1] if mc.stdout.strip() else 'mergecheck: no output')
if mc.returncode != 0: errs.append('mergecheck.mjs FAILED:\n' + mc.stdout.strip()[-3000:])
lf = node(os.path.join(H, 'linkfit.mjs'), OUT)
print(lf.stdout.strip().splitlines()[-1])
if lf.returncode != 0: errs.append('linkfit misfits after the fit pass:\n' + lf.stdout.strip()[-3000:])
oc = node(os.path.join(H, 'optcheck.mjs'), OUT)
print(oc.stdout.strip().splitlines()[-1])
if oc.returncode != 0: errs.append('optcheck FAILED:\n' + oc.stdout.strip()[-2000:])
print('\n'.join(errs) or 'OK')
sys.exit(1 if errs else 0)
