#!/bin/bash
# critic r8: every browser job one after another (never two at once).
R=/home/user/fk; O=$R/design/audit/runs/fractions-key/r8; P=$O/probes; P7=$R/design/audit/runs/fractions-key/r7/probes
SP=/tmp/claude-0/-home-user-MathQuest/1ea22a25-431f-5ee1-821c-0329071995aa/scratchpad/crit8; B=$SP/base63
LANE=fractions:fraction_of_set,fractions:fraction_of_set_hard,fraction_operations:add_fractions_like,fraction_operations:sub_fractions_like,fraction_operations:add_frac_unlike
OTHER=addition:add_facts,addition:number_families_add,subtraction:sub_20_regroup,multiplication:mult_facts,multiplication:dot_array_mult,division:div_facts,fractions:equiv_frac_visual,fractions:compare,fraction_operations:mult_frac_whole,fraction_operations:frac_word_problems,decimals:add_decimal,measurement:time_quarter,placevalue:value,composing:make_ten,patterns:seq_5,area_perimeter:area_unit_squares
MPO=addition:add_column_multi,addition:add_facts,addition:number_families_add,multiplication:dot_array_mult,addition:mixed_addition,composing:mixed_composing,number_ops_mixed:number_families_mixed,subtraction:sub_100_regroup,multiplication:mult_facts,subtraction:sub_wp_20,fraction_operations:add_fractions_like,fraction_operations:sub_fractions_like,fraction_operations:add_frac_unlike
cd $R
: > $O/gates-exit.log
run() { name=$1; shift; "$@" > $O/$name.log 2>&1; echo "$name exit $?" >> $O/gates-exit.log; }
run ws-boot-smoke node tests/scripts/ws-boot-smoke.cjs
run review-other-head node $P/rv8.cjs $R $OTHER S,M,L 0,1 $SP/rv-head
(cd $B && node $P/rv8.cjs $B $OTHER S,M,L 0,1 $SP/rv-base > $O/review-other-base-63fcb6ac.log 2>&1; echo "review-other-base exit $?" >> $O/gates-exit.log)
run review-lane-head node $P/rv8.cjs $R $LANE S,M,L 0,1,2 $SP/rv-lane
run mp-fos-seeds node $P7/mp7.cjs $R fractions:fraction_of_set,fractions:fraction_of_set_hard S,M,L 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17 AB,none
run mp-ops node $P7/mp7.cjs $R fraction_operations:sub_fractions_like,fraction_operations:add_fractions_like,fraction_operations:add_frac_unlike S,M,L 0,1,2,7,16 AB,none
run mp-other node $P7/mp7.cjs $R $MPO S,M,L 0,1,2 AB,none
for S in S M L; do run ws-print-lint-$S node tests/scripts/ws-print-lint.cjs --source kit --skills $LANE --roles independent,more-practice,test,review --size $S --seeds 3 --letters A,B; done
for S in S M L; do run ws-print-lint-$S-short node tests/scripts/ws-print-lint.cjs --source kit --skills $LANE --roles independent,more-practice,test,review --size $S --seeds 2 --letters A,B --key-style short; done
run render node $P7/render6.cjs $R $SP/print $P/jobs8.json
run screens node $P7/scr7.cjs $R $SP/screen $LANE
run tap node $P7/fos-tap6.cjs $R $SP/screen
run card-stack node $P7/card-stack.cjs $R fraction_operations:frac_word_problems,fractions:fraction_of_set_nv,fraction_operations:frac_word_mixed_plain,measurement:time_5min,measurement:elapsed_mixed,measurement:money_change,data_analysis:line_plot_fractions,probability:probability_basic,conversions:ratio_intro,conversions:unit_rate_intro,conversions:percent_of_number,fractions:fraction_of_set_hard_nv
run falsestack node $P7/falsestack7.cjs $R
run formb node $P7/formb.cjs $R
run ws-screen-answer node tests/scripts/ws-screen-answer.cjs --skills $LANE
run ws-chromebook-fit node tests/scripts/ws-chromebook-fit.cjs --skills $LANE
run ws-code-snapshot node tests/scripts/ws-code-snapshot.mjs
run ws-content-audit node tests/scripts/ws-content-audit.cjs --skill fraction_of_set,fraction_of_set_hard,add_fractions_like,sub_fractions_like,add_frac_unlike
echo DONE >> $O/gates-exit.log
