// Feature flags for Math Quest.
//
// Literacy Quest moved to its own project (~\Desktop\LiteracyQuest); the
// flag is left here as `false` so any leftover references resolve cleanly.
// Safe to delete the export entirely once you confirm nothing imports it.

export const FEATURES = Object.freeze({
    LITERACY_QUEST_ENABLED: false,
});
