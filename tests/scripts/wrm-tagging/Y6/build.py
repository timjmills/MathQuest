"""Build data/curriculum/links/Y6.json, reproducibly.

Inputs (all in the repo except the generated scratch data):
  spec_base.json   the hand-authored Y6 tagging (wave-2 helper, head f2dd7afc): steps + the bodies of its new proposals
  spec_*.py        the fix rounds, applied in file-name order; each mutates STEPS / NEW and may set ENVISION, CLOSES, ENVREP
  keys.json        live skill keys, every existing proposal, live SKILL_WRM (keys.mjs; regenerated on every build)
  prior.json       each Y6 step's school week and prior-learning list, xlsx sheet "Grade 5" (prior.mjs; regenerated)
  OTHER lane files data/curriculum/links/{R,Y1,Y4}.json, pinned in the branch (passed critics; merged from
               origin/claude/sweet-newton-c8wrv1): their tags count as taught, their new proposals may be reused
  Scratch (keys.json, prior.json) goes to $WRM_TAG_DATA or a fresh temp dir; nothing is read from outside the repo.
Derived here: pre citations as step ids, rule checks, tagFixes against the live SKILL_WRM (with a structured `partial`
clause), proposals, the envisioned skill of every partial or gap step. The build runs mergecheck.mjs (Y6 alone, then with
R, Y1, Y4, then with Y5 too), optcheck.mjs and linkfit.mjs, checks the notes against the data (class N), and fails on any problem.
SITE LESSONS (owner rule 2026-10-16): lessons.py + spec_z_lessons.py write the top-level "lessons" section (the 24 wrmYear Y6
entries of data/curriculum/site-lessons.json, in the Y5 lane's shape); lessons.py holds every lesson to its spec (no pass may
re-option, add or drop a link) and lessonfit.mjs judges every lesson link from generated items (lessonmut.py proves each gate fires).
Lessons emit no tagFixes. The steps, the tagFixes and the steps' fields of every proposal are frozen (Y6 steps passed critic r5).
usage: python3 tests/scripts/wrm-tagging/Y6/build.py
"""
import json, re, sys, os, glob, subprocess, copy
H = os.path.dirname(os.path.abspath(__file__))
R = os.path.abspath(os.path.join(H, '..', '..', '..', '..')) + '/'
import tempfile
DATA = os.environ.get('WRM_TAG_DATA') or tempfile.mkdtemp(prefix='wrm-tag-y6-')   # scratch only (keys.json, prior.json)
# The passed lanes' files are pinned inputs in the branch (merged from origin/claude/sweet-newton-c8wrv1); nothing outside the repo.
OTHER = [p if os.path.isabs(p) else R + p for p in os.environ.get('WRM_LINKS_OTHER',
         'data/curriculum/links/R.json:data/curriculum/links/Y1.json:data/curriculum/links/Y4.json').split(':') if p]
for p in OTHER:
    if not os.path.exists(p): sys.exit(f'missing lane file {p} (set WRM_LINKS_OTHER)')
os.makedirs(DATA, exist_ok=True)
for s_, o_ in (('keys.mjs', 'keys.json'), ('prior.mjs', 'prior.json')):
    r_ = subprocess.run(['node', os.path.join(H, s_), os.path.join(DATA, o_)], capture_output=True, text=True)
    if r_.returncode: sys.exit(r_.stderr)
K = json.load(open(os.path.join(DATA, 'keys.json')))
keys, props, TAGS = K['keys'], K['props'], K['tags']
prior = json.load(open(os.path.join(DATA, 'prior.json')))
wrm = json.load(open(R + 'data/curriculum/wrm-steps.json'))
others = [json.load(open(p)) for p in OTHER]
for od in others:   # a proposal a passed lane defined is reused with its id and spec
    for pid, p in od['proposals'].items():
        if not p.get('reused') and pid not in props:
            props[pid] = {k: v for k, v in p.items() if k not in ('reused', 'source')}; props[pid]['_src'] = od['year'] + '.json'
