import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

export default function WorldMapScreen({ route }) {
  const { completedTrips = [], visitedCities = [] } = route.params || {};

  // Approximate coordinates for countries (simplified for demo)
  const countryCoordinates = {
    'France': { latitude: 48.8566, longitude: 2.3522 },
    'Spain': { latitude: 40.4168, longitude: -3.7038 },
    'United States': { latitude: 38.9072, longitude: -77.0369 },
    'USA': { latitude: 38.9072, longitude: -77.0369 },
    'China': { latitude: 39.9042, longitude: 116.4074 },
    'Italy': { latitude: 41.9028, longitude: 12.4964 },
    'Turkey': { latitude: 39.9334, longitude: 32.8597 },
    'Mexico': { latitude: 19.4326, longitude: -99.1332 },
    'Thailand': { latitude: 13.7563, longitude: 100.5018 },
    'Germany': { latitude: 52.5200, longitude: 13.4050 },
    'United Kingdom': { latitude: 51.5074, longitude: -0.1278 },
    'Japan': { latitude: 35.6762, longitude: 139.6503 },
    'Greece': { latitude: 37.9838, longitude: 23.7275 },
    'Austria': { latitude: 48.2082, longitude: 16.3738 },
    'Malaysia': { latitude: 3.1390, longitude: 101.6869 },
    'Portugal': { latitude: 38.7223, longitude: -9.1393 },
    'Canada': { latitude: 45.4215, longitude: -75.6972 },
    'Poland': { latitude: 52.2297, longitude: 21.0122 },
    'Netherlands': { latitude: 52.3676, longitude: 4.9041 },
    'South Korea': { latitude: 37.5665, longitude: 126.9780 },
    'Vietnam': { latitude: 21.0285, longitude: 105.8542 },
    'Russia': { latitude: 55.7558, longitude: 37.6173 },
    'Hong Kong': { latitude: 22.3193, longitude: 114.1694 },
    'Croatia': { latitude: 45.8150, longitude: 15.9819 },
    'Hungary': { latitude: 47.4979, longitude: 19.0402 },
    'Morocco': { latitude: 33.9716, longitude: -6.8498 },
    'Czech Republic': { latitude: 50.0755, longitude: 14.4378 },
    'United Arab Emirates': { latitude: 25.2048, longitude: 55.2708 },
    'Indonesia': { latitude: -6.2088, longitude: 106.8456 },
    'Saudi Arabia': { latitude: 24.7136, longitude: 46.6753 },
    'India': { latitude: 28.6139, longitude: 77.2090 },
    'Singapore': { latitude: 1.3521, longitude: 103.8198 },
    'Switzerland': { latitude: 46.9480, longitude: 7.4474 },
    'Ireland': { latitude: 53.3498, longitude: -6.2603 },
    'Belgium': { latitude: 50.8503, longitude: 4.3517 },
    'Denmark': { latitude: 55.6761, longitude: 12.5683 },
    'Sweden': { latitude: 59.3293, longitude: 18.0686 },
    'Norway': { latitude: 59.9139, longitude: 10.7522 },
    'Finland': { latitude: 60.1695, longitude: 24.9354 },
    'Brazil': { latitude: -15.8267, longitude: -47.9218 },
    'Egypt': { latitude: 30.0444, longitude: 31.2357 },
    'South Africa': { latitude: -33.9249, longitude: 18.4241 },
    'New Zealand': { latitude: -41.2865, longitude: 174.7762 },
    'Australia': { latitude: -35.2809, longitude: 149.1300 },
    'Argentina': { latitude: -34.6037, longitude: -58.3816 },
    'Chile': { latitude: -33.4489, longitude: -70.6693 },
    'Peru': { latitude: -12.0464, longitude: -77.0428 },
    'Colombia': { latitude: 4.7110, longitude: -74.0721 },
    'Philippines': { latitude: 14.5995, longitude: 120.9842 },
    'Cambodia': { latitude: 11.5564, longitude: 104.9282 },
    'Jordan': { latitude: 31.9454, longitude: 35.9284 },
    'Iceland': { latitude: 64.1466, longitude: -21.9426 },
  };

  // Collect all visited locations with coordinates
  const markers = [];

  // Add country markers
  completedTrips.forEach((trip, index) => {
    const coords = countryCoordinates[trip.country];
    if (coords) {
      markers.push({
        id: `country-${index}`,
        ...coords,
        title: trip.country,
        description: `Visited in ${trip.date}`,
        type: 'country',
      });
    }
  });

  // Add city markers (if we have city data with coordinates in the future)
  visitedCities.forEach((city, index) => {
    // For now, we'll skip cities as they would need a more comprehensive coordinate database
    // This can be enhanced with a city coordinates lookup
  });

  const initialRegion = {
    latitude: 20,
    longitude: 0,
    latitudeDelta: 100,
    longitudeDelta: 100,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Travel Map</Text>
        <Text style={styles.headerSubtitle}>
          {markers.length} location{markers.length !== 1 ? 's' : ''} visited
        </Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
            pinColor="#4ade80"
          />
        ))}
      </MapView>

      {markers.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="map-outline" size={64} color="#4ade80" />
          <Text style={styles.emptyTitle}>No Trips Yet</Text>
          <Text style={styles.emptyText}>
            Start adding countries you've visited to see them on the map!
          </Text>
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4ade80' }]} />
          <Text style={styles.legendText}>Visited Location</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#0a0a0a',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888888',
  },
  map: {
    flex: 1,
  },
  emptyState: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#ffffff',
  },
});
