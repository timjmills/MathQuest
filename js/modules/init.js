import { state } from './state.js';
import { createBackgroundShapes, loadState } from './ui-core.js';
import { updateCategoryOptions, updateSkillOptions, updateBreadcrumb, initInlineDropdowns } from './category-dropdowns.js';
import { renderNumbers } from './number-selection.js';
import { updateSettingsCode } from './skill-codes.js';
import { loadSettingsFromStorage } from './settings-panel.js';
import { loadUserRole } from './user-role.js';
import { loadFavorites } from './favorites.js';
import { loadQuickSkills } from './quick-skills.js';
import { initializeSkillProgress } from './progress.js';
import { submitAnswer } from './answer-check.js';
import { nextQuestion } from './game-control.js';
import { applySettingsCode } from './skill-codes.js';
import { closePrintSettings } from './print-settings.js';
import { closePrintPreview } from './print-generate.js';

export function init() {
    createBackgroundShapes();
    updateCategoryOptions();
    updateSkillOptions();
    updateBreadcrumb();
    renderNumbers();
    loadState();
    updateSettingsCode();

    loadSettingsFromStorage();
    loadUserRole();
    loadFavorites();
    loadQuickSkills();
    initializeSkillProgress();

    checkURLParameters();

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && document.getElementById("gameView").classList.contains("active")) {
            if (state.hasAnswered) nextQuestion();
            else submitAnswer();
        }
    });

    setTimeout(() => {
        initInlineDropdowns();
    }, 100);
}

export function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code') || urlParams.get('c');

    if (code) {
        // Try student input first, then teacher input
        const input = document.getElementById("studentCodeInput") || document.getElementById("teacherCodeInput");
        if (input) {
            input.value = code;
            setTimeout(() => applySkillCode(input.id), 100);
        }
    }
}

// Close modals when clicking outside
export function setupModalListeners() {
    const printSettingsEl = document.getElementById('printSettingsModal');
    if (printSettingsEl) {
        printSettingsEl.addEventListener('click', function(e) {
            if (e.target === this) closePrintSettings();
        });
    }

    const printPreviewEl = document.getElementById('printPreviewContainer');
    if (printPreviewEl) {
        printPreviewEl.addEventListener('click', function(e) {
            if (e.target === this) closePrintPreview();
        });
    }
}

// Initialize on DOM ready
export function bootstrap() {
    setupModalListeners();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}
