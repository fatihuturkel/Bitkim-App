import { useThemeColor } from '@/hooks/useThemeColor'; // Added
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

// Helper function to convert hex to RGB (can be moved to a utils file if used elsewhere)
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

interface ButtonProps {
  /**
   * Text to display inside the button. Optional if an icon is provided.
   */
  title?: string; // Make title optional
  /**
   * Handler to be called when the button is pressed.
   */
  onPress: () => void;
  /**
   * Style for the button container.
   */
  style?: ViewStyle;
  /**
   * Style for the button text.
   */
  textStyle?: TextStyle;
  /**
   * If true, disable all interactions for this component.
   */
  disabled?: boolean;
  /**
   * The tint color of the button. Affects background and text based on style.
   * If not provided, defaults to the theme's 'systemBlue' color.
   */
  color?: string;
  /**
   * The visual style of the button. Defaults to 'filled'.
   * 'filled': Background color is `color`, text is white.
   * 'tinted': Light background derived from `color`, text is `color`.
   * 'gray': Gray background (theme's 'systemGray5'), text is `color`.
   * 'plain': No background, text is `color`.
   */
  buttonStyle?: 'filled' | 'tinted' | 'gray' | 'plain';
  /**
   * The role of the button, influencing its default appearance (e.g., 'destructive').
   */
  role?: 'normal' | 'primary' | 'destructive' | 'cancel';
   /**
   * If true, shows an activity indicator.
   */
  loading?: boolean;
   /**
   * Optional icon element to display in the button.
   * Can be displayed instead of, or alongside, the title.
   * Assumes the icon component accepts a 'color' prop.
   */
  icon?: React.ReactElement<{ color?: string }>; // Expect an element that can take a color prop
}

