import CustomModal from '@/components/CustomModal';
import ListItem from '@/components/ListItem';
import ListSwitch from '@/components/ListSwitch';
import AppleSection from '@/components/Section';
import { ThemedView } from '@/components/ThemedView';
import useUserStore from '@/zustand/userStore'; // Import the hook
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

// Define language options with labels and codes
const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Türkçe', value: 'tr' },
  { label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
  { label: 'Deutsch', value: 'de' },
  { label: '日本語', value: 'ja' },
  { label: '中文', value: 'zh' },
  { label: 'Русский', value: 'ru' },
  { label: 'Italiano', value: 'it' },
  { label: 'Português', value: 'pt' },
  { label: '한국어', value: 'ko' },
];

export default function Preferences() {
  // Use optional chaining for safer access
  const userLanguagePreference = useUserStore((state) => state.preferences?.language); // Get the user's language preference from Zustand store
  // Get the update function from the store
  const updatePreferences = useUserStore((state) => state.updatePreferences);

  // Example state and function for the switch (replace with actual state management)
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  // Language picker state - store the language code
  // Initialize with store value or default to 'en'
  const [selectedLanguageCode, setSelectedLanguageCode] = useState(userLanguagePreference || 'en');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Find the display label for the selected language code
  const selectedLanguageLabel = languageOptions.find(lang => lang.value === selectedLanguageCode)?.label || 'English';

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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

        <AppleSection title="Language">
          <ListItem
            label="App Language"
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
        title="Select Language"
        options={languageOptions} // Pass the array of objects
        selectedOption={selectedLanguageCode} // Pass the code
        onSelect={(value) => { // Receive the code
          setSelectedLanguageCode(value);
          updatePreferences({ language: value }); // Update the Zustand store
          setShowLanguageModal(false); // Close modal after selection
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
