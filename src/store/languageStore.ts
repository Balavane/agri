import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../lib/i18n';

interface LanguageState {
  currentLang: string;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      currentLang: 'fr',
      setLanguage: (lang: string) => {
        i18n.changeLanguage(lang);
        set({ currentLang: lang });
      },
    }),
    {
      name: 'biblio-rdc-lang',
    }
  )
);
