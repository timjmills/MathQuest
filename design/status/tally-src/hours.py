#!/usr/bin/env python3
"""S8 hours and lane-week counts (metrics.md section 3 and the lane-weeks table of section 4).

    python3 design/status/tally-src/hours.py <full clone>  > design/status/tally-src/hours-output.txt

<full clone> is a non-shallow clone with every remote branch:
    git clone --no-single-branch https://github.com/timjmills/MathQuest <full clone>
The working repository is shallow, so the history is read from that clone. Read-only: it runs
`git log` in the clone and prints. Nothing here is random; the same clone HEAD gives the same output.

Hours. For each lane: the commits whose subject matches the lane's regex (author dates, sorted). First =
the first of them; PASS = the first one matching the lane's PASS regex. Elapsed = PASS - first. Active =
elapsed minus every gap of more than 24 h with no commit at all in the repository (the owner's pauses).
Critic commits = the lane commits up to PASS that match its critic regex; the median gap between them
drops gaps over 3 days (pauses). Result lines: the median elapsed over lanes whose span holds no pause,
and the median of the per-lane median gaps over lanes with two or more critic commits.

Lane-weeks. `git log --all --source --no-merges --since=2026-09-23 --until=2026-10-18 --format='%S %aI'`,
branch = the source ref without refs/remotes/origin/ or refs/heads/; main, master, gh-pages and the main
session branch claude/sweet-newton-c8wrv1 are left out. Lower = distinct (branch, day) / 7; upper =
distinct (branch, ISO week).
"""
import re, subprocess, statistics, sys, collections, datetime as dt

if len(sys.argv) != 2:
    sys.exit('usage: hours.py <full clone>')
C = sys.argv[1]
git = lambda *a: subprocess.run(['git', '-C', C, *a], capture_output=True, text=True, check=True).stdout
if git('rev-parse', '--is-shallow-repository').strip() != 'false':
    sys.exit('hours.py: the clone is shallow; clone with --no-single-branch (see the docstring)')
UTC = dt.timezone.utc
LOG = sorted((dt.datetime.fromisoformat(t).astimezone(UTC), s)
             for t, s in (l.split(' ', 1) for l in git('log', '--all', '--format=%aI %s').splitlines()))
ALL_T = [t for t, _ in LOG]
PAUSES = [(a, b) for a, b in zip(ALL_T, ALL_T[1:]) if (b - a).total_seconds() > 24 * 3600]

# name: (lane regex, PASS regex, critic-report regex)
LANES = [
 ('Wave 1 lane A', r'[Ll]ane A\b(?! ?[23])', r'Lane A: critic round \d PASS', r'[Ll]ane A.*(round \d|critic)'),
 ('Wave 1 lane A2', r'\bA2\b', r'Merge Wave 1 Lane A2', r'A2 round \d'),
 ('Wave 1 lane A3', r'\bA3\b', r'A3: critic round \d PASS', r'A3.*critic (r|round )\d'),
 ('Wave 1 lane C', r'^(Wave 1 )?Lane C\b(?!2)', r'Lane C: critic round \d PASS', r'Lane C (round \d|fix round)|Lane C: critic'),
 ('Wave 1 lane C2', r'lane C2|Lane C2|count_by_tables round', r'Lane C2: critic round \d PASS', r'count_by_tables round \d|Lane C2: critic'),
 ('div_facts forms', r'div_facts forms', r'div_facts forms: independent critic round \d \(PASS', r'div_facts forms: independent critic round'),
 ('Chromebook fit', r'^Chromebook fit', r'Chromebook fit: critic round \d report \(PASS', r'Chromebook fit: critic round'),
 ('Search terms', r'[Ss]earch terms lane', r'search terms lane - PASS', r'Critic( r\d)?: search terms lane'),
 ('MAP audit', r'MAP audit', r'MAP audit: critic round \d PASS', r'MAP audit: critic round'),
 ('WRM tagging R + Y1', r'R/Y1', r'R/Y1: critic round \d+ \(PASS', r'R/Y1: critic round'),
 ('WRM tagging Y4', r'Y4 tagging', r'Y4 tagging critic r\d+: PASS', r'Y4 tagging critic (r|round )\d'),
 ('WRM tagging Y2-Y3', r'Y2-Y3', r'Y2-Y3 critic r\d+: PASS', r'Y2-Y3:? critic (r|round )\d'),
 ('WRM tagging Y5', r'Y5 tagging|WRM Y5|Y5 critic', r'Y5.*(r8|round 8).*PASS|critic r8 PASS', r'Y5.*critic (r|round )\d'),
 ('WRM tagging Y6', r'Y6 wave-2|Y6 tag|Y6 re-check', r'Y6 wave-2 tags: critic r5', r'Y6.*critic (r|round )\d'),
 ('WRM Y6 site lessons', r'WRM Y6 site lessons', r'Y6 site lessons: independent critic r\d \(PASS', r'Y6 site lessons: independent critic'),
 ('Lesson planner V21', r'Lesson planner|V21|V22', r'Lesson planner PASSED|critic round 7.*PASS|round 7 \(PASS', r'[Cc]ritic (round|r)\s?\d'),
 ('Detailed lessons 1-5 (one helper)', r'[Dd]etailed lesson|^Lesson (\d|3a)\b|^WIP: lesson', r'All 5 detailed lessons passed', r'^Lesson (\d|3a) critic r\d'),
 ('Answer-key options 4.4', r'[Aa]nswer-key options|Wave 4\.4', r'answer-key options \(4\.4\) PASS', r'^Critic( r\d)?: answer-key options'),
 ('Touch numerals', r'[Tt]ouch numerals|touch-numerals', r'touch-numerals r\d: PASS', r'Critic touch-numerals'),
 ('Small fixes', r'^Small fixes', r'Small fixes: critic round \d report \(PASS', r'Small fixes: critic round \d report'),
 ('Number line 5.2', r'Wave 5\.2|Number line 5\.2|^Number line (R\d|critic)', r'Number line critic r\d: PASS', r'Number line( 5\.2)?:? critic (round|r)\s?\d'),
]
hm = lambda t: t.strftime('%m-%d %H:%M')
def active(a, b):
    lost = sum(max(0, (min(y, b) - max(x, a)).total_seconds()) for x, y in PAUSES)
    return (b - a).total_seconds() / 3600, lost / 3600

