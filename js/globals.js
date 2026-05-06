// Barrel module: imports all modules and attaches functions to window for inline handlers

// Layer 0: Foundation
import { state } from './modules/state.js';
import { randInt, shuffle, pick, buildNumericOptions, simplifyFraction, normalizeText, fracText, fractionToPercent } from './modules/utils.js';
import { DOMAINS, SKILLS, SKILL_CODES, CODE_TO_SKILL, DEFAULT_TABLES, getDomainByCategory, getCategoryInfo, SKILL_TIME_CATEGORY, GRADE_COLORS, SKILL_GRADES, getSkillGrade, gradeCircleHTML, gradeCircleText, sortByGrade, SKILL_PRINT_SIZE, PRINT_SIZE_COLUMNS, getSkillPrintSize, SKILL_FULL_LABELS, getMixedSkillCount, isMixedMetaSkill } from './modules/data.js';

// Layer 1: Storage & SVG helpers
import { setCookie, getCookie, loadPersistentData, savePersistentData } from './modules/storage.js';
import { createAngleSVG, createRectangleSVG, createSquareSVG, createTriangleSVG, createShapeSVG, create3DBoxSVG, createLShapeSVG, createTShapeSVG, createWordProblemShapeSVG, createLabeledRectSVG } from './modules/svg-geometry.js';
import { fracHTML, fracCircleSVG, fracBarHTML, fracWithVisual, fracEquationHTML, fracCompareHTML } from './modules/svg-fractions.js';
import { createAnalogClockSVG, createDigitalClockHTML, addTime, subtractTime, getElapsedTime, formatTime, formatTimeWithAMPM, timeToWords, numberToWords, generateTimeDistractors, createMagnifiableClock, createClockChoiceWithMagnify, selectClockOption, magnifyClock, closeMagnifiedClock, handleMagnifyEscape } from './modules/svg-clock.js';
import { createBase10Blocks, createCountingDots, createDotArray, createNumberLine, createHopNumberLine } from './modules/svg-base10.js';
import { getFactorPairs, createFactorLinksSVG } from './modules/svg-factors.js';

// Layer 2: Gamification
import { awardXP, calculateLevel, checkStreakBonus, initSurpriseSchedule, checkSurpriseBonus, startSessionTimer, stopSessionTimer, startSmartReview, updateReviewCount, initGamification, showCelebrationModal, updateTooltips, checkBadgeTriggers, earnBadge, getAllBadges, initSpacedRepetition, saveSpacedRepetition, updateSpacedRepetition, getSkillsDueForReview, getSessionTimeFormatted, initDailyStats, startBannerTimer, stopBannerTimer, bannerRecordAnswer, updateBannerDisplay, getStatsHistory, renderStatsHistory, toggleCelebrations, startQuestionTimer, clearQuestionTimer, dismissNudgePopup, showStudentLandingModal, startFromLanding, continueNextRound, checkRoundEnd, checkTimerProgress, openMyStats, closeMyStats, setupTabDetection, removeTabDetection, showIdleModal, dismissIdleModal } from './modules/gamification.js';

