import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { getTravelerRank } from '../utils/rankingSystem';
import { countryCoordinates } from '../utils/coordinates';

const { width: screenWidth } = Dimensions.get('window');
const CARD_SIZE = Math.min(screenWidth - 40, 380);
const MAP_HEIGHT = CARD_SIZE * 0.32;

// World map paths - realistic continent outlines (viewBox 0 0 100 50)
const mapPaths = {
  // North America
  na: "M5,8 C8,6 12,5 16,6 C20,5 24,4 28,5 C30,6 32,8 30,11 C28,14 26,16 24,18 C22,20 20,22 18,23 C16,22 14,20 12,18 C10,16 8,14 6,12 C5,10 5,9 5,8 Z",
  // Greenland
  gl: "M32,4 C34,3 36,3 38,4 C39,5 39,7 38,8 C36,9 34,9 32,8 C31,7 31,5 32,4 Z",
  // Central America
  ca: "M18,24 C19,23 20,24 21,25 C22,27 21,29 20,30 C19,29 18,27 17,26 C17,25 17,24 18,24 Z",
  // South America
  sa: "M22,31 C24,30 26,31 28,33 C30,36 31,40 30,44 C29,47 27,49 25,48 C23,47 22,44 21,40 C20,36 21,33 22,31 Z",
  // Europe
  eu: "M46,8 C48,7 50,7 52,8 C54,9 56,10 57,12 C56,14 54,15 52,15 C50,15 48,14 46,13 C45,11 45,9 46,8 Z",
  // UK/Ireland
  uk: "M42,10 C43,9 44,10 44,11 C44,12 43,13 42,12 C41,11 41,10 42,10 Z",
  // Scandinavia
  sc: "M50,4 C52,3 54,4 55,6 C55,8 54,10 52,10 C50,10 49,8 49,6 C49,5 49,4 50,4 Z",
  // Africa
  af: "M46,18 C49,17 52,18 54,21 C56,25 56,30 55,35 C54,39 51,42 48,41 C45,40 43,36 43,31 C43,26 44,21 46,18 Z",
  // Russia/Asia North
  ru: "M58,5 C64,4 72,5 80,6 C86,7 92,9 95,12 C94,14 90,15 85,15 C78,15 70,14 64,13 C60,12 57,10 57,8 C57,6 57,5 58,5 Z",
  // Middle East
  me: "M56,16 C58,15 61,16 63,18 C64,20 64,22 62,24 C60,24 58,23 56,21 C55,19 55,17 56,16 Z",
  // India
  in: "M66,20 C68,19 71,20 73,23 C74,26 74,30 72,32 C70,32 68,30 66,27 C65,24 65,21 66,20 Z",
  // China/East Asia
  cn: "M74,12 C78,11 83,12 87,14 C90,16 92,19 91,22 C89,24 85,25 81,24 C77,23 74,20 73,17 C73,14 73,12 74,12 Z",
  // Southeast Asia
  sea: "M76,26 C79,25 82,27 84,30 C85,33 84,36 82,37 C79,37 77,35 76,32 C75,29 75,27 76,26 Z",
  // Japan
  jp: "M90,14 C91,13 92,14 92,16 C92,18 91,20 90,19 C89,18 89,15 90,14 Z",
  // Indonesia
  id: "M78,38 C81,37 85,38 88,40 C89,41 88,43 86,43 C83,43 80,42 78,40 C77,39 77,38 78,38 Z",
  // Australia
  au: "M82,42 C86,41 90,42 93,45 C95,48 95,52 93,54 C90,55 86,54 83,51 C81,48 81,44 82,42 Z",
  // New Zealand
  nz: "M96,52 C97,51 98,52 98,54 C98,56 97,57 96,56 C95,55 95,53 96,52 Z",
};

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

        {/* World Map SVG */}
        <View style={styles.mapContainer}>
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 100 60"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* World map continent outlines */}
            <G>
              {Object.values(mapPaths).map((path, index) => (
                <Path
                  key={`map-${index}`}
                  d={path}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="0.4"
                />
              ))}
            </G>

            {/* Markers for visited countries */}
            <G>
              {markers.map((marker, index) => {
                // Convert percentage coordinates to SVG viewBox coordinates
                const svgX = marker.x;
                const svgY = (marker.y / 100) * 60;
                return (
                  <Circle
                    key={`marker-${index}`}
                    cx={svgX}
                    cy={svgY}
                    r="2"
                    fill="#4ade80"
                    stroke="rgba(255, 255, 255, 0.9)"
                    strokeWidth="0.5"
                  />
                );
              })}
            </G>
          </Svg>
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
