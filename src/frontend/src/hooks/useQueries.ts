import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { normalizeWalletError } from '../utils/walletErrors';
import type { UserProfile, Organization, OrganizationMember, OrganizationRole, Wallet, WalletTransaction, WalletEvent, WalletOverviewResponse, SidebarFinancialsResponse, StripeConfiguration, ShoppingItem } from '../backend';
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

// Admin check query
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Stripe configuration queries
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
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
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
      queryClient.invalidateQueries({ queryKey: ['deploymentReadiness'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ items, successUrl, cancelUrl }: { items: ShoppingItem[]; successUrl: string; cancelUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
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

// Organization-scoped Wallet Queries
export function useGetOrganizationWallets(organizationId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Wallet[]>({
    queryKey: ['orgWallets', organizationId],
    queryFn: async () => {
      if (!actor || !organizationId) return [];
      try {
        return await actor.getOrganizationWallets(organizationId);
      } catch (error) {
        const message = normalizeWalletError(error);
        console.error('Failed to fetch organization wallets:', message);
        throw new Error(message);
      }
    },
    enabled: !!actor && !isFetching && !!organizationId,
    refetchInterval: 10000,
  });
}

export function useGetOrganizationWalletsSummary(organizationId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<WalletOverviewResponse[]>({
    queryKey: ['orgWalletsSummary', organizationId],
    queryFn: async () => {
      if (!actor || !organizationId) return [];
      try {
        return await actor.getOrganizationWalletsSummary(organizationId);
      } catch (error) {
        const message = normalizeWalletError(error);
        console.error('Failed to fetch organization wallets summary:', message);
        throw new Error(message);
      }
    },
    enabled: !!actor && !isFetching && !!organizationId,
    refetchInterval: 10000,
  });
}

export function useGetOrganizationWalletTransactions(organizationId: string | null, walletId: string = '') {
  const { actor, isFetching } = useActor();

  return useQuery<WalletTransaction[]>({
    queryKey: ['orgWalletTransactions', organizationId, walletId],
    queryFn: async () => {
      if (!actor || !organizationId) return [];
      try {
        return await actor.getOrganizationWalletTransactions(organizationId, walletId);
      } catch (error) {
        const message = normalizeWalletError(error);
        console.error('Failed to fetch organization wallet transactions:', message);
        throw new Error(message);
      }
    },
    enabled: !!actor && !isFetching && !!organizationId,
    refetchInterval: 5000,
  });
}

export function useGetOrganizationWalletEvents(organizationId: string | null, walletId: string = '') {
  const { actor, isFetching } = useActor();

  return useQuery<WalletEvent[]>({
    queryKey: ['orgWalletEvents', organizationId, walletId],
    queryFn: async () => {
      if (!actor || !organizationId) return [];
      try {
        return await actor.getOrganizationWalletEvents(organizationId, walletId);
      } catch (error) {
        const message = normalizeWalletError(error);
        console.error('Failed to fetch organization wallet events:', message);
        throw new Error(message);
      }
    },
    enabled: !!actor && !isFetching && !!organizationId,
    refetchInterval: 3000,
  });
}

export function useGetOrganizationSidebarFinancials(organizationId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<SidebarFinancialsResponse>({
    queryKey: ['orgSidebarFinancials', organizationId],
    queryFn: async () => {
      if (!actor || !organizationId) {
        return {
          wallets: [],
          transactions: [],
          events: [],
          financialSections: [],
        };
      }
      try {
        return await actor.getOrganizationSidebarFinancials(organizationId);
      } catch (error) {
        const message = normalizeWalletError(error);
        console.error('Failed to fetch organization sidebar financials:', message);
        throw new Error(message);
      }
    },
    enabled: !!actor && !isFetching && !!organizationId,
    refetchInterval: 10000,
  });
}

// Wallet mutations (organization-scoped - not yet implemented in backend)
export function useAddOrganizationWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, name, description, currency }: { organizationId: string; name: string; description?: string; currency: string }) => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Backend method not yet implemented for creating wallets
      throw new Error('Wallet creation not yet implemented in backend');
    },
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ['orgWallets', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['orgWalletsSummary', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['orgSidebarFinancials', organizationId] });
      toast.success('Wallet added successfully');
    },
    onError: (error) => {
      const message = normalizeWalletError(error);
      toast.error(message);
    },
  });
}

