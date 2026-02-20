/**
 * Amadeus Market Insights Service
 * Booking trends, travel analytics, and busiest periods
 */

import { amadeusGet } from './amadeusApi';

const ONE_DAY = 24 * 60 * 60 * 1000;

/**
 * Get most booked destinations from a city
 * @param {string} cityCode - Origin city IATA code (e.g., "NYC")
 * @param {string} period - Month in YYYY-MM format (e.g., "2024-06")
 * @returns {Promise<Array>} Top booked destinations
 */
export async function getMostBooked(cityCode, period) {
  if (!cityCode || !period) return [];

  const result = await amadeusGet(
    '/v1/travel/analytics/air-traffic/booked',
    { originCityCode: cityCode, period },
    ONE_DAY
  );

  if (!result?.data) return [];

  return result.data.map(item => ({
    destination: item.destination,
    analytics: {
      travelers: item.analytics?.travelers?.score,
      flights: item.analytics?.flights?.score,
    },
  }));
}

/**
 * Get most traveled destinations from a city
 * @param {string} cityCode - Origin city IATA code
 * @param {string} period - Month in YYYY-MM format
 * @returns {Promise<Array>} Top traveled destinations
 */
export async function getMostTraveled(cityCode, period) {
  if (!cityCode || !period) return [];

  const result = await amadeusGet(
    '/v1/travel/analytics/air-traffic/traveled',
    { originCityCode: cityCode, period },
    ONE_DAY
  );

  if (!result?.data) return [];

  return result.data.map(item => ({
    destination: item.destination,
    analytics: {
      travelers: item.analytics?.travelers?.score,
      flights: item.analytics?.flights?.score,
    },
  }));
}

/**
 * Get busiest travel period for a city
 * @param {string} cityCode - City IATA code
 * @param {string} period - Year in YYYY format
 * @param {string} direction - 'ARRIVING' or 'DEPARTING'
 * @returns {Promise<Array>} Months ranked by traffic
 */
export async function getBusiestPeriod(cityCode, period, direction = 'ARRIVING') {
  if (!cityCode || !period) return [];

  const result = await amadeusGet(
    '/v1/travel/analytics/air-traffic/busiest-period',
    { cityCode, period, direction },
    ONE_DAY
  );

  if (!result?.data) return [];

  return result.data.map(item => ({
    period: item.period, // YYYY-MM
    analytics: {
      travelers: item.analytics?.travelers?.score,
    },
  }));
}

/**
 * Search cities by keyword (for finding city IATA codes)
 * @param {string} keyword - City name
 * @returns {Promise<Array>} Matching cities with IATA codes
 */
export async function searchCities(keyword) {
  if (!keyword || keyword.length < 2) return [];

  const result = await amadeusGet(
    '/v1/reference-data/locations/cities',
    { keyword, max: '10' },
    ONE_DAY
  );

  if (!result?.data) return [];

  return result.data.map(city => ({
    iataCode: city.iataCode,
    name: city.name,
    countryCode: city.address?.countryCode,
  }));
}
