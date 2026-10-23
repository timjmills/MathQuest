import { helper } from './helper.js';
import { helper2 } from './helper2.js';
const RE = /\/\*not a comment[/]`/g;
export function a() { return helper() + `${helper2()} }` + RE.source; }
