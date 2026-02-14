"use client";

import { usePathname } from "next/navigation";
import AppHeader from "@/app/components/AppHeader";
import Footer from "@/app/components/Footer";
import ClientOverlays from "@/app/components/ClientOverlays";

type Props = {
  children: React.ReactNode;
};

export default function RootChrome({ children }: Props) {
  const pathname = usePathname() || "/";
  const isPrefixedLocaleRoute = /^\/(ko|en|ja)(?=\/|$)/.test(pathname);
  const isDefaultLocaleManagedRoute =
    pathname === "/" ||
    /^\/(mbti(?:\/.*)?|mbti-test(?:\/.*)?|faq\/mbti(?:\/.*)?|guides(?:\/.*)?|privacy(?:\/.*)?|terms(?:\/.*)?)$/.test(pathname);
  const isLocalizedRoute = isPrefixedLocaleRoute || isDefaultLocaleManagedRoute;

  if (isLocalizedRoute) return <div className="flex-1">{children}</div>;

  return (
    <>
      <AppHeader />
      <div className="flex-1">{children}</div>
      <Footer />
      <ClientOverlays />
    </>
  );
}
