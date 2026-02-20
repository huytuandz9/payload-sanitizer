# Changelog

## 0.3.0 - 2026-02-20

- add modular core structure under `src/core`
- add debug system with global and per-instance options
- add circular reference protection
- add strict option validation (`strict: true`)
- add utility APIs: `pick`, `omit`, `isEmpty`, `compact`, `diff`, `safeParse`
- add IIFE build output for CDN/global usage
- preserve backward compatible sanitizer APIs (`sanitize`, `sanitize.with`, `createSanitizer`, `sanitizeWith`)
- expand tests for new features and utilities

## 0.2.0

- add keep/drop path support
- add drop empty objects/arrays options

## 0.1.0

- initial release
