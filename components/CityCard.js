import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import usePlacePhoto from '../hooks/usePlacePhoto';

export default function CityCard({ cityName, countryName, rank, population, theme }) {
  const { photoUrl, loading: fetchingPhoto } = usePlacePhoto(
    `${cityName} ${countryName} city`,
    400
  );

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const renderImage = () => {
    if (fetchingPhoto) {
      return (
        <View style={[styles.imageLoading, { backgroundColor: theme.cardBackground }]}>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      );
    }

    if (!photoUrl) {
      return (
        <View style={[styles.placeholder, { backgroundColor: theme.primary }]}>
          <Ionicons name="business" size={24} color="#fff" />
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
            <Ionicons name="business" size={24} color="#fff" />
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
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.cityName, { color: theme.text }]} numberOfLines={1}>
          {cityName}
        </Text>
        <Text style={[styles.population, { color: theme.textSecondary }]}>
          {population.toLocaleString()} pop.
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
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
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
    justifyContent: 'center',
  },
  cityName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  population: {
    fontSize: 13,
  },
});
