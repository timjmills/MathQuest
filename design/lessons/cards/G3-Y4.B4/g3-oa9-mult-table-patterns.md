# Lesson card: I Can find even products

**Lesson** `G3|-|patternsonthemultiplicationtable` · **Unit** G3-Y4.B4 · **Grade** 3 · **CCSS** 3.OA.D.9, 3.OA.C.7 · **EE** M.EE.3.OA.8 · **Shape** `table-pattern`

Seeded by `node tests/scripts/ws-lesson-card.mjs --from-detailed` from the passed hand-written lesson (the E4 proof set).
The machine block at the end is the source of truth (`design/lessons/cards/README.md`); this summary is for reading. The
lane decides every open question (its `answer` and the `rule` it rests on) and closes the card with `Decided: lf-<lane>, <date>`.

## Parts (skill + options)

| Part | Skill | Options and floors |
|---|---|---|
| P0 question 1 → 2.OA.C.3 Even numbers: count by 2s | `multiplication:count_by_tables` | {"opts":{"rows":[{"step":2,"start":"step","dir":"up"}],"fill":"two","times":"none","missing":20}} |
| P0 question 2 → 3.OA.C.7 Multiply by 2 and 4 | `multiplication:mult_facts` | {"opts":{"constant":[2,4],"notation":["stacked"],"band":100},"minNum":12,"maxNum":36} |
| P0 question 3 → 3.OA.C.7 Read the multiplication chart | `multiplication:mult_chart` | {"allTest":"chartIn9","allHard":true,"gridApart":true,"opts":{"chart":"window","band":100,"task":"fill","minFactor":2,"winRows":2,"winCols":3},"gridRevisit":tru |
| P2-P4 lesson skill | `multiplication:mult_chart` | {"allTest":"chartFresh","allHard":true,"gridApart":true,"opts":{"chart":"window","band":144,"task":"even","minFactor":2,"winRows":2,"winCols":4},"tries":600} |
| P4 Practice 1 | `multiplication:mult_chart` | {"allTest":"chartFresh","allHard":true,"gridApart":true,"opts":{"chart":"window","band":144,"task":"even","minFactor":2,"winRows":2,"winCols":3},"tries":600,"gr |
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
| P5 word problem | `multiplication:mult_facts` | {"opts":{"constant":[4,6,8],"notation":["stacked"],"band":100}} |
| P6 exit 1: an even row (odd columns) | @R1 |  |
| P6 exit 2: the odd row: its even column (Critical Atom) | @R1 |  |
| P6 exit 3: odd x odd stays white | @R1 |  |
| Spaced retrieval 1 | `multiplication:mult_facts` | {"opts":{"constant":[5],"notation":["stacked"],"band":100}} |
| Spaced retrieval 2 | `multiplication:mult_facts` | {"opts":{"constant":[2],"notation":["stacked"],"band":100}} |
| Spaced retrieval 3 | `multiplication:mult_facts` | {"opts":{"constant":[3,7],"notation":["stacked"],"band":100}} |
| Check Question (chartMixed,chartRowOnly, right C) | `multiplication:mult_chart` | {"allTest":"chartFresh","allHard":true,"gridApart":true,"opts":{"chart":"window","band":144,"task":"even","minFactor":2,"winRows":2,"winCols":3},"gridFresh":tru |

Hand-written lines (story, hook, teaching notes, mistakes' words): **97**.

## Open questions

None.

## Machine block

```json lesson-card
{
  "format": "lesson-card/1",
  "id": "g3-oa9-mult-table-patterns",
  "lesson": "G3|-|patternsonthemultiplicationtable",
  "unit": "G3-Y4.B4",
  "title": "I Can find even products",
  "grade": "3",
  "level": 3,
  "strand": "Operations",
  "ccss": ["3.OA.D.9","3.OA.C.7"],
  "ee": ["M.EE.3.OA.8"],
  "eeNote": "owner list (DLM v4) vs repo EE set",
  "eeOwnerList": ["M.EE.3.OA.9"],
  "cra": "Concrete → Pictorial",
  "flowNote": "One chunk: one even row or column number makes the product even.",
  "shape": "table-pattern",
  "fns": {"lastName":"chartTraps"},
  "refs": {
    "R1": {
      "categoryId": "multiplication",
      "skillId": "mult_chart",
      "allTest": "chartFresh",
      "allHard": true,
      "gridApart": true,
      "opts": {"chart":"window","band":144,"task":"even","minFactor":2,"winRows":2,"winCols":3},
      "pageGroup": "exit",
      "gridFresh": true
    }
  },
  "parts": {
    "lesson": {
      "categoryId": "multiplication",
      "skillId": "mult_chart",
      "allTest": "chartFresh",
      "allHard": true,
      "gridApart": true,
      "opts": {"chart":"window","band":144,"task":"even","minFactor":2,"winRows":2,"winCols":4},
      "tries": 600
    },
    "prereqs": [
      {
        "ref": {
          "categoryId": "multiplication",
          "skillId": "count_by_tables",
          "opts": {"rows":[{"step":2,"start":"step","dir":"up"}],"fill":"two","times":"none","missing":20}
        },
        "items": 1,
        "lesson": {"id":"2.OA.C.3","title":"Even numbers: count by 2s"},
        "atom": {"n":1,"type":"Category","skill":"Even numbers: the count by 2s (2, 4, 6, 8 ...)"}
      },
      {
        "ref": {"categoryId":"multiplication","skillId":"mult_facts","opts":{"constant":[2,4],"notation":["stacked"],"band":100},"minNum":12,"maxNum":36},
        "items": 4,
        "lesson": {"id":"3.OA.C.7","title":"Multiply by 2 and 4"},
        "atom": {"n":2,"type":"Fact","skill":"Facts of 2 and 4: 4 × n is 2 × n twice"}
      },
      {
        "ref": {
          "categoryId": "multiplication",
          "skillId": "mult_chart",
          "allTest": "chartIn9",
          "allHard": true,
          "gridApart": true,
          "opts": {"chart":"window","band":100,"task":"fill","minFactor":2,"winRows":2,"winCols":3},
          "gridRevisit": true
        },
        "items": 2,
        "lesson": {"id":"3.OA.C.7","title":"Read the multiplication chart"},
        "atom": {"n":3,"type":"Fact","skill":"Read the chart: row meets column"}
      }
    ],
    "chart": {
      "concepts": [{"id":"even","text":"An even row or column: the product is even."},{"id":"odd","text":"Both numbers odd: the product is odd."}],
      "vocab": [
        {"word":"even","meaning":"makes pairs, none left over","picture":{"kind":"text","text":"●● ●● ●●"}},
        {"word":"odd","meaning":"one is left over","picture":{"kind":"text","text":"●● ●● ●● ●"}},
        {"word":"product","meaning":"the answer when you multiply","picture":{"kind":"fact","a":4,"b":3}}
      ],
      "steps": [
        {"icon":"look","text":"Shade the even rows."},
        {"icon":"decide","text":"Shade the even columns too."},
        {"icon":"write","text":"Both odd? Leave it white."}
      ],
      "chant": "",
      "format": {"kind":"numbered steps with icons","why":"The step pupils break is step 2: they look at the row only."},
      "example": {"test":"chartExample"}
    },
    "weDo": {
      "guidedRows": 2,
      "growAll": true,
      "practiceShape": [4,2],
      "guided": ["chartMixed","chartMixed"],
      "guidedWants": ["chartMixed","chartMixed"],
      "independent": ["chartMixed","chartMixed"]
    },
    "practice": {
      "pages": 1,
      "sheets": [
        {
          "steps": true,
          "skill": {
            "categoryId": "multiplication",
            "skillId": "mult_chart",
            "allTest": "chartFresh",
            "allHard": true,
            "gridApart": true,
            "opts": {"chart":"window","band":144,"task":"even","minFactor":2,"winRows":2,"winCols":3},
            "tries": 600,
            "gridRevisit": true
          },
          "shape": [6,2],
          "edgeLast": {"per":6,"cols":2,"first":true,"wants":["chartEdge","chartEdge"]}
        }
      ],
      "edgeTest": "chartEdge"
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
    "wordProblem": {"ref":{"categoryId":"multiplication","skillId":"mult_facts","opts":{"constant":[4,6,8],"notation":["stacked"],"band":100}},"want":"bigSecond"},
    "exit": {
      "items": [
        {
          "case": "an even row (odd columns)",
          "ref": "@R1",
          "want": ["chartColsOdd","chartIn9"],
          "cols": 1,
          "group": "a",
          "detects": "Misses the even row.",
          "show": "shaded"
        },
        {
          "case": "the odd row: its even column (Critical Atom)",
          "ref": "@R1",
          "want": ["chartMixed","chartRowOnly"],
          "cols": 2,
          "group": "bc",
          "detects": "Leaves an even column white.",
          "show": "shaded"
        },
        {"case":"odd x odd stays white","ref":"@R1","want":"chartOddOdd","cols":2,"group":"bc","detects":"Shades an odd × odd box.","show":"shaded"}
      ],
      "instruction": "Shade every even product."
    },
    "retrieval": [
      {"ref":{"categoryId":"multiplication","skillId":"mult_facts","opts":{"constant":[5],"notation":["stacked"],"band":100}},"ask":"{ret.0.text}"},
      {"ref":{"categoryId":"multiplication","skillId":"mult_facts","opts":{"constant":[2],"notation":["stacked"],"band":100}},"ask":"{ret.1.text}"},
      {"ref":{"categoryId":"multiplication","skillId":"mult_facts","opts":{"constant":[3,7],"notation":["stacked"],"band":100}},"ask":"{ret.2.text}"}
    ],
    "checkQuestion": {
      "want": ["chartMixed","chartRowOnly"],
      "first": true,
      "correct": "C",
      "ref": {
        "categoryId": "multiplication",
        "skillId": "mult_chart",
        "allTest": "chartFresh",
        "allHard": true,
        "gridApart": true,
        "opts": {"chart":"window","band":144,"task":"even","minFactor":2,"winRows":2,"winCols":3},
        "gridFresh": true
      },
      "board": "Draw the window rows {cq.rows} × columns {cq.cols} three times. Shade"
    },
    "flags": {
      "buildNeeds": [{"id":"B5","kind":"skill","what":"patterns:notice_patterns (parity first): n × m, check Even / Odd; reason bank \"two equal parts\""}],
      "evenSteps": [
        "Find the even row numbers.",
        "Every box in an even row is even. Shade it.",
        "Find the even column numbers. Shade those boxes too.",
        "Both odd? Leave it white."
      ]
    }
  },
  "timing": {"1":6,"2":5,"3":4,"4":2,"5":10,"6":7,"7":3,"8":9,"9":5,"10":5,"transitions":4},
  "ranges": {"lesson":{"band":144}},
  "edgeCases": {"edgeTest":"chartEdge","caseNames":{"chartBigOdd":"odd × odd stays white","evenColOnly":"even column only"}},
  "rulings": [],
  "misconceptions": [
    {"id":"row-only","name":"Row only","step":2,"option":"A","fix":"Row OR column? Check both."},
    {"id":"odd-odd-shaded","name":"Odd × odd = even","step":3,"option":"B","fix":"Count the pairs: one is left over."},
    {
      "id": null,
      "name": "Tens digit decides",
      "step": 1,
      "looks": "{chart.trap} left white (its tens digit is odd)",
      "fix": "Cover the tens. Read the ones.",
      "caught": "Practice 1, a white box"
    },
    {"id":null,"name":"Any odd factor is odd","step":2,"looks":"{chart.ca} × {chart.cb} left white","fix":"One even number is enough.","caught":"Exit b"},
    {
      "id": null,
      "name": "Columns only",
      "step": 1,
      "looks": "The {exit.0.ec} column shaded, the {exit.0.er} row white",
      "fix": "Rows first, then columns: finger on each header.",
      "caught": "Exit a"
    }
  ],
  "vocabulary": [
    {"word":"even","gloss":"makes pairs, none left over","diagram":{"kind":"text","text":"●● ●● ●●"}},
    {"word":"odd","gloss":"one is left over","diagram":{"kind":"text","text":"●● ●● ●● ●"}},
    {"word":"product","gloss":"the answer when you multiply","diagram":{"kind":"fact","a":4,"b":3}}
  ],
  "story": {
    "instruction": "Read the story. Draw it. Solve.",
    "lines": ["There are {wp.a} bags.","Each bag has {wp.b} apples.","How many apples? Is it even or odd?"],
    "answerLine": "There are __ apples.",
    "say": "Is {wp.a} or {wp.b} even? The product is __.",
    "sayAns": "{wp.parity}"
  },
  "hook": ["Even numbers make pairs.","Today we find them in the times table."],
  "teach": {
    "t1Boxes": [
      {
        "kind": "tip",
        "title": "Cubes: two equal parts",
        "text": "Build {chart.wa} rows of {chart.wb}: {chart.wh} and {chart.wh}, two equal parts, so it is even."
      },
      {"kind":"language","title":"Row OR column","text":"Say \"row or column\" every time. One even number is enough."},
      {"kind":"watch","title":"Row only","text":"The mistake to stop today: an even column left white."}
    ],
    "howToTeach": "Show, then name. Build the even row of the chart with cubes and split it into two equal parts, then shade the even rows on the window, then the even columns. Odd × odd is shown last, as a contrast, never as a second rule.",
    "board": "Window rows {chart.rows} × columns {chart.cols}.",
    "materials": ["Interlocking cubes: a teacher set of 60","Anchor chart (a 2 × 4 window), A3 or projected"],
    "atoms": [
      {"n":4,"type":"Comparative","skill":"Even row: every product is even","notes":"Anchor chart, the even rows."},
      {
        "n": 5,
        "type": "Conceptual",
        "skill": "Why: an even row splits into two equal parts",
        "notes": "Cubes: {chart.wa} rows of {chart.wb}, {chart.wh} and {chart.wh}."
      },
      {"n":6,"type":"Category","critical":true,"skill":"One even factor is enough: row OR column","notes":"Routine step 2."},
      {"n":7,"type":"Comparative","skill":"Odd × odd is odd (contrast)","notes":"Anchor chart step 3; every window."}
    ],
    "routine": [
      {"tag":"New","check":"Guided 1, exit a"},
      {"tag":"New","check":"Guided 2, Check Question, exit b","critical":true},
      {"tag":"New","check":"Practice last row, exit c"}
    ],
    "sections": {
      "4": {"add":[{"say":"Even numbers make pairs."},{"say":"Today we find them in the times table."}]},
      "5": {
        "rows": [
          {"do":"Put the anchor chart up: rows {chart.rows}, columns {chart.cols}."},
          {"do":"Build {chart.wa} rows of {chart.wb} cubes."},
          {"say":"{chart.er} is even. Every box in that row is even.","note":"Step 1: shade the row."},
          {"ask":"What about the {chart.ec} column?","note":"Expected: even. Shade the column."},
          {"say":"{chart.ca} is odd. {chart.cb} is even. So {chart.cp} is even.","note":"Step 2, the Critical Atom: one is enough."},
          {"say":"{chart.oa} and {chart.ob} are both odd. So {chart.op} is odd.","note":"Leave it white. Contrast only."},
          {"do":"Point to {chart.wa} × {chart.wb} = {chart.wp}: the cubes. Split them into two equal parts."},
          {"say":"{chart.wp} is {chart.wh} and {chart.wh}: two equal parts.","note":"Why it is even: it splits into two equal parts."}
        ],
        "boxes": [{"kind":"watch","title":"Row only","text":"Point to the row number AND the column number, every box."}]
      },
      "6": {
        "rows": [
          {"say":"Finger on the row number. Finger on the column number."},
          {"ask":"Is one of them even?","note":"Listen for \"row or column\"."},
          {"do":"Pupils shade the first window with you, row by row.","note":"Expected ★: [[{we.0.shaded}]]."},
          {"say":"{we.0.ca} is odd. {we.0.cb} is even. So {we.0.cp} is even.","note":"The odd row: its even column."},
          {"do":"Pupils shade the second window alone, row by row.","note":"Expected ★: [[{we.1.shaded}]]."},
          {"ask":"Which boxes stay white?","note":"Both numbers odd: [[{we.1.white}]]."},
          {"do":"Pupils do the two Independent windows under the Guided cells.","note":"Circulate: a white box with an even number?"}
        ],
        "boxes": [{"kind":"feedback","title":"Fix it at once","text":"Fix: \"Check the row AND the column.\""}]
      },
      "8": {
        "add": [{"do":"Circulate. Point at every white box.","note":"Ask: \"Row odd? Column odd?\""}],
        "boxes": [{"kind":"watch","title":"The last row","text":"Walk to the last row first. {p4.last}."}]
      },
      "9": {
        "add": [
          {"ask":"How many apples? Even or odd?","note":"Expected: [[{wp.p}]], [[{wp.parity}]]."},
          {"say":"{wp.a} is even. So {wp.p} is even.","note":"The Say line on the page: one even number is enough."}
        ]
      },
      "10": {"add":[{"say":"Tomorrow we use rules to make number patterns."}],"say":"If one number is even, the product is even."}
    },
    "loop": {"half":"Re-show the odd row with an even column, then one more.","fewer":"Back to the cubes: {chart.wa} rows of {chart.wb}, two equal parts."},
    "accepted": [
      "A shade drawn as a hatch, a fill or a ring around the number.",
      "Word problem: the product and \"even\"; the drawing may be groups or equal parts.",
      "A box shaded by mistake and crossed out: mark the pupil's last choice.",
      "A window is right only when every box is right: shaded even, white odd.",
      "The Say lines are spoken, not marked: listen for \"row or column\" and \"even\"."
    ],
    "wrongAnswers": [
      {"wrote":"{exit.1.wrong.rowonly}","mistake":"Row only","next":"\"Row OR column?\" Finger on every even header."},
      {"wrote":"{exit.2.wrong.oddoddshaded}","mistake":"Odd × odd = even","next":"Count the pairs: one is left over."},
      {"wrote":"{exit.1.cp} left white ({exit.1.ca} is odd)","mistake":"Any odd factor is odd","next":"One even number is enough."},
      {"wrote":"{exit.0.trap} left white (its tens digit is odd)","mistake":"Tens digit decides","next":"Cover the tens. Read the ones."},
      {"wrote":"The even columns shaded, the {exit.0.er} row white","mistake":"Columns only","next":"Rows first, then columns: finger on each header."},
      {"wrote":"Word problem: {wp.p}, \"odd\"","mistake":"Any odd factor is odd","next":"Find one even number: {wp.a}. So {wp.p} is even."},
      {"wrote":"Word problem: {wp.sum}","mistake":"Added the numbers","next":"{wp.a} groups of {wp.b}: draw the groups, then multiply."}
    ]
  },
  "open": []
}
```

Decided: lf-engine, 2026-11-07
