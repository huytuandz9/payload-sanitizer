import type { KeyPath } from "./path";

export type DebugEventType =
  | "normalize"
  | "drop"
  | "keep"
  | "empty-object"
  | "empty-array"
  | "circular-skip";

export interface DebugEvent {
  type: DebugEventType;
  path: KeyPath;
  original: unknown;
  result?: unknown;
}

export type DebugOptions = {
  debug?: boolean;
  logger?: (event: DebugEvent) => void;
};

let globalDebugOptions: DebugOptions = {};

export function configureDebug(options: DebugOptions = {}): void {
  globalDebugOptions = { ...globalDebugOptions, ...options };
}

export function getDebugOptions(): DebugOptions {
  return globalDebugOptions;
}

export function resetDebug(): void {
  globalDebugOptions = {};
}

function resolveDebugOptions(opts: DebugOptions): Required<DebugOptions> {
  return {
    debug: opts.debug ?? globalDebugOptions.debug ?? false,
    logger: opts.logger ?? globalDebugOptions.logger ?? defaultLogger,
  };
}

function defaultLogger(event: DebugEvent): void {
  const c = (globalThis as { console?: { log: (...args: unknown[]) => void } })
    .console;
  c?.log("[payload-sanitizer]", event);
}

export function emitDebug(opts: DebugOptions, event: DebugEvent): void {
  const resolved = resolveDebugOptions(opts);
  if (!resolved.debug) return;
  resolved.logger(event);
}
