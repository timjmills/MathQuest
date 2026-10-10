#!/usr/bin/env python3
"""ws-wrm-sequence.py -- build the White Rose small-step page sequence (GENERATED data).

Primary source: the school's own domain sequence workbook
  data/curriculum/source/Awsaj-Domain-Sequence-K-5-2026-27.xlsx
(one sheet per grade: Week | Qtr | Week of | Days | Unit | Domain | Lesson | CCSS | Power | Type | From | S | P | I |
 support-blocks list on the first lesson of each week).
Cross-check (optional): the curriculum-site preview (`--preview <index.html | data.json>`), whose CURRICULUM.grades
gives each lesson its White Rose block (unit) name. PK has no workbook sheet: PK comes from the preview when given.

Every lesson is mapped to our WRM step id (data/curriculum/wrm-steps.json; R = PK, Y1 = K ... Y6 = Grade 5). Nothing is
guessed silently: every lesson that cannot be mapped, every WRM step the sequence leaves out and every workbook / preview
disagreement goes into the report.

Writes:
  data/curriculum/wrm-sequence.json        the full GENERATED sequence
  js/modules/wrm-sequence-db.js            the compact browser copy (never hand-edit)
  design/audit/runs/wrm-page/MAPPING_REPORT.md
Usage: python3 tests/scripts/ws-wrm-sequence.py [--preview <file>] [--check]
  --check  exit 1 when the generated files differ from what is on disk (no write).
"""
import base64, gzip, json, os, re, sys

import openpyxl

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
XLSX = os.path.join(ROOT, 'data', 'curriculum', 'source', 'Awsaj-Domain-Sequence-K-5-2026-27.xlsx')
STEPS = os.path.join(ROOT, 'data', 'curriculum', 'wrm-steps.json')
OUT_JSON = os.path.join(ROOT, 'data', 'curriculum', 'wrm-sequence.json')
OUT_JS = os.path.join(ROOT, 'js', 'modules', 'wrm-sequence-db.js')
OUT_REPORT = os.path.join(ROOT, 'design', 'audit', 'runs', 'wrm-page', 'MAPPING_REPORT.md')

GRADES = [  # id, sheet, WRM year, label
    ('PK', None, 'R', 'Pre-K'),
    ('K', 'Kindergarten', 'Y1', 'Kindergarten'),
    ('1', 'Grade 1', 'Y2', 'Grade 1'),
    ('2', 'Grade 2', 'Y3', 'Grade 2'),
    ('3', 'Grade 3', 'Y4', 'Grade 3'),
    ('4', 'Grade 4', 'Y5', 'Grade 4'),
    ('5', 'Grade 5', 'Y6', 'Grade 5'),
]
YEAR_OF_GRADE = {g: y for g, _, y, _ in GRADES}
PREVIEW_GRADE = {'PK': 'PK', 'K': 'K', '1': 'G1', '2': 'G2', '3': 'G3', '4': 'G4', '5': 'G5'}
DOMAIN_CODE = {
    'Counting & Cardinality': 'CC', 'Operations & Algebraic Thinking': 'OA',
    'Number & Operations in Base Ten': 'NBT', 'Number & Operations: Fractions': 'NF',
    'Measurement & Data': 'MD', 'Geometry': 'G', 'Enrichment lessons': 'E',
}
TYPE_CODE = {'White Rose': 'wr', 'COPIED IN': 'copied', 'CCSS BUILD (to be made)': 'build', 'Enrichment (after MAP)': 'enrich'}
PRIOR_PREFIX = {'Rec/PK4': 'R', 'Y1/KG': 'Y1', 'Y2/Gr.1': 'Y2', 'Y3/Gr.2': 'Y3', 'Y4/Gr.3': 'Y4', 'Y5/Gr.4': 'Y5', 'Y6/Gr.5': 'Y6'}
FROM_YEAR = {'PK': 'R', 'K': 'Y1', 'G1': 'Y2', 'G2': 'Y3', 'G3': 'Y4', 'G4': 'Y5', 'G5': 'Y6'}
YEARS = ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6']


