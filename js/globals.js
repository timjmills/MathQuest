// Barrel module: imports all modules and attaches functions to window for inline handlers

// Layer 0: Foundation
import { state } from './modules/state.js';
import { randInt, shuffle, pick, buildNumericOptions, simplifyFraction, normalizeText, fracText, fractionToPercent } from './modules/utils.js';
import { DOMAINS, SKILLS, SKILL_CODES, CODE_TO_SKILL, DEFAULT_TABLES, getDomainByCategory, getCategoryInfo } from './modules/data.js';

// Layer 1: Storage & SVG helpers
import { setCookie, getCookie, loadPersistentData, savePersistentData } from './modules/storage.js';
import { createAngleSVG, createRectangleSVG, createSquareSVG, createTriangleSVG, createShapeSVG, create3DBoxSVG, createLShapeSVG, createTShapeSVG, createWordProblemShapeSVG, createLabeledRectSVG } from './modules/svg-geometry.js';
import { fracHTML, fracCircleSVG, fracBarHTML, fracWithVisual, fracEquationHTML, fracCompareHTML } from './modules/svg-fractions.js';
import { createAnalogClockSVG, createDigitalClockHTML, addTime, subtractTime, getElapsedTime, formatTime, formatTimeWithAMPM, timeToWords, numberToWords, generateTimeDistractors, createMagnifiableClock, createClockChoiceWithMagnify, selectClockOption, magnifyClock, closeMagnifiedClock, handleMagnifyEscape } from './modules/svg-clock.js';
import { createBase10Blocks, createCountingDots, createDotArray, createNumberLine } from './modules/svg-base10.js';
import { getFactorPairs, createFactorLinksSVG } from './modules/svg-factors.js';

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
import { generateSkillCode, applySkillCode, copySkillCode, updateSkillCodeDisplay, updateSkillWeight, renderWeightedSkillsList, removeFromQueue, generateMixedLink, copyMixedLink, getSkillCode, getSkillFromCode, generateSettingsCode, updateSettingsCode, applySettingsCode, applyMixedCode, applyCompactMixedCode, updateModeCardsState, resetMixedMode, showCodeError } from './modules/skill-codes.js';
import { addQuickSkill, updateQuickSkillCards, loadQuickSkills, saveQuickSkills, updateStudentSkillsDisplay, renderQuickSkillsGrid, toggleQuickSkillsEditMode, removeQuickSkill, removeStudentQuickSkill, addToQuickSkills, resetQuickSkillsToDefault, handleQuickSkillSearch, showQuickSkillSearchResults } from './modules/quick-skills.js';
import { selectMode } from './modules/mode-selection.js';

// Layer 4: Game Logic
import { startGame, startTimer, updateTimerDisplay, nextQuestion, getSkillLabelForQuestion, shouldShowNextButton, showNextButton, hideNextButton } from './modules/game-control.js';
import { generateQuestion } from './modules/generate-question.js';
import { renderQuestion, renderInteractiveOrdering, selectOrderNumber, removeOrderNumber, updateOrderingUI, checkOrderInputsFilled, checkOrderingAnswer, renderInteractiveExpanded, checkExpandedInputsFilled, checkExpandedAnswer, checkAreaModelAnswer, checkNumberFamilyAnswer, checkNumberFamily } from './modules/question-render.js';
import { checkAnswer, submitAnswer, checkDualAnswer, checkWordProblemAnswer } from './modules/answer-check.js';
import { showSolutionPopup, closeSolutionPopup, generateSolutionSteps } from './modules/solution-display.js';
import { handleTchartDrop, removeFromTchart, hideFactorInBank, returnFactorToBank, validateTchartRow, checkTchartComplete, handleTchartCompletion, showTchartFeedback, resetTchart } from './modules/tchart-factor.js';
import { showDivisibilityHelp, toggleDivSortNumber, dropDivSortNumber, moveNumberToBox, checkDivisibilitySortComplete, setupWorksheetDivisibilitySort, wsToggleDivSortNumber, wsMoveNumberToBox, wsCheckDivisibilitySortComplete } from './modules/divisibility-sort.js';
import { showHint, speakQuestion, speakAnswerOption, stopSpeaking, showWordProblemHint, showSolution, resizeInput, showGeometryHint } from './modules/hints-speech.js';
import { updateBossVisuals, startBossMonster, startRaceCPU, updateRaceVisuals, getPlayerRaceSpeed } from './modules/boss-race.js';

