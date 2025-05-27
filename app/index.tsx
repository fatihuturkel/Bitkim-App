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
        <Text style={[styles.header, { color: darkGreenColor }]}>{i18n.t('home.app_name')}</Text>
      </View>

      <ThemedView style={styles.iconStack}>
        <Image source={require('@/assets/images/leaf.png')} style={styles.overlayIcon} />
        <Image source={require('@/assets/images/scan (1).png')} style={styles.baseIcon} />
      </ThemedView>
      
      {/* Hoşgeldin mesajı */}
      <View style={styles.welcomeContainer}>
        <Text style={[styles.welcomeMessage2, { color: primaryLabelColor }]}>
          {i18n.t('common.welcome')}
        </Text>
      </View>

      {/* Giriş yap butonu */}
      <Button
        title={i18n.t('auth.login')}
        onPress={() => router.push('/sign-in')}
      />

      {/* Kayıt yönlendirme */}
      <Text style={[styles.registerText, { color: secondaryLabelColor }]}>
        {i18n.t('auth.dont_have_account')}{' '}
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
    iconStack: {
    width: 100,
    height: 100,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  baseIcon: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  overlayIcon: {
    position: 'absolute',
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
});