steps, titles, allorder, order = {}, {}, [], []
for y in wrm['years']:
    for b in y['blocks']:
        for s in b['steps']:
            steps[s['id']] = s; titles[s['id']] = s['title']; allorder.append(s['id'])
            if y['id'] == 'Y6': order.append(s['id'])
base = json.load(open(os.path.join(H, 'spec_base.json')))
errs = []

WK_OVERRIDE = {'Y6.B12.S11': 'W32'}   # nets: the xlsx spells it "Nets of 3D shapes" (W32), so the title match misses it
def wk(sid): return WK_OVERRIDE.get(sid) or prior.get(sid, {}).get('wk') or ''

# ---- 1. citations as step ids: "Y5/Gr.4 Title", "Y1 Title", "Y5.B4.S1-S2 ..." all become "<step id> <title> (...)"
YR = {'R': 'R', 'PK4': 'R', 'Rec/PK4': 'R', 'Y1': 'Y1', 'Y1/KG': 'Y1', 'Y2': 'Y2', 'Y2/Gr.1': 'Y2', 'Y3': 'Y3', 'Y3/Gr.2': 'Y3',
      'Y4': 'Y4', 'Y4/Gr.3': 'Y4', 'Y5': 'Y5', 'Y5/Gr.4': 'Y5', 'Y6': 'Y6', 'Y6/Gr.5': 'Y6'}
norm = lambda t: re.sub(r'[^a-z0-9,]+', ' ', re.sub(r'[–—-]', '-', str(t).lower())).strip()
by_title = {}
for sid, s in steps.items():
    for t in (s['title'], s.get('siteTitle')):
        if t: by_title.setdefault(sid.split('.')[0] + '|' + norm(t), sid)
def cite_norm(why):
    m = re.match(r'^((?:R|Y\d)\.B\d+\.S\d+)(?:-S\d+)?\b', why)
    if m: return why
    m = re.match(r'^(Rec/PK4|PK4|Y\d/(?:Gr\.\d|KG)|Y\d|R)\s+(.*)$', why)
    if not m: return why
    y = YR.get(m.group(1)); rest = m.group(2)
    # the longest prefix of the rest that is a step title of that year
    for cut in sorted({mm.start() for mm in re.finditer(r'(?=[(:;,]|\s—|$)', rest)}, reverse=True):
        sid = by_title.get(f'{y}|{norm(rest[:cut])}')
        if sid: return f'{sid} {rest}'
    return why

STEPS = {sid: copy.deepcopy(base['steps'][sid]) for sid in order}
for sid, sp in STEPS.items():
    for e in sp['pre']: e['why'] = cite_norm(e['why'])
NEW = copy.deepcopy(base['newProposals'])
ns = {'STEPS': STEPS, 'NEW': NEW, 'props': props, 'keys': keys, 'wk': wk, 'titles': titles, 'ENVISION': {}, 'ENVTEACH': {}, 'CLOSES': {}, 'ENVREP': {}, 'errs': errs}
# site lessons (lessons.py): `lesson()` and the lesson proposal tables, set up before the spec files run (spec_z_lessons.py uses them)
LNS = {'R': R, 'errs': errs}
exec(open(os.path.join(H, 'lessons.py')).read(), LNS)
LNS['setup'](ns)
for f in sorted(glob.glob(os.path.join(H, 'spec_*.py'))): exec(open(f).read(), ns)
ENV, ENVTEACH, CLOSES, ENVREP = ns['ENVISION'], ns['ENVTEACH'], ns['CLOSES'], ns['ENVREP']

