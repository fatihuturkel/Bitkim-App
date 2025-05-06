import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// Define standard iOS padding and colors
const IOS_HORIZONTAL_PADDING = 16;
const IOS_VERTICAL_PADDING_ITEM = 11;
const IOS_LABEL_FONT_SIZE = 17;
const IOS_DESCRIPTION_FONT_SIZE = 13;
const IOS_DESCRIPTION_COLOR = '#8A8A8E';
const IOS_MIN_HEIGHT = 44;
const ICON_CONTAINER_WIDTH = 20;
const ICON_LABEL_SPACING = 16;

interface ListSwitchProps {
  label: string;
  description?: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
  isLast?: boolean;
  icon?: React.ReactNode;
  iconSize?: number;
  descriptionColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  switchStyle?: ViewStyle;
  descriptionStyle?: TextStyle;
}

const ListSwitch: React.FC<ListSwitchProps> = ({
  label,
  description,
  onValueChange,
  value,
  isLast = false,
  icon,
  iconSize,
  descriptionColor = IOS_DESCRIPTION_COLOR,
  disabled = false,
  style,
  labelStyle,
  switchStyle,
  descriptionStyle,
}) => {
  // Use theme colors
  const separatorColor = useThemeColor({}, 'separator');
  const labelTextColor = useThemeColor({}, 'label');
  const iconColor = useThemeColor({}, 'label');
  
  // Calculate the left padding/margin needed for alignment based on icon presence
  const contentLeftOffset = icon ? ICON_CONTAINER_WIDTH + ICON_LABEL_SPACING * 2 : IOS_HORIZONTAL_PADDING * 2;
  
  // Prepare the icon element, applying color and size
  let finalIcon = icon;
  if (icon && React.isValidElement(icon)) {
    const sizeToApply = iconSize !== undefined ? iconSize : ICON_CONTAINER_WIDTH;
    const colorToApply = (icon as React.ReactElement<any>).props.color || iconColor;

    finalIcon = React.cloneElement(icon as React.ReactElement<any>, {
      size: sizeToApply,
      color: colorToApply,
    });
  }
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        style,
      ]}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.6}
    >
      <View style={[styles.innerWrapper, disabled ? styles.contentDisabled : {}]}>
        <View style={styles.mainRowContent}>
          {finalIcon && <View style={styles.iconContainer}>{finalIcon}</View>}

          <Text
            style={[
              styles.label,
              { color: labelTextColor },
              labelStyle,
              icon ? { marginLeft: ICON_LABEL_SPACING } : undefined
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>

          <View style={styles.rightContainer}>
            <Switch
              value={value}
              onValueChange={onValueChange}
              disabled={disabled}
              style={[styles.switch, switchStyle]}
            />
          </View>
        </View>

        {description && (
          <Text
            style={[
              styles.description,
              { color: descriptionColor },
              descriptionStyle,
              { paddingLeft: contentLeftOffset }
            ]}
          >
            {description}
          </Text>
        )}
      </View>

      {!isLast && <View style={[styles.separator, { backgroundColor: separatorColor, marginLeft: contentLeftOffset }]} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {},
  contentDisabled: {
    opacity: 0.4,
  },
  innerWrapper: {
    paddingHorizontal: IOS_HORIZONTAL_PADDING,
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: IOS_MIN_HEIGHT,
  },
  mainRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: ICON_CONTAINER_WIDTH,
    height: ICON_CONTAINER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    paddingVertical: IOS_VERTICAL_PADDING_ITEM,
    //marginLeft: IOS_HORIZONTAL_PADDING,
    fontSize: IOS_LABEL_FONT_SIZE,
    fontWeight: '400',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    // iOS switches have specific dimensions
    // No additional styles needed by default
  },
  description: {
    fontSize: IOS_DESCRIPTION_FONT_SIZE,
    marginTop: 6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  }
});

export default ListSwitch;