import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

// Import your language files
import en from './locales/en.json';
import tr from './locales/tr.json';
// Import other languages as needed

const i18n = new I18n({
  en,
  tr,
  // Add other languages here
});

// Set the locale once at the beginning of your app.
i18n.locale = Localization.getLocales()[0]?.languageTag || 'en';

// When a value is missing from a language it'll fallback to another language with the key present.
i18n.enableFallback = true;
// Default fallback language
i18n.defaultLocale = 'en';

export default i18n;