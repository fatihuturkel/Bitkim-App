import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor
import i18n from '@/i18n';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  const tintColor = useThemeColor({}, 'tint'); // Get the tint color for the header

  return (
    <Stack
      screenOptions={{
        headerTintColor: tintColor, // Set the header tint color globally for this stack
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: i18n.t('navigation.home'),
        }}
      />
    </Stack>
  );
}