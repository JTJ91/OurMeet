import { notFound } from "next/navigation";
import GuideLayout from "@/app/guides/_components/GuideLayout";
import GuideHero from "@/app/guides/_sections/GuideHero";
import GuideTOC from "@/app/guides/_sections/GuideTOC";
import GuideBlock from "@/app/guides/_sections/GuideBlock";
import RelatedGuides from "@/app/guides/_sections/RelatedGuides";
import { getGuideIntl } from "@/app/guides/_data/mbti/guides-intl";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/config";
import type { Guide } from "@/app/guides/_data/mbti/types";

export function generateStaticParams() {
  return [{ system: "mbti", slug: "__dummy__" }];
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
}) {
  const { locale, system, slug } = await params;
  const t = await getTranslations({ locale, namespace: "guides.notFound" });
  const activeLocale = parseLocale(locale);

  const guide = getGuideBySystem(system, slug, activeLocale);
  if (!guide) return { title: t("title") };

  const localePrefix = locale === "ko" ? "" : `/${locale}`;

  return {
    title: `${guide.title} | Moimrank`,
    description: guide.description,
    keywords: guide.keywords ?? [],
    openGraph: {
      title: `${guide.title} | Moimrank`,
      description: guide.description,
      type: "article",
      url: `https://www.moimrank.com${localePrefix}/guides/${system}/${guide.slug}`
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
