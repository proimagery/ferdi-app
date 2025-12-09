import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MyTripsScreen({ navigation, route }) {
  const [trips, setTrips] = useState(route.params?.trips || []);

  React.useEffect(() => {
    if (route.params?.trips) {
      setTrips(route.params.trips);
    }
  }, [route.params?.trips]);

  const deleteTrip = (index) => {
    const newTrips = trips.filter((_, i) => i !== index);
    setTrips(newTrips);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {trips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={80} color="#888888" />
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first trip to get started
            </Text>
          </View>
        ) : (
          trips.map((trip, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tripCard}
              onPress={() => navigation.navigate('TripDetail', { trip, index, trips })}
            >
              <View style={styles.tripHeader}>
                <Text style={styles.tripName}>{trip.name}</Text>
                <TouchableOpacity onPress={() => deleteTrip(index)}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <Text style={styles.tripCountries}>
                {trip.countries.length} {trip.countries.length === 1 ? 'country' : 'countries'}
              </Text>
              <Text style={styles.tripBudget}>Budget: ${trip.budget}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTrip', { trips })}
      >
        <Ionicons name="add" size={30} color="#0a0a0a" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  tripCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tripName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tripCountries: {
    fontSize: 16,
    color: '#4ade80',
    marginBottom: 5,
  },
  tripBudget: {
    fontSize: 16,
    color: '#888888',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
