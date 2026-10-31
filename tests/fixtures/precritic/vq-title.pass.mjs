// ws-visual-quality --rules VQ-TITLE: OK. A sentence written for the skill (VISUAL_QUALITY §4.4).
import { FF, FFS, GOOD_TITLE, ffsFixed } from './vq-common.mjs';
export default { skills: [{ ...FFS, iCan: GOOD_TITLE, items: FF.map(([a, b]) => ffsFixed(a, b)) }] };