# ---- 2. per-step rules
def sig(e): return e['key'] + json.dumps(e.get('opts') or {}, sort_keys=True)
cite_re = re.compile(r'^((?:R|Y\d)\.B\d+\.S\d+)')
YIDX = ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6']
for sid in order:
    sp = STEPS[sid]; v = sp['verdict']
    for e in sp['direct'] + sp['partial'] + sp['pre'] + sp['related']:
        if e['key'] not in keys: errs.append(f'{sid}: unknown or retired skill {e["key"]}')
        if 'opts' in e and not e['opts']: del e['opts']
    for e in sp['direct']: e.setdefault('opts', {})
    if v == 'full' and (sp['build'] or sp['partial']): errs.append(sid + ' full but build/partial')
    if v != 'full' and not sp['build']: errs.append(sid + ' not full but no build')
    if v == 'gap' and (sp['direct'] or sp['partial']): errs.append(sid + ' gap with direct/partial')
    if v == 'partial' and sp['direct']: errs.append(sid + ' partial step lists a FULL direct skill (M1)')
    if v == 'partial' and not sp['partial']: errs.append(sid + ' partial with no partial skill')
    if v != 'full' and not sp['missing']: errs.append(sid + ' not full but no missing clause')
    if set(sp['build']) & set(sp['preBuild']): errs.append(f'{sid}: G own build in preBuild {sorted(set(sp["build"]) & set(sp["preBuild"]))}')
    if len(sp['pre']) > 8 or len(sp['related']) > 8: errs.append(sid + ' too many pre/related')
    dk = {e['key'] for e in sp['direct'] + sp['partial']}
    if {e['key'] for e in sp['pre'] + sp['related']} & dk: errs.append(f'{sid}: a pre/related repeats a direct/partial key')
    both = {p['key'] for p in sp['pre']} & {r['key'] for r in sp['related']}
    if both: errs.append(f'{sid}: R10 key in both pre and related: {sorted(both)}')
    if len({sig(e) for e in sp['pre']}) != len(sp['pre']): errs.append(f'{sid}: a pre listed twice')
    if not sp['related'] and 'No related' not in sp['note']: errs.append(f'{sid}: no related and no note why')
    if len(sp['pre']) < 3 and 'Pre-skills are few' not in sp['note']: errs.append(f'{sid}: rule 15, fewer than 3 pre and no note why')
    for e in sp['pre']:
        m = cite_re.match(e['why'])
        if m and m.group(1).startswith('Y6.') and wk(m.group(1)) and wk(sid) and wk(m.group(1)) > wk(sid):
            errs.append(f'{sid} [{wk(sid)}]: D pre {e["key"]} cites {m.group(1)}, taught later ({wk(m.group(1))})')
        if m and m.group(1).startswith('Y6.') and order.index(m.group(1)) > order.index(sid) and not wk(m.group(1)):
            errs.append(f'{sid}: D pre {e["key"]} cites a later step with no school week')
        if m and YIDX.index(m.group(1).split('.')[0]) > 5: pass
        if re.search(r'\b(previous|next) step\b', e['why']) and m and m.group(1).startswith('Y6.') and wk(m.group(1)) > wk(sid):
            errs.append(f'{sid}: D pre why says previous step but cites a later week')
    for e in sp['related']:
        if re.search(r'prior learning', e['why'], re.I) or re.match(r'^(R|Y[1-5])\.B\d+', e['why']):
            errs.append(f'{sid}: F related {e["key"]} is earlier learning (why: {e["why"][:60]}) — it belongs in pre')
    if re.search(r'\bhalf (?:its|of its|of the|the) (?:\w+ )?items\b', sp['missing'] + ' ' + ' '.join(p['missing'] for p in sp['partial'])):
        errs.append(f'{sid}: K a per-seed proportion in a clause')

