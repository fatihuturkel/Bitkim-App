import CustomModal from '@/components/CustomModal';
import ListItem from '@/components/ListItem';
import AppleSection from '@/components/Section';
import { ThemedView } from '@/components/ThemedView';
import i18n from '@/i18n';
import { updateUserPreferences } from '@/services/userDataService';
import useUserStore from '@/zustand/userStore'; // Import the hook
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

// Define language options with labels and codes
const languageOptions = [
  { label: 'Türkçe', value: 'tr' },
  { label: 'English', value: 'en' },
  /*{ label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
  { label: 'Deutsch', value: 'de' },
  { label: '日本語', value: 'ja' },
  { label: '中文', value: 'zh' },
  { label: 'Русский', value: 'ru' },
  { label: 'Italiano', value: 'it' },
  { label: 'Português', value: 'pt' },
  { label: '한국어', value: 'ko' },*/
];

export default function Preferences() {
  // Use optional chaining for safer access
  const userLanguagePreference = useUserStore((state) => state.preferences?.language); // Get the user's language preference from Zustand store

  // Example state and function for the switch (replace with actual state management)
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  // Language picker state - store the language code
  // Initialize with store value or default to 'en'
  const [selectedLanguageCode, setSelectedLanguageCode] = useState(userLanguagePreference || 'en');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Find the display label for the selected language code
  const selectedLanguageLabel = languageOptions.find(lang => lang.value === selectedLanguageCode)?.label || 'English';

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await updateUserPreferences({ language: languageCode });
      // The local store is already updated in the function if Firebase update succeeds
      setShowLanguageModal(false);
    } catch (error) {
      // Handle error (show error message to user)
      console.error("Failed to update language preference:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 
        <AppleSection title="Display">
          <ListSwitch
            label="Example Switch"
            value={isEnabled}
            onValueChange={toggleSwitch}
            disabled={false}
          />
          <ListSwitch
            label="Another Switch"
            value={isEnabled}
            onValueChange={toggleSwitch}
            disabled={false}
            isLast={true}
          />
        </AppleSection> 
        */}

        <AppleSection title={i18n.t("preference.language")}>
          <ListItem
            label={i18n.t("preference.app_language")}
            value={selectedLanguageLabel} // Display the label
            disabled={false}
            isLast={true}
            onPress={() => setShowLanguageModal(true)}
          />
        </AppleSection>
      </ScrollView>

      {/* Assuming CustomModal can handle options as {label: string, value: string}[] */}
      {/* and returns the selected value ('en', 'es', etc.) via onSelect */}
      <CustomModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title={i18n.t("preference.select_language")}
        options={languageOptions} // Pass the array of objects
        selectedOption={selectedLanguageCode} // Pass the code
        onSelect={(value) => { // Receive the code
          setSelectedLanguageCode(value);
          handleLanguageChange(value); // Update the Firebase store
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
});
