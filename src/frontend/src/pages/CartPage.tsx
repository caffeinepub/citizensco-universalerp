import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useWalletConnector } from '../hooks/useWalletConnector';
import { usePlaceOrder, useCreateCheckoutSession } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { formatIdentity } from '../utils/formatIdentity';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { identity } = useInternetIdentity();
  const placeOrder = usePlaceOrder();
  const createCheckout = useCreateCheckoutSession();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'icp' | 'stripe'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    selectedProviderId,
    availability,
    connectedIdentity,
    isConnecting,
    error: walletError,
    availableConnectors,
    selectProvider,
    connect,
    disconnect,
  } = useWalletConnector();

  const isAuthenticated = !!identity;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // For ICP payment, ensure wallet is connected
    if (paymentMethod === 'icp') {
      if (!connectedIdentity) {
        toast.error('Please connect your ICP wallet before proceeding');
        return;
      }
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'stripe') {
        const shoppingItems = items.map((item) => ({
          productName: item.name,
          productDescription: item.description,
          priceInCents: item.price,
          quantity: BigInt(item.quantity),
          currency: 'usd',
        }));

        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        const session = await createCheckout.mutateAsync({
          items: shoppingItems,
          successUrl: `${baseUrl}/payment-success`,
          cancelUrl: `${baseUrl}/payment-failure`,
        });

        if (!session?.url) {
          throw new Error('Stripe session missing URL');
        }

        window.location.href = session.url;
      } else {
        const orderItems = items.map((item) => ({
          productId: item.id,
          quantity: BigInt(item.quantity),
          price: item.price,
          sku: item.sku,
        }));

        const orderId = await placeOrder.mutateAsync({
          items: orderItems,
          paymentMethod: 'ICP',
        });

        toast.success('Order placed successfully!');
        clearCart();
        navigate({ to: '/orders' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process checkout');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-3xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some products to get started
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const selectedConnector = availableConnectors.find((c) => c.id === selectedProviderId);
  const isWalletConnected = selectedProviderId && availability[selectedProviderId] === 'connected';

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="h-24 w-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={item.image?.getDirectURL?.() || '/assets/generated/product-placeholder.dim_300x300.png'}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                          min="1"
                          max={Number(item.stock)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= Number(item.stock)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold">
                          ${((Number(item.price) / 100) * item.quantity).toFixed(2)}
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
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(totalPrice / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${(totalPrice / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'icp' | 'stripe')}>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex-1 cursor-pointer flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Credit/Debit Card (Stripe)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="icp" id="icp" />
                    <Label htmlFor="icp" className="flex-1 cursor-pointer flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      ICP Wallet
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === 'icp' && (
                <div className="space-y-3 pt-2">
                  <Label>Select Wallet Provider</Label>
                  <Select value={selectedProviderId || ''} onValueChange={(v) => selectProvider(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a wallet..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableConnectors.map((connector) => {
                        const connectorAvailability = availability[connector.id];
                        const isSelectable = connectorAvailability === 'available' || connectorAvailability === 'connected';
                        return (
                          <SelectItem
                            key={connector.id}
                            value={connector.id}
                            disabled={!isSelectable}
                          >
                            {connector.name}
                            {!isSelectable && ' (Not installed)'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {selectedProviderId && availability[selectedProviderId] === 'unavailable' && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {selectedConnector?.name} is not installed. Please install the browser extension to continue.
                      </AlertDescription>
                    </Alert>
                  )}

                  {selectedProviderId && availability[selectedProviderId] !== 'unavailable' && !isWalletConnected && (
                    <Button
                      onClick={connect}
                      disabled={isConnecting}
                      className="w-full"
                      variant="outline"
                    >
                      {isConnecting ? 'Connecting...' : `Connect ${selectedConnector?.name}`}
                    </Button>
                  )}

                  {isWalletConnected && connectedIdentity && (
                    <div className="space-y-2">
                      <Alert className="border-green-500/50 bg-green-500/10">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-sm">
                          <div className="font-medium mb-1">Connected to {selectedConnector?.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {formatIdentity(connectedIdentity.principal)}
                          </div>
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={disconnect}
                        variant="ghost"
                        size="sm"
                        className="w-full"
                      >
                        Disconnect
                      </Button>
                    </div>
                  )}

                  {walletError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{walletError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleCheckout}
                disabled={!isAuthenticated || isProcessing || (paymentMethod === 'icp' && !isWalletConnected)}
                className="w-full"
                size="lg"
              >
                {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
