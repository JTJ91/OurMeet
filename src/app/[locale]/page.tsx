import HomePageIntlClient from "./HomePageIntlClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedHomePage({ params }: Props) {
  const { locale } = await params;
  return <HomePageIntlClient locale={locale} />;
}
