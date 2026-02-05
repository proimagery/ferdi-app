/**
 * Country Service
 * Handles fetching and caching country data from Supabase
 */

import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'ferdi_countries_cache';
const CACHE_TIMESTAMP_KEY = 'ferdi_countries_cache_timestamp';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch all active countries from Supabase
 */
export const fetchCountriesFromSupabase = async () => {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('is_active', true)
    .order('rank_visitors', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch countries: ${error.message}`);
  }

  return data;
};

/**
 * Transform Supabase record to app format
 * (converts snake_case to camelCase for consistency with existing code)
 */
export const transformCountryFromDB = (record) => {
  return {
    id: record.id,
    name: record.name,
    flag: record.flag,
    continent: record.continent,
    population: record.population,
    capital: record.capital,
    leader: record.leader,
    language: record.language,
    currency: record.currency,
    highlights: record.highlights || [],
    mainAirports: record.main_airports || [],
    mainTrainStations: record.main_train_stations || [],
    topHotels: record.top_hotels || [],
    avgFlightCost: record.avg_flight_cost,
    avgTrainCost: record.avg_train_cost,
    bestTimeToVisit: record.best_time_to_visit,
    visaRequired: record.visa_required,
    rankings: record.rankings,
    // Image URLs
    headerImageUrl: record.header_image_url,
    attractionImages: record.attraction_images || {},
    // Keep extracted ranks for efficient sorting
    rankVisitors: record.rank_visitors,
    rankSafety: record.rank_safety,
    rankAffordability: record.rank_affordability,
    rankFood: record.rank_food,
    rankBeaches: record.rank_beaches,
    rankMountains: record.rank_mountains,
    rankOutdoors: record.rank_outdoors,
  };
};

/**
 * Get cached countries from AsyncStorage
 * @param {boolean} ignoreExpiry - If true, return cache even if expired
 */
export const getCachedCountries = async (ignoreExpiry = false) => {
  try {
    const [cachedData, timestamp] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEY),
      AsyncStorage.getItem(CACHE_TIMESTAMP_KEY)
    ]);

    if (!cachedData || !timestamp) {
      return null;
    }

    const age = Date.now() - parseInt(timestamp, 10);
    if (!ignoreExpiry && age > CACHE_DURATION_MS) {
      return null; // Cache expired
    }

    return JSON.parse(cachedData);
  } catch (error) {
    console.warn('Failed to read countries cache:', error);
    return null;
  }
};

/**
 * Save countries to AsyncStorage cache
 */
export const cacheCountries = async (countries) => {
  try {
    await Promise.all([
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(countries)),
      AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    ]);
  } catch (error) {
    console.warn('Failed to cache countries:', error);
  }
};

/**
 * Clear the countries cache
 */
export const clearCountriesCache = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(CACHE_KEY),
      AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY)
    ]);
  } catch (error) {
    console.warn('Failed to clear countries cache:', error);
  }
};

/**
 * Get countries with intelligent caching
 * Priority: Valid cache -> Supabase -> Stale cache -> Bundled fallback
 *
 * @param {boolean} forceRefresh - If true, skip cache and fetch from Supabase
 * @returns {Promise<{data: Array, source: string}>}
 */
export const getCountries = async (forceRefresh = false) => {
  try {
    // Check valid cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await getCachedCountries(false);
      if (cached && cached.length > 0) {
        return { data: cached, source: 'cache' };
      }
    }

    // Fetch from Supabase
    const rawData = await fetchCountriesFromSupabase();
    const countries = rawData.map(transformCountryFromDB);

    // Update cache
    await cacheCountries(countries);

    return { data: countries, source: 'network' };
  } catch (error) {
    console.error('Error fetching countries:', error);

    // Try stale cache
    const staleCache = await getCachedCountries(true);
    if (staleCache && staleCache.length > 0) {
      return { data: staleCache, source: 'stale_cache' };
    }

    // Last resort: bundled fallback data
    try {
      const fallbackData = require('../data/countryFallback.json');
      return { data: fallbackData, source: 'fallback' };
    } catch (fallbackError) {
      // If even fallback fails, throw the original error
      throw error;
    }
  }
};

/**
 * Look up a country by name
 */
export const getCountryByName = async (name) => {
  const { data } = await getCountries();
  return data.find(c =>
    c.name.toLowerCase() === name.toLowerCase()
  ) || null;
};

/**
 * Get countries sorted by a specific ranking category
 */
export const getCountriesByCategory = (countries, category) => {
  const rankKeyMap = {
    visitors: 'rankVisitors',
    safety: 'rankSafety',
    affordability: 'rankAffordability',
    food: 'rankFood',
    beaches: 'rankBeaches',
    mountains: 'rankMountains',
    outdoors: 'rankOutdoors',
  };

  const rankKey = rankKeyMap[category] || 'rankVisitors';

  return [...countries].sort((a, b) => {
    const rankA = a[rankKey] ?? 999;
    const rankB = b[rankKey] ?? 999;
    return rankA - rankB;
  });
};

/**
 * Filter countries by search query (name or continent)
 */
export const filterCountriesBySearch = (countries, query) => {
  if (!query || !query.trim()) {
    return countries;
  }

  const lowerQuery = query.toLowerCase().trim();
  return countries.filter(country =>
    country.name.toLowerCase().includes(lowerQuery) ||
    country.continent.toLowerCase().includes(lowerQuery)
  );
};
