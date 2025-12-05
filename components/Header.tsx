
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppContext, currencies } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import { UserRole } from '../types';
import { CartIcon, UserCircleIcon, LogOutIcon, ChevronDownIcon, SunIcon, MoonIcon } from './icons'; // Import SunIcon, MoonIcon

const Header: React.FC = () => {
  const { cartCount, currency, setCurrency, user, logout } = useAppContext();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme(); // Use theme context
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const languages = {
      en: 'English',
      es: 'Español',
      hi: 'हिन्दी',
      kn: 'ಕನ್ನಡ',
      te: 'తెలుగు',
      ta: 'தமிழ்',
      bn: 'বাংলা',
      mr: 'मराठी'
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 dark:bg-gray-800 dark:shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="text-3xl font-bold tracking-tight">
            <span className="text-gray-800 dark:text-gray-100">Harvest</span><span className="text-primary">Hub</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={({ isActive }) => `text-base font-medium ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-primary'} transition-colors`}>{t('header.home')}</NavLink>
            <NavLink to="/find-farms" className={({ isActive }) => `text-base font-medium ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-primary'} transition-colors`}>{t('header.findFarms')}</NavLink>
            <NavLink to="/about" className={({ isActive }) => `text-base font-medium ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-primary'} transition-colors`}>{t('header.about')}</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `text-base font-medium ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-primary'} transition-colors`}>{t('header.contact')}</NavLink>
            {user?.isOwner && (
                <NavLink to="/admin" className={({ isActive }) => `text-base font-medium ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-primary'} transition-colors`}>{t('header.admin')}</NavLink>
            )}
          </nav>

          <div className="flex items-center space-x-6">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('header.toggleTheme')}
              title={theme === 'light' ? t('header.darkMode') : t('header.lightMode')}
            >
              {theme === 'light' ? (
                <MoonIcon className="w-6 h-6" />
              ) : (
                <SunIcon className="w-6 h-6" />
              )}
            </button>

            <div className="relative">
                <button onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)} className="flex items-center text-gray-600 hover:text-primary transition-colors dark:text-gray-300">
                    <span>{currency}</span>
                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                </button>
                 {isCurrencyMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10">
                        {Object.entries(currencies).map(([code, { name }]) => (
                            <button key={code} onClick={() => { setCurrency(code); setIsCurrencyMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">
                                {code} - {name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

             <div className="relative">
                <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="flex items-center text-gray-600 hover:text-primary transition-colors dark:text-gray-300">
                    <span>{languages[language as keyof typeof languages]}</span>
                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                </button>
                 {isLangMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 max-h-60 overflow-y-auto">
                        {Object.entries(languages).map(([code, name]) => (
                            <button key={code} onClick={() => { setLanguage(code); setIsLangMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">
                                {name}
                            </button>
                        ))}
                    </div>
                )}
             </div>

            <Link to="/cart" className="relative text-gray-600 hover:text-primary transition-colors">
              <CartIcon className="h-8 w-8 text-primary-dark dark:text-primary" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Auth Section */}
            {user ? (
                <div className="relative">
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 text-gray-600 hover:text-primary dark:text-gray-300">
                    <UserCircleIcon className="w-8 h-8" />
                    <span className="hidden sm:inline font-medium">Hi, {user.fullName.split(' ')[0]}</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10">
                      {user.isOwner && (
                         <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">{t('header.admin')}</Link>
                      )}
                      {(user.role === UserRole.Buyer || user.role === UserRole.Farmer) && (
                         <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">{t('header.dashboard')}</Link>
                      )}
                      <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-600">
                        <LogOutIcon className="w-4 h-4" />
                        <span>{t('header.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
            ) : (
              <Link to="/auth" className="text-base font-medium text-gray-600 hover:text-primary transition-colors dark:text-gray-300">{t('header.login')}</Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;