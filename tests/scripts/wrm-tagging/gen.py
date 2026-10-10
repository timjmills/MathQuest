import json, re, sys, os
import openpyxl
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = sys.argv[1]
LIMIT = sys.argv[2] if len(sys.argv) > 2 else None   # e.g. "R.B5" => only blocks up to and including R.B5
sys.path.insert(0, HERE)
from spec import S, NEW, FORMS, RM, FIT, hi, cap, LO_STEP, R_NOLINK, NOLINK, EXTRA, FORM_LABEL, BLOCKS, BLOCK_EXCEPT, NOLINK_WHY
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
    ('position', 'position', r'\bpositions?\b|map|turn|scene|visualis|instructions|ordinal'),
    ('count', 'subitise', r'subitis'), ('count', 'find', r'^find \d+(,| and| to)|^represent|count objects'),
    ('count', 'oral', r'verbal|patterns beyond'), ('pattern', 'pattern', r'pattern'),
    ('measure', 'mass', r'mass|balance|heavier'), ('measure', 'capacity', r'capacity|volume|full'),
    ('measure', 'length', r'length|height|size'),
    ('position', 'position', r'\bpositions?\b|map|turn|scene|visualis|instructions|ordinal'),
    ('shape', 'compose', r'combine shapes|compose shapes|decompose|manipulate|copy 2-d|shape arrangements'),
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
    ('count', 'sequence', r'count on|count backwards|count from|within 20'),
    ('count', 'tens', r'tens|beyond 10|understand 1|understand 20|20, 30')]
def topic2(step):
    t = info[step]['title'].lower()
    for fam, sub, rx in SUBS:
        if re.search(rx, t): return fam, sub
    return 'count', 'other:' + step   # an unmatched title is its own idea (critic r6 N1r): never "the same idea" as another step
def topic(step): return topic2(step)[1]
for _x in order:   # critic r9 D16: a map / position / turn title is never a counting idea
    if re.search(r'\bmaps?\b|\bpositions?\b|\bturns?\b', info[_x]['title'].lower()): assert topic2(_x)[0] == 'position', (_x, topic2(_x))
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
def md(k, o):
    s = dsig(k, o)
    if s not in MD: MISSING.add(s); return {'max': 0, 'flags': {}, 'c19': {}, 'distinct': 24}
    return MD[s]
def dealt(k, o):
    """The largest number the skill+opts deals (24 generated items, maxdealt.mjs); 0 for a clock face."""
    return 0 if FIXED.match(k) else md(k, o)['max']
NUMCAT = re.compile(r'^(counting|composing|comparing|addition|subtraction|placevalue|number_sense|patterns:(double|halve|skip)|division|measurement:money|measurement:coin)')
BADFLAGS = ('times', 'parallel', 'vert', 'column', 'coord', 'word', 'poly', 'units', 'frac')
# Reception links stay pictured (critic r4 D1): no symbol-only equations, number lines, missing-number or three-addend sums
R_WRITTEN = re.compile(r'^(measurement:(time_|clock_)|multiplication:)')   # critic r5 N3
R_EQ = re.compile(r'^(addition:(nl_add|number_line_add|add_three|add_10_no_regroup|add_10_mixed|cloze_addition|number_families_add|add_sub_fact_family|add_20|equal_sign|add_facts)|subtraction:(nl_sub|number_line_sub|missing_add_sub|sub_10|sub_20))')
def content_why(k, o, step):
    """Rule 18 content / layout: the one content reason a link cannot be used, or None."""
    if k in FIT and not FIT[k]: return 'its content is past this grade'
    if 'name_match' in k: return 'it drags written names'
    if k == 'shapes_early:partition_shapes' and o.get('forms') != [0]: return 'it asks for typed fraction notation (1/2, 3/4)'
    if step.startswith('R.') and R_EQ.match(k): return 'it is a symbol equation or number line, not a Reception response'
    if step.startswith('R.') and R_WRITTEN.match(k): return 'it asks for a written Kindergarten answer (clock times, groups-of sentences)'
    if step.startswith('R.') and idx[step] < idx['R.B6.S1'] and md(k, o).get('c19', {}).get('quad', 0) >= 3:
        return 'it shows squares and rectangles, which Reception meets later (block 6, shapes with 4 sides)'
    d = md(k, o)
    if d.get('distinct', 24) < 3: return f"its opts deal only {d.get('distinct')} different item(s)"
    f = d['flags']
    for n in BADFLAGS:
        if not f.get(n): continue
        if k == 'shapes_early:partition_shapes' and n in ('times', 'frac'): continue   # "divided into 2 equal parts", halves
        return {'times': 'it uses x or ÷', 'parallel': 'it asks about angles or parallel sides', 'vert': 'it asks about vertices',
                'column': 'it uses a column layout', 'coord': 'it uses coordinates', 'word': 'it asks for typed words', 'poly': 'it shows shapes past 4 sides',
                'units': 'it uses standard units', 'frac': 'it shows fractions'}[n]
    return None
