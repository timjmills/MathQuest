import { state } from './state.js';
import { createBackgroundShapes, loadState } from './ui-core.js';
import { updateCategoryOptions, updateSkillOptions, updateBreadcrumb, initInlineDropdowns } from './category-dropdowns.js';
import { renderNumbers } from './number-selection.js';
import { updateSettingsCode, parseEnhancedSkillCode } from './skill-codes.js';
import { loadSettingsFromStorage } from './settings-panel.js';
import { loadUserRole } from './user-role.js';
import { loadFavorites } from './favorites.js';
import { loadQuickSkills } from './quick-skills.js';
import { initializeSkillProgress } from './progress.js';
import { submitAnswer } from './answer-check.js';
import { nextQuestion } from './game-control.js';
import { applySettingsCode } from './skill-codes.js';
import { showStudentLandingModal } from './gamification.js';
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

    // Initialize gamification system
    if (typeof window !== 'undefined' && window.initGamification) {
        window.initGamification();
    }
    if (typeof window !== 'undefined' && window.updateReviewCount) {
        window.updateReviewCount();
    }
    // Initialize daily stats banner
    if (typeof window !== 'undefined' && window.initDailyStats) {
        window.initDailyStats();
    }

    // Sync celebration & voice toggles to saved state
    const celebToggle = document.getElementById('celebrationToggle');
    if (celebToggle) celebToggle.checked = state.celebrationsEnabled;
    const voiceToggle = document.getElementById('voiceToggle');
    if (voiceToggle) voiceToggle.checked = state.ttsEnabled;

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

    // Check ?quiz= first (Quiz/Test link — student test-taking mode)
    const quizParam = urlParams.get('quiz');
    if (quizParam) {
        // Clean URL
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        // Initialize quiz DB then handle quiz
        if (typeof window.initQuizDB === 'function') {
            window.initQuizDB().then(() => {
                if (typeof window.handleQuizURL === 'function') {
                    window.handleQuizURL(quizParam);
                }
            });
        }
        return;
    }

    // Check ?qs= first (Quick Start link — loads skills into Quick Start grid)
    const qsCode = urlParams.get('qs');
    if (qsCode) {
        // Check for lock suffix: code|Q1
        if (qsCode.includes('|')) {
            const [skillsCode, settingsPart] = qsCode.split('|');
            if (typeof window.setQuickSkillsFromCode === 'function') {
                window.setQuickSkillsFromCode(skillsCode);
            }
            if (settingsPart && settingsPart.includes('Q1') && typeof window.setQuickStartLocked === 'function') {
                window.setQuickStartLocked(true);
            }
        } else {
            if (typeof window.setQuickSkillsFromCode === 'function') {
                window.setQuickSkillsFromCode(qsCode);
            }
        }
        // Clean the URL
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        return;
    }

    // Check ?c= or ?code= (Direct Play link)
    const code = urlParams.get('code') || urlParams.get('c');
    if (code) {
        // Enhanced code with settings (contains | character) — show landing modal
        if (code.includes('|')) {
            const parsed = parseEnhancedSkillCode(code);
            showStudentLandingModal(parsed);
            return;
        }

        // Legacy code without pipe — treat as enhanced with empty settings → show landing modal
        const parsed = parseEnhancedSkillCode(code + '|');
        showStudentLandingModal(parsed);
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
