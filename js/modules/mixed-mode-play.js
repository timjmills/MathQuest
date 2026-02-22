import { state } from './state.js';
import { DOMAINS, SKILLS, SKILL_CODES, CODE_TO_SKILL, getSkillGrade, gradeCircleHTML, getSkillsForCategory } from './data.js';
import { setCookie, getCookie } from './storage.js';

export function saveMixedModeSettings() {
    if (state.mixedModeSettings) {
        setCookie('mathquest_mixed_settings', state.mixedModeSettings);
        updateMixedPlayCardState();
    }
}

// Load mixed mode settings - check in-memory state first, then cookie
export function loadMixedModeSettings() {
    // First check if we have settings in memory (same session)
    if (state.mixedModeSettings && state.mixedModeSettings.selectedSkills) {
        const totalSkills = Object.values(state.mixedModeSettings.selectedSkills)
            .reduce((sum, arr) => sum + arr.length, 0);
        if (totalSkills > 0) {
            return state.mixedModeSettings;
        }
    }
    // Fall back to cookie (for page refresh persistence)
    const saved = getCookie('mathquest_mixed_settings');
    return saved || null;
}

// Update the Play Mixed card state based on saved settings
export function updateMixedPlayCardState() {
    const saved = loadMixedModeSettings();
    const playCard = document.querySelector('.mixed-play-card');
    const indicator = document.getElementById('mixedSavedIndicator');
    if (!playCard || !indicator) return;

    if (saved && saved.selectedSkills) {
        // Count total skills
        const totalSkills = Object.values(saved.selectedSkills).reduce((sum, arr) => sum + arr.length, 0);
        if (totalSkills > 0) {
            playCard.classList.add('has-saved');
            playCard.classList.remove('no-saved');
            indicator.style.display = 'block';
            indicator.textContent = '✓ ' + totalSkills + ' skills';
            indicator.style.color = 'var(--accent-green)';
            return;
        }
    }
    // No saved settings - show that it will use all skills
    playCard.classList.remove('no-saved');
    playCard.classList.remove('has-saved');
    indicator.style.display = 'block';
    indicator.textContent = 'All skills (easy)';
    indicator.style.color = 'var(--text-dim)';
}

// Show the Play Mixed popup
export function showPlayMixedPopup() {
    const saved = loadMixedModeSettings();
    const codeInput = document.getElementById('playMixedCodeInput');
    const summaryBox = document.getElementById('popupSettingsSummary');
    const statusEl = document.getElementById('settingsStatus');
    const detailsEl = document.getElementById('settingsDetails');

    // Clear the code input
    codeInput.value = '';
    codeInput.classList.remove('error');

    // Update the summary based on saved settings
    if (saved && saved.selectedSkills) {
        const totalSkills = Object.values(saved.selectedSkills).reduce((sum, arr) => sum + arr.length, 0);
        if (totalSkills > 0) {
            summaryBox.classList.add('has-settings');
            statusEl.textContent = '✅ Settings Loaded (' + totalSkills + ' skills)';

            // Build detailed summary
            let detailsHTML = '<div class="skill-list">';
            const categoryNames = {
                operations: '📐 Operations',
                decimals: '🔢 Decimals',
                estimation: '📏 Estimation',
                integers: '➖ Integers',
                algebra: '🔤 Algebra',
                geometry: '📐 Geometry',
                measurement: '⏰ Measurement',
                data_stats: '📊 Data & Stats',
                number_theory: '🔢 Number Theory',
                order_of_operations: '🧮 Order of Ops',
                patterns: '🔢 Patterns',
                rounding: '🎯 Rounding',
                placevalue: '📊 Place Value',
                fractions: '🍕 Fractions',
                conversions: '🔄 Conversions'
            };

            Object.entries(saved.selectedSkills).forEach(([cat, skills]) => {
                if (skills && skills.length > 0) {
                    const catLabel = categoryNames[cat] || cat;
                    skills.forEach(skillCode => {
                        const skillInfo = SKILLS[cat]?.find(s => s.v === skillCode);
                        const skillName = skillInfo ? skillInfo.l.replace(/^[^\w]+/, '').trim() : skillCode;
                        const gc = gradeCircleHTML(getSkillGrade(skillCode, cat));
                        detailsHTML += '<span class="skill-tag" style="display:inline-flex;align-items:center;gap:4px;">' + gc + skillName + '</span>';
                    });
                }
            });
            detailsHTML += '</div>';

            // Add settings meta info
            detailsHTML += '<div class="settings-meta">Range: ' + (saved.range || 100) + '</div>';

            detailsEl.innerHTML = detailsHTML;
        } else {
            showDefaultSettings();
        }
    } else {
        showDefaultSettings();
    }

    function showDefaultSettings() {
        summaryBox.classList.remove('has-settings');
        statusEl.textContent = '📋 No settings saved';
        detailsEl.innerHTML = 'Will use <strong>all skills</strong>';
    }

    // Show the popup
    document.getElementById('playMixedPopup').style.display = 'flex';
}

