import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function CompletedTripsScreen({ navigation }) {
  const { theme } = useTheme();
  const { completedTrips, trips } = useAppContext();

  // Merge completed trips from both sources
  const allCompletedCountries = [
    ...completedTrips,
    ...trips.flatMap(trip =>
      trip.countries.map(country => ({
        country: country.name,
        name: country.name,
        date: country.endDate ? new Date(country.endDate).getFullYear().toString() : 'N/A',
      }))
    )
  ];

  // Remove duplicates based on country name
  const uniqueCompletedTrips = allCompletedCountries.reduce((acc, current) => {
    const exists = acc.find(item => item.country === current.country);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Sort by country name
  const sortedTrips = uniqueCompletedTrips.sort((a, b) =>
    a.country.localeCompare(b.country)
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Completed Trips</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {sortedTrips.length} {sortedTrips.length === 1 ? 'country' : 'countries'} visited
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {sortedTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={80} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No completed trips yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Add countries you've visited to see them here
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('ManageCountries', {
                returnScreen: 'CompletedTrips'
              })}
            >
              <Ionicons name="add-circle" size={24} color={theme.background} />
              <Text style={[styles.addButtonText, { color: theme.background }]}>Add Country</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sortedTrips.map((trip, index) => (
            <View key={index} style={[styles.tripCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name="location" size={24} color={theme.primary} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.countryName, { color: theme.text }]}>{trip.country}</Text>
                  <View style={styles.yearContainer}>
                    <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                    <Text style={[styles.yearText, { color: theme.textSecondary }]}>{trip.date}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {sortedTrips.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('ManageCountries', {
            returnScreen: 'CompletedTrips'
          })}
        >
          <Ionicons name="add" size={30} color={theme.background} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
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
    marginBottom: 30,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tripCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  countryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  yearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  yearText: {
    fontSize: 14,
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
});
