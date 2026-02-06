# Activity 2: Deployment Checklist

This document outlines the step-by-step deployment process for Activity 2. Follow each step carefully and confirm completion before proceeding to the next step.

## Overview

Activity 2 involves deploying the application with proper configuration and readiness verification. The process includes a one-time project migration and multiple deployment steps with confirmation checkpoints.

## Prerequisites

- Backend canister must be deployed
- Frontend build must complete successfully
- Admin credentials must be available

## Deployment Steps

### Step 1: Initial Build
**Status:** ✅ COMPLETED

Build the application with the latest changes.

**Verification:**
- Build completes without errors
- All TypeScript compilation succeeds
- Assets are properly bundled

---

### Step 2: Deploy to Preview
**Status:** ✅ COMPLETED

Deploy the built application to the preview environment.

**Verification:**
- Deployment completes successfully
- Preview URL is accessible
- Application loads without errors

---

### Step 3: Preview Verification
**Status:** ✅ COMPLETED

Review the deployed preview to ensure all functionality works as expected.

**Verification:**
- Application UI renders correctly
- Authentication works
- Basic navigation functions properly

---

### Step 4: One-Time Migration
**Status:** ✅ COMPLETED

Execute the one-time project migration to update the project structure.

**Verification:**
- Migration completes without errors
- Project structure is updated
- No data loss occurs

**⚠️ IMPORTANT:** Do not manually publish or make changes during this step. The migration must complete fully before any other operations.

---

### Step 5: Post-Migration Build
**Status:** ✅ COMPLETED

Build the application again after the migration to ensure compatibility with the new structure.

**Verification:**
- Build completes successfully with new structure
- No migration-related errors
- All dependencies resolve correctly

---

### Step 6: Deploy Post-Migration Build
**Status:** 🔄 IN PROGRESS

Deploy the post-migration build to the network.

**Verification:**
- Deployment completes successfully
- Application is accessible at the deployment URL
- **Check deployment readiness status in the UI** (admin users will see a banner if prerequisites are not met)
- Verify access control initialization status
- Verify Stripe configuration status

**Next Actions:**
1. Log in as an admin user
2. Check the deployment readiness banner at the top of the page
3. If access control is not initialized, ensure the `CAFFEINE_ADMIN_TOKEN` environment variable is set
4. If Stripe is not configured, navigate to the admin dashboard and configure Stripe settings
5. Confirm all readiness checks pass before proceeding to Step 7

---

### Step 7: Publish Live
**Status:** ⏳ PENDING

Publish the deployed application to make it live for all users.

**Prerequisites:**
- Step 6 deployment must be successful
- **Deployment readiness status must show all systems ready**
- Access control must be initialized
- Stripe must be configured (if payment functionality is required)
- Admin verification must be complete

**Verification:**
- Application is live at the production URL
- All features function correctly in production
- No errors in browser console
- Authentication and authorization work properly

**⚠️ CRITICAL:** Do not proceed to this step until the deployment readiness banner shows all systems are ready. Publishing with incomplete configuration may result in a non-functional application.

---

## Common Issues and Solutions

### Issue: Deployment Fails During Migration
**Solution:** Restore to the last known good version and retry the migration process from Step 4.

### Issue: Access Control Not Initialized
**Solution:** 
1. Ensure the `CAFFEINE_ADMIN_TOKEN` environment variable is set correctly
2. Redeploy the backend canister
3. Verify the admin principal is registered

### Issue: Stripe Not Configured
**Solution:**
1. Log in as an admin
2. Navigate to the admin dashboard
3. Enter Stripe secret key and allowed countries
4. Save the configuration
5. Verify the readiness banner updates

### Issue: Manual Publish Interrupts Flow
**Solution:**
1. Do not manually publish between steps
2. If a manual publish occurred, restore to the last confirmed step
3. Resume the checklist from that point

---

## Important Notes

1. **Step-by-Step Confirmation:** Always wait for confirmation before proceeding to the next step.
2. **No Manual Changes:** Do not make manual changes or publish between steps.
3. **Readiness Verification:** Always check the deployment readiness status before publishing.
4. **Admin Access Required:** Some verification steps require admin access to the application.
5. **Environment Variables:** Ensure all required environment variables are set before deployment.

---

## Rollback Procedure

If any step fails or produces unexpected results:

1. Stop the deployment process immediately
2. Document the error or issue encountered
3. Restore to the last known good version (Version 30 or later confirmed version)
4. Review the error logs and identify the root cause
5. Fix the issue
6. Restart the deployment process from Step 1

---

## Contact and Support

If you encounter issues not covered in this checklist:
- Review the application logs for detailed error messages
- Check the deployment readiness banner for specific recommendations
- Ensure all prerequisites are met before each step
- Document any new issues for future reference

---

**Last Updated:** February 5, 2026
**Version:** 1.0
