import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// Define standard iOS colors (copied from Button.tsx for self-containment)
const iOSBlue = '#007AFF';
const iOSRed = '#FF3B30';
const iOSGray = '#8E8E93';
const iOSGrayBackground = Platform.OS === 'ios' ? 'rgba(120, 120, 128, 0.12)' : '#F2F2F7';
const iOSWhite = '#FFFFFF';

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
  color = iOSBlue, // Default color, same as Button
  buttonStyle = 'filled', // Default style, same as Button
  role = 'normal',
  loading = false,
  icon,
}) => {
  const themedBorderColor = useThemeColor({ light: '#C6C6C8', dark: '#38383A' }, 'separator');

  const cardStylesArray: ViewStyle[] = [styles.cardBase, { borderColor: themedBorderColor }];
  const textStylesArray: TextStyle[] = [styles.titleBase];

  let finalBackgroundColor: string | undefined;
  let finalTextColor: string | undefined;

  // 1. Determine base styles based on buttonStyle
  switch (buttonStyle) {
    case 'filled':
      finalBackgroundColor = color;
      finalTextColor = iOSWhite;
      break;
    case 'tinted':
      const rgbTintColor = hexToRgb(color);
      if (rgbTintColor) {
        finalBackgroundColor = `rgba(${rgbTintColor.r}, ${rgbTintColor.g}, ${rgbTintColor.b}, 0.15)`;
      } else {
        finalBackgroundColor = 'rgba(0, 122, 255, 0.15)'; // Fallback for invalid hex (iOSBlue tint)
      }
      finalTextColor = color;
      break;
    case 'gray':
      finalBackgroundColor = iOSGrayBackground;
      finalTextColor = color;
      break;
    case 'plain':
      finalBackgroundColor = 'transparent';
      finalTextColor = color;
      break;
  }

  // 2. Apply role-specific adjustments
  switch (role) {
    case 'primary':
      textStylesArray.push({ fontWeight: '700' });
      if (buttonStyle === 'tinted') {
        const rgbPrimaryTintColor = hexToRgb(color);
        if (rgbPrimaryTintColor) {
          finalBackgroundColor = `rgba(${rgbPrimaryTintColor.r}, ${rgbPrimaryTintColor.g}, ${rgbPrimaryTintColor.b}, 0.30)`;
        } else {
          finalBackgroundColor = 'rgba(0, 122, 255, 0.30)'; // Fallback (iOSBlue tint)
        }
      }
      break;
    case 'destructive':
      finalTextColor = iOSRed;
      if (buttonStyle === 'filled') {
        finalBackgroundColor = iOSRed;
        finalTextColor = iOSWhite;
      } else if (buttonStyle === 'tinted') {
        // Destructive tint is based on red
        finalBackgroundColor = Platform.OS === 'ios' ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)';
      }
      break;
    case 'cancel':
      finalBackgroundColor = iOSGrayBackground;
      finalTextColor = color;
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
  const indicatorColor = finalTextStyle.color || iOSGray; // Use final text color for indicator

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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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