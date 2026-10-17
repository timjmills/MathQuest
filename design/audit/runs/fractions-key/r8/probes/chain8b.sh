#!/bin/bash
R=/home/user/fk; O=$R/design/audit/runs/fractions-key/r8; P=$O/probes
SP=/tmp/claude-0/-home-user-MathQuest/1ea22a25-431f-5ee1-821c-0329071995aa/scratchpad/crit8
until grep -q "^DONE$" $O/gates-exit.log; do sleep 10; done
cd $R
run() { name=$1; shift; "$@" > $O/$name.log 2>&1; echo "$name exit $?" >> $O/gates-exit.log; }
run bonly node $P/bonly.cjs $R fractions:fraction_of_set:L:8,fractions:fraction_of_set:L:9,fractions:fraction_of_set_hard:L:14,fractions:fraction_of_set_hard:M:7,subtraction:sub_wp_20:M:0,addition:mixed_addition:S:2,fractions:fraction_of_set:S:5 $SP/bonly
echo DONE2 >> $O/gates-exit.log