def content_ok(k, o, step=''): return content_why(k, o, step) is None
def title_nums(x): return [int(m) for m in re.findall(r'(?<![23]-)\b\d+\b(?!-D)', info[x]['title'])]
# Reception ceilings are the step's title number or its block's number, never a partial's dealt maximum (critic r4)
R_BLOCK_CEIL = {'R.B1': 5, 'R.B3': 3, 'R.B5': 5, 'R.B7': 5, 'R.B9': 8, 'R.B11': 10, 'R.B13': 20, 'R.B14': 10, 'R.B16': 12, 'R.B18': 10}
def r_own(x, full_only=False):
    """Reception: the title's number when it has one; else the block's number when the step has a number skill; else 0
    (a matching or shape step works with no number, so its links are held to what earlier steps met)."""
    t = title_nums(x)
    if t: return max(t)
    if x.startswith('R.B18.'): return R_BLOCK_CEIL['R.B18']   # the review block: its own level
    if any(NUMCAT.match(k) and (m is None or not full_only) for k, o, m in S[x]['d']): return R_BLOCK_CEIL.get(x.rsplit('.', 1)[0], 0)
    return 0
def own2(x):
    """The numbers a step itself works with. Reception: the title or block number. Year 1: the title and what its
    direct and partial number skills deal."""
    c = max(title_nums(x) or [0])
    if x.startswith('R.'): return r_own(x)
    c = max([c] + [int(m) for m in re.findall(r'(?:to|within) (\d+)', S[x]['m'])])   # the step's own missing clause ("totals to 10")
    if c < 3:   # no number of its own: the block's "within N"
        c = max([c] + [int(m) for m in re.findall(r'within (\d+)', info[x]['blockName'])])
    for k, o, miss in S[x]['d']:
        if miss is None and NUMCAT.match(k): c = max(c, dealt(k, o))   # a partial never sets the ceiling (critic r6 D4)
    if c < 3:
        for k, o, miss in S[x]['d']:
            if NUMCAT.match(k): c = max(c, dealt(k, o))   # nothing else: what its skills deal
    return c
def own1(x):
    c = max(title_nums(x) or [0])
    if x.startswith('R.'): return r_own(x, full_only=True)
    for k, o, miss in S[x]['d']:
        if miss is None and NUMCAT.match(k): c = max(c, dealt(k, o))
    return c
def cum(x):
    """The largest number met so far in school order (Reception, then the Kindergarten xlsx weeks)."""
    return max(own1(y) for y in SORD[:sidx[x] + 1])
def rel_c(x):
    c = own2(x); return c if c >= 3 else min(cum(x), 20)
def ceil_for(step, why=''):
    if step.startswith('R.') and own2(step) >= 3: return own2(step)   # R: the step's own number only (title or block)
    cited = [c for c in re.findall(r'\b(?:R|Y1)\.B\d+\.S\d+', why or '') if c in info]
    if cited:
        c = max([own2(c2) for c2 in cited] + [own2(step)])
        return c if c >= 3 else rel_c(step)
    return rel_c(step)
