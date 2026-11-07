# Lesson card: I Can find the rule in a table

**Lesson** `G3|-|findtheruleinaninputoutputtable` · **Unit** G3-Y4.B4 · **Grade** 3 · **CCSS** 3.OA.D.9 · **EE** M.EE.3.OA.8 · **Shape** `rule-table`

Seeded by `node tests/scripts/ws-lesson-card.mjs --from-detailed` from the passed hand-written lesson (the E4 proof set).
The machine block at the end is the source of truth (`design/lessons/cards/README.md`); this summary is for reading. The
lane decides every open question (its `answer` and the `rule` it rests on) and closes the card with `Decided: lf-<lane>, <date>`.

## Parts (skill + options)

| Part | Skill | Options and floors |
|---|---|---|
| P0 question 1 → 2.OA.B.2 Add within 20 | `addition:add_facts` | {"opts":{"band":20},"minNum":11,"maxNum":19} |
| P0 question 2 → 2.OA.B.2 Subtract within 20 | `subtraction:sub_facts` | {"opts":{"band":20},"minNum":3,"maxNum":10} |
| P0 question 3 → 3.OA.C.7 Multiply by 2, 3, 5 and 10 | `multiplication:mult_facts` | {"opts":{"constant":[2,3,5,10]},"minNum":20,"allTest":"factTen"} |
| P2-P4 lesson skill | `algebra:function_table_easy` | {"opts":{"ftTask":"rule","ftRules":["+","-","x"],"band":50,"ftTable":31,"support":"frame","ftFactors":"2-3-5-10"},"allTest":"ftLessonAny"} |
| P4 Practice 1 | @R1 |  |
| P4 Practice 2 | @R1 |  |
| P1 band A row 1 | `placevalue:more_less_10` | {"opts":{"step":1,"dir":"less","band":100},"minNum":11,"maxNum":50} |
| P1 band A row 2 | `placevalue:more_less_10` | {"opts":{"step":10,"dir":"more","band":100},"minNum":10,"maxNum":60} |
| P1 band A row 3 | `placevalue:compare` | {"opts":{"band":99,"closeness":"far"}} |
| P1 band A row 4 | `placevalue:unit_form` | {"opts":{"band":99},"maxNum":50} |
| P1 band A row 5 | `placevalue:more_less_10` | {"opts":{"step":10,"dir":"less","band":100},"minNum":20,"maxNum":60} |
| P1 band B row 1 | `placevalue:more_less_10` | {"opts":{"step":1,"dir":"less","band":120},"minNum":102,"maxNum":119} |
| P1 band B row 2 | `placevalue:more_less_100` | {"opts":{"step":10,"dir":"more"},"minNum":120,"maxNum":880} |
| P1 band B row 3 | `placevalue:compare` | {"opts":{"band":999,"closeness":"close"},"minNum":100} |
| P1 band B row 4 | `placevalue:unit_form` | {"opts":{"band":99},"minNum":50} |
| P1 band B row 5 | `placevalue:more_less_100` | {"opts":{"step":10,"dir":"less"},"minNum":120,"maxNum":980} |
| P5 word problem | `algebra:function_table_easy` | {"opts":{"ftTask":"rule","ftRules":["+"],"band":50,"ftTable":31,"support":"frame-bare","ftFactors":"2-3-5-10"}} |
| P6 exit 1: a + rule | `algebra:function_table_easy` | {"opts":{"ftTask":"rule","ftRules":["+"],"band":50,"ftTable":31,"support":"frame-bare","ftFactors":"2-3-5-10"},"cellPayload":{"ruleBelow":true},"ftRuleMax":1,"d |
| P6 exit 2: a − rule | `algebra:function_table_easy` | {"opts":{"ftTask":"rule","ftRules":["-"],"band":50,"ftTable":31,"support":"frame-bare","ftFactors":"2-3-5-10"},"cellPayload":{"ruleBelow":true},"ftRuleMax":1,"d |
| P6 exit 3: a × rule, row 1 also fits + (Critical Atom) | `algebra:function_table_easy` | {"opts":{"ftTask":"rule","ftRules":["x"],"band":50,"ftTable":31,"support":"frame-bare","ftFactors":"2-3-5-10"},"cellPayload":{"ruleBelow":true}} |
| Spaced retrieval 1 | `multiplication:mult_facts` | {"opts":{"constant":[2,3,5,10]}} |
| Spaced retrieval 2 | `subtraction:sub_facts` | {"opts":{"band":20}} |
| Spaced retrieval 3 | `placevalue:more_less_10` | {"opts":{"step":10,"dir":"more","band":100},"maxNum":89} |
| Check Question (ftTimes, right C) | `algebra:function_table_easy` | {"opts":{"ftTask":"rule","ftRules":["x"],"band":50,"ftTable":31,"support":"frame","ftFactors":"2-3-5-10"},"ftRuleMax":2,"dealTries":3000} |

Hand-written lines (story, hook, teaching notes, mistakes' words): **98**.

## Open questions

None.

## Machine block

```json lesson-card
{
  "format": "lesson-card/1",
  "id": "g3-oa9-input-output-rule",
  "lesson": "G3|-|findtheruleinaninputoutputtable",
  "unit": "G3-Y4.B4",
  "title": "I Can find the rule in a table",
  "grade": "3",
  "level": 3,
  "strand": "Algebra",
  "ccss": ["3.OA.D.9"],
  "ee": ["M.EE.3.OA.8"],
  "eeNote": "owner list (DLM v4) vs repo EE set",
  "eeOwnerList": ["M.EE.3.OA.9"],
  "followOn": [
    {"title":"Input-output stories: find the rule","skill":"algebra:function_table_story","opts":{},"ccss":"3.OA.D.9"},
    {"title":"Find the missing In number","skill":"algebra:function_table_easy","opts":{"ftTask":"inputs"},"ccss":"4.OA.C.5"}
  ],
  "cra": "Concrete → Pictorial",
  "flowNote": "One chunk: + rules, then − rules, then × rules; test every row.",
  "shape": "rule-table",
  "fns": {"cqShow":"ruleAsWritten","chartSay":"ruleInOut","answerShow":"ruleAsWritten"},
  "refs": {
    "R1": {
      "categoryId": "algebra",
      "skillId": "function_table_easy",
      "opts": {"ftTask":"rule","ftRules":["+","-","x"],"band":50,"ftTable":41,"support":"frame-bare","ftFactors":"2-3-5-10"},
      "allTest": "ftPracticeAny"
    }
  },
  "parts": {
    "lesson": {
      "categoryId": "algebra",
      "skillId": "function_table_easy",
      "opts": {"ftTask":"rule","ftRules":["+","-","x"],"band":50,"ftTable":31,"support":"frame","ftFactors":"2-3-5-10"},
      "allTest": "ftLessonAny"
    },
    "prereqs": [
      {
        "ref": {"categoryId":"addition","skillId":"add_facts","opts":{"band":20},"minNum":11,"maxNum":19},
        "items": 4,
        "lesson": {"id":"2.OA.B.2","title":"Add within 20"},
        "atom": {"n":1,"type":"Fact","skill":"Add facts to 20","notes":"Find a change fast. Prerequisite Check {pre.0.letters}."}
      },
      {
        "ref": {"categoryId":"subtraction","skillId":"sub_facts","opts":{"band":20},"minNum":3,"maxNum":10},
        "items": 4,
        "lesson": {"id":"2.OA.B.2","title":"Subtract within 20"},
        "atom": {"n":2,"type":"Fact","skill":"Subtract facts to 20"}
      },
      {
        "ref": {"categoryId":"multiplication","skillId":"mult_facts","opts":{"constant":[2,3,5,10]},"minNum":20,"allTest":"factTen"},
        "items": 4,
        "lesson": {"id":"3.OA.C.7","title":"Multiply by 2, 3, 5 and 10"},
        "atom": {"n":3,"type":"Fact","skill":"×2, ×3, ×5, ×10 facts"}
      }
    ],
    "chart": {
      "concepts": [{"id":"every","text":"The rule must work for every row."},{"id":"across","text":"Read across: In, then Out."}],
      "vocab": [
        {"word":"In","meaning":"the number that goes in","picture":{"kind":"text","text":"4 →"}},
        {"word":"Out","meaning":"the number that comes out","picture":{"kind":"text","text":"→ 7"}},
        {"word":"rule","meaning":"what the machine does to every number","picture":{"kind":"text","text":"4 → + 3 → 7"}}
      ],
      "steps": [
        {"icon":"look","text":"Read rows 1 and 2 across."},
        {"icon":"decide","text":"Bigger or smaller? By how much?"},
        {"icon":"check","text":"Test every row."},
        {"icon":"write","text":"Write the rule."}
      ],
      "chant": "",
      "chartEqualRows": true,
      "format": {
        "kind": "numbered steps with icons",
        "why": "The step pupils skip is step 3: a rule read off row 1 alone. The × example (the last panel) shows it failing."
      },
      "example": {"match":"Test","test":"ftAdd"},
      "second": {"test":"ftSub","label":"Out smaller? Try −."},
      "third": {"test":"ftTimesTrap","label":"+ fails on row 2? Try ×."}
    },
    "weDo": {"guidedRows":3,"growAll":true,"guided":["ftAdd","ftSub","ftTimes"],"practiceShape":[4,2]},
    "practice": {
      "pages": 2,
      "sheets": [
        {"steps":true,"skill":"@R1","shape":[4,2],"edgeLast":{"per":4,"cols":2,"wants":["ftTimes","ftSubZero"]}},
        {"steps":true,"skill":"@R1","shape":[4,2],"edgeLast":{"per":4,"cols":2,"wants":["ftSubZero","ftTimes"]}}
      ],
      "edgeTest": "ftEdge",
      "edgeOnlyLast": "ftTimes",
      "fadeMeans": [
        ["★","Guided: the machine picture and the Steps; the teacher leads"],
        ["★★","Practice: Steps only, no machine picture"],
        ["★★★","Last row: a × table (row 1 also fits +) and a − table with an Out of 0"]
      ]
    },
    "mixed": null,
    "numberSense": {
      "A": {
        "items": [
          {"categoryId":"placevalue","skillId":"more_less_10","opts":{"step":1,"dir":"less","band":100},"minNum":11,"maxNum":50},
          {"categoryId":"placevalue","skillId":"more_less_10","opts":{"step":10,"dir":"more","band":100},"minNum":10,"maxNum":60},
          {"categoryId":"placevalue","skillId":"compare","opts":{"band":99,"closeness":"far"}},
          {"categoryId":"placevalue","skillId":"unit_form","opts":{"band":99},"maxNum":50},
          {"categoryId":"placevalue","skillId":"more_less_10","opts":{"step":10,"dir":"less","band":100},"minNum":20,"maxNum":60}
        ]
      },
      "B": {
        "items": [
          {"categoryId":"placevalue","skillId":"more_less_10","opts":{"step":1,"dir":"less","band":120},"minNum":102,"maxNum":119},
          {"categoryId":"placevalue","skillId":"more_less_100","opts":{"step":10,"dir":"more"},"minNum":120,"maxNum":880},
          {"categoryId":"placevalue","skillId":"compare","opts":{"band":999,"closeness":"close"},"minNum":100},
          {"categoryId":"placevalue","skillId":"unit_form","opts":{"band":99},"minNum":50},
          {"categoryId":"placevalue","skillId":"more_less_100","opts":{"step":10,"dir":"less"},"minNum":120,"maxNum":980}
        ]
      }
    },
    "wordProblem": {
      "ref": {
        "categoryId": "algebra",
        "skillId": "function_table_easy",
        "opts": {"ftTask":"rule","ftRules":["+"],"band":50,"ftTable":31,"support":"frame-bare","ftFactors":"2-3-5-10"}
      },
      "want": "ftAdd",
      "tableItem": true,
      "panelRows": [
        {"icon":"read","text":"Read it two times."},
        {"icon":"ringnum","text":"Circle the numbers."},
        {"icon":"underline","text":"Underline the question."},
        {"icon":"read","text":"Read the table."},
        {"icon":"check","text":"Test every row."},
        {"icon":"write","text":"Write the rule."}
      ],
      "topMm": 112
    },
    "exit": {
      "items": [
        {
          "case": "a + rule",
          "ref": {
            "categoryId": "algebra",
            "skillId": "function_table_easy",
            "opts": {"ftTask":"rule","ftRules":["+"],"band":50,"ftTable":31,"support":"frame-bare","ftFactors":"2-3-5-10"},
            "cellPayload": {"ruleBelow":true},
            "ftRuleMax": 1,
            "dealTries": 3000
          },
          "want": ["ftAdd","ftSpread"],
          "cols": 3,
          "instr": "Find the rule. Write the rule.",
          "detects": "Reads down the Out column: the gap between Outs.",
          "show": "rule"
        },
        {
          "case": "a − rule",
          "ref": {
            "categoryId": "algebra",
            "skillId": "function_table_easy",
            "opts": {"ftTask":"rule","ftRules":["-"],"band":50,"ftTable":31,"support":"frame-bare","ftFactors":"2-3-5-10"},
            "cellPayload": {"ruleBelow":true},
            "ftRuleMax": 1,
            "dealTries": 3000
          },
          "want": ["ftSub","ftSpread"],
          "cols": 3,
          "instr": "Find the rule. Write the rule.",
          "detects": "Sign flipped: + when Out is smaller.",
          "show": "rule"
        },
        {
          "case": "a × rule, row 1 also fits + (Critical Atom)",
          "ref": {
            "categoryId": "algebra",
            "skillId": "function_table_easy",
            "opts": {"ftTask":"rule","ftRules":["x"],"band":50,"ftTable":31,"support":"frame-bare","ftFactors":"2-3-5-10"},
            "cellPayload": {"ruleBelow":true}
          },
          "want": "ftTimes",
          "cols": 3,
          "instr": "Find the rule. Write the rule.",
          "detects": "One pair only: + read off row 1, never tested on row 2.",
          "show": "rule"
        }
      ],
      "instruction": "Find the rule. Write the rule.",
      "say": "I test every row. Then I write the rule."
    },
    "retrieval": [
      {"ref":{"categoryId":"multiplication","skillId":"mult_facts","opts":{"constant":[2,3,5,10]}},"ask":"{ret.0.text}"},
      {"ref":{"categoryId":"subtraction","skillId":"sub_facts","opts":{"band":20}},"ask":"{ret.1.text}"},
      {"ref":{"categoryId":"placevalue","skillId":"more_less_10","opts":{"step":10,"dir":"more","band":100},"maxNum":89},"ask":"{ret.2.text}"}
    ],
    "checkQuestion": {
      "want": "ftTimes",
      "ref": {
        "categoryId": "algebra",
        "skillId": "function_table_easy",
        "opts": {"ftTask":"rule","ftRules":["x"],"band":50,"ftTable":31,"support":"frame","ftFactors":"2-3-5-10"},
        "ftRuleMax": 2,
        "dealTries": 3000
      },
      "correct": "C",
      "board": "Write the table on the board: {cq.rows}."
    }
  },
  "timing": {"1":5,"2":5,"3":3,"4":1,"5":10,"6":8,"7":3,"8":12,"9":5,"10":4,"transitions":4},
  "ranges": {"lesson":{"band":50}},
  "edgeCases": {"edgeTest":"ftEdge","caseNames":{"ftTimes":"a × rule: row 1 also fits +","ftSubZero":"a − rule with an Out of 0","ftSub":"a − rule","ftAdd":"a + rule"}},
  "rulings": [],
  "misconceptions": [
    {"id":"add-for-times","name":"One pair only","step":3,"option":"A","looks":"{cq.A} for {cq.rows}","fix":"Test row 2 aloud."},
    {"id":"neighbour-outputs","name":"Down the Out column","step":1,"option":"B","looks":"{cq.B} for {cq.rows}","fix":"Reading strip: one row across."},
    {
      "id": null,
      "name": "Sign flipped",
      "step": 2,
      "looks": "+ {exit.1.k} for {exit.1.rows}",
      "fix": "“Bigger or smaller?”",
      "caught": "Exit b · Practice 1 and 2 − tables"
    }
  ],
  "vocabulary": [
    {"word":"In","gloss":"the number that goes in","diagram":{"kind":"text","text":"4 →"}},
    {"word":"Out","gloss":"the number that comes out","diagram":{"kind":"text","text":"→ 7"}},
    {"word":"rule","gloss":"what the machine does to every number","diagram":{"kind":"text","text":"4 → + 3 → 7"}}
  ],
  "story": {
    "instruction": "Find the rule. Write the rule.",
    "lines": [
      "When Ben is {wp.x1}, Ann is {wp.y1}.",
      "When Ben is {wp.x2}, Ann is {wp.y2}.",
      "When Ben is {wp.x3}, Ann is {wp.y3}.",
      "What is the rule from Ben to Ann?"
    ],
    "answerLine": "",
    "say": "I tested every row. The rule is __.",
    "sayAns": "{wp.rule}"
  },
  "hook": ["Yesterday each times row went up by the same number.","Today the machine has a rule. We find it."],
  "teach": {
    "t1Boxes": [
      {"kind":"tip","title":"Read across","text":"Read a row across, In then Out. Never down the Out column."},
      {"kind":"language","title":"Say the rule","text":"Pupils write a sign and a number. They SAY “add 3” or “times 2”."},
      {"kind":"watch","title":"One row is not enough","text":"2 → 4 fits + 2 and × 2. Test every row, aloud."}
    ],
    "howToTeach": "Feed cards through the rule machine first. Model + (the change is plain), then −, then a × table where “+ the change” fails on row 2: the failure is the lesson. Say the test aloud on every row.",
    "board": "The In / Out table {chart3.rows}. Write “Wrong” beside + {chart3.d}.",
    "slotRows": [{"shape":"rule frame","use":"the sign in the circle, the number in the box"}],
    "materials": ["A paper “rule machine” box with In and Out slots","Number cards 1 to 50","Reading strips (card to cover the other rows)"],
    "atoms": [
      {"n":4,"type":"Category","skill":"In and Out: each row is a pair","notes":"Read across, not down."},
      {"n":5,"type":"Comparative","skill":"Bigger or smaller","notes":"Out bigger: + or ×. Out smaller: −."},
      {"n":6,"type":"Conceptual","critical":true,"skill":"Test every row","notes":"A rule from one row may be wrong (2 → 4)."},
      {"n":7,"type":"Comparative","skill":"+ or ×","notes":"+ fails on row 2? Try ×."},
      {"n":8,"type":"Category","skill":"An Out of 0","notes":"In = the number taken away: Out is 0. Test that row too."}
    ],
    "routine": [
      {"tag":"New","check":"“Point to In. Point to Out.”"},
      {"step":"Find the change: bigger or smaller, by how much.","tag":"Pre-requisite","check":"Prerequisite Check: add and subtract"},
      {"step":"Test the rule on every row.","tag":"New","check":"Check Question; exit slip c","critical":true},
      {"step":"Write the sign in the circle, the number in the box.","tag":"Pre-requisite","check":"Guided cell 2"}
    ],
    "sections": {
      "2": {"add":[{"ask":"{ns.B.1.text}","note":"Expected: [[{ns.B.1.ans}]]."}]},
      "4": {"add":[{"say":"Yesterday each times row went up by the same number."},{"say":"Today the machine has a rule. We find it."}]},
      "5": {
        "rows": [
          {"do":"Feed card {chart.x1} into the rule machine. Show {chart.y1}."},
          {"say":"In {chart.x1}, out {chart.y1}. It got bigger.","note":"Step 1 and step 2."},
          {"ask":"Bigger by how much?","note":"Expected: [[{chart.d}]]."},
          {"say":"Test every row: {chart.x2} {chart.sign} {chart.k} is {chart.y2}.","note":"Step 3. Then row 3. The rule: [[{chart.rule}]]."},
          {"say":"In {chart2.x1}, out {chart2.y1}. It got smaller.","note":"Panel {panel.second}. The rule: [[{chart2.rule}]]."},
          {"say":"In {chart3.x1}, out {chart3.y1}. Plus {chart3.d}? Test row 2.","note":"Panel {panel.third}: the trap."},
          {"say":"{chart3.x2} plus {chart3.d} is {chart3.plus}. Not {chart3.y2}. Try times.","note":"Write “Wrong” beside + {chart3.d} on the board only."},
          {"say":"The rule is {chart3.word} {chart3.k}. It works for every row.","note":"Pupils repeat. The rule: [[{chart3.rule}]]."}
        ],
        "boxes": [{"kind":"watch","title":"The nodders","text":"Pupils who nod at + {chart3.d} on panel {panel.third} are the one-pair group."}]
      },
      "6": {
        "rows": [
          {"say":"Look at {we.0.rows}. Read row 1 across with me."},
          {"ask":"Bigger or smaller? By how much?","note":"Expected ★: [[{we.0.rule}]]."},
          {"do":"Pairs do {we.1.rows}: A reads a row, B tests it.","note":"Expected ★: [[{we.1.rule}]]."},
          {"ask":"Cell 2: is Out bigger or smaller?","note":"Smaller, so −. Expected: [[{we.1.rule}]]."},
          {"say":"If Out is 0, In is the number taken away.","note":"The ★★★ rows have one Out of 0. Test it like any row."},
          {"say":"In ___, out ___. The rule is ___.","note":"The Say frame, for every row."},
          {"do":"Cell 3, {we.2.rows}: test + {we.2.d} on row 2 together.","note":"It fails. Expected ★: [[{we.2.rule}]]."}
        ],
        "boxes": [{"kind":"feedback","title":"Fix it at once","text":"Fix: cover the other rows with the strip. “Test this row.”"}]
      },
      "8": {
        "add": [
          {"say":"{p4.steps}"},
          {"ask":"Does it work on row 3?","note":"Visit the one-pair group first."},
          {"do":"Practice 2: the same steps. Read each row across.","note":"Look for the gap between Outs written as the rule."}
        ]
      },
      "9": {
        "add": [
          {"ask":"Ben is In, Ann is Out. Bigger or smaller?","note":"Bigger: try +. The table is printed under the story."},
          {"ask":"What is the rule? Test every row.","note":"Expected: [[{wp.rule}]]: Ann is always {wp.k} years older."}
        ]
      },
      "10": {"say":"The rule must work for every row."}
    },
    "loop": {"half":"Reteach “test every row” with the machine, then two more.","fewer":"Stop. Feed {chart3.x2} through the machine. Test + {chart3.d} together."},
    "accepted": [
      "The sign written + or “add”; × written x.",
      "One-step rules only: “+ 2 then …” is not the answer.",
      "Said aloud: “add 3”, “plus 3” and “3 more” are all right.",
      "The number in the box with no sign in the circle: not yet right; ask “add or take away?”.",
      "A right rule with no rows tested: right; ask the pupil to test it aloud."
    ],
    "wrongAnswers": [
      {"wrote":"{exit.2.wrong.addfortimes} for {exit.2.rows}","mistake":"One pair only","next":"Test row 2 aloud."},
      {"wrote":"{exit.0.wrong.neighbouroutputs} for {exit.0.rows}","mistake":"Down the Out column","next":"Reading strip: one row across."},
      {"wrote":"+ {exit.1.k} for {exit.1.rows}","mistake":"Sign flipped","next":"“Bigger or smaller?” first."},
      {"wrote":"{we.0.wrong.neighbouroutputs} for {we.0.rows} (Guided 1)","mistake":"Down the Out column","next":"Cover the rows; read row 1 across."},
      {"wrote":"{we.1.wrong.signflip} for {we.1.rows} (Guided 2)","mistake":"Sign flipped","next":"Point: is Out smaller? Then −."},
      {"wrote":"{we.2.wrong.addfortimes} for {we.2.rows} (Guided 3)","mistake":"One pair only","next":"Test it on row 2 together."},
      {"wrote":"{cq.wrong.neighbouroutputs} for {cq.rows} (Check Question)","mistake":"Down the Out column","next":"Cover the rows; read one across."},
      {"wrote":"{wp.wrong.neighbouroutputs} for the story (Word problem)","mistake":"Down the Out column","next":"Read Ben, then Ann, one row."}
    ]
  },
  "open": []
}
```

Decided: lf-engine, 2026-11-07
