import { state } from './state.js';
import { SKILLS, SKILL_CODES, CODE_TO_SKILL, DOMAINS } from './data.js';

export function generateSkillCode() {
    if (window.skillQueue.length === 0) return '---';

    const parts = [];
    for (const skill of window.skillQueue) {
        const key = `${skill.categoryId}:${skill.skillId}`;
        const code = SKILL_CODES[key];
        if (code) {
            // Add weight if not 0
            const weight = skill.weight || 0;
            if (weight > 0 && weight !== 1) {
                parts.push(code + weight);
            } else {
                parts.push(code);
            }
        }
    }
    
    return parts.length > 0 ? parts.join('-') : '---';
}

// Apply a skill code - parse and load skills into queue
export function applySkillCode(inputId) {
    const input = document.getElementById(inputId || 'studentCodeInput') || document.getElementById('teacherCodeInput');
    if (!input) return;
    
    const rawCode = (input.value || '').toUpperCase().trim().replace(/\s+/g, '');
    if (!rawCode || rawCode === '---') {
        showNotification('Please enter a code', 'error');
        return;
    }
    
    // Parse the code - format: AB-CD-EF or AB3-CD5-EF2
    const parts = rawCode.split('-');
    const loadedSkills = [];
    
    for (const part of parts) {
        if (part.length < 2) continue;
        
        // Extract code and optional weight
        const code = part.substring(0, 2);
        const weightStr = part.substring(2);
        const weight = weightStr ? parseInt(weightStr, 10) : 0;
        
        const skillInfo = CODE_TO_SKILL[code];
        if (skillInfo) {
            loadedSkills.push({
                categoryId: skillInfo.categoryId,
                skillId: skillInfo.skillId,
                skillLabel: skillInfo.skillLabel,
                weight: isNaN(weight) ? 0 : weight
            });
        }
    }
    
    if (loadedSkills.length === 0) {
        showNotification('Invalid code - no skills found', 'error');
        input.style.borderColor = 'var(--incorrect)';
        setTimeout(() => { input.style.borderColor = 'var(--accent-orange)'; }, 1500);
        return;
    }
    
    // Clear current queue using UnifiedSkills
    UnifiedSkills.clear();
    
    // Add skills via UnifiedSkills
    for (const skill of loadedSkills) {
        const domainId = getDomainByCategory(skill.categoryId) || 'number_operations';
        const domain = DOMAINS[domainId];
        const categoryInfo = domain?.categories?.find(c => c.id === skill.categoryId);
        
        UnifiedSkills.add({
            domainId: domainId,
            categoryId: skill.categoryId,
            skillId: skill.skillId,
            skillLabel: skill.skillLabel,
            categoryIcon: categoryInfo?.icon || '📚',
            categoryName: categoryInfo?.name || skill.categoryId,
            domainColor: domain?.color || '#4CAF50',
            weight: skill.weight || 0
        });
    }
    
    // Apply weights to skillQueue (which was synced by UnifiedSkills)
    for (let i = 0; i < loadedSkills.length && i < window.skillQueue.length; i++) {
        window.skillQueue[i].weight = loadedSkills[i].weight || 0;
    }
    
    // Expand the queue to show loaded skills
    UnifiedSkills.expanded = true;
    UnifiedSkills.updateAllUI();
    updateQuickSkillCards();
    updateCompactNumberVisibility();
    
    // Success feedback
    input.style.borderColor = 'var(--correct)';
    input.style.background = 'rgba(6,214,160,0.2)';
    showNotification(`✓ Loaded ${loadedSkills.length} skill(s)!`, 'success');
    
    setTimeout(() => {
        input.style.borderColor = 'var(--accent-orange)';
        input.style.background = 'var(--bg-card)';
        input.value = '';
    }, 1500);
}

// Copy skill code to clipboard
export function copySkillCode() {
    const code = generateSkillCode();
    if (code === '---') {
        showNotification('No skills selected', 'error');
        return;
    }
    
    navigator.clipboard.writeText(code).then(() => {
        showNotification('📋 Code copied!', 'success');
    }).catch(() => {
        // Fallback
        const input = document.createElement('input');
        input.value = code;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showNotification('📋 Code copied!', 'success');
    });
}

// Update skill code display whenever queue changes
export function updateSkillCodeDisplay() {
    const codeDisplay = document.getElementById('skillCodeDisplay');
    if (codeDisplay) {
        codeDisplay.textContent = generateSkillCode();
    }
}

