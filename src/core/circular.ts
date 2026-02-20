export function createCircularTracker() {
  const seen = new WeakSet<object>();

  return {
    has(value: object) {
      return seen.has(value);
    },
    add(value: object) {
      seen.add(value);
    },
  };
}
