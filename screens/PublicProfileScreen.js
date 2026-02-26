import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import AuthPromptModal from '../components/AuthPromptModal';
import SpinningGlobe from '../components/SpinningGlobe';
import { getCountryFlag } from '../utils/countryFlags';
import { presetAvatars } from '../utils/presetAvatars';
import { getTravelerRank } from '../utils/rankingSystem';
import { getUserById } from '../utils/mockUsers';
import Avatar from '../components/Avatar';
import { countryCoordinates } from '../utils/coordinates';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function PublicProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { profile, completedTrips, visitedCities, trips, travelBuddies, highlightedBuddies, sentRequests, buddyActionLoading, sendBuddyRequest, updateProfile, refreshData } = useAppContext();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { checkAuth, showAuthModal, setShowAuthModal, featureMessage } = useAuthGuard();
  const [globeKey, setGlobeKey] = useState(0);

  // Force globe to remount when screen gains focus to fix WebView rendering in ScrollView
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        setGlobeKey(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }, [])
  );

  // Check if viewing another user's profile or own profile
  const viewingUser = route?.params?.user;
  const isOwnProfile = !viewingUser;

  // State for loading full profile data
  const [fullProfileData, setFullProfileData] = useState(null);
  const [profileCompletedTrips, setProfileCompletedTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
      if (viewingUser && viewingUser.id) {
        await fetchFullProfile(viewingUser.id);
      }
    } catch (error) {
      console.log('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData, viewingUser?.id]);

  // Fetch full profile data when viewing another user
  useEffect(() => {
    if (viewingUser && viewingUser.id) {
      fetchFullProfile(viewingUser.id);
    }
  }, [viewingUser?.id]);

  const fetchFullProfile = async (userId) => {
    setLoading(true);
    try {
      // Fetch profile details
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        // Map snake_case database fields to camelCase for consistency
        const mappedProfile = {
          ...profileData,
          avatarType: profileData.avatar_type,
          travelPhotos: profileData.travel_photos ?
            (typeof profileData.travel_photos === 'string' ?
              JSON.parse(profileData.travel_photos) :
              profileData.travel_photos) : [],
          sharedTripMaps: profileData.shared_trip_maps ?
            (typeof profileData.shared_trip_maps === 'string' ?
              JSON.parse(profileData.shared_trip_maps) :
              profileData.shared_trip_maps) : [],
        };
        console.log('[PublicProfile] Mapped profile data:', mappedProfile);
        setFullProfileData(mappedProfile);
      }

      // Fetch completed trips for this user
      const { data: tripsData, error: tripsError } = await supabase
        .from('completed_trips')
        .select('*')
        .eq('user_id', userId);

      if (tripsError) {
        console.error('Error fetching trips:', tripsError);
      } else {
        setProfileCompletedTrips(tripsData || []);
      }
    } catch (error) {
      console.error('Error in fetchFullProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use full profile data if available, otherwise use passed user data or own profile
  const displayProfile = fullProfileData || viewingUser || profile;
  const displayTravelBuddies = viewingUser?.travelBuddies || travelBuddies;
  const displayHighlightedBuddies = viewingUser?.highlightedBuddies || highlightedBuddies;

  // Check buddy status
  const isBuddy = viewingUser ? travelBuddies.includes(viewingUser.id) : false;
  const isRequestSent = viewingUser ? sentRequests.includes(viewingUser.id) : false;
  const isLoading = viewingUser ? buddyActionLoading.has(viewingUser.id) : false;

  const handleAddBuddy = () => {
    // Check if guest user is trying to add a buddy
    if (checkAuth('add travel buddies')) return;

    if (viewingUser && !isBuddy && !isRequestSent) {
      sendBuddyRequest(viewingUser.id);
    }
  };

  // Get avatar display
  const getAvatarDisplay = () => {
    if (displayProfile?.avatarType === 'custom' && displayProfile?.avatar) {
      return <Image source={{ uri: displayProfile.avatar }} style={styles.customAvatar} />;
    } else if (displayProfile?.avatarType === 'preset' && displayProfile?.avatar) {
      const presetAvatar = presetAvatars.find(a => a.id === displayProfile.avatar);
      if (presetAvatar) {
        return <Text style={styles.presetAvatar}>{presetAvatar.value}</Text>;
      }
    }
    return <Ionicons name="person" size={60} color={theme.primary} />;
  };

  // Calculate statistics - countries visited is based only on manually added countries (completedTrips)
  let totalCountriesVisited, totalCitiesVisited;
  let displayCompletedTrips = [];

  if (isOwnProfile) {
    totalCountriesVisited = completedTrips.length;
    totalCitiesVisited = visitedCities.length;
    displayCompletedTrips = completedTrips || [];
  } else {
    // Get unique countries from profileCompletedTrips
    const uniqueCountries = [...new Set(profileCompletedTrips.map(trip => trip.country))];
    totalCountriesVisited = uniqueCountries.length;
    totalCitiesVisited = 0; // Not fetching cities for other users
    displayCompletedTrips = profileCompletedTrips.map(trip => ({
      country: trip.country,
      date: trip.visit_date,
      year: trip.created_at ? new Date(trip.created_at).getFullYear().toString() : '',
    }));
  }

  console.log('[PublicProfile] displayCompletedTrips:', displayCompletedTrips?.length, 'items');

  const worldCountries = 195;
  const worldCoverage = ((totalCountriesVisited / worldCountries) * 100).toFixed(0);

  // Get unique continents (comprehensive map)
  const continentMap = {
    // North America
    'USA': 'North America', 'United States': 'North America', 'Canada': 'North America',
    'Mexico': 'North America', 'Cuba': 'North America', 'Jamaica': 'North America',
    'Costa Rica': 'North America', 'Panama': 'North America', 'Guatemala': 'North America',
    'Belize': 'North America', 'Honduras': 'North America', 'Nicaragua': 'North America',
    'El Salvador': 'North America', 'Dominican Republic': 'North America',
    // Europe
    'France': 'Europe', 'Italy': 'Europe', 'Spain': 'Europe', 'Germany': 'Europe',
    'UK': 'Europe', 'England': 'Europe', 'Scotland': 'Europe', 'Wales': 'Europe', 'Northern Ireland': 'Europe', 'Netherlands': 'Europe', 'Belgium': 'Europe',
    'Switzerland': 'Europe', 'Austria': 'Europe', 'Greece': 'Europe', 'Portugal': 'Europe',
    'Poland': 'Europe', 'Sweden': 'Europe', 'Norway': 'Europe', 'Denmark': 'Europe',
    'Finland': 'Europe', 'Iceland': 'Europe', 'Ireland': 'Europe', 'Croatia': 'Europe',
    'Czech Republic': 'Europe', 'Hungary': 'Europe', 'Romania': 'Europe', 'Bulgaria': 'Europe',
    'Slovakia': 'Europe', 'Slovenia': 'Europe', 'Estonia': 'Europe', 'Latvia': 'Europe',
    'Lithuania': 'Europe', 'Luxembourg': 'Europe', 'Malta': 'Europe', 'Cyprus': 'Europe',
    'Albania': 'Europe', 'North Macedonia': 'Europe', 'Serbia': 'Europe', 'Montenegro': 'Europe',
    'Bosnia and Herzegovina': 'Europe', 'Russia': 'Europe',
    // Asia
    'Japan': 'Asia', 'China': 'Asia', 'India': 'Asia', 'Thailand': 'Asia', 'Vietnam': 'Asia',
    'South Korea': 'Asia', 'Singapore': 'Asia', 'Malaysia': 'Asia', 'Indonesia': 'Asia',
    'Philippines': 'Asia', 'Cambodia': 'Asia', 'Laos': 'Asia', 'Myanmar': 'Asia',
    'Hong Kong': 'Asia', 'Turkey': 'Asia', 'United Arab Emirates': 'Asia', 'Saudi Arabia': 'Asia',
    'Jordan': 'Asia', 'Oman': 'Asia', 'Qatar': 'Asia', 'Kuwait': 'Asia', 'Bahrain': 'Asia',
    'Lebanon': 'Asia', 'Nepal': 'Asia', 'Bhutan': 'Asia', 'Sri Lanka': 'Asia', 'Maldives': 'Asia',
    // South America
    'Brazil': 'South America', 'Argentina': 'South America', 'Chile': 'South America',
    'Peru': 'South America', 'Colombia': 'South America', 'Ecuador': 'South America',
    'Bolivia': 'South America', 'Uruguay': 'South America', 'Paraguay': 'South America',
    // Africa
    'Egypt': 'Africa', 'South Africa': 'Africa', 'Morocco': 'Africa', 'Kenya': 'Africa',
    'Tanzania': 'Africa', 'Ethiopia': 'Africa', 'Tunisia': 'Africa', 'Madagascar': 'Africa',
    'Zimbabwe': 'Africa', 'Zambia': 'Africa',
    // Oceania
    'Australia': 'Oceania', 'New Zealand': 'Oceania', 'Fiji': 'Oceania', 'Papua New Guinea': 'Oceania',
  };

  // UN Geoscheme Subregion mapping (22 subregions)
  const subregionMap = {
    // Eastern Africa
    'Burundi': 'Eastern Africa', 'Comoros': 'Eastern Africa', 'Djibouti': 'Eastern Africa',
    'Eritrea': 'Eastern Africa', 'Ethiopia': 'Eastern Africa', 'Kenya': 'Eastern Africa',
    'Madagascar': 'Eastern Africa', 'Malawi': 'Eastern Africa', 'Mauritius': 'Eastern Africa',
    'Mayotte': 'Eastern Africa', 'Mozambique': 'Eastern Africa', 'Réunion': 'Eastern Africa',
    'Rwanda': 'Eastern Africa', 'Seychelles': 'Eastern Africa', 'Somalia': 'Eastern Africa',
    'South Sudan': 'Eastern Africa', 'Tanzania': 'Eastern Africa', 'Uganda': 'Eastern Africa',
    'Zambia': 'Eastern Africa', 'Zimbabwe': 'Eastern Africa',
    // Middle Africa
    'Angola': 'Middle Africa', 'Cameroon': 'Middle Africa', 'Central African Republic': 'Middle Africa',
    'Chad': 'Middle Africa', 'Congo': 'Middle Africa', 'Democratic Republic of the Congo': 'Middle Africa',
    'Equatorial Guinea': 'Middle Africa', 'Gabon': 'Middle Africa', 'São Tomé and Príncipe': 'Middle Africa',
    // Northern Africa
    'Algeria': 'Northern Africa', 'Egypt': 'Northern Africa', 'Libya': 'Northern Africa',
    'Morocco': 'Northern Africa', 'Sudan': 'Northern Africa', 'Tunisia': 'Northern Africa',
    'Western Sahara': 'Northern Africa',
    // Southern Africa
    'Botswana': 'Southern Africa', 'Eswatini': 'Southern Africa', 'Lesotho': 'Southern Africa',
    'Namibia': 'Southern Africa', 'South Africa': 'Southern Africa',
    // Western Africa
    'Benin': 'Western Africa', 'Burkina Faso': 'Western Africa', 'Cabo Verde': 'Western Africa',
    'Côte d\'Ivoire': 'Western Africa', 'Ivory Coast': 'Western Africa', 'Gambia': 'Western Africa',
    'Ghana': 'Western Africa', 'Guinea': 'Western Africa', 'Guinea-Bissau': 'Western Africa',
    'Liberia': 'Western Africa', 'Mali': 'Western Africa', 'Mauritania': 'Western Africa',
    'Niger': 'Western Africa', 'Nigeria': 'Western Africa', 'Senegal': 'Western Africa',
    'Sierra Leone': 'Western Africa', 'Togo': 'Western Africa',
    // Caribbean
    'Anguilla': 'Caribbean', 'Antigua and Barbuda': 'Caribbean', 'Aruba': 'Caribbean',
    'Bahamas': 'Caribbean', 'Barbados': 'Caribbean', 'British Virgin Islands': 'Caribbean',
    'Cayman Islands': 'Caribbean', 'Cuba': 'Caribbean', 'Curaçao': 'Caribbean',
    'Dominica': 'Caribbean', 'Dominican Republic': 'Caribbean', 'Grenada': 'Caribbean',
    'Guadeloupe': 'Caribbean', 'Haiti': 'Caribbean', 'Jamaica': 'Caribbean',
    'Martinique': 'Caribbean', 'Montserrat': 'Caribbean', 'Puerto Rico': 'Caribbean',
    'Saint Barthélemy': 'Caribbean', 'Saint Kitts and Nevis': 'Caribbean',
    'Saint Lucia': 'Caribbean', 'Saint Martin': 'Caribbean', 'Saint Vincent and the Grenadines': 'Caribbean',
    'Sint Maarten': 'Caribbean', 'Trinidad and Tobago': 'Caribbean', 'Turks and Caicos Islands': 'Caribbean',
    'Virgin Islands': 'Caribbean',
    // Central America
    'Belize': 'Central America', 'Costa Rica': 'Central America', 'El Salvador': 'Central America',
    'Guatemala': 'Central America', 'Honduras': 'Central America', 'Mexico': 'Central America',
    'Nicaragua': 'Central America', 'Panama': 'Central America',
    // South America
    'Argentina': 'South America', 'Bolivia': 'South America', 'Brazil': 'South America',
    'Chile': 'South America', 'Colombia': 'South America', 'Ecuador': 'South America',
    'Falkland Islands': 'South America', 'French Guiana': 'South America', 'Guyana': 'South America',
    'Paraguay': 'South America', 'Peru': 'South America', 'Suriname': 'South America',
    'Uruguay': 'South America', 'Venezuela': 'South America',
    // Northern America
    'Bermuda': 'Northern America', 'Canada': 'Northern America', 'Greenland': 'Northern America',
    'Saint Pierre and Miquelon': 'Northern America', 'USA': 'Northern America',
    'United States': 'Northern America',
    // Central Asia
    'Kazakhstan': 'Central Asia', 'Kyrgyzstan': 'Central Asia', 'Tajikistan': 'Central Asia',
    'Turkmenistan': 'Central Asia', 'Uzbekistan': 'Central Asia',
    // Eastern Asia
    'China': 'Eastern Asia', 'Hong Kong': 'Eastern Asia', 'Japan': 'Eastern Asia',
    'Macao': 'Eastern Asia', 'Mongolia': 'Eastern Asia', 'North Korea': 'Eastern Asia',
    'South Korea': 'Eastern Asia', 'Taiwan': 'Eastern Asia',
    // South-eastern Asia
    'Brunei': 'South-eastern Asia', 'Cambodia': 'South-eastern Asia', 'Indonesia': 'South-eastern Asia',
    'Laos': 'South-eastern Asia', 'Malaysia': 'South-eastern Asia', 'Myanmar': 'South-eastern Asia',
    'Philippines': 'South-eastern Asia', 'Singapore': 'South-eastern Asia', 'Thailand': 'South-eastern Asia',
    'Timor-Leste': 'South-eastern Asia', 'Vietnam': 'South-eastern Asia',
    // Southern Asia
    'Afghanistan': 'Southern Asia', 'Bangladesh': 'Southern Asia', 'Bhutan': 'Southern Asia',
    'India': 'Southern Asia', 'Iran': 'Southern Asia', 'Maldives': 'Southern Asia',
    'Nepal': 'Southern Asia', 'Pakistan': 'Southern Asia', 'Sri Lanka': 'Southern Asia',
    // Western Asia
    'Armenia': 'Western Asia', 'Azerbaijan': 'Western Asia', 'Bahrain': 'Western Asia',
    'Cyprus': 'Western Asia', 'Georgia': 'Western Asia', 'Iraq': 'Western Asia',
    'Israel': 'Western Asia', 'Jordan': 'Western Asia', 'Kuwait': 'Western Asia',
    'Lebanon': 'Western Asia', 'Oman': 'Western Asia', 'Palestine': 'Western Asia',
    'Qatar': 'Western Asia', 'Saudi Arabia': 'Western Asia', 'Syria': 'Western Asia',
    'Turkey': 'Western Asia', 'United Arab Emirates': 'Western Asia', 'Yemen': 'Western Asia',
    // Eastern Europe
    'Belarus': 'Eastern Europe', 'Bulgaria': 'Eastern Europe', 'Czech Republic': 'Eastern Europe',
    'Czechia': 'Eastern Europe', 'Hungary': 'Eastern Europe', 'Moldova': 'Eastern Europe',
    'Poland': 'Eastern Europe', 'Romania': 'Eastern Europe', 'Russia': 'Eastern Europe',
    'Slovakia': 'Eastern Europe', 'Ukraine': 'Eastern Europe',
    // Northern Europe
    'Denmark': 'Northern Europe', 'Estonia': 'Northern Europe', 'Faroe Islands': 'Northern Europe',
    'Finland': 'Northern Europe', 'Iceland': 'Northern Europe', 'Ireland': 'Northern Europe',
    'Latvia': 'Northern Europe', 'Lithuania': 'Northern Europe', 'Norway': 'Northern Europe',
    'Sweden': 'Northern Europe', 'UK': 'Northern Europe', 'United Kingdom': 'Northern Europe',
    'England': 'Northern Europe', 'Scotland': 'Northern Europe', 'Wales': 'Northern Europe',
    'Northern Ireland': 'Northern Europe',
    // Southern Europe
    'Albania': 'Southern Europe', 'Andorra': 'Southern Europe', 'Bosnia and Herzegovina': 'Southern Europe',
    'Croatia': 'Southern Europe', 'Gibraltar': 'Southern Europe', 'Greece': 'Southern Europe',
    'Italy': 'Southern Europe', 'Kosovo': 'Southern Europe', 'Malta': 'Southern Europe',
    'Montenegro': 'Southern Europe', 'North Macedonia': 'Southern Europe', 'Portugal': 'Southern Europe',
    'San Marino': 'Southern Europe', 'Serbia': 'Southern Europe', 'Slovenia': 'Southern Europe',
    'Spain': 'Southern Europe', 'Vatican City': 'Southern Europe',
    // Western Europe
    'Austria': 'Western Europe', 'Belgium': 'Western Europe', 'France': 'Western Europe',
    'Germany': 'Western Europe', 'Liechtenstein': 'Western Europe', 'Luxembourg': 'Western Europe',
    'Monaco': 'Western Europe', 'Netherlands': 'Western Europe', 'Switzerland': 'Western Europe',
    // Australia and New Zealand
    'Australia': 'Australia and New Zealand', 'New Zealand': 'Australia and New Zealand',
    'Norfolk Island': 'Australia and New Zealand',
    // Melanesia
    'Fiji': 'Melanesia', 'New Caledonia': 'Melanesia', 'Papua New Guinea': 'Melanesia',
    'Solomon Islands': 'Melanesia', 'Vanuatu': 'Melanesia',
    // Micronesia
    'Guam': 'Micronesia', 'Kiribati': 'Micronesia', 'Marshall Islands': 'Micronesia',
    'Micronesia': 'Micronesia', 'Nauru': 'Micronesia', 'Northern Mariana Islands': 'Micronesia',
    'Palau': 'Micronesia',
    // Polynesia
    'American Samoa': 'Polynesia', 'Cook Islands': 'Polynesia', 'French Polynesia': 'Polynesia',
    'Niue': 'Polynesia', 'Pitcairn Islands': 'Polynesia', 'Samoa': 'Polynesia',
    'Tokelau': 'Polynesia', 'Tonga': 'Polynesia', 'Tuvalu': 'Polynesia', 'Wallis and Futuna': 'Polynesia',
  };

  // All 22 UN geoscheme subregions
  const allSubregions = [
    'Eastern Africa', 'Middle Africa', 'Northern Africa', 'Southern Africa', 'Western Africa',
    'Caribbean', 'Central America', 'South America', 'Northern America',
    'Central Asia', 'Eastern Asia', 'South-eastern Asia', 'Southern Asia', 'Western Asia',
    'Eastern Europe', 'Northern Europe', 'Southern Europe', 'Western Europe',
    'Australia and New Zealand', 'Melanesia', 'Micronesia', 'Polynesia'
  ];

  // Calculate visited continents and subregions
  const continents = new Set();
  displayCompletedTrips.forEach(trip => {
    const continent = continentMap[trip.country];
    if (continent) continents.add(continent);
  });

  const visitedContinents = [
    ...new Set(displayCompletedTrips.map((trip) => continentMap[trip.country]).filter(Boolean)),
  ];

  const visitedSubregions = [
    ...new Set(displayCompletedTrips.map((trip) => subregionMap[trip.country]).filter(Boolean)),
  ];
  const subregionCoverage = ((visitedSubregions.length / 22) * 100).toFixed(1);

  const userName = displayProfile?.name || 'Traveler';
  const userUsername = displayProfile?.username || '';
  const userLocation = displayProfile?.location || 'United States';
  const userBio = displayProfile?.bio || '';

  // Handle different data structures for top3 and next3
  const getTopCountries = () => {
    return {
      top1: displayProfile?.top1,
      top2: displayProfile?.top2,
      top3: displayProfile?.top3,
    };
  };

  const getNextStops = () => {
    return {
      next1: displayProfile?.next1,
      next2: displayProfile?.next2,
      next3: displayProfile?.next3,
    };
  };

  const topCountries = getTopCountries();
  const nextStops = getNextStops();

  const travelerRank = getTravelerRank(totalCountriesVisited);

  // Function to pick travel photo directly
  const pickTravelPhoto = async () => {
    if (profile.travelPhotos && profile.travelPhotos.length >= 5) {
      Alert.alert(t('editProfile.maximumReached'), t('editProfile.maxPhotosReached'));
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('editProfile.permissionDenied'), t('editProfile.cameraRollPermission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const updatedPhotos = [...(profile.travelPhotos || []), result.assets[0].uri];
      updateProfile({
        ...profile,
        travelPhotos: updatedPhotos,
      });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}>
          {getAvatarDisplay()}
        </View>

        <View style={styles.nameContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, { color: theme.text }]} numberOfLines={2} adjustsFontSizeToFit>
              {userName}
            </Text>
            <Ionicons name="checkmark-circle" size={28} color="#1DA1F2" />
          </View>
          {userUsername ? (
            <Text style={[styles.usernameText, { color: theme.primary }]}>@{userUsername}</Text>
          ) : null}
          <View style={styles.levelContainer}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={[styles.levelText, { color: theme.text }]}>{travelerRank}</Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={theme.danger} />
            <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={1}>
              {userLocation}
            </Text>
          </View>
        </View>
      </View>

      {/* Add Buddy Button (only when viewing another user's profile) */}
      {!isOwnProfile && (
        <View style={styles.addBuddyContainer}>
          {isBuddy ? (
            <View style={[styles.buddyStatusButton, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}>
              <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
              <Text style={[styles.buddyStatusText, { color: theme.primary }]}>{t('publicProfile.travelBuddies')}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addBuddyButton, {
                backgroundColor: isRequestSent ? theme.border : theme.primary,
                opacity: (isRequestSent || isLoading) ? 0.5 : 1
              }]}
              onPress={handleAddBuddy}
              disabled={isRequestSent || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.background} />
              ) : (
                <Ionicons
                  name={isRequestSent ? "checkmark" : "person-add"}
                  size={20}
                  color={theme.background}
                />
              )}
              <Text style={[styles.addBuddyText, { color: theme.background }]}>
                {isLoading ? 'Sending...' : isRequestSent ? 'Buddy Request Sent' : 'Add Travel Buddy'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Social Media Handles */}
      {(displayProfile?.instagram || displayProfile?.x || displayProfile?.facebook || displayProfile?.youtube) && (
        <View style={styles.socialsContainer}>
          {displayProfile?.instagram && (
            <View style={styles.socialHandle}>
              <Ionicons name="logo-instagram" size={16} color={theme.primary} />
              <Text style={[styles.socialText, { color: theme.text }]}>{displayProfile.instagram}</Text>
            </View>
          )}
          {displayProfile?.x && (
            <View style={styles.socialHandle}>
              <Ionicons name="logo-twitter" size={16} color={theme.primary} />
              <Text style={[styles.socialText, { color: theme.text }]}>{displayProfile.x}</Text>
            </View>
          )}
          {displayProfile?.facebook && (
            <View style={styles.socialHandle}>
              <Ionicons name="logo-facebook" size={16} color={theme.primary} />
              <Text style={[styles.socialText, { color: theme.text }]}>{displayProfile.facebook}</Text>
            </View>
          )}
          {displayProfile?.youtube && (
            <View style={styles.socialHandle}>
              <Ionicons name="logo-youtube" size={16} color={theme.primary} />
              <Text style={[styles.socialText, { color: theme.text }]}>{displayProfile.youtube}</Text>
            </View>
          )}
        </View>
      )}

      {/* Bio */}
      {userBio && (
        <View style={[styles.bioContainer, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}>
          <Text style={[styles.bioText, { color: theme.text }]}>{userBio}</Text>
        </View>
      )}

      {/* Top 3 Favorites */}
      <View style={styles.section}>
        <View style={[styles.sectionContainer, { backgroundColor: theme.cardBackground, borderColor: theme.textSecondary + '40' }]}>
          <View style={styles.sectionHeaderInner}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {isOwnProfile ? 'My Top 3' : `${userName.split(' ')[0]}'s Top 3`}
            </Text>
          </View>
          {!topCountries.top1 && !topCountries.top2 && !topCountries.top3 ? (
            <View style={styles.emptySectionInner}>
              <Ionicons name="star-outline" size={32} color={theme.textSecondary} />
              <Text style={[styles.emptySectionText, { color: theme.textSecondary }]}>
                {isOwnProfile ? 'Set your top 3 countries in Edit Profile' : 'No top countries selected yet'}
              </Text>
            </View>
          ) : (
            <View style={styles.topCountries}>
              {topCountries.top1 && (
                <View style={[styles.topCountryBadge, { backgroundColor: '#FFD700' }]}>
                  <View style={styles.topCountryContent}>
                    <Text style={styles.topCountryEmoji}>🥇</Text>
                    <Text style={[styles.topCountryName, { color: '#000' }]}>{topCountries.top1}</Text>
                  </View>
                  <Text style={styles.topCountryFlag}>{getCountryFlag(topCountries.top1)}</Text>
                </View>
              )}
              {topCountries.top2 && (
                <View style={[styles.topCountryBadge, { backgroundColor: '#C0C0C0' }]}>
                  <View style={styles.topCountryContent}>
                    <Text style={styles.topCountryEmoji}>🥈</Text>
                    <Text style={[styles.topCountryName, { color: '#000' }]}>{topCountries.top2}</Text>
                  </View>
                  <Text style={styles.topCountryFlag}>{getCountryFlag(topCountries.top2)}</Text>
                </View>
              )}
              {topCountries.top3 && (
                <View style={[styles.topCountryBadge, { backgroundColor: '#CD7F32' }]}>
                  <View style={styles.topCountryContent}>
                    <Text style={styles.topCountryEmoji}>🥉</Text>
                    <Text style={[styles.topCountryName, { color: '#000' }]}>{topCountries.top3}</Text>
                  </View>
                  <Text style={styles.topCountryFlag}>{getCountryFlag(topCountries.top3)}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Next Stops */}
      <View style={styles.section}>
        <View style={[styles.sectionContainer, { backgroundColor: theme.cardBackground, borderColor: theme.textSecondary + '40' }]}>
          <View style={styles.sectionHeaderInner}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {isOwnProfile ? 'Next Stops' : `${userName.split(' ')[0]}'s Next Stops`}
            </Text>
          </View>
          {!nextStops.next1 && !nextStops.next2 && !nextStops.next3 ? (
            <View style={styles.emptySectionInner}>
              <Ionicons name="airplane-outline" size={32} color={theme.textSecondary} />
              <Text style={[styles.emptySectionText, { color: theme.textSecondary }]}>
                {isOwnProfile ? 'Set your next destinations in Edit Profile' : 'No next destinations selected yet'}
              </Text>
            </View>
          ) : (
            <View style={styles.nextStops}>
              {nextStops.next1 && (
                <TouchableOpacity style={[styles.nextStopBadge, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.nextStopText, { color: theme.background }]}>{nextStops.next1}</Text>
                </TouchableOpacity>
              )}
              {nextStops.next2 && (
                <TouchableOpacity style={[styles.nextStopBadge, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.nextStopText, { color: theme.background }]}>{nextStops.next2}</Text>
                </TouchableOpacity>
              )}
              {nextStops.next3 && (
                <TouchableOpacity style={[styles.nextStopBadge, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.nextStopText, { color: theme.background }]}>{nextStops.next3}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Travel Stats */}
      <View style={styles.section}>
        <View style={[styles.statsCard, { backgroundColor: theme.primary, borderColor: theme.primary }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.background }]}>{totalCountriesVisited}</Text>
              <Text style={[styles.statLabel, { color: theme.background }]}>{t('publicProfile.countriesLabel')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={[styles.statItem, styles.statItemCenter]}>
              <Text style={[styles.statValueEmphasis, { color: theme.background }]}>{worldCoverage}%</Text>
              <Text style={[styles.statLabel, { color: theme.background }]}>{t('publicProfile.ofTheWorld')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.background }]}>{continents.size}</Text>
              <Text style={[styles.statLabel, { color: theme.background }]}>{t('publicProfile.continentsLabel')}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Travel Buddies */}
      <View style={[styles.section, { marginTop: -3 }]}>
        <View style={[styles.sectionContainer, { backgroundColor: theme.cardBackground, borderColor: theme.textSecondary + '40' }]}>
          <View style={styles.sectionHeaderInner}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 8 }]}>{t('publicProfile.travelBuddies')}</Text>
            {isOwnProfile && displayTravelBuddies.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('TravelBuddies')}>
                <Text style={[styles.viewAllText, { color: theme.primary, marginTop: 8 }]}>
                  View All ({displayTravelBuddies.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {displayTravelBuddies.length === 0 ? (
            <View style={styles.emptySectionInner}>
              <Ionicons name="people-outline" size={32} color={theme.textSecondary} />
              <Text style={[styles.emptySectionText, { color: theme.textSecondary }]}>
                {isOwnProfile ? 'Add travel buddies to see them here' : 'No travel buddies yet'}
              </Text>
            </View>
          ) : (
            <View style={styles.buddiesContainer}>
              {displayHighlightedBuddies.length > 0 ? (
                displayHighlightedBuddies.slice(0, 3).map((buddyId) => {
                  const buddy = getUserById(buddyId);
                  if (!buddy) return null;

                  return (
                    <TouchableOpacity
                      key={buddyId}
                      style={styles.buddyCircle}
                      onPress={() => navigation.navigate('PublicProfile', { user: buddy })}
                    >
                      <Avatar
                        avatar={buddy.avatar}
                        avatarType={buddy.avatarType}
                        size={70}
                        style={{ borderWidth: 3, borderColor: theme.primary }}
                      />
                      <Text style={[styles.buddyName, { color: theme.text }]} numberOfLines={1}>
                        {buddy.name.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                displayTravelBuddies.slice(0, 3).map((buddyId) => {
                  const buddy = getUserById(buddyId);
                  if (!buddy) return null;

                  return (
                    <TouchableOpacity
                      key={buddyId}
                      style={styles.buddyCircle}
                      onPress={() => navigation.navigate('PublicProfile', { user: buddy })}
                    >
                      <Avatar
                        avatar={buddy.avatar}
                        avatarType={buddy.avatarType}
                        size={70}
                        style={{ borderWidth: 3, borderColor: theme.primary }}
                      />
                      <Text style={[styles.buddyName, { color: theme.text }]} numberOfLines={1}>
                        {buddy.name.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        </View>
      </View>

      {/* Spinning Globe */}
      <View style={[styles.section, styles.globeSection]}>
        <SpinningGlobe
          key={`globe-public-${globeKey}`}
          completedTrips={isOwnProfile ? completedTrips : displayCompletedTrips}
          visitedCities={isOwnProfile ? visitedCities : []}
        />
      </View>

      {/* Travel Photos */}
      <View style={styles.section}>
        <View style={[styles.sectionContainer, { backgroundColor: theme.cardBackground, borderColor: theme.textSecondary + '40' }]}>
          <View style={styles.sectionHeaderInner}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('publicProfile.travelPhotos')}</Text>
          </View>
          {(!displayProfile?.travelPhotos || displayProfile.travelPhotos.length === 0) ? (
            <View style={styles.emptySectionInner}>
              <Ionicons name="camera-outline" size={32} color={theme.textSecondary} />
              <Text style={[styles.emptySectionText, { color: theme.textSecondary }]}>
                {isOwnProfile ? 'Add your favorite travel photos' : 'No photos shared yet'}
              </Text>
              {isOwnProfile && (
                <TouchableOpacity
                  style={[styles.manageButton, { backgroundColor: theme.primary }]}
                  onPress={pickTravelPhoto}
                >
                  <Ionicons name="add-circle" size={18} color={theme.background} />
                  <Text style={[styles.manageButtonText, { color: theme.background }]}>{t('publicProfile.addPhotos')}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.photosGrid}>
              {displayProfile.travelPhotos.map((photo, index) => (
                <View key={index} style={[styles.photoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Shared Trip Maps */}
      <View style={styles.section}>
        {(!displayProfile?.sharedTripMaps || displayProfile.sharedTripMaps.length === 0) ? (
          <View style={[styles.sectionContainer, { backgroundColor: theme.cardBackground, borderColor: theme.textSecondary + '40' }]}>
            <View style={styles.sectionHeaderInner}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('publicProfile.sharedTrips')}</Text>
            </View>
            <View style={styles.emptySectionInner}>
              <Ionicons name="map-outline" size={32} color={theme.textSecondary} />
              <Text style={[styles.emptySectionText, { color: theme.textSecondary }]}>
                {isOwnProfile ? 'Share your completed trips' : 'No trips shared yet'}
              </Text>
              {isOwnProfile && (
                <TouchableOpacity
                  style={[styles.manageButton, { backgroundColor: theme.primary }]}
                  onPress={() => navigation.navigate('MyTrips', { sharingMode: true })}
                >
                  <Ionicons name="add-circle" size={18} color={theme.background} />
                  <Text style={[styles.manageButtonText, { color: theme.background }]}>{t('publicProfile.selectTrips')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.sharedTripsContainer}>
            {isOwnProfile && displayProfile.sharedTripMaps.map((tripKey) => {
              // Parse tripKey to get type and index (e.g., "past-0" or "upcoming-2")
              const [tripType, tripIndexStr] = tripKey.split('-');
              const tripIndex = parseInt(tripIndexStr);
              const trip = trips[tripIndex];

              if (!trip) return null;

              const isPastTrip = tripType === 'past';

              // Create markers and route for the trip map
              const markers = [];
              const routeCoordinates = [];

              trip.countries.forEach((country, index) => {
                const coords = countryCoordinates[country.name];
                if (coords) {
                  markers.push({
                    id: `country-${index}`,
                    ...coords,
                    title: country.name,
                  });
                  routeCoordinates.push(coords);
                }
              });

              // Calculate map region
              let mapRegion = {
                latitude: 20,
                longitude: 0,
                latitudeDelta: 100,
                longitudeDelta: 100,
              };

              if (markers.length > 0) {
                const latitudes = markers.map(m => m.latitude);
                const longitudes = markers.map(m => m.longitude);

                const minLat = Math.min(...latitudes);
                const maxLat = Math.max(...latitudes);
                const minLng = Math.min(...longitudes);
                const maxLng = Math.max(...longitudes);

                const centerLat = (minLat + maxLat) / 2;
                const centerLng = (minLng + maxLng) / 2;
                const latDelta = (maxLat - minLat) * 1.5 || 30;
                const lngDelta = (maxLng - minLng) * 1.5 || 30;

                mapRegion = {
                  latitude: centerLat,
                  longitude: centerLng,
                  latitudeDelta: Math.max(latDelta, 10),
                  longitudeDelta: Math.max(lngDelta, 10),
                };
              }

              return (
                <View key={tripKey} style={[
                  styles.sharedTripCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  }
                ]}>
                  {/* Remove button */}
                  <TouchableOpacity
                    style={styles.removeSharedTripButton}
                    onPress={() => {
                      Alert.alert(
                        'Remove Trip',
                        `Remove "${trip.name}" from your profile?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Remove',
                            style: 'destructive',
                            onPress: () => {
                              const updatedSharedTrips = displayProfile.sharedTripMaps.filter(
                                key => key !== tripKey
                              );
                              updateProfile({ sharedTripMaps: updatedSharedTrips });
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color={theme.error || '#ef4444'} />
                  </TouchableOpacity>

                  {/* Trip name header */}
                  <View style={styles.sharedTripHeader}>
                    <View style={styles.tripTypeIndicator}>
                      <Ionicons
                        name={isPastTrip ? "checkmark-circle" : "time-outline"}
                        size={20}
                        color={isPastTrip ? theme.primary : theme.secondary}
                      />
                      <Text style={[
                        styles.tripTypeText,
                        { color: isPastTrip ? theme.primary : theme.secondary }
                      ]}>
                        {isPastTrip ? 'Past Trip' : 'Upcoming Trip'}
                      </Text>
                    </View>
                    <Text style={[styles.sharedTripName, { color: theme.text }]}>{trip.name}</Text>
                  </View>

                  {/* Map Overview */}
                  {markers.length > 0 ? (
                    <MapView
                      style={[styles.tripMap, { borderColor: theme.border }]}
                      initialRegion={mapRegion}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      pitchEnabled={false}
                      rotateEnabled={false}
                      showsUserLocation={false}
                      showsMyLocationButton={false}
                    >
                      {markers.map((marker, idx) => (
                        <Marker
                          key={marker.id}
                          coordinate={{
                            latitude: marker.latitude,
                            longitude: marker.longitude,
                          }}
                          title={marker.title}
                        >
                          <View style={styles.markerContainer}>
                            <Ionicons name="location" size={35} color={isPastTrip ? theme.primary : theme.secondary} />
                            <View style={[styles.markerNumber, { backgroundColor: theme.background, borderColor: isPastTrip ? theme.primary : theme.secondary }]}>
                              <Text style={[styles.markerNumberText, { color: isPastTrip ? theme.primary : theme.secondary }]}>{idx + 1}</Text>
                            </View>
                          </View>
                        </Marker>
                      ))}
                      {routeCoordinates.length > 1 && (
                        <Polyline
                          coordinates={routeCoordinates}
                          strokeColor={isPastTrip ? theme.primary : theme.secondary}
                          strokeWidth={3}
                          lineDashPattern={[10, 5]}
                        />
                      )}
                    </MapView>
                  ) : (
                    <View style={[styles.noMapView, { backgroundColor: theme.border }]}>
                      <Ionicons name="map-outline" size={30} color={theme.textSecondary} />
                      <Text style={[styles.noMapText, { color: theme.textSecondary }]}>{t('publicProfile.mapUnavailable')}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Continents Visited */}
      <View style={styles.section}>
        <View style={[styles.sectionContainer, { backgroundColor: theme.cardBackground, borderColor: theme.textSecondary + '40' }]}>
          <View style={styles.sectionHeaderInner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('publicProfile.continentsVisited')}</Text>
              <View style={[styles.subregionBadge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.subregionBadgeText, { color: theme.background }]}>
                  {visitedContinents.length}/6
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.subregionSubtitle, { color: theme.textSecondary }]}>
            {t('publicProfile.regionsOfWorld')}
          </Text>
          {/* Progress Bar */}
          <View style={styles.progressInner}>
            <View style={styles.subregionProgressHeader}>
              <Text style={[styles.subregionProgressLabel, { color: theme.textSecondary }]}>{t('publicProfile.continentCoverage')}</Text>
              <Text style={[styles.subregionProgressValue, { color: theme.primary }]}>
                {((visitedContinents.length / 6) * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={[styles.subregionProgressBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.subregionProgressFill,
                  { backgroundColor: theme.primary, width: `${(visitedContinents.length / 6) * 100}%` }
                ]}
              />
            </View>
          </View>

          {/* Visited Continents List */}
          {visitedContinents.length > 0 && (
            <View style={[styles.subregionsList, { marginBottom: 0 }]}>
              {visitedContinents.map((continent, index) => (
                <View
                  key={index}
                  style={[styles.subregionChip, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
                >
                  <Ionicons name="checkmark-circle" size={14} color={theme.primary} />
                  <Text style={[styles.subregionChipText, { color: theme.text }]}>{continent}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Subregions Section (UN Geoscheme) */}
      <View style={styles.section}>
        <View style={[styles.sectionContainer, { backgroundColor: theme.cardBackground, borderColor: theme.textSecondary + '40' }]}>
          <View style={styles.sectionHeaderInner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('publicProfile.subregions')}</Text>
              <View style={[styles.subregionBadge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.subregionBadgeText, { color: theme.background }]}>
                  {visitedSubregions.length}/22
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.subregionSubtitle, { color: theme.textSecondary }]}>
            {t('publicProfile.unGeoschemeRegions')}
          </Text>
          {/* Progress Bar */}
          <View style={styles.progressInner}>
            <View style={styles.subregionProgressHeader}>
              <Text style={[styles.subregionProgressLabel, { color: theme.textSecondary }]}>{t('publicProfile.worldSubregionCoverage')}</Text>
              <Text style={[styles.subregionProgressValue, { color: theme.primary }]}>{subregionCoverage}%</Text>
            </View>
            <View style={[styles.subregionProgressBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.subregionProgressFill,
                  { backgroundColor: theme.primary, width: `${subregionCoverage}%` }
                ]}
              />
            </View>
          </View>

          {/* Visited Subregions List */}
          {visitedSubregions.length > 0 && (
            <View style={[styles.subregionsList, { marginBottom: 0 }]}>
              {visitedSubregions.map((subregion, index) => (
                <View
                  key={index}
                  style={[styles.subregionChip, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
                >
                  <Ionicons name="checkmark-circle" size={14} color={theme.primary} />
                  <Text style={[styles.subregionChipText, { color: theme.text }]}>{subregion}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
      </View>

      {/* Auth Prompt Modal for Guests */}
      <AuthPromptModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        feature={featureMessage}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    marginBottom: 15,
    overflow: 'hidden',
  },
  customAvatar: {
    width: '100%',
    height: '100%',
  },
  presetAvatar: {
    fontSize: 60,
  },
  nameContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 5,
    maxWidth: '100%',
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  levelText: {
    fontSize: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    maxWidth: '100%',
  },
  locationText: {
    fontSize: 14,
    textAlign: 'center',
    flexShrink: 1,
  },
  socialsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  socialHandle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  socialText: {
    fontSize: 12,
  },
  bioContainer: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  globeSection: {
    minHeight: 360,
  },
  sectionContainer: {
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionHeaderInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptySectionInner: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  progressInner: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  subregionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subregionBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subregionSubtitle: {
    fontSize: 13,
    marginBottom: 15,
  },
  subregionProgressContainer: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  subregionProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subregionProgressLabel: {
    fontSize: 14,
  },
  subregionProgressValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subregionProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  subregionProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  subregionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  subregionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  subregionChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  topCountries: {
    gap: 10,
  },
  topCountryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 25,
  },
  topCountryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  topCountryEmoji: {
    fontSize: 24,
  },
  topCountryName: {
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  topCountryFlag: {
    fontSize: 28,
    marginLeft: 8,
  },
  nextStops: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  nextStopBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    maxWidth: '100%',
  },
  nextStopText: {
    fontSize: 16,
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  statsCard: {
    borderRadius: 16,
    padding: 15,
    borderWidth: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statItemCenter: {
    flex: 1.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statValueEmphasis: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  buddiesContainer: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'flex-start',
  },
  buddyCircle: {
    alignItems: 'center',
    width: 80,
  },
  buddyAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    marginBottom: 8,
  },
  buddyName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  addBuddyContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addBuddyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addBuddyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buddyStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  buddyStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptySectionText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sharedTripsContainer: {
    gap: 12,
  },
  sharedTripCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  removeSharedTripButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  sharedTripHeader: {
    padding: 15,
    paddingBottom: 12,
  },
  tripTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tripTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sharedTripName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tripMap: {
    width: '100%',
    height: 250,
    borderTopWidth: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerNumber: {
    position: 'absolute',
    top: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerNumberText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  noMapView: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  noMapText: {
    fontSize: 14,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 15,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLogo: {
    width: 400,
    height: 120,
  },
});
