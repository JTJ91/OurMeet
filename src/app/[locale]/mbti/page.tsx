import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import MbtiPageIntlClient from "@/features/mbti/MbtiPageIntlClient";
import { alternatesForPath } from "@/i18n/metadata";
import { getScopedMessages } from "@/i18n/scoped-messages";

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
  const messages = await getScopedMessages(locale, [
    "mbti.page",
    "mbti.egoGraphCanvas",
    "components.bottomCta",
  ]);
  return (
    <NextIntlClientProvider messages={messages}>
      <MbtiPageIntlClient locale={locale} />
    </NextIntlClientProvider>
  );
}
