"""Y4 (school Grade 3) SITE LESSONS (owner rule 2026-10-16: every site lesson tagged, WRM steps AND the lessons that are not steps).
exec'd by lessons_build.py in its own namespace, in two parts:
  setup()   before the spec file runs: `lesson()`, LESSONS, LNEW (new proposals only lessons need), LANE (proposals reused verbatim
            from a passed lane's links file: same id = same spec), and the site's Y4 entries (LES)
  finish()  after the frozen steps, proposals and tagFixes are read: the lessons are checked, their pre whys written, their proposals
            merged (a proposal a lesson builds lists it under `lessons` and its clause under `closes[<lesson id>]`), their envisioned
            skills written, and the spec gate run (every built direct / partial / pre / related carries exactly its spec's key, opts
            and Max Number, in the spec's order). Lessons emit NO tagFixes.
The steps, their proposals' step fields and the tagFixes are not touched: Y4's WRM steps passed critic r13 (Y4 lane) and are frozen;
lessons_build.py gates that byte for byte. Ported from the Y1 lane's lessons.py (passed lessons critic r3), with the Grade 3 / Support
source-year rules of the Y6 lane: a Support lesson ("Source: G<n>", flag enrich-native) is judged at its SOURCE year (GPK = R,
GK = Y1, G1 = Y2, G2 = Y3) and cites only units of that year or below (a GPK lesson with a Reception phase: an R step of a block
before the phase, phases.json); a committee lesson (school week Wnn) cites a lower-year step or a Y4 step / lesson taught before
its week; the native lesson "Pounds, tens, ones and pence" is the retitled Y4.B10.S1 and takes that step's school week.
Every Y4 base proposal has no `closes`; a lesson that builds one adds `closes` = {<lesson id>: clause} and `lessons` at the end of it
(key order kept), and the frozen gate strips both.
Shape of one lesson (the Y5 lane's contract, Y5-report.md "Site lessons"):
  lesson(id, direct=[(key, opts)], partial=[(key, opts, missing)], verdict=..., missing=..., build=[pid], closes={pid: clause},
         pre=[(key, opts, cited unit id, reason)], preBuild=[pid], related=[(key, opts, why)], note=..., search=...)
`search` is the rule-5 record: for a partial / gap lesson, the existing skills and options searched for the missing clause and why
none delivers it (written into the lesson as `rule5`).
"""
import json, re, copy

SITE = json.load(open(R + 'data/curriculum/site-lessons.json'))
LES = [l for l in SITE['lessons'] if l['wrmYear'] == 'Y4']
SITE_TITLE = {l['id']: l['title'] for l in SITE['lessons']}
SITE_BY = {l['id']: l for l in SITE['lessons']}
LESSONS, LNEW, LANE, ENVREP = {}, {}, {}, {}   # ENVREP: the envisioned representation of a reused proposal that has none
YIDX = ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6']
GRADE = {'R': 'Pre-K', 'Y1': 'Kindergarten', 'Y2': 'Grade 1', 'Y3': 'Grade 2', 'Y4': 'Grade 3', 'Y5': 'Grade 4', 'Y6': 'Grade 5'}
PH = json.load(open(R + 'tests/scripts/wrm-tagging/Y4/phases.json'))['phases']
# the native lesson the pacing reviews as a retitled Y4 step takes that step's school week
NATIVE_STEP = {'G3|-|poundstensonesandpenceusdollarscents': 'Y4.B10.S1'}

def src_year(l):
    m = l['flag'] == 'enrich-native' and re.match(r'^Source: G?(PK|K|\d)\.', l.get('note') or '')
    if not m: return None
    return 'R' if m.group(1) == 'PK' else 'Y1' if m.group(1) == 'K' else 'Y%d' % (int(m.group(1)) + 1)
def src_phase(l):
    m = re.search(r'\(Phase (\d+)\)', l.get('note') or '')
    return PH[m.group(1)] if m else None

def _opts(o):
    o = dict(o or {}); mx = o.pop('@max', None)
    return o, mx
