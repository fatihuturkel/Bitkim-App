import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import i18n from '@/i18n';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      {/* Açıklama */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{i18n.t('home.how_it_works')}</ThemedText>
        <ThemedText>{i18n.t('home.how_it_works_description')}</ThemedText>
      </ThemedView>

      {/* Yatay scroll içinde ikonlar ve oklar */}
      <ScrollView horizontal contentContainerStyle={styles.scrollContent} showsHorizontalScrollIndicator={false}>
        <View style={styles.processContainer}>
          {/* Adım 1 */}
          <View style={styles.stepBlock}>
            <View style={styles.iconStack}>
              <Image source={require('@/assets/images/scanningone.png')} style={styles.baseIcon} />
              <Image source={require('@/assets/images/leaf.png')} style={styles.overlayIcon} />
            </View>
            <Text style={styles.stepText}>{i18n.t('home.step_take_photo')}</Text>
          </View>

          {/* Ok 1 */}
          <Text style={styles.arrow}>→</Text>

          {/* Adım 2 */}
          <View style={styles.stepBlock}>
            <Image source={require('@/assets/images/phone.png')} style={styles.icon} />
            <Text style={styles.stepText}>{i18n.t('home.step_get_result')}</Text>
          </View>

          {/* Ok 2 */}
          <Text style={styles.arrow}>→</Text>

          {/* Adım 3 */}
          <View style={styles.stepBlock}>
            <Image source={require('@/assets/images/tanıalmak.png')} style={styles.icon} />
            <Text style={styles.stepText}>{i18n.t('home.step_treat')}</Text>
          </View>
        </View>
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  processContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  iconStack: {
    width: 50,
    height: 50,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  baseIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  overlayIcon: {
    position: 'absolute',
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  stepText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#3e3e3e',
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
    color: '#4CAF50',
    marginHorizontal: 6,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
