import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert, useWindowDimensions, Animated, PanResponder } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { countryCoordinates, officialCountryNames } from '../utils/coordinates';
import { useTranslation } from 'react-i18next';
import { GOOGLE_MAPS_API_KEY } from '../utils/geocoding';
import { calculateDistance } from '../utils/distanceHelper';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

// Country flag emoji mapping
const countryFlags = {
  'Afghanistan': '🇦🇫', 'Albania': '🇦🇱', 'Algeria': '🇩🇿', 'Andorra': '🇦🇩', 'Angola': '🇦🇴',
  'Argentina': '🇦🇷', 'Armenia': '🇦🇲', 'Australia': '🇦🇺', 'Austria': '🇦🇹', 'Azerbaijan': '🇦🇿',
  'Bahamas': '🇧🇸', 'Bahrain': '🇧🇭', 'Bangladesh': '🇧🇩', 'Barbados': '🇧🇧', 'Belarus': '🇧🇾',
  'Belgium': '🇧🇪', 'Belize': '🇧🇿', 'Benin': '🇧🇯', 'Bhutan': '🇧🇹', 'Bolivia': '🇧🇴',
  'Bosnia and Herzegovina': '🇧🇦', 'Botswana': '🇧🇼', 'Brazil': '🇧🇷', 'Brunei': '🇧🇳',
  'Bulgaria': '🇧🇬', 'Burkina Faso': '🇧🇫', 'Burundi': '🇧🇮', 'Cambodia': '🇰🇭', 'Cameroon': '🇨🇲',
  'Canada': '🇨🇦', 'Cape Verde': '🇨🇻', 'Central African Republic': '🇨🇫', 'Chad': '🇹🇩',
  'Chile': '🇨🇱', 'China': '🇨🇳', 'Colombia': '🇨🇴', 'Comoros': '🇰🇲', 'Congo': '🇨🇬',
  'Costa Rica': '🇨🇷', 'Croatia': '🇭🇷', 'Cuba': '🇨🇺', 'Cyprus': '🇨🇾', 'Czech Republic': '🇨🇿',
  'Denmark': '🇩🇰', 'Djibouti': '🇩🇯', 'Dominica': '🇩🇲', 'Dominican Republic': '🇩🇴',
  'East Timor': '🇹🇱', 'Ecuador': '🇪🇨', 'Egypt': '🇪🇬', 'El Salvador': '🇸🇻',
  'Equatorial Guinea': '🇬🇶', 'Eritrea': '🇪🇷', 'Estonia': '🇪🇪', 'Ethiopia': '🇪🇹',
  'Fiji': '🇫🇯', 'Finland': '🇫🇮', 'France': '🇫🇷', 'Gabon': '🇬🇦', 'Gambia': '🇬🇲',
  'Georgia': '🇬🇪', 'Germany': '🇩🇪', 'Ghana': '🇬🇭', 'Greece': '🇬🇷', 'Grenada': '🇬🇩',
  'Guatemala': '🇬🇹', 'Guinea': '🇬🇳', 'Guinea-Bissau': '🇬🇼', 'Guyana': '🇬🇾', 'Haiti': '🇭🇹',
  'Honduras': '🇭🇳', 'Hong Kong': '🇭🇰', 'Hungary': '🇭🇺', 'Iceland': '🇮🇸', 'India': '🇮🇳',
  'Indonesia': '🇮🇩', 'Iran': '🇮🇷', 'Iraq': '🇮🇶', 'Ireland': '🇮🇪', 'Israel': '🇮🇱',
  'Italy': '🇮🇹', 'Jamaica': '🇯🇲', 'Japan': '🇯🇵', 'Jordan': '🇯🇴', 'Kazakhstan': '🇰🇿',
  'Kenya': '🇰🇪', 'Kiribati': '🇰🇮', 'Kosovo': '🇽🇰', 'Kuwait': '🇰🇼', 'Kyrgyzstan': '🇰🇬',
  'Laos': '🇱🇦', 'Latvia': '🇱🇻', 'Lebanon': '🇱🇧', 'Lesotho': '🇱🇸', 'Liberia': '🇱🇷',
  'Libya': '🇱🇾', 'Liechtenstein': '🇱🇮', 'Lithuania': '🇱🇹', 'Luxembourg': '🇱🇺',
  'Macedonia': '🇲🇰', 'Madagascar': '🇲🇬', 'Malawi': '🇲🇼', 'Malaysia': '🇲🇾', 'Maldives': '🇲🇻',
  'Mali': '🇲🇱', 'Malta': '🇲🇹', 'Marshall Islands': '🇲🇭', 'Mauritania': '🇲🇷', 'Mauritius': '🇲🇺',
  'Mexico': '🇲🇽', 'Micronesia': '🇫🇲', 'Moldova': '🇲🇩', 'Monaco': '🇲🇨', 'Mongolia': '🇲🇳',
  'Montenegro': '🇲🇪', 'Morocco': '🇲🇦', 'Mozambique': '🇲🇿', 'Myanmar': '🇲🇲', 'Namibia': '🇳🇦',
  'Nauru': '🇳🇷', 'Nepal': '🇳🇵', 'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿', 'Nicaragua': '🇳🇮',
  'Niger': '🇳🇪', 'Nigeria': '🇳🇬', 'North Korea': '🇰🇵', 'North Macedonia': '🇲🇰', 'Norway': '🇳🇴',
  'Oman': '🇴🇲', 'Pakistan': '🇵🇰', 'Palau': '🇵🇼', 'Palestine': '🇵🇸', 'Panama': '🇵🇦',
  'Papua New Guinea': '🇵🇬', 'Paraguay': '🇵🇾', 'Peru': '🇵🇪', 'Philippines': '🇵🇭', 'Poland': '🇵🇱',
  'Portugal': '🇵🇹', 'Qatar': '🇶🇦', 'Romania': '🇷🇴', 'Russia': '🇷🇺', 'Rwanda': '🇷🇼',
  'Saint Kitts and Nevis': '🇰🇳', 'Saint Lucia': '🇱🇨', 'Saint Vincent and the Grenadines': '🇻🇨',
  'Samoa': '🇼🇸', 'San Marino': '🇸🇲', 'Sao Tome and Principe': '🇸🇹', 'Saudi Arabia': '🇸🇦',
  'Senegal': '🇸🇳', 'Serbia': '🇷🇸', 'Seychelles': '🇸🇨', 'Sierra Leone': '🇸🇱', 'Singapore': '🇸🇬',
  'Slovakia': '🇸🇰', 'Slovenia': '🇸🇮', 'Solomon Islands': '🇸🇧', 'Somalia': '🇸🇴',
  'South Africa': '🇿🇦', 'South Korea': '🇰🇷', 'South Sudan': '🇸🇸', 'Spain': '🇪🇸',
  'Sri Lanka': '🇱🇰', 'Sudan': '🇸🇩', 'Suriname': '🇸🇷', 'Swaziland': '🇸🇿', 'Sweden': '🇸🇪',
  'Switzerland': '🇨🇭', 'Syria': '🇸🇾', 'Taiwan': '🇹🇼', 'Tajikistan': '🇹🇯', 'Tanzania': '🇹🇿',
  'Thailand': '🇹🇭', 'Togo': '🇹🇬', 'Tonga': '🇹🇴', 'Trinidad and Tobago': '🇹🇹', 'Tunisia': '🇹🇳',
  'Turkey': '🇹🇷', 'Turkmenistan': '🇹🇲', 'Tuvalu': '🇹🇻', 'Uganda': '🇺🇬', 'Ukraine': '🇺🇦',
  'United Arab Emirates': '🇦🇪', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Northern Ireland': '🇬🇧', 'United States': '🇺🇸', 'Uruguay': '🇺🇾',
  'Uzbekistan': '🇺🇿', 'Vanuatu': '🇻🇺', 'Vatican City': '🇻🇦', 'Venezuela': '🇻🇪',
  'Vietnam': '🇻🇳', 'Yemen': '🇾🇪', 'Zambia': '🇿🇲', 'Zimbabwe': '🇿🇼',
  // Common alternative names
  'USA': '🇺🇸', 'US': '🇺🇸', 'America': '🇺🇸', 'UK': '🇬🇧', 'United Kingdom': '🇬🇧',
  'Great Britain': '🇬🇧', 'Britain': '🇬🇧', 'UAE': '🇦🇪', 'Emirates': '🇦🇪', 'Dubai': '🇦🇪',
  'Czech': '🇨🇿', 'Czechia': '🇨🇿', 'Korea': '🇰🇷', 'Holland': '🇳🇱', 'The Netherlands': '🇳🇱',
  'Ivory Coast': '🇨🇮', "Cote d'Ivoire": '🇨🇮', 'DR Congo': '🇨🇩', 'Democratic Republic of Congo': '🇨🇩',
  'DRC': '🇨🇩', 'Republic of Congo': '🇨🇬', 'Eswatini': '🇸🇿', 'Burma': '🇲🇲', 'Timor-Leste': '🇹🇱',
  'Russian Federation': '🇷🇺', 'Macau': '🇲🇴', 'Macao': '🇲🇴', 'Bosnia': '🇧🇦',
  'St. Lucia': '🇱🇨', 'St Lucia': '🇱🇨', 'St. Vincent': '🇻🇨', 'St Vincent': '🇻🇨',
  'St. Kitts': '🇰🇳', 'St Kitts': '🇰🇳', 'Trinidad': '🇹🇹', 'Antigua': '🇦🇬',
  'Antigua and Barbuda': '🇦🇬', 'New Caledonia': '🇳🇨', 'French Polynesia': '🇵🇫',
  'Tahiti': '🇵🇫', 'Puerto Rico': '🇵🇷', 'Guam': '🇬🇺', 'Virgin Islands': '🇻🇮',
  'Bermuda': '🇧🇲', 'Cayman Islands': '🇰🇾', 'The Bahamas': '🇧🇸', 'Turks and Caicos': '🇹🇨',
  'Aruba': '🇦🇼', 'Curacao': '🇨🇼', 'Bonaire': '🇧🇶', 'Martinique': '🇲🇶', 'Guadeloupe': '🇬🇵',
  'Reunion': '🇷🇪', 'Zanzibar': '🇹🇿',
};

