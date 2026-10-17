"""Y4 (school Grade 3) SITE LESSONS build: adds the top-level "lessons" section to data/curriculum/links/Y4.json, reproducibly.
Owner rule 2026-10-16 (every site lesson tagged). Y4's WRM steps passed the Y4 lane's critic r13 and are FROZEN: the steps, the
tagFixes and every step proposal stay byte for byte as the Y4 lane wrote them.

Order of the builds (documented; Y4/build.py writes Y4.json WITHOUT a lessons section, so this build must run after it):
  0. node tests/scripts/wrm-tagging/Y4/keys.mjs  $DATA/keys.json      (live keys, proposals, SKILL_WRM)
     node tests/scripts/wrm-tagging/Y4/prior.mjs $DATA/prior.json     (the Grade 3 school weeks)
  1. WRM_TAG_DATA=$DATA python3 tests/scripts/wrm-tagging/Y4/build.py (the Y4 lane's step build; a rerun overwrites any lessons)
  2. THIS build runs LAST: WRM_TAG_DATA=$DATA python3 tests/scripts/wrm-tagging/Y4/lessons_build.py
It reads Y4.json, strips anything a previous run of this build added (the lessons section, the lesson-only proposals, a base
proposal's `lessons` and the lesson entries of its `closes`), checks that what is left is byte for byte the frozen Y4 file
(FROZEN_SHA256: the file at a208906d merged with origin/claude/sweet-newton-c8wrv1 at ad3e534c, which Y4/build.py reproduces), then
adds the lessons from lessons_spec.py through lessons.py and writes the file back. Running it twice gives the same bytes.

Inputs: lessons_spec.py (the 23 lessons), lessons.py (shape, checks, proposals), phases.json (Reception phases of the GPK Support
lessons), the passed lanes' links files (proposals reused verbatim), keys.json / prior.json from step 0 ($WRM_TAG_DATA; generated
into a fresh temp dir when it is not set).
Gates, all must be 0: the frozen gate (input and output), the lesson checks of lessons.py, lessonspec.py (the written file's links
are the spec's), lessoncheck.py (the lesson rules re-run on the WRITTEN file and every lesson field / every field of a proposal a
lesson uses equal to the snapshot finish() returned; full_audit.json holds the hand-audit row of every FULL lesson), lessonmerge.mjs
(Y4 alone, then with R, Y1, Y2, Y3, Y5, Y6 one by one, then all at once), lessonfit.mjs (every link judged from generated items).
usage: python3 tests/scripts/wrm-tagging/Y4/lessons_build.py [--no-fit]     (lessonmut.py also uses --spec <file> --dry and --frozen-check <file>)
"""
import json, os, re, sys, subprocess, hashlib, tempfile, copy
H = os.path.dirname(os.path.abspath(__file__))
R = os.path.abspath(os.path.join(H, '..', '..', '..', '..')) + '/'
OUT = R + 'data/curriculum/links/Y4.json'
# the Y4 lane's 74 proposal ids, in its order (pinned with the sha; a proposal outside them was added by the lessons)
BASE_PIDS = ["nl_20", "regroup_thousands", "count_50s", "flex_partition", "more_less_all", "roman_numerals", "add_sub_place_units", "exchange_count_add", "exchange_count_sub", "mental_add_sub", "vis_strategy_pictures", "estimate_within_10k", "inverse_check", "area_compare", "area_half_squares", "tables_links", "div_by_itself", "mult_three", "factor_pair_strategy", "scaled_fact_family", "informal_mult", "vis_array_options", "div_exchange", "correspondence", "how_many_ways", "km_m", "metres", "composite_whole_sides", "missing_lengths", "regular_polygon", "polygons", "whole_nn_only", "frac_count", "frac_beyond_1", "frac_whole_partition", "mixed_nl_read", "frac_compare_gt1", "improper_mixed_dir", "frac_nl_equiv", "frac_add_multi", "frac_answer_as_is", "sub_break_whole", "tenths_only", "dec_fraction_basics", "f_to_d_one_item", "decimal_pv", "vis_pv_decimal_places", "dec_nl_past_1", "div10_small_numbers", "vis_hundred_square", "decimal_whole", "dec_same_whole", "dec_compare_model", "round_whole", "vis_round_line_decimals", "money_convert", "money_compare_written", "money_estimate", "money_2step", "time_calendar", "day_order", "time_units", "time_24h_convert", "turns_angles", "turns", "shape_draw", "symmetry_complete", "two_way", "line_graph", "coord_forms_fix", "position_map", "coord_polygon_draw", "translate_grid", "movement"]
FROZEN_SHA256 = 'd4d03a361e6b084fc56aacbcd9099da024715d4a6dc5d57c631779f52b27d65b'
DATA = os.environ.get('WRM_TAG_DATA') or tempfile.mkdtemp(prefix='wrm-tag-y4-lessons-')
os.makedirs(DATA, exist_ok=True)
dump = lambda d: json.dumps(d, indent=1, ensure_ascii=False)   # Y4/build.py's own format (json.dump, indent 1, no trailing newline)

