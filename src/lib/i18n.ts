import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from '../i18n/fr.json';
import en from '../i18n/en.json';
import ln from '../i18n/ln.json';
import sw from '../i18n/sw.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ln: { translation: ln },
      sw: { translation: sw },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'ln', 'sw'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'biblio-rdc-lang',
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
