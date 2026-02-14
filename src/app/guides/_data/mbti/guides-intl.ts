import type { Guide, GroupType } from "./types";
import { GUIDES } from "./guides";
import enGuides from "./guides.en.json";
import jaGuides from "./guides.ja.json";

export type GuidesLocale = "ko" | "en" | "ja";

const LOCALE_GUIDES: Record<Exclude<GuidesLocale, "ko">, Guide[]> = {
  en: enGuides as Guide[],
  ja: jaGuides as Guide[],
};

const norm = (s: string) => {
  try {
    return decodeURIComponent(s).trim().toLowerCase();
  } catch {
    return s.trim().toLowerCase();
  }
};

function pickGuides(locale: GuidesLocale): Guide[] {
  if (locale === "ko") return GUIDES;
  return LOCALE_GUIDES[locale] ?? GUIDES;
}

export function getGuideIntl(slug: string, locale: GuidesLocale): Guide | null {
  const key = norm(slug);
  const found = pickGuides(locale).find((g) => norm(g.slug) === key);
  if (found) return found;
  return GUIDES.find((g) => norm(g.slug) === key) ?? null;
}

export function listGuidesByGroupIntl(groupType: GroupType, locale: GuidesLocale): Guide[] {
  return pickGuides(locale).filter((g) => g.groupType === groupType);
}
