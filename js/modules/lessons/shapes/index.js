// js/modules/lessons/shapes/index.js
// THE LESSON SHAPES (E4, design/lessons/SHAPES.md): what is common to every lesson of one shape, so a
// lesson card holds only what is its own. The five shapes certified by the passed long lessons:
//   forms          read / write a number in its forms                 (lesson 1, g2-nbt3-read-write-1000)
//   bar-story      a bar-model word problem                           (lesson 2, g1-oa1-bar-model-wp-20)
//   property       a property of an operation                         (lesson 3a, g3-oa5-mult-properties)
//   table-pattern  a pattern on a table (the multiplication chart)    (lesson 4, g3-oa9-mult-table-patterns)
//   rule-table     a rule table (input-output)                        (lesson 5, g3-oa9-input-output-rule)
// Lessons 6 and 7 are the hold-outs: no shape here was shaped on them (SHAPES.md gives them `forms` and
// `bar-story`, the nearest passed shapes, and DIFF.md records what compiled).
//
// A shape holds:
//   archetype   the library archetype (lessons/schema.js ARCHETYPES) its routine carries
//   templates   the kit templates its pages draw (SHAPES.md lists them; a lesson whose template is not built
//               waits for it)
//   readers     the item readers (./readers.js) its placeholders read
//   minutes     the default 60-minute budget, section -> minutes (a card's `timing` overrides it)
//   chunked     whether the shape teaches two I Do / We Do cycles by default
//   noun        what the Check Question asks about ("which is right" for every shape, owner Q9)
// Pure module (SCC-01): no DOM, no window, no state, no Math.random.

export const SHAPES = Object.freeze({
    forms: {
        name: 'read / write a number in its forms',
        archetype: 'pv',
        templates: ['pv', 'number-word', 'equation'],
        readers: ['hto'],
        exemplar: 'g2-nbt3-read-write-1000',
        minutes: { 1: 6, 2: 5, 3: 4, 4: 2, '5a': 5, '6a': 4, '5b': 5, '6b': 4, 7: 3, 8: 9, 9: 5, 10: 4, transitions: 4 },
    },
    'bar-story': {
        name: 'a bar-model word problem',
        archetype: 'story',
        templates: ['word-work', 'bar-model'],
        // (twoStep added after the hold-out run of lesson 7: a story shape reads one- and two-step stories; it returns
        // nothing for a one-step story, so lesson 2 is unchanged)
        readers: ['barStory', 'twoStep'],
        exemplar: 'g1-oa1-bar-model-wp-20',
        minutes: { 1: 5, 2: 4, 3: 3, 4: 2, 5: 10, 6: 8, 7: 3, 8: 10, 9: 6, 10: 5, transitions: 4 },
    },
    property: {
        name: 'a property of an operation',
        archetype: 'groups',
        templates: ['arrays', 'equation'],
        readers: ['arrayTurn'],
        exemplar: 'g3-oa5-mult-properties',
        minutes: { 1: 6, 2: 5, 3: 4, 4: 2, 5: 10, 6: 8, 7: 3, 8: 9, 9: 5, 10: 4, transitions: 4 },
    },
    'table-pattern': {
        name: 'a pattern on a table',
        archetype: 'fact',
        templates: ['mult-grid', 'fact'],
        readers: ['chartWindow'],
        exemplar: 'g3-oa9-mult-table-patterns',
        minutes: { 1: 5, 2: 5, 3: 3, 4: 2, 5: 10, 6: 8, 7: 3, 8: 11, 9: 5, 10: 4, transitions: 4 },
    },
    'rule-table': {
        name: 'a rule table',
        archetype: 'partwhole',
        templates: ['function-table'],
        readers: ['ruleTable'],
        exemplar: 'g3-oa9-input-output-rule',
        minutes: { 1: 5, 2: 5, 3: 3, 4: 1, 5: 10, 6: 8, 7: 3, 8: 12, 9: 5, 10: 4, transitions: 4 },
    },
});

export const SHAPE_IDS = Object.freeze(Object.keys(SHAPES));

/** The shape a card names, or null. */
export const shapeOf = (id) => SHAPES[String(id || '')] || null;

export default { SHAPES, SHAPE_IDS, shapeOf };
