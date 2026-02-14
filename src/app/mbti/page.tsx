import type { Metadata } from "next";
import MbtiPageClient from "./MbtiPageClient";
import { alternatesForPath } from "@/i18n/metadata";

export const metadata: Metadata = {
  alternates: alternatesForPath("/mbti"),
};

export default function MbtiPage() {
  return <MbtiPageClient />;
}
