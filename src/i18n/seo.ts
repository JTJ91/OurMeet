import { defaultLocale, locales, type Locale } from "./config";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://www.moimflow.com";

function absoluteUrl(path: string) {
  return `${SITE_URL}${path}`;
}

function localizePath(path: string, locale: Locale) {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function hreflangForPath(path: string) {
  const languages = locales.reduce((acc, locale) => {
    acc[locale] = absoluteUrl(localizePath(path, locale));
    return acc;
  }, {} as Record<string, string>);

  languages["x-default"] = absoluteUrl(localizePath(path, defaultLocale));

  return {
    canonical: absoluteUrl(localizePath(path, defaultLocale)),
    languages,
  };
}

export function canonicalForPath(path: string, locale: Locale) {
  return absoluteUrl(localizePath(path, locale));
}
