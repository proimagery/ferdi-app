/**
 * Amadeus Activity & Experiences Service
 * Tours, activities, and points of interest
 */

import { amadeusGet } from './amadeusApi';

const ONE_DAY = 24 * 60 * 60 * 1000;

/**
 * Get tours and activities near coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radius - Search radius in KM (default 20)
 * @returns {Promise<Array>} List of activities
 */
export async function getActivities(latitude, longitude, radius = 20) {
  if (!latitude || !longitude) return [];

  const result = await amadeusGet(
    '/v1/shopping/activities',
    {
      latitude: String(latitude),
      longitude: String(longitude),
      radius: String(radius),
    },
    ONE_DAY
  );

  if (!result?.data) return [];

  return result.data.slice(0, 20).map(activity => ({
    id: activity.id,
    name: activity.name,
    shortDescription: activity.shortDescription,
    description: activity.description,
    rating: activity.rating,
    price: {
      amount: activity.price?.amount,
      currency: activity.price?.currencyCode || 'USD',
    },
    pictures: activity.pictures || [],
    bookingLink: activity.bookingLink,
    minimumDuration: activity.minimumDuration,
    geoCode: {
      latitude: activity.geoCode?.latitude,
      longitude: activity.geoCode?.longitude,
    },
  }));
}

/**
 * Get details for a single activity
 * @param {string} activityId - Amadeus activity ID
 * @returns {Promise<Object|null>} Activity details
 */
export async function getActivityDetails(activityId) {
  if (!activityId) return null;

  const result = await amadeusGet(
    `/v1/shopping/activities/${activityId}`,
    {},
    ONE_DAY
  );

  if (!result?.data) return null;

  const activity = result.data;
  return {
    id: activity.id,
    name: activity.name,
    shortDescription: activity.shortDescription,
    description: activity.description,
    rating: activity.rating,
    price: {
      amount: activity.price?.amount,
      currency: activity.price?.currencyCode || 'USD',
    },
    pictures: activity.pictures || [],
    bookingLink: activity.bookingLink,
    minimumDuration: activity.minimumDuration,
    geoCode: {
      latitude: activity.geoCode?.latitude,
      longitude: activity.geoCode?.longitude,
    },
  };
}

/**
 * Get points of interest near coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radius - Search radius in KM (default 10)
 * @returns {Promise<Array>} List of points of interest
 */
export async function getPointsOfInterest(latitude, longitude, radius = 10) {
  if (!latitude || !longitude) return [];

  const result = await amadeusGet(
    '/v1/reference-data/locations/pois',
    {
      latitude: String(latitude),
      longitude: String(longitude),
      radius: String(radius),
    },
    ONE_DAY
  );

  if (!result?.data) return [];

  return result.data.slice(0, 20).map(poi => ({
    id: poi.id,
    name: poi.name,
    category: poi.category, // SIGHTS, NIGHTLIFE, RESTAURANT, SHOPPING
    rank: poi.rank,
    tags: poi.tags || [],
    geoCode: {
      latitude: poi.geoCode?.latitude,
      longitude: poi.geoCode?.longitude,
    },
  }));
}
