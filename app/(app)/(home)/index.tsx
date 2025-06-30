import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Image } from 'react-native';
import { retrieveCurrentUserData } from '@/services/userDataService';
import useUserStore from '@/zustand/userStore';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import i18n from '@/i18n';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function HomeScreen() {
  const tipBgColor = useThemeColor({ light: '#E3F2FD', dark: '#1C2A38' }, 'background');
  const diseaseBgColor = useThemeColor({ light: '#F1F8E9', dark: '#1E2A1D' }, 'background');
  const diseaseTitleColor = useThemeColor({ light: '#33691E', dark: '#AED581' }, 'text');
  const diseaseTextColor = useThemeColor({ light: '#4E5D42', dark: '#C5E1A5' }, 'text');
  const arrowColor = useThemeColor({ light: '#30D158', dark: '#30D158' }, 'tint');

  useEffect(() => {
    retrieveCurrentUserData();
  }, []);

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
      {/* Açıklama */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{i18n.t('home.how_it_works')}</ThemedText>
        <ThemedText type="default">{i18n.t('home.how_it_works_description')}</ThemedText>
      </ThemedView>

      {/* Adımlar */}
      <ScrollView horizontal contentContainerStyle={styles.scrollContent} showsHorizontalScrollIndicator={false}>
        <ThemedView style={styles.processContainer}>
          <ThemedView style={styles.stepBlock}>
            <ThemedView style={styles.iconStack}>
              <Image source={require('@/assets/images/leaf.png')} style={styles.overlayIcon} />
              <Image source={require('@/assets/images/scan (1).png')} style={styles.baseIcon} />
            </ThemedView>
            <ThemedText type="default" style={styles.stepText}>
              {i18n.t('home.step_take_photo')}
            </ThemedText>
          </ThemedView>
          <ThemedText style={[styles.arrow, { color: arrowColor }]}>→</ThemedText>
          <ThemedView style={styles.stepBlock}>
            <Image source={require('@/assets/images/smartphone.png')} style={styles.icon} />
            <ThemedText type="default" style={styles.stepText}>
              {i18n.t('home.step_get_result')}
            </ThemedText>
          </ThemedView>
          <ThemedText style={[styles.arrow, { color: arrowColor }]}>→</ThemedText>
          <ThemedView style={styles.stepBlock}>
            <Image source={require('@/assets/images/biology.png')} style={styles.icon} />
            <ThemedText type="default" style={styles.stepText}>
              {i18n.t('home.step_treat')}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Bakım İpuçları */}
      <ThemedView style={styles.section}>
        <ThemedText type="default" style={styles.sectionTitle}>
          🌱 {i18n.t('home.tips_title')}
        </ThemedText>
        {[
          ['🌿', i18n.t('home.tip1')],
          ['💧', i18n.t('home.tip2')],
          ['🌞', i18n.t('home.tip3')],
          ['🧴', i18n.t('home.tip4')],
          ['🌬️', i18n.t('home.tip5')],
        ].map(([emoji, text], i) => (
          <ThemedView key={i} style={[styles.tipCard, { backgroundColor: tipBgColor }]}>
            <ThemedText type="default" style={styles.tipEmoji}>{emoji}</ThemedText>
            <ThemedText type="default" style={styles.tipText}>{text}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      {/* Sık Görülen Hastalıklar */}
      <ThemedView style={styles.section}>
        <ThemedText type="default" style={styles.sectionTitle}>
          🌾 {i18n.t('home.common_diseases')}
        </ThemedText>
        {[
          [i18n.t('home.disease1_title'), i18n.t('home.disease1_desc')],
          [i18n.t('home.disease2_title'), i18n.t('home.disease2_desc')],
          [i18n.t('home.disease3_title'), i18n.t('home.disease3_desc')],
          [i18n.t('home.disease4_title'), i18n.t('home.disease4_desc')],
        ].map(([title, desc], i) => (
          <ThemedView key={i} style={[styles.diseaseCard, { backgroundColor: diseaseBgColor }]}>
            <ThemedText type="default" style={[styles.diseaseTitle, { color: diseaseTitleColor }]}>
              {title}
            </ThemedText>
            <ThemedText type="default" style={[styles.diseaseSolution, { color: diseaseTextColor }]}>
              {desc}
            </ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
    marginHorizontal: 6,
  },
  section: {
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
  },
  diseaseCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  diseaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  diseaseSolution: {
    fontSize: 14,
    lineHeight: 20,
  },
});