def lcap_c(c): return max(c * 1.5, c + 2)
# Rule 19: the first-taught Kindergarten week of each content type, read from the Kindergarten sheet (0 = taught in Reception).
CONTENT_WEEKS = {'number lines': 5, 'tens as rods': 8, 'counting in 10s': 9, 'number sentences': 11, 'coins': 11, 'addition sentences': 11,
                 'subtraction sentences': 12, 'equal groups': 19, 'arrays': 20, 'measuring with units': 24, 'counting in 2s and 5s': 33,
                 'notes (bills)': 35, 'differences (how many more)': 18, 'clock time': 36, 'halves and quarters': 36, '< > symbols': 4}
SENT = re.compile(r'^(addition:(nl_add|number_line_add|add_three|add_10_no_regroup|add_10_mixed|cloze_addition|number_families_add|add_sub_fact_family|add_20|equal_sign|add_facts)|subtraction:(nl_sub|number_line_sub|missing_add_sub|sub_10|sub_20))')
def ctypes(k, o):
    """The rule-19 content types a skill+opts deals (key-based, plus the critic's per-item classes on >= 3 of 24 items)."""
    c = md(k, o).get('c19', {}); t = set()
    hit = lambda n: c.get(n, 0) >= 3
    if hit('nline') or re.search(r'number_line|:nl_|place_on_number_line', k): t.add('number lines')
    if re.search(r'tens_foundation|base10|unit_form', k): t.add('tens as rods')
    if re.match(r'^patterns:seq_10', k): t.add('counting in 10s')
    if hit('skip25') or re.match(r'^patterns:(seq_2|seq_5|skip_count_line)', k): t.add('counting in 2s and 5s')
    if SENT.match(k):
        t.add('number sentences'); t.add('subtraction sentences' if k.startswith('subtraction:') else 'addition sentences')
    if hit('minus') and (SENT.match(k) or k.startswith('addition:')): t.add('subtraction sentences')   # families deal "8 − 6" too (critic r8 M1)
    if hit('money') or re.match(r'^measurement:(coin|money|equiv_coin)', k): t.add('coins')
    if k == 'measurement:money_count' and o.get('kind') in ('note', 'both'): t.add('notes (bills)')
    if k == 'multiplication:equal_or_unequal_groups': t.add('equal groups')
    if hit('array') or k == 'multiplication:arrays_groups': t.add('arrays')
    if hit('units') or re.search(r'measure_nonstandard|reading_ruler', k): t.add('measuring with units')
    if hit('clock') or FIXED.match(k): t.add('clock time')
    if hit('frac') or re.match(r'^(fractions:|patterns:halve|shapes_early:partition)', k): t.add('halves and quarters')
    if hit('lt') or k.startswith('placevalue:compare'): t.add('< > symbols')
    if hit('diff'): t.add('differences (how many more)')
    return sorted(t)
def week_limit(w): return 20 if w < 8 else 50 if w < 10 else 100
def week_why(k, o, step):
    """Rule 19: the reason a Kindergarten link carries content (or numbers) the school has not taught by the step's week."""
    if step.startswith('R.'): return None
    w = school_week(step)
    for t in ctypes(k, o):
        if CONTENT_WEEKS[t] > w: return f'{t} are taught from week {CONTENT_WEEKS[t]}' if t.endswith('s') else f'{t} is taught from week {CONTENT_WEEKS[t]}'
    if not FIXED.match(k) and dealt(k, o) > week_limit(w): return f'it deals numbers to {dealt(k, o)}, past {week_limit(w)} at week {w}'
    return None
def size_why(k, o, step, why=''):
    if FIXED.match(k): return None
    c = ceil_for(step, why)
    if dealt(k, o) <= lcap_c(c): return None
    return 'a counting skill; this step has no numbers' if c == 0 else f'it deals numbers to {dealt(k, o)}, past this step ({c})'
def misfit(k, o, step, why=''):
    """The ONE reason a link does not fit this step (content, school week or size), or None."""
    return content_why(k, o, step) or week_why(k, o, step) or size_why(k, o, step, why)
