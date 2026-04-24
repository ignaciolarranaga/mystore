import { type Locale, useLocales } from "expo-localization";
import React, {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";

export type Language = "en" | "es";
export type TranslationTable = Partial<
  Record<Language, Record<string, string>>
>;
export type Translate = (
  source: string,
  params?: Record<string, string | number>,
) => string;

export const DEFAULT_LANGUAGE: Language = "en";

const I18nContext = createContext<Language>(DEFAULT_LANGUAGE);

export function I18nProvider({ children }: PropsWithChildren) {
  const language = useResolvedAppLanguage();

  return (
    <I18nContext.Provider value={language}>{children}</I18nContext.Provider>
  );
}

export function useAppLanguage(): Language {
  return useContext(I18nContext);
}

export function useTranslate(translations: TranslationTable): Translate {
  const language = useAppLanguage();

  return useMemo(
    () => buildTranslateFunction(translations, language),
    [language, translations],
  );
}

export function resolveLanguage(locales: Locale[]): Language {
  const preferred = locales[0];
  const code = preferred?.languageCode?.toLowerCase();
  const tag = preferred?.languageTag.toLowerCase();

  return code === "es" || tag === "es" || tag?.startsWith("es-")
    ? "es"
    : DEFAULT_LANGUAGE;
}

export function buildTranslateFunction(
  translations: TranslationTable,
  language: Language,
): Translate {
  return (source, params = {}) => {
    const translated = translations[language]?.[source] ?? source;
    return interpolate(translated, params);
  };
}

export function localeTagForLanguage(language: Language): string {
  return language === "es" ? "es" : "en";
}

function useResolvedAppLanguage(): Language {
  return resolveLanguage(useLocales());
}

function interpolate(
  source: string,
  params: Record<string, string | number>,
): string {
  let message = source;

  for (const [name, value] of Object.entries(params)) {
    message = message.replaceAll(`{${name}}`, String(value));
  }

  return message;
}
