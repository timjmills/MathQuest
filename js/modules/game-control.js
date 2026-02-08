import { state } from './state.js';
import { SKILLS, DOMAINS } from './data.js';

export function shouldShowNextButton() {
    return ["practice", "boss", "race"].includes(state.gameMode);
}

export function showNextButton() {
    if (shouldShowNextButton()) {
        document.getElementById("nextBtnContainer").style.display = "flex";
    }
}

export function hideNextButton() {
    document.getElementById("nextBtnContainer").style.display = "none";
}

export function startGame() {
    // If in student mode and skills are in queue, use queue instead of dropdowns
    const isStudentMode = document.body.classList.contains('student-mode');
    if (isStudentMode && window.skillQueue.length > 0 && !state.isMixedMode) {
        // Automatically use the skill queue with the SELECTED game mode
        playSelectedSkills(state.gameMode || 'practice');
        return;
    }
    
    // In student mode with empty queue, prompt to select skills
    if (isStudentMode && window.skillQueue.length === 0 && !state.isMixedMode) {
        showModal("📚 Click on the Quick Skills above or use the search bar to choose what you want to practice, then click Start Game!");
        return;
    }
    
    // If mixed mode settings are active, preserve settings from state
    // (because the dropdown doesn't have 'all_mixed' as an option)
    const isCustomMixed = state.mixedModeSettings &&
                          state.category === 'all_mixed' &&
                          state.skill === 'custom_mixed';

    // Get elements with null checks
    const rangeSelectEl = document.getElementById("rangeSelect");
    const decimalSelectEl = document.getElementById("decimalSelect");
    const difficultySelectEl = document.getElementById("difficultySelect");
    const categorySelectEl = document.getElementById("categorySelect");
    const skillSelectEl = document.getElementById("skillSelect");

    if (isCustomMixed) {
        // Use settings from mixedModeSettings instead of dropdowns
        state.range = state.mixedModeSettings.range || parseInt(rangeSelectEl?.value || '100', 10);
        state.decimalPlaces = state.mixedModeSettings.decimalPlaces !== undefined ?
            state.mixedModeSettings.decimalPlaces : parseInt(decimalSelectEl?.value || '0', 10);
        state.difficulty = state.mixedModeSettings.difficulty || difficultySelectEl?.value || 'medium';
    } else {
        const categoryValue = categorySelectEl?.value;
        const skillValue = skillSelectEl?.value;

        // Validate that category and skill are selected
        if (!categoryValue || categoryValue === "" || !skillValue || skillValue === "") {
            showModal("⚠️ Please choose a category and skill before starting the game!");
            return;
        }

        state.category = categoryValue;
        state.skill = skillValue;
        state.range = parseInt(rangeSelectEl?.value || '100', 10);
        state.decimalPlaces = parseInt(decimalSelectEl?.value || '0', 10);
        state.difficulty = difficultySelectEl?.value || 'medium';
    }

    // Debug: Log the current state values
    console.log("Starting game with:", {
        category: state.category,
        skill: state.skill,
        range: state.range,
        difficulty: state.difficulty
    });

    // Check if mixed mode settings override timer
    if (state.mixedModeSettings && state.mixedModeSettings.timeChoice === 'teacher' && state.mixedModeSettings.timer !== null) {
        state.timerDuration = state.mixedModeSettings.timer;
    } else {
        state.timerDuration = parseInt(document.getElementById("timerSelect").value, 10);
    }

    // Get problem count from dropdown
    state.problemCount = parseInt(document.getElementById("problemCountSelect")?.value || "20", 10);

    // Set session start time for duration tracking
    state.sessionStartTime = new Date();

    if (state.gameMode === "worksheet") {
        initWorksheet();
        return;
    }

    if (state.selectedNumbers.length === 0) state.selectedNumbers = [...DEFAULT_TABLES];

    state.qCount = 0;
    state.score = 0;
    state.heroPos = 70;
    state.monsterPos = 10;
    state.racePos = 0;
    state.cpuPos = 0;
    state.hasAnswered = false;
    state.currentQ = null;
    hideNextButton();

    showView("gameView");
    document.getElementById("gameScore").innerText = "0 Correct";
    document.getElementById("gameTopicDisplay").innerText =
        document.getElementById("categorySelect").selectedOptions[0].text;

    // Show goal progress if enabled
    updateGoalProgress();

    document.getElementById("bossArena").style.display = state.gameMode === "boss" ? "block" : "none";
    document.getElementById("bossStatus").style.display = state.gameMode === "boss" ? "block" : "none";
    document.getElementById("raceTrack").style.display = state.gameMode === "race" ? "block" : "none";
    document.getElementById("raceStatus").style.display = state.gameMode === "race" ? "block" : "none";

    if (state.gameMode === "race") startRaceCPU();
    else if (state.cpuInterval) { clearInterval(state.cpuInterval); state.cpuInterval = null; }

    if (state.gameMode === "boss") startBossMonster();
    else if (state.bossInterval) { clearInterval(state.bossInterval); state.bossInterval = null; }

    if (state.timerDuration > 0) {
        state.timerRemaining = state.timerDuration;
        document.getElementById("timerContainer").style.display = "flex";
        startTimer();
    } else {
        document.getElementById("timerContainer").style.display = "none";
        if (state.timerInterval) clearInterval(state.timerInterval);
    }

    nextQuestion();
}

