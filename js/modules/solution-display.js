import { state } from './state.js';

export function showSolutionPopup() {
    const q = state.currentQ;
    if (!q) return;
    
    // Generate solution steps
    const steps = generateSolutionSteps(q);
    
    // Create and show modal
    const modal = document.createElement('div');
    modal.id = 'solutionModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7); display: flex; align-items: center;
        justify-content: center; z-index: 10000; padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--bg-card); border-radius: 20px; padding: 25px; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: var(--accent-cyan);">📚 Step-by-Step Solution</h3>
                <button onclick="closeSolutionPopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-dim);">×</button>
            </div>
            <div style="line-height: 1.8;">
                ${steps.map((step, i) => `
                    <div style="padding: 10px 15px; margin-bottom: 8px; background: ${step.includes('<strong>Answer') ? 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.1))' : 'rgba(255,255,255,0.05)'}; border-radius: 10px; border-left: 3px solid ${step.includes('<strong>Answer') ? 'var(--accent-green)' : 'var(--accent-cyan)'};">
                        ${step}
                    </div>
                `).join('')}
            </div>
            <button onclick="closeSolutionPopup()" class="btn btn-primary" style="width: 100%; margin-top: 15px;">Got it!</button>
        </div>
    `;
    
    modal.onclick = (e) => {
        if (e.target === modal) closeSolutionPopup();
    };
    
    document.body.appendChild(modal);
}

// Close solution popup
export function closeSolutionPopup() {
    const modal = document.getElementById('solutionModal');
    if (modal) modal.remove();
}

// Generate solution steps for on-screen display
export function generateSolutionSteps(q) {
    const steps = [];
    
    // ========================================
    // BASIC OPERATIONS
    // ========================================
    if (q.a !== undefined && q.b !== undefined && q.op) {
        const a = q.a, b = q.b, op = q.op;
        steps.push(`<strong>Problem:</strong> ${a.toLocaleString()} ${op} ${b.toLocaleString()}`);
        
        if (op === '+') {
            const aStr = a.toString(), bStr = b.toString();
            const maxLen = Math.max(aStr.length, bStr.length);
            steps.push(`<strong>Step 1:</strong> Line up by place value`);
            steps.push(`<strong>Step 2:</strong> Add each column from right to left`);
            // Show column-by-column for larger numbers
            if (a >= 10 || b >= 10) {
                let carry = 0, result = [];
                const placeNames = ['ones', 'tens', 'hundreds', 'thousands'];
                for (let i = 0; i < maxLen; i++) {
                    const aDigit = parseInt(aStr[aStr.length - 1 - i] || '0');
                    const bDigit = parseInt(bStr[bStr.length - 1 - i] || '0');
                    const sum = aDigit + bDigit + carry;
                    const newCarry = Math.floor(sum / 10);
                    if (i < 3) {
                        steps.push(`&nbsp;&nbsp;${placeNames[i]}: ${aDigit} + ${bDigit}${carry ? ' + 1' : ''} = ${sum}${newCarry ? ` (write ${sum % 10}, carry 1)` : ''}`);
                    }
                    carry = newCarry;
                }
                if (carry) steps.push(`&nbsp;&nbsp;Final carry: ${carry}`);
            }
            steps.push(`<strong>Answer: ${(a + b).toLocaleString()}</strong>`);
        } else if (op === '−' || op === '-') {
            steps.push(`<strong>Step 1:</strong> Line up by place value`);
            steps.push(`<strong>Step 2:</strong> Subtract each column from right to left`);
            steps.push(`<strong>Step 3:</strong> Borrow from next column when top < bottom`);
            if (a >= 10) {
                const aStr = a.toString();
                const placeNames = ['ones', 'tens', 'hundreds', 'thousands'];
                steps.push(`&nbsp;&nbsp;Work right to left through each place value`);
            }
            steps.push(`<strong>Answer: ${Math.abs(a - b).toLocaleString()}</strong>`);
        } else if (op === '×') {
            steps.push(`<strong>Step 1:</strong> Multiply ${a} by each digit of ${b}`);
            if (b >= 10) {
                const bStr = b.toString();
                for (let i = bStr.length - 1; i >= 0; i--) {
                    const digit = parseInt(bStr[i]);
                    const placeValue = Math.pow(10, bStr.length - 1 - i);
                    const partial = a * digit;
                    steps.push(`&nbsp;&nbsp;${a} × ${digit} = ${partial}${placeValue > 1 ? ` (then ×${placeValue} = ${partial * placeValue})` : ''}`);
                }
                steps.push(`<strong>Step 2:</strong> Add partial products`);
            } else {
                steps.push(`&nbsp;&nbsp;${a} × ${b} = ${a * b}`);
            }
            steps.push(`<strong>Answer: ${(a * b).toLocaleString()}</strong>`);
        } else if (op === '÷') {
            const quotient = Math.floor(a / b);
            const remainder = a % b;
            steps.push(`<strong>Step 1:</strong> How many times does ${b} go into ${a}?`);
            steps.push(`<strong>Step 2:</strong> ${b} × ${quotient} = ${b * quotient}`);
            steps.push(`<strong>Step 3:</strong> Subtract: ${a} - ${b * quotient} = ${remainder}`);
            if (remainder > 0) {
                steps.push(`<strong>Step 4:</strong> Remainder is ${remainder}`);
                steps.push(`<strong>Answer: ${quotient} R ${remainder}</strong>`);
            } else {
                steps.push(`<strong>Answer: ${quotient}</strong>`);
            }
        }
    }
    // ========================================
    // ORDER OF OPERATIONS
    // ========================================
    else if (q.expression) {
        steps.push(`<strong>Problem:</strong> ${q.expression}`);
        steps.push(`<strong>Remember PEMDAS:</strong>`);
        steps.push(`&nbsp;&nbsp;<strong>P</strong>arentheses first`);
        steps.push(`&nbsp;&nbsp;<strong>E</strong>xponents next`);
        steps.push(`&nbsp;&nbsp;<strong>M</strong>ultiplication & <strong>D</strong>ivision (left to right)`);
        steps.push(`&nbsp;&nbsp;<strong>A</strong>ddition & <strong>S</strong>ubtraction (left to right)`);
        if (q.oooSteps && q.oooSteps.length > 0) {
            steps.push(`<strong>Work through the steps:</strong>`);
            q.oooSteps.forEach((step, i) => {
                steps.push(`&nbsp;&nbsp;Step ${i + 1}: ${step}`);
            });
        }
        steps.push(`<strong>Answer: ${q.ans}</strong>`);
    }
    // ========================================
    // FRACTIONS
    // ========================================
    else if (q.fractionData) {
        const fd = q.fractionData;
        
        // Addition/subtraction with unlike denominators
        if (fd.num1 !== undefined && fd.num2 !== undefined && fd.denom1 && fd.denom2 && fd.denom1 !== fd.denom2) {
            steps.push(`<strong>Problem:</strong> ${fd.num1}/${fd.denom1} ${fd.op || '+'} ${fd.num2}/${fd.denom2}`);
            steps.push(`<strong>Step 1:</strong> Find LCD (Least Common Denominator)`);
            steps.push(`&nbsp;&nbsp;Multiples of ${fd.denom1}: ${fd.denom1}, ${fd.denom1*2}, ${fd.denom1*3}...`);
            steps.push(`&nbsp;&nbsp;Multiples of ${fd.denom2}: ${fd.denom2}, ${fd.denom2*2}, ${fd.denom2*3}...`);
            steps.push(`&nbsp;&nbsp;LCD = ${fd.lcd}`);
            steps.push(`<strong>Step 2:</strong> Convert first fraction`);
            steps.push(`&nbsp;&nbsp;${fd.num1}/${fd.denom1} = ${fd.convertedNum1}/${fd.lcd}`);
            steps.push(`<strong>Step 3:</strong> Convert second fraction`);
            steps.push(`&nbsp;&nbsp;${fd.num2}/${fd.denom2} = ${fd.convertedNum2}/${fd.lcd}`);
            steps.push(`<strong>Step 4:</strong> ${fd.op === '+' ? 'Add' : 'Subtract'} numerators (keep denominator)`);
            steps.push(`&nbsp;&nbsp;${fd.convertedNum1} ${fd.op || '+'} ${fd.convertedNum2} = ${fd.op === '+' ? fd.convertedNum1 + fd.convertedNum2 : fd.convertedNum1 - fd.convertedNum2}`);
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        }
        // Same denominator
        else if (fd.num1 !== undefined && fd.num2 !== undefined && fd.denom) {
            steps.push(`<strong>Problem:</strong> ${fd.num1}/${fd.denom} ${fd.op || '+'} ${fd.num2}/${fd.denom}`);
            steps.push(`<strong>Step 1:</strong> Same denominator! Keep it.`);
            steps.push(`<strong>Step 2:</strong> ${fd.op === '+' ? 'Add' : 'Subtract'} the numerators`);
            const result = fd.op === '+' ? fd.num1 + fd.num2 : fd.num1 - fd.num2;
            steps.push(`&nbsp;&nbsp;${fd.num1} ${fd.op || '+'} ${fd.num2} = ${result}`);
            steps.push(`<strong>Answer: ${result}/${fd.denom}</strong>`);
        }
        // Improper to mixed
        else if (fd.totalNum !== undefined && fd.wholes !== undefined) {
            steps.push(`<strong>Problem:</strong> Convert ${fd.totalNum}/${fd.den} to mixed number`);
            steps.push(`<strong>Step 1:</strong> Divide numerator by denominator`);
            steps.push(`&nbsp;&nbsp;${fd.totalNum} ÷ ${fd.den} = ${fd.wholes} remainder ${fd.extraNum}`);
            steps.push(`<strong>Step 2:</strong> Whole number = quotient = ${fd.wholes}`);
            steps.push(`<strong>Step 3:</strong> New numerator = remainder = ${fd.extraNum}`);
            steps.push(`<strong>Step 4:</strong> Denominator stays the same = ${fd.den}`);
            steps.push(`<strong>Answer: ${fd.wholes} ${fd.extraNum}/${fd.den}</strong>`);
        }
        // Mixed to improper
        else if (fd.wholes !== undefined && fd.extraNum !== undefined && fd.den && !fd.totalNum) {
            steps.push(`<strong>Problem:</strong> Convert ${fd.wholes} ${fd.extraNum}/${fd.den} to improper fraction`);
            steps.push(`<strong>Step 1:</strong> Multiply whole number × denominator`);
            steps.push(`&nbsp;&nbsp;${fd.wholes} × ${fd.den} = ${fd.wholes * fd.den}`);
            steps.push(`<strong>Step 2:</strong> Add the numerator`);
            steps.push(`&nbsp;&nbsp;${fd.wholes * fd.den} + ${fd.extraNum} = ${fd.wholes * fd.den + fd.extraNum}`);
            steps.push(`<strong>Step 3:</strong> Keep the same denominator`);
            steps.push(`<strong>Answer: ${fd.wholes * fd.den + fd.extraNum}/${fd.den}</strong>`);
        }
        // Multiply fractions
        else if (fd.op === '×' || fd.op === '*') {
            steps.push(`<strong>Problem:</strong> ${fd.num1}/${fd.denom1} × ${fd.num2}/${fd.denom2}`);
            steps.push(`<strong>Step 1:</strong> Multiply numerators: ${fd.num1} × ${fd.num2} = ${fd.num1 * fd.num2}`);
            steps.push(`<strong>Step 2:</strong> Multiply denominators: ${fd.denom1} × ${fd.denom2} = ${fd.denom1 * fd.denom2}`);
            steps.push(`<strong>Step 3:</strong> Simplify if possible`);
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        }
        // Divide fractions
        else if (fd.op === '÷') {
            steps.push(`<strong>Problem:</strong> ${fd.num1}/${fd.denom1} ÷ ${fd.num2}/${fd.denom2}`);
            steps.push(`<strong>Step 1:</strong> Keep the first fraction`);
            steps.push(`<strong>Step 2:</strong> Change ÷ to ×`);
            steps.push(`<strong>Step 3:</strong> Flip the second fraction (reciprocal)`);
            steps.push(`&nbsp;&nbsp;${fd.num1}/${fd.denom1} × ${fd.denom2}/${fd.num2}`);
            steps.push(`<strong>Step 4:</strong> Multiply across`);
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        }
        // Compare fractions
        else if (fd.symbol) {
            steps.push(`<strong>Problem:</strong> Compare ${fd.num1}/${fd.denom1} and ${fd.num2}/${fd.denom2}`);
            steps.push(`<strong>Step 1:</strong> Find common denominator or cross multiply`);
            steps.push(`<strong>Step 2:</strong> ${fd.num1} × ${fd.denom2} = ${fd.num1 * fd.denom2}`);
            steps.push(`<strong>Step 3:</strong> ${fd.num2} × ${fd.denom1} = ${fd.num2 * fd.denom1}`);
            steps.push(`<strong>Step 4:</strong> Compare: ${fd.num1 * fd.denom2} vs ${fd.num2 * fd.denom1}`);
            steps.push(`<strong>Answer: ${fd.symbol}</strong>`);
        }
        // Equivalent fractions
        else if (fd.factor) {
            steps.push(`<strong>Problem:</strong> Find equivalent fraction`);
            steps.push(`<strong>Step 1:</strong> Multiply/divide both numerator and denominator by same number`);
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        }
        // Simplify fractions
        else if (fd.gcd) {
            steps.push(`<strong>Problem:</strong> Simplify ${fd.originalNum}/${fd.originalDen}`);
            steps.push(`<strong>Step 1:</strong> Find GCD of ${fd.originalNum} and ${fd.originalDen}`);
            steps.push(`&nbsp;&nbsp;GCD = ${fd.gcd}`);
            steps.push(`<strong>Step 2:</strong> Divide both by GCD`);
            steps.push(`&nbsp;&nbsp;${fd.originalNum} ÷ ${fd.gcd} = ${fd.originalNum / fd.gcd}`);
            steps.push(`&nbsp;&nbsp;${fd.originalDen} ÷ ${fd.gcd} = ${fd.originalDen / fd.gcd}`);
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        }
        else {
            steps.push(`<strong>Problem:</strong> ${q.text.replace(' = ___', '')}`);
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        }
    }
    // ========================================
    // DECIMALS
    // ========================================
    else if (q.decimalData) {
        const dd = q.decimalData;
        if (dd.op === '+') {
            steps.push(`<strong>Problem:</strong> ${dd.a} + ${dd.b}`);
            steps.push(`<strong>Step 1:</strong> Line up the decimal points vertically`);
            steps.push(`<strong>Step 2:</strong> Add zeros as placeholders if needed`);
            steps.push(`<strong>Step 3:</strong> Add each column from right to left`);
            steps.push(`<strong>Step 4:</strong> Bring down the decimal point`);
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        } else if (dd.op === '-' || dd.op === '−') {
            steps.push(`<strong>Problem:</strong> ${dd.a} - ${dd.b}`);
            steps.push(`<strong>Step 1:</strong> Line up the decimal points vertically`);
            steps.push(`<strong>Step 2:</strong> Add zeros as placeholders if needed`);
            steps.push(`<strong>Step 3:</strong> Subtract each column from right to left`);
            steps.push(`<strong>Step 4:</strong> Bring down the decimal point`);
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        } else if (dd.op === '×' || dd.op === '*') {
            const totalPlaces = dd.aPlaces + dd.bPlaces;
            steps.push(`<strong>Problem:</strong> ${dd.a} × ${dd.b}`);
            steps.push(`<strong>Step 1:</strong> Ignore decimals, multiply as whole numbers`);
            steps.push(`<strong>Step 2:</strong> Count total decimal places in both numbers`);
            steps.push(`&nbsp;&nbsp;${dd.a} has ${dd.aPlaces || 0} decimal places`);
            steps.push(`&nbsp;&nbsp;${dd.b} has ${dd.bPlaces || 0} decimal places`);
            steps.push(`&nbsp;&nbsp;Total = ${totalPlaces} places`);
            steps.push(`<strong>Step 3:</strong> Place decimal ${totalPlaces} places from right`);
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        } else if (dd.dividend !== undefined) {
            steps.push(`<strong>Problem:</strong> ${dd.dividend} ÷ ${dd.divisor}`);
            steps.push(`<strong>Step 1:</strong> Set up long division`);
            steps.push(`<strong>Step 2:</strong> If dividing by decimal, move decimal in both numbers`);
            steps.push(`<strong>Step 3:</strong> Divide normally, align decimal in answer`);
            steps.push(`<strong>Answer: ${dd.quotient}</strong>`);
        } else if (dd.answer && (dd.answer === '>' || dd.answer === '<' || dd.answer === '=')) {
            steps.push(`<strong>Problem:</strong> Compare ${dd.a} and ${dd.b}`);
            steps.push(`<strong>Step 1:</strong> Line up decimal points`);
            steps.push(`<strong>Step 2:</strong> Compare digit by digit from left to right`);
            steps.push(`<strong>Step 3:</strong> First different digit determines the answer`);
            steps.push(`<strong>Answer: ${dd.a} ${dd.answer} ${dd.b}</strong>`);
        } else if (dd.sorted) {
            steps.push(`<strong>Problem:</strong> Order: ${dd.nums.join(', ')}`);
            steps.push(`<strong>Step 1:</strong> Line up decimals to compare`);
            steps.push(`<strong>Step 2:</strong> Compare values`);
            steps.push(`<strong>Step 3:</strong> Arrange ${dd.direction === 'asc' ? 'least to greatest' : 'greatest to least'}`);
            steps.push(`<strong>Answer: ${dd.sorted.join(', ')}</strong>`);
        } else if (dd.target !== undefined) {
            steps.push(`<strong>Problem:</strong> Find decimal on number line`);
            steps.push(`<strong>Step 1:</strong> Identify the whole numbers on each end`);
            steps.push(`<strong>Step 2:</strong> Count tick marks (usually 10 = tenths)`);
            steps.push(`<strong>Step 3:</strong> Count to the marked position`);
            steps.push(`<strong>Answer: ${dd.target}</strong>`);
        } else {
            steps.push(`<strong>Problem:</strong> ${q.text.replace(' = ___', '')}`);
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        }
    }
    // ========================================
    // ESTIMATION
    // ========================================
    else if (q.estimationData) {
        const ed = q.estimationData;
        
        if (ed.strategy === 'rounding') {
            steps.push(`<strong>Problem:</strong> Estimate ${ed.a} ${ed.op} ${ed.b}`);
            steps.push(`<strong>Strategy:</strong> Round to nearest ${ed.roundTo}`);
            steps.push(`<strong>Step 1:</strong> Round ${ed.a}`);
            steps.push(`&nbsp;&nbsp;Look at the digit to the right of ${ed.roundTo}s place`);
            steps.push(`&nbsp;&nbsp;${ed.a} → ${ed.aRounded}`);
            steps.push(`<strong>Step 2:</strong> Round ${ed.b}`);
            steps.push(`&nbsp;&nbsp;${ed.b} → ${ed.bRounded}`);
            steps.push(`<strong>Step 3:</strong> Calculate estimate`);
            steps.push(`&nbsp;&nbsp;${ed.aRounded} ${ed.op} ${ed.bRounded} = ${ed.estimate}`);
            steps.push(`<strong>Estimated Answer: ${ed.estimate}</strong>`);
            if (ed.actual) steps.push(`<em>Actual answer: ${ed.actual}</em>`);
        } else if (ed.strategy === 'compatible') {
            steps.push(`<strong>Problem:</strong> Estimate ${ed.dividend} ÷ ${ed.divisor}`);
            steps.push(`<strong>Strategy:</strong> Compatible Numbers`);
            steps.push(`<strong>Step 1:</strong> Find a number close to ${ed.dividend} that divides easily by ${ed.divisor}`);
            steps.push(`&nbsp;&nbsp;${ed.dividend} → ${ed.compatible}`);
            steps.push(`<strong>Step 2:</strong> Divide`);
            steps.push(`&nbsp;&nbsp;${ed.compatible} ÷ ${ed.divisor} = ${ed.estimate}`);
            steps.push(`<strong>Estimated Answer: ${ed.estimate}</strong>`);
        } else if (ed.strategy === 'frontend') {
            steps.push(`<strong>Problem:</strong> Estimate ${ed.a} ${ed.op} ${ed.b}`);
            steps.push(`<strong>Strategy:</strong> Front-End Estimation`);
            steps.push(`<strong>Step 1:</strong> Use only the front (leftmost) digits`);
            steps.push(`&nbsp;&nbsp;${ed.a} → ${ed.aFront}`);
            steps.push(`&nbsp;&nbsp;${ed.b} → ${ed.bFront}`);
            steps.push(`<strong>Step 2:</strong> Calculate with front-end digits`);
            steps.push(`&nbsp;&nbsp;${ed.aFront} ${ed.op} ${ed.bFront} = ${ed.estimate}`);
            steps.push(`<strong>Estimated Answer: ${ed.estimate}</strong>`);
            if (ed.actual) steps.push(`<em>Actual answer: ${ed.actual}</em>`);
        } else {
            steps.push(`<strong>Problem:</strong> Estimate ${ed.a} ${ed.op} ${ed.b}`);
            steps.push(`<strong>Estimated Answer: ${ed.estimate || q.ans}</strong>`);
        }
    }
    // ========================================
    // INTEGERS
    // ========================================
    else if (q.integerData) {
        const id = q.integerData;
        if (id.op === '+') {
            steps.push(`<strong>Problem:</strong> ${id.a} + ${id.b}`);
            const sameSign = (id.a >= 0) === (id.b >= 0);
            if (sameSign) {
                steps.push(`<strong>Rule:</strong> Same signs → Add absolute values, keep the sign`);
                steps.push(`<strong>Step 1:</strong> |${id.a}| + |${id.b}| = ${Math.abs(id.a)} + ${Math.abs(id.b)} = ${Math.abs(id.a) + Math.abs(id.b)}`);
                steps.push(`<strong>Step 2:</strong> Keep the sign: ${id.a >= 0 ? 'positive' : 'negative'}`);
            } else {
                steps.push(`<strong>Rule:</strong> Different signs → Subtract absolute values, use sign of larger`);
                steps.push(`<strong>Step 1:</strong> |${id.a}| = ${Math.abs(id.a)}, |${id.b}| = ${Math.abs(id.b)}`);
                steps.push(`<strong>Step 2:</strong> ${Math.max(Math.abs(id.a), Math.abs(id.b))} - ${Math.min(Math.abs(id.a), Math.abs(id.b))} = ${Math.abs(Math.abs(id.a) - Math.abs(id.b))}`);
                steps.push(`<strong>Step 3:</strong> Use sign of number with larger absolute value`);
            }
            steps.push(`<strong>Answer: ${id.result}</strong>`);
        } else if (id.op === '-' || id.op === '−') {
            steps.push(`<strong>Problem:</strong> ${id.a} - ${id.b}`);
            steps.push(`<strong>Rule:</strong> Subtracting = Adding the opposite`);
            steps.push(`<strong>Step 1:</strong> Change subtraction to addition`);
            steps.push(`<strong>Step 2:</strong> Change sign of second number`);
            steps.push(`&nbsp;&nbsp;${id.a} - ${id.b} = ${id.a} + (${-id.b})`);
            steps.push(`<strong>Step 3:</strong> Now add using integer addition rules`);
            steps.push(`<strong>Answer: ${id.result}</strong>`);
        } else if (id.answer) {
            steps.push(`<strong>Problem:</strong> Compare ${id.a} and ${id.b}`);
            steps.push(`<strong>Rule:</strong> On a number line, right is greater`);
            steps.push(`<strong>Step 1:</strong> Positive numbers are always > negative numbers`);
            steps.push(`<strong>Step 2:</strong> For same sign, compare absolute values`);
            steps.push(`<strong>Answer: ${id.a} ${id.answer} ${id.b}</strong>`);
        } else if (id.target !== undefined) {
            steps.push(`<strong>Problem:</strong> Find the integer on the number line`);
            steps.push(`<strong>Step 1:</strong> Zero is in the middle`);
            steps.push(`<strong>Step 2:</strong> Count right for positive, left for negative`);
            steps.push(`<strong>Answer: ${id.target}</strong>`);
        }
    }
    // ========================================
    // ALGEBRA
    // ========================================
    else if (q.algebraData) {
        const ad = q.algebraData;
        if (ad.answer !== undefined && ad.op && ad.known !== undefined) {
            const opSymbols = {'+': '+', '-': '−', '×': '×', '÷': '÷'};
            const inverseOps = {'+': '−', '-': '+', '×': '÷', '÷': '×'};
            steps.push(`<strong>Problem:</strong> x ${opSymbols[ad.op] || ad.op} ${ad.known} = ${ad.total}`);
            steps.push(`<strong>Goal:</strong> Get x alone on one side`);
            steps.push(`<strong>Step 1:</strong> Use inverse operation`);
            steps.push(`&nbsp;&nbsp;Inverse of ${opSymbols[ad.op] || ad.op} is ${inverseOps[ad.op]}`);
            steps.push(`<strong>Step 2:</strong> Apply to both sides`);
            if (ad.op === '+') {
                steps.push(`&nbsp;&nbsp;x + ${ad.known} − ${ad.known} = ${ad.total} − ${ad.known}`);
                steps.push(`&nbsp;&nbsp;x = ${ad.total - ad.known}`);
            } else if (ad.op === '-' || ad.op === '−') {
                steps.push(`&nbsp;&nbsp;x − ${ad.known} + ${ad.known} = ${ad.total} + ${ad.known}`);
                steps.push(`&nbsp;&nbsp;x = ${ad.total + ad.known}`);
            } else if (ad.op === '×') {
                steps.push(`&nbsp;&nbsp;x × ${ad.known} ÷ ${ad.known} = ${ad.total} ÷ ${ad.known}`);
                steps.push(`&nbsp;&nbsp;x = ${ad.total / ad.known}`);
            } else if (ad.op === '÷') {
                steps.push(`&nbsp;&nbsp;x ÷ ${ad.known} × ${ad.known} = ${ad.total} × ${ad.known}`);
                steps.push(`&nbsp;&nbsp;x = ${ad.total * ad.known}`);
            }
            steps.push(`<strong>Answer: x = ${ad.answer}</strong>`);
        } else if (ad.expression && ad.varVal !== undefined) {
            steps.push(`<strong>Problem:</strong> Evaluate ${ad.expression} when n = ${ad.varVal}`);
            steps.push(`<strong>Step 1:</strong> Substitute ${ad.varVal} for every n`);
            const substituted = ad.expression.replace(/n/g, ad.varVal);
            steps.push(`&nbsp;&nbsp;${ad.expression} → ${substituted}`);
            steps.push(`<strong>Step 2:</strong> Follow order of operations`);
            steps.push(`<strong>Answer: ${ad.result}</strong>`);
        } else if (ad.template) {
            steps.push(`<strong>Problem:</strong> Write as math expression`);
            steps.push(`<strong>Words:</strong> ${ad.template}`);
            steps.push(`<strong>Key words:</strong>`);
            steps.push(`&nbsp;&nbsp;"sum" or "plus" → +`);
            steps.push(`&nbsp;&nbsp;"difference" or "minus" → −`);
            steps.push(`&nbsp;&nbsp;"product" or "times" → ×`);
            steps.push(`&nbsp;&nbsp;"quotient" or "divided by" → ÷`);
            steps.push(`<strong>Answer: ${ad.answer || q.ans}</strong>`);
        } else if (ad.testVal !== undefined && ad.symbol && ad.boundary !== undefined) {
            steps.push(`<strong>Problem:</strong> Is ${ad.testVal} ${ad.symbol} ${ad.boundary} true?`);
            steps.push(`<strong>Step 1:</strong> Understand the symbol`);
            const symbolMeanings = {'>': 'greater than', '<': 'less than', '≥': 'greater than or equal', '≤': 'less than or equal'};
            steps.push(`&nbsp;&nbsp;${ad.symbol} means "${symbolMeanings[ad.symbol]}"`);
            steps.push(`<strong>Step 2:</strong> Test: Is ${ad.testVal} ${symbolMeanings[ad.symbol]} ${ad.boundary}?`);
            steps.push(`<strong>Answer: ${ad.isTrue ? 'TRUE' : 'FALSE'}</strong>`);
        } else {
            steps.push(`<strong>Problem:</strong> ${q.text.replace(' = ___', '')}`);
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        }
    }
    // ========================================
    // GEOMETRY
    // ========================================
    else if (q.geometryData) {
        const gd = q.geometryData;
        if (gd.perimeter !== undefined) {
            steps.push(`<strong>Problem:</strong> Find perimeter of ${gd.shape}`);
            steps.push(`<strong>Definition:</strong> Perimeter = distance around the shape`);
            if (gd.shape === 'rectangle') {
                steps.push(`<strong>Formula:</strong> P = 2 × length + 2 × width`);
                steps.push(`<strong>Step 1:</strong> P = 2 × ${gd.length} + 2 × ${gd.width}`);
                steps.push(`<strong>Step 2:</strong> P = ${2 * gd.length} + ${2 * gd.width}`);
                steps.push(`<strong>Step 3:</strong> P = ${gd.perimeter}`);
            } else if (gd.shape === 'square') {
                steps.push(`<strong>Formula:</strong> P = 4 × side`);
                steps.push(`<strong>Step 1:</strong> P = 4 × ${gd.side}`);
                steps.push(`<strong>Step 2:</strong> P = ${gd.perimeter}`);
            } else if (gd.shape === 'triangle') {
                steps.push(`<strong>Formula:</strong> P = side1 + side2 + side3`);
                steps.push(`<strong>Step 1:</strong> Add all sides`);
            }
            steps.push(`<strong>Answer: ${gd.perimeter} units</strong>`);
        } else if (gd.area !== undefined) {
            steps.push(`<strong>Problem:</strong> Find area of ${gd.shape}`);
            steps.push(`<strong>Definition:</strong> Area = space inside the shape`);
            if (gd.shape === 'rectangle') {
                steps.push(`<strong>Formula:</strong> A = length × width`);
                steps.push(`<strong>Step 1:</strong> A = ${gd.length} × ${gd.width}`);
                steps.push(`<strong>Step 2:</strong> A = ${gd.area}`);
            } else if (gd.shape === 'square') {
                steps.push(`<strong>Formula:</strong> A = side × side = side²`);
                steps.push(`<strong>Step 1:</strong> A = ${gd.side} × ${gd.side}`);
                steps.push(`<strong>Step 2:</strong> A = ${gd.area}`);
            } else if (gd.shape === 'triangle') {
                steps.push(`<strong>Formula:</strong> A = ½ × base × height`);
                steps.push(`<strong>Step 1:</strong> A = ½ × ${gd.base} × ${gd.height}`);
                steps.push(`<strong>Step 2:</strong> A = ${gd.base * gd.height} ÷ 2`);
                steps.push(`<strong>Step 3:</strong> A = ${gd.area}`);
            }
            steps.push(`<strong>Answer: ${gd.area} square units</strong>`);
        } else if (gd.volume !== undefined) {
            steps.push(`<strong>Problem:</strong> Find volume of rectangular prism`);
            steps.push(`<strong>Definition:</strong> Volume = space inside a 3D shape`);
            steps.push(`<strong>Formula:</strong> V = length × width × height`);
            steps.push(`<strong>Step 1:</strong> V = ${gd.length} × ${gd.width} × ${gd.height}`);
            steps.push(`<strong>Step 2:</strong> V = ${gd.length * gd.width} × ${gd.height}`);
            steps.push(`<strong>Step 3:</strong> V = ${gd.volume}`);
            steps.push(`<strong>Answer: ${gd.volume} cubic units</strong>`);
        } else if (gd.angleType) {
            steps.push(`<strong>Problem:</strong> Identify the angle type`);
            steps.push(`<strong>Angle Types:</strong>`);
            steps.push(`&nbsp;&nbsp;Acute: less than 90°`);
            steps.push(`&nbsp;&nbsp;Right: exactly 90°`);
            steps.push(`&nbsp;&nbsp;Obtuse: between 90° and 180°`);
            steps.push(`&nbsp;&nbsp;Straight: exactly 180°`);
            if (gd.degrees) steps.push(`<strong>This angle:</strong> ${gd.degrees}°`);
            steps.push(`<strong>Answer: ${gd.angleType}</strong>`);
        } else if (gd.degrees !== undefined && !gd.angleType) {
            steps.push(`<strong>Problem:</strong> Measure the angle`);
            steps.push(`<strong>Step 1:</strong> Place protractor center at vertex`);
            steps.push(`<strong>Step 2:</strong> Align base with one ray`);
            steps.push(`<strong>Step 3:</strong> Read where other ray crosses`);
            steps.push(`<strong>Answer: ${gd.degrees}°</strong>`);
        } else if (gd.lineType) {
            steps.push(`<strong>Problem:</strong> Identify line relationship`);
            steps.push(`<strong>Types:</strong>`);
            steps.push(`&nbsp;&nbsp;Parallel (∥): Never intersect, same distance apart`);
            steps.push(`&nbsp;&nbsp;Perpendicular (⊥): Intersect at 90°`);
            steps.push(`&nbsp;&nbsp;Intersecting: Cross but not at 90°`);
            steps.push(`<strong>Answer: ${gd.lineType}</strong>`);
        } else if (gd.symmetryLines !== undefined) {
            steps.push(`<strong>Problem:</strong> Count lines of symmetry`);
            steps.push(`<strong>Definition:</strong> A line of symmetry divides shape into mirror halves`);
            steps.push(`<strong>Step:</strong> Find all lines where folding creates matching halves`);
            steps.push(`<strong>Answer: ${gd.symmetryLines} line(s) of symmetry</strong>`);
        } else if (gd.x !== undefined && gd.y !== undefined) {
            steps.push(`<strong>Problem:</strong> Plot/identify point on coordinate grid`);
            steps.push(`<strong>Format:</strong> (x, y) = (horizontal, vertical)`);
            steps.push(`<strong>Step 1:</strong> Start at origin (0, 0)`);
            steps.push(`<strong>Step 2:</strong> Move ${gd.x} units ${gd.x >= 0 ? 'right' : 'left'}`);
            steps.push(`<strong>Step 3:</strong> Move ${gd.y} units ${gd.y >= 0 ? 'up' : 'down'}`);
            steps.push(`<strong>Answer: (${gd.x}, ${gd.y})</strong>`);
        } else if (gd.triangleType) {
            steps.push(`<strong>Problem:</strong> Classify the triangle`);
            steps.push(`<strong>By Sides:</strong>`);
            steps.push(`&nbsp;&nbsp;Equilateral: all 3 sides equal`);
            steps.push(`&nbsp;&nbsp;Isosceles: 2 sides equal`);
            steps.push(`&nbsp;&nbsp;Scalene: no sides equal`);
            steps.push(`<strong>By Angles:</strong>`);
            steps.push(`&nbsp;&nbsp;Acute: all angles < 90°`);
            steps.push(`&nbsp;&nbsp;Right: one angle = 90°`);
            steps.push(`&nbsp;&nbsp;Obtuse: one angle > 90°`);
            steps.push(`<strong>Answer: ${gd.triangleType}</strong>`);
        } else if (gd.quadType) {
            steps.push(`<strong>Problem:</strong> Classify the quadrilateral`);
            steps.push(`<strong>Types:</strong>`);
            steps.push(`&nbsp;&nbsp;Square: 4 equal sides, 4 right angles`);
            steps.push(`&nbsp;&nbsp;Rectangle: opposite sides equal, 4 right angles`);
            steps.push(`&nbsp;&nbsp;Rhombus: 4 equal sides`);
            steps.push(`&nbsp;&nbsp;Parallelogram: opposite sides parallel`);
            steps.push(`&nbsp;&nbsp;Trapezoid: exactly 1 pair parallel sides`);
            steps.push(`<strong>Answer: ${gd.quadType}</strong>`);
        } else {
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        }
    }
    // ========================================
    // MEASUREMENT
    // ========================================
    else if (q.measurementData) {
        const md = q.measurementData;
        if (md.hour !== undefined && md.minute !== undefined) {
            steps.push(`<strong>Problem:</strong> Read the analog clock`);
            steps.push(`<strong>Step 1:</strong> Find the short hand (hour hand)`);
            steps.push(`&nbsp;&nbsp;It points to: ${md.hour}`);
            steps.push(`<strong>Step 2:</strong> Find the long hand (minute hand)`);
            steps.push(`&nbsp;&nbsp;Each number = 5 minutes`);
            steps.push(`&nbsp;&nbsp;It points to: ${Math.floor(md.minute / 5)} (which is ${md.minute} minutes)`);
            steps.push(`<strong>Answer: ${md.hour}:${md.minute.toString().padStart(2, '0')}</strong>`);
        } else if (md.startHour !== undefined && md.endHour !== undefined) {
            steps.push(`<strong>Problem:</strong> Find elapsed time`);
            steps.push(`<strong>Start:</strong> ${md.startHour}:${(md.startMin || 0).toString().padStart(2, '0')}`);
            steps.push(`<strong>End:</strong> ${md.endHour}:${(md.endMin || 0).toString().padStart(2, '0')}`);
            steps.push(`<strong>Step 1:</strong> Count hours from start to end`);
            steps.push(`<strong>Step 2:</strong> Count extra minutes`);
            steps.push(`<strong>Step 3:</strong> Combine for total time`);
            steps.push(`<strong>Answer: ${md.totalMins || md.elapsed} minutes</strong>`);
        } else if (md.celsius !== undefined || md.fahrenheit !== undefined) {
            steps.push(`<strong>Problem:</strong> Temperature conversion`);
            if (md.direction === 'C_to_F') {
                steps.push(`<strong>Formula:</strong> °F = (°C × 9/5) + 32`);
                steps.push(`<strong>Step 1:</strong> ${md.celsius} × 9/5 = ${md.celsius * 9 / 5}`);
                steps.push(`<strong>Step 2:</strong> ${md.celsius * 9 / 5} + 32 = ${md.fahrenheit}`);
                steps.push(`<strong>Answer: ${md.fahrenheit}°F</strong>`);
            } else {
                steps.push(`<strong>Formula:</strong> °C = (°F - 32) × 5/9`);
                steps.push(`<strong>Step 1:</strong> ${md.fahrenheit} - 32 = ${md.fahrenheit - 32}`);
                steps.push(`<strong>Step 2:</strong> ${md.fahrenheit - 32} × 5/9 = ${md.celsius}`);
                steps.push(`<strong>Answer: ${md.celsius}°C</strong>`);
            }
        } else if (md.change !== undefined) {
            steps.push(`<strong>Problem:</strong> Calculate change`);
            steps.push(`<strong>Paid:</strong> $${md.paid ? md.paid.toFixed(2) : md.given ? md.given.toFixed(2) : '?'}`);
            steps.push(`<strong>Cost:</strong> $${md.cost.toFixed(2)}`);
            steps.push(`<strong>Step 1:</strong> Subtract cost from amount paid`);
            steps.push(`<strong>Answer: $${md.change.toFixed(2)}</strong>`);
        } else if (md.conversion) {
            steps.push(`<strong>Problem:</strong> Convert ${md.value} ${md.from} to ${md.to}`);
            steps.push(`<strong>Conversion factor:</strong> ${md.factor}`);
            steps.push(`<strong>Step 1:</strong> Multiply or divide by conversion factor`);
            steps.push(`<strong>Answer: ${md.answer} ${md.to}</strong>`);
        } else {
            steps.push(`<strong>Problem:</strong> ${q.text.replace(' = ___', '')}`);
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        }
    }
    // ========================================
    // DATA & STATISTICS
    // ========================================
    else if (q.dataData) {
        const ds = q.dataData;
        const nums = ds.nums || [];
        if (ds.mean !== undefined) {
            steps.push(`<strong>Problem:</strong> Find the mean (average)`);
            steps.push(`<strong>Data:</strong> ${nums.join(', ')}`);
            steps.push(`<strong>Formula:</strong> Mean = Sum ÷ Count`);
            steps.push(`<strong>Step 1:</strong> Add all values`);
            steps.push(`&nbsp;&nbsp;${nums.join(' + ')} = ${ds.sum}`);
            steps.push(`<strong>Step 2:</strong> Count how many values`);
            steps.push(`&nbsp;&nbsp;Count = ${nums.length}`);
            steps.push(`<strong>Step 3:</strong> Divide`);
            steps.push(`&nbsp;&nbsp;${ds.sum} ÷ ${nums.length} = ${ds.mean}`);
            steps.push(`<strong>Answer: ${ds.mean}</strong>`);
        } else if (ds.median !== undefined) {
            const sorted = [...nums].sort((a, b) => a - b);
            steps.push(`<strong>Problem:</strong> Find the median (middle value)`);
            steps.push(`<strong>Data:</strong> ${nums.join(', ')}`);
            steps.push(`<strong>Step 1:</strong> Put numbers in order`);
            steps.push(`&nbsp;&nbsp;${sorted.join(', ')}`);
            steps.push(`<strong>Step 2:</strong> Find the middle`);
            if (sorted.length % 2 === 1) {
                const midIndex = Math.floor(sorted.length / 2);
                steps.push(`&nbsp;&nbsp;${sorted.length} numbers → middle is position ${midIndex + 1}`);
            } else {
                steps.push(`&nbsp;&nbsp;${sorted.length} numbers → average the two middle values`);
            }
            steps.push(`<strong>Answer: ${ds.median}</strong>`);
        } else if (ds.mode !== undefined) {
            steps.push(`<strong>Problem:</strong> Find the mode (most frequent)`);
            steps.push(`<strong>Data:</strong> ${nums.join(', ')}`);
            steps.push(`<strong>Step 1:</strong> Count how many times each number appears`);
            const counts = {};
            nums.forEach(v => counts[v] = (counts[v] || 0) + 1);
            Object.keys(counts).forEach(k => {
                steps.push(`&nbsp;&nbsp;${k} appears ${counts[k]} time(s)`);
            });
            steps.push(`<strong>Step 2:</strong> Find the most frequent`);
            steps.push(`<strong>Answer: ${ds.mode}</strong>`);
        } else if (ds.range !== undefined) {
            steps.push(`<strong>Problem:</strong> Find the range`);
            steps.push(`<strong>Data:</strong> ${nums.join(', ')}`);
            steps.push(`<strong>Formula:</strong> Range = Maximum - Minimum`);
            steps.push(`<strong>Step 1:</strong> Find maximum: ${ds.max}`);
            steps.push(`<strong>Step 2:</strong> Find minimum: ${ds.min}`);
            steps.push(`<strong>Step 3:</strong> Subtract: ${ds.max} - ${ds.min} = ${ds.range}`);
            steps.push(`<strong>Answer: ${ds.range}</strong>`);
        } else if (ds.probability !== undefined || ds.favorable !== undefined) {
            steps.push(`<strong>Problem:</strong> Find the probability`);
            steps.push(`<strong>Formula:</strong> P = favorable outcomes ÷ total outcomes`);
            steps.push(`<strong>Step 1:</strong> Count favorable outcomes: ${ds.favorable}`);
            steps.push(`<strong>Step 2:</strong> Count total outcomes: ${ds.total}`);
            steps.push(`<strong>Step 3:</strong> Write as fraction: ${ds.favorable}/${ds.total}`);
            steps.push(`<strong>Answer: ${ds.favorable}/${ds.total}</strong>`);
        } else if (ds.graphType) {
            steps.push(`<strong>Problem:</strong> Read the ${ds.graphType}`);
            steps.push(`<strong>Step 1:</strong> Read the title and axis labels`);
            steps.push(`<strong>Step 2:</strong> Find the data point asked about`);
            steps.push(`<strong>Step 3:</strong> Read the value`);
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        } else {
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        }
    }
    // ========================================
    // PATTERNS
    // ========================================
    else if (q.patternData) {
        const pd = q.patternData;
        steps.push(`<strong>Problem:</strong> ${q.text.replace(' = ___', '')}`);
        if (pd.rule) {
            steps.push(`<strong>Pattern Rule:</strong> ${pd.rule}`);
        }
        if (pd.sequence) {
            steps.push(`<strong>Sequence:</strong> ${pd.sequence.join(', ')}, ...`);
        }
        steps.push(`<strong>Step 1:</strong> Find the pattern/rule`);
        if (pd.step) {
            steps.push(`&nbsp;&nbsp;Each number ${pd.step > 0 ? 'increases' : 'decreases'} by ${Math.abs(pd.step)}`);
        }
        steps.push(`<strong>Step 2:</strong> Apply the rule to find the answer`);
        steps.push(`<strong>Answer: ${q.ans}</strong>`);
    }
    // ========================================
    // ROUNDING
    // ========================================
    else if (q.roundingData) {
        const rd = q.roundingData;
        steps.push(`<strong>Problem:</strong> Round ${rd.original} to the nearest ${rd.place}`);
        steps.push(`<strong>Step 1:</strong> Find the ${rd.place} digit`);
        steps.push(`<strong>Step 2:</strong> Look at the digit to its RIGHT`);
        steps.push(`<strong>Step 3:</strong> If it's 5 or more, round UP`);
        steps.push(`<strong>Step 4:</strong> If it's 4 or less, round DOWN`);
        if (rd.decisionDigit !== undefined) {
            steps.push(`&nbsp;&nbsp;The digit to the right is ${rd.decisionDigit}`);
            steps.push(`&nbsp;&nbsp;${rd.decisionDigit >= 5 ? 'Round UP' : 'Round DOWN'}`);
        }
        steps.push(`<strong>Answer: ${rd.rounded}</strong>`);
    }
    // ========================================
    // PLACE VALUE
    // ========================================
    else if (q.placeValueData) {
        const pv = q.placeValueData;
        if (pv.expanded) {
            steps.push(`<strong>Problem:</strong> Write ${pv.number} in expanded form`);
            steps.push(`<strong>Step 1:</strong> Identify each digit's place value`);
            const numStr = pv.number.toString();
            const places = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
            for (let i = 0; i < numStr.length; i++) {
                const digit = numStr[i];
                const placeValue = Math.pow(10, numStr.length - 1 - i);
                if (digit !== '0') {
                    steps.push(`&nbsp;&nbsp;${digit} in ${places[numStr.length - 1 - i]} place = ${digit * placeValue}`);
                }
            }
            steps.push(`<strong>Answer: ${pv.expanded}</strong>`);
        } else if (pv.digit !== undefined && pv.place) {
            steps.push(`<strong>Problem:</strong> Find the digit in the ${pv.place} place`);
            steps.push(`<strong>Number:</strong> ${pv.number}`);
            steps.push(`<strong>Step 1:</strong> Count places from the right`);
            steps.push(`&nbsp;&nbsp;ones, tens, hundreds, thousands...`);
            steps.push(`<strong>Answer: ${pv.digit}</strong>`);
        } else if (pv.value) {
            steps.push(`<strong>Problem:</strong> Find the VALUE of the ${pv.digitAsked} in ${pv.number}`);
            steps.push(`<strong>Step 1:</strong> Find the place: ${pv.place}`);
            steps.push(`<strong>Step 2:</strong> Value = digit × place value`);
            steps.push(`<strong>Answer: ${pv.value}</strong>`);
        } else {
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        }
    }
    // ========================================
    // CONVERSIONS
    // ========================================
    else if (q.conversionData) {
        const cd = q.conversionData;
        steps.push(`<strong>Problem:</strong> Convert ${cd.value} ${cd.from} to ${cd.to}`);
        steps.push(`<strong>Conversion:</strong> ${cd.conversionFact || `1 ${cd.to} = ? ${cd.from}`}`);
        if (cd.factor) {
            if (cd.operation === 'multiply') {
                steps.push(`<strong>Step 1:</strong> Multiply by ${cd.factor}`);
                steps.push(`&nbsp;&nbsp;${cd.value} × ${cd.factor} = ${cd.answer}`);
            } else {
                steps.push(`<strong>Step 1:</strong> Divide by ${cd.factor}`);
                steps.push(`&nbsp;&nbsp;${cd.value} ÷ ${cd.factor} = ${cd.answer}`);
            }
        }
        steps.push(`<strong>Answer: ${cd.answer} ${cd.to}</strong>`);
    }
    // ========================================
    // NUMBER THEORY (already comprehensive)
    // ========================================
    else if (q.numberTheoryData) {
        const nt = q.numberTheoryData;
        
        // Prime/Composite Classification (sort list)
        if (nt.type === 'prime_composite_classify') {
            steps.push(`<strong>Problem:</strong> Sort into prime or composite: ${nt.allNums.join(', ')}`);
            steps.push(`<strong>Remember:</strong>`);
            steps.push(`&nbsp;&nbsp;Prime = exactly 2 factors (1 and itself)`);
            steps.push(`&nbsp;&nbsp;Composite = more than 2 factors`);
            steps.push(`<strong>Check each number:</strong>`);
            nt.allNums.forEach(n => {
                const isPrime = nt.primes.includes(n);
                if (isPrime) {
                    steps.push(`&nbsp;&nbsp;${n}: factors are 1 and ${n} only → <span style="color:#27ae60;">PRIME</span>`);
                } else {
                    for (let i = 2; i <= Math.sqrt(n); i++) {
                        if (n % i === 0) {
                            steps.push(`&nbsp;&nbsp;${n}: ${i} × ${n/i} = ${n} → <span style="color:#e67e22;">COMPOSITE</span>`);
                            break;
                        }
                    }
                }
            });
            steps.push(`<strong>Answer:</strong>`);
            steps.push(`&nbsp;&nbsp;Prime: ${nt.primes.sort((a,b)=>a-b).join(', ')}`);
            steps.push(`&nbsp;&nbsp;Composite: ${nt.composites.sort((a,b)=>a-b).join(', ')}`);
        }
        else if (nt.type === 'prime_composite_compare') {
            steps.push(`<strong>Problem:</strong> Which is composite: ${nt.nums[0]} or ${nt.nums[1]}?`);
            steps.push(`<strong>Test ${nt.prime}:</strong> Factors are 1 and ${nt.prime} only → PRIME`);
            steps.push(`<strong>Test ${nt.composite}:</strong>`);
            nt.factorPairs.forEach(pair => {
                steps.push(`&nbsp;&nbsp;${pair[0]} × ${pair[1]} = ${nt.composite}`);
            });
            steps.push(`&nbsp;&nbsp;→ COMPOSITE (has more than 2 factors)`);
            steps.push(`<strong>Answer: ${nt.composite} is composite</strong>`);
            steps.push(`<strong>Proof:</strong> ${nt.factorPairs[1][0]} × ${nt.factorPairs[1][1]} = ${nt.composite}`);
        }
        else if (nt.type === 'prime_composite') {
            const factors = [];
            for (let i = 1; i <= nt.num; i++) { if (nt.num % i === 0) factors.push(i); }
            steps.push(`<strong>Problem:</strong> Is ${nt.num} prime or composite?`);
            steps.push(`<strong>Step 1:</strong> Find all factors: ${factors.join(', ')}`);
            steps.push(`<strong>Step 2:</strong> Count: ${factors.length} factors`);
            steps.push(`<strong>Answer: ${nt.num} is ${nt.isPrime ? 'PRIME' : 'COMPOSITE'}</strong>`);
        }
        else if (nt.type === 'factors_identify') {
            steps.push(`<strong>Problem:</strong> Circle all factors of ${nt.num}`);
            steps.push(`<strong>Test each number:</strong>`);
            nt.displayList.forEach(n => {
                const isFactor = nt.num % n === 0;
                steps.push(`&nbsp;&nbsp;${nt.num} ÷ ${n} = ${isFactor ? nt.num/n + ' ✓' : (nt.num/n).toFixed(2) + ' ✗'}`);
            });
            steps.push(`<strong>Answer: ${nt.factors.join(', ')}</strong>`);
        }
        else if (nt.type === 'factors_tchart') {
            steps.push(`<strong>Problem:</strong> Build factor T-chart for ${nt.num}`);
            steps.push(`<strong>Factor pairs:</strong>`);
            nt.factorPairs.forEach(pair => {
                steps.push(`&nbsp;&nbsp;${pair[0]} × ${pair[1]} = ${nt.num}`);
            });
            steps.push(`<strong>All factors: ${nt.allFactors.join(', ')}</strong>`);
        }
        else if (nt.type === 'factor_tchart_drag') {
            steps.push(`<strong>Problem:</strong> Drag factors to build T-chart for ${nt.num}`);
            steps.push(`<strong>Step 1:</strong> Find all factor pairs of ${nt.num}`);
            steps.push(`<strong>Step 2:</strong> Remember: Smaller factor goes on LEFT`);
            steps.push(`<strong>Factor Pairs:</strong>`);
            steps.push(`<div style="display:flex;justify-content:center;margin:10px 0;">
                <div style="border-left:3px solid var(--accent-cyan);border-bottom:3px solid #444;padding:5px;">
                    <div style="text-align:center;font-weight:700;border-bottom:3px solid #444;padding-bottom:5px;font-size:1.3rem;">${nt.num}</div>
                    <div style="display:flex;">
                        <div style="padding:5px 20px;border-right:3px solid var(--accent-cyan);text-align:center;">
                            <div style="font-size:0.8rem;color:var(--text-dim);">Left</div>
                            ${nt.factorPairs.map(p => `<div style="font-weight:600;">${p[0]}</div>`).join('')}
                        </div>
                        <div style="padding:5px 20px;text-align:center;">
                            <div style="font-size:0.8rem;color:var(--text-dim);">Right</div>
                            ${nt.factorPairs.map(p => `<div style="font-weight:600;">${p[1]}</div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>`);
            steps.push(`<strong>Step 3:</strong> Verify each pair multiplies to ${nt.num}:`);
            nt.factorPairs.forEach(pair => {
                steps.push(`&nbsp;&nbsp;${pair[0]} × ${pair[1]} = ${pair[0] * pair[1]} ✓`);
            });
            steps.push(`<strong>All ${nt.factorPairs.length} factor pairs complete!</strong>`);
        }
        else if (nt.type === 'factors') {
            steps.push(`<strong>Problem:</strong> How many factors does ${nt.num} have?`);
            steps.push(`<strong>Factors:</strong> ${nt.factors.join(', ')}`);
            steps.push(`<strong>Answer: ${nt.factors.length} factors</strong>`);
        }
        else if (nt.type === 'multiples_identify') {
            steps.push(`<strong>Problem:</strong> Circle all multiples of ${nt.num}`);
            steps.push(`<strong>Test each:</strong>`);
            nt.displayList.forEach(n => {
                const isMultiple = n % nt.num === 0;
                steps.push(`&nbsp;&nbsp;${n}: ${isMultiple ? nt.num + ' × ' + n/nt.num + ' ✓' : 'not divisible ✗'}`);
            });
            steps.push(`<strong>Answer: ${nt.correctMultiples.join(', ')}</strong>`);
        }
        else if (nt.type === 'multiples') {
            steps.push(`<strong>Problem:</strong> First 5 multiples of ${nt.num}`);
            for (let i = 1; i <= 5; i++) {
                steps.push(`&nbsp;&nbsp;${nt.num} × ${i} = ${nt.num * i}`);
            }
            steps.push(`<strong>Answer: ${nt.multiples.join(', ')}</strong>`);
        }
        else if (nt.type === 'gcf' || nt.type === 'gcf_easy' || nt.type === 'gcf_hard') {
            steps.push(`<strong>Problem:</strong> Greatest Common Factor of ${nt.a} and ${nt.b}`);
            steps.push(`<strong>Factors of ${nt.a}</strong> (${nt.factorsA.length} factors)<strong>:</strong> ${nt.factorsA.join(', ')}`);
            steps.push(`<strong>Factors of ${nt.b}</strong> (${nt.factorsB.length} factors)<strong>:</strong> ${nt.factorsB.join(', ')}`);
            steps.push(`<strong>Shared factors:</strong> ${nt.commonFactors.join(', ')}`);
            steps.push(`<strong>The greatest shared factor is: GCF = ${nt.gcf}</strong>`);
        }
        else if (nt.type === 'lcm') {
            steps.push(`<strong>Problem:</strong> LCM of ${nt.a} and ${nt.b}`);
            steps.push(`<strong>Multiples of ${nt.a}:</strong> ${nt.multiplesA.slice(0,6).join(', ')}...`);
            steps.push(`<strong>Multiples of ${nt.b}:</strong> ${nt.multiplesB.slice(0,6).join(', ')}...`);
            steps.push(`<strong>Answer: LCM = ${nt.lcm}</strong>`);
        }
        else if (nt.type === 'divisibility') {
            const rules = {2: 'ends in 0,2,4,6,8', 3: 'digit sum ÷ 3', 5: 'ends in 0 or 5', 6: 'divisible by 2 AND 3', 9: 'digit sum ÷ 9', 10: 'ends in 0'};
            steps.push(`<strong>Problem:</strong> Is ${nt.num} divisible by ${nt.divisor}?`);
            steps.push(`<strong>Rule for ${nt.divisor}:</strong> ${rules[nt.divisor]}`);
            steps.push(`<strong>Answer: ${nt.isDivisible ? 'YES' : 'NO'}</strong>`);
        }
        else if (nt.type === 'even_odd') {
            steps.push(`<strong>Problem:</strong> Is ${nt.num} even or odd?`);
            steps.push(`<strong>Ones digit:</strong> ${nt.num % 10}`);
            steps.push(`<strong>Answer: ${nt.isEven ? 'EVEN' : 'ODD'}</strong>`);
        }
        else {
            steps.push(`<strong>Answer: ${q.ans}</strong>`);
        }
    }
    // ========================================
    // DEFAULT FALLBACK
    // ========================================
    else {
        const problemText = q.text ? q.text.replace(' = ___', '').replace('___', '?') : 'Problem';
        steps.push(`<strong>Problem:</strong> ${problemText}`);
        if (q.hint) {
            steps.push(`<strong>Hint:</strong> ${q.hint}`);
        }
        steps.push(`<strong>Answer: ${q.ans}</strong>`);
    }
    
    return steps;
}

// ========================================
// T-CHART DRAG & DROP HANDLERS
// ========================================

// Track placed values for each T-chart
const tchartState = {};

