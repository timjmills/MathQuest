# Helpers for the fix rounds (run first: spec_r0_* sorts before spec_r1_*). Every helper fails the build
# (errs) when the entry it edits is not where the fix expects it, so a fix can never silently miss.
def _S(sid):
    return STEPS[sid if sid.startswith('Y6.') else 'Y6.' + sid]
def _find(sid, role, key):
    for e in _S(sid)[role]:
        if e['key'] == key: return e
    errs.append(f'fix: {sid} has no {role} {key}'); return None
def drop(sid, role, key, why=''):
    s = _S(sid); n = len(s[role]); s[role] = [e for e in s[role] if e['key'] != key]
    if len(s[role]) == n: errs.append(f'fix: drop {sid} {role} {key}: not there')
def setl(sid, role, key, opts=None, why=None, missing=None, maxNumber=None):
    e = _find(sid, role, key)
    if not e: return
    if opts is not None:
        if opts: e['opts'] = opts
        else: e.pop('opts', None)
    if why is not None: e['why'] = why
    if missing is not None: e['missing'] = missing
    if maxNumber is not None: e['maxNumber'] = maxNumber
def add(sid, role, key, why=None, opts=None, pos=None, missing=None):
    s = _S(sid)
    if any(e['key'] == key and (e.get('opts') or {}) == (opts or {}) for e in s[role]): errs.append(f'fix: add {sid} {role} {key}: already there'); return
    e = {'key': key}
    if role in ('pre', 'related'): e['why'] = why
    if role == 'partial': e['missing'] = missing
    if opts: e['opts'] = opts
    if role == 'direct': e['opts'] = opts or {}
    s[role].insert(len(s[role]) if pos is None else pos, e)
def move(sid, key, src, dst, why=None, opts=None, pos=None):
    e = _find(sid, src, key)
    if not e: return
    _S(sid)[src] = [x for x in _S(sid)[src] if x is not e]
    if why is not None: e['why'] = why
    if opts is not None:
        if opts: e['opts'] = opts
        else: e.pop('opts', None)
    if dst == 'partial':
        e.pop('why', None)
    _S(sid)[dst].insert(len(_S(sid)[dst]) if pos is None else pos, e)
def to_partial(sid, key, missing, opts=None):
    e = _find(sid, 'direct', key)
    if not e: return
    _S(sid)['direct'] = [x for x in _S(sid)['direct'] if x is not e]
    p = {'key': key, 'missing': missing}
    o = e.get('opts') if opts is None else opts
    if o: p['opts'] = o
    _S(sid)['partial'].append(p)
def step(sid, **kw):
    s = _S(sid)
    for k, v in kw.items():
        if k not in s: errs.append(f'fix: step {sid} has no field {k}')
        s[k] = v
def note_add(sid, text):
    s = _S(sid); s['note'] = (s['note'].rstrip() + ' ' + text).strip()
def unbuild_pre(sid, pid):
    s = _S(sid)
    if pid not in s['preBuild']: errs.append(f'fix: {sid} preBuild has no {pid}')
    s['preBuild'] = [p for p in s['preBuild'] if p != pid]