// Layer 2: Core Systems
import { initializeSkillProgress, saveSkillProgress, updateSkillProgress, getMasteryLevel, updateProgressDisplay, trackPerformance, adjustDifficulty, getAdaptiveRange, openProgressDashboard, closeProgressDashboard, renderProgressDashboard, clearAllProgress, showNotification } from './modules/progress.js';
import { showToast, createBackgroundShapes, loadState, saveState, saveSettings, loadSettings, updateUI, toggleTheme, confetti } from './modules/ui-core.js';
import { toggleUserRole, setUserRole, loadUserRole, updateUIForRole } from './modules/user-role.js';
import { showView, goHome, exitGame, saveIncompleteSession, restoreSettingsUI } from './modules/navigation.js';
import { toggleSettingsPanel, openSettingsPanel, closeSettingsPanel, setTTS, saveSettingsToStorage, loadSettingsFromStorage } from './modules/settings-panel.js';
import { loadFavorites, saveFavorites, addFavorite, removeFavorite, toggleFavorite, isFavorite, clearFavorites, renderFavorites, updateFavoriteCards } from './modules/favorites.js';
import { updateNumberSectionVisibility, initDivisorGrid, toggleDivisor, toggleAllDivisors, showDivisibilityRulesChart, updateTimerForRange, renderNumbers, toggleNumber, updateNumberButtonStates, toggleAllNumbers, updateCompactNumberVisibility } from './modules/number-selection.js';
import { updateCategoryOptions, updateBreadcrumb, updateSkillOptions, initInlineDropdowns, updateCategoryOptionsInline, updateSkillOptionsInline, updateSkillListInline, addSkillFromList, addSkillFromDropdown } from './modules/category-dropdowns.js';
import { buildSkillIndex, getSkillIndex, handleSkillSearch, selectSkillFromSearch, showSearchResults, hideSearchResults, clearSkillSearch } from './modules/skill-search.js';

// Layer 3: Skill Management
import { UnifiedSkills, addToSkillQueue, removeFromSkillQueue, clearSkillQueue, toggleSkillQueueExpanded, updateSkillQueueUI, syncSkillsToAllSystems, handleSearchBlur, checkLinksInput, showQueueFeedback, playSelectedSkills, printSelectedSkills, printFromQueue } from './modules/unified-skills.js';
import { generateSkillCode, applySkillCode, copySkillCode, updateSkillCodeDisplay, updateSkillWeight, renderWeightedSkillsList, removeFromQueue, generateMixedLink, copyMixedLink, getSkillCode, getSkillFromCode, generateSettingsCode, updateSettingsCode, applySettingsCode, applyMixedCode, applyCompactMixedCode, updateModeCardsState, resetMixedMode, showCodeError, generateEnhancedSkillCode, parseEnhancedSkillCode, generateShareableLink, copyShareableLink, updateShareSettings, generateQuickStartLink, setShareLinkType } from './modules/skill-codes.js';
import { addQuickSkill, updateQuickSkillCards, loadQuickSkills, saveQuickSkills, updateStudentSkillsDisplay, renderQuickSkillsGrid, toggleQuickSkillsEditMode, removeQuickSkill, removeStudentQuickSkill, addToQuickSkills, resetQuickSkillsToDefault, handleQuickSkillSearch, showQuickSkillSearchResults, toggleStudentAddSkill, setQuickSkillsFromCode, clearAllSelectedSkills, updateClearButtonVisibility, toggleQuickStartLock, isQuickStartLocked, setQuickStartLocked, addAllFacts } from './modules/quick-skills.js';
import { initGradeChips, renderGradeChips, toggleGradeChip, getActiveGradeChips, clearActiveGradeChips } from './modules/grade-chips.js';
import { initAdaptiveSession, getAdaptiveLevel, recordAdaptiveAnswer, applyAdaptiveLevelToQuestion, applyAdaptiveSettingsForNextQuestion, toggleAdaptiveMode, resetAdaptiveLevels, getAdaptiveSnapshot, renderAdaptiveLevelChip, setAdaptiveModeEnabled, refreshAdaptiveUI } from './modules/adaptive-engine.js';
import { selectMode } from './modules/mode-selection.js';

// Variant cycler (LRU rotation + adaptive bias) — must load BEFORE generate-question.js
// so window.pickVariant is available when gen-*.js modules first execute.
import { pickVariant, recordVariantWrong, recordVariantRight } from './modules/variant-cycler.js';