// Update skill weight in queue
export function updateSkillWeight(index, weight) {
    if (window.skillQueue[index]) {
        // Allow weights 0-100 for percentage-based distribution
        window.skillQueue[index].weight = Math.max(0, Math.min(100, parseInt(weight) || 0));
        updateSkillCodeDisplay();
        renderWeightedSkillsList();
    }
}

// Render weighted skills list for teacher view
export function renderWeightedSkillsList() {
    const container = document.getElementById('weightedSkillsList');
    if (!container) return;
    
    if (window.skillQueue.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-dim);padding:10px;">No skills selected. Use search to add skills.</div>';
        return;
    }

    container.innerHTML = window.skillQueue.map((skill, index) => {
        const shortLabel = skill.skillLabel.replace(/^[🟢🟡🟠🔴➕➖✖️➗📐📏⏰½🔬]+\s*/, '').substring(0, 30);
        return `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${skill.domainColor || 'var(--accent-purple)'};">
                <span style="font-weight:600;color:var(--text);flex:1;">${index + 1}. ${shortLabel}</span>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:0.75rem;color:var(--text-dim);">Weight:</span>
                    <input type="number" min="0" max="100" value="${skill.weight || 0}" 
                        onchange="updateSkillWeight(${index}, this.value)"
                        style="width:50px;padding:4px 6px;text-align:center;border:2px solid var(--accent-purple);border-radius:6px;background:var(--bg-card);color:var(--text-bright);font-weight:600;">
                </div>
                <button onclick="removeFromQueue(${index})" style="width:24px;height:24px;border-radius:50%;background:var(--incorrect);color:white;border:none;cursor:pointer;font-size:0.9rem;">×</button>
            </div>
        `;
    }).join('');
    
    // Update code display
    updateSkillCodeDisplay();
}

// Remove skill from queue by index
export function removeFromQueue(index) {
    if (index >= 0 && index < window.skillQueue.length) {
        UnifiedSkills.removeByIndex(index);
        updateQuickSkillCards();
        updateCompactNumberVisibility();
    }
}
// ========== END COMPACT SKILL CODE SYSTEM ==========

