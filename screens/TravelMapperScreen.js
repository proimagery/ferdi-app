import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { countryCoordinates } from '../utils/coordinates';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function TravelMapperScreen({ navigation, route }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [tempCountry, setTempCountry] = useState('');
  const [searchText, setSearchText] = useState('');

  const countries = Object.keys(countryCoordinates).sort();

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const miles = R * c;
    const km = miles * 1.60934;
    return { miles: Math.round(miles), km: Math.round(km) };
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

  // Get total journey stats
  const getJourneyStats = () => {
    if (selectedCountries.length < 2) return null;

    let totalMiles = 0;
    let totalKm = 0;

    for (let i = 0; i < selectedCountries.length - 1; i++) {
      const current = countryCoordinates[selectedCountries[i]];
      const next = countryCoordinates[selectedCountries[i + 1]];
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
      countries: selectedCountries.length,
      legs: selectedCountries.length - 1,
      travelTimes
    };
  };

  const addCountry = (country) => {
    if (country && !selectedCountries.includes(country)) {
      setSelectedCountries([...selectedCountries, country]);
      setTempCountry('');
      setSearchText('');
      setShowCountryPicker(false);
    }
  };

  const removeCountry = (index) => {
    const updated = selectedCountries.filter((_, i) => i !== index);
    setSelectedCountries(updated);
  };

  const moveCountry = (index, direction) => {
    const updated = [...selectedCountries];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < updated.length) {
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      setSelectedCountries(updated);
    }
  };

  const saveToMyTrips = () => {
    const countriesForTrip = selectedCountries.map(name => ({
      name,
      startDate: null,
      endDate: null,
    }));

    navigation.navigate('CreateTrip', {
      prefilledCountries: countriesForTrip
    });
  };

  // Get map markers
  const markers = selectedCountries.map((countryName, index) => ({
    ...countryCoordinates[countryName],
    name: countryName,
    index: index + 1,
  }));

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
        style={styles.map}
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
              <Text style={[styles.statValue, { color: theme.text }]}>{journeyStats.countries}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Countries</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="swap-horizontal" size={20} color={theme.secondary} />
              <Text style={[styles.statValue, { color: theme.text }]}>{journeyStats.legs}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Legs</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="navigate" size={20} color={theme.orange} />
              <Text style={[styles.statValue, { color: theme.text }]}>{journeyStats.totalMiles.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Miles</Text>
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

      {/* Country List Panel */}
      <View style={[styles.bottomPanel, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
        <View style={styles.panelHeader}>
          <Text style={[styles.panelTitle, { color: theme.text }]}>Journey Route</Text>
          {selectedCountries.length >= 2 && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={saveToMyTrips}
            >
              <Ionicons name="save" size={18} color={theme.background} />
              <Text style={[styles.saveButtonText, { color: theme.background }]}>Save Trip</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.countryList} showsVerticalScrollIndicator={false}>
          {selectedCountries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={40} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Add countries to plan your journey
              </Text>
            </View>
          ) : (
            selectedCountries.map((country, index) => {
              const nextCountry = selectedCountries[index + 1];
              let distance = null;
              let travelTimes = null;

              if (nextCountry) {
                const current = countryCoordinates[country];
                const next = countryCoordinates[nextCountry];
                distance = calculateDistance(
                  current.latitude,
                  current.longitude,
                  next.latitude,
                  next.longitude
                );
                travelTimes = calculateTravelTime(distance.miles);
              }

              return (
                <View key={index}>
                  <View style={[styles.countryItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <View style={[styles.countryNumber, { backgroundColor: theme.primary }]}>
                      <Text style={[styles.countryNumberText, { color: theme.background }]}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.countryName, { color: theme.text }]}>{country}</Text>
                    <View style={styles.countryActions}>
                      {index > 0 && (
                        <TouchableOpacity onPress={() => moveCountry(index, 'up')}>
                          <Ionicons name="arrow-up" size={20} color={theme.primary} />
                        </TouchableOpacity>
                      )}
                      {index < selectedCountries.length - 1 && (
                        <TouchableOpacity onPress={() => moveCountry(index, 'down')}>
                          <Ionicons name="arrow-down" size={20} color={theme.primary} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => removeCountry(index)}>
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
      </View>

      {/* Add Country FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setShowCountryPicker(true)}
      >
        <Ionicons name="add" size={30} color={theme.background} />
      </TouchableOpacity>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCountryPicker(false);
          setSearchText('');
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'flex-end' }}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add Country</Text>
              <TouchableOpacity onPress={() => {
                setShowCountryPicker(false);
                setSearchText('');
              }}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <Ionicons name="search" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Type to search countries..."
                placeholderTextColor={theme.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="words"
                autoFocus={true}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Country List */}
            <ScrollView style={styles.countryPickerList} showsVerticalScrollIndicator={false}>
              {countries
                .filter(country => country.toLowerCase().includes(searchText.toLowerCase()))
                .map((country, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.countryPickerItem,
                      {
                        backgroundColor: selectedCountries.includes(country) ? theme.border : 'transparent',
                        borderBottomColor: theme.border
                      }
                    ]}
                    onPress={() => addCountry(country)}
                    disabled={selectedCountries.includes(country)}
                  >
                    <Text style={[
                      styles.countryPickerText,
                      { color: selectedCountries.includes(country) ? theme.textSecondary : theme.text }
                    ]}>
                      {country}
                    </Text>
                    {selectedCountries.includes(country) && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              {countries.filter(country => country.toLowerCase().includes(searchText.toLowerCase())).length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>No countries found</Text>
                </View>
              )}
            </ScrollView>
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
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.5,
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
    height: Dimensions.get('window').height * 0.5,
    borderTopWidth: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 15,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Dimensions.get('window').height * 0.5 + 20,
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
    maxHeight: '80%',
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
    maxHeight: 400,
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
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLogo: {
    width: 400,
    height: 120,
  },
});
