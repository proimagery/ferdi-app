import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateTripScreen({ navigation, route }) {
  const editMode = route.params?.editMode || false;
  const editTrip = route.params?.editTrip;
  const editIndex = route.params?.editIndex;

  const [step, setStep] = useState(1);
  const [tripName, setTripName] = useState(editMode ? editTrip.name : '');
  const [countries, setCountries] = useState(
    editMode ? editTrip.countries : [{ name: '', startDate: null, endDate: null }]
  );
  const [budget, setBudget] = useState(editMode ? editTrip.budget.toString() : '');
  const [showDatePicker, setShowDatePicker] = useState({ index: null, type: null });
  const [dropdownVisible, setDropdownVisible] = useState(null);

  // List of all countries
  const allCountries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
    'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
    'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
    'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde',
    'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo',
    'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti',
    'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador',
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala',
    'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland',
    'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan',
    'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos',
    'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
    'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro',
    'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
    'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
    'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
    'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
    'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
    'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
    'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka',
    'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
    'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
    'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
    'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen', 'Zambia', 'Zimbabwe',
  ].sort();

  const selectCountry = (index, country) => {
    const newCountries = [...countries];
    newCountries[index].name = country;
    setCountries(newCountries);
    setDropdownVisible(null);
  };

  const addCountry = () => {
    setCountries([...countries, { name: '', startDate: null, endDate: null }]);
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

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const onDateChange = (event, selectedDate) => {
    const currentIndex = showDatePicker.index;
    const currentType = showDatePicker.type;

    if (Platform.OS === 'android') {
      setShowDatePicker({ index: null, type: null });
      if (event.type === 'set' && selectedDate && currentIndex !== null) {
        updateCountry(currentIndex, currentType, selectedDate);
      }
    } else {
      // iOS
      if (selectedDate && currentIndex !== null) {
        updateCountry(currentIndex, currentType, selectedDate);
      }
    }
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

    const existingTrips = route.params?.trips || [];

    if (editMode) {
      // Update existing trip
      const updatedTrip = {
        ...editTrip,
        name: tripName,
        countries: countries,
        budget: parseFloat(budget),
      };

      const updatedTrips = [...existingTrips];
      updatedTrips[editIndex] = updatedTrip;

      navigation.navigate('TripDetail', {
        trip: updatedTrip,
        trips: updatedTrips,
        tripIndex: editIndex,
        isNewTrip: false
      });
    } else {
      // Create new trip
      const newTrip = {
        id: Date.now().toString(),
        name: tripName,
        countries: countries,
        budget: parseFloat(budget),
      };

      navigation.navigate('TripDetail', {
        trip: newTrip,
        trips: existingTrips,
        isNewTrip: true
      });
    }
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
            <Text style={styles.stepTitle}>
              {editMode ? 'Edit Trip Name' : 'Step 1: Name Your Trip'}
            </Text>
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
            <Text style={styles.stepTitle}>
              {editMode ? 'Edit Countries' : 'Step 2: Add Countries'}
            </Text>
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

                {/* Country Dropdown */}
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setDropdownVisible(dropdownVisible === index ? null : index)}
                >
                  <Text style={country.name ? styles.dropdownButtonTextSelected : styles.dropdownButtonTextPlaceholder}>
                    {country.name || 'Select a country'}
                  </Text>
                  <Ionicons
                    name={dropdownVisible === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#4ade80"
                  />
                </TouchableOpacity>

                {dropdownVisible === index && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                    {allCountries.map((countryName, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.dropdownItem}
                        onPress={() => selectCountry(index, countryName)}
                      >
                        <Text style={styles.dropdownItemText}>{countryName}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {/* Date Pickers */}
                <View style={styles.dateRow}>
                  <TouchableOpacity
                    style={[styles.input, styles.dateInput]}
                    onPress={() => setShowDatePicker({ index, type: 'startDate' })}
                  >
                    <View style={styles.datePickerContent}>
                      <Ionicons name="calendar-outline" size={20} color="#4ade80" />
                      <Text style={country.startDate ? styles.dateText : styles.datePlaceholder}>
                        {country.startDate ? formatDate(country.startDate) : 'Start date'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.input, styles.dateInput]}
                    onPress={() => setShowDatePicker({ index, type: 'endDate' })}
                  >
                    <View style={styles.datePickerContent}>
                      <Ionicons name="calendar-outline" size={20} color="#4ade80" />
                      <Text style={country.endDate ? styles.dateText : styles.datePlaceholder}>
                        {country.endDate ? formatDate(country.endDate) : 'End date'}
                      </Text>
                    </View>
                  </TouchableOpacity>
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
            <Text style={styles.stepTitle}>
              {editMode ? 'Edit Budget' : 'Step 3: Set Your Budget'}
            </Text>
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

      {/* Date Picker Modal */}
      {showDatePicker.index !== null && (
        <DateTimePicker
          value={countries[showDatePicker.index][showDatePicker.type] || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          themeVariant="dark"
        />
      )}

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
            {step === 3 ? (editMode ? 'Update Trip' : 'Create Trip') : 'Next'}
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
  dropdownButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dropdownButtonTextPlaceholder: {
    fontSize: 16,
    color: '#666',
  },
  dropdownButtonTextSelected: {
    fontSize: 16,
    color: '#ffffff',
  },
  dropdownList: {
    maxHeight: 200,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    marginBottom: 15,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#ffffff',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInput: {
    flex: 1,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateText: {
    color: '#ffffff',
    fontSize: 16,
  },
  datePlaceholder: {
    color: '#666',
    fontSize: 16,
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
