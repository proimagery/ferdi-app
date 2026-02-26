import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, TextInput, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import CountryHeaderImage from '../components/CountryHeaderImage';
import AttractionCard from '../components/AttractionCard';
import CityCard from '../components/CityCard';
import ActivityCard from '../components/ActivityCard';
import FlightOfferCard from '../components/FlightOfferCard';
import { getCountryFlag } from '../utils/countryFlags';
import countryCities from '../data/countryCities';
import { useTranslation } from 'react-i18next';
import { searchAirports, searchFlights } from '../services/amadeus/flightService';
import { getActivities } from '../services/google/activityService';
import { getHotels } from '../services/google/hotelService';
import { placesPost } from '../services/google/placesApi';
import { getFlightAffiliateLink, getHotelAffiliateLink } from '../utils/affiliateLinks';

const ferdiLogo = require('../assets/Ferdi-transparent.png');


export default function CountryDetailScreen({ route }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { country } = route.params;

  // Flight search states
  const [flightFromInput, setFlightFromInput] = useState('');
  const [flightFromCode, setFlightFromCode] = useState('');
  const [flightFromSuggestions, setFlightFromSuggestions] = useState([]);
  const [showFlightFromSuggestions, setShowFlightFromSuggestions] = useState(false);
  const [flightToInput, setFlightToInput] = useState('');
  const [flightToCode, setFlightToCode] = useState('');
  const [flightToSuggestions, setFlightToSuggestions] = useState([]);
  const [showFlightToSuggestions, setShowFlightToSuggestions] = useState(false);
  const [departDate, setDepartDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [showDepartPicker, setShowDepartPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [flightResults, setFlightResults] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [showFlights, setShowFlights] = useState(false);

  // Hotel search states
  const [hotelCityInput, setHotelCityInput] = useState('');
  const [hotelCitySuggestions, setHotelCitySuggestions] = useState([]);
  const [showHotelCitySuggestions, setShowHotelCitySuggestions] = useState(false);
  const [hotelCityCoords, setHotelCityCoords] = useState(null);
  const [hotelResults, setHotelResults] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [showHotels, setShowHotels] = useState(false);

  // Activity search states
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [activityCityInput, setActivityCityInput] = useState('');
  const [activityCityCoords, setActivityCityCoords] = useState(null);
  const [activityCitySuggestions, setActivityCitySuggestions] = useState([]);
  const [showActivityCitySuggestions, setShowActivityCitySuggestions] = useState(false);

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#4ade80';
    if (rating >= 6) return '#fbbf24';
    if (rating >= 4) return '#fb923c';
    return '#ef4444';
  };

  const getRatingLabel = (rating) => {
    if (rating >= 9) return 'Excellent';
    if (rating >= 7) return 'Very Good';
    if (rating >= 5) return 'Good';
    if (rating >= 3) return 'Fair';
    return 'Poor';
  };

  // Helper: filter local city data by text for a given country
  const filterCities = (text) => {
    const cities = countryCities[country.name] || [];
    const lower = text.toLowerCase();
    const matches = cities.filter(c => c.name.toLowerCase().includes(lower));
    if (country.capital?.toLowerCase().includes(lower)) {
      const alreadyHas = matches.some(c => c.name.toLowerCase() === country.capital.toLowerCase());
      if (!alreadyHas) matches.unshift({ name: country.capital });
    }
    return matches.slice(0, 5).map(c => ({ cityName: c.name }));
  };

  // Helper: get default city suggestions (capital + top cities)
  const getDefaultCitySuggestions = () => {
    const cities = countryCities[country.name] || [];
    const suggestions = [];
    if (country.capital) {
      suggestions.push({ cityName: country.capital });
    }
    for (const c of cities) {
      if (c.name.toLowerCase() !== country.capital?.toLowerCase()) {
        suggestions.push({ cityName: c.name });
      }
      if (suggestions.length >= 5) break;
    }
    return suggestions;
  };

  // Date formatting helper
  const formatDateDisplay = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Flight origin airport handlers (Amadeus airport search)
  const handleFlightFromSearch = async (text) => {
    setFlightFromInput(text);
    setFlightFromCode('');
    setFlightResults([]);
    setShowFlights(false);
    if (text.length < 2) {
      setFlightFromSuggestions([]);
      setShowFlightFromSuggestions(false);
      return;
    }
    try {
      const results = await searchAirports(text);
      setFlightFromSuggestions(results);
      setShowFlightFromSuggestions(results.length > 0);
    } catch {
      setFlightFromSuggestions([]);
      setShowFlightFromSuggestions(false);
    }
  };

  const selectFlightFrom = (airport) => {
    setFlightFromInput(`${airport.cityName} (${airport.iataCode})`);
    setFlightFromCode(airport.iataCode);
    setFlightFromSuggestions([]);
    setShowFlightFromSuggestions(false);
  };

  // Flight destination airport handlers (Amadeus airport search)
  const handleFlightToSearch = async (text) => {
    setFlightToInput(text);
    setFlightToCode('');
    setFlightResults([]);
    setShowFlights(false);
    if (text.length < 2) {
      setFlightToSuggestions([]);
      setShowFlightToSuggestions(false);
      return;
    }
    try {
      const results = await searchAirports(text);
      setFlightToSuggestions(results);
      setShowFlightToSuggestions(results.length > 0);
    } catch {
      setFlightToSuggestions([]);
      setShowFlightToSuggestions(false);
    }
  };

  const selectFlightTo = (airport) => {
    setFlightToInput(`${airport.cityName} (${airport.iataCode})`);
    setFlightToCode(airport.iataCode);
    setFlightToSuggestions([]);
    setShowFlightToSuggestions(false);
  };

  const handleSearchFlights = async () => {
    if (!flightFromCode || !flightToCode || !departDate) return;

    setFlightsLoading(true);
    setShowFlights(true);
    setFlightResults([]);
    try {
      const results = await searchFlights(
        flightFromCode,
        flightToCode,
        formatDateDisplay(departDate),
        1,
        returnDate ? formatDateDisplay(returnDate) : null
      );
      setFlightResults(results);
    } catch (error) {
      console.warn('Flight search error:', error);
    } finally {
      setFlightsLoading(false);
    }
  };

  // Hotel city handlers
  const handleHotelCitySearch = (text) => {
    setHotelCityInput(text);
    setHotelCityCoords(null);
    setHotelResults([]);
    setShowHotels(false);
    if (text.length < 2) {
      setHotelCitySuggestions([]);
      setShowHotelCitySuggestions(false);
      return;
    }
    const matches = filterCities(text);
    setHotelCitySuggestions(matches);
    setShowHotelCitySuggestions(matches.length > 0);
  };

  const handleHotelCityFocus = () => {
    if (hotelCityInput.length > 0 || hotelCitySuggestions.length > 0) return;
    const suggestions = getDefaultCitySuggestions();
    setHotelCitySuggestions(suggestions);
    setShowHotelCitySuggestions(suggestions.length > 0);
  };

  const selectHotelCity = async (city) => {
    setHotelCityInput(city.cityName);
    setHotelCitySuggestions([]);
    setShowHotelCitySuggestions(false);
    setHotelResults([]);
    setShowHotels(false);
    const coords = await geocodeCity(city.cityName);
    setHotelCityCoords(coords);
  };

  const handleSearchHotels = async () => {
    if (!hotelCityCoords) return;

    if (hotelResults.length > 0) {
      setShowHotels(!showHotels);
      return;
    }

    setHotelsLoading(true);
    setShowHotels(true);
    try {
      const data = await getHotels(hotelCityCoords.lat, hotelCityCoords.lng, hotelCityInput);
      setHotelResults(data);
    } catch (error) {
      console.warn('Hotels error:', error);
    } finally {
      setHotelsLoading(false);
    }
  };

  // Geocode a city name using Google Places to get lat/lng
  const geocodeCity = async (cityName) => {
    const result = await placesPost(
      '/places:searchText',
      { textQuery: `${cityName}, ${country.name}`, pageSize: 1 },
      'places.location',
      24 * 60 * 60 * 1000
    );
    const loc = result?.places?.[0]?.location;
    return loc ? { lat: loc.latitude, lng: loc.longitude } : null;
  };

  const handleActivityCitySearch = (text) => {
    setActivityCityInput(text);
    setActivityCityCoords(null);
    setActivities([]);
    setShowActivities(false);

    if (text.length < 2) {
      setActivityCitySuggestions([]);
      setShowActivityCitySuggestions(false);
      return;
    }

    const matches = filterCities(text);
    setActivityCitySuggestions(matches);
    setShowActivityCitySuggestions(matches.length > 0);
  };

  const selectActivityCity = async (city) => {
    setActivityCityInput(city.cityName);
    setActivityCitySuggestions([]);
    setShowActivityCitySuggestions(false);
    const coords = await geocodeCity(city.cityName);
    setActivityCityCoords(coords);
  };

  const handleActivityCityFocus = () => {
    if (activityCityInput.length > 0 || activityCitySuggestions.length > 0) return;
    const suggestions = getDefaultCitySuggestions();
    setActivityCitySuggestions(suggestions);
    setShowActivityCitySuggestions(suggestions.length > 0);
  };

  const handleSearchActivities = async () => {
    if (!activityCityCoords) return;

    if (activities.length > 0) {
      setShowActivities(!showActivities);
      return;
    }

    setActivitiesLoading(true);
    setShowActivities(true);
    try {
      const data = await getActivities(activityCityCoords.lat, activityCityCoords.lng);
      setActivities(data);
    } catch (error) {
      console.warn('Activities error:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <CountryHeaderImage
        countryName={country.name}
        flag={country.flag}
        theme={theme}
        customImageUrl={country.headerImageUrl}
      />
      <View style={styles.header}>
        <View style={styles.countryNameRow}>
          <Text style={[styles.countryName, { color: theme.text }]}>{country.name}</Text>
          <Text style={styles.countryFlag}>{country.flag || getCountryFlag(country.name)}</Text>
        </View>
        <Text style={[styles.continent, { color: theme.primary }]}>{country.continent}</Text>
      </View>

      <View style={[styles.statsCard, {
        backgroundColor: theme.cardBackground,
        borderColor: theme.border
      }]}>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={24} color="#fbbf24" />
          <Text style={[styles.statValue, { color: theme.text }]}>#{country.rank}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('countryDetail.worldRank')}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={24} color={theme.primary} />
          <Text style={[styles.statValue, { color: theme.text }]}>{country.visitors}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('countryDetail.annualVisitors')}</Text>
        </View>
      </View>

      {country.rankings && country.rankings.transportation && typeof country.rankings.transportation === 'number' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('countryDetail.categoryRankings')}</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>{t('countryDetail.categoryRankingsDesc')}</Text>

          <View style={[styles.rankingCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <View style={styles.rankingHeader}>
              <Ionicons name="car" size={24} color="#60a5fa" />
              <Text style={[styles.rankingTitle, { color: theme.text }]}>{t('countryDetail.transportation')}</Text>
            </View>
            <View style={[styles.rankingBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.rankingFill,
                  {
                    width: `${country.rankings.transportation * 10}%`,
                    backgroundColor: getRatingColor(country.rankings.transportation)
                  }
                ]}
              />
            </View>
            <View style={styles.rankingFooter}>
              <Text style={[styles.rankingScore, { color: theme.text }]}>{country.rankings.transportation}/10</Text>
              <Text style={[styles.rankingLabel, { color: getRatingColor(country.rankings.transportation) }]}>
                {getRatingLabel(country.rankings.transportation)}
              </Text>
            </View>
          </View>

          <View style={[styles.rankingCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <View style={styles.rankingHeader}>
              <Ionicons name="restaurant" size={24} color="#f472b6" />
              <Text style={[styles.rankingTitle, { color: theme.text }]}>{t('countryDetail.foodDining')}</Text>
            </View>
            <View style={[styles.rankingBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.rankingFill,
                  {
                    width: `${country.rankings.food * 10}%`,
                    backgroundColor: getRatingColor(country.rankings.food)
                  }
                ]}
              />
            </View>
            <View style={styles.rankingFooter}>
              <Text style={[styles.rankingScore, { color: theme.text }]}>{country.rankings.food}/10</Text>
              <Text style={[styles.rankingLabel, { color: getRatingColor(country.rankings.food) }]}>
                {getRatingLabel(country.rankings.food)}
              </Text>
            </View>
          </View>

          <View style={[styles.rankingCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <View style={styles.rankingHeader}>
              <Ionicons name="camera" size={24} color="#a78bfa" />
              <Text style={[styles.rankingTitle, { color: theme.text }]}>{t('countryDetail.touristActivities')}</Text>
            </View>
            <View style={[styles.rankingBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.rankingFill,
                  {
                    width: `${country.rankings.activities * 10}%`,
                    backgroundColor: getRatingColor(country.rankings.activities)
                  }
                ]}
              />
            </View>
            <View style={styles.rankingFooter}>
              <Text style={[styles.rankingScore, { color: theme.text }]}>{country.rankings.activities}/10</Text>
              <Text style={[styles.rankingLabel, { color: getRatingColor(country.rankings.activities) }]}>
                {getRatingLabel(country.rankings.activities)}
              </Text>
            </View>
          </View>

          <View style={[styles.rankingCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <View style={styles.rankingHeader}>
              <Ionicons name="people" size={24} color="#fb923c" />
              <Text style={[styles.rankingTitle, { color: theme.text }]}>{t('countryDetail.crowdedness')}</Text>
            </View>
            <View style={[styles.rankingBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.rankingFill,
                  {
                    width: `${country.rankings.crowdedness * 10}%`,
                    backgroundColor: getRatingColor(country.rankings.crowdedness)
                  }
                ]}
              />
            </View>
            <View style={styles.rankingFooter}>
              <Text style={[styles.rankingScore, { color: theme.text }]}>{country.rankings.crowdedness}/10</Text>
              <Text style={[styles.rankingLabel, { color: getRatingColor(country.rankings.crowdedness) }]}>
                {getRatingLabel(country.rankings.crowdedness)}
              </Text>
            </View>
            <Text style={[styles.rankingNote, { color: theme.textSecondary }]}>{t('countryDetail.higherLessCrowded')}</Text>
          </View>
        </View>
      )}

      {/* Educational Information Section */}
      {(country.population || country.capital || country.leader || country.language || country.currency) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('countryDetail.educationalInfo')}</Text>
          <View style={[styles.infoCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            {country.population && (
              <View style={styles.infoRow}>
                <Ionicons name="people" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('countryDetail.population')}</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.population}</Text>
                </View>
              </View>
            )}
            {country.capital && (
              <View style={styles.infoRow}>
                <Ionicons name="business" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('countryDetail.capital')}</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.capital}</Text>
                </View>
              </View>
            )}
            {country.leader && (
              <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('countryDetail.leader')}</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.leader}</Text>
                </View>
              </View>
            )}
            {country.language && (
              <View style={styles.infoRow}>
                <Ionicons name="language" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('countryDetail.language')}</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.language}</Text>
                </View>
              </View>
            )}
            {country.currency && (
              <View style={styles.infoRow}>
                <Ionicons name="cash" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('countryDetail.currency')}</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.currency}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Flights */}
      <View style={[styles.amadeusContainer, {
        backgroundColor: theme.dark ? 'rgba(52, 211, 153, 0.06)' : 'rgba(52, 211, 153, 0.08)',
        borderColor: theme.dark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(52, 211, 153, 0.3)',
      }]}>
        <View style={styles.subsectionHeader}>
          <Ionicons name="airplane" size={18} color={theme.primary} />
          <Text style={[styles.subsectionTitle, { color: theme.text }]}>Flights to {country.name}</Text>
        </View>

        <View style={[styles.flightFieldGroup, { zIndex: 20 }]}>
          <Text style={[styles.flightFieldLabel, { color: theme.textSecondary }]}>From</Text>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.airportInput, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                color: theme.text,
              }]}
              placeholder="City or airport code..."
              placeholderTextColor={theme.textSecondary}
              value={flightFromInput}
              onChangeText={handleFlightFromSearch}
            />
            {showFlightFromSuggestions && (
              <View style={[styles.suggestionsDropdown, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                zIndex: 30,
              }]}>
                {flightFromSuggestions.map((airport, index) => (
                  <TouchableOpacity
                    key={airport.iataCode + index}
                    style={[styles.suggestionItem, {
                      borderBottomColor: theme.border,
                      borderBottomWidth: index < flightFromSuggestions.length - 1 ? 1 : 0,
                    }]}
                    onPress={() => selectFlightFrom(airport)}
                  >
                    <Ionicons name="airplane" size={16} color={theme.textSecondary} />
                    <View>
                      <Text style={[styles.suggestionName, { color: theme.text }]}>
                        {airport.cityName} ({airport.iataCode})
                      </Text>
                      <Text style={[styles.suggestionCountry, { color: theme.textSecondary }]}>
                        {airport.name} · {airport.countryName}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={[styles.flightFieldGroup, { zIndex: 10 }]}>
          <Text style={[styles.flightFieldLabel, { color: theme.textSecondary }]}>To</Text>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.airportInput, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                color: theme.text,
              }]}
              placeholder="City or airport code..."
              placeholderTextColor={theme.textSecondary}
              value={flightToInput}
              onChangeText={handleFlightToSearch}
            />
            {showFlightToSuggestions && (
              <View style={[styles.suggestionsDropdown, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                zIndex: 20,
              }]}>
                {flightToSuggestions.map((airport, index) => (
                  <TouchableOpacity
                    key={airport.iataCode + index}
                    style={[styles.suggestionItem, {
                      borderBottomColor: theme.border,
                      borderBottomWidth: index < flightToSuggestions.length - 1 ? 1 : 0,
                    }]}
                    onPress={() => selectFlightTo(airport)}
                  >
                    <Ionicons name="airplane" size={16} color={theme.textSecondary} />
                    <View>
                      <Text style={[styles.suggestionName, { color: theme.text }]}>
                        {airport.cityName} ({airport.iataCode})
                      </Text>
                      <Text style={[styles.suggestionCountry, { color: theme.textSecondary }]}>
                        {airport.name} · {airport.countryName}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={[styles.flightDatesRow, { zIndex: 1 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.flightFieldLabel, { color: theme.textSecondary, marginBottom: 4 }]}>Departure</Text>
            <TouchableOpacity
              style={[styles.datePickerButton, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              }]}
              onPress={() => setShowDepartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.datePickerText, { color: departDate ? theme.text : theme.textSecondary }]}>
                {departDate ? formatDateDisplay(departDate) : 'Select date'}
              </Text>
            </TouchableOpacity>
            {showDepartPicker && (
              <DateTimePicker
                value={departDate || new Date()}
                mode="date"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  setShowDepartPicker(Platform.OS === 'ios');
                  if (date) setDepartDate(date);
                }}
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.flightFieldLabel, { color: theme.textSecondary, marginBottom: 4 }]}>Return</Text>
            <TouchableOpacity
              style={[styles.datePickerButton, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              }]}
              onPress={() => setShowReturnPicker(true)}
            >
              <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.datePickerText, { color: returnDate ? theme.text : theme.textSecondary }]}>
                {returnDate ? formatDateDisplay(returnDate) : 'Select date'}
              </Text>
            </TouchableOpacity>
            {showReturnPicker && (
              <DateTimePicker
                value={returnDate || departDate || new Date()}
                mode="date"
                minimumDate={departDate || new Date()}
                onChange={(event, date) => {
                  setShowReturnPicker(Platform.OS === 'ios');
                  if (date) setReturnDate(date);
                }}
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.flightSearchButton, {
            backgroundColor: (flightFromCode && flightToCode && departDate) ? theme.primary : theme.border,
          }]}
          disabled={!flightFromCode || !flightToCode || !departDate || flightsLoading}
          onPress={handleSearchFlights}
        >
          {flightsLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="search" size={18} color="#fff" />
          )}
          <Text style={styles.flightSearchButtonText}>
            {flightsLoading ? 'Searching...' : 'Search Flights'}
          </Text>
        </TouchableOpacity>

        {showFlights && (
          <View style={styles.amadeusResults}>
            {flightsLoading ? (
              <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 20 }} />
            ) : flightResults.length > 0 ? (
              flightResults.map((offer, index) => (
                <FlightOfferCard
                  key={offer.id || index}
                  offer={offer}
                  theme={theme}
                  departureCode={flightFromCode}
                  arrivalCode={flightToCode}
                />
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <Text style={[styles.noResults, { color: theme.textSecondary, marginBottom: 12 }]}>
                  No flights found for this route.
                </Text>
                <TouchableOpacity
                  style={[styles.flightSearchButton, { backgroundColor: '#003580', paddingHorizontal: 20 }]}
                  onPress={() => Linking.openURL(getFlightAffiliateLink(
                    flightFromCode || null,
                    flightToCode || null,
                    departDate ? formatDateDisplay(departDate) : null,
                    returnDate ? formatDateDisplay(returnDate) : null
                  ))}
                >
                  <Ionicons name="search" size={16} color="#fff" />
                  <Text style={styles.flightSearchButtonText}>Search on Booking.com</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Hotels */}
      <View style={[styles.amadeusContainer, {
        backgroundColor: theme.dark ? 'rgba(52, 211, 153, 0.06)' : 'rgba(52, 211, 153, 0.08)',
        borderColor: theme.dark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(52, 211, 153, 0.3)',
      }]}>
        <View style={styles.subsectionHeader}>
          <Ionicons name="bed-outline" size={18} color="#34d399" />
          <Text style={[styles.subsectionTitle, { color: theme.text }]}>Hotels in {country.name}</Text>
        </View>

        <View style={styles.flightSearchRow}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.airportInput, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                color: theme.text,
              }]}
              placeholder={`City in ${country.name}...`}
              placeholderTextColor={theme.textSecondary}
              value={hotelCityInput}
              onChangeText={handleHotelCitySearch}
              onFocus={handleHotelCityFocus}
            />
            {showHotelCitySuggestions && (
              <View style={[styles.suggestionsDropdown, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              }]}>
                {hotelCitySuggestions.map((city, index) => (
                  <TouchableOpacity
                    key={city.cityName + index}
                    style={[styles.suggestionItem, {
                      borderBottomColor: theme.border,
                      borderBottomWidth: index < hotelCitySuggestions.length - 1 ? 1 : 0,
                    }]}
                    onPress={() => selectHotelCity(city)}
                  >
                    <Ionicons name="bed-outline" size={16} color={theme.textSecondary} />
                    <Text style={[styles.suggestionName, { color: theme.text }]}>
                      {city.cityName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={handleSearchHotels}
            disabled={!hotelCityCoords || hotelsLoading}
            style={[styles.searchFlightButton, {
              backgroundColor: hotelCityCoords ? '#34d399' : theme.border,
            }]}
          >
            {hotelsLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {showHotels && (
          <View style={styles.amadeusResults}>
            {hotelResults.length > 0 ? (
              hotelResults.slice(0, 6).map((hotel, index) => (
                <TouchableOpacity
                  key={hotel.id || index}
                  style={[styles.hotelResultCard, {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  }]}
                  onPress={() => Linking.openURL(getHotelAffiliateLink(hotel.name, hotelCityInput))}
                >
                  {hotel.photo && (
                    <Image
                      source={{ uri: hotel.photo }}
                      style={styles.hotelResultImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.hotelResultContent}>
                    <Text style={[styles.hotelResultName, { color: theme.text }]} numberOfLines={2}>
                      {hotel.name}
                    </Text>
                    {hotel.description && (
                      <Text style={[styles.hotelResultDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                        {hotel.description}
                      </Text>
                    )}
                    {hotel.address && (
                      <Text style={[styles.hotelResultAddress, { color: theme.textSecondary }]} numberOfLines={1}>
                        {hotel.address}
                      </Text>
                    )}
                    <View style={styles.hotelResultBottom}>
                      <View style={styles.hotelResultMeta}>
                        {hotel.rating && (
                          <View style={styles.hotelRatingBadge}>
                            <Ionicons name="star" size={12} color="#fbbf24" />
                            <Text style={[styles.hotelRatingText, { color: theme.text }]}>
                              {hotel.rating}{hotel.userRatingCount ? ` (${hotel.userRatingCount.toLocaleString()})` : ''}
                            </Text>
                          </View>
                        )}
                        {hotel.priceLevel && (
                          <Text style={[styles.hotelPriceLevel, { color: theme.primary }]}>
                            {hotel.priceLevel}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.hotelBookButton, { backgroundColor: '#34d399' }]}>
                        <Text style={styles.hotelBookText}>Book</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : !hotelsLoading ? (
              <Text style={[styles.noResults, { color: theme.textSecondary }]}>
                No hotels found. Try a different city.
              </Text>
            ) : null}
          </View>
        )}
      </View>

      {/* Tours & Activities */}
      <View style={[styles.amadeusContainer, {
        backgroundColor: theme.dark ? 'rgba(139, 92, 246, 0.06)' : 'rgba(139, 92, 246, 0.08)',
        borderColor: theme.dark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.3)',
      }]}>
        <View style={styles.subsectionHeader}>
          <Ionicons name="ticket-outline" size={18} color="#a78bfa" />
          <Text style={[styles.subsectionTitle, { color: theme.text }]}>Tours & Activities</Text>
        </View>

        <View style={styles.flightSearchRow}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.airportInput, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                color: theme.text,
              }]}
              placeholder={`City in ${country.name}...`}
              placeholderTextColor={theme.textSecondary}
              value={activityCityInput}
              onChangeText={handleActivityCitySearch}
              onFocus={handleActivityCityFocus}
            />
            {showActivityCitySuggestions && (
              <View style={[styles.suggestionsDropdown, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              }]}>
                {activityCitySuggestions.map((city, index) => (
                  <TouchableOpacity
                    key={city.cityName + index}
                    style={[styles.suggestionItem, {
                      borderBottomColor: theme.border,
                      borderBottomWidth: index < activityCitySuggestions.length - 1 ? 1 : 0,
                    }]}
                    onPress={() => selectActivityCity(city)}
                  >
                    <Ionicons name="business" size={16} color={theme.textSecondary} />
                    <Text style={[styles.suggestionName, { color: theme.text }]}>
                      {city.cityName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={handleSearchActivities}
            disabled={!activityCityCoords || activitiesLoading}
            style={[styles.searchFlightButton, {
              backgroundColor: activityCityCoords ? '#a78bfa' : theme.border,
            }]}
          >
            {activitiesLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {showActivities && (
          <View style={styles.amadeusResults}>
            {activities.length > 0 ? (
              activities.slice(0, 5).map((activity, index) => (
                <ActivityCard key={activity.id || index} activity={activity} theme={theme} />
              ))
            ) : !activitiesLoading ? (
              <Text style={[styles.noResults, { color: theme.textSecondary }]}>
                No activities found. Try a different city.
              </Text>
            ) : null}
          </View>
        )}
      </View>

      {/* Top Cities Section */}
      {countryCities[country.name] && countryCities[country.name].length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('countryDetail.largestCities')}</Text>
          {countryCities[country.name].map((city, index) => (
            <CityCard
              key={index}
              cityName={city.name}
              countryName={country.name}
              rank={index + 1}
              population={city.population}
              theme={theme}
            />
          ))}
        </View>
      )}

      {country.highlights && country.highlights.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('countryDetail.topAttractions')}</Text>
          {country.highlights.map((highlight, index) => (
            <AttractionCard
              key={index}
              attractionName={highlight}
              countryName={country.name}
              theme={theme}
              customImageUrl={country.attractionImages?.[highlight]}
            />
          ))}
        </View>
      )}

      {/* Transportation Section */}
      {(country.mainAirports || country.mainTrainStations || country.avgFlightCost || country.avgTrainCost) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('countryDetail.transportation')}</Text>

          {country.mainAirports && country.mainAirports.length > 0 && (
            <View style={[styles.infoCard, {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border
            }]}>
              <View style={styles.subsectionHeader}>
                <Ionicons name="airplane" size={18} color={theme.secondary} />
                <Text style={[styles.subsectionTitle, { color: theme.text }]}>{t('countryDetail.mainAirports')}</Text>
              </View>
              {country.mainAirports.map((airport, index) => (
                <Text key={index} style={[styles.listItem, { color: theme.textSecondary }]}>{'\u2022'} {airport}</Text>
              ))}
              {country.avgFlightCost && (
                <Text style={[styles.costInfo, { color: theme.primary }]}>Avg Flight Cost: {country.avgFlightCost}</Text>
              )}
            </View>
          )}

          {country.mainTrainStations && country.mainTrainStations.length > 0 && (
            <View style={[styles.infoCard, {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              marginTop: 15
            }]}>
              <View style={styles.subsectionHeader}>
                <Ionicons name="train" size={18} color={theme.secondary} />
                <Text style={[styles.subsectionTitle, { color: theme.text }]}>{t('countryDetail.mainTrainStations')}</Text>
              </View>
              {country.mainTrainStations.map((station, index) => (
                <Text key={index} style={[styles.listItem, { color: theme.textSecondary }]}>{'\u2022'} {station}</Text>
              ))}
              {country.avgTrainCost && (
                <Text style={[styles.costInfo, { color: theme.primary }]}>Avg Train Cost: {country.avgTrainCost}</Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Travel Tips Section */}
      {(country.bestTimeToVisit || country.visaRequired) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('countryDetail.travelTips')}</Text>
          <View style={[styles.infoCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            {country.bestTimeToVisit && (
              <View style={styles.infoRow}>
                <Ionicons name="sunny" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('countryDetail.bestTimeToVisit')}</Text>
                  <Text style={[styles.infoText, { color: theme.text }]}>{country.bestTimeToVisit}</Text>
                </View>
              </View>
            )}
            {country.visaRequired && (
              <View style={styles.infoRow}>
                <Ionicons name="document-text" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('countryDetail.visaRequirements')}</Text>
                  <Text style={[styles.infoText, { color: theme.text }]}>{country.visaRequired}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  countryName: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  countryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 5,
  },
  countryFlag: {
    fontSize: 36,
  },
  continent: {
    fontSize: 18,
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    justifyContent: 'space-around',
    borderWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    marginTop: -10,
  },
  rankingCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  rankingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankingBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  rankingFill: {
    height: '100%',
    borderRadius: 5,
  },
  rankingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankingScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  rankingNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    gap: 10,
  },
  highlightText: {
    fontSize: 16,
    flex: 1,
  },
  infoCard: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItem: {
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 26,
  },
  costInfo: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginLeft: 26,
  },
  // Amadeus container
  amadeusContainer: {
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  amadeusInnerSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.15)',
    marginTop: 4,
  },
  amadeusResults: {
    marginTop: 10,
  },
  noResults: {
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },
  flightSearchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 10,
  },
  airportInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  suggestionsDropdown: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionCountry: {
    fontSize: 12,
    marginTop: 1,
  },
  searchFlightButton: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flightFieldGroup: {
    marginTop: 10,
  },
  flightFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 2,
  },
  flightDatesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  datePickerText: {
    fontSize: 15,
  },
  flightSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  flightSearchButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  bookingDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  bookingSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#003580',
  },
  bookingSearchButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  // Busiest months styles
  monthsGrid: {
    gap: 8,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monthName: {
    width: 32,
    fontSize: 13,
    fontWeight: '600',
  },
  monthBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  monthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  monthLabel: {
    width: 60,
    fontSize: 11,
    textAlign: 'right',
  },
  // Flight result cards
  // Hotel result cards
  hotelResultCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  hotelResultImage: {
    width: '100%',
    height: 140,
  },
  hotelResultContent: {
    padding: 14,
  },
  hotelResultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  hotelResultDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  hotelResultAddress: {
    fontSize: 12,
    marginBottom: 8,
  },
  hotelResultBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotelResultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hotelRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  hotelRatingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hotelPriceLevel: {
    fontSize: 15,
    fontWeight: '600',
  },
  hotelBookButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  hotelBookText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLogo: {
    width: 400,
    height: 120,
  },
});
