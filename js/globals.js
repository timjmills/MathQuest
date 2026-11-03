// Barrel module: imports all modules and attaches functions to window for inline handlers

// Layer 0: Foundation
import { state } from './modules/state.js';
import { randInt, shuffle, pick, buildNumericOptions, simplifyFraction, normalizeText, fracText, fractionToPercent } from './modules/utils.js';
import { DOMAINS, SKILLS, SKILL_CODES, CODE_TO_SKILL, DEFAULT_TABLES, getDomainByCategory, getCategoryInfo, SKILL_TIME_CATEGORY, GRADE_COLORS, SKILL_GRADES, getSkillGrade, gradeCircleHTML, gradeCircleText, sortByGrade, SKILL_PRINT_SIZE, PRINT_SIZE_COLUMNS, getSkillPrintSize, SKILL_FULL_LABELS, getMixedSkillCount, isMixedMetaSkill, getMixedPoolSkills } from './modules/data.js';

// Layer 1: Storage & SVG helpers
import { setCookie, getCookie, loadPersistentData, savePersistentData } from './modules/storage.js';
import { createAngleSVG, createRectangleSVG, createSquareSVG, createTriangleSVG, createShapeSVG, create3DBoxSVG, createLShapeSVG, createTShapeSVG, createWordProblemShapeSVG, createLabeledRectSVG } from './modules/svg-geometry.js';
import { fracHTML, fracCircleSVG, fracBarHTML, fracWithVisual, fracEquationHTML, fracCompareHTML } from './modules/svg-fractions.js';
import { createAnalogClockSVG, createDigitalClockHTML, addTime, subtractTime, getElapsedTime, formatTime, formatTimeWithAMPM, timeToWords, numberToWords, generateTimeDistractors, createMagnifiableClock, createClockChoiceWithMagnify, selectClockOption, magnifyClock, closeMagnifiedClock, handleMagnifyEscape } from './modules/svg-clock.js';
import { createBase10Blocks, createCountingDots, createDotArray, createNumberLine, createHopNumberLine } from './modules/svg-base10.js';
import { getFactorPairs, createFactorLinksSVG } from './modules/svg-factors.js';
import { linkVocabInText } from './modules/vocab-tooltip.js';

// Layer 2: Gamification
import { awardXP, calculateLevel, checkStreakBonus, initSurpriseSchedule, checkSurpriseBonus, startSessionTimer, stopSessionTimer, startSmartReview, updateReviewCount, initGamification, showCelebrationModal, updateTooltips, checkBadgeTriggers, earnBadge, getAllBadges, initSpacedRepetition, saveSpacedRepetition, updateSpacedRepetition, getSkillsDueForReview, getSessionTimeFormatted, initDailyStats, startBannerTimer, stopBannerTimer, bannerRecordAnswer, updateBannerDisplay, getStatsHistory, renderStatsHistory, toggleCelebrations, startQuestionTimer, clearQuestionTimer, dismissNudgePopup, showStudentLandingModal, startFromLanding, continueNextRound, checkRoundEnd, checkTimerProgress, openMyStats, closeMyStats, setupTabDetection, removeTabDetection, showIdleModal, dismissIdleModal } from './modules/gamification.js';

// Layer 2: Core Systems
import { initializeSkillProgress, saveSkillProgress, updateSkillProgress, getMasteryLevel, updateProgressDisplay, trackPerformance, adjustDifficulty, getAdaptiveRange, openProgressDashboard, closeProgressDashboard, renderProgressDashboard, clearAllProgress, showNotification } from './modules/progress.js';
import { showToast, createBackgroundShapes, loadState, saveState, saveSettings, loadSettings, updateUI, toggleTheme, confetti, confettiSmall, flashXpBurst, flashScorePop, flashStreakPop, shakeQuestionCard } from './modules/ui-core.js';
import { toggleUserRole, setUserRole, loadUserRole, updateUIForRole } from './modules/user-role.js';
import { showView, goHome, exitGame, saveIncompleteSession, restoreSettingsUI } from './modules/navigation.js';
import { toggleSettingsPanel, openSettingsPanel, closeSettingsPanel, setTTS, saveSettingsToStorage, loadSettingsFromStorage } from './modules/settings-panel.js';
import { setHelpAfterWrong, helpMode } from './modules/support-ladder.js';
import { loadFavorites, saveFavorites, addFavorite, removeFavorite, toggleFavorite, isFavorite, clearFavorites, renderFavorites, updateFavoriteCards } from './modules/favorites.js';
import { updateNumberSectionVisibility, initDivisorGrid, toggleDivisor, toggleAllDivisors, showDivisibilityRulesChart, updateTimerForRange, renderNumbers, toggleNumber, updateNumberButtonStates, toggleAllNumbers, updateCompactNumberVisibility } from './modules/number-selection.js';
import { updateCategoryOptions, updateBreadcrumb, updateSkillOptions, initInlineDropdowns, updateCategoryOptionsInline, updateSkillOptionsInline, updateSkillListInline, addSkillFromList, addSkillFromDropdown } from './modules/category-dropdowns.js';
import { buildSkillIndex, getSkillIndex, handleSkillSearch, selectSkillFromSearch, showSearchResults, hideSearchResults, clearSkillSearch } from './modules/skill-search.js';

// Layer 3: Skill Management
import { UnifiedSkills, addToSkillQueue, removeFromSkillQueue, clearSkillQueue, toggleSkillQueueExpanded, updateSkillQueueUI, syncSkillsToAllSystems, handleSearchBlur, checkLinksInput, showQueueFeedback, playSelectedSkills, printSelectedSkills, printFromQueue } from './modules/unified-skills.js';
import { generateSkillCode, applySkillCode, copySkillCode, updateSkillCodeDisplay, updateSkillWeight, renderWeightedSkillsList, removeFromQueue, generateMixedLink, copyMixedLink, getSkillCode, getSkillFromCode, generateSettingsCode, updateSettingsCode, applySettingsCode, applyMixedCode, applyCompactMixedCode, updateModeCardsState, resetMixedMode, showCodeError, generateEnhancedSkillCode, parseEnhancedSkillCode, generateShareableLink, copyShareableLink, updateShareSettings, generateQuickStartLink, setShareLinkType, parseSkillCodeParts, buildMixedCode, parseMixedGoals, isSkillCodeWithOptions } from './modules/skill-codes.js';
import { addQuickSkill, updateQuickSkillCards, loadQuickSkills, saveQuickSkills, updateStudentSkillsDisplay, renderQuickSkillsGrid, toggleQuickSkillsEditMode, removeQuickSkill, removeStudentQuickSkill, addToQuickSkills, resetQuickSkillsToDefault, handleQuickSkillSearch, showQuickSkillSearchResults, toggleStudentAddSkill, setQuickSkillsFromCode, clearAllSelectedSkills, updateClearButtonVisibility, toggleQuickStartLock, isQuickStartLocked, setQuickStartLocked, addAllFacts } from './modules/quick-skills.js';
import { initGradeChips, renderGradeChips, toggleGradeChip, getActiveGradeChips, clearActiveGradeChips } from './modules/grade-chips.js';
import { initAdaptiveSession, getAdaptiveLevel, recordAdaptiveAnswer, applyAdaptiveLevelToQuestion, applyAdaptiveSettingsForNextQuestion, toggleAdaptiveMode, resetAdaptiveLevels, getAdaptiveSnapshot, renderAdaptiveLevelChip, setAdaptiveModeEnabled, refreshAdaptiveUI } from './modules/adaptive-engine.js';
import { selectMode, startMode } from "./modules/mode-selection.js";

