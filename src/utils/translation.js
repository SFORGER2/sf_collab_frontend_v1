import en from "../translations/en.json";
import ar from "../translations/ar.json";
import es from "../translations/es.json";

const translations = {
  en,
  ar,
  es,
};

export const translate = (language, key) => {
  return (
    translations[language]?.[key] ||
    translations.en?.[key] ||
    key
  );
};  