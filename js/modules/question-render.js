import { state } from './state.js';

export function renderQuestion() {
    const q = state.currentQ;

    // Safety check for invalid question
    if (!q || !q.text) {
        console.error("Invalid question generated, creating fallback");
        state.currentQ = {
            text: "5 + 5 = ?",
            ans: 10,
            hint: "Count up from 5",
            options: [8, 10, 12, 15],
            answerType: "number"
        };
        renderQuestion();
        return;
    }

    const card = document.getElementById("questionCard");
    card.classList.remove("correct-bg");
    document.getElementById("qNum").innerText = `Q${state.qCount}`;
    
    // Display skill label if available
    const skillLabelEl = document.getElementById("skillLabel");
    if (skillLabelEl) {
        skillLabelEl.textContent = q.skillLabel || '';
    }
    
    document.getElementById("questionText").innerText = q.text;

    const visualAid = document.getElementById("visualAid");
    
    // Determine if this question type REQUIRES visual display (regardless of difficulty)
    const requiresVisual = q.visual && (
        q.answerType === "area-model" ||
        q.answerType === "tchart-drag" ||
        q.answerType === "number-family" ||
        q.answerType === "fact-family" ||
        q.answerType === "dual" ||
        q.answerType === "coordinate-multi" ||
        q.answerType === "divisibility-sort" ||
        (q.answerType === "interactive" && (q.interactiveType === "ordering" || q.interactiveType === "expanded")) ||
        (q.visual && q.visual.includes('Column Addition')) ||
        (q.visual && q.visual.includes('Column Subtraction')) ||
        (q.visual && q.visual.includes('Column Multiplication')) ||
        (q.visual && q.visual.includes('Long Division')) ||
        (q.visual && q.visual.includes('column-answer-input')) ||
        (q.visual && q.visual.includes('area-model-input')) ||
        (q.visual && q.visual.includes('facts-column-visual')) ||
        // New visual skills where the visual IS the question
        (q.printFormat && ['arrays-groups', 'mult-properties', 'div-remainders',
            'fraction-of-set', 'equiv-frac-visual', 'area-unit-squares', 'perimeter-grid',
            'reading-ruler', 'money-count', 'line-plot-fractions',
            'tape-diagram', 'multi-step-word', 'skip-count-line', 'skip-count-grid',
            'rounding-visual', 'place-value-disks'].includes(q.printFormat))
    );
    
    if (requiresVisual || q.visual) {
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
    } else {
        visualAid.style.display = "none";
    }

    // Check for T-Chart drag-drop mode - always show visual regardless of difficulty
    if (q.answerType === "tchart-drag") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        if (state.ttsEnabled) speakQuestion();
        return;
    }
    
    // Check for area model mode - show visual and hide standard input
    if (q.answerType === "area-model") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        
        // Add listeners to area model inputs
        setTimeout(() => {
            const areaInputs = visualAid.querySelectorAll('.area-model-input, .area-model-total');
            areaInputs.forEach(input => {
                input.addEventListener('input', () => checkAreaModelAnswer(input));
            });
        }, 50);
        
        if (state.ttsEnabled) speakQuestion();
        return;
    }
    
    // Check for number family / fact family mode
    if (q.answerType === "number-family" || q.answerType === "fact-family") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        
        // Add listeners to number family inputs
        setTimeout(() => {
            const nfInputs = visualAid.querySelectorAll('.number-family-input, .fact-family-input');
            nfInputs.forEach(input => {
                input.addEventListener('input', () => checkNumberFamilyAnswer());
            });
        }, 50);
        
        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for interactive ordering mode
    if (q.answerType === "interactive" && q.interactiveType === "ordering") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = renderInteractiveOrdering(q);
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for interactive expanded form mode
    if (q.answerType === "interactive" && q.interactiveType === "expanded") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = renderInteractiveExpanded(q);
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        if (state.ttsEnabled) speakQuestion();
        return;
    }

    const useMultipleChoice = q.options.length > 0;
    document.getElementById("answerOptions").style.display = useMultipleChoice ? "grid" : "none";
    document.getElementById("answerInputArea").style.display = useMultipleChoice ? "none" : "flex";
    const answerInput = document.getElementById("answerInput");
    answerInput.value = "";
    answerInput.disabled = false;
    answerInput.style.borderColor = "transparent";
    answerInput.style.background = "";
    if (!useMultipleChoice) answerInput.focus();
    document.getElementById("feedbackArea").style.display = "none";
    document.getElementById("feedbackArea").className = "feedback-area";
    document.getElementById("hintBtn").style.display = "inline-block";
    // Hide solution button until answer is submitted
    const solutionBtn = document.getElementById("solutionBtn");
    if (solutionBtn) solutionBtn.style.display = "none";
    hideNextButton();

    if (useMultipleChoice) {
        const container = document.getElementById("answerOptions");
        container.innerHTML = "";
        q.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "answer-btn";
            // Display numbers with commas, but pass the raw value for checking
            btn.textContent = typeof opt === "number" && Number.isInteger(opt) ? opt.toLocaleString() : opt;
            btn.onclick = () => checkAnswer(opt, btn);

            // TTS on hover - speak when mouse enters, stop when mouse leaves
            btn.onmouseenter = () => speakAnswerOption(opt);
            btn.onmouseleave = () => stopSpeaking();

            container.appendChild(btn);
        });
    }

    if (state.ttsEnabled) speakQuestion();
}