# ---- 2b. class N (critic r4): a note may not contradict the data. "X is the build", "X is (also) the preBuild", "both are
# preBuild", "no (separate) preBuild", "X and Y ... are direct / partial" are read and checked against the step's lists.
def note_claims(sid, sp):
    out = []
    ids = set(NEW) | set(props)
    for sent in re.split(r'(?<=[.;])\s+', sp['note']):
        toks = [t for t in re.findall(r'\b[a-z][a-z0-9_]+\b', sent) if t in ids or ('_' in t and t in ids)]
        sk = {e['key'].split(':')[1]: e['key'] for e in sp['direct'] + sp['partial'] + sp['pre'] + sp['related']}
        if re.search(r'\bno (separate )?preBuild\b', sent) and sp['preBuild']: out.append(f'says no preBuild but preBuild is {sp["preBuild"]}')
        for m in re.finditer(r'\b([a-z][a-z0-9_]+)\s+is\s+(also\s+)?(both\s+)?the\s+(preBuild|build)\b', sent):
            t, kind = m.group(1), m.group(4)
            if t in ids and t not in sp[kind]: out.append(f'says {t} is the {kind} but {kind} is {sp[kind]}')
        m = re.search(r'\b(both|they) are (also )?preBuild\b', sent)
        if m:
            for t in toks:
                if t not in sp['preBuild'] and t not in sp['build']: out.append(f'says {t} is preBuild but preBuild is {sp["preBuild"]}')
            if any(t in sp['build'] for t in toks) and 'build' not in sent.replace('preBuild', ''): out.append(f'says {[t for t in toks if t in sp["build"]]} is preBuild but it is the build')
        for m in re.finditer(r'\b(?:is|are) (direct|partial)\b', sent):
            for t in re.findall(r'[a-z][a-z0-9_]+', sent[:m.start()]):
                if t in sk:
                    role = 'direct' if any(e['key'] == sk[t] for e in sp['direct']) else 'partial' if any(e['key'] == sk[t] for e in sp['partial']) else 'link'
                    if role != m.group(1): out.append(f'says {t} is {m.group(1)} but it is {role}')
        for m in re.finditer(r'\b([a-z][a-z0-9_]+) is (?:both )?the build and the pre-?(?:skill|Build)\b', sent):
            if m.group(1) in ids and m.group(1) not in sp['preBuild']: out.append(f'says {m.group(1)} is also the pre-skill but preBuild is {sp["preBuild"]}')
    return out
for sid in order:
    for c in note_claims(sid, STEPS[sid]): errs.append(f'{sid}: N stale note: {c}')

# ---- 3. G18/H: a pre's cited step must be a step the skill is tagged to after the merge (live SKILL_WRM + the passed lane
# files' tagFixes + this file). When it is not, re-cite the nearest step it IS tagged to that the pupil has met by this
# week; when there is none, say so in the why.
taught_at = {}
merged_all = {}
for k_, v_ in TAGS.items():
    for t_ in v_: merged_all[(k_, t_ if isinstance(t_, str) else t_['step'])] = 1
for od in others:
    for t_ in od['tagFixes']:
        if t_['action'] == 'remove': merged_all.pop((t_['key'], t_['step']), None)
        elif t_['action'] in ('add', 'full', 'partial'): merged_all[(t_['key'], t_['step'])] = 1
for (k_, s_) in merged_all:
    if not s_.startswith('Y6.'): taught_at.setdefault(k_, set()).add(s_)
for sid_, sp_ in STEPS.items():
    for e_ in sp_['direct'] + sp_['partial']: taught_at.setdefault(e_['key'], set()).add(sid_)
def met_by(t_, sid_):
    y = YIDX.index(t_.split('.')[0])
    return y < 6 or (wk(t_) and wk(sid_) and wk(t_) <= wk(sid_))
