// City search using OpenStreetMap Nominatim API
// This provides access to millions of cities worldwide

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

// Cache for search results to reduce API calls
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debounce timeout reference
let searchTimeout = null;

/**
 * Search for cities using OpenStreetMap Nominatim API
 * @param {string} query - Search query (city name)
 * @returns {Promise<Array>} - Array of city results
 */
export const searchCitiesAPI = async (query) => {
  if (!query || query.length < 2) return [];

  // Check cache first
  const cacheKey = query.toLowerCase().trim();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.results;
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '15',
      featuretype: 'city',
      dedupe: '1',
    });

    const response = await fetch(`${NOMINATIM_API}?${params}`, {
      headers: {
        'User-Agent': 'FerdiTravelApp/1.0',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform results to our format
    const results = data
      .filter(item => {
        // Filter for places that are cities, towns, or villages
        const type = item.type || '';
        const placeClass = item.class || '';
        return (
          placeClass === 'place' ||
          placeClass === 'boundary' ||
          type === 'city' ||
          type === 'town' ||
          type === 'village' ||
          type === 'municipality' ||
          type === 'administrative'
        );
      })
      .map(item => {
        const address = item.address || {};

        // Get the city name (try multiple fields)
        const cityName = address.city ||
                        address.town ||
                        address.village ||
                        address.municipality ||
                        address.county ||
                        item.name ||
                        '';

        // Get the country name
        const countryName = address.country || '';

        // Get state/region for US cities
        const state = address.state || address.region || '';

        return {
          city: cityName,
          country: countryName,
          state: state,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          displayName: item.display_name,
          type: item.type,
        };
      })
      .filter(item => item.city && item.country && item.latitude && item.longitude);

    // Remove duplicates based on city + country + state
    const uniqueResults = [];
    const seen = new Set();
    for (const item of results) {
      const key = `${item.city.toLowerCase()}-${item.country.toLowerCase()}-${item.state.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueResults.push(item);
      }
    }

    // Cache results
    searchCache.set(cacheKey, {
      results: uniqueResults,
      timestamp: Date.now(),
    });

    return uniqueResults;
  } catch (error) {
    console.error('City search error:', error);
    return [];
  }
};

/**
 * Debounced search function to prevent too many API calls
 * @param {string} query - Search query
 * @param {function} callback - Callback with results
 * @param {number} delay - Debounce delay in ms (default 300)
 */
export const searchCitiesDebounced = (query, callback, delay = 300) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  if (!query || query.length < 2) {
    callback([]);
    return;
  }

  searchTimeout = setTimeout(async () => {
    const results = await searchCitiesAPI(query);
    callback(results);
  }, delay);
};

/**
 * Get coordinates for a specific city (reverse geocoding backup)
 * @param {string} cityName - City name
 * @param {string} countryName - Country name
 * @returns {Promise<Object|null>} - Coordinates or null
 */
export const getCityCoordinatesAPI = async (cityName, countryName) => {
  try {
    const query = `${cityName}, ${countryName}`;
    const results = await searchCitiesAPI(query);

    if (results.length > 0) {
      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };
    }

    return null;
  } catch (error) {
    console.error('Get coordinates error:', error);
    return null;
  }
};

/**
 * Clear the search cache
 */
export const clearSearchCache = () => {
  searchCache.clear();
};