def norm(t):
    t = str(t or '').lower().replace('–', '-').replace('—', '-').replace('’', "'")
    t = re.sub(r'[^a-z0-9]+', ' ', t)
    t = re.sub(r'\b(\d) d\b', r'\1d', t)          # 3-D / 3D
    t = re.sub(r'\b([ap]) m\b', r'\1m', t)          # a.m. / am
    return re.sub(r'\s+', ' ', t).strip()


def loose(t):
    t = re.sub(r'\([^)]*\)', ' ', str(t or ''))
    t = norm(t).replace('recognize', 'recognise').replace('color', 'colour')
    return t


def load_steps():
    d = json.load(open(STEPS))
    steps, blocks = {}, {}
    by_title = {}  # (year, norm) -> [ids]
    for y in d['years']:
        for b in y['blocks']:
            blocks[b['id']] = b
            for s in b['steps']:
                steps[s['id']] = dict(s, year=y['id'], block=b['id'], blockName=b['name'])
                for key in {norm(s['title']), loose(s['title'])}:
                    by_title.setdefault((y['id'], key), []).append(s['id'])
    return steps, blocks, by_title


def load_preview(path):
    if not path:
        return None
    raw = open(path, encoding='utf-8').read()
    if path.endswith('.json'):
        return json.loads(raw)
    m = re.search(r'<script[^>]*id="__data"[^>]*>(.*?)</script>', raw, re.S)
    return json.loads(gzip.decompress(base64.b64decode(m.group(1).strip())).decode('utf-8'))


def step_order(sid):
    y, b, s = sid.split('.')
    return (YEARS.index(y), int(b[1:]), int(s[1:]))


class Mapper:
    def __init__(self, steps, blocks, by_title, preview):
        self.steps, self.blocks, self.by_title, self.preview = steps, blocks, by_title, preview
        self.prev_units = {}  # (grade, norm title) -> [unit names]
        if preview:
            for g, pg in PREVIEW_GRADE.items():
                grade = preview['CURRICULUM']['grades'].get(pg)
                if not grade:
                    continue
                for dom in grade['domains']:
                    for u in dom.get('coreUnits', []):
                        for s in u['steps']:
                            self.prev_units.setdefault((g, norm(s['title'])), []).append(u['name'])

    def candidates(self, year, title):
        return self.by_title.get((year, norm(title))) or self.by_title.get((year, loose(title))) or []

    def pick(self, cands, grade, title, ccss, near):
        """Choose among same-title steps of one year: preview unit name, then CCSS overlap, then nearest."""
        cands = sorted(set(cands), key=step_order)
        if len(cands) == 1:
            return cands[0], ''
        units = set(self.prev_units.get((grade, norm(title)), []))
        by_unit = [c for c in cands if self.steps[c]['blockName'] in units]
        if len(by_unit) == 1:
            return by_unit[0], 'preview unit'
        pool = by_unit or cands
        cc = set(ccss)
        by_cc = [c for c in pool if cc & set(self.steps[c].get('ccss') or [])]
        if len(by_cc) == 1:
            return by_cc[0], 'CCSS'
        pool = by_cc or pool
        if near:
            pool = sorted(pool, key=lambda c: abs(step_order(c)[1] - step_order(near)[1]) * 100 + abs(step_order(c)[2] - step_order(near)[2]))
        return pool[0], 'nearest of %d' % len(cands)

    def lesson(self, grade, title, ccss, typ, frm, near):
        """Map one workbook lesson. Returns (step id or None, how)."""
        home = YEAR_OF_GRADE[grade]
        if typ == 'build':
            return None, 'CCSS BUILD (no White Rose lesson)'
        order = []
        if typ == 'copied' and frm in FROM_YEAR:
            order.append(FROM_YEAR[frm])
        order.append(home)
        # enrichment and stray titles: other years nearest first
        for d in (-1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6):
            i = YEARS.index(home) + d
            if 0 <= i < len(YEARS):
                order.append(YEARS[i])
        for y in order:
            c = self.candidates(y, title)
            if c:
                sid, how = self.pick(c, grade, title, ccss, near if near and near.startswith(y + '.') else None)
                where = '' if y == home else ' (from %s)' % y
                return sid, ('title' + (', ' + how if how else '') + where)
        return None, 'no WRM step with this title'

    def prior(self, text):
        """'Y1/KG Count in 10s' -> (year, title, step id or None)."""
        text = text.strip()
        for p, y in PRIOR_PREFIX.items():
            if text.startswith(p + ' '):
                title = text[len(p) + 1:].strip()
                c = self.candidates(y, title)
                sid = self.pick(c, None, title, [], None)[0] if c else None
                return y, title, sid
        return None, text, None


