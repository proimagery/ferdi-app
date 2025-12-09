import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

export default function TravelMapperScreen({ navigation, route }) {
  const [completedTrips, setCompletedTrips] = useState(route.params?.completedTrips || []);

  React.useEffect(() => {
    if (route.params?.completedTrips) {
      setCompletedTrips(route.params.completedTrips);
    }
  }, [route.params?.completedTrips]);

  // Sample country coordinates (you would have a more comprehensive list in production)
  const countryCoordinates = {
    'USA': { latitude: 37.0902, longitude: -95.7129 },
    'United States': { latitude: 37.0902, longitude: -95.7129 },
    'France': { latitude: 46.2276, longitude: 2.2137 },
    'Japan': { latitude: 36.2048, longitude: 138.2529 },
    'Italy': { latitude: 41.8719, longitude: 12.5674 },
    'Spain': { latitude: 40.4637, longitude: -3.7492 },
    'Germany': { latitude: 51.1657, longitude: 10.4515 },
    'UK': { latitude: 55.3781, longitude: -3.4360 },
    'United Kingdom': { latitude: 55.3781, longitude: -3.4360 },
    'Australia': { latitude: -25.2744, longitude: 133.7751 },
    'Canada': { latitude: 56.1304, longitude: -106.3468 },
    'Brazil': { latitude: -14.2350, longitude: -51.9253 },
    'China': { latitude: 35.8617, longitude: 104.1954 },
    'India': { latitude: 20.5937, longitude: 78.9629 },
    'Mexico': { latitude: 23.6345, longitude: -102.5528 },
    'Thailand': { latitude: 15.8700, longitude: 100.9925 },
  };

  const markers = completedTrips
    .map((trip) => {
      const coords = countryCoordinates[trip.country];
      if (coords) {
        return {
          ...trip,
          ...coords,
        };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 20,
          longitude: 0,
          latitudeDelta: 100,
          longitudeDelta: 100,
        }}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.country}
            description={marker.date}
            pinColor="#4ade80"
          />
        ))}
      </MapView>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="location" size={24} color="#4ade80" />
          <Text style={styles.statValue}>{completedTrips.length}</Text>
          <Text style={styles.statLabel}>Countries Visited</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCompletedTrip', { completedTrips })}
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
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  statsCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ade80',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
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
