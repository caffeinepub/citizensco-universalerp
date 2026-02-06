import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';
import type { UserProfile, Organization, OrganizationMember, OrganizationRole } from '../backend';
import type {
  Product,
  Category,
  Order,
  OrderItem,
  AnalyticsData,
  Contact,
  Lead,
  Opportunity,
  CrmTask,
  CrmStats,
  CrmDashboard,
  LeadStage,
  ActivityLog,
  Employee,
  Department,
  Attendance,
  LeaveRequest,
  PerformanceRecord,
  HRDashboard,
  EmployeeStatus,
  LeaveStatus,
  PerformanceReviewStatus,
  UnifiedWallet,
  WalletTransaction,
  TransactionStatusNew,
  WalletTransactionEvent,
} from '../types/erp-types';

// Local type definition for deployment readiness (backend method not yet implemented)
export interface DeploymentReadinessStatus {
  accessControlInitialized: boolean;
  stripeConfigured: boolean;
  message: string;
  recommendations: string[];
}

// Deployment Readiness Query
export function useDeploymentReadiness() {
  const { actor, isFetching } = useActor();

  return useQuery<DeploymentReadinessStatus>({
    queryKey: ['deploymentReadiness'],
    queryFn: async () => {
      if (!actor) {
        return {
          accessControlInitialized: false,
          stripeConfigured: false,
          message: 'Backend actor not available',
          recommendations: ['Wait for backend initialization'],
        };
      }
      
      // Backend method not yet implemented, so we check individual status methods
      try {
        const stripeConfigured = await actor.isStripeConfigured();
        const isAdmin = await actor.isCallerAdmin();
        
        // We can infer access control is initialized if we can check admin status
        const accessControlInitialized = isAdmin !== undefined;
        
        const allReady = accessControlInitialized && stripeConfigured;
        
        let message = '';
        const recommendations: string[] = [];
        
        if (allReady) {
          message = 'All systems ready for deployment';
        } else if (!accessControlInitialized && !stripeConfigured) {
          message = 'System requires configuration before deployment';
          recommendations.push('Initialize access control by setting CAFFEINE_ADMIN_TOKEN and deploying');
          recommendations.push('Configure Stripe in the admin dashboard');
        } else if (!accessControlInitialized) {
          message = 'Access control needs initialization';
          recommendations.push('Initialize access control by setting CAFFEINE_ADMIN_TOKEN and deploying');
        } else {
          message = 'Stripe payment needs configuration';
          recommendations.push('Configure Stripe in the admin dashboard');
        }
        
        return {
          accessControlInitialized,
          stripeConfigured,
          message,
          recommendations,
        };
      } catch (error) {
        console.error('Failed to fetch deployment readiness:', error);
        return {
          accessControlInitialized: false,
          stripeConfigured: false,
          message: 'Unable to check deployment status',
          recommendations: ['Backend may not be fully initialized'],
        };
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
    refetchInterval: 30000,
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Organization Queries
export function useListOrganizations() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrganizations();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateOrganization() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrganization(name, description || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useGetOrganization(orgId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Organization | null>({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getOrganization(orgId);
    },
    enabled: !!actor && !isFetching && !!orgId,
  });
}

export function useGetOrganizationMembers(orgId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<OrganizationMember[]>({
    queryKey: ['organizationMembers', orgId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrganizationMembers(orgId);
    },
    enabled: !!actor && !isFetching && !!orgId,
  });
}

export function useAddOrganizationMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, userId, roles }: { orgId: string; userId: string; roles: OrganizationRole[] }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userId);
      return actor.addOrganizationMember(orgId, principal, roles);
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ['organizationMembers', orgId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useRemoveOrganizationMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, userId }: { orgId: string; userId: string }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userId);
      return actor.removeOrganizationMember(orgId, principal);
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ['organizationMembers', orgId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useUpdateOrganizationMemberRoles() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, userId, roles }: { orgId: string; userId: string; roles: OrganizationRole[] }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userId);
      return actor.updateOrganizationMemberRoles(orgId, principal, roles);
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ['organizationMembers', orgId] });
    },
  });
}

