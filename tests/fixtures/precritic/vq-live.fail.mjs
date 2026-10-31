// ws-visual-quality --rules VQ-LIVE: FAIL. add_wp_20_plain on the base (VISUAL_QUALITY W1-W3): + − × ÷ on a Grade 1
// add page, a column digit grid on sums to 20, a unit bank of filler words.
import { WP, WPS, wpBase } from './vq-common.mjs';
export default { skills: [{ ...WPS, items: WP.map(([a, b]) => wpBase(a, b)) }] };
