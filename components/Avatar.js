import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { getAvatarSource, isEmojiAvatar, getEmojiValue } from '../utils/avatarHelper';

/**
 * Avatar component that handles both emoji presets and custom images
 * @param {string} avatar - Avatar identifier
 * @param {string} avatarType - 'preset', 'custom', or 'default'
 * @param {object} style - Container style
 * @param {number} size - Avatar size (default: 50)
 */
export default function Avatar({ avatar, avatarType, style, size = 50 }) {
  const isEmoji = isEmojiAvatar(avatarType);
  const emojiValue = isEmoji ? getEmojiValue(avatar) : null;

  if (isEmoji && emojiValue) {
    // Render emoji as text
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
        <Text style={[styles.emoji, { fontSize: size * 0.6 }]}>{emojiValue}</Text>
      </View>
    );
  }

  // Render custom image or default
  return (
    <Image
      source={getAvatarSource(avatar, avatarType)}
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
    />
  );
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
});