export function closePlayMixedPopup() {
    document.getElementById('playMixedPopup').style.display = 'none';
}

export function closePlayMixedPopupOutside(event) {
    if (event.target.id === 'playMixedPopup') {
        closePlayMixedPopup();
    }
}

// Generate default "all skills at easy" settings
export function getAllSkillsEasySettings() {
    const allSkills = {};

    Object.keys(SKILLS).forEach(cat => {
        const playable = getSkillsForCategory(cat);
        if (playable.length > 0) {
            allSkills[cat] = playable;
        }
    });

    return {
        selectedSkills: allSkills,
        range: 100,
        decimalPlaces: 1,
        difficulty: 'medium',
        timeChoice: 'student',
        modeChoice: 'student',
        timer: null,
        mode: null
    };
}

// Play with last saved settings (or all skills at easy if none saved)
export function playWithLastSettings() {
    let settings = loadMixedModeSettings();

    // Check if we have valid saved settings
    let hasSavedSettings = false;
    if (settings && settings.selectedSkills) {
        const totalSkills = Object.values(settings.selectedSkills).reduce((sum, arr) => sum + arr.length, 0);
        hasSavedSettings = totalSkills > 0;
    }

    // If no saved settings, use all skills at easy
    if (!hasSavedSettings) {
        settings = getAllSkillsEasySettings();
        showMixedPlayToast('Playing all skills at easy difficulty!');
    }

    // Close popup and apply settings
    closePlayMixedPopup();
    applyAndPlayMixedSettings(settings);
}

// Play with pasted code
export function playWithCode() {
    const codeInput = document.getElementById('playMixedCodeInput');
    const code = codeInput.value.trim().toUpperCase();

    if (!code) {
        // If no code, try to use last settings
        playWithLastSettings();
        return;
    }

    // Validate and apply the code
    try {
        let settings = null;

        // Check if it's a compact mixed mode code (starts with M, at least 18 chars)
        // Note: codes can be longer than 18 chars if skill bitfields need more digits
        if (code.startsWith('M') && !code.startsWith('MX-') && code.length >= 18) {
            settings = parseCompactMixedCodeForPlay(code);
        }
        // Check if it's old format mixed mode code (starts with MX-)
        else if (code.startsWith('MX-')) {
            settings = parseMixedCodeForPlay(code);
        }
        // Check if it's a single skill code (7 chars: CAT + SKILL + RANGE + DEC + TIMER + DIFF)
        else if (code.length >= 7) {
            settings = parseSingleSkillCodeForPlay(code);
        }
        else {
            throw new Error('Invalid code format');
        }

        if (!settings || !settings.selectedSkills || Object.keys(settings.selectedSkills).length === 0) {
            throw new Error('No valid skills in code');
        }

        // Save the settings from code
        state.mixedModeSettings = settings;
        saveMixedModeSettings();

        // Close popup and play
        closePlayMixedPopup();
        applyAndPlayMixedSettings(settings);

    } catch (e) {
        codeInput.classList.add('error');
        setTimeout(() => codeInput.classList.remove('error'), 500);
        showMixedPlayToast('Invalid code! Check and try again.');
    }
}