// Layer 4: Game Logic
import { startGame, startTimer, updateTimerDisplay, pauseGameTimer, resumeGameTimer, nextQuestion, transitionToNextQuestion, getSkillLabelForQuestion, shouldShowNextButton, showNextButton, hideNextButton, promptFullscreen, acceptFullscreen, declineFullscreen, toggleFullscreen, setupFullscreenDetection, removeFullscreenDetection, skipCurrentQuestion, recordQuestionStatus, renderQuestionDots, recomputeScoreFromHistory, goToQuestionIndex, resumeLiveQuestion } from './modules/game-control.js';
import { generateQuestion } from './modules/generate-question.js';
import { renderQuestion, renderInteractiveOrdering, selectOrderNumber, removeOrderNumber, updateOrderingUI, setupOrderingDragHandlers, reorderSelectedNumber, checkOrderInputsFilled, checkOrderingAnswer, renderInteractiveExpanded, checkExpandedInputsFilled, checkExpandedAnswer, liveValidateExpanded, checkAreaModelAnswer, checkNumberFamilyAnswer, checkNumberFamily, selectNumberLineTick, checkNumberLinePlacement, selectOddEvenNumber, checkOddEvenSelection, wireBoxValidation } from './modules/question-render.js';
import { checkAnswer, submitAnswer, autoCheckOnInput, checkDualAnswer, checkDualFractionAnswer, checkFractionInputAnswer, checkShadePartsAnswer, checkWordProblemAnswer, trackSkillAnswer, skipCurrentItem, resetAttemptTracking, recordWrongAttempt, markWrongChoice, ensureSkipButton, showSkipButtonIfNeeded, appendAttemptHistory, isRetryWithSkipMode, submitFactorPairs, submitInlineBlanks, submitTchartCells, submitMultChartCells, applyReviewOutcome, isReviewing } from './modules/answer-check.js';
import { showSolutionPopup, closeSolutionPopup, generateSolutionSteps } from './modules/solution-display.js';
import { handleTchartDrop, removeFromTchart, hideFactorInBank, returnFactorToBank, validateTchartRow, checkTchartComplete, handleTchartCompletion, showTchartFeedback, resetTchart } from './modules/tchart-factor.js';
import { showDivisibilityHelp, toggleDivSortNumber, dropDivSortNumber, moveNumberToBox, checkDivisibilitySortComplete, setupWorksheetDivisibilitySort, wsToggleDivSortNumber, wsMoveNumberToBox, wsCheckDivisibilitySortComplete } from './modules/divisibility-sort.js';
import { showHint, closeHintPopup, speakQuestion, speakAnswerOption, stopSpeaking, showWordProblemHint, showSolution, resizeInput, showGeometryHint } from './modules/hints-speech.js';
import { updateBossVisuals, startBossMonster, startRaceCPU, updateRaceVisuals, getPlayerRaceSpeed } from './modules/boss-race.js';

// Layer 5: Composite Features
import { initWorksheet, newWorksheet, addMoreProblems, finishUnlimitedWorksheet, toggleHint, closeHint, checkWorksheetAnswerFromColumns, checkWorksheetAnswerFromFuncTable, renderWorksheetOrdering, renderWorksheetExpanded, checkWorksheetOrderingAnswer, checkWorksheetExpandedAnswer, advanceToNextProblem, checkWorksheetAnswer, checkAllWorksheet, checkWorksheetDualAnswer, checkWorksheetCoordinateAnswer, checkAreaModelInput, checkWorksheetNumberFamily, checkWorksheetMC, showWorksheetScore, wsMagnifyCard, wsSpeak, wsSkipCard, attachWorksheetZoom } from './modules/worksheet.js';
import { showModal, getGameDescriptionText, showEndGameModal, updateGoalProgress, checkProblemGoals, endGame, saveWorksheetToHistory, saveToSessionHistory } from './modules/game-flow.js';
import { markTodayAsPlayed, updateStreak, renderStreakCalendar, renderBadges, renderDashboard, filterHistory, getFilteredHistory, renderSessionHistory } from './modules/dashboard.js';
import { openMixedSettings, buildMixedSkillsUI, toggleMixedDomain, toggleDomainCheckbox, updateDomainCheckbox, updateCategoryCheckbox, updateSkillSelection, toggleMixedCategory, toggleCategoryCheckbox, selectAllMixedSkills, deselectAllMixedSkills, setTimeChoice, setModeChoice, toggleTotalProblems, toggleCorrectGoal, getSelectedMixedSkills, skillsToBitfield, bitfieldToSkills, updateMixedCode, copyMixedCode, applyMixedSettings as applyMixedSettingsModal, showMixedError, showMixedSuccess } from './modules/mixed-mode-settings.js';
import { saveMixedModeSettings, loadMixedModeSettings, updateMixedPlayCardState, showPlayMixedPopup, closePlayMixedPopup, closePlayMixedPopupOutside, getAllSkillsEasySettings, playWithLastSettings, playWithCode, parseSingleSkillCodeForPlay, parseCompactMixedCodeForPlay, parseMixedCodeForPlay, applyAndPlayMixedSettings, showStudentChoiceModal, selectStudentMode, selectStudentTimer, updateStudentPlayButton, startMixedGameFromModal, closeStudentChoiceOutside, showMixedPlayToast, updateModeCardsForMixed } from './modules/mixed-mode-play.js';
import { initializeMixedSkillsDropdowns, updateMixedSkillsCategorySelect, updateMixedSkillsSkillSelect, addMixedSkillFromSelects, addMixedSkill, removeMixedSkill, renderMixedSkillsList, distributeMixedSkillsEvenly, clearMixedSkillsWeights, clearMixedSkillsList, syncMixedSkillsListToGlobal, handleMixedSkillSearch, addSkillFromMixedSearch, showMixedSkillSearchResults, hideMixedSkillSearchResults, clearMixedSkillSearch, closeMixedSettings } from './modules/mixed-skill-search.js';

