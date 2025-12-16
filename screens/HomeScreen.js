import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          styles.globeContainer,
          {
            transform: [{ scale: scaleAnim }, { rotate: rotate }],
          },
        ]}
      >
        <Ionicons name="earth" size={120} color={theme.primary} />
      </Animated.View>

      <Image source={ferdiLogo} style={styles.logo} resizeMode="contain" />
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Plan. Connect. Explore.</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={[styles.buttonText, { color: theme.background }]}>Get Started</Text>
        <Ionicons name="arrow-forward" size={20} color={theme.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  globeContainer: {
    marginBottom: 30,
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
