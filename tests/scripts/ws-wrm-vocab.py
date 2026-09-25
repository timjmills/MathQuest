#!/usr/bin/env python3
"""
ws-wrm-vocab — build data/curriculum/wrm-vocab.json: the key vocabulary of every White Rose Maths
small step, read from the owner's per-step Teaching Guide (Guide D) PDFs on Google Drive.

  python3 tests/scripts/ws-wrm-vocab.py --cache <dir>            # download, extract, write
  python3 tests/scripts/ws-wrm-vocab.py --cache <dir> --check    # rebuild in memory, diff only

Needs curl and PyMuPDF (`pip install pymupdf`); neither is an app dependency. The guides are
shared "anyone with the link", so each one downloads from
https://drive.google.com/uc?export=download&id=<drive.guide id in wrm-steps.json>. The PDF is
turned into plain text in <dir>/<id>.txt and deleted; a second run reads the cached text.

Every guide has the same Guide D layout. The extractor reads three fixed places:

  words, glossary   Section 8 "ELL / Tier 2 Access Moves" -> "Language Access": the bullet
                    "Pre-teach 3 words only: match = goes with the one that is the same; same =
                    alike; ..." (also "Pre-teach 4 words:", "Pre-teach 3 phrases:", ...). Each
                    term is a word; "a = b" and "a (b)" give glossary meanings. Terms joined by
                    "/" or "·" ("big / small", "ones · tens") are split into separate words and
                    lose the shared meaning.
  stems             the next bullet, "Use the lesson stem: “...”" (every quoted frame), plus a
                    stem written inside the Pre-teach bullet itself.
  representations   Section 1 "Lesson Snapshot" -> "Key model" (one line of text).

The steps come from data/curriculum/wrm-steps.json. After writing, run
`node tests/scripts/ws-wrm-extract.cjs` (copies the words into wrm-steps.json step.vocab) and
`node tests/scripts/ws-wrm.cjs --report-only`.
"""
import argparse, json, os, re, subprocess, sys, concurrent.futures as cf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
STEPS = os.path.join(ROOT, 'data', 'curriculum', 'wrm-steps.json')
OUT = os.path.join(ROOT, 'data', 'curriculum', 'wrm-vocab.json')

QUOTE = re.compile(r'[“"]([^”"]+)[”"]')
PRE = re.compile(r'^pre-?teach\b', re.I)
# lines that start the next bullet of the Language Access list (a capital first letter is also
# required, so a wrapped line such as "use the inner / outer scale" continues the bullet)
NEXT = re.compile(r'^(use the|use a |use wr|rehearse|point\s*(?:/|before|first)|choose before|learning access|model before|model with|one access|one routine|reduce load|if stuck|extra support|keep the|keep both)', re.I)
LANG = re.compile(r'^language access\b.*$', re.I)
LEARN = re.compile(r'^(learning access|extra support|sources)\b', re.I)
KEYM = re.compile(r'^key model\s*', re.I)
KEYSTOP = re.compile(r'^(biggest errors?|avoid|goal|sources)\b', re.I)
STEM_CUT = re.compile(r'(?:^|[.;]\s*)(?:Lesson stem|Stem)\b[^:“]*:?\s*(?=“)|(?:^|[.;]\s*)(?:Lesson stem|Stem)\b[^:]*:', re.I)
HEADER = re.compile(r'Now teaching ▸ White Rose · (Reception|Year \d) · .*?Step (\d+): (.*?)(?:\s+\||$)', re.M)


