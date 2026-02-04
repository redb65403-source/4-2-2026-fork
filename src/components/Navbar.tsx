import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Globe } from 'lucide-react';
import logo from '../assets/logo.png';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className={`flex items-center ${language === 'ar' ? 'space-x-3 space-x-reverse' : 'space-x-3'} group shrink-0`}>
            <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
            <span className="text-xl font-bold text-gray-900 tracking-tight hidden lg:block">{t('logo_text')}</span>
          </Link>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 flex items-center whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700"
              aria-label="Toggle language"
            >
              <Globe className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'} shrink-0`} />
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
            
            <a
              href="https://ascww.org/" 
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 flex items-center text-center whitespace-nowrap ${
                isActive('/') 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <Home className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'} shrink-0`} />
             
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

