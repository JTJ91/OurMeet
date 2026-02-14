import MbtiPageIntlClient from "./MbtiPageIntlClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedMbtiPage({ params }: Props) {
  const { locale } = await params;
  return <MbtiPageIntlClient locale={locale} />;
}
