import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AddCompletedTripScreen({ navigation, route }) {
  const [countryName, setCountryName] = useState('');
  const [visitDate, setVisitDate] = useState('');

  const handleSubmit = () => {
    if (!countryName.trim()) {
      Alert.alert('Error', 'Please enter a country name');
      return;
    }

    const newCompletedTrip = {
      country: countryName,
      date: visitDate || new Date().getFullYear().toString(),
    };

    const existingTrips = route.params?.completedTrips || [];
    const updatedTrips = [...existingTrips, newCompletedTrip];

    navigation.navigate('TravelMapper', { completedTrips: updatedTrips });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4ade80" />
        </View>

        <Text style={styles.title}>Add Completed Trip</Text>
        <Text style={styles.subtitle}>Log a country you've already visited</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Country name"
            placeholderTextColor="#666"
            value={countryName}
            onChangeText={setCountryName}
          />

          <TextInput
            style={styles.input}
            placeholder="Visit year (optional)"
            placeholderTextColor="#666"
            value={visitDate}
            onChangeText={setVisitDate}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Ionicons name="add-circle" size={24} color="#0a0a0a" />
            <Text style={styles.submitButtonText}>Add Trip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
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
  submitButton: {
    backgroundColor: '#4ade80',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
