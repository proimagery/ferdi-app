import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { countryCoordinates } from '../utils/coordinates';
import { allCountriesData } from '../utils/countryData';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function TripDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { trips } = useAppContext();
  const { tripIndex, isNewTrip = true } = route.params;
  const trip = trips[tripIndex];
  const [isSaved, setIsSaved] = useState(!isNewTrip);

  if (!trip) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.danger }]}>Trip not found</Text>
      </View>
    );
  }

  // Format date helper
  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate distance between two coordinates using Haversine formula
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

  // Calculate travel time for different modes
  const calculateTravelTime = (miles) => {
    const planeSpeed = 550; // mph average commercial flight
    const carSpeed = 60; // mph average driving speed
    const trainSpeed = 100; // mph average train speed

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

  // Calculate overall trip dates
  const getOverallTripDates = () => {
    const dates = trip.countries
      .filter(c => c.startDate && c.endDate)
      .flatMap(c => [c.startDate, c.endDate]);

    if (dates.length === 0) return null;

    const sortedDates = dates.map(d => typeof d === 'string' ? new Date(d) : d).sort((a, b) => a - b);
    const start = sortedDates[0];
    const end = sortedDates[sortedDates.length - 1];

    // Calculate days and nights
    const timeDiff = end - start;
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    const nights = days - 1;

    return {
      start,
      end,
      days,
      nights,
    };
  };

  const overallDates = getOverallTripDates();

  // Save trip function
  const handleSaveTrip = () => {
    setIsSaved(true);
    Alert.alert('Success', 'Trip saved successfully!');
  };

  // Edit trip function
  const handleEditTrip = () => {
    navigation.navigate('CreateTrip', {
      editMode: true,
      editIndex: tripIndex
    });
  };

  // Create markers and polyline coordinates for trip route
  const markers = [];
  const routeCoordinates = [];

  trip.countries.forEach((country, index) => {
    const coords = countryCoordinates[country.name];
    if (coords) {
      markers.push({
        id: `country-${index}`,
        ...coords,
        title: country.name,
        description: country.startDate && country.endDate
          ? `${formatDate(country.startDate)} - ${formatDate(country.endDate)}`
          : 'Dates TBD',
      });
      routeCoordinates.push(coords);
    }
  });

  // Calculate map region to show all countries
  let initialRegion = {
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

    initialRegion = {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 10),
      longitudeDelta: Math.max(lngDelta, 10),
    };
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.tripName, { color: theme.text }]}>{trip.name}</Text>
        <View style={[styles.budgetCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="wallet" size={24} color={theme.primary} />
          <View style={styles.budgetTextContainer}>
            <Text style={[styles.budgetLabel, { color: theme.textSecondary }]}>Total Budget</Text>
            <Text style={[styles.budgetAmount, { color: theme.primary }]}>${trip.budget}</Text>
          </View>
        </View>
      </View>

      {/* Trip Breakdown */}
      <View style={styles.breakdownSection}>
        <View style={[styles.breakdownCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.breakdownItem}>
            <Ionicons name="map-outline" size={20} color={theme.secondary} />
            <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Countries:</Text>
            <Text style={[styles.breakdownValue, { color: theme.text }]}>{trip.countries.length}</Text>
          </View>
          {overallDates && (
            <View style={styles.breakdownItem}>
              <Ionicons name="calendar-outline" size={20} color={theme.pink} />
              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Duration:</Text>
              <View style={styles.durationContainer}>
                <Text style={[styles.breakdownValue, { color: theme.text }]}>
                  {formatDate(overallDates.start)} - {formatDate(overallDates.end)}
                </Text>
                <Text style={[styles.durationDaysNights, { color: theme.textSecondary }]}>
                  ({overallDates.days} {overallDates.days === 1 ? 'day' : 'days'}, {overallDates.nights} {overallDates.nights === 1 ? 'night' : 'nights'})
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Trip Route Map */}
      {markers.length > 0 ? (
        <View style={styles.mapSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Trip Route Map</Text>
          <MapView
            style={[styles.map, { borderColor: theme.border }]}
            initialRegion={initialRegion}
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
                description={marker.description}
              >
                <View style={styles.markerContainer}>
                  <Ionicons name="location" size={40} color={theme.primary} />
                  <View style={[styles.markerNumber, { backgroundColor: theme.background, borderColor: theme.primary }]}>
                    <Text style={[styles.markerNumberText, { color: theme.primary }]}>{idx + 1}</Text>
                  </View>
                </View>
              </Marker>
            ))}
            {routeCoordinates.length > 1 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor={theme.primary}
                strokeWidth={3}
                lineDashPattern={[10, 5]}
              />
            )}
          </MapView>
        </View>
      ) : (
        <View style={[styles.noMapSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="map-outline" size={40} color={theme.textSecondary} />
          <Text style={[styles.noMapText, { color: theme.textSecondary }]}>
            Map unavailable - some countries may be missing coordinates
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Countries ({trip.countries.length})</Text>
        {trip.countries.map((country, index) => {
          const currentCoords = countryCoordinates[country.name];
          const nextCountry = trip.countries[index + 1];
          const nextCoords = nextCountry ? countryCoordinates[nextCountry.name] : null;

          let distance = null;
          let travelTimes = null;

          if (currentCoords && nextCoords) {
            distance = calculateDistance(
              currentCoords.latitude,
              currentCoords.longitude,
              nextCoords.latitude,
              nextCoords.longitude
            );
            travelTimes = calculateTravelTime(distance.miles);
          }

          // Calculate days and nights for this country
          let countryDays = null;
          let countryNights = null;
          if (country.startDate && country.endDate) {
            const start = typeof country.startDate === 'string' ? new Date(country.startDate) : country.startDate;
            const end = typeof country.endDate === 'string' ? new Date(country.endDate) : country.endDate;
            const timeDiff = end - start;
            countryDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
            countryNights = countryDays - 1;
          }

          // Look up country data from allCountriesData
          const countryData = allCountriesData.find(c => c.name === country.name);
          const countryForDetail = countryData ? {
            name: countryData.name,
            flag: countryData.flag,
            continent: countryData.continent,
            population: countryData.population,
            capital: countryData.capital,
            leader: countryData.leader,
            language: countryData.language,
            currency: countryData.currency,
            highlights: countryData.highlights,
            mainAirports: countryData.mainAirports,
            mainTrainStations: countryData.mainTrainStations,
            topHotels: countryData.topHotels,
            avgFlightCost: countryData.avgFlightCost,
            avgTrainCost: countryData.avgTrainCost,
            bestTimeToVisit: countryData.bestTimeToVisit,
            visaRequired: countryData.visaRequired,
            rank: countryData.rankings?.visitors?.rank || 0,
            visitors: countryData.rankings?.visitors?.value || 'N/A',
            rankings: countryData.rankings
          } : {
            name: country.name,
            continent: 'Unknown',
            rank: 0,
            visitors: 'N/A',
            highlights: [],
            population: null,
            capital: null,
            leader: null,
            language: null,
            currency: null,
            mainAirports: null,
            mainTrainStations: null,
            topHotels: null,
            avgFlightCost: null,
            avgTrainCost: null,
            bestTimeToVisit: null,
            visaRequired: null,
            rankings: {}
          };

          return (
            <React.Fragment key={`country-${index}-${country.name}`}>
              <TouchableOpacity
                style={[styles.countryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() => navigation.navigate('CountryDetail', {
                  country: countryForDetail
                })}
                activeOpacity={0.7}
              >
                <View style={styles.countryHeader}>
                  <Ionicons name="location" size={20} color={theme.primary} />
                  <Text style={[styles.countryName, { color: theme.text }]}>{country.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} style={styles.chevron} />
                </View>
                {country.startDate && country.endDate && (
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                    <View style={styles.countryDateInfo}>
                      <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                        {formatDate(country.startDate)} - {formatDate(country.endDate)}
                      </Text>
                      <Text style={[styles.countryDaysNights, { color: theme.textSecondary }]}>
                        ({countryDays} {countryDays === 1 ? 'day' : 'days'}, {countryNights} {countryNights === 1 ? 'night' : 'nights'})
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              {/* Distance Calculator between countries */}
              {distance && nextCountry && (
                <View style={[styles.distanceCard, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderLeftColor: theme.secondary }]}>
                  <View style={styles.distanceHeader}>
                    <Ionicons name="arrow-down" size={20} color={theme.secondary} />
                    <Text style={[styles.distanceTitle, { color: theme.secondary }]}>
                      To {nextCountry.name}
                    </Text>
                  </View>
                  <View style={styles.distanceInfo}>
                    <View style={styles.distanceRow}>
                      <Ionicons name="navigate-outline" size={16} color={theme.textSecondary} />
                      <Text style={[styles.distanceText, { color: theme.text }]}>
                        {distance.miles.toLocaleString()} mi / {distance.km.toLocaleString()} km
                      </Text>
                    </View>
                    <View style={styles.travelModes}>
                      <View style={styles.modeItem}>
                        <Ionicons name="airplane-outline" size={16} color={theme.primary} />
                        <Text style={[styles.modeLabel, { color: theme.textSecondary }]}>Plane:</Text>
                        <Text style={[styles.modeTime, { color: theme.text }]}>{travelTimes.plane}</Text>
                      </View>
                      <View style={styles.modeItem}>
                        <Ionicons name="train-outline" size={16} color={theme.secondary} />
                        <Text style={[styles.modeLabel, { color: theme.textSecondary }]}>Train:</Text>
                        <Text style={[styles.modeTime, { color: theme.text }]}>{travelTimes.train}</Text>
                      </View>
                      <View style={styles.modeItem}>
                        <Ionicons name="car-outline" size={16} color={theme.pink} />
                        <Text style={[styles.modeLabel, { color: theme.textSecondary }]}>Car:</Text>
                        <Text style={[styles.modeTime, { color: theme.text }]}>{travelTimes.car}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {isSaved ? (
          <>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.primary }]} onPress={handleEditTrip}>
              <Ionicons name="create-outline" size={24} color={theme.background} />
              <Text style={[styles.buttonText, { color: theme.background }]}>Edit Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createBudgetButton, { backgroundColor: theme.secondary, borderColor: theme.secondary }]}
              onPress={() => navigation.navigate('BudgetMaker', {
                fromTrip: true,
                tripData: {
                  tripId: trip.id,
                  name: trip.name,
                  countries: trip.countries,
                  budget: trip.budget,
                }
              })}
            >
              <Ionicons name="wallet-outline" size={24} color={theme.background} />
              <Text style={[styles.buttonText, { color: theme.background }]}>Create Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => navigation.navigate('MyTrips')}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color={theme.text} />
              <Text style={[styles.doneButtonText, { color: theme.text }]}>Done</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSaveTrip}>
            <Ionicons name="save-outline" size={24} color={theme.background} />
            <Text style={[styles.buttonText, { color: theme.background }]}>Save Trip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  tripName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    gap: 15,
  },
  budgetTextContainer: {
    flexDirection: 'column',
    gap: 4,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  breakdownSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  breakdownCard: {
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    gap: 15,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  durationContainer: {
    flex: 1,
  },
  durationDaysNights: {
    fontSize: 14,
    marginTop: 2,
  },
  mapSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
  },
  noMapSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 40,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMapText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  countryCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  countryName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginLeft: 30,
  },
  countryDateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
  },
  countryDaysNights: {
    fontSize: 12,
    marginTop: 2,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerNumber: {
    position: 'absolute',
    top: 8,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  markerNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
    gap: 15,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    gap: 10,
  },
  createBudgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    gap: 10,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    gap: 10,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  distanceCard: {
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  distanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  distanceInfo: {
    gap: 12,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceText: {
    fontSize: 15,
    fontWeight: '600',
  },
  travelModes: {
    gap: 8,
    paddingLeft: 24,
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeLabel: {
    fontSize: 14,
    width: 50,
  },
  modeTime: {
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
