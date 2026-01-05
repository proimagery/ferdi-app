import React, { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTravelerRank } from '../utils/rankingSystem';
import { countryCoordinates } from '../utils/coordinates';

const { width: screenWidth } = Dimensions.get('window');
const CARD_SIZE = Math.min(screenWidth - 40, 380);
const MAP_HEIGHT = CARD_SIZE * 0.28;
const MAP_WIDTH = CARD_SIZE - 24; // Account for padding

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyBtzMruCCMpiFfqfdhLtoHWfSk3TZ5UvJ8';

// Try to load Ferdi icon
let ferdiIcon = null;
try {
  ferdiIcon = require('../assets/ferdi icon.png');
} catch (e) {
  // Icon not found, will use fallback
}

// Country to flag emoji mapping
const countryFlags = {
  'USA': '🇺🇸', 'United States': '🇺🇸', 'Canada': '🇨🇦', 'Mexico': '🇲🇽',
  'UK': '🇬🇧', 'United Kingdom': '🇬🇧', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'France': '🇫🇷', 'Germany': '🇩🇪', 'Italy': '🇮🇹',
  'Spain': '🇪🇸', 'Portugal': '🇵🇹', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪',
  'Switzerland': '🇨🇭', 'Austria': '🇦🇹', 'Greece': '🇬🇷', 'Turkey': '🇹🇷',
  'Japan': '🇯🇵', 'China': '🇨🇳', 'South Korea': '🇰🇷', 'India': '🇮🇳',
  'Thailand': '🇹🇭', 'Vietnam': '🇻🇳', 'Singapore': '🇸🇬', 'Malaysia': '🇲🇾',
  'Indonesia': '🇮🇩', 'Philippines': '🇵🇭', 'Australia': '🇦🇺', 'New Zealand': '🇳🇿',
  'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'Chile': '🇨🇱', 'Peru': '🇵🇪', 'Colombia': '🇨🇴',
  'Egypt': '🇪🇬', 'South Africa': '🇿🇦', 'Morocco': '🇲🇦', 'Kenya': '🇰🇪',
  'United Arab Emirates': '🇦🇪', 'Saudi Arabia': '🇸🇦', 'Israel': '🇮🇱',
  'Russia': '🇷🇺', 'Poland': '🇵🇱', 'Czech Republic': '🇨🇿', 'Hungary': '🇭🇺',
  'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Finland': '🇫🇮', 'Iceland': '🇮🇸',
  'Ireland': '🇮🇪', 'Croatia': '🇭🇷', 'Romania': '🇷🇴', 'Bulgaria': '🇧🇬',
  'Costa Rica': '🇨🇷', 'Panama': '🇵🇦', 'Cuba': '🇨🇺', 'Jamaica': '🇯🇲',
  'Hong Kong': '🇭🇰', 'Taiwan': '🇹🇼', 'Maldives': '🇲🇻', 'Sri Lanka': '🇱🇰',
  'Nepal': '🇳🇵', 'Cambodia': '🇰🇭', 'Laos': '🇱🇦', 'Myanmar': '🇲🇲',
  'Ecuador': '🇪🇨', 'Bolivia': '🇧🇴', 'Uruguay': '🇺🇾', 'Paraguay': '🇵🇾',
  'Tanzania': '🇹🇿', 'Ethiopia': '🇪🇹', 'Tunisia': '🇹🇳', 'Madagascar': '🇲🇬',
  'Qatar': '🇶🇦', 'Kuwait': '🇰🇼', 'Bahrain': '🇧🇭', 'Oman': '🇴🇲', 'Jordan': '🇯🇴',
  'Lebanon': '🇱🇧', 'Slovakia': '🇸🇰', 'Slovenia': '🇸🇮', 'Estonia': '🇪🇪',
  'Latvia': '🇱🇻', 'Lithuania': '🇱🇹', 'Luxembourg': '🇱🇺', 'Malta': '🇲🇹',
  'Cyprus': '🇨🇾', 'Albania': '🇦🇱', 'Serbia': '🇷🇸', 'Montenegro': '🇲🇪',
  'Fiji': '🇫🇯', 'Bahamas': '🇧🇸', 'Barbados': '🇧🇧', 'Trinidad and Tobago': '🇹🇹',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
};

