import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import usePlacePhoto from '../hooks/usePlacePhoto';
import { getHotelAffiliateLink } from '../utils/affiliateLinks';

export default function HotelOfferCard({ hotel, theme, city }) {
  const bestOffer = hotel.offers?.[0];
  const { photoUrl, loading: photoLoading } = usePlacePhoto(
    hotel.name ? `${hotel.name} hotel` : null,
    800
  );

  const handlePress = () => {
    const url = getHotelAffiliateLink(hotel.name, city);
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
    >
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
      ) : photoLoading ? (
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.border }]}>
          <ActivityIndicator size="small" color={theme.textSecondary} />
        </View>
      ) : null}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameContainer}>
            <Ionicons name="bed-outline" size={18} color={theme.primary} />
            <Text style={[styles.hotelName, { color: theme.text }]} numberOfLines={2}>
              {hotel.name}
            </Text>
          </View>
          {(bestOffer?.price?.perNight || bestOffer?.price?.total) && (
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: theme.primary }]}>
                ${bestOffer.price.perNight || bestOffer.price.total}
              </Text>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                {bestOffer.price.perNight ? '/night' : 'total'}
              </Text>
            </View>
          )}
        </View>

        {bestOffer && (
          <View style={styles.detailRow}>
            {bestOffer.roomType && (
              <View style={styles.detailItem}>
                <Ionicons name="resize-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                  {bestOffer.roomType}
                </Text>
              </View>
            )}
            {bestOffer.bedType && (
              <View style={styles.detailItem}>
                <Ionicons name="bed-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                  {bestOffer.bedType}
                </Text>
              </View>
            )}
            {bestOffer.price?.total && bestOffer.price?.perNight && (
              <View style={styles.detailItem}>
                <Ionicons name="moon-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                  ${bestOffer.price.total} for {bestOffer.nights || 3} nights
                </Text>
              </View>
            )}
          </View>
        )}

        {bestOffer?.description && (
          <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
            {bestOffer.description}
          </Text>
        )}

        {hotel.distance != null && (
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.distanceText, { color: theme.textSecondary }]}>
              {hotel.distance} {hotel.distanceUnit || 'KM'} from center
            </Text>
          </View>
        )}

        <View style={styles.bookingRow}>
          <Text style={[styles.bookingLabel, { color: '#003580' }]}>Book on Booking.com</Text>
          <Ionicons name="open-outline" size={13} color="#003580" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceLabel: {
    fontSize: 11,
  },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,53,128,0.15)',
  },
  bookingLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
