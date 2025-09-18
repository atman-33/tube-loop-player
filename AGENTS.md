# AGENTS.md — Kiro for Codex

This file defines the agent contract and serves as the index to project guidance. It applies repo-wide unless overridden by a nested AGENTS.md.

## Steering Documents
- Use Steering as the first-party source for product, technical, and structural guidance.
- Locate Steering docs under `.codex/steering/product.md`, `.codex/steering/tech.md`, `.codex/steering/structure.md`.
- Summarize relevant Steering points in outputs and cite the specific file/section without restating details.

## Decision Precedence
1) Steering documents under ".codex/steering/*.md"
2) This AGENTS.md contract (general repository conventions)
3) Generic assumptions (avoid unless explicitly allowed)

## Agent Behavior Contract
- Defer to Steering for naming, boundaries, and directory layout specifics.

## Paths & I/O
- Prefer `vscode.workspace.fs` for workspace I/O.
- Write only within `.codex/**`, the workspace, or approved VS Code storage.
- Keep `.codex/steering` immutable; submit changes through feature flows.

## CLI Integration
- Reference approval modes and model flags at their definition sites/tests; avoid duplicating values.
- Verify `Codex` availability before invocation and surface setup guidance if unavailable.

## Submission Checklist (For Agents)
- Verify decisions against `.codex/steering/*.md` and cite sections without duplication.
- Keep AGENTS.md concise, reference-first, and free of Steering or constant duplication.

## Non-Goals / Anti-Patterns
- Do not persist state in globals beyond established singletons.
- Do not write outside approved directories or overwrite Steering manually.
- Do not re-enable disabled features unless explicitly requested.

## Instructions to Apply
- Write or update `AGENTS.md` at the repository root using this structure.
- Update any existing `AGENTS.md` in place to match this contract without duplicating Steering content.
