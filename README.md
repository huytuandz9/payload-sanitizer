# payload-sanitizer

[![npm version](https://img.shields.io/npm/v/payload-sanitizer.svg)](https://www.npmjs.com/package/payload-sanitizer)
[![npm downloads](https://img.shields.io/npm/dm/payload-sanitizer.svg)](https://www.npmjs.com/package/payload-sanitizer)
[![license](https://img.shields.io/npm/l/payload-sanitizer.svg)](./LICENSE)

[![CI](https://github.com/mohit838/payload-sanitizer/actions/workflows/ci.yml/badge.svg)](https://github.com/mohit838/payload-sanitizer/actions/workflows/ci.yml)

Tiny zero‑dependency sanitizer for JS/TS payloads that removes common junk (empty strings, whitespace-only strings, `null`, `undefined`, optional dash marker, `NaN`) without mutating the original value. Works in both frontend and backend code.

[Docs](https://mohit838.github.io/payload-sanitizer/) · [npm](https://www.npmjs.com/package/payload-sanitizer)

## Install

```bash
# pnpm
pnpm add payload-sanitizer

# npm
npm i payload-sanitizer

# yarn
yarn add payload-sanitizer
```

## Quick start

```ts
import { sanitize } from "payload-sanitizer";

const input = {
  trxId: "",
  status: "-",
  fromDate: " 2026-02-01 ",
  toDate: null,
  page: 1,
  includeInactive: false,
};

const clean = sanitize(input, {
  drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
});

console.log(clean);
// {
//   fromDate: "2026-02-01",
//   page: 1,
//   includeInactive: false
// }
```

See `examples/` for frontend + backend usage.

## Why this instead of validation libraries?

Validation libs (e.g., Zod) parse **against a schema**. `payload-sanitizer` just **cleans/normalizes** data with simple rules—no schema required. They pair well:

```ts
const cleaned = sanitize(formValues);
const parsed = schema.parse(cleaned);
```

## API

### `sanitize(payload, options?)`

Returns a cleaned clone of `payload` (objects and arrays) without mutating the input.

**Options**

- `deep` (default `true`): recurse into nested objects.
- `trimStrings` (default `true`): `value.trim()` on strings before checks.
- `cleanArrays` (default `true`): sanitize array items and drop ones that should be removed.
- `drop` (defaults to `["undefined","null","emptyString","whitespaceString"]`): presets to remove. Presets: `"undefined" | "null" | "emptyString" | "whitespaceString" | "dash" | "nan"`.
- `dropEmptyObjects` (default `false`): remove objects that become empty after sanitizing.
- `dropEmptyArrays` (default `false`): remove arrays that become empty after sanitizing.
- `keepKeys`: key names to always keep even if value looks droppable.
- `keepPaths`: exact paths to always keep (e.g., `"filters.status"`).
- `dropKeys`: key names to always remove.
- `dropPaths`: exact paths to always drop (e.g., `"meta.debug"`).
- `dropValues`: explicit values to remove (uses `Object.is`).
- `shouldDrop(value, keyPath)`: custom predicate; return `true` to drop. `keyPath` is an array of keys/indexes from root.

Notes:

- `0`, `false`, and `""` inside `keepKeys` are preserved by design.
- If everything is dropped, arrays become `[]`, objects become `{}`; primitives are returned as-is.

Example with empty-object/array dropping:

```ts
sanitize(payload, {
  drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
  dropEmptyObjects: true,
  dropEmptyArrays: true,
});
```

Example with path-based rules:

```ts
sanitize(payload, {
  keepPaths: ["filters.status"],
  dropPaths: ["meta.debug"],
});
```

### `sanitize.with(baseOptions)`

Creates a preconfigured sanitizer.

```ts
const sanitizeSearch = sanitize.with({
  drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
});

sanitizeSearch({ q: "  hello ", status: "-" });
// { q: "hello" }
```

### `createSanitizer(baseOptions)`

Factory equivalent to `sanitize.with`.

```ts
import { createSanitizer } from "payload-sanitizer";
const sanitizePayload = createSanitizer({ deep: true });
```

## Common patterns

- **Frontend forms** — clean before sending:
  ```ts
  await api.post("/search", sanitize(values));
  ```
- **Backend filters** — strip empty query params:
  ```ts
  const filters = sanitize(req.query, { drop: ["dash"] });
  db.find(filters);
  ```
- **Custom rule** — drop empty `filters` objects:
  ```ts
  sanitize(payload, {
    shouldDrop: (value, path) =>
      path.at(-1) === "filters" &&
      typeof value === "object" &&
      value !== null &&
      Object.keys(value as any).length === 0,
  });
  ```
- **Drop exact values**:
  ```ts
  sanitize(data, { dropValues: ["N/A", Number.NaN] });
  ```

## Development

```bash
pnpm install
pnpm test
pnpm build
```

## Contributing

Contributions are welcome!  
If you have ideas, edge cases, or want to improve performance/docs, please open an issue or PR.

- Read: `CONTRIBUTING.md`
- Report bugs: GitHub Issues
- Feature requests: GitHub Issues

## License

MIT
