import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListOrganizations } from '../hooks/useQueries';
import type { Organization } from '../backend';

interface OrganizationContextType {
  activeOrganization: Organization | null;
  setActiveOrganization: (org: Organization | null) => void;
  organizations: Organization[];
  isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

const STORAGE_KEY = 'activeOrganizationId';

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [activeOrganization, setActiveOrganizationState] = useState<Organization | null>(null);

  // Fetch organizations for the current user using real backend method
  const { data: organizations = [], isLoading } = useListOrganizations();

  // Hydrate active organization from localStorage and validate against current org list
  useEffect(() => {
    if (isLoading || organizations.length === 0) return;

    const storedOrgId = localStorage.getItem(STORAGE_KEY);
    
    if (storedOrgId) {
      // Check if stored org is still in the user's org list
      const storedOrg = organizations.find(org => org.id === storedOrgId);
      if (storedOrg) {
        setActiveOrganizationState(storedOrg);
      } else {
        // Fallback to first org if stored org is no longer available
        const fallbackOrg = organizations[0] || null;
        setActiveOrganizationState(fallbackOrg);
        if (fallbackOrg) {
          localStorage.setItem(STORAGE_KEY, fallbackOrg.id);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } else if (organizations.length > 0) {
      // No stored org, default to first available
      const defaultOrg = organizations[0];
      setActiveOrganizationState(defaultOrg);
      localStorage.setItem(STORAGE_KEY, defaultOrg.id);
    }
  }, [organizations, isLoading]);

  // Clear active org when user logs out
  useEffect(() => {
    if (!identity) {
      setActiveOrganizationState(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [identity]);

  const setActiveOrganization = (org: Organization | null) => {
    // Only allow setting an org that exists in the current organizations list
    if (org && !organizations.find(o => o.id === org.id)) {
      console.warn('Attempted to set an organization not in the current list');
      return;
    }

    // Cancel any pending wallet queries for the previous org
    if (activeOrganization) {
      queryClient.cancelQueries({ queryKey: ['orgWallets', activeOrganization.id] });
      queryClient.cancelQueries({ queryKey: ['orgWalletsSummary', activeOrganization.id] });
      queryClient.cancelQueries({ queryKey: ['orgWalletTransactions', activeOrganization.id] });
      queryClient.cancelQueries({ queryKey: ['orgWalletEvents', activeOrganization.id] });
      queryClient.cancelQueries({ queryKey: ['orgSidebarFinancials', activeOrganization.id] });
    }

    setActiveOrganizationState(org);
    
    if (org) {
      localStorage.setItem(STORAGE_KEY, org.id);
      // Invalidate wallet queries for the new org to trigger fresh fetch
      queryClient.invalidateQueries({ queryKey: ['orgWallets', org.id] });
      queryClient.invalidateQueries({ queryKey: ['orgWalletsSummary', org.id] });
      queryClient.invalidateQueries({ queryKey: ['orgWalletTransactions', org.id] });
      queryClient.invalidateQueries({ queryKey: ['orgWalletEvents', org.id] });
      queryClient.invalidateQueries({ queryKey: ['orgSidebarFinancials', org.id] });
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        activeOrganization,
        setActiveOrganization,
        organizations,
        isLoading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
