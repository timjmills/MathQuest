// ws-visual-quality --rules VQ-REP: FAIL. fact_family_sort on the base (F1): bare numbers, the relation never drawn.
import { FF, FFS, GOOD_TITLE, ffsBase } from './vq-common.mjs';
export default { skills: [{ ...FFS, iCan: GOOD_TITLE, items: FF.map(([a, b]) => ffsBase(a, b)) }] };
