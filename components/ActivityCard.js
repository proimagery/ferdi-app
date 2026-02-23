import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ActivityCard({ activity, theme }) {
  const handleBooking = () => {
    if (activity.bookingLink) {
      Linking.openURL(activity.bookingLink);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      {activity.pictures?.[0] && (
        <Image
          source={{ uri: activity.pictures[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
          {activity.name}
        </Text>

        {activity.shortDescription && (
          <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={3}>
            {activity.shortDescription}
          </Text>
        )}

        {activity.address && (
          <Text style={[styles.address, { color: theme.textSecondary }]} numberOfLines={1}>
            {activity.address}
          </Text>
        )}

        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            {activity.rating && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text style={[styles.ratingText, { color: theme.text }]}>
                  {activity.rating}
                  {activity.userRatingCount ? ` (${activity.userRatingCount.toLocaleString()})` : ''}
                </Text>
              </View>
            )}
            {activity.minimumDuration && (
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={13} color={theme.textSecondary} />
                <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                  {activity.minimumDuration}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.priceAndBook}>
            {activity.price?.amount && (
              <Text style={[styles.price, { color: theme.primary }]}>
                ${activity.price.amount}
              </Text>
            )}
            {activity.price?.level && !activity.price?.amount && (
              <Text style={[styles.priceLevel, { color: theme.primary }]}>
                {activity.price.level}
              </Text>
            )}
            {activity.bookingLink && (
              <TouchableOpacity
                onPress={handleBooking}
                style={[styles.bookButton, { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.bookText, { color: theme.background }]}>
                  {activity.price?.amount ? 'Book' : 'View'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  address: {
    fontSize: 12,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  detailText: {
    fontSize: 12,
  },
  priceAndBook: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  priceLevel: {
    fontSize: 15,
    fontWeight: '600',
  },
  bookButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bookText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