recited = 0
for sid_, sp_ in STEPS.items():
    for e_ in sp_['pre']:
        m_ = cite_re.match(e_['why'])
        if not m_ or re.search(r"has no live skill|nearest live practice", e_['why']): continue
        if m_.group(1) in taught_at.get(e_['key'], set()): continue
        ref_ = m_.group(1)
        cands = [t_ for t_ in taught_at.get(e_['key'], set()) if t_ in allorder and t_ != sid_ and met_by(t_, sid_)]
        _w = e_['why']; _m2 = re.search(r'\)\s*:\s*|:\s+', _w)
        tail = _w[_m2.end():].strip() if _m2 else ''
        if cands:
            best = min(sorted(cands), key=lambda t_: (t_.split('.')[0] != ref_.split('.')[0], abs(allorder.index(t_) - allorder.index(ref_)) if ref_ in allorder else 0))
            e_['why'] = f"{best} {titles[best]} (the skill's own step; this step builds on {ref_} {titles.get(ref_, '')})" + (f': {tail}' if tail else '')
        else:
            e_['why'] = e_['why'].rstrip() + f" (nearest live practice: {e_['key'].split(':')[1]} is not tagged to {ref_})"
        recited += 1

# ---- 4. proposals
used = {}
for sid in order:
    for p in STEPS[sid]['build'] + STEPS[sid]['preBuild']: used.setdefault(p, []).append(sid)
proposals = {}
for pid, sids in used.items():
    if pid in NEW:
        p = dict(NEW[pid]); p['steps'] = sorted(set(sids), key=order.index); p['reused'] = False
        if pid in props: errs.append('new proposal id clashes with an existing one: ' + pid)
    elif pid in props:
        src = props[pid]
        p = {k: v for k, v in src.items() if k != '_src'}
        p['steps'] = sorted(set(list(src.get('steps') or []) + sids), key=lambda s: (s not in order, order.index(s) if s in order else 0, s))
        p['reused'] = True; p['source'] = src['_src']
    else:
        errs.append('unknown proposal ' + pid); continue
    proposals[pid] = dict(sorted(p.items()))
for pid in NEW:
    if pid not in used: errs.append('unused new proposal ' + pid)

# ---- 5. rule 13: the envisioned skill of every partial or gap step (short: name, kind, teaches, closes, representation)
def short_rep(r):
    r = (r or '').split(';')[0].strip()
    return r if len(r) <= 160 else r[:157].rsplit(' ', 1)[0] + ' …'
def short_t(t):
    t = (t or '').strip()
    return t if len(t) <= 220 else t[:217].rsplit(' ', 1)[0] + ' …'
out_steps = {}
for sid in order:
    sp = STEPS[sid]
    st = {'title': titles[sid], 'direct': sp['direct'], 'partial': sp['partial'], 'verdict': sp['verdict'], 'missing': sp['missing'],
          'build': sp['build'], 'pre': sp['pre'], 'preBuild': sp['preBuild'], 'related': sp['related'], 'note': sp['note']}
    if sp['verdict'] != 'full':
        env = []
        for pid in sp['build']:
            p = proposals.get(pid, {})
            kind = p.get('kind') or 'new'
            if p.get('skill'): kind_s = f"new skill {p['skill']}" if kind == 'new' else f"option on {p['skill']}"
            else: kind_s = ('new template' if kind == 'template' else 'visual option') + ' on ' + ', '.join(p.get('hosts', [])[:3])
            e = {'proposal': pid, 'name': p.get('name', pid), 'kind': kind_s.strip(),
                 'teaches': ENV.get(sid, {}).get(pid) or ENVTEACH.get(pid) or short_t(p.get('teaches', '')),
                 'closes': CLOSES.get(sid, {}).get(pid, sp['missing']),
                 'representation': ENVREP.get(pid) or short_rep(p.get('representation') or p.get('build', ''))}
            for f in ('name', 'kind', 'teaches', 'closes', 'representation'):
                if not e.get(f): errs.append(f'{sid}: envisioned {pid} has no {f}')
            if e['closes'] == p.get('teaches'): errs.append(f'{sid}: rule 16, closes copies the proposal teaches ({pid})')
            env.append(e)
        st['envision'] = env
    out_steps[sid] = st

