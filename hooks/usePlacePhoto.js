import { useState, useEffect } from 'react';
import { getPlacePhotoUrl } from '../services/googlePlacesService';

/**
 * Hook to fetch a photo from Google Places API
 *
 * @param {string} searchQuery - Search query (e.g., "Eiffel Tower Paris")
 * @param {number} maxWidth - Max width in pixels (default 800)
 * @returns {{ photoUrl: string|null, loading: boolean, error: boolean }}
 */
export default function usePlacePhoto(searchQuery, maxWidth = 800) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!searchQuery) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    getPlacePhotoUrl(searchQuery, maxWidth)
      .then(url => {
        if (isMounted) {
          setPhotoUrl(url);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, maxWidth]);

  return { photoUrl, loading, error };
}