export function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    updateTimerDisplay();
    state.timerInterval = setInterval(() => {
        state.timerRemaining--;
        updateTimerDisplay();
        if (state.timerRemaining <= 0) {
            clearInterval(state.timerInterval);
            // For boss mode, if timer runs out and hero is still alive, they win
            if (state.gameMode === "boss" && state.monsterPos < state.heroPos - 5) {
                endGame(true, "You survived! The dinosaur gave up! 🎉");
            } else if (state.gameMode === "boss") {
                endGame(false, "The dinosaur caught you! 🦖");
            } else {
                endGame(false, "Time's up!");
            }
        }
    }, 1000);
}

export function updateTimerDisplay() {
    const minutes = Math.floor(state.timerRemaining / 60);
    const seconds = state.timerRemaining % 60;
    document.getElementById("timerValue").innerText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    document.getElementById("timerDisplay").classList.toggle("large", state.timerRemaining <= 20);
}

export function nextQuestion() {
    hideNextButton();
    if (!document.getElementById("gameView").classList.contains("active")) return;

    // Check if boss caught the hero
    if (state.gameMode === "boss" && state.monsterPos >= state.heroPos - 5) {
        endGame(false, "The dinosaur caught you! 🦖");
        return;
    }
    // Check if player won the race
    if (state.gameMode === "race" && state.racePos >= 100) {
        endGame(true, "You won the race!");
        return;
    }

    state.qCount++;

    // Check if total problems limit is reached (for Mixed Mode goals)
    const settings = state.mixedModeSettings;
    if (settings && settings.totalProblemsEnabled && settings.totalProblems) {
        if (state.qCount > settings.totalProblems) {
            // Already answered the last problem, check if goal was met
            const metGoal = !settings.correctGoalEnabled || (state.score >= settings.correctGoal);
            if (metGoal) {
                endGame(true, `Completed ${settings.totalProblems} problems! Score: ${state.score}`);
            } else {
                endGame(false, `Needed ${settings.correctGoal} correct, got ${state.score}`);
            }
            return;
        }
    }

    state.hasAnswered = false;
    
    // Track question start time for adaptive difficulty
    state.questionStartTime = Date.now();
    
    try {
        state.currentQ = generateQuestion();
    } catch (err) {
        console.error("Error generating question:", err);
        state.currentQ = {
            text: "5 + 5 = ?",
            ans: 10,
            hint: "Count up from 5",
            options: [3, 5, 10, 12],
            answerType: "number"
        };
    }
    renderQuestion();
    
    // Update progress display
    updateProgressDisplay();

    // Update goal progress display for new question
    updateGoalProgress();
}

