import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardWalkthrough({ visible, onComplete }) {
  const { theme, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const steps = [
    {
      icon: 'earth',
      iconColor: theme.primary,
      title: t('walkthrough.welcomeTitle'),
      description: t('walkthrough.welcomeDesc'),
    },
    {
      icon: isDarkMode ? 'sunny' : 'moon',
      iconColor: '#fbbf24',
      title: t('walkthrough.themeTitle'),
      description: t('walkthrough.themeDesc'),
    },
    {
      icon: 'search',
      iconColor: theme.secondary,
      title: t('walkthrough.searchTitle'),
      description: t('walkthrough.searchDesc'),
    },
    {
      icon: 'person-circle',
      iconColor: '#06b6d4',
      title: t('walkthrough.profileTitle'),
      description: t('walkthrough.profileDesc'),
    },
    {
      icon: 'grid',
      iconColor: '#a78bfa',
      title: t('walkthrough.toolsTitle'),
      description: t('walkthrough.toolsDesc'),
    },
    {
      icon: 'trophy',
      iconColor: '#fbbf24',
      title: t('walkthrough.globeTitle'),
      description: t('walkthrough.globeDesc'),
    },
  ];

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      slideAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const animateStepChange = (newStep) => {
    const direction = newStep > currentStep ? 1 : -1;
    Animated.timing(slideAnim, {
      toValue: direction * -SCREEN_WIDTH * 0.3,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(newStep);
      slideAnim.setValue(direction * SCREEN_WIDTH * 0.3);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (isLastStep) {
      handleDismiss();
    } else {
      animateStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      animateStepChange(currentStep - 1);
    }
  };

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };

  const step = steps[currentStep];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              transform: [
                { scale: scaleAnim },
                { translateX: slideAnim },
              ],
            },
          ]}
        >
          {/* Step dots */}
          <View style={styles.dotsContainer}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === currentStep ? theme.primary : theme.border,
                  },
                ]}
              />
            ))}
          </View>

          {/* Icon */}
          <View style={[styles.iconCircle, { backgroundColor: step.iconColor + '20' }]}>
            <Ionicons name={step.icon} size={48} color={step.iconColor} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>{step.title}</Text>

          {/* Description */}
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {step.description}
          </Text>

          {/* Step counter */}
          <Text style={[styles.stepCounter, { color: theme.textSecondary }]}>
            {t('walkthrough.stepOf', { current: currentStep + 1, total: steps.length })}
          </Text>

          {/* Navigation buttons */}
          <View style={styles.buttonRow}>
            {!isFirstStep ? (
              <TouchableOpacity
                onPress={handleBack}
                style={[styles.backButton, { borderColor: theme.border }]}
              >
                <Ionicons name="arrow-back" size={18} color={theme.textSecondary} />
                <Text style={[styles.backButtonText, { color: theme.textSecondary }]}>
                  {t('walkthrough.back')}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.backButton} />
            )}

            <TouchableOpacity onPress={handleDismiss} style={styles.skipButton}>
              <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>
                {t('walkthrough.skip')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.nextButton, { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.nextButtonText, { color: theme.background }]}>
                {isLastStep ? t('walkthrough.done') : t('walkthrough.next')}
              </Text>
              <Ionicons
                name={isLastStep ? 'checkmark' : 'arrow-forward'}
                size={18}
                color={theme.background}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  stepCounter: {
    fontSize: 13,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 70,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 90,
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
