// filepath: app/(auth)/_layout.tsx
import { useThemeColor } from '@/hooks/useThemeColor';
import i18n from '@/i18n';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  const tintColor = useThemeColor({}, 'tint'); // Get the tint color for the header

  return (
    <Stack
      screenOptions={{
        headerTintColor: tintColor, // Set the header tint color globally for this stack
      }}
    >
      <Stack.Screen name="sign-in" options={{ title: i18n.t('auth.login') }} />
      <Stack.Screen name="sign-up" options={{ title: i18n.t('auth.signUp') }} />
      {/* You can add other auth-related screens here, e.g., forgot-password */}
    </Stack>
  );
}