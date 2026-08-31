"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "@/lib/translations";

const LanguageContext = createContext({
  language: "mr",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.mr,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("mr");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mahaexam_lang");
      if (saved === "en" || saved === "mr") {
        setLanguageState(saved);
      }
    } catch {}
  }, []);

  function setLanguage(lang) {
    setLanguageState(lang);
    try {
      localStorage.setItem("mahaexam_lang", lang);
    } catch {}
  }

  function toggleLanguage() {
    const next = language === "mr" ? "en" : "mr";
    setLanguage(next);
  }

  const t = translations[language] || translations.mr;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
