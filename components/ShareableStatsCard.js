import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { getTravelerRank } from '../utils/rankingSystem';
import { countryCoordinates } from '../utils/coordinates';

const { width: screenWidth } = Dimensions.get('window');
const CARD_SIZE = Math.min(screenWidth - 40, 380);
const MAP_HEIGHT = CARD_SIZE * 0.32;

// Simplified but recognizable world map SVG paths
const worldMapPath = `
  M18,22 L22,18 L28,17 L32,20 L30,26 L26,30 L22,28 L18,24 Z
  M32,15 L38,12 L42,14 L40,20 L34,18 Z
  M20,32 L24,30 L28,34 L26,42 L22,48 L18,46 L16,38 Z
  M26,52 L30,48 L34,52 L36,62 L34,74 L30,82 L26,78 L24,68 L24,58 Z
  M44,20 L48,18 L52,22 L50,28 L46,26 Z
  M48,16 L50,14 L54,16 L56,22 L52,24 L48,20 Z
  M52,18 L58,14 L64,16 L68,20 L72,18 L78,20 L82,24 L80,30 L74,32 L68,30 L62,28 L56,26 L52,22 Z
  M48,32 L54,30 L60,34 L62,44 L58,56 L52,64 L46,60 L44,48 L46,38 Z
  M62,28 L66,24 L72,26 L74,32 L70,36 L64,34 Z
  M72,28 L78,24 L86,26 L92,30 L90,38 L84,42 L78,40 L74,34 Z
  M78,38 L84,36 L90,40 L92,48 L88,54 L82,52 L78,46 Z
  M86,44 L92,42 L96,48 L94,56 L88,58 L84,52 Z
  M86,62 L92,58 L98,62 L100,72 L96,78 L90,76 L86,68 Z
  M102,78 L106,76 L108,82 L104,86 L100,82 Z
`;

// Alternative: More detailed and accurate world map paths
const continentPaths = {
  // North America (main landmass)
  northAmerica: "M15,28 Q18,22 25,20 Q32,18 38,22 Q42,26 40,34 Q38,38 35,40 Q32,42 28,40 Q24,38 22,36 Q20,34 18,32 Q16,30 15,28",
  // Greenland
  greenland: "M38,14 Q42,12 46,14 Q48,18 46,22 Q42,24 38,22 Q36,18 38,14",
  // Central America
  centralAmerica: "M22,42 Q25,40 28,42 Q30,46 28,50 Q25,52 22,50 Q20,46 22,42",
  // South America
  southAmerica: "M28,54 Q34,50 38,54 Q42,60 40,72 Q38,82 34,88 Q30,90 26,86 Q24,78 24,68 Q26,58 28,54",
  // Europe
  europe: "M48,22 Q52,18 58,20 Q62,22 64,26 Q62,30 58,32 Q54,30 50,28 Q48,26 48,22",
  // UK
  uk: "M44,24 Q46,22 48,24 Q48,28 46,30 Q44,28 44,24",
  // Africa
  africa: "M46,38 Q52,34 58,38 Q62,44 62,54 Q60,66 54,74 Q48,78 44,72 Q42,62 42,52 Q44,44 46,38",
  // Russia/Northern Asia
  russia: "M62,18 Q72,14 85,16 Q95,20 98,28 Q96,34 88,36 Q78,34 68,32 Q62,28 62,18",
  // Middle East
  middleEast: "M60,34 Q66,32 70,36 Q72,42 68,46 Q64,44 60,40 Q58,36 60,34",
  // India
  india: "M70,42 Q76,38 80,44 Q82,52 78,58 Q72,56 68,50 Q68,44 70,42",
  // China/East Asia
  eastAsia: "M78,28 Q86,24 92,28 Q96,34 94,42 Q88,46 82,44 Q78,38 78,28",
  // Southeast Asia
  southeastAsia: "M80,50 Q86,48 90,52 Q92,60 88,66 Q82,64 78,58 Q78,54 80,50",
  // Japan
  japan: "M94,30 Q96,28 98,32 Q98,38 96,40 Q94,38 94,30",
  // Australia
  australia: "M84,70 Q92,66 98,72 Q102,80 98,88 Q92,92 86,88 Q82,82 84,70",
  // New Zealand
  newZealand: "M104,86 Q106,84 108,88 Q108,94 106,96 Q104,94 104,86",
  // Indonesia
  indonesia: "M82,62 Q88,60 92,64 Q90,68 86,68 Q82,66 82,62",
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
            viewBox="0 0 120 100"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* World map continent outlines */}
            <G>
              {Object.values(continentPaths).map((path, index) => (
                <Path
                  key={`continent-${index}`}
                  d={path}
                  fill="rgba(255, 255, 255, 0.15)"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="0.5"
                />
              ))}
            </G>

            {/* Markers for visited countries */}
            <G>
              {markers.map((marker, index) => {
                // Convert percentage coordinates to SVG viewBox coordinates
                const svgX = (marker.x / 100) * 120;
                const svgY = (marker.y / 100) * 100;
                return (
                  <Circle
                    key={`marker-${index}`}
                    cx={svgX}
                    cy={svgY}
                    r="3"
                    fill="#4ade80"
                    stroke="rgba(255, 255, 255, 0.9)"
                    strokeWidth="0.8"
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