// Variant cycler (LRU rotation + adaptive bias) — must load BEFORE generate-question.js
// so window.pickVariant is available when gen-*.js modules first execute.
import { pickVariant, recordVariantWrong, recordVariantRight } from './modules/variant-cycler.js';

// Layer 4: Game Logic
import { startGame, startTimer, updateTimerDisplay, pauseGameTimer, resumeGameTimer, nextQuestion, transitionToNextQuestion, getSkillLabelForQuestion, shouldShowNextButton, showNextButton, hideNextButton, promptFullscreen, acceptFullscreen, declineFullscreen, toggleFullscreen, setupFullscreenDetection, removeFullscreenDetection, skipCurrentQuestion, recordQuestionStatus, renderQuestionDots, recomputeScoreFromHistory, goToQuestionIndex, resumeLiveQuestion } from './modules/game-control.js';
import { generateQuestion, generateQuestionFor } from './modules/generate-question.js';
import { skoPlayOpen, skoMoreOpen, skoNlineOpen, mqRows, skoToggle, skoEdit, skoReset, openSkillOptionsPanel, closeSkillOptionsPanel } from './modules/skill-options-ui.js';
import { getSetOptions, setSetOptions, clearSetOptions, describeSetOptions, snapshotSetOptions, restoreSetOptions } from './modules/skill-option-store.js';
import { encodeOptionPayload, decodeOptionPayload, optionSuffix } from './modules/skill-option-codec.js';
import { optionsFor, offeredOptionsFor, describeOptions, packOptions, normalizeOptions } from './modules/skill-options.js';
import { renderQuestion, renderInteractiveOrdering, selectOrderNumber, removeOrderNumber, updateOrderingUI, setupOrderingDragHandlers, reorderSelectedNumber, checkOrderInputsFilled, checkOrderingAnswer, unifiedOrderTileClick, unifiedOrderInputChange, unifiedOrderBoxClear, setupUnifiedOrderingHandlers, renderInteractiveExpanded, checkExpandedInputsFilled, checkExpandedAnswer, liveValidateExpanded, checkAreaModelAnswer, checkNumberFamilyAnswer, checkNumberFamily, selectNumberLineTick, checkNumberLinePlacement, selectOddEvenNumber, checkOddEvenSelection, wireBoxValidation } from './modules/question-render.js';
import { updateSkipButton, isSkipAvailable, skipAfterFor, calcAllowedFor } from './modules/skip-rule.js';
import { checkAnswer, submitAnswer, autoCheckOnInput, checkDualAnswer, checkDualFractionAnswer, checkFractionInputAnswer, checkShadePartsAnswer, checkWordProblemAnswer, trackSkillAnswer, skipCurrentItem, resetAttemptTracking, recordWrongAttempt, markWrongChoice, ensureSkipButton, showSkipButtonIfNeeded, appendAttemptHistory, isRetryWithSkipMode, submitFactorPairs, submitInlineBlanks, submitTchartCells, submitMultChartCells, applyReviewOutcome, isReviewing, _celebrateCorrectAnswer, widgetLadderWrong } from './modules/answer-check.js';
import { showSolutionPopup, closeSolutionPopup, generateSolutionSteps } from './modules/solution-display.js';
import { handleTchartDrop, removeFromTchart, hideFactorInBank, returnFactorToBank, validateTchartRow, checkTchartComplete, handleTchartCompletion, showTchartFeedback, resetTchart } from './modules/tchart-factor.js';
import { showDivisibilityHelp, toggleDivSortNumber, dropDivSortNumber, moveNumberToBox, checkDivisibilitySortComplete, setupWorksheetDivisibilitySort, wsToggleDivSortNumber, wsMoveNumberToBox, wsCheckDivisibilitySortComplete } from './modules/divisibility-sort.js';
import { showHint, speakHint, closeHintPopup, speakQuestion, speakAnswerOption, stopSpeaking, showWordProblemHint, showSolution, resizeInput, showGeometryHint } from './modules/hints-speech.js';
import { updateBossVisuals, startBossMonster, startRaceCPU, updateRaceVisuals, getPlayerRaceSpeed } from './modules/boss-race.js';

// Layer 5: Composite Features
// The online worksheet mode (worksheet.js) loads on demand too - see WORKSHEET_NAMES below.
import { showModal, getGameDescriptionText, showEndGameModal, updateGoalProgress, checkProblemGoals, endGame, saveWorksheetToHistory, saveToSessionHistory } from './modules/game-flow.js';
import { markTodayAsPlayed, updateStreak, renderStreakCalendar, renderBadges, renderDashboard, filterHistory, getFilteredHistory, renderSessionHistory } from './modules/dashboard.js';
import { openMixedSettings, buildMixedSkillsUI, toggleMixedDomain, toggleDomainCheckbox, updateDomainCheckbox, updateCategoryCheckbox, updateSkillSelection, toggleMixedCategory, toggleCategoryCheckbox, selectAllMixedSkills, deselectAllMixedSkills, setTimeChoice, setModeChoice, toggleTotalProblems, toggleCorrectGoal, getSelectedMixedSkills, skillsToBitfield, bitfieldToSkills, updateMixedCode, copyMixedCode, applyMixedSettings as applyMixedSettingsModal, showMixedError, showMixedSuccess } from './modules/mixed-mode-settings.js';
import { saveMixedModeSettings, loadMixedModeSettings, updateMixedPlayCardState, showPlayMixedPopup, closePlayMixedPopup, closePlayMixedPopupOutside, getAllSkillsEasySettings, playWithLastSettings, playWithCode, parseSingleSkillCodeForPlay, parseCompactMixedCodeForPlay, parseMixedCodeForPlay, applyAndPlayMixedSettings, showStudentChoiceModal, selectStudentMode, selectStudentTimer, updateStudentPlayButton, startMixedGameFromModal, closeStudentChoiceOutside, showMixedPlayToast, updateModeCardsForMixed } from './modules/mixed-mode-play.js';
import { initializeMixedSkillsDropdowns, updateMixedSkillsCategorySelect, updateMixedSkillsSkillSelect, addMixedSkillFromSelects, addMixedSkill, removeMixedSkill, renderMixedSkillsList, distributeMixedSkillsEvenly, clearMixedSkillsWeights, clearMixedSkillsList, syncMixedSkillsListToGlobal, handleMixedSkillSearch, addSkillFromMixedSearch, showMixedSkillSearchResults, hideMixedSkillSearchResults, clearMixedSkillSearch, closeMixedSettings } from './modules/mixed-skill-search.js';

