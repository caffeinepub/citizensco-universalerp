# Specification

## Summary
**Goal:** Ensure the wallet-domain backend state persists safely across canister upgrades by wiring Motoko upgrade lifecycle hooks to a dedicated migration step, without breaking any existing public APIs.

**Planned changes:**
- Implement `system func preupgrade` / `system func postupgrade` in `backend/main.mo` to serialize wallet-domain stable state on upgrade and restore it after upgrade.
- Route the pre-upgrade wallet-domain state through `Migration.run(preUpgradeState)` during `postupgrade`, and write the returned state back into the stable variables.
- Add/ensure `backend/migration.mo` exists and exports a `run(...)` function that accepts and returns the wallet-domain state (wallets, walletTransactions, walletEvents) in a forward-compatible structure and is safe for repeated upgrades.

**User-visible outcome:** The wallet-domain data remains intact across backend canister upgrades, with existing RBAC, user profile, organization, and Stripe APIs continuing to work without signature changes.
