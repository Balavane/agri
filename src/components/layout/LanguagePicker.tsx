import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { useLanguages } from '../../hooks/useDocuments';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export function LanguagePicker() {
  const { t } = useTranslation();
  const { currentLang, setLanguage } = useLanguageStore();
  const { data: languages } = useLanguages();
  const [open, setOpen] = useState(false);

  // Langues par defaut si Supabase non configure
  const langs = languages?.length
    ? languages
    : [
        { code: 'fr', nom: 'Francais' },
        { code: 'en', nom: 'English' },
        { code: 'ln', nom: 'Lingala' },
        { code: 'sw', nom: 'Kiswahili' },
      ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors min-h-[44px]"
        aria-label={t('language.select')}
      >
        <GlobeAltIcon className="h-5 w-5" />
        <span className="text-sm font-semibold uppercase">{currentLang}</span>
      </button>

      {open && (
        <>
          {/* Overlay pour fermer */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 min-w-[160px] overflow-hidden">
            {langs.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-green-50 transition-colors ${
                  currentLang === lang.code ? 'bg-green-50 font-bold text-green-700' : 'text-gray-700'
                }`}
              >
                {lang.nom}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
