// gen-algebraic.js - Algebraic Thinking: Order of Operations, Patterns, Rounding, Place Value, Estimation, Algebra
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';
import { createNumberLine } from './svg-base10.js';

export function generateOrderOfOpsQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;
            // Progressive skill levels for PEMDAS
            let ooSkill = mappedSkill;
            if (ooSkill === "mixed" || !ooSkill) {
                ooSkill = pick(["oop_easy", "oop_medium", "oop_hard", "two_ops_no_paren", "three_ops_no_paren", "multi_ops_no_paren", "paren_simple", "paren_multi", "nested_complex", "exponents_simple", "exponents_mixed", "full_pemdas", "compare_expressions"]);
            }

            // Scale OoO numbers with range: range 10->small, 100->medium, 1000->larger
            // Keep numbers manageable for mental math (cap factors at reasonable levels)
            const ooScale = Math.max(1, Math.min(Math.floor(range / 10), 5));
            // Helper to generate safe numbers for operations, scaled by range
            const safeNum = (min, max) => rng(min, Math.max(min, Math.min(max * ooScale, range)));

            // Helper to pick operation
            const pickOp = (ops) => pick(ops);

            // Helper to format expression for display
            const formatExp = (exp) => exp.replace(/\*/g, '\u00d7').replace(/\//g, '\u00f7').replace(/\^/g, '<sup>').replace(/\^(\d+)/g, '<sup>$1</sup>');

            let expression = "";
            let answer = 0;
            let hint = "";
            let steps = [];

            if (ooSkill === "oop_easy") {
                // Grade 4: 2 operations, no parentheses, numbers 1-12
                const pattern = pick(["a+bxc", "axb-c", "a+bdc", "axb+c", "a-bdc"]);

                if (pattern === "a+bxc") {
                    const a = rng(1, 12);
                    const b = rng(2, 6);
                    const c = rng(2, 6);
                    expression = `${a} + ${b} \u00d7 ${c}`;
                    answer = a + (b * c);
                    steps = [`First: ${b} \u00d7 ${c} = ${b * c}`, `Then: ${a} + ${b * c} = ${answer}`];
                    hint = "Multiply first, then add. \u00d7 comes before +";
                } else if (pattern === "axb-c") {
                    const a = rng(2, 6);
                    const b = rng(2, 6);
                    const c = rng(1, Math.min(a * b - 1, 12));
                    expression = `${a} \u00d7 ${b} \u2212 ${c}`;
                    answer = (a * b) - c;
                    steps = [`First: ${a} \u00d7 ${b} = ${a * b}`, `Then: ${a * b} \u2212 ${c} = ${answer}`];
                    hint = "Multiply first, then subtract.";
                } else if (pattern === "a+bdc") {
                    const c = rng(2, 6);
                    const b = c * rng(2, 4);
                    const a = rng(1, 12);
                    expression = `${a} + ${b} \u00f7 ${c}`;
                    answer = a + (b / c);
                    steps = [`First: ${b} \u00f7 ${c} = ${b / c}`, `Then: ${a} + ${b / c} = ${answer}`];
                    hint = "Divide first, then add. \u00f7 comes before +";
                } else if (pattern === "axb+c") {
                    const a = rng(2, 6);
                    const b = rng(2, 6);
                    const c = rng(1, 12);
                    expression = `${a} \u00d7 ${b} + ${c}`;
                    answer = (a * b) + c;
                    steps = [`First: ${a} \u00d7 ${b} = ${a * b}`, `Then: ${a * b} + ${c} = ${answer}`];
                    hint = "Multiply first, then add.";
                } else {
                    // a - b / c
                    const c = rng(2, 6);
                    const b = c * rng(2, 4);
                    const a = rng(Math.ceil(b / c) + 1, 12);
                    expression = `${a} \u2212 ${b} \u00f7 ${c}`;
                    answer = a - (b / c);
                    steps = [`First: ${b} \u00f7 ${c} = ${b / c}`, `Then: ${a} \u2212 ${b / c} = ${answer}`];
                    hint = "Divide first, then subtract.";
                }

                q.text = `${expression} = ?`;
                q.ans = answer;
                q.hint = hint;
                q.options = buildNumericOptions(answer);
                q.printFormat = "order-of-ops";
                q.skillLabel = "OoO Easy";
                q.oooSteps = steps;
                return;
            } else if (ooSkill === "oop_medium") {
                // Grade 5: 3-4 operations WITH parentheses
                const pattern = pick(["(a+b)xc", "ax(b-c)+d", "(a+b)dc+dxe", "ax(b+(c-d))"]);

                if (pattern === "(a+b)xc") {
                    const a = rng(2, 10);
                    const b = rng(2, 10);
                    const c = rng(2, 8);
                    expression = `(${a} + ${b}) \u00d7 ${c}`;
                    answer = (a + b) * c;
                    steps = [`Parentheses: ${a} + ${b} = ${a + b}`, `Then: ${a + b} \u00d7 ${c} = ${answer}`];
                    hint = "Parentheses first! Add inside, then multiply.";
                } else if (pattern === "ax(b-c)+d") {
                    const c = rng(2, 8);
                    const b = rng(c + 2, 15);
                    const a = rng(2, 6);
                    const d = rng(1, 15);
                    expression = `${a} \u00d7 (${b} \u2212 ${c}) + ${d}`;
                    answer = a * (b - c) + d;
                    const inner = b - c;
                    const prod = a * inner;
                    steps = [`Parentheses: ${b} \u2212 ${c} = ${inner}`, `Multiply: ${a} \u00d7 ${inner} = ${prod}`, `Add: ${prod} + ${d} = ${answer}`];
                    hint = "Parentheses first, then \u00d7 and \u00f7, then + and \u2212";
                } else if (pattern === "(a+b)dc+dxe") {
                    // (a+b) / c + d * e, ensure clean division
                    const c = rng(2, 5);
                    const sum = c * rng(2, 6);
                    const a = rng(1, sum - 1);
                    const b = sum - a;
                    const d = rng(2, 5);
                    const e = rng(2, 5);
                    expression = `(${a} + ${b}) \u00f7 ${c} + ${d} \u00d7 ${e}`;
                    const divResult = sum / c;
                    const multResult = d * e;
                    answer = divResult + multResult;
                    steps = [`Parentheses: ${a} + ${b} = ${sum}`, `Divide: ${sum} \u00f7 ${c} = ${divResult}`, `Multiply: ${d} \u00d7 ${e} = ${multResult}`, `Add: ${divResult} + ${multResult} = ${answer}`];
                    hint = "Parentheses first, then \u00d7 and \u00f7, then + and \u2212";
                } else {
                    // a * (b + (c - d)) — nested
                    const d = rng(2, 8);
                    const c = rng(d + 2, 15);
                    const b = rng(2, 8);
                    const a = rng(2, 5);
                    const innermost = c - d;
                    const middle = b + innermost;
                    answer = a * middle;
                    expression = `${a} \u00d7 (${b} + (${c} \u2212 ${d}))`;
                    steps = [`Inner parentheses: ${c} \u2212 ${d} = ${innermost}`, `Outer parentheses: ${b} + ${innermost} = ${middle}`, `Multiply: ${a} \u00d7 ${middle} = ${answer}`];
                    hint = "Work from the innermost parentheses outward.";
                }

                q.text = `${expression} = ?`;
                q.ans = answer;
                q.hint = hint;
                q.options = buildNumericOptions(answer);
                q.printFormat = "order-of-ops";
                q.skillLabel = "OoO Medium";
                q.oooSteps = steps;
                return;
            } else if (ooSkill === "oop_hard") {
                // Grade 6: Nested brackets, exponents, full PEMDAS
                const pattern = pick(["[a+(bxc)]dd", "a2+(bxc)", "(a+b)2-c", "ax[b-(cdd)]"]);

                if (pattern === "[a+(bxc)]dd") {
                    // [a + (b * c)] / d — ensure clean division
                    const b = rng(2, 6);
                    const c = rng(2, 6);
                    const prod = b * c;
                    const a = rng(2, 10);
                    const sum = a + prod;
                    // Find a divisor for sum
                    const divisors = [];
                    for (let i = 2; i <= Math.min(sum, 15); i++) {
                        if (sum % i === 0) divisors.push(i);
                    }
                    const d = divisors.length > 0 ? pick(divisors) : 1;
                    answer = sum / d;
                    expression = `[${a} + (${b} \u00d7 ${c})] \u00f7 ${d}`;
                    steps = [`Inner parentheses: ${b} \u00d7 ${c} = ${prod}`, `Brackets: ${a} + ${prod} = ${sum}`, `Divide: ${sum} \u00f7 ${d} = ${answer}`];
                    hint = "Brackets and parentheses first, then divide.";
                } else if (pattern === "a2+(bxc)") {
                    // a^2 + (b * c)
                    const a = rng(2, 10);
                    const b = rng(2, 8);
                    const c = rng(2, 8);
                    const sq = a * a;
                    const prod = b * c;
                    answer = sq + prod;
                    expression = `${a}<sup>2</sup> + (${b} \u00d7 ${c})`;
                    steps = [`Exponent: ${a}<sup>2</sup> = ${a} \u00d7 ${a} = ${sq}`, `Parentheses: ${b} \u00d7 ${c} = ${prod}`, `Add: ${sq} + ${prod} = ${answer}`];
                    hint = "Brackets, Exponents, Multiply/Divide, Add/Subtract (BEDMAS)";
                } else if (pattern === "(a+b)2-c") {
                    // (a + b)^2 - c
                    const a = rng(2, 6);
                    const b = rng(2, 6);
                    const sum = a + b;
                    const sq = sum * sum;
                    const c = rng(1, Math.min(sq - 1, 30));
                    answer = sq - c;
                    expression = `(${a} + ${b})<sup>2</sup> \u2212 ${c}`;
                    steps = [`Parentheses: ${a} + ${b} = ${sum}`, `Exponent: ${sum}<sup>2</sup> = ${sum} \u00d7 ${sum} = ${sq}`, `Subtract: ${sq} \u2212 ${c} = ${answer}`];
                    hint = "Parentheses first, then exponent, then subtract.";
                } else {
                    // a * [b - (c / d)] — ensure clean division and positive result
                    const d = rng(2, 5);
                    const c = d * rng(1, 4);
                    const quotient = c / d;
                    const b = rng(quotient + 2, 15);
                    const inner = b - quotient;
                    const a = rng(2, 6);
                    answer = a * inner;
                    expression = `${a} \u00d7 [${b} \u2212 (${c} \u00f7 ${d})]`;
                    steps = [`Inner parentheses: ${c} \u00f7 ${d} = ${quotient}`, `Brackets: ${b} \u2212 ${quotient} = ${inner}`, `Multiply: ${a} \u00d7 ${inner} = ${answer}`];
                    hint = "Innermost parentheses first, then brackets, then multiply.";
                }

                q.text = `${expression} = ?`;
                q.ans = answer;
                q.hint = hint;
                q.options = buildNumericOptions(answer);
                q.printFormat = "order-of-ops";
                q.skillLabel = "OoO Hard";
                q.oooSteps = steps;
                return;
            } else if (ooSkill === "two_ops_no_paren") {
                // Level 1: Two operations, no parentheses
                // Examples: 3 + 4 * 2, 8 - 6 / 2, 5 * 3 + 4
                const pattern = pick(["a+b*c", "a-b*c", "a*b+c", "a*b-c", "a+b/c", "a-b/c"]);

                if (pattern === "a+b*c") {
                    const a = safeNum(1, 20);
                    const b = safeNum(2, 10);
                    const c = safeNum(2, 10);
                    expression = `${a} + ${b} \u00d7 ${c}`;
                    answer = a + (b * c);
                    steps = [`First: ${b} \u00d7 ${c} = ${b * c}`, `Then: ${a} + ${b * c} = ${answer}`];
                    hint = "Remember: Multiply before adding!";
                } else if (pattern === "a-b*c") {
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 5);
                    const a = safeNum(b * c + 1, b * c + 20);
                    expression = `${a} - ${b} \u00d7 ${c}`;
                    answer = a - (b * c);
                    steps = [`First: ${b} \u00d7 ${c} = ${b * c}`, `Then: ${a} - ${b * c} = ${answer}`];
                    hint = "Remember: Multiply before subtracting!";
                } else if (pattern === "a*b+c") {
                    const a = safeNum(2, 10);
                    const b = safeNum(2, 10);
                    const c = safeNum(1, 20);
                    expression = `${a} \u00d7 ${b} + ${c}`;
                    answer = (a * b) + c;
                    steps = [`First: ${a} \u00d7 ${b} = ${a * b}`, `Then: ${a * b} + ${c} = ${answer}`];
                    hint = "Multiply first, then add.";
                } else if (pattern === "a*b-c") {
                    const a = safeNum(2, 10);
                    const b = safeNum(2, 10);
                    const c = safeNum(1, Math.min(a * b - 1, 15));
                    expression = `${a} \u00d7 ${b} - ${c}`;
                    answer = (a * b) - c;
                    steps = [`First: ${a} \u00d7 ${b} = ${a * b}`, `Then: ${a * b} - ${c} = ${answer}`];
                    hint = "Multiply first, then subtract.";
                } else if (pattern === "a+b/c") {
                    const c = safeNum(2, 10);
                    const b = c * safeNum(2, 10); // Ensure clean division
                    const a = safeNum(1, 20);
                    expression = `${a} + ${b} \u00f7 ${c}`;
                    answer = a + (b / c);
                    steps = [`First: ${b} \u00f7 ${c} = ${b / c}`, `Then: ${a} + ${b / c} = ${answer}`];
                    hint = "Remember: Divide before adding!";
                } else {
                    const c = safeNum(2, 10);
                    const b = c * safeNum(2, 10);
                    const a = safeNum(b / c + 1, 30);
                    expression = `${a} - ${b} \u00f7 ${c}`;
                    answer = a - (b / c);
                    steps = [`First: ${b} \u00f7 ${c} = ${b / c}`, `Then: ${a} - ${b / c} = ${answer}`];
                    hint = "Remember: Divide before subtracting!";
                }
            } else if (ooSkill === "three_ops_no_paren") {
                // Level 2: Three operations, no parentheses
                const pattern = pick(["a+b*c-d", "a*b+c*d", "a+b+c*d", "a*b-c+d"]);

                if (pattern === "a+b*c-d") {
                    const a = safeNum(5, 20);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 5);
                    const d = safeNum(1, Math.min(a + b * c - 1, 10));
                    expression = `${a} + ${b} \u00d7 ${c} - ${d}`;
                    answer = a + (b * c) - d;
                    steps = [`First: ${b} \u00d7 ${c} = ${b * c}`, `Then: ${a} + ${b * c} = ${a + b * c}`, `Finally: ${a + b * c} - ${d} = ${answer}`];
                    hint = "Do multiplication first, then work left to right.";
                } else if (pattern === "a*b+c*d") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 6);
                    const c = safeNum(2, 8);
                    const d = safeNum(2, 6);
                    expression = `${a} \u00d7 ${b} + ${c} \u00d7 ${d}`;
                    answer = (a * b) + (c * d);
                    steps = [`First: ${a} \u00d7 ${b} = ${a * b}`, `And: ${c} \u00d7 ${d} = ${c * d}`, `Then: ${a * b} + ${c * d} = ${answer}`];
                    hint = "Do both multiplications first, then add.";
                } else if (pattern === "a+b+c*d") {
                    const a = safeNum(5, 15);
                    const b = safeNum(5, 15);
                    const c = safeNum(2, 8);
                    const d = safeNum(2, 5);
                    expression = `${a} + ${b} + ${c} \u00d7 ${d}`;
                    answer = a + b + (c * d);
                    steps = [`First: ${c} \u00d7 ${d} = ${c * d}`, `Then: ${a} + ${b} + ${c * d} = ${answer}`];
                    hint = "Multiplication comes first!";
                } else {
                    const a = safeNum(3, 10);
                    const b = safeNum(2, 8);
                    const c = safeNum(1, Math.min(a * b - 2, 15));
                    const d = safeNum(1, 10);
                    expression = `${a} \u00d7 ${b} - ${c} + ${d}`;
                    answer = (a * b) - c + d;
                    steps = [`First: ${a} \u00d7 ${b} = ${a * b}`, `Then: ${a * b} - ${c} = ${a * b - c}`, `Finally: ${a * b - c} + ${d} = ${answer}`];
                    hint = "Multiply first, then work left to right.";
                }
            } else if (ooSkill === "multi_ops_no_paren") {
                // Level 3: 4-6 operations, no parentheses
                // e.g., 26 ÷ 2 × 9 + 21 − 45 or 88 ÷ 11 + 7 × 8 + 12 − 38 + 5
                const pattern = pick(["adxc+d-e", "addbc+dxe+f-g+h", "axb+c-dxe", "addb+cxd-e+f", "axbxc+d-e"]);

                if (pattern === "adxc+d-e") {
                    // a ÷ b × c + d − e (like 26÷2×9+21−45)
                    const b = safeNum(2, 8);
                    const a = b * safeNum(2, 8); // ensure clean division
                    const quotient = a / b;
                    const c = safeNum(2, 9);
                    const prod = quotient * c;
                    const d = safeNum(5, 30);
                    const e = safeNum(1, Math.min(prod + d - 1, 50));
                    expression = `${a} \u00f7 ${b} \u00d7 ${c} + ${d} \u2212 ${e}`;
                    answer = prod + d - e;
                    steps = [
                        `Divide: ${a} \u00f7 ${b} = ${quotient}`,
                        `Multiply: ${quotient} \u00d7 ${c} = ${prod}`,
                        `Add: ${prod} + ${d} = ${prod + d}`,
                        `Subtract: ${prod + d} \u2212 ${e} = ${answer}`
                    ];
                    hint = "×/÷ left to right first, then +/− left to right.";
                } else if (pattern === "addbc+dxe+f-g+h") {
                    // a ÷ b + c × d + e − f + g (like 88÷11+7×8+12−38+5)
                    const b = safeNum(2, 11);
                    const a = b * safeNum(2, 9);
                    const quotient = a / b;
                    const c = safeNum(2, 9);
                    const d = safeNum(2, 8);
                    const prod = c * d;
                    const e = safeNum(2, 20);
                    const partial = quotient + prod + e;
                    const f = safeNum(1, Math.min(partial - 1, 40));
                    const g = safeNum(1, 15);
                    expression = `${a} \u00f7 ${b} + ${c} \u00d7 ${d} + ${e} \u2212 ${f} + ${g}`;
                    answer = partial - f + g;
                    steps = [
                        `Divide: ${a} \u00f7 ${b} = ${quotient}`,
                        `Multiply: ${c} \u00d7 ${d} = ${prod}`,
                        `Add/Sub left to right: ${quotient} + ${prod} + ${e} \u2212 ${f} + ${g} = ${answer}`
                    ];
                    hint = "Do all ×/÷ first, then +/− left to right.";
                } else if (pattern === "axb+c-dxe") {
                    // a × b + c − d × e
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 8);
                    const d = safeNum(2, 6);
                    const e = safeNum(2, 6);
                    const prod1 = a * b;
                    const prod2 = d * e;
                    const c = safeNum(1, 20);
                    // Ensure non-negative
                    if (prod1 + c - prod2 < 0) {
                        expression = `${a} \u00d7 ${b} + ${c} + ${d} \u00d7 ${e}`;
                        answer = prod1 + c + prod2;
                        steps = [
                            `First multiply: ${a} \u00d7 ${b} = ${prod1}`,
                            `Second multiply: ${d} \u00d7 ${e} = ${prod2}`,
                            `Add: ${prod1} + ${c} + ${prod2} = ${answer}`
                        ];
                    } else {
                        expression = `${a} \u00d7 ${b} + ${c} \u2212 ${d} \u00d7 ${e}`;
                        answer = prod1 + c - prod2;
                        steps = [
                            `First multiply: ${a} \u00d7 ${b} = ${prod1}`,
                            `Second multiply: ${d} \u00d7 ${e} = ${prod2}`,
                            `Add/Sub: ${prod1} + ${c} \u2212 ${prod2} = ${answer}`
                        ];
                    }
                    hint = "Do both multiplications first, then +/− left to right.";
                } else if (pattern === "addb+cxd-e+f") {
                    // a ÷ b + c × d − e + f
                    const b = safeNum(2, 8);
                    const a = b * safeNum(2, 8);
                    const quotient = a / b;
                    const c = safeNum(2, 7);
                    const d = safeNum(2, 7);
                    const prod = c * d;
                    const e = safeNum(1, Math.min(quotient + prod - 1, 30));
                    const f = safeNum(1, 15);
                    expression = `${a} \u00f7 ${b} + ${c} \u00d7 ${d} \u2212 ${e} + ${f}`;
                    answer = quotient + prod - e + f;
                    steps = [
                        `Divide: ${a} \u00f7 ${b} = ${quotient}`,
                        `Multiply: ${c} \u00d7 ${d} = ${prod}`,
                        `Add/Sub: ${quotient} + ${prod} \u2212 ${e} + ${f} = ${answer}`
                    ];
                    hint = "Multiply and divide first, then add and subtract left to right.";
                } else {
                    // a × b × c + d − e
                    const a = safeNum(2, 5);
                    const b = safeNum(2, 5);
                    const c = safeNum(2, 4);
                    const prod = a * b * c;
                    const d = safeNum(1, 20);
                    const e = safeNum(1, Math.min(prod + d - 1, 30));
                    expression = `${a} \u00d7 ${b} \u00d7 ${c} + ${d} \u2212 ${e}`;
                    answer = prod + d - e;
                    steps = [
                        `Multiply left to right: ${a} \u00d7 ${b} = ${a * b}`,
                        `Continue: ${a * b} \u00d7 ${c} = ${prod}`,
                        `Add: ${prod} + ${d} = ${prod + d}`,
                        `Subtract: ${prod + d} \u2212 ${e} = ${answer}`
                    ];
                    hint = "Multiply left to right first, then +/− left to right.";
                }

                q.text = `${expression} = ?`;
                q.ans = answer;
                q.hint = hint;
                q.options = buildNumericOptions(answer);
                q.printFormat = "order-of-ops";
                q.skillLabel = "Multi-Op";
                q.oooSteps = steps;
                return;
            } else if (ooSkill === "paren_simple") {
                // Level 4: Simple parentheses
                const pattern = pick(["(a+b)*c", "(a-b)*c", "a*(b+c)", "a*(b-c)", "(a+b)/c"]);

                if (pattern === "(a+b)*c") {
                    const a = safeNum(2, 10);
                    const b = safeNum(2, 10);
                    const c = safeNum(2, 8);
                    expression = `(${a} + ${b}) \u00d7 ${c}`;
                    answer = (a + b) * c;
                    steps = [`First (parentheses): ${a} + ${b} = ${a + b}`, `Then: ${a + b} \u00d7 ${c} = ${answer}`];
                    hint = "Parentheses first! Add inside, then multiply.";
                } else if (pattern === "(a-b)*c") {
                    const b = safeNum(2, 8);
                    const a = safeNum(b + 2, 15);
                    const c = safeNum(2, 8);
                    expression = `(${a} - ${b}) \u00d7 ${c}`;
                    answer = (a - b) * c;
                    steps = [`First (parentheses): ${a} - ${b} = ${a - b}`, `Then: ${a - b} \u00d7 ${c} = ${answer}`];
                    hint = "Parentheses first! Subtract inside, then multiply.";
                } else if (pattern === "a*(b+c)") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 10);
                    const c = safeNum(2, 10);
                    expression = `${a} \u00d7 (${b} + ${c})`;
                    answer = a * (b + c);
                    steps = [`First (parentheses): ${b} + ${c} = ${b + c}`, `Then: ${a} \u00d7 ${b + c} = ${answer}`];
                    hint = "Always do parentheses first!";
                } else if (pattern === "a*(b-c)") {
                    const a = safeNum(2, 8);
                    const c = safeNum(2, 8);
                    const b = safeNum(c + 2, 15);
                    expression = `${a} \u00d7 (${b} - ${c})`;
                    answer = a * (b - c);
                    steps = [`First (parentheses): ${b} - ${c} = ${b - c}`, `Then: ${a} \u00d7 ${b - c} = ${answer}`];
                    hint = "Parentheses first!";
                } else {
                    const c = safeNum(2, 8);
                    const sum = c * safeNum(2, 10);
                    const a = safeNum(1, sum - 1);
                    const b = sum - a;
                    expression = `(${a} + ${b}) \u00f7 ${c}`;
                    answer = (a + b) / c;
                    steps = [`First (parentheses): ${a} + ${b} = ${a + b}`, `Then: ${a + b} \u00f7 ${c} = ${answer}`];
                    hint = "Add inside parentheses first, then divide.";
                }
            } else if (ooSkill === "paren_multi") {
                // Level 4: Parentheses with multiple operations
                const pattern = pick(["(a+b)*c+d", "(a+b)*(c+d)", "a*(b+c)-d", "(a-b)*c+d"]);

                if (pattern === "(a+b)*c+d") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 6);
                    const d = safeNum(1, 15);
                    expression = `(${a} + ${b}) \u00d7 ${c} + ${d}`;
                    answer = (a + b) * c + d;
                    steps = [`First (parentheses): ${a} + ${b} = ${a + b}`, `Then multiply: ${a + b} \u00d7 ${c} = ${(a + b) * c}`, `Finally add: ${(a + b) * c} + ${d} = ${answer}`];
                    hint = "P then M then A: Parentheses, Multiply, Add";
                } else if (pattern === "(a+b)*(c+d)") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 6);
                    const d = safeNum(2, 6);
                    expression = `(${a} + ${b}) \u00d7 (${c} + ${d})`;
                    answer = (a + b) * (c + d);
                    steps = [`First parentheses: ${a} + ${b} = ${a + b}`, `Second parentheses: ${c} + ${d} = ${c + d}`, `Then multiply: ${a + b} \u00d7 ${c + d} = ${answer}`];
                    hint = "Do BOTH parentheses first, then multiply!";
                } else if (pattern === "a*(b+c)-d") {
                    const a = safeNum(2, 6);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 8);
                    const d = safeNum(1, Math.min(a * (b + c) - 1, 15));
                    expression = `${a} \u00d7 (${b} + ${c}) - ${d}`;
                    answer = a * (b + c) - d;
                    steps = [`First (parentheses): ${b} + ${c} = ${b + c}`, `Then multiply: ${a} \u00d7 ${b + c} = ${a * (b + c)}`, `Finally subtract: ${a * (b + c)} - ${d} = ${answer}`];
                    hint = "Parentheses \u2192 Multiply \u2192 Subtract";
                } else {
                    const b = safeNum(2, 6);
                    const a = safeNum(b + 2, 12);
                    const c = safeNum(2, 6);
                    const d = safeNum(1, 15);
                    expression = `(${a} - ${b}) \u00d7 ${c} + ${d}`;
                    answer = (a - b) * c + d;
                    steps = [`First (parentheses): ${a} - ${b} = ${a - b}`, `Then multiply: ${a - b} \u00d7 ${c} = ${(a - b) * c}`, `Finally add: ${(a - b) * c} + ${d} = ${answer}`];
                    hint = "Parentheses \u2192 Multiply \u2192 Add";
                }
            } else if (ooSkill === "nested_complex") {
                // Level 6: Complex nested brackets — deeply nested with many operations
                // e.g., (20+80÷2×8)÷[(54÷9+14)÷4] or 3×[64÷(13−5)−4]×42÷6
                const pattern = pick(["(a+bdc*e)d[(fdg+h)di]", "a*[bd(c-d)-e]*f", "(a*b+c)d[(d+e)*f]", "a*[b+(c*d)]de+f"]);

                if (pattern === "(a+bdc*e)d[(fdg+h)di]") {
                    // (a + b÷c × e) ÷ [(f÷g + h) ÷ i]
                    const c = rng(2, 5);
                    const b = c * rng(2, 8);
                    const quotient1 = b / c;
                    const e = rng(2, 5);
                    const prod1 = quotient1 * e;
                    const a = rng(2, 30);
                    const leftVal = a + prod1;
                    const g = rng(2, 9);
                    const f = g * rng(1, 8);
                    const quotient2 = f / g;
                    const h = rng(2, 15);
                    const innerSum = quotient2 + h;
                    // Find a divisor for innerSum to get clean right value
                    const divisors = [];
                    for (let d = 2; d <= Math.min(innerSum, 12); d++) {
                        if (innerSum % d === 0) divisors.push(d);
                    }
                    if (divisors.length > 0) {
                        const i = pick(divisors);
                        const rightVal = innerSum / i;
                        // Ensure leftVal is divisible by rightVal
                        if (rightVal > 0 && leftVal % rightVal === 0) {
                            answer = leftVal / rightVal;
                            expression = `(${a} + ${b} \u00f7 ${c} \u00d7 ${e}) \u00f7 [(${f} \u00f7 ${g} + ${h}) \u00f7 ${i}]`;
                            steps = [
                                `Left side: ${b} \u00f7 ${c} = ${quotient1}`,
                                `Continue: ${quotient1} \u00d7 ${e} = ${prod1}`,
                                `Left result: ${a} + ${prod1} = ${leftVal}`,
                                `Right inner: ${f} \u00f7 ${g} = ${quotient2}`,
                                `Right add: ${quotient2} + ${h} = ${innerSum}`,
                                `Right result: ${innerSum} \u00f7 ${i} = ${rightVal}`,
                                `Final: ${leftVal} \u00f7 ${rightVal} = ${answer}`
                            ];
                            hint = "Work each bracket separately, then combine.";
                        } else {
                            // Fallback: simpler nested
                            const aa = rng(2, 6), bb = rng(2, 6), cc = rng(2, 5);
                            const dd = rng(2, 5);
                            const inner = aa + bb;
                            const mid = inner * cc;
                            const divs2 = [];
                            for (let x = 2; x <= Math.min(mid, 10); x++) if (mid % x === 0) divs2.push(x);
                            const ee = divs2.length > 0 ? pick(divs2) : 1;
                            answer = mid / ee;
                            expression = `(${aa} + ${bb}) \u00d7 ${cc} \u00f7 ${ee}`;
                            steps = [`Parentheses: ${aa} + ${bb} = ${inner}`, `Multiply: ${inner} \u00d7 ${cc} = ${mid}`, `Divide: ${mid} \u00f7 ${ee} = ${answer}`];
                            hint = "Parentheses first, then multiply/divide left to right.";
                        }
                    } else {
                        // Simpler fallback
                        const aa = rng(2, 8), bb = rng(2, 8), cc = rng(2, 6), dd = rng(2, 5);
                        expression = `[${aa} + ${bb}] \u00d7 [${cc} + ${dd}]`;
                        answer = (aa + bb) * (cc + dd);
                        steps = [`First bracket: ${aa} + ${bb} = ${aa + bb}`, `Second bracket: ${cc} + ${dd} = ${cc + dd}`, `Multiply: ${aa + bb} \u00d7 ${cc + dd} = ${answer}`];
                        hint = "Evaluate each bracket first, then multiply.";
                    }
                } else if (pattern === "a*[bd(c-d)-e]*f") {
                    // a × [b ÷ (c − d) − e] × f
                    const d = rng(2, 8);
                    const c = rng(d + 2, d + 10);
                    const diff = c - d;
                    const b = diff * rng(2, 6);
                    const quotient = b / diff;
                    const e = rng(1, Math.max(1, quotient - 1));
                    const bracketVal = quotient - e;
                    const a = rng(2, 6);
                    const f = rng(2, 6);
                    answer = a * bracketVal * f;
                    expression = `${a} \u00d7 [${b} \u00f7 (${c} \u2212 ${d}) \u2212 ${e}] \u00d7 ${f}`;
                    steps = [
                        `Innermost parentheses: ${c} \u2212 ${d} = ${diff}`,
                        `Divide: ${b} \u00f7 ${diff} = ${quotient}`,
                        `Subtract in brackets: ${quotient} \u2212 ${e} = ${bracketVal}`,
                        `Multiply left: ${a} \u00d7 ${bracketVal} = ${a * bracketVal}`,
                        `Multiply right: ${a * bracketVal} \u00d7 ${f} = ${answer}`
                    ];
                    hint = "Innermost parentheses first, then brackets, then multiply left to right.";
                } else if (pattern === "(a*b+c)d[(d+e)*f]") {
                    // (a × b + c) ÷ [(d + e) × f]
                    const d = rng(2, 6);
                    const e = rng(2, 6);
                    const f = rng(2, 5);
                    const rightVal = (d + e) * f;
                    const mult = rng(1, 5);
                    const leftVal = rightVal * mult;
                    // Find a,b,c such that a*b+c = leftVal
                    const aa = rng(2, 8);
                    const bb = rng(2, Math.max(2, Math.floor(leftVal / aa)));
                    const cc = leftVal - (aa * bb);
                    if (cc >= 0 && cc < 100) {
                        answer = mult;
                        expression = `(${aa} \u00d7 ${bb} + ${cc}) \u00f7 [(${d} + ${e}) \u00d7 ${f}]`;
                        steps = [
                            `Left multiply: ${aa} \u00d7 ${bb} = ${aa * bb}`,
                            `Left add: ${aa * bb} + ${cc} = ${leftVal}`,
                            `Right parentheses: ${d} + ${e} = ${d + e}`,
                            `Right multiply: ${d + e} \u00d7 ${f} = ${rightVal}`,
                            `Divide: ${leftVal} \u00f7 ${rightVal} = ${answer}`
                        ];
                        hint = "Evaluate each group, then divide.";
                    } else {
                        // Fallback
                        const x = rng(2, 6), y = rng(2, 6), z = rng(2, 5);
                        expression = `(${x} + ${y}) \u00d7 ${z}`;
                        answer = (x + y) * z;
                        steps = [`Parentheses: ${x} + ${y} = ${x + y}`, `Multiply: ${x + y} \u00d7 ${z} = ${answer}`];
                        hint = "Parentheses first, then multiply.";
                    }
                } else {
                    // a × [b + (c × d)] ÷ e + f
                    const c = rng(2, 6);
                    const d = rng(2, 5);
                    const prod = c * d;
                    const b = rng(2, 15);
                    const bracketVal = b + prod;
                    const e = rng(2, 8);
                    // Ensure clean division
                    const adjusted = Math.ceil(bracketVal / e) * e;
                    const bAdj = adjusted - prod;
                    if (bAdj >= 1) {
                        const a = rng(2, 5);
                        const f = rng(1, 15);
                        const divResult = (bAdj + prod) / e;
                        answer = a * divResult + f;
                        expression = `${a} \u00d7 [${bAdj} + (${c} \u00d7 ${d})] \u00f7 ${e} + ${f}`;
                        steps = [
                            `Inner parentheses: ${c} \u00d7 ${d} = ${prod}`,
                            `Brackets: ${bAdj} + ${prod} = ${bAdj + prod}`,
                            `Multiply: ${a} \u00d7 ${bAdj + prod} = ${a * (bAdj + prod)}`,
                            `Divide: ${a * (bAdj + prod)} \u00f7 ${e} = ${a * divResult}`,
                            `Add: ${a * divResult} + ${f} = ${answer}`
                        ];
                        hint = "Inner parentheses → brackets → multiply/divide → add.";
                    } else {
                        // Simple fallback
                        const x = rng(2, 6), y = rng(2, 6), z = rng(2, 5);
                        expression = `[${x} + ${y}] \u00d7 ${z}`;
                        answer = (x + y) * z;
                        steps = [`Brackets: ${x} + ${y} = ${x + y}`, `Multiply: ${x + y} \u00d7 ${z} = ${answer}`];
                        hint = "Brackets first, then multiply.";
                    }
                }

                q.text = `${expression} = ?`;
                q.ans = answer;
                q.hint = hint;
                q.options = buildNumericOptions(answer);
                q.printFormat = "order-of-ops";
                q.skillLabel = "Nested";
                q.oooSteps = steps;
                return;
            } else if (ooSkill === "exponents_simple") {
                // Level 7: Simple exponents
                const pattern = pick(["a^2", "a^2+b", "a^2-b", "a^3"]);

                if (pattern === "a^2") {
                    const a = safeNum(2, 12);
                    expression = `${a}\u00b2`;
                    answer = a * a;
                    steps = [`${a}\u00b2 means ${a} \u00d7 ${a}`, `${a} \u00d7 ${a} = ${answer}`];
                    hint = "The small 2 means multiply the number by itself!";
                } else if (pattern === "a^2+b") {
                    const a = safeNum(2, 10);
                    const b = safeNum(1, 20);
                    expression = `${a}\u00b2 + ${b}`;
                    answer = (a * a) + b;
                    steps = [`First: ${a}\u00b2 = ${a} \u00d7 ${a} = ${a * a}`, `Then: ${a * a} + ${b} = ${answer}`];
                    hint = "Exponents before addition!";
                } else if (pattern === "a^2-b") {
                    const a = safeNum(3, 10);
                    const b = safeNum(1, Math.min(a * a - 1, 15));
                    expression = `${a}\u00b2 - ${b}`;
                    answer = (a * a) - b;
                    steps = [`First: ${a}\u00b2 = ${a} \u00d7 ${a} = ${a * a}`, `Then: ${a * a} - ${b} = ${answer}`];
                    hint = "Exponents before subtraction!";
                } else {
                    const a = safeNum(2, 5);
                    expression = `${a}\u00b3`;
                    answer = a * a * a;
                    steps = [`${a}\u00b3 means ${a} \u00d7 ${a} \u00d7 ${a}`, `${a} \u00d7 ${a} = ${a * a}`, `${a * a} \u00d7 ${a} = ${answer}`];
                    hint = "The small 3 means multiply the number by itself 3 times!";
                }
            } else if (ooSkill === "compare_expressions" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-categorize variant — sort 4 comparison statements true/false
                const genCmpExpr = () => {
                    const type = pick(["a+b*c", "a*b-c", "a+b/c", "a*b+c"]);
                    if (type === "a+b*c") {
                        const aa = rng(1, 12), bb = rng(2, 8), cc = rng(2, 6);
                        return { expr: `${aa} + ${bb} × ${cc}`, val: aa + bb * cc };
                    } else if (type === "a*b-c") {
                        const aa = rng(2, 8), bb = rng(2, 6), cc = rng(1, Math.max(1, aa * bb - 1));
                        return { expr: `${aa} × ${bb} − ${cc}`, val: aa * bb - cc };
                    } else if (type === "a+b/c") {
                        const cc = rng(2, 8), bb = cc * rng(1, 6), aa = rng(1, 15);
                        return { expr: `${aa} + ${bb} ÷ ${cc}`, val: aa + bb / cc };
                    } else {
                        const aa = rng(2, 8), bb = rng(2, 6), cc = rng(1, 15);
                        return { expr: `${aa} × ${bb} + ${cc}`, val: aa * bb + cc };
                    }
                };
                const stmts = [];
                let safety = 0;
                while (stmts.length < 4 && safety < 80) {
                    safety++;
                    const L = genCmpExpr();
                    const R = genCmpExpr();
                    const sym = pick(['<', '>', '=']);
                    let actuallyTrue;
                    if (sym === '<') actuallyTrue = L.val < R.val;
                    else if (sym === '>') actuallyTrue = L.val > R.val;
                    else actuallyTrue = L.val === R.val;
                    stmts.push({ label: `${L.expr} ${sym} ${R.expr}`, isTrue: actuallyTrue });
                }
                // Ensure at least 1 true and 1 false
                const trues = stmts.filter(s => s.isTrue).length;
                if (trues === 0) stmts[0].isTrue = true;
                else if (trues === 4) stmts[0].isTrue = false;
                const tilesArr = shuffle(stmts);
                const tiles = tilesArr.map((s, i) => ({ id: 't' + i, label: s.label }));
                const ans = {};
                tilesArr.forEach((s, i) => { ans['t' + i] = s.isTrue ? 'binTrue' : 'binFalse'; });
                q.text = `Evaluate each side and drag each statement into the correct bin.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'categorize';
                q.tiles = tiles;
                q.bins = [
                    { id: 'binTrue', label: 'True' },
                    { id: 'binFalse', label: 'False' }
                ];
                q.hint = `Apply order of operations to each side, then compare.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Compare';
                return;
            } else if (ooSkill === "compare_expressions") {
                // Compare two OoO expressions with =, ≠, <, >
                // e.g., 2×3+5 □ 6÷2+5 → answer is = or ≠ or < or >
                const genExpr = () => {
                    // Generate a random 2-3 operation expression and compute its value
                    const type = pick(["a+b*c", "a*b-c", "a+b/c", "a*b+c"]);
                    let expr, val;
                    if (type === "a+b*c") {
                        const aa = rng(1, 12), bb = rng(2, 8), cc = rng(2, 6);
                        expr = `${aa} + ${bb} \u00d7 ${cc}`;
                        val = aa + bb * cc;
                    } else if (type === "a*b-c") {
                        const aa = rng(2, 8), bb = rng(2, 6), cc = rng(1, Math.max(1, aa * bb - 1));
                        expr = `${aa} \u00d7 ${bb} \u2212 ${cc}`;
                        val = aa * bb - cc;
                    } else if (type === "a+b/c") {
                        const cc = rng(2, 8), bb = cc * rng(1, 6), aa = rng(1, 15);
                        expr = `${aa} + ${bb} \u00f7 ${cc}`;
                        val = aa + bb / cc;
                    } else {
                        const aa = rng(2, 8), bb = rng(2, 6), cc = rng(1, 15);
                        expr = `${aa} \u00d7 ${bb} + ${cc}`;
                        val = aa * bb + cc;
                    }
                    return { expr, val };
                };

                const left = genExpr();
                const right = genExpr();
                const leftVal = left.val;
                const rightVal = right.val;

                let symbol;
                if (leftVal === rightVal) symbol = '=';
                else if (leftVal < rightVal) symbol = '<';
                else symbol = '>';

                expression = `${left.expr}  \u25a1  ${right.expr}`;
                answer = symbol;
                q.text = `Compare: ${left.expr}  ◻  ${right.expr}`;
                q.ans = symbol;
                q.hint = `Evaluate each side first! Left = ${leftVal}, Right = ${rightVal}`;
                q.options = ['<', '>', '=', '\u2260'];
                q.answerType = 'multiple-choice';
                q.printFormat = "compare-expressions";
                q.skillLabel = "Compare";
                q.compareData = { leftExpr: left.expr, rightExpr: right.expr, leftVal, rightVal, symbol };
                q.oooSteps = [`Left: ${left.expr} = ${leftVal}`, `Right: ${right.expr} = ${rightVal}`, `${leftVal} ${symbol} ${rightVal}`];
                return;
            } else if (ooSkill === "exponents_mixed") {
                // Level 8: Exponents with operations
                const pattern = pick(["a^2+b*c", "a*b^2", "(a+b)^2", "a^2-b^2"]);

                if (pattern === "a^2+b*c") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 6);
                    const c = safeNum(2, 6);
                    expression = `${a}\u00b2 + ${b} \u00d7 ${c}`;
                    answer = (a * a) + (b * c);
                    steps = [`First exponent: ${a}\u00b2 = ${a * a}`, `Then multiply: ${b} \u00d7 ${c} = ${b * c}`, `Finally add: ${a * a} + ${b * c} = ${answer}`];
                    hint = "Exponents and multiplication before addition!";
                } else if (pattern === "a*b^2") {
                    const a = safeNum(2, 6);
                    const b = safeNum(2, 8);
                    expression = `${a} \u00d7 ${b}\u00b2`;
                    answer = a * (b * b);
                    steps = [`First exponent: ${b}\u00b2 = ${b * b}`, `Then multiply: ${a} \u00d7 ${b * b} = ${answer}`];
                    hint = "Exponent first, then multiply!";
                } else if (pattern === "(a+b)^2") {
                    const a = safeNum(2, 6);
                    const b = safeNum(2, 6);
                    expression = `(${a} + ${b})\u00b2`;
                    answer = (a + b) * (a + b);
                    steps = [`First (parentheses): ${a} + ${b} = ${a + b}`, `Then square: ${a + b}\u00b2 = ${a + b} \u00d7 ${a + b} = ${answer}`];
                    hint = "Parentheses first, then apply the exponent!";
                } else {
                    const a = safeNum(4, 10);
                    const b = safeNum(2, a - 1);
                    expression = `${a}\u00b2 - ${b}\u00b2`;
                    answer = (a * a) - (b * b);
                    steps = [`First: ${a}\u00b2 = ${a * a}`, `Then: ${b}\u00b2 = ${b * b}`, `Finally: ${a * a} - ${b * b} = ${answer}`];
                    hint = "Calculate both squares, then subtract!";
                }
            } else {
                // Level 7: Full PEMDAS challenge
                const pattern = pick(["(a+b)^2-c*d", "a^2+(b+c)*d", "(a*b+c)^2", "a^2+b^2-c"]);

                if (pattern === "(a+b)^2-c*d") {
                    const a = safeNum(2, 5);
                    const b = safeNum(2, 5);
                    const c = safeNum(2, 5);
                    const d = safeNum(2, 5);
                    const squared = (a + b) * (a + b);
                    const product = c * d;
                    if (squared > product) {
                        expression = `(${a} + ${b})\u00b2 - ${c} \u00d7 ${d}`;
                        answer = squared - product;
                        steps = [`Parentheses: ${a} + ${b} = ${a + b}`, `Exponent: ${a + b}\u00b2 = ${squared}`, `Multiply: ${c} \u00d7 ${d} = ${product}`, `Subtract: ${squared} - ${product} = ${answer}`];
                    } else {
                        expression = `(${a} + ${b})\u00b2 + ${c} \u00d7 ${d}`;
                        answer = squared + product;
                        steps = [`Parentheses: ${a} + ${b} = ${a + b}`, `Exponent: ${a + b}\u00b2 = ${squared}`, `Multiply: ${c} \u00d7 ${d} = ${product}`, `Add: ${squared} + ${product} = ${answer}`];
                    }
                    hint = "PEMDAS: Parentheses \u2192 Exponents \u2192 Multiply \u2192 Add/Subtract";
                } else if (pattern === "a^2+(b+c)*d") {
                    const a = safeNum(3, 8);
                    const b = safeNum(2, 6);
                    const c = safeNum(2, 6);
                    const d = safeNum(2, 5);
                    expression = `${a}\u00b2 + (${b} + ${c}) \u00d7 ${d}`;
                    answer = (a * a) + (b + c) * d;
                    steps = [`Exponent: ${a}\u00b2 = ${a * a}`, `Parentheses: ${b} + ${c} = ${b + c}`, `Multiply: ${b + c} \u00d7 ${d} = ${(b + c) * d}`, `Add: ${a * a} + ${(b + c) * d} = ${answer}`];
                    hint = "Handle exponents and parentheses first!";
                } else if (pattern === "(a*b+c)^2") {
                    const a = safeNum(2, 4);
                    const b = safeNum(2, 4);
                    const c = safeNum(1, 5);
                    const inside = a * b + c;
                    expression = `(${a} \u00d7 ${b} + ${c})\u00b2`;
                    answer = inside * inside;
                    steps = [`Inside parentheses - multiply: ${a} \u00d7 ${b} = ${a * b}`, `Inside parentheses - add: ${a * b} + ${c} = ${inside}`, `Square the result: ${inside}\u00b2 = ${answer}`];
                    hint = "Solve inside the parentheses first, then square!";
                } else {
                    const a = safeNum(4, 10);
                    const b = safeNum(2, 6);
                    const c = safeNum(1, 15);
                    expression = `${a}\u00b2 + ${b}\u00b2 - ${c}`;
                    answer = (a * a) + (b * b) - c;
                    steps = [`First: ${a}\u00b2 = ${a * a}`, `Then: ${b}\u00b2 = ${b * b}`, `Add: ${a * a} + ${b * b} = ${a * a + b * b}`, `Subtract: ${a * a + b * b} - ${c} = ${answer}`];
                    hint = "Calculate both exponents first!";
                }
            }

            q.text = `${expression} = ?`;
            q.ans = answer;
            q.hint = hint;
            q.oooSteps = steps;
            q.printFormat = "order-of-ops";

            // Create visual with step-by-step breakdown
            const stepsHTML = steps.map((s, i) => `<div style="margin: 5px 0;"><strong>Step ${i + 1}:</strong> ${s}</div>`).join('');
            q.hintVisual = `<div style="text-align:left;font-size:0.9rem;padding:10px;background:rgba(255,255,255,0.1);border-radius:8px;">
                <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">PEMDAS Steps:</div>
                ${stepsHTML}
            </div>`;

            q.options = buildNumericOptions(answer);
            return;
}

