// BAD: a table whose inner object is not frozen.
export const TABLE = Object.freeze({ inner: { add: 'Add.' } });
