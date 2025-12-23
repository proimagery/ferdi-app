import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function PublicProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { profile, completedTrips, visitedCities, trips, travelBuddies, highlightedBuddies, buddyRequests, sendBuddyRequest, updateProfile } = useAppContext();
  const { theme } = useTheme();
  const { checkAuth, showAuthModal, setShowAuthModal, featureMessage } = useAuthGuard();

  // Check if viewing another user's profile or own profile
  const viewingUser = route?.params?.user;
  const isOwnProfile = !viewingUser;

  // Use viewingUser data if available, otherwise use own profile
  const displayProfile = viewingUser || profile;
  const displayTravelBuddies = viewingUser?.travelBuddies || travelBuddies;
  const displayHighlightedBuddies = viewingUser?.highlightedBuddies || highlightedBuddies;

  // Check buddy status
  const isBuddy = viewingUser ? travelBuddies.includes(viewingUser.id) : false;
  const isRequestSent = viewingUser ? buddyRequests.includes(viewingUser.id) : false;

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

  // Calculate statistics
  let totalCountriesVisited, uniqueCountries, totalCitiesVisited;

  if (isOwnProfile) {
    // Include countries from completed trips, active trips, and visited cities
    const allCountries = [
      ...completedTrips.map(t => t.country),
      ...trips.flatMap(t => t.countries.map(c => c.name)),
      ...visitedCities.map(c => c.country)
    ];
    uniqueCountries = [...new Set(allCountries.filter(Boolean))];
    totalCountriesVisited = uniqueCountries.length;
    totalCitiesVisited = visitedCities.length;
  } else {
    uniqueCountries = viewingUser?.countriesVisited || [];
    totalCountriesVisited = uniqueCountries.length;
    totalCitiesVisited = 0; // Not available for other users
  }

  const worldCountries = 195;
  const worldCoverage = ((totalCountriesVisited / worldCountries) * 100).toFixed(0);

  // Get continents count
  const continents = new Set();
  if (isOwnProfile) {
    completedTrips.forEach(trip => {
      const continentMap = {
        'USA': 'North America', 'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
        'France': 'Europe', 'Germany': 'Europe', 'Italy': 'Europe', 'Spain': 'Europe', 'England': 'Europe', 'Scotland': 'Europe', 'Wales': 'Europe', 'Northern Ireland': 'Europe',
        'Japan': 'Asia', 'China': 'Asia', 'India': 'Asia', 'Thailand': 'Asia',
        'Australia': 'Oceania', 'New Zealand': 'Oceania',
        'Brazil': 'South America', 'Argentina': 'South America', 'Chile': 'South America',
        'Egypt': 'Africa', 'South Africa': 'Africa', 'Kenya': 'Africa',
      };
      const continent = continentMap[trip.country];
      if (continent) continents.add(continent);
    });
  } else {
    // For viewing users, estimate continents from countries
    (viewingUser?.countriesVisited || []).forEach(country => {
      const continentMap = {
        'USA': 'North America', 'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
        'France': 'Europe', 'Germany': 'Europe', 'Italy': 'Europe', 'Spain': 'Europe', 'England': 'Europe', 'Scotland': 'Europe', 'Wales': 'Europe', 'Northern Ireland': 'Europe',
        'Japan': 'Asia', 'China': 'Asia', 'India': 'Asia', 'Thailand': 'Asia',
        'Australia': 'Oceania', 'New Zealand': 'Oceania',
        'Brazil': 'South America', 'Argentina': 'South America', 'Chile': 'South America',
        'Egypt': 'Africa', 'South Africa': 'Africa', 'Kenya': 'Africa',
      };
      const continent = continentMap[country];
      if (continent) continents.add(continent);
    });
  }

  const userName = displayProfile?.name || 'Traveler';
  const userUsername = displayProfile?.username || '';
  const userLocation = displayProfile?.location || 'United States';
  const userBio = displayProfile?.bio || '';

  // Handle different data structures for top3 and next3
  // Mock users have arrays, real profile has individual top1, top2, top3 fields
  const getTopCountries = () => {
    if (isOwnProfile || !viewingUser) {
      return {
        top1: displayProfile?.top1,
        top2: displayProfile?.top2,
        top3: displayProfile?.top3,
      };
    } else {
      // For viewing other users (mock data)
      const topArray = displayProfile?.top3 || [];
      return {
        top1: topArray[0],
        top2: topArray[1],
        top3: topArray[2],
      };
    }
  };

  const getNextStops = () => {
    if (isOwnProfile || !viewingUser) {
      return {
        next1: displayProfile?.next1,
        next2: displayProfile?.next2,
        next3: displayProfile?.next3,
      };
    } else {
      // For viewing other users (mock data)
      const nextArray = displayProfile?.next3 || [];
      return {
        next1: nextArray[0],
        next2: nextArray[1],
        next3: nextArray[2],
      };
    }
  };

  const topCountries = getTopCountries();
  const nextStops = getNextStops();

  const travelerRank = getTravelerRank(totalCountriesVisited);

  // Function to pick travel photo directly
  const pickTravelPhoto = async () => {
    if (profile.travelPhotos && profile.travelPhotos.length >= 5) {
      Alert.alert('Maximum Reached', 'You can only add up to 5 travel photos.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to select a photo.');
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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
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
              <Text style={[styles.buddyStatusText, { color: theme.primary }]}>Travel Buddies</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addBuddyButton, {
                backgroundColor: isRequestSent ? theme.border : theme.primary,
                opacity: isRequestSent ? 0.5 : 1
              }]}
              onPress={handleAddBuddy}
              disabled={isRequestSent}
            >
              <Ionicons
                name={isRequestSent ? "checkmark" : "person-add"}
                size={20}
                color={theme.background}
              />
              <Text style={[styles.addBuddyText, { color: theme.background }]}>
                {isRequestSent ? 'Request Sent' : 'Add Travel Buddy'}
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
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isOwnProfile ? 'My Top 3' : `${userName.split(' ')[0]}'s Top 3`}
          </Text>
        </View>
        {!topCountries.top1 && !topCountries.top2 && !topCountries.top3 ? (
          <View style={[styles.emptySection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
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

      {/* Next Stops */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isOwnProfile ? 'Next Stops' : `${userName.split(' ')[0]}'s Next Stops`}
          </Text>
        </View>
        {!nextStops.next1 && !nextStops.next2 && !nextStops.next3 ? (
          <View style={[styles.emptySection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
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

      {/* Travel Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Stats</Text>
        </View>
        <View style={[styles.statsCard, { backgroundColor: theme.primary, borderColor: theme.primary }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.background }]}>{totalCountriesVisited}</Text>
              <Text style={[styles.statLabel, { color: theme.background }]}>Countries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={[styles.statItem, styles.statItemCenter]}>
              <Text style={[styles.statValueEmphasis, { color: theme.background }]}>{worldCoverage}%</Text>
              <Text style={[styles.statLabel, { color: theme.background }]}>Of the World</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.background }]}>{continents.size}</Text>
              <Text style={[styles.statLabel, { color: theme.background }]}>Continents</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Travel Buddies */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Buddies</Text>
          {isOwnProfile && displayTravelBuddies.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('TravelBuddies')}>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>
                View All ({displayTravelBuddies.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {displayTravelBuddies.length === 0 ? (
          <View style={[styles.emptySection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
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

      {/* Spinning Globe - Only show for own profile */}
      {isOwnProfile && (
        <View style={styles.globeSection}>
          <SpinningGlobe completedTrips={completedTrips} visitedCities={visitedCities} />
        </View>
      )}

      {/* Travel Photos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Photos</Text>
        </View>
        {(!displayProfile?.travelPhotos || displayProfile.travelPhotos.length === 0) ? (
          <View style={[styles.emptySection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
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
                <Text style={[styles.manageButtonText, { color: theme.background }]}>Add Photos</Text>
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

      {/* Shared Trip Maps */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Shared Trips</Text>
        </View>
        {(!displayProfile?.sharedTripMaps || displayProfile.sharedTripMaps.length === 0) ? (
          <View style={[styles.emptySection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
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
                <Text style={[styles.manageButtonText, { color: theme.background }]}>Select Trips</Text>
              </TouchableOpacity>
            )}
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
                      <Text style={[styles.noMapText, { color: theme.textSecondary }]}>Map unavailable</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
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
    borderRadius: 20,
    padding: 20,
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
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statValueEmphasis: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  globeSection: {
    padding: 20,
    paddingBottom: 40,
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