def split_ccss(v):
    return [c.strip() for c in str(v or '').split(',') if c.strip()]


def build(preview_path):
    steps, blocks, by_title = load_steps()
    preview = load_preview(preview_path)
    mp = Mapper(steps, blocks, by_title, preview)
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    summary = {}
    for r in wb['Summary'].iter_rows(min_row=2, values_only=True):
        if r[0] and r[1]:
            summary[(r[0], r[1])] = r
    report = {'unmapped': [], 'ambiguous': [], 'priorUnmapped': [], 'disagree': [], 'missing': {}}
    grades = []
    used = set()
    for gid, sheet, year, label in GRADES:
        g = {'id': gid, 'label': label, 'year': year, 'source': 'workbook' if sheet else 'preview', 'units': [], 'weeks': {}}
        if sheet:
            ws = wb[sheet]
            units = {}
            near = None
            cur_week = None
            for row in ws.iter_rows(min_row=2, values_only=True):
                week, qtr, weekof, days, unit, domain, title, ccss, power, typ, frm, s, p, i = row[:14]
                support = row[14] if len(row) > 14 else None
                if not week:
                    continue
                if week != cur_week:
                    cur_week = week
                    g['weeks'].setdefault(week, {'qtr': qtr, 'weekOf': weekof, 'days': days, 'prior': []})
                if support:
                    pr = []
                    for part in str(support).split(';'):
                        if not part.strip():
                            continue
                        y, t, sid = mp.prior(part)
                        if not y:   # the exam row's 15th column names the domain test, not a lesson
                            g['weeks'][week]['test'] = part.strip()
                            continue
                        pr.append({'year': y, 'title': t, 'step': sid})
                        if not sid:
                            report['priorUnmapped'].append((label, week, part.strip()))
                    g['weeks'][week]['prior'] = pr
                tc = TYPE_CODE.get(typ)
                if not tc or not unit:
                    if typ == 'EXAM':
                        g['weeks'][week]['exam'] = domain
                    if typ == 'MAP':
                        g['weeks'][week]['map'] = True
                    continue
                if unit not in units:
                    sm = summary.get((sheet, unit))
                    u = {'id': unit, 'domain': DOMAIN_CODE.get(domain, domain), 'name': domain,
                         'weeks': sm[3] if sm else '', 'power': split_ccss(sm[9]) if sm else [],
                         'test': (sm[10] if sm else '') or '', 'lessons': []}
                    units[unit] = u
                    g['units'].append(u)
                u = units[unit]
                strands = ''.join(k for k, v in zip('SPI', (s, p, i)) if v)
                key = norm(title)
                hit = next((l for l in u['lessons'] if norm(l['title']) == key), None)
                if hit:
                    if week not in hit['weeks']:
                        hit['weeks'].append(week)
                    hit['strands'] = ''.join(k for k in 'SPI' if k in hit['strands'] or k in strands)
                    continue
                cc = split_ccss(ccss)
                sid, how = mp.lesson(gid, title, cc, tc, frm, near)
                if sid:
                    near = sid
                    used.add(sid)
                    if 'nearest' in how:
                        report['ambiguous'].append((label, unit, title, sid, how))
                elif tc != 'build':
                    report['unmapped'].append((label, unit, week, title, tc, how))
                les = {'n': len(u['lessons']) + 1, 'title': title, 'step': sid, 'ccss': cc, 'power': power == 'POWER',
                       'type': tc, 'weeks': [week], 'strands': strands}
                if frm:
                    les['from'] = frm
                u['lessons'].append(les)
            # cross-check with the preview's core steps
            if preview:
                pg = preview['CURRICULUM']['grades'].get(PREVIEW_GRADE[gid])
                ours = {norm(l['title']) for u in g['units'] if u['id'] != 'E' for l in u['lessons']}
                theirs = {}
                for dom in (pg or {}).get('domains', []):
                    for un in dom.get('coreUnits', []):
                        for st in un['steps']:
                            theirs[norm(st['title'])] = (dom['code'], un['name'], st['title'])
                every = {norm(l['title']) for u in g['units'] for l in u['lessons']}
                for k, v in theirs.items():
                    if k not in every:
                        report['disagree'].append((label, 'in preview, not in workbook', '%s / %s: %s' % v))
                for k in ours - set(theirs):
                    t = next(l['title'] for u in g['units'] if u['id'] != 'E' for l in u['lessons'] if norm(l['title']) == k)
                    report['disagree'].append((label, 'in workbook, not in preview', t))
        elif preview and preview['CURRICULUM']['grades'].get('PK'):
            pg = preview['CURRICULUM']['grades']['PK']
            for di, dom in enumerate(pg['domains']):
                for un in dom.get('coreUnits', []):
                    u = {'id': '%s%d' % (dom['code'], un['num']), 'domain': dom['code'], 'name': '%s: %s' % (dom['name'], un['name']),
                         'weeks': '', 'power': [], 'test': '', 'lessons': []}
                    for st in un['steps']:
                        c = [x for x in mp.candidates('R', st['title']) if steps[x]['blockName'] == un['name']] or mp.candidates('R', st['title'])
                        sid = sorted(c, key=step_order)[0] if c else None
                        if sid:
                            used.add(sid)
                        else:
                            report['unmapped'].append((label, u['id'], '', st['title'], 'wr', 'no Reception step with this title'))
                        u['lessons'].append({'n': len(u['lessons']) + 1, 'title': st['title'], 'step': sid, 'ccss': st.get('ccss') or [],
                                             'power': False, 'type': 'wr', 'weeks': [], 'strands': ''})
                    g['units'].append(u)
        else:
            g['note'] = 'No workbook sheet for Pre-K and no preview given: Pre-K omitted.'
        grades.append(g)
    # WRM steps the sequence leaves out (prior-learning lists count as "used" only for the report's second column)
    prior_used = {p['step'] for g in grades for w in g['weeks'].values() for p in w['prior'] if p['step']}
    for sid in sorted(steps, key=step_order):
        if sid not in used:
            report['missing'].setdefault(steps[sid]['year'], []).append((sid, steps[sid]['title'], sid in prior_used))
    return {'meta': {
        'title': 'Awsaj White Rose small-step sequence, K to Grade 5 by CCSS domain, 2026-27',
        'generatedBy': 'python3 tests/scripts/ws-wrm-sequence.py' + (' --preview <preview>' if preview else ''),
        'source': 'data/curriculum/source/Awsaj-Domain-Sequence-K-5-2026-27.xlsx (primary: order, weeks, strands, power, prior learning); '
                  'curriculum-site preview (Pre-K and the cross-check)',
        'fields': {'step': 'our WRM step id (null: CCSS BUILD lesson or unmapped)', 'type': 'wr | copied | build | enrich',
                   'strands': 'S = Standard, P = Priority, I = Intervention', 'weeks': 'weeks the lesson is taught',
                   'prior': "the week's support-block lessons (prior learning), mapped to WRM steps"},
    }, 'grades': grades}, report


