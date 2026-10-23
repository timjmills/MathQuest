"""G7 reader, step 2: the rule-based classifier for grade-run defects (one class from
design/status/defect-classes.md, or DROP for observations, "fixed" notes and inherited duplicates).
The hand corrections that follow it live in ov.txt / ov_r4.txt and are applied by build.py."""
import re,collections
def has(t,p): return re.search(p,t,re.I) is not None
RULES=[
 ('DROP', lambda t,x: x['severity'] in('note',) or has(t,r'^inherits every') or (x['severity']=='note (re-check)' and not has(t,r'still|open|not fixed|new\b|but\b'))),
 ('DROP', lambda t,x: has(t,r'(^readable[;.]|;\s*good\.?$|\bgood\s*\.?$|^ok\b|^fine\b|^correct\b)') and not has(t,r'\bbut\b|not |no ')),
 ('DROP', lambda t,x: has(t,r'^(keys? (checked|verified|correct)|\d+/\d+ values pass|all values pass|keys? [\d, /:-]+ (verified|checked))|\bFIXED\b(?!.*(still|but|open|not))|^r\d .*fixed\.?$|: (fine|acceptable)[;.]|^acceptable|, good\.?$') and not has(t,r'\bbut\b|\bstill\b|not fixed|missing|wrong|\bno\b')),
 ('MISSING', lambda t,x: has(t,r'copyright line|refuses|no stretch|returns an error|empty page|no items|role is missing|missing page|does not print|not supported|unsupported|no (error-analysis|guided|test|review) page')),
 ('PATTERN', lambda t,x: has(t,r'\bL10\b|cycle|in (the same )?order|never (asked|var)|only \d+ different answers|answers? (come in|bunch)|band top|(answers?|items?)\b[^.]{0,40}\b\d+ ?(of|/) ?(16|20|30)\b|run of \d|same answer|answer positions')),
 ('GIVEAWAY', lambda t,x: has(t,r'pre-?drawn|gives the answer|picture gives|give[sn]? (the (answer|verdict|place)s? )?away|giveaway|\bL3\b|prints the answer|already drawn|holds exactly the')),
 ('INK_FONT', lambda t,x: has(t,r'nunito|card chrome|rounded (card|corner)')),
 ('DROP', lambda t,x: has(t,r'(verified|; fine|, fine|: fine|no overflow|no scroll)\.?\)?$|^support \d/\d|^(area|support) ladder') and not has(t,r'\bbut\b|\bstill\b|not fixed|missing|wrong|persists|open')),
 ('GIVEAWAY', lambda t,x: has(t,r'tells? the pupil (how many|the answer|which)|exactly as many rows|row count = |without .*commas.*(right|correct)|commas? .*gives? the verdict')),
 ('KEY', lambda t,x: has(t,r'\bthe key (draws|uses|lists|prints|gives|says|shows)|keyed (wrong|correct|as)')),
 ('MISSING', lambda t,x: has(t,r'not shown at all|cannot be answered|is blank: one empty box')),
 ('NAME_CONTENT', lambda t,x: has(t,r'none is shaded|unshaded|not this skill|wrong (skill|topic)|off topic|ungrammatical|grammar error') and not has(t,r'instruction|title')),
 ('SIZE', lambda t,x: has(t,r'^(fact |question |tile )?digits? (are |about |~)?\d+ ?px')),
 ('DROP', lambda t,x: has(t,r'^(plain|nit|same|items fine)\.?$|^ruler \d+ px|all answers checked|: distinct|^accent grey|^(all )?(number )?items?.*; keys [\d, ]+ verified') and not has(t,r'\bbut\b|\bstill\b|not fixed|missing|wrong|persists|open|\bno\b')),
 ('NAME_CONTENT', lambda t,x: has(t,r'name promises .*(no|never)|promises .* (no|never) .* appears|cannot show \d\.')),
 ('GIVEAWAY', lambda t,x: has(t,r'printed over every item|hint scaffold on|where (it is )?not needed|answers given in')),
 ('SCREEN_PARITY', lambda t,x: has(t,r'quiz (field|cell)|three (hosts|response modes)|field on the right|typed into a field|printed above the cell|unlike paper|in a real quiz')),
 ('INSTRUCTION', lambda t,x: has(t,r'no (page frame|strand tab|.i can)|title is (the )?(bare|raw)|over .* items that ask|instruction-library|footer is')),
 ('NOTATION', lambda t,x: has(t,r"'1000' where|answer form is|keyed .*\(improper\)|\b1000\b.*1,000")),
 ('CLIP_OVERLAP', lambda t,x: has(t,r'touch each other|run together|look like the others|overflows?\b|thumbnails|hands cover')),
 ('REPEAT', lambda t,x: has(t,r'identical (routines|\d+-\d+ block)|\bthe identical\b')),
 ('VIEWPORT', lambda t,x: has(t,r'pan arrows|only columns .* visible|inputs? .*\d+ ?[x×] ?\d+ ?px|cells \d+x\d+ px')),
 ('DROP', lambda t,x: has(t,r'^two different open problems|^grid unit|tight but readable') and not has(t,r'\bbut\b|\bno\b')),
 ('VISUAL_DESIGN', lambda t,x: has(t,r'(missing|broken)[\w /]{0,25} borders?|labels? .* sit .* (below|above) the middle|drawn \d+ ?x ?\d+ px|flat ellipse|border (edges|segments)|not to scale|drawn near-square|touch and fuse|wrap .* losing the grouping|wrap 5\+1')),
 ('INTERACTION', lambda t,x: has(t,r'renders? empty|preview is empty|no check button|check button is shown')),
 ('PATTERN', lambda t,x: has(t,r'printed order|sorted by height|groupbyheight')),
 ('REPEAT', lambda t,x: has(t,r'only \d+ distinct|\b[a-h] = [a-h]\b')),
 ('GIVEAWAY', lambda t,x: has(t,r'group size is printed|regroup box(es)? (is |are )?printed over|carry boxes over|over grade-1 facts')),
 ('STEPS_LAYOUT', lambda t,x: has(t,r'prints alone on its own line')),
 ('SCREEN_PARITY', lambda t,x: has(t,r'card says|worksheet/quiz|three answer places|doubled response|operator buttons appear')),
 ('CLIP_OVERLAP', lambda t,x: has(t,r'labels? cluster|read as two-digit')),
 ('SIZE', lambda t,x: has(t,r'at s and at l|(same|identical) .* at s and (at )?l|size buys nothing|same \d+ items as l|\d+ ?px glyphs|~?\d+ ?px;|question \d+ px dwarfs|\d+ mm digits')),
 ('INSTRUCTION', lambda t,x: has(t,r'\bheaded\b|level .* grade .* (do not|does not) match|has no direction|no instruction line')),
 ('MISSING', lambda t,x: has(t,r'no ten frame|visual is missing|no (numbers|bins)|no grid is drawn|cannot plot')),
 ('SLOT', lambda t,x: has(t,r'two digit cells|leading 0|no digit grid|answer box small')),
 ('PEDAGOGY', lambda t,x: has(t,r'here is one problem and its answer|first-row fade|trivial')),
 ('VIEWPORT', lambda t,x: has(t,r'\d+ ?[x×] ?\d+ ?px|px wide on phone')),
 ('DROP', lambda t,x: has(t,r'readable at (desktop|quiz) size\.?$|^mix of|under 30 %, roomy|^inherits the members|rows sized to content\.?$|^\d+ items \d x \d\.?$') and not has(t,r'\bbut\b|\bno\b|not ')),
 ('PEDAGOGY', lambda t,x: has(t,r'not (a )?real misconceptions?')),
 ('PATTERN', lambda t,x: has(t,r'all (four|three|\d) answers are|answer \d+ on \d of \d|same [\d, ]+ pattern|(four|three|five) of (six|five|eight) answers')),
 ('REPEAT', lambda t,x: has(t,r'same .* item as the|equals one of the')),
 ('CLIP_OVERLAP', lambda t,x: has(t,r'4 4 4|read as (444|\d\d)|label pair at')),
 ('VIEWPORT', lambda t,x: has(t,r'drag-only|for tapping|tap boxes')),
 ('MISSING', lambda t,x: has(t,r'no quiz (produced|questions)')),
 ('INSTRUCTION', lambda t,x: has(t,r'"?test a:|steps are hard-coded')),
 ('GIVEAWAY', lambda t,x: has(t,r'shows the finished')),
 ('SCREEN_PARITY', lambda t,x: has(t,r'screen host does not|paper has')),
 ('SIZE', lambda t,x: has(t,r'largest digit|~?\d+ ?mm glyphs|axis digits \d+ px|is ~?\d+ ?px body text')),
 ('DROP', lambda t,x: has(t,r'^(s |cells? |foot |bands? )?(band )?\d+ ?%\.?$|bands? measured <= ?\d+ ?%\.?$|keys? [\w, ]+ measured\.?$|^help ladder .*nit|^\d+ per page; keys') and not has(t,r'\bbut\b|\bno\b|not |only')),
 ('INTERACTION', lambda t,x: has(t,r'renders? empty|box renders empty')),
 ('KEY', lambda t,x: has(t,r'key fills only|key shows only|key.s fix')),
 ('STEPS_LAYOUT', lambda t,x: has(t,r'step lines wrap|wraps mid-equation')),
 ('GIVEAWAY', lambda t,x: has(t,r'length reveals|is the answer by matching|exactly the remaining answers|= exactly the')),
 ('SCREEN_PARITY', lambda t,x: has(t,r'two answer (areas|places)|nested boxes|offers one underline input|cannot be entered|no answer input')),
 ('MISSING', lambda t,x: has(t,r'blank page|0 guided cells|no squared paper|no graph is drawn|fact-row layout|^refused')),
 ('INSTRUCTION', lambda t,x: has(t,r'over one number|hint says')),
 ('NAME_CONTENT', lambda t,x: has(t,r'dead-end value')),
 ('REPEAT', lambda t,x: has(t,r'are the same item|same example appears')),
 ('PEDAGOGY', lambda t,x: has(t,r'no worked example|no division sentence')),
 ('VISUAL_DESIGN', lambda t,x: has(t,r'doubled top border|minute hand crosses')),
 ('CLIP_OVERLAP', lambda t,x: has(t,r'crosses (the )?cell .*edge|label .* touches|touches "|ledge/stem pairs|labels? .* (sits?|drawn) .* (inside|across)')),
 ('SLOT', lambda t,x: has(t,r'measure \d+(\.\d)? x \d+(\.\d)? mm')),
 ('VIEWPORT', lambda t,x: has(t,r'hint / read / skip|\d+ px tall \(h6\)')),
 ('SIZE', lambda t,x: has(t,r'size l prints only|same .* as l \(s could|prints only \d+ \(like l\)|about \d+ mm at s|\d(\.\d)? mm wide: its detail|~?\d+ px numerals|thumbnail')),
 ('NOTATION', lambda t,x: has(t,r'slash fractions|slashed')),
 ('PROCESS', lambda t,x: has(t,r'self-grade|builder report|not run\b|misreport|reported as|claims? (it|the)|status\.md|unverified|gate (was )?not|stale doc')),
 ('VIEWPORT', lambda t,x: has(t,r'\d+ ?px scroll|(below|under) (the )?44 ?px|< ?44|\d+ ?px-tall .*fold') or 'H6' in x['caps'] and has(t,r'390|820|1280|1366|scroll|fold|reach|viewport|hidden|off.?screen|below') or has(t,r'\b(at|card) (390|820|1366)|below the fold|page scroll|touch target|sticky|scrolls? (off|out)|viewport|off-?screen')),
 ('KEY', lambda t,x: has(t,r'\bkey(ed|s)?\b|answer key|facsimile') and has(t,r'wrong|missing|(empty|blank) (box|slot|regroup|carry)|not (a )?facsimile|says|keyed|json|internal id|no key|absent|incorrect|disagree|does not match|leaves|unfilled|not filled|H1\b|H10')),
 ('GIVEAWAY', lambda t,x: has(t,r'give[sn]? (the (answer|verdict|place)s? )?away|giveaway|gives away|\bL3\b|answer is (printed|drawn|shown)|prints the answer|\btell\b|is printed (black|in the|above)|already drawn|the result drawn|pre-?printed|answer .*(visible|shown) in the')),
 ('PATTERN', lambda t,x: has(t,r'\bL10\b|cycle|cycles|in (the same )?order|never var|always (the same|says|\d)|alternat|\d+ ?(of|/) ?30\b|every (item|page|seed) (is|deals|has)|run of \d|same answer|answers? fall|\b1/2 is the answer')),
 ('REPEAT', lambda t,x: has(t,r'\b[a-f] and [a-f] (are|both)\b|same (set|rectangle|weak|three instruction)|twice|duplicat|repeats?|repeated|same (problem|item|three|two|story|u-shape|shape|numbers)|identical (items|problem)|twins?\b|test = practice')),
 ('SIZE', lambda t,x: has(t,r'digits? (about |~)?\d+ ?px|\d+ ?px (vs|below|against)|below (the )?\d+ ?px|below \d+ ?pt|font size|\bL1\b|size s (prints|==|=)|instruction (line|text) ~?\d+ ?px|same (\d+ )?(page|per page|\d+ per page) as l|same \d+ (items )?(a|per) page as l|s prints .* (vs|than) l|largest question digit|digits? (about |~)?\d+ ?(px|mm)|\d+ ?pt numerals|grid shrinks|s labels .* while l')),
 ('SCREEN_PARITY', lambda t,x: has(t,r'on screen|screen cell|differs from paper|vs paper|paper .list|cannot draw|input lives|input is (to the right|beside|below)|away from the rule|than (the |on )?paper') or ('H7' in x['caps'] or 'H8' in x['caps']) and has(t,r'screen|card|input|field|doubled|type|multiple.choice|online|quiz|paper|tap|drag') or has(t,r'doubled (slot|answer)|on screen .* paper|paper .* on screen|production item|detached input|separate .*(answer|input) (field|box)|not the kit cell|kit cell')),
 ('SIZE', lambda t,x: 'OC14' in x['caps'] and has(t,r'\bsize\b|\bS\b|= ?L|columns|denser|scale') or has(t,r'size s|\bs ?==? ?l\b|s = l|same (layout|columns|drawing size|items?) .*at s|no denser|\bL1\b|not scaled|fixed-size|does not scale|at s .* same|exactly as many as l|ignores size|oc14')),
 ('CLIP_OVERLAP', lambda t,x: has(t,r'clip|overlap|collid|collision|overprint|struck through|off the page|outside (the|its) (cell|border|frame)|cut off|illegible|unreadable|crowd|drawn over|on top of|\b[1-7](\.\d)? ?pt\b|runs? (into|past)|truncat')),
 ('SIZE', lambda t,x: has(t,r'\b(8|9|10|11)(\.\d)? ?pt\b|below the 11 pt|tiles are \d+ ?px|clocks ~?\d+ px')),
 ('STEPS_LAYOUT', lambda t,x: has(t,r'one word (per|a) line|\bL11\b|steps? (squeezed|column|text|panel) .*(narrow|beside|squeez)|squeezed steps')),
 ('SPACE', lambda t,x: has(t,r'empty band|empty|% blank|\bband\b|under-?fill|\blone\b|\b1 (problem|item)s? (a|per) page|[1-3] (problems|items) (a|per) page|wasted|gutter|sparse|blank (strip|space|area)|% of the (cell|page|panel|band)|\bH13\b|\bH5\b|half-empty|white ?space|page foot|footer mid|split cell|mid-page')),
 ('SLOT', lambda t,x: has(t,r'\bslot|answer box|write box|box(es)? (too|is) (small|narrow|short)|no room|room to (write|draw)|answer (line|row|area)|cramped|\bH9\b|\bH12\b|check box|no (answer )?box|nowhere to (write|answer)|too small to write|regroup box')),
 ('INK_FONT', lambda t,x: has(t,r'colou?r|(pale|faint|light|dark) gr[ae]y|gr[ae]y (is |too )?(faint|pale|light|tone)|emoji|\bfont|andika|\bbold|line weight|stroke|legacy (look|cell)|\bink\b|\bH4\b|purple|blue|red\b|green')),
 ('NOTATION', lambda t,x: has(t,r'slash|stacked|comma|notation| x instead|\bx not ×|÷|decimal point|thousands separator|"/"')),
 ('INSTRUCTION', lambda t,x: has(t,r'ungrammatical|instruction|title|say (line|band)|\bsay:|\bI can\b|\btab\b|footer|heading|header|\bL6\b|strand|does not match the (item|task)|steps? (do not|don.t) match|the example does not look like')),
 ('INTERACTION', lambda t,x: has(t,r'console|crash|throws|focus|caret|flicker|bounce|toast|refuses|marks? (it|the answer) (wrong|right)|accepted|click|tapping|keyboard|enter key|navigation')),
 ('PLAIN_WORDS', lambda t,x: has(t,r'jargon|internal id|\bcode\b|hard word|technical term')),
 ('MISSING', lambda t,x: 'H11' in x['caps'] or has(t,r'missing|not offered|cannot be (produced|printed|chosen)|does not exist|no (support |difficulty |appearance |size |number.size |\w+ )?(control|option|choice|value)|not printed|no page|copyright line|\bOC9\b|\bOC3\b|only (one|1) (task|kind|form)|no .* option|absent|never (offered|printed)|\bH11\b')),
 ('NAME_CONTENT', lambda t,x: 'H3' in x['caps'] or 'OC4' in x['caps'] or has(t,r'\bdeals?\b|dealt|out of range|wrong (answer|maths|sum|value|carry)|contradict|ticked|incoherent|within \d|not .*facts|breaks (its|the) promise|does nothing|\bH3\b|\bL4\b|over the|outside the')),
]
def default(x,t):
  c=x['criterion'] or ''
  if c=='C2': return 'PEDAGOGY'
  if c=='C3': return 'SPACE' if has(t,r'page|cell|row|column|item') else 'VISUAL_DESIGN'
  if c=='C4': return 'VISUAL_DESIGN'
  if c=='C1': return 'CLARITY'
  if c in('O1','O2','O3','O6'): return 'MISSING'
  if c=='O4': return 'NAME_CONTENT'
  if c=='O5': return 'CLARITY'
  for cls,pat in JUDG:
    if has(t,pat): return cls
  return 'CLARITY'
JUDG=[('PEDAGOGY',r'model|worked|example|scaffold|distractor|misconception|progression|difficult|easier|harder|recognition only|task kind|one task|teach|step'),
      ('VISUAL_DESIGN',r'drawn|drawing|representation|looks|picture|figure|diagram|clock|bar|line'),]
def classify(x):
  t=(x['what'] or '')
  for cls,f in RULES:
    try:
      if f(t,x): return cls
    except Exception as e: raise
  # fallback using 'where' too
  return default(x,t)

def classify_all(raw):
  """Dedupe on (run, skill, defect text), classify, drop DROP rows (the order is what ov.txt indexes)."""
  out=[];seen=set()
  for x in raw:
    key=(x['run'],x['skill'],(x['what'] or '').strip())
    if key in seen: continue
    seen.add(key)
    cls=classify(x)
    if cls=='DROP': continue
    x=dict(x); x['cls']=cls; out.append(x)
  return out
