# Specification

## Summary
**Goal:** Add an admin-only “Next step” call-to-action in the Deployment Readiness banner that links to the existing Activity 3 requirements page.

**Planned changes:**
- Update the admin-only `DeploymentReadinessBanner` UI to include an additional CTA button/link (e.g., “Go to Activity 3 Requirements”).
- Wire the CTA to navigate to the existing `/activity-3` route while keeping existing readiness actions intact and ensuring the banner remains usable on small screens.

**User-visible outcome:** Admin users who see the Deployment Readiness banner can click a new “next step” CTA to go directly to the Activity 3 requirements page; non-admin users see no change.
