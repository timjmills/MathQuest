// gen-number-theory.js - Number Theory: factors, primes, GCF, LCM, divisibility
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';
import { createFactorLinksSVG } from './svg-factors.js';
import { COLORS, STROKE, FONTS, softFill, categoricalFill } from './design-tokens.js';

const STUDENT_DEF_PRIME_COMPOSITE = `<div class="student-def"><strong>Prime</strong> = a number with exactly 2 factors: 1 and itself (like 2, 3, 5, 7). <strong>Composite</strong> = a number with more than 2 factors (like 4, 6, 8, 9). Note: 1 is neither prime nor composite.</div>`;
const STUDENT_DEF_PRIME = `<div class="student-def"><strong>Prime</strong> = a number with exactly 2 factors: 1 and itself (like 2, 3, 5, 7).</div>`;

export function generateNumberTheoryQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;
            // Number Theory Category - Enhanced with multi-number classification
            const ntMax = Math.max(10, Math.min(range, 200));
            const ntSkill = mappedSkill === "mixed" ? pick(["prime_composite", "factors_identify", "factor_tchart_easy", "factor_tchart_medium", "factor_tchart_hard", "factor_links_easy", "factor_links_medium", "factor_links_hard", "multiples", "gcf_easy", "gcf_hard", "lcm", "divisibility", "divisibility_sort", "even_odd"]) : mappedSkill;

            // Helper function to get all factors
            const getFactors = (n) => {
                const factors = [];
                for (let i = 1; i <= n; i++) {
                    if (n % i === 0) factors.push(i);
                }
                return factors;
            };

            // Helper to get factor pairs
            const getFactorPairs = (n) => {
                const pairs = [];
                for (let i = 1; i <= Math.sqrt(n); i++) {
                    if (n % i === 0) pairs.push([i, n / i]);
                }
                return pairs;
            };

            // Helper to check if prime
            const isPrimeNum = (n) => {
                if (n < 2) return false;
                for (let i = 2; i <= Math.sqrt(n); i++) {
                    if (n % i === 0) return false;
                }
                return true;
            };

            if (ntSkill === "prime_composite" && Math.random() < 0.25) {
                // Phase 4.5 batch 10: dnd-categorize variant — sort 6 numbers (5-30) into Prime / Composite bins
                const allPrimesDnd = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
                const allCompDnd = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28];
                const primesDnd = allPrimesDnd.filter(n => n <= ntMax && n >= 2);
                const compDnd = allCompDnd.filter(n => n <= ntMax && n >= 4);
                const numPrimesDnd = rng(2, 4);
                const numCompDnd = 6 - numPrimesDnd;
                const chosenPrimesDnd = shuffle([...primesDnd]).slice(0, Math.min(numPrimesDnd, primesDnd.length));
                const chosenCompDnd = shuffle([...compDnd]).slice(0, Math.min(numCompDnd, compDnd.length));
                const chosenAllDnd = shuffle([...chosenPrimesDnd, ...chosenCompDnd]);
                const tiles = chosenAllDnd.map((n, i) => ({ id: 't' + i, label: String(n) }));
                const bins = [
                    { id: 'prime', label: 'Prime' },
                    { id: 'composite', label: 'Composite' }
                ];
                const ans = {};
                chosenAllDnd.forEach((n, i) => { ans['t' + i] = chosenPrimesDnd.includes(n) ? 'prime' : 'composite'; });
                q.text = 'Sort each number into Prime or Composite.';
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'categorize';
                q.tiles = tiles;
                q.bins = bins;
                q.visual = STUDENT_DEF_PRIME_COMPOSITE;
                q.hint = 'Prime numbers have exactly 2 factors (1 and itself). Composite numbers have more than 2 factors.';
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Prime vs Composite';
                return;
            }
            if (ntSkill === "prime_composite" && Math.random() < 0.35) {
                const allPrimesMSC = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
                const allCompMSC = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50, 51, 52, 54, 55, 56, 57, 58, 60];
                const primesPool = allPrimesMSC.filter(n => n <= ntMax);
                const compPool = allCompMSC.filter(n => n <= ntMax);
                const correctCount = Math.min(primesPool.length, randInt(3, 4));
                const wrongCount = randInt(3, 5);
                const chosenPrimes = shuffle([...primesPool]).slice(0, correctCount);
                const chosenComp = shuffle([...compPool]).slice(0, wrongCount);
                const all = shuffle([...chosenPrimes, ...chosenComp]);
                const options = all.map((n, i) => ({
                    id: 'opt' + i,
                    label: String(n),
                    correct: chosenPrimes.includes(n)
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL the prime numbers.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.visual = STUDENT_DEF_PRIME;
                q.hint = `Prime numbers have exactly two factors: 1 and themselves.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Primes';
                return;
            } else if (ntSkill === "prime_composite") {
                // Enhanced: Multiple problem types
                const problemType = pick(["classify_list", "compare_two", "single"]);

                if (problemType === "classify_list") {
                    // Sort 6-8 numbers into prime or composite
                    const count = rng(6, 8);
                    const allPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
                    const allComposites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50, 51, 52, 54, 55, 56, 57, 58, 60, 62, 63, 64, 65, 66, 68, 69, 70, 72, 74, 75, 76, 77, 78, 80];
                    const primes = allPrimes.filter(n => n <= ntMax);
                    const composites = allComposites.filter(n => n <= ntMax);

                    const numPrimes = rng(2, Math.min(4, count - 2));
                    const numComposites = count - numPrimes;

                    const selectedPrimes = [];
                    const selectedComposites = [];
                    while (selectedPrimes.length < numPrimes) {
                        const p = pick(primes);
                        if (!selectedPrimes.includes(p)) selectedPrimes.push(p);
                    }
                    while (selectedComposites.length < numComposites) {
                        const c = pick(composites);
                        if (!selectedComposites.includes(c)) selectedComposites.push(c);
                    }

                    const allNums = [...selectedPrimes, ...selectedComposites].sort(() => Math.random() - 0.5);

                    // Use the dnd-generic widget (same as the smaller-N variant
                    // above) so students drag each number into the matching bin.
                    // Previous "classification" answerType only toggled a CSS
                    // class on click — no real sort, no validation, no advance.
                    const tiles = allNums.map((n, i) => ({ id: 't' + i, label: String(n) }));
                    const bins = [
                        { id: 'prime',     label: 'Prime',     subtitle: '2 factors only' },
                        { id: 'composite', label: 'Composite', subtitle: '3+ factors' }
                    ];
                    const ans = {};
                    allNums.forEach((n, i) => { ans['t' + i] = selectedPrimes.includes(n) ? 'prime' : 'composite'; });

                    q.text = `Sort these numbers into prime or composite:`;
                    q.ans = ans;
                    q.answerType = 'dnd-generic';
                    q.dndMode = 'categorize';
                    q.tiles = tiles;
                    q.bins = bins;
                    q.visual = STUDENT_DEF_PRIME_COMPOSITE;
                    q.options = [];
                    q.hint = `Prime numbers have exactly 2 factors (1 and itself). Composite numbers have more than 2 factors.`;
                    q.skillLabel = 'Prime vs Composite';
                    q.numberTheoryData = {
                        allNums,
                        primes: selectedPrimes,
                        composites: selectedComposites,
                        type: 'prime_composite_classify'
                    };
                    q.printFormat = 'dnd-generic';
                } else if (problemType === "compare_two") {
                    // Compare two numbers with justification
                    const allPrimesComp = [7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
                    const allCompositesComp = [12, 15, 18, 20, 21, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50, 51, 52, 54, 55, 56, 57, 58, 60];
                    const primes = allPrimesComp.filter(n => n <= ntMax);
                    const composites = allCompositesComp.filter(n => n <= ntMax);

                    const prime = pick(primes);
                    const composite = pick(composites);
                    const nums = Math.random() < 0.5 ? [prime, composite] : [composite, prime];
                    const factorPairs = getFactorPairs(composite);

                    q.text = `Which number is composite? ${nums[0]} or ${nums[1]}. Explain why.`;
                    q.ans = composite;
                    q.hint = `A composite number can be divided evenly by numbers other than 1 and itself.`;

                    q.visual = `${STUDENT_DEF_PRIME_COMPOSITE}<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Prime vs Composite - Compare & Justify</div>
                        <div style="display:flex;justify-content:center;gap:40px;margin:25px 0;">
                            <div style="text-align:center;padding:20px 30px;background:var(--bg-card);border-radius:12px;border:3px solid var(--text-dim);cursor:pointer;"
                                 onclick="this.style.borderColor='var(--accent-green)';this.nextElementSibling.style.borderColor='var(--text-dim)';">
                                <div style="font-size:2.5rem;font-weight:700;">${nums[0]}</div>
                            </div>
                            <div style="text-align:center;padding:20px 30px;background:var(--bg-card);border-radius:12px;border:3px solid var(--text-dim);cursor:pointer;"
                                 onclick="this.style.borderColor='var(--accent-green)';this.previousElementSibling.style.borderColor='var(--text-dim)';">
                                <div style="font-size:2.5rem;font-weight:700;">${nums[1]}</div>
                            </div>
                        </div>
                        <div style="background:var(--bg-card);padding:15px;border-radius:10px;margin:15px auto;max-width:350px;">
                            <div style="font-weight:600;margin-bottom:10px;">Justify your answer:</div>
                            <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:8px;"><span class="answer-blank-inline"></span> is composite because:</div>
                            <div style="display:flex;gap:10px;justify-content:center;align-items:center;">
                                <input type="text" style="width:40px;height:35px;border:2px solid var(--accent-cyan);border-radius:6px;text-align:center;font-size:1.1rem;background:var(--bg-card-light);" placeholder="?">
                                <span style="font-size:1.3rem;">×</span>
                                <input type="text" style="width:40px;height:35px;border:2px solid var(--accent-cyan);border-radius:6px;text-align:center;font-size:1.1rem;background:var(--bg-card-light);" placeholder="?">
                                <span style="font-size:1.3rem;">=</span>
                                <span style="font-size:1.3rem;font-weight:700;">${composite}</span>
                            </div>
                        </div>
                    </div>`;
                    q.options = [nums[0], nums[1]];
                    q.numberTheoryData = {
                        nums,
                        prime,
                        composite,
                        factorPairs,
                        type: 'prime_composite_compare'
                    };
                    q.printFormat = "nt-prime-compare";
                } else {
                    // Single number classification
                    const allPrimesSingle = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
                    const allCompositesSingle = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50];
                    const primes = allPrimesSingle.filter(n => n <= ntMax);
                    const composites = allCompositesSingle.filter(n => n <= ntMax);
                    const isPrime = Math.random() < 0.5;
                    const num = isPrime ? pick(primes) : pick(composites);

                    q.text = `Is ${num} prime or composite?`;
                    q.ans = isPrime ? "Prime" : "Composite";
                    q.answerType = "choice";
                    q.options = ["Prime", "Composite"];
                    q.hint = `Prime = only divisible by 1 and itself. Composite = has more factors`;

                    q.visual = `${STUDENT_DEF_PRIME_COMPOSITE}<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Prime or Composite?</div>
                        <div style="font-size:3rem;font-weight:700;margin:20px 0;">${num}</div>
                    </div>`;
                    q.numberTheoryData = { num, isPrime, type: 'prime_composite' };
                    q.printFormat = "nt-prime";
                }
            } else if (ntSkill === "factors_identify" || ntSkill === "factors") {
                // Identify Factors - Fill-in-the-blanks factor pair list (rainbow style)
                // Show ALL factor pairs vertically; pre-fill most cells; leave at most 4 blanks.
                const allTargetNums = [12, 16, 18, 20, 24, 30, 36, 40, 48, 56, 60, 72, 80, 90, 100];
                const targetNums = allTargetNums.filter(n => n <= ntMax);
                const num = pick(targetNums.length ? targetNums : [12]);
                const allFactors = getFactors(num);
                const factorPairs = getFactorPairs(num); // [[a,b], ...]

                // Decide which pair indices get a blank, and which side (L/R) of each.
                // Cap blanks at 4 total; for tiny pair lists keep at least 1.
                const maxBlanks = Math.min(4, factorPairs.length);
                const minBlanks = Math.min(maxBlanks, factorPairs.length === 1 ? 1 : 2);
                const numBlanks = Math.max(minBlanks, Math.min(maxBlanks, factorPairs.length));
                const pairIdx = factorPairs.map((_, i) => i);
                const shuffledIdx = shuffle([...pairIdx]).slice(0, numBlanks);

                // For each chosen pair, flip a coin to pick L or R. Special case:
                // perfect-square pairs (a === b) — only one blank possible (either side
                // shows the same number); pick L for consistency, but it doesn't matter.
                const blankSpec = shuffledIdx.map(i => ({
                    pairIdx: i,
                    side: (factorPairs[i][0] === factorPairs[i][1]) ? 'L' : (Math.random() < 0.5 ? 'L' : 'R')
                })).sort((a, b) => a.pairIdx - b.pairIdx);

                // Fast lookup: blankAt[pairIdx][side] = true
                const blankAt = {};
                blankSpec.forEach(b => {
                    if (!blankAt[b.pairIdx]) blankAt[b.pairIdx] = {};
                    blankAt[b.pairIdx][b.side] = true;
                });

                // Build the answer list IN DOM ORDER (top-to-bottom, L before R per row).
                // Used by answer-check; also stored on q.factorPairData.blanks.
                const blanks = [];
                factorPairs.forEach((pair, i) => {
                    if (blankAt[i] && blankAt[i].L) blanks.push({ pairIdx: i, side: 'L', answer: pair[0] });
                    if (blankAt[i] && blankAt[i].R) blanks.push({ pairIdx: i, side: 'R', answer: pair[1] });
                });

                q.text = `Fill in the missing factors of ${num}:`;
                q.ans = blanks.map(b => b.answer).join(', ');
                q.answerType = 'factor-pairs';
                q.hint = `Each row is a factor pair: a × b = ${num}. If you know one factor, divide ${num} by it to find the other.`;
                q.printFormat = 'factor-pairs';
                q.skillLabel = 'Factors';

                // Build the visual grid.
                const rows = factorPairs.map((pair, i) => {
                    const leftIsBlank = !!(blankAt[i] && blankAt[i].L);
                    const rightIsBlank = !!(blankAt[i] && blankAt[i].R);
                    const leftHTML = leftIsBlank
                        ? `<input type="text" inputmode="numeric" class="fp-input" data-pair="${i}" data-side="L" data-answer="${pair[0]}" placeholder="?" autocomplete="off">`
                        : `<span class="fp-fixed">${pair[0]}</span>`;
                    const rightHTML = rightIsBlank
                        ? `<input type="text" inputmode="numeric" class="fp-input" data-pair="${i}" data-side="R" data-answer="${pair[1]}" placeholder="?" autocomplete="off">`
                        : `<span class="fp-fixed">${pair[1]}</span>`;
                    return `<div class="fp-row">${leftHTML}<span class="fp-x">×</span>${rightHTML}</div>`;
                }).join('');

                q.visual = `<div class="fp-wrap">
                    <div class="fp-title">Fill in the missing factors of <b>${num}</b></div>
                    <div class="fp-grid">${rows}</div>
                    <div class="fp-actions"><button type="button" class="fp-submit-btn" onclick="window.submitFactorPairs && window.submitFactorPairs()">Check Answer</button></div>
                </div>`;

                q.factorPairData = {
                    num,
                    pairs: factorPairs,
                    blanks
                };
                q.numberTheoryData = {
                    num,
                    factors: allFactors,
                    factorPairs,
                    blanks,
                    type: 'factors_identify'
                };

            } else if (ntSkill === "factor_tchart_easy") {
                // Factor T-Chart EASY - with factor bank only
                const allTchartEasy = [12, 16, 18, 20, 24, 30, 36, 40, 42, 48];
                const filteredTchartEasy = allTchartEasy.filter(n => n <= ntMax);
                const num = pick(filteredTchartEasy.length ? filteredTchartEasy : [12]);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                const scrambledFactors = [...allFactors].sort(() => Math.random() - 0.5);

                q.text = `Build a Factor T-Chart for ${num}. Type pairs into the rows in any order — both cells turn green when a pair is correct.`;
                q.ans = factorPairs.map(p => `${p[0]} × ${p[1]}`).join(", ");
                q.answerType = "tchart-cells";
                q.hint = `Each row holds one factor pair: a × b = ${num}. Use the bank for hints.`;

                q.visual = `<div style="text-align:center;" data-tchart-target="${num}">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-green);">Factor T-Chart for ${num}</div>
                    <div style="display:flex;justify-content:center;align-items:flex-start;gap:30px;flex-wrap:wrap;">
                        <!-- T-Chart -->
                        <div style="display:inline-block;">
                            <div style="font-size:1.8rem;font-weight:700;border-bottom:3px solid ${COLORS.axis};padding-bottom:8px;margin-bottom:5px;text-align:center;font-family:${FONTS.sans};">${num}</div>
                            <div style="display:flex;border-left:3px solid var(--accent-green);">
                                <div style="min-width:70px;border-right:3px solid var(--accent-green);">
                                    ${factorPairs.map((_, i) => `<div class="tc-cell" style="height:42px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--text-dim);">
                                        <input type="text" class="tc-input" data-row="${i}" data-side="left" inputmode="numeric" autocomplete="off" placeholder="">
                                    </div>`).join('')}
                                </div>
                                <div style="min-width:70px;">
                                    ${factorPairs.map((_, i) => `<div class="tc-cell" style="height:42px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--text-dim);">
                                        <input type="text" class="tc-input" data-row="${i}" data-side="right" inputmode="numeric" autocomplete="off" placeholder="">
                                    </div>`).join('')}
                                </div>
                            </div>
                        </div>
                        <!-- Factor Bank -->
                        <div style="background:${softFill(COLORS.fill[1])};padding:15px;border-radius:10px;border:2px solid ${COLORS.fill[1]};">
                            <div style="font-weight:700;color:${COLORS.fill[1]};margin-bottom:10px;font-family:${FONTS.sans};">Factor Bank</div>
                            <div style="font-size:0.85rem;color:${COLORS.textMuted};margin-bottom:10px;font-family:${FONTS.sans};">Use each factor once:</div>
                            <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
                                ${scrambledFactors.map(f => `<span style="padding:8px 14px;background:white;border:2px solid ${COLORS.fill[1]};border-radius:6px;font-weight:600;font-size:1.1rem;font-family:${FONTS.sans};">${f}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:15px;font-size:0.9rem;color:var(--text-dim);">
                        Each row holds one factor pair: a × b = ${num}
                    </div>
                </div>`;
                q.numberTheoryData = {
                    num,
                    factorPairs,
                    allFactors,
                    bankFactors: scrambledFactors,
                    type: 'factor_tchart_easy'
                };
                q.printFormat = "nt-factor-tchart-easy";

            } else if (ntSkill === "factor_tchart_medium") {
                // Factor T-Chart MEDIUM - factor bank + 3 distractors
                const allTchartMed = [18, 20, 24, 30, 36, 40, 48, 56, 60];
                const filteredTchartMed = allTchartMed.filter(n => n <= ntMax);
                const num = pick(filteredTchartMed.length ? filteredTchartMed : [18]);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);

                // Add 3 distractor numbers (non-factors)
                const distractors = [];
                for (let i = 2; i <= num; i++) {
                    if (num % i !== 0 && distractors.length < 3) {
                        distractors.push(i);
                    }
                }
                const bankWithDistractors = [...allFactors, ...distractors].sort(() => Math.random() - 0.5);

                q.text = `Build a Factor T-Chart for ${num}. Type pairs into the rows in any order — both cells turn green when a pair is correct.`;
                q.ans = factorPairs.map(p => `${p[0]} × ${p[1]}`).join(", ");
                q.answerType = "tchart-cells";
                q.hint = `Not all numbers in the bank are factors! Check: Does ${num} ÷ number = whole number?`;

                q.visual = `<div style="text-align:center;" data-tchart-target="${num}">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-yellow);">Factor T-Chart for ${num}</div>
                    <div style="display:flex;justify-content:center;align-items:flex-start;gap:30px;flex-wrap:wrap;">
                        <!-- T-Chart -->
                        <div style="display:inline-block;">
                            <div style="font-size:1.8rem;font-weight:700;border-bottom:3px solid ${COLORS.axis};padding-bottom:8px;margin-bottom:5px;text-align:center;font-family:${FONTS.sans};">${num}</div>
                            <div style="display:flex;border-left:3px solid ${COLORS.fill[2]};">
                                <div style="min-width:70px;border-right:3px solid ${COLORS.fill[2]};">
                                    ${factorPairs.map((_, i) => `<div class="tc-cell" style="height:42px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--text-dim);">
                                        <input type="text" class="tc-input" data-row="${i}" data-side="left" inputmode="numeric" autocomplete="off" placeholder="">
                                    </div>`).join('')}
                                </div>
                                <div style="min-width:70px;">
                                    ${factorPairs.map((_, i) => `<div class="tc-cell" style="height:42px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--text-dim);">
                                        <input type="text" class="tc-input" data-row="${i}" data-side="right" inputmode="numeric" autocomplete="off" placeholder="">
                                    </div>`).join('')}
                                </div>
                            </div>
                        </div>
                        <!-- Factor Bank with distractors -->
                        <div style="background:${softFill(COLORS.fill[2])};padding:15px;border-radius:10px;border:2px solid ${COLORS.fill[2]};">
                            <div style="font-weight:700;color:${COLORS.fill[2]};margin-bottom:10px;font-family:${FONTS.sans};">Number Bank</div>
                            <div style="font-size:0.85rem;color:${COLORS.textMuted};margin-bottom:10px;font-family:${FONTS.sans};">Some are NOT factors!</div>
                            <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
                                ${bankWithDistractors.map(f => `<span style="padding:8px 14px;background:white;border:2px solid ${COLORS.fill[2]};border-radius:6px;font-weight:600;font-size:1.1rem;font-family:${FONTS.sans};">${f}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:15px;font-size:0.9rem;color:var(--text-dim);">
                        Note: Watch out! Not all numbers are factors of ${num}
                    </div>
                </div>`;
                q.numberTheoryData = {
                    num,
                    factorPairs,
                    allFactors,
                    distractors,
                    bankFactors: bankWithDistractors,
                    type: 'factor_tchart_medium'
                };
                q.printFormat = "nt-factor-tchart-medium";

            } else if (ntSkill === "factor_tchart_hard") {
                // Factor T-Chart HARD - NO factor bank
                const allTchartHard = [24, 30, 36, 40, 42, 48, 56, 60, 72, 80, 90, 100];
                const filteredTchartHard = allTchartHard.filter(n => n <= ntMax);
                const num = pick(filteredTchartHard.length ? filteredTchartHard : [24]);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);

                q.text = `Build a Factor T-Chart for ${num}. Type pairs into the rows in any order — both cells turn green when a pair is correct.`;
                q.ans = factorPairs.map(p => `${p[0]} × ${p[1]}`).join(", ");
                q.answerType = "tchart-cells";
                q.hint = `Start with 1 × ${num}, then try 2, 3, 4... Does it divide evenly?`;

                q.visual = `<div style="text-align:center;" data-tchart-target="${num}">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-orange);">Factor T-Chart for ${num}</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:15px;">Find ALL the factor pairs (no number bank!)</div>
                    <div style="display:inline-block;">
                        <div style="font-size:2rem;font-weight:700;border-bottom:3px solid ${COLORS.axis};padding-bottom:8px;margin-bottom:5px;text-align:center;font-family:${FONTS.sans};">${num}</div>
                        <div style="display:flex;border-left:3px solid var(--accent-orange);">
                            <div style="min-width:80px;border-right:3px solid var(--accent-orange);">
                                ${factorPairs.map((_, i) => `<div class="tc-cell" style="height:42px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--text-dim);">
                                    <input type="text" class="tc-input" data-row="${i}" data-side="left" inputmode="numeric" autocomplete="off" placeholder="">
                                </div>`).join('')}
                            </div>
                            <div style="min-width:80px;">
                                ${factorPairs.map((_, i) => `<div class="tc-cell" style="height:42px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--text-dim);">
                                    <input type="text" class="tc-input" data-row="${i}" data-side="right" inputmode="numeric" autocomplete="off" placeholder="">
                                </div>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:20px;padding:12px;background:${softFill(COLORS.primary)};border-radius:8px;border-left:4px solid ${COLORS.primary};">
                        <div style="font-size:0.9rem;color:${COLORS.primaryDark};font-family:${FONTS.sans};">
                            <b>Strategy:</b> Start with 1 × ${num}, then check: Does 2 divide evenly? Does 3? Keep going until you reach √${num} ≈ ${Math.floor(Math.sqrt(num))}
                        </div>
                    </div>
                </div>`;
                q.numberTheoryData = {
                    num,
                    factorPairs,
                    allFactors,
                    type: 'factor_tchart_hard'
                };
                q.printFormat = "nt-factor-tchart-hard";

            } else if (ntSkill === "factor_links_easy") {
                // Factor Links EASY - with factor bank
                const allLinksEasy = [12, 16, 18, 20, 24, 30, 36, 40, 42, 48];
                const filteredLinksEasy = allLinksEasy.filter(n => n <= ntMax);
                const num = pick(filteredLinksEasy.length ? filteredLinksEasy : [12]);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                const scrambledFactors = [...allFactors].sort(() => Math.random() - 0.5);

                let inputsHTML = '';
                for (let i = 0; i < factorPairs.length; i++) {
                    // Each pair gets a distinct token-palette hue that matches the arc in the links SVG.
                    const color = categoricalFill(i);
                    const pair = factorPairs[i];
                    inputsHTML += `
                        <div class="links-pair" style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:8px;">
                            <input type="text" class="links-input" data-answer="${pair[0]}"
                                style="width:45px;height:34px;border:3px solid ${color};border-radius:8px;text-align:center;font-size:1rem;font-weight:600;background:white;font-family:${FONTS.sans};"
                                placeholder="?" oninput="checkLinksInput(this)">
                            <span style="color:${color};font-weight:700;font-size:1.1rem;font-family:${FONTS.sans};">×</span>
                            <input type="text" class="links-input" data-answer="${pair[1]}"
                                style="width:45px;height:34px;border:3px solid ${color};border-radius:8px;text-align:center;font-size:1rem;font-weight:600;background:white;font-family:${FONTS.sans};"
                                placeholder="?" oninput="checkLinksInput(this)">
                        </div>`;
                }

                q.text = `Complete the factor links for ${num}. Use each factor once.`;
                q.ans = factorPairs.map(p => `${p[0]}×${p[1]}`).join(", ");
                q.answerType = "factor-links";
                q.hint = `Each arc connects a factor pair that multiplies to ${num}`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-green);">Factor Links for ${num}</div>
                    <div style="display:flex;justify-content:center;align-items:flex-start;gap:25px;flex-wrap:wrap;">
                        <div style="flex-shrink:0;">
                            ${createFactorLinksSVG(num, { width: 260, height: 170, showAnswers: false })}
                        </div>
                        <div style="min-width:160px;padding:12px;background:var(--bg-card);border-radius:12px;">
                            <div style="font-weight:600;margin-bottom:10px;color:var(--text-dim);">Factor Pairs</div>
                            ${inputsHTML}
                        </div>
                    </div>
                    <!-- Factor Bank -->
                    <div style="margin-top:15px;background:${softFill(COLORS.fill[1])};padding:12px;border-radius:10px;border:2px solid ${COLORS.fill[1]};display:inline-block;">
                        <div style="font-weight:700;color:${COLORS.fill[1]};margin-bottom:8px;font-family:${FONTS.sans};">Factor Bank</div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
                            ${scrambledFactors.map(f => `<span style="padding:6px 12px;background:white;border:2px solid ${COLORS.fill[1]};border-radius:6px;font-weight:600;font-family:${FONTS.sans};">${f}</span>`).join('')}
                        </div>
                    </div>
                </div>`;

                q.numberTheoryData = {
                    num,
                    factorPairs,
                    allFactors,
                    bankFactors: scrambledFactors,
                    numPairs: factorPairs.length,
                    type: 'factor_links_easy'
                };
                q.printFormat = "factor-links-easy";

            } else if (ntSkill === "factor_links_medium") {
                // Factor Links MEDIUM - factor bank + 3 distractors
                const allLinksMed = [18, 20, 24, 30, 36, 40, 48, 56, 60];
                const filteredLinksMed = allLinksMed.filter(n => n <= ntMax);
                const num = pick(filteredLinksMed.length ? filteredLinksMed : [18]);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);

                // Add 3 distractor numbers
                const distractors = [];
                for (let i = 2; i <= num; i++) {
                    if (num % i !== 0 && distractors.length < 3) {
                        distractors.push(i);
                    }
                }
                const bankWithDistractors = [...allFactors, ...distractors].sort(() => Math.random() - 0.5);

                let inputsHTML = '';
                for (let i = 0; i < factorPairs.length; i++) {
                    // Each pair gets a distinct token-palette hue matching the arc color.
                    const color = categoricalFill(i);
                    const pair = factorPairs[i];
                    inputsHTML += `
                        <div class="links-pair" style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:8px;">
                            <input type="text" class="links-input" data-answer="${pair[0]}"
                                style="width:45px;height:34px;border:3px solid ${color};border-radius:8px;text-align:center;font-size:1rem;font-weight:600;background:white;font-family:${FONTS.sans};"
                                placeholder="?" oninput="checkLinksInput(this)">
                            <span style="color:${color};font-weight:700;font-size:1.1rem;font-family:${FONTS.sans};">×</span>
                            <input type="text" class="links-input" data-answer="${pair[1]}"
                                style="width:45px;height:34px;border:3px solid ${color};border-radius:8px;text-align:center;font-size:1rem;font-weight:600;background:white;font-family:${FONTS.sans};"
                                placeholder="?" oninput="checkLinksInput(this)">
                        </div>`;
                }

                q.text = `Complete the factor links for ${num}. Watch out for non-factors!`;
                q.ans = factorPairs.map(p => `${p[0]}×${p[1]}`).join(", ");
                q.answerType = "factor-links";
                q.hint = `Not all numbers in the bank are factors! Check: Does ${num} ÷ number = whole number?`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:${COLORS.fill[2]};font-family:${FONTS.sans};">Factor Links for ${num}</div>
                    <div style="display:flex;justify-content:center;align-items:flex-start;gap:25px;flex-wrap:wrap;">
                        <div style="flex-shrink:0;">
                            ${createFactorLinksSVG(num, { width: 260, height: 170, showAnswers: false })}
                        </div>
                        <div style="min-width:160px;padding:12px;background:var(--bg-card);border-radius:12px;">
                            <div style="font-weight:600;margin-bottom:10px;color:var(--text-dim);">Factor Pairs</div>
                            ${inputsHTML}
                        </div>
                    </div>
                    <!-- Number Bank with distractors -->
                    <div style="margin-top:15px;background:${softFill(COLORS.fill[2])};padding:12px;border-radius:10px;border:2px solid ${COLORS.fill[2]};display:inline-block;">
                        <div style="font-weight:700;color:${COLORS.fill[2]};margin-bottom:8px;font-family:${FONTS.sans};">Number Bank (some are NOT factors!)</div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
                            ${bankWithDistractors.map(f => `<span style="padding:6px 12px;background:white;border:2px solid ${COLORS.fill[2]};border-radius:6px;font-weight:600;font-family:${FONTS.sans};">${f}</span>`).join('')}
                        </div>
                    </div>
                </div>`;

                q.numberTheoryData = {
                    num,
                    factorPairs,
                    allFactors,
                    distractors,
                    bankFactors: bankWithDistractors,
                    numPairs: factorPairs.length,
                    type: 'factor_links_medium'
                };
                q.printFormat = "factor-links-medium";

            } else if (ntSkill === "factor_links_hard" || ntSkill === "factor_links") {
                // Factor Links HARD - NO factor bank
                const allLinksHard = [24, 30, 36, 40, 42, 48, 56, 60, 72, 80, 90, 100];
                const filteredLinksHard = allLinksHard.filter(n => n <= ntMax);
                const targetNums = filteredLinksHard.length ? filteredLinksHard : [24];
                const num = pick(targetNums);
                const factorPairs = getFactorPairs(num);

                let inputsHTML = '';
                for (let i = 0; i < factorPairs.length; i++) {
                    // Each pair gets a distinct token-palette hue matching the arc color.
                    const color = categoricalFill(i);
                    const pair = factorPairs[i];
                    inputsHTML += `
                        <div class="links-pair" style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:8px;">
                            <input type="text" class="links-input" data-answer="${pair[0]}"
                                style="width:45px;height:34px;border:3px solid ${color};border-radius:8px;text-align:center;font-size:1rem;font-weight:600;background:white;font-family:${FONTS.sans};"
                                placeholder="?" oninput="checkLinksInput(this)">
                            <span style="color:${color};font-weight:700;font-size:1.1rem;font-family:${FONTS.sans};">×</span>
                            <input type="text" class="links-input" data-answer="${pair[1]}"
                                style="width:45px;height:34px;border:3px solid ${color};border-radius:8px;text-align:center;font-size:1rem;font-weight:600;background:white;font-family:${FONTS.sans};"
                                placeholder="?" oninput="checkLinksInput(this)">
                        </div>`;
                }

                q.text = `Complete the factor links for ${num}. Find all factor pairs!`;
                q.ans = factorPairs.map(p => `${p[0]}×${p[1]}`).join(", ");
                q.answerType = "factor-links";
                q.hint = `Start with 1 × ${num}, then try 2, 3, 4... Stop at √${num} ≈ ${Math.floor(Math.sqrt(num))}`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-orange);">Factor Links for ${num}</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">Find ALL the factor pairs (no number bank!)</div>
                    <div style="display:flex;justify-content:center;align-items:flex-start;gap:25px;flex-wrap:wrap;">
                        <div style="flex-shrink:0;">
                            ${createFactorLinksSVG(num, { width: 260, height: 170, showAnswers: false })}
                        </div>
                        <div style="min-width:160px;padding:12px;background:var(--bg-card);border-radius:12px;">
                            <div style="font-weight:600;margin-bottom:10px;color:var(--text-dim);">Factor Pairs</div>
                            ${inputsHTML}
                        </div>
                    </div>
                    <div style="margin-top:15px;padding:12px;background:${softFill(COLORS.primary)};border-radius:8px;border-left:4px solid ${COLORS.primary};display:inline-block;">
                        <div style="font-size:0.9rem;color:${COLORS.primaryDark};font-family:${FONTS.sans};">
                            <b>Strategy:</b> Start with 1 × ${num}, check 2, 3, 4... until √${num} ≈ ${Math.floor(Math.sqrt(num))}
                        </div>
                    </div>
                </div>`;

                q.numberTheoryData = {
                    num,
                    factorPairs,
                    numPairs: factorPairs.length,
                    type: 'factor_links_hard'
                };
                q.printFormat = "factor-links-hard";

            } else if (ntSkill === "factor_tchart_drag") {
                // Interactive Factor T-Chart with Drag & Drop
                const allTchartDrag = [12, 16, 18, 20, 24, 30, 36, 40, 42, 48, 56, 60, 72, 80];
                const filteredTchartDrag = allTchartDrag.filter(n => n <= ntMax);
                const num = pick(filteredTchartDrag.length ? filteredTchartDrag : [12]);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                const scrambledFactors = [...allFactors].sort(() => Math.random() - 0.5);

                q.text = `Drag factors to build a T-chart for ${num}`;
                q.ans = factorPairs.map(p => `${p[0]}×${p[1]}`).join(", ");
                q.answerType = "tchart-drag";
                q.hint = `Find pairs of numbers that multiply to ${num}. Smaller number goes on the LEFT!`;

                // Generate unique ID for this T-chart instance
                const tchartId = 'tchart-' + Date.now();

                q.visual = `<div style="text-align:center;" id="${tchartId}-container">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Factor T-Chart Builder</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:15px;">
                        Drag factors from the bank to create pairs that multiply to <strong>${num}</strong>
                    </div>

                    <!-- T-Chart Structure -->
                    <div id="${tchartId}" class="tchart-interactive" data-target="${num}" data-pairs="${factorPairs.length}" style="display:inline-block;margin:15px auto;min-width:220px;">
                        <div style="font-size:2rem;font-weight:700;border-bottom:4px solid var(--accent-cyan);padding-bottom:10px;margin-bottom:5px;background:linear-gradient(135deg,var(--accent-purple),var(--accent-cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${num}</div>
                        <div style="display:flex;border-left:4px solid var(--accent-cyan);">
                            <div style="min-width:100px;border-right:4px solid var(--accent-cyan);">
                                <div style="font-size:0.75rem;color:var(--text-dim);padding:4px;border-bottom:1px solid var(--text-dim);">← Smaller</div>
                                ${factorPairs.map((_, i) => `<div class="tchart-drop-left" data-row="${i}" data-side="left"
                                    style="height:50px;display:flex;align-items:center;justify-content:center;border-bottom:2px dashed var(--text-dim);background:var(--bg-card);transition:all 0.2s;"
                                    ondragover="event.preventDefault();this.style.background='rgba(39,174,96,0.2)';this.style.borderColor='var(--accent-green)';"
                                    ondragleave="this.style.background='var(--bg-card)';this.style.borderColor='var(--text-dim)';"
                                    ondrop="handleTchartDrop(event,'${tchartId}',${i},'left',${num})">
                                    <span class="drop-placeholder" style="color:var(--text-dim);font-size:0.9rem;">drop here</span>
                                </div>`).join('')}
                            </div>
                            <div style="min-width:100px;">
                                <div style="font-size:0.75rem;color:var(--text-dim);padding:4px;border-bottom:1px solid var(--text-dim);">Larger →</div>
                                ${factorPairs.map((_, i) => `<div class="tchart-drop-right" data-row="${i}" data-side="right"
                                    style="height:50px;display:flex;align-items:center;justify-content:center;border-bottom:2px dashed var(--text-dim);background:var(--bg-card);transition:all 0.2s;"
                                    ondragover="event.preventDefault();this.style.background='rgba(39,174,96,0.2)';this.style.borderColor='var(--accent-green)';"
                                    ondragleave="this.style.background='var(--bg-card)';this.style.borderColor='var(--text-dim)';"
                                    ondrop="handleTchartDrop(event,'${tchartId}',${i},'right',${num})">
                                    <span class="drop-placeholder" style="color:var(--text-dim);font-size:0.9rem;">drop here</span>
                                </div>`).join('')}
                            </div>
                            <div style="min-width:60px;display:flex;flex-direction:column;">
                                <div style="font-size:0.75rem;color:var(--text-dim);padding:4px;border-bottom:1px solid var(--text-dim);">Check</div>
                                ${factorPairs.map((_, i) => `<div class="tchart-check" data-row="${i}"
                                    style="height:50px;display:flex;align-items:center;justify-content:center;border-bottom:2px dashed var(--text-dim);font-size:1.2rem;">
                                    <span class="check-icon" style="opacity:0.3;">?</span>
                                </div>`).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Factor Bank -->
                    <div id="${tchartId}-bank" style="margin-top:20px;background:var(--bg-card);padding:15px;border-radius:10px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-orange);">Factor Bank</div>
                        <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:10px;">Drag each factor to the correct spot</div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;">
                            ${scrambledFactors.map(f => `<div class="factor-tile" draggable="true" data-value="${f}"
                                style="padding:12px 18px;background:linear-gradient(135deg,var(--bg-card-light),var(--bg-card));border:3px solid var(--accent-orange);border-radius:8px;font-weight:700;font-size:1.3rem;cursor:grab;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.2);"
                                ondragstart="event.dataTransfer.setData('text/plain',${f});this.style.opacity='0.5';this.style.transform='scale(0.95)';"
                                ondragend="this.style.opacity='1';this.style.transform='scale(1)';">${f}</div>`).join('')}
                        </div>
                    </div>

                    <!-- Feedback area -->
                    <div id="${tchartId}-feedback" style="margin-top:15px;padding:10px;border-radius:8px;display:none;"></div>

                    <!-- Reset button -->
                    <button onclick="resetTchart('${tchartId}',${JSON.stringify(scrambledFactors).replace(/"/g, "'")})"
                        style="margin-top:15px;padding:8px 20px;background:var(--bg-card);border:2px solid var(--accent-cyan);border-radius:6px;color:var(--text);cursor:pointer;font-weight:600;">
                        Reset T-Chart
                    </button>
                </div>`;

                q.numberTheoryData = {
                    num,
                    factorPairs,
                    allFactors,
                    scrambledFactors,
                    tchartId,
                    type: 'factor_tchart_drag'
                };
                q.printFormat = "nt-factor-tchart-drag";
            } else if (ntSkill === "multiples" && Math.random() < 0.35) {
                const mNum = pick([3, 4, 5, 6, 7, 8, 9]);
                const mMaxList = Math.max(mNum * 8, 50);
                const mMax = Math.min(mMaxList, ntMax);
                const allMultiples = [];
                for (let v = mNum; v <= mMax; v += mNum) allMultiples.push(v);
                const correctCount = Math.min(allMultiples.length, randInt(3, 4));
                const chosenCorrect = shuffle([...allMultiples]).slice(0, correctCount);
                const wrongPool = [];
                for (let v = 2; v <= mMax; v++) if (v % mNum !== 0) wrongPool.push(v);
                const wrongCount = randInt(3, 5);
                const chosenWrong = shuffle(wrongPool).slice(0, wrongCount);
                const all = shuffle([...chosenCorrect, ...chosenWrong]);
                const options = all.map((n, i) => ({
                    id: 'opt' + i,
                    label: String(n),
                    correct: n % mNum === 0
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL the multiples of ${mNum}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `A multiple of ${mNum} can be written as ${mNum} times a whole number.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Multiples';
                return;
            } else if (ntSkill === "multiples") {
                // Enhanced: Multiple problem types with more variety
                const problemType = pick(["identify_multiples", "list_multiples", "fill_sequence"]);

                if (problemType === "identify_multiples") {
                    // Circle all multiples from a list
                    const num = pick([3, 4, 5, 6, 7, 8, 9]);
                    const count = 10;

                    // Generate some multiples
                    const multiples = [];
                    for (let i = 1; i <= 6; i++) {
                        multiples.push(num * i);
                    }

                    // Generate some non-multiples
                    const nonMultiples = [];
                    for (let i = 1; i <= 60 && nonMultiples.length < 4; i++) {
                        if (i % num !== 0 && !multiples.includes(i)) {
                            nonMultiples.push(i);
                        }
                    }

                    const displayList = [...multiples.slice(0, 5), ...nonMultiples.slice(0, 4)].sort((a, b) => a - b);
                    const correctMultiples = displayList.filter(n => n % num === 0);

                    q.text = `Circle all the multiples of ${num}:`;
                    q.ans = correctMultiples.join(", ");
                    q.answerType = "multi-select";
                    q.hint = `Multiples of ${num} are numbers you get when multiplying ${num} by 1, 2, 3, 4...`;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Identify All Multiples of ${num}</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:15px;">Click all numbers that are multiples of ${num}</div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:20px auto;max-width:400px;">
                            ${displayList.map(n => `<div class="multiple-item" data-num="${n}" data-multiple="${n % num === 0}"
                                style="padding:12px 16px;background:var(--bg-card);border:2px solid var(--text-dim);border-radius:8px;font-size:1.2rem;font-weight:600;cursor:pointer;min-width:45px;transition:all 0.2s;"
                                onclick="this.classList.toggle('selected');this.style.borderColor=this.classList.contains('selected')?'var(--accent-green)':'var(--text-dim)';this.style.background=this.classList.contains('selected')?'rgba(39,174,96,0.2)':'var(--bg-card)';">${n}</div>`).join('')}
                        </div>
                        <div style="margin-top:15px;font-size:0.85rem;color:var(--text-dim);">
                            Think: ${num} × ? = each number
                        </div>
                    </div>`;
                    q.numberTheoryData = {
                        num,
                        displayList,
                        correctMultiples,
                        type: 'multiples_identify'
                    };
                    q.printFormat = "nt-multiples-identify";
                } else if (problemType === "list_multiples") {
                    // List first N multiples - now with variety (5, 8, 10, or 12)
                    const num = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                    const count = pick([5, 8, 10, 12]);
                    const multiples = Array.from({length: count}, (_, i) => num * (i + 1));

                    q.text = `List the first ${count} multiples of ${num}`;
                    q.ans = multiples.join(", ");
                    q.answerType = "text";
                    q.hint = `Multiples are ${num} × 1, ${num} × 2, ${num} × 3...`;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">List Multiples</div>
                        <div style="font-size:1.3rem;margin:15px 0;">First ${count} multiples of <span style="color:var(--accent-cyan);font-weight:700;">${num}</span></div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:15px 0;">
                            ${Array(Math.min(count, 6)).fill(0).map((_, i) => `<span style="padding:8px 12px;border:2px dashed var(--accent-green);border-radius:6px;">${num}×${i+1}</span>`).join('')}
                            ${count > 6 ? '<span style="padding:8px 12px;">...</span>' : ''}
                        </div>
                    </div>`;
                    q.numberTheoryData = { num, multiples, count, type: 'multiples_list' };
                    q.printFormat = "nt-multiples";
                } else {
                    // Fill in missing multiples in a sequence
                    const num = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                    const allMultiples = Array.from({length: 12}, (_, i) => num * (i + 1));

                    // Show some, hide others randomly
                    const showCount = pick([4, 5, 6]); // How many to show
                    const showIndices = new Set();
                    while (showIndices.size < showCount) {
                        showIndices.add(Math.floor(Math.random() * 12));
                    }

                    const sequence = allMultiples.map((val, i) => ({
                        value: val,
                        shown: showIndices.has(i),
                        position: i + 1
                    }));

                    const missingValues = sequence.filter(s => !s.shown).map(s => s.value);

                    q.text = `Fill in the missing multiples of ${num}`;
                    q.ans = missingValues.join(", ");
                    q.answerType = "text";
                    q.hint = `Count by ${num}s: ${num}, ${num*2}, ${num*3}...`;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Complete the Multiples of ${num}</div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:15px auto;max-width:500px;">
                            ${sequence.map(s => s.shown
                                ? `<span style="padding:10px 14px;background:var(--accent-cyan);color:white;border-radius:6px;font-weight:600;min-width:40px;">${s.value}</span>`
                                : `<span style="padding:10px 14px;border:2px dashed var(--accent-purple);border-radius:6px;min-width:40px;">?</span>`
                            ).join('')}
                        </div>
                    </div>`;
                    q.numberTheoryData = { num, sequence, missingValues, type: 'multiples_fill' };
                    q.printFormat = "nt-multiples-fill";
                }
            } else if ((ntSkill === "gcf_easy" || ntSkill === "gcf") && Math.random() < 0.25) {
                // Phase 4.5 batch 10: multi-select-check variant — "Click ALL common factors of A and B"
                const allGcfEasyMSC = [[12, 18], [15, 20], [16, 24], [18, 27], [20, 30], [24, 36], [12, 16], [18, 24]];
                const filteredMSC = allGcfEasyMSC.filter(p => p[0] <= ntMax && p[1] <= ntMax);
                const [aMSC, bMSC] = pick(filteredMSC.length ? filteredMSC : [[12, 18]]);
                const factorsAMSC = getFactors(aMSC);
                const factorsBMSC = getFactors(bMSC);
                const commonMSC = factorsAMSC.filter(f => factorsBMSC.includes(f));
                // Distractors: factors of one but not the other, plus a couple unrelated numbers
                const onlyAMSC = factorsAMSC.filter(f => !factorsBMSC.includes(f));
                const onlyBMSC = factorsBMSC.filter(f => !factorsAMSC.includes(f));
                const distractorPoolMSC = shuffle([...onlyAMSC, ...onlyBMSC]);
                const wantedDistractors = Math.min(Math.max(2, 6 - commonMSC.length), distractorPoolMSC.length);
                const chosenDistractorsMSC = distractorPoolMSC.slice(0, wantedDistractors);
                const allValuesMSC = shuffle([...commonMSC, ...chosenDistractorsMSC]);
                const options = allValuesMSC.map((n, i) => ({
                    id: 'opt' + i,
                    label: String(n),
                    correct: commonMSC.includes(n)
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL common factors of ${aMSC} and ${bMSC}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `A common factor divides BOTH numbers evenly. Test each option in ${aMSC} ÷ n and ${bMSC} ÷ n.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Common Factors';
                return;
            } else if (ntSkill === "gcf_easy" || ntSkill === "gcf") {
                // GCF EASY - factor boxes shown for both numbers
                const allGcfEasy = [[12, 18], [15, 20], [16, 24], [18, 27], [20, 30], [24, 36], [12, 16], [18, 24], [30, 45], [36, 48]];
                const filteredGcfEasy = allGcfEasy.filter(p => p[0] <= ntMax && p[1] <= ntMax);
                const [a, b] = pick(filteredGcfEasy.length ? filteredGcfEasy : [[12, 18]]);

                const findGCF = (x, y) => {
                    while (y) { [x, y] = [y, x % y]; }
                    return x;
                };
                const gcf = findGCF(a, b);

                const factorsA = getFactors(a);
                const factorsB = getFactors(b);
                const commonFactors = factorsA.filter(f => factorsB.includes(f));

                q.ans = gcf;
                q.text = `Find the Greatest Common Factor of ${a} and ${b}.`;
                q.hint = `Look at the factor boxes for each number. Find the factors that appear in BOTH rows, then pick the biggest one.`;

                // Build factor box HTML for a number - common factors get gold highlight.
                // Common-factor highlight uses categorical orange (fill[2]) with softFill bg
                // to signal "shared between both rows" while preserving per-number A/B hues.
                const makeFactorBoxes = (factors, color, borderColor) => {
                    return factors.map(f => {
                        const isCommon = commonFactors.includes(f);
                        const bg = isCommon ? softFill(COLORS.fill[2]) : color;
                        const border = isCommon ? COLORS.fill[2] : borderColor;
                        const star = isCommon ? ' *' : '';
                        return `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:36px;padding:0 6px;background:${bg};border:2px solid ${border};border-radius:6px;font-weight:700;font-size:1rem;font-family:${FONTS.sans};">${f}${star}</span>`;
                    }).join('');
                };

                q.visual = `<div style="text-align:center;max-width:500px;margin:0 auto;">
                    <div style="font-weight:700;font-size:1.1rem;margin-bottom:12px;color:var(--accent-green);">Greatest Common Factor (GCF)</div>

                    <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:16px;text-align:left;line-height:1.5;">
                        <b>Step 1:</b> Look at all the factors of each number.<br>
                        <b>Step 2:</b> Find the factors they <b>share</b> (marked with *).<br>
                        <b>Step 3:</b> Pick the <b>greatest</b> (biggest) shared factor!
                    </div>

                    <!-- Factors of first number -->
                    <div style="background:var(--bg-card);padding:12px 14px;border-radius:10px;margin-bottom:10px;text-align:left;">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                            <span style="font-size:1.3rem;font-weight:800;color:${COLORS.fill[1]};background:${softFill(COLORS.fill[1])};padding:4px 12px;border-radius:8px;border:2px solid ${COLORS.fill[1]};font-family:${FONTS.sans};">${a}</span>
                            <span style="font-size:0.85rem;color:var(--text-dim);">has <b>${factorsA.length}</b> factors</span>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${makeFactorBoxes(factorsA, softFill(COLORS.fill[1]), COLORS.fill[1])}
                        </div>
                    </div>

                    <!-- Factors of second number -->
                    <div style="background:var(--bg-card);padding:12px 14px;border-radius:10px;margin-bottom:12px;text-align:left;">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                            <span style="font-size:1.3rem;font-weight:800;color:${COLORS.primaryDark};background:${softFill(COLORS.primary)};padding:4px 12px;border-radius:8px;border:2px solid ${COLORS.primary};font-family:${FONTS.sans};">${b}</span>
                            <span style="font-size:0.85rem;color:var(--text-dim);">has <b>${factorsB.length}</b> factors</span>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${makeFactorBoxes(factorsB, softFill(COLORS.primary), COLORS.primary)}
                        </div>
                    </div>

                    <!-- Common factors highlight -->
                    <div style="background:${softFill(COLORS.fill[2])};padding:12px;border-radius:8px;border:2px solid ${COLORS.fill[2]};">
                        <div style="font-weight:700;font-size:0.95rem;margin-bottom:6px;font-family:${FONTS.sans};">Shared Factors (appear in both):</div>
                        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:8px;">
                            ${commonFactors.map(f => `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:38px;height:38px;padding:0 8px;background:white;border:3px solid ${COLORS.fill[2]};border-radius:8px;font-weight:800;font-size:1.1rem;font-family:${FONTS.sans};">${f}</span>`).join('')}
                        </div>
                        <div style="font-size:1rem;color:${COLORS.fill[2]};font-weight:600;font-family:${FONTS.sans};">
                            The <b>greatest</b> one is: <span class="answer-blank-inline" style="border-bottom-color:${COLORS.fill[4]};width:1.4em;"></span>
                        </div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(gcf);
                q.numberTheoryData = { a, b, gcf, factorsA, factorsB, commonFactors, type: 'gcf_easy' };
                q.printFormat = "nt-gcf-easy";

            } else if (ntSkill === "gcf_hard" && Math.random() < 0.25) {
                // Phase 4.5 batch 10: multi-select-check variant — "Click ALL common factors of A and B" (harder pairs)
                const allGcfHardMSC = [[24, 36], [18, 30], [20, 35], [28, 42], [30, 45], [36, 48], [24, 40], [32, 48]];
                const filteredHardMSC = allGcfHardMSC.filter(p => p[0] <= ntMax && p[1] <= ntMax);
                const [aMSC, bMSC] = pick(filteredHardMSC.length ? filteredHardMSC : [[24, 36]]);
                const factorsAMSC = getFactors(aMSC);
                const factorsBMSC = getFactors(bMSC);
                const commonMSC = factorsAMSC.filter(f => factorsBMSC.includes(f));
                const onlyAMSC = factorsAMSC.filter(f => !factorsBMSC.includes(f));
                const onlyBMSC = factorsBMSC.filter(f => !factorsAMSC.includes(f));
                const distractorPoolMSC = shuffle([...onlyAMSC, ...onlyBMSC]);
                const wantedDistractors = Math.min(Math.max(2, 6 - commonMSC.length), distractorPoolMSC.length);
                const chosenDistractorsMSC = distractorPoolMSC.slice(0, wantedDistractors);
                const allValuesMSC = shuffle([...commonMSC, ...chosenDistractorsMSC]);
                const options = allValuesMSC.map((n, i) => ({
                    id: 'opt' + i,
                    label: String(n),
                    correct: commonMSC.includes(n)
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL common factors of ${aMSC} and ${bMSC}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `A common factor divides BOTH numbers evenly. Test each option in ${aMSC} ÷ n and ${bMSC} ÷ n.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Common Factors';
                return;
            } else if (ntSkill === "gcf_hard") {
                // GCF HARD - empty factor boxes, students fill them in
                const allGcfHard = [[24, 36], [18, 30], [20, 35], [28, 42], [30, 45], [36, 48], [24, 40], [32, 48], [48, 72], [60, 90]];
                const filteredGcfHard = allGcfHard.filter(p => p[0] <= ntMax && p[1] <= ntMax);
                const [a, b] = pick(filteredGcfHard.length ? filteredGcfHard : [[24, 36]]);

                const findGCF = (x, y) => {
                    while (y) { [x, y] = [y, x % y]; }
                    return x;
                };
                const gcf = findGCF(a, b);

                const factorsA = getFactors(a);
                const factorsB = getFactors(b);
                const commonFactors = factorsA.filter(f => factorsB.includes(f));

                q.ans = gcf;
                q.text = `Find the Greatest Common Factor of ${a} and ${b}.`;
                q.hint = `Start by listing ALL factors of ${a} (numbers that divide evenly into ${a}), then do the same for ${b}. Look for the biggest factor they share!`;

                // Build empty boxes for students to fill
                const makeEmptyBoxes = (count, color) => {
                    return Array(count).fill(0).map(() =>
                        `<input type="text" style="width:38px;height:36px;border:2px solid ${color};border-radius:6px;text-align:center;font-weight:700;font-size:0.95rem;background:var(--bg-card-light);font-family:${FONTS.sans};" placeholder="?">`
                    ).join('');
                };

                q.visual = `<div style="text-align:center;max-width:500px;margin:0 auto;">
                    <div style="font-weight:700;font-size:1.1rem;margin-bottom:12px;color:var(--accent-orange);">Greatest Common Factor (GCF)</div>

                    <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:16px;text-align:left;line-height:1.5;">
                        <b>Step 1:</b> Find ALL factors of each number (fill in the boxes).<br>
                        <b>Step 2:</b> Circle the factors they <b>share</b>.<br>
                        <b>Step 3:</b> The <b>greatest</b> (biggest) shared factor is the GCF!
                    </div>

                    <!-- Factor boxes for first number -->
                    <div style="background:var(--bg-card);padding:12px 14px;border-radius:10px;margin-bottom:10px;text-align:left;">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                            <span style="font-size:1.3rem;font-weight:800;color:${COLORS.fill[1]};background:${softFill(COLORS.fill[1])};padding:4px 12px;border-radius:8px;border:2px solid ${COLORS.fill[1]};font-family:${FONTS.sans};">${a}</span>
                            <span style="font-size:0.85rem;color:var(--text-dim);">Find all <b>${factorsA.length}</b> factors</span>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${makeEmptyBoxes(factorsA.length, COLORS.fill[1])}
                        </div>
                    </div>

                    <!-- Factor boxes for second number -->
                    <div style="background:var(--bg-card);padding:12px 14px;border-radius:10px;margin-bottom:12px;text-align:left;">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                            <span style="font-size:1.3rem;font-weight:800;color:${COLORS.primaryDark};background:${softFill(COLORS.primary)};padding:4px 12px;border-radius:8px;border:2px solid ${COLORS.primary};font-family:${FONTS.sans};">${b}</span>
                            <span style="font-size:0.85rem;color:var(--text-dim);">Find all <b>${factorsB.length}</b> factors</span>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${makeEmptyBoxes(factorsB.length, COLORS.primary)}
                        </div>
                    </div>

                    <!-- Common factors area -->
                    <div style="background:${softFill(COLORS.fill[2])};padding:12px;border-radius:8px;border:2px dashed ${COLORS.fill[2]};">
                        <div style="font-weight:700;font-size:0.95rem;margin-bottom:6px;font-family:${FONTS.sans};">Shared Factors:</div>
                        <div style="border:2px dashed ${COLORS.fill[2]};border-radius:6px;min-height:40px;padding:6px;background:white;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:${COLORS.neutral};font-style:italic;font-size:0.85rem;font-family:${FONTS.sans};">Write the factors that appear in both rows</div>
                        <div style="font-size:1rem;color:${COLORS.fill[2]};font-weight:600;font-family:${FONTS.sans};">
                            The <b>greatest</b> one is the GCF: <span class="answer-blank-inline" style="border-bottom-color:${COLORS.fill[4]};width:1.4em;"></span>
                        </div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(gcf);
                q.numberTheoryData = { a, b, gcf, factorsA, factorsB, commonFactors, type: 'gcf_hard' };
                q.printFormat = "nt-gcf-hard";

            } else if (ntSkill === "lcm" && Math.random() < 0.25) {
                // Phase 4.5 batch 10: multi-select-check variant — "Click ALL common multiples of A and B less than N"
                const allLcmPairsMSC = [[3, 4], [4, 5], [3, 5], [4, 6], [6, 8], [5, 6], [6, 9], [3, 6], [4, 8], [2, 5]];
                const filteredLcmMSC = allLcmPairsMSC.filter(p => p[0] <= ntMax && p[1] <= ntMax);
                const [aMSC, bMSC] = pick(filteredLcmMSC.length ? filteredLcmMSC : [[3, 4]]);
                const findGCFMSC = (x, y) => { while (y) { [x, y] = [y, x % y]; } return x; };
                const lcmMSC = (aMSC * bMSC) / findGCFMSC(aMSC, bMSC);
                const cap = Math.max(40, Math.min(60, lcmMSC * 4));
                // Common multiples = multiples of lcm under cap
                const commonsMSC = [];
                for (let m = lcmMSC; m <= cap; m += lcmMSC) commonsMSC.push(m);
                // Distractors: multiples of just A or just B
                const onlyA = [];
                for (let i = 1; i * aMSC <= cap; i++) {
                    const v = i * aMSC;
                    if (v % bMSC !== 0) onlyA.push(v);
                }
                const onlyB = [];
                for (let i = 1; i * bMSC <= cap; i++) {
                    const v = i * bMSC;
                    if (v % aMSC !== 0) onlyB.push(v);
                }
                const distractorPoolMSC = shuffle([...onlyA, ...onlyB]);
                const correctCount = Math.min(commonsMSC.length, rng(2, 3));
                const correctChoiceMSC = shuffle([...commonsMSC]).slice(0, correctCount);
                const distractorCount = Math.min(distractorPoolMSC.length, 6 - correctChoiceMSC.length);
                const distractorChoiceMSC = distractorPoolMSC.slice(0, distractorCount);
                const allValuesMSC = shuffle([...correctChoiceMSC, ...distractorChoiceMSC]);
                const options = allValuesMSC.map((n, i) => ({
                    id: 'opt' + i,
                    label: String(n),
                    correct: commonsMSC.includes(n)
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL common multiples of ${aMSC} and ${bMSC} less than ${cap + 1}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `A common multiple is divisible by BOTH ${aMSC} and ${bMSC}. The smallest is the LCM = ${lcmMSC}.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Common Multiples';
                return;
            } else if (ntSkill === "lcm") {
                // Least Common Multiple
                const allLcmPairs = [[3, 4], [4, 5], [3, 5], [4, 6], [6, 8], [5, 6], [6, 9], [8, 12], [7, 10], [9, 12]];
                const filteredLcmPairs = allLcmPairs.filter(p => p[0] <= ntMax && p[1] <= ntMax);
                const [a, b] = pick(filteredLcmPairs.length ? filteredLcmPairs : [[3, 4]]);

                const findLCM = (x, y) => {
                    const findGCF = (x, y) => { while (y) { [x, y] = [y, x % y]; } return x; };
                    return (x * y) / findGCF(x, y);
                };
                const lcm = findLCM(a, b);

                const multiplesA = Array.from({length: Math.ceil(lcm/a) + 2}, (_, i) => a * (i + 1));
                const multiplesB = Array.from({length: Math.ceil(lcm/b) + 2}, (_, i) => b * (i + 1));

                // Variant: easy (LCM shown in green) vs hard (LCM cells blank but green)
                const lcmVariant = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('lcm', ['easy_filled', 'hard_blank'])
                    : (Math.random() < 0.5 ? 'easy_filled' : 'hard_blank');
                const isHard = lcmVariant === 'hard_blank';

                q.ans = lcm;
                q.text = `Find the LCM of ${a} and ${b}`;
                q.hint = isHard
                    ? `The green cells are the smallest shared multiple. Fill them in mentally, then type the LCM.`
                    : `List multiples of each until you find the smallest one they share`;

                const renderCell = (m) => {
                    if (m === lcm) {
                        if (isHard) {
                            // Blank green box - same dimensions as filled cells
                            return `<span style="padding:4px 8px;background:rgba(39,174,96,0.4);border:2px dashed #27ae60;border-radius:4px;font-size:0.9rem;font-weight:700;min-width:24px;display:inline-block;color:transparent;">${m}</span>`;
                        }
                        return `<span style="padding:4px 8px;background:rgba(39,174,96,0.4);border-radius:4px;font-size:0.9rem;font-weight:700;">${m}</span>`;
                    }
                    return `<span style="padding:4px 8px;background:var(--bg-card-light);border-radius:4px;font-size:0.9rem;">${m}</span>`;
                };

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Least Common Multiple${isHard ? ' <span style="font-size:0.8rem;color:var(--accent-orange);font-weight:600;">(harder: green cells are blank)</span>' : ''}</div>
                    <div style="font-size:1.5rem;margin:15px 0;">LCM(${a}, ${b}) = ?</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:8px;margin:10px auto;max-width:350px;">
                        <div style="margin-bottom:10px;">
                            <span style="font-weight:600;">Multiples of ${a}:</span>
                            <div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:5px;">
                                ${multiplesA.slice(0, 8).map(renderCell).join('')}
                            </div>
                        </div>
                        <div>
                            <span style="font-weight:600;">Multiples of ${b}:</span>
                            <div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:5px;">
                                ${multiplesB.slice(0, 8).map(renderCell).join('')}
                            </div>
                        </div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(lcm);
                q.numberTheoryData = { a, b, lcm, multiplesA, multiplesB, type: 'lcm', variant: lcmVariant };
                q.printFormat = "nt-lcm";
            } else if (ntSkill === "divisibility") {
                // Divisibility rules - full support for 1-12
                // Use selected divisors if available
                const availableDivisors = (typeof selectedDivisors !== 'undefined' && selectedDivisors.length > 0)
                    ? selectedDivisors
                    : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                const divisor = pick(availableDivisors);
                const isDivisible = Math.random() < 0.5;
                let num;

                const divMultMax = Math.max(10, Math.min(Math.floor(ntMax / divisor), 99));
                if (isDivisible) {
                    num = divisor * rng(10, divMultMax);
                } else {
                    num = divisor * rng(10, divMultMax) + rng(1, divisor - 1);
                }

                q.text = `Is ${num} divisible by ${divisor}?`;
                q.ans = isDivisible ? "Yes" : "No";
                q.answerType = "choice";
                q.options = ["Yes", "No"];

                const rules = {
                    2: "Even numbers (last digit is 0, 2, 4, 6, or 8)",
                    3: "Sum of all digits is divisible by 3",
                    4: "Last two digits form a number divisible by 4",
                    5: "Last digit is 0 or 5",
                    6: "Divisible by BOTH 2 AND 3",
                    7: "Double the last digit, subtract from the rest - result divisible by 7",
                    8: "Last three digits form a number divisible by 8",
                    9: "Sum of all digits is divisible by 9",
                    10: "Last digit is 0",
                    11: "Alternating sum of digits is divisible by 11 (or 0)",
                    12: "Divisible by BOTH 3 AND 4"
                };
                q.hint = `Rule for ${divisor}: ${rules[divisor]}`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Divisibility Rules</div>
                    <div style="font-size:2rem;font-weight:700;margin:15px 0;">${num}</div>
                    <div style="font-size:1.2rem;margin:10px 0;">Is this divisible by <span style="color:var(--accent-cyan);font-weight:700;">${divisor}</span>?</div>
                    <div style="background:var(--bg-card);padding:12px;border-radius:8px;margin:15px auto;max-width:320px;font-size:0.9rem;border:1px solid var(--border-light);">
                        <strong>Rule for ${divisor}:</strong><br/>${rules[divisor]}
                    </div>
                </div>`;
                q.numberTheoryData = { num, divisor, isDivisible, type: 'divisibility' };
                q.printFormat = "nt-divisibility";
            } else if (ntSkill === "divisibility_sort") {
                // Divisibility Sorting - drag 4 numbers into correct boxes
                // Use selected divisors if available
                const availableDivisors = (typeof selectedDivisors !== 'undefined' && selectedDivisors.length > 0)
                    ? selectedDivisors
                    : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                const divisor = pick(availableDivisors);

                // Generate 4 numbers - mix of divisible and not divisible
                const numbers = [];
                const numDivisible = rng(1, 3); // 1 to 3 divisible numbers
                const dSortMultMax = Math.max(5, Math.min(Math.floor(ntMax / divisor), 99));

                // Add divisible numbers
                for (let i = 0; i < numDivisible; i++) {
                    let num;
                    do {
                        num = divisor * rng(5, dSortMultMax);
                    } while (numbers.includes(num));
                    numbers.push(num);
                }

                // Add non-divisible numbers
                for (let i = numDivisible; i < 4; i++) {
                    let num;
                    do {
                        num = divisor * rng(5, dSortMultMax) + rng(1, divisor - 1);
                    } while (numbers.includes(num) || num % divisor === 0);
                    numbers.push(num);
                }

                // Shuffle numbers
                const shuffled = [...numbers].sort(() => Math.random() - 0.5);

                // Determine correct answers
                const divisibleNums = shuffled.filter(n => n % divisor === 0);
                const notDivisibleNums = shuffled.filter(n => n % divisor !== 0);

                q.text = `Sort these numbers: Which are divisible by ${divisor}?`;
                q.answerType = "divisibility-sort";
                q.divisibilitySortData = {
                    divisor,
                    numbers: shuffled,
                    divisible: divisibleNums,
                    notDivisible: notDivisibleNums
                };
                q.ans = `Divisible: ${divisibleNums.join(', ')} | Not: ${notDivisibleNums.join(', ')}`;

                // Divisibility rules for help popup
                const rules = {
                    1: { rule: "All integers are divisible by 1", example: "123, 500, 7" },
                    2: { rule: "Last digit is 0, 2, 4, 6, or 8", example: "128 (ends in 8)" },
                    3: { rule: "Sum of digits is divisible by 3", example: "375 → 3+7+5=15 → divisible by 3" },
                    4: { rule: "Last 2 digits form a number divisible by 4", example: "528 → 28÷4=7 ✓" },
                    5: { rule: "Last digit is 0 or 5", example: "345, 910" },
                    6: { rule: "Divisible by BOTH 2 AND 3", example: "756 (even & 7+5+6=18)" },
                    7: { rule: "Double last digit, subtract from rest", example: "161 → 16-2×1=14 → 14÷7=2 ✓" },
                    8: { rule: "Last 3 digits divisible by 8", example: "5128 → 128÷8=16 ✓" },
                    9: { rule: "Sum of digits is divisible by 9", example: "126 → 1+2+6=9 ✓" },
                    10: { rule: "Last digit is 0", example: "680, 200" },
                    11: { rule: "Alternating sum of digits divisible by 11", example: "121 → 1-2+1=0 ✓" },
                    12: { rule: "Divisible by BOTH 3 AND 4", example: "144 → sum=9, last 2=44" }
                };

                const ruleInfo = rules[divisor];
                q.hint = `Rule for ${divisor}: ${ruleInfo.rule}. Example: ${ruleInfo.example}`;

                // Build interactive visual with drag-and-drop boxes
                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                        <div style="font-weight:700;color:var(--accent-purple);">Divisibility Sorting</div>
                        <button class="hint-btn-small" onclick="showDivisibilityHelp(${divisor})" style="padding:6px 12px;font-size:0.85rem;background:var(--accent-purple);color:white;border:none;border-radius:6px;cursor:pointer;">
                            Rules Help
                        </button>
                    </div>

                    <div style="font-size:1.1rem;margin-bottom:15px;">
                        Sort these numbers by divisibility by <span style="color:var(--accent-cyan);font-weight:700;font-size:1.4rem;">${divisor}</span>
                    </div>

                    <!-- Numbers to drag -->
                    <div id="divSortNumbers" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:15px 0;min-height:60px;padding:10px;background:var(--bg-card-light);border-radius:10px;">
                        ${shuffled.map((n, i) => `
                            <div class="div-sort-number" draggable="true" data-num="${n}" data-index="${i}"
                                style="padding:12px 18px;background:linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));color:white;border-radius:10px;font-size:1.3rem;font-weight:700;cursor:grab;user-select:none;box-shadow:0 3px 10px rgba(0,0,0,0.2);transition:transform 0.15s,box-shadow 0.15s;"
                                onmousedown="this.style.cursor='grabbing'"
                                onmouseup="this.style.cursor='grab'"
                                onclick="toggleDivSortNumber(this, ${divisor})">
                                ${n}
                            </div>
                        `).join('')}
                    </div>

                    <!-- Drop zones -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:15px;">
                        <div id="divSortYes" class="div-sort-box" data-type="yes"
                            style="min-height:100px;padding:15px;border:3px dashed var(--correct);border-radius:12px;background:rgba(6,214,160,0.1);"
                            ondragover="event.preventDefault();this.style.background='rgba(6,214,160,0.25)'"
                            ondragleave="this.style.background='rgba(6,214,160,0.1)'"
                            ondrop="dropDivSortNumber(event, 'yes', ${divisor})">
                            <div style="font-weight:700;color:var(--correct);margin-bottom:10px;font-size:0.95rem;">✓ Divisible by ${divisor}</div>
                            <div class="div-sort-dropped" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:40px;"></div>
                        </div>
                        <div id="divSortNo" class="div-sort-box" data-type="no"
                            style="min-height:100px;padding:15px;border:3px dashed var(--incorrect);border-radius:12px;background:rgba(239,71,111,0.1);"
                            ondragover="event.preventDefault();this.style.background='rgba(239,71,111,0.25)'"
                            ondragleave="this.style.background='rgba(239,71,111,0.1)'"
                            ondrop="dropDivSortNumber(event, 'no', ${divisor})">
                            <div style="font-weight:700;color:var(--incorrect);margin-bottom:10px;font-size:0.95rem;">✗ NOT Divisible by ${divisor}</div>
                            <div class="div-sort-dropped" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:40px;"></div>
                        </div>
                    </div>

                    <div style="margin-top:12px;font-size:0.85rem;color:var(--text-dim);">
                        Tap a number, then tap a box to sort (or drag & drop)
                    </div>
                </div>`;

                q.numberTheoryData = { divisor, numbers: shuffled, divisibleNums, notDivisibleNums, type: 'divisibility_sort' };
                q.printFormat = "nt-divisibility-sort";
            } else if (ntSkill === "even_odd") {
                // Even and odd
                const num = rng(1, Math.max(10, ntMax));
                const isEven = num % 2 === 0;

                q.text = `Is ${num} even or odd?`;
                q.ans = isEven ? "Even" : "Odd";
                q.answerType = "choice";
                q.options = ["Even", "Odd"];
                q.hint = `Even numbers end in 0, 2, 4, 6, or 8. Odd numbers end in 1, 3, 5, 7, or 9`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Even or Odd?</div>
                    <div style="font-size:3rem;font-weight:700;margin:20px 0;">${num}</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);">Look at the ones digit: ${num % 10}</div>
                </div>`;
                q.numberTheoryData = { num, isEven, type: 'even_odd' };
                q.printFormat = "nt-even-odd";
            }
            return;
}