# ---- 6. tagFixes, DERIVED against the live SKILL_WRM. action: add (no tag yet; `partial` carries the clause when it is a
# partial cover), full (a partial tag becomes full), partial (a full tag becomes partial, or a partial clause is replaced;
# `partial` carries the clause), opts (tag unchanged, record option values), remove (tagged now, not direct/partial here).
cur, notes = {}, {}
for k, v in TAGS.items():
    for e in v:
        sid_ = e if isinstance(e, str) else e['step']
        if sid_ in out_steps:
            cur[(k, sid_)] = None if isinstance(e, str) or 'partial' not in e else e['partial']
            if isinstance(e, dict) and e.get('note'): notes[(k, sid_)] = e['note']
WHY = ns.get('TAGWHY', {})
want = {}
for sid, st in out_steps.items():
    for d in st['direct']:
        w = want.setdefault((d['key'], sid), {'status': 'full', 'opts': []}); w['opts'].append(d.get('opts', {}))
        if d.get('maxNumber'): w['maxNumber'] = d['maxNumber']
    for pz in st['partial']:
        w = want.setdefault((pz['key'], sid), {'status': 'partial', 'opts': [], 'missing': pz['missing']})
        w['opts'].append(pz.get('opts', {}))
        if pz.get('maxNumber'): w['maxNumber'] = pz['maxNumber']
        if w['status'] == 'partial' and pz['missing'] not in w['missing']: w['missing'] += '; ' + pz['missing']
tagfixes = []
for (key, sid), w in sorted(want.items(), key=lambda x: (order.index(x[0][1]), x[0][0])):
    opts = [o for o in w['opts'] if o]
    t = {'key': key, 'step': sid}
    hw = WHY.get((key, sid))
    if (key, sid) not in cur:
        t['action'] = 'add'
        if w['status'] == 'partial': t['partial'] = w['missing']
        t['why'] = hw or ('not tagged yet; generated items with these opts teach this step' + (' in part' if w['status'] == 'partial' else ''))
    elif cur[(key, sid)] is not None and w['status'] == 'full':
        t['action'] = 'full'; t['why'] = hw or 'tagged partial; with these option values the generated items teach the whole step'
    elif cur[(key, sid)] is None and w['status'] == 'partial':
        t['action'] = 'partial'; t['partial'] = w['missing']
        t['why'] = hw or ('tagged full' + (f" (note '{notes[(key, sid)]}')" if (key, sid) in notes else '') + '; generated items teach only part of the step')
    elif w['status'] == 'partial' and cur[(key, sid)] != w['missing']:
        t['action'] = 'partial'; t['partial'] = w['missing']; t['why'] = hw or 'tagged partial; the live clause is replaced by what the generated items leave out'
    elif opts:
        t['action'] = 'opts'; t['why'] = hw or 'tag unchanged; record the option values that make the generated items fit the step'
    else:
        continue
    if opts: t['opts'] = opts if len(opts) > 1 else opts[0]
    if w.get('maxNumber'): t['maxNumber'] = w['maxNumber']
    tagfixes.append(t)
for (key, sid) in sorted(cur, key=lambda x: (order.index(x[1]), x[0])):
    if (key, sid) in want: continue
    st = out_steps[sid]
    where = 'related' if any(r['key'] == key for r in st['related']) else ('pre' if any(p['key'] == key for p in st['pre']) else '')
    tagfixes.append({'key': key, 'step': sid, 'action': 'remove',
                     'why': WHY.get((key, sid)) or ('generated items do not teach this step' + (f'; kept as a {where} skill' if where else ''))})

