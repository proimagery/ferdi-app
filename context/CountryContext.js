/**
 * Country Context
 * Provides country data to all screens with loading states and caching
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import {
  getCountries,
  getCountriesByCategory,
  filterCountriesBySearch,
  clearCountriesCache
} from '../services/countryService';

const CountryContext = createContext(null);

export const CountryProvider = ({ children }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(null); // 'cache', 'network', 'stale_cache', 'fallback'

  /**
   * Load countries from service (respects cache)
   */
  const loadCountries = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const { data, source } = await getCountries(forceRefresh);
      setCountries(data);
      setDataSource(source);
    } catch (err) {
      console.error('CountryContext: Failed to load countries:', err);
      setError(err.message || 'Failed to load country data');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Force refresh from Supabase
   */
  const refreshCountries = useCallback(async () => {
    return loadCountries(true);
  }, [loadCountries]);

  /**
   * Get countries sorted by ranking category
   */
  const getSortedByCategory = useCallback((category) => {
    return getCountriesByCategory(countries, category);
  }, [countries]);

  /**
   * Get countries filtered by search query
   */
  const getFilteredBySearch = useCallback((query) => {
    return filterCountriesBySearch(countries, query);
  }, [countries]);

  /**
   * Get countries filtered and sorted
   */
  const getFilteredAndSorted = useCallback((query, category) => {
    const filtered = filterCountriesBySearch(countries, query);
    return getCountriesByCategory(filtered, category);
  }, [countries]);

  /**
   * Find a country by name
   */
  const findCountryByName = useCallback((name) => {
    if (!name || !countries.length) return null;
    return countries.find(c =>
      c.name.toLowerCase() === name.toLowerCase()
    ) || null;
  }, [countries]);

  /**
   * Clear cache and reload
   */
  const resetCache = useCallback(async () => {
    await clearCountriesCache();
    await loadCountries(true);
  }, [loadCountries]);

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const value = {
    // Data
    countries,
    loading,
    error,
    dataSource,

    // Actions
    refreshCountries,
    resetCache,

    // Helpers
    getSortedByCategory,
    getFilteredBySearch,
    getFilteredAndSorted,
    findCountryByName,

    // Computed values
    countryCount: countries.length,
    isFromCache: dataSource === 'cache' || dataSource === 'stale_cache',
    isStaleData: dataSource === 'stale_cache' || dataSource === 'fallback',
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
};

/**
 * Hook to access country data and actions
 */
export const useCountries = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountries must be used within a CountryProvider');
  }
  return context;
};

export default CountryContext;
