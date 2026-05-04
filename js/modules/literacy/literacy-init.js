// literacy-init.js — Literacy Quest initialization.
// Called from globals.js AFTER Math Quest is fully wired.
// When FEATURES.LITERACY_QUEST_ENABLED is false this function hides
// all [data-literacy-gated="true"] elements and returns immediately,
// leaving Math Quest completely unchanged.

import { FEATURES } from '../features.js';
import { state } from '../state.js';
import {
    goToHub,
    goToMathHome,
    goToReadingHome,
    goToLanguageHome,
    goToMapReadingK2,
    goToMapReading25,
    goToMapLanguageUsage,
    goToLiteracyDashboard,
} from './literacy-navigation.js';

/**
 * Initialize Literacy Quest.
 * Must be called after Math Quest bootstrap() has completed.
 */
export function initLiteracy() {
    // Always set the default subject so Math Quest is unaffected.
    state.subject = 'math';

    // Extend state with literacy-specific properties that are absent from
    // the base state.js definition (safe no-op if a future state.js adds them).
    if (!('mapVariant' in state))          state.mapVariant = null;
    if (!('passageSession' in state))      state.passageSession = null;
    if (!('literacyEllScaffold' in state)) state.literacyEllScaffold = false;
    if (!('literacySpedScaffold' in state)) state.literacySpedScaffold = false;
    if (!('literacyGrade' in state))       state.literacyGrade = null;
    if (!('literacyRitBand' in state))     state.literacyRitBand = null;

    if (!FEATURES.LITERACY_QUEST_ENABLED) {
        // Hide (but do NOT remove) all gated elements so the flag can be
        // re-enabled without requiring a DOM reload.
        document.querySelectorAll('[data-literacy-gated="true"]').forEach(el => {
            el.style.display = 'none';
        });
        return;
    }

    // Flag is ON — attach navigation functions to window for inline handlers.
    Object.assign(window, {
        goToHub,
        goToMathHome,
        goToReadingHome,
        goToLanguageHome,
        goToMapReadingK2,
        goToMapReading25,
        goToMapLanguageUsage,
        goToLiteracyDashboard,
    });

    // Reveal the hub entry button in the homeView header.
    const hubBtn = document.getElementById('hubEntryBtn');
    if (hubBtn) hubBtn.style.display = 'inline-flex';
}
