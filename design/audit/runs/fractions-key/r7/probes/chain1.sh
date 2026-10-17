#!/bin/bash
# critic r7 chain 1: every browser job one after another.
R=/home/user/fk; O=$R/design/audit/runs/fractions-key/r7; P=$O/probes
LANE=fractions:fraction_of_set,fractions:fraction_of_set_hard,fraction_operations:add_fractions_like,fraction_operations:sub_fractions_like,fraction_operations:add_frac_unlike
OTHER=addition:add_column_multi,addition:add_facts,addition:number_families_add,multiplication:dot_array_mult,addition:mixed_addition,composing:mixed_composing,number_ops_mixed:number_families_mixed,subtraction:sub_100_regroup,multiplication:mult_facts,subtraction:sub_wp_20,fraction_operations:add_fractions_like,fraction_operations:sub_fractions_like,fraction_operations:add_frac_unlike
cd $R
: > $O/gates-exit.log
run() { name=$1; shift; "$@" > $O/$name.log 2>&1; echo "$name exit $?" >> $O/gates-exit.log; }
run ws-boot-smoke node tests/scripts/ws-boot-smoke.cjs
run mp-fos-seeds node $P/mp7.cjs $R fractions:fraction_of_set,fractions:fraction_of_set_hard S,M,L 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17 AB,none
run mp-other node $P/mp7.cjs $R $OTHER S,M,L 0,1,2 AB,none
run mp-regress-r6probe node $P/mp-regress.cjs $R
for S in S M L; do run ws-print-lint-$S node tests/scripts/ws-print-lint.cjs --source kit --skills $LANE --roles independent,more-practice,test --size $S --seeds 3 --letters A,B; done
for S in S L; do run ws-print-lint-$S-short node tests/scripts/ws-print-lint.cjs --source kit --skills $LANE --roles independent,more-practice,test --size $S --seeds 2 --letters A,B --key-style short; done
run ws-print-lint-review node tests/scripts/ws-print-lint.cjs --source kit --skills $LANE --roles review --size M --seeds 2
run ws-screen-answer node tests/scripts/ws-screen-answer.cjs --skills $LANE
run ws-chromebook-fit node tests/scripts/ws-chromebook-fit.cjs --skills $LANE
run ws-code-snapshot node tests/scripts/ws-code-snapshot.mjs
run ws-content-audit node tests/scripts/ws-content-audit.cjs --skill fraction_of_set,fraction_of_set_hard,add_fractions_like,sub_fractions_like,add_frac_unlike,mixed_composing
echo DONE >> $O/gates-exit.log
