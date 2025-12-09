import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ManageCountriesScreen({ navigation, route }) {
  const [completedTrips, setCompletedTrips] = useState(route.params?.completedTrips || []);
  const [newCountry, setNewCountry] = useState('');
  const [newYear, setNewYear] = useState('');

  const returnScreen = route.params?.returnScreen || 'YourStats';

  const addCountry = () => {
    if (!newCountry.trim()) {
      Alert.alert('Error', 'Please enter a country name');
      return;
    }

    const newTrip = {
      country: newCountry.trim(),
      date: newYear.trim() || new Date().getFullYear().toString(),
    };

    const updatedTrips = [...completedTrips, newTrip];
    setCompletedTrips(updatedTrips);
    setNewCountry('');
    setNewYear('');

    // Navigate back with updated data
    navigation.navigate(returnScreen, {
      completedTrips: updatedTrips,
      visitedCities: route.params?.visitedCities || [],
    });
  };

  const deleteCountry = (index) => {
    Alert.alert(
      'Delete Country',
      'Are you sure you want to remove this country?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedTrips = completedTrips.filter((_, i) => i !== index);
            setCompletedTrips(updatedTrips);
            navigation.setParams({ completedTrips: updatedTrips });
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Countries</Text>
        <Text style={styles.headerSubtitle}>Add countries you've visited in the past</Text>
      </View>

      <View style={styles.addSection}>
        <Text style={styles.sectionTitle}>Add New Country</Text>
        <TextInput
          style={styles.input}
          placeholder="Country name"
          placeholderTextColor="#666"
          value={newCountry}
          onChangeText={setNewCountry}
        />
        <TextInput
          style={styles.input}
          placeholder="Year visited (optional)"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={newYear}
          onChangeText={setNewYear}
        />
        <TouchableOpacity style={styles.addButton} onPress={addCountry}>
          <Ionicons name="add-circle" size={24} color="#0a0a0a" />
          <Text style={styles.addButtonText}>Add Country</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>
          Your Countries ({completedTrips.length})
        </Text>
        {completedTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={60} color="#888" />
            <Text style={styles.emptyText}>No countries added yet</Text>
          </View>
        ) : (
          completedTrips.map((trip, index) => (
            <View key={index} style={styles.countryCard}>
              <View style={styles.countryInfo}>
                <Ionicons name="location" size={24} color="#4ade80" />
                <View style={styles.countryDetails}>
                  <Text style={styles.countryName}>{trip.country}</Text>
                  <Text style={styles.countryDate}>{trip.date}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteCountry(index)}>
                <Ionicons name="trash-outline" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
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
  addSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#4ade80',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listSection: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginTop: 10,
  },
  countryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  countryDetails: {
    flex: 1,
  },
  countryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  countryDate: {
    fontSize: 14,
    color: '#888',
  },
});
