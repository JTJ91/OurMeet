import { notFound } from "next/navigation";
import type { Metadata } from "next";
import GuideLayout from "@/features/guides/components/GuideLayout";
import GuideHero from "@/features/guides/sections/GuideHero";
import GuideTOC from "@/features/guides/sections/GuideTOC";
import GuideBlock from "@/features/guides/sections/GuideBlock";
import RelatedGuides from "@/features/guides/sections/RelatedGuides";
import { getGuideIntl } from "@/features/guides/data/mbti/guides-intl";
import { GUIDES as MBTI_GUIDES } from "@/features/guides/data/mbti/guides";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/config";
import type { Guide } from "@/features/guides/data/mbti/types";
import { alternatesForPath } from "@/i18n/metadata";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    (MBTI_GUIDES ?? [])
      .filter((guide) => Boolean(guide?.slug))
      .map((guide) => ({ locale, system: "mbti", slug: guide.slug }))
  );
}

function parseLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : "ko";
}

function getGuideBySystem(system: string, slug: string, locale: Locale) {
  if (system === "mbti") return getGuideIntl(slug, locale);
  return null;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; system: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, system, slug } = await params;
  const t = await getTranslations({ locale, namespace: "guides.notFound" });
  const activeLocale = parseLocale(locale);
  const path = `/guides/${system}/${slug}`;

  const guide = getGuideBySystem(system, slug, activeLocale);
  if (!guide) {
    return {
      title: t("title"),
      alternates: alternatesForPath(path, locale),
    };
  }

  const localePrefix = locale === "ko" ? "" : `/${locale}`;

  return {
    title: `${guide.title} | moimflow`,
    description: guide.description,
    keywords: guide.keywords ?? [],
    alternates: alternatesForPath(path, locale),
    openGraph: {
      title: `${guide.title} | moimflow`,
      description: guide.description,
      type: "article",
      url: `https://www.moimflow.com${localePrefix}/guides/${system}/${guide.slug}`
    }
  };
}

export default async function LocalizedGuidePage({
  params
}: {
  params: Promise<{ locale: string; system: string; slug: string }>;
}) {
  const { locale, system, slug } = await params;
  const activeLocale = parseLocale(locale);

  const guide = getGuideBySystem(system, slug, activeLocale);
  if (!guide) return notFound();
  const relatedGuides: Guide[] =
    guide.related
      ?.map((s) => getGuideBySystem(system, s, activeLocale))
      .filter((g): g is Guide => Boolean(g)) ?? [];

  return (
    <GuideLayout title={guide.title} description={guide.description} hideHeader hideTopBack hideCTA>
      <GuideHero guide={guide} system={system} locale={activeLocale} />
      <GuideTOC sections={guide.sections} locale={activeLocale} />
      <GuideBlock sections={guide.sections} locale={activeLocale} />
      <RelatedGuides guide={guide} system={system} locale={activeLocale} relatedGuides={relatedGuides} />
    </GuideLayout>
  );
}
