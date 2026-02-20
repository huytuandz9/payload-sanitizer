# payload-sanitizer

Tiny zero-dependency payload sanitizer for JS/TS.

## Install

```bash
pnpm add payload-sanitizer
```

## Basic Usage

```ts
import { sanitize } from "payload-sanitizer";

const clean = sanitize(
  { q: "  hello ", status: "-", page: 1 },
  { drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"] },
);

// { q: "hello", page: 1 }
```

## v0.3.0 Highlights

- debug system (global + per-call)
- circular reference protection
- strict option validation
- utility helpers: `pick`, `omit`, `isEmpty`, `compact`, `diff`, `safeParse`
- ESM/CJS/IIFE builds for package and CDN usage

## Debug

```ts
import { configureDebug, sanitize } from "payload-sanitizer";

configureDebug({ debug: true });
sanitize({ q: " " });
```

## Utility Helpers

```ts
import { pick, omit, isEmpty, compact, diff, safeParse } from "payload-sanitizer";
```

## Express Middleware Example

```ts
import type { RequestHandler } from "express";
import { sanitizeWith } from "payload-sanitizer";

const sanitize = sanitizeWith({
  deep: true,
  trimStrings: true,
  cleanArrays: true,
  drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
  dropEmptyObjects: true,
  dropEmptyArrays: true,
});

export const sanitizePayload: RequestHandler = (req, _res, next) => {
  if (req.body && typeof req.body === "object") req.body = sanitize(req.body);
  if (req.query && typeof req.query === "object") req.query = sanitize(req.query) as any;
  if (req.params && typeof req.params === "object") req.params = sanitize(req.params) as any;
  next();
};
```
