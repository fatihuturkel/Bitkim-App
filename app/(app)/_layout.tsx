import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useColorScheme } from '@/hooks/useColorScheme';
import i18n from '@/i18n';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { useSession } from '../../context/AuthContext';

// Helper component for cross-platform icons
function TabIcon({ ionIcon, color }: {
  ionIcon: keyof typeof Ionicons.glyphMap;
  color: string
}) {
  return <TabBarIcon name={ionIcon} color={color} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { user, isLoading } = useSession(); // Changed 'session' to 'user'

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>{i18n.t('common.loading')}</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!user) { // Changed 'session' to 'user'
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  // This layout can be deferred because it's not the root layout.
  // return <Stack />; // This was likely incorrect based on the rest of the file structure (Tabs)

  return (
    <Tabs
      screenOptions={{
        //tabBarActiveTintColor: (colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint),
        //tabBarInactiveTintColor: (colorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault),
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.select({
            ios: 'transparent',
            android: 'rgba(255, 255, 255, 0.8)', // Fallback for Android
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: 94,
          paddingTop: 0,
          paddingBottom: 40,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              tint={colorScheme === 'dark' ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
              intensity={80}
              style={StyleSheet.absoluteFill}
            />
          ) : null
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t('navigation.home'),
          tabBarIcon: ({ color }) => (
            <TabIcon
              ionIcon="home-sharp"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: i18n.t('navigation.scan'),
          tabBarIcon: ({ color }) => (
            <TabIcon
              ionIcon="search"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: i18n.t('navigation.settings'),
          tabBarIcon: ({ color }) => (
            <TabIcon
              ionIcon="settings-sharp"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="legacyanalyze/index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}