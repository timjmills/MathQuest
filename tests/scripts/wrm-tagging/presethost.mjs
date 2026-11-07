// Shared by every year's lessonfit class-M check (critic 2026-10-30 Y4 finding 1, GATE-DRIFT): a PRESET skill
// (js/modules/skill-presets.js) inherits its host's whole option list, so it "offers" every host option. Class M reads
// it through its host: a preset whose host is named by the lesson, is one of the lesson's own links, or is itself in the
// pool (and so checked there) is skipped, never reported a second time under the preset's id.
import { SKILL_PRESETS } from '../../../js/modules/skill-presets.js';
export const hostKey = k => { const p = SKILL_PRESETS[k]; return p ? `${k.split(':')[0]}:${p.skill}` : null; };
export function presetCovered(k, isNamed, mine, pool) {
  const h = hostKey(k); if (!h) return false;
  const [c, sk] = h.split(':');
  return isNamed(c, sk) || mine.some(e => e.key === h) || (pool ? pool.has(h) : false);
}
