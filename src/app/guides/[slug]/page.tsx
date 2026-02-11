import { notFound } from "next/navigation";
import GuideLayout from "../_components/GuideLayout";
import { getGuide } from "../_data/guides";

import GuideHero from "../_sections/GuideHero";
import GuideTOC from "../_sections/GuideTOC";
import GuideBlock from "../_sections/GuideBlock";
import RelatedGuides from "../_sections/RelatedGuides";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "가이드 | 모임랭크" };

  return {
    title: `${guide.title} | 모임랭크`,
    description: guide.description,
    keywords: guide.keywords ?? [],
    openGraph: {
      title: `${guide.title} | 모임랭크`,
      description: guide.description,
      type: "article",
      url: `https://www.moimrank.com/guides/${guide.slug}`,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return notFound();

  return (
    <GuideLayout
      title={guide.title}
      description={guide.description}
      hideHeader   // ✅ Layout의 제목/설명 카드 제거
      hideTopBack  // (선택) GuideHero가 상단 네비 담당하면 켜기
      hideCTA      // (선택) 하단 CTA를 GuideHero로 옮길 거면 켜기
    >
      <GuideHero guide={guide} />
      <GuideTOC sections={guide.sections} />
      <GuideBlock sections={guide.sections} />
      <RelatedGuides guide={guide} />
    </GuideLayout>
  );
}
