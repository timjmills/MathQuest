// gen-fractions.js - Fractions, Decimals & Conversions question generation
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions, simplifyFraction, fractionToPercent } from './utils.js';
import { fracHTML, fracCircleSVG, fracBarHTML } from './svg-fractions.js';

export function generateFractionsQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // Use only denominators that give standard/clean decimal equivalents
            const standardFractions = [
                {n: 1, d: 2}, {n: 1, d: 3}, {n: 2, d: 3},
                {n: 1, d: 4}, {n: 2, d: 4}, {n: 3, d: 4},
                {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 5}, {n: 4, d: 5},
                {n: 1, d: 6}, {n: 5, d: 6},
                {n: 1, d: 8}, {n: 3, d: 8}, {n: 5, d: 8}, {n: 7, d: 8}
            ];
            const frac = pick(standardFractions);
            const numerator = frac.n;
            const denominator = frac.d;

            // For mixed, pick random fraction skill with weighted distribution
            let fracSkill = mappedSkill;
            if (fracSkill === "mixed") {
                fracSkill = pick([
                    // Fractions - visual
                    "identify", "equivalent", "compare", "simplify", "improper_mixed",
                    "equiv_frac_visual", "fraction_of_set", "fraction_of_set_hard", "mixed_improper_visual",
                    "order_fractions", "order_frac_numline", "benchmark_fractions", "compare_frac_lcd",
                    "graph_fractions", "round_fractions",
                    // Fractions - NV
                    "identify_nv", "equiv_frac_nv", "fraction_of_set_nv", "fraction_of_set_hard_nv",
                    // Fraction operations - visual
                    "add_fractions_like", "sub_fractions_like", "add_mixed_like", "sub_mixed_like",
                    "add_frac_unlike", "sub_frac_unlike", "add_mixed_unlike", "sub_mixed_unlike",
                    "mult_frac_whole", "decompose_fractions", "frac_10_100",
                    "mult_frac_frac", "div_unit_fraction", "frac_as_division", "mult_scaling",
                    "frac_mult_word", "estimate_frac_ops",
                    // Fraction operations - NV
                    "add_frac_like_nv", "sub_frac_like_nv", "add_frac_unlike_nv", "sub_frac_unlike_nv",
                    "add_mixed_like_nv", "sub_mixed_like_nv", "add_mixed_unlike_nv", "sub_mixed_unlike_nv",
                    "mult_frac_whole_nv", "decompose_frac_nv", "frac_10_100_nv",
                    "mult_frac_frac_nv", "div_unit_frac_nv", "frac_as_div_nv", "mult_scaling_nv"
                ]);
            }

            // --- Local helpers for fraction string formatting ---
            function _gcd(a, b) { return b === 0 ? Math.abs(a) : _gcd(b, a % b); }
            function _simplify(n, d) { const g = _gcd(n, d); return [n / g, d / g]; }
            function _fracStr(n, d) {
                if (n === 0) return "0";
                const [sn, sd] = _simplify(Math.abs(n), Math.abs(d));
                const sign = (n < 0) !== (d < 0) ? '-' : '';
                if (sd === 1) return sign + sn;
                if (sn > sd) return sign + Math.floor(sn / sd) + ' ' + (sn % sd) + '/' + sd;
                return sign + sn + '/' + sd;
            }
            // Build an SVG fraction bar (horizontal, inline)
            function _svgBar(num, den, w, h, fillColor, emptyColor) {
                const segW = w / den;
                let rects = '';
                for (let i = 0; i < den; i++) {
                    const fill = i < num ? fillColor : (emptyColor || 'var(--bg-card)');
                    const opacity = i < num ? '1' : '0.3';
                    rects += `<rect x="${i * segW}" y="0" width="${segW}" height="${h}" fill="${fill}" stroke="var(--text-bright)" stroke-width="1.5" opacity="${opacity}"/>`;
                }
                return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;margin:4px auto;">${rects}</svg>`;
            }
            // LCD helper
            function _lcm(a, b) { return (a * b) / _gcd(a, b); }

            // ==================== NEW FRACTION SKILLS ====================

            if (fracSkill === "add_fractions_like") {
                // Grade 4: Add fractions with SAME denominator
                const den = rng(2, 12);
                const maxNum = den - 1;
                const n1 = rng(1, maxNum);
                const n2 = rng(1, maxNum);
                const sumNum = n1 + n2;
                const answer = _fracStr(sumNum, den);

                q.text = `Calculate: ${n1}/${den} + ${n2}/${den} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Same denominator! Add the numerators: ${n1} + ${n2} = ${sumNum}. Then simplify ${sumNum}/${den} if possible.`;

                const barW = 260;
                const barH = 32;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Add Fractions (Like Denominators)</div>
                    <div style="font-size:1.3rem;margin-bottom:14px;">
                        ${fracHTML(n1, den, 'xl')} <span style="margin:0 8px;font-size:1.5rem;">+</span> ${fracHTML(n2, den, 'xl')} <span style="margin:0 8px;font-size:1.5rem;">=</span> <span style="font-size:1.5rem;color:var(--accent-green);font-weight:700;">?</span>
                    </div>
                    <div style="margin-bottom:8px;font-size:0.85rem;color:var(--text-bright);">${n1}/${den}</div>
                    ${_svgBar(n1, den, barW, barH, 'var(--accent-cyan)', 'var(--bg-card)')}
                    <div style="margin:6px 0 2px;font-size:1.2rem;font-weight:700;">+</div>
                    <div style="font-size:0.85rem;color:var(--text-bright);">${n2}/${den}</div>
                    ${_svgBar(n2, den, barW, barH, 'var(--accent-purple)', 'var(--bg-card)')}
                    <div style="border-top:2px solid var(--text-bright);margin:10px auto 6px;width:${barW}px;"></div>
                    <div style="font-size:0.85rem;color:var(--text-bright);">= ?/${den}</div>
                    ${_svgBar(Math.min(sumNum, den), den, barW, barH, 'var(--accent-green)', 'var(--bg-card)')}
                    ${sumNum > den ? `<div style="margin-top:4px;font-size:0.8rem;color:var(--accent-orange);">+ ${sumNum - den}/${den} more (improper fraction!)</div>` : ''}
                </div>`;
                return;

            } else if (fracSkill === "sub_fractions_like") {
                // Grade 4: Subtract fractions with SAME denominator
                const den = rng(2, 12);
                let n1 = rng(2, den);
                let n2 = rng(1, n1 - 1);
                const diffNum = n1 - n2;
                const answer = _fracStr(diffNum, den);

                q.text = `Calculate: ${n1}/${den} \u2212 ${n2}/${den} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Same denominator! Subtract the numerators: ${n1} \u2212 ${n2} = ${diffNum}. Then simplify ${diffNum}/${den} if possible.`;

                const barW = 260;
                const barH = 32;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Subtract Fractions (Like Denominators)</div>
                    <div style="font-size:1.3rem;margin-bottom:14px;">
                        ${fracHTML(n1, den, 'xl')} <span style="margin:0 8px;font-size:1.5rem;">\u2212</span> ${fracHTML(n2, den, 'xl')} <span style="margin:0 8px;font-size:1.5rem;">=</span> <span style="font-size:1.5rem;color:var(--accent-green);font-weight:700;">?</span>
                    </div>
                    <div style="margin-bottom:8px;font-size:0.85rem;color:var(--text-bright);">Start with ${n1}/${den}</div>
                    ${_svgBar(n1, den, barW, barH, 'var(--accent-cyan)', 'var(--bg-card)')}
                    <div style="margin:6px 0 2px;font-size:0.85rem;color:var(--accent-orange);">Remove ${n2}/${den}</div>
                    ${(() => {
                        const segW = barW / den;
                        let rects = '';
                        for (let i = 0; i < den; i++) {
                            const inOriginal = i < n1;
                            const removed = i >= diffNum && i < n1;
                            const fill = removed ? 'var(--accent-orange)' : (inOriginal ? 'var(--accent-cyan)' : 'var(--bg-card)');
                            const opacity = inOriginal ? (removed ? '0.4' : '1') : '0.3';
                            rects += `<rect x="${i * segW}" y="0" width="${segW}" height="${barH}" fill="${fill}" stroke="var(--text-bright)" stroke-width="1.5" opacity="${opacity}"/>`;
                            if (removed) rects += `<line x1="${i * segW}" y1="0" x2="${(i + 1) * segW}" y2="${barH}" stroke="var(--accent-orange)" stroke-width="2"/>`;
                        }
                        return `<svg width="${barW}" height="${barH}" viewBox="0 0 ${barW} ${barH}" style="display:block;margin:4px auto;">${rects}</svg>`;
                    })()}
                    <div style="border-top:2px solid var(--text-bright);margin:10px auto 6px;width:${barW}px;"></div>
                    <div style="font-size:0.85rem;color:var(--accent-green);">= ?/${den} remaining</div>
                    ${_svgBar(diffNum, den, barW, barH, 'var(--accent-green)', 'var(--bg-card)')}
                </div>`;
                return;

            } else if (fracSkill === "add_mixed_like") {
                // Grade 4: Add mixed numbers with SAME denominator
                const den = pick([2, 3, 4, 5, 6, 8]);
                const w1 = rng(1, 4);
                const f1 = rng(1, den - 1);
                const w2 = rng(1, 3);
                const f2 = rng(1, den - 1);
                const totalNum = (w1 * den + f1) + (w2 * den + f2);
                const answer = _fracStr(totalNum, den);

                q.text = `Calculate: ${w1} ${f1}/${den} + ${w2} ${f2}/${den} = ?`;
                q.ans = answer;
                q.answerType = "text";
                const fracSum = f1 + f2;
                const needsRegroup = fracSum >= den;
                q.hint = needsRegroup
                    ? `Add wholes: ${w1} + ${w2} = ${w1 + w2}. Add fractions: ${f1}/${den} + ${f2}/${den} = ${fracSum}/${den} = 1 ${fracSum - den}/${den}. Regroup!`
                    : `Add wholes: ${w1} + ${w2} = ${w1 + w2}. Add fractions: ${f1}/${den} + ${f2}/${den} = ${fracSum}/${den}.`;

                const barW = 240;
                const barH = 26;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Add Mixed Numbers</div>
                    <div style="font-size:1.2rem;margin-bottom:14px;">
                        <span style="color:var(--accent-cyan);font-weight:700;">${w1} ${fracHTML(f1, den)}</span>
                        <span style="margin:0 10px;font-size:1.3rem;">+</span>
                        <span style="color:var(--accent-purple);font-weight:700;">${w2} ${fracHTML(f2, den)}</span>
                        <span style="margin:0 10px;font-size:1.3rem;">=</span>
                        <span style="color:var(--accent-green);font-weight:700;font-size:1.3rem;">?</span>
                    </div>
                    <div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
                        ${Array.from({length: w1}, () => _svgBar(den, den, 60, barH, 'var(--accent-cyan)', 'var(--bg-card)')).join('')}
                        ${_svgBar(f1, den, 60, barH, 'var(--accent-cyan)', 'var(--bg-card)')}
                    </div>
                    <div style="font-size:1.2rem;font-weight:700;margin:4px 0;">+</div>
                    <div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
                        ${Array.from({length: w2}, () => _svgBar(den, den, 60, barH, 'var(--accent-purple)', 'var(--bg-card)')).join('')}
                        ${_svgBar(f2, den, 60, barH, 'var(--accent-purple)', 'var(--bg-card)')}
                    </div>
                    ${needsRegroup ? `<div style="margin-top:8px;font-size:0.85rem;color:var(--accent-orange);">Fraction parts add to ${fracSum}/${den} \u2014 regroup!</div>` : ''}
                </div>`;
                return;

            } else if (fracSkill === "sub_mixed_like") {
                // Grade 4: Subtract mixed numbers with SAME denominator
                const den = pick([2, 3, 4, 5, 6, 8]);
                let w1 = rng(2, 5);
                let f1 = rng(1, den - 1);
                let w2 = rng(1, w1 - 1);
                let f2 = rng(1, den - 1);
                // Ensure result >= 0
                const total1 = w1 * den + f1;
                const total2 = w2 * den + f2;
                if (total1 <= total2) {
                    w1 = w2 + 1;
                    f1 = f2 + 1;
                    if (f1 >= den) { f1 = 1; w1++; }
                }
                const resultNum = (w1 * den + f1) - (w2 * den + f2);
                const answer = _fracStr(Math.max(0, resultNum), den);
                const needsBorrow = f1 < f2;

                q.text = `Calculate: ${w1} ${f1}/${den} \u2212 ${w2} ${f2}/${den} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = needsBorrow
                    ? `Since ${f1}/${den} < ${f2}/${den}, borrow 1 whole (${den}/${den}) from ${w1}. Then ${w1 - 1} ${f1 + den}/${den} \u2212 ${w2} ${f2}/${den}.`
                    : `Subtract wholes: ${w1} \u2212 ${w2} = ${w1 - w2}. Subtract fractions: ${f1}/${den} \u2212 ${f2}/${den} = ${f1 - f2}/${den}.`;

                const barW = 240;
                const barH = 26;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Subtract Mixed Numbers</div>
                    <div style="font-size:1.2rem;margin-bottom:14px;">
                        <span style="color:var(--accent-cyan);font-weight:700;">${w1} ${fracHTML(f1, den)}</span>
                        <span style="margin:0 10px;font-size:1.3rem;">\u2212</span>
                        <span style="color:var(--accent-orange);font-weight:700;">${w2} ${fracHTML(f2, den)}</span>
                        <span style="margin:0 10px;font-size:1.3rem;">=</span>
                        <span style="color:var(--accent-green);font-weight:700;font-size:1.3rem;">?</span>
                    </div>
                    <div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
                        ${Array.from({length: w1}, () => _svgBar(den, den, 60, barH, 'var(--accent-cyan)', 'var(--bg-card)')).join('')}
                        ${f1 > 0 ? _svgBar(f1, den, 60, barH, 'var(--accent-cyan)', 'var(--bg-card)') : ''}
                    </div>
                    <div style="font-size:1.2rem;font-weight:700;margin:4px 0;color:var(--accent-orange);">\u2212</div>
                    <div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
                        ${Array.from({length: w2}, () => _svgBar(den, den, 60, barH, 'var(--accent-orange)', 'var(--bg-card)')).join('')}
                        ${_svgBar(f2, den, 60, barH, 'var(--accent-orange)', 'var(--bg-card)')}
                    </div>
                    ${needsBorrow ? `<div style="margin-top:8px;font-size:0.85rem;color:var(--accent-orange);">Need to borrow! ${f1}/${den} < ${f2}/${den}</div>` : ''}
                </div>`;
                return;

            } else if (fracSkill === "mult_frac_whole") {
                // Grade 4: Multiply fraction x whole number
                const den = pick([2, 3, 4, 5, 6, 8]);
                const num = rng(1, den - 1);
                const whole = rng(2, 6);
                const prodNum = num * whole;
                const answer = _fracStr(prodNum, den);
                const showOrder = Math.random() < 0.5;

                q.text = showOrder
                    ? `Calculate: ${whole} \u00D7 ${num}/${den} = ?`
                    : `Calculate: ${num}/${den} \u00D7 ${whole} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Multiply the numerator by the whole number: ${num} \u00D7 ${whole} = ${prodNum}. Keep the denominator: ${prodNum}/${den}. Simplify if needed.`;

                const barW = 70;
                const barH = 28;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Multiply Fraction \u00D7 Whole</div>
                    <div style="font-size:1.2rem;margin-bottom:14px;">
                        ${showOrder ? `<span style="font-size:1.5rem;font-weight:700;color:var(--accent-orange);">${whole}</span> <span style="margin:0 6px;">\u00D7</span> ${fracHTML(num, den, 'xl')}` : `${fracHTML(num, den, 'xl')} <span style="margin:0 6px;">\u00D7</span> <span style="font-size:1.5rem;font-weight:700;color:var(--accent-orange);">${whole}</span>`}
                        <span style="margin:0 8px;">=</span>
                        <span style="font-size:1.3rem;color:var(--accent-green);font-weight:700;">?</span>
                    </div>
                    <div style="font-size:0.9rem;color:var(--text-bright);margin-bottom:8px;">${whole} groups of ${num}/${den}:</div>
                    <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
                        ${Array.from({length: whole}, (_, i) => `<div style="text-align:center;">
                            ${_svgBar(num, den, barW, barH, 'var(--accent-cyan)', 'var(--bg-card)')}
                            <div style="font-size:0.75rem;color:var(--text-dim);">Group ${i + 1}</div>
                        </div>`).join('')}
                    </div>
                </div>`;
                return;

            } else if (fracSkill === "decompose_fractions") {
                // Grade 4: Decompose to unit fractions
                const den = pick([2, 3, 4, 5, 6, 8]);
                const num = rng(2, Math.min(den, 6));
                const answer = Array.from({length: num}, () => `1/${den}`).join(' + ');

                q.text = `Write ${num}/${den} as a sum of unit fractions.`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `A unit fraction has 1 as its numerator. ${num}/${den} = ${answer}.`;

                const barW = 260;
                const barH = 36;
                const segW = barW / den;
                let strips = '';
                for (let i = 0; i < den; i++) {
                    const isFilled = i < num;
                    strips += `<rect x="${i * segW}" y="0" width="${segW}" height="${barH}" fill="${isFilled ? 'var(--accent-cyan)' : 'var(--bg-card)'}" stroke="var(--text-bright)" stroke-width="1.5" opacity="${isFilled ? 1 : 0.3}"/>`;
                    if (isFilled) {
                        strips += `<text x="${i * segW + segW / 2}" y="${barH / 2 + 5}" text-anchor="middle" fill="var(--text-bright)" font-size="12" font-weight="bold">1/${den}</text>`;
                    }
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Decompose to Unit Fractions</div>
                    <div style="font-size:1.3rem;margin-bottom:14px;">
                        ${fracHTML(num, den, 'xl')} <span style="margin:0 10px;font-size:1.3rem;">=</span> <span style="color:var(--accent-green);font-weight:700;">?</span>
                    </div>
                    <svg width="${barW}" height="${barH}" viewBox="0 0 ${barW} ${barH}" style="display:block;margin:10px auto;">
                        ${strips}
                    </svg>
                    <div style="margin-top:10px;display:flex;justify-content:center;gap:6px;flex-wrap:wrap;">
                        ${Array.from({length: num}, (_, i) => `<div style="padding:6px 12px;background:var(--accent-cyan);color:#fff;border-radius:8px;font-weight:600;font-size:0.9rem;">1/${den}</div>`).join(`<span style="align-self:center;font-weight:700;">+</span>`)}
                    </div>
                </div>`;
                return;

            } else if (fracSkill === "frac_word_problems") {
                // Grade 4: Fraction word problems (add/sub, like denominators)
                const den = pick([4, 5, 6, 8, 10]);
                const names = [["Sara", "Tom"], ["Mia", "Jake"], ["Lily", "Ben"], ["Emma", "Noah"], ["Ava", "Liam"]];
                const items = [
                    {item: "pizza", unit: "of a pizza"},
                    {item: "chocolate bar", unit: "of a chocolate bar"},
                    {item: "pie", unit: "of a pie"},
                    {item: "cake", unit: "of a cake"},
                    {item: "watermelon", unit: "of a watermelon"}
                ];
                const [name1, name2] = pick(names);
                const thing = pick(items);
                const isAdd = Math.random() < 0.6;

                let n1, n2, resultNum, questionText;
                if (isAdd) {
                    n1 = rng(1, Math.floor(den / 2));
                    n2 = rng(1, Math.floor(den / 2));
                    resultNum = n1 + n2;
                    questionText = `${name1} ate ${n1}/${den} ${thing.unit}. ${name2} ate ${n2}/${den}. How much did they eat in total?`;
                } else {
                    n1 = rng(Math.floor(den / 2) + 1, den - 1);
                    n2 = rng(1, n1 - 1);
                    resultNum = n1 - n2;
                    questionText = `${name1} had ${n1}/${den} ${thing.unit}. ${name2} ate ${n2}/${den} of it. How much is left?`;
                }
                const answer = _fracStr(resultNum, den);

                q.text = questionText;
                q.ans = answer;
                q.answerType = "text";
                q.hint = isAdd
                    ? `Add the fractions: ${n1}/${den} + ${n2}/${den} = ${resultNum}/${den}. Simplify if you can.`
                    : `Subtract: ${n1}/${den} \u2212 ${n2}/${den} = ${resultNum}/${den}. Simplify if you can.`;

                const barW = 240;
                const barH = 30;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Fraction Word Problem</div>
                    <div style="font-size:1rem;margin-bottom:14px;max-width:340px;margin-left:auto;margin-right:auto;line-height:1.5;">
                        ${questionText}
                    </div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap;">
                        <div>
                            <div style="font-size:0.8rem;color:var(--text-bright);margin-bottom:4px;">${name1}: ${n1}/${den}</div>
                            ${_svgBar(n1, den, barW, barH, 'var(--accent-cyan)', 'var(--bg-card)')}
                        </div>
                    </div>
                    <div style="font-size:1.2rem;font-weight:700;margin:6px 0;">${isAdd ? '+' : '\u2212'}</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap;">
                        <div>
                            <div style="font-size:0.8rem;color:var(--text-bright);margin-bottom:4px;">${name2}: ${n2}/${den}</div>
                            ${_svgBar(n2, den, barW, barH, 'var(--accent-purple)', 'var(--bg-card)')}
                        </div>
                    </div>
                    <div style="border-top:2px solid var(--text-bright);margin:10px auto 6px;width:${barW}px;"></div>
                    <div style="font-size:0.9rem;color:var(--accent-green);font-weight:600;">= ?</div>
                </div>`;
                return;

            } else if (fracSkill === "frac_10_100") {
                // Grade 4: Express /10 as /100 equivalent
                const num10 = rng(1, 9);
                const num100 = num10 * 10;

                q.text = `Write ${num10}/10 as a fraction with denominator 100.`;
                q.ans = `${num100}/100`;
                q.answerType = "text";
                q.hint = `Multiply both numerator and denominator by 10: ${num10}/10 = ${num100}/100.`;

                // Side-by-side grids: 1x10 and 10x10
                const grid10W = 30;
                const grid10H = 200;
                const cellH10 = grid10H / 10;
                let grid10Rects = '';
                for (let i = 0; i < 10; i++) {
                    const fill = i < num10 ? 'var(--accent-cyan)' : 'var(--bg-card)';
                    const opacity = i < num10 ? '1' : '0.3';
                    grid10Rects += `<rect x="0" y="${i * cellH10}" width="${grid10W}" height="${cellH10}" fill="${fill}" stroke="var(--text-bright)" stroke-width="1" opacity="${opacity}"/>`;
                }

                const grid100Size = 200;
                const cellSize = grid100Size / 10;
                let grid100Rects = '';
                for (let r = 0; r < 10; r++) {
                    for (let c = 0; c < 10; c++) {
                        const idx = r * 10 + c;
                        const fill = idx < num100 ? 'var(--accent-purple)' : 'var(--bg-card)';
                        const opacity = idx < num100 ? '1' : '0.3';
                        grid100Rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="${fill}" stroke="var(--text-bright)" stroke-width="0.5" opacity="${opacity}"/>`;
                    }
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Tenths and Hundredths</div>
                    <div style="font-size:1.2rem;margin-bottom:14px;">
                        ${fracHTML(num10, 10, 'xl')} <span style="margin:0 10px;font-size:1.3rem;">=</span> ${fracHTML('?', 100, 'xl')}
                    </div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:30px;">
                        <div style="text-align:center;">
                            <svg width="${grid10W + 4}" height="${grid10H + 4}" viewBox="-2 -2 ${grid10W + 4} ${grid10H + 4}">${grid10Rects}</svg>
                            <div style="font-size:0.8rem;margin-top:4px;color:var(--text-bright);">${num10}/10</div>
                        </div>
                        <span style="font-size:1.5rem;font-weight:700;color:var(--accent-green);">=</span>
                        <div style="text-align:center;">
                            <svg width="${grid100Size + 4}" height="${grid100Size + 4}" viewBox="-2 -2 ${grid100Size + 4} ${grid100Size + 4}">${grid100Rects}</svg>
                            <div style="font-size:0.8rem;margin-top:4px;color:var(--text-bright);">?/100</div>
                        </div>
                    </div>
                </div>`;
                return;

            } else if (fracSkill === "add_frac_unlike") {
                // Grade 5: Add fractions with UNLIKE denominators
                const denOptions = [2, 3, 4, 5, 6, 8, 10, 12];
                let d1 = pick(denOptions);
                let d2 = pick(denOptions);
                while (d1 === d2) d2 = pick(denOptions);
                const n1 = rng(1, d1 - 1);
                const n2 = rng(1, d2 - 1);
                const lcd = _lcm(d1, d2);
                const conv1 = n1 * (lcd / d1);
                const conv2 = n2 * (lcd / d2);
                const sumNum = conv1 + conv2;
                const answer = _fracStr(sumNum, lcd);

                q.text = `Calculate: ${n1}/${d1} + ${n2}/${d2} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Find LCD = ${lcd}. Convert: ${n1}/${d1} = ${conv1}/${lcd} and ${n2}/${d2} = ${conv2}/${lcd}. Add: ${conv1}/${lcd} + ${conv2}/${lcd} = ${sumNum}/${lcd}. Simplify.`;

                const barW = 260;
                const barH = 28;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Add Fractions (Unlike Denominators)</div>
                    <div style="font-size:1.2rem;margin-bottom:14px;">
                        ${fracHTML(n1, d1, 'xl')} <span style="margin:0 8px;font-size:1.3rem;">+</span> ${fracHTML(n2, d2, 'xl')} <span style="margin:0 8px;font-size:1.3rem;">=</span> <span style="font-size:1.3rem;color:var(--accent-green);font-weight:700;">?</span>
                    </div>
                    <div style="margin-bottom:6px;font-size:0.85rem;color:var(--text-bright);">Original:</div>
                    <div style="display:flex;justify-content:center;gap:10px;margin-bottom:8px;">
                        <div>${_svgBar(n1, d1, 120, barH, 'var(--accent-cyan)', 'var(--bg-card)')}<div style="font-size:0.75rem;">${n1}/${d1}</div></div>
                        <div>${_svgBar(n2, d2, 120, barH, 'var(--accent-purple)', 'var(--bg-card)')}<div style="font-size:0.75rem;">${n2}/${d2}</div></div>
                    </div>
                    <div style="background:rgba(255,255,255,0.08);padding:10px;border-radius:10px;margin:8px auto;max-width:300px;">
                        <div style="font-size:0.85rem;color:var(--accent-green);margin-bottom:6px;">LCD = <span style="display:inline-block;min-width:40px;border-bottom:2px solid var(--accent-green);">&nbsp;</span></div>
                        <div style="display:flex;justify-content:center;gap:10px;">
                            <div>${_svgBar(conv1, lcd, 120, barH, 'var(--accent-cyan)', 'var(--bg-card)')}<div style="font-size:0.75rem;">__/__</div></div>
                            <div>${_svgBar(conv2, lcd, 120, barH, 'var(--accent-purple)', 'var(--bg-card)')}<div style="font-size:0.75rem;">__/__</div></div>
                        </div>
                    </div>
                </div>`;
                return;

            } else if (fracSkill === "sub_frac_unlike") {
                // Grade 5: Subtract fractions with UNLIKE denominators
                const denOptions = [2, 3, 4, 5, 6, 8, 10, 12];
                let d1 = pick(denOptions);
                let d2 = pick(denOptions);
                while (d1 === d2) d2 = pick(denOptions);
                let n1 = rng(1, d1 - 1);
                let n2 = rng(1, d2 - 1);
                const lcd = _lcm(d1, d2);
                let conv1 = n1 * (lcd / d1);
                let conv2 = n2 * (lcd / d2);
                // Ensure positive result
                if (conv1 < conv2) {
                    [n1, n2] = [n2, n1];
                    [d1, d2] = [d2, d1];
                    [conv1, conv2] = [conv2, conv1];
                }
                const diffNum = conv1 - conv2;
                const answer = _fracStr(diffNum, lcd);

                q.text = `Calculate: ${n1}/${d1} \u2212 ${n2}/${d2} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Find LCD = ${lcd}. Convert: ${n1}/${d1} = ${conv1}/${lcd} and ${n2}/${d2} = ${conv2}/${lcd}. Subtract: ${conv1}/${lcd} \u2212 ${conv2}/${lcd} = ${diffNum}/${lcd}. Simplify.`;

                const barW = 260;
                const barH = 28;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Subtract Fractions (Unlike Denominators)</div>
                    <div style="font-size:1.2rem;margin-bottom:14px;">
                        ${fracHTML(n1, d1, 'xl')} <span style="margin:0 8px;font-size:1.3rem;">\u2212</span> ${fracHTML(n2, d2, 'xl')} <span style="margin:0 8px;font-size:1.3rem;">=</span> <span style="font-size:1.3rem;color:var(--accent-green);font-weight:700;">?</span>
                    </div>
                    <div style="margin-bottom:6px;font-size:0.85rem;color:var(--text-bright);">Original:</div>
                    <div style="display:flex;justify-content:center;gap:10px;margin-bottom:8px;">
                        <div>${_svgBar(n1, d1, 120, barH, 'var(--accent-cyan)', 'var(--bg-card)')}<div style="font-size:0.75rem;">${n1}/${d1}</div></div>
                        <div>${_svgBar(n2, d2, 120, barH, 'var(--accent-orange)', 'var(--bg-card)')}<div style="font-size:0.75rem;">${n2}/${d2}</div></div>
                    </div>
                    <div style="background:rgba(255,255,255,0.08);padding:10px;border-radius:10px;margin:8px auto;max-width:300px;">
                        <div style="font-size:0.85rem;color:var(--accent-green);margin-bottom:6px;">LCD = <span style="display:inline-block;min-width:40px;border-bottom:2px solid var(--accent-green);">&nbsp;</span></div>
                        <div style="display:flex;justify-content:center;gap:10px;">
                            <div>${_svgBar(conv1, lcd, 120, barH, 'var(--accent-cyan)', 'var(--bg-card)')}<div style="font-size:0.75rem;">__/__</div></div>
                            <div>${_svgBar(conv2, lcd, 120, barH, 'var(--accent-orange)', 'var(--bg-card)')}<div style="font-size:0.75rem;">__/__</div></div>
                        </div>
                    </div>
                </div>`;
                return;

            } else if (fracSkill === "add_mixed_unlike") {
                // Grade 5: Add mixed numbers with UNLIKE denominators
                const denPairs = [{d1:2,d2:3},{d1:2,d2:4},{d1:3,d2:4},{d1:2,d2:6},{d1:3,d2:6},{d1:4,d2:8},{d1:2,d2:5},{d1:5,d2:10}];
                const dp = pick(denPairs);
                const d1 = dp.d1, d2 = dp.d2;
                const lcd = _lcm(d1, d2);
                const w1 = rng(1, 4);
                const f1 = rng(1, d1 - 1);
                const w2 = rng(1, 3);
                const f2 = rng(1, d2 - 1);
                const totalImp = (w1 * d1 + f1) * (lcd / d1) + (w2 * d2 + f2) * (lcd / d2);
                const answer = _fracStr(totalImp, lcd);
                const conv1 = f1 * (lcd / d1);
                const conv2 = f2 * (lcd / d2);
                const fracSum = conv1 + conv2;

                q.text = `Calculate: ${w1} ${f1}/${d1} + ${w2} ${f2}/${d2} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Find LCD = ${lcd}. Convert fractions: ${f1}/${d1} = ${conv1}/${lcd}, ${f2}/${d2} = ${conv2}/${lcd}. Add wholes: ${w1} + ${w2} = ${w1 + w2}. Add fractions: ${conv1}/${lcd} + ${conv2}/${lcd} = ${fracSum}/${lcd}. Simplify.`;

                const barH = 24;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Add Mixed Numbers (Unlike Denominators)</div>
                    <div style="font-size:1.1rem;margin-bottom:14px;">
                        <span style="color:var(--accent-cyan);font-weight:700;">${w1} ${fracHTML(f1, d1)}</span>
                        <span style="margin:0 8px;">+</span>
                        <span style="color:var(--accent-purple);font-weight:700;">${w2} ${fracHTML(f2, d2)}</span>
                        <span style="margin:0 8px;">=</span>
                        <span style="color:var(--accent-green);font-weight:700;">?</span>
                    </div>
                    <div style="background:rgba(255,255,255,0.08);padding:10px;border-radius:10px;max-width:300px;margin:0 auto;">
                        <div style="font-size:0.85rem;color:var(--accent-green);margin-bottom:8px;">LCD = <span style="display:inline-block;min-width:40px;border-bottom:2px solid var(--accent-green);">&nbsp;</span></div>
                        <div style="margin-bottom:6px;">
                            <div style="font-size:0.8rem;color:var(--text-bright);">${f1}/${d1} = __/__</div>
                            ${_svgBar(conv1, lcd, 200, barH, 'var(--accent-cyan)', 'var(--bg-card)')}
                        </div>
                        <div style="font-size:1rem;font-weight:700;">+</div>
                        <div>
                            <div style="font-size:0.8rem;color:var(--text-bright);">${f2}/${d2} = __/__</div>
                            ${_svgBar(conv2, lcd, 200, barH, 'var(--accent-purple)', 'var(--bg-card)')}
                        </div>
                    </div>
                </div>`;
                return;

            } else if (fracSkill === "sub_mixed_unlike") {
                // Grade 5: Subtract mixed numbers with UNLIKE denominators
                const denPairs = [{d1:2,d2:3},{d1:2,d2:4},{d1:3,d2:4},{d1:2,d2:6},{d1:3,d2:6},{d1:4,d2:8},{d1:2,d2:5},{d1:5,d2:10}];
                const dp = pick(denPairs);
                const d1 = dp.d1, d2 = dp.d2;
                const lcd = _lcm(d1, d2);
                let w1 = rng(2, 5);
                const f1 = rng(1, d1 - 1);
                let w2 = rng(1, w1 - 1);
                const f2 = rng(1, d2 - 1);
                const total1 = (w1 * d1 + f1) * (lcd / d1);
                const total2 = (w2 * d2 + f2) * (lcd / d2);
                // Ensure positive
                if (total1 <= total2) {
                    w1 = w2 + 2;
                }
                const newTotal1 = (w1 * d1 + f1) * (lcd / d1);
                const diffImp = newTotal1 - total2;
                const answer = _fracStr(Math.max(0, diffImp), lcd);
                const conv1 = f1 * (lcd / d1);
                const conv2 = f2 * (lcd / d2);
                const needsBorrow = conv1 < conv2;

                q.text = `Calculate: ${w1} ${f1}/${d1} \u2212 ${w2} ${f2}/${d2} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Find LCD = ${lcd}. Convert: ${f1}/${d1} = ${conv1}/${lcd}, ${f2}/${d2} = ${conv2}/${lcd}.${needsBorrow ? ` Since ${conv1}/${lcd} < ${conv2}/${lcd}, borrow 1 whole (${lcd}/${lcd}).` : ''} Subtract.`;

                const barH = 24;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Subtract Mixed Numbers (Unlike Denominators)</div>
                    <div style="font-size:1.1rem;margin-bottom:14px;">
                        <span style="color:var(--accent-cyan);font-weight:700;">${w1} ${fracHTML(f1, d1)}</span>
                        <span style="margin:0 8px;">\u2212</span>
                        <span style="color:var(--accent-orange);font-weight:700;">${w2} ${fracHTML(f2, d2)}</span>
                        <span style="margin:0 8px;">=</span>
                        <span style="color:var(--accent-green);font-weight:700;">?</span>
                    </div>
                    <div style="background:rgba(255,255,255,0.08);padding:10px;border-radius:10px;max-width:300px;margin:0 auto;">
                        <div style="font-size:0.85rem;color:var(--accent-green);margin-bottom:8px;">LCD = <span style="display:inline-block;min-width:40px;border-bottom:2px solid var(--accent-green);">&nbsp;</span></div>
                        <div style="margin-bottom:6px;">
                            <div style="font-size:0.8rem;color:var(--text-bright);">${f1}/${d1} = __/__</div>
                            ${_svgBar(conv1, lcd, 200, barH, 'var(--accent-cyan)', 'var(--bg-card)')}
                        </div>
                        <div style="font-size:1rem;font-weight:700;color:var(--accent-orange);">\u2212</div>
                        <div>
                            <div style="font-size:0.8rem;color:var(--text-bright);">${f2}/${d2} = __/__</div>
                            ${_svgBar(conv2, lcd, 200, barH, 'var(--accent-orange)', 'var(--bg-card)')}
                        </div>
                        ${needsBorrow ? `<div style="margin-top:6px;font-size:0.8rem;color:var(--accent-orange);">Borrowing needed!</div>` : ''}
                    </div>
                </div>`;
                return;

            // ==================== NON-VISUAL ADD/SUB FRACTION SKILLS ====================

            } else if (fracSkill === "add_frac_like_nv") {
                // Grade 4: Add proper fractions, like denominators (no visual)
                const den = rng(2, 12);
                const maxNum = den - 1;
                const roll = Math.random();

                if (roll < 0.4) {
                    // Type 1: Straightforward addition
                    const n1 = rng(1, maxNum);
                    const n2 = rng(1, maxNum);
                    const sumNum = n1 + n2;
                    q.text = `${n1}/${den} + ${n2}/${den} = ?`;
                    q.ans = _fracStr(sumNum, den);
                    q.hint = `Same denominator: add numerators. ${n1} + ${n2} = ${sumNum}. Simplify ${sumNum}/${den} if possible.`;
                } else if (roll < 0.7) {
                    // Type 2: Missing numerator
                    const n1 = rng(1, maxNum);
                    const n2 = rng(1, maxNum);
                    const sumNum = n1 + n2;
                    q.text = `${n1}/${den} + ?/${den} = ${_fracStr(sumNum, den)}. Find the missing numerator.`;
                    q.ans = String(n2);
                    q.hint = `What plus ${n1} equals ${sumNum}? The missing numerator is ${sumNum} \u2212 ${n1}.`;
                } else {
                    // Type 3: Simplify the sum
                    const n1 = rng(1, maxNum);
                    const n2 = rng(1, maxNum);
                    const sumNum = n1 + n2;
                    q.text = `Add and simplify: ${n1}/${den} + ${n2}/${den}`;
                    q.ans = _fracStr(sumNum, den);
                    const [sn, sd] = _simplify(sumNum, den);
                    q.hint = `${n1} + ${n2} = ${sumNum}. So the sum is ${sumNum}/${den}${sn !== sumNum || sd !== den ? ` = ${sn}/${sd}` : ''}.${sumNum >= den ? ` Convert to mixed number: ${_fracStr(sumNum, den)}.` : ''}`;
                }
                q.answerType = "text";
                q.printFormat = "frac-add-like-nv";
                q.skillLabel = "Add Fractions (Like)";
                return;

            } else if (fracSkill === "sub_frac_like_nv") {
                // Grade 4: Subtract proper fractions, like denominators (no visual)
                const den = rng(2, 12);
                const roll = Math.random();

                if (roll < 0.4) {
                    // Type 1: Straightforward subtraction
                    const n1 = rng(2, den);
                    const n2 = rng(1, n1 - 1);
                    const diffNum = n1 - n2;
                    q.text = `${n1}/${den} \u2212 ${n2}/${den} = ?`;
                    q.ans = _fracStr(diffNum, den);
                    q.hint = `Same denominator: subtract numerators. ${n1} \u2212 ${n2} = ${diffNum}. Simplify ${diffNum}/${den} if possible.`;
                } else if (roll < 0.7) {
                    // Type 2: Missing numerator
                    const n1 = rng(2, den);
                    const n2 = rng(1, n1 - 1);
                    const diffNum = n1 - n2;
                    q.text = `${n1}/${den} \u2212 ?/${den} = ${_fracStr(diffNum, den)}. Find the missing numerator.`;
                    q.ans = String(n2);
                    q.hint = `${n1} minus what equals ${diffNum}? The missing numerator is ${n1} \u2212 ${diffNum} = ${n2}.`;
                } else {
                    // Type 3: Subtract and simplify
                    const n1 = rng(2, den);
                    const n2 = rng(1, n1 - 1);
                    const diffNum = n1 - n2;
                    q.text = `Subtract and simplify: ${n1}/${den} \u2212 ${n2}/${den}`;
                    q.ans = _fracStr(diffNum, den);
                    const [sn, sd] = _simplify(diffNum, den);
                    q.hint = `${n1} \u2212 ${n2} = ${diffNum}. So the difference is ${diffNum}/${den}${sn !== diffNum || sd !== den ? ` = ${sn}/${sd}` : ''}.`;
                }
                q.answerType = "text";
                q.printFormat = "frac-sub-like-nv";
                q.skillLabel = "Subtract Fractions (Like)";
                return;

            } else if (fracSkill === "add_frac_unlike_nv") {
                // Grade 5: Add proper fractions, unlike denominators (no visual)
                const denPairs = [[2,3],[2,4],[3,4],[2,5],[3,5],[4,5],[2,6],[3,6],[4,6],[5,6],[2,8],[3,8],[4,8],[5,10],[2,10],[3,10],[4,10],[6,10],[2,12],[3,12],[4,12],[6,12]];
                const [d1, d2] = pick(denPairs);
                const lcd = _lcm(d1, d2);
                const roll = Math.random();

                if (roll < 0.4) {
                    // Type 1: Straightforward addition
                    const n1 = rng(1, d1 - 1);
                    const n2 = rng(1, d2 - 1);
                    const sumNum = n1 * (lcd / d1) + n2 * (lcd / d2);
                    q.text = `${n1}/${d1} + ${n2}/${d2} = ?`;
                    q.ans = _fracStr(sumNum, lcd);
                    q.hint = `LCD = ${lcd}. Convert: ${n1}/${d1} = ${n1 * (lcd / d1)}/${lcd}, ${n2}/${d2} = ${n2 * (lcd / d2)}/${lcd}. Add: ${n1 * (lcd / d1)} + ${n2 * (lcd / d2)} = ${sumNum}. Simplify ${sumNum}/${lcd}.`;
                } else if (roll < 0.7) {
                    // Type 2: Show LCD conversion step
                    const n1 = rng(1, d1 - 1);
                    const n2 = rng(1, d2 - 1);
                    const conv1 = n1 * (lcd / d1);
                    const conv2 = n2 * (lcd / d2);
                    const sumNum = conv1 + conv2;
                    q.text = `${n1}/${d1} + ${n2}/${d2} = ${conv1}/${lcd} + ${conv2}/${lcd} = ?`;
                    q.ans = _fracStr(sumNum, lcd);
                    q.hint = `The fractions are already converted to LCD ${lcd}. Add: ${conv1} + ${conv2} = ${sumNum}. Simplify ${sumNum}/${lcd}.`;
                } else {
                    // Type 3: Missing numerator
                    const n1 = rng(1, d1 - 1);
                    const n2 = rng(1, d2 - 1);
                    const sumNum = n1 * (lcd / d1) + n2 * (lcd / d2);
                    q.text = `${n1}/${d1} + ?/${d2} = ${_fracStr(sumNum, lcd)}. Find the missing numerator.`;
                    q.ans = String(n2);
                    q.hint = `Convert ${n1}/${d1} to ${n1 * (lcd / d1)}/${lcd}. The sum is ${_fracStr(sumNum, lcd)}. Work backward: ${_fracStr(sumNum, lcd)} \u2212 ${n1 * (lcd / d1)}/${lcd} = ${n2 * (lcd / d2)}/${lcd} = ${n2}/${d2}.`;
                }
                q.answerType = "text";
                q.printFormat = "frac-add-unlike-nv";
                q.skillLabel = "Add Fractions (Unlike)";
                return;

            } else if (fracSkill === "sub_frac_unlike_nv") {
                // Grade 5: Subtract proper fractions, unlike denominators (no visual)
                const denPairs = [[2,3],[2,4],[3,4],[2,5],[3,5],[4,5],[2,6],[3,6],[4,6],[5,6],[2,8],[3,8],[4,8],[5,10],[2,10],[3,10],[4,10],[6,10],[2,12],[3,12],[4,12],[6,12]];
                const [d1, d2] = pick(denPairs);
                const lcd = _lcm(d1, d2);
                const roll = Math.random();

                // Generate n1, n2 ensuring result >= 0
                let n1, n2, conv1, conv2;
                do {
                    n1 = rng(1, d1 - 1);
                    n2 = rng(1, d2 - 1);
                    conv1 = n1 * (lcd / d1);
                    conv2 = n2 * (lcd / d2);
                } while (conv1 <= conv2);

                const diffNum = conv1 - conv2;

                if (roll < 0.4) {
                    // Type 1: Straightforward subtraction
                    q.text = `${n1}/${d1} \u2212 ${n2}/${d2} = ?`;
                    q.ans = _fracStr(diffNum, lcd);
                    q.hint = `LCD = ${lcd}. Convert: ${n1}/${d1} = ${conv1}/${lcd}, ${n2}/${d2} = ${conv2}/${lcd}. Subtract: ${conv1} \u2212 ${conv2} = ${diffNum}. Simplify ${diffNum}/${lcd}.`;
                } else if (roll < 0.7) {
                    // Type 2: Show LCD conversion step
                    q.text = `${n1}/${d1} \u2212 ${n2}/${d2} = ${conv1}/${lcd} \u2212 ${conv2}/${lcd} = ?`;
                    q.ans = _fracStr(diffNum, lcd);
                    q.hint = `Fractions are already converted to LCD ${lcd}. Subtract: ${conv1} \u2212 ${conv2} = ${diffNum}. Simplify ${diffNum}/${lcd}.`;
                } else {
                    // Type 3: Missing numerator
                    q.text = `${n1}/${d1} \u2212 ?/${d2} = ${_fracStr(diffNum, lcd)}. Find the missing numerator.`;
                    q.ans = String(n2);
                    q.hint = `Convert ${n1}/${d1} to ${conv1}/${lcd}. The difference is ${_fracStr(diffNum, lcd)}. Work backward: ${conv1}/${lcd} \u2212 ${_fracStr(diffNum, lcd)} = ${conv2}/${lcd} = ${n2}/${d2}.`;
                }
                q.answerType = "text";
                q.printFormat = "frac-sub-unlike-nv";
                q.skillLabel = "Subtract Fractions (Unlike)";
                return;

            } else if (fracSkill === "add_mixed_like_nv") {
                // Grade 4: Add mixed numbers, like denominators (no visual)
                const den = pick([2, 3, 4, 5, 6, 8]);
                const roll = Math.random();

                if (roll < 0.5) {
                    // Type 1: Straightforward addition
                    const w1 = rng(1, 9);
                    const f1 = rng(1, den - 1);
                    const w2 = rng(1, 9);
                    const f2 = rng(1, den - 1);
                    const totalNum = (w1 * den + f1) + (w2 * den + f2);
                    q.text = `${w1} ${f1}/${den} + ${w2} ${f2}/${den} = ?`;
                    q.ans = _fracStr(totalNum, den);
                    const fracSum = f1 + f2;
                    q.hint = `Add wholes: ${w1} + ${w2} = ${w1 + w2}. Add fractions: ${f1}/${den} + ${f2}/${den} = ${fracSum}/${den}.${fracSum >= den ? ` Regroup: ${fracSum}/${den} = 1 ${fracSum - den}/${den}.` : ''} Simplify.`;
                } else if (roll < 0.75) {
                    // Type 2: With regrouping (fraction sum >= denominator)
                    const w1 = rng(1, 9);
                    const w2 = rng(1, 9);
                    // Ensure fractions add to >= den for regrouping
                    const f1 = rng(Math.ceil(den / 2), den - 1);
                    const f2 = rng(Math.max(1, den - f1), den - 1);
                    const totalNum = (w1 * den + f1) + (w2 * den + f2);
                    q.text = `${w1} ${f1}/${den} + ${w2} ${f2}/${den} = ?`;
                    q.ans = _fracStr(totalNum, den);
                    const fracSum = f1 + f2;
                    q.hint = `Add wholes: ${w1} + ${w2} = ${w1 + w2}. Fractions: ${f1} + ${f2} = ${fracSum}. Since ${fracSum} \u2265 ${den}, regroup: ${fracSum}/${den} = ${Math.floor(fracSum / den)} ${fracSum % den}/${den}. Total: ${_fracStr(totalNum, den)}.`;
                } else {
                    // Type 3: Missing whole number or mixed number
                    const w1 = rng(1, 5);
                    const f1 = rng(1, den - 1);
                    const w2 = rng(1, 5);
                    const f2 = rng(1, den - 1);
                    const totalNum = (w1 * den + f1) + (w2 * den + f2);
                    const totalStr = _fracStr(totalNum, den);
                    q.text = `${w1} ${f1}/${den} + ? = ${totalStr}. Find the missing number.`;
                    // The missing addend is w2 f2/den
                    const missingNum = (w2 * den + f2);
                    q.ans = _fracStr(missingNum, den);
                    q.hint = `${totalStr} \u2212 ${w1} ${f1}/${den} = ? Convert to improper: ${totalNum}/${den} \u2212 ${w1 * den + f1}/${den} = ${missingNum}/${den} = ${_fracStr(missingNum, den)}.`;
                }
                q.answerType = "text";
                q.printFormat = "frac-add-mixed-like-nv";
                q.skillLabel = "Add Mixed (Like)";
                return;

            } else if (fracSkill === "sub_mixed_like_nv") {
                // Grade 4: Subtract mixed numbers, like denominators (no visual)
                const den = pick([2, 3, 4, 5, 6, 8]);
                const roll = Math.random();

                if (roll < 0.5) {
                    // Type 1: Straightforward subtraction (no borrowing needed)
                    const w1 = rng(2, 9);
                    const f1 = rng(1, den - 1);
                    const w2 = rng(1, w1 - 1);
                    let f2 = rng(1, Math.min(f1, den - 1)); // f2 <= f1 so no borrowing
                    if (f2 > f1) f2 = f1 > 1 ? rng(1, f1 - 1) : 1;
                    // Ensure f2 <= f1 for no borrowing
                    if (f2 > f1) { const tmp = f1; f2 = tmp > 1 ? rng(1, tmp - 1) : 1; }
                    const total1 = w1 * den + f1;
                    const total2 = w2 * den + f2;
                    const diffNum = total1 - total2;
                    q.text = `${w1} ${f1}/${den} \u2212 ${w2} ${f2}/${den} = ?`;
                    q.ans = _fracStr(diffNum, den);
                    q.hint = `Subtract wholes: ${w1} \u2212 ${w2} = ${w1 - w2}. Subtract fractions: ${f1}/${den} \u2212 ${f2}/${den} = ${f1 - f2}/${den}. Simplify.`;
                } else if (roll < 0.75) {
                    // Type 2: With borrowing (f2 > f1)
                    const w1 = rng(3, 9);
                    const w2 = rng(1, w1 - 1);
                    const f1 = rng(1, Math.floor(den / 2));
                    const f2 = rng(f1 + 1, den - 1); // f2 > f1 forces borrowing
                    const total1 = w1 * den + f1;
                    const total2 = w2 * den + f2;
                    const diffNum = total1 - total2;
                    q.text = `${w1} ${f1}/${den} \u2212 ${w2} ${f2}/${den} = ?`;
                    q.ans = _fracStr(Math.max(0, diffNum), den);
                    q.hint = `Since ${f1} < ${f2}, borrow 1 from ${w1}: ${w1} ${f1}/${den} = ${w1 - 1} ${f1 + den}/${den}. Now subtract: ${w1 - 1} \u2212 ${w2} = ${w1 - 1 - w2}, ${f1 + den} \u2212 ${f2} = ${f1 + den - f2}. Result: ${_fracStr(Math.max(0, diffNum), den)}.`;
                } else {
                    // Type 3: Missing subtrahend
                    const w1 = rng(3, 7);
                    const f1 = rng(1, den - 1);
                    const w2 = rng(1, w1 - 1);
                    const f2 = rng(1, den - 1);
                    const total1 = w1 * den + f1;
                    const total2 = w2 * den + f2;
                    const diffNum = total1 - total2;
                    if (diffNum <= 0) {
                        // Fallback to straightforward
                        const safeDiff = total1 - (w2 * den + 1);
                        q.text = `${w1} ${f1}/${den} \u2212 ${w2} 1/${den} = ?`;
                        q.ans = _fracStr(Math.max(0, safeDiff), den);
                        q.hint = `Subtract wholes: ${w1} \u2212 ${w2} = ${w1 - w2}. Subtract fractions: ${f1}/${den} \u2212 1/${den} = ${f1 - 1}/${den}. ${f1 < 1 ? 'Need to borrow.' : 'Simplify.'}`;
                    } else {
                        const diffStr = _fracStr(diffNum, den);
                        q.text = `${w1} ${f1}/${den} \u2212 ? = ${diffStr}. Find the missing number.`;
                        q.ans = _fracStr(total2, den);
                        q.hint = `${w1} ${f1}/${den} \u2212 ${diffStr} = ? Convert to improper: ${total1}/${den} \u2212 ${diffNum}/${den} = ${total2}/${den} = ${_fracStr(total2, den)}.`;
                    }
                }
                q.answerType = "text";
                q.printFormat = "frac-sub-mixed-like-nv";
                q.skillLabel = "Subtract Mixed (Like)";
                return;

            } else if (fracSkill === "add_mixed_unlike_nv") {
                // Grade 5: Add mixed numbers, unlike denominators (no visual)
                const denPairs = [[2,3],[2,4],[3,4],[2,5],[3,5],[4,5],[2,6],[3,6],[4,6],[5,6],[2,8],[3,8],[4,8],[5,10],[2,10],[3,10],[4,10],[6,10],[2,12],[3,12],[4,12],[6,12]];
                const [d1, d2] = pick(denPairs);
                const lcd = _lcm(d1, d2);
                const roll = Math.random();

                if (roll < 0.5) {
                    // Type 1: Straightforward addition
                    const w1 = rng(1, 6);
                    const f1 = rng(1, d1 - 1);
                    const w2 = rng(1, 6);
                    const f2 = rng(1, d2 - 1);
                    const totalNum = (w1 * d1 + f1) * (lcd / d1) + (w2 * d2 + f2) * (lcd / d2);
                    const conv1 = f1 * (lcd / d1);
                    const conv2 = f2 * (lcd / d2);
                    q.text = `${w1} ${f1}/${d1} + ${w2} ${f2}/${d2} = ?`;
                    q.ans = _fracStr(totalNum, lcd);
                    q.hint = `LCD = ${lcd}. Convert fractions: ${f1}/${d1} = ${conv1}/${lcd}, ${f2}/${d2} = ${conv2}/${lcd}. Add wholes: ${w1} + ${w2} = ${w1 + w2}. Add fractions: ${conv1} + ${conv2} = ${conv1 + conv2}.${conv1 + conv2 >= lcd ? ` Regroup: ${conv1 + conv2}/${lcd} = 1 ${conv1 + conv2 - lcd}/${lcd}.` : ''} Simplify.`;
                } else if (roll < 0.75) {
                    // Type 2: With regrouping (fractions sum >= lcd)
                    const w1 = rng(1, 6);
                    const w2 = rng(1, 6);
                    // Pick fractions that sum to >= lcd
                    let f1, f2, conv1, conv2;
                    do {
                        f1 = rng(1, d1 - 1);
                        f2 = rng(1, d2 - 1);
                        conv1 = f1 * (lcd / d1);
                        conv2 = f2 * (lcd / d2);
                    } while (conv1 + conv2 < lcd);
                    const totalNum = (w1 * d1 + f1) * (lcd / d1) + (w2 * d2 + f2) * (lcd / d2);
                    q.text = `${w1} ${f1}/${d1} + ${w2} ${f2}/${d2} = ?`;
                    q.ans = _fracStr(totalNum, lcd);
                    const fracSum = conv1 + conv2;
                    q.hint = `LCD = ${lcd}. Fractions: ${conv1}/${lcd} + ${conv2}/${lcd} = ${fracSum}/${lcd}. Since ${fracSum} \u2265 ${lcd}, regroup. Wholes: ${w1} + ${w2} + 1 = ${w1 + w2 + 1}. Fraction remainder: ${fracSum - lcd}/${lcd}. Simplify.`;
                } else {
                    // Type 3: Missing addend
                    const w1 = rng(1, 4);
                    const f1 = rng(1, d1 - 1);
                    const w2 = rng(1, 4);
                    const f2 = rng(1, d2 - 1);
                    const total1 = (w1 * d1 + f1) * (lcd / d1);
                    const total2 = (w2 * d2 + f2) * (lcd / d2);
                    const totalNum = total1 + total2;
                    const totalStr = _fracStr(totalNum, lcd);
                    q.text = `${w1} ${f1}/${d1} + ? = ${totalStr}. Find the missing number.`;
                    q.ans = _fracStr(total2, lcd);
                    q.hint = `${totalStr} \u2212 ${w1} ${f1}/${d1} = ? Convert to LCD ${lcd}: ${totalNum}/${lcd} \u2212 ${total1}/${lcd} = ${total2}/${lcd} = ${_fracStr(total2, lcd)}.`;
                }
                q.answerType = "text";
                q.printFormat = "frac-add-mixed-unlike-nv";
                q.skillLabel = "Add Mixed (Unlike)";
                return;

            } else if (fracSkill === "sub_mixed_unlike_nv") {
                // Grade 5: Subtract mixed numbers, unlike denominators (no visual)
                const denPairs = [[2,3],[2,4],[3,4],[2,5],[3,5],[4,5],[2,6],[3,6],[4,6],[5,6],[2,8],[3,8],[4,8],[5,10],[2,10],[3,10],[4,10],[6,10],[2,12],[3,12],[4,12],[6,12]];
                const [d1, d2] = pick(denPairs);
                const lcd = _lcm(d1, d2);
                const roll = Math.random();

                if (roll < 0.5) {
                    // Type 1: Straightforward subtraction
                    const w1 = rng(3, 6);
                    const f1 = rng(1, d1 - 1);
                    const w2 = rng(1, w1 - 1);
                    const f2 = rng(1, d2 - 1);
                    const total1 = (w1 * d1 + f1) * (lcd / d1);
                    const total2 = (w2 * d2 + f2) * (lcd / d2);
                    // Ensure positive result
                    if (total1 <= total2) {
                        // Fallback: increase w1
                        const w1b = w2 + 2;
                        const total1b = (w1b * d1 + f1) * (lcd / d1);
                        const diffNum = total1b - total2;
                        const conv1 = f1 * (lcd / d1);
                        const conv2 = f2 * (lcd / d2);
                        q.text = `${w1b} ${f1}/${d1} \u2212 ${w2} ${f2}/${d2} = ?`;
                        q.ans = _fracStr(Math.max(0, diffNum), lcd);
                        q.hint = `LCD = ${lcd}. Convert: ${f1}/${d1} = ${conv1}/${lcd}, ${f2}/${d2} = ${conv2}/${lcd}.${conv1 < conv2 ? ` Since ${conv1} < ${conv2}, borrow 1 whole.` : ''} Subtract wholes, subtract fractions. Simplify.`;
                    } else {
                        const diffNum = total1 - total2;
                        const conv1 = f1 * (lcd / d1);
                        const conv2 = f2 * (lcd / d2);
                        q.text = `${w1} ${f1}/${d1} \u2212 ${w2} ${f2}/${d2} = ?`;
                        q.ans = _fracStr(diffNum, lcd);
                        q.hint = `LCD = ${lcd}. Convert: ${f1}/${d1} = ${conv1}/${lcd}, ${f2}/${d2} = ${conv2}/${lcd}.${conv1 < conv2 ? ` Since ${conv1} < ${conv2}, borrow 1 whole.` : ''} Subtract wholes, subtract fractions. Simplify.`;
                    }
                } else if (roll < 0.75) {
                    // Type 2: With borrowing
                    const w1 = rng(3, 6);
                    const w2 = rng(1, w1 - 1);
                    // Pick fractions where f1 < f2 in LCD terms to force borrowing
                    let f1, f2, conv1, conv2;
                    let attempts = 0;
                    do {
                        f1 = rng(1, d1 - 1);
                        f2 = rng(1, d2 - 1);
                        conv1 = f1 * (lcd / d1);
                        conv2 = f2 * (lcd / d2);
                        attempts++;
                    } while (conv1 >= conv2 && attempts < 50);
                    // If we couldn't force borrowing, just do straightforward
                    if (conv1 >= conv2) {
                        const tmp = f1; f1 = f2; f2 = tmp;
                        conv1 = f1 * (lcd / d1);
                        conv2 = f2 * (lcd / d2);
                    }
                    const total1 = (w1 * d1 + f1) * (lcd / d1);
                    const total2 = (w2 * d2 + f2) * (lcd / d2);
                    const diffNum = total1 - total2;
                    if (diffNum <= 0) {
                        // Safety: increase w1
                        const w1b = w2 + 2;
                        const total1b = (w1b * d1 + f1) * (lcd / d1);
                        q.text = `${w1b} ${f1}/${d1} \u2212 ${w2} ${f2}/${d2} = ?`;
                        q.ans = _fracStr(Math.max(0, total1b - total2), lcd);
                        q.hint = `LCD = ${lcd}. Convert fractions: ${conv1}/${lcd} and ${conv2}/${lcd}. Since ${conv1} < ${conv2}, borrow 1 whole (= ${lcd}/${lcd}). Then subtract. Simplify.`;
                    } else {
                        q.text = `${w1} ${f1}/${d1} \u2212 ${w2} ${f2}/${d2} = ?`;
                        q.ans = _fracStr(diffNum, lcd);
                        q.hint = `LCD = ${lcd}. Convert fractions: ${conv1}/${lcd} and ${conv2}/${lcd}. Since ${conv1} < ${conv2}, borrow 1 whole (= ${lcd}/${lcd}): ${conv1 + lcd}/${lcd} \u2212 ${conv2}/${lcd} = ${conv1 + lcd - conv2}/${lcd}. Subtract wholes: ${w1 - 1} \u2212 ${w2} = ${w1 - 1 - w2}. Simplify.`;
                    }
                } else {
                    // Type 3: Missing subtrahend
                    const w1 = rng(3, 6);
                    const f1 = rng(1, d1 - 1);
                    const w2 = rng(1, w1 - 1);
                    const f2 = rng(1, d2 - 1);
                    const total1 = (w1 * d1 + f1) * (lcd / d1);
                    const total2 = (w2 * d2 + f2) * (lcd / d2);
                    if (total1 <= total2) {
                        // Fallback to straightforward
                        const w1b = w2 + 2;
                        const total1b = (w1b * d1 + f1) * (lcd / d1);
                        const diffNum = total1b - total2;
                        q.text = `${w1b} ${f1}/${d1} \u2212 ${w2} ${f2}/${d2} = ?`;
                        q.ans = _fracStr(Math.max(0, diffNum), lcd);
                        q.hint = `LCD = ${lcd}. Convert fractions and subtract. Simplify.`;
                    } else {
                        const diffNum = total1 - total2;
                        const diffStr = _fracStr(diffNum, lcd);
                        q.text = `${w1} ${f1}/${d1} \u2212 ? = ${diffStr}. Find the missing number.`;
                        q.ans = _fracStr(total2, lcd);
                        q.hint = `${w1} ${f1}/${d1} \u2212 ${diffStr} = ? Convert to LCD ${lcd}: ${total1}/${lcd} \u2212 ${diffNum}/${lcd} = ${total2}/${lcd} = ${_fracStr(total2, lcd)}.`;
                    }
                }
                q.answerType = "text";
                q.printFormat = "frac-sub-mixed-unlike-nv";
                q.skillLabel = "Subtract Mixed (Unlike)";
                return;

            } else if (fracSkill === "identify_nv") {
                // Grade 3: Identify Fractions (no visual)
                const roll = Math.random();
                if (roll < 0.4) {
                    // Type 1: "What fraction is shaded? X out of Y parts"
                    const den = rng(2, 10);
                    const num = rng(1, den - 1);
                    q.text = `What fraction is shaded? ${num} out of ${den} parts are shaded.`;
                    q.ans = _fracStr(num, den);
                    q.hint = `The shaded parts are the numerator (${num}) and the total parts are the denominator (${den}). The fraction is ${num}/${den}.`;
                } else if (roll < 0.7) {
                    // Type 2: "Write the fraction: numerator X, denominator Y"
                    const den = rng(2, 12);
                    const num = rng(1, den - 1);
                    q.text = `Write the fraction: numerator ${num}, denominator ${den}.`;
                    q.ans = _fracStr(num, den);
                    q.hint = `The numerator goes on top and the denominator goes on the bottom: ${num}/${den}.`;
                } else {
                    // Type 3: Word problem context
                    const contexts = [
                        { item: "pizza", unit: "slices", den: rng(4, 10) },
                        { item: "pie", unit: "pieces", den: rng(4, 8) },
                        { item: "chocolate bar", unit: "squares", den: rng(4, 12) },
                        { item: "cake", unit: "slices", den: rng(4, 8) }
                    ];
                    const ctx = pick(contexts);
                    const num = rng(1, ctx.den - 1);
                    q.text = `A ${ctx.item} is cut into ${ctx.den} ${ctx.unit}. You eat ${num} ${ctx.unit}. What fraction did you eat?`;
                    q.ans = _fracStr(num, ctx.den);
                    q.hint = `You ate ${num} out of ${ctx.den} ${ctx.unit}, so the fraction is ${num}/${ctx.den}. Simplify if possible.`;
                }
                q.answerType = "text";
                q.printFormat = "identify-nv";
                q.skillLabel = "Identify Frac";
                return;

            } else if (fracSkill === "fraction_of_set_nv") {
                // Grade 3: Fraction of a Set (no visual)
                const roll = Math.random();
                if (roll < 0.4) {
                    // Type 1: "What is 1/d of N?"
                    const den = rng(2, 8);
                    const mult = rng(2, 6);
                    const total = den * mult;
                    q.text = `What is 1/${den} of ${total}?`;
                    q.ans = mult;
                    q.answerType = "number";
                    q.hint = `Divide ${total} by ${den}: ${total} \u00F7 ${den} = ${mult}.`;
                } else if (roll < 0.7) {
                    // Type 2: "What is n/d of N?"
                    const den = rng(2, 8);
                    const num = rng(2, den - 1);
                    const mult = rng(2, 5);
                    const total = den * mult;
                    const answer = num * mult;
                    q.text = `What is ${num}/${den} of ${total}?`;
                    q.ans = answer;
                    q.answerType = "number";
                    q.hint = `First find 1/${den} of ${total}: ${total} \u00F7 ${den} = ${mult}. Then multiply by ${num}: ${mult} \u00D7 ${num} = ${answer}.`;
                } else {
                    // Type 3: Word problem
                    const den = rng(2, 8);
                    const num = rng(1, den - 1);
                    const mult = rng(2, 5);
                    const total = den * mult;
                    const answer = num * mult;
                    const items = pick(["marbles", "stickers", "crayons", "cookies", "buttons", "beads"]);
                    const colors = pick(["blue", "red", "green", "yellow", "purple", "orange"]);
                    q.text = `There are ${total} ${items}. ${num}/${den} are ${colors}. How many are ${colors}?`;
                    q.ans = String(answer);
                    q.answerType = "text";
                    q.hint = `Find ${num}/${den} of ${total}: divide ${total} \u00F7 ${den} = ${mult}, then multiply ${mult} \u00D7 ${num} = ${answer}.`;
                }
                q.printFormat = "fraction-of-set-nv";
                q.skillLabel = "Frac of Set";
                return;

            } else if (fracSkill === "fraction_of_set_hard_nv") {
                // Grade 4: Fraction of a Set Hard (no visual)
                const roll = Math.random();
                if (roll < 0.4) {
                    // Type 1: "What is n/d of N?" with larger numbers
                    const den = rng(3, 12);
                    const num = rng(2, Math.min(5, den - 1));
                    const mult = rng(3, Math.floor(100 / den));
                    const total = den * mult;
                    const answer = num * mult;
                    q.text = `What is ${num}/${den} of ${total}?`;
                    q.ans = answer;
                    q.answerType = "number";
                    q.hint = `Divide ${total} by ${den}: ${total} \u00F7 ${den} = ${mult}. Multiply by ${num}: ${mult} \u00D7 ${num} = ${answer}.`;
                } else if (roll < 0.7) {
                    // Type 2: Find the set given the part
                    const den = rng(3, 10);
                    const num = rng(2, Math.min(5, den - 1));
                    const mult = rng(3, 8);
                    const part = num * mult;
                    const total = den * mult;
                    q.text = `${num}/${den} of a number is ${part}. What is the number?`;
                    q.ans = total;
                    q.answerType = "number";
                    q.hint = `If ${num}/${den} = ${part}, then 1/${den} = ${part} \u00F7 ${num} = ${mult}. The whole = ${mult} \u00D7 ${den} = ${total}.`;
                } else {
                    // Type 3: Word problem with larger numbers
                    const den = rng(3, 10);
                    const num = rng(2, Math.min(5, den - 1));
                    const mult = rng(4, Math.floor(100 / den));
                    const total = den * mult;
                    const answer = num * mult;
                    const contexts = [
                        `A school has ${total} students. ${num}/${den} ride the bus.`,
                        `A bag has ${total} jellybeans. ${num}/${den} are cherry.`,
                        `There are ${total} books on a shelf. ${num}/${den} are fiction.`,
                        `A farm has ${total} animals. ${num}/${den} are chickens.`
                    ];
                    q.text = `${pick(contexts)} How many?`;
                    q.ans = String(answer);
                    q.answerType = "text";
                    q.hint = `Find ${num}/${den} of ${total}: divide ${total} \u00F7 ${den} = ${mult}, then multiply ${mult} \u00D7 ${num} = ${answer}.`;
                }
                q.printFormat = "fraction-of-set-hard-nv";
                q.skillLabel = "Frac of Set";
                return;

            } else if (fracSkill === "mult_frac_whole_nv") {
                // Grade 4: Fraction x Whole Number (no visual)
                const den = rng(2, 8);
                const num = rng(1, den - 1);
                const whole = rng(2, 9);
                const prodNum = num * whole;
                const roll = Math.random();

                if (roll < 0.5) {
                    // Type 1: Straightforward multiply (randomize order)
                    if (Math.random() < 0.5) {
                        q.text = `${whole} \u00D7 ${num}/${den} = ?`;
                    } else {
                        q.text = `${num}/${den} \u00D7 ${whole} = ?`;
                    }
                    q.ans = _fracStr(prodNum, den);
                    q.hint = `Multiply the numerator by the whole: ${num} \u00D7 ${whole} = ${prodNum}. Keep the denominator: ${prodNum}/${den}. Simplify: ${_fracStr(prodNum, den)}.`;
                } else if (roll < 0.75) {
                    // Type 2: Missing whole number
                    q.text = `? \u00D7 ${num}/${den} = ${_fracStr(prodNum, den)}. Find the missing number.`;
                    q.ans = whole;
                    q.answerType = "number";
                    q.hint = `${_fracStr(prodNum, den)} \u00F7 ${num}/${den} = ? The numerator ${prodNum} \u00F7 ${num} = ${whole}.`;
                    q.printFormat = "mult-frac-whole-nv";
                    q.skillLabel = "Frac \u00D7 Whole";
                    return;
                } else {
                    // Type 3: Multiply and simplify (always produces improper)
                    const w2 = rng(3, 9);
                    const prodNum2 = num * w2;
                    q.text = `Multiply and simplify: ${w2} \u00D7 ${num}/${den}`;
                    q.ans = _fracStr(prodNum2, den);
                    q.hint = `${num} \u00D7 ${w2} = ${prodNum2}. So ${prodNum2}/${den}. Simplify: ${_fracStr(prodNum2, den)}.`;
                }
                q.answerType = "text";
                q.printFormat = "mult-frac-whole-nv";
                q.skillLabel = "Frac \u00D7 Whole";
                return;

            } else if (fracSkill === "decompose_frac_nv") {
                // Grade 4: Decompose to Unit Fractions (no visual)
                const den = rng(2, 8);
                const num = rng(2, den - 1);
                const roll = Math.random();

                if (roll < 0.4) {
                    // Type 1: Write as sum of unit fractions
                    const unitParts = [];
                    for (let i = 0; i < num; i++) unitParts.push(`1/${den}`);
                    const answer = unitParts.join(" + ");
                    q.text = `Write ${num}/${den} as a sum of unit fractions.`;
                    q.ans = answer;
                    q.hint = `A unit fraction has 1 as the numerator. ${num}/${den} = ${answer}.`;
                } else if (roll < 0.7) {
                    // Type 2: Write as sum of two fractions with same denominator
                    const a = rng(1, num - 1);
                    const b = num - a;
                    q.text = `Write ${num}/${den} as a sum of two different fractions with denominator ${den}.`;
                    q.ans = `${a}/${den} + ${b}/${den}`;
                    q.hint = `Find two numbers that add to ${num}: ${a} + ${b} = ${num}. So ${a}/${den} + ${b}/${den} = ${num}/${den}.`;
                } else {
                    // Type 3: How many unit fractions
                    q.text = `How many 1/${den}'s make up ${num}/${den}?`;
                    q.ans = num;
                    q.answerType = "number";
                    q.printFormat = "decompose-frac-nv";
                    q.skillLabel = "Decompose Frac";
                    return;
                }
                q.answerType = "text";
                q.printFormat = "decompose-frac-nv";
                q.skillLabel = "Decompose Frac";
                return;

            } else if (fracSkill === "frac_10_100_nv") {
                // Grade 4: Fractions with denominators 10 and 100 (no visual)
                const roll = Math.random();

                if (roll < 0.4) {
                    // Type 1: Convert /10 to /100
                    const num10 = rng(1, 9);
                    q.text = `Write ${num10}/10 as a fraction with denominator 100.`;
                    q.ans = `${num10 * 10}/100`;
                    q.hint = `Multiply both numerator and denominator by 10: ${num10}/10 = ${num10 * 10}/100.`;
                } else if (roll < 0.7) {
                    // Type 2: Missing numerator
                    const num10 = rng(1, 9);
                    q.text = `${num10}/10 = ?/100. Find the missing numerator.`;
                    q.ans = num10 * 10;
                    q.answerType = "number";
                    q.printFormat = "frac-10-100-nv";
                    q.skillLabel = "10ths & 100ths";
                    return;
                } else {
                    // Type 3: Add tenths and hundredths
                    const num10 = rng(1, 9);
                    const num100 = rng(1, 9);
                    const sum = num10 * 10 + num100;
                    q.text = `${num10}/10 + ${num100}/100 = ?/100`;
                    q.ans = `${sum}/100`;
                    q.hint = `Convert ${num10}/10 to ${num10 * 10}/100. Then add: ${num10 * 10}/100 + ${num100}/100 = ${sum}/100.`;
                }
                q.answerType = "text";
                q.printFormat = "frac-10-100-nv";
                q.skillLabel = "10ths & 100ths";
                return;

            } else if (fracSkill === "mult_frac_frac_nv") {
                // Grade 5: Fraction x Fraction (no visual)
                const d1 = pick([2, 3, 4, 5, 6]);
                const d2 = pick([2, 3, 4, 5, 6]);
                const n1 = rng(1, d1 - 1);
                const n2 = rng(1, d2 - 1);
                const prodN = n1 * n2;
                const prodD = d1 * d2;
                const roll = Math.random();

                if (roll < 0.5) {
                    // Type 1: Straightforward multiply
                    q.text = `${n1}/${d1} \u00D7 ${n2}/${d2} = ?`;
                    q.ans = _fracStr(prodN, prodD);
                    q.hint = `Multiply numerators: ${n1} \u00D7 ${n2} = ${prodN}. Multiply denominators: ${d1} \u00D7 ${d2} = ${prodD}. Simplify ${prodN}/${prodD}.`;
                } else if (roll < 0.75) {
                    // Type 2: Missing numerator
                    q.text = `${n1}/${d1} \u00D7 ?/${d2} = ${_fracStr(prodN, prodD)}. Find the missing numerator.`;
                    q.ans = n2;
                    q.answerType = "number";
                    q.printFormat = "mult-frac-frac-nv";
                    q.skillLabel = "Frac \u00D7 Frac";
                    return;
                } else {
                    // Type 3: Multiply and simplify
                    q.text = `Multiply and simplify: ${n1}/${d1} \u00D7 ${n2}/${d2}`;
                    q.ans = _fracStr(prodN, prodD);
                    q.hint = `${n1} \u00D7 ${n2} = ${prodN}, ${d1} \u00D7 ${d2} = ${prodD}. Simplify ${prodN}/${prodD} = ${_fracStr(prodN, prodD)}.`;
                }
                q.answerType = "text";
                q.printFormat = "mult-frac-frac-nv";
                q.skillLabel = "Frac \u00D7 Frac";
                return;

            } else if (fracSkill === "div_unit_frac_nv") {
                // Grade 5: Divide with Unit Fractions (no visual)
                const roll = Math.random();

                if (roll < 0.5) {
                    // Mode A: whole ÷ unit fraction
                    const den = rng(2, 6);
                    const whole = rng(2, 8);
                    const answer = whole * den;
                    if (Math.random() < 0.7) {
                        // Type 1: Straightforward
                        q.text = `${whole} \u00F7 1/${den} = ?`;
                        q.ans = answer;
                        q.hint = `Dividing by 1/${den} is the same as multiplying by ${den}: ${whole} \u00D7 ${den} = ${answer}.`;
                    } else {
                        // Type 3: Missing dividend
                        q.text = `? \u00F7 1/${den} = ${answer}. Find the missing number.`;
                        q.ans = whole;
                        q.hint = `If ? \u00F7 1/${den} = ${answer}, then ? = ${answer} \u00D7 1/${den} = ${answer}/${den} = ${whole}.`;
                    }
                    q.answerType = "number";
                } else {
                    // Mode B: unit fraction ÷ whole
                    const den = rng(2, 6);
                    const whole = rng(2, 6);
                    const ansDen = den * whole;
                    if (Math.random() < 0.7) {
                        // Type 1: Straightforward
                        q.text = `1/${den} \u00F7 ${whole} = ?`;
                        q.ans = `1/${ansDen}`;
                        q.hint = `Dividing by ${whole} is the same as multiplying by 1/${whole}: 1/${den} \u00D7 1/${whole} = 1/${ansDen}.`;
                    } else {
                        // Type 3: Missing divisor
                        q.text = `1/${den} \u00F7 ? = 1/${ansDen}. Find the missing number.`;
                        q.ans = whole;
                        q.hint = `1/${den} \u00F7 ? = 1/${ansDen}. Since ${den} \u00D7 ${whole} = ${ansDen}, the missing number is ${whole}.`;
                        q.answerType = "number";
                        q.printFormat = "div-unit-frac-nv";
                        q.skillLabel = "Div Unit Frac";
                        return;
                    }
                    q.answerType = "text";
                }
                q.printFormat = "div-unit-frac-nv";
                q.skillLabel = "Div Unit Frac";
                return;

            } else if (fracSkill === "frac_as_div_nv") {
                // Grade 5: Fraction as Division (no visual)
                const roll = Math.random();

                if (roll < 0.4) {
                    // Type 1: Express division as a fraction
                    const num = rng(1, 9);
                    const den = rng(2, 10);
                    q.text = `Express ${num} \u00F7 ${den} as a fraction.`;
                    q.ans = _fracStr(num, den);
                    q.hint = `${num} \u00F7 ${den} can be written as the fraction ${num}/${den}. Simplify if possible.`;
                } else if (roll < 0.7) {
                    // Type 2: Sharing word problem
                    const items = rng(2, 9);
                    const people = rng(2, 10);
                    // Avoid cases where it divides evenly (that's too easy)
                    const finalItems = items % people === 0 ? items + 1 : items;
                    const contexts = [
                        `Share ${finalItems} pizzas equally among ${people} people. How much does each person get?`,
                        `Divide ${finalItems} sandwiches equally among ${people} friends. How much does each get?`,
                        `Split ${finalItems} pies equally among ${people} families. How much does each family get?`
                    ];
                    q.text = pick(contexts);
                    q.ans = _fracStr(finalItems, people);
                    q.hint = `${finalItems} \u00F7 ${people} = ${finalItems}/${people} = ${_fracStr(finalItems, people)}.`;
                } else {
                    // Type 3: Fraction to mixed number
                    const den = rng(2, 6);
                    const whole = rng(1, 4);
                    const rem = rng(1, den - 1);
                    const num = whole * den + rem;
                    q.text = `If ${num}/${den} means ${num} \u00F7 ${den}, what is the result as a mixed number?`;
                    q.ans = `${whole} ${rem}/${den}`;
                    q.hint = `${num} \u00F7 ${den} = ${whole} remainder ${rem}. So ${num}/${den} = ${whole} ${rem}/${den}.`;
                }
                q.answerType = "text";
                q.printFormat = "frac-as-div-nv";
                q.skillLabel = "Frac as Div";
                return;

            } else if (fracSkill === "mult_scaling_nv" && Math.random() < 0.30) {
                const whole = pick([5, 6, 8, 10, 12]);
                const correctCount = randInt(2, 3);
                const totalCount = randInt(5, 6);
                const dPool = [2, 3, 4, 5, 6, 8];
                const correctSet = [];
                const wrongSet = [];
                const seen = new Set();
                let safety = 0;
                while (correctSet.length < correctCount && safety < 200) {
                    safety++;
                    const d = pick(dPool);
                    const n = rng(d + 1, d * 2 + 1);
                    const key = n + '/' + d;
                    if (seen.has(key)) continue;
                    if ((n * whole) / d > whole) {
                        seen.add(key);
                        correctSet.push({ n, d });
                    }
                }
                safety = 0;
                while (wrongSet.length < (totalCount - correctSet.length) && safety < 200) {
                    safety++;
                    const d = pick(dPool);
                    const n = rng(1, d - 1);
                    const key = n + '/' + d;
                    if (seen.has(key)) continue;
                    if ((n * whole) / d <= whole) {
                        seen.add(key);
                        wrongSet.push({ n, d });
                    }
                }
                const all = shuffle([...correctSet, ...wrongSet]);
                const options = all.map((f, i) => ({
                    id: 'opt' + i,
                    label: `${f.n}/${f.d} × ${whole}`,
                    correct: (f.n * whole) / f.d > whole
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL the results that are LARGER than ${whole}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Multiplying by a fraction greater than 1 makes the answer bigger; less than 1 makes it smaller.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Scaling';
                return;
            } else if (fracSkill === "mult_scaling_nv") {
                // Grade 5: Multiplication as Scaling (no visual)
                const roll = Math.random();

                if (roll < 0.4) {
                    // Type 1: Fraction < 1, compare to original
                    const den = rng(2, 6);
                    const num = rng(1, den - 1);
                    const n = rng(5, 20);
                    q.text = `Is ${num}/${den} \u00D7 ${n} greater than, less than, or equal to ${n}?`;
                    q.ans = `Less than ${n}`;
                    q.answerType = "multiple-choice";
                    q.options = [`Greater than ${n}`, `Less than ${n}`, `Equal to ${n}`];
                    q.hint = `Since ${num}/${den} is less than 1, multiplying ${n} by it gives a result less than ${n}.`;
                } else if (roll < 0.7) {
                    // Type 2: Fraction > 1, compare to original
                    const den = rng(2, 5);
                    const num = den + rng(1, 3);
                    const n = rng(5, 15);
                    q.text = `Without calculating, is ${num}/${den} \u00D7 ${n} greater than, less than, or equal to ${n}?`;
                    q.ans = `Greater than ${n}`;
                    q.answerType = "multiple-choice";
                    q.options = [`Greater than ${n}`, `Less than ${n}`, `Equal to ${n}`];
                    q.hint = `Since ${num}/${den} is greater than 1, multiplying ${n} by it gives a result greater than ${n}.`;
                } else {
                    // Type 3: Fill in comparison operator
                    const type = pick(["less", "greater", "equal"]);
                    let num, den, n;
                    if (type === "less") {
                        den = rng(2, 6);
                        num = rng(1, den - 1);
                        n = rng(5, 15);
                        q.text = `Fill in <, >, or =: ${num}/${den} \u00D7 ${n} ___ ${n}`;
                        q.ans = "<";
                        q.hint = `${num}/${den} < 1, so ${num}/${den} \u00D7 ${n} < ${n}.`;
                    } else if (type === "greater") {
                        den = rng(2, 5);
                        num = den + rng(1, 3);
                        n = rng(5, 15);
                        q.text = `Fill in <, >, or =: ${num}/${den} \u00D7 ${n} ___ ${n}`;
                        q.ans = ">";
                        q.hint = `${num}/${den} > 1, so ${num}/${den} \u00D7 ${n} > ${n}.`;
                    } else {
                        den = pick([2, 3, 4, 5, 6]);
                        num = den;
                        n = rng(5, 15);
                        q.text = `Fill in <, >, or =: ${num}/${den} \u00D7 ${n} ___ ${n}`;
                        q.ans = "=";
                        q.hint = `${num}/${den} = 1, so ${num}/${den} \u00D7 ${n} = ${n}.`;
                    }
                    q.answerType = "text";
                }
                q.printFormat = "mult-scaling-nv";
                q.skillLabel = "Scaling";
                return;

            } else if (fracSkill === "mult_frac_frac") {
                // Grade 5: Fraction x Fraction
                const d1 = pick([2, 3, 4, 5, 6]);
                const d2 = pick([2, 3, 4, 5, 6]);
                const n1 = rng(1, d1 - 1);
                const n2 = rng(1, d2 - 1);
                const prodN = n1 * n2;
                const prodD = d1 * d2;
                const answer = _fracStr(prodN, prodD);

                q.text = `Calculate: ${n1}/${d1} \u00D7 ${n2}/${d2} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Multiply numerators: ${n1} \u00D7 ${n2} = ${prodN}. Multiply denominators: ${d1} \u00D7 ${d2} = ${prodD}. Answer: ${prodN}/${prodD}. Simplify.`;

                // Area model: rectangle with horizontal and vertical divisions
                const rectW = 200;
                const rectH = 200;
                const colW = rectW / d2;
                const rowH = rectH / d1;
                let areaRects = '';
                // Draw grid
                for (let r = 0; r < d1; r++) {
                    for (let c = 0; c < d2; c++) {
                        const isHoriz = r < n1;
                        const isVert = c < n2;
                        let fill, opacity;
                        if (isHoriz && isVert) {
                            fill = 'var(--accent-green)'; opacity = '0.85';
                        } else if (isHoriz) {
                            fill = 'var(--accent-cyan)'; opacity = '0.35';
                        } else if (isVert) {
                            fill = 'var(--accent-purple)'; opacity = '0.35';
                        } else {
                            fill = 'var(--bg-card)'; opacity = '0.15';
                        }
                        areaRects += `<rect x="${c * colW}" y="${r * rowH}" width="${colW}" height="${rowH}" fill="${fill}" stroke="var(--text-bright)" stroke-width="1" opacity="${opacity}"/>`;
                    }
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Multiply Fractions (Area Model)</div>
                    <div style="font-size:1.2rem;margin-bottom:14px;">
                        ${fracHTML(n1, d1, 'xl')} <span style="margin:0 8px;">\u00D7</span> ${fracHTML(n2, d2, 'xl')} <span style="margin:0 8px;">=</span> <span style="color:var(--accent-green);font-weight:700;">?</span>
                    </div>
                    <svg width="${rectW + 4}" height="${rectH + 4}" viewBox="-2 -2 ${rectW + 4} ${rectH + 4}" style="display:block;margin:0 auto;">
                        ${areaRects}
                        <rect x="0" y="0" width="${rectW}" height="${rectH}" fill="none" stroke="var(--text-bright)" stroke-width="2"/>
                    </svg>
                    <div style="margin-top:10px;display:flex;justify-content:center;gap:16px;font-size:0.85rem;">
                        <span><span style="display:inline-block;width:14px;height:14px;background:var(--accent-cyan);opacity:0.5;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>${n1}/${d1}</span>
                        <span><span style="display:inline-block;width:14px;height:14px;background:var(--accent-purple);opacity:0.5;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>${n2}/${d2}</span>
                        <span><span style="display:inline-block;width:14px;height:14px;background:var(--accent-green);opacity:0.85;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>overlap = ${prodN}/${prodD}</span>
                    </div>
                </div>`;
                return;

            } else if (fracSkill === "div_unit_fraction") {
                // Grade 5: Divide with unit fractions
                const mode = Math.random() < 0.5 ? "whole_div_frac" : "frac_div_whole";
                let questionText, answer, hintText, visualHTML;

                if (mode === "whole_div_frac") {
                    // whole / (1/d) = whole * d
                    const d = pick([2, 3, 4, 5, 6, 8]);
                    const whole = rng(1, 5);
                    const ans = whole * d;
                    questionText = `${whole} \u00F7 1/${d} = ?`;
                    answer = String(ans);
                    hintText = `How many 1/${d}'s fit into ${whole}? Each whole has ${d} pieces of 1/${d}, so ${whole} \u00D7 ${d} = ${ans}.`;

                    const stripW = 220;
                    const stripH = 28;
                    const segW = stripW / d;
                    let strips = '';
                    for (let w = 0; w < whole; w++) {
                        let segs = '';
                        for (let i = 0; i < d; i++) {
                            segs += `<rect x="${i * segW}" y="0" width="${segW}" height="${stripH}" fill="var(--accent-cyan)" stroke="var(--text-bright)" stroke-width="1" opacity="0.8"/>`;
                            segs += `<text x="${i * segW + segW / 2}" y="${stripH / 2 + 4}" text-anchor="middle" fill="var(--text-bright)" font-size="10">1/${d}</text>`;
                        }
                        strips += `<div style="margin:2px 0;"><svg width="${stripW}" height="${stripH}" viewBox="0 0 ${stripW} ${stripH}">${segs}</svg><span style="font-size:0.75rem;margin-left:6px;">= 1</span></div>`;
                    }
                    visualHTML = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Divide by Unit Fraction</div>
                        <div style="font-size:1.3rem;margin-bottom:14px;">${whole} \u00F7 ${fracHTML(1, d, 'xl')} = <span style="color:var(--accent-green);font-weight:700;">?</span></div>
                        <div style="font-size:0.9rem;margin-bottom:8px;color:var(--text-bright);">How many 1/${d}'s in ${whole}?</div>
                        ${strips}
                        <div style="margin-top:8px;font-size:0.85rem;color:var(--accent-green);">Count all pieces: ${whole} \u00D7 ${d} = ?</div>
                    </div>`;
                } else {
                    // (1/d) / whole = 1/(d*whole)
                    const d = pick([2, 3, 4, 5, 6]);
                    const whole = rng(2, 5);
                    const ansD = d * whole;
                    questionText = `1/${d} \u00F7 ${whole} = ?`;
                    answer = `1/${ansD}`;
                    hintText = `Split 1/${d} into ${whole} equal parts. Each part is 1/(${d} \u00D7 ${whole}) = 1/${ansD}.`;

                    const stripW = 240;
                    const stripH = 40;
                    const mainSegW = stripW;
                    const subSegW = stripW / whole;
                    visualHTML = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Divide Unit Fraction by Whole</div>
                        <div style="font-size:1.3rem;margin-bottom:14px;">${fracHTML(1, d, 'xl')} \u00F7 <span style="font-size:1.5rem;font-weight:700;">${whole}</span> = <span style="color:var(--accent-green);font-weight:700;">?</span></div>
                        <div style="font-size:0.9rem;margin-bottom:8px;color:var(--text-bright);">Split 1/${d} into ${whole} equal parts:</div>
                        <svg width="${stripW + 4}" height="${stripH + 4}" viewBox="-2 -2 ${stripW + 4} ${stripH + 4}" style="display:block;margin:0 auto;">
                            <rect x="0" y="0" width="${mainSegW}" height="${stripH}" fill="var(--accent-cyan)" stroke="var(--text-bright)" stroke-width="2" opacity="0.4"/>
                            ${Array.from({length: whole}, (_, i) => `<rect x="${i * subSegW}" y="0" width="${subSegW}" height="${stripH}" fill="${i === 0 ? 'var(--accent-green)' : 'var(--accent-cyan)'}" stroke="var(--text-bright)" stroke-width="1.5" opacity="${i === 0 ? '0.85' : '0.3'}"/><text x="${i * subSegW + subSegW / 2}" y="${stripH / 2 + 5}" text-anchor="middle" fill="var(--text-bright)" font-size="11">1/${ansD}</text>`).join('')}
                        </svg>
                        <div style="margin-top:8px;font-size:0.85rem;color:var(--accent-green);">Each piece = 1/${ansD}</div>
                    </div>`;
                }

                q.text = questionText;
                q.ans = answer;
                q.answerType = "text";
                q.hint = hintText;
                q.visual = visualHTML;
                return;

            } else if (fracSkill === "frac_as_division") {
                // Grade 5: a/b means a / b
                const b = pick([2, 3, 4, 5, 6, 8]);
                const a = rng(1, Math.min(b + 2, 8));
                const answer = _fracStr(a, b);

                const scenarios = [
                    `Share ${a} pizza${a > 1 ? 's' : ''} equally among ${b} friends. How much does each person get?`,
                    `Divide ${a} cookie${a > 1 ? 's' : ''} equally among ${b} children. How much does each child get?`,
                    `${a} candy bar${a > 1 ? 's are' : ' is'} shared equally by ${b} people. How much does each person get?`,
                    `Split ${a} sandwich${a > 1 ? 'es' : ''} equally among ${b} students. How much does each student get?`
                ];
                const scenario = pick(scenarios);

                q.text = scenario;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `${a} \u00F7 ${b} = ${a}/${b}${a >= b ? ` = ${answer}` : ''}. Sharing ${a} items among ${b} people means each gets ${a}/${b}.`;

                // Pizzas divided among stick figures
                const circleR = 25;
                const circleGap = 8;
                const figureW = 20;
                const totalPizzaW = a * (circleR * 2 + circleGap);
                const totalFigW = b * (figureW + 10);
                const svgW = Math.max(totalPizzaW, totalFigW) + 20;

                let pizzas = '';
                for (let i = 0; i < a; i++) {
                    const cx = 10 + i * (circleR * 2 + circleGap) + circleR;
                    pizzas += `<circle cx="${cx}" cy="${circleR + 5}" r="${circleR}" fill="var(--accent-orange)" stroke="var(--text-bright)" stroke-width="2" opacity="0.7"/>`;
                    // Slice lines
                    for (let s = 0; s < b; s++) {
                        const angle = (s * 2 * Math.PI) / b - Math.PI / 2;
                        const x2 = cx + circleR * Math.cos(angle);
                        const y2 = (circleR + 5) + circleR * Math.sin(angle);
                        pizzas += `<line x1="${cx}" y1="${circleR + 5}" x2="${x2}" y2="${y2}" stroke="var(--text-bright)" stroke-width="1"/>`;
                    }
                }

                let figures = '';
                for (let i = 0; i < b; i++) {
                    const fx = 10 + i * (figureW + 10) + figureW / 2;
                    const fy = circleR * 2 + 30;
                    figures += `<circle cx="${fx}" cy="${fy}" r="6" fill="var(--accent-cyan)" stroke="var(--text-bright)" stroke-width="1.5"/>`;
                    figures += `<line x1="${fx}" y1="${fy + 6}" x2="${fx}" y2="${fy + 20}" stroke="var(--text-bright)" stroke-width="1.5"/>`;
                    figures += `<line x1="${fx - 6}" y1="${fy + 12}" x2="${fx + 6}" y2="${fy + 12}" stroke="var(--text-bright)" stroke-width="1.5"/>`;
                    figures += `<line x1="${fx}" y1="${fy + 20}" x2="${fx - 5}" y2="${fy + 28}" stroke="var(--text-bright)" stroke-width="1.5"/>`;
                    figures += `<line x1="${fx}" y1="${fy + 20}" x2="${fx + 5}" y2="${fy + 28}" stroke="var(--text-bright)" stroke-width="1.5"/>`;
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Fractions as Division</div>
                    <div style="font-size:1rem;margin-bottom:14px;max-width:320px;margin-left:auto;margin-right:auto;line-height:1.5;">${scenario}</div>
                    <svg width="${svgW}" height="${circleR * 2 + 70}" viewBox="0 0 ${svgW} ${circleR * 2 + 70}" style="display:block;margin:0 auto;max-width:100%;">
                        ${pizzas}
                        ${figures}
                    </svg>
                    <div style="margin-top:8px;font-size:0.9rem;color:var(--accent-green);">${a} \u00F7 ${b} = ?</div>
                </div>`;
                return;

            } else if (fracSkill === "mult_scaling" && Math.random() < 0.30) {
                const whole = pick([5, 6, 8, 10, 12]);
                const correctCount = randInt(2, 3);
                const totalCount = randInt(5, 6);
                const dPool = [2, 3, 4, 5, 6, 8];
                const correctSet = [];
                const wrongSet = [];
                const seen = new Set();
                let safety = 0;
                while (correctSet.length < correctCount && safety < 200) {
                    safety++;
                    const d = pick(dPool);
                    const n = rng(d + 1, d * 2 + 1);
                    const key = n + '/' + d;
                    if (seen.has(key)) continue;
                    if ((n * whole) / d > whole) {
                        seen.add(key);
                        correctSet.push({ n, d });
                    }
                }
                safety = 0;
                while (wrongSet.length < (totalCount - correctSet.length) && safety < 200) {
                    safety++;
                    const d = pick(dPool);
                    const n = rng(1, d - 1);
                    const key = n + '/' + d;
                    if (seen.has(key)) continue;
                    if ((n * whole) / d <= whole) {
                        seen.add(key);
                        wrongSet.push({ n, d });
                    }
                }
                const all = shuffle([...correctSet, ...wrongSet]);
                const options = all.map((f, i) => ({
                    id: 'opt' + i,
                    label: `${f.n}/${f.d} × ${whole}`,
                    correct: (f.n * whole) / f.d > whole
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL the results that are LARGER than ${whole}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `When you multiply by a fraction greater than 1, the result is larger than the original number.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Scaling';
                return;
            } else if (fracSkill === "mult_scaling") {
                // Grade 5: Multiplication as scaling
                const d = pick([2, 3, 4, 5, 6, 8]);
                const n = rng(1, d * 2);
                const whole = rng(2, 10);
                const fracVal = n / d;
                let correctAnswer, explanation;

                if (fracVal > 1) {
                    correctAnswer = `Greater than ${whole}`;
                    explanation = `${n}/${d} > 1, so multiplying by it makes the number bigger.`;
                } else if (fracVal < 1) {
                    correctAnswer = `Less than ${whole}`;
                    explanation = `${n}/${d} < 1, so multiplying by it makes the number smaller.`;
                } else {
                    correctAnswer = `Equal to ${whole}`;
                    explanation = `${n}/${d} = 1, so multiplying by it keeps the number the same.`;
                }

                q.text = `Is ${n}/${d} \u00D7 ${whole} greater than, less than, or equal to ${whole}?`;
                q.ans = correctAnswer;
                q.answerType = "multiple-choice";
                q.options = [`Greater than ${whole}`, `Less than ${whole}`, `Equal to ${whole}`];
                q.hint = explanation;

                // Visual: number line showing scaling
                const lineW = 260;
                const lineY = 50;
                const product = (n * whole) / d;
                const maxVal = Math.max(whole, product) * 1.2;
                const wholeX = 20 + (whole / maxVal) * (lineW - 40);
                const prodX = 20 + (product / maxVal) * (lineW - 40);

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Multiplication as Scaling</div>
                    <div style="font-size:1.2rem;margin-bottom:14px;">
                        ${fracHTML(n, d, 'xl')} <span style="margin:0 6px;">\u00D7</span> <span style="font-size:1.5rem;font-weight:700;">${whole}</span>
                        <span style="margin:0 8px;">is</span>
                        <span style="color:var(--accent-green);font-weight:700;">?</span>
                    </div>
                    <svg width="${lineW}" height="90" viewBox="0 0 ${lineW} 90" style="display:block;margin:0 auto;">
                        <line x1="20" y1="${lineY}" x2="${lineW - 20}" y2="${lineY}" stroke="var(--text-bright)" stroke-width="2"/>
                        <line x1="20" y1="${lineY - 5}" x2="20" y2="${lineY + 5}" stroke="var(--text-bright)" stroke-width="2"/>
                        <text x="20" y="${lineY + 18}" text-anchor="middle" fill="var(--text-bright)" font-size="11">0</text>
                        <!-- original number -->
                        <circle cx="${wholeX}" cy="${lineY}" r="5" fill="var(--accent-cyan)"/>
                        <text x="${wholeX}" y="${lineY - 10}" text-anchor="middle" fill="var(--accent-cyan)" font-size="12" font-weight="bold">${whole}</text>
                        <!-- scaled result hint area -->
                        <text x="${lineW / 2}" y="20" text-anchor="middle" fill="var(--text-bright)" font-size="11">${n}/${d} ${fracVal > 1 ? '> 1' : fracVal < 1 ? '< 1' : '= 1'}</text>
                    </svg>
                    <div style="margin-top:6px;font-size:0.85rem;color:var(--text-bright);">If the fraction is less than 1, the product is <em>smaller</em>. If greater than 1, the product is <em>bigger</em>.</div>
                </div>`;
                return;

            } else if (fracSkill === "frac_mult_word") {
                // Grade 5: Fraction multiplication/division word problems
                const scenarios = [
                    () => {
                        const d = pick([2, 3, 4]);
                        const n = rng(1, d - 1);
                        const batches = rng(2, 4);
                        const prodN = n * batches;
                        return {
                            text: `A recipe needs ${n}/${d} cup of flour. You want to make ${batches} batches. How much flour do you need?`,
                            ans: _fracStr(prodN, d),
                            hint: `${n}/${d} \u00D7 ${batches} = ${prodN}/${d}. Simplify: ${_fracStr(prodN, d)}.`,
                            n, d, batches
                        };
                    },
                    () => {
                        const d = pick([3, 4, 5, 6]);
                        const n = rng(1, d - 1);
                        const total = rng(2, 6);
                        const prodN = n * total;
                        return {
                            text: `Each serving uses ${n}/${d} of a liter of juice. How much juice is needed for ${total} servings?`,
                            ans: _fracStr(prodN, d),
                            hint: `${n}/${d} \u00D7 ${total} = ${prodN}/${d} = ${_fracStr(prodN, d)}.`,
                            n, d, batches: total
                        };
                    },
                    () => {
                        const d1 = pick([2, 3, 4]);
                        const n1 = rng(1, d1 - 1);
                        const d2 = pick([2, 3, 4, 5]);
                        const n2 = rng(1, d2 - 1);
                        const pN = n1 * n2;
                        const pD = d1 * d2;
                        return {
                            text: `A garden is ${n1}/${d1} of a yard long and ${n2}/${d2} of a yard wide. What is its area?`,
                            ans: _fracStr(pN, pD),
                            hint: `Area = ${n1}/${d1} \u00D7 ${n2}/${d2} = ${pN}/${pD} = ${_fracStr(pN, pD)} square yards.`,
                            n: n1, d: d1, batches: 1, n2, d2
                        };
                    },
                    () => {
                        const d = pick([2, 3, 4, 5, 6]);
                        const whole = rng(2, 5);
                        const ans = whole * d;
                        return {
                            text: `You have ${whole} meters of ribbon. You cut it into pieces that are each 1/${d} of a meter long. How many pieces do you get?`,
                            ans: String(ans),
                            hint: `${whole} \u00F7 1/${d} = ${whole} \u00D7 ${d} = ${ans} pieces.`,
                            n: 1, d, batches: whole
                        };
                    }
                ];
                const s = pick(scenarios)();

                q.text = s.text;
                q.ans = s.ans;
                q.answerType = "text";
                q.hint = s.hint;

                const barW = 240;
                const barH = 26;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Fraction Word Problem</div>
                    <div style="font-size:1rem;margin-bottom:14px;max-width:340px;margin-left:auto;margin-right:auto;line-height:1.5;">${s.text}</div>
                    <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">
                        ${Array.from({length: Math.min(s.batches, 6)}, () => _svgBar(s.n, s.d, 70, barH, 'var(--accent-cyan)', 'var(--bg-card)')).join('')}
                    </div>
                    <div style="margin-top:10px;font-size:0.85rem;color:var(--accent-green);">= ?</div>
                </div>`;
                return;

            } else if (fracSkill === "fraction_number_line") {
                // Grade 3: Fractions on a number line — 5 problem types
                // Reusable SVG number line builder
                function _buildFractionNumberLine(opts) {
                    const {
                        maxWhole = 1, den, arrowAt = null, shadedTo = null,
                        dotAt = null, clickable = false, tickLabels = false,
                        lineId = 'fnl', highlightTick = null, lineIndex = null
                    } = opts;
                    const W = 440, H = 110, lineY = 55, leftX = 30, rightX = W - 30;
                    const span = rightX - leftX;
                    const totalParts = maxWhole * den;
                    let svg = '';

                    // Shaded segment (blue rect from 0)
                    if (shadedTo !== null) {
                        const sX = leftX + (shadedTo / totalParts) * span;
                        svg += `<rect x="${leftX}" y="${lineY - 6}" width="${sX - leftX}" height="12" fill="var(--accent-cyan)" opacity="0.45" rx="2"/>`;
                    }

                    // Main line
                    svg += `<line x1="${leftX}" y1="${lineY}" x2="${rightX}" y2="${lineY}" stroke="var(--text-bright)" stroke-width="2.5"/>`;
                    // Arrow tips on both ends
                    svg += `<polygon points="${leftX - 6},${lineY} ${leftX + 2},${lineY - 4} ${leftX + 2},${lineY + 4}" fill="var(--text-bright)"/>`;
                    svg += `<polygon points="${rightX + 6},${lineY} ${rightX - 2},${lineY - 4} ${rightX - 2},${lineY + 4}" fill="var(--text-bright)"/>`;

                    // Ticks and labels
                    for (let i = 0; i <= totalParts; i++) {
                        const x = leftX + (i / totalParts) * span;
                        const isWhole = i % den === 0;
                        const tickH = isWhole ? 14 : 8;
                        const sw = isWhole ? 2.5 : 1.5;
                        svg += `<line x1="${x}" y1="${lineY - tickH}" x2="${x}" y2="${lineY + tickH}" stroke="var(--text-bright)" stroke-width="${sw}"/>`;

                        // Whole number labels
                        if (isWhole) {
                            svg += `<text x="${x}" y="${lineY + 30}" text-anchor="middle" fill="var(--text-bright)" font-size="14" font-weight="bold">${i / den}</text>`;
                        }
                        // Fraction labels on minor ticks
                        if (tickLabels && !isWhole) {
                            const [sn, sd] = _simplify(i, den);
                            if (maxWhole > 1 && i > den) {
                                // Show as improper fraction for lines > 1
                                svg += `<text x="${x}" y="${lineY + 28}" text-anchor="middle" fill="var(--text-dim, var(--text-bright))" font-size="9">${i}/${den}</text>`;
                            } else {
                                svg += `<text x="${x}" y="${lineY + 28}" text-anchor="middle" fill="var(--text-dim, var(--text-bright))" font-size="9">${sn}/${sd}</text>`;
                            }
                        }

                        // Clickable hit areas for Type C
                        if (clickable) {
                            const prefix = lineIndex !== null ? `${lineId}_${lineIndex}` : lineId;
                            const hlClass = (highlightTick === i) ? ' fnl-tick-selected' : '';
                            svg += `<rect x="${x - 12}" y="${lineY - 22}" width="24" height="44" fill="transparent" class="fnl-tick-target${hlClass}" data-tick="${i}" onclick="selectNumberLineTick('${prefix}', ${i}, ${totalParts})" style="cursor:pointer;"/>`;
                        }
                    }

                    // Green down-arrow with "?"
                    if (arrowAt !== null) {
                        const ax = leftX + (arrowAt / totalParts) * span;
                        svg += `<polygon points="${ax - 7},12 ${ax + 7},12 ${ax},${lineY - 16}" fill="var(--accent-green)"/>`;
                        svg += `<text x="${ax}" y="10" text-anchor="middle" fill="var(--accent-green)" font-size="12" font-weight="bold">?</text>`;
                    }

                    // Green dot at specific position
                    if (dotAt !== null) {
                        const dx = leftX + (dotAt / totalParts) * span;
                        svg += `<circle cx="${dx}" cy="${lineY}" r="7" fill="var(--accent-green)" stroke="#fff" stroke-width="2"/>`;
                    }

                    return `<svg viewBox="0 0 ${W} ${H}" style="display:block;margin:0 auto;max-width:100%;width:100%;" id="${lineId}_svg">${svg}</svg>`;
                }

                // Weighted random type selection
                const typeRoll = Math.random();
                let problemType;
                if (typeRoll < 0.25) problemType = 'A';       // Identify Point (25%)
                else if (typeRoll < 0.45) problemType = 'B';   // Which Line Shows (20%)
                else if (typeRoll < 0.65) problemType = 'C';   // Place Fraction (20%)
                else if (typeRoll < 0.80) problemType = 'D';   // Identify Shaded (15%)
                else problemType = 'E';                        // Fractions > 1 (20%)

                const denChoices = [2, 3, 4, 5, 6, 8];

                if (problemType === 'A') {
                    // Type A: Identify the fraction at the green arrow
                    const den = pick(denChoices);
                    const num = rng(1, den - 1);
                    q.text = `What fraction is shown at the arrow on the number line?`;
                    q.ans = simplifyFraction(num, den);
                    q.answerType = "text";
                    q.hint = `The number line from 0 to 1 is divided into ${den} equal parts. Count how many parts from 0 to the arrow.`;
                    q.printFormat = 'fraction-number-line';

                    const lineSVG = _buildFractionNumberLine({ den, arrowAt: num });
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Fractions on a Number Line</div>
                        ${lineSVG}
                        <div style="margin-top:6px;font-size:0.85rem;color:var(--text-bright);">The line is divided into <strong>${den}</strong> equal parts.</div>
                    </div>`;

                } else if (problemType === 'B') {
                    // Type B: Which number line shows the given fraction?
                    // Need at least 3 distinct positions → den >= 4
                    const den = pick([4, 5, 6, 8]);
                    const correctNum = rng(1, den - 1);
                    const correctPos = correctNum; // position in parts
                    const labels = ['A', 'B', 'C'];
                    const correctIndex = rng(0, 2);

                    // Generate 2 wrong positions (different from correct and each other)
                    const wrongPositions = [];
                    while (wrongPositions.length < 2) {
                        const w = rng(1, den - 1);
                        if (w !== correctPos && !wrongPositions.includes(w)) wrongPositions.push(w);
                    }

                    let linesHTML = '';
                    let wrongIdx = 0;
                    for (let li = 0; li < 3; li++) {
                        const shadedPos = li === correctIndex ? correctPos : wrongPositions[wrongIdx++];
                        const lineSVG = _buildFractionNumberLine({ den, shadedTo: shadedPos, lineIndex: li });
                        linesHTML += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                            <span style="font-weight:800;font-size:1.1rem;color:var(--accent-cyan);min-width:20px;">${labels[li]}</span>
                            <div style="flex:1;">${lineSVG}</div>
                        </div>`;
                    }

                    const [sn, sd] = _simplify(correctNum, den);
                    q.text = `Which number line shows ${sn}/${sd} shaded?`;
                    q.ans = labels[correctIndex];
                    q.answerType = "multiple-choice";
                    q.options = shuffle(['A', 'B', 'C']);
                    q.hint = `${sn}/${sd} means ${correctNum} out of ${den} parts shaded from 0.`;
                    q.printFormat = 'fraction-number-line';

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Which Number Line Shows the Fraction?</div>
                        ${linesHTML}
                    </div>`;

                } else if (problemType === 'C') {
                    // Type C: Place the fraction on the number line (interactive click)
                    const den = pick(denChoices);
                    const num = rng(1, den - 1);
                    const [sn, sd] = _simplify(num, den);
                    q.text = `Place ${sn}/${sd} on the number line by clicking the correct tick mark.`;
                    q.ans = num; // tick index
                    q.answerType = "number-line-place";
                    q.hint = `${sn}/${sd} means ${num} out of ${den} parts from 0. Count ${num} tick marks from the left.`;
                    q.printFormat = 'fraction-number-line';
                    q.nlpDen = den;
                    q.nlpCorrectTick = num;

                    const lineSVG = _buildFractionNumberLine({ den, clickable: true, lineId: 'fnlC' });
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Place the Fraction</div>
                        <div style="margin-bottom:8px;font-size:1rem;">Click the tick mark where <strong style="color:var(--accent-green);">${sn}/${sd}</strong> belongs.</div>
                        ${lineSVG}
                        <div style="margin-top:10px;">
                            <button class="btn btn-primary" id="checkPlacementBtn" onclick="checkNumberLinePlacement()" style="opacity:0.5;pointer-events:none;">Check Placement</button>
                        </div>
                    </div>`;

                } else if (problemType === 'D') {
                    // Type D: Identify the shaded portion
                    const den = pick(denChoices);
                    const num = rng(1, den - 1);
                    q.text = `What fraction of the number line is shaded?`;
                    q.ans = simplifyFraction(num, den);
                    q.answerType = "text";
                    q.hint = `Count how many parts are shaded (blue) out of ${den} total parts.`;
                    q.printFormat = 'fraction-number-line';

                    const lineSVG = _buildFractionNumberLine({ den, shadedTo: num });
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Fractions on a Number Line</div>
                        ${lineSVG}
                        <div style="margin-top:6px;font-size:0.85rem;color:var(--text-bright);">The line is divided into <strong>${den}</strong> equal parts. What fraction is shaded?</div>
                    </div>`;

                } else {
                    // Type E: Fractions greater than 1 (improper fractions / mixed numbers)
                    const den = pick([2, 3, 4, 5, 6]);
                    const maxW = den <= 3 ? 3 : 2;
                    const totalParts = maxW * den;
                    // Pick a position > den (greater than 1) and not on a whole number
                    let num;
                    do {
                        num = rng(den + 1, totalParts - 1);
                    } while (num % den === 0);

                    const wholeP = Math.floor(num / den);
                    const remP = num % den;
                    const [sRemN, sRemD] = _simplify(remP, den);
                    // Accept both improper and mixed number forms
                    q.text = `What fraction or mixed number is at the arrow?`;
                    q.ans = simplifyFraction(num, den); // e.g. "5/4" or "7/3"
                    q.answerType = "text";
                    q.hint = `The number line goes from 0 to ${maxW} and is divided into ${den} equal parts per whole. Count ${num} parts from 0. Answer as improper (${num}/${den}) or mixed (${wholeP} ${sRemN}/${sRemD}).`;
                    q.printFormat = 'fraction-number-line';

                    const lineSVG = _buildFractionNumberLine({ maxWhole: maxW, den, arrowAt: num });
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Fractions Greater Than 1</div>
                        ${lineSVG}
                        <div style="margin-top:6px;font-size:0.85rem;color:var(--text-bright);">Each whole is divided into <strong>${den}</strong> equal parts. Answer as a fraction or mixed number.</div>
                    </div>`;
                }
                return;

            } else if (fracSkill === "whole_as_fraction") {
                // Grade 3: Express whole number as fraction
                const mode = Math.random() < 0.5 ? "whole_over_1" : "one_as_fraction";
                let questionText, answer, hintText, visualHTML;

                if (mode === "whole_over_1") {
                    const whole = rng(1, 10);
                    questionText = `Write ${whole} as a fraction with denominator 1.`;
                    answer = `${whole}/1`;
                    hintText = `Any whole number can be written as that number over 1. ${whole} = ${whole}/1.`;

                    const barW = 240;
                    const barH = 30;
                    let bars = '';
                    for (let i = 0; i < Math.min(whole, 6); i++) {
                        bars += _svgBar(1, 1, 40, barH, 'var(--accent-cyan)', 'var(--bg-card)');
                    }
                    if (whole > 6) bars += `<span style="font-size:1.2rem;align-self:center;">...</span>`;

                    visualHTML = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Whole Numbers as Fractions</div>
                        <div style="font-size:1.5rem;margin-bottom:14px;">
                            <span style="font-weight:700;color:var(--accent-orange);">${whole}</span>
                            <span style="margin:0 10px;font-size:1.3rem;">=</span>
                            ${fracHTML('?', '1', 'xl')}
                        </div>
                        <div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:8px;">${bars}</div>
                        <div style="font-size:0.85rem;color:var(--text-bright);">${whole} whole${whole > 1 ? 's' : ''} = ${whole}/1</div>
                    </div>`;
                } else {
                    const den = pick([2, 3, 4, 5, 6, 8]);
                    questionText = `Write 1 as a fraction with denominator ${den}.`;
                    answer = `${den}/${den}`;
                    hintText = `1 whole = ${den}/${den}. When numerator equals denominator, the fraction equals 1.`;

                    const barW = 200;
                    const barH = 36;
                    visualHTML = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Whole Numbers as Fractions</div>
                        <div style="font-size:1.5rem;margin-bottom:14px;">
                            <span style="font-weight:700;color:var(--accent-orange);">1</span>
                            <span style="margin:0 10px;font-size:1.3rem;">=</span>
                            ${fracHTML('?', den, 'xl')}
                        </div>
                        ${_svgBar(den, den, barW, barH, 'var(--accent-cyan)', 'var(--bg-card)')}
                        <div style="margin-top:8px;font-size:0.85rem;color:var(--text-bright);">All ${den} parts are filled = 1 whole</div>
                        ${fracCircleSVG(den, den, 80, 'var(--accent-green)')}
                    </div>`;
                }

                q.text = questionText;
                q.ans = answer;
                q.answerType = "text";
                q.hint = hintText;
                q.visual = visualHTML;
                return;

            // ==================== END NEW FRACTION SKILLS ====================

            } else if (fracSkill === "fraction_of_set" || fracSkill === "fraction_of_set_hard") {
                // Fraction of a Set: e.g. "What is 1/3 of 12?" - scale multiplier with range
                const fosDenoms = [2, 3, 4, 5, 6];
                const fosDen = pick(fosDenoms);
                const fosNum = fracSkill === "fraction_of_set_hard" ? rng(2, Math.min(3, fosDen - 1)) : 1;
                const fosMultMax = Math.max(3, Math.min(Math.floor(range / fosDen), 12));
                const fosMultiplier = rng(2, fosMultMax);
                const fosTotal = fosDen * fosMultiplier;
                const fosAnswer = fosNum * fosMultiplier;

                q.text = `What is ${fosNum}/${fosDen} of ${fosTotal}?`;
                q.ans = fosAnswer;
                q.answerType = "number";
                q.options = buildNumericOptions(fosAnswer);
                q.hint = fosNum === 1
                    ? `Divide ${fosTotal} into ${fosDen} equal groups. Each group has ${fosTotal} \u00F7 ${fosDen} = ${fosMultiplier} objects.`
                    : `Divide ${fosTotal} into ${fosDen} equal groups (${fosMultiplier} each), then take ${fosNum} groups: ${fosNum} \u00D7 ${fosMultiplier} = ${fosAnswer}.`;

                const fosCols = Math.min(fosTotal, 10);
                const fosRows = Math.ceil(fosTotal / fosCols);
                const fosCircleSize = 28;
                const fosGap = 4;
                const fosSvgW = fosCols * (fosCircleSize + fosGap) + fosGap;
                const fosSvgH = fosRows * (fosCircleSize + fosGap) + fosGap;
                let fosCircles = '';
                for (let fi = 0; fi < fosTotal; fi++) {
                    const fcol = fi % fosCols;
                    const frow = Math.floor(fi / fosCols);
                    const fcx = fosGap + fcol * (fosCircleSize + fosGap) + fosCircleSize / 2;
                    const fcy = fosGap + frow * (fosCircleSize + fosGap) + fosCircleSize / 2;
                    const fgroupIdx = Math.floor(fi / fosMultiplier);
                    const fhighlighted = fgroupIdx < fosNum;
                    fosCircles += `<circle cx="${fcx}" cy="${fcy}" r="${fosCircleSize / 2 - 1}" fill="${fhighlighted ? 'var(--accent-cyan)' : 'var(--bg-card)'}" stroke="${fhighlighted ? 'var(--accent-green)' : 'var(--text-bright)'}" stroke-width="2" opacity="${fhighlighted ? 1 : 0.5}"/>`;
                }
                let fosGroupLines = '';
                for (let fg = 1; fg < fosDen; fg++) {
                    const fitemIdx = fg * fosMultiplier;
                    if (fitemIdx < fosTotal) {
                        const fcol2 = fitemIdx % fosCols;
                        const frow2 = Math.floor(fitemIdx / fosCols);
                        if (fcol2 === 0 && frow2 > 0) {
                            const fly = fosGap + frow2 * (fosCircleSize + fosGap) - fosGap / 2;
                            fosGroupLines += `<line x1="0" y1="${fly}" x2="${fosSvgW}" y2="${fly}" stroke="var(--accent-orange)" stroke-width="2" stroke-dasharray="5,3"/>`;
                        }
                    }
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Fraction of a Set</div>
                    <div style="font-size:1.3rem;margin-bottom:12px;font-weight:600;">
                        What is <span style="color:var(--accent-cyan);font-weight:700;">${fosNum}/${fosDen}</span> of <span style="color:var(--accent-orange);font-weight:700;">${fosTotal}</span>?
                    </div>
                    <svg width="${fosSvgW}" height="${fosSvgH}" viewBox="0 0 ${fosSvgW} ${fosSvgH}" style="max-width:100%;">
                        ${fosGroupLines}
                        ${fosCircles}
                    </svg>
                    <div style="margin-top:10px;font-size:0.9rem;color:var(--text-bright);">
                        ${fosTotal} objects total
                    </div>
                </div>`;
                q.printFormat = 'fraction-of-set';
                q.skillLabel = 'Frac of Set';
            } else if (fracSkill === "equiv_frac_visual") {
                // Equivalent Fractions Visual — 4 problem types
                const efvBaseDens = [2, 3, 4, 5, 6];
                const efvBaseDen = pick(efvBaseDens);
                const efvBaseNum = rng(1, efvBaseDen - 1);
                const efvMultiplier = pick([2, 3, 4]);
                const efvEquivNum = efvBaseNum * efvMultiplier;
                const efvEquivDen = efvBaseDen * efvMultiplier;
                const efvColorA = '#d4e5f7';
                const efvColorB = '#f5d4e8';

                const efvRoll = Math.random();
                if (efvRoll < 0.30) {
                    // Type 1: Both circles shaded, write equivalent fraction
                    q.text = `Look at the two fraction models. Write each fraction and tell if they are equivalent.`;
                    q.ans = `${efvEquivNum}/${efvEquivDen}`;
                    q.answerType = "text";
                    q.hint = `The first circle shows ${efvBaseNum}/${efvBaseDen}. Count the shaded parts in the second circle. Multiply numerator and denominator by ${efvMultiplier}.`;
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Equivalent Fractions</div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:25px;flex-wrap:wrap;">
                            <div style="text-align:center;">
                                ${fracCircleSVG(efvBaseNum, efvBaseDen, 60, efvColorA)}
                                <div style="margin-top:8px;font-weight:600;">${fracHTML(efvBaseNum, efvBaseDen)}</div>
                            </div>
                            <span style="font-size:2rem;font-weight:700;color:var(--accent-green);">=</span>
                            <div style="text-align:center;">
                                ${fracCircleSVG(efvEquivNum, efvEquivDen, 60, efvColorB)}
                                <div style="margin-top:8px;font-weight:600;">?</div>
                            </div>
                        </div>
                    </div>`;
                    q.fractionData = { num1: efvBaseNum, den1: efvBaseDen, num2: efvEquivNum, den2: efvEquivDen, isEquivalent: true, missingPart: null, printType: pick(['both_shaded', 'shade_second', 'fill_numbers']) };
                } else if (efvRoll < 0.55) {
                    // Type 2: One circle shaded, identify the equivalent fraction
                    q.text = `The first model shows ${efvBaseNum}/${efvBaseDen}. What equivalent fraction does the second model show?`;
                    q.ans = `${efvEquivNum}/${efvEquivDen}`;
                    q.answerType = "text";
                    q.hint = `The second circle has ${efvEquivDen} equal parts with ${efvEquivNum} shaded. Multiply top and bottom of ${efvBaseNum}/${efvBaseDen} by ${efvMultiplier}.`;
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Equivalent Fractions</div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:25px;flex-wrap:wrap;">
                            <div style="text-align:center;">
                                ${fracCircleSVG(efvBaseNum, efvBaseDen, 60, efvColorA)}
                                <div style="margin-top:8px;font-weight:600;">${fracHTML(efvBaseNum, efvBaseDen)}</div>
                            </div>
                            <span style="font-size:2rem;font-weight:700;color:var(--accent-green);">=</span>
                            <div style="text-align:center;">
                                ${fracCircleSVG(efvEquivNum, efvEquivDen, 60, efvColorB)}
                                <div style="margin-top:8px;font-weight:600;font-size:1.2rem;">?/?</div>
                            </div>
                        </div>
                    </div>`;
                    q.fractionData = { num1: efvBaseNum, den1: efvBaseDen, num2: efvEquivNum, den2: efvEquivDen, isEquivalent: true, missingPart: null, printType: pick(['shade_second', 'fill_numbers', 'both_shaded']) };
                } else if (efvRoll < 0.80) {
                    // Type 3: Both circles shown, compare with = or ≠
                    const efvIsEquiv = Math.random() < 0.5;
                    let efvCmpNum2, efvCmpDen2;
                    if (efvIsEquiv) {
                        efvCmpNum2 = efvEquivNum;
                        efvCmpDen2 = efvEquivDen;
                    } else {
                        // Generate a meaningful non-equivalent fraction distractor
                        efvCmpDen2 = efvEquivDen;
                        const distractorStrategies = [
                            // Strategy: add to both num and den (common student error)
                            () => ({ n: efvBaseNum + efvMultiplier, d: efvBaseDen + efvMultiplier }),
                            // Strategy: flip numerator and denominator of base
                            () => ({ n: efvBaseDen * efvMultiplier, d: efvBaseNum * efvMultiplier }),
                            // Strategy: multiply only numerator (forget denominator)
                            () => ({ n: efvEquivNum, d: efvBaseDen }),
                            // Strategy: multiply only denominator (forget numerator)
                            () => ({ n: efvBaseNum, d: efvEquivDen }),
                            // Strategy: use a different multiplier
                            () => {
                                const altMult = efvMultiplier === 2 ? 3 : 2;
                                return { n: efvBaseNum * altMult, d: efvBaseDen * efvMultiplier };
                            }
                        ];
                        const strategy = pick(distractorStrategies);
                        const distractor = strategy();
                        efvCmpNum2 = Math.max(1, Math.min(efvCmpDen2 - 1, distractor.n));
                        efvCmpDen2 = Math.max(2, distractor.d);
                        // Ensure it's actually non-equivalent
                        if (efvCmpNum2 / efvCmpDen2 === efvBaseNum / efvBaseDen) {
                            efvCmpNum2 = Math.max(1, Math.min(efvCmpDen2 - 1, efvCmpNum2 + 1));
                        }
                    }
                    q.text = `Are these fractions equivalent? Answer = or \u2260`;
                    q.ans = efvIsEquiv ? "=" : "\u2260";
                    q.answerType = "text";
                    q.options = ["=", "\u2260"];
                    q.hint = efvIsEquiv
                        ? `Both fractions equal ${(efvBaseNum / efvBaseDen).toFixed(2)} so they are equivalent.`
                        : `${efvBaseNum}/${efvBaseDen} = ${(efvBaseNum / efvBaseDen).toFixed(2)} but ${efvCmpNum2}/${efvCmpDen2} = ${(efvCmpNum2 / efvCmpDen2).toFixed(2)}, so they are NOT equivalent.`;
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Are These Equivalent?</div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:25px;flex-wrap:wrap;">
                            <div style="text-align:center;">
                                ${fracCircleSVG(efvBaseNum, efvBaseDen, 60, efvColorA)}
                                <div style="margin-top:8px;font-weight:600;">${fracHTML(efvBaseNum, efvBaseDen)}</div>
                            </div>
                            <span style="font-size:2rem;font-weight:700;color:var(--text-dim);">?</span>
                            <div style="text-align:center;">
                                ${fracCircleSVG(efvCmpNum2, efvCmpDen2, 60, efvColorB)}
                                <div style="margin-top:8px;font-weight:600;">${fracHTML(efvCmpNum2, efvCmpDen2)}</div>
                            </div>
                        </div>
                    </div>`;
                    q.fractionData = { num1: efvBaseNum, den1: efvBaseDen, num2: efvCmpNum2, den2: efvCmpDen2, isEquivalent: efvIsEquiv, missingPart: null, printType: pick(['compare', 'shade_both_compare']) };
                } else {
                    // Type 4: Find missing numerator or denominator
                    const efvMissNum = Math.random() < 0.5; // true = missing numerator
                    if (efvMissNum) {
                        q.text = `Find the missing number: ${efvBaseNum}/${efvBaseDen} = ?/${efvEquivDen}`;
                        q.ans = efvEquivNum;
                        q.hint = `Multiply the numerator by ${efvMultiplier}: ${efvBaseNum} \u00D7 ${efvMultiplier} = ${efvEquivNum}.`;
                    } else {
                        q.text = `Find the missing number: ${efvBaseNum}/${efvBaseDen} = ${efvEquivNum}/?`;
                        q.ans = efvEquivDen;
                        q.hint = `Multiply the denominator by ${efvMultiplier}: ${efvBaseDen} \u00D7 ${efvMultiplier} = ${efvEquivDen}.`;
                    }
                    q.answerType = "number";
                    const efvMissLabel = efvMissNum
                        ? `<span class="frac frac-2xl"><span class="num" style="background:rgba(76,175,80,0.2);border-radius:6px;padding:4px 12px;border:2px dashed var(--accent-green);">?</span><span class="den">${efvEquivDen}</span></span>`
                        : `<span class="frac frac-2xl"><span class="num">${efvEquivNum}</span><span class="den" style="background:rgba(76,175,80,0.2);border-radius:6px;padding:4px 12px;border:2px dashed var(--accent-green);">?</span></span>`;
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Find the Missing Number</div>
                        <div class="frac-equation" style="margin-bottom:20px;">
                            ${fracHTML(efvBaseNum, efvBaseDen, '2xl')}
                            <span class="frac-equals">=</span>
                            ${efvMissLabel}
                        </div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:25px;">
                            ${fracCircleSVG(efvBaseNum, efvBaseDen, 60, efvColorA)}
                            <span style="font-size:2rem;color:var(--accent-green);">=</span>
                            ${fracCircleSVG(efvEquivNum, efvEquivDen, 60, efvColorB)}
                        </div>
                        <div style="margin-top:12px;font-size:0.9rem;color:var(--text-dim);">
                            Multiply top and bottom by <strong>${efvMultiplier}</strong>
                        </div>
                    </div>`;
                    q.fractionData = { num1: efvBaseNum, den1: efvBaseDen, num2: efvEquivNum, den2: efvEquivDen, isEquivalent: true, missingPart: efvMissNum ? "num2" : "den2", printType: 'missing_number' };
                }
                q.printFormat = 'equiv-frac-visual';
                q.skillLabel = 'Equiv Frac (Visual)';

            } else if (fracSkill === "equiv_frac_nv" && Math.random() < 0.30) {
                const baseDen = pick([2, 3, 4, 5, 6]);
                const baseNum = rng(1, baseDen - 1);
                const baseVal = baseNum / baseDen;
                const correctCount = randInt(2, 3);
                const wrongCount = randInt(3, 5);
                const correctSet = [];
                const seen = new Set();
                seen.add(baseNum + '/' + baseDen);
                let safety = 0;
                while (correctSet.length < correctCount && safety < 50) {
                    safety++;
                    const m = pick([2, 3, 4, 5]);
                    const key = (baseNum * m) + '/' + (baseDen * m);
                    if (!seen.has(key)) {
                        seen.add(key);
                        correctSet.push({ n: baseNum * m, d: baseDen * m });
                    }
                }
                const wrongSet = [];
                safety = 0;
                while (wrongSet.length < wrongCount && safety < 200) {
                    safety++;
                    const d = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
                    const n = rng(1, d - 1);
                    const v = n / d;
                    const key = n + '/' + d;
                    if (!seen.has(key) && Math.abs(v - baseVal) > 1e-9) {
                        seen.add(key);
                        wrongSet.push({ n, d });
                    }
                }
                const all = shuffle([...correctSet, ...wrongSet]);
                const options = all.map((f, i) => ({
                    id: 'opt' + i,
                    label: f.n + '/' + f.d,
                    correct: Math.abs(f.n / f.d - baseVal) < 1e-9
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL the fractions equivalent to ${baseNum}/${baseDen}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Equivalent fractions reduce to the same value. Multiply or divide top and bottom by the same number.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Equiv Frac (NV)';
                return;
            } else if (fracSkill === "equiv_frac_nv") {
                // Equivalent Fractions Non-Visual — 3 problem types
                const efnvBaseDens = [2, 3, 4, 5, 6];
                const efnvBaseDen = pick(efnvBaseDens);
                const efnvBaseNum = rng(1, efnvBaseDen - 1);
                const efnvMultiplier = pick([2, 3, 4]);
                const efnvEquivNum = efnvBaseNum * efnvMultiplier;
                const efnvEquivDen = efnvBaseDen * efnvMultiplier;

                const efnvRoll = Math.random();
                if (efnvRoll < 0.40) {
                    // Type 1: Are these equivalent? yes/no
                    const efnvIsEquiv = Math.random() < 0.5;
                    let efnvNum2 = efnvEquivNum;
                    let efnvDen2 = efnvEquivDen;
                    if (!efnvIsEquiv) {
                        // Generate meaningful non-equivalent distractor
                        const nvStrategies = [
                            // Add to both num and den (common student error)
                            () => ({ n: efnvBaseNum + efnvMultiplier, d: efnvBaseDen + efnvMultiplier }),
                            // Multiply only numerator (forget denominator)
                            () => ({ n: efnvEquivNum, d: efnvBaseDen }),
                            // Multiply only denominator (forget numerator)
                            () => ({ n: efnvBaseNum, d: efnvEquivDen }),
                            // Use different multiplier for numerator
                            () => {
                                const altMult = efnvMultiplier === 2 ? 3 : 2;
                                return { n: efnvBaseNum * altMult, d: efnvEquivDen };
                            }
                        ];
                        const strategy = pick(nvStrategies);
                        const distractor = strategy();
                        efnvNum2 = Math.max(1, Math.min(distractor.d - 1, distractor.n));
                        efnvDen2 = Math.max(2, distractor.d);
                        if (efnvNum2 / efnvDen2 === efnvBaseNum / efnvBaseDen) {
                            efnvNum2 = Math.max(1, Math.min(efnvDen2 - 1, efnvNum2 + 1));
                        }
                    }
                    q.text = `Are ${efnvBaseNum}/${efnvBaseDen} and ${efnvNum2}/${efnvDen2} equivalent fractions? (yes or no)`;
                    q.ans = efnvIsEquiv ? "yes" : "no";
                    q.answerType = "text";
                    q.hint = efnvIsEquiv
                        ? `Multiply ${efnvBaseNum}/${efnvBaseDen} by ${efnvMultiplier}/${efnvMultiplier} to get ${efnvEquivNum}/${efnvEquivDen}. They are equal!`
                        : `Cross multiply: ${efnvBaseNum} \u00D7 ${efnvDen2} = ${efnvBaseNum * efnvDen2} but ${efnvNum2} \u00D7 ${efnvBaseDen} = ${efnvNum2 * efnvBaseDen}. They are NOT equal.`;
                    q.fractionData = { num1: efnvBaseNum, den1: efnvBaseDen, num2: efnvNum2, den2: efnvDen2, isEquivalent: efnvIsEquiv, missingPart: null };
                } else if (efnvRoll < 0.75) {
                    // Type 2: Find missing numerator
                    q.text = `Find the missing number: ${efnvBaseNum}/${efnvBaseDen} = ?/${efnvEquivDen}`;
                    q.ans = efnvEquivNum;
                    q.answerType = "number";
                    q.hint = `The denominator was multiplied by ${efnvMultiplier} (${efnvBaseDen} \u00D7 ${efnvMultiplier} = ${efnvEquivDen}), so multiply the numerator by ${efnvMultiplier} too: ${efnvBaseNum} \u00D7 ${efnvMultiplier} = ${efnvEquivNum}.`;
                    q.fractionData = { num1: efnvBaseNum, den1: efnvBaseDen, num2: efnvEquivNum, den2: efnvEquivDen, isEquivalent: true, missingPart: "num2" };
                } else {
                    // Type 3: Find missing denominator
                    q.text = `Find the missing number: ${efnvBaseNum}/${efnvBaseDen} = ${efnvEquivNum}/?`;
                    q.ans = efnvEquivDen;
                    q.answerType = "number";
                    q.hint = `The numerator was multiplied by ${efnvMultiplier} (${efnvBaseNum} \u00D7 ${efnvMultiplier} = ${efnvEquivNum}), so multiply the denominator by ${efnvMultiplier} too: ${efnvBaseDen} \u00D7 ${efnvMultiplier} = ${efnvEquivDen}.`;
                    q.fractionData = { num1: efnvBaseNum, den1: efnvBaseDen, num2: efnvEquivNum, den2: efnvEquivDen, isEquivalent: true, missingPart: "den2" };
                }
                q.printFormat = 'equiv-frac-nv';
                q.skillLabel = 'Equiv Frac (NV)';

            } else if (fracSkill === "order_fractions" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-order modernization of legacy "interactive ordering"
                const count = pick([4, 5]);
                const denPool = [2, 3, 4, 5, 6, 8, 10, 12];
                const fracs = [];
                const usedValues = new Set();
                let attempts = 0;
                while (fracs.length < count && attempts < 100) {
                    attempts++;
                    const d = pick(denPool);
                    const n = rng(1, d - 1);
                    const val = n / d;
                    const valKey = val.toFixed(6);
                    if (!usedValues.has(valKey)) {
                        usedValues.add(valKey);
                        fracs.push({ n, d, val, str: _fracStr(n, d) });
                    }
                }
                const direction = pick(["asc", "desc"]);
                const sorted = [...fracs].sort((a, b) => direction === "asc" ? a.val - b.val : b.val - a.val);
                const presentation = shuffle(fracs.map((f, i) => ({ id: 't' + i, label: f.str, val: f.val })));
                const ans = sorted.map(f => presentation.find(t => Math.abs(t.val - f.val) < 1e-9).id);
                q.text = `Drag the fractions from ${direction === "asc" ? "least to greatest" : "greatest to least"}.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                q.tiles = presentation.map(({ id, label }) => ({ id, label }));
                q.orderLabel = direction === "asc" ? "least to greatest" : "greatest to least";
                q.hint = `Convert to a common denominator or compare to benchmarks like 1/2.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Order Fractions';
                return;
            } else if (fracSkill === "order_fractions") {
                // Grade 4: Interactive click-to-order 4-5 fractions least-to-greatest or greatest-to-least
                const count = pick([4, 5]);
                const denPool = [2, 3, 4, 5, 6, 8, 10, 12];
                const fracs = [];
                const usedValues = new Set();
                let attempts = 0;
                while (fracs.length < count && attempts < 100) {
                    attempts++;
                    const d = pick(denPool);
                    const n = rng(1, d - 1);
                    const val = n / d;
                    const valKey = val.toFixed(6);
                    if (!usedValues.has(valKey)) {
                        usedValues.add(valKey);
                        fracs.push({ n, d, val, str: _fracStr(n, d) });
                    }
                }
                const direction = pick(["asc", "desc"]);
                const sorted = [...fracs].sort((a, b) => direction === "asc" ? a.val - b.val : b.val - a.val);
                const orderItems = fracs.map(f => f.str);
                const correctOrder = sorted.map(f => f.str);

                q.text = `Order these fractions from ${direction === "asc" ? "least to greatest" : "greatest to least"}:`;
                q.ans = correctOrder.join(",");
                q.answerType = "interactive";
                q.interactiveType = "ordering";
                q.orderMode = "click";
                q.orderDirection = direction;
                q.orderIcon = direction === "asc" ? "Least \u2192 Greatest" : "Greatest \u2192 Least";
                q.numbers = orderItems;
                q.sortedNumbers = correctOrder;
                q.hint = `Convert to a common denominator or compare to benchmarks like 1/2.`;
                q.options = [];
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Order Fractions</div>
                    <div style="font-size:0.9rem;margin-bottom:10px;">${direction === "asc" ? "Least \u2192 Greatest" : "Greatest \u2192 Least"}</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:15px;margin:15px 0;">
                        ${fracs.map(f => `<div style="text-align:center;">
                            ${fracCircleSVG(f.n, f.d, 50, 'var(--accent-cyan)', 'var(--bg-card-light)')}
                            <div style="margin-top:4px;font-size:1rem;font-weight:600;">${fracHTML(f.n, f.d, 'md')}</div>
                        </div>`).join('')}
                    </div>
                </div>`;
                q.printFormat = "fraction-order";
                q.skillLabel = "Order Fractions";
                return;

            } else if (fracSkill === "order_frac_numline") {
                // Grade 4: SVG number line with lettered dots, identify position as MC
                const denChoices = [2, 3, 4, 5, 6, 8];
                const den = pick(denChoices);
                const pointCount = pick([4, 5]);
                const positions = [];
                const usedPos = new Set();
                let posAttempts = 0;
                while (positions.length < pointCount && posAttempts < 100) {
                    posAttempts++;
                    const n = rng(1, den - 1);
                    if (!usedPos.has(n)) {
                        usedPos.add(n);
                        positions.push(n);
                    }
                }
                // If not enough unique positions, fall back
                while (positions.length < pointCount) {
                    const n = rng(1, den * 2 - 1);
                    if (!usedPos.has(n)) {
                        usedPos.add(n);
                        positions.push(n);
                    }
                }
                const labels = ["A", "B", "C", "D", "E"].slice(0, pointCount);
                const targetIdx = rng(0, pointCount - 1);
                const targetPos = positions[targetIdx];
                const [sn, sd] = _simplify(targetPos, den);
                const correctLetter = labels[targetIdx];

                // Build SVG number line
                const W = 440, H = 110, lineY = 55, leftX = 30, rightX = W - 30;
                const span = rightX - leftX;
                const totalParts = den;
                const colors = ['var(--accent-cyan)', 'var(--accent-purple)', 'var(--accent-orange)', 'var(--accent-green)', '#e74c3c'];
                let nlSvg = '';
                nlSvg += `<line x1="${leftX}" y1="${lineY}" x2="${rightX}" y2="${lineY}" stroke="var(--text-bright)" stroke-width="2.5"/>`;
                // Ticks
                for (let i = 0; i <= totalParts; i++) {
                    const x = leftX + (i / totalParts) * span;
                    const isWhole = i === 0 || i === totalParts;
                    const tickH = isWhole ? 14 : 8;
                    nlSvg += `<line x1="${x}" y1="${lineY - tickH}" x2="${x}" y2="${lineY + tickH}" stroke="var(--text-bright)" stroke-width="${isWhole ? 2.5 : 1.5}"/>`;
                    if (isWhole) {
                        nlSvg += `<text x="${x}" y="${lineY + 30}" text-anchor="middle" fill="var(--text-bright)" font-size="14" font-weight="bold">${i / totalParts}</text>`;
                    }
                }
                // Lettered dots
                for (let i = 0; i < pointCount; i++) {
                    const x = leftX + (positions[i] / totalParts) * span;
                    nlSvg += `<circle cx="${x}" cy="${lineY}" r="8" fill="${colors[i % colors.length]}" stroke="#fff" stroke-width="2"/>`;
                    nlSvg += `<text x="${x}" y="${lineY - 16}" text-anchor="middle" fill="${colors[i % colors.length]}" font-size="13" font-weight="bold">${labels[i]}</text>`;
                }

                q.text = `Which letter shows ${sn}/${sd} on the number line?`;
                q.ans = correctLetter;
                q.answerType = "multiple-choice";
                q.options = shuffle([...labels]);
                q.hint = `Find the fraction's position between the tick marks. The line is divided into ${den} equal parts.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Fractions on Number Line</div>
                    <svg viewBox="0 0 ${W} ${H}" style="display:block;margin:0 auto;max-width:100%;width:100%;">${nlSvg}</svg>
                </div>`;
                q.printFormat = "fraction-numline-order";
                q.skillLabel = "Fractions on Number Line";
                return;

            } else if (fracSkill === "benchmark_fractions" && Math.random() < 0.30) {
                const targetBenchmarks = [
                    { val: 0, label: '0' },
                    { val: 0.5, label: '1/2' },
                    { val: 1, label: '1' }
                ];
                const target = pick(targetBenchmarks);
                const denPool = [3, 4, 5, 6, 8, 10, 12];
                const correctCount = randInt(2, 3);
                const totalCount = randInt(6, 8);
                const correctSet = [];
                const wrongSet = [];
                const seen = new Set();
                let safety = 0;
                while (correctSet.length < correctCount && safety < 200) {
                    safety++;
                    const d = pick(denPool);
                    const n = rng(1, d - 1);
                    const v = n / d;
                    const key = n + '/' + d;
                    if (seen.has(key)) continue;
                    let closest = targetBenchmarks[0];
                    let bestDist = Math.abs(v - closest.val);
                    for (const b of targetBenchmarks) {
                        const d2 = Math.abs(v - b.val);
                        if (d2 < bestDist) { bestDist = d2; closest = b; }
                    }
                    if (closest.label === target.label) {
                        seen.add(key);
                        correctSet.push({ n, d });
                    }
                }
                safety = 0;
                while (wrongSet.length < (totalCount - correctSet.length) && safety < 200) {
                    safety++;
                    const d = pick(denPool);
                    const n = rng(1, d - 1);
                    const v = n / d;
                    const key = n + '/' + d;
                    if (seen.has(key)) continue;
                    let closest = targetBenchmarks[0];
                    let bestDist = Math.abs(v - closest.val);
                    for (const b of targetBenchmarks) {
                        const d2 = Math.abs(v - b.val);
                        if (d2 < bestDist) { bestDist = d2; closest = b; }
                    }
                    if (closest.label !== target.label) {
                        seen.add(key);
                        wrongSet.push({ n, d });
                    }
                }
                const all = shuffle([...correctSet, ...wrongSet]);
                const options = all.map((f, i) => {
                    const v = f.n / f.d;
                    let closest = targetBenchmarks[0];
                    let bestDist = Math.abs(v - closest.val);
                    for (const b of targetBenchmarks) {
                        const d2 = Math.abs(v - b.val);
                        if (d2 < bestDist) { bestDist = d2; closest = b; }
                    }
                    return { id: 'opt' + i, label: f.n + '/' + f.d, correct: closest.label === target.label };
                });
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL the fractions closest to ${target.label}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `A fraction is closest to ${target.label} if its value is nearer to ${target.label} than to any other benchmark.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Benchmark Fractions';
                return;
            } else if (fracSkill === "benchmark_fractions") {
                // Grade 4: Compare fractions to benchmarks (0, 1/4, 1/2, 3/4, 1)
                const benchmarks = [0, 0.25, 0.5, 0.75, 1];
                const benchmarkLabels = ["0", "1/4", "1/2", "3/4", "1"];
                const denPool = [3, 4, 5, 6, 8, 10, 12];
                const den = pick(denPool);
                const num = rng(1, den - 1);
                const val = num / den;
                // Find closest benchmark
                let closestIdx = 0;
                let closestDist = Math.abs(val - benchmarks[0]);
                for (let i = 1; i < benchmarks.length; i++) {
                    const dist = Math.abs(val - benchmarks[i]);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestIdx = i;
                    }
                }
                const correctBenchmark = benchmarkLabels[closestIdx];

                // Build visual: number line from 0 to 1 with benchmarks
                const W = 440, H = 100, lineY = 50, leftX = 30, rightX = W - 30;
                const bmSpan = rightX - leftX;
                let bmSvg = '';
                bmSvg += `<line x1="${leftX}" y1="${lineY}" x2="${rightX}" y2="${lineY}" stroke="var(--text-bright)" stroke-width="2.5"/>`;
                // Benchmark ticks and labels
                for (let i = 0; i < benchmarks.length; i++) {
                    const x = leftX + benchmarks[i] * bmSpan;
                    bmSvg += `<line x1="${x}" y1="${lineY - 12}" x2="${x}" y2="${lineY + 12}" stroke="var(--text-bright)" stroke-width="2"/>`;
                    bmSvg += `<text x="${x}" y="${lineY + 28}" text-anchor="middle" fill="var(--text-bright)" font-size="11" font-weight="bold">${benchmarkLabels[i]}</text>`;
                }
                // Fraction dot
                const fracX = leftX + val * bmSpan;
                bmSvg += `<circle cx="${fracX}" cy="${lineY}" r="7" fill="var(--accent-green)" stroke="#fff" stroke-width="2"/>`;
                bmSvg += `<text x="${fracX}" y="${lineY - 16}" text-anchor="middle" fill="var(--accent-green)" font-size="12" font-weight="bold">${num}/${den}</text>`;

                q.text = `Is ${num}/${den} closest to 0, 1/4, 1/2, 3/4, or 1?`;
                q.ans = correctBenchmark;
                q.answerType = "multiple-choice";
                q.options = shuffle([...benchmarkLabels]);
                q.hint = `Compare the fraction to each benchmark to find the closest. ${num}/${den} = ${val.toFixed(3)} as a decimal.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Benchmark Fractions</div>
                    <svg viewBox="0 0 ${W} ${H}" style="display:block;margin:0 auto;max-width:100%;width:100%;">${bmSvg}</svg>
                </div>`;
                q.printFormat = "fraction-benchmark";
                q.skillLabel = "Benchmark Fractions";
                return;

            } else if (fracSkill === "compare_frac_lcd") {
                // Grade 4: Find LCD, convert fractions, compare with >, <, =
                const denPool = [2, 3, 4, 5, 6, 8, 10, 12];
                const d1 = pick(denPool);
                let d2 = pick(denPool);
                while (d2 === d1) d2 = pick(denPool);
                const n1 = rng(1, d1 - 1);
                const n2 = rng(1, d2 - 1);
                const lcd = _lcm(d1, d2);
                const equiv1 = n1 * (lcd / d1);
                const equiv2 = n2 * (lcd / d2);
                let correctSymbol;
                if (equiv1 > equiv2) correctSymbol = ">";
                else if (equiv1 < equiv2) correctSymbol = "<";
                else correctSymbol = "=";

                q.text = `Compare: ${n1}/${d1} ___ ${n2}/${d2}  (Use >, <, or =)`;
                q.ans = correctSymbol;
                q.answerType = "multiple-choice";
                q.options = [">", "<", "="];
                q.hint = `Find the LCD of ${d1} and ${d2}, which is ${lcd}. Convert: ${n1}/${d1} = ${equiv1}/${lcd} and ${n2}/${d2} = ${equiv2}/${lcd}. Then compare numerators.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Compare Fractions (LCD)</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:15px;">
                        ${fracHTML(n1, d1, 'xl')}
                        <span style="font-size:2rem;color:var(--accent-orange);font-weight:700;">?</span>
                        ${fracHTML(n2, d2, 'xl')}
                    </div>
                    <div style="background:var(--bg-card);padding:12px 20px;border-radius:10px;display:inline-block;">
                        <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:6px;">LCD = <span style="display:inline-block;min-width:40px;border-bottom:2px solid var(--text-dim);">&nbsp;</span></div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                            ${fracHTML('?', '?', 'lg')}
                            <span style="font-size:1.5rem;color:var(--accent-orange);font-weight:700;">?</span>
                            ${fracHTML('?', '?', 'lg')}
                        </div>
                    </div>
                </div>`;
                q.printFormat = "fraction-compare-lcd";
                q.skillLabel = "Compare (LCD)";
                return;

            } else if (fracSkill === "graph_fractions") {
                // Grade 3: Place fractions on a number line (click/tap)
                const denChoices = [2, 3, 4, 6, 8];
                const den = pick(denChoices);
                const num = rng(1, den - 1);
                const [sn, sd] = _simplify(num, den);

                q.text = `Place ${sn}/${sd} on the number line by clicking the correct tick mark.`;
                q.ans = num; // tick index
                q.answerType = "number-line-place";
                q.hint = `Count the equal parts between 0 and 1. The line has ${den} parts. ${sn}/${sd} is at position ${num}.`;
                q.printFormat = "fraction-numberline";
                q.skillLabel = "Graph Fractions";
                q.nlpDen = den;
                q.nlpCorrectTick = num;

                // Build inline number line SVG with clickable ticks
                const gfW = 440, gfH = 110, gfLineY = 55, gfLeftX = 30, gfRightX = gfW - 30;
                const gfSpan = gfRightX - gfLeftX;
                let gfSvg = '';
                gfSvg += `<line x1="${gfLeftX}" y1="${gfLineY}" x2="${gfRightX}" y2="${gfLineY}" stroke="var(--text-bright)" stroke-width="2.5"/>`;
                for (let i = 0; i <= den; i++) {
                    const x = gfLeftX + (i / den) * gfSpan;
                    const isWhole = i === 0 || i === den;
                    const tickH = isWhole ? 14 : 8;
                    gfSvg += `<line x1="${x}" y1="${gfLineY - tickH}" x2="${x}" y2="${gfLineY + tickH}" stroke="var(--text-bright)" stroke-width="${isWhole ? 2.5 : 1.5}"/>`;
                    if (isWhole) {
                        gfSvg += `<text x="${x}" y="${gfLineY + 30}" text-anchor="middle" fill="var(--text-bright)" font-size="14" font-weight="bold">${i === 0 ? 0 : 1}</text>`;
                    }
                    // Clickable hit areas
                    gfSvg += `<rect x="${x - 12}" y="${gfLineY - 22}" width="24" height="44" fill="transparent" class="fnl-tick-target" data-tick="${i}" onclick="selectNumberLineTick('gf', ${i}, ${den})" style="cursor:pointer;"/>`;
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Graph Fractions</div>
                    <div style="margin-bottom:8px;font-size:1rem;">Click the tick mark where <strong style="color:var(--accent-green);">${sn}/${sd}</strong> belongs.</div>
                    <svg viewBox="0 0 ${gfW} ${gfH}" style="display:block;margin:0 auto;max-width:100%;width:100%;" id="gf_svg">${gfSvg}</svg>
                    <div style="margin-top:10px;">
                        <button class="btn btn-primary" id="checkPlacementBtn" onclick="checkNumberLinePlacement()" style="opacity:0.5;pointer-events:none;">Check Placement</button>
                    </div>
                </div>`;
                return;

            } else if (fracSkill === "round_fractions") {
                // Grade 4: Round mixed numbers to nearest whole or nearest 1/2
                const roundType = pick(["whole", "half"]);
                const wholeNum = rng(1, 9);
                const den = pick([3, 4, 5, 6, 8, 10]);
                const num = rng(1, den - 1);
                const fracVal = num / den;
                const mixedVal = wholeNum + fracVal;

                let correctAns;
                let options;
                if (roundType === "whole") {
                    correctAns = fracVal >= 0.5 ? wholeNum + 1 : wholeNum;
                    const wrong1 = fracVal >= 0.5 ? wholeNum : wholeNum + 1;
                    const wrong2 = wholeNum + 2;
                    const wrong3 = Math.max(0, wholeNum - 1);
                    options = shuffle([String(correctAns), String(wrong1), String(wrong2), String(wrong3)]);
                } else {
                    // Round to nearest half
                    const halfOptions = [wholeNum, wholeNum + 0.5, wholeNum + 1];
                    let closestHalf = halfOptions[0];
                    let closestDist = Math.abs(mixedVal - halfOptions[0]);
                    for (const h of halfOptions) {
                        const dist = Math.abs(mixedVal - h);
                        if (dist < closestDist) {
                            closestDist = dist;
                            closestHalf = h;
                        }
                    }
                    correctAns = closestHalf;
                    const wrongHalves = halfOptions.filter(h => h !== correctAns);
                    const extra = wholeNum + 1.5;
                    options = shuffle([String(correctAns), ...wrongHalves.map(String), String(extra)]);
                }

                // Mini number line visual
                const rfW = 300, rfH = 70, rfLineY = 35, rfLeftX = 20, rfRightX = rfW - 20;
                const rfSpan = rfRightX - rfLeftX;
                let rfSvg = '';
                rfSvg += `<line x1="${rfLeftX}" y1="${rfLineY}" x2="${rfRightX}" y2="${rfLineY}" stroke="var(--text-bright)" stroke-width="2"/>`;
                // Whole number ticks
                for (let w = wholeNum; w <= wholeNum + 1; w++) {
                    const x = rfLeftX + ((w - wholeNum) / 1) * rfSpan;
                    rfSvg += `<line x1="${x}" y1="${rfLineY - 10}" x2="${x}" y2="${rfLineY + 10}" stroke="var(--text-bright)" stroke-width="2"/>`;
                    rfSvg += `<text x="${x}" y="${rfLineY + 25}" text-anchor="middle" fill="var(--text-bright)" font-size="12" font-weight="bold">${w}</text>`;
                }
                // Half tick
                const halfX = rfLeftX + 0.5 * rfSpan;
                rfSvg += `<line x1="${halfX}" y1="${rfLineY - 6}" x2="${halfX}" y2="${rfLineY + 6}" stroke="var(--text-dim)" stroke-width="1.5"/>`;
                // Fraction dot
                const fracDotX = rfLeftX + fracVal * rfSpan;
                rfSvg += `<circle cx="${fracDotX}" cy="${rfLineY}" r="6" fill="var(--accent-green)" stroke="#fff" stroke-width="1.5"/>`;

                q.text = `Round ${wholeNum} ${num}/${den} to the nearest ${roundType === "whole" ? "whole number" : "half"}.`;
                q.ans = String(correctAns);
                q.answerType = "multiple-choice";
                q.options = options;
                q.hint = `Look at the fraction part ${num}/${den} (${fracVal.toFixed(2)}). Is it more or less than 1/2?`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Round Fractions</div>
                    <div style="font-size:1.3rem;margin-bottom:10px;">${wholeNum} ${fracHTML(num, den, 'lg')}</div>
                    <svg viewBox="0 0 ${rfW} ${rfH}" style="display:block;margin:0 auto;max-width:280px;">${rfSvg}</svg>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-top:6px;">Round to nearest ${roundType === "whole" ? "whole number" : "1/2"}</div>
                </div>`;
                q.printFormat = "fraction-round";
                q.skillLabel = "Round Fractions";
                return;

            } else if (fracSkill === "estimate_frac_ops") {
                // Grade 5: Estimate sums/differences using benchmarks
                const op = pick(["+", "-"]);
                const denPool = [3, 4, 5, 6, 8, 10, 12];
                const d1 = pick(denPool);
                const d2 = pick(denPool);
                const n1 = rng(1, d1 - 1);
                let n2 = rng(1, d2 - 1);
                const val1 = n1 / d1;
                const val2 = n2 / d2;

                // Ensure subtraction doesn't go negative
                if (op === "-" && val1 < val2) {
                    n2 = rng(1, Math.max(1, Math.floor(val1 * d2)));
                }
                const actualVal2 = (op === "-" && n1 / d1 < n2 / d2) ? rng(1, Math.max(1, d2 - 2)) / d2 : n2 / d2;

                // Round each to nearest benchmark (0, 0.5, 1)
                function toBenchmark(v) {
                    if (v <= 0.25) return 0;
                    if (v <= 0.75) return 0.5;
                    return 1;
                }
                function benchmarkStr(v) {
                    if (v === 0) return "0";
                    if (v === 0.5) return "1/2";
                    return "1";
                }
                const b1 = toBenchmark(val1);
                const b2 = toBenchmark(actualVal2);
                const estimated = op === "+" ? b1 + b2 : b1 - b2;
                const estimatedStr = estimated === 0.5 ? "1/2" : String(estimated);

                // Wrong options
                const wrongSet = new Set();
                wrongSet.add(estimatedStr);
                const possibles = ["0", "1/2", "1", "1 1/2", "2"];
                for (const p of possibles) {
                    if (p !== estimatedStr) wrongSet.add(p);
                    if (wrongSet.size >= 5) break;
                }
                const allOptions = Array.from(wrongSet);
                const options = shuffle(allOptions.slice(0, 4));
                if (!options.includes(estimatedStr)) {
                    options[rng(0, 3)] = estimatedStr;
                }

                q.text = `Estimate: ${n1}/${d1} ${op} ${n2}/${d2}`;
                q.ans = estimatedStr;
                q.answerType = "multiple-choice";
                q.options = options;
                q.hint = `Round each fraction to the nearest benchmark (0, 1/2, or 1): ${n1}/${d1} \u2248 ${benchmarkStr(b1)}, ${n2}/${d2} \u2248 ${benchmarkStr(b2)}. Then ${op === "+" ? "add" : "subtract"}: ${benchmarkStr(b1)} ${op} ${benchmarkStr(b2)} = ${estimatedStr}.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Estimate Fraction Operations</div>
                    <div style="font-size:1.3rem;margin-bottom:15px;">
                        ${fracHTML(n1, d1, 'xl')} <span style="margin:0 8px;font-size:1.5rem;">${op}</span> ${fracHTML(n2, d2, 'xl')}
                    </div>
                    <div style="background:var(--bg-card);padding:12px 20px;border-radius:10px;display:inline-block;">
                        <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:6px;">Round to benchmarks:</div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:12px;">
                            <span style="font-size:1.1rem;">${fracHTML(n1, d1, 'md')} <span style="color:var(--accent-orange);">\u2248</span> <strong>${benchmarkStr(b1)}</strong></span>
                            <span style="font-size:1.3rem;">${op}</span>
                            <span style="font-size:1.1rem;">${fracHTML(n2, d2, 'md')} <span style="color:var(--accent-orange);">\u2248</span> <strong>${benchmarkStr(b2)}</strong></span>
                        </div>
                    </div>
                </div>`;
                q.printFormat = "fraction-estimate";
                q.skillLabel = "Estimate Frac Ops";
                return;

            } else if (fracSkill === "identify") {
                // Level 1: Identify fractions from visual
                const den = pick([2, 3, 4, 5, 6, 8]);
                const num = rng(1, den - 1);
                q.text = `What fraction is shaded?`;
                q.ans = simplifyFraction(num, den);
                q.answerType = "text";
                const wrongs = new Set();
                wrongs.add(`${den - num}/${den}`);
                wrongs.add(`${num}/${den + 1}`);
                wrongs.add(`${Math.min(num + 1, den)}/${den}`);
                q.options = shuffle([q.ans, ...Array.from(wrongs).slice(0, 3)]);
                q.hint = `Count the shaded parts (numerator) and total parts (denominator).`;

                // Use ONE random visual type (circle or bar, not both)
                const useCircle = Math.random() < 0.5;
                q.visual = `<div style="text-align:center;">
                    <div style="margin-bottom:12px;">
                        ${useCircle
                            ? fracCircleSVG(num, den, 60, 'var(--accent-cyan)', 'var(--bg-card-light)')
                            : `<div style="display:flex;justify-content:center;">${fracBarHTML(num, den, 'var(--accent-cyan)')}</div>`
                        }
                    </div>
                </div>`;
            } else if (fracSkill === "equivalent") {
                // Level 1: Equivalent fractions
                const simpleDen = pick([2, 3, 4, 5]);
                const simpleNum = rng(1, simpleDen - 1);
                const multiplier = rng(2, 4);
                const expandedNum = simpleNum * multiplier;
                const expandedDen = simpleDen * multiplier;

                if (Math.random() < 0.5) {
                    q.text = `Find the missing number:`;
                    q.ans = expandedNum;
                    q.visual = `<div style="text-align:center;">
                        <div class="frac-equation" style="margin-bottom:20px;">
                            ${fracHTML(simpleNum, simpleDen, '2xl')}
                            <span class="frac-equals">=</span>
                            <span class="frac frac-2xl">
                                <span class="num" style="background:rgba(76,175,80,0.2);border-radius:6px;padding:4px 12px;border:2px dashed var(--accent-green);">?</span>
                                <span class="den">${expandedDen}</span>
                            </span>
                        </div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:25px;">
                            ${fracCircleSVG(simpleNum, simpleDen, 60, 'var(--accent-cyan)')}
                            <span style="font-size:2rem;color:var(--accent-green);">=</span>
                            ${fracCircleSVG(expandedNum, expandedDen, 60, 'var(--accent-purple)')}
                        </div>
                        <div style="margin-top:15px;font-size:0.9rem;color:var(--text-dim);">
                            Multiply top and bottom by <strong>${multiplier}</strong>
                        </div>
                    </div>`;
                } else {
                    q.text = `Find the missing number:`;
                    q.ans = expandedDen;
                    q.visual = `<div style="text-align:center;">
                        <div class="frac-equation" style="margin-bottom:20px;">
                            ${fracHTML(simpleNum, simpleDen, '2xl')}
                            <span class="frac-equals">=</span>
                            <span class="frac frac-2xl">
                                <span class="num">${expandedNum}</span>
                                <span class="den" style="background:rgba(76,175,80,0.2);border-radius:6px;padding:4px 12px;border:2px dashed var(--accent-green);">?</span>
                            </span>
                        </div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:25px;">
                            ${fracCircleSVG(simpleNum, simpleDen, 60, 'var(--accent-cyan)')}
                            <span style="font-size:2rem;color:var(--accent-green);">=</span>
                            ${fracCircleSVG(expandedNum, expandedDen, 60, 'var(--accent-purple)')}
                        </div>
                        <div style="margin-top:15px;font-size:0.9rem;color:var(--text-dim);">
                            Multiply top and bottom by <strong>${multiplier}</strong>
                        </div>
                    </div>`;
                }
                q.options = buildNumericOptions(q.ans);
                q.hint = `Multiply both numerator and denominator by the same number to get equivalent fractions.`;
            } else if (fracSkill === "compare") {
                // Level 2: Compare fractions with side-by-side fraction bar visuals
                const denoms = [2, 3, 4, 5, 6, 8];
                const d1 = pick(denoms);
                const d2 = pick(denoms);
                const n1 = rng(1, d1 - 1);
                const n2 = rng(1, d2 - 1);
                const val1 = n1 / d1;
                const val2 = n2 / d2;

                q.text = `Compare the fractions: ${n1}/${d1} ___ ${n2}/${d2}`;
                q.ans = val1 > val2 ? ">" : val1 < val2 ? "<" : "=";
                q.answerType = "symbol";
                q.options = [">", "<", "="];
                q.hint = `Convert to same denominator, or compare how close each is to 1.`;
                q.printFormat = 'fraction-compare';
                q.fractionData = { num1: n1, denom1: d1, num2: n2, denom2: d2 };

                // Build B&W fraction bar SVGs for side-by-side comparison
                const cmpBarW = 200;
                const cmpBarH = 24;
                const buildCompareBar = (num, den) => {
                    const segW = cmpBarW / den;
                    let segs = '';
                    for (let i = 0; i < den; i++) {
                        segs += `<rect x="${i * segW}" y="0" width="${segW}" height="${cmpBarH}" fill="${i < num ? '#ddd' : '#fff'}" stroke="#000" stroke-width="1.5"/>`;
                    }
                    return `<svg width="${cmpBarW}" height="${cmpBarH}" viewBox="0 0 ${cmpBarW} ${cmpBarH}" style="max-width:100%;height:auto;">${segs}</svg>`;
                };

                q.visual = `<div style="text-align:center;">
                    <div style="display:inline-flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:center;">
                        <div style="text-align:center;">
                            ${buildCompareBar(n1, d1)}
                            <div style="margin-top:6px;font-weight:700;font-size:1.1rem;">${n1}/${d1}</div>
                        </div>
                        <div style="font-size:2.5rem;font-weight:800;min-width:40px;">___</div>
                        <div style="text-align:center;">
                            ${buildCompareBar(n2, d2)}
                            <div style="margin-top:6px;font-weight:700;font-size:1.1rem;">${n2}/${d2}</div>
                        </div>
                    </div>
                </div>`;
            } else if (fracSkill === "fraction_bar_ops") {
                // Fraction bar operations — add/subtract with visual bar models
                const isAdd = Math.random() < 0.55;
                const op = isAdd ? '+' : '\u2212';
                let fbNum1, fbDen1, fbNum2, fbDen2;

                if (Math.random() < 0.6) {
                    // Like denominators (60%)
                    fbDen1 = pick([2, 3, 4, 5, 6, 8]);
                    fbDen2 = fbDen1;
                    fbNum1 = rng(1, fbDen1 - 1);
                    fbNum2 = rng(1, fbDen2 - 1);
                } else {
                    // Unlike denominators with obvious LCD (40%)
                    const pairPool = [[2, 4], [3, 6], [4, 8], [2, 6], [2, 8], [3, 9]];
                    const pair = pick(pairPool);
                    if (Math.random() < 0.5) { fbDen1 = pair[0]; fbDen2 = pair[1]; }
                    else { fbDen1 = pair[1]; fbDen2 = pair[0]; }
                    fbNum1 = rng(1, fbDen1 - 1);
                    fbNum2 = rng(1, fbDen2 - 1);
                }

                // Compute answer using LCD
                const fbLcd = _lcm(fbDen1, fbDen2);
                const fbConv1 = fbNum1 * (fbLcd / fbDen1);
                const fbConv2 = fbNum2 * (fbLcd / fbDen2);
                let fbResNum = isAdd ? fbConv1 + fbConv2 : fbConv1 - fbConv2;
                let fbResDen = fbLcd;

                // If subtraction gives non-positive, swap operands
                if (fbResNum <= 0) {
                    const tmpN = fbNum1; const tmpD = fbDen1;
                    fbNum1 = fbNum2; fbDen1 = fbDen2;
                    fbNum2 = tmpN; fbDen2 = tmpD;
                    const c1 = fbNum1 * (fbLcd / fbDen1);
                    const c2 = fbNum2 * (fbLcd / fbDen2);
                    fbResNum = c1 - c2;
                }

                const fbAns = _fracStr(fbResNum, fbResDen);

                q.text = `Use the fraction bars: ${fbNum1}/${fbDen1} ${op} ${fbNum2}/${fbDen2} = ?`;
                q.ans = fbAns;
                q.answerType = 'text';
                q.printFormat = 'fraction-bar-visual';
                q.fractionData = { num1: fbNum1, den1: fbDen1, num2: fbNum2, den2: fbDen2, op: op };
                q.hint = isAdd
                    ? `Find a common denominator (LCD = ${fbLcd}), convert both fractions, then add the numerators.`
                    : `Find a common denominator (LCD = ${fbLcd}), convert both fractions, then subtract the numerators.`;

                // B&W fraction bar SVGs
                const fbBarW = 200, fbBarH = 24;
                const fbBuildBar = (num, den) => {
                    const segW = fbBarW / den;
                    let segs = '';
                    for (let i = 0; i < den; i++) {
                        segs += `<rect x="${i * segW}" y="0" width="${segW}" height="${fbBarH}" fill="${i < num ? '#ddd' : '#fff'}" stroke="#000" stroke-width="1.5"/>`;
                    }
                    return `<svg width="${fbBarW}" height="${fbBarH}" viewBox="0 0 ${fbBarW} ${fbBarH}" style="max-width:100%;height:auto;">${segs}</svg>`;
                };

                q.visual = `<div style="text-align:center;">
                    <div style="display:inline-flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;">
                        <div style="text-align:center;">
                            ${fbBuildBar(fbNum1, fbDen1)}
                            <div style="margin-top:4px;font-weight:700;font-size:1rem;">${fbNum1}/${fbDen1}</div>
                        </div>
                        <div style="font-size:2rem;font-weight:800;">${op}</div>
                        <div style="text-align:center;">
                            ${fbBuildBar(fbNum2, fbDen2)}
                            <div style="margin-top:4px;font-weight:700;font-size:1rem;">${fbNum2}/${fbDen2}</div>
                        </div>
                        <div style="font-size:2rem;font-weight:800;">=</div>
                        <div style="font-size:1.3rem;font-weight:700;min-width:50px;border-bottom:2px solid #333;text-align:center;">?</div>
                    </div>
                </div>`;

                q.options = [];
                q.skillLabel = 'Fraction Bar Ops';
            } else if (fracSkill === "of_number") {
                // Level 2: Fraction of a number
                const maxMultiple = Math.floor(Math.min(range, 100) / denominator);
                const multiple = rng(1, Math.max(1, maxMultiple));
                const whole = multiple * denominator;
                q.text = `What is ${numerator}/${denominator} of ${whole}?`;
                q.ans = (numerator * whole) / denominator;
                q.options = buildNumericOptions(q.ans);
                q.hint = `Step 1: ${whole} \u00F7 ${denominator} = ${whole/denominator}. Step 2: ${whole/denominator} \u00D7 ${numerator} = ?`;

                q.visual = `<div style="text-align:center;">
                    <div class="frac-equation" style="margin-bottom:20px;">
                        ${fracHTML(numerator, denominator, '2xl')}
                        <span style="font-size:1.8rem;margin:0 10px;">of</span>
                        <span style="font-size:2.5rem;font-weight:800;color:var(--accent-purple);">${whole}</span>
                        <span class="frac-equals">=</span>
                        <span style="min-width:60px;font-size:2.5rem;color:var(--accent-green);font-weight:800;">?</span>
                    </div>
                    <div style="margin-bottom:15px;">
                        ${fracCircleSVG(numerator, denominator, 100, 'var(--accent-cyan)')}
                    </div>
                    <div style="font-size:0.95rem;color:var(--text-dim);">
                        Find <strong style="color:var(--accent-cyan);">${numerator}</strong> out of <strong>${denominator}</strong> equal parts of <strong style="color:var(--accent-purple);">${whole}</strong>
                    </div>
                </div>`;
            } else if (fracSkill === "simplify") {
                // Level 2: Simplify fractions
                const multiplier = randInt(2,4);
                const rawNum = numerator * multiplier;
                const rawDen = denominator * multiplier;
                q.text = `Simplify this fraction:`;
                q.answerType = "text";
                q.ans = simplifyFraction(rawNum, rawDen);
                const wrongs = new Set();
                let simpAttempts = 0;
                while (wrongs.size < 3 && simpAttempts < 30) {
                    simpAttempts++;
                    const wrongSimp = simplifyFraction(rawNum + randInt(-3,3), rawDen);
                    if (wrongSimp !== q.ans) wrongs.add(wrongSimp);
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `Find a number that divides both ${rawNum} and ${rawDen} evenly. Try dividing by ${multiplier}!`;
                q.printFormat = 'fraction-simplify';
                q.fractionData = { rawNum, rawDenom: rawDen };

                q.visual = `<div style="text-align:center;">
                    <div class="frac-equation" style="margin-bottom:20px;">
                        <span class="frac frac-2xl" style="color:var(--accent-orange);">
                            <span class="num">${rawNum}</span>
                            <span class="den">${rawDen}</span>
                        </span>
                        <span style="font-size:2rem;margin:0 20px;color:var(--accent-green);">\u2192</span>
                        <span class="frac frac-2xl">
                            <span class="num" style="background:rgba(76,175,80,0.2);border-radius:6px;padding:4px 16px;border:2px dashed var(--accent-green);">?</span>
                            <span class="den" style="background:rgba(76,175,80,0.2);border-radius:6px;padding:4px 16px;border:2px dashed var(--accent-green);">?</span>
                        </span>
                    </div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:15px;">
                        ${fracCircleSVG(rawNum, rawDen, 80, '#ff9800')}
                        <span style="font-size:1.5rem;color:var(--accent-green);">=</span>
                        ${fracCircleSVG(numerator, denominator, 80, '#4caf50')}
                    </div>
                    <div style="background:rgba(255,255,255,0.1);padding:12px 20px;border-radius:10px;display:inline-block;">
                        <span style="font-size:0.95rem;color:var(--text-dim);">
                            Divide both by <strong style="color:var(--accent-cyan);">${multiplier}</strong>:
                            <span style="color:var(--accent-orange);">${rawNum}</span> \u00F7 ${multiplier} = <strong>${numerator}</strong>,
                            <span style="color:var(--accent-orange);">${rawDen}</span> \u00F7 ${multiplier} = <strong>${denominator}</strong>
                        </span>
                    </div>
                </div>`;
            } else if (fracSkill === "improper_mixed") {
                // Level 2: Convert between improper fractions and mixed numbers
                const den = pick([2, 3, 4, 5, 6, 8]);
                const wholes = rng(1, 4); // 1-4 whole parts
                const extraNum = rng(1, den - 1); // Additional fraction part
                const totalNum = wholes * den + extraNum; // Total numerator for improper fraction

                // Randomly choose: show improper and ask for mixed, OR show mixed and ask for improper
                const mode = pick(["improper_to_mixed", "mixed_to_improper", "visual_to_both"]);

                if (mode === "improper_to_mixed") {
                    q.text = `Convert to a mixed number:`;
                    q.ans = `${wholes} ${extraNum}/${den}`;
                    q.answerType = "text";
                    q.printFormat = 'improper-to-mixed';
                    q.fractionData = { totalNum, den };
                    const wrongs = new Set();
                    wrongs.add(`${wholes + 1} ${extraNum}/${den}`);
                    wrongs.add(`${wholes - 1 > 0 ? wholes - 1 : wholes + 2} ${extraNum}/${den}`);
                    wrongs.add(`${wholes} ${extraNum + 1 > den - 1 ? 1 : extraNum + 1}/${den}`);
                    q.options = shuffle([q.ans, ...Array.from(wrongs).slice(0, 3)]);
                    q.hint = `Divide ${totalNum} by ${den}. The quotient is the whole number, the remainder is the numerator.`;

                    // Create visual with multiple circles
                    const circlesHTML = Array.from({length: wholes}, () =>
                        fracCircleSVG(den, den, 60, 'var(--accent-cyan)')
                    ).join('') + fracCircleSVG(extraNum, den, 60, 'var(--accent-cyan)');

                    q.visual = `<div style="text-align:center;">
                        <div class="frac-equation" style="margin-bottom:20px;">
                            <span class="frac frac-2xl" style="color:var(--accent-orange);">
                                <span class="num">${totalNum}</span>
                                <span class="den">${den}</span>
                            </span>
                            <span style="font-size:2rem;margin:0 20px;color:var(--accent-green);">=</span>
                            <span style="font-size:2rem;color:var(--accent-green);font-weight:700;">? <sup>?</sup>\u2044<sub>?</sub></span>
                        </div>
                        <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:15px;">
                            ${circlesHTML}
                        </div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">
                            ${totalNum} \u00F7 ${den} = ${wholes} remainder ${extraNum}
                        </div>
                    </div>`;
                } else if (mode === "mixed_to_improper") {
                    q.text = `Convert to an improper fraction:`;
                    q.ans = `${totalNum}/${den}`;
                    q.answerType = "text";
                    q.printFormat = 'mixed-to-improper';
                    q.fractionData = { wholes, extraNum, den, totalNum };
                    const wrongs = new Set();
                    wrongs.add(`${totalNum + den}/${den}`);
                    wrongs.add(`${totalNum - den > 0 ? totalNum - den : totalNum + 2}/${den}`);
                    wrongs.add(`${wholes + extraNum}/${den}`);
                    q.options = shuffle([q.ans, ...Array.from(wrongs).slice(0, 3)]);
                    q.hint = `Multiply ${wholes} \u00D7 ${den} = ${wholes * den}, then add ${extraNum} to get the numerator.`;

                    const circlesHTML = Array.from({length: wholes}, () =>
                        fracCircleSVG(den, den, 60, 'var(--accent-purple)')
                    ).join('') + fracCircleSVG(extraNum, den, 60, 'var(--accent-purple)');

                    q.visual = `<div style="text-align:center;">
                        <div class="frac-equation" style="margin-bottom:20px;">
                            <span style="font-size:2.2rem;font-weight:700;color:var(--accent-purple);">
                                ${wholes}<span class="frac frac-xl" style="margin-left:8px;">
                                    <span class="num">${extraNum}</span>
                                    <span class="den">${den}</span>
                                </span>
                            </span>
                            <span style="font-size:2rem;margin:0 20px;color:var(--accent-green);">=</span>
                            <span class="frac frac-2xl" style="color:var(--accent-green);">
                                <span class="num" style="background:rgba(76,175,80,0.2);border-radius:6px;padding:4px 12px;border:2px dashed var(--accent-green);">?</span>
                                <span class="den">${den}</span>
                            </span>
                        </div>
                        <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:15px;">
                            ${circlesHTML}
                        </div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">
                            (${wholes} \u00D7 ${den}) + ${extraNum} = ?
                        </div>
                    </div>`;
                } else {
                    // visual_to_both: Show visual and ask for BOTH forms
                    q.text = `Write this amount as an improper fraction AND a mixed number:`;
                    q.ans = `${totalNum}/${den}`;
                    q.answerType = "text";
                    q.printFormat = 'mixed-improper-visual';
                    q.fractionData = { wholes, extraNum, den, totalNum };
                    q.secondAnswer = `${wholes} ${extraNum}/${den}`;
                    const wrongs = new Set();
                    wrongs.add(`${totalNum + 1}/${den}`);
                    wrongs.add(`${totalNum - 1}/${den}`);
                    wrongs.add(`${wholes}/${den}`);
                    q.options = shuffle([q.ans, ...Array.from(wrongs).slice(0, 3)]);
                    q.hint = `Count total shaded parts for improper. Count full circles for whole number.`;

                    const circlesHTML = Array.from({length: wholes}, (_, i) => `
                        <div style="text-align:center;">
                            ${fracCircleSVG(den, den, 70, 'var(--accent-cyan)')}
                            <div style="font-size:0.8rem;color:var(--text-dim);">Full</div>
                        </div>
                    `).join('') + `
                        <div style="text-align:center;">
                            ${fracCircleSVG(extraNum, den, 70, 'var(--accent-cyan)')}
                            <div style="font-size:0.8rem;color:var(--text-dim);">${extraNum}/${den}</div>
                        </div>
                    `;

                    q.visual = `<div style="text-align:center;">
                        <div style="display:flex;justify-content:center;gap:15px;flex-wrap:wrap;margin-bottom:20px;">
                            ${circlesHTML}
                        </div>
                        <div style="background:rgba(255,255,255,0.1);padding:15px 20px;border-radius:12px;">
                            <div style="display:flex;justify-content:center;gap:30px;align-items:center;">
                                <div>
                                    <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:5px;">Improper Fraction:</div>
                                    <span class="frac frac-xl" style="color:var(--accent-orange);">
                                        <span class="num" style="border-bottom:2px dashed var(--accent-orange);min-width:30px;">?</span>
                                        <span class="den">${den}</span>
                                    </span>
                                </div>
                                <span style="font-size:1.5rem;color:var(--accent-green);">=</span>
                                <div>
                                    <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:5px;">Mixed Number:</div>
                                    <span style="font-size:1.5rem;color:var(--accent-purple);font-weight:700;">
                                        <span style="border-bottom:2px dashed var(--accent-purple);">?</span>
                                        <span class="frac frac-lg" style="margin-left:5px;">
                                            <span class="num" style="border-bottom:2px dashed var(--accent-purple);min-width:20px;">?</span>
                                            <span class="den">${den}</span>
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>`;
                }
            } else if (fracSkill === "mixed_improper_visual") {
                // Visual Mixed ↔ Improper with pizza/pie circles and dual-fraction answer
                const visDen = pick([2, 3, 4, 5, 6, 8]);
                const visWholes = rng(1, 4);
                const visExtra = rng(1, visDen - 1);
                const visTotalNum = visWholes * visDen + visExtra;

                // Build pizza SVGs: whole pies + partial pie
                const pizzaColors = ['#d4e5f7', '#e8d4f0', '#f5d4e8', '#d4f0e5'];
                const fillColor = pick(pizzaColors);
                const pizzaSVGs = Array.from({length: visWholes}, () =>
                    `<div style="text-align:center;"><div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:2px;">Full</div>${fracCircleSVG(visDen, visDen, 80, fillColor)}</div>`
                ).join('') + `<div style="text-align:center;"><div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:2px;">${visExtra}/${visDen}</div>${fracCircleSVG(visExtra, visDen, 80, fillColor)}</div>`;

                q.text = `Write this amount as a mixed number AND an improper fraction:`;
                q.answerType = "dual-fraction";
                q.dualFractionAnswers = {
                    mixed: `${visWholes} ${visExtra}/${visDen}`,
                    improper: `${visTotalNum}/${visDen}`
                };
                q.ans = `${visTotalNum}/${visDen}`; // fallback for print/standard checks
                q.options = [];
                q.hint = `Count ${visWholes} full pizzas and ${visExtra}/${visDen} of another. Mixed: ${visWholes} ${visExtra}/${visDen}. Improper: (${visWholes}×${visDen})+${visExtra} = ${visTotalNum} over ${visDen}.`;
                q.skillLabel = 'Mixed↔Improper';
                q.printFormat = 'mixed-improper-visual';
                q.fractionData = { wholes: visWholes, extraNum: visExtra, den: visDen, totalNum: visTotalNum };

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.1rem;">Pizza Fractions</div>
                    <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-bottom:20px;">
                        ${pizzaSVGs}
                    </div>
                    <div style="background:rgba(255,255,255,0.08);padding:16px 20px;border-radius:14px;display:inline-block;">
                        <div style="display:flex;justify-content:center;gap:30px;align-items:flex-start;">
                            <div>
                                <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;font-weight:600;">Mixed Number:</div>
                                <div style="display:flex;align-items:center;gap:4px;">
                                    <input type="text" id="mixedInput" class="dual-frac-input" placeholder="e.g. 2 3/4" autocomplete="off"
                                        style="width:110px;height:42px;text-align:center;font-size:1.1rem;font-weight:700;border:3px solid var(--accent-purple);border-radius:10px;background:var(--bg-card);color:var(--text-primary);outline:none;padding:0 6px;">
                                </div>
                            </div>
                            <div style="font-size:1.5rem;color:var(--accent-green);font-weight:700;margin-top:24px;">=</div>
                            <div>
                                <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;font-weight:600;">Improper Fraction:</div>
                                <div style="display:flex;align-items:center;gap:4px;">
                                    <input type="text" id="improperInput" class="dual-frac-input" placeholder="e.g. 11/4" autocomplete="off"
                                        style="width:110px;height:42px;text-align:center;font-size:1.1rem;font-weight:700;border:3px solid var(--accent-orange);border-radius:10px;background:var(--bg-card);color:var(--text-primary);outline:none;padding:0 6px;">
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-primary" id="checkDualFracBtn" onclick="checkDualFractionAnswer()" style="margin-top:14px;opacity:0.5;pointer-events:none;">Check Both Answers</button>
                    </div>
                </div>`;

            } else if (fracSkill === "add" || fracSkill === "sub") {
                // Level 3: Add/Subtract fractions with SAME denominator
                const num2 = randInt(1, Math.min(denominator - 1, denominator - numerator + 2));
                const opSymbol = fracSkill === "add" ? "+" : "\u2212";
                q.text = `Calculate:`;
                const result = fracSkill === "add" ? numerator + num2 : Math.abs(numerator - num2);
                q.ans = simplifyFraction(result, denominator);
                q.answerType = "text";
                const wrongs = new Set();
                let fracAttempts = 0;
                while (wrongs.size < 3 && fracAttempts < 30) {
                    fracAttempts++;
                    const offset = randInt(-2, 2);
                    if (offset === 0) continue;
                    wrongs.add(simplifyFraction(Math.abs(result + offset), denominator));
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `Same denominator! Just ${fracSkill === "add" ? "add" : "subtract"} the numerators: ${numerator} ${opSymbol} ${num2} = ${result}`;

                q.visual = `<div style="text-align:center;">
                    <div class="frac-equation" style="margin-bottom:25px;">
                        <span class="frac frac-2xl" style="color:var(--accent-cyan);">
                            <span class="num">${numerator}</span>
                            <span class="den">${denominator}</span>
                        </span>
                        <span class="frac-op">${opSymbol}</span>
                        <span class="frac frac-2xl" style="color:var(--accent-purple);">
                            <span class="num">${num2}</span>
                            <span class="den">${denominator}</span>
                        </span>
                        <span class="frac-equals">=</span>
                        <span class="frac-answer-box">
                            <span class="answer-num">?</span>
                            <span class="answer-bar"></span>
                            <span class="answer-den">${denominator}</span>
                        </span>
                    </div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap;margin-bottom:15px;">
                        <div style="text-align:center;">
                            ${fracCircleSVG(numerator, denominator, 80, '#00bcd4')}
                        </div>
                        <span style="font-size:2rem;font-weight:700;color:var(--accent-orange);">${opSymbol}</span>
                        <div style="text-align:center;">
                            ${fracCircleSVG(num2, denominator, 80, '#9c27b0')}
                        </div>
                    </div>
                    <div style="display:flex;justify-content:center;gap:8px;margin-top:10px;">
                        ${fracBarHTML(numerator, denominator, 'var(--accent-cyan)')}
                        <span style="font-size:1.3rem;color:var(--accent-orange);align-self:center;">${opSymbol}</span>
                        ${fracBarHTML(num2, denominator, 'var(--accent-purple)')}
                    </div>
                </div>`;
            } else if (fracSkill === "add_unlike" || fracSkill === "sub_unlike") {
                // Level 4: Add/Subtract fractions with UNLIKE denominators
                const denomPairs = [
                    {d1: 2, d2: 4, lcd: 4},
                    {d1: 2, d2: 6, lcd: 6},
                    {d1: 3, d2: 6, lcd: 6},
                    {d1: 4, d2: 8, lcd: 8},
                    {d1: 2, d2: 3, lcd: 6},
                    {d1: 3, d2: 4, lcd: 12}
                ];
                const pair = pick(denomPairs);
                const n1 = rng(1, pair.d1 - 1);
                const n2 = rng(1, pair.d2 - 1);

                const mult1 = pair.lcd / pair.d1;
                const mult2 = pair.lcd / pair.d2;
                const converted1 = n1 * mult1;
                const converted2 = n2 * mult2;

                const isAdd = fracSkill === "add_unlike";
                const opSymbol = isAdd ? "+" : "\u2212";

                let num1Final = n1, den1Final = pair.d1;
                let num2Final = n2, den2Final = pair.d2;
                let conv1Final = converted1, conv2Final = converted2;
                let resultNum = isAdd ? converted1 + converted2 : converted1 - converted2;

                if (!isAdd && converted1 < converted2) {
                    [num1Final, num2Final] = [n2, n1];
                    [den1Final, den2Final] = [pair.d2, pair.d1];
                    [conv1Final, conv2Final] = [converted2, converted1];
                    resultNum = converted2 - converted1;
                }

                q.text = `Calculate:`;
                q.ans = simplifyFraction(Math.abs(resultNum), pair.lcd);
                q.answerType = "text";

                const wrongs = new Set();
                wrongs.add(`${num1Final + num2Final}/${den1Final + den2Final}`);
                wrongs.add(simplifyFraction(Math.abs(resultNum) + 1, pair.lcd));
                wrongs.add(simplifyFraction(Math.max(1, Math.abs(resultNum) - 1), pair.lcd));

                q.options = shuffle([q.ans, ...Array.from(wrongs).slice(0, 3)]);
                q.hint = `Step 1: Find LCD (${pair.lcd}). Step 2: Convert fractions. Step 3: ${isAdd ? 'Add' : 'Subtract'} numerators.`;

                q.visual = `<div style="text-align:center;">
                    <!-- Original equation -->
                    <div class="frac-equation" style="margin-bottom:20px;">
                        <span class="frac frac-2xl" style="color:var(--accent-cyan);">
                            <span class="num">${num1Final}</span>
                            <span class="den">${den1Final}</span>
                        </span>
                        <span class="frac-op">${opSymbol}</span>
                        <span class="frac frac-2xl" style="color:var(--accent-purple);">
                            <span class="num">${num2Final}</span>
                            <span class="den">${den2Final}</span>
                        </span>
                    </div>

                    <!-- Visual comparison -->
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:20px;">
                        ${fracCircleSVG(num1Final, den1Final, 70, '#00bcd4')}
                        <span style="font-size:1.8rem;font-weight:700;color:var(--accent-orange);">${opSymbol}</span>
                        ${fracCircleSVG(num2Final, den2Final, 70, '#9c27b0')}
                    </div>

                    <!-- Conversion step -->
                    <div style="background:rgba(255,255,255,0.08);padding:15px 20px;border-radius:12px;margin-bottom:15px;">
                        <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">
                            <strong>Find common denominator:</strong> LCD = <span style="display:inline-block;min-width:40px;border-bottom:2px solid var(--accent-green);">&nbsp;</span>
                        </div>
                        <div class="frac-equation" style="padding:10px;background:transparent;">
                            <span class="frac frac-xl" style="color:var(--accent-cyan);">
                                <span class="num">?</span>
                                <span class="den">?</span>
                            </span>
                            <span class="frac-op">${opSymbol}</span>
                            <span class="frac frac-xl" style="color:var(--accent-purple);">
                                <span class="num">?</span>
                                <span class="den">?</span>
                            </span>
                            <span class="frac-equals">=</span>
                            <span class="frac-answer-box">
                                <span class="answer-num">?</span>
                                <span class="answer-bar"></span>
                                <span class="answer-den">?</span>
                            </span>
                        </div>
                    </div>

                    <!-- Bar visualization with LCD -->
                    <div style="display:flex;justify-content:center;gap:8px;">
                        ${fracBarHTML(conv1Final, pair.lcd, 'var(--accent-cyan)')}
                        <span style="font-size:1.3rem;color:var(--accent-orange);align-self:center;">${opSymbol}</span>
                        ${fracBarHTML(conv2Final, pair.lcd, 'var(--accent-purple)')}
                    </div>
                </div>`;
            } else {
                // Default to simplify
                const multiplier = randInt(2,4);
                const rawNum = numerator * multiplier;
                const rawDen = denominator * multiplier;
                q.text = `Simplify: ${rawNum}/${rawDen}`;
                q.answerType = "text";
                q.ans = simplifyFraction(rawNum, rawDen);
                const wrongs = new Set();
                let simpAttempts = 0;
                while (wrongs.size < 3 && simpAttempts < 30) {
                    simpAttempts++;
                    const wrongSimp = simplifyFraction(rawNum + randInt(-3,3), rawDen);
                    if (wrongSimp !== q.ans) wrongs.add(wrongSimp);
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `Find a number that divides both ${rawNum} and ${rawDen} evenly. Try dividing by ${multiplier}!`;
                q.visual = `<div style="text-align:center;">
                    <div style="margin-bottom:15px;">
                        ${fracHTML(rawNum, rawDen, 'xl')}
                    </div>
                    <div style="font-size:0.9rem;color:var(--text-dim);">Divide top and bottom by the same number</div>
                </div>`;
            }
            return;
}

export function generateConversionsQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // Standard fractions for clean decimal conversions
            // Only include fractions where denominator divides evenly into 10, 100, or 1000
            // and numerator/denominator gives a nice terminating decimal
            const conversionFractions = [
                {n: 1, d: 2, hint: "Half of 1 is 0.5"}, // 0.5
                {n: 1, d: 4, hint: "1/4 = 25/100 = 0.25"}, {n: 2, d: 4, hint: "2/4 = 1/2 = 0.5"}, {n: 3, d: 4, hint: "3/4 = 75/100 = 0.75"}, // 0.25, 0.5, 0.75
                {n: 1, d: 5, hint: "1/5 = 2/10 = 0.2"}, {n: 2, d: 5, hint: "2/5 = 4/10 = 0.4"}, {n: 3, d: 5, hint: "3/5 = 6/10 = 0.6"}, {n: 4, d: 5, hint: "4/5 = 8/10 = 0.8"}, // 0.2, 0.4, 0.6, 0.8
                {n: 1, d: 10, hint: "1/10 = 0.1"}, {n: 3, d: 10, hint: "3/10 = 0.3"}, {n: 7, d: 10, hint: "7/10 = 0.7"}, {n: 9, d: 10, hint: "9/10 = 0.9"}, // 0.1, 0.3, 0.7, 0.9
                {n: 1, d: 100, hint: "1/100 = 0.01"}, {n: 7, d: 100, hint: "7/100 = 0.07"}, {n: 25, d: 100, hint: "25/100 = 0.25"}, {n: 50, d: 100, hint: "50/100 = 0.50"} // 0.01, 0.07, 0.25, 0.50
            ];
            // For mixed, pick random conversion skill
            // Local helpers for conversion skills
            function _gcdConv(a, b) { return b === 0 ? Math.abs(a) : _gcdConv(b, a % b); }
            function _simplifyConv(n, d) { const g = _gcdConv(n, d); return [n / g, d / g]; }
            function _fracStrConv(n, d) {
                if (n === 0) return "0";
                const [sn, sd] = _simplifyConv(Math.abs(n), Math.abs(d));
                const sign = (n < 0) !== (d < 0) ? '-' : '';
                if (sd === 1) return sign + sn;
                if (sn > sd) return sign + Math.floor(sn / sd) + ' ' + (sn % sd) + '/' + sd;
                return sign + sn + '/' + sd;
            }
            const convSkill = mappedSkill === "mixed" ? pick(["f_to_d", "d_to_f", "f_to_p", "p_to_f", "length_metric", "mass_metric", "time", "percent_visual", "d_to_p", "p_to_d", "percent_of_number", "order_fdp", "find_whole_from_pct"]) : mappedSkill;
            if (convSkill === "f_to_d") {
                const frac = pick(conversionFractions);
                const numerator = frac.n;
                const denominator = frac.d;
                const decimalAns = +(numerator / denominator).toFixed(3);
                q.text = `Convert to decimal: ${numerator}/${denominator}`;
                q.ans = decimalAns;
                q.options = buildNumericOptions(q.ans);

                // Generate helpful hint based on denominator
                let hintText = frac.hint || `${numerator} \u00F7 ${denominator} = ${decimalAns}`;
                if (denominator === 10) {
                    hintText = `Tenths: ${numerator}/10 = 0.${numerator}`;
                } else if (denominator === 100) {
                    hintText = `Hundredths: ${numerator}/100 = 0.${numerator.toString().padStart(2, '0')}`;
                } else if (denominator === 5) {
                    hintText = `Multiply top and bottom by 2: ${numerator}/5 = ${numerator * 2}/10 = 0.${numerator * 2}`;
                } else if (denominator === 4) {
                    hintText = `Multiply top and bottom by 25: ${numerator}/4 = ${numerator * 25}/100 = 0.${(numerator * 25).toString().padStart(2, '0')}`;
                } else if (denominator === 2) {
                    hintText = `Multiply top and bottom by 5: ${numerator}/2 = ${numerator * 5}/10 = 0.${numerator * 5}`;
                }
                q.hint = hintText;

                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                        ${fracHTML(numerator, denominator, 'xl')}
                        <span style="font-size:2rem;color:var(--accent-orange);">\u2192</span>
                        <div style="font-size:1.5rem;font-weight:700;color:var(--accent-green);">0.???</div>
                    </div>
                    <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">Convert to tenths or hundredths first!</div>
                </div>`;
            } else if (convSkill === "d_to_f") {
                const simpleFractions = [
                    {n: 1, d: 2}, {n: 1, d: 4}, {n: 3, d: 4},
                    {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 5}, {n: 4, d: 5},
                    {n: 1, d: 10}, {n: 3, d: 10}, {n: 7, d: 10}, {n: 9, d: 10}
                ];
                const frac = pick(simpleFractions);
                const numerator = frac.n;
                const denominator = frac.d;
                const decimal = +(numerator / denominator).toFixed(2);
                q.text = `Convert ${decimal} to a fraction.`;
                q.answerType = "text";
                q.ans = simplifyFraction(numerator, denominator);
                const wrongs = new Set();
                while (wrongs.size < 3) {
                    const wrongFrac = pick(simpleFractions);
                    const wrongAns = simplifyFraction(wrongFrac.n, wrongFrac.d);
                    if (wrongAns !== q.ans) wrongs.add(wrongAns);
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `${decimal} means "${decimal.toString().split('.')[1] || '0'}" out of "${Math.pow(10, (decimal.toString().split('.')[1] || '0').length)}". Simplify if needed!`;
                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                        <div style="font-size:2rem;font-weight:700;color:var(--accent-cyan);">${decimal}</div>
                        <span style="font-size:2rem;color:var(--accent-orange);">\u2192</span>
                        ${fracHTML('?', '?', 'xl')}
                    </div>
                </div>`;
            } else if (convSkill === "f_to_p") {
                // Only use fractions that convert to whole number percentages
                const percentFractions = [
                    {n: 1, d: 2}, // 50%
                    {n: 1, d: 4}, {n: 2, d: 4}, {n: 3, d: 4}, // 25%, 50%, 75%
                    {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 5}, {n: 4, d: 5}, // 20%, 40%, 60%, 80%
                    {n: 1, d: 10}, {n: 2, d: 10}, {n: 3, d: 10}, {n: 4, d: 10}, {n: 5, d: 10}, {n: 6, d: 10}, {n: 7, d: 10}, {n: 8, d: 10}, {n: 9, d: 10}, // 10-90%
                    {n: 1, d: 20}, {n: 2, d: 20}, {n: 3, d: 20}, {n: 4, d: 20}, {n: 5, d: 20}, // 5%, 10%, 15%, 20%, 25%
                    {n: 1, d: 100}, {n: 5, d: 100}, {n: 10, d: 100}, {n: 25, d: 100}, {n: 50, d: 100}, {n: 75, d: 100} // 1%, 5%, 10%, 25%, 50%, 75%
                ];
                const frac = pick(percentFractions);
                const numerator = frac.n;
                const denominator = frac.d;
                q.text = `Convert to percent: ${numerator}/${denominator}`;
                q.answerType = "text";
                q.ans = fractionToPercent(numerator, denominator);
                const wrongs = new Set();
                while (wrongs.size < 3) {
                    const wrongFrac = pick(percentFractions);
                    const wrongAns = fractionToPercent(wrongFrac.n, wrongFrac.d);
                    if (wrongAns !== q.ans) wrongs.add(wrongAns);
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `To convert to percent: (${numerator} \u00F7 ${denominator}) \u00D7 100 = ?%`;
                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                        ${fracHTML(numerator, denominator, 'xl')}
                        <span style="font-size:2rem;color:var(--accent-orange);">\u2192</span>
                        <div style="font-size:1.8rem;font-weight:700;color:var(--accent-green);">?%</div>
                    </div>
                    <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">Percent = out of 100</div>
                </div>`;
            } else if (convSkill === "p_to_f") {
                const percent = pick([10,20,25,50,75]);
                q.text = `Convert ${percent}% to a fraction.`;
                q.answerType = "text";
                q.ans = simplifyFraction(percent, 100);
                const wrongs = new Set();
                while (wrongs.size < 3) {
                    const p = pick([15,30,40,60,80]);
                    wrongs.add(simplifyFraction(p, 100));
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `${percent}% means ${percent}/100. Now simplify by finding a common factor!`;
                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                        <div style="font-size:2rem;font-weight:700;color:var(--accent-purple);">${percent}%</div>
                        <span style="font-size:2rem;color:var(--accent-orange);">\u2192</span>
                        ${fracHTML(percent, 100, 'lg')}
                        <span style="font-size:2rem;color:var(--accent-orange);">\u2192</span>
                        ${fracHTML('?', '?', 'xl')}
                    </div>
                </div>`;
            } else if (convSkill === "percent_visual") {
                // Grade 6: 10x10 grid shading for percents
                const pctMultiples = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
                const percent = pick(pctMultiples);
                const problemType = pick(["identify", "fraction", "shade"]);

                // Build 10x10 grid SVG
                const cellSize = 24;
                const gridW = cellSize * 10 + 2;
                const gridH = cellSize * 10 + 2;
                let gridSvg = '';
                for (let row = 0; row < 10; row++) {
                    for (let col = 0; col < 10; col++) {
                        const idx = row * 10 + col;
                        const isShaded = idx < percent;
                        gridSvg += `<rect x="${col * cellSize + 1}" y="${row * cellSize + 1}" width="${cellSize}" height="${cellSize}" fill="${isShaded ? 'var(--accent-cyan)' : 'var(--bg-card)'}" stroke="var(--text-bright)" stroke-width="0.8" opacity="${isShaded ? '0.85' : '0.3'}"/>`;
                    }
                }

                if (problemType === "identify") {
                    q.text = `What percent of the grid is shaded?`;
                    q.ans = percent;
                    q.answerType = "number";
                    q.options = buildNumericOptions(percent);
                    q.hint = `Each small square = 1%. Count the shaded squares.`;
                } else if (problemType === "fraction") {
                    const [sn, sd] = _simplifyConv(percent, 100);
                    q.text = `What fraction of the grid is shaded? (simplify)`;
                    q.ans = sd === 1 ? String(sn) : `${sn}/${sd}`;
                    q.answerType = "text";
                    q.hint = `${percent} shaded out of 100 total = ${percent}/100. Simplify to lowest terms.`;
                } else {
                    q.text = `${percent}% of this grid is shaded. How many squares are shaded?`;
                    q.ans = percent;
                    q.answerType = "number";
                    q.options = buildNumericOptions(percent);
                    q.hint = `Each small square = 1%. ${percent}% means ${percent} squares.`;
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Percent Grid</div>
                    <svg viewBox="0 0 ${gridW} ${gridH}" style="display:block;margin:0 auto;max-width:260px;">${gridSvg}</svg>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-top:6px;">Each square = 1%</div>
                </div>`;
                q.printFormat = "percent-grid";
                q.skillLabel = "Percent Visual";

            } else if (convSkill === "d_to_p") {
                // Grade 6: Decimal to Percent conversion
                const decOptions = [
                    { dec: 0.1, pct: "10%" }, { dec: 0.2, pct: "20%" }, { dec: 0.25, pct: "25%" },
                    { dec: 0.3, pct: "30%" }, { dec: 0.4, pct: "40%" }, { dec: 0.45, pct: "45%" },
                    { dec: 0.5, pct: "50%" }, { dec: 0.6, pct: "60%" }, { dec: 0.65, pct: "65%" },
                    { dec: 0.7, pct: "70%" }, { dec: 0.75, pct: "75%" }, { dec: 0.8, pct: "80%" },
                    { dec: 0.85, pct: "85%" }, { dec: 0.9, pct: "90%" }, { dec: 0.95, pct: "95%" },
                    { dec: 0.05, pct: "5%" }, { dec: 0.08, pct: "8%" }, { dec: 0.125, pct: "12.5%" },
                    { dec: 1.5, pct: "150%" }, { dec: 2.0, pct: "200%" }, { dec: 0.01, pct: "1%" }
                ];
                const chosen = pick(decOptions);
                q.text = `Convert to a percent: ${chosen.dec}`;
                q.ans = chosen.pct;
                q.answerType = "text";
                q.hint = `Multiply by 100 and add %. ${chosen.dec} \u00D7 100 = ${chosen.pct}`;
                q.printFormat = "conversion";
                q.skillLabel = "Dec \u2192 %";

            } else if (convSkill === "p_to_d") {
                // Grade 6: Percent to Decimal conversion
                const pctOptions = [
                    { pct: 5, dec: "0.05" }, { pct: 8, dec: "0.08" }, { pct: 10, dec: "0.1" },
                    { pct: 12, dec: "0.12" }, { pct: 20, dec: "0.2" }, { pct: 25, dec: "0.25" },
                    { pct: 30, dec: "0.3" }, { pct: 33, dec: "0.33" }, { pct: 40, dec: "0.4" },
                    { pct: 50, dec: "0.5" }, { pct: 60, dec: "0.6" }, { pct: 75, dec: "0.75" },
                    { pct: 80, dec: "0.8" }, { pct: 90, dec: "0.9" }, { pct: 100, dec: "1" },
                    { pct: 125, dec: "1.25" }, { pct: 150, dec: "1.5" }, { pct: 200, dec: "2" }
                ];
                const chosen = pick(pctOptions);
                q.text = `Convert to a decimal: ${chosen.pct}%`;
                q.ans = chosen.dec;
                q.answerType = "text";
                q.hint = `Divide by 100 (move decimal 2 places left). ${chosen.pct} \u00F7 100 = ${chosen.dec}`;
                q.printFormat = "conversion";
                q.skillLabel = "% \u2192 Dec";

            } else if (convSkill === "percent_of_number") {
                // Grade 6: "What is 25% of 80?"
                const combos = [
                    { pct: 10, base: 50, ans: 5 }, { pct: 10, base: 80, ans: 8 }, { pct: 10, base: 120, ans: 12 },
                    { pct: 20, base: 45, ans: 9 }, { pct: 20, base: 60, ans: 12 }, { pct: 20, base: 75, ans: 15 },
                    { pct: 25, base: 40, ans: 10 }, { pct: 25, base: 80, ans: 20 }, { pct: 25, base: 120, ans: 30 },
                    { pct: 50, base: 36, ans: 18 }, { pct: 50, base: 48, ans: 24 }, { pct: 50, base: 90, ans: 45 },
                    { pct: 75, base: 40, ans: 30 }, { pct: 75, base: 80, ans: 60 }, { pct: 75, base: 120, ans: 90 },
                    { pct: 33, base: 30, ans: 10 }, { pct: 33, base: 60, ans: 20 }, { pct: 33, base: 90, ans: 30 },
                    { pct: 15, base: 60, ans: 9 }, { pct: 40, base: 50, ans: 20 }, { pct: 60, base: 50, ans: 30 }
                ];
                const combo = pick(combos);

                // Bar model visual: show the full bar and the percent portion
                const barW = 300, barH = 40;
                const filledW = Math.round((combo.pct / 100) * barW);
                let barSvg = '';
                barSvg += `<rect x="0" y="0" width="${barW}" height="${barH}" fill="var(--bg-card)" stroke="var(--text-bright)" stroke-width="1.5" rx="4"/>`;
                barSvg += `<rect x="0" y="0" width="${filledW}" height="${barH}" fill="var(--accent-cyan)" opacity="0.7" rx="4"/>`;
                barSvg += `<text x="${filledW / 2}" y="${barH / 2 + 5}" text-anchor="middle" fill="var(--text-bright)" font-size="14" font-weight="bold">${combo.pct}%</text>`;
                barSvg += `<text x="${barW / 2 + filledW / 2}" y="${barH / 2 + 5}" text-anchor="middle" fill="var(--text-dim)" font-size="12">${100 - combo.pct}%</text>`;

                q.text = `What is ${combo.pct}% of ${combo.base}?`;
                q.ans = combo.ans;
                q.answerType = "number";
                q.options = buildNumericOptions(combo.ans);
                q.hint = `${combo.pct}% = ${combo.pct}/100. Multiply: ${combo.base} \u00D7 ${combo.pct}/100 = ${combo.ans}.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Percent of a Number</div>
                    <div style="font-size:1.2rem;margin-bottom:10px;">${combo.pct}% of <strong>${combo.base}</strong></div>
                    <svg viewBox="0 0 ${barW} ${barH + 20}" style="display:block;margin:0 auto;max-width:320px;">
                        <g transform="translate(0,10)">${barSvg}</g>
                    </svg>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-top:6px;">Total: ${combo.base}</div>
                </div>`;
                q.printFormat = "percent-of";
                q.skillLabel = "% of Number";

            } else if (convSkill === "order_fdp") {
                // Grade 6: Interactive ordering of mixed FDP values
                const count = pick([4, 5]);
                // Generate mixed fractions, decimals, and percents with distinct values
                const fdpPool = [
                    { str: "1/4", val: 0.25 }, { str: "1/2", val: 0.5 }, { str: "3/4", val: 0.75 },
                    { str: "1/3", val: 0.333 }, { str: "2/3", val: 0.667 }, { str: "1/5", val: 0.2 },
                    { str: "2/5", val: 0.4 }, { str: "3/5", val: 0.6 }, { str: "4/5", val: 0.8 },
                    { str: "1/8", val: 0.125 }, { str: "3/8", val: 0.375 }, { str: "5/8", val: 0.625 },
                    { str: "7/8", val: 0.875 }, { str: "1/10", val: 0.1 }, { str: "7/10", val: 0.7 },
                    { str: "0.15", val: 0.15 }, { str: "0.3", val: 0.3 }, { str: "0.45", val: 0.45 },
                    { str: "0.55", val: 0.55 }, { str: "0.65", val: 0.65 }, { str: "0.85", val: 0.85 },
                    { str: "0.9", val: 0.9 }, { str: "0.05", val: 0.05 }, { str: "0.95", val: 0.95 },
                    { str: "10%", val: 0.1 }, { str: "20%", val: 0.2 }, { str: "25%", val: 0.25 },
                    { str: "30%", val: 0.3 }, { str: "40%", val: 0.4 }, { str: "50%", val: 0.5 },
                    { str: "60%", val: 0.6 }, { str: "75%", val: 0.75 }, { str: "80%", val: 0.8 },
                    { str: "90%", val: 0.9 }, { str: "5%", val: 0.05 }, { str: "15%", val: 0.15 }
                ];
                const shuffledPool = shuffle([...fdpPool]);
                const selected = [];
                const usedVals = new Set();
                for (const item of shuffledPool) {
                    if (selected.length >= count) break;
                    const valKey = item.val.toFixed(4);
                    if (!usedVals.has(valKey)) {
                        usedVals.add(valKey);
                        selected.push(item);
                    }
                }

                const direction = pick(["asc", "desc"]);
                const sorted = [...selected].sort((a, b) => direction === "asc" ? a.val - b.val : b.val - a.val);
                const orderItems = selected.map(s => s.str);
                const correctOrder = sorted.map(s => s.str);

                q.text = `Order from ${direction === "asc" ? "least to greatest" : "greatest to least"}:`;
                q.ans = correctOrder.join(",");
                q.answerType = "interactive";
                q.interactiveType = "ordering";
                q.orderMode = "click";
                q.orderDirection = direction;
                q.orderIcon = direction === "asc" ? "Least \u2192 Greatest" : "Greatest \u2192 Least";
                q.numbers = orderItems;
                q.sortedNumbers = correctOrder;
                q.hint = `Convert all values to decimals first, then order. Fractions: divide. Percents: divide by 100.`;
                q.options = [];
                const cardColors = ['var(--accent-cyan)', 'var(--accent-purple)', 'var(--accent-orange)', 'var(--accent-green)', '#e74c3c'];
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Order Fractions, Decimals & Percents</div>
                    <div style="font-size:0.9rem;margin-bottom:10px;">${direction === "asc" ? "Least \u2192 Greatest" : "Greatest \u2192 Least"}</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin:15px 0;">
                        ${selected.map((s, i) => `<div style="padding:10px 16px;background:var(--bg-card);border:2px solid ${cardColors[i % cardColors.length]};border-radius:10px;font-size:1.2rem;font-weight:600;">${s.str}</div>`).join('')}
                    </div>
                </div>`;
                q.printFormat = "fdp-order";
                q.skillLabel = "Order FDP";

            } else if (convSkill === "find_whole_from_pct") {
                // Grade 6: "12 is 25% of what number?"
                const combos = [
                    { part: 5, pct: 10, whole: 50 }, { part: 8, pct: 10, whole: 80 },
                    { part: 12, pct: 25, whole: 48 }, { part: 15, pct: 25, whole: 60 },
                    { part: 20, pct: 25, whole: 80 }, { part: 30, pct: 25, whole: 120 },
                    { part: 15, pct: 50, whole: 30 }, { part: 24, pct: 50, whole: 48 },
                    { part: 40, pct: 50, whole: 80 }, { part: 18, pct: 20, whole: 90 },
                    { part: 12, pct: 20, whole: 60 }, { part: 30, pct: 75, whole: 40 },
                    { part: 60, pct: 75, whole: 80 }, { part: 9, pct: 15, whole: 60 },
                    { part: 16, pct: 40, whole: 40 }, { part: 21, pct: 30, whole: 70 },
                    { part: 6, pct: 10, whole: 60 }, { part: 45, pct: 50, whole: 90 }
                ];
                const combo = pick(combos);
                const multiplier = 100 / combo.pct;

                q.text = `${combo.part} is ${combo.pct}% of what number?`;
                q.ans = combo.whole;
                q.answerType = "number";
                q.options = buildNumericOptions(combo.whole);
                q.hint = `If ${combo.part} is ${combo.pct}%, then ${combo.part} \u00D7 ${multiplier} = ${combo.whole} (since ${combo.pct}% \u00D7 ${multiplier} = 100%).`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Find the Whole from a Percent</div>
                    <div style="font-size:1.2rem;margin-bottom:12px;">
                        <strong style="color:var(--accent-cyan);">${combo.part}</strong> is <strong style="color:var(--accent-orange);">${combo.pct}%</strong> of <strong style="color:var(--accent-green);">?</strong>
                    </div>
                    <div style="background:var(--bg-card);padding:12px 20px;border-radius:10px;display:inline-block;">
                        <div style="font-size:0.9rem;color:var(--text-dim);">Part \u00F7 Percent = Whole</div>
                        <div style="font-size:1.1rem;margin-top:4px;">${combo.part} \u00F7 ${combo.pct}% = ?</div>
                    </div>
                </div>`;
                q.printFormat = "percent-find-whole";
                q.skillLabel = "Find Whole from %";

            } else if (convSkill === "length_metric") {
                // Level 3: Length conversions (cm, m, km)
                const convType = pick(["cm_to_m", "m_to_cm", "m_to_km", "km_to_m", "mm_to_cm", "cm_to_mm"]);

                if (convType === "cm_to_m") {
                    const cm = pick([100, 200, 250, 300, 500, 150, 450]) ;
                    q.ans = cm / 100;
                    q.text = `Convert ${cm} cm to meters.`;
                    q.hint = `100 cm = 1 m. Divide by 100!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F4CF} ${cm} centimeters = ? meters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">100 cm = 1 m</div>
                    </div>`;
                } else if (convType === "m_to_cm") {
                    const m = pick([1, 2, 3, 4, 5, 1.5, 2.5, 3.5]);
                    q.ans = m * 100;
                    q.text = `Convert ${m} m to centimeters.`;
                    q.hint = `1 m = 100 cm. Multiply by 100!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F4CF} ${m} meters = ? centimeters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 m = 100 cm</div>
                    </div>`;
                } else if (convType === "m_to_km") {
                    const m = pick([1000, 2000, 3000, 5000, 500, 1500, 2500]);
                    q.ans = m / 1000;
                    q.text = `Convert ${m.toLocaleString()} m to kilometers.`;
                    q.hint = `1000 m = 1 km. Divide by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F6E3}\uFE0F ${m.toLocaleString()} meters = ? kilometers</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1000 m = 1 km</div>
                    </div>`;
                } else if (convType === "km_to_m") {
                    const km = pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5]);
                    q.ans = km * 1000;
                    q.text = `Convert ${km} km to meters.`;
                    q.hint = `1 km = 1000 m. Multiply by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F6E3}\uFE0F ${km} kilometers = ? meters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 km = 1000 m</div>
                    </div>`;
                } else if (convType === "mm_to_cm") {
                    const mm = pick([10, 20, 30, 50, 100, 25, 15, 45]);
                    q.ans = mm / 10;
                    q.text = `Convert ${mm} mm to centimeters.`;
                    q.hint = `10 mm = 1 cm. Divide by 10!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F4CF} ${mm} millimeters = ? centimeters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">10 mm = 1 cm</div>
                    </div>`;
                } else {
                    const cm = pick([1, 2, 3, 5, 10, 1.5, 2.5, 4.5]);
                    q.ans = cm * 10;
                    q.text = `Convert ${cm} cm to millimeters.`;
                    q.hint = `1 cm = 10 mm. Multiply by 10!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F4CF} ${cm} centimeters = ? millimeters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 cm = 10 mm</div>
                    </div>`;
                }
                q.options = buildNumericOptions(q.ans);
            } else if (convSkill === "mass_metric") {
                // Level 3: Mass conversions (g, kg)
                const convType = pick(["g_to_kg", "kg_to_g", "mg_to_g", "g_to_mg"]);

                if (convType === "g_to_kg") {
                    const g = pick([1000, 2000, 3000, 5000, 500, 1500, 2500, 250]);
                    q.ans = g / 1000;
                    q.text = `Convert ${g.toLocaleString()} g to kilograms.`;
                    q.hint = `1000 g = 1 kg. Divide by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u2696\uFE0F ${g.toLocaleString()} grams = ? kilograms</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1000 g = 1 kg</div>
                    </div>`;
                } else if (convType === "kg_to_g") {
                    const kg = pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5]);
                    q.ans = kg * 1000;
                    q.text = `Convert ${kg} kg to grams.`;
                    q.hint = `1 kg = 1000 g. Multiply by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u2696\uFE0F ${kg} kilograms = ? grams</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 kg = 1000 g</div>
                    </div>`;
                } else if (convType === "mg_to_g") {
                    const mg = pick([1000, 2000, 5000, 500, 100, 250]);
                    q.ans = mg / 1000;
                    q.text = `Convert ${mg.toLocaleString()} mg to grams.`;
                    q.hint = `1000 mg = 1 g. Divide by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u2696\uFE0F ${mg.toLocaleString()} milligrams = ? grams</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1000 mg = 1 g</div>
                    </div>`;
                } else {
                    const g = pick([1, 2, 3, 5, 0.5, 1.5, 2.5]);
                    q.ans = g * 1000;
                    q.text = `Convert ${g} g to milligrams.`;
                    q.hint = `1 g = 1000 mg. Multiply by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u2696\uFE0F ${g} grams = ? milligrams</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 g = 1000 mg</div>
                    </div>`;
                }
                q.options = buildNumericOptions(q.ans);
            } else if (convSkill === "time") {
                // Level 4: Time conversions
                const convType = pick(["min_to_sec", "hr_to_min", "sec_to_min", "min_to_hr", "days_to_hr", "hr_to_days"]);

                if (convType === "min_to_sec") {
                    const min = pick([1, 2, 3, 5, 10, 15, 1.5, 2.5]);
                    q.ans = min * 60;
                    q.text = `Convert ${min} minute${min !== 1 ? 's' : ''} to seconds.`;
                    q.hint = `1 minute = 60 seconds. Multiply by 60!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u23F1\uFE0F ${min} minute${min !== 1 ? 's' : ''} = ? seconds</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 min = 60 sec</div>
                    </div>`;
                } else if (convType === "hr_to_min") {
                    const hr = pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5]);
                    q.ans = hr * 60;
                    q.text = `Convert ${hr} hour${hr !== 1 ? 's' : ''} to minutes.`;
                    q.hint = `1 hour = 60 minutes. Multiply by 60!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u23F0 ${hr} hour${hr !== 1 ? 's' : ''} = ? minutes</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 hr = 60 min</div>
                    </div>`;
                } else if (convType === "sec_to_min") {
                    const sec = pick([60, 120, 180, 300, 600, 90, 150, 240]);
                    q.ans = sec / 60;
                    q.text = `Convert ${sec} seconds to minutes.`;
                    q.hint = `60 seconds = 1 minute. Divide by 60!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u23F1\uFE0F ${sec} seconds = ? minutes</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">60 sec = 1 min</div>
                    </div>`;
                } else if (convType === "min_to_hr") {
                    const min = pick([60, 120, 180, 240, 300, 30, 90, 150]);
                    q.ans = min / 60;
                    q.text = `Convert ${min} minutes to hours.`;
                    q.hint = `60 minutes = 1 hour. Divide by 60!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u23F0 ${min} minutes = ? hours</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">60 min = 1 hr</div>
                    </div>`;
                } else if (convType === "days_to_hr") {
                    const days = pick([1, 2, 3, 5, 7, 0.5]);
                    q.ans = days * 24;
                    q.text = `Convert ${days} day${days !== 1 ? 's' : ''} to hours.`;
                    q.hint = `1 day = 24 hours. Multiply by 24!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F4C5} ${days} day${days !== 1 ? 's' : ''} = ? hours</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 day = 24 hr</div>
                    </div>`;
                } else {
                    const hr = pick([24, 48, 72, 12, 36, 96, 120]);
                    q.ans = hr / 24;
                    q.text = `Convert ${hr} hours to days.`;
                    q.hint = `24 hours = 1 day. Divide by 24!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F4C5} ${hr} hours = ? days</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">24 hr = 1 day</div>
                    </div>`;
                }
                q.options = buildNumericOptions(q.ans);
            } else {
                // Default: fraction to decimal
                const conversionFractions = [
                    {n: 1, d: 2}, {n: 1, d: 4}, {n: 3, d: 4},
                    {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 5}, {n: 4, d: 5}
                ];
                const frac = pick(conversionFractions);
                const decimalAns = +(frac.n / frac.d).toFixed(2);
                q.text = `Convert to decimal: ${frac.n}/${frac.d}`;
                q.ans = decimalAns;
                q.options = buildNumericOptions(q.ans);
                q.hint = `Divide ${frac.n} by ${frac.d}`;
                q.visual = `<div style="text-align:center;">
                    ${fracHTML(frac.n, frac.d, 'xl')}
                    <span style="font-size:2rem;margin:0 15px;">\u2192</span>
                    <span style="font-size:1.5rem;color:var(--accent-green);">?</span>
                </div>`;
            }
            return;
}

export function generateDecimalsQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // Decimals Category
            const decSkill = mappedSkill === "mixed" ? pick(["add_decimal", "sub_decimal", "mult_decimal", "div_decimal", "compare_decimal", "order_decimal", "number_line_decimal", "order_decimals"]) : mappedSkill;

            // Helper to generate decimal numbers
            const genDecimal = (maxWhole, decPlaces) => {
                const whole = rng(0, maxWhole);
                const decimal = rng(1, Math.pow(10, decPlaces) - 1);
                return parseFloat(`${whole}.${decimal.toString().padStart(decPlaces, '0')}`);
            };

            // Use decimalPlaces setting when > 0, otherwise skill defaults
            const decPlaces = state.decimalPlaces > 0 ? state.decimalPlaces : 0;

            if (decSkill === "add_decimal") {
                // Adding decimals
                const places = decPlaces || pick([1, 2]);
                let a = genDecimal(range <= 100 ? 9 : 99, places);
                let b = genDecimal(range <= 100 ? 9 : 99, places);
                q.ans = parseFloat((a + b).toFixed(places));
                q.text = `${a} + ${b} = ?`;
                q.hint = `Line up the decimal points, then add!`;

                // Create column addition visual
                const maxLen = Math.max(a.toString().length, b.toString().length, q.ans.toString().length) + 1;
                const uniqueId = Date.now() + Math.random().toString(36).substr(2, 5);

                q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\u{1F522} Adding Decimals</div>
                    <div style="display:inline-block;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid var(--accent-green);">
                        <div style="text-align:right;font-size:1.3rem;">
                            <div style="margin-bottom:5px;letter-spacing:3px;">${a.toString().padStart(maxLen, ' ')}</div>
                            <div style="border-bottom:3px solid #444;padding-bottom:5px;letter-spacing:3px;">+ ${b.toString().padStart(maxLen - 2, ' ')}</div>
                        </div>
                        <div style="text-align:right;margin-top:8px;">
                            ${Array(maxLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-work-input" data-col="${uniqueId}-ans-${i}" style="width:24px;height:28px;border:1.5px solid var(--accent-green);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1.1rem;margin:0 1px;">`).join('')}
                        </div>
                    </div>
                    <div style="margin-top:10px;font-size:0.85rem;color:var(--text-dim);">\u{1F4A1} Line up the decimal points!</div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.decimalData = { a, b, op: '+', places };
                q.printFormat = "decimal-column-add";
            } else if (decSkill === "sub_decimal") {
                // Subtracting decimals
                const places = decPlaces || pick([1, 2]);
                let a = genDecimal(range <= 100 ? 9 : 99, places);
                let b = genDecimal(range <= 100 ? 9 : 99, places);
                if (b > a) [a, b] = [b, a]; // Ensure positive result
                q.ans = parseFloat((a - b).toFixed(places));
                q.text = `${a} - ${b} = ?`;
                q.hint = `Line up the decimal points, then subtract!`;

                const maxLen = Math.max(a.toString().length, b.toString().length, q.ans.toString().length) + 1;
                const uniqueId = Date.now() + Math.random().toString(36).substr(2, 5);

                q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\u{1F522} Subtracting Decimals</div>
                    <div style="display:inline-block;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid var(--accent-orange);">
                        <div style="text-align:right;font-size:1.3rem;">
                            <div style="margin-bottom:5px;letter-spacing:3px;">${a.toString().padStart(maxLen, ' ')}</div>
                            <div style="border-bottom:3px solid #444;padding-bottom:5px;letter-spacing:3px;">- ${b.toString().padStart(maxLen - 2, ' ')}</div>
                        </div>
                        <div style="text-align:right;margin-top:8px;">
                            ${Array(maxLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-work-input" data-col="${uniqueId}-ans-${i}" style="width:24px;height:28px;border:1.5px solid var(--accent-orange);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1.1rem;margin:0 1px;">`).join('')}
                        </div>
                    </div>
                    <div style="margin-top:10px;font-size:0.85rem;color:var(--text-dim);">\u{1F4A1} Line up the decimal points!</div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.decimalData = { a, b, op: '-', places };
                q.printFormat = "decimal-column-sub";
            } else if (decSkill === "mult_decimal") {
                // Multiplying decimals
                const places = decPlaces || pick([1, 2]);
                let a = genDecimal(range <= 100 ? 9 : 99, places);
                let b = rng(2, 9);
                q.ans = parseFloat((a * b).toFixed(places + 1));
                q.text = `${a} \u00D7 ${b} = ?`;
                q.hint = `Multiply as if whole numbers, then place the decimal!`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\u{1F522} Multiplying Decimals</div>
                    <div style="font-size:1.8rem;font-weight:700;margin:15px 0;">${a} \u00D7 ${b} = ?</div>
                    <div style="background:var(--bg-card);padding:12px;border-radius:8px;margin:10px auto;max-width:250px;">
                        <div style="font-size:0.9rem;color:var(--text-dim);">
                            <div>1\uFE0F\u20E3 Multiply: ${Math.round(a * Math.pow(10, places))} \u00D7 ${b} = ${Math.round(a * Math.pow(10, places)) * b}</div>
                            <div>2\uFE0F\u20E3 Count decimal places: ${places}</div>
                            <div>3\uFE0F\u20E3 Place decimal in answer</div>
                        </div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.decimalData = { a, b, op: '\u00D7', places };
                q.printFormat = "decimal-mult";
            } else if (decSkill === "div_decimal") {
                // Dividing decimals
                const places = decPlaces ? Math.min(decPlaces, 2) : 1;
                const divisor = pick([2, 4, 5, 10]);
                const quotient = genDecimal(range <= 100 ? 9 : 99, places);
                const dividend = parseFloat((quotient * divisor).toFixed(places + 1));
                q.ans = quotient;
                q.text = `${dividend} \u00F7 ${divisor} = ?`;
                q.hint = `Divide as normal, keeping track of the decimal!`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\u{1F522} Dividing Decimals</div>
                    <div style="font-size:1.8rem;font-weight:700;margin:15px 0;">${dividend} \u00F7 ${divisor} = ?</div>
                    <div style="background:var(--bg-card);padding:12px;border-radius:8px;margin:10px auto;max-width:200px;font-family:monospace;">
                        <div style="display:flex;align-items:center;justify-content:center;gap:5px;">
                            <span style="font-size:1.3rem;">${divisor}</span>
                            <span style="border-left:2px solid currentColor;border-top:2px solid currentColor;padding:5px 10px;font-size:1.3rem;">${dividend}</span>
                        </div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.decimalData = { dividend, divisor, quotient };
                q.printFormat = "decimal-div";
            } else if (decSkill === "compare_decimal" && Math.random() < 0.30) {
                const places = decPlaces || pick([1, 2]);
                const maxW = range <= 100 ? 9 : 99;
                const threshold = genDecimal(maxW, places);
                const direction = pick(['greater', 'less']);
                const correctCount = randInt(2, 4);
                const totalCount = randInt(6, 8);
                const candidates = new Set();
                let safety = 0;
                while (candidates.size < correctCount && safety < 200) {
                    safety++;
                    const v = genDecimal(maxW, places);
                    if (v === threshold) continue;
                    if (direction === 'greater' ? v > threshold : v < threshold) candidates.add(v);
                }
                safety = 0;
                while (candidates.size < totalCount && safety < 400) {
                    safety++;
                    const v = genDecimal(maxW, places);
                    if (v === threshold) continue;
                    candidates.add(v);
                }
                const arr = shuffle(Array.from(candidates));
                const options = arr.map((v, i) => ({
                    id: 'opt' + i,
                    label: String(v),
                    correct: direction === 'greater' ? v > threshold : v < threshold
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                if (ans.length === 0 || ans.length === options.length) {
                    // Fallback: ensure at least one of each by toggling threshold
                    options.forEach((o, i) => { o.correct = i < Math.ceil(options.length / 2); });
                    const newAns = options.filter(o => o.correct).map(o => o.id);
                    q.ans = newAns;
                } else {
                    q.ans = ans;
                }
                q.text = `Click ALL the decimals ${direction === 'greater' ? 'greater than' : 'less than'} ${threshold}.`;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Compare digit by digit from left to right.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Compare Decimals';
                return;
            } else if (decSkill === "compare_decimal") {
                // Comparing decimals
                const places = decPlaces || pick([1, 2, 3]);
                const maxW = range <= 100 ? 9 : 99;
                let a = genDecimal(maxW, places);
                let b = genDecimal(maxW, places);
                while (a === b) b = genDecimal(maxW, places);

                const correctSymbol = a > b ? ">" : a < b ? "<" : "=";
                q.text = `Compare: ${a} ___ ${b}`;
                q.ans = correctSymbol;
                q.answerType = "choice";
                q.hint = `Compare digit by digit from left to right!`;
                q.options = [">", "<", "="];

                // Create visual comparison with place value grid
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\u{1F522} Compare Decimals</div>
                    <div style="font-size:2rem;margin:20px 0;">
                        <span style="color:var(--accent-green);font-weight:700;">${a}</span>
                        <span style="margin:0 15px;border:2px dashed var(--text-dim);padding:5px 15px;border-radius:8px;">?</span>
                        <span style="color:var(--accent-orange);font-weight:700;">${b}</span>
                    </div>
                    <div style="display:flex;justify-content:center;gap:10px;margin-top:15px;">
                        <div style="padding:8px 20px;background:var(--bg-card);border-radius:8px;font-size:1.2rem;">></div>
                        <div style="padding:8px 20px;background:var(--bg-card);border-radius:8px;font-size:1.2rem;"><</div>
                        <div style="padding:8px 20px;background:var(--bg-card);border-radius:8px;font-size:1.2rem;">=</div>
                    </div>
                </div>`;
                q.decimalData = { a, b, answer: correctSymbol };
                q.printFormat = "decimal-compare";
            } else if (decSkill === "order_decimal") {
                // Ordering decimals
                const count = pick([4, 5]);
                const places = decPlaces || pick([1, 2]);
                const maxW = range <= 100 ? 9 : 99;
                let nums = [];
                for (let i = 0; i < count; i++) {
                    let n = genDecimal(maxW, places);
                    while (nums.includes(n)) n = genDecimal(maxW, places);
                    nums.push(n);
                }
                const sorted = [...nums].sort((x, y) => x - y);
                const direction = pick(["asc", "desc"]);
                const answer = direction === "asc" ? sorted : sorted.reverse();

                q.text = `Order from ${direction === "asc" ? "least to greatest" : "greatest to least"}: ${nums.join(", ")}`;
                q.ans = answer.join(", ");
                q.answerType = "text";
                q.hint = `Compare decimal values carefully!`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\u{1F522} Order Decimals</div>
                    <div style="font-size:0.9rem;margin-bottom:15px;">${direction === "asc" ? "Smallest \u2192 Largest" : "Largest \u2192 Smallest"}</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:15px 0;">
                        ${nums.map(n => `<div style="padding:10px 15px;background:var(--bg-card);border-radius:8px;font-size:1.2rem;font-weight:600;">${n}</div>`).join('')}
                    </div>
                    <div style="margin-top:15px;display:flex;justify-content:center;gap:5px;align-items:center;">
                        ${Array(count).fill(0).map((_, i) => `<input type="text" style="width:50px;height:35px;border:2px solid var(--accent-green);border-radius:6px;text-align:center;font-size:1rem;" placeholder="${i + 1}">`).join('<span style="font-size:1.2rem;"> \u2192 </span>')}
                    </div>
                </div>`;
                q.decimalData = { nums, sorted: answer, direction };
                q.printFormat = "decimal-order";
            } else if (decSkill === "order_decimals") {
                // Grade 5: Interactive ordering of 4-5 decimal numbers (click-to-order)
                const odCount = pick([4, 5]);
                const odPlaces = decPlaces || pick([1, 2, 3]);
                const odMaxW = range <= 100 ? 9 : 99;
                let odNums = [];
                for (let i = 0; i < odCount; i++) {
                    let n = genDecimal(odMaxW, odPlaces);
                    let odAttempts = 0;
                    while (odNums.includes(n) && odAttempts < 50) {
                        n = genDecimal(odMaxW, odPlaces);
                        odAttempts++;
                    }
                    odNums.push(n);
                }
                const odDirection = pick(["asc", "desc"]);
                const odSorted = [...odNums].sort((x, y) => x - y);
                const odAnswer = odDirection === "asc" ? odSorted : [...odSorted].reverse();
                const odItems = odNums.map(String);
                const odCorrect = odAnswer.map(String);

                q.text = `Order from ${odDirection === "asc" ? "least to greatest" : "greatest to least"}:`;
                q.ans = odCorrect.join(",");
                q.answerType = "interactive";
                q.interactiveType = "ordering";
                q.orderMode = "click";
                q.orderDirection = odDirection;
                q.orderIcon = odDirection === "asc" ? "Least \u2192 Greatest" : "Greatest \u2192 Least";
                q.numbers = odItems;
                q.sortedNumbers = odCorrect;
                q.hint = `Line up the decimal points and compare place by place, from left to right.`;
                q.options = [];
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Order Decimals</div>
                    <div style="font-size:0.9rem;margin-bottom:10px;">${odDirection === "asc" ? "Least \u2192 Greatest" : "Greatest \u2192 Least"}</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin:15px 0;">
                        ${odNums.map(n => `<div style="padding:10px 16px;background:var(--bg-card);border:2px solid var(--accent-cyan);border-radius:10px;font-size:1.3rem;font-weight:600;">${n}</div>`).join('')}
                    </div>
                </div>`;
                q.printFormat = "decimal-order";
                q.skillLabel = "Order Decimals";
            } else if (decSkill === "number_line_decimal") {
                // Decimals on number line
                const wholeStart = rng(0, 5);
                const wholeEnd = wholeStart + 1;
                const targetDecimal = parseFloat((wholeStart + (rng(1, 9) / 10)).toFixed(1));

                q.text = `What decimal is shown on the number line?`;
                q.ans = targetDecimal;
                q.hint = `Count the tick marks between ${wholeStart} and ${wholeEnd}!`;

                // Create SVG number line
                const tickPosition = ((targetDecimal - wholeStart) / (wholeEnd - wholeStart)) * 100;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\u{1F522} Decimals on Number Line</div>
                    <svg width="320" height="80" viewBox="0 0 320 80" style="max-width:100%;">
                        <!-- Main line -->
                        <line x1="20" y1="40" x2="300" y2="40" stroke="currentColor" stroke-width="3"/>
                        <!-- End caps -->
                        <line x1="20" y1="30" x2="20" y2="50" stroke="currentColor" stroke-width="3"/>
                        <line x1="300" y1="30" x2="300" y2="50" stroke="currentColor" stroke-width="3"/>
                        <!-- Tick marks for tenths -->
                        ${Array(11).fill(0).map((_, i) => {
                            const x = 20 + (i * 28);
                            const isMajor = i === 0 || i === 10;
                            return `<line x1="${x}" y1="${isMajor ? 30 : 35}" x2="${x}" y2="${isMajor ? 50 : 45}" stroke="currentColor" stroke-width="${isMajor ? 2 : 1}"/>`;
                        }).join('')}
                        <!-- Labels -->
                        <text x="20" y="70" text-anchor="middle" fill="currentColor" font-size="14">${wholeStart}</text>
                        <text x="300" y="70" text-anchor="middle" fill="currentColor" font-size="14">${wholeEnd}</text>
                        <!-- Arrow pointing to target -->
                        <polygon points="${20 + tickPosition * 2.8 - 8},20 ${20 + tickPosition * 2.8 + 8},20 ${20 + tickPosition * 2.8},32" fill="var(--accent-green)"/>
                        <text x="${20 + tickPosition * 2.8}" y="12" text-anchor="middle" fill="var(--accent-green)" font-size="12" font-weight="bold">?</text>
                    </svg>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.decimalData = { wholeStart, wholeEnd, target: targetDecimal };
                q.printFormat = "decimal-number-line";
            }
            return;
}
