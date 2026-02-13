# Contributing

Thanks for considering a contribution!

## Quick start

```bash
pnpm install
pnpm test
pnpm build
```

## Development workflow

- `pnpm dev` — watch/compile with tsup.
- Add/adjust tests in `test/`.
- Keep the library zero-dependency and small.
- Maintain backward compatibility unless bumping a major version.

## Pull requests

- Describe the problem and the change.
- Include tests that cover the behavior change.
- Update docs (README, API examples) when relevant.

## Coding guidelines

- Prefer simple, readable code over clever tricks.
- Avoid introducing new runtime deps; dev deps are fine when justified.
- Ensure `pnpm test` and `pnpm build` pass before submitting.
