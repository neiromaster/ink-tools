---
"@ink-tools/ink-mouse": patch
"xterm-mouse": patch
---

Republish packages after pnpm migration improvements.

- Fix xterm-mouse dual-package ESM/CJS support
- Add CJS build output to tsup config
- Update package.json exports with require condition
- Add proper type definitions for CJS (.d.cts)

