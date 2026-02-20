# payload-sanitizer

[![npm version](https://img.shields.io/npm/v/payload-sanitizer.svg)](https://www.npmjs.com/package/payload-sanitizer)
[![npm downloads](https://img.shields.io/npm/dm/payload-sanitizer.svg)](https://www.npmjs.com/package/payload-sanitizer)
[![license](https://img.shields.io/npm/l/payload-sanitizer.svg)](./LICENSE)

Tiny zero-dependency sanitizer for JS/TS payloads that removes common junk (`""`, whitespace-only strings, `null`, `undefined`, optional `"-"`, `NaN`) without mutating the original value.

## Install

```bash
pnpm add payload-sanitizer
# or npm i payload-sanitizer
# or yarn add payload-sanitizer
```

## Quick Start

```ts
import { sanitize } from "payload-sanitizer";

const input = {
  trxId: "",
  status: "-",
  fromDate: " 2026-02-01 ",
  toDate: null,
  page: 1,
};

const clean = sanitize(input, {
  drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
});

// { fromDate: "2026-02-01", page: 1 }
```

## API

### `sanitize(payload, options?)`

Returns a cleaned clone of payload.

Options:

- `deep` (default `true`): recurse into nested objects.
- `trimStrings` (default `true`): trim strings before checks.
- `cleanArrays` (default `true`): sanitize array items and remove dropped values.
- `drop` (default `["undefined", "null", "emptyString", "whitespaceString"]`): drop presets.
- `dropEmptyObjects` (default `false`): drop objects that become empty.
- `dropEmptyArrays` (default `false`): drop arrays that become empty.
- `keepKeys`, `dropKeys`: key-based keep/drop controls.
- `keepPaths`, `dropPaths`: exact path-based keep/drop controls.
- `dropValues`: explicit values to drop (uses `Object.is`).
- `shouldDrop(value, keyPath)`: custom drop predicate.
- `strict` (default `false`): validates option shapes and throws on invalid config.
- `debug` (default `false`): emit debug events.
- `logger(event)`: custom debug logger.

Drop presets:

`"undefined" | "null" | "emptyString" | "whitespaceString" | "dash" | "nan"`

### `sanitize.with(baseOptions)`

Create a reusable sanitizer with base options.

### `createSanitizer(baseOptions)`

Factory equivalent of `sanitize.with`.

### `sanitizeWith(baseOptions)`

Alias of `sanitize.with`.

## Debug (Global + Instance)

```ts
import { configureDebug, sanitize } from "payload-sanitizer";

configureDebug({
  debug: true,
  logger: (event) => {
    console.log(event.type, event.path.join("."));
  },
});

sanitize({ q: " " });

sanitize(
  { q: " " },
  {
    debug: true,
    logger: (event) => console.log("instance", event),
  },
);
```

Exports:

- `configureDebug(options)`
- `getDebugOptions()`
- `resetDebug()`

Debug event types:

`"normalize" | "drop" | "keep" | "empty-object" | "empty-array" | "circular-skip"`

## Circular Reference Safety

Circular references are detected and skipped safely during traversal to avoid infinite recursion.

## Utility APIs

```ts
import {
  pick,
  omit,
  isEmpty,
  compact,
  diff,
  safeParse,
} from "payload-sanitizer";
```

- `pick(obj, keys)`
- `omit(obj, keys)`
- `isEmpty(value)`
- `compact(array)`
- `diff(before, after)`
- `safeParse(json, fallback?)`

## CDN (IIFE Global)

```html
<script src="https://cdn.jsdelivr.net/npm/payload-sanitizer@0.3.0/dist/index.global.js"></script>
<script>
  const out = PayloadSanitizer.sanitize({ q: "  hello " });
  console.log(out);
</script>
```

Also available via unpkg:

`https://unpkg.com/payload-sanitizer@0.3.0/dist/index.global.js`

## Development

```bash
pnpm install
pnpm test
pnpm build
pnpm typecheck
```

## License

MIT
