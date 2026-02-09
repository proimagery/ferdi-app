import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const DISPLAY_DURATION = 4000;
const SLIDE_DURATION = 300;

export default function InAppNotification({ visible, title, body, onDismiss, onPress }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: SLIDE_DURATION,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        dismiss();
      }, DISPLAY_DURATION);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const dismiss = () => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: SLIDE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          paddingTop: insets.top + 8,
          backgroundColor: theme.cardBackground,
          borderColor: theme.primary,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        activeOpacity={0.8}
        onPress={() => {
          dismiss();
          if (onPress) onPress();
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
          <Ionicons name="people" size={20} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.body, { color: theme.textSecondary }]} numberOfLines={2}>
            {body}
          </Text>
        </View>
        <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  body: {
    fontSize: 13,
  },
});
