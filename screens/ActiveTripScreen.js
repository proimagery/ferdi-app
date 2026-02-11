import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { countryCoordinates } from '../utils/coordinates';
import { getCountryFlag } from '../utils/countryFlags';
import { getCurrencyInfo } from '../utils/currencyData';
import {
  getActiveTrips,
  getTripProgress,
  getCurrentCountry,
  getStopStatus,
  isLastDay,
} from '../utils/activeTripHelpers';
import ShareableTripCard from '../components/ShareableTripCard';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ActiveTripScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { trips, budgets, savedSpots } = useAppContext();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const confettiRef = useRef(null);
  const shareCardRef = useRef(null);
  const tripMapRef = useRef(null);
  const lastDayAnim = useRef(new Animated.Value(0)).current;

  const [selectedTripIndex, setSelectedTripIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confettiFired, setConfettiFired] = useState(false);
  const [showLastDayMessage, setShowLastDayMessage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get active trips
  const activeTrips = getActiveTrips(trips);
  const trip = route.params?.trip || activeTrips[selectedTripIndex];

  // Pulsing animation for current marker
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Navigate back if trip gets deleted while on this screen
  useEffect(() => {
    if (!trip && navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [trip]);

  // Check for last day celebration
  useEffect(() => {
    if (!trip) return;
    const checkCelebration = async () => {
      if (isLastDay(trip)) {
        // Confetti plays every time on the last day
        setTimeout(() => {
          setConfettiFired(true);
          if (confettiRef.current) confettiRef.current.start();
        }, 500);

        // "Happy Last Day!" message + celebration modal only on first visit
        const key = `@ferdi_celebrated_${trip.id}`;
        const celebrated = await AsyncStorage.getItem(key);
        if (!celebrated) {
          setTimeout(() => {
            setShowLastDayMessage(true);
            Animated.timing(lastDayAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
            setTimeout(() => {
              Animated.timing(lastDayAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
                setShowLastDayMessage(false);
                setShowCelebration(true);
              });
            }, 2000);
          }, 500);
          await AsyncStorage.setItem(key, 'true');
        }
      }
    };
    checkCelebration();
  }, [trip]);

  if (!trip) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="airplane-outline" size={60} color={theme.textSecondary} />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No active trips right now
        </Text>
      </View>
    );
  }

  // Trip progress
  const progress = getTripProgress(trip);
  const currentCountry = getCurrentCountry(trip);
  const stops = getStopStatus(trip);
  const currentCountryName = currentCountry?.country_name || currentCountry?.name || '';

  // Find linked budget
  const linkedBudget = budgets.find(b => b.tripId === trip.id);

  // Build map data
  const completedCoords = [];
  const upcomingCoords = [];
  let lastCompletedCoord = null;

  stops.forEach((stop) => {
    const coords = countryCoordinates[stop.country];
    if (!coords) return;

    if (stop.status === 'completed') {
      completedCoords.push(coords);
      lastCompletedCoord = coords;
    } else if (stop.status === 'current') {
      // Current stop: connect from last completed to current, and current to next upcoming
      if (lastCompletedCoord) completedCoords.push(coords);
      else completedCoords.push(coords);
      upcomingCoords.push(coords);
      lastCompletedCoord = coords;
    } else {
      upcomingCoords.push(coords);
    }
  });

  // Calculate map region
  const allCoords = stops
    .map(s => countryCoordinates[s.country])
    .filter(Boolean);

  let initialRegion = { latitude: 20, longitude: 0, latitudeDelta: 100, longitudeDelta: 100 };

  if (allCoords.length > 0) {
    const lats = allCoords.map(c => c.latitude);
    const lngs = allCoords.map(c => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;
    initialRegion = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latSpan === 0 ? 8 : latSpan * 2.0,
      longitudeDelta: lngSpan === 0 ? 8 : lngSpan * 2.0,
    };
  }

  const handleMapReady = () => {
    if (allCoords.length > 1 && tripMapRef.current) {
      setTimeout(() => {
        tripMapRef.current?.fitToCoordinates(allCoords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: false,
        });
      }, 200);
    }
  };

  // Budget calculations for current country
  const getBudgetData = () => {
    if (!linkedBudget) return null;

    const currencyInfo = getCurrencyInfo(currentCountryName);
    const localCurrency = currencyInfo.currency;
    const localSymbol = currencyInfo.symbol;
    const localRate = currencyInfo.rate;

    // Multi-country budget
    if (linkedBudget.tripType === 'multi' && linkedBudget.countryBreakdowns) {
      const countryBudget = linkedBudget.countryBreakdowns[currentCountryName];
      if (!countryBudget) return null;

      const days = countryBudget.days || 1;
      const dailyTotal = countryBudget.budget / days;
      const dailyAccommodation = (countryBudget.accommodation || 0) / days;
      const categories = (countryBudget.lineItems || []).map(item => ({
        name: item.name,
        icon: item.icon || 'cash-outline',
        dailyUsd: item.total / days,
        dailyLocal: (item.totalLocal || item.total * localRate) / days,
      }));

      return {
        dailyTotalUsd: dailyTotal,
        dailyTotalLocal: dailyTotal * localRate,
        dailyAccommodationUsd: dailyAccommodation,
        dailyAccommodationLocal: dailyAccommodation * localRate,
        categories,
        localCurrency,
        localSymbol,
      };
    }

    // Single-country budget
    const days = linkedBudget.tripDuration || 1;
    const dailyTotal = linkedBudget.totalBudget / days;
    const dailyAccommodation = (linkedBudget.accommodation || 0) / days;
    const budgetAfterAccom = linkedBudget.totalBudget - (linkedBudget.accommodation || 0);
    const categories = (linkedBudget.lineItems || []).map(item => ({
      name: item.name,
      icon: item.icon || 'cash-outline',
      dailyUsd: (budgetAfterAccom * (item.percent || 0) / 100) / days,
      dailyLocal: ((budgetAfterAccom * (item.percent || 0) / 100) / days) * localRate,
    }));

    return {
      dailyTotalUsd: dailyTotal,
      dailyTotalLocal: dailyTotal * localRate,
      dailyAccommodationUsd: dailyAccommodation,
      dailyAccommodationLocal: dailyAccommodation * localRate,
      categories,
      localCurrency,
      localSymbol,
    };
  };

  const budgetData = getBudgetData();

  const formatDate = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return amount.toFixed(2);
  };

  const saveToDevice = async () => {
    if (!shareCardRef.current) return;
    try {
      setIsSaving(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.permissionRequired'), t('editProfile.cameraRollPermission'));
        setIsSaving(false);
        return;
      }
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Ferdi', asset, false);
      setShowShareModal(false);
      Alert.alert(t('common.saved'), t('activeTrip.shareJourney'));
    } catch (error) {
      console.log('Error saving trip card:', error);
      Alert.alert(t('common.error'), t('editProfile.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const shareImage = async () => {
    if (!shareCardRef.current) return;
    try {
      setIsSaving(true);
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your Ferdi trip',
        });
      } else {
        Alert.alert(t('common.error'), t('editProfile.saveError'));
      }
    } catch (error) {
      console.log('Error sharing trip card:', error);
      Alert.alert(t('common.error'), t('editProfile.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Trip selector for multiple active trips */}
        {activeTrips.length > 1 && !route.params?.trip && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tripSelector}>
            {activeTrips.map((t, i) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.tripChip,
                  {
                    backgroundColor: i === selectedTripIndex ? theme.primary : theme.cardBackground,
                    borderColor: i === selectedTripIndex ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setSelectedTripIndex(i)}
              >
                <Text style={[
                  styles.tripChipText,
                  { color: i === selectedTripIndex ? theme.background : theme.text },
                ]}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Trip Header */}
        <View style={styles.headerSection}>
          <View style={styles.tripNameRow}>
            <Text style={[styles.tripName, { color: theme.text }]}>{trip.name}</Text>
            {isLastDay(trip) && (
              <View style={styles.lastDayBadge}>
                <Text style={styles.lastDayBadgeText}>Happy Last Day! 🎉</Text>
              </View>
            )}
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="airplane" size={16} color={theme.primary} />
            <Text style={[styles.headerBadgeText, { color: theme.primary }]}>
              {t('activeTrip.dayOf', { current: progress.daysElapsed, total: progress.totalDays })}
            </Text>
          </View>
        </View>

        {/* ===== SECTION 1: TRIP MAP PROGRESS ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="map" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('activeTrip.tripProgress')}</Text>
          </View>

          {/* Map */}
          {allCoords.length > 0 && (
            <MapView
              ref={tripMapRef}
              style={[styles.map, { borderColor: theme.border }]}
              initialRegion={initialRegion}
              onMapReady={handleMapReady}
              showsUserLocation={false}
              showsMyLocationButton={false}
            >
              {/* Completed route line */}
              {completedCoords.length > 1 && (
                <Polyline
                  coordinates={completedCoords}
                  strokeColor={theme.primary}
                  strokeWidth={4}
                />
              )}
              {/* Upcoming route line */}
              {upcomingCoords.length > 1 && (
                <Polyline
                  coordinates={upcomingCoords}
                  strokeColor="#9ca3af"
                  strokeWidth={2}
                  lineDashPattern={[10, 5]}
                />
              )}
              {/* Markers */}
              {stops.map((stop, idx) => {
                const coords = countryCoordinates[stop.country];
                if (!coords) return null;

                return (
                  <Marker key={idx} coordinate={coords} title={stop.country}>
                    {stop.status === 'current' ? (
                      <Animated.View style={[styles.currentMarker, { backgroundColor: theme.primary, transform: [{ scale: pulseAnim }] }]}>
                        <Ionicons name="navigate" size={18} color="#fff" />
                      </Animated.View>
                    ) : stop.status === 'completed' ? (
                      <View style={[styles.completedMarker, { backgroundColor: theme.primary }]}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    ) : (
                      <View style={[styles.upcomingMarker, { borderColor: '#9ca3af' }]}>
                        <Text style={styles.upcomingMarkerText}>{idx + 1}</Text>
                      </View>
                    )}
                  </Marker>
                );
              })}
            </MapView>
          )}

          {/* Days Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={[styles.progressLabel, { color: theme.text }]}>
                {t('activeTrip.dayOf', { current: progress.daysElapsed, total: progress.totalDays })}
              </Text>
              <Text style={[styles.progressPercent, { color: theme.primary }]}>
                {progress.percentComplete}%
              </Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { backgroundColor: theme.primary, width: `${progress.percentComplete}%` },
                ]}
              />
            </View>
          </View>

          {/* Stop-by-Stop Route Tracker */}
          <View style={styles.stopsTimeline}>
            {stops.map((stop, idx) => (
              <View key={idx} style={styles.timelineRow}>
                {/* Timeline line and dot */}
                <View style={styles.timelineLeft}>
                  {idx > 0 && (
                    <View style={[
                      styles.timelineLine,
                      { backgroundColor: stop.status === 'completed' || stop.status === 'current' ? theme.primary : '#d1d5db' },
                    ]} />
                  )}
                  <View style={[
                    styles.timelineDot,
                    stop.status === 'completed'
                      ? { backgroundColor: theme.primary }
                      : stop.status === 'current'
                        ? { backgroundColor: theme.primary, borderWidth: 3, borderColor: theme.primary + '40' }
                        : { backgroundColor: '#d1d5db' },
                  ]}>
                    {stop.status === 'completed' && (
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    )}
                  </View>
                  {idx < stops.length - 1 && (
                    <View style={[
                      styles.timelineLineBottom,
                      { backgroundColor: stops[idx + 1]?.status === 'completed' || stops[idx + 1]?.status === 'current' ? theme.primary : '#d1d5db' },
                    ]} />
                  )}
                </View>

                {/* Stop info */}
                <View style={[
                  styles.timelineContent,
                  {
                    backgroundColor: stop.status === 'current' ? theme.primary + '10' : 'transparent',
                    borderColor: stop.status === 'current' ? theme.primary + '30' : 'transparent',
                  },
                ]}>
                  <View style={styles.stopRow}>
                    <Text style={styles.stopFlag}>{getCountryFlag(stop.country)}</Text>
                    <View style={styles.stopInfo}>
                      <Text style={[
                        styles.stopName,
                        { color: stop.status === 'upcoming' ? theme.textSecondary : theme.text },
                      ]}>
                        {stop.country}
                      </Text>
                      <Text style={[styles.stopDates, { color: theme.textSecondary }]}>
                        {formatDate(stop.startDate)} - {formatDate(stop.endDate)} · {stop.days} {stop.days === 1 ? 'day' : 'days'}
                      </Text>
                    </View>
                    {stop.status === 'current' && (
                      <View style={[styles.hereTag, { backgroundColor: theme.primary }]}>
                        <Text style={styles.hereTagText}>{t('activeTrip.youAreHere')}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ===== SECTION 2: DAILY BUDGET REFERENCE ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('activeTrip.todaysBudget')}</Text>
          </View>

          {budgetData ? (
            <View style={[styles.budgetCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              {/* Current country header */}
              <View style={styles.budgetCountryHeader}>
                <Text style={styles.budgetCountryFlag}>{getCountryFlag(currentCountryName)}</Text>
                <Text style={[styles.budgetCountryName, { color: theme.text }]}>{currentCountryName}</Text>
              </View>

              {/* Daily total */}
              <View style={[styles.dailyTotalRow, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '20' }]}>
                <Text style={[styles.dailyTotalLabel, { color: theme.text }]}>{t('activeTrip.dailyTotal')}</Text>
                <View style={styles.dailyTotalAmounts}>
                  <Text style={[styles.dailyTotalUsd, { color: theme.primary }]}>
                    ${formatCurrency(budgetData.dailyTotalUsd)} USD
                  </Text>
                  <Text style={[styles.dailyTotalLocal, { color: theme.textSecondary }]}>
                    {budgetData.localSymbol}{formatCurrency(budgetData.dailyTotalLocal)} {budgetData.localCurrency}
                  </Text>
                </View>
              </View>

              {/* Accommodation */}
              {budgetData.dailyAccommodationUsd > 0 && (
                <View style={[styles.budgetRow, { borderBottomColor: theme.border }]}>
                  <View style={styles.budgetRowLeft}>
                    <Ionicons name="bed" size={18} color={theme.textSecondary} />
                    <Text style={[styles.budgetRowLabel, { color: theme.text }]}>{t('activeTrip.accommodation')}</Text>
                  </View>
                  <View style={styles.budgetRowRight}>
                    <Text style={[styles.budgetRowUsd, { color: theme.text }]}>
                      ${formatCurrency(budgetData.dailyAccommodationUsd)}
                    </Text>
                    <Text style={[styles.budgetRowLocal, { color: theme.textSecondary }]}>
                      {budgetData.localSymbol}{formatCurrency(budgetData.dailyAccommodationLocal)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Category rows */}
              {budgetData.categories.map((cat, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.budgetRow,
                    { borderBottomColor: idx < budgetData.categories.length - 1 ? theme.border : 'transparent' },
                  ]}
                >
                  <View style={styles.budgetRowLeft}>
                    <Ionicons name={cat.icon} size={18} color={theme.textSecondary} />
                    <Text style={[styles.budgetRowLabel, { color: theme.text }]}>{cat.name}</Text>
                  </View>
                  <View style={styles.budgetRowRight}>
                    <Text style={[styles.budgetRowUsd, { color: theme.text }]}>
                      ${formatCurrency(cat.dailyUsd)}
                    </Text>
                    <Text style={[styles.budgetRowLocal, { color: theme.textSecondary }]}>
                      {budgetData.localSymbol}{formatCurrency(cat.dailyLocal)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.noBudgetCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Ionicons name="wallet-outline" size={40} color={theme.textSecondary} />
              <Text style={[styles.noBudgetText, { color: theme.textSecondary }]}>
                {t('activeTrip.noBudget')}
              </Text>
              <TouchableOpacity
                style={[styles.createBudgetButton, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('BudgetMaker', { fromTrip: true, tripData: { tripId: trip.id, tripName: trip.name, countries: trip.countries, budget: trip.budget } })}
              >
                <Text style={[styles.createBudgetText, { color: theme.background }]}>
                  {t('activeTrip.createBudget')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ===== SECTION 3: MY PLACES PER COUNTRY ===== */}
        {trip.countries && trip.countries.length > 0 && (
          <View style={[styles.myPlacesContainer, { backgroundColor: theme.primary + '18', borderColor: theme.primary + '40' }]}>
            <View style={styles.myPlacesHeader}>
              <View style={[styles.myPlacesIconCircle, { backgroundColor: theme.primary }]}>
                <Ionicons name="pin" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.myPlacesTitle, { color: theme.text }]}>{t('localMaps.title')}</Text>
                <Text style={[styles.myPlacesSubtitle, { color: theme.textSecondary }]}>
                  {t('localMaps.seeWhileHere')}
                </Text>
              </View>
            </View>

            <View style={[styles.myPlacesCard, { backgroundColor: theme.cardBackground + 'CC', borderColor: theme.primary + '30' }]}>
              {trip.countries.map((country, index) => {
                const cName = country.name || country;
                const countrySpots = savedSpots.filter(s => s.tripId === trip.id && s.countryName === cName);
                const spotCount = countrySpots.length;

                return (
                  <View key={`localmap-${index}`}>
                    {index > 0 && <View style={[styles.myPlacesDivider, { backgroundColor: theme.primary + '20' }]} />}
                    <TouchableOpacity
                      style={styles.myPlacesRow}
                      onPress={() => navigation.navigate('LocalMap', {
                        tripId: trip.id,
                        countryName: cName,
                        countries: trip.countries,
                      })}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.myPlacesFlag}>{getCountryFlag(cName)}</Text>
                      <View style={styles.myPlacesTitleArea}>
                        <Text style={[styles.myPlacesName, { color: theme.text }]}>{cName}</Text>
                        {spotCount > 0 && (
                          <Text style={[styles.myPlacesCount, { color: theme.textSecondary }]}>
                            {spotCount} {t('localMaps.spots')}
                          </Text>
                        )}
                      </View>
                      {spotCount > 0 && (
                        <View style={[styles.myPlacesBadge, { backgroundColor: theme.primary }]}>
                          <Text style={styles.myPlacesBadgeText}>{spotCount}</Text>
                        </View>
                      )}
                      <Ionicons name="chevron-forward" size={20} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: Math.max(insets.bottom, 20) + 20 }} />
      </ScrollView>

      {/* Confetti */}
      {confettiFired && (
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: SCREEN_WIDTH / 2, y: -10 }}
          autoStart={true}
          fadeOut={true}
          fallSpeed={3000}
        />
      )}

      {/* Happy Last Day message */}
      {showLastDayMessage && (
        <Animated.View style={[styles.lastDayOverlay, { opacity: lastDayAnim }]} pointerEvents="none">
          <View style={[styles.lastDayBubble, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.lastDayEmoji}>🎉</Text>
            <Text style={[styles.lastDayText, { color: theme.primary }]}>Happy Last Day!</Text>
            <Text style={styles.lastDayEmoji}>🎉</Text>
          </View>
        </Animated.View>
      )}

      {/* Celebration Modal */}
      <Modal visible={showCelebration} transparent animationType="fade">
        <View style={styles.celebrationOverlay}>
          <View style={[styles.celebrationCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={[styles.celebrationIconCircle, { backgroundColor: '#fbbf2420' }]}>
              <Ionicons name="trophy" size={48} color="#fbbf24" />
            </View>
            <Text style={[styles.celebrationTitle, { color: theme.text }]}>
              {t('activeTrip.tripComplete')}
            </Text>
            <Text style={[styles.celebrationSubtitle, { color: theme.textSecondary }]}>
              {t('activeTrip.congratulations')}
            </Text>

            <View style={styles.celebrationStats}>
              <View style={styles.celebrationStat}>
                <Text style={[styles.celebrationStatValue, { color: theme.primary }]}>
                  {stops.length}
                </Text>
                <Text style={[styles.celebrationStatLabel, { color: theme.textSecondary }]}>
                  {t('activeTrip.countries')}
                </Text>
              </View>
              <View style={styles.celebrationStat}>
                <Text style={[styles.celebrationStatValue, { color: theme.primary }]}>
                  {progress.totalDays}
                </Text>
                <Text style={[styles.celebrationStatLabel, { color: theme.textSecondary }]}>
                  {t('activeTrip.totalDays')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.celebrationButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setShowCelebration(false);
                setShowShareModal(true);
              }}
            >
              <Ionicons name="share-social" size={18} color={theme.background} />
              <Text style={[styles.celebrationButtonText, { color: theme.background }]}>
                {t('activeTrip.shareJourney')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.celebrationCloseButton}
              onPress={() => setShowCelebration(false)}
            >
              <Text style={[styles.celebrationCloseText, { color: theme.textSecondary }]}>
                {t('activeTrip.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Share Trip Card Modal */}
      <Modal
        visible={showShareModal}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.shareModalOverlay}>
          <View style={[styles.shareModalContent, { backgroundColor: theme.background }]}>
            <TouchableOpacity
              style={styles.shareModalClose}
              onPress={() => setShowShareModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>

            <Text style={[styles.shareModalTitle, { color: theme.text }]}>
              {t('activeTrip.shareJourney')}
            </Text>

            <View style={styles.shareCardWrapper}>
              <ShareableTripCard
                ref={shareCardRef}
                trip={trip}
                stops={stops}
                totalDays={progress.totalDays}
                theme={theme}
              />
            </View>

            <View style={styles.shareButtonsRow}>
              <TouchableOpacity
                style={[styles.shareActionButton, { backgroundColor: theme.primary, opacity: isSaving ? 0.5 : 1 }]}
                onPress={saveToDevice}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="download" size={20} color="#fff" />
                    <Text style={styles.shareActionButtonText}>{t('common.saveToPhotos')}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareActionButton, { backgroundColor: '#3b82f6', opacity: isSaving ? 0.5 : 1 }]}
                onPress={shareImage}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="share-social" size={20} color="#fff" />
                    <Text style={styles.shareActionButtonText}>{t('common.share')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },

  // Trip selector
  tripSelector: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tripChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  tripChipText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Header
  headerSection: {
    padding: 20,
    paddingBottom: 8,
    alignItems: 'center',
  },
  tripNameRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  tripName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  lastDayBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  lastDayBadgeText: {
    color: '#1a1a1a',
    fontSize: 17,
    fontWeight: 'bold',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBadgeText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Section
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Map
  map: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Markers
  currentMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  completedMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingMarkerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
  },

  // Progress bar
  progressSection: {
    marginTop: 16,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },

  // Timeline
  stopsTimeline: {
    marginTop: 20,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    width: 32,
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
  },
  timelineLineBottom: {
    width: 2,
    flex: 1,
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 8,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopFlag: {
    fontSize: 24,
    marginRight: 10,
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 15,
    fontWeight: '600',
  },
  stopDates: {
    fontSize: 12,
    marginTop: 2,
  },
  hereTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  hereTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Budget card
  budgetCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  budgetCountryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  budgetCountryFlag: {
    fontSize: 28,
  },
  budgetCountryName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dailyTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  dailyTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  dailyTotalAmounts: {
    alignItems: 'flex-end',
  },
  dailyTotalUsd: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dailyTotalLocal: {
    fontSize: 13,
    marginTop: 2,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  budgetRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  budgetRowLabel: {
    fontSize: 14,
  },
  budgetRowRight: {
    alignItems: 'flex-end',
  },
  budgetRowUsd: {
    fontSize: 14,
    fontWeight: '600',
  },
  budgetRowLocal: {
    fontSize: 12,
    marginTop: 1,
  },

  // My Places
  myPlacesContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  myPlacesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  myPlacesIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myPlacesTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  myPlacesSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  myPlacesCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  myPlacesDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  myPlacesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  myPlacesFlag: {
    fontSize: 24,
  },
  myPlacesTitleArea: {
    flex: 1,
  },
  myPlacesName: {
    fontSize: 16,
    fontWeight: '600',
  },
  myPlacesCount: {
    fontSize: 12,
    marginTop: 1,
  },
  myPlacesBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  myPlacesBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // No budget
  noBudgetCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
    gap: 12,
  },
  noBudgetText: {
    fontSize: 15,
    textAlign: 'center',
  },
  createBudgetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 4,
  },
  createBudgetText: {
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Happy Last Day overlay
  lastDayOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  lastDayBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  lastDayText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  lastDayEmoji: {
    fontSize: 32,
  },

  // Celebration modal
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  celebrationCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
  },
  celebrationIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  celebrationStats: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 24,
  },
  celebrationStat: {
    alignItems: 'center',
  },
  celebrationStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  celebrationStatLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  celebrationButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  celebrationButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  celebrationCloseButton: {
    paddingVertical: 10,
    marginTop: 8,
  },
  celebrationCloseText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Share modal
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  shareModalContent: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  shareModalClose: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  shareModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  shareCardWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shareButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shareActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  shareActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