def lesson(lid, direct=(), partial=(), verdict='', missing='', build=(), closes=None, pre=(), preBuild=(), related=(), note='', search=''):
    if lid in LESSONS: errs.append('lesson twice: ' + lid)
    o = {'direct': [], 'partial': [], 'verdict': verdict, 'missing': missing, 'build': list(build), 'pre': [], 'preBuild': list(preBuild),
         'related': [], 'note': note, 'closes': dict(closes or {}), 'search': search}
    for k, op in direct:
        op, mx = _opts(op); e = {'key': k, 'opts': op}
        if mx: e['maxNumber'] = mx
        o['direct'].append(e)
    for k, op, m in partial:
        op, mx = _opts(op); e = {'key': k}
        if op: e['opts'] = op
        if mx: e['maxNumber'] = mx
        e['missing'] = m; o['partial'].append(e)
    for k, op, ref, reason in pre:
        op, mx = _opts(op); e = {'key': k}
        if op: e['opts'] = op
        if mx: e['maxNumber'] = mx
        e['_cite'], e['_reason'] = ref, reason; o['pre'].append(e)
    for k, op, why in related:
        op, mx = _opts(op); e = {'key': k}
        if op: e['opts'] = op
        if mx: e['maxNumber'] = mx
        e['why'] = why; o['related'].append(e)
    LESSONS[lid] = o

def setup(ns):
    ns.update(lesson=lesson, LESSONS=LESSONS, LNEW=LNEW, LANE=LANE, ENVREP=ENVREP, LES=LES, R_ROOT=R)

def _sig(e): return {'key': e['key'], 'opts': e.get('opts') or {}, 'maxNumber': e.get('maxNumber')}

