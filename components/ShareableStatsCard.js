import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTravelerRank } from '../utils/rankingSystem';
import { countryCoordinates } from '../utils/coordinates';

const { width: screenWidth } = Dimensions.get('window');
const CARD_SIZE = Math.min(screenWidth - 40, 380);

// Simple dotted world map pattern - dots at each continent location
const worldMapDots = [
  // North America
  { x: 15, y: 25 }, { x: 18, y: 22 }, { x: 12, y: 28 }, { x: 20, y: 30 }, { x: 16, y: 35 },
  { x: 22, y: 25 }, { x: 10, y: 32 }, { x: 8, y: 38 }, { x: 14, y: 40 }, { x: 18, y: 38 },
  { x: 12, y: 45 }, { x: 15, y: 48 },
  // South America
  { x: 25, y: 55 }, { x: 27, y: 60 }, { x: 24, y: 65 }, { x: 26, y: 70 }, { x: 28, y: 75 },
  { x: 23, y: 80 }, { x: 25, y: 85 }, { x: 22, y: 58 }, { x: 30, y: 62 },
  // Europe
  { x: 48, y: 22 }, { x: 50, y: 25 }, { x: 52, y: 28 }, { x: 45, y: 30 }, { x: 55, y: 25 },
  { x: 47, y: 32 }, { x: 53, y: 30 }, { x: 42, y: 28 }, { x: 58, y: 22 },
  // Africa
  { x: 50, y: 45 }, { x: 52, y: 50 }, { x: 48, y: 55 }, { x: 55, y: 48 }, { x: 53, y: 60 },
  { x: 50, y: 65 }, { x: 56, y: 55 }, { x: 45, y: 50 }, { x: 58, y: 45 },
  // Asia
  { x: 65, y: 18 }, { x: 70, y: 20 }, { x: 75, y: 22 }, { x: 80, y: 25 }, { x: 85, y: 28 },
  { x: 62, y: 25 }, { x: 68, y: 30 }, { x: 72, y: 35 }, { x: 78, y: 32 }, { x: 82, y: 38 },
  { x: 88, y: 30 }, { x: 75, y: 40 }, { x: 80, y: 45 }, { x: 70, y: 38 }, { x: 65, y: 35 },
  // Australia
  { x: 85, y: 65 }, { x: 88, y: 62 }, { x: 82, y: 68 }, { x: 90, y: 70 }, { x: 86, y: 72 },
  // New Zealand
  { x: 95, y: 78 }, { x: 96, y: 82 },
];

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

  // Create marker positions for the map
  const markers = completedTrips.map(trip => {
    const coords = countryCoordinates[trip.country];
    if (!coords) return null;
    const x = ((coords.longitude + 180) / 360) * 100;
    const y = ((90 - coords.latitude) / 180) * 100;
    return { x, y, country: trip.country };
  }).filter(Boolean);

  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      {/* Border glow effect */}
      <View style={styles.borderGlow} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Header with app name */}
        <Text style={styles.appName}>Ferdi App</Text>

        {/* World Map with dotted outline */}
        <View style={styles.mapContainer}>
          {/* Background dots forming world map shape */}
          {worldMapDots.map((dot, index) => (
            <View
              key={`bg-${index}`}
              style={[
                styles.mapDot,
                { left: `${dot.x}%`, top: `${dot.y}%` }
              ]}
            />
          ))}

          {/* User's visited country markers (green, larger) */}
          {markers.map((marker, index) => (
            <View
              key={`marker-${index}`}
              style={[
                styles.marker,
                { left: `${marker.x}%`, top: `${marker.y}%` }
              ]}
            />
          ))}
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
    height: CARD_SIZE * 0.32,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  mapDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginLeft: -2,
    marginTop: -2,
  },
  marker: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ade80',
    marginLeft: -5,
    marginTop: -5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
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