// Layer 5: Composite Features
import { initWorksheet, newWorksheet, addMoreProblems, finishUnlimitedWorksheet, toggleHint, closeHint, checkWorksheetAnswerFromColumns, checkWorksheetAnswerFromFuncTable, renderWorksheetOrdering, renderWorksheetExpanded, checkWorksheetOrderingAnswer, checkWorksheetExpandedAnswer, advanceToNextProblem, checkWorksheetAnswer, checkAllWorksheet, checkWorksheetDualAnswer, checkWorksheetCoordinateAnswer, checkAreaModelInput, checkWorksheetNumberFamily, showWorksheetScore } from './modules/worksheet.js';
import { showModal, getGameDescriptionText, showEndGameModal, updateGoalProgress, checkProblemGoals, endGame, saveWorksheetToHistory, saveToSessionHistory } from './modules/game-flow.js';
import { markTodayAsPlayed, updateStreak, renderStreakCalendar, renderBadges, renderDashboard, filterHistory, getFilteredHistory, renderSessionHistory } from './modules/dashboard.js';
import { openMixedSettings, buildMixedSkillsUI, toggleMixedDomain, toggleDomainCheckbox, updateDomainCheckbox, updateCategoryCheckbox, updateSkillSelection, toggleMixedCategory, toggleCategoryCheckbox, selectAllMixedSkills, deselectAllMixedSkills, setTimeChoice, setModeChoice, toggleTotalProblems, toggleCorrectGoal, getSelectedMixedSkills, skillsToBitfield, bitfieldToSkills, updateMixedCode, copyMixedCode, applyMixedSettings as applyMixedSettingsModal, showMixedError, showMixedSuccess } from './modules/mixed-mode-settings.js';
import { saveMixedModeSettings, loadMixedModeSettings, updateMixedPlayCardState, showPlayMixedPopup, closePlayMixedPopup, closePlayMixedPopupOutside, getAllSkillsEasySettings, playWithLastSettings, playWithCode, parseSingleSkillCodeForPlay, parseCompactMixedCodeForPlay, parseMixedCodeForPlay, applyAndPlayMixedSettings, showStudentChoiceModal, selectStudentMode, selectStudentTimer, updateStudentPlayButton, startMixedGameFromModal, closeStudentChoiceOutside, showMixedPlayToast, updateModeCardsForMixed } from './modules/mixed-mode-play.js';
import { initializeMixedSkillsDropdowns, updateMixedSkillsCategorySelect, updateMixedSkillsSkillSelect, addMixedSkillFromSelects, addMixedSkill, removeMixedSkill, renderMixedSkillsList, distributeMixedSkillsEvenly, clearMixedSkillsWeights, clearMixedSkillsList, syncMixedSkillsListToGlobal, handleMixedSkillSearch, addSkillFromMixedSearch, showMixedSkillSearchResults, hideMixedSkillSearchResults, clearMixedSkillSearch, closeMixedSettings } from './modules/mixed-skill-search.js';

// Layer 6: Print System
import { openPrintSettings, closePrintSettings, openSimplePrintDialog, closeSimplePrintModal, generateSimplePrint, generateWorksheetFromSkills, buildQueuedSkillsWeightedSection, removeQueuedSkillWeight, updateQueuedSkillsTotal, distributeQueuedSkillsEvenly, clearQueuedSkillsWeights, getQueuedSkillsWeights, applyQueuedSkillsToPrint } from './modules/print-settings.js';
import { openAddSkillsModal, closeAddSkillsModal, updateSkillsCountBadge, initializeAddSkillsDropdowns, updateAddSkillsCategorySelect, updateAddSkillsSkillSelect, addSkillFromModalSelects, addGlobalSkill, removeGlobalSkill, renderGlobalSkillsList, distributeGlobalSkillsEvenly, clearGlobalSkillsWeights, clearGlobalSkillsList, syncGlobalSkillsToWeightedItems, syncWeightedItemsToGlobalSkills, syncMixedSkillsToGlobalSkills, handleAddSkillsSearch, addSkillFromAddSkillsSearch, showAddSkillsSearchResults, hideAddSkillsSearchResults, clearAddSkillsSearch, playWithGlobalSkills, openPrintWithGlobalSkills } from './modules/print-global-skills.js';
import { togglePrintSource, buildPrintSkillsUI, togglePrintCategory, togglePrintCategoryCheckbox, updatePrintCategoryCheckbox, selectAllPrintSkills, deselectAllPrintSkills, updateWeightedSectionFromSelections, getSelectedPrintSkillsWithInfo, buildWeightedFromMixedSettings, initializeWeightedSectionOnOpen, generateWeightedSkillsFromDomains, getWeightedCategoryLabel, initializeWeightedDropdowns, updateWeightedCategorySelect, updateWeightedSkillSelect, addWeightedItemFromSelects, addWeightedItem, removeWeightedItem, renderWeightedItemsList, distributeWeightedEvenly, clearAllWeights, clearWeightedList, getWeightedItemsForGeneration, handlePrintSkillSearch, addSkillFromPrintSearch, showPrintSearchResults, hidePrintSearchResults, clearPrintSkillSearch, populateWeightedFromQueue, toggleWeightedDistribution, addWeightedSkill, updateWeightedSkillSelection, updateWeightedRangeSelection, updateWeightedSkillOptions, removeWeightedSkill, updateWeightedTotal, getWeightedSkillsForGeneration, getSelectedPrintSkills } from './modules/print-weighted.js';
import { generatePrintProblem, formatProblemForPrint, generateWorksheetHTML, generateWorkedSolution, formatWorkedSolutionForPrint, toggleAnswerKeyType, closePrintPreview, printWorksheet, downloadPDF, downloadWorksheet } from './modules/print-generate.js';

