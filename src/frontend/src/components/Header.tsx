import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '../contexts/CartContext';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Shield, Package, Users, Briefcase } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import OrganizationSwitcher from './OrganizationSwitcher';

export default function Header() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { totalItems } = useCart();
  const { data: isAdmin } = useIsCallerAdmin();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <Package className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
              CitizensCo ERP
            </span>
          </button>
        </div>

        <nav className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <OrganizationSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/orders' })}
              >
                <User className="h-4 w-4 mr-2" />
                My Orders
              </Button>
              {isAdmin && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ to: '/admin' })}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ to: '/crm' })}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    CRM
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ to: '/hrms' })}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    HRMS
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/cart' })}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </>
          )}
          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            variant={isAuthenticated ? 'outline' : 'default'}
            size="sm"
          >
            {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </nav>
      </div>
    </header>
  );
}
