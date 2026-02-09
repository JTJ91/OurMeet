import { notFound } from "next/navigation";
import GuideLayout from "../_components/GuideLayout";
import { getGuide } from "../_data/guides";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ✅ 여기 중요
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
  const { slug } = await params; // ✅ 여기 중요
  const guide = getGuide(slug);
  if (!guide) return notFound();

  return (
    <GuideLayout title={guide.title} description={guide.description}>
      {guide.component}
    </GuideLayout>
  );
}
