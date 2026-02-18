import type { MetadataRoute } from "next";
import { GUIDES as MBTI_GUIDES } from "@/features/guides/data/mbti/guides";
import { locales, type Locale } from "@/i18n/config";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://www.moimrank.com";

type SitemapItemOptions = Pick<
  MetadataRoute.Sitemap[number],
  "changeFrequency" | "priority" | "lastModified"
>;

const STATIC_ROUTES: Array<{ path: string; options: Omit<SitemapItemOptions, "lastModified"> }> = [
  { path: "/", options: { changeFrequency: "daily", priority: 1.0 } },
  { path: "/mbti", options: { changeFrequency: "daily", priority: 0.95 } },
  { path: "/mbti/create", options: { changeFrequency: "weekly", priority: 0.8 } },
  { path: "/mbti-test", options: { changeFrequency: "weekly", priority: 0.8 } },
  { path: "/mbti-test/quick", options: { changeFrequency: "weekly", priority: 0.75 } },
  { path: "/mbti/cognitive-functions", options: { changeFrequency: "monthly", priority: 0.75 } },
  { path: "/faq/mbti", options: { changeFrequency: "monthly", priority: 0.7 } },
  { path: "/guides/mbti", options: { changeFrequency: "weekly", priority: 0.85 } },
  { path: "/guides/saju", options: { changeFrequency: "monthly", priority: 0.4 } },
  { path: "/privacy", options: { changeFrequency: "yearly", priority: 0.3 } },
  { path: "/terms", options: { changeFrequency: "yearly", priority: 0.3 } },
];

function url(path: string) {
  return `${SITE_URL}${path}`;
}

function localizePath(path: string, locale: Locale) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

function languageAlternates(path: string): Record<string, string> {
  const languages = locales.reduce((acc, locale) => {
    acc[locale] = url(localizePath(path, locale));
    return acc;
  }, {} as Record<string, string>);

  languages["x-default"] = url(localizePath(path, locales[0]));
  return languages;
}

function expandByLocale(path: string, options: SitemapItemOptions): MetadataRoute.Sitemap {
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

  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap((route) =>
    expandByLocale(route.path, { ...route.options, lastModified: now })
  );

  const mbtiGuideUrls: MetadataRoute.Sitemap = Array.from(
    new Set((MBTI_GUIDES ?? []).map((guide) => guide?.slug).filter(Boolean))
  )
    .flatMap((guide) =>
      expandByLocale(`/guides/mbti/${guide}`, {
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.65,
      })
    );

  return [...staticUrls, ...mbtiGuideUrls];
}
