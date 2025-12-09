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

export default function CreateTripScreen({ navigation, route }) {
  const [step, setStep] = useState(1);
  const [tripName, setTripName] = useState('');
  const [countries, setCountries] = useState([{ name: '', startDate: '', endDate: '' }]);
  const [budget, setBudget] = useState('');

  const addCountry = () => {
    setCountries([...countries, { name: '', startDate: '', endDate: '' }]);
  };

  const removeCountry = (index) => {
    if (countries.length > 1) {
      setCountries(countries.filter((_, i) => i !== index));
    }
  };

  const updateCountry = (index, field, value) => {
    const newCountries = [...countries];
    newCountries[index][field] = value;
    setCountries(newCountries);
  };

  const handleNext = () => {
    if (step === 1 && !tripName.trim()) {
      Alert.alert('Error', 'Please enter a trip name');
      return;
    }
    if (step === 2) {
      const hasEmptyCountry = countries.some(c => !c.name.trim());
      if (hasEmptyCountry) {
        Alert.alert('Error', 'Please fill in all country names');
        return;
      }
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (!budget.trim() || isNaN(budget)) {
      Alert.alert('Error', 'Please enter a valid budget');
      return;
    }

    const newTrip = {
      name: tripName,
      countries: countries,
      budget: parseFloat(budget),
    };

    const existingTrips = route.params?.trips || [];
    const updatedTrips = [...existingTrips, newTrip];

    navigation.navigate('MyTrips', { trips: updatedTrips });
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              s === step && styles.progressDotActive,
              s < step && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Step 1: Trip Name */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 1: Name Your Trip</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter trip name"
              placeholderTextColor="#666"
              value={tripName}
              onChangeText={setTripName}
            />
          </View>
        )}

        {/* Step 2: Countries */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 2: Add Countries</Text>
            {countries.map((country, index) => (
              <View key={index} style={styles.countryCard}>
                <View style={styles.countryHeader}>
                  <Text style={styles.countryLabel}>Country {index + 1}</Text>
                  {countries.length > 1 && (
                    <TouchableOpacity onPress={() => removeCountry(index)}>
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Country name"
                  placeholderTextColor="#666"
                  value={country.name}
                  onChangeText={(text) => updateCountry(index, 'name', text)}
                />
                <View style={styles.dateRow}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    placeholder="Start date"
                    placeholderTextColor="#666"
                    value={country.startDate}
                    onChangeText={(text) => updateCountry(index, 'startDate', text)}
                  />
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    placeholder="End date"
                    placeholderTextColor="#666"
                    value={country.endDate}
                    onChangeText={(text) => updateCountry(index, 'endDate', text)}
                  />
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addCountry}>
              <Ionicons name="add-circle" size={24} color="#4ade80" />
              <Text style={styles.addButtonText}>Add Another Country</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Budget */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 3: Set Your Budget</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter budget amount"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={budget}
              onChangeText={setBudget}
            />
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, step === 1 && styles.nextButtonFull]}
          onPress={step === 3 ? handleSubmit : handleNext}
        >
          <Text style={styles.nextButtonText}>
            {step === 3 ? 'Create Trip' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  progressDot: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2a2a2a',
  },
  progressDotActive: {
    backgroundColor: '#4ade80',
  },
  progressDotCompleted: {
    backgroundColor: '#4ade80',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
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
  countryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  countryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  countryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInput: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    gap: 10,
  },
  addButtonText: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4ade80',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 2,
  },
  nextButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
