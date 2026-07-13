/**
 * Helper to normalize email addresses for consistent rate limiting
 */
export const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return 'noemail';
  return email.trim().toLowerCase();
};

/**
 * Key generators for authentication exponential backoff
 */
export const getAuthIpKey = (ip) => `auth:ip:${ip}`;
export const getAuthAccountKey = (email) => `auth:account:${normalizeEmail(email)}`;
export const getAuthCombinedKey = (ip, email) => `auth:ip_account:${ip}:${normalizeEmail(email)}`;
