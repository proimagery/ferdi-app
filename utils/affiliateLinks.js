const AWIN_AFFILIATE_ID = '2785178';
const AWIN_MERCHANT_ID = '6776';

/**
 * Build an Awin tracking URL that redirects to a Booking.com page.
 */
function buildAwinLink(destinationUrl, campaign) {
  const encoded = encodeURIComponent(destinationUrl);
  let url = `https://www.awin1.com/cread.php?awinmid=${AWIN_MERCHANT_ID}&awinaffid=${AWIN_AFFILIATE_ID}`;
  if (campaign) url += `&campaign=${campaign}`;
  url += `&ued=${encoded}`;
  return url;
}

/**
 * Get Booking.com hotel search affiliate link.
 * @param {string} hotelName - Name of the hotel to search for
 * @param {string} city - City name (fallback search term)
 * @param {string} [checkIn] - Check-in date (YYYY-MM-DD)
 * @param {string} [checkOut] - Check-out date (YYYY-MM-DD)
 */
export function getHotelAffiliateLink(hotelName, city, checkIn, checkOut) {
  const query = hotelName || city || '';
  let bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(query)}`;
  if (checkIn) bookingUrl += `&checkin=${checkIn}`;
  if (checkOut) bookingUrl += `&checkout=${checkOut}`;
  return buildAwinLink(bookingUrl);
}

/**
 * Get Booking.com hotel browse affiliate link for a city/country.
 * @param {string} location - City or country name
 */
export function getHotelBrowseLink(location) {
  const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(location)}`;
  return buildAwinLink(bookingUrl);
}

/**
 * Get Booking.com flights affiliate link.
 * @param {string} [origin] - Origin airport code
 * @param {string} [destination] - Destination airport code
 * @param {string} [departDate] - Departure date (YYYY-MM-DD)
 * @param {string} [returnDate] - Return date (YYYY-MM-DD)
 */
export function getFlightAffiliateLink(origin, destination, departDate, returnDate) {
  let bookingUrl = 'https://www.booking.com/flights/index.html';
  const params = [];
  if (origin) params.push(`from=${origin}`);
  if (destination) params.push(`to=${destination}`);
  if (departDate) params.push(`depart=${departDate}`);
  if (returnDate) params.push(`return=${returnDate}`);
  if (params.length > 0) bookingUrl += '?' + params.join('&');
  return buildAwinLink(bookingUrl, 'flights');
}

/**
 * Get Booking.com car rental affiliate link.
 * @param {string} [city] - City for car rental search
 */
export function getCarRentalAffiliateLink(city) {
  let bookingUrl = 'https://www.booking.com/cars/index.html';
  if (city) bookingUrl += `?ss=${encodeURIComponent(city)}`;
  return buildAwinLink(bookingUrl);
}
