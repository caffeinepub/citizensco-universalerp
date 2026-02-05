# Specification

## Summary
**Goal:** Wire wallet-domain state persistence and migration into the canister upgrade lifecycle so state can be safely round-tripped across upgrades.

**Planned changes:**
- Add `system preupgrade` and `system postupgrade` hooks (or the project’s equivalent) in `backend/main.mo` to persist and restore wallet-domain state across upgrades.
- Ensure `backend/main.mo` routes restored (legacy) wallet-domain state through `migration.run(...)` during `postupgrade` and uses the returned value as the post-migration wallet-domain state.
- Create/ensure `backend/migration.mo` exists and exports a stable, forward-compatible `run(...)` function that accepts pre-upgrade wallet-domain state and returns post-migration (organization-scoped) wallet-domain state.
- Keep all existing non-migration public APIs unchanged (same signatures) and compiling/deploying.

**User-visible outcome:** The canister can be upgraded without trapping, and wallet-domain state is preserved and passed through a migration step during upgrade, without changing existing non-migration APIs.
