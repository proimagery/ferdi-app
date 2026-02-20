/**
 * Amadeus OAuth2 Token Management
 * Handles client_credentials flow with auto-refresh
 */

import AMADEUS_CONFIG from './amadeusConfig';

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Get a valid access token, refreshing if expired
 * @returns {Promise<string>} Bearer token
 */
export async function getAccessToken() {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  try {
    console.log('[Amadeus] Requesting auth token...');
    console.log('[Amadeus] API_KEY present:', !!AMADEUS_CONFIG.API_KEY, 'length:', AMADEUS_CONFIG.API_KEY?.length);

    const response = await fetch(
      `${AMADEUS_CONFIG.BASE_URL}/v1/security/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${encodeURIComponent(AMADEUS_CONFIG.API_KEY)}&client_secret=${encodeURIComponent(AMADEUS_CONFIG.API_SECRET)}`,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[Amadeus] Auth FAILED:', response.status, errorText);
      throw new Error(`Auth failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Amadeus] Auth SUCCESS - token received');
    cachedToken = data.access_token;
    // Token expires in ~1799 seconds, store absolute expiry time
    tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    return cachedToken;
  } catch (error) {
    console.warn('Amadeus auth fetch error:', error);
    // Clear stale token on failure
    cachedToken = null;
    tokenExpiresAt = 0;
    throw error;
  }
}

/**
 * Clear cached token (useful for testing or forced re-auth)
 */
export function clearToken() {
  cachedToken = null;
  tokenExpiresAt = 0;
}
