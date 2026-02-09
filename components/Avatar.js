import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAvatarSource, isEmojiAvatar, getEmojiValue } from '../utils/avatarHelper';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

/**
 * Avatar component that handles both emoji presets and custom images
 * @param {string} avatar - Avatar identifier
 * @param {string} avatarType - 'preset', 'custom', or 'default'
 * @param {object} style - Container style
 * @param {number} size - Avatar size (default: 50)
 */
export default function Avatar({ avatar, avatarType = 'default', style, size = 50 }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  // Normalize avatarType - treat null/undefined as 'default'
  const normalizedType = avatarType || 'default';
  const isEmoji = isEmojiAvatar(normalizedType);
  const emojiValue = isEmoji ? getEmojiValue(avatar) : null;

  // Render default placeholder
  const renderPlaceholder = () => (
    <View style={[
      styles.defaultContainer,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderColor: theme.primary,
        backgroundColor: theme.cardBackground,
      },
      style
    ]}>
      <Ionicons name="person" size={size * 0.5} color={theme.primary} />
    </View>
  );

  if (isEmoji && emojiValue) {
    // Render emoji as text
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
        <Text style={[styles.emoji, { fontSize: size * 0.6 }]}>{emojiValue}</Text>
      </View>
    );
  }

  // For custom avatars with valid URI, render the image (with fallback on error)
  if (normalizedType === 'custom' && avatar && !imageError) {
    return (
      <Image
        source={getAvatarSource(avatar, avatarType)}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
        onError={() => setImageError(true)}
      />
    );
  }

  // Default: show person icon placeholder
  return renderPlaceholder();
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emoji: {
    textAlign: 'center',
  },
  defaultContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
