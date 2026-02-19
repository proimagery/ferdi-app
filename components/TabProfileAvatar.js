import React from 'react';
import { View, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { presetAvatars } from '../utils/presetAvatars';

export default function TabProfileAvatar({ focused, size = 26 }) {
  const { theme } = useTheme();
  const { profile } = useAppContext();
  const borderColor = focused ? theme.primary : theme.textSecondary;

  if (profile.avatarType === 'custom' && profile.avatar) {
    return (
      <Image
        source={{ uri: profile.avatar }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor,
        }}
      />
    );
  } else if (profile.avatarType === 'preset' && profile.avatar) {
    const presetAvatar = presetAvatars.find(a => a.id === profile.avatar);
    if (presetAvatar) {
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.cardBackground,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor,
          }}
        >
          <Text style={{ fontSize: size * 0.55 }}>{presetAvatar.value}</Text>
        </View>
      );
    }
  }

  return <Ionicons name="person-circle" size={size + 2} color={borderColor} />;
}
