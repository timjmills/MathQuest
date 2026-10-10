# R and Y1: generated items per step (wave 2 tagging, round 3)

Every direct and partial skill of every step, generated with the opts the links file gives: 6 items each (seeds 9100 + 17i), the first 3 shown.
"Max Number" is the range passed to generateQuestionFor; "not read" means the skill ignores it (its own band option sets the numbers).
Regenerate: `node tests/scripts/wrm-tagging/items.mjs --links R Y1 6 --md design/audit/runs/wrm-tagging/R-Y1-items.md`.

## R

### R.B1.S1 Match objects — **gap** (missing: matching an object to an identical object (same / different))
- no live skill; build: match_same

### R.B1.S2 Match pictures and objects — **gap** (missing: matching a picture to its object and objects to pictures)
- no live skill; build: match_same

### R.B1.S3 Identify a set — **gap** (missing: deciding which objects belong to a set and which does not)
- no live skill; build: odd_one_out

### R.B1.S4 Sort objects to a type — **partial** (missing: putting every object into a group by type (the skill only counts one kind))
- partial `comparing:classify_count` opts `{"band":3,"tiles":2}` (6 generated; Max Number not read)
  - Count only the stars. / A=3 / number / {kind:sort,bag:[star,star,circle,star],asked:star,ans:3}
  - Count only the squares. / A=2 / number / {kind:sort,bag:[circle,square,square],asked:square,ans:2}
  - Count only the squares. / A=1 / number / {kind:sort,bag:[square,triangle],asked:square,ans:1}

### R.B1.S5 Explore sorting techniques — **partial** (missing: sorting the same objects by different attributes)
- partial `comparing:classify_count` opts `{"band":3}` (6 generated; Max Number not read)
  - Count only the stars. / A=3 / number / {kind:sort,bag:[circle,star,circle,star,star,circle],asked:star,ans:3}
  - Count only the squares. / A=2 / number / {kind:sort,bag:[square,star,square,circle],asked:square,ans:2}
  - Count only the squares. / A=1 / number / {kind:sort,bag:[square,triangle],asked:square,ans:1}

### R.B1.S6 Create sorting rules — **gap** (missing: creating and saying a sorting rule)
- no live skill; build: sort_groups

### R.B1.S7 Compare amounts — **full**
- full `comparing:compare_groups` opts `{"band":5,"level":[1]}` (6 generated; Max Number not read)
  - Do the groups have the same number of counters? / A="not the same" / text / {a:4,b:2,labels:[Same,Not the same],values:[same,not the same],correct:1}
  - Which group has fewer counters? / A="B" / text / {a:4,b:1,labels:[A has fewer,B has fewer],values:[A,B],correct:1}
  - Which group has more counters? / A="B" / text / {a:2,b:3,labels:[A has more,B has more],values:[A,B],correct:1}

### R.B2.S1 Compare size — **partial** (missing: comparing overall size with big / bigger / small / smaller)
- partial `comparing:compare_objects` opts `{}` (6 generated; Max Number not read)
  - Which tower is taller? / A="B" / text
  - Which tower is shorter? / A="A" / text
  - Which bar is thicker? / A="B" / text

### R.B2.S2 Compare mass — **full**
- full `measurement:heavier_lighter_visual` opts `{}` (6 generated; Max Number not read)
  - Which is heavier? / A="🐕" / multiple-choice
  - Which is lighter? / A="🍃" / multiple-choice
  - Which is heavier? / A="🐕" / multiple-choice

### R.B2.S3 Compare capacity — **gap** (missing: comparing capacity: full, empty, holds more / less)
- no live skill; build: capacity_early

### R.B2.S4 Explore simple patterns — **partial** (missing: spotting and naming the repeating part of an AB pattern)
- partial `patterns:shape_pattern` opts `{"points":[0]}` (6 generated; Max Number not read)
  - Look at the pattern. Fill in the missing shapes. / A="circle, diamond" / text
  - Look at the pattern. Fill in the missing shapes. / A="diamond, diamond" / text
  - Look at the pattern. Fill in the missing shapes. / A="triangle, diamond" / text

### R.B2.S5 Copy and continue simple patterns — **partial** (missing: copying an AB pattern and continuing it by drawing or choosing the next shape (the skill asks for typed shape names and never asks to copy))
- partial `patterns:shape_pattern` opts `{"points":[0]}` (6 generated; Max Number not read)
  - Look at the pattern. Fill in the missing shapes. / A="circle, diamond" / text
  - Look at the pattern. Fill in the missing shapes. / A="diamond, diamond" / text
  - Look at the pattern. Fill in the missing shapes. / A="triangle, diamond" / text

### R.B2.S6 Create simple patterns — **gap** (missing: creating a pattern of one's own)
- no live skill; build: pattern_make

### R.B3.S1 Find 1, 2 and 3 — **partial** (missing: finding groups of exactly 1, 2 and 3 (the smallest band is 5))
- partial `counting:count_objects` opts `{"band":5,"objects":"pictures"}` (6 generated; Max Number not read)
  - How many fish are there? / A=2 / number / {kind:count,n:2,shape:fish,ans:2}
  - How many fish are there? / A=1 / number / {kind:count,n:1,shape:fish,ans:1}
  - How many balls are there? / A=5 / number / {kind:count,n:5,shape:ball,ans:5}

### R.B3.S2 Subitise 1, 2 and 3 — **partial** (missing: perceptual subitising of 1, 2 and 3 (seen, not counted))
- partial `counting:count_objects` opts `{"band":5,"objects":"dice"}` (6 generated; Max Number not read)
  - How many dots are there? / A=2 / number / {kind:count,n:2,shape:circle,ans:2,objects:dice}
  - How many dots are there? / A=1 / number / {kind:count,n:1,shape:circle,ans:1,objects:dice}
  - How many dots are there? / A=5 / number / {kind:count,n:5,shape:circle,ans:5,objects:dice}

### R.B3.S3 Represent 1, 2 and 3 — **partial** (missing: representing 1, 2 and 3 only)
- partial `composing:ten_frame_build` opts `{"band":5}` (6 generated; Max Number not read)
  - Build 2 on the ten frame. / A=2 / ten-frame-build / {target:2,frames:1}
  - Build 1 on the ten frame. / A=1 / ten-frame-build / {target:1,frames:1}
  - Build 5 on the ten frame. / A=5 / ten-frame-build / {target:5,frames:1}

### R.B3.S4 1 more — **partial** (missing: one more than 1 and 2, shown by adding one object (the skill asks "what comes after 6?" to 10, with no objects))
- partial `counting:count_sequence` opts `{"band":10,"dir":"forward"}` (6 generated; Max Number not read)
  - What number comes after 6? / A=7 / number
  - What number comes after 8? / A=9 / number
  - What number comes after 4? / A=5 / number

### R.B3.S5 1 less — **partial** (missing: one less than 2 and 3, shown by taking one object away)
- partial `counting:count_sequence` opts `{"band":10,"dir":"back"}` (6 generated; Max Number not read)
  - What number comes before 4? / A=3 / number
  - What number comes before 6? / A=5 / number
  - What number comes before 2? / A=1 / number

### R.B3.S6 Composition of 1, 2 and 3 — **partial** (missing: composition of 1, 2 and 3 only)
- partial `composing:number_bonds` opts `{"band":5}` (6 generated; Max Number not read)
  - 3 + ? = 5 / A=2 / number / {whole:5,a:3,b:2,unknown:B}
  - 1 + 3 = ? / A=4 / number / {whole:4,a:1,b:3,unknown:whole}
  - ? + 1 = 4 / A=3 / number / {whole:4,a:3,b:1,unknown:A}

### R.B4.S1 Identify and name circles and triangles — **full**
- full `shapes_early:name_2d_shapes` opts `{"forms":[1],"shapes":[0,1]}` (6 generated; Max Number not read)
  - Click ALL the triangles. / A=["opt1"] / multi-select-check
  - Click ALL the circles. / A=["opt1","opt3"] / multi-select-check
  - Click ALL the triangles. / A=["opt3"] / multi-select-check

### R.B4.S2 Compare circles and triangles — **partial** (missing: comparing a circle and a triangle (same / different, curved / straight))
- partial `shapes_early:shape_attributes` opts `{}` (6 generated; Max Number not read)
  - How many vertices does a hexagon have? / A=6 / number
  - How many sides does a hexagon have? / A=6 / number
  - Click ALL shapes with 4 sides. / A=["opt1","opt3"] / multi-select-check

### R.B4.S3 Shapes in the environment — **gap** (missing: finding circles and triangles in real objects)
- no live skill; build: shapes_world

### R.B4.S4 Describe position — **partial** (missing: the full early position vocabulary (in front, behind, on top, under))
- partial `shapes_early:shape_positions` opts `{}` (6 generated; Max Number not read)
  - Where is the ball compared to the heart? / A="Below" / multiple-choice
  - Where is the star compared to the ball? / A="Beside" / multiple-choice
  - Where is the ball compared to the star? / A="Above" / multiple-choice

### R.B5.S1 Find 4 and 5 — **partial** (missing: finding groups of exactly 4 and 5 (band 5 deals 1-5, mostly 1-3))
- partial `counting:count_objects` opts `{"band":5,"objects":"pictures"}` (6 generated; Max Number not read)
  - How many fish are there? / A=2 / number / {kind:count,n:2,shape:fish,ans:2}
  - How many fish are there? / A=1 / number / {kind:count,n:1,shape:fish,ans:1}
  - How many balls are there? / A=5 / number / {kind:count,n:5,shape:ball,ans:5}

### R.B5.S2 Subitise 4 and 5 — **partial** (missing: perceptual subitising of 4 and 5)
- partial `counting:count_objects` opts `{"band":5,"objects":"dice"}` (6 generated; Max Number not read)
  - How many dots are there? / A=2 / number / {kind:count,n:2,shape:circle,ans:2,objects:dice}
  - How many dots are there? / A=1 / number / {kind:count,n:1,shape:circle,ans:1,objects:dice}
  - How many dots are there? / A=5 / number / {kind:count,n:5,shape:circle,ans:5,objects:dice}

### R.B5.S3 Represent 4 and 5 — **partial** (missing: representing exactly 4 and 5 (band 5 deals 1-5, mostly 1-3))
- partial `composing:ten_frame_build` opts `{"band":5}` (6 generated; Max Number not read)
  - Build 2 on the ten frame. / A=2 / ten-frame-build / {target:2,frames:1}
  - Build 1 on the ten frame. / A=1 / ten-frame-build / {target:1,frames:1}
  - Build 5 on the ten frame. / A=5 / ten-frame-build / {target:5,frames:1}

### R.B5.S4 1 more — **partial** (missing: one more within 5, shown with objects)
- partial `counting:count_sequence` opts `{"band":10,"dir":"forward"}` (6 generated; Max Number not read)
  - What number comes after 6? / A=7 / number
  - What number comes after 8? / A=9 / number
  - What number comes after 4? / A=5 / number

### R.B5.S5 1 less — **partial** (missing: one less within 5, shown with objects)
- partial `counting:count_sequence` opts `{"band":10,"dir":"back"}` (6 generated; Max Number not read)
  - What number comes before 4? / A=3 / number
  - What number comes before 6? / A=5 / number
  - What number comes before 2? / A=1 / number

### R.B5.S6 Composition of 4 and 5 — **full**
- full `composing:number_bonds` opts `{"band":5}` (6 generated; Max Number not read)
  - 3 + ? = 5 / A=2 / number / {whole:5,a:3,b:2,unknown:B}
  - 1 + 3 = ? / A=4 / number / {whole:4,a:1,b:3,unknown:whole}
  - ? + 1 = 4 / A=3 / number / {whole:4,a:3,b:1,unknown:A}

### R.B5.S7 Composition of 1 - 5 — **partial** (missing: composition of every whole from 1 to 5: the wholes 1 and 2 never appear (band 5 deals wholes 3-5))
- partial `composing:number_bonds` opts `{"band":5}` (6 generated; Max Number not read)
  - 3 + ? = 5 / A=2 / number / {whole:5,a:3,b:2,unknown:B}
  - 1 + 3 = ? / A=4 / number / {whole:4,a:1,b:3,unknown:whole}
  - ? + 1 = 4 / A=3 / number / {whole:4,a:3,b:1,unknown:A}

### R.B6.S1 Identify and name shapes with 4 sides — **full**
- full `shapes_early:name_2d_shapes` opts `{"forms":[1],"shapes":[2]}` (6 generated; Max Number not read)
  - Click ALL the rectangles. / A=["opt1","opt2"] / multi-select-check
  - Click ALL the rectangles. / A=["opt1"] / multi-select-check
  - Click ALL the rectangles. / A=["opt0"] / multi-select-check

### R.B6.S2 Combine shapes with 4 sides — **full**
- full `shapes_early:compose_shapes` opts `{"shapes":[1]}` (6 generated; Max Number not read)
  - What shape do you make when you put these two shapes together? / A="Square" / multiple-choice
  - What shape do you make when you put these two shapes together? / A="Rectangle" / multiple-choice
  - What shape do you make when you put these two shapes together? / A="Rectangle" / multiple-choice

### R.B6.S3 Shapes in the environment — **gap** (missing: finding 4-sided shapes in the environment)
- no live skill; build: shapes_world

### R.B6.S4 My day and night — **gap** (missing: sequencing a day (morning, afternoon, night) and talking about routines)
- no live skill; build: day_order

### R.B7.S1 Introduce zero — **gap** (missing: zero as none: an empty set and the numeral 0)
- no live skill; build: zero

### R.B7.S2 Find 0 to 5 — **partial** (missing: finding a group of zero)
- partial `counting:count_objects` opts `{"band":5,"objects":"pictures"}` (6 generated; Max Number not read)
  - How many fish are there? / A=2 / number / {kind:count,n:2,shape:fish,ans:2}
  - How many fish are there? / A=1 / number / {kind:count,n:1,shape:fish,ans:1}
  - How many balls are there? / A=5 / number / {kind:count,n:5,shape:ball,ans:5}

### R.B7.S3 Subitise 0 to 5 — **partial** (missing: subitising 0 to 5)
- partial `counting:count_objects` opts `{"band":5,"objects":"dice"}` (6 generated; Max Number not read)
  - How many dots are there? / A=2 / number / {kind:count,n:2,shape:circle,ans:2,objects:dice}
  - How many dots are there? / A=1 / number / {kind:count,n:1,shape:circle,ans:1,objects:dice}
  - How many dots are there? / A=5 / number / {kind:count,n:5,shape:circle,ans:5,objects:dice}