// Get a readable skill label for displaying on questions
export function getSkillLabelForQuestion(skillId, categoryId) {
    // Short skill labels for display
    const skillLabels = {
        // Addition
        'add_facts': 'Add Facts', 'add_sub_10s': '+/− 10s', 'add_sub_100s': '+/− 100s', 
        'add': 'Addition', 'add_word_problems': 'Add Word',
        'add_sub_fact_family': 'Fact Fam +−', 'number_families_add': 'Num Fam', 
        'number_families_add_med': 'Num Fam', 'number_families_add_hard': 'Num Fam',
        // Subtraction
        'sub_facts': 'Sub Facts', 'subtract': 'Subtract', 'sub_word_problems': 'Sub Word',
        'missing_add_sub': 'Missing +−', 'mixed_add_sub': 'Add/Sub',
        // Multiplication
        'mult_facts': 'Mult Facts', 'multiply': 'Multiply', 'mult_word_problems': 'Mult Word',
        'area_model_mult': 'Area Model', 'area_model_mult_hard': 'Area Model',
        'mult_div_fact_family': 'Fact Fam ×÷', 'number_families_mult': 'Num Fam',
        // Division
        'div_facts': 'Div Facts', 'divide': 'Divide', 'div_word_problems': 'Div Word',
        'area_model_div_2by1': 'Area Div', 'area_model_div_3by1': 'Area Div',
        'missing_mult_div': 'Missing ×÷',
        // Integers
        'number_line_int': 'Int Line', 'compare_int': 'Int Compare',
        'add_int': 'Int Add', 'sub_int': 'Int Sub',
        // Fractions
        'identify': 'Frac ID', 'equivalent': 'Equiv Frac', 'compare': 'Compare Frac',
        'simplify': 'Simplify', 'add_fractions': 'Add Frac', 'sub_fractions': 'Sub Frac',
        'mult_fractions': 'Mult Frac', 'div_fractions': 'Div Frac',
        'mixed_to_improper': 'Mixed→Improp', 'improper_to_mixed': 'Improp→Mixed',
        'fraction_word_problems': 'Frac Word', 'numberline': 'Frac Line',
        // Decimals
        'add_decimal': 'Dec Add', 'sub_decimal': 'Dec Sub',
        'mult_decimal': 'Dec Mult', 'div_decimal': 'Dec Div',
        'compare_decimal': 'Dec Compare', 'order_decimals': 'Dec Order',
        // Conversions
        'f_to_d': 'Frac→Dec', 'd_to_f': 'Dec→Frac',
        'f_to_p': 'Frac→%', 'p_to_f': '%→Frac',
        'd_to_p': 'Dec→%', 'p_to_d': '%→Dec',
        // Geometry
        'perimeter': 'Perimeter', 'area': 'Area', 'area_perimeter': 'Area/Perim',
        'composite_shapes': 'Composite', 'volume': 'Volume',
        'identify_angles': 'Angles', 'measure_angles': 'Measure ∠',
        'identify_lines': 'Lines', 'symmetry': 'Symmetry',
        'classify_triangles': 'Triangles', 'classify_quads': 'Quads',
        'coordinate_q1': 'Coord Q1', 'coordinate_all': 'Coords', 'coordinate_graph': 'Graph',
        // Measurement
        'time_hour': 'Time', 'time_half_hour': 'Time', 'time_quarter': 'Time',
        'time_5min': 'Time', 'time_1min': 'Time', 'time_analog_digital': 'Time',
        'time_match_clock': 'Match Clock',
        'elapsed_30min': 'Elapsed', 'elapsed_hour': 'Elapsed', 'elapsed_15min': 'Elapsed',
        'elapsed_mixed': 'Elapsed', 'elapsed_find_duration': 'Find Duration',
        'elapsed_visual_easy': 'Elapsed Clocks', 'elapsed_visual_medium': 'Elapsed Clocks', 'elapsed_visual_hard': 'Elapsed Clocks',
        'money': 'Money', 'temperature': 'Temp', 'capacity': 'Capacity',
        // Data
        'bar_graph': 'Bar Graph', 'pictograph': 'Pictograph', 'line_plot': 'Line Plot',
        'pie_chart': 'Pie Chart', 'mean': 'Mean', 'median': 'Median',
        'mode': 'Mode', 'range_stat': 'Range', 'basic_probability': 'Probability',
        // Patterns & Algebra
        'input_output': 'In/Out', 'sequences': 'Sequences', 'missing_pattern': 'Pattern',
        'balance': 'Balance', 'solve_one_step': 'Solve 1-step',
        'solve_two_step': 'Solve 2-step', 'variable_expression': 'Expression',
        'pemdas_basic': 'PEMDAS', 'pemdas_advanced': 'PEMDAS',
        // Place Value & Number Sense
        'expanded_form': 'Expanded', 'word_form': 'Word Form',
        'digit_value': 'Digit Value', 'compare_numbers': 'Compare #',
        'round_whole': 'Round', 'round_decimal': 'Round Dec',
        'estimate_sum': 'Est Sum', 'estimate_diff': 'Est Diff',
        // Number Theory
        'factor_pairs': 'Factors', 'multiples': 'Multiples', 'factor_links_easy': 'Factor Links',
        'factor_links_medium': 'Factor Links', 'factor_links_hard': 'Factor Links',
        'prime_composite': 'Prime', 'divisibility': 'Divisibility',
        'gcf': 'GCF', 'lcm': 'LCM'
    };
    
    // Try to get from mapping
    if (skillLabels[skillId]) {
        return skillLabels[skillId];
    }
    
    // Try to find in SKILLS constant
    try {
        const index = getSkillIndex();
        const found = index.find(s => s.skillId === skillId);
        if (found) {
            // Extract short name from label (remove emoji and truncate)
            return found.skillLabel.replace(/^[🟢🟡🟠🔴➕➖✖️➗📐📏⏰½🔬🎲]+\s*/, '').substring(0, 12);
        }
    } catch (e) {}
    
    // Fallback: clean up skill ID
    return skillId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).substring(0, 12);
}

