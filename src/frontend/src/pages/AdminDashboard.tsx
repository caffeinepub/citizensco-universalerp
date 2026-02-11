import { useState } from 'react';
import { useGetAnalytics, useGetAllOrders, useIsCallerAdmin, useDeploymentReadiness } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DollarSign, ShoppingCart, Users, TrendingUp, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import ProductManagement from '../components/admin/ProductManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import OrderManagement from '../components/admin/OrderManagement';
import OrganizationManagement from '../components/admin/OrganizationManagement';
import WalletSummary from '../components/WalletSummary';
import WalletManagement from '../components/WalletManagement';
import { useNavigate } from '@tanstack/react-router';

export default function AdminDashboard() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: analytics, isLoading: analyticsLoading } = useGetAnalytics();
  const { data: readiness, isLoading: readinessLoading } = useDeploymentReadiness();
  const navigate = useNavigate();

  if (adminLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access the admin dashboard.
        </p>
        <button onClick={() => navigate({ to: '/' })} className="text-primary hover:underline">
          Return to Home
        </button>
      </div>
    );
  }

  const allReady = readiness?.accessControlInitialized && readiness?.stripeConfigured;

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* Deployment Readiness Section */}
      {!readinessLoading && readiness && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {allReady ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              Deployment Readiness
            </CardTitle>
            <CardDescription>
              System configuration status for production deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {readiness.accessControlInitialized ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium">Access Control Initialization</p>
                    <p className="text-sm text-muted-foreground">
                      {readiness.accessControlInitialized
                        ? 'System is initialized and ready'
                        : 'Set CAFFEINE_ADMIN_TOKEN and redeploy backend'}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${readiness.accessControlInitialized ? 'text-green-600' : 'text-destructive'}`}>
                  {readiness.accessControlInitialized ? 'Ready' : 'Required'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {readiness.stripeConfigured ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium">Stripe Configuration</p>
                    <p className="text-sm text-muted-foreground">
                      {readiness.stripeConfigured
                        ? 'Payment system is configured'
                        : 'Configure Stripe settings below in the Products tab'}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${readiness.stripeConfigured ? 'text-green-600' : 'text-destructive'}`}>
                  {readiness.stripeConfigured ? 'Ready' : 'Required'}
                </span>
              </div>

              {allReady ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>All Systems Ready</AlertTitle>
                  <AlertDescription>
                    Your application is fully configured and ready for production deployment.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuration Required</AlertTitle>
                  <AlertDescription>
                    Complete the required configuration steps above before deploying to production.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="text-3xl font-bold">
                ${((Number(analytics?.totalRevenue || 0)) / 100).toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="text-3xl font-bold">
                {Number(analytics?.totalOrders || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="text-3xl font-bold">
                {Number(analytics?.activeUsers || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="text-3xl font-bold">
                ${analytics?.totalOrders && Number(analytics.totalOrders) > 0
                  ? ((Number(analytics.totalRevenue) / Number(analytics.totalOrders)) / 100).toFixed(2)
                  : '0.00'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagement />
        </TabsContent>

        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>

        <TabsContent value="organizations">
          <OrganizationManagement />
        </TabsContent>

        <TabsContent value="wallets" className="space-y-6">
          <WalletSummary isLoading={false} showTransactions={true} />
          <WalletManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
