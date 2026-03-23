import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  t,
  tWithFallback,
  setLanguage,
  getLanguage,
  getSupportedLanguages,
  getLanguageOptions,
  useTranslations,
  getTranslationSection,
  SupportedLanguage,
  TranslationKeys,
} from '../i18n';

const LANGUAGE_STORAGE_KEY = '@app_language';

/**
 * React hook for internationalization
 * Provides reactive language switching and translation functions
 */
export function useI18n() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(getLanguage());
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLang && getSupportedLanguages().includes(savedLang as SupportedLanguage)) {
        setLanguage(savedLang as SupportedLanguage);
        setCurrentLang(savedLang as SupportedLanguage);
      }
    } catch (error) {
      console.warn('Failed to load saved language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
    try {
      setLanguage(lang);
      setCurrentLang(lang);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.warn('Failed to save language:', error);
    }
  }, []);

  const translate = useCallback(
    (keyPath: string, params?: Record<string, string | number>) => {
      return t(keyPath, params);
    },
    [currentLang],
  );

  const translateWithFallback = useCallback(
    (
      keyPath: string,
      params?: Record<string, string | number>,
      fallbackLang?: SupportedLanguage,
    ) => {
      return tWithFallback(keyPath, params, fallbackLang);
    },
    [currentLang],
  );

  const getSection = useCallback(
    <T = Record<string, string>>(section: string): T => {
      return getTranslationSection<T>(section);
    },
    [currentLang],
  );

  const translations = useTranslations();

  return {
    // Current state
    language: currentLang,
    isLoading,
    translations,

    // Functions
    t: translate,
    tWithFallback: translateWithFallback,
    changeLanguage,
    getSection,

    // Utilities
    supportedLanguages: getSupportedLanguages(),
    languageOptions: getLanguageOptions(),
  };
}

/**
 * Simple hook that just returns translation function
 * Use this when you don't need language switching UI
 */
export function useTranslation() {
  const [, setRefresh] = useState(0);

  // Force re-render when language changes
  const forceUpdate = useCallback(() => {
    setRefresh((prev) => prev + 1);
  }, []);

  return {
    t,
    tWithFallback,
    language: getLanguage(),
    translations: useTranslations(),
  };
}

export type { SupportedLanguage, TranslationKeys };