# ---- 7. site lessons (lessons.py): checked, pre whys written, proposals merged (`lessons`, closes[<lesson id>]), envisioned,
# and held to their spec; they emit no tagFixes
out_lessons, SPEC_LESSONS = LNS['finish'](out_steps, proposals, tagfixes, props, keys, titles, wk, order, errs)
json.dump(SPEC_LESSONS, open(os.path.join(DATA, 'spec-lessons.json'), 'w'), indent=1, ensure_ascii=False, sort_keys=True)
doc = {'year': 'Y6', 'generatedBy': 'wave2-tagging', 'steps': out_steps, 'lessons': out_lessons, 'proposals': dict(sorted(proposals.items())), 'tagFixes': tagfixes}
OUT = R + 'data/curriculum/links/Y6.json'
json.dump(doc, open(OUT, 'w'), indent=1, ensure_ascii=False)
open(OUT, 'a').write('\n')
from collections import Counter
c = Counter(s['verdict'] for s in out_steps.values())
print('steps', len(out_steps), dict(c))
print('proposals new', sum(1 for p in proposals.values() if not p['reused']), 'reused', sum(1 for p in proposals.values() if p['reused']),
      '| tagFixes', len(tagfixes), {a: sum(1 for t in tagfixes if t['action'] == a) for a in ('add', 'full', 'partial', 'opts', 'remove')})
print('pre citations re-cited to a tagged step (H):', recited)
print('lessons', len(out_lessons), dict(Counter(s['verdict'] for s in out_lessons.values())), '| site-lessons Y6', len(LNS['LES']),
      '| proposals used by lessons', sum(1 for p in proposals.values() if p.get('lessons')), 'new', sum(1 for p in proposals.values() if p.get('lessons') and not p['reused']))
# mergecheck: Y6 alone, with the lanes whose tags the steps were built against (R, Y1, Y4), and with every passed lane in the repo
# (Y5 too: its lessons section and tagFixes); 0 problems, and no tagFix may name a site lesson
for args in ([OUT], [OUT] + OTHER, [OUT] + OTHER + [R + 'data/curriculum/links/Y5.json']):
    mc = subprocess.run(['node', os.path.join(H, 'mergecheck.mjs')] + args, capture_output=True, text=True)
    print((mc.stdout.strip().splitlines() or ['mergecheck: no output'])[-2])
    if mc.returncode: errs.append('mergecheck.mjs FAILED:\n' + mc.stdout.strip()[-3000:] + mc.stderr.strip()[-500:])
oc = subprocess.run(['node', os.path.join(H, 'optcheck.mjs'), OUT], capture_output=True, text=True)
print((oc.stdout.strip().splitlines() or ['optcheck: no output'])[-1])
if oc.returncode: errs.append('optcheck.mjs FAILED:\n' + oc.stdout.strip()[-3000:])
lf = subprocess.run(['node', os.path.join(H, 'linkfit.mjs'), OUT], capture_output=True, text=True, env={**os.environ, 'WRM_TAG_DATA': DATA})
print((lf.stdout.strip().splitlines() or ['linkfit: no output'])[-1])
if lf.returncode: errs.append('linkfit.mjs FAILED:\n' + lf.stdout.strip()[-3000:])
lsf = subprocess.run(['node', os.path.join(H, 'lessonfit.mjs'), OUT], capture_output=True, text=True, env={**os.environ, 'WRM_TAG_DATA': DATA})
open(os.path.join(DATA, 'lessonfit.txt'), 'w').write(lsf.stdout + lsf.stderr)
print((lsf.stdout.strip().splitlines() or ['lessonfit: no output'])[-1])
if lsf.returncode: errs.append('lessonfit.mjs FAILED (site lessons):\n' + lsf.stdout.strip()[-6000:] + lsf.stderr.strip()[-1500:])
# lessons critic r1 F5: the FINAL written file against the spec snapshot (a pass after finish() may not re-option a lesson link)
ls_ = subprocess.run([sys.executable, os.path.join(H, 'lessonspec.py'), OUT, os.path.join(DATA, 'spec-lessons.json')], capture_output=True, text=True)
print((ls_.stdout.strip().splitlines() or ['lessonspec: no output'])[-1])
if ls_.returncode: errs.append('lessonspec.py FAILED (written lessons differ from the spec):\n' + ls_.stdout.strip()[-3000:] + ls_.stderr.strip()[-500:])
print('\n'.join(errs) or 'OK')
sys.exit(1 if errs else 0)
