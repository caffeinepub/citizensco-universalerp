import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetUserWallets, useGetRecentTransactionEvents } from '../hooks/useQueries';
import { useEffect } from 'react';
import { WalletStatus, TransactionStatusNew } from '../types/erp-types';

interface WalletSummaryProps {
  isLoading?: boolean;
  showTransactions?: boolean;
}

export default function WalletSummary({ isLoading: externalLoading = false, showTransactions = true }: WalletSummaryProps) {
  const { data: wallets, isLoading: walletsLoading, refetch: refetchWallets } = useGetUserWallets();
  const { data: transactionEvents, isLoading: eventsLoading, refetch: refetchEvents } = useGetRecentTransactionEvents(10);

  const isLoading = externalLoading || walletsLoading;

  // Auto-refresh is handled by React Query refetchInterval, but we can manually trigger on mount
  useEffect(() => {
    refetchWallets();
    if (showTransactions) {
      refetchEvents();
    }
  }, [refetchWallets, refetchEvents, showTransactions]);

  const totalBalance = wallets?.reduce((sum, wallet) => sum + Number(wallet.balance), 0) || 0;
  const connectedWallets = wallets?.filter(w => w.status === WalletStatus.active).length || 0;

  const getStatusBadge = (status: WalletStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case WalletStatus.active:
        return 'default';
      case WalletStatus.inactive:
        return 'secondary';
      case WalletStatus.suspended:
        return 'destructive';
      case WalletStatus.closed:
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: WalletStatus): string => {
    switch (status) {
      case WalletStatus.active:
        return 'active';
      case WalletStatus.inactive:
        return 'inactive';
      case WalletStatus.suspended:
        return 'suspended';
      case WalletStatus.closed:
        return 'closed';
      default:
        return 'unknown';
    }
  };

  const getWalletTypeLabel = (walletType: any) => {
    if (walletType.__kind__ === 'icp') return 'ICP';
    if (walletType.__kind__ === 'offChain') return 'Off-chain';
    if (walletType.__kind__ === 'fiat') return 'Fiat';
    if (walletType.__kind__ === 'digitalAsset') return 'Digital Asset';
    if (walletType.__kind__ === 'custom') return walletType.custom;
    return 'Unknown';
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleString();
  };

  const getTransactionTypeIcon = (txn: any) => {
    const type = txn.transactionType.toLowerCase();
    if (type.includes('incoming') || type.includes('deposit') || type.includes('credit')) {
      return <ArrowDownRight className="h-4 w-4 text-green-500" />;
    }
    return <ArrowUpRight className="h-4 w-4 text-red-500" />;
  };

  const getTransactionColor = (txn: any) => {
    const type = txn.transactionType.toLowerCase();
    if (type.includes('incoming') || type.includes('deposit') || type.includes('credit')) {
      return 'text-green-500';
    }
    return 'text-red-500';
  };

  const getTransactionSign = (txn: any) => {
    const type = txn.transactionType.toLowerCase();
    if (type.includes('incoming') || type.includes('deposit') || type.includes('credit')) {
      return '+';
    }
    return '-';
  };

  const getTransactionStatusLabel = (status: TransactionStatusNew): string => {
    switch (status) {
      case TransactionStatusNew.pending:
        return 'pending';
      case TransactionStatusNew.completed:
        return 'completed';
      case TransactionStatusNew.failed:
        return 'failed';
      case TransactionStatusNew.cancelled:
        return 'cancelled';
      case TransactionStatusNew.reversed:
        return 'reversed';
      default:
        return 'unknown';
    }
  };

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
            <CardTitle className="text-sm font-medium">Connected Wallets</CardTitle>
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
              <CardDescription>Current balances and connection status (live updates)</CardDescription>
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
                      <p className="text-sm text-muted-foreground">{getWalletTypeLabel(wallet.walletType)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(Number(wallet.balance) / 100).toFixed(2)}</p>
                    <Badge variant={getStatusBadge(wallet.status)} className="text-xs">
                      {getStatusLabel(wallet.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No wallets found. Add a wallet to get started.</p>
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
            {transactionEvents && transactionEvents.length > 0 ? (
              <div className="space-y-3">
                {transactionEvents.map((event) => {
                  const txn = event.transaction;
                  return (
                    <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          txn.transactionType.toLowerCase().includes('incoming') ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}>
                          {getTransactionTypeIcon(txn)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{txn.typeIdentifier}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(txn.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getTransactionColor(txn)}`}>
                          {getTransactionSign(txn)}${(Number(txn.amount) / 100).toFixed(2)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {getTransactionStatusLabel(txn.status)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {eventsLoading ? 'Loading transactions...' : 'No recent transactions'}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
