import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor
import i18n from '@/i18n';
import { Stack } from 'expo-router';
import React from 'react';

export default function AnalyzeLayout() {
  const tintColor = useThemeColor({}, 'tint'); // Get the tint color for the header

  return (
    <Stack
      screenOptions={{
        headerTintColor: tintColor, // Set the header tint color globally for this stack
      }}
    >
      <Stack.Screen
        name="index" // Corresponds to index.tsx
        options={{
          title: i18n.t('navigation.analyze'),
        }}
      />
      <Stack.Screen
        name="legacyanalyze/index" // Corresponds to legacyanalyze.tsx
        options={{
          title: i18n.t('navigation.legacyAnalyze'),
          headerBackButtonDisplayMode: 'default', // Too keep 'Settings' in the header
        }}
      />
      <Stack.Screen
        name="chat/index" // Corresponds to chat.tsx
        options={{
          title: i18n.t('navigation.aichat'),
          headerBackButtonDisplayMode: 'default',
        }}
      />

    </Stack>
  );
}