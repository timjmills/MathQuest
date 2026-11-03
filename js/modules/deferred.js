// The DEFERRED half of the app (Chromebook speed lane, 2026-11-02): everything a pupil does not need before the
// first question - the print and worksheet builders, the quiz builder / taker / results / monitor, the Google export,
// the skills organizer, MAP test practice and the teacher site (with the curriculum, standards, WRM, build-list and
// lesson data it imports). js/globals.js stays the single entry: it puts a thin async stub on window for every name in
// API, and loadDeferred() imports this file on first use or on idle, then replaces each stub with the real function.
// Students' Chromebooks on school Wi-Fi took 17 s to show Start Playing when all of this loaded up front.
//
// Keep API and globals.js's DEFERRED_NAMES identical: ws-chromebook-perf checks DEFERRED_NAMES against API and that no
// name is still a stub once this part has loaded.
import { openPrintSettings, closePrintSettings, openSimplePrintDialog, closeSimplePrintModal, generateSimplePrint, generateWorksheetFromSkills, generateWorksheetFromSections, buildQueuedSkillsWeightedSection, removeQueuedSkillWeight, updateQueuedSkillsTotal, distributeQueuedSkillsEvenly, clearQueuedSkillsWeights, getQueuedSkillsWeights, applyQueuedSkillsToPrint, renderPrintSections, addPrintSection, removePrintSection, updatePrintSectionLabel, removePrintSectionSkill, togglePrintSkillOptions, setPrintSkillOption, togglePrintSkillOptionSet, setPrintSkillOptionSetAll, resetPrintSkillOptions, ownPrintSkillOptions, handlePrintSkillDragStart, handlePrintSkillDragEnd, handlePrintSkillDragOver, handlePrintSkillDragLeave, handlePrintSkillDrop, setPrintCountMode, autoGroupPrintSections, handlePrintDialogSearch, togglePrintDialogSkill, hidePrintDialogSearch, calculateProblemsForPages, savePrintSections, loadSavedPrintSections, cancelPrintGeneration, printMapSkillsAsWorksheet } from './print-settings.js';
import { openAddSkillsModal, closeAddSkillsModal, updateSkillsCountBadge, initializeAddSkillsDropdowns, updateAddSkillsCategorySelect, updateAddSkillsSkillSelect, addSkillFromModalSelects, addGlobalSkill, removeGlobalSkill, renderGlobalSkillsList, distributeGlobalSkillsEvenly, clearGlobalSkillsWeights, clearGlobalSkillsList, syncGlobalSkillsToWeightedItems, syncWeightedItemsToGlobalSkills, syncMixedSkillsToGlobalSkills, handleAddSkillsSearch, addSkillFromAddSkillsSearch, showAddSkillsSearchResults, hideAddSkillsSearchResults, clearAddSkillsSearch, playWithGlobalSkills, openPrintWithGlobalSkills, quizFromGlobalSkills } from './print-global-skills.js';
import { togglePrintSource, buildPrintSkillsUI, togglePrintCategory, togglePrintCategoryCheckbox, updatePrintCategoryCheckbox, selectAllPrintSkills, deselectAllPrintSkills, updateWeightedSectionFromSelections, getSelectedPrintSkillsWithInfo, buildWeightedFromMixedSettings, initializeWeightedSectionOnOpen, generateWeightedSkillsFromDomains, getWeightedCategoryLabel, initializeWeightedDropdowns, updateWeightedCategorySelect, updateWeightedSkillSelect, addWeightedItemFromSelects, addWeightedItem, removeWeightedItem, renderWeightedItemsList, distributeWeightedEvenly, clearAllWeights, clearWeightedList, getWeightedItemsForGeneration, handlePrintSkillSearch, addSkillFromPrintSearch, showPrintSearchResults, hidePrintSearchResults, clearPrintSkillSearch, populateWeightedFromQueue, toggleWeightedDistribution, addWeightedSkill, updateWeightedSkillSelection, updateWeightedRangeSelection, updateWeightedSkillOptions, removeWeightedSkill, updateWeightedTotal, getWeightedSkillsForGeneration, getSelectedPrintSkills } from './print-weighted.js';
import { generatePrintProblem, formatProblemForPrint, generateWorksheetHTML, generateWorkedSolution, formatWorkedSolutionForPrint, toggleAnswerKeyType, closePrintPreview, printWorksheet, downloadPDF, downloadWorksheet } from './print-generate.js';
import { buildSheet, sheetDocument } from './print-sheet.js';
import { exportPrintToGoogleForms, exportQuizToGoogleForms, openGoogleExportModal, closeGoogleExportModal, startGoogleExport, initGoogleAuth, isGoogleAuthenticated, revokeGoogleToken, listClassroomCourses } from './google-classroom.js';
import { initQuizDB, saveTest, loadTest, listTests, deleteTest, saveResult, getResultsForTest, exportTestJSON, importTestJSON, exportResultsCSV, compressTestForURL, decompressTestFromURL, migrateTestToSections, getAllQuestionsFlat, getGlobalOffset, getTotalQuestionCount } from './quiz-storage.js';
import { openQuizBuilder, openMyQuizzes, confirmDeleteQuiz, handleQuizSkillSearch, selectQuizSkill, addSelectedQuestions, addQuizQuestion, addMultipleQuestions, regenerateQuizQuestion, duplicateQuizQuestion, removeQuizQuestion, updateQuizQuestionPoints, updateQuizName, updateQuizSetting, openQuizSettings, closeQuizSettings, saveQuiz, generateQuizLink, printQuiz, exportQuiz, importQuizFile, qbFilterDomain, qbFilterCategory, qbFilterGrade, qbSearchInput, qbPreviewHover, qbPreviewClick, qbRefreshPreview, qbAddFromPreview, addSection, removeSection, reorderSection, setActiveSection, updateSectionLayout, updateSectionLabel, updateSectionInstructions, toggleSectionCollapse, shuffleSectionQuestions, moveQuestionToSection, openQuizPreview, closeQuizPreview, switchPreviewTab, handleQbQuestionDragStart, handleQbQuestionDragEnd, handleQbSectionDragOver, handleQbSectionDragLeave, handleQbSectionDrop, openBuilderResults, openBuilderMonitor } from './quiz-builder.js';
import { quizQuestionData, handleQuizURL, startQuizTest, submitQuizMC, submitQuizTextAnswer, navigateQuizQuestion, jumpToQuizQuestion, flagQuizQuestion, showQuizReview, jumpFromReview, backFromReview, submitQuiz, downloadQuizStudentResults } from './quiz-take.js';
import { showQuizResults, showStudentQuizDetail, exportQuizCSV, importStudentResultsFile, printQuizTest, closeQuizResults, copyQuizLinkFromResults } from './quiz-results.js';
import { tvqMenu } from './teacher-quiz-ui.js';
import { openQuizMonitor, stopMonitoring, toggleMonitorPause, toggleMonitorOption, inviteStudents, finishMonitoring, closeQuizMonitor } from './quiz-monitor.js';
import { openSkillsOrganizer, soInitialize, soApplyFilters, soFilterDomain, soFilterCategory, soFilterGrade, soSearchInput, soToggleSkill, soRenderQueuePanel, soRemoveFromQueue, soClearQueue, soPreviewHover, soPreviewLeave, soPreviewClick, soGeneratePreview, soRefreshPreview, soPlay, soPrint, soShare, soShowCode, soSelectAllVisible, soDeselectAllVisible, soUpdateCategoryDropdown, soQuiz } from './skills-organizer.js';
import { startMapSession, nextMapItem, recordMapAnswer, finalizeMapSession, releaseMapSessionScaffold, skipMapItem, mapJumpToItem, mapResumeCurrent, mapNavBack, mapNavForward } from './map-engine.js';
import { openMapTest, initMapSelector, startMapFromUI, selectMapTier, toggleMapBand, toggleMapDomain, selectAllMapBands, clearMapBands, setMapItemCount, setMapMode, printMapFromSelector, generateMapShareLink, copyMapShareLink, parseMapShareLink, loadMapShareLink } from './map-mode-ui.js';
import { renderMapResults, printMapSession, restartMapSession, updateMapGradeContext } from './map-results.js';
import { tvGo } from './teacher-shell.js';
import './teacher-sheet.js';   // T3b: window.tvOpenSheet (the Worksheet, Quiz and Share sheets)

