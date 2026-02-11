/**
 * Utility to normalize backend/authorization errors into safe, English user-facing messages
 * for wallet flows. Maps common unauthorized/forbidden traps to consistent messages.
 */

export function normalizeWalletError(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Authorization errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('permission')) {
    if (lowerMessage.includes('member')) {
      return 'You must be a member of this organization to access wallet data';
    }
    if (lowerMessage.includes('admin')) {
      return 'Only organization admins can perform this action';
    }
    return 'You do not have permission to perform this action';
  }

  // Organization errors
  if (lowerMessage.includes('organization not found')) {
    return 'Organization not found. Please select a valid organization';
  }

  if (lowerMessage.includes('select an organization') || lowerMessage.includes('no organization')) {
    return 'Please select an organization to manage wallets';
  }

  // Wallet errors
  if (lowerMessage.includes('wallet not found')) {
    return 'Wallet not found';
  }

  if (lowerMessage.includes('wallet does not belong')) {
    return 'This wallet does not belong to the selected organization';
  }

  // Backend not ready
  if (lowerMessage.includes('actor not available') || lowerMessage.includes('backend')) {
    return 'Backend service is not available. Please try again';
  }

  // Generic fallback
  return 'An error occurred. Please try again';
}
