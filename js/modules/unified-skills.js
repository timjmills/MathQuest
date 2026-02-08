import { state } from './state.js';
import { DOMAINS, SKILLS, SKILL_CODES, CODE_TO_SKILL } from './data.js';

export const UnifiedSkills = {
    // The single array of selected skills
    skills: [],
    
    // UI state
    expanded: false,
    
    // Add a skill (returns true if added, false if already exists)
    add(skill) {
        const exists = this.skills.some(s => s.skillId === skill.skillId && s.categoryId === skill.categoryId);
        if (exists) return false;
        
        this.skills.push({
            domainId: skill.domainId,
            categoryId: skill.categoryId,
            skillId: skill.skillId,
            skillLabel: skill.skillLabel,
            categoryIcon: skill.categoryIcon,
            categoryName: skill.categoryName,
            domainColor: skill.domainColor || '#8b5cf6',
            percent: skill.percent || 0
        });
        
        this.syncAll();
        return true;
    },
    
    // Remove a skill by index
    removeByIndex(index) {
        if (index >= 0 && index < this.skills.length) {
            this.skills.splice(index, 1);
            this.syncAll();
        }
    },
    
    // Remove a skill by skillId
    removeBySkillId(skillId) {
        const index = this.skills.findIndex(s => s.skillId === skillId);
        if (index !== -1) {
            this.skills.splice(index, 1);
            this.syncAll();
        }
    },
    
    // Clear all skills
    clear() {
        this.skills = [];
        this.expanded = false;
        this.syncAll();
    },
    
    // Check if a skill exists
    has(skillId, categoryId) {
        return this.skills.some(s => s.skillId === skillId && (categoryId === undefined || s.categoryId === categoryId));
    },
    
    // Get count
    get count() {
        return this.skills.length;
    },
    
    // Get skills as array (for iteration)
    getAll() {
        return [...this.skills];
    },
    
    // Get as selectedSkills format { categoryId: [skillId, ...] }
    getAsSelectedSkills() {
        const result = {};
        this.skills.forEach(skill => {
            if (!result[skill.categoryId]) {
                result[skill.categoryId] = [];
            }
            if (!result[skill.categoryId].includes(skill.skillId)) {
                result[skill.categoryId].push(skill.skillId);
            }
        });
        return result;
    },
    
    // Get as globalSkillsList format
    getAsGlobalFormat() {
        return this.skills.map(skill => ({
            type: 'skill',
            id: skill.skillId,
            categoryId: skill.categoryId,
            domainId: skill.domainId,
            label: skill.skillLabel.replace(/^[🟢🟡🟠🔴🎲🔢🥧📐📊🔤📏🔀🎯🔬🧮📍📈⬜🔷½]+\s*/, ''),
            fullLabel: skill.skillLabel,
            icon: skill.categoryIcon,
            categoryName: skill.categoryName,
            color: skill.domainColor || '#8b5cf6',
            percent: skill.percent || 0
        }));
    },
    
    // Sync to all legacy arrays and UI
    syncAll() {
        // Sync to legacy arrays for backward compatibility
        window.skillQueue = [...this.skills];
        window.globalSkillsList = this.getAsGlobalFormat();
        window.weightedItems = window.globalSkillsList.map(item => ({...item}));
        window.mixedSkillsList = window.globalSkillsList.map(item => ({...item}));
        
        // Sync to state.mixedModeSettings
        if (!state.mixedModeSettings) state.mixedModeSettings = {};
        state.mixedModeSettings.selectedSkills = this.getAsSelectedSkills();
        state.mixedModeSettings.name = `Custom Practice (${this.count} skills)`;
        
        // Sync to print settings
        window.queuedPrintSkills = this.getAsSelectedSkills();
        window.queuedSkillsFullInfo = [...this.skills];
        
        // Update all UI displays
        this.updateAllUI();
    },
    
    // Update all UI elements
    updateAllUI() {
        this.updateCountBar();
        this.updateQueueContainer();
        this.updateBadges();
        this.updateWeightedDisplay();
        this.updateMixedDisplay();
        this.updateGlobalDisplay();
        // Update number selection visibility for mult/div skills
        if (typeof updateCompactNumberVisibility === 'function') {
            updateCompactNumberVisibility();
        }
        // Update skill code display and weighted list for teacher mode
        if (typeof renderWeightedSkillsList === 'function') {
            renderWeightedSkillsList();
        }
        if (typeof updateSkillCodeDisplay === 'function') {
            updateSkillCodeDisplay();
        }
        // Update inline skill list (teacher mode)
        if (typeof updateSkillListInline === 'function') {
            updateSkillListInline();
        }
        // Update student skills display
        if (typeof updateStudentSkillsDisplay === 'function') {
            updateStudentSkillsDisplay();
        }
    },
    
    // Update the compact count bar (teacher mode)
    updateCountBar() {
        const countBar = document.getElementById('skillCountBar');
        const countNumber = document.getElementById('skillCountNumber');
        const expandIcon = document.getElementById('skillCountExpandIcon');
        
        if (!countBar || !countNumber) return;
        
        // Only show for teacher mode
        const isTeacherMode = document.body.classList.contains('teacher-mode');
        
        if (this.count === 0 || !isTeacherMode) {
            countBar.style.display = 'none';
            this.expanded = false;
        } else {
            countBar.style.display = 'block';
            countNumber.textContent = this.count;
            if (expandIcon) {
                expandIcon.style.transform = this.expanded ? 'rotate(180deg)' : 'rotate(0deg)';
            }
            countBar.style.borderRadius = this.expanded ? '10px 10px 0 0' : '10px';
        }
    },
    
    // Update the expandable queue container
    updateQueueContainer() {
        const container = document.getElementById('skillQueueContainer');
        const list = document.getElementById('skillQueueList');
        const count = document.getElementById('skillQueueCount');
        
        if (count) count.textContent = this.count;
        
        if (!container || !list) return;
        
        if (this.count === 0 || !this.expanded) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        
        list.innerHTML = this.skills.map((skill, index) => `
            <div style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--bg-card);border:2px solid ${skill.domainColor || 'var(--accent-cyan)'};border-radius:20px;font-size:0.85rem;">
                <span style="color:${skill.domainColor || 'var(--text)'};">${skill.categoryIcon}</span>
                <span style="font-weight:500;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${skill.skillLabel.replace(/^[🟢🟡🟠🔴🎲]+\s*/, '')}</span>
                <button onclick="UnifiedSkills.removeByIndex(${index})" style="background:none;border:none;color:var(--text-dim);cursor:pointer;padding:0 2px;font-size:1rem;line-height:1;" title="Remove">×</button>
            </div>
        `).join('');
    },
    
    // Update badge counts
    updateBadges() {
        if (typeof updateSkillsCountBadge === 'function') {
            updateSkillsCountBadge();
        }
    },
    
    // Update weighted items display
    updateWeightedDisplay() {
        if (typeof updateWeightedItemsDisplay === 'function') {
            try { updateWeightedItemsDisplay(); } catch(e) {}
        }
    },
    
    // Update mixed skills display
    updateMixedDisplay() {
        if (typeof updateMixedSkillsDisplay === 'function') {
            try { updateMixedSkillsDisplay(); } catch(e) {}
        }
    },
    
    // Update global skills display
    updateGlobalDisplay() {
        if (typeof updateGlobalSkillsDisplay === 'function') {
            try { updateGlobalSkillsDisplay(); } catch(e) {}
        }
    },
    
    // Toggle expanded state
    toggleExpanded() {
        this.expanded = !this.expanded;
        this.updateCountBar();
        this.updateQueueContainer();
    },
    
    // Load from saved settings (e.g., from cookie)
    loadFromSettings(settings) {
        if (!settings || !settings.selectedSkills) return;
        
        this.skills = [];
        
        // Convert selectedSkills format back to skills array
        Object.entries(settings.selectedSkills).forEach(([categoryId, skillIds]) => {
            skillIds.forEach(skillId => {
                // Try to find skill info from the skill index
                const index = getSkillIndex();
                const key = `${categoryId}:${skillId}`.toLowerCase();
                const info = index[key] || index[skillId.toLowerCase()];
                
                this.skills.push({
                    domainId: info?.domainId || '',
                    categoryId: categoryId,
                    skillId: skillId,
                    skillLabel: info?.label || skillId,
                    categoryIcon: info?.icon || '📚',
                    categoryName: info?.categoryName || categoryId,
                    domainColor: info?.color || '#8b5cf6',
                    percent: 0
                });
            });
        });
        
        this.syncAll();
    }
};