// Wallet Queries - Mock implementation until backend methods are available
export function useGetUserWallets(userId?: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();

  return useQuery<UnifiedWallet[]>({
    queryKey: ['userWallets', principal?.toString()],
    queryFn: async () => {
      // TODO: Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching && !!principal,
    refetchInterval: 10000,
  });
}

export function useGetAllWallets() {
  const { actor, isFetching } = useActor();

  return useQuery<UnifiedWallet[]>({
    queryKey: ['allWallets'],
    queryFn: async () => {
      // TODO: Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useGetWallet(walletId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<UnifiedWallet | null>({
    queryKey: ['wallet', walletId],
    queryFn: async () => {
      // TODO: Backend method not yet implemented
      return null;
    },
    enabled: !!actor && !isFetching && !!walletId,
    refetchInterval: 5000,
  });
}

export function useGetWalletBalance(walletId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint | null>({
    queryKey: ['walletBalance', walletId],
    queryFn: async () => {
      // TODO: Backend method not yet implemented
      return null;
    },
    enabled: !!actor && !isFetching && !!walletId,
    refetchInterval: 5000,
  });
}

export function useAddWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wallet: UnifiedWallet) => {
      // TODO: Backend method not yet implemented
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userWallets'] });
      queryClient.invalidateQueries({ queryKey: ['allWallets'] });
    },
  });
}

export function useUpdateWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wallet: UnifiedWallet) => {
      // TODO: Backend method not yet implemented
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: (_, wallet) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', wallet.id] });
      queryClient.invalidateQueries({ queryKey: ['userWallets'] });
      queryClient.invalidateQueries({ queryKey: ['allWallets'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance', wallet.id] });
    },
  });
}

export function useDeleteWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (walletId: string) => {
      // TODO: Backend method not yet implemented
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userWallets'] });
      queryClient.invalidateQueries({ queryKey: ['allWallets'] });
    },
  });
}

// Transaction Queries - Mock implementation
export function useGetWalletTransactions(walletId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<WalletTransaction[]>({
    queryKey: ['walletTransactions', walletId],
    queryFn: async () => {
      // TODO: Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching && !!walletId,
    refetchInterval: 5000,
  });
}

export function useGetUserTransactions(userId?: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();

  return useQuery<WalletTransaction[]>({
    queryKey: ['userTransactions', principal?.toString()],
    queryFn: async () => {
      // TODO: Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching && !!principal,
    refetchInterval: 5000,
  });
}

export function useGetTransactionHistory(walletId: string, count: number = 10) {
  const { actor, isFetching } = useActor();

  return useQuery<WalletTransaction[]>({
    queryKey: ['transactionHistory', walletId, count],
    queryFn: async () => {
      // TODO: Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching && !!walletId,
    refetchInterval: 5000,
  });
}

export function useGetRecentTransactionEvents(count: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<WalletTransactionEvent[]>({
    queryKey: ['recentTransactionEvents', count],
    queryFn: async () => {
      // TODO: Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useRecordTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: WalletTransaction) => {
      // TODO: Backend method not yet implemented
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: (_, transaction) => {
      queryClient.invalidateQueries({ queryKey: ['walletTransactions', transaction.walletId] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory', transaction.walletId] });
      queryClient.invalidateQueries({ queryKey: ['userTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', transaction.walletId] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance', transaction.walletId] });
      queryClient.invalidateQueries({ queryKey: ['userWallets'] });
      queryClient.invalidateQueries({ queryKey: ['allWallets'] });
      queryClient.invalidateQueries({ queryKey: ['recentTransactionEvents'] });
    },
  });
}

export function useUpdateTransactionStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, walletId, status }: { transactionId: string; walletId: string; status: TransactionStatusNew }) => {
      // TODO: Backend method not yet implemented
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: (_, { walletId }) => {
      queryClient.invalidateQueries({ queryKey: ['walletTransactions', walletId] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory', walletId] });
      queryClient.invalidateQueries({ queryKey: ['userTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', walletId] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance', walletId] });
      queryClient.invalidateQueries({ queryKey: ['userWallets'] });
      queryClient.invalidateQueries({ queryKey: ['allWallets'] });
      queryClient.invalidateQueries({ queryKey: ['recentTransactionEvents'] });
    },
  });
}

export function useBroadcastWalletTransactionEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: WalletTransactionEvent) => {
      // TODO: Backend method not yet implemented
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentTransactionEvents'] });
    },
  });
}

// Product Queries - Mock implementation until backend is ready
export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    enabled: false, // Disabled until backend is ready
  });
}

export function useSearchProducts(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'search', searchTerm],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      return [];
    },
    enabled: false, // Disabled until backend is ready
  });
}

