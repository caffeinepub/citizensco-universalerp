import React from 'react';
import { useDeploymentReadiness, useIsCallerAdmin } from '../hooks/useQueries';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function DeploymentReadinessBanner() {
  const { data: readiness, isLoading } = useDeploymentReadiness();
  const { data: isAdmin } = useIsCallerAdmin();

  if (isLoading || !readiness || !isAdmin) {
    return null;
  }

  const allReady = readiness.accessControlInitialized && readiness.stripeConfigured;

  if (allReady) {
    return null;
  }

  return (
    <div className="border-b bg-muted/50">
      <div className="container mx-auto px-4 py-3">
        <Alert variant={allReady ? 'default' : 'destructive'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold">Deployment Status</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{readiness.message}</p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {readiness.accessControlInitialized ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span>
                  Access Control: {readiness.accessControlInitialized ? 'Initialized' : 'Not Initialized'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {readiness.stripeConfigured ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span>Stripe Payment: {readiness.stripeConfigured ? 'Configured' : 'Not Configured'}</span>
              </div>
            </div>
            {readiness.recommendations.length > 0 && (
              <div className="mt-3">
                <p className="font-medium text-sm mb-1">Recommended Actions:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {readiness.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
