import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getCountryFlag } from '../utils/countryFlags';

export default function LocalMapsSection({ trip, savedSpots, navigation, theme }) {
  const { t } = useTranslation();

  if (!trip || !trip.countries || trip.countries.length === 0) return null;

  const countries = trip.countries;

  const getSpotCount = (countryName) => {
    return savedSpots.filter(s => s.tripId === trip.id && s.countryName === countryName).length;
  };

  const handleCountryPress = (countryName) => {
    navigation.navigate('LocalMap', {
      tripId: trip.id,
      countryName,
      countries: trip.countries,
    });
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => handleCountryPress(countries[0].name)}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="map" size={18} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>{t('localMaps.title')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Country Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {countries.map((country) => {
          const name = country.name || country;
          const spotCount = getSpotCount(name);
          return (
            <TouchableOpacity
              key={name}
              style={[styles.chip, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => handleCountryPress(name)}
            >
              <Text style={styles.chipFlag}>{getCountryFlag(name)}</Text>
              <Text style={[styles.chipName, { color: theme.text }]} numberOfLines={1}>{name}</Text>
              {spotCount > 0 && (
                <View style={[styles.chipBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.chipBadgeText}>{spotCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  chipsRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  chipFlag: {
    fontSize: 18,
  },
  chipName: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 100,
  },
  chipBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  chipBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
