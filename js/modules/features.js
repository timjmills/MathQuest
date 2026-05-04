// Feature flags for the unified Quest platform.
//
// LITERACY_QUEST_ENABLED gates every Reading Quest, Language Quest, and
// Literacy MAP Quest route, view, and component. Default is false so
// production users (master branch on math.cultivatingthedigital.org) see
// only Math Quest.
//
// Toggle to true after Phase 3 pre-merge checklist is complete and the user
// has approved the rollout. The flag stays in the codebase as a permanent
// kill switch — flipping it back to false hides Literacy Quest globally
// without code rollback.
//
// Usage:
//   import { FEATURES } from './features.js';
//   if (FEATURES.LITERACY_QUEST_ENABLED) { ... }

export const FEATURES = Object.freeze({
    LITERACY_QUEST_ENABLED: true,
});
