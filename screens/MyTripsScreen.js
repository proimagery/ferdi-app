import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function MyTripsScreen({ navigation, route }) {
  const { trips, deleteTrip, profile, updateProfile } = useAppContext();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const sharingMode = route.params?.sharingMode || false;

  const [viewMode, setViewMode] = useState('upcoming'); // 'upcoming' or 'past'
  const [selectedTrips, setSelectedTrips] = useState(profile?.sharedTripMaps || []);

  const handleDeleteTrip = (index) => {
    deleteTrip(index);
  };

  const toggleTripSelection = (tripIndex) => {
    const tripKey = `${viewMode}-${tripIndex}`;
    if (selectedTrips.includes(tripKey)) {
      setSelectedTrips(selectedTrips.filter(t => t !== tripKey));
    } else {
      setSelectedTrips([...selectedTrips, tripKey]);
    }
  };

  const handleSaveSharing = () => {
    updateProfile({
      ...profile,
      sharedTripMaps: selectedTrips,
    });
    navigation.navigate('Profile');
  };

  // Filter trips based on view mode
  const getFilteredTrips = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return trips.filter(trip => {
      // Get the latest end date from the trip
      const dates = trip.countries
        .filter(c => c.endDate)
        .map(c => typeof c.endDate === 'string' ? new Date(c.endDate) : c.endDate);

      if (dates.length === 0) {
        // If no dates, consider it upcoming
        return viewMode === 'upcoming';
      }

      const latestDate = new Date(Math.max(...dates));
      latestDate.setHours(0, 0, 0, 0);

      if (viewMode === 'past') {
        return latestDate < today;
      } else {
        return latestDate >= today;
      }
    });
  };

  const filteredTrips = getFilteredTrips();

  // Helper function to get abbreviated country list
  const getCountryList = (countries) => {
    if (countries.length === 0) return 'No countries';
    const names = countries.map(c => c.name).filter(Boolean);
    if (names.length <= 3) {
      return names.join(', ');
    }
    return names.slice(0, 3).join(', ') + '...';
  };

  // Helper function to get trip duration
  const getTripDuration = (countries) => {
    const dates = countries
      .filter(c => c.startDate && c.endDate)
      .flatMap(c => [c.startDate, c.endDate]);

    if (dates.length === 0) return 'No dates set';

    const sortedDates = dates
      .map(d => typeof d === 'string' ? new Date(d) : d)
      .sort((a, b) => a - b);

    const start = sortedDates[0];
    const end = sortedDates[sortedDates.length - 1];

    const formatDate = (date) => {
      const options = { month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    };

    return `${formatDate(start)} - ${formatDate(end)}, ${start.getFullYear()}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Toggle between Upcoming and Past */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'upcoming' && { backgroundColor: theme.primary },
            { borderColor: theme.primary }
          ]}
          onPress={() => setViewMode('upcoming')}
        >
          <Text style={[
            styles.toggleText,
            viewMode === 'upcoming' ? { color: theme.background } : { color: theme.primary }
          ]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'past' && { backgroundColor: theme.primary },
            { borderColor: theme.primary }
          ]}
          onPress={() => setViewMode('past')}
        >
          <Text style={[
            styles.toggleText,
            viewMode === 'past' ? { color: theme.background } : { color: theme.primary }
          ]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {sharingMode && (
        <View style={[styles.sharingModeHeader, { backgroundColor: theme.primary + '20', borderBottomColor: theme.primary }]}>
          <Text style={[styles.sharingModeText, { color: theme.text }]}>
            Select trips to share on your profile
          </Text>
          <TouchableOpacity
            style={[styles.saveSharingButton, { backgroundColor: theme.primary }]}
            onPress={handleSaveSharing}
          >
            <Text style={[styles.saveSharingText, { color: theme.background }]}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {filteredTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={80} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No {viewMode} trips yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {viewMode === 'upcoming' ? 'Create your first trip to get started' : 'Complete some trips to see them here'}
            </Text>
          </View>
        ) : (
          filteredTrips.map((trip, originalIndex) => {
            const tripIndex = trips.indexOf(trip);
            const tripKey = `${viewMode}-${tripIndex}`;
            const isSelected = selectedTrips.includes(tripKey);

            return (
            <TouchableOpacity
              key={tripIndex}
              style={[
                styles.tripCard,
                { backgroundColor: theme.cardBackground, borderColor: theme.border },
                sharingMode && isSelected && { borderColor: theme.primary, borderWidth: 2 }
              ]}
              onPress={() => {
                if (sharingMode) {
                  toggleTripSelection(tripIndex);
                } else {
                  navigation.navigate('TripDetail', {
                    tripIndex: tripIndex,
                    isNewTrip: false
                  });
                }
              }}
            >
              <View style={styles.tripHeader}>
                <Text style={[styles.tripName, { color: theme.text }]}>{trip.name}</Text>
                <View style={styles.tripHeaderRight}>
                  {sharingMode && (
                    <Ionicons
                      name={isSelected ? "checkbox" : "square-outline"}
                      size={24}
                      color={isSelected ? theme.primary : theme.textSecondary}
                      style={{ marginRight: 10 }}
                    />
                  )}
                  {!sharingMode && (
                    <TouchableOpacity onPress={() => handleDeleteTrip(tripIndex)}>
                      <Ionicons name="trash-outline" size={20} color={theme.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <Text style={[styles.tripCountries, { color: theme.primary }]}>
                {trip.countries.length} {trip.countries.length === 1 ? 'country' : 'countries'} | {getCountryList(trip.countries)}
              </Text>
              <Text style={[styles.tripBudget, { color: theme.textSecondary }]}>
                ${trip.budget} | {getTripDuration(trip.countries)}
              </Text>
            </TouchableOpacity>
            );
          })
        )}

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('CreateTrip')}
      >
        <Ionicons name="add" size={30} color={theme.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  tripCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tripHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tripCountries: {
    fontSize: 16,
    marginBottom: 5,
  },
  tripBudget: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
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
  toggleContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sharingModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 2,
  },
  sharingModeText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  saveSharingButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveSharingText: {
    fontSize: 16,
    fontWeight: 'bold',
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