// Parse single skill code and return settings object for play
export function parseSingleSkillCodeForPlay(code) {
    const cleanCode = code.replace(/[^A-Z0-9]/g, '');

    if (cleanCode.length < 7) {
        throw new Error('Code too short');
    }

    // Parse code: CAT(1) + SKILL(2) + RANGE(1) + DEC(1) + TIMER(1) + DIFF(1) = 7 chars
    const catCode = cleanCode[0];
    const skillCode = cleanCode.substring(1, 3);
    const rangeCode = cleanCode[3];
    const decCode = cleanCode[4];
    const timerCode = cleanCode[5];
    const diffCode = cleanCode[6];

    // Validate category
    const category = CODE_TO_CATEGORY[catCode];
    if (!category) throw new Error('Invalid category');

    // Get skill
    const skill = getSkillFromCode(category, skillCode);

    // Build settings with single skill
    const selectedSkills = {};
    selectedSkills[category] = [skill];

    const range = CODE_TO_RANGE[rangeCode] || '100';
    const decimal = CODE_TO_DECIMAL[decCode] || '0';
    const difficulty = CODE_TO_DIFFICULTY[diffCode] || 'medium';
    const timer = CODE_TO_TIMER[timerCode] || '0';

    return {
        selectedSkills: selectedSkills,
        range: parseInt(range, 10),
        decimalPlaces: parseInt(decimal, 10),
        difficulty: difficulty,
        timeChoice: 'student',
        modeChoice: 'student',
        timer: parseInt(timer, 10),
        mode: null
    };
}

// Parse compact mixed code and return settings object (for play popup)
export function parseCompactMixedCodeForPlay(code) {
    // Settings are always the last 5 characters
    const settingsPart = code.slice(-5);
    // Skills are everything between M and settings
    const skillPart = code.substring(1, code.length - 5);

    const MODE_LETTER_REVERSE = { 'P': 'practice', 'T': 'timed', 'R': 'race', 'B': 'boss', 'W': 'worksheet' };

    const selectedSkills = {};

    // Parse skill codes - each category uses 2 characters
    CATEGORY_ORDER.forEach((cat, idx) => {
        const startPos = idx * 2;
        if (startPos + 2 <= skillPart.length) {
            const catBits = skillPart.substring(startPos, startPos + 2);
            const bitfield = parseInt(catBits, 36);
            const skills = bitfieldToSkills(cat, bitfield);
            if (skills.length > 0) {
                selectedSkills[cat] = skills;
            }
        }
    });

    // If no skills found from parsing, try alternative parsing for longer codes
    if (Object.keys(selectedSkills).length === 0 && skillPart.length > 12) {
        // Try parsing with variable-length skill codes
        let pos = 0;
        CATEGORY_ORDER.forEach(cat => {
            // Try 2-3 char codes
            for (let len = 2; len <= 3 && pos + len <= skillPart.length; len++) {
                const catBits = skillPart.substring(pos, pos + len);
                const bitfield = parseInt(catBits, 36);
                if (!isNaN(bitfield) && bitfield > 0) {
                    const skills = bitfieldToSkills(cat, bitfield);
                    if (skills.length > 0) {
                        selectedSkills[cat] = skills;
                        pos += len;
                        break;
                    }
                }
            }
            if (pos >= skillPart.length) return;
        });
    }

    const rangeCode = settingsPart[0];
    const decCode = settingsPart[1];
    const diffCode = settingsPart[2];
    const timerCode = settingsPart[3];
    const modeCode = settingsPart[4];

    const range = CODE_TO_RANGE[rangeCode] || '100';
    const decimal = CODE_TO_DECIMAL[decCode] || '0';
    const difficulty = CODE_TO_DIFFICULTY[diffCode] || 'medium';
    const timerChoice = timerCode === 'S' ? 'student' : 'teacher';
    const timer = timerCode !== 'S' ? (CODE_TO_TIMER[timerCode] || '0') : null;
    const modeChoice = modeCode === 'S' ? 'student' : 'teacher';
    const mode = modeCode !== 'S' ? (MODE_LETTER_REVERSE[modeCode] || 'practice') : null;

    return {
        selectedSkills: selectedSkills,
        range: parseInt(range, 10),
        decimalPlaces: parseInt(decimal, 10),
        difficulty: difficulty,
        timeChoice: timerChoice,
        modeChoice: modeChoice,
        timer: timer ? parseInt(timer, 10) : null,
        mode: mode
    };
}