# ------------------------------------------------------------------ download
def fetch(gid, cache):
    txt = os.path.join(cache, f'{gid}.txt')
    if os.path.exists(txt) and os.path.getsize(txt) > 100:
        return gid, None
    pdf = os.path.join(cache, f'{gid}.pdf')
    r = subprocess.run(['curl', '-sSL', '--retry', '3', '-o', pdf, '-w', '%{http_code}',
                        f'https://drive.google.com/uc?export=download&id={gid}'], capture_output=True, text=True)
    try:
        if not os.path.exists(pdf):
            return gid, f'download failed (http {r.stdout}) {r.stderr.strip()[:120]}'
        with open(pdf, 'rb') as f:
            if f.read(5) != b'%PDF-':
                return gid, f'not a PDF (http {r.stdout}): the file is not shared by link, or Drive sent a warning page'
        import pymupdf
        d = pymupdf.open(pdf)
        t = '\n'.join(p.get_text() for p in d)
        d.close()
        if len(t) < 200:
            return gid, 'the PDF has no text layer'
        with open(txt, 'w') as f:
            f.write(t)
        return gid, None
    finally:
        if os.path.exists(pdf):
            os.remove(pdf)


# ------------------------------------------------------------------ parse
def join(parts):
    return re.sub(r'\s+', ' ', ' '.join(p for p in parts if p)).strip()


def clean_word(w):
    keep_dot = bool(re.search(r'\b[a-z]\.[a-z]\.$', w.strip()))  # "a.m."
    w = re.sub(r'\s+', ' ', w).strip().strip('.,;:…').strip()
    if keep_dot:
        w += '.'
    w = re.sub(r'^(and|or)\s+', '', w, flags=re.I)
    w = re.sub(r'^-\s+', '-', w)  # "- teen" -> "-teen"
    return w.strip('“”"‘’\'').strip()


def split_top(s, seps):
    """Split s on the regex seps wherever it sits outside parentheses and curly quotes."""
    out, depth, q, cur, i = [], 0, False, '', 0
    rx = re.compile(seps)
    while i < len(s):
        ch = s[i]
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth = max(0, depth - 1)
        elif ch == '“':
            q = True
        elif ch == '”':
            q = False
        if depth == 0 and not q:
            m = rx.match(s, i)
            if m and m.end() > i:
                out.append(cur)
                cur = ''
                i = m.end()
                continue
        cur += ch
        i += 1
    out.append(cur)
    return [x.strip() for x in out if x.strip()]


def split_items(body):
    """The text after 'Pre-teach 3 words only:'. Returns ([(word, meaning or None)], [stems])."""
    stems = []
    m = STEM_CUT.search(body)
    if m:  # "... Lesson stem: “...”" written inside the Pre-teach bullet
        stems = [q.strip() for q in QUOTE.findall(body[m.start():])]
        body = body[:m.start()]
    body = re.sub(r'\.\s*Add:\s*', '; ', body)
    items = split_top(body, r';\s*')
    if len(items) == 1 and ',' in items[0]:
        items = split_top(items[0], r',\s*')
    # The middle dot joins terms ("subtract · exchange = swap ...") but can also sit inside a
    # meaning ("multiply / × = lots of · groups of"): a dot segment starts a new term unless the
    # term so far already has its "=" and the segment has none. A bare term followed by the
    # defined one ("tenths · hundredths · thousandths = ...") is a group: no meaning for any.
    pieces = []
    for it in items:
        acc, grouped = None, False
        for seg in split_top(it, r'\s+·\s+'):
            if acc is not None and '=' in acc and '=' not in seg:
                acc += ' · ' + seg
            else:
                if acc is not None:
                    pieces.append((acc, grouped))
                grouped = acc is not None and '=' not in acc
                acc = seg
        pieces.append((acc, grouped))
    out = []
    for it, grouped in pieces:
        head, eq, meaning = it.partition('=')
        if not eq:
            # a trailing instruction after a dash: "a, b — show each with a real object"
            if ' — ' in head or ' – ' in head:
                head = split_top(head, r'\s+[—–]\s+')[0]
            if re.match(r'^[\d…£$(<>]', head.strip()) and out:
                # "multiple of 1,000 = 1,000; 2,000; 3,000 …" continues the previous meaning
                w, d = out[-1]
                out[-1] = (w, ((d or '') + '; ' + it).strip('; '))
                continue
        for h in ([head] if eq else split_top(head, r',\s*')):
            hm = re.match(r'^([^()]+?)\s*\(([^)]*)\)\s*\.?$', h.strip())
            if (hm and not eq and not re.fullmatch(r'[^a-z]{1,4}', hm.group(2))
                    and not re.fullmatch(r'(?:[a-z]{1,2}|1st|2nd|3rd)', hm.group(2))):
                w, d = clean_word(hm.group(1)), hm.group(2).strip()  # "pattern (it repeats)"
            else:
                w, d = clean_word(h), ((meaning.strip().rstrip('.') or None) if eq else None)
            if grouped and eq:
                d = None
            parts = [clean_word(x) for x in split_top(w, r'\s*/\s*')]
            if len(parts) > 1 and all(parts) and not any(re.fullmatch(r'[^A-Za-z]{1,3}', x) for x in parts):
                out.extend((x, None) for x in parts)  # "big / small", "vertex/corner"
            elif w:
                out.append((w, d))
    return [(w, d) for w, d in out if w and len(w) < 60], stems


