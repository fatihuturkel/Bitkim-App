import { useThemeColor } from '@/hooks/useThemeColor';
import i18n from '@/i18n';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import useUserStore from '@/zustand/userStore';
import { retrieveCurrentUserData } from '@/services/userDataService';

export default function HomeLayout() {
  const tintColor = useThemeColor({}, 'tint');
  const firstName = useUserStore((state) => state.firstName);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await retrieveCurrentUserData(); // Firestore'dan kullanıcı verisini al
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerTintColor: tintColor,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: loading
            ? i18n.t('common.loading')
            : `BİTKİM'e Hoşgeldin, ${firstName || 'Kullanıcı'}`,
        }}
      />
    </Stack>
  );
}
