// js/modules/sheet/providers/function-table.js
// Skill providers for the function tables: function_table_easy, function_table_hard
// (SKILL_CELL_CONTRACT.md section 3.8). The item is the `function-table` cell's payload
// (q.cell.payload); everything here reads it, never the text.
//
// The page's task is the skill's `task` option, so the strings follow it: one I Can, one
// instruction and one set of steps per task, all from the payload of the section's first item.
//
// Misconceptions (EXTENSION_PLAYBOOK 4.15 PF-M3 / PF-M5 and the owner's list, 2026-09-25):
//   rule-on-output     applied the rule to the Out number (the rule done twice)
//   add-for-times      used + when the pattern is × (read the rule off one row)
//   neighbour-outputs  looked only down the Out column: the gap between neighbouring Outs
//   backwards          used the rule forward when finding an In number (Out 12, × 3 -> In 36)
//
// Pure module (SCC-01).

import { registerSkill } from '../contract.js';
import { chooseWrong, strings, step, clampSteps } from './util.js';
import { applyRule, ruleText, ruleOn, ftSlots, FT_GLYPH } from '../cells/function-table.js';

const payloadOf = (q) => (q && q.cell && q.cell.template === 'function-table' && q.cell.payload) || (q && q.ftCheck) || null;
const taskOf = (q) => { const p = payloadOf(q); return p ? p.task : null; };

/** The item's answer with some slots replaced: the list form q.ans holds. */
function answerWith(p, repl) {
    return ftSlots(p).map((s) => (repl[s.id] !== undefined ? String(repl[s.id]) : s.value)).join(', ');
}

const SAY = 'When the input is __, the output is __ because __.';

/** The Say frame filled from the first row: "When the input is 3, the output is 10 because 3 + 7 = 10." */
function sayValues(q) {
    const p = payloadOf(q);
    if (!p || !p.rows || !p.rows.length) return null;
    const r = p.rows[0];
    return [r.x, r.y, `${ruleOn(p.rule, r.x)} = ${r.y}`];
}

const BY_TASK = {
    outputs: {
        iCan: 'I Can use a rule to complete a table',
        instructionKey: 'table',
        steps: ['Read the rule.', 'Do the rule to each In number.', 'Write each Out number.'],
    },
    rule: {
        iCan: 'I Can find the rule of a table',
        instructionKey: 'table-rule',
        steps: ['Look at how each In number changes to its Out.', 'Test + and × on every row, not just one.', 'Write the rule that works for all the rows.'],
    },
    inputs: {
        iCan: 'I Can work a rule backward to find the In number',
        instructionKey: 'table-in',
        steps: ['Read the rule.', 'Undo the rule: do the opposite operation to the Out.', 'Write the In number. Check it forward.'],
    },
    mixed: {
        iCan: 'I Can use a rule to find missing In and Out numbers',
        instructionKey: 'table',
        steps: ['Read the rule.', 'Go forward with the rule to find an Out number.', 'Go backward, doing the opposite, to find an In number.'],
    },
    make: {
        iCan: 'I Can make my own table from a rule',
        instructionKey: 'table-make',
        steps: ['Read the rule.', 'Choose an In number and write it.', 'Do the rule to it. Write the Out number.'],
    },
};
const STRINGS = Object.fromEntries(Object.entries(BY_TASK).map(([k, d]) => [k, strings({ ...d, say: SAY, sayValues })]));

function stringsFor(defaultTask) {
    const fn = (ref = {}) => STRINGS[taskOf(ref && ref.q) || defaultTask](ref);
    fn.def = STRINGS[defaultTask].def;
    return fn;
}

/* ============================================================== worked steps */

const opWord = { '+': 'add', '-': 'take away', x: 'multiply by', '/': 'divide by' };
const undoWord = { '+': 'take away', '-': 'add', x: 'divide by', '/': 'multiply by' };

function workedSteps(q) {
    const p = payloadOf(q);
    if (!p) return [];
    const rule = p.rule || [];
    const slots = ftSlots(p);
    const all = slots.map((s) => ({ slot: s.id, value: s.value }));
    const out = [];
    if (p.task === 'rule') {
        const [a, b] = p.rows;
        out.push(step(`In ${a.x} gives Out ${a.y}. In ${b.x} gives Out ${b.y}.`));
        if (rule.length === 1 && (rule[0].op === 'x' || rule[0].op === '/')) {
            out.push(step(`Test + ${a.y - a.x}: ${b.x} + ${a.y - a.x} = ${b.x + a.y - a.x}, not ${b.y}.`));
        } else if (rule.length === 1) {
            out.push(step(`Test × and ÷ first: they do not fit every row.`));
        } else {
            out.push(step(`One + or one × does not fit every row: try two steps.`));
        }
        out.push(step(`Test ${ruleText(rule)} on every row. It works.`));
        if (p.check) out.push(step(`Check: ${ruleOn(rule, p.check.x)} = ${p.check.y}.`, [{ slot: 'chk', value: String(p.check.y) }]));
        out.push(step(`Write the rule ${ruleText(rule)}.`, all));
        return clampSteps(out);
    }
    if (p.task === 'make') {
        const r = p.rows[0];
        out.push(step(`The rule is ${ruleText(rule)}.`));
        out.push(step(`Choose an In number, ${r.x}. Write it.`, [{ slot: 'r0in', value: String(r.x) }]));
        out.push(step(`${ruleOn(rule, r.x)} = ${r.y}. Write ${r.y} in Out.`, [{ slot: 'r0out', value: String(r.y) }]));
        out.push(step('Do the same for each row, with a new In number.', all));
        return clampSteps(out);
    }
    out.push(step(`The rule is ${ruleText(rule)}: ${rule.map((s) => `${opWord[s.op]} ${s.n}`).join(', then ')}.`));
    for (const s of slots) {
        if (out.length >= 4) break;
        const r = p.rows[s.row];
        if (!r) continue;
        if (s.col === 'out') out.push(step(`${ruleOn(rule, r.x)} = ${r.y}. Write ${r.y}.`, [{ slot: s.id, value: s.value }]));
        else {
            const undo = rule.slice().reverse().map((t) => `${undoWord[t.op]} ${t.n}`).join(', then ');
            out.push(step(`Out ${r.y}: ${undo}. In is ${r.x}.`, [{ slot: s.id, value: s.value }]));
        }
    }
    out.push(step('Fill in every row the same way.', all));
    while (out.length < 3) out.unshift(step('Read the rule above the table.'));
    return clampSteps(out);
}

/* ============================================================== wrong answers */

function wrongAnswer(q) {
    const p = payloadOf(q);
    if (!p || !p.rows || !p.rows.length) return null;
    const rule = p.rule || [];
    const slots = ftSlots(p);
    const c = [];
    const mk = (repl, misconception, explain, slot) => ({
        value: answerWith(p, repl), misconception, explain,
        slot: slot || Object.keys(repl)[0], slots: Object.fromEntries(Object.entries(repl).map(([k, v]) => [k, String(v)])),
    });
    const first = rule[0] || { op: '+', n: 1 };
    const outSlots = slots.filter((s) => s.col === 'out' && s.row !== undefined);
    const inSlots = slots.filter((s) => s.col === 'in' && s.row !== undefined);

    if (p.task === 'rule') {
        const [a, b] = p.rows;
        // + for ×: read the rule off the first row as "add the gap"
        // The Check row of a wrong rule is the WRONG rule done to the Check In (critic round 3:
        // a Check value worked with the right rule contradicted the wrong rule written above it).
        const withCheck = (repl, wrongRule) => {
            if (!p.check || p.support === 'line') return repl;
            const y = applyRule(wrongRule, p.check.x);
            if (Number.isFinite(y) && y >= 0) repl.chk = y;
            return repl;
        };
        if (a.y > a.x && !(rule.length === 1 && rule[0].op === '+')) {
            const repl = p.support === 'line' ? { rule: `+ ${a.y - a.x}` } : { s0: '+', n0: a.y - a.x };
            if (rule.length === 2 && p.support !== 'line') { repl.s1 = FT_GLYPH[rule[1].op]; repl.n1 = rule[1].n; }
            withCheck(repl, [{ op: '+', n: a.y - a.x }].concat(rule.length === 2 ? [rule[1]] : []));
            c.push(mk(repl, 'add-for-times', `Found the gap on one row (${a.x} to ${a.y}) and wrote + ${a.y - a.x}; it does not work for In ${b.x}.`, p.support === 'line' ? 'rule' : 'n0'));
        }
        // the gap between neighbouring Outs, read as the rule (the first pair whose gap is not the rule)
        let gap = 0;
        for (let i = 1; i < p.rows.length && !gap; i++) {
            const d = Math.abs(p.rows[i].y - p.rows[i - 1].y);
            if (d > 0 && !(rule.length === 1 && rule[0].op === '+' && rule[0].n === d)) gap = d;
        }
        if (gap > 0) {
            const repl = p.support === 'line' ? { rule: `+ ${gap}` } : { s0: '+', n0: gap };
            if (rule.length === 2 && p.support !== 'line') { repl.s1 = FT_GLYPH[rule[1].op]; repl.n1 = rule[1].n; }
            withCheck(repl, [{ op: '+', n: gap }].concat(rule.length === 2 ? [rule[1]] : []));
            c.push(mk(repl, 'neighbour-outputs', `Looked only down the Out column and wrote + ${gap}, the gap between two Outs.`, p.support === 'line' ? 'rule' : 'n0'));
        }
        // the Check row: the rule done to the Out of the row above
        if (p.check) {
            const w = applyRule(rule, applyRule(rule, p.check.x));
            if (Number.isFinite(w)) c.push(mk({ chk: w }, 'rule-on-output', `Did the rule twice: to ${p.check.x}, then to its Out.`, 'chk'));
        }
        return chooseWrong(q, c);
    }
    // backwards: the rule done FORWARD to the Out number (not on a 'make' table: the pupil chose its Ins)
    const back = p.task === 'make' ? null : inSlots.find((t) => { const r = p.rows[t.row]; const w = applyRule(rule, r.y); return Number.isFinite(w) && w !== r.x; });
    if (back) {
        const r = p.rows[back.row];
        const w = applyRule(rule, r.y);
        c.push(mk({ [back.id]: w }, 'backwards', `Did the rule forward to Out ${r.y} (${ruleOn(rule, r.y)}); finding In needs the opposite.`));
    }
    if (inSlots.length && p.task !== 'make' && (first.op === 'x' || first.op === '/')) {
        // + for ×: undid a × or ÷ rule by taking away / adding its number
        const t = inSlots[0];
        const r = p.rows[t.row];
        const w = first.op === 'x' ? r.y - first.n : r.y + first.n;
        if (w >= 0 && w !== r.x) c.push(mk({ [t.id]: w }, 'add-for-times', `Undid ${FT_GLYPH[first.op]} ${first.n} by ${first.op === 'x' ? 'taking away' : 'adding'} ${first.n}.`));
    }
    if (p.check && !outSlots.length) {
        const w = applyRule(rule, applyRule(rule, p.check.x));
        if (Number.isFinite(w)) c.push(mk({ chk: w }, 'rule-on-output', `Did the rule twice on the Check row: to ${p.check.x}, then to its Out.`, 'chk'));
    }
    if (outSlots.length) {
        const s = outSlots[0];
        const r = p.rows[s.row];
        // the rule applied to the Out number (the first row where that stays a whole number)
        const t2 = outSlots.find((t) => Number.isFinite(applyRule(rule, p.rows[t.row].y)));
        if (t2) {
            const rr = p.rows[t2.row];
            const twice = applyRule(rule, rr.y);
            c.push(mk({ [t2.id]: twice }, 'rule-on-output', `Did the rule to the Out number too: ${ruleOn(rule, rr.y)} = ${twice}.`));
        }
        // + for ×
        if (first.op === 'x' || first.op === '/') {
            const plus = r.x + first.n;
            c.push(mk({ [s.id]: plus }, 'add-for-times', `Added ${first.n} instead of ${first.op === 'x' ? 'multiplying' : 'dividing'}: ${r.x} + ${first.n}.`));
        }
        // neighbour Outs: the next Out from the gap between the two before it
        const k = outSlots.find((t) => t.row >= 2);
        if (k) {
            const a = p.rows[k.row - 2], b = p.rows[k.row - 1];
            const guess = b.y + (b.y - a.y);
            const rk = p.rows[k.row];
            if (guess >= 0 && guess !== rk.y) c.push(mk({ [k.id]: guess }, 'neighbour-outputs', `Continued the Out column (${a.y}, ${b.y}, ${guess}) without using In ${rk.x}.`));
        }
        if (!c.length && s.row >= 1) {
            // last resort: the Out above, plus one (counting down the column)
            const prev = p.rows[s.row - 1];
            if (prev.y + 1 !== r.y) c.push(mk({ [s.id]: prev.y + 1 }, 'neighbour-outputs', `Counted on from the Out above (${prev.y}) instead of using In ${r.x}.`));
        }
        if (!k && outSlots.length && r.x + 1 !== r.y) {
            // a table in order: the next Out as the previous Out plus the same gap
            const prev = p.rows[s.row - 1];
            if (prev && s.row >= 1) {
                const guess = prev.y + 1;
                if (guess !== r.y) c.push(mk({ [s.id]: guess }, 'neighbour-outputs', `Counted on from the Out above (${prev.y}) instead of using In ${r.x}.`));
            }
        }
    }
    return chooseWrong(q, c);
}

const MISCONCEPTIONS = ['rule-on-output', 'add-for-times', 'neighbour-outputs', 'backwards'];
const FOOTPRINT = { kind: 'table', factLike: false, maxCols: 3, perPage: { ican: 6, daily: 6 } };

registerSkill('algebra:function_table_easy', {
    strings: stringsFor('outputs'),
    misconceptions: MISCONCEPTIONS,
    workedSteps,
    wrongAnswer,
    footprint: FOOTPRINT,
});

registerSkill('algebra:function_table_hard', {
    strings: stringsFor('rule'),
    misconceptions: MISCONCEPTIONS,
    workedSteps,
    wrongAnswer,
    footprint: FOOTPRINT,
});