// Generate a shareable link with the current mixed mode code
export function generateMixedLink() {
    const code = document.getElementById('mixedCodeDisplay').textContent;
    if (!code || code === '---') return '';

    // Get current URL without parameters
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?c=${code}`;
}

// Copy the shareable link to clipboard
export function copyMixedLink() {
    const link = generateMixedLink();
    if (!link) {
        showToast('Select at least one skill first', 'error');
        return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => {
            showToast('Link copied! Share with students', 'success');
        }).catch(() => {
            showToast('Could not copy link', 'error');
        });
    }
}

// Show toast notification

export function getSkillCode(category, skillValue) {
    const skills = SKILLS[category] || [];
    const idx = skills.findIndex(s => s.v === skillValue);
    return idx >= 0 ? idx.toString().padStart(2, '0') : '00';
}

export function getSkillFromCode(category, code) {
    const skills = SKILLS[category] || [];
    const idx = parseInt(code, 10);
    return skills[idx] ? skills[idx].v : (skills[0]?.v || 'mixed');
}

// Generate settings code from current UI state
export function generateSettingsCode() {
    const category = document.getElementById("categorySelect")?.value || 'addition';
    const skill = document.getElementById("skillSelect")?.value || 'add';
    const range = document.getElementById("rangeSelect")?.value || '100';
    const decimal = document.getElementById("decimalSelect")?.value || '0';
    const timer = document.getElementById("timerSelect")?.value || '180';
    const difficulty = document.getElementById("difficultySelect")?.value || 'medium';

    const catCode = CATEGORY_CODES[category] || 'A';
    const skillCode = getSkillCode(category, skill);
    const rangeCode = RANGE_CODES[range] || '4';
    const decCode = DECIMAL_CODES[decimal] || '0';
    const timerCode = TIMER_CODES[timer] || '3';
    const diffCode = DIFFICULTY_CODES[difficulty] || 'M';

    // Format: CAT-SKILL-RANGE-DEC-TIMER-DIFF (e.g., A-03-4-0-3-M)
    return `${catCode}${skillCode}${rangeCode}${decCode}${timerCode}${diffCode}`;
}

// Update the displayed settings code and save settings
export function updateSettingsCode() {
    // Legacy function - now handled by updateSkillCodeDisplay
    saveSettings();
}

// Parse and apply a settings code (legacy + new format)
export function applySettingsCode() {
    const input = document.getElementById("settingsCodeInput");
    if (!input) return;
    
    const rawCode = (input.value || '').toUpperCase().trim();
    
    // Check if it's new skill code format (2-char codes with dashes)
    if (/^[A-Z0-9]{2,3}(-[A-Z0-9]{2,3})*$/i.test(rawCode)) {
        // Redirect to new skill code system
        document.getElementById('studentCodeInput').value = rawCode;
        applySkillCode();
        input.value = '';
        return;
    }

    // Check if it's a compact mixed mode code (starts with M, at least 18 chars)
    if (rawCode.startsWith('M') && !rawCode.startsWith('MX-') && rawCode.length >= 18) {
        applyCompactMixedCode(rawCode, input);
        return;
    }

    // Check if it's old format mixed mode code (starts with MX-)
    if (rawCode.startsWith('MX-')) {
        applyMixedCode(rawCode, input);
        return;
    }

    const code = rawCode.replace(/[^A-Z0-9]/g, '');

    if (code.length < 7) {
        showCodeError("Code too short. Need 7 characters.");
        return;
    }

    try {
        // Parse code: CAT(1) + SKILL(2) + RANGE(1) + DEC(1) + TIMER(1) + DIFF(1) = 7 chars
        const catCode = code[0];
        const skillCode = code.substring(1, 3);
        const rangeCode = code[3];
        const decCode = code[4];
        const timerCode = code[5];
        const diffCode = code[6];

        // Validate and apply category
        const category = CODE_TO_CATEGORY[catCode];
        if (!category) throw new Error("Invalid category");
        document.getElementById("categorySelect").value = category;

        // Update skill options for the category, then set skill
        updateSkillOptions();
        const skill = getSkillFromCode(category, skillCode);
        document.getElementById("skillSelect").value = skill;

        // Apply range
        const range = CODE_TO_RANGE[rangeCode];
        const rangeSelect = document.getElementById("rangeSelect");
        if (range && rangeSelect) rangeSelect.value = range;

        // Apply decimals
        const dec = CODE_TO_DECIMAL[decCode];
        const decimalSelect = document.getElementById("decimalSelect");
        if (dec !== undefined && decimalSelect) decimalSelect.value = dec;

        // Apply timer
        const timer = CODE_TO_TIMER[timerCode];
        const timerSelect = document.getElementById("timerSelect");
        if (timer && timerSelect) timerSelect.value = timer;

        // Apply difficulty
        const diff = CODE_TO_DIFFICULTY[diffCode];
        const difficultySelect = document.getElementById("difficultySelect");
        if (diff && difficultySelect) difficultySelect.value = diff;

        // Update visibility and code display
        updateNumberSectionVisibility();
        updateSettingsCode();

        // Show success feedback
        input.style.borderColor = "var(--correct)";
        input.style.background = "rgba(6,214,160,0.2)";
        setTimeout(() => {
            input.style.borderColor = "var(--accent-orange)";
            input.style.background = "var(--bg-card-light)";
            input.value = '';
        }, 1500);

    } catch (e) {
        showCodeError("Invalid code format");
    }
}

// Parse and apply a mixed mode code (MX-...)
export function applyMixedCode(code, input) {
    try {
        // Format: MX-[skillcodes]-[range][dec][diff][time][mode]
        // Example: MX-A00.A01.B02-40MSP
        const parts = code.split('-');
        if (parts.length < 3) throw new Error("Invalid format");

        const skillsPart = parts[1];
        const settingsPart = parts[2];

        // Parse skills (A00.A01.B02...)
        const skillCodes = skillsPart.split('.');
        const selectedSkills = {};

        const MODE_LETTER_REVERSE = { 'P': 'practice', 'T': 'timed', 'R': 'race', 'B': 'boss', 'W': 'worksheet' };

        skillCodes.forEach(sc => {
            if (sc.length >= 3) {
                const catLetter = sc[0];
                const skillIdx = parseInt(sc.substring(1), 10);
                const category = CODE_TO_CATEGORY[catLetter];

                if (category && SKILLS[category] && SKILLS[category][skillIdx]) {
                    if (!selectedSkills[category]) selectedSkills[category] = [];
                    selectedSkills[category].push(SKILLS[category][skillIdx].v);
                }
            }
        });

        // Parse settings: [range][dec][diff][time][mode]
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

        // Validate skills were parsed
        if (Object.keys(selectedSkills).length === 0) {
            throw new Error("No valid skills found");
        }

        // Apply mixed settings
        state.mixedModeSettings = {
            selectedSkills: selectedSkills,
            range: parseInt(range, 10),
            decimalPlaces: parseInt(decimal, 10),
            difficulty: difficulty,
            timeChoice: timerChoice,
            modeChoice: modeChoice,
            timer: timer ? parseInt(timer, 10) : null,
            mode: mode
        };

        state.category = 'all_mixed';
        state.skill = 'custom_mixed';
        state.range = state.mixedModeSettings.range;
        state.decimalPlaces = state.mixedModeSettings.decimalPlaces;
        state.difficulty = state.mixedModeSettings.difficulty;

        // Update UI with null checks
        const categorySelect = document.getElementById('categorySelect');
        const rangeSelect = document.getElementById('rangeSelect');
        const decimalSelect = document.getElementById('decimalSelect');
        const difficultySelect = document.getElementById('difficultySelect');
        
        if (categorySelect) categorySelect.value = 'all_mixed';
        if (rangeSelect) rangeSelect.value = state.range;
        if (decimalSelect) decimalSelect.value = state.decimalPlaces;
        if (difficultySelect) difficultySelect.value = state.difficulty;

        // Show the custom mixed skill and ensure value is set
        const skillSelect = document.getElementById('skillSelect');
        if (skillSelect) {
            skillSelect.innerHTML = '<option value="custom_mixed" selected>🎲 Custom Mixed (Code Applied)</option>';
            skillSelect.value = 'custom_mixed';
        }

        // Save mixed mode settings to cookie for Play Mixed button
        saveMixedModeSettings();

        // Grey out mode cards if teacher set the mode
        updateModeCardsState();

        // Count skills for feedback
        const totalSkills = Object.values(selectedSkills).reduce((sum, arr) => sum + arr.length, 0);

        // Show success feedback
        input.style.borderColor = "var(--correct)";
        input.style.background = "rgba(6,214,160,0.2)";
        input.value = `✓ ${totalSkills} skills loaded!`;
        setTimeout(() => {
            input.style.borderColor = "var(--accent-orange)";
            input.style.background = "var(--bg-card-light)";
            input.value = '';
        }, 2000);

    } catch (e) {
        console.error("Mixed code error:", e);
        showCodeError("Invalid mixed code");
    }
}

// Parse and apply compact mixed mode code (M + skill chars + 5 setting chars)
export function applyCompactMixedCode(code, input) {
    try {
        // Format: M[skill chars][5-char settings][4-char goals]
        // Skills: 2 chars per category (6 categories) = 12+ chars (base36 encoded bitfields)
        // Settings: range(1) + decimal(1) + difficulty(1) + timer(1) + mode(1) = 5 chars
        // Goals: totalProblems(2) + correctGoal(2) = 4 chars (optional, for backwards compatibility)

        const MODE_LETTER_REVERSE = { 'P': 'practice', 'T': 'timed', 'R': 'race', 'B': 'boss', 'W': 'worksheet' };

        // Check if code has goals (22+ chars) or is old format (18 chars)
        const hasGoals = code.length >= 22;

        let settingsPart, skillPart, goalsPart;
        if (hasGoals) {
            goalsPart = code.slice(-4); // last 4 chars are goals
            settingsPart = code.slice(-9, -4); // 5 chars before goals
            skillPart = code.substring(1, code.length - 9); // everything between M and settings
        } else {
            goalsPart = '0000'; // no goals (backwards compatible)
            settingsPart = code.slice(-5); // last 5 chars are settings
            skillPart = code.substring(1, code.length - 5); // everything between M and settings
        }

        // Parse skills from bitfields
        const selectedSkills = {};
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

        // Parse settings
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

        // Parse problem goals
        const totalProblems = parseInt(goalsPart.substring(0, 2), 10) || 0;
        const correctGoal = parseInt(goalsPart.substring(2, 4), 10) || 0;

        // Validate skills were parsed
        if (Object.keys(selectedSkills).length === 0) {
            throw new Error("No valid skills found");
        }

        // Apply mixed settings
        state.mixedModeSettings = {
            selectedSkills: selectedSkills,
            range: parseInt(range, 10),
            decimalPlaces: parseInt(decimal, 10),
            difficulty: difficulty,
            timeChoice: timerChoice,
            modeChoice: modeChoice,
            timer: timer ? parseInt(timer, 10) : null,
            mode: mode,
            // Problem goals
            totalProblemsEnabled: totalProblems > 0,
            totalProblems: totalProblems > 0 ? totalProblems : null,
            correctGoalEnabled: correctGoal > 0,
            correctGoal: correctGoal > 0 ? correctGoal : null
        };

        state.category = 'all_mixed';
        state.skill = 'custom_mixed';
        state.range = state.mixedModeSettings.range;
        state.decimalPlaces = state.mixedModeSettings.decimalPlaces;
        state.difficulty = state.mixedModeSettings.difficulty;

        // Update UI with null checks
        const rangeSelect = document.getElementById('rangeSelect');
        const decimalSelect = document.getElementById('decimalSelect');
        const difficultySelect = document.getElementById('difficultySelect');
        
        if (rangeSelect) rangeSelect.value = state.range;
        if (decimalSelect) decimalSelect.value = state.decimalPlaces;
        if (difficultySelect) difficultySelect.value = state.difficulty;

        // Show the custom mixed skill in dropdown and ensure value is set
        const skillSelect = document.getElementById('skillSelect');
        if (skillSelect) {
            skillSelect.innerHTML = '<option value="custom_mixed" selected>🎲 Custom Mixed (Code Applied)</option>';
            skillSelect.value = 'custom_mixed';
        }

        // Save mixed mode settings to cookie for Play Mixed button
        saveMixedModeSettings();

        // Grey out mode cards if teacher set the mode
        updateModeCardsState();

        // Count skills for feedback
        const totalSkills = Object.values(selectedSkills).reduce((sum, arr) => sum + arr.length, 0);

        // Show success feedback
        input.style.borderColor = "var(--correct)";
        input.style.background = "rgba(6,214,160,0.2)";
        input.value = `✓ ${totalSkills} skills loaded!`;
        setTimeout(() => {
            input.style.borderColor = "var(--accent-orange)";
            input.style.background = "var(--bg-card-light)";
            input.value = '';
        }, 2000);

        // If teacher set the mode, grey out other modes but don't auto-start
        // User will click Start Game button

    } catch (e) {
        console.error("Compact mixed code error:", e);
        showCodeError("Invalid code format");
    }
}

// Update mode cards state based on mixed mode settings
export function updateModeCardsState() {
    const modeCards = document.querySelectorAll('.mode-card:not(.mixed-mode-card)');

    if (state.mixedModeSettings && state.mixedModeSettings.modeChoice === 'teacher' && state.mixedModeSettings.mode) {
        // Grey out all modes except the teacher-selected one
        const teacherMode = state.mixedModeSettings.mode;
        modeCards.forEach(card => {
            const cardMode = card.dataset.mode;
            if (cardMode !== teacherMode) {
                card.classList.add('mode-disabled');
                card.style.opacity = '0.4';
                card.style.pointerEvents = 'none';
            } else {
                card.classList.remove('mode-disabled');
                card.classList.add('selected');
                card.style.opacity = '1';
                card.style.pointerEvents = 'auto';
            }
        });
    } else {
        // Enable all modes
        modeCards.forEach(card => {
            card.classList.remove('mode-disabled');
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        });
    }
}

// Reset mixed mode and enable all mode cards
export function resetMixedMode() {
    state.mixedModeSettings = null;
    state.category = 'operations';
    state.skill = 'add';

    // Reset UI
    document.getElementById('categorySelect').value = 'operations';
    updateSkillOptions();
    updateModeCardsState();

    // Show feedback
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => card.classList.remove('selected'));
    document.querySelector('.mode-card[data-mode="practice"]').classList.add('selected');
}

export function showCodeError(msg) {
    const input = document.getElementById("settingsCodeInput");
    input.style.borderColor = "var(--incorrect)";
    input.style.background = "rgba(239,71,111,0.2)";
    input.placeholder = msg;
    setTimeout(() => {
        input.style.borderColor = "var(--accent-orange)";
        input.style.background = "var(--bg-card-light)";
        input.placeholder = "Enter code";
    }, 2000);
}

