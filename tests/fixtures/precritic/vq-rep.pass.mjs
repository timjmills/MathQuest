// ws-visual-quality --rules VQ-REP: OK. The three numbers drawn in a kit family cell.
import { FF, FFS, GOOD_TITLE, ffsFixed } from './vq-common.mjs';
export default { skills: [{ ...FFS, iCan: GOOD_TITLE, items: FF.map(([a, b]) => ffsFixed(a, b)) }] };
