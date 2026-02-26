/**
 * Amadeus API Base Helper
 * Provides authenticated GET/POST with caching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import AMADEUS_CONFIG from './amadeusConfig';
import { getAccessToken } from './amadeusAuth';

// Include env in prefix so test/prod caches never collide
const ENV_TAG = AMADEUS_CONFIG.BASE_URL.includes('test') ? 'test' : 'prod';
const CACHE_PREFIX = `amadeus_${ENV_TAG}_`;

/**
 * Get cached API response
 */
async function getCached(cacheKey, ttlMs) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + cacheKey);
    if (!raw) return null;

    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > ttlMs) {
      await AsyncStorage.removeItem(CACHE_PREFIX + cacheKey);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Save API response to cache
 */
async function setCache(cacheKey, data) {
  try {
    await AsyncStorage.setItem(
      CACHE_PREFIX + cacheKey,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (error) {
    console.warn('Amadeus cache write error:', error);
  }
}

/**
 * Build a cache key from path and params
 */
function buildCacheKey(path, params) {
  const paramStr = params
    ? Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    : '';
  return `${path}?${paramStr}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Authenticated GET request to Amadeus API
 * @param {string} path - API path (e.g., '/v1/shopping/flight-offers')
 * @param {Object} params - Query parameters
 * @param {number} cacheTtl - Cache duration in ms (0 = no cache)
 * @returns {Promise<Object|null>} Parsed response data or null on error
 */
export async function amadeusGet(path, params = {}, cacheTtl = 0) {
  // Check cache first
  if (cacheTtl > 0) {
    const cacheKey = buildCacheKey(path, params);
    const cached = await getCached(cacheKey, cacheTtl);
    if (cached) {
      console.log('[Amadeus] Cache HIT:', path);
      return cached;
    }
  }

  try {
    const token = await getAccessToken();
    const queryString = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    const url = `${AMADEUS_CONFIG.BASE_URL}${path}${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 429) {
      console.log('[Amadeus] Rate limited on:', path);
      return null;
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.log('[Amadeus] API error:', response.status, path, errorBody.substring(0, 200));
      return null;
    }

    const data = await response.json();
    console.log('[Amadeus] GET success:', path, '- results:', data?.data?.length ?? 'N/A');

    // Cache successful response
    if (cacheTtl > 0) {
      const cacheKey = buildCacheKey(path, params);
      await setCache(cacheKey, data);
    }

    return data;
  } catch (error) {
    console.log('[Amadeus] API fetch error:', error.message, path);
    return null;
  }
}

/**
 * Authenticated POST request to Amadeus API
 * @param {string} path - API path
 * @param {Object} body - Request body
 * @param {number} cacheTtl - Cache duration in ms (0 = no cache)
 * @returns {Promise<Object|null>} Parsed response data or null on error
 */
export async function amadeusPost(path, body = {}, cacheTtl = 0) {
  // Check cache for POST too (useful for search queries)
  if (cacheTtl > 0) {
    const cacheKey = buildCacheKey(path, body);
    const cached = await getCached(cacheKey, cacheTtl);
    if (cached) return cached;
  }

  try {
    const token = await getAccessToken();
    const url = `${AMADEUS_CONFIG.BASE_URL}${path}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      console.warn('Amadeus rate limited');
      return null;
    }

    if (!response.ok) {
      console.warn('Amadeus API error:', response.status, path);
      return null;
    }

    const data = await response.json();

    // Cache successful response
    if (cacheTtl > 0) {
      const cacheKey = buildCacheKey(path, body);
      await setCache(cacheKey, data);
    }

    return data;
  } catch (error) {
    console.warn('Amadeus API fetch error:', error.message, path);
    return null;
  }
}

/**
 * Clear all Amadeus cached data
 */
export async function clearAmadeusCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    // Clear all amadeus keys (any environment)
    const amadeusKeys = keys.filter(k => k.startsWith('amadeus_'));
    if (amadeusKeys.length > 0) {
      await AsyncStorage.multiRemove(amadeusKeys);
      console.log('[Amadeus] Cleared', amadeusKeys.length, 'cached entries');
    }
  } catch (error) {
    console.warn('Failed to clear Amadeus cache:', error);
  }
}
