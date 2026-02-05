import React, { forwardRef, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CountryFlag from 'react-native-country-flag';
import { getTravelerRank } from '../utils/rankingSystem';
import { countryCoordinates } from '../utils/coordinates';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = Math.min(screenWidth - 40, 380);
const CARD_HEIGHT = CARD_WIDTH * 1.25; // 4:5 aspect ratio (1.25 = 5/4)
const MAP_HEIGHT = CARD_HEIGHT * 0.42; // Larger map to fill the space

// Google Maps API key for Static Maps
const GOOGLE_MAPS_API_KEY = 'AIzaSyBtzMruCCMpiFfqfdhLtoHWfSk3TZ5UvJ8';

// Marker colors for Google Maps (without # prefix)
const MARKER_COLORS = ['red', 'blue', 'green', 'orange', 'purple', 'pink', 'yellow', 'white'];

// Load Ferdi assets
const ferdiIcon = require('../assets/ferdi icon.png');
const ferdiAppAsset = require('../assets/Ferdi App Asset.png');
const ferdiStatsAsset = require('../assets/Ferdi Stats Asset.png');

// Country name to ISO 2-letter code mapping (comprehensive list for all 211+ territories)
const countryToIsoCode = {
  // North America
  'USA': 'us', 'United States': 'us', 'Canada': 'ca', 'Mexico': 'mx',
  'Costa Rica': 'cr', 'Panama': 'pa', 'Cuba': 'cu', 'Jamaica': 'jm',
  'Guatemala': 'gt', 'Honduras': 'hn', 'El Salvador': 'sv', 'Nicaragua': 'ni',
  'Belize': 'bz', 'Dominican Republic': 'do', 'Puerto Rico': 'pr', 'Haiti': 'ht',
  'Bahamas': 'bs', 'Barbados': 'bb', 'Trinidad and Tobago': 'tt',
  'Antigua and Barbuda': 'ag', 'Dominica': 'dm', 'Grenada': 'gd',
  'Saint Kitts and Nevis': 'kn', 'Saint Lucia': 'lc', 'Saint Vincent and the Grenadines': 'vc',

  // Europe
  'UK': 'gb', 'United Kingdom': 'gb', 'England': 'gb', 'Scotland': 'gb', 'Wales': 'gb', 'Northern Ireland': 'gb',
  'France': 'fr', 'Germany': 'de', 'Italy': 'it', 'Spain': 'es', 'Portugal': 'pt',
  'Netherlands': 'nl', 'Belgium': 'be', 'Switzerland': 'ch', 'Austria': 'at', 'Greece': 'gr',
  'Poland': 'pl', 'Sweden': 'se', 'Norway': 'no', 'Denmark': 'dk', 'Finland': 'fi', 'Iceland': 'is',
  'Ireland': 'ie', 'Croatia': 'hr', 'Romania': 'ro', 'Bulgaria': 'bg', 'Czech Republic': 'cz',
  'Hungary': 'hu', 'Slovakia': 'sk', 'Slovenia': 'si', 'Estonia': 'ee', 'Latvia': 'lv',
  'Lithuania': 'lt', 'Luxembourg': 'lu', 'Malta': 'mt', 'Cyprus': 'cy', 'Albania': 'al',
  'Serbia': 'rs', 'Montenegro': 'me', 'Bosnia and Herzegovina': 'ba', 'North Macedonia': 'mk',
  'Kosovo': 'xk', 'Monaco': 'mc', 'Liechtenstein': 'li', 'San Marino': 'sm', 'Andorra': 'ad',
  'Vatican City': 'va', 'Russia': 'ru', 'Ukraine': 'ua', 'Belarus': 'by', 'Moldova': 'md',

  // Asia
  'Japan': 'jp', 'China': 'cn', 'South Korea': 'kr', 'India': 'in', 'Thailand': 'th',
  'Vietnam': 'vn', 'Singapore': 'sg', 'Malaysia': 'my', 'Indonesia': 'id', 'Philippines': 'ph',
  'Cambodia': 'kh', 'Laos': 'la', 'Myanmar': 'mm', 'Hong Kong': 'hk', 'Taiwan': 'tw',
  'Maldives': 'mv', 'Sri Lanka': 'lk', 'Nepal': 'np', 'Bhutan': 'bt', 'Bangladesh': 'bd',
  'Pakistan': 'pk', 'Afghanistan': 'af', 'Uzbekistan': 'uz', 'Kazakhstan': 'kz',
  'Turkmenistan': 'tm', 'Tajikistan': 'tj', 'Kyrgyzstan': 'kg', 'Mongolia': 'mn',
  'North Korea': 'kp', 'Brunei': 'bn', 'Timor-Leste': 'tl', 'Macau': 'mo',
  'Turkey': 'tr', 'United Arab Emirates': 'ae', 'Saudi Arabia': 'sa', 'Israel': 'il',
  'Qatar': 'qa', 'Kuwait': 'kw', 'Bahrain': 'bh', 'Oman': 'om', 'Jordan': 'jo',
  'Lebanon': 'lb', 'Syria': 'sy', 'Iraq': 'iq', 'Iran': 'ir', 'Yemen': 'ye',
  'Georgia': 'ge', 'Armenia': 'am', 'Azerbaijan': 'az', 'Palestine': 'ps',

  // South America
  'Brazil': 'br', 'Argentina': 'ar', 'Chile': 'cl', 'Peru': 'pe', 'Colombia': 'co',
  'Ecuador': 'ec', 'Bolivia': 'bo', 'Uruguay': 'uy', 'Paraguay': 'py',
  'Venezuela': 've', 'Guyana': 'gy', 'Suriname': 'sr',

  // Africa
  'Egypt': 'eg', 'South Africa': 'za', 'Morocco': 'ma', 'Kenya': 'ke', 'Tanzania': 'tz',
  'Ethiopia': 'et', 'Tunisia': 'tn', 'Madagascar': 'mg', 'Nigeria': 'ng', 'Ghana': 'gh',
  'Senegal': 'sn', 'Uganda': 'ug', 'Rwanda': 'rw', 'Botswana': 'bw', 'Namibia': 'na',
  'Zimbabwe': 'zw', 'Zambia': 'zm', 'Mozambique': 'mz', 'Angola': 'ao', 'Algeria': 'dz',
  'Libya': 'ly', 'Sudan': 'sd', 'South Sudan': 'ss', 'Somalia': 'so', 'Eritrea': 'er',
  'Djibouti': 'dj', 'Cameroon': 'cm', 'Ivory Coast': 'ci', 'Mali': 'ml', 'Niger': 'ne',
  'Burkina Faso': 'bf', 'Chad': 'td', 'Congo': 'cg', 'Democratic Republic of Congo': 'cd',
  'Central African Republic': 'cf', 'Gabon': 'ga', 'Equatorial Guinea': 'gq',
  'Benin': 'bj', 'Togo': 'tg', 'Liberia': 'lr', 'Sierra Leone': 'sl', 'Guinea': 'gn',
  'Guinea-Bissau': 'gw', 'Gambia': 'gm', 'Mauritania': 'mr', 'Cape Verde': 'cv',
  'Sao Tome and Principe': 'st', 'Comoros': 'km', 'Mauritius': 'mu', 'Seychelles': 'sc',
  'Malawi': 'mw', 'Lesotho': 'ls', 'Eswatini': 'sz', 'Burundi': 'bi',

  // Oceania
  'Australia': 'au', 'New Zealand': 'nz', 'Fiji': 'fj', 'Papua New Guinea': 'pg',
  'Solomon Islands': 'sb', 'Vanuatu': 'vu', 'Samoa': 'ws', 'Tonga': 'to',
  'Palau': 'pw', 'Micronesia': 'fm', 'Guam': 'gu', 'Marshall Islands': 'mh',
  'Kiribati': 'ki', 'Nauru': 'nr', 'Tuvalu': 'tv',

  // Caribbean Territories & Dependencies
  'Turks and Caicos': 'tc', 'Turks and Caicos Islands': 'tc',
  'Cayman Islands': 'ky',
  'US Virgin Islands': 'vi', 'U.S. Virgin Islands': 'vi', 'Virgin Islands': 'vi',
  'British Virgin Islands': 'vg',
  'Aruba': 'aw',
  'Curacao': 'cw', 'Curaçao': 'cw',
  'Sint Maarten': 'sx',
  'Saint Martin': 'mf', 'St. Martin': 'mf',
  'Guadeloupe': 'gp',
  'Martinique': 'mq',
  'Anguilla': 'ai',
  'Montserrat': 'ms',
  'Bermuda': 'bm',

  // Other Territories
  'French Polynesia': 'pf',
  'New Caledonia': 'nc',
  'American Samoa': 'as',
  'Northern Mariana Islands': 'mp',
  'Cook Islands': 'ck',
  'French Guiana': 'gf',
  'Reunion': 're', 'Réunion': 're',
  'Mayotte': 'yt',
  'Saint Pierre and Miquelon': 'pm',
  'Wallis and Futuna': 'wf',
  'Greenland': 'gl',
  'Faroe Islands': 'fo',
  'Isle of Man': 'im',
  'Jersey': 'je',
  'Guernsey': 'gg',
  'Gibraltar': 'gi',
  'Falkland Islands': 'fk',
  'Saint Helena': 'sh',
  'Ascension Island': 'ac',
  'Tristan da Cunha': 'ta',
  'Pitcairn Islands': 'pn',
  'Tokelau': 'tk',
  'Niue': 'nu',
  'Norfolk Island': 'nf',
  'Christmas Island': 'cx',
  'Cocos Islands': 'cc',
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
  onMapReady = () => {},
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

  // Get flags for display (up to 6 unique in header)
  const uniqueCountries = [...new Set(completedTrips.map(t => t.country))];
  const displayFlags = uniqueCountries.slice(0, 6);

  // Create marker data for Google Static Maps
  const markers = useMemo(() => {
    return completedTrips.map((trip, index) => {
      const coords = countryCoordinates[trip.country];
      if (!coords) return null;
      const color = MARKER_COLORS[index % MARKER_COLORS.length];
      return { lat: coords.latitude, lng: coords.longitude, country: trip.country, color };
    }).filter(Boolean);
  }, [completedTrips]);

  // Build Google Static Maps URL
  const mapUrl = useMemo(() => {
    // Build markers string
    const markerParts = markers.slice(0, 15).map((m, i) => {
      const color = MARKER_COLORS[i % MARKER_COLORS.length];
      return `markers=color:${color}%7Csize:small%7C${m.lat},${m.lng}`;
    });

    // Base parameters - request taller image to crop out Google attribution
    const baseParams = [
      'center=20,0', // Center on Atlantic for world view
      'zoom=1',
      'size=600x340', // Taller to allow cropping bottom attribution
      'scale=2',
      'maptype=roadmap',
    ];

    // Dark map styling - black ocean, green land, white country borders
    const styleParams = [
      'style=feature:all%7Celement:labels%7Cvisibility:off',
      'style=feature:water%7Celement:geometry%7Ccolor:0x000000', // Black ocean
      'style=feature:landscape%7Celement:geometry%7Ccolor:0x1a3a2a', // Dark green land
      'style=feature:road%7Cvisibility:off',
      'style=feature:poi%7Cvisibility:off',
      'style=feature:administrative.country%7Celement:geometry.stroke%7Cvisibility:on%7Ccolor:0x4ade80%7Cweight:1', // Green country borders
      'style=feature:administrative.province%7Cvisibility:off',
      'style=feature:administrative.locality%7Cvisibility:off',
      'style=feature:administrative.land_parcel%7Cvisibility:off',
    ];

    // Combine all parameters
    const allParams = [...baseParams, ...styleParams, ...markerParts, `key=${GOOGLE_MAPS_API_KEY}`];
    const url = `https://maps.googleapis.com/maps/api/staticmap?${allParams.join('&')}`;

    console.log('=== Map Debug ===');
    console.log('Map URL:', url);
    console.log('Markers count:', markers.length);
    return url;
  }, [markers]);

  // Track map loading state
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (mapUrl) {
      // Set a timeout fallback - if map doesn't load in 5 seconds, allow proceed anyway
      timeoutId = setTimeout(() => {
        console.log('Map load timeout - allowing proceed without map');
        onMapReady(true);
      }, 5000);

      Image.prefetch(mapUrl)
        .then(() => {
          clearTimeout(timeoutId);
          setMapLoaded(true);
          setMapError(false);
          onMapReady(true);
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          console.log('Map prefetch error:', err);
          setMapError(true);
          // Still allow proceed even if map fails
          onMapReady(true);
        });
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [mapUrl, onMapReady]);

  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      {/* Border glow effect */}
      <View style={styles.borderGlow} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Header row with flags on left, app name on right */}
        <View style={styles.headerRow}>
          {/* Flag ribbon - top left */}
          <View style={styles.flagRibbon}>
            {displayFlags.slice(0, 6).map((country, index) => {
              const isoCode = countryToIsoCode[country];
              return (
                <View
                  key={index}
                  style={[
                    styles.flagCircle,
                    { marginLeft: index === 0 ? 0 : -6, zIndex: displayFlags.length - index }
                  ]}
                >
                  {isoCode ? (
                    <CountryFlag isoCode={isoCode} size={24} style={styles.flagImage} />
                  ) : (
                    <Text style={styles.flag}>?</Text>
                  )}
                </View>
              );
            })}
            {uniqueCountries.length > 6 && (
              <View style={[styles.moreFlags, { marginLeft: -6, zIndex: 0 }]}>
                <Text style={styles.moreFlagsText}>+{uniqueCountries.length - 6}</Text>
              </View>
            )}
          </View>
          <Image source={ferdiAppAsset} style={styles.appNameImage} resizeMode="cover" />
        </View>

        {/* World Map with Markers - Google Static Maps */}
        <View style={styles.mapContainer}>
          {!mapLoaded && !mapError && (
            <View style={[styles.mapFallback, { zIndex: 1 }]}>
              <Text style={styles.mapFallbackText}>Loading map...</Text>
            </View>
          )}
          <Image
            source={{ uri: mapUrl }}
            style={styles.mapImage}
            resizeMode="cover"
            onLoad={() => {
              console.log('Map image loaded successfully');
              setMapLoaded(true);
              setMapError(false);
              onMapReady(true);
            }}
            onError={(e) => {
              console.log('Map image error:', e.nativeEvent?.error || 'Unknown error');
              console.log('Failed URL was:', mapUrl);
              setMapError(true);
            }}
          />
          {mapError && (
            <View style={[styles.mapFallback, { zIndex: 2 }]}>
              <Text style={styles.mapFallbackText}>Unable to load map</Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsTitleRow}>
            <Image source={ferdiStatsAsset} style={styles.statsTitleImage} resizeMode="cover" />
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
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Cities</Text>
                  <Text style={styles.statValue}>{totalCities}</Text>
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
              <Ionicons name="logo-apple" size={12} color="#fff" />
              <View>
                <Text style={styles.storeSmallText}>Download on the</Text>
                <Text style={styles.storeBigText}>App Store</Text>
              </View>
            </View>
            <View style={styles.storeBadge}>
              <Ionicons name="logo-google-playstore" size={12} color="#fff" />
              <View>
                <Text style={styles.storeSmallText}>GET IT ON</Text>
                <Text style={styles.storeBigText}>Google Play</Text>
              </View>
            </View>
          </View>
        </View>

      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  appName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAlign: 'right',
    marginBottom: 4,
  },
  appNameImage: {
    height: 28,
    width: 112,
    minHeight: 28,
    minWidth: 112,
    flexShrink: 0,
    transform: [{ scale: 1.4 }, { translateY: 2 }],
    marginRight: 8,
  },
  mapContainer: {
    height: MAP_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#000000', // Black to match ocean
    borderRadius: 8,
  },
  mapImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '115%', // Taller than container to crop bottom attribution
    borderRadius: 8,
  },
  mapFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000', // Black to match ocean
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapFallbackText: {
    color: '#4ade80',
    fontSize: 12,
  },
  statsSection: {
    marginTop: 10,
    flex: 1,
  },
  statsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  statsTitleImage: {
    height: 28,
    width: 140,
    minHeight: 28,
    minWidth: 140,
    flexShrink: 0,
    transform: [{ scale: 1.6 }],
    marginLeft: 12,
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
    marginBottom: 6,
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    color: '#888',
    fontSize: 11,
  },
  statValue: {
    color: '#4ade80',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statValueSmall: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankContainer: {
    alignItems: 'center',
    marginLeft: 8,
    transform: [{ translateX: -15 }, { translateY: 5 }],
  },
  rankLabelArc: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
    height: 24,
  },
  rankLabelChar: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    fontStyle: 'italic',
    lineHeight: 13,
    textAlign: 'center',
  },
  rankBadge: {
    backgroundColor: '#4ade80',
    borderRadius: 40,
    width: 75,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankName: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
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
  ferdiIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  ferdiIconPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1a3a5c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ferdiIconText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  storeBadgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 4,
  },
  storeSmallText: {
    color: '#fff',
    fontSize: 6,
  },
  storeBigText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  flagRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
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
  flagImage: {
    borderRadius: 12,
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
