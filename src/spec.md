# Specification

## Summary
**Goal:** Implement the first iteration of an organization-scoped Wallet Overview experience, including backend read APIs, a new frontend page, and routing/navigation.

**Planned changes:**
- Add backend read APIs to (a) list wallets by organization, (b) get a wallet by walletId with organization authorization, and (c) fetch an organization-scoped wallet overview response with per-wallet metrics required by the UI.
- Enforce authorization rules so organization members can only read wallets for organizations they belong to, while global admins can access wallets across any organization.
- Add a new Wallet Overview frontend page that uses OrganizationContext for the active organization, loads data via React Query hooks, and renders loading, empty, and error states (including a prompt when no organization is selected).
- Wire tanstack router navigation/routing to make the Wallet Overview page reachable in-app and ensure switching the active organization updates queries (organization id included in query keys).

**User-visible outcome:** Users can navigate to a Wallet Overview page, select an organization, and view that organization’s wallet overview data with clear loading/error/empty states; unauthorized organization access is blocked.