// Layer 6 (print, quiz, Google export), the skills organizer, MAP test practice and the teacher site are DEFERRED
// (Chromebook speed lane, 2026-11-02): ./modules/deferred.js imports them, and loadDeferred() below fetches it on demand
// or on idle. A pupil's first question never waits for them.

// Learning Stats
import { openLearningStats, closeLearningStats, filterLearningStats, toggleSessionDetails } from './modules/learning-stats.js';

// Floating Calculator Widget (lazy-built; visible only on q.calculatorAllowed)
import { toggleCalculator, showCalculator, hideCalculator } from './modules/calculator.js';

// Mascot (duo redesign — owl-rocket SVG, home card + correct-answer cheer)
import { getMascotSVG, injectHomeMascot, flashMascotCheer } from './modules/mascot.js';

// Onboarding — first-time visitor coach-mark tour
import { startOnboarding, maybeShowOnboarding, resetOnboarding } from './modules/onboarding.js';

// Worked-example preview ("Show me how" — gradual release I do → we do → you do)
import { shouldShowPreview, markPreviewShown, clearPreviewShown, showWorkedPreview, closeWorkedPreview } from './modules/worked-preview.js';

// Sound effects (procedural Web Audio — no asset files)
import { playSfx, setSfxEnabled, isSfxEnabled } from './modules/sfx.js';

// TTS voice picker — let the user choose among the browser's installed voices,
// persists choice in localStorage so it survives across sessions.
import { getAvailableVoices, getSelectedVoiceURI, setSelectedVoiceURI, applyVoice, populateVoicePicker, testSelectedVoice, openVoicePopover, closeVoicePopover } from './modules/voice-picker.js';

// Word-problem icons (line-art SVGs replacing the old monochrome BW_ICONS glyphs)
import { getWordProblemIcon } from './modules/word-problem-icons.js';

// The word-work cell on screen: tap a sign, type in the column boxes, tap a unit word (2026-09-25).
import './modules/word-work-screen.js';
// The next answer box pulses yellow on every pupil screen (owner, 2026-10-04).
import { installActiveBox } from './modules/active-box.js';
import { installTouchTap } from './modules/touch-tap.js';
import { installPlayCompact, togglePlayMenu } from './modules/play-compact.js';

// Layer 7: Init
import { init, checkURLParameters, setupModalListeners, bootstrap } from './modules/init.js';

// ==========================================
// Inline UI helpers
// ==========================================
// Settings-panel "Reset Adaptive Levels" button: confirm → reset → toast.
function confirmResetAdaptiveLevels() {
    const ok = (typeof window.confirm === 'function')
        ? window.confirm('Reset adaptive levels for ALL skills back to Level 3?\n\nThis affects only Adaptive Mode — your scores and progress are not changed.')
        : true;
    if (!ok) return;
    if (typeof window.resetAdaptiveLevels === 'function') window.resetAdaptiveLevels();
    if (typeof window.showToast === 'function') {
        window.showToast('All adaptive levels reset to default (3 of 5)', 'info');
    }
    // Refresh the on-screen chip immediately if a question is currently rendered.
    if (typeof window.renderAdaptiveLevelChip === 'function') {
        window.renderAdaptiveLevelChip();
    }
}

// The "skills" count badge of the print dialog. Core code (unified-skills, the mixed settings) refreshes it on every
// skill change, so it lives here as well as in print-global-skills.js (same body): calling the deferred stub instead
// pulled the whole teacher / print half into a pupil's game (Chromebook speed lane, 2026-11-02).
function updateSkillsCountBadge() {
    const badge = document.getElementById('skillsCountBadge');
    if (!badge) return;
    const n = (window.globalSkillsList || []).length;
    if (n > 0) { badge.textContent = n; badge.style.display = 'flex'; } else badge.style.display = 'none';
}

