# Lesson card: I Can turn an array to multiply

**Lesson** `G3|-|propertiesofmultiplicationcommutativeidentityanddistributive` · **Unit** G3-Y4.B4 · **Grade** 3 · **CCSS** 3.OA.B.5 · **EE** none · **Shape** `property`

Seeded by `node tests/scripts/ws-lesson-card.mjs --from-detailed` from the passed hand-written lesson (the E4 proof set).
The machine block at the end is the source of truth (`design/lessons/cards/README.md`); this summary is for reading. The
lane decides every open question (its `answer` and the `rule` it rests on) and closes the card with `Decided: lf-<lane>, <date>`.

## Parts (skill + options)

| Part | Skill | Options and floors |
|---|---|---|
| P0 question 1 → 2.NBT.A.2 Count by 5s | `multiplication:count_by_tables` | {"opts":{"rows":[{"step":5,"start":"step","dir":"up"}],"fill":"two","times":"none"}} |
| P0 question 2 → 3.OA.C.7 Multiply by 2 | `multiplication:mult_facts` | {"opts":{"constant":[2],"notation":["stacked"],"band":100},"minNum":12,"maxNum":20} |
| P0 question 3 → 2.OA.C.4 Use arrays | `multiplication:arrays_groups` | {"opts":{"forms":[0]},"minNum":4,"maxNum":25,"allTest":"arrGridSquare","instructionKey":"array-total"} |
| P2-P4 lesson skill | `multiplication:mult_properties` | {"opts":{"forms":[0],"task":[0,1],"band":25},"minNum":6,"maxNum":20,"instructionKey":"missing-many"} |
| P4 Practice 1 | `multiplication:mult_properties` | {"opts":{"forms":[0],"task":[1],"band":36},"minNum":6,"maxNum":36,"allTest":"arrP1","instructionKey":"turn-look"} |
| P4 Practice 2 | `multiplication:mult_properties` | {"opts":{"forms":[0],"task":[2],"band":81},"minNum":12,"factorCap":4,"allTest":"arrP2"} |
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
| P6 exit 1: a known fact gives the turned fact (no picture) | `multiplication:mult_properties` | {"opts":{"forms":[0],"task":[1],"band":81,"pictures":false}} |
| P6 exit 2: same product, no picture (Critical Atom) | @R1 |  |
| P6 exit 3: the missing factor of a turned fact | @R1 |  |
| Spaced retrieval 1 | `multiplication:mult_facts` | {"opts":{"constant":[5],"notation":["across"],"band":100},"maxNum":50} |
| Spaced retrieval 2 | `multiplication:mult_facts` | {"opts":{"constant":[2],"notation":["across"],"band":100},"maxNum":24} |
| Spaced retrieval 3 | `multiplication:mult_facts` | {"opts":{"constant":[10],"notation":["across"],"band":100},"maxNum":60} |
| Check Question (arrProductP2, right C) | @R1 |  |

