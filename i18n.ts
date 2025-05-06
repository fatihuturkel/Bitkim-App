import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import useUserStore from './zustand/userStore'; // Import the user store

// Import your language files
import en from './locales/en.json';
import tr from './locales/tr.json';
// Import other languages as needed

const i18n = new I18n({
  en,
  tr,
  // Add other languages here
});

// Get language from user store or fallback to device locale or default
const userLanguage = useUserStore.getState().preferences?.language;
const deviceLanguage = Localization.getLocales()[0]?.languageTag;

i18n.locale = userLanguage || deviceLanguage || 'en';

// When a value is missing from a language it'll fallback to another language with the key present.
i18n.enableFallback = true;
// Default fallback language
i18n.defaultLocale = 'en';

// Function to update i18n locale when user preference changes
export const updateUserLocale = () => {
  const newLocale = useUserStore.getState().preferences?.language || deviceLanguage || 'en';
  if (i18n.locale !== newLocale) {
    i18n.locale = newLocale;
  }
};

// Subscribe to store changes to update locale dynamically
useUserStore.subscribe((state, prevState) => {
  const newLanguage = state.preferences?.language;
  const prevLanguage = prevState.preferences?.language;
  
  if (newLanguage && newLanguage !== prevLanguage && i18n.locale !== newLanguage) {
    i18n.locale = newLanguage;
    // You might need to force a re-render of your components if they don't automatically update
  }
});

export default i18n;