# Specification

## Summary
**Goal:** Add a minimal, compile-safe canister upgrade migration scaffold to migrate legacy (pre-organization-scoped) wallet-domain state into the current organization-scoped wallet-domain structures.

**Planned changes:**
- Add a new Motoko module at `backend/migration.mo` exporting a stable `run(...)` entrypoint for upgrade migrations, initially implemented as a safe no-op/pass-through.
- Update `backend/main.mo` to include minimal stable upgrade hooks/plumbing that persists wallet-domain state across upgrades and invokes `migration.run(...)` during the upgrade flow.
- Persist the post-migration (organization-scoped) wallet-domain state after upgrade without changing unrelated public APIs or breaking existing behavior.

**User-visible outcome:** Canister upgrades preserve wallet-domain state and execute a migration step (currently a safe no-op) without changing existing app functionality or public method signatures.