def section(ls, start_re, stop_re):
    for i, l in enumerate(ls):
        if start_re.match(l):
            head = start_re.sub('', l, count=1).strip()
            out = [head] if head else []
            for m in ls[i + 1:]:
                if stop_re.match(m):
                    break
                out.append(m)
            return out
    return None


def bullet(lines, i):
    blk = [lines[i]]
    for m in lines[i + 1:]:
        if (m[:1].isupper() and NEXT.match(m)) or PRE.match(m):
            break
        blk.append(m)
    return join(blk)


def parse(text):
    """Returns (entry, problems)."""
    ls = [l.strip() for l in text.split('\n')]
    e = {'words': [], 'glossary': {}, 'stems': [], 'representations': []}
    why = []
    lang = section(ls, LANG, LEARN)
    if lang is None:
        why.append('no "Language Access" section')
        lang = []
    pre = next((bullet(lang, i) for i, l in enumerate(lang) if PRE.match(l)), None)
    if pre is None:
        why.append('no "Pre-teach" bullet under Language Access')
    else:
        body = pre.partition(':')[2]
        if not body.strip():
            why.append(f'the Pre-teach bullet has no list: {pre[:80]}')
        pairs, st = split_items(body)
        e['stems'].extend(st)
        seen = set()
        for w, d in pairs:
            if w.lower() in seen:
                continue
            seen.add(w.lower())
            e['words'].append(w)
            if d:
                e['glossary'][w] = d
    use = next((bullet(lang, i) for i, l in enumerate(lang) if re.match(r'^use the\b.*\bstems?\b', l, re.I)), None)
    for q in QUOTE.findall(use or ''):
        if q.strip() and q.strip() not in e['stems']:
            e['stems'].append(q.strip())
    km = section(ls, KEYM, KEYSTOP)
    if km and join(km):
        e['representations'].append(join(km))
    if not e['words']:
        why.append('no words found')
    return e, why


def norm(t):
    return re.sub(r'[^a-z0-9]', '', t.lower().replace('&', 'and'))


def header_check(text, year_name, number, title):
    m = HEADER.search(text)
    if not m:
        return 'no "Now teaching" header'
    if m.group(1) != year_name or int(m.group(2)) != number:
        return f'header names {m.group(1)} Step {m.group(2)}'
    # guides reword some titles ("Combine two groups" for "Combine 2 groups"): at least half of
    # the step title's words must appear in the header title
    want = re.findall(r'[a-z0-9-]+', title.lower())
    have = set(re.findall(r'[a-z0-9-]+', m.group(3).lower()))
    if norm(m.group(3))[:14] != norm(title)[:14] and sum(w in have for w in want) * 2 < len(want):
        return f'header title "{m.group(3)}"'
    return None