// Interactive ordering state for click mode
let orderingState = { available: [], selected: [] };

// Interactive ordering - supports both input and click modes
export function renderInteractiveOrdering(q) {
    const direction = q.orderIcon || (q.orderDirection === "asc" ? "🔼 Smallest → Largest" : "🔽 Largest → Smallest");
    const numBoxes = q.numbers.length;
    const mode = q.orderMode || "input";

    if (mode === "click") {
        // Click-to-order mode
        orderingState = { available: [...q.numbers], selected: [] };

        return `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:15px;color:var(--text-dim);">${direction}</div>

            <!-- Selected numbers (answer area) -->
            <div style="margin-bottom:20px;">
                <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:8px;">Your order (click to remove):</div>
                <div id="selectedNumbers" style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;min-height:50px;padding:15px;background:var(--bg-card-light);border-radius:12px;border:2px dashed var(--accent-green);">
                    <span style="color:var(--text-dim);font-style:italic;" id="orderPlaceholder">Click numbers below to place them here...</span>
                </div>
            </div>

            <!-- Available numbers -->
            <div>
                <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:8px;">Available numbers:</div>
                <div id="availableNumbers" style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
                    ${q.numbers.map(n => `<div class="order-num-btn" onclick="selectOrderNumber(${n})" style="background:var(--accent-cyan);color:white;padding:14px 20px;border-radius:12px;font-weight:800;font-size:1.2rem;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 12px rgba(0,0,0,0.15);" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">${n.toLocaleString()}</div>`).join("")}
                </div>
            </div>

            <!-- Check button -->
            <button class="btn btn-primary" id="checkOrderBtn" onclick="checkOrderingAnswer()" style="margin-top:20px;opacity:0.5;pointer-events:none;">Check Order</button>
        </div>`;
    } else {
        // Input boxes mode
        return `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:15px;color:var(--text-dim);">${direction}</div>

            <!-- Show the numbers to order -->
            <div style="margin-bottom:20px;">
                <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">Numbers to order:</div>
                <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
                    ${q.numbers.map(n => `<div style="background:var(--accent-cyan);color:white;padding:14px 20px;border-radius:12px;font-weight:800;font-size:1.2rem;box-shadow:0 4px 12px rgba(0,0,0,0.15);">${n.toLocaleString()}</div>`).join("")}
                </div>
            </div>

            <!-- Input boxes for ordering -->
            <div style="margin-top:20px;">
                <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">Write each number in order:</div>
                <div id="orderInputBoxes" style="display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;">
                    ${Array.from({length: numBoxes}, (_, i) => `
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span style="background:var(--accent-orange);color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;">${i + 1}</span>
                            <input type="text" class="order-input-box" data-order-idx="${i}"
                                style="width:80px;height:44px;text-align:center;font-size:1.1rem;font-weight:700;border:3px solid var(--accent-cyan);border-radius:10px;background:var(--bg-card);color:var(--text-primary);outline:none;"
                                oninput="checkOrderInputsFilled()" placeholder="">
                            ${i < numBoxes - 1 ? '<span style="color:var(--accent-orange);font-size:1.5rem;margin:0 4px;">→</span>' : ''}
                        </div>
                    `).join("")}
                </div>
            </div>

            <!-- Check button -->
            <button class="btn btn-primary" id="checkOrderBtn" onclick="checkOrderingAnswer()" style="margin-top:20px;opacity:0.5;pointer-events:none;">Check Order</button>
        </div>`;
    }
}

// Click mode functions
export function selectOrderNumber(num) {
    if (state.hasAnswered) return;

    const idx = orderingState.available.indexOf(num);
    if (idx > -1) {
        orderingState.available.splice(idx, 1);
        orderingState.selected.push(num);
    }
    updateOrderingUI();
}

export function removeOrderNumber(num) {
    if (state.hasAnswered) return;

    const idx = orderingState.selected.indexOf(num);
    if (idx > -1) {
        orderingState.selected.splice(idx, 1);
        orderingState.available.push(num);
    }
    updateOrderingUI();
}

export function updateOrderingUI() {
    const availableContainer = document.getElementById("availableNumbers");
    const selectedContainer = document.getElementById("selectedNumbers");
    const checkBtn = document.getElementById("checkOrderBtn");

    if (!availableContainer || !selectedContainer) return;

    availableContainer.innerHTML = orderingState.available.map(n =>
        `<div class="order-num-btn" onclick="selectOrderNumber(${n})" style="background:var(--accent-cyan);color:white;padding:14px 20px;border-radius:12px;font-weight:800;font-size:1.2rem;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 12px rgba(0,0,0,0.15);" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">${n.toLocaleString()}</div>`
    ).join("");

    if (orderingState.selected.length === 0) {
        selectedContainer.innerHTML = '<span style="color:var(--text-dim);font-style:italic;" id="orderPlaceholder">Click numbers below to place them here...</span>';
    } else {
        selectedContainer.innerHTML = orderingState.selected.map((n, i) =>
            `<div onclick="removeOrderNumber(${n})" style="background:var(--accent-green);color:white;padding:14px 20px;border-radius:12px;font-weight:800;font-size:1.2rem;cursor:pointer;transition:transform 0.2s;position:relative;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <span style="position:absolute;top:-8px;left:-8px;background:var(--accent-orange);width:22px;height:22px;border-radius:50%;font-size:0.75rem;display:flex;align-items:center;justify-content:center;">${i + 1}</span>
                ${n.toLocaleString()}
            </div>`
        ).join('<span style="color:var(--accent-orange);font-size:1.5rem;">→</span>');
    }

    if (checkBtn) {
        const allSelected = orderingState.available.length === 0 && orderingState.selected.length > 0;
        checkBtn.style.opacity = allSelected ? "1" : "0.5";
        checkBtn.style.pointerEvents = allSelected ? "auto" : "none";
    }
}