export function generatePatternsQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;
            const start = rng(1, range);
            // allowRuleQ: only true for mixed patterns, not specific ones like seq_2, seq_5, etc.
            const patternQ = (step, allowRuleQ = false) => {
                const seq = [start, start + step, start + step * 2, start + step * 3];

                // Only ask for rule identification when it's a mixed pattern (50% chance)
                const askForRule = allowRuleQ && Math.random() < 0.5;

                if (askForRule) {
                    // Rule identification question
                    const isAdd = step > 0;
                    const absStep = Math.abs(step);
                    const ruleText = isAdd ? `Add ${absStep.toLocaleString()}` : `Subtract ${absStep.toLocaleString()}`;

                    q.text = `What is the rule? ${seq[0].toLocaleString()}, ${seq[1].toLocaleString()}, ${seq[2].toLocaleString()}, ${seq[3].toLocaleString()}`;
                    q.answerType = "text";
                    q.ans = ruleText;
                    q.hint = `Look at how each number changes. Is it getting bigger (add) or smaller (subtract)? By how much?`;

                    // Generate wrong answers
                    const wrongRules = [];
                    // Wrong operation
                    wrongRules.push(isAdd ? `Subtract ${absStep.toLocaleString()}` : `Add ${absStep.toLocaleString()}`);
                    // Wrong step amount
                    wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${(absStep + 1).toLocaleString()}`);
                    if (absStep > 1) {
                        wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${(absStep - 1).toLocaleString()}`);
                    } else {
                        wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${(absStep + 2).toLocaleString()}`);
                    }

                    q.options = shuffle([q.ans, ...wrongRules.slice(0, 3)]);

                    // Visual showing the sequence with question marks for the rule
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">\ud83d\udd0d Find the Rule</div>
                        <div style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;font-weight:700;">
                            <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[0].toLocaleString()}</span>
                            <span style="background:var(--accent-orange);color:white;padding:6px 12px;border-radius:8px;font-size:0.9rem;">?</span>
                            <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[1].toLocaleString()}</span>
                            <span style="background:var(--accent-orange);color:white;padding:6px 12px;border-radius:8px;font-size:0.9rem;">?</span>
                            <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[2].toLocaleString()}</span>
                            <span style="background:var(--accent-orange);color:white;padding:6px 12px;border-radius:8px;font-size:0.9rem;">?</span>
                            <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[3].toLocaleString()}</span>
                        </div>
                        <div style="margin-top:15px;font-size:0.9rem;color:var(--text-secondary);">Is the pattern <strong>Add</strong> or <strong>Subtract</strong>? By how much?</div>
                    </div>`;
                } else {
                    // Ask for a missing number at any position (1st, 2nd, 3rd, or 4th)
                    const missingPos = Math.floor(Math.random() * 4); // 0, 1, 2, or 3
                    q.ans = seq[missingPos];
                    q.hint = `Each number ${step > 0 ? "increases" : "decreases"} by ${Math.abs(step).toLocaleString()}. Pattern: ${step > 0 ? '+' : '\u2212'}${Math.abs(step).toLocaleString()}`;

                    // Build sequence display with ___ at the missing position
                    const seqDisplay = seq.map((n, i) => i === missingPos ? '___' : n.toLocaleString());
                    q.text = `Complete: ${seqDisplay.join(', ')}`;

                    const arrow = step > 0 ? `+${Math.abs(step).toLocaleString()}\u2192` : `\u2212${Math.abs(step).toLocaleString()}\u2192`;
                    const posLabels = ['1st', '2nd', '3rd', '4th'];
                    q.visual = `<div style="text-align:center;">
                        <div style="margin-bottom:10px;font-size:0.9rem;color:var(--text-secondary);">Find the <strong style="color:var(--accent-green);">${posLabels[missingPos]}</strong> number</div>
                        <div style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;font-weight:700;">
                        ${seq.map((n, i) => {
                            if (i === missingPos) {
                                return `<span style="background:var(--bg-card-light);border:3px dashed var(--accent-green);color:var(--accent-green);padding:8px 14px;border-radius:10px;min-width:40px;text-align:center;">___</span>`;
                            } else {
                                return `<span style="background:var(--accent-cyan);color:white;padding:8px 14px;border-radius:10px;">${n.toLocaleString()}</span>`;
                            }
                        }).join(`<span style="color:var(--accent-orange);">${arrow}</span>`)}
                        </div>
                    </div>`;
                }
            };
            // For mixed, pick a random skill from patterns (including doubling/halving)
            let patternSkill = mappedSkill;
            if (mappedSkill === "mixed") {
                patternSkill = pick(["seq_2", "seq_5", "seq_10", "seq_100", "count_by_fill", "plus_minus_10", "plus_minus_100", "random_step", "identify_rule", "next_three", "function_table_easy", "function_table_hard", "double", "halve", "shape_pattern", "number_pattern", "skip_count_line", "skip_count_grid", "pattern_relationship"]);
            } else if (mappedSkill === "mixed_double_halve") {
                patternSkill = pick(["double", "halve"]);
            }

            // Phase 4.5 batch 2: dnd-order modernization for sequence/skip-count skills
            if ((patternSkill === "seq_2" || patternSkill === "seq_5" || patternSkill === "seq_10" || patternSkill === "count_by_fill" || patternSkill === "number_pattern") && Math.random() < 0.30) {
                let step;
                let labelStr;
                if (patternSkill === "seq_2") { step = 2; labelStr = "Skip Count by 2s"; }
                else if (patternSkill === "seq_5") { step = 5; labelStr = "Skip Count by 5s"; }
                else if (patternSkill === "seq_10") { step = 10; labelStr = "Skip Count by 10s"; }
                else if (patternSkill === "count_by_fill") {
                    step = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                    labelStr = `Count by ${step}s`;
                } else {
                    // number_pattern — pick step in line with original logic
                    let stepOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10];
                    if (range >= 100) stepOptions.push(15, 20, 25);
                    if (range >= 500) stepOptions.push(50);
                    step = pick(stepOptions);
                    labelStr = "Number Pattern";
                }
                const tileCount = pick([4, 5]);
                const maxStart = Math.max(1, Math.min(range - step * (tileCount + 1), Math.floor(range / 2)));
                const start = rng(1, Math.max(1, maxStart));
                const terms = Array.from({ length: tileCount }, (_, i) => start + step * i);
                const direction = pick(["asc", "desc"]);
                const sortedTerms = direction === "asc" ? [...terms] : [...terms].reverse();
                const presentation = shuffle(terms.map((t, i) => ({ id: 't' + i, label: String(t), val: t })));
                const ans = sortedTerms.map(v => presentation.find(t => t.val === v).id);
                q.text = `Drag the numbers in ${direction === "asc" ? "counting" : "reverse counting"} order.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                q.tiles = presentation.map(({ id, label }) => ({ id, label }));
                q.orderLabel = direction === "asc" ? `counting up by ${step}s` : `counting down by ${step}s`;
                q.hint = `Each step ${direction === "asc" ? "adds" : "subtracts"} ${step}.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = labelStr;
                return;
            }
            // Phase 4.5 batch 2: dnd-order for pattern_relationship — drag corresponding output values
            if (patternSkill === "pattern_relationship" && Math.random() < 0.30) {
                const factor = pick([2, 3, 4, 5, 10]);
                const startA = rng(1, 5);
                const seqA = Array.from({ length: 4 }, (_, i) => startA + i);
                const seqB = seqA.map(x => x * factor);
                const presentation = shuffle(seqB.map((v, i) => ({ id: 't' + i, label: String(v), val: v })));
                const sortedB = [...seqB].sort((a, b) => a - b);
                const ans = sortedB.map(v => presentation.find(t => t.val === v).id);
                q.text = `Pattern A is ${seqA.join(', ')}. Drag Pattern B values in the matching order (smallest first).`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                q.tiles = presentation.map(({ id, label }) => ({ id, label }));
                q.orderLabel = `B values, smallest to largest`;
                q.hint = `Pattern B is each Pattern A value × ${factor}.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Pattern Relationship';
                return;
            }
            // Phase 4.5 batch 2: dnd-categorize for function_table — sort 4-5 input/output pairs by "follows rule"
            if ((patternSkill === "function_table_easy" || patternSkill === "function_table_hard") && Math.random() < 0.30) {
                const ftRules = [
                    { name: 'Add 5', fn: x => x + 5 },
                    { name: 'Add 10', fn: x => x + 10 },
                    { name: 'Subtract 3', fn: x => x - 3 },
                    { name: 'Multiply by 2', fn: x => x * 2 },
                    { name: 'Multiply by 3', fn: x => x * 3 },
                    { name: 'Multiply by 4', fn: x => x * 4 }
                ];
                const rule = pick(ftRules);
                const totalCount = patternSkill === "function_table_hard" ? pick([5, 6]) : pick([4, 5]);
                const inputs = [];
                const seenIn = new Set();
                let safety = 0;
                while (inputs.length < totalCount && safety < 100) {
                    safety++;
                    const v = rng(2, Math.min(20, Math.max(10, Math.floor(range / 5))));
                    if (!seenIn.has(v)) { seenIn.add(v); inputs.push(v); }
                }
                const correctCount = Math.max(2, Math.floor(totalCount / 2));
                const correctIdx = new Set(shuffle(inputs.map((_, i) => i)).slice(0, correctCount));
                const pairs = inputs.map((inVal, i) => {
                    const isCorrect = correctIdx.has(i);
                    const outVal = isCorrect ? rule.fn(inVal) : rule.fn(inVal) + pick([1, -1, 2, -2]);
                    return { inVal, outVal, isCorrect };
                });
                const tilesArr = shuffle(pairs);
                const tiles = tilesArr.map((p, i) => ({ id: 't' + i, label: `${p.inVal} → ${p.outVal}` }));
                const ans = {};
                tilesArr.forEach((p, i) => { ans['t' + i] = p.isCorrect ? 'binYes' : 'binNo'; });
                q.text = `The rule is "${rule.name}". Drag each pair into the correct bin.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'categorize';
                q.tiles = tiles;
                q.bins = [
                    { id: 'binYes', label: 'Follows the rule' },
                    { id: 'binNo', label: 'Does NOT follow the rule' }
                ];
                q.hint = `Apply "${rule.name}" to each input. If the output matches, it follows the rule.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = patternSkill === "function_table_hard" ? 'Function Table' : 'Function Table';
                return;
            }

            if (patternSkill === "odd_even") {
                // Grade 2: Odd or Even — 3 problem types
                const maxNum = Math.max(10, Math.min(range, 100));
                q.skillLabel = 'Odd/Even';
                q.printFormat = 'odd-even';

                const oeRoll = Math.random();
                let oeType;
                if (oeRoll < 0.40) oeType = 'single';      // Type 1: Is N odd or even? (40%)
                else if (oeRoll < 0.70) oeType = 'select';  // Type 2: Select all odd/even from 5 (30%)
                else oeType = 'which';                       // Type 3: Which of 3 is odd/even? (30%)

                if (oeType === 'single') {
                    // Type 1: Classic — Is this number odd or even?
                    const num = rng(1, maxNum);
                    const isEven = num % 2 === 0;
                    q.text = `Is ${num} odd or even?`;
                    q.ans = isEven ? "Even" : "Odd";
                    q.answerType = "multiple-choice";
                    q.options = ["Odd", "Even"];
                    q.hint = `If a number can be split into two equal groups with nothing left over, it's even. Otherwise it's odd.`;

                    // Visual: paired circles
                    const pairCount = Math.floor(num / 2);
                    const hasLeftover = num % 2 !== 0;
                    const showPairs = Math.min(pairCount, 10);
                    const showLeftover = hasLeftover && pairCount <= 10;
                    const truncated = pairCount > 10;

                    let circleRows = '';
                    for (let i = 0; i < showPairs; i++) {
                        circleRows += `<div style="display:flex;gap:4px;">
                            <div style="width:20px;height:20px;border-radius:50%;background:var(--accent-cyan);border:2px solid rgba(255,255,255,0.3);"></div>
                            <div style="width:20px;height:20px;border-radius:50%;background:var(--accent-cyan);border:2px solid rgba(255,255,255,0.3);"></div>
                        </div>`;
                    }
                    if (showLeftover) {
                        circleRows += `<div style="display:flex;gap:4px;">
                            <div style="width:20px;height:20px;border-radius:50%;background:var(--accent-orange);border:2px solid rgba(255,255,255,0.3);"></div>
                            <div style="width:20px;height:20px;border-radius:50%;border:2px dashed var(--text-dim);opacity:0.3;"></div>
                        </div>`;
                    }

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Odd or Even?</div>
                        <div style="font-size:2rem;font-weight:800;margin-bottom:12px;color:var(--text-bright);">${num}</div>
                        <div style="display:inline-flex;flex-direction:column;gap:4px;align-items:center;padding:12px 20px;background:var(--bg-card);border-radius:12px;">
                            ${circleRows}
                            ${truncated ? `<div style="font-size:0.8rem;color:var(--text-dim);margin-top:4px;">... (${pairCount} pairs${hasLeftover ? ' + 1 left over' : ''})</div>` : ''}
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-dim);">
                            ${isEven ? 'All circles are paired!' : 'One circle has no partner!'}
                        </div>
                    </div>`;

                } else if (oeType === 'select') {
                    // Type 2: Select all odd/even numbers from a list of 5
                    const targetType = pick(["odd", "even"]);
                    const targetCount = rng(2, 4); // 2-4 numbers match
                    const nonTargetCount = 5 - targetCount;

                    // Generate numbers ensuring exact target/non-target split
                    const targetNums = [];
                    const nonTargetNums = [];
                    while (targetNums.length < targetCount) {
                        const n = rng(1, maxNum);
                        const fits = targetType === "even" ? n % 2 === 0 : n % 2 !== 0;
                        if (fits && !targetNums.includes(n)) targetNums.push(n);
                    }
                    while (nonTargetNums.length < nonTargetCount) {
                        const n = rng(1, maxNum);
                        const fits = targetType === "even" ? n % 2 !== 0 : n % 2 === 0;
                        if (fits && !nonTargetNums.includes(n) && !targetNums.includes(n)) nonTargetNums.push(n);
                    }

                    // Shuffle all 5 numbers together
                    const allNums = shuffle([...targetNums, ...nonTargetNums]);
                    // Store correct indices (which positions are targets)
                    const correctIndices = [];
                    allNums.forEach((n, i) => {
                        const isTarget = targetType === "even" ? n % 2 === 0 : n % 2 !== 0;
                        if (isTarget) correctIndices.push(i);
                    });

                    q.text = `Click all the ${targetType.toUpperCase()} numbers.`;
                    q.ans = correctIndices.join(',');
                    q.answerType = "odd-even-select";
                    q.oeNumbers = allNums;
                    q.oeTarget = targetType;
                    q.oeCorrectIndices = correctIndices;
                    q.hint = `${targetType === "even" ? "Even" : "Odd"} numbers ${targetType === "even" ? "can be divided by 2 with no remainder (end in 0, 2, 4, 6, 8)" : "have a remainder of 1 when divided by 2 (end in 1, 3, 5, 7, 9)"}.`;

                    const boxes = allNums.map((n, i) =>
                        `<div class="oe-num-box" id="oeBox${i}" onclick="selectOddEvenNumber(${i})" style="width:60px;height:60px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:800;border-radius:12px;border:3px solid var(--text-dim);background:var(--bg-card);color:var(--text-bright);cursor:pointer;transition:all 0.2s;user-select:none;">${n}</div>`
                    ).join('');

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Select the ${targetType === "even" ? "Even" : "Odd"} Numbers</div>
                        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:16px 0;">
                            ${boxes}
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-dim);">Click each ${targetType} number, then check your answer.</div>
                        <button class="btn btn-primary" id="checkOddEvenBtn" onclick="checkOddEvenSelection()" style="margin-top:12px;">Check Answer</button>
                    </div>`;

                } else {
                    // Type 3: Which of these 3 numbers is odd/even?
                    const targetType = pick(["odd", "even"]);
                    // Generate 1 target and 2 non-targets
                    let target;
                    do { target = rng(1, maxNum); } while ((targetType === "even") !== (target % 2 === 0));
                    const others = [];
                    while (others.length < 2) {
                        const n = rng(1, maxNum);
                        const isTarget = targetType === "even" ? n % 2 === 0 : n % 2 !== 0;
                        if (!isTarget && n !== target && !others.includes(n)) others.push(n);
                    }
                    const choices = shuffle([target, ...others]);

                    q.text = `Which number is ${targetType}?`;
                    q.ans = String(target);
                    q.answerType = "multiple-choice";
                    q.options = choices.map(String);
                    q.hint = `${targetType === "even" ? "Even" : "Odd"} numbers end in ${targetType === "even" ? "0, 2, 4, 6, or 8" : "1, 3, 5, 7, or 9"}.`;

                    const numBoxes = choices.map(n => {
                        const isE = n % 2 === 0;
                        return `<div style="text-align:center;">
                            <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;border-radius:12px;border:3px solid var(--text-dim);background:var(--bg-card);color:var(--text-bright);">${n}</div>
                            <div style="font-size:0.7rem;color:var(--text-dim);margin-top:4px;">${isE ? 'ends in ' + (n % 10) : 'ends in ' + (n % 10)}</div>
                        </div>`;
                    }).join('');

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Which is ${targetType === "even" ? "Even" : "Odd"}?</div>
                        <div style="display:flex;justify-content:center;gap:16px;margin:12px 0;">
                            ${numBoxes}
                        </div>
                    </div>`;
                }
                return;
            } else if (patternSkill === "pattern_relationship") {
                // Grade 5: Two patterns, find the relationship
                const multipliers = [2, 3, 4, 5, 6, 10];
                const addends = [3, 5, 7, 10, 12, 15, 20];
                const relType = pick(["multiply", "add"]);
                let factor, seqA, seqB, correctAnswer, wrongAnswers;

                if (relType === "multiply") {
                    factor = pick(multipliers);
                    const startA = rng(0, 4);
                    seqA = Array.from({length: 5}, (_, i) => startA + i);
                    seqB = seqA.map(x => x * factor);
                    correctAnswer = `Multiply by ${factor}`;
                    wrongAnswers = [
                        `Add ${factor}`,
                        `Multiply by ${factor + 1}`,
                        `Multiply by ${Math.max(2, factor - 1)}`
                    ];
                } else {
                    factor = pick(addends);
                    const startA = rng(1, Math.min(10, Math.max(1, Math.floor(range / 10))));
                    seqA = Array.from({length: 5}, (_, i) => startA + i * rng(1, 3));
                    // Ensure ascending with consistent step for sequence A
                    const stepA = rng(1, 3);
                    seqA = Array.from({length: 5}, (_, i) => startA + i * stepA);
                    seqB = seqA.map(x => x + factor);
                    correctAnswer = `Add ${factor}`;
                    wrongAnswers = [
                        `Multiply by ${factor}`,
                        `Add ${factor + 1}`,
                        `Add ${Math.max(1, factor - 1)}`
                    ];
                }

                q.text = `Look at the two patterns. How do you get from Pattern A to Pattern B?`;
                q.ans = correctAnswer;
                q.answerType = "multiple-choice";
                q.options = shuffle([correctAnswer, ...wrongAnswers]);
                q.hint = `Compare each pair: ${seqA[0]} becomes ${seqB[0]}, ${seqA[1]} becomes ${seqB[1]}. What operation turns A into B?`;
                q.skillLabel = 'Pattern Relationship';

                // Two-column table visual
                const tableRows = seqA.map((a, i) => `<tr>
                    <td style="padding:8px 16px;border:2px solid var(--text-dim);text-align:center;font-weight:700;color:var(--accent-cyan);">${a}</td>
                    <td style="padding:8px 16px;border:2px solid var(--text-dim);text-align:center;font-weight:700;color:var(--accent-green);">${seqB[i]}</td>
                </tr>`).join('');

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.1rem;">Find the Relationship</div>
                    <table style="margin:0 auto;border-collapse:collapse;font-size:1.05rem;border:2px solid var(--text-dim);">
                        <tr>
                            <th style="padding:10px 20px;border:2px solid var(--text-dim);background:var(--accent-cyan);color:white;font-weight:800;">Pattern A</th>
                            <th style="padding:10px 20px;border:2px solid var(--text-dim);background:var(--accent-green);color:white;font-weight:800;">Pattern B</th>
                        </tr>
                        ${tableRows}
                    </table>
                    <div style="margin-top:12px;font-size:0.9rem;color:var(--text-dim);">A <span style="color:var(--accent-orange);font-weight:700;">?</span> = B</div>
                </div>`;
                return;
            } else if (patternSkill === "seq_2") patternQ(2);
            else if (patternSkill === "seq_5") patternQ(5);
            else if (patternSkill === "seq_10") patternQ(10);
            else if (patternSkill === "seq_100") patternQ(100);
            else if (patternSkill === "count_by_fill") {
                // Count-By Fill-In (1-12): Partially filled skip counting sequences
                const countBy = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                const sequenceLength = 12;
                const allNumbers = Array.from({length: sequenceLength}, (_, i) => countBy * (i + 1));

                // Determine how many to show (4-6 shown, rest hidden)
                const showCount = pick([4, 5, 6]);
                const showIndices = new Set();

                // Always show first one or two for context
                showIndices.add(0);
                if (Math.random() > 0.3) showIndices.add(1);

                // Add more random shown indices
                while (showIndices.size < showCount) {
                    showIndices.add(Math.floor(Math.random() * sequenceLength));
                }

                const sequence = allNumbers.map((val, i) => ({
                    value: val,
                    shown: showIndices.has(i),
                    position: i + 1
                }));

                const missingValues = sequence.filter(s => !s.shown).map(s => s.value);

                q.text = `Complete the count-by-${countBy}s sequence`;
                q.ans = missingValues.join(", ");
                q.answerType = "text";
                q.hint = `Skip count by ${countBy}: ${countBy}, ${countBy*2}, ${countBy*3}...`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">\ud83d\udd22 Count by ${countBy}s</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:15px;">Fill in the missing numbers in the sequence</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:15px auto;max-width:500px;">
                        ${sequence.map(s => s.shown
                            ? `<span style="padding:12px 16px;background:var(--accent-cyan);color:white;border-radius:8px;font-weight:700;font-size:1.1rem;min-width:45px;">${s.value}</span>`
                            : `<span style="padding:12px 16px;border:2px dashed var(--accent-orange);border-radius:8px;font-weight:600;min-width:45px;color:var(--accent-orange);">?</span>`
                        ).join('')}
                    </div>
                    <div style="margin-top:15px;font-size:0.85rem;color:var(--text-dim);">
                        Pattern: +${countBy} each time
                    </div>
                </div>`;

                q.patternData = { countBy, sequence, missingValues, type: 'count_by_fill' };
                q.printFormat = "pattern-count-by-fill";
            }
            else if (patternSkill === "identify_rule") {
                // Dedicated "Identify the Rule" skill - always asks for rule identification
                const stepOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                const absStep = pick(stepOptions);
                const isAdd = Math.random() > 0.4; // 60% add, 40% subtract
                const step = isAdd ? absStep : -absStep;

                // For subtraction, start higher to avoid negative numbers
                const ruleStart = isAdd ? rng(1, Math.min(range, 50)) : rng(absStep * 4, range);
                const seq = [ruleStart, ruleStart + step, ruleStart + step * 2, ruleStart + step * 3];

                const ruleText = isAdd ? `Add ${absStep}` : `Subtract ${absStep}`;

                q.text = `What is the rule? ${seq.map(n => n.toLocaleString()).join(", ")}`;
                q.answerType = "text";
                q.ans = ruleText;
                q.hint = `Look at how each number changes. Is it getting bigger (add) or smaller (subtract)? By how much?`;

                // Generate wrong answers
                const wrongRules = [];
                // Wrong operation
                wrongRules.push(isAdd ? `Subtract ${absStep}` : `Add ${absStep}`);
                // Wrong step amounts
                wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${absStep + 1}`);
                if (absStep > 1) {
                    wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${absStep - 1}`);
                } else {
                    wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${absStep + 2}`);
                }

                q.options = shuffle([q.ans, ...wrongRules.slice(0, 3)]);

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">\ud83d\udd0d Find the Rule</div>
                    <div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;font-weight:700;">
                        <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[0].toLocaleString()}</span>
                        <span style="background:var(--accent-orange);color:white;padding:6px 10px;border-radius:8px;font-size:0.85rem;">?</span>
                        <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[1].toLocaleString()}</span>
                        <span style="background:var(--accent-orange);color:white;padding:6px 10px;border-radius:8px;font-size:0.85rem;">?</span>
                        <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[2].toLocaleString()}</span>
                        <span style="background:var(--accent-orange);color:white;padding:6px 10px;border-radius:8px;font-size:0.85rem;">?</span>
                        <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[3].toLocaleString()}</span>
                    </div>
                    <div style="margin-top:15px;font-size:0.95rem;color:var(--text-secondary);">Is the pattern <strong style="color:var(--accent-green);">Add</strong> or <strong style="color:var(--accent-pink);">Subtract</strong>? By how much?</div>
                </div>`;
            } else if (patternSkill === "plus_minus_10") {
                const plus = Math.random() > 0.5;
                q.text = `${plus ? "Add" : "Subtract"} 10: ${start.toLocaleString()} \u2192 ?`;
                q.ans = start + (plus ? 10 : -10);
                q.hint = `Jump ${plus ? "forward" : "back"} 10 on the number line.`;
                const minVal = Math.min(start, q.ans) - 5;
                const maxVal = Math.max(start, q.ans) + 5;
                q.visual = `<div style="text-align:center;"><div style="font-weight:700;margin-bottom:30px;">${plus ? "Jump forward" : "Jump back"} 10</div>${createNumberLine(Math.max(0, minVal), maxVal, start, q.ans)}</div>`;
            } else if (patternSkill === "plus_minus_100") {
                const plus = Math.random() > 0.5;
                q.text = `${plus ? "Add" : "Subtract"} 100: ${start.toLocaleString()} \u2192 ?`;
                q.ans = start + (plus ? 100 : -100);
                q.hint = `Jump ${plus ? "forward" : "back"} 100. The hundreds digit changes!`;
                q.visual = `<div style="font-weight:700;font-size:1.3rem;">${start.toLocaleString()} <span style="color:var(--accent-orange);">${plus ? "+" : "\u2212"} 100</span> = <span style="color:var(--accent-green);">?</span></div>`;
            } else if (patternSkill === "next_three") {
                // Next 3 Numbers - give pattern, ask for next 3 OR identify the rule
                const baseStep = pick([2, 3, 4, 5, 10, 11, 12, 25, 50]);
                const isSubtract = Math.random() < 0.4; // 40% chance of subtraction pattern
                const step = isSubtract ? -baseStep : baseStep;

                // For subtraction, start higher to avoid negative numbers
                const minStart = isSubtract ? baseStep * 6 : 1;
                const maxStart = Math.min(range, isSubtract ? range : 100);
                const patternStart = rng(minStart, maxStart);

                const showSeq = [patternStart, patternStart + step, patternStart + step * 2];
                const nextThree = [patternStart + step * 3, patternStart + step * 4, patternStart + step * 5];

                // Only ask for rule identification when in mixed mode (40% chance)
                const askForRule = mappedSkill === "mixed" && Math.random() < 0.4;

                if (askForRule) {
                    // Rule identification variant
                    const absStep = Math.abs(step);
                    const ruleText = step > 0 ? `Add ${absStep.toLocaleString()}` : `Subtract ${absStep.toLocaleString()}`;

                    q.text = `What is the rule? ${showSeq.map(n => n.toLocaleString()).join(", ")}`;
                    q.answerType = "text";
                    q.ans = ruleText;
                    q.hint = `Look at how each number changes. Is it getting bigger (add) or smaller (subtract)? By how much?`;

                    // Generate wrong answers
                    const wrongRules = [];
                    wrongRules.push(step > 0 ? `Subtract ${absStep.toLocaleString()}` : `Add ${absStep.toLocaleString()}`);
                    wrongRules.push(`${step > 0 ? 'Add' : 'Subtract'} ${(absStep + 1).toLocaleString()}`);
                    if (absStep > 1) {
                        wrongRules.push(`${step > 0 ? 'Add' : 'Subtract'} ${(absStep - 1).toLocaleString()}`);
                    } else {
                        wrongRules.push(`${step > 0 ? 'Add' : 'Subtract'} ${(absStep + 2).toLocaleString()}`);
                    }

                    q.options = shuffle([q.ans, ...wrongRules.slice(0, 3)]);

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">\ud83d\udd0d Find the Rule</div>
                        <div style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;font-weight:700;">
                            ${showSeq.map(n => `<span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${n.toLocaleString()}</span>`).join('<span style="background:var(--accent-orange);color:white;padding:6px 12px;border-radius:8px;font-size:0.9rem;">?</span>')}
                        </div>
                        <div style="margin-top:15px;font-size:0.9rem;color:var(--text-secondary);">Is the pattern <strong>Add</strong> or <strong>Subtract</strong>? By how much?</div>
                    </div>`;
                } else {
                    // Original: ask for next 3 numbers
                    q.text = `What are the next 3 numbers? ${showSeq.map(n => n.toLocaleString()).join(", ")}, ___, ___, ___`;
                    q.answerType = "text";
                    q.ans = nextThree.map(n => n.toLocaleString()).join(", ");
                    q.hint = `Find the pattern: each number ${step > 0 ? 'increases' : 'decreases'} by ${Math.abs(step)}. ${step > 0 ? 'Add' : 'Subtract'} ${Math.abs(step)} three more times!`;

                    // Wrong answers with different patterns
                    const wrongs = new Set();
                    let patternAttempts = 0;
                    while (wrongs.size < 3 && patternAttempts < 30) {
                        patternAttempts++;
                        const wrongStep = step + pick([-2, -1, 1, 2, 3]);
                        if (wrongStep !== step && wrongStep !== 0) {
                            const wrongAns = [patternStart + wrongStep * 3, patternStart + wrongStep * 4, patternStart + wrongStep * 5];
                            if (wrongAns.every(n => n >= 0)) { // Avoid negative numbers
                                wrongs.add(wrongAns.map(n => n.toLocaleString()).join(", "));
                            }
                        }
                    }
                    q.options = shuffle([q.ans, ...wrongs]);

                    const arrow = step > 0 ? `+${Math.abs(step)}` : `\u2212${Math.abs(step)}`;
                    const blankBox = `<span style="background:var(--bg-card-light);border:3px dashed var(--accent-green);color:var(--accent-green);padding:10px 16px;border-radius:10px;min-width:40px;text-align:center;">___</span>`;
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;">Find the pattern:</div>
                        <div style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;font-weight:700;">
                            ${showSeq.map(n => `<span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${n.toLocaleString()}</span>`).join('<span style="color:var(--text-dim);">,</span>')}
                            <span style="color:var(--text-dim);">,</span>
                            ${blankBox}
                            <span style="color:var(--text-dim);">,</span>
                            ${blankBox}
                            <span style="color:var(--text-dim);">,</span>
                            ${blankBox}
                        </div>
                        <div style="margin-top:12px;font-size:0.9rem;color:var(--accent-orange);">${arrow} each time</div>
                    </div>`;
                }
            } else if (patternSkill === "function_table_easy" || patternSkill === "function_table_hard") {
                // Function Tables - vertical IN/OUT table with rule at bottom
                // Add/subtract amounts based on range: within 20, 25, 50, 100, 200
                let addSubRules = [];
                if (range <= 20) {
                    for (let n = 2; n <= 10; n++) addSubRules.push({ name: `Add ${n}`, fn: x => x + n, sub: n });
                    for (let n = 2; n <= 5; n++) addSubRules.push({ name: `Subtract ${n}`, fn: x => x - n, sub: n });
                } else if (range <= 50) {
                    for (let n = 2; n <= 20; n++) addSubRules.push({ name: `Add ${n}`, fn: x => x + n, sub: n });
                    for (let n = 2; n <= 15; n++) addSubRules.push({ name: `Subtract ${n}`, fn: x => x - n, sub: n });
                } else if (range <= 100) {
                    const addAmounts = [5, 7, 9, 10, 11, 12, 15, 18, 20, 25, 30, 35, 40, 45, 50];
                    const subAmounts = [5, 7, 10, 12, 15, 20, 25, 30];
                    addAmounts.forEach(n => addSubRules.push({ name: `Add ${n}`, fn: x => x + n, sub: n }));
                    subAmounts.forEach(n => addSubRules.push({ name: `Subtract ${n}`, fn: x => x - n, sub: n }));
                } else if (range <= 200) {
                    const addAmounts = [10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90, 100];
                    const subAmounts = [10, 15, 20, 25, 30, 40, 50];
                    addAmounts.forEach(n => addSubRules.push({ name: `Add ${n}`, fn: x => x + n, sub: n }));
                    subAmounts.forEach(n => addSubRules.push({ name: `Subtract ${n}`, fn: x => x - n, sub: n }));
                } else {
                    const addAmounts = [25, 50, 75, 100, 125, 150, 175, 200];
                    const subAmounts = [25, 50, 75, 100, 150];
                    addAmounts.forEach(n => addSubRules.push({ name: `Add ${n}`, fn: x => x + n, sub: n }));
                    subAmounts.forEach(n => addSubRules.push({ name: `Subtract ${n}`, fn: x => x - n, sub: n }));
                }

                // Add multiply rules for smaller ranges
                const multiplyRules = [];
                if (range <= 100) {
                    multiplyRules.push({ name: "Multiply by 2", fn: x => x * 2 });
                    multiplyRules.push({ name: "Multiply by 3", fn: x => x * 3 });
                    multiplyRules.push({ name: "Multiply by 4", fn: x => x * 4 });
                    multiplyRules.push({ name: "Multiply by 5", fn: x => x * 5 });
                }

                const allRules = [...addSubRules, ...multiplyRules];
                const rule = pick(allRules);

                // Generate 5 random IN values based on range (larger numbers allowed)
                const inValues = [];
                const usedVals = new Set();
                const isSubtract = rule.name.includes("Subtract");
                const subAmount = rule.sub || 0;

                // Determine IN value range
                const minIn = isSubtract ? Math.max(subAmount + 5, 10) : 1;
                const maxIn = Math.min(range, isSubtract ? range : range * 0.8);

                while (inValues.length < 5) {
                    const val = rng(minIn, Math.max(minIn + 10, maxIn));
                    if (!usedVals.has(val)) {
                        usedVals.add(val);
                        inValues.push(val);
                    }
                }
                inValues.sort((a, b) => a - b);
                const outValues = inValues.map(x => rule.fn(x));

                // Number of missing OUT values based on difficulty
                const missingCount = patternSkill === "function_table_hard" ? 5 : pick([1, 2]);

                // Pick which indices are missing
                const allIndices = [0, 1, 2, 3, 4];
                const missingIndices = shuffle(allIndices).slice(0, missingCount);

                // Answer is comma-separated list of missing OUT values (in table order)
                const missingAnswers = [];
                for (let i = 0; i < 5; i++) {
                    if (missingIndices.includes(i)) {
                        missingAnswers.push(outValues[i]);
                    }
                }

                if (missingCount === 1) {
                    q.ans = missingAnswers[0];
                    q.text = `Function Table: What is the OUT value for IN = ${inValues[missingIndices[0]]}?`;
                } else {
                    q.answerType = "text";
                    q.ans = missingAnswers.join(", ");
                    q.text = `Function Table: Fill in the missing OUT values (top to bottom, comma-separated)`;
                }
                q.hint = `Apply the rule "${rule.name}" to each IN value. Example: ${inValues[0]} \u2192 ${outValues[0]}`;

                // Store expected answers for validation
                q.functionTableAnswers = missingIndices.map(i => outValues[i]);
                q.functionTableMissingIndices = missingIndices.sort((a, b) => a - b);

                // Generate unique ID for this function table
                const funcTableId = Date.now() + Math.random().toString(36).substr(2, 9);

                // Build table rows with input fields for missing values
                const tableRows = inValues.map((inVal, i) => {
                    const isMissing = missingIndices.includes(i);
                    const outCell = isMissing
                        ? `<td style="padding:4px;border:2px solid var(--text-primary);text-align:center;min-width:60px;">
                            <input type="text" class="func-table-input" data-func-table="${funcTableId}" data-row="${i}"
                                style="width:50px;height:32px;border:2px solid var(--accent-cyan);border-radius:6px;
                                text-align:center;font-size:1rem;font-weight:700;font-family:inherit;
                                background:var(--bg-card-light);color:var(--text-primary);"
                                placeholder="">
                           </td>`
                        : `<td style="padding:10px 25px;border:2px solid var(--text-primary);text-align:center;min-width:60px;">${outValues[i]}</td>`;
                    return `<tr>
                        <td style="padding:10px 25px;border:2px solid var(--text-primary);text-align:center;min-width:60px;">${inVal}</td>
                        ${outCell}
                    </tr>`;
                }).join('');

                q.visual = `<!-- Function Table -->
                <div style="text-align:center;">
                    <table style="margin:0 auto;border-collapse:collapse;font-size:1.1rem;border:2px solid var(--text-primary);">
                        <tr>
                            <th style="padding:10px 25px;border:2px solid var(--text-primary);background:var(--bg-card);font-weight:800;min-width:60px;">IN</th>
                            <th style="padding:10px 25px;border:2px solid var(--text-primary);background:var(--bg-card);font-weight:800;min-width:60px;">OUT</th>
                        </tr>
                        ${tableRows}
                        <tr>
                            <td colspan="2" style="padding:10px 20px;border:2px solid var(--text-primary);background:var(--bg-card);font-weight:700;text-align:center;">
                                <span style="color:var(--text-secondary);">Rule:</span> <span style="display:inline-block;min-width:120px;border-bottom:2px solid var(--text-primary);margin-left:8px;">&nbsp;</span>
                            </td>
                        </tr>
                    </table>
                </div>`;

                // No multiple choice - answers go in the table inputs
                q.options = [];
            } else if (patternSkill === "double" || patternSkill === "halve") {
                // Doubling and Halving skills (moved from separate category)
                const maxForDouble = range;
                const maxForHalve = Math.floor(range / 2);

                // Bar graph for doubling
                const createDoubleBarGraph = (base) => {
                    return `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;">Double = Add another equal bar</div>
                        <div style="display:flex;align-items:flex-end;justify-content:center;gap:30px;">
                            <div style="text-align:center;">
                                <div style="background:linear-gradient(180deg,var(--accent-cyan),var(--accent-purple));width:60px;height:80px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">${base.toLocaleString()}</div>
                                <div style="font-size:0.8rem;margin-top:4px;color:var(--text-secondary);">Original</div>
                            </div>
                            <div style="font-size:1.5rem;color:var(--accent-orange);margin-bottom:20px;">\u2192</div>
                            <div style="text-align:center;">
                                <div style="display:flex;flex-direction:column;">
                                    <div style="background:linear-gradient(180deg,var(--accent-green),var(--accent-cyan));width:60px;height:80px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;border-bottom:2px dashed white;">${base.toLocaleString()}</div>
                                    <div style="background:linear-gradient(180deg,var(--accent-cyan),var(--accent-green));width:60px;height:80px;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">${base.toLocaleString()}</div>
                                </div>
                                <div style="font-size:0.8rem;margin-top:4px;color:var(--text-secondary);">Doubled = ?</div>
                            </div>
                        </div>
                    </div>`;
                };

                // Bar graph for halving
                const createHalveBarGraph = (base) => {
                    return `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;">Half = Split the bar into 2 equal parts</div>
                        <div style="display:flex;align-items:flex-end;justify-content:center;gap:30px;">
                            <div style="text-align:center;">
                                <div style="background:linear-gradient(180deg,var(--accent-purple),var(--accent-cyan));width:60px;height:160px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">${base.toLocaleString()}</div>
                                <div style="font-size:0.8rem;margin-top:4px;color:var(--text-secondary);">Whole</div>
                            </div>
                            <div style="font-size:1.5rem;color:var(--accent-orange);margin-bottom:60px;">\u2192</div>
                            <div style="text-align:center;">
                                <div style="display:flex;gap:8px;">
                                    <div style="background:linear-gradient(180deg,var(--accent-green),var(--accent-cyan));width:50px;height:80px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">?</div>
                                    <div style="background:linear-gradient(180deg,var(--accent-green),var(--accent-cyan));width:50px;height:80px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">?</div>
                                </div>
                                <div style="font-size:0.8rem;margin-top:4px;color:var(--text-secondary);">Two halves</div>
                            </div>
                        </div>
                    </div>`;
                };

                if (patternSkill === "double") {
                    const base = rng(2, maxForDouble);
                    q.text = `Double ${base.toLocaleString()}`;
                    q.ans = base * 2;
                    q.hint = `Double means \u00d72. Think: ${base.toLocaleString()} + ${base.toLocaleString()} = ?`;
                    q.visual = createDoubleBarGraph(base);
                } else {
                    // If decimals are enabled, allow odd numbers (result will be .5)
                    const allowOdd = state.decimalPlaces > 0;
                    let base;
                    if (allowOdd) {
                        base = rng(2, range);
                    } else {
                        const half = rng(1, maxForHalve);
                        base = half * 2;
                    }
                    const halfResult = base / 2;
                    q.text = `Half of ${base.toLocaleString()}`;
                    q.ans = allowOdd ? halfResult : Math.floor(halfResult);
                    q.hint = `Half means \u00f72. Split ${base.toLocaleString()} into 2 equal parts.`;
                    q.visual = createHalveBarGraph(base);
                }
            } else if (patternSkill === "skip_count_line") {
                // Skip Counting on a Number Line - 3-4 missing numbers
                let skipOptions = [2, 3, 4, 5, 6, 10];
                if (range >= 100) skipOptions.push(25);
                if (range >= 500) skipOptions.push(50);
                if (range >= 1000) skipOptions.push(100);
                const skipBy = pick(skipOptions);
                const maxStartMult = Math.max(1, Math.min(Math.floor(range / skipBy / 8), 20));
                const startVal = rng(0, maxStartMult) * skipBy;
                const numMarks = 8;
                const values = Array.from({length: numMarks}, (_, i) => startVal + skipBy * i);

                const numMissing = rng(3, 4);
                const candidateIndices = [];
                for (let i = 1; i <= numMarks - 2; i++) candidateIndices.push(i);
                shuffle(candidateIndices);
                const missingIndices = candidateIndices.slice(0, numMissing).sort((a, b) => a - b);
                const missingValues = missingIndices.map(i => values[i]);
                const answerStr = missingValues.join(", ");

                q.text = `Fill in the missing numbers. Skip count by ${skipBy}s.`;
                q.ans = answerStr;
                q.hint = `Each mark increases by ${skipBy}. Fill in all ${numMissing} blanks separated by commas.`;
                q.skillLabel = 'Skip Count';
                q.printFormat = 'skip-count-line';
                q.answerType = "text";
                q.options = [];

                const svgW = 420;
                const svgH = 80;
                const leftPad = 30;
                const rightPad = 30;
                const lineY = 40;
                const spacing = (svgW - leftPad - rightPad) / (numMarks - 1);
                const missingSet = new Set(missingIndices);

                let ticksSVG = '';
                for (let i = 0; i < numMarks; i++) {
                    const x = leftPad + i * spacing;
                    const isMissing = missingSet.has(i);
                    ticksSVG += `<line x1="${x}" y1="${lineY - 10}" x2="${x}" y2="${lineY + 10}" stroke="currentColor" stroke-width="2"/>`;
                    if (isMissing) {
                        ticksSVG += `<circle cx="${x}" cy="${lineY}" r="12" fill="var(--accent-orange)" opacity="0.3"/>`;
                        ticksSVG += `<text x="${x}" y="${lineY + 30}" text-anchor="middle" fill="var(--accent-orange)" font-size="14" font-weight="bold">?</text>`;
                    } else {
                        ticksSVG += `<text x="${x}" y="${lineY + 28}" text-anchor="middle" fill="currentColor" font-size="12" font-weight="bold">${values[i].toLocaleString()}</text>`;
                    }
                }
                let arrowsSVG = '';
                for (let i = 0; i < numMarks - 1; i++) {
                    const x1 = leftPad + i * spacing + 8;
                    const x2 = leftPad + (i + 1) * spacing - 8;
                    arrowsSVG += `<line x1="${x1}" y1="${lineY - 18}" x2="${x2}" y2="${lineY - 18}" stroke="var(--accent-cyan)" stroke-width="1.5" marker-end="url(#skipArrow)"/>`;
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Skip Count by ${skipBy}s</div>
                    <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="max-width:100%;">
                        <defs>
                            <marker id="skipArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                <path d="M 0 0 L 6 3 L 0 6" fill="none" stroke="var(--accent-cyan)" stroke-width="1"/>
                            </marker>
                        </defs>
                        <line x1="${leftPad}" y1="${lineY}" x2="${svgW - rightPad}" y2="${lineY}" stroke="currentColor" stroke-width="2"/>
                        ${arrowsSVG}
                        ${ticksSVG}
                    </svg>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-top:5px;">+${skipBy} each step | Type all ${numMissing} missing numbers separated by commas</div>
                </div>`;
            } else if (patternSkill === "skip_count_grid") {
                // Skip Counting Grid - blank cells with underline, type all missing
                const multiplier = rng(1, 12);
                const gridSize = 12;
                const allMultiples = Array.from({length: gridSize}, (_, i) => multiplier * (i + 1));

                const numBlanks = rng(3, 5);
                const candidateIdx = Array.from({length: gridSize}, (_, i) => i);
                shuffle(candidateIdx);
                const blankIndices = new Set(candidateIdx.slice(0, numBlanks));
                const blankArray = [...blankIndices].sort((a, b) => a - b);
                const blankValues = blankArray.map(i => allMultiples[i]);
                const answerStr = blankValues.join(", ");

                q.text = `Fill in all the blank cells. Count by ${multiplier}s.`;
                q.ans = answerStr;
                q.hint = `Count by ${multiplier}s: ${multiplier}, ${multiplier * 2}, ${multiplier * 3}... Write all ${numBlanks} missing numbers separated by commas.`;
                q.skillLabel = 'Skip Grid';
                q.answerType = "text";
                q.options = [];
                q.printFormat = 'skip-count-grid';

                const gridCells = allMultiples.map((val, i) => {
                    const isBlank = blankIndices.has(i);
                    if (isBlank) {
                        return `<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:var(--bg-card-light);">
                            <span style="display:inline-block;width:28px;border-bottom:2px solid var(--text-dim);"></span>
                        </div>`;
                    } else {
                        return `<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:var(--accent-cyan);color:white;border-radius:8px;font-weight:700;font-size:1rem;">${val}</div>`;
                    }
                });

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">x ${multiplier} Grid</div>
                    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;max-width:340px;margin:0 auto;">
                        ${gridCells.join('')}
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-top:10px;">Type all ${numBlanks} missing numbers separated by commas</div>
                </div>`;
            } else if (patternSkill === "shape_pattern") {
                // Shape Patterns - repeating patterns with 2-3 missing shapes (4.OA.C.5)
                const SHAPES = [
                    { name: 'circle',   color: '#ef4444', border: '#b91c1c', svg: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/></svg>` },
                    { name: 'square',   color: '#3b82f6', border: '#1d4ed8', svg: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5" rx="2"/></svg>` },
                    { name: 'triangle', color: '#22c55e', border: '#15803d', svg: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><polygon points="12,2 22,22 2,22" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/></svg>` },
                    { name: 'star',     color: '#eab308', border: '#a16207', svg: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 16.5,14 18.5,22 12,17.5 5.5,22 7.5,14 2,9 9,9" fill="#eab308" stroke="#a16207" stroke-width="1"/></svg>` },
                    { name: 'diamond',  color: '#a855f7', border: '#7e22ce', svg: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><polygon points="12,2 22,12 12,22 2,12" fill="#a855f7" stroke="#7e22ce" stroke-width="1.5"/></svg>` },
                    { name: 'hexagon',  color: '#f97316', border: '#c2410c', svg: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="#f97316" stroke="#c2410c" stroke-width="1.5"/></svg>` },
                ];

                // Pick a pattern type and shapes
                const patternTypes = [
                    [0, 1],          // AB
                    [0, 1, 2],       // ABC
                    [0, 1, 1],       // ABB
                    [0, 0, 1, 1],   // AABB
                    [0, 1, 1, 2],   // ABBC
                ];
                const corePattern = pick(patternTypes);
                const numDistinct = Math.max(...corePattern) + 1;

                // Pick distinct shapes for this pattern
                const shuffledShapes = shuffle([...SHAPES]);
                const chosenShapes = shuffledShapes.slice(0, numDistinct);

                // Build the full sequence (2-3 full cycles)
                const numCycles = corePattern.length <= 3 ? 3 : 2;
                const sequence = [];
                for (let c = 0; c < numCycles; c++) {
                    for (let i = 0; i < corePattern.length; i++) {
                        sequence.push(chosenShapes[corePattern[i]]);
                    }
                }
                // Add partial cycle to reach 8-10 elements
                const targetLen = Math.max(8, Math.min(10, sequence.length));
                while (sequence.length > targetLen) sequence.pop();
                while (sequence.length < targetLen) {
                    sequence.push(chosenShapes[corePattern[sequence.length % corePattern.length]]);
                }

                // Pick 2-3 blank positions (not the first 3)
                const numBlanks = rng(2, 3);
                const candidateIdx = [];
                for (let i = 3; i < sequence.length; i++) candidateIdx.push(i);
                shuffle(candidateIdx);
                const blankPositions = candidateIdx.slice(0, numBlanks).sort((a, b) => a - b);

                const missingNames = blankPositions.map(i => sequence[i].name);
                q.ans = missingNames.join(", ");
                q.answerType = "text";
                q.text = `Look at the pattern. Fill in the missing shapes.`;
                q.hint = `Find the repeating group of shapes, then figure out which shape goes in each blank.`;
                q.skillLabel = 'Shape Pattern';
                q.printFormat = 'shape-pattern';

                // Build visual
                const shapeSize = 36;
                const cells = sequence.map((shape, i) => {
                    if (blankPositions.includes(i)) {
                        return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${shapeSize + 8}px;height:${shapeSize + 8}px;border:2px dashed #f59e0b;border-radius:8px;background:#fff8e1;font-weight:700;color:#f59e0b;font-size:1.2rem;">?</span>`;
                    }
                    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${shapeSize + 8}px;height:${shapeSize + 8}px;">${shape.svg(shapeSize)}</span>`;
                }).join('');

                // Build legend
                const legend = chosenShapes.map(s =>
                    `<span style="display:inline-flex;align-items:center;gap:4px;font-size:0.8rem;">${s.svg(18)} ${s.name}</span>`
                ).join('&nbsp;&nbsp;');

                q.visual = `<div style="text-align:center;max-width:520px;margin:0 auto;">
                    <div style="font-weight:700;font-size:1.1rem;margin-bottom:10px;color:var(--accent-purple);">Shape Pattern</div>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:12px;text-align:left;">
                        Find the repeating group, then fill in the <b>missing shapes</b>.
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:14px;">
                        ${cells}
                    </div>
                    <div style="background:var(--bg-card);padding:8px 12px;border-radius:8px;margin-bottom:10px;">
                        <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:4px;">Shape names:</div>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">${legend}</div>
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-dim);">Type missing shapes separated by commas (e.g. circle, star)</div>
                </div>`;

                q.patternData = {
                    type: 'shape_pattern',
                    sequence: sequence.map(s => s.name),
                    blankPositions,
                    missingNames,
                    corePattern: corePattern.map(i => chosenShapes[i].name),
                    shapes: chosenShapes.map(s => ({ name: s.name, color: s.color }))
                };
                return;

            } else if (patternSkill === "number_pattern") {
                // Number Patterns - arithmetic sequences with 2-3 missing numbers (4.OA.C.5)
                let stepOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10];
                if (range >= 100) stepOptions.push(15, 20, 25);
                if (range >= 500) stepOptions.push(50);
                if (range >= 1000) stepOptions.push(100);

                const step = pick(stepOptions);
                const maxStart = Math.max(1, Math.min(range - step * 8, Math.floor(range / 2)));
                const startVal = rng(1, maxStart);
                const numTerms = rng(7, 8);
                const terms = Array.from({ length: numTerms }, (_, i) => startVal + step * i);

                // Pick 2-3 blank positions (not the first 2)
                const numBlanks = rng(2, 3);
                const candidateIdx = [];
                for (let i = 2; i < numTerms; i++) candidateIdx.push(i);
                shuffle(candidateIdx);
                const blankPositions = candidateIdx.slice(0, numBlanks).sort((a, b) => a - b);

                const missingValues = blankPositions.map(i => terms[i]);
                q.ans = missingValues.join(", ");
                q.answerType = "text";
                q.text = `Find the pattern. Fill in the missing numbers.`;
                q.hint = `Look at the difference between numbers that are next to each other. The pattern adds ${step} each time.`;
                q.skillLabel = 'Number Pattern';
                q.printFormat = 'number-pattern';

                // Build visual
                const cells = terms.map((val, i) => {
                    if (blankPositions.includes(i)) {
                        return `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:42px;padding:0 8px;border:2px dashed #f59e0b;border-radius:8px;background:#fff8e1;font-weight:700;color:#f59e0b;font-size:1.1rem;">?</span>`;
                    }
                    return `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:42px;padding:0 8px;background:var(--bg-card);border:2px solid var(--accent-cyan);border-radius:8px;font-weight:700;font-size:1.05rem;">${val}</span>`;
                }).join('');

                // Show step hint between first two terms
                const stepHint = `<div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:8px;">
                    <span style="font-weight:700;">${terms[0]}</span>
                    <span style="color:var(--accent-orange);font-size:1.2rem;">→</span>
                    <span style="font-weight:700;">${terms[1]}</span>
                    <span style="color:var(--text-dim);font-size:0.85rem;margin-left:6px;">(+${step})</span>
                </div>`;

                q.visual = `<div style="text-align:center;max-width:520px;margin:0 auto;">
                    <div style="font-weight:700;font-size:1.1rem;margin-bottom:10px;color:var(--accent-cyan);">Number Pattern</div>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:12px;text-align:left;">
                        Find the <b>rule</b> (what's added each time), then fill in the <b>missing numbers</b>.
                    </div>
                    ${stepHint}
                    <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:12px;">
                        ${cells}
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-dim);">Type missing numbers separated by commas</div>
                </div>`;

                q.patternData = {
                    type: 'number_pattern',
                    terms,
                    step,
                    blankPositions,
                    missingValues,
                    startVal
                };
                return;

            } else {
                // random_step in mixed mode - allow rule identification questions
                const step = rng(1, 12) * (Math.random() > 0.5 ? 1 : -1);
                patternQ(step, mappedSkill === "mixed");
            }
            q.options = q.options.length ? q.options : buildNumericOptions(q.ans);
            return;
}