// Layer 6: Print System
import { openPrintSettings, closePrintSettings, openSimplePrintDialog, closeSimplePrintModal, generateSimplePrint, generateWorksheetFromSkills, generateWorksheetFromSections, buildQueuedSkillsWeightedSection, removeQueuedSkillWeight, updateQueuedSkillsTotal, distributeQueuedSkillsEvenly, clearQueuedSkillsWeights, getQueuedSkillsWeights, applyQueuedSkillsToPrint, renderPrintSections, addPrintSection, removePrintSection, updatePrintSectionLabel, removePrintSectionSkill, handlePrintSkillDragStart, handlePrintSkillDragEnd, handlePrintSkillDragOver, handlePrintSkillDragLeave, handlePrintSkillDrop, setPrintCountMode, autoGroupPrintSections, handlePrintDialogSearch, togglePrintDialogSkill, hidePrintDialogSearch, calculateProblemsForPages, savePrintSections, loadSavedPrintSections, cancelPrintGeneration, printMapSkillsAsWorksheet } from './modules/print-settings.js';
import { openAddSkillsModal, closeAddSkillsModal, updateSkillsCountBadge, initializeAddSkillsDropdowns, updateAddSkillsCategorySelect, updateAddSkillsSkillSelect, addSkillFromModalSelects, addGlobalSkill, removeGlobalSkill, renderGlobalSkillsList, distributeGlobalSkillsEvenly, clearGlobalSkillsWeights, clearGlobalSkillsList, syncGlobalSkillsToWeightedItems, syncWeightedItemsToGlobalSkills, syncMixedSkillsToGlobalSkills, handleAddSkillsSearch, addSkillFromAddSkillsSearch, showAddSkillsSearchResults, hideAddSkillsSearchResults, clearAddSkillsSearch, playWithGlobalSkills, openPrintWithGlobalSkills, quizFromGlobalSkills } from './modules/print-global-skills.js';
import { togglePrintSource, buildPrintSkillsUI, togglePrintCategory, togglePrintCategoryCheckbox, updatePrintCategoryCheckbox, selectAllPrintSkills, deselectAllPrintSkills, updateWeightedSectionFromSelections, getSelectedPrintSkillsWithInfo, buildWeightedFromMixedSettings, initializeWeightedSectionOnOpen, generateWeightedSkillsFromDomains, getWeightedCategoryLabel, initializeWeightedDropdowns, updateWeightedCategorySelect, updateWeightedSkillSelect, addWeightedItemFromSelects, addWeightedItem, removeWeightedItem, renderWeightedItemsList, distributeWeightedEvenly, clearAllWeights, clearWeightedList, getWeightedItemsForGeneration, handlePrintSkillSearch, addSkillFromPrintSearch, showPrintSearchResults, hidePrintSearchResults, clearPrintSkillSearch, populateWeightedFromQueue, toggleWeightedDistribution, addWeightedSkill, updateWeightedSkillSelection, updateWeightedRangeSelection, updateWeightedSkillOptions, removeWeightedSkill, updateWeightedTotal, getWeightedSkillsForGeneration, getSelectedPrintSkills } from './modules/print-weighted.js';
import { generatePrintProblem, formatProblemForPrint, generateWorksheetHTML, generateWorkedSolution, formatWorkedSolutionForPrint, toggleAnswerKeyType, closePrintPreview, printWorksheet, downloadPDF, downloadWorksheet } from './modules/print-generate.js';

