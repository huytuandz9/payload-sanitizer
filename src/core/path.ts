export type KeyPath = Array<string | number>;

export function toKeyPath(path: string | KeyPath): KeyPath {
  if (Array.isArray(path)) return path;
  if (path.trim() === "") return [];
  return path.split(".").map((seg) => {
    const n = Number(seg);
    return Number.isInteger(n) && String(n) === seg ? n : seg;
  });
}

export function pathEquals(a: KeyPath, b: KeyPath): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function hasPath(
  list: Array<string | KeyPath> | undefined,
  path: KeyPath,
): boolean {
  if (!list || list.length === 0) return false;
  for (const item of list) {
    if (pathEquals(toKeyPath(item), path)) return true;
  }
  return false;
}
