import type { Metadata } from "next";
import MbtiPageIntlClient from "@/features/mbti/MbtiPageIntlClient";
import { alternatesForPath } from "@/i18n/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: alternatesForPath("/mbti", locale),
  };
}

export default async function LocalizedMbtiPage({ params }: Props) {
  const { locale } = await params;
  return <MbtiPageIntlClient locale={locale} />;
}