# ------------------------------------------------------------------ main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', required=True, help='directory for the extracted guide text')
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--jobs', type=int, default=8)
    a = ap.parse_args()
    os.makedirs(a.cache, exist_ok=True)
    inv = json.load(open(STEPS))
    steps = [(y, s) for y in inv['years'] for b in y['blocks'] for s in b['steps']]
    gids = [g for _, s in steps for g in (s['drive']['guide'] if isinstance(s['drive'].get('guide'), list) else [s['drive'].get('guide')]) if g]
    with cf.ThreadPoolExecutor(a.jobs) as ex:
        dl = dict(ex.map(lambda g: fetch(g, a.cache), gids))

    out, failures, notes = {}, {}, []
    for y, s in steps:
        g = s['drive'].get('guide')
        cands = g if isinstance(g, list) else ([g] if g else [])
        if not cands:
            failures[s['id']] = 'no Teaching Guide in wrm-steps.json'
            continue
        chosen, probs = None, []
        for gid in cands:
            if dl.get(gid):
                probs.append(f'{gid}: {dl[gid]}')
                continue
            text = open(os.path.join(a.cache, f'{gid}.txt')).read()
            h = header_check(text, y['name'], s['number'], s['title'])
            if h:
                probs.append(f'{gid}: {h}')
                continue
            e, why = parse(text)
            if why:
                probs.append(f'{gid}: {"; ".join(why)}')
                continue
            chosen = (gid, e)
            break
        if not chosen:
            failures[s['id']] = ' | '.join(probs)
            continue
        gid, e = chosen
        entry = {'words': e['words']}
        if e['glossary']:
            entry['glossary'] = e['glossary']
        if e['stems']:
            entry['stems'] = e['stems']
        if e['representations']:
            entry['representations'] = e['representations']
        entry['guideId'] = gid
        others = [x for x in cands if x != gid]
        if others:
            entry['otherGuideIds'] = others
            notes.append(f'{s["id"]}: {len(cands)} Teaching Guide files; both headers name this step. The first ({gid}) is used; {", ".join(others)} is listed in otherGuideIds.')
        entry['source'] = 'teaching-guide'
        out[s['id']] = entry

    doc = {
        'meta': {
            'title': 'Key vocabulary per White Rose Maths small step, from the owner\'s Teaching Guides (Guide D)',
            'generatedBy': 'python3 tests/scripts/ws-wrm-vocab.py --cache <dir>',
            'source': 'Google Drive, White Rose Maths Primary: \'<nn> Step <n> <title> - Teaching Guide.pdf\' in each block folder (file ids in wrm-steps.json drive.guide), downloaded by link and read as text.',
            'fields': {
                'words': 'the guide\'s "Pre-teach N words only" list (Section 8, Language Access), in its order; terms joined by "/" or "·" are split into separate words',
                'glossary': 'the guide\'s child-friendly meaning for a word ("match = goes with the one that is the same"), where it gives one',
                'stems': 'the lesson sentence stems the guide says to use (Language Access, "Use the lesson stem")',
                'representations': 'the guide\'s "Key model" (Section 1, Lesson Snapshot)',
                'guideId': 'the Drive file id of the Teaching Guide read',
                'source': '"teaching-guide": extracted from that guide',
            },
            'use': 'Copied into wrm-steps.json (step.vocab = words) by tests/scripts/ws-wrm-extract.cjs. For the lessons\' warm-ups (design/LESSONS_VISION.md).',
            'counts': {'steps': len(steps), 'withWords': len(out), 'words': sum(len(v['words']) for v in out.values())},
            'notes': notes,
            'failures': failures,
        },
        'steps': out,
    }
    text = json.dumps(doc, indent=1, ensure_ascii=False) + '\n'
    if a.check:
        same = os.path.exists(OUT) and open(OUT).read() == text
        print('ws-wrm-vocab: up to date' if same else 'ws-wrm-vocab: data/curriculum/wrm-vocab.json differs')
        sys.exit(0 if same else 1)
    with open(OUT, 'w') as f:
        f.write(text)
    print(f'wrote data/curriculum/wrm-vocab.json: {len(out)}/{len(steps)} steps with words, {doc["meta"]["counts"]["words"]} words, {len(failures)} failures')
    for k, v in failures.items():
        print(f'  FAILED {k}: {v}')


if __name__ == '__main__':
    main()
