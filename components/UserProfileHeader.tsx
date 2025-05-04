import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageSourcePropType,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import UserProfilePicture from './ProfilePicture';
import { useThemeColor } from '@/hooks/useThemeColor';

const DEFAULT_HEADER_PROFILE_SIZE = 100; // Larger size for header
const NAME_FONT_SIZE = 28; // Larger font size for name
const SUBTITLE_FONT_SIZE = 17; // Standard size for subtitle/email
const PICTURE_NAME_SPACING = 16;
const NAME_SUBTITLE_SPACING = 4;
const HEADER_BOTTOM_MARGIN = 30; // Space below the header before sections
const IOS_HORIZONTAL_PADDING = 16; // Standard left/right padding
const IOS_VERTICAL_PADDING_ITEM = 11; // Standard top/bottom padding within an item

interface UserProfileHeaderProps {
  /** User's full name */
  name: string;
  /** Subtitle text (e.g., email address) */
  subtitle: string;
  /** Image source for the profile picture */
  profilePictureSource?: ImageSourcePropType | null;
  /** Initials to display if source is not provided */
  profilePictureInitials?: string;
  /** Size of the circular profile picture */
  profilePictureSize?: number;
  /** Makes the profile picture tappable */
  onPressPicture?: () => void;
  /** Style for the main container View */
  style?: ViewStyle;
  /** Style for the name Text */
  nameStyle?: TextStyle;
  /** Style for the subtitle Text */
  subtitleStyle?: TextStyle;
  /** Set to true to show a loading indicator instead of the picture */
  loading?: boolean;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  name,
  subtitle,
  profilePictureSource,
  profilePictureInitials,
  profilePictureSize = DEFAULT_HEADER_PROFILE_SIZE,
  onPressPicture,
  style,
  nameStyle,
  subtitleStyle,
  loading = false,
}) => {
  // --- Theme Colors ---
  const primaryTextColor = useThemeColor({}, 'label');
  const secondaryTextColor = useThemeColor({}, 'secondaryLabel');
  const placeholderBackground = useThemeColor({}, 'tertiarySystemBackground');
  
  const renderPicture = () => {
    if (loading) {
      // Render a placeholder view with an activity indicator
      return (
        <View
          style={[
            styles.pictureContainer,
            {
              width: profilePictureSize,
              height: profilePictureSize,
              borderRadius: profilePictureSize / 2,
              backgroundColor: placeholderBackground
            },
          ]}
        >
          <ActivityIndicator color={secondaryTextColor} />
        </View>
      );
    }
    return (
      <UserProfilePicture
        source={profilePictureSource}
        initials={profilePictureInitials}
        size={profilePictureSize}
        // Pass placeholder color if UserProfilePicture needs it explicitly
        // placeholderBackgroundColor={theme.placeholderBackground}
      />
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Wrap picture in TouchableOpacity if onPressPicture is provided */}
      {onPressPicture ? (
        <TouchableOpacity onPress={onPressPicture} activeOpacity={0.7}>
          {renderPicture()}
        </TouchableOpacity>
      ) : (
        renderPicture()
      )}

      {/* Name */}
      <Text
        style={[
          styles.nameText,
          { color: primaryTextColor }, // Apply theme color
          nameStyle,
        ]}
        numberOfLines={1} // Prevent wrapping
        adjustsFontSizeToFit // Shrink if name is very long
      >
        {name}
      </Text>

      {/* Subtitle/Email */}
      <Text
        style={[
          styles.subtitleText,
          { color: secondaryTextColor }, // Apply theme color
          subtitleStyle,
        ]}
        numberOfLines={1}
      >
        {subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Center content horizontally
    paddingHorizontal: IOS_HORIZONTAL_PADDING, // Use standard horizontal padding
    paddingTop: IOS_VERTICAL_PADDING_ITEM, // Use standard vertical padding (adjust multiplier if needed)
    marginBottom: HEADER_BOTTOM_MARGIN, // Space below the entire header
    // Background color should be set by the parent screen
  },
  pictureContainer: {
    // Used for loading state placeholder
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor, width, height, borderRadius applied dynamically inline
  },
  nameText: {
    fontSize: NAME_FONT_SIZE,
    fontWeight: '600', // Semi-bold often looks good for names
    textAlign: 'center',
    marginTop: PICTURE_NAME_SPACING,
    // color is set dynamically
  },
  subtitleText: {
    fontSize: SUBTITLE_FONT_SIZE,
    fontWeight: '400', // Regular weight
    textAlign: 'center',
    marginTop: NAME_SUBTITLE_SPACING,
    // color is set dynamically
  },
});

export default UserProfileHeader;