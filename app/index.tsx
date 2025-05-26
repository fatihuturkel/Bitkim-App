import Button from '@/components/Button';
import useUserStore from '@/zustand/userStore';
import { router } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import i18n from '@/i18n';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const firstName = useUserStore((state) => state.firstName);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      {/* Başlık */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>B İ T K İ M</Text>
      </View>

      {/* Görsel */}
      <Image
        style={styles.usersImage}
        source={require('@/assets/images/garden.png')}
      />

      {/* Hoşgeldin mesajı */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeMessage2}>
          {i18n.t('home.welcome')}
          {firstName ? `, ${firstName}` : ''}
        </Text>
      </View>

      {/* Giriş yap butonu */}
      <Button
        title={i18n.t('auth.login')}
        onPress={() => router.push('/sign-in')}
      />

      {/* Kayıt yönlendirme */}
      <Text style={styles.registerText}>
        {i18n.t('home.signup_prompt')}{' '}
        <Text style={styles.registerLink} onPress={() => router.push('/sign-up')}>
          {i18n.t('auth.signUp')}
        </Text>
      </Text>
    </SafeAreaView>
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
    color: '#438254',
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
    color: '#666',
  },
  registerText: {
    fontSize: 14,
    color: '#444',
    marginTop: 20,
  },
  registerLink: {
    fontWeight: 'bold',
    color: '#2e7d32',
    textDecorationLine: 'underline',
  },
});
