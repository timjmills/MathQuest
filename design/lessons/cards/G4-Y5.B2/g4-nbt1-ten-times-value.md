# Lesson card: I Can find 10 times and one tenth

**Lesson** `G4|-|placevalue10timesandonetenthofadigitsvalue` · **Unit** G4-Y5.B2 · **Grade** 4 · **CCSS** 4.NBT.A.1 · **EE** M.EE.5.NBT.1 · **Shape** `forms`

Seeded by `node tests/scripts/ws-lesson-card.mjs --from-detailed` from the passed hand-written lesson (the E4 proof set).
The machine block at the end is the source of truth (`design/lessons/cards/README.md`); this summary is for reading. The
lane decides every open question (its `answer` and the `rule` it rests on) and closes the card with `Decided: lf-<lane>, <date>`.

## Parts (skill + options)

| Part | Skill | Options and floors |
|---|---|---|
| P0 question 1 → 4.NBT.A.2 Name the place of a digit | `placevalue:identify` | {"opts":{"band":999,"response":"circle"}} |
| P0 question 2 → 4.NBT.A.2 The value of a digit | `placevalue:value` | {"opts":{"band":9999,"form":"value"}} |
| P0 question 3 → 3.NBT.A.3 Multiply by 10 | `placevalue:place_value_10x` | {"opts":{"op":"x","power":[10],"band":1000}} |
| P0 question 4 → 4.NBT.B.6 Divide by 10 | `placevalue:place_value_10x` | {"opts":{"op":"/","power":[10],"band":1000}} |
| P2-P4 lesson skill | `placevalue:value` | {"spreadMax":2,"opts":{"form":"times","band":9999,"tenDir":"both","tenValues":true,"tenPlain":false},"allTest":"tenMixed"} |
| P4 Practice 1 | `placevalue:value` | {"spreadMax":2,"opts":{"form":"times","band":9999,"tenDir":"both","tenValues":true,"tenPlain":false},"allTest":"tenNoOnes"} |
| P4 Practice 2 | `placevalue:value` | {"spreadMax":2,"opts":{"form":"times","band":99999,"tenDir":"both","tenValues":true,"tenPlain":false},"allTest":"tenMixed"} |
| P1 band A row 1 | `placevalue:more_less_100` | {"opts":{"step":10,"dir":"more"},"minNum":120,"maxNum":880} |
| P1 band A row 2 | `placevalue:compare` | {"opts":{"band":999,"closeness":"far"},"minNum":100} |
| P1 band A row 3 | `placevalue:more_less_100` | {"opts":{"step":100,"dir":"less"},"minNum":200,"maxNum":980} |
| P1 band A row 4 | `placevalue:more_less_100` | {"opts":{"step":100,"dir":"more"},"minNum":120,"maxNum":880} |
| P1 band A row 5 | `placevalue:more_less_100` | {"opts":{"step":10,"dir":"less"},"minNum":120,"maxNum":880} |
| P1 band B row 1 | `placevalue:more_less_100` | {"opts":{"step":10,"dir":"more"},"minNum":891,"maxNum":899} |
| P1 band B row 2 | @R1 |  |
| P1 band B row 3 | `placevalue:more_less_100` | {"opts":{"step":100,"dir":"less"},"minNum":101,"maxNum":199} |
| P1 band B row 4 | `placevalue:more_less_100` | {"opts":{"step":100,"dir":"more"},"minNum":801,"maxNum":899} |
| P1 band B row 5 | `placevalue:more_less_100` | {"opts":{"step":10,"dir":"less"},"minNum":301,"maxNum":309} |
| P5 word problem | `placevalue:value` | {"spreadMax":2,"opts":{"form":"times","band":9999,"tenDir":"times","tenValues":true,"tenPlain":false,"tenTask":"story"}} |
| P6 exit 1: 10 times, hundreds and tens | `placevalue:value` | {"spreadMax":2,"opts":{"form":"times","band":9999,"tenDir":"times","tenValues":true,"tenPlain":false,"tenWrite":"top"},"cellPayload":{"sayTwo":true},"spreadPage |
| P6 exit 2: one tenth (Critical Atom: the other way) | @R2 |  |
| P6 exit 3: one tenth, thousands and hundreds | @R2 |  |
| Spaced retrieval 1 | `multiplication:mult_facts` | {"opts":{"constant":[10]}} |
| Spaced retrieval 2 | `placevalue:unit_form` | {"opts":{"band":9999}} |
| Spaced retrieval 3 | @R1 |  |
| Check Question (tenTimesMid, right D) | `placevalue:value` | {"spreadMax":2,"opts":{"form":"times","band":9999,"tenDir":"both","tenValues":false,"tenPlain":false,"tenChoice":"four"}} |

Hand-written lines (story, hook, teaching notes, mistakes' words): **81**.

## Open questions

1. The forms shape reads 3-digit numbers (hto); this lesson's items are pv-times pairs (10 times / one tenth of a digit's value). **Suggested:** add the template reader pvTimes **Decided:** readers: ["pvTimes"] with shapeReaders: false (the forms shape's hto reader would shadow the base `say` on these items) (design/lessons/cards/README.md: placeholders are filled by template readers, one per template)

## Machine block

```json lesson-card
{
  "format": "lesson-card/1",
  "id": "g4-nbt1-ten-times-value",
  "lesson": "G4|-|placevalue10timesandonetenthofadigitsvalue",
  "unit": "G4-Y5.B2",
  "title": "I Can find 10 times and one tenth",
  "grade": "4",
  "level": 4,
  "strand": "Place Value",
  "ccss": ["4.NBT.A.1"],
  "ee": ["M.EE.5.NBT.1"],
  "eeNote": "Wisconsin files 4.NBT.1 as \"use M.EE.5.NBT.1\"",
  "eeOwnerList": ["M.EE.5.NBT.1"],
  "followOn": [
    {"title":"Ten times and one tenth with decimals","skill":"placevalue:value","opts":{"form":"times"},"ccss":"5.NBT.A.1"},
    {"title":"Multiply and divide by 10, 100 and 1,000","skill":"placevalue:place_value_10x","opts":{},"ccss":"5.NBT.A.2"}
  ],
  "cra": "Pictorial → Abstract",
  "flowNote": "One chunk: 10 times first, then one tenth; the same chart every time.",
  "shape": "forms",
  "fns": {"cqShow":"dropParen","lastName":"pvPair","answerShow":"commas"},
  "refs": {
    "R1": {"categoryId":"placevalue","skillId":"compare","opts":{"band":999,"closeness":"close"},"minNum":100},
    "R2": {
      "categoryId": "placevalue",
      "skillId": "value",
      "spreadMax": 2,
      "opts": {"form":"times","band":9999,"tenDir":"tenth","tenValues":true,"tenPlain":false,"tenWrite":"top"},
      "cellPayload": {"sayTwo":true},
      "spreadPage": "P6"
    }
  },
  "parts": {
    "lesson": {
      "categoryId": "placevalue",
      "skillId": "value",
      "spreadMax": 2,
      "opts": {"form":"times","band":9999,"tenDir":"both","tenValues":true,"tenPlain":false},
      "allTest": "tenMixed"
    },
    "prereqs": [
      {
        "ref": {"categoryId":"placevalue","skillId":"identify","opts":{"band":999,"response":"circle"}},
        "items": 2,
        "lesson": {"id":"4.NBT.A.2","title":"Name the place of a digit"},
        "atom": {"n":1,"type":"Fact","skill":"Places: O, T, H, Th"}
      },
      {
        "ref": {"categoryId":"placevalue","skillId":"value","opts":{"band":9999,"form":"value"}},
        "items": 2,
        "lesson": {"id":"4.NBT.A.2","title":"The value of a digit"},
        "atom": {"n":2,"type":"Conceptual","skill":"Value: the 7 in 740 is 700"}
      },
      {
        "ref": {"categoryId":"placevalue","skillId":"place_value_10x","opts":{"op":"x","power":[10],"band":1000}},
        "items": 2,
        "lesson": {"id":"3.NBT.A.3","title":"Multiply by 10"},
        "atom": {"n":3,"type":"Fact","skill":"Times 10: 70 × 10 = 700"}
      },
      {
        "ref": {"categoryId":"placevalue","skillId":"place_value_10x","opts":{"op":"/","power":[10],"band":1000}},
        "items": 2,
        "lesson": {"id":"4.NBT.B.6","title":"Divide by 10"},
        "atom": {"n":4,"type":"Fact","skill":"Divide by 10: 700 ÷ 10 = 70"}
      }
    ],
    "chart": {
      "concepts": [{"id":"left","text":"One place left: 10 times as much."},{"id":"right","text":"One place right: one tenth as much."}],
      "vocab": [
        {"word":"digit","meaning":"one of 0 to 9","picture":{"kind":"glyph","text":"7"}},
        {"word":"value","meaning":"what a digit is worth","picture":{"kind":"text","text":"7 in 70 → 70"}},
        {"word":"one tenth","meaning":"1 of 10 equal parts","picture":{"kind":"text","text":"700 ÷ 10 = 70"}}
      ],
      "steps": [{"icon":"write","text":"Write what each digit is worth."},{"icon":"decide","text":"Bigger value: 10 times. Smaller: one tenth."}],
      "chant": "Left is ten times. Right is one tenth.",
      "chartWide": true,
      "format": {
        "kind": "numbered steps with icons + a chant",
        "why": "Writing both values first makes the comparison a comparison of numbers, not of digits: the 7 and the 7 look the same."
      },
      "example": {"test":"tenChart"},
      "second": {"test":"tenTenthOther","label":"One place right? One tenth."}
    },
    "weDo": {"guidedRows":2,"guided":["tenTimesGuided","tenTenthGuided"],"practiceShape":[4,1]},
    "practice": {
      "pages": 2,
      "sheets": [
        {
          "steps": true,
          "skill": {
            "categoryId": "placevalue",
            "skillId": "value",
            "spreadMax": 2,
            "opts": {"form":"times","band":9999,"tenDir":"both","tenValues":true,"tenPlain":false},
            "allTest": "tenNoOnes"
          },
          "shape": [4,1],
          "edgeLast": {"per":4,"cols":1,"wants":["tenThouTenth"]}
        },
        {
          "steps": true,
          "skill": {
            "categoryId": "placevalue",
            "skillId": "value",
            "spreadMax": 2,
            "opts": {"form":"times","band":99999,"tenDir":"both","tenValues":true,"tenPlain":false},
            "allTest": "tenMixed"
          },
          "shape": [4,1],
          "edgeLast": {"per":4,"cols":1,"wants":["tenOnesTimes"]}
        }
      ],
      "edgeTest": "tenEdge"
    },
    "mixed": null,
    "numberSense": {
      "A": {
        "items": [
          {"categoryId":"placevalue","skillId":"more_less_100","opts":{"step":10,"dir":"more"},"minNum":120,"maxNum":880},
          {"categoryId":"placevalue","skillId":"compare","opts":{"band":999,"closeness":"far"},"minNum":100},
          {"categoryId":"placevalue","skillId":"more_less_100","opts":{"step":100,"dir":"less"},"minNum":200,"maxNum":980},
          {"categoryId":"placevalue","skillId":"more_less_100","opts":{"step":100,"dir":"more"},"minNum":120,"maxNum":880},
          {"categoryId":"placevalue","skillId":"more_less_100","opts":{"step":10,"dir":"less"},"minNum":120,"maxNum":880}
        ]
      },
      "B": {
        "items": [
          {"categoryId":"placevalue","skillId":"more_less_100","opts":{"step":10,"dir":"more"},"minNum":891,"maxNum":899},
          "@R1",
          {"categoryId":"placevalue","skillId":"more_less_100","opts":{"step":100,"dir":"less"},"minNum":101,"maxNum":199},
          {"categoryId":"placevalue","skillId":"more_less_100","opts":{"step":100,"dir":"more"},"minNum":801,"maxNum":899},
          {"categoryId":"placevalue","skillId":"more_less_100","opts":{"step":10,"dir":"less"},"minNum":301,"maxNum":309}
        ]
      }
    },
    "wordProblem": {
      "ref": {
        "categoryId": "placevalue",
        "skillId": "value",
        "spreadMax": 2,
        "opts": {"form":"times","band":9999,"tenDir":"times","tenValues":true,"tenPlain":false,"tenTask":"story"}
      },
      "want": ["tenThou"],
      "workChart": true
    },
    "exit": {
      "items": [
        {
          "case": "10 times, hundreds and tens",
          "ref": {
            "categoryId": "placevalue",
            "skillId": "value",
            "spreadMax": 2,
            "opts": {"form":"times","band":9999,"tenDir":"times","tenValues":true,"tenPlain":false,"tenWrite":"top"},
            "cellPayload": {"sayTwo":true},
            "spreadPage": "P6"
          },
          "want": "tenTimesMid",
          "instr": "Write the top value. Circle 10 times or one tenth.",
          "detects": "Writes the digit as its value: 4 for 400.",
          "show": "[[{exit.0.v0}]], [[{exit.0.rel}]]"
        },
        {
          "case": "one tenth (Critical Atom: the other way)",
          "ref": "@R2",
          "want": "tenTenthMid",
          "instr": "Write the top value. Circle 10 times or one tenth.",
          "detects": "Right value, then 10 times circled: the smaller value read as 10 times.",
          "show": "[[{exit.1.v0}]], [[{exit.1.rel}]]"
        },
        {
          "case": "one tenth, thousands and hundreds",
          "ref": "@R2",
          "want": "tenThouTenth",
          "instr": "Write the top value. Circle 10 times or one tenth.",
          "detects": "Uses the place next to it: a thousands value for a hundreds digit.",
          "show": "[[{exit.2.v0}]], [[{exit.2.rel}]]"
        }
      ],
      "instruction": "Write the top value. Circle 10 times or one tenth.",
      "say": "Left is ten times. Right is one tenth.",
      "sayItem": 0
    },
    "retrieval": [
      {"ref":{"categoryId":"multiplication","skillId":"mult_facts","opts":{"constant":[10]}},"ask":"{ret.0.text}"},
      {"ref":{"categoryId":"placevalue","skillId":"unit_form","opts":{"band":9999}},"ask":"{ret.1.text}"},
      {"ref":"@R1","ask":"Which is bigger: {ret.2.a} or {ret.2.b}?","expect":"{ret.2.big}"}
    ],
    "checkQuestion": {
      "want": "tenTimesMid",
      "ref": {
        "categoryId": "placevalue",
        "skillId": "value",
        "spreadMax": 2,
        "opts": {"form":"times","band":9999,"tenDir":"both","tenValues":false,"tenPlain":false,"tenChoice":"four"}
      },
      "correct": "D",
      "board": "Write on the board: {cq.sentQ}."
    },
    "flags": {"ccssOwnerList":["4.NBT.A.1","5.NBT.A.1"],"ringWords":["10 times","one tenth of"]}
  },
  "timing": {"1":5,"2":5,"3":3,"4":2,"5":10,"6":8,"7":3,"8":12,"9":4,"10":4,"transitions":4},
  "ranges": {"lesson":{"band":9999}},
  "edgeCases": {
    "edgeTest": "tenEdge",
    "caseNames": {"tenThouTenth":"one tenth, thousands and hundreds","tenOnesTimes":"ones and tens, 10 times","tenTimes":"10 times","tenTenth":"one tenth"}
  },
  "rulings": [],
  "misconceptions": [
    {"id":"M-T1","name":"Wrong way round","step":3,"option":"A","looks":"“{cq.A}” for {cq.v0} and {cq.v1}","fix":"Which value is bigger?"},
    {"id":"M-V2","name":"Same digit, same value","step":2,"option":"B","looks":"“{cq.B}” for {cq.v0} and {cq.v1}","fix":"“What is each {cq.d} worth?”"},
    {"id":"M-V14","name":"Counted two places","step":1,"option":"C","looks":"“{cq.C}” for {cq.v0} and {cq.v1}","fix":"Point: one column apart."},
    {
      "id": null,
      "name": "Digit, not value",
      "step": 2,
      "looks": "{we.1.d} and {we.1.d} for {we.1.v0} and {we.1.v1}",
      "fix": "Write the zeros: the place.",
      "caught": "Guided 2 · Practice 1"
    }
  ],
  "vocabulary": [
    {"word":"digit","gloss":"one of 0 to 9","diagram":{"kind":"digit","text":"7"}},
    {"word":"value","gloss":"what a digit is worth","diagram":{"kind":"text","text":"7 tens = 70"}},
    {"word":"one tenth","gloss":"1 of 10 equal parts","diagram":{"kind":"text","text":"700 ÷ 10"}}
  ],
  "story": {"instruction":"Read the story. Draw it. Solve.","answerLine":"","say":"Mia has __ times as many.","sayAns":"{wp.eqN}"},
  "hook": ["You know what a digit is worth.","Today: the same digit in two places. Which is worth more?"],
  "teach": {
    "t1Boxes": [
      {"kind":"tip","title":"Values first","text":"The two digits look the same. Their values do not: write both values first."},
      {"kind":"language","title":"One tenth","text":"Say “one tenth of”: 70 is one tenth of 700. Ten tenths make one whole."},
      {"kind":"watch","title":"The other way","text":"The mistake to stop today: “10 times” for every pair, whichever is bigger."}
    ],
    "howToTeach": "Build it with blocks first: 10 rods make a flat. Then the chart: the same digit one column left is worth 10 times as much. Model 10 times, then the same pair read the other way: one tenth.",
    "board": "Th H T O chart: {chart.nF} over {chart.mF}, the {chart.d}s underlined.",
    "slotRows": [{"shape":"ring","use":"circle 10 times or one tenth of"}],
    "materials": ["Base-ten blocks: cubes, rods, flats, a big cube","A Th H T O place chart on the board"],
    "atoms": [
      {"n":5,"type":"Conceptual","critical":true,"skill":"One place left: 10 times","notes":"10 ones make 1 ten; 10 tens make 1 hundred."},
      {"n":6,"type":"Comparative","skill":"Left or right: 10 times or one tenth","notes":"Compare the values, not the digits."},
      {"n":7,"type":"Category","skill":"Any place: always 10","notes":"Th and H, H and T, T and O: each is 10 times."},
      {"n":8,"type":"Conceptual","skill":"One tenth: 10 equal parts","notes":"70 is one tenth of 700: 700 ÷ 10 = 70."}
    ],
    "routine": [
      {"step":"Find the digit in each row. Read its place.","tag":"Pre-requisite","check":"Prerequisite Check: places"},
      {"step":"Write what each digit is worth.","tag":"New","check":"Every worth box filled"},
      {"step":"Bigger value: 10 times. Smaller: one tenth.","tag":"New","check":"Check Question; exit 2","critical":true}
    ],
    "sections": {
      "4": {"add":[{"say":"You know what a digit is worth."},{"say":"Today: the same digit in two places. Which is worth more?"}]},
      "5": {
        "rows": [
          {"do":"Show 10 rods next to 1 flat. They match.","note":"10 tens is 1 hundred."},
          {"do":"Put anchor chart up. Point to {chart.nF} and {chart.mF}."},
          {"say":"The {chart.d} in {chart.nF} is in the {chart.place} place.","note":"Step 1: worth [[{chart.v0}]]."},
          {"say":"The {chart.d} in {chart.mF} is in the {chart.placeM} place.","note":"Step 1 again: worth [[{chart.v1}]]."},
          {"say":"{chart.v0} is {chart.rel} {chart.v1}.","note":"Step 2: circle [[{chart.rel}]]."},
          {"say":"Now the other way: {chart2.v0} is {chart2.rel} {chart2.v1}.","note":"Another example. Circle [[{chart2.rel}]]."},
          {"say":"Any two places side by side: the same rule.","note":"Point along the Th H T O heads."}
        ],
        "boxes": [{"kind":"watch","title":"Same digit","text":"Pupils who say “they are the same” are looking at digits. Ask for values."}]
      },
      "6": {
        "rows": [
          {"say":"Look at {we.0.nF} and {we.0.mF}. Step 1 is in grey."},
          {"ask":"What is each {we.0.d} worth?","note":"Expected ★: [[{we.0.v0}]], [[{we.0.v1}]]; circle [[{we.0.rel}]]."},
          {"do":"Pairs do cell 2: {we.1.nF} and {we.1.mF}.","note":"Expected ★: [[{we.1.worths}]]."},
          {"ask":"Cell 2: is the top value bigger or smaller?","note":"{we.1.bigSmall}, so [[{we.1.rel}]]."},
          {"do":"Pupils do the Independent Practice. Walk and check.","note":"Expected ★★: [[{indepList}]]."}
        ],
        "boxes": [{"kind":"feedback","title":"Fix it at once","text":"Fix: cover one row. “What is this {we.0.d} worth?”"}]
      },
      "8": {
        "add": [
          {"say":"{p4.steps}"},
          {"ask":"Which value is bigger?","note":"Visit pupils who circle the same word every time."},
          {"do":"Practice 2: the same steps, numbers to 99,999.","note":"Look for the digit written in a worth box."}
        ]
      },
      "9": {
        "add": [
          {"ask":"What is each {wp.d} worth?","note":"Expected: [[{wp.v0}]] and [[{wp.v1}]]."},
          {"ask":"How many times as much?","note":"Expected: [[{wp.v0} ÷ {wp.v1} = {wp.eqN}]]."}
        ]
      },
      "10": {"say":"Left is ten times. Right is one tenth."}
    },
    "loop": {"half":"Reteach with rods and a flat, then two more pairs.","fewer":"Stop. Build {chart.v1} and {chart.v0} with blocks. Count the rods."},
    "accepted": [
      "A value written with or without its comma (7000 or 7,000) is right.",
      "Said aloud: “ten times as much”, “times 10” and “a tenth of” are all right.",
      "A right ring with an empty worth box: not yet right; ask “what is it worth?”."
    ],
    "wrongAnswers": [
      {"wrote":"{exit.0.wrong.MV2} for {exit.0.nF} and {exit.0.mF} (exit 1)","mistake":"Digit, not value","next":"Cover one row; write its value."},
      {"wrote":"{exit.1.wrong.MT1} for {exit.1.nF} and {exit.1.mF} (exit 2)","mistake":"Wrong way round","next":"“Which value is bigger?” first."},
      {"wrote":"{exit.2.wrong.MV14} for {exit.2.nF} and {exit.2.mF} (exit 3)","mistake":"Place next to it","next":"Point to the heads: read the place."},
      {"wrote":"“{cq.wrong.MT1}” for {cq.v0} and {cq.v1} (Check Question)","mistake":"Wrong way round","next":"Rods and a flat: which is more?"}
    ]
  },
  "open": [
    {
      "id": "pv-times-reader",
      "q": "The forms shape reads 3-digit numbers (hto); this lesson's items are pv-times pairs (10 times / one tenth of a digit's value).",
      "suggested": "add the template reader pvTimes",
      "answer": "readers: [\"pvTimes\"] with shapeReaders: false (the forms shape's hto reader would shadow the base `say` on these items)",
      "rule": "design/lessons/cards/README.md: placeholders are filled by template readers, one per template"
    }
  ],
  "readers": ["pvTimes"],
  "shapeReaders": false
}
```

Decided: lf-engine, 2026-11-07