def fits(k, o, step, why=''): return misfit(k, o, step, why) is None
def fit(k, step, why=''):
    """The opts a pre / related link uses: the broadest FIT row that fits this step; None if none."""
    if k not in FIT: return {} if fits(k, {}, step, why) else None
    ok = [o for c, o in FIT[k] if fits(k, o, step, why)]
    return dict(ok[-1]) if ok else None
def fit_reason(k, step, why=''):
    rows = [o for c, o in FIT[k]] if k in FIT and FIT[k] else [{}]
    return misfit(k, rows[0], step, why) or 'it does not fit this step'
# A related why must say what the link's items do (critic r5 N1 / N2): checked when the file is generated.
FALSE_WHY = [(re.compile(r'which has more|one jump'), lambda k, o: True),
             (re.compile(r'rows of a picture graph'), lambda k, o: md(k, o).get('c19', {}).get('diff', 0) > 0)]
def xr_why(k, step):
    """The one reason a key is left out of this step's links (no generic 'rules 8 and 18')."""
    if k in NOLINK_WHY: return NOLINK_WHY[k]
    if k in S[step]['xr'] or k in S[step]['xp']: return 'left out here (see the note)' if S[step]['n'] else 'left out here by hand: not the same idea'
    return 'left out here (rules 8 and 18)'
def is_block(k, o, step):
    """A neighbouring-idea skill is a building block only when spec.BLOCKS says so for the step's sub-idea."""
    if (k, step) in BLOCK_EXCEPT: return False
    ks = k + json.dumps(o or {}, sort_keys=True)
    subs = BLOCKS.get(ks, BLOCKS.get(k, set()))
    return topic(step) in subs or (topic(step).startswith('other:') and 'other' in subs)
def form_label(k, o):
    return FORM_LABEL.get(k + json.dumps(o or {}, sort_keys=True)) or FORM_LABEL.get(k) or label(k)
