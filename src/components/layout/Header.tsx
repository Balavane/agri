import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HomeIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { LanguagePicker } from './LanguagePicker';
import { clsx } from 'clsx';

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('nav.home'), icon: HomeIcon },
    { to: '/catalogue', label: t('nav.catalog'), icon: BookOpenIcon },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 min-h-[44px]">
          <span className="text-2xl">🌱</span>
          <span className="font-bold text-green-700 text-base leading-tight hidden sm:block">
            {t('app.name')}
          </span>
          <span className="font-bold text-green-700 text-base sm:hidden">PhytoGuide</span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                location.pathname === to
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <LanguagePicker />
      </div>

      {/* Navigation mobile (bottom bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-bottom">
        <div className="flex">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center py-2 text-xs gap-1 min-h-[56px] transition-colors',
                location.pathname === to ? 'text-green-700' : 'text-gray-500'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
