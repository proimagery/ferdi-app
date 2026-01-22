/**
 * Text scaling utilities for accessibility
 * Ensures app scales properly with user's font size preferences while maintaining layout integrity
 */

/**
 * Maximum font size multiplier for the app
 * This prevents text from scaling so large that it breaks the UI
 * 1.5 allows text to scale up to 150% of the original size
 */
export const MAX_FONT_SIZE_MULTIPLIER = 1.5;

/**
 * Default text props that should be applied to all Text components
 * to ensure consistent scaling behavior across the app
 */
export const defaultTextProps = {
  allowFontScaling: true,
  maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER,
};

/**
 * Props for text that should NOT scale (like numbers in badges, icons text, etc.)
 */
export const nonScalingTextProps = {
  allowFontScaling: false,
};

/**
 * Calculates responsive font size based on base size
 * Ensures font sizes work well across different screen sizes and accessibility settings
 * @param {number} baseSize - The base font size
 * @returns {number} - Adjusted font size
 */
export function getResponsiveFontSize(baseSize) {
  // For now, return base size
  // In the future, could add screen size calculations here
  return baseSize;
}