// The Google Forms / Classroom export's third-party scripts (google-classroom.js reads window.google and
// window.html2canvas): they were <script> tags in index.html that every pupil downloaded (~150 KB).
for (const src of ['https://accounts.google.com/gsi/client', 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js']) {
    if (typeof document === 'undefined' || document.querySelector(`script[src="${src}"]`)) continue;
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    document.head.appendChild(el);
}

export const API = {
    openPrintSettings, closePrintSettings, openSimplePrintDialog, closeSimplePrintModal, generateSimplePrint,
    generateWorksheetFromSkills, generateWorksheetFromSections, buildQueuedSkillsWeightedSection,
    removeQueuedSkillWeight, updateQueuedSkillsTotal, distributeQueuedSkillsEvenly, clearQueuedSkillsWeights,
    getQueuedSkillsWeights, applyQueuedSkillsToPrint, renderPrintSections, addPrintSection, removePrintSection,
    updatePrintSectionLabel, removePrintSectionSkill, togglePrintSkillOptions, setPrintSkillOption,
    togglePrintSkillOptionSet, setPrintSkillOptionSetAll, resetPrintSkillOptions, ownPrintSkillOptions,
    handlePrintSkillDragStart, handlePrintSkillDragEnd, handlePrintSkillDragOver, handlePrintSkillDragLeave,
    handlePrintSkillDrop, setPrintCountMode, autoGroupPrintSections, handlePrintDialogSearch, togglePrintDialogSkill,
    hidePrintDialogSearch, calculateProblemsForPages, savePrintSections, loadSavedPrintSections,
    cancelPrintGeneration, printMapSkillsAsWorksheet, openAddSkillsModal, closeAddSkillsModal, updateSkillsCountBadge,
    initializeAddSkillsDropdowns, updateAddSkillsCategorySelect, updateAddSkillsSkillSelect, addSkillFromModalSelects,
    addGlobalSkill, removeGlobalSkill, renderGlobalSkillsList, distributeGlobalSkillsEvenly, clearGlobalSkillsWeights,
    clearGlobalSkillsList, syncGlobalSkillsToWeightedItems, syncWeightedItemsToGlobalSkills,
    syncMixedSkillsToGlobalSkills, handleAddSkillsSearch, addSkillFromAddSkillsSearch, showAddSkillsSearchResults,
    hideAddSkillsSearchResults, clearAddSkillsSearch, playWithGlobalSkills, openPrintWithGlobalSkills,
    quizFromGlobalSkills, togglePrintSource, buildPrintSkillsUI, togglePrintCategory, togglePrintCategoryCheckbox,
    updatePrintCategoryCheckbox, selectAllPrintSkills, deselectAllPrintSkills, updateWeightedSectionFromSelections,
    getSelectedPrintSkillsWithInfo, buildWeightedFromMixedSettings, initializeWeightedSectionOnOpen,
    generateWeightedSkillsFromDomains, getWeightedCategoryLabel, initializeWeightedDropdowns,
    updateWeightedCategorySelect, updateWeightedSkillSelect, addWeightedItemFromSelects, addWeightedItem,
    removeWeightedItem, renderWeightedItemsList, distributeWeightedEvenly, clearAllWeights, clearWeightedList,
    getWeightedItemsForGeneration, handlePrintSkillSearch, addSkillFromPrintSearch, showPrintSearchResults,
    hidePrintSearchResults, clearPrintSkillSearch, populateWeightedFromQueue, toggleWeightedDistribution,
    addWeightedSkill, updateWeightedSkillSelection, updateWeightedRangeSelection, updateWeightedSkillOptions,
    removeWeightedSkill, updateWeightedTotal, getWeightedSkillsForGeneration, getSelectedPrintSkills,
    generatePrintProblem, formatProblemForPrint, generateWorksheetHTML, generateWorkedSolution,
    formatWorkedSolutionForPrint, toggleAnswerKeyType, closePrintPreview, printWorksheet, downloadPDF,
    downloadWorksheet, buildSheet, sheetDocument, exportPrintToGoogleForms, exportQuizToGoogleForms,
    openGoogleExportModal, closeGoogleExportModal, startGoogleExport, initGoogleAuth, isGoogleAuthenticated,
    revokeGoogleToken, listClassroomCourses, initQuizDB, saveTest, loadTest, listTests, deleteTest, saveResult,
    getResultsForTest, exportTestJSON, importTestJSON, exportResultsCSV, compressTestForURL, decompressTestFromURL,
    migrateTestToSections, getAllQuestionsFlat, getGlobalOffset, getTotalQuestionCount, openQuizBuilder,
    openMyQuizzes, confirmDeleteQuiz, handleQuizSkillSearch, selectQuizSkill, addSelectedQuestions, addQuizQuestion,
    addMultipleQuestions, regenerateQuizQuestion, duplicateQuizQuestion, removeQuizQuestion, updateQuizQuestionPoints,
    updateQuizName, updateQuizSetting, openQuizSettings, closeQuizSettings, saveQuiz, generateQuizLink, printQuiz,
    exportQuiz, importQuizFile, qbFilterDomain, qbFilterCategory, qbFilterGrade, qbSearchInput, qbPreviewHover,
    qbPreviewClick, qbRefreshPreview, qbAddFromPreview, addSection, removeSection, reorderSection, setActiveSection,
    updateSectionLayout, updateSectionLabel, updateSectionInstructions, toggleSectionCollapse,
    shuffleSectionQuestions, moveQuestionToSection, openQuizPreview, closeQuizPreview, switchPreviewTab,
    handleQbQuestionDragStart, handleQbQuestionDragEnd, handleQbSectionDragOver, handleQbSectionDragLeave,
    handleQbSectionDrop, openBuilderResults, openBuilderMonitor, quizQuestionData, handleQuizURL, startQuizTest,
    submitQuizMC, submitQuizTextAnswer, navigateQuizQuestion, jumpToQuizQuestion, flagQuizQuestion, showQuizReview,
    jumpFromReview, backFromReview, submitQuiz, downloadQuizStudentResults, showQuizResults, showStudentQuizDetail,
    exportQuizCSV, importStudentResultsFile, printQuizTest, closeQuizResults, copyQuizLinkFromResults, tvqMenu,
    openQuizMonitor, stopMonitoring, toggleMonitorPause, toggleMonitorOption, inviteStudents, finishMonitoring,
    closeQuizMonitor, openSkillsOrganizer, soInitialize, soApplyFilters, soFilterDomain, soFilterCategory,
    soFilterGrade, soSearchInput, soToggleSkill, soRenderQueuePanel, soRemoveFromQueue, soClearQueue, soPreviewHover,
    soPreviewLeave, soPreviewClick, soGeneratePreview, soRefreshPreview, soPlay, soPrint, soShare, soShowCode,
    soSelectAllVisible, soDeselectAllVisible, soUpdateCategoryDropdown, soQuiz, startMapSession, nextMapItem,
    recordMapAnswer, finalizeMapSession, releaseMapSessionScaffold, skipMapItem, mapJumpToItem, mapResumeCurrent,
    mapNavBack, mapNavForward, openMapTest, initMapSelector, startMapFromUI, selectMapTier, toggleMapBand,
    toggleMapDomain, selectAllMapBands, clearMapBands, setMapItemCount, setMapMode, printMapFromSelector,
    generateMapShareLink, copyMapShareLink, parseMapShareLink, loadMapShareLink, renderMapResults, printMapSession,
    restartMapSession, updateMapGradeContext, tvGo,
};
