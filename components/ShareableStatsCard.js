import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTravelerRank } from '../utils/rankingSystem';
import { countryCoordinates } from '../utils/coordinates';

const { width: screenWidth } = Dimensions.get('window');
const CARD_SIZE = Math.min(screenWidth - 40, 380); // 1:1 aspect ratio

// Country to flag emoji mapping (common countries)
const countryFlags = {
  'USA': '🇺🇸', 'United States': '🇺🇸', 'Canada': '🇨🇦', 'Mexico': '🇲🇽',
  'UK': '🇬🇧', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'France': '🇫🇷', 'Germany': '🇩🇪', 'Italy': '🇮🇹',
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
};

// Continent mapping
const continentMap = {
  'USA': 'North America', 'United States': 'North America', 'Canada': 'North America',
  'Mexico': 'North America', 'Cuba': 'North America', 'Jamaica': 'North America',
  'Costa Rica': 'North America', 'Panama': 'North America', 'Guatemala': 'North America',
  'France': 'Europe', 'Italy': 'Europe', 'Spain': 'Europe', 'Germany': 'Europe',
  'UK': 'Europe', 'England': 'Europe', 'Netherlands': 'Europe', 'Belgium': 'Europe',
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

  // Get flags for display (up to 12 unique)
  const uniqueCountries = [...new Set(completedTrips.map(t => t.country))];
  const displayFlags = uniqueCountries.slice(0, 12);
  const remainingCount = uniqueCountries.length - 12;

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

        {/* World Map with markers */}
        <View style={styles.mapContainer}>
          <View style={styles.mapOutline}>
            <View style={[styles.continent, styles.northAmerica]} />
            <View style={[styles.continent, styles.southAmerica]} />
            <View style={[styles.continent, styles.europe]} />
            <View style={[styles.continent, styles.africa]} />
            <View style={[styles.continent, styles.asia]} />
            <View style={[styles.continent, styles.oceania]} />
          </View>
          {markers.map((marker, index) => (
            <View
              key={index}
              style={[
                styles.marker,
                { left: `${marker.x}%`, top: `${marker.y}%` }
              ]}
            />
          ))}
        </View>

        {/* Stats Section Title */}
        <Text style={styles.statsTitle}>Ferdi Stats</Text>
        <View style={styles.titleUnderline} />

        {/* Stats and Rank Row */}
        <View style={styles.statsRow}>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Continents</Text>
              <Text style={styles.statValue}>{visitedContinents.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Countries</Text>
              <Text style={styles.statValue}>{totalCountries}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Cities</Text>
              <Text style={styles.statValue}>{totalCities}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>% of Globe</Text>
              <Text style={styles.statValue}>{worldCoverage}%</Text>
            </View>
            <View style={[styles.statItem, styles.topCountryItem]}>
              <Text style={styles.statLabel}>Top Country</Text>
              <Text style={[styles.statValue, styles.topCountryValue]} numberOfLines={1}>{topCountry}</Text>
            </View>
          </View>

          {/* Rank Badge */}
          <View style={styles.rankContainer}>
            <Text style={styles.rankLabel}>Rank</Text>
            <View style={styles.rankBadge}>
              <Text style={styles.rankName}>{rankName}</Text>
              {rankLevel && (
                <Text style={styles.rankLevel}>Lvl.{rankLevel}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Bottom Section with App Store badges */}
        <View style={styles.bottomSection}>
          <View style={styles.ferdiIconPlaceholder}>
            <Text style={styles.ferdiIconText}>F</Text>
          </View>
          <View style={styles.storeBadges}>
            <View style={styles.storeBadge}>
              <Ionicons name="logo-apple" size={10} color="#fff" />
              <Text style={styles.storeBadgeText}>App Store</Text>
            </View>
            <View style={styles.storeBadge}>
              <Ionicons name="logo-google-playstore" size={10} color="#fff" />
              <Text style={styles.storeBadgeText}>Google Play</Text>
            </View>
          </View>
        </View>

        {/* Flag ribbon */}
        <View style={styles.flagRibbon}>
          {displayFlags.map((country, index) => (
            <Text key={index} style={styles.flag}>
              {countryFlags[country] || '🏳️'}
            </Text>
          ))}
          {remainingCount > 0 && (
            <View style={styles.moreFlags}>
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
    height: CARD_SIZE * 0.28,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mapOutline: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  continent: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  northAmerica: {
    left: '5%',
    top: '15%',
    width: '20%',
    height: '35%',
    borderRadius: 20,
  },
  southAmerica: {
    left: '18%',
    top: '50%',
    width: '12%',
    height: '35%',
    borderRadius: 15,
  },
  europe: {
    left: '42%',
    top: '15%',
    width: '15%',
    height: '25%',
    borderRadius: 10,
  },
  africa: {
    left: '42%',
    top: '35%',
    width: '18%',
    height: '40%',
    borderRadius: 15,
  },
  asia: {
    left: '55%',
    top: '10%',
    width: '35%',
    height: '45%',
    borderRadius: 20,
  },
  oceania: {
    left: '75%',
    top: '60%',
    width: '18%',
    height: '25%',
    borderRadius: 10,
  },
  marker: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    marginLeft: -4,
    marginTop: -4,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginTop: 10,
  },
  titleUnderline: {
    height: 2,
    backgroundColor: '#4ade80',
    marginTop: 2,
    marginBottom: 8,
    width: '35%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    marginBottom: 6,
  },
  topCountryItem: {
    width: '100%',
  },
  statLabel: {
    color: '#888',
    fontSize: 10,
  },
  statValue: {
    color: '#4ade80',
    fontSize: 18,
    fontWeight: 'bold',
  },
  topCountryValue: {
    fontSize: 16,
  },
  rankContainer: {
    alignItems: 'center',
    marginLeft: 10,
  },
  rankLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  rankBadge: {
    backgroundColor: '#4ade80',
    borderRadius: 40,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankName: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  rankLevel: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  ferdiIconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1a3a5c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ferdiIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  storeBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  storeBadgeText: {
    color: '#fff',
    fontSize: 8,
  },
  flagRibbon: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  flag: {
    fontSize: 14,
    marginHorizontal: 1,
  },
  moreFlags: {
    backgroundColor: '#4ade80',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 3,
  },
  moreFlagsText: {
    color: '#000',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default ShareableStatsCard;
