import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import StripeSetupModal from './components/StripeSetupModal';
import DeploymentReadinessBanner from './components/DeploymentReadinessBanner';
import StorefrontPage from './pages/StorefrontPage';
import AdminDashboard from './pages/AdminDashboard';
import CrmDashboard from './pages/CrmDashboard';
import HrmsDashboard from './pages/HrmsDashboard';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import { CartProvider } from './contexts/CartContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { WalletConnectorProvider } from './contexts/WalletConnectorContext';
import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <DeploymentReadinessBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: StorefrontPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

const crmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crm',
  component: CrmDashboard,
});

const hrmsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hrms',
  component: HrmsDashboard,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrdersPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminRoute,
  crmRoute,
  hrmsRoute,
  cartRoute,
  ordersRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
      <StripeSetupModal />
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CartProvider>
        <OrganizationProvider>
          <WalletConnectorProvider>
            <AppContent />
          </WalletConnectorProvider>
        </OrganizationProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
