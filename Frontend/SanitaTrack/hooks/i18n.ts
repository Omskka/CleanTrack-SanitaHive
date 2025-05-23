import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { translations } from '../translations.js';

// Create an I18n instance with translation data
export const i18n = new I18n(translations);

// Set the initial locale based on device language
if (Localization.locale === 'tr') {
    i18n.locale = 'tr'; // Set to Turkish if device language is Turkish
} else {
    i18n.locale = 'en'; // Default to English if device language is not Turkish
};

// Helper function to get the current language code
export const getCurrentLanguage = () => {
    return i18n.locale;
};