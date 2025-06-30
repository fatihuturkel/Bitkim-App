import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor
import i18n from '@/i18n';
import useUserStore from '@/zustand/userStore'; // Import user store
import { Stack } from 'expo-router';

export default function HomeLayout() {
  const tintColor = useThemeColor({}, 'tint'); // Get the tint color for the header
  const firstName = useUserStore((state) => state.firstName); // Get user's first name

  return (
    <Stack
      screenOptions={{
        headerTintColor: tintColor, // Set the header tint color globally for this stack
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: i18n.t('common.welcome_to_BITKIM_with_name', { name: firstName || 'User' }), // Use firstName or fallback to 'User'
        }}
      />
    </Stack>
  );
}