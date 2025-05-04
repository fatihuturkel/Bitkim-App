import { useThemeColor } from '@/hooks/useThemeColor';
import React, { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ViewStyle, // Use ViewStyle for style props
  TextStyle, // Use TextStyle for text style props
  Platform, // Useful for platform-specific styles like shadow/elevation
} from 'react-native';

// Define standard iOS constants for appearance and spacing
const IOS_SECTION_TITLE_COLOR = '#8A8A8E'; // System Gray
const IOS_FOOTER_COLOR = '#8A8A8E'; // System Gray
const IOS_HORIZONTAL_PADDING = 16; // Standard left/right padding for title/footer
const IOS_TITLE_FONT_SIZE = 13;
const IOS_FOOTER_FONT_SIZE = 13;
const IOS_SPACE_BETWEEN_TITLE_CONTENT = 6; // Standard space below title
const IOS_SPACE_BETWEEN_CONTENT_FOOTER = 8; // Standard space above footer
const IOS_SPACE_BELOW_SECTION = 32; // Standard space below the entire section

interface AppleSectionProps {
  title?: string;
  footer?: string;
  children: ReactNode;
  style?: ViewStyle; // Use ViewStyle for the main container style
  titleStyle?: TextStyle; // Optional style override for the title text
  footerStyle?: TextStyle; // Optional style override for the footer text
  contentStyle?: ViewStyle; // Optional style override for the content container
}

const AppleSection: React.FC<AppleSectionProps> = ({
  title,
  footer,
  children,
  style,
  titleStyle,
  footerStyle,
  contentStyle,
}) => {

  const backgroundColor = useThemeColor({}, 'mixListItemBackground');
  


  return (
    // Main container for the section (title, content block, footer)
    <View style={[styles.container, style]}>
      {/* Section Title */}
      {title && (
        <Text style={[styles.title, titleStyle]}>
          {title}
        </Text>
      )}

      {/* Rounded Container for List Items/Switches */}
      {/* The children (AppleListItem, AppleToggle) should handle their own internal padding and separators */}
      <View style={[styles.content, contentStyle, { backgroundColor: backgroundColor }]}>
        {children}
      </View>

      {/* Footer Text */}
      {footer && (
        <Text style={[styles.footer, footerStyle]}>
          {footer}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Standard vertical spacing between sections
    marginBottom: IOS_SPACE_BELOW_SECTION,
    // Note: The background color *behind* sections is typically set on the parent screen
    // backgroundColor: '#F2F2F7', // System Gray 6
  },
  title: {
    fontSize: IOS_TITLE_FONT_SIZE,
    // fontWeight: '400', // Regular weight is standard for section titles
    color: IOS_SECTION_TITLE_COLOR,
    marginBottom: IOS_SPACE_BETWEEN_TITLE_CONTENT,
    marginLeft: IOS_HORIZONTAL_PADDING, // Align title with the content's horizontal padding
    textTransform: 'uppercase',
  },
  content: {
    borderRadius: 10, // Standard corner radius for grouped lists
    overflow: 'hidden', // Essential to clip children (like list items with separators) to the rounded corners
    // Optional subtle shadow - standard iOS often relies more on background color contrast
    // than strong shadows for these groups. The current shadow is subtle and acceptable.
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 }, // Very subtle or no offset
        shadowOpacity: 0.05, // Low opacity
        shadowRadius: 3, // Small radius
      },
      android: {
        elevation: 1, // Subtle elevation for Android
      },
    }),
  },
  footer: {
    fontSize: IOS_FOOTER_FONT_SIZE,
    color: IOS_FOOTER_COLOR,
    marginTop: IOS_SPACE_BETWEEN_CONTENT_FOOTER,
    marginHorizontal: IOS_HORIZONTAL_PADDING, // Align footer with the content's horizontal padding
  }
});

export default AppleSection;