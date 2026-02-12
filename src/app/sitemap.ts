// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { prisma } from "@/app/lib/mbti/prisma";
import { GUIDES } from "@/app/guides/_data/mbti/guides";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://www.moimrank.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ✅ 1) 고정 페이지들 (원하는 것 전부 넣음)
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/guides`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ✅ 2) guides/[slug] 전부 추가 (GUIDES 참조)
  // - GUIDES가 TSX(ReactNode 포함)라도 "slug"만 쓰는건 보통 문제 없음
  // - 혹시 빌드에서 꼬이면 slug만 따로 분리 파일로 빼는 방식으로 바꾸면 됨
  const guideUrls: MetadataRoute.Sitemap = (GUIDES ?? [])
    .filter((g) => g?.slug)
    .map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  // ✅ 3) g/[groupId] 전부 추가 (DB에서)
  const groups = await prisma.group.findMany({
    select: { id: true },
    });

    const groupUrls: MetadataRoute.Sitemap = groups.map((g) => ({
    url: `${SITE_URL}/g/${g.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
    }));

  // ✅ 4) 합쳐서 반환
  return [...staticUrls, ...guideUrls, ...groupUrls];
}
