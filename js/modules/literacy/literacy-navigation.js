// literacy-navigation.js — goTo* functions for Literacy Quest hub routing.
// Imported by literacy-init.js and attached to window there.
// All functions gate on FEATURES.LITERACY_QUEST_ENABLED before doing anything;
// this keeps Math Quest completely unaffected when the flag is off.

import { FEATURES } from '../features.js';
import { state } from '../state.js';
import { showView } from '../navigation.js';

/**
 * Navigate to the top-level Quest Hub (subject picker).
 * Falls back to homeView when the literacy flag is off.
 */
export function goToHub() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) {
        showView('homeView');
        return;
    }
    state.subject = null;
    showView('questHubView');
}

/**
 * Navigate to the Math Quest home screen.
 * Available from the Quest Hub's Math card.
 */
export function goToMathHome() {
    state.subject = 'math';
    showView('homeView');
}

/**
 * Navigate to the Reading Quest strand home.
 */
export function goToReadingHome() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) return;
    state.subject = 'reading';
    showView('readingHomeView');
}

/**
 * Navigate to the Language Quest strand home.
 */
export function goToLanguageHome() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) return;
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