export function generateRoundingQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;
            // Visual Style 1: Number line with dot marker
            const createNumberLineVisual = (num, lowerBound, upperBound, place) => {
                const midpoint = lowerBound + place / 2;
                return `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;">Where does ${num.toLocaleString()} fall?</div>
                    <div style="position:relative;max-width:400px;margin:0 auto;">
                        <div style="display:flex;justify-content:space-between;font-weight:800;font-size:1.1rem;margin-bottom:5px;">
                            <span style="color:var(--accent-cyan);">${lowerBound.toLocaleString()}</span>
                            <span style="color:var(--text-dim);">${midpoint.toLocaleString()}</span>
                            <span style="color:var(--accent-cyan);">${upperBound.toLocaleString()}</span>
                        </div>
                        <div style="height:12px;background:linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-purple) 50%, var(--accent-cyan) 100%);border-radius:6px;position:relative;">
                            <div style="position:absolute;left:50%;top:-2px;bottom:-2px;width:3px;background:var(--text-dim);transform:translateX(-50%);"></div>
                            <div style="position:absolute;left:${((num - lowerBound) / place) * 100}%;top:-8px;transform:translateX(-50%);">
                                <div style="width:20px;height:20px;background:var(--accent-orange);border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
                            </div>
                        </div>
                        <div style="margin-top:8px;font-size:0.9rem;color:var(--text-dim);">\u2190 Round Down | Round Up \u2192</div>
                    </div>
                </div>`;
            };

            // Visual Style 2: Bar graph comparison
            const createBarGraphVisual = (num, lowerBound, upperBound, place) => {
                const distToLower = num - lowerBound;
                const distToUpper = upperBound - num;
                const maxDist = Math.max(distToLower, distToUpper);
                const lowerHeight = Math.round((distToLower / maxDist) * 100);
                const upperHeight = Math.round((distToUpper / maxDist) * 100);
                return `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;">Which is ${num.toLocaleString()} closer to?</div>
                    <div style="display:flex;align-items:flex-end;justify-content:center;gap:40px;height:140px;">
                        <div style="text-align:center;display:flex;flex-direction:column;align-items:center;">
                            <div style="background:var(--accent-cyan);color:var(--text-on-accent);padding:4px 10px;border-radius:8px;font-weight:800;font-size:0.9rem;margin-bottom:6px;">${distToLower}</div>
                            <div style="background:linear-gradient(180deg,var(--accent-cyan),var(--accent-purple));width:70px;height:${Math.max(20, 100 - lowerHeight)}px;border-radius:8px 8px 0 0;"></div>
                            <div style="font-weight:800;margin-top:6px;color:var(--accent-cyan);">${lowerBound.toLocaleString()}</div>
                            <div style="font-size:0.75rem;color:var(--text-dim);">away</div>
                        </div>
                        <div style="text-align:center;display:flex;flex-direction:column;align-items:center;">
                            <div style="background:var(--accent-green);color:var(--text-on-accent);padding:4px 10px;border-radius:8px;font-weight:800;font-size:0.9rem;margin-bottom:6px;">${distToUpper}</div>
                            <div style="background:linear-gradient(180deg,var(--accent-green),var(--accent-cyan));width:70px;height:${Math.max(20, 100 - upperHeight)}px;border-radius:8px 8px 0 0;"></div>
                            <div style="font-weight:800;margin-top:6px;color:var(--accent-green);">${upperBound.toLocaleString()}</div>
                            <div style="font-size:0.75rem;color:var(--text-dim);">away</div>
                        </div>
                    </div>
                    <div style="margin-top:10px;font-size:0.9rem;color:var(--text-secondary);">Shorter bar = Closer = Round to that number!</div>
                </div>`;
            };

            // Visual Style 3: Simple boxes with arrow
            const createBoxVisual = (num, lowerBound, upperBound, checkDigit) => {
                return `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;">Look at the ${checkDigit} digit</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:15px;flex-wrap:wrap;">
                        <div style="background:var(--accent-cyan);padding:15px 20px;border-radius:12px;color:white;font-weight:800;">${lowerBound.toLocaleString()}</div>
                        <div style="font-size:1.2rem;color:var(--text-dim);">\u2190</div>
                        <div style="background:var(--accent-orange);padding:18px 22px;border-radius:12px;color:white;font-weight:900;font-size:1.2rem;box-shadow:0 4px 15px rgba(255,159,28,0.4);">${num.toLocaleString()}</div>
                        <div style="font-size:1.2rem;color:var(--text-dim);">\u2192</div>
                        <div style="background:var(--accent-green);padding:15px 20px;border-radius:12px;color:white;font-weight:800;">${upperBound.toLocaleString()}</div>
                    </div>
                    <div style="margin-top:12px;font-size:0.95rem;color:var(--text-secondary);">If ${checkDigit} digit is 0-4: round down \u2190 | If 5-9: round up \u2192</div>
                </div>`;
            };

            // Pick random visual style
            const pickRoundingVisual = (num, lowerBound, upperBound, place, checkDigit) => {
                const style = Math.floor(Math.random() * 3);
                if (style === 0) return createNumberLineVisual(num, lowerBound, upperBound, place);
                if (style === 1) return createBarGraphVisual(num, lowerBound, upperBound, place);
                return createBoxVisual(num, lowerBound, upperBound, checkDigit);
            };

            const makeWhole = (place) => {
                const max = Math.max(place * 2, range);
                const num = rng(place, max);
                q.text = `Round ${num.toLocaleString()} to the nearest ${place.toLocaleString()}`;
                q.ans = Math.round(num / place) * place;
                const lowerBound = Math.floor(num / place) * place;
                const upperBound = lowerBound + place;
                const checkDigit = place === 10 ? "ones" : place === 100 ? "tens" : place === 1000 ? "hundreds" : "digit";
                q.hint = `Look at the ${checkDigit} digit. Is ${num} closer to ${lowerBound.toLocaleString()} or ${upperBound.toLocaleString()}? If ${checkDigit} is 5 or more, round up!`;
                q.visual = pickRoundingVisual(num, lowerBound, upperBound, place, checkDigit);
                q.options = buildNumericOptions(q.ans);
            };
            // For mixed, pick a random rounding skill; mixed_whole only uses whole number rounding
            // Round Decimals skill: round decimals to nearest tenth, hundredth
            if (mappedSkill === "round_decimals") {
                const placeChoice = pick(["tenth", "hundredth"]);
                const targetPlaces = placeChoice === "tenth" ? 1 : 2;
                // Generate a decimal with one more digit than the target
                const extraDigits = targetPlaces + 1;
                const maxWhole = Math.max(1, Math.min(Math.floor(range / 10), 99));
                const wholePart = rng(0, maxWhole);
                const decShift = Math.pow(10, extraDigits);
                const decPart = rng(1, decShift - 1);
                const num = parseFloat((wholePart + decPart / decShift).toFixed(extraDigits));

                const factor = Math.pow(10, targetPlaces);
                const rounded = Math.round(num * factor) / factor;

                // Calculate number line bounds
                const lowerBound = Math.floor(num * factor) / factor;
                const upperBound = parseFloat((lowerBound + 1 / factor).toFixed(targetPlaces));
                const midpoint = parseFloat(((lowerBound + upperBound) / 2).toFixed(extraDigits));
                const pct = Math.min(100, Math.max(0, ((num - lowerBound) / (upperBound - lowerBound)) * 100));

                q.text = `Round ${num} to the nearest ${placeChoice}`;
                q.ans = rounded;
                q.answerType = "number";
                q.hint = `${num} is between ${lowerBound} and ${upperBound}. The midpoint is ${midpoint}. Look at the digit after the ${placeChoice} place: if it's 5 or more, round up!`;
                q.skillLabel = 'Round Decimals';
                q.options = buildNumericOptions(rounded);

                // Number line visual showing the decimal between tick marks
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Round to the nearest ${placeChoice}</div>
                    <div style="position:relative;max-width:400px;margin:0 auto;padding:30px 0 10px;">
                        <div style="position:absolute;left:${pct}%;top:0;transform:translateX(-50%);font-weight:800;font-size:1.1rem;color:var(--accent-orange);">${num}</div>
                        <div style="display:flex;justify-content:space-between;font-weight:800;font-size:1rem;margin-bottom:5px;">
                            <span style="color:var(--accent-cyan);">${lowerBound}</span>
                            <span style="color:var(--text-dim);font-size:0.85rem;">${midpoint}</span>
                            <span style="color:var(--accent-cyan);">${upperBound}</span>
                        </div>
                        <div style="height:10px;background:linear-gradient(90deg,var(--accent-cyan),var(--accent-purple),var(--accent-cyan));border-radius:5px;position:relative;">
                            <div style="position:absolute;left:50%;top:-3px;bottom:-3px;width:2px;background:var(--text-dim);transform:translateX(-50%);"></div>
                            <div style="position:absolute;left:${pct}%;top:-7px;transform:translateX(-50%);">
                                <div style="width:18px;height:18px;background:var(--accent-orange);border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-dim);">Is ${num} closer to ${lowerBound} or ${upperBound}?</div>
                    </div>
                </div>`;
                return;
            }

            // Rounding Visual skill: number line with benchmarks and dot
            if (mappedSkill === "rounding_visual") {
                const roundTypes = ["nearest_10"];
                if (range >= 100) roundTypes.push("nearest_100");
                if (range >= 1000) roundTypes.push("nearest_1000");
                const roundType = pick(roundTypes);

                // Phase 4.5 batch 3: ~30% chance — number-line-extended placement variant
                if (Math.random() < 0.30) {
                    let nlPlace, nlNum, nlPlaceName;
                    if (roundType === "nearest_10") {
                        nlPlace = 10;
                        nlNum = rng(11, Math.max(99, Math.min(range, 999)));
                        nlPlaceName = "10";
                    } else if (roundType === "nearest_100") {
                        nlPlace = 100;
                        nlNum = rng(101, Math.max(999, Math.min(range, 9999)));
                        nlPlaceName = "100";
                    } else {
                        nlPlace = 1000;
                        nlNum = rng(1001, Math.max(9999, Math.min(range, 99999)));
                        nlPlaceName = "1,000";
                    }
                    const nlLower = Math.floor(nlNum / nlPlace) * nlPlace;
                    const nlUpper = nlLower + nlPlace;
                    const nlMinor = Math.max(1, Math.round(nlPlace / 10));
                    q.text = `Drag the marker to ${nlNum.toLocaleString()} on the number line. Then identify the nearest ${nlPlaceName}.`;
                    q.answerType = 'number-line-extended';
                    q.rangeMin = nlLower;
                    q.rangeMax = nlUpper;
                    q.majorTickEvery = nlMinor;
                    q.minorSnap = nlMinor;
                    q.numberType = 'integer';
                    q.ans = nlNum;
                    q.tolerance = nlMinor / 2;
                    q.hint = `Look for the tick mark closest to ${nlNum.toLocaleString()}. Then decide if it's nearer to ${nlLower.toLocaleString()} or ${nlUpper.toLocaleString()}.`;
                    q.printFormat = 'number-line-extended';
                    q.skillLabel = 'Place on Number Line';
                    q.options = [];
                    return;
                }

                let place, num, lowerBound, upperBound, placeName;

                if (roundType === "nearest_10") {
                    place = 10;
                    num = rng(11, Math.max(99, Math.min(range, 999)));
                    placeName = "10";
                } else if (roundType === "nearest_100") {
                    place = 100;
                    num = rng(101, Math.max(999, Math.min(range, 9999)));
                    placeName = "100";
                } else {
                    place = 1000;
                    num = rng(1001, Math.max(9999, Math.min(range, 99999)));
                    placeName = "1,000";
                }

                lowerBound = Math.floor(num / place) * place;
                upperBound = lowerBound + place;
                const rounded = Math.round(num / place) * place;
                const midpoint = lowerBound + place / 2;
                const pct = ((num - lowerBound) / place) * 100;

                q.text = `Round ${num.toLocaleString()} to the nearest ${placeName}`;
                q.ans = rounded;
                q.hint = `${num.toLocaleString()} is between ${lowerBound.toLocaleString()} and ${upperBound.toLocaleString()}. The midpoint is ${midpoint.toLocaleString()}. Is ${num.toLocaleString()} closer to the left or right?`;
                q.skillLabel = 'Rounding';
                q.answerType = "number";
                q.printFormat = 'rounding-visual';

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Round to the nearest ${placeName}</div>
                    <div style="position:relative;max-width:400px;margin:0 auto;padding:30px 0 10px;">
                        <!-- Number being rounded -->
                        <div style="position:absolute;left:${pct}%;top:0;transform:translateX(-50%);font-weight:800;font-size:1.1rem;color:var(--accent-orange);">${num.toLocaleString()}</div>
                        <!-- Benchmarks -->
                        <div style="display:flex;justify-content:space-between;font-weight:800;font-size:1rem;margin-bottom:5px;">
                            <span style="color:var(--accent-cyan);">${lowerBound.toLocaleString()}</span>
                            <span style="color:var(--text-dim);font-size:0.85rem;">${midpoint.toLocaleString()}</span>
                            <span style="color:var(--accent-cyan);">${upperBound.toLocaleString()}</span>
                        </div>
                        <!-- Number line bar -->
                        <div style="height:10px;background:linear-gradient(90deg,var(--accent-cyan),var(--accent-purple),var(--accent-cyan));border-radius:5px;position:relative;">
                            <!-- Midpoint mark -->
                            <div style="position:absolute;left:50%;top:-3px;bottom:-3px;width:2px;background:var(--text-dim);transform:translateX(-50%);"></div>
                            <!-- Dot at number position -->
                            <div style="position:absolute;left:${pct}%;top:-7px;transform:translateX(-50%);">
                                <div style="width:18px;height:18px;background:var(--accent-orange);border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-dim);">Which end is ${num.toLocaleString()} closer to?</div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(rounded);
                return;
            }

            // Rounding Table skill: table with NUMBER | NEAREST 10 | NEAREST 100 | NEAREST 1000
            if (mappedSkill === "rounding_table") {
                // Determine columns based on range
                const columns = [];
                columns.push({ label: 'Nearest 10', place: 10 });
                if (range >= 100) columns.push({ label: 'Nearest 100', place: 100 });
                if (range >= 1000) columns.push({ label: 'Nearest 1,000', place: 1000 });

                // Generate 6-8 random numbers
                const rowCount = rng(6, 8);
                const maxNum = Math.max(columns[columns.length - 1].place * 2, Math.min(range, 9999));
                const minNum = columns[columns.length - 1].place + 1;
                const rows = [];
                const usedNums = new Set();
                for (let i = 0; i < rowCount; i++) {
                    let num;
                    do { num = rng(minNum, maxNum); } while (usedNums.has(num));
                    usedNums.add(num);
                    const row = { number: num };
                    for (const col of columns) {
                        row[`nearest${col.place}`] = Math.round(num / col.place) * col.place;
                    }
                    rows.push(row);
                }

                // For online play: ask about one cell at a time
                const targetRow = rows[rng(0, rows.length - 1)];
                const targetCol = columns[rng(0, columns.length - 1)];
                const answer = targetRow[`nearest${targetCol.place}`];

                q.text = `Round ${targetRow.number.toLocaleString()} to the ${targetCol.label.toLowerCase()}`;
                q.ans = answer;
                q.hint = `Look at the digit in the ${targetCol.place === 10 ? 'ones' : targetCol.place === 100 ? 'tens' : 'hundreds'} place. If it's 5 or more, round up!`;
                q.answerType = 'number';
                q.skillLabel = 'Rounding Table';
                q.printFormat = 'rounding-table';
                q.options = buildNumericOptions(answer);

                // Store table data for print rendering
                q.roundingTableData = { rows, columns };

                // Build visual table showing full grid with "?" on the target cell
                let tableHTML = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Rounding Table</div>
                    <table style="margin:0 auto;border-collapse:collapse;font-size:0.95rem;">
                        <thead><tr>
                            <th style="border:2px solid var(--border);padding:8px 14px;background:var(--bg-card-light);font-weight:700;">Number</th>`;
                for (const col of columns) {
                    tableHTML += `<th style="border:2px solid var(--border);padding:8px 14px;background:var(--bg-card-light);font-weight:700;">${col.label}</th>`;
                }
                tableHTML += `</tr></thead><tbody>`;
                for (const row of rows) {
                    tableHTML += `<tr><td style="border:2px solid var(--border);padding:6px 14px;font-weight:600;">${row.number.toLocaleString()}</td>`;
                    for (const col of columns) {
                        const val = row[`nearest${col.place}`];
                        const isTarget = row.number === targetRow.number && col.place === targetCol.place;
                        if (isTarget) {
                            tableHTML += `<td style="border:2px solid var(--accent-orange);padding:6px 14px;background:var(--accent-orange)20;font-weight:800;color:var(--accent-orange);font-size:1.2rem;">?</td>`;
                        } else {
                            tableHTML += `<td style="border:2px solid var(--border);padding:6px 14px;">${val.toLocaleString()}</td>`;
                        }
                    }
                    tableHTML += `</tr>`;
                }
                tableHTML += `</tbody></table></div>`;
                q.visual = tableHTML;
                return;
            }

            const roundingSkill = mappedSkill === "mixed" ? pick(["nearest_10", "nearest_100", "nearest_1000", "nearest_tenth", "nearest_hundredth", "nearest_thousandth"])
                : mappedSkill === "mixed_whole" ? pick(["nearest_10", "nearest_100", "nearest_1000", "rounding_table"])
                : mappedSkill;

            const makeWholeMultiSelect = (place) => {
                const max = Math.max(place * 5, range);
                const minTarget = Math.max(place * 2, place * 4);
                const targetMax = Math.max(minTarget + place, Math.floor(max / place) * place);
                const target = Math.round(rng(minTarget, targetMax) / place) * place;
                const correctCount = rng(2, 4);
                const totalCount = rng(6, 8);
                const candidates = new Set();
                let safety = 0;
                while (candidates.size < correctCount && safety < 100) {
                    safety++;
                    const lower = target - Math.floor(place / 2);
                    const upper = target + Math.floor(place / 2) - (place === 1 ? 0 : 1);
                    const n = rng(Math.max(1, lower), upper);
                    if (Math.round(n / place) * place === target) candidates.add(n);
                }
                safety = 0;
                while (candidates.size < totalCount && safety < 200) {
                    safety++;
                    const offset = pick([-1, 1]) * (place + rng(0, place));
                    const n = Math.max(1, target + offset + rng(-Math.floor(place / 2), Math.floor(place / 2)));
                    if (Math.round(n / place) * place !== target) candidates.add(n);
                }
                const arr = shuffle(Array.from(candidates));
                const options = arr.map((n, i) => ({
                    id: 'opt' + i,
                    label: String(n.toLocaleString()),
                    correct: Math.round(n / place) * place === target
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                const checkDigit = place === 10 ? "ones" : place === 100 ? "tens" : place === 1000 ? "hundreds" : "digit";
                q.text = `Click ALL the numbers that round to ${target.toLocaleString()} when rounded to the nearest ${place.toLocaleString()}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Look at the ${checkDigit} digit. If it's 5 or more, the number rounds up.`;
                q.printFormat = 'multi-select';
                q.skillLabel = `Round to ${place}`;
            };

            const useRoundMultiSelect = Math.random() < 0.30;
            if (useRoundMultiSelect && roundingSkill === "nearest_10") { makeWholeMultiSelect(10); return; }
            if (useRoundMultiSelect && roundingSkill === "nearest_100") { makeWholeMultiSelect(100); return; }
            if (useRoundMultiSelect && roundingSkill === "nearest_1000") { makeWholeMultiSelect(1000); return; }

            // Phase 4.5 batch 3: ~30% chance — number-line-extended placement variant
            // (chained AFTER the multi-select-check gate so each variant fires ~30% on the
            // remaining ~70% path. Effective NLE rate ~21%.)
            const makeWholeNumberLine = (place, placeName) => {
                let nlMinNum, nlMaxNum;
                if (place === 10) { nlMinNum = 11; nlMaxNum = Math.max(99, Math.min(range, 999)); }
                else if (place === 100) { nlMinNum = 101; nlMaxNum = Math.max(999, Math.min(range, 9999)); }
                else { nlMinNum = 1001; nlMaxNum = Math.max(9999, Math.min(range, 99999)); }
                const nlNum = rng(nlMinNum, nlMaxNum);
                const nlLower = Math.floor(nlNum / place) * place;
                const nlUpper = nlLower + place;
                const nlMinor = Math.max(1, Math.round(place / 10));
                q.text = `Drag the marker to ${nlNum.toLocaleString()} on the number line. Then identify the nearest ${placeName}.`;
                q.answerType = 'number-line-extended';
                q.rangeMin = nlLower;
                q.rangeMax = nlUpper;
                q.majorTickEvery = nlMinor;
                q.minorSnap = nlMinor;
                q.numberType = 'integer';
                q.ans = nlNum;
                q.tolerance = nlMinor / 2;
                q.hint = `Look for the tick mark closest to ${nlNum.toLocaleString()}. Then decide if it's nearer to ${nlLower.toLocaleString()} or ${nlUpper.toLocaleString()}.`;
                q.printFormat = 'number-line-extended';
                q.skillLabel = 'Place on Number Line';
                q.options = [];
            };
            const useRoundNumberLine = Math.random() < 0.30;
            if (useRoundNumberLine && roundingSkill === "nearest_10") { makeWholeNumberLine(10, "10"); return; }
            if (useRoundNumberLine && roundingSkill === "nearest_100") { makeWholeNumberLine(100, "100"); return; }
            if (useRoundNumberLine && roundingSkill === "nearest_1000") { makeWholeNumberLine(1000, "1,000"); return; }

            if (roundingSkill === "nearest_10") makeWhole(10);
            else if (roundingSkill === "nearest_100") makeWhole(100);
            else if (roundingSkill === "nearest_1000") makeWhole(1000);
            else {
                const decimals = { nearest_tenth: 1, nearest_hundredth: 2, nearest_thousandth: 3 };
                const places = decimals[roundingSkill] || 1;
                // Generate number and ensure the deciding digit (at places+1) is non-zero
                // so the problem isn't trivially "already rounded"
                let num;
                for (let _try = 0; _try < 20; _try++) {
                    num = +(Math.random() * range).toFixed(places + 1);
                    const str = num.toFixed(places + 1);
                    const decIdx = str.indexOf('.');
                    if (decIdx >= 0 && str.length > decIdx + places + 1 && str[decIdx + places + 1] !== '0') break;
                    // Last resort: inject a random non-zero digit
                    if (_try === 19) {
                        const base = +(Math.random() * range).toFixed(places);
                        const extra = rng(1, 9) * Math.pow(10, -(places + 1));
                        num = +(base + extra).toFixed(places + 1);
                    }
                }
                const factor = Math.pow(10, places);
                const placeName = ["tenth","hundredth","thousandth"][places-1];
                q.text = `Round ${num} to the nearest ${placeName}`;
                q.ans = Math.round(num * factor) / factor;
                q.hint = `Look at the digit after the ${placeName} place. If it's 5 or more, round up!`;
                q.visual = `<div style="font-weight:700;font-size:1.2rem;text-align:center;">
                    <span style="color:var(--text-bright);">${num}</span><br>
                    <span style="font-size:0.9rem;color:var(--text-dim);">Check the digit after the ${placeName} place</span>
                </div>`;
                q.options = buildNumericOptions(q.ans);
            }
            return;
}

