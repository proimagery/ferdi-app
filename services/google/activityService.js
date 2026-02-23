/**
 * Google Places Activity Service
 * Replaces Amadeus activityService with Google Places Text Search (New)
 * Same function signature: getActivities(lat, lng, radius)
 */

import { placesPost, buildPhotoUrl } from './placesApi';

const ONE_DAY = 24 * 60 * 60 * 1000;

// Field mask controls both data returned and billing tier
// Using Pro tier fields: displayName, formattedAddress, location, photos, types, businessStatus
// Plus Enterprise fields: rating, userRatingCount, websiteUri, editorialSummary, googleMapsUri
const ACTIVITY_FIELD_MASK = [
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
 * Get tours, activities, and attractions near coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radius - Search radius in KM (default 20)
 * @returns {Promise<Array>} List of activities matching ActivityCard data shape
 */
export async function getActivities(latitude, longitude, radius = 20) {
  if (!latitude || !longitude) return [];

  const result = await placesPost(
    '/places:searchText',
    {
      textQuery: 'things to do tourist attractions tours activities',
      locationBias: {
        circle: {
          center: { latitude, longitude },
          radius: radius * 1000, // Convert KM to meters
        },
      },
      pageSize: 10,
      languageCode: 'en',
    },
    ACTIVITY_FIELD_MASK,
    ONE_DAY
  );

  if (!result?.places) return [];

  return result.places.map((place, index) => ({
    id: place.id || `gplace_${index}`,
    name: place.displayName?.text || 'Unknown',
    shortDescription: place.editorialSummary?.text || null,
    description: place.editorialSummary?.text || null,
    rating: place.rating || null,
    userRatingCount: place.userRatingCount || null,
    price: {
      amount: null, // Google Places doesn't give exact prices
      level: formatPriceLevel(place.priceLevel),
    },
    pictures: place.photos?.slice(0, 3).map(p => buildPhotoUrl(p.name, 400)) || [],
    bookingLink: place.websiteUri || place.googleMapsUri || null,
    minimumDuration: null, // Not available from Google Places
    geoCode: {
      latitude: place.location?.latitude,
      longitude: place.location?.longitude,
    },
    address: place.formattedAddress || null,
  }));
}
