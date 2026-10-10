import json, re
R = '/home/user/MathQuest/.claude/worktrees/agent-aa09d8d25584eba48/'
d = json.load(open(R + 'data/curriculum/links/Y4.json'))
K = json.load(open('/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-tag-Y4/keys.json'))
tags = {}
for k, v in K['tags'].items():
    for e in v:
        s = e if isinstance(e, str) else e['step']
        tags.setdefault(s, set()).add(k)
for sid, s in d['steps'].items():
    for p in s['pre']:
        m = re.match(r'^(\S+) (.*)$', p['why'] + ' ')
        ref = m.group(1)
        if ref.startswith(('R.', 'Y')) and ref in tags and p['key'] not in tags[ref]:
            print(sid, p['key'], '<-', p['why'][:90], '| tags:', ','.join(sorted(tags[ref]))[:80])
