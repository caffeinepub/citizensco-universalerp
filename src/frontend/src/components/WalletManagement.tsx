import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Plus, Trash2, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGetOrganizationWallets, useAddOrganizationWallet, useDeleteOrganizationWallet } from '../hooks/useQueries';
import { useOrganization } from '../contexts/OrganizationContext';

export default function WalletManagement() {
  const { activeOrganization } = useOrganization();
  const orgId = activeOrganization?.id || null;

  const { data: wallets, isLoading, refetch, error } = useGetOrganizationWallets(orgId);
  const addWalletMutation = useAddOrganizationWallet();
  const deleteWalletMutation = useDeleteOrganizationWallet();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletDescription, setWalletDescription] = useState('');
  const [currency, setCurrency] = useState('USD');

  const handleAddWallet = async () => {
    if (!walletName || !orgId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addWalletMutation.mutateAsync({
        organizationId: orgId,
        name: walletName,
        description: walletDescription || undefined,
        currency,
      });
      setIsAddDialogOpen(false);
      setWalletName('');
      setWalletDescription('');
      setCurrency('USD');
      refetch();
    } catch (error: any) {
      // Error already handled by mutation onError with toast
      console.error('Failed to add wallet:', error);
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!orgId) {
      toast.error('No organization selected');
      return;
    }

    try {
      await deleteWalletMutation.mutateAsync({ organizationId: orgId, walletId });
      refetch();
    } catch (error: any) {
      // Error already handled by mutation onError with toast
      console.error('Failed to delete wallet:', error);
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString();
  };

  // Show prompt when no organization is selected
  if (!orgId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Wallet Management
          </CardTitle>
          <CardDescription>Manage wallets for your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select an organization to manage wallets
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Wallet Management
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardTitle>
            <CardDescription>Manage wallets for {activeOrganization?.name} (live updates)</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!orgId}>
                <Plus className="h-4 w-4 mr-2" />
                Add Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Wallet</DialogTitle>
                <DialogDescription>
                  Create a new wallet for {activeOrganization?.name}
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
                  <Label htmlFor="walletDescription">Description (optional)</Label>
                  <Input
                    id="walletDescription"
                    placeholder="e.g., Primary operating wallet"
                    value={walletDescription}
                    onChange={(e) => setWalletDescription(e.target.value)}
                  />
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
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load wallets'}
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : wallets && wallets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((wallet) => (
                <tr key={wallet.id} className="border-b">
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
                  <TableCell>{wallet.currency}</TableCell>
                  <TableCell className="font-mono">${(Number(wallet.balance) / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={wallet.isActive ? 'default' : 'secondary'}>
                      {wallet.isActive ? 'active' : 'inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTimestamp(wallet.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWallet(wallet.id)}
                      disabled={deleteWalletMutation.isPending}
                    >
                      {deleteWalletMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </TableCell>
                </tr>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No wallets found for this organization</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Add Wallet" to create your first wallet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
