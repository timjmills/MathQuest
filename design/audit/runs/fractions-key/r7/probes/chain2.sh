#!/bin/bash
R=/home/user/fk; O=$R/design/audit/runs/fractions-key/r7; P=$O/probes
cd $R
run() { name=$1; shift; "$@" > $O/$name.log 2>&1; echo "$name exit $?" >> $O/gates-exit.log; }
run render node $P/render6.cjs $R $O/print $P/jobs7.json
run screens node $P/scr7.cjs $R $O/screen fractions:fraction_of_set,fractions:fraction_of_set_hard,fraction_operations:add_fractions_like,fraction_operations:sub_fractions_like,fraction_operations:add_frac_unlike
run tap node $P/fos-tap6.cjs $R $O/screen
run card-stack node $P/card-stack.cjs $R fraction_operations:frac_word_problems,fractions:fraction_of_set_nv,fraction_operations:frac_word_mixed_plain,measurement:time_5min,measurement:elapsed_mixed,measurement:money_change,data_analysis:line_plot_fractions,probability:probability_basic,
run falsestack node $P/falsestack.cjs $R
run card-shot-fwp node $P/card-shot.cjs $R $O/screen/frac_word_problems-card-1280-s1954.png fraction_operations:frac_word_problems 1954 1280x600
run formb node $P/formb.cjs $R
echo DONE2 >> $O/gates-exit.log