### R.B7.S4 Represent 0 to 5 — **partial** (missing: representing 0 (an empty frame))
- partial `composing:ten_frame_build` opts `{"band":5}` (6 generated; Max Number not read)
  - Build 2 on the ten frame. / A=2 / ten-frame-build / {target:2,frames:1}
  - Build 1 on the ten frame. / A=1 / ten-frame-build / {target:1,frames:1}
  - Build 5 on the ten frame. / A=5 / ten-frame-build / {target:5,frames:1}

### R.B7.S5 1 more — **partial** (missing: one more within 0-5 with objects, including 1 more than 0)
- partial `counting:count_sequence` opts `{"band":10,"dir":"forward"}` (6 generated; Max Number not read)
  - What number comes after 6? / A=7 / number
  - What number comes after 8? / A=9 / number
  - What number comes after 4? / A=5 / number

### R.B7.S6 1 less — **partial** (missing: one less within 0-5 with objects, including 1 less than 1 is 0)
- partial `counting:count_sequence` opts `{"band":10,"dir":"back"}` (6 generated; Max Number not read)
  - What number comes before 4? / A=3 / number
  - What number comes before 6? / A=5 / number
  - What number comes before 2? / A=1 / number

### R.B7.S7 Composition — **partial** (missing: composition of 0 to 5: the wholes 1 and 2 and a zero part (5 = 5 + 0) never appear)
- partial `composing:number_bonds` opts `{"band":5}` (6 generated; Max Number not read)
  - 3 + ? = 5 / A=2 / number / {whole:5,a:3,b:2,unknown:B}
  - 1 + 3 = ? / A=4 / number / {whole:4,a:1,b:3,unknown:whole}
  - ? + 1 = 4 / A=3 / number / {whole:4,a:3,b:1,unknown:A}

### R.B7.S8 Conceptual subitising to 5 — **gap** (missing: conceptual subitising to 5: seeing 3 and 2 and knowing 5)
- no live skill; build: subitise

### R.B8.S1 Compare mass — **full**
- full `measurement:heavier_lighter_visual` opts `{}` (6 generated; Max Number not read)
  - Which is heavier? / A="🐕" / multiple-choice
  - Which is lighter? / A="🍃" / multiple-choice
  - Which is heavier? / A="🐕" / multiple-choice

### R.B8.S2 Find a balance — **partial** (missing: balance: making both sides equal)
- partial `measurement:heavier_lighter_visual` opts `{}` (6 generated; Max Number not read)
  - Which is heavier? / A="🐕" / multiple-choice
  - Which is lighter? / A="🍃" / multiple-choice
  - Which is heavier? / A="🐕" / multiple-choice

### R.B8.S3 Explore capacity — **gap** (missing: capacity language: full, empty, nearly full, half full)
- no live skill; build: capacity_early

### R.B8.S4 Compare capacity — **gap** (missing: comparing what two containers hold)
- no live skill; build: capacity_early

### R.B9.S1 Find 6, 7 and 8 — **partial** (missing: finding groups of exactly 6, 7 and 8)
- partial `counting:count_objects` opts `{"band":10,"objects":"frame"}` (6 generated; Max Number not read)
  - How many dots are there? / A=3 / number / {kind:count,n:3,shape:circle,ans:3,objects:frame}
  - How many dots are there? / A=7 / number / {kind:count,n:7,shape:circle,ans:7,objects:frame}
  - How many dots are there? / A=5 / number / {kind:count,n:5,shape:circle,ans:5,objects:frame}

### R.B9.S2 Represent 6, 7 and 8 — **partial** (missing: representing 6, 7 and 8 only)
- partial `composing:ten_frame_build` opts `{"band":10}` (6 generated; Max Number not read)
  - Build 3 on the ten frame. / A=3 / ten-frame-build / {target:3,frames:1}
  - Build 8 on the ten frame. / A=8 / ten-frame-build / {target:8,frames:1}
  - Build 1 on the ten frame. / A=1 / ten-frame-build / {target:1,frames:1}

### R.B9.S3 1 more — **partial** (missing: one more than 5, 6 and 7 with objects)
- partial `counting:count_sequence` opts `{"band":10,"dir":"forward"}` (6 generated; Max Number not read)
  - What number comes after 6? / A=7 / number
  - What number comes after 8? / A=9 / number
  - What number comes after 4? / A=5 / number

### R.B9.S4 1 less — **partial** (missing: one less than 6, 7 and 8 with objects)
- partial `counting:count_sequence` opts `{"band":10,"dir":"back"}` (6 generated; Max Number not read)
  - What number comes before 4? / A=3 / number
  - What number comes before 6? / A=5 / number
  - What number comes before 2? / A=1 / number

### R.B9.S5 Composition of 6, 7 and 8 — **partial** (missing: composition of 6, 7 and 8 only, with pictured parts)
- partial `composing:number_bonds` opts `{"band":10}` (6 generated; Max Number not read)
  - 2 + ? = 5 / A=3 / number / {whole:5,a:2,b:3,unknown:B}
  - 5 + 2 = ? / A=7 / number / {whole:7,a:5,b:2,unknown:whole}
  - ? + 3 = 4 / A=1 / number / {whole:4,a:1,b:3,unknown:A}

### R.B9.S6 Make pairs-odd and even — **partial** (missing: pairing objects to see whether one is left over)
- partial `composing:odd_even` opts `{"forms":[2],"range":10}` (6 generated; Max Number 10)
  - Which number is even? / A="10" / text
  - Which number is odd? / A="7" / text
  - Which number is odd? / A="1" / text

### R.B9.S7 Double to 8 (find a double) — **partial** (missing: recognising a double (two equal groups) pictured, totals to 8)
- partial `number_sense:doubles_near_doubles` opts `{"forms":[0]}` (6 generated; Max Number not read)
  - Double it! 5 + 5 = ? / A=10 / number
  - Double it! 8 + 8 = ? / A=16 / number
  - Double it! 3 + 3 = ? / A=6 / number

### R.B9.S8 Double to 8 (make a double) — **partial** (missing: making a double with objects to 8)
- partial `patterns:double` opts `{"band":20}` (6 generated; Max Number 10)
  - Double 8 / A=16 / number
  - Double 8 / A=16 / number
  - Double 2 / A=4 / number

### R.B9.S9 Combine 2 groups — **partial** (missing: combining two pictured groups with totals to 8 and writing how many in all (add_5_pictures stops at 5; add_wp_10 is a word-work cell))
- partial `addition:add_5_pictures` opts `{}` (6 generated; Max Number not read)
  - How many in all? 1 + 3 = ? / A=4 / number / {kind:join,n:1,m:3,shape:triangle,ans:4}
  - How many in all? 3 + 1 = ? / A=4 / number / {kind:join,n:3,m:1,shape:star,ans:4}
  - How many in all? 1 + 1 = ? / A=2 / number / {kind:join,n:1,m:1,shape:square,ans:2}
