/**
 * Google Places Photos Service
 * Fetches photos from Google Places API with caching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import GOOGLE_PLACES_CONFIG from './google/googleConfig';

const GOOGLE_PLACES_API_KEY = GOOGLE_PLACES_CONFIG.API_KEY;

const CACHE_PREFIX = 'places_photo_';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Get cached photo reference
 */
const getCachedPhotoRef = async (searchQuery) => {
  try {
    const key = CACHE_PREFIX + searchQuery.toLowerCase().replace(/\s+/g, '_');
    const cached = await AsyncStorage.getItem(key);

    if (!cached) return null;

    const { photoRef, timestamp } = JSON.parse(cached);

    // Check if cache is still valid
    if (Date.now() - timestamp > CACHE_DURATION) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return photoRef;
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
};

/**
 * Save photo reference to cache
 */
const cachePhotoRef = async (searchQuery, photoRef) => {
  try {
    const key = CACHE_PREFIX + searchQuery.toLowerCase().replace(/\s+/g, '_');
    await AsyncStorage.setItem(key, JSON.stringify({
      photoRef,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Cache write error:', error);
  }
};

/**
 * Search for a place and get photo reference
 */
const getPhotoReference = async (searchQuery) => {
  // Check cache first
  const cached = await getCachedPhotoRef(searchQuery);
  if (cached) return cached;

  try {
    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.photos'
        },
        body: JSON.stringify({ textQuery: searchQuery })
      }
    );

    if (!response.ok) {
      console.warn('Places API error:', response.status);
      return null;
    }

    const data = await response.json();
    const photoRef = data.places?.[0]?.photos?.[0]?.name;

    // Cache the reference
    if (photoRef) {
      await cachePhotoRef(searchQuery, photoRef);
    }

    return photoRef;
  } catch (error) {
    console.warn('Places API fetch error:', error);
    return null;
  }
};

/**
 * Build photo URL from reference
 */
const buildPhotoUrl = (photoReference, maxWidth = 800) => {
  return `https://places.googleapis.com/v1/${photoReference}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_PLACES_API_KEY}`;
};

/**
 * Get photo URL for a search query
 * Main function for components to use
 *
 * @param {string} searchQuery - e.g., "Eiffel Tower Paris" or "Nepal landmark"
 * @param {number} maxWidth - Max width in pixels (default 800)
 * @returns {Promise<string|null>} Photo URL or null if not found
 */
export const getPlacePhotoUrl = async (searchQuery, maxWidth = 800) => {
  if (!searchQuery) return null;

  const photoRef = await getPhotoReference(searchQuery);
  if (!photoRef) return null;

  return buildPhotoUrl(photoRef, maxWidth);
};

/**
 * Clear all cached photo references
 */
export const clearPhotoCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const photoKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(photoKeys);
  } catch (error) {
    console.warn('Failed to clear photo cache:', error);
  }
};
