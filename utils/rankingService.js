import AsyncStorage from '@react-native-async-storage/async-storage';

const RANKINGS_STORAGE_KEY = '@ferdi_world_rankings';
const LAST_RANKINGS_UPDATE_KEY = '@ferdi_rankings_last_update';
const RANKINGS_UPDATE_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Checks if world rankings need to be updated (older than 1 week)
 * @returns {Promise<boolean>}
 */
export async function shouldUpdateRankings() {
  try {
    const lastUpdate = await AsyncStorage.getItem(LAST_RANKINGS_UPDATE_KEY);
    if (!lastUpdate) {
      return true; // Never updated before
    }

    const timeSinceUpdate = Date.now() - parseInt(lastUpdate, 10);
    return timeSinceUpdate >= RANKINGS_UPDATE_INTERVAL;
  } catch (error) {
    console.error('Error checking rankings update time:', error);
    return true; // Default to updating on error
  }
}

/**
 * Gets the last rankings update date
 * @returns {Promise<Date|null>}
 */
export async function getLastRankingsUpdate() {
  try {
    const lastUpdate = await AsyncStorage.getItem(LAST_RANKINGS_UPDATE_KEY);
    if (lastUpdate) {
      return new Date(parseInt(lastUpdate, 10));
    }
  } catch (error) {
    console.error('Error getting last rankings update:', error);
  }
  return null;
}

/**
 * Fetches updated world rankings from API
 * Note: This is a placeholder - in production, this would call a real API
 * For now, it returns null to indicate no API available
 * @returns {Promise<Object|null>}
 */
async function fetchWorldRankings() {
  // TODO: Implement actual API call when rankings API is available
  // For example:
  // const response = await fetch('https://api.ferdi.com/rankings');
  // return await response.json();

  console.log('World rankings API not yet implemented');
  return null;
}

/**
 * Updates world rankings from API and stores them locally
 * @returns {Promise<Object|null>} Updated rankings or null if failed
 */
export async function updateWorldRankings() {
  try {
    console.log('Updating world rankings...');
    const rankings = await fetchWorldRankings();

    if (rankings) {
      // Store the rankings
      await AsyncStorage.setItem(RANKINGS_STORAGE_KEY, JSON.stringify(rankings));
      await AsyncStorage.setItem(LAST_RANKINGS_UPDATE_KEY, Date.now().toString());

      console.log('World rankings updated successfully');
      return rankings;
    } else {
      // No API available, just update the timestamp to track when we checked
      await AsyncStorage.setItem(LAST_RANKINGS_UPDATE_KEY, Date.now().toString());
      console.log('World rankings check completed (no API update)');
      return null;
    }
  } catch (error) {
    console.error('Failed to update world rankings:', error);
    return null;
  }
}

/**
 * Gets cached world rankings
 * @returns {Promise<Object|null>}
 */
export async function getCachedRankings() {
  try {
    const cachedRankings = await AsyncStorage.getItem(RANKINGS_STORAGE_KEY);
    if (cachedRankings) {
      return JSON.parse(cachedRankings);
    }
  } catch (error) {
    console.error('Error reading cached rankings:', error);
  }
  return null;
}

/**
 * Initializes ranking service - checks and updates rankings if needed
 * Call this when the app starts
 * @returns {Promise<void>}
 */
export async function initializeRankingService() {
  try {
    const needsUpdate = await shouldUpdateRankings();

    if (needsUpdate) {
      console.log('World rankings are stale (>1 week old), checking for updates...');
      await updateWorldRankings();
    } else {
      const lastUpdate = await getLastRankingsUpdate();
      if (lastUpdate) {
        console.log('World rankings are up to date. Last updated:', lastUpdate.toLocaleDateString());
      }
    }
  } catch (error) {
    console.error('Error initializing ranking service:', error);
  }
}

/**
 * Forces an immediate update of world rankings
 * @returns {Promise<boolean>} Success status
 */
export async function forceUpdateRankings() {
  const rankings = await updateWorldRankings();
  return rankings !== null;
}

/**
 * Gets formatted time until next ranking update
 * @returns {Promise<string>}
 */
export async function getTimeUntilNextUpdate() {
  try {
    const lastUpdate = await AsyncStorage.getItem(LAST_RANKINGS_UPDATE_KEY);
    if (!lastUpdate) {
      return 'Rankings will update on next app launch';
    }

    const nextUpdate = parseInt(lastUpdate, 10) + RANKINGS_UPDATE_INTERVAL;
    const timeUntil = nextUpdate - Date.now();

    if (timeUntil <= 0) {
      return 'Rankings will update on next app launch';
    }

    const daysUntil = Math.ceil(timeUntil / (24 * 60 * 60 * 1000));
    return `Next update in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`;
  } catch (error) {
    console.error('Error calculating time until update:', error);
    return 'Update time unknown';
  }
}
