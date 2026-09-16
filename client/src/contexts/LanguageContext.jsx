// client/src/contexts/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../translations/en';
import { kn } from '../translations/kn';
import { speechController } from '../utils/speech';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('medikiosk_lang') || 'en';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    localStorage.setItem('medikiosk_lang', lang);
  }, [lang]);

  const dictionary = lang === 'kn' ? kn : en;

  const t = (key) => {
    return dictionary[key] || en[key] || key;
  };

  const speak = (text) => {
    if (!text) return;
    setIsSpeaking(true);
    speechController.speak(text, lang, () => {
      setIsSpeaking(false);
    });
  };

  const stopSpeaking = () => {
    speechController.stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang,
      t,
      speak,
      stopSpeaking,
      isSpeaking,
      isKannada: lang === 'kn'
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
