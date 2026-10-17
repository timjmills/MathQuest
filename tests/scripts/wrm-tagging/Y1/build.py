"""Y1 (Kindergarten) SITE LESSONS build: adds the top-level "lessons" section to data/curriculum/links/Y1.json, reproducibly.
Owner rule 2026-10-16 (every site lesson tagged). Y1's WRM steps passed the R/Y1 lane's critic r12 and are FROZEN: the steps,
the tagFixes and every step proposal stay byte for byte as the R/Y1 lane wrote them.

Order of the two builds (documented, the lead's rule):
  1. tests/scripts/wrm-tagging/gen.py (the R/Y1 lane's generator, with spec.py) writes R.json and Y1.json WITHOUT a lessons section
     (a rerun overwrites it);
  2. THIS build runs LAST: python3 tests/scripts/wrm-tagging/Y1/build.py
It reads Y1.json, strips anything a previous run of this build added (the lessons section, the lesson-only proposals, a base
proposal's `lessons` / `lessonCloses`), checks that what is left is byte for byte the frozen R/Y1 file (FROZEN_SHA256, the file at
the base merge a208906d + origin/claude/sweet-newton-c8wrv1), then adds the lessons from spec_lessons.py through lessons.py and
writes the file back. Running it twice gives the same bytes.

Inputs: spec_lessons.py (the 39 lessons), lessons.py (shape, checks, proposals; the Y6 lane's, adapted), phases.json (Reception
phases of the Support lessons), R.json (the R lane's proposals, reused verbatim), live keys / proposals / SKILL_WRM (keys.mjs) and
the Kindergarten school weeks (prior.mjs), both regenerated into a scratch dir ($WRM_TAG_DATA or a fresh temp dir).
Gates, all must be 0: the frozen gate (before and after writing), the lesson checks of lessons.py, lessonspec.py (the written
file's links are the spec's), lessonfit.mjs (every link judged from generated items), mergecheck.mjs (Y1 alone, then with
R, Y2, Y3, Y4, Y5, Y6 in the repo, one by one, then all at once).
usage: python3 tests/scripts/wrm-tagging/Y1/build.py [--no-fit]      (lessonmut.py also uses --spec <file> --dry and --frozen-check <file>)
"""
import json, os, re, sys, subprocess, hashlib, tempfile, copy
H = os.path.dirname(os.path.abspath(__file__))
R = os.path.abspath(os.path.join(H, '..', '..', '..', '..')) + '/'
OUT = R + 'data/curriculum/links/Y1.json'
# the R/Y1 lane's 47 proposal ids, in its order (pinned with the sha; a proposal outside them was added by the lessons)
BASE_PIDS = ["sort_groups", "match_same", "odd_one_out", "ten_count_out", "words_0_10", "zero", "compare_small", "nl_20", "part_whole", "pictures_to_sentence", "subitise", "family_add_only", "systematic_bonds", "add_10_pictures", "k_story", "sub_10_pictures", "add_sub_1_2", "shapes_world", "shape_3d_tasks", "shape_sort", "pattern_make", "teen_structure", "number_focus", "ones_bonds_teen", "bonds_20", "difference", "tens_name_100", "tens_ones_group", "ruler_cm", "nonstandard_mass", "capacity_early", "nonstandard_capacity", "multiples_from_0", "equal_groups_early", "share_group", "half_or_not", "halves_quarters_only", "half_quarter", "turns", "scenes", "position_map", "ordinal", "unitise_coins", "money_notes", "day_order", "time_talk", "time_units"]
FROZEN_SHA256 = 'da295cff63f3a548cca5a413f2468f0015d31ce92badf657c0598c4f250ab4cf'
DATA = os.environ.get('WRM_TAG_DATA') or tempfile.mkdtemp(prefix='wrm-tag-y1-lessons-')
os.makedirs(DATA, exist_ok=True)
dump = lambda d: json.dumps(d, indent=1, ensure_ascii=False)   # the R/Y1 generator's own format (gen.py)

def strip(d):
    """The file as the R/Y1 lane wrote it: everything this build adds taken out."""
    d = copy.deepcopy(d); d.pop('lessons', None)
    for pid in list(d['proposals']):
        p = d['proposals'][pid]
        if pid not in BASE_PIDS: del d['proposals'][pid]; continue   # a proposal only the lessons use
        p.pop('lessons', None); p.pop('lessonCloses', None)
        if isinstance(p.get('closes'), dict):   # a base proposal with dict closes: drop the lesson entries
            for k in [k for k in p['closes'] if '|-|' in k]: del p['closes'][k]
    return d
def frozen_ok(d, when):
    h = hashlib.sha256(dump(strip(d)).encode()).hexdigest()
    if h != FROZEN_SHA256:
        sys.exit(f'FROZEN ({when}): the Y1 steps / tagFixes / step proposals differ from the R/Y1 lane\'s file (sha {h[:12]} != {FROZEN_SHA256[:12]})')
    return True

