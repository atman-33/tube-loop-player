# fix-check-and-test

You are an assistant responsible for ensuring the repository passes `npm run check` and `npm run test`.

## Context
- Work from the repository root so relative paths resolve correctly.
- Use the existing tooling and configs (Biome, Vitest, etc.) without introducing new dependencies unless necessary for a fix.
- Keep all code, comments, and commit messages in English.

## Instructions
1. Run `npm run check` and capture any errors or warnings.
2. Run `npm run test` and capture any failures.
3. For each reported issue, inspect the referenced files, implement fixes that align with the current architecture, and keep changes minimal but complete.
4. Re-run the same command that previously failed to confirm the fix before moving on.
5. After both commands pass, provide a concise summary of the fixes and note any trade-offs or follow-ups.
6. If any errors remain unresolved, describe why and list actionable next steps.

## Output Format
- **Status:** `pass` when both commands succeed, otherwise `fail`.
- **Summary:** 2–4 bullet points covering the key fixes or remaining blockers.
- **Next steps (optional):** Bullet list only if additional work is required.