print(f'clone HEAD {git("rev-parse", "HEAD").strip()}; commits {len(LOG)}; times UTC (author dates)')
print('\n## Hours per lane')
print('| Lane | First commit -> PASS commit (UTC) | Elapsed h | Active h (pauses > 24 h removed) | Critic-round commits to PASS | Median gap between them (h) |')
print('|---|---|--:|--:|--:|--:|')
nopause, gapmeds = [], []
for name, lr, pr, cr in LANES:
    m = [(t, s) for t, s in LOG if re.search(lr, s)]
    p = [t for t, s in m if re.search(pr, s)]
    if not m or not p:
        print(f'| {name} | no PASS commit matched | | | | |'); continue
    first, pt = m[0][0], p[0]
    crit = [t for t, s in m if t <= pt and re.search(cr, s)]
    gaps = [(b - a).total_seconds() / 3600 for a, b in zip(crit, crit[1:]) if (b - a).total_seconds() < 3 * 86400]
    el, lost = active(first, pt)
    if lost == 0: nopause.append(el)
    g = statistics.median(gaps) if gaps else None
    if g is not None: gapmeds.append(g)
    print(f'| {name} | {hm(first)} -> {hm(pt)} | {el:.1f} | {"same" if lost == 0 else f"{el - lost:.1f}"} | {len(crit)} | {"-" if g is None else f"{g:.1f}"} |')
print(f'\nlanes with no pause in the span: {len(nopause)}; elapsed median {statistics.median(nopause):.1f} h, range {min(nopause):.1f}-{max(nopause):.1f} h')
print(f'lanes with 2+ critic commits: {len(gapmeds)}; median of their median gaps {statistics.median(gapmeds):.1f} h, range {min(gapmeds):.1f}-{max(gapmeds):.1f} h')
print('owner pauses (gaps > 24 h with no commit, 2026-09-23 on): ' + '; '.join(
    f'{hm(a)} -> {hm(b)} ({(b - a).total_seconds() / 3600:.0f} h)' for a, b in PAUSES if a >= dt.datetime(2026, 9, 23, tzinfo=UTC)))

print('\n## Lane-weeks (2026-09-23 .. 2026-10-18)')
SKIP = {'main', 'master', 'gh-pages', 'claude/sweet-newton-c8wrv1'}
bd, bw = set(), set()
for line in git('log', '--all', '--source', '--no-merges', '--since=2026-09-23', '--until=2026-10-18', '--format=%S %aI').splitlines():
    ref, t = line.split()
    b = ref.replace('refs/remotes/origin/', '').replace('refs/heads/', '')
    if b in SKIP: continue
    d = dt.datetime.fromisoformat(t)
    bd.add((b, d.date())); bw.add((b, d.isocalendar()[1]))
wk = collections.Counter(w for _, w in bw)
print(f'lower: distinct (branch, day) {len(bd)} / 7 = {len(bd) / 7:.1f}')
print(f'upper: distinct (branch, ISO week) {len(bw)} (' + ', '.join(f'week {w}: {n}' for w, n in sorted(wk.items())) + ')')
days = sorted({t.date() for t in ALL_T if dt.date(2026, 9, 23) <= t.date() <= dt.date(2026, 10, 17)})
print(f'commit days 2026-09-23 .. 10-17 (UTC): {len(days)}; first {days[0]}, last {days[-1]}')