def write_report(seq, rep):
    lessons = [l for g in seq['grades'] for u in g['units'] for l in u['lessons']]
    mapped = sum(1 for l in lessons if l['step'])
    builds = sum(1 for l in lessons if l['type'] == 'build')
    prior = [p for g in seq['grades'] for w in g['weeks'].values() for p in w['prior']]
    L = ['# WRM page: sequence mapping report (GENERATED by tests/scripts/ws-wrm-sequence.py)', '',
         '| | count |', '|---|---|',
         '| Lessons in the sequence (unique per unit) | %d |' % len(lessons),
         '| Mapped to a WRM step | %d |' % mapped,
         '| CCSS BUILD lessons (no White Rose lesson exists; expected) | %d |' % builds,
         '| Unmapped (not CCSS BUILD) | %d |' % len(rep['unmapped']),
         '| Same-title steps settled by nearest block (check) | %d |' % len(rep['ambiguous']),
         '| Prior-learning entries | %d (unmapped %d) |' % (len(prior), len(rep['priorUnmapped'])),
         '| WRM steps the sequence leaves out | %d |' % sum(len(v) for v in rep['missing'].values()),
         '| Workbook / preview disagreements (core units; enrichment not compared) | %d |' % len(rep['disagree']), '']
    L += ['## Unmapped lessons', '']
    L += ['- %s %s %s: "%s" (%s) — %s' % r for r in rep['unmapped']] or ['None.']
    L += ['', '## Same-title steps settled by nearest block', '']
    L += ['- %s %s: "%s" -> %s (%s)' % r for r in rep['ambiguous']] or ['None.']
    L += ['', '## Prior-learning entries that match no WRM step', '']
    L += ['- %s %s: %s' % r for r in rep['priorUnmapped']] or ['None.']
    L += ['', '## WRM steps the sequence leaves out', '', '"prior" = still listed as prior learning in some week.', '']
    for y in YEARS:
        v = rep['missing'].get(y, [])
        L.append('### %s (%d)' % (y, len(v)))
        L.append('')
        L += ['- %s %s%s' % (sid, t, ' (prior)' if p else '') for sid, t, p in v] or ['None.']
        L.append('')
    L += ['## Workbook / preview disagreements', '']
    L += ['- %s, %s: %s' % r for r in rep['disagree']] or ['None (or no preview given).']
    return '\n'.join(L) + '\n'


