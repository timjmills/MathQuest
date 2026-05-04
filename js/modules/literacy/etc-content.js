// etc-content.js — Explode the Code (EPS) corpus accessor.
//
// Wraps data/literacy-content/reading/etc/scope-and-sequence.js and exposes
// helpers for the generators / skill browser:
//
//   - getEtcBook(key)                       → book definition
//   - getEtcSkillsForBook(key)              → string[]
//   - getEtcSampleWordsForBook(key)         → string[]
//   - getEtcArchetype(id)                   → archetype object
//   - getEtcArchetypesForBook(bookKey)      → archetypes that appear in this book
//   - getBtcStories(key)                    → BTC chapter stories
//   - getBtcSightWords(key)                 → BTC sight words
//   - getEtcStats()                         → counts
//   - getAllEtcSampleWords()                → flat unique sample-word list

import {
    ETC_SCOPE,
    BTC_BOOKS,
    ETC_ARCHETYPES,
    ETC_INSTRUCTION_LEXICON,
    ETC_LESSON_ROUTINE,
    getEtcStats as _getEtcStats,
    getAllEtcSampleWords as _allSamples,
    getAllBtcSightWords as _allBtcSight,
} from '../../../data/literacy-content/reading/etc/scope-and-sequence.js';

export function getEtcBook(key) {
    return ETC_SCOPE[key] || null;
}

export function getEtcSkillsForBook(key) {
    const book = ETC_SCOPE[key];
    return (book && Array.isArray(book.skills)) ? book.skills : [];
}

export function getEtcSampleWordsForBook(key) {
    const book = ETC_SCOPE[key];
    return (book && Array.isArray(book.sample_words)) ? book.sample_words : [];
}

export function getEtcArchetype(id) {
    return ETC_ARCHETYPES.find(a => a.id === id) || null;
}

export function getEtcArchetypesForBook(bookKey) {
    const bookId = bookKey.replace(/^book_/, '').replace(/^primer_/, '').toUpperCase();
    return ETC_ARCHETYPES.filter(a =>
        a.books.includes(bookId) ||
        a.books.includes(bookId.toLowerCase()) ||
        a.books.includes('all')
    );
}

export function getBtcStories(key) {
    const book = BTC_BOOKS[key];
    return (book && Array.isArray(book.stories)) ? book.stories : [];
}

export function getBtcSightWords(key) {
    const book = BTC_BOOKS[key];
    return (book && Array.isArray(book.sight_words)) ? book.sight_words : [];
}

export function getEtcInstructionLexicon() {
    return ETC_INSTRUCTION_LEXICON;
}

export function getEtcLessonRoutine() {
    return ETC_LESSON_ROUTINE;
}

export function getEtcStats() {
    return _getEtcStats();
}

export function getAllEtcSampleWords() {
    return _allSamples();
}

export function getAllBtcSightWords() {
    return _allBtcSight();
}

export { ETC_SCOPE, BTC_BOOKS, ETC_ARCHETYPES };
