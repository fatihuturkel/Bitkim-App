import React, { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';

// --- Constants ---
const IOS_NAV_BAR_HEIGHT = 44; // Standard height of the navigation bar content area
const IOS_LARGE_TITLE_EXTRA_HEIGHT = 52; // Extra height for the large title area
const IOS_DEFAULT_TINT_COLOR = '#007AFF'; // System Blue
const IOS_TITLE_FONT_SIZE = 17;
const IOS_LARGE_TITLE_FONT_SIZE = 34; // Font size for large title
const IOS_BUTTON_FONT_SIZE = 17;
const HORIZONTAL_PADDING = 16;

// --- Component Props ---
interface NavigationBarProps {
  title?: string;
  leftButtonLabel?: ReactNode;
  onLeftButtonPress?: () => void;
  rightButtonLabel?: ReactNode;
  onRightButtonPress?: () => void;
  tintColor?: string;
  titleStyle?: StyleProp<TextStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  hideSeparator?: boolean;
  leftButtonDisabled?: boolean;
  rightButtonDisabled?: boolean;
  largeTitle?: boolean;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  title,
  leftButtonLabel,
  onLeftButtonPress,
  rightButtonLabel,
  onRightButtonPress,
  tintColor,
  titleStyle,
  buttonTextStyle,
  style,
  contentStyle,
  hideSeparator = false,
  leftButtonDisabled = false,
  rightButtonDisabled = false,
  largeTitle = false,
}) => {
  const insets = useSafeAreaInsets();
  // Theme colors
  const IOS_BACKGROUND_COLOR = useThemeColor({}, 'secondarySystemBackground');
  const IOS_SEPARATOR_COLOR = useThemeColor({}, 'separator');
  const IOS_TITLE_COLOR = useThemeColor({}, 'label');

  // Use the default tint color if not provided
  const finalTintColor = tintColor || IOS_DEFAULT_TINT_COLOR;

  const renderButton = (
    label: ReactNode | undefined,
    onPress: (() => void) | undefined,
    isDisabled: boolean,
    position: 'left' | 'right'
  ) => {
    if (!label || !onPress) {
      return null;
    }

    const buttonSpecificStyle = position === 'left' ? styles.leftButton : styles.rightButton;
    const disabledStyle = isDisabled ? styles.buttonDisabled : {};
    const isStringLabel = typeof label === 'string';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, buttonSpecificStyle, disabledStyle]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={isDisabled ? 1.0 : 0.6}
      >
        {isStringLabel ? (
          <Text
            style={[
              styles.buttonText,
              { color: finalTintColor },
              buttonTextStyle,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : (
          React.isValidElement(label) ?
            React.cloneElement(label as React.ReactElement, { color: finalTintColor }) :
            label
        )}
      </TouchableOpacity>
    );
  };

  const initialContainerHeight = IOS_NAV_BAR_HEIGHT + (largeTitle ? IOS_LARGE_TITLE_EXTRA_HEIGHT : 0);

  return (
    <View
      style={[
        styles.outerContainer,
        {
          paddingTop: insets.top,
          height: initialContainerHeight + insets.top,
          backgroundColor: IOS_BACKGROUND_COLOR,
        },
        style,
      ]}
    >
      <View style={[styles.contentContainer, contentStyle]}>
        {renderButton(leftButtonLabel, onLeftButtonPress, leftButtonDisabled, 'left')}

        {title && (
          <View
            style={[
              styles.titleContainer,
              largeTitle && { opacity: 0 },
            ]}
            pointerEvents="none"
          >
            <Text 
              style={[
                styles.title, 
                { color: IOS_TITLE_COLOR },
                titleStyle
              ]} 
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        )}

        {renderButton(rightButtonLabel, onRightButtonPress, rightButtonDisabled, 'right')}
      </View>

      {largeTitle && title && (
        <View
          style={[
            styles.largeTitleContainer,
          ]}
          pointerEvents="none"
        >
          <Text 
            style={[
              styles.largeTitle, 
              { color: IOS_TITLE_COLOR },
              titleStyle
            ]} 
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      )}

      {!hideSeparator && (
        <View 
          style={[
            styles.separator,
            { backgroundColor: IOS_SEPARATOR_COLOR }
          ]} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    // backgroundColor moved to component to use theme color
    overflow: 'hidden',
  },
  contentContainer: {
    height: IOS_NAV_BAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING / 2,
    position: 'relative',
    zIndex: 1,
  },
  titleContainer: {
    position: 'absolute',
    left: HORIZONTAL_PADDING + 50,
    right: HORIZONTAL_PADDING + 50,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: IOS_TITLE_FONT_SIZE,
    fontWeight: '600',
    // color moved to inline style to use theme color
    textAlign: 'center',
  },
  largeTitleContainer: {
    height: IOS_LARGE_TITLE_EXTRA_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  largeTitle: {
    fontSize: IOS_LARGE_TITLE_FONT_SIZE,
    fontWeight: 'bold',
    // color moved to inline style to use theme color
    textAlign: 'left',
  },
  buttonContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_PADDING / 2,
    zIndex: 1,
    minWidth: 44,
    alignItems: 'center',
  },
  leftButton: {
    left: 0,
  },
  rightButton: {
    right: 0,
  },
  buttonText: {
    fontSize: IOS_BUTTON_FONT_SIZE,
    fontWeight: '400',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // backgroundColor moved to inline style to use theme color
  },
});

export default NavigationBar;