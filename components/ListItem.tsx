import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Ionicons
import React, { cloneElement, isValidElement } from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';


// Define standard iOS padding and colors
const IOS_HORIZONTAL_PADDING = 16; // Standard left/right padding
const IOS_VERTICAL_PADDING_ITEM = 11; // Standard top/bottom padding within an item
const IOS_TINT_COLOR = '#007AFF'; // System Blue (often used for checkmarks, etc.)
const IOS_LABEL_FONT_SIZE = 17;
const IOS_VALUE_FONT_SIZE = 17; // Value is often same size as label
const IOS_DESCRIPTION_FONT_SIZE = 13; // Standard description font size
const IOS_DESCRIPTION_COLOR = '#8A8A8E'; // Standard description color (System Gray)
const IOS_MIN_HEIGHT = 44; // Minimum tappable area height
const ACCESSORY_SPACING = 5; // Standard spacing between value/label and accessory

// Constants for icon layout to align description
const ICON_CONTAINER_WIDTH = 20; // Fixed width for the icon area (acts as default size)
const ICON_LABEL_SPACING = 16; // Space between the icon container and the label

type AccessoryType = 'none' | 'chevron' | 'checkmark';

interface ListItemProps {
  label: string;
  value?: string;
  description?: string; // Added prop for description
  onPress?: () => void;
  isLast?: boolean; // Used by parent group to control separator
  accessoryType?: AccessoryType; // 'none', 'chevron', 'checkmark'
  icon?: React.ReactNode; // Optional icon on the left
  iconSize?: number; // <<< Add explicit iconSize prop
  // valueColor?: string; // Removed, using theme color
  // labelColor?: string; // Removed, using theme color
  descriptionColor?: string; // Added prop for description color
  disabled?: boolean; // Explicit disabled prop
  style?: ViewStyle; // Style for the main container
  labelStyle?: TextStyle; // Style for the label text
  valueStyle?: TextStyle; // Style for the value text
  descriptionStyle?: TextStyle; // Added prop for description style
}

// Corrected Accessory component to always render a container for spacing
const Accessory: React.FC<{ type: AccessoryType; tintColor: string }> = ({ type, tintColor }) => {
  let iconComponent = null;
  let iconSize = 18; // Default for chevron
  let iconColor = useThemeColor({}, 'tertiaryLabel'); // Use theme color for tint

  switch (type) {
    case 'chevron':
      iconComponent = <Ionicons name="chevron-forward" size={iconSize} color={iconColor} />;
      break;
    case 'checkmark':
      iconColor = tintColor; // Checkmark color
      iconComponent = <Ionicons name="checkmark" size={iconSize} color={iconColor} />;
      break;
    case 'none':
    default:
      iconComponent = null; // Render nothing inside the container
      break;
  }

  // Always render a container View with the accessory spacing applied
  // This ensures spacing is consistent even if there's no accessory icon
  return (
    <View style={styles.accessoryContainer}>
      {iconComponent}
    </View>
  );
};

