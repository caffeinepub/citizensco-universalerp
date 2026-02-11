import React from 'react';
import { useDeploymentReadiness, useIsCallerAdmin } from '../hooks/useQueries';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, XCircle, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { getDeploymentStepMessaging } from '../utils/deploymentChecklistStepMessaging';

export default function DeploymentReadinessBanner() {
  const { data: readiness, isLoading } = useDeploymentReadiness();
  const { data: isAdmin } = useIsCallerAdmin();
  const navigate = useNavigate();

  // Only show to admins
  if (isLoading || !readiness || !isAdmin) {
    return null;
  }

  const allReady = readiness.accessControlInitialized && readiness.stripeConfigured;
  const stepMessaging = getDeploymentStepMessaging(
    readiness.accessControlInitialized,
    readiness.stripeConfigured
  );

  return (
    <div className="border-b bg-muted/50">
      <div className="container mx-auto px-4 py-3">
        <Alert variant={allReady ? 'default' : 'destructive'}>
          {allReady ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle className="font-semibold">
            {allReady ? 'Deployment Ready — Step 6 Complete' : 'Deployment Status — Step 6 Blocked'}
          </AlertTitle>
          <AlertDescription>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="font-medium">
                  Completed: <span className={allReady ? 'text-green-600' : 'text-destructive'}>{stepMessaging.completedStep}</span>
                </p>
                <p className="font-medium">
                  Next Step: <span className={allReady ? 'text-green-600' : 'text-muted-foreground'}>{stepMessaging.nextStep}</span>
                </p>
              </div>
              
              <p className={`text-sm font-medium ${!allReady ? 'text-destructive' : ''}`}>
                {stepMessaging.statusMessage}
              </p>
            </div>
            
            <div className="space-y-2 text-sm mt-4 mb-3">
              <div className="flex items-center gap-2">
                {readiness.accessControlInitialized ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                )}
                <span className="font-medium">Access Control Initialization:</span>
                <span>
                  {readiness.accessControlInitialized ? 'Initialized' : 'Not Initialized'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {readiness.stripeConfigured ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                )}
                <span className="font-medium">Stripe Configuration:</span>
                <span>
                  {readiness.stripeConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>
            
            {readiness.recommendations.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="font-medium text-sm">Recommended Actions:</p>
                <ul className="space-y-2 text-sm">
                  {readiness.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {!readiness.stripeConfigured && (
                    <Button
                      size="sm"
                      onClick={() => navigate({ to: '/admin' })}
                      className="gap-2"
                    >
                      Go to Admin Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate({ to: '/activity-3' })}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Go to Activity 3 Requirements
                  </Button>
                </div>
              </div>
            )}
            
            {allReady && (
              <div className="space-y-3">
                <p className="text-sm text-green-600 font-medium mt-2">
                  ✓ All systems are ready. You may now proceed with Step 7 (Publish Live).
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate({ to: '/activity-3' })}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Go to Activity 3 Requirements
                  </Button>
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