// ==========================================
// Attach ALL functions to window for inline handlers
// ==========================================
Object.assign(window, {
    togglePlayMenu, updateSkillsCountBadge,
    // State & Data (needed by some inline handlers and template code)
    state, DOMAINS, SKILLS, SKILL_CODES, CODE_TO_SKILL, DEFAULT_TABLES,
    getDomainByCategory, getCategoryInfo, SKILL_TIME_CATEGORY,
    GRADE_COLORS, SKILL_GRADES, getSkillGrade, gradeCircleHTML, gradeCircleText, sortByGrade,
    SKILL_PRINT_SIZE, PRINT_SIZE_COLUMNS, getSkillPrintSize,
    SKILL_FULL_LABELS, getMixedSkillCount, isMixedMetaSkill, getMixedPoolSkills,

    // Utils
    randInt, shuffle, pick, buildNumericOptions, simplifyFraction, normalizeText,
    fracText, fractionToPercent,

    // Storage
    setCookie, getCookie, loadPersistentData, savePersistentData,

    // SVG Helpers
    createAngleSVG, createRectangleSVG, createSquareSVG, createTriangleSVG,
    createShapeSVG, create3DBoxSVG, createLShapeSVG, createTShapeSVG,
    createWordProblemShapeSVG, createLabeledRectSVG,
    fracHTML, fracCircleSVG, fracBarHTML, fracWithVisual, fracEquationHTML, fracCompareHTML,
    linkVocabInText,
    createAnalogClockSVG, createDigitalClockHTML, addTime, subtractTime, getElapsedTime,
    formatTime, formatTimeWithAMPM, timeToWords, numberToWords, generateTimeDistractors,
    createMagnifiableClock, createClockChoiceWithMagnify, selectClockOption,
    magnifyClock, closeMagnifiedClock, handleMagnifyEscape,
    createBase10Blocks, createCountingDots, createDotArray, createNumberLine, createHopNumberLine,
    getFactorPairs, createFactorLinksSVG,

    // Gamification
    awardXP, calculateLevel, checkStreakBonus, initSurpriseSchedule, checkSurpriseBonus,
    startSessionTimer, stopSessionTimer, startSmartReview, updateReviewCount,
    initGamification, showCelebrationModal, updateTooltips, checkBadgeTriggers,
    earnBadge, getAllBadges, initSpacedRepetition, saveSpacedRepetition,
    updateSpacedRepetition, getSkillsDueForReview, getSessionTimeFormatted,
    initDailyStats, startBannerTimer, stopBannerTimer, bannerRecordAnswer, updateBannerDisplay,
    getStatsHistory, renderStatsHistory, toggleCelebrations,
    startQuestionTimer, clearQuestionTimer, dismissNudgePopup,
    showStudentLandingModal, startFromLanding, continueNextRound, checkRoundEnd, checkTimerProgress,
    openMyStats, closeMyStats, setupTabDetection, removeTabDetection,
    showIdleModal, dismissIdleModal,

    // Learning Stats
    openLearningStats, closeLearningStats, filterLearningStats, toggleSessionDetails,

    // Progress & Adaptive
    initializeSkillProgress, saveSkillProgress, updateSkillProgress, getMasteryLevel,
    updateProgressDisplay, trackPerformance, adjustDifficulty, getAdaptiveRange,
    openProgressDashboard, closeProgressDashboard, renderProgressDashboard,
    clearAllProgress, showNotification,

    // UI Core
    showToast, createBackgroundShapes, loadState, saveState, saveSettings, loadSettings,
    updateUI, toggleTheme, confetti, confettiSmall, flashXpBurst, flashScorePop, flashStreakPop, shakeQuestionCard,

    // User Role
    toggleUserRole, setUserRole, loadUserRole, updateUIForRole,

    // Navigation
    showView, goHome, exitGame, saveIncompleteSession, restoreSettingsUI,

    // Settings Panel
    toggleSettingsPanel, openSettingsPanel, closeSettingsPanel, setTTS, setHelpAfterWrong, helpMode,
    saveSettingsToStorage, loadSettingsFromStorage,

    // Favorites
    loadFavorites, saveFavorites, addFavorite, removeFavorite, toggleFavorite,
    isFavorite, clearFavorites, renderFavorites, updateFavoriteCards,

    // Number Selection
    updateNumberSectionVisibility, initDivisorGrid, toggleDivisor, toggleAllDivisors,
    showDivisibilityRulesChart, updateTimerForRange, renderNumbers, toggleNumber,
    updateNumberButtonStates, toggleAllNumbers, updateCompactNumberVisibility,

    // Category Dropdowns
    updateCategoryOptions, updateBreadcrumb, updateSkillOptions, initInlineDropdowns,
    updateCategoryOptionsInline, updateSkillOptionsInline, updateSkillListInline,
    addSkillFromList, addSkillFromDropdown,

    // Skill Search
    buildSkillIndex, getSkillIndex, handleSkillSearch, selectSkillFromSearch,
    showSearchResults, hideSearchResults, clearSkillSearch,

    // Unified Skills
    UnifiedSkills, addToSkillQueue, removeFromSkillQueue, clearSkillQueue,
    toggleSkillQueueExpanded, updateSkillQueueUI, syncSkillsToAllSystems,
    handleSearchBlur, checkLinksInput, showQueueFeedback,
    playSelectedSkills, printSelectedSkills, printFromQueue,

    // Skill Codes
    generateSkillCode, applySkillCode, copySkillCode, updateSkillCodeDisplay,
    updateSkillWeight, renderWeightedSkillsList, removeFromQueue,
    generateMixedLink, copyMixedLink,
    getSkillCode, getSkillFromCode, generateSettingsCode, updateSettingsCode,
    applySettingsCode, applyMixedCode, applyCompactMixedCode,
    updateModeCardsState, resetMixedMode, showCodeError,
    generateEnhancedSkillCode, parseEnhancedSkillCode, generateShareableLink,
    copyShareableLink, updateShareSettings, generateQuickStartLink, setShareLinkType,

    // Quick Skills
    addQuickSkill, updateQuickSkillCards, loadQuickSkills, saveQuickSkills,
    updateStudentSkillsDisplay, renderQuickSkillsGrid, toggleQuickSkillsEditMode,
    removeQuickSkill, removeStudentQuickSkill, addToQuickSkills,
    resetQuickSkillsToDefault, handleQuickSkillSearch, showQuickSkillSearchResults,
    toggleStudentAddSkill, setQuickSkillsFromCode, clearAllSelectedSkills, updateClearButtonVisibility,
    toggleQuickStartLock, isQuickStartLocked, setQuickStartLocked, addAllFacts,

    // Grade-Level Batch Assign Chips (research Feature 2)
    initGradeChips, renderGradeChips, toggleGradeChip, getActiveGradeChips, clearActiveGradeChips,

    // Whole-Program Adaptive Mode (per-skill ladder, research Feature 1)
    initAdaptiveSession, getAdaptiveLevel, recordAdaptiveAnswer,
    applyAdaptiveLevelToQuestion, applyAdaptiveSettingsForNextQuestion,
    toggleAdaptiveMode, resetAdaptiveLevels, getAdaptiveSnapshot,
    renderAdaptiveLevelChip,
    setAdaptiveModeEnabled, refreshAdaptiveUI,
    confirmResetAdaptiveLevels,

    // Mode Selection
    selectMode, startMode,

    // Game Control
    startGame, startTimer, updateTimerDisplay, pauseGameTimer, resumeGameTimer,
    nextQuestion, transitionToNextQuestion, getSkillLabelForQuestion,
    shouldShowNextButton, showNextButton, hideNextButton,
    skipCurrentQuestion, recordQuestionStatus, renderQuestionDots,
    recomputeScoreFromHistory, goToQuestionIndex, resumeLiveQuestion,
    promptFullscreen, acceptFullscreen, declineFullscreen,
    toggleFullscreen, setupFullscreenDetection, removeFullscreenDetection,

    // Variant cycler (LRU + adaptive)
    pickVariant, recordVariantWrong, recordVariantRight,

    // Question Generation & Rendering
    generateQuestion, generateQuestionFor,
    // Per-skill options that travel with a skill set (owner, 2026-09-24)
    skoPlayOpen, skoMoreOpen, skoNlineOpen, mqRows, skoToggle, skoEdit, skoReset, openSkillOptionsPanel, closeSkillOptionsPanel,
    parseSkillCodeParts, buildMixedCode, parseMixedGoals, isSkillCodeWithOptions,
    getSetOptions, setSetOptions, clearSetOptions, describeSetOptions, snapshotSetOptions, restoreSetOptions,
    encodeOptionPayload, decodeOptionPayload, optionSuffix,
    optionsFor, offeredOptionsFor, describeOptions, packOptions, normalizeOptions,
    renderQuestion, renderInteractiveOrdering, selectOrderNumber, removeOrderNumber,
    updateOrderingUI, setupOrderingDragHandlers, reorderSelectedNumber, checkOrderInputsFilled, checkOrderingAnswer,
    unifiedOrderTileClick, unifiedOrderInputChange, unifiedOrderBoxClear, setupUnifiedOrderingHandlers,
    renderInteractiveExpanded, checkExpandedInputsFilled, checkExpandedAnswer, liveValidateExpanded,
    checkAreaModelAnswer, checkNumberFamilyAnswer, checkNumberFamily,
    selectNumberLineTick, checkNumberLinePlacement,
    selectOddEvenNumber, checkOddEvenSelection,
    wireBoxValidation,

    // Answer Checking
    checkAnswer, submitAnswer, autoCheckOnInput, checkDualAnswer, checkDualFractionAnswer, checkFractionInputAnswer, checkShadePartsAnswer, checkWordProblemAnswer, trackSkillAnswer, widgetLadderWrong,
    skipCurrentItem, resetAttemptTracking, recordWrongAttempt, markWrongChoice,
    updateSkipButton, isSkipAvailable, skipAfterFor, calcAllowedFor,
    ensureSkipButton, showSkipButtonIfNeeded, appendAttemptHistory, isRetryWithSkipMode,
    submitFactorPairs, submitInlineBlanks, submitTchartCells, submitMultChartCells,
    applyReviewOutcome, isReviewing, _celebrateCorrectAnswer,

    // Solution Display
    showSolutionPopup, closeSolutionPopup, generateSolutionSteps,

    // T-chart Factor
    handleTchartDrop, removeFromTchart, hideFactorInBank, returnFactorToBank,
    validateTchartRow, checkTchartComplete, handleTchartCompletion,
    showTchartFeedback, resetTchart,

    // Divisibility Sort & Hints
    showDivisibilityHelp, toggleDivSortNumber, dropDivSortNumber,
    moveNumberToBox, checkDivisibilitySortComplete,
    setupWorksheetDivisibilitySort, wsToggleDivSortNumber, wsMoveNumberToBox,
    wsCheckDivisibilitySortComplete, showWordProblemHint,
    showSolution, resizeInput, showGeometryHint,
    showHint, speakHint, closeHintPopup, speakQuestion, speakAnswerOption, stopSpeaking,

    // Boss & Race
    updateBossVisuals, startBossMonster, startRaceCPU, updateRaceVisuals, getPlayerRaceSpeed,

    // Game Flow
    showModal, getGameDescriptionText, showEndGameModal,
    updateGoalProgress, checkProblemGoals, endGame,
    saveWorksheetToHistory, saveToSessionHistory,

    // Dashboard
    markTodayAsPlayed, updateStreak, renderStreakCalendar, renderBadges,
    renderDashboard, filterHistory, getFilteredHistory, renderSessionHistory,

    // Mixed Mode Settings
    openMixedSettings, buildMixedSkillsUI, toggleMixedDomain, toggleDomainCheckbox,
    updateDomainCheckbox, updateCategoryCheckbox, updateSkillSelection,
    toggleMixedCategory, toggleCategoryCheckbox, selectAllMixedSkills,
    deselectAllMixedSkills, setTimeChoice, setModeChoice,
    toggleTotalProblems, toggleCorrectGoal, getSelectedMixedSkills,
    skillsToBitfield, bitfieldToSkills, updateMixedCode, copyMixedCode,
    applyMixedSettings: applyMixedSettingsModal, showMixedError, showMixedSuccess,

    // Mixed Mode Play
    saveMixedModeSettings, loadMixedModeSettings, updateMixedPlayCardState,
    showPlayMixedPopup, closePlayMixedPopup, closePlayMixedPopupOutside,
    getAllSkillsEasySettings, playWithLastSettings, playWithCode,
    parseSingleSkillCodeForPlay, parseCompactMixedCodeForPlay, parseMixedCodeForPlay,
    applyAndPlayMixedSettings, showStudentChoiceModal, selectStudentMode,
    selectStudentTimer, updateStudentPlayButton, startMixedGameFromModal,
    closeStudentChoiceOutside, showMixedPlayToast, updateModeCardsForMixed,

    // Mixed Skill Search
    initializeMixedSkillsDropdowns, updateMixedSkillsCategorySelect,
    updateMixedSkillsSkillSelect, addMixedSkillFromSelects,
    addMixedSkill, removeMixedSkill, renderMixedSkillsList,
    distributeMixedSkillsEvenly, clearMixedSkillsWeights, clearMixedSkillsList,
    syncMixedSkillsListToGlobal, handleMixedSkillSearch, addSkillFromMixedSearch,
    showMixedSkillSearchResults, hideMixedSkillSearchResults, clearMixedSkillSearch,
    closeMixedSettings,

    // Calculator Widget
    toggleCalculator, showCalculator, hideCalculator,

    // Mascot
    getMascotSVG, injectHomeMascot, flashMascotCheer,

    // Onboarding
    startOnboarding, maybeShowOnboarding, resetOnboarding,

    // Worked-example preview ("Show me how")
    shouldShowPreview, markPreviewShown, clearPreviewShown, showWorkedPreview, closeWorkedPreview,

    // Sound effects
    playSfx, setSfxEnabled, isSfxEnabled,

    // TTS voice picker
    getAvailableVoices, getSelectedVoiceURI, setSelectedVoiceURI, applyVoice,
    populateVoicePicker, testSelectedVoice, openVoicePopover, closeVoicePopover,

    // Word-problem icons
    getWordProblemIcon,

    // Init
    init, checkURLParameters,
});

