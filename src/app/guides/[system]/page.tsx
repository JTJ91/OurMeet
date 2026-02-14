import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MbtiGuidesPage from "../_systems/mbti/GuidesPage";
import { alternatesForPath } from "@/i18n/metadata";
// import SajuGuidesPage from "../_systems/saju/GuidesPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ system: string }>;
}): Promise<Metadata> {
  const { system } = await params;
  return {
    alternates: alternatesForPath(`/guides/${system}`),
  };
}

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ system: string }>;
}) {
  const { system } = await params;

  if (system === "mbti") {
    return <MbtiGuidesPage />;
  }

  if (system === "saju") {
    // return <SajuGuidesPage />;
    return <div>사주 가이드 준비중</div>;
  }

  return notFound();
}
