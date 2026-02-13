# payload-sanitizer

Tiny zero-dependency payload sanitizer for JS/TS — frontend + backend.

## Install

```bash
pnpm add payload-sanitizer
# or npm i payload-sanitizer
```

## Quick example

```ts
import { sanitize } from "payload-sanitizer";

const clean = sanitize(
  { q: "  hello ", status: "-", page: 1 },
  { drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"] },
);
// -> { q: "hello", page: 1 }
```

## Express middleware

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

// Express app
app.use(sanitizePayload);
```