export function generatePlaceValueQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;
            // For mixed, pick random skill from all place value skills
            const placeSkill = mappedSkill === "mixed" ? pick(["value", "identify", "compare", "expand", "combine", "order_asc", "order_desc", "more_less_10", "more_less_100", "place_value_disks", "place_value_10x"]) : mappedSkill;

            if (placeSkill === "more_less_10" || placeSkill === "more_less_100") {
                // Cross-pattern: center number with blanks for more/less
                const isHard = placeSkill === "more_less_100";
                const maxNum = isHard ? Math.min(range, 999) : Math.min(range, 99);
                const minNum = isHard ? 100 : 10;
                const center = rng(minNum, maxNum);

                // Define the 4 directions
                const dirs = isHard
                    ? [{ label: "100 less", val: center - 100 }, { label: "10 less", val: center - 10 },
                       { label: "10 more", val: center + 10 }, { label: "100 more", val: center + 100 }]
                    : [{ label: "10 less", val: center - 10 }, { label: "1 less", val: center - 1 },
                       { label: "1 more", val: center + 1 }, { label: "10 more", val: center + 10 }];
                // top=0, left=1, right=2, bottom=3

                // Pick one direction to be the blank
                const blankIdx = rng(0, 3);
                const blankDir = dirs[blankIdx];

                // Ensure blank value is valid (>= 0)
                if (blankDir.val < 0) {
                    // Retry with a safe center
                    const safeCenter = isHard ? rng(200, maxNum) : rng(20, maxNum);
                    const safeDirs = isHard
                        ? [{ label: "100 less", val: safeCenter - 100 }, { label: "10 less", val: safeCenter - 10 },
                           { label: "10 more", val: safeCenter + 10 }, { label: "100 more", val: safeCenter + 100 }]
                        : [{ label: "10 less", val: safeCenter - 10 }, { label: "1 less", val: safeCenter - 1 },
                           { label: "1 more", val: safeCenter + 1 }, { label: "10 more", val: safeCenter + 10 }];
                    const safeBlank = safeDirs[blankIdx];
                    q.ans = safeBlank.val;
                    q.text = `What is ${safeBlank.label.replace('less', 'less than').replace('more', 'more than')} ${safeCenter}?`;
                    q.hint = `${safeBlank.label}: ${safeCenter} → ${safeBlank.val}`;

                    // Build cross visual
                    const boxW = 80, boxH = 50, gap = 4;
                    const svgW = boxW * 3 + gap * 4, svgH = boxH * 3 + gap * 4;
                    const cx = gap + boxW, cy = gap + boxH; // top-left of center box
                    const boxes = [
                        { x: cx, y: gap, w: boxW, h: boxH, dir: safeDirs[0] },           // top
                        { x: gap, y: cy, w: boxW, h: boxH, dir: safeDirs[1] },            // left
                        { x: cx, y: cy, w: boxW, h: boxH, dir: null },                    // center
                        { x: cx + boxW + gap, y: cy, w: boxW, h: boxH, dir: safeDirs[2] }, // right
                        { x: cx, y: cy + boxH + gap, w: boxW, h: boxH, dir: safeDirs[3] }  // bottom
                    ];
                    let svgContent = '';
                    boxes.forEach((b, i) => {
                        const fill = i === 2 ? 'var(--accent-cyan)' : (i === blankIdx + (blankIdx >= 2 ? 1 : 0) ? 'var(--accent-orange)' : 'var(--bg-card, #fff)');
                        const textColor = i === 2 ? '#fff' : 'var(--text-bright, #333)';
                        const displayVal = b.dir === null ? safeCenter : (i === blankIdx + (blankIdx >= 2 ? 1 : 0) ? '?' : b.dir.val);
                        svgContent += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="6" fill="${fill}" stroke="var(--accent-green)" stroke-width="2"/>`;
                        svgContent += `<text x="${b.x + b.w/2}" y="${b.y + b.h/2 + 6}" text-anchor="middle" font-size="20" font-weight="700" fill="${textColor}">${displayVal}</text>`;
                    });
                    // Add labels
                    const labelStyle = 'font-size="10" fill="var(--text-bright, #666)" text-anchor="middle"';
                    svgContent += `<text x="${cx + boxW/2}" y="${gap - 2}" ${labelStyle}>${safeDirs[0].label}</text>`;
                    svgContent += `<text x="${gap + boxW/2}" y="${cy - 2}" ${labelStyle}>${safeDirs[1].label}</text>`;
                    svgContent += `<text x="${cx + boxW + gap + boxW/2}" y="${cy - 2}" ${labelStyle}>${safeDirs[2].label}</text>`;
                    svgContent += `<text x="${cx + boxW/2}" y="${cy + boxH + gap + boxH + 14}" ${labelStyle}>${safeDirs[3].label}</text>`;

                    q.visual = `<div style="text-align:center;"><svg width="${svgW}" height="${svgH + 16}" viewBox="0 0 ${svgW} ${svgH + 16}" style="max-width:100%;">${svgContent}</svg></div>`;
                    q.answerType = "number";
                    q.options = [];
                    return;
                }

                q.ans = blankDir.val;
                q.text = `What is ${blankDir.label.replace('less', 'less than').replace('more', 'more than')} ${center}?`;
                q.hint = `${blankDir.label}: ${center} → ${blankDir.val}`;
                q.answerType = "number";
                q.options = [];

                // Build cross-pattern SVG visual
                const boxW = 80, boxH = 50, gap = 4;
                const svgW = boxW * 3 + gap * 4, svgH = boxH * 3 + gap * 4;
                const cx2 = gap + boxW, cy2 = gap + boxH;
                // Map: dirs[0]=top, dirs[1]=left, dirs[2]=right, dirs[3]=bottom
                // SVG layout: [top, left, center, right, bottom]
                const posMap = [
                    { x: cx2, y: gap },                           // top (dirs[0])
                    { x: gap, y: cy2 },                           // left (dirs[1])
                    { x: cx2, y: cy2 },                           // CENTER
                    { x: cx2 + boxW + gap, y: cy2 },              // right (dirs[2])
                    { x: cx2, y: cy2 + boxH + gap }               // bottom (dirs[3])
                ];
                const dirToPos = [0, 1, 3, 4]; // dirs index → posMap index
                let svg = '';
                posMap.forEach((p, i) => {
                    const isCenter = i === 2;
                    const dirIdx = dirToPos.indexOf(i);
                    const isBlank = dirIdx === blankIdx;
                    const fill = isCenter ? 'var(--accent-cyan)' : (isBlank ? 'var(--accent-orange)' : 'var(--bg-card, #fff)');
                    const tc = isCenter ? '#fff' : 'var(--text-bright, #333)';
                    const val = isCenter ? center : (isBlank ? '?' : dirs[dirIdx].val);
                    svg += `<rect x="${p.x}" y="${p.y}" width="${boxW}" height="${boxH}" rx="6" fill="${fill}" stroke="var(--accent-green)" stroke-width="2"/>`;
                    svg += `<text x="${p.x + boxW/2}" y="${p.y + boxH/2 + 6}" text-anchor="middle" font-size="20" font-weight="700" fill="${tc}">${val}</text>`;
                });
                // Direction labels
                const ls = 'font-size="10" fill="var(--text-bright, #666)" text-anchor="middle"';
                svg += `<text x="${cx2 + boxW/2}" y="${gap - 2}" ${ls}>${dirs[0].label}</text>`;
                svg += `<text x="${gap + boxW/2}" y="${cy2 - 2}" ${ls}>${dirs[1].label}</text>`;
                svg += `<text x="${cx2 + boxW + gap + boxW/2}" y="${cy2 - 2}" ${ls}>${dirs[2].label}</text>`;
                svg += `<text x="${cx2 + boxW/2}" y="${cy2 + boxH + gap + boxH + 14}" ${ls}>${dirs[3].label}</text>`;

                q.visual = `<div style="text-align:center;"><svg width="${svgW}" height="${svgH + 16}" viewBox="0 0 ${svgW} ${svgH + 16}" style="max-width:100%;">${svg}</svg></div>`;
                return;
            } else if (placeSkill === "number_word_form") {
                // Grade 2: Write number in word form or numeral from words
                const numberToWordForm = (n) => {
                    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
                                  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
                                  'seventeen', 'eighteen', 'nineteen'];
                    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
                    if (n < 20) return ones[n];
                    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
                    if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numberToWordForm(n % 100) : '');
                    if (n < 10000) return numberToWordForm(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + numberToWordForm(n % 1000) : '');
                    return String(n);
                };

                const maxNum = Math.max(10, Math.min(range, 9999));
                const num = rng(10, maxNum);
                const wordForm = numberToWordForm(num);
                const mode = pick(["to_words", "to_number"]);

                if (mode === "to_words") {
                    q.text = `Write the number in word form: ${num.toLocaleString()}`;
                    q.ans = wordForm;
                    q.answerType = "text";
                    q.hint = `Break the number into parts: ${num.toString().split('').map((d, i, a) => {
                        const place = Math.pow(10, a.length - 1 - i);
                        return parseInt(d) > 0 ? `${parseInt(d)} ${['thousands', 'hundreds', 'tens', 'ones'][4 - a.length + i]}` : '';
                    }).filter(Boolean).join(', ')}`;
                } else {
                    q.text = `Write the numeral: ${wordForm}`;
                    q.ans = num;
                    q.answerType = "number";
                    q.hint = `Read each part of the word form and combine: "${wordForm}" = ?`;
                    q.options = buildNumericOptions(num);
                }
                q.skillLabel = 'Word Form';

                // Place value chart visual
                const digits = num.toString().split('');
                const placeLabels = ['thousands', 'hundreds', 'tens', 'ones'];
                const placeColors = ['var(--accent-purple)', 'var(--accent-orange)', 'var(--accent-cyan)', 'var(--accent-green)'];
                const startIdx = 4 - digits.length;

                const chartCols = digits.map((d, i) => {
                    const pIdx = startIdx + i;
                    return `<div style="text-align:center;padding:6px 10px;">
                        <div style="font-size:0.7rem;color:var(--text-dim);margin-bottom:6px;text-transform:capitalize;">${placeLabels[pIdx]}</div>
                        <div style="width:40px;height:40px;border-radius:8px;background:${placeColors[pIdx]};display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:1.2rem;">${d}</div>
                    </div>`;
                }).join('');

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Number Word Form</div>
                    ${mode === "to_words"
                        ? `<div style="font-size:1.8rem;font-weight:800;margin-bottom:12px;color:var(--text-bright);">${num.toLocaleString()}</div>`
                        : `<div style="font-size:1.2rem;font-weight:700;margin-bottom:12px;color:var(--text-bright);font-style:italic;">"${wordForm}"</div>`
                    }
                    <div style="display:inline-flex;gap:4px;padding:10px 16px;background:var(--bg-card);border-radius:12px;border:2px solid var(--accent-cyan);">
                        ${chartCols}
                    </div>
                    <div style="margin-top:10px;font-size:0.85rem;color:var(--text-dim);">
                        ${mode === "to_words" ? 'Write this number using words' : 'Write this as a numeral'}
                    </div>
                </div>`;
                return;
            } else if (placeSkill === "place_value_10x") {
                // Grade 5: 10x and /10 relationships
                const opType = pick(["multiply", "divide"]);
                const powerChoice = pick([10, 100, 1000]);
                const maxBase = Math.max(1, Math.min(Math.floor(range / powerChoice), 999));

                let num, answer, opSymbol, opName;

                if (opType === "multiply") {
                    // Generate number that can include decimals
                    const useDecimal = Math.random() < 0.5 && powerChoice <= 100;
                    if (useDecimal) {
                        const wholePart = rng(1, Math.max(1, Math.min(maxBase, 99)));
                        const decPart = rng(1, 99);
                        num = parseFloat(`${wholePart}.${decPart.toString().padStart(2, '0')}`);
                    } else {
                        num = rng(1, Math.max(1, maxBase));
                    }
                    answer = parseFloat((num * powerChoice).toFixed(4));
                    opSymbol = '\u00d7';
                    opName = 'multiply';
                } else {
                    // Divide: ensure clean result
                    const useDecimal = Math.random() < 0.4;
                    if (useDecimal) {
                        const base = rng(1, Math.max(1, Math.min(Math.floor(range / 10), 99)));
                        num = base * powerChoice;
                        if (num === 0) num = powerChoice;
                    } else {
                        num = rng(1, Math.max(1, range)) * powerChoice / powerChoice;
                        num = Math.round(num) * powerChoice;
                        if (num === 0) num = powerChoice;
                    }
                    // Recalculate to ensure clean
                    num = rng(1, Math.max(1, Math.floor(range))) * powerChoice;
                    if (num === 0) num = powerChoice;
                    answer = parseFloat((num / powerChoice).toFixed(4));
                    opSymbol = '\u00f7';
                    opName = 'divide';
                }

                q.text = `What is ${num.toLocaleString()} ${opSymbol} ${powerChoice}?`;
                q.ans = answer;
                q.answerType = "number";
                q.hint = opType === "multiply"
                    ? `When you multiply by ${powerChoice}, move the decimal point ${Math.log10(powerChoice)} place(s) to the right.`
                    : `When you divide by ${powerChoice}, move the decimal point ${Math.log10(powerChoice)} place(s) to the left.`;
                q.skillLabel = 'PV \u00d710';
                q.options = buildNumericOptions(answer);

                // Place value chart showing digit movement
                const numStr = num.toString();
                const ansStr = answer.toString();
                const direction = opType === "multiply" ? "right" : "left";
                const places = Math.log10(powerChoice);
                const arrowChar = opType === "multiply" ? '\u2192' : '\u2190';

                const pvHeaders = ['Th', 'H', 'T', 'O', '.', '1/10', '1/100'];
                const pvHeaderFull = ['Thousands', 'Hundreds', 'Tens', 'Ones', '.', 'Tenths', 'Hundredths'];

                // Helper to place digits into chart columns
                const placeInChart = (s) => {
                    const parts = s.toString().split('.');
                    const whole = parts[0].split('');
                    const dec = parts[1] ? parts[1].split('') : [];
                    const result = ['', '', '', '', '.', '', ''];
                    // Right-align whole part before decimal
                    for (let i = 0; i < whole.length && i < 4; i++) {
                        result[3 - (whole.length - 1 - i)] = whole[i];
                    }
                    // Left-align decimal part after decimal
                    for (let i = 0; i < dec.length && i < 2; i++) {
                        result[5 + i] = dec[i];
                    }
                    return result;
                };

                const numChart = placeInChart(num);
                const ansChart = placeInChart(answer);

                const headerRow = pvHeaders.map((h, i) =>
                    `<th style="padding:4px 8px;border:1px solid var(--text-dim);font-size:0.65rem;color:var(--text-dim);background:var(--bg-card);min-width:30px;">${h}</th>`
                ).join('');
                const numRow = numChart.map((d, i) =>
                    `<td style="padding:8px;border:1px solid var(--text-dim);text-align:center;font-weight:700;font-size:1rem;${d && d !== '.' ? 'color:var(--accent-cyan);' : 'color:var(--text-dim);'}">${d || (i === 4 ? '.' : '')}</td>`
                ).join('');
                const ansRow = ansChart.map((d, i) =>
                    `<td style="padding:8px;border:1px solid var(--text-dim);text-align:center;font-weight:700;font-size:1rem;${d && d !== '.' ? 'color:var(--accent-green);' : 'color:var(--text-dim);'}">${d || (i === 4 ? '.' : '')}</td>`
                ).join('');

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">${opSymbol} ${powerChoice}: Move digits ${direction}</div>
                    <table style="margin:0 auto;border-collapse:collapse;border:2px solid var(--text-dim);">
                        <tr>${headerRow}</tr>
                        <tr>${numRow}</tr>
                        <tr>
                            <td colspan="7" style="padding:4px;text-align:center;font-size:1.1rem;color:var(--accent-orange);font-weight:700;">
                                ${arrowChar.repeat(Math.round(places))} ${opSymbol} ${powerChoice} ${arrowChar.repeat(Math.round(places))}
                            </td>
                        </tr>
                        <tr>${ansRow}</tr>
                    </table>
                    <div style="margin-top:10px;font-size:0.85rem;color:var(--text-dim);">
                        Digits shift <strong>${Math.round(places)}</strong> place(s) to the <strong>${direction}</strong>
                    </div>
                </div>`;
                return;
            } else if (placeSkill === "compare") {
                // Level 2: Compare Numbers (>, <, =)
                // Scale digit count based on range: range 100→3, 1000→4, 10000→5, 100000→6
                const maxDigits = Math.max(3, Math.min(range.toString().length, 6));
                const numDigits = rng(3, maxDigits);
                const base = rng(Math.pow(10, numDigits - 1), Math.pow(10, numDigits) - 100);

                const diffType = pick(["different", "same", "close"]);
                let num1, num2;

                if (diffType === "same") {
                    num1 = base;
                    num2 = base;
                } else if (diffType === "close") {
                    num1 = base;
                    num2 = base + rng(1, 9);
                } else {
                    num1 = base;
                    num2 = base + rng(10, 500) * (Math.random() < 0.5 ? 1 : -1);
                    if (num2 < Math.pow(10, numDigits - 1)) num2 = base + rng(10, 500);
                }

                if (Math.random() < 0.5 && num1 !== num2) {
                    [num1, num2] = [num2, num1];
                }

                q.text = `Compare: ${num1.toLocaleString()} ___ ${num2.toLocaleString()}`;
                q.ans = num1 > num2 ? ">" : num1 < num2 ? "<" : "=";
                q.answerType = "symbol";
                q.options = [">", "<", "="];
                q.hint = `Compare digit by digit from left to right. Which number is greater?`;
                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:15px;">
                        <div style="font-size:2rem;font-weight:700;color:var(--accent-cyan);">${num1.toLocaleString()}</div>
                        <div style="font-size:2rem;color:var(--accent-orange);">?</div>
                        <div style="font-size:2rem;font-weight:700;color:var(--accent-purple);">${num2.toLocaleString()}</div>
                    </div>
                    <div style="font-size:0.9rem;color:var(--text-dim);">Is it >, <, or = ?</div>
                </div>`;
            } else if (placeSkill === "value" || placeSkill === "identify") {
                // Original place value skills
                // Scale digit count based on range
                const pvMaxDigits = Math.max(3, Math.min(range.toString().length, 6));
                const numDigits = rng(3, pvMaxDigits);
                const max = Math.pow(10, numDigits) - 1;
                const placeNames = ["ones","tens","hundreds","thousands","ten-thousands","hundred-thousands"];

                // Generate a number with unique digits to avoid ambiguity
                let num, numStr, idx, digit, placeIndex;
                let attempts = 0;
                const maxAttempts = 50;

                do {
                    num = rng(Math.pow(10, numDigits - 1), max);
                    numStr = num.toString();
                    idx = randInt(0, numStr.length - 1);
                    digit = parseInt(numStr[idx], 10);
                    placeIndex = numStr.length - 1 - idx;
                    attempts++;

                    // Check if this digit appears only once in the number
                    const digitCount = numStr.split('').filter(d => d === digit.toString()).length;
                    if (digitCount === 1) break; // Found a unique digit position

                } while (attempts < maxAttempts);

                // If we couldn't find unique digit, reference by place name instead
                const digitCount = numStr.split('').filter(d => d === digit.toString()).length;
                const usePositionReference = digitCount > 1;

                const highlightedNum = numStr.split("").map((d, i) => {
                    if (i === idx) return `<span style="background:var(--accent-orange);color:white;padding:4px 8px;border-radius:6px;font-weight:900;">${d}</span>`;
                    return `<span style="padding:4px 8px;">${d}</span>`;
                }).join("");

                if (placeSkill === "value") {
                    // Reference by place if digit appears multiple times
                    if (usePositionReference) {
                        q.text = `What is the value of the digit in the ${placeNames[placeIndex]} place in ${num.toLocaleString()}?`;
                    } else {
                        q.text = `What is the value of ${digit} in ${num.toLocaleString()}?`;
                    }
                    q.ans = digit * Math.pow(10, placeIndex);
                    q.options = buildNumericOptions(q.ans);
                    q.hint = `The ${digit} is in the ${placeNames[placeIndex]} place. Multiply: ${digit} × ${"1".padEnd(placeIndex+1,"0")} = ?`;
                    q.visual = `<div style="text-align:center;">
                        <div style="font-size:2rem;font-weight:700;margin-bottom:10px;letter-spacing:2px;">${highlightedNum}</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">The highlighted digit ${digit} is in the <span style="color:var(--accent-orange);font-weight:700;">${placeNames[placeIndex]}</span> place</div>
                        <div style="margin-top:10px;font-weight:700;">${digit} × ${"1".padEnd(placeIndex+1,"0")} = ?</div>
                    </div>`;
                } else {
                    // For identify, always reference by place since we're asking about the place
                    if (usePositionReference) {
                        q.text = `Look at the highlighted digit in ${num.toLocaleString()}. Which place is it in?`;
                    } else {
                        q.text = `Which place is the digit ${digit} in ${num.toLocaleString()}?`;
                    }
                    q.answerType = "text";
                    q.ans = placeNames[placeIndex];
                    q.options = shuffle([placeNames[placeIndex], ...shuffle(placeNames.filter(p=>p!==placeNames[placeIndex])).slice(0,3)]);
                    q.hint = `Count positions from the right: ones (1st), tens (2nd), hundreds (3rd), thousands (4th)...`;
                    q.visual = `<div style="text-align:center;">
                        <div style="font-size:2rem;font-weight:700;margin-bottom:10px;letter-spacing:2px;">${highlightedNum}</div>
                        <div style="display:flex;justify-content:center;gap:4px;font-size:0.7rem;color:var(--text-dim);flex-wrap:wrap;">
                            ${numStr.split("").reverse().map((d, i) => `<span style="padding:2px 6px;${numStr.length - 1 - idx === i ? 'background:var(--accent-orange);color:white;border-radius:4px;' : ''}">${placeNames[i]}</span>`).reverse().join("")}
                        </div>
                    </div>`;
                }
            } else if (placeSkill === "expand" || placeSkill === "combine") {
                // Partitioning skills
                const minNum = Math.max(10, Math.floor(range / 10));
                const num = rng(minNum, Math.min(range, 999999));
                const digits = num.toString().split("").map(Number);
                const expanded = digits.map((d,i)=>(d*Math.pow(10,digits.length-i-1)).toLocaleString()).join(" + ");
                const placeNames = ["ones","tens","hundreds","thousands","ten-thousands","hundred-thousands"];

                if (placeSkill === "expand") {
                    // Randomly choose between input boxes and multiple choice
                    const expandMode = pick(["input", "choice"]);

                    if (expandMode === "input") {
                        // Interactive expanded form with input boxes
                        q.text = `Write the expanded form of ${num.toLocaleString()}:`;
                        q.answerType = "interactive";
                        q.interactiveType = "expanded";
                        q.expandedNumber = num;
                        q.expandedDigits = digits;
                        q.expandedValues = digits.map((d, i) => d * Math.pow(10, digits.length - i - 1));
                        q.ans = q.expandedValues.join(",");
                        q.options = [];
                        q.hint = `Break apart each digit by its place value. ${digits[0]} is in the ${placeNames[digits.length-1]} place...`;
                        q.visual = "";
                    } else {
                        // Multiple choice mode
                        q.text = `Which option shows the expanded form of ${num.toLocaleString()}?`;
                        q.answerType = "text";
                        q.ans = expanded;
                        const wrongs = new Set();
                        let attempts = 0;
                        while (wrongs.size < 3 && attempts < 50) {
                            attempts++;
                            const wrongExp = shuffle([...digits]).map((d,i)=>(d*Math.pow(10,digits.length-i-1)).toLocaleString()).join(" + ");
                            if (wrongExp !== expanded) wrongs.add(wrongExp);
                        }
                        while (wrongs.size < 3) {
                            wrongs.add((num + wrongs.size + 1).toString().split("").map((d,i,a)=>(parseInt(d)*Math.pow(10,a.length-i-1)).toLocaleString()).join(" + "));
                        }
                        q.options = shuffle([q.ans, ...wrongs]);
                        q.hint = `Break apart each digit by its place value. ${digits[0]} is in the ${placeNames[digits.length-1]} place...`;
                        q.visual = `<div style="text-align:center;">
                            <div style="font-size:2rem;font-weight:900;margin-bottom:15px;">${num.toLocaleString()}</div>
                            <div style="font-size:0.9rem;color:var(--text-dim);">What is each digit worth in its place?</div>
                        </div>`;
                    }
                } else {
                    q.text = `What number equals ${expanded}?`;
                    q.ans = num;
                    q.options = buildNumericOptions(num);
                    q.hint = `Add all the parts together: ${expanded} = ?`;
                    q.visual = `<div style="text-align:center;">
                        <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;align-items:center;">
                            ${digits.map((d, i) => {
                                const value = d * Math.pow(10, digits.length - i - 1);
                                const colors = ['var(--accent-purple)', 'var(--accent-cyan)', 'var(--accent-green)', 'var(--accent-orange)'];
                                return `<div style="background:${colors[digits.length - i - 1] || colors[0]};color:white;padding:8px 14px;border-radius:10px;font-weight:700;">${value.toLocaleString()}</div>`;
                            }).join('<span style="font-size:1.5rem;color:var(--text-dim);">+</span>')}
                        </div>
                        <div style="margin-top:10px;font-weight:700;font-size:1.2rem;color:var(--accent-green);">= ?</div>
                    </div>`;
                }
            } else if (placeSkill === "order_asc" || placeSkill === "order_desc") {
                // Ordering skills (order_asc or order_desc)
                // Ensure unique numbers to avoid confusion
                const arrSet = new Set();
                while (arrSet.size < 4) {
                    arrSet.add(rng(1, range));
                }
                const arr = Array.from(arrSet);
                const sortedAsc = [...arr].sort((a,b)=>a-b);
                const sortedDesc = [...arr].sort((a,b)=>b-a);
                const isAsc = placeSkill === "order_asc";
                const asc = sortedAsc.map(n => n.toLocaleString()).join(" \u2192 ");
                const desc = sortedDesc.map(n => n.toLocaleString()).join(" \u2192 ");

                const ascPhrases = [
                    { text: "smallest to largest", icon: "\ud83d\udd3c Smallest \u2192 Largest", hint: "smallest" },
                    { text: "least to greatest", icon: "\ud83d\udd3c Least \u2192 Greatest", hint: "least" },
                    { text: "increasing order", icon: "\ud83d\udcc8 Increasing Order", hint: "smallest" }
                ];
                const descPhrases = [
                    { text: "largest to smallest", icon: "\ud83d\udd3d Largest \u2192 Smallest", hint: "largest" },
                    { text: "greatest to least", icon: "\ud83d\udd3d Greatest \u2192 Least", hint: "greatest" },
                    { text: "decreasing order", icon: "\ud83d\udcc9 Decreasing Order", hint: "largest" }
                ];
                const phrase = isAsc ? pick(ascPhrases) : pick(descPhrases);
                const sortedArr = isAsc ? sortedAsc : sortedDesc;

                // Randomly choose between 3 modes: input boxes, click-to-order, or multiple choice
                const orderMode = pick(["input", "click", "choice"]);

                if (orderMode === "input") {
                    // Input boxes mode - students type each number
                    q.answerType = "interactive";
                    q.interactiveType = "ordering";
                    q.orderMode = "input";
                    q.orderDirection = isAsc ? "asc" : "desc";
                    q.orderIcon = phrase.icon;
                    q.numbers = arr;
                    q.sortedNumbers = sortedArr;
                    q.text = `Write the numbers in order from ${phrase.text}:`;
                    q.ans = sortedArr.join(",");
                    q.hint = `Find the ${phrase.hint} number first, then write it. Then find the next ${phrase.hint}, and so on.`;
                    q.options = [];
                    q.visual = "";
                } else if (orderMode === "click") {
                    // Click-to-order mode - students click numbers in sequence
                    q.answerType = "interactive";
                    q.interactiveType = "ordering";
                    q.orderMode = "click";
                    q.orderDirection = isAsc ? "asc" : "desc";
                    q.orderIcon = phrase.icon;
                    q.numbers = arr;
                    q.sortedNumbers = sortedArr;
                    q.text = `Click the numbers in order from ${phrase.text}:`;
                    q.ans = sortedArr.join(",");
                    q.hint = `Find the ${phrase.hint} number first, then click it. Then find the next ${phrase.hint}, and so on.`;
                    q.options = [];
                    q.visual = "";
                } else {
                    // Multiple choice mode - pick the correct order
                    q.answerType = "text";
                    q.text = `Which list is in order from ${phrase.text}?`;
                    q.ans = isAsc ? asc : desc;
                    q.hint = `Find the ${phrase.hint} number first, then the next ${phrase.hint}, and so on.`;
                    const wrongs = new Set();
                    let orderAttempts = 0;
                    while (wrongs.size < 3 && orderAttempts < 50) {
                        orderAttempts++;
                        const wrongOrder = shuffle([...arr]).map(n => n.toLocaleString()).join(" \u2192 ");
                        if (wrongOrder !== q.ans) wrongs.add(wrongOrder);
                    }
                    q.options = shuffle([q.ans, ...wrongs]);
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;">Compare these numbers:</div>
                        <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
                            ${arr.map(n => `<div style="background:var(--accent-cyan);color:white;padding:12px 18px;border-radius:12px;font-weight:800;font-size:1.1rem;">${n.toLocaleString()}</div>`).join("")}
                        </div>
                        <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">${phrase.icon}</div>
                    </div>`;
                }
            } else if (placeSkill === "place_value_disks") {
                // Place Value Disks - colored circles representing place values
                const pvColors = { 1: 'var(--accent-green)', 10: '#3b82f6', 100: 'var(--accent-orange)', 1000: 'var(--accent-purple)' };
                const pvLabels = { 1: 'Ones', 10: 'Tens', 100: 'Hundreds', 1000: 'Thousands' };
                const questionType = pick(["count_disks", "how_many"]);

                if (questionType === "count_disks") {
                    // Type A: "What number do these disks represent?" - scale with range
                    let thousands = range >= 1000 ? rng(0, Math.min(4, Math.floor(range / 1000))) : 0;
                    let hundreds = range >= 100 ? rng(1, 9) : 0;
                    let tens = rng(1, 9);
                    let ones = rng(1, 9);
                    let total = thousands * 1000 + hundreds * 100 + tens * 10 + ones;
                    // Ensure non-zero and at least 2 place values used
                    if (total === 0 || [thousands, hundreds, tens, ones].filter(x => x > 0).length < 2) {
                        hundreds = range >= 100 ? rng(1, 5) : 0;
                        tens = rng(1, 9);
                        ones = rng(1, 9);
                        thousands = 0;
                        total = hundreds * 100 + tens * 10 + ones;
                    }

                    q.text = `What number do these place value disks represent?`;
                    q.ans = total;
                    const parts = [];
                    if (thousands > 0) parts.push(`${thousands} thousands (${thousands * 1000})`);
                    if (hundreds > 0) parts.push(`${hundreds} hundreds (${hundreds * 100})`);
                    if (tens > 0) parts.push(`${tens} tens (${tens * 10})`);
                    if (ones > 0) parts.push(`${ones} ones (${ones})`);
                    q.hint = `Add up: ${parts.join(' + ')}`;

                    const makeDiskRow = (count, value) => {
                        if (count === 0) return '';
                        const color = pvColors[value];
                        const disks = Array.from({length: count}, () =>
                            `<div style="width:36px;height:36px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.7rem;border:2px solid rgba(255,255,255,0.3);">${value}</div>`
                        ).join('');
                        return `<div style="margin:6px 0;">
                            <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:3px;">${pvLabels[value]}</div>
                            <div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;">${disks}</div>
                        </div>`;
                    };

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Place Value Disks</div>
                        ${makeDiskRow(thousands, 1000)}
                        ${makeDiskRow(hundreds, 100)}
                        ${makeDiskRow(tens, 10)}
                        ${makeDiskRow(ones, 1)}
                        <div style="margin-top:12px;font-size:1.1rem;">Total = <span style="border-bottom:2px dashed var(--accent-green);padding:0 15px;font-weight:700;">?</span></div>
                    </div>`;
                    q.options = buildNumericOptions(total);
                } else {
                    // Type B: "How many [place] disks in [number]?"
                    // Filter place options based on range
                    const placeOptions = [
                        { value: 1, name: 'ones' },
                        { value: 10, name: 'tens' },
                    ];
                    if (range >= 100) placeOptions.push({ value: 100, name: 'hundreds' });
                    if (range >= 1000) placeOptions.push({ value: 1000, name: 'thousands' });
                    const chosenPlace = pick(placeOptions);
                    const pvMax = Math.max(chosenPlace.value * 10, Math.min(range, 9999));
                    let number;
                    if (chosenPlace.value === 1000) {
                        number = rng(1000, pvMax);
                    } else if (chosenPlace.value === 100) {
                        number = rng(100, pvMax);
                    } else if (chosenPlace.value === 10) {
                        number = rng(10, pvMax);
                    } else {
                        number = rng(10, Math.min(pvMax, 999));
                    }

                    const digitAtPlace = Math.floor(number / chosenPlace.value) % 10;
                    const color = pvColors[chosenPlace.value];

                    q.text = `How many ${chosenPlace.name} disks are in ${number.toLocaleString()}?`;
                    q.ans = digitAtPlace;
                    q.hint = `Look at the ${chosenPlace.name} place in ${number.toLocaleString()}. What digit is there?`;

                    // Show the number broken into place value columns
                    const pvDigits = number.toString().split('');
                    const placeVals = [1000, 100, 10, 1];
                    const startIdx = 4 - pvDigits.length;

                    const columns = pvDigits.map((d, i) => {
                        const pv = placeVals[startIdx + i];
                        const isTarget = pv === chosenPlace.value;
                        const diskColor = pvColors[pv];
                        return `<div style="text-align:center;padding:8px;">
                            <div style="font-size:0.7rem;color:var(--text-dim);margin-bottom:4px;">${pvLabels[pv]}</div>
                            <div style="width:44px;height:44px;border-radius:50%;background:${isTarget ? diskColor : 'var(--bg-card-light)'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;border:${isTarget ? '3px solid white' : '2px solid var(--text-dim)'};color:${isTarget ? 'white' : 'var(--text-bright)'};">${isTarget ? '?' : d}</div>
                        </div>`;
                    });

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">PV Disks</div>
                        <div style="font-size:1.4rem;font-weight:700;margin-bottom:10px;">${number.toLocaleString()}</div>
                        <div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;">
                            ${columns.join('')}
                        </div>
                        <div style="margin-top:10px;font-size:0.9rem;">How many <span style="color:${color};font-weight:700;">${chosenPlace.name}</span> disks?</div>
                    </div>`;
                    q.options = buildNumericOptions(digitAtPlace);
                }
                q.skillLabel = 'PV Disks';
                q.printFormat = 'place-value-disks';
            }
            return;
}

export function generateEstimationQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;
            // Estimation Category
            const estMax = Math.max(10, Math.min(range, 1000));
            const estSkill = mappedSkill === "mixed" ? pick(["estimate_sum", "estimate_diff", "estimate_prod", "compatible_numbers", "frontend_estimation", "estimate_sums_diffs", "estimate_products", "make_a_ten", "doubles_near_doubles", "compensation"]) : mappedSkill;

            const estimationMultiSelect = (op) => {
                const roundTo = estMax >= 200 ? pick([10, 100]) : 10;
                let a, b, actual, opSym, label;
                if (op === '+') {
                    a = rng(roundTo + 5, Math.max(roundTo + 10, estMax));
                    b = rng(roundTo + 5, Math.max(roundTo + 10, estMax));
                    actual = a + b;
                    opSym = '+'; label = 'Est. Sum';
                } else if (op === '-') {
                    a = rng(roundTo * 3, Math.max(roundTo * 4, estMax));
                    b = rng(roundTo + 2, Math.max(roundTo + 3, a - roundTo));
                    actual = a - b;
                    opSym = '−'; label = 'Est. Diff';
                } else {
                    const prodMax = Math.max(15, Math.min(estMax, 99));
                    a = rng(12, prodMax);
                    b = rng(2, 9);
                    actual = a * b;
                    opSym = '×'; label = 'Est. Product';
                }
                const tolerance = Math.max(roundTo, Math.ceil(actual * 0.10));
                const candidates = new Set();
                const correctCount = rng(2, 3);
                let safety = 0;
                while (candidates.size < correctCount && safety < 100) {
                    safety++;
                    const offset = rng(-tolerance, tolerance);
                    const v = Math.round((actual + offset) / roundTo) * roundTo;
                    if (v > 0 && Math.abs(v - actual) <= tolerance) candidates.add(v);
                }
                safety = 0;
                while (candidates.size < 5 && safety < 200) {
                    safety++;
                    const big = Math.max(tolerance * 2, Math.ceil(actual * 0.30));
                    const offset = pick([-1, 1]) * (tolerance + rng(big - tolerance, big + tolerance));
                    const v = Math.round((actual + offset) / roundTo) * roundTo;
                    if (v > 0 && Math.abs(v - actual) > tolerance) candidates.add(v);
                }
                const arr = shuffle(Array.from(candidates));
                const options = arr.map((v, i) => ({
                    id: 'opt' + i,
                    label: String(v.toLocaleString()),
                    correct: Math.abs(v - actual) <= tolerance
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL reasonable estimates of ${a} ${opSym} ${b}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Round each number, then ${op === '+' ? 'add' : op === '-' ? 'subtract' : 'multiply'}. Reasonable estimates are within about 10% of the actual answer.`;
                q.printFormat = 'multi-select';
                q.skillLabel = label;
            };

            const estMultiSelectRoll = Math.random() < 0.25;
            if (estMultiSelectRoll && estSkill === "estimate_sum") { estimationMultiSelect('+'); return; }
            if (estMultiSelectRoll && estSkill === "estimate_diff") { estimationMultiSelect('-'); return; }
            if (estMultiSelectRoll && estSkill === "estimate_sums_diffs") { estimationMultiSelect(pick(['+', '-'])); return; }
            if (estMultiSelectRoll && estSkill === "estimate_products") { estimationMultiSelect('*'); return; }

            if (estSkill === "estimate_sum") {
                // Estimate sums by rounding
                // Choose rounding place based on estMax: only use 100 if estMax >= 200
                const roundTo = estMax >= 200 ? pick([10, 100]) : 10;
                const sumMin = roundTo === 10 ? 12 : 101;
                const sumMax = roundTo === 10 ? Math.max(20, Math.min(estMax, 98)) : Math.max(102, Math.min(estMax, 999));
                let a = rng(sumMin, sumMax);
                let b = rng(sumMin, sumMax);
                const aRounded = Math.round(a / roundTo) * roundTo;
                const bRounded = Math.round(b / roundTo) * roundTo;
                const estimate = aRounded + bRounded;
                const actual = a + b;

                q.text = `Estimate: ${a} + ${b}`;
                q.ans = estimate;
                q.hint = `Round each number to the nearest ${roundTo}, then add!`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\ud83d\udccf Estimate the Sum</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${a} + ${b}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:300px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Round to nearest ${roundTo}</div>
                        <div style="display:flex;justify-content:center;gap:20px;margin:10px 0;">
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:var(--text-dim);">${a}</div>
                                <div style="font-size:1.2rem;">\u2192 <span style="color:var(--accent-green);font-weight:700;">${aRounded}</span></div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:var(--text-dim);">${b}</div>
                                <div style="font-size:1.2rem;">\u2192 <span style="color:var(--accent-green);font-weight:700;">${bRounded}</span></div>
                            </div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: Add the rounded numbers</div>
                        <div style="font-size:1.3rem;margin-top:5px;">${aRounded} + ${bRounded} = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                q.estimationData = { a, b, aRounded, bRounded, estimate, actual, roundTo, op: '+', strategy: 'rounding' };
                q.printFormat = "estimation-sum";
            } else if (estSkill === "estimate_diff") {
                // Estimate differences by rounding
                const roundTo = estMax >= 200 ? pick([10, 100]) : 10;
                const diffMaxA = roundTo === 10 ? Math.max(50, Math.min(estMax, 98)) : Math.max(200, Math.min(estMax, 999));
                const diffMinA = roundTo === 10 ? 50 : 500;
                let a = rng(Math.min(diffMinA, diffMaxA), diffMaxA);
                const diffMinB = roundTo === 10 ? 12 : 101;
                let b = rng(diffMinB, Math.max(diffMinB + 1, a - 10));
                const aRounded = Math.round(a / roundTo) * roundTo;
                const bRounded = Math.round(b / roundTo) * roundTo;
                const estimate = aRounded - bRounded;
                const actual = a - b;

                q.text = `Estimate: ${a} - ${b}`;
                q.ans = estimate;
                q.hint = `Round each number to the nearest ${roundTo}, then subtract!`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\ud83d\udccf Estimate the Difference</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${a} - ${b}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:300px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Round to nearest ${roundTo}</div>
                        <div style="display:flex;justify-content:center;gap:20px;margin:10px 0;">
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:var(--text-dim);">${a}</div>
                                <div style="font-size:1.2rem;">\u2192 <span style="color:var(--accent-green);font-weight:700;">${aRounded}</span></div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:var(--text-dim);">${b}</div>
                                <div style="font-size:1.2rem;">\u2192 <span style="color:var(--accent-green);font-weight:700;">${bRounded}</span></div>
                            </div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: Subtract the rounded numbers</div>
                        <div style="font-size:1.3rem;margin-top:5px;">${aRounded} - ${bRounded} = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                q.estimationData = { a, b, aRounded, bRounded, estimate, actual, roundTo, op: '-', strategy: 'rounding' };
                q.printFormat = "estimation-diff";
            } else if (estSkill === "estimate_prod") {
                // Estimate products by rounding
                const roundTo = 10;
                const prodMaxA = Math.max(15, Math.min(estMax, 49));
                let a = rng(12, prodMaxA);
                let b = rng(2, 9);
                const aRounded = Math.round(a / roundTo) * roundTo;
                const estimate = aRounded * b;
                const actual = a * b;

                q.text = `Estimate: ${a} \u00d7 ${b}`;
                q.ans = estimate;
                q.hint = `Round ${a} to the nearest ${roundTo}, then multiply!`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\ud83d\udccf Estimate the Product</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${a} \u00d7 ${b}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:300px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Round to nearest ${roundTo}</div>
                        <div style="text-align:center;margin:10px 0;">
                            <div style="font-size:0.9rem;color:var(--text-dim);">${a} \u2192 <span style="color:var(--accent-green);font-weight:700;">${aRounded}</span></div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: Multiply</div>
                        <div style="font-size:1.3rem;margin-top:5px;">${aRounded} \u00d7 ${b} = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                q.estimationData = { a, b, aRounded, bRounded: b, estimate, actual, roundTo, op: '\u00d7', strategy: 'rounding' };
                q.printFormat = "estimation-prod";
            } else if (estSkill === "compatible_numbers") {
                // Compatible numbers for division
                const divisor = pick([3, 4, 5, 6, 7, 8, 9]);
                const compatMaxQ = Math.max(5, Math.min(Math.floor(estMax / divisor), 15));
                const targetQuotient = rng(5, compatMaxQ);
                const compatible = divisor * targetQuotient;
                // Create dividend that's close to compatible
                const dividend = compatible + rng(-divisor + 1, divisor - 1);
                const estimate = targetQuotient;
                const actual = Math.round(dividend / divisor * 10) / 10;

                q.text = `Use compatible numbers to estimate: ${dividend} \u00f7 ${divisor}`;
                q.ans = estimate;
                q.hint = `Find a number close to ${dividend} that divides evenly by ${divisor}!`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\ud83d\udccf Compatible Numbers</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${dividend} \u00f7 ${divisor}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:320px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Find compatible dividend</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">What number close to ${dividend} divides evenly by ${divisor}?</div>
                        <div style="text-align:center;margin:10px 0;">
                            <div style="font-size:1.1rem;">${dividend} \u2192 <span style="color:var(--accent-green);font-weight:700;">${compatible}</span></div>
                            <div style="font-size:0.8rem;color:var(--text-dim);">(because ${compatible} \u00f7 ${divisor} = ${targetQuotient})</div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: Divide</div>
                        <div style="font-size:1.3rem;margin-top:5px;">${compatible} \u00f7 ${divisor} = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                q.estimationData = { dividend, divisor, compatible, estimate, actual, op: '\u00f7', strategy: 'compatible' };
                q.printFormat = "estimation-compatible";
            } else if (estSkill === "frontend_estimation") {
                // Front-end estimation (requires 3-digit numbers for front-end digit strategy)
                const feMax = Math.max(200, Math.min(estMax, 999));
                const a = rng(100, feMax);
                const b = rng(100, feMax);
                const op = pick(['+', '-']);

                // Get front-end digits (hundreds place)
                const aFront = Math.floor(a / 100) * 100;
                const bFront = Math.floor(b / 100) * 100;

                let estimate, actual;
                if (op === '+') {
                    estimate = aFront + bFront;
                    actual = a + b;
                } else {
                    // Ensure a > b for subtraction
                    const [larger, smaller] = a > b ? [a, b] : [b, a];
                    const largerFront = Math.floor(larger / 100) * 100;
                    const smallerFront = Math.floor(smaller / 100) * 100;
                    estimate = largerFront - smallerFront;
                    actual = larger - smaller;
                    q.estimationData = { a: larger, b: smaller, aFront: largerFront, bFront: smallerFront, estimate, actual, op, strategy: 'frontend' };
                }

                q.text = `Use front-end estimation: ${op === '+' ? a : (a > b ? a : b)} ${op} ${op === '+' ? b : (a > b ? b : a)}`;
                q.ans = estimate;
                q.hint = `Use only the front (hundreds) digits to estimate!`;

                const displayA = op === '+' ? a : (a > b ? a : b);
                const displayB = op === '+' ? b : (a > b ? b : a);
                const displayAFront = op === '+' ? aFront : (a > b ? aFront : bFront);
                const displayBFront = op === '+' ? bFront : (a > b ? bFront : aFront);

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\ud83d\udccf Front-End Estimation</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${displayA} ${op} ${displayB}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:320px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Use front-end digits only</div>
                        <div style="display:flex;justify-content:center;gap:20px;margin:10px 0;">
                            <div style="text-align:center;">
                                <div style="font-size:1.2rem;font-family:monospace;"><span style="color:var(--accent-green);font-weight:700;">${displayA.toString()[0]}</span><span style="color:var(--text-dim);">${displayA.toString().slice(1)}</span></div>
                                <div style="font-size:0.9rem;">\u2192 ${displayAFront}</div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:1.2rem;font-family:monospace;"><span style="color:var(--accent-green);font-weight:700;">${displayB.toString()[0]}</span><span style="color:var(--text-dim);">${displayB.toString().slice(1)}</span></div>
                                <div style="font-size:0.9rem;">\u2192 ${displayBFront}</div>
                            </div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: ${op === '+' ? 'Add' : 'Subtract'}</div>
                        <div style="font-size:1.3rem;margin-top:5px;">${displayAFront} ${op} ${displayBFront} = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                if (!q.estimationData) {
                    q.estimationData = { a: displayA, b: displayB, aFront: displayAFront, bFront: displayBFront, estimate, actual, op, strategy: 'frontend' };
                }
                q.printFormat = "estimation-frontend";
            }

            // ========================================
            // ESTIMATE SUMS & DIFFERENCES (Grade 3)
            // ========================================
            else if (estSkill === "estimate_sums_diffs") {
                const r = Math.random();
                const roundTo = estMax >= 200 ? pick([10, 100]) : 10;
                const placeName = roundTo === 10 ? 'ten' : 'hundred';

                if (r < 0.4) {
                    // Type 1 (40%): Round-then-compute
                    const op = pick(['+', '-']);
                    let a, b;
                    if (op === '+') {
                        a = rng(roundTo + 2, Math.max(roundTo + 5, estMax));
                        b = rng(roundTo + 2, Math.max(roundTo + 5, estMax));
                    } else {
                        a = rng(roundTo * 3, Math.max(roundTo * 4, estMax));
                        b = rng(roundTo + 2, Math.max(roundTo + 3, a - roundTo));
                    }
                    const aR = Math.round(a / roundTo) * roundTo;
                    const bR = Math.round(b / roundTo) * roundTo;
                    const estimate = op === '+' ? aR + bR : aR - bR;
                    const opName = op === '+' ? 'add' : 'subtract';

                    q.text = `Round to the nearest ${placeName}, then ${opName}: ${a} ${op} ${b} \u2248 ?`;
                    q.ans = estimate;
                    q.hint = `${a} \u2192 ${aR}, ${b} \u2192 ${bR}, then ${aR} ${op} ${bR} = ${estimate}`;
                    q.options = buildNumericOptions(estimate);
                    q.skillLabel = 'Est. Sums/Diffs';
                    q.printFormat = 'estimation-sums-diffs';
                } else if (r < 0.7) {
                    // Type 2 (30%): Closest estimate (MC)
                    const op = pick(['+', '-']);
                    let a, b;
                    if (op === '+') {
                        a = rng(roundTo + 2, Math.max(roundTo + 5, estMax));
                        b = rng(roundTo + 2, Math.max(roundTo + 5, estMax));
                    } else {
                        a = rng(roundTo * 3, Math.max(roundTo * 4, estMax));
                        b = rng(roundTo + 2, Math.max(roundTo + 3, a - roundTo));
                    }
                    const aR = Math.round(a / roundTo) * roundTo;
                    const bR = Math.round(b / roundTo) * roundTo;
                    const estimate = op === '+' ? aR + bR : aR - bR;
                    // Build MC choices spaced by roundTo
                    const choices = [estimate, estimate + roundTo, estimate - roundTo, estimate + roundTo * 2].filter(x => x >= 0);
                    while (choices.length < 4) choices.push(estimate + roundTo * (choices.length));

                    q.text = `${a} ${op} ${b} is closest to:`;
                    q.ans = estimate;
                    q.hint = `Round each number to the nearest ${placeName} first!`;
                    q.answerType = 'multiple-choice';
                    q.options = shuffle([...new Set(choices)]).slice(0, 4).map(String);
                    q.skillLabel = 'Est. Sums/Diffs';
                    q.printFormat = 'estimation-sums-diffs';
                } else {
                    // Type 3 (30%): Reasonable check
                    const op = pick(['+', '-']);
                    let a, b;
                    if (op === '+') {
                        a = rng(roundTo + 5, Math.max(roundTo + 10, estMax));
                        b = rng(roundTo + 5, Math.max(roundTo + 10, estMax));
                    } else {
                        a = rng(roundTo * 3, Math.max(roundTo * 4, estMax));
                        b = rng(roundTo + 2, Math.max(roundTo + 3, a - roundTo));
                    }
                    const actual = op === '+' ? a + b : a - b;
                    // Create a wrong answer that's clearly off
                    const errorType = pick(['too_low', 'too_high']);
                    const wrongAns = errorType === 'too_low'
                        ? actual - rng(Math.max(20, Math.floor(actual * 0.3)), Math.max(30, Math.floor(actual * 0.5)))
                        : actual + rng(Math.max(20, Math.floor(actual * 0.3)), Math.max(30, Math.floor(actual * 0.5)));
                    const correctChoice = errorType === 'too_low' ? 'No, too low' : 'No, too high';

                    q.text = `Is this reasonable? ${a} ${op} ${b} = ${wrongAns}`;
                    q.ans = correctChoice;
                    q.hint = `Estimate by rounding: ${Math.round(a / roundTo) * roundTo} ${op} ${Math.round(b / roundTo) * roundTo} = ${op === '+' ? Math.round(a / roundTo) * roundTo + Math.round(b / roundTo) * roundTo : Math.round(a / roundTo) * roundTo - Math.round(b / roundTo) * roundTo}. Is ${wrongAns} close?`;
                    q.answerType = 'multiple-choice';
                    q.options = shuffle(['No, too low', 'Yes, reasonable', 'No, too high']);
                    q.skillLabel = 'Est. Sums/Diffs';
                    q.printFormat = 'estimation-sums-diffs';
                }
            }

            // ========================================
            // ESTIMATE PRODUCTS (Grade 4)
            // ========================================
            else if (estSkill === "estimate_products") {
                const r = Math.random();
                const roundTo = 10;

                if (r < 0.4) {
                    // Type 1 (40%): Round-then-multiply
                    const prodMax = Math.max(15, Math.min(estMax, 99));
                    const a = rng(12, prodMax);
                    const b = rng(2, 9);
                    const aR = Math.round(a / roundTo) * roundTo;
                    const estimate = aR * b;

                    q.text = `Estimate: ${a} \u00d7 ${b} \u2248 ?`;
                    q.ans = estimate;
                    q.hint = `${a} \u2192 ${aR}, then ${aR} \u00d7 ${b} = ${estimate}`;
                    q.options = buildNumericOptions(estimate);
                    q.skillLabel = 'Est. Products';
                    q.printFormat = 'estimation-products';
                } else if (r < 0.7) {
                    // Type 2 (30%): Closest estimate (MC)
                    const prodMax = Math.max(15, Math.min(estMax, 99));
                    const a = rng(12, prodMax);
                    const b = rng(2, 9);
                    const aR = Math.round(a / roundTo) * roundTo;
                    const estimate = aR * b;
                    const step = roundTo * b;
                    const choices = [estimate, estimate + step, estimate - step, estimate + step * 2].filter(x => x > 0);
                    while (choices.length < 4) choices.push(estimate + step * choices.length);

                    q.text = `${a} \u00d7 ${b} is closest to:`;
                    q.ans = estimate;
                    q.hint = `Round ${a} to the nearest ten first!`;
                    q.answerType = 'multiple-choice';
                    q.options = shuffle([...new Set(choices)]).slice(0, 4).map(String);
                    q.skillLabel = 'Est. Products';
                    q.printFormat = 'estimation-products';
                } else {
                    // Type 3 (30%): Reasonable check
                    const prodMax = Math.max(15, Math.min(estMax, 99));
                    const a = rng(12, prodMax);
                    const b = rng(2, 9);
                    const actual = a * b;
                    const errorType = pick(['too_low', 'too_high']);
                    const wrongAns = errorType === 'too_low'
                        ? Math.max(1, actual - rng(Math.max(20, Math.floor(actual * 0.4)), Math.max(30, Math.floor(actual * 0.6))))
                        : actual + rng(Math.max(20, Math.floor(actual * 0.4)), Math.max(30, Math.floor(actual * 0.6)));
                    const correctChoice = errorType === 'too_low' ? 'No, too low' : 'No, too high';

                    q.text = `Is this reasonable? ${a} \u00d7 ${b} = ${wrongAns}`;
                    q.ans = correctChoice;
                    q.hint = `Estimate: ${Math.round(a / roundTo) * roundTo} \u00d7 ${b} = ${Math.round(a / roundTo) * roundTo * b}. Is ${wrongAns} close?`;
                    q.answerType = 'multiple-choice';
                    q.options = shuffle(['No, too low', 'Yes, reasonable', 'No, too high']);
                    q.skillLabel = 'Est. Products';
                    q.printFormat = 'estimation-products';
                }
            }

            // ========================================
            // MAKE A TEN STRATEGY (Grade 1)
            // ========================================
            else if (estSkill === "make_a_ten") {
                const r = Math.random();

                if (r < 0.5) {
                    // Type 1 (50%): Complete the make-ten decomposition
                    // Pick first addend 6-9 (where making ten is useful)
                    const a = rng(6, 9);
                    const complement = 10 - a; // how much a needs to reach 10
                    // Second addend must be > complement so we can decompose
                    const b = rng(complement + 1, complement + 5);
                    const remainder = b - complement;
                    const total = a + b;

                    q.text = `Use Make a Ten: ${a} + ${b} = ?`;
                    q.ans = total;
                    q.hint = `${a} + ${complement} = 10, so ${a} + ${b} = ${a} + ${complement} + ${remainder} = 10 + ${remainder} = ${total}`;
                    q.answerType = 'number';

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Make a Ten!</div>
                        <div style="font-size:1.4rem;margin:10px 0;">${a} + ${b}</div>
                        <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:10px auto;max-width:320px;">
                            <div style="font-size:1.1rem;margin:8px 0;">
                                <span style="color:var(--accent-cyan);font-weight:700;">${a}</span> +
                                <span style="color:var(--accent-orange);font-weight:700;">${complement}</span> +
                                <span style="color:var(--accent-green);font-weight:700;">${remainder}</span>
                            </div>
                            <div style="font-size:0.9rem;color:var(--text-dim);margin:5px 0;">
                                Split ${b} into ${complement} + ${remainder}
                            </div>
                            <div style="font-size:1.2rem;margin:8px 0;">
                                = <span style="color:var(--accent-purple);font-weight:700;">10</span> +
                                <span style="color:var(--accent-green);font-weight:700;">${remainder}</span>
                                = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span>
                            </div>
                        </div>
                    </div>`;
                    q.options = buildNumericOptions(total);
                    q.skillLabel = 'Make a Ten';
                    q.printFormat = 'make-a-ten';
                } else {
                    // Type 2 (50%): Choose the correct make-ten decomposition (MC)
                    const a = rng(6, 9);
                    const complement = 10 - a;
                    const b = rng(complement + 1, complement + 5);
                    const remainder = b - complement;
                    const total = a + b;
                    const correct = `${a} + ${complement} + ${remainder}`;
                    // Wrong decompositions
                    const wrong1 = `${a} + ${complement + 1} + ${Math.max(0, remainder - 1)}`;
                    const wrong2 = `${a} + ${Math.max(1, complement - 1)} + ${remainder + 1}`;
                    const wrong3 = `${a + 1} + ${complement} + ${Math.max(0, remainder - 1)}`;

                    q.text = `Which shows the Make a Ten way to add ${a} + ${b}?`;
                    q.ans = correct;
                    q.hint = `${a} needs ${complement} more to make 10. Split ${b} into ${complement} and ${remainder}.`;
                    q.answerType = 'multiple-choice';
                    q.options = shuffle([correct, wrong1, wrong2, wrong3]);
                    q.skillLabel = 'Make a Ten';
                    q.printFormat = 'make-a-ten';
                }
            }

            // ========================================
            // DOUBLES & NEAR DOUBLES (Grade 1)
            // ========================================
            else if (estSkill === "doubles_near_doubles") {
                const r = Math.random();

                if (r < 0.4) {
                    // Type 1 (40%): Doubles fact
                    const n = rng(1, 10);
                    const total = n + n;

                    q.text = `Double it! ${n} + ${n} = ?`;
                    q.ans = total;
                    q.hint = `${n} + ${n} means two groups of ${n}. Count: ${total}`;
                    q.answerType = 'number';
                    q.options = buildNumericOptions(total);
                    q.skillLabel = 'Doubles';
                    q.printFormat = 'doubles';
                } else if (r < 0.7) {
                    // Type 2 (30%): Doubles plus one
                    const n = rng(2, 9);
                    const total = n + n + 1;

                    q.text = `Use doubles: ${n} + ${n + 1} = ?`;
                    q.ans = total;
                    q.hint = `Think: ${n} + ${n} = ${n * 2}, then add 1 more. ${n * 2} + 1 = ${total}`;
                    q.answerType = 'number';

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Doubles + 1</div>
                        <div style="font-size:1.3rem;margin:10px 0;">${n} + ${n + 1}</div>
                        <div style="background:var(--bg-card);padding:12px;border-radius:12px;margin:10px auto;max-width:280px;">
                            <div style="font-size:1rem;margin:5px 0;">
                                ${n} + ${n} = <span style="color:var(--accent-cyan);font-weight:700;">${n * 2}</span>
                            </div>
                            <div style="font-size:1rem;margin:5px 0;">
                                ${n * 2} + 1 = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span>
                            </div>
                        </div>
                    </div>`;
                    q.options = buildNumericOptions(total);
                    q.skillLabel = 'Near Doubles';
                    q.printFormat = 'doubles';
                } else {
                    // Type 3 (30%): Doubles minus one
                    const n = rng(3, 10);
                    const total = n + n - 1;

                    q.text = `Use doubles: ${n} + ${n - 1} = ?`;
                    q.ans = total;
                    q.hint = `Think: ${n} + ${n} = ${n * 2}, then subtract 1. ${n * 2} - 1 = ${total}`;
                    q.answerType = 'number';

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Doubles - 1</div>
                        <div style="font-size:1.3rem;margin:10px 0;">${n} + ${n - 1}</div>
                        <div style="background:var(--bg-card);padding:12px;border-radius:12px;margin:10px auto;max-width:280px;">
                            <div style="font-size:1rem;margin:5px 0;">
                                ${n} + ${n} = <span style="color:var(--accent-cyan);font-weight:700;">${n * 2}</span>
                            </div>
                            <div style="font-size:1rem;margin:5px 0;">
                                ${n * 2} - 1 = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span>
                            </div>
                        </div>
                    </div>`;
                    q.options = buildNumericOptions(total);
                    q.skillLabel = 'Near Doubles';
                    q.printFormat = 'doubles';
                }
            }

            // ========================================
            // COMPENSATION STRATEGY (Grade 2)
            // ========================================
            else if (estSkill === "compensation") {
                const r = Math.random();

                if (r < 0.5) {
                    // Type 1 (50%): Add with compensation
                    // One addend is close to a round number (like 19, 29, 38, 49, 99)
                    const roundTarget = pick([10, 20, 30, 40, 50, 100]);
                    const diff = rng(1, 3); // how far from the round number
                    const nearRound = roundTarget - diff; // e.g., 19, 28, 47, 99
                    const maxB = Math.max(5, Math.min(estMax - roundTarget, 50));
                    const b = rng(3, maxB);
                    const total = nearRound + b;
                    const adjusted = b - diff;

                    q.text = `Use compensation: ${nearRound} + ${b} = ?`;
                    q.ans = total;
                    q.hint = `Add ${diff} to ${nearRound} to make ${roundTarget}. Subtract ${diff} from ${b} to get ${adjusted}. ${roundTarget} + ${adjusted} = ${total}`;
                    q.answerType = 'number';

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Compensation Strategy</div>
                        <div style="font-size:1.3rem;margin:10px 0;">${nearRound} + ${b}</div>
                        <div style="background:var(--bg-card);padding:12px;border-radius:12px;margin:10px auto;max-width:320px;">
                            <div style="font-size:0.95rem;color:var(--text-dim);margin:5px 0;">
                                Add ${diff} to ${nearRound} \u2192 <span style="color:var(--accent-cyan);font-weight:700;">${roundTarget}</span>
                            </div>
                            <div style="font-size:0.95rem;color:var(--text-dim);margin:5px 0;">
                                Subtract ${diff} from ${b} \u2192 <span style="color:var(--accent-orange);font-weight:700;">${adjusted}</span>
                            </div>
                            <div style="font-size:1.2rem;margin:8px 0;">
                                ${roundTarget} + ${adjusted} = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span>
                            </div>
                        </div>
                    </div>`;
                    q.options = buildNumericOptions(total);
                    q.skillLabel = 'Compensation';
                    q.printFormat = 'compensation';
                } else {
                    // Type 2 (50%): Subtract with compensation
                    // Subtrahend is close to a round number
                    const roundTarget = pick([10, 20, 30, 50]);
                    const diff = rng(1, 3);
                    const nearRound = roundTarget - diff; // e.g., 9, 18, 27, 49
                    const minA = roundTarget + 5;
                    const a = rng(minA, Math.max(minA + 10, Math.min(estMax, 100)));
                    const total = a - nearRound;
                    const adjusted = a - roundTarget; // subtracted too much
                    // total = adjusted + diff

                    q.text = `Use compensation: ${a} - ${nearRound} = ?`;
                    q.ans = total;
                    q.hint = `Subtract ${roundTarget} instead: ${a} - ${roundTarget} = ${adjusted}. You subtracted ${diff} too many, so add ${diff} back: ${adjusted} + ${diff} = ${total}`;
                    q.answerType = 'number';

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Compensation Strategy</div>
                        <div style="font-size:1.3rem;margin:10px 0;">${a} - ${nearRound}</div>
                        <div style="background:var(--bg-card);padding:12px;border-radius:12px;margin:10px auto;max-width:320px;">
                            <div style="font-size:0.95rem;color:var(--text-dim);margin:5px 0;">
                                Round ${nearRound} up to <span style="color:var(--accent-cyan);font-weight:700;">${roundTarget}</span>
                            </div>
                            <div style="font-size:0.95rem;color:var(--text-dim);margin:5px 0;">
                                ${a} - ${roundTarget} = <span style="color:var(--accent-orange);font-weight:700;">${adjusted}</span>
                            </div>
                            <div style="font-size:0.95rem;color:var(--text-dim);margin:5px 0;">
                                Add back ${diff}: ${adjusted} + ${diff}
                            </div>
                            <div style="font-size:1.2rem;margin:8px 0;">
                                = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span>
                            </div>
                        </div>
                    </div>`;
                    q.options = buildNumericOptions(total);
                    q.skillLabel = 'Compensation';
                    q.printFormat = 'compensation';
                }
            }

            return;
}

export function generateAlgebraQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;
            // Algebraic Thinking Category
            const algMax = Math.max(10, Math.min(range, 100));
            const algSkill = mappedSkill === "mixed" ? pick(["solve_eq_addsub", "solve_eq_multdiv", "solve_eq_twostep", "write_equation", "solve_unknown", "write_expression", "evaluate_expression", "evaluate_expression_hard", "inequalities", "tape_diagram", "multi_step_word"]) : mappedSkill;

            if (algSkill === "equal_sign") {
                // Grade 1: Balance/true-false equations
                const eqMax = Math.max(5, Math.min(algMax, 20));
                const eqType = pick(["true", "false"]);

                let leftA, leftB, rightA, rightB, leftSum, rightSum;

                if (eqType === "true") {
                    // Make a true equation: left side = right side
                    leftA = rng(1, eqMax);
                    leftB = rng(1, eqMax);
                    leftSum = leftA + leftB;
                    // Find two numbers that add to the same sum
                    rightA = rng(1, leftSum - 1);
                    rightB = leftSum - rightA;
                    rightSum = leftSum;
                } else {
                    // Make a false equation: left side != right side
                    leftA = rng(1, eqMax);
                    leftB = rng(1, eqMax);
                    leftSum = leftA + leftB;
                    // Pick a different sum
                    const offset = pick([-2, -1, 1, 2, 3]);
                    rightSum = Math.max(2, leftSum + offset);
                    rightA = rng(1, Math.max(1, rightSum - 1));
                    rightB = rightSum - rightA;
                    if (rightB < 1) { rightB = 1; rightSum = rightA + rightB; }
                    // Ensure they're actually different
                    if (leftSum === rightSum) {
                        rightB += 1;
                        rightSum = rightA + rightB;
                    }
                }

                const isEqual = leftSum === rightSum;
                q.text = `Is ${leftA} + ${leftB} = ${rightA} + ${rightB} true or false?`;
                q.ans = isEqual ? "True" : "False";
                q.answerType = "multiple-choice";
                q.options = ["True", "False"];
                q.hint = `Add each side: ${leftA} + ${leftB} = ${leftSum} and ${rightA} + ${rightB} = ${rightSum}. Are they the same?`;
                q.skillLabel = 'Equal Sign';

                // Balance scale visual
                const diff = leftSum - rightSum;
                const tiltAngle = diff === 0 ? 0 : (diff > 0 ? 12 : -12);
                const beamColor = isEqual ? 'var(--accent-green)' : 'var(--accent-orange)';
                const leftY = isEqual ? 60 : (diff > 0 ? 70 : 50);
                const rightY = isEqual ? 60 : (diff > 0 ? 50 : 70);

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Balance Scale</div>
                    <svg width="300" height="160" viewBox="0 0 300 160" style="max-width:100%;">
                        <!-- Fulcrum triangle -->
                        <polygon points="150,150 135,120 165,120" fill="var(--text-dim)" opacity="0.6"/>
                        <!-- Beam -->
                        <line x1="40" y1="${leftY}" x2="260" y2="${rightY}" stroke="${beamColor}" stroke-width="4" stroke-linecap="round"/>
                        <!-- Left pan -->
                        <rect x="20" y="${leftY}" width="80" height="6" rx="3" fill="var(--accent-cyan)"/>
                        <text x="60" y="${leftY - 8}" text-anchor="middle" fill="var(--accent-cyan)" font-size="16" font-weight="bold">${leftA} + ${leftB}</text>
                        <text x="60" y="${leftY - 24}" text-anchor="middle" fill="var(--text-dim)" font-size="12">= ${leftSum}</text>
                        <!-- Right pan -->
                        <rect x="200" y="${rightY}" width="80" height="6" rx="3" fill="var(--accent-green)"/>
                        <text x="240" y="${rightY - 8}" text-anchor="middle" fill="var(--accent-green)" font-size="16" font-weight="bold">${rightA} + ${rightB}</text>
                        <text x="240" y="${rightY - 24}" text-anchor="middle" fill="var(--text-dim)" font-size="12">= ${rightSum}</text>
                        <!-- Center pivot -->
                        <circle cx="150" cy="120" r="6" fill="${beamColor}"/>
                        <!-- Status -->
                        <text x="150" y="15" text-anchor="middle" fill="${beamColor}" font-size="13" font-weight="bold">${isEqual ? 'Balanced!' : 'Not balanced!'}</text>
                    </svg>
                </div>`;
                return;
            } else if (algSkill === "solve_eq_addsub" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-categorize variant — 4 candidate solution values, sort solution/not
                const varName = pick(['x', 'n', 'y', 'a']);
                const eqMax = Math.max(5, Math.min(algMax, 50));
                const ptype = pick(["plus", "minus"]);
                const known = rng(2, Math.floor(eqMax / 2));
                const eqAnswer = rng(1, Math.floor(eqMax / 2));
                let eqText, eqHint;
                if (ptype === "plus") {
                    const total = eqAnswer + known;
                    eqText = `${varName} + ${known} = ${total}`;
                    eqHint = `Subtract ${known} from both sides to find ${varName}.`;
                } else {
                    const total = eqAnswer - known + 0;
                    // n - known = total → n = eqAnswer where eqAnswer > known
                    const safeAns = eqAnswer + known + 1;
                    const safeTotal = safeAns - known;
                    eqText = `${varName} − ${known} = ${safeTotal}`;
                    eqHint = `Add ${known} to both sides to find ${varName}.`;
                    // Recompute eqAnswer
                    var eqAns2 = safeAns;
                }
                const correctVal = ptype === "plus" ? eqAnswer : eqAns2;
                const candidates = new Set([correctVal]);
                let safety = 0;
                while (candidates.size < 4 && safety < 50) {
                    safety++;
                    const v = correctVal + pick([-3, -2, -1, 1, 2, 3]);
                    if (v >= 0 && v !== correctVal) candidates.add(v);
                }
                const arr = shuffle(Array.from(candidates));
                const tiles = arr.map((v, i) => ({ id: 't' + i, label: `${varName} = ${v}` }));
                const ans = {};
                arr.forEach((v, i) => { ans['t' + i] = v === correctVal ? 'binYes' : 'binNo'; });
                q.text = `Equation: ${eqText}. Drag each candidate value into the correct bin.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'categorize';
                q.tiles = tiles;
                q.bins = [
                    { id: 'binYes', label: 'Solution' },
                    { id: 'binNo', label: 'Not a solution' }
                ];
                q.hint = eqHint;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Solve +/−';
                return;
            } else if (algSkill === "solve_eq_addsub") {
                // Grade 5: One-step addition/subtraction equations
                const varName = pick(['x', 'n', 'y', 'a']);
                const eqMax = Math.max(5, Math.min(algMax, 50));
                const ptype = pick(["var_plus", "var_minus", "reversed", "qmark"]);

                let leftSide, rightSide, eqAnswer, eqHint;

                if (ptype === "var_plus") {
                    // x + 7 = 15
                    const known = rng(2, Math.floor(eqMax / 2));
                    eqAnswer = rng(1, Math.floor(eqMax / 2));
                    const total = eqAnswer + known;
                    leftSide = `${varName} + ${known}`;
                    rightSide = `${total}`;
                    eqHint = `To solve ${varName} + ${known} = ${total}, subtract ${known} from both sides: ${varName} = ${total} \u2212 ${known} = ${eqAnswer}`;
                } else if (ptype === "var_minus") {
                    // n - 3 = 12
                    const known = rng(2, Math.floor(eqMax / 3));
                    eqAnswer = rng(known + 1, eqMax);
                    const total = eqAnswer - known;
                    leftSide = `${varName} \u2212 ${known}`;
                    rightSide = `${total}`;
                    eqHint = `To solve ${varName} \u2212 ${known} = ${total}, add ${known} to both sides: ${varName} = ${total} + ${known} = ${eqAnswer}`;
                } else if (ptype === "reversed") {
                    // 15 = x + 8
                    const known = rng(2, Math.floor(eqMax / 2));
                    eqAnswer = rng(1, Math.floor(eqMax / 2));
                    const total = eqAnswer + known;
                    leftSide = `${total}`;
                    rightSide = `${varName} + ${known}`;
                    eqHint = `The equation ${total} = ${varName} + ${known} is the same as ${varName} + ${known} = ${total}. Subtract ${known}: ${varName} = ${eqAnswer}`;
                } else {
                    // ? + 6 = 14
                    const known = rng(2, Math.floor(eqMax / 2));
                    eqAnswer = rng(1, Math.floor(eqMax / 2));
                    const total = eqAnswer + known;
                    leftSide = `? + ${known}`;
                    rightSide = `${total}`;
                    eqHint = `To find ?, subtract ${known} from ${total}: ? = ${total} \u2212 ${known} = ${eqAnswer}`;
                }

                q.text = `Solve: ${leftSide} = ${rightSide}`;
                q.ans = eqAnswer;
                q.hint = eqHint;
                q.options = buildNumericOptions(eqAnswer);
                q.printFormat = "algebra-solve";
                q.skillLabel = "Solve +/\u2212";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Solve the Equation</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin:20px 0;">
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-cyan);">
                            <div style="font-size:1.5rem;font-weight:700;">${leftSide}</div>
                        </div>
                        <div style="font-size:2rem;font-weight:700;">=</div>
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-cyan);">
                            <div style="font-size:1.5rem;font-weight:700;">${rightSide}</div>
                        </div>
                    </div>
                    <div style="margin-top:15px;padding:10px;background:rgba(52,152,219,0.1);border-radius:8px;max-width:280px;margin-left:auto;margin-right:auto;">
                        <div style="font-size:0.85rem;color:var(--text-dim);">Use inverse operations: + undoes \u2212, \u2212 undoes +</div>
                    </div>
                </div>`;
                return;
            } else if (algSkill === "solve_eq_multdiv" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-categorize variant — 4 candidate solution values, sort solution/not
                const varName = pick(['x', 'n', 'y', 'a']);
                const eqMax = Math.max(5, Math.min(algMax, 50));
                const ptype = pick(["coeff", "div"]);
                let eqText, correctVal, eqHint;
                if (ptype === "coeff") {
                    const coeff = rng(2, 9);
                    correctVal = rng(2, Math.max(2, Math.floor(eqMax / coeff)));
                    const total = coeff * correctVal;
                    eqText = `${coeff}${varName} = ${total}`;
                    eqHint = `Divide both sides by ${coeff} to find ${varName}.`;
                } else {
                    const divisor = rng(2, 8);
                    const quotient = rng(2, Math.max(2, Math.floor(eqMax / divisor)));
                    correctVal = divisor * quotient;
                    eqText = `${varName} ÷ ${divisor} = ${quotient}`;
                    eqHint = `Multiply both sides by ${divisor} to find ${varName}.`;
                }
                const candidates = new Set([correctVal]);
                let safety = 0;
                while (candidates.size < 4 && safety < 50) {
                    safety++;
                    const v = correctVal + pick([-4, -2, -1, 1, 2, 4, correctVal]);
                    if (v > 0 && v !== correctVal) candidates.add(v);
                }
                const arr = shuffle(Array.from(candidates));
                const tiles = arr.map((v, i) => ({ id: 't' + i, label: `${varName} = ${v}` }));
                const ans = {};
                arr.forEach((v, i) => { ans['t' + i] = v === correctVal ? 'binYes' : 'binNo'; });
                q.text = `Equation: ${eqText}. Drag each candidate value into the correct bin.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'categorize';
                q.tiles = tiles;
                q.bins = [
                    { id: 'binYes', label: 'Solution' },
                    { id: 'binNo', label: 'Not a solution' }
                ];
                q.hint = eqHint;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Solve ×/÷';
                return;
            } else if (algSkill === "solve_eq_multdiv") {
                // Grade 5: One-step multiplication/division equations
                const varName = pick(['x', 'n', 'y', 'a']);
                const eqMax = Math.max(5, Math.min(algMax, 50));
                const ptype = pick(["coeff_var", "var_div", "times_var", "qmark_div"]);

                let leftSide, rightSide, eqAnswer, eqHint;

                if (ptype === "coeff_var") {
                    // 4x = 28
                    const coeff = rng(2, 10);
                    eqAnswer = rng(2, Math.floor(eqMax / coeff));
                    const total = coeff * eqAnswer;
                    leftSide = `${coeff}${varName}`;
                    rightSide = `${total}`;
                    eqHint = `To solve ${coeff}${varName} = ${total}, divide both sides by ${coeff}: ${varName} = ${total} \u00f7 ${coeff} = ${eqAnswer}`;
                } else if (ptype === "var_div") {
                    // n / 6 = 5
                    const divisor = rng(2, 8);
                    eqAnswer = divisor * rng(2, Math.max(2, Math.floor(eqMax / divisor)));
                    const quotient = eqAnswer / divisor;
                    leftSide = `${varName} \u00f7 ${divisor}`;
                    rightSide = `${quotient}`;
                    eqHint = `To solve ${varName} \u00f7 ${divisor} = ${quotient}, multiply both sides by ${divisor}: ${varName} = ${quotient} \u00d7 ${divisor} = ${eqAnswer}`;
                } else if (ptype === "times_var") {
                    // 3 * n = 21
                    const coeff = rng(2, 9);
                    eqAnswer = rng(2, Math.floor(eqMax / coeff));
                    const total = coeff * eqAnswer;
                    leftSide = `${coeff} \u00d7 ${varName}`;
                    rightSide = `${total}`;
                    eqHint = `To solve ${coeff} \u00d7 ${varName} = ${total}, divide both sides by ${coeff}: ${varName} = ${total} \u00f7 ${coeff} = ${eqAnswer}`;
                } else {
                    // ? / 4 = 7
                    const divisor = rng(2, 8);
                    const quotient = rng(2, Math.max(2, Math.floor(eqMax / divisor)));
                    eqAnswer = divisor * quotient;
                    leftSide = `? \u00f7 ${divisor}`;
                    rightSide = `${quotient}`;
                    eqHint = `To find ?, multiply ${quotient} by ${divisor}: ? = ${quotient} \u00d7 ${divisor} = ${eqAnswer}`;
                }

                q.text = `Solve: ${leftSide} = ${rightSide}`;
                q.ans = eqAnswer;
                q.hint = eqHint;
                q.options = buildNumericOptions(eqAnswer);
                q.printFormat = "algebra-solve";
                q.skillLabel = "Solve \u00d7/\u00f7";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Solve the Equation</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin:20px 0;">
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-green);">
                            <div style="font-size:1.5rem;font-weight:700;">${leftSide}</div>
                        </div>
                        <div style="font-size:2rem;font-weight:700;">=</div>
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-green);">
                            <div style="font-size:1.5rem;font-weight:700;">${rightSide}</div>
                        </div>
                    </div>
                    <div style="margin-top:15px;padding:10px;background:rgba(46,204,113,0.1);border-radius:8px;max-width:280px;margin-left:auto;margin-right:auto;">
                        <div style="font-size:0.85rem;color:var(--text-dim);">Use inverse operations: \u00d7 undoes \u00f7, \u00f7 undoes \u00d7</div>
                    </div>
                </div>`;
                return;
            } else if (algSkill === "solve_eq_twostep") {
                // Grade 6: Two-step equations
                const varName = pick(['x', 'n', 'y']);
                const eqMax = Math.max(5, Math.min(algMax, 50));
                const ptype = pick(["ax_plus_b", "paren_div", "ax_minus_b", "var_div_plus"]);

                let eqDisplay, eqAnswer, eqHint, step1Desc, step2Desc;

                if (ptype === "ax_plus_b") {
                    // 2x + 3 = 11
                    const a = rng(2, 6);
                    eqAnswer = rng(2, Math.max(2, Math.floor(eqMax / a)));
                    const b = rng(1, 12);
                    const total = a * eqAnswer + b;
                    eqDisplay = `${a}${varName} + ${b} = ${total}`;
                    step1Desc = `Subtract ${b} from both sides: ${a}${varName} = ${total} \u2212 ${b} = ${total - b}`;
                    step2Desc = `Divide both sides by ${a}: ${varName} = ${total - b} \u00f7 ${a} = ${eqAnswer}`;
                    eqHint = `Step 1: ${step1Desc}. Step 2: ${step2Desc}`;
                } else if (ptype === "paren_div") {
                    // (n - 4) / 2 = 5
                    const divisor = rng(2, 5);
                    const quotient = rng(2, Math.max(2, Math.floor(eqMax / divisor)));
                    const b = rng(1, 10);
                    eqAnswer = divisor * quotient + b;
                    eqDisplay = `(${varName} \u2212 ${b}) \u00f7 ${divisor} = ${quotient}`;
                    step1Desc = `Multiply both sides by ${divisor}: ${varName} \u2212 ${b} = ${quotient} \u00d7 ${divisor} = ${quotient * divisor}`;
                    step2Desc = `Add ${b} to both sides: ${varName} = ${quotient * divisor} + ${b} = ${eqAnswer}`;
                    eqHint = `Step 1: ${step1Desc}. Step 2: ${step2Desc}`;
                } else if (ptype === "ax_minus_b") {
                    // 3n - 7 = 14
                    const a = rng(2, 6);
                    eqAnswer = rng(3, Math.max(3, Math.floor(eqMax / a)));
                    const b = rng(1, Math.min(a * eqAnswer - 1, 12));
                    const total = a * eqAnswer - b;
                    eqDisplay = `${a}${varName} \u2212 ${b} = ${total}`;
                    step1Desc = `Add ${b} to both sides: ${a}${varName} = ${total} + ${b} = ${total + b}`;
                    step2Desc = `Divide both sides by ${a}: ${varName} = ${total + b} \u00f7 ${a} = ${eqAnswer}`;
                    eqHint = `Step 1: ${step1Desc}. Step 2: ${step2Desc}`;
                } else {
                    // n/4 + 5 = 8
                    const divisor = rng(2, 6);
                    const b = rng(2, 10);
                    const total = rng(b + 2, Math.max(b + 2, Math.floor(eqMax / 2)));
                    const leftover = total - b;
                    eqAnswer = leftover * divisor;
                    eqDisplay = `${varName} \u00f7 ${divisor} + ${b} = ${total}`;
                    step1Desc = `Subtract ${b} from both sides: ${varName} \u00f7 ${divisor} = ${total} \u2212 ${b} = ${leftover}`;
                    step2Desc = `Multiply both sides by ${divisor}: ${varName} = ${leftover} \u00d7 ${divisor} = ${eqAnswer}`;
                    eqHint = `Step 1: ${step1Desc}. Step 2: ${step2Desc}`;
                }

                q.text = `Solve: ${eqDisplay}`;
                q.ans = eqAnswer;
                q.hint = eqHint;
                q.options = buildNumericOptions(eqAnswer);
                q.printFormat = "algebra-twostep";
                q.skillLabel = "Two-Step Eq";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Two-Step Equation</div>
                    <div style="background:var(--bg-card);padding:20px 35px;border-radius:12px;border:3px solid var(--accent-orange);display:inline-block;margin:15px 0;">
                        <div style="font-size:1.6rem;font-weight:700;">${eqDisplay}</div>
                    </div>
                    <div style="max-width:300px;margin:15px auto;text-align:left;">
                        <div style="background:rgba(52,152,219,0.1);padding:12px;border-radius:8px;margin-bottom:8px;">
                            <div style="font-weight:700;color:var(--accent-cyan);font-size:0.9rem;">Step 1: Undo + or \u2212</div>
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-top:4px;">${step1Desc}</div>
                        </div>
                        <div style="background:rgba(46,204,113,0.1);padding:12px;border-radius:8px;">
                            <div style="font-weight:700;color:var(--accent-green);font-size:0.9rem;">Step 2: Undo \u00d7 or \u00f7</div>
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-top:4px;">${step2Desc}</div>
                        </div>
                    </div>
                    <div style="font-size:1.3rem;margin-top:10px;">${varName} = <span style="border-bottom:3px solid var(--accent-green);padding:0 20px;font-weight:700;">?</span></div>
                </div>`;
                return;
            } else if (algSkill === "write_equation") {
                // Grade 6: Translate word problems into equations
                const varName = pick(['x', 'n', 'y']);
                const eqMax = Math.max(5, Math.min(algMax, 50));
                const ptype = pick(["number_plus", "twice_minus", "story_give", "story_earn"]);

                let wordProblem, eqAnswer, eqHint;

                if (ptype === "number_plus") {
                    // "A number plus 7 equals 15. Write the equation."
                    const num = rng(2, Math.floor(eqMax / 2));
                    const total = rng(num + 2, eqMax);
                    wordProblem = `A number plus ${num} equals ${total}. Write the equation.`;
                    eqAnswer = `${varName} + ${num} = ${total}`;
                    eqHint = `"A number" becomes ${varName}. "Plus" becomes +. "Equals" becomes =. So: ${varName} + ${num} = ${total}`;
                } else if (ptype === "twice_minus") {
                    // "Twice a number minus 3 is 11. What is the equation?"
                    const sub = rng(1, 8);
                    const result = rng(3, eqMax);
                    wordProblem = `Twice a number minus ${sub} is ${result}. What is the equation?`;
                    eqAnswer = `2${varName} - ${sub} = ${result}`;
                    eqHint = `"Twice a number" becomes 2${varName}. "Minus" becomes \u2212. "Is" becomes =. So: 2${varName} \u2212 ${sub} = ${result}`;
                } else if (ptype === "story_give") {
                    // "Sam has x stickers. After giving away 5, he has 12 left."
                    const names = ["Sam", "Mia", "Leo", "Ava", "Kai"];
                    const items = ["stickers", "marbles", "cards", "coins", "books"];
                    const name = pick(names);
                    const item = pick(items);
                    const gave = rng(2, Math.floor(eqMax / 3));
                    const left = rng(2, Math.floor(eqMax / 2));
                    wordProblem = `${name} has ${varName} ${item}. After giving away ${gave}, he has ${left} left. Write the equation.`;
                    eqAnswer = `${varName} - ${gave} = ${left}`;
                    eqHint = `Starts with ${varName}, gives away ${gave} (subtract), has ${left} left (equals). So: ${varName} \u2212 ${gave} = ${left}`;
                } else {
                    // "Zoe earns $8 per hour. After h hours, she has $56."
                    const names = ["Zoe", "Ben", "Lily", "Max", "Emma"];
                    const name = pick(names);
                    const rate = pick([3, 4, 5, 6, 7, 8, 9, 10]);
                    const hours = rng(2, Math.max(2, Math.floor(eqMax / rate)));
                    const total = rate * hours;
                    wordProblem = `${name} earns $${rate} per hour. After ${varName} hours, she has $${total}. Write the equation.`;
                    eqAnswer = `${rate}${varName} = ${total}`;
                    eqHint = `$${rate} per hour for ${varName} hours is ${rate} \u00d7 ${varName}. Total is $${total}. So: ${rate}${varName} = ${total}`;
                }

                q.text = wordProblem;
                q.ans = eqAnswer;
                q.answerType = "text";
                q.hint = eqHint;
                q.printFormat = "algebra-write-eq";
                q.skillLabel = "Write Equation";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Write an Equation</div>
                    <div style="background:var(--bg-card);padding:20px;border-radius:12px;border:2px solid var(--accent-cyan);max-width:320px;margin:15px auto;">
                        <div style="font-size:1.05rem;line-height:1.5;">${wordProblem}</div>
                    </div>
                    <div style="margin:20px 0;padding:12px;background:rgba(155,89,182,0.1);border-radius:8px;max-width:280px;margin-left:auto;margin-right:auto;">
                        <div style="font-size:0.85rem;color:var(--text-dim);line-height:1.4;">
                            <strong>Key words:</strong><br/>
                            "plus/more/earns" = + | "minus/gave/lost" = \u2212<br/>
                            "times/per/each" = \u00d7 | "equals/is/left" = =
                        </div>
                    </div>
                    <div style="font-size:1.2rem;margin-top:15px;">Equation: <span style="border-bottom:2px solid var(--accent-green);padding:0 30px;min-width:120px;display:inline-block;">&nbsp;</span></div>
                </div>`;
                return;
            } else if (algSkill === "solve_unknown") {
                // Solve for unknown (x + 5 = 12)
                const ops = ['+', '-', '\u00d7'];
                const op = pick(ops);
                let answer, known, total;
                const solveMax = Math.max(5, Math.floor(algMax / 2));
                const useDecAlg = state.decimalPlaces > 0 && op !== '\u00d7';

                if (op === '+') {
                    answer = rng(1, solveMax);
                    known = rng(1, solveMax);
                    if (useDecAlg) { answer = applyDecimals(answer); known = applyDecimals(known); }
                    total = useDecAlg ? parseFloat((answer + known).toFixed(state.decimalPlaces)) : answer + known;
                    q.text = `Solve: x + ${known} = ${total}`;
                    q.hint = `To isolate x, subtract ${known} from both sides!`;
                } else if (op === '-') {
                    answer = rng(5, Math.max(5, solveMax));
                    known = rng(1, answer - 1);
                    if (useDecAlg) { answer = applyDecimals(answer); known = applyDecimals(Math.floor(known)); if (known >= answer) known = parseFloat((answer - 0.1).toFixed(state.decimalPlaces)); }
                    total = useDecAlg ? parseFloat((answer - known).toFixed(state.decimalPlaces)) : answer - known;
                    q.text = `Solve: x \u2212 ${known} = ${total}`;
                    q.hint = `To isolate x, add ${known} to both sides!`;
                } else {
                    answer = rng(2, 12);
                    known = rng(2, 10);
                    total = answer * known;
                    q.text = `Solve: ${known}x = ${total}`;
                    q.hint = `To isolate x, divide both sides by ${known}!`;
                }

                q.ans = answer;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\ud83d\udd24 Solve for Unknown</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin:20px 0;">
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-cyan);">
                            <div style="font-size:1.5rem;font-weight:700;">${op === '\u00d7' ? known + 'x' : 'x ' + (op === '-' ? '\u2212' : '+') + ' ' + known}</div>
                        </div>
                        <div style="font-size:2rem;font-weight:700;">=</div>
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-cyan);">
                            <div style="font-size:1.5rem;font-weight:700;">${total}</div>
                        </div>
                    </div>
                    <div style="font-size:1.3rem;margin-top:15px;">x = <span style="border-bottom:3px solid var(--accent-green);padding:0 20px;font-weight:700;">?</span></div>
                </div>`;
                q.options = buildNumericOptions(answer);
                q.algebraData = { op, answer, known, total };
                q.printFormat = "algebra-solve";
            } else if (algSkill === "write_expression") {
                // Write expressions from words
                const templates = [
                    { words: "the sum of a number and", op: '+', phrase: 'n + ' },
                    { words: "a number plus", op: '+', phrase: 'n + ' },
                    { words: "the difference of a number and", op: '-', phrase: 'n \u2212 ' },
                    { words: "a number minus", op: '-', phrase: 'n \u2212 ' },
                    { words: "the product of a number and", op: '\u00d7', phrase: 'n \u00d7 ' },
                    { words: "a number times", op: '\u00d7', phrase: 'n \u00d7 ' },
                    { words: "a number divided by", op: '\u00f7', phrase: 'n \u00f7 ' },
                ];
                const template = pick(templates);
                const exprMax = Math.max(5, Math.min(algMax, 50));
                const num = rng(2, exprMax);

                q.text = `Write an expression: "${template.words} ${num}"`;
                q.ans = template.phrase + num;
                q.answerType = "text";
                q.hint = `"Sum" means +, "difference" means \u2212, "product" means \u00d7, "quotient" means \u00f7`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\ud83d\udd24 Write an Expression</div>
                    <div style="background:var(--bg-card);padding:20px;border-radius:12px;margin:15px auto;max-width:300px;">
                        <div style="font-size:1.1rem;font-style:italic;color:var(--text-dim);">"${template.words} ${num}"</div>
                    </div>
                    <div style="margin:20px 0;font-size:0.9rem;">
                        <div style="display:inline-block;background:rgba(52,152,219,0.15);padding:10px 15px;border-radius:8px;margin:5px;">
                            <strong>Key Words:</strong><br/>
                            sum/plus = + | difference/minus = \u2212<br/>
                            product/times = \u00d7 | quotient/divided = \u00f7
                        </div>
                    </div>
                    <div style="font-size:1.2rem;margin-top:15px;">Expression: <span style="border-bottom:2px solid var(--accent-green);padding:0 30px;min-width:80px;display:inline-block;">&nbsp;</span></div>
                </div>`;
                q.algebraData = { template: template.words, num, answer: template.phrase + num };
                q.printFormat = "algebra-write";
            } else if (algSkill === "evaluate_expression") {
                // Evaluate expressions with variables — varied variable names, ops including ÷ and exponents
                const evalMax = Math.max(5, Math.min(algMax, 30));
                const varName = pick(['x', 'n', 'p', 'r', 'a', 'k', 'm']);
                let varVal = rng(2, evalMax);
                // Weighted pattern selection: simple ops 60%, exponents 20%, division 20%
                const patternType = pick(["simple", "simple", "simple", "exponent", "division"]);
                let expression, result, stepText;

                if (patternType === "exponent") {
                    // p² or p³
                    varVal = rng(2, 10);
                    const exp = pick([2, 2, 3]);
                    if (exp === 2) {
                        expression = `${varName}\u00b2`;
                        result = varVal * varVal;
                        stepText = `${varVal}\u00b2 = ${varVal} \u00d7 ${varVal} = ${result}`;
                    } else {
                        varVal = rng(2, 5);
                        expression = `${varName}\u00b3`;
                        result = varVal * varVal * varVal;
                        stepText = `${varVal}\u00b3 = ${varVal} \u00d7 ${varVal} \u00d7 ${varVal} = ${result}`;
                    }
                } else if (patternType === "division") {
                    // a ÷ n or n ÷ a (ensure clean division)
                    const divisor = rng(2, 8);
                    varVal = divisor * rng(2, 8);
                    const flip = pick([true, false]);
                    if (flip) {
                        expression = `${varName} \u00f7 ${divisor}`;
                        result = varVal / divisor;
                        stepText = `${varVal} \u00f7 ${divisor} = ${result}`;
                    } else {
                        const dividend = varVal * rng(2, 6);
                        expression = `${dividend} \u00f7 ${varName}`;
                        result = dividend / varVal;
                        stepText = `${dividend} \u00f7 ${varVal} = ${result}`;
                    }
                } else {
                    // Simple: + − × with varied variable position
                    const ops = ['+', '-', '\u00d7'];
                    const op = pick(ops);
                    let num = rng(1, Math.min(evalMax, 12));
                    const useDecEval = state.decimalPlaces > 0 && op !== '\u00d7';
                    if (useDecEval) { varVal = applyDecimals(varVal); num = applyDecimals(num); }
                    const flip = pick([true, false]);
                    if (op === '+') {
                        expression = flip ? `${varName} + ${num}` : `${num} + ${varName}`;
                        result = useDecEval ? parseFloat((varVal + num).toFixed(state.decimalPlaces)) : varVal + num;
                        stepText = `${varVal} + ${num} = ${result}`;
                    } else if (op === '-') {
                        if (flip) {
                            expression = `${varName} \u2212 ${num}`;
                            result = useDecEval ? parseFloat((varVal - num).toFixed(state.decimalPlaces)) : varVal - num;
                            stepText = `${varVal} \u2212 ${num} = ${result}`;
                        } else {
                            expression = `${num + varVal} \u2212 ${varName}`;
                            result = num;
                            stepText = `${num + varVal} \u2212 ${varVal} = ${result}`;
                        }
                    } else {
                        const coeffStyle = pick([true, false]); // 3n vs n × 3
                        if (coeffStyle) {
                            expression = `${num}${varName}`;
                            stepText = `${num} \u00d7 ${varVal} = ${num * varVal}`;
                        } else {
                            expression = `${varName} \u00d7 ${num}`;
                            stepText = `${varVal} \u00d7 ${num} = ${num * varVal}`;
                        }
                        result = varVal * num;
                    }
                }

                q.text = `Evaluate ${expression} at ${varName} = ${varVal}`;
                q.ans = result;
                q.hint = `Substitute ${varVal} for ${varName}, then calculate!`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\ud83d\udd24 Evaluate Expression</div>
                    <div style="font-size:1.4rem;margin:15px 0;">
                        <span style="background:var(--bg-card);padding:8px 15px;border-radius:8px;border:2px solid var(--accent-cyan);">${expression}</span>
                        <span style="margin:0 10px;">at</span>
                        <span style="background:var(--bg-card);padding:8px 15px;border-radius:8px;border:2px solid var(--accent-orange);">${varName} = ${varVal}</span>
                    </div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:20px auto;max-width:280px;">
                        <div style="font-weight:600;color:var(--accent-cyan);margin-bottom:8px;">Step 1: Substitute</div>
                        <div style="font-size:1.2rem;">${expression.replace(new RegExp(varName, 'g'), `<span style="color:var(--accent-orange);font-weight:700;">${varVal}</span>`)}</div>
                        <div style="font-weight:600;color:var(--accent-cyan);margin-top:10px;margin-bottom:8px;">Step 2: Calculate</div>
                        <div style="font-size:1.2rem;">= <span style="border-bottom:2px dashed var(--accent-green);padding:0 15px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(result);
                q.algebraData = { expression, varName, varVal, result };
                q.printFormat = "algebra-evaluate";
            } else if (algSkill === "evaluate_expression_hard") {
                // Multi-step evaluate: compound expressions with parens, exponents, negatives
                // e.g., (y+2)² at y=−4, 25/(r−4) at r=9, 4v−3 at v=−5, m(m+2) at m=2
                const varName = pick(['x', 'y', 'r', 'v', 'm', 'a', 'k']);
                const pattern = pick(["coeff_sub", "var_squared_plus", "paren_squared", "frac_expr", "var_times_expr", "two_step"]);
                let expression, result, varVal, stepText;

                if (pattern === "coeff_sub") {
                    // av − b at v = c (or v = −c)
                    const a = rng(2, 8);
                    const b = rng(1, 15);
                    const useNeg = pick([true, false]);
                    varVal = useNeg ? -rng(1, 8) : rng(2, 12);
                    expression = `${a}${varName} \u2212 ${b}`;
                    result = a * varVal - b;
                    stepText = `${a}(${varVal}) \u2212 ${b} = ${a * varVal} \u2212 ${b} = ${result}`;
                } else if (pattern === "var_squared_plus") {
                    // x² + b at x = c
                    varVal = rng(2, 10);
                    const b = rng(1, 20);
                    expression = `${varName}\u00b2 + ${b}`;
                    result = varVal * varVal + b;
                    stepText = `(${varVal})\u00b2 + ${b} = ${varVal * varVal} + ${b} = ${result}`;
                } else if (pattern === "paren_squared") {
                    // (y + a)² at y = b (can be negative)
                    const a = rng(1, 6);
                    const useNeg = pick([true, false]);
                    varVal = useNeg ? -rng(1, 6) : rng(1, 8);
                    const inner = varVal + a;
                    expression = `(${varName} + ${a})\u00b2`;
                    result = inner * inner;
                    stepText = `(${varVal} + ${a})\u00b2 = (${inner})\u00b2 = ${inner} \u00d7 ${inner} = ${result}`;
                } else if (pattern === "frac_expr") {
                    // a/(r − b) at r = c — ensure clean division, no division by zero
                    const b = rng(1, 8);
                    varVal = rng(b + 2, b + 10); // ensure r-b > 0
                    const denom = varVal - b;
                    const mult = rng(2, 8);
                    const a = denom * mult; // ensure clean division
                    expression = `${a} \u00f7 (${varName} \u2212 ${b})`;
                    result = a / denom;
                    stepText = `${a} \u00f7 (${varVal} \u2212 ${b}) = ${a} \u00f7 ${denom} = ${result}`;
                } else if (pattern === "var_times_expr") {
                    // m(m + a) at m = b
                    const a = rng(1, 8);
                    varVal = rng(2, 10);
                    const inner = varVal + a;
                    expression = `${varName}(${varName} + ${a})`;
                    result = varVal * inner;
                    stepText = `${varVal}(${varVal} + ${a}) = ${varVal} \u00d7 ${inner} = ${result}`;
                } else {
                    // Two-step: ax + b at x = c
                    const a = rng(2, 8);
                    const b = rng(1, 15);
                    varVal = rng(2, 12);
                    const addSub = pick(['+', '\u2212']);
                    expression = `${a}${varName} ${addSub} ${b}`;
                    result = addSub === '+' ? a * varVal + b : a * varVal - b;
                    stepText = `${a}(${varVal}) ${addSub} ${b} = ${a * varVal} ${addSub} ${b} = ${result}`;
                }

                q.text = `Evaluate ${expression} at ${varName} = ${varVal}`;
                q.ans = result;
                q.hint = `Substitute ${varVal} for ${varName}, then follow order of operations!`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\ud83d\udd24 Evaluate Expression</div>
                    <div style="font-size:1.4rem;margin:15px 0;">
                        <span style="background:var(--bg-card);padding:8px 15px;border-radius:8px;border:2px solid var(--accent-cyan);">${expression}</span>
                        <span style="margin:0 10px;">at</span>
                        <span style="background:var(--bg-card);padding:8px 15px;border-radius:8px;border:2px solid var(--accent-orange);">${varName} = ${varVal}</span>
                    </div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:20px auto;max-width:280px;">
                        <div style="font-weight:600;color:var(--accent-cyan);margin-bottom:8px;">Step 1: Substitute</div>
                        <div style="font-size:1.1rem;">${stepText.split('=')[0]}= ?</div>
                        <div style="font-weight:600;color:var(--accent-cyan);margin-top:10px;margin-bottom:8px;">Step 2: Calculate</div>
                        <div style="font-size:1.2rem;">= <span style="border-bottom:2px dashed var(--accent-green);padding:0 15px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(result);
                q.algebraData = { expression, varName, varVal, result };
                q.printFormat = "algebra-evaluate";
            } else if (algSkill === "inequalities" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-categorize variant — sort 5 candidate values into satisfies/not bins
                const ineqSymbols = ['>', '<', '≥', '≤'];
                const ineqSymbol = pick(ineqSymbols);
                const ineqMaxC = Math.max(5, Math.min(algMax, 50));
                const ineqBoundary = rng(3, ineqMaxC);
                const checkSatisfies = (v) => {
                    if (ineqSymbol === '>') return v > ineqBoundary;
                    if (ineqSymbol === '<') return v < ineqBoundary;
                    if (ineqSymbol === '≥') return v >= ineqBoundary;
                    return v <= ineqBoundary;
                };
                const candidates = new Set();
                let safety = 0;
                while (candidates.size < 5 && safety < 100) {
                    safety++;
                    const v = rng(Math.max(0, ineqBoundary - 6), ineqBoundary + 6);
                    candidates.add(v);
                }
                let arr = shuffle(Array.from(candidates).slice(0, 5));
                const allSat = arr.every(checkSatisfies);
                const noneSat = arr.every(v => !checkSatisfies(v));
                if (allSat) {
                    arr[0] = (ineqSymbol === '>' || ineqSymbol === '≥') ? Math.max(0, ineqBoundary - 2) : ineqBoundary + 5;
                } else if (noneSat) {
                    arr[0] = (ineqSymbol === '>' || ineqSymbol === '≥') ? ineqBoundary + 5 : Math.max(0, ineqBoundary - 2);
                }
                const tiles = arr.map((v, i) => ({ id: 't' + i, label: String(v) }));
                const ans = {};
                arr.forEach((v, i) => { ans['t' + i] = checkSatisfies(v) ? 'binSat' : 'binNot'; });
                q.text = `Drag each value into the correct bin for the inequality x ${ineqSymbol} ${ineqBoundary}.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'categorize';
                q.tiles = tiles;
                q.bins = [
                    { id: 'binSat', label: `Satisfies x ${ineqSymbol} ${ineqBoundary}` },
                    { id: 'binNot', label: `Does NOT satisfy` }
                ];
                q.hint = `Test each value: substitute into x ${ineqSymbol} ${ineqBoundary}. Is the statement true?`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Inequalities';
                return;
            } else if (algSkill === "inequalities" && Math.random() < 0.30) {
                // Phase 4.5 batch 3: number-line-extended variant — drag a marker to any value
                // satisfying the inequality. We pick a single satisfying example value as `ans`
                // (the widget's tolerance check accepts that exact placement).
                const nleSymbols = ['>', '<', '≥', '≤'];
                const nleSymbol = pick(nleSymbols);
                const nleMaxC = Math.max(5, Math.min(algMax, 50));
                const nleThreshold = rng(2, Math.min(10, nleMaxC));
                const nleLow = -5;
                const nleHigh = Math.max(20, nleThreshold + 10);
                const checkSat = (v) => {
                    if (nleSymbol === '>') return v > nleThreshold;
                    if (nleSymbol === '<') return v < nleThreshold;
                    if (nleSymbol === '≥') return v >= nleThreshold;
                    return v <= nleThreshold;
                };
                const validValues = [];
                for (let v = nleLow; v <= nleHigh; v++) {
                    if (checkSat(v)) validValues.push(v);
                }
                // Fallback safety: if (somehow) no satisfying values, widen to the threshold itself
                const example = validValues.length > 0
                    ? pick(validValues)
                    : (nleSymbol === '≥' || nleSymbol === '≤' ? nleThreshold : nleThreshold + (nleSymbol === '>' ? 1 : -1));
                q.text = `Drag the marker to a value that satisfies x ${nleSymbol} ${nleThreshold}. (Example: ${example})`;
                q.answerType = 'number-line-extended';
                q.rangeMin = nleLow;
                q.rangeMax = nleHigh;
                q.majorTickEvery = 1;
                q.minorSnap = 1;
                q.numberType = 'integer';
                q.ans = example;
                q.tolerance = 0.5;
                q.hint = `Any whole number ${nleSymbol} ${nleThreshold} works. The example shown is just one of many valid answers.`;
                q.printFormat = 'number-line-extended';
                q.skillLabel = 'Inequalities';
                q.options = [];
                return;
            } else if (algSkill === "inequalities") {
                // Inequalities
                const symbols = ['>', '<', '\u2265', '\u2264'];
                const symbol = pick(symbols);
                const ineqMax = Math.max(5, Math.min(algMax, 50));
                const boundary = rng(1, ineqMax);
                const testVal = rng(Math.max(0, boundary - 5), boundary + 5);

                let isTrue;
                if (symbol === '>') isTrue = testVal > boundary;
                else if (symbol === '<') isTrue = testVal < boundary;
                else if (symbol === '\u2265') isTrue = testVal >= boundary;
                else isTrue = testVal <= boundary;

                q.text = `Is ${testVal} ${symbol} ${boundary} true or false?`;
                q.ans = isTrue ? "True" : "False";
                q.answerType = "choice";
                q.options = ["True", "False"];
                q.hint = `> means greater than, < means less than, \u2265 means greater than or equal, \u2264 means less than or equal`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\ud83d\udd24 Inequalities</div>
                    <div style="font-size:2rem;margin:20px 0;">
                        <span style="font-weight:700;">${testVal}</span>
                        <span style="margin:0 15px;color:var(--accent-cyan);font-weight:700;">${symbol}</span>
                        <span style="font-weight:700;">${boundary}</span>
                    </div>
                    <svg width="280" height="50" viewBox="0 0 280 50" style="margin:15px auto;display:block;">
                        <line x1="20" y1="25" x2="260" y2="25" stroke="currentColor" stroke-width="2"/>
                        ${Array(11).fill(0).map((_, i) => {
                            const x = 20 + i * 24;
                            const val = boundary - 5 + i;
                            return `<line x1="${x}" y1="20" x2="${x}" y2="30" stroke="currentColor" stroke-width="1"/>
                            <text x="${x}" y="45" text-anchor="middle" fill="currentColor" font-size="10">${val}</text>`;
                        }).join('')}
                        <circle cx="${20 + (testVal - (boundary - 5)) * 24}" cy="25" r="8" fill="var(--accent-green)"/>
                    </svg>
                    <div style="margin-top:15px;font-size:0.9rem;color:var(--text-dim);">
                        > greater than | < less than | \u2265 greater or equal | \u2264 less or equal
                    </div>
                </div>`;
                q.algebraData = { testVal, symbol, boundary, isTrue };
                q.printFormat = "algebra-inequality";
            } else if (algSkill === "tape_diagram") {
                // Tape Diagram - bar model for addition/subtraction word problems
                const tdNames = ["Sam", "Mia", "Leo", "Ava", "Kai", "Zoe", "Ben", "Lily"];
                const tdItems = ["apples", "stickers", "marbles", "books", "coins", "cards", "shells", "stars"];
                const tdName = pick(tdNames);
                const tdItem = pick(tdItems);
                const diagType = pick(["find_whole", "find_part"]);
                const tdMax = Math.max(10, Math.min(algMax, 100));

                if (diagType === "find_whole") {
                    // Given two parts, find the whole
                    const part1 = rng(10, tdMax);
                    const part2 = rng(10, tdMax);
                    const whole = part1 + part2;

                    q.text = `${tdName} has ${part1} ${tdItem} and gets ${part2} more. How many ${tdItem} in all?`;
                    q.ans = whole;
                    q.hint = `Add the two parts together: ${part1} + ${part2}`;

                    const totalW = 300;
                    const part1W = Math.round((part1 / whole) * totalW);
                    const part2W = totalW - part1W;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.1rem;">Tape Diagram</div>
                        <div style="max-width:320px;margin:0 auto;">
                            <div style="display:flex;margin-bottom:4px;">
                                <div style="flex:1;border-top:2px solid var(--text-bright);border-left:2px solid var(--text-bright);border-right:2px solid var(--text-bright);height:12px;border-radius:4px 4px 0 0;"></div>
                            </div>
                            <div style="text-align:center;font-weight:700;font-size:1rem;color:var(--accent-orange);margin-bottom:6px;">? total</div>
                            <div style="display:flex;gap:3px;">
                                <div style="width:${part1W}px;height:50px;background:var(--accent-cyan);border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.95rem;">${part1}</div>
                                <div style="width:${part2W}px;height:50px;background:var(--accent-green);border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.95rem;">${part2}</div>
                            </div>
                        </div>
                        <div style="font-size:0.85rem;color:var(--text-dim);margin-top:10px;">${part1} + ${part2} = ?</div>
                    </div>`;
                } else {
                    // Given whole and one part, find missing part
                    const whole = rng(20, Math.max(20, tdMax * 2));
                    const knownPart = rng(5, whole - 5);
                    const missingPart = whole - knownPart;
                    const actions = [
                        `${tdName} had ${whole} ${tdItem}. He gave ${knownPart} away. How many are left?`,
                        `${tdName} had ${whole} ${tdItem}. She used ${knownPart}. How many remain?`,
                        `${tdName} needs ${whole} ${tdItem}. He already has ${knownPart}. How many more does he need?`
                    ];

                    q.text = pick(actions);
                    q.ans = missingPart;
                    q.hint = `The whole is ${whole} and one part is ${knownPart}. Subtract to find the missing part: ${whole} - ${knownPart}`;

                    const totalW = 300;
                    const knownW = Math.round((knownPart / whole) * totalW);
                    const missingW = totalW - knownW;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.1rem;">Tape Diagram</div>
                        <div style="max-width:320px;margin:0 auto;">
                            <div style="display:flex;margin-bottom:4px;">
                                <div style="flex:1;border-top:2px solid var(--text-bright);border-left:2px solid var(--text-bright);border-right:2px solid var(--text-bright);height:12px;border-radius:4px 4px 0 0;"></div>
                            </div>
                            <div style="text-align:center;font-weight:700;font-size:1rem;color:var(--accent-cyan);margin-bottom:6px;">${whole} total</div>
                            <div style="display:flex;gap:3px;">
                                <div style="width:${knownW}px;height:50px;background:var(--accent-cyan);border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.95rem;">${knownPart}</div>
                                <div style="width:${missingW}px;height:50px;border:3px dashed var(--accent-orange);border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;color:var(--accent-orange);background:rgba(255,159,28,0.08);">?</div>
                            </div>
                        </div>
                        <div style="font-size:0.85rem;color:var(--text-dim);margin-top:10px;">${whole} - ${knownPart} = ?</div>
                    </div>`;
                }
                q.skillLabel = 'Tape Diagram';
                q.printFormat = 'tape-diagram';
                q.options = buildNumericOptions(q.ans);
            } else if (algSkill === "multi_step_word") {
                // Multi-Step Word Problems with bar model visual
                const msNames = ["Maria", "James", "Sofia", "Ethan", "Noor", "Liam", "Aisha", "Owen"];
                const msItems = ["stickers", "marbles", "books", "pencils", "cookies", "tokens", "points", "beads"];
                const msName = pick(msNames);
                const msItem = pick(msItems);

                const problemType = pick(["add_then_sub", "sub_then_add", "add_then_add", "sub_then_sub"]);
                let startVal, step1Val, step2Val, afterStep1, finalVal;
                let step1Text, step2Text;
                const msMax = Math.max(20, Math.min(algMax, 100));

                if (problemType === "add_then_sub") {
                    startVal = rng(20, msMax);
                    step1Val = rng(5, Math.max(5, Math.floor(msMax / 2)));
                    step2Val = rng(3, Math.min(Math.floor(msMax / 2), startVal + step1Val - 1));
                    afterStep1 = startVal + step1Val;
                    finalVal = afterStep1 - step2Val;
                    step1Text = `bought ${step1Val} more`;
                    step2Text = `gave ${step2Val} to a friend`;
                } else if (problemType === "sub_then_add") {
                    startVal = rng(30, msMax);
                    step1Val = rng(5, startVal - 5);
                    step2Val = rng(3, Math.max(3, Math.floor(msMax / 2)));
                    afterStep1 = startVal - step1Val;
                    finalVal = afterStep1 + step2Val;
                    step1Text = `lost ${step1Val}`;
                    step2Text = `found ${step2Val} more`;
                } else if (problemType === "add_then_add") {
                    startVal = rng(10, Math.max(10, Math.floor(msMax * 0.6)));
                    step1Val = rng(5, Math.max(5, Math.floor(msMax / 3)));
                    step2Val = rng(5, Math.max(5, Math.floor(msMax / 3)));
                    afterStep1 = startVal + step1Val;
                    finalVal = afterStep1 + step2Val;
                    step1Text = `earned ${step1Val} more`;
                    step2Text = `received ${step2Val} more`;
                } else {
                    startVal = rng(50, msMax);
                    step1Val = rng(5, Math.max(5, Math.floor(msMax / 4)));
                    step2Val = rng(3, Math.max(3, Math.min(Math.floor(msMax / 4), startVal - step1Val - 1)));
                    afterStep1 = startVal - step1Val;
                    finalVal = afterStep1 - step2Val;
                    step1Text = `used ${step1Val}`;
                    step2Text = `gave away ${step2Val}`;
                }

                q.text = `${msName} had ${startVal} ${msItem}. She ${step1Text}, then ${step2Text}. How many ${msItem} does she have now?`;
                q.ans = finalVal;

                const msStep1Op = (problemType === "add_then_sub" || problemType === "add_then_add") ? '+' : '-';
                const msStep2Op = (problemType === "add_then_sub" || problemType === "sub_then_sub") ? '-' : '+';
                q.hint = `Step 1: ${startVal} ${msStep1Op} ${step1Val} = ${afterStep1}. Step 2: ${afterStep1} ${msStep2Op} ${step2Val} = ${finalVal}`;

                // Multi-bar visual
                const maxVal = Math.max(startVal, afterStep1, finalVal);
                const barW = 280;
                const startW = Math.max(30, Math.round((startVal / maxVal) * barW));
                const afterW = Math.max(30, Math.round((afterStep1 / maxVal) * barW));
                const finalW = Math.max(30, Math.round((finalVal / maxVal) * barW));

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.1rem;">Multi-Step Bar Model</div>
                    <div style="max-width:300px;margin:0 auto;text-align:left;">
                        <div style="margin-bottom:10px;">
                            <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:3px;">Start: ${startVal}</div>
                            <div style="width:${startW}px;height:30px;background:var(--accent-cyan);border-radius:5px;display:flex;align-items:center;padding-left:8px;color:white;font-weight:700;font-size:0.85rem;">${startVal}</div>
                        </div>
                        <div style="margin-bottom:10px;">
                            <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:3px;">Step 1: ${msStep1Op} ${step1Val} = ${afterStep1}</div>
                            <div style="width:${afterW}px;height:30px;background:var(--accent-green);border-radius:5px;display:flex;align-items:center;padding-left:8px;color:white;font-weight:700;font-size:0.85rem;">${afterStep1}</div>
                        </div>
                        <div>
                            <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:3px;">Step 2: ${msStep2Op} ${step2Val} = ?</div>
                            <div style="width:${finalW}px;height:30px;border:3px dashed var(--accent-orange);border-radius:5px;display:flex;align-items:center;padding-left:8px;font-weight:700;font-size:0.85rem;color:var(--accent-orange);background:rgba(255,159,28,0.08);">?</div>
                        </div>
                    </div>
                </div>`;
                q.skillLabel = 'Multi-Step';
                q.printFormat = 'multi-step-word';
                q.options = buildNumericOptions(finalVal);
            }
            return;
}
