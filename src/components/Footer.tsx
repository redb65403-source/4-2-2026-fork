import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

export const Footer: React.FC = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 text-center">
        <p>{t('footer_text', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
};