// Legacy variable references (kept for backward compatibility)
window.skillQueue = []; // Will be synced by UnifiedSkills
export let keepSearchOpen = false;
export let searchResultsMouseDown = false;

// Legacy accessor functions that delegate to UnifiedSkills
export function addToSkillQueue(domainId, categoryId, skillId, skillLabel, categoryIcon, categoryName, domainColor) {
    keepSearchOpen = true;
    searchResultsMouseDown = true;
    
    // Decode HTML entities
    const decodeHtml = (str) => {
        const txt = document.createElement('textarea');
        txt.innerHTML = str;
        return txt.value;
    };
    const decodedLabel = decodeHtml(skillLabel);
    const decodedCategoryName = decodeHtml(categoryName);
    
    const added = UnifiedSkills.add({
        domainId, categoryId, skillId, 
        skillLabel: decodedLabel, 
        categoryIcon, 
        categoryName: decodedCategoryName, 
        domainColor
    });
    
    if (!added) {
        showQueueFeedback('Already in queue!', '#ff9800');
    } else {
        showQueueFeedback('✓ Added!', 'var(--correct)');
    }
    
    // EXPLICITLY ensure skillQueue is synced (defensive)
    window.skillQueue = [...UnifiedSkills.skills];
    
    // Refresh search results to show updated count
    const query = document.getElementById('skillSearchInput')?.value;
    if (query && query.trim().length >= 2) {
        handleSkillSearch(query);
    }
    
    // Explicitly update the count bar (defensive)
    UnifiedSkills.updateCountBar();
    
    // Keep focus on search
    setTimeout(() => {
        const input = document.getElementById('skillSearchInput');
        const results = document.getElementById('skillSearchResults');
        if (input) input.focus();
        if (results) results.style.display = 'block';
        searchResultsMouseDown = false;
    }, 50);
}

