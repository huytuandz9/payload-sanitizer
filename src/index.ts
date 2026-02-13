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
  shouldDrop?: (value: unknown, keyPath: KeyPath) => boolean;
};

const DEFAULT_DROP: DropPreset[] = [
  "undefined",
  "null",
  "emptyString",
  "whitespaceString",
];

const DEFAULT_OPTIONS: Required<
  Pick<SanitizeOptions, "deep" | "trimStrings" | "cleanArrays">
> & { drop: DropPreset[] } = {
  deep: true,
  trimStrings: true,
  cleanArrays: true,
  drop: DEFAULT_DROP,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function normalizeValue(
  value: unknown,
  opts: Required<typeof DEFAULT_OPTIONS>,
) {
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

function sanitizeAny(
  input: unknown,
  options: Required<typeof DEFAULT_OPTIONS> & SanitizeOptions,
  path: KeyPath,
): unknown {
  const normalized = normalizeValue(input, options);

  if (shouldDropPreset(normalized, options.drop)) return undefined;
  if (shouldDropExact(normalized, options.dropValues)) return undefined;
  if (options.shouldDrop?.(normalized, path)) return undefined;

  if (Array.isArray(normalized)) {
    if (!options.cleanArrays) return normalized.slice();
    const out: unknown[] = [];
    for (let i = 0; i < normalized.length; i++) {
      const next = sanitizeAny(normalized[i], options, path.concat(i));
      if (next !== undefined) out.push(next);
    }
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

  const result = sanitizeAny(payload, merged, []);

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
