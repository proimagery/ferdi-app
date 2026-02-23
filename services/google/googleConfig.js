/**
 * Google Places API Configuration
 */

const GOOGLE_PLACES_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '',
  BASE_URL: 'https://places.googleapis.com/v1',
};

export default GOOGLE_PLACES_CONFIG;
