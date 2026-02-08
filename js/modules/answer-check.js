import { state } from './state.js';

// ===== FLEXIBLE TIME ANSWER HELPERS =====

// Check if the current skill is time-related
export function isTimeSkill(skill) {
    if (!skill) return false;
    return skill.startsWith('time_') || skill.startsWith('elapsed_');
}

// Duration skills return elapsed durations ("1 hour", "30 minutes") vs clock times ("3:45")
function isDurationSkill(skill) {
    if (!skill) return false;
    return skill.startsWith('elapsed_visual_');
}

// Parse a clock time string → {hours, minutes} in 12-hour format, or null
function parseClockTime(str) {
    if (!str) return null;
    str = str.toString().trim();

    // Strip AM/PM variants (3:45 PM, 3:45pm, 3:45 p.m.)
    str = str.replace(/\s*(a\.?\s*m\.?|p\.?\s*m\.?)\s*$/i, '').trim();

    // "H:MM" or "HH:MM"
    let m = str.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
        let h = parseInt(m[1]) % 12 || 12;
        return { hours: h, minutes: parseInt(m[2]) };
    }

    // "N o'clock"
    m = str.match(/^(\d{1,2})\s*o['']?\s*clock$/i);
    if (m) {
        let h = parseInt(m[1]) % 12 || 12;
        return { hours: h, minutes: 0 };
    }

    return null;
}

// Parse a duration string → total minutes, or null
function parseDuration(str) {
    if (!str) return null;
    str = str.toString().trim().toLowerCase();

    // "H:MM" format interpreted as hours:minutes duration
    let m = str.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
        return parseInt(m[1]) * 60 + parseInt(m[2]);
    }

    let totalMin = 0;
    let found = false;

    // "N hour(s)" / "N hr(s)"
    m = str.match(/(\d+)\s*(?:hours?|hrs?)\b/);
    if (m) { totalMin += parseInt(m[1]) * 60; found = true; }

    // "N minute(s)" / "N min(s)"
    m = str.match(/(\d+)\s*(?:minutes?|mins?)\b/);
    if (m) { totalMin += parseInt(m[1]); found = true; }

    if (found) return totalMin;

    // Bare number → treat as minutes
    m = str.match(/^(\d+)$/);
    if (m) return parseInt(m[1]);

    return null;
}

// Flexible time/duration comparison: accepts multiple equivalent formats
export function timeAnswersMatch(userAns, correctAns, skill) {
    // Quick exact match first (handles MC clicks where option text === q.ans)
    if (normalizeText(userAns) === normalizeText(correctAns)) return true;

    if (isDurationSkill(skill)) {
        // Duration: "1 hour" = "1:00" = "60 minutes" = "60"
        const userDur = parseDuration(userAns);
        const ansDur = parseDuration(correctAns);
        if (userDur !== null && ansDur !== null) return userDur === ansDur;
    } else {
        // Clock time: "3:45" = "3:45 PM" = "03:45" = "3:45pm"
        const userTime = parseClockTime(userAns);
        const ansTime = parseClockTime(correctAns);
        if (userTime && ansTime) {
            return userTime.hours === ansTime.hours && userTime.minutes === ansTime.minutes;
        }
    }

    return false;
}