const ListItem: React.FC<ListItemProps> = ({
  label,
  value,
  description,
  onPress,
  isLast = false,
  accessoryType = 'chevron',
  icon,
  iconSize, // <<< Destructure iconSize
  // valueColor = IOS_VALUE_COLOR, // Removed
  // labelColor, // Removed
  descriptionColor = IOS_DESCRIPTION_COLOR,
  disabled = false,
  style,
  labelStyle,
  valueStyle,
  descriptionStyle,
}) => {
  // Use theme colors for the main container and separator
  const separatorColor = useThemeColor({}, 'separator');
  const labelTextColor = useThemeColor({}, 'label');
  const valueTextColor = useThemeColor({}, 'tertiaryLabel');
  const iconColor = useThemeColor({}, 'label'); // Use theme color for icon
  
  // Item is functionally disabled if explicitly disabled OR if no onPress handler is provided
  const isFunctionallyDisabled = disabled || !onPress;

  // Calculate the left padding/margin needed for alignment based on icon presence
  const contentLeftOffset = icon ? ICON_CONTAINER_WIDTH + ICON_LABEL_SPACING * 2  : IOS_HORIZONTAL_PADDING * 1;
  const disabledOpacityStyle = isFunctionallyDisabled ? styles.contentDisabled : {}; // Style for content opacity

  // Prepare the icon element, applying color and size
  let finalIcon = icon;
  if (icon && isValidElement(icon)) {
    // Determine the size to apply: explicit iconSize prop > default ICON_CONTAINER_WIDTH
    // This ensures ListItem controls the size within its layout.
    const sizeToApply = iconSize !== undefined ? iconSize : ICON_CONTAINER_WIDTH;

    // Determine the color to apply: original prop > default iconColor from theme
    const colorToApply = icon.props.color || iconColor;

    // Clone the element with the determined props, overriding original size/color if necessary
    finalIcon = cloneElement(icon as React.ReactElement<any>, {
        size: sizeToApply,
        color: colorToApply,
    });
  }
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        style, // Apply custom styles directly
      ]}
      onPress={onPress}
      disabled={isFunctionallyDisabled} // Use the calculated functional disabled state
      activeOpacity={isFunctionallyDisabled ? 1 : 0.6} // No active opacity change when functionally disabled
    >
      {/* Inner wrapper for padding and vertical stacking (main row + description) */}
      {/* Apply disabled opacity to this inner wrapper */}
      <View style={[styles.innerWrapper, disabledOpacityStyle]}>
        {/* Main row content: Icon, Label, Value, Accessory */}
        <View style={styles.mainRowContent}>
          {/* Optional Icon */}
          {/* Render the potentially color/size-modified icon */}
          {finalIcon && <View style={styles.iconContainer}>{finalIcon}</View>}

          {/* Label */}
          <Text
            style={[
              styles.label,
              { color: labelTextColor, 
                //paddingVertical: IOS_VERTICAL_PADDING_ITEM, // Apply standard vertical padding to label
              },
              labelStyle,
              // Add margin-left to label if icon is present to create space after icon container
              icon ? { marginLeft: ICON_LABEL_SPACING } : undefined // Use original 'icon' prop for layout logic
            ]}
            numberOfLines={1} // Prevent label wrapping onto multiple lines
          >
            {label}
          </Text>

          {/* Right-side container for value and accessory */}
          <View style={styles.rightContainer}>
            {value && (
              <Text
                style={[
                  styles.value,
                  { color: valueTextColor, 
                    //paddingVertical: IOS_VERTICAL_PADDING_ITEM, // Apply standard vertical padding to value
                  },
                  valueStyle,
                ]}
                numberOfLines={1}
              >
                {value}
              </Text>
            )}
            {/* Accessory component handles its own spacing now */}
            <Accessory type={accessoryType} tintColor={IOS_TINT_COLOR} />
          </View>
        </View>

        {/* Description (conditionally rendered below the main row) */}
        {description && (
          <Text
            style={[
              styles.description,
              { color: descriptionColor },
              descriptionStyle,
              // Apply left padding to align with the label text
              { paddingLeft: contentLeftOffset } // Use calculated offset
            ]}
          >
            {description}
          </Text>
        )}
      </View>

      {/* Separator - Render only if not the last item */}
      {/* Apply dynamic marginLeft to align with content */}
      {!isLast && <View style={[styles.separator, { backgroundColor: separatorColor, marginLeft: contentLeftOffset }]} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // Removed minHeight and justifyContent from here, handled by innerWrapper padding
  },
  contentDisabled: { // Style to apply opacity to the content wrapper
    opacity: 0.4,
  },
  innerWrapper: {
    // This container applies the standard padding to the content inside the row.
    // It stacks the main row and the description vertically.
    //paddingVertical: IOS_VERTICAL_PADDING_ITEM, // Re-added standard iOS vertical padding
    paddingHorizontal: IOS_HORIZONTAL_PADDING, // Standard iOS horizontal padding
    flexDirection: 'column', // Stack children vertically
    justifyContent: 'center', // Center content vertically within the padded area
    minHeight: IOS_MIN_HEIGHT, // Ensure minimum height is applied to the content area
  },
  mainRowContent: {
    // This view holds the icon, label, value, and accessory horizontally
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // No padding here, innerWrapper handles it
  },
  iconContainer: {
    width: ICON_CONTAINER_WIDTH, // Fixed width for the icon area
    height: ICON_CONTAINER_WIDTH, // Make it square (or adjust height if icons aren't square)
    justifyContent: 'center', // Center the icon vertically
    alignItems: 'center', // Center the icon horizontally
    // MarginRight is now applied to the label instead
  },
  label: {
    paddingVertical: IOS_VERTICAL_PADDING_ITEM, // Apply standard vertical padding to label
    //marginLeft: IOS_HORIZONTAL_PADDING, // Standard left padding for label
    fontSize: IOS_LABEL_FONT_SIZE,
    fontWeight: '400', // Regular weight
    flex: 1, // Allow label to take available space
    // marginLeft is added dynamically based on icon presence
    // color is applied dynamically via prop
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // Allow right container to shrink if label is long
    // No padding/margin on the right here, accessoryContainer handles the final spacing
  },
  value: {
    paddingVertical: IOS_VERTICAL_PADDING_ITEM, // Apply standard vertical padding to value
    fontSize: IOS_VALUE_FONT_SIZE,
    fontWeight: '400',
    textAlign: 'right',
    // Spacing between value and accessory is handled by accessoryContainer's marginLeft
    // color is applied dynamically via prop
  },
  accessoryContainer: {
     marginLeft: ACCESSORY_SPACING, // Apply the spacing here, regardless of whether an icon is rendered inside
  },
  description: {
    fontSize: IOS_DESCRIPTION_FONT_SIZE,
    // color is applied dynamically via prop
    marginTop: 6, // Space between the main row and the description
    // paddingLeft is calculated dynamically based on icon presence
    // paddingRight is handled by the innerWrapper's paddingHorizontal
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    // marginLeft is now applied dynamically inline
    // backgroundColor is applied dynamically via prop
  }
});

export default ListItem;