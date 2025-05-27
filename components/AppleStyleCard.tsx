import { useThemeColor } from '@/hooks/useThemeColor';
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

// Define standard iOS colors (copied from Button.tsx for self-containment)
// const iOSBlue = '#007AFF';
// const iOSRed = '#FF3B30';
// const iOSGray = '#8E8E93';
// const iOSGrayBackground = Platform.OS === 'ios' ? 'rgba(120, 120, 128, 0.12)' : '#F2F2F7';
// const iOSWhite = '#FFFFFF';

// Helper function to convert hex to RGB (can be moved to a utils file)
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

interface AppleStyleCardProps {
  title: string; // Title remains required for a card
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  color?: string; // Tint color for the card, affects background/text based on buttonStyle
  buttonStyle?: 'filled' | 'tinted' | 'gray' | 'plain'; // Visual style
  role?: 'normal' | 'primary' | 'destructive' | 'cancel'; // Role of the card
  loading?: boolean; // If true, shows an activity indicator
  icon?: React.ReactElement<{ color?: string }>; // Optional icon
}

const AppleStyleCard: React.FC<AppleStyleCardProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  color: propColor, // Renamed to avoid conflict with themed colors
  buttonStyle = 'filled', // Default style, same as Button
  role = 'normal',
  loading = false,
  icon,
}) => {
  const themedBorderColor = useThemeColor({ light: '#C6C6C8', dark: '#38383A' }, 'separator');

  // --- Theme Colors ---
  const themedSystemBlue = useThemeColor({}, 'systemBlue');
  const darkGreen = useThemeColor({}, 'darkGreen'); // Added for primary color
  const themedSystemRed = useThemeColor({}, 'systemRed');
  const themedSystemGray = useThemeColor({}, 'systemGray'); // For text or icons
  const themedSystemGray5 = useThemeColor({}, 'systemGray5'); // For gray button background
  const themedWhiteColor = '#FFFFFF'; // Fixed white for high contrast text
  const themedSystemGreen = useThemeColor({}, 'systemGreen'); // Default green for tinted backgrounds
  // const themedSecondarySystemFill = useThemeColor({}, 'secondarySystemFill'); // Good for tinted backgrounds


  // Resolve the card's base color: use propColor if provided, otherwise default to themed systemGreen
  const baseCardColor = propColor ?? themedSystemGreen;
 // Default to dark green if no color is provided

  // Helper for generating tinted backgrounds (similar to Button.tsx)
  const getTintedBackground = (baseColorHex: string, fallbackColorHex: string, opacity: number): string => {
    let rgb = hexToRgb(baseColorHex);
    if (!rgb) {
      rgb = hexToRgb(fallbackColorHex);
    }
    if (rgb) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    }
    // Fallback if all else fails (e.g., if systemGreen is not a hex)
    const defaultGreenRgb = hexToRgb(darkGreen); // Default to themed green
    if (defaultGreenRgb) {
      return `rgba(${defaultGreenRgb.r}, ${defaultGreenRgb.g}, ${defaultGreenRgb.b}, ${opacity})`;
    }
    return `rgba(52, 199, 89, ${opacity})`; // Last resort, non-themed green tint
  };


  const cardStylesArray: ViewStyle[] = [styles.cardBase, { borderColor: themedBorderColor }];
  const textStylesArray: TextStyle[] = [styles.titleBase];

  let finalBackgroundColor: string | undefined;
  let finalTextColor: string | undefined;

  // 1. Determine base styles based on buttonStyle
  switch (buttonStyle) {
    case 'filled':
      finalBackgroundColor = baseCardColor;
      finalTextColor = themedWhiteColor;
      break;
    case 'tinted':
      finalBackgroundColor = getTintedBackground(baseCardColor, darkGreen, 0.15);
      finalTextColor = baseCardColor;
      break;
    case 'gray':
      finalBackgroundColor = themedSystemGray5; // Use a theme-aware gray
      finalTextColor = baseCardColor;
      break;
    case 'plain':
      finalBackgroundColor = 'transparent';
      finalTextColor = baseCardColor;
      break;
  }

  // 2. Apply role-specific adjustments
  switch (role) {
    case 'primary':
      textStylesArray.push({ fontWeight: '700' });
      if (buttonStyle === 'tinted') {
        finalBackgroundColor = getTintedBackground(baseCardColor, darkGreen, 0.30);
      }
      break;
    case 'destructive':
      finalTextColor = themedSystemRed;
      if (buttonStyle === 'filled') {
        finalBackgroundColor = themedSystemRed;
        finalTextColor = themedWhiteColor;
      } else if (buttonStyle === 'tinted') {
        finalBackgroundColor = getTintedBackground(themedSystemRed, themedSystemRed, 0.15);
      }
      break;
    case 'cancel':
      finalBackgroundColor = themedSystemGray5; // Use a theme-aware gray
      finalTextColor = baseCardColor; // Text color remains the baseCardColor
      break;
    case 'normal':
      // No specific overrides
      break;
  }

  // Apply calculated background and text colors
  if (finalBackgroundColor !== undefined) {
    cardStylesArray.push({ backgroundColor: finalBackgroundColor });
  }
  if (finalTextColor !== undefined) {
    textStylesArray.push({ color: finalTextColor });
  }

  // Apply disabled/loading styles
  if (disabled || loading) {
    cardStylesArray.push(styles.disabled);
    // Optionally, adjust text color for disabled state:
    // textStylesArray.push({ color: iOSGray });
  }

  // Apply custom styles from props (will override defaults)
  if (style) cardStylesArray.push(style);
  if (textStyle) textStylesArray.push(textStyle);

  const finalTextStyle = StyleSheet.flatten(textStylesArray);
  const indicatorColor = finalTextStyle.color || themedSystemGray; // Use final text color or themed gray for indicator

  const showIcon = !loading && icon;
  const showTitle = !loading && title; // title is required

  const iconWithColor = showIcon && React.isValidElement(icon)
    ? React.cloneElement(icon, { color: finalTextStyle.color?.toString() })
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={cardStylesArray}
      disabled={disabled || loading}
      activeOpacity={buttonStyle === 'plain' ? 0.5 : 0.7} // Adjust opacity for plain style
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} size="large" />
      ) : (
        <View style={styles.contentContainer}>
          {iconWithColor}
          {showIcon && showTitle && <View style={styles.iconTitleSpacer} />}
          {showTitle && <Text style={finalTextStyle}>{title}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 24, // Increased for a "squircle" feel
    borderWidth: 1,
    paddingVertical: 16, // Vertical padding
    paddingHorizontal: 16, // Horizontal padding
    alignItems: 'center', // Center content within the card
    justifyContent: 'center',
    elevation: 3, // For Android shadow
    //margin: 10, // Margin around the card
    //minWidth: 100, // Ensure a minimum width
    //minHeight: 100, // Ensure a minimum height, same as minWidth
    aspectRatio: 1, // Ensure width and height are the same
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column', // Stack icon and title vertically
  },
  iconTitleSpacer: {
    height: 8, // Spacer between icon and title when both are present
  },
  titleBase: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5, // Standard opacity for disabled state
  },
});

export default AppleStyleCard;