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

export default function ManageCitiesScreen({ navigation, route }) {
  const [visitedCities, setVisitedCities] = useState(route.params?.visitedCities || []);
  const [newCity, setNewCity] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newYear, setNewYear] = useState('');

  const returnScreen = route.params?.returnScreen || 'YourStats';

  const addCity = () => {
    if (!newCity.trim()) {
      Alert.alert('Error', 'Please enter a city name');
      return;
    }
    if (!newCountry.trim()) {
      Alert.alert('Error', 'Please enter a country name');
      return;
    }

    const newCityData = {
      city: newCity.trim(),
      country: newCountry.trim(),
      date: newYear.trim() || new Date().getFullYear().toString(),
    };

    const updatedCities = [...visitedCities, newCityData];
    setVisitedCities(updatedCities);
    setNewCity('');
    setNewCountry('');
    setNewYear('');

    // Navigate back with updated data
    navigation.navigate(returnScreen, {
      visitedCities: updatedCities,
      completedTrips: route.params?.completedTrips || [],
    });
  };

  const deleteCity = (index) => {
    Alert.alert(
      'Delete City',
      'Are you sure you want to remove this city?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedCities = visitedCities.filter((_, i) => i !== index);
            setVisitedCities(updatedCities);
            navigation.setParams({ visitedCities: updatedCities });
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Cities</Text>
        <Text style={styles.headerSubtitle}>Add cities you've visited in the past</Text>
      </View>

      <View style={styles.addSection}>
        <Text style={styles.sectionTitle}>Add New City</Text>
        <TextInput
          style={styles.input}
          placeholder="City name"
          placeholderTextColor="#666"
          value={newCity}
          onChangeText={setNewCity}
        />
        <TextInput
          style={styles.input}
          placeholder="Country"
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
        <TouchableOpacity style={styles.addButton} onPress={addCity}>
          <Ionicons name="add-circle" size={24} color="#0a0a0a" />
          <Text style={styles.addButtonText}>Add City</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>
          Your Cities ({visitedCities.length})
        </Text>
        {visitedCities.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={60} color="#888" />
            <Text style={styles.emptyText}>No cities added yet</Text>
          </View>
        ) : (
          visitedCities.map((city, index) => (
            <View key={index} style={styles.cityCard}>
              <View style={styles.cityInfo}>
                <Ionicons name="business" size={24} color="#fb923c" />
                <View style={styles.cityDetails}>
                  <Text style={styles.cityName}>{city.city}</Text>
                  <Text style={styles.cityCountry}>{city.country}</Text>
                  <Text style={styles.cityDate}>{city.date}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteCity(index)}>
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
  cityCard: {
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
  cityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  cityDetails: {
    flex: 1,
  },
  cityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  cityCountry: {
    fontSize: 15,
    color: '#4ade80',
    marginBottom: 2,
  },
  cityDate: {
    fontSize: 14,
    color: '#888',
  },
});
