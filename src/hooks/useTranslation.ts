import { useLanguage } from '../context/LanguageContext';
import { translations, TranslationKey } from '../translations/i18n';

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: TranslationKey, variables?: Record<string, string | number>): string => {
    const text = translations[language][key] || translations.ar[key] || key;
    
    if (variables) {
      return Object.entries(variables).reduce((acc, [key, value]) => {
        return acc.replace(`{${key}}`, String(value));
      }, text);
    }
    
    return text;
  };

  return { t, language };
};