// Global variables used by inline onmousedown/onmouseup handlers
window.searchResultsMouseDown = false;
window.keepSearchOpen = false;
window.mixedSkillSearchMouseDown = false;
window.keepMixedSkillSearchOpen = false;
window.addSkillsSearchMouseDown = false;
window.keepAddSkillsSearchOpen = false;

// Stubs for functions called but never defined in the original codebase
window.updateDailyGoalProgress = function() {};
window.updateMixedCount = function() {};

// Vocab speaker buttons — global delegated handler. Any element with the
// .vmh-speak or .vocab-speak class and a data-speak attribute will, on click,
// speak its text via the Web Speech API. Used by vocab-match cards and the
// MC/true-false vocab visuals so ELL students (and any students) can hear
// the word or definition read aloud.
// Defensive label extractor — mirrors _extractOptionLabel in hints-speech.js
// so window.speak never reads "[object Object]" if an option object is passed
// in instead of a string. Keep these two implementations in sync.
function _speakExtractLabel(opt) {
    if (opt == null) return '';
    if (typeof opt === 'string' || typeof opt === 'number' || typeof opt === 'boolean') {
        return String(opt);
    }
    if (typeof opt !== 'object') return String(opt);
    const candidates = [opt.label, opt.text, opt.value, opt.l, opt.htmlLabel, opt.name, opt.term];
    for (const c of candidates) {
        if (c != null && c !== '') {
            return String(c).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        }
    }
    try { return JSON.stringify(opt); } catch (_) { return ''; }
}