export function removeFromSkillQueue(index) {
    UnifiedSkills.removeByIndex(index);
}

export function clearSkillQueue() {
    UnifiedSkills.clear();
}

export function toggleSkillQueueExpanded() {
    UnifiedSkills.toggleExpanded();
}

export function updateSkillQueueUI() {
    UnifiedSkills.updateAllUI();
}

// Kept for backward compatibility but now uses UnifiedSkills
export function syncSkillsToAllSystems() {
    UnifiedSkills.syncAll();
}

export function handleSearchBlur(event) {
    // Don't close if we're clicking inside the results area
    setTimeout(() => {
        if (!keepSearchOpen && !searchResultsMouseDown) {
            hideSearchResults();
        }
        keepSearchOpen = false;
    }, 300);
}

// Check links input for factor links problems
export function checkLinksInput(input) {
    const answer = parseInt(input.dataset.answer);
    const value = parseInt(input.value);
    
    if (isNaN(value)) {
        input.style.backgroundColor = 'white';
        return;
    }
    
    if (value === answer) {
        input.style.backgroundColor = '#d4edda';
        input.style.borderColor = '#28a745';
    } else {
        input.style.backgroundColor = '#f8d7da';
    }
}

export function showQueueFeedback(message, color) {
    const input = document.getElementById('skillSearchInput');
    if (!input) return;
    
    const originalPlaceholder = input.placeholder;
    const originalBorder = input.style.borderColor;
    
    input.placeholder = message;
    input.style.borderColor = color;
    
    setTimeout(() => {
        input.placeholder = '🔍 Search skills to practice or print...';
        input.style.borderColor = 'var(--accent-cyan)';
    }, 1200);
}