export function checkOrderInputsFilled() {
    const inputs = document.querySelectorAll('.order-input-box');
    const checkBtn = document.getElementById('checkOrderBtn');
    if (!checkBtn) return;

    let allFilled = true;
    inputs.forEach(input => {
        if (!input.value.trim()) allFilled = false;
    });

    checkBtn.style.opacity = allFilled ? "1" : "0.5";
    checkBtn.style.pointerEvents = allFilled ? "auto" : "none";
}

export function checkOrderingAnswer() {
    if (state.hasAnswered) return;
    const q = state.currentQ;
    const mode = q.orderMode || "input";

    let userAnswer;
    if (mode === "click") {
        // Click mode - get from orderingState
        userAnswer = orderingState.selected.join(",");
    } else {
        // Input mode - get from input boxes
        const inputs = document.querySelectorAll('.order-input-box');
        const userValues = [];
        inputs.forEach(input => {
            const val = input.value.trim().replace(/,/g, '').replace(/\s/g, '');
            userValues.push(parseInt(val, 10) || 0);
        });
        userAnswer = userValues.join(",");
    }

    const isCorrect = userAnswer === q.ans;

    state.hasAnswered = true;

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";

    if (isCorrect) {
        feedback.className = "feedback-area correct";
        feedback.innerHTML = "🎉 Correct! Perfect order!";
        state.score++;
        state.xp += 10;
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        updateUI();
        saveState();

        if (state.gameMode === "boss") {
            const pushbackAmount = 15;
            state.monsterPos = Math.max(0, state.monsterPos - pushbackAmount);
            updateBossVisuals();
        }
        if (state.gameMode === "race") {
            const playerSpeed = getPlayerRaceSpeed();
            state.racePos = Math.min(100, state.racePos + playerSpeed);
            updateRaceVisuals();
        }

        if (shouldShowNextButton()) {
            setTimeout(() => nextQuestion(), 500);
        }
    } else {
        const correctValues = q.ans.split(",").map(n => Number(n));
        const correctOrder = correctValues.map(n => n.toLocaleString()).join(" → ");
        feedback.className = "feedback-area incorrect";
        feedback.innerHTML = `❌ The correct order is: ${correctOrder}`;
        document.getElementById("hintBtn").style.display = "none";

        if (mode === "click") {
            // Click mode - update selected area to show correct order
            const selectedContainer = document.getElementById("selectedNumbers");
            if (selectedContainer) {
                selectedContainer.style.borderColor = "var(--incorrect)";
                selectedContainer.innerHTML = correctValues.map((n, i) =>
                    `<div style="background:var(--incorrect);color:white;padding:14px 20px;border-radius:12px;font-weight:800;font-size:1.2rem;position:relative;">
                        <span style="position:absolute;top:-8px;left:-8px;background:var(--accent-orange);width:22px;height:22px;border-radius:50%;font-size:0.75rem;display:flex;align-items:center;justify-content:center;">${i + 1}</span>
                        ${n.toLocaleString()}
                    </div>`
                ).join('<span style="color:var(--accent-orange);font-size:1.5rem;">→</span>');
            }
        } else {
            // Input mode - show correct answers in the input boxes
            const inputs = document.querySelectorAll('.order-input-box');
            inputs.forEach((input, i) => {
                input.value = correctValues[i].toLocaleString();
                input.style.borderColor = "var(--incorrect)";
                input.style.background = "rgba(239,68,68,0.1)";
                input.disabled = true;
            });
        }

        if (shouldShowNextButton()) {
            showNextButton();
        }
    }

    // Disable further interaction
    const checkBtn = document.getElementById("checkOrderBtn");
    if (checkBtn) checkBtn.style.display = "none";

    // Disable all inputs
    document.querySelectorAll('.order-input-box').forEach(input => input.disabled = true);
}

