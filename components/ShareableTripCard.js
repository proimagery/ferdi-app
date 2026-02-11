import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { countryCoordinates } from '../utils/coordinates';
import { getCountryFlag } from '../utils/countryFlags';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = Math.min(screenWidth - 40, 380);
const CARD_HEIGHT = CARD_WIDTH * 1.25;
const MAP_HEIGHT = CARD_HEIGHT * 0.40;

const GOOGLE_MAPS_API_KEY = 'AIzaSyBtzMruCCMpiFfqfdhLtoHWfSk3TZ5UvJ8';
const MARKER_COLORS = ['red', 'blue', 'green', 'orange', 'purple', 'pink', 'yellow', 'white'];

const ferdiIcon = require('../assets/ferdi icon.png');

const ShareableTripCard = forwardRef(({ trip, stops, totalDays, theme }, ref) => {
  // Build Google Static Maps URL with route
  const mapUrl = (() => {
    const coords = stops
      .map(s => countryCoordinates[s.country])
      .filter(Boolean);

    if (coords.length === 0) return null;

    const baseParams = [
      'center=20,0',
      'zoom=1',
      `size=600x340`,
      'scale=2',
      'maptype=roadmap',
    ];

    const styleParams = [
      'style=feature:water|color:0x0a1929',
      'style=feature:landscape|color:0x1a3a2a',
      'style=feature:administrative.country|element:geometry.stroke|color:0x4ade80|weight:1',
      'style=feature:all|element:labels|visibility:off',
    ];

    const markerParts = coords.slice(0, 15).map((c, i) => {
      const color = MARKER_COLORS[i % MARKER_COLORS.length];
      return `markers=color:${color}%7Csize:small%7C${c.latitude},${c.longitude}`;
    });

    // Path line connecting stops
    const pathCoords = coords.map(c => `${c.latitude},${c.longitude}`).join('|');
    const pathParam = coords.length > 1 ? [`path=color:0x4ade80ff|weight:3|${pathCoords}`] : [];

    const allParams = [...baseParams, ...styleParams, ...markerParts, ...pathParam, `key=${GOOGLE_MAPS_API_KEY}`];
    return `https://maps.googleapis.com/maps/api/staticmap?${allParams.join('&')}`;
  })();

  const formatDateRange = () => {
    if (stops.length === 0) return '';
    const first = stops[0].startDate;
    const last = stops[stops.length - 1].endDate;
    const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fmt(first)} - ${fmt(last)}`;
  };

  return (
    <View ref={ref} style={[styles.card, { backgroundColor: '#0a1929' }]} collapsable={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={ferdiIcon} style={styles.ferdiIcon} resizeMode="contain" />
          <Text style={styles.headerBrand}>FERDI</Text>
        </View>
        <Text style={styles.headerLabel}>Journey Complete</Text>
      </View>

      {/* Trip Name */}
      <View style={styles.tripNameSection}>
        <Text style={styles.tripName} numberOfLines={1}>{trip.name}</Text>
        <Text style={styles.dateRange}>{formatDateRange()}</Text>
      </View>

      {/* Map */}
      {mapUrl && (
        <View style={styles.mapContainer}>
          <Image
            source={{ uri: mapUrl }}
            style={styles.mapImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Flags row */}
      <View style={styles.flagsRow}>
        {stops.slice(0, 8).map((stop, i) => (
          <Text key={i} style={styles.flag}>{getCountryFlag(stop.country)}</Text>
        ))}
        {stops.length > 8 && (
          <Text style={styles.moreFlags}>+{stops.length - 8}</Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{stops.length}</Text>
          <Text style={styles.statLabel}>Countries</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalDays}</Text>
          <Text style={styles.statLabel}>Days</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{stops.length}</Text>
          <Text style={styles.statLabel}>Stops</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>ferdi-app.com</Text>
      </View>
    </View>
  );
});

ShareableTripCard.displayName = 'ShareableTripCard';
export default ShareableTripCard;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ferdiIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  headerBrand: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerLabel: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '600',
  },
  tripNameSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  tripName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateRange: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  mapContainer: {
    width: '100%',
    height: MAP_HEIGHT,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  flagsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    alignItems: 'center',
  },
  flag: {
    fontSize: 22,
  },
  moreFlags: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#4ade80',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#1e3a5f',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  footerText: {
    color: '#475569',
    fontSize: 11,
  },
});
