export function compact<T>(arr: T[]): T[] {
  return arr.filter(Boolean);
}
