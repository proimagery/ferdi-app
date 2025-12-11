import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { countryCoordinates } from '../utils/coordinates';

export default function WorldMapScreen({ route }) {
  const { completedTrips, visitedCities } = useAppContext();
  const { theme } = useTheme();

  // Collect all visited locations with coordinates
  const markers = [];

  // Add country markers (red)
  completedTrips.forEach((trip, index) => {
    const coords = countryCoordinates[trip.country];
    if (coords) {
      markers.push({
        id: `country-${index}`,
        ...coords,
        title: trip.country,
        description: `Visited in ${trip.date}`,
        type: 'country',
        color: '#ff4444',
      });
    }
  });

  // Add city markers (blue)
  visitedCities.forEach((city, index) => {
    if (city.latitude && city.longitude) {
      markers.push({
        id: `city-${index}`,
        latitude: city.latitude,
        longitude: city.longitude,
        title: city.city || city.name,
        description: `${city.country} • Visited in ${city.date}`,
        type: 'city',
        color: '#3b82f6',
      });
    }
  });

  const initialRegion = {
    latitude: 20,
    longitude: 0,
    latitudeDelta: 100,
    longitudeDelta: 100,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Your Travel Map</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
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
            pinColor={marker.color}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>

      {markers.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="map-outline" size={64} color={theme.primary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Trips Yet</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Start adding countries you've visited to see them on the map!
          </Text>
        </View>
      )}

      <View style={[styles.legend, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ff4444' }]} />
          <Text style={[styles.legendText, { color: theme.text }]}>Country</Text>
        </View>
        <View style={[styles.legendItem, { marginTop: 8 }]}>
          <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
          <Text style={[styles.legendText, { color: theme.text }]}>City</Text>
        </View>
      </View>
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
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
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
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
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
  },
});
