import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your payment could not be processed. Please try again or contact support if the problem persists.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate({ to: '/cart' })}>
                Return to Cart
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: '/' })}>
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
