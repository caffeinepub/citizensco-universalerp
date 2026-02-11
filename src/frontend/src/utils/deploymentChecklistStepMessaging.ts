/**
 * Deployment checklist step messaging helper
 * Provides consistent English-only UI strings for deployment readiness status
 */

export interface DeploymentStepMessaging {
  completedStep: string;
  nextStep: string;
  statusMessage: string;
  canProceed: boolean;
}

/**
 * Derives deployment step messaging based on readiness status
 * @param accessControlInitialized - Whether access control is initialized
 * @param stripeConfigured - Whether Stripe is configured
 * @returns Messaging object with completed step, next step, and status
 */
export function getDeploymentStepMessaging(
  accessControlInitialized: boolean,
  stripeConfigured: boolean
): DeploymentStepMessaging {
  const allReady = accessControlInitialized && stripeConfigured;

  if (allReady) {
    return {
      completedStep: 'Step 6: Deploy Post-Migration Build & Verify Readiness',
      nextStep: 'Step 7 — Publish Live',
      statusMessage: 'All readiness checks have passed. You are ready to proceed with Step 7 (Publish Live).',
      canProceed: true,
    };
  }

  return {
    completedStep: 'Step 6 is blocked and in progress',
    nextStep: 'Complete Step 6 requirements before proceeding',
    statusMessage: 'WARNING: Do not run Step 7 yet. Step 6 is not complete. Complete all required configuration steps below before attempting to publish live.',
    canProceed: false,
  };
}
