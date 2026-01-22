import AsyncStorage from '@react-native-async-storage/async-storage';
import { currencyData, updateCurrencyRates as updateCurrencyDataRates } from './currencyData';

const CURRENCY_STORAGE_KEY = '@ferdi_currency_rates';
const LAST_UPDATE_KEY = '@ferdi_currency_last_update';
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Using exchangerate-api.com free tier (no API key required for basic usage)
// Fallback to exchangerate.host if needed
const API_URLS = [
  'https://open.er-api.com/v6/latest/USD',
  'https://api.exchangerate.host/latest?base=USD',
];

/**
 * Fetches latest currency rates from API
 * @returns {Promise<Object>} Currency rates object
 */
async function fetchCurrencyRates() {
  for (const url of API_URLS) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`Currency API ${url} failed with status:`, response.status);
        continue;
      }

      const data = await response.json();

      // Handle different API response formats
      const rates = data.rates || data.conversion_rates;

      if (rates && Object.keys(rates).length > 0) {
        console.log('Successfully fetched currency rates from:', url);
        return rates;
      }
    } catch (error) {
      console.warn(`Error fetching from ${url}:`, error.message);
      continue;
    }
  }

  throw new Error('All currency API endpoints failed');
}

/**
 * Checks if currency rates need to be updated (older than 24 hours)
 * @returns {Promise<boolean>}
 */
export async function shouldUpdateRates() {
  try {
    const lastUpdate = await AsyncStorage.getItem(LAST_UPDATE_KEY);
    if (!lastUpdate) {
      return true; // Never updated before
    }

    const timeSinceUpdate = Date.now() - parseInt(lastUpdate, 10);
    return timeSinceUpdate >= UPDATE_INTERVAL;
  } catch (error) {
    console.error('Error checking update time:', error);
    return true; // Default to updating on error
  }
}

/**
 * Updates currency rates from API and stores them locally
 * Also updates the currencyData object for immediate use
 * @returns {Promise<Object>} Updated currency rates
 */
export async function updateCurrencyRates() {
  try {
    console.log('Updating currency rates...');
    const rates = await fetchCurrencyRates();

    // Store the rates
    await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(rates));
    await AsyncStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());

    // Update the currencyData object with new rates
    updateCurrencyDataRates(rates);

    console.log('Currency rates updated successfully');
    return rates;
  } catch (error) {
    console.error('Failed to update currency rates:', error);
    // Return null to indicate failure, caller should use cached or default rates
    return null;
  }
}

/**
 * Gets current currency rates (from cache or default)
 * @returns {Promise<Object>} Currency rates object
 */
export async function getCurrencyRates() {
  try {
    const cachedRates = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
    if (cachedRates) {
      return JSON.parse(cachedRates);
    }
  } catch (error) {
    console.error('Error reading cached rates:', error);
  }

  // If no cached rates, extract rates from default currencyData
  const defaultRates = {};
  Object.values(currencyData).forEach(country => {
    if (country.currency && country.rate) {
      defaultRates[country.currency] = country.rate;
    }
  });

  return defaultRates;
}

/**
 * Gets the exchange rate for a specific currency code
 * @param {string} currencyCode - ISO currency code (e.g., 'EUR', 'GBP')
 * @returns {Promise<number>} Exchange rate relative to USD
 */
export async function getExchangeRate(currencyCode) {
  const rates = await getCurrencyRates();
  return rates[currencyCode] || 1.0;
}

/**
 * Initializes currency service - checks and updates rates if needed
 * Call this when the app starts
 * @returns {Promise<void>}
 */
export async function initializeCurrencyService() {
  try {
    const needsUpdate = await shouldUpdateRates();

    if (needsUpdate) {
      console.log('Currency rates are stale, updating...');
      await updateCurrencyRates();
    } else {
      console.log('Currency rates are up to date');
      // Even if not updating from API, load cached rates into currencyData
      const cachedRates = await getCurrencyRates();
      if (cachedRates && Object.keys(cachedRates).length > 0) {
        updateCurrencyDataRates(cachedRates);
      }
    }
  } catch (error) {
    console.error('Error initializing currency service:', error);
  }
}

/**
 * Gets currency info for a country with live rates
 * @param {string} countryName - Name of the country
 * @returns {Promise<Object>} Currency info with live rate
 */
export async function getCurrencyInfoLive(countryName) {
  const defaultInfo = currencyData[countryName] || { currency: 'USD', symbol: '$', rate: 1.0 };

  try {
    const rates = await getCurrencyRates();
    const liveRate = rates[defaultInfo.currency];

    if (liveRate) {
      return {
        ...defaultInfo,
        rate: liveRate,
      };
    }
  } catch (error) {
    console.error('Error getting live currency info:', error);
  }

  // Fallback to default rate
  return defaultInfo;
}

/**
 * Forces an immediate update of currency rates
 * @returns {Promise<boolean>} Success status
 */
export async function forceUpdateRates() {
  const rates = await updateCurrencyRates();
  return rates !== null;
}
