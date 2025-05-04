import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageSourcePropType,
  ViewStyle,
  TextStyle,
} from 'react-native';
import UserProfilePicture from './ProfilePicture';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

const IOS_HORIZONTAL_PADDING = 16;
const IOS_VERTICAL_PADDING_ITEM = 11; // Standard vertical padding inside the item
const PROFILE_PICTURE_SIZE = 58; // Adjusted size based on screenshot proportion
const PICTURE_TEXT_SPACING = 12; // Space between picture and text block
const PRIMARY_FONT_SIZE = 17; // Name font size
const SECONDARY_FONT_SIZE = 13; // Description font size
const MIN_ROW_HEIGHT = PROFILE_PICTURE_SIZE + IOS_VERTICAL_PADDING_ITEM * 2; // Calculate min height

// --- Accessory Component (Simplified for Chevron) ---
const Accessory: React.FC<{ color: string }> = ({ color }) => {
  return (
    <Ionicons
      name="chevron-forward"
      size={18} // Slightly larger chevron often used with larger rows
      color={color}
      style={styles.accessoryIcon}
    />
  );
};

// --- Props Interface ---
interface UserProfileListItemProps {
  /** Main label, typically the user's name */
  headline: string;
  /** Secondary label, e.g., 'User Account, iCloud+' */
  subheading: string;
  /** Image source for the profile picture */
  profilePictureSource?: ImageSourcePropType | null;
  /** Initials to display if source is not provided */
  profilePictureInitials?: string;
  /** Function to call when the row is pressed */
  onPress?: () => void;
  /** Is this the last item in the section? (Used to hide separator) */
  isLast?: boolean;
  /** Custom style for the outer TouchableOpacity container */
  style?: ViewStyle;
  /** Custom style for the name text */
  nameStyle?: TextStyle;
  /** Custom style for the description text */
  descriptionStyle?: TextStyle;
  /** Override the default profile picture size */
  profilePictureSize?: number;
}

// --- Component Implementation ---
const UserProfileListItem: React.FC<UserProfileListItemProps> = ({
  headline: name,
  subheading: description,
  profilePictureSource,
  profilePictureInitials,
  onPress,
  isLast = false,
  style,
  nameStyle,
  descriptionStyle,
  profilePictureSize = PROFILE_PICTURE_SIZE,
}) => {
  // --- Theme Colors ---
  const primaryTextColor = useThemeColor({}, 'label');
  const secondaryTextColor = useThemeColor({}, 'secondaryLabel');
  const chevronColor = useThemeColor({}, 'tertiaryLabel');
  const separatorColor = useThemeColor({}, 'separator');
  const backgroundColor = useThemeColor({}, 'mixListItemBackground');


  const hasSeparator = !isLast;
  // Calculate separator indent based on actual picture size and spacing
  const separatorIndent = IOS_HORIZONTAL_PADDING + profilePictureSize + PICTURE_TEXT_SPACING;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: backgroundColor }, // Apply background
        style,
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.6 : 1.0} // Standard active opacity
    >
      {/* Inner content wrapper */}
      <View style={[styles.contentWrapper, { minHeight: MIN_ROW_HEIGHT }]}>
        {/* Profile Picture */}
        <UserProfilePicture
          source={profilePictureSource}
          initials={profilePictureInitials}
          size={profilePictureSize}
        // Pass theme placeholder color if needed by UserProfilePicture
        // placeholderBackgroundColor={theme.placeholderBackground} // Example if needed
        />

        {/* Text Container */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.nameText,
              { color: primaryTextColor }, // Apply theme color
              nameStyle,
            ]}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text
            style={[
              styles.descriptionText,
              { color: secondaryTextColor }, // Apply theme color
              descriptionStyle,
            ]}
            numberOfLines={1} // Keep description to one line usually
          >
            {description}
          </Text>
        </View>

        {/* Accessory (Chevron) - only shown if tappable */}
        {onPress && <Accessory color={chevronColor} />}
      </View>

      {/* Separator */}
      {hasSeparator && (
        <View
          style={[
            styles.separator,
            {
              backgroundColor: separatorColor, // Apply theme color
              marginLeft: separatorIndent, // Indent separator
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    // backgroundColor is set dynamically
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: IOS_VERTICAL_PADDING_ITEM,
    paddingHorizontal: IOS_HORIZONTAL_PADDING,
    // minHeight is set dynamically
  },
  textContainer: {
    flex: 1, // Take remaining space to push chevron right
    marginLeft: PICTURE_TEXT_SPACING,
    marginRight: 8, // Space before chevron
    justifyContent: 'center', // Vertically center the text block
  },
  nameText: {
    fontSize: PRIMARY_FONT_SIZE,
    fontWeight: '500', // Medium weight looks closer to the screenshot
    // color is set dynamically
    marginBottom: 2, // Small space between name and description
  },
  descriptionText: {
    fontSize: SECONDARY_FONT_SIZE,
    fontWeight: '400', // Regular weight
    // color is set dynamically
  },
  accessoryIcon: {
    // No specific styles needed here usually, alignment handled by flexbox
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    // backgroundColor and marginLeft are set dynamically
  },
});

export default UserProfileListItem;