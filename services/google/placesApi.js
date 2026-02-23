/**
 * Google Places API Base Helper
 * Provides authenticated requests with AsyncStorage caching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import GOOGLE_PLACES_CONFIG from './googleConfig';

const CACHE_PREFIX = 'gplaces_';

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
    console.warn('Google Places cache write error:', error);
  }
}

/**
 * Build a cache key from path and body
 */
function buildCacheKey(path, body) {
  const bodyStr = body ? JSON.stringify(body) : '';
  return `${path}_${bodyStr}`.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 200);
}

/**
 * POST request to Google Places API (Text Search, etc.)
 * @param {string} path - API path (e.g., '/places:searchText')
 * @param {Object} body - Request body
 * @param {string} fieldMask - Comma-separated field mask for billing control
 * @param {number} cacheTtl - Cache duration in ms (0 = no cache)
 * @returns {Promise<Object|null>} Parsed response data or null on error
 */
export async function placesPost(path, body = {}, fieldMask = '', cacheTtl = 0) {
  if (cacheTtl > 0) {
    const cacheKey = buildCacheKey(path, body);
    const cached = await getCached(cacheKey, cacheTtl);
    if (cached) {
      console.log('[GooglePlaces] Cache HIT:', path);
      return cached;
    }
  }

  try {
    const url = `${GOOGLE_PLACES_CONFIG.BASE_URL}${path}`;

    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_CONFIG.API_KEY,
    };

    if (fieldMask) {
      headers['X-Goog-FieldMask'] = fieldMask;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      console.log('[GooglePlaces] Rate limited on:', path);
      return null;
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.log('[GooglePlaces] API error:', response.status, path, errorBody.substring(0, 200));
      return null;
    }

    const data = await response.json();
    console.log('[GooglePlaces] POST success:', path, '- results:', data?.places?.length ?? 'N/A');

    if (cacheTtl > 0) {
      const cacheKey = buildCacheKey(path, body);
      await setCache(cacheKey, data);
    }

    return data;
  } catch (error) {
    console.log('[GooglePlaces] API fetch error:', error.message, path);
    return null;
  }
}

/**
 * Build a Google Places photo URL
 * @param {string} photoName - Photo resource name (e.g., 'places/xxx/photos/yyy')
 * @param {number} maxHeight - Max height in pixels
 * @returns {string} Photo URL
 */
export function buildPhotoUrl(photoName, maxHeight = 400) {
  return `${GOOGLE_PLACES_CONFIG.BASE_URL}/${photoName}/media?maxHeightPx=${maxHeight}&key=${GOOGLE_PLACES_CONFIG.API_KEY}`;
}

/**
 * Clear all Google Places cached data
 */
export async function clearPlacesCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const placesKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    if (placesKeys.length > 0) {
      await AsyncStorage.multiRemove(placesKeys);
      console.log('[GooglePlaces] Cleared', placesKeys.length, 'cached entries');
    }
  } catch (error) {
    console.warn('Failed to clear Google Places cache:', error);
  }
}
