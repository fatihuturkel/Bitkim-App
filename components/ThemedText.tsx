import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'label');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

// Styles adapted towards iOS guidelines
// Color is now handled dynamically by useThemeColor
const styles = StyleSheet.create({
  default: {
    fontSize: 17, // Standard iOS body font size
    lineHeight: 22, // Standard iOS body line height
  },
  defaultSemiBold: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600', // Semibold
  },
  title: {
    fontSize: 34, // Large Title size
    fontWeight: 'bold',
    lineHeight: 41, // Large Title line height
  },
  subtitle: {
    fontSize: 20, // Title 3 size (often used as subtitle)
    fontWeight: '600', // Semibold or Bold depending on context
    lineHeight: 25,
  },
  link: {
    // Link color is now handled by useThemeColor with the 'link' key
    fontSize: 17, // Match default text size
    lineHeight: 22, // Match default text line height
    // Removed hardcoded color: color: '#0a7ea4',
  },
});
