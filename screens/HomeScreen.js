import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import SpinningGlobe from '../components/SpinningGlobe';
import { useTranslation } from 'react-i18next';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { completedTrips, visitedCities } = useAppContext();

  return (
    <View style={styles.container}>
      {/* Globe as full background */}
      <SpinningGlobe
        completedTrips={completedTrips}
        visitedCities={visitedCities}
        background={true}
      />

      {/* Content overlay */}
      <View style={styles.contentOverlay}>
        <Image source={ferdiLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>{t('home.tagline')}</Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={[styles.buttonText, { color: theme.background }]}>{t('home.welcome')}</Text>
          <Ionicons name="arrow-forward" size={20} color={theme.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 300,
    height: 100,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 50,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