// Google Classroom Export
import { exportPrintToGoogleForms, exportQuizToGoogleForms, openGoogleExportModal, closeGoogleExportModal, startGoogleExport, initGoogleAuth, isGoogleAuthenticated, revokeGoogleToken, listClassroomCourses } from './modules/google-classroom.js';

// Quiz System
import { initQuizDB, saveTest, loadTest, listTests, deleteTest, saveResult, getResultsForTest, exportTestJSON, importTestJSON, exportResultsCSV, compressTestForURL, decompressTestFromURL, migrateTestToSections, getAllQuestionsFlat, getGlobalOffset, getTotalQuestionCount } from './modules/quiz-storage.js';
import { openQuizBuilder, openMyQuizzes, confirmDeleteQuiz, handleQuizSkillSearch, selectQuizSkill, addSelectedQuestions, addQuizQuestion, addMultipleQuestions, regenerateQuizQuestion, duplicateQuizQuestion, removeQuizQuestion, updateQuizQuestionPoints, updateQuizName, updateQuizSetting, openQuizSettings, closeQuizSettings, saveQuiz, generateQuizLink, printQuiz, exportQuiz, importQuizFile, qbFilterDomain, qbFilterCategory, qbFilterGrade, qbSearchInput, qbPreviewHover, qbPreviewClick, qbRefreshPreview, qbAddFromPreview, addSection, removeSection, reorderSection, setActiveSection, updateSectionLayout, updateSectionLabel, updateSectionInstructions, toggleSectionCollapse, shuffleSectionQuestions, moveQuestionToSection, openQuizPreview, closeQuizPreview, switchPreviewTab, handleQbQuestionDragStart, handleQbQuestionDragEnd, handleQbSectionDragOver, handleQbSectionDragLeave, handleQbSectionDrop } from './modules/quiz-builder.js';
import { handleQuizURL, startQuizTest, submitQuizMC, submitQuizTextAnswer, navigateQuizQuestion, jumpToQuizQuestion, flagQuizQuestion, showQuizReview, jumpFromReview, backFromReview, submitQuiz, downloadQuizStudentResults } from './modules/quiz-take.js';
import { showQuizResults, showStudentQuizDetail, exportQuizCSV, importStudentResultsFile, printQuizTest } from './modules/quiz-results.js';
import { openQuizMonitor, stopMonitoring, toggleMonitorPause, toggleMonitorOption, inviteStudents, finishMonitoring } from './modules/quiz-monitor.js';

// Layer 3: Skills Organizer
import { openSkillsOrganizer, soInitialize, soApplyFilters, soFilterDomain, soFilterCategory, soFilterGrade, soSearchInput, soToggleSkill, soRenderQueuePanel, soRemoveFromQueue, soClearQueue, soPreviewHover, soPreviewLeave, soPreviewClick, soGeneratePreview, soRefreshPreview, soPlay, soPrint, soShare, soShowCode, soSelectAllVisible, soDeselectAllVisible, soUpdateCategoryDropdown, soQuiz } from './modules/skills-organizer.js';

