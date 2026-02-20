export type ChangedEntry = {
  from: unknown;
  to: unknown;
};

export type DiffResult = {
  added: Record<string, unknown>;
  removed: Record<string, unknown>;
  changed: Record<string, ChangedEntry>;
};

export function diff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): DiffResult {
  const added: Record<string, unknown> = {};
  const removed: Record<string, unknown> = {};
  const changed: Record<string, ChangedEntry> = {};

  for (const key of Object.keys(before)) {
    if (!(key in after)) {
      removed[key] = before[key];
      continue;
    }

    if (!Object.is(before[key], after[key])) {
      changed[key] = { from: before[key], to: after[key] };
    }
  }

  for (const key of Object.keys(after)) {
    if (!(key in before)) {
      added[key] = after[key];
    }
  }

  return { added, removed, changed };
}
