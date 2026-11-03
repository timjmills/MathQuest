// ws-visual-quality --rules VQ-ONEANSWER: FAIL. fact_family_sort on the base (F2): a tick list AND a Say frame with blanks.
import { FF, FFS, ffsBase } from './vq-common.mjs';
export default { skills: [{ ...FFS, items: FF.map(([a, b]) => ffsBase(a, b)) }] };
