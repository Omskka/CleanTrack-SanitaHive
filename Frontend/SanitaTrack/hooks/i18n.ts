import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { translations } from '../translations.js';

export const i18n = new I18n(translations);
if (Localization.locale === 'tr') {
    i18n.locale = 'tr';
} else {
    i18n.locale = 'en';
};

export const getCurrentLanguage = () => {
    return i18n.locale;
};