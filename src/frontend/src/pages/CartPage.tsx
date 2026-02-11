import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { usePlaceOrder, useCreateCheckoutSession } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useWalletConnector } from '../hooks/useWalletConnector';
import type { ShoppingItem } from '../backend';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'icp'>('stripe');
  const placeOrder = usePlaceOrder();
  const createCheckoutSession = useCreateCheckoutSession();
  const navigate = useNavigate();
  const { 
    availableConnectors, 
    selectedProviderId,
    connectedIdentity,
    selectProvider,
    connect, 
    disconnect,
    availability,
    isConnecting,
  } = useWalletConnector();

  // Auto-select first available provider when switching to ICP payment
  useEffect(() => {
    if (paymentMethod === 'icp' && !selectedProviderId) {
      const firstAvailable = availableConnectors.find(c => availability[c.id] === 'available' || availability[c.id] === 'connected');
      if (firstAvailable) {
        selectProvider(firstAvailable.id);
      }
    }
  }, [paymentMethod, selectedProviderId, availableConnectors, availability, selectProvider]);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (paymentMethod === 'icp') {
      if (!selectedProviderId) {
        toast.error('Please select a wallet provider');
        return;
      }

      if (!connectedIdentity) {
        toast.error('Please connect your wallet first');
        return;
      }

      try {
        const orderItems = items.map(item => ({
          productId: item.id,
          quantity: BigInt(item.quantity),
          price: item.price,
          sku: item.sku,
        }));

        const total = items.reduce((sum, item) => sum + item.price * BigInt(item.quantity), BigInt(0));

        const orderId = await placeOrder.mutateAsync({
          items: orderItems,
          total,
          paymentMethod: 'ICP',
        });

        clearCart();
        toast.success('Order placed successfully!');
        navigate({ to: '/orders' });
      } catch (error: any) {
        toast.error(error.message || 'Failed to place order');
      }
    } else {
      try {
        const shoppingItems: ShoppingItem[] = items.map(item => ({
          productName: item.name,
          productDescription: item.description,
          priceInCents: BigInt(Number(item.price)),
          quantity: BigInt(item.quantity),
          currency: 'usd',
        }));

        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        const successUrl = `${baseUrl}/payment-success`;
        const cancelUrl = `${baseUrl}/payment-failure`;

        const session = await createCheckoutSession.mutateAsync({
          items: shoppingItems,
          successUrl,
          cancelUrl,
        });

        if (!session?.url) {
          throw new Error('Stripe session missing url');
        }

        window.location.href = session.url;
      } catch (error: any) {
        toast.error(error.message || 'Failed to create checkout session');
      }
    }
  };

  const handleConnectWallet = async () => {
    if (!selectedProviderId) {
      toast.error('Please select a wallet provider');
      return;
    }

    try {
      await connect();
      toast.success('Wallet connected successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to disconnect wallet');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Add some products to your cart to get started
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const isWalletConnected = availability[selectedProviderId || ''] === 'connected' && connectedIdentity;

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold">
                          ${(Number(item.price) * item.quantity / 100).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items ({totalItems})</span>
                  <span>${(Number(totalPrice) / 100).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${(Number(totalPrice) / 100).toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-semibold">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'icp')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="cursor-pointer">Credit/Debit Card (Stripe)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="icp" id="icp" />
                    <Label htmlFor="icp" className="cursor-pointer">ICP Wallet</Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'icp' && (
                  <div className="space-y-3 pt-2">
                    <Label>Select Wallet Provider</Label>
                    <Select 
                      value={selectedProviderId || ''} 
                      onValueChange={(value) => selectProvider(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a wallet" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableConnectors.map((connector) => {
                          const isAvailable = availability[connector.id] === 'available' || availability[connector.id] === 'connected';
                          return (
                            <SelectItem 
                              key={connector.id} 
                              value={connector.id}
                              disabled={!isAvailable}
                            >
                              {connector.name} {isAvailable ? '✓' : '(Not Available)'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {selectedProviderId && !isWalletConnected && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleConnectWallet}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Connect Wallet'
                        )}
                      </Button>
                    )}

                    {isWalletConnected && connectedIdentity && (
                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Connected</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDisconnectWallet}
                          >
                            Disconnect
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground break-all">
                          {connectedIdentity.principal}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={placeOrder.isPending || createCheckoutSession.isPending || (paymentMethod === 'icp' && !isWalletConnected)}
              >
                {(placeOrder.isPending || createCheckoutSession.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