export function useGetProductsByCategory(categoryId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'category', categoryId],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      return [];
    },
    enabled: false, // Disabled until backend is ready
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, product }: { productId: string; product: Product }) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, newStock }: { productId: string; newStock: bigint }) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Category Queries - Mock implementation
export function useGetAllCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Category) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, category }: { categoryId: string; category: Category }) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Order Queries - Mock implementation
export function useGetMyOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['myOrders'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ items, paymentMethod }: { items: OrderItem[]; paymentMethod: string }) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
}

export function useCancelOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Analytics Queries - Mock implementation
export function useGetAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      return {
        totalOrders: BigInt(0),
        totalRevenue: BigInt(0),
        activeUsers: BigInt(0),
        ordersByStatus: [],
      };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Stripe Queries
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: { secretKey: string; allowedCountries: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
      queryClient.invalidateQueries({ queryKey: ['deploymentReadiness'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: {
      items: Array<{ productName: string; productDescription: string; priceInCents: bigint; quantity: bigint; currency: string }>;
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      return JSON.parse(result) as { id: string; url: string };
    },
  });
}

// CRM Contact Queries - Mock implementation
export function useGetMyContacts() {
  const { actor, isFetching } = useActor();

  return useQuery<Contact[]>({
    queryKey: ['myContacts'],
    queryFn: async () => {
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllContacts() {
  const { actor, isFetching } = useActor();

  return useQuery<Contact[]>({
    queryKey: ['allContacts'],
    queryFn: async () => {
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: Contact) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      queryClient.invalidateQueries({ queryKey: ['allContacts'] });
      queryClient.invalidateQueries({ queryKey: ['crmStats'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineDashboard'] });
    },
  });
}

export function useUpdateContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, contact }: { contactId: string; contact: Contact }) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      queryClient.invalidateQueries({ queryKey: ['allContacts'] });
    },
  });
}

export function useDeleteContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      queryClient.invalidateQueries({ queryKey: ['allContacts'] });
      queryClient.invalidateQueries({ queryKey: ['crmStats'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineDashboard'] });
    },
  });
}

export function useSearchContacts(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Contact[]>({
    queryKey: ['contacts', 'search', searchTerm],
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
}

// CRM Lead Queries - Mock implementation
export function useGetMyLeads() {
  const { actor, isFetching } = useActor();

  return useQuery<Lead[]>({
    queryKey: ['myLeads'],
    queryFn: async () => {
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllLeads() {
  const { actor, isFetching } = useActor();

  return useQuery<Lead[]>({
    queryKey: ['allLeads'],
    queryFn: async () => {
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: Lead) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
      queryClient.invalidateQueries({ queryKey: ['crmStats'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineDashboard'] });
    },
  });
}

export function useUpdateLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, lead }: { leadId: string; lead: Lead }) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
      queryClient.invalidateQueries({ queryKey: ['crmStats'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineDashboard'] });
    },
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
      queryClient.invalidateQueries({ queryKey: ['crmStats'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineDashboard'] });
    },
  });
}

export function useFilterLeadsByStage(stage: LeadStage) {
  const { actor, isFetching } = useActor();

  return useQuery<Lead[]>({
    queryKey: ['leads', 'stage', stage],
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
}

// CRM Opportunity Queries - Mock implementation
export function useGetMyOpportunities() {
  const { actor, isFetching } = useActor();

  return useQuery<Opportunity[]>({
    queryKey: ['myOpportunities'],
    queryFn: async () => {
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllOpportunities() {
  const { actor, isFetching } = useActor();

  return useQuery<Opportunity[]>({
    queryKey: ['allOpportunities'],
    queryFn: async () => {
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddOpportunity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunity: Opportunity) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['allOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['crmStats'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineDashboard'] });
    },
  });
}

export function useUpdateOpportunity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ opportunityId, opportunity }: { opportunityId: string; opportunity: Opportunity }) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['allOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['crmStats'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineDashboard'] });
    },
  });
}

export function useDeleteOpportunity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunityId: string) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['allOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['crmStats'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineDashboard'] });
    },
  });
}

export function useConvertLeadToOpportunity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, opportunity }: { leadId: string; opportunity: Opportunity }) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
      queryClient.invalidateQueries({ queryKey: ['myOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['allOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['crmStats'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineDashboard'] });
    },
  });
}