def strip(d):
    """The file as the Y4 lane wrote it: everything this build adds taken out."""
    d = copy.deepcopy(d); d.pop('lessons', None)
    for pid in list(d['proposals']):
        p = d['proposals'][pid]
        if pid not in BASE_PIDS: del d['proposals'][pid]; continue   # a proposal only the lessons use
        p.pop('lessons', None)
        if isinstance(p.get('closes'), dict):
            for k in [k for k in p['closes'] if '|-|' in k]: del p['closes'][k]
            if not p['closes']: del p['closes']   # no Y4 base proposal has a `closes`: a lessons-only one goes entirely
    return d
def frozen_ok(d, when):
    h = hashlib.sha256(dump(strip(d)).encode()).hexdigest()
    if h != FROZEN_SHA256:
        sys.exit(f'FROZEN ({when}): the Y4 steps / tagFixes / step proposals differ from the Y4 lane\'s file (sha {h[:12]} != {FROZEN_SHA256[:12]})')
    return True

A = sys.argv[1:]
if '--frozen-check' in A:
    frozen_ok(json.load(open(A[A.index('--frozen-check') + 1])), 'check'); print('frozen: OK'); sys.exit(0)
SPEC_FILE = A[A.index('--spec') + 1] if '--spec' in A else os.path.join(H, 'lessons_spec.py')
DRY = '--dry' in A
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
            if y['id'] == 'Y4': order.append(s['id'])
def wk(sid): return (prior.get(sid) or {}).get('wk') or ''

errs = []
ns = {'R': R, 'errs': errs, '__name__': 'lessons'}
exec(compile(open(os.path.join(H, 'lessons.py')).read(), 'lessons.py', 'exec'), ns)
ns['setup'](ns)
exec(compile(open(SPEC_FILE).read(), 'lessons_spec.py', 'exec'), ns)
out = copy.deepcopy(base)
lessons, SPEC = ns['finish'](out['steps'], out['proposals'], out['tagFixes'], props, keys, titles, wk, order, errs)
# the snapshot of every lesson field and of every field of every proposal a lesson uses, taken from finish()'s own result before
# anything is assigned into the output; lessoncheck.py compares the WRITTEN file with it (Y1 lessons critic r1 G1, r2 G7)
def _plf(p): return {'lessons': copy.deepcopy(p.get('lessons')),
                     'closes': {k: v for k, v in p['closes'].items() if '|-|' in k} if isinstance(p.get('closes'), dict) else None}
SNAP = {'lessons': copy.deepcopy(lessons), 'newIds': sorted(ns['LNEW']),
        'proposals': {pid: _plf(p) for pid, p in out['proposals'].items() if p.get('lessons') or (isinstance(p.get('closes'), dict) and any('|-|' in k for k in p['closes']))},
        'proposalsFull': {pid: copy.deepcopy(p) for pid, p in out['proposals'].items() if p.get('lessons')}}
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
snap_path = os.path.join(DATA, 'lesson-snapshot.json'); json.dump(SNAP, open(snap_path, 'w'), ensure_ascii=False, indent=1)
run([sys.executable, os.path.join(H, 'lessoncheck.py'), OUT, snap_path, os.path.join(DATA, 'keys.json')], 'lessoncheck')
L = R + 'data/curriculum/links/'
run(['node', os.path.join(H, 'lessonmerge.mjs'), OUT], 'lessonmerge Y4')
for y in ('R', 'Y1', 'Y2', 'Y3', 'Y5', 'Y6'): run(['node', os.path.join(H, 'lessonmerge.mjs'), OUT, L + f'{y}.json'], f'lessonmerge Y4+{y}')
# all seven at once: base has one Y2 / Y4 overlap (patterns:count_by_step_up|Y2.B1.S15, written by both passed step lanes, frozen
# here); a problem naming a Y4 site lesson or a lesson proposal is a real conflict of this lane
r_ = subprocess.run(['node', os.path.join(H, 'lessonmerge.mjs'), OUT] + [L + f'{y}.json' for y in ('R', 'Y1', 'Y2', 'Y3', 'Y5', 'Y6')], capture_output=True, text=True)
probs = [l for l in r_.stdout.splitlines() if l.strip() and not l.startswith('lessonmerge') and not l.startswith('     ')]
known = [l for l in probs if 'patterns:count_by_step_up|Y2.B1.S15' in l]
mine = [l for l in probs if l not in known]
print(f'lessonmerge Y4+R+Y1+Y2+Y3+Y5+Y6 (all at once): {len(mine)} real problems; {len(known)} known frozen step-lane overlap lines {known}')
if mine: print('\n'.join(mine)); fails += 1
if '--no-fit' not in sys.argv:
    run(['node', os.path.join(H, 'lessonfit.mjs'), OUT], 'lessonfit')
n = {v: sum(1 for l in lessons.values() if l['verdict'] == v) for v in ('full', 'partial', 'gap')}
used = [pid for pid, p in out['proposals'].items() if p.get('lessons')]
new = sum(1 for p in used if p in ns['LNEW'])
print(f"Y4 lessons: {len(lessons)} ({n['full']} full, {n['partial']} partial, {n['gap']} gap); proposals used by lessons {len(used)} "
      f"({new} new, {len(used) - new} reused); sha256 {hashlib.sha256(txt.encode()).hexdigest()[:16]}")
sys.exit(1 if fails else 0)
