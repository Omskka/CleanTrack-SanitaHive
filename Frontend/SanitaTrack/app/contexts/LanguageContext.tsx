import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentLanguage, i18n } from '@/hooks/i18n';

type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  changeLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<string>(getCurrentLanguage());

  const changeLanguage = (newLang: string) => {
    i18n.locale = newLang;
    setLanguage(newLang);
  };

  useEffect(() => {
    setLanguage(getCurrentLanguage());
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