// Layer 7: Init
import { init, checkURLParameters, setupModalListeners, bootstrap } from './modules/init.js';

// ==========================================
// Attach ALL functions to window for inline handlers
// ==========================================
Object.assign(window, {
    // State & Data (needed by some inline handlers and template code)
    state, DOMAINS, SKILLS, SKILL_CODES, CODE_TO_SKILL, DEFAULT_TABLES,
    getDomainByCategory, getCategoryInfo,

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
    createBase10Blocks, createCountingDots, createDotArray, createNumberLine,
    getFactorPairs, createFactorLinksSVG,

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

    // Quick Skills
    addQuickSkill, updateQuickSkillCards, loadQuickSkills, saveQuickSkills,
    updateStudentSkillsDisplay, renderQuickSkillsGrid, toggleQuickSkillsEditMode,
    removeQuickSkill, removeStudentQuickSkill, addToQuickSkills,
    resetQuickSkillsToDefault, handleQuickSkillSearch, showQuickSkillSearchResults,

    // Mode Selection
    selectMode,

    // Game Control
    startGame, startTimer, updateTimerDisplay, nextQuestion, getSkillLabelForQuestion,
    shouldShowNextButton, showNextButton, hideNextButton,

    // Question Generation & Rendering
    generateQuestion,
    renderQuestion, renderInteractiveOrdering, selectOrderNumber, removeOrderNumber,
    updateOrderingUI, checkOrderInputsFilled, checkOrderingAnswer,
    renderInteractiveExpanded, checkExpandedInputsFilled, checkExpandedAnswer,
    checkAreaModelAnswer, checkNumberFamilyAnswer, checkNumberFamily,

    // Answer Checking
    checkAnswer, submitAnswer, checkDualAnswer, checkWordProblemAnswer,

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
    showHint, speakQuestion, speakAnswerOption, stopSpeaking,

    // Boss & Race
    updateBossVisuals, startBossMonster, startRaceCPU, updateRaceVisuals, getPlayerRaceSpeed,

    // Worksheet
    initWorksheet, newWorksheet, addMoreProblems, finishUnlimitedWorksheet,
    toggleHint, closeHint, checkWorksheetAnswerFromColumns,
    checkWorksheetAnswerFromFuncTable, renderWorksheetOrdering, renderWorksheetExpanded,
    checkWorksheetOrderingAnswer, checkWorksheetExpandedAnswer,
    advanceToNextProblem, checkWorksheetAnswer, checkAllWorksheet,
    checkWorksheetDualAnswer, checkWorksheetCoordinateAnswer,
    checkAreaModelInput, checkWorksheetNumberFamily, showWorksheetScore,

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
    generateSimplePrint, generateWorksheetFromSkills,
    buildQueuedSkillsWeightedSection, removeQueuedSkillWeight,
    updateQueuedSkillsTotal, distributeQueuedSkillsEvenly,
    clearQueuedSkillsWeights, getQueuedSkillsWeights, applyQueuedSkillsToPrint,

    // Print Global Skills
    openAddSkillsModal, closeAddSkillsModal, updateSkillsCountBadge,
    initializeAddSkillsDropdowns, updateAddSkillsCategorySelect,
    updateAddSkillsSkillSelect, addSkillFromModalSelects,
    addGlobalSkill, removeGlobalSkill, renderGlobalSkillsList,
    distributeGlobalSkillsEvenly, clearGlobalSkillsWeights, clearGlobalSkillsList,
    syncGlobalSkillsToWeightedItems, syncWeightedItemsToGlobalSkills,
    syncMixedSkillsToGlobalSkills, handleAddSkillsSearch, addSkillFromAddSkillsSearch,
    showAddSkillsSearchResults, hideAddSkillsSearchResults, clearAddSkillsSearch,
    playWithGlobalSkills, openPrintWithGlobalSkills,

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

// Bootstrap the application
bootstrap();