// Get flag emoji for a country
const getCountryFlag = (country) => {
  return countryFlags[country] || '🏳️';
};

export default function TravelMapperScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pickerMode, setPickerMode] = useState('country'); // 'country' or 'address'
  const [addressSearch, setAddressSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [addressResults, setAddressResults] = useState([]);

  // Legacy support
  const [selectedCountries, setSelectedCountries] = useState([]);

  // Draggable bottom panel
  const minPanelRatio = 0.20;  // Panel collapsed - map takes 80%
  const defaultPanelRatio = 0.40; // Default - map takes 60%
  const maxPanelRatio = 0.65;  // Panel expanded - map takes 35%
  const panelHeight = useRef(new Animated.Value(screenHeight * defaultPanelRatio)).current;
  const lastPanelHeight = useRef(screenHeight * defaultPanelRatio);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        panelHeight.stopAnimation((val) => {
          lastPanelHeight.current = val;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = lastPanelHeight.current - gestureState.dy;
        const clamped = Math.min(
          screenHeight * maxPanelRatio,
          Math.max(screenHeight * minPanelRatio, newHeight)
        );
        panelHeight.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentHeight = lastPanelHeight.current - gestureState.dy;
        // Snap to nearest position
        const positions = [
          screenHeight * minPanelRatio,
          screenHeight * defaultPanelRatio,
          screenHeight * maxPanelRatio,
        ];
        const closest = positions.reduce((prev, curr) =>
          Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight) ? curr : prev
        );
        lastPanelHeight.current = closest;
        Animated.spring(panelHeight, {
          toValue: closest,
          useNativeDriver: false,
          tension: 60,
          friction: 12,
        }).start();
      },
    })
  ).current;

  const countries = officialCountryNames;

  // Geocode an address using Google Maps API
  const geocodeAddress = async (address) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
      console.log('Geocoding URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Geocoding response:', JSON.stringify(data, null, 2));

      if (data.status === 'OK' && data.results.length > 0) {
        return {
          success: true,
          results: data.results.map(result => ({
            name: result.formatted_address,
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
            type: 'address',
            placeId: result.place_id,
          }))
        };
      }

      // Return error info for display
      return {
        success: false,
        error: data.status,
        message: getGeocodingErrorMessage(data.status, data.error_message)
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network error. Please check your internet connection.'
      };
    }
  };

  // Get user-friendly error messages
  const getGeocodingErrorMessage = (status, errorMessage) => {
    // Check for API key authorization error in the error message
    if (errorMessage && errorMessage.includes('not authorized')) {
      return 'API key not authorized for this app. Please configure API key restrictions in Google Cloud Console to allow your app package name (com.ferdi.app) or remove restrictions.';
    }

    switch (status) {
      case 'ZERO_RESULTS':
        return 'No locations found. Try a different search term.';
      case 'OVER_QUERY_LIMIT':
        return 'API limit reached. Please try again later.';
      case 'REQUEST_DENIED':
        return 'Geocoding API is not enabled or API key not authorized. Please check Google Cloud Console settings.';
      case 'INVALID_REQUEST':
        return 'Invalid search. Please enter a valid address or city.';
      default:
        return `Search failed: ${status}`;
    }
  };

  // Search for addresses
  const searchAddresses = async () => {
    if (!addressSearch.trim()) return;

    setIsSearching(true);
    setAddressResults([]);

    const result = await geocodeAddress(addressSearch);

    if (result.success) {
      setAddressResults(result.results);
    } else {
      // Show error alert
      Alert.alert(
        'Search Failed',
        result.message,
        [{ text: 'OK' }]
      );
      setAddressResults([]);
    }

    setIsSearching(false);
  };

  // Calculate travel time for different transportation modes
  const calculateTravelTime = (miles) => {
    const planeSpeed = 550; // mph
    const carSpeed = 60; // mph
    const trainSpeed = 100; // mph

    const formatTime = (hours) => {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      if (h === 0) return `${m} min`;
      if (m === 0) return `${h} hr`;
      return `${h} hr ${m} min`;
    };

    return {
      plane: formatTime(miles / planeSpeed),
      car: formatTime(miles / carSpeed),
      train: formatTime(miles / trainSpeed),
    };
  };

  // Get location coordinates (works for both countries and addresses)
  const getLocationCoords = (location) => {
    if (typeof location === 'string') {
      // It's a country name
      return countryCoordinates[location];
    }
    // It's a location object with coordinates
    return { latitude: location.latitude, longitude: location.longitude };
  };

  // Get total journey stats
  const getJourneyStats = () => {
    if (selectedLocations.length < 2) return null;

    let totalMiles = 0;
    let totalKm = 0;

    for (let i = 0; i < selectedLocations.length - 1; i++) {
      const current = getLocationCoords(selectedLocations[i]);
      const next = getLocationCoords(selectedLocations[i + 1]);
      if (!current || !next) continue;
      const distance = calculateDistance(
        current.latitude,
        current.longitude,
        next.latitude,
        next.longitude
      );
      totalMiles += distance.miles;
      totalKm += distance.km;
    }

    const travelTimes = calculateTravelTime(totalMiles);

    return {
      totalMiles,
      totalKm,
      locations: selectedLocations.length,
      legs: selectedLocations.length - 1,
      travelTimes
    };
  };

  // Add a country to the journey
  const addCountry = (country) => {
    const locationExists = selectedLocations.some(loc =>
      typeof loc === 'string' ? loc === country : false
    );
    if (country && !locationExists) {
      setSelectedLocations([...selectedLocations, country]);
      setSearchText('');
      setShowLocationPicker(false);
    }
  };

  // Add an address/city to the journey
  const addAddress = (addressObj) => {
    const locationExists = selectedLocations.some(loc =>
      typeof loc === 'object' && loc.placeId === addressObj.placeId
    );
    if (!locationExists) {
      setSelectedLocations([...selectedLocations, addressObj]);
      setAddressSearch('');
      setAddressResults([]);
      setShowLocationPicker(false);
    }
  };

  // Get display name for a location
  const getLocationName = (location) => {
    if (typeof location === 'string') return location;
    // For addresses, show a shorter version
    const parts = location.name.split(',');
    return parts.length > 2 ? `${parts[0]}, ${parts[1]}` : location.name;
  };

  // Get location type icon
  const getLocationIcon = (location) => {
    if (typeof location === 'string') return 'flag';
    return 'location';
  };

  const removeLocation = (index) => {
    const updated = selectedLocations.filter((_, i) => i !== index);
    setSelectedLocations(updated);
  };

  const moveLocation = (index, direction) => {
    const updated = [...selectedLocations];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < updated.length) {
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      setSelectedLocations(updated);
    }
  };

  const saveToMyTrips = () => {
    const locationsForTrip = selectedLocations.map(loc => {
      if (typeof loc === 'string') {
        return {
          name: loc,
          type: 'country',
          startDate: null,
          endDate: null,
        };
      }
      return {
        name: loc.name,
        type: 'address',
        latitude: loc.latitude,
        longitude: loc.longitude,
        startDate: null,
        endDate: null,
      };
    });

    navigation.navigate('CreateTrip', {
      prefilledCountries: locationsForTrip
    });
  };

  // Get map markers
  const markers = selectedLocations.map((location, index) => {
    const coords = getLocationCoords(location);
    return {
      ...coords,
      name: getLocationName(location),
      index: index + 1,
      type: typeof location === 'string' ? 'country' : 'address',
    };
  }).filter(m => m.latitude && m.longitude);

  // Get polyline coordinates
  const polylineCoords = markers.map(m => ({
    latitude: m.latitude,
    longitude: m.longitude,
  }));

  // Calculate map region to fit all markers
  const getMapRegion = () => {
    if (markers.length === 0) {
      return {
        latitude: 20,
        longitude: 0,
        latitudeDelta: 100,
        longitudeDelta: 100,
      };
    }

    const lats = markers.map(m => m.latitude);
    const lngs = markers.map(m => m.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) * 1.5 || 50;
    const lngDelta = (maxLng - minLng) * 1.5 || 50;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 20),
      longitudeDelta: Math.max(lngDelta, 20),
    };
  };

  const journeyStats = getJourneyStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MapView
        style={[styles.map, { width: screenWidth, flex: 1 }]}
        region={getMapRegion()}
      >
        {polylineCoords.length > 1 && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor={theme.primary}
            strokeWidth={3}
          />
        )}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={`${marker.index}. ${marker.name}`}
            pinColor={theme.primary}
          >
            <View style={[styles.markerContainer, { backgroundColor: theme.primary }]}>
              <Text style={[styles.markerNumber, { color: theme.background }]}>{marker.index}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Journey Stats Card */}
      {journeyStats && (
        <View style={[styles.statsCard, {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border
        }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="location" size={20} color={theme.primary} />
              <Text style={[styles.statValue, { color: theme.text }]}>{journeyStats.locations}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('travelMapper.stops')}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="swap-horizontal" size={20} color={theme.secondary} />
              <Text style={[styles.statValue, { color: theme.text }]}>{journeyStats.legs}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('travelMapper.legs')}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="navigate" size={20} color={theme.orange} />
              <Text style={[styles.statValue, { color: theme.text }]}>{journeyStats.totalMiles.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('travelMapper.miles')}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.travelTimesRow}>
            <View style={styles.travelMode}>
              <Ionicons name="airplane" size={18} color={theme.primary} />
              <Text style={[styles.travelTime, { color: theme.text }]}>{journeyStats.travelTimes.plane}</Text>
            </View>
            <View style={styles.travelMode}>
              <Ionicons name="train" size={18} color={theme.secondary} />
              <Text style={[styles.travelTime, { color: theme.text }]}>{journeyStats.travelTimes.train}</Text>
            </View>
            <View style={styles.travelMode}>
              <Ionicons name="car" size={18} color={theme.orange} />
              <Text style={[styles.travelTime, { color: theme.text }]}>{journeyStats.travelTimes.car}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Location List Panel */}
      <Animated.View style={[styles.bottomPanel, { backgroundColor: theme.cardBackground, borderTopColor: theme.border, height: panelHeight }]}>
        {/* Drag Handle */}
        <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
          <View style={[styles.dragHandle, { backgroundColor: theme.textSecondary + '60' }]} />
        </View>
        <View style={styles.panelHeader}>
          <Text style={[styles.panelTitle, { color: theme.text }]}>{t('travelMapper.journeyRoute')}</Text>
          {selectedLocations.length >= 2 && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={saveToMyTrips}
            >
              <Ionicons name="save" size={18} color={theme.background} />
              <Text style={[styles.saveButtonText, { color: theme.background }]}>{t('travelMapper.saveTrip')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.countryList} showsVerticalScrollIndicator={false}>
          {selectedLocations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={40} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {t('travelMapper.emptyMessage')}
              </Text>
            </View>
          ) : (
            selectedLocations.map((location, index) => {
              const nextLocation = selectedLocations[index + 1];
              let distance = null;
              let travelTimes = null;

              if (nextLocation) {
                const current = getLocationCoords(location);
                const next = getLocationCoords(nextLocation);
                if (current && next) {
                  distance = calculateDistance(
                    current.latitude,
                    current.longitude,
                    next.latitude,
                    next.longitude
                  );
                  travelTimes = calculateTravelTime(distance.miles);
                }
              }

              return (
                <View key={index}>
                  <View style={[styles.countryItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <View style={[styles.countryNumber, { backgroundColor: typeof location === 'string' ? theme.primary : theme.secondary }]}>
                      <Text style={[styles.countryNumberText, { color: theme.background }]}>{index + 1}</Text>
                    </View>
                    <View style={styles.locationInfo}>
                      <View style={styles.locationNameRow}>
                        {typeof location === 'string' ? (
                          <Text style={styles.flagEmojiSmall}>{getCountryFlag(location)}</Text>
                        ) : (
                          <Ionicons name="location" size={14} color={theme.secondary} />
                        )}
                        <Text style={[styles.countryName, { color: theme.text }]} numberOfLines={1}>
                          {getLocationName(location)}
                        </Text>
                      </View>
                      {typeof location === 'object' && (
                        <Text style={[styles.locationType, { color: theme.textSecondary }]}>
                          {t('travelMapper.addressCity')}
                        </Text>
                      )}
                    </View>
                    <View style={styles.countryActions}>
                      {index > 0 && (
                        <TouchableOpacity onPress={() => moveLocation(index, 'up')}>
                          <Ionicons name="arrow-up" size={20} color={theme.primary} />
                        </TouchableOpacity>
                      )}
                      {index < selectedLocations.length - 1 && (
                        <TouchableOpacity onPress={() => moveLocation(index, 'down')}>
                          <Ionicons name="arrow-down" size={20} color={theme.primary} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => removeLocation(index)}>
                        <Ionicons name="close-circle" size={20} color={theme.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {distance && (
                      <View style={[styles.distanceCard, {
                        backgroundColor: theme.cardBackground,
                        borderColor: theme.border,
                        borderLeftColor: theme.secondary
                      }]}>
                        <View style={styles.distanceHeader}>
                          <Ionicons name="arrow-down" size={16} color={theme.secondary} />
                          <Text style={[styles.distanceTitle, { color: theme.secondary }]}>
                            {distance.miles.toLocaleString()} mi / {distance.km.toLocaleString()} km
                          </Text>
                        </View>
                        <View style={styles.distanceModes}>
                          <View style={styles.modeItem}>
                            <Ionicons name="airplane-outline" size={14} color={theme.primary} />
                            <Text style={[styles.modeTime, { color: theme.textSecondary }]}>{travelTimes.plane}</Text>
                          </View>
                          <View style={styles.modeItem}>
                            <Ionicons name="train-outline" size={14} color={theme.secondary} />
                            <Text style={[styles.modeTime, { color: theme.textSecondary }]}>{travelTimes.train}</Text>
                          </View>
                          <View style={styles.modeItem}>
                            <Ionicons name="car-outline" size={14} color={theme.orange} />
                            <Text style={[styles.modeTime, { color: theme.textSecondary }]}>{travelTimes.car}</Text>
                          </View>
                        </View>
                      </View>
                  )}
                </View>
              );
            })
          )}

          {/* Footer */}
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
          </View>
        </ScrollView>
      </Animated.View>

      {/* Add Location FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary, bottom: screenHeight * defaultPanelRatio + 20 }]}
        onPress={() => setShowLocationPicker(true)}
      >
        <Ionicons name="add" size={30} color={theme.background} />
      </TouchableOpacity>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowLocationPicker(false);
          setSearchText('');
          setAddressSearch('');
          setAddressResults([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'flex-end' }}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{t('travelMapper.addLocation')}</Text>
                <TouchableOpacity onPress={() => {
                  setShowLocationPicker(false);
                  setSearchText('');
                  setAddressSearch('');
                  setAddressResults([]);
                }}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Mode Toggle Tabs */}
              <View style={[styles.modeTabs, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <TouchableOpacity
                  style={[
                    styles.modeTab,
                    pickerMode === 'country' && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => {
                    setPickerMode('country');
                    setAddressSearch('');
                    setAddressResults([]);
                  }}
                >
                  <Ionicons
                    name="globe-outline"
                    size={18}
                    color={pickerMode === 'country' ? theme.background : theme.textSecondary}
                  />
                  <Text style={[
                    styles.modeTabText,
                    { color: pickerMode === 'country' ? theme.background : theme.textSecondary }
                  ]}>
                    {t('travelMapper.country')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeTab,
                    pickerMode === 'address' && { backgroundColor: theme.secondary }
                  ]}
                  onPress={() => {
                    setPickerMode('address');
                    setSearchText('');
                  }}
                >
                  <Ionicons
                    name="location"
                    size={18}
                    color={pickerMode === 'address' ? theme.background : theme.textSecondary}
                  />
                  <Text style={[
                    styles.modeTabText,
                    { color: pickerMode === 'address' ? theme.background : theme.textSecondary }
                  ]}>
                    {t('travelMapper.addressCity')}
                  </Text>
                </TouchableOpacity>
              </View>

              {pickerMode === 'country' ? (
                <>
                  {/* Country Search Input */}
                  <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                    <Ionicons name="search" size={20} color={theme.textSecondary} />
                    <TextInput
                      style={[styles.searchInput, { color: theme.text }]}
                      placeholder={t('travelMapper.searchCountriesPlaceholder')}
                      placeholderTextColor={theme.textSecondary}
                      value={searchText}
                      onChangeText={setSearchText}
                      autoCapitalize="words"
                    />
                    {searchText.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchText('')}>
                        <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Country List */}
                  <ScrollView style={styles.countryPickerList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {countries
                      .filter(country => country.toLowerCase().includes(searchText.toLowerCase()))
                      .map((country, index) => {
                        const isSelected = selectedLocations.some(loc =>
                          typeof loc === 'string' && loc === country
                        );
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.countryPickerItem,
                              {
                                backgroundColor: isSelected ? theme.border : 'transparent',
                                borderBottomColor: theme.border
                              }
                            ]}
                            onPress={() => addCountry(country)}
                            disabled={isSelected}
                          >
                            <View style={styles.pickerItemContent}>
                              <Text style={styles.flagEmoji}>{getCountryFlag(country)}</Text>
                              <Text style={[
                                styles.countryPickerText,
                                { color: isSelected ? theme.textSecondary : theme.text }
                              ]}>
                                {country}
                              </Text>
                            </View>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    {countries.filter(country => country.toLowerCase().includes(searchText.toLowerCase())).length === 0 && (
                      <View style={styles.noResultsContainer}>
                        <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>No countries found</Text>
                      </View>
                    )}
                  </ScrollView>
                </>
              ) : (
                <>
                  {/* Address Search Input */}
                  <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                    <Ionicons name="location" size={20} color={theme.textSecondary} />
                    <TextInput
                      style={[styles.searchInput, { color: theme.text }]}
                      placeholder={t('travelMapper.locationPlaceholder')}
                      placeholderTextColor={theme.textSecondary}
                      value={addressSearch}
                      onChangeText={setAddressSearch}
                      onSubmitEditing={searchAddresses}
                      returnKeyType="search"
                    />
                    {addressSearch.length > 0 && (
                      <TouchableOpacity onPress={() => {
                        setAddressSearch('');
                        setAddressResults([]);
                      }}>
                        <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Search Button */}
                  <TouchableOpacity
                    style={[styles.searchButton, { backgroundColor: theme.secondary }]}
                    onPress={searchAddresses}
                    disabled={isSearching || !addressSearch.trim()}
                  >
                    {isSearching ? (
                      <ActivityIndicator color={theme.background} size="small" />
                    ) : (
                      <>
                        <Ionicons name="search" size={18} color={theme.background} />
                        <Text style={[styles.searchButtonText, { color: theme.background }]}>
                          {t('travelMapper.searchLocation')}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Address Results */}
                  <ScrollView style={styles.countryPickerList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {addressResults.length > 0 ? (
                      addressResults.map((result, index) => {
                        const isSelected = selectedLocations.some(loc =>
                          typeof loc === 'object' && loc.placeId === result.placeId
                        );
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.countryPickerItem,
                              {
                                backgroundColor: isSelected ? theme.border : 'transparent',
                                borderBottomColor: theme.border
                              }
                            ]}
                            onPress={() => addAddress(result)}
                            disabled={isSelected}
                          >
                            <View style={styles.addressResultContent}>
                              <Ionicons name="location" size={18} color={theme.secondary} />
                              <Text
                                style={[
                                  styles.countryPickerText,
                                  { color: isSelected ? theme.textSecondary : theme.text, flex: 1 }
                                ]}
                                numberOfLines={2}
                              >
                                {result.name}
                              </Text>
                            </View>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={20} color={theme.secondary} />
                            )}
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <View style={styles.addressHelpContainer}>
                        <Ionicons name="information-circle" size={40} color={theme.textSecondary} />
                        <Text style={[styles.addressHelpText, { color: theme.textSecondary }]}>
                          Enter a city, address, or landmark and tap "Search Location" to find it
                        </Text>
                        <Text style={[styles.addressExamples, { color: theme.textSecondary }]}>
                          Examples:{'\n'}• Paris, France{'\n'}• 1600 Pennsylvania Ave, Washington DC{'\n'}• Eiffel Tower
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    // Width and height set dynamically via inline styles for responsive sizing
  },
  markerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  travelTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  travelMode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  travelTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandleArea: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  countryList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 5,
    gap: 10,
  },
  countryNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    flex: 1,
  },
  locationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationType: {
    fontSize: 11,
    marginTop: 2,
    marginLeft: 20,
  },
  countryActions: {
    flexDirection: 'row',
    gap: 10,
  },
  distanceCard: {
    marginLeft: 20,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderWidth: 1,
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  distanceTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  distanceModes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeTime: {
    fontSize: 11,
  },
  flightEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  flightEstText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    // Bottom position set dynamically via inline styles for responsive sizing
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
    minHeight: 450,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 5,
  },
  countryPickerList: {
    flex: 1,
    minHeight: 200,
    maxHeight: 350,
  },
  countryPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
  },
  countryPickerText: {
    fontSize: 16,
  },
  noResultsContainer: {
    padding: 30,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  modeTabs: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 15,
    overflow: 'hidden',
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pickerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addressResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    gap: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addressHelpContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  addressHelpText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  addressExamples: {
    fontSize: 13,
    textAlign: 'left',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLogo: {
    width: 400,
    height: 120,
  },
  flagEmoji: {
    fontSize: 20,
  },
  flagEmojiSmall: {
    fontSize: 16,
  },
});