export function checkAnswer(userAns, btnElement) {
    if (state.hasAnswered) return;
    const q = state.currentQ;
    const type = q.answerType || (typeof q.ans === "number" ? "number" : "text");
    let isCorrect = false;

    // Track response time for adaptive difficulty
    const responseTime = state.questionStartTime ? Date.now() - state.questionStartTime : 5000;

    if (type === "number") {
        // Strip commas from user input before parsing (allow commas but don't require them)
        const cleanedInput = String(userAns).replace(/,/g, "");
        const userValue = Number(cleanedInput);
        isCorrect = !Number.isNaN(userValue) && Number(userValue.toFixed(3)) === Number(Number(q.ans).toFixed(3));
    } else if (isTimeSkill(state.skill)) {
        // Flexible time/duration comparison for all time skills
        isCorrect = timeAnswersMatch(userAns, q.ans, state.skill);
    } else {
        isCorrect = normalizeText(userAns) === normalizeText(q.ans);
    }
    
    // ===== PROGRESS TRACKING & ADAPTIVE DIFFICULTY =====
    // Update skill progress
    const currentSkill = state.skill || 'add';
    updateSkillProgress(currentSkill, isCorrect);
    
    // Track performance for adaptive difficulty
    trackPerformance(isCorrect, responseTime);

    // Format answer with commas for display
    const displayAnswer = typeof q.ans === "number" && Number.isInteger(q.ans) ? q.ans.toLocaleString() : q.ans;

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";
    feedback.className = `feedback-area ${isCorrect ? "correct" : "incorrect"}`;
    feedback.innerHTML = isCorrect ? `🎉 Correct!` : `❌ The answer is ${displayAnswer}`;
    
    // Show the "Show Solution" button after answering
    const solutionBtn = document.getElementById("solutionBtn");
    if (solutionBtn) solutionBtn.style.display = "inline-block";

    if (btnElement) btnElement.classList.add(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
        state.score++;
        state.xp += 10;
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        updateUI();
        saveState();

        if (state.gameMode === "boss") {
            // Correct answer: Push monster back based on difficulty
            // Easy: Big pushback, Medium: Moderate, Hard: Small pushback
            const pushbackAmount = { easy: 20, medium: 15, hard: 10 }[state.difficulty] || 15;
            state.monsterPos = Math.max(0, state.monsterPos - pushbackAmount);
            updateBossVisuals();
        }
        if (state.gameMode === "race") {
            const playerSpeed = getPlayerRaceSpeed();
            state.racePos = Math.min(100, state.racePos + playerSpeed);
            updateRaceVisuals();
        }

        // Update goal progress display
        updateGoalProgress();

        // Check if problem goals are met (Mixed Mode)
        if (checkProblemGoals()) {
            return; // Game ended due to goal reached
        }

        // Auto-advance after 0.5 seconds for correct answers in practice, boss, and race modes
        if (shouldShowNextButton()) {
            setTimeout(() => {
                nextQuestion();
            }, 500);
        }
    } else {
        // Wrong answer: Monster keeps advancing (no extra penalty needed - it's already moving)
        document.getElementById("hintBtn").style.display = "none";

        // Show correct answer in the input box
        const answerInput = document.getElementById("answerInput");
        if (answerInput) {
            answerInput.value = displayAnswer;
            answerInput.style.borderColor = "var(--incorrect)";
            answerInput.style.background = "rgba(239,71,111,0.15)";
            answerInput.disabled = true;
        }

        // Show next button for incorrect answers
        if (shouldShowNextButton()) {
            showNextButton();
        }
    }

    state.hasAnswered = true;
}

// Show solution popup for current question

export function submitAnswer() {
    const q = state.currentQ;
    
    // Handle different answer types
    if (q.answerType === "dual") {
        // Dual answer (perimeter + area)
        const perimeterInput = document.getElementById("perimeterInput");
        const areaInput = document.getElementById("areaInput");
        if (!perimeterInput || !areaInput) return;
        
        const userPerimeter = parseFloat(perimeterInput.value);
        const userArea = parseFloat(areaInput.value);
        
        if (isNaN(userPerimeter) || isNaN(userArea)) {
            const feedback = document.getElementById("feedbackArea");
            feedback.style.display = "block";
            feedback.className = "feedback-area hint";
            feedback.innerHTML = "Please enter both perimeter and area!";
            return;
        }
        
        checkDualAnswer(userPerimeter, userArea);
    } else if (q.answerType === "word_problem" || q.answerType === "scaffolded_word") {
        // Word problem answer
        const answerInput = document.getElementById("wordProblemAnswer");
        if (!answerInput || !answerInput.value.trim()) {
            const feedback = document.getElementById("feedbackArea");
            feedback.style.display = "block";
            feedback.className = "feedback-area hint";
            feedback.innerHTML = "Please enter your answer!";
            return;
        }
        checkWordProblemAnswer(answerInput.value);
    } else {
        // Standard single answer
        const input = document.getElementById("answerInput").value;
        if (!input) return;
        checkAnswer(input);
    }
}

