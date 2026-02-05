import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import usePlacePhoto from '../hooks/usePlacePhoto';

export default function HotelCard({ hotelName, countryName, theme, customImageUrl }) {
  // Only fetch from Google Places if no custom URL provided
  const { photoUrl: googlePhotoUrl, loading: fetchingPhoto } = usePlacePhoto(
    customImageUrl ? null : `${hotelName} hotel ${countryName}`,
    200
  );

  // Use custom URL if provided, otherwise use Google Places
  const photoUrl = customImageUrl || googlePhotoUrl;

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const renderImage = () => {
    // Still fetching photo URL from API (only for Google Places)
    if (!customImageUrl && fetchingPhoto) {
      return (
        <View style={[styles.imageLoading, { backgroundColor: theme.cardBackground }]}>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      );
    }

    // No photo found
    if (!photoUrl) {
      return (
        <View style={[styles.placeholder, { backgroundColor: theme.primary }]}>
          <Ionicons name="bed" size={18} color="#fff" />
        </View>
      );
    }

    return (
      <>
        {imageLoading && (
          <View style={[styles.imageLoading, { backgroundColor: theme.cardBackground }]}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        )}
        <Image
          source={{ uri: photoUrl }}
          style={[styles.image, (imageLoading || imageError) && { opacity: 0 }]}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
        {imageError && (
          <View style={[styles.placeholder, { backgroundColor: theme.primary }]}>
            <Ionicons name="bed" size={18} color="#fff" />
          </View>
        )}
      </>
    );
  };

  return (
    <View style={[styles.card, {
      backgroundColor: theme.cardBackground,
      borderColor: theme.border
    }]}>
      <View style={styles.imageContainer}>
        {renderImage()}
      </View>
      <Ionicons name="bed" size={20} color={theme.primary} />
      <Text style={[styles.text, { color: theme.text }]} numberOfLines={2}>
        {hotelName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    gap: 10,
  },
  imageContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    flex: 1,
  },
});
