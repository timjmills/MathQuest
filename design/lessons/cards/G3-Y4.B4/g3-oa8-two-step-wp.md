# Lesson card: I Can solve two-step stories

**Lesson** `G3|-|twostepwordproblemswiththefouroperations` · **Unit** G3-Y4.B4 · **Grade** 3 · **CCSS** 3.OA.D.8 · **EE** M.EE.3.OA.7 · **Shape** `bar-story`

Seeded by `node tests/scripts/ws-lesson-card.mjs --from-detailed` from the passed hand-written lesson (the E4 proof set).
The machine block at the end is the source of truth (`design/lessons/cards/README.md`); this summary is for reading. The
lane decides every open question (its `answer` and the `rule` it rests on) and closes the card with `Decided: lf-<lane>, <date>`.

## Parts (skill + options)

| Part | Skill | Options and floors |
|---|---|---|
| P0 question 1 → 3.OA.A.3 Equal-groups stories | `multiplication:mult_word_problems_plain` | {"opts":{"forms":[0],"pictures":false,"wpCues":false,"wpBank":false,"wpFrames":true},"instructionKey":"story-steps"} |
| P0 question 2 → 3.OA.A.3 Sharing stories | `division:div_word_problems_plain` | {"opts":{"forms":[0],"pictures":false,"wpCues":false,"wpBank":false,"wpFrames":true},"instructionKey":"story-steps"} |
| P0 question 3 → Y2 B4 S10 Two-step problems | `algebra:multi_step_word_plain` | {"opts":{"forms":[0],"band":30,"pictures":false,"wpCues":false,"wpBank":false,"wpFrames":true},"instructionKey":"story-steps"} |
| P2-P4 lesson skill | `algebra:multi_step_word_plain` | {"opts":{"msOps":"mult","pictures":false,"wpCues":false,"wpBank":false},"fresh":true,"itemSpread":true,"lr6Names":true,"dealTries":2000,"allTest":"msMult","sect |
| P4 Practice 1 | @R1 |  |
| P4 Practice 2 | @R2 |  |
| P1 band A row 1 | `placevalue:more_less_10` | {"opts":{"step":10,"dir":"more","band":100},"minNum":10,"maxNum":60} |
| P1 band A row 2 | `placevalue:more_less_10` | {"opts":{"step":10,"dir":"less","band":100},"minNum":20,"maxNum":60} |
| P1 band A row 3 | `placevalue:compare` | {"opts":{"band":99,"closeness":"far"}} |
| P1 band A row 4 | `placevalue:unit_form` | {"opts":{"band":99},"maxNum":50} |
| P1 band A row 5 | `placevalue:more_less_10` | {"opts":{"step":1,"dir":"more","band":100},"minNum":10,"maxNum":50} |
| P1 band B row 1 | `placevalue:more_less_100` | {"opts":{"step":10,"dir":"more"},"minNum":120,"maxNum":880} |
| P1 band B row 2 | `placevalue:more_less_100` | {"opts":{"step":10,"dir":"less"},"minNum":120,"maxNum":980} |
| P1 band B row 3 | `placevalue:compare` | {"opts":{"band":999,"closeness":"close"},"minNum":100} |
| P1 band B row 4 | `placevalue:unit_form` | {"opts":{"band":99},"minNum":50} |
| P1 band B row 5 | `placevalue:more_less_10` | {"opts":{"step":1,"dir":"more","band":120},"minNum":101,"maxNum":118} |
| P5 word problem | @R1 |  |
| P6 exit 1: × then − (Critical Atom: Step 2 uses the Step 1 answer) | `algebra:multi_step_word_plain` | {"opts":{"msOps":"mult","pictures":false,"wpCues":false,"wpBank":false,"wpFrames":true},"fresh":true,"itemSpread":true,"lr6Names":true,"dealTries":2000,"allTest |
| P6 exit 2: ÷ then + | `algebra:multi_step_word_plain` | {"opts":{"msOps":"div","pictures":false,"wpCues":false,"wpBank":false,"wpFrames":true},"fresh":true,"itemSpread":true,"lr6Names":true,"dealTries":2000,"allTest" |
| Spaced retrieval 1 | `multiplication:mult_facts` | {"opts":{"constant":[3,4],"notation":["across"],"band":100},"allTest":"factNoZeroOne"} |
| Spaced retrieval 2 | `division:div_facts` | {"opts":{"constant":[3,4],"notation":["across"]},"minNum":2,"maxNum":10} |
| Spaced retrieval 3 | `subtraction:sub_facts` | {"opts":{"band":20,"notation":["across"]}} |
| Check Question (msMultSub,msClean,msMid, right D) | `algebra:multi_step_word_plain` | {"opts":{"msOps":"mult","msChoose":true,"pictures":false,"wpCues":false,"wpBank":false},"fresh":true,"itemSpread":true,"lr6Names":true,"dealTries":2000} |

Hand-written lines (story, hook, teaching notes, mistakes' words): **117**.

## Open questions

1. Spaced retrieval 3 asks subtraction:sub_facts with band 100, which the skill does not offer (5, 10, 12, 15, 20). **Suggested:** band 20 **Decided:** band 20: subtraction facts within 20 (the Step 2 take-aways of the lesson are within 20 too). (skill-options.js schema of sub_facts; CLAUDE.md "within N bounds the answer")
2. Section 9 said "No step boxes this time" over a P5 that prints the Step 1 / Step 2 boxes (compiler: script vs page). **Suggested:** say what the page prints **Decided:** "Use the two step boxes. Write Step 1, then Step 2." (critic r1 D3: a script never contradicts its page (ws-lesson-card script-vs-page check))
3. Fact families and story frames repeat across the pack (critic r1 D2: 20 ÷ 4 / 20 ÷ 5 marbles, 6 × 4 / 24 ÷ 6 / 24 buttons). **Suggested:** ruling family-repeats **Decided:** ruling family-repeats: the compiled description carries repeatKey {family: unordered, frame: true} on the pack and on every ref. (LESSON_RULES LR-5 (one item once a pack), keyed by the unordered × / ÷ family plus the story frame)

## Machine block

```json lesson-card
{
  "format": "lesson-card/1",
  "id": "g3-oa8-two-step-wp",
  "lesson": "G3|-|twostepwordproblemswiththefouroperations",
  "unit": "G3-Y4.B4",
  "title": "I Can solve two-step stories",
  "grade": "3",
  "level": 3,
  "strand": "Operations",
  "ccss": ["3.OA.D.8"],
  "ee": ["M.EE.3.OA.7"],
  "eeNote": "Sheet code M.EE.3.OA.8 quotes the M.EE.3.OA.7 text; the repo tag is M.EE.3.OA.7.",
  "eeOwnerList": ["M.EE.3.OA.8"],
  "followOn": [
    {
      "title": "Two-step stories: add or take away first, then multiply or divide",
      "skill": "algebra:two_step_add_then_div",
      "opts": {},
      "ccss": "3.OA.D.8",
      "note": "Brackets: (12 + 18) ÷ 5; preset two_step_add_then_mult for (5 + 3) × 4."
    },
    {"title":"Write the equation with a letter","skill":"algebra:two_step_letter_equation","opts":{},"ccss":"3.OA.D.8","note":"5 × 4 − 6 = n, then n."},
    {"title":"Is the answer reasonable? Round to check","skill":"algebra:two_step_estimate_check","opts":{},"ccss":"3.OA.D.8"}
  ],
  "cra": "Pictorial → Abstract",
  "flowNote": "Chunk 1 (5a, 6a): × first. Chunk 2 (5b, 6b): ÷ first. Step 2 is always + or −.",
  "shape": "bar-story",
  "fns": {},
  "refs": {
    "R1": {
      "categoryId": "algebra",
      "skillId": "multi_step_word_plain",
      "opts": {"msOps":"mult","pictures":false,"wpCues":false,"wpBank":false},
      "fresh": true,
      "itemSpread": true,
      "lr6Names": true,
      "dealTries": 2000,
      "allTest": "msMult"
    },
    "R2": {
      "categoryId": "algebra",
      "skillId": "multi_step_word_plain",
      "opts": {"msOps":"div","pictures":false,"wpCues":false,"wpBank":false},
      "fresh": true,
      "itemSpread": true,
      "lr6Names": true,
      "dealTries": 2000,
      "allTest": "msDiv"
    }
  },
  "parts": {
    "lesson": {
      "categoryId": "algebra",
      "skillId": "multi_step_word_plain",
      "opts": {"msOps":"mult","pictures":false,"wpCues":false,"wpBank":false},
      "fresh": true,
      "itemSpread": true,
      "lr6Names": true,
      "dealTries": 2000,
      "allTest": "msMult",
      "sectionLabel": "Stories"
    },
    "prereqs": [
      {
        "ref": {
          "categoryId": "multiplication",
          "skillId": "mult_word_problems_plain",
          "opts": {"forms":[0],"pictures":false,"wpCues":false,"wpBank":false,"wpFrames":true},
          "instructionKey": "story-steps"
        },
        "items": 1,
        "lesson": {"id":"3.OA.A.3","title":"Equal-groups stories"},
        "atom": {"n":2,"type":"Category","skill":"Equal groups: multiply"}
      },
      {
        "ref": {
          "categoryId": "division",
          "skillId": "div_word_problems_plain",
          "opts": {"forms":[0],"pictures":false,"wpCues":false,"wpBank":false,"wpFrames":true},
          "instructionKey": "story-steps"
        },
        "items": 2,
        "lesson": {"id":"3.OA.A.3","title":"Sharing stories"},
        "atom": {"n":3,"type":"Category","skill":"Share equally: divide"}
      },
      {
        "ref": {
          "categoryId": "algebra",
          "skillId": "multi_step_word_plain",
          "opts": {"forms":[0],"band":30,"pictures":false,"wpCues":false,"wpBank":false,"wpFrames":true},
          "instructionKey": "story-steps"
        },
        "items": 1,
        "lesson": {"id":"Y2 B4 S10","title":"Two-step problems"},
        "atom": {"n":4,"type":"Conceptual","skill":"Two steps with + and −"}
      }
    ],
    "chart": {
      "concepts": [],
      "vocab": [],
      "steps": [
        {"icon":"look","text":"Read it. What do I find first?"},
        {"icon":"write","text":"Step 1: the groups. Multiply."},
        {"icon":"decide","text":"Step 2: use my Step 1 answer."},
        {"icon":"check","text":"Write the answer and the unit."}
      ],
      "chant": "First the groups. Then the change.",
      "chartWide": true,
      "chartRow": true,
      "noStripChant": true,
      "format": {
        "kind": "numbered steps with icons + a chant",
        "why": "The step pupils break is step 3: Step 2 done with a story number. The chant names the order of the two steps."
      },
      "example": {"match":"story","test":"msMultSub"},
      "second": {"test":"msMultAdd","label":"Gets more? Step 2 is +."}
    },
    "weDo": {"guidedRows":2,"tailRead":true,"practiceShape":[2,1],"guidedWants":["msMultSub","msMultAdd"]},
    "practice": {
      "pages": 2,
      "sheets": [
        {"steps":false,"skill":"@R1","shape":[2,1],"edgeLast":{"per":2,"cols":1,"wants":["msEdge"],"first":true}},
        {"steps":false,"skill":"@R2","shape":[2,1],"edgeLast":{"per":2,"cols":1,"wants":["msEdge"],"first":true}}
      ],
      "edgeTest": "msEdge",
      "fade": {"P5":"★★","P6":"★★"}
    },
    "mixed": null,
    "numberSense": {
      "A": {
        "items": [
          {"categoryId":"placevalue","skillId":"more_less_10","opts":{"step":10,"dir":"more","band":100},"minNum":10,"maxNum":60},
          {"categoryId":"placevalue","skillId":"more_less_10","opts":{"step":10,"dir":"less","band":100},"minNum":20,"maxNum":60},
          {"categoryId":"placevalue","skillId":"compare","opts":{"band":99,"closeness":"far"}},
          {"categoryId":"placevalue","skillId":"unit_form","opts":{"band":99},"maxNum":50},
          {"categoryId":"placevalue","skillId":"more_less_10","opts":{"step":1,"dir":"more","band":100},"minNum":10,"maxNum":50}
        ]
      },
      "B": {
        "items": [
          {"categoryId":"placevalue","skillId":"more_less_100","opts":{"step":10,"dir":"more"},"minNum":120,"maxNum":880},
          {"categoryId":"placevalue","skillId":"more_less_100","opts":{"step":10,"dir":"less"},"minNum":120,"maxNum":980},
          {"categoryId":"placevalue","skillId":"compare","opts":{"band":999,"closeness":"close"},"minNum":100},
          {"categoryId":"placevalue","skillId":"unit_form","opts":{"band":99},"minNum":50},
          {"categoryId":"placevalue","skillId":"more_less_10","opts":{"step":1,"dir":"more","band":120},"minNum":101,"maxNum":118}
        ]
      }
    },
    "wordProblem": {"ref":"@R1","want":["msMultSub","msClean"],"eqSteps":true},
    "exit": {
      "items": [
        {
          "case": "× then − (Critical Atom: Step 2 uses the Step 1 answer)",
          "ref": {
            "categoryId": "algebra",
            "skillId": "multi_step_word_plain",
            "opts": {"msOps":"mult","pictures":false,"wpCues":false,"wpBank":false,"wpFrames":true},
            "fresh": true,
            "itemSpread": true,
            "lr6Names": true,
            "dealTries": 2000,
            "allTest": "msMult",
            "instructionKey": "story-steps"
          },
          "want": ["msMultSub","msClean","msMid"],
          "detects": "Stops after Step 1, or takes away from a story number.",
          "show": "whole"
        },
        {
          "case": "÷ then +",
          "ref": {
            "categoryId": "algebra",
            "skillId": "multi_step_word_plain",
            "opts": {"msOps":"div","pictures":false,"wpCues":false,"wpBank":false,"wpFrames":true},
            "fresh": true,
            "itemSpread": true,
            "lr6Names": true,
            "dealTries": 2000,
            "allTest": "msDiv",
            "instructionKey": "story-steps"
          },
          "want": ["msDivAdd","msClean"],
          "detects": "Adds to the total, not to one share.",
          "show": "whole"
        }
      ],
      "instruction": "Read the story. Write each step. Solve.",
      "say": "Step 2 uses my Step 1 __.",
      "sayItem": 0,
      "sayAns": "answer",
      "cols": 1
    },
    "retrieval": [
      {
        "ref": {"categoryId":"multiplication","skillId":"mult_facts","opts":{"constant":[3,4],"notation":["across"],"band":100},"allTest":"factNoZeroOne"},
        "ask": "{ret.0.text}"
      },
      {"ref":{"categoryId":"division","skillId":"div_facts","opts":{"constant":[3,4],"notation":["across"]},"minNum":2,"maxNum":10},"ask":"{ret.1.text}"},
      {"ref":{"categoryId":"subtraction","skillId":"sub_facts","opts":{"band":20,"notation":["across"]}},"ask":"{ret.2.text}"}
    ],
    "checkQuestion": {
      "want": ["msMultSub","msClean","msMid"],
      "ref": {
        "categoryId": "algebra",
        "skillId": "multi_step_word_plain",
        "opts": {"msOps":"mult","msChoose":true,"pictures":false,"wpCues":false,"wpBank":false},
        "fresh": true,
        "itemSpread": true,
        "lr6Names": true,
        "dealTries": 2000
      },
      "correct": "D",
      "board": "Read the story on the board: {cq.story}"
    },
    "chunks": [
      {"id":"a","name":"Groups first: ×, then + or −"},
      {
        "id": "b",
        "name": "Share first: ÷, then + or −",
        "skill": "@R2",
        "lessonData": {
          "skills": [],
          "concepts": [],
          "vocab": [],
          "steps": [
            {"icon":"look","text":"Read it. What do I find first?"},
            {"icon":"write","text":"Step 1: share it. Divide."},
            {"icon":"decide","text":"Step 2: use my Step 1 answer."},
            {"icon":"check","text":"Write the answer and the unit."}
          ],
          "chant": "First the share. Then the change.",
          "guidedRows": 2,
          "chartWide": true,
          "chartRow": true,
          "noStripChant": true,
          "tailRead": true,
          "practiceShape": [2,1],
          "format": {"kind":"numbered steps with icons + a chant","why":"The share is the Step 1 answer; the change is done to one share, not to the total."},
          "example": {"match":"story","test":"msDivAdd"},
          "second": {"test":"msDivSub","label":"Gives away? Step 2 is −."},
          "guidedWants": ["msDivAdd","msDivSub"],
          "mixWith": []
        }
      }
    ]
  },
  "timing": {"1":5,"2":4,"3":3,"4":2,"7":3,"8":9,"9":5,"10":4,"5a":6,"6a":5,"5b":5,"6b":5,"transitions":4},
  "ranges": {"lesson":{}},
  "edgeCases": {"edgeTest":"msEdge","caseNames":{"msEdge":"the Step 2 number bigger than both Step 1 numbers"}},
  "rulings": [
    {
      "id": "family-repeats",
      "text": "A × or ÷ fact family (unordered {a, b, a·b}) and a story frame (the Step 1 total and its object noun) appear once in the pack: the chart, the Guided cells, Practice, the word problem, the exit slip, the Check Question and the spaced retrieval share one pool.",
      "field": "repeatKey"
    }
  ],
  "misconceptions": [
    {
      "id": "ms-stop-step1",
      "name": "Stops after Step 1",
      "step": 3,
      "option": "A",
      "fix": "“Is that the question? Read the last line.”",
      "caught": "Exit 1",
      "exits": [{"k":0,"label":"1","next":"“Is that the question?” Read the last line."},{"k":1,"label":"2","next":"Point to the Step 2 box."}]
    },
    {
      "id": "ms-story-number",
      "name": "Story number in Step 2",
      "step": 3,
      "option": "B",
      "fix": "Arrow: the Step 1 answer goes into Step 2.",
      "caught": "Exit 2",
      "exits": [{"k":0,"label":"1","next":"The arrow from Step 1 into Step 2."},{"k":1,"label":"2","next":"Cups: one share first, then the change."}]
    },
    {"id":"ms-one-op","name":"One sign for all","step":2,"option":"C","fix":"“How many steps?” Count the boxes."}
  ],
  "vocabulary": [
    {"word":"step","gloss":"one part of the work","diagram":{"kind":"text","text":"Step 1 → Step 2"}},
    {"word":"each","gloss":"every group has the same","diagram":{"kind":"text","text":"3 bags of 4"}},
    {"word":"left","gloss":"what stays after some go","diagram":{"kind":"text","text":"6 − 2 = 4"}}
  ],
  "story": {
    "lines": ["{wp.l0}","{wp.l1}","{wp.l2}","{wp.qShort}"],
    "answerLine": "The answer: __ {wp.unit}.",
    "say": "My Step 1 answer is __. Then I take away.",
    "sayAns": "{wp.s1}"
  },
  "hook": ["You can solve a story with one step.","Today: two steps. Step 2 uses the Step 1 answer."],
  "teach": {
    "situations": [{"id":"groups-then-change","test":"msMult"},{"id":"share-then-change","test":"msDiv"}],
    "t1Boxes": [
      {"kind":"tip","title":"Two boxes, two steps","text":"Point at the Step 1 box, then the Step 2 box, every time you read a story."},
      {"kind":"language","title":"“Each”","text":"“Each bag has 6” means every bag has 6: equal groups. Act it out with cups."},
      {
        "kind": "watch",
        "title": "A story number in Step 2",
        "text": "The mistake to stop today: Step 2 done with a story number. Draw the arrow from the Step 1 answer."
      }
    ],
    "howToTeach": [
      "Cups and counters first: the groups, then take some away or add some.",
      "Then the two step boxes: the Step 1 answer is copied into Step 2 with an arrow.",
      "Chunk 1 is × first; chunk 2 is ÷ first. Step 2 is + or − every time.",
      "Do not hunt key words: ask “What do I find first?”"
    ],
    "board": "Two boxes: Step 1 {chart.step1} → Step 2 {chart.step2}.",
    "slotRows": [{"shape":"box","use":"a step box: Step 1 or Step 2"},{"shape":"line","use":"P5: the answer on the story line"}],
    "p3Score": "Guided: not scored",
    "materials": ["Cups and counters, 6 cups and 60 counters per pair","Anchor charts 1 and 2"],
    "routeNote": "3.OA.C.7 · 3.OA.A.3 · Y2 B4 S10 Two-step problems: the lessons P0 routes back to (T6).",
    "atoms": [
      {"n":1,"type":"Fact","prereq":true,"skill":"× facts to 10 × 10","notes":"Spaced retrieval, Section 3."},
      {"n":5,"type":"Category","skill":"“Each” names Step 1","notes":"The first two lines are Step 1."},
      {"n":6,"type":"Conceptual","critical":true,"skill":"Step 1 answer: a Step 2 number","notes":"Draw the arrow into Step 2."},
      {"n":7,"type":"Comparative","skill":"Two steps or one step","notes":"Is the Step 1 answer the question?"},
      {"n":8,"type":"Category","skill":"Gives away: −. Gets more: +.","notes":"The third line is Step 2."}
    ],
    "routine": [
      {"tag":"New","check":"Guided cell 1"},
      {"step":"Step 1: the groups or the share. × or ÷.","tag":"Pre-requisite","check":"Prerequisite Check 1–2"},
      {"tag":"New","check":"Check Question; exit slip 1","critical":true},
      {"tag":"Pre-requisite","check":"Practice 1 and 2"}
    ],
    "sections": {
      "4": {"add":[{"say":"You can solve a story with one step."},{"say":"Today: two steps. Step 2 uses the Step 1 answer."}]},
      "8": {
        "add": [
          {"do":"Visit ELL and SPED pupils first, within 60 seconds."},
          {"ask":"Point to your Step 1 answer. Where did it go?","note":"Praise: “You used your Step 1 answer. That is step 3.”"}
        ],
        "boxes": [{"kind":"watch","title":"The last row","text":"Walk to the last rows first: {p4.last}."}]
      },
      "9": {"add":[{"say":"Use the two step boxes. Write Step 1, then Step 2.","note":"Expected: Step 1 [[{wp.step1}]]; Step 2 [[{wp.step2}]] {wp.unit}."}]},
      "10": {"say":"First the groups. Then the change."},
      "5a": {
        "rows": [
          {"do":"Put anchor chart 1 up. Read the story two times."},
          {"say":"What do I find first? The groups.","note":"Step 1. Show {chart.g} cups of {chart.e} counters."},
          {"say":"Step 1: {chart.step1}.","note":"Write it in the Step 1 box: [[{chart.s1}]]."},
          {"say":"Is {chart.s1} the question? No. Step 2.","note":"Read the last line again."},
          {"say":"Step 2 uses my Step 1 answer: {chart.step2}.","note":"Draw the arrow from [[{chart.s1}]] into Step 2."},
          {"ask":"{chart.question}","note":"Expected: [[{chart.whole}]] {chart.unit}."},
          {"say":"Gets more? Step 2 is +.","note":"Write on the board: {chart2.story} Step 1 [[{chart2.step1}]], Step 2 [[{chart2.step2}]]."}
        ],
        "boxes": [{"kind":"watch","title":"Step 1 is not the answer","text":"Stop on the Step 1 answer and ask: “Is that the question?”"}],
        "name": "I Do 1: groups first"
      },
      "6a": {
        "rows": [
          {"say":"Cell 1: the Step 1 sign is done in grey.","note":"Step 1 [[{we.0.step1}]]; Step 2 [[{we.0.step2}]]."},
          {"ask":"Which number goes into Step 2 first?","note":"Expected: the Step 1 answer, [[{we.0.s1}]]."},
          {"do":"Pairs do cell 2: A reads, B points to each box.","note":"Expected: [[{we.1.step1}]], then [[{we.1.step2}]] {we.1.unit}."},
          {"ask":"Cell 2: which sign is Step 2? How do you know?","note":"Expected: [[{we.1.op2}]]. The third line tells: gets more is +, gives away is −."},
          {"do":"A pupil who stops after Step 1: point to the last line.","note":"Read the question aloud together. Is the Step 1 answer the question?"},
          {"ask":"Where did your Step 1 answer go?","note":"Pupils point: the top row of Step 2."}
        ],
        "boxes": [{"kind":"feedback","title":"Fix it at once","text":"Fix: point to the Step 1 box. “Where does this number go next?”"}]
      },
      "5b": {
        "rows": [
          {"do":"Put anchor chart 2 up. Read the story two times."},
          {"say":"What do I find first? One share.","note":"Deal {b.chart.g} counters into {b.chart.e} cups."},
          {"say":"Step 1: {b.chart.step1}.","note":"Each friend has [[{b.chart.s1}]]."},
          {"say":"Step 2 uses my Step 1 answer: {b.chart.step2}.","note":"The change is to ONE share, not to {b.chart.g}."},
          {"ask":"{b.chart.question}","note":"Expected: [[{b.chart.whole}]] {b.chart.unit}."}
        ],
        "boxes": [{"kind":"language","title":"“Shares equally”","text":"Act it out: deal the counters one at a time into the cups."}],
        "name": "I Do 2: share first"
      },
      "6b": {
        "rows": [
          {"say":"Cell 1: share first.","note":"Step 1 [[{b.we.0.step1}]]; Step 2 [[{b.we.0.step2}]]."},
          {"do":"Pupils do cell 2 on their own.","note":"Expected: [[{b.we.1.step1}]], then [[{b.we.1.step2}]]."}
        ],
        "boxes": [{"kind":"feedback","title":"Change to the total","text":"A pupil who changes the total: “Is that one friend’s share?”"}]
      }
    },
    "loop": {"half":"Redo one story with cups and counters, then two more.","fewer":"Stop. Cups again with two stories. Point to each step box."},
    "accepted": [
      "Step 1 for groups may be written either way round: 4 × 6 or 6 × 4.",
      "The unit word is from the bank; a missing unit with the right number: ask for it.",
      "P5: any drawing that shows the groups and the change, and both steps written.",
      "Step 1 right and Step 2 a slip of one: not yet right; ask the pupil to check Step 2."
    ]
  },
  "open": [
    {
      "id": "retrieval-band",
      "q": "Spaced retrieval 3 asks subtraction:sub_facts with band 100, which the skill does not offer (5, 10, 12, 15, 20).",
      "suggested": "band 20",
      "answer": "band 20: subtraction facts within 20 (the Step 2 take-aways of the lesson are within 20 too).",
      "rule": "skill-options.js schema of sub_facts; CLAUDE.md \"within N bounds the answer\""
    },
    {
      "id": "d3-p5-steps",
      "q": "Section 9 said \"No step boxes this time\" over a P5 that prints the Step 1 / Step 2 boxes (compiler: script vs page).",
      "suggested": "say what the page prints",
      "answer": "\"Use the two step boxes. Write Step 1, then Step 2.\"",
      "rule": "critic r1 D3: a script never contradicts its page (ws-lesson-card script-vs-page check)"
    },
    {
      "id": "d2-family",
      "q": "Fact families and story frames repeat across the pack (critic r1 D2: 20 ÷ 4 / 20 ÷ 5 marbles, 6 × 4 / 24 ÷ 6 / 24 buttons).",
      "suggested": "ruling family-repeats",
      "answer": "ruling family-repeats: the compiled description carries repeatKey {family: unordered, frame: true} on the pack and on every ref.",
      "rule": "LESSON_RULES LR-5 (one item once a pack), keyed by the unordered × / ÷ family plus the story frame"
    }
  ],
  "needs": [
    {
      "kind": "option",
      "skill": "algebra:multi_step_word_plain",
      "option": "pictures",
      "match": "option \"pictures\" is not in algebra:multi_step_word_plain's schema",
      "why": "the passed pack sets it; skill-options.js has no schema entry (add it, or rule it inert and drop it)"
    },
    {
      "kind": "option",
      "skill": "multiplication:mult_word_problems_plain",
      "option": "pictures",
      "match": "option \"pictures\" is not in multiplication:mult_word_problems_plain's schema",
      "why": "the passed pack sets it; skill-options.js has no schema entry (add it, or rule it inert and drop it)"
    },
    {
      "kind": "option",
      "skill": "division:div_word_problems_plain",
      "option": "pictures",
      "match": "option \"pictures\" is not in division:div_word_problems_plain's schema",
      "why": "the passed pack sets it; skill-options.js has no schema entry (add it, or rule it inert and drop it)"
    },
    {
      "kind": "option",
      "skill": "division:div_facts",
      "option": "notation",
      "match": "option \"notation\" is not in division:div_facts's schema",
      "why": "the passed pack sets it; skill-options.js has no schema entry (add it, or rule it inert and drop it)"
    },
    {
      "kind": "misconception",
      "id": "ms-stop-step1",
      "match": "misconception \"ms-stop-step1\"",
      "why": "the provider's wrongAnswers return it, its `misconceptions` list does not declare it"
    },
    {
      "kind": "misconception",
      "id": "ms-story-number",
      "match": "misconception \"ms-story-number\"",
      "why": "the provider's wrongAnswers return it, its `misconceptions` list does not declare it"
    },
    {
      "kind": "misconception",
      "id": "ms-one-op",
      "match": "misconception \"ms-one-op\"",
      "why": "the provider's wrongAnswers return it, its `misconceptions` list does not declare it"
    }
  ]
}
```

Decided: lf-engine, 2026-11-07
