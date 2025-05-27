import Button from '@/components/Button';
import { ThemedView } from '@/components/ThemedView';
import { useSession } from '@/context/AuthContext'; // Import useSession
import { useThemeColor } from '@/hooks/useThemeColor';
import i18n from '@/i18n';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const darkGreenColor = useThemeColor({}, 'darkGreen');
  const primaryLabelColor = useThemeColor({}, 'label');
  const secondaryLabelColor = useThemeColor({}, 'secondaryLabel');
  const tintColor = useThemeColor({}, 'tint');

  const { user } = useSession(); // Get user from session

  useEffect(() => {
    if (user) router.replace('/(app)');
  }, [user, router]); // Add router to dependency array

  return (
    <ThemedView style={styles.container}>
      {/* Başlık */}
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: darkGreenColor }]}>{i18n.t('home.appName')}</Text>
      </View>

      {/* Görsel */}
      <Image
        style={styles.usersImage}
        source={require('@/assets/images/garden.png')}
      />

      {/* Hoşgeldin mesajı */}
      <View style={styles.welcomeContainer}>
        <Text style={[styles.welcomeMessage2, { color: primaryLabelColor }]}>
          {i18n.t('home.welcome')}
        </Text>
      </View>

      {/* Giriş yap butonu */}
      <Button
        title={i18n.t('auth.login')}
        onPress={() => router.push('/sign-in')}
      />

      {/* Kayıt yönlendirme */}
      <Text style={[styles.registerText, { color: secondaryLabelColor }]}>
        {i18n.t('home.signup_prompt')}{' '}
        <Text style={[styles.registerLink, { color: tintColor }]} onPress={() => router.push('/sign-up')}>
          {i18n.t('auth.signUp')}
        </Text>
      </Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    position: 'absolute',
    top: 80,
    width: '100%',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '900',
  },
  usersImage: {
    marginBottom: 40,
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  welcomeContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  welcomeMessage2: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  registerText: {
    fontSize: 14,
    marginTop: 20,
  },
  registerLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
