/**
 * Amadeus Hotel Service
 * Search hotels, get offers/pricing, and guest sentiments
 */

import { amadeusGet } from './amadeusApi';

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Search hotels by city IATA code
 * @param {string} cityCode - City IATA code (e.g., "PAR")
 * @returns {Promise<Array>} List of hotels
 */
export async function searchHotelsByCity(cityCode) {
  if (!cityCode) return [];

  const result = await amadeusGet(
    '/v1/reference-data/locations/hotels/by-city',
    { cityCode, radius: '30', radiusUnit: 'KM' },
    ONE_DAY
  );

  if (!result?.data) return [];

  return result.data.slice(0, 20).map(hotel => ({
    hotelId: hotel.hotelId,
    name: hotel.name,
    latitude: hotel.geoCode?.latitude,
    longitude: hotel.geoCode?.longitude,
    distance: hotel.distance?.value,
    distanceUnit: hotel.distance?.unit,
  }));
}

/**
 * Search hotels by geographic coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radius - Search radius in KM (default 5)
 * @returns {Promise<Array>} List of nearby hotels
 */
export async function searchHotelsByLocation(latitude, longitude, radius = 5) {
  if (!latitude || !longitude) return [];

  const result = await amadeusGet(
    '/v1/reference-data/locations/hotels/by-geocode',
    {
      latitude: String(latitude),
      longitude: String(longitude),
      radius: String(radius),
      radiusUnit: 'KM',
    },
    ONE_DAY
  );

  if (!result?.data) return [];

  return result.data.slice(0, 20).map(hotel => ({
    hotelId: hotel.hotelId,
    name: hotel.name,
    latitude: hotel.geoCode?.latitude,
    longitude: hotel.geoCode?.longitude,
    distance: hotel.distance?.value,
    distanceUnit: hotel.distance?.unit,
  }));
}

/**
 * Get hotel offers (pricing & availability)
 * @param {string[]} hotelIds - Array of Amadeus hotel IDs
 * @param {string} checkInDate - YYYY-MM-DD
 * @param {string} checkOutDate - YYYY-MM-DD
 * @param {number} adults - Number of guests
 * @returns {Promise<Array>} Hotel offers with pricing
 */
export async function getHotelOffers(hotelIds, checkInDate, checkOutDate, adults = 1) {
  if (!hotelIds?.length || !checkInDate || !checkOutDate) return [];

  // Calculate number of nights for per-night fallback
  const nights = Math.max(1, Math.round(
    (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
  ));

  const result = await amadeusGet(
    '/v3/shopping/hotel-offers',
    {
      hotelIds: hotelIds.slice(0, 10).join(','),
      checkInDate,
      checkOutDate,
      adults: String(adults),
      currency: 'USD',
    },
    ONE_HOUR
  );

  if (!result?.data) return [];

  return result.data.map(hotel => ({
    hotelId: hotel.hotel?.hotelId,
    name: hotel.hotel?.name,
    cityCode: hotel.hotel?.cityCode,
    latitude: hotel.hotel?.latitude,
    longitude: hotel.hotel?.longitude,
    offers: hotel.offers?.map(offer => {
      const total = parseFloat(offer.price?.total) || 0;
      const apiPerNight = parseFloat(offer.price?.variations?.average?.total) || 0;
      const perNight = apiPerNight > 0 ? apiPerNight : (total > 0 ? (total / nights).toFixed(2) : null);

      return {
        id: offer.id,
        checkIn: offer.checkInDate,
        checkOut: offer.checkOutDate,
        nights,
        roomType: offer.room?.typeEstimated?.category,
        bedType: offer.room?.typeEstimated?.bedType,
        description: offer.room?.description?.text,
        price: {
          total: offer.price?.total,
          currency: offer.price?.currency || 'USD',
          perNight: perNight ? String(perNight) : null,
        },
        cancellation: offer.policies?.cancellations?.[0]?.description?.text,
      };
    }) || [],
  }));
}

/**
 * Get hotel guest sentiment/ratings
 * @param {string[]} hotelIds - Array of Amadeus hotel IDs
 * @returns {Promise<Array>} Sentiment data with scores
 */
export async function getHotelSentiments(hotelIds) {
  if (!hotelIds?.length) return [];

  const result = await amadeusGet(
    '/v2/e-reputation/hotel-sentiments',
    { hotelIds: hotelIds.slice(0, 20).join(',') },
    ONE_WEEK
  );

  if (!result?.data) return [];

  return result.data.map(hotel => ({
    hotelId: hotel.hotelId,
    overallRating: hotel.overallRating,
    numberOfReviews: hotel.numberOfReviews,
    sentiments: {
      sleepQuality: hotel.sentiments?.sleepQuality,
      service: hotel.sentiments?.service,
      facilities: hotel.sentiments?.facilities,
      roomComforts: hotel.sentiments?.roomComforts,
      valueForMoney: hotel.sentiments?.valueForMoney,
      catering: hotel.sentiments?.catering,
      location: hotel.sentiments?.location,
      pointsOfInterest: hotel.sentiments?.pointsOfInterest,
      staff: hotel.sentiments?.staff,
    },
  }));
}