def check_claims(step, rel, pre=(), note=''):
    for e in list(pre) + list(rel):   # critic r7 N5: "(earlier, same idea: X)" only for the step's own sub-idea
        m = re.search(r'earlier, same idea: ([\w:.]+)\)', e['why'])
        assert not m or m.group(1) == topic(step), (step, e)
    for e in list(pre) + list(rel):
        if 'same idea' in e['why'] or 'on this idea' in e['why']:
            for c in re.findall(r'(?:R|Y1)\.B\d+\.S\d+', e['why']):
                assert c in info and related_topic(step, c) == 2, (step, e)   # critic r8 sameidea2: cited steps share the sub-idea
        if ': a building block' in e['why']: assert is_block(e['key'], e.get('opts', {}), step), (step, e)
    for m in re.finditer(r'every earlier step on this idea \(([^)]*)\)', note):
        for c in re.findall(r'(?:R|Y1)\.B\d+\.S\d+', m.group(1)): assert related_topic(step, c) == 2, (step, c)
    for e in rel:
        m = re.search(r'(?:next|later) step on this idea: ((?:R|Y1)\.B\d+\.S\d+)', e['why'])
        assert not m or related_topic(step, m.group(1)) == 2, (step, e)   # a later step must be the same sub-idea
        if re.search(r':nl_(add|sub)$', e['key']): assert e.get('opts', {}).get('unknown') == 'answer', (step, e)
        for rx, bad in FALSE_WHY:
            assert not (rx.search(e['why']) and bad(e['key'], e.get('opts', {}))), (step, e)
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
            o = fit(k, step, why)
            if o is None: return False
        elif not fits(k, o, step, why):
            o = fit(k, step, why) if k not in own else None
            if o is None: return False
        if sig(k, o) in seen: return False
        if k in seen_keys and k not in own:
            # a second rung of a key already listed only when it changes the representation (critic r9: frame vs dice)
            if (o or {}).get('objects') in {(p.get('opts') or {}).get('objects') for p in pre if p['key'] == k}: return False
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
    for e in sp.get('pl', []):   # hand links that come after the school prior-learning loop (critic r10 M6)
        k, why, o = split(e); addp(k, why, o, explicit=o is not None)
    # earlier steps on the same idea: same sub-topic first, then the same family, nearest first (rule 11);
    # rule 15: keep going through the family until 3 pre-skills are found
    cands = [x for x in reversed(SORD[:sidx[step]]) if related_topic(step, x) and (info[x]['year'] == s['year'] or s['year'] == 'Y1')]
    cands.sort(key=lambda x: -related_topic(step, x))   # stable: nearest first inside each rank
    for x in cands:
        if len(pre) >= 6 or (related_topic(step, x) < 2 and len({p['key'] for p in pre}) >= 3): break   # a second rung of one key does not fill the block tier (critic r10 D18)
        for k, o in dentries(x):
            if related_topic(step, x) == 2: addp(k, f"{fmt_step(x)} (earlier, same idea: {topic(x)})", o)
            elif is_block(k, o, step): addp(k, f"{fmt_step(x)} ({form_label(k, o)}: a building block)", o)   # judged in spec.BLOCKS (critic r8 N7)
    for x in [c for c in cands if related_topic(step, c) == 2][:3]:
        if S[x]['v'] == 'gap': take_builds(x)   # a needed earlier step with no live skill: its build is a pre-build
    pb = pb[:3]
    rel = []; rseen = set(own) | {p['key'] for p in pre} | xr
    def earlier(k):   # rule 14: the latest earlier step that teaches k
        ts = [(x, o) for x, o in TAUGHT.get(k, []) if sidx[x] < sidx[step]]
        return ts[-1] if ts else None
    promoted = []; rej = {}
    def addr(k, why, o=None):
        if k in rseen or not live(k) or len(rel) >= 6:
            if live(k) and k not in {r['key'] for r in rel}:
                rej.setdefault(k, 'a direct skill here' if k in own else 'a pre-skill here' if k in {p['key'] for p in pre} else xr_why(k, step) if k in xr else None)
            return
        ex = earlier(k)
        if ex:   # an earlier step's skill is a building block: pre, never only related (rule 14)
            rseen.add(k)
            x, eo = ex
            if related_topic(step, x) or any(k == e[0] for e in sp['r']):
                use = eo if fits(k, eo, step, fmt_step(x)) else fit(k, step, fmt_step(x))
                if related_topic(step, x) == 2:
                    base = 'the same idea' if re.match(r'(the next|a later) step|the same idea in another form', why) else why
                elif is_block(k, use or eo, step):
                    base = f'{form_label(k, use or eo)}: a building block'
                else:
                    base = None   # a neighbouring idea that is not a judged building block: not a pre (critic r8 N5r)
                if use is not None and base and addp(k, f"{fmt_step(x)} (an earlier step; {base})", use): promoted.append(k); return
            rej[k] = 'taught at an earlier step (' + x + '), but ' + (misfit(k, eo, step, fmt_step(x)) or 'not a building block of this step')
            return
        if any(idx[x] < idx[step] for x, _ in TAUGHT.get(k, [])):   # WRM-earlier but school-later: neither pre nor related
            rej[k] = 'an earlier WRM step teaches it, but the school teaches it after this week'; return
        if o is None:
            o = fit(k, step)
            if o is None: rej[k] = fit_reason(k, step); return
        elif not fits(k, o, step):
            rej[k] = misfit(k, o, step); return
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
    def add_later(x, k, o, lead):
        # cite the later step only when its own opts fit here; a refitted link is the same idea at this step's size
        if fits(k, o, step): addr(k, f"{lead}: {fmt_step(x)}", o); return
        o2 = fit(k, step)
        if o2 is None: addr(k, '', None); return   # records the misfit reason
        d = dealt(k, o2); t = max(title_nums(step) or [0])
        if NUMCAT.match(k) and t and d < t:   # the refitted rung stops below the step's numbers: say so (critic r6 N4)
            addr(k, f"the same idea in another form: {form_label(k, o2)}, to {d} (this step continues past {d})", o2)
        elif NUMCAT.match(k) and t and d >= t:
            addr(k, f"the same idea in another form: {form_label(k, o2)}, at this step's size (to {d})", o2)
        else:   # no number to claim: name the form only
            addr(k, f"the same idea in another form: {form_label(k, o2)}", o2)
    for x in later[:3]:
        for k, o in dentries(x): add_later(x, k, o, 'the next step on this idea')
    if len(rel) < 2:   # a later step on the SAME sub-idea (critic r5 N1: never a family-only step) whose skill is not taught yet
        for x in [x for x in SORD[sidx[step] + 1:] if related_topic(step, x) == 2]:
            if len(rel) >= 2: break
            for k, o in dentries(x):
                if not earlier(k): add_later(x, k, o, 'a later step on this idea')
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
            for x in [c for c in cands if related_topic(step, c) == 2]:   # "on this idea": same sub-idea only (critic r7)
                if not S[x]['d']: why['gap'].append(x); continue
                for k, o in dentries(x):
                    if k in {p['key'] for p in pre}: continue
                    if sig(k, o) in dsigs: why['own'].add(k.split(':')[1])
                    elif k in own:   # an earlier rung of this step's own skill: give the real reason it is left out (critic r10 M8)
                        nl = R_NOLINK if step.startswith('R.') else NOLINK
                        mf = NOLINK_WHY.get(k) if k in nl else misfit(k, o, step)
                        if mf: why['past'].add(k.split(':')[1] + ' ' + json.dumps(o, sort_keys=True) + ': ' + mf)
                        else: why['own'].add(k.split(':')[1])
                    elif not fits(k, o, step) and fit(k, step) is None: why['past'].add(k.split(':')[1] + ': ' + misfit(k, o, step))
            parts = []
            if why['own']: parts.append('the earlier steps on this idea use this step\'s own skill (' + ', '.join(sorted(why['own'])) + ')')
            if why['past']: parts.append('the other earlier skills on this idea do not fit this step (' + '; '.join(sorted(why['past'])) + ')')
            gaps = [x for x in why['gap'] if related_topic(step, x) == 2][:3]
            if gaps:
                own_b = all(set(S[x]['b']) <= set(sp['b']) for x in gaps)
                held = all(set(S[x]['b']) & set(pb) for x in gaps)
                parts.append('the earlier steps ' + ', '.join(gaps) + ' have no live skill yet' + (' (see build)' if own_b else ' (see preBuild)' if held else ''))
            nb = []   # neighbouring-idea skills seen and rejected: name them, so a short list never reads as complete (critic r9)
            for x in [c for c in cands if related_topic(step, c) == 1 and S[c]['d']]:
                for k, o in dentries(x):
                    kk = k.split(':')[1]
                    if k in {p['key'] for p in pre} or k in own or kk in nb: continue
                    nb.append(kk)
            if nb: parts.append('the neighbouring-idea skills of earlier steps (' + ', '.join(nb[:6]) + ') are not judged building blocks of this step (spec.BLOCKS)')
            if not parts:
                live_c = [x for x in cands if S[x]['d'] and related_topic(step, x) == 2][:4]
                pk = {p['key'] for p in pre} | own
                live_c = [x for x in live_c if set(dkeys(x)) & pk]   # only steps whose skill really is above (or is this step's own)
                if live_c: parts.append('every earlier step on this idea (' + ', '.join(live_c) + ') is represented by its skill above')
                elif pre: parts.append('the pre-skills above come from earlier steps on neighbouring ideas, judged as building blocks')
                else: parts.append('no earlier skill on this idea or a neighbouring one fits this step')
            add_note(f"Pre: {len(pre)} only; " + '; '.join(parts) + '.')
    check_claims(step, rel, pre, note)
    if not rel and 'Related:' not in note:
        rr = {k: r for k, r in rej.items() if r}
        if rr:
            add_note('Related: none; the candidate links are ' + '; '.join(f"{k.split(':')[1]} ({r})" for k, r in list(rr.items())[:5]) + '.')
        else:
            add_note('Related: no live skill shows this idea in another form yet (see build).' if v == 'gap' else 'Related: none; no other live skill shows this idea in another form.')
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
    # one tag per key: a direct skill is full; a key that is only partial carries its clauses joined by '; ' (mergecheck.mjs)
    new = {}
    for d in out['partial']:
        if d['key'] not in new: new[d['key']] = d['missing']
        elif d['missing'] not in new[d['key']]: new[d['key']] += '; ' + d['missing']
    new.update({d['key']: None for d in out['direct']})
    for k, t in old.items():
        if k not in new:
            fixes.append({'key': k, 'step': step, 'action': 'remove', 'why': RM.get((step, k)) or ('does not teach this step: ' + (t.get('partial') or 'tagged full but no generated item matches the step'))})
        elif (t.get('partial') is None) != (new[k] is None) or (new[k] is not None and t.get('partial') != new[k]):
            if new[k]: fixes.append({'key': k, 'step': step, 'action': 'partial', 'why': new[k]})   # a changed clause is re-sent too
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
# Critic r11 D20: a full verdict must ask about both ends of its range, not only print the top. Over 96 items
# (maxdealt amin / amax; the top also by the largest number printed, a minuend), the full directs together must reach N - 1 (N = the title's or block's "to / within N"),
# and a counting-sequence step ("1 more", "1 less", "count on / back") must ask down to N / 20 (at least 1).
# A step that misses an end says so in its note ("not dealt").
SEQ_STEP = re.compile(r'^1 (more|less)\b|^count backwards|^count on from', re.I)   # not "add by counting on": a sum's bottom is not a sequence end
def ends_miss(x, doc):
    s = doc['steps'][x]
    if s['verdict'] != 'full': return None
    n = [int(m) for m in re.findall(r'(?:within|to) (\d+)', info[x]['title'])] or [int(m) for m in re.findall(r'within (\d+)', info[x]['blockName'])]
    rows = [md(d['key'], d.get('opts')) for d in s['direct'] if NUMCAT.match(d['key'])]
    hi = [r['amax'] for r in rows if r.get('amax') is not None]; lo = [r['amin'] for r in rows if r.get('amin') is not None]
    if not n or not hi: return None
    N = max(n); miss = []
    top = max(max(hi), max(r['max'] for r in rows))   # a subtraction's top is its minuend, printed, not its answer
    if top < N - 1: miss.append(f'top: reaches {top} of {N}')
    if SEQ_STEP.search(info[x]['title']) and min(lo) > max(1, N // 20): miss.append(f'bottom: asks down to {min(lo)} only')
    return miss or None
os.makedirs(f'{ROOT}/data/curriculum/links', exist_ok=True)
for y in ('R', 'Y1'):
    if LIMIT and LIMIT.startswith('R') and y == 'Y1': continue
    doc = run(y)
    if not doc['steps']: continue
    json.dump(doc, open(f'{ROOT}/data/curriculum/links/{y}.json', 'w'), indent=1, ensure_ascii=False)
    for x, st_ in doc['steps'].items():   # the verdict follows from the tags the lead merges (mergecheck.mjs): full = a direct skill
        assert st_['verdict'] == ('full' if st_['direct'] else 'partial' if st_['partial'] else 'gap'), (x, st_['verdict'])
    for x in doc['steps']:
        m = ends_miss(x, doc)
        assert not m or 'not dealt' in doc['steps'][x]['note'], (x, m)   # a full step that misses an end names it
        if m: print('range ends (named in the note):', x, '; '.join(m))
    c = {v: sum(1 for s in doc['steps'].values() if s['verdict'] == v) for v in ('full', 'partial', 'gap')}
    nr = sum(1 for p in doc['proposals'].values() if p['reused']); nn = len(doc['proposals']) - nr
    print(y, len(doc['steps']), c, 'proposals new', nn, 'reused', nr, 'tagFixes', len(doc['tagFixes']))
# Rule 19: the first-taught school week of each Kindergarten content type (0 = taught in Reception), as the link check used it
CW = CONTENT_WEEKS
json.dump(CW, open(f'{HERE}/content_weeks.json', 'w'), indent=1)
print('content first weeks (K):', CW)
