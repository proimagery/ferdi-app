import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';
import ko from './locales/ko.json';
import it from './locales/it.json';
import ar from './locales/ar.json';

const LANGUAGE_KEY = '@ferdi_language';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  pt: { translation: pt },
  ja: { translation: ja },
  zh: { translation: zh },
  ko: { translation: ko },
  it: { translation: it },
  ar: { translation: ar },
};

export const LANGUAGES = [
  { code: 'en', flag: '\u{1F1FA}\u{1F1F8}', name: 'English' },
  { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', name: 'Espa\u00f1ol' },
  { code: 'fr', flag: '\u{1F1EB}\u{1F1F7}', name: 'Fran\u00e7ais' },
  { code: 'de', flag: '\u{1F1E9}\u{1F1EA}', name: 'Deutsch' },
  { code: 'pt', flag: '\u{1F1E7}\u{1F1F7}', name: 'Portugu\u00eas' },
  { code: 'ja', flag: '\u{1F1EF}\u{1F1F5}', name: '\u65E5\u672C\u8A9E' },
  { code: 'zh', flag: '\u{1F1E8}\u{1F1F3}', name: '\u4E2D\u6587' },
  { code: 'ko', flag: '\u{1F1F0}\u{1F1F7}', name: '\uD55C\uAD6D\uC5B4' },
  { code: 'it', flag: '\u{1F1EE}\u{1F1F9}', name: 'Italiano' },
  { code: 'ar', flag: '\u{1F1F8}\u{1F1E6}', name: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629' },
];

// Get device language, matching to our supported codes
const getDeviceLanguage = () => {
  try {
    const locales = getLocales();
    if (locales && locales.length > 0) {
      const deviceLang = locales[0].languageCode;
      if (resources[deviceLang]) return deviceLang;
    }
  } catch (e) {
    // Fall through to default
  }
  return 'en';
};

// Load saved language from AsyncStorage
const loadSavedLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved && resources[saved]) {
      await i18n.changeLanguage(saved);
    }
  } catch (e) {
    // Use default
  }
};

// Save language choice
export const saveLanguage = async (code) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
    await i18n.changeLanguage(code);
  } catch (e) {
    // Silently fail
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Load saved language preference on startup
loadSavedLanguage();

export default i18n;
