
import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from './icons';
import { useLanguage } from '../context/LanguageContext';

const BackToHomeButton: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="mb-8">
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-100 transition-colors shadow-sm"
      >
        <HomeIcon className="w-5 h-5" />
        <span>{t('common.backToHome')}</span>
      </Link>
    </div>
  );
};

export default BackToHomeButton;