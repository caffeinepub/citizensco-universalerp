// Ambient type declarations for wallet inpage providers

interface PlugProvider {
  isConnected: boolean;
  requestConnect(options?: { whitelist?: string[]; host?: string }): Promise<boolean>;
  disconnect(): Promise<void>;
  getPrincipal(): Promise<string>;
  getAccountID(): Promise<string>;
  agent?: any;
}

interface OisyProvider {
  isConnected?: boolean;
  connect(): Promise<{ principal: string }>;
  disconnect(): Promise<void>;
  getPrincipal(): Promise<string>;
}

declare global {
  interface Window {
    ic?: {
      plug?: PlugProvider;
      oisy?: OisyProvider;
    };
  }
}

export {};
