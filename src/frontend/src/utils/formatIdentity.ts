/**
 * Format a principal or account ID for display by truncating the middle
 */
export function formatIdentity(identity: string, prefixLength = 8, suffixLength = 6): string {
  if (!identity || identity.length <= prefixLength + suffixLength) {
    return identity;
  }
  
  return `${identity.slice(0, prefixLength)}...${identity.slice(-suffixLength)}`;
}