// Continent mapping
const continentMap = {
  'USA': 'North America', 'United States': 'North America', 'Canada': 'North America',
  'Mexico': 'North America', 'Cuba': 'North America', 'Jamaica': 'North America',
  'Costa Rica': 'North America', 'Panama': 'North America', 'Guatemala': 'North America',
  'France': 'Europe', 'Italy': 'Europe', 'Spain': 'Europe', 'Germany': 'Europe',
  'UK': 'Europe', 'United Kingdom': 'Europe', 'England': 'Europe', 'Scotland': 'Europe', 'Wales': 'Europe',
  'Netherlands': 'Europe', 'Belgium': 'Europe',
  'Switzerland': 'Europe', 'Austria': 'Europe', 'Greece': 'Europe', 'Portugal': 'Europe',
  'Poland': 'Europe', 'Sweden': 'Europe', 'Norway': 'Europe', 'Denmark': 'Europe',
  'Finland': 'Europe', 'Iceland': 'Europe', 'Ireland': 'Europe', 'Croatia': 'Europe',
  'Czech Republic': 'Europe', 'Hungary': 'Europe', 'Romania': 'Europe', 'Bulgaria': 'Europe',
  'Russia': 'Europe', 'Turkey': 'Europe',
  'Japan': 'Asia', 'China': 'Asia', 'India': 'Asia', 'Thailand': 'Asia', 'Vietnam': 'Asia',
  'South Korea': 'Asia', 'Singapore': 'Asia', 'Malaysia': 'Asia', 'Indonesia': 'Asia',
  'Philippines': 'Asia', 'Cambodia': 'Asia', 'Hong Kong': 'Asia', 'Taiwan': 'Asia',
  'United Arab Emirates': 'Asia', 'Saudi Arabia': 'Asia', 'Jordan': 'Asia',
  'Brazil': 'South America', 'Argentina': 'South America', 'Chile': 'South America',
  'Peru': 'South America', 'Colombia': 'South America', 'Ecuador': 'South America',
  'Egypt': 'Africa', 'South Africa': 'Africa', 'Morocco': 'Africa', 'Kenya': 'Africa',
  'Tanzania': 'Africa', 'Ethiopia': 'Africa', 'Tunisia': 'Africa',
  'Australia': 'Oceania', 'New Zealand': 'Oceania', 'Fiji': 'Oceania',
};

