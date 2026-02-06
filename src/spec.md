# Specification

## Summary
**Goal:** Make post-migration deployments resilient by avoiding traps when access-control secrets are missing, and provide clear readiness diagnostics in both backend and frontend.

**Planned changes:**
- Update backend access-control initialization so install/upgrade succeeds even when required secrets (e.g., `CAFFEINE_ADMIN_TOKEN`) are missing/invalid, leaving the canister running in a safe uninitialized state.
- Add a backend readiness/status API that reports (at minimum) whether access control is initialized and whether Stripe is configured, and is safe to call without trapping even when partially configured.
- Add a frontend UI status panel/banner that displays readiness results with English messages and recommended next actions when prerequisites are missing (e.g., admin setup required; Stripe not configured), without editing immutable frontend paths.
- Add a short “Activity 2 deployment checklist” document with numbered steps (including Step 6 deploy and Step 7 publish) and explicit guidance to verify readiness before publishing and avoid mid-step manual changes.

**User-visible outcome:** After deploying, users/admins can view a clear readiness status in the app (and via a backend endpoint) explaining why the deployment may not be fully operational, and can follow a documented checklist to safely proceed with Activity 2 deployment steps.
