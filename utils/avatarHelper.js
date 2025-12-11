import { presetAvatars } from './presetAvatars';

/**
 * Get the appropriate avatar source based on avatar type
 * For preset (emoji) avatars, returns a placeholder image
 * For custom avatars, returns the URI
 * @param {string} avatar - The avatar identifier (preset ID or custom URI)
 * @param {string} avatarType - Type of avatar: 'default', 'preset', or 'custom'
 * @returns {object} - Image source object for React Native Image component
 */
export const getAvatarSource = (avatar, avatarType) => {
  if (avatarType === 'custom' && avatar) {
    // Return URI for custom uploaded images
    return { uri: avatar };
  }

  // For preset avatars and default, use a placeholder
  // We use a 1x1 transparent pixel as placeholder since emojis will be rendered as overlay
  return { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' };
};

/**
 * Check if avatar should be rendered as emoji text
 * @param {string} avatarType - Type of avatar
 * @returns {boolean}
 */
export const isEmojiAvatar = (avatarType) => {
  return avatarType === 'preset';
};

/**
 * Get emoji value for preset avatar
 * @param {string} avatar - The preset avatar ID
 * @returns {string|null} - Emoji string or null
 */
export const getEmojiValue = (avatar) => {
  const presetAvatar = presetAvatars.find(a => a.id === avatar);
  return presetAvatar?.value || null;
};
