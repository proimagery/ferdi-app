import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../services/amadeus/flightService';

export default function FlightOfferCard({ offer, theme }) {
  const outbound = offer.itineraries?.[0];
  const firstSeg = outbound?.segments?.[0];
  const lastSeg = outbound?.segments?.[outbound.segments.length - 1];

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={styles.routeRow}>
        <Text style={[styles.airport, { color: theme.text }]}>{firstSeg?.departure?.airport}</Text>
        <View style={styles.flightLine}>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
          <Ionicons name="airplane" size={16} color={theme.primary} />
          <View style={[styles.line, { backgroundColor: theme.border }]} />
        </View>
        <Text style={[styles.airport, { color: theme.text }]}>{lastSeg?.arrival?.airport}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: theme.primary }]}>
          ${offer.price?.total}
        </Text>
        <Text style={[styles.currency, { color: theme.textSecondary }]}> {offer.price?.currency}</Text>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {formatDuration(outbound?.duration)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="swap-horizontal" size={14} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {offer.stops === 0 ? 'Direct' : `${offer.stops} stop${offer.stops > 1 ? 's' : ''}`}
          </Text>
        </View>
        {firstSeg?.carrier && (
          <View style={styles.detailItem}>
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              {firstSeg.flightNumber}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.timeRow}>
        <Text style={[styles.timeText, { color: theme.text }]}>
          {formatTime(firstSeg?.departure?.time)} — {formatTime(lastSeg?.arrival?.time)}
        </Text>
        <Text style={[styles.dateText, { color: theme.textSecondary }]}>
          {formatDate(firstSeg?.departure?.time)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  airport: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  flightLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  line: {
    flex: 1,
    height: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  currency: {
    fontSize: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
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
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 13,
  },
});