// Parse MX- format code and return settings object (for play popup)
export function parseMixedCodeForPlay(code) {
    const parts = code.split('-');
    if (parts.length < 3 || parts[0] !== 'MX') {
        throw new Error("Invalid MX code format");
    }

    const skillCodes = parts.slice(1, -1).join('-').split('.');
    const settingsPart = parts[parts.length - 1];

    const MODE_LETTER_REVERSE = { 'P': 'practice', 'T': 'timed', 'R': 'race', 'B': 'boss', 'W': 'worksheet' };
    const selectedSkills = {};

    skillCodes.forEach(sc => {
        if (sc.length >= 3) {
            const catCode = sc[0];
            const skillIdx = sc.substring(1);
            const cat = CODE_TO_CATEGORY[catCode];
            if (cat) {
                const skill = getSkillFromCode(cat, skillIdx);
                if (!selectedSkills[cat]) selectedSkills[cat] = [];
                if (!selectedSkills[cat].includes(skill)) {
                    selectedSkills[cat].push(skill);
                }
            }
        }
    });

    const rangeCode = settingsPart[0];
    const decCode = settingsPart[1];
    const diffCode = settingsPart[2];
    const timerCode = settingsPart[3];
    const modeCode = settingsPart[4];

    const range = CODE_TO_RANGE[rangeCode] || '100';
    const decimal = CODE_TO_DECIMAL[decCode] || '0';
    const difficulty = CODE_TO_DIFFICULTY[diffCode] || 'medium';
    const timerChoice = timerCode === 'S' ? 'student' : 'teacher';
    const timer = timerCode !== 'S' ? (CODE_TO_TIMER[timerCode] || '0') : null;
    const modeChoice = modeCode === 'S' ? 'student' : 'teacher';
    const mode = modeCode !== 'S' ? (MODE_LETTER_REVERSE[modeCode] || 'practice') : null;

    return {
        selectedSkills: selectedSkills,
        range: parseInt(range, 10),
        decimalPlaces: parseInt(decimal, 10),
        difficulty: difficulty,
        timeChoice: timerChoice,
        modeChoice: modeChoice,
        timer: timer ? parseInt(timer, 10) : null,
        mode: mode
    };
}

// Track student selections for modal
let studentModalState = {
    mode: null,
    timer: 180 // default 3 min
};

// Apply mixed settings and start playing
export function applyAndPlayMixedSettings(saved) {
    // Apply saved settings to state
    state.mixedModeSettings = saved;
    state.category = 'all_mixed';
    state.skill = 'custom_mixed';
    state.range = saved.range || 100;
    state.decimalPlaces = saved.decimalPlaces || 0;

    // Update UI dropdowns (for reference, though we won't use home screen)
    const rangeSelect = document.getElementById('rangeSelect');
    const decimalSelect = document.getElementById('decimalSelect');

    if (rangeSelect) rangeSelect.value = state.range;
    if (decimalSelect) decimalSelect.value = state.decimalPlaces;

    // Check what the student needs to choose
    const needsModeChoice = saved.modeChoice !== 'teacher' || !saved.mode;
    const needsTimerChoice = saved.timeChoice !== 'teacher';

    // If teacher set both mode and timer, start immediately
    if (!needsModeChoice && !needsTimerChoice) {
        state.timerDuration = saved.timer || 0;
        state.gameMode = saved.mode;
        const timerSelect = document.getElementById('timerSelect');
        if (timerSelect) timerSelect.value = state.timerDuration;
        selectMode(saved.mode);
        startGame();
    } else {
        // Show student choice modal
        showStudentChoiceModal(saved, needsModeChoice, needsTimerChoice);
    }
}

// Show the student choice modal
export function showStudentChoiceModal(saved, needsModeChoice, needsTimerChoice) {
    const modal = document.getElementById('studentChoiceModal');
    const summary = document.getElementById('studentChoiceSummary');
    const modeSection = document.getElementById('studentModeSection');
    const timerSection = document.getElementById('studentTimerSection');
    const playBtn = document.getElementById('studentPlayBtn');

    // Reset modal state
    studentModalState.mode = needsModeChoice ? null : saved.mode;
    studentModalState.timer = needsTimerChoice ? 180 : (saved.timer || 0);

    // Build summary text
    const totalSkills = saved.selectedSkills ?
        Object.values(saved.selectedSkills).reduce((sum, arr) => sum + arr.length, 0) : 0;
    summary.innerHTML = `<strong>${totalSkills} skills</strong> • Range: ${saved.range || 100}`;

    // Show/hide sections based on what needs choosing
    modeSection.style.display = needsModeChoice ? 'block' : 'none';
    timerSection.style.display = needsTimerChoice ? 'block' : 'none';

    // Reset button selections
    document.querySelectorAll('.student-mode-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.student-timer-btn').forEach(btn => btn.classList.remove('selected'));

    // Pre-select default timer (3 min)
    if (needsTimerChoice) {
        const defaultTimerBtn = document.querySelector('.student-timer-btn[data-timer="180"]');
        if (defaultTimerBtn) defaultTimerBtn.classList.add('selected');
    }

    // Update play button state
    updateStudentPlayButton(needsModeChoice);

    // Show modal
    modal.style.display = 'flex';
}

