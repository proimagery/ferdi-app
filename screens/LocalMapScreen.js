import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { geocodeAddress, searchPlaces, getPlaceDetails } from '../utils/geocoding';
import { calculateDistance } from '../utils/distanceHelper';
import { getCountryFlag, getCountryCode } from '../utils/countryFlags';
import ThemedAlert from '../components/ThemedAlert';
import usePlacePhoto from '../hooks/usePlacePhoto';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const MAP_HEIGHT = screenHeight * 0.38;

// Spot card with place photo (hook must be at component level)
function SpotPhotoCard({ spot, isHotel, distance, theme, t, onEdit, onDelete }) {
  const { photoUrl, loading: fetchingPhoto } = usePlacePhoto(spot.name, 300);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const renderPhoto = () => {
    if (fetchingPhoto) {
      return (
        <View style={[styles.spotPhotoFallback, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      );
    }
    if (photoUrl && !imgError) {
      return (
        <>
          <Image
            source={{ uri: photoUrl }}
            style={styles.spotPhotoImg}
            resizeMode="cover"
            onLoadStart={() => setImgLoading(true)}
            onLoadEnd={() => setImgLoading(false)}
            onError={() => { setImgError(true); setImgLoading(false); }}
          />
          {imgLoading && (
            <View style={[styles.spotPhotoFallback, { backgroundColor: theme.background, position: 'absolute' }]}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          )}
        </>
      );
    }
    return (
      <View style={[styles.spotPhotoFallback, { backgroundColor: isHotel ? '#fb923c' : theme.primary }]}>
        <Ionicons name={isHotel ? 'bed' : 'location'} size={22} color="#fff" />
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.spotCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      onPress={() => onEdit(spot)}
      activeOpacity={0.7}
    >
      <View style={styles.spotPhotoWrap}>
        {renderPhoto()}
      </View>
      <View style={styles.spotInfo}>
        <Text style={[styles.spotName, { color: theme.text }]} numberOfLines={1}>{spot.name}</Text>
        <Text style={[styles.spotAddress, { color: theme.textSecondary }]} numberOfLines={1}>
          {spot.formattedAddress || spot.address}
        </Text>
        {isHotel && (
          <Text style={[styles.spotLabel, { color: '#fb923c' }]}>{t('localMaps.accommodationSet')}</Text>
        )}
        {!isHotel && distance && (
          <Text style={[styles.spotDistance, { color: theme.primary }]}>
            {distance.miles} mi · {distance.km} km {t('localMaps.fromHotel')}
          </Text>
        )}
        {spot.notes && (
          <Text style={[styles.spotNotes, { color: theme.textSecondary }]} numberOfLines={1}>{spot.notes}</Text>
        )}
      </View>
      <View style={styles.spotActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(spot)}>
          <Ionicons name="create-outline" size={18} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(spot.id)}>
          <Ionicons name="trash-outline" size={18} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function LocalMapScreen({ navigation, route }) {
  const { tripId, countryName, countries = [] } = route.params || {};
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { savedSpots, addSavedSpot, deleteSavedSpot, updateSavedSpot, getSpotsForTripCountry } = useAppContext();
  const mapRef = useRef(null);

  // State
  const [selectedCountry, setSelectedCountry] = useState(countryName || (countries[0]?.name || ''));
  const [showAddModal, setShowAddModal] = useState(false);
  const [spotName, setSpotName] = useState('');
  const [spotAddress, setSpotAddress] = useState('');
  const [isAccommodation, setIsAccommodation] = useState(false);
  const [spotNotes, setSpotNotes] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const searchTimeout = useRef(null);
  const [editingSpot, setEditingSpot] = useState(null);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  // Get spots for the selected country
  const countrySpots = useMemo(() => {
    return getSpotsForTripCountry(tripId, selectedCountry);
  }, [getSpotsForTripCountry, tripId, selectedCountry]);

  // Separate accommodation and regular spots
  const accommodation = useMemo(() => countrySpots.find(s => s.isAccommodation), [countrySpots]);
  const regularSpots = useMemo(() => {
    const spots = countrySpots.filter(s => !s.isAccommodation);
    if (!accommodation) return spots;
    // Sort by distance from accommodation
    return spots.map(spot => ({
      ...spot,
      _distance: calculateDistance(
        accommodation.latitude, accommodation.longitude,
        spot.latitude, spot.longitude
      ),
    })).sort((a, b) => a._distance.miles - b._distance.miles);
  }, [countrySpots, accommodation]);

  // All coordinates for map fitting
  const allCoords = useMemo(() => {
    return countrySpots.map(s => ({ latitude: s.latitude, longitude: s.longitude }));
  }, [countrySpots]);

  // Fit map to markers when spots change
  useEffect(() => {
    if (allCoords.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(allCoords, {
          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
          animated: true,
        });
      }, 300);
    }
  }, [allCoords]);

  // Get spot counts per country for the tab badges
  const getCountrySpotCount = useCallback((cName) => {
    return savedSpots.filter(s => s.tripId === tripId && s.countryName === cName).length;
  }, [savedSpots, tripId]);

  // Default map region when no spots
  const defaultRegion = {
    latitude: 20,
    longitude: 0,
    latitudeDelta: 80,
    longitudeDelta: 80,
  };

  // Debounced place search
  const handleAddressChange = (text) => {
    setSpotAddress(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSearchingPlaces(true);
    searchTimeout.current = setTimeout(async () => {
      const code = getCountryCode(selectedCountry);
      const results = await searchPlaces(text.trim(), code);
      setSuggestions(results);
      setSearchingPlaces(false);
    }, 400);
  };

  const handleSelectSuggestion = async (suggestion) => {
    setSuggestions([]);
    setSpotAddress(suggestion.description);
    // Pre-fill name if empty
    const details = await getPlaceDetails(suggestion.placeId);
    if (details && !spotName.trim()) {
      setSpotName(details.name || '');
    }
  };

  const showAlertMessage = (title, message, type = 'error') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  // ===== ADD SPOT =====
  const handleAddSpot = async () => {
    if (!spotName.trim()) {
      showAlertMessage(t('common.oops'), t('localMaps.spotName') + ' is required');
      return;
    }
    if (!spotAddress.trim()) {
      showAlertMessage(t('common.oops'), t('localMaps.spotAddress') + ' is required');
      return;
    }

    setGeocoding(true);
    const result = await geocodeAddress(spotAddress.trim());
    setGeocoding(false);

    if (!result) {
      showAlertMessage(t('common.oops'), t('localMaps.geocodeError'));
      return;
    }

    // If marking as accommodation, unmark previous one
    if (isAccommodation && accommodation) {
      await updateSavedSpot(accommodation.id, { isAccommodation: false });
    }

    await addSavedSpot({
      tripId,
      countryName: selectedCountry,
      name: spotName.trim(),
      address: spotAddress.trim(),
      formattedAddress: result.formattedAddress,
      latitude: result.latitude,
      longitude: result.longitude,
      isAccommodation,
      notes: spotNotes.trim() || null,
      orderIndex: countrySpots.length,
    });

    // Reset modal
    setSpotName('');
    setSpotAddress('');
    setIsAccommodation(false);
    setSpotNotes('');
    setSuggestions([]);
    setShowAddModal(false);
  };

  // ===== EDIT SPOT =====
  const handleEditSpot = (spot) => {
    setEditingSpot(spot);
    setSpotName(spot.name);
    setSpotAddress(spot.formattedAddress || spot.address || '');
    setIsAccommodation(spot.isAccommodation || false);
    setSpotNotes(spot.notes || '');
    setSuggestions([]);
    setShowAddModal(true);
  };

  const handleSaveEdit = async () => {
    if (!spotName.trim()) {
      showAlertMessage(t('common.oops'), t('localMaps.spotName') + ' is required');
      return;
    }

    const updates = {
      name: spotName.trim(),
      notes: spotNotes.trim() || null,
    };

    // Handle accommodation toggle change
    if (isAccommodation !== editingSpot.isAccommodation) {
      if (isAccommodation && accommodation && accommodation.id !== editingSpot.id) {
        await updateSavedSpot(accommodation.id, { isAccommodation: false });
      }
      updates.isAccommodation = isAccommodation;
    }

    await updateSavedSpot(editingSpot.id, updates);

    // Reset modal
    setEditingSpot(null);
    setSpotName('');
    setSpotAddress('');
    setIsAccommodation(false);
    setSpotNotes('');
    setSuggestions([]);
    setShowAddModal(false);
  };

  const closeModal = () => {
    setEditingSpot(null);
    setSpotName('');
    setSpotAddress('');
    setIsAccommodation(false);
    setSpotNotes('');
    setSuggestions([]);
    setShowAddModal(false);
  };

  // ===== OPEN HOTEL MODAL =====
  const openHotelModal = () => {
    setSpotName('');
    setSpotAddress('');
    setIsAccommodation(true);
    setSpotNotes('');
    setSuggestions([]);
    setEditingSpot(null);
    setShowAddModal(true);
  };

  // ===== DELETE SPOT =====
  const handleDeleteSpot = (spotId) => {
    setDeleteConfirmId(spotId);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteSavedSpot(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // ===== RENDER =====
  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t('localMaps.title')}</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{t('localMaps.subtitle')}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Country Tabs */}
      {countries.length > 1 && (
        <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
            {countries.map((c) => {
              const cName = c.name || c;
              const isActive = cName === selectedCountry;
              const spotCount = getCountrySpotCount(cName);
              return (
                <TouchableOpacity
                  key={cName}
                  style={[
                    styles.tab,
                    { backgroundColor: isActive ? theme.primary + '20' : theme.cardBackground, borderColor: isActive ? theme.primary : theme.border },
                  ]}
                  onPress={() => setSelectedCountry(cName)}
                >
                  <Text style={styles.tabFlag}>{getCountryFlag(cName)}</Text>
                  <Text style={[styles.tabText, { color: isActive ? theme.primary : theme.text }]} numberOfLines={1}>
                    {cName}
                  </Text>
                  {spotCount > 0 && (
                    <View style={[styles.tabBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.tabBadgeText}>{spotCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Map */}
      <View style={[styles.mapContainer, { borderBottomColor: theme.border }]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={allCoords.length > 0 ? undefined : defaultRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {/* Accommodation marker */}
          {accommodation && (
            <Marker
              coordinate={{ latitude: accommodation.latitude, longitude: accommodation.longitude }}
              title={accommodation.name}
              description={t('localMaps.hotel')}
            >
              <View style={styles.accommodationMarker}>
                <Ionicons name="bed" size={16} color="#fff" />
              </View>
            </Marker>
          )}

          {/* Regular spot markers */}
          {regularSpots.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
              title={spot.name}
              description={spot.formattedAddress}
            >
              <View style={[styles.spotMarker, { backgroundColor: theme.primary }]}>
                <Ionicons name="location" size={16} color="#fff" />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Spots List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {/* ===== HOTEL / ACCOMMODATION SECTION ===== */}
        <View style={[styles.hotelSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.hotelSectionHeader}>
            <View style={styles.hotelSectionLeft}>
              <Ionicons name="bed" size={18} color="#fb923c" />
              <Text style={[styles.hotelSectionTitle, { color: theme.text }]}>{t('localMaps.yourAccommodation')}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowInfoTooltip(!showInfoTooltip)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {showInfoTooltip && (
            <View style={[styles.infoTooltip, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}>
              <Ionicons name="navigate-outline" size={14} color={theme.primary} />
              <Text style={[styles.infoTooltipText, { color: theme.primary }]}>{t('localMaps.seeHowFar')}</Text>
            </View>
          )}

          {accommodation ? (
            <SpotPhotoCard
              spot={accommodation}
              isHotel={true}
              theme={theme}
              t={t}
              onEdit={handleEditSpot}
              onDelete={handleDeleteSpot}
            />
          ) : (
            <TouchableOpacity
              style={[styles.addHotelBtn, { borderColor: theme.border, backgroundColor: theme.background }]}
              onPress={openHotelModal}
            >
              <View style={styles.addHotelIcon}>
                <Ionicons name="bed-outline" size={22} color="#fb923c" />
              </View>
              <Text style={[styles.addHotelText, { color: theme.textSecondary }]}>{t('localMaps.addHotel')}</Text>
              <Ionicons name="add-circle-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* ===== SPOTS SECTION ===== */}
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
            {regularSpots.length} {t('localMaps.spots')}
          </Text>
        </View>

        {regularSpots.length === 0 && !accommodation ? (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={60} color={theme.textSecondary + '40'} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>{t('localMaps.noSpotsYet')}</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary + '80' }]}>{t('localMaps.addFirstSpot')}</Text>
          </View>
        ) : (
          regularSpots.map((spot) => (
            <SpotPhotoCard
              key={spot.id}
              spot={spot}
              isHotel={false}
              distance={spot._distance}
              theme={theme}
              t={t}
              onEdit={handleEditSpot}
              onDelete={handleDeleteSpot}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => {
          setIsAccommodation(false);
          setShowAddModal(true);
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Spot Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'flex-end' }}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {editingSpot ? t('localMaps.editSpot') : isAccommodation ? t('localMaps.addHotel') : t('localMaps.addSpot')}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Spot Name */}
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('localMaps.spotName')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder={t('localMaps.spotNamePlaceholder')}
                  placeholderTextColor={theme.textSecondary}
                  value={spotName}
                  onChangeText={setSpotName}
                />

                {/* Address with Autocomplete (only for new spots) */}
                {!editingSpot && (
                  <>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('localMaps.spotAddress')}</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder={t('localMaps.spotAddressPlaceholder')}
                      placeholderTextColor={theme.textSecondary}
                      value={spotAddress}
                      onChangeText={handleAddressChange}
                    />
                    {suggestions.length > 0 && (
                      <View style={[styles.suggestionsContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        {suggestions.map((suggestion, idx) => (
                          <TouchableOpacity
                            key={suggestion.placeId}
                            style={[
                              styles.suggestionRow,
                              idx < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                            ]}
                            onPress={() => handleSelectSuggestion(suggestion)}
                          >
                            <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
                            <Text style={[styles.suggestionText, { color: theme.text }]} numberOfLines={2}>
                              {suggestion.description}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                )}
                {editingSpot && (
                  <Text style={[styles.editAddressHint, { color: theme.textSecondary }]}>
                    {editingSpot.formattedAddress || editingSpot.address}
                  </Text>
                )}

                {/* Notes */}
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('localMaps.notes')}</Text>
                <TextInput
                  style={[styles.input, styles.notesInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder="..."
                  placeholderTextColor={theme.textSecondary}
                  value={spotNotes}
                  onChangeText={setSpotNotes}
                  multiline
                  numberOfLines={3}
                />

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: theme.primary, opacity: geocoding ? 0.7 : 1 }]}
                  onPress={editingSpot ? handleSaveEdit : handleAddSpot}
                  disabled={geocoding}
                >
                  {geocoding ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name={editingSpot ? "checkmark" : "location"} size={20} color="#fff" />
                      <Text style={styles.submitText}>
                        {editingSpot ? t('common.save') : t('localMaps.addSpot')}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Themed Alert */}
      <ThemedAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
        theme={theme}
        type={alertConfig.type}
      />

      {/* Delete Confirmation */}
      <Modal
        visible={deleteConfirmId !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteConfirmId(null)}
      >
        <View style={styles.deleteOverlay}>
          <View style={[styles.deleteDialog, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Ionicons name="trash" size={36} color={theme.danger} />
            <Text style={[styles.deleteTitle, { color: theme.text }]}>{t('localMaps.deleteSpot')}</Text>
            <Text style={[styles.deleteMessage, { color: theme.textSecondary }]}>{t('localMaps.deleteSpotConfirm')}</Text>
            <View style={styles.deleteButtons}>
              <TouchableOpacity
                style={[styles.deleteCancelBtn, { borderColor: theme.border }]}
                onPress={() => setDeleteConfirmId(null)}
              >
                <Text style={[styles.deleteCancelText, { color: theme.text }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteConfirmBtn, { backgroundColor: theme.danger }]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteConfirmText}>{t('common.delete')}</Text>
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
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  // Country Tabs
  tabsContainer: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tabFlag: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 100,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Map
  mapContainer: {
    height: MAP_HEIGHT,
    borderBottomWidth: 1,
  },
  map: {
    flex: 1,
  },
  accommodationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fb923c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  spotMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  // Hotel section
  hotelSection: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  hotelSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  hotelSectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hotelSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoTooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  infoTooltipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addHotelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 10,
  },
  addHotelIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fb923c' + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addHotelText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  // Spot cards
  spotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  spotPhotoWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
  },
  spotPhotoImg: {
    width: '100%',
    height: '100%',
  },
  spotPhotoFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: 15,
    fontWeight: '600',
  },
  spotAddress: {
    fontSize: 12,
    marginTop: 2,
  },
  spotDistance: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  spotLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  spotNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  spotActions: {
    flexDirection: 'column',
    gap: 4,
  },
  actionBtn: {
    padding: 6,
  },
  editAddressHint: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    marginBottom: 20,
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Delete confirmation
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteDialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    padding: 25,
    alignItems: 'center',
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  deleteMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  deleteCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
