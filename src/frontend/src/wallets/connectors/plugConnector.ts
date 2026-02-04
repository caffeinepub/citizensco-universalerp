import type { WalletConnector, ConnectedIdentityInfo } from '../walletConnectorTypes';

export class PlugConnector implements WalletConnector {
  id = 'plug' as const;
  name = 'Plug Wallet';

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && !!window.ic?.plug;
  }

  async connect(): Promise<ConnectedIdentityInfo> {
    if (!window.ic?.plug) {
      throw new Error('Plug wallet is not installed. Please install the Plug browser extension.');
    }

    try {
      const connected = await window.ic.plug.requestConnect({
        whitelist: [],
        host: window.location.origin,
      });

      if (!connected) {
        throw new Error('User rejected connection request');
      }

      const principal = await window.ic.plug.getPrincipal();
      const accountId = await window.ic.plug.getAccountID();

      return {
        principal: principal.toString(),
        accountId,
      };
    } catch (error: any) {
      throw new Error(`Failed to connect to Plug: ${error.message || 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    if (window.ic?.plug) {
      try {
        await window.ic.plug.disconnect();
      } catch (error) {
        console.error('Error disconnecting from Plug:', error);
      }
    }
  }

  async getConnectionState(): Promise<{
    isConnected: boolean;
    identity?: ConnectedIdentityInfo;
  }> {
    if (!window.ic?.plug) {
      return { isConnected: false };
    }

    try {
      const isConnected = window.ic.plug.isConnected;
      if (!isConnected) {
        return { isConnected: false };
      }

      const principal = await window.ic.plug.getPrincipal();
      const accountId = await window.ic.plug.getAccountID();

      return {
        isConnected: true,
        identity: {
          principal: principal.toString(),
          accountId,
        },
      };
    } catch (error) {
      return { isConnected: false };
    }
  }
}
