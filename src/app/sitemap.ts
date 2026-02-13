import type { MetadataRoute } from "next";
import { GUIDES as MBTI_GUIDES } from "@/app/guides/_data/mbti/guides";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://www.moimrank.com";

function url(path: string) {
  return `${SITE_URL}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: url("/mbti"), lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: url("/mbti-test"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: url("/mbti/cognitive-functions"), lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: url("/faq/mbti"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: url("/guides/mbti"), lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: url("/guides/saju"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: url("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: url("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const mbtiGuideUrls: MetadataRoute.Sitemap = (MBTI_GUIDES ?? [])
    .filter((guide) => Boolean(guide?.slug))
    .map((guide) => ({
      url: url(`/guides/mbti/${guide.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));

  return [...staticUrls, ...mbtiGuideUrls];
}
