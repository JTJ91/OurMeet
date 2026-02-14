import type { MetadataRoute } from "next";
import { GUIDES as MBTI_GUIDES } from "@/app/guides/_data/mbti/guides";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://www.moimrank.com";

function url(path: string) {
  return `${SITE_URL}${path}`;
}

function localizePath(path: string, locale: Locale) {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

function languageAlternates(path: string): Record<string, string> {
  const languages = locales.reduce((acc, locale) => {
    acc[locale] = url(localizePath(path, locale));
    return acc;
  }, {} as Record<string, string>);

  languages["x-default"] = url(localizePath(path, defaultLocale));
  return languages;
}

function expandByLocale(
  path: string,
  options: Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority" | "lastModified">
): MetadataRoute.Sitemap {
  const alternates = languageAlternates(path);

  return locales.map((locale) => ({
    url: url(localizePath(path, locale)),
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: {
      languages: alternates,
    },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    ...expandByLocale("/", { lastModified: now, changeFrequency: "daily", priority: 1.0 }),
    ...expandByLocale("/mbti", { lastModified: now, changeFrequency: "daily", priority: 0.95 }),
    ...expandByLocale("/mbti-test", { lastModified: now, changeFrequency: "weekly", priority: 0.8 }),
    ...expandByLocale("/mbti/cognitive-functions", { lastModified: now, changeFrequency: "monthly", priority: 0.75 }),
    ...expandByLocale("/faq/mbti", { lastModified: now, changeFrequency: "monthly", priority: 0.7 }),
    ...expandByLocale("/guides/mbti", { lastModified: now, changeFrequency: "weekly", priority: 0.85 }),
    ...expandByLocale("/guides/saju", { lastModified: now, changeFrequency: "monthly", priority: 0.4 }),
    ...expandByLocale("/privacy", { lastModified: now, changeFrequency: "yearly", priority: 0.3 }),
    ...expandByLocale("/terms", { lastModified: now, changeFrequency: "yearly", priority: 0.3 }),
  ];

  const mbtiGuideUrls: MetadataRoute.Sitemap = (MBTI_GUIDES ?? [])
    .filter((guide) => Boolean(guide?.slug))
    .flatMap((guide) =>
      expandByLocale(`/guides/mbti/${guide.slug}`, {
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.65,
      })
    );

  return [...staticUrls, ...mbtiGuideUrls];
}
