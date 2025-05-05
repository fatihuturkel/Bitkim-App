import i18n from '@/i18n';
import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: i18n.t('navigation.settings'),
        }}
      />
      <Stack.Screen
        name="security/index" // Corresponds to security.tsx
        options={{
          title: i18n.t('navigation.security'),
          headerBackButtonDisplayMode: 'default', // Too keep 'Settings' in the header
        }}
      />
      <Stack.Screen
        name="security/(signOut)/index" // Corresponds to signout.tsx
        options={{
          title: 'Sign Out',
          headerBackButtonDisplayMode: 'generic',
        }}
      />
      <Stack.Screen
        name="security/(emailVerification)/index" // Corresponds to emailverification.tsx
        options={{
          title: 'Email Verification',
          headerBackButtonDisplayMode: 'generic',
        }}
      />
      <Stack.Screen
        name="security/(changePassword)/index" // Corresponds to changepassword.tsx
        options={{
          title: 'Change Password',
          headerBackButtonDisplayMode: 'generic',
          // headerRight is set dynamically within the component itself
        }}
      />

      <Stack.Screen
        name="security/(resetPassword)/index" // Corresponds to resetpassword.tsx
        options={{
          title: 'Reset Password',
          headerBackButtonDisplayMode: 'generic',
        }}
      />

      <Stack.Screen
        name="security/(changeEmail)/index" // Corresponds to twofactor.tsx
        options={{
          title: 'Change Email',
          headerBackButtonDisplayMode: 'generic',
        }}
      />
      {/* Add other nested setting screens here */}
    </Stack>
  );
}