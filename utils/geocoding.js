const GOOGLE_MAPS_API_KEY = 'AIzaSyBtzMruCCMpiFfqfdhLtoHWfSk3TZ5UvJ8';

/**
 * Geocode an address using Google Maps Geocoding API.
 * Returns { latitude, longitude, formattedAddress } or null on failure.
 */
export const geocodeAddress = async (address) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Search for places using Google Places API (New) - Autocomplete.
 * Returns array of { placeId, description, name } or empty array on failure.
 */
export const searchPlaces = async (input, countryCode = null) => {
  if (!input || input.trim().length < 2) return [];
  try {
    const body = { input };
    if (countryCode) {
      body.includedRegionCodes = [countryCode];
    }
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log('Places API response:', JSON.stringify(data).substring(0, 300));
    if (data.suggestions && data.suggestions.length > 0) {
      return data.suggestions
        .filter(s => s.placePrediction)
        .map(s => ({
          placeId: s.placePrediction.placeId,
          description: s.placePrediction.text?.text || '',
          name: s.placePrediction.structuredFormat?.mainText?.text || '',
        }));
    }
    return [];
  } catch (error) {
    console.error('Places autocomplete error:', error);
    return [];
  }
};

/**
 * Get place details (coordinates + formatted address) from a place ID.
 * Uses Google Places API (New).
 * Returns { latitude, longitude, formattedAddress, name } or null on failure.
 */
export const getPlaceDetails = async (placeId) => {
  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'displayName,formattedAddress,location',
      },
    });
    const data = await response.json();
    if (data.location) {
      return {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        formattedAddress: data.formattedAddress || '',
        name: data.displayName?.text || '',
      };
    }
    return null;
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
};

export { GOOGLE_MAPS_API_KEY };
