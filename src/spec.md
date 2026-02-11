# Specification

## Summary
**Goal:** Deploy the post-migration build (Deployment Checklist Step 6) and verify deployment readiness in the live UI as an admin user.

**Planned changes:**
- Deploy the post-migration build to the network and confirm the deployment completes without errors.
- Verify the deployed app is accessible at the deployment URL and loads without runtime errors.
- Log in as an admin and verify the in-app deployment readiness status, including access control initialization and Stripe configuration status.
- If access control is not initialized, document that `CAFFEINE_ADMIN_TOKEN` must be set and the backend redeployed as needed.
- If Stripe is not configured, verify the admin can navigate to the admin dashboard and complete Stripe setup.
- Confirm all readiness checks are passing before stopping (do not proceed to Step 7).

**User-visible outcome:** The application is reachable at the deployment URL, and an admin can log in to view and confirm deployment readiness status (including access control initialization and Stripe configuration) before proceeding further.
