import ListItem from '@/components/ListItem';
import AppleSection from '@/components/Section';
import { ThemedView } from '@/components/ThemedView';
import i18n from '@/i18n';
import { formatPhoneNumber } from '@/utils/formatters'; // Adjust path as needed
import useUserStore from '@/zustand/userStore';
import { router } from 'expo-router';
import { ScrollView } from 'react-native';

export default function Profile() {
  // Select each value individually to avoid infinite re-renders
  const firstName = useUserStore((state) => state.firstName);
  const lastName = useUserStore((state) => state.lastName);
  const email = useUserStore((state) => state.email);
  const phoneNumber = useUserStore((state) => state.phoneNumber);
  
  const formattedPhoneNumber = formatPhoneNumber(phoneNumber); // Use the imported function

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <AppleSection title={i18n.t('profile.profile_section_title')}>
          <ListItem
            label={i18n.t('profile.name')}
            value={`${firstName} ${lastName}`}
            onPress={() => router.push('/(app)/settings/profile/(editName)')}
            isLast={false}
          />
          <ListItem
            label={i18n.t('profile.email')}
            value={email}
            onPress={() => router.push('/(app)/settings/security/(changeEmail)')}
            isLast={false}
          />
          <ListItem
            label={i18n.t('profile.phone_number')}
            value={formattedPhoneNumber}
            onPress={() => router.push('/(app)/settings/profile/(editPhoneNumber)')}
            isLast={true}
          />
        </AppleSection>
      </ScrollView>
    </ThemedView>
  );
}