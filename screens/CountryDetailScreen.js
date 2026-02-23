import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import CountryHeaderImage from '../components/CountryHeaderImage';
import AttractionCard from '../components/AttractionCard';
import CityCard from '../components/CityCard';
import FlightOfferCard from '../components/FlightOfferCard';
import HotelOfferCard from '../components/HotelOfferCard';
import ActivityCard from '../components/ActivityCard';
import { getCountryFlag } from '../utils/countryFlags';
import countryCities from '../data/countryCities';
import { useTranslation } from 'react-i18next';
import { searchAirports, searchFlights } from '../services/amadeus/flightService';
import { searchHotelsByCity, getHotelOffers } from '../services/amadeus/hotelService';
import { getActivities } from '../services/google/activityService';
import { getBusiestPeriod } from '../services/amadeus/marketInsightsService';
import { clearAmadeusCache } from '../services/amadeus/amadeusApi';

const ferdiLogo = require('../assets/Ferdi-transparent.png');


export default function CountryDetailScreen({ route }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { country } = route.params;

  // Amadeus data states
  const [flightOffers, setFlightOffers] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [showFlights, setShowFlights] = useState(false);
  const [departureInput, setDepartureInput] = useState('');
  const [departureCode, setDepartureCode] = useState('');
  const [airportSuggestions, setAirportSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [arrivalInput, setArrivalInput] = useState('');
  const [arrivalCode, setArrivalCode] = useState('');
  const [arrivalSuggestions, setArrivalSuggestions] = useState([]);
  const [showArrivalSuggestions, setShowArrivalSuggestions] = useState(false);
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 37);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(null); // 'departure' | 'return' | null

  const [hotelOffers, setHotelOffers] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [showHotels, setShowHotels] = useState(false);
  const [hotelCityInput, setHotelCityInput] = useState('');
  const [hotelCityCode, setHotelCityCode] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [activityCityInput, setActivityCityInput] = useState('');
  const [activityCityCoords, setActivityCityCoords] = useState(null);
  const [activityCitySuggestions, setActivityCitySuggestions] = useState([]);
  const [showActivityCitySuggestions, setShowActivityCitySuggestions] = useState(false);

  const [busiestMonths, setBusiestMonths] = useState([]);
  const [busiestLoading, setBusiestLoading] = useState(false);

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

  const getMonthName = (period) => {
    if (!period) return '';
    const month = parseInt(period.split('-')[1], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  };

  // Clear stale cache (from test env) and load busiest period on mount
  useEffect(() => {
    clearAmadeusCache().then(() => loadBusiestPeriod());
  }, []);

  const loadBusiestPeriod = async () => {
    setBusiestLoading(true);
    try {
      // Look up city code from capital
      const capital = country.capital;
      if (!capital) return;
      const airports = await searchAirports(capital);
      const cityCode = airports.find(a => a.type === 'CITY')?.iataCode || airports[0]?.iataCode;
      if (!cityCode) return;

      const data = await getBusiestPeriod(cityCode, '2024');
      setBusiestMonths(data.slice(0, 6));
    } catch (error) {
      console.warn('Busiest period error:', error);
    } finally {
      setBusiestLoading(false);
    }
  };

  const handleDepartureSearch = async (text) => {
    setDepartureInput(text);
    setDepartureCode('');
    setFlightOffers([]);
    setShowFlights(false);

    if (text.length < 2) {
      setAirportSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const results = await searchAirports(text);
    setAirportSuggestions(results.slice(0, 5));
    setShowSuggestions(results.length > 0);
  };

  const selectDepartureAirport = (airport) => {
    setDepartureInput(`${airport.cityName} (${airport.iataCode})`);
    setDepartureCode(airport.iataCode);
    setAirportSuggestions([]);
    setShowSuggestions(false);
  };

  const handleArrivalSearch = async (text) => {
    setArrivalInput(text);
    setArrivalCode('');
    setFlightOffers([]);
    setShowFlights(false);

    if (text.length < 2) {
      setArrivalSuggestions([]);
      setShowArrivalSuggestions(false);
      return;
    }

    const results = await searchAirports(text);
    setArrivalSuggestions(results.slice(0, 5));
    setShowArrivalSuggestions(results.length > 0);
  };

  const selectArrivalAirport = (airport) => {
    setArrivalInput(`${airport.cityName} (${airport.iataCode})`);
    setArrivalCode(airport.iataCode);
    setArrivalSuggestions([]);
    setShowArrivalSuggestions(false);
  };

  const formatDate = (date) => date.toISOString().split('T')[0];
  const formatDateDisplay = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const onFlightDateChange = (event, selectedDate) => {
    const pickerType = showDatePicker;
    if (Platform.OS === 'android') {
      setShowDatePicker(null);
    }
    if (event.type === 'dismissed') {
      setShowDatePicker(null);
      return;
    }
    if (selectedDate) {
      if (pickerType === 'departure') {
        setDepartureDate(selectedDate);
        // If return date is before new departure, push it forward
        if (selectedDate >= returnDate) {
          const newReturn = new Date(selectedDate);
          newReturn.setDate(newReturn.getDate() + 7);
          setReturnDate(newReturn);
        }
      } else {
        setReturnDate(selectedDate);
      }
      setFlightOffers([]);
      setShowFlights(false);
    }
    if (Platform.OS === 'ios') {
      setShowDatePicker(null);
    }
  };

  const handleSearchFlights = async () => {
    if (!departureCode || !arrivalCode) return;

    if (flightOffers.length > 0) {
      setShowFlights(!showFlights);
      return;
    }

    setFlightsLoading(true);
    setShowFlights(true);
    try {
      const depStr = formatDate(departureDate);
      const retStr = formatDate(returnDate);
      const offers = await searchFlights(departureCode, arrivalCode, depStr, 1, retStr);
      setFlightOffers(offers);
    } catch (error) {
      console.warn('Flight search error:', error);
    } finally {
      setFlightsLoading(false);
    }
  };

  const handleHotelCitySearch = async (text) => {
    setHotelCityInput(text);
    setHotelCityCode('');
    setHotelOffers([]);
    setShowHotels(false);

    if (text.length < 2) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      return;
    }

    const results = await searchAirports(text);
    // Filter to cities/airports within this country (flexible match)
    const countryLower = country.name?.toLowerCase() || '';
    const filtered = results.filter(r => {
      const rCountry = r.countryName?.toLowerCase() || '';
      const inCountry = rCountry === countryLower || rCountry.includes(countryLower) || countryLower.includes(rCountry);
      return inCountry;
    });
    // Deduplicate by cityName so we don't show the same city multiple times
    const seen = new Set();
    const unique = filtered.filter(r => {
      const key = r.cityName?.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setCitySuggestions(unique.slice(0, 5));
    setShowCitySuggestions(unique.length > 0);
  };

  const selectHotelCity = (city) => {
    setHotelCityInput(city.cityName);
    setHotelCityCode(city.iataCode);
    setCitySuggestions([]);
    setShowCitySuggestions(false);
  };

  const handleHotelCityFocus = async () => {
    if (hotelCityInput.length > 0 || citySuggestions.length > 0) return;
    // Search using capital and major city names from countryCities data
    const cityNames = [
      country.capital,
      ...(countryCities[country.name] || []).slice(0, 4).map(c => c.name),
    ].filter(Boolean);
    const allResults = [];
    const seen = new Set();
    for (const cityName of cityNames) {
      const results = await searchAirports(cityName);
      const countryLower = country.name?.toLowerCase() || '';
      for (const r of results) {
        const rCountry = r.countryName?.toLowerCase() || '';
        const inCountry = rCountry === countryLower || rCountry.includes(countryLower) || countryLower.includes(rCountry);
        const key = r.cityName?.toLowerCase();
        if (inCountry && !seen.has(key)) {
          seen.add(key);
          allResults.push(r);
        }
      }
      if (allResults.length >= 5) break;
    }
    setCitySuggestions(allResults.slice(0, 5));
    setShowCitySuggestions(allResults.length > 0);
  };

  const handleSearchHotels = async () => {
    if (!hotelCityCode) return;

    if (hotelOffers.length > 0) {
      setShowHotels(!showHotels);
      return;
    }

    setHotelsLoading(true);
    setShowHotels(true);
    try {
      // Find hotels in the selected city (up to 40 candidates)
      const hotels = await searchHotelsByCity(hotelCityCode);

      if (hotels.length > 0) {
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 30);
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 3);
        const checkInStr = checkIn.toISOString().split('T')[0];
        const checkOutStr = checkOut.toISOString().split('T')[0];

        // Run all batches in parallel for speed (API limit: 10 IDs per call)
        const batchSize = 10;
        const maxBatches = 3;
        const batches = [];
        for (let i = 0; i < Math.min(hotels.length, batchSize * maxBatches); i += batchSize) {
          batches.push(hotels.slice(i, i + batchSize).map(h => h.hotelId));
        }

        const results = await Promise.all(
          batches.map(batch => getHotelOffers(batch, checkInStr, checkOutStr))
        );

        const allMerged = results.flat().map(offer => {
          const hotelInfo = hotels.find(h => h.hotelId === offer.hotelId);
          return { ...offer, distance: hotelInfo?.distance, distanceUnit: hotelInfo?.distanceUnit };
        });

        setHotelOffers(allMerged);
      }
    } catch (error) {
      console.warn('Hotel search error:', error);
    } finally {
      setHotelsLoading(false);
    }
  };

  const handleActivityCitySearch = async (text) => {
    setActivityCityInput(text);
    setActivityCityCoords(null);
    setActivities([]);
    setShowActivities(false);

    if (text.length < 2) {
      setActivityCitySuggestions([]);
      setShowActivityCitySuggestions(false);
      return;
    }

    const results = await searchAirports(text);
    // Filter to cities/airports within this country that have coordinates
    const countryLower = country.name?.toLowerCase() || '';
    const filtered = results.filter(r => {
      if (!r.lat || !r.lng) return false;
      const rCountry = r.countryName?.toLowerCase() || '';
      return rCountry === countryLower || rCountry.includes(countryLower) || countryLower.includes(rCountry);
    });
    // Deduplicate by cityName
    const seen = new Set();
    const unique = filtered.filter(r => {
      const key = r.cityName?.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setActivityCitySuggestions(unique.slice(0, 5));
    setShowActivityCitySuggestions(unique.length > 0);
  };

  const selectActivityCity = (city) => {
    setActivityCityInput(city.cityName);
    setActivityCityCoords({ lat: city.lat, lng: city.lng });
    setActivityCitySuggestions([]);
    setShowActivityCitySuggestions(false);
  };

  const handleActivityCityFocus = async () => {
    if (activityCityInput.length > 0 || activityCitySuggestions.length > 0) return;
    // Search using capital and major city names from countryCities data
    const cityNames = [
      country.capital,
      ...(countryCities[country.name] || []).slice(0, 4).map(c => c.name),
    ].filter(Boolean);
    const allResults = [];
    const seen = new Set();
    for (const cityName of cityNames) {
      const results = await searchAirports(cityName);
      const countryLower = country.name?.toLowerCase() || '';
      for (const r of results) {
        if (!r.lat || !r.lng) continue;
        const rCountry = r.countryName?.toLowerCase() || '';
        const inCountry = rCountry === countryLower || rCountry.includes(countryLower) || countryLower.includes(rCountry);
        const key = r.cityName?.toLowerCase();
        if (inCountry && !seen.has(key)) {
          seen.add(key);
          allResults.push(r);
        }
      }
      if (allResults.length >= 5) break;
    }
    setActivityCitySuggestions(allResults.slice(0, 5));
    setShowActivityCitySuggestions(allResults.length > 0);
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

      {/* Flight Prices */}
      <View style={[styles.amadeusContainer, {
        backgroundColor: theme.dark ? 'rgba(52, 211, 153, 0.06)' : 'rgba(52, 211, 153, 0.08)',
        borderColor: theme.dark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(52, 211, 153, 0.3)',
      }]}>
        <View style={styles.subsectionHeader}>
          <Ionicons name="airplane" size={18} color={theme.primary} />
          <Text style={[styles.subsectionTitle, { color: theme.text }]}>Flight Prices</Text>
        </View>

        {/* Departure City */}
        <View style={styles.flightFieldGroup}>
          <Text style={[styles.flightFieldLabel, { color: theme.textSecondary }]}>From</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.airportInput, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                color: theme.text,
              }]}
              placeholder="Departure city or airport..."
              placeholderTextColor={theme.textSecondary}
              value={departureInput}
              onChangeText={handleDepartureSearch}
            />
            {showSuggestions && (
              <View style={[styles.suggestionsDropdown, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              }]}>
                {airportSuggestions.map((airport, index) => (
                  <TouchableOpacity
                    key={airport.iataCode + index}
                    style={[styles.suggestionItem, {
                      borderBottomColor: theme.border,
                      borderBottomWidth: index < airportSuggestions.length - 1 ? 1 : 0,
                    }]}
                    onPress={() => selectDepartureAirport(airport)}
                  >
                    <Ionicons
                      name={airport.type === 'AIRPORT' ? 'airplane' : 'business'}
                      size={16}
                      color={theme.textSecondary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.suggestionName, { color: theme.text }]}>
                        {airport.cityName} ({airport.iataCode})
                      </Text>
                      {airport.countryName ? (
                        <Text style={[styles.suggestionCountry, { color: theme.textSecondary }]}>
                          {airport.name} · {airport.countryName}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Arrival City */}
        <View style={styles.flightFieldGroup}>
          <Text style={[styles.flightFieldLabel, { color: theme.textSecondary }]}>To</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.airportInput, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                color: theme.text,
              }]}
              placeholder={`Arrival city in ${country.name}...`}
              placeholderTextColor={theme.textSecondary}
              value={arrivalInput}
              onChangeText={handleArrivalSearch}
            />
            {showArrivalSuggestions && (
              <View style={[styles.suggestionsDropdown, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              }]}>
                {arrivalSuggestions.map((airport, index) => (
                  <TouchableOpacity
                    key={airport.iataCode + index}
                    style={[styles.suggestionItem, {
                      borderBottomColor: theme.border,
                      borderBottomWidth: index < arrivalSuggestions.length - 1 ? 1 : 0,
                    }]}
                    onPress={() => selectArrivalAirport(airport)}
                  >
                    <Ionicons
                      name={airport.type === 'AIRPORT' ? 'airplane' : 'business'}
                      size={16}
                      color={theme.textSecondary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.suggestionName, { color: theme.text }]}>
                        {airport.cityName} ({airport.iataCode})
                      </Text>
                      {airport.countryName ? (
                        <Text style={[styles.suggestionCountry, { color: theme.textSecondary }]}>
                          {airport.name} · {airport.countryName}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Travel Dates */}
        <View style={styles.flightDatesRow}>
          <View style={[styles.flightFieldGroup, { flex: 1 }]}>
            <Text style={[styles.flightFieldLabel, { color: theme.textSecondary }]}>Depart</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker('departure')}
              style={[styles.datePickerButton, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              }]}
            >
              <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.datePickerText, { color: theme.text }]}>
                {formatDateDisplay(departureDate)}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.flightFieldGroup, { flex: 1 }]}>
            <Text style={[styles.flightFieldLabel, { color: theme.textSecondary }]}>Return</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker('return')}
              style={[styles.datePickerButton, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              }]}
            >
              <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.datePickerText, { color: theme.text }]}>
                {formatDateDisplay(returnDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={showDatePicker === 'departure' ? departureDate : returnDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={showDatePicker === 'return' ? departureDate : new Date()}
            onChange={onFlightDateChange}
            themeVariant="dark"
          />
        )}

        {/* Search Button */}
        <TouchableOpacity
          onPress={handleSearchFlights}
          disabled={!departureCode || !arrivalCode || flightsLoading}
          style={[styles.flightSearchButton, {
            backgroundColor: (departureCode && arrivalCode) ? theme.primary : theme.border,
          }]}
        >
          {flightsLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={styles.flightSearchButtonText}>Search Flights</Text>
            </>
          )}
        </TouchableOpacity>

        {showFlights && (
          <View style={styles.amadeusResults}>
            {flightOffers.length > 0 ? (
              flightOffers.slice(0, 5).map((offer, index) => (
                <FlightOfferCard key={offer.id || index} offer={offer} theme={theme} />
              ))
            ) : !flightsLoading ? (
              <Text style={[styles.noResults, { color: theme.textSecondary }]}>
                No flight offers found. Try different cities or dates.
              </Text>
            ) : null}
          </View>
        )}
      </View>

      {/* Hotels, Tours & Travel Insights */}
      <View style={[styles.amadeusContainer, {
        backgroundColor: theme.dark ? 'rgba(52, 211, 153, 0.06)' : 'rgba(52, 211, 153, 0.08)',
        borderColor: theme.dark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(52, 211, 153, 0.3)',
      }]}>

        {/* Hotel Prices */}
        <View style={styles.amadeusInnerSection}>
        <View style={styles.subsectionHeader}>
          <Ionicons name="bed-outline" size={18} color="#34d399" />
          <Text style={[styles.subsectionTitle, { color: theme.text }]}>Hotel Prices</Text>
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
            {showCitySuggestions && (
              <View style={[styles.suggestionsDropdown, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              }]}>
                {citySuggestions.map((city, index) => (
                  <TouchableOpacity
                    key={city.iataCode + index}
                    style={[styles.suggestionItem, {
                      borderBottomColor: theme.border,
                      borderBottomWidth: index < citySuggestions.length - 1 ? 1 : 0,
                    }]}
                    onPress={() => selectHotelCity(city)}
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
            onPress={handleSearchHotels}
            disabled={!hotelCityCode || hotelsLoading}
            style={[styles.searchFlightButton, {
              backgroundColor: hotelCityCode ? '#34d399' : theme.border,
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
            {hotelOffers.length > 0 ? (
              hotelOffers.map((hotel, index) => (
                <HotelOfferCard key={hotel.hotelId || index} hotel={hotel} theme={theme} />
              ))
            ) : !hotelsLoading ? (
              <Text style={[styles.noResults, { color: theme.textSecondary }]}>
                No hotel offers found. Try a different city.
              </Text>
            ) : null}
          </View>
        )}
        </View>

        {/* Tours & Activities */}
        <View style={styles.amadeusInnerSection}>
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
                    key={city.iataCode + index}
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

        {/* Peak Travel Months */}
        {(busiestMonths.length > 0 || busiestLoading) && (
          <View style={styles.amadeusInnerSection}>
            <View style={styles.subsectionHeader}>
              <Ionicons name="calendar" size={18} color="#fb923c" />
              <Text style={[styles.subsectionTitle, { color: theme.text }]}>Peak Travel Months</Text>
            </View>
          {busiestLoading ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ padding: 10 }} />
          ) : (
            <View style={{ marginTop: 8 }}>
              <View style={styles.monthsGrid}>
                {busiestMonths.map((month, index) => {
                  const score = parseFloat(month.analytics?.travelers) || 0;
                  const maxScore = parseFloat(busiestMonths[0]?.analytics?.travelers) || 1;
                  const barWidth = Math.max((score / maxScore) * 100, 10);
                  return (
                    <View key={index} style={styles.monthRow}>
                      <Text style={[styles.monthName, { color: theme.text }]}>{getMonthName(month.period)}</Text>
                      <View style={[styles.monthBarBg, { backgroundColor: theme.border }]}>
                        <View style={[styles.monthBarFill, {
                          width: `${barWidth}%`,
                          backgroundColor: index === 0 ? '#ef4444' : index < 3 ? '#fb923c' : '#4ade80'
                        }]} />
                      </View>
                      <Text style={[styles.monthLabel, { color: theme.textSecondary }]}>
                        {index === 0 ? 'Busiest' : index < 3 ? 'Busy' : 'Moderate'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
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
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLogo: {
    width: 400,
    height: 120,
  },
});
