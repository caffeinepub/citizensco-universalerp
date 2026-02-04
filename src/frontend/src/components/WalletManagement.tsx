import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, Plus, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllWallets, useAddWallet, useDeleteWallet } from '../hooks/useQueries';
import { UnifiedWallet, WalletType, WalletStatus } from '../types/erp-types';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function WalletManagement() {
  const { identity } = useInternetIdentity();
  const { data: wallets, isLoading, refetch } = useGetAllWallets();
  const addWalletMutation = useAddWallet();
  const deleteWalletMutation = useDeleteWallet();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletDescription, setWalletDescription] = useState('');
  const [walletType, setWalletType] = useState<'icp' | 'offChain' | 'fiat'>('icp');
  const [currency, setCurrency] = useState('USD');

  const handleAddWallet = async () => {
    if (!walletName || !identity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const walletTypeObj: WalletType = 
      walletType === 'icp' ? { __kind__: 'icp', icp: null } :
      walletType === 'offChain' ? { __kind__: 'offChain', offChain: null } :
      { __kind__: 'fiat', fiat: null };

    const newWallet: UnifiedWallet = {
      id: `wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ownerId: identity.getPrincipal(),
      walletType: walletTypeObj,
      name: walletName,
      description: walletDescription,
      balance: BigInt(0),
      currency: currency,
      status: WalletStatus.active,
      createdAt: BigInt(Date.now() * 1000000), // Convert to nanoseconds
    };

    try {
      await addWalletMutation.mutateAsync(newWallet);
      toast.success('Wallet added successfully');
      setIsAddDialogOpen(false);
      setWalletName('');
      setWalletDescription('');
      setWalletType('icp');
      setCurrency('USD');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add wallet');
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    try {
      await deleteWalletMutation.mutateAsync(walletId);
      toast.success('Wallet removed successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove wallet');
    }
  };

  const getStatusColor = (status: WalletStatus): string => {
    switch (status) {
      case WalletStatus.active:
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case WalletStatus.inactive:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case WalletStatus.suspended:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case WalletStatus.closed:
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
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

  const getWalletTypeLabel = (walletType: WalletType) => {
    if (walletType.__kind__ === 'icp') return 'ICP';
    if (walletType.__kind__ === 'offChain') return 'Off-chain';
    if (walletType.__kind__ === 'fiat') return 'Fiat';
    if (walletType.__kind__ === 'digitalAsset') return 'Digital Asset';
    if (walletType.__kind__ === 'custom') return walletType.custom;
    return 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Wallet Management
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardTitle>
            <CardDescription>Manage your wallets and payment methods (live updates)</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Wallet</DialogTitle>
                <DialogDescription>
                  Connect a new wallet to your account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="walletName">Wallet Name</Label>
                  <Input
                    id="walletName"
                    placeholder="e.g., Main Wallet"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walletDescription">Description</Label>
                  <Input
                    id="walletDescription"
                    placeholder="e.g., Personal spending wallet"
                    value={walletDescription}
                    onChange={(e) => setWalletDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walletType">Wallet Type</Label>
                  <Select value={walletType} onValueChange={(value: any) => setWalletType(value)}>
                    <SelectTrigger id="walletType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="icp">ICP Wallet</SelectItem>
                      <SelectItem value="offChain">Off-chain Wallet</SelectItem>
                      <SelectItem value="fiat">Fiat Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    placeholder="USD"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddWallet} disabled={addWalletMutation.isPending}>
                  {addWalletMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Wallet
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : wallets && wallets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((wallet) => (
                <TableRow key={wallet.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p>{wallet.name}</p>
                        {wallet.description && (
                          <p className="text-xs text-muted-foreground">{wallet.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getWalletTypeLabel(wallet.walletType)}</TableCell>
                  <TableCell className="font-bold">${(Number(wallet.balance) / 100).toFixed(2)}</TableCell>
                  <TableCell>{wallet.currency}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(wallet.status)}>
                      {getStatusLabel(wallet.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWallet(wallet.id)}
                      disabled={deleteWalletMutation.isPending}
                    >
                      {deleteWalletMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No wallets found. Add a wallet to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