// Interactive expanded form with input boxes
export function renderInteractiveExpanded(q) {
    const num = q.expandedNumber;
    const digits = q.expandedDigits;
    const placeNames = ["ones","tens","hundreds","thousands","ten-thousands","hundred-thousands"];

    return `<div style="text-align:center;">
        <!-- Show the number to expand -->
        <div style="margin-bottom:20px;">
            <div style="font-size:2.5rem;font-weight:900;color:var(--text-primary);">${num.toLocaleString()}</div>
            <div style="font-size:0.9rem;color:var(--text-dim);margin-top:8px;">Write the value of each digit:</div>
        </div>

        <!-- Input boxes for each place value -->
        <div id="expandedInputBoxes" style="display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;">
            ${digits.map((d, i) => {
                const placeIndex = digits.length - i - 1;
                const placeName = placeNames[placeIndex] || `10^${placeIndex}`;
                const colors = ['var(--accent-purple)', 'var(--accent-cyan)', 'var(--accent-green)', 'var(--accent-orange)', 'var(--accent-pink)', 'var(--accent-yellow)'];
                const color = colors[placeIndex] || colors[0];
                return `
                    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                        <div style="background:${color};color:white;padding:6px 12px;border-radius:8px;font-weight:700;font-size:1.3rem;">${d}</div>
                        <div style="font-size:0.7rem;color:var(--text-dim);">${placeName}</div>
                        <input type="text" class="expanded-input-box" data-expanded-idx="${i}"
                            style="width:80px;height:44px;text-align:center;font-size:1rem;font-weight:700;border:3px solid ${color};border-radius:10px;background:var(--bg-card);color:var(--text-primary);outline:none;"
                            oninput="checkExpandedInputsFilled()" placeholder="">
                        ${i < digits.length - 1 ? '<span style="color:var(--text-dim);font-size:1.3rem;margin-top:8px;">+</span>' : ''}
                    </div>
                `;
            }).join("")}
        </div>

        <!-- Check button -->
        <button class="btn btn-primary" id="checkExpandedBtn" onclick="checkExpandedAnswer()" style="margin-top:20px;opacity:0.5;pointer-events:none;">Check Answer</button>
    </div>`;
}

export function checkExpandedInputsFilled() {
    const inputs = document.querySelectorAll('.expanded-input-box');
    const checkBtn = document.getElementById('checkExpandedBtn');
    if (!checkBtn) return;

    let allFilled = true;
    inputs.forEach(input => {
        if (!input.value.trim()) allFilled = false;
    });

    checkBtn.style.opacity = allFilled ? "1" : "0.5";
    checkBtn.style.pointerEvents = allFilled ? "auto" : "none";
}

