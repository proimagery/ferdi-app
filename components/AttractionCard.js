import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import usePlacePhoto from '../hooks/usePlacePhoto';
import { useTranslation } from 'react-i18next';

export default function AttractionCard({ attractionName, countryName, theme, customImageUrl }) {
  const { t } = useTranslation();
  // Only fetch from Google Places if no custom URL provided
  const { photoUrl: googlePhotoUrl, loading: fetchingPhoto } = usePlacePhoto(
    customImageUrl ? null : `${attractionName} ${countryName}`,
    400
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
          <Ionicons name="image" size={30} color="#fff" />
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
            <Ionicons name="image" size={30} color="#fff" />
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
      <View style={styles.content}>
        <Ionicons name="star" size={20} color="#fbbf24" />
        <Text style={[styles.text, { color: theme.text }]} numberOfLines={2}>
          {attractionName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
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
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontSize: 16,
    flex: 1,
  },
});
