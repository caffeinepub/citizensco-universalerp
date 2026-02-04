# Specification

## Summary
**Goal:** Add missing internal Motoko type definitions for organization-scoped wallet domain entities in `backend/main.mo`.

**Planned changes:**
- Define Candid-friendly internal types for wallet entities (wallets, wallet transactions, wallet events) in `backend/main.mo`.
- Ensure each new wallet-related type includes `organizationId : OrganizationId` and matches the explicit, canonical style of existing type definitions.

**User-visible outcome:** No user-facing changes; the backend compiles with the new wallet domain types available for later development.