def compact_js(seq):
    grades = []
    for g in seq['grades']:
        weeks = {k: [p['step'] for p in w['prior'] if p['step']] for k, w in g['weeks'].items()}
        info = {k: {kk: w[kk] for kk in ('weekOf', 'exam', 'map') if w.get(kk)} for k, w in g['weeks'].items()}
        grades.append({'id': g['id'], 'label': g['label'], 'year': g['year'], 'units': [
            {'id': u['id'], 'domain': u['domain'], 'name': u['name'], 'weeks': u['weeks'], 'power': u['power'],
             'lessons': [[l['title'], l['step'], l['ccss'], 1 if l['power'] else 0, l['type'], l['weeks'], l['strands'], l.get('from', '')]
                         for l in u['lessons']]} for u in g['units']], 'prior': weeks, 'weekInfo': info})
    body = ',\n'.join('    ' + json.dumps(g, ensure_ascii=False, separators=(',', ':')) for g in grades)
    return ('// wrm-sequence-db.js — GENERATED by `python3 tests/scripts/ws-wrm-sequence.py` from the school\'s\n'
            '// domain-sequence workbook (data/curriculum/source/) and the curriculum-site preview. Never hand-edit.\n'
            '// Lesson tuple: [title, wrmStepId|null, ccss[], power(0/1), type (wr|copied|build|enrich), weeks[], strands, fromGrade].\n'
            '// prior: week -> WRM step ids of that week\'s prior-learning (support block) lessons, in the workbook\'s order.\n\n'
            'export const WRM_SEQUENCE = [\n' + body + ',\n];\n')


def main():
    args = sys.argv[1:]
    preview = args[args.index('--preview') + 1] if '--preview' in args else None
    seq, rep = build(preview)
    outs = {OUT_JSON: json.dumps(seq, ensure_ascii=False, indent=1) + '\n', OUT_JS: compact_js(seq), OUT_REPORT: write_report(seq, rep)}
    if '--check' in args:
        bad = [p for p, t in outs.items() if p != OUT_REPORT and (not os.path.exists(p) or open(p, encoding='utf-8').read() != t)]
        print('ws-wrm-sequence: %s' % ('OK' if not bad else 'STALE ' + ', '.join(os.path.relpath(b, ROOT) for b in bad)))
        sys.exit(1 if bad else 0)
    os.makedirs(os.path.dirname(OUT_REPORT), exist_ok=True)
    for p, t in outs.items():
        open(p, 'w', encoding='utf-8').write(t)
    print(write_report(seq, rep).split('## Unmapped')[0])


if __name__ == '__main__':
    main()