def finish(out_steps, proposals, tagfixes, props, keys, titles, wk, order, errs):
    BASE_PIDS = set(proposals)
    lids = [l['id'] for l in LES]
    def lesson_wk(lid):
        l = SITE_BY[lid]
        if src_year(l): return None
        if lid in NATIVE_STEP: return wk(NATIVE_STEP[lid])
        return l['firstWeek'] or 'W38'
    for lid in LESSONS:
        if lid not in lids: errs.append('lesson not a Y4 entry of site-lessons.json: ' + lid)
    for lid in lids:
        if lid not in LESSONS: errs.append('site lesson not tagged: ' + lid)
    SPEC = {lid: {r: [_sig(e) for e in st[r]] for r in ('direct', 'partial', 'pre', 'related')} for lid, st in LESSONS.items()}
    def where(lid, ref):
        sy = src_year(SITE_BY[lid])
        if ref in SITE_BY:
            rl = SITE_BY[ref]
            if rl['wrmYear'] == 'Y4':
                w1, w2 = (lesson_wk(ref) or ''), (lesson_wk(lid) or '')
                return f"site lesson taught earlier this year, wk {w1}" if w1 and w2 and w1 < w2 else f"site lesson, wk {w1 or 'none'}"
            return f"{GRADE[rl['wrmYear']]} site lesson, lower grade"
        y = ref.split('.')[0]
        if sy:
            ph = src_phase(SITE_BY[lid])
            if ph and y == 'R': return f"{GRADE['R']}, block {ref.rsplit('.', 1)[0]}, before this Support lesson's source phase"
            return f"{GRADE[y]}, the source grade" if y == sy else f"{GRADE[y]}, below the source grade"
        if y == 'Y4':
            w1, w2 = wk(ref), lesson_wk(lid)
            if not w1 or not w2: return 'this year'
            return f'taught earlier this year, wk {w1}' if w1 < w2 else f'taught the same school week, {w1}' if w1 == w2 else f'taught later, wk {w1}'
        return f'{GRADE[y]}, lower grade'
    for lid, st in LESSONS.items():
        for e in st['pre']:
            ref = e.pop('_cite'); reason = e.pop('_reason')
            t = titles.get(ref) or SITE_TITLE.get(ref)
            if not t: errs.append(f'{lid}: pre {e["key"]} cites {ref}, not a step or a site lesson'); t = ''
            e['why'] = f'{ref} {t} ({where(lid, ref)})' + (f': {reason}' if reason else '')
        for e in st['direct'] + st['partial'] + st['pre'] + st['related']:
            if e['key'] not in keys: errs.append(f'{lid}: unknown or retired skill {e["key"]}')
        v = st['verdict']
        if v not in ('full', 'partial', 'gap'): errs.append(f'{lid}: verdict {v!r}')
        if v == 'full' and (st['build'] or st['partial'] or st['missing']): errs.append(lid + ' full but build / partial / missing clause')
        if v != 'full' and not st['build']: errs.append(lid + ' not full but no build')
        if v != 'full' and not st['missing']: errs.append(lid + ' not full but no missing clause')
        if v != 'full' and len(st['search']) < 60: errs.append(f'{lid}: rule 5, a partial / gap lesson with no search record (search=...)')
        if v == 'gap' and (st['direct'] or st['partial']): errs.append(lid + ' gap with direct/partial')
        if v == 'partial' and st['direct']: errs.append(lid + ' partial lists a FULL direct skill')
        if v == 'partial' and not st['partial']: errs.append(lid + ' partial with no partial skill')
        if v == 'full' and not st['direct']: errs.append(lid + ' full with no direct skill')
        if set(st['build']) & set(st['preBuild']): errs.append(f'{lid}: own build in preBuild')
        if len(st['pre']) > 8 or len(st['related']) > 8: errs.append(lid + ' more than 8 pre / related')
        if len(st['pre']) < 3 and 'Pre-skills are few' not in st['note']: errs.append(f'{lid}: rule 15, fewer than 3 pre and no "Pre-skills are few" note')
        if not st['related'] and 'No related' not in st['note']: errs.append(f'{lid}: no related and no note why')
        dk = {e['key'] for e in st['direct'] + st['partial']}
        if {e['key'] for e in st['pre'] + st['related']} & dk: errs.append(f'{lid}: a pre / related repeats a direct / partial key (class F)')
        if {e['key'] for e in st['pre']} & {e['key'] for e in st['related']}: errs.append(f'{lid}: R10 key in both pre and related')
        for r in ('pre', 'related'):
            sg = [json.dumps(_sig(e), sort_keys=True) for e in st[r]]
            if len(set(sg)) != len(sg): errs.append(f'{lid}: a {r} link listed twice')
        for e in st['related']:
            if re.match(r'^(?:R|Y\d)\.B\d+\.S\d+|^(?:G\d|K|PK)\|-\|', e['why']) or re.search(r'prior learning', e['why'], re.I): errs.append(f'{lid}: related {e["key"]} cites earlier learning: it belongs in pre')
        for pid in st['closes']:
            if pid not in st['build']: errs.append(f'{lid}: closes names {pid}, not its build')
    lane_docs = {}
    def lane_prop(pid):
        lane = LANE[pid]
        if lane not in lane_docs: lane_docs[lane] = json.load(open(R + f'data/curriculum/links/{lane}.json'))
        src = lane_docs[lane]['proposals'].get(pid)
        if not src: errs.append(f'LANE {pid}: not a proposal of {lane}.json'); return None
        p = {k: v for k, v in src.items() if k not in ('steps', 'reused', 'closes', 'source', 'lessons', 'corrected', 'correctionWhy', 'lessonCloses')}
        p['steps'] = []; p['reused'] = True; p['source'] = f'{lane}.json (passed lane; same id, same spec)'
        return p
    used = {}
    for lid in lids:
        if lid in LESSONS:
            for pid in LESSONS[lid]['build'] + LESSONS[lid]['preBuild']: used.setdefault(pid, []).append(lid)
    for pid, ls in used.items():
        if pid in proposals: p = dict(proposals[pid])
        elif pid in LNEW:
            if pid in props or pid in LANE: errs.append('new lesson proposal id clashes with an existing one: ' + pid)
            p = dict(LNEW[pid]); p['steps'] = []; p['reused'] = False
        elif pid in LANE: p = lane_prop(pid)
        elif pid in props:
            src = props[pid]; p = {k: v for k, v in src.items() if k != '_src'}
            p['steps'] = list(src.get('steps') or []); p['reused'] = True; p['source'] = src['_src']
        else:
            errs.append('unknown proposal ' + pid); continue
        if p is None: continue
        p['lessons'] = ls
        cl = dict(p.get('closes') or {}) if isinstance(p.get('closes'), dict) else {}
        if isinstance(p.get('closes'), str): errs.append(f'proposal {pid}: a string closes (Y4 has none)')
        for lid in ls:
            if pid in LESSONS[lid]['build']:
                cl[lid] = LESSONS[lid]['closes'].get(pid) or LESSONS[lid]['missing']
                if cl[lid].strip() == (p.get('teaches') or '').strip(): errs.append(f'{lid}: rule 16, closes copies the teaches of {pid}')
        if cl: p['closes'] = cl
        p['_cl'] = cl
        if pid in BASE_PIDS:   # a frozen step proposal keeps its key order; `closes` / `lessons` are appended (the frozen gate strips them)
            proposals[pid] = p
        else: proposals[pid] = dict(sorted(p.items()))
    for pid in LNEW:
        if pid not in used: errs.append('unused new lesson proposal ' + pid)
        for f in ('kind', 'skill', 'name', 'teaches', 'representation', 'family', 'ccss', 'why'):
            if not LNEW[pid].get(f): errs.append(f'new lesson proposal {pid} has no {f}')
    for pid in LANE:
        if pid not in used: errs.append('unused lane proposal ' + pid)
    for pid in ENVREP:
        if pid not in used: errs.append('ENVREP for an unused proposal ' + pid)
        elif proposals.get(pid, {}).get('representation'): errs.append(f'ENVREP for {pid}, which has its own representation')
    def short(r, n=160):
        r = (r or '').split(';')[0].strip()
        return r if len(r) <= n else r[:n - 3].rsplit(' ', 1)[0] + ' …'
    out = {}
    for l in LES:
        lid = l['id']
        if lid not in LESSONS: continue
        st = LESSONS[lid]
        o = {'title': l['title'], 'site': {k: l[k] for k in ('flag', 'supplement', 'firstWeek', 'ccss', 'ee', 'domain', 'unit', 'block', 'power')}}
        o['direct'] = [{'key': e['key'], 'opts': e['opts'], **({'maxNumber': e['maxNumber']} if e.get('maxNumber') else {})} for e in st['direct']]
        o['partial'] = [{k: e[k] for k in ('key', 'opts', 'maxNumber', 'missing') if k in e} for e in st['partial']]
        for f in ('verdict', 'missing', 'build'): o[f] = st[f]
        o['pre'] = [{k: e[k] for k in ('key', 'opts', 'maxNumber', 'why') if k in e} for e in st['pre']]
        o['preBuild'] = st['preBuild']
        o['related'] = [{k: e[k] for k in ('key', 'opts', 'maxNumber', 'why') if k in e} for e in st['related']]
        o['note'] = st['note']
        if st['search']: o['rule5'] = st['search']
        if st['verdict'] != 'full':
            env = []
            for pid in st['build']:
                p = proposals.get(pid, {})
                kind = p.get('kind') or 'new'
                if p.get('skill'): ks = f"new skill {p['skill']}" if kind == 'new' else f"{kind} on {p['skill']}" if kind == 'repair' else f"option on {p['skill']}"
                else: ks = ('new template' if kind == 'template' else 'visual option') + ' on ' + ', '.join(p.get('hosts', [])[:3])
                e = {'proposal': pid, 'name': p.get('name', pid), 'kind': ks, 'teaches': short(p.get('teaches') or p.get('build') or '', 220),
                     'closes': p.get('_cl', {}).get(lid, st['missing']), 'representation': short(ENVREP.get(pid) or p.get('representation') or p.get('build') or p.get('option') or '')}
                for f in ('name', 'kind', 'teaches', 'closes', 'representation'):
                    if not e.get(f): errs.append(f'{lid}: envisioned {pid} has no {f}')
                env.append(e)
            o['envision'] = env
        out[lid] = o
    for p in proposals.values(): p.pop('_cl', None)
    for lid, o in out.items():
        for r in ('direct', 'partial', 'pre', 'related'):
            got = [_sig(e) for e in o[r]]
            if got != SPEC[lid][r]: errs.append(f'{lid}: SPECOPTS {r} written {got} but the spec has {SPEC[lid][r]}')
    for t in tagfixes:
        if '|-|' in t['step'] or t['step'] in out: errs.append(f'a tagFix names a lesson: {t}')
    return out, SPEC
