/**
 * Amadeus Flight Service
 * Search flights, price analysis, cheapest dates, airport lookup
 */

import { amadeusGet } from './amadeusApi';

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

/**
 * Search for airport/city IATA codes by keyword
 * @param {string} keyword - City or airport name (e.g., "Paris", "JFK")
 * @returns {Promise<Array>} List of matching locations with IATA codes
 */
export async function searchAirports(keyword) {
  if (!keyword || keyword.length < 2) return [];

  const result = await amadeusGet(
    '/v1/reference-data/locations',
    {
      keyword,
      subType: 'AIRPORT,CITY',
      'page[limit]': '10',
    },
    ONE_DAY
  );

  if (!result?.data) return [];

  return result.data.map(loc => ({
    iataCode: loc.iataCode,
    name: loc.name,
    cityName: loc.address?.cityName || loc.name,
    countryName: loc.address?.countryName || '',
    type: loc.subType, // 'AIRPORT' or 'CITY'
    lat: loc.geoCode?.latitude,
    lng: loc.geoCode?.longitude,
  }));
}

/**
 * Search for flight offers
 * @param {string} origin - Origin IATA code (e.g., "JFK")
 * @param {string} destination - Destination IATA code (e.g., "CDG")
 * @param {string} departureDate - Date in YYYY-MM-DD format
 * @param {number} adults - Number of adult passengers
 * @param {string} returnDate - Optional return date for round trips
 * @param {boolean} nonStop - Only direct flights
 * @returns {Promise<Array>} Flight offers
 */
export async function searchFlights(origin, destination, departureDate, adults = 1, returnDate = null, nonStop = false) {
  if (!origin || !destination || !departureDate) return [];

  const params = {
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    adults: String(adults),
    max: '10',
    currencyCode: 'USD',
  };

  if (returnDate) params.returnDate = returnDate;
  if (nonStop) params.nonStop = 'true';

  const result = await amadeusGet('/v2/shopping/flight-offers', params, ONE_HOUR);

  if (!result?.data) return [];

  return result.data.map(offer => ({
    id: offer.id,
    price: {
      total: offer.price?.grandTotal || offer.price?.total,
      currency: offer.price?.currency || 'USD',
    },
    itineraries: offer.itineraries?.map(itin => ({
      duration: itin.duration, // e.g., "PT12H30M"
      segments: itin.segments?.map(seg => ({
        departure: {
          airport: seg.departure?.iataCode,
          time: seg.departure?.at,
        },
        arrival: {
          airport: seg.arrival?.iataCode,
          time: seg.arrival?.at,
        },
        carrier: seg.carrierCode,
        flightNumber: `${seg.carrierCode}${seg.number}`,
        duration: seg.duration,
        aircraft: seg.aircraft?.code,
      })),
    })),
    stops: (offer.itineraries?.[0]?.segments?.length || 1) - 1,
    bookingClass: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin,
  }));
}

/**
 * Get flight price analysis/metrics for a route
 * @param {string} origin - Origin IATA code
 * @param {string} destination - Destination IATA code
 * @param {string} departureDate - Date in YYYY-MM-DD format
 * @returns {Promise<Object|null>} Price metrics (min, median, max)
 */
export async function getFlightPriceAnalysis(origin, destination, departureDate) {
  if (!origin || !destination || !departureDate) return null;

  const result = await amadeusGet(
    '/v1/analytics/itinerary-price-metrics',
    {
      originIataCode: origin,
      destinationIataCode: destination,
      departureDate,
      currencyCode: 'USD',
    },
    ONE_HOUR
  );

  if (!result?.data?.[0]) return null;

  const metrics = result.data[0];
  const priceMetrics = {};
  metrics.priceMetrics?.forEach(pm => {
    priceMetrics[pm.quartileRanking] = pm.amount;
  });

  return {
    origin,
    destination,
    date: departureDate,
    currency: metrics.currencyCode || 'USD',
    min: priceMetrics.MINIMUM,
    first: priceMetrics.FIRST,
    median: priceMetrics.MEDIUM,
    third: priceMetrics.THIRD,
    max: priceMetrics.MAXIMUM,
  };
}

/**
 * Find cheapest flight dates for a route
 * @param {string} origin - Origin IATA code
 * @param {string} destination - Destination IATA code
 * @returns {Promise<Array>} List of dates with prices
 */
export async function getCheapestDates(origin, destination) {
  if (!origin || !destination) return [];

  const result = await amadeusGet(
    '/v1/shopping/flight-dates',
    {
      origin,
      destination,
    },
    ONE_HOUR
  );

  if (!result?.data) return [];

  return result.data.map(item => ({
    departureDate: item.departureDate,
    returnDate: item.returnDate,
    price: item.price?.total,
    currency: item.price?.currency || 'USD',
  }));
}

/**
 * Get direct flight destinations from an airport
 * @param {string} airportCode - IATA airport code
 * @returns {Promise<Array>} List of direct destinations
 */
export async function getDirectDestinations(airportCode) {
  if (!airportCode) return [];

  const result = await amadeusGet(
    '/v1/airport/direct-destinations',
    { departureAirportCode: airportCode },
    ONE_DAY
  );

  if (!result?.data) return [];

  return result.data.map(d => ({
    destination: d.destination,
    name: d.name,
  }));
}

/**
 * Parse ISO 8601 duration (PT12H30M) to readable string
 */
export function formatDuration(isoDuration) {
  if (!isoDuration) return '';
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return isoDuration;
  const hours = match[1] || '0';
  const minutes = match[2] || '0';
  return `${hours}h ${minutes}m`;
}