const ShareableStatsCard = forwardRef(({
  completedTrips = [],
  visitedCities = [],
  trips = [],
  profile = {},
}, ref) => {
  // Calculate stats
  const totalCountries = completedTrips.length;
  const totalCities = visitedCities.length;
  const worldCountries = 195;
  const worldCoverage = ((totalCountries / worldCountries) * 100).toFixed(0);
  const rank = getTravelerRank(totalCountries);

  // Parse rank for display
  const rankParts = rank.match(/^(.+?)(?:\s+Lvl\s*\.?\s*(\d+))?$/i);
  const rankName = rankParts ? rankParts[1] : rank;
  const rankLevel = rankParts && rankParts[2] ? rankParts[2] : null;

  // Calculate continents
  const visitedContinents = [...new Set(
    completedTrips.map(trip => continentMap[trip.country]).filter(Boolean)
  )];

  // Get top country (most visited or first in list)
  const countryCounts = {};
  completedTrips.forEach(trip => {
    const country = trip.country;
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });
  const topCountry = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Calculate total days traveled from trips
  let totalDays = 0;
  if (trips && trips.length > 0) {
    trips.forEach(trip => {
      if (trip.countries) {
        trip.countries.forEach(country => {
          if (country.startDate && country.endDate) {
            const start = typeof country.startDate === 'string' ? new Date(country.startDate) : country.startDate;
            const end = typeof country.endDate === 'string' ? new Date(country.endDate) : country.endDate;
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (days > 0) totalDays += days;
          }
        });
      }
    });
  }

  // Get flags for display (up to 10 unique)
  const uniqueCountries = [...new Set(completedTrips.map(t => t.country))];
  const displayFlags = uniqueCountries.slice(0, 10);
  const remainingCount = uniqueCountries.length - 10;

  // Create marker positions for Google Maps
  const markers = useMemo(() => {
    return completedTrips.map(trip => {
      const coords = countryCoordinates[trip.country];
      if (!coords) return null;
      return { lat: coords.latitude, lng: coords.longitude, country: trip.country };
    }).filter(Boolean);
  }, [completedTrips]);

  // Build Google Static Maps URL with markers
  const mapUrl = useMemo(() => {
    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    const params = new URLSearchParams({
      center: '20,0',
      zoom: '1',
      size: '640x320',
      scale: '2',
      maptype: 'roadmap',
      style: 'feature:all|element:labels|visibility:off',
      key: GOOGLE_MAPS_API_KEY,
    });

    // Add dark style
    params.append('style', 'feature:water|color:0x0a0a0a');
    params.append('style', 'feature:landscape|color:0x1a1a1a');
    params.append('style', 'feature:administrative.country|element:geometry.stroke|color:0x333333');

    // Add markers for visited countries (limit to avoid URL length issues)
    const uniqueMarkers = [...new Map(markers.map(m => [m.country, m])).values()];
    uniqueMarkers.slice(0, 50).forEach(marker => {
      params.append('markers', `color:0x4ade80|size:tiny|${marker.lat},${marker.lng}`);
    });

    return `${baseUrl}?${params.toString()}`;
  }, [markers]);

  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      {/* Border glow effect */}
      <View style={styles.borderGlow} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Header with app name */}
        <Text style={styles.appName}>Ferdi App</Text>

        {/* World Map from Google Static Maps */}
        <View style={styles.mapContainer}>
          <Image
            source={{ uri: mapUrl }}
            style={styles.mapImage}
            resizeMode="cover"
          />
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsTitleRow}>
            <Text style={styles.statsTitle}>Ferdi Stats</Text>
            <View style={styles.titleUnderline} />
          </View>

          <View style={styles.statsAndRankRow}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Continents</Text>
                  <Text style={styles.statValue}>{visitedContinents.length}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Countries</Text>
                  <Text style={styles.statValue}>{totalCountries}</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Cities</Text>
                  <Text style={styles.statValue}>{totalCities}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>% of Globe</Text>
                  <Text style={styles.statValue}>{worldCoverage}%</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Top Country</Text>
                  <Text style={styles.statValueSmall} numberOfLines={1}>{topCountry}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Days Traveled</Text>
                  <Text style={styles.statValueSmall}>{totalDays || '-'}</Text>
                </View>
              </View>
            </View>

            {/* Rank Badge */}
            <View style={styles.rankContainer}>
              <Text style={styles.rankLabel}>Rank</Text>
              <View style={styles.rankBadge}>
                <Text style={styles.rankName}>{rankName}</Text>
                <Text style={styles.rankLevel}>Lvl.{rankLevel || '1'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Section with App icon and Store badges */}
        <View style={styles.bottomSection}>
          {ferdiIcon ? (
            <Image source={ferdiIcon} style={styles.ferdiIcon} resizeMode="contain" />
          ) : (
            <View style={styles.ferdiIconPlaceholder}>
              <Text style={styles.ferdiIconText}>F</Text>
            </View>
          )}
          <View style={styles.storeBadgesContainer}>
            <View style={styles.storeBadge}>
              <Ionicons name="logo-apple" size={14} color="#fff" />
              <View>
                <Text style={styles.storeSmallText}>Download on the</Text>
                <Text style={styles.storeBigText}>App Store</Text>
              </View>
            </View>
            <View style={styles.storeBadge}>
              <Ionicons name="logo-google-playstore" size={14} color="#fff" />
              <View>
                <Text style={styles.storeSmallText}>GET IT ON</Text>
                <Text style={styles.storeBigText}>Google Play</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Flag ribbon - overlapping style */}
        <View style={styles.flagRibbon}>
          {displayFlags.map((country, index) => (
            <View
              key={index}
              style={[
                styles.flagCircle,
                { marginLeft: index === 0 ? 0 : -8, zIndex: displayFlags.length - index }
              ]}
            >
              <Text style={styles.flag}>{countryFlags[country] || '🏳️'}</Text>
            </View>
          ))}
          {remainingCount > 0 && (
            <View style={[styles.moreFlags, { marginLeft: -8, zIndex: 0 }]}>
              <Text style={styles.moreFlagsText}>+{remainingCount}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  borderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderColor: '#4ade80',
    borderRadius: 16,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  appName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAlign: 'right',
    marginBottom: 4,
  },
  mapContainer: {
    height: MAP_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  statsSection: {
    marginTop: 6,
  },
  statsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  titleUnderline: {
    flex: 1,
    height: 2,
    backgroundColor: '#4ade80',
    marginLeft: 8,
  },
  statsAndRankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsGrid: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: '#888',
    fontSize: 9,
  },
  statValue: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statValueSmall: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rankContainer: {
    alignItems: 'center',
    marginLeft: 8,
  },
  rankLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 3,
  },
  rankBadge: {
    backgroundColor: '#4ade80',
    borderRadius: 35,
    width: 65,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankName: {
    color: '#000',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rankLevel: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  ferdiIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  ferdiIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1a3a5c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ferdiIconText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  storeBadgesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
  },
  storeSmallText: {
    color: '#fff',
    fontSize: 5,
  },
  storeBigText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  flagRibbon: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  flagCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  flag: {
    fontSize: 16,
  },
  moreFlags: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4ade80',
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreFlagsText: {
    color: '#000',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default ShareableStatsCard;
