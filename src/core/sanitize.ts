import { createCircularTracker } from "./circular";
import type { DebugOptions } from "./debug";
import { emitDebug } from "./debug";
import { assert, isPlainObject } from "./guards";
import { hasPath, type KeyPath } from "./path";
import { DEFAULT_DROP, type DropPreset, shouldDropPreset } from "./presets";

export type SanitizeOptions = DebugOptions & {
  deep?: boolean;
  trimStrings?: boolean;
  cleanArrays?: boolean;
  drop?: DropPreset[];
  keepKeys?: string[];
  dropKeys?: string[];
  dropValues?: unknown[];
  keepPaths?: Array<string | KeyPath>;
  dropPaths?: Array<string | KeyPath>;
  shouldDrop?: (value: unknown, keyPath: KeyPath) => boolean;
  dropEmptyObjects?: boolean;
  dropEmptyArrays?: boolean;
  strict?: boolean;
};

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

function normalizeValue(value: unknown, trim: boolean): unknown {
  if (typeof value === "string" && trim) {
    return value.trim();
  }
  return value;
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

function validateStrict(options: SanitizeOptions): void {
  assert(
    options.drop === undefined || Array.isArray(options.drop),
    "`drop` must be an array",
  );
  assert(
    options.keepKeys === undefined || Array.isArray(options.keepKeys),
    "`keepKeys` must be an array",
  );
  assert(
    options.dropKeys === undefined || Array.isArray(options.dropKeys),
    "`dropKeys` must be an array",
  );
  assert(
    options.dropValues === undefined || Array.isArray(options.dropValues),
    "`dropValues` must be an array",
  );
  assert(
    options.keepPaths === undefined || Array.isArray(options.keepPaths),
    "`keepPaths` must be an array",
  );
  assert(
    options.dropPaths === undefined || Array.isArray(options.dropPaths),
    "`dropPaths` must be an array",
  );
  assert(
    options.shouldDrop === undefined || typeof options.shouldDrop === "function",
    "`shouldDrop` must be a function",
  );
}

function sanitizeImpl<T>(payload: T, options: SanitizeOptions = {}): T {
  const merged = {
    ...DEFAULT_OPTIONS,
    ...options,
    drop: options.drop ?? DEFAULT_OPTIONS.drop,
  };

  if (merged.strict) {
    validateStrict(merged);
  }

  const circular = createCircularTracker();

  function walk(input: unknown, path: KeyPath): unknown {
    const normalized = normalizeValue(input, merged.trimStrings);

    emitDebug(merged, {
      type: "normalize",
      path,
      original: input,
      result: normalized,
    });

    if (hasPath(merged.dropPaths, path)) {
      emitDebug(merged, { type: "drop", path, original: normalized });
      return undefined;
    }

    const isKeptPath = hasPath(merged.keepPaths, path);

    if (isKeptPath) {
      emitDebug(merged, { type: "keep", path, original: normalized });
    } else {
      if (shouldDropPreset(normalized, merged.drop)) {
        emitDebug(merged, { type: "drop", path, original: normalized });
        return undefined;
      }

      if (shouldDropExact(normalized, merged.dropValues)) {
        emitDebug(merged, { type: "drop", path, original: normalized });
        return undefined;
      }

      if (merged.shouldDrop?.(normalized, path)) {
        emitDebug(merged, { type: "drop", path, original: normalized });
        return undefined;
      }
    }

    if (Array.isArray(normalized)) {
      if (circular.has(normalized)) {
        emitDebug(merged, { type: "circular-skip", path, original: normalized });
        return normalized;
      }
      circular.add(normalized);

      if (!merged.cleanArrays) return normalized.slice();

      const out: unknown[] = [];
      for (let i = 0; i < normalized.length; i++) {
        const next = walk(normalized[i], path.concat(i));
        if (next !== undefined) out.push(next);
      }

      if (merged.dropEmptyArrays && out.length === 0) {
        emitDebug(merged, { type: "empty-array", path, original: normalized });
        return undefined;
      }

      return out;
    }

    if (isPlainObject(normalized)) {
      if (circular.has(normalized)) {
        emitDebug(merged, { type: "circular-skip", path, original: normalized });
        return normalized;
      }
      circular.add(normalized);

      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(normalized)) {
        if (hasKey(merged.dropKeys, k)) continue;

        if (hasKey(merged.keepKeys, k)) {
          emitDebug(merged, { type: "keep", path: path.concat(k), original: v });
          out[k] = v;
          continue;
        }

        if (!merged.deep && isPlainObject(v)) {
          out[k] = v;
          continue;
        }

        const next = walk(v, path.concat(k));
        if (next !== undefined) out[k] = next;
      }

      if (merged.dropEmptyObjects && Object.keys(out).length === 0) {
        emitDebug(merged, { type: "empty-object", path, original: normalized });
        return undefined;
      }

      return out;
    }

    return normalized;
  }

  const result = walk(payload, []);

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
    sanitizeImpl(payload, { ...baseOptions, ...options });
};

export const sanitize: SanitizerFn = Object.assign(sanitizeImpl, {
  with: (baseOptions: SanitizeOptions = {}) => createSanitizer(baseOptions),
});

export const sanitizeWith = sanitize.with;