// Check dual answer (perimeter + area)
export function checkDualAnswer(userPerimeter, userArea) {
    if (state.hasAnswered) return;
    const q = state.currentQ;
    
    const correctPerimeter = q.dualAnswers.perimeter;
    const correctArea = q.dualAnswers.area;
    
    const perimeterCorrect = Math.abs(userPerimeter - correctPerimeter) < 0.01;
    const areaCorrect = Math.abs(userArea - correctArea) < 0.01;
    const isCorrect = perimeterCorrect && areaCorrect;
    
    // Update input field styling
    const perimeterInput = document.getElementById("perimeterInput");
    const areaInput = document.getElementById("areaInput");
    
    if (perimeterInput) {
        perimeterInput.classList.add(perimeterCorrect ? "correct" : "incorrect");
        if (!perimeterCorrect) perimeterInput.value = correctPerimeter;
    }
    if (areaInput) {
        areaInput.classList.add(areaCorrect ? "correct" : "incorrect");
        if (!areaCorrect) areaInput.value = correctArea;
    }
    
    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";
    
    if (isCorrect) {
        feedback.className = "feedback-area correct";
        feedback.innerHTML = `🎉 Both correct! Perimeter = ${correctPerimeter}, Area = ${correctArea}`;
        state.score++;
        state.xp += 15; // Bonus XP for dual answer
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        updateUI();
        saveState();
        
        if (shouldShowNextButton()) {
            setTimeout(() => nextQuestion(), 700);
        }
    } else {
        feedback.className = "feedback-area incorrect";
        let msg = "❌ ";
        if (!perimeterCorrect && !areaCorrect) {
            msg += `Both incorrect. Perimeter = ${correctPerimeter}, Area = ${correctArea}`;
        } else if (!perimeterCorrect) {
            msg += `Perimeter incorrect. Correct: ${correctPerimeter}`;
        } else {
            msg += `Area incorrect. Correct: ${correctArea}`;
        }
        feedback.innerHTML = msg;
        
        if (shouldShowNextButton()) {
            showNextButton();
        }
    }
    
    state.hasAnswered = true;
    
    // Show solution button
    const solutionBtn = document.getElementById("solutionBtn");
    if (solutionBtn) solutionBtn.style.display = "inline-block";
}

// Check word problem answer
export function checkWordProblemAnswer(userAnswer) {
    if (state.hasAnswered) return;
    const q = state.currentQ;
    
    // Extract number from user answer
    const numMatch = userAnswer.match(/[\d,]+\.?\d*/);
    const userNum = numMatch ? parseFloat(numMatch[0].replace(/,/g, '')) : NaN;
    
    const isCorrect = !isNaN(userNum) && Math.abs(userNum - q.ans) < 0.01;
    
    // Check if user selected correct type (area vs perimeter)
    const selectedType = document.querySelector('input[name="problemType"]:checked');
    const typeCorrect = !selectedType || selectedType.value === q.expectedType;
    
    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";
    
    const answerInput = document.getElementById("wordProblemAnswer");
    
    if (isCorrect) {
        feedback.className = "feedback-area correct";
        feedback.innerHTML = `🎉 Correct! ${q.ans} ${q.expectedUnit}`;
        if (answerInput) {
            answerInput.style.borderColor = "var(--accent-green)";
            answerInput.style.background = "rgba(76, 175, 80, 0.15)";
        }
        state.score++;
        state.xp += 12; // Bonus for word problem
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        updateUI();
        saveState();
        
        if (shouldShowNextButton()) {
            setTimeout(() => nextQuestion(), 700);
        }
    } else {
        feedback.className = "feedback-area incorrect";
        let msg = `❌ The answer is ${q.ans} ${q.expectedUnit}`;
        if (!typeCorrect) {
            msg += ` (This was a ${q.expectedType} problem)`;
        }
        feedback.innerHTML = msg;
        
        if (answerInput) {
            answerInput.value = `${q.ans} ${q.expectedUnit}`;
            answerInput.style.borderColor = "var(--accent-red)";
            answerInput.style.background = "rgba(244, 67, 54, 0.15)";
        }
        
        if (shouldShowNextButton()) {
            showNextButton();
        }
    }
    
    state.hasAnswered = true;
    
    // Show solution button
    const solutionBtn = document.getElementById("solutionBtn");
    if (solutionBtn) solutionBtn.style.display = "inline-block";
}