window.speak = function(text) {
    if (text == null || typeof window.speechSynthesis === 'undefined') return;
    // Coerce object inputs to a readable label so we never speak "[object Object]".
    if (typeof text === 'object') text = _speakExtractLabel(text);
    // Strip any HTML tags (for callers that pass raw HTML markup).
    const spoken = String(text).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!spoken) return;
    try {
        // Cancel anything currently speaking so a fresh tap reads cleanly.
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(spoken);
        u.rate = 0.9;
        u.pitch = 1.0;
        if (typeof window.applyVoice === 'function') window.applyVoice(u);
        window.speechSynthesis.speak(u);
    } catch (err) {
        // Speech synthesis is best-effort — never let a TTS failure block the UI.
        console.warn('window.speak failed:', err);
    }
};

document.addEventListener('click', function(e) {
    const btn = e.target && e.target.closest && e.target.closest('.vmh-speak, .vocab-speak');
    if (!btn) return;
    e.stopPropagation();
    e.preventDefault();
    const text = btn.dataset && btn.dataset.speak ? btn.dataset.speak : btn.textContent || '';
    if (text) window.speak(text);
});

// ==========================================
// The deferred half (Chromebook speed lane, 2026-11-02)
// ==========================================
// Every name below lives in ./modules/deferred.js. Until that file has loaded, window.<name> is a thin async stub:
// calling it loads the deferred half, then calls the real function (so the 200+ inline onclick handlers keep
// working). Once loaded, each stub is replaced by the real function, so later calls are synchronous again.
const DEFERRED_NAMES = [
    'openPrintSettings', 'closePrintSettings', 'openSimplePrintDialog', 'closeSimplePrintModal',
    'generateSimplePrint', 'generateWorksheetFromSkills', 'generateWorksheetFromSections',
    'buildQueuedSkillsWeightedSection', 'removeQueuedSkillWeight', 'updateQueuedSkillsTotal',
    'distributeQueuedSkillsEvenly', 'clearQueuedSkillsWeights', 'getQueuedSkillsWeights', 'applyQueuedSkillsToPrint',
    'renderPrintSections', 'addPrintSection', 'removePrintSection', 'updatePrintSectionLabel',
    'removePrintSectionSkill', 'togglePrintSkillOptions', 'setPrintSkillOption', 'togglePrintSkillOptionSet',
    'setPrintSkillOptionSetAll', 'resetPrintSkillOptions', 'ownPrintSkillOptions', 'handlePrintSkillDragStart',
    'handlePrintSkillDragEnd', 'handlePrintSkillDragOver', 'handlePrintSkillDragLeave', 'handlePrintSkillDrop',
    'setPrintCountMode', 'autoGroupPrintSections', 'handlePrintDialogSearch', 'togglePrintDialogSkill',
    'hidePrintDialogSearch', 'calculateProblemsForPages', 'savePrintSections', 'loadSavedPrintSections',
    'cancelPrintGeneration', 'printMapSkillsAsWorksheet', 'openAddSkillsModal', 'closeAddSkillsModal',
    'updateSkillsCountBadge', 'initializeAddSkillsDropdowns', 'updateAddSkillsCategorySelect',
    'updateAddSkillsSkillSelect', 'addSkillFromModalSelects', 'addGlobalSkill', 'removeGlobalSkill',
    'renderGlobalSkillsList', 'distributeGlobalSkillsEvenly', 'clearGlobalSkillsWeights', 'clearGlobalSkillsList',
    'syncGlobalSkillsToWeightedItems', 'syncWeightedItemsToGlobalSkills', 'syncMixedSkillsToGlobalSkills',
    'handleAddSkillsSearch', 'addSkillFromAddSkillsSearch', 'showAddSkillsSearchResults',
    'hideAddSkillsSearchResults', 'clearAddSkillsSearch', 'playWithGlobalSkills', 'openPrintWithGlobalSkills',
    'quizFromGlobalSkills', 'togglePrintSource', 'buildPrintSkillsUI', 'togglePrintCategory',
    'togglePrintCategoryCheckbox', 'updatePrintCategoryCheckbox', 'selectAllPrintSkills', 'deselectAllPrintSkills',
    'updateWeightedSectionFromSelections', 'getSelectedPrintSkillsWithInfo', 'buildWeightedFromMixedSettings',
    'initializeWeightedSectionOnOpen', 'generateWeightedSkillsFromDomains', 'getWeightedCategoryLabel',
    'initializeWeightedDropdowns', 'updateWeightedCategorySelect', 'updateWeightedSkillSelect',
    'addWeightedItemFromSelects', 'addWeightedItem', 'removeWeightedItem', 'renderWeightedItemsList',
    'distributeWeightedEvenly', 'clearAllWeights', 'clearWeightedList', 'getWeightedItemsForGeneration',
    'handlePrintSkillSearch', 'addSkillFromPrintSearch', 'showPrintSearchResults', 'hidePrintSearchResults',
    'clearPrintSkillSearch', 'populateWeightedFromQueue', 'toggleWeightedDistribution', 'addWeightedSkill',
    'updateWeightedSkillSelection', 'updateWeightedRangeSelection', 'updateWeightedSkillOptions',
    'removeWeightedSkill', 'updateWeightedTotal', 'getWeightedSkillsForGeneration', 'getSelectedPrintSkills',
    'generatePrintProblem', 'formatProblemForPrint', 'generateWorksheetHTML', 'generateWorkedSolution',
    'formatWorkedSolutionForPrint', 'toggleAnswerKeyType', 'closePrintPreview', 'printWorksheet', 'downloadPDF',
    'downloadWorksheet', 'buildSheet', 'sheetDocument', 'exportPrintToGoogleForms', 'exportQuizToGoogleForms',
    'openGoogleExportModal', 'closeGoogleExportModal', 'startGoogleExport', 'initGoogleAuth', 'isGoogleAuthenticated',
    'revokeGoogleToken', 'listClassroomCourses', 'initQuizDB', 'saveTest', 'loadTest', 'listTests', 'deleteTest',
    'saveResult', 'getResultsForTest', 'exportTestJSON', 'importTestJSON', 'exportResultsCSV', 'compressTestForURL',
    'decompressTestFromURL', 'migrateTestToSections', 'getAllQuestionsFlat', 'getGlobalOffset',
    'getTotalQuestionCount', 'openQuizBuilder', 'openMyQuizzes', 'confirmDeleteQuiz', 'handleQuizSkillSearch',
    'selectQuizSkill', 'addSelectedQuestions', 'addQuizQuestion', 'addMultipleQuestions', 'regenerateQuizQuestion',
    'duplicateQuizQuestion', 'removeQuizQuestion', 'updateQuizQuestionPoints', 'updateQuizName', 'updateQuizSetting',
    'openQuizSettings', 'closeQuizSettings', 'saveQuiz', 'generateQuizLink', 'printQuiz', 'exportQuiz',
    'importQuizFile', 'qbFilterDomain', 'qbFilterCategory', 'qbFilterGrade', 'qbSearchInput', 'qbPreviewHover',
    'qbPreviewClick', 'qbRefreshPreview', 'qbAddFromPreview', 'addSection', 'removeSection', 'reorderSection',
    'setActiveSection', 'updateSectionLayout', 'updateSectionLabel', 'updateSectionInstructions',
    'toggleSectionCollapse', 'shuffleSectionQuestions', 'moveQuestionToSection', 'openQuizPreview',
    'closeQuizPreview', 'switchPreviewTab', 'handleQbQuestionDragStart', 'handleQbQuestionDragEnd',
    'handleQbSectionDragOver', 'handleQbSectionDragLeave', 'handleQbSectionDrop', 'openBuilderResults',
    'openBuilderMonitor', 'quizQuestionData', 'handleQuizURL', 'startQuizTest', 'submitQuizMC',
    'submitQuizTextAnswer', 'navigateQuizQuestion', 'jumpToQuizQuestion', 'flagQuizQuestion', 'showQuizReview',
    'jumpFromReview', 'backFromReview', 'submitQuiz', 'downloadQuizStudentResults', 'showQuizResults',
    'showStudentQuizDetail', 'exportQuizCSV', 'importStudentResultsFile', 'printQuizTest', 'closeQuizResults',
    'copyQuizLinkFromResults', 'tvqMenu', 'openQuizMonitor', 'stopMonitoring', 'toggleMonitorPause',
    'toggleMonitorOption', 'inviteStudents', 'finishMonitoring', 'closeQuizMonitor', 'openSkillsOrganizer',
    'soInitialize', 'soApplyFilters', 'soFilterDomain', 'soFilterCategory', 'soFilterGrade', 'soSearchInput',
    'soToggleSkill', 'soRenderQueuePanel', 'soRemoveFromQueue', 'soClearQueue', 'soPreviewHover', 'soPreviewLeave',
    'soPreviewClick', 'soGeneratePreview', 'soRefreshPreview', 'soPlay', 'soPrint', 'soShare', 'soShowCode',
    'soSelectAllVisible', 'soDeselectAllVisible', 'soUpdateCategoryDropdown', 'soQuiz', 'startMapSession',
    'nextMapItem', 'recordMapAnswer', 'finalizeMapSession', 'releaseMapSessionScaffold', 'skipMapItem',
    'mapJumpToItem', 'mapResumeCurrent', 'mapNavBack', 'mapNavForward', 'openMapTest', 'initMapSelector',
    'startMapFromUI', 'selectMapTier', 'toggleMapBand', 'toggleMapDomain', 'selectAllMapBands', 'clearMapBands',
    'setMapItemCount', 'setMapMode', 'printMapFromSelector', 'generateMapShareLink', 'copyMapShareLink',
    'parseMapShareLink', 'loadMapShareLink', 'renderMapResults', 'printMapSession', 'restartMapSession',
    'updateMapGradeContext', 'tvGo', 'tvOpenSheet',
];
// The deferred half's stylesheets: <link data-mq-href> in index.html, in their cascade place, given their href now.
function loadDeferredCss() {
    const links = [...document.querySelectorAll('link[rel="stylesheet"][data-mq-href]')];
    return Promise.all(links.map((l) => new Promise((resolve) => {
        if (l.getAttribute('href')) { resolve(); return; }
        l.addEventListener('load', resolve, { once: true });
        l.addEventListener('error', resolve, { once: true });   // a missing sheet never blocks the teacher site
        l.setAttribute('href', l.dataset.mqHref);
    })));
}
// One lazy part: a thin async stub on window for each name until importer() resolves to { name: fn }, then the real
// functions replace the stubs. A failed load (a Wi-Fi drop) is retried by the next call.
// Chrome remembers a failed import() of a URL for the life of the page, so a retry imports a fresh URL (?retry=n; the
// module's own imports keep their stamped URLs). If that fails too, the teacher is told to reload (checker r1 D1).
let lazyNotice = 0;
function lazyFailed(label) {
    if (Date.now() - lazyNotice < 8000) return;
    lazyNotice = Date.now();
    const msg = `The ${label} tools did not load (the connection dropped). Reload the page to try again.`;
    try { if (typeof window.showToast === 'function') window.showToast(msg, 'error'); else console.warn(msg); } catch (e) { /* no toast */ }
}
function makeLazy(label, importer, names) {
    let promise = null;
    let tries = 0;
    const load = () => {
        if (!promise) {
            const n = tries++;
            promise = importer(n).then((api) => { Object.assign(window, api); return api; }).catch((err) => {
                promise = null;
                console.warn(`[MathQuest] the ${label} part did not load:`, err);
                if (n >= 1) lazyFailed(label);
                throw err;
            });
        }
        return promise;
    };
    for (const name of names) {
        if (typeof window[name] === 'function') continue;   // (an element id like soSearchInput is replaced, as before)
        const stub = function (...args) {
            (window.__mqStubCalls = window.__mqStubCalls || []).push(name);   // which stub pulled a part in (perf gate)
            return load().then((api) => {
                const fn = (api && typeof api[name] === 'function') ? api[name] : window[name];
                if (typeof fn !== 'function' || fn === stub) throw new Error(name + ' is not in the ' + label + ' part');
                return fn.apply(this, args);
            });
        };
        stub.__mqStub = true;
        window[name] = stub;
    }
    return load;
}
// The shared arrays the print modules used to create at import: create them here so a late import never resets them.
if (!Array.isArray(window.globalSkillsList)) window.globalSkillsList = [];
if (!Array.isArray(window.weightedItems)) window.weightedItems = [];
const loadDeferred = makeLazy('teacher / print', (n) => Promise.all([
    n ? import(`./modules/deferred.js?retry=${n}`) : import('./modules/deferred.js'), loadDeferredCss(),
]).then(([m]) => {
    window.__mqDeferredLoaded = true;
    try { document.dispatchEvent(new CustomEvent('mq:deferred-ready')); } catch (e) { /* old browser */ }
    return m.API;
}), DEFERRED_NAMES);
window.__mqLoadDeferred = loadDeferred;
window.__mqLazyNames = { deferred: DEFERRED_NAMES };   // ws-chromebook-perf: every one must be real once loaded

