import type { Metadata } from "next";
import { canonicalForPath, hreflangForPath } from "./seo";
import { defaultLocale, locales, type Locale } from "./config";

export function normalizeLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

export function alternatesForPath(path: string, locale: string | Locale = defaultLocale): Metadata["alternates"] {
  const activeLocale = typeof locale === "string" ? normalizeLocale(locale) : locale;
  const { languages } = hreflangForPath(path);

  return {
    canonical: canonicalForPath(path, activeLocale),
    languages,
  };
}