export function playSelectedSkills(mode = 'practice') {
    if (window.skillQueue.length === 0) {
        alert('No skills selected. Use the search bar to add skills.');
        return;
    }

    // Convert skill queue to mixed mode settings format
    const selectedSkills = {};
    window.skillQueue.forEach(skill => {
        if (!selectedSkills[skill.categoryId]) {
            selectedSkills[skill.categoryId] = [];
        }
        if (!selectedSkills[skill.categoryId].includes(skill.skillId)) {
            selectedSkills[skill.categoryId].push(skill.skillId);
        }
    });
    
    // Save to mixed mode settings
    const modeNames = {
        'practice': 'Practice',
        'boss': 'Boss Battle',
        'race': 'Car Race',
        'worksheet': 'Worksheet'
    };
    
    state.mixedModeSettings = {
        selectedSkills: selectedSkills,
        name: `Custom ${modeNames[mode] || 'Practice'} (${window.skillQueue.length} skills)`
    };
    
    // CRITICAL: Set state.category and state.skill DIRECTLY so startGame and generateQuestion use them
    state.category = 'all_mixed';
    state.skill = 'custom_mixed';
    state.isMixedMode = true;
    
    // Set domain to all_domains for mixed practice
    document.getElementById('domainSelect').value = 'all_domains';
    updateCategoryOptions();
    document.getElementById('categorySelect').value = 'all_mixed';
    updateSkillOptions();
    document.getElementById('skillSelect').value = 'custom_mixed';
    
    // Set the appropriate game mode
    if (mode === 'boss') {
        // Boss Battle mode
        state.gameMode = 'boss';
        state.bossHealth = 100;
        state.bossMaxHealth = 100;
        state.playerHealth = 100;
        showNotification(`👹 Starting Boss Battle with ${window.skillQueue.length} skill${window.skillQueue.length > 1 ? 's' : ''}!`, 'success');
    } else if (mode === 'race') {
        // Car Race mode
        state.gameMode = 'race';
        state.racePosition = 0;
        state.raceOpponentPosition = 0;
        showNotification(`🏎️ Starting Car Race with ${window.skillQueue.length} skill${window.skillQueue.length > 1 ? 's' : ''}!`, 'success');
    } else if (mode === 'worksheet') {
        // Worksheet mode - on-screen worksheet style
        state.gameMode = 'worksheet';
        showNotification(`📝 Starting Worksheet with ${window.skillQueue.length} skill${window.skillQueue.length > 1 ? 's' : ''}!`, 'success');
    } else {
        // Standard practice mode
        state.gameMode = 'practice';
        showNotification(`▶️ Starting Practice with ${window.skillQueue.length} skill${window.skillQueue.length > 1 ? 's' : ''}!`, 'success');
    }
    
    // Start the game
    startGame();
}

export function printSelectedSkills() {
    printFromQueue();
}

export function printFromQueue() {
    // Use skills from queue, or current dropdown selection if queue is empty
    let skillsToUse = [];
    
    if (window.skillQueue.length > 0) {
        skillsToUse = [...window.skillQueue];
    } else {
        // Use current dropdown selection
        const domain = document.getElementById("domainSelect").value;
        const category = document.getElementById("categorySelect").value;
        const skill = document.getElementById("skillSelect").value;
        const skillLabel = document.getElementById("skillSelect").selectedOptions[0]?.text || skill;
        
        skillsToUse = [{
            domainId: domain,
            categoryId: category,
            skillId: skill,
            skillLabel: skillLabel
        }];
    }
    
    // Show simple print dialog
    openSimplePrintDialog(skillsToUse);
}

