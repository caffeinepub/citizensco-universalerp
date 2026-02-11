import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetOrganizationWalletsSummary, useGetOrganizationWalletTransactions } from '../hooks/useQueries';
import { useOrganization } from '../contexts/OrganizationContext';
import { useEffect } from 'react';
import { TransactionType } from '../backend';

interface WalletSummaryProps {
  isLoading?: boolean;
  showTransactions?: boolean;
}

export default function WalletSummary({ isLoading: externalLoading = false, showTransactions = true }: WalletSummaryProps) {
  const { activeOrganization } = useOrganization();
  const orgId = activeOrganization?.id || null;

  const { data: wallets, isLoading: walletsLoading, refetch: refetchWallets, error: walletsError } = useGetOrganizationWalletsSummary(orgId);
  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions, error: transactionsError } = useGetOrganizationWalletTransactions(orgId, '');

  const isLoading = externalLoading || walletsLoading;

  // Auto-refresh is handled by React Query refetchInterval, but we can manually trigger on mount
  useEffect(() => {
    if (orgId) {
      refetchWallets();
      if (showTransactions) {
        refetchTransactions();
      }
    }
  }, [orgId, refetchWallets, refetchTransactions, showTransactions]);

  const totalBalance = wallets?.reduce((sum, wallet) => sum + Number(wallet.balance), 0) || 0;
  const connectedWallets = wallets?.filter(w => w.isActive).length || 0;

  const getTransactionTypeIcon = (type: TransactionType) => {
    if (type === TransactionType.deposit) {
      return <ArrowDownRight className="h-4 w-4 text-green-500" />;
    }
    return <ArrowUpRight className="h-4 w-4 text-red-500" />;
  };

  const getTransactionColor = (type: TransactionType) => {
    if (type === TransactionType.deposit) {
      return 'text-green-500';
    }
    return 'text-red-500';
  };

  const getTransactionSign = (type: TransactionType) => {
    if (type === TransactionType.deposit) {
      return '+';
    }
    return '-';
  };

  const getTransactionTypeLabel = (type: TransactionType): string => {
    return type.toString();
  };

  const getTransactionStatusLabel = (status: any): string => {
    return status.toString();
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleString();
  };

  // Show prompt when no organization is selected
  if (!orgId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Summary</CardTitle>
          <CardDescription>Organization wallet overview</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select an organization to view wallet data
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Show error if authorization failed
  if (walletsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Summary</CardTitle>
          <CardDescription>Organization wallet overview</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {walletsError instanceof Error ? walletsError.message : 'Failed to load wallet data'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Sort transactions by createdAt descending and take the 10 most recent
  const sortedTransactions = transactions 
    ? [...transactions].sort((a, b) => {
        const timeA = Number(a.createdAt);
        const timeB = Number(b.createdAt);
        return timeB - timeA; // Descending order (most recent first)
      })
    : [];
  const recentTransactions = sortedTransactions.slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin" />
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalBalance / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across {wallets?.length || 0} wallet{wallets?.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedWallets}</div>
            <p className="text-xs text-muted-foreground">
              {connectedWallets === wallets?.length ? 'All wallets active' : `${(wallets?.length || 0) - connectedWallets} inactive`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Wallet Overview</CardTitle>
              <CardDescription>Current balances and status (live updates)</CardDescription>
            </div>
            <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
          </div>
        </CardHeader>
        <CardContent>
          {wallets && wallets.length > 0 ? (
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{wallet.name}</p>
                      <p className="text-sm text-muted-foreground">{wallet.currency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(Number(wallet.balance) / 100).toFixed(2)}</p>
                    <Badge variant={wallet.isActive ? 'default' : 'secondary'} className="text-xs">
                      {wallet.isActive ? 'active' : 'inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No wallets found for this organization. Add a wallet to get started.</p>
          )}
        </CardContent>
      </Card>

      {showTransactions && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest wallet activity (real-time updates)</CardDescription>
              </div>
              <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            </div>
          </CardHeader>
          <CardContent>
            {transactionsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {transactionsError instanceof Error ? transactionsError.message : 'Failed to load transactions'}
                </AlertDescription>
              </Alert>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        txn.transactionType === TransactionType.deposit ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        {getTransactionTypeIcon(txn.transactionType)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{getTransactionTypeLabel(txn.transactionType)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(txn.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getTransactionColor(txn.transactionType)}`}>
                        {getTransactionSign(txn.transactionType)}${(Number(txn.amount) / 100).toFixed(2)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {getTransactionStatusLabel(txn.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {transactionsLoading ? 'Loading transactions...' : 'No recent transactions for this organization'}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
