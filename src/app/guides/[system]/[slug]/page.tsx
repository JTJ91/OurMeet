import { notFound } from "next/navigation";
import GuideLayout from "../../_components/GuideLayout";

import GuideHero from "../../_sections/GuideHero";
import GuideTOC from "../../_sections/GuideTOC";
import GuideBlock from "../../_sections/GuideBlock";
import RelatedGuides from "../../_sections/RelatedGuides";

import { getGuide as getMbtiGuide } from "../../_data/mbti/guides";

/* =========================
   (선택) 정적 파라미터
   - mbti slug들을 미리 만들어두면 SEO/빌드 안정성↑
   - saju 추가 시 동일 패턴으로 확장
========================= */
export function generateStaticParams() {
  // MBTI만이라도 미리 생성하고 싶으면,
  // guides.ts에 export된 MBTI_GUIDES 같은 배열이 있다면 그걸 사용해도 됨.
  // 일단 system만 고정해도 도움이 되므로 최소 형태로 둠.
  return [{ system: "mbti", slug: "__dummy__" }];
}

/* =========================
   시스템 분기
========================= */
function getGuideBySystem(system: string, slug: string) {
  if (system === "mbti") return getMbtiGuide(slug);
  return null;
}

/* =========================
   SEO 메타데이터
========================= */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ system: string; slug: string }>;
}) {
  const { system, slug } = await params;

  const guide = getGuideBySystem(system, slug);
  if (!guide) return { title: "가이드 | 모임랭크" };

  return {
    title: `${guide.title} | 모임랭크`,
    description: guide.description,
    keywords: guide.keywords ?? [],
    openGraph: {
      title: `${guide.title} | 모임랭크`,
      description: guide.description,
      type: "article",
      url: `https://www.moimrank.com/guides/${system}/${guide.slug}`,
    },
  };
}

/* =========================
   상세 페이지
========================= */
export default async function GuidePage({
  params,
}: {
  params: Promise<{ system: string; slug: string }>;
}) {
  const { system, slug } = await params;

  const guide = getGuideBySystem(system, slug);
  if (!guide) return notFound();

  return (
    <GuideLayout
      title={guide.title}
      description={guide.description}
      hideHeader
      hideTopBack
      hideCTA
    >
      <GuideHero guide={guide} system={system} />
      <GuideTOC sections={guide.sections} />
      <GuideBlock sections={guide.sections} />
      <RelatedGuides guide={guide} system={system} />
    </GuideLayout>
  );
}
