import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

export default function TripDetailScreen({ route, navigation }) {
  const { trip, trips = [], tripIndex, isNewTrip = true } = route.params;
  const [isSaved, setIsSaved] = useState(!isNewTrip);

  // Country coordinates database
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
    'Luxembourg': { latitude: 49.6116, longitude: 6.1319 },
    'Romania': { latitude: 44.4268, longitude: 26.1025 },
    'Bulgaria': { latitude: 42.6977, longitude: 23.3219 },
    'Slovakia': { latitude: 48.1486, longitude: 17.1077 },
    'Slovenia': { latitude: 46.0569, longitude: 14.5058 },
    'Estonia': { latitude: 59.4370, longitude: 24.7536 },
    'Latvia': { latitude: 56.9496, longitude: 24.1052 },
    'Lithuania': { latitude: 54.6872, longitude: 25.2797 },
    'Tunisia': { latitude: 36.8065, longitude: 10.1815 },
    'Sri Lanka': { latitude: 6.9271, longitude: 79.8612 },
    'Maldives': { latitude: 4.1755, longitude: 73.5093 },
    'Cuba': { latitude: 23.1136, longitude: -82.3666 },
    'Costa Rica': { latitude: 9.9281, longitude: -84.0907 },
    'Dominican Republic': { latitude: 18.7357, longitude: -70.1627 },
    'Jamaica': { latitude: 18.0179, longitude: -76.8099 },
    'Kenya': { latitude: -1.2864, longitude: 36.8172 },
    'Tanzania': { latitude: -6.7924, longitude: 39.2083 },
    'Ethiopia': { latitude: 9.0054, longitude: 38.7636 },
    'Nepal': { latitude: 27.7172, longitude: 85.3240 },
    'Bhutan': { latitude: 27.5142, longitude: 90.4336 },
    'Myanmar': { latitude: 16.8661, longitude: 96.1951 },
    'Laos': { latitude: 17.9757, longitude: 102.6331 },
    'Oman': { latitude: 23.5880, longitude: 58.3829 },
    'Qatar': { latitude: 25.2854, longitude: 51.5310 },
    'Kuwait': { latitude: 29.3759, longitude: 47.9774 },
    'Bahrain': { latitude: 26.0667, longitude: 50.5577 },
    'Lebanon': { latitude: 33.8886, longitude: 35.4955 },
    'Malta': { latitude: 35.8989, longitude: 14.5146 },
    'Cyprus': { latitude: 35.1264, longitude: 33.4299 },
    'Albania': { latitude: 41.3275, longitude: 19.8187 },
    'North Macedonia': { latitude: 41.9973, longitude: 21.4280 },
    'Serbia': { latitude: 44.7866, longitude: 20.4489 },
    'Bosnia and Herzegovina': { latitude: 43.8564, longitude: 18.4131 },
    'Montenegro': { latitude: 42.4304, longitude: 19.2594 },
    'Uruguay': { latitude: -34.9011, longitude: -56.1645 },
    'Paraguay': { latitude: -25.2637, longitude: -57.5759 },
    'Bolivia': { latitude: -16.5000, longitude: -68.1500 },
    'Ecuador': { latitude: -0.1807, longitude: -78.4678 },
    'Panama': { latitude: 8.9824, longitude: -79.5199 },
    'Guatemala': { latitude: 14.6349, longitude: -90.5069 },
    'Nicaragua': { latitude: 12.1150, longitude: -86.2362 },
    'El Salvador': { latitude: 13.6929, longitude: -89.2182 },
    'Honduras': { latitude: 14.0723, longitude: -87.1921 },
    'Belize': { latitude: 17.1899, longitude: -88.4976 },
    'Fiji': { latitude: -17.7134, longitude: 178.0650 },
    'Papua New Guinea': { latitude: -9.4438, longitude: 147.1803 },
    'Madagascar': { latitude: -18.8792, longitude: 47.5079 },
    'Zimbabwe': { latitude: -17.8252, longitude: 31.0335 },
    'Zambia': { latitude: -15.4167, longitude: 28.2833 },
  };

  // Format date helper
  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Save trip function
  const handleSaveTrip = () => {
    const updatedTrips = [...trips, trip];
    setIsSaved(true);
    Alert.alert('Success', 'Trip saved successfully!', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('MyTrips', { trips: updatedTrips })
      }
    ]);
  };

  // Edit trip function
  const handleEditTrip = () => {
    navigation.navigate('CreateTrip', {
      trips,
      editMode: true,
      editTrip: trip,
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tripName}>{trip.name}</Text>
        <View style={styles.budgetCard}>
          <Ionicons name="wallet" size={24} color="#4ade80" />
          <Text style={styles.budgetAmount}>${trip.budget}</Text>
        </View>
      </View>

      {/* Trip Route Map */}
      {markers.length > 0 && (
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Trip Overview</Text>
          <MapView
            style={styles.map}
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
                  <Ionicons name="location" size={40} color="#4ade80" />
                  <View style={styles.markerNumber}>
                    <Text style={styles.markerNumberText}>{idx + 1}</Text>
                  </View>
                </View>
              </Marker>
            ))}
            {routeCoordinates.length > 1 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#4ade80"
                strokeWidth={3}
                lineDashPattern={[10, 5]}
              />
            )}
          </MapView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Countries ({trip.countries.length})</Text>
        {trip.countries.map((country, index) => (
          <View key={index} style={styles.countryCard}>
            <View style={styles.countryHeader}>
              <Ionicons name="location" size={20} color="#4ade80" />
              <Text style={styles.countryName}>{country.name}</Text>
            </View>
            {country.startDate && country.endDate && (
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color="#888" />
                <Text style={styles.dateText}>
                  {formatDate(country.startDate)} - {formatDate(country.endDate)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {isSaved ? (
          <TouchableOpacity style={styles.editButton} onPress={handleEditTrip}>
            <Ionicons name="create-outline" size={24} color="#0a0a0a" />
            <Text style={styles.buttonText}>Edit Trip</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveTrip}>
            <Ionicons name="save-outline" size={24} color="#0a0a0a" />
            <Text style={styles.buttonText}>Save Trip</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
  },
  tripName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 15,
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ade80',
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
    borderColor: '#2a2a2a',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  countryCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
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
    color: '#ffffff',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 30,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerNumber: {
    position: 'absolute',
    top: 8,
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  markerNumberText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  saveButton: {
    backgroundColor: '#4ade80',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    gap: 10,
  },
  editButton: {
    backgroundColor: '#4ade80',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    gap: 10,
  },
  buttonText: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
