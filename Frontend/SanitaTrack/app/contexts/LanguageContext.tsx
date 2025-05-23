import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentLanguage, i18n } from '@/hooks/i18n';

// Define the shape of the language context
type LanguageContextType = {
  language: string; // Current language code (e.g., 'en', 'tr')
  changeLanguage: (lang: string) => void; // Function to change the language
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  changeLanguage: () => {},
});

// Provider component to wrap the app and provide language state
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // State to hold the current language
  const [language, setLanguage] = useState<string>(getCurrentLanguage());

  // Function to change the language both in i18n and state
  const changeLanguage = (newLang: string) => {
    i18n.locale = newLang; // Update i18n locale
    setLanguage(newLang);  // Update local state
  };

  useEffect(() => {
    // On mount, ensure the language state is in sync with i18n
    setLanguage(getCurrentLanguage());
  }, []);

  return (
    // Provide the language and changeLanguage function to children
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context in components
export const useLanguage = () => useContext(LanguageContext);