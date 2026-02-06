import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import AuthPromptModal from '../components/AuthPromptModal';
import SpinningGlobe from '../components/SpinningGlobe';
import { Picker } from '@react-native-picker/picker';
import { countryCoordinates, officialCountryNames } from '../utils/coordinates';
import { presetAvatars } from '../utils/presetAvatars';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { uploadImage, isLocalUri, deleteImage } from '../utils/imageUpload';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function EditProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, completedTrips, visitedCities, trips } = useAppContext();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { checkAuth, showAuthModal, setShowAuthModal, featureMessage } = useAuthGuard();
  const [isUploading, setIsUploading] = useState(false);

  const [name, setName] = useState(profile?.name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [originalUsername, setOriginalUsername] = useState(profile?.username || '');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState('');
  const [location, setLocation] = useState(profile?.location || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [instagram, setInstagram] = useState(profile?.instagram || '');
  const [x, setX] = useState(profile?.x || '');
  const [facebook, setFacebook] = useState(profile?.facebook || '');
  const [youtube, setYoutube] = useState(profile?.youtube || '');
  const [top1, setTop1] = useState(profile?.top1 || '');
  const [top2, setTop2] = useState(profile?.top2 || '');
  const [top3, setTop3] = useState(profile?.top3 || '');
  const [next1, setNext1] = useState(profile?.next1 || '');
  const [next2, setNext2] = useState(profile?.next2 || '');
  const [next3, setNext3] = useState(profile?.next3 || '');
  const [avatar, setAvatar] = useState(profile?.avatar || null);
  const [avatarType, setAvatarType] = useState(profile?.avatarType || 'default');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [travelPhotos, setTravelPhotos] = useState(profile?.travelPhotos || []);
  const [sharedTripMaps, setSharedTripMaps] = useState(profile?.sharedTripMaps || []);
  const debounceTimer = useRef(null);

  // Handle username change without causing input glitches
  const handleUsernameChange = useCallback((text) => {
    const cleanedText = text.replace(/\s/g, '').toLowerCase();
    setUsername(cleanedText);
  }, []);

  // Check username availability when it changes (debounced)
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!username || username === originalUsername) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }

    if (username.length < 3) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setUsernameAvailable(false);
      setUsernameError('Letters, numbers, and underscores only');
      return;
    }

    debounceTimer.current = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 600);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [username, originalUsername]);

  const checkUsernameAvailability = async (usernameToCheck) => {
    setIsCheckingUsername(true);
    setUsernameError('');

    try {
      const { data, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', usernameToCheck)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        setUsernameAvailable(true);
      } else if (data) {
        setUsernameAvailable(false);
        setUsernameError('Username already taken');
      } else {
        setUsernameAvailable(true);
      }
    } catch (err) {
      console.error('Error checking username:', err);
      setUsernameAvailable(true);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const [showTop1Picker, setShowTop1Picker] = useState(false);
  const [showTop2Picker, setShowTop2Picker] = useState(false);
  const [showTop3Picker, setShowTop3Picker] = useState(false);
  const [showNext1Picker, setShowNext1Picker] = useState(false);
  const [showNext2Picker, setShowNext2Picker] = useState(false);
  const [showNext3Picker, setShowNext3Picker] = useState(false);

  const [searchTop1, setSearchTop1] = useState('');
  const [searchTop2, setSearchTop2] = useState('');
  const [searchTop3, setSearchTop3] = useState('');
  const [searchNext1, setSearchNext1] = useState('');
  const [searchNext2, setSearchNext2] = useState('');
  const [searchNext3, setSearchNext3] = useState('');

  const countries = officialCountryNames;

  // Calculate statistics
  const allCountries = [
    ...completedTrips.map(t => t.country),
    ...trips.flatMap(t => t.countries.map(c => c.name))
  ];
  const uniqueCountries = [...new Set(allCountries)];
  const totalCountriesVisited = uniqueCountries.length;
  const totalCitiesVisited = visitedCities.length;
  const totalPlannedTrips = trips.length;
  const worldCountries = 195;
  const worldCoverage = ((totalCountriesVisited / worldCountries) * 100).toFixed(1);

  const handleSave = async () => {
    // Check if guest user is trying to save profile
    if (checkAuth('save your profile')) return;

    // Validate username if changed
    if (username !== originalUsername) {
      if (username.length < 3) {
        Alert.alert('Invalid Username', 'Username must be at least 3 characters.');
        return;
      }
      if (usernameAvailable === false) {
        Alert.alert('Username Taken', 'Please choose a different username.');
        return;
      }
    }

    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to save your profile.');
      return;
    }

    setIsUploading(true);

    try {
      // Upload avatar if it's a local file
      let finalAvatar = avatar;
      if (avatarType === 'custom' && avatar && isLocalUri(avatar)) {
        // Delete old avatar if it exists and is a Supabase URL
        if (profile.avatar && profile.avatar.includes('supabase.co')) {
          console.log('[EditProfile] Deleting old avatar:', profile.avatar);
          await deleteImage(profile.avatar);
        }

        const { url, error } = await uploadImage(avatar, user.id, 'avatar');
        // Only show error if upload actually failed (no URL returned)
        if (!url) {
          Alert.alert('Upload Error', 'Failed to upload profile photo. Please try again.');
          setIsUploading(false);
          return;
        }
        finalAvatar = url;
      }

      // Upload travel photos that are local files
      const uploadedPhotos = [];
      const photosToDelete = [];

      // Find photos that were removed (in old list but not in new list)
      if (profile.travelPhotos && Array.isArray(profile.travelPhotos)) {
        profile.travelPhotos.forEach(oldPhoto => {
          if (oldPhoto.includes('supabase.co') && !travelPhotos.includes(oldPhoto)) {
            photosToDelete.push(oldPhoto);
          }
        });
      }

      // Delete removed photos
      for (const photoUrl of photosToDelete) {
        console.log('[EditProfile] Deleting removed travel photo:', photoUrl);
        await deleteImage(photoUrl);
      }

      // Upload new photos
      for (const photo of travelPhotos) {
        if (isLocalUri(photo)) {
          const { url, error } = await uploadImage(photo, user.id, 'travel');
          // Only skip if upload actually failed (no URL returned)
          if (!url) {
            console.error('Failed to upload travel photo:', error);
            // Continue with other photos even if one fails
            continue;
          }
          uploadedPhotos.push(url);
        } else {
          // Already a cloud URL, keep it
          uploadedPhotos.push(photo);
        }
      }

      updateProfile({
        name,
        username: username.toLowerCase(),
        location,
        bio,
        instagram,
        x,
        facebook,
        youtube,
        top1,
        top2,
        top3,
        next1,
        next2,
        next3,
        avatar: finalAvatar,
        avatarType,
        travelPhotos: uploadedPhotos,
        sharedTripMaps,
      });
      navigation.navigate('Profile');
    } catch (err) {
      console.error('Save profile error:', err);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to select a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      setAvatarType('custom');
      setShowAvatarPicker(false);
    }
  };

  const selectPresetAvatar = (presetId) => {
    setAvatar(presetId);
    setAvatarType('preset');
    setShowAvatarPicker(false);
  };

  const clearAvatar = () => {
    setAvatar(null);
    setAvatarType('default');
    setShowAvatarPicker(false);
  };

  const pickTravelPhoto = async () => {
    if (travelPhotos.length >= 5) {
      Alert.alert('Maximum Reached', 'You can only add up to 5 travel photos.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to select a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setTravelPhotos([...travelPhotos, result.assets[0].uri]);
    }
  };

  const removeTravelPhoto = (index) => {
    setTravelPhotos(travelPhotos.filter((_, i) => i !== index));
  };

  const toggleSharedTrip = (tripIndex) => {
    if (sharedTripMaps.includes(tripIndex)) {
      setSharedTripMaps(sharedTripMaps.filter(i => i !== tripIndex));
    } else {
      setSharedTripMaps([...sharedTripMaps, tripIndex]);
    }
  };

  const getAvatarDisplay = () => {
    if (avatarType === 'custom' && avatar) {
      return <Image source={{ uri: avatar }} style={styles.customAvatar} />;
    } else if (avatarType === 'preset' && avatar) {
      const presetAvatar = presetAvatars.find(a => a.id === avatar);
      if (presetAvatar) {
        return <Text style={styles.presetAvatarLarge}>{presetAvatar.value}</Text>;
      }
    }
    return <Ionicons name="person" size={60} color={theme.primary} />;
  };

  const renderCountryPicker = (value, setValue, visible, setVisible, label, searchText, setSearchText) => {
    const filteredCountries = countries.filter(country =>
      country.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</Text>
        <TouchableOpacity
          style={[styles.pickerButton, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
          onPress={() => setVisible(!visible)}
        >
          <Text style={value ? [styles.pickerButtonText, { color: theme.text }] : [styles.pickerButtonTextPlaceholder, { color: theme.textSecondary }]}>
            {value || 'Select a country'}
          </Text>
          <Ionicons name={visible ? 'chevron-up' : 'chevron-down'} size={20} color={theme.primary} />
        </TouchableOpacity>
        {visible && (
          <View style={[styles.pickerContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Type to search..."
                placeholderTextColor={theme.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="words"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={styles.pickerScroll} nestedScrollEnabled={true}>
              <TouchableOpacity
                style={[styles.pickerItem, { borderBottomColor: theme.border }]}
                onPress={() => {
                  setValue('');
                  setVisible(false);
                  setSearchText('');
                }}
              >
                <Text style={[styles.pickerItemText, { color: theme.textSecondary }]}>Clear selection</Text>
              </TouchableOpacity>
              {filteredCountries.map((country, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.pickerItem, { borderBottomColor: theme.border }]}
                  onPress={() => {
                    setValue(country);
                    setVisible(false);
                    setSearchText('');
                  }}
                >
                  <Text style={[styles.pickerItemText, { color: theme.text }]}>{country}</Text>
                </TouchableOpacity>
              ))}
              {filteredCountries.length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>No countries found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Profile Header */}
        <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}>
          {getAvatarDisplay()}
        </View>
        <TouchableOpacity
          style={[styles.changeAvatarButton, { backgroundColor: theme.primary }]}
          onPress={() => setShowAvatarPicker(!showAvatarPicker)}
        >
          <Ionicons name="camera" size={16} color={theme.background} />
          <Text style={[styles.changeAvatarText, { color: theme.background }]}>Change Photo</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {name || 'Traveler'}
        </Text>
        {location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color={theme.textSecondary} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>{location}</Text>
          </View>
        )}
      </View>

      {/* Avatar Picker Section */}
      {showAvatarPicker && (
        <View style={[styles.avatarPickerSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.avatarPickerTitle, { color: theme.text }]}>Choose Profile Picture</Text>

          {/* Camera Roll Option */}
          <TouchableOpacity
            style={[styles.avatarOption, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
            onPress={pickImageFromGallery}
          >
            <Ionicons name="images" size={24} color={theme.primary} />
            <Text style={[styles.avatarOptionText, { color: theme.text }]}>Choose from Camera Roll</Text>
          </TouchableOpacity>

          {/* Preset Avatars Grid */}
          <Text style={[styles.presetAvatarsLabel, { color: theme.textSecondary }]}>Or choose a preset avatar:</Text>
          <View style={styles.presetAvatarsGrid}>
            {presetAvatars.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetAvatarOption,
                  { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
                  avatar === preset.id && avatarType === 'preset' && { borderColor: theme.primary, borderWidth: 3 }
                ]}
                onPress={() => selectPresetAvatar(preset.id)}
              >
                <Text style={styles.presetAvatarEmoji}>{preset.value}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Clear Avatar Option */}
          {(avatar || avatarType !== 'default') && (
            <TouchableOpacity
              style={[styles.clearAvatarButton, { backgroundColor: theme.error + '20', borderColor: theme.error }]}
              onPress={clearAvatar}
            >
              <Ionicons name="close-circle" size={20} color={theme.error} />
              <Text style={[styles.clearAvatarText, { color: theme.error }]}>Clear Avatar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Basic Info Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>

        {/* Username Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Username</Text>
          <View style={[styles.usernameInputContainer, {
            backgroundColor: theme.inputBackground,
            borderColor: usernameError ? theme.error : usernameAvailable === true ? theme.primary : theme.inputBorder
          }]}>
            <Text style={[styles.atSymbol, { color: theme.primary }]}>@</Text>
            <TextInput
              style={[styles.usernameInput, { color: theme.text }]}
              placeholder="username"
              placeholderTextColor={theme.textSecondary}
              value={username}
              onChangeText={handleUsernameChange}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              maxLength={20}
            />
            <View style={styles.usernameStatus}>
              {isCheckingUsername && <ActivityIndicator size="small" color={theme.primary} />}
              {!isCheckingUsername && usernameAvailable === true && username !== originalUsername && (
                <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
              )}
              {!isCheckingUsername && usernameAvailable === false && (
                <Ionicons name="close-circle" size={20} color={theme.error} />
              )}
            </View>
          </View>
          {usernameError ? (
            <Text style={[styles.usernameErrorText, { color: theme.error }]}>{usernameError}</Text>
          ) : username !== originalUsername && usernameAvailable === true ? (
            <Text style={[styles.usernameSuccessText, { color: theme.primary }]}>Username available!</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Display Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Location</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="Where are you from?"
            placeholderTextColor={theme.textSecondary}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Bio</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="Tell us about yourself..."
            placeholderTextColor={theme.textSecondary}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      {/* Social Media Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Social Media</Text>

        <View style={styles.inputGroup}>
          <View style={styles.socialInputHeader}>
            <Ionicons name="logo-instagram" size={20} color="#E4405F" />
            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginLeft: 8 }]}>Instagram</Text>
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="@username"
            placeholderTextColor={theme.textSecondary}
            value={instagram}
            onChangeText={setInstagram}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.socialInputHeader}>
            <Ionicons name="logo-twitter" size={20} color="#000000" />
            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginLeft: 8 }]}>X (Twitter)</Text>
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="@username"
            placeholderTextColor={theme.textSecondary}
            value={x}
            onChangeText={setX}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.socialInputHeader}>
            <Ionicons name="logo-facebook" size={20} color="#4267B2" />
            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginLeft: 8 }]}>Facebook</Text>
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="@username"
            placeholderTextColor={theme.textSecondary}
            value={facebook}
            onChangeText={setFacebook}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.socialInputHeader}>
            <Ionicons name="logo-youtube" size={20} color="#FF0000" />
            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginLeft: 8 }]}>YouTube</Text>
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="@username"
            placeholderTextColor={theme.textSecondary}
            value={youtube}
            onChangeText={setYoutube}
          />
        </View>
      </View>

      {/* Top 3 Favorites Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>My Top 3 Favorite Countries</Text>

        {renderCountryPicker(top1, setTop1, showTop1Picker, setShowTop1Picker, '1st Favorite', searchTop1, setSearchTop1)}
        {renderCountryPicker(top2, setTop2, showTop2Picker, setShowTop2Picker, '2nd Favorite', searchTop2, setSearchTop2)}
        {renderCountryPicker(top3, setTop3, showTop3Picker, setShowTop3Picker, '3rd Favorite', searchTop3, setSearchTop3)}

        {(top1 || top2 || top3) && (
          <View style={styles.favoritesDisplay}>
            {top1 && (
              <View style={[styles.favoriteChip, { backgroundColor: theme.cardBackground, borderColor: '#FFD700' }]}>
                <Text style={styles.favoriteRank}>🥇</Text>
                <Text style={[styles.favoriteCountry, { color: theme.text }]}>{top1}</Text>
              </View>
            )}
            {top2 && (
              <View style={[styles.favoriteChip, { backgroundColor: theme.cardBackground, borderColor: '#C0C0C0' }]}>
                <Text style={styles.favoriteRank}>🥈</Text>
                <Text style={[styles.favoriteCountry, { color: theme.text }]}>{top2}</Text>
              </View>
            )}
            {top3 && (
              <View style={[styles.favoriteChip, { backgroundColor: theme.cardBackground, borderColor: '#CD7F32' }]}>
                <Text style={styles.favoriteRank}>🥉</Text>
                <Text style={[styles.favoriteCountry, { color: theme.text }]}>{top3}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Next Destinations Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Next 3 Places I Want to Visit</Text>

        {renderCountryPicker(next1, setNext1, showNext1Picker, setShowNext1Picker, '1st Destination', searchNext1, setSearchNext1)}
        {renderCountryPicker(next2, setNext2, showNext2Picker, setShowNext2Picker, '2nd Destination', searchNext2, setSearchNext2)}
        {renderCountryPicker(next3, setNext3, showNext3Picker, setShowNext3Picker, '3rd Destination', searchNext3, setSearchNext3)}

        {(next1 || next2 || next3) && (
          <View style={styles.nextDisplay}>
            {next1 && (
              <View style={[styles.nextChip, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}>
                <Ionicons name="airplane" size={16} color={theme.primary} />
                <Text style={[styles.nextCountry, { color: theme.text }]}>{next1}</Text>
              </View>
            )}
            {next2 && (
              <View style={[styles.nextChip, { backgroundColor: theme.secondary + '20', borderColor: theme.secondary }]}>
                <Ionicons name="airplane" size={16} color={theme.secondary} />
                <Text style={[styles.nextCountry, { color: theme.text }]}>{next2}</Text>
              </View>
            )}
            {next3 && (
              <View style={[styles.nextChip, { backgroundColor: theme.orange + '20', borderColor: theme.orange }]}>
                <Ionicons name="airplane" size={16} color={theme.orange} />
                <Text style={[styles.nextCountry, { color: theme.text }]}>{next3}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Travel Stats Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Stats</Text>

        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Ionicons name="flag" size={32} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{totalCountriesVisited}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Countries</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Ionicons name="business" size={32} color={theme.secondary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{totalCitiesVisited}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Cities</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Ionicons name="calendar" size={32} color={theme.orange} />
            <Text style={[styles.statValue, { color: theme.text }]}>{totalPlannedTrips}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Planned</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Ionicons name="earth" size={32} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{worldCoverage}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>World</Text>
          </View>
        </View>
      </View>

      {/* Travel Photos Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Photos (Max 5)</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Share your favorite travel moments on your profile
        </Text>

        <View style={styles.photosManageGrid}>
          {travelPhotos.map((photo, index) => (
            <View key={index} style={[styles.photoManageCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Image source={{ uri: photo }} style={styles.photoManageImage} />
              <TouchableOpacity
                style={[styles.removePhotoButton, { backgroundColor: theme.danger }]}
                onPress={() => removeTravelPhoto(index)}
              >
                <Ionicons name="close" size={16} color={theme.background} />
              </TouchableOpacity>
            </View>
          ))}

          {travelPhotos.length < 5 && (
            <TouchableOpacity
              style={[styles.addPhotoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={pickTravelPhoto}
            >
              <Ionicons name="add-circle" size={40} color={theme.primary} />
              <Text style={[styles.addPhotoText, { color: theme.textSecondary }]}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Shared Trips Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Share Trips on Profile</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Select which trips to display on your profile
        </Text>

        <TouchableOpacity
          style={[styles.manageTripsButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('MyTrips', { sharingMode: true })}
        >
          <Ionicons name="map" size={20} color={theme.background} />
          <Text style={[styles.manageTripsButtonText, { color: theme.background }]}>
            Select Trips to Share ({sharedTripMaps.length} selected)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary, opacity: isUploading ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <ActivityIndicator size="small" color={theme.background} />
              <Text style={[styles.saveButtonText, { color: theme.background }]}>Uploading Photos...</Text>
            </>
          ) : (
            <>
              <Ionicons name="save" size={24} color={theme.background} />
              <Text style={[styles.saveButtonText, { color: theme.background }]}>Save Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Spinning Globe Section */}
      <View style={styles.globeSection}>
        <View style={styles.globeHeader}>
          <Ionicons name="earth" size={24} color={theme.primary} />
          <Text style={[styles.globeTitle, { color: theme.text }]}>Your Travel Journey</Text>
        </View>
        <Text style={[styles.globeSubtitle, { color: theme.textSecondary }]}>
          {completedTrips.length + visitedCities.length > 0
            ? `${completedTrips.length} ${completedTrips.length === 1 ? 'country' : 'countries'} • ${visitedCities.length} ${visitedCities.length === 1 ? 'city' : 'cities'}`
            : 'Add countries and cities to see them on your globe'}
        </Text>
        <SpinningGlobe completedTrips={completedTrips} visitedCities={visitedCities} />
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
      </View>
      </ScrollView>

      {/* Auth Prompt Modal for Guests */}
      <AuthPromptModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        feature={featureMessage}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    marginBottom: 15,
    overflow: 'hidden',
  },
  customAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  presetAvatarLarge: {
    fontSize: 60,
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  avatarPickerSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
  },
  avatarPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  avatarOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 15,
  },
  avatarOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  presetAvatarsLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  presetAvatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  presetAvatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetAvatarEmoji: {
    fontSize: 32,
  },
  clearAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  clearAvatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    fontSize: 16,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  usernameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  atSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
  },
  usernameInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  usernameStatus: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usernameErrorText: {
    fontSize: 12,
    marginTop: 5,
  },
  usernameSuccessText: {
    fontSize: 12,
    marginTop: 5,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  socialInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 16,
  },
  pickerButtonTextPlaceholder: {
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 8,
    maxHeight: 250,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 5,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
  pickerItemText: {
    fontSize: 16,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  favoritesDisplay: {
    marginTop: 15,
    gap: 10,
  },
  favoriteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  favoriteRank: {
    fontSize: 24,
  },
  favoriteCountry: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextDisplay: {
    marginTop: 15,
    gap: 10,
  },
  nextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  nextCountry: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 15,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    gap: 10,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  globeSection: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  globeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  globeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  globeSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  photosManageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoManageCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  photoManageImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  tripsCheckboxList: {
    gap: 10,
  },
  tripCheckboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  tripCheckboxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tripCheckboxInfo: {
    flex: 1,
  },
  tripCheckboxCountry: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  tripCheckboxDate: {
    fontSize: 14,
  },
  manageTripsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  manageTripsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
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
