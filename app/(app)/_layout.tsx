import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import i18n from '@/i18n';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { useSession } from '../../context/AuthContext';
import useUserStore from '@/zustand/userStore';

function TabIcon({ ionIcon, color }: { ionIcon: keyof typeof Ionicons.glyphMap; color: string }) {
  return <TabBarIcon name={ionIcon} color={color} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = useThemeColor({}, 'tint');
  const { user, isLoading } = useSession();
  const firstName = useUserStore((state) => state.firstName);

  if (isLoading) {
    return <Text>{i18n.t('common.loading')}</Text>;
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: false, // tüm tablar için header kapalı
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.select({
            ios: 'transparent',
            android: 'rgba(255, 255, 255, 0.8)',
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: 94,
          paddingTop: 0,
          paddingBottom: 40,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint={colorScheme === 'dark' ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
              intensity={80}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t('navigation.home'),
          tabBarIcon: ({ color }) => <TabIcon ionIcon="home-sharp" color={color} />,
        }}
      />

      <Tabs.Screen
        name="analyze"
        options={{
          title: i18n.t('navigation.analyze'),
          tabBarIcon: ({ color }) => <TabIcon ionIcon="search" color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: i18n.t('navigation.settings'),
          tabBarIcon: ({ color }) => <TabIcon ionIcon="settings-sharp" color={color} />,
        }}
      />
    </Tabs>
  );
}
