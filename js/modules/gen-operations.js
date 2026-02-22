// gen-operations.js - Number & Operations + Integers question generation
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';
import { DEFAULT_TABLES } from './data.js';
import { createBase10Blocks, createCountingDots, createDotArray, createNumberLine, createHopNumberLine } from './svg-base10.js';

// ========================================
// REGROUPING HELPERS
// ========================================
const RANGE_MAP = { '10': 10, '20': 20, '50': 50, '100': 100, '1k': 1000, '10k': 10000, '100k': 100000, '1m': 1000000 };

function hasCarry(a, b) {
    while (a > 0 || b > 0) {
        if ((a % 10) + (b % 10) >= 10) return true;
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
    }
    return false;
}

function hasBorrow(a, b) {
    while (a > 0 || b > 0) {
        if ((a % 10) < (b % 10)) return true;
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
    }
    return false;
}

function generateAddPair(maxVal, regroupType, rng) {
    const minVal = maxVal <= 10 ? 1 : Math.max(2, Math.floor(maxVal / 10));
    for (let attempt = 0; attempt < 200; attempt++) {
        const a = rng(minVal, maxVal);
        const b = rng(minVal, maxVal);
        if (regroupType === 'mixed') return [a, b];
        const carries = hasCarry(a, b);
        if (regroupType === 'no_regroup' && !carries) return [a, b];
        if (regroupType === 'regroup' && carries) return [a, b];
    }
    return [rng(minVal, maxVal), rng(minVal, maxVal)];
}

function generateSubPair(maxVal, regroupType, rng) {
    const minVal = maxVal <= 10 ? 1 : Math.max(2, Math.floor(maxVal / 10));
    for (let attempt = 0; attempt < 200; attempt++) {
        let a = rng(minVal, maxVal);
        let b = rng(minVal, Math.max(minVal, a - 1));
        if (a < b) [a, b] = [b, a];
        if (a === b) continue;
        if (regroupType === 'mixed') return [a, b];
        const borrows = hasBorrow(a, b);
        if (regroupType === 'no_regroup' && !borrows) return [a, b];
        if (regroupType === 'regroup' && borrows) return [a, b];
    }
    let a = rng(minVal, maxVal);
    let b = rng(1, Math.max(1, a - 1));
    if (a < b) [a, b] = [b, a];
    return [a, b];
}

function buildColumnVisual(a, b, isAdd, uniqueId) {
    const ans = isAdd ? a + b : a - b;
    const opSymbol = isAdd ? '+' : '−';
    const aStr = a.toString();
    const bStr = b.toString();
    const displayLen = isAdd ? Math.max(aStr.length, bStr.length) : aStr.length;
    const answerLen = ans.toString().length;
    const paddedA = aStr.padStart(displayLen, ' ').split('');
    const paddedB = bStr.padStart(displayLen, ' ').split('');
    const carryBoxCount = displayLen;
    const borderColor = isAdd ? 'var(--accent-green)' : 'var(--accent-pink)';
    const carryBorderColor = isAdd ? 'var(--accent-cyan)' : 'var(--accent-orange)';
    const carryTextColor = isAdd ? 'var(--accent-cyan)' : 'var(--accent-orange)';
    const title = isAdd ? 'Column Addition' : 'Column Subtraction';
    const carryLabel = isAdd ? 'carrying' : 'borrowing';

    return `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.1rem;">
        <div style="font-weight:700;margin-bottom:10px;">${title}</div>
        <div style="display:inline-block;text-align:right;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid ${borderColor};">
            <div style="display:flex;justify-content:flex-end;gap:2px;margin-bottom:4px;padding-right:2px;">
                ${Array(carryBoxCount).fill(0).map((_, i) => `<input type="text" maxlength="${isAdd ? '1' : '2'}" class="column-carry-input" data-col="${uniqueId}-carry-${i}" style="width:24px;height:18px;border:1px dashed ${carryBorderColor};border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:${isAdd ? '0.75' : '0.65'}rem;color:${carryTextColor};font-family:inherit;padding:0;" placeholder="">`).join('')}
            </div>
            <div style="padding-bottom:5px;">
                <span style="margin-right:12px;">&nbsp;</span>${paddedA.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
            </div>
            <div style="border-bottom:3px solid #444;padding:5px 0;">
                <span style="margin-right:12px;">${opSymbol}</span>${paddedB.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
            </div>
            <div style="padding-top:8px;color:var(--accent-green);font-weight:700;">
                <span style="margin-right:12px;">&nbsp;</span>${Array(answerLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueId}-ans-${i}" style="width:24px;height:24px;border:1px solid var(--accent-green);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
            </div>
        </div>
        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-secondary);">
            Type in boxes • Use top row for ${carryLabel}
        </div>
    </div>`;
}

export function generateOperationsQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // ========================================
            // NUMBER LINE SKILLS (nl_add, nl_sub, nl_mult, nl_div)
            // ========================================
            if (mappedSkill === 'nl_add') {
                const maxSum = Math.min(range, 100);
                const b = rng(1, Math.max(1, Math.floor(maxSum / 2)));
                const a = rng(1, Math.max(1, maxSum - b));
                const sum = a + b;
                const nlMin = 0;
                const nlMax = Math.ceil((sum + 2) / 5) * 5 || 10;
                const roll = Math.random();
                if (roll < 0.70) {
                    // Find the sum
                    q.text = `${a} + ${b} = ?`;
                    q.ans = sum;
                    q.visual = createHopNumberLine({ min: nlMin, max: nlMax, hops: [{ from: a, to: sum, label: `+${b}` }], showAnswer: false, highlightEnd: sum });
                    q.hint = `Start at ${a} on the number line and jump forward ${b}.`;
                } else if (roll < 0.85) {
                    // Find the addend
                    q.text = `${a} + ? = ${sum}`;
                    q.ans = b;
                    q.visual = createHopNumberLine({ min: nlMin, max: nlMax, hops: [{ from: a, to: sum, label: '?', dashed: true }], showAnswer: true, highlightEnd: sum });
                    q.hint = `Start at ${a}. How many jumps to reach ${sum}?`;
                } else {
                    // Find the start
                    q.text = `? + ${b} = ${sum}`;
                    q.ans = a;
                    q.visual = createHopNumberLine({ min: nlMin, max: nlMax, hops: [{ from: a, to: sum, label: `+${b}` }], showAnswer: true, highlightEnd: a });
                    q.hint = `The number line shows a jump of +${b} ending at ${sum}. Where did it start?`;
                }
                q.answerType = 'number';
                q.printFormat = 'nl-add';
                q.skillLabel = 'Addition Number Line';
                return q;
            }

            if (mappedSkill === 'nl_sub') {
                const maxVal = Math.min(range, 100);
                const a = rng(2, maxVal);
                const b = rng(1, a - 1);
                const diff = a - b;
                const nlMin = 0;
                const nlMax = Math.ceil((a + 2) / 5) * 5 || 10;
                const roll = Math.random();
                if (roll < 0.70) {
                    // Find the difference
                    q.text = `${a} − ${b} = ?`;
                    q.ans = diff;
                    q.visual = createHopNumberLine({ min: nlMin, max: nlMax, hops: [{ from: a, to: diff, label: `−${b}` }], showAnswer: false, highlightEnd: diff });
                    q.hint = `Start at ${a} on the number line and jump back ${b}.`;
                } else if (roll < 0.85) {
                    // Find the subtrahend
                    q.text = `${a} − ? = ${diff}`;
                    q.ans = b;
                    q.visual = createHopNumberLine({ min: nlMin, max: nlMax, hops: [{ from: a, to: diff, label: '?', dashed: true }], showAnswer: true, highlightEnd: diff });
                    q.hint = `Start at ${a}. How many jumps back to reach ${diff}?`;
                } else {
                    // Find the minuend
                    q.text = `? − ${b} = ${diff}`;
                    q.ans = a;
                    q.visual = createHopNumberLine({ min: nlMin, max: nlMax, hops: [{ from: a, to: diff, label: `−${b}` }], showAnswer: true, highlightEnd: a });
                    q.hint = `The jump is −${b} and lands at ${diff}. Where did it start?`;
                }
                q.answerType = 'number';
                q.printFormat = 'nl-sub';
                q.skillLabel = 'Subtraction Number Line';
                return q;
            }

            if (mappedSkill === 'nl_mult') {
                const maxProd = Math.min(range, 100);
                const maxHops = Math.min(6, Math.max(2, Math.floor(Math.sqrt(maxProd))));
                const numHops = rng(2, maxHops);
                const maxHopSize = Math.max(2, Math.min(12, Math.floor(maxProd / numHops)));
                const hopSize = rng(2, maxHopSize);
                const product = numHops * hopSize;
                const nlMin = 0;
                const nlMax = Math.ceil((product + 2) / 5) * 5 || 10;
                const hopsArr = [];
                for (let i = 0; i < numHops; i++) {
                    hopsArr.push({ from: i * hopSize, to: (i + 1) * hopSize, label: `+${hopSize}` });
                }
                const roll = Math.random();
                if (roll < 0.60) {
                    // Find the product
                    q.text = `${numHops} × ${hopSize} = ?`;
                    q.ans = product;
                    q.visual = createHopNumberLine({ min: nlMin, max: nlMax, hops: hopsArr, showAnswer: false, highlightEnd: product });
                    q.hint = `Count ${numHops} hops of ${hopSize} on the number line.`;
                } else if (roll < 0.80) {
                    // Count the hops
                    q.text = `How many hops of ${hopSize} to reach ${product}?`;
                    q.ans = numHops;
                    const dashedHops = hopsArr.map(h => ({ ...h, label: `+${hopSize}`, dashed: false }));
                    q.visual = createHopNumberLine({ min: nlMin, max: nlMax, hops: dashedHops, showAnswer: true, highlightEnd: product });
                    q.hint = `Each hop is +${hopSize}. Count how many it takes to reach ${product}.`;
                } else {
                    // Find the hop size
                    q.text = `${numHops} hops to reach ${product}. How big is each hop?`;
                    q.ans = hopSize;
                    const unknownHops = hopsArr.map(h => ({ ...h, label: '?', dashed: true }));
                    q.visual = createHopNumberLine({ min: nlMin, max: nlMax, hops: unknownHops, showAnswer: true, highlightEnd: product });
                    q.hint = `${product} ÷ ${numHops} = ? Each hop is the same size.`;
                }
                q.answerType = 'number';
                q.printFormat = 'nl-mult';
                q.skillLabel = 'Multiplication Number Line';
                return q;
            }

            if (mappedSkill === 'nl_div') {
                const maxDiv = Math.min(range, 100);
                const maxDivisor = Math.max(2, Math.min(10, Math.floor(Math.sqrt(maxDiv))));
                const divisor = rng(2, maxDivisor);
                const maxQuotient = Math.max(2, Math.min(12, Math.floor(maxDiv / divisor)));
                const quotient = rng(2, maxQuotient);
                const dividend = quotient * divisor;
                const nlMin = 0;
                const nlMax = Math.ceil((dividend + 2) / 5) * 5 || 10;
                const hopsArr = [];
                for (let i = 0; i < quotient; i++) {
                    hopsArr.push({ from: i * divisor, to: (i + 1) * divisor, label: `+${divisor}` });
                }
                const roll = Math.random();
                if (roll < 0.60) {
                    // Find the quotient
                    q.text = `${dividend} ÷ ${divisor} = ?`;
                    q.ans = quotient;
                    q.visual = createHopNumberLine({ min: nlMin, max: nlMax, hops: hopsArr, showAnswer: true, highlightEnd: dividend });
                    q.hint = `Count how many hops of ${divisor} it takes to reach ${dividend}.`;
                } else if (roll < 0.80) {
                    // Find the divisor
                    q.text = `${dividend} ÷ ? = ${quotient}`;
                    q.ans = divisor;
                    const unknownHops = hopsArr.map(h => ({ ...h, label: '?', dashed: true }));
                    q.visual = createHopNumberLine({ min: nlMin, max: nlMax, hops: unknownHops, showAnswer: true, highlightEnd: dividend });
                    q.hint = `There are ${quotient} equal hops to reach ${dividend}. How big is each hop?`;
                } else {
                    // Find the dividend
                    q.text = `? ÷ ${divisor} = ${quotient}`;
                    q.ans = dividend;
                    q.visual = createHopNumberLine({ min: nlMin, max: nlMax, hops: hopsArr, showAnswer: false, highlightEnd: dividend });
                    q.hint = `${quotient} hops of ${divisor} each. Where do you land?`;
                }
                q.answerType = 'number';
                q.printFormat = 'nl-div';
                q.skillLabel = 'Division Number Line';
                return q;
            }

            // ========================================
            // EXPLICIT ADD/SUB BY RANGE & REGROUPING
            // ========================================
            const regroupMatch = mappedSkill.match(/^(add|sub)_(10|20|50|100|1k|10k|100k|1m)_(no_regroup|regroup|mixed)$/);
            if (regroupMatch) {
                const [, op, rangeCode, regroupType] = regroupMatch;
                const maxVal = RANGE_MAP[rangeCode];
                const isAdd = op === 'add';

                let a, b;
                if (isAdd) {
                    [a, b] = generateAddPair(maxVal, regroupType, rng);
                } else {
                    [a, b] = generateSubPair(maxVal, regroupType, rng);
                }

                const ans = isAdd ? a + b : a - b;
                const opSymbol = isAdd ? '+' : '−';

                q.text = `${a.toLocaleString()} ${opSymbol} ${b.toLocaleString()} = ?`;
                q.ans = ans;
                q.answerType = 'number';
                q.hint = isAdd
                    ? `Line up digits by place value. Add each column from the ones.${regroupType === 'regroup' ? ' Carry when a column sums to 10 or more!' : ''}`
                    : `Line up digits by place value. Subtract each column from the ones.${regroupType === 'regroup' ? ' Borrow when the top digit is smaller!' : ''}`;

                const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);
                q.visual = buildColumnVisual(a, b, isAdd, uniqueId);
                q.printFormat = isAdd ? 'column-add' : 'column-sub';
                q.a = a;
                q.b = b;
                q.op = opSymbol;
                q.options = buildNumericOptions(ans);
                return;
            }

            // ========================================
            // WORD PROBLEMS BY RANGE (add_wp_*, sub_wp_*)
            // ========================================
            const wpRangeMatch = mappedSkill.match(/^(add|sub)_wp_(10|20|50|100|1k|10k|100k|1m)$/);
            if (wpRangeMatch) {
                const [, op, rangeCode] = wpRangeMatch;
                const maxVal = RANGE_MAP[rangeCode];
                const isAdd = op === 'add';

                const smallScenarios = [
                    { item: '🍎', name: 'apples', color: 'pink', context: 'fruit basket', verb: 'ate' },
                    { item: '⭐', name: 'stars', color: 'yellow', context: 'sticker chart', verb: 'gave away' },
                    { item: '📚', name: 'books', color: 'blue', context: 'library', verb: 'returned' },
                    { item: '🍪', name: 'cookies', color: 'orange', context: 'cookie jar', verb: 'ate' },
                    { item: '🎈', name: 'balloons', color: 'purple', context: 'party', verb: 'popped' },
                    { item: '🌸', name: 'flowers', color: 'pink', context: 'garden', verb: 'picked' },
                    { item: '🏀', name: 'balls', color: 'orange', context: 'gym', verb: 'lost' },
                    { item: '✏️', name: 'pencils', color: 'yellow', context: 'desk', verb: 'lost' },
                ];
                const medScenarios = [
                    { item: '📖', name: 'pages', color: 'blue', context: 'book', verb: 'read' },
                    { item: '🪙', name: 'coins', color: 'yellow', context: 'piggy bank', verb: 'spent' },
                    { item: '🧱', name: 'blocks', color: 'orange', context: 'tower', verb: 'removed' },
                    { item: '🎟️', name: 'tickets', color: 'purple', context: 'raffle', verb: 'sold' },
                    { item: '🌲', name: 'trees', color: 'green', context: 'park', verb: 'cut down' },
                    { item: '🎁', name: 'presents', color: 'pink', context: 'birthday party', verb: 'opened' },
                ];
                const lgScenarios = [
                    { name: 'students', context: 'school district', verb: 'graduated' },
                    { name: 'books', context: 'library system', verb: 'were checked out' },
                    { name: 'visitors', context: 'museum', verb: 'left' },
                    { name: 'tickets', context: 'concert venue', verb: 'were refunded' },
                    { name: 'bottles of water', context: 'warehouse', verb: 'were shipped' },
                    { name: 'miles', context: 'road trip', verb: 'were already driven' },
                ];
                const xlScenarios = [
                    { name: 'people', context: 'city', verb: 'moved away' },
                    { name: 'dollars', context: 'budget', verb: 'was spent' },
                    { name: 'gallons of water', context: 'reservoir', verb: 'was used' },
                    { name: 'website visitors', context: 'month', verb: 'bounced' },
                    { name: 'votes', context: 'election', verb: 'were disqualified' },
                    { name: 'units', context: 'factory', verb: 'were defective' },
                ];

                const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Mia', 'Lucas'];
                const name1 = pick(names);
                let name2 = pick(names);
                while (name2 === name1) name2 = pick(names);

                let scenarios, useEmoji;
                if (maxVal <= 20) { scenarios = smallScenarios; useEmoji = true; }
                else if (maxVal <= 100) { scenarios = smallScenarios.concat(medScenarios); useEmoji = true; }
                else if (maxVal <= 1000) { scenarios = medScenarios; useEmoji = false; }
                else if (maxVal <= 10000) { scenarios = lgScenarios; useEmoji = false; }
                else { scenarios = xlScenarios; useEmoji = false; }

                const scenario = pick(scenarios);
                const minVal = maxVal <= 10 ? 1 : Math.max(2, Math.floor(maxVal / 10));

                let a, b, answer;
                if (isAdd) {
                    a = rng(minVal, maxVal);
                    b = rng(minVal, maxVal);
                    answer = a + b;
                } else {
                    a = rng(minVal, maxVal);
                    b = rng(minVal, Math.max(minVal, a - 1));
                    if (a < b) [a, b] = [b, a];
                    answer = a - b;
                }

                if (isAdd) {
                    const tpl = maxVal <= 100 ? [
                        `${name1} has ${a.toLocaleString()} ${scenario.name}. ${name2} gives ${name1} ${b.toLocaleString()} more ${scenario.name}. How many ${scenario.name} does ${name1} have now?`,
                        `There are ${a.toLocaleString()} ${scenario.name} in the ${scenario.context}. ${name1} adds ${b.toLocaleString()} more. How many ${scenario.name} are there in all?`,
                        `${name1} picks ${a.toLocaleString()} ${scenario.name}. Then ${name1} picks ${b.toLocaleString()} more. How many ${scenario.name} did ${name1} pick altogether?`,
                    ] : [
                        `A ${scenario.context} has ${a.toLocaleString()} ${scenario.name}. Then ${b.toLocaleString()} more ${scenario.name} arrive. How many ${scenario.name} are there now?`,
                        `${name1} counted ${a.toLocaleString()} ${scenario.name} in the morning. By evening, there were ${b.toLocaleString()} more. What is the total?`,
                        `One group has ${a.toLocaleString()} ${scenario.name} and another has ${b.toLocaleString()} ${scenario.name}. How many ${scenario.name} are there altogether?`,
                    ];
                    q.text = pick(tpl);
                } else {
                    const tpl = maxVal <= 100 ? [
                        `${name1} has ${a.toLocaleString()} ${scenario.name}. ${name1} ${scenario.verb} ${b.toLocaleString()} of them. How many ${scenario.name} does ${name1} have left?`,
                        `There were ${a.toLocaleString()} ${scenario.name}. ${b.toLocaleString()} were ${scenario.verb}. How many are left?`,
                        `${name1} started with ${a.toLocaleString()} ${scenario.name} and ${scenario.verb} ${b.toLocaleString()}. How many ${scenario.name} remain?`,
                    ] : [
                        `A ${scenario.context} had ${a.toLocaleString()} ${scenario.name}. Then ${b.toLocaleString()} ${scenario.verb}. How many ${scenario.name} remain?`,
                        `There were ${a.toLocaleString()} ${scenario.name}. After ${b.toLocaleString()} ${scenario.verb}, how many were left?`,
                        `${name1} recorded ${a.toLocaleString()} ${scenario.name}. Later, ${b.toLocaleString()} ${scenario.verb}. How many ${scenario.name} are left?`,
                    ];
                    q.text = pick(tpl);
                }

                q.ans = answer;
                q.answerType = 'number';
                q.hint = isAdd ? `Add: ${a.toLocaleString()} + ${b.toLocaleString()} = ?` : `Subtract: ${a.toLocaleString()} − ${b.toLocaleString()} = ?`;

                if (useEmoji && scenario.item) {
                    if (isAdd) {
                        const g1 = Array(Math.min(Math.floor(a), 15)).fill(scenario.item).join('');
                        const g2 = Array(Math.min(Math.floor(b), 15)).fill(scenario.item).join('');
                        q.visual = `<div class="word-problem-visual">
                            <div class="word-problem-scene">
                                <div class="visual-group group-${scenario.color}">
                                    <div style="font-size:1.3rem;">${g1}</div>
                                    <div class="visual-label">${a.toLocaleString()} ${scenario.name}</div>
                                </div>
                                <div style="font-size:2rem;color:#7209b7;font-weight:700;">+</div>
                                <div class="visual-group group-${scenario.color}">
                                    <div style="font-size:1.3rem;">${g2}</div>
                                    <div class="visual-label">${b.toLocaleString()} ${scenario.name}</div>
                                </div>
                            </div>
                            <div class="visual-equation">
                                <span>${a.toLocaleString()}</span><span class="op">+</span><span>${b.toLocaleString()}</span><span class="equals">=</span><span class="answer-box"></span>
                            </div>
                        </div>`;
                    } else {
                        const totalItems = Array(Math.min(Math.floor(a), 20)).fill(scenario.item);
                        const html = totalItems.map((it, i) =>
                            i < b ? `<span style="opacity:0.3;text-decoration:line-through;">${it}</span>` : `<span>${it}</span>`
                        ).join('');
                        q.visual = `<div class="word-problem-visual">
                            <div style="text-align:center;margin-bottom:10px;">
                                <div style="font-size:0.9rem;color:#666;margin-bottom:8px;">Started with ${a.toLocaleString()}, ${scenario.verb} ${b.toLocaleString()}:</div>
                                <div class="visual-group group-${scenario.color}" style="max-width:300px;">
                                    <div style="font-size:1.3rem;display:flex;flex-wrap:wrap;gap:3px;justify-content:center;">${html}</div>
                                </div>
                            </div>
                            <div class="visual-equation">
                                <span>${a.toLocaleString()}</span><span class="op">−</span><span>${b.toLocaleString()}</span><span class="equals">=</span><span class="answer-box"></span>
                            </div>
                        </div>`;
                    }
                } else {
                    q.visual = `<div class="word-problem-visual">
                        <div class="visual-equation" style="font-size:1.5rem;">
                            <span>${a.toLocaleString()}</span><span class="op">${isAdd ? '+' : '−'}</span><span>${b.toLocaleString()}</span><span class="equals">=</span><span class="answer-box"></span>
                        </div>
                    </div>`;
                }

                q.printFormat = isAdd ? 'word-add' : 'word-sub';
                q.options = buildNumericOptions(answer);
                return;
            }

            // ========================================
            // ADD THREE (Grade 1) - Add three numbers <= 20
            // ========================================
            if (mappedSkill === "add_three") {
                // Generate 3 numbers, each <= 10, sum <= 20
                let a, b, c;
                do {
                    a = rng(1, 10);
                    b = rng(1, 10);
                    c = rng(1, Math.min(10, 20 - a - b));
                } while (a + b + c > 20 || c < 1);
                const sum = a + b + c;

                q.text = `${a} + ${b} + ${c} = ?`;
                q.ans = sum;
                q.answerType = "number";
                q.hint = `Add the first two: ${a} + ${b} = ${a + b}. Then add the third: ${a + b} + ${c} = ${sum}`;

                // Visual: three groups of colored dots
                const dotR = 8;
                const dotGap = 22;
                const groupGap = 30;
                const maxPerRow = 5;

                const buildDotGroup = (count, color, startX, startY) => {
                    let dots = '';
                    for (let i = 0; i < count; i++) {
                        const col = i % maxPerRow;
                        const row = Math.floor(i / maxPerRow);
                        dots += `<circle cx="${startX + col * dotGap + dotR}" cy="${startY + row * dotGap + dotR}" r="${dotR}" fill="${color}" opacity="0.85"/>`;
                    }
                    const rows = Math.ceil(count / maxPerRow);
                    const cols = Math.min(count, maxPerRow);
                    return { svg: dots, w: cols * dotGap, h: rows * dotGap };
                };

                const grpA = buildDotGroup(a, "var(--accent-cyan)", 10, 30);
                const grpB = buildDotGroup(b, "var(--accent-green)", 10 + grpA.w + groupGap, 30);
                const grpC = buildDotGroup(c, "var(--accent-orange)", 10 + grpA.w + groupGap + grpB.w + groupGap, 30);

                const svgW = 10 + grpA.w + groupGap + grpB.w + groupGap + grpC.w + 20;
                const svgH = Math.max(grpA.h, grpB.h, grpC.h) + 60;

                // Plus signs between groups
                const plusY = 30 + Math.max(grpA.h, grpB.h, grpC.h) / 2;
                const plus1X = 10 + grpA.w + groupGap / 2;
                const plus2X = 10 + grpA.w + groupGap + grpB.w + groupGap / 2;

                // Labels under groups
                const labelY = svgH - 8;
                const labelAX = 10 + grpA.w / 2;
                const labelBX = 10 + grpA.w + groupGap + grpB.w / 2;
                const labelCX = 10 + grpA.w + groupGap + grpB.w + groupGap + grpC.w / 2;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Add Three Numbers</div>
                    <svg viewBox="0 0 ${svgW} ${svgH}" width="${Math.min(svgW, 360)}" style="background:var(--bg-card);border-radius:12px;padding:8px;">
                        ${grpA.svg}${grpB.svg}${grpC.svg}
                        <text x="${plus1X}" y="${plusY + 5}" text-anchor="middle" font-size="18" font-weight="700" fill="var(--text-bright)">+</text>
                        <text x="${plus2X}" y="${plusY + 5}" text-anchor="middle" font-size="18" font-weight="700" fill="var(--text-bright)">+</text>
                        <text x="${labelAX}" y="${labelY}" text-anchor="middle" font-size="14" font-weight="700" fill="var(--accent-cyan)">${a}</text>
                        <text x="${labelBX}" y="${labelY}" text-anchor="middle" font-size="14" font-weight="700" fill="var(--accent-green)">${b}</text>
                        <text x="${labelCX}" y="${labelY}" text-anchor="middle" font-size="14" font-weight="700" fill="var(--accent-orange)">${c}</text>
                    </svg>
                    <div style="margin-top:8px;font-size:1.1rem;font-weight:600;color:var(--text-bright);">
                        <span style="color:var(--accent-cyan);">${a}</span> + <span style="color:var(--accent-green);">${b}</span> + <span style="color:var(--accent-orange);">${c}</span> = ?
                    </div>
                </div>`;
                q.options = buildNumericOptions(sum);
                return;
            }

            // ========================================
            // COMPARISON WORD (Grade 1-2) - How many more/fewer
            // ========================================
            else if (mappedSkill === "comparison_word") {
                const maxVal = Math.min(range, 50);
                const valA = rng(3, maxVal);
                let valB = rng(1, maxVal);
                // Ensure they are different
                while (valB === valA) { valB = rng(1, maxVal); }

                const larger = Math.max(valA, valB);
                const smaller = Math.min(valA, valB);
                const difference = larger - smaller;

                const names = [
                    ["Emma", "Liam"], ["Ava", "Noah"], ["Mia", "Jack"],
                    ["Lily", "Ben"], ["Zoe", "Sam"], ["Ella", "Max"]
                ];
                const namePair = pick(names);
                const items = ["apples", "stickers", "books", "marbles", "crayons", "stars", "coins"];
                const item = pick(items);

                // Randomly assign who has more
                let nameMore, nameFewer, countMore, countFewer;
                if (Math.random() < 0.5) {
                    nameMore = namePair[0]; nameFewer = namePair[1];
                } else {
                    nameMore = namePair[1]; nameFewer = namePair[0];
                }
                countMore = larger;
                countFewer = smaller;

                const askMore = Math.random() < 0.5;
                if (askMore) {
                    q.text = `${nameMore} has ${countMore} ${item}. ${nameFewer} has ${countFewer} ${item}. How many MORE ${item} does ${nameMore} have than ${nameFewer}?`;
                } else {
                    q.text = `${nameMore} has ${countMore} ${item}. ${nameFewer} has ${countFewer} ${item}. How many FEWER ${item} does ${nameFewer} have than ${nameMore}?`;
                }
                q.ans = difference;
                q.answerType = "number";
                q.hint = `Subtract the smaller from the larger: ${countMore} - ${countFewer} = ${difference}`;

                // Visual: two bar models side by side showing comparison
                const barMaxW = 240;
                const barH = 32;
                const barGap = 16;
                const unitW = barMaxW / larger;
                const barAW = countMore * unitW;
                const barBW = countFewer * unitW;
                const svgW = barMaxW + 100;
                const svgH = barH * 2 + barGap + 70;

                const colorMore = "var(--accent-cyan)";
                const colorFewer = "var(--accent-green)";
                const colorDiff = "var(--accent-orange)";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Comparison Bar Model</div>
                    <svg viewBox="0 0 ${svgW} ${svgH}" width="${Math.min(svgW, 340)}" style="background:var(--bg-card);border-radius:12px;padding:10px;">
                        <!-- Name labels -->
                        <text x="5" y="${20 + barH / 2 + 5}" font-size="12" font-weight="700" fill="var(--text-bright)">${nameMore}</text>
                        <text x="5" y="${20 + barH + barGap + barH / 2 + 5}" font-size="12" font-weight="700" fill="var(--text-bright)">${nameFewer}</text>
                        <!-- More bar -->
                        <rect x="60" y="20" width="${barAW}" height="${barH}" rx="6" fill="${colorMore}" opacity="0.8"/>
                        <text x="${60 + barAW / 2}" y="${20 + barH / 2 + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${countMore}</text>
                        <!-- Fewer bar -->
                        <rect x="60" y="${20 + barH + barGap}" width="${barBW}" height="${barH}" rx="6" fill="${colorFewer}" opacity="0.8"/>
                        <text x="${60 + barBW / 2}" y="${20 + barH + barGap + barH / 2 + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${countFewer}</text>
                        <!-- Difference bracket -->
                        <rect x="${60 + barBW}" y="20" width="${barAW - barBW}" height="${barH}" rx="4" fill="${colorDiff}" opacity="0.3" stroke="${colorDiff}" stroke-width="2" stroke-dasharray="5,3"/>
                        <text x="${60 + barBW + (barAW - barBW) / 2}" y="${20 + barH / 2 + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="${colorDiff}">?</text>
                        <!-- Difference label -->
                        <text x="${60 + barBW + (barAW - barBW) / 2}" y="${svgH - 10}" text-anchor="middle" font-size="11" font-weight="600" fill="${colorDiff}">Difference = ?</text>
                    </svg>
                </div>`;
                q.options = buildNumericOptions(difference);
                return;
            }

            // ========================================
            // LONG DIVISION BY 2-DIGIT DIVISOR (Grade 5)
            // ========================================
            else if (mappedSkill === "long_div_2digit") {
                // Scale with state.range
                const maxDivisor = Math.max(12, Math.min(50, Math.floor(range / 20)));
                const divisor = rng(11, maxDivisor);
                const maxQuotient = Math.max(3, Math.min(Math.floor(range / divisor), 199));
                const quotient = rng(2, maxQuotient);
                const dividend = divisor * quotient;

                q.text = `${dividend} \u00F7 ${divisor} = ?`;
                q.ans = quotient;
                q.answerType = "number";
                q.hint = `How many times does ${divisor} go into ${dividend}? Try estimating: ${divisor} \u00D7 ${quotient > 10 ? Math.floor(quotient / 10) * 10 : '?'} = ${divisor * (quotient > 10 ? Math.floor(quotient / 10) * 10 : '?')}`;

                // Long division visual format
                const dividendStr = String(dividend);
                const divisorStr = String(divisor);
                const quotientStr = String(quotient);

                // Build step-by-step for visual
                let stepsHTML = '';
                let remainder = 0;
                let partialDividend = '';
                const digitResults = [];

                for (let i = 0; i < dividendStr.length; i++) {
                    partialDividend += dividendStr[i];
                    const partialNum = parseInt(partialDividend);
                    const digitQuotient = Math.floor(partialNum / divisor);
                    const product = digitQuotient * divisor;
                    remainder = partialNum - product;
                    digitResults.push({ partial: partialNum, digitQ: digitQuotient, product, remainder });
                    partialDividend = String(remainder);
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Long Division</div>
                    <div style="display:inline-block;background:var(--bg-card);border-radius:12px;padding:20px 30px;text-align:left;">
                        <div style="display:flex;align-items:flex-end;gap:4px;font-family:monospace;">
                            <div style="font-size:1.3rem;font-weight:700;color:var(--text-bright);padding-right:6px;align-self:center;">${divisorStr}</div>
                            <div style="position:relative;">
                                <div style="font-size:1.3rem;font-weight:700;letter-spacing:6px;color:var(--accent-orange);position:absolute;top:-28px;left:2px;">?</div>
                                <div style="border-left:3px solid var(--accent-cyan);border-top:3px solid var(--accent-cyan);padding:4px 10px 2px 10px;border-top-left-radius:6px;font-size:1.3rem;font-weight:700;letter-spacing:4px;color:var(--text-bright);">${dividendStr}</div>
                            </div>
                        </div>
                        <div style="margin-top:12px;font-size:0.85rem;color:var(--text-dim);">
                            ${divisorStr} &times; <span style="color:var(--accent-orange);font-weight:700;">?</span> = ${dividend}
                        </div>
                        <div style="margin-top:6px;font-size:0.85rem;color:var(--text-dim);">
                            Estimate: ${divisor} &times; ${Math.floor(quotient / 10) * 10 || 1} = ${divisor * (Math.floor(quotient / 10) * 10 || 1)}
                        </div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(quotient);
                return;
            }

            // ========================================
            // MULTIPLICATION COMPARISON (Grade 4) - "Times as many"
            // ========================================
            else if (mappedSkill === "mult_comparison") {
                // Scale with state.range
                const maxBase = Math.max(5, Math.min(Math.floor(Math.sqrt(range)), 20));
                const base = rng(2, maxBase);
                const multiplier = rng(2, Math.min(9, Math.floor(range / base)));
                const product = base * multiplier;

                const names = [
                    ["Tom", "Lisa"], ["Jake", "Maya"], ["Ben", "Ava"],
                    ["Sam", "Ella"], ["Max", "Zoe"], ["Leo", "Mia"]
                ];
                const namePair = pick(names);
                const items = ["apples", "stickers", "books", "marbles", "crayons", "coins", "cards", "toys"];
                const item = pick(items);

                // Randomly decide format
                const format = rng(0, 2);
                if (format === 0) {
                    q.text = `${namePair[0]} has ${base} ${item}. ${namePair[1]} has ${multiplier} times as many. How many ${item} does ${namePair[1]} have?`;
                    q.ans = product;
                    q.hint = `"${multiplier} times as many" means multiply: ${base} \u00D7 ${multiplier} = ${product}`;
                } else if (format === 1) {
                    q.text = `${namePair[0]} has ${base} ${item}. ${namePair[1]} has ${product} ${item}. How many times as many ${item} does ${namePair[1]} have?`;
                    q.ans = multiplier;
                    q.hint = `Divide to find the multiplier: ${product} \u00F7 ${base} = ${multiplier}`;
                } else {
                    q.text = `${namePair[1]} has ${product} ${item}, which is ${multiplier} times as many as ${namePair[0]}. How many ${item} does ${namePair[0]} have?`;
                    q.ans = base;
                    q.hint = `Divide to find the base amount: ${product} \u00F7 ${multiplier} = ${base}`;
                }
                q.answerType = "number";

                // Tape diagram visual: two bars showing multiplier relationship
                const unitW = 36;
                const barH = 36;
                const barGap = 14;
                const topBarW = unitW;
                const bottomBarW = unitW * multiplier;
                const svgW = Math.max(bottomBarW + 120, 280);
                const svgH = barH * 2 + barGap + 80;

                const topColor = "var(--accent-cyan)";
                const bottomColor = "var(--accent-green)";
                const labelColor = "var(--text-bright)";

                // Build segments for bottom bar
                let segments = '';
                for (let i = 0; i < multiplier; i++) {
                    const x = 70 + i * unitW;
                    segments += `<rect x="${x}" y="${30 + barH + barGap}" width="${unitW - 2}" height="${barH}" rx="4" fill="${bottomColor}" opacity="${0.6 + (i % 2) * 0.2}" stroke="${bottomColor}" stroke-width="1"/>`;
                    segments += `<text x="${x + unitW / 2 - 1}" y="${30 + barH + barGap + barH / 2 + 5}" text-anchor="middle" font-size="11" font-weight="600" fill="#fff">${base}</text>`;
                }

                // Brace annotation
                const braceY = 30 + barH * 2 + barGap + 10;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Tape Diagram - Times As Many</div>
                    <svg viewBox="0 0 ${svgW} ${svgH}" width="${Math.min(svgW, 360)}" style="background:var(--bg-card);border-radius:12px;padding:10px;">
                        <!-- Top bar (base) -->
                        <text x="5" y="${30 + barH / 2 + 5}" font-size="11" font-weight="700" fill="${labelColor}">${namePair[0]}</text>
                        <rect x="70" y="30" width="${topBarW}" height="${barH}" rx="5" fill="${topColor}" opacity="0.85"/>
                        <text x="${70 + topBarW / 2}" y="${30 + barH / 2 + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">${base}</text>

                        <!-- Bottom bar (product, segmented) -->
                        <text x="5" y="${30 + barH + barGap + barH / 2 + 5}" font-size="11" font-weight="700" fill="${labelColor}">${namePair[1]}</text>
                        ${segments}

                        <!-- Multiplier label -->
                        <text x="${70 + bottomBarW / 2}" y="${braceY + 5}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--accent-orange);">&times;${multiplier}</text>
                        <line x1="70" y1="${braceY - 4}" x2="${70 + bottomBarW}" y2="${braceY - 4}" stroke="var(--accent-orange)" stroke-width="1.5" stroke-dasharray="4,2"/>

                        <!-- Total label -->
                        <text x="${70 + bottomBarW + 10}" y="${30 + barH + barGap + barH / 2 + 5}" font-size="12" font-weight="700" fill="var(--accent-orange);">= ${format === 0 ? '?' : product}</text>
                    </svg>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                return;
            }

            // Check for new specialized skills first
            else if (mappedSkill === "add_sub_fact_family") {
                // Addition/Subtraction Fact Families
                const addend1 = rng(1, Math.min(range, 20));
                const addend2 = rng(1, Math.min(range, 20));
                const sum = addend1 + addend2;
                
                // Create all four equations
                const equations = [
                    { text: `${addend1} + ${addend2} = ___`, ans: sum, type: 'add' },
                    { text: `${addend2} + ${addend1} = ___`, ans: sum, type: 'add' },
                    { text: `${sum} − ${addend1} = ___`, ans: addend2, type: 'sub' },
                    { text: `${sum} − ${addend2} = ___`, ans: addend1, type: 'sub' }
                ];
                
                // Randomly choose which blanks to show (all 4, or 2 given/2 blank)
                const showAll = Math.random() < 0.6;
                
                q.text = `Fact Family: ${addend1}, ${addend2}, ${sum}`;
                q.ans = showAll ? `${sum}, ${sum}, ${addend2}, ${addend1}` : equations[0].ans;
                q.answerType = "fact-family";
                q.hint = `These three numbers make a fact family! Addition and subtraction are related.`;
                
                q.factFamilyData = {
                    numbers: [addend1, addend2, sum],
                    equations: equations,
                    showAll: showAll
                };
                q.printFormat = "fact-family-add-sub";
                
                // Visual for screen
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.2rem;">🏠 Addition/Subtraction Fact Family</div>
                    <div style="font-size:1.5rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Numbers: <span style="color:var(--accent-orange);">${addend1}</span>, <span style="color:var(--accent-cyan);">${addend2}</span>, <span style="color:var(--accent-green);">${sum}</span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:500px;margin:0 auto;">
                        ${equations.map((eq, i) => `<div style="padding:14px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${eq.type === 'add' ? 'var(--accent-green)' : 'var(--accent-orange)'};">
                            <div style="font-size:1.4rem;">${eq.text.replace('___', '<input type="text" class="fact-family-input" data-eq="' + i + '" data-answer="' + eq.ans + '" style="width:60px;height:38px;border:2px solid var(--accent-cyan);border-radius:4px;text-align:center;font-size:1.3rem;background:var(--bg-card-light);" placeholder="?">')}</div>
                        </div>`).join('')}
                    </div>
                    <div style="margin-top:15px;font-size:1rem;color:var(--text-dim);">
                        Fill in all four equations using the same three numbers.
                    </div>
                </div>`;
                q.options = [];
                return;
            }
            
            if (mappedSkill === "mult_div_fact_family") {
                // Multiplication/Division Fact Families
                const factor1 = rng(2, 12);
                const factor2 = rng(2, 12);
                const product = factor1 * factor2;
                const isSquare = factor1 === factor2;
                
                // Create equations (2 or 4 depending on square)
                const equations = isSquare ? [
                    { text: `${factor1} × ${factor2} = ___`, ans: product, type: 'mult' },
                    { text: `${product} ÷ ${factor1} = ___`, ans: factor2, type: 'div' }
                ] : [
                    { text: `${factor1} × ${factor2} = ___`, ans: product, type: 'mult' },
                    { text: `${factor2} × ${factor1} = ___`, ans: product, type: 'mult' },
                    { text: `${product} ÷ ${factor1} = ___`, ans: factor2, type: 'div' },
                    { text: `${product} ÷ ${factor2} = ___`, ans: factor1, type: 'div' }
                ];
                
                // Apply division notation variety (Feature 2)
                const divNotations = ['symbol', 'fraction', 'bracket'];
                equations.forEach(eq => {
                    if (eq.type === 'div') {
                        const notation = pick(divNotations);
                        if (notation === 'fraction') {
                            eq.displayText = `<div style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;"><span style="border-bottom:2px solid currentColor;padding:0 5px;">${product}</span><span style="padding:0 5px;">${eq.text.includes(`÷ ${factor1}`) ? factor1 : factor2}</span></div> = ___`;
                        } else if (notation === 'bracket') {
                            const divisor = eq.text.includes(`÷ ${factor1}`) ? factor1 : factor2;
                            eq.displayText = `<span style="margin-right:2px;">${divisor}</span><span style="border-top:2px solid currentColor;border-left:2px solid currentColor;padding:2px 8px;border-top-left-radius:5px;">${product}</span> = ___`;
                        } else {
                            eq.displayText = eq.text;
                        }
                    } else {
                        eq.displayText = eq.text;
                    }
                });
                
                q.text = `Fact Family: ${factor1}, ${factor2}, ${product}${isSquare ? ' (square number)' : ''}`;
                q.ans = equations.map(e => e.ans).join(', ');
                q.answerType = "fact-family";
                q.hint = `Multiplication and division are related! ${factor1} × ${factor2} = ${product}, so ${product} ÷ ${factor1} = ${factor2}`;
                
                q.factFamilyData = {
                    numbers: [factor1, factor2, product],
                    equations: equations,
                    isSquare: isSquare
                };
                q.printFormat = "fact-family-mult-div";
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.2rem;">🏠 Multiplication/Division Fact Family</div>
                    <div style="font-size:1.5rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Numbers: <span style="color:var(--accent-orange);">${factor1}</span>, <span style="color:var(--accent-cyan);">${factor2}</span>, <span style="color:var(--accent-green);">${product}</span>
                        ${isSquare ? '<span style="font-size:0.9rem;color:var(--text-dim);"> (square)</span>' : ''}
                    </div>
                    <div style="display:grid;grid-template-columns:${isSquare ? '1fr' : '1fr 1fr'};gap:14px;max-width:${isSquare ? '260px' : '500px'};margin:0 auto;">
                        ${equations.map((eq, i) => `<div style="padding:14px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${eq.type === 'mult' ? 'var(--accent-green)' : 'var(--accent-orange)'};">
                            <div style="font-size:1.4rem;">${(eq.displayText || eq.text).replace('___', '<input type="text" class="fact-family-input" data-eq="' + i + '" data-answer="' + eq.ans + '" style="width:60px;height:38px;border:2px solid var(--accent-cyan);border-radius:4px;text-align:center;font-size:1.3rem;background:var(--bg-card-light);" placeholder="?">')}</div>
                        </div>`).join('')}
                    </div>
                </div>`;
                q.options = [];
                return;
            }
            
            // ========================================
            // NUMBER FAMILIES - ENHANCED IMPLEMENTATION
            // ========================================
            
            // Addition/Subtraction Number Families with difficulty levels
            if (mappedSkill.startsWith("number_families_add")) {
                const isEasy = mappedSkill === "number_families_add";
                const isMedium = mappedSkill === "number_families_add_med";
                const isHard = mappedSkill === "number_families_add_hard";
                
                // Generate appropriate numbers based on range
                const maxNum = Math.min(range, isEasy ? 10 : isMedium ? 20 : 50);
                const addend1 = rng(1, maxNum);
                const addend2 = rng(1, maxNum);
                const sum = addend1 + addend2;
                
                // Create the four equations with consistent structure
                // Each equation: [num1, op, num2, equals, result]
                const familyData = {
                    a: addend1,
                    b: addend2,
                    c: sum,
                    equations: [
                        { nums: [addend1, addend2, sum], op: '+', type: 'add' },
                        { nums: [addend2, addend1, sum], op: '+', type: 'add' },
                        { nums: [sum, addend1, addend2], op: '−', type: 'sub' },
                        { nums: [sum, addend2, addend1], op: '−', type: 'sub' }
                    ]
                };
                
                // Determine which positions to hide based on difficulty
                // Each equation has 3 positions: [0, 1, 2] for the three numbers
                let missingPositions = [];
                
                if (isEasy) {
                    // Easy: 1-2 numbers missing total, always the result
                    familyData.equations.forEach((eq, idx) => {
                        missingPositions.push([2]); // Only result missing
                    });
                } else if (isMedium) {
                    // Medium: Multiple missing numbers - vary by position
                    familyData.equations.forEach((eq, idx) => {
                        if (idx === 0) missingPositions.push([0, 2]); // First num and result
                        else if (idx === 1) missingPositions.push([1, 2]); // Second num and result
                        else if (idx === 2) missingPositions.push([1, 2]); // Second num and result
                        else missingPositions.push([0, 2]); // First num and result
                    });
                } else {
                    // Hard: All numbers missing
                    familyData.equations.forEach(() => {
                        missingPositions.push([0, 1, 2]);
                    });
                }
                
                familyData.missingPositions = missingPositions;
                
                // Generate visual with aligned columns
                const createInputBox = (value, eqIdx, posIdx, isMissing) => {
                    if (isMissing) {
                        return `<input type="text" class="number-family-input" data-eq="${eqIdx}" data-pos="${posIdx}" data-answer="${value}" style="width:60px;height:44px;border:2px solid var(--accent-cyan);border-radius:6px;text-align:center;font-size:1.4rem;font-weight:600;background:var(--bg-card-light);color:var(--text);" placeholder="?">`;
                    } else {
                        return `<span style="display:inline-block;width:60px;height:44px;line-height:44px;text-align:center;font-size:1.4rem;font-weight:700;color:var(--text);">${value}</span>`;
                    }
                };

                let equationsHTML = familyData.equations.map((eq, eqIdx) => {
                    const missing = missingPositions[eqIdx];
                    const borderColor = eq.type === 'add' ? 'var(--accent-green)' : 'var(--accent-orange)';

                    return `<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:12px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${borderColor};">
                        ${createInputBox(eq.nums[0], eqIdx, 0, missing.includes(0))}
                        <span style="font-size:1.5rem;font-weight:700;width:28px;text-align:center;">${eq.op}</span>
                        ${createInputBox(eq.nums[1], eqIdx, 1, missing.includes(1))}
                        <span style="font-size:1.5rem;font-weight:700;width:28px;text-align:center;">=</span>
                        ${createInputBox(eq.nums[2], eqIdx, 2, missing.includes(2))}
                    </div>`;
                }).join('');

                q.text = `Number Family: Complete all equations`;
                q.ans = `${addend1}, ${addend2}, ${sum}`;
                q.answerType = "number-family";
                q.hint = `These three numbers (${addend1}, ${addend2}, ${sum}) make a number family! Addition and subtraction are related.`;

                q.numberFamilyData = {
                    ...familyData,
                    operationType: 'add_sub',
                    difficulty: isEasy ? 'easy' : isMedium ? 'medium' : 'hard'
                };
                q.printFormat = "number-family-add-sub";

                const difficultyLabel = isEasy ? '🟢 Easy' : isMedium ? '🟡 Medium' : '🟠 Hard';

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.2rem;">🏠 Addition/Subtraction Number Family <span style="font-size:0.95rem;">(${difficultyLabel})</span></div>
                    <div style="font-size:1.5rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Numbers: <span style="color:var(--accent-orange);">${addend1}</span>, <span style="color:var(--accent-cyan);">${addend2}</span>, <span style="color:var(--accent-green);">${sum}</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;max-width:420px;margin:0 auto;">
                        ${equationsHTML}
                    </div>
                    <div style="margin-top:15px;">
                        <button onclick="checkNumberFamily()" style="padding:10px 25px;background:var(--accent-green);color:white;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;">✓ Check Answers</button>
                    </div>
                    <div id="numberFamilyFeedback" style="margin-top:12px;font-weight:600;"></div>
                </div>`;
                q.options = [];
                return;
            }
            
            // Multiplication/Division Number Families with difficulty levels
            if (mappedSkill.startsWith("number_families_mult")) {
                const isEasy = mappedSkill === "number_families_mult";
                const isMedium = mappedSkill === "number_families_mult_med";
                const isHard = mappedSkill === "number_families_mult_hard";
                
                // Generate factors based on difficulty
                const maxFactor = isEasy ? 5 : isMedium ? 10 : 12;
                const factor1 = rng(2, maxFactor);
                const factor2 = rng(2, maxFactor);
                const product = factor1 * factor2;
                const isSquare = factor1 === factor2;
                
                // Create equations (2 for squares, 4 for non-squares)
                const familyData = {
                    a: factor1,
                    b: factor2,
                    c: product,
                    isSquare: isSquare,
                    equations: isSquare ? [
                        { nums: [factor1, factor2, product], op: '×', type: 'mult' },
                        { nums: [product, factor1, factor2], op: '÷', type: 'div' }
                    ] : [
                        { nums: [factor1, factor2, product], op: '×', type: 'mult' },
                        { nums: [factor2, factor1, product], op: '×', type: 'mult' },
                        { nums: [product, factor1, factor2], op: '÷', type: 'div' },
                        { nums: [product, factor2, factor1], op: '÷', type: 'div' }
                    ]
                };
                
                // Determine missing positions based on difficulty
                let missingPositions = [];
                
                if (isEasy) {
                    // Easy: Only result missing
                    familyData.equations.forEach(() => {
                        missingPositions.push([2]);
                    });
                } else if (isMedium) {
                    // Medium: Multiple missing
                    familyData.equations.forEach((eq, idx) => {
                        if (eq.type === 'mult') {
                            missingPositions.push(idx % 2 === 0 ? [0, 2] : [1, 2]);
                        } else {
                            missingPositions.push(idx % 2 === 0 ? [1, 2] : [0, 2]);
                        }
                    });
                } else {
                    // Hard: All missing
                    familyData.equations.forEach(() => {
                        missingPositions.push([0, 1, 2]);
                    });
                }
                
                familyData.missingPositions = missingPositions;
                
                // Generate visual
                const createInputBox = (value, eqIdx, posIdx, isMissing) => {
                    if (isMissing) {
                        return `<input type="text" class="number-family-input" data-eq="${eqIdx}" data-pos="${posIdx}" data-answer="${value}" style="width:60px;height:44px;border:2px solid var(--accent-cyan);border-radius:6px;text-align:center;font-size:1.4rem;font-weight:600;background:var(--bg-card-light);color:var(--text);" placeholder="?">`;
                    } else {
                        return `<span style="display:inline-block;width:60px;height:44px;line-height:44px;text-align:center;font-size:1.4rem;font-weight:700;color:var(--text);">${value}</span>`;
                    }
                };

                let equationsHTML = familyData.equations.map((eq, eqIdx) => {
                    const missing = missingPositions[eqIdx];
                    const borderColor = eq.type === 'mult' ? 'var(--accent-green)' : 'var(--accent-orange)';

                    return `<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:12px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${borderColor};">
                        ${createInputBox(eq.nums[0], eqIdx, 0, missing.includes(0))}
                        <span style="font-size:1.5rem;font-weight:700;width:28px;text-align:center;">${eq.op}</span>
                        ${createInputBox(eq.nums[1], eqIdx, 1, missing.includes(1))}
                        <span style="font-size:1.5rem;font-weight:700;width:28px;text-align:center;">=</span>
                        ${createInputBox(eq.nums[2], eqIdx, 2, missing.includes(2))}
                    </div>`;
                }).join('');

                q.text = `Number Family: Complete all equations`;
                q.ans = `${factor1}, ${factor2}, ${product}`;
                q.answerType = "number-family";
                q.hint = `These three numbers (${factor1}, ${factor2}, ${product}) make a number family! Multiplication and division are related.`;

                q.numberFamilyData = {
                    ...familyData,
                    operationType: 'mult_div',
                    difficulty: isEasy ? 'easy' : isMedium ? 'medium' : 'hard'
                };
                q.printFormat = "number-family-mult-div";

                const difficultyLabel = isEasy ? '🟢 Easy' : isMedium ? '🟡 Medium' : '🟠 Hard';

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.2rem;">🏠 Multiplication/Division Number Family <span style="font-size:0.95rem;">(${difficultyLabel})</span>${isSquare ? ' <span style="font-size:0.9rem;color:var(--text-dim);">(square)</span>' : ''}</div>
                    <div style="font-size:1.5rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Numbers: <span style="color:var(--accent-orange);">${factor1}</span>, <span style="color:var(--accent-cyan);">${factor2}</span>, <span style="color:var(--accent-green);">${product}</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;max-width:420px;margin:0 auto;">
                        ${equationsHTML}
                    </div>
                    <div style="margin-top:15px;">
                        <button onclick="checkNumberFamily()" style="padding:10px 25px;background:var(--accent-green);color:white;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;">✓ Check Answers</button>
                    </div>
                    <div id="numberFamilyFeedback" style="margin-top:12px;font-weight:600;"></div>
                </div>`;
                q.options = [];
                return;
            }
            
            // Mixed Number Families - ALL 4 Operations (Easy/Medium/Hard)
            // Shows addition, subtraction, multiplication, AND division in one problem
            if (mappedSkill.startsWith("number_families_mixed")) {
                const isEasy = mappedSkill === "number_families_mixed";
                const isMedium = mappedSkill === "number_families_mixed_med";
                const isHard = mappedSkill === "number_families_mixed_hard";
                
                // Pick two numbers that work well for all operations
                const maxNum = isEasy ? 5 : isMedium ? 8 : 10;
                const a = rng(2, maxNum);
                const b = rng(2, maxNum);
                const sum = a + b;
                const product = a * b;
                const isSquare = a === b;
                
                // Build ALL equations - addition, subtraction, multiplication, division
                const equations = [];
                
                // Addition equations (2 equations, or 1 if a === b)
                equations.push({ nums: [a, b, sum], op: '+', type: 'add' });
                if (!isSquare) {
                    equations.push({ nums: [b, a, sum], op: '+', type: 'add' });
                }
                
                // Subtraction equations (2 equations)
                equations.push({ nums: [sum, a, b], op: '−', type: 'sub' });
                if (!isSquare) {
                    equations.push({ nums: [sum, b, a], op: '−', type: 'sub' });
                }
                
                // Multiplication equations (2 equations, or 1 if a === b)
                equations.push({ nums: [a, b, product], op: '×', type: 'mult' });
                if (!isSquare) {
                    equations.push({ nums: [b, a, product], op: '×', type: 'mult' });
                }
                
                // Division equations (2 equations)
                equations.push({ nums: [product, a, b], op: '÷', type: 'div' });
                if (!isSquare) {
                    equations.push({ nums: [product, b, a], op: '÷', type: 'div' });
                }
                
                // Set missing positions based on difficulty
                const missingPositions = [];
                if (isEasy) {
                    // Easy: only answers missing
                    equations.forEach(() => missingPositions.push([2]));
                } else if (isMedium) {
                    // Medium: mix of blanks
                    equations.forEach((eq, idx) => {
                        if (idx % 2 === 0) {
                            missingPositions.push([0, 2]);
                        } else {
                            missingPositions.push([1, 2]);
                        }
                    });
                } else {
                    // Hard: all positions missing
                    equations.forEach(() => missingPositions.push([0, 1, 2]));
                }
                
                const familyData = {
                    a: a,
                    b: b,
                    sum: sum,
                    product: product,
                    isSquare: isSquare,
                    equations: equations,
                    missingPositions: missingPositions,
                    operationType: 'all_four'
                };
                
                // Create input box helper
                const createInputBox = (value, eqIdx, posIdx, isMissing) => {
                    if (isMissing) {
                        return `<input type="text" class="number-family-input" data-eq="${eqIdx}" data-pos="${posIdx}" data-answer="${value}" style="width:60px;height:44px;border:2px solid var(--accent-cyan);border-radius:6px;text-align:center;font-size:1.4rem;font-weight:600;background:var(--bg-card-light);color:var(--text);" placeholder="?">`;
                    }
                    return `<span style="font-size:1.4rem;font-weight:700;width:60px;text-align:center;display:inline-block;">${value}</span>`;
                };

                // Create visual with two columns: Add/Sub on left, Mult/Div on right
                const addSubEqs = equations.filter(eq => eq.type === 'add' || eq.type === 'sub');
                const multDivEqs = equations.filter(eq => eq.type === 'mult' || eq.type === 'div');

                const renderEquation = (eq, eqIdx) => {
                    const globalIdx = equations.indexOf(eq);
                    const missing = missingPositions[globalIdx];
                    const borderColor = (eq.type === 'add' || eq.type === 'mult') ? 'var(--accent-green)' : 'var(--accent-orange)';

                    return `<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:10px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${borderColor};">
                        ${createInputBox(eq.nums[0], globalIdx, 0, missing.includes(0))}
                        <span style="font-size:1.5rem;font-weight:700;width:28px;text-align:center;">${eq.op}</span>
                        ${createInputBox(eq.nums[1], globalIdx, 1, missing.includes(1))}
                        <span style="font-size:1.5rem;font-weight:700;width:28px;text-align:center;">=</span>
                        ${createInputBox(eq.nums[2], globalIdx, 2, missing.includes(2))}
                    </div>`;
                };

                const addSubHTML = addSubEqs.map((eq, idx) => renderEquation(eq, idx)).join('');
                const multDivHTML = multDivEqs.map((eq, idx) => renderEquation(eq, idx)).join('');

                q.text = `Number Family: Complete ALL equations using ${a} and ${b}`;
                q.ans = `${a}, ${b}, ${sum}, ${product}`;
                q.answerType = "number-family";
                q.hint = `Use ${a} and ${b} for all equations! Sum = ${sum}, Product = ${product}`;

                q.numberFamilyData = {
                    ...familyData,
                    difficulty: isEasy ? 'easy' : isMedium ? 'medium' : 'hard'
                };
                q.printFormat = "number-family-all-four";

                const difficultyLabel = isEasy ? '🟢 Easy' : isMedium ? '🟡 Medium' : '🟠 Hard';

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.2rem;">🏠 Number Family - All 4 Operations <span style="font-size:0.95rem;">(${difficultyLabel})</span></div>
                    <div style="font-size:1.4rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Base Numbers: <span style="color:var(--accent-orange);">${a}</span> and <span style="color:var(--accent-cyan);">${b}</span>
                        <div style="font-size:1rem;color:var(--text-dim);margin-top:5px;">Sum: ${sum} | Product: ${product}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:700px;margin:0 auto;">
                        <div>
                            <div style="font-weight:600;margin-bottom:8px;color:var(--accent-purple);font-size:1.05rem;">➕➖ Add/Subtract</div>
                            <div style="display:flex;flex-direction:column;gap:10px;">
                                ${addSubHTML}
                            </div>
                        </div>
                        <div>
                            <div style="font-weight:600;margin-bottom:8px;color:var(--accent-purple);font-size:1.05rem;">✖️➗ Multiply/Divide</div>
                            <div style="display:flex;flex-direction:column;gap:10px;">
                                ${multDivHTML}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:15px;">
                        <button onclick="checkNumberFamily()" style="padding:10px 25px;background:var(--accent-green);color:white;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;">✓ Check Answers</button>
                    </div>
                    <div id="numberFamilyFeedback" style="margin-top:12px;font-weight:600;"></div>
                </div>`;
                q.options = [];
                return;
            }

            // ========================================
            // ARRAYS & EQUAL GROUPS
            // ========================================
            if (mappedSkill === "arrays_groups") {
                const questionType = pick(['count_all', 'write_mult', 'equal_groups']);
                // Scale array size with range but cap for visual display
                const arrMaxRows = Math.max(2, Math.min(range <= 50 ? 5 : range <= 100 ? 6 : 8, 10));
                const arrMaxCols = Math.max(2, Math.min(range <= 50 ? 6 : range <= 100 ? 8 : 10, 12));
                const rows = rng(2, arrMaxRows);
                const cols = rng(2, arrMaxCols);
                const total = rows * cols;

                // Build SVG array of dots
                const dotR = 12;
                const gapX = 36;
                const gapY = 36;
                const padX = 30;
                const padY = 30;
                const svgW = padX * 2 + (cols - 1) * gapX + dotR * 2;
                const svgH = padY * 2 + (rows - 1) * gapY + dotR * 2;
                const dotColor = 'var(--accent-green)';

                let dotsStr = '';
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const cx = padX + dotR + c * gapX;
                        const cy = padY + dotR + r * gapY;
                        dotsStr += `<circle cx="${cx}" cy="${cy}" r="${dotR}" fill="${dotColor}" stroke="var(--text-bright)" stroke-width="1.5"/>`;
                    }
                }

                const arraySVG = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="max-width:100%;">
                    <rect x="0" y="0" width="${svgW}" height="${svgH}" rx="12" fill="var(--bg-card)" stroke="var(--accent-orange)" stroke-width="2"/>
                    ${dotsStr}
                </svg>`;

                if (questionType === 'count_all') {
                    q.text = `How many dots in all?`;
                    q.ans = total;
                    q.hint = `Count the rows and columns. ${rows} rows of ${cols} = ${rows} x ${cols}`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(total);
                } else if (questionType === 'write_mult') {
                    q.text = `This array shows ___ rows of ___. How many in all?`;
                    q.ans = total;
                    q.hint = `There are ${rows} rows, each with ${cols} dots. Multiply ${rows} x ${cols}`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(total);
                } else {
                    // equal_groups: show groups of objects, ask how many groups
                    q.text = `There are ${total} dots arranged in equal rows of ${cols}. How many rows?`;
                    q.ans = rows;
                    q.hint = `Divide: ${total} / ${cols} = ?`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(rows);
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-orange);">Array: ${rows} rows x ${cols} columns</div>
                    ${arraySVG}
                    <div style="margin-top:8px;font-size:0.9rem;color:var(--text-dim);">${rows} x ${cols} = ?</div>
                </div>`;
                q.printFormat = 'arrays-groups';
                q.skillLabel = 'Arrays';
                return;
            }

            // ========================================
            // MULTIPLICATION PROPERTIES
            // ========================================
            if (mappedSkill === "mult_properties") {
                const propType = pick(['commutative', 'distributive', 'identity', 'zero']);

                if (propType === 'commutative') {
                    const a = rng(2, 9);
                    const b = rng(2, 9);
                    const product = a * b;
                    q.text = `If ${a} x ${b} = ${product}, what is ${b} x ${a}?`;
                    q.ans = product;
                    q.hint = `Commutative property: changing the order doesn't change the product. ${a} x ${b} = ${b} x ${a}`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(product);

                    // Two arrays side by side (original and rotated)
                    const dotR = 8;
                    const gap = 24;
                    const pad = 20;
                    const w1 = pad * 2 + (b - 1) * gap + dotR * 2;
                    const h1 = pad * 2 + (a - 1) * gap + dotR * 2;
                    const w2 = pad * 2 + (a - 1) * gap + dotR * 2;
                    const h2 = pad * 2 + (b - 1) * gap + dotR * 2;

                    let dots1 = '';
                    for (let r = 0; r < a; r++) {
                        for (let c = 0; c < b; c++) {
                            dots1 += `<circle cx="${pad + dotR + c * gap}" cy="${pad + dotR + r * gap}" r="${dotR}" fill="var(--accent-green)" stroke="var(--text-bright)" stroke-width="1"/>`;
                        }
                    }
                    let dots2 = '';
                    for (let r = 0; r < b; r++) {
                        for (let c = 0; c < a; c++) {
                            dots2 += `<circle cx="${pad + dotR + c * gap}" cy="${pad + dotR + r * gap}" r="${dotR}" fill="var(--accent-orange)" stroke="var(--text-bright)" stroke-width="1"/>`;
                        }
                    }

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Commutative Property</div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap;">
                            <div>
                                <div style="font-size:0.9rem;margin-bottom:5px;color:var(--accent-green);">${a} x ${b}</div>
                                <svg width="${w1}" height="${h1}" viewBox="0 0 ${w1} ${h1}" style="max-width:100%;">
                                    <rect x="0" y="0" width="${w1}" height="${h1}" rx="8" fill="var(--bg-card)" stroke="var(--accent-green)" stroke-width="2"/>
                                    ${dots1}
                                </svg>
                            </div>
                            <div style="font-size:1.5rem;font-weight:700;color:var(--text-dim);">=</div>
                            <div>
                                <div style="font-size:0.9rem;margin-bottom:5px;color:var(--accent-orange);">${b} x ${a}</div>
                                <svg width="${w2}" height="${h2}" viewBox="0 0 ${w2} ${h2}" style="max-width:100%;">
                                    <rect x="0" y="0" width="${w2}" height="${h2}" rx="8" fill="var(--bg-card)" stroke="var(--accent-orange)" stroke-width="2"/>
                                    ${dots2}
                                </svg>
                            </div>
                        </div>
                        <div style="margin-top:8px;font-size:0.9rem;color:var(--text-dim);">Same product, different order!</div>
                    </div>`;

                } else if (propType === 'distributive') {
                    const a = rng(3, 8);
                    const splitPart = rng(1, a - 1);
                    const b = rng(2, 9);
                    const missingPart = a - splitPart;
                    const product = a * b;
                    q.text = `${a} x ${b} = ${splitPart} x ${b} + ___ x ${b}. What is the missing number?`;
                    q.ans = missingPart;
                    q.hint = `Distributive property: ${a} x ${b} = (${splitPart} + ?) x ${b}. Since ${splitPart} + ${missingPart} = ${a}, the missing number is ${missingPart}`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(missingPart);

                    // Array split into two parts with dotted line
                    const dotR = 8;
                    const gap = 24;
                    const pad = 20;
                    const totalCols = b;
                    const svgW = pad * 2 + (totalCols - 1) * gap + dotR * 2;
                    const svgH = pad * 2 + (a - 1) * gap + dotR * 2;

                    let splitDots = '';
                    for (let r = 0; r < a; r++) {
                        for (let c = 0; c < totalCols; c++) {
                            const color = r < splitPart ? 'var(--accent-green)' : 'var(--accent-orange)';
                            splitDots += `<circle cx="${pad + dotR + c * gap}" cy="${pad + dotR + r * gap}" r="${dotR}" fill="${color}" stroke="var(--text-bright)" stroke-width="1"/>`;
                        }
                    }
                    // Dotted line between the two sections
                    const lineY = pad + splitPart * gap;
                    splitDots += `<line x1="${pad - 5}" y1="${lineY}" x2="${svgW - pad + 5}" y2="${lineY}" stroke="var(--text-bright)" stroke-width="2" stroke-dasharray="6,4"/>`;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Distributive Property</div>
                        <div style="margin-bottom:8px;font-size:1.1rem;">${a} x ${b} = <span style="color:var(--accent-green);">${splitPart} x ${b}</span> + <span style="color:var(--accent-orange);">? x ${b}</span></div>
                        <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="max-width:100%;">
                            <rect x="0" y="0" width="${svgW}" height="${svgH}" rx="8" fill="var(--bg-card)" stroke="var(--accent-cyan)" stroke-width="2"/>
                            ${splitDots}
                        </svg>
                        <div style="display:flex;justify-content:center;gap:15px;margin-top:8px;font-size:0.85rem;">
                            <span style="color:var(--accent-green);">${splitPart} rows</span>
                            <span style="color:var(--accent-orange);">? rows</span>
                        </div>
                    </div>`;

                } else if (propType === 'identity') {
                    const num = rng(2, 12);
                    const order = pick(['num_first', 'one_first']);
                    if (order === 'num_first') {
                        q.text = `What is ${num} x 1?`;
                    } else {
                        q.text = `What is 1 x ${num}?`;
                    }
                    q.ans = num;
                    q.hint = `Identity property: Any number times 1 equals itself. ${num} x 1 = ${num}`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(num);

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Identity Property</div>
                        <div style="font-size:1.3rem;padding:15px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                            <span style="color:var(--accent-green);font-weight:700;">${num}</span>
                            <span style="margin:0 8px;">x</span>
                            <span style="color:var(--accent-orange);font-weight:700;">1</span>
                            <span style="margin:0 8px;">=</span>
                            <span style="color:var(--accent-cyan);font-weight:700;">?</span>
                        </div>
                        <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">Any number x 1 = that number</div>
                    </div>`;

                } else {
                    // zero property
                    const num = rng(1, 12);
                    const order = pick(['num_first', 'zero_first']);
                    if (order === 'num_first') {
                        q.text = `What is ${num} x 0?`;
                    } else {
                        q.text = `What is 0 x ${num}?`;
                    }
                    q.ans = 0;
                    q.hint = `Zero property: Any number times 0 equals 0. ${num} x 0 = 0`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(0);

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Zero Property</div>
                        <div style="font-size:1.3rem;padding:15px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                            <span style="color:var(--accent-green);font-weight:700;">${num}</span>
                            <span style="margin:0 8px;">x</span>
                            <span style="color:var(--accent-orange);font-weight:700;">0</span>
                            <span style="margin:0 8px;">=</span>
                            <span style="color:var(--accent-cyan);font-weight:700;">?</span>
                        </div>
                        <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">Any number x 0 = 0</div>
                    </div>`;
                }

                q.printFormat = 'mult-properties';
                q.skillLabel = 'Mult Properties';
                return;
            }

            // ========================================
            // MULTIPLICATION CHART (12x12 grid with blanks)
            // ========================================
            if (mappedSkill === "mult_chart") {
                const maxN = 12;
                // Pick 1-3 blank cells for the student to fill
                const numBlanks = rng(1, 3);
                const blanks = [];
                const usedKeys = new Set();
                while (blanks.length < numBlanks) {
                    const r = rng(1, maxN);
                    const c = rng(1, maxN);
                    const key = `${r},${c}`;
                    if (!usedKeys.has(key)) {
                        usedKeys.add(key);
                        blanks.push({ row: r, col: c, ans: r * c });
                    }
                }

                // Color function: maps product (1-144) to a gradient color
                const getColor = (product) => {
                    const t = (product - 1) / 143; // 0..1
                    // Rainbow: blue→cyan→green→yellow→orange→red→pink
                    const stops = [
                        [0.00, 66,133,244],  // blue
                        [0.15, 38,198,218],  // cyan
                        [0.30, 76,175,80],   // green
                        [0.50, 255,235,59],  // yellow
                        [0.70, 255,152,0],   // orange
                        [0.85, 244,67,54],   // red
                        [1.00, 233,30,99]    // pink
                    ];
                    let lo = stops[0], hi = stops[stops.length - 1];
                    for (let i = 0; i < stops.length - 1; i++) {
                        if (t >= stops[i][0] && t <= stops[i + 1][0]) {
                            lo = stops[i]; hi = stops[i + 1]; break;
                        }
                    }
                    const f = (t - lo[0]) / (hi[0] - lo[0] || 1);
                    const r2 = Math.round(lo[1] + f * (hi[1] - lo[1]));
                    const g2 = Math.round(lo[2] + f * (hi[2] - lo[2]));
                    const b2 = Math.round(lo[3] + f * (hi[3] - lo[3]));
                    return `rgb(${r2},${g2},${b2})`;
                };

                // Build HTML table
                const cellSize = 'min(2.2rem, 5.5vw)';
                const fontSize = 'min(0.7rem, 2.2vw)';
                let table = `<table style="border-collapse:collapse;margin:0 auto;font-family:monospace;text-align:center;">`;
                // Header row: × | 1 | 2 | ... | 12
                table += `<tr><td style="width:${cellSize};height:${cellSize};font-size:${fontSize};font-weight:700;background:var(--bg-card);color:var(--text-bright);border:1px solid var(--bg-card-light);">×</td>`;
                for (let c = 1; c <= maxN; c++) {
                    table += `<td style="width:${cellSize};height:${cellSize};font-size:${fontSize};font-weight:700;background:var(--bg-card);color:var(--text-bright);border:1px solid var(--bg-card-light);">${c}</td>`;
                }
                table += `</tr>`;

                // Data rows
                for (let r = 1; r <= maxN; r++) {
                    table += `<tr><td style="width:${cellSize};height:${cellSize};font-size:${fontSize};font-weight:700;background:var(--bg-card);color:var(--text-bright);border:1px solid var(--bg-card-light);">${r}</td>`;
                    for (let c = 1; c <= maxN; c++) {
                        const product = r * c;
                        const isBlank = blanks.some(b => b.row === r && b.col === c);
                        const bg = getColor(product);
                        // Determine text color based on brightness
                        const t = (product - 1) / 143;
                        const txtColor = (t > 0.35 && t < 0.6) ? '#333' : '#fff';

                        if (isBlank) {
                            const idx = blanks.findIndex(b => b.row === r && b.col === c);
                            table += `<td style="width:${cellSize};height:${cellSize};font-size:${fontSize};font-weight:700;background:var(--bg-world);border:2px solid var(--accent-orange);color:var(--accent-orange);cursor:default;" title="Find: ${r} × ${c}">❓</td>`;
                        } else {
                            table += `<td style="width:${cellSize};height:${cellSize};font-size:${fontSize};font-weight:600;background:${bg};color:${txtColor};border:1px solid rgba(255,255,255,0.15);">${product}</td>`;
                        }
                    }
                    table += `</tr>`;
                }
                table += `</table>`;

                // Set question text and answer
                if (numBlanks === 1) {
                    const b = blanks[0];
                    q.text = `Look at the multiplication chart. What is ${b.row} × ${b.col}?`;
                    q.ans = b.ans;
                    q.answerType = "number";
                    q.hint = `Find row ${b.row} and column ${b.col} on the chart. The answer is ${b.row} × ${b.col} = ${b.ans}`;
                } else {
                    // Multiple blanks: answer is comma-separated in row,col order
                    blanks.sort((a, b) => a.row === b.row ? a.col - b.col : a.row - b.row);
                    const parts = blanks.map(b => `${b.row}×${b.col}`);
                    q.text = `Fill in the missing products: ${parts.join(', ')}`;
                    q.ans = blanks.map(b => b.ans).join(', ');
                    q.answerType = "text";
                    q.hint = blanks.map(b => `${b.row} × ${b.col} = ${b.ans}`).join('; ');
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1rem;">✖️ Multiplication Chart</div>
                    <div style="overflow-x:auto;padding:4px;">${table}</div>
                    <div style="margin-top:6px;font-size:0.8rem;color:var(--text-dim);">Find the ❓ cells</div>
                </div>`;
                q.printFormat = 'mult-chart';
                q.skillLabel = 'Mult Chart';
                return;
            }

            // ========================================
            // DIVISION WITH REMAINDERS
            // ========================================
            if (mappedSkill === "div_remainders") {
                const divisor = rng(2, 9);
                // Ensure there IS a remainder
                let dividend;
                let remainder;
                const divRemMax = Math.max(20, Math.min(range, 999));
                do {
                    dividend = rng(10, divRemMax);
                    remainder = dividend % divisor;
                } while (remainder === 0);
                const quotient = Math.floor(dividend / divisor);

                q.text = `${dividend} / ${divisor} = ? (write answer as quotient R remainder, e.g. "7 R 2")`;
                q.ans = `${quotient} R ${remainder}`;
                q.answerType = "text";
                q.hint = `Divide ${dividend} by ${divisor}. How many full groups of ${divisor}? What's left over? ${divisor} x ${quotient} = ${quotient * divisor}, remainder = ${dividend} - ${quotient * divisor}`;

                // Visual: groups of objects with leftover highlighted
                const groupSize = divisor;
                const numGroups = quotient;
                const leftover = remainder;

                const dotR = 10;
                const dotGap = 26;
                const groupGap = 16;
                const groupPadX = 8;
                const groupPadY = 8;
                const maxGroupsPerRow = 5;
                const groupW = groupPadX * 2 + dotR * 2;
                const groupH = groupPadY * 2 + (groupSize - 1) * dotGap + dotR * 2;

                // Layout groups in rows
                const totalGroupItems = numGroups + (leftover > 0 ? 1 : 0);
                const groupRows = Math.ceil(totalGroupItems / maxGroupsPerRow);
                const groupsInFirstRow = Math.min(totalGroupItems, maxGroupsPerRow);
                const totalW = groupsInFirstRow * (groupW + groupGap) - groupGap + 40;
                const totalH = groupRows * (groupH + 30) + 20;

                let groupsSVG = '';
                for (let g = 0; g < numGroups; g++) {
                    const row = Math.floor(g / maxGroupsPerRow);
                    const col = g % maxGroupsPerRow;
                    const gx = 20 + col * (groupW + groupGap);
                    const gy = 10 + row * (groupH + 30);

                    // Group box
                    groupsSVG += `<rect x="${gx}" y="${gy}" width="${groupW}" height="${groupH}" rx="6" fill="none" stroke="var(--accent-green)" stroke-width="1.5"/>`;
                    // Dots in group
                    for (let d = 0; d < groupSize; d++) {
                        const cx = gx + groupPadX + dotR;
                        const cy = gy + groupPadY + dotR + d * dotGap;
                        groupsSVG += `<circle cx="${cx}" cy="${cy}" r="${dotR}" fill="var(--accent-green)" stroke="var(--text-bright)" stroke-width="1"/>`;
                    }
                    // Group label
                    groupsSVG += `<text x="${gx + groupW / 2}" y="${gy + groupH + 14}" text-anchor="middle" fill="var(--text-dim)" font-size="11">${groupSize}</text>`;
                }

                // Leftover dots highlighted differently
                if (leftover > 0) {
                    const g = numGroups;
                    const row = Math.floor(g / maxGroupsPerRow);
                    const col = g % maxGroupsPerRow;
                    const gx = 20 + col * (groupW + groupGap);
                    const gy = 10 + row * (groupH + 30);
                    const leftH = groupPadY * 2 + (leftover - 1) * dotGap + dotR * 2;

                    groupsSVG += `<rect x="${gx}" y="${gy}" width="${groupW}" height="${leftH}" rx="6" fill="none" stroke="var(--accent-orange)" stroke-width="2" stroke-dasharray="5,3"/>`;
                    for (let d = 0; d < leftover; d++) {
                        const cx = gx + groupPadX + dotR;
                        const cy = gy + groupPadY + dotR + d * dotGap;
                        groupsSVG += `<circle cx="${cx}" cy="${cy}" r="${dotR}" fill="var(--accent-orange)" stroke="var(--text-bright)" stroke-width="1"/>`;
                    }
                    groupsSVG += `<text x="${gx + groupW / 2}" y="${gy + leftH + 14}" text-anchor="middle" fill="var(--accent-orange)" font-size="11" font-weight="700">R ${leftover}</text>`;
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-orange);">Division with Remainders</div>
                    <div style="font-size:1.2rem;margin-bottom:10px;">${dividend} / ${divisor} = ?</div>
                    <svg width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" style="max-width:100%;">
                        ${groupsSVG}
                    </svg>
                    <div style="display:flex;justify-content:center;gap:15px;margin-top:8px;font-size:0.85rem;">
                        <span style="color:var(--accent-green);">Full groups of ${divisor}</span>
                        ${leftover > 0 ? `<span style="color:var(--accent-orange);">Remainder: ${leftover}</span>` : ''}
                    </div>
                </div>`;

                q.printFormat = 'div-remainders';
                q.skillLabel = 'Div Remainders';
                q.options = [];
                return;
            }

            if (mappedSkill === "missing_add_sub") {
                // Missing Numbers - Addition/Subtraction
                const positions = ['first_add', 'second_add', 'sum', 'minuend', 'subtrahend', 'difference'];
                const position = pick(positions);
                const missingMax = Math.max(10, range);
                const missingHalf = Math.max(5, Math.floor(range / 2));
                const useDec = state.decimalPlaces > 0;
                const dp = state.decimalPlaces;

                let a, b, c, text, ans;

                if (position === 'first_add') {
                    b = rng(1, missingHalf);
                    c = rng(b + 1, missingMax);
                    if (useDec) { b = applyDecimals(b); c = applyDecimals(c); if (c <= b) c = parseFloat((b + 1).toFixed(dp)); }
                    a = useDec ? parseFloat((c - b).toFixed(dp)) : c - b;
                    text = `___ + ${b} = ${c}`;
                    ans = a;
                } else if (position === 'second_add') {
                    a = rng(1, missingHalf);
                    c = rng(a + 1, missingMax);
                    if (useDec) { a = applyDecimals(a); c = applyDecimals(c); if (c <= a) c = parseFloat((a + 1).toFixed(dp)); }
                    b = useDec ? parseFloat((c - a).toFixed(dp)) : c - a;
                    text = `${a} + ___ = ${c}`;
                    ans = b;
                } else if (position === 'sum') {
                    a = rng(1, missingHalf);
                    b = rng(1, missingHalf);
                    if (useDec) { a = applyDecimals(a); b = applyDecimals(b); }
                    c = useDec ? parseFloat((a + b).toFixed(dp)) : a + b;
                    text = `${a} + ${b} = ___`;
                    ans = c;
                } else if (position === 'minuend') {
                    b = rng(1, missingHalf);
                    c = rng(1, missingHalf);
                    if (useDec) { b = applyDecimals(b); c = applyDecimals(c); }
                    a = useDec ? parseFloat((b + c).toFixed(dp)) : b + c;
                    text = `___ − ${b} = ${c}`;
                    ans = a;
                } else if (position === 'subtrahend') {
                    a = rng(10, missingMax);
                    c = rng(1, a - 1);
                    if (useDec) { a = applyDecimals(a); c = applyDecimals(c); if (c >= a) c = parseFloat((a - 1).toFixed(dp)); }
                    b = useDec ? parseFloat((a - c).toFixed(dp)) : a - c;
                    text = `${a} − ___ = ${c}`;
                    ans = b;
                } else { // difference
                    a = rng(10, missingMax);
                    b = rng(1, a - 1);
                    if (useDec) { a = applyDecimals(a); b = applyDecimals(b); if (b >= a) b = parseFloat((a - 1).toFixed(dp)); }
                    c = useDec ? parseFloat((a - b).toFixed(dp)) : a - b;
                    text = `${a} − ${b} = ___`;
                    ans = c;
                }

                q.text = text;
                q.ans = ans;
                q.hint = position.includes('add') || position === 'sum' 
                    ? `Think: What number makes this addition true?` 
                    : `Think: What number makes this subtraction true?`;
                q.missingNumberData = { position, a, b, c };
                q.printFormat = "missing-number";
                q.options = buildNumericOptions(ans);
                return;
            }
            
            if (mappedSkill === "missing_mult_div") {
                // Missing Factors - Multiplication/Division
                const positions = ['first_factor', 'second_factor', 'product', 'dividend', 'divisor', 'quotient'];
                const position = pick(positions);
                // Scale factor range: for range<=100 use 2-12 (times tables), for larger ranges scale up
                const mmFactorMax = range <= 100 ? 12 : Math.min(Math.ceil(Math.sqrt(range)), 25);

                let a, b, c, text, ans, displayText;

                if (position === 'first_factor') {
                    b = rng(2, mmFactorMax);
                    c = rng(2, mmFactorMax) * b;
                    a = c / b;
                    text = `___ × ${b} = ${c}`;
                    ans = a;
                } else if (position === 'second_factor') {
                    a = rng(2, mmFactorMax);
                    c = a * rng(2, mmFactorMax);
                    b = c / a;
                    text = `${a} × ___ = ${c}`;
                    ans = b;
                } else if (position === 'product') {
                    a = rng(2, mmFactorMax);
                    b = rng(2, mmFactorMax);
                    c = a * b;
                    text = `${a} × ${b} = ___`;
                    ans = c;
                } else if (position === 'dividend') {
                    b = rng(2, mmFactorMax);
                    c = rng(2, mmFactorMax);
                    a = b * c;
                    text = `___ ÷ ${b} = ${c}`;
                    ans = a;
                } else if (position === 'divisor') {
                    c = rng(2, mmFactorMax);
                    b = rng(2, mmFactorMax);
                    a = b * c;
                    text = `${a} ÷ ___ = ${c}`;
                    ans = b;
                } else { // quotient
                    b = rng(2, mmFactorMax);
                    c = rng(2, mmFactorMax);
                    a = b * c;
                    text = `${a} ÷ ${b} = ___`;
                    ans = c;
                }
                
                // Apply division notation variety for division problems
                if (position.includes('divid') || position === 'quotient') {
                    const notation = pick(['symbol', 'fraction', 'bracket']);
                    if (notation === 'fraction') {
                        const dividend = position === 'dividend' ? '___' : a;
                        const divisor = position === 'divisor' ? '___' : b;
                        const quotient = position === 'quotient' ? '___' : c;
                        displayText = `<div style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:5px;"><span style="border-bottom:2px solid currentColor;padding:2px 8px;">${dividend}</span><span style="padding:2px 8px;">${divisor}</span></div> = ${quotient}`;
                    } else if (notation === 'bracket') {
                        const dividend = position === 'dividend' ? '___' : a;
                        const divisor = position === 'divisor' ? '___' : b;
                        const quotient = position === 'quotient' ? '___' : c;
                        displayText = `<span style="margin-right:2px;">${divisor}</span><span style="border-top:2px solid currentColor;border-left:2px solid currentColor;padding:2px 8px;border-top-left-radius:5px;">${dividend}</span> = ${quotient}`;
                    } else {
                        displayText = text;
                    }
                } else {
                    displayText = text;
                }
                
                q.text = text;
                q.ans = ans;
                q.hint = position.includes('factor') || position === 'product'
                    ? `Think: What number completes this multiplication?`
                    : `Think: What number completes this division?`;
                q.missingNumberData = { position, a, b, c, displayText };
                q.printFormat = "missing-factor";
                
                q.visual = `<div style="text-align:center;font-size:1.5rem;font-weight:600;margin:20px 0;">
                    ${displayText || text}
                </div>`;
                q.options = buildNumericOptions(ans);
                return;
            }
            
            // Area Model Multiplication
            if (mappedSkill === "area_model_mult") {
                // Generate appropriate numbers for area model
                // Type 1: single digit × 2-digit (e.g., 4 × 16)
                // Type 2: single digit × 3-digit (e.g., 3 × 135)
                const problemType = Math.random() < 0.6 ? '2digit' : '3digit';
                
                let multiplier, multiplicand, parts;
                const colors = ['#5fd4c3', '#f8b878', '#f8a0c8']; // teal, orange, pink
                
                if (problemType === '2digit') {
                    multiplier = rng(2, 9);
                    const tens = rng(1, 9) * 10;
                    const ones = rng(1, 9);
                    multiplicand = tens + ones;
                    parts = [
                        { value: tens, width: 60, color: colors[0] },
                        { value: ones, width: 30, color: colors[1] }
                    ];
                } else {
                    multiplier = rng(2, 6);
                    const hundreds = rng(1, 3) * 100;
                    const tens = rng(1, 9) * 10;
                    const ones = rng(1, 9);
                    multiplicand = hundreds + tens + ones;
                    parts = [
                        { value: hundreds, width: 50, color: colors[0] },
                        { value: tens, width: 35, color: colors[1] },
                        { value: ones, width: 25, color: colors[2] }
                    ];
                }
                
                const product = multiplier * multiplicand;
                q.ans = product;
                q.text = `Use the area model to find ${multiplier} × ${multiplicand}`;
                q.hint = `Break ${multiplicand} into parts: ${parts.map(p => p.value).join(' + ')}. Multiply each part by ${multiplier}, then add the results.`;
                q.answerType = "area-model";
                q.areaModelData = { multiplier, multiplicand, parts, product };
                q.printFormat = "area-model-mult";
                
                // Calculate partial products for answers
                const partialProducts = parts.map(p => multiplier * p.value);
                
                // Generate visual with colored rectangles and input boxes
                // Use balanced box sizes based on digit count of partial products
                const baseBoxWidth = 75; // Base width for each section
                const rectHeight = 75;
                const uniqueIdArea = Date.now() + Math.random().toString(36).substr(2, 9);
                
                q.visual = `<div class="area-model-container" style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--text-primary);">Use the model to find <span style="font-size:1.2rem;">${multiplier} × ${multiplicand}</span></div>
                    <div style="font-style:italic;color:var(--text-secondary);margin-bottom:15px;">First, find the area of each rectangle.</div>

                    <!-- Area Model Grid -->
                    <div class="area-model-grid" style="display:inline-block;position:relative;">
                        <!-- Top labels (place values) -->
                        <div style="display:flex;margin-left:35px;margin-bottom:5px;">
                            ${parts.map((p, i) => {
                                const digitCount = partialProducts[i].toString().length;
                                const sectionWidth = baseBoxWidth + (digitCount - 1) * 10;
                                return `<div style="width:${sectionWidth}px;text-align:center;font-weight:700;font-size:1.1rem;">${p.value}</div>`;
                            }).join('')}
                        </div>

                        <!-- Main grid with multiplier on left -->
                        <div style="display:flex;align-items:center;">
                            <div style="font-weight:700;font-size:1.3rem;margin-right:10px;width:25px;text-align:center;">${multiplier}</div>
                            <div style="display:flex;border:2px solid #888;border-radius:4px;overflow:hidden;">
                                ${parts.map((p, i) => {
                                    const digitCount = partialProducts[i].toString().length;
                                    const sectionWidth = baseBoxWidth + (digitCount - 1) * 10;
                                    const inputWidth = 45 + digitCount * 12;
                                    return `
                                    <div style="width:${sectionWidth}px;height:${rectHeight}px;background:${p.color};display:flex;align-items:center;justify-content:center;${i > 0 ? 'border-left:2px solid #888;' : ''}">
                                        <input type="text" class="area-model-input" data-area-idx="${uniqueIdArea}-part-${i}" data-answer="${partialProducts[i]}"
                                            style="width:${inputWidth}px;height:36px;border:2px solid #fff;border-radius:6px;background:rgba(255,255,255,0.9);text-align:center;font-size:1rem;font-weight:600;" placeholder="">
                                    </div>
                                `}).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Total calculation -->
                    <div style="margin-top:20px;font-style:italic;color:var(--text-secondary);">Then, find the total area.</div>
                    <div class="area-model-total-row" style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.2rem;font-weight:600;">
                        <span>${multiplier} × ${multiplicand} = </span>
                        <input type="text" class="area-model-total" data-area-idx="${uniqueIdArea}-total" data-answer="${product}"
                            style="width:${60 + product.toString().length * 12}px;height:40px;border:2px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;font-weight:700;">
                    </div>
                </div>`;
                q.options = [];
                return;
            }
            
            // Area Model Multiplication - Hard (2×2 and 2×3 grids)
            if (mappedSkill === "area_model_mult_hard") {
                // Type: 2-digit × 2-digit (2×2 grid) or 2-digit × 3-digit (2×3 grid)
                const problemType = Math.random() < 0.6 ? '2x2' : '2x3';
                const colors = [
                    ['#f8e473', '#5fd4c3'],  // Row 1: yellow, teal
                    ['#f8b878', '#f8a0c8']   // Row 2: orange, pink
                ];
                
                let num1, num2, rowParts, colParts;
                
                if (problemType === '2x2') {
                    // 2-digit × 2-digit (e.g., 31 × 29)
                    const tens1 = rng(1, 9) * 10;
                    const ones1 = rng(1, 9);
                    const tens2 = rng(1, 9) * 10;
                    const ones2 = rng(1, 9);
                    num1 = tens1 + ones1;
                    num2 = tens2 + ones2;
                    rowParts = [tens1, ones1];  // Left side (rows)
                    colParts = [tens2, ones2];  // Top (columns)
                } else {
                    // 2-digit × 3-digit (e.g., 24 × 135)
                    const tens1 = rng(1, 9) * 10;
                    const ones1 = rng(1, 9);
                    const hundreds2 = rng(1, 3) * 100;
                    const tens2 = rng(1, 9) * 10;
                    const ones2 = rng(1, 9);
                    num1 = tens1 + ones1;
                    num2 = hundreds2 + tens2 + ones2;
                    rowParts = [tens1, ones1];  // Left side (rows)
                    colParts = [hundreds2, tens2, ones2];  // Top (columns)
                }
                
                const product = num1 * num2;
                q.ans = product;
                q.text = `Use the area model to find ${num1} × ${num2}`;
                q.hint = `Break ${num1} into ${rowParts.join(' + ')} and ${num2} into ${colParts.join(' + ')}. Find each rectangle's area, then add them all.`;
                q.answerType = "area-model";
                q.areaModelData = { 
                    num1, num2, rowParts, colParts, product,
                    isGrid: true,
                    gridType: problemType
                };
                q.printFormat = "area-model-mult-hard";
                
                // Calculate all partial products (row × col)
                const partialProducts = [];
                for (let r = 0; r < rowParts.length; r++) {
                    for (let c = 0; c < colParts.length; c++) {
                        partialProducts.push({
                            row: r,
                            col: c,
                            value: rowParts[r] * colParts[c]
                        });
                    }
                }
                
                const uniqueIdArea = Date.now() + Math.random().toString(36).substr(2, 9);
                const baseBoxWidth = 85;
                const baseBoxHeight = 75;
                
                // Generate the 2D grid visual
                q.visual = `<div class="area-model-container" style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--text-primary);">Use the model to find <span style="font-size:1.2rem;">${num1} × ${num2}</span></div>
                    <div style="font-style:italic;color:var(--text-secondary);margin-bottom:15px;">First, find the area of each rectangle.</div>

                    <!-- Area Model 2D Grid -->
                    <div class="area-model-grid" style="display:inline-block;position:relative;">
                        <!-- Top labels (column values) -->
                        <div style="display:flex;margin-left:45px;margin-bottom:5px;">
                            ${colParts.map((col, c) => {
                                const digitCount = Math.max(...rowParts.map(r => (r * col).toString().length));
                                const cellWidth = baseBoxWidth + (digitCount - 2) * 8;
                                return `<div style="width:${cellWidth}px;text-align:center;font-weight:700;font-size:1.1rem;">${col}</div>`;
                            }).join('')}
                        </div>

                        <!-- Grid rows -->
                        ${rowParts.map((row, r) => {
                            return `
                            <div style="display:flex;align-items:center;${r > 0 ? '' : ''}">
                                <!-- Row label -->
                                <div style="font-weight:700;font-size:1.2rem;margin-right:10px;width:35px;text-align:center;">${row}</div>
                                <!-- Row cells -->
                                <div style="display:flex;border:2px solid #555;${r === 0 ? 'border-radius:4px 4px 0 0;' : 'border-top:none;border-radius:0 0 4px 4px;'}overflow:hidden;">
                                    ${colParts.map((col, c) => {
                                        const partialVal = row * col;
                                        const digitCount = partialVal.toString().length;
                                        const cellWidth = baseBoxWidth + (digitCount - 2) * 8;
                                        const inputWidth = 50 + digitCount * 10;
                                        const colorRow = r % 2;
                                        const colorCol = c % 2;
                                        const bgColor = colors[colorRow][colorCol] || colors[0][0];
                                        return `
                                        <div style="width:${cellWidth}px;height:${baseBoxHeight}px;background:${bgColor};display:flex;align-items:center;justify-content:center;${c > 0 ? 'border-left:2px solid #555;' : ''}">
                                            <input type="text" class="area-model-input" data-area-idx="${uniqueIdArea}-cell-${r}-${c}" data-answer="${partialVal}"
                                                style="width:${inputWidth}px;height:36px;border:2px solid #fff;border-radius:6px;background:rgba(255,255,255,0.9);text-align:center;font-size:1rem;font-weight:600;" placeholder="">
                                        </div>
                                    `}).join('')}
                                </div>
                            </div>`;
                        }).join('')}
                    </div>

                    <!-- Total calculation -->
                    <div style="margin-top:20px;font-style:italic;color:var(--text-secondary);">Then, find the total area.</div>
                    <div class="area-model-total-row" style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.2rem;font-weight:600;">
                        <span>${num1} × ${num2} = </span>
                        <input type="text" class="area-model-total" data-area-idx="${uniqueIdArea}-total" data-answer="${product}"
                            style="width:${60 + product.toString().length * 12}px;height:40px;border:2px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;font-weight:700;">
                    </div>
                </div>`;
                q.options = [];
                return;
            }
            
            // Area Model Division - 2-digit by 1-digit (e.g., 55 ÷ 5)
            if (mappedSkill === "area_model_div_2by1") {
                // Pre-defined friendly division problems for 2-digit ÷ 1-digit
                // Format: [dividend, divisor] where dividend splits into nice parts
                const friendlyProblems = [
                    // Divisor 2: splits into even tens + even ones
                    [24, 2], [36, 2], [48, 2], [52, 2], [64, 2], [76, 2], [84, 2], [96, 2],
                    // Divisor 3: splits into multiples of 3
                    [36, 3], [39, 3], [45, 3], [48, 3], [54, 3], [57, 3], [63, 3], [69, 3], [72, 3], [75, 3], [78, 3], [81, 3], [84, 3], [93, 3], [96, 3],
                    // Divisor 4: splits into multiples of 4  
                    [48, 4], [52, 4], [56, 4], [64, 4], [68, 4], [72, 4], [76, 4], [84, 4], [88, 4], [92, 4], [96, 4],
                    // Divisor 5: splits into multiples of 5
                    [55, 5], [65, 5], [75, 5], [85, 5], [95, 5], [60, 5], [70, 5], [80, 5], [90, 5],
                    // Divisor 6: splits into multiples of 6
                    [42, 6], [48, 6], [54, 6], [66, 6], [72, 6], [78, 6], [84, 6], [96, 6],
                    // Divisor 7: splits into multiples of 7
                    [42, 7], [49, 7], [56, 7], [63, 7], [77, 7], [84, 7], [91, 7], [98, 7],
                    // Divisor 8: splits into multiples of 8
                    [48, 8], [56, 8], [64, 8], [72, 8], [80, 8], [88, 8], [96, 8],
                    // Divisor 9: splits into multiples of 9
                    [45, 9], [54, 9], [63, 9], [72, 9], [81, 9], [90, 9], [99, 9]
                ];
                
                const [dividend, divisor] = pick(friendlyProblems);
                const quotient = dividend / divisor;
                
                // Split into friendly parts (largest multiple of divisor*10 that fits, plus remainder)
                // For example: 55 ÷ 5 → 50 + 5
                const tensBase = Math.floor(dividend / 10) * 10;
                let part1 = Math.floor(tensBase / divisor) * divisor;
                // Make sure part1 is a "round" number when possible
                if (part1 === 0) part1 = divisor * Math.floor(dividend / divisor / 2);
                const part2 = dividend - part1;
                
                const parts = [
                    { value: part1, quotient: part1 / divisor },
                    { value: part2, quotient: part2 / divisor }
                ];
                
                const colors = ['#f8b878', '#f8a0c8']; // orange, pink
                const uniqueIdDiv = Date.now() + Math.random().toString(36).substr(2, 9);
                
                q.ans = quotient;
                q.text = `Use the area model to find ${dividend} ÷ ${divisor}`;
                q.hint = `Break ${dividend} into parts: ${parts[0].value} + ${parts[1].value}. Find what times ${divisor} equals each part, then add.`;
                q.answerType = "area-model-div";
                q.areaModelDivData = { divisor, dividend, quotient, parts };
                q.printFormat = "area-model-div";
                
                // Visual with area model for division
                q.visual = `<div class="area-model-container" style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--text-primary);">Use the model to find <span style="font-size:1.2rem;">${dividend} ÷ ${divisor}</span></div>
                    <div style="font-style:italic;color:var(--text-secondary);margin-bottom:15px;">First, find the missing side lengths.</div>

                    <!-- Area Model Grid -->
                    <div class="area-model-grid" style="display:inline-block;position:relative;">
                        <!-- Top labels (unknown - to be filled in) -->
                        <div style="display:flex;margin-left:40px;margin-bottom:5px;">
                            ${parts.map((p, i) => `
                                <div style="width:${80 + (i === 0 ? 20 : 0)}px;text-align:center;">
                                    <input type="text" class="area-model-input" data-area-idx="${uniqueIdDiv}-top-${i}" data-answer="${p.quotient}"
                                        style="width:50px;height:28px;border:2px solid #888;border-radius:4px;background:white;text-align:center;font-size:0.95rem;font-weight:600;">
                                </div>
                            `).join('')}
                        </div>

                        <!-- Main grid with divisor on left -->
                        <div style="display:flex;align-items:center;">
                            <div style="font-weight:700;font-size:1.3rem;margin-right:10px;width:30px;text-align:center;">${divisor}</div>
                            <div style="display:flex;border:2px solid #888;border-radius:4px;overflow:hidden;">
                                ${parts.map((p, i) => `
                                    <div style="width:${80 + (i === 0 ? 20 : 0)}px;height:70px;background:${colors[i]};display:flex;align-items:center;justify-content:center;${i > 0 ? 'border-left:2px solid #888;' : ''}">
                                        <span style="font-weight:700;font-size:1.2rem;">${p.value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Quotient calculation -->
                    <div style="margin-top:20px;font-style:italic;color:var(--text-secondary);">Then, find the quotient.</div>
                    <div class="area-model-total-row" style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.2rem;font-weight:600;">
                        <span>${dividend} ÷ ${divisor} = </span>
                        <input type="text" class="area-model-total" data-area-idx="${uniqueIdDiv}-total" data-answer="${quotient}"
                            style="width:60px;height:40px;border:2px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;font-weight:700;">
                    </div>
                </div>`;
                q.options = [];
                return;
            }
            
            // Area Model Division - 3-digit by 1-digit (e.g., 927 ÷ 9)
            if (mappedSkill === "area_model_div_3by1") {
                // Pre-defined friendly division problems for 3-digit ÷ 1-digit
                // Format: [dividend, divisor, part1, part2] - pre-calculated friendly splits
                const friendlyProblems = [
                    // Divisor 2: nice even splits
                    [124, 2, 100, 24], [136, 2, 100, 36], [148, 2, 100, 48], [162, 2, 100, 62], [174, 2, 100, 74], [186, 2, 100, 86],
                    [246, 2, 200, 46], [258, 2, 200, 58], [264, 2, 200, 64], [276, 2, 200, 76],
                    // Divisor 3: multiples of 3
                    [126, 3, 90, 36], [135, 3, 90, 45], [144, 3, 90, 54], [153, 3, 120, 33], [162, 3, 120, 42], [171, 3, 150, 21],
                    [213, 3, 180, 33], [234, 3, 180, 54], [243, 3, 180, 63], [261, 3, 180, 81], [279, 3, 270, 9],
                    // Divisor 4: multiples of 4
                    [124, 4, 80, 44], [136, 4, 80, 56], [148, 4, 120, 28], [156, 4, 120, 36], [168, 4, 120, 48],
                    [212, 4, 160, 52], [236, 4, 200, 36], [248, 4, 200, 48], [264, 4, 200, 64],
                    // Divisor 5: multiples of 5
                    [125, 5, 100, 25], [135, 5, 100, 35], [145, 5, 100, 45], [155, 5, 100, 55], [165, 5, 150, 15],
                    [215, 5, 200, 15], [235, 5, 200, 35], [255, 5, 200, 55], [275, 5, 250, 25], [295, 5, 250, 45],
                    // Divisor 6: multiples of 6
                    [126, 6, 90, 36], [138, 6, 90, 48], [156, 6, 120, 36], [174, 6, 120, 54], [186, 6, 180, 6],
                    [234, 6, 180, 54], [252, 6, 180, 72], [276, 6, 240, 36], [294, 6, 240, 54],
                    // Divisor 7: multiples of 7
                    [126, 7, 70, 56], [147, 7, 70, 77], [168, 7, 140, 28], [189, 7, 140, 49], 
                    [231, 7, 210, 21], [252, 7, 210, 42], [273, 7, 210, 63], [294, 7, 280, 14],
                    // Divisor 8: multiples of 8
                    [128, 8, 80, 48], [152, 8, 80, 72], [168, 8, 160, 8], [184, 8, 160, 24],
                    [232, 8, 160, 72], [248, 8, 240, 8], [264, 8, 240, 24], [296, 8, 240, 56],
                    // Divisor 9: multiples of 9
                    [126, 9, 90, 36], [153, 9, 90, 63], [171, 9, 90, 81], [189, 9, 180, 9],
                    [234, 9, 180, 54], [261, 9, 180, 81], [279, 9, 270, 9], [297, 9, 270, 27]
                ];
                
                const problem = pick(friendlyProblems);
                const dividend = problem[0];
                const divisor = problem[1];
                const part1 = problem[2];
                const part2 = problem[3];
                const quotient = dividend / divisor;
                
                const parts = [
                    { value: part1, quotient: part1 / divisor },
                    { value: part2, quotient: part2 / divisor }
                ];
                
                const colors = ['#f8b878', '#f8a0c8']; // orange, pink
                const uniqueIdDiv3 = Date.now() + Math.random().toString(36).substr(2, 9);
                
                q.ans = quotient;
                q.text = `Use the area model to find ${dividend} ÷ ${divisor}`;
                q.hint = `Break ${dividend} into parts: ${parts[0].value} + ${parts[1].value}. Find what times ${divisor} equals each part, then add.`;
                q.answerType = "area-model-div";
                q.areaModelDivData = { divisor, dividend, quotient, parts };
                q.printFormat = "area-model-div";
                
                // Visual with area model for division
                q.visual = `<div class="area-model-container" style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--text-primary);">Use the model to find <span style="font-size:1.2rem;">${dividend} ÷ ${divisor}</span></div>
                    <div style="font-style:italic;color:var(--text-secondary);margin-bottom:15px;">First, find the missing side lengths.</div>

                    <!-- Area Model Grid -->
                    <div class="area-model-grid" style="display:inline-block;position:relative;">
                        <!-- Top labels (unknown - to be filled in) -->
                        <div style="display:flex;margin-left:40px;margin-bottom:5px;">
                            ${parts.map((p, i) => `
                                <div style="width:${90 + (i === 0 ? 30 : 0)}px;text-align:center;">
                                    <input type="text" class="area-model-input" data-area-idx="${uniqueIdDiv3}-top-${i}" data-answer="${p.quotient}"
                                        style="width:55px;height:28px;border:2px solid #888;border-radius:4px;background:white;text-align:center;font-size:0.95rem;font-weight:600;">
                                </div>
                            `).join('')}
                        </div>

                        <!-- Main grid with divisor on left -->
                        <div style="display:flex;align-items:center;">
                            <div style="font-weight:700;font-size:1.3rem;margin-right:10px;width:30px;text-align:center;">${divisor}</div>
                            <div style="display:flex;border:2px solid #888;border-radius:4px;overflow:hidden;">
                                ${parts.map((p, i) => `
                                    <div style="width:${90 + (i === 0 ? 30 : 0)}px;height:75px;background:${colors[i]};display:flex;align-items:center;justify-content:center;${i > 0 ? 'border-left:2px solid #888;' : ''}">
                                        <span style="font-weight:700;font-size:1.2rem;">${p.value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Quotient calculation -->
                    <div style="margin-top:20px;font-style:italic;color:var(--text-secondary);">Then, find the quotient.</div>
                    <div class="area-model-total-row" style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.2rem;font-weight:600;">
                        <span>${dividend} ÷ ${divisor} = </span>
                        <input type="text" class="area-model-total" data-area-idx="${uniqueIdDiv3}-total" data-answer="${quotient}"
                            style="width:70px;height:40px;border:2px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;font-weight:700;">
                    </div>
                </div>`;
                q.options = [];
                return;
            }
            
            // ===== WORD PROBLEMS WITH VISUALS =====
            
            // Addition Word Problems
            if (mappedSkill === "add_word_problems") {
                const scenarios = [
                    { item: '🍎', name: 'apples', color: 'pink', context: 'fruit basket' },
                    { item: '⭐', name: 'stars', color: 'yellow', context: 'sticker chart' },
                    { item: '📚', name: 'books', color: 'blue', context: 'library' },
                    { item: '🍪', name: 'cookies', color: 'orange', context: 'cookie jar' },
                    { item: '🎈', name: 'balloons', color: 'purple', context: 'party' },
                    { item: '🌸', name: 'flowers', color: 'pink', context: 'garden' },
                    { item: '🏀', name: 'balls', color: 'orange', context: 'gym' },
                    { item: '✏️', name: 'pencils', color: 'yellow', context: 'desk' },
                ];
                
                const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Mia', 'Lucas'];
                const scenario = pick(scenarios);
                const name1 = pick(names);
                let name2 = pick(names);
                while (name2 === name1) name2 = pick(names);
                
                // Scale with range setting
                const maxNum = Math.max(10, range);
                let a = rng(2, maxNum);
                let b = rng(2, maxNum);
                if (state.decimalPlaces > 0) { a = applyDecimals(a); b = applyDecimals(b); }
                const answer = state.decimalPlaces > 0 ? parseFloat((a + b).toFixed(state.decimalPlaces)) : a + b;

                const templates = [
                    `${name1} has ${a} ${scenario.name}. ${name2} gives ${name1} ${b} more ${scenario.name}. How many ${scenario.name} does ${name1} have now?`,
                    `There are ${a} ${scenario.name} in the ${scenario.context}. ${name1} adds ${b} more. How many ${scenario.name} are there in all?`,
                    `${name1} picks ${a} ${scenario.name}. Then ${name1} picks ${b} more. How many ${scenario.name} did ${name1} pick altogether?`,
                ];

                q.text = pick(templates);
                q.ans = answer;
                q.hint = `Add the two amounts: ${a} + ${b} = ?`;

                // Create visual with pastel groups
                const group1Items = Array(Math.min(Math.floor(a), 15)).fill(scenario.item).join('');
                const group2Items = Array(Math.min(Math.floor(b), 15)).fill(scenario.item).join('');
                
                q.visual = `<div class="word-problem-visual">
                    <div class="word-problem-scene">
                        <div class="visual-group group-${scenario.color}">
                            <div style="font-size:1.3rem;">${group1Items}</div>
                            <div class="visual-label">${a} ${scenario.name}</div>
                        </div>
                        <div style="font-size:2rem;color:#7209b7;font-weight:700;">+</div>
                        <div class="visual-group group-${scenario.color}">
                            <div style="font-size:1.3rem;">${group2Items}</div>
                            <div class="visual-label">${b} ${scenario.name}</div>
                        </div>
                    </div>
                    <div class="visual-equation">
                        <span>${a}</span>
                        <span class="op">+</span>
                        <span>${b}</span>
                        <span class="equals">=</span>
                        <span class="answer-box"></span>
                    </div>
                </div>`;
                
                q.options = buildNumericOptions(answer);
                return;
            }
            
            // Subtraction Word Problems
            if (mappedSkill === "sub_word_problems") {
                const scenarios = [
                    { item: '🍎', name: 'apples', color: 'pink', verb: 'ate' },
                    { item: '🍪', name: 'cookies', color: 'orange', verb: 'ate' },
                    { item: '🎈', name: 'balloons', color: 'purple', verb: 'popped' },
                    { item: '📚', name: 'books', color: 'blue', verb: 'returned' },
                    { item: '⭐', name: 'stickers', color: 'yellow', verb: 'gave away' },
                    { item: '🌸', name: 'flowers', color: 'pink', verb: 'picked' },
                    { item: '🏀', name: 'balls', color: 'orange', verb: 'lost' },
                ];
                
                const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason'];
                const scenario = pick(scenarios);
                const name1 = pick(names);
                
                // Scale with range setting
                const maxNum = Math.max(10, range);
                let total = rng(10, maxNum);
                let taken = rng(2, total - 1);
                if (state.decimalPlaces > 0) { total = applyDecimals(total); taken = applyDecimals(Math.floor(taken)); if (taken >= total) taken = parseFloat((total - 0.1).toFixed(state.decimalPlaces)); }
                const answer = state.decimalPlaces > 0 ? parseFloat((total - taken).toFixed(state.decimalPlaces)) : total - taken;

                const templates = [
                    `${name1} has ${total} ${scenario.name}. ${name1} ${scenario.verb} ${taken} of them. How many ${scenario.name} does ${name1} have left?`,
                    `There were ${total} ${scenario.name}. ${taken} were ${scenario.verb}. How many are left?`,
                    `${name1} started with ${total} ${scenario.name} and ${scenario.verb} ${taken}. How many ${scenario.name} remain?`,
                ];

                q.text = pick(templates);
                q.ans = answer;
                q.hint = `Subtract: ${total} - ${taken} = ?`;

                // Visual showing crossing out items
                const totalItems = Array(Math.min(Math.floor(total), 20)).fill(scenario.item);
                const remainingHTML = totalItems.map((item, i) => 
                    i < taken 
                        ? `<span style="opacity:0.3;text-decoration:line-through;">${item}</span>`
                        : `<span>${item}</span>`
                ).join('');
                
                q.visual = `<div class="word-problem-visual">
                    <div style="text-align:center;margin-bottom:10px;">
                        <div style="font-size:0.9rem;color:#666;margin-bottom:8px;">Started with ${total}, ${scenario.verb} ${taken}:</div>
                        <div class="visual-group group-${scenario.color}" style="max-width:300px;">
                            <div style="font-size:1.3rem;display:flex;flex-wrap:wrap;gap:3px;justify-content:center;">${remainingHTML}</div>
                        </div>
                    </div>
                    <div class="visual-equation">
                        <span>${total}</span>
                        <span class="op">−</span>
                        <span>${taken}</span>
                        <span class="equals">=</span>
                        <span class="answer-box"></span>
                    </div>
                </div>`;
                
                q.options = buildNumericOptions(answer);
                return;
            }
            
            // Multiplication Word Problems
            if (mappedSkill === "mult_word_problems") {
                const scenarios = [
                    { item: '🍎', name: 'apples', container: 'basket', containerPlural: 'baskets' },
                    { item: '🍪', name: 'cookies', container: 'box', containerPlural: 'boxes' },
                    { item: '⭐', name: 'stickers', container: 'sheet', containerPlural: 'sheets' },
                    { item: '🌸', name: 'flowers', container: 'vase', containerPlural: 'vases' },
                    { item: '📚', name: 'books', container: 'shelf', containerPlural: 'shelves' },
                    { item: '🎈', name: 'balloons', container: 'bunch', containerPlural: 'bunches' },
                    { item: '🏀', name: 'balls', container: 'bag', containerPlural: 'bags' },
                ];
                
                const scenario = pick(scenarios);
                const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan'];
                const name1 = pick(names);
                
                // Scale with range: small range uses facts, large range scales up
                const wpMultMax = range <= 100 ? 8 : Math.min(Math.ceil(Math.sqrt(range)), 15);
                const groups = rng(2, Math.min(wpMultMax, 10));
                const perGroup = rng(2, wpMultMax);
                const answer = groups * perGroup;
                
                const templates = [
                    `${name1} has ${groups} ${groups === 1 ? scenario.container : scenario.containerPlural}. Each ${scenario.container} has ${perGroup} ${scenario.name}. How many ${scenario.name} does ${name1} have in all?`,
                    `There are ${groups} ${scenario.containerPlural} with ${perGroup} ${scenario.name} in each. How many ${scenario.name} are there altogether?`,
                    `${name1} bought ${groups} ${scenario.containerPlural} of ${scenario.name}. Each ${scenario.container} contains ${perGroup} ${scenario.name}. What is the total number of ${scenario.name}?`,
                ];
                
                q.text = pick(templates);
                q.ans = answer;
                q.hint = `Multiply: ${groups} groups × ${perGroup} in each = ?`;
                
                // Create array visual
                const arrayRows = [];
                for (let r = 0; r < Math.min(groups, 6); r++) {
                    const rowItems = Array(Math.min(perGroup, 8)).fill(scenario.item).join(' ');
                    arrayRows.push(`<div class="array-row">${rowItems.split(' ').map(i => `<span style="font-size:1.4rem;">${i}</span>`).join('')}</div>`);
                }
                
                q.visual = `<div class="word-problem-visual">
                    <div class="array-visual">
                        <div class="array-label">${groups} rows × ${perGroup} in each row</div>
                        ${arrayRows.join('')}
                    </div>
                    <div class="visual-equation">
                        <span>${groups}</span>
                        <span class="op">×</span>
                        <span>${perGroup}</span>
                        <span class="equals">=</span>
                        <span class="answer-box"></span>
                    </div>
                </div>`;
                
                q.options = buildNumericOptions(answer);
                return;
            }
            
            // Division Word Problems
            if (mappedSkill === "div_word_problems") {
                const scenarios = [
                    { item: '🍎', name: 'apples', action: 'share equally among' },
                    { item: '🍪', name: 'cookies', action: 'divide equally among' },
                    { item: '⭐', name: 'stickers', action: 'give equally to' },
                    { item: '🌸', name: 'flowers', action: 'put equally in' },
                    { item: '📚', name: 'books', action: 'place equally on' },
                    { item: '🎈', name: 'balloons', action: 'give equally to' },
                ];
                
                const scenario = pick(scenarios);
                const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan'];
                const name1 = pick(names);
                
                // Ensure clean division - scale with range
                const wpDivMax = range <= 100 ? 8 : Math.min(Math.ceil(Math.sqrt(range)), 15);
                const groups = rng(2, Math.min(wpDivMax, 10));
                const perGroup = rng(2, wpDivMax);
                const total = groups * perGroup;
                const answer = perGroup;
                
                const recipients = ['friends', 'boxes', 'bags', 'plates', 'shelves', 'children'];
                const recipient = pick(recipients);
                
                const templates = [
                    `${name1} has ${total} ${scenario.name} to ${scenario.action} ${groups} ${recipient}. How many ${scenario.name} will each ${recipient.slice(0, -1)} get?`,
                    `There are ${total} ${scenario.name}. They need to be shared equally among ${groups} ${recipient}. How many does each get?`,
                    `${name1} wants to divide ${total} ${scenario.name} into ${groups} equal groups. How many ${scenario.name} will be in each group?`,
                ];
                
                q.text = pick(templates);
                q.ans = answer;
                q.hint = `Divide: ${total} ÷ ${groups} = ?`;
                
                // Create equal groups visual
                const groupVisuals = [];
                for (let g = 0; g < Math.min(groups, 5); g++) {
                    const groupItems = Array(Math.min(perGroup, 6)).fill(scenario.item).map(i => 
                        `<span class="equal-group-item">${i}</span>`
                    ).join('');
                    groupVisuals.push(`<div class="equal-group">${groupItems}</div>`);
                }
                
                q.visual = `<div class="word-problem-visual">
                    <div style="text-align:center;margin-bottom:10px;">
                        <div style="font-size:0.9rem;color:#666;margin-bottom:8px;">${total} ${scenario.name} shared equally into ${groups} groups:</div>
                    </div>
                    <div class="equal-groups-visual">
                        ${groupVisuals.join('')}
                    </div>
                    <div class="visual-equation">
                        <span>${total}</span>
                        <span class="op">÷</span>
                        <span>${groups}</span>
                        <span class="equals">=</span>
                        <span class="answer-box"></span>
                    </div>
                </div>`;
                
                q.options = buildNumericOptions(answer);
                return;
            }
            
            // Regular operations (original logic)
            let ops = [];
            let factsMode = false; // For limiting to fact ranges
            let factsRange = 20; // Default for addition/subtraction facts
            let addSub10s = false; // For add/subtract by 10s skill
            let addSub100s = false; // For add/subtract by 100s skill
            
            if (mappedSkill === "mixed" || mappedSkill === "operations_all" || state.skill === "operations_all") ops = ["+", "-", "×", "÷"];
            else if (mappedSkill === "mixed_add_sub") ops = ["+", "-"];
            else if (mappedSkill === "mixed_mult_div") ops = ["×", "÷"];
            // Facts skills - restricted ranges for quick recall
            else if (mappedSkill === "add_facts") { ops = ["+"]; factsMode = true; factsRange = 20; }
            else if (mappedSkill === "add_sub_10s") { ops = ["+", "-"]; addSub10s = true; }
            else if (mappedSkill === "add_sub_100s") { ops = ["+", "-"]; addSub100s = true; }
            else if (mappedSkill === "sub_facts") { ops = ["-"]; factsMode = true; factsRange = 20; }
            else if (mappedSkill === "mult_facts") { ops = ["×"]; factsMode = true; factsRange = 12; }
            else if (mappedSkill === "div_facts") { ops = ["÷"]; factsMode = true; factsRange = 12; }
            else if (mappedSkill === "add" || mappedSkill === "addition") ops = ["+"];
            else if (mappedSkill === "subtract" || mappedSkill === "subtraction") ops = ["-"];
            else if (mappedSkill === "multiply" || mappedSkill === "multiplication") ops = ["×"];
            else if (mappedSkill === "divide" || mappedSkill === "division") ops = ["÷"];
            // Handle category-based mixed modes
            else if (state.category === "number_ops_mixed") ops = ["+", "-", "×", "÷"];
            else if (state.category === "addition") ops = ["+"];
            else if (state.category === "subtraction") ops = ["-"];
            else if (state.category === "multiplication") ops = ["×"];
            else if (state.category === "division") ops = ["÷"];
            else ops = ["+"]; // Default to addition if skill not recognized
            const op = pick(ops);
            
            // Handle Add/Subtract by 10s skill
            if (addSub10s) {
                const isAdd = Math.random() < 0.5;
                if (isAdd) {
                    const base = rng(0, 9) * 10; // 0, 10, 20, ..., 90
                    q.text = `${base} + 10 = ?`;
                    q.ans = base + 10;
                    q.hint = `When adding 10, the tens digit goes up by 1. ${base} + 10 = ${base + 10}`;
                    q.options = buildNumericOptions(q.ans, 10);
                    q.skillLabel = '+/− 10s';
                } else {
                    const base = rng(1, 10) * 10; // 10, 20, ..., 100
                    q.text = `${base} − 10 = ?`;
                    q.ans = base - 10;
                    q.hint = `When subtracting 10, the tens digit goes down by 1. ${base} − 10 = ${base - 10}`;
                    q.options = buildNumericOptions(q.ans, 10);
                    q.skillLabel = '+/− 10s';
                }
                return;
            }
            
            // Handle Add/Subtract by 100s skill
            if (addSub100s) {
                const isAdd = Math.random() < 0.5;
                if (isAdd) {
                    const base = rng(0, 9) * 100; // 0, 100, 200, ..., 900
                    q.text = `${base} + 100 = ?`;
                    q.ans = base + 100;
                    q.hint = `When adding 100, the hundreds digit goes up by 1. ${base} + 100 = ${base + 100}`;
                    q.options = buildNumericOptions(q.ans, 100);
                    q.skillLabel = '+/− 100s';
                } else {
                    const base = rng(1, 10) * 100; // 100, 200, ..., 1000
                    q.text = `${base} − 100 = ?`;
                    q.ans = base - 100;
                    q.hint = `When subtracting 100, the hundreds digit goes down by 1. ${base} − 100 = ${base - 100}`;
                    q.options = buildNumericOptions(q.ans, 100);
                    q.skillLabel = '+/− 100s';
                }
                return;
            }
            
            // For facts mode, use restricted ranges
            let a, b;
            if (factsMode) {
                if (op === "+" || op === "-") {
                    // Addition/subtraction facts within 20
                    a = rng(1, factsRange);
                    b = rng(1, factsRange - a); // Ensure sum ≤ 20
                    if (b < 1) b = 1;
                } else {
                    // Multiplication/division facts (1-12 tables)
                    a = rng(1, factsRange);
                    b = rng(1, factsRange);
                }
            } else {
                a = rng(1, range);
                b = rng(1, range);
            }

            if (op === "×") {
                // Determine if this is a basic fact (12×12 or less) or needs column multiplication
                // For ranges 10, 20, 50, 100: use basic 12×12 tables
                const useFullTables = [10, 20, 50, 100].includes(range);
                
                if (useFullTables) {
                    // Basic multiplication facts (1-12 × 1-12) - can be horizontal or simple vertical
                    a = pick(ensureTables());
                    b = rng(1, 12);
                    q.ans = a * b;
                    q.hint = `Think: ${b} groups of ${a}. Count by ${a}s: ${Array.from({length: Math.min(b, 5)}, (_, i) => a * (i + 1)).join(", ")}${b > 5 ? ", ..." : ""}`;
                    
                    // Add visual hint with array for smaller numbers
                    if (a <= 10 && b <= 10) {
                        q.hintVisual = createDotArray(b, a, `${b} rows × ${a} = ${a * b}`);
                    } else {
                        q.hintVisual = `<div style="font-weight:600;text-align:center;">${b} groups of ${a}:<br>${Array.from({length: Math.min(b, 4)}, () => a).join(" + ")}${b > 4 ? " + ..." : ""} = <span style="color:var(--accent-green);">${a * b}</span></div>`;
                    }
                    // Basic facts can use horizontal format (multiple choice)
                } else {
                    // ALWAYS use column multiplication for problems beyond 12×12
                    // Scale problem difficulty with range
                    const colMultMax2d = Math.max(13, Math.min(range, 99));
                    const colMultMax2x2a = Math.max(11, Math.min(Math.floor(range / 2), 99));
                    const colMultMax2x2b = Math.max(11, Math.min(Math.floor(range / 3), 99));
                    const problemType = Math.random() < 0.7 ? '2x1' : '2x2';

                    if (problemType === '2x1') {
                        a = rng(13, colMultMax2d);
                        b = rng(2, 9);
                    } else {
                        a = rng(11, colMultMax2x2a);
                        b = rng(11, colMultMax2x2b);
                    }
                    
                    q.ans = a * b;
                    const uniqueIdMult = Date.now() + Math.random().toString(36).substr(2, 9);
                    
                    // Parse digits for display
                    const ones_b = b % 10;
                    const tens_b = Math.floor(b / 10);
                    const isTwoDigitMultiplier = b >= 10;
                    
                    // Calculate partial products with EXACT digit counts
                    const partial1 = a * ones_b;
                    const partial2 = isTwoDigitMultiplier ? a * tens_b * 10 : 0; // Include the 0
                    const answerLen = q.ans.toString().length;
                    const partial1Len = partial1.toString().length;
                    const partial2Len = isTwoDigitMultiplier ? partial2.toString().length : 0;
                    
                    // Display width based on largest number we need to show
                    const displayWidth = Math.max(a.toString().length, b.toString().length, answerLen);
                    const paddedMultA = a.toString().padStart(displayWidth, ' ').split('');
                    const paddedMultB = b.toString().padStart(displayWidth, ' ').split('');
                    
                    // Carry boxes = one fewer than the number of digits in what we're multiplying
                    const carryBoxCount = a.toString().length;
                    
                    q.hint = isTwoDigitMultiplier 
                        ? `Multiply ${a} × ${ones_b} first, then ${a} × ${tens_b}0, then add the partial products.`
                        : `Multiply each digit: ${a} × ${b}. Carry when needed.`;
                    
                    q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1rem;">
                        <div style="font-weight:700;margin-bottom:10px;">Column Multiplication</div>
                        <div style="display:inline-block;text-align:right;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid var(--accent-purple);">
                            <!-- Carry boxes for first multiplication -->
                            <div style="display:flex;justify-content:flex-end;gap:2px;margin-bottom:4px;padding-right:2px;">
                                ${Array(carryBoxCount).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-carry-input" data-col="${uniqueIdMult}-carry1-${i}" style="width:22px;height:16px;border:1px dashed var(--accent-purple);border-radius:3px;background:var(--bg-card-light);text-align:center;font-size:0.65rem;color:var(--accent-purple);font-family:inherit;padding:0;" placeholder="">`).join('')}
                            </div>
                            <!-- First number -->
                            <div style="padding-bottom:5px;">
                                <span style="margin-right:10px;">&nbsp;</span>${paddedMultA.map(d => `<span style="display:inline-block;width:22px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <!-- Second number with × -->
                            <div style="border-bottom:3px solid #444;padding:5px 0;">
                                <span style="margin-right:10px;">×</span>${paddedMultB.map(d => `<span style="display:inline-block;width:22px;text-align:center;">${d}</span>`).join('')}
                            </div>

                            <!-- Partial Product 1: multiply by ones digit -->
                            <div style="padding-top:6px;font-size:0.7rem;color:var(--accent-orange);text-align:left;">
                                <span style="margin-left:4px;">${a} × ${ones_b} =</span>
                            </div>
                            <div style="padding-top:2px;${isTwoDigitMultiplier ? '' : 'border-bottom:3px solid #444;padding-bottom:6px;'}">
                                <span style="margin-right:10px;">&nbsp;</span>${Array(partial1Len).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-work-input" data-col="${uniqueIdMult}-p1-${i}" style="width:22px;height:22px;border:1px solid var(--accent-orange);border-radius:3px;background:var(--bg-card-light);text-align:center;font-size:0.9rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                            </div>

                            ${isTwoDigitMultiplier ? `
                            <!-- Partial Product 2: multiply by tens digit (with trailing 0) -->
                            <div style="padding-top:6px;font-size:0.7rem;color:var(--accent-cyan);text-align:left;">
                                <span style="margin-left:4px;">${a} × ${tens_b}0 =</span>
                            </div>
                            <div style="border-bottom:3px solid #444;padding-top:2px;padding-bottom:6px;">
                                <span style="margin-right:10px;">+</span>${Array(partial2Len).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-work-input" data-col="${uniqueIdMult}-p2-${i}" style="width:22px;height:22px;border:1px solid var(--accent-cyan);border-radius:3px;background:var(--bg-card-light);text-align:center;font-size:0.9rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                            </div>
                            
                            <!-- Carry boxes for final addition -->
                            <div style="display:flex;justify-content:flex-end;gap:2px;margin-top:4px;margin-bottom:2px;padding-right:2px;">
                                ${Array(answerLen - 1).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-carry-input" data-col="${uniqueIdMult}-carry2-${i}" style="width:22px;height:16px;border:1px dashed var(--accent-green);border-radius:3px;background:var(--bg-card-light);text-align:center;font-size:0.65rem;color:var(--accent-green);font-family:inherit;padding:0;" placeholder="">`).join('')}
                            </div>
                            ` : ''}

                            <!-- Final Answer row -->
                            <div style="padding-top:${isTwoDigitMultiplier ? '2px' : '8px'};font-size:0.7rem;color:var(--accent-green);text-align:left;font-weight:700;">
                                <span style="margin-left:4px;">Final Answer:</span>
                            </div>
                            <div style="padding-top:2px;color:var(--accent-green);font-weight:700;">
                                <span style="margin-right:10px;">=</span>${Array(answerLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueIdMult}-ans-${i}" style="width:22px;height:24px;border:2px solid var(--accent-green);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.8rem;color:var(--text-secondary);">
                            ${isTwoDigitMultiplier ? 'Step 1: Multiply by ones • Step 2: Multiply by tens (add 0) • Step 3: Add' : 'Multiply each digit, carry when needed'}
                        </div>
                    </div>`;
                    
                    q.options = []; // No multiple choice for column multiplication
                }
            } else if (op === "÷") {
                // For ranges 10, 20, 50, 100: ignore range and use full 12×12 tables
                const useFullTables = [10, 20, 50, 100].includes(range);

                // Mix of formats: 50% long division style, 50% horizontal
                const useLongDiv = Math.random() < 0.5;

                if (useLongDiv && useFullTables) {
                    // Simple long division style for 12×12 facts (divisor⟌dividend with answer on top)
                    const divisor = pick(ensureTables());
                    const result = rng(1, 12);
                    a = divisor * result;  // Dividend (up to 144)
                    b = divisor;
                    q.ans = result;
                    q.hint = `How many times does ${b} go into ${a}? Think: ${b} × ? = ${a}. Use the multiplication fact: ${b} × ${result} = ${a}`;
                    // Add visual hint with grouping/array
                    if (a <= 60 && b <= 10) {
                        q.hintVisual = createDotArray(result, b, `${a} ÷ ${b} = ${result} groups`);
                    } else {
                        q.hintVisual = `<div style="font-weight:600;text-align:center;">Split ${a} into groups of ${b}:<br>${b} × <span style="color:var(--accent-green);font-weight:700;">${result}</span> = ${a}</div>`;
                    }

                    const uniqueIdSimpleDiv = Date.now() + Math.random().toString(36).substr(2, 9);
                    const divDigitsSimple = a.toString().split('');
                    q.visual = `<!-- Long Division --><div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.2rem;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-cyan);">Long Division</div>
                        <div style="display:inline-block;background:var(--bg-card);padding:25px 30px;border-radius:12px;border:2px solid var(--accent-cyan);">
                            <div style="display:flex;align-items:flex-start;gap:6px;">
                                <!-- Divisor on the left -->
                                <div style="font-size:1.8rem;font-weight:700;color:var(--accent-orange);padding-top:50px;">${b}</div>

                                <!-- Division bracket with answer on top -->
                                <div>
                                    <!-- Answer boxes on top -->
                                    <div style="display:flex;justify-content:center;gap:4px;margin-bottom:4px;">
                                        ${divDigitsSimple.map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueIdSimpleDiv}-quot-${i}" style="width:36px;height:36px;border:2px solid var(--accent-green);border-radius:6px;background:var(--bg-card-light);text-align:center;font-size:1.3rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                                    </div>
                                    <!-- Division bracket (top line and left hook) with dividend -->
                                    <div style="border-top:3px solid #444;border-left:3px solid #444;padding:10px 15px 8px 12px;border-top-left-radius:8px;">
                                        <div style="display:flex;gap:4px;">
                                            ${divDigitsSimple.map(d => `<span style="display:inline-block;width:36px;text-align:center;font-size:1.5rem;font-weight:700;">${d}</span>`).join('')}
                                        </div>
                                    </div>
                                    <!-- Work area for subtraction -->
                                    <div style="margin-left:12px;margin-top:8px;">
                                        <div style="display:flex;gap:4px;align-items:center;">
                                            <span style="font-size:0.9rem;color:var(--text-dim);width:16px;">−</span>
                                            ${divDigitsSimple.map(() => `<input type="text" maxlength="2" class="column-work-input" style="width:36px;height:28px;border:1px solid var(--text-dim);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                                        </div>
                                        <div style="border-top:2px solid #444;margin:4px 0 4px 16px;"></div>
                                        <div style="display:flex;gap:4px;margin-left:16px;">
                                            ${divDigitsSimple.map(() => `<input type="text" maxlength="2" class="column-work-input" style="width:36px;height:28px;border:1px dashed var(--text-dim);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-secondary);">
                            ${b} ) ${a} &nbsp;•&nbsp; Divide, Multiply, Subtract
                        </div>
                    </div>`;
                } else if (useLongDiv && !useFullTables) {
                    // Long division for larger problems - scale quotient with range
                    b = rng(2, 9); // divisor (single digit)
                    const ldMaxQ = Math.max(2, Math.min(Math.floor(range / b), 99));
                    const result = rng(2, ldMaxQ); // quotient scaled by range
                    a = b * result; // dividend (ensures clean division)
                    q.ans = result;
                    q.hint = `Use long division: How many times does ${b} go into ${a}? Think: ${b} × ? = ${a}`;

                    // Visual long division - format depends on problem size
                    const divDigits = a.toString().split('');
                    const quotientLen = result.toString().length;
                    const uniqueIdDiv = Date.now() + Math.random().toString(36).substr(2, 9);
                    const needsWorkingArea = a > 144; // Only show working area for problems larger than 144/12

                    // Worked example hint with steps
                    const firstDigit = parseInt(divDigits[0]);
                    const quotientFirstDigit = Math.floor(firstDigit / b);
                    const remainder1 = firstDigit - (quotientFirstDigit * b);
                    q.hintVisual = `<div style="text-align:left;font-size:0.85rem;line-height:1.6;">
                        <div style="font-weight:700;color:var(--accent-cyan);margin-bottom:8px;">Worked Example: ${a} ÷ ${b}</div>
                        <div style="padding-left:10px;">
                            <div><strong>Step 1:</strong> How many ${b}s in ${a}?</div>
                            <div><strong>Step 2:</strong> ${b} × ${result} = ${a}</div>
                            <div><strong>Answer:</strong> <span style="color:var(--accent-green);font-weight:700;">${result}</span></div>
                            <div style="margin-top:8px;padding:8px;background:rgba(0,0,0,0.1);border-radius:6px;text-align:center;font-family:monospace;">
                                <div style="display:flex;align-items:center;justify-content:center;gap:8px;">
                                    <span>${b}</span>
                                    <span style="border-top:2px solid currentColor;border-left:2px solid currentColor;padding:4px 12px 4px 8px;border-top-left-radius:6px;">${a}</span>
                                </div>
                                <div style="color:var(--accent-green);font-weight:700;margin-top:4px;">= ${result}</div>
                            </div>
                        </div>
                    </div>`;

                    if (needsWorkingArea) {
                        // Full format with working area for larger problems
                        q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.2rem;">
                            <div style="font-weight:700;margin-bottom:15px;">Long Division</div>
                            <div style="display:inline-block;background:var(--bg-card);padding:25px 30px;border-radius:12px;border:2px solid var(--accent-cyan);">
                                <div style="display:flex;align-items:flex-end;gap:8px;">
                                    <!-- Divisor on the left -->
                                    <div style="font-size:1.5rem;font-weight:700;color:var(--accent-orange);padding-bottom:10px;">${b}</div>

                                    <div style="min-width:${divDigits.length * 40 + 20}px;">
                                        <!-- Quotient (answer) on top with label -->
                                        <div style="font-size:0.75rem;color:var(--accent-green);text-align:left;margin-bottom:2px;font-weight:700;">
                                            Answer:
                                        </div>
                                        <div style="display:flex;gap:4px;padding-left:15px;margin-bottom:4px;">
                                            ${divDigits.map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueIdDiv}-quot-${i}" style="width:36px;height:36px;border:2px solid var(--accent-green);border-radius:6px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;color:var(--accent-green);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                                        </div>

                                        <!-- Division bracket (top line and left hook) with dividend -->
                                        <div style="border-top:3px solid #444;border-left:3px solid #444;padding:8px 10px 8px 15px;border-top-left-radius:8px;margin-bottom:10px;">
                                            ${divDigits.map(d => `<span style="display:inline-block;width:36px;text-align:center;font-size:1.3rem;font-weight:700;">${d}</span>`).join('')}
                                        </div>

                                        <!-- Working area label -->
                                        <div style="font-size:0.75rem;color:var(--text-dim);text-align:left;margin-bottom:4px;padding-left:4px;">
                                            Work area:
                                        </div>

                                        <!-- Working area for multiply/subtract steps (interactive) -->
                                        <div style="padding-left:15px;">
                                            ${Array(4).fill(0).map((_, rowIdx) => `
                                                <div style="display:flex;gap:4px;margin-bottom:8px;">
                                                    ${divDigits.map((_, colIdx) => `<input type="text" maxlength="2" class="column-work-input" data-col="${uniqueIdDiv}-work-${rowIdx}-${colIdx}" style="width:36px;height:30px;border:1px solid var(--text-dim);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style="margin-top:12px;font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">
                                Divide • Multiply • Subtract • Bring down • Repeat
                            </div>
                        </div>`;
                    } else {
                        // Simple format without working area for smaller problems (≤144)
                        q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.2rem;">
                            <div style="font-weight:700;margin-bottom:15px;">Long Division</div>
                            <div style="display:inline-block;background:var(--bg-card);padding:25px 30px;border-radius:12px;border:2px solid var(--accent-cyan);">
                                <div style="display:flex;align-items:flex-end;gap:4px;">
                                    <!-- Divisor on the left -->
                                    <div style="font-size:1.8rem;font-weight:700;color:var(--accent-orange);padding-bottom:8px;">${b}</div>

                                    <!-- Division bracket with answer on top -->
                                    <div>
                                        <!-- Answer box on top -->
                                        <div style="display:flex;justify-content:center;margin-bottom:4px;">
                                            <input type="text" maxlength="2" class="column-answer-input" data-col="${uniqueIdDiv}-quot-0" style="width:70px;height:45px;border:3px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.5rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">
                                        </div>
                                        <!-- Division bracket (top line and left hook) with dividend -->
                                        <div style="border-top:3px solid #444;border-left:3px solid #444;padding:10px 20px 8px 15px;border-top-left-radius:8px;">
                                            <span style="font-size:1.8rem;font-weight:700;">${a}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style="margin-top:12px;font-size:0.9rem;color:var(--text-secondary);">
                                ${b} ) ${a} = ?
                            </div>
                        </div>`;
                    }
                } else {
                    // Regular division facts (based on 1-12 tables, ignores max number range)
                    const divisor = pick(ensureTables());
                    const result = rng(1, 12);
                    a = divisor * result;  // Dividend can be up to 144, regardless of range setting
                    b = divisor;
                    q.ans = result;
                    q.hint = `How many groups of ${b} can you make from ${a}? Think: ${b} × ? = ${a}. Use the multiplication fact: ${b} × ${result} = ${a}`;
                    // Add visual hint with grouping/array
                    if (a <= 60 && b <= 10) {
                        q.hintVisual = createDotArray(result, b, `${a} ÷ ${b} = ${result} groups`);
                    } else {
                        q.hintVisual = `<div style="font-weight:600;text-align:center;">Split ${a} into groups of ${b}:<br>${b} × <span style="color:var(--accent-green);font-weight:700;">${result}</span> = ${a}</div>`;
                    }
                }
            } else if (op === "-") {
                // For facts mode, always use simple horizontal format
                // For non-facts: Within 100: 50% mix between column and horizontal
                // More than 100: Always use column subtraction
                const useColumnSub = factsMode ? false : (state.decimalPlaces > 0 ? false : (range > 100 ? true : (range >= 20 && Math.random() < 0.5)));

                if (useColumnSub) {
                    // Column subtraction: larger numbers
                    // Fix range calculation - ensure min is less than max for random numbers
                    const minSubVal = Math.max(10, Math.floor(range / 4));
                    a = rng(Math.min(minSubVal, range - 1), range);
                    b = rng(Math.max(1, Math.floor(a / 4)), Math.max(2, Math.floor(a * 0.7)));
                    q.ans = a - b;
                    q.hint = `Use column subtraction: Line up the digits by place value. Start from the ones column and work left. Borrow if needed!`;

                    // Visual column subtraction with EXACT digit counts
                    const answerLen = q.ans.toString().length;
                    const displayLen = a.toString().length; // Minuend determines width
                    const subDigitsA = a.toString().split('');
                    const subDigitsB = b.toString().padStart(displayLen, ' ').split('');
                    const uniqueIdSub = Date.now() + Math.random().toString(36).substr(2, 9);
                    q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.1rem;">
                        <div style="font-weight:700;margin-bottom:10px;">Column Subtraction</div>
                        <div style="display:inline-block;text-align:right;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid var(--accent-pink);">
                            <!-- Regrouping boxes for borrowing (interactive inputs) -->
                            <div style="display:flex;justify-content:flex-end;gap:2px;margin-bottom:4px;padding-right:2px;">
                                ${subDigitsA.map((_, i) => `<input type="text" maxlength="2" class="column-carry-input" data-col="${uniqueIdSub}-borrow-${i}" style="width:24px;height:18px;border:1px dashed var(--accent-orange);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:0.65rem;color:var(--accent-orange);font-family:inherit;padding:0;" placeholder="">`).join('')}
                            </div>
                            <div style="padding-bottom:5px;">
                                <span style="margin-right:12px;">&nbsp;</span>${subDigitsA.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <div style="border-bottom:3px solid #444;padding:5px 0;">
                                <span style="margin-right:12px;">−</span>${subDigitsB.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <div style="padding-top:8px;color:var(--accent-green);font-weight:700;">
                                <span style="margin-right:12px;">&nbsp;</span>${Array(answerLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueIdSub}-ans-${i}" style="width:24px;height:24px;border:1px solid var(--accent-green);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-secondary);">
                            Type in boxes • Use top row for borrowing
                        </div>
                    </div>`;
                } else {
                    // Regular subtraction (mental math)
                    if (state.decimalPlaces > 0 && !factsMode) { a = applyDecimals(a); b = applyDecimals(b); }
                    if (a < b) [a, b] = [b, a];
                    q.ans = state.decimalPlaces > 0 ? parseFloat((a - b).toFixed(state.decimalPlaces)) : a - b;
                    q.hint = `Start at ${a.toLocaleString()} and count back ${b.toLocaleString()}. Or think: ${q.ans.toLocaleString()} + ${b.toLocaleString()} = ${a.toLocaleString()}`;
                    q.visual = `<div style="font-weight:700;">${a.toLocaleString()} − ${b.toLocaleString()}<br>Start at ${a.toLocaleString()}, count back ${b.toLocaleString()}</div>`;
                }
            } else {
                // Addition: For facts mode, always use simple horizontal format
                // For non-facts: Within 100: 50% mix between column and horizontal
                // More than 100: Always use column addition
                const useColumnAdd = factsMode ? false : (state.decimalPlaces > 0 ? false : (range > 100 ? true : (range >= 20 && Math.random() < 0.5)));

                if (useColumnAdd) {
                    // Column addition: larger numbers
                    // Fix range calculation - ensure min is less than max for random numbers
                    const minAddVal = Math.max(5, Math.floor(range / 4));
                    a = rng(Math.min(minAddVal, range - 1), range);
                    b = rng(Math.min(minAddVal, range - 1), range);
                    q.ans = a + b;
                    q.hint = `Use column addition: Line up the digits by place value. Start from the ones column and work left. Carry if the sum is 10 or more!`;

                    // Visual column addition with interactive input boxes
                    // Use EXACT digit counts for each number
                    const answerLen = q.ans.toString().length;
                    const displayLen = Math.max(a.toString().length, b.toString().length);
                    const paddedAddA = a.toString().padStart(displayLen, ' ').split('');
                    const paddedAddB = b.toString().padStart(displayLen, ' ').split('');
                    const carryBoxCount = displayLen; // One carry box per column
                    const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);
                    q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.1rem;">
                        <div style="font-weight:700;margin-bottom:10px;">Column Addition</div>
                        <div style="display:inline-block;text-align:right;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid var(--accent-green);">
                            <!-- Regrouping boxes for carrying (interactive inputs) -->
                            <div style="display:flex;justify-content:flex-end;gap:2px;margin-bottom:4px;padding-right:2px;">
                                ${Array(carryBoxCount).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-carry-input" data-col="${uniqueId}-carry-${i}" style="width:24px;height:18px;border:1px dashed var(--accent-cyan);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:0.75rem;color:var(--accent-cyan);font-family:inherit;padding:0;" placeholder="">`).join('')}
                            </div>
                            <div style="padding-bottom:5px;">
                                <span style="margin-right:12px;">&nbsp;</span>${paddedAddA.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <div style="border-bottom:3px solid #444;padding:5px 0;">
                                <span style="margin-right:12px;">+</span>${paddedAddB.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <div style="padding-top:8px;color:var(--accent-green);font-weight:700;">
                                <span style="margin-right:12px;">&nbsp;</span>${Array(answerLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueId}-ans-${i}" style="width:24px;height:24px;border:1px solid var(--accent-green);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-secondary);">
                            Type in boxes • Use top row for carrying
                        </div>
                    </div>`;
                } else {
                    // Regular addition (mental math)
                    if (state.decimalPlaces > 0 && !factsMode) { a = applyDecimals(a); b = applyDecimals(b); }
                    q.ans = state.decimalPlaces > 0 ? parseFloat((a + b).toFixed(state.decimalPlaces)) : a + b;
                    q.hint = `Start at ${a.toLocaleString()} and count up ${b.toLocaleString()}. Or: ${a.toLocaleString()} + ${b.toLocaleString()} = ?`;
                    q.visual = `<div style="font-weight:700;">${a.toLocaleString()} + ${b.toLocaleString()}<br>Start at ${a.toLocaleString()}, count up ${b.toLocaleString()}</div>`;
                }
            }
            q.text = `${a.toLocaleString()} ${op} ${b.toLocaleString()} = ?`;
            q.a = a;
            q.b = b;
            q.op = op;
            
            // Set printFormat and screen visual for facts skills (mixed horizontal/vertical)
            // Add/Sub/Mult: 50% horizontal, 50% vertical column
            // Div: 33% horizontal, 33% fraction bar, 33% long division bracket
            if (factsMode) {
                // Clear any previous visual (number line, Long Division, etc.) so format is clean
                const savedHintVisual = q.hintVisual; // Preserve hint visual

                if (op === '+') {
                    const useVertical = Math.random() < 0.5;
                    q.printFormat = useVertical ? 'add-facts-vertical' : 'add-facts-horizontal';
                    q.skillLabel = 'Add Facts';
                    if (useVertical) {
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;">
                            <div style="display:inline-block;text-align:right;font-size:2rem;font-weight:700;padding:10px 15px;">
                                <div style="padding:2px 0;">${a}</div>
                                <div style="border-bottom:3px solid var(--text-bright);padding:2px 0;"><span style="margin-right:10px;color:var(--accent-green);">+</span>${b}</div>
                            </div>
                        </div>`;
                    } else {
                        // Horizontal: clear column/long-div visuals, keep only hint visual
                        q.visual = '';
                    }
                } else if (op === '-' || op === '\u2212') {
                    const useVertical = Math.random() < 0.5;
                    q.printFormat = useVertical ? 'sub-facts-vertical' : 'sub-facts-horizontal';
                    q.skillLabel = 'Sub Facts';
                    if (useVertical) {
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;">
                            <div style="display:inline-block;text-align:right;font-size:2rem;font-weight:700;padding:10px 15px;">
                                <div style="padding:2px 0;">${a}</div>
                                <div style="border-bottom:3px solid var(--text-bright);padding:2px 0;"><span style="margin-right:10px;color:var(--accent-orange);">\u2212</span>${b}</div>
                            </div>
                        </div>`;
                    } else {
                        q.visual = '';
                    }
                } else if (op === '\u00d7') {
                    const useVertical = Math.random() < 0.5;
                    q.printFormat = useVertical ? 'mult-facts-vertical' : 'mult-facts-horizontal';
                    q.skillLabel = 'Mult Facts';
                    if (useVertical) {
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;">
                            <div style="display:inline-block;text-align:right;font-size:2rem;font-weight:700;padding:10px 15px;">
                                <div style="padding:2px 0;">${a}</div>
                                <div style="border-bottom:3px solid var(--text-bright);padding:2px 0;"><span style="margin-right:10px;color:var(--accent-purple);">\u00d7</span>${b}</div>
                            </div>
                        </div>`;
                    } else {
                        q.visual = '';
                    }
                } else if (op === '\u00f7') {
                    const roll = Math.random();
                    q.skillLabel = 'Div Facts';
                    // Clear any Long Division visual from operator-specific code above
                    q.visual = '';
                    if (roll < 0.33) {
                        q.printFormat = 'div-facts-horizontal';
                    } else if (roll < 0.66) {
                        q.printFormat = 'div-facts-fraction';
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:2rem;font-weight:700;">
                            <div style="display:inline-flex;flex-direction:column;align-items:center;">
                                <span style="padding:0 15px;">${a}</span>
                                <span style="border-top:3px solid var(--text-bright);padding:4px 15px;">${b}</span>
                            </div>
                            <span style="margin-left:12px;vertical-align:middle;">= ?</span>
                        </div>`;
                    } else {
                        q.printFormat = 'div-facts-long';
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:2rem;font-weight:700;">
                            <div style="display:inline-flex;align-items:flex-end;gap:4px;">
                                <span style="color:var(--accent-orange);padding-bottom:8px;">${b}</span>
                                <div style="border-top:3px solid var(--text-bright);border-left:3px solid var(--text-bright);padding:8px 20px 8px 15px;border-top-left-radius:8px;">${a}</div>
                            </div>
                            <div style="margin-top:8px;font-size:1rem;color:var(--text-dim);">${a} \u00f7 ${b} = ?</div>
                        </div>`;
                    }
                }

                q.hintVisual = savedHintVisual; // Restore hint visual
            }
            q.options = buildNumericOptions(q.ans);
            return;
}

export function generateIntegersQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // Integers Category
            const intSkill = mappedSkill === "mixed" ? pick(["number_line_int", "compare_int", "add_int", "sub_int"]) : mappedSkill;
            
            // Scale integer range: range 10→10, 100→20, 1000→50
            const intMax = Math.max(10, Math.min(Math.ceil(range / 5), 50));

            if (intSkill === "number_line_int") {
                // Number lines with negatives
                const target = rng(-intMax, intMax);
                q.ans = target;
                q.text = `What integer is shown on the number line?`;
                q.hint = `Zero is in the middle. Numbers to the left are negative!`;
                
                // Dynamic number line based on target range
                const nlRange = Math.max(10, Math.abs(target) + 5);
                const nlMin = -nlRange;
                const nlMax = nlRange;
                const nlSpan = nlMax - nlMin;
                const tickPos = ((target - nlMin) / nlSpan) * 100;
                const nlTickStep = nlRange <= 10 ? 1 : nlRange <= 25 ? 5 : 10;
                const nlMajorStep = nlTickStep * (nlRange <= 10 ? 5 : 1);
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">➖ Integer Number Line</div>
                    <svg width="340" height="80" viewBox="0 0 340 80" style="max-width:100%;">
                        <line x1="20" y1="40" x2="320" y2="40" stroke="currentColor" stroke-width="2"/>
                        ${(() => {
                            let ticks = '';
                            for (let val = nlMin; val <= nlMax; val += nlTickStep) {
                                const x = 20 + ((val - nlMin) / nlSpan) * 300;
                                const isMajor = val % nlMajorStep === 0;
                                ticks += `<line x1="${x}" y1="${isMajor ? 30 : 35}" x2="${x}" y2="${isMajor ? 50 : 45}" stroke="currentColor" stroke-width="${isMajor ? 2 : 1}"/>`;
                                if (isMajor) ticks += `<text x="${x}" y="65" text-anchor="middle" fill="currentColor" font-size="11">${val}</text>`;
                            }
                            return ticks;
                        })()}
                        <polygon points="${20 + tickPos * 3 - 6},18 ${20 + tickPos * 3 + 6},18 ${20 + tickPos * 3},28" fill="var(--accent-green)"/>
                        <text x="${20 + tickPos * 3}" y="12" text-anchor="middle" fill="var(--accent-green)" font-size="12" font-weight="bold">?</text>
                    </svg>
                </div>`;
                q.options = buildNumericOptions(target);
                q.integerData = { target };
                q.printFormat = "integer-number-line";
            } else if (intSkill === "compare_int") {
                // Comparing integers - scale with range
                let a = rng(-intMax, intMax);
                let b = rng(-intMax, intMax);
                while (a === b) b = rng(-intMax, intMax);
                const symbol = a > b ? ">" : "<";
                q.ans = symbol;
                q.answerType = "choice";
                q.text = `Compare: ${a} ___ ${b}`;
                q.hint = `On a number line, the number further RIGHT is greater!`;
                q.options = [">", "<", "="];
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">➖ Compare Integers</div>
                    <div style="font-size:2.2rem;margin:20px 0;">
                        <span style="color:${a < 0 ? 'var(--accent-orange)' : 'var(--accent-green)'};font-weight:700;">${a}</span>
                        <span style="margin:0 20px;border:2px dashed var(--text-dim);padding:8px 20px;border-radius:8px;">?</span>
                        <span style="color:${b < 0 ? 'var(--accent-orange)' : 'var(--accent-green)'};font-weight:700;">${b}</span>
                    </div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-top:10px;">💡 Think: Which is further right on the number line?</div>
                </div>`;
                q.integerData = { a, b, answer: symbol };
                q.printFormat = "integer-compare";
            } else if (intSkill === "add_int") {
                // Adding integers - scale with range
                const intAddMax = Math.max(10, Math.floor(intMax * 0.75));
                let a = rng(-intAddMax, intAddMax);
                let b = rng(-intAddMax, intAddMax);
                const result = a + b;
                q.ans = result;
                q.text = `${a} + ${b >= 0 ? b : '(' + b + ')'} = ?`;
                q.hint = `Same signs: add and keep sign. Different signs: subtract and keep sign of larger!`;
                
                const aColor = a < 0 ? '#e74c3c' : '#27ae60';
                const bColor = b < 0 ? '#e74c3c' : '#27ae60';
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">➖ Adding Integers</div>
                    <div style="font-size:1.8rem;margin:15px 0;">
                        <span style="color:${aColor};font-weight:700;padding:5px 12px;background:rgba(${a < 0 ? '231,76,60' : '39,174,96'},0.15);border-radius:8px;">${a}</span>
                        <span style="margin:0 10px;font-weight:700;">+</span>
                        <span style="color:${bColor};font-weight:700;padding:5px 12px;background:rgba(${b < 0 ? '231,76,60' : '39,174,96'},0.15);border-radius:8px;">${b >= 0 ? b : '(' + b + ')'}</span>
                        <span style="margin:0 10px;">=</span>
                        <span style="border-bottom:3px solid #444;padding:0 15px;font-weight:700;">?</span>
                    </div>
                    <div style="background:var(--bg-card);padding:12px;border-radius:8px;margin-top:15px;font-size:0.85rem;">
                        <div style="color:var(--text-dim);">🟢 Positive chips: ${a >= 0 ? a : 0} + ${b >= 0 ? b : 0} = ${(a >= 0 ? a : 0) + (b >= 0 ? b : 0)}</div>
                        <div style="color:var(--text-dim);">🔴 Negative chips: ${a < 0 ? Math.abs(a) : 0} + ${b < 0 ? Math.abs(b) : 0} = ${(a < 0 ? Math.abs(a) : 0) + (b < 0 ? Math.abs(b) : 0)}</div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(result);
                q.integerData = { a, b, result, op: '+' };
                q.printFormat = "integer-add";
            } else if (intSkill === "sub_int") {
                // Subtracting integers - scale with range
                const intSubMax = Math.max(10, Math.floor(intMax * 0.75));
                let a = rng(-intSubMax, intSubMax);
                let b = rng(-intSubMax, intSubMax);
                const result = a - b;
                q.ans = result;
                q.text = `${a} − ${b >= 0 ? b : '(' + b + ')'} = ?`;
                q.hint = `Subtracting is the same as adding the opposite! ${a} − ${b} = ${a} + ${-b}`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">➖ Subtracting Integers</div>
                    <div style="font-size:1.6rem;margin:15px 0;">
                        <span style="font-weight:700;">${a}</span>
                        <span style="margin:0 8px;font-weight:700;">−</span>
                        <span style="font-weight:700;">${b >= 0 ? b : '(' + b + ')'}</span>
                    </div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:280px;">
                        <div style="font-weight:600;color:var(--accent-cyan);margin-bottom:8px;">✨ Add the Opposite!</div>
                        <div style="font-size:1.3rem;">${a} + <span style="color:var(--accent-orange);font-weight:700;">${-b >= 0 ? '(+' + (-b) + ')' : '(' + (-b) + ')'}</span> = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(result);
                q.integerData = { a, b, result, op: '-' };
                q.printFormat = "integer-sub";
            }
            return;
}
