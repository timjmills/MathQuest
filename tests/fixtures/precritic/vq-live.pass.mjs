// ws-visual-quality --rules VQ-LIVE: OK. The same stories as a number sentence: the sign written, no grid, no bank.
import { WP, WPS, wpFixed } from './vq-common.mjs';
export default { skills: [{ ...WPS, items: WP.map(([a, b]) => wpFixed(a, b)) }] };
