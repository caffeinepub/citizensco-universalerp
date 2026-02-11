import { useOrganization } from '../contexts/OrganizationContext';
import { useGetOrganizationWalletsSummary } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import WalletSummary from '../components/WalletSummary';

export default function WalletOverviewPage() {
  const { activeOrganization } = useOrganization();

  const {
    data: walletsSummary = [],
    isLoading,
    error,
  } = useGetOrganizationWalletsSummary(activeOrganization?.id || null);

  // Calculate totals (only when we have an organization and data)
  const totalBalance = activeOrganization && walletsSummary.length > 0 
    ? walletsSummary.reduce((sum, wallet) => sum + Number(wallet.balance), 0) 
    : 0;
  const activeWallets = activeOrganization && walletsSummary.length > 0 
    ? walletsSummary.filter((w) => w.isActive).length 
    : 0;
  const totalTransactions = activeOrganization && walletsSummary.length > 0 
    ? walletsSummary.reduce((sum, wallet) => sum + Number(wallet.transactionCount), 0) 
    : 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Wallet Overview</h1>
          <p className="text-muted-foreground">
            {activeOrganization 
              ? `Financial overview for ${activeOrganization.name}` 
              : 'Select an organization to view wallet information'}
          </p>
        </div>

        {/* No organization selected */}
        {!activeOrganization && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select an organization from the header to view wallet information.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading state for overview section */}
        {activeOrganization && isLoading && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-24 mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Error state for overview section */}
        {activeOrganization && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load wallet information. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Empty state for overview section */}
        {activeOrganization && !isLoading && !error && walletsSummary.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Wallets Found</h2>
            <p className="text-muted-foreground">
              This organization does not have any wallets yet.
            </p>
          </div>
        )}

        {/* Summary Cards - only show when we have data */}
        {activeOrganization && !isLoading && !error && walletsSummary.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBalance.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across {walletsSummary.length} {walletsSummary.length === 1 ? 'wallet' : 'wallets'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeWallets}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {walletsSummary.length - activeWallets} inactive
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All time activity
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Wallet Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Wallets</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {walletsSummary.map((wallet) => (
                  <Card key={wallet.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{wallet.name}</CardTitle>
                          {wallet.description && (
                            <CardDescription className="mt-1">{wallet.description}</CardDescription>
                          )}
                        </div>
                        <Badge variant={wallet.isActive ? 'default' : 'secondary'}>
                          {wallet.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="text-2xl font-bold">
                            {Number(wallet.balance).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">{wallet.currency}</div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Transactions</span>
                          <span className="font-medium">{Number(wallet.transactionCount).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Events</span>
                          <span className="font-medium">{Number(wallet.eventCount).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Wallet Summary Section - Always rendered */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Wallet Summary</h2>
          <WalletSummary />
        </div>
      </div>
    </div>
  );
}
