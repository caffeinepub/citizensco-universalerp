// Wallet connector types and interfaces

export type WalletProviderId = 'plug' | 'oisy';

export type WalletAvailability = 'unavailable' | 'available' | 'connected';

export interface ConnectedIdentityInfo {
  principal: string;
  accountId?: string;
}

export interface WalletConnector {
  id: WalletProviderId;
  name: string;
  icon?: string;
  
  // Check if wallet is installed/available
  isAvailable(): Promise<boolean>;
  
  // Connect to wallet
  connect(): Promise<ConnectedIdentityInfo>;
  
  // Disconnect from wallet
  disconnect(): Promise<void>;
  
  // Get current connection state
  getConnectionState(): Promise<{
    isConnected: boolean;
    identity?: ConnectedIdentityInfo;
  }>;
}
