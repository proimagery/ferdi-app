import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import usePlacePhoto from '../hooks/usePlacePhoto';
import { useTranslation } from 'react-i18next';

export default function CountryHeaderImage({ countryName, flag, theme, customImageUrl }) {
  const { t } = useTranslation();
  // Only fetch from Google Places if no custom URL provided
  const { photoUrl: googlePhotoUrl, loading: fetchingPhoto } = usePlacePhoto(
    customImageUrl ? null : `${countryName} landmark`,
    800
  );

  // Use custom URL if provided, otherwise use Google Places
  const photoUrl = customImageUrl || googlePhotoUrl;

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Show loading while fetching photo URL (only for Google Places)
  if (!customImageUrl && fetchingPhoto) {
    return (
      <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // If no photo URL found, show fallback
  if (!photoUrl) {
    return (
      <View style={[styles.container, styles.fallback, { backgroundColor: theme.primary }]}>
        <Text style={styles.fallbackFlag}>{flag}</Text>
        <Text style={styles.fallbackText}>{countryName}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {imageLoading && (
        <View style={[styles.loadingContainer, { backgroundColor: theme.cardBackground }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}
      <Image
        source={{ uri: photoUrl }}
        style={[styles.image, imageError && { display: 'none' }]}
        resizeMode="cover"
        onLoadStart={() => setImageLoading(true)}
        onLoadEnd={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
      {imageError && (
        <View style={[styles.fallback, { backgroundColor: theme.primary }]}>
          <Text style={styles.fallbackFlag}>{flag}</Text>
          <Text style={styles.fallbackText}>{countryName}</Text>
        </View>
      )}
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  fallback: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackFlag: {
    fontSize: 60,
  },
  fallbackText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
  },
});
