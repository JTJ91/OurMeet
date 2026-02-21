import type { Locale } from "./config";

const LOCALE_PREFIX_RE = /^\/(ko|en|ja)(?=\/|$)/;

export function toLocalePath(locale: Locale, href: string): string {
  if (!href) return `/${locale}`;
  if (/^https?:\/\//.test(href)) return href;

  const match = href.match(/^([^?#]*)(.*)$/);
  const rawPath = match?.[1] ?? href;
  const suffix = match?.[2] ?? "";

  const withLeadingSlash = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const stripped = withLeadingSlash.replace(LOCALE_PREFIX_RE, "");
  const barePath = stripped || "/";
  const localizedPath = barePath === "/" ? `/${locale}` : `/${locale}${barePath}`;

  return `${localizedPath}${suffix}`;
}

