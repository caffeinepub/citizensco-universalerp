import { useGetMyOrders, useCancelOrder } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Calendar, CreditCard, X, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import WalletSummary from '../components/WalletSummary';
import type { Order } from '../types/erp-types';

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useGetMyOrders();
  const cancelOrder = useCancelOrder();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'shipped':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'delivered':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success('Order cancelled successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-16">
        <div className="text-center">
          <Package className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-3xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground">
            Your order history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">My Orders</h1>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Payment:</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Items:</span>
                    <span>{order.items.length}</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.sku} × {Number(item.quantity)}
                      </span>
                      <span className="font-medium">
                        ${((Number(item.price) / 100) * Number(item.quantity)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      ${(Number(order.total) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                {(order.status === 'pending' || order.status === 'processing') && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={cancelOrder.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <WalletSummary isLoading={false} showTransactions={false} />
        </div>
      </div>
    </div>
  );
}