export function checkExpandedAnswer() {
    if (state.hasAnswered) return;
    const q = state.currentQ;

    // Get user answers from input boxes
    const inputs = document.querySelectorAll('.expanded-input-box');
    const userValues = [];
    inputs.forEach(input => {
        // Remove commas and spaces, parse as number
        const val = input.value.trim().replace(/,/g, '').replace(/\s/g, '');
        userValues.push(parseInt(val, 10) || 0);
    });
    const userAnswer = userValues.join(",");
    const isCorrect = userAnswer === q.ans;

    state.hasAnswered = true;

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";

    if (isCorrect) {
        feedback.className = "feedback-area correct";
        feedback.innerHTML = "🎉 Correct! Perfect expanded form!";
        state.score++;
        state.xp += 10;
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        updateUI();
        saveState();

        // Mark inputs as correct
        inputs.forEach(input => {
            input.style.borderColor = "var(--correct)";
            input.style.background = "rgba(34,197,94,0.1)";
        });

        if (state.gameMode === "boss") {
            const pushbackAmount = 15;
            state.monsterPos = Math.max(0, state.monsterPos - pushbackAmount);
            updateBossVisuals();
        }
        if (state.gameMode === "race") {
            const playerSpeed = getPlayerRaceSpeed();
            state.racePos = Math.min(100, state.racePos + playerSpeed);
            updateRaceVisuals();
        }

        if (shouldShowNextButton()) {
            setTimeout(() => nextQuestion(), 500);
        }
    } else {
        const correctValues = q.expandedValues;
        const correctExpanded = correctValues.map(n => n.toLocaleString()).join(" + ");
        feedback.className = "feedback-area incorrect";
        feedback.innerHTML = `❌ The correct expanded form is: ${correctExpanded}`;
        document.getElementById("hintBtn").style.display = "none";

        // Show correct answers in the input boxes
        inputs.forEach((input, i) => {
            input.value = correctValues[i].toLocaleString();
            input.style.borderColor = "var(--incorrect)";
            input.style.background = "rgba(239,68,68,0.1)";
            input.disabled = true;
        });

        if (shouldShowNextButton()) {
            showNextButton();
        }
    }

    // Disable further interaction
    const checkBtn = document.getElementById("checkExpandedBtn");
    if (checkBtn) checkBtn.style.display = "none";

    // Disable all inputs
    document.querySelectorAll('.expanded-input-box').forEach(input => input.disabled = true);
}

// Number Family validation function
// Check area model answer in single question mode
export function checkAreaModelAnswer(input) {
    if (state.hasAnswered) return;
    
    const q = state.currentQ;
    if (!q.areaModelData) return;
    
    const userVal = input.value.trim().replace(/,/g, '');
    const correctVal = input.dataset.answer;
    
    if (userVal === '') {
        // Reset to default
        input.style.borderColor = input.classList.contains('area-model-total') ? 'var(--accent-green)' : '#fff';
        input.style.background = input.classList.contains('area-model-total') ? 'var(--bg-card-light)' : 'rgba(255,255,255,0.9)';
        input.style.color = '';
        return;
    }
    
    // Check this individual input
    const isCorrect = userVal === correctVal;
    
    if (isCorrect) {
        input.style.borderColor = 'var(--correct)';
        input.style.background = 'rgba(6,214,160,0.3)';
        input.style.color = '#065f46';
    } else {
        input.style.borderColor = 'var(--incorrect)';
        input.style.background = 'rgba(239,71,111,0.2)';
        input.style.color = '#991b1b';
    }
    
    // Check if ALL inputs are correct
    const visualAid = document.getElementById("visualAid");
    const allInputs = visualAid.querySelectorAll('.area-model-input, .area-model-total');
    let allCorrectOverall = true;
    let allFilled = true;
    
    allInputs.forEach(inp => {
        const val = inp.value.trim().replace(/,/g, '');
        const correct = inp.dataset.answer;
        if (val === '') {
            allFilled = false;
            allCorrectOverall = false;
        } else if (val !== correct) {
            allCorrectOverall = false;
        }
    });
    
    if (allFilled && allCorrectOverall) {
        // All correct - celebrate!
        state.hasAnswered = true;
        state.score++;
        state.xp += 20; // Bonus XP for area model
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        updateUI();
        
        // Update goal progress
        state.totalQuestions++;
        updateDailyGoalProgress(true);
        
        // Disable all inputs
        allInputs.forEach(inp => inp.disabled = true);
        
        // Show next button
        setTimeout(() => {
            const nextBtn = document.getElementById("nextQuestionBtn");
            if (nextBtn) nextBtn.style.display = "inline-block";
        }, 800);
    }
}

