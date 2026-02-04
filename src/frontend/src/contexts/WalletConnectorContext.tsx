import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { WalletProviderId, WalletConnector, ConnectedIdentityInfo, WalletAvailability } from '../wallets/walletConnectorTypes';
import { getWalletConnectors, getWalletConnector } from '../wallets/walletConnectorRegistry';

interface WalletConnectorState {
  selectedProviderId: WalletProviderId | null;
  availability: Record<WalletProviderId, WalletAvailability>;
  connectedIdentity: ConnectedIdentityInfo | null;
  isConnecting: boolean;
  error: string | null;
}

interface WalletConnectorContextValue extends WalletConnectorState {
  availableConnectors: WalletConnector[];
  selectProvider: (id: WalletProviderId) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletConnectorContext = createContext<WalletConnectorContextValue | undefined>(undefined);

export function WalletConnectorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletConnectorState>({
    selectedProviderId: null,
    availability: {} as Record<WalletProviderId, WalletAvailability>,
    connectedIdentity: null,
    isConnecting: false,
    error: null,
  });

  const availableConnectors = getWalletConnectors();

  // Check availability of all connectors on mount
  useEffect(() => {
    const checkAvailability = async () => {
      const availability: Record<WalletProviderId, WalletAvailability> = {} as any;
      
      for (const connector of availableConnectors) {
        const isAvailable = await connector.isAvailable();
        availability[connector.id] = isAvailable ? 'available' : 'unavailable';
      }

      setState((prev) => {
        // Only auto-select if no provider has been chosen yet
        if (prev.selectedProviderId === null) {
          // Prefer Oisy when available, else Plug when available, else keep null
          let defaultProviderId: WalletProviderId | null = null;
          
          if (availability['oisy'] === 'available') {
            defaultProviderId = 'oisy';
          } else if (availability['plug'] === 'available') {
            defaultProviderId = 'plug';
          }

          return {
            ...prev,
            availability,
            selectedProviderId: defaultProviderId,
          };
        }

        return { ...prev, availability };
      });
    };

    checkAvailability();
  }, []);

  // Check connection state when provider is selected
  useEffect(() => {
    if (!state.selectedProviderId) return;

    const checkConnectionState = async () => {
      const connector = getWalletConnector(state.selectedProviderId!);
      if (!connector) return;

      const connectionState = await connector.getConnectionState();
      
      setState((prev) => ({
        ...prev,
        connectedIdentity: connectionState.identity || null,
        availability: {
          ...prev.availability,
          [connector.id]: connectionState.isConnected ? 'connected' : 'available',
        },
      }));
    };

    checkConnectionState();
  }, [state.selectedProviderId]);

  const selectProvider = useCallback((id: WalletProviderId) => {
    setState((prev) => ({
      ...prev,
      selectedProviderId: id,
      error: null,
    }));
  }, []);

  const connect = useCallback(async () => {
    if (!state.selectedProviderId) {
      setState((prev) => ({ ...prev, error: 'No wallet provider selected' }));
      return;
    }

    const connector = getWalletConnector(state.selectedProviderId);
    if (!connector) {
      setState((prev) => ({ ...prev, error: 'Wallet connector not found' }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const identity = await connector.connect();
      
      setState((prev) => ({
        ...prev,
        connectedIdentity: identity,
        isConnecting: false,
        availability: {
          ...prev.availability,
          [connector.id]: 'connected',
        },
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect to wallet',
      }));
    }
  }, [state.selectedProviderId]);

  const disconnect = useCallback(async () => {
    if (!state.selectedProviderId) return;

    const connector = getWalletConnector(state.selectedProviderId);
    if (!connector) return;

    try {
      await connector.disconnect();
      
      setState((prev) => ({
        ...prev,
        connectedIdentity: null,
        availability: {
          ...prev.availability,
          [connector.id]: 'available',
        },
      }));
    } catch (error: any) {
      console.error('Error disconnecting:', error);
    }
  }, [state.selectedProviderId]);

  const value: WalletConnectorContextValue = {
    ...state,
    availableConnectors,
    selectProvider,
    connect,
    disconnect,
  };

  return (
    <WalletConnectorContext.Provider value={value}>
      {children}
    </WalletConnectorContext.Provider>
  );
}

export function useWalletConnector() {
  const context = useContext(WalletConnectorContext);
  if (!context) {
    throw new Error('useWalletConnector must be used within WalletConnectorProvider');
  }
  return context;
}