// Select a mode in student choice modal
export function selectStudentMode(mode) {
    studentModalState.mode = mode;
    document.querySelectorAll('.student-mode-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.mode === mode);
    });
    updateStudentPlayButton(true);
}

// Select a timer in student choice modal
export function selectStudentTimer(timer) {
    studentModalState.timer = timer;
    document.querySelectorAll('.student-timer-btn').forEach(btn => {
        btn.classList.toggle('selected', parseInt(btn.dataset.timer) === timer);
    });
}

// Update play button enabled state
export function updateStudentPlayButton(needsModeChoice) {
    const playBtn = document.getElementById('studentPlayBtn');
    if (needsModeChoice && !studentModalState.mode) {
        playBtn.disabled = true;
        playBtn.textContent = '👆 Select a Mode';
    } else {
        playBtn.disabled = false;
        playBtn.textContent = '🚀 Play Now!';
    }
}

// Start game from student choice modal
export function startMixedGameFromModal() {
    if (!studentModalState.mode) return;

    // Close modal
    document.getElementById('studentChoiceModal').style.display = 'none';

    // Apply selections
    state.gameMode = studentModalState.mode;
    state.timerDuration = studentModalState.timer;
    document.getElementById('timerSelect').value = state.timerDuration;

    // Select the mode and start
    selectMode(studentModalState.mode);
    startGame();
}

// Close modal when clicking outside
export function closeStudentChoiceOutside(event) {
    if (event.target.id === 'studentChoiceModal') {
        document.getElementById('studentChoiceModal').style.display = 'none';
    }
}

// Show toast notification for mixed mode actions
export function showMixedPlayToast(message) {
    // Remove any existing toast
    const existing = document.querySelector('.mixed-play-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'mixed-play-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, var(--accent-purple), var(--accent-cyan));
        color: white;
        padding: 14px 28px;
        border-radius: 14px;
        font-weight: 700;
        font-size: 0.95rem;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        z-index: 9999;
        animation: toastSlideUp 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideDown 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Update mode cards state when mixed mode is loaded
export function updateModeCardsForMixed() {
    // Deselect all mode cards first
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.remove('selected');
    });
}

const CATEGORY_LABELS = {
    // Number & Operations
    addition: '➕ Addition',
    subtraction: '➖ Subtraction',
    multiplication: '✖️ Multiplication',
    division: '➗ Division',
    integers: '🔢 Integers',
    operations: '📐 Basic Operations',
    number_ops_mixed: '🎲 Mixed Operations',
    // Fractions, Decimals & Percents
    fractions: '🥧 Fractions',
    decimals: '🔢 Decimals',
    conversions: '🔀 Conversions',
    frac_dec_mixed: '🎲 Mixed FDP',
    // Geometry & Measurement
    area_perimeter: '📐 Area & Perimeter',
    angles_lines: '📏 Angles & Lines',
    shapes_classify: '🔷 Shape Classification',
    coordinates: '📍 Coordinates',
    measurement: '⏰ Measurement',
    geometry: '📐 Geometry',
    geo_mixed: '🎲 Mixed Geometry',
    // Data & Statistics
    graphs: '📊 Graphs',
    data_analysis: '📈 Data Analysis',
    probability: '🎲 Probability',
    data_stats: '📊 Data & Statistics',
    data_mixed: '🎲 Mixed Data',
    // Algebraic Thinking
    patterns: '🔢 Number Patterns',
    algebra: '🔤 Algebra',
    order_of_operations: '🧮 Order of Operations',
    placevalue: '📊 Place Value',
    number_sense: '🎯 Number Sense',
    number_theory: '🔬 Number Theory',
    estimation: '📏 Estimation',
    rounding: '🔄 Rounding Numbers',
    algebra_mixed: '🎲 Mixed Algebraic'
};

