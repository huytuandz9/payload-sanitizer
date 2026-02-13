export type DropPreset =
  | "null"
  | "undefined"
  | "emptyString"
  | "whitespaceString"
  | "dash"
  | "nan";

export type KeyPath = Array<string | number>;

export type SanitizeOptions = {
  deep?: boolean;
  trimStrings?: boolean;
  cleanArrays?: boolean;
  drop?: DropPreset[];
  keepKeys?: string[];
  dropKeys?: string[];
  dropValues?: unknown[];
  /**
   * Always keep these paths (even if value is droppable).
   * Supports "a.b.c" or ["a","b","c"].
   */
  keepPaths?: Array<string | KeyPath>;
  /**
   * Always drop these paths (even if value is meaningful).
   * Supports "a.b.c" or ["a","b","c"].
   */
  dropPaths?: Array<string | KeyPath>;
  shouldDrop?: (value: unknown, keyPath: KeyPath) => boolean;
  /**
   * Drop objects that become empty after sanitizing.
   * Default: false
   */
  dropEmptyObjects?: boolean;

  /**
   * Drop arrays that become empty after sanitizing.
   * Default: false
   */
  dropEmptyArrays?: boolean;
};

const DEFAULT_DROP: DropPreset[] = [
  "undefined",
  "null",
  "emptyString",
  "whitespaceString",
];

const DEFAULT_OPTIONS = {
  deep: true,
  trimStrings: true,
  cleanArrays: true,
  dropEmptyObjects: false,
  dropEmptyArrays: false,
  drop: DEFAULT_DROP,
} satisfies Required<
  Pick<
    SanitizeOptions,
    | "deep"
    | "trimStrings"
    | "cleanArrays"
    | "dropEmptyObjects"
    | "dropEmptyArrays"
  >
> & { drop: DropPreset[] };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function normalizeValue(value: unknown, opts: typeof DEFAULT_OPTIONS) {
  if (typeof value === "string" && opts.trimStrings) {
    return value.trim();
  }
  return value;
}

function shouldDropPreset(value: unknown, drop: DropPreset[]): boolean {
  for (const d of drop) {
    switch (d) {
      case "undefined":
        if (value === undefined) return true;
        break;
      case "null":
        if (value === null) return true;
        break;
      case "emptyString":
        if (value === "") return true;
        break;
      case "whitespaceString":
        // only matters if trimStrings is false; but still safe:
        if (typeof value === "string" && value.trim() === "") return true;
        break;
      case "dash":
        if (value === "-") return true;
        break;
      case "nan":
        if (typeof value === "number" && Number.isNaN(value)) return true;
        break;
    }
  }
  return false;
}

function shouldDropExact(value: unknown, exactValues?: unknown[]): boolean {
  if (!exactValues || exactValues.length === 0) return false;
  for (const v of exactValues) {
    if (Object.is(value, v)) return true;
  }
  return false;
}

function hasKey(list: string[] | undefined, key: string): boolean {
  return !!list && list.includes(key);
}

function toKeyPath(path: string | KeyPath): KeyPath {
  if (Array.isArray(path)) return path;
  if (path.trim() === "") return [];
  return path.split(".").map((seg) => {
    const n = Number(seg);
    return Number.isInteger(n) && String(n) === seg ? n : seg;
  });
}

function pathEquals(a: KeyPath, b: KeyPath): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function hasPath(list: Array<string | KeyPath> | undefined, path: KeyPath): boolean {
  if (!list || list.length === 0) return false;
  for (const item of list) {
    if (pathEquals(toKeyPath(item), path)) return true;
  }
  return false;
}

function sanitizeAny(
  input: unknown,
  options: typeof DEFAULT_OPTIONS & SanitizeOptions,
  path: KeyPath,
): unknown {
  const normalized = normalizeValue(input, options);

  // Path-based overrides (highest priority)
  if (hasPath(options.dropPaths, path)) return undefined;

  const isKeptPath = hasPath(options.keepPaths, path);

  if (!isKeptPath) {
    if (shouldDropPreset(normalized, options.drop)) return undefined;
    if (shouldDropExact(normalized, options.dropValues)) return undefined;
    if (options.shouldDrop?.(normalized, path)) return undefined;
  }

  if (Array.isArray(normalized)) {
    if (!options.cleanArrays) return normalized.slice();
    const out: unknown[] = [];
    for (let i = 0; i < normalized.length; i++) {
      const next = sanitizeAny(normalized[i], options, path.concat(i));
      if (next !== undefined) out.push(next);
    }
    if (options.dropEmptyArrays && out.length === 0) return undefined;
    return out;
  }

  if (isPlainObject(normalized)) {
    if (!options.deep) {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(normalized)) {
        if (hasKey(options.dropKeys, k)) continue;
        if (hasKey(options.keepKeys, k)) {
          out[k] = v;
          continue;
        }
        const next = sanitizeAny(v, options, path.concat(k));
        if (next !== undefined) out[k] = next;
      }
      if (options.dropEmptyObjects && Object.keys(out).length === 0)
        return undefined;
      return out;
    }

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(normalized)) {
      if (hasKey(options.dropKeys, k)) continue;

      if (hasKey(options.keepKeys, k)) {
        out[k] = v;
        continue;
      }

      const next = sanitizeAny(v, options, path.concat(k));
      if (next !== undefined) out[k] = next;
    }
    if (options.dropEmptyObjects && Object.keys(out).length === 0)
      return undefined;
    return out;
  }

  return normalized;
}

export function sanitize<T>(payload: T, options: SanitizeOptions = {}): T {
  const merged = {
    ...DEFAULT_OPTIONS,
    ...options,
    drop: options.drop ?? DEFAULT_OPTIONS.drop,
  };

  const result = sanitizeAny(
    payload,
    merged as typeof DEFAULT_OPTIONS & SanitizeOptions,
    [],
  );

  if (result === undefined) {
    if (isPlainObject(payload)) return {} as T;
    if (Array.isArray(payload)) return [] as T;
    return payload;
  }

  return result as T;
}

type SanitizerFn = {
  <T>(payload: T, options?: SanitizeOptions): T;
  with: (baseOptions?: SanitizeOptions) => ReturnType<typeof createSanitizer>;
};

export const createSanitizer = (baseOptions: SanitizeOptions = {}) => {
  return <T>(payload: T, options: SanitizeOptions = {}) =>
    sanitize(payload, { ...baseOptions, ...options });
};

(sanitize as SanitizerFn).with = (baseOptions: SanitizeOptions = {}) =>
  createSanitizer(baseOptions);

export const sanitizeWith = (sanitize as SanitizerFn).with;
