// js/modules/sheet/providers/titles.js
// The "I Can" titles of skills that have no family provider yet (wave 1 lane D, critic r3 D9,
// D10, D13; LESSONS L6: the title is the provider's string, never a pasted label).
//
// Without a provider the page built the title from the category verb plus the label, which read
// "I Can divide missing factors ×/÷", "I Can work on all counting & cardinality" and "I Can
// divide zero in the quotient". Each entry here keeps EVERY other default string (instruction
// key, steps) exactly as the default adapter derives it and replaces only `iCan`, so no page
// changes but its title.
//
// Pure module (SCC-01).

import { registerSkill } from '../contract.js';
import { defaultStrings } from '../adapters.js';

const TITLES = {
    'division:missing_mult_div': 'I Can find the missing number (×, ÷)',
    'division:div_zero_in_quotient': 'I Can divide when the quotient has a zero',
    'composing:mixed_composing': 'I Can review number sense',
    'counting_mixed:counting_all': 'I Can review counting and cardinality',
    'addition:number_families_add': 'I Can complete a number family (+, −)',
    'multiplication:number_families_mult': 'I Can complete a number family (×, ÷)',
    'addition:add_sub_10s': 'I Can add and subtract 10s',
};

for (const [key, iCan] of Object.entries(TITLES)) {
    const [categoryId, skillId] = key.split(':');
    registerSkill(key, {
        strings: (ref = {}) => Object.assign(
            defaultStrings(Object.assign({ categoryId, skillId }, ref)),
            { iCan, iCanIsVerb: true },
        ),
    });
}

export const TITLE_PROVIDER_IDS = Object.freeze(Object.keys(TITLES));