// The online worksheet mode (165 KB): only a worksheet game (initWorksheet) and the markup it draws call into it.
const WORKSHEET_NAMES = [
    'initWorksheet', 'newWorksheet', 'addMoreProblems', 'finishUnlimitedWorksheet', 'toggleHint', 'closeHint',
    'checkWorksheetAnswerFromColumns', 'checkWorksheetAnswerFromFuncTable', 'renderWorksheetOrdering',
    'renderWorksheetExpanded', 'checkWorksheetOrderingAnswer', 'checkWorksheetExpandedAnswer', 'advanceToNextProblem',
    'checkWorksheetAnswer', 'checkAllWorksheet', 'checkWorksheetDualAnswer', 'checkWorksheetCoordinateAnswer',
    'checkAreaModelInput', 'checkWorksheetNumberFamily', 'checkWorksheetMC', 'showWorksheetScore', 'wsMagnifyCard',
    'wsSpeak', 'wsSkipCard', 'attachWorksheetZoom',
];
const loadWorksheet = makeLazy('worksheet', (n) => (n ? import(`./modules/worksheet.js?retry=${n}`) : import('./modules/worksheet.js'))
    .then((m) => Object.fromEntries(WORKSHEET_NAMES.map((n) => [n, m[n]]))), WORKSHEET_NAMES);
