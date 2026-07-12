import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAutoTranslateContext } from './AutoTranslateProvider';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ja', name: 'Japanese' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'zh', name: 'Chinese' },
  { code: 'pt', name: 'Portuguese' },
];

const rtlLanguages = new Set(['ar', 'ur']);
const normalizeLanguage = (lng) => (lng ? lng.split('-')[0] : 'en');

const updateDocumentLanguage = (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = rtlLanguages.has(lng) ? 'rtl' : 'ltr';
};

// Sync localStorage + html element whenever i18n language changes
function syncLanguage(lng) {
  localStorage.setItem('i18nextLng', lng);
  updateDocumentLanguage(lng);
}

export default function GlobalLanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef(null);
  const { i18n } = useTranslation();
  const { isTranslating } = useAutoTranslateContext();

  // Derive the selected language from i18n (this updates on re-render after changeLanguage)
  const selectedLang = normalizeLanguage(i18n.language || localStorage.getItem('i18nextLng') || 'en');
  const currentLanguage = languages.find((lang) => lang.code === selectedLang) || languages[0];

  // On mount: restore saved language preference without extra re-triggers
  useEffect(() => {
    const saved = normalizeLanguage(localStorage.getItem('i18nextLng') || 'en');
    const active = normalizeLanguage(i18n.language || 'en');
    if (saved !== active) {
      i18n.changeLanguage(saved).then(() => syncLanguage(saved));
    } else {
      syncLanguage(active);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep html lang/dir in sync whenever i18n.language changes (handles external changes too)
  useEffect(() => {
    const lang = normalizeLanguage(i18n.language || 'en');
    updateDocumentLanguage(lang);
  }, [i18n.language]);

  const changeLanguage = useCallback(async (lng) => {
    const normalized = normalizeLanguage(lng);
    if (normalized === selectedLang) {
      setIsOpen(false);
      return;
    }
    await i18n.changeLanguage(normalized);
    syncLanguage(normalized);
    setIsOpen(false);
  }, [i18n, selectedLang]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectorRef} className="fixed bottom-6 right-6 z-[10000] inline-block text-left notranslate" translate="no">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/90 px-3 py-2 text-xs font-medium text-white shadow-sm backdrop-blur transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Language: ${currentLanguage.name}`}
      >
        <span>{currentLanguage.code.toUpperCase()}</span>
        <span className="text-slate-400">{currentLanguage.name}</span>
        {isTranslating && (
          <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-purple-300">
            <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-purple-400" />
            translating...
          </span>
        )}
        <svg className="h-3.5 w-3.5 text-slate-300" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 bottom-full mb-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur z-[10001]"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={selectedLang === lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                selectedLang === lang.code
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <span className="block truncate font-medium">{lang.name}</span>
              <span className="text-[11px] uppercase opacity-60 ml-2">{lang.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
