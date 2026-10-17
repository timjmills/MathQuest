#!/bin/bash
O=/home/user/fk/design/audit/runs/fractions-key/r7; B=/tmp/claude-0/-home-user-MathQuest/1ea22a25-431f-5ee1-821c-0329071995aa/scratchpad/base
until grep -q "base-review-lint exit" $O/gates-exit.log; do sleep 10; done
node $O/probes/render6.cjs $B $O/base-print $O/probes/jobs-base.json > $O/base-919818bb-render.log 2>&1; echo "base-render exit $?" >> $O/gates-exit.log
cd $B && node $O/probes/mp7.cjs $B fraction_operations:sub_fractions_like,fractions:fraction_of_set_hard,subtraction:sub_wp_20 M 0,2,7,16 AB > $O/base-919818bb-mp7.log 2>&1; echo "base-mp7 exit $?" >> $O/gates-exit.log
echo DONE3 >> $O/gates-exit.log
