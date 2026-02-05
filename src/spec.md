# Specification

## Summary
**Goal:** Make wallet-domain state persist safely across canister upgrades using preupgrade/postupgrade hooks and a migration step, without breaking existing unrelated public APIs.

**Planned changes:**
- Add `system func preupgrade` / `system func postupgrade` in `backend/main.mo` to save and restore wallet-domain state via stable storage.
- Route restored (legacy) wallet-domain state through `migration.run(...)` during `postupgrade` to produce the current (organization-scoped) wallet-domain state.
- Ensure `backend/migration.mo` exists and exports a forward-compatible, version-tolerant `run(...)` function that safely handles both empty/fresh state and existing legacy state.

**User-visible outcome:** Wallet-related state is preserved across backend upgrades, with automatic migration to the current wallet-domain state shape while existing non-migration APIs continue to work as before.
