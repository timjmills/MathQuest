// literacy-navigation.js — goTo* functions for Literacy Quest hub routing.
// Imported by literacy-init.js and attached to window there.
// All functions gate on FEATURES.LITERACY_QUEST_ENABLED before doing anything;
// this keeps Math Quest completely unaffected when the flag is off.

import { FEATURES } from '../features.js';
import { state } from '../state.js';
import { showView } from '../navigation.js';

/**
 * Reset MAP-mode flags so a student leaving a MAP variant view doesn't
 * carry state.mapMode = true into a Math Quest session, where ~18
 * branches in answer-check.js would route answers to a null MAP session.
 * Called from every non-MAP navigation entry point as a defensive guard.
 */
function _clearMapMode() {
    state.mapMode = false;
    state.mapVariant = null;
    state.mapSessionMode = null;
    state.passageSession = null;
}

/**
 * Legacy "Quest Hub" entry point.
 * The choose-your-quest hub view was removed; all literacy entry now goes
 * through the lit-nav dropdown in the top nav. Old call sites (existing
 * onclick handlers, fallbacks in coming-soon, etc.) route back to math home.
 */
export function goToHub() {
    _clearMapMode();
    state.subject = 'math';
    showView('homeView');
}

/**
 * Navigate to the Math Quest home screen.
 * Available from the Quest Hub's Math card.
 */
export function goToMathHome() {
    _clearMapMode();
    state.subject = 'math';
    showView('homeView');
}

/**
 * Navigate to the Reading Quest strand home.
 */
export function goToReadingHome() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) return;
    _clearMapMode();
    state.subject = 'reading';
    showView('readingHomeView');
}

/**
 * Navigate to the Language Quest strand home.
 */
export function goToLanguageHome() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) return;
    _clearMapMode();
    state.subject = 'language';
    showView('languageHomeView');
}

/**
 * Navigate to MAP Quest — Reading K-2 variant.
 */
export function goToMapReadingK2() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) {
        showView('homeView');
        return;
    }
    state.subject = 'reading';
    state.mapVariant = 'reading-k2';
    state.mapMode = true;
    showView('mapReadingK2View');
}

/**
 * Navigate to MAP Quest — Reading 2-5 variant.
 */
export function goToMapReading25() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) {
        showView('homeView');
        return;
    }
    state.subject = 'reading';
    state.mapVariant = 'reading-2-5';
    state.mapMode = true;
    showView('mapReading25View');
}

/**
 * Navigate to MAP Quest — Language Usage 2-12 variant.
 */
export function goToMapLanguageUsage() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) {
        showView('homeView');
        return;
    }
    state.subject = 'language';
    state.mapVariant = 'language-usage';
    state.mapMode = true;
    showView('mapLanguageUsageView');
}

/**
 * Navigate to the Literacy Dashboard.
 */
export function goToLiteracyDashboard() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) {
        showView('homeView');
        return;
    }
    showView('literacyDashboardView');
}
