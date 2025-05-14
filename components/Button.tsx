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

// Define standard iOS colors (you might want to move these to a theme file)
const iOSBlue = '#007AFF';
const iOSRed = '#FF3B30';
const iOSGray = '#8E8E93'; // Standard gray text color
const iOSGrayBackground = Platform.OS === 'ios' ? 'rgba(120, 120, 128, 0.12)' : '#F2F2F7'; // secondarySystemBackground equivalent or fallback
const iOSWhite = '#FFFFFF';

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
   * The tint color of the button. Affects background and text based on style. Defaults to iOS blue.
   */
  color?: string;
  /**
   * The visual style of the button. Defaults to 'filled'.
   * 'filled': Background color is `color`, text is white.
   * 'tinted': Light background derived from `color`, text is `color`.
   * 'gray': Gray background, text is `color`.
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
  color = iOSBlue,
  buttonStyle = 'filled', // Default to 'filled'
  role = 'normal',
  loading = false,
  icon,
}) => {
  const buttonStyles: ViewStyle[] = [styles.button];
  const textStylesList: TextStyle[] = [styles.text];

  let finalBackgroundColor: string | undefined;
  let finalTextColor: string | undefined;

  // 1. Determine base styles based on buttonStyle
  switch (buttonStyle) {
    case 'filled':
      finalBackgroundColor = color;
      finalTextColor = iOSWhite;
      break;
    case 'tinted':
      // Default tinted background (similar to 'normal' role in original logic)
      // Ideally, this tint would be dynamically generated from `color`
      finalBackgroundColor = 'rgba(0, 122, 255, 0.15)';
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

  // 2. Apply role-specific adjustments and overrides
  switch (role) {
    case 'primary':
      textStylesList.push({ fontWeight: '700' }); // Primary is always bolder
      if (buttonStyle === 'tinted') {
        // Specific background for primary tinted
        finalBackgroundColor = 'rgba(0, 122, 255, 0.3)';
      }
      // Note: 'filled' primary uses the base 'filled' style + bold text
      break;
    case 'destructive':
      finalTextColor = iOSRed; // Destructive text is typically red
      if (buttonStyle === 'filled') {
        finalBackgroundColor = iOSRed;
        finalTextColor = iOSWhite; // Override text color for filled destructive
      } else if (buttonStyle === 'tinted') {
        // Specific background for destructive tinted
        finalBackgroundColor = Platform.OS === 'ios' ? 'rgba(255, 59, 48, 0.15)' : '#FFEBEE';
      }
      // For 'gray' and 'plain', only the text color changes to red
      break;
    case 'cancel':
      // Per original logic's final override, cancel role forces a gray style appearance
      // regardless of the initial buttonStyle.
      finalBackgroundColor = iOSGrayBackground;
      finalTextColor = color; // Text color remains the tint color
      // If 'cancel' should behave differently based on buttonStyle, this needs adjustment.
      // E.g., maybe only override 'filled' or 'tinted' to gray.
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
    // Adjust text color for disabled state if needed, e.g., make it gray
    // textStylesList.push({ color: iOSGray }); // Example: Gray out text when disabled
  }

  // Apply custom styles if provided (these will override defaults)
  if (style) buttonStyles.push(style);
  if (textStyle) textStylesList.push(textStyle);

  // Determine ActivityIndicator color based on final text color
  const finalTextStyle = StyleSheet.flatten(textStylesList);
  const indicatorColor = finalTextStyle.color || iOSGray;

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