import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "./config";

const messageCache = new Map<Locale, Record<string, unknown>>();

async function loadMessages(locale: Locale) {
  const cached = messageCache.get(locale);
  if (cached) return cached;

  const messages = (await import(`../../messages/${locale}.json`)).default as Record<string, unknown>;
  messageCache.set(locale, messages);
  return messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = requested && hasLocale(locales, requested) ? requested : defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