// Learning Stats
import { openLearningStats, closeLearningStats, filterLearningStats, toggleSessionDetails } from './modules/learning-stats.js';

// MAP Test Practice
import { startMapSession, nextMapItem, recordMapAnswer, finalizeMapSession, releaseMapSessionScaffold, skipMapItem, mapJumpToItem, mapResumeCurrent, mapNavBack, mapNavForward } from './modules/map-engine.js';
import { openMapTest, initMapSelector, startMapFromUI, selectMapTier, toggleMapBand, toggleMapDomain, selectAllMapBands, clearMapBands, setMapItemCount, setMapMode, printMapFromSelector, generateMapShareLink, copyMapShareLink, parseMapShareLink, loadMapShareLink } from './modules/map-mode-ui.js';
import { renderMapResults, printMapSession, restartMapSession, updateMapGradeContext } from './modules/map-results.js';

// Floating Calculator Widget (lazy-built; visible only on q.calculatorAllowed)
import { toggleCalculator, showCalculator, hideCalculator } from './modules/calculator.js';

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

// ==========================================
// Attach ALL functions to window for inline handlers
// ==========================================
Object.assign(window, {
    // State & Data (needed by some inline handlers and template code)
    state, DOMAINS, SKILLS, SKILL_CODES, CODE_TO_SKILL, DEFAULT_TABLES,
    getDomainByCategory, getCategoryInfo, SKILL_TIME_CATEGORY,
    GRADE_COLORS, SKILL_GRADES, getSkillGrade, gradeCircleHTML, gradeCircleText, sortByGrade,
    SKILL_PRINT_SIZE, PRINT_SIZE_COLUMNS, getSkillPrintSize,
    SKILL_FULL_LABELS, getMixedSkillCount, isMixedMetaSkill,

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
    updateUI, toggleTheme, confetti,

    // User Role
    toggleUserRole, setUserRole, loadUserRole, updateUIForRole,

    // Navigation
    showView, goHome, exitGame, saveIncompleteSession, restoreSettingsUI,

    // Settings Panel
    toggleSettingsPanel, openSettingsPanel, closeSettingsPanel, setTTS,
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
    selectMode,

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
    generateQuestion,
    renderQuestion, renderInteractiveOrdering, selectOrderNumber, removeOrderNumber,
    updateOrderingUI, setupOrderingDragHandlers, reorderSelectedNumber, checkOrderInputsFilled, checkOrderingAnswer,
    renderInteractiveExpanded, checkExpandedInputsFilled, checkExpandedAnswer, liveValidateExpanded,
    checkAreaModelAnswer, checkNumberFamilyAnswer, checkNumberFamily,
    selectNumberLineTick, checkNumberLinePlacement,
    selectOddEvenNumber, checkOddEvenSelection,
    wireBoxValidation,

    // Answer Checking
    checkAnswer, submitAnswer, autoCheckOnInput, checkDualAnswer, checkDualFractionAnswer, checkFractionInputAnswer, checkShadePartsAnswer, checkWordProblemAnswer, trackSkillAnswer,
    skipCurrentItem, resetAttemptTracking, recordWrongAttempt, markWrongChoice,
    ensureSkipButton, showSkipButtonIfNeeded, appendAttemptHistory, isRetryWithSkipMode,
    submitFactorPairs, submitInlineBlanks, submitTchartCells, submitMultChartCells,
    applyReviewOutcome, isReviewing,

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
    showHint, closeHintPopup, speakQuestion, speakAnswerOption, stopSpeaking,

    // Boss & Race
    updateBossVisuals, startBossMonster, startRaceCPU, updateRaceVisuals, getPlayerRaceSpeed,

    // Worksheet
    initWorksheet, newWorksheet, addMoreProblems, finishUnlimitedWorksheet,
    toggleHint, closeHint, checkWorksheetAnswerFromColumns,
    checkWorksheetAnswerFromFuncTable, renderWorksheetOrdering, renderWorksheetExpanded,
    checkWorksheetOrderingAnswer, checkWorksheetExpandedAnswer,
    advanceToNextProblem, checkWorksheetAnswer, checkAllWorksheet,
    checkWorksheetDualAnswer, checkWorksheetCoordinateAnswer,
    checkAreaModelInput, checkWorksheetNumberFamily, checkWorksheetMC, showWorksheetScore,
    wsMagnifyCard, wsSpeak, wsSkipCard, attachWorksheetZoom,

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

    // Print Settings
    openPrintSettings, closePrintSettings, openSimplePrintDialog, closeSimplePrintModal,
    generateSimplePrint, generateWorksheetFromSkills, generateWorksheetFromSections,
    buildQueuedSkillsWeightedSection, removeQueuedSkillWeight,
    updateQueuedSkillsTotal, distributeQueuedSkillsEvenly,
    clearQueuedSkillsWeights, getQueuedSkillsWeights, applyQueuedSkillsToPrint,
    renderPrintSections, addPrintSection, removePrintSection,
    updatePrintSectionLabel, removePrintSectionSkill,
    handlePrintSkillDragStart, handlePrintSkillDragEnd,
    handlePrintSkillDragOver, handlePrintSkillDragLeave, handlePrintSkillDrop,
    setPrintCountMode, autoGroupPrintSections, handlePrintDialogSearch,
    togglePrintDialogSkill, hidePrintDialogSearch, calculateProblemsForPages,
    savePrintSections, loadSavedPrintSections, cancelPrintGeneration,
    printMapSkillsAsWorksheet,

    // Print Global Skills
    openAddSkillsModal, closeAddSkillsModal, updateSkillsCountBadge,
    initializeAddSkillsDropdowns, updateAddSkillsCategorySelect,
    updateAddSkillsSkillSelect, addSkillFromModalSelects,
    addGlobalSkill, removeGlobalSkill, renderGlobalSkillsList,
    distributeGlobalSkillsEvenly, clearGlobalSkillsWeights, clearGlobalSkillsList,
    syncGlobalSkillsToWeightedItems, syncWeightedItemsToGlobalSkills,
    syncMixedSkillsToGlobalSkills, handleAddSkillsSearch, addSkillFromAddSkillsSearch,
    showAddSkillsSearchResults, hideAddSkillsSearchResults, clearAddSkillsSearch,
    playWithGlobalSkills, openPrintWithGlobalSkills, quizFromGlobalSkills,

    // Print Weighted
    togglePrintSource, buildPrintSkillsUI, togglePrintCategory,
    togglePrintCategoryCheckbox, updatePrintCategoryCheckbox,
    selectAllPrintSkills, deselectAllPrintSkills,
    updateWeightedSectionFromSelections, getSelectedPrintSkillsWithInfo,
    buildWeightedFromMixedSettings, initializeWeightedSectionOnOpen,
    generateWeightedSkillsFromDomains, getWeightedCategoryLabel,
    initializeWeightedDropdowns, updateWeightedCategorySelect,
    updateWeightedSkillSelect, addWeightedItemFromSelects,
    addWeightedItem, removeWeightedItem, renderWeightedItemsList,
    distributeWeightedEvenly, clearAllWeights, clearWeightedList,
    getWeightedItemsForGeneration, handlePrintSkillSearch, addSkillFromPrintSearch,
    showPrintSearchResults, hidePrintSearchResults, clearPrintSkillSearch,
    populateWeightedFromQueue, toggleWeightedDistribution, addWeightedSkill,
    updateWeightedSkillSelection, updateWeightedRangeSelection,
    updateWeightedSkillOptions, removeWeightedSkill, updateWeightedTotal,
    getWeightedSkillsForGeneration, getSelectedPrintSkills,

    // Print Generate
    generatePrintProblem, formatProblemForPrint, generateWorksheetHTML,
    generateWorkedSolution, formatWorkedSolutionForPrint, toggleAnswerKeyType,
    closePrintPreview, printWorksheet, downloadPDF, downloadWorksheet,

    // Skills Organizer
    openSkillsOrganizer, soInitialize, soApplyFilters, soFilterDomain, soFilterCategory,
    soFilterGrade, soSearchInput, soToggleSkill, soRenderQueuePanel, soRemoveFromQueue,
    soClearQueue, soPreviewHover, soPreviewLeave, soPreviewClick, soGeneratePreview, soRefreshPreview,
    soPlay, soPrint, soShare, soShowCode, soSelectAllVisible, soDeselectAllVisible, soUpdateCategoryDropdown, soQuiz,

    // Quiz System
    initQuizDB, saveTest, loadTest, listTests, deleteTest, saveResult, getResultsForTest,
    exportTestJSON, importTestJSON, exportResultsCSV, compressTestForURL, decompressTestFromURL,
    migrateTestToSections, getAllQuestionsFlat, getGlobalOffset, getTotalQuestionCount,
    openQuizBuilder, openMyQuizzes, confirmDeleteQuiz, handleQuizSkillSearch, selectQuizSkill,
    addSelectedQuestions, addQuizQuestion, addMultipleQuestions, regenerateQuizQuestion,
    duplicateQuizQuestion, removeQuizQuestion, updateQuizQuestionPoints, updateQuizName, updateQuizSetting,
    openQuizSettings, closeQuizSettings, saveQuiz, generateQuizLink,
    printQuiz, exportQuiz, importQuizFile,
    qbFilterDomain, qbFilterCategory, qbFilterGrade, qbSearchInput,
    qbPreviewHover, qbPreviewClick, qbRefreshPreview, qbAddFromPreview,
    addSection, removeSection, reorderSection, setActiveSection,
    updateSectionLayout, updateSectionLabel, updateSectionInstructions,
    toggleSectionCollapse, shuffleSectionQuestions, moveQuestionToSection,
    handleQbQuestionDragStart, handleQbQuestionDragEnd,
    handleQbSectionDragOver, handleQbSectionDragLeave, handleQbSectionDrop,
    openQuizPreview, closeQuizPreview, switchPreviewTab,
    handleQuizURL, startQuizTest, submitQuizMC, submitQuizTextAnswer,
    navigateQuizQuestion, jumpToQuizQuestion, flagQuizQuestion,
    showQuizReview, jumpFromReview, backFromReview, submitQuiz, downloadQuizStudentResults,
    showQuizResults, showStudentQuizDetail, exportQuizCSV, importStudentResultsFile, printQuizTest,

    // Google Classroom Export
    exportPrintToGoogleForms, exportQuizToGoogleForms, openGoogleExportModal, closeGoogleExportModal, startGoogleExport, initGoogleAuth, isGoogleAuthenticated, revokeGoogleToken, listClassroomCourses,

    // Quiz Monitor
    openQuizMonitor, stopMonitoring, toggleMonitorPause, toggleMonitorOption,
    inviteStudents, finishMonitoring,

    // MAP Test Practice
    openMapTest, initMapSelector, startMapFromUI, selectMapTier,
    toggleMapBand, toggleMapDomain, selectAllMapBands, clearMapBands,
    setMapItemCount, setMapMode, printMapFromSelector,
    generateMapShareLink, copyMapShareLink, parseMapShareLink, loadMapShareLink,
    startMapSession, nextMapItem, recordMapAnswer, finalizeMapSession, releaseMapSessionScaffold, skipMapItem,
    mapJumpToItem, mapResumeCurrent, mapNavBack, mapNavForward,
    renderMapResults, printMapSession, restartMapSession, updateMapGradeContext,

    // Calculator Widget
    toggleCalculator, showCalculator, hideCalculator,

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
window.speak = function(text) {
    if (!text || typeof window.speechSynthesis === 'undefined') return;
    try {
        // Cancel anything currently speaking so a fresh tap reads cleanly.
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(String(text));
        u.rate = 0.9;
        u.pitch = 1.0;
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

// Bootstrap the application
bootstrap();