Hand-written lines (story, hook, teaching notes, mistakes' words): **105**.

## Open questions

1. LR-3 (short lesson): the chart's Steps share an icon (look, write, turn, write, check). The long pack keeps them; the short lesson needs one icon a step. Which icons? **Suggested:** look, write, turn, start, check (a repeated icon swapped for an unused drawn one; parts.chart.shortIcons) **Decided:** look, write, turn, start, check on the short lesson; the long pack keeps its own chart. (LESSON_RULES LR-3: one distinct drawn icon per step (sheet/lesson-icons.js ICON_IDS))

## Machine block

```json lesson-card
{
  "format": "lesson-card/1",
  "id": "g3-oa5-mult-properties",
  "lesson": "G3|-|propertiesofmultiplicationcommutativeidentityanddistributive",
  "unit": "G3-Y4.B4",
  "title": "I Can turn an array to multiply",
  "grade": "3",
  "level": 3,
  "strand": "Operations",
  "ccss": ["3.OA.B.5"],
  "ee": [],
  "packTitle": "Lesson 3a · Turn it: the order property",
  "eeAccess": "M.EE.N.CN.2",
  "eeNote": "No EE at grade 3. DLM access point: M.EE.N.CN.2 (ee-math.json \"see\" of 3.OA.B.5).",
  "followOn": [
    {
      "title": "Multiply by 1 and by 0",
      "iCan": "I Can multiply by 1 and by 0",
      "skill": "multiplication:mult_properties",
      "opts": {"forms":[2,3]},
      "ccss": "3.OA.B.5",
      "note": "× 1 is the property; × 0 is the contrast only. Needs P-A (no answer in the prompt, a kit cell)."
    },
    {
      "title": "Break apart an array",
      "iCan": "I Can break apart an array",
      "skill": "multiplication:mult_properties",
      "opts": {"forms":[1]},
      "ccss": "3.OA.B.5",
      "note": "Distributive: split at the fives line (7 = 5 + 2). After 3a and 3b."
    }
  ],
  "cra": "Concrete → Pictorial",
  "flowNote": "One chunk: turn the array; the product stays the same.",
  "shape": "property",
  "fns": {"cqShow":"turnedFact"},
  "refs": {"R1":{"categoryId":"multiplication","skillId":"mult_properties","opts":{"forms":[0],"task":[2],"band":81}}},
  "parts": {
    "lesson": {
      "categoryId": "multiplication",
      "skillId": "mult_properties",
      "opts": {"forms":[0],"task":[0,1],"band":25},
      "minNum": 6,
      "maxNum": 20,
      "instructionKey": "missing-many"
    },
    "prereqs": [
      {
        "ref": {"categoryId":"multiplication","skillId":"count_by_tables","opts":{"rows":[{"step":5,"start":"step","dir":"up"}],"fill":"two","times":"none"}},
        "items": 1,
        "lesson": {"id":"2.NBT.A.2","title":"Count by 5s"},
        "atom": {"n":1,"type":"Fact","skill":"Count by 5"}
      },
      {
        "ref": {"categoryId":"multiplication","skillId":"mult_facts","opts":{"constant":[2],"notation":["stacked"],"band":100},"minNum":12,"maxNum":20},
        "items": 4,
        "lesson": {"id":"3.OA.C.7","title":"Multiply by 2"},
        "atom": {"n":2,"type":"Fact","skill":"Recall × 2 facts"}
      },
      {
        "ref": {
          "categoryId": "multiplication",
          "skillId": "arrays_groups",
          "opts": {"forms":[0]},
          "minNum": 4,
          "maxNum": 25,
          "allTest": "arrGridSquare",
          "instructionKey": "array-total"
        },
        "items": 2,
        "lesson": {"id":"2.OA.C.4","title":"Use arrays"},
        "atom": {"n":3,"type":"Conceptual","skill":"Array fact: rows × in each row"}
      }
    ],
    "chart": {
      "concepts": [{"id":"same","text":"Same two numbers, same product."},{"id":"turn","text":"Turn the array: rows become columns."}],
      "vocab": [
        {"word":"array","meaning":"dots in equal rows","picture":{"kind":"array","rows":3,"cols":3}},
        {"word":"row","meaning":"a line of dots across","picture":{"kind":"array","rows":1,"cols":4,"mark":"row"}},
        {"word":"turn","meaning":"move it a quarter way round","picture":{"kind":"array","rows":1,"cols":3,"mark":"turn"}}
      ],
      "steps": [
        {"icon":"look","text":"Look at the array."},
        {"icon":"write","text":"Write the fact."},
        {"icon":"turn","text":"Turn the array."},
        {"icon":"write","text":"Write the new fact."},
        {"icon":"check","text":"Check: same product."}
      ],
      "words": [{"from":"^Check: same product, (\\d+)\\. No recount\\.$","to":"Still $1. No recount."}],
      "chant": "",
      "format": {"kind":"numbered steps with icons","why":"Step 5 is the Critical Atom: the pupil checks, never recounts."},
      "example": {"test":"arrBothChart"},
      "shortIcons": ["look","write","turn","start","check"]
    },
    "weDo": {"guidedStack":2,"guidedWants":["arrSmallBoth","arrKnownG"],"guidedRows":2,"practiceShape":[6,2]},
    "practice": {
      "pages": 2,
      "sheets": [
        {
          "skill": {
            "categoryId": "multiplication",
            "skillId": "mult_properties",
            "opts": {"forms":[0],"task":[1],"band":36},
            "minNum": 6,
            "maxNum": 36,
            "allTest": "arrP1",
            "instructionKey": "turn-look"
          },
          "shape": [4,1],
          "edgeLast": {"per":4,"cols":1,"wants":["arrBigSquare"]}
        },
        {
          "skill": {"categoryId":"multiplication","skillId":"mult_properties","opts":{"forms":[0],"task":[2],"band":81},"minNum":12,"factorCap":4,"allTest":"arrP2"},
          "shape": [10,2],
          "edgeLast": {"per":10,"cols":2,"first":true,"wants":["arrSquare","arrFive"]}
        }
      ],
      "edgeTest": "arrEdge",
      "edgeOnlyLast": "arrSquare"
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
    "wordProblem": {"ref":"@R1","want":"arrWpTurn","eqTurn":true,"schematic":true},
    "exit": {
      "items": [
        {
          "case": "a known fact gives the turned fact (no picture)",
          "ref": {"categoryId":"multiplication","skillId":"mult_properties","opts":{"forms":[0],"task":[1],"band":81,"pictures":false}},
          "want": "arrKnownBare",
          "instr": "Turn the fact. Write the new fact.",
          "detects": "Copies the first fact: no swap.",
          "cols": 1
        },
        {
          "case": "same product, no picture (Critical Atom)",
          "ref": "@R1",
          "want": "arrProductP2",
          "instr": "Write the missing number.",
          "detects": "Multiplies again and slips: not the same product.",
          "cols": 2
        },
        {
          "case": "the missing factor of a turned fact",
          "ref": "@R1",
          "want": "arrFactorP2",
          "instr": "Write the missing number.",
          "detects": "Writes the product, or the same factor, in the box.",
          "cols": 2
        }
      ],
      "instruction": "Write how many rows. Write how many in each row.",
      "say": "Same two numbers, same product.",
      "sayItem": 1
    },
    "retrieval": [
      {
        "ref": {"categoryId":"multiplication","skillId":"mult_facts","opts":{"constant":[5],"notation":["across"],"band":100},"maxNum":50},
        "want": "factNoZeroOne",
        "ask": "{ret.0.text}"
      },
      {
        "ref": {"categoryId":"multiplication","skillId":"mult_facts","opts":{"constant":[2],"notation":["across"],"band":100},"maxNum":24},
        "want": "factNoZeroOne",
        "ask": "{ret.1.text}"
      },
      {
        "ref": {"categoryId":"multiplication","skillId":"mult_facts","opts":{"constant":[10],"notation":["across"],"band":100},"maxNum":60},
        "want": "factNoZeroOne",
        "ask": "{ret.2.text}"
      }
    ],
    "checkQuestion": {"ref":"@R1","want":"arrProductP2","correct":"C","board":"Write {cq.fact} on the board. No dots."}
  },
  "timing": {"1":6,"2":5,"3":4,"4":2,"5":10,"6":8,"7":3,"8":9,"9":5,"10":4,"transitions":4},
  "ranges": {"lesson":{"minNum":6,"maxNum":20,"band":25}},
  "edgeCases": {"edgeTest":"arrEdge","caseNames":{"arrSquare":"a square","arrFive":"a 5","arrTurn":"non-square"}},
  "rulings": [
    {"id": "owner-2026-11-07-p1-full-width", "text": "Owner ruling 2026-11-07 (LP-FAMILY-REPEAT): Practice 1 is full-width taller cells, one item a row; arrays up to 6 x 6, each with its turn; every fact family once in the pack (never 2 x 6 on Practice 1: the Prerequisite Check's x 2 facts).", "field": "practice.sheets"}
  ],
  "misconceptions": [
    {
      "id": "turn-recount",
      "name": "A new product",
      "step": 5,
      "option": "A",
      "fix": "“Did a dot move away?”",
      "caught": "Exit b",
      "exits": [{"k":1,"label":"b","next":"Tray: turn it; “Did a dot move away?”"}]
    },
    {
      "id": "turn-product-factor",
      "name": "Adds the two factors",
      "step": 5,
      "option": "B",
      "fix": "“Times, not plus: same product.”",
      "exits": [{"k":1,"label":"b","next":"“Times, not plus.” Say the fact aloud."}]
    },
    {
      "id": null,
      "name": "Copies the fact: no swap",
      "step": 4,
      "looks": "{exit.0.wrong.turnnoswap} for {exit.0.turned}",
      "fix": "Count the turned rows aloud.",
      "caught": "Exit a · Practice 1"
    },
    {
      "id": null,
      "name": "Product as a factor",
      "step": 4,
      "looks": "{exit.2.wrong.turnproductfactor} in the box of exit c",
      "fix": "The product is always last.",
      "caught": "Exit c · Practice 2"
    }
  ],
  "vocabulary": [
    {"word":"array","gloss":"dots in equal rows","diagram":{"kind":"text","text":"• • •  /  • • •"}},
    {"word":"row","gloss":"a line of dots across","diagram":{"kind":"text","text":"• • • •"}},
    {"word":"turn","gloss":"move it a quarter way round","diagram":{"kind":"text","text":"2 × 3  ↻  3 × 2"}}
  ],
  "story": {
    "instruction": "Read the story. Draw it. Solve.",
    "lines": ["A tray has {wp.rows} rows of {wp.cols} cakes.","Sam turns it: now it has {wp.cols} rows.","How many in each row now?"],
    "answerLine": "There are __ cakes in each row.",
    "say": "{wp.rows} times {wp.cols} equals {wp.cols} times __."
  },
  "hook": [
    "Last time: one array gives a fact.",
    "Today: one array gives two facts. Same answer.",
    {"do":"Show the tray. Pupils count the counters once.","note":"They keep the total in mind for the turn."}
  ],
  "teach": {
    "t1Boxes": [
      {"kind":"tip","title":"Tray first, then the picture","text":"Turn a real tray of counters before any drawn array."},
      {"kind":"tip","title":"No square in the I Do","text":"A square turns into itself. It waits for the last row."},
      {"kind":"watch","title":"Recounting","text":"A pupil who recounts the turned array has not got step 5 yet."}
    ],
    "howToTeach": "Turn a real tray of counters first: pupils count once, then see the same total. Ask “Did a dot move away?” First examples: non-square, no repeated digit.",
    "board": "Dot paper: {chart.rows} rows of {chart.cols}, then turned.",
    "materials": ["20 counters on a tray or card, one per pair","Dot paper for the board","Anchor chart"],
    "atoms": [
      {"n":4,"type":"Comparative","skill":"Turned array: rows become columns","notes":"Non-example: a dot added."},
      {"n":5,"type":"Conceptual","critical":true,"skill":"Same product: turning adds no dot","notes":"Ask “Did a dot move away?”"},
      {"n":6,"type":"Conceptual","skill":"Known fact gives the turned fact","notes":"Use the fact. Do not recount."}
    ],
    "routine": [
      {"step":"Look at the array: count the rows and in each row.","tag":"Pre-requisite","check":"“How many rows?”"},
      {"tag":"Pre-requisite","check":"Guided cell 1"},
      {"step":"Turn the array: rows become columns.","tag":"New","check":"Tray: “How many rows now?”"},
      {"tag":"New","check":"Guided cell 2: three boxes"},
      {"step":"Check: same product. No recount.","tag":"New","check":"Check Question; exit b, c","critical":true}
    ],
    "sections": {
      "4": {
        "add": [
          {"say":"Last time: one array gives a fact."},
          {"say":"Today: one array gives two facts. Same answer."},
          {"do":"Show the tray. Pupils count the counters once.","note":"They keep the total in mind for the turn."}
        ]
      },
      "5": {
        "rows": [
          {"do":"Hold up a tray of {chart.rows} rows of {chart.cols}."},
          {"say":"{chart.rows} rows of {chart.cols} is {chart.total}.","note":"Step 1 and 2: write [[{chart.fact}]]."},
          {"do":"Turn the tray a quarter way round. Slowly.","note":"Step 3."},
          {"ask":"How many rows now? How many in each row?","note":"Expected: [[{chart.cols}]] rows of [[{chart.rows}]]."},
          {"say":"{chart.cols} rows of {chart.rows} is {chart.total}.","note":"Step 4: write [[{chart.turned}]]."},
          {"ask":"Did a dot move away?","note":"Expected: no. Step 5: same product."},
          {"say":"{chart.rows} times {chart.cols} equals {chart.cols} times {chart.rows}.","note":"The Say frame. Pupils repeat twice."},
          {"ask":"Cover the dots. So what is {chart.cols} × {chart.rows}?","note":"Expected: [[{chart.total}]]. No dots: same two numbers, same product."},
          {"do":"Write {chart.cols} × □ = {chart.total} on the board.","note":"Expected: [[{chart.rows}]]: the factor that moved."},
          {
            "do": "Write {chart.fact}, then three boxes under it. Point to the turned tray.",
            "note": "Fill them: [[{chart.cols}]] × [[{chart.rows}]] = [[{chart.total}]]. Guided cell 2."
          }
        ],
        "boxes": [{"kind":"watch","title":"Turn slowly","text":"Let them see that no dot leaves the tray."}]
      },
      "6": {
        "rows": [
          {"say":"Look at the first array. Count the rows."},
          {"ask":"How many rows? How many in each row?","note":"Expected ★: [[{we.0.fact}]]; turned [[{we.0.turned}]]."},
          {"say":"Now the fact is given. Write the new fact.","note":"The first box is traced: the rows of the turned array."},
          {"do":"Pupils do the second array on their own.","note":"Expected ★: [[{we.1.turned}]], from [[{we.1.fact}]]."},
          {"ask":"Same product? Did you count again?","note":"Expected: same product, no recount. Step 5."}
        ],
        "boxes": [{"kind":"feedback","title":"Fix it at once","text":"Fix: turn the tray again and ask “Same dots?”"}]
      },
      "8": {
        "add": [
          {"say":"Look at the turned array. Write the new fact. Check: same product."},
          {"do":"Circulate at ★★. Look for pupils who recount.","note":"Ask “Did a dot move away?”"}
        ],
        "boxes": [{"kind":"watch","title":"The last row","text":"Walk to the last row first: {p4.last}."}]
      },
      "9": {
        "add": [
          {"ask":"How many rows now? How many cakes in each row?","note":"Expected: [[{wp.cols}]] rows, [[{wp.rows}]] in each."},
          {"ask":"Say both facts.","note":"Expected: {wp.both}."}
        ]
      },
      "10": {"say":"Turning does not change the total."}
    },
    "loop": {"half":"Reteach step 5 with the tray, then two more.","fewer":"Stop. Whole class: We Do again with a new tray."},
    "accepted": [
      "Prerequisite Check arrays: rows and in each row in either order.",
      "Exit a: only {exit.0.turned}; writing {exit.0.fact} again is the no-swap mistake.",
      "Practice 2 and exit b, c: one number in each box, no working needed.",
      "Practice 1: a turned fact read off the turned array is right even if the pupil counted it.",
      "Cake story: {wp.rows} in each row; the two facts {wp.both}, in either order; the label “cakes” may be left off."
    ],
    "wrongAnswers": [
      {"wrote":"{exit.0.wrong.turnnoswap} (a)","mistake":"Copies the fact: no swap","next":"Count the turned rows aloud."},
      {"wrote":"{exit.2.wrong.turnproductfactor} (c)","mistake":"Product as a factor","next":"The box map: the product is last."},
      {"wrote":"The first fact copied on Practice 1","mistake":"Copies the fact: no swap","next":"Turn the page a quarter way: count the rows."},
      {"wrote":"A × 2 fact missed on the Prerequisite Check","mistake":"Not yet a × 2 fact","next":"3.OA.C.7: count by 2 to find it."},
      {"wrote":"A box left empty on Practice 2","mistake":"Not sure which number moved","next":"Point: the two factors swap places."}
    ]
  },
  "open": [
    {
      "id": "lr3-icons",
      "q": "LR-3 (short lesson): the chart's Steps share an icon (look, write, turn, write, check). The long pack keeps them; the short lesson needs one icon a step. Which icons?",
      "suggested": "look, write, turn, start, check (a repeated icon swapped for an unused drawn one; parts.chart.shortIcons)",
      "answer": "look, write, turn, start, check on the short lesson; the long pack keeps its own chart.",
      "rule": "LESSON_RULES LR-3: one distinct drawn icon per step (sheet/lesson-icons.js ICON_IDS)"
    }
  ]
}
```

Decided: lf-engine, 2026-11-07