export function useDeleteOrganizationWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, walletId }: { organizationId: string; walletId: string }) => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Backend method not yet implemented for deleting wallets
      throw new Error('Wallet deletion not yet implemented in backend');
    },
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ['orgWallets', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['orgWalletsSummary', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['orgWalletTransactions', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['orgWalletEvents', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['orgSidebarFinancials', organizationId] });
      toast.success('Wallet removed successfully');
    },
    onError: (error) => {
      const message = normalizeWalletError(error);
      toast.error(message);
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
export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Order[]>({
    queryKey: ['userOrders', identity?.getPrincipal().toString()],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      return [];
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Alias for useGetUserOrders
export function useGetMyOrders() {
  return useGetUserOrders();
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: Omit<Order, 'id' | 'createdAt'>) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
    },
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
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
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
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
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
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
    },
  });
}

// Analytics - Mock implementation
export function useGetAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      return {
        totalRevenue: BigInt(0),
        totalOrders: BigInt(0),
        activeUsers: BigInt(0),
        ordersByStatus: [],
      };
    },
    enabled: !!actor && !isFetching,
  });
}

// Contact Queries - Mock implementation
export function useGetAllContacts() {
  const { actor, isFetching } = useActor();

  return useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
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
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, contact }: { contactId: string; contact: Contact }) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useDeleteContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

// Lead Queries - Mock implementation
export function useGetAllLeads() {
  const { actor, isFetching } = useActor();

  return useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
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
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, lead }: { leadId: string; lead: Lead }) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

// Opportunity Queries - Mock implementation
export function useGetAllOpportunities() {
  const { actor, isFetching } = useActor();

  return useQuery<Opportunity[]>({
    queryKey: ['opportunities'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
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
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUpdateOpportunity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ opportunityId, opportunity }: { opportunityId: string; opportunity: Opportunity }) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useDeleteOpportunity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunityId: string) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

// CRM Stats - Mock implementation
export function useGetCrmStats() {
  const { actor, isFetching } = useActor();

  return useQuery<CrmStats>({
    queryKey: ['crmStats'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
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

// Pipeline Dashboard - Mock implementation
export function useGetPipelineDashboard() {
  const { actor, isFetching } = useActor();

  return useQuery<CrmDashboard>({
    queryKey: ['pipelineDashboard'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
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

// Employee Queries - Mock implementation
export function useGetAllEmployees() {
  const { actor, isFetching } = useActor();

  return useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
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
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, employee }: { employeeId: string; employee: Employee }) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useDeleteEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// Department Queries - Mock implementation
export function useGetAllDepartments() {
  const { actor, isFetching } = useActor();

  return useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDepartment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (department: Department) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useUpdateDepartment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ departmentId, department }: { departmentId: string; department: Department }) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useDeleteDepartment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (departmentId: string) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

// Leave Request Queries - Mock implementation
export function useGetAllLeaveRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<LeaveRequest[]>({
    queryKey: ['leaveRequests'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingLeaves() {
  const { actor, isFetching } = useActor();

  return useQuery<LeaveRequest[]>({
    queryKey: ['pendingLeaves'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveLeaveRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaveId: string) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLeaves'] });
    },
  });
}

export function useApproveLeave() {
  return useApproveLeaveRequest();
}

export function useRejectLeaveRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaveId: string) => {
      // TODO: Implement when backend method is available
      throw new Error('Backend method not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLeaves'] });
    },
  });
}

export function useRejectLeave() {
  return useRejectLeaveRequest();
}

// HR Dashboard - Mock implementation
export function useGetHRDashboard() {
  const { actor, isFetching } = useActor();

  return useQuery<HRDashboard>({
    queryKey: ['hrDashboard'],
    queryFn: async () => {
      // TODO: Implement when backend method is available
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
