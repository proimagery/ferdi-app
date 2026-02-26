/**
 * Amadeus API Configuration
 * Credentials are loaded from .env file (gitignored)
 * Set EXPO_PUBLIC_AMADEUS_API_KEY and EXPO_PUBLIC_AMADEUS_API_SECRET in .env
 */

const AMADEUS_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_AMADEUS_API_KEY || '',
  API_SECRET: process.env.EXPO_PUBLIC_AMADEUS_API_SECRET || '',

  // Test environment (production requires separate approval from Amadeus)
  BASE_URL: 'https://test.api.amadeus.com',
};

export default AMADEUS_CONFIG;
