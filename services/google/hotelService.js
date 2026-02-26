/**
 * Google Places Hotel Service
 * Searches for hotels near coordinates using Google Places Text Search (New)
 */

import { placesPost, buildPhotoUrl } from './placesApi';

const ONE_DAY = 24 * 60 * 60 * 1000;

const HOTEL_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.photos',
  'places.editorialSummary',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.location',
  'places.priceLevel',
].join(',');

/**
 * Convert Google price level enum to display string
 */
function formatPriceLevel(priceLevel) {
  switch (priceLevel) {
    case 'PRICE_LEVEL_FREE': return 'Free';
    case 'PRICE_LEVEL_INEXPENSIVE': return '$';
    case 'PRICE_LEVEL_MODERATE': return '$$';
    case 'PRICE_LEVEL_EXPENSIVE': return '$$$';
    case 'PRICE_LEVEL_VERY_EXPENSIVE': return '$$$$';
    default: return null;
  }
}

/**
 * Get hotels near coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} cityName - City name for better search results
 * @param {number} radius - Search radius in KM (default 15)
 * @returns {Promise<Array>} List of hotels
 */
export async function getHotels(latitude, longitude, cityName = '', radius = 15) {
  if (!latitude || !longitude) return [];

  const result = await placesPost(
    '/places:searchText',
    {
      textQuery: `hotels in ${cityName}`.trim(),
      locationBias: {
        circle: {
          center: { latitude, longitude },
          radius: radius * 1000,
        },
      },
      pageSize: 10,
      languageCode: 'en',
    },
    HOTEL_FIELD_MASK,
    ONE_DAY
  );

  if (!result?.places) return [];

  return result.places.map((place, index) => ({
    id: place.id || `hotel_${index}`,
    name: place.displayName?.text || 'Unknown Hotel',
    description: place.editorialSummary?.text || null,
    rating: place.rating || null,
    userRatingCount: place.userRatingCount || null,
    priceLevel: formatPriceLevel(place.priceLevel),
    photo: place.photos?.[0] ? buildPhotoUrl(place.photos[0].name, 400) : null,
    address: place.formattedAddress || null,
    websiteUri: place.websiteUri || null,
    googleMapsUri: place.googleMapsUri || null,
    location: {
      latitude: place.location?.latitude,
      longitude: place.location?.longitude,
    },
  }));
}