- partial `addition:add_wp_10` opts `{"band":7}` (6 generated; Max Number not read)
  - I have 3 apples. I get 2 more apples. How many apples do I have now? / A=5 / number / {lines:[I have 3 apples.,I get 2 more apples.,How many apples do I have now?],steps:[{a:3,b:2,op:+,ans:5,top:3
  - There are 2 fish in a pond. 2 more fish swim in. How many fish are there now? / A=4 / number / {lines:[There are 2 fish in a pond.,2 more fish swim in.,How many fish are there now?],steps:[{a:2,b:2,op:+,an
  - 2 stars are on a card. 4 stars are on a page. How many stars are there in all? / A=6 / number / {lines:[2 stars are on a card.,4 stars are on a page.,How many stars are there in all?],steps:[{a:2,b:4,op:+,a

### R.B9.S10 Conceptual subitising — **gap** (missing: conceptual subitising to 8 (see 5 and 3))
- no live skill; build: subitise

### R.B10.S1 Explore length — **full**
- full `comparing:compare_objects` opts `{"task":"length"}` (6 generated; Max Number not read)
  - Which line is longer? / A="B" / text
  - Which line is shorter? / A="A" / text
  - Which line is longer? / A="B" / text

### R.B10.S2 Compare length — **full**
- full `comparing:compare_objects` opts `{"task":"length"}` (6 generated; Max Number not read)
  - Which line is longer? / A="B" / text
  - Which line is shorter? / A="A" / text
  - Which line is longer? / A="B" / text

### R.B10.S3 Explore height — **full**
- full `comparing:compare_objects` opts `{"task":"height"}` (6 generated; Max Number not read)
  - Which tower is taller? / A="B" / text
  - Which tower is shorter? / A="A" / text
  - Which tower is taller? / A="B" / text

### R.B10.S4 Compare height — **full**
- full `comparing:compare_objects` opts `{"task":"height"}` (6 generated; Max Number not read)
  - Which tower is taller? / A="B" / text
  - Which tower is shorter? / A="A" / text
  - Which tower is taller? / A="B" / text

### R.B10.S5 Talk about time — **gap** (missing: time language: now, before, after, morning, night, yesterday, tomorrow)
- no live skill; build: time_talk

### R.B10.S6 Order and sequence time — **gap** (missing: ordering events in time (first, next, then))
- no live skill; build: day_order

### R.B11.S1 Find 9 and 10 — **partial** (missing: finding groups of exactly 9 and 10 (band 10 deals 1-10, mostly below 9))
- partial `counting:count_objects` opts `{"band":10,"objects":"frame"}` (6 generated; Max Number not read)
  - How many dots are there? / A=3 / number / {kind:count,n:3,shape:circle,ans:3,objects:frame}
  - How many dots are there? / A=7 / number / {kind:count,n:7,shape:circle,ans:7,objects:frame}
  - How many dots are there? / A=5 / number / {kind:count,n:5,shape:circle,ans:5,objects:frame}

### R.B11.S2 Compare numbers to 10 — **partial** (missing: comparing two numerals to 10 (not groups) with more / fewer)
- full `comparing:compare_groups` opts `{"band":10,"level":[1]}` (6 generated; Max Number not read)
  - Do the groups have the same number of counters? / A="not the same" / text / {a:6,b:4,labels:[Same,Not the same],values:[same,not the same],correct:1}
  - Which group has fewer counters? / A="B" / text / {a:9,b:6,labels:[A has fewer,B has fewer],values:[A,B],correct:1}
  - Which group has more counters? / A="B" / text / {a:3,b:4,labels:[A has more,B has more],values:[A,B],correct:1}
- partial `placevalue:compare` opts `{"band":99}` (6 generated; Max Number not read)
  - Compare: 53 ___ 77 / A="<" / symbol / {keyValue:<,kind:compare,a:53,b:77}
  - Compare: 71 ___ 76 / A="<" / symbol / {keyValue:<,kind:compare,a:71,b:76}
  - Compare: 30 ___ 32 / A="<" / symbol / {keyValue:<,kind:compare,a:30,b:32}

### R.B11.S3 Represent 9 and 10 — **partial** (missing: representing exactly 9 and 10 (band 10 builds 1-10, mostly below 9))
- partial `composing:ten_frame_build` opts `{"band":10}` (6 generated; Max Number not read)
  - Build 3 on the ten frame. / A=3 / ten-frame-build / {target:3,frames:1}
  - Build 8 on the ten frame. / A=8 / ten-frame-build / {target:8,frames:1}
  - Build 1 on the ten frame. / A=1 / ten-frame-build / {target:1,frames:1}

### R.B11.S4 Conceptual subitising to 10 — **gap** (missing: conceptual subitising to 10 on frames and dice)
- no live skill; build: subitise

### R.B11.S5 1 more — **partial** (missing: one more within 10 shown by adding one object)
- partial `counting:count_sequence` opts `{"band":10,"dir":"forward"}` (6 generated; Max Number not read)
  - What number comes after 6? / A=7 / number
  - What number comes after 8? / A=9 / number
  - What number comes after 4? / A=5 / number

### R.B11.S6 1 less — **partial** (missing: one less within 10 shown by taking one object away)
- partial `counting:count_sequence` opts `{"band":10,"dir":"back"}` (6 generated; Max Number not read)
  - What number comes before 4? / A=3 / number
  - What number comes before 6? / A=5 / number
  - What number comes before 2? / A=1 / number

### R.B11.S7 Composition to 10 — **full**
- full `composing:number_bonds` opts `{"band":10}` (6 generated; Max Number not read)
  - 2 + ? = 5 / A=3 / number / {whole:5,a:2,b:3,unknown:B}
  - 5 + 2 = ? / A=7 / number / {whole:7,a:5,b:2,unknown:whole}
  - ? + 3 = 4 / A=1 / number / {whole:4,a:1,b:3,unknown:A}

### R.B11.S8 Bonds to 10 (2 parts) — **full**
- full `composing:make_ten` opts `{"band":10}` (6 generated; Max Number not read)
  - The frame shows 5. How many more make 10? / A=5 / number
  - The frame shows 6. How many more make 10? / A=4 / number
  - The frame shows 7. How many more make 10? / A=3 / number

### R.B11.S9 Make arrangements of 10 — **partial** (missing: seeing different arrangements of 10 as the same amount)
- partial `composing:ten_frame_build` opts `{"band":10}` (6 generated; Max Number not read)
  - Build 3 on the ten frame. / A=3 / ten-frame-build / {target:3,frames:1}
  - Build 8 on the ten frame. / A=8 / ten-frame-build / {target:8,frames:1}
  - Build 1 on the ten frame. / A=1 / ten-frame-build / {target:1,frames:1}

### R.B11.S10 Bonds to 10 (3 parts) — **partial** (missing: bonds to 10 in three parts)
- partial `addition:add_three` opts `{"band":10,"notation":["across"]}` (6 generated; Max Number not read)
  - 3 + 2 + 3 = ? / A=8 / number / {a:3,b:2,c:3}
  - 5 + 2 + 1 = ? / A=8 / number / {a:5,b:2,c:1}
  - 2 + 1 + 2 = ? / A=5 / number / {a:2,b:1,c:2}

### R.B11.S11 Doubles to 10 (find a double) — **partial** (missing: recognising a pictured double to 10)
- partial `number_sense:doubles_near_doubles` opts `{"forms":[0]}` (6 generated; Max Number not read)
  - Double it! 5 + 5 = ? / A=10 / number
  - Double it! 8 + 8 = ? / A=16 / number
  - Double it! 3 + 3 = ? / A=6 / number

### R.B11.S12 Doubles to 10 (make a double) — **partial** (missing: making a double with objects to 10)
- partial `patterns:double` opts `{"band":20}` (6 generated; Max Number 10)
  - Double 8 / A=16 / number
  - Double 8 / A=16 / number
  - Double 2 / A=4 / number

### R.B11.S13 Explore even and odd — **partial** (missing: pairing objects to see odd and even)
- partial `composing:odd_even` opts `{"forms":[2],"range":10}` (6 generated; Max Number 10)
  - Which number is even? / A="10" / text
  - Which number is odd? / A="7" / text
  - Which number is odd? / A="1" / text

### R.B12.S1 Recognise and name 3-D shapes — **full**
- full `shapes_early:name_3d_shapes` opts `{"forms":[1]}` (6 generated; Max Number not read)
  - Click ALL the cones. / A=["opt2","opt3"] / multi-select-check
  - Click ALL the cubes. / A=["opt2"] / multi-select-check
  - Click ALL the cubes. / A=["opt0","opt1"] / multi-select-check

### R.B12.S2 Find 2-D shapes within 3-D shapes — **gap** (missing: finding the flat (2-D) faces on 3-D shapes)
- no live skill; build: shape_3d_tasks

### R.B12.S3 Use 3-D shapes for tasks — **gap** (missing: choosing a 3-D shape for a job (it rolls, it stacks))
- no live skill; build: shape_3d_tasks

### R.B12.S4 3-D shapes in the environment — **gap** (missing: finding 3-D shapes in the environment)
- no live skill; build: shapes_world

### R.B12.S5 Identify more complex patterns — **partial** (missing: identifying ABB / ABC patterns by choosing or drawing the next shape (typed names are not a Reception response))
- partial `patterns:shape_pattern` opts `{"points":[1]}` (6 generated; Max Number not read)
  - Look at the pattern. Fill in the missing shapes. / A="star, triangle, star" / text
  - Look at the pattern. Fill in the missing shapes. / A="square, square, triangle" / text
  - Look at the pattern. Fill in the missing shapes. / A="triangle, hexagon, triangle" / text

### R.B12.S6 Copy and continue patterns — **partial** (missing: copying a pattern and continuing it by choosing or drawing)
- partial `patterns:shape_pattern` opts `{"points":[0,1]}` (6 generated; Max Number not read)
  - Look at the pattern. Fill in the missing shapes. / A="circle, diamond" / text
  - Look at the pattern. Fill in the missing shapes. / A="square, square, triangle" / text
  - Look at the pattern. Fill in the missing shapes. / A="triangle, diamond" / text

### R.B12.S7 Patterns in the environment — **partial** (missing: spotting patterns in the environment)
- partial `patterns:shape_pattern` opts `{"points":[0]}` (6 generated; Max Number not read)
  - Look at the pattern. Fill in the missing shapes. / A="circle, diamond" / text
  - Look at the pattern. Fill in the missing shapes. / A="diamond, diamond" / text
  - Look at the pattern. Fill in the missing shapes. / A="triangle, diamond" / text

### R.B13.S1 Build numbers beyond 10 (10 -13) — **partial** (missing: building 10, 11, 12 and 13 only)
- partial `composing:teen_compose` opts `{"band":15}` (6 generated; Max Number not read)
  - What number is 10 and 3 more? / A=13 / number / {kind:teen,ones:3,askTotal:true,ans:13}
  - 10 and what number make 14? / A=4 / number / {kind:teen,ones:4,askTotal:false,ans:4}
  - What number is 10 and 5 more? / A=15 / number / {kind:teen,ones:5,askTotal:true,ans:15}
- partial `composing:ten_frame_build_teen` opts `{"band":15}` (6 generated; Max Number not read)
  - Build 12 on the ten frames. / A=12 / ten-frame-build
  - Build 11 on the ten frames. / A=11 / ten-frame-build
  - Build 15 on the ten frames. / A=15 / ten-frame-build

### R.B13.S2 Continue patterns beyond 10 (10-13) — **partial** (missing: continuing the count 10, 11, 12, 13 only)
- partial `counting:count_sequence` opts `{"band":20,"dir":"forward"}` (6 generated; Max Number not read)
  - What number comes after 11? / A=12 / number
  - What number comes after 15? / A=16 / number
  - What number comes after 6? / A=7 / number
- partial `counting:number_seq_fill` opts `{"step":1,"dir":"forward","range":20}` (6 generated; Max Number 20)
  - Write the missing number in the number track. / A=11 / number / {values:[8,9,10,11,12],blanks:[3],shape:mixed}
  - Write the missing numbers in the number track. / A="14, 16" / text / {values:[12,13,14,15,16],blanks:[2,4],shape:mixed}
  - Write the missing number in the number track. / A=6 / number / {values:[3,4,5,6,7],blanks:[3],shape:mixed}

### R.B13.S3 Build numbers beyond 10 (14-20) — **partial** (missing: 14 to 20, with 20 as two full tens (the band stops at 19 and starts at 11))
- partial `composing:teen_compose` opts `{"band":19}` (6 generated; Max Number not read)
  - What number is 10 and 5 more? / A=15 / number / {kind:teen,ones:5,askTotal:true,ans:15}
  - 10 and what number make 16? / A=6 / number / {kind:teen,ones:6,askTotal:false,ans:6}
  - What number is 10 and 7 more? / A=17 / number / {kind:teen,ones:7,askTotal:true,ans:17}
- partial `composing:ten_frame_build_teen` opts `{"band":19}` (6 generated; Max Number not read)
  - Build 16 on the ten frames. / A=16 / ten-frame-build
  - Build 11 on the ten frames. / A=11 / ten-frame-build
  - Build 13 on the ten frames. / A=13 / ten-frame-build

### R.B13.S4 Continue patterns beyond 10 (14-20) — **partial** (missing: continuing the count 14, 15 … 20 only (the band and the tracks start from 1))
- partial `counting:count_sequence` opts `{"band":20,"dir":"forward"}` (6 generated; Max Number not read)
  - What number comes after 11? / A=12 / number
  - What number comes after 15? / A=16 / number
  - What number comes after 6? / A=7 / number
- partial `counting:number_seq_fill` opts `{"step":1,"dir":"forward","range":20}` (6 generated; Max Number 20)
  - Write the missing number in the number track. / A=11 / number / {values:[8,9,10,11,12],blanks:[3],shape:mixed}
  - Write the missing numbers in the number track. / A="14, 16" / text / {values:[12,13,14,15,16],blanks:[2,4],shape:mixed}
  - Write the missing number in the number track. / A=6 / number / {values:[3,4,5,6,7],blanks:[3],shape:mixed}

### R.B13.S5 Verbal counting beyond 20 — **partial** (missing: oral counting past 20 (the written track is the only check))
- partial `counting:number_seq_fill` opts `{"step":1,"range":50}` (6 generated; Max Number 50)
  - Write the missing numbers in the number track. / A="37, 39" / text / {values:[35,36,37,38,39],blanks:[2,4],shape:mixed}
  - Write the missing number in the number track. / A=36 / number / {values:[34,35,36,37,38],blanks:[2],shape:mixed}
  - Write the missing numbers in the number track. / A="12, 11" / text / {values:[14,13,12,11,10],blanks:[2,3],shape:mixed}

### R.B13.S6 Verbal counting patterns — **partial** (missing: saying the counting pattern and noticing that 1-9 repeat in every decade)
- partial `counting:number_seq_fill` opts `{"step":1,"range":100}` (6 generated; Max Number 100)
  - Write the missing numbers in the number track. / A="74, 76" / text / {values:[72,73,74,75,76],blanks:[2,4],shape:mixed}
  - Write the missing number in the number track. / A=73 / number / {values:[71,72,73,74,75],blanks:[2],shape:mixed}
  - Write the missing numbers in the number track. / A="24, 23" / text / {values:[26,25,24,23,22],blanks:[2,3],shape:mixed}

### R.B14.S1 Add more — **partial** (missing: adding more to a pictured group, totals to 10, by counting on and writing how many now (add_5_pictures stops at 5; add_wp_10 is a word-work cell))
- partial `addition:add_5_pictures` opts `{}` (6 generated; Max Number not read)
  - How many in all? 1 + 3 = ? / A=4 / number / {kind:join,n:1,m:3,shape:triangle,ans:4}
  - How many in all? 3 + 1 = ? / A=4 / number / {kind:join,n:3,m:1,shape:star,ans:4}
  - How many in all? 1 + 1 = ? / A=2 / number / {kind:join,n:1,m:1,shape:square,ans:2}
- partial `addition:add_wp_10` opts `{"band":10}` (6 generated; Max Number not read)
  - I have 2 apples. I get 2 more apples. How many apples do I have now? / A=4 / number / {lines:[I have 2 apples.,I get 2 more apples.,How many apples do I have now?],steps:[{a:2,b:2,op:+,ans:4,top:2
  - There are 5 fish in a pond. 3 more fish swim in. How many fish are there now? / A=8 / number / {lines:[There are 5 fish in a pond.,3 more fish swim in.,How many fish are there now?],steps:[{a:5,b:3,op:+,an
  - 2 stars are on a card. 4 stars are on a page. How many stars are there in all? / A=6 / number / {lines:[2 stars are on a card.,4 stars are on a page.,How many stars are there in all?],steps:[{a:2,b:4,op:+,a

### R.B14.S2 How many did I add — **partial** (missing: change unknown: how many were added)
- partial `addition:add_5_pictures` opts `{}` (6 generated; Max Number not read)
  - How many in all? 1 + 3 = ? / A=4 / number / {kind:join,n:1,m:3,shape:triangle,ans:4}
  - How many in all? 3 + 1 = ? / A=4 / number / {kind:join,n:3,m:1,shape:star,ans:4}
  - How many in all? 1 + 1 = ? / A=2 / number / {kind:join,n:1,m:1,shape:square,ans:2}

### R.B14.S3 Take away — **partial** (missing: taking away from a pictured group of up to 10 and writing how many are left (sub_5_pictures stops at 5; sub_wp_10 is a word-work cell))
- partial `subtraction:sub_5_pictures` opts `{}` (6 generated; Max Number not read)
  - Start with 4, take away 1. How many are left? / A=3 / number / {kind:takeaway,n:4,m:1,shape:square,ans:3}
  - Start with 4, take away 4. How many are left? / A=0 / number / {kind:takeaway,n:4,m:4,shape:triangle,ans:0}
  - Start with 2, take away 1. How many are left? / A=1 / number / {kind:takeaway,n:2,m:1,shape:star,ans:1}
- partial `subtraction:sub_wp_10` opts `{}` (6 generated; Max Number not read)
  - Ana has 3 stamps. Ana gives 2 stamps to Noor. How many stamps does Ana have left? / A=1 / number / {lines:[Ana has 3 stamps.,Ana gives 2 stamps to Noor.,How many stamps does Ana have left?],steps:[{a:3,b:2,op:
  - There are 4 beads in a box. Noor takes 1 bead out. How many beads are left in the box? / A=3 / number / {lines:[There are 4 beads in a box.,Noor takes 1 bead out.,How many beads are left in the box?],steps:[{a:4,b:
  - Omar has 8 shells. Omar gives 3 shells to Kofi. How many shells does Omar have left? / A=5 / number / {lines:[Omar has 8 shells.,Omar gives 3 shells to Kofi.,How many shells does Omar have left?],steps:[{a:8,b:3,

### R.B14.S4 How many did I take away — **partial** (missing: change unknown: how many were taken away)
- partial `subtraction:sub_5_pictures` opts `{}` (6 generated; Max Number not read)
  - Start with 4, take away 1. How many are left? / A=3 / number / {kind:takeaway,n:4,m:1,shape:square,ans:3}
  - Start with 4, take away 4. How many are left? / A=0 / number / {kind:takeaway,n:4,m:4,shape:triangle,ans:0}
  - Start with 2, take away 1. How many are left? / A=1 / number / {kind:takeaway,n:2,m:1,shape:star,ans:1}

### R.B15.S1 Select shapes for a purpose — **partial** (missing: selecting a shape for a purpose)
- partial `shapes_early:shape_attributes` opts `{"forms":[1]}` (6 generated; Max Number not read)
  - Click ALL shapes with 4 sides. / A=["opt1","opt2"] / multi-select-check
  - Click ALL shapes with at least one pair of parallel sides. / A=["opt0","opt3"] / multi-select-check
  - Click ALL shapes with 4 sides. / A=["opt1","opt3"] / multi-select-check

### R.B15.S2 Rotate shapes — **partial** (missing: recognising a turned shape as the same shape)
- partial `shapes_early:name_2d_shapes` opts `{"forms":[1]}` (6 generated; Max Number not read)
  - Click ALL the rectangles. / A=["opt1","opt2"] / multi-select-check
  - Click ALL the circles. / A=["opt1","opt3"] / multi-select-check
  - Click ALL the triangles. / A=["opt3"] / multi-select-check

### R.B15.S3 Manipulate shapes — **full**
- full `shapes_early:compose_shapes` opts `{}` (6 generated; Max Number not read)
  - What shape do you make when you put these two shapes together? / A="Square" / multiple-choice
  - What shape do you make when you put these two shapes together? / A="Triangle" / multiple-choice
  - What shape do you make when you put these two shapes together? / A="Rectangle" / multiple-choice

### R.B15.S4 Explain shape arrangements — **partial** (missing: describing how shapes are arranged)
- partial `shapes_early:compose_shapes` opts `{}` (6 generated; Max Number not read)
  - What shape do you make when you put these two shapes together? / A="Square" / multiple-choice
  - What shape do you make when you put these two shapes together? / A="Triangle" / multiple-choice
  - What shape do you make when you put these two shapes together? / A="Rectangle" / multiple-choice

### R.B15.S5 Compose shapes — **full**
- full `shapes_early:compose_shapes` opts `{}` (6 generated; Max Number not read)
  - What shape do you make when you put these two shapes together? / A="Square" / multiple-choice
  - What shape do you make when you put these two shapes together? / A="Triangle" / multiple-choice
  - What shape do you make when you put these two shapes together? / A="Rectangle" / multiple-choice
- full `shapes_early:compose_hexagon` opts `{}` (6 generated; Max Number not read)
  - Fill the hexagon with pattern blocks. Drag each block into a slot. / A="Hexagon (rhombi)" / compose-shape-blocks
  - Fill the hexagon with pattern blocks. Drag each block into a slot. / A="Hexagon (trapezoids)" / compose-shape-blocks
  - Fill the hexagon with pattern blocks. Drag each block into a slot. / A="Hexagon (triangles)" / compose-shape-blocks

### R.B15.S6 Decompose shapes — **partial** (missing: decomposing a shape into smaller shapes)
- partial `shapes_early:compose_shapes` opts `{}` (6 generated; Max Number not read)
  - What shape do you make when you put these two shapes together? / A="Square" / multiple-choice
  - What shape do you make when you put these two shapes together? / A="Triangle" / multiple-choice
  - What shape do you make when you put these two shapes together? / A="Rectangle" / multiple-choice

### R.B15.S7 Copy 2-D shape pictures — **gap** (missing: copying a picture made of 2-D shapes)
- no live skill; build: scenes

### R.B15.S8 Find 2-D shapes within 3-D shapes — **gap** (missing: finding 2-D faces within 3-D shapes)
- no live skill; build: shape_3d_tasks

### R.B16.S1 Explore sharing — **gap** (missing: exploring sharing an amount fairly)
- no live skill; build: share_group

### R.B16.S2 Sharing — **partial** (missing: sharing one by one between a given number (how many each))
- partial `division:share_into_groups` opts `{"band":12}` (6 generated; Max Number not read)
  - There are 12 counters. Make groups of 6. How many groups are there? / A=2 / number / {kind:share,n:12,size:6,ans:2}
  - There are 12 counters. Make groups of 3. How many groups are there? / A=4 / number / {kind:share,n:12,size:3,ans:4}
  - There are 9 counters. Make groups of 3. How many groups are there? / A=3 / number / {kind:share,n:9,size:3,ans:3}

### R.B16.S3 Explore grouping — **partial** (missing: exploring making equal groups)
- partial `division:share_into_groups` opts `{"band":12}` (6 generated; Max Number not read)
  - There are 12 counters. Make groups of 6. How many groups are there? / A=2 / number / {kind:share,n:12,size:6,ans:2}
  - There are 12 counters. Make groups of 3. How many groups are there? / A=4 / number / {kind:share,n:12,size:3,ans:4}
  - There are 9 counters. Make groups of 3. How many groups are there? / A=3 / number / {kind:share,n:9,size:3,ans:3}

### R.B16.S4 Grouping — **full**
- full `division:share_into_groups` opts `{"band":12}` (6 generated; Max Number not read)
  - There are 12 counters. Make groups of 6. How many groups are there? / A=2 / number / {kind:share,n:12,size:6,ans:2}
  - There are 12 counters. Make groups of 3. How many groups are there? / A=4 / number / {kind:share,n:12,size:3,ans:4}
  - There are 9 counters. Make groups of 3. How many groups are there? / A=3 / number / {kind:share,n:9,size:3,ans:3}

### R.B16.S5 Even and odd sharing — **partial** (missing: odd and even through sharing between two)
- partial `composing:odd_even` opts `{"forms":[2],"range":10}` (6 generated; Max Number 10)
  - Which number is even? / A="10" / text
  - Which number is odd? / A="7" / text
  - Which number is odd? / A="1" / text

### R.B16.S6 Play with and build doubles — **partial** (missing: playing with and building doubles with objects)
- partial `number_sense:doubles_near_doubles` opts `{"forms":[0]}` (6 generated; Max Number not read)
  - Double it! 5 + 5 = ? / A=10 / number
  - Double it! 8 + 8 = ? / A=16 / number
  - Double it! 3 + 3 = ? / A=6 / number

### R.B17.S1 Identify units of repeating patterns — **partial** (missing: identifying the repeating unit)
- partial `patterns:shape_pattern` opts `{"points":[0,1]}` (6 generated; Max Number not read)
  - Look at the pattern. Fill in the missing shapes. / A="circle, diamond" / text
  - Look at the pattern. Fill in the missing shapes. / A="square, square, triangle" / text
  - Look at the pattern. Fill in the missing shapes. / A="triangle, diamond" / text

### R.B17.S2 Create own pattern rules — **gap** (missing: creating a pattern rule of one's own)
- no live skill; build: pattern_make

### R.B17.S3 Explore own pattern rules — **gap** (missing: explaining one's own pattern rule)
- no live skill; build: pattern_make

### R.B17.S4 Replicate and build scenes and constructions — **gap** (missing: replicating a scene or construction from a model)
- no live skill; build: scenes

### R.B17.S5 Visualise from different positions — **gap** (missing: visualising objects from different positions)
- no live skill; build: scenes

### R.B17.S6 Describe positions — **partial** (missing: the full position vocabulary)
- partial `shapes_early:shape_positions` opts `{}` (6 generated; Max Number not read)
  - Where is the ball compared to the heart? / A="Below" / multiple-choice
  - Where is the star compared to the ball? / A="Beside" / multiple-choice
  - Where is the ball compared to the star? / A="Above" / multiple-choice

### R.B17.S7 Give instructions to build — **partial** (missing: giving instructions using position words)
- partial `shapes_early:shape_positions` opts `{}` (6 generated; Max Number not read)
  - Where is the ball compared to the heart? / A="Below" / multiple-choice
  - Where is the star compared to the ball? / A="Beside" / multiple-choice
  - Where is the ball compared to the star? / A="Above" / multiple-choice

### R.B17.S8 Explore mapping — **gap** (missing: exploring simple maps)
- no live skill; build: position_map

### R.B17.S9 Represent maps with models — **gap** (missing: representing a map with models)
- no live skill; build: position_map

### R.B17.S10 Create own maps from familiar places — **gap** (missing: creating a map of a familiar place)
- no live skill; build: position_map

### R.B17.S11 Create own maps and plans from story situations — **gap** (missing: creating maps and plans from a story)
- no live skill; build: position_map

### R.B18.S1 Deepen understanding — **gap** (missing: a consolidation review across the Reception year)
- no live skill; build: consolidate

### R.B18.S2 Patterns and relationships — **partial** (missing: number relationships (1 more, doubles, bonds) reviewed together)
- partial `patterns:shape_pattern` opts `{"points":[0]}` (6 generated; Max Number not read)
  - Look at the pattern. Fill in the missing shapes. / A="circle, diamond" / text
  - Look at the pattern. Fill in the missing shapes. / A="diamond, diamond" / text
  - Look at the pattern. Fill in the missing shapes. / A="triangle, diamond" / text


## Y1

### Y1.B1.S1 Sort objects — **partial** (missing: sorting all objects into groups and naming the rule)
- partial `comparing:classify_count` opts `{"band":6}` (6 generated; Max Number not read)
  - Count only the stars. / A=6 / number / {kind:sort,bag:[star,circle,circle,star,star,star,star,circle,circle,circle,star,circle],asked:star,ans:6}
  - Count only the squares. / A=5 / number / {kind:sort,bag:[circle,square,star,star,square,circle,square,square,square,circle],asked:square,ans:5}
  - Count only the squares. / A=3 / number / {kind:sort,bag:[square,square,triangle,square,triangle],asked:square,ans:3}

### Y1.B1.S2 Count objects — **full**
- full `counting:count_objects` opts `{"band":10}` (6 generated; Max Number not read)
  - How many squares are there? / A=3 / number / {kind:count,n:3,shape:square,ans:3}
  - How many triangles are there? / A=7 / number / {kind:count,n:7,shape:triangle,ans:7}
  - How many circles are there? / A=5 / number / {kind:count,n:5,shape:circle,ans:5}

### Y1.B1.S3 Count objects from a larger group — **partial** (missing: counting out (take 6 from a pile of 10))
- partial `counting:count_objects` opts `{"band":10}` (6 generated; Max Number not read)
  - How many squares are there? / A=3 / number / {kind:count,n:3,shape:square,ans:3}
  - How many triangles are there? / A=7 / number / {kind:count,n:7,shape:triangle,ans:7}
  - How many circles are there? / A=5 / number / {kind:count,n:5,shape:circle,ans:5}

### Y1.B1.S4 Represent objects — **full**
- full `composing:ten_frame_build` opts `{"band":10}` (6 generated; Max Number not read)
  - Build 3 on the ten frame. / A=3 / ten-frame-build / {target:3,frames:1}
  - Build 8 on the ten frame. / A=8 / ten-frame-build / {target:8,frames:1}
  - Build 1 on the ten frame. / A=1 / ten-frame-build / {target:1,frames:1}

### Y1.B1.S5 Recognise numbers as words — **partial** (missing: reading the number words zero to ten and matching each to its numeral (the live skill deals only "ten" at Max Number 10))
- partial `composing:number_word_form` opts `{"range":10}` (6 generated; Max Number 10)
  - Write the numeral: ten / A=10 / number
  - Write the numeral: ten / A=10 / number
  - Write the numeral: ten / A=10 / number

### Y1.B1.S6 Count on from any number — **full**
- full `counting:count_sequence` opts `{"band":10,"dir":"forward"}` (6 generated; Max Number not read)
  - What number comes after 6? / A=7 / number
  - What number comes after 8? / A=9 / number
  - What number comes after 4? / A=5 / number
- full `counting:number_seq_fill` opts `{"step":1,"dir":"forward","range":10}` (6 generated; Max Number 10)
  - Write the missing number in the number track. / A=6 / number / {values:[3,4,5,6,7],blanks:[3],shape:mixed}
  - Write the missing numbers in the number track. / A="7, 9" / text / {values:[5,6,7,8,9],blanks:[2,4],shape:mixed}
  - Write the missing number in the number track. / A=4 / number / {values:[1,2,3,4,5],blanks:[3],shape:mixed}

### Y1.B1.S7 1 more — **full**
- full `counting:count_sequence` opts `{"band":10,"dir":"forward"}` (6 generated; Max Number not read)
  - What number comes after 6? / A=7 / number
  - What number comes after 8? / A=9 / number
  - What number comes after 4? / A=5 / number

### Y1.B1.S8 Count backwards within 10 — **full**
- full `counting:count_sequence` opts `{"band":10,"dir":"back"}` (6 generated; Max Number not read)
  - What number comes before 4? / A=3 / number
  - What number comes before 6? / A=5 / number
  - What number comes before 2? / A=1 / number
- full `counting:number_seq_fill` opts `{"step":1,"dir":"back","range":10}` (6 generated; Max Number 10)
  - Write the missing number in the number track. / A=4 / number / {values:[7,6,5,4,3],blanks:[3],shape:mixed}
  - Write the missing numbers in the number track. / A="7, 5" / text / {values:[9,8,7,6,5],blanks:[2,4],shape:mixed}
  - Write the missing number in the number track. / A=2 / number / {values:[5,4,3,2,1],blanks:[3],shape:mixed}

### Y1.B1.S9 1 less — **full**
- full `counting:count_sequence` opts `{"band":10,"dir":"back"}` (6 generated; Max Number not read)
  - What number comes before 4? / A=3 / number
  - What number comes before 6? / A=5 / number
  - What number comes before 2? / A=1 / number

### Y1.B1.S10 Compare groups by matching — **full**
- full `comparing:compare_groups` opts `{"band":10,"level":[1]}` (6 generated; Max Number not read)
  - Do the groups have the same number of counters? / A="not the same" / text / {a:6,b:4,labels:[Same,Not the same],values:[same,not the same],correct:1}
  - Which group has fewer counters? / A="B" / text / {a:9,b:6,labels:[A has fewer,B has fewer],values:[A,B],correct:1}
  - Which group has more counters? / A="B" / text / {a:3,b:4,labels:[A has more,B has more],values:[A,B],correct:1}

### Y1.B1.S11 Fewer, more, same — **full**
- full `comparing:compare_groups` opts `{"band":10,"dir":"mixed"}` (6 generated; Max Number not read)
  - Do the groups have the same number of counters? / A="not the same" / text / {a:6,b:4,labels:[Same,Not the same],values:[same,not the same],correct:1}
  - Which group has fewer counters? / A="B" / text / {a:9,b:6,labels:[A has fewer,B has fewer],values:[A,B],correct:1}
  - Which group has more counters? / A="B" / text / {a:3,b:4,labels:[A has more,B has more],values:[A,B],correct:1}

### Y1.B1.S12 Less than, greater than, equal to — **partial** (missing: the symbols <, >, = and the words greater than, less than, equal to within 10)
- partial `comparing:compare_groups` opts `{"band":10}` (6 generated; Max Number not read)
  - Do the groups have the same number of counters? / A="not the same" / text / {a:6,b:4,labels:[Same,Not the same],values:[same,not the same],correct:1}
  - Which group has fewer counters? / A="B" / text / {a:9,b:6,labels:[A has fewer,B has fewer],values:[A,B],correct:1}
  - Which group has more counters? / A="B" / text / {a:3,b:4,labels:[A has more,B has more],values:[A,B],correct:1}

### Y1.B1.S13 Compare numbers — **partial** (missing: comparing two numbers within 10)
- partial `placevalue:compare` opts `{"band":99}` (6 generated; Max Number not read)
  - Compare: 53 ___ 77 / A="<" / symbol / {keyValue:<,kind:compare,a:53,b:77}
  - Compare: 71 ___ 76 / A="<" / symbol / {keyValue:<,kind:compare,a:71,b:76}
  - Compare: 30 ___ 32 / A="<" / symbol / {keyValue:<,kind:compare,a:30,b:32}

### Y1.B1.S14 Order objects and numbers — **partial** (missing: ordering groups and numbers within 10)
- partial `placevalue:order_least_to_greatest` opts `{"band":99}` (6 generated; Max Number not read)
  - Put the numbers in order. Start with the least. / A="53,77,87" / interactive / {keyValue:53, 77, 87,kind:order,nums:[87,77,53],sorted:[53,77,87]}
  - Put the numbers in order. Start with the least. / A="71,72,76" / interactive / {keyValue:71, 72, 76,kind:order,nums:[76,72,71],sorted:[71,72,76]}
  - Put the numbers in order. Start with the least. / A="30,32,33" / interactive / {keyValue:30, 32, 33,kind:order,nums:[32,33,30],sorted:[30,32,33]}

### Y1.B1.S15 The number line — **gap** (missing: the 0-10 number line: reading, counting along and placing numbers)
- no live skill; build: nl_20

### Y1.B2.S1 Introduce parts and wholes — **partial** (missing: identifying the parts and the whole of a group in words)
- partial `composing:number_bonds` opts `{"band":5}` (6 generated; Max Number not read)
  - 3 + ? = 5 / A=2 / number / {whole:5,a:3,b:2,unknown:B}
  - 1 + 3 = ? / A=4 / number / {whole:4,a:1,b:3,unknown:whole}
  - ? + 1 = 4 / A=3 / number / {whole:4,a:3,b:1,unknown:A}

### Y1.B2.S2 Part-whole model — **full**
- full `composing:number_bonds` opts `{"band":10}` (6 generated; Max Number not read)
  - 2 + ? = 5 / A=3 / number / {whole:5,a:2,b:3,unknown:B}
  - 5 + 2 = ? / A=7 / number / {whole:7,a:5,b:2,unknown:whole}
  - ? + 3 = 4 / A=1 / number / {whole:4,a:1,b:3,unknown:A}

### Y1.B2.S3 Write number sentences — **partial** (missing: writing the + / − sentence that matches a picture (the skills give the sentence))
- partial `addition:add_5_pictures` opts `{}` (6 generated; Max Number not read)
  - How many in all? 1 + 3 = ? / A=4 / number / {kind:join,n:1,m:3,shape:triangle,ans:4}
  - How many in all? 3 + 1 = ? / A=4 / number / {kind:join,n:3,m:1,shape:star,ans:4}
  - How many in all? 1 + 1 = ? / A=2 / number / {kind:join,n:1,m:1,shape:square,ans:2}
- partial `subtraction:sub_5_pictures` opts `{}` (6 generated; Max Number not read)
  - Start with 4, take away 1. How many are left? / A=3 / number / {kind:takeaway,n:4,m:1,shape:square,ans:3}
  - Start with 4, take away 4. How many are left? / A=0 / number / {kind:takeaway,n:4,m:4,shape:triangle,ans:0}
  - Start with 2, take away 1. How many are left? / A=1 / number / {kind:takeaway,n:2,m:1,shape:star,ans:1}

### Y1.B2.S4 Fact families - addition facts — **partial** (missing: the addition facts of a family only: both orders and the = on either side (8 = 6 + 2); both live skills also deal the subtraction facts)
- partial `addition:add_sub_fact_family` opts `{"range":10}` (6 generated; Max Number 10)
  - Complete the fact family. / A="10, 10, 2, 8" / fact-family / {a:8,b:2}
  - Complete the fact family. / A="10, 10, 3, 7" / fact-family / {a:7,b:3}
  - Complete the fact family. / A="5, 5, 2, 3" / fact-family / {a:3,b:2}
- partial `addition:number_families_add` opts `{"band":10}` (6 generated; Max Number not read)
  - Number Family: Complete all equations / A="3, 4, 7" / number-family
  - Number Family: Complete all equations / A="4, 4, 8" / number-family
  - Number Family: Complete all equations / A="2, 1, 3" / number-family

### Y1.B2.S5 Number bonds within 10 — **full**
- full `composing:number_bonds` opts `{"band":10}` (6 generated; Max Number not read)
  - 2 + ? = 5 / A=3 / number / {whole:5,a:2,b:3,unknown:B}
  - 5 + 2 = ? / A=7 / number / {whole:7,a:5,b:2,unknown:whole}
  - ? + 3 = 4 / A=1 / number / {whole:4,a:1,b:3,unknown:A}

### Y1.B2.S6 Systematic number bonds within 10 — **gap** (missing: listing bonds of a number in order (0 + 5, 1 + 4 ...) and seeing the pattern)
- no live skill; build: systematic_bonds

### Y1.B2.S7 Number bonds to 10 — **full**
- full `composing:make_ten` opts `{"band":10}` (6 generated; Max Number not read)
  - The frame shows 5. How many more make 10? / A=5 / number
  - The frame shows 6. How many more make 10? / A=4 / number
  - The frame shows 7. How many more make 10? / A=3 / number

### Y1.B2.S8 Addition - add together — **partial** (missing: adding two pictured groups with totals to 10)
- partial `addition:add_5_pictures` opts `{}` (6 generated; Max Number not read)
  - How many in all? 1 + 3 = ? / A=4 / number / {kind:join,n:1,m:3,shape:triangle,ans:4}
  - How many in all? 3 + 1 = ? / A=4 / number / {kind:join,n:3,m:1,shape:star,ans:4}
  - How many in all? 1 + 1 = ? / A=2 / number / {kind:join,n:1,m:1,shape:square,ans:2}

### Y1.B2.S9 Addition - add more — **full**
- full `addition:add_wp_10` opts `{"band":10}` (6 generated; Max Number not read)
  - I have 2 apples. I get 2 more apples. How many apples do I have now? / A=4 / number / {lines:[I have 2 apples.,I get 2 more apples.,How many apples do I have now?],steps:[{a:2,b:2,op:+,ans:4,top:2
  - There are 5 fish in a pond. 3 more fish swim in. How many fish are there now? / A=8 / number / {lines:[There are 5 fish in a pond.,3 more fish swim in.,How many fish are there now?],steps:[{a:5,b:3,op:+,an
  - 2 stars are on a card. 4 stars are on a page. How many stars are there in all? / A=6 / number / {lines:[2 stars are on a card.,4 stars are on a page.,How many stars are there in all?],steps:[{a:2,b:4,op:+,a
- full `addition:number_line_add` opts `{"range":10}` (6 generated; Max Number 10)
  - Use the number line: 4 + 5 = ? / A=9 / number / {min:0,max:10,start:4,add:5,op:+,unknown:result}
  - Use the number line: 6 + 3 = ? / A=9 / number / {min:0,max:10,start:6,add:3,op:+,unknown:result}
  - Use the number line: 2 + 1 = ? / A=3 / number / {min:0,max:10,start:2,add:1,op:+,unknown:result}

### Y1.B2.S10 Addition problems — **full**
- full `addition:add_wp_10` opts `{"band":10}` (6 generated; Max Number not read)
  - I have 2 apples. I get 2 more apples. How many apples do I have now? / A=4 / number / {lines:[I have 2 apples.,I get 2 more apples.,How many apples do I have now?],steps:[{a:2,b:2,op:+,ans:4,top:2
  - There are 5 fish in a pond. 3 more fish swim in. How many fish are there now? / A=8 / number / {lines:[There are 5 fish in a pond.,3 more fish swim in.,How many fish are there now?],steps:[{a:5,b:3,op:+,an
  - 2 stars are on a card. 4 stars are on a page. How many stars are there in all? / A=6 / number / {lines:[2 stars are on a card.,4 stars are on a page.,How many stars are there in all?],steps:[{a:2,b:4,op:+,a
- full `addition:add_wp_10_plain` opts `{"band":10}` (6 generated; Max Number not read)
  - I have 2 apples. I get 2 more apples. How many apples do I have now? / A=4 / number / {lines:[I have 2 apples.,I get 2 more apples.,How many apples do I have now?],steps:[{a:2,b:2,op:+,ans:4,top:2
  - There are 5 fish in a pond. 3 more fish swim in. How many fish are there now? / A=8 / number / {lines:[There are 5 fish in a pond.,3 more fish swim in.,How many fish are there now?],steps:[{a:5,b:3,op:+,an
  - 2 stars are on a card. 4 stars are on a page. How many stars are there in all? / A=6 / number / {lines:[2 stars are on a card.,4 stars are on a page.,How many stars are there in all?],steps:[{a:2,b:4,op:+,a

### Y1.B2.S11 Find a part — **full**
- full `composing:number_bonds` opts `{"band":10,"unknown":"first"}` (6 generated; Max Number not read)
  - ? + 4 = 10 / A=6 / number / {whole:10,a:6,b:4,unknown:A}
  - ? + 7 = 8 / A=1 / number / {whole:8,a:1,b:7,unknown:A}
  - ? + 2 = 5 / A=3 / number / {whole:5,a:3,b:2,unknown:A}

### Y1.B2.S12 Subtraction - find a part — **full**
- full `composing:number_bonds` opts `{"band":10,"unknown":"second"}` (6 generated; Max Number not read)
  - 4 + ? = 10 / A=6 / number / {whole:10,a:4,b:6,unknown:B}
  - 7 + ? = 8 / A=1 / number / {whole:8,a:7,b:1,unknown:B}
  - 2 + ? = 5 / A=3 / number / {whole:5,a:2,b:3,unknown:B}
- full `subtraction:missing_add_sub` opts `{"range":10}` (6 generated; Max Number 10)
  - 4 + 5 = ___ / A=9 / number
  - 10 − ___ = 2 / A=8 / number
  - 1 + ___ = 4 / A=3 / number

### Y1.B2.S13 Fact families - the eight facts — **full**
- full `addition:add_sub_fact_family` opts `{"range":10}` (6 generated; Max Number 10)
  - Complete the fact family. / A="10, 10, 2, 8" / fact-family / {a:8,b:2}
  - Complete the fact family. / A="10, 10, 3, 7" / fact-family / {a:7,b:3}
  - Complete the fact family. / A="5, 5, 2, 3" / fact-family / {a:3,b:2}
- full `addition:number_families_add` opts `{"band":10}` (6 generated; Max Number not read)
  - Number Family: Complete all equations / A="3, 4, 7" / number-family
  - Number Family: Complete all equations / A="4, 4, 8" / number-family
  - Number Family: Complete all equations / A="2, 1, 3" / number-family

### Y1.B2.S14 Subtraction - take away cross out (How many left ) — **partial** (missing: crossing out to take away from amounts to 10)
- partial `subtraction:sub_5_pictures` opts `{}` (6 generated; Max Number not read)
  - Start with 4, take away 1. How many are left? / A=3 / number / {kind:takeaway,n:4,m:1,shape:square,ans:3}
  - Start with 4, take away 4. How many are left? / A=0 / number / {kind:takeaway,n:4,m:4,shape:triangle,ans:0}
  - Start with 2, take away 1. How many are left? / A=1 / number / {kind:takeaway,n:2,m:1,shape:star,ans:1}

### Y1.B2.S15 Subtraction - take away (How many left ) — **partial** (missing: pictured take-away from amounts to 10 (how many left))
- partial `subtraction:sub_5_pictures` opts `{}` (6 generated; Max Number not read)
  - Start with 4, take away 1. How many are left? / A=3 / number / {kind:takeaway,n:4,m:1,shape:square,ans:3}
  - Start with 4, take away 4. How many are left? / A=0 / number / {kind:takeaway,n:4,m:4,shape:triangle,ans:0}
  - Start with 2, take away 1. How many are left? / A=1 / number / {kind:takeaway,n:2,m:1,shape:star,ans:1}
- partial `subtraction:sub_wp_10` opts `{}` (6 generated; Max Number not read)
  - Ana has 3 stamps. Ana gives 2 stamps to Noor. How many stamps does Ana have left? / A=1 / number / {lines:[Ana has 3 stamps.,Ana gives 2 stamps to Noor.,How many stamps does Ana have left?],steps:[{a:3,b:2,op:
  - There are 4 beads in a box. Noor takes 1 bead out. How many beads are left in the box? / A=3 / number / {lines:[There are 4 beads in a box.,Noor takes 1 bead out.,How many beads are left in the box?],steps:[{a:4,b:
  - Omar has 8 shells. Omar gives 3 shells to Kofi. How many shells does Omar have left? / A=5 / number / {lines:[Omar has 8 shells.,Omar gives 3 shells to Kofi.,How many shells does Omar have left?],steps:[{a:8,b:3,

### Y1.B2.S16 Subtraction on a number line — **full**
- full `subtraction:nl_sub` opts `{"range":10}` (6 generated; Max Number 10)
  - 6 − 4 = ? / A=2 / number / {min:0,max:10,start:6,add:4,op:-,unknown:result}
  - 8 − ? = 3 / A=5 / number / {min:0,max:10,start:8,add:5,op:-,unknown:b}
  - 4 − 1 = ? / A=3 / number / {min:0,max:10,start:4,add:1,op:-,unknown:result}
- full `subtraction:number_line_sub` opts `{"range":10}` (6 generated; Max Number 10)
  - Use the number line: 7 − 5 = ? / A=2 / number / {min:0,max:10,start:7,add:5,op:-,unknown:result}
  - Use the number line: 9 − 6 = ? / A=3 / number / {min:0,max:10,start:9,add:6,op:-,unknown:result}
  - Use the number line: 6 − 1 = ? / A=5 / number / {min:0,max:10,start:6,add:1,op:-,unknown:result}

### Y1.B2.S17 Add or subtract 1 or 2 — **partial** (missing: +1, +2, −1, −2 as a fluency set)
- partial `addition:add_10_mixed` opts `{"notation":["across"]}` (6 generated; Max Number not read)
  - 4 + 2 = ? / A=6 / number
  - 5 + 3 = ? / A=8 / number
  - 1 + 3 = ? / A=4 / number

### Y1.B3.S1 Recognise and name 3-D shapes — **full**
- full `shapes_early:name_3d_shapes` opts `{}` (6 generated; Max Number not read)
  - What 3D shape is this? / A="Cone" / multiple-choice
  - What 3D shape is this? / A="Cone" / multiple-choice
  - Click ALL the cubes. / A=["opt0","opt1"] / multi-select-check
- full `shapes_early:shape_name_match_3d` opts `{}` (6 generated; Max Number not read)
  - Drag each name onto the matching 3D shape. / A={"t0":"b0","t1":"b1","t2":"b2","t3":"b3" / dnd-generic
  - Drag each name onto the matching 3D shape. / A={"t0":"b0","t1":"b1","t2":"b2","t3":"b3" / dnd-generic
  - Drag each name onto the matching 3D shape. / A={"t0":"b0","t1":"b1","t2":"b2","t3":"b3" / dnd-generic

### Y1.B3.S2 Sort 3-D shapes — **gap** (missing: sorting 3-D shapes by a rule (rolls / stacks, faces))
- no live skill; build: shape_sort

### Y1.B3.S3 Recognise and name 2-D shapes — **full**
- full `shapes_early:name_2d_shapes` opts `{"shapes":[0,1,2,4]}` (6 generated; Max Number not read)
  - What shape is this? / A="Oval" / multiple-choice
  - What shape is this? / A="Pentagon" / multiple-choice
  - Click ALL the triangles. / A=["opt3"] / multi-select-check
- full `shapes_early:shape_name_match_2d` opts `{}` (6 generated; Max Number not read)
  - Drag each name onto the matching 2D shape. / A={"t0":"b0","t1":"b1","t2":"b2","t3":"b3" / dnd-generic
  - Drag each name onto the matching 2D shape. / A={"t0":"b0","t1":"b1","t2":"b2","t3":"b3" / dnd-generic
  - Drag each name onto the matching 2D shape. / A={"t0":"b0","t1":"b1","t2":"b2","t3":"b3" / dnd-generic

### Y1.B3.S4 Sort 2-D shapes — **partial** (missing: sorting 2-D shapes into groups)
- partial `shapes_early:shape_attributes` opts `{"forms":[1]}` (6 generated; Max Number not read)
  - Click ALL shapes with 4 sides. / A=["opt1","opt2"] / multi-select-check
  - Click ALL shapes with at least one pair of parallel sides. / A=["opt0","opt3"] / multi-select-check
  - Click ALL shapes with 4 sides. / A=["opt1","opt3"] / multi-select-check

### Y1.B3.S5 Patterns with 2-D and 3-D shapes — **partial** (missing: repeating patterns made of 3-D shapes)
- partial `patterns:shape_pattern` opts `{}` (6 generated; Max Number not read)
  - Look at the pattern. Fill in the missing shapes. / A="circle, diamond" / text
  - Look at the pattern. Fill in the missing shapes. / A="square, square, triangle" / text
  - Look at the pattern. Fill in the missing shapes. / A="triangle, diamond" / text

### Y1.B4.S1 Count within 20 — **full**
- full `counting:count_objects` opts `{"band":20}` (6 generated; Max Number not read)
  - How many circles are there? / A=3 / number / {kind:count,n:3,shape:circle,ans:3}
  - How many triangles are there? / A=10 / number / {kind:count,n:10,shape:triangle,ans:10}
  - How many circles are there? / A=7 / number / {kind:count,n:7,shape:circle,ans:7}

### Y1.B4.S2 Understand 10 — **partial** (missing: 10 as one ten)
- partial `composing:ten_frame_build` opts `{"band":10}` (6 generated; Max Number not read)
  - Build 3 on the ten frame. / A=3 / ten-frame-build / {target:3,frames:1}
  - Build 8 on the ten frame. / A=8 / ten-frame-build / {target:8,frames:1}
  - Build 1 on the ten frame. / A=1 / ten-frame-build / {target:1,frames:1}

### Y1.B4.S3 Understand 11, 12 and 13 — **partial** (missing: 11, 12 and 13 only)
- partial `composing:teen_compose` opts `{"band":15}` (6 generated; Max Number not read)
  - What number is 10 and 3 more? / A=13 / number / {kind:teen,ones:3,askTotal:true,ans:13}
  - 10 and what number make 14? / A=4 / number / {kind:teen,ones:4,askTotal:false,ans:4}
  - What number is 10 and 5 more? / A=15 / number / {kind:teen,ones:5,askTotal:true,ans:15}
- partial `composing:ten_frame_build_teen` opts `{"band":15}` (6 generated; Max Number not read)
  - Build 12 on the ten frames. / A=12 / ten-frame-build
  - Build 11 on the ten frames. / A=11 / ten-frame-build
  - Build 15 on the ten frames. / A=15 / ten-frame-build

### Y1.B4.S4 Understand 14, 15 and 16 — **partial** (missing: 14, 15 and 16 only)
- partial `composing:teen_compose` opts `{"band":19}` (6 generated; Max Number not read)
  - What number is 10 and 5 more? / A=15 / number / {kind:teen,ones:5,askTotal:true,ans:15}
  - 10 and what number make 16? / A=6 / number / {kind:teen,ones:6,askTotal:false,ans:6}
  - What number is 10 and 7 more? / A=17 / number / {kind:teen,ones:7,askTotal:true,ans:17}
- partial `composing:ten_frame_build_teen` opts `{"band":19}` (6 generated; Max Number not read)
  - Build 16 on the ten frames. / A=16 / ten-frame-build
  - Build 11 on the ten frames. / A=11 / ten-frame-build
  - Build 13 on the ten frames. / A=13 / ten-frame-build

### Y1.B4.S5 Understand 17, 18 and 19 — **partial** (missing: 17, 18 and 19 only)
- partial `composing:teen_compose` opts `{"band":19}` (6 generated; Max Number not read)
  - What number is 10 and 5 more? / A=15 / number / {kind:teen,ones:5,askTotal:true,ans:15}
  - 10 and what number make 16? / A=6 / number / {kind:teen,ones:6,askTotal:false,ans:6}
  - What number is 10 and 7 more? / A=17 / number / {kind:teen,ones:7,askTotal:true,ans:17}
- partial `composing:ten_frame_build_teen` opts `{"band":19}` (6 generated; Max Number not read)
  - Build 16 on the ten frames. / A=16 / ten-frame-build
  - Build 11 on the ten frames. / A=11 / ten-frame-build
  - Build 13 on the ten frames. / A=13 / ten-frame-build

### Y1.B4.S6 Understand 20 — **partial** (missing: 20 as two tens)
- partial `composing:ten_frame_build_teen` opts `{"band":19}` (6 generated; Max Number not read)
  - Build 16 on the ten frames. / A=16 / ten-frame-build
  - Build 11 on the ten frames. / A=11 / ten-frame-build
  - Build 13 on the ten frames. / A=13 / ten-frame-build

### Y1.B4.S7 1 more and 1 less — **full**
- full `counting:count_sequence` opts `{"band":20}` (6 generated; Max Number not read)
  - What number comes before 13? / A=12 / number
  - What number goes between 13 and 15? / A=14 / number
  - What number comes after 6? / A=7 / number
- full `placevalue:more_less_10` opts `{"step":1,"band":20}` (6 generated; Max Number not read)
  - What is 1 more than 10? / A=11 / number / {keyValue:11,kind:frame,frame:1 more than 10 is ____.,slotDigits:2}
  - What is 1 less than 15? / A=14 / number / {keyValue:14,kind:frame,frame:1 less than 15 is ____.,slotDigits:2}
  - What is 1 more than 9? / A=10 / number / {keyValue:10,kind:frame,frame:1 more than 9 is ____.,slotDigits:2}

### Y1.B4.S8 The number line to 20 — **gap** (missing: the 0-20 number line: reading and labelling ticks)
- no live skill; build: nl_20

### Y1.B4.S9 Use a number line to 20 — **full**
- full `addition:number_line_add` opts `{"range":20}` (6 generated; Max Number 20)
  - Use the number line: 9 + 8 = ? / A=17 / number / {min:0,max:20,start:9,add:8,op:+,unknown:result}
  - Use the number line: 14 + 5 = ? / A=19 / number / {min:0,max:20,start:14,add:5,op:+,unknown:result}
  - Use the number line: 5 + 1 = ? / A=6 / number / {min:0,max:20,start:5,add:1,op:+,unknown:result}
- full `subtraction:number_line_sub` opts `{"range":20}` (6 generated; Max Number 20)
  - Use the number line: 12 − 8 = ? / A=4 / number / {min:0,max:20,start:12,add:8,op:-,unknown:result}
  - Use the number line: 16 − 7 = ? / A=9 / number / {min:0,max:20,start:16,add:7,op:-,unknown:result}
  - Use the number line: 8 − 1 = ? / A=7 / number / {min:0,max:20,start:8,add:1,op:-,unknown:result}

### Y1.B4.S10 Estimate on a number line to 20 — **gap** (missing: estimating where a number lies on a 0-20 line with only the ends marked)
- no live skill; build: nl_20

### Y1.B4.S11 Compare numbers to 20 — **partial** (missing: comparing numbers within 20)
- partial `placevalue:compare` opts `{"band":99}` (6 generated; Max Number not read)
  - Compare: 53 ___ 77 / A="<" / symbol / {keyValue:<,kind:compare,a:53,b:77}
  - Compare: 71 ___ 76 / A="<" / symbol / {keyValue:<,kind:compare,a:71,b:76}
  - Compare: 30 ___ 32 / A="<" / symbol / {keyValue:<,kind:compare,a:30,b:32}

### Y1.B4.S12 Order numbers to 20 — **partial** (missing: ordering numbers within 20)
- partial `placevalue:order_least_to_greatest` opts `{"band":99}` (6 generated; Max Number not read)
  - Put the numbers in order. Start with the least. / A="53,77,87" / interactive / {keyValue:53, 77, 87,kind:order,nums:[87,77,53],sorted:[53,77,87]}
  - Put the numbers in order. Start with the least. / A="71,72,76" / interactive / {keyValue:71, 72, 76,kind:order,nums:[76,72,71],sorted:[71,72,76]}
  - Put the numbers in order. Start with the least. / A="30,32,33" / interactive / {keyValue:30, 32, 33,kind:order,nums:[32,33,30],sorted:[30,32,33]}

### Y1.B5.S1 Add by counting on within 20 — **full**
- full `addition:add_20_no_regroup` opts `{"band":20,"notation":["across"]}` (6 generated; Max Number not read)
  - 7 + 12 = ? / A=19 / number
  - 4 + 12 = ? / A=16 / number
  - 3 + 6 = ? / A=9 / number
- full `addition:number_line_add` opts `{"range":20}` (6 generated; Max Number 20)
  - Use the number line: 9 + 8 = ? / A=17 / number / {min:0,max:20,start:9,add:8,op:+,unknown:result}
  - Use the number line: 14 + 5 = ? / A=19 / number / {min:0,max:20,start:14,add:5,op:+,unknown:result}
  - Use the number line: 5 + 1 = ? / A=6 / number / {min:0,max:20,start:5,add:1,op:+,unknown:result}

### Y1.B5.S2 Add ones using number bonds — **partial** (missing: adding ones to a teen number using a known bond, shown with a ten and ones)
- partial `addition:add_20_no_regroup` opts `{"band":20,"notation":["across"]}` (6 generated; Max Number not read)
  - 7 + 12 = ? / A=19 / number
  - 4 + 12 = ? / A=16 / number
  - 3 + 6 = ? / A=9 / number

### Y1.B5.S3 Find and make number bonds to 20 — **partial** (missing: all bonds to 20)
- partial `composing:make_ten` opts `{"band":20}` (6 generated; Max Number not read)
  - The frame shows 15. How many more make 20? / A=5 / number
  - The frame shows 16. How many more make 20? / A=4 / number
  - The frame shows 17. How many more make 20? / A=3 / number

### Y1.B5.S4 Doubles — **full**
- full `number_sense:doubles_near_doubles` opts `{"forms":[0]}` (6 generated; Max Number not read)
  - Double it! 5 + 5 = ? / A=10 / number
  - Double it! 8 + 8 = ? / A=16 / number
  - Double it! 3 + 3 = ? / A=6 / number

### Y1.B5.S5 Near doubles — **full**
- full `number_sense:doubles_near_doubles` opts `{"forms":[1,2]}` (6 generated; Max Number not read)
  - Use doubles: 5 + 6 = ? / A=11 / number
  - Use doubles: 8 + 7 = ? / A=15 / number
  - Use doubles: 3 + 4 = ? / A=7 / number

### Y1.B5.S6 Subtract ones using number bonds — **partial** (missing: subtracting ones from a teen number using a known bond)
- partial `subtraction:sub_20_no_regroup` opts `{"band":20,"notation":["across"]}` (6 generated; Max Number not read)
  - 19 − 7 = ? / A=12 / number
  - 16 − 4 = ? / A=12 / number
  - 9 − 3 = ? / A=6 / number

### Y1.B5.S7 Subtraction - counting back — **full**
- full `subtraction:nl_sub` opts `{"range":20}` (6 generated; Max Number 20)
  - 11 − 8 = ? / A=3 / number / {min:0,max:20,start:11,add:8,op:-,unknown:result}
  - 16 − ? = 9 / A=7 / number / {min:0,max:20,start:16,add:7,op:-,unknown:b}
  - 7 − 1 = ? / A=6 / number / {min:0,max:20,start:7,add:1,op:-,unknown:result}
- full `subtraction:number_line_sub` opts `{"range":20}` (6 generated; Max Number 20)
  - Use the number line: 12 − 8 = ? / A=4 / number / {min:0,max:20,start:12,add:8,op:-,unknown:result}
  - Use the number line: 16 − 7 = ? / A=9 / number / {min:0,max:20,start:16,add:7,op:-,unknown:result}
  - Use the number line: 8 − 1 = ? / A=7 / number / {min:0,max:20,start:8,add:1,op:-,unknown:result}

### Y1.B5.S8 Subtraction - finding the difference — **partial** (missing: difference as comparison (bars, line))
- partial `addition:comparison_word` opts `{"range":10}` (6 generated; Max Number 10)
  - James has 8 apps. Tariq has 6 apps. How many MORE apps does James have than Tariq? / A=2 / number
  - Zoe has 8 stickers. Kai has 7 stickers. How many FEWER stickers does Kai have than Zoe? / A=1 / number
  - Olivia has 4 stickers. Lily has 1 sticker. How many MORE stickers does Olivia have than Lily? / A=3 / number

### Y1.B5.S9 Related facts — **full**
- full `addition:number_families_add` opts `{"band":20}` (6 generated; Max Number not read)
  - Number Family: Complete all equations / A="5, 8, 13" / number-family
  - Number Family: Complete all equations / A="8, 7, 15" / number-family
  - Number Family: Complete all equations / A="3, 1, 4" / number-family

### Y1.B5.S10 Missing number problems — **full**
- full `addition:cloze_addition` opts `{"range":20}` (6 generated; Max Number 20)
  - Pick one number from each bank to make 13. / A="10, 3" / text / {sum:13,a:10,b:3,banks:[[6,10,12],[3,4,5]]}
  - Pick one number from each bank to make 17. / A="12, 5" / text / {sum:17,a:12,b:5,banks:[[10,11,12],[1,5,8]]}
  - Pick one number from each bank to make 9. / A="1, 8" / text / {sum:9,a:1,b:8,banks:[[1,4,5],[6,8,9]]}
- full `subtraction:missing_add_sub` opts `{"range":20}` (6 generated; Max Number 20)
  - 8 + 9 = ___ / A=17 / number
  - 17 − ___ = 3 / A=14 / number
  - 1 + ___ = 6 / A=5 / number

### Y1.B6.S1 Count from 20 to 50 — **partial** (missing: counting on from 20 to 50 only (the tracks and the chart start below 20))
- partial `counting:number_seq_fill` opts `{"step":1,"range":50}` (6 generated; Max Number 50)
  - Write the missing numbers in the number track. / A="37, 39" / text / {values:[35,36,37,38,39],blanks:[2,4],shape:mixed}
  - Write the missing number in the number track. / A=36 / number / {values:[34,35,36,37,38],blanks:[2],shape:mixed}
  - Write the missing numbers in the number track. / A="12, 11" / text / {values:[14,13,12,11,10],blanks:[2,3],shape:mixed}
- partial `composing:hundreds_chart_fill` opts `{"band":50}` (6 generated; Max Number not read)
  - Write the missing numbers in the empty boxes. / A="15, 19, 27" / text / {rows:[1,2,3],cols:[4,5,6,7,8],blanks:[15,19,27]}
  - What number goes in the empty box? / A=36 / number / {rows:[2,3,4],cols:[4,5,6,7,8],blanks:[36]}
  - Write the missing numbers in the empty boxes. / A="3, 22" / text / {rows:[0,1,2],cols:[0,1,2,3,4],blanks:[3,22]}

### Y1.B6.S2 20, 30, 40 and 50 — **partial** (missing: saying and writing 20, 30, 40 and 50 for 2-5 tens (the skill answers only how many tens))
- partial `composing:tens_foundation_visual` opts `{"band":50}` (6 generated; Max Number not read)
  - How many tens? / A=3 / number / {kind:tens,n:3,ans:3}
  - How many tens? / A=4 / number / {kind:tens,n:4,ans:4}
  - How many tens? / A=5 / number / {kind:tens,n:5,ans:5}

### Y1.B6.S3 Count by making groups of tens — **partial** (missing: grouping a loose set into tens to count it)
- partial `composing:tens_foundation_visual` opts `{"band":50}` (6 generated; Max Number not read)
  - How many tens? / A=3 / number / {kind:tens,n:3,ans:3}
  - How many tens? / A=4 / number / {kind:tens,n:4,ans:4}
  - How many tens? / A=5 / number / {kind:tens,n:5,ans:5}

### Y1.B6.S4 Groups of tens and ones — **full**
- full `composing:base10_build` opts `{"band":50}` (6 generated; Max Number not read)
  - Build 19 with base-10 blocks. / A=19 / base10-build / {target:19,places:[10,1],counts:{1:9,10:1}}
  - Build 43 with base-10 blocks. / A=43 / base10-build / {target:43,places:[10,1],counts:{1:3,10:4}}
  - Build 30 with base-10 blocks. / A=30 / base10-build / {target:30,places:[10,1],counts:{1:0,10:3}}

### Y1.B6.S5 Partition into tens and ones — **full**
- full `composing:base10_build` opts `{"band":50}` (6 generated; Max Number not read)
  - Build 19 with base-10 blocks. / A=19 / base10-build / {target:19,places:[10,1],counts:{1:9,10:1}}
  - Build 43 with base-10 blocks. / A=43 / base10-build / {target:43,places:[10,1],counts:{1:3,10:4}}
  - Build 30 with base-10 blocks. / A=30 / base10-build / {target:30,places:[10,1],counts:{1:0,10:3}}

### Y1.B6.S6 The number line to 50 — **partial** (missing: the 0-50 line)
- partial `number_sense:place_on_number_line` opts `{"span":10,"band":100}` (6 generated; Max Number not read)
  - Tap 57 on the number line. / A=57 / number-line-extended / {keyValue:57,kind:line-mark,n:57,lo:50,hi:60}
  - Tap 75 on the number line. / A=75 / number-line-extended / {keyValue:75,kind:line-mark,n:75,lo:70,hi:80}
  - Tap 31 on the number line. / A=31 / number-line-extended / {keyValue:31,kind:line-mark,n:31,lo:30,hi:40}

### Y1.B6.S7 Estimate on a number line to 50 — **partial** (missing: estimating on a 0-50 line)
- partial `number_sense:place_on_number_line` opts `{"span":10,"band":100}` (6 generated; Max Number not read)
  - Tap 57 on the number line. / A=57 / number-line-extended / {keyValue:57,kind:line-mark,n:57,lo:50,hi:60}
  - Tap 75 on the number line. / A=75 / number-line-extended / {keyValue:75,kind:line-mark,n:75,lo:70,hi:80}
  - Tap 31 on the number line. / A=31 / number-line-extended / {keyValue:31,kind:line-mark,n:31,lo:30,hi:40}

### Y1.B6.S8 1 more, 1 less — **full**
- full `placevalue:more_less_10` opts `{"step":1,"band":50}` (6 generated; Max Number not read)
  - What is 1 more than 24? / A=25 / number / {keyValue:25,kind:frame,frame:1 more than 24 is ____.,slotDigits:2}
  - What is 1 less than 37? / A=36 / number / {keyValue:36,kind:frame,frame:1 less than 37 is ____.,slotDigits:2}
  - What is 1 more than 19? / A=20 / number / {keyValue:20,kind:frame,frame:1 more than 19 is ____.,slotDigits:2}

### Y1.B7.S1 Compare lengths and heights — **full**
- full `comparing:compare_objects` opts `{}` (6 generated; Max Number not read)
  - Which tower is taller? / A="B" / text
  - Which tower is shorter? / A="A" / text
  - Which bar is thicker? / A="B" / text
- full `shapes_early:order_objects_length` opts `{}` (6 generated; Max Number not read)
  - Order the objects from shortest to longest. / A=["t_C","t_A","t_B"] / dnd-generic
  - Order the objects from shortest to longest. / A=["t_B","t_D","t_C","t_A"] / dnd-generic
  - Order the objects from shortest to longest. / A=["t_A","t_B","t_C"] / dnd-generic

### Y1.B7.S2 Measure length using objects — **full**
- full `shapes_early:measure_nonstandard` opts `{}` (6 generated; Max Number not read)
  - How many cubes long is the stick? / A=8 / number
  - How many crayons long is the stick? / A=3 / number
  - How many paper clips long is the pencil? / A=4 / number

### Y1.B7.S3 Measure length in centimetres — **partial** (missing: measuring in centimetres)
- partial `measurement:reading_ruler` opts `{}` (6 generated; Max Number not read)
  - What length does the arrow point to? / A=6 / number / {len:6,meas:6,res:1,labels:all,ans:6}
  - What length does the arrow point to? / A=1 / number / {len:6,meas:1,res:1,labels:all,ans:1}
  - What length does the arrow point to? / A=2 / number / {len:6,meas:2,res:1,labels:all,ans:2}

### Y1.B8.S1 Heavier and lighter — **full**
- full `measurement:heavier_lighter_visual` opts `{}` (6 generated; Max Number not read)
  - Which is heavier? / A="🐕" / multiple-choice
  - Which is lighter? / A="🍃" / multiple-choice
  - Which is heavier? / A="🐕" / multiple-choice

### Y1.B8.S2 Measure mass — **gap** (missing: measuring mass with cubes on a balance)
- no live skill; build: nonstandard_mass

### Y1.B8.S3 Compare mass — **partial** (missing: comparing two masses measured in cubes)
- partial `measurement:heavier_lighter_visual` opts `{}` (6 generated; Max Number not read)
  - Which is heavier? / A="🐕" / multiple-choice
  - Which is lighter? / A="🍃" / multiple-choice
  - Which is heavier? / A="🐕" / multiple-choice

### Y1.B8.S4 Full and empty — **gap** (missing: full, empty, half full)
- no live skill; build: capacity_early

### Y1.B8.S5 Compare volume — **gap** (missing: comparing volume in containers)
- no live skill; build: capacity_early

### Y1.B8.S6 Measure capacity — **gap** (missing: measuring capacity with cups or scoops)
- no live skill; build: nonstandard_capacity

### Y1.B8.S7 Compare capacity — **gap** (missing: comparing capacities measured in cups)
- no live skill; build: nonstandard_capacity

### Y1.B9.S1 Count in 2s — **partial** (missing: counting in 2s from 0 on true multiples, a page of 2s alone, with pictured pairs)
- partial `patterns:skip_count_line` opts `{"step":[0],"band":50}` (6 generated; Max Number 10)
  - Fill in the missing numbers. Skip count by 2s. / A="6, 8, 16" / text
  - Fill in the missing numbers. Skip count by 2s. / A="2, 8, 12" / text
  - Fill in the missing numbers. Skip count by 2s. / A="6, 8, 12" / text

### Y1.B9.S2 Count in 10s — **partial** (missing: counting in 10s from 0 on true multiples to 100, a page of 10s alone)
- partial `patterns:skip_count_line` opts `{"step":[0],"band":50}` (6 generated; Max Number 10)
  - Fill in the missing numbers. Skip count by 2s. / A="6, 8, 16" / text
  - Fill in the missing numbers. Skip count by 2s. / A="2, 8, 12" / text
  - Fill in the missing numbers. Skip count by 2s. / A="6, 8, 12" / text

### Y1.B9.S3 Count in 5s — **partial** (missing: counting in 5s from 0 on true multiples, a page of 5s alone)
- partial `patterns:skip_count_line` opts `{"step":[0],"band":50}` (6 generated; Max Number 10)
  - Fill in the missing numbers. Skip count by 2s. / A="6, 8, 16" / text
  - Fill in the missing numbers. Skip count by 2s. / A="2, 8, 12" / text
  - Fill in the missing numbers. Skip count by 2s. / A="6, 8, 12" / text

### Y1.B9.S4 Recognise equal groups — **partial** (missing: deciding whether groups are equal and saying equal / not equal)
- partial `multiplication:equal_or_unequal_groups` opts `{"step":6}` (6 generated; Max Number not read)
  - 3 groups, 15 counters in all. Write multiply if every group is the same, or add if they are not. / A="multiply" / text
  - 4 groups, 20 counters in all. Write multiply if every group is the same, or add if they are not. / A="add" / text
  - 2 groups, 4 counters in all. Write multiply if every group is the same, or add if they are not. / A="multiply" / text

### Y1.B9.S5 Add equal groups — **full**
- full `multiplication:arrays_groups` opts `{"forms":[1],"range":10}` (6 generated; Max Number not read)
  - ___ groups of ___ make ___ in all. / A=15 / inline-blanks / {kind:equal_groups,rows:3,cols:5}
  - ___ groups of ___ make ___ in all. / A=16 / inline-blanks / {kind:equal_groups,rows:4,cols:4}
  - ___ groups of ___ make ___ in all. / A=4 / inline-blanks / {kind:equal_groups,rows:2,cols:2}

### Y1.B9.S6 Make arrays — **full**
- full `multiplication:arrays_groups` opts `{"forms":[0],"range":10}` (6 generated; Max Number not read)
  - ___ rows of ___ make ___ in all. / A=15 / inline-blanks / {kind:write_mult,rows:3,cols:5}
  - ___ rows of ___ make ___ in all. / A=16 / inline-blanks / {kind:write_mult,rows:4,cols:4}
  - ___ rows of ___ make ___ in all. / A=4 / inline-blanks / {kind:write_mult,rows:2,cols:2}

### Y1.B9.S7 Make doubles — **full**
- full `number_sense:doubles_near_doubles` opts `{"forms":[0]}` (6 generated; Max Number not read)
  - Double it! 5 + 5 = ? / A=10 / number
  - Double it! 8 + 8 = ? / A=16 / number
  - Double it! 3 + 3 = ? / A=6 / number
- full `patterns:double` opts `{"band":20}` (6 generated; Max Number 10)
  - Double 8 / A=16 / number
  - Double 8 / A=16 / number
  - Double 2 / A=4 / number

### Y1.B9.S8 Make equal groups - grouping — **full**
- full `division:share_into_groups` opts `{"band":12}` (6 generated; Max Number not read)
  - There are 12 counters. Make groups of 6. How many groups are there? / A=2 / number / {kind:share,n:12,size:6,ans:2}
  - There are 12 counters. Make groups of 3. How many groups are there? / A=4 / number / {kind:share,n:12,size:3,ans:4}
  - There are 9 counters. Make groups of 3. How many groups are there? / A=3 / number / {kind:share,n:9,size:3,ans:3}

### Y1.B9.S9 Make equal groups - sharing — **partial** (missing: sharing (how many each))
- partial `division:share_into_groups` opts `{"band":12}` (6 generated; Max Number not read)
  - There are 12 counters. Make groups of 6. How many groups are there? / A=2 / number / {kind:share,n:12,size:6,ans:2}
  - There are 12 counters. Make groups of 3. How many groups are there? / A=4 / number / {kind:share,n:12,size:3,ans:4}
  - There are 9 counters. Make groups of 3. How many groups are there? / A=3 / number / {kind:share,n:9,size:3,ans:3}

### Y1.B10.S1 Recognise a half of an object or a shape — **full**
- full `shapes_early:partition_shapes` opts `{"parts":[0]}` (6 generated; Max Number not read)
  - What fraction of the shape is shaded? / A="1/2" / text
  - How many equal parts is this shape divided into? / A=2 / number
  - How many equal parts is this shape divided into? / A=2 / number

### Y1.B10.S2 Find a half of an object or a shape — **partial** (missing: finding (shading) a half of a shape only)
- partial `fractions:shade_fraction` opts `{"denoms":[2]}` (6 generated; Max Number not read)
  - Show 7/8 on the model. / A="7" / shade-parts / {task:shade,show:{n:7,d:8},terms:[{n:7,d:8,kind:circle,blank:true,frac:none}],answer:{shade:7}}
  - Show 1/2 on the model. / A="1" / shade-parts / {task:shade,show:{n:1,d:2},terms:[{n:1,d:2,kind:area,blank:true,frac:none}],answer:{shade:1},showAbove:true}
  - Show 1/2 on the model. / A="1" / shade-parts / {task:shade,show:{n:1,d:2},terms:[{n:1,d:2,kind:circle,blank:true,frac:none}],answer:{shade:1}}

### Y1.B10.S3 Recognise a half of a quantity — **partial** (missing: is this set in halves? (two equal groups or not); the live option leaks thirds, fifths and sixths)
- partial `fractions:fraction_of_set` opts `{"denoms":[2],"range":10}` (6 generated; Max Number 10)
  - ?/4 of 8 = 4. Find the missing numerator. / A=2 / number
  - ?/6 of 12 = 8. Find the missing numerator. / A=4 / number
  - There are 4 stickers. 1/2 are purple. How many purple stickers? / A=2 / number

### Y1.B10.S4 Find a half of a quantity — **full**
- full `patterns:halve` opts `{"band":10,"range":10}` (6 generated; Max Number 10)
  - Half of 8 / A=4 / number
  - Half of 8 / A=4 / number
  - Half of 2 / A=1 / number

### Y1.B10.S5 Recognise a quarter of an object or a shape — **full**
- full `shapes_early:partition_shapes` opts `{"parts":[2]}` (6 generated; Max Number not read)
  - What fraction of the shape is shaded? / A="3/4" / text
  - How many equal parts is this shape divided into? / A=4 / number
  - How many equal parts is this shape divided into? / A=4 / number

### Y1.B10.S6 Find a quarter of an object or a shape — **partial** (missing: finding (shading) a quarter of a shape only)
- partial `fractions:shade_fraction` opts `{"denoms":[2]}` (6 generated; Max Number not read)
  - Show 7/8 on the model. / A="7" / shade-parts / {task:shade,show:{n:7,d:8},terms:[{n:7,d:8,kind:circle,blank:true,frac:none}],answer:{shade:7}}
  - Show 1/2 on the model. / A="1" / shade-parts / {task:shade,show:{n:1,d:2},terms:[{n:1,d:2,kind:area,blank:true,frac:none}],answer:{shade:1},showAbove:true}
  - Show 1/2 on the model. / A="1" / shade-parts / {task:shade,show:{n:1,d:2},terms:[{n:1,d:2,kind:circle,blank:true,frac:none}],answer:{shade:1}}

### Y1.B10.S7 Recognise a quarter of a quantity — **partial** (missing: is this set in quarters? (four equal groups or not); the live option leaks thirds, fifths and sixths)
- partial `fractions:fraction_of_set` opts `{"denoms":[2],"range":10}` (6 generated; Max Number 10)
  - ?/4 of 8 = 4. Find the missing numerator. / A=2 / number
  - ?/6 of 12 = 8. Find the missing numerator. / A=4 / number
  - There are 4 stickers. 1/2 are purple. How many purple stickers? / A=2 / number

### Y1.B10.S8 Find a quarter of a quantity — **partial** (missing: finding a quarter of a quantity only (the live option also deals halves and leaks thirds, fifths and sixths))
- partial `fractions:fraction_of_set` opts `{"denoms":[2],"range":10}` (6 generated; Max Number 10)
  - ?/4 of 8 = 4. Find the missing numerator. / A=2 / number
  - ?/6 of 12 = 8. Find the missing numerator. / A=4 / number
  - There are 4 stickers. 1/2 are purple. How many purple stickers? / A=2 / number

### Y1.B11.S1 Describe turns — **gap** (missing: whole, half and quarter turns)
- no live skill; build: turns

### Y1.B11.S2 Describe position - left and right — **partial** (missing: left and right)
- partial `shapes_early:shape_positions` opts `{}` (6 generated; Max Number not read)
  - Where is the ball compared to the heart? / A="Below" / multiple-choice
  - Where is the star compared to the ball? / A="Beside" / multiple-choice
  - Where is the ball compared to the star? / A="Above" / multiple-choice

### Y1.B11.S3 Describe position - forwards and backwards — **gap** (missing: forwards and backwards moves)
- no live skill; build: position_map

### Y1.B11.S4 Describe position - above and below — **full**
- full `shapes_early:shape_positions` opts `{"forms":[0]}` (6 generated; Max Number not read)
  - Where is the ball compared to the heart? / A="Below" / multiple-choice
  - Where is the ball compared to the heart? / A="Above" / multiple-choice
  - Where is the ball compared to the star? / A="Above" / multiple-choice

### Y1.B11.S5 Ordinal numbers — **gap** (missing: ordinal numbers 1st, 2nd, 3rd ...)
- no live skill; build: ordinal

### Y1.B12.S1 Count from 50 to 100 — **partial** (missing: counting on from 50 to 100 only (the tracks and the chart deal mostly below 50))
- partial `counting:number_seq_fill` opts `{"step":1,"range":100}` (6 generated; Max Number 100)
  - Write the missing numbers in the number track. / A="74, 76" / text / {values:[72,73,74,75,76],blanks:[2,4],shape:mixed}
  - Write the missing number in the number track. / A=73 / number / {values:[71,72,73,74,75],blanks:[2],shape:mixed}
  - Write the missing numbers in the number track. / A="24, 23" / text / {values:[26,25,24,23,22],blanks:[2,3],shape:mixed}
- partial `composing:hundreds_chart_fill` opts `{"band":100}` (6 generated; Max Number not read)
  - Write the missing numbers in the empty boxes. / A="35, 39, 47" / text / {rows:[3,4,5],cols:[4,5,6,7,8],blanks:[35,39,47]}
  - What number goes in the empty box? / A=66 / number / {rows:[5,6,7],cols:[4,5,6,7,8],blanks:[66]}
  - Write the missing numbers in the empty boxes. / A="13, 32" / text / {rows:[1,2,3],cols:[0,1,2,3,4],blanks:[13,32]}

### Y1.B12.S2 Tens to 100 — **partial** (missing: counting the tens to 100, with 100 as ten tens (band 90 stops at 9 tens) and naming each multiple of ten)
- partial `composing:tens_foundation_visual` opts `{"band":90}` (6 generated; Max Number not read)
  - How many tens? / A=5 / number / {kind:tens,n:5,ans:5}
  - How many tens? / A=6 / number / {kind:tens,n:6,ans:6}
  - How many tens? / A=7 / number / {kind:tens,n:7,ans:7}

### Y1.B12.S3 Partition into tens and ones — **full**
- full `composing:base10_build` opts `{"band":99}` (6 generated; Max Number not read)
  - Build 60 with base-10 blocks. / A=60 / base10-build / {target:60,places:[10,1],counts:{1:0,10:6}}
  - Build 17 with base-10 blocks. / A=17 / base10-build / {target:17,places:[10,1],counts:{1:7,10:1}}
  - Build 34 with base-10 blocks. / A=34 / base10-build / {target:34,places:[10,1],counts:{1:4,10:3}}
- full `placevalue:unit_form` opts `{"band":99}` (6 generated; Max Number not read)
  - 57 = ___ tens ___ ones / A="5 tens 7 ones" / inline-blanks / {keyValue:5 tens 7 ones,kind:blanks,n:57,frame:57 = ____ tens ____ ones,keys:[5,7],words:true}
  - 77 = ___ tens ___ ones / A="7 tens 7 ones" / inline-blanks / {keyValue:7 tens 7 ones,kind:blanks,n:77,frame:77 = ____ tens ____ ones,keys:[7,7],words:true}
  - 31 = ___ tens ___ ones / A="3 tens 1 one" / inline-blanks / {keyValue:3 tens 1 one,kind:blanks,n:31,frame:31 = ____ tens ____ ones,keys:[3,1],words:true}

### Y1.B12.S4 The number line to 100 — **partial** (missing: the 0-100 line)
- partial `number_sense:place_on_number_line` opts `{"span":10,"band":100}` (6 generated; Max Number not read)
  - Tap 57 on the number line. / A=57 / number-line-extended / {keyValue:57,kind:line-mark,n:57,lo:50,hi:60}
  - Tap 75 on the number line. / A=75 / number-line-extended / {keyValue:75,kind:line-mark,n:75,lo:70,hi:80}
  - Tap 31 on the number line. / A=31 / number-line-extended / {keyValue:31,kind:line-mark,n:31,lo:30,hi:40}

### Y1.B12.S5 1 more, 1 less — **full**
- full `placevalue:more_less_10` opts `{"step":1,"band":100}` (6 generated; Max Number not read)
  - What is 1 more than 49? / A=50 / number / {keyValue:50,kind:frame,frame:1 more than 49 is ____.,slotDigits:3}
  - What is 1 less than 74? / A=73 / number / {keyValue:73,kind:frame,frame:1 less than 74 is ____.,slotDigits:3}
  - What is 1 more than 29? / A=30 / number / {keyValue:30,kind:frame,frame:1 more than 29 is ____.,slotDigits:3}

### Y1.B12.S6 Compare numbers with the same number of tens — **partial** (missing: comparing numbers with the same number of tens)
- partial `placevalue:compare` opts `{"band":99}` (6 generated; Max Number not read)
  - Compare: 53 ___ 77 / A="<" / symbol / {keyValue:<,kind:compare,a:53,b:77}
  - Compare: 71 ___ 76 / A="<" / symbol / {keyValue:<,kind:compare,a:71,b:76}
  - Compare: 30 ___ 32 / A="<" / symbol / {keyValue:<,kind:compare,a:30,b:32}

### Y1.B12.S7 Compare any two numbers — **full**
- full `placevalue:compare` opts `{"band":99}` (6 generated; Max Number not read)
  - Compare: 53 ___ 77 / A="<" / symbol / {keyValue:<,kind:compare,a:53,b:77}
  - Compare: 71 ___ 76 / A="<" / symbol / {keyValue:<,kind:compare,a:71,b:76}
  - Compare: 30 ___ 32 / A="<" / symbol / {keyValue:<,kind:compare,a:30,b:32}

### Y1.B13.S1 Unitising — **partial** (missing: unitising: one coin worth 5 or 10 is the same as 5 or 10 ones)
- partial `composing:tens_foundation_visual` opts `{"band":50}` (6 generated; Max Number not read)
  - How many tens? / A=3 / number / {kind:tens,n:3,ans:3}
  - How many tens? / A=4 / number / {kind:tens,n:4,ans:4}
  - How many tens? / A=5 / number / {kind:tens,n:5,ans:5}
- partial `measurement:coin_value` opts `{"currency":"usd"}` (6 generated; Max Number not read)
  - Circle every coin worth the number. Write how many. / A=5 / number / {kind:find,coins:[5,5,1,25,1,5,5,5],notes:[5,1],target:5,count:5,currency:usd,dots:none,wrap:4}
  - Circle every coin worth the number. Write how many. / A=4 / number / {kind:find,coins:[5,1,10,5,1,1,1,5],notes:[1,1],target:1,count:4,currency:usd,dots:none,wrap:4}
  - Circle every coin worth the number. Write how many. / A=2 / number / {kind:find,coins:[5,1,1,1,1,1,5,25],notes:[5,5],target:5,count:2,currency:usd,dots:none,wrap:4}

### Y1.B13.S2 Recognise coins — **full**
- full `measurement:coin_value` opts `{"currency":"usd"}` (6 generated; Max Number not read)
  - Circle every coin worth the number. Write how many. / A=5 / number / {kind:find,coins:[5,5,1,25,1,5,5,5],notes:[5,1],target:5,count:5,currency:usd,dots:none,wrap:4}
  - Circle every coin worth the number. Write how many. / A=4 / number / {kind:find,coins:[5,1,10,5,1,1,1,5],notes:[1,1],target:1,count:4,currency:usd,dots:none,wrap:4}
  - Circle every coin worth the number. Write how many. / A=2 / number / {kind:find,coins:[5,1,1,1,1,1,5,25],notes:[5,5],target:5,count:2,currency:usd,dots:none,wrap:4}

### Y1.B13.S3 Recognise notes — **partial** (missing: recognising bills and naming each bill's value)
- partial `measurement:coin_value` opts `{"currency":"usd","task":"order"}` (6 generated; Max Number not read)
  - Write 1, 2, 3 under the notes. Start with the least. / A="4, 3, 2, 1" / text / {kind:order,notes:[100,20,10,1],ranks:[4,3,2,1],currency:usd}
  - Write 1, 2, 3 under the notes. Start with the least. / A="3, 2, 1" / text / {kind:order,notes:[100,20,5],ranks:[3,2,1],currency:usd}
  - Write 1, 2, 3 under the notes. Start with the least. / A="1, 4, 2, 3" / text / {kind:order,notes:[10,100,20,50],ranks:[1,4,2,3],currency:usd}
- partial `measurement:money_count` opts `{"currency":"usd","kind":"note","band":100}` (6 generated; Max Number not read)
  - Count the money. Write the total. / A=100 / number / {kind:count,notes:[20,20,20,20,20],coins:[],currency:usd,answer:major,total:100,dots:none}
  - Count the money. Write the total. / A=20 / number / {kind:count,notes:[5,5,5,5],coins:[],currency:usd,answer:major,total:20,dots:none}
  - Count the money. Write the total. / A=10 / number / {kind:count,notes:[5,5],coins:[],currency:usd,answer:major,total:10,dots:none}

### Y1.B13.S4 Count in coins — **full**
- full `measurement:money_count` opts `{"currency":"usd","kind":"like","band":50,"values":[1,5,10]}` (6 generated; Max Number not read)
  - Count the coins. Write the total. / A=5 / number / {kind:count,coins:[5],notes:[],currency:usd,answer:minor,total:5,dots:auto}
  - Count the coins. Write the total. / A=50 / number / {kind:count,coins:[10,10,10,10,10],notes:[],currency:usd,answer:minor,total:50,dots:auto}
  - Count the coins. Write the total. / A=10 / number / {kind:count,coins:[5,5],notes:[],currency:usd,answer:minor,total:10,dots:auto}

### Y1.B14.S1 Before and after — **gap** (missing: before and after; sequencing events)
- no live skill; build: day_order

### Y1.B14.S2 Days of the week — **gap** (missing: days of the week in order)
- no live skill; build: time_talk

### Y1.B14.S3 Months of the year — **gap** (missing: months of the year in order)
- no live skill; build: time_talk

### Y1.B14.S4 Hours, minutes and seconds — **gap** (missing: choosing hours, minutes or seconds for an activity)
- no live skill; build: time_units

### Y1.B14.S5 Tell the time to the hour — **full**
- full `measurement:time_hour` opts `{}` (6 generated; Max Number not read)
  - Write the time. / A="12:00" / text / {kind:read,h:12,m:0,precision:60,ring:auto,numerals:all}
  - Write the time. / A="10:00" / text / {kind:read,h:10,m:0,precision:60,ring:auto,numerals:all}
  - Write the time. / A="1:00" / text / {kind:read,h:1,m:0,precision:60,ring:auto,numerals:all}

### Y1.B14.S6 Tell the time to the half hour — **full**
- full `measurement:time_half_hour` opts `{}` (6 generated; Max Number not read)
  - Write the time. / A="12:30" / text / {kind:read,h:12,m:30,precision:30,ring:auto,numerals:all}
  - Write the time. / A="10:30" / text / {kind:read,h:10,m:30,precision:30,ring:auto,numerals:all}
  - Write the time. / A="1:30" / text / {kind:read,h:1,m:30,precision:30,ring:auto,numerals:all}
