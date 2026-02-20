export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[payload-sanitizer] ${message}`);
  }
}
