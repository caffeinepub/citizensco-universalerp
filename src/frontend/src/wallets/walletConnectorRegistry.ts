import type { WalletConnector, WalletProviderId } from './walletConnectorTypes';
import { PlugConnector } from './connectors/plugConnector';
import { OisyConnector } from './connectors/oisyConnector';

const connectors: WalletConnector[] = [
  new PlugConnector(),
  new OisyConnector(),
];

export function getWalletConnectors(): WalletConnector[] {
  return connectors;
}

export function getWalletConnector(id: WalletProviderId): WalletConnector | undefined {
  return connectors.find((c) => c.id === id);
}
