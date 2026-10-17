#!/bin/bash
O=/home/user/fk/design/audit/runs/fractions-key/r7; R=/home/user/fk; P=$O/probes; cd $R
until grep -q "^DONE3$" $O/gates-exit.log; do sleep 10; done
run() { name=$1; shift; "$@" > $O/$name.log 2>&1; echo "$name exit $?" >> $O/gates-exit.log; }
run falsestack7 node $P/falsestack7.cjs $R
run card-stack-2 node $P/card-stack.cjs $R conversions:ratio_intro,conversions:unit_rate_intro,conversions:percent_of_number,fractions:fraction_of_set_hard_nv
run formb node $P/formb.cjs $R
run card-shot-prob node $P/card-shot.cjs $R $O/screen/probability_basic-card-1280-s1954.png probability:probability_basic 1954 1280x600
run card-shot-fwp390 node $P/card-shot.cjs $R $O/screen/frac_word_problems-card-390-s1954.png fraction_operations:frac_word_problems 1954 390x844
echo DONE4 >> $O/gates-exit.log