// CRM Task Queries - Mock implementation
export function useGetMyCrmTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<CrmTask[]>({
    queryKey: ['myCrmTasks'],
    queryFn: async () => {
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllCrmTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<CrmTask[]>({
    queryKey: ['allCrmTasks'],
    queryFn: async () => {
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCrmTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: CrmTask) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCrmTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allCrmTasks'] });
    },
  });
}

export function useUpdateCrmTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, task }: { taskId: string; task: CrmTask }) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCrmTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allCrmTasks'] });
    },
  });
}

export function useDeleteCrmTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCrmTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allCrmTasks'] });
    },
  });
}

// CRM Dashboard & Stats - Mock implementation
export function useGetCrmStats() {
  const { actor, isFetching } = useActor();

  return useQuery<CrmStats>({
    queryKey: ['crmStats'],
    queryFn: async () => {
      return {
        totalContacts: BigInt(0),
        totalLeads: BigInt(0),
        totalOpportunities: BigInt(0),
        totalExpectedRevenue: BigInt(0),
        pipelineStageDistribution: [],
      };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPipelineDashboard() {
  const { actor, isFetching } = useActor();

  return useQuery<CrmDashboard>({
    queryKey: ['pipelineDashboard'],
    queryFn: async () => {
      return {
        totalContacts: BigInt(0),
        totalLeads: BigInt(0),
        totalOpportunities: BigInt(0),
        totalExpectedRevenue: BigInt(0),
        stageCount: [],
      };
    },
    enabled: !!actor && !isFetching,
  });
}

// HRMS Employee Queries - Mock implementation
export function useGetAllDepartments() {
  const { actor, isFetching } = useActor();

  return useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: Employee) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrDashboard'] });
    },
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, employee }: { employeeId: string; employee: Employee }) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrDashboard'] });
    },
  });
}

export function useDeleteEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrDashboard'] });
    },
  });
}

// HRMS Department Queries - Mock implementation
export function useAddDepartment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (department: Department) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['hrDashboard'] });
    },
  });
}

export function useUpdateDepartment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ departmentId, department }: { departmentId: string; department: Department }) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['hrDashboard'] });
    },
  });
}

export function useDeleteDepartment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (departmentId: string) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['hrDashboard'] });
    },
  });
}

export function useGetEmployeesByDepartment(departmentId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Employee[]>({
    queryKey: ['employees', 'department', departmentId],
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
}

// HRMS Attendance Queries - Mock implementation
export function useClockIn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['hrDashboard'] });
    },
  });
}

export function useClockOut() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceId: string) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['hrDashboard'] });
    },
  });
}

export function useGetAttendanceRecordsByEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Attendance[]>({
    queryKey: ['attendance', employeeId],
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
}

// HRMS Leave Queries - Mock implementation
export function useRequestLeave() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaveRequest: LeaveRequest) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['hrDashboard'] });
    },
  });
}

export function useApproveLeave() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaveId: string) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['hrDashboard'] });
    },
  });
}

export function useRejectLeave() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaveId: string) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['hrDashboard'] });
    },
  });
}

export function useGetLeaveRequestsByEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<LeaveRequest[]>({
    queryKey: ['leaves', employeeId],
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
}

export function useGetPendingLeaves() {
  const { actor, isFetching } = useActor();

  return useQuery<LeaveRequest[]>({
    queryKey: ['pendingLeaves'],
    queryFn: async () => {
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

// HRMS Payroll Queries - Mock implementation
export function useProcessPayroll() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, salary, bonus, deductions }: { employeeId: string; salary: bigint; bonus: bigint; deductions: bigint }) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
  });
}

// HRMS Performance Queries - Mock implementation
export function useAddPerformanceRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (performanceRecord: PerformanceRecord) => {
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] });
    },
  });
}

// HRMS Dashboard - Mock implementation
export function useGetHRDashboard() {
  const { actor, isFetching } = useActor();

  return useQuery<HRDashboard>({
    queryKey: ['hrDashboard'],
    queryFn: async () => {
      return {
        totalEmployees: BigInt(0),
        activeEmployees: BigInt(0),
        inactiveEmployees: BigInt(0),
        departmentDistribution: [],
        attendanceRate: BigInt(0),
        leaveSummary: [],
      };
    },
    enabled: !!actor && !isFetching,
  });
}