window.__mqLoadWorksheet = loadWorksheet;
window.__mqLazyNames.worksheet = WORKSHEET_NAMES;

// Who needs the deferred half BEFORE init runs (so they see exactly what they saw before the split):
//   a MAP or quiz link (?map= / ?quiz=), a Send link's &set=, the teacher board (?board=1 on a teacher device),
//   a teacher-site hash route, or a device that opens in teacher view ("Open the site in: Last view used").
function deferredNeededAtBoot() {
    try {
        const p = new URLSearchParams(window.location.search);
        if (p.get('map') || p.get('quiz') || p.get('set')) return true;
        const saved = localStorage.getItem('mathquest_user_role') || 'student';
        if (p.get('board') === '1' && saved === 'teacher') return true;
        if (['c', 'code', 'qs'].some((k) => p.get(k))) return false;   // a pupil link always opens in student view
        if (/^#(wrm|todo|map|tv)/.test(window.location.hash || '') && saved === 'teacher') return true;
        return localStorage.getItem('mathquest_start_role') === 'last' && saved === 'teacher';
    } catch (e) { return false; }
}
// A pupil link (?c= / ?code= / ?qs=) never prefetches: the pupil's Chromebook spends its CPU and Wi-Fi on the game.
function isPupilLink() {
    try { const p = new URLSearchParams(window.location.search); return ['c', 'code', 'qs'].some((k) => p.get(k)); } catch (e) { return false; }
}
// A link that opens in worksheet mode (|Gw, or |G? = the pupil chooses) fetches the worksheet part straight away.
try {
    const code = new URLSearchParams(window.location.search).get('c') || new URLSearchParams(window.location.search).get('code') || '';
    if (/\|(?:[^|]*-)?G[w?](?:-|$)/i.test(code)) loadWorksheet().catch(() => {});
} catch (e) { /* no location */ }
if (deferredNeededAtBoot()) {
    try { await loadDeferred(); } catch (e) { /* stubs retry on first use */ }
}

// Bootstrap the application
bootstrap();
installActiveBox();
installTouchTap();
installPlayCompact();
// Chromebook load fix (2026-11-02): tell the inline loading indicator the app is ready, then cache the stamped
// modules on the device (sw.js) so the next visit does not download them again over school Wi-Fi.
window.__mqBooted = true;
// Teachers (who boot in student view by default) get the deferred half on idle, so it is there before they reach for it;
// switching to teacher view loads it at once.
// The worksheet part is small: every visit fetches it once the page is idle, so choosing worksheet mode never waits.
if ('requestIdleCallback' in window) window.requestIdleCallback(() => { loadWorksheet().catch(() => {}); }, { timeout: 5000 });
else setTimeout(() => { loadWorksheet().catch(() => {}); }, 2500);
if (!window.__mqDeferredLoaded) {
    const prefetch = () => { loadDeferred().catch(() => {}); };
    if (!isPupilLink()) {
        if ('requestIdleCallback' in window) window.requestIdleCallback(prefetch, { timeout: 4000 });
        else setTimeout(prefetch, 1500);
    }
    const roleWatch = new MutationObserver(() => {
        if (!document.body.classList.contains('teacher-mode')) return;
        roleWatch.disconnect();
        // still downloading (a slow connection): say so, rather than a half-built screen (checker r1 D4)
        if (!window.__mqDeferredLoaded) { try { window.showToast('Loading the teacher tools…', 'info'); } catch (e) { /* no toast */ } }
        prefetch();
    });
    if (document.body.classList.contains('teacher-mode')) prefetch();
    else roleWatch.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    const registerWorker = () => navigator.serviceWorker.register('sw.js').catch((err) => console.warn('service worker not registered:', err));
    if (document.readyState === 'complete') registerWorker();
    else window.addEventListener('load', registerWorker);
}