const Button: React.FC<ButtonProps> = ({
  title, // Now optional
  onPress,
  style,
  textStyle,
  disabled = false,
  color: propColor, // Renamed to avoid conflict
  buttonStyle = 'filled', // Default to 'filled'
  role = 'normal',
  loading = false,
  icon,
}) => {
  // --- Theme Colors ---
  const themedSystemBlue = useThemeColor({}, 'systemBlue');
  const themedSystemRed = useThemeColor({}, 'systemRed');
  const themedSystemGray = useThemeColor({}, 'systemGray'); // For text or icons
  const themedSystemGray5 = useThemeColor({}, 'systemGray5'); // For gray button background
  const themedWhiteColor = '#FFFFFF'; // Fixed white for high contrast text
  const themedSystemGreen = useThemeColor({}, 'systemGreen'); // For success messages or icons

  // Resolve the button's base color: use propColor if provided, otherwise default to themed systemGreen
  const baseButtonColor = propColor ?? themedSystemGreen;

  // Helper for generating tinted backgrounds
  const getTintedBackground = (baseColorHex: string, fallbackColorHex: string, opacity: number): string => {
    let rgb = hexToRgb(baseColorHex);
    if (!rgb) {
      rgb = hexToRgb(fallbackColorHex); // Try fallback if baseColorHex is not a valid hex
    }
    if (rgb) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    }
    // Absolute fallback (e.g., if systemGreen itself is not a hex, though unlikely from Colors.ts)
    const defaultGreenRgb = hexToRgb(themedSystemGreen);
    if (defaultGreenRgb) {
      return `rgba(${defaultGreenRgb.r}, ${defaultGreenRgb.g}, ${defaultGreenRgb.b}, ${opacity})`;
    }
    return `rgba(52, 199, 89, ${opacity})`; // Last resort, non-themed green tint
  };

  const buttonStyles: ViewStyle[] = [styles.button];
  const textStylesList: TextStyle[] = [styles.text];

  let finalBackgroundColor: string | undefined;
  let finalTextColor: string | undefined;

  // 1. Determine base styles based on buttonStyle
  switch (buttonStyle) {
    case 'filled':
      finalBackgroundColor = baseButtonColor;
      finalTextColor = themedWhiteColor;
      break;
    case 'tinted':
      finalBackgroundColor = getTintedBackground(baseButtonColor, themedSystemGreen, 0.15);
      finalTextColor = baseButtonColor;
      break;
    case 'gray':
      finalBackgroundColor = themedSystemGray5; // Use themed gray background
      finalTextColor = baseButtonColor; // Text color is still the baseButtonColor
      break;
    case 'plain':
      finalBackgroundColor = 'transparent';
      finalTextColor = baseButtonColor;
      break;
  }

  // 2. Apply role-specific adjustments and overrides
  switch (role) {
    case 'primary':
      textStylesList.push({ fontWeight: '700' }); // Primary is always bolder
      if (buttonStyle === 'tinted') {
        // Specific background for primary tinted
        finalBackgroundColor = getTintedBackground(baseButtonColor, themedSystemGreen, 0.30);
      }
      // Note: 'filled' primary uses the base 'filled' style + bold text
      break;
    case 'destructive':
      finalTextColor = themedSystemRed; // Destructive text is typically red
      if (buttonStyle === 'filled') {
        finalBackgroundColor = themedSystemRed;
        finalTextColor = themedWhiteColor; // Override text color for filled destructive
      } else if (buttonStyle === 'tinted') {
        // Specific background for destructive tinted
        finalBackgroundColor = getTintedBackground(themedSystemRed, themedSystemRed, 0.15);
      }
      // For 'gray' and 'plain', only the text color changes to red
      break;
    case 'cancel':
      // Cancel role forces a gray style appearance
      finalBackgroundColor = themedSystemGray5;
      finalTextColor = baseButtonColor; // Text color remains the baseButtonColor (often themedSystemGreen by default)
      break;
    case 'normal':
      // No specific overrides needed for normal role, base styles apply.
      break;
  }

  // Apply calculated styles
  if (finalBackgroundColor !== undefined) {
    buttonStyles.push({ backgroundColor: finalBackgroundColor });
  }
  if (finalTextColor !== undefined) {
    textStylesList.push({ color: finalTextColor });
  }

  // Apply disabled/loading styles
  if (disabled || loading) {
    buttonStyles.push(styles.disabled);
    // Optionally, adjust text color for disabled state if needed
    // textStylesList.push({ color: themedSystemGray });
  }

  // Apply custom styles if provided (these will override defaults)
  if (style) buttonStyles.push(style);
  if (textStyle) textStylesList.push(textStyle);

  // Determine ActivityIndicator color based on final text color
  const finalTextStyle = StyleSheet.flatten(textStylesList);
  const indicatorColor = finalTextStyle.color || themedSystemGray;

  // Determine if icon and/or title should be shown
  const showIcon = !loading && icon;
  const showTitle = !loading && title;

  // Warn if no content is provided (optional)
  if (!showIcon && !showTitle && !loading) {
    console.warn("Button rendered without title or icon.");
  }

  // Clone the icon to apply the current text color, assuming it accepts a 'color' prop
  const iconWithColor = showIcon && React.isValidElement(icon)
    ? React.cloneElement(icon, { color: finalTextStyle.color?.toString() })
    : null;


  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={buttonStyle === 'plain' ? 0.5 : 0.7} // Less feedback for plain
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <View style={styles.contentContainer}>
          {iconWithColor /* Render the cloned icon with color */}
          {/* Add spacer only if both icon and title are present */}
          {showIcon && showTitle && <View style={styles.iconTitleSpacer} />}
          {showTitle && <Text style={finalTextStyle}>{title}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Minimum touch target size
    minWidth: 44,
    overflow: 'hidden', // Ensure background respects border radius
    flexDirection: 'row', // Ensure button content aligns horizontally
  },
  contentContainer: { // Container for icon and text
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTitleSpacer: { // Spacer between icon and title
    width: 8,
  },
  text: {
    fontSize: 17,
    fontWeight: '600', // Semibold, common for iOS buttons
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.4, // More pronounced opacity for disabled state per HIG
  },
});

export default Button;