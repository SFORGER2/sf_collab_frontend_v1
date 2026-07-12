import React, { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useAutoTranslate } from '@/utils/useAutoTranslate';

const AutoTranslateContext = createContext({
  isTranslating: false,
  currentLanguage: 'en',
});

export function AutoTranslateProvider({ children }) {
  const location = useLocation();
  const value = useAutoTranslate(location);
  return (
    <AutoTranslateContext.Provider value={value}>
      {children}
    </AutoTranslateContext.Provider>
  );
}

export function useAutoTranslateContext() {
  return useContext(AutoTranslateContext);
}
