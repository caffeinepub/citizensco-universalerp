import type { WalletConnector, ConnectedIdentityInfo } from '../walletConnectorTypes';

export class OisyConnector implements WalletConnector {
  id = 'oisy' as const;
  name = 'Oisy Wallet';

  async isAvailable(): Promise<boolean> {
    // Oisy uses a different detection pattern - check for the provider
    return typeof window !== 'undefined' && !!window.ic?.oisy;
  }

  async connect(): Promise<ConnectedIdentityInfo> {
    if (!window.ic?.oisy) {
      throw new Error('Oisy wallet is not available. Please ensure Oisy is installed and accessible.');
    }

    try {
      const result = await window.ic.oisy.connect();
      
      return {
        principal: result.principal,
      };
    } catch (error: any) {
      throw new Error(`Failed to connect to Oisy: ${error.message || 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    if (window.ic?.oisy) {
      try {
        await window.ic.oisy.disconnect();
      } catch (error) {
        console.error('Error disconnecting from Oisy:', error);
      }
    }
  }

  async getConnectionState(): Promise<{
    isConnected: boolean;
    identity?: ConnectedIdentityInfo;
  }> {
    if (!window.ic?.oisy) {
      return { isConnected: false };
    }

    try {
      const isConnected = window.ic.oisy.isConnected ?? false;
      if (!isConnected) {
        return { isConnected: false };
      }

      const principal = await window.ic.oisy.getPrincipal();

      return {
        isConnected: true,
        identity: {
          principal,
        },
      };
    } catch (error) {
      return { isConnected: false };
    }
  }
}