A = sys.argv[1:]
if '--frozen-check' in A:   # lessonmut.py: the frozen gate alone, on any file
    frozen_ok(json.load(open(A[A.index('--frozen-check') + 1])), 'check'); print('frozen: OK'); sys.exit(0)
SPEC_FILE = A[A.index('--spec') + 1] if '--spec' in A else os.path.join(H, 'spec_lessons.py')   # lessonmut.py: a mutated spec
DRY = '--dry' in A   # build and check the lessons, write nothing, run no later gate
cur = json.load(open(OUT))
frozen_ok(cur, 'input')
base = strip(cur)
for s_, o_ in (('keys.mjs', 'keys.json'), ('prior.mjs', 'prior.json')):
    r_ = subprocess.run(['node', os.path.join(H, s_), os.path.join(DATA, o_)], capture_output=True, text=True)
    if r_.returncode: sys.exit(r_.stderr)
K = json.load(open(os.path.join(DATA, 'keys.json')))
keys, props = K['keys'], K['props']
prior = json.load(open(os.path.join(DATA, 'prior.json')))
wrm = json.load(open(R + 'data/curriculum/wrm-steps.json'))
titles, order = {}, []
for y in wrm['years']:
    for b in y['blocks']:
        for s in b['steps']:
            titles[s['id']] = s['title']
            if y['id'] == 'Y1': order.append(s['id'])
def wk(sid): return prior.get(sid, {}).get('wk') or ''

errs = []
ns = {'R': R, 'errs': errs, '__name__': 'lessons'}
exec(compile(open(os.path.join(H, 'lessons.py')).read(), 'lessons.py', 'exec'), ns)
ns['setup'](ns)
exec(compile(open(SPEC_FILE).read(), 'spec_lessons.py', 'exec'), ns)
out = copy.deepcopy(base)
lessons, SPEC = ns['finish'](out['steps'], out['proposals'], out['tagFixes'], props, keys, titles, wk, order, errs)
out['lessons'] = lessons
if errs:
    print('\n'.join(errs)); sys.exit(f'build: {len(errs)} errors')
frozen_ok(out, 'output')
txt = dump(out)
if DRY: print('dry: lessons built and checked, nothing written'); sys.exit(0)
open(OUT, 'w').write(txt)
spec_path = os.path.join(DATA, 'spec-lessons.json'); json.dump(SPEC, open(spec_path, 'w'), ensure_ascii=False, indent=1)
fails = 0
def run(cmd, name):
    global fails
    r = subprocess.run(cmd, capture_output=True, text=True, env=dict(os.environ, WRM_TAG_DATA=DATA))
    tail = [l for l in r.stdout.strip().splitlines() if l.strip()]
    print(f'{name}: exit {r.returncode} | {tail[-1] if tail else r.stderr.strip()[-300:]}')
    if r.returncode:
        print(r.stdout[-6000:], r.stderr[-2000:]); fails += 1
run([sys.executable, os.path.join(H, 'lessonspec.py'), OUT, spec_path], 'lessonspec')
L = R + 'data/curriculum/links/'
run(['node', os.path.join(H, 'mergecheck.mjs'), OUT], 'mergecheck Y1')
for y in ('R', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'): run(['node', os.path.join(H, 'mergecheck.mjs'), OUT, L + f'{y}.json'], f'mergecheck Y1+{y}')
# all seven at once: base has one Y2 / Y4 overlap (patterns:count_by_step_up|Y2.B1.S15, both passed lanes, no Y1 part); a problem
# that names Y1, R or a Y1 step / site lesson is a real conflict of this lane
r_ = subprocess.run(['node', os.path.join(H, 'mergecheck.mjs'), OUT] + [L + f'{y}.json' for y in ('R', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6')], capture_output=True, text=True)
mine = [l for l in r_.stdout.splitlines() if l.strip() and not l.startswith('mergecheck') and re.search(r'\bY1\b|\bR\b|Y1\.B|\bR\.B|K\|-\||PK\|-\|', l)]
other = [l for l in r_.stdout.splitlines() if l.strip() and not l.startswith('mergecheck') and l not in mine and not l.startswith('     ')]
print(f'mergecheck Y1+R+Y2..Y6 (all at once): {len(mine)} problems of this lane; {len(other)} between other passed lanes: {other}')
if mine: print('\n'.join(mine)); fails += 1
if '--no-fit' not in sys.argv:
    run(['node', os.path.join(H, 'lessonfit.mjs'), OUT], 'lessonfit')
n = {v: sum(1 for l in lessons.values() if l['verdict'] == v) for v in ('full', 'partial', 'gap')}
used = [pid for pid, p in out['proposals'].items() if p.get('lessons')]
new = sum(1 for p in used if p in ns['LNEW'])
print(f"Y1 lessons: {len(lessons)} ({n['full']} full, {n['partial']} partial, {n['gap']} gap); proposals used by lessons {len(used)} "
      f"({new} new, {len(used) - new} reused); sha256 {hashlib.sha256(txt.encode()).hexdigest()[:16]}")
sys.exit(1 if fails else 0)
