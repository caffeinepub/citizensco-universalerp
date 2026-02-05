# Specification

## Summary
**Goal:** Complete the backend canister upgrade lifecycle plumbing so wallet-domain state is preserved across upgrades and migrated via `Migration.run(...)` without breaking existing public APIs.

**Planned changes:**
- Update `backend/main.mo` upgrade hooks (`preupgrade`/`postupgrade`) to safely persist wallet-domain stable state and route it through `Migration.run({ wallets; walletTransactions; walletEvents })` during `system func postupgrade()`.
- Add or update `backend/migration.mo` to export a pure `Migration.run(...)` function that accepts and returns the wallet-domain state object (`wallets`, `walletTransactions`, `walletEvents`), including a no-op migration path.
- Ensure `backend/main.mo` compiles cleanly and all existing public method names/signatures remain backward-compatible.

**User-visible outcome:** No UI changes; existing wallet-related behavior and data remain intact across canister upgrades, with migrations applied automatically during upgrade.