// Check number family answer in single question mode
export function checkNumberFamilyAnswer() {
    if (state.hasAnswered) return;
    
    const q = state.currentQ;
    if (!q.numberFamilyData && !q.factFamilyData) return;
    
    const visualAid = document.getElementById("visualAid");
    const inputs = visualAid.querySelectorAll('.number-family-input, .fact-family-input');
    let allCorrect = true;
    let allFilled = true;
    
    inputs.forEach(input => {
        const userVal = input.value.trim();
        const correctVal = input.dataset.answer;
        
        if (userVal === '') {
            allFilled = false;
            allCorrect = false;
        } else if (userVal === correctVal) {
            input.style.borderColor = 'var(--correct)';
            input.style.background = 'rgba(6,214,160,0.2)';
        } else {
            allCorrect = false;
            input.style.borderColor = 'var(--incorrect)';
            input.style.background = 'rgba(239,71,111,0.15)';
        }
    });
    
    if (allFilled && allCorrect) {
        state.hasAnswered = true;
        state.score++;
        state.xp += 15;
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        updateUI();
        
        state.totalQuestions++;
        updateDailyGoalProgress(true);
        
        inputs.forEach(inp => inp.disabled = true);
        
        setTimeout(() => {
            const nextBtn = document.getElementById("nextQuestionBtn");
            if (nextBtn) nextBtn.style.display = "inline-block";
        }, 800);
    }
}

export function checkNumberFamily() {
    if (state.hasAnswered) return;
    
    const q = state.currentQ;
    if (!q.numberFamilyData) return;
    
    const inputs = document.querySelectorAll('.number-family-input');
    let allCorrect = true;
    let allFilled = true;
    let correctCount = 0;
    let totalInputs = inputs.length;
    
    inputs.forEach(input => {
        const userVal = input.value.trim();
        const correctVal = input.dataset.answer;
        
        if (userVal === '') {
            allFilled = false;
            input.style.borderColor = 'var(--accent-orange)';
            input.style.background = 'rgba(255, 152, 0, 0.1)';
        } else if (userVal === correctVal) {
            correctCount++;
            input.style.borderColor = 'var(--accent-green)';
            input.style.background = 'rgba(76, 175, 80, 0.15)';
            input.disabled = true;
        } else {
            allCorrect = false;
            input.style.borderColor = '#e53935';
            input.style.background = 'rgba(229, 57, 53, 0.1)';
            // Shake animation
            input.style.animation = 'shake 0.5s';
            setTimeout(() => { input.style.animation = ''; }, 500);
        }
    });
    
    const feedbackDiv = document.getElementById('numberFamilyFeedback');
    
    if (!allFilled) {
        feedbackDiv.innerHTML = `<span style="color:var(--accent-orange);">⚠️ Please fill in all the boxes!</span>`;
        return;
    }
    
    if (allCorrect) {
        feedbackDiv.innerHTML = `<span style="color:var(--accent-green);">🎉 Perfect! All answers correct!</span>`;
        state.hasAnswered = true;
        state.score++;
        state.xp += 15; // Bonus XP for number families
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        updateUI();
        
        // Update goal progress
        state.totalQuestions++;
        updateDailyGoalProgress(true);
        
        // Show next button
        setTimeout(() => {
            const nextBtn = document.getElementById("nextQuestionBtn");
            if (nextBtn) nextBtn.style.display = "inline-block";
        }, 800);
    } else {
        feedbackDiv.innerHTML = `<span style="color:#e53935;">❌ ${correctCount}/${totalInputs} correct. Check the red boxes and try again!</span>`;
        
        // Allow retry - don't mark as answered yet
        setTimeout(() => {
            inputs.forEach(input => {
                if (!input.disabled) {
                    input.style.borderColor = 'var(--accent-cyan)';
                    input.style.background = 'var(--bg-card-light)';
                }
            });
        }, 2000);
    }
}

