import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  ViewStyle,
  TextStyle,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Ionicons

// Reuse or define relevant constants
const IOS_PLACEHOLDER_BACKGROUND_COLOR = '#E5E5EA'; // System Gray 5 (good for placeholders)
const IOS_PLACEHOLDER_ICON_COLOR = '#8A8A8E'; // System Gray (for placeholder icon/text)
const IOS_TINT_COLOR = '#007AFF'; // System Blue (for Edit text)
const DEFAULT_PROFILE_SIZE = 80; // A reasonable default size

interface UserProfilePictureProps {
  /** The source for the profile image (uri, require, etc.) */
  source?: ImageSourcePropType | null;
  /** Initials to display if source is not provided (e.g., "JD"). Max 2-3 recommended. */
  initials?: string;
  /** Size of the circular profile picture */
  size?: number;
  /** Makes the component tappable and shows edit text if true */
  editable?: boolean;
  /** Custom text to show below the picture when editable (default: 'Edit') */
  editText?: string;
  /** Function to call when the component is pressed */
  onPress?: () => void;
  /** Style for the main container View */
  style?: ViewStyle;
  /** Style for the initials Text */
  initialsTextStyle?: TextStyle;
  /** Tint color for the placeholder icon and edit text */
  tintColor?: string;
   /** Set to true to show a loading indicator */
  loading?: boolean;
}

const UserProfilePicture: React.FC<UserProfilePictureProps> = ({
  source,
  initials,
  size = DEFAULT_PROFILE_SIZE,
  editable = false,
  editText = 'Edit', // Default edit text
  onPress,
  style,
  initialsTextStyle,
  tintColor = IOS_TINT_COLOR,
  loading = false, // Default loading state
}) => {
  const showEditText = editable && onPress; // Only show edit text if editable and tappable

  // Dynamic styles based on size
  const containerDynamicStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: IOS_PLACEHOLDER_BACKGROUND_COLOR, // Background for placeholder/initials
  };

  const imageDynamicStyle = {
    width: size,
    height: size,
    borderRadius: size / 2, // Ensure image itself is clipped if container overflow isn't enough
  };

  // Scale font size based on picture size for initials
  const initialsTextDynamicStyle: TextStyle = {
    fontSize: size * 0.4, // Adjust multiplier as needed
    fontWeight: '500', // Medium weight often looks good for initials
    color: IOS_PLACEHOLDER_ICON_COLOR,
  };

  // Scale icon size based on picture size
  const iconSize = size * 0.6; // Adjust multiplier as needed

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={IOS_PLACEHOLDER_ICON_COLOR} />;
    }
    if (source) {
      return (
        <Image source={source} style={imageDynamicStyle} resizeMode="cover" />
      );
    }
    if (initials) {
      // Limit initials to avoid overflow
      const displayInitials = initials.substring(0, 2).toUpperCase();
      return (
        <Text
          style={[
            styles.initialsText,
            initialsTextDynamicStyle,
            initialsTextStyle,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit // Helps if initials are wide
        >
          {displayInitials}
        </Text>
      );
    }
    // Default placeholder icon
    return (
      <Ionicons
        name="person-sharp" // Changed to a filled icon, often looks better in placeholders
        size={iconSize}
        color={IOS_PLACEHOLDER_ICON_COLOR}
      />
    );
  };

  return (
    <TouchableOpacity
      style={[styles.wrapper, style]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1.0}
    >
      <View style={[styles.container, containerDynamicStyle]}>
        {renderContent()}
      </View>
      {showEditText && (
        <Text style={[styles.editText, { color: tintColor }]}>{editText}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center', // Center the circle and text horizontally
    justifyContent: 'center', // Center vertically within its bounds
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Clip the image/content to the border radius
    position: 'relative', // Needed if you wanted absolute positioning inside
  },
  // Image style is applied dynamically
  initialsText: {
    textAlign: 'center',
  },
  editText: {
    marginTop: 8, // Space between circle and text
    fontSize: 16, // iOS typically uses slightly smaller than label for this
    fontWeight: '400', // Regular weight
    // color is set dynamically using tintColor
    textAlign: 'center',
  },
});

export default UserProfilePicture;